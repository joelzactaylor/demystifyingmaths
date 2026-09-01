/* Practice: powers and roots review.
   A mixed round drawing on index notation, recognising powers, square roots,
   both roots of a squared equation, and roots of a higher order. Decimal roots
   are held as whole numbers and scaled by powers of ten, so no answer is a
   floating-point approximation. js/practice-engine.js runs the round; the
   generator half runs without a document so it can be fuzzed from Node. */
(function (scope) {
    "use strict";

    const DIR = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/powersAndRoots/";

    const LESSONS = {
        indexNotation: { label: "Index notation", url: DIR + "indexNotation.html" },
        recognising: { label: "Recognising powers", url: DIR + "recognisingPowers.html" },
        squareRoots: { label: "Square roots", url: DIR + "squareRoots.html" },
        bothRoots: { label: "Positive and negative square roots", url: DIR + "positiveAndNegativeRoots.html" },
        higher: { label: "Cube roots and higher roots", url: DIR + "cubeAndHigherRoots.html" }
    };

    const STAGES = [
        { name: "Powers and index form", lessons: [LESSONS.indexNotation, LESSONS.recognising] },
        { name: "Roots of every order", lessons: [LESSONS.squareRoots, LESSONS.higher] },
        { name: "Both roots, and the sign", lessons: [LESSONS.bothRoots] }
    ];

    /* The round ends on a squared equation with no solution on the number
       line, which is the one case the ± rule must not be applied to. */
    const FAMILIES = [
        ["evaluate-power", "index-form", "find-the-index", "spot-the-square"],
        ["square-root-perfect", "square-root-decimal", "cube-root-negative", "higher-root"],
        ["principal-root", "equation-solutions", "minus-in-front", "square-equals-negative"]
    ];

    const MINUS = "−";
    const SUPERS = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };

    /* Powers are written into option text and feedback as ordinary strings, so
       the index is raised with real superscript characters rather than a caret.
       The caret belongs to the drawn notation in the question card, where the
       clipped span keeps a flattened copy true. */
    function sup(value) {
        return String(value).split("").map(function (digit) { return SUPERS[digit] || digit; }).join("");
    }

    function groupDigits(value) {
        return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

    function powerDisplay(b, index) {
        return {
            kind: "power", base: String(b), index: String(index),
            ariaLabel: String(b) + " to the power of " + index
        };
    }

    const ORDINAL = { 3: "cube", 4: "fourth", 5: "fifth", 6: "sixth" };

    function rootDisplay(order, radicand, options) {
        const settings = options || {};
        const spokenRadicand = String(radicand).indexOf(MINUS) === 0
            ? "negative " + String(radicand).slice(1)
            : String(radicand);
        const name = order === 2 ? "the square root of " : "the " + (ORDINAL[order] || order) + " root of ";
        return {
            kind: "root",
            order: String(order),
            radicand: String(radicand),
            grouped: Boolean(settings.grouped),
            lead: settings.lead || "",
            ariaLabel: (settings.lead === MINUS ? "minus " : "") + name + spokenRadicand
        };
    }

    function expansion(n, times) {
        const parts = [];
        for (let at = 0; at < times; at += 1) parts.push(n < 0 ? "(" + MINUS + Math.abs(n) + ")" : String(n));
        return parts.join(" × ");
    }

    /* ------------------------------------------------ powers and index form */

    /* Every pair a reader can reach by multiplying up, which is what the
       lessons ask for: no power here needs a calculator. */
    const POWERS = [
        { b: 2, i: 3, v: 8 }, { b: 2, i: 4, v: 16 }, { b: 2, i: 5, v: 32 }, { b: 2, i: 6, v: 64 },
        { b: 3, i: 2, v: 9 }, { b: 3, i: 3, v: 27 }, { b: 3, i: 4, v: 81 },
        { b: 4, i: 2, v: 16 }, { b: 4, i: 3, v: 64 },
        { b: 5, i: 2, v: 25 }, { b: 5, i: 3, v: 125 },
        { b: 6, i: 2, v: 36 }, { b: 7, i: 2, v: 49 }, { b: 9, i: 2, v: 81 }, { b: 10, i: 3, v: 1000 }
    ];

    function fillEvaluatePower(question, rng, tools) {
        const pick = tools.pick(POWERS, rng);
        question.factKey = "ev-" + pick.b + "-" + pick.i;
        question.contextKey = "plain";
        question.display = powerDisplay(pick.b, pick.i);
        question.answerKind = "integer";
        question.answerLabel = "The value";
        question.expected = pick.v;
        question.answerShown = groupDigits(pick.v);
        question.correctNote = "Correct. " + expansion(pick.b, pick.i) + " = " + groupDigits(pick.v) + ".";
        question.misses = [
            { value: pick.b * pick.i, text: "That multiplies the base by the index. The index counts how many factors of " + pick.b + " there are, so it is " + expansion(pick.b, pick.i) + "." },
            { value: pick.b * pick.b, text: "That is " + pick.b + " squared, two factors. The index " + pick.i + " asks for " + pick.i + " of them." },
            { value: pick.b + pick.i, text: "That adds the base and the index. The index counts factors, and they are multiplied." }
        ];
        question.hints = [
            "The index counts how many factors of the base are multiplied together.",
            "Write " + pick.b + " down " + pick.i + " times with × between, then work left to right."
        ];
        question.steps = [
            sup(pick.i) + " on the " + pick.b + " means " + pick.i + " factors of " + pick.b + ".",
            "That is " + expansion(pick.b, pick.i) + ".",
            "Multiplying gives " + groupDigits(pick.v) + "."
        ];
        question.summaryLine = pick.b + sup(pick.i);
        question.printLine = "Work out " + pick.b + sup(pick.i) + ".";
        return base(question, "Evaluate the power", "Work out the value of this power.");
    }

    function fillIndexForm(question, rng, tools) {
        /* The swapped-index distractor is the base and index exchanged, so a
           power whose base equals its index would offer the same text twice
           and leave the question with three options. 3³ is the only such pair
           in the table, and it is kept out here rather than patched later. */
        const pick = tools.pick(POWERS.filter(function (each) { return each.i >= 3 && each.b !== each.i; }), rng);
        question.factKey = "if-" + pick.b + "-" + pick.i;
        question.contextKey = "structure";
        question.display = { kind: "inline", text: expansion(pick.b, pick.i), ariaLabel: expansion(pick.b, pick.i) };
        question.mode = "choice";
        question.choiceLegend = "Which is the index form?";
        const picked = chooseFour([
            { text: pick.b + sup(pick.i), note: "Correct. There are " + pick.i + " factors of " + pick.b + ", so the base is " + pick.b + " and the index is " + pick.i + "." },
            { text: pick.i + sup(pick.b), note: "That swaps the base and the index. The number being multiplied is " + pick.b + ", so " + pick.b + " is the base." },
            { text: pick.b + " × " + pick.i, note: "The index is not a multiplier. It counts the factors, and there are " + pick.i + " of them." },
            { text: String(pick.b * pick.i), note: "That is the value of " + pick.b + " × " + pick.i + ". Index form keeps the base and the index, and is not worked out." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = pick.b + sup(pick.i);
        question.hints = [
            "Count how many factors are being multiplied, and note which number is repeated.",
            "The repeated number is the base; the count of factors is the index."
        ];
        question.steps = [
            "The number repeated is " + pick.b + ", so the base is " + pick.b + ".",
            "It appears " + pick.i + " times, so the index is " + pick.i + ".",
            "In index form that is " + pick.b + sup(pick.i) + "."
        ];
        question.summaryLine = "Writing " + expansion(pick.b, pick.i) + " in index form";
        question.printLine = "Write " + expansion(pick.b, pick.i) + " in index form.";
        return base(question, "Index form", "Choose the index form of this product.");
    }

    function fillFindTheIndex(question, rng, tools) {
        const pick = tools.pick(POWERS.filter(function (each) { return each.i >= 3; }), rng);
        question.factKey = "fi-" + pick.b + "-" + pick.i;
        question.contextKey = "structure";
        question.display = { kind: "inline", text: groupDigits(pick.v), ariaLabel: String(pick.v) };
        question.answerKind = "integer";
        question.answerLabel = "The index";
        question.expected = pick.i;
        question.answerShown = String(pick.i);
        question.correctNote = "Correct. " + expansion(pick.b, pick.i) + " = " + groupDigits(pick.v) + ".";
        question.misses = [
            { value: pick.v, text: "That is the number itself. The index counts the factors of " + pick.b + " inside it." },
            { value: pick.v / pick.b, text: "That divides by " + pick.b + " once. Keep dividing, and count how many times " + pick.b + " goes in before you reach 1." },
            { value: pick.i - 1, text: "One factor short. Count " + pick.b + " itself as the first factor." },
            { value: pick.i + 1, text: "One factor too many. " + expansion(pick.b, pick.i) + " already reaches " + groupDigits(pick.v) + "." }
        ];
        question.hints = [
            "Divide by " + pick.b + " over and over, and count how many divisions reach 1.",
            "Each division removes one factor of " + pick.b + ", and the count of factors is the index."
        ];
        question.steps = [
            groupDigits(pick.v) + " is to be written as a power of " + pick.b + ".",
            "Splitting it into equal factors gives " + expansion(pick.b, pick.i) + ".",
            "There are " + pick.i + " factors, so the index is " + pick.i + " and " + groupDigits(pick.v) + " = " + pick.b + sup(pick.i) + "."
        ];
        question.summaryLine = "Writing " + groupDigits(pick.v) + " as a power of " + pick.b;
        question.printLine = "Write " + groupDigits(pick.v) + " as a power of " + pick.b + ", and give the index.";
        return base(question, "Find the index", "Write this number as a power of " + pick.b + ", and give the index.");
    }

    function fillSpotTheSquare(question, rng, tools) {
        /* The squares past 100, which are the ones a reader whose recall stops
           at ten times ten does not reach. Every distractor is checked against
           the square list rather than assumed. */
        const n = tools.pick([11, 12, 13, 14, 15], rng);
        const square = n * n;
        const squares = [];
        for (let at = 1; at <= 20; at += 1) squares.push(at * at);
        /* The two squares a value falls between, so a distractor's note can
           name them instead of gesturing at a neighbour. */
        const bracket = function (value) {
            let below = 0;
            for (let at = 0; at < squares.length; at += 1) {
                if (squares[at] < value) below = squares[at];
                else return [below, squares[at]];
            }
            return [below, below];
        };
        const offsets = [-6, -4, 4, 6, -8, 8];
        const others = [];
        offsets.forEach(function (offset) {
            const candidate = square + offset;
            if (others.length === 3) return;
            if (candidate <= 0 || squares.indexOf(candidate) !== -1) return;
            others.push(candidate);
        });
        question.factKey = "sq-" + n;
        question.contextKey = "structure";
        question.mode = "choice";
        question.choiceLegend = "Which of these is a square number?";
        const picked = chooseFour([
            { text: groupDigits(square), note: "Correct. " + n + " × " + n + " = " + groupDigits(square) + "." },
            { text: groupDigits(others[0]), note: groupDigits(others[0]) + " lies between " + groupDigits(bracket(others[0])[0]) + " and " + groupDigits(bracket(others[0])[1]) + ", and consecutive squares leave no square between them." },
            { text: groupDigits(others[1]), note: groupDigits(others[1]) + " is not a square: no whole number multiplied by itself reaches it." },
            { text: groupDigits(others[2]), note: groupDigits(others[2]) + " is not a square. The squares near here are " + groupDigits((n - 1) * (n - 1)) + ", " + groupDigits(square) + " and " + groupDigits((n + 1) * (n + 1)) + "." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = groupDigits(square);
        question.hints = [
            "A square number is a whole number multiplied by itself.",
            "The squares run 100, 121, 144, 169, 196, 225. Look for one of those."
        ];
        question.steps = [
            "The squares past 100 are 121, 144, 169, 196 and 225.",
            groupDigits(square) + " is on that list, because " + n + " × " + n + " = " + groupDigits(square) + ".",
            "The others fall between consecutive squares, so none of them is square."
        ];
        question.summaryLine = "Spotting the square number";
        question.printLine = "Which of these is a square number?";
        return base(question, "Which is a square?", "Choose the square number.");
    }

    /* ------------------------------------------------- roots of every order */

    function fillSquareRootPerfect(question, rng, tools) {
        const n = tools.pick([11, 12, 13, 14, 15], rng);
        const value = n * n;
        question.factKey = "srp-" + n;
        question.contextKey = "plain";
        question.display = rootDisplay(2, groupDigits(value));
        question.answerKind = "integer";
        question.answerLabel = "The root";
        question.expected = n;
        question.answerShown = String(n);
        question.correctNote = "Correct. " + n + " × " + n + " = " + groupDigits(value) + ".";
        question.misses = [
            { value: value / 2, text: "That halves the number, and halving is not rooting. A root asks for two equal factors: " + (value / 2) + " × " + (value / 2) + " is far larger than " + groupDigits(value) + "." },
            { value: value, text: "That is the number under the sign. The root is the number that was squared to make it." },
            { value: n - 1, text: "Close. " + (n - 1) + " × " + (n - 1) + " = " + groupDigits((n - 1) * (n - 1)) + ", one square short." },
            { value: n + 1, text: "Close. " + (n + 1) + " × " + (n + 1) + " = " + groupDigits((n + 1) * (n + 1)) + ", one square past." }
        ];
        question.hints = [
            "Ask which number multiplied by itself gives the number under the sign.",
            "The squares past 100 are 121, 144, 169, 196 and 225."
        ];
        question.steps = [
            groupDigits(value) + " stands under the sign.",
            "The squares give " + n + " × " + n + " = " + groupDigits(value) + ".",
            "So the square root of " + groupDigits(value) + " is " + n + "."
        ];
        question.summaryLine = "The square root of " + groupDigits(value);
        question.printLine = "Work out the square root of " + groupDigits(value) + ".";
        return base(question, "A square root", "Work out this root.");
    }

    function fillSquareRootDecimal(question, rng, tools) {
        /* Held as whole numbers and scaled, so nothing here is a floating-point
           approximation: root = n/10 and value = n*n/100 exactly as text. */
        const n = tools.pick([3, 4, 5, 6, 7, 8, 9, 12, 14, 15], rng);
        const rootText = (n / 10).toFixed(1);
        const valueText = (n * n / 100).toFixed(2);
        question.factKey = "srd-" + n;
        question.contextKey = "plain";
        question.display = rootDisplay(2, valueText);
        question.answerKind = "decimal";
        question.answerLabel = "The root";
        question.expected = n / 10;
        question.answerShown = rootText;
        question.correctNote = "Correct. " + rootText + " × " + rootText + " = " + valueText + ".";
        question.misses = [
            { value: n / 100, text: "One decimal place too many. " + valueText + " has two decimal places, so its root has one." },
            { value: n, text: "That is the root of the digits without the point. " + valueText + " is smaller than 1 in size, so its root carries a decimal place too." },
            { value: n * n / 200, text: "That halves the number, and halving is not rooting." }
        ];
        question.hints = [
            "Squaring doubles the count of decimal places, so rooting halves it.",
            valueText + " has two decimal places, so the root has one. Root the digits, then place the point."
        ];
        question.steps = [
            valueText + " has two decimal places, so its square root has one.",
            "The digits give a root of " + n + " for " + (n * n) + ".",
            "Placing the point one place along, the root is " + rootText + ", and " + rootText + " × " + rootText + " = " + valueText + "."
        ];
        question.summaryLine = "The square root of " + valueText;
        question.printLine = "Work out the square root of " + valueText + ".";
        return base(question, "A root with a decimal", "Work out this square root.");
    }

    const CUBE_ROOTS = [2, 3, 4, 5, 10];

    function fillCubeRootNegative(question, rng, tools) {
        const n = tools.pick(CUBE_ROOTS, rng);
        const value = n * n * n;
        question.factKey = "crn-" + n;
        question.contextKey = "plain";
        question.display = rootDisplay(3, MINUS + groupDigits(value), { grouped: true });
        question.answerKind = "integer";
        question.answerLabel = "The root";
        question.expected = -n;
        question.answerShown = MINUS + n;
        question.correctNote = "Correct. " + expansion(-n, 3) + " = " + MINUS + groupDigits(value) + ".";
        question.misses = [
            { value: n, text: "The sign is missing. " + expansion(n, 3) + " = " + groupDigits(value) + ", which is positive, so the root of " + MINUS + groupDigits(value) + " must be negative." },
            { value: -value / 3, text: "That divides by 3, and dividing is not rooting. A cube root asks for three equal factors." },
            { value: -(n * n), text: "That is two factors, not three. The order 3 asks for " + expansion(-n, 3) + "." }
        ];
        question.hints = [
            "An odd order reaches every number on the line, negatives included.",
            "Three negative factors leave a negative product, so the root is negative."
        ];
        question.steps = [
            "The order is 3, which is odd, so a negative number does have a cube root.",
            "Three factors of " + MINUS + n + " give " + expansion(-n, 3) + " = " + MINUS + groupDigits(value) + ".",
            "So the cube root of " + MINUS + groupDigits(value) + " is " + MINUS + n + "."
        ];
        question.summaryLine = "The cube root of " + MINUS + groupDigits(value);
        question.printLine = "Work out the cube root of " + MINUS + groupDigits(value) + ".";
        return base(question, "A cube root of a negative", "Work out this root.");
    }

    const HIGHER = [
        { order: 4, root: 2, value: 16 },
        { order: 4, root: 3, value: 81 },
        { order: 5, root: 2, value: 32 },
        { order: 5, root: 3, value: 243 },
        { order: 6, root: 2, value: 64 }
    ];

    function fillHigherRoot(question, rng, tools) {
        const pick = tools.pick(HIGHER, rng);
        question.factKey = "hr-" + pick.order + "-" + pick.root;
        question.contextKey = "plain";
        question.display = rootDisplay(pick.order, groupDigits(pick.value));
        question.answerKind = "integer";
        question.answerLabel = "The root";
        question.expected = pick.root;
        question.answerShown = String(pick.root);
        question.correctNote = "Correct. " + expansion(pick.root, pick.order) + " = " + groupDigits(pick.value) + ".";
        question.misses = [
            { value: pick.value / pick.order, text: "That divides by the order, and dividing is not rooting. The order says how many equal factors to look for." },
            { value: pick.root * pick.order, text: "That multiplies the root by the order. The order counts the factors instead." },
            { value: pick.value, text: "That is the number under the sign. The root is the number raised to the power " + pick.order + " to make it." }
        ];
        question.hints = [
            "The small number in the crook is the order, and it says how many equal factors the root is looking for.",
            "Try multiplying a small number by itself " + pick.order + " times until you reach " + groupDigits(pick.value) + "."
        ];
        question.steps = [
            "The order in the crook is " + pick.order + ", so the root is looking for " + pick.order + " equal factors.",
            expansion(pick.root, pick.order) + " = " + groupDigits(pick.value) + ".",
            "So the " + ORDINAL[pick.order] + " root of " + groupDigits(pick.value) + " is " + pick.root + "."
        ];
        question.summaryLine = "The " + ORDINAL[pick.order] + " root of " + groupDigits(pick.value);
        question.printLine = "Work out the " + ORDINAL[pick.order] + " root of " + groupDigits(pick.value) + ".";
        return base(question, "A root of a higher order", "Work out this root.");
    }

    /* ------------------------------------------ both roots, and the sign */

    function fillPrincipalRoot(question, rng, tools) {
        const n = tools.pick([6, 7, 8, 9, 10], rng);
        const value = n * n;
        question.factKey = "pr-" + n;
        question.contextKey = "plain";
        question.display = rootDisplay(2, groupDigits(value));
        question.answerKind = "integer";
        question.answerLabel = "The value";
        question.expected = n;
        question.answerShown = String(n);
        question.correctNote = "Correct. The sign names one number, the positive one, so " + groupDigits(value) + " under the sign gives " + n + ".";
        question.misses = [
            { value: -n, text: "The sign names the positive root. " + MINUS + n + " squares to " + groupDigits(value) + " as well, but it answers x" + sup(2) + " = " + groupDigits(value) + " rather than the sign." },
            { value: value, text: "That is the number under the sign. The root is the number that was squared." },
            { value: value / 2, text: "That halves the number, and halving is not rooting." }
        ];
        question.hints = [
            "The sign asks for one number, not two.",
            "Of the two numbers that square to " + groupDigits(value) + ", the sign names the positive one."
        ];
        question.steps = [
            "Both " + n + " and " + MINUS + n + " square to " + groupDigits(value) + ".",
            "The sign names the principal square root, which is the positive one.",
            "So this expression stands for the single number " + n + "."
        ];
        question.summaryLine = "The square root sign on " + groupDigits(value);
        question.printLine = "Work out the square root of " + groupDigits(value) + ".";
        return base(question, "What the sign names", "Work out the value this sign stands for.");
    }

    function fillEquationSolutions(question, rng, tools) {
        const n = tools.pick([6, 7, 8, 9, 11, 12], rng);
        const value = n * n;
        question.factKey = "es-" + n;
        question.contextKey = "structure";
        question.display = { kind: "inline", text: "x" + sup(2) + " = " + groupDigits(value), ariaLabel: "x squared equals " + value };
        question.mode = "choice";
        question.choiceLegend = "Which lists every solution?";
        const picked = chooseFour([
            { text: n + " and " + MINUS + n, note: "Correct. " + n + " × " + n + " = " + groupDigits(value) + " and " + expansion(-n, 2) + " = " + groupDigits(value) + ", so both solve it." },
            { text: String(n), note: "That is one of them. " + expansion(-n, 2) + " = " + groupDigits(value) + " as well, so " + MINUS + n + " solves the equation too." },
            { text: MINUS + n, note: "That is one of them. " + n + " × " + n + " = " + groupDigits(value) + " as well, so " + n + " solves the equation too." },
            { text: groupDigits(value) + " and " + MINUS + groupDigits(value), note: "Those are the number itself and its negative. The solutions are the numbers that square to " + groupDigits(value) + "." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = n + " and " + MINUS + n;
        question.hints = [
            "The equation asks which numbers square to " + groupDigits(value) + ", not what the root sign names.",
            "A negative multiplied by a negative is positive, so check whether " + MINUS + n + " works as well."
        ];
        question.steps = [
            "x" + sup(2) + " = " + groupDigits(value) + " asks for every number whose square is " + groupDigits(value) + ".",
            n + " × " + n + " = " + groupDigits(value) + ", and " + expansion(-n, 2) + " = " + groupDigits(value) + ".",
            "So the solutions are " + n + " and " + MINUS + n + ", written x = ±" + n + "."
        ];
        question.summaryLine = "Every solution of x" + sup(2) + " = " + groupDigits(value);
        question.printLine = "Solve x" + sup(2) + " = " + groupDigits(value) + ", giving every solution.";
        return base(question, "A squared equation", "Choose the list of every solution.");
    }

    function fillMinusInFront(question, rng, tools) {
        const n = tools.pick([4, 5, 6, 7, 8, 9, 10, 11, 12], rng);
        const value = n * n;
        question.factKey = "mif-" + n;
        question.contextKey = "plain";
        question.display = rootDisplay(2, groupDigits(value), { lead: MINUS });
        question.answerKind = "integer";
        question.answerLabel = "The value";
        question.expected = -n;
        question.answerShown = MINUS + n;
        question.correctNote = "Correct. The sign gives " + n + ", and the minus in front makes it " + MINUS + n + ".";
        question.misses = [
            { value: n, text: "The root is " + n + ", but the minus in front has not been applied. It sits outside the sign and negates the result." },
            { value: value, text: "That is the number under the sign, and the minus in front is missing too." },
            { value: -value, text: "The minus is right, but the root has not been taken. The sign asks which number squares to " + groupDigits(value) + "." }
        ];
        question.hints = [
            "The minus is outside the root sign, so it is not part of what is being rooted.",
            "Work out the root first, then apply the minus to the result."
        ];
        question.steps = [
            "The minus stands in front of the sign, so it is not under the bar.",
            "The root of " + groupDigits(value) + " is " + n + ".",
            "Applying the minus to that gives " + MINUS + n + "."
        ];
        question.summaryLine = "A minus in front of a root sign";
        question.printLine = "Work out minus the square root of " + groupDigits(value) + ".";
        return base(question, "A minus in front of the sign", "Work out the value of this expression.");
    }

    function fillSquareEqualsNegative(question, rng, tools) {
        const n = tools.pick([3, 4, 5, 6, 7, 8], rng);
        const value = n * n;
        question.factKey = "sen-" + n;
        question.contextKey = "structure";
        question.display = { kind: "inline", text: "x" + sup(2) + " = " + MINUS + groupDigits(value), ariaLabel: "x squared equals negative " + value };
        question.mode = "choice";
        question.choiceLegend = "Which lists every solution on the number line?";
        const picked = chooseFour([
            { text: "No solution on the number line", note: "Correct. Every number on the line squares to something positive or zero, so none of them squares to " + MINUS + groupDigits(value) + "." },
            { text: MINUS + n, note: expansion(-n, 2) + " = " + groupDigits(value) + ", which is positive. A minus does not survive being squared." },
            { text: n + " and " + MINUS + n, note: "Both of those square to " + groupDigits(value) + ", not " + MINUS + groupDigits(value) + "." },
            { text: String(n), note: n + " × " + n + " = " + groupDigits(value) + ", which is positive, not " + MINUS + groupDigits(value) + "." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = "No solution on the number line";
        question.hints = [
            "Try squaring a positive number, then a negative one, and watch the sign of the result.",
            "A negative multiplied by a negative is positive, so squaring never leaves a negative."
        ];
        question.steps = [
            "Squaring a positive number gives a positive result.",
            "Squaring a negative number also gives a positive result: " + expansion(-n, 2) + " = " + groupDigits(value) + ".",
            "Nothing on the number line squares to " + MINUS + groupDigits(value) + ", so the equation has no solution there."
        ];
        question.summaryLine = "Why x" + sup(2) + " = " + MINUS + groupDigits(value) + " has no solution on the line";
        question.printLine = "Solve x" + sup(2) + " = " + MINUS + groupDigits(value) + " on the number line.";
        return base(question, "A negative on the right", "Choose the solutions this equation has on the number line.");
    }

    const FILLERS = {
        "evaluate-power": fillEvaluatePower,
        "index-form": fillIndexForm,
        "find-the-index": fillFindTheIndex,
        "spot-the-square": fillSpotTheSquare,
        "square-root-perfect": fillSquareRootPerfect,
        "square-root-decimal": fillSquareRootDecimal,
        "cube-root-negative": fillCubeRootNegative,
        "higher-root": fillHigherRoot,
        "principal-root": fillPrincipalRoot,
        "equation-solutions": fillEquationSolutions,
        "minus-in-front": fillMinusInFront,
        "square-equals-negative": fillSquareEqualsNegative
    };

    const api = scope.PracticeEngine.create({
        stages: STAGES,
        lessonUrl: DIR + "indexNotation.html",
        families: FAMILIES,
        fillers: FILLERS,
        notes: {
            integer: "This answer is a whole number, so it has no decimal part. Multiply one factor at a time to check it.",
            fallback: "Not yet. A power counts equal factors, and a root asks which number was raised to that power, so check your answer by raising it and seeing what comes back."
        }
    });

    scope.PowersRootsReviewPractice = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
