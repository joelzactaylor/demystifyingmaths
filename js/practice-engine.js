/* The practice engine, shared by the powers-and-roots drills.

   Every practice page on the site runs the same journey: twelve questions in
   three named stages, one card at a time, with a hint, a worked solution, a
   verdict flash, and a reflection that filters by outcome and links each
   question back to the lesson section it came from. The written-methods pages
   each carry their own copy of that code, and the copies have drifted — only
   488 of 1,728 lines are common to all of them.

   This file is that journey, lifted from js/practiceLongDivision.js so the new
   pages match the old ones by construction rather than by imitation. A page
   supplies a bank: its stages, its question families, the functions that fill a
   question, and the two sentences its marking falls back on. Everything else —
   round building, marking, validation, and the whole of the page driver — is
   here and is identical for every page that uses it.

   The generator half runs without a document so it can be fuzzed from Node. */
(function (scope) {
    "use strict";


    function createEngine(bank) {
    function randomInt(rng, min, max) {
        return min + Math.floor(rng() * (max - min + 1));
    }

    function pick(values, rng) {
        return values[randomInt(rng, 0, values.length - 1)];
    }

    function shuffleIndexes(count, rng) {
        const order = [];
        for (let index = 0; index < count; index += 1) order.push(index);
        for (let index = count - 1; index > 0; index -= 1) {
            const swap = randomInt(rng, 0, index);
            const held = order[index];
            order[index] = order[swap];
            order[swap] = held;
        }
        return order;
    }

    /* Bounded draw with a valid fallback, so no generator can spin. */
    function drawValid(make, ok, fallback) {
        for (let attempt = 0; attempt < 40; attempt += 1) {
            const candidate = make();
            if (candidate && ok(candidate)) return candidate;
        }
        return fallback;
    }

    function groupDigits(text) {
        const parts = String(text).split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }


    /* The question every filler starts from. */
    function makeQuestion(stage, family) {
        return {
            stage: stage,
            family: family,
            factKey: "",
            contextKey: "",
            title: "",
            prompt: "",
            given: "",
            givenLabel: "",
            unitPrefix: "",
            unitSuffix: "",
            mode: "single",
            answerKind: "decimal",
            answerLabel: "Your answer",
            display: null,
            expected: 0,
            answerShown: "",
            correctNote: "",
            partsNote: "",
            summaryLine: "",
            printLine: "",
            misses: [],
            options: [],
            optionNotes: [],
            correctIndex: 0,
            choiceLegend: "",
            compactValues: false,
            cells: [],
            partsLegend: "",
            hints: [],
            steps: []
        };
    }

    /* What a bank is handed when it fills a question. */
    const tools = {
        randomInt: randomInt, pick: pick, shuffleIndexes: shuffleIndexes,
        drawValid: drawValid, groupDigits: groupDigits, nearlyEqual: nearlyEqual
    };

    function nearlyEqual(a, b) {
        return Math.abs(a - b) < 1e-9;
    }

    /* Random values can collide, so a near-miss note that happens to land on
       the correct answer is dropped rather than shown. */
    function tidyMisses(question) {
        const seen = [];
        question.misses = question.misses.filter(function (miss) {
            if (!miss.text || !Number.isFinite(miss.value)) return false;
            if (nearlyEqual(miss.value, question.expected)) return false;
            if (seen.some(function (value) { return nearlyEqual(value, miss.value); })) return false;
            seen.push(miss.value);
            return true;
        });
        return question;
    }

    function generateQuestion(stage, family, rng, excludedKey) {
        let built = bank.fillers[family](makeQuestion(stage, family), rng, tools);
        for (let attempt = 0; attempt < 8 && excludedKey && built.factKey === excludedKey; attempt += 1) {
            built = bank.fillers[family](makeQuestion(stage, family), rng, tools);
        }
        return tidyMisses(built);
    }

    function buildRound(rng) {
        const round = [];
        bank.families.forEach(function (families, stage) {
            const order = shuffleIndexes(families.length, rng);
            const used = [];
            order.forEach(function (index) {
                let built = generateQuestion(stage, families[index], rng);
                for (let attempt = 0; attempt < 8 && used.indexOf(built.contextKey) !== -1 && built.contextKey !== "plain" && built.contextKey !== "structure"; attempt += 1) {
                    built = generateQuestion(stage, families[index], rng);
                }
                used.push(built.contextKey);
                round.push(built);
            });
        });
        return round;
    }

    function createSeededRandom(seed) {
        let state = seed >>> 0 || 1;
        return function () {
            state ^= state << 13; state >>>= 0;
            state ^= state >> 17;
            state ^= state << 5; state >>>= 0;
            return state / 4294967296;
        };
    }

    /* ------------------------------------------------------------ marking */

    /* A reader who writes the unit as well as the number has still answered the
       question, so the unit is removed before the value is read. */
    function normalise(raw) {
        return String(raw === undefined || raw === null ? "" : raw)
            .replace(/[−‒–—]/g, "-")
            .replace(/[\s,£$]/g, "")
            .replace(/(\d)[a-z]+$/i, "$1")
            .trim();
    }

    function parseAmount(raw) {
        const cleaned = normalise(raw);
        if (!cleaned) return { blank: true };
        if (!/^-?\d*(\.\d+)?$/.test(cleaned) || cleaned === "-" || cleaned === ".") return { invalid: true };
        return { value: Number(cleaned), text: cleaned };
    }

    /* The same digits in the same order with the point somewhere else is a
       distinct, common slip, and worth saying so rather than falling through to
       general advice. */
    function sameDigits(left, right) {
        const strip = function (value) {
            return String(value).replace(/[^0-9]/g, "").replace(/^0+/, "").replace(/0+$/, "");
        };
        const a = strip(left);
        return Boolean(a) && a === strip(right);
    }

    function evaluateSingle(question, raw) {
        const parsed = parseAmount(raw);
        if (parsed.blank) return { state: "blank", text: "Enter an answer, then check it." };
        if (parsed.invalid) return { state: "unreadable", text: "That entry cannot be read as a number. Use digits, and a decimal point if one is needed." };
        if (nearlyEqual(parsed.value, question.expected)) {
            return { state: "correct", text: question.correctNote || "Correct." };
        }
        if (question.answerKind === "integer" && !Number.isInteger(parsed.value)) {
            return { state: "wrong", text: bank.notes.integer };
        }
        for (let index = 0; index < question.misses.length; index += 1) {
            if (nearlyEqual(parsed.value, question.misses[index].value)) {
                return { state: "wrong", text: question.misses[index].text };
            }
        }
        if (sameDigits(parsed.value, question.expected)) {
            return {
                state: "wrong",
                text: "Every digit is right and in the right order, so only the decimal point is out of place. Compare your answer with a rough estimate of the calculation to see where it belongs."
            };
        }
        return { state: "wrong", text: bank.notes.fallback };
    }

    function evaluateChoice(question, raw) {
        const cleaned = normalise(raw);
        if (cleaned === "") return { state: "blank", text: "Select one of the options, then check it." };
        const index = Number(cleaned);
        if (index === question.correctIndex) return { state: "correct", text: question.optionNotes[index] };
        return { state: "wrong", text: question.optionNotes[index] || "That option does not fit this stage." };
    }

    function evaluateParts(question, raw) {
        const values = Array.isArray(raw) ? raw : [];
        const entered = question.cells.map(function (cell, index) { return normalise(values[index]); });
        if (entered.every(function (text) { return text === ""; })) {
            return { state: "blank", text: "Fill in both parts, then check them.", correctPositions: [] };
        }
        if (entered.some(function (text) { return text === ""; })) {
            return {
                state: "incomplete",
                text: "One part is still empty. Complete every box before checking.",
                correctPositions: question.cells.map(function (cell, index) {
                    return entered[index] === "" ? undefined : entered[index] === cell.expected;
                })
            };
        }
        if (entered.some(function (text) { return !/^\d+$/.test(text); })) {
            return { state: "unreadable", text: "Each box takes a whole number written in digits.", correctPositions: [] };
        }
        const positions = question.cells.map(function (cell, index) { return entered[index] === cell.expected; });
        const wrong = positions.filter(function (ok) { return !ok; }).length;
        if (!wrong) return { state: "correct", text: question.correctNote || "Correct.", correctPositions: positions };
        const rightLabels = question.cells.filter(function (cell, index) { return positions[index]; })
            .map(function (cell) { return cell.label.toLowerCase(); });
        const wrongLabels = question.cells.filter(function (cell, index) { return !positions[index]; })
            .map(function (cell) { return cell.label.toLowerCase(); });
        const lead = rightLabels.length ? "The " + rightLabels.join(" and ") + " is right. " : "";
        return {
            state: "wrong",
            text: lead + "Look again at the " + wrongLabels.join(" and ") + ". " + (question.partsNote || ""),
            correctPositions: positions
        };
    }

    function evaluateResponse(question, raw) {
        if (question.mode === "choice") return evaluateChoice(question, raw);
        if (question.mode === "parts") return evaluateParts(question, raw);
        return evaluateSingle(question, raw);
    }

    /* --------------------------------------------------------- validation */

    function validateQuestion(question) {
        const problems = [];
        if (!question.title) problems.push("no title");
        if (!question.prompt) problems.push("no prompt");
        if (!question.summaryLine) problems.push("no summary line");
        if (!question.printLine) problems.push("no print line");
        if (!question.answerShown) problems.push("no answer shown");
        if (question.hints.length !== 2) problems.push("expected two hints");
        question.hints.forEach(function (hint, index) {
            if (!hint) problems.push("hint " + (index + 1) + " is empty");
            if (/undefined|NaN/.test(hint)) problems.push("hint " + (index + 1) + " has a broken value");
        });
        if (question.steps.length < 3) problems.push("fewer than three solution steps");
        question.steps.forEach(function (step, index) {
            if (!step) problems.push("step " + (index + 1) + " is empty");
            if (/undefined|NaN/.test(step)) problems.push("step " + (index + 1) + " has a broken value");
        });
        if (/undefined|NaN/.test(question.prompt)) problems.push("prompt has a broken value");
        if (question.mode === "single") {
            if (!Number.isFinite(question.expected)) problems.push("expected value is not finite");
            if (question.answerKind === "integer" && !Number.isInteger(question.expected)) problems.push("integer answer is not whole");
            question.misses.forEach(function (miss, index) {
                if (nearlyEqual(miss.value, question.expected)) problems.push("miss " + index + " equals the answer");
            });
        }
        if (question.mode === "choice") {
            if (question.options.length !== 4) problems.push("expected four options");
            if (new Set(question.options).size !== question.options.length) problems.push("duplicate options");
            if (question.correctIndex < 0) problems.push("no correct option");
        }
        if (question.mode === "parts") {
            question.cells.forEach(function (cell, index) {
                if (!cell.label) problems.push("cell " + index + " has no label");
                if (!/^\d+$/.test(cell.expected)) problems.push("cell " + index + " expects a non-digit value");
            });
        }
        if (bank.validate) bank.validate(question).forEach(function (problem) { problems.push(problem); });
        return problems;
    }

    function selfCheck(iterations) {
        const rounds = iterations || 200;
        const problems = [];
        for (let seed = 1; seed <= rounds; seed += 1) {
            const rng = createSeededRandom(seed * 2654435761);
            const round = buildRound(rng);
            if (round.length !== 12) problems.push("Round " + seed + " has " + round.length + " questions.");
            round.forEach(function (question, index) {
                const stage = Math.floor(index / 4);
                if (question.stage !== stage) problems.push("Question " + index + " has stage " + question.stage + ".");
                validateQuestion(question).forEach(function (problem) {
                    problems.push("Seed " + seed + " Q" + (index + 1) + " (" + question.family + "): " + problem);
                });
                if (question.mode === "single") {
                    if (evaluateResponse(question, String(question.expected)).state !== "correct") {
                        problems.push("Seed " + seed + " Q" + (index + 1) + " (" + question.family + "): exact answer rejected.");
                    }
                }
                if (question.mode === "parts") {
                    const exact = question.cells.map(function (cell) { return cell.expected; });
                    if (evaluateResponse(question, exact).state !== "correct") {
                        problems.push("Seed " + seed + " Q" + (index + 1) + " (" + question.family + "): exact parts rejected.");
                    }
                }
                if (question.mode === "choice") {
                    if (evaluateResponse(question, String(question.correctIndex)).state !== "correct") {
                        problems.push("Seed " + seed + " Q" + (index + 1) + " (" + question.family + "): correct option rejected.");
                    }
                }
            });
            if (problems.length > 40) break;
        }
        return problems;
    }

    const api = {
        STAGES: bank.stages, LESSON_URL: bank.lessonUrl, FAMILIES: bank.families,
        buildRound: buildRound, createSeededRandom: createSeededRandom,
        evaluateResponse: evaluateResponse, generateQuestion: generateQuestion,
        parseAmount: parseAmount, selfCheck: selfCheck, validateQuestion: validateQuestion
    };

    if (typeof document === "undefined") return api;
    /* ---------------------------------------------------------------- page */

    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function blankAnswer(question) {
        if (question.mode === "parts") return question.cells.map(function () { return ""; });
        return "";
    }

    function makeState(question) {
        return {
            answer: blankAnswer(question),
            attempts: 0,
            hintLevel: 0,
            solutionShown: false,
            solutionUsed: false,
            outcome: null,
            feedback: "",
            tone: "",
            replaceConfirm: false,
            correctPositions: []
        };
    }

    function hasAnswer(answer) {
        return Array.isArray(answer) ? answer.some(Boolean) : Boolean(String(answer).trim());
    }

    function answerSummary(question, answer) {
        if (!hasAnswer(answer)) return "No answer entered.";
        if (question.mode === "choice") {
            const option = question.options[Number(answer)];
            return option ? "Your choice: " + option : "No answer entered.";
        }
        if (question.mode === "parts") {
            return "Your answer: " + question.cells.map(function (cell, index) {
                return cell.label + " " + (String(answer[index] || "").trim() || "—");
            }).join("; ");
        }
        return "Your answer: " + (question.unitPrefix || "") + String(answer).trim()
            + (question.unitSuffix ? " " + question.unitSuffix : "");
    }

    function mount(root) {
        let round = buildRound(Math.random);
        let states = round.map(makeState);
        let current = 0;

        const questionView = root.querySelector("[data-question-view]");
        const reflection = root.querySelector("[data-reflection]");
        const card = root.querySelector("[data-question-card]");
        const title = root.querySelector("[data-question-title]");
        const prompt = root.querySelector("[data-question-prompt]");
        const expression = root.querySelector("[data-question-expression]");
        const givenWrap = root.querySelector("[data-question-given-wrap]");
        const givenLabel = root.querySelector("[data-question-given-label]");
        const given = root.querySelector("[data-question-given]");
        const singleWrap = root.querySelector("[data-single-answer]");
        const answerLabel = root.querySelector("[data-answer-label]");
        const answerEntry = root.querySelector("[data-answer-entry]");
        const unitPrefix = root.querySelector("[data-unit-prefix]");
        const unitSuffix = root.querySelector("[data-unit-suffix]");
        const input = root.querySelector("[data-answer-input]");
        const choiceField = root.querySelector("[data-choice-answer]");
        const choiceLegend = root.querySelector("[data-choice-legend]");
        const choiceOptions = root.querySelector("[data-choice-options]");
        const partsField = root.querySelector("[data-parts-answer]");
        const partsLegend = root.querySelector("[data-parts-legend]");
        const partsList = root.querySelector("[data-parts-list]");
        const feedback = root.querySelector("[data-feedback]");
        const verdictOverlay = root.querySelector("[data-verdict-overlay]");
        const verdictWord = root.querySelector("[data-verdict-word]");
        const hintButton = root.querySelector("[data-hint-button]");
        const hintPanel = root.querySelector("[data-hint-panel]");
        const hintText = root.querySelector("[data-hint-text]");
        const checkButton = root.querySelector("[data-check-answer]");
        const newQuestionButton = root.querySelector("[data-new-question]");
        const solutionButton = root.querySelector("[data-solution-button]");
        const solutionPanel = root.querySelector("[data-solution-panel]");
        const solutionSteps = root.querySelector("[data-solution-steps]");
        const previousButton = root.querySelector("[data-previous]");
        const nextButton = root.querySelector("[data-next]");
        const progressStage = root.querySelector("[data-progress-stage]");
        const progressCount = root.querySelector("[data-progress-count]");
        const progressBar = root.querySelector("[data-progress-bar]");
        const stageIndicators = Array.from(root.querySelectorAll("[data-stage-indicator]"));
        const independentCount = root.querySelector("[data-independent-count]");
        const supportedCount = root.querySelector("[data-supported-count]");
        const revisitCount = root.querySelector("[data-revisit-count]");
        const reflectionIntro = root.querySelector("[data-reflection-intro]");
        const reflectionFilters = Array.from(root.querySelectorAll("[data-reflection-filter]"));
        const reflectionSummaryIntro = root.querySelector("[data-reflection-summary-intro]");
        const reflectionQuestions = root.querySelector("[data-reflection-questions]");
        const showAllQuestionsButton = root.querySelector("[data-show-all-questions]");
        const reflectionStages = root.querySelector("[data-reflection-stages]");
        const freshRoundButton = root.querySelector("[data-fresh-round]");
        const reviewLastButton = root.querySelector("[data-review-last]");
        const printSheet = root.querySelector("[data-print-sheet]");
        const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
        let verdictTimer = 0;

        function state() { return states[current]; }
        function question() { return round[current]; }

        function setFeedback(text, tone) {
            const currentState = state();
            currentState.feedback = text;
            currentState.tone = tone || "";
            feedback.textContent = text;
            if (tone) feedback.dataset.tone = tone;
            else delete feedback.dataset.tone;
        }

        function clearVerdict() {
            window.clearTimeout(verdictTimer);
            verdictOverlay.classList.remove("is-showing", "is-right", "is-wrong");
            card.classList.remove("is-celebrating", "is-nudged");
        }

        function showVerdict(kind) {
            clearVerdict();
            verdictWord.textContent = kind === "right" ? "YES" : "TRY AGAIN";
            void verdictOverlay.offsetWidth;
            verdictOverlay.classList.add("is-showing", "is-" + kind);
            card.classList.add(kind === "right" ? "is-celebrating" : "is-nudged");
            const reduce = Boolean(reducedMotion && reducedMotion.matches);
            const duration = reduce ? 840 : kind === "right" ? 2175 : 1350;
            verdictTimer = window.setTimeout(clearVerdict, duration);
        }

        function clearOutcomeForEdit(preservePositions) {
            const currentState = state();
            currentState.replaceConfirm = false;
            if (currentState.outcome) {
                currentState.outcome = null;
                card.classList.remove("is-correct");
                card.classList.add("is-review");
            }
            if (!preservePositions) currentState.correctPositions = [];
            if (currentState.attempts || currentState.feedback) setFeedback("Answer changed.", "");
            updateActionState();
        }

        function renderChoice(currentQuestion, currentState) {
            choiceLegend.textContent = currentQuestion.choiceLegend;
            choiceOptions.classList.toggle("is-value-grid", Boolean(currentQuestion.compactValues));
            choiceOptions.replaceChildren();
            currentQuestion.options.forEach(function (option, index) {
                const id = "long-choice-" + current + "-" + index;
                const label = element("label", "practice-choice__option");
                if (currentQuestion.compactValues) label.classList.add("is-value-choice");
                const radio = element("input");
                radio.type = "radio";
                radio.name = "long-choice-" + current;
                radio.id = id;
                radio.value = String(index);
                radio.checked = currentState.answer === String(index);
                radio.setAttribute("aria-describedby", "practice-feedback practice-hint");
                label.classList.toggle("is-selected", radio.checked);
                label.appendChild(radio);
                if (!currentQuestion.compactValues) label.appendChild(element("span", "", String.fromCharCode(65 + index)));
                label.appendChild(element("span", "", option));
                radio.addEventListener("keydown", handleEnter);
                radio.addEventListener("change", function () {
                    currentState.answer = radio.value;
                    Array.from(choiceOptions.children).forEach(function (node) { node.classList.remove("is-selected"); });
                    label.classList.add("is-selected");
                    clearOutcomeForEdit();
                });
                choiceOptions.appendChild(label);
            });
        }

        function applyPartStates() {
            const currentState = state();
            Array.from(partsList.querySelectorAll(".practice-parts__cell")).forEach(function (cell, index) {
                const field = cell.querySelector("input");
                const verdict = currentState.correctPositions[index];
                cell.classList.toggle("is-correct", verdict === true);
                cell.classList.toggle("is-wrong", verdict === false);
                if (verdict === false) field.setAttribute("aria-invalid", "true");
                else field.removeAttribute("aria-invalid");
            });
        }

        function renderParts(currentQuestion, currentState) {
            partsLegend.textContent = currentQuestion.partsLegend;
            partsList.replaceChildren();
            currentQuestion.cells.forEach(function (cell, index) {
                const id = "long-part-" + current + "-" + index;
                const wrap = element("label", "practice-parts__cell");
                wrap.htmlFor = id;
                wrap.appendChild(element("span", "practice-parts__label", cell.label));
                const field = element("input");
                field.type = "text";
                field.id = id;
                field.inputMode = "numeric";
                field.maxLength = 6;
                field.autocomplete = "off";
                field.spellcheck = false;
                field.value = currentState.answer[index] || "";
                field.setAttribute("aria-describedby", "practice-feedback practice-hint");
                wrap.appendChild(field);
                field.addEventListener("input", function () {
                    const cleaned = field.value.replace(/[^0-9]/g, "").slice(0, 6);
                    if (cleaned !== field.value) field.value = cleaned;
                    currentState.answer[index] = cleaned;
                    currentState.correctPositions[index] = undefined;
                    clearOutcomeForEdit(true);
                    applyPartStates();
                });
                field.addEventListener("keydown", handleEnter);
                partsList.appendChild(wrap);
            });
            applyPartStates();
        }

        /* The one part of the driver a page can differ in. Inline notation is
           handled here because every page uses it; anything a page draws for
           itself comes from the bank, handed the same element helper. */
        function renderExpression(currentQuestion) {
            const display = currentQuestion.display;
            expression.replaceChildren();
            expression.className = "practice-question__expression";
            expression.hidden = !display;
            if (!display) return;
            expression.setAttribute("aria-label", display.ariaLabel || "");
            if (display.kind === "inline") {
                    expression.textContent = display.text;
                return;
            }
            if (display.kind === "power") { renderPower(display); return; }
            if (display.kind === "root") { renderRoot(display); return; }
            if (bank.renderDisplay) bank.renderDisplay(expression, display, element);
        }

        /* Notation the whole site writes the same way, so it is drawn here
           rather than in each bank. A raised index carries the clipped caret
           that stops 2^5 flattening into twenty-five; a root is drawn — an SVG
           arm beside a radicand carrying the bar as a border — because a
           browser lays <msqrt> out from a font's OpenType MATH table and macOS
           ships no font that has one. */
        function clipped(text) {
            const mark = element("span", "caret", text);
            mark.setAttribute("aria-hidden", "true");
            return mark;
        }

        function renderPower(display) {
            const holder = element("span", "practice-power");
            holder.setAttribute("role", "math");
            holder.setAttribute("aria-label", display.ariaLabel || "");
            holder.appendChild(document.createTextNode(display.base));
            holder.appendChild(clipped("^"));
            holder.appendChild(element("sup", "", display.index));
            expression.appendChild(holder);
        }

        const SVG_NS = "http://www.w3.org/2000/svg";

        function renderRoot(display) {
            const holder = element("span", "practice-radical");
            holder.setAttribute("role", "math");
            holder.setAttribute("aria-label", display.ariaLabel || "");
            const order = display.order && Number(display.order) > 2 ? String(display.order) : "";
            const supers = { "3": "³", "4": "⁴", "5": "⁵", "6": "⁶" };
            const grouped = /[+\-−×÷]/.test(String(display.radicand).slice(1)) || display.grouped;
            /* Anything written before the sign — a minus, a coefficient — is
               part of the expression the reader is answering, so it has to be
               drawn. Left in a caption instead, the card shows √100 while the
               question means −√100, and 10 becomes a right answer to what is
               on the screen. */
            if (display.lead) holder.appendChild(document.createTextNode(display.lead));
            const rad = element("span", order ? "rad rad--order" : "rad");
            rad.appendChild(clipped((order ? supers[order] || "" : "") + "√" + (grouped ? "(" : "")));
            if (order) {
                const index = element("span", "rad__index");
                index.setAttribute("data-order", order);
                index.setAttribute("aria-hidden", "true");
                rad.appendChild(index);
            }
            const svg = document.createElementNS(SVG_NS, "svg");
            svg.setAttribute("class", "rad__sign");
            svg.setAttribute("viewBox", "0 0 24 40");
            svg.setAttribute("aria-hidden", "true");
            svg.setAttribute("focusable", "false");
            const path = document.createElementNS(SVG_NS, "path");
            path.setAttribute("d", "M.5 24H5l5.5 13.5L22 1.5H24");
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", "currentColor");
            path.setAttribute("stroke-width", "3");
            path.setAttribute("stroke-linejoin", "miter");
            path.setAttribute("stroke-linecap", "butt");
            svg.appendChild(path);
            rad.appendChild(svg);
            rad.appendChild(element("span", "rad__over", String(display.radicand)));
            holder.appendChild(rad);
            if (grouped) holder.appendChild(clipped(")"));
            if (display.tail) holder.appendChild(document.createTextNode(display.tail));
            expression.appendChild(holder);
        }


        function populateSolution(currentQuestion) {
            solutionSteps.replaceChildren.apply(solutionSteps, currentQuestion.steps.map(function (step) {
                return element("li", "", step);
            }));
        }

        function updateActionState() {
            const currentState = state();
            hintButton.disabled = Boolean(currentState.outcome) || currentState.hintLevel >= 2;
            if (currentState.outcome) {
                checkButton.textContent = current === round.length - 1 ? "Finish this round" : "Continue";
                hintButton.textContent = "Question complete";
            } else {
                checkButton.textContent = currentState.attempts > 0 ? "Check again" : "Check my answer";
                hintButton.textContent = currentState.hintLevel === 0
                    ? (currentState.attempts > 0 ? "Help me fix it" : "Give me a hint")
                    : (currentState.hintLevel === 1 ? "One more hint" : "Both hints shown");
            }
            newQuestionButton.textContent = currentState.replaceConfirm ? "Replace this question" : "Try different numbers";
            previousButton.disabled = current === 0;
            if (current === round.length - 1) nextButton.textContent = currentState.outcome ? "Finish this round" : "Finish for now";
            else nextButton.textContent = currentState.outcome ? "Continue" : "Move on for now";
        }

        function render(focusHeading) {
            clearVerdict();
            const currentQuestion = question();
            const currentState = state();
            const stage = currentQuestion.stage;

            questionView.hidden = false;
            reflection.hidden = true;
            progressStage.textContent = bank.stages[stage].name;
            progressCount.textContent = "Question " + (current + 1) + " of " + round.length;
            progressBar.style.width = ((current + 1) / round.length * 100) + "%";
            stageIndicators.forEach(function (indicator, index) {
                indicator.classList.toggle("is-current", index === stage);
                indicator.classList.toggle("is-complete", index < stage);
                if (index === stage) indicator.setAttribute("aria-current", "step");
                else indicator.removeAttribute("aria-current");
            });

            title.textContent = currentQuestion.title;
            /* A value the question hands the reader sits in its own labelled
               panel rather than inside the sentence. */
            givenWrap.hidden = !currentQuestion.given;
            givenLabel.textContent = currentQuestion.givenLabel || "Given";
            given.textContent = currentQuestion.given || "";
            prompt.textContent = currentQuestion.prompt;
            renderExpression(currentQuestion);
            answerLabel.textContent = currentQuestion.answerLabel;

            singleWrap.hidden = currentQuestion.mode !== "single";
            choiceField.hidden = currentQuestion.mode !== "choice";
            partsField.hidden = currentQuestion.mode !== "parts";
            unitPrefix.textContent = currentQuestion.unitPrefix || "";
            unitPrefix.hidden = !currentQuestion.unitPrefix;
            unitSuffix.textContent = currentQuestion.unitSuffix || "";
            unitSuffix.hidden = !currentQuestion.unitSuffix;
            answerEntry.classList.toggle("has-prefix", Boolean(currentQuestion.unitPrefix));
            answerEntry.classList.toggle("has-suffix", Boolean(currentQuestion.unitSuffix));
            if (currentQuestion.mode === "single") {
                input.value = currentState.answer;
                input.inputMode = currentQuestion.answerKind === "integer" ? "numeric" : "decimal";
                input.setAttribute("aria-label", currentQuestion.answerLabel + " for " + currentQuestion.summaryLine);
            } else if (currentQuestion.mode === "choice") {
                renderChoice(currentQuestion, currentState);
            } else {
                renderParts(currentQuestion, currentState);
            }

            card.classList.toggle("is-correct", Boolean(currentState.outcome));
            card.classList.toggle("is-review", !currentState.outcome && currentState.attempts > 0);
            setFeedback(currentState.feedback || "", currentState.tone || "");
            hintPanel.hidden = currentState.hintLevel === 0;
            if (currentState.hintLevel > 0) hintText.textContent = currentQuestion.hints[currentState.hintLevel - 1];
            solutionPanel.hidden = !currentState.solutionShown;
            solutionButton.setAttribute("aria-expanded", String(currentState.solutionShown));
            solutionButton.textContent = currentState.solutionShown ? "Hide the worked solution" : "Show a worked solution";
            populateSolution(currentQuestion);
            updateActionState();
            buildPrintSheet();
            if (focusHeading) title.focus({ preventScroll: true });
        }

        function readAnswer() {
            const currentQuestion = question();
            if (currentQuestion.mode === "single") return input.value;
            if (currentQuestion.mode === "choice") {
                const selected = choiceOptions.querySelector("input:checked");
                return selected ? selected.value : "";
            }
            return Array.from(partsList.querySelectorAll("input")).map(function (field) { return field.value; });
        }

        function checkAnswer() {
            const currentState = state();
            currentState.answer = readAnswer();
            const result = evaluateResponse(question(), currentState.answer);
            currentState.replaceConfirm = false;
            currentState.correctPositions = result.correctPositions || [];
            if (question().mode === "parts") applyPartStates();

            if (result.state === "blank" || result.state === "unreadable" || result.state === "incomplete") {
                setFeedback(result.text, "consider");
                updateActionState();
                return;
            }

            currentState.attempts += 1;
            if (result.state === "correct") {
                currentState.outcome = currentState.attempts === 1 && currentState.hintLevel === 0 && !currentState.solutionUsed
                    ? "independent"
                    : "supported";
                setFeedback(result.text, "positive");
                card.classList.add("is-correct");
                card.classList.remove("is-review");
                showVerdict("right");
            } else {
                currentState.outcome = null;
                setFeedback(result.text, "consider");
                card.classList.remove("is-correct");
                card.classList.add("is-review");
                showVerdict("wrong");
            }
            updateActionState();
            buildPrintSheet();
        }

        function handleEnter(event) {
            if (event.key !== "Enter") return;
            event.preventDefault();
            if (event.repeat) return;
            if (state().outcome) nextButton.click();
            else checkAnswer();
        }

        function showHint() {
            const currentState = state();
            if (currentState.hintLevel >= 2) return;
            currentState.hintLevel += 1;
            currentState.replaceConfirm = false;
            hintPanel.hidden = false;
            hintText.textContent = question().hints[currentState.hintLevel - 1];
            updateActionState();
        }

        function toggleSolution() {
            const currentState = state();
            currentState.solutionShown = !currentState.solutionShown;
            if (currentState.solutionShown) currentState.solutionUsed = true;
            solutionPanel.hidden = !currentState.solutionShown;
            solutionButton.setAttribute("aria-expanded", String(currentState.solutionShown));
            solutionButton.textContent = currentState.solutionShown ? "Hide the worked solution" : "Show a worked solution";
            if (currentState.solutionShown) populateSolution(question());
            buildPrintSheet();
        }

        function focusAnswer() {
            const currentQuestion = question();
            if (currentQuestion.mode === "single") {
                input.focus({ preventScroll: true });
                return;
            }
            const control = root.querySelector(currentQuestion.mode === "choice"
                ? "[data-choice-options] input"
                : "[data-parts-list] input");
            if (control) control.focus({ preventScroll: true });
        }

        function replaceQuestion() {
            const currentState = state();
            const hasWork = hasAnswer(currentState.answer) || currentState.attempts
                || currentState.hintLevel || currentState.solutionShown;
            if (hasWork && !currentState.replaceConfirm) {
                currentState.replaceConfirm = true;
                setFeedback("Different numbers will replace the work in this question only. Press “Replace this question” to continue.", "consider");
                updateActionState();
                return;
            }
            const oldQuestion = question();
            round[current] = generateQuestion(oldQuestion.stage, oldQuestion.family, Math.random, oldQuestion.factKey);
            states[current] = makeState(round[current]);
            render(false);
            focusAnswer();
        }

        function buildPrintSheet() {
            printSheet.replaceChildren();
            bank.stages.forEach(function (stage, stageIndex) {
                printSheet.appendChild(element("h3", "", stage.name));
                const list = element("ol");
                round.forEach(function (item, index) {
                    if (item.stage !== stageIndex) return;
                    const entry = element("li", "practice-print-question");
                    if (item.given) entry.appendChild(element("p", "", (item.givenLabel || "Given") + ": " + item.given));
                    entry.appendChild(element("p", "", item.printLine));
                    if (item.mode === "choice") {
                        const options = element("ul");
                        item.options.forEach(function (option) { options.appendChild(element("li", "", option)); });
                        entry.appendChild(options);
                    }
                    entry.appendChild(element("span", "practice-print-working", ""));
                    if (states[index].solutionShown) {
                        const solution = element("div", "practice-print-solution");
                        solution.appendChild(element("b", "", "Worked solution: " + item.answerShown));
                        const steps = element("ol");
                        item.steps.forEach(function (step) { steps.appendChild(element("li", "", step)); });
                        solution.appendChild(steps);
                        entry.appendChild(solution);
                    }
                    list.appendChild(entry);
                });
                printSheet.appendChild(list);
            });
        }

        function renderReflectionQuestions(filter) {
            const labels = {
                independent: "Completed independently",
                supported: "Completed with support",
                revisit: "Worth revisiting"
            };
            const filtered = round.map(function (item, index) {
                return { item: item, index: index, state: states[index] };
            }).filter(function (entry) {
                if (filter === "independent") return entry.state.outcome === "independent";
                if (filter === "supported") return entry.state.outcome === "supported";
                if (filter === "revisit") return !entry.state.outcome;
                return true;
            });
            reflectionFilters.forEach(function (button) {
                button.setAttribute("aria-pressed", String(button.dataset.reflectionFilter === filter));
            });
            showAllQuestionsButton.hidden = filter === "all";
            reflectionSummaryIntro.textContent = filter === "all"
                ? "All " + round.length + " questions are listed below."
                : filtered.length + " " + (filtered.length === 1 ? "question is" : "questions are")
                    + " " + labels[filter].toLowerCase() + ".";

            reflectionQuestions.replaceChildren.apply(reflectionQuestions, filtered.map(function (entry) {
                const row = element("li", "practice-reflection-question");
                const heading = element("div", "practice-reflection-question__heading");
                const outcome = entry.state.outcome || "revisit";
                heading.appendChild(element("strong", "", "Question " + (entry.index + 1)));
                heading.appendChild(element("span", "is-" + outcome, labels[outcome]));
                row.appendChild(heading);
                row.appendChild(element("p", "practice-reflection-question__stage", bank.stages[entry.item.stage].name));
                row.appendChild(element("p", "practice-reflection-question__expression", entry.item.summaryLine));
                if (entry.item.given) {
                    row.appendChild(element("p", "practice-reflection-question__given",
                        (entry.item.givenLabel || "Given") + ": " + entry.item.given));
                }
                row.appendChild(element("p", "practice-reflection-question__given", entry.item.prompt));
                row.appendChild(element("p", "practice-reflection-question__answer", answerSummary(entry.item, entry.state.answer)));
                const link = element("a", "", "Return to question " + (entry.index + 1));
                link.href = "#practice-question-title";
                link.dataset.reviewQuestion = String(entry.index);
                row.appendChild(link);
                return row;
            }));
        }

        function showReflection() {
            questionView.hidden = true;
            reflection.hidden = false;
            progressBar.style.width = "100%";
            stageIndicators.forEach(function (indicator) {
                indicator.classList.remove("is-current");
                indicator.classList.add("is-complete");
                indicator.removeAttribute("aria-current");
            });
            const counts = states.reduce(function (totals, item) {
                if (item.outcome === "independent") totals.independent += 1;
                else if (item.outcome === "supported") totals.supported += 1;
                else totals.revisit += 1;
                return totals;
            }, { independent: 0, supported: 0, revisit: 0 });
            independentCount.textContent = String(counts.independent);
            supportedCount.textContent = String(counts.supported);
            revisitCount.textContent = String(counts.revisit);
            reflectionIntro.textContent = counts.revisit === 0
                ? "All " + round.length + " questions have a checked answer."
                : (round.length - counts.revisit) + " checked; " + counts.revisit + " "
                    + (counts.revisit === 1 ? "is" : "are") + " worth revisiting.";
            renderReflectionQuestions("all");
            reflectionStages.replaceChildren.apply(reflectionStages, bank.stages.map(function (stage, stageIndex) {
                const stageStates = states.slice(stageIndex * 4, stageIndex * 4 + 4);
                const revisit = stageStates.filter(function (item) { return !item.outcome; }).length;
                const row = element("li");
                /* A drill's stages are sections of its one lesson, so each row
                   deep-links to the section. A review draws on several lessons,
                   and names them: stage.lessons carries {label, url} and the row
                   offers one link per lesson instead of an anchor. */
                if (stage.lessons) {
                    const heading = element("div", "practice-reflection__stage-name");
                    heading.appendChild(element("b", "", stage.name));
                    if (revisit) heading.appendChild(element("span", "", revisit + " to revisit"));
                    row.appendChild(heading);
                    const links = element("div", "practice-reflection__stage-links");
                    stage.lessons.forEach(function (lesson) {
                        const each = element("a", "", "Open the lesson on " + lesson.label.toLowerCase());
                        each.href = lesson.url;
                        links.appendChild(each);
                    });
                    row.appendChild(links);
                    return row;
                }
                row.appendChild(element("b", "", stage.name));
                const link = element("a", "", revisit
                    ? revisit + " to revisit · open this section of the lesson"
                    : "Open this section of the lesson");
                link.href = bank.lessonUrl + "#" + stage.lessonAnchor;
                row.appendChild(link);
                return row;
            }));
            buildPrintSheet();
            root.querySelector("#reflection-title").focus({ preventScroll: true });
        }

        input.addEventListener("input", function () {
            state().answer = input.value;
            clearOutcomeForEdit();
        });
        input.addEventListener("keydown", handleEnter);
        checkButton.addEventListener("click", function () {
            if (state().outcome) nextButton.click();
            else checkAnswer();
        });
        hintButton.addEventListener("click", showHint);
        solutionButton.addEventListener("click", toggleSolution);
        newQuestionButton.addEventListener("click", replaceQuestion);
        previousButton.addEventListener("click", function () {
            if (current === 0) return;
            current -= 1;
            render(true);
        });
        nextButton.addEventListener("click", function () {
            if (current === round.length - 1) {
                showReflection();
                return;
            }
            current += 1;
            render(true);
        });
        freshRoundButton.addEventListener("click", function () {
            round = buildRound(Math.random);
            states = round.map(makeState);
            current = 0;
            render(true);
        });
        reviewLastButton.addEventListener("click", function () {
            current = round.length - 1;
            render(true);
        });
        reflectionFilters.forEach(function (button) {
            button.addEventListener("click", function () { renderReflectionQuestions(button.dataset.reflectionFilter); });
        });
        showAllQuestionsButton.addEventListener("click", function () { renderReflectionQuestions("all"); });
        reflectionQuestions.addEventListener("click", function (event) {
            const link = event.target.closest("[data-review-question]");
            if (!link) return;
            event.preventDefault();
            current = Number(link.dataset.reviewQuestion);
            render(true);
        });
        window.addEventListener("beforeprint", buildPrintSheet);
        render(false);
    }

    const root = document.querySelector("[data-practice-root]");
    if (root) mount(root);
    return api;
    }

    scope.PracticeEngine = { create: createEngine };
    if (typeof module !== "undefined" && module.exports) module.exports = { create: createEngine };
})(typeof window !== "undefined" ? window : globalThis);
