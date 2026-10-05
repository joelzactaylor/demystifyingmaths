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
const go=async(name,section='powersAndRoots')=>{await send('Page.navigate',{url:base+section+'/'+name+'.html'},s);await sleep(650);await evaluate('document.querySelector(".lesson-flowbar__toggle")?.click()');await sleep(100)};
const input=async(selector,value)=>{await evaluate(`(()=>{const x=document.querySelector(${JSON.stringify(selector)});x.value=${JSON.stringify(String(value))};x.dispatchEvent(new Event("input",{bubbles:true}))})()`);};
const key=async(selector,key)=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);await send('Input.dispatchKeyEvent',{type:'keyDown',key},s);await send('Input.dispatchKeyEvent',{type:'keyUp',key},s);};
const shot=async(name,selector)=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:"center"})`);await sleep(250);writeFileSync('/tmp/audit-'+name+'.png',Buffer.from((await send('Page.captureScreenshot',{},s)).data,'base64'))};
const errors=[];await send('Runtime.enable',{},s);
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails)});
await go('indexNotation');
for(let b=0;b<=10;b++)for(let n=1;n<=6;n++){
 await input('#power-base',b);await input('#power-index',n);
 const text=await evaluate('document.querySelector(".power-lab-equation").textContent');
 assert(text.endsWith('= '+(b**n).toLocaleString('en-GB')),'Power '+b+'^'+n+' incorrect: '+text);
}
for(const value of ['', '-1','11','1a','1.2']){
 await input('#power-base',value);
 assert(await evaluate('document.querySelector("#power-base").getAttribute("aria-invalid")==="true"'),'Power accepts '+value);
 assert(!(await evaluate('document.querySelector(".power-lab-equation").textContent')).includes('='),'Invalid power leaves stale result');
}
await input('#power-base','10');await shot('power-largest','.power-lab');
await go('recognisingPowers');
for(const n of [2,7,16,64,81,121,125,243,625,729,9999]){
 await input('#power-number',n);
 const expected=[];for(let b=2;b*b<=n;b++)for(let e=2;b**e<=n;e++)if(b**e===n)expected.push([b,e]);
 const actual=await evaluate('[...document.querySelectorAll(".power-finder-result sup")].map(x=>[Number(x.parentElement.firstChild.textContent),Number(x.textContent)])');
 assert(JSON.stringify(actual)===JSON.stringify(expected),'Power names '+n+' '+JSON.stringify(actual));
}
await input('#power-number',729);await shot('power-names','#power-number');
await go('squareRoots');
for(let n=1;n<=15;n++){
 await input('#square-side',n);
 assert(await evaluate('document.querySelector(".square-product").textContent')===n+' × '+n+' = '+n*n,'Square arithmetic '+n);
 assert(await evaluate('document.querySelector(".square-tiles").children.length')===n*n,'Square tiles '+n);
}
await key('#square-side','Home');assert(await evaluate('document.querySelector("#square-side").value')==='1','Square Home');
await key('#square-side','End');assert(await evaluate('document.querySelector("#square-side").value')==='15','Square End');
await shot('square-largest','.square-explorer');
await go('cubeAndHigherRoots');
for(let n=2;n<=6;n++){
 await input('#cube-order',n);
 assert((await evaluate('document.querySelector("[data-factors]").textContent')).endsWith('= '+String((-2)**n).replace('-','−')),'Negative factors '+n);
}
const h=await evaluate('document.querySelector(".cube-explorer").getBoundingClientRect().height');
await evaluate('document.querySelector(".cube-toggle").click()');await sleep(600);
assert(await evaluate('document.querySelector(".cube-toggle").getAttribute("aria-pressed")')==='true','Cube toggle');
assert(await evaluate('document.querySelector(".cube-explorer").getBoundingClientRect().height')===h,'Cube toggle changes page height');
await shot('cube-separated','.cube-explorer');
await go('cubeAndHigherRoots');
assert(await evaluate('document.querySelector(".cube-explorer").classList.contains("is-separated")'),'Cube layers not restored');
assert(await evaluate('!document.querySelector(".cube-explorer").classList.contains("is-animated")'),'Cube replays on reload');
await go('positiveAndNegativeRoots');
await key('[data-axis="x"]','Home');
for(let n=-10;n<=10;n++){
 if(n>-10)await key('[data-axis="x"]','ArrowRight');
 assert(Number(await evaluate('document.querySelector("[data-axis=x]").getAttribute("aria-valuenow")'))===n,'Number line '+n);
 assert(Number(await evaluate('document.querySelector("[data-axis=square]").getAttribute("aria-valuenow")'))===n*n,'Square line '+n);
}
await key('[data-axis="square"]','Home');
assert(await evaluate('document.querySelector(".mirror__action").disabled'),'Change sign must disable at zero');
await key('[data-axis="x"]','ArrowLeft');
await evaluate('document.querySelector(".mirror__action").click()');
assert(Number(await evaluate('document.querySelector("[data-axis=x]").getAttribute("aria-valuenow")'))===1,'Change sign');
await shot('mirror','.mirror');
assert(!errors.length,JSON.stringify(errors));
console.log('Powers and roots: powers, power recognition, all square sizes, cube layers, sign parity, number lines, keyboard endpoints and restoration passed.');
chrome.kill();ws.close();
