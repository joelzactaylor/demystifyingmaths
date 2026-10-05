// Drafts, resume and reset confirmation in an isolated Chrome profile.
import {spawn} from 'node:child_process';
import {mkdtempSync, existsSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const profile = mkdtempSync(tmpdir() + '/lesson-session-');
const chrome = spawn(process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'], {stdio: 'ignore'});
process.on('exit', () => chrome.kill());
while (!existsSync(profile + '/DevToolsActivePort')) await sleep(100);
const [port, path] = readFileSync(profile + '/DevToolsActivePort', 'utf8').trim().split('\n');
const ws = new WebSocket('ws://localhost:' + port + path);
await new Promise(resolve => ws.onopen = resolve);
let id = 0, acceptDialog = false, dialogs = 0;
const pending = new Map();
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('Chrome timed out: ' + method)), 20000);
    pending.set(++id, result => { clearTimeout(timer); resolve(result); });
    ws.send(JSON.stringify({id, method, params, sessionId}));
});
ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) { pending.get(message.id)?.(message.result); pending.delete(message.id); }
    if (message.method === 'Page.javascriptDialogOpening') {
        dialogs++;
        send('Page.handleJavaScriptDialog', {accept: acceptDialog}, message.sessionId);
    }
};
const {targetId} = await send('Target.createTarget', {url: 'about:blank'});
const {sessionId} = await send('Target.attachToTarget', {targetId, flatten: true});
await send('Page.enable', {}, sessionId);
await send('Emulation.setDeviceMetricsOverride', {width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false}, sessionId);
const evaluate = async expression => {
    const result = await send('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true}, sessionId);
    if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
};
const assert = (ok, message) => { if (!ok) throw Error(message); };
const base = (process.env.SITE_ORIGIN || 'http://localhost:8000') + '/demystifyingmaths/pages/curriculum/GCSE/number/structure/';
const roots = ['indexNotation', 'recognisingPowers', 'squareRoots', 'positiveAndNegativeRoots', 'cubeAndHigherRoots'];
const written = ['placeValue', 'orderingNumbers', 'inequalitySymbols', 'powersOfTen', 'columnAddition', 'columnSubtraction', 'exchangingAcrossZeros', 'longMultiplication', 'multiplyingDecimals', 'shortDivision', 'interpretingRemainders', 'longDivision', 'dividingByDecimals', 'usingAGivenCalculation'];
const go = async url => { await send('Page.navigate', {url}, sessionId); await sleep(800); };
const reload = async () => { await send('Page.reload', {}, sessionId); await sleep(800); };
for (const name of process.argv.slice(2).length ? process.argv.slice(2) : [...roots, ...written]) {
    const url = base + (roots.includes(name) ? 'powersAndRoots/' : 'writtenMethods/') + name + '.html';
    await go(url);
    await evaluate("document.querySelector('.lesson-flowbar__toggle').click()");
    await sleep(100);
    const selector = await evaluate(`(() => {
        const x = [...document.querySelectorAll('.lesson-check input')].find(x => !x.hidden);
        x.value = '999999'; x.dispatchEvent(new InputEvent('input', {bubbles: true}));
        const index = [...x.closest('[data-lesson-check]').querySelectorAll('.lesson-check__turn')].indexOf(x.closest('.lesson-check__turn'));
        return '[data-lesson-check="' + x.closest('[data-lesson-check]').dataset.lessonCheck + '"] .lesson-check__turn:nth-child(' + (index + 1) + ') input';
    })()`);
    await reload();
    await evaluate('document.querySelector(".lesson-flowbar__toggle").click()');
    await sleep(100);
    const restored = await evaluate(`(() => {const x=document.querySelector(${JSON.stringify(selector)}); return x && {value:x.value,hidden:x.hidden,readOnly:x.readOnly,invalid:x.hasAttribute('aria-invalid')}})()`);
    assert(restored?.value==='999999' && !restored.hidden && !restored.readOnly && !restored.invalid, name + ': draft restore failed: ' + JSON.stringify({selector,restored}));
    await go(url + '?resume=1');
    assert(await evaluate(`(() => {const x=document.activeElement;return x.closest('.lesson-check') && x.getBoundingClientRect().height>0 && x.getBoundingClientRect().top>=0 && x.getBoundingClientRect().bottom<innerHeight})()`), name + ': resume did not focus a visible gap');
    const diagram = await evaluate(`(() => {
        const controls = [...document.querySelectorAll('main input, main select')].filter(x => !x.closest('[data-lesson-check], .powers-recall'));
        const x = controls.find(x => !x.disabled && !['radio', 'checkbox'].includes(x.type));
        if (!x) return null;
        if (x.tagName==='SELECT') x.selectedIndex=(x.selectedIndex+1)%x.options.length;
        else if(x.type==='range') x.value=Number(x.value)<Number(x.max)?Number(x.value)+Number(x.step||1):Number(x.min);
        else x.value='12';
        x.dispatchEvent(new Event('input',{bubbles:true}));x.dispatchEvent(new Event('change',{bubbles:true}));
        return controls.map(x=>[x.value,x.checked]);
    })()`);
    if (diagram) {
        await reload();
        assert(JSON.stringify(await evaluate(`[...document.querySelectorAll('main input, main select')].filter(x=>!x.closest('[data-lesson-check], .powers-recall')).map(x=>[x.value,x.checked])`)) === JSON.stringify(diagram), name + ': diagram controls did not restore consistently');
    }
    await evaluate('localStorage.setItem("session-unrelated", "keep")');
    const before = await evaluate('JSON.stringify(Object.entries(localStorage).sort())');
    const beforeDialogs = dialogs;
    acceptDialog = false;
    await evaluate('document.querySelector(".roots-reset").click()');
    assert(dialogs === beforeDialogs + 1, name + ': no reset confirmation');
    assert(await evaluate('JSON.stringify(Object.entries(localStorage).sort())') === before, name + ': cancelling reset changed storage');
    acceptDialog = true;
    await evaluate('document.querySelector(".roots-reset").click()');
    await sleep(800);
    assert(await evaluate('localStorage.getItem("session-unrelated")==="keep" && !localStorage.getItem("dm-lesson-session-v1:"+location.pathname) && !document.querySelector(".lesson-check input").value'), name + ': reset did not clear only this lesson');
    console.log('PASS ' + name + ': draft restore, visible resume, cancel/confirm reset');
}
// Resume must skip accepted gaps, and menu links must opt into that behaviour.
await go(base + 'powersAndRoots/indexNotation.html');
await evaluate(`(()=>{const x=document.querySelector('.lesson-check input');x.value=String(window.IndexNotationBank.buildRound()[0].expected);x.dispatchEvent(new InputEvent('input',{bubbles:true}))})()`);
await sleep(500);
await go(base + 'powersAndRoots/');
const resume = await evaluate(`document.querySelector('[data-resume-lesson]').href`);
assert(resume.includes('indexNotation.html?resume=1'), 'Menu did not link to the unfinished lesson');
await go(resume);
assert(await evaluate(`document.querySelectorAll('.lesson-check .roots-accepted-answer').length===1 && document.activeElement.closest('.lesson-check__turn')===document.querySelector('.lesson-check__turn:not(.is-correct)')`), 'Resume did not skip the accepted gap');
const screenshot = await send('Page.captureScreenshot', {format: 'png'}, sessionId);
writeFileSync(profile + '/resume.png', Buffer.from(screenshot.data, 'base64'));
console.log('Resume screenshot: ' + profile + '/resume.png');
await evaluate(`(()=>{const x=document.activeElement;x.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));x.value=String(window.IndexNotationBank.buildRound()[1].expected);x.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true}))})()`);
await reload();
assert(await evaluate(`document.querySelectorAll('.lesson-check .roots-accepted-answer').length===1 && !!document.querySelector('.lesson-check__turn:not(.is-correct) input').value`), 'An unfinished teaching draft was auto-accepted on reload');
// A correct-looking draft is still a draft until it has been accepted.
for (const [folder, name, bank, key] of [
    ['powersAndRoots', 'indexNotation', 'PowersRootsRecallBank', 'dm-powers-recall-fixed-v1:'],
    ['writtenMethods', 'placeValue', 'WrittenMethodsRecallBank', 'dm-written-methods-recall-v1:']
]) {
    await go(base+folder+'/'+name+'.html');
    await evaluate(`localStorage.setItem(${JSON.stringify(key+name)},JSON.stringify({answers:{0:String(window.${bank}.build(${JSON.stringify(name)})[0].expected)},accepted:{}}))`);
    await reload();
    assert(await evaluate(`!!document.querySelector('#recall-answer-0').value && !document.querySelector('#recall-answer-0').hidden && !document.querySelector('.powers-recall .roots-accepted-answer')`), name+': recall auto-accepted a saved draft');
}
await go(base+'writtenMethods/powersOfTen.html');
await evaluate(`document.querySelector('[data-machine-operation][data-shift="-2"]').click()`);
await reload();
assert(await evaluate(`document.querySelector('[data-machine-operation][data-shift="-2"]').getAttribute('aria-pressed')==='true'`), 'Power-machine operation was not restored');
await go(base+'writtenMethods/inequalitySymbols.html');
await evaluate(`document.querySelector('[data-line-handle]').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}))`);
const line = await evaluate(`document.querySelector('[data-line-handle]').getAttribute('aria-valuenow')`);
await reload();
assert(await evaluate(`document.querySelector('[data-line-handle]').getAttribute('aria-valuenow')`)===line, 'Number-line position was not restored');
console.log('PASS menu resume past accepted gaps, unsubmitted recall drafts and custom diagram persistence');
ws.close(); chrome.kill();
