/* Cube roots: inline retrieval, separable cube layers and odd/even factors. */
window.CubeRootsLessonBank = {
    buildRound() {
        return [
            [0, "", 5, 125, 3],
            [0, "A cube has volume 1,000 cm³. Its edge length in centimetres is", 10, 1000, 0],
            [1, "", -4, -64, 3],
            [1, "", -2, -8, 3],
            [2, "", 3, 81, 4],
            [2, "", 2, 64, 6],
            [3, "", -2, -32, 5],
            [3, "For x⁴ = −16, the number of solutions on the number line is", 0, -16, 0]
        ].map(([stage, prompt, expected, radicand, order]) => ({
            stage, prompt, expected, radicand, order: order || (stage === 0 ? 3 : 4),
            count: stage === 3 && order === 0,
            expression: "", mode: "number", title: prompt,
            factKey: stage + ":" + expected,
            hints: ["Check by raising your answer to the power named by the root."], steps: [],
            ...(order ? {display: {parts: [
                {t: "root", r: String(radicand).replace(/-/g, "−"), order, grouped: radicand < 0},
                {t: "text", v: " ="}
            ]}} : {})
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
        if (!question.count && /±|\+\s*\/?\s*-/.test(raw)) {
            return question.order % 2
                ? "An odd-order root has one value on the number line. Check the sign: an odd number of negative factors gives a negative product."
                : "An even-order root symbol gives only the non-negative root, not a positive-and-negative pair.";
        }
        if (state === "unreadable") return "Enter one number, not an expression or a list of values.";
        const n = Number(raw), shown = raw.replace(/-/g, "−");
        if (question.count) {
            if (!Number.isInteger(n) || n < 0) return shown + " isn't a possible count. Use a whole number starting at zero.";
            return "A count of " + shown + " would require numbers whose fourth power is −16. Positive and negative numbers both have positive fourth powers; zero gives zero.";
        }
        if (n === -question.expected) {
            if (!question.display) return shown + " has the right size, but an edge length cannot be negative.";
            if (question.order % 2) return shown + " has the right size but the wrong sign. An odd power keeps the sign, so a " + (question.radicand < 0 ? "negative number needs a negative" : "positive number needs a positive") + " root.";
            return shown + " raised to this even power works, but the root symbol asks for the non-negative value.";
        }
        if (n === question.radicand / question.order) return "Dividing by " + question.order + " gives " + shown + ". A root asks instead for " + question.order + " equal factors whose product is " + question.radicand + ".";
        const product = n ** question.order;
        if (!Number.isFinite(product)) return "That value is too large. Look for " + question.order + " equal factors whose product is " + question.radicand + ".";
        const computed = Number(product.toPrecision(10));
        return shown + " raised to power " + question.order + " gives " + computed + ", not " + question.radicand + ". Try a " + (Math.abs(product) > Math.abs(question.radicand) ? "smaller" : "larger") + " size, then check the sign.";
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const main = document.querySelector(".lesson-main");
    const acceptanceNotice = document.createElement("span");
    acceptanceNotice.className = "roots-answer-notice";
    acceptanceNotice.setAttribute("role", "status");
    acceptanceNotice.setAttribute("aria-atomic", "true");
    main.appendChild(acceptanceNotice);
    const answerKey = "dm-cube-roots-accepted-v1";
    const readingKey = "dm-cube-roots-reading-v1";
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
                localStorage.removeItem("dm-cube-roots-diagrams-v1");
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
            // Keep grouping in flattened text without showing an unmatched
            // closing bracket beside a radical's grouping bar.
            turn.querySelectorAll(".practice-radical").forEach(radical => {
                const order = radical.querySelector(".rad__index")?.dataset.order;
                const name = {3: "cube", 4: "fourth", 5: "fifth", 6: "sixth"}[order];
                const value = radical.querySelector(".rad__over")?.textContent.replace(/−/g, "negative ");
                if (name && value) radical.setAttribute("aria-label", name + " root of " + value);
                const closing = radical.lastChild;
                if (closing?.nodeType !== Node.TEXT_NODE || closing.textContent !== ")") return;
                const mark = document.createElement("span");
                mark.className = "caret";
                mark.setAttribute("aria-hidden", "true");
                mark.textContent = ")";
                closing.replaceWith(mark);
            });
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
                const question = window.CubeRootsLessonBank.buildRound()
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
                    if (window.CubeRootsLessonBank.evaluateResponse(question, input.value).state === "correct") return;
                    input.classList.add("roots-answer-retry");
                    input.setAttribute("aria-invalid", "true");
                    notice.textContent = "Not quite. Try another answer.";
                    reminderText.textContent = window.CubeRootsLessonBank.explainMistake(question, input.value);
                    reminder.hidden = false;
                    cueTimer = setTimeout(clearCue, 1800);
                };
                const finish = (restoring = false) => {
                    if (input.readOnly || composing) return;
                    if (window.CubeRootsLessonBank.evaluateResponse(question, input.value).state !== "correct") return;
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


    const diagramKey = "dm-cube-roots-diagrams-v1";
    let diagramState = {};
    try { diagramState = JSON.parse(localStorage.getItem(diagramKey) || "{}") || {}; } catch (_) {}
    const saveDiagrams = () => {
        try { localStorage.setItem(diagramKey, JSON.stringify(diagramState)); } catch (_) {}
    };
    const cube = document.querySelector(".cube-explorer");
    const toggle = document.querySelector(".cube-toggle");
    const showLayers = () => {
        const split = diagramState.split === true;
        cube.classList.toggle("is-separated", split);
        toggle.setAttribute("aria-pressed", String(split));
        toggle.textContent = split ? "Rebuild cube" : "Separate layers";
    };
    toggle.hidden = false;
    showLayers();
    // Only an explicit action animates: a restored cube never replays.
    toggle.addEventListener("click", () => {
        cube.classList.add("is-animated");
        diagramState.split = !diagramState.split;
        showLayers();
        saveDiagrams();
    });
    const order = document.querySelector("#cube-order");
    if (Number.isInteger(diagramState.order) && diagramState.order >= 2 && diagramState.order <= 6) order.value = diagramState.order;
    const showFactors = () => {
        const n = Number(order.value);
        const product = (-2) ** n;
        const signed = String(product).replace(/-/g, "−");
        document.querySelector("[data-factors]").textContent = Array(n).fill("(−2)").join(" × ") + " = " + signed;
        document.querySelector("#parity-caption").textContent = n + " negative factors: an " + (n % 2 ? "odd count gives a negative" : "even count gives a positive") + " product.";
        order.setAttribute("aria-valuetext", n + " negative factors, product " + product);
    };
    document.querySelector(".cube-parity-control").hidden = false;
    showFactors();
    order.addEventListener("input", () => {
        diagramState.order = Number(order.value);
        showFactors();
        saveDiagrams();
    });
});
