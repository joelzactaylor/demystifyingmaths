/* Pure, testable revision rules. Intervals are a simple product policy, not
   an estimate of ability or a claim of scientifically optimal scheduling. */
(() => {
    'use strict';
    const day = 86400000, intervals = [1, 3, 7, 14, 30];
    const object = value => value && typeof value === 'object' && !Array.isArray(value);
    const decimalKey = value => {
        let s = String(value).trim().replace(/−/g, '-');
        if (/^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d*)?$/.test(s)) s = s.replace(/,/g, '');
        if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s) || !Number.isFinite(Number(s))) return null;
        const negative = s.startsWith('-');
        const [whole, fraction = ''] = s.replace(/^[+-]/, '').split('.');
        const integer = whole.replace(/^0+/, '') || '0', decimal = fraction.replace(/0+$/, '');
        return (negative && (integer !== '0' || decimal) ? '-' : '') + integer + (decimal ? '.' + decimal : '');
    };
    const number = value => decimalKey(value) === null ? null : Number(decimalKey(value));
    // Compare decimal digits, not rounded IEEE-754 values.
    const check = (q, raw) => !String(raw).trim() ? 'blank' : decimalKey(raw) === null ? 'format' : decimalKey(raw) === decimalKey(q.expected) ? 'correct' : 'wrong';
    const feedback = (q, raw) => {
        const state = check(q, raw), n = number(raw);
        if (state === 'blank') return 'Enter an answer before checking.';
        if (state === 'format') return 'Enter your answer in figures, with a decimal point if needed.' + (q.unit || q.answerPrefix ? ' The units are already shown.' : '');
        if (state === 'correct') return '';
        if (q.mistakes?.[n]) return q.mistakes[n];
        if (q.expected && n === -q.expected) return 'Check the sign of your answer. ' + q.hint;
        if (q.expected && [10, 100, 1000].some(f => n === q.expected * f || n === q.expected / f))
            return 'Your entry differs by a power of ten. Check its place value. ' + q.hint;
        return q.hint;
    };
    const record = value => object(value) && Number.isFinite(value.due) && value.due >= 0 && value.due <= 8.64e15 &&
        Number.isInteger(value.step) && value.step >= 0 && value.step <= intervals.length &&
        [0,1].includes(value.variant) ? value : null;
    const schedule = (previous, independent, variant, now) => {
        const step = independent ? Math.min((record(previous)?.step || 0) + 1, intervals.length) : 0;
        return {step, variant, reviewed: now, due: now + day * (independent ? intervals[step - 1] : 1), outcome: independent ? 'independent' : 'supported'};
    };
    const queue = (ids, records, now, limit = 6) => ids
        .filter(id => !record(records[id]) || records[id].due <= now)
        .sort((a,b) => (record(records[a])?.due || 0) - (record(records[b])?.due || 0))
        .slice(0, limit).map(id => id + ':' + (record(records[id]) ? 1 - records[id].variant : 0));
    const restoreSession = (value, bank, group) => {
        if (!object(value) || !Array.isArray(value.ids) || !value.ids.length || value.ids.length > 6 ||
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
        const attempts = Number.isInteger(r.attempts) && r.attempts >= 0 ? r.attempts : 0;
        const wrongCount = Number.isInteger(r.wrongCount) && r.wrongCount >= 0 && r.wrongCount <= attempts ? r.wrongCount : Math.max(0, attempts - (correct ? 1 : 0));
        return {draft, attempts, wrongCount, helped: r.helped === true, hint: r.hint === true, solution: r.solution === true,
            solutionOpen: r.solutionOpen === undefined ? r.solution === true : r.solutionOpen === true && r.solution === true,
            correct, finished: r.finished === true && (correct || r.solution === true),
            work: typeof r.work === 'string' ? r.work.slice(0, 10000) : ''};
    }
    const independent = response => response.correct && response.wrongCount === 0 && !response.helped;
    window.NumberRevisionCore = {day, intervals, number, check, feedback, record, schedule, queue, restoreSession, cleanResponse, independent};
})();
