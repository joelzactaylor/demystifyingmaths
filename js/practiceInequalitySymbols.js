(function (scope) {
    "use strict";

    const STAGES = [
        { name: "Basic comparisons", lessonAnchor: "equal-and-not-equal" },
        { name: "Extended symbols", lessonAnchor: "adding-or-equal-to" },
        { name: "Integer solutions", lessonAnchor: "values-between-two-boundaries" }
    ];
    const LESSON_URL = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/inequalitySymbols.html";

    function randomInt(rng, min, max) {
        return min + Math.min(max - min, Math.floor(Math.max(0, rng()) * (max - min + 1)));
    }

    function pick(values, rng) {
        return values[randomInt(rng, 0, values.length - 1)];
    }

    function shuffle(values, rng) {
        const result = values.slice();
        for (let index = result.length - 1; index > 0; index -= 1) {
            const other = randomInt(rng, 0, index);
            const value = result[index];
            result[index] = result[other];
            result[other] = value;
        }
        return result;
    }

    function numericLabel(value) {
        return String(value).replace(/-/g, "−");
    }

    function parseNumber(raw) {
        if (typeof raw !== "string") return NaN;
        const cleaned = raw.trim().replace(/[,\s]/g, "").replace(/[−–—]/g, "-");
        if (!cleaned || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(cleaned)) return NaN;
        const value = Number(cleaned);
        return Number.isFinite(value) ? value : NaN;
    }

    function compare(left, right) {
        return left < right ? "<" : left > right ? ">" : "=";
    }

    function joinValues(values) {
        if (values.length === 0) return "none";
        if (values.length === 1) return values[0];
        return values.slice(0, -1).join(", ") + " and " + values[values.length - 1];
    }

    function makeBasicValues(family, rng) {
        if (family === 0) {
            let left = randomInt(rng, 2, 90);
            let right = randomInt(rng, 2, 90);
            if (left === right) right += 1;
            if (rng() < .5) return [left, right];
            return [right, left];
        }
        if (family === 1) {
            const whole = randomInt(rng, 0, 9);
            const digit = randomInt(rng, 1, 9);
            return [Number(whole + "." + digit), Number(whole + "." + digit)];
        }
        if (family === 2) {
            const whole = randomInt(rng, 0, 8);
            const tenths = randomInt(rng, 1, 8);
            const hundredths = randomInt(rng, 1, 9);
            const left = Number(whole + "." + tenths);
            const right = Number(whole + "." + tenths + hundredths);
            return rng() < .5 ? [left, right] : [right, left];
        }
        const first = -randomInt(rng, 1, 12);
        let second = -randomInt(rng, 1, 12);
        if (first === second) second = first === -12 ? -11 : first - 1;
        return rng() < .5 ? [first, second] : [second, first];
    }

    function displayBasicValue(value, family, side, rng) {
        if (family === 1) {
            const plain = String(value);
            return side === 0 && rng() < .5 ? plain + "0" : side === 1 ? plain + "00" : plain;
        }
        if (family === 2) return String(value);
        return numericLabel(value);
    }

    function makeBasicQuestion(family, rng) {
        const values = makeBasicValues(family, rng);
        const left = values[0];
        const right = values[1];
        const leftText = displayBasicValue(left, family, 0, rng);
        const rightText = displayBasicValue(right, family, 1, rng);
        const answer = compare(left, right);
        const options = ["<", "=", ">"];
        const comparison = leftText + " ? " + rightText;
        let reason;
        if (answer === "=") reason = leftText + " and " + rightText + " have the same value.";
        else if (family === 3) reason = "On a number line, " + numericLabel(Math.max(left, right)) + " lies further right.";
        else if (family === 2) reason = "Write the shorter decimal with a trailing zero, then compare matching places.";
        else reason = numericLabel(Math.max(left, right)) + " is the larger value.";

        return {
            stage: 0,
            family: family,
            mode: "choice",
            factKey: comparison,
            title: "Choose the correct symbol",
            givenLabel: "Comparison",
            given: comparison,
            showGiven: false,
            prompt: "Which symbol makes this comparison true?",
            expression: comparison,
            choiceLegend: "Choose one symbol",
            showChoiceLetters: false,
            compactSymbols: true,
            options: options,
            answerIndex: options.indexOf(answer),
            answerText: answer,
            hints: [
                answer === "=" ? "Check whether the two values are written differently but represent the same amount." : "Decide which value lies further left on a number line.",
                family === 3 ? "Among negative values, the number closer to zero is larger." : "The point of < or > faces the smaller value."
            ],
            steps: [
                family === 2 || family === 1 ? "Compare the digits in matching place-value columns." : "Place the two values in order.",
                reason,
                answer === "=" ? "Equal values use =." : "The point faces the smaller value and the wide opening faces the larger value.",
                "Therefore, " + leftText + " " + answer + " " + rightText + "."
            ],
            success: leftText + " " + answer + " " + rightText + " is true.",
            nudge: family === 3
                ? "Check the order of the negative values, then make the point face the smaller one."
                : "Compare the two values first, then make the point face the smaller one."
        };
    }

    function makeExtendedQuestion(family, rng) {
        const variable = pick(["n", "p", "t", "x"], rng);
        const bound = randomInt(rng, -8, 15);
        const boundText = numericLabel(bound);
        let phrase;
        let correct;
        let explanation;

        if (family === 0) {
            phrase = pick(["is at most ", "is no more than ", "has a maximum value of "], rng) + boundText;
            correct = variable + " ≤ " + boundText;
            explanation = "The boundary " + boundText + " is included, together with every value below it.";
        } else if (family === 1) {
            phrase = pick(["is at least ", "is no less than ", "has a minimum value of "], rng) + boundText;
            correct = variable + " ≥ " + boundText;
            explanation = "The boundary " + boundText + " is included, together with every value above it.";
        } else if (family === 2) {
            phrase = "is not equal to " + boundText;
            correct = variable + " ≠ " + boundText;
            explanation = "The crossed equals sign says only that the two values do not match.";
        } else {
            const below = rng() < .5;
            phrase = below
                ? "can equal " + boundText + " but cannot be greater than " + boundText
                : "can equal " + boundText + " but cannot be less than " + boundText;
            correct = variable + (below ? " ≤ " : " ≥ ") + boundText;
            explanation = "The short equality line includes the boundary value " + boundText + ".";
        }

        const candidates = [
            variable + " < " + boundText,
            variable + " ≤ " + boundText,
            variable + " > " + boundText,
            variable + " ≥ " + boundText,
            variable + " = " + boundText,
            variable + " ≠ " + boundText
        ];
        const distractors = shuffle(candidates.filter(function (item) { return item !== correct; }), rng).slice(0, 3);
        const options = shuffle([correct].concat(distractors), rng);
        const answerIndex = options.indexOf(correct);

        return {
            stage: 1,
            family: family,
            mode: "choice",
            factKey: variable + ":" + phrase,
            title: "Choose the matching statement",
            givenLabel: "Statement",
            given: variable + " " + phrase,
            showGiven: false,
            prompt: "Choose the mathematical statement with the same meaning.",
            expression: variable + " " + phrase,
            expressionKind: "words",
            choiceLegend: "Choose one statement",
            showChoiceLetters: false,
            options: options,
            answerIndex: answerIndex,
            answerText: correct,
            hints: [
                family === 2 ? "Not equal compares whether the values match; it does not say which is larger." : "Decide whether values below or above the boundary are allowed.",
                family === 2 ? "Use the equals sign with a line through it." : "The phrase says the boundary itself is allowed, so the symbol needs the short equality line."
            ],
            steps: [
                "Read the variable in relation to the boundary.",
                explanation,
                family === 2 ? "Use ≠ for “is not equal to”." : "Use the symbol with a short equality line because the boundary is included.",
                "Therefore, " + correct + "."
            ],
            success: correct + " matches the statement.",
            nudge: family === 2
                ? "Use the symbol that says the values do not match without choosing which is larger."
                : "Check both the direction and whether the boundary value is included."
        };
    }

    function makeIntegerQuestion(family, rng) {
        const variable = pick(["n", "x", "t", "k"], rng);
        const lower = randomInt(rng, -7, 2);
        const upper = lower + randomInt(rng, 3, 5);
        const includeLower = family === 1 || family === 2;
        const includeUpper = family === 0 || family === 2;
        const lowerSymbol = includeLower ? "≤" : "<";
        const upperSymbol = includeUpper ? "≤" : "<";
        const expression = numericLabel(lower) + " " + lowerSymbol + " " + variable + " " + upperSymbol + " " + numericLabel(upper);
        const optionNumbers = [];
        for (let value = lower - 2; value <= upper + 2; value += 1) optionNumbers.push(value);
        const options = optionNumbers.map(numericLabel);
        const correct = optionNumbers.filter(function (value) {
            return (includeLower ? value >= lower : value > lower) &&
                (includeUpper ? value <= upper : value < upper);
        }).map(numericLabel);

        return {
            stage: 2,
            family: family,
            mode: "multi",
            factKey: expression,
            title: "Select the integer solutions",
            givenLabel: "Inequality",
            given: expression,
            showGiven: false,
            prompt: "Choose every integer that satisfies the inequality.",
            expression: expression,
            multiLegend: "Choose all integer solutions",
            options: options,
            correctSet: correct,
            answerText: joinValues(correct),
            hints: [
                "Start with the integers strictly between the two boundary values.",
                (includeLower ? numericLabel(lower) + " is included. " : numericLabel(lower) + " is excluded. ") +
                    (includeUpper ? numericLabel(upper) + " is included." : numericLabel(upper) + " is excluded.")
            ],
            steps: [
                "The left boundary, " + numericLabel(lower) + ", is " + (includeLower ? "included because the symbol has an equality line." : "excluded because the inequality is strict."),
                "The right boundary, " + numericLabel(upper) + ", is " + (includeUpper ? "included because the symbol has an equality line." : "excluded because the inequality is strict."),
                "List each integer between the boundaries, including only the permitted endpoints.",
                variable + " can be " + joinValues(correct) + "."
            ],
            success: joinValues(correct) + " are exactly the integer solutions.",
            nudge: "Check each boundary separately, then include every integer between them."
        };
    }

    function generateQuestion(stage, family, rng, excludedKey) {
        const random = rng || Math.random;
        let question;
        for (let attempt = 0; attempt < 8; attempt += 1) {
            if (stage === 0) question = makeBasicQuestion(family, random);
            else if (stage === 1) question = makeExtendedQuestion(family, random);
            else question = makeIntegerQuestion(family, random);
            if (question.factKey !== excludedKey) return question;
        }
        return question;
    }

    function buildRound(rng) {
        const random = rng || Math.random;
        const questions = [];
        let previousKey = "";
        for (let stage = 0; stage < 3; stage += 1) {
            for (let family = 0; family < 4; family += 1) {
                const question = generateQuestion(stage, family, random, previousKey);
                questions.push(question);
                previousKey = question.factKey;
            }
        }
        return questions;
    }

    function createSeededRandom(seed) {
        let state = seed >>> 0;
        return function () {
            state = (1664525 * state + 1013904223) >>> 0;
            return state / 4294967296;
        };
    }

    function evaluateResponse(question, raw) {
        if (question.mode === "choice") {
            if (raw === "" || raw === null || raw === undefined) {
                return { state: "blank", text: "Choose an answer before checking." };
            }
            const index = Number(raw);
            return index === question.answerIndex
                ? { state: "correct", text: question.success }
                : { state: "try-again", text: question.nudge };
        }

        const selected = new Set(Array.isArray(raw) ? raw : []);
        const expected = new Set(question.correctSet);
        const correctPositions = question.options.map(function (value) {
            return selected.has(value) === expected.has(value);
        });
        if (selected.size === 0) {
            return { state: "blank", text: "Choose at least one integer before checking." };
        }
        if (correctPositions.every(Boolean)) {
            return { state: "correct", text: question.success, correctPositions: correctPositions };
        }
        const outside = Array.from(selected).filter(function (value) { return !expected.has(value); });
        const missing = question.correctSet.filter(function (value) { return !selected.has(value); });
        let text;
        if (outside.length && missing.length) text = "Some selected values are outside the boundaries, and at least one solution is missing.";
        else if (outside.length) text = "At least one selected value is outside the boundaries.";
        else text = "At least one integer solution is still missing.";
        return { state: "try-again", text: text + " " + question.nudge, correctPositions: correctPositions };
    }

    function validateQuestion(question) {
        if (!question || question.hints.length !== 2 || question.steps.length !== 4 || !question.factKey) return false;
        if (question.mode === "choice") {
            return question.options.length >= 3 && question.answerIndex >= 0 &&
                new Set(question.options).size === question.options.length &&
                evaluateResponse(question, String(question.answerIndex)).state === "correct";
        }
        return question.options.length >= 7 && question.correctSet.length >= 2 &&
            new Set(question.options).size === question.options.length &&
            question.correctSet.every(function (value) { return question.options.includes(value); }) &&
            evaluateResponse(question, question.correctSet.slice()).state === "correct";
    }

    function selfCheck(iterations) {
        const rng = createSeededRandom(86134);
        const count = Math.max(1, iterations || 1000);
        for (let roundIndex = 0; roundIndex < count; roundIndex += 1) {
            const round = buildRound(rng);
            if (round.length !== 12) throw new Error("A round must contain 12 questions.");
            round.forEach(function (question, index) {
                if (question.stage !== Math.floor(index / 4) || question.family !== index % 4 || !validateQuestion(question)) {
                    throw new Error("Invalid generated question at round " + (roundIndex + 1) + ", position " + (index + 1) + ".");
                }
            });
        }
        return { rounds: count, questions: count * 12 };
    }

    const api = {
        buildRound: buildRound,
        createSeededRandom: createSeededRandom,
        evaluateResponse: evaluateResponse,
        generateQuestion: generateQuestion,
        parseNumber: parseNumber,
        selfCheck: selfCheck,
        validateQuestion: validateQuestion
    };

    scope.InequalitySymbolsPractice = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
    if (typeof document === "undefined") return;

    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function blankAnswer(question) {
        return question.mode === "multi" ? [] : "";
    }

    function makeState(question) {
        return {
            answer: blankAnswer(question),
            attempts: 0,
            hintLevel: 0,
            solutionShown: false,
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
        return "Your answer: " + (Array.isArray(answer) ? joinValues(answer.map(function (value) { return value || "—"; })) : String(answer).trim());
    }

    function mount(root) {
        let round = buildRound(Math.random);
        let states = round.map(makeState);
        let current = 0;

        const questionView = root.querySelector("[data-question-view]");
        const reflection = root.querySelector("[data-reflection]");
        const card = root.querySelector("[data-question-card]");
        const title = root.querySelector("[data-question-title]");
        const givenWrap = root.querySelector(".practice-question__given");
        const given = root.querySelector("[data-question-given]");
        const givenLabel = root.querySelector("[data-question-given-label]");
        const prompt = root.querySelector("[data-question-prompt]");
        const expression = root.querySelector("[data-question-expression]");
        const singleWrap = root.querySelector(".practice-answer");
        const answerLabel = root.querySelector("[data-answer-label]");
        const input = root.querySelector("[data-answer-input]");
        const choiceField = root.querySelector("[data-choice-answer]");
        const choiceLegend = root.querySelector("[data-choice-legend]");
        const choiceOptions = root.querySelector("[data-choice-options]");
        const multiField = root.querySelector("[data-multi-answer]");
        const multiLegend = root.querySelector("[data-multi-legend]");
        const multiControls = root.querySelector("[data-multi-controls]");
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

        function clearOutcomeForEdit(preservePositionFeedback) {
            const currentState = state();
            currentState.replaceConfirm = false;
            if (currentState.outcome) {
                currentState.outcome = null;
                card.classList.remove("is-correct");
                card.classList.add("is-review");
            }
            if (!preservePositionFeedback) currentState.correctPositions = [];
            if (currentState.attempts || currentState.feedback) setFeedback("Answer changed.", "");
            updateActionState();
        }

        function renderChoice(currentQuestion, currentState) {
            choiceLegend.textContent = currentQuestion.choiceLegend;
            choiceOptions.classList.toggle("is-value-grid", currentQuestion.showChoiceLetters === false);
            choiceOptions.classList.toggle("is-symbol-grid", currentQuestion.compactSymbols === true);
            choiceOptions.replaceChildren();
            currentQuestion.options.forEach(function (option, index) {
                const id = "inequality-choice-" + current + "-" + index;
                const label = element("label", "practice-choice__option");
                if (currentQuestion.showChoiceLetters === false) label.classList.add("is-value-choice");
                const radio = element("input");
                radio.type = "radio";
                radio.name = "inequality-choice-" + current;
                radio.id = id;
                radio.value = String(index);
                radio.checked = currentState.answer === String(index);
                radio.setAttribute("aria-describedby", "practice-feedback practice-hint");
                const copy = element("span", "", option);
                label.classList.toggle("is-selected", radio.checked);
                label.appendChild(radio);
                if (currentQuestion.showChoiceLetters !== false) {
                    label.appendChild(element("span", "", String.fromCharCode(65 + index)));
                }
                label.appendChild(copy);
                radio.addEventListener("change", function () {
                    currentState.answer = radio.value;
                    Array.from(choiceOptions.children).forEach(function (node) { node.classList.remove("is-selected"); });
                    label.classList.add("is-selected");
                    clearOutcomeForEdit();
                });
                choiceOptions.appendChild(label);
            });
        }

        function applyMultiStates() {
            const currentQuestion = question();
            const currentState = state();
            const selected = new Set(currentState.answer);
            const expected = new Set(currentQuestion.correctSet || []);
            Array.from(multiControls.querySelectorAll(".practice-multi__option")).forEach(function (label, index) {
                const checkbox = label.querySelector("input");
                const hasResult = currentState.correctPositions[index] !== undefined;
                label.classList.toggle("is-selected", checkbox.checked);
                label.classList.toggle("is-correct", hasResult && checkbox.checked && expected.has(checkbox.value));
                label.classList.toggle("is-wrong", hasResult && checkbox.checked && !expected.has(checkbox.value));
                if (hasResult && checkbox.checked && !expected.has(checkbox.value)) checkbox.setAttribute("aria-invalid", "true");
                else checkbox.removeAttribute("aria-invalid");
            });
        }

        function renderMulti(currentQuestion, currentState) {
            multiLegend.textContent = currentQuestion.multiLegend;
            multiControls.replaceChildren();
            currentQuestion.options.forEach(function (value, index) {
                const id = "inequality-integer-" + current + "-" + index;
                const label = element("label", "practice-multi__option");
                const checkbox = element("input");
                checkbox.type = "checkbox";
                checkbox.id = id;
                checkbox.value = value;
                checkbox.checked = currentState.answer.includes(value);
                checkbox.setAttribute("aria-describedby", "practice-feedback practice-hint");
                label.append(checkbox, element("span", "", value));
                checkbox.addEventListener("change", function () {
                    if (checkbox.checked) {
                        if (!currentState.answer.includes(value)) currentState.answer.push(value);
                    } else {
                        currentState.answer = currentState.answer.filter(function (answer) { return answer !== value; });
                    }
                    clearOutcomeForEdit(true);
                    currentState.correctPositions[index] = undefined;
                    applyMultiStates();
                });
                multiControls.appendChild(label);
            });
            applyMultiStates();
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
            progressStage.textContent = STAGES[stage].name;
            progressCount.textContent = "Question " + (current + 1) + " of " + round.length;
            progressBar.style.width = ((current + 1) / round.length * 100) + "%";
            stageIndicators.forEach(function (indicator, index) {
                indicator.classList.toggle("is-current", index === stage);
                indicator.classList.toggle("is-complete", index < stage);
                if (index === stage) indicator.setAttribute("aria-current", "step");
                else indicator.removeAttribute("aria-current");
            });

            title.textContent = currentQuestion.title;
            givenWrap.hidden = currentQuestion.showGiven === false;
            givenLabel.textContent = currentQuestion.givenLabel;
            given.textContent = currentQuestion.given;
            given.dataset.kind = "list";
            prompt.textContent = currentQuestion.prompt;
            expression.textContent = currentQuestion.expression;
            expression.hidden = currentQuestion.hideExpression === true;
            if (currentQuestion.expressionKind) expression.dataset.kind = currentQuestion.expressionKind;
            else delete expression.dataset.kind;
            answerLabel.textContent = currentQuestion.answerLabel || "Your answer";

            singleWrap.hidden = currentQuestion.mode !== "single";
            choiceField.hidden = currentQuestion.mode !== "choice";
            multiField.hidden = currentQuestion.mode !== "multi";
            if (currentQuestion.mode === "single") {
                input.value = currentState.answer;
                input.setAttribute("aria-label", currentQuestion.answerLabel + " for " + currentQuestion.prompt);
            } else if (currentQuestion.mode === "choice") {
                renderChoice(currentQuestion, currentState);
            } else {
                renderMulti(currentQuestion, currentState);
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

        function checkAnswer() {
            const currentState = state();
            if (question().mode === "single") {
                currentState.answer = input.value;
            } else if (question().mode === "choice") {
                const selected = choiceOptions.querySelector("input:checked");
                currentState.answer = selected ? selected.value : "";
            } else {
                currentState.answer = Array.from(multiControls.querySelectorAll("input:checked")).map(function (checkbox) {
                    return checkbox.value;
                });
            }
            const result = evaluateResponse(question(), currentState.answer);
            currentState.replaceConfirm = false;
            currentState.correctPositions = result.correctPositions || [];
            if (question().mode === "multi") applyMultiStates();

            if (result.state === "blank" || result.state === "unreadable" || result.state === "incomplete") {
                setFeedback(result.text, "consider");
                updateActionState();
                return;
            }

            currentState.attempts += 1;
            if (result.state === "correct") {
                currentState.outcome = currentState.attempts === 1 && currentState.hintLevel === 0 && !currentState.solutionShown
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
            solutionPanel.hidden = !currentState.solutionShown;
            solutionButton.setAttribute("aria-expanded", String(currentState.solutionShown));
            solutionButton.textContent = currentState.solutionShown ? "Hide the worked solution" : "Show a worked solution";
            if (currentState.solutionShown) populateSolution(question());
            buildPrintSheet();
        }

        function focusAnswer() {
            if (question().mode === "single") input.focus({ preventScroll: true });
            else {
                const control = root.querySelector(question().mode === "choice" ? "[data-choice-options] input" : "[data-multi-controls] input");
                if (control) control.focus({ preventScroll: true });
            }
        }

        function replaceQuestion() {
            const currentState = state();
            const hasWork = hasAnswer(currentState.answer) || currentState.attempts || currentState.hintLevel || currentState.solutionShown;
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
            STAGES.forEach(function (stage, stageIndex) {
                printSheet.appendChild(element("h3", "", stage.name));
                const list = element("ol");
                round.forEach(function (item, index) {
                    if (item.stage !== stageIndex) return;
                    const entry = element("li", "practice-print-question");
                    entry.appendChild(element("p", "", item.givenLabel + ": " + item.given));
                    entry.appendChild(element("p", "", item.prompt));
                    entry.appendChild(element("span", "practice-print-working", ""));
                    if (states[index].solutionShown) {
                        const solution = element("div", "practice-print-solution");
                        solution.appendChild(element("b", "", "Worked solution: " + item.answerText));
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
                : filtered.length + " " + (filtered.length === 1 ? "question is" : "questions are") + " " + labels[filter].toLowerCase() + ".";

            reflectionQuestions.replaceChildren.apply(reflectionQuestions, filtered.map(function (entry) {
                const row = element("li", "practice-reflection-question");
                const heading = element("div", "practice-reflection-question__heading");
                const outcome = entry.state.outcome || "revisit";
                heading.appendChild(element("strong", "", "Question " + (entry.index + 1)));
                heading.appendChild(element("span", "is-" + outcome, labels[outcome]));
                row.appendChild(heading);
                row.appendChild(element("p", "practice-reflection-question__stage", STAGES[entry.item.stage].name));
                row.appendChild(element("p", "practice-reflection-question__given", entry.item.givenLabel + ": " + entry.item.given));
                row.appendChild(element("p", "practice-reflection-question__expression", entry.item.prompt));
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
                : (round.length - counts.revisit) + " checked; " + counts.revisit + " " + (counts.revisit === 1 ? "is" : "are") + " worth revisiting.";
            renderReflectionQuestions("all");
            reflectionStages.replaceChildren.apply(reflectionStages, STAGES.map(function (stage, stageIndex) {
                const stageStates = states.slice(stageIndex * 4, stageIndex * 4 + 4);
                const revisit = stageStates.filter(function (item) { return !item.outcome; }).length;
                const row = element("li");
                row.appendChild(element("b", "", stage.name));
                const link = element("a", "", revisit
                    ? revisit + " to revisit · review this stage in the lesson"
                    : "Review this stage in the lesson");
                link.href = LESSON_URL + "#" + stage.lessonAnchor;
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
        input.addEventListener("keydown", function (event) {
            if (event.key !== "Enter") return;
            event.preventDefault();
            if (event.repeat) return;
            if (state().outcome) nextButton.click();
            else checkAnswer();
        });
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
})(typeof window !== "undefined" ? window : globalThis);
