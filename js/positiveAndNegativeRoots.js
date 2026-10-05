/* A number and its square, on two lines that move together.

   The page has no scroll-led card. It was written with three, and each one drew
   its idea by revealing a line of text at a time — which is a paragraph in a box
   rather than an animation, and the reader scrolls a long way to be shown
   writing. What this page actually has to show is one thing: two numbers reach
   the same square, and only at 0 do they meet. That is a movement, so it is the
   one thing here the reader moves.

   Everything else on the page is notation and convention, which a diagram
   cannot make truer than a sentence can. */

// Short, deliberately ordered questions: each uses only the idea just taught.
window.RootsLessonBank = {
    buildRound() {
        const make = (stage, prompt, expression, expected, hint, explanation) => ({
            stage, prompt, expression, expected, mode: "number",
            title: prompt, factKey: stage + ":" + expected,
            hints: [hint], steps: [explanation]
        });
        return [
            make(0, "We know 5 × 5 = 25. The other number whose square is 25 is", "", -5,
                "Try the same size with the opposite sign.", "(−5) × (−5) = 25, so the other number is −5."),
            make(0, "The square of −8 is given by", "(−8) × (−8) =", 64,
                "Two negative factors have a positive product.", "8 × 8 = 64, and negative × negative is positive."),
            make(1, "", "", 6,
                "Look for the non-negative number whose square is 36.", "6 × 6 = 36, so the square-root symbol gives 6."),
            make(1, "", "", -6,
                "Find the principal root first, then take its negative.", "The principal square root of 36 is 6. Its negative is −6.")
        ].map((q, i) => {
            if (i === 2 || i === 3) q.display = {parts: [
                {t: "root", r: "36", lead: i === 3 ? "−" : ""},
                {t: "text", v: " ="}
            ]};
            return q;
        }).concat([
            make(2, "For x² = 64, one solution is 8. The other solution is", "", -8,
                "Check a negative value by multiplying it by itself.", "(−8) × (−8) = 64, so x = 8 or x = −8."),
            make(2, "For x² = 121, the negative solution is", "", -11,
                "The ± sign records a positive and a negative value.", "x = ±11 means x = 11 or x = −11."),
            make(3, "For x² = 0, the number of different solutions is", "", 1,
                "0 and −0 are the same number.", "Only 0 squares to 0: there is one solution."),
            make(3, "For x² = −16, the number of solutions on the number line is", "", 0,
                "A positive or negative number has a positive square; zero squares to zero.", "No number on the number line has a negative square, so there are no real solutions."),
            {...make(4, "", "", 9,
                "The root symbol names the non-negative root.", "9 multiplied by itself gives 81."),
                display: {parts: [{t: "root", r: "81"}, {t: "text", v: " ="}]}},
            make(4, "For x² = 81, the number of different solutions is", "", 2,
                "Check both a positive number and its negative.", "Both 9 and −9 square to 81.")
        ]);
    },
    explainMistake(question, answer) {
        const raw = String(answer).trim().replace(/−/g, "-");
        const state = this.evaluateResponse(question, raw).state;
        if (state === "blank" || state === "correct") return "";
        const rootQuestion = question.stage === 1 || (question.stage === 4 && question.expected === 9);
        if (rootQuestion && /±|\+\s*\/?\s*-/.test(raw)) {
            return "You’ve given two values. A square-root symbol names just the non-negative root; a minus sign outside it then changes that single value’s sign.";
        }
        if (state === "unreadable") return "I couldn’t read that as one number. Enter your calculated value, not an expression or a list of answers.";
        const n = Number(raw);
        const shown = String(n).replace(/-/g, "−");
        const countQuestion = question.stage === 3 || (question.stage === 4 && question.expected === 2);
        if (countQuestion) {
            if (!Number.isInteger(n) || n < 0) return `${shown} cannot be a count of solutions. Count how many different numbers work, using a whole number starting at zero.`;
            if (question.stage === 4) {
                if (n === 9 || n === 81) return `${shown} is a value from the calculation, but this question asks how many solutions there are. List the numbers that square to 81, then count them.`;
                if (n === 1) return "You’ve counted one solution. A positive number works; check whether its negative also squares to 81.";
                return `A count of ${shown} means ${shown} different values of x. Look for the positive and negative numbers whose square is 81; count each just once.`;
            }
            if (question.expected === 1) return n === 2
                ? "You may be counting 0 and −0 separately. They are the same point on the number line, so count them only once."
                : `A count of ${shown} doesn’t match x² = 0. Zero itself works; any non-zero number has a positive square.`;
            return `A count of ${shown} would mean a number on the number line squares to −16. But 4 and −4 both square to positive 16, and zero squares to zero. Every square is non-negative.`;
        }
        if (question.stage === 0 && question.expected === 64) {
            if (n === -64) return "The size, 64, is right. Check the sign: multiplying two negative factors gives a positive product.";
            if (n === -16 || n === 16) return "Adding two 8s gives 16, but the operation here is multiplication. Work out 8 × 8, then use the signs of the two factors.";
            return `The product is not ${shown}. First work out 8 × 8; then decide the sign of a negative multiplied by a negative.`;
        }
        if (rootQuestion) {
            if (n === -question.expected) return question.expected < 0
                ? "You’ve found the principal root, but haven’t applied the minus sign outside it. Take the negative of your answer."
                : `Your number does square to ${question.expected ** 2}, but the root symbol asks for the non-negative root. Keep the size and change the sign.`;
            const radicand = question.stage === 1 ? 36 : 81;
            if (Math.abs(n) === radicand) return `You’ve used the number under the root. We need a number that, multiplied by itself, gives ${radicand}.`;
            return `Check ${shown} by multiplying it by itself. Its square needs to be ${radicand}; then check whether the expression has a minus sign outside the root.`;
        }
        if (n === -question.expected) return question.stage === 0
            ? "5 is already one of the two numbers. The question asks for the other one: try the same size with the opposite sign."
            : `The positive value ${shown} works, but this question asks for the negative solution. Keep its size and change its sign.`;
        const target = question.expected ** 2;
        return `Check ${shown} by multiplying it by itself. We need a square of ${target}, and the missing value here is negative.`;
    },
    evaluateResponse(question, answer) {
        const raw = String(answer).trim().replace(/−/g, "-");
        if (!raw) return {state: "blank", text: "Add an answer when you're ready."};
        if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)) return {state: "unreadable", text: "Write a number, such as 6 or −6."};
        return Number(raw) === question.expected
            ? {state: "correct", text: ""}
            : {state: "wrong", text: question.hints[0]};
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const main = document.querySelector(".lesson-main");
    const acceptanceNotice = document.createElement("span");
    acceptanceNotice.className = "roots-answer-notice";
    acceptanceNotice.setAttribute("role", "status");
    acceptanceNotice.setAttribute("aria-atomic", "true");
    main.appendChild(acceptanceNotice);
    const answerKey = "dm-roots-accepted-v1";
    const readingKey = "dm-roots-reading-v1";
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
                localStorage.removeItem("dm-roots-number-v1");
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
                const question = window.RootsLessonBank.buildRound()
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
                    if (window.RootsLessonBank.evaluateResponse(question, input.value).state === "correct") return;
                    input.classList.add("roots-answer-retry");
                    input.setAttribute("aria-invalid", "true");
                    notice.textContent = "Not quite. Try another answer.";
                    reminderText.textContent = window.RootsLessonBank.explainMistake(question, input.value);
                    reminder.hidden = false;
                    cueTimer = setTimeout(clearCue, 1800);
                };
                const finish = (restoring = false) => {
                    if (input.readOnly || composing) return;
                    if (window.RootsLessonBank.evaluateResponse(question, input.value).state !== "correct") return;
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
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

    /* The figure's lines: numbers from −10 to 10, and their squares from 0 to
       100. Both ends are worked out from the range rather than written down, so
       a tick and the arithmetic behind it cannot disagree. */
    const X_MIN = -10;
    const X_MAX = 10;
    const SQ_MAX = X_MAX * X_MAX;

    const MINUS = "−";
    const signed = (value) => (value < 0 ? MINUS + String(-value) : String(value));
    const spoken = (value) => (value < 0 ? `negative ${-value}` : String(value));

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    /* Strip the page of its styling and a raised index is lost: 7<sup>2</sup>
       becomes the two characters "72" and reads as seventy-two. The clipped
       caret is never seen and never spoken, and it keeps the flattened text
       reading what the page reads. */
    const hiddenText = (text) => {
        const mark = el("span", "caret", text);
        mark.setAttribute("aria-hidden", "true");
        return mark;
    };

    /* A square, written with the index raised and the caret keeping it raised
       once the styling is gone. */
    const squared = (base, label) => {
        const holder = el("span");
        holder.setAttribute("role", "math");
        holder.setAttribute("aria-label", label);
        holder.append(String(base), hiddenText("^"));
        holder.append(el("sup", "", "2"));
        return holder;
    };

    const buildMirror = () => {
        const figure = document.querySelector(".mirror");
        const axes = Array.from(document.querySelectorAll("[data-axis]"));
        if (!figure || !axes.length) return;

        const reading = document.querySelector("[data-reading]");
        const find = (name, kind) => document.querySelector(`[data-${kind}="${name}"]`);
        const marker = (name) => find(name, "marker");
        const value = (name) => find(name, "value");

        const parts = {
            x: { axis: axes.find((a) => a.dataset.axis === "x"), marker: marker("x"), value: value("x") },
            mirror: { marker: marker("mirror"), value: value("mirror") },
            square: { axis: axes.find((a) => a.dataset.axis === "square"), marker: marker("square"), value: value("square") }
        };
        if (!parts.x.axis || !parts.square.axis) return;

        const xPos = (v) => (v - X_MIN) / (X_MAX - X_MIN) * 100;
        const sqPos = (k) => k / SQ_MAX * 100;

        /* The value is held in tenths, as a whole number of them, for two
           reasons. It gives the line two hundred places to stand in rather than
           twenty, so a marker follows a finger instead of hopping between whole
           numbers. And a tenth times a tenth is exactly a hundredth, so every
           square is worked out in integers and 6.4 × 6.4 comes to 40.96 rather
           than to 40.96000000000001. */
        const STEP = 10;
        let tenths = 70;
        try {
            const stored = localStorage.getItem("dm-roots-number-v1");
            if (stored !== null && Number.isFinite(Number(stored))) tenths = Number(stored);
        } catch (_) {}
        const controls = el("div", "mirror__controls");
        const flip = el("button", "mirror__action", "Change sign");
        flip.type = "button";
        controls.append(flip);
        reading.before(controls);

        const trim = (v) => String(Number(v.toFixed(2)));
        const squareOf = (t) => (t * t) / 100;

        const place = (node, percent) => { if (node) node.style.left = `${percent.toFixed(4)}%`; };

        const show = (next) => {
            tenths = Math.max(X_MIN * STEP, Math.min(X_MAX * STEP, Math.round(next)));
            const current = tenths / STEP;
            const square = squareOf(tenths);
            const size = Math.abs(current);
            const merged = tenths === 0;
            flip.disabled = merged;
            try { localStorage.setItem("dm-roots-number-v1", String(tenths)); } catch (_) {}
            [parts.x.marker, parts.x.value].forEach(node => node?.classList.toggle("is-negative", current < 0));
            [parts.mirror.marker, parts.mirror.value].forEach(node => node?.classList.toggle("is-negative", current > 0));

            place(parts.x.marker, xPos(current));
            place(parts.x.value, xPos(current));
            if (parts.x.value) parts.x.value.textContent = signed(current);

            place(parts.mirror.marker, xPos(-current));
            place(parts.mirror.value, xPos(-current));
            if (parts.mirror.value) parts.mirror.value.textContent = signed(-current);
            [parts.mirror.marker, parts.mirror.value].forEach((node) => {
                if (node) node.classList.toggle("is-merged", merged);
            });

            place(parts.square.marker, sqPos(square));
            place(parts.square.value, sqPos(square));
            if (parts.square.value) parts.square.value.textContent = trim(square);

            parts.x.axis.setAttribute("aria-valuenow", trim(current));
            parts.x.axis.setAttribute("aria-valuetext", merged
                ? "0, whose square is 0, the only number that squares to 0"
                : `${spoken(current)}, whose square is ${trim(square)}, shared with ${spoken(-current)}`);
            parts.square.axis.setAttribute("aria-valuenow", trim(square));
            parts.square.axis.setAttribute("aria-valuetext", merged
                ? "0, reached from 0 alone"
                : `${trim(square)}, reached from ${trim(size)} and from negative ${trim(size)}`);

            if (!reading) return;
            reading.replaceChildren();
            if (merged) {
                const statement = el("span", "sf mirror__equation");
                statement.setAttribute("role", "math");
                statement.setAttribute("aria-label", "0 squared equals 0");
                statement.append(squared("0", "0 squared"), " = 0");
                reading.append(statement, el("span", "mirror__conclusion", "Only one number: the two points meet at zero."));
            } else {
                const shown = trim(size);
                const answer = trim(square);
                const statement = el("span", "sf mirror__equation");
                statement.setAttribute("role", "math");
                statement.setAttribute("aria-label",
                    `${shown} squared equals ${answer} and negative ${shown} squared equals ${answer}`);
                const negative = squared(`(${MINUS}${shown})`, `negative ${shown} squared`);
                negative.className = "mirror__negative";
                const positive = squared(shown, `${shown} squared`);
                positive.className = "mirror__positive";
                statement.append(negative, " = ", el("span", "mirror__result", answer), " = ", positive);
                reading.append(statement, el("span", "mirror__conclusion", `Two different numbers, the same square.`));
            }
        };

        flip.addEventListener("click", () => show(-tenths));

        const sign = () => (tenths < 0 ? -1 : 1);

        /* A square carries no sign, so dragging the lower line has to keep the
           one the upper line already had. Read afresh each frame, it would be
           lost the moment a drag passed through 0, and the number could never be
           brought back to the negative side of the line. */
        let heldSign = sign();

        const gripAt = (axis, clientX) => {
            const rect = axis.getBoundingClientRect();
            const fraction = rect.width ? clamp((clientX - rect.left) / rect.width) : 0;
            if (axis.dataset.axis === "x") show(Math.round(X_MIN + fraction * (X_MAX - X_MIN)) * STEP);
            else show(heldSign * Math.round(Math.sqrt(fraction * SQ_MAX)) * STEP);
        };

        /* Whole numbers are what the line is read at, so a key steps to the next
           one rather than crawling through the tenths a finger can reach. */
        const wholeStep = (from, direction) => {
            const at = from / STEP;
            return (Number.isInteger(at) ? at + direction
                : (direction > 0 ? Math.ceil(at) : Math.floor(at))) * STEP;
        };

        [parts.x.axis, parts.square.axis].forEach((axis) => {
            axis.addEventListener("pointerdown", (event) => {
                axis.setPointerCapture(event.pointerId);
                axis.dataset.holding = "true";
                /* The markers glide between keyboard steps; while a finger is
                   down they must track it exactly, so the easing comes off. */
                figure.classList.add("is-dragging");
                heldSign = sign();
                gripAt(axis, event.clientX);
                event.preventDefault();
            });
            axis.addEventListener("pointermove", (event) => {
                if (axis.dataset.holding === "true") gripAt(axis, event.clientX);
            });
            const release = (event) => {
                if (axis.dataset.holding !== "true") return;
                axis.dataset.holding = "false";
                figure.classList.remove("is-dragging");
                if (axis.hasPointerCapture && axis.hasPointerCapture(event.pointerId)) {
                    axis.releasePointerCapture(event.pointerId);
                }
            };
            axis.addEventListener("pointerup", release);
            axis.addEventListener("pointercancel", release);

            axis.addEventListener("keydown", (event) => {
                const onSquare = axis.dataset.axis === "square";
                const size = Math.abs(tenths);
                let next = null;
                if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                    next = onSquare ? sign() * Math.min(X_MAX * STEP, wholeStep(size, 1)) : wholeStep(tenths, 1);
                } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                    next = onSquare ? sign() * Math.max(0, wholeStep(size, -1)) : wholeStep(tenths, -1);
                } else if (event.key === "Home") {
                    next = onSquare ? 0 : X_MIN * STEP;
                } else if (event.key === "End") {
                    next = onSquare ? sign() * X_MAX * STEP : X_MAX * STEP;
                }
                if (next === null) return;
                event.preventDefault();
                show(next);
            });
        });

        show(tenths);
    };

    buildMirror();
});
