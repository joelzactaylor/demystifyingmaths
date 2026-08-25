(function (scope) {
    "use strict";

    const STAGES = [
        { name: "Decimal order", lessonAnchor: "ordering-decimal-numbers" },
        { name: "Negative order", lessonAnchor: "ordering-a-mixture-of-numbers" },
        { name: "Number lines and contexts", lessonAnchor: "ordering-negative-numbers" }
    ];
    const LESSON_URL = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/orderingNumbers.html";

    function randomInt(rng, min, max) {
        return min + Math.min(max - min, Math.floor(Math.max(0, rng()) * (max - min + 1)));
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

    function parseNumber(raw) {
        if (typeof raw !== "string") return NaN;
        const cleaned = raw.trim().replace(/[,\s]/g, "").replace(/[−–—]/g, "-").replace(/°C$/i, "");
        if (!cleaned || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(cleaned)) return NaN;
        const value = Number(cleaned);
        return Number.isFinite(value) ? value : NaN;
    }

    function near(left, right) {
        return Number.isFinite(left) && Number.isFinite(right) &&
            Math.abs(left - right) <= Math.max(1e-10, Math.abs(right) * 1e-10);
    }

    function numericLabel(value) {
        return String(value).replace(/-/g, "−");
    }

    function compareLabels(left, right) {
        return parseNumber(left) - parseNumber(right);
    }

    function ordered(values, direction) {
        return values.slice().sort(function (left, right) {
            return direction === "ascending" ? compareLabels(left, right) : compareLabels(right, left);
        });
    }

    function joinValues(values) {
        return values.join(", ");
    }

    function padDecimal(label, places) {
        const negative = label.startsWith("−") || label.startsWith("-");
        const unsigned = label.replace(/[−-]/, "");
        const parts = unsigned.split(".");
        const result = parts[0] + "." + (parts[1] || "").padEnd(places, "0");
        return (negative ? "−" : "") + result;
    }

    function createDecimalSet(family, rng) {
        const base = family === 2 ? 0 : randomInt(rng, family === 3 ? 8 : 1, family === 3 ? 30 : 12);
        const placePatterns = [
            [1, 2, 3, 2],
            [2, 1, 3, 2],
            [3, 2, 1, 3],
            [2, 3, 2, 1]
        ][family];
        const thousandths = [];
        placePatterns.forEach(function (places) {
            const factor = Math.pow(10, 3 - places);
            let value = 0;
            for (let attempt = 0; attempt < 12; attempt += 1) {
                value = randomInt(rng, 1, Math.pow(10, places) - 1) * factor;
                if (!thousandths.includes(value)) break;
            }
            if (thousandths.includes(value)) {
                for (let candidate = factor; candidate < 1000; candidate += factor) {
                    if (!thousandths.includes(candidate)) {
                        value = candidate;
                        break;
                    }
                }
            }
            thousandths.push(value);
        });
        return thousandths.map(function (value, index) {
            const places = placePatterns[index];
            const digits = String(value / Math.pow(10, 3 - places)).padStart(places, "0");
            return base + "." + digits;
        });
    }

    function makeDecimalQuestion(family, rng) {
        const direction = family % 2 === 0 ? "smallest" : "largest";
        const values = shuffle(createDecimalSet(family, rng), rng);
        const sorted = ordered(values, direction === "smallest" ? "ascending" : "descending");
        const answerText = sorted[0];
        const padded = values.map(function (value) { return padDecimal(value, 3); });
        const answerIndex = values.indexOf(answerText);

        return {
            stage: 0,
            family: family,
            mode: "choice",
            factKey: values.join("|") + ":" + direction,
            title: "Choose the " + direction + " decimal",
            givenLabel: "Values",
            given: joinValues(values),
            showGiven: false,
            prompt: "Which value is the " + direction + "?",
            expression: joinValues(values),
            choiceLegend: "Choose one value",
            showChoiceLetters: false,
            options: values,
            answerIndex: answerIndex,
            answerText: answerText,
            hints: [
                "Line up the decimal points and compare digits in the same place.",
                "Add trailing zeros so each value has three decimal places, then compare from left to right."
            ],
            steps: [
                "Line up the decimal points.",
                "Add trailing zeros without changing the values: " + joinValues(padded) + ".",
                "Compare the digits from the largest place and stop at the first difference.",
                "The " + direction + " value is " + answerText + "."
            ],
            success: answerText + " is the " + direction + " value after the decimal places are aligned.",
            nudge: "Do not count the decimal digits. Add trailing zeros, then compare each place from left to right.",
            values: values
        };
    }

    function uniqueOptions(candidates, correct, rng) {
        const seen = new Set();
        const options = [];
        candidates.forEach(function (candidate) {
            const key = candidate.join("|");
            if (!seen.has(key)) {
                seen.add(key);
                options.push(candidate);
            }
        });
        for (let shift = 1; options.length < 4; shift += 1) {
            const rotated = correct.slice(shift).concat(correct.slice(0, shift));
            const key = rotated.join("|");
            if (!seen.has(key)) {
                seen.add(key);
                options.push(rotated);
            }
        }
        return shuffle(options.slice(0, 4), rng);
    }

    function makeNegativeValues(family, rng) {
        const negativeWhole = numericLabel(-randomInt(rng, 5, 12));
        const negativeDecimal = numericLabel(-(randomInt(rng, 1, 4) + randomInt(rng, 1, 9) / 10));
        const positiveDecimal = String(randomInt(rng, 1, 5)) + "." + randomInt(rng, 1, 9);
        const positiveWhole = String(randomInt(rng, 6, 14));
        const values = [negativeWhole, negativeDecimal, "0", positiveDecimal, positiveWhole];
        if (family >= 2) {
            values[1] = "−" + randomInt(rng, 1, 3) + ".0" + randomInt(rng, 1, 9);
            values[2] = "0." + randomInt(rng, 1, 8);
        }
        return values;
    }

    function makeNegativeQuestion(family, rng) {
        const direction = family % 2 === 0 ? "ascending" : "descending";
        const values = shuffle(makeNegativeValues(family, rng), rng);
        const correct = ordered(values, direction);
        const reversed = correct.slice().reverse();
        const magnitude = values.slice().sort(function (left, right) {
            const difference = Math.abs(parseNumber(left)) - Math.abs(parseNumber(right));
            return direction === "ascending" ? difference : -difference;
        });
        const swapped = correct.slice();
        const firstNegative = swapped.findIndex(function (value) { return parseNumber(value) < 0; });
        if (firstNegative >= 0 && firstNegative < swapped.length - 1) {
            const temp = swapped[firstNegative];
            swapped[firstNegative] = swapped[firstNegative + 1];
            swapped[firstNegative + 1] = temp;
        }
        const zeroMoved = correct.filter(function (value) { return value !== "0"; });
        zeroMoved.splice(direction === "ascending" ? zeroMoved.length - 1 : 1, 0, "0");
        const options = uniqueOptions([correct, reversed, magnitude, swapped, zeroMoved], correct, rng);
        const answerIndex = options.findIndex(function (option) { return joinValues(option) === joinValues(correct); });

        return {
            stage: 1,
            family: family,
            mode: "choice",
            factKey: values.join("|") + ":" + direction,
            title: "Choose the correctly ordered list",
            givenLabel: "Values",
            given: joinValues(values),
            prompt: "Which list is in " + direction + " order?",
            expression: direction === "ascending" ? "Smallest to largest" : "Largest to smallest",
            choiceLegend: "Choose one list",
            options: options.map(joinValues),
            answerIndex: answerIndex,
            answerText: options[answerIndex].join(", "),
            hints: [
                direction === "ascending"
                    ? "Ascending means moving from the smallest value to the largest."
                    : "Descending means moving from the largest value to the smallest.",
                "Separate negatives, zero and positives. Among negatives, the value closer to zero is larger."
            ],
            steps: [
                "The requested direction is " + direction + ".",
                "Place negative values on the left of zero and positive values on the right.",
                "Among negative values, the number further from zero is smaller.",
                "The correct order is " + joinValues(correct) + "."
            ],
            success: joinValues(correct) + " is in " + direction + " order.",
            nudge: "Check the requested direction and remember that, among negatives, the value closer to zero is larger.",
            correct: correct
        };
    }

    function makeSequenceValues(family, rng) {
        if (family === 0) {
            return [
                numericLabel(-randomInt(rng, 5, 12)),
                numericLabel(-randomInt(rng, 1, 4)),
                String(randomInt(rng, 1, 5)),
                String(randomInt(rng, 7, 14))
            ];
        }
        if (family === 1) {
            const base = randomInt(rng, 1, 4);
            return [
                "−" + base + "." + randomInt(rng, 3, 8),
                "−" + base + ".0" + randomInt(rng, 1, 9),
                "0.0" + randomInt(rng, 1, 9),
                "0." + randomInt(rng, 2, 9)
            ];
        }
        if (family === 2) {
            return [
                numericLabel(-randomInt(rng, 8, 15)) + "°C",
                numericLabel(-randomInt(rng, 1, 6)) + "°C",
                String(randomInt(rng, 0, 5)) + "°C",
                String(randomInt(rng, 7, 14)) + "°C"
            ];
        }
        return [
            "−" + randomInt(rng, 4, 9) + "." + randomInt(rng, 1, 9) + "°C",
            "−0." + randomInt(rng, 1, 9) + "°C",
            String(randomInt(rng, 1, 6)) + "." + randomInt(rng, 1, 9) + "°C",
            String(randomInt(rng, 8, 15)) + "°C"
        ];
    }

    function makeSequenceQuestion(family, rng) {
        const temperature = family >= 2;
        const direction = family % 2 === 0 ? "ascending" : "descending";
        const values = shuffle(makeSequenceValues(family, rng), rng);
        const correct = ordered(values, direction);
        const labels = direction === "ascending"
            ? ["Smallest", "Second", "Third", "Largest"]
            : ["Largest", "Second", "Third", "Smallest"];
        const contextPrompt = temperature
            ? (direction === "ascending" ? "Order the temperatures from coldest to warmest." : "Order the temperatures from warmest to coldest.")
            : "Place the values on the number line in " + direction + " order.";

        return {
            stage: 2,
            family: family,
            mode: "sequence",
            factKey: values.join("|") + ":" + direction,
            title: temperature ? "Order the temperatures" : "Build the number-line order",
            givenLabel: temperature ? "Temperatures" : "Values",
            given: joinValues(values),
            showGiven: false,
            prompt: contextPrompt,
            expression: direction === "ascending" ? "Left to right: values increase" : "Right to left: values decrease",
            sequenceLegend: contextPrompt,
            positionLabels: labels,
            sequenceOptions: shuffle(values, rng),
            answerSequence: correct,
            answerText: joinValues(correct),
            hints: [
                temperature
                    ? "Colder temperatures have smaller numerical values."
                    : "Values increase as you move from left to right on a number line.",
                direction === "ascending"
                    ? "Start with the smallest value, then move towards the largest."
                    : "Start with the largest value, then move towards the smallest."
            ],
            steps: [
                temperature ? "Treat each temperature as its signed numerical value." : "Picture each value at its position on a number line.",
                "Values further left are smaller; values further right are larger.",
                "Read the positions in " + direction + " order.",
                "The order is " + joinValues(correct) + "."
            ],
            success: joinValues(correct) + " gives the requested order.",
            nudge: temperature
                ? "Check which temperature is colder, then follow the requested direction."
                : "Picture the values from left to right, then follow the requested direction."
        };
    }

    function generateQuestion(stage, family, rng, excludedKey) {
        const random = rng || Math.random;
        let question;
        for (let attempt = 0; attempt < 8; attempt += 1) {
            if (stage === 0) question = makeDecimalQuestion(family, random);
            else if (stage === 1) question = makeNegativeQuestion(family, random);
            else question = makeSequenceQuestion(family, random);
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
        if (question.mode === "single") {
            if (typeof raw !== "string" || !raw.trim()) return { state: "blank", text: "Enter an answer before checking." };
            const value = parseNumber(raw);
            if (!Number.isFinite(value)) return { state: "unreadable", text: "Enter one of the values using digits." };
            if (near(value, question.answerValue)) return { state: "correct", text: question.success };
            if (!question.values.some(function (item) { return near(parseNumber(item), value); })) {
                return { state: "try-again", text: "Choose one of the values shown, then compare its place values." };
            }
            return { state: "try-again", text: question.nudge };
        }

        if (question.mode === "choice") {
            if (raw === "" || raw === null || raw === undefined) {
                return { state: "blank", text: question.stage === 0 ? "Choose one value before checking." : "Choose one list before checking." };
            }
            const index = Number(raw);
            return index === question.answerIndex
                ? { state: "correct", text: question.success }
                : { state: "try-again", text: question.nudge };
        }

        const answers = Array.isArray(raw) ? raw : [];
        const correctPositions = question.answerSequence.map(function (value, index) {
            return answers[index] === value;
        });
        if (!answers.some(Boolean)) {
            return { state: "blank", text: "Choose a value for each position before checking.", correctPositions: correctPositions };
        }
        if (answers.some(function (value) { return !value; })) {
            return { state: "incomplete", text: "Choose a value for every remaining position.", correctPositions: correctPositions };
        }
        if (new Set(answers).size !== answers.length) {
            return { state: "try-again", text: "Use each value once. Keep any positions that are already correct.", correctPositions: correctPositions };
        }
        if (correctPositions.every(Boolean)) {
            return { state: "correct", text: question.success, correctPositions: correctPositions };
        }
        const count = correctPositions.filter(Boolean).length;
        return {
            state: "try-again",
            text: (count ? count + " of the 4 positions " + (count === 1 ? "is" : "are") + " correct. " : "") + question.nudge,
            correctPositions: correctPositions
        };
    }

    function validateQuestion(question) {
        if (!question || question.hints.length !== 2 || question.steps.length !== 4 || !question.factKey) return false;
        if (question.mode === "single") {
            return Number.isFinite(question.answerValue) &&
                evaluateResponse(question, question.answerText).state === "correct" &&
                new Set(question.values.map(parseNumber)).size === question.values.length;
        }
        if (question.mode === "choice") {
            return question.options.length === 4 && question.answerIndex >= 0 &&
                evaluateResponse(question, String(question.answerIndex)).state === "correct";
        }
        return question.sequenceOptions.length === 4 && question.answerSequence.length === 4 &&
            new Set(question.answerSequence).size === 4 &&
            evaluateResponse(question, question.answerSequence.slice()).state === "correct";
    }

    function selfCheck(iterations) {
        const rng = createSeededRandom(86133);
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

    scope.OrderingNumbersPractice = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
    if (typeof document === "undefined") return;

    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function blankAnswer(question) {
        return question.mode === "sequence" ? Array(question.answerSequence.length).fill("") : "";
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
        const sequenceField = root.querySelector("[data-sequence-answer]");
        const sequenceLegend = root.querySelector("[data-sequence-legend]");
        const sequenceControls = root.querySelector("[data-sequence-controls]");
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
            choiceOptions.replaceChildren();
            currentQuestion.options.forEach(function (option, index) {
                const id = "ordering-choice-" + current + "-" + index;
                const label = element("label", "practice-choice__option");
                if (currentQuestion.showChoiceLetters === false) label.classList.add("is-value-choice");
                const radio = element("input");
                radio.type = "radio";
                radio.name = "ordering-choice-" + current;
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

        function applySequenceStates() {
            const positions = Array.from(sequenceControls.querySelectorAll(".practice-sequence__position"));
            const currentState = state();
            positions.forEach(function (position, index) {
                const correct = currentState.correctPositions[index];
                position.classList.toggle("is-correct", correct === true);
                position.classList.toggle("is-wrong", correct === false && Boolean(currentState.answer[index]));
                const slot = position.querySelector("[data-sequence-slot]");
                const value = currentState.answer[index] || "";
                slot.dataset.value = value;
                slot.textContent = value || "Empty";
                slot.disabled = !value;
                slot.classList.toggle("is-filled", Boolean(value));
                slot.setAttribute("aria-label", value
                    ? currentQuestionLabel(position) + ": " + value + ". Remove this value"
                    : currentQuestionLabel(position) + ": empty");
                if (correct === false && value) slot.setAttribute("aria-invalid", "true");
                else slot.removeAttribute("aria-invalid");
            });

            const used = new Set(currentState.answer.filter(Boolean));
            const full = used.size >= positions.length;
            Array.from(sequenceControls.querySelectorAll("[data-sequence-value]")).forEach(function (button) {
                button.disabled = full || used.has(button.dataset.sequenceValue);
                button.classList.toggle("is-used", used.has(button.dataset.sequenceValue));
            });
            const hasValues = currentState.answer.some(Boolean);
            const undo = sequenceControls.querySelector("[data-sequence-undo]");
            const clear = sequenceControls.querySelector("[data-sequence-clear]");
            if (undo) undo.disabled = !hasValues;
            if (clear) clear.disabled = !hasValues;
        }

        function currentQuestionLabel(position) {
            const label = position.querySelector(".practice-sequence__position-label");
            return label ? label.textContent : "Position";
        }

        function sequenceEdited(currentState, firstChanged) {
            currentState.correctPositions = currentState.correctPositions.map(function (value, index) {
                return index < firstChanged ? value : undefined;
            });
            clearOutcomeForEdit(true);
            applySequenceStates();
        }

        function renderSequence(currentQuestion, currentState) {
            sequenceLegend.textContent = currentQuestion.sequenceLegend;
            sequenceControls.replaceChildren();

            const pool = element("div", "practice-sequence__pool");
            pool.setAttribute("role", "group");
            pool.setAttribute("aria-label", "Available values");
            currentQuestion.sequenceOptions.forEach(function (value) {
                const button = element("button", "practice-sequence__value", value);
                button.type = "button";
                button.dataset.sequenceValue = value;
                button.addEventListener("click", function () {
                    const index = currentState.answer.findIndex(function (answer) { return !answer; });
                    if (index < 0 || currentState.answer.includes(value)) return;
                    currentState.answer[index] = value;
                    sequenceEdited(currentState, index);
                    const slot = sequenceControls.querySelector('[data-sequence-slot][data-index="' + index + '"]');
                    if (slot) slot.focus({ preventScroll: true });
                });
                pool.appendChild(button);
            });

            const order = element("div", "practice-sequence__order");
            currentQuestion.positionLabels.forEach(function (positionLabel, index) {
                const wrap = element("div", "practice-sequence__position");
                const label = element("span", "practice-sequence__position-label", positionLabel);
                const slot = element("button", "practice-sequence__slot", "Empty");
                slot.type = "button";
                slot.dataset.sequenceSlot = "";
                slot.dataset.index = String(index);
                slot.setAttribute("aria-describedby", "practice-feedback practice-hint");
                slot.addEventListener("click", function () {
                    const removed = currentState.answer[index];
                    if (!removed) return;
                    const compacted = currentState.answer.filter(Boolean);
                    compacted.splice(index, 1);
                    currentState.answer = compacted.concat(Array(currentQuestion.answerSequence.length - compacted.length).fill(""));
                    sequenceEdited(currentState, index);
                    const returned = sequenceControls.querySelector('[data-sequence-value="' + CSS.escape(removed) + '"]');
                    if (returned) returned.focus({ preventScroll: true });
                });
                wrap.append(label, slot);
                order.appendChild(wrap);
            });

            const tools = element("div", "practice-sequence__tools");
            const undo = element("button", "pbtn", "Undo last");
            undo.type = "button";
            undo.dataset.sequenceUndo = "";
            undo.addEventListener("click", function () {
                let index = currentState.answer.length - 1;
                while (index >= 0 && !currentState.answer[index]) index -= 1;
                if (index < 0) return;
                const removed = currentState.answer[index];
                currentState.answer[index] = "";
                sequenceEdited(currentState, index);
                const returned = sequenceControls.querySelector('[data-sequence-value="' + CSS.escape(removed) + '"]');
                if (returned) returned.focus({ preventScroll: true });
            });
            const clear = element("button", "pbtn", "Clear order");
            clear.type = "button";
            clear.dataset.sequenceClear = "";
            clear.addEventListener("click", function () {
                currentState.answer = Array(currentQuestion.answerSequence.length).fill("");
                currentState.correctPositions = [];
                clearOutcomeForEdit(true);
                applySequenceStates();
                const first = sequenceControls.querySelector("[data-sequence-value]");
                if (first) first.focus({ preventScroll: true });
            });
            tools.append(undo, clear);
            sequenceControls.append(pool, order, tools);
            applySequenceStates();
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
            expression.hidden = currentQuestion.mode === "choice";
            answerLabel.textContent = currentQuestion.answerLabel || "Your answer";

            singleWrap.hidden = currentQuestion.mode !== "single";
            choiceField.hidden = currentQuestion.mode !== "choice";
            sequenceField.hidden = currentQuestion.mode !== "sequence";
            if (currentQuestion.mode === "single") {
                input.value = currentState.answer;
                input.setAttribute("aria-label", currentQuestion.answerLabel + " for " + currentQuestion.prompt);
            } else if (currentQuestion.mode === "choice") {
                renderChoice(currentQuestion, currentState);
            } else {
                renderSequence(currentQuestion, currentState);
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
                currentState.answer = Array.from(sequenceControls.querySelectorAll("[data-sequence-slot]")).map(function (slot) {
                    return slot.dataset.value || "";
                });
            }
            const result = evaluateResponse(question(), currentState.answer);
            currentState.replaceConfirm = false;
            currentState.correctPositions = result.correctPositions || [];
            if (question().mode === "sequence") applySequenceStates();

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
                const control = root.querySelector(question().mode === "choice" ? "[data-choice-options] input" : "[data-sequence-controls] [data-sequence-value]:not(:disabled)");
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
