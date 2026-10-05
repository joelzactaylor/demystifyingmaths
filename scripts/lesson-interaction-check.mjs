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
const evaluate=async expression=>{
 const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},s);
 if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
 return r.result.value;
};

const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
const roots=['indexNotation','recognisingPowers','squareRoots','positiveAndNegativeRoots','cubeAndHigherRoots'];
const written=['placeValue','orderingNumbers','inequalitySymbols','powersOfTen','columnAddition','columnSubtraction','exchangingAcrossZeros','longMultiplication','multiplyingDecimals','shortDivision','interpretingRemainders','longDivision','dividingByDecimals','usingAGivenCalculation'];
const names=process.argv.slice(2).length?process.argv.slice(2):[...roots,...written];
const base=(process.env.SITE_ORIGIN || 'http://localhost:8000')+'/demystifyingmaths/pages/curriculum/GCSE/number/structure/';
const errors=[];
await send('Runtime.enable',{},s);
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Page.javascriptDialogOpening')send('Page.handleJavaScriptDialog',{accept:true},s)});
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text)});
const go=async url=>{await send('Page.navigate',{url},s);await sleep(700)};
const reload=async()=>{await send('Page.reload',{},s);await sleep(700)};
const type=async(selector,value)=>{
 await evaluate(`(()=>{const input=document.querySelector(${JSON.stringify(selector)});input.focus();input.select()})()`);
 if(value)await send('Input.insertText',{text:String(value)},s);
 else {await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8},s);await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8},s)}
};
for(const name of names){
 const isRoot=roots.includes(name), url=base+(isRoot?'powersAndRoots/':'writtenMethods/')+name+'.html';
 await go(url);
 const api=await evaluate('document.querySelector("[data-lesson-check-api]").dataset.lessonCheckApi');
 const questions=await evaluate(api+'.buildRound()');
 const firstStage=await evaluate('Number(document.querySelector("[data-lesson-check]").dataset.lessonCheck)');
 const first=questions.find(q=>q.stage===firstStage && typeof q.expected==='number') || questions.find(q=>typeof q.expected==='number');
 // Inequality symbols begins with button gaps; test the first numeric gap in whole-lesson view.
 if(first.stage!==firstStage)await evaluate('document.querySelector(".lesson-flowbar__toggle").click()');
 const firstSelector=`[data-lesson-check="${first.stage}"] input`;
 await type(firstSelector,'999999');await sleep(1350);
 assert(await evaluate(`document.querySelector(${JSON.stringify(firstSelector)}).getAttribute("aria-invalid")==="true"`),name+': wrong answer has no delayed cue');
 await type(firstSelector,'');
 assert(await evaluate(`!document.querySelector(${JSON.stringify(firstSelector)}).hasAttribute("aria-invalid")`),name+': stale error on edit');
 // Enter used to confirm an IME composition must not submit the unfinished answer.
 await evaluate(`(()=>{const x=document.querySelector(${JSON.stringify(firstSelector)});x.dispatchEvent(new CompositionEvent("compositionstart",{bubbles:true}));x.value=${JSON.stringify(String(first.expected))};x.dispatchEvent(new InputEvent("input",{bubbles:true,isComposing:true}));x.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true,isComposing:true}))})()`);
 await sleep(400);
 assert(await evaluate(`!document.querySelector(${JSON.stringify(firstSelector)}).hidden`),name+': accepted an unfinished IME composition');
 await evaluate(`document.querySelector(${JSON.stringify(firstSelector)}).dispatchEvent(new CompositionEvent("compositionend",{bubbles:true}))`);
 await sleep(400);
 assert(await evaluate('document.querySelectorAll(".lesson-check .roots-accepted-answer").length')===1,name+': composition end not accepted');
 await reload();
 assert(await evaluate('document.querySelectorAll(".lesson-check .roots-accepted-answer").length')===1,name+': partial answer not restored');
 assert(await evaluate('document.querySelectorAll(".roots-revealed").length')===0,name+': partial reload replays animation');
 await evaluate('document.querySelector(".lesson-flowbar__toggle").click()');
 assert(await evaluate('document.querySelectorAll(".lesson-check__turn:not([hidden])").length')===questions.length,name+': show whole omits questions');
 const last=questions.at(-1);
 await type(`[data-lesson-check="${last.stage}"] .lesson-check__turn:last-child input`,String(last.expected));
 await sleep(400);
 await evaluate('document.querySelector(".lesson-flowbar__toggle").click()');
 assert(await evaluate('document.querySelectorAll("main > section[hidden]").length')>0,name+': out-of-order answer falsely completes lesson');
 await evaluate('localStorage.setItem("dm-audit-unrelated","keep");document.querySelector(".roots-reset").click()');await sleep(800);
 assert(await evaluate('document.querySelectorAll(".roots-accepted-answer").length')===0,name+': reset leaves answers');
 assert(await evaluate('localStorage.getItem("dm-audit-unrelated")==="keep"'),name+': reset clears unrelated storage');
 const target=await evaluate('document.querySelectorAll("[data-lesson-check]")[1].closest("section").querySelector("[id]")?.id || document.querySelectorAll("[data-lesson-check]")[1].closest("section").id');
 await go(url+'#'+target);
 assert(await evaluate(`document.getElementById(${JSON.stringify(target)})?.getClientRects().length>0`),name+': deep link is hidden');
 await go(url);
 const stages=await evaluate('[...document.querySelectorAll("[data-lesson-check]")].map(x=>Number(x.dataset.lessonCheck))');
 for(const stage of stages){
  for(const [i,q] of questions.filter(q=>q.stage===stage).entries()){
   const selector=`[data-lesson-check="${stage}"] .lesson-check__turn:nth-child(${i+1})`;
   if(typeof q.expected==='string'){
    await evaluate(`document.querySelector(${JSON.stringify(selector+' [data-symbol="'+q.expected+'"]')}).focus()`);
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32},s);
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32},s);
   }else await type(selector+' input',String(q.expected));
   await sleep(350);
   assert(await evaluate(`document.querySelector(${JSON.stringify(selector)}).classList.contains("is-correct")`),name+': guided answer '+stage+':'+i+' failed');
  }
  await evaluate(`document.querySelector('[data-lesson-check="${stage}"]').closest("section").querySelector(".roots-continue")?.click()`);
  await sleep(100);
 }
 assert(await evaluate('document.querySelectorAll("main > section[hidden]").length')===0,name+': completed lesson still hidden');
 const bank=isRoot?'PowersRootsRecallBank':'WrittenMethodsRecallBank';
 const recall=await evaluate(bank+'.build('+JSON.stringify(name)+')');
 for(const [i,q] of recall.entries()){
  if(q.type==='choice'){
   await evaluate(`document.querySelector('#recall-answer-${i} input[value="${q.expected}"]').focus()`);
   await send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32},s);
   await send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32},s);
  }else await type('#recall-answer-'+i,q.type==='pair'?'±'+q.expected:String(q.expected));
  await sleep(400);
 }
 assert(await evaluate('document.querySelectorAll(".powers-recall .roots-accepted-answer").length')===4,name+': mixed practice not accepted');
 await reload();
 assert(await evaluate('document.querySelectorAll(".lesson-check .roots-accepted-answer").length')===questions.length,name+': complete restore failed');
 assert(await evaluate('document.querySelectorAll(".powers-recall .roots-accepted-answer").length')===4,name+': mixed practice restore failed');
 assert(await evaluate('document.querySelectorAll(".roots-revealed").length')===0,name+': complete reload replays animation');
 assert(!errors.length,name+': '+errors.join('\n'));
 console.log(name+': wrong/blank/IME, partial reload, show all, out-of-order, reset, deep link, guided completion and mixed practice passed');
}
if(names.length===roots.length+written.length){
 for(const [folder,total] of [['powersAndRoots',5],['writtenMethods',14]]){
  await go(base+folder+'/');
  assert(await evaluate('document.querySelector("[data-progress-summary]").textContent')===total+' / '+total+' lessons completed',folder+': menu total');
  assert(await evaluate('document.querySelectorAll(".topic-card.is-lesson-complete").length')===total,folder+': completed cards');
 }
 await go(base+'powersAndRoots/indexNotation.html');
 await evaluate('document.querySelector(".roots-reset").click()');await sleep(750);
 await go(base+'powersAndRoots/');
 assert(await evaluate('document.querySelector("[data-progress-summary]").textContent')==='4 / 5 lessons completed','Reset did not update menu');
 assert(await evaluate('document.querySelector("[data-resume-lesson]").href.endsWith("/indexNotation.html")'),'Resume does not find unfinished lesson');
 await go(base+'writtenMethods/');
 assert(await evaluate('document.querySelector("[data-progress-summary]").textContent')==='14 / 14 lessons completed','Reset changed another topic');
 console.log('Both menus: completion totals, completed cards, reset isolation and resume link passed');
}
chrome.kill();ws.close();
