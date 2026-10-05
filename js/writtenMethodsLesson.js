document.addEventListener("DOMContentLoaded", () => {
    const main = document.querySelector(".lesson-main");
    // Guided sections start hidden. Their diagrams must be measured again
    // when revealed, not pinned using the zero-sized initial layout.
    let layoutFrame;
    const sceneSizes = new WeakMap();
    const sceneObserver = new ResizeObserver(entries => {
        let changed = false;
        entries.forEach(({target, contentRect}) => {
            const size = `${contentRect.width}:${contentRect.height}`;
            if (sceneSizes.get(target) === size) return;
            sceneSizes.set(target, size);
            changed = true;
        });
        if (!changed) return;
        cancelAnimationFrame(layoutFrame);
        layoutFrame = requestAnimationFrame(() => document.dispatchEvent(new Event("lessonlayoutchange")));
    });
    main.querySelectorAll(".is-ready").forEach(scene => sceneObserver.observe(scene));
    const acceptanceNotice = document.createElement("span");
    acceptanceNotice.className = "roots-answer-notice";
    acceptanceNotice.setAttribute("role", "status");
    acceptanceNotice.setAttribute("aria-atomic", "true");
    main.appendChild(acceptanceNotice);
    const page = location.pathname.split("/").pop().replace(".html", "");
    const firstGap = main.querySelector("[data-lesson-check]");
    if (firstGap) {
        const formatNote = document.createElement("p");
        formatNote.className = "roots-instruction";
        formatNote.textContent = "Use figures in the number gaps.";
        firstGap.before(formatNote);
    }
    const answerKey = "dm-written-methods-accepted-v1:" + page;
    const readingKey = "dm-written-methods-reading-v1:" + page;
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
                localStorage.removeItem("dm-written-methods-recall-v1:" + page);
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
        
        const tail = document.createElement("div");
        tail.className = "roots-reading-step";
        while (root.nextElementSibling) tail.appendChild(root.nextElementSibling);
        root.after(tail);
        const next = document.createElement("button");
        next.type = "button";
        next.className = "roots-continue";
        next.textContent = "Continue";
        const isEnding = root === Array.from(main.querySelectorAll("[data-lesson-check]")).at(-1);
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
        const isEnding = event.target === Array.from(main.querySelectorAll("[data-lesson-check]")).at(-1);
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
                const question = window.WrittenMethodsLessonBank.buildRound()
                    .filter(q => q.stage === Number(root.dataset.lessonCheck))[index];
                input.inputMode = typeof question.expected === "number" ? "decimal" : "text";
                input.style.width = Math.max(3.2, String(question.expected).length * .68 + 1) + "em";
                const key = root.dataset.lessonCheck + ":" + index;
                window.LessonSession?.bindDraft(input, key);
                let symbolChoices;
                if (typeof question.expected === "string") {
                    symbolChoices = document.createElement("span");
                    symbolChoices.className = "written-symbol-choices";
                    symbolChoices.setAttribute("role", "group");
                    symbolChoices.setAttribute("aria-label", input.getAttribute("aria-label"));
                    input.hidden = true;
                    ["=", "≠"].forEach(symbol => {
                        const option = document.createElement("button");
                        option.type = "button";
                        option.textContent = symbol;
                        option.dataset.symbol = symbol;
                        option.setAttribute("aria-label", symbol === "=" ? "Equal to" : "Not equal to");
                        option.addEventListener("click", () => {
                            input.value = symbol;
                            input.dispatchEvent(new Event("input", {bubbles: true}));
                        });
                        symbolChoices.append(option);
                    });
                    input.after(symbolChoices);
                }
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
                    symbolChoices?.classList.remove("roots-answer-retry");
                    input.removeAttribute("aria-invalid");
                    notice.textContent = "";
                };
                const indicateIncorrect = () => {
                    if (input.readOnly || !input.value.trim()) return;
                    if (window.WrittenMethodsLessonBank.evaluateResponse(question, input.value).state === "correct") return;
                    input.classList.add("roots-answer-retry");
                    symbolChoices?.classList.add("roots-answer-retry");
                    input.setAttribute("aria-invalid", "true");
                    notice.textContent = "Not quite. Try another answer.";
                    reminderText.textContent = window.WrittenMethodsLessonBank.explainMistake(question, input.value);
                    reminder.hidden = false;
                    cueTimer = setTimeout(clearCue, 1800);
                };
                const finish = (restoring = false) => {
                    if (input.readOnly || composing) return;
                    if (window.WrittenMethodsLessonBank.evaluateResponse(question, input.value).state !== "correct") return;
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
                    const hadFocus = document.activeElement === input || !!symbolChoices?.contains(document.activeElement);
                    input.hidden = true;
                    if (symbolChoices) symbolChoices.hidden = true;
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

});
