/* Square roots: inline retrieval and a directly adjustable square. */
window.SquareRootsLessonBank = {
    buildRound() {
        return [
            [0, "For a square of area 64 cm², the side length in centimetres is", 8, 64, false],
            [0, "", 12, 144, true],
            [1, "The positive number whose square is 196 is", 14, 196, false],
            [1, "", 15, 225, true],
            [2, "Since 3 × 3 = 9, we have", 0.3, 0.09, true],
            [2, "", 0.06, 0.0036, true],
            [3, "", 0.8, 0.64, true],
            [3, "", 0, 0, true]
        ].map(([stage, prompt, expected, radicand, root]) => ({
            stage, prompt, expected, radicand, expression: "", mode: "number",
            title: prompt, factKey: stage + ":" + expected,
            hints: ["Multiply your answer by itself to check it."], steps: [],
            ...(root ? {display: {parts: [{t: "root", r: String(radicand)}, {t: "text", v: " ="}]}} : {})
        }));
    },
    evaluateResponse(question, answer) {
        const raw = String(answer).trim().replace(/−/g, "-");
        if (!raw) return {state: "blank", text: ""};
        if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)) return {state: "unreadable", text: ""};
        return {state: Number(raw) === question.expected ? "correct" : "wrong", text: ""};
    },
    explainMistake(question, answer) {
        const raw = String(answer).trim().replace(/−/g, "-");
        const state = this.evaluateResponse(question, answer).state;
        if (state === "blank" || state === "correct") return "";
        if (state === "unreadable") return "Write one number, using a decimal point if needed. You don't need to include units or a calculation.";
        const n = Number(raw), target = question.radicand;
        const shown = String(n).replace(/-/g, "−");
        const squared = Number((n * n).toPrecision(10));
        if (n === -question.expected) return shown + " does square to " + target + (question.stage === 0 && !question.display
            ? ", but a side length cannot be negative. Use the positive length."
            : ", but the square root asked for here is non-negative. Use the positive value.");
        if (target === 0) return shown + " multiplied by itself isn't zero. Look for a number whose square is zero.";
        if (n === target / 2) return "Halving " + target + " gives " + shown + ", but " + shown + " × " + shown + " gives " + squared + ". We need two equal factors whose product is " + target + ".";
        if (!Number.isFinite(squared)) return "That number is too large. Look for a number whose square is " + target + ".";
        return shown + " × " + shown + " = " + squared + ", not " + target + ". " + (target < 1 ? "Keep the square fact, then check the decimal places in the product." : "Look for two equal factors of " + target + ".");
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const main = document.querySelector(".lesson-main");
    const acceptanceNotice = document.createElement("span");
    acceptanceNotice.className = "roots-answer-notice";
    acceptanceNotice.setAttribute("role", "status");
    acceptanceNotice.setAttribute("aria-atomic", "true");
    main.appendChild(acceptanceNotice);
    const answerKey = "dm-square-roots-accepted-v1";
    const readingKey = "dm-square-roots-reading-v1";
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
                localStorage.removeItem("dm-square-roots-number-v1");
                localStorage.removeItem("dm-lesson-progress:" + location.pathname);
            } catch (_) {}
            location.replace(location.pathname + location.search);
        });
        revealButton.after(reset);
        // Keep the controls reachable when the contents rail has no room.
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
                const question = window.SquareRootsLessonBank.buildRound()
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
                    if (window.SquareRootsLessonBank.evaluateResponse(question, input.value).state === "correct") return;
                    input.classList.add("roots-answer-retry");
                    input.setAttribute("aria-invalid", "true");
                    notice.textContent = "Not quite. Try another answer.";
                    reminderText.textContent = window.SquareRootsLessonBank.explainMistake(question, input.value);
                    reminder.hidden = false;
                    cueTimer = setTimeout(clearCue, 1800);
                };
                const finish = (restoring = false) => {
                    if (input.readOnly || composing) return;
                    if (window.SquareRootsLessonBank.evaluateResponse(question, input.value).state !== "correct") return;
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

    const side = document.querySelector("#square-side");
    const drawing = document.querySelector(".square-tiles");
    const numberKey = "dm-square-roots-number-v1";
    let stored;
    try { stored = Number(localStorage.getItem(numberKey)); } catch (_) {}
    if (!window.LessonSession?.hasControl(side) && Number.isInteger(stored) && stored >= 1 && stored <= 15) side.value = stored;
    const renderSquare = () => {
        const n = Number(side.value);
        drawing.parentElement.style.setProperty("--side", n);
        drawing.replaceChildren(...Array.from({length: n * n}, () => document.createElement("i")));
        document.querySelector(".square-side").textContent = n + " cm";
        document.querySelector(".square-product").textContent = n + " × " + n + " = " + n * n;
        document.querySelector(".square-area").textContent = "Area: " + n * n + " cm²";
        side.setAttribute("aria-valuetext", n + " centimetres; area " + n * n + " square centimetres");
    };
    side.addEventListener("input", () => {
        renderSquare();
        try { localStorage.setItem(numberKey, side.value); } catch (_) {}
    });
    document.querySelector(".square-control").hidden = false;
    renderSquare();
});
