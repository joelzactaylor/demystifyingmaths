/* Inline questions and live examples for indexNotation. */
window.IndexNotationBank = {
buildRound() { return [[0,"In 5⁴, the base is",5,"base",5,4],[0,"To write 4 × 4 × 4 × 4 as a power of 4, the index is",4,"count",4,4],[1,"3³ =",27,"value",3,3],[1,"2⁵ =",32,"value",2,5],[2,"The value of 7² is",49,"value",7,2],[2,"The value of 5³ is",125,"value",5,3],[3,"In 3 × 5 × 3 × 5 × 3, the index on the 3 is",3,"count",3,3],[3,"The index on the 5 in the same product is",2,"count",5,2]].map(([stage,prompt,expected,kind,base,index],i)=>({
stage,prompt,expected,kind,base,index,mode:"number",expression:"",title:prompt,factKey:String(i),hints:["Check the factors and what the missing number represents."],steps:[]
})); },
evaluateResponse(q,answer) {
const raw=String(answer).trim().replace(/−/g,"-");
if(!raw)return {state:"blank",text:""};
if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw))return {state:"unreadable",text:""};
return {state:Number(raw)===q.expected?"correct":"wrong",text:""};
},
explainMistake(q,answer) {
const state=this.evaluateResponse(q,answer).state;
if(state==="correct"||state==="blank")return "";
if(state==="unreadable")return "Write the missing number, not a calculation or a whole power.";
const n=Number(String(answer).replace(/−/g,"-"));
if(q.kind==="base")return n+" is not the base here. The base is the full-sized number being multiplied; the raised number counts its copies.";
if(q.kind==="count")return "An index of "+n+" would mean "+n+" factors of "+q.base+". Count the "+q.base+"s, not the multiplication signs.";
if(q.kind==="value") {
 if(n===q.base*q.index)return n+" is "+q.base+" × "+q.index+". A power means multiplying "+q.index+" copies of "+q.base+" instead.";
 return "The value isn't "+n+". Write "+q.index+" factors of "+q.base+" and multiply them one at a time.";
}
if(q.kind==="root")return "Check "+n+" by multiplying "+q.index+" copies of it. The result needs to be "+q.base**q.index+".";
if(q.kind==="exponent") {
 if(!Number.isInteger(n)||n<1)return "The index here is a positive whole number: count how many copies of "+q.base+" make "+q.base**q.index+".";
 const v=q.base**n;
 return (Number.isFinite(v)&&n<15 ? q.base+" to the power of "+n+" gives "+v+", not "+q.base**q.index+". " : "")+"Start with "+q.base+" and multiply by "+q.base+" until you reach "+q.base**q.index+"; count the factors.";
}
return "Check "+n+" cubed, then the cube of the next whole number. The two neighbouring cubes must enclose 100; the missing side is "+(q.kind==="lower"?"below":"above")+" 100.";
}
};
document.addEventListener("DOMContentLoaded", () => {
    const main = document.querySelector(".lesson-main");
    const acceptanceNotice = document.createElement("span");
    acceptanceNotice.className = "roots-answer-notice";
    acceptanceNotice.setAttribute("role", "status");
    acceptanceNotice.setAttribute("aria-atomic", "true");
    main.appendChild(acceptanceNotice);
    const answerKey = "dm-index-notation-accepted-v1";
    const readingKey = "dm-index-notation-reading-v1";
    let continued = {};
    try { continued = JSON.parse(localStorage.getItem(readingKey) || "{}") || {}; } catch (_) {}
    let restoringAnswer = false;
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(answerKey) || "{}") || {}; } catch (_) {}
    const revealButton = main.querySelector(".lesson-flowbar__toggle");
    const menu = document.querySelector("#page-nav-container .page-nav");
    if (revealButton && menu) {
        menu.appendChild(revealButton);
        main.querySelector(".lesson-flowbar").hidden = true;
        const reset = document.createElement("button");
        reset.type = "button";
        reset.className = "lesson-flowbar__toggle roots-reset";
        reset.textContent = "Reset lesson";
        reset.addEventListener("click", () => {
            try {
                localStorage.removeItem(answerKey);
                localStorage.removeItem(readingKey);
                localStorage.removeItem("dm-index-notation-number-v1");
                localStorage.removeItem("dm-lesson-progress:" + location.pathname);
            } catch (_) {}
            location.replace(location.pathname + location.search);
        });
        revealButton.after(reset);
        // Keep the same controls reachable when the desktop rail has no room.
        const wide = matchMedia("(min-width: 1252px)");
        const placeControls = () => {
            const bar = main.querySelector(".lesson-flowbar");
            (wide.matches ? menu : bar).append(revealButton, reset);
            bar.hidden = wide.matches;
        };
        wide.addEventListener("change", placeControls);
        placeControls();
    }
    // A completed question reveals its follow-on explanation before the next idea.
    const readingSteps = new Map();
    main.querySelectorAll("[data-lesson-check]").forEach(root => {
        if (!root.nextElementSibling) return;
        const tail = document.createElement("div");
        tail.className = "roots-reading-step";
        while (root.nextElementSibling) tail.appendChild(root.nextElementSibling);
        root.after(tail);
        const next = document.createElement("button");
        next.type = "button";
        next.className = "roots-continue";
        next.textContent = "Continue";
        const isEnding = root.closest("section").nextElementSibling?.classList.contains("lesson-actions");
        if (!isEnding) tail.appendChild(next);
        readingSteps.set(root, {tail, next});
        next.addEventListener("click", () => {
            continued[root.dataset.lessonCheck] = true;
            try { localStorage.setItem(readingKey, JSON.stringify(continued)); } catch (_) {}
            next.hidden = true;
            root.dispatchEvent(new CustomEvent("lessoncheckcomplete", {bubbles: true}));
            const following = root.closest("section").nextElementSibling;
            const heading = following?.querySelector("h1");
            if (heading && !following.hidden) {
                heading.tabIndex = -1;
                heading.focus({preventScroll: true});
                heading.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start"});
            }
        });
    });
    const updateReadingSteps = (animate = false) => {
        const all = revealButton?.getAttribute("aria-pressed") === "true";
        readingSteps.forEach(({tail, next}, root) => {
            const complete = !!root.querySelector(".lesson-check__complete");
            const visible = all || complete || continued[root.dataset.lessonCheck];
            if (animate && visible && tail.hidden) tail.classList.add("roots-revealed");
            tail.hidden = !visible;
            next.hidden = all || !complete || !!continued[root.dataset.lessonCheck];
        });
    };
    main.addEventListener("lessoncheckcomplete", event => {
        if (!readingSteps.has(event.target)) return;
        updateReadingSteps(!restoringAnswer);
        const isEnding = event.target.closest("section").nextElementSibling?.classList.contains("lesson-actions");
        if (!isEnding && !continued[event.target.dataset.lessonCheck]) event.stopImmediatePropagation();
    }, true);
    document.addEventListener("lessonflowchange", () => {
        updateReadingSteps();
        const all = revealButton?.getAttribute("aria-pressed") === "true";
        main.querySelectorAll("[data-lesson-check]").forEach(root => {
            root.dispatchEvent(new CustomEvent("lessonquestionsvisibility", {detail: {all}}));
        });
    });
    updateReadingSteps();
    // Answer gaps live inside the sentence and accept a valid answer as typed.
    const integrateTurns = () => {
        main.querySelectorAll(".lesson-check__check").forEach(button => {
            if (!button.disabled && button.textContent !== "Check") button.textContent = "Check";
        });
        main.querySelectorAll(".lesson-check__turn:not([data-integrated])").forEach(turn => {
            turn.dataset.integrated = "true";
            const response = turn.querySelector(".lesson-check__response");
            const prompt = turn.querySelector(".lesson-check__prompt");
            if (!response || !prompt) return;
            const check = response.querySelector(".lesson-check__check");
            const inline = document.createElement("span");
            inline.className = response.className;
            while (response.firstChild) inline.appendChild(response.firstChild);
            response.replaceWith(inline);
            const expression = prompt.querySelector(".lesson-check__expression");
            if (expression) {
                const equation = document.createElement("span");
                equation.className = "roots-inline-equation";
                expression.replaceWith(equation);
                equation.append(expression, inline);
            } else {
                prompt.append(" ", inline);
            }
            const input = inline.querySelector("input");
            if (input) {
                input.placeholder = "";
                input.setAttribute("aria-label", prompt.textContent.trim().replace(/Check$/, "").trim());
                const root = turn.closest("[data-lesson-check]");
                const index = Array.from(root.querySelectorAll(".lesson-check__turn")).indexOf(turn);
                const question = window.IndexNotationBank.buildRound()
                    .filter(q => q.stage === Number(root.dataset.lessonCheck))[index];
                const key = root.dataset.lessonCheck + ":" + index;
                window.LessonSession?.bindDraft(input, key);
                const reminder = document.createElement("details");
                reminder.className = "roots-revisit roots-question-reminder";
                reminder.hidden = true;
                const reminderLabel = document.createElement("summary");
                reminderLabel.textContent = "Revisit the idea";
                const reminderText = document.createElement("p");
                reminder.append(reminderLabel, reminderText);
                turn.appendChild(reminder);
                let incorrectTimer, cueTimer, composing = false;
                const notice = document.createElement("span");
                notice.className = "roots-answer-notice";
                notice.setAttribute("role", "status");
                inline.appendChild(notice);
                const clearCue = () => {
                    clearTimeout(incorrectTimer);
                    clearTimeout(cueTimer);
                    input.classList.remove("roots-answer-retry");
                    input.removeAttribute("aria-invalid");
                    notice.textContent = "";
                };
                const indicateIncorrect = () => {
                    if (input.readOnly || !input.value.trim()) return;
                    if (window.IndexNotationBank.evaluateResponse(question, input.value).state === "correct") return;
                    input.classList.add("roots-answer-retry");
                    input.setAttribute("aria-invalid", "true");
                    notice.textContent = "Not quite. Try another answer.";
                    reminderText.textContent = window.IndexNotationBank.explainMistake(question, input.value);
                    reminder.hidden = false;
                    cueTimer = setTimeout(clearCue, 1800);
                };
                const finish = (restoring = false) => {
                    if (input.readOnly || composing) return;
                    if (window.IndexNotationBank.evaluateResponse(question, input.value).state !== "correct") return;
                    clearCue();
                    reminder.hidden = true;
                    const existingTurns = new Set(root.querySelectorAll(".lesson-check__turn"));
                    restoringAnswer = restoring;
                    try { check.click(); } finally { restoringAnswer = false; }
                    if (!restoring) root.querySelectorAll(".lesson-check__turn").forEach(next => {
                        if (!existingTurns.has(next)) next.classList.add("roots-revealed");
                    });
                    input.readOnly = true;
                    input.setAttribute("aria-label", prompt.textContent.replace(/Correct$/, "").trim() + " Answer accepted.");
                    const accepted = document.createElement("span");
                    accepted.className = "roots-accepted-answer";
                    accepted.textContent = input.value.trim().replace(/-/g, "−");
                    const hadFocus = document.activeElement === input;
                    input.hidden = true;
                    input.insertAdjacentElement("afterend", accepted);
                    if (hadFocus) {
                        accepted.tabIndex = -1;
                        accepted.focus({preventScroll: true});
                    }
                    if (!restoring) {
                        acceptanceNotice.textContent = "";
                        requestAnimationFrame(() => {
                            acceptanceNotice.textContent = `Answer ${accepted.textContent} accepted. Continue reading for the next step.`;
                        });
                    }
                    saved[key] = input.value;
                    window.LessonSession?.forgetDraft(key);
                    try { localStorage.setItem(answerKey, JSON.stringify(saved)); } catch (_) {}
                };
                let acceptance;
                const acceptAnswer = (event) => {
                    clearTimeout(acceptance);
                    clearCue();
                    reminder.hidden = true;
                    reminderText.textContent = "";
                    if (composing || event.isComposing) return;
                    acceptance = setTimeout(() => {
                        finish();
                    }, 250);
                    incorrectTimer = setTimeout(indicateIncorrect, 1200);
                };
                input.addEventListener("input", acceptAnswer);
                input.addEventListener("compositionstart", () => {
                    composing = true;
                    clearTimeout(acceptance);
                    clearCue();
                    reminder.hidden = true;
                });
                input.addEventListener("compositionend", event => {
                    composing = false;
                    acceptAnswer(event);
                });
                // Handle Enter before the shared editable-answer handler.
                input.addEventListener("keydown", event => {
                    if (event.key !== "Enter") return;
                    if (composing || event.isComposing || event.keyCode === 229) {
                        event.stopImmediatePropagation();
                        return;
                    }
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    clearTimeout(acceptance);
                    clearCue();
                    finish();
                    indicateIncorrect();
                }, true);
                if (typeof saved[key] === "string") {
                    input.value = saved[key];
                    // Defer so the observer can initialise the revealed question.
                    queueMicrotask(() => finish(true));
                }
            }
        });
    };
    integrateTurns();
    new MutationObserver(integrateTurns).observe(main, {childList: true, subtree: true});
    const seen = new WeakSet();
    main.querySelectorAll(":scope > section").forEach(section => {
        if (!section.hidden) seen.add(section);
    });
    document.addEventListener("lessonflowchange", () => {
        main.querySelectorAll(":scope > section").forEach(section => {
            if (section.hidden || seen.has(section)) return;
            seen.add(section);
            if (!restoringAnswer) section.classList.add("roots-revealed");
        });
    });


    const key = "dm-index-notation-number-v1";
    const base = document.querySelector("#power-base"), index = document.querySelector("#power-index");
    try { const saved = JSON.parse(localStorage.getItem(key) || "{}"); if (!window.LessonSession?.hasControl(base) && /^(?:[0-9]|10)$/.test(saved.base)) base.value = saved.base; if (!window.LessonSession?.hasControl(index) && Number.isInteger(saved.index) && saved.index >= 1 && saved.index <= 6) index.value = saved.index; } catch (_) {}
    const draw = () => {
        document.querySelector("#power-index-value").textContent = index.value;
        const valid = /^(?:[0-9]|10)$/.test(base.value.trim());
        base.setAttribute("aria-invalid", String(!valid));
        const equation = document.querySelector(".power-lab-equation");
        const caption = document.querySelector(".power-lab-caption");
        if (!valid) { equation.textContent = "Choose a whole-number base from 0 to 10."; caption.textContent = "The index can be any whole number from 1 to 6."; return; }
        const b = Number(base.value), n = Number(index.value);
        equation.textContent = Array(n).fill(b).join(" × ") + " = " + (b ** n).toLocaleString("en-GB");
        caption.textContent = n + (n === 1 ? " factor" : " factors") + " of " + b + (n === 1 ? " makes " : " make ") + (b ** n).toLocaleString("en-GB") + ".";
        index.setAttribute("aria-valuetext", n + (n === 1 ? " factor" : " factors"));
        try { localStorage.setItem(key, JSON.stringify({base: base.value, index: n})); } catch (_) {}
    };
    document.querySelector(".power-lab-controls").hidden = false;
    base.addEventListener("input", draw); index.addEventListener("input", draw); draw();
});
