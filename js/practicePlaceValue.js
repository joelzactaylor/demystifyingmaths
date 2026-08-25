(function (scope) {
    "use strict";

    const STAGES = [
        { name: "Digit values", review: "The values of the places", lessonAnchor: "digit-values" },
        { name: "Zero placeholders", review: "How zero holds a place", lessonAnchor: "zero-placeholders" },
        { name: "Words and figures", review: "Constructing words and numbers", lessonAnchor: "words-and-figures" }
    ];
    const LESSON_URL = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/placeValue.html";
    const SMALL = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
        "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    const PLACE_NAMES = {
        6: "millions", 5: "hundred thousands", 4: "ten thousands", 3: "thousands",
        2: "hundreds", 1: "tens", 0: "ones", "-1": "tenths", "-2": "hundredths", "-3": "thousandths"
    };
    const UNIT_VALUES = {
        6: "1,000,000", 5: "100,000", 4: "10,000", 3: "1,000",
        2: "100", 1: "10", 0: "1", "-1": "0.1", "-2": "0.01", "-3": "0.001"
    };

    function randomInt(rng, min, max) {
        return min + Math.min(max - min, Math.floor(Math.max(0, rng()) * (max - min + 1)));
    }

    function pick(rng, values) {
        return values[randomInt(rng, 0, values.length - 1)];
    }

    function comma(value) {
        const parts = String(value).split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    function parseNumber(raw) {
        if (typeof raw !== "string") return NaN;
        const cleaned = raw.trim().replace(/[\s,]/g, "").replace(/[−–—]/g, "-");
        if (!cleaned || !/^[+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(cleaned)) return NaN;
        const value = Number(cleaned);
        return Number.isFinite(value) ? value : NaN;
    }

    function near(left, right) {
        return Number.isFinite(left) && Number.isFinite(right) &&
            Math.abs(left - right) <= Math.max(1e-10, Math.abs(right) * 1e-10);
    }

    function underHundred(value) {
        if (value < 20) return SMALL[value];
        return TENS[Math.floor(value / 10)] + (value % 10 ? "-" + SMALL[value % 10] : "");
    }

    function underThousand(value) {
        const hundreds = Math.floor(value / 100);
        const rest = value % 100;
        if (!hundreds) return underHundred(rest);
        return SMALL[hundreds] + " hundred" + (rest ? " and " + underHundred(rest) : "");
    }

    function wholeWords(value) {
        const number = Number(value);
        if (number === 0) return "zero";
        const millions = Math.floor(number / 1000000);
        const thousands = Math.floor(number / 1000) % 1000;
        const units = number % 1000;
        const groups = [];
        if (millions) groups.push(underThousand(millions) + " million");
        if (thousands) groups.push(underThousand(thousands) + " thousand");
        if (units) groups.push(underThousand(units));
        if (groups.length === 1) return groups[0];
        const needsAnd = units > 0 && units < 100;
        return groups.slice(0, -1).join(", ") + (needsAnd ? " and " : " ") + groups[groups.length - 1];
    }

    function decimalWords(digits) {
        const value = Number(digits);
        const name = digits.length === 1 ? "tenths" : digits.length === 2 ? "hundredths" : "thousandths";
        return wholeWords(value) + " " + name;
    }

    function numberWords(numberText) {
        const parts = numberText.split(".");
        const whole = Number(parts[0]);
        if (parts.length === 1) return wholeWords(whole);
        return wholeWords(whole) + ", and " + decimalWords(parts[1]);
    }

    function pointWords(numberText) {
        const parts = numberText.split(".");
        if (parts.length === 1) return wholeWords(Number(parts[0]));
        return wholeWords(Number(parts[0])) + " point " + parts[1].split("").map(function (digit) {
            return SMALL[Number(digit)];
        }).join(" ");
    }

    function normaliseWords(raw) {
        return String(raw || "").toLowerCase()
            .replace(/[’']/g, "")
            .replace(/[-–—,]/g, " ")
            .replace(/\band\b/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function createDigits(rng, length, forceZeroIndex) {
        const digits = [];
        for (let index = 0; index < length; index += 1) {
            digits.push(randomInt(rng, index === 0 ? 1 : 0, 9));
        }
        if (Number.isInteger(forceZeroIndex)) digits[forceZeroIndex] = 0;
        return digits;
    }

    function expandedTerms(numberText) {
        const parts = numberText.split(".");
        const whole = parts[0];
        const decimal = parts[1] || "";
        const terms = [];
        whole.split("").forEach(function (digit, index) {
            const exponent = whole.length - index - 1;
            if (digit !== "0") terms.push(comma(Number(digit) * Math.pow(10, exponent)));
        });
        decimal.split("").forEach(function (digit, index) {
            if (digit !== "0") terms.push("0." + "0".repeat(index) + digit);
        });
        return terms;
    }

    function baseQuestion(stage, family, values) {
        return Object.assign({
            stage: stage,
            family: family,
            factKey: values.factKey,
            answerLabel: "Your answer",
            answerType: "number",
            hints: [],
            steps: []
        }, values);
    }

    function makeDigitValueQuestion(family, rng) {
        const ranges = [[4, 6], [0, 3], [-1, -1], [-3, -2]];
        const range = ranges[family];
        const exponent = randomInt(rng, range[0], range[1]);
        const wholeLength = exponent >= 0 ? Math.max(exponent + 1, randomInt(rng, exponent + 1, 7)) : randomInt(rng, 2, 5);
        const decimalLength = exponent < 0 ? Math.max(-exponent, randomInt(rng, -exponent, 3)) : (family === 1 && rng() > 0.55 ? randomInt(rng, 1, 3) : 0);
        const wholeDigits = createDigits(rng, wholeLength);
        const decimalDigits = decimalLength ? createDigits(rng, decimalLength) : [];
        const index = exponent >= 0 ? wholeLength - exponent - 1 : -exponent - 1;
        const digit = randomInt(rng, 2, 9);
        if (exponent >= 0) wholeDigits[index] = digit;
        else decimalDigits[index] = digit;
        wholeDigits.forEach(function (value, position) {
            if (value === digit && !(exponent >= 0 && position === index)) {
                wholeDigits[position] = digit === 9 ? 8 : digit + 1;
            }
        });
        decimalDigits.forEach(function (value, position) {
            if (value === digit && !(exponent < 0 && position === index)) {
                decimalDigits[position] = digit === 9 ? 8 : digit + 1;
            }
        });
        const numberText = wholeDigits.join("") + (decimalLength ? "." + decimalDigits.join("") : "");
        const answerText = exponent >= 0
            ? comma(String(digit * Math.pow(10, exponent)))
            : "0." + "0".repeat(-exponent - 1) + digit;
        const answerValue = Number(answerText.replace(/,/g, ""));

        return baseQuestion(0, family, {
            factKey: numberText + ":" + exponent,
            title: "Find the digit's value",
            givenLabel: "Number",
            given: comma(numberText),
            prompt: "What is the value of the " + digit + " in this number? Give your answer in digits.",
            expression: digit + " in " + comma(numberText),
            answerValue: answerValue,
            answerText: answerText,
            hints: [
                "Locate the " + digit + ", then name its place from the decimal point.",
                "The digit is in the " + PLACE_NAMES[exponent] + " place. A single unit in that place is worth " + UNIT_VALUES[exponent] + "."
            ],
            steps: [
                "The " + digit + " is in the " + PLACE_NAMES[exponent] + " place.",
                "One position in that place is worth " + UNIT_VALUES[exponent] + ".",
                "There are " + digit + " lots of " + UNIT_VALUES[exponent] + ".",
                "The value of the digit is " + answerText + "."
            ],
            success: "The " + digit + " is in the " + PLACE_NAMES[exponent] + " place, so its value is " + answerText + ".",
            nudge: "The digit is correct; check how far its place is from the ones place."
        });
    }

    function makePlaceholderQuestion(family, rng) {
        if (family === 0) {
            const length = randomInt(rng, 4, 7);
            const zeroIndex = randomInt(rng, 1, length - 2);
            const digits = createDigits(rng, length, zeroIndex);
            const exponent = length - zeroIndex - 1;
            const numberText = digits.join("");
            return baseQuestion(1, family, {
                factKey: numberText + ":zero",
                title: "Identify a placeholder",
                givenLabel: "Number",
                given: comma(numberText),
                prompt: "Which digit is in the " + PLACE_NAMES[exponent] + " place?",
                expression: PLACE_NAMES[exponent] + " place",
                answerValue: 0,
                answerText: "0",
                hints: [
                    "Count places from the ones place towards the left.",
                    "The " + PLACE_NAMES[exponent] + " place is occupied even though it contributes no value."
                ],
                steps: [
                    "Start at the final digit, which is in the ones place.",
                    "Move left until the " + PLACE_NAMES[exponent] + " place.",
                    "That position contains 0.",
                    "The digit is 0; it holds the place for the surrounding digits."
                ],
                success: "The 0 occupies the " + PLACE_NAMES[exponent] + " place and keeps the other digits in position.",
                nudge: "Start at the ones digit and count one place at a time to the left."
            });
        }

        if (family === 1) {
            const length = randomInt(rng, 5, 7);
            const digits = createDigits(rng, length, randomInt(rng, 1, length - 2));
            if (!digits.includes(0)) digits[2] = 0;
            const numberText = digits.join("");
            const terms = expandedTerms(numberText);
            return baseQuestion(1, family, {
                factKey: numberText + ":expanded-whole",
                title: "Keep the empty places",
                givenLabel: "Expanded value",
                given: terms.join(" + "),
                prompt: "Write this number in figures.",
                expression: terms.join(" + "),
                answerValue: Number(numberText),
                answerText: comma(numberText),
                hints: [
                    "Give every term its own place, including the places not named by a term.",
                    "A place missing from the expanded value needs a zero before the non-zero parts are joined."
                ],
                steps: [
                    "Match each term to its place.",
                    "Write its digit in that column.",
                    "Put 0 in every place with no term.",
                    "The number is " + comma(numberText) + "."
                ],
                success: comma(numberText) + " keeps every unfilled place with a zero.",
                nudge: "Check whether a zero is needed between two of the non-zero digits."
            });
        }

        if (family === 2) {
            const whole = randomInt(rng, 1, 9);
            const decimal = createDigits(rng, 3, randomInt(rng, 0, 1));
            decimal[2] = randomInt(rng, 1, 9);
            const numberText = whole + "." + decimal.join("");
            const terms = expandedTerms(numberText);
            return baseQuestion(1, family, {
                factKey: numberText + ":expanded-decimal",
                title: "Hold a decimal place",
                givenLabel: "Expanded value",
                given: terms.join(" + "),
                prompt: "Write this number in figures.",
                expression: terms.join(" + "),
                answerValue: Number(numberText),
                answerText: numberText,
                hints: [
                    "Line the decimal parts up as tenths, hundredths and thousandths.",
                    "If one of those places has no term, write 0 there before placing the next digit."
                ],
                steps: [
                    "The whole-number part is " + whole + ".",
                    "Place each decimal term in its named position.",
                    "Use 0 in the decimal place with no value.",
                    "The number is " + numberText + "."
                ],
                success: numberText + " uses 0 to keep each decimal digit in its correct place.",
                nudge: "Check the tenths, hundredths and thousandths separately; one empty place needs a zero."
            });
        }

        const thousands = randomInt(rng, 2, 9);
        const tens = randomInt(rng, 1, 9);
        const hundredths = randomInt(rng, 1, 9);
        const numberText = String(thousands) + "0" + String(tens) + "0.0" + String(hundredths);
        return baseQuestion(1, family, {
            factKey: numberText + ":places",
            title: "Build the places",
            givenLabel: "Place values",
            given: thousands + " thousands, " + tens + " tens and " + hundredths + " hundredths",
            prompt: "Write the number in figures.",
            expression: thousands + " thousands + " + tens + " tens + " + hundredths + " hundredths",
            answerValue: Number(numberText),
            answerText: comma(numberText),
            hints: [
                "Make a place for thousands, hundreds, tens, ones, tenths and hundredths.",
                "Write 0 in the hundreds, ones and tenths places because none of those places is named."
            ],
            steps: [
                "Put " + thousands + " in the thousands place and " + tens + " in the tens place.",
                "Put " + hundredths + " in the hundredths place.",
                "Use 0 in the hundreds, ones and tenths places.",
                "The number is " + comma(numberText) + "."
            ],
            success: comma(numberText) + " keeps the unnamed hundreds, ones and tenths places with zeros.",
            nudge: "Write all six places in order and fill every unnamed place with 0."
        });
    }

    function makeWordsQuestion(family, rng) {
        const hasDecimal = family === 1 || family === 3;
        const wholeLength = randomInt(rng, 4, 7);
        const wholeDigits = createDigits(rng, wholeLength, randomInt(rng, 1, wholeLength - 2));
        const wholeText = wholeDigits.join("");
        let numberText = wholeText;
        if (hasDecimal) {
            const decimal = createDigits(rng, 3, 1);
            decimal[decimal.length - 1] = randomInt(rng, 1, 9);
            numberText += "." + decimal.join("");
        }
        const canonical = numberWords(numberText);
        const point = pointWords(numberText);
        const figuresToWords = family < 2;

        if (figuresToWords) {
            return baseQuestion(2, family, {
                factKey: numberText + ":to-words",
                title: "Write the number in words",
                givenLabel: "Number",
                given: comma(numberText),
                prompt: "Write this number in words.",
                expression: comma(numberText),
                answerType: "words",
                answerLabel: "Number in words",
                acceptedWords: [canonical, point],
                answerText: canonical,
                hints: [
                    hasDecimal
                        ? "Read the whole-number part first, then use the final decimal place to name the decimal part."
                        : "Separate the whole number into groups of three digits from the right.",
                    hasDecimal
                        ? "The final decimal digit is in the " + PLACE_NAMES[-numberText.split(".")[1].length] + " place."
                        : "Name the millions group, the thousands group and the final group in order."
                ],
                steps: [
                    "Separate the whole-number digits into groups of three from the right.",
                    "Read the whole-number part as " + wholeWords(Number(wholeText)) + ".",
                    hasDecimal ? "Read the decimal digits together and name them by the final place: " + decimalWords(numberText.split(".")[1]) + "." : "No decimal part is present.",
                    "In words: " + canonical + "."
                ],
                success: "That wording keeps every digit in its correct place.",
                nudge: hasDecimal
                    ? "Check the name of the final decimal place and make sure internal zeros still affect the reading."
                    : "Check each three-digit group, including any zero that separates two non-zero places."
            });
        }

        return baseQuestion(2, family, {
            factKey: numberText + ":to-figures",
            title: "Write the number in figures",
            givenLabel: "Number in words",
            given: canonical,
            prompt: "Write this number in figures.",
            expression: canonical,
            answerValue: Number(numberText),
            answerText: comma(numberText),
            hints: [
                hasDecimal
                    ? "Build the whole-number groups first, then place the decimal digits according to the named final place."
                    : "Build a three-digit group for millions, thousands and units where each is needed.",
                "Use 0 in any place named by position but not by value."
            ],
            steps: [
                "Separate the words into whole-number groups.",
                "Write each group with three positions where another group follows.",
                hasDecimal ? "Write the decimal part so its final digit is in the " + PLACE_NAMES[-numberText.split(".")[1].length] + " place." : "There is no decimal part to add.",
                "In figures: " + comma(numberText) + "."
            ],
            success: comma(numberText) + " places every digit, including each zero placeholder, correctly.",
            nudge: hasDecimal
                ? "Check each three-digit group and the position of the decimal point."
                : "Check that every whole-number group has the positions it needs."
        });
    }

    function generateQuestion(stage, family, rng, excludedKey) {
        const random = rng || Math.random;
        let question;
        for (let attempt = 0; attempt < 8; attempt += 1) {
            if (stage === 0) question = makeDigitValueQuestion(family, random);
            else if (stage === 1) question = makePlaceholderQuestion(family, random);
            else question = makeWordsQuestion(family, random);
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
        if (typeof raw !== "string" || !raw.trim()) return { state: "blank", text: "Enter an answer before checking." };
        if (question.answerType === "words") {
            const normalised = normaliseWords(raw);
            if (!/^[a-z\s-]+$/i.test(raw.trim().replace(/[,’']/g, ""))) {
                return { state: "unreadable", text: "Use number words rather than figures for this answer." };
            }
            const correct = question.acceptedWords.some(function (answer) {
                return normaliseWords(answer) === normalised;
            });
            return correct
                ? { state: "correct", text: question.success }
                : { state: "try-again", text: question.nudge };
        }
        const parsed = parseNumber(raw);
        if (!Number.isFinite(parsed)) {
            return { state: "unreadable", text: "Enter one number using digits and a decimal point where needed." };
        }
        if (near(parsed, question.answerValue)) return { state: "correct", value: parsed, text: question.success };
        if (question.answerValue !== 0 && parsed !== 0) {
            const ratio = parsed / question.answerValue;
            const power = Math.log10(Math.abs(ratio));
            if (near(power, Math.round(power)) && Math.round(power) !== 0 && Math.abs(Math.round(power)) <= 6) {
                return { state: "try-again", text: "The non-zero digit is plausible, but its place value is not. " + question.nudge };
            }
        }
        return { state: "try-again", text: question.nudge };
    }

    function validateQuestion(question) {
        if (!question || question.hints.length !== 2 || question.steps.length !== 4 || !question.factKey) return false;
        if (question.answerType === "words") {
            return question.acceptedWords.length >= 1 &&
                evaluateResponse(question, question.answerText).state === "correct";
        }
        return Number.isFinite(question.answerValue) &&
            near(parseNumber(question.answerText), question.answerValue) &&
            evaluateResponse(question, question.answerText).state === "correct";
    }

    function selfCheck(iterations) {
        const rng = createSeededRandom(73021);
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
        normaliseWords: normaliseWords,
        numberWords: numberWords,
        parseNumber: parseNumber,
        selfCheck: selfCheck,
        validateQuestion: validateQuestion
    };

    scope.PlaceValuePractice = api;
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
        const givenLabel = root.querySelector("[data-question-given-label]");
        const answerLabel = root.querySelector("[data-answer-label]");
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
            givenLabel.textContent = currentQuestion.givenLabel;
            given.textContent = currentQuestion.given;
            given.dataset.kind = currentQuestion.givenLabel === "Number in words" ? "words" : "number";
            prompt.textContent = currentQuestion.prompt;
            expression.textContent = currentQuestion.expression;
            expression.dataset.kind = currentQuestion.givenLabel === "Number in words" ? "words" : "number";
            answerLabel.textContent = currentQuestion.answerLabel;
            input.inputMode = currentQuestion.answerType === "words" ? "text" : "decimal";
            input.value = currentState.answer;
            input.setAttribute("aria-label", currentQuestion.answerLabel + " for " + currentQuestion.prompt);

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
                    entry.appendChild(element("p", "", item.givenLabel + ": " + item.given));
                    const task = element("p");
                    task.append(item.prompt + " ");
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
                link.href = LESSON_URL + "#" + stage.lessonAnchor;
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
                entry.appendChild(element("p", "practice-reflection-question__given", item.givenLabel + ": " + item.given));
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
