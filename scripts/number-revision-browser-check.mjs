import {spawn} from 'node:child_process';
import {mkdtempSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import assert from 'node:assert/strict';
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const profile = mkdtempSync(tmpdir()+'/number-revision-');
const chrome = spawn(process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--no-first-run','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
process.on('exit',()=>chrome.kill());
while(!existsSync(profile+'/DevToolsActivePort')) await sleep(100);
const [port,path] = readFileSync(profile+'/DevToolsActivePort','utf8').trim().split('\n');
const ws = new WebSocket('ws://localhost:'+port+path); await new Promise(r=>ws.onopen=r);
let id=0, acceptDialog=false;
const pending=new Map(), errors=[];
const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error('Chrome timed out: '+method)),20000);
    pending.set(++id,m=>{clearTimeout(timer);m.error?reject(Error(m.error.message)):resolve(m.result)});
    ws.send(JSON.stringify({id,method,params,sessionId}));
});
ws.onmessage=e=>{
    const m=JSON.parse(e.data);
    if(m.id){pending.get(m.id)?.(m);pending.delete(m.id)}
    if(m.method==='Page.javascriptDialogOpening')send('Page.handleJavaScriptDialog',{accept:acceptDialog},m.sessionId);
    if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
};
const {targetId}=await send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await send('Target.attachToTarget',{targetId,flatten:true});
await send('Page.enable',{},s);await send('Runtime.enable',{},s);
await send('Emulation.setDeviceMetricsOverride',{width:Number(process.env.TEST_WIDTH)||1440,height:Number(process.env.TEST_HEIGHT)||1000,deviceScaleFactor:1,mobile:false},s);
const evaluate=async expression=>{
    const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},s);
    if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
    return r.result.value;
};
const base=(process.env.SITE_ORIGIN||'http://localhost:8000')+'/demystifyingmaths/pages/curriculum/GCSE/number/structure/';
const ready=async()=>{
    for(let i=0;i<80;i++){
        await sleep(100);
        try { if(await evaluate(`document.readyState==='complete' && !!document.querySelector('[data-number-revision]')`))return; } catch (_) { /* navigation changes execution contexts */ }
    }
    throw Error('Revision page did not finish loading: '+await evaluate('location.href'));
};
const go=async url=>{await send('Page.navigate',{url},s);await ready()};
const reload=async()=>{await send('Page.reload',{},s);await sleep(100);await ready()};
const reveal=selector=>evaluate(`(()=>{const target=document.querySelector(${JSON.stringify(selector)});let x=target.parentElement;while(x){if(x.tagName==='DETAILS' && !(target.tagName==='SUMMARY' && x===target.parentElement))x.open=true;x=x.parentElement}})()`);
const click=async selector=>{await reveal(selector);return evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`)};
const type=async(selector,value)=>{
    await reveal(selector);
    await evaluate(`(()=>{const x=document.querySelector(${JSON.stringify(selector)});x.focus();x.select()})()`);
    await send('Input.insertText',{text:String(value)},s);
};
const capture=async name=>{
    const shot=await send('Page.captureScreenshot',{format:'png'},s);
    writeFileSync(profile+'/'+name+'.png',Buffer.from(shot.data,'base64'));
};
for(const group of ['writtenMethods','powersAndRoots']){
    const url=base+group+'/practiceRevisit.html'; await go(url);
    assert(await evaluate(`!document.querySelector('[data-number-revision]').hidden`));
    assert.equal(await evaluate(`document.querySelector('[data-start], [data-home], input[type=checkbox]')`),null,'Setup screen returned');
    const count=group==='writtenMethods'?10:9;
    assert.equal(await evaluate(`document.querySelectorAll('[data-question]').length`),count);
    assert.equal(await evaluate(`document.querySelectorAll('[data-question]:not([hidden])').length`),1);
    assert.equal(await evaluate(`document.querySelector('[data-help], [data-work]')`),null);
    assert(await evaluate(`[...document.querySelectorAll('.revision-paper-image')].every(x=>x.complete && x.naturalWidth===1648)`),'Paper images did not render');
    assert.equal(await evaluate(`document.querySelectorAll('.revision-paper-image').length`),count);
    assert(await evaluate(`[...document.querySelectorAll('.revision-paper-text')].every(x=>x.classList.contains('revision-announcement') && x.querySelector('.revision-task'))`),'Missing accessible paper transcript');
    await capture(group+'-entry');
    const first='[data-question]:first-child';
    assert.match(await evaluate(`document.querySelector('[data-question] label').textContent`),group==='writtenMethods'?/decimal/:/figures/,'Local answer format must be explicit');
    assert.equal(await evaluate(`document.querySelector('.revision-intro, .revision-source-label')`),null,'Removed introductory copy returned');
    await type(first+' [data-answer]',group==='writtenMethods'?'seven hundredths':'eighty one');
    await click(first+' [data-check]');
    assert(await evaluate(`!document.querySelector('[data-answer]').classList.contains('is-accepted')`),'Words bypassed the stated numerical format');
    await type(first+' [data-answer]','');
    await click(first+' [data-check]');
    assert.match(await evaluate(`document.querySelector('[data-question] .revision-feedback').textContent`),/Enter an answer/);
    await type(first+' [data-answer]','999999');await click(first+' [data-check]');
    assert.equal(await evaluate(`document.querySelector('[data-answer]').getAttribute('aria-invalid')`),'true');
    await evaluate(`document.querySelector('[data-check]').focus()`);
    await click(first+' [data-check]');
    assert(await evaluate(`document.activeElement===document.querySelector('[data-answer]')`),'Wrong answer did not return focus to the editable answer');
    await capture(group+'-wrong');
    await type(first+' [data-answer]','9.');await reload();
    assert.equal(await evaluate(`document.querySelector('[data-answer]').value`),'9.');
    assert(await evaluate(`!document.querySelector('[data-answer]').hasAttribute('aria-invalid')`),'Reload regraded draft');
    const ids=await evaluate(`[...document.querySelectorAll('[data-question]')].map(x=>x.dataset.question)`);
    for(const [i,qid] of ids.entries()){
        const selector='[data-question="'+qid+'"]';
        const q=await evaluate(`[...NumberRevisionBank.questions,...NumberRevisionBank.problems].find(q=>q.id===${JSON.stringify(qid)})`);

        if(i===2)await click(selector+' [data-solution] summary');
        await type(selector+' [data-answer]',q.expected);await click(selector+' [data-check]');
        assert(await evaluate(`document.querySelector(${JSON.stringify(selector+' [data-answer]')}).classList.contains('is-accepted')`),qid);
        await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);
        if(i===0){
            await evaluate(`document.activeElement.blur()`);
            assert.equal(await evaluate(`getComputedStyle(document.querySelector(${JSON.stringify(selector+' [data-answer]')})).color`),'rgb(19, 112, 68)','Accepted answer lost green after blur');
            await capture(group+'-accepted');
        }
        if(i===ids.length-1)await capture(group+'-problem');
        await click(selector+' [data-next]');
    }
    const saved=await evaluate(`localStorage.getItem('dm-number-revision-v1:'+document.querySelector('[data-question]').dataset.question.split(':')[0])`);
    await reload();
    assert(await evaluate(`[...document.querySelectorAll('[data-answer]')].every(x=>x.classList.contains('is-accepted'))`),'Completed sheet lost on reload');
    assert(await evaluate(`!document.querySelector('[data-complete]').hidden`));
    for(let i=0;i<count;i++)await click('[data-previous]');
    await type(first+' [data-answer]',await evaluate(`NumberRevisionBank.questions.find(q=>q.id===document.querySelector('[data-question]').dataset.question).expected`));
    await click(first+' [data-check]');
    assert.equal(await evaluate(`localStorage.getItem('dm-number-revision-v1:'+document.querySelector('[data-question]').dataset.question.split(':')[0])`),saved,'Rechecking advanced schedule');
    await evaluate(`localStorage.setItem('dm-curriculum-v1:unrelated','keep')`);
    const before=await evaluate('JSON.stringify(Object.entries(localStorage).sort())');
    await click('[data-reset]');
    assert.equal(await evaluate('JSON.stringify(Object.entries(localStorage).sort())'),before,'Cancelled reset changed history');
    acceptDialog=true;await click('[data-reset]');acceptDialog=false;
    assert(await evaluate(`[...document.querySelectorAll('[data-answer]')].every(x=>x.value==='')`));
    assert.equal(await evaluate(`localStorage.getItem('dm-curriculum-v1:unrelated')`),'keep');
    await click(first+' [data-solution] summary');
    assert(await evaluate(`!document.querySelector('[data-question] [data-next]').hidden`),'Solution must provide a way forward');
    await click(first+' [data-next]');
    assert.match(await evaluate(`document.querySelector('[data-position]').textContent`),/Question 2 of/);
    await reload();
    assert.match(await evaluate(`document.querySelector('[data-position]').textContent`),/Question 2 of/,'Guided position was lost');
    await click('[data-previous]');
    assert(await evaluate(`document.querySelector('[data-question]:not([hidden]) [data-solution]').open`),'Previously opened solution was lost');
    await click(first+' [data-solution] summary');
    await reload();
    assert(await evaluate(`!document.querySelector('[data-question]:not([hidden]) [data-solution]').open`),'Closed solution reopened on reload');
    assert(await evaluate(`!document.querySelector('[data-question]:not([hidden]) [data-next]').hidden`),'Closing a viewed solution removed the route forward');
    acceptDialog=true;await click('[data-reset]');acceptDialog=false;
    const aria=await evaluate(`(()=>{const ids=[...document.querySelectorAll('[id]')].map(x=>x.id);return {duplicates:ids.filter((id,i)=>ids.indexOf(id)!==i),missing:[...document.querySelectorAll('[aria-labelledby], [aria-describedby]')].flatMap(x=>['aria-labelledby','aria-describedby'].flatMap(a=>(x.getAttribute(a)||'').split(/\\s+/).filter(Boolean).filter(id=>!document.getElementById(id))))}})()`);
    assert.deepEqual(aria,{duplicates:[],missing:[]});
    console.log(group+': guided questions, drafts, solutions, all problems, accepted reload and reset passed');
}
// Automatic selection and early revisits preserve the existing due date.
await go(base+'writtenMethods/practiceRevisit.html#problems');
for(let i=0;i<4;i++){
    await click('[data-question]:not([hidden]) [data-solution] summary');
    await click('[data-question]:not([hidden]) [data-next]');
}
assert(await evaluate(`document.querySelector('[data-complete]').hidden`),'Finished final problem falsely completed unfinished review');
assert.equal(await evaluate(`document.querySelector('[data-question]:not([hidden])').dataset.question`),'placeValue:0');
await reload();
assert(await evaluate(`document.querySelector('[data-complete]').hidden`),'Incomplete review became complete on reload');
await go(base+'writtenMethods/practiceRevisit.html');
const completedPath='/pages/curriculum/GCSE/number/structure/writtenMethods/placeValue.html';
const future=Date.now()+86400000;
await evaluate(`localStorage.removeItem('dm-number-revision-v1:writtenMethods:session');localStorage.setItem('dm-curriculum-v1:'+"/pages/curriculum/GCSE/number/structure/writtenMethods/placeValue.html",JSON.stringify({done:1,total:1}));localStorage.setItem('dm-number-revision-v1:placeValue',JSON.stringify({step:2,due:${future},variant:0}))`);
await reload();
assert.equal(await evaluate(`document.querySelector('[data-question]').dataset.question`),'placeValue:1');
await type('[data-answer]','4003020');await click('[data-check]');
assert.equal(await evaluate(`JSON.parse(localStorage.getItem('dm-number-revision-v1:placeValue')).due`),future);
assert.equal(await evaluate(`JSON.parse(localStorage.getItem('dm-number-revision-v1:placeValue')).step`),2);
await evaluate(`localStorage.removeItem('dm-curriculum-v1:'+"/pages/curriculum/GCSE/number/structure/writtenMethods/placeValue.html")`);
// Every authored retrieval prompt mounts and accepts, without carousel navigation.
const all=await evaluate('NumberRevisionBank.questions.map(q=>({...q,group:NumberRevisionBank.lessons[q.lesson].group}))');
for(const q of all){
    await evaluate(`localStorage.setItem('dm-number-revision-v1:${q.group}:session',JSON.stringify({ids:[${JSON.stringify(q.id)}],index:0,responses:{}}))`);
    await go(base+q.group+'/practiceRevisit.html');
    const selector='[data-question="'+q.id+'"]';
    assert(await evaluate(`(()=>{const image=document.querySelector(${JSON.stringify(selector)}).querySelector('.revision-paper-image');return image?.complete && image.naturalWidth===1648})()`),q.id+': paper image');
    if(q.lesson==='squareRoots' && q.variant===0)await capture('square-root-paper');
    if(q.lesson==='orderingNumbers' && q.variant===0)await capture('number-list-paper');
    await type(selector+' [data-answer]',q.expected);
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},s);
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,autoRepeat:true},s);
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},s);
    assert(await evaluate(`document.querySelector(${JSON.stringify(selector+' [data-answer]')}).classList.contains('is-accepted')`),q.id);
    assert.equal(await evaluate(`document.querySelector('[data-question]:not([hidden])').dataset.question`),q.id,'Held Enter advanced the question');
    assert(await evaluate(`(()=>{const input=document.querySelector('[data-answer]'),a=input.getBoundingClientRect(),p=input.closest('.revision-paper').getBoundingClientRect(),q=NumberRevisionBank.questions.find(q=>q.id===input.closest('[data-question]').dataset.question),paper=NumberRevisionPaper.render(q,1),scale=p.width/paper.width;return Math.abs(a.left-p.left-paper.answer.left*scale)<1 && Math.abs(a.bottom-p.top-(paper.answer.top+paper.answer.height)*scale)<1 && a.height<40})()`),q.id+': answer does not sit on printed line');
    assert(await evaluate(`[...document.querySelectorAll('.caret')].every(x=>getComputedStyle(x).clipPath==='inset(50%)')`));
    const before=await evaluate(`localStorage.getItem('dm-number-revision-v1:${q.lesson}')`);
    await click(selector+' [data-solution] summary');
    if(q.lesson==='shortDivision' && q.variant===1){
        await evaluate(`document.querySelector(${JSON.stringify(selector+' [data-solution]')}).scrollIntoView({block:'center'})`);
        assert.equal(await evaluate(`document.querySelector(${JSON.stringify(selector+' [data-solution]')}).querySelectorAll('ol > li').length`),4);
        await capture('decimal-division-solution');
    }
    assert.equal(await evaluate(`localStorage.getItem('dm-number-revision-v1:${q.lesson}')`),before,'Retrospective solution changed schedule');
}
console.log('All 38 retrieval prompts: native Enter, accepted state, geometry and retrospective solutions passed');
// A due session must not reveal answers from the previous longer problems.
await evaluate(`(()=>{const prefix='dm-number-revision-v1:',session=JSON.parse(localStorage.getItem(prefix+'powersAndRoots:session'));for(const id of session.ids){const lesson=id.split(':')[0],record=JSON.parse(localStorage.getItem(prefix+lesson));record.due=Date.now()-1000;localStorage.setItem(prefix+lesson,JSON.stringify(record));}for(const q of NumberRevisionBank.problems.filter(q=>q.group==='powersAndRoots'))localStorage.setItem(prefix+q.id,JSON.stringify({draft:String(q.expected),correct:true,finished:true}));})()`);
await go(base+'powersAndRoots/practiceRevisit.html');
assert(await evaluate(`[...document.querySelectorAll('[data-question^="pr-"] [data-answer]')].every(x=>x.value==='' && !x.classList.contains('is-accepted'))`),'New due session exposed old problem answers');
// Editing an accepted answer must also update the completion count.
const initialProgress=await evaluate(`document.querySelector('[data-progress]').value`);
const firstExpected=await evaluate(`NumberRevisionBank.questions.find(q=>q.id===document.querySelector('[data-question]').dataset.question).expected`);
await type('[data-answer]',firstExpected);await click('[data-check]');
assert.equal(await evaluate(`document.querySelector('[data-progress]').value`),initialProgress+1);
await type('[data-answer]','99999');
assert.equal(await evaluate(`document.querySelector('[data-progress]').value`),initialProgress,'Edited answer still counted complete');
// If Canvas is unavailable, the complete printed text must remain readable.
await evaluate(`document.querySelector('.revision-paper-image').dispatchEvent(new Event('error'))`);
assert(await evaluate(`(()=>{const sheet=document.querySelector('.revision-paper');return !sheet.classList.contains('has-paper') && !sheet.querySelector('.revision-paper-text').classList.contains('revision-announcement') && getComputedStyle(sheet.querySelector('.revision-gap')).position!=='absolute'})()`),'Failed image left an invisible or floating answer');
const fallback = await send('Page.addScriptToEvaluateOnNewDocument',{source:`HTMLCanvasElement.prototype.getContext=function(){return null}`},s);
await go(base+'powersAndRoots/practiceRevisit.html');
assert.equal(await evaluate(`document.querySelector('.revision-paper-image')`),null);
assert(await evaluate(`[...document.querySelectorAll('.revision-paper-text')].every(x=>!x.classList.contains('revision-announcement'))`));
await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:fallback.identifier},s);
for(const mode of ['corrupt','blocked']){
    const source=mode==='blocked'?`Storage.prototype.getItem=Storage.prototype.setItem=Storage.prototype.removeItem=function(){throw Error('blocked')}`:`Storage.prototype.getItem=function(){return '{bad json'}`;
    const {identifier}=await send('Page.addScriptToEvaluateOnNewDocument',{source},s);
    await go(base+'powersAndRoots/practiceRevisit.html');
    assert.equal(await evaluate(`document.querySelectorAll('[data-question]').length`),9);
    await type('[data-answer]','81');await click('[data-check]');
    assert(await evaluate(`document.querySelector('[data-answer]').classList.contains('is-accepted')`));
    if(mode==='blocked')assert(await evaluate(`!document.querySelector('[data-storage]').hidden`));
    await send('Page.removeScriptToEvaluateOnNewDocument',{identifier},s);
}
await send('Emulation.setScriptExecutionDisabled',{value:true},s);
await go(base+'writtenMethods/practiceRevisit.html');
assert.equal(await evaluate(`document.querySelector('noscript ul')?.querySelectorAll('a').length`),14);
await send('Emulation.setScriptExecutionDisabled',{value:false},s);
assert.deepEqual(errors,[]);
console.log('Blocked/corrupt storage and no-JS fallback passed. Screenshots: '+profile);
ws.close();chrome.kill();
