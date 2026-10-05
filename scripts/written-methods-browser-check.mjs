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
const base=(process.env.SITE_ORIGIN || 'http://localhost:8000')+'/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/';
const names=process.argv.slice(2); if(!names.length)names.push('placeValue','orderingNumbers','inequalitySymbols','powersOfTen','columnAddition','columnSubtraction','exchangingAcrossZeros','longMultiplication','multiplyingDecimals','shortDivision','interpretingRemainders','longDivision','dividingByDecimals','usingAGivenCalculation');
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]},s);
for(const name of names){
 await send('Page.navigate',{url:base+name+'.html'},s);await sleep(1000);
 const questions=await evaluate('WrittenMethodsLessonBank.buildRound()');
 const stages=await evaluate('[...document.querySelectorAll("[data-lesson-check]")].map(x=>Number(x.dataset.lessonCheck))');
 await evaluate('document.querySelector(".lesson-flowbar__toggle").click()');await sleep(100);
 assert(await evaluate('document.querySelectorAll(".lesson-check__turn:not([hidden])").length')===questions.length,'Show all '+name);
 await evaluate('document.querySelector(".lesson-flowbar__toggle").click()');
 for(const stage of stages){
  for(let i=0;i<2;i++){
   const q=questions.filter(q=>q.stage===stage)[i];
   if(typeof q.expected === 'string') {
    await evaluate('document.querySelectorAll(\'[data-lesson-check="'+stage+'"] .lesson-check__turn\')['+i+'].querySelector(\'[data-symbol="'+q.expected+'"]\').focus()');
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32},s);
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32},s);
   } else {
    await evaluate('document.querySelectorAll(\'[data-lesson-check="'+stage+'"] input\')['+i+'].focus()');
    await send('Input.insertText',{text:String(q.expected)},s);
   }
   await sleep(330);
   assert(await evaluate('document.querySelectorAll(\'[data-lesson-check="'+stage+'"] .is-correct\').length')===i+1,'Answer '+name+' '+stage+':'+i);
  }
  await evaluate('document.querySelector(\'[data-lesson-check="'+stage+'"]\').closest("section").querySelector(".roots-continue")?.click()');await sleep(100);
 }
 assert(await evaluate('document.querySelectorAll("main > section[hidden]").length')===0,'Ending '+name);
 await send('Page.reload',{},s);await sleep(1000);
 assert(await evaluate('document.querySelectorAll(".lesson-check .roots-accepted-answer").length')===questions.length,'Restore '+name);
 assert(await evaluate('document.querySelectorAll(".roots-revealed").length')===0,'Reload animation '+name);
 await evaluate('document.querySelector("main").scrollIntoView()'); await sleep(300);
 writeFileSync('/tmp/written-'+name+'.png',Buffer.from((await send('Page.captureScreenshot',{},s)).data,'base64'));
 const rec=await evaluate('WrittenMethodsRecallBank.build("'+name+'")');
 for(let i=0;i<rec.length;i++){
  if(rec[i].type==='choice'){
   await evaluate('document.querySelector(\'#recall-answer-'+i+' input[value="'+rec[i].expected+'"]\').focus()');
   await send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32},s);await send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32},s);
  }else{await evaluate('document.querySelector("#recall-answer-'+i+'").focus()');await send('Input.insertText',{text:String(rec[i].expected)},s);}
  await sleep(420);
 }
 assert(await evaluate('document.querySelectorAll(".powers-recall .roots-accepted-answer").length')===4,'Recall '+name);
 console.log(name+' passed native typing, reveal, restoration, fixed recall and radio keyboard');
}
await send('Page.navigate',{url:base},s);await sleep(1000);
console.log('Menu',await evaluate('document.querySelector("[data-progress-summary]").textContent'));
writeFileSync('/tmp/written-menu.png',Buffer.from((await send('Page.captureScreenshot',{},s)).data,'base64'));
await send('Page.navigate',{url:base+'longDivision.html'},s);await sleep(1000);
await evaluate('document.querySelector(".lesson-flowbar__toggle").click()');
for (const [attr,value] of [['data-dividend-input','0'],['data-divisor-input','24']]) {
 await evaluate('document.querySelector("['+attr+']").focus();document.querySelector("['+attr+']").select()');
 await send('Input.insertText',{text:value},s);await sleep(150);
}
assert(await evaluate('document.querySelector("[data-dividend-input]").closest(".long-scene").innerText.includes("0 ÷ 24 = 0")'),'Zero is a valid dividend');
await send('Page.navigate',{url:base+'shortDivision.html'},s);await sleep(1000);
await send('Emulation.setDeviceMetricsOverride',{width:1280,height:650,deviceScaleFactor:1,mobile:false},s);await sleep(250);
assert(await evaluate('(()=>{const r=document.querySelector(".roots-reset").getBoundingClientRect();return r.top>=70&&r.bottom<=innerHeight&&r.left>=0&&r.right<=272})()'),'Controls remain visible in a short desktop rail');
assert(await evaluate('getComputedStyle(document.querySelector(".page-nav")).flexWrap==="nowrap"'),'Contents must not wrap into another column');
await send('Emulation.setDeviceMetricsOverride',{width:1000,height:800,deviceScaleFactor:1,mobile:false},s);await sleep(250);
assert(await evaluate('document.querySelector(".roots-reset").closest(".lesson-flowbar")!==null'),'Controls relocate on a narrow desktop');
console.log('Short and narrow desktop navigation passed');
chrome.kill();ws.close();
