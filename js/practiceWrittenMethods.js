(function (scope) {
    "use strict";

    const STAGES = [
        { name: "Aligning place values", lessonAnchor: "why-the-columns-must-align" },
        { name: "Regrouping", lessonAnchor: "regrouping-a-column" },
        { name: "Money and measures", lessonAnchor: "adding-in-context" }
    ];
    const LESSON_URL = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/columnAddition.html";
    const PLACE_NAMES = ["ones", "tens", "hundreds", "thousands", "ten-thousands"];
    const DECIMAL_PLACE_NAMES = ["tenths", "hundredths", "thousandths"];

    function randomInt(rng, min, max) {
        return min + Math.min(max - min, Math.floor(Math.max(0, rng()) * (max - min + 1)));
    }

    function pick(values, rng) {
        return values[randomInt(rng, 0, values.length - 1)];
    }

    function formatMinor(minor, places, fixed) {
        const scale = Math.pow(10, places);
        const whole = Math.floor(minor / scale);
        if (!places) return whole.toLocaleString("en-GB");
        let decimal = String(minor % scale).padStart(places, "0");
        if (!fixed) decimal = decimal.replace(/0+$/, "");
        return whole.toLocaleString("en-GB") + (decimal ? "." + decimal : "");
    }

    function carryData(aMinor, bMinor, places) {
        const width = Math.max(String(aMinor).length, String(bMinor).length);
        const aDigits = String(aMinor).padStart(width, "0").split("").map(Number);
        const bDigits = String(bMinor).padStart(width, "0").split("").map(Number);
        const operations = [];
        let carry = 0;
        let carryCount = 0;
        for (let index = width - 1; index >= 0; index -= 1) {
            const carryIn = carry;
            const total = aDigits[index] + bDigits[index] + carryIn;
            carry = Math.floor(total / 10);
            if (carry) carryCount += 1;
            operations.push({
                index: index,
                exponent: width - index - 1 - places,
                aDigit: aDigits[index],
                bDigit: bDigits[index],
                carryIn: carryIn,
                total: total,
                digit: total % 10,
                carryOut: carry
            });
        }
        return { width: width, operations: operations, carryCount: carryCount, finalCarry: carry };
    }

    function placeName(exponent) {
        if (exponent >= 0) return PLACE_NAMES[exponent] || "next whole-number";
        return DECIMAL_PLACE_NAMES[-exponent - 1] || "next decimal";
    }

    function makeNoCarry(totalDigits, places, trailingZeros, rng) {
        const a = [];
        const b = [];
        for (let index = 0; index < totalDigits; index += 1) {
            const leading = index === 0;
            const aDigit = randomInt(rng, leading ? 1 : 0, 8);
            const forceZero = index >= totalDigits - trailingZeros;
            const bDigit = forceZero ? 0 : randomInt(rng, leading ? 1 : 0, 9 - aDigit);
            a.push(aDigit);
            b.push(bDigit);
        }
        if (Number(b.join("")) === 0) b[0] = 1;
        return [Number(a.join("")), Number(b.join("")), places, trailingZeros];
    }

    function makeCarrying(family, rng) {
        const specs = [
            { whole: 3, places: 0, trailing: 0, test: function (count) { return count === 1; }, fallback: [246, 573] },
            { whole: 4, places: 0, trailing: 0, test: function (count) { return count >= 2; }, fallback: [4687, 2759] },
            { whole: 2, places: 2, trailing: 1, test: function (count) { return count >= 1; }, fallback: [1875, 690] },
            { whole: 3, places: 3, trailing: 2, test: function (count) { return count >= 2; }, fallback: [278645, 956700] }
        ];
        const spec = specs[family];
        const digits = spec.whole + spec.places;
        const minimum = Math.pow(10, digits - 1);
        const maximum = Math.pow(10, digits) - 1;
        for (let attempt = 0; attempt < 80; attempt += 1) {
            const a = randomInt(rng, minimum, maximum);
            const factor = Math.pow(10, spec.trailing);
            const b = Math.floor(randomInt(rng, minimum, maximum) / factor) * factor;
            if (spec.test(carryData(a, b, spec.places).carryCount)) return [a, b, spec.places, spec.trailing];
        }
        return [spec.fallback[0], spec.fallback[1], spec.places, spec.trailing];
    }

    function uncarriedGuess(aMinor, bMinor) {
        const width = Math.max(String(aMinor).length, String(bMinor).length);
        const left = String(aMinor).padStart(width, "0");
        const right = String(bMinor).padStart(width, "0");
        let digits = "";
        for (let index = 0; index < width; index += 1) digits += String((Number(left[index]) + Number(right[index])) % 10);
        return Number(digits);
    }

    function buildSteps(question) {
        const steps = [];
        const unitPhrase = question.unitLabel ? " Both quantities are already in " + question.unitLabel + "." : "";
        steps.push("Align equal place values." + unitPhrase + " Write the addition as " + question.alignedA + " + " + question.alignedB + ".");
        question.operations.forEach(function (operation) {
            const parts = [];
            if (operation.carryIn) parts.push(operation.carryIn);
            parts.push(operation.aDigit, operation.bDigit);
            const start = "In the " + placeName(operation.exponent) + " column, " + parts.join(" + ") + " = " + operation.total + ".";
            steps.push(operation.carryOut
                ? start + " Write " + operation.digit + " and regroup " + operation.carryOut + " into the column to the left."
                : start + " Write " + operation.digit + " in this column.");
        });
        if (question.finalCarry) {
            steps.push("Write the final regrouped " + question.finalCarry + " at the left of the answer.");
        }
        steps.push("Read the completed total as " + question.answerShown + ".");
        return steps;
    }

    function makeQuestion(stage, family, rng) {
        let values;
        let prompt = "Calculate the sum.";
        let unitPrefix = "";
        let unitSuffix = "";
        let unitLabel = "";
        let title = "Add the two numbers";

        if (stage === 0) {
            const specs = [
                [3, 0, 0],
                [4, 2, 1],
                [5, 2, 2],
                [5, 3, family === 3 ? 1 : 0]
            ];
            values = makeNoCarry(specs[family][0], specs[family][1], specs[family][2], rng);
        } else if (stage === 1) {
            values = makeCarrying(family, rng);
        } else if (family === 0 || family === 3) {
            const first = randomInt(rng, 450, 6500);
            const second = randomInt(rng, 250, 4800);
            values = [first, second, 2, 0];
            unitPrefix = "£";
            unitLabel = "pounds";
            const pairs = family === 0
                ? [["A book", "a notebook"], ["A game", "a controller"], ["A coat", "a bag"]]
                : [["One train ticket", "another ticket"], ["A meal", "a drink"], ["A lamp", "a shade"]];
            const nouns = pick(pairs, rng);
            prompt = nouns[0] + " costs £" + formatMinor(first, 2, true) + " and " + nouns[1] + " costs £" + formatMinor(second, 2, true) + ". What is the total cost?";
            title = "Find the total cost";
        } else if (family === 1) {
            const first = randomInt(rng, 80, 850);
            const second = randomInt(rng, 45, 620);
            values = [first, second, 2, 0];
            unitSuffix = "m";
            unitLabel = "metres";
            prompt = "A " + formatMinor(first, 2, false) + " m length is joined to a " + formatMinor(second, 2, false) + " m length. What is the total length?";
            title = "Find the total length";
        } else {
            const first = randomInt(rng, 120, 940);
            const second = randomInt(rng, 75, 680);
            values = [first, second, 0, 0];
            unitSuffix = "cm";
            unitLabel = "centimetres";
            prompt = "A strip measuring " + formatMinor(first, 0, true) + " cm is joined to one measuring " + formatMinor(second, 0, true) + " cm. What is the total length?";
            title = "Find the total length";
        }

        const aMinor = values[0];
        const bMinor = values[1];
        const places = values[2];
        const trailing = values[3];
        const aText = formatMinor(aMinor, places, false);
        const bText = formatMinor(bMinor, places, trailing ? false : places > 0);
        const alignedA = formatMinor(aMinor, places, true);
        const alignedB = formatMinor(bMinor, places, true);
        const sumMinor = aMinor + bMinor;
        const answerNumber = formatMinor(sumMinor, places, false);
        const answerShown = unitPrefix + (unitPrefix ? formatMinor(sumMinor, places, true) : answerNumber) + (unitSuffix ? " " + unitSuffix : "");
        const calculation = carryData(aMinor, bMinor, places);
        const question = {
            stage: stage,
            family: family,
            mode: "single",
            factKey: stage + ":" + family + ":" + aMinor + ":" + bMinor + ":" + places,
            title: title,
            givenLabel: "Addition",
            given: aText + " + " + bText,
            showGiven: false,
            prompt: prompt,
            expression: aText + " + " + bText,
            aText: aText,
            bText: bText,
            alignedA: alignedA,
            alignedB: alignedB,
            places: places,
            aMinor: aMinor,
            bMinor: bMinor,
            sumMinor: sumMinor,
            uncarried: uncarriedGuess(aMinor, bMinor),
            operations: calculation.operations,
            carryCount: calculation.carryCount,
            finalCarry: calculation.finalCarry,
            answerLabel: unitPrefix ? "Total cost" : unitSuffix ? "Total length" : "Your answer",
            unitPrefix: unitPrefix,
            unitSuffix: unitSuffix,
            unitLabel: unitLabel,
            answerText: answerNumber,
            answerShown: answerShown,
            hints: [
                places ? "Align the decimal points so equal place values share a column." : "Align the ones digits and begin with the ones column.",
                calculation.carryCount
                    ? "When a column totals 10 or more, write its ones digit and regroup the tens into the column to the left."
                    : "Add one column at a time from right to left."
            ],
            success: answerShown + " is the total.",
            nudge: calculation.carryCount
                ? "Check every regrouped amount was included in the next column."
                : "Check the place-value alignment and add each column from right to left."
        };
        question.steps = buildSteps(question);
        return question;
    }

    function generateQuestion(stage, family, rng, excludedKey) {
        const random = rng || Math.random;
        let question;
        for (let attempt = 0; attempt < 8; attempt += 1) {
            question = makeQuestion(stage, family, random);
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

    function parseToMinor(raw, places, unitPrefix, unitSuffix) {
        if (typeof raw !== "string") return null;
        let cleaned = raw.trim().replace(/,/g, "").replace(/\s+/g, "");
        if (unitPrefix && cleaned.startsWith(unitPrefix)) cleaned = cleaned.slice(unitPrefix.length);
        if (unitSuffix && cleaned.toLowerCase().endsWith(unitSuffix.toLowerCase())) cleaned = cleaned.slice(0, -unitSuffix.length);
        if (!/^\d+(?:\.\d*)?$/.test(cleaned)) return null;
        let parts = cleaned.split(".");
        let fraction = parts[1] || "";
        if (fraction.length > places) {
            if (!/^0*$/.test(fraction.slice(places))) return null;
            fraction = fraction.slice(0, places);
        }
        return Number(parts[0]) * Math.pow(10, places) + Number(fraction.padEnd(places, "0"));
    }

    function evaluateResponse(question, raw) {
        if (typeof raw !== "string" || !raw.trim()) return { state: "blank", text: "Enter the total before checking." };
        const minor = parseToMinor(raw, question.places, question.unitPrefix, question.unitSuffix);
        if (minor === null) return { state: "unreadable", text: "Enter the total using digits." };
        if (minor === question.sumMinor) return { state: "correct", text: question.success };
        if (minor === question.uncarried && question.carryCount) {
            return { state: "try-again", text: "The column digits have been added without regrouping. " + question.nudge };
        }
        if (minor === question.sumMinor * 10 || (question.sumMinor % 10 === 0 && minor === question.sumMinor / 10)) {
            return { state: "try-again", text: "The digits match a decimal-place shift. Keep the decimal point in its aligned column." };
        }
        return { state: "try-again", text: question.nudge };
    }

    function validateQuestion(question) {
        const exact = parseToMinor(question.answerText, question.places, question.unitPrefix, question.unitSuffix);
        return Boolean(question && question.mode === "single" && question.hints.length === 2 &&
            question.steps.length >= 3 && question.factKey && exact === question.sumMinor &&
            question.sumMinor === question.aMinor + question.bMinor &&
            evaluateResponse(question, question.answerText).state === "correct");
    }

    function selfCheck(iterations) {
        const rng = createSeededRandom(86135);
        const count = Math.max(1, iterations || 1000);
        for (let roundIndex = 0; roundIndex < count; roundIndex += 1) {
            const round = buildRound(rng);
            if (round.length !== 12) throw new Error("A round must contain 12 questions.");
            round.forEach(function (question, index) {
                if (question.stage !== Math.floor(index / 4) || question.family !== index % 4 || !validateQuestion(question)) {
                    throw new Error("Invalid generated question at round " + (roundIndex + 1) + ", position " + (index + 1) + ".");
                }
                if (question.stage === 0 && question.carryCount !== 0) throw new Error("Fluency question unexpectedly regroups.");
                if (question.stage === 1 && question.carryCount < 1) throw new Error("Regrouping question has no regrouping.");
                if (question.stage === 2 && !question.unitLabel) throw new Error("Application question has no fixed unit.");
            });
        }
        return { rounds: count, questions: count * 12 };
    }

    const api = {
        buildRound: buildRound,
        carryData: carryData,
        createSeededRandom: createSeededRandom,
        evaluateResponse: evaluateResponse,
        formatMinor: formatMinor,
        generateQuestion: generateQuestion,
        parseToMinor: parseToMinor,
        selfCheck: selfCheck,
        validateQuestion: validateQuestion
    };

    scope.ColumnAdditionPractice = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
    if (typeof document === "undefined") return;

    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function blankAnswer(question) {
        return "";
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
        const answerEntry = root.querySelector("[data-answer-entry]");
        const unitPrefix = root.querySelector("[data-unit-prefix]");
        const unitSuffix = root.querySelector("[data-unit-suffix]");
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

        function renderExpression(currentQuestion) {
            expression.replaceChildren();
            const first = element("div", "practice-column__row");
            first.append(element("span", "", ""), element("strong", "", currentQuestion.alignedA));
            const second = element("div", "practice-column__row");
            second.append(element("span", "", "+"), element("strong", "", currentQuestion.alignedB));
            expression.append(first, second, element("div", "practice-column__rule"));
            expression.setAttribute("aria-label", currentQuestion.alignedA + " plus " + currentQuestion.alignedB + ", aligned by place value");
            unitPrefix.textContent = currentQuestion.unitPrefix || "";
            unitPrefix.hidden = !currentQuestion.unitPrefix;
            unitSuffix.textContent = currentQuestion.unitSuffix || "";
            unitSuffix.hidden = !currentQuestion.unitSuffix;
            answerEntry.classList.toggle("has-prefix", Boolean(currentQuestion.unitPrefix));
            answerEntry.classList.toggle("has-suffix", Boolean(currentQuestion.unitSuffix));
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
            renderExpression(currentQuestion);
            expression.hidden = false;
            delete expression.dataset.kind;
            answerLabel.textContent = currentQuestion.answerLabel || "Your answer";

            singleWrap.hidden = currentQuestion.mode !== "single";
            choiceField.hidden = currentQuestion.mode !== "choice";
            multiField.hidden = currentQuestion.mode !== "multi";
            if (currentQuestion.mode === "single") {
                input.value = currentState.answer;
                input.setAttribute("aria-label", currentQuestion.answerLabel + " for " + currentQuestion.aText + " plus " + currentQuestion.bText);
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
