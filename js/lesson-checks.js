(function () {
    "use strict";

    var host = document.querySelector("[data-lesson-check-anchors]");
    if (host) {
        var apiName = host.dataset.lessonCheckApi || "";
        host.dataset.lessonCheckAnchors.split(",").forEach(function (anchor, stage) {
            if (anchor.trim() === "-") return;
            var heading = document.getElementById(anchor.trim());
            var section = heading && heading.closest("section");
            if (!section || section.querySelector("[data-lesson-check=\"" + stage + "\"]")) return;
            var root = document.createElement("div");
            root.dataset.lessonCheck = String(stage);
            if (apiName) root.dataset.lessonCheckApi = apiName;
            section.appendChild(root);
        });
    }

    var roots = document.querySelectorAll("[data-lesson-check]");
    if (!roots.length) return;

    function node(tag, className, text) {
        var item = document.createElement(tag);
        if (className) item.className = className;
        if (text !== undefined) item.textContent = text;
        return item;
    }

    function questionApi(root) {
        var name = root.dataset.lessonCheckApi;
        if (name && window[name]) return window[name];
        return window.PracticeEngine && window.PracticeEngine.active;
    }

    function clipped(text) {
        var mark = node("span", "caret", text);
        mark.setAttribute("aria-hidden", "true");
        return mark;
    }

    function powerNode(base, index, ariaLabel) {
        var holder = node("span", "practice-power");
        holder.setAttribute("role", "math");
        if (ariaLabel) holder.setAttribute("aria-label", ariaLabel);
        holder.append(document.createTextNode(base), clipped("^"), node("sup", "", index));
        return holder;
    }

    function rootNode(radicand, order, lead, grouped, ariaLabel) {
        var holder = node("span", "practice-radical");
        holder.setAttribute("role", "math");
        if (ariaLabel) holder.setAttribute("aria-label", ariaLabel);
        if (lead) holder.appendChild(document.createTextNode(lead));
        var n = order && Number(order) > 2 ? String(order) : "";
        var rad = node("span", n ? "rad rad--order" : "rad");
        rad.appendChild(clipped((n ? ({ "3": "³", "4": "⁴", "5": "⁵", "6": "⁶" }[n] || "") : "") + "√" + (grouped ? "(" : "")));
        if (n) {
            var index = node("span", "rad__index");
            index.dataset.order = n; index.setAttribute("aria-hidden", "true"); rad.appendChild(index);
        }
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "rad__sign"); svg.setAttribute("viewBox", "0 0 24 40"); svg.setAttribute("aria-hidden", "true");
        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M.5 24H5l5.5 13.5L22 1.5H24"); path.setAttribute("fill", "none"); path.setAttribute("stroke", "currentColor"); path.setAttribute("stroke-width", "3");
        svg.appendChild(path); rad.append(svg, node("span", "rad__over", radicand)); holder.appendChild(rad);
        if (grouped) holder.appendChild(document.createTextNode(")"));
        return holder;
    }

    /* A lesson is read in small, completed ideas. Everything remains present in
       the HTML when JavaScript is unavailable; with JavaScript, the next idea
       is revealed only after the two retrieval prompts for the current one. */
    function setupLessonFlow(checkRoots) {
        var main = checkRoots[0] && checkRoots[0].closest("main.lesson-main");
        if (!main) return;

        var sections = Array.from(main.children).filter(function (item) {
            return item.tagName === "SECTION";
        });
        var gates = [];
        checkRoots.forEach(function (root) {
            var section = root.closest("section");
            if (section && !gates.includes(section)) gates.push(section);
        });
        if (gates.length < 2 || sections.length < 2) return;

        var storageKey = "dm-lesson-progress:" + window.location.pathname;
        var unlocked = 0;
        try {
            unlocked = Math.max(0, Math.min(gates.length, Number(window.localStorage.getItem(storageKey)) || 0));
        } catch (error) { /* Storage is an enhancement, never a requirement. */ }

        function revealHashTarget() {
            var id;
            try { id = decodeURIComponent(window.location.hash.slice(1)); } catch (_) { return null; }
            var hashTarget = id && document.getElementById(id);
            var targetSection = hashTarget && hashTarget.closest("section");
            if (!targetSection || !sections.includes(targetSection)) return null;
            var targetIndex = sections.indexOf(targetSection);
            var gateAtOrAfter = gates.findIndex(function (gate) { return sections.indexOf(gate) >= targetIndex; });
            unlocked = Math.max(unlocked, gateAtOrAfter < 0 ? gates.length : gateAtOrAfter);
            return hashTarget;
        }
        revealHashTarget();

        var bar = node("div", "lesson-flowbar");
        bar.setAttribute("aria-label", "Lesson progress");
        var status = node("strong", "lesson-flowbar__status");
        status.setAttribute("aria-live", "polite");
        var track = node("span", "lesson-flowbar__track");
        var markers = gates.map(function (_, index) {
            var marker = node("span", "lesson-flowbar__marker");
            marker.setAttribute("aria-hidden", "true");
            marker.dataset.step = String(index);
            track.appendChild(marker);
            return marker;
        });
        var toggle = node("button", "lesson-flowbar__toggle", "Show whole lesson");
        toggle.type = "button";
        bar.append(status, track, toggle);
        main.insertBefore(bar, sections[0]);

        var showingAll = false;

        function updateFlow() {
            var lastVisible = unlocked >= gates.length ? sections.length - 1 : sections.indexOf(gates[unlocked]);
            sections.forEach(function (section, index) {
                section.hidden = !showingAll && index > lastVisible;
                section.classList.toggle("is-current-step", !showingAll && unlocked < gates.length && section === gates[unlocked]);
            });
            markers.forEach(function (marker, index) {
                marker.classList.toggle("is-complete", index < unlocked);
                marker.classList.toggle("is-current", index === unlocked && unlocked < gates.length);
            });
            status.textContent = unlocked >= gates.length ? "Lesson complete" : "Idea " + (unlocked + 1) + " of " + gates.length;
            toggle.textContent = showingAll ? "Return to guided view" : "Show whole lesson";
            main.dispatchEvent(new CustomEvent("lessonflowchange", { bubbles: true }));
        }

        toggle.addEventListener("click", function () {
            showingAll = !showingAll;
            toggle.setAttribute("aria-pressed", showingAll ? "true" : "false");
            updateFlow();
        });

        var completedGates = new Set();
        main.addEventListener("lessoncheckcomplete", function (event) {
            var section = event.target.closest("section");
            var completedIndex = gates.indexOf(section);
            if (completedIndex < 0) return;
            completedGates.add(completedIndex);
            while (completedGates.has(unlocked)) unlocked += 1;
            try { window.localStorage.setItem(storageKey, String(unlocked)); } catch (error) { /* See above. */ }
            updateFlow();
        });

        window.addEventListener("hashchange", function () {
            var target = revealHashTarget();
            if (!target) return;
            updateFlow();
            requestAnimationFrame(function () { target.scrollIntoView({ block: "start" }); });
        });

        main.classList.add("lesson-flow");
        updateFlow();
    }

    function renderDisplay(host, display, fallback) {
        if (!display) { host.textContent = fallback || ""; return; }
        if (display.kind === "power") { host.appendChild(powerNode(display.base, display.index, display.ariaLabel)); return; }
        if (display.kind === "root") {
            var grouped = display.grouped || /[+\-−×÷]/.test(String(display.radicand).slice(1));
            host.appendChild(rootNode(display.radicand, display.order, display.lead, grouped, display.ariaLabel)); return;
        }
        if (display.parts) {
            display.parts.forEach(function (part) {
                if (part.t === "text") host.appendChild(document.createTextNode(part.v));
                else if (part.t === "power") host.appendChild(powerNode(part.b, part.i));
                else if (part.t === "root") host.appendChild(rootNode(part.r, part.order, part.lead, part.grouped));
            });
            return;
        }
        host.textContent = display.text || fallback || "";
    }

    function mount(root, rootIndex) {
        var api = questionApi(root);
        if (!api) return;
        var stage = Number(root.dataset.lessonCheck);

        function twoQuestions() {
            var picked = [];
            var fallback = [];
            for (var attempt = 0; attempt < 5 && picked.length < 2; attempt += 1) {
                api.buildRound(Math.random).filter(function (question) {
                    return question.stage === stage && question.mode !== "rows" && question.mode !== "grid";
                }).forEach(function (question) {
                    fallback.push(question);
                    var key = question.factKey || [question.title, question.expression,
                        question.display && (question.display.text || question.display.ariaLabel),
                        question.prompt].join("|");
                    if (!picked.some(function (held) { return held.key === key; })) picked.push({ key: key, question: question });
                });
            }
            var result = picked.slice(0, 2).map(function (held) { return held.question; });
            while (result.length < 2 && fallback.length) result.push(fallback[result.length % fallback.length]);
            return result;
        }

        var questions = twoQuestions();
        var shown = [];
        var completion;

        root.classList.add("lesson-check");
        root.setAttribute("role", "group");
        root.setAttribute("aria-label", "Check the idea");
        root.innerHTML = "";
        var body = node("div", "lesson-check__body");
        root.appendChild(body);

        function readAnswer(turn, question) {
            if (question.mode === "choice") return turn.querySelector("select[data-lesson-choice]").value;
            if (question.mode === "multi") {
                return Array.from(turn.querySelectorAll("input[type=checkbox]:checked")).map(function (input) {
                    return input.value;
                });
            }
            if (question.mode === "parts" || question.mode === "sequence") {
                return Array.from(turn.querySelectorAll("[data-lesson-part]")).map(function (input) {
                    return input.value;
                });
            }
            return turn.querySelector("input[data-lesson-answer]").value;
        }

        function addExpression(statement, question) {
            var expression = question.display || question.expression;
            if (!expression) return;
            var expressionNode = node("span", "lesson-check__expression");
            renderDisplay(expressionNode, question.display, question.expression);
            statement.append(document.createTextNode(" "), expressionNode);
        }

        var showAllQuestions = false;
        function updateQuestionVisibility() {
            var turns = Array.from(body.querySelectorAll(".lesson-check__turn"));
            turns.forEach(function (turn, index) {
                turn.hidden = !showAllQuestions && index > 0 &&
                    !turns[index - 1].classList.contains("is-correct") &&
                    !turn.classList.contains("is-correct");
            });
        }
        root.addEventListener("lessonquestionsvisibility", function (event) {
            showAllQuestions = !!event.detail?.all;
            if (showAllQuestions) questions.forEach(function (_, index) {
                if (!shown[index]) renderQuestion(index);
            });
            updateQuestionVisibility();
        });
        function revealNext(index) {
            if (index + 1 < questions.length) {
                if (!shown[index + 1]) renderQuestion(index + 1);
            }
            updateQuestionVisibility();
            if (body.querySelectorAll(".lesson-check__turn.is-correct").length !== questions.length) return;
            if (completion) return;
            completion = node("div", "lesson-check__complete");
            completion.appendChild(node("span", "lesson-check__tick", "✓"));
            completion.appendChild(node("strong", "", "Two examples complete."));
            var again = node("button", "lesson-check__again", "Try two more");
            again.type = "button";
            again.addEventListener("click", function () {
                questions = twoQuestions();
                shown = [];
                completion = null;
                body.innerHTML = "";
                renderQuestion(0);
            });
            completion.appendChild(again);
            body.appendChild(completion);
            root.dispatchEvent(new CustomEvent("lessoncheckcomplete", { bubbles: true }));
        }

        function renderQuestion(index) {
            var question = questions[index];
            if (!question) return;
            shown[index] = true;
            var hintLevel = 0;
            var attempts = 0;
            var solved = false;
            var turn = node("div", "lesson-check__turn");
            turn.setAttribute("role", "group");
            turn.setAttribute("aria-label", question.title || ("Example " + (index + 1)));

            var statement = node("p", "lesson-check__prompt");
            statement.appendChild(document.createTextNode(question.prompt));
            addExpression(statement, question);
            turn.appendChild(statement);

            var response = node("div", "lesson-check__response");
            var check = node("button", "lesson-check__check", "Check");
            check.type = "button";

            if (question.mode === "choice") {
                var selectLabel = node("label", "lesson-check__inline-choice");
                selectLabel.appendChild(node("span", "lesson-check__answer-label", question.choiceLegend || "Choose an answer"));
                var choice = node("select");
                choice.dataset.lessonChoice = "";
                choice.setAttribute("aria-label", question.choiceLegend || "Choose an answer");
                var placeholder = node("option", "", "?");
                placeholder.value = "";
                choice.appendChild(placeholder);
                question.options.forEach(function (option, optionIndex) {
                    var item = node("option", "", option);
                    item.value = String(optionIndex);
                    choice.appendChild(item);
                });
                selectLabel.appendChild(choice);
                response.appendChild(selectLabel);
            } else if (question.mode === "multi") {
                var choices = node("fieldset", "lesson-check__choice");
                choices.appendChild(node("legend", "", question.multiLegend || "Choose every answer that applies"));
                var options = node("div", "lesson-check__options");
                question.options.forEach(function (option) {
                    var label = node("label", "lesson-check__option");
                    var checkbox = node("input");
                    checkbox.type = "checkbox";
                    checkbox.name = "lesson-check-" + rootIndex + "-" + index;
                    checkbox.value = option;
                    label.append(checkbox, node("span", "", option));
                    options.appendChild(label);
                });
                choices.appendChild(options);
                response.appendChild(choices);
            } else if (question.mode === "parts") {
                var parts = node("fieldset", "lesson-check__choice");
                parts.appendChild(node("legend", "", question.partsLegend || "Complete each part"));
                var partOptions = node("div", "lesson-check__parts");
                question.cells.forEach(function (cell) {
                    var partLabel = node("label", "lesson-check__part");
                    partLabel.appendChild(node("span", "", cell.label));
                    var partInput = node("input");
                    partInput.type = "text";
                    partInput.inputMode = "numeric";
                    partInput.dataset.lessonPart = "";
                    partInput.setAttribute("aria-label", cell.label);
                    partLabel.appendChild(partInput);
                    partOptions.appendChild(partLabel);
                });
                parts.appendChild(partOptions);
                response.appendChild(parts);
            } else if (question.mode === "sequence") {
                var sequence = node("fieldset", "lesson-check__choice");
                sequence.appendChild(node("legend", "", question.sequenceLegend || "Put the values in order"));
                var sequenceOptions = node("div", "lesson-check__parts");
                question.positionLabels.forEach(function (position) {
                    var positionLabel = node("label", "lesson-check__part");
                    positionLabel.appendChild(node("span", "", position));
                    var select = node("select");
                    select.dataset.lessonPart = "";
                    var empty = node("option", "", "?");
                    empty.value = "";
                    select.appendChild(empty);
                    question.sequenceOptions.forEach(function (option) {
                        var item = node("option", "", option);
                        item.value = option;
                        select.appendChild(item);
                    });
                    positionLabel.appendChild(select);
                    sequenceOptions.appendChild(positionLabel);
                });
                sequence.appendChild(sequenceOptions);
                response.appendChild(sequence);
            } else {
                var answerLabel = node("label", "lesson-check__answer");
                var inputId = "lesson-check-" + rootIndex + "-" + index;
                answerLabel.htmlFor = inputId;
                answerLabel.appendChild(node("span", "lesson-check__answer-label", question.answerLabel || "Answer"));
                var entry = node("span", "lesson-check__entry");
                if (question.unitPrefix) entry.appendChild(node("span", "lesson-check__unit", question.unitPrefix));
                var input = node("input");
                input.id = inputId;
                input.type = "text";
                input.inputMode = "decimal";
                input.autocomplete = "off";
                input.dataset.lessonAnswer = "";
                entry.appendChild(input);
                if (question.unitSuffix) entry.appendChild(node("span", "lesson-check__unit", question.unitSuffix));
                answerLabel.appendChild(entry);
                response.appendChild(answerLabel);
            }

            if (question.mode !== "choice") response.appendChild(check);
            turn.appendChild(response);

            var feedback = node("p", "lesson-check__feedback");
            feedback.setAttribute("aria-live", "polite");
            turn.appendChild(feedback);

            var help = node("div", "lesson-check__help");
            var hint = node("button", "", "Hint");
            var solution = node("button", "", "Worked method");
            hint.type = "button";
            solution.type = "button";
            solution.hidden = true;
            help.append(hint, solution);
            turn.appendChild(help);

            var support = node("div", "lesson-check__support");
            support.hidden = true;
            turn.appendChild(support);
            body.appendChild(turn);

            function showSupport(kind) {
                if (kind === "solution" && !support.hidden && support.dataset.kind === "solution") {
                    support.hidden = true;
                    solution.textContent = "Worked method";
                    return;
                }
                support.innerHTML = "";
                support.dataset.kind = kind;
                if (kind === "solution") {
                    solution.textContent = "Hide method";
                    support.appendChild(node("b", "", "Worked method"));
                    var list = node("ol");
                    question.steps.forEach(function (step) { list.appendChild(node("li", "", step)); });
                    support.appendChild(list);
                } else {
                    hintLevel = Math.min(hintLevel + 1, Math.max(1, question.hints.length));
                    support.appendChild(node("b", "", "Hint: "));
                    support.appendChild(document.createTextNode(question.hints[hintLevel - 1] || "Use the worked example immediately above."));
                    solution.hidden = false;
                }
                support.hidden = false;
            }

            function mark() {
                var result = api.evaluateResponse(question, readAnswer(turn, question));
                feedback.textContent = result.text;
                turn.classList.toggle("is-correct", result.state === "correct");
                turn.classList.toggle("is-wrong", result.state === "wrong" || result.state === "unreadable");
                turn.classList.toggle("is-incomplete", result.state === "blank" || result.state === "incomplete");
                turn.querySelectorAll("[data-lesson-part]").forEach(function (part, partIndex) {
                    part.classList.toggle("is-correct-part", Boolean(result.correctPositions && result.correctPositions[partIndex]));
                });
                if (result.state === "correct") {
                    solved = true;
                    check.textContent = "Correct";
                    check.disabled = true;
                    hint.hidden = true;
                    revealNext(index);
                } else if (result.state === "wrong" || result.state === "unreadable") {
                    attempts += 1;
                    check.textContent = "Try again";
                    solution.hidden = attempts < 2;
                } else {
                    check.textContent = "Check";
                }
            }

            function reopenAfterEdit(event) {
                // Committing a native text edit can fire change as an accepted
                // input loses focus. Locked answers have not been edited again.
                if (event && event.target.readOnly) return;
                if (!solved) return;
                solved = false;
                check.textContent = "Check";
                check.disabled = false;
                hint.hidden = false;
                feedback.textContent = "";
                turn.classList.remove("is-correct", "is-wrong", "is-incomplete");
            }

            check.addEventListener("click", mark);
            hint.addEventListener("click", function () { showSupport("hint"); });
            solution.addEventListener("click", function () { showSupport("solution"); });

            var choice = turn.querySelector("select[data-lesson-choice]");
            if (choice) choice.addEventListener("change", function () {
                reopenAfterEdit();
                if (choice.value !== "") mark();
            });
            turn.querySelectorAll("input, select").forEach(function (control) {
                if (control === choice) return;
                control.addEventListener("input", reopenAfterEdit);
                control.addEventListener("change", reopenAfterEdit);
            });
            var singleInput = turn.querySelector("input[data-lesson-answer]");
            if (singleInput) singleInput.addEventListener("keydown", function (event) {
                if (event.key === "Enter" && !event.repeat) {
                    event.preventDefault();
                    mark();
                }
            });
        }

        renderQuestion(0);
    }

    roots.forEach(mount);
    setupLessonFlow(Array.from(roots));
})();
