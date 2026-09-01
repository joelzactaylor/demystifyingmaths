/* Practice: square roots.
   The bank of twelve questions; js/practice-engine.js runs the round, marks it
   and drives the page. The generator half runs without a document so it can be
   fuzzed from Node. */
(function (scope) {
    "use strict";

    const LESSON_URL = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/powersAndRoots/squareRoots.html";

    const STAGES = [
        { name: "Reading a square backwards", lessonAnchor: "reading-the-squares-backwards" },
        { name: "Roots of decimals", lessonAnchor: "roots-of-decimals" },
        { name: "Between the squares, and checking", lessonAnchor: "numbers-between-the-squares" }
    ];

    const FAMILIES = [
        ["root-of-square", "square-then-root", "side-of-square", "root-then-check"],
        ["root-two-places", "root-four-places", "root-above-its-number", "count-the-places"],
        ["between-two-squares", "not-half", "which-has-whole-root", "root-of-a-sum"]
    ];

    /* Everything under a sign on this page is a perfect square, because the
       lesson takes roots by reading a known square backwards. */
    const ROOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

    function isSquare(value) {
        const root = Math.round(Math.sqrt(value));
        return root * root === value;
    }

    function chooseFour(candidates, rng, tools) {
        const kept = [];
        candidates.forEach(function (candidate) {
            if (kept.length === 4) return;
            if (kept.some(function (held) { return held.text === candidate.text; })) return;
            kept.push(candidate);
        });
        const order = tools.shuffleIndexes(kept.length, rng);
        return {
            options: order.map(function (at) { return kept[at].text; }),
            optionNotes: order.map(function (at) { return kept[at].note; }),
            correctIndex: order.indexOf(0)
        };
    }

    function base(question, title, prompt) {
        question.title = title;
        question.prompt = prompt;
        return question;
    }

    function rootDisplay(radicand, spoken) {
        return { kind: "root", radicand: String(radicand), ariaLabel: "the square root of " + (spoken || radicand) };
    }

    /* --------------------------------------- reading a square backwards */

    function fillRootOfSquare(question, rng, tools) {
        const n = tools.randomInt(rng, 4, 15);
        const value = n * n;
        question.factKey = "ros-" + n;
        question.contextKey = "plain";
        question.display = rootDisplay(value);
        question.answerKind = "integer";
        question.answerLabel = "The root";
        question.expected = n;
        question.answerShown = String(n);
        question.correctNote = "Correct. " + n + " × " + n + " = " + value + ".";
        question.misses = [
            { value: value / 2, text: "That halves " + value + ", and halving is not rooting: " + (value / 2) + " × " + (value / 2) + " = " + ((value / 2) * (value / 2)) + "." },
            { value: n - 1, text: (n - 1) + " × " + (n - 1) + " = " + ((n - 1) * (n - 1)) + ", which is not " + value + "." },
            { value: n + 1, text: (n + 1) + " × " + (n + 1) + " = " + ((n + 1) * (n + 1)) + ", which is not " + value + "." }
        ];
        question.hints = [
            "A square root asks which number multiplied by itself gives the number under the sign.",
            "Read the squares of 1 to 15 backwards until you find " + value + "."
        ];
        question.steps = [
            value + " stands under the sign.",
            "The squares of 1 to 15 give " + n + " × " + n + " = " + value + ".",
            "So the square root of " + value + " is " + n + ", and squaring " + n + " returns " + value + "."
        ];
        question.summaryLine = "The square root of " + value;
        question.printLine = "Work out the square root of " + value + ".";
        return base(question, "Read the square backwards", "Work out this square root.");
    }

    function fillSquareThenRoot(question, rng, tools) {
        const n = tools.randomInt(rng, 4, 15);
        const value = n * n;
        question.factKey = "str-" + n;
        question.contextKey = "plain";
        question.given = n + " × " + n + " = " + value;
        question.givenLabel = "Given";
        question.display = rootDisplay(value);
        question.answerKind = "integer";
        question.answerLabel = "The root";
        question.expected = n;
        question.answerShown = String(n);
        question.correctNote = "Correct. Rooting undoes the squaring in the line above.";
        question.misses = [
            { value: value, text: "That is the number under the sign. The root is the number that was squared to make it." },
            { value: value / 2, text: "Halving is not rooting. The given line already names the number that was squared." }
        ];
        question.hints = [
            "The line above has already done the squaring.",
            "A square root undoes it, so the answer is the number that was multiplied by itself."
        ];
        question.steps = [
            "The given fact is " + n + " × " + n + " = " + value + ".",
            "A square root reverses squaring.",
            "So the square root of " + value + " is " + n + "."
        ];
        question.summaryLine = "Using " + n + " × " + n + " = " + value + " to find a root";
        question.printLine = "Given " + n + " × " + n + " = " + value + ", work out the square root of " + value + ".";
        return base(question, "Undo the squaring", "Use the fact above to work out this square root.");
    }

    function fillSideOfSquare(question, rng, tools) {
        const n = tools.randomInt(rng, 4, 15);
        const area = n * n;
        question.factKey = "sos-" + n;
        question.contextKey = "square";
        question.given = "Area " + area + " cm²";
        question.givenLabel = "A square tile";
        question.unitSuffix = "cm";
        question.answerKind = "integer";
        question.answerLabel = "The side length";
        question.expected = n;
        question.answerShown = n + " cm";
        question.correctNote = "Correct. A square of side " + n + " cm has an area of " + area + " cm².";
        question.misses = [
            { value: area / 4, text: "That divides the area by 4. The side is the number that multiplies by itself to give " + area + "." },
            { value: area / 2, text: "That halves the area. A square of side " + (area / 2) + " cm would have an area of " + ((area / 2) * (area / 2)) + " cm²." }
        ];
        question.hints = [
            "A square's area is its side multiplied by itself.",
            "So the side is the square root of " + area + "."
        ];
        question.steps = [
            "A square tile has area = side × side.",
            "The side is therefore the square root of " + area + ".",
            n + " × " + n + " = " + area + ", so the side is " + n + " cm."
        ];
        question.summaryLine = "The side of a square of area " + area + " cm²";
        question.printLine = "A square tile has area " + area + " cm². How long is each side?";
        return base(question, "The side of a square", "A square tile has the area shown. Work out the length of one side.");
    }

    function fillRootThenCheck(question, rng, tools) {
        const n = tools.randomInt(rng, 6, 15);
        const value = n * n;
        question.factKey = "rtc-" + n;
        question.contextKey = "plain";
        question.given = "The square root of a number is " + n;
        question.givenLabel = "Given";
        question.answerKind = "integer";
        question.answerLabel = "The number under the sign";
        question.expected = value;
        question.answerShown = String(value);
        question.correctNote = "Correct. Squaring the root returns the number under the sign.";
        question.misses = [
            { value: n * 2, text: "That doubles " + n + ". Squaring multiplies it by itself." },
            { value: n, text: "That repeats the root. The number under the sign is what " + n + " squares to." }
        ];
        question.hints = [
            "Squaring is what undoes a square root.",
            "Work out " + n + " × " + n + "."
        ];
        question.steps = [
            "The root is " + n + ".",
            "Squaring the root returns the number that stood under the sign.",
            n + " × " + n + " = " + value + "."
        ];
        question.summaryLine = "Squaring a root of " + n + " back to " + value;
        question.printLine = "The square root of a number is " + n + ". What is the number?";
        return base(question, "Work back to the number", "This is the value of a square root. Work out the number that was under the sign.");
    }

    /* ------------------------------------------------- roots of decimals */

    function fillRootTwoPlaces(question, rng, tools) {
        const n = tools.randomInt(rng, 2, 9);
        const rootText = "0." + n;
        const value = (n * n) / 100;
        const valueText = value.toFixed(2);
        question.factKey = "r2-" + n;
        question.contextKey = "plain";
        question.display = rootDisplay(valueText);
        question.answerKind = "decimal";
        question.answerLabel = "The root";
        question.expected = n / 10;
        question.answerShown = rootText;
        question.correctNote = "Correct. " + rootText + " × " + rootText + " = " + valueText + ".";
        question.misses = [
            { value: n * n / 10, text: "The figures are right; the point is one place out. " + valueText + " has two decimal places, so its root has one." },
            { value: n / 100, text: "That is one place too far. Half of two decimal places is one." },
            { value: n, text: "Those are the figures of the root without its point." }
        ];
        question.hints = [
            "Take the figures first: " + (n * n) + " is the square of " + n + ".",
            "Squaring doubles the count of decimal places, so a root halves it. " + valueText + " has two places."
        ];
        question.steps = [
            "The figures under the sign are " + (n * n) + ", and " + n + " × " + n + " = " + (n * n) + ".",
            valueText + " has two decimal places, so its root has one.",
            "The root is " + rootText + ", and " + rootText + " × " + rootText + " = " + valueText + "."
        ];
        question.summaryLine = "The square root of " + valueText;
        question.printLine = "Work out the square root of " + valueText + ".";
        return base(question, "A root with one decimal place", "Work out this square root.");
    }

    function fillRootFourPlaces(question, rng, tools) {
        const n = tools.randomInt(rng, 2, 9);
        const rootText = "0.0" + n;
        const value = (n * n) / 10000;
        const valueText = value.toFixed(4);
        question.factKey = "r4-" + n;
        question.contextKey = "plain";
        question.display = rootDisplay(valueText);
        question.answerKind = "decimal";
        question.answerLabel = "The root";
        question.expected = n / 100;
        question.answerShown = rootText;
        question.correctNote = "Correct. " + rootText + " × " + rootText + " = " + valueText + ".";
        question.misses = [
            { value: n / 10, text: "One place too few. " + valueText + " has four decimal places, so its root has two." },
            { value: n / 1000, text: "One place too many. Half of four decimal places is two." }
        ];
        question.hints = [
            "The figures are " + (n * n) + ", which is " + n + " squared.",
            "Count the decimal places under the sign, then halve the count."
        ];
        question.steps = [
            "The figures under the sign are " + (n * n) + ", the square of " + n + ".",
            valueText + " has four decimal places, so its root has two.",
            "The root is " + rootText + ", and squaring it returns " + valueText + "."
        ];
        question.summaryLine = "The square root of " + valueText;
        question.printLine = "Work out the square root of " + valueText + ".";
        return base(question, "A root with two decimal places", "Work out this square root.");
    }

    function fillRootAboveItsNumber(question, rng, tools) {
        const n = tools.pick([2, 3, 4, 5, 6, 7, 8, 9], rng);
        const rootText = "0." + n;
        const valueText = ((n * n) / 100).toFixed(2);
        question.factKey = "above-" + n;
        question.contextKey = "plain";
        question.display = rootDisplay(valueText);
        question.mode = "choice";
        question.choiceLegend = "Which is true of this root?";
        const picked = chooseFour([
            { text: "It is " + rootText + ", larger than " + valueText, note: "Correct. Between 0 and 1 a root is larger than the number it came from." },
            { text: "It is " + rootText + ", smaller than " + valueText, note: "The value is right, but " + rootText + " is larger than " + valueText + "." },
            { text: "It is " + ((n * n) / 10).toFixed(1) + ", larger than " + valueText, note: "That has one decimal place too few for a number with two." },
            { text: "It has no value, because " + valueText + " is below 1", note: "Numbers between 0 and 1 have square roots; the root is simply larger than the number." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = rootText + ", larger than " + valueText;
        question.hints = [
            "Work the root out first from the figures and the count of places.",
            "Squaring a number between 0 and 1 makes it smaller, so reading that backwards makes the root larger."
        ];
        question.steps = [
            "The figures are " + (n * n) + ", so the figures of the root are " + n + ".",
            valueText + " has two decimal places, so the root has one: " + rootText + ".",
            rootText + " is larger than " + valueText + ", which is what happens between 0 and 1."
        ];
        question.summaryLine = "A root larger than its number: " + valueText;
        question.printLine = "Work out the square root of " + valueText + " and compare it with " + valueText + ".";
        return base(question, "A root larger than its number", "Work out this square root, then compare it with the number under the sign.");
    }

    function fillCountThePlaces(question, rng, tools) {
        const places = tools.pick([2, 4], rng);
        const n = tools.randomInt(rng, 2, 9);
        const valueText = places === 2 ? ((n * n) / 100).toFixed(2) : ((n * n) / 10000).toFixed(4);
        question.factKey = "cp-" + places + "-" + n;
        question.contextKey = "plain";
        question.display = rootDisplay(valueText);
        question.answerKind = "integer";
        question.answerLabel = "Decimal places in the root";
        question.expected = places / 2;
        question.answerShown = String(places / 2);
        question.correctNote = "Correct. " + valueText + " has " + places + " decimal places, so its root has " + (places / 2) + ".";
        question.misses = [
            { value: places, text: "That is the count under the sign. Squaring doubles the count, so a root halves it." },
            { value: places / 2 + 1, text: "One place too many. Half of " + places + " is " + (places / 2) + "." }
        ];
        question.hints = [
            "Count the decimal places in the number under the sign.",
            "A product carries as many decimal places as its two factors together, so squaring doubles the count and a root halves it."
        ];
        question.steps = [
            valueText + " has " + places + " decimal places.",
            "Squaring doubles a count of decimal places, so rooting halves it.",
            "The root has " + (places / 2) + " decimal " + (places / 2 === 1 ? "place" : "places") + "."
        ];
        question.summaryLine = "Halving the decimal places of " + valueText;
        question.printLine = "How many decimal places does the square root of " + valueText + " have?";
        return base(question, "Halve the count of places", "How many decimal places does the root of this number have?");
    }

    /* -------------------------------------- between the squares, checking */

    function fillBetweenTwoSquares(question, rng, tools) {
        const n = tools.randomInt(rng, 3, 14);
        const low = n * n;
        const high = (n + 1) * (n + 1);
        const value = tools.drawValid(
            function () { return tools.randomInt(rng, low + 1, high - 1); },
            function (v) { return !isSquare(v); },
            low + 1);
        question.factKey = "bt-" + value;
        question.contextKey = "plain";
        question.display = rootDisplay(value);
        question.mode = "parts";
        question.partsLegend = "The two whole numbers the root lies between";
        question.cells = [
            { label: "Lower", expected: String(n) },
            { label: "Upper", expected: String(n + 1) }
        ];
        question.partsNote = "The two squares either side of the number fix where its root lies.";
        question.correctNote = "Correct. " + low + " < " + value + " < " + high + ", so the root lies between " + n + " and " + (n + 1) + ".";
        question.answerShown = "between " + n + " and " + (n + 1);
        question.hints = [
            "Find the two squares either side of " + value + ".",
            n + "² = " + low + " and " + (n + 1) + "² = " + high + "."
        ];
        question.steps = [
            "The squares either side of " + value + " are " + low + " and " + high + ".",
            low + " < " + value + " < " + high + ".",
            "So the square root of " + value + " lies between " + n + " and " + (n + 1) + "."
        ];
        question.summaryLine = "Placing the square root of " + value;
        question.printLine = "Between which two whole numbers does the square root of " + value + " lie?";
        return base(question, "Between two whole numbers", "This number is not a square. Give the two whole numbers its root lies between.");
    }

    function fillNotHalf(question, rng, tools) {
        const n = tools.randomInt(rng, 8, 15);
        const value = n * n;
        const half = value / 2;
        question.factKey = "nh-" + n;
        question.contextKey = "plain";
        question.display = rootDisplay(value);
        question.mode = "choice";
        question.choiceLegend = "Which is the square root of this number?";
        const picked = chooseFour([
            { text: String(n), note: "Correct. " + n + " × " + n + " = " + value + "." },
            { text: String(half), note: "That halves " + value + ". " + half + " × " + half + " = " + (half * half) + ", not " + value + "." },
            { text: String(n * 2), note: "That doubles the root. " + (n * 2) + " × " + (n * 2) + " = " + (n * 2 * n * 2) + "." },
            { text: String(n - 1), note: (n - 1) + " × " + (n - 1) + " = " + ((n - 1) * (n - 1)) + ", which is not " + value + "." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = String(n);
        question.hints = [
            "Test each option by squaring it.",
            "Only one of them multiplied by itself gives " + value + "."
        ];
        question.steps = [
            "A square root is the number that multiplies by itself to give " + value + ".",
            "Halving gives " + half + ", and " + half + " × " + half + " = " + (half * half) + ", so halving is not rooting.",
            n + " × " + n + " = " + value + ", so the root is " + n + "."
        ];
        question.summaryLine = "Rooting rather than halving " + value;
        question.printLine = "Work out the square root of " + value + ".";
        return base(question, "Rooting, not halving", "Choose the square root of this number.");
    }

    function fillWhichHasWholeRoot(question, rng, tools) {
        const n = tools.randomInt(rng, 5, 14);
        const square = n * n;
        const near = [square + 1, square - 1, square + 2].filter(function (v) { return v > 1 && !isSquare(v); });
        question.factKey = "whr-" + n;
        question.contextKey = "plain";
        question.mode = "choice";
        question.choiceLegend = "Which of these has a whole-number square root?";
        const picked = chooseFour([
            { text: String(square), note: "Correct. " + n + " × " + n + " = " + square + "." }
        ].concat(near.map(function (v) {
            return { text: String(v), note: v + " falls between " + square + " and a neighbouring square, so its root is not a whole number." };
        })), rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = String(square);
        question.hints = [
            "A number has a whole-number root only when it stands against one of the squares.",
            "The squares of 1 to 15 are 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225."
        ];
        question.steps = [
            "A whole-number root means the number is one of the squares.",
            "Checking the options against the squares of 1 to 15 leaves " + square + ".",
            n + " × " + n + " = " + square + ", so only " + square + " has a whole-number root."
        ];
        question.summaryLine = "Which number has a whole-number root";
        question.printLine = "Which of these numbers has a whole-number square root?";
        return base(question, "A whole-number root", "Only one of these numbers has a whole-number square root.");
    }

    function fillRootOfASum(question, rng, tools) {
        const draw = tools.pick([[9, 16, 5], [16, 9, 5], [36, 64, 10], [64, 36, 10], [25, 144, 13], [144, 25, 13]], rng);
        const a = draw[0];
        const b = draw[1];
        const together = draw[2];
        const apart = Math.sqrt(a) + Math.sqrt(b);
        question.factKey = "sum-" + a + "-" + b;
        question.contextKey = "plain";
        question.display = { kind: "root", radicand: a + " + " + b, grouped: true,
            ariaLabel: "the square root of " + a + " plus " + b };
        question.answerKind = "integer";
        question.answerLabel = "The root";
        question.expected = together;
        question.answerShown = String(together);
        question.correctNote = "Correct. The bar covers the whole sum, so " + a + " + " + b + " = " + (a + b) + " is rooted.";
        question.misses = [
            { value: apart, text: "That roots each number separately: " + Math.sqrt(a) + " + " + Math.sqrt(b) + " = " + apart + ". The bar covers the whole sum instead." },
            { value: a + b, text: "That is the sum itself, before it is rooted." }
        ];
        question.hints = [
            "The bar over the numbers says how far the root reaches.",
            "Add first, then root: " + a + " + " + b + " = " + (a + b) + "."
        ];
        question.steps = [
            "The bar covers both numbers, so the addition happens first.",
            a + " + " + b + " = " + (a + b) + ".",
            "The square root of " + (a + b) + " is " + together + ", because " + together + " × " + together + " = " + (a + b) + "."
        ];
        question.summaryLine = "Rooting the whole sum " + a + " + " + b;
        question.printLine = "Work out the square root of " + a + " + " + b + ".";
        return base(question, "The bar covers the whole sum", "Work out this square root.");
    }

    const FILLERS = {
        "root-of-square": fillRootOfSquare,
        "square-then-root": fillSquareThenRoot,
        "side-of-square": fillSideOfSquare,
        "root-then-check": fillRootThenCheck,
        "root-two-places": fillRootTwoPlaces,
        "root-four-places": fillRootFourPlaces,
        "root-above-its-number": fillRootAboveItsNumber,
        "count-the-places": fillCountThePlaces,
        "between-two-squares": fillBetweenTwoSquares,
        "not-half": fillNotHalf,
        "which-has-whole-root": fillWhichHasWholeRoot,
        "root-of-a-sum": fillRootOfASum
    };

    const api = scope.PracticeEngine.create({
        stages: STAGES,
        lessonUrl: LESSON_URL,
        families: FAMILIES,
        fillers: FILLERS,
        notes: {
            integer: "This root is a whole number, so it has no decimal part. Read the squares of 1 to 15 backwards.",
            fallback: "Not yet. A square root asks which number multiplied by itself gives the number under the sign, so check your answer by squaring it."
        }
    });

    scope.SquareRootsPractice = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
