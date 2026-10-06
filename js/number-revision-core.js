/* Pure, testable answer and saved-state rules for the fixed practice papers. */
(() => {
    'use strict';
    const object = value => value && typeof value === 'object' && !Array.isArray(value);
    const decimalKey = value => {
        let s = String(value).trim().replace(/−/g, '-');
        if (/^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d*)?$/.test(s)) s = s.replace(/,/g, '');
        else if (/^[+-]?\d{1,3}(?:[ \u00a0\u202f]\d{3})+(?:\.\d*)?$/.test(s)) s = s.replace(/[ \u00a0\u202f]/g, '');
        if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s) || !Number.isFinite(Number(s))) return null;
        const negative = s.startsWith('-');
        const [whole, fraction = ''] = s.replace(/^[+-]/, '').split('.');
        const integer = whole.replace(/^0+/, '') || '0', decimal = fraction.replace(/0+$/, '');
        return (negative && (integer !== '0' || decimal) ? '-' : '') + integer + (decimal ? '.' + decimal : '');
    };
    const number = value => decimalKey(value) === null ? null : Number(decimalKey(value));
    const powerOfTenDifference = (actual, expected) => {
        if (!Number.isFinite(actual) || !Number.isFinite(expected) || actual === 0 || expected === 0 || Math.sign(actual) !== Math.sign(expected)) return null;
        const ratio = Math.abs(actual / expected);
        for (const factor of [10,100,1000]) {
            if (Math.abs(ratio-factor)<=factor*1e-12) return {factor,direction:'large'};
            if (Math.abs(ratio-1/factor)<=1/factor*1e-12) return {factor,direction:'small'};
        }
        return null;
    };
    // Compare decimal digits, not rounded IEEE-754 values.
    const check = (q, raw) => !String(raw).trim() ? 'blank' : decimalKey(raw) === null ? 'format' : decimalKey(raw) === decimalKey(q.expected) ? 'correct' : 'wrong';
    const feedback = (q, raw) => {
        const state = check(q, raw), n = number(raw);
        if (state === 'blank') return 'Enter an answer before checking.';
        if (state === 'format') return 'Enter your answer in figures, with a decimal point if needed.' + (q.unit || q.answerPrefix ? ' The units are already shown.' : '');
        if (state === 'correct') return '';
        if (q.mistakes?.[n]) return q.mistakes[n];
        if (q.expected && n === -q.expected) return 'Check the sign of your answer. ' + q.hint;
        const placeValueError=powerOfTenDifference(n,Number(q.expected));
        if (placeValueError)
            return 'Your answer is '+placeValueError.factor.toLocaleString('en-GB')+' times too '+placeValueError.direction+'. Check its place value. '+q.hint;
        return q.hint;
    };
    // Marks are read by both the paper and its menu card. Keep their schema in
    // one place so damaged storage cannot produce two different summaries.
    const markRecord = (value, q) => {
        if (!object(value) || !q || value.total !== q.marks || !Number.isInteger(value.earned) ||
            value.earned < 0 || value.earned > q.marks) return null;
        const answerCorrect = value.answerCorrect === true;
        const unassessed = value.unassessed === undefined ? 0 : value.unassessed;
        const missingWorking = value.missingWorking === true;
        const reviewLimit=Math.min(q.marks-value.earned,q.marks-1);
        if (!Number.isInteger(unassessed) || unassessed < 0 || unassessed > reviewLimit ||
            (missingWorking && (!answerCorrect || q.marks===1 || value.earned!==0)) ||
            (unassessed > 0 && missingWorking)) return null;
        return {earned:value.earned,total:q.marks,unassessed,missingWorking,answerCorrect,
            at:Number.isFinite(value.at) && value.at >= 0 && value.at <= 8.64e15 ? value.at : 0};
    };
    const restoreSession = (value, bank, group) => {
        if (!object(value) || !Array.isArray(value.ids) || !value.ids.length || value.ids.length > bank.questions.length ||
            new Set(value.ids).size !== value.ids.length || !Number.isInteger(value.index) || value.index < 0 || value.index > value.ids.length ||
            !value.ids.every(id => bank.questions.some(q => q.id === id && bank.lessons[q.lesson].group === group))) return null;
        const responses = {};
        for (const id of value.ids) {
            const r = value.responses?.[id], q = bank.questions.find(q => q.id === id);
            responses[id] = cleanResponse(r, q);
        }
        // A damaged record must not silently skip an unanswered item.
        const first = value.ids.findIndex(id => !responses[id].finished);
        const token = typeof value.token === 'string' && value.token.length <= 160 ? value.token : 'legacy:' + value.ids.join(',');
        return {ids: value.ids, index: first === -1 ? value.ids.length : Math.min(value.index, first), responses, token};
    };
    function cleanResponse(r, q) {
        if (!object(r)) r = {};
        const draft = typeof r.draft === 'string' ? r.draft.slice(0, 100) : '';
        const correct = r.correct === true && check(q, draft) === 'correct';
        const wrongCount = Number.isInteger(r.wrongCount) && r.wrongCount >= 0 ? r.wrongCount : 0;
        const solution = r.solution === true,
            workingRevision = Number.isSafeInteger(r.workingRevision) && r.workingRevision>=0 ? r.workingRevision : 0,
            markRevision = Number.isSafeInteger(r.markRevision) && r.markRevision>=0 ? r.markRevision : -1;
        return {draft, wrongCount, solution,
            solutionOpen: r.solutionOpen === undefined ? solution : r.solutionOpen === true && solution,
            correct, finished: r.finished === true && (correct || solution) && (solution || markRevision === workingRevision),
            scratch: cleanScratch(r.scratch),
            workingRevision, markRevision,
            methodComplete: typeof r.methodComplete==='boolean' ? r.methodComplete : undefined,
            work: typeof r.work === 'string' ? r.work.slice(0, 10000) : ''};
    }
    function cleanScratch(s) {
        const point = p => Array.isArray(p) && p.length===2 && p.every(Number.isFinite) && p[0]>=0 && p[0]<=760 && p[1]>=0 && p[1]<=200;
        const strokes=[];let pointsLeft=4000;
        for(const value of Array.isArray(s?.strokes) ? s.strokes.slice(0,200) : []){
            if(!Array.isArray(value) || !pointsLeft)continue;
            const stroke=value.slice(0,Math.min(1000,pointsLeft)).filter(point);
            if(!stroke.length)continue;
            strokes.push(stroke);pointsLeft-=stroke.length;
        }
        const texts=[],ids=new Set();
        for(const value of Array.isArray(s?.texts) ? s.texts.slice(0,12) : []){
            if(!value || typeof value.id!=='string' || !/^[a-z0-9]+$/i.test(value.id) || !Number.isFinite(value.x) || !Number.isFinite(value.y) || typeof value.text!=='string')continue;
            const id=value.id.slice(0,50);
            if(ids.has(id))continue;
            ids.add(id);
            // The mounted question applies its own vertical limit: zero for a
            // short working area and 90 for a full show-working area.
            texts.push({id,x:Math.max(0,Math.min(390,value.x)),y:Math.max(0,Math.min(90,value.y)),text:value.text.slice(0,1500)});
        }
        return {strokes,texts};
    }
    window.NumberRevisionCore = {number, check, feedback, markRecord, restoreSession, cleanResponse};
})();
