(function (scope) {
    "use strict";

    const STAGES = [
        { name: "Related products", review: "Scale one factor at a time", lessonAnchor: "related-products" },
        { name: "Read facts backwards", review: "Read a product fact backwards", lessonAnchor: "read-facts-backwards" },
        { name: "Missing values", review: "Rewrite a missing value with an inverse", lessonAnchor: "missing-values" }
    ];

    const FACTS = [
        { a: 43, b: 26, p: 1118 },
        { a: 24, b: 35, p: 840 },
        { a: 32, b: 45, p: 1440 },
        { a: 36, b: 25, p: 900 },
        { a: 48, b: 25, p: 1200 },
        { a: 56, b: 24, p: 1344 },
        { a: 64, b: 35, p: 2240 },
        { a: 72, b: 25, p: 1800 },
        { a: 84, b: 15, p: 1260 },
        { a: 28, b: 45, p: 1260 },
        { a: 42, b: 36, p: 1512 },
        { a: 52, b: 34, p: 1768 }
    ];

    const PRODUCT_CONFIGS = [
        { first: -1, second: 0 },
        { first: 0, second: -2 },
        { first: -1, second: -1 },
        { first: -1, second: 2 }
    ];

    const QUOTIENT_CONFIGS = [
        { divisor: "a", dividendScale: 0, divisorScale: 0 },
        { divisor: "b", dividendScale: -1, divisorScale: -1 },
        { divisor: "a", dividendScale: 0, divisorScale: -1 },
        { divisor: "b", dividendScale: -2, divisorScale: -1 }
    ];

    const MISSING_CONFIGS = [
        { kind: "factor", known: "b", knownScale: -1, resultScale: -1, missingFirst: true },
        { kind: "factor", known: "a", knownScale: -1, resultScale: 0, missingFirst: false },
        { kind: "dividend", divisor: "a", divisorScale: -1, quotientScale: 1 },
        { kind: "dividend", divisor: "b", divisorScale: -1, quotientScale: -1 }
    ];

    const LESSON_URL = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/usingAGivenCalculation.html";

    const comma = (digits) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const trimDecimal = (value) => value.includes(".") ? value.replace(/0+$/, "").replace(/\.$/, "") : value;

    function formatScaled(value, power) {
        const digits = String(value);
        let raw;
        if (power >= 0) raw = `${digits}${"0".repeat(power)}`;
        else {
            const places = -power;
            const point = digits.length - places;
            raw = point > 0
                ? `${digits.slice(0, point)}.${digits.slice(point)}`
                : `0.${"0".repeat(-point)}${digits}`;
        }
        raw = trimDecimal(raw);
        const parts = raw.split(".");
        return parts.length === 2 ? `${comma(parts[0])}.${parts[1]}` : comma(parts[0]);
    }

    function valueOfScaled(value, power) {
        return Number(formatScaled(value, power).replace(/,/g, ""));
    }

    function factorOf(power) {
        return 10 ** Math.abs(power);
    }

    function changeSymbol(power) {
        if (power === 0) return "unchanged";
        return `${power > 0 ? "×" : "÷"} ${comma(String(factorOf(power)))}`;
    }

    function changePhrase(power) {
        if (power === 0) return "unchanged";
        return `${power > 0 ? "multiplied" : "divided"} by ${comma(String(factorOf(power)))}`;
    }

    function multiplierWords(power) {
        return ({
            "-2": "one hundredth",
            "-1": "one tenth",
            "0": "one",
            "1": "ten",
            "2": "one hundred",
            "3": "one thousand"
        })[String(power)] || `10 to the power ${power}`;
    }

    function scaledChange(label, original, power) {
        const changed = formatScaled(original, power);
        return power === 0
            ? `The ${label} stays ${changed}, so it is unchanged.`
            : `The ${label} changes from ${formatScaled(original, 0)} to ${changed}, so it is ${changePhrase(power)}.`;
    }

    function randomIndex(rng, length) {
        return Math.min(length - 1, Math.floor(Math.max(0, rng()) * length));
    }

    function pickFact(rng, excludedKey) {
        const choices = FACTS.filter((fact) => `${fact.a}-${fact.b}` !== excludedKey);
        return choices[randomIndex(rng, choices.length)] || FACTS[0];
    }

    function parseNumber(raw) {
        if (typeof raw !== "string") return NaN;
        const cleaned = raw.trim().replace(/[\s,]/g, "").replace(/[−–—]/g, "-");
        if (!cleaned || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(cleaned)) return NaN;
        const value = Number(cleaned);
        return Number.isFinite(value) ? value : NaN;
    }

    function near(left, right) {
        return Number.isFinite(left) && Number.isFinite(right) &&
            Math.abs(left - right) <= Math.max(1e-9, Math.abs(right) * 1e-9);
    }

    function powerOfTenDifference(actual, expected) {
        if (!(actual > 0) || !(expected > 0)) return null;
        const raw = Math.log10(actual / expected);
        const rounded = Math.round(raw);
        return near(raw, rounded) && rounded !== 0 && Math.abs(rounded) <= 4 ? rounded : null;
    }

    function scaleNearMiss(actual, expected, nudge) {
        if (actual <= 0) return "Every value in the given fact is positive, so the related value must be positive too.";
        const difference = powerOfTenDifference(actual, expected);
        if (difference !== null) {
            const amount = comma(String(10 ** Math.abs(difference)));
            return `The significant digits match, but this value is ${amount} times too ${difference > 0 ? "large" : "small"}. ${nudge}`;
        }
        return nudge;
    }

    function evaluateResponse(question, raw) {
        if (typeof raw !== "string" || !raw.trim()) {
            return {
                state: "blank",
                text: "Enter an answer before checking."
            };
        }
        const parsed = parseNumber(raw);
        if (!Number.isFinite(parsed)) {
            return {
                state: "unreadable",
                text: "I could not read that as one number. You can use digits, a decimal point, spaces or commas."
            };
        }
        if (near(parsed, question.answerValue)) return { state: "correct", value: parsed, text: question.success };
        return {
            state: "try-again",
            value: parsed,
            text: scaleNearMiss(parsed, question.answerValue, question.nudge)
        };
    }

    function makeProductQuestion(fact, family) {
        const config = PRODUCT_CONFIGS[family];
        const resultScale = config.first + config.second;
        const first = formatScaled(fact.a, config.first);
        const second = formatScaled(fact.b, config.second);
        const result = formatScaled(fact.p, resultScale);
        const scaleLine = `${multiplierWords(config.first)} × ${multiplierWords(config.second)} = ${multiplierWords(resultScale)}`;

        return {
            stage: 0,
            family,
            factKey: `${fact.a}-${fact.b}`,
            title: "Find the related product",
            given: `${formatScaled(fact.a, 0)} × ${formatScaled(fact.b, 0)} = ${formatScaled(fact.p, 0)}`,
            prompt: "Use the given calculation to work out:",
            expression: `${first} × ${second} = ?`,
            answerValue: valueOfScaled(fact.p, resultScale),
            answerText: result,
            hints: [
                `${scaledChange("first factor", fact.a, config.first)} ${scaledChange("second factor", fact.b, config.second)}`,
                `Combine the two factor changes. The product is ${changePhrase(resultScale)} overall.`
            ],
            steps: [
                scaledChange("first factor", fact.a, config.first),
                scaledChange("second factor", fact.b, config.second),
                `Combine the changes: ${scaleLine}. The product is ${changePhrase(resultScale)}.`,
                `${formatScaled(fact.p, 0)} becomes ${result}, so ${first} × ${second} = ${result}.`
            ],
            success: `Yes. The factor changes combine, so the product is ${changePhrase(resultScale)}: ${result}.`,
            nudge: "Track the change in each factor, then combine those two changes before moving the decimal point.",
            operands: [valueOfScaled(fact.a, config.first), valueOfScaled(fact.b, config.second)],
            operation: "multiply"
        };
    }

    function makeQuotientQuestion(fact, family) {
        const config = QUOTIENT_CONFIGS[family];
        const divisorBase = config.divisor === "a" ? fact.a : fact.b;
        const quotientBase = config.divisor === "a" ? fact.b : fact.a;
        const dividend = formatScaled(fact.p, config.dividendScale);
        const divisor = formatScaled(divisorBase, config.divisorScale);
        const answerScale = config.dividendScale - config.divisorScale;
        const answer = formatScaled(quotientBase, answerScale);
        const baseInverse = `${formatScaled(fact.p, 0)} ÷ ${formatScaled(divisorBase, 0)} = ${formatScaled(quotientBase, 0)}`;
        const scaleLine = `${multiplierWords(config.dividendScale)} ÷ ${multiplierWords(config.divisorScale)} = ${multiplierWords(answerScale)}`;

        return {
            stage: 1,
            family,
            factKey: `${fact.a}-${fact.b}`,
            title: "Read the fact as a division",
            given: `${formatScaled(fact.a, 0)} × ${formatScaled(fact.b, 0)} = ${formatScaled(fact.p, 0)}`,
            prompt: "Use the given calculation to work out:",
            expression: `${dividend} ÷ ${divisor} = ?`,
            answerValue: valueOfScaled(quotientBase, answerScale),
            answerText: answer,
            hints: [
                `First read the multiplication backwards. The product becomes the dividend; dividing it by ${formatScaled(divisorBase, 0)} recovers the other factor.`,
                `The dividend is ${changePhrase(config.dividendScale)} and the divisor is ${changePhrase(config.divisorScale)}. In division, compare those changes by dividing them.`
            ],
            steps: [
                `Read the given multiplication backwards: ${baseInverse}.`,
                scaledChange("dividend", fact.p, config.dividendScale),
                `${scaledChange("divisor", divisorBase, config.divisorScale)} The quotient change is ${scaleLine}.`,
                `${formatScaled(quotientBase, 0)} is therefore ${changePhrase(answerScale)}, giving ${dividend} ÷ ${divisor} = ${answer}.`
            ],
            success: `Yes. Reading the fact backwards and comparing the dividend and divisor changes gives ${answer}.`,
            nudge: "Read the original multiplication as a division first, then compare the dividend's scale with the divisor's scale.",
            operands: [valueOfScaled(fact.p, config.dividendScale), valueOfScaled(divisorBase, config.divisorScale)],
            operation: "divide"
        };
    }

    function makeMissingQuestion(fact, family) {
        const config = MISSING_CONFIGS[family];

        if (config.kind === "factor") {
            const knownBase = config.known === "a" ? fact.a : fact.b;
            const missingBase = config.known === "a" ? fact.b : fact.a;
            const known = formatScaled(knownBase, config.knownScale);
            const result = formatScaled(fact.p, config.resultScale);
            const answerScale = config.resultScale - config.knownScale;
            const answer = formatScaled(missingBase, answerScale);
            const expression = config.missingFirst ? `? × ${known} = ${result}` : `${known} × ? = ${result}`;
            const rearranged = `? = ${result} ÷ ${known}`;

            return {
                stage: 2,
                family,
                factKey: `${fact.a}-${fact.b}`,
                title: "Find the missing factor",
                given: `${formatScaled(fact.a, 0)} × ${formatScaled(fact.b, 0)} = ${formatScaled(fact.p, 0)}`,
                prompt: "Use the given calculation to find the missing value:",
                expression,
                answerValue: valueOfScaled(missingBase, answerScale),
                answerText: answer,
                hints: [
                    `A missing factor is found by dividing the product by the known factor: ${rearranged}.`,
                    `The product is ${changePhrase(config.resultScale)} and the known factor is ${changePhrase(config.knownScale)}. Divide those changes to find the missing factor's scale.`
                ],
                steps: [
                    `Rearrange with the inverse operation: ${rearranged}.`,
                    `In the given fact, ${formatScaled(fact.p, 0)} ÷ ${formatScaled(knownBase, 0)} = ${formatScaled(missingBase, 0)}.`,
                    `The missing factor's scale is ${multiplierWords(config.resultScale)} ÷ ${multiplierWords(config.knownScale)} = ${multiplierWords(answerScale)}.`,
                    `${formatScaled(missingBase, 0)} is ${changePhrase(answerScale)}, so ? = ${answer}.`
                ],
                success: `Yes. Dividing by the known factor means the missing factor is ${changePhrase(answerScale)}: ${answer}.`,
                nudge: "Rewrite the missing factor as product ÷ known factor, then compare those two scale changes.",
                operands: [valueOfScaled(fact.p, config.resultScale), valueOfScaled(knownBase, config.knownScale)],
                operation: "divide"
            };
        }

        const divisorBase = config.divisor === "a" ? fact.a : fact.b;
        const quotientBase = config.divisor === "a" ? fact.b : fact.a;
        const divisor = formatScaled(divisorBase, config.divisorScale);
        const quotient = formatScaled(quotientBase, config.quotientScale);
        const answerScale = config.divisorScale + config.quotientScale;
        const answer = formatScaled(fact.p, answerScale);
        const rearranged = `? = ${divisor} × ${quotient}`;

        return {
            stage: 2,
            family,
            factKey: `${fact.a}-${fact.b}`,
            title: "Find the missing dividend",
            given: `${formatScaled(fact.a, 0)} × ${formatScaled(fact.b, 0)} = ${formatScaled(fact.p, 0)}`,
            prompt: "Use the given calculation to find the missing value:",
            expression: `? ÷ ${divisor} = ${quotient}`,
            answerValue: valueOfScaled(fact.p, answerScale),
            answerText: answer,
            hints: [
                `A missing dividend is found by multiplying the divisor and quotient: ${rearranged}.`,
                `Combine the divisor's ${changeSymbol(config.divisorScale)} change with the quotient's ${changeSymbol(config.quotientScale)} change.`
            ],
            steps: [
                `Rearrange with the inverse operation: ${rearranged}.`,
                `The divisor comes from ${formatScaled(divisorBase, 0)} and is ${changePhrase(config.divisorScale)}.`,
                `The quotient comes from ${formatScaled(quotientBase, 0)} and is ${changePhrase(config.quotientScale)}. Their combined scale is ${multiplierWords(answerScale)}.`,
                `${formatScaled(fact.p, 0)} is ${changePhrase(answerScale)}, so ? = ${answer}.`
            ],
            success: `Yes. The divisor and quotient changes combine, so the dividend is ${changePhrase(answerScale)}: ${answer}.`,
            nudge: "Rewrite the missing dividend as divisor × quotient, then combine those two scale changes.",
            operands: [valueOfScaled(divisorBase, config.divisorScale), valueOfScaled(quotientBase, config.quotientScale)],
            operation: "multiply"
        };
    }

    function generateQuestion(stage, family, rng, excludedKey) {
        const fact = pickFact(rng || Math.random, excludedKey);
        if (stage === 0) return makeProductQuestion(fact, family);
        if (stage === 1) return makeQuotientQuestion(fact, family);
        return makeMissingQuestion(fact, family);
    }

    function buildRound(rng) {
        const random = rng || Math.random;
        const questions = [];
        let previousKey = "";
        [PRODUCT_CONFIGS, QUOTIENT_CONFIGS, MISSING_CONFIGS].forEach((configs, stage) => {
            configs.forEach((unused, family) => {
                const question = generateQuestion(stage, family, random, previousKey);
                questions.push(question);
                previousKey = question.factKey;
            });
        });
        return questions;
    }

    function createSeededRandom(seed) {
        let state = seed >>> 0;
        return function () {
            state = (1664525 * state + 1013904223) >>> 0;
            return state / 4294967296;
        };
    }

    function expectedFromOperands(question) {
        return question.operation === "multiply"
            ? question.operands[0] * question.operands[1]
            : question.operands[0] / question.operands[1];
    }

    function validateQuestion(question) {
        return question.hints.length === 2 && question.steps.length === 4 &&
            Number.isFinite(question.answerValue) && question.answerValue > 0 &&
            near(question.answerValue, expectedFromOperands(question)) &&
            near(question.answerValue, parseNumber(question.answerText));
    }

    function selfCheck(iterations) {
        const rng = createSeededRandom(73021);
        const count = Math.max(1, iterations || 1000);
        for (let index = 0; index < count; index += 1) {
            const round = buildRound(rng);
            if (round.length !== 12) throw new Error("A round must contain 12 questions.");
            round.forEach((question, questionIndex) => {
                if (question.stage !== Math.floor(questionIndex / 4) || !validateQuestion(question)) {
                    throw new Error(`Invalid generated question at round ${index + 1}, position ${questionIndex + 1}.`);
                }
            });
        }
        return { rounds: count, questions: count * 12 };
    }

    const api = {
        buildRound,
        createSeededRandom,
        evaluateResponse,
        formatScaled,
        generateQuestion,
        parseNumber,
        selfCheck,
        validateQuestion
    };

    scope.GivenCalculationPractice = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
    if (typeof document === "undefined") return;

    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function mount(root) {
        let round = buildRound(Math.random);
        let states = round.map(() => ({
            answer: "",
            attempts: 0,
            hintLevel: 0,
            solutionShown: false,
            outcome: null,
            feedback: "",
            tone: "",
            replaceConfirm: false
        }));
        let current = 0;

        const questionView = root.querySelector("[data-question-view]");
        const reflection = root.querySelector("[data-reflection]");
        const card = root.querySelector("[data-question-card]");
        const title = root.querySelector("[data-question-title]");
        const given = root.querySelector("[data-question-given]");
        const prompt = root.querySelector("[data-question-prompt]");
        const expression = root.querySelector("[data-question-expression]");
        const input = root.querySelector("[data-answer-input]");
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
        const stageIndicators = [...root.querySelectorAll("[data-stage-indicator]")];
        const independentCount = root.querySelector("[data-independent-count]");
        const supportedCount = root.querySelector("[data-supported-count]");
        const revisitCount = root.querySelector("[data-revisit-count]");
        const reflectionIntro = root.querySelector("[data-reflection-intro]");
        const reflectionFilters = [...root.querySelectorAll("[data-reflection-filter]")];
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
            verdictOverlay.classList.add("is-showing", `is-${kind}`);
            card.classList.add(kind === "right" ? "is-celebrating" : "is-nudged");
            const reduce = Boolean(reducedMotion && reducedMotion.matches);
            const duration = reduce ? 840 : kind === "right" ? 2175 : 1350;
            verdictTimer = window.setTimeout(clearVerdict, duration);
        }

        function populateSolution(currentQuestion) {
            solutionSteps.replaceChildren(...currentQuestion.steps.map((step) => element("li", "", step)));
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
                    ? currentState.attempts > 0 ? "Help me fix it" : "Give me a hint"
                    : currentState.hintLevel === 1 ? "One more hint" : "Both hints shown";
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
            progressCount.textContent = `Question ${current + 1} of ${round.length}`;
            progressBar.style.width = `${((current + 1) / round.length) * 100}%`;
            stageIndicators.forEach((indicator, index) => {
                indicator.classList.toggle("is-current", index === stage);
                indicator.classList.toggle("is-complete", index < stage);
                if (index === stage) indicator.setAttribute("aria-current", "step");
                else indicator.removeAttribute("aria-current");
            });

            title.textContent = currentQuestion.title;
            given.textContent = currentQuestion.given;
            prompt.textContent = currentQuestion.prompt;
            expression.textContent = currentQuestion.expression;
            input.value = currentState.answer;
            input.setAttribute("aria-label", `Your answer to ${currentQuestion.expression.replace("?", "the missing value")}`);

            card.classList.toggle("is-correct", Boolean(currentState.outcome));
            card.classList.toggle("is-review", !currentState.outcome && currentState.attempts > 0);
            if (currentState.feedback) setFeedback(currentState.feedback, currentState.tone);
            else setFeedback("", "");

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
            const currentQuestion = question();
            const raw = input.value;
            currentState.answer = raw;
            currentState.replaceConfirm = false;

            const result = evaluateResponse(currentQuestion, raw);
            if (result.state === "blank" || result.state === "unreadable") {
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
            if (currentState.solutionShown) {
                populateSolution(question());
            }
            buildPrintSheet();
        }

        function replaceQuestion() {
            const currentState = state();
            const hasWork = Boolean(currentState.answer.trim() || currentState.attempts || currentState.hintLevel || currentState.solutionShown);
            if (hasWork && !currentState.replaceConfirm) {
                currentState.replaceConfirm = true;
                setFeedback("Different numbers will replace the work in this question only. Press “Replace this question” to continue.", "consider");
                updateActionState();
                return;
            }
            const oldQuestion = question();
            round[current] = generateQuestion(oldQuestion.stage, oldQuestion.family, Math.random, oldQuestion.factKey);
            states[current] = {
                answer: "", attempts: 0, hintLevel: 0, solutionShown: false,
                outcome: null, feedback: "", tone: "", replaceConfirm: false
            };
            render(false);
            input.focus({ preventScroll: true });
        }

        function buildPrintSheet() {
            printSheet.replaceChildren();
            STAGES.forEach((stage, stageIndex) => {
                printSheet.appendChild(element("h3", "", stage.name));
                const list = element("ol");
                round.forEach((item, index) => {
                    if (item.stage !== stageIndex) return;
                    const entry = element("li", "practice-print-question");
                    entry.appendChild(element("p", "", `Given: ${item.given}`));
                    const task = element("p");
                    task.append("Work out: ");
                    task.appendChild(element("strong", "", item.expression));
                    entry.appendChild(task);
                    entry.appendChild(element("span", "practice-print-working", ""));
                    if (states[index].solutionShown) {
                        const solution = element("div", "practice-print-solution");
                        solution.appendChild(element("b", "", `Worked solution: ${item.answerText}`));
                        const steps = element("ol");
                        item.steps.forEach((step) => steps.appendChild(element("li", "", step)));
                        solution.appendChild(steps);
                        entry.appendChild(solution);
                    }
                    list.appendChild(entry);
                });
                printSheet.appendChild(list);
            });
        }

        function showReflection() {
            questionView.hidden = true;
            reflection.hidden = false;
            progressBar.style.width = "100%";
            stageIndicators.forEach((indicator) => {
                indicator.classList.remove("is-current");
                indicator.classList.add("is-complete");
                indicator.removeAttribute("aria-current");
            });

            const counts = states.reduce((totals, item) => {
                if (item.outcome === "independent") totals.independent += 1;
                else if (item.outcome === "supported") totals.supported += 1;
                else totals.revisit += 1;
                return totals;
            }, { independent: 0, supported: 0, revisit: 0 });

            independentCount.textContent = String(counts.independent);
            supportedCount.textContent = String(counts.supported);
            revisitCount.textContent = String(counts.revisit);
            reflectionIntro.textContent = counts.revisit === 0
                ? `All ${round.length} questions have a checked answer.`
                : `${round.length - counts.revisit} checked; ${counts.revisit} ${counts.revisit === 1 ? "is" : "are"} worth revisiting.`;

            renderReflectionQuestions("all");

            reflectionStages.replaceChildren(...STAGES.map((stage, stageIndex) => {
                const stageStates = states.slice(stageIndex * 4, stageIndex * 4 + 4);
                const revisit = stageStates.filter((item) => !item.outcome).length;
                const row = element("li");
                row.appendChild(element("b", "", stage.name));
                const link = element("a", "", revisit
                    ? `${revisit} to revisit · review this stage in the lesson`
                    : "Review this stage in the lesson");
                link.href = `${LESSON_URL}#${stage.lessonAnchor}`;
                row.appendChild(link);
                return row;
            }));
            buildPrintSheet();
            root.querySelector("#reflection-title").focus({ preventScroll: true });
        }

        function renderReflectionQuestions(filter) {
            const filtered = round
                .map((item, index) => ({ item, index, state: states[index] }))
                .filter(({ state: itemState }) => {
                    if (filter === "independent") return itemState.outcome === "independent";
                    if (filter === "supported") return itemState.outcome === "supported";
                    if (filter === "revisit") return !itemState.outcome;
                    return true;
                });
            const labels = {
                independent: "Completed independently",
                supported: "Completed with support",
                revisit: "Worth revisiting"
            };

            reflectionFilters.forEach((button) => {
                button.setAttribute("aria-pressed", String(button.dataset.reflectionFilter === filter));
            });
            showAllQuestionsButton.hidden = filter === "all";
            reflectionSummaryIntro.textContent = filter === "all"
                ? `All ${round.length} questions are listed below.`
                : `${filtered.length} ${filtered.length === 1 ? "question is" : "questions are"} ${labels[filter].toLowerCase()}.`;

            reflectionQuestions.replaceChildren(...filtered.map(({ item, index, state: itemState }) => {
                const entry = element("li", "practice-reflection-question");
                const heading = element("div", "practice-reflection-question__heading");
                const outcome = itemState.outcome || "revisit";
                heading.appendChild(element("strong", "", `Question ${index + 1}`));
                heading.appendChild(element("span", `is-${outcome}`, labels[outcome]));
                entry.appendChild(heading);
                entry.appendChild(element("p", "practice-reflection-question__stage", STAGES[item.stage].name));
                entry.appendChild(element("p", "practice-reflection-question__given", `Given: ${item.given}`));
                entry.appendChild(element("p", "practice-reflection-question__expression", item.expression));
                entry.appendChild(element("p", "practice-reflection-question__answer", itemState.answer.trim()
                    ? `Your answer: ${itemState.answer.trim()}`
                    : "No answer entered."));
                const link = element("a", "", `Return to question ${index + 1}`);
                link.href = "#practice-question-title";
                link.dataset.reviewQuestion = String(index);
                entry.appendChild(link);
                return entry;
            }));
        }

        input.addEventListener("input", () => {
            const currentState = state();
            currentState.answer = input.value;
            currentState.replaceConfirm = false;
            if (currentState.outcome) {
                currentState.outcome = null;
                card.classList.remove("is-correct");
                card.classList.add("is-review");
            }
            if (currentState.attempts || currentState.feedback) setFeedback("Answer changed.", "");
            updateActionState();
        });
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                if (event.repeat) return;
                if (state().outcome) nextButton.click();
                else checkAnswer();
            }
        });
        checkButton.addEventListener("click", () => {
            if (state().outcome) nextButton.click();
            else checkAnswer();
        });
        hintButton.addEventListener("click", showHint);
        solutionButton.addEventListener("click", toggleSolution);
        newQuestionButton.addEventListener("click", replaceQuestion);
        previousButton.addEventListener("click", () => {
            if (current === 0) return;
            current -= 1;
            render(true);
        });
        nextButton.addEventListener("click", () => {
            if (current === round.length - 1) {
                showReflection();
                return;
            }
            current += 1;
            render(true);
        });
        freshRoundButton.addEventListener("click", () => {
            round = buildRound(Math.random);
            states = round.map(() => ({
                answer: "", attempts: 0, hintLevel: 0, solutionShown: false,
                outcome: null, feedback: "", tone: "", replaceConfirm: false
            }));
            current = 0;
            render(true);
        });
        reviewLastButton.addEventListener("click", () => {
            current = round.length - 1;
            render(true);
        });
        reflectionFilters.forEach((button) => {
            button.addEventListener("click", () => renderReflectionQuestions(button.dataset.reflectionFilter));
        });
        showAllQuestionsButton.addEventListener("click", () => renderReflectionQuestions("all"));
        reflectionQuestions.addEventListener("click", (event) => {
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
