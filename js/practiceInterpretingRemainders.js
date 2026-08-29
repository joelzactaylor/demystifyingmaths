/* Practice: interpreting a remainder.
   Builds the twelve questions of a round, marks them and drives the page.
   The generator half runs without a document so it can be fuzzed from Node. */
(function (scope) {
    "use strict";

    const STAGES = [
        { name: "Writing the answer in the form asked for", lessonAnchor: "fractions-and-decimals" },
        { name: "Letting the context set the direction", lessonAnchor: "reading-the-question" },
        { name: "Answering the question that was asked", lessonAnchor: "three-questions" }
    ];

    const LESSON_URL = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/interpretingRemainders.html";

    const FAMILIES = [
        ["form-remainder", "form-leftover", "form-decimal", "form-fraction"],
        ["direction-down", "direction-up", "direction-choice", "direction-clash"],
        ["context-leftover", "context-tickets", "context-question", "context-choice"]
    ];

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
        for (let attempt = 0; attempt < 32; attempt += 1) {
            const candidate = make();
            if (ok(candidate)) return candidate;
        }
        return fallback;
    }

    function groupDigits(value) {
        const text = String(value);
        return text.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    /* Generated sentences have to read correctly for every drawn value, so
       every counted noun goes through here rather than being hard-coded. */
    function count(value, singular, plural) {
        return groupDigits(value) + " " + (Math.abs(value) === 1 ? singular : plural);
    }

    function agree(value, singularForm, pluralForm) {
        return Math.abs(value) === 1 ? singularForm : pluralForm;
    }

    function highestCommonFactor(a, b) {
        let left = Math.abs(a);
        let right = Math.abs(b);
        while (right) {
            const held = right;
            right = left % right;
            left = held;
        }
        return left;
    }

    /* Exact decimal for a division that terminates; null when it does not. */
    function exactDecimal(dividend, divisor) {
        const scaled = dividend * 1000;
        if (scaled % divisor !== 0) return null;
        const thousandths = scaled / divisor;
        const whole = Math.floor(thousandths / 1000);
        let fraction = String(thousandths % 1000).padStart(3, "0").replace(/0+$/, "");
        return fraction ? whole + "." + fraction : String(whole);
    }

    function money(pence) {
        return (pence / 100).toFixed(2);
    }

    /* ------------------------------------------------------------ contexts */

    /* Every context names an item that cannot be cut in half, so the
       round-up, round-down and leftover readings are all genuinely different. */
    const CONTEXTS = [
        {
            key: "minibus",
            item: "passengers", itemOne: "passenger", container: "minibuses", containerOne: "minibus",
            setting: function (total, group) {
                return groupDigits(total) + " passengers are travelling to a match. Each minibus seats " + count(group, "passenger", "passengers") + ".";
            },
            down: "How many minibuses can be filled completely?",
            up: "How many minibuses are needed so that every passenger travels?",
            left: "The minibuses are filled one at a time. How many passengers are left for the last, part-filled minibus?",
            upReason: "every passenger needs a seat",
            downReason: "only a full minibus counts as filled"
        },
        {
            key: "shelf",
            item: "books", itemOne: "book", container: "shelves", containerOne: "shelf",
            setting: function (total, group) {
                return "A library is moving " + groupDigits(total) + " books. Each shelf holds " + count(group, "book", "books") + ".";
            },
            down: "How many shelves can be filled completely?",
            up: "How many shelves are needed to hold every book?",
            left: "After every full shelf has been loaded, how many books are still to be placed?",
            upReason: "every book has to be shelved somewhere",
            downReason: "a part-full shelf is not a filled shelf"
        },
        {
            key: "box",
            item: "eggs", itemOne: "egg", container: "boxes", containerOne: "box",
            setting: function (total, group) {
                return "A farm has collected " + groupDigits(total) + " eggs. Each box holds " + count(group, "egg", "eggs") + ".";
            },
            down: "How many boxes can be filled completely?",
            up: "How many boxes are needed to pack every egg?",
            left: "After the full boxes are packed, how many eggs remain?",
            upReason: "no egg can be left unpacked",
            downReason: "a box is only full when it holds " + "every place"
        },
        {
            key: "bouquet",
            item: "flowers", itemOne: "flower", container: "bouquets", containerOne: "bouquet",
            setting: function (total, group) {
                return "A florist has " + groupDigits(total) + " flowers. Each bouquet uses " + count(group, "flower", "flowers") + ".";
            },
            down: "How many complete bouquets can be made?",
            up: "How many bouquets would be needed to use every flower?",
            left: "After making every complete bouquet, how many flowers are left?",
            upReason: "the last few flowers would still form a bouquet",
            downReason: "a bouquet is only complete with the full number of flowers"
        },
        {
            key: "table",
            item: "pupils", itemOne: "pupil", container: "tables", containerOne: "table",
            setting: function (total, group) {
                return groupDigits(total) + " pupils are being seated for an exam. Each table seats " + count(group, "pupil", "pupils") + ".";
            },
            down: "How many tables can be filled completely?",
            up: "How many tables are needed so that every pupil has a seat?",
            left: "After the full tables are seated, how many pupils are still standing?",
            upReason: "every pupil needs a place",
            downReason: "a table with a spare seat is not full"
        },
        {
            key: "tray",
            item: "cupcakes", itemOne: "cupcake", container: "trays", containerOne: "tray",
            setting: function (total, group) {
                return "A bakery has " + groupDigits(total) + " cupcakes to bake. Each tray takes " + count(group, "cupcake", "cupcakes") + ".";
            },
            down: "How many trays can be filled completely?",
            up: "How many trays are needed to bake every cupcake?",
            left: "After the full trays are loaded, how many cupcakes are left over?",
            upReason: "every cupcake still has to be baked",
            downReason: "only a full tray counts"
        }
    ];

    CONTEXTS[2].downReason = "a box is only full when every space is used";

    /* ------------------------------------------------------------ solutions */

    function divisionLine(dividend, divisor) {
        const whole = Math.floor(dividend / divisor);
        const remainder = dividend - whole * divisor;
        return groupDigits(dividend) + " ÷ " + divisor + " = " + groupDigits(whole)
            + (remainder ? " remainder " + remainder : "");
    }

    function checkStep(dividend, divisor) {
        const whole = Math.floor(dividend / divisor);
        const remainder = dividend - whole * divisor;
        return "Check the size of the remainder: " + remainder + " is less than " + divisor
            + ", so no further whole group can be made.";
    }

    /* ------------------------------------------------------------ questions */

    function makeQuestion(stage, family) {
        return {
            stage: stage,
            family: family,
            factKey: "",
            title: "",
            prompt: "",
            given: "",
            givenLabel: "",
            unitPrefix: "",
            unitSuffix: "",
            mode: "single",
            answerKind: "integer",
            answerLabel: "Your answer",
            display: null,
            expected: 0,
            answerShown: "",
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

    function inlineDivision(dividend, divisor) {
        return {
            kind: "inline",
            text: groupDigits(dividend) + " ÷ " + divisor,
            ariaLabel: groupDigits(dividend) + " divided by " + divisor
        };
    }

    /* Stage 1 --------------------------------------------------------- */

    function baseDivision(rng, divisors, minWhole, maxWhole) {
        const divisor = pick(divisors, rng);
        const whole = randomInt(rng, minWhole, maxWhole);
        const remainder = randomInt(rng, 1, divisor - 1);
        return { divisor: divisor, whole: whole, remainder: remainder, dividend: whole * divisor + remainder };
    }

    function fillFormRemainder(question, rng) {
        const draw = baseDivision(rng, [3, 4, 6, 7, 8, 9], 14, 138);
        question.factKey = draw.dividend + "/" + draw.divisor;
        question.title = "Divide and record what is left";
        question.prompt = "Work out this division. Give the whole-number part and the remainder separately.";
        question.display = inlineDivision(draw.dividend, draw.divisor);
        question.mode = "parts";
        question.partsLegend = "The two parts of the answer";
        question.cells = [
            { label: "Whole-number part", expected: String(draw.whole) },
            { label: "Remainder", expected: String(draw.remainder) }
        ];
        question.answerShown = draw.whole + " remainder " + draw.remainder;
        question.correctNote = "Correct — " + draw.divisor + " × " + groupDigits(draw.whole) + " + " + draw.remainder + " = " + groupDigits(draw.dividend) + ".";
        question.partsNote = "The whole-number part counts complete groups of " + draw.divisor + "; the remainder is what is left, and it must be smaller than " + draw.divisor + ".";
        question.summaryLine = groupDigits(draw.dividend) + " ÷ " + draw.divisor + ", as a remainder";
        question.printLine = groupDigits(draw.dividend) + " ÷ " + draw.divisor;
        question.hints = [
            "Ask how many whole " + draw.divisor + "s fit inside " + groupDigits(draw.dividend) + ". Whatever is still uncovered is the remainder.",
            groupDigits(draw.divisor * draw.whole) + " is the largest multiple of " + draw.divisor + " that does not pass " + groupDigits(draw.dividend) + "."
        ];
        question.steps = [
            "Divide: " + divisionLine(draw.dividend, draw.divisor) + ".",
            "The whole-number part counts the complete groups of " + draw.divisor + ": " + draw.divisor + " × " + groupDigits(draw.whole) + " = " + groupDigits(draw.divisor * draw.whole) + ".",
            "The remainder is what is left: " + groupDigits(draw.dividend) + " − " + groupDigits(draw.divisor * draw.whole) + " = " + draw.remainder + ".",
            checkStep(draw.dividend, draw.divisor),
            "Answer: " + draw.whole + " remainder " + draw.remainder + "."
        ];
        return question;
    }

    function fillFormLeftover(question, rng) {
        const draw = baseDivision(rng, [3, 4, 6, 7, 8, 9], 12, 120);
        question.factKey = draw.dividend + "/" + draw.divisor;
        question.title = "State the amount left over";
        question.prompt = "Make as many whole groups of " + draw.divisor + " as possible from " + groupDigits(draw.dividend) + ". How many are left over?";
        question.display = inlineDivision(draw.dividend, draw.divisor);
        question.mode = "single";
        question.answerKind = "integer";
        question.answerLabel = "Amount left over";
        question.expected = draw.remainder;
        question.answerShown = String(draw.remainder);
        question.correctNote = "Correct — that is what will not stretch to another group of " + draw.divisor + ".";
        question.summaryLine = groupDigits(draw.dividend) + " ÷ " + draw.divisor + ", the amount left over";
        question.printLine = groupDigits(draw.dividend) + " ÷ " + draw.divisor;
        question.misses = [
            { value: draw.whole, text: "That is the number of whole groups. The question asks for the amount that is still left after those groups are made." },
            { value: draw.divisor - draw.remainder, text: "That is how much more would be needed to complete another group, not the amount already left over." }
        ];
        question.hints = [
            "Take away as many " + draw.divisor + "s as you can from " + groupDigits(draw.dividend) + " and look at what will not stretch to another group.",
            draw.divisor + " × " + groupDigits(draw.whole) + " = " + groupDigits(draw.divisor * draw.whole) + ", which is the largest multiple of " + draw.divisor + " below " + groupDigits(draw.dividend) + "."
        ];
        question.steps = [
            "Divide: " + divisionLine(draw.dividend, draw.divisor) + ".",
            "The complete groups account for " + draw.divisor + " × " + groupDigits(draw.whole) + " = " + groupDigits(draw.divisor * draw.whole) + ".",
            "Subtract to find the leftover: " + groupDigits(draw.dividend) + " − " + groupDigits(draw.divisor * draw.whole) + " = " + draw.remainder + ".",
            checkStep(draw.dividend, draw.divisor),
            "Answer: " + draw.remainder + " left over."
        ];
        return question;
    }

    function fillFormDecimal(question, rng) {
        const draw = drawValid(function () {
            return baseDivision(rng, [2, 4, 5, 8], 12, 96);
        }, function (candidate) {
            return exactDecimal(candidate.dividend, candidate.divisor) !== null;
        }, { divisor: 8, whole: 21, remainder: 6, dividend: 174 });
        const exact = exactDecimal(draw.dividend, draw.divisor);
        question.factKey = draw.dividend + "/" + draw.divisor;
        question.title = "Give the exact decimal";
        question.prompt = "Share " + groupDigits(draw.dividend) + " equally between " + draw.divisor + ". Write the exact decimal answer, with no rounding.";
        question.display = inlineDivision(draw.dividend, draw.divisor);
        question.mode = "single";
        question.answerKind = "decimal";
        question.answerLabel = "Exact decimal answer";
        question.expected = Number(exact);
        question.answerShown = exact;
        question.correctNote = "Correct — the remainder has been carried past the point and shared exactly.";
        question.summaryLine = groupDigits(draw.dividend) + " ÷ " + draw.divisor + ", as an exact decimal";
        question.printLine = groupDigits(draw.dividend) + " ÷ " + draw.divisor;
        question.misses = [
            { value: draw.whole, text: "That is only the whole-number part. The leftover " + draw.remainder + " still has to be shared, so the answer continues past the decimal point." },
            { value: Math.round(Number(exact)), text: "That is the answer rounded to the nearest whole number. This question asks for the exact value, so keep the decimal part." },
            { value: Number(draw.whole + "." + draw.remainder), text: "The digit after the point is not the remainder itself. The remainder " + draw.remainder + " has to be divided by " + draw.divisor + " before it can be written as a decimal." }
        ];
        question.hints = [
            "Work out the whole-number part first, then carry the remainder past the decimal point and keep dividing.",
            "After " + groupDigits(draw.dividend) + " ÷ " + draw.divisor + " = " + draw.whole + " remainder " + draw.remainder + ", the leftover " + draw.remainder + " is shared between " + draw.divisor + ": " + draw.remainder + " ÷ " + draw.divisor + " = " + exactDecimal(draw.remainder, draw.divisor) + "."
        ];
        question.steps = [
            "Divide as far as the whole numbers: " + divisionLine(draw.dividend, draw.divisor) + ".",
            "The leftover " + draw.remainder + " can be shared because the quantity splits, so continue past the decimal point.",
            draw.remainder + " ÷ " + draw.divisor + " = " + exactDecimal(draw.remainder, draw.divisor) + ", which is the decimal part.",
            "Check by multiplying back: " + draw.divisor + " × " + exact + " = " + groupDigits(draw.dividend) + ".",
            "Answer: " + exact + "."
        ];
        return question;
    }

    function fillFormFraction(question, rng) {
        const draw = drawValid(function () {
            return baseDivision(rng, [3, 6, 7, 9], 11, 84);
        }, function (candidate) {
            return highestCommonFactor(candidate.remainder, candidate.divisor) === 1;
        }, { divisor: 7, whole: 19, remainder: 3, dividend: 136 });
        question.factKey = draw.dividend + "/" + draw.divisor;
        question.title = "Write the share as a mixed number";
        question.prompt = "Share " + groupDigits(draw.dividend) + " equally between " + draw.divisor + ". Write the exact answer as a mixed number.";
        question.display = inlineDivision(draw.dividend, draw.divisor);
        question.mode = "parts";
        question.partsLegend = "The three parts of the mixed number";
        question.cells = [
            { label: "Whole number", expected: String(draw.whole) },
            { label: "Numerator", expected: String(draw.remainder) },
            { label: "Denominator", expected: String(draw.divisor) }
        ];
        question.answerShown = draw.whole + " " + draw.remainder + "/" + draw.divisor;
        question.correctNote = "Correct — the leftover " + draw.remainder + " shared between " + draw.divisor + " gives the fractional part.";
        question.partsNote = "The numerator is the leftover and the denominator is the number of equal shares.";
        question.summaryLine = groupDigits(draw.dividend) + " ÷ " + draw.divisor + ", as a mixed number";
        question.printLine = groupDigits(draw.dividend) + " ÷ " + draw.divisor;
        question.hints = [
            "Divide first. The leftover becomes the numerator, and the number of equal shares becomes the denominator.",
            groupDigits(draw.dividend) + " ÷ " + draw.divisor + " = " + draw.whole + " remainder " + draw.remainder + ", and that leftover " + draw.remainder + " is being shared between the same " + draw.divisor + " groups."
        ];
        question.steps = [
            "Divide: " + divisionLine(draw.dividend, draw.divisor) + ".",
            "The leftover " + draw.remainder + " is shared between the same " + draw.divisor + " groups, so it becomes " + draw.remainder + "/" + draw.divisor + ".",
            "The denominator is " + draw.divisor + ", the number of shares — not " + groupDigits(draw.dividend) + ".",
            highestCommonFactor(draw.remainder, draw.divisor) === 1
                ? draw.remainder + " and " + draw.divisor + " share no factor above 1, so the fraction is already in its simplest form."
                : "Simplify the fraction if it has a common factor.",
            "Answer: " + draw.whole + " " + draw.remainder + "/" + draw.divisor + "."
        ];
        return question;
    }

    /* Stage 2 --------------------------------------------------------- */

    function contextDraw(rng, minGroups, maxGroups) {
        const context = pick(CONTEXTS, rng);
        const group = randomInt(rng, 4, 9);
        const whole = randomInt(rng, minGroups, maxGroups);
        const remainder = randomInt(rng, 1, group - 1);
        return {
            context: context,
            group: group,
            whole: whole,
            remainder: remainder,
            total: whole * group + remainder
        };
    }

    function contextSteps(draw, direction) {
        const c = draw.context;
        const steps = [
            "Divide the total by the size of each group: " + divisionLine(draw.total, draw.group) + ".",
            checkStep(draw.total, draw.group)
        ];
        if (direction === "down") {
            steps.push("The question counts only complete " + c.container + ", so the leftover " + count(draw.remainder, c.itemOne, c.item) + agree(draw.remainder, " does", " do") + " not make another one: " + draw.downReasonText + ".");
            steps.push("Answer: " + count(draw.whole, c.containerOne, c.container) + ".");
        } else if (direction === "up") {
            steps.push("The leftover " + count(draw.remainder, c.itemOne, c.item) + agree(draw.remainder, " still needs", " still need") + " a place, so one more " + c.containerOne + " is required.");
            steps.push(groupDigits(draw.whole) + " + 1 = " + groupDigits(draw.whole + 1) + ".");
            steps.push("Answer: " + count(draw.whole + 1, c.containerOne, c.container) + ".");
        } else {
            steps.push("The remainder answers the question directly: " + count(draw.remainder, c.itemOne, c.item) + agree(draw.remainder, " is", " are") + " left after the complete " + c.container + " are filled.");
            steps.push("Answer: " + count(draw.remainder, c.itemOne, c.item) + ".");
        }
        return steps;
    }

    function fillDirectionDown(question, rng) {
        const draw = contextDraw(rng, 7, 40);
        const c = draw.context;
        draw.downReasonText = c.downReason;
        question.factKey = c.key + "/" + draw.total + "/" + draw.group;
        question.title = "Reading what the question counts";
        question.prompt = c.setting(draw.total, draw.group) + " " + c.down;
        question.mode = "single";
        question.answerKind = "integer";
        question.answerLabel = "Number of " + c.container;
        question.expected = draw.whole;
        question.answerShown = count(draw.whole, c.containerOne, c.container);
        question.correctNote = "Correct — the part-filled " + c.containerOne + " is not counted here.";
        question.summaryLine = groupDigits(draw.total) + " " + c.item + ", " + draw.group + " per " + c.containerOne;
        question.printLine = c.setting(draw.total, draw.group) + " " + c.down;
        question.misses = [
            { value: draw.whole + 1, text: "The last " + c.containerOne + " would hold only " + count(draw.remainder, c.itemOne, c.item) + ", so it is not complete. Count only the " + c.container + " that are full." },
            { value: draw.remainder, text: "That is the number of " + c.item + " left over, not the number of complete " + c.container + "." },
            { value: draw.group, text: "That is how many " + c.item + " fit in one " + c.containerOne + ". The question asks how many " + c.container + " can be filled." }
        ];
        question.hints = [
            "Divide the total by the number that fits in each " + c.containerOne + ", then read the wording again: does a part-filled " + c.containerOne + " count?",
            divisionLine(draw.total, draw.group) + ". The remainder cannot fill another " + c.containerOne + "."
        ];
        question.steps = contextSteps(draw, "down");
        return question;
    }

    function fillDirectionUp(question, rng) {
        const draw = contextDraw(rng, 6, 38);
        const c = draw.context;
        draw.downReasonText = c.downReason;
        question.factKey = c.key + "/" + draw.total + "/" + draw.group;
        question.title = "Reading what the question counts";
        question.prompt = c.setting(draw.total, draw.group) + " " + c.up;
        question.mode = "single";
        question.answerKind = "integer";
        question.answerLabel = "Number of " + c.container;
        question.expected = draw.whole + 1;
        question.answerShown = count(draw.whole + 1, c.containerOne, c.container);
        question.correctNote = "Correct — the leftover " + c.item + " have been given a place of their own.";
        question.summaryLine = groupDigits(draw.total) + " " + c.item + ", " + draw.group + " per " + c.containerOne;
        question.printLine = c.setting(draw.total, draw.group) + " " + c.up;
        question.misses = [
            { value: draw.whole, text: "That leaves " + count(draw.remainder, c.itemOne, c.item) + " with nowhere to go. Because " + c.upReason + ", one more " + c.containerOne + " is needed." },
            { value: draw.remainder, text: "That is the number of " + c.item + " in the last, part-filled " + c.containerOne + ", not the number of " + c.container + "." }
        ];
        question.hints = [
            "Divide first, then decide what happens to the " + c.item + " that do not fill a whole " + c.containerOne + ".",
            divisionLine(draw.total, draw.group) + ". Those " + draw.remainder + " left over still need somewhere to go."
        ];
        question.steps = contextSteps(draw, "up");
        return question;
    }

    function fillDirectionChoice(question, rng) {
        const draw = contextDraw(rng, 6, 34);
        const c = draw.context;
        draw.downReasonText = c.downReason;
        const wantsUp = rng() < 0.5;
        const wording = wantsUp ? c.up : c.down;
        const options = [
            "Round up to " + groupDigits(draw.whole + 1) + ", because " + c.upReason + ".",
            "Round down to " + groupDigits(draw.whole) + ", because " + c.downReason + ".",
            "Round to the nearest whole number, as with an ordinary decimal.",
            "Leave the answer as " + groupDigits(draw.whole) + " remainder " + draw.remainder + "."
        ];
        const notes = [
            "This question counts only the " + c.container + " that are completely filled, so the leftover " + count(draw.remainder, c.itemOne, c.item) + agree(draw.remainder, " does", " do") + " not add another one.",
            "This question has to account for every one of the " + groupDigits(draw.total) + " " + c.item + ", so the leftover " + draw.remainder + agree(draw.remainder, " needs", " need") + " one more " + c.containerOne + ".",
            "Ordinary rounding looks at the decimal digits. Here the wording decides the direction, whatever those digits are.",
            "A remainder is correct arithmetic, but the question asks for a number of " + c.container + ", so the leftover still has to be resolved."
        ];
        const order = shuffleIndexes(4, rng);
        question.factKey = c.key + "/" + draw.total + "/" + draw.group + "/" + (wantsUp ? "up" : "down");
        question.title = "Which reading does the wording force?";
        question.prompt = c.setting(draw.total, draw.group) + " " + wording + " Choose how the remainder should be treated to answer that question.";
        question.givenLabel = "The division";
        question.given = divisionLine(draw.total, draw.group);
        question.mode = "choice";
        question.choiceLegend = "How the remainder should be treated";
        question.options = order.map(function (index) { return options[index]; });
        question.optionNotes = order.map(function (index) { return notes[index]; });
        question.correctIndex = order.indexOf(wantsUp ? 0 : 1);
        question.answerShown = options[wantsUp ? 0 : 1];
        question.answerLabel = "Your choice";
        question.summaryLine = groupDigits(draw.total) + " " + c.item + ", " + draw.group + " per " + c.containerOne;
        question.printLine = c.setting(draw.total, draw.group) + " " + wording;
        question.hints = [
            "Read the noun and the verb in the question: is it counting " + c.container + " that are already full, or finding room for every one of the " + c.item + "?",
            wantsUp
                ? "Nothing may be left behind here, so the part-filled " + c.containerOne + " still counts."
                : "A " + c.containerOne + " that is not full does not count here, so the leftover changes nothing."
        ];
        question.steps = [
            "Divide: " + divisionLine(draw.total, draw.group) + ".",
            "Read what is being counted: " + wording.toLowerCase().replace(/\?$/, "") + ".",
            wantsUp
                ? "Because " + c.upReason + ", the " + draw.remainder + " left over " + agree(draw.remainder, "needs", "need") + " one more " + c.containerOne + "."
                : "Because " + c.downReason + ", the " + draw.remainder + " left over " + agree(draw.remainder, "does", "do") + " not add a " + c.containerOne + ".",
            "So the answer is " + count(wantsUp ? draw.whole + 1 : draw.whole, c.containerOne, c.container) + "."
        ];
        return question;
    }

    /* A deliberate clash: ordinary rounding of the decimal points one way and
       the context points the other. The catch is named only in the feedback. */
    function fillDirectionClash(question, rng) {
        const upward = rng() < 0.5;
        const draw = drawValid(function () {
            const candidate = contextDraw(rng, 8, 36);
            return candidate;
        }, function (candidate) {
            const half = candidate.group / 2;
            return upward ? candidate.remainder < half : candidate.remainder > half;
        }, (function () {
            const context = CONTEXTS[0];
            return upward
                ? { context: context, group: 8, whole: 17, remainder: 2, total: 138 }
                : { context: context, group: 8, whole: 17, remainder: 6, total: 142 };
        })());
        const c = draw.context;
        draw.downReasonText = c.downReason;
        const nearest = Math.round(draw.total / draw.group);
        const exact = (draw.total / draw.group).toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
        question.factKey = c.key + "/" + draw.total + "/" + draw.group + "/" + (upward ? "up" : "down");
        question.title = "Reading what the question counts";
        question.prompt = c.setting(draw.total, draw.group) + " " + (upward ? c.up : c.down);
        question.mode = "single";
        question.answerKind = "integer";
        question.answerLabel = "Number of " + c.container;
        question.expected = upward ? draw.whole + 1 : draw.whole;
        question.answerShown = count(question.expected, c.containerOne, c.container);
        question.correctNote = "Correct — the wording set the direction, not the size of the decimal part.";
        question.summaryLine = groupDigits(draw.total) + " " + c.item + ", " + draw.group + " per " + c.containerOne;
        question.printLine = c.setting(draw.total, draw.group) + " " + (upward ? c.up : c.down);
        question.misses = [
            {
                value: nearest,
                text: groupDigits(draw.total) + " ÷ " + draw.group + " is about " + exact + ", which rounds to " + nearest
                    + " in the ordinary way. The wording overrides that: "
                    + (upward ? c.upReason + ", so the answer goes up." : c.downReason + ", so the answer goes down.")
            },
            { value: upward ? draw.whole : draw.whole + 1, text: upward
                ? "That leaves " + count(draw.remainder, c.itemOne, c.item) + " unaccounted for. Because " + c.upReason + ", one more " + c.containerOne + " is needed."
                : "The last " + c.containerOne + " holds only " + count(draw.remainder, c.itemOne, c.item) + ", so it is not complete." },
            { value: draw.remainder, text: "That is the leftover number of " + c.item + ", not a number of " + c.container + "." }
        ];
        question.hints = [
            "Divide, then decide from the wording alone. The size of the decimal part does not settle this one.",
            divisionLine(draw.total, draw.group) + ". " + (upward
                ? "Those " + count(draw.remainder, c.itemOne, c.item) + agree(draw.remainder, " still needs", " still need") + " a place."
                : "Those " + count(draw.remainder, c.itemOne, c.item) + agree(draw.remainder, " does", " do") + " not complete another " + c.containerOne + ".")
        ];
        question.steps = [
            "Divide: " + divisionLine(draw.total, draw.group) + ", or " + exact + " as a decimal.",
            "Ordinary rounding would give " + nearest + ", but that is not what the question asks.",
            upward
                ? "Because " + c.upReason + ", the leftover " + draw.remainder + agree(draw.remainder, " forces", " force") + " one more " + c.containerOne + "."
                : "Because " + c.downReason + ", the leftover " + draw.remainder + agree(draw.remainder, " adds", " add") + " nothing.",
            "Answer: " + count(question.expected, c.containerOne, c.container) + "."
        ];
        return question;
    }

    /* Stage 3 --------------------------------------------------------- */

    function fillContextLeftover(question, rng) {
        const draw = contextDraw(rng, 9, 44);
        const c = draw.context;
        draw.downReasonText = c.downReason;
        question.factKey = c.key + "/" + draw.total + "/" + draw.group + "/left";
        question.title = "Answering the question asked";
        question.prompt = c.setting(draw.total, draw.group) + " " + c.left;
        question.mode = "single";
        question.answerKind = "integer";
        question.answerLabel = "Number of " + c.item;
        question.expected = draw.remainder;
        question.answerShown = count(draw.remainder, c.itemOne, c.item);
        question.correctNote = "Correct — the remainder itself answers this question.";
        question.summaryLine = groupDigits(draw.total) + " " + c.item + ", " + draw.group + " per " + c.containerOne;
        question.printLine = c.setting(draw.total, draw.group) + " " + c.left;
        question.misses = [
            { value: draw.whole, text: "That is the number of complete " + c.container + ". The question asks how many " + c.item + " are left once those are filled." },
            { value: draw.whole + 1, text: "That counts " + c.container + ", not " + c.item + ". The leftover is what remains after the complete " + c.container + " are filled." },
            { value: draw.group - draw.remainder, text: "That is how many more " + c.item + " would fill the last " + c.containerOne + ", not how many are already in it." }
        ];
        question.hints = [
            "The answer to this one is the remainder itself, so divide and then read what is left rather than the quotient.",
            divisionLine(draw.total, draw.group) + "."
        ];
        question.steps = contextSteps(draw, "left");
        return question;
    }

    function fillContextTickets(question, rng) {
        const price = pick([3, 4, 6, 7, 8, 9], rng);
        const tickets = randomInt(rng, 6, 24);
        const leftPounds = randomInt(rng, 1, price - 1);
        const budget = price * tickets + leftPounds;
        const name = pick(["Ada", "Ben", "Priya", "Malik", "Rosa", "Theo"], rng);
        question.factKey = "ticket/" + budget + "/" + price;
        question.title = "Buying as many as the money allows";
        question.prompt = name + " has £" + groupDigits(budget) + " to spend on tickets costing £" + price + " each. How many tickets can be bought, and how many pounds are left?";
        question.mode = "parts";
        question.partsLegend = "The two parts of the answer";
        question.cells = [
            { label: "Tickets bought", expected: String(tickets) },
            { label: "Pounds left over", expected: String(leftPounds) }
        ];
        question.answerShown = tickets + " tickets, £" + leftPounds + " left";
        question.correctNote = "Correct — the quotient counts tickets and the remainder is money.";
        question.partsNote = "The quotient counts tickets; the remainder is the money that is not enough for another one.";
        question.summaryLine = "£" + groupDigits(budget) + " spent on £" + price + " tickets";
        question.printLine = name + " has £" + groupDigits(budget) + "; tickets cost £" + price + " each.";
        question.hints = [
            "Divide the money by the price of one ticket. The whole-number part counts the tickets; the remainder is money that is not enough for another.",
            divisionLine(budget, price) + "."
        ];
        question.steps = [
            "Divide the budget by the ticket price: " + divisionLine(budget, price) + ".",
            "Only whole tickets can be bought, so the number of tickets is " + tickets + ".",
            "The remainder is money, not tickets: £" + groupDigits(budget) + " − " + tickets + " × £" + price + " = £" + leftPounds + ".",
            "£" + leftPounds + " is less than the £" + price + " price, so no further ticket can be bought.",
            "Answer: " + tickets + " tickets with £" + leftPounds + " left."
        ];
        return question;
    }

    function fillContextQuestion(question, rng) {
        const draw = contextDraw(rng, 8, 42);
        const c = draw.context;
        draw.downReasonText = c.downReason;
        const ask = pick(["down", "up", "left"], rng);
        const wording = ask === "down" ? c.down : ask === "up" ? c.up : c.left;
        const expected = ask === "down" ? draw.whole : ask === "up" ? draw.whole + 1 : draw.remainder;
        question.factKey = c.key + "/" + draw.total + "/" + draw.group + "/" + ask;
        question.title = "One division, one question";
        question.prompt = c.setting(draw.total, draw.group) + " " + wording;
        question.givenLabel = "Already worked out";
        question.given = divisionLine(draw.total, draw.group);
        question.mode = "single";
        question.answerKind = "integer";
        question.answerLabel = ask === "left" ? "Number of " + c.item : "Number of " + c.container;
        question.expected = expected;
        question.answerShown = count(expected, ask === "left" ? c.itemOne : c.containerOne, ask === "left" ? c.item : c.container);
        question.correctNote = "Correct — you read the part of the division that the wording asked for.";
        question.summaryLine = divisionLine(draw.total, draw.group) + ", read in context";
        question.printLine = c.setting(draw.total, draw.group) + " " + wording;
        question.misses = [
            { value: draw.whole, text: ask === "up"
                ? "That leaves " + count(draw.remainder, c.itemOne, c.item) + " without a place. Because " + c.upReason + ", one more " + c.containerOne + " is needed."
                : "That is the number of complete " + c.container + ". This question asks for the " + draw.remainder + agree(draw.remainder, " that is", " that are") + " left over." },
            { value: draw.whole + 1, text: ask === "down"
                ? "The last " + c.containerOne + " holds only " + count(draw.remainder, c.itemOne, c.item) + ", so it is not complete."
                : "That counts " + c.container + " including the part-filled one, which is not what this question asks for." },
            { value: draw.remainder, text: ask === "left"
                ? ""
                : "That is the leftover " + c.item + ", not a number of " + c.container + "." }
        ].filter(function (miss) { return miss.text && miss.value !== expected; });
        question.hints = [
            "The arithmetic is given. Decide which part of " + divisionLine(draw.total, draw.group) + " the wording is asking for.",
            ask === "left"
                ? "The remainder counts " + c.item + ", not " + c.container + "."
                : ask === "up"
                    ? "The leftover " + count(draw.remainder, c.itemOne, c.item) + agree(draw.remainder, " still needs", " still need") + " a place."
                    : "The leftover " + count(draw.remainder, c.itemOne, c.item) + agree(draw.remainder, " does", " do") + " not complete another " + c.containerOne + "."
        ];
        question.steps = contextSteps(draw, ask);
        return question;
    }

    function fillContextChoice(question, rng) {
        const draw = contextDraw(rng, 7, 30);
        const c = draw.context;
        draw.downReasonText = c.downReason;
        const ask = pick(["down", "up", "left"], rng);
        const wording = ask === "down" ? c.down : ask === "up" ? c.up : c.left;
        const decimal = (draw.total / draw.group).toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
        const options = [
            count(draw.whole, c.containerOne, c.container),
            count(draw.whole + 1, c.containerOne, c.container),
            count(draw.remainder, c.itemOne, c.item),
            decimal + " " + c.container
        ];
        const notes = [
            "This counts the " + c.container + " that are completely filled.",
            "This counts every " + c.containerOne + " used, including the part-filled one.",
            "This is the leftover, counted in " + c.item + ".",
            "A " + c.containerOne + " cannot be split, so a decimal number of them does not answer the question."
        ];
        const correct = ask === "down" ? 0 : ask === "up" ? 1 : 2;
        const order = shuffleIndexes(4, rng);
        question.factKey = c.key + "/" + draw.total + "/" + draw.group + "/choice-" + ask;
        question.title = "Choosing the answer that fits";
        question.prompt = c.setting(draw.total, draw.group) + " " + wording;
        question.givenLabel = "Already worked out";
        question.given = divisionLine(draw.total, draw.group);
        question.mode = "choice";
        question.choiceLegend = "The answer that fits the question";
        question.options = order.map(function (index) { return options[index]; });
        question.optionNotes = order.map(function (index) { return notes[index]; });
        question.correctIndex = order.indexOf(correct);
        question.answerShown = options[correct];
        question.answerLabel = "Your choice";
        question.compactValues = true;
        question.summaryLine = groupDigits(draw.total) + " " + c.item + ", " + draw.group + " per " + c.containerOne;
        question.printLine = c.setting(draw.total, draw.group) + " " + wording;
        question.hints = [
            "All four options come from the same division. Match the unit and the wording rather than the arithmetic.",
            ask === "left"
                ? "The question asks about " + c.item + ", so the answer is counted in " + c.item + "."
                : ask === "up"
                    ? "Every one of the " + groupDigits(draw.total) + " " + c.item + " must be accounted for."
                    : "Only " + c.container + " that are completely filled are being counted."
        ];
        question.steps = contextSteps(draw, ask);
        return question;
    }

    const FILLERS = {
        "form-remainder": fillFormRemainder,
        "form-leftover": fillFormLeftover,
        "form-decimal": fillFormDecimal,
        "form-fraction": fillFormFraction,
        "direction-down": fillDirectionDown,
        "direction-up": fillDirectionUp,
        "direction-choice": fillDirectionChoice,
        "direction-clash": fillDirectionClash,
        "context-leftover": fillContextLeftover,
        "context-tickets": fillContextTickets,
        "context-question": fillContextQuestion,
        "context-choice": fillContextChoice
    };

    /* Values drawn at random can collide, so a near-miss note that happens to
       land on the correct answer is dropped rather than shown. */
    function tidyMisses(question) {
        const seen = [];
        question.misses = question.misses.filter(function (miss) {
            if (!miss.text) return false;
            if (nearlyEqual(miss.value, question.expected)) return false;
            if (seen.some(function (value) { return nearlyEqual(value, miss.value); })) return false;
            seen.push(miss.value);
            return true;
        });
        return question;
    }

    function generateQuestion(stage, family, rng, excludedKey) {
        let built = FILLERS[family](makeQuestion(stage, family), rng);
        for (let attempt = 0; attempt < 8 && excludedKey && built.factKey === excludedKey; attempt += 1) {
            built = FILLERS[family](makeQuestion(stage, family), rng);
        }
        built.contextKey = String(built.factKey).split("/")[0];
        return tidyMisses(built);
    }

    /* Four questions in a row about the same eggs and boxes would read as one
       question asked four times, so a stage spreads its contexts where it can. */
    function buildRound(rng) {
        const round = [];
        FAMILIES.forEach(function (families, stage) {
            const order = shuffleIndexes(families.length, rng);
            const used = [];
            order.forEach(function (index) {
                let built = generateQuestion(stage, families[index], rng);
                for (let attempt = 0; attempt < 8 && used.indexOf(built.contextKey) !== -1; attempt += 1) {
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

    /* ------------------------------------------------------------- marking */

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

    function nearlyEqual(a, b) {
        return Math.abs(a - b) < 1e-9;
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
            return { state: "wrong", text: "This answer counts whole things, so it cannot have a decimal part. Decide what happens to the leftover instead of splitting it." };
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
        return { state: "wrong", text: "Not yet. Work out the division first, then decide what the wording asks you to do with the remainder." };
    }

    function evaluateChoice(question, raw) {
        const cleaned = normalise(raw);
        if (cleaned === "") return { state: "blank", text: "Select one of the options, then check it." };
        const index = Number(cleaned);
        if (index === question.correctIndex) {
            return { state: "correct", text: question.optionNotes[index] };
        }
        return { state: "wrong", text: question.optionNotes[index] || "That option does not answer this question." };
    }

    function evaluateParts(question, raw) {
        const values = Array.isArray(raw) ? raw : [];
        const entered = question.cells.map(function (cell, index) { return normalise(values[index]); });
        if (entered.every(function (text) { return text === ""; })) {
            return { state: "blank", text: "Fill in both parts, then check them.", correctPositions: [] };
        }
        if (entered.some(function (text) { return text === ""; })) {
            const positions = question.cells.map(function (cell, index) {
                return entered[index] === "" ? undefined : entered[index] === cell.expected;
            });
            return {
                state: "incomplete",
                text: "One part is still empty. Complete every box before checking.",
                correctPositions: positions
            };
        }
        if (entered.some(function (text) { return !/^\d+$/.test(text); })) {
            return { state: "unreadable", text: "Each box takes a whole number written in digits.", correctPositions: [] };
        }
        const positions = question.cells.map(function (cell, index) { return entered[index] === cell.expected; });
        const wrong = positions.reduce(function (total, ok) { return ok ? total : total + 1; }, 0);
        if (!wrong) {
            return { state: "correct", text: question.correctNote || "Correct.", correctPositions: positions };
        }
        const wrongLabels = question.cells.filter(function (cell, index) { return !positions[index]; })
            .map(function (cell) { return cell.label.toLowerCase(); });
        const rightCount = positions.length - wrong;
        const lead = rightCount
            ? "The " + question.cells.filter(function (cell, index) { return positions[index]; })
                .map(function (cell) { return cell.label.toLowerCase(); }).join(" and ") + " is right. "
            : "";
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

    /* ---------------------------------------------------------- validation */

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
                if (!miss.text) problems.push("miss " + index + " has no text");
            });
        }
        if (question.mode === "choice") {
            if (question.options.length !== 4) problems.push("expected four options");
            if (question.optionNotes.length !== question.options.length) problems.push("option notes do not match options");
            if (new Set(question.options).size !== question.options.length) problems.push("duplicate options");
            if (question.correctIndex < 0) problems.push("no correct option");
        }
        if (question.mode === "parts") {
            if (!question.cells.length) problems.push("no answer cells");
            question.cells.forEach(function (cell, index) {
                if (!cell.label) problems.push("cell " + index + " has no label");
                if (!/^\d+$/.test(cell.expected)) problems.push("cell " + index + " expects a non-digit value");
            });
        }
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
                    if (evaluateResponse(question, question.answerShown.replace(/[^0-9.]/g, "")).state !== "correct") {
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
        STAGES: STAGES,
        LESSON_URL: LESSON_URL,
        FAMILIES: FAMILIES,
        buildRound: buildRound,
        createSeededRandom: createSeededRandom,
        evaluateResponse: evaluateResponse,
        exactDecimal: exactDecimal,
        generateQuestion: generateQuestion,
        parseAmount: parseAmount,
        selfCheck: selfCheck,
        validateQuestion: validateQuestion
    };

    scope.InterpretingRemaindersPractice = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
    if (typeof document === "undefined") return;

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
                const id = "remainder-choice-" + current + "-" + index;
                const label = element("label", "practice-choice__option");
                if (currentQuestion.compactValues) label.classList.add("is-value-choice");
                const radio = element("input");
                radio.type = "radio";
                radio.name = "remainder-choice-" + current;
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
                const id = "remainder-part-" + current + "-" + index;
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

        function renderExpression(currentQuestion) {
            const display = currentQuestion.display;
            expression.replaceChildren();
            expression.className = "practice-question__expression";
            expression.hidden = !display;
            if (!display) {
                expression.removeAttribute("role");
                expression.removeAttribute("aria-label");
                return;
            }
            expression.classList.add("practice-division-line");
            expression.setAttribute("role", "img");
            expression.setAttribute("aria-label", display.ariaLabel);
            expression.textContent = display.text;
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
            STAGES.forEach(function (stage, stageIndex) {
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
                row.appendChild(element("p", "practice-reflection-question__stage", STAGES[entry.item.stage].name));
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
            reflectionStages.replaceChildren.apply(reflectionStages, STAGES.map(function (stage, stageIndex) {
                const stageStates = states.slice(stageIndex * 4, stageIndex * 4 + 4);
                const revisit = stageStates.filter(function (item) { return !item.outcome; }).length;
                const row = element("li");
                row.appendChild(element("b", "", stage.name));
                const link = element("a", "", revisit
                    ? revisit + " to revisit · open this section of the lesson"
                    : "Open this section of the lesson");
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
})(typeof window !== "undefined" ? window : globalThis);
