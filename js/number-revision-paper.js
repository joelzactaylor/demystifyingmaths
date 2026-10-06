/* Deterministic paper facsimiles, drawn locally at print resolution.
   No generated artwork, external fonts, tracking, or exam-board branding. */
(() => {
    'use strict';
    const width = 824, scale = 2;
    const font = '"Times New Roman", Times, serif';
    const marksFor = q => q.marks;
    function tokens(html) {
        const template = document.createElement('template');
        template.innerHTML = html;
        const result = [];
        function walk(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                for (const text of node.textContent.split(/(\s+)/).filter(Boolean))
                    result.push({kind: 'text', text: /^\s+$/.test(text) ? (text.includes('\u00a0') ? '      ' : ' ') : text});
                return;
            }
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            if (node.classList.contains('caret') || node.tagName === 'SVG') return;
            if (node.getAttribute('role') === 'math' && node.querySelector('.rad__over')) {
                result.push({kind: 'root', text: node.querySelector('.rad__over').textContent}); return;
            }
            if (node.tagName === 'SUP') { result.push({kind: 'sup', text: node.textContent, italic: !!node.querySelector('var')}); return; }
            if (node.tagName === 'VAR') { result.push({kind: 'var', text: node.textContent, italic: true}); return; }
            if (node.tagName === 'BR') { result.push({kind: 'break'}); return; }
            for (const child of node.childNodes) walk(child);
        }
        for (const child of template.content.childNodes) walk(child);
        return result;
    }
    function compose(q, number, rasterise) {
        const measure = document.createElement('canvas').getContext('2d');
        if (!measure) return null;
        const left = 43, right = width - 14, lineHeight = 29;
        const runs = [];
        let x = left, y = 32;
        function measureToken(token) {
            measure.font = (token.italic ? 'italic ' : '') + (token.kind === 'sup' ? 14 : 19) + 'px ' + font;
            return measure.measureText(token.text || '').width + (token.kind === 'root' ? 19 : 0);
        }
        function paragraph(html) {
            const parts = tokens(html);
            for (let i = 0; i < parts.length; i++) {
                const token = parts[i];
                if (token.kind === 'break') { x = left; y += lineHeight; continue; }
                const w = measureToken(token);
                // Keep an exponent with its base, including when it crosses a line.
                const following = parts[i + 1]?.kind === 'sup' ? measureToken(parts[i + 1]) : 0;
                if (x + w + following > right && x > left) { x = left; y += lineHeight; }
                if (x === left && token.text === ' ') continue;
                runs.push({...token, x, y, width: w}); x += w;
            }
            x = left; y += lineHeight + 10;
        }
        if (q.context) paragraph(q.context);
        paragraph(q.examPrompt);
        if(q.showWorking) paragraph('You must show your working.');
        const marks = marksFor(q);
        // A short one-mark item should not inherit the large blank working
        // area needed by a multi-step problem. Both sizes still accommodate
        // the complete toolbar and a typed calculation.
        const workingHeight = q.showWorking ? 270 : 160;
        const working = {left:43,top:y,width:767,height:workingHeight};
        const answerY = y + workingHeight + 30;
        const height = answerY + 58;
        const answerRight = right - (q.unit ? 28 : 0);
        const paper = {width, height, working,
            // Native Times input baseline sits nine pixels above its bottom.
            // Extend six pixels below the rule to align it with the printed unit.
            answer: {left: answerRight - 182, top: answerY - 22, width: 182, height: 28}};
        if (!rasterise) return paper;
        const canvas = document.createElement('canvas');
        canvas.width = width * scale; canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        ctx.scale(scale, scale);
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#111'; ctx.font = 'bold 19px ' + font;
        ctx.fillText(String(number), 12, 32);
        for (const run of runs) {
            ctx.font = (run.italic ? 'italic ' : '') + (run.kind === 'sup' ? 14 : 19) + 'px ' + font;
            if (run.kind === 'root') {
                ctx.save(); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.moveTo(run.x, run.y - 8); ctx.lineTo(run.x + 4, run.y - 10);
                ctx.lineTo(run.x + 8, run.y + 1); ctx.lineTo(run.x + 15, run.y - 20);
                ctx.lineTo(run.x + run.width, run.y - 20); ctx.stroke();
                ctx.fillText(run.text, run.x + 19, run.y); ctx.restore();
            } else ctx.fillText(run.text, run.x, run.y - (run.kind === 'sup' ? 8 : 0));
        }
        ctx.strokeStyle = '#555'; ctx.lineWidth = .7; ctx.setLineDash([.7, 2.6]);
        ctx.beginPath(); ctx.moveTo(answerRight - 182, answerY); ctx.lineTo(answerRight, answerY); ctx.stroke();
        ctx.setLineDash([]); ctx.font = '18px ' + font;
        if (q.answerPrefix) ctx.fillText(q.answerPrefix, answerRight - 198, answerY - 3);
        if (q.unit) ctx.fillText(q.unit, answerRight + 7, answerY - 3);
        ctx.font = 'bold 19px ' + font; ctx.textAlign = 'right';
        ctx.fillText('(Total for Question ' + number + ' is ' + marks + (marks === 1 ? ' mark)' : ' marks)'), right - 65, answerY + 40);
        ctx.strokeStyle = '#aaa'; ctx.lineWidth = .6;
        ctx.beginPath(); ctx.moveTo(12, height - 10); ctx.lineTo(right, height - 10); ctx.stroke();
        paper.url = canvas.toDataURL('image/png');
        return paper;
    }
    const layout = (q, number) => compose(q, number, false);
    const render = (q, number) => compose(q, number, true);
    window.NumberRevisionPaper = {layout, render};
})();
