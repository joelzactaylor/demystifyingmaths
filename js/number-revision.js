/* Guided exam-style revision: one complete question, with no setup screen. */
(() => {
    'use strict';
    const host = document.querySelector('[data-number-revision]');
    if (!host) return;
    const bank = window.NumberRevisionBank, core = window.NumberRevisionCore;
    const group = host.dataset.numberRevision, prefix = 'dm-number-revision-v1:';
    const lessons = bank.groups[group].map(([id]) => bank.lessons[id]);
    const byId = Object.fromEntries(bank.questions.map(q => [q.id, q]));
    const memory = new Map();
    let storageOK = true, session, position = 0;
    let items = [];
    const el = name => host.querySelector('[data-' + name + ']');
    function read(key) {
        if (memory.has(key)) return memory.get(key);
        try { return JSON.parse(localStorage.getItem(prefix + key)); }
        catch (_) { return null; }
    }
    function storageNote() {
        el('storage').hidden = storageOK;
        el('storage').textContent = storageOK ? '' : 'Answers cannot be saved in this browser. They will remain available while this tab is open.';
    }
    function save(key, value) {
        memory.set(key, value);
        try { localStorage.setItem(prefix + key, JSON.stringify(value)); }
        catch (_) { storageOK = false; }
        storageNote();
    }
    try { const key = prefix + 'test'; localStorage.setItem(key, '1'); localStorage.removeItem(key); }
    catch (_) { storageOK = false; }
    function getSession() {
        const previous = core.restoreSession(read(group + ':session'), bank, group);
        const records = Object.fromEntries(lessons.map(l => [l.id, core.record(read(l.id))]));
        // Keep a completed sheet for the day, not a new round on every reload.
        const dueAgain = previous && previous.ids.every(id => previous.responses[id].finished) &&
            bank.problems.filter(q => q.group === group).every(q => core.cleanResponse(read(q.id), q).finished) &&
            previous.ids.some(id => records[byId[id].lesson]?.due <= Date.now());
        if (previous && !dueAgain) return previous;
        if (dueAgain) {
            for (const q of bank.problems.filter(q => q.group === group)) {
                const old = core.cleanResponse(read(q.id), q);
                save(q.id, {...core.cleanResponse(null, q), previousAttempt: old});
            }
        }
        let chosen = lessons.filter(l => window.CurriculumProgress?.read(l.url.replace('/demystifyingmaths', '')).complete).map(l => l.id);
        if (!chosen.length) chosen = lessons.map(l => l.id);
        const due = core.queue(chosen, records, Date.now());
        const ids = due.length ? due : core.queue(chosen, records, Infinity);
        return {ids, index: 0, token: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2),
            responses: Object.fromEntries(ids.map(id => [id, core.cleanResponse(null, byId[id])]))};
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
        items.forEach((item, i) => { item.article.hidden = i !== position; });
        el('complete').hidden = position !== items.length;
        el('complete').querySelector('p').textContent = storageOK ? 'Your answers are saved on this device.' : 'Answers will remain available while this tab is open.';
        el('position').textContent = position === items.length ? 'Complete' : 'Question ' + (position + 1) + ' of ' + items.length;
        el('progress').max = items.length;
        el('progress').value = items.filter(item => item.response.finished).length;
        const forward = items[position]?.article.querySelector('[data-next]');
        if (forward) forward.textContent = position === items.length - 1 &&
            items.slice(0, -1).every(item => item.response.finished) ? 'Finish' : 'Continue';
        el('previous').hidden = position === 0;
        save(group + ':position', {token: session.token, index: position});
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
        const transcript = document.createElement('div');
        transcript.className = 'revision-paper-text';
        const marks = document.createElement('p');
        marks.textContent = q.marks + (q.marks === 1 ? ' suggested mark.' : ' suggested marks.');
        transcript.append(heading, context, task, marks);
        let paper;
        const sheet = document.createElement('div');
        sheet.className = 'revision-paper';
        article.append(sheet);
        try { paper = window.NumberRevisionPaper?.render(q, index); } catch (_) { /* readable HTML fallback */ }
        if (paper) {
            const image = document.createElement('img');
            image.className = 'revision-paper-image'; image.alt = '';
            image.setAttribute('aria-hidden', 'true');
            image.width = paper.width; image.height = paper.height;
            image.addEventListener('error', () => {
                image.remove(); transcript.classList.remove('revision-announcement');
                sheet.classList.remove('has-paper');
            });
            image.src = paper.url;
            transcript.classList.add('revision-announcement');
            sheet.append(image);
            sheet.classList.add('has-paper');
        }
        sheet.append(transcript);
        const gap = document.createElement('p'), label = document.createElement('label'), input = document.createElement('input'), unit = document.createElement('span');
        gap.className = 'revision-gap';
        label.textContent = q.answerForm === 'decimal' ? 'Answer as a decimal' : 'Answer in figures';
        input.id = article.id + '-answer'; label.htmlFor = input.id;
        input.type = 'text'; input.inputMode = 'decimal'; input.autocomplete = 'off'; input.maxLength = 100;
        input.dataset.answer = ''; input.value = response.draft;
        input.placeholder = label.textContent;
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
        sheet.append(gap);
        const feedback = document.createElement('p');
        feedback.className = 'revision-feedback'; feedback.id = article.id + '-feedback';
        feedback.setAttribute('role', 'status');
        input.setAttribute('aria-describedby', (q.context ? context.id + ' ' : '') + task.id + ' ' + feedback.id);
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
            note.className = 'revision-small'; note.textContent = 'Only the final answer is checked automatically.';
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
        items.push({article, response});
        function persist() {
            if (retrieval) {
                const first = session.ids.findIndex(id => !session.responses[id].finished);
                session.index = first < 0 ? session.ids.length : first;
                save(group + ':session', session);
            } else save(q.id, response);
        }
        function finish() {
            if (!response.finished && retrieval) {
                const previous = core.record(read(q.lesson));
                if (previous?.session !== session.token) {
                    const early = previous && previous.due > Date.now() && core.independent(response);
                    save(q.lesson, {...(early ? {...previous, variant: q.variant} : core.schedule(previous, core.independent(response), q.variant, Date.now())), session: session.token});
                }
            }
            response.finished = true; persist();
            el('progress').value = items.filter(item => item.response.finished).length;
        }
        function paint() {
            input.classList.toggle('is-accepted', response.correct);
            article.classList.toggle('is-answered', response.correct);
            check.hidden = response.correct;
            next.hidden = !response.correct && !response.solution;
            check.textContent = response.wrongCount ? 'Check again' : 'Check answer';
            check.setAttribute('aria-label', 'Check question ' + index);
        }
        function mark() {
            const checkedWithButton = document.activeElement === check;
            response.draft = input.value;
            const state = core.check(q, response.draft);
            if (!response.correct && ['correct', 'wrong'].includes(state)) response.attempts++;
            if (state === 'wrong') response.wrongCount++;
            response.correct = state === 'correct';
            input.toggleAttribute('aria-invalid', state === 'wrong' || state === 'format');
            if (input.hasAttribute('aria-invalid')) input.setAttribute('aria-invalid', 'true');
            feedback.textContent = core.feedback(q, response.draft);
            el('announcement').textContent = response.correct ? 'Question ' + index + ': answer accepted.' : '';
            paint();
            if (response.correct) finish(); else persist();
            if (response.correct && checkedWithButton) next.focus({preventScroll: true});
            else if (checkedWithButton) input.focus({preventScroll: true});
        }
        input.addEventListener('input', () => {
            response.draft = input.value; response.correct = false;
            response.finished = response.solution;
            el('progress').value = items.filter(item => item.response.finished).length;
            input.removeAttribute('aria-invalid'); feedback.textContent = '';
            paint(); persist();
        });
        let composing = false;
        input.addEventListener('compositionstart', () => { composing = true; });
        input.addEventListener('compositionend', () => { composing = false; });
        input.addEventListener('keydown', event => {
            if (event.key !== 'Enter' || event.repeat || event.isComposing || composing) return;
            event.preventDefault();
            if (response.correct) next.click(); else mark();
        });
        check.addEventListener('click', () => { if (!composing) mark(); });
        next.addEventListener('click', () => {
            if (response.correct || response.solution) showPosition(index, true);
        });
        summary.addEventListener('click', () => {
            response.solutionOpen = !solution.open;
            if (solution.open) { persist(); return; }
            response.solution = true; if (!response.correct) response.helped = true; finish(); paint();
        });
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
        const keys = [...lessons.map(l => l.id), group + ':session', group + ':position', ...bank.problems.filter(q => q.group === group).map(q => q.id)];
        for (const key of keys) {
            memory.set(key, null);
            try { localStorage.removeItem(prefix + key); } catch (_) { storageOK = false; }
        }
        render();
        const input = host.querySelector('[data-answer]'); input.focus();
    });
    el('previous').addEventListener('click', () => showPosition(position - 1, true));
    host.hidden = false; render();
    // Keep old incoming problem links useful without an intervening menu.
    if (location.hash === '#problems') showPosition(session.ids.length);
})();
