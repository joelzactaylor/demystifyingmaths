/* Guided fixed practice papers: one complete question, with no setup screen. */
(() => {
    'use strict';
    const host = document.querySelector('[data-number-revision]');
    if (!host) return;
    const bank = window.NumberRevisionBank, core = window.NumberRevisionCore;
    const group = host.dataset.numberRevision, prefix = 'dm-number-revision-v1:';
    const lessons = bank.groups[group].map(([id]) => bank.lessons[id]);
    const byId = Object.fromEntries(bank.questions.map(q => [q.id, q]));
    const paperQuestions = [...bank.questions.filter(q => bank.lessons[q.lesson].group === group),
        ...bank.problems.filter(q => q.group === group)];
    const memory = new Map(), pending = new Map();
    let storageOK = true, storageDamaged = false, markStoreDamaged = false, session, position = 0;
    let items = [];
    const el = name => host.querySelector('[data-' + name + ']');
    function read(key) {
        if (memory.has(key)) return memory.get(key);
        let raw;
        try { raw=localStorage.getItem(prefix + key); }
        catch (_) {
            storageOK=false; storageDamaged=true;
            if(key===group+':marks')markStoreDamaged=true;
            storageNote(); return null;
        }
        if(raw===null)return null;
        try {
            const value=JSON.parse(raw);
            if(!value || typeof value!=='object' || Array.isArray(value)){
                storageDamaged=true;if(key===group+':marks')markStoreDamaged=true;
                storageNote();return null;
            }
            return value;
        }
        catch (_) {
            storageDamaged=true;if(key===group+':marks')markStoreDamaged=true;
            storageNote();return null;
        }
    }
    function storageNote() {
        const note=el('storage');
        note.hidden = storageOK && !storageDamaged;
        note.textContent = !storageOK ? 'Answers cannot be saved in this browser. They will remain available while this tab is open.'
            : storageDamaged ? 'Some saved answers or marks could not be read. This paper has reopened without them.' : '';
    }
    function flushStorage() {
        try {
            for (const [key, value] of pending) {
                if (value === null) localStorage.removeItem(prefix + key);
                else localStorage.setItem(prefix + key, value);
                pending.delete(key);
            }
            storageOK = true;
        } catch (_) { storageOK = false; }
        storageNote();
    }
    function save(key, value) {
        memory.set(key, value);
        pending.set(key, JSON.stringify(value));
        flushStorage();
    }
    function remove(keys) {
        for (const key of keys) {
            memory.set(key, null);
            pending.set(key, null);
        }
        flushStorage();
    }
    function cleanMarkStore(value) {
        const marks = {}, source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
        let damaged = false;
        for (const q of paperQuestions) {
            if (!Object.hasOwn(source, q.id)) continue;
            const record = core.markRecord(source[q.id], q);
            if (record) marks[q.id] = record;
            else damaged = true;
        }
        return {marks, damaged};
    }
    function readMarks() {
        const cleaned=cleanMarkStore(read(group+':marks'));
        if(cleaned.damaged){storageDamaged=true;markStoreDamaged=true;storageNote();}
        return cleaned;
    }
    try { const key = prefix + 'test'; localStorage.setItem(key, '1'); localStorage.removeItem(key); }
    catch (_) { storageOK = false; }
    function getSession() {
        const previous = core.restoreSession(read(group + ':session'), bank, group);
        const ids = bank.questions.filter(q => bank.lessons[q.lesson].group === group).map(q => q.id);
        if (previous && JSON.stringify(previous.ids) === JSON.stringify(ids)) return previous;
        // Expand older short sessions without losing their answers or working.
        // A new token invalidates the old cursor, whose question numbers differ.
        return {ids, index: 0, token: 'fixed-' + Date.now().toString(36),
            responses: Object.fromEntries(ids.map(id => [id, previous?.responses[id] || core.cleanResponse(null, byId[id])]))};
    }
    function lessonLink(id) {
        const lesson = bank.lessons[id], a = document.createElement('a');
        a.href = lesson.url + '#' + lesson.anchor;
        a.textContent = 'Lesson: ' + lesson.title;
        return a;
    }
    function showPosition(next, focus = false) {
        position = Math.max(0, Math.min(next, items.length));
        if (position === items.length) {
            const unfinished = items.findIndex(item => !item.response.finished);
            if (unfinished >= 0) position = unfinished;
        }
        // A paper facsimile is a large PNG. Keep only the question being read
        // rasterised; every other question retains its light DOM and geometry.
        items.forEach((item, i) => item.setActive(i === position));
        items[position]?.redraw();
        // Establish storage availability before describing the saved state on
        // the completion screen.
        save(group + ':position', {token: session.token, index: position});
        el('complete').hidden = position !== items.length;
        const completeCopy=el('complete').querySelector('p');
        if(position===items.length){
            const storedMarks=readMarks(),
                scores=storedMarks.marks;
            let verified=0,review=0,missing=0,marksDamaged=markStoreDamaged;
            for(const q of paperQuestions){
                const score=scores[q.id];
                if(!score)continue;
                verified+=score.earned;
                if(score.unassessed>0)review++;
                if(score.missingWorking)missing++;
            }
            const total=paperQuestions.reduce((sum,q)=>sum+q.marks,0);
            const scoreLine=document.createElement('strong');
            scoreLine.textContent=marksDamaged?'Some saved marks could not be read.':verified+' of '+total+' marks verified.';
            const storageLine=document.createElement('span');
            storageLine.textContent=storageOK?'Answers are saved on this device.':'Answers will remain available while this tab is open.';
            completeCopy.replaceChildren(scoreLine);
            if(review && !marksDamaged){
                const reviewLine=document.createElement('span');
                reviewLine.textContent=review+' '+(review===1?'question still needs its working':'questions still need their working')+' reviewed.';
                completeCopy.append(reviewLine);
            }
            if(missing && !marksDamaged){
                const missingLine=document.createElement('span');
                missingLine.textContent=missing+' '+(missing===1?'question is':'questions are')+' missing required working.';
                completeCopy.append(missingLine);
            }
            completeCopy.append(storageLine);
        }
        el('position').textContent = position === items.length ? 'End of paper' : 'Question ' + (position + 1) + ' of ' + items.length;
        const progress = el('progress');
        progress.max = items.length;
        progress.value = position === items.length ? items.length : position + 1;
        progress.setAttribute('aria-valuetext', position === items.length ? 'End of paper' : 'Question ' + (position + 1) + ' of ' + items.length);
        const forward = items[position]?.article.querySelector('[data-next]');
        if (forward) forward.textContent = position === items.length - 1 &&
            items.slice(0, -1).every(item => item.response.finished) ? 'Finish' : 'Continue';
        el('previous').hidden = position === 0;
        if (focus) {
            const target = items[position]?.article.querySelector('h2') || el('complete').querySelector('h2');
            target.tabIndex = -1; target.focus({preventScroll: true});
            const box = (items[position]?.article || target).getBoundingClientRect();
            if (box.top < 90 || box.bottom > innerHeight - 80)
                (items[position]?.article || target).scrollIntoView({block: 'start', behavior: 'instant'});
        }
    }
    function mount(q, response, index, retrieval) {
        const article = document.createElement('article');
        article.className = 'revision-item';
        article.classList.toggle('revision-item--working',q.showWorking);
        article.id = 'question-' + q.id.replace(':', '-');
        article.dataset.question = q.id;
        const heading = document.createElement('h2');
        heading.className = 'revision-number';
        heading.innerHTML = '<span class="revision-announcement">Question </span>' + index;
        const body = document.createElement('div');
        body.className = 'revision-item-body';
        const context = document.createElement('p');
        context.className = 'revision-context';
        context.id = article.id + '-context';
        context.innerHTML = q.context || '';
        context.hidden = !q.context;
        const task = document.createElement('p');
        task.className = 'revision-task'; task.id = article.id + '-task'; task.innerHTML = q.examPrompt;
        if(q.showWorking) task.append(' You must show your working.');
        const transcript = document.createElement('div');
        transcript.className = 'revision-paper-text';
        const marks = document.createElement('p');
        marks.className = 'revision-total'; marks.id = article.id + '-total';
        marks.textContent = 'Total for Question ' + index + ' is ' + q.marks + (q.marks === 1 ? ' mark.' : ' marks.');
        transcript.append(heading, context, task);
        let paper;
        const sheet = document.createElement('div');
        sheet.className = 'revision-paper';
        article.append(sheet);
        try { paper = window.NumberRevisionPaper?.layout(q, index); } catch (_) { /* readable HTML fallback */ }
        let image = null, paperFailed = !paper;
        function removePaper() {
            image?.remove(); image = null;
            transcript.classList.remove('revision-announcement');
            marks.classList.remove('revision-announcement');
            sheet.classList.remove('has-paper');
        }
        function showPaper() {
            if (image || paperFailed) return;
            let rendered;
            try { rendered = window.NumberRevisionPaper?.render(q, index); } catch (_) { /* readable HTML fallback */ }
            if (!rendered) { paperFailed = true; removePaper(); return; }
            const nextImage = document.createElement('img');
            nextImage.className = 'revision-paper-image'; nextImage.alt = ''; nextImage.draggable = false;
            nextImage.addEventListener('dragstart', e => e.preventDefault());
            nextImage.setAttribute('aria-hidden', 'true');
            nextImage.width = rendered.width; nextImage.height = rendered.height;
            nextImage.addEventListener('load', () => drawMarks(false), {once: true});
            nextImage.addEventListener('error', () => { paperFailed = true; removePaper(); });
            image = nextImage;
            image.src = rendered.url;
            transcript.classList.add('revision-announcement');
            marks.classList.add('revision-announcement');
            sheet.insertBefore(image, transcript);
            sheet.classList.add('has-paper');
        }
        sheet.append(transcript);
        const gap = document.createElement('p'), label = document.createElement('label'), input = document.createElement('input'), unit = document.createElement('span');
        gap.className = 'revision-gap';
        label.textContent = q.answerForm === 'decimal' ? 'Answer as a decimal' : 'Answer in figures';
        input.id = article.id + '-answer'; label.htmlFor = input.id;
        input.type = 'text'; input.inputMode = 'decimal'; input.autocomplete = 'off'; input.maxLength = 100;
        input.dataset.answer = ''; input.value = response.draft;
        // Any necessary format instruction belongs in the question wording.
        // A placeholder on the ruled line looks unlike an exam paper.
        input.placeholder = '';
        if (q.unit || q.answerPrefix) {
            const units = {cm: 'centimetres', m: 'metres', p: 'pence'};
            input.setAttribute('aria-label', label.textContent + ', in ' + (q.answerPrefix === '£' ? 'pounds' : units[q.unit] || q.unit));
        }
        unit.textContent = q.unit;
        gap.append(label, ' ', q.answerPrefix || '', input, q.unit ? ' ' : '', unit);
        if (paper) {
            gap.style.setProperty('--answer-left', 100 * paper.answer.left / paper.width + '%');
            gap.style.setProperty('--answer-top', 100 * paper.answer.top / paper.height + '%');
            gap.style.setProperty('--answer-width', 100 * paper.answer.width / paper.width + '%');
            gap.style.setProperty('--answer-height', 100 * paper.answer.height / paper.height + '%');
        }
        sheet.append(gap, marks);
        const feedback = document.createElement('p');
        feedback.className = 'revision-feedback'; feedback.id = article.id + '-feedback';
        feedback.setAttribute('role', 'status');
        input.setAttribute('aria-describedby', (q.context ? context.id + ' ' : '') + task.id + ' ' + marks.id + ' ' + feedback.id);
        const actions = document.createElement('div');
        actions.className = 'revision-actions';
        const check = document.createElement('button');
        check.type = 'button'; check.dataset.check = ''; check.textContent = 'Check answer';
        const next = document.createElement('button');
        next.type = 'button'; next.dataset.next = '';
        next.textContent = index === session.ids.length + bank.problems.filter(q => q.group === group).length ? 'Finish' : 'Continue';
        const solution = document.createElement('details'), summary = document.createElement('summary'), method = document.createElement('ol');
        solution.className = 'revision-solution'; solution.dataset.solution = '';
        summary.textContent = 'Show solution'; solution.append(summary, method);
        for (const step of q.solution) {
            const li = document.createElement('li'); li.textContent = step; method.append(li);
        }
        if (!retrieval) {
            const note = document.createElement('p');
            note.className = 'revision-small'; note.textContent = 'Typed calculations can earn working marks. Handwriting and unrecognised methods need review; they are not automatically wrong.';
            solution.append(note);
        }
        const links = document.createElement('div'); links.className = 'revision-lesson-links';
        for (const id of new Set([...q.prerequisites, bank.prerequisites[q.lesson]])) links.append(lessonLink(id));
        solution.append(links); solution.open = response.solutionOpen;
        // Retain previously saved working without making a new scratchpad feature.
        if (response.work) {
            const savedWork = document.createElement('p'); savedWork.className = 'revision-saved-work';
            savedWork.textContent = 'Your saved working: ' + response.work; solution.append(savedWork);
        }
        actions.append(check, next);
        const footer = document.createElement('div'); footer.className = 'revision-question-footer';
        footer.append(solution, actions);
        body.append(feedback, footer);
        article.append(body); el('questions').append(article);
        items.push({article, response, redraw: () => drawMarks(false), setActive(active) {
            if (active) showPaper(); else removePaper();
            article.hidden = !active;
        }});
        let workingDirty=response.markRevision!==response.workingRevision;
        const marksLayer=document.createElement('div');marksLayer.className='revision-mark-layer';marksLayer.setAttribute('aria-hidden','true');sheet.append(marksLayer);
        const working=window.NumberRevisionWorking?.mount(sheet,paper,q,response,assessmentChanged=>{
            if(!assessmentChanged){
                persist();
                if(response.markRevision>=0 && response.markRevision===response.workingRevision)markWorking(false);
                else drawMarks(false);
                return;
            }
            response.workingRevision++;response.methodComplete=false;workingDirty=true;
            response.finished=response.solution;
            invalidateSavedMark();
            marksLayer.replaceChildren();feedback.textContent='';paint();persist();
        },()=>drawMarks(false));
        function invalidateSavedMark(){
            const cleaned=readMarks();
            if(!(q.id in cleaned.marks) && !cleaned.damaged)return;
            delete cleaned.marks[q.id];save(group+':marks',cleaned.marks);
        }
        function tick(x,y,animate){
            const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 30 28');svg.classList.add('revision-mark-tick');
            if(animate)svg.classList.add('is-drawn');
            svg.style.left=x+'px';svg.style.top=y+'px';
            const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d','M3 14 Q8 18 10 23 Q18 9 27 3');svg.append(path);marksLayer.append(svg);
        }
        function drawMarks(animate=false, result=null){
            marksLayer.replaceChildren();
            if(!result && (response.markRevision<0 || response.markRevision!==response.workingRevision))return;
            const sheetRect=sheet.getBoundingClientRect();
            if(!sheetRect.width || !sheetRect.height)return;
            result ||= working?.assess() || {hits:[]};
            const scaleX=sheetRect.width/sheet.offsetWidth,scaleY=sheetRect.height/sheet.offsetHeight;
            const measure=document.createElement('canvas').getContext('2d');
            const ruler=!measure ? document.createElement('span') : null;
            if(ruler){
                Object.assign(ruler.style,{position:'absolute',visibility:'hidden',whiteSpace:'pre',pointerEvents:'none'});
                marksLayer.append(ruler);
            }
            const textWidth=(text,style)=>{
                if(measure){measure.font=style.font;return measure.measureText(text).width;}
                ruler.style.font=style.font;ruler.style.letterSpacing=style.letterSpacing;ruler.textContent=text;
                return ruler.getBoundingClientRect().width/scaleX;
            };
            const lineMarks=new Map();
            for(const hit of result.hits){
                const box=working.texts.querySelector('[data-id="'+hit.id+'"]');
                if(!box)continue;
                const field=box.querySelector('textarea'),r=field.getBoundingClientRect(),style=getComputedStyle(field);
                const lineHeight=parseFloat(style.lineHeight),paddingTop=parseFloat(style.paddingTop),paddingLeft=parseFloat(style.paddingLeft);
                const lineTop=paddingTop+hit.row*lineHeight-field.scrollTop;
                if(lineTop<paddingTop || lineTop+lineHeight>field.clientHeight-parseFloat(style.paddingBottom))continue;
                const width=textWidth(field.value.split('\n')[hit.row] || '',style);
                const end=paddingLeft+width-field.scrollLeft;
                const lineKey=hit.id+':'+hit.row,previous=lineMarks.get(lineKey)||0;
                lineMarks.set(lineKey,previous+1);
                const x=(r.left-sheetRect.left)/scaleX+Math.min(field.clientWidth+6,Math.max(paddingLeft,end)+8)+previous*26;
                const y=(r.top-sheetRect.top)/scaleY+parseFloat(style.borderTopWidth)+lineTop+(lineHeight-22)/2;
                tick(x,y,animate);
            }
            const finalEarned=response.correct && (result.finalEligible ?? q.marks===1);
            if(finalEarned){
                const r=input.getBoundingClientRect(),style=getComputedStyle(input);
                const width=textWidth(input.value,style);
                const end=(r.right-sheetRect.left)/scaleX-parseFloat(style.paddingRight);
                const x=sheet.classList.contains('has-paper') ? end-Math.min(width,input.clientWidth)-32 : ((q.unit ? unit.getBoundingClientRect().right : r.right)-sheetRect.left)/scaleX+10;
                tick(x,(r.top-sheetRect.top)/scaleY+(input.offsetHeight-22)/2,animate);
            }
            ruler?.remove();
        }
        function markWorking(animate=true,commit=true){
            const result=working?.assess() || {hits:[],supported:false,available:0};
            drawMarks(animate,result);
            const finalEarned=response.correct && (result.finalEligible ?? q.marks===1);
            const earned=result.hits.length+(finalEarned?1:0),unassessed=Math.max(0,q.marks-1-result.hits.length);
            const hasWorking=working?.hasInk() || working?.hasText();
            const needsReview=unassessed>0 && hasWorking;
            const missingWorking=response.correct && unassessed>0 && !hasWorking;
            response.methodComplete=earned===q.marks;
            const answerState=core.check(q,input.value);
            const summary=earned+' of '+q.marks+' '+(q.marks===1?'mark':'marks')+' verified.';
            feedback.dataset.markState=earned===q.marks?'full':answerState==='wrong'||answerState==='format'?'wrong':'partial';
            const heading=document.createElement('strong');
            heading.textContent=(earned===q.marks?'Full marks — ':answerState==='blank'?'Final answer needed — ':!response.correct?'Not full marks — ':missingWorking?'Working required — ':needsReview?'Working needs review — ':'Not full marks — ')+summary;
            const detailText=earned===q.marks ? ''
                : answerState==='blank' ? 'Enter the final answer.'
                : !response.correct ? core.feedback(q,input.value)
                : needsReview ? 'The answer is correct, but the method has not yet been recognised.'
                : missingWorking ? 'The answer is correct, but this question requires working.'
                : 'Not all marks have been verified.';
            feedback.replaceChildren(heading);
            if(detailText){const detail=document.createElement('span');detail.textContent=detailText;feedback.append(detail);}
            const markPoints=[...(result.criteria || []),{
                code:result.finalCode || 'B1',
                description:q.marks>1?'Accuracy following a valid method.':'Final answer.',
                earned:finalEarned,
                final:true
            }];
            for(const criterion of markPoints){
                const row=document.createElement('span');row.className='revision-mark-point';
                row.dataset.earned=String(criterion.earned);
                const description=criterion.description.replace(/\.$/,'');
                // A wrong final answer is definite. Unrecognised method work is
                // not: it may still deserve credit when a person reviews it.
                const awaitingReview=needsReview && (!criterion.final || response.correct);
                const outcome=criterion.earned?'awarded':awaitingReview?'not verified':'not awarded';
                row.dataset.outcome=outcome;
                const status=document.createElement('b');status.textContent=criterion.earned?'✓':outcome==='not awarded'?'×':'○';status.setAttribute('aria-hidden','true');
                const text=document.createElement('span');text.textContent=criterion.code+' · '+description+' — '+outcome+'.';
                row.append(status,text);feedback.append(row);
            }
            if(commit){response.markRevision=response.workingRevision;const all=readMarks().marks;all[q.id]={earned,total:q.marks,unassessed:needsReview?unassessed:0,missingWorking,answerCorrect:response.correct,at:Date.now()};save(group+':marks',all);}
            workingDirty=false;
        }
        function persist() {
            if (retrieval) {
                const first = session.ids.findIndex(id => !session.responses[id].finished);
                session.index = first < 0 ? session.ids.length : first;
                save(group + ':session', session);
            } else save(q.id, response);
        }
        function finish() {
            response.finished = true; persist();
        }
        function paint() {
            input.classList.toggle('is-accepted', response.correct);
            check.hidden = response.correct && !workingDirty;
            next.hidden = (!response.correct || workingDirty) && !response.solution;
            check.textContent = response.wrongCount ? 'Check again' : 'Check answer';
            check.setAttribute('aria-label', 'Check question ' + index);
        }
        function mark() {
            const checkedWithButton = document.activeElement === check;
            delete feedback.dataset.markState;
            marksLayer.replaceChildren();
            response.draft = input.value;
            const state = core.check(q, response.draft);
            if (state === 'wrong') response.wrongCount++;
            response.correct = state === 'correct';
            input.toggleAttribute('aria-invalid', state === 'wrong' || state === 'format');
            if (input.hasAttribute('aria-invalid')) input.setAttribute('aria-invalid', 'true');
            const hasWorking=(working?.assess().hits.length||0)>0 || working?.hasInk() || working?.hasText();
            // A check always receives the same legible mark panel. An empty or
            // malformed answer with no credited working is guidance, not an
            // attempted question, so do not persist a zero mark for it.
            markWorking(true,state==='correct'||state==='wrong'||hasWorking);
            paint();
            if (response.correct) finish(); else persist();
            if (response.correct && checkedWithButton && !response.methodComplete){feedback.tabIndex=-1;feedback.focus({preventScroll:true});}
            else if (response.correct && checkedWithButton) next.focus({preventScroll: true});
            else if (checkedWithButton) input.focus({preventScroll: true});
        }
        input.addEventListener('input', () => {
            response.markRevision=-1;
            response.draft = input.value; response.correct = false;
            response.finished = response.solution;
            invalidateSavedMark();
            input.removeAttribute('aria-invalid'); feedback.textContent = '';
            marksLayer.replaceChildren();
            paint(); persist();
        });
        let composing = false;
        input.addEventListener('compositionstart', () => { composing = true; });
        input.addEventListener('compositionend', () => { composing = false; });
        input.addEventListener('keydown', event => {
            if (event.key !== 'Enter' || event.repeat || event.isComposing || composing) return;
            event.preventDefault();
            if (response.correct && !workingDirty) next.click(); else mark();
        });
        check.addEventListener('click', () => { if (!composing) mark(); });
        next.addEventListener('click', () => {
            if ((response.correct && !workingDirty) || response.solution) showPosition(index, true);
        });
        summary.addEventListener('click', () => {
            response.solutionOpen = !solution.open;
            if (solution.open) { persist(); return; }
            response.solution = true; finish(); paint();
        });
        if(response.markRevision>=0 && !workingDirty)markWorking(false);
        paint();
    }
    function render() {
        session = getSession(); save(group + ':session', session);
        items = [];
        el('questions').replaceChildren();
        let index = 0;
        for (const id of session.ids) mount(byId[id], session.responses[id], ++index, true);
        for (const q of bank.problems.filter(q => q.group === group))
            mount(q, core.cleanResponse(read(q.id), q), ++index, false);
        const savedPosition = read(group + ':position');
        const firstUnfinished = items.findIndex(item => !item.response.finished);
        showPosition(savedPosition?.token === session.token && Number.isInteger(savedPosition.index) &&
            savedPosition.index >= 0 && savedPosition.index <= items.length ? savedPosition.index :
            firstUnfinished < 0 ? items.length : firstUnfinished);
        storageNote();
    }
    el('reset').addEventListener('click', () => {
        if (!confirm('Clear answers and revision history for this subtopic? Lesson progress and the other subtopic will stay unchanged.')) return;
        const keys = [...lessons.map(l => l.id), group + ':session', group + ':position', group + ':marks', ...bank.problems.filter(q => q.group === group).map(q => q.id)];
        remove(keys);
        render();
        if(storageOK){storageDamaged=false;markStoreDamaged=false;storageNote();}
        const input = host.querySelector('[data-answer]'); input.focus();
    });
    el('previous').addEventListener('click', () => showPosition(position - 1, true));
    host.hidden = false; render();
    window.addEventListener('resize',()=>items[position]?.redraw());
    document.fonts?.ready.then(()=>items[position]?.redraw());
    // Keep old incoming problem links useful without an intervening menu.
    const navigationType=performance.getEntriesByType('navigation')[0]?.type;
    if (location.hash === '#problems' && navigationType!=='reload' && navigationType!=='back_forward') showPosition(session.ids.length);
})();
