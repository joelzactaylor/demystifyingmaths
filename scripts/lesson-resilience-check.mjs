// Native Chrome regression test; optional arguments are lesson basenames.
import {spawn} from 'node:child_process';
import {mkdtempSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const dir=mkdtempSync(tmpdir()+'/roots-spacing-');
const chrome=spawn(process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--no-first-run','--remote-debugging-port=0','--user-data-dir='+dir,'about:blank'],{stdio:'ignore'});
process.on('exit',()=>chrome.kill());
while(!existsSync(dir+'/DevToolsActivePort'))await sleep(100);
const [port,path]=readFileSync(dir+'/DevToolsActivePort','utf8').trim().split('\n');
const ws=new WebSocket('ws://localhost:'+port+path);await new Promise(r=>ws.onopen=r);
let id=0;const pending=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m.result);pending.delete(m.id);}};
const send=(method,params={},sessionId)=>new Promise(r=>{pending.set(++id,r);ws.send(JSON.stringify({id,method,params,sessionId}));});
const {targetId}=await send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await send('Target.attachToTarget',{targetId,flatten:true});
await send('Page.enable',{},s);
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false},s);
const evaluate=async expression=>(await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},s)).result.value;

const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
const base=(process.env.SITE_ORIGIN || 'http://localhost:8000')+'/demystifyingmaths/pages/curriculum/GCSE/number/structure/';
const pages={powersAndRoots:['indexNotation','recognisingPowers','squareRoots','positiveAndNegativeRoots','cubeAndHigherRoots'],writtenMethods:['placeValue','orderingNumbers','inequalitySymbols','powersOfTen','columnAddition','columnSubtraction','exchangingAcrossZeros','longMultiplication','multiplyingDecimals','shortDivision','interpretingRemainders','longDivision','dividingByDecimals','usingAGivenCalculation']};
const go=async url=>{await send('Page.navigate',{url},s);await sleep(600)};
const errors=[];await send('Runtime.enable',{},s);
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text)});
for(const mode of ['blocked','corrupt']){
 const source=mode==='blocked'?'for(const name of ["getItem","setItem","removeItem"])Storage.prototype[name]=()=>{throw new DOMException("Blocked","SecurityError")};':'Storage.prototype.getItem=()=>"{bad json";';
 const {identifier}=await send('Page.addScriptToEvaluateOnNewDocument',{source},s);
 for(const [folder,names] of Object.entries(pages))for(const name of names){
  await go(base+folder+'/'+name+'.html');
  await evaluate('document.querySelector(".lesson-flowbar__toggle").click()');
  const result=await evaluate(`(()=>{const api=window[document.querySelector("[data-lesson-check-api]").dataset.lessonCheckApi],q=api.buildRound().find(x=>typeof x.expected==="number"),x=document.querySelector('[data-lesson-check="'+q.stage+'"] input');x.value=String(q.expected);x.dispatchEvent(new Event("input",{bubbles:true}));return q.expected})()`);
  await sleep(350);
  assert(await evaluate('document.querySelectorAll(".lesson-check .roots-accepted-answer").length')===1,name+': cannot answer with '+mode+' storage');
  assert(!errors.length,name+': '+errors.join('\n'));
 }
 await send('Page.removeScriptToEvaluateOnNewDocument',{identifier},s);
 console.log('All 19 lessons remain usable with '+mode+' storage');
}
await send('Emulation.setScriptExecutionDisabled',{value:true},s);
for(const [folder,names] of Object.entries(pages))for(const name of names){
 await go(base+folder+'/'+name+'.html');
 assert(await evaluate('document.querySelectorAll("main > section[hidden]").length')===0,name+': no-JS lesson hidden');
 assert(await evaluate('document.querySelector("main").innerText.length')>500,name+': no-JS missing explanation');
}
await send('Emulation.setScriptExecutionDisabled',{value:false},s);
console.log('All 19 lessons retain readable explanations without JavaScript');
await send('Emulation.setDeviceMetricsOverride',{width:1280,height:650,deviceScaleFactor:1,mobile:false},s);
for(const [folder,names] of Object.entries(pages))for(const name of names){
 await go(base+folder+'/'+name+'.html');
 const rect=await evaluate('(()=>{const r=document.querySelector(".roots-reset").getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right}})()');
 assert(rect.top>=70 && rect.bottom<=650 && rect.left>=0 && rect.right<=272,name+': reset outside short desktop rail '+JSON.stringify(rect));
}
console.log('All 19 lesson menu controls remain visible on a short desktop');
for(const [width,height] of [[1440,1000],[1000,800]]){
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false},s);
 for(const folder of ['powersAndRoots','writtenMethods','']){
  await go(base+folder+'/');
  const geometry=await evaluate('({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(x=>!x.complete||!x.naturalWidth).map(x=>x.src),cards:document.querySelectorAll(".topic-card").length})');
  assert(!geometry.overflow&&!geometry.broken.length&&geometry.cards>0,'Menu '+folder+': '+JSON.stringify(geometry));
  const before=await evaluate('getComputedStyle(document.querySelector(".topic-card h3"),"::after").transform');
  const point=await evaluate('(()=>{const x=document.querySelector(".topic-card");x.scrollIntoView({block:"center"});const r=x.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()');
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point},s);await sleep(200);
  assert(await evaluate('getComputedStyle(document.querySelector(".topic-card h3"),"::after").transform')===before,'Menu arrow moves on hover '+folder);
  writeFileSync('/tmp/audit-menu-'+(folder||'structure')+'-'+width+'.png',Buffer.from((await send('Page.captureScreenshot',{},s)).data,'base64'));
 }
}
console.log('Three menus: images, overflow and stable hover arrows passed at wide and narrow desktop sizes');
chrome.kill();ws.close();
