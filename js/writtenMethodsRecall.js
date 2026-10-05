/* Optional cumulative retrieval, independent of teaching progress. */
document.addEventListener("DOMContentLoaded", () => {
    const host = document.querySelector("[data-written-recall]");
    if (!host) return;
    const bank = window.WrittenMethodsRecallBank, page = host.dataset.writtenRecall;
    const key = "dm-written-methods-recall-v1:" + page;
    let state = {answers: {}, accepted: {}};
    try {
        const stored = JSON.parse(localStorage.getItem(key));
        if (stored && stored.answers && typeof stored.answers === "object" && !Array.isArray(stored.answers)) state = stored;
    } catch (_) { /* A blocked or damaged store does not prevent answering. */ }
    const save = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch (_) {} };
    const questions = bank.build(page);
    // Old records did not distinguish accepted answers from drafts.
    // Preserve their validated progress once; new drafts never auto-submit.
    if (!state.accepted || typeof state.accepted !== "object" || Array.isArray(state.accepted)) {
        state.accepted = Object.fromEntries(questions.flatMap((q, i) =>
            typeof state.answers[i] === "string" && bank.correct(q, state.answers[i]) ? [[i, true]] : []));
    }
    const heading = document.createElement("h2"); heading.textContent = "Mixed practice";
    const intro = document.createElement("p");
    intro.className = "recall-intro";
    intro.textContent = "Try these without looking back. Use figures in the number gaps.";
    const list = document.createElement("div");
    const status = document.createElement("span"); status.className = "roots-answer-notice";
    status.setAttribute("role", "status"); status.setAttribute("aria-atomic", "true");
    host.replaceChildren(heading, intro, list, status);
    host.hidden = false;
    let disposers = [];
    function render() {
        disposers.forEach(fn => fn()); disposers = [];
        list.replaceChildren();
        questions.forEach((q, i) => {
            const row = document.createElement("div"); row.className = "recall-question";
            if (q.type === "choice") row.classList.add("recall-question--reason");
            const line = document.createElement("p");
            const label = document.createElement(q.type === "choice" ? "span" : "label"); label.id = `recall-label-${i}`;
            label.innerHTML = q.prompt;
            const control = document.createElement(q.type === "choice" ? "span" : "input");
            control.id = `recall-answer-${i}`; label.htmlFor = control.id;
            control.setAttribute("aria-labelledby", label.id);
            if (q.type === "choice") {
                control.className = "recall-choices";
                control.setAttribute("role", "radiogroup");
                control.value = "";
                // Stable option order, varied between question positions.
                for (let j=0;j<q.choices.length;j++) {
                    const index=(j + i) % q.choices.length;
                    const option = document.createElement("label");
                    const radio = document.createElement("input");
                    radio.type = "radio"; radio.name = `recall-choice-${i}`; radio.value = String(index);
                    option.append(radio, document.createTextNode(q.choices[index]));
                    control.append(option);
                }
            } else {
                control.type = "text"; control.inputMode = q.type === "pair" ? "text" : "decimal";
                control.autocomplete = "off"; control.placeholder = "";
                if(q.type === "pair") control.className = "recall-pair";
            }
            const help = document.createElement("details"); help.hidden = true;
            const summary = document.createElement("summary"); summary.textContent = "Revisit";
            const explanation = document.createElement("p"); explanation.id = `recall-help-${i}`;
            help.append(summary, explanation);
            line.append(label, document.createTextNode(" "), control);
            if (q.unit) line.append(document.createTextNode(" " + q.unit));
            row.append(line, help); list.append(row);
            let acceptTimer, wrongTimer, clearTimer, composing = false, accepted = false;
            const clear = () => { clearTimeout(acceptTimer); clearTimeout(wrongTimer); clearTimeout(clearTimer); };
            disposers.push(clear);
            const accept = (restoring = false) => {
                if (accepted || !bank.correct(q, control.value)) return;
                accepted = true; clear();
                state.answers[i] = control.value; state.accepted[i] = true; save();
                const answer = document.createElement("span"); answer.className = "roots-accepted-answer";
                answer.tabIndex = -1;
                answer.textContent = q.type === "choice" ? q.choices[Number(control.value)] : q.type === "pair" ? `±${q.expected}` : String(q.expected).replace("-", "−");
                const focused = document.activeElement === control || control.contains(document.activeElement);
                control.replaceWith(answer); help.hidden = true;
                if (focused) answer.focus({preventScroll:true});
                if (!restoring) status.textContent = `Answer ${i+1} accepted.`;
            };
            const update = () => {
                clear(); control.classList.remove("recall-retry"); control.removeAttribute("aria-invalid");
                control.removeAttribute("aria-describedby"); help.hidden = true; help.open = false;
                state.answers[i] = control.value; save();
                if (composing || !control.value.trim()) return;
                if (bank.correct(q, control.value)) acceptTimer = setTimeout(() => accept(), 350);
                else wrongTimer = setTimeout(() => {
                    control.classList.add("recall-retry"); control.setAttribute("aria-invalid", "true");
                    explanation.textContent = bank.help(q, control.value); help.hidden = false;
                    control.setAttribute("aria-describedby", explanation.id);
                    status.textContent = `Check answer ${i+1}; a reminder is available.`;
                    clearTimer = setTimeout(() => control.classList.remove("recall-retry"), 1800);
                }, 1200);
            };
            control.addEventListener(q.type === "choice" ? "change" : "input", event => {
                if (q.type === "choice") control.value = event.target.value;
                update();
            });
            control.addEventListener("compositionstart", () => { composing = true; clear(); });
            control.addEventListener("compositionend", () => { composing = false; update(); });
            control.addEventListener("keydown", e => { if(e.key === "Enter" && q.type !== "choice" && !composing) { e.preventDefault(); accept(); } });
            control.value = typeof state.answers[i] === "string" ? state.answers[i] : "";
            if (q.type === "choice") control.querySelectorAll("input").forEach(radio => { radio.checked = radio.value === control.value; });
            if (state.accepted[i] === true) accept(true);
        });
    }
    document.addEventListener("click", e => {
        if (e.target.closest(".roots-reset")) { disposers.forEach(fn => fn()); try { localStorage.removeItem(key); } catch (_) {} }
    }, true);
    render();
});
