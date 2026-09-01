/* Practice: positive and negative square roots.
   The bank of twelve questions; js/practice-engine.js runs the round, marks it
   and drives the page. The generator half runs without a document so it can be
   fuzzed from Node. */
(function (scope) {
    "use strict";

    const LESSON_URL = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/powersAndRoots/positiveAndNegativeRoots.html";

    const STAGES = [
        { name: "Both numbers that square to it", lessonAnchor: "two-numbers-square-to-49" },
        { name: "What the root sign names", lessonAnchor: "what-the-root-sign-names" },
        { name: "Solving a squared equation", lessonAnchor: "solving-x-squared-equals-49" }
    ];

    const FAMILIES = [
        ["other-root", "square-a-negative", "which-pair", "count-solutions"],
        ["principal-root", "negative-of-a-root", "sign-or-equation", "plus-minus-means"],
        ["solve-two", "solve-zero", "solve-negative", "solve-and-check"]
    ];

    const MINUS = "−";

    function signed(value) {
        return value < 0 ? MINUS + Math.abs(value) : String(value);
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

    function rootDisplay(radicand) {
        return { kind: "root", radicand: String(radicand), ariaLabel: "the square root of " + radicand };
    }

    /* ---------------------------------------- both numbers that square */

    function fillOtherRoot(question, rng, tools) {
        const n = tools.randomInt(rng, 3, 15);
        const value = n * n;
        question.factKey = "other-" + n;
        question.contextKey = "plain";
        question.given = n + " × " + n + " = " + value;
        question.givenLabel = "One of them";
        question.answerKind = "integer";
        question.answerLabel = "The other number";
        question.expected = -n;
        question.answerShown = signed(-n);
        question.correctNote = "Correct. (" + MINUS + n + ") × (" + MINUS + n + ") = " + value + " as well.";
        question.misses = [
            { value: n, text: "That is the one already given. The other differs from it only in sign." },
            { value: value, text: "That is the number being squared to, not a number that squares to it." },
            { value: -value, text: "Squaring " + signed(-value) + " would give a far larger number. The pair differs from " + n + " only in sign." }
        ];
        question.hints = [
            "Two numbers square to every positive square, and they differ only in sign.",
            "Multiplying two negatives gives a positive, so try " + signed(-n) + "."
        ];
        question.steps = [
            n + " × " + n + " = " + value + " is given.",
            "A number and its negative have the same square, because two negative factors multiply to a positive.",
            "(" + MINUS + n + ") × (" + MINUS + n + ") = " + value + ", so the other number is " + signed(-n) + "."
        ];
        question.summaryLine = "The other number that squares to " + value;
        question.printLine = "One number that squares to " + value + " is " + n + ". Write the other.";
        return base(question, "The other number", "One number that squares to this value is given. Write the other one.");
    }

    function fillSquareANegative(question, rng, tools) {
        const n = tools.randomInt(rng, 2, 15);
        const value = n * n;
        question.factKey = "sqneg-" + n;
        question.contextKey = "plain";
        question.display = { kind: "power", base: "(" + MINUS + n + ")", index: "2",
            ariaLabel: "negative " + n + " squared" };
        question.answerKind = "integer";
        question.answerLabel = "The value";
        question.expected = value;
        question.answerShown = String(value);
        question.correctNote = "Correct. Two negative factors multiply to a positive.";
        question.misses = [
            { value: -value, text: "The brackets hold the minus inside the squaring, so both factors are negative and the product is positive." },
            { value: -n * 2, text: "That doubles " + signed(-n) + ". Squaring multiplies it by itself." },
            { value: n * 2, text: "That doubles " + n + ". Squaring multiplies the number by itself." }
        ];
        question.hints = [
            "The brackets mean the whole of " + signed(-n) + " is squared, sign included.",
            "A negative multiplied by a negative gives a positive."
        ];
        question.steps = [
            "(" + MINUS + n + ")² means (" + MINUS + n + ") × (" + MINUS + n + ").",
            "Two negative factors multiply to a positive.",
            "So (" + MINUS + n + ")² = " + value + "."
        ];
        question.summaryLine = "Squaring " + signed(-n);
        question.printLine = "Work out (" + MINUS + n + ")².";
        return base(question, "Squaring a negative", "Work out the value of this square.");
    }

    function fillWhichPair(question, rng, tools) {
        const n = tools.randomInt(rng, 4, 14);
        const value = n * n;
        question.factKey = "pair-" + n;
        question.contextKey = "plain";
        question.display = { kind: "inline", text: String(value), ariaLabel: String(value) };
        question.mode = "choice";
        question.choiceLegend = "Which pair of numbers squares to this value?";
        const picked = chooseFour([
            { text: n + " and " + signed(-n), note: "Correct. Both square to " + value + ", and they differ only in sign." },
            { text: n + " and " + (n + 1), note: (n + 1) + " squares to " + ((n + 1) * (n + 1)) + ", not " + value + "." },
            { text: n + " and " + (value / 2), note: (value / 2) + " squares to " + ((value / 2) * (value / 2)) + ", not " + value + "." },
            { text: n + " only", note: signed(-n) + " squares to " + value + " as well, so there are two." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = n + " and " + signed(-n);
        question.hints = [
            "Start from the whole number that squares to it.",
            "A number and its negative have the same square."
        ];
        question.steps = [
            n + " × " + n + " = " + value + ".",
            "(" + MINUS + n + ") × (" + MINUS + n + ") = " + value + " as well.",
            "So the pair is " + n + " and " + signed(-n) + "."
        ];
        question.summaryLine = "The pair that squares to " + value;
        question.printLine = "Which two numbers square to " + value + "?";
        return base(question, "The pair", "Choose the pair of numbers that square to this value.");
    }

    function fillCountSolutions(question, rng, tools) {
        const draw = tools.pick([
            { k: "positive", value: 0, answer: 2 },
            { k: "zero", value: 0, answer: 1 },
            { k: "negative", value: 0, answer: 0 }
        ], rng);
        let shown;
        let note;
        if (draw.k === "positive") {
            const n = tools.randomInt(rng, 3, 14);
            shown = String(n * n);
            note = "Two numbers on the line square to " + shown + ": " + n + " and " + signed(-n) + ".";
        } else if (draw.k === "zero") {
            shown = "0";
            note = "0 is its own negative, so the pair falls together and there is one.";
        } else {
            shown = signed(-tools.randomInt(rng, 2, 40));
            note = "A square is a number multiplied by itself, so its two factors carry the same sign and the product is never negative.";
        }
        question.factKey = "count-" + draw.k + "-" + shown;
        question.contextKey = "plain";
        question.given = "x² = " + shown;
        question.givenLabel = "The equation";
        question.answerKind = "integer";
        question.answerLabel = "How many numbers on the line";
        question.expected = draw.answer;
        question.answerShown = String(draw.answer);
        question.correctNote = "Correct. " + note;
        question.misses = [
            { value: draw.answer === 2 ? 1 : 2, text: draw.answer === 2
                ? "A positive square is reached from two numbers, one positive and one negative."
                : note },
            { value: draw.answer === 0 ? 1 : 0, text: note }
        ];
        question.hints = [
            "Ask whether the value on the right is above 0, equal to 0, or below it.",
            "Above 0 gives two numbers, 0 gives one, and below 0 gives none on the line."
        ];
        question.steps = [
            "The equation is x² = " + shown + ".",
            note,
            "So the count is " + draw.answer + "."
        ];
        question.summaryLine = "How many numbers square to " + shown;
        question.printLine = "How many numbers on the number line satisfy x² = " + shown + "?";
        return base(question, "How many answers", "How many numbers on the number line satisfy this equation?");
    }

    /* ------------------------------------------ what the root sign names */

    function fillPrincipalRoot(question, rng, tools) {
        const n = tools.randomInt(rng, 4, 15);
        const value = n * n;
        question.factKey = "prin-" + n;
        question.contextKey = "plain";
        question.display = rootDisplay(value);
        question.answerKind = "integer";
        question.answerLabel = "The value of the root";
        question.expected = n;
        question.answerShown = String(n);
        question.correctNote = "Correct. The sign names the principal square root, which is never negative.";
        question.misses = [
            { value: -n, text: signed(-n) + " is a square root of " + value + ", but the sign names the non-negative one." },
            { value: value / 2, text: "Halving is not rooting: " + (value / 2) + " × " + (value / 2) + " = " + ((value / 2) * (value / 2)) + "." }
        ];
        question.hints = [
            "Two numbers square to " + value + ", and the sign picks out one of them.",
            "The one it names is the principal square root, which is never negative."
        ];
        question.steps = [
            n + " × " + n + " = " + value + " and (" + MINUS + n + ") × (" + MINUS + n + ") = " + value + ".",
            "The sign names the principal square root, the non-negative one.",
            "So the square root of " + value + " is " + n + "."
        ];
        question.summaryLine = "The principal square root of " + value;
        question.printLine = "Work out the square root of " + value + ".";
        return base(question, "What the sign names", "Work out the value of this root.");
    }

    function fillNegativeOfARoot(question, rng, tools) {
        const n = tools.randomInt(rng, 4, 15);
        const value = n * n;
        question.factKey = "negroot-" + n;
        question.contextKey = "plain";
        question.display = { kind: "root", radicand: String(value), lead: MINUS,
            ariaLabel: "negative the square root of " + value };
        question.answerKind = "integer";
        question.answerLabel = "The value";
        question.expected = -n;
        question.answerShown = signed(-n);
        question.correctNote = "Correct. The sign names " + n + ", and the minus in front makes it " + signed(-n) + ".";
        question.misses = [
            { value: n, text: "The minus sits in front of the sign, so the value is the negative of what the sign names." },
            { value: -value, text: "That negates the number under the sign rather than the root of it." }
        ];
        question.hints = [
            "Work out what the sign names first.",
            "Then apply the minus that stands in front of it."
        ];
        question.steps = [
            "The sign names the principal root of " + value + ", which is " + n + ".",
            "The minus in front negates that value.",
            "So the answer is " + signed(-n) + "."
        ];
        question.summaryLine = "The negative of the root of " + value;
        question.printLine = "Work out " + MINUS + "√" + value + ".";
        return base(question, "A minus in front of the sign", "Work out the value of this expression.");
    }

    function fillSignOrEquation(question, rng, tools) {
        const n = tools.randomInt(rng, 4, 14);
        const value = n * n;
        question.factKey = "soe-" + n;
        question.contextKey = "plain";
        question.given = "√" + value + " and x² = " + value;
        question.givenLabel = "Compare";
        question.mode = "choice";
        question.choiceLegend = "Which statement is right?";
        const picked = chooseFour([
            { text: "√" + value + " = " + n + ", and x² = " + value + " gives x = ±" + n,
              note: "Correct. The sign names one number; the equation asks for every number that squares to " + value + "." },
            { text: "Both give ±" + n, note: "The sign names one number. ±" + n + " answers the equation, not the root." },
            { text: "Both give " + n, note: "The equation is answered by " + signed(-n) + " as well, so it has two solutions." },
            { text: "√" + value + " = ±" + n + ", and x² = " + value + " gives x = " + n,
              note: "That is the wrong way round: the sign names one value and the equation has two." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = "√" + value + " = " + n + ", and x² = " + value + " gives x = ±" + n;
        question.hints = [
            "One of these is a number; the other is a question about x.",
            "A symbol has to stand for one number, but an equation can have two answers."
        ];
        question.steps = [
            "√" + value + " is a number, and the sign names the non-negative root: " + n + ".",
            "x² = " + value + " asks for every number that squares to " + value + ".",
            "Both " + n + " and " + signed(-n) + " do, so x = ±" + n + "."
        ];
        question.summaryLine = "The sign against the equation, for " + value;
        question.printLine = "Compare √" + value + " with the solutions of x² = " + value + ".";
        return base(question, "A sign and an equation", "One of these names a single number and one asks a question. Choose the right statement.");
    }

    function fillPlusMinusMeans(question, rng, tools) {
        const n = tools.randomInt(rng, 2, 15);
        question.factKey = "pm-" + n;
        question.contextKey = "plain";
        question.given = "x = ±" + n;
        question.givenLabel = "Given";
        question.mode = "choice";
        question.choiceLegend = "What does this line record?";
        const picked = chooseFour([
            { text: "x is " + n + " or " + signed(-n), note: "Correct. ± separates the two values on one line." },
            { text: "x is " + n + " and " + signed(-n) + " at the same time", note: "x takes one of the two values, not both together." },
            { text: "x is " + (n * 2), note: "± does not add or double. It separates a value from its negative." },
            { text: "x is 0", note: "± separates two values; only when they fall together, at 0, is there one." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = "x is " + n + " or " + signed(-n);
        question.hints = [
            "± is read “plus or minus”.",
            "It records two values on one line rather than writing the equation out twice."
        ];
        question.steps = [
            "±" + n + " is read “plus or minus " + n + "”.",
            "It stands for the two values " + n + " and " + signed(-n) + ".",
            "So x is " + n + " or " + signed(-n) + "."
        ];
        question.summaryLine = "Reading ±" + n;
        question.printLine = "What does x = ±" + n + " record?";
        return base(question, "Reading plus or minus", "Choose what this line records.");
    }

    /* --------------------------------------------- solving x squared = k */

    function fillSolveTwo(question, rng, tools) {
        const n = tools.randomInt(rng, 3, 15);
        const value = n * n;
        question.factKey = "st-" + n;
        question.contextKey = "plain";
        question.given = "x² = " + value;
        question.givenLabel = "Solve";
        question.mode = "choice";
        question.choiceLegend = "What is x?";
        const picked = chooseFour([
            { text: "x = ±" + n, note: "Correct. Both " + n + " and " + signed(-n) + " square to " + value + "." },
            { text: "x = " + n, note: signed(-n) + " squares to " + value + " too, so one solution is missing." },
            { text: "x = " + signed(-n), note: n + " squares to " + value + " too, so one solution is missing." },
            { text: "x = " + (value / 2), note: "That halves " + value + ". " + (value / 2) + " squared is " + ((value / 2) * (value / 2)) + "." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = "x = ±" + n;
        question.hints = [
            "The equation asks for every number that squares to " + value + ".",
            "A number and its negative have the same square, so look for two."
        ];
        question.steps = [
            "x² = " + value + " asks which numbers square to " + value + ".",
            n + " × " + n + " = " + value + " and (" + MINUS + n + ") × (" + MINUS + n + ") = " + value + ".",
            "Both answer it, so x = ±" + n + "."
        ];
        question.summaryLine = "Solving x² = " + value;
        question.printLine = "Solve x² = " + value + ".";
        return base(question, "Solve the equation", "Solve this equation, giving every value of x.");
    }

    function fillSolveZero(question, rng, tools) {
        question.factKey = "sz";
        question.contextKey = "plain";
        question.given = "x² = 0";
        question.givenLabel = "Solve";
        question.answerKind = "integer";
        question.answerLabel = "The value of x";
        question.expected = 0;
        question.answerShown = "0";
        question.correctNote = "Correct. 0 is its own negative, so the two values fall together on 0.";
        question.misses = [
            { value: 1, text: "1 squared is 1, not 0. Only 0 squares to 0." },
            { value: 2, text: "2 squared is 4, not 0." }
        ];
        question.hints = [
            "Which number multiplied by itself gives 0?",
            "± separates two values, and 0 has nothing to separate it from."
        ];
        question.steps = [
            "x² = 0 asks which numbers square to 0.",
            "0 × 0 = 0, and no other number squares to 0.",
            "0 is its own negative, so there is one solution: x = 0."
        ];
        question.summaryLine = "Solving x² = 0";
        question.printLine = "Solve x² = 0.";
        return base(question, "The single solution", "Solve this equation.");
    }

    function fillSolveNegative(question, rng, tools) {
        const k = tools.randomInt(rng, 2, 60);
        question.factKey = "sn-" + k;
        question.contextKey = "plain";
        question.given = "x² = " + MINUS + k;
        question.givenLabel = "Solve";
        question.mode = "choice";
        question.choiceLegend = "What is x?";
        const near = Math.round(Math.sqrt(k)) || 1;
        const picked = chooseFour([
            { text: "No number on the line", note: "Correct. A square has two equal factors carrying the same sign, so the product is never negative." },
            { text: "x = " + signed(-near), note: "(" + MINUS + near + ")² = " + (near * near) + ", which is positive, not " + MINUS + k + "." },
            { text: "x = ±" + near, note: "Squaring either of those gives a positive value, not " + MINUS + k + "." },
            { text: "x = " + MINUS + (k / 2), note: "Squaring that gives a positive value. No number on the line squares to a negative." },
            { text: "x = 0", note: "0 squares to 0, not to " + MINUS + k + "." },
            { text: "x = " + MINUS + k, note: "Squaring " + MINUS + k + " gives " + (k * k) + ", which is positive." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = "No number on the line";
        question.hints = [
            "Think about the two factors a square is made of.",
            "They carry the same sign, so their product is positive or zero."
        ];
        question.steps = [
            "A square is a number multiplied by itself.",
            "Its two factors carry the same sign, so the product is positive or zero.",
            "No number on the number line squares to " + MINUS + k + "."
        ];
        question.summaryLine = "Solving x² = " + MINUS + k;
        question.printLine = "Solve x² = " + MINUS + k + ".";
        return base(question, "When there is none", "Solve this equation.");
    }

    function fillSolveAndCheck(question, rng, tools) {
        const n = tools.randomInt(rng, 3, 15);
        const value = n * n;
        question.factKey = "sc-" + n;
        question.contextKey = "plain";
        question.given = "x² = " + value + ", and x is negative";
        question.givenLabel = "Solve";
        question.answerKind = "integer";
        question.answerLabel = "The value of x";
        question.expected = -n;
        question.answerShown = signed(-n);
        question.correctNote = "Correct. Squaring " + signed(-n) + " returns " + value + ".";
        question.misses = [
            { value: n, text: "That squares to " + value + ", but the question asks for the negative solution." },
            { value: -value, text: "Squaring " + signed(-value) + " gives a far larger number than " + value + "." }
        ];
        question.hints = [
            "Two numbers square to " + value + ".",
            "The question names which of the two it wants."
        ];
        question.steps = [
            "x² = " + value + " is answered by " + n + " and " + signed(-n) + ".",
            "The question asks for the negative one.",
            "So x = " + signed(-n) + ", and (" + MINUS + n + ") × (" + MINUS + n + ") = " + value + " checks it."
        ];
        question.summaryLine = "The negative solution of x² = " + value;
        question.printLine = "Solve x² = " + value + ", where x is negative.";
        return base(question, "The solution asked for", "Solve this equation, giving the value the question asks for.");
    }

    const FILLERS = {
        "other-root": fillOtherRoot,
        "square-a-negative": fillSquareANegative,
        "which-pair": fillWhichPair,
        "count-solutions": fillCountSolutions,
        "principal-root": fillPrincipalRoot,
        "negative-of-a-root": fillNegativeOfARoot,
        "sign-or-equation": fillSignOrEquation,
        "plus-minus-means": fillPlusMinusMeans,
        "solve-two": fillSolveTwo,
        "solve-zero": fillSolveZero,
        "solve-negative": fillSolveNegative,
        "solve-and-check": fillSolveAndCheck
    };

    const api = scope.PracticeEngine.create({
        stages: STAGES,
        lessonUrl: LESSON_URL,
        families: FAMILIES,
        fillers: FILLERS,
        notes: {
            integer: "These answers are whole numbers, so this one has no decimal part. Read the squares of 1 to 15 backwards.",
            fallback: "Not yet. Check your answer by squaring it, and remember that a number and its negative have the same square."
        }
    });

    scope.PositiveAndNegativeRootsPractice = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
