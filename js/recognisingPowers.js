/* Inline questions and live examples for recognisingPowers. */
window.RecognisingPowersBank = {
buildRound() { return [[0,"121 is a square. The positive whole number whose square is 121 is",11,"root",11,2],[0,"125 is a cube. The whole number whose cube is 125 is",5,"root",5,3],[1,"To write 243 as a power of 3, the index is",5,"exponent",3,5],[1,"To write 625 as a power of 5, the index is",4,"exponent",5,4],[2,"For 64 as a power of 4, the index is",3,"exponent",4,3],[2,"For 81 as a power of 9, the index is",2,"exponent",9,2],[3,"The largest whole number whose cube is below 100 is",4,"lower",4,3],[3,"The next whole number, whose cube is above 100, is",5,"upper",5,3]].map(([stage,prompt,expected,kind,base,index],i)=>({
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
if(q.kind==="root") {
 if(q.index===2 && n===-q.expected)return n+" does square to "+q.base**q.index+", but this question asks for the positive whole number. Keep the size and change the sign.";
 return "Check "+n+" by multiplying "+q.index+" copies of it. The result needs to be "+q.base**q.index+".";
}
if(q.kind==="exponent") {
 if(!Number.isInteger(n)||n<1)return "The index here is a positive whole number: count how many copies of "+q.base+" make "+q.base**q.index+".";
 const v=q.base**n;
 return (Number.isFinite(v)&&n<15 ? q.base+" to the power of "+n+" gives "+v+", not "+q.base**q.index+". " : "")+"Start with "+q.base+" and multiply by "+q.base+" until you reach "+q.base**q.index+"; count the factors.";
}
return "Compare "+n+" cubed with 100. The missing number’s cube must be "+(q.kind==="lower"?"below":"above")+" 100, and the two bases must be consecutive whole numbers.";
}
};
document.addEventListener("DOMContentLoaded", () => {
    const main = document.querySelector(".lesson-main");
    const acceptanceNotice = document.createElement("span");
    acceptanceNotice.className = "roots-answer-notice";
    acceptanceNotice.setAttribute("role", "status");
    acceptanceNotice.setAttribute("aria-atomic", "true");
    main.appendChild(acceptanceNotice);
    const answerKey = "dm-recognising-powers-accepted-v1";
    const readingKey = "dm-recognising-powers-reading-v1";
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
                localStorage.removeItem("dm-recognising-powers-number-v1");
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
                const question = window.RecognisingPowersBank.buildRound()
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
                    if (window.RecognisingPowersBank.evaluateResponse(question, input.value).state === "correct") return;
                    input.classList.add("roots-answer-retry");
                    input.setAttribute("aria-invalid", "true");
                    notice.textContent = "Not quite. Try another answer.";
                    reminderText.textContent = window.RecognisingPowersBank.explainMistake(question, input.value);
                    reminder.hidden = false;
                    cueTimer = setTimeout(clearCue, 1800);
                };
                const finish = (restoring = false) => {
                    if (input.readOnly || composing) return;
                    if (window.RecognisingPowersBank.evaluateResponse(question, input.value).state !== "correct") return;
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


    const key = "dm-recognising-powers-number-v1";
    const input = document.querySelector("#power-number"), result = document.querySelector(".power-finder-result");
    try { const value = localStorage.getItem(key); if (!window.LessonSession?.hasControl(input) && /^\d{1,4}$/.test(value) && Number(value) >= 2) input.value = value; } catch (_) {}
    const power = (b, n) => {
        const span = document.createElement("span"), caret = document.createElement("span"), sup = document.createElement("sup");
        caret.className = "caret"; caret.setAttribute("aria-hidden","true"); caret.textContent = "^"; sup.textContent = n;
        span.append(String(b), caret, sup); return span;
    };
    const draw = () => {
        const n = Number(input.value), valid = /^\d{1,4}$/.test(input.value) && n >= 2 && n <= 9999;
        input.setAttribute("aria-invalid", String(!valid));
        result.replaceChildren();
        if (!valid) { result.textContent = "Choose a whole number from 2 to 9,999."; return; }
        const names = [];
        for (let b = 2; b * b <= n; b++) {
            let v = b * b, exponent = 2;
            while (v < n) { v *= b; exponent++; }
            if (v === n) names.push([b,exponent]);
        }
        if (!names.length) result.textContent = n.toLocaleString("en-GB") + " is not a square, cube or higher power of a whole number.";
        else {
            result.append(n.toLocaleString("en-GB"));
            names.forEach(([b,e]) => result.append(" = ", power(b,e)));
        }
        try { localStorage.setItem(key, input.value); } catch (_) {}
    };
    input.closest("label").hidden = false;
    input.addEventListener("input", draw); draw();
});
