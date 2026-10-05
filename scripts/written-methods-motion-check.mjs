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
const width=Number(process.env.TEST_WIDTH || 1440), height=Number(process.env.TEST_HEIGHT || 1000);
await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false},s);
const evaluate=async expression=>(await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},s)).result.value;
await send('Runtime.enable',{},s);
const pageErrors=[];
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.method==='Runtime.exceptionThrown')pageErrors.push(m.params.exceptionDetails);});

const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
const names=process.argv.slice(2);
if(!names.length)names.push('orderingNumbers','columnAddition','columnSubtraction','exchangingAcrossZeros','longMultiplication','multiplyingDecimals','shortDivision','interpretingRemainders','longDivision','dividingByDecimals','usingAGivenCalculation');
const base=(process.env.SITE_ORIGIN || 'http://localhost:8000')+'/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/';
let total=0;
for(const name of names){
 await send('Page.navigate',{url:base+name+'.html'},s);await sleep(900);
 await evaluate('document.querySelector(".lesson-flowbar__toggle").click()');await sleep(500);
 const count=await evaluate('document.querySelectorAll(".is-ready").length');
 assert(count>0,name+' did not initialise its scenes');
 assert(!pageErrors.length,JSON.stringify(pageErrors));
 for(let i=0;i<count;i++){
  const baseline=await evaluate(`(()=>{
   const scene=document.querySelectorAll(".is-ready")[${i}],card=scene.querySelector('[class*="scene__sticky"]');
   if(!card)return null;
   window.scrollTo(0,scrollY+scene.getBoundingClientRect().top-100);
   return true;
  })()`); if(!baseline)continue; await sleep(120);
  const style=await evaluate(`(()=>{
   const card=document.querySelectorAll(".is-ready")[${i}].querySelector('[class*="scene__sticky"]');
   const child=card.querySelector('[class*="caption"] p')||card.querySelector('p');
   const c=getComputedStyle(child),r=card.getBoundingClientRect();
   return {font:c.fontFamily,size:c.fontSize,line:c.lineHeight,space:c.letterSpacing,width:r.width,height:r.height};
  })()`);
  for(const fraction of [.25,.6,1,.6,.25]){
   const immediate=await evaluate(`(()=>{const scene=document.querySelectorAll(".is-ready")[${i}],card=scene.querySelector('[class*="scene__sticky"]'),scale=scene.getBoundingClientRect().width/scene.offsetWidth;const top=Math.max(16,(innerHeight-card.offsetHeight*scale)/2);window.scrollTo(0,scrollY+scene.getBoundingClientRect().top-top+Math.max(1,scene.offsetHeight-card.offsetHeight)*scale*${fraction});return {top:card.getBoundingClientRect().top,expected:top,position:getComputedStyle(card).position}})()`);
   // Measure before any scroll listener or animation frame can compensate.
   // A JavaScript-positioned card can pass settled checks but lag on fast scroll.
   assert(immediate.position==='sticky',name+' '+i+' must use native sticky positioning');
   assert(Math.abs(immediate.top-immediate.expected)<3,name+' '+i+' lags behind scrolling: '+JSON.stringify(immediate));
   await sleep(350);
   const now=await evaluate(`(()=>{
    const scene=document.querySelectorAll(".is-ready")[${i}],card=scene.querySelector('[class*="scene__sticky"]'),child=card.querySelector('[class*="caption"] p')||card.querySelector('p'),c=getComputedStyle(child),r=card.getBoundingClientRect();
    return {font:c.fontFamily,size:c.fontSize,line:c.lineHeight,space:c.letterSpacing,width:r.width,height:r.height,top:r.top,left:r.left,sceneLeft:scene.getBoundingClientRect().left,parent:card.parentElement===scene,pinned:card.classList.contains('is-pinned')};
   })()`);
   assert(now.parent,name+' '+i+' must stay inside its scene');
   for(const key of ['font','size','line','space'])assert(now[key]===style[key],name+' '+i+' changed '+key);
   assert(Math.abs(now.width-style.width)<1&&Math.abs(now.height-style.height)<1,name+' '+i+' changed dimensions '+JSON.stringify({style,now}));
   assert(Math.abs(now.left-now.sceneLeft)<1,name+' '+i+' wrong horizontal position');
   if(fraction<1)assert(Math.abs(now.top-Math.max(16,(height-now.height)/2))<3,name+' '+i+' fraction '+fraction+' wrong pin '+JSON.stringify(now));
  }
  if(i===0)writeFileSync('/tmp/written-motion-'+name+'.png',Buffer.from((await send('Page.captureScreenshot',{},s)).data,'base64'));
  total++;
 }
 console.log(name+': '+count+' scenes retain their parent, geometry and typography across scrolling');
}
console.log(total+' animated scenes passed normal-motion checks.');
chrome.kill();ws.close();
