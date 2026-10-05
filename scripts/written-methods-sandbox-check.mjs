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

const base=(process.env.SITE_ORIGIN || 'http://localhost:8000')+'/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/';
const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]},s);
for(const [name,selector,container,invalid,good] of [
 ['columnAddition','input[data-addend="a"]','.addition-scene','is-invalid','100'],
 ['columnSubtraction','input[data-term="a"]','.subtraction-scene','is-invalid','9000'],
 ['longMultiplication','input[data-term="a"]','.multiplication-scene','is-invalid','123'],
 ['multiplyingDecimals','input[data-term="a"]','.dec-scene','is-invalid','2.4'],
 ['shortDivision','input[data-dividend-input]','.division-scene','is-invalid','20'],
 ['longDivision','input[data-dividend-input]','.long-scene','is-invalid','20'],
 ['dividingByDecimals','input[data-dividend-input]','.decimal-division-sandbox','is-invalid','20'],
 ['placeValue','.place-lab input','.place-lab','is-empty','20'],
 ['powersOfTen','.power-machine input','.power-machine','is-empty','20']
]){
 await send('Page.navigate',{url:base+name+'.html'},s);await sleep(750);
 await evaluate('document.querySelector(".lesson-flowbar__toggle").click()');await sleep(250);
 for(const value of ['1a','1..2','']){
  await evaluate('document.querySelector('+JSON.stringify(selector)+').focus();document.querySelector('+JSON.stringify(selector)+').select()');
  if(value)await send('Input.insertText',{text:value},s);
  else {await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8},s);await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8},s);}
  await sleep(120);
  const result=await evaluate('(()=>{const input=document.querySelector('+JSON.stringify(selector)+');return {value:input.value,invalid:input.closest('+JSON.stringify(container)+').classList.contains('+JSON.stringify(invalid)+'),focus:document.activeElement===input}})()');
  assert(result.value===value,name+' rewrote '+value+' into '+result.value);
  if(name==='longDivision')result.invalid=await evaluate('document.querySelector("[data-dividend-input]").getAttribute("aria-invalid")==="true" && document.querySelector("[data-dividend-input]").closest(".long-scene").querySelector("[data-paper]").classList.contains("is-invalid")');
  assert(result.invalid,name+' failed to reject '+value+JSON.stringify(result));
  assert(result.focus,name+' lost focus');
 }
 await evaluate('document.querySelector('+JSON.stringify(selector)+').focus();document.querySelector('+JSON.stringify(selector)+').select()');await send('Input.insertText',{text:good},s);await sleep(150);
 assert(await evaluate('!document.querySelector('+JSON.stringify(selector)+').closest('+JSON.stringify(container)+').classList.contains('+JSON.stringify(invalid)+')'),name+' failed to recover');
 console.log(name+' preserves bad input and focus, hides stale results, and recovers');
}

const cases=[
 ['columnAddition','[data-addend="a"]','[data-addend="b"]','.addition-scene','[data-step-title]',(a,b)=>a+b,[[0,0],[99999.999,.001],[.006,.009],[10,90],[99999.999,99999.999]]],
 ['columnSubtraction','[data-term="a"]','[data-term="b"]','.subtraction-scene','[data-step-title]',(a,b)=>a-b,[[0,0],[10000,.001],[5.002,1.376],[10,10],[99999.999,.001]]],
 ['longMultiplication','[data-term="a"]','[data-term="b"]','.multiplication-scene','[data-step-copy]',(a,b)=>a*b,[[0,999],[9999,999],[1002,304]]],
 ['multiplyingDecimals','[data-term="a"]','[data-term="b"]','.dec-scene','[data-step-title]',(a,b)=>a*b,[[0,0],[.01,.01],[999.99,999.99],[.5,.4]]],
 ['shortDivision','[data-dividend-input]','[data-divisor-input]','.division-scene','[data-step-title]',(a,b)=>a/b,[[0,2],[99999.992,8],[.008,4],[804,4],[7,8],[1,3]]],
 ['longDivision','[data-dividend-input]','[data-divisor-input]','.long-scene','[data-step-title]',(a,b)=>a/b,[[0,10],[99999.9,99],[.24,12],[2448,24],[75.6,24],[99999.99,99]]],
 ['dividingByDecimals','[data-dividend-input]','[data-divisor-input]','.decimal-division-sandbox','[data-sandbox-answer]',(a,b)=>a/b,[[.06,.003],[55.2,.46],[9999.99,.001],[999,.999]]]
];
for(const [name,aSelector,bSelector,container,answerSelector,calculate,values] of cases){
 await send('Page.navigate',{url:base+name+'.html'},s);await sleep(650);
 await evaluate('document.querySelector(".lesson-flowbar__toggle").click()');await sleep(100);
 for(const [a,b] of values){
  for(const [selector,value] of [[aSelector,a],[bSelector,b]]){
   await evaluate('(()=>{const x=document.querySelector('+JSON.stringify(selector)+');x.focus();x.select()})()');
   await send('Input.insertText',{text:String(value)},s);await sleep(70);
  }
  await sleep(160);
  const text=await evaluate('document.querySelector('+JSON.stringify(aSelector)+').closest('+JSON.stringify(container)+').querySelector('+JSON.stringify(answerSelector)+').textContent');
  const numbers=text.replace(/,/g,'').match(/(?:\d+\.?\d*|\.\d+)/g);
  const actual=Number(numbers?.at(-1)), expected=Number(calculate(a,b).toFixed(9));
  const precision=numbers?.at(-1).split('.')[1]?.length || 0;
  const correct=text.includes('…') ? expected>=actual && expected-actual<10**(-precision) : Math.abs(actual-expected)<1e-8;
  assert(numbers&&correct,name+' '+a+','+b+': '+text+'; expected '+expected);
  if(name==='shortDivision'){
   const mark=await evaluate('(()=>{const x=document.querySelector(".division-scene--sandbox .division-board__continuation");return x ? {text:x.textContent,opacity:getComputedStyle(x).opacity} : null})()');
   assert(text.includes('…') ? mark?.text==='…' && Number(mark.opacity)===1 : mark===null,'Short division continuation mark must agree with its caption');
  }
 }
 const selector=JSON.stringify(aSelector), box=JSON.stringify(container);
 await evaluate('document.querySelector('+selector+').closest('+box+').scrollIntoView({block:"center"})');await sleep(150);
 writeFileSync('/tmp/audit-sandbox-'+name+'.png',Buffer.from((await send('Page.captureScreenshot',{},s)).data,'base64'));
 console.log(name+': sampled arithmetic and boundary calculations independently verified');
}

chrome.kill();ws.close();
