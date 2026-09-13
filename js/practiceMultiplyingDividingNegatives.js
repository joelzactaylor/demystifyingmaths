/* Practice: multiplying and dividing negative numbers.

   The bank of twelve questions; js/practice-engine.js runs the round, marks it
   and drives the page. The generator half runs without a document so it can be
   fuzzed from Node.

   Size and sign are settled separately all the way through, because that is
   how the lesson settles them: the digits come from the ordinary table fact,
   and the sign comes from counting the negatives. */
(function (scope) {
    "use strict";

    const LESSON_URL = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/directedNumber/multiplyingDividingNegatives.html";
    const MINUS = "−";
    const TIMES = "×";
    const DIVIDE = "÷";

    const STAGES = [
        { name: "The sign of a product", lessonAnchor: "negative-times-positive" },
        { name: "The sign of a quotient", lessonAnchor: "dividing" },
        { name: "Counting the negatives", lessonAnchor: "longer-products" }
    ];

    const FAMILIES = [
        ["neg-times-pos", "neg-times-neg", "decimal-product", "missing-factor"],
        ["neg-div-pos", "neg-div-neg", "pos-div-neg", "decimal-quotient"],
        ["three-negatives", "four-negatives", "sign-choice", "mixed-chain"]
    ];

    function neg(v) { return MINUS + Math.abs(v); }
    function signed(v) { return v < 0 ? neg(v) : String(v); }
    function br(v) { return "(" + neg(v) + ")"; }
    function tidy(v) { return Math.round(v * 1000) / 1000; }
    /* A tenth that is really there. Dividing a plain draw by ten lands on a
       whole number whenever the draw is a multiple of ten, and a question
       announcing a decimal then shows none — one in five of them, for the
       quotient. */
    function tenths(rng, tools, lo, hi) {
        const n = tools.randomInt(rng, lo, hi);
        return (n % 10 === 0 ? n + 1 : n) / 10;
    }
    function inline(text, aria) { return { kind: "inline", text: text, ariaLabel: aria }; }
    function base(q, title, prompt) { q.title = title; q.prompt = prompt; return q; }

    function chooseFour(candidates, rng, tools) {
        const kept = [];
        candidates.forEach(function (c) {
            if (kept.length === 4) return;
            if (kept.some(function (h) { return h.text === c.text; })) return;
            kept.push(c);
        });
        const order = tools.shuffleIndexes(kept.length, rng);
        return {
            options: order.map(function (i) { return kept[i].text; }),
            optionNotes: order.map(function (i) { return kept[i].note; }),
            correctIndex: order.indexOf(0)
        };
    }

    /* A sentence used by nearly every question here, because the lesson settles
       the sign by counting rather than by a remembered pair of rules. */
    function countNote(howMany, positive) {
        return howMany + (howMany === 1 ? " negative number" : " negative numbers")
            + " makes the answer " + (positive ? "positive" : "negative") + ".";
    }

    /* --------------------------------------------- the sign of a product */

    function fillNegTimesPos(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 12);
        const b = tools.randomInt(rng, 2, 12);
        const answer = -a * b;
        question.factKey = "ntp-" + a + "-" + b;
        question.contextKey = "plain";
        question.display = inline(br(a) + " " + TIMES + " " + b, "negative " + a + " times " + b);
        question.answerKind = "integer";
        question.answerLabel = "The product";
        question.expected = answer;
        question.answerShown = signed(answer);
        question.correctNote = "Correct. " + a + " " + TIMES + " " + b + " = " + (a * b) + ", and " + countNote(1, false);
        question.misses = [
            { value: a * b, text: "The size is right. There is one negative number here, so the product is negative: " + signed(answer) + "." },
            { value: -(a + b), text: "That adds the two numbers. " + a + " " + TIMES + " " + b + " = " + (a * b) + ", so the product is " + signed(answer) + "." }
        ];
        question.hints = [
            "Work out the size first, from the ordinary table fact " + a + " " + TIMES + " " + b + ".",
            "Then count the negative numbers. There is one, so the answer sits below zero."
        ];
        question.steps = [
            "The size comes from " + a + " " + TIMES + " " + b + " = " + (a * b) + ".",
            "One of the two numbers is negative.",
            countNote(1, false) + " So " + br(a) + " " + TIMES + " " + b + " = " + signed(answer) + "."
        ];
        question.summaryLine = br(a) + " " + TIMES + " " + b;
        question.printLine = "Work out " + br(a) + " " + TIMES + " " + b + ".";
        return base(question, "One negative in a product", "Work out this product.");
    }

    function fillNegTimesNeg(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 12);
        const b = tools.randomInt(rng, 2, 12);
        const answer = a * b;
        question.factKey = "ntn-" + a + "-" + b;
        question.contextKey = "plain";
        question.display = inline(br(a) + " " + TIMES + " " + br(b), "negative " + a + " times negative " + b);
        question.answerKind = "integer";
        question.answerLabel = "The product";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. " + countNote(2, true);
        question.misses = [
            { value: -answer, text: "The size is right. There are two negative numbers here, and " + countNote(2, true) },
            { value: -(a + b), text: "That adds the two numbers and keeps a sign. " + a + " " + TIMES + " " + b + " = " + answer + ", and two negatives give a positive." }
        ];
        question.hints = [
            "The size comes from " + a + " " + TIMES + " " + b + ", whatever the signs are.",
            "Count the negative numbers before deciding the sign. There are two of them."
        ];
        question.steps = [
            "The size comes from " + a + " " + TIMES + " " + b + " = " + answer + ".",
            "Both numbers are negative, so there are two negatives in the product.",
            countNote(2, true) + " So " + br(a) + " " + TIMES + " " + br(b) + " = " + answer + "."
        ];
        question.summaryLine = br(a) + " " + TIMES + " " + br(b);
        question.printLine = "Work out " + br(a) + " " + TIMES + " " + br(b) + ".";
        return base(question, "Two negatives in a product", "Work out this product.");
    }

    function fillDecimalProduct(question, rng, tools) {
        const whole = tenths(rng, tools, 11, 49);
        const b = tools.randomInt(rng, 2, 9);
        const answer = tidy(-whole * b);
        question.factKey = "dp-" + whole + "-" + b;
        question.contextKey = "plain";
        question.display = inline(br(whole) + " " + TIMES + " " + b, "negative " + whole + " times " + b);
        question.answerKind = "decimal";
        question.answerLabel = "The product";
        question.expected = answer;
        question.answerShown = signed(answer);
        question.correctNote = "Correct. A decimal changes the size, not the counting of signs.";
        question.misses = [
            { value: tidy(whole * b), text: "The size is right. One negative number makes the product negative: " + signed(answer) + "." }
        ];
        question.hints = [
            "Multiply as though both numbers were positive: " + whole + " " + TIMES + " " + b + ".",
            "Then count the negatives. One negative makes the product negative."
        ];
        question.steps = [
            whole + " " + TIMES + " " + b + " = " + tidy(whole * b) + " gives the size.",
            "One of the numbers is negative.",
            countNote(1, false) + " So the product is " + signed(answer) + "."
        ];
        question.summaryLine = br(whole) + " " + TIMES + " " + b;
        question.printLine = "Work out " + br(whole) + " " + TIMES + " " + b + ".";
        return base(question, "A negative decimal", "Work out this product.");
    }

    function fillMissingFactor(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 12);
        const b = tools.randomInt(rng, 2, 12);
        const product = a * b;
        question.factKey = "mf-" + a + "-" + b;
        question.contextKey = "structure";
        question.given = br(a) + " " + TIMES + " ? = " + neg(product);
        question.givenLabel = "The statement";
        question.answerKind = "integer";
        question.answerLabel = "The missing number";
        question.expected = b;
        question.answerShown = String(b);
        question.correctNote = "Correct. The product is negative and one negative is already there, so the missing number is positive.";
        question.misses = [
            { value: -b, text: "That would give two negatives, and " + countNote(2, true) + " The product here is negative." },
            { value: product, text: "That is the product itself. The missing number multiplies with " + neg(a) + " to reach " + neg(product) + "." }
        ];
        question.hints = [
            "The size is settled by " + product + " " + DIVIDE + " " + a + ".",
            "The product is negative and one negative is already in the statement, so the missing number cannot be negative too."
        ];
        question.steps = [
            "The size of the missing number is " + product + " " + DIVIDE + " " + a + " = " + b + ".",
            "The product " + neg(product) + " is negative, so the statement must hold an odd number of negatives.",
            neg(a) + " is already one, so the missing number is positive: " + b + "."
        ];
        question.summaryLine = br(a) + " " + TIMES + " ? = " + neg(product);
        question.printLine = "What number goes in the gap? " + br(a) + " " + TIMES + " ? = " + neg(product);
        return base(question, "The number that completes it", "Work out the missing number.");
    }

    /* -------------------------------------------- the sign of a quotient */

    function fillNegDivPos(question, rng, tools) {
        const b = tools.randomInt(rng, 2, 12);
        const answer = tools.randomInt(rng, 2, 12);
        const top = b * answer;
        question.factKey = "ndp-" + top + "-" + b;
        question.contextKey = "plain";
        question.display = inline(neg(top) + " " + DIVIDE + " " + b, "negative " + top + " divided by " + b);
        question.answerKind = "integer";
        question.answerLabel = "The quotient";
        question.expected = -answer;
        question.answerShown = neg(answer);
        question.correctNote = "Correct. " + top + " " + DIVIDE + " " + b + " = " + answer + ", and " + countNote(1, false);
        question.misses = [
            { value: answer, text: "The size is right. One negative number makes the quotient negative: " + neg(answer) + "." }
        ];
        question.hints = [
            "Divide the sizes first: " + top + " " + DIVIDE + " " + b + ".",
            "Then count the negatives. There is one, so the quotient is negative."
        ];
        question.steps = [
            top + " " + DIVIDE + " " + b + " = " + answer + " gives the size.",
            "One of the two numbers is negative.",
            countNote(1, false) + " So " + neg(top) + " " + DIVIDE + " " + b + " = " + neg(answer) + "."
        ];
        question.summaryLine = neg(top) + " " + DIVIDE + " " + b;
        question.printLine = "Work out " + neg(top) + " " + DIVIDE + " " + b + ".";
        return base(question, "Dividing a negative", "Work out this quotient.");
    }

    function fillNegDivNeg(question, rng, tools) {
        const b = tools.randomInt(rng, 2, 12);
        const answer = tools.randomInt(rng, 2, 12);
        const top = b * answer;
        question.factKey = "ndn-" + top + "-" + b;
        question.contextKey = "plain";
        question.display = inline(neg(top) + " " + DIVIDE + " " + br(b), "negative " + top + " divided by negative " + b);
        question.answerKind = "integer";
        question.answerLabel = "The quotient";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. " + countNote(2, true);
        question.misses = [
            { value: -answer, text: "The size is right, but both numbers are negative, and " + countNote(2, true) }
        ];
        question.hints = [
            "Divide the sizes first: " + top + " " + DIVIDE + " " + b + ".",
            "Both numbers are negative, so count two negatives before choosing the sign."
        ];
        question.steps = [
            top + " " + DIVIDE + " " + b + " = " + answer + " gives the size.",
            "Both numbers are negative.",
            countNote(2, true) + " So " + neg(top) + " " + DIVIDE + " " + br(b) + " = " + answer + "."
        ];
        question.summaryLine = neg(top) + " " + DIVIDE + " " + br(b);
        question.printLine = "Work out " + neg(top) + " " + DIVIDE + " " + br(b) + ".";
        return base(question, "A negative divided by a negative", "Work out this quotient.");
    }

    function fillPosDivNeg(question, rng, tools) {
        const b = tools.randomInt(rng, 2, 12);
        const answer = tools.randomInt(rng, 2, 12);
        const top = b * answer;
        question.factKey = "pdn-" + top + "-" + b;
        question.contextKey = "plain";
        question.display = inline(top + " " + DIVIDE + " " + br(b), top + " divided by negative " + b);
        question.answerKind = "integer";
        question.answerLabel = "The quotient";
        question.expected = -answer;
        question.answerShown = neg(answer);
        question.correctNote = "Correct. The negative is on the dividing number, and one negative still makes the quotient negative.";
        question.misses = [
            { value: answer, text: "The size is right. It makes no difference which of the two numbers carries the sign: one negative gives a negative quotient." }
        ];
        question.hints = [
            "Divide the sizes first: " + top + " " + DIVIDE + " " + b + ".",
            "It makes no difference which number carries the negative sign. Count how many there are."
        ];
        question.steps = [
            top + " " + DIVIDE + " " + b + " = " + answer + " gives the size.",
            "One of the two numbers is negative, and it does not matter which.",
            countNote(1, false) + " So " + top + " " + DIVIDE + " " + br(b) + " = " + neg(answer) + "."
        ];
        question.summaryLine = top + " " + DIVIDE + " " + br(b);
        question.printLine = "Work out " + top + " " + DIVIDE + " " + br(b) + ".";
        return base(question, "Dividing by a negative", "Work out this quotient.");
    }

    function fillDecimalQuotient(question, rng, tools) {
        const b = tools.randomInt(rng, 2, 8);
        /* The line has to show a decimal, not only produce one: b × answer
           lands on a whole number whenever the tenths cancel, and the note
           about the decimal then has nothing to point at. */
        let answer = tenths(rng, tools, 11, 59);
        for (let attempt = 0; attempt < 8 && Number.isInteger(b * answer); attempt += 1) {
            answer = tenths(rng, tools, 11, 59);
        }
        if (Number.isInteger(b * answer)) answer = tidy(answer + 0.1);
        const top = tidy(b * answer);
        question.factKey = "dq-" + top + "-" + b;
        question.contextKey = "plain";
        question.display = inline(neg(top) + " " + DIVIDE + " " + br(b), "negative " + top + " divided by negative " + b);
        question.answerKind = "decimal";
        question.answerLabel = "The quotient";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. The decimal changes the size, not the count of negatives.";
        question.misses = [
            { value: -answer, text: "The size is right. Both numbers are negative, and " + countNote(2, true) }
        ];
        question.hints = [
            "Divide the sizes first: " + top + " " + DIVIDE + " " + b + ".",
            "Both numbers carry a negative sign, so there are two to count."
        ];
        question.steps = [
            top + " " + DIVIDE + " " + b + " = " + answer + " gives the size.",
            "Both numbers are negative.",
            countNote(2, true) + " So the quotient is " + answer + "."
        ];
        question.summaryLine = neg(top) + " " + DIVIDE + " " + br(b);
        question.printLine = "Work out " + neg(top) + " " + DIVIDE + " " + br(b) + ".";
        return base(question, "A quotient in decimals", "Work out this quotient.");
    }

    /* ------------------------------------------- counting the negatives */

    function fillThreeNegatives(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 6);
        const b = tools.randomInt(rng, 2, 6);
        const c = tools.randomInt(rng, 2, 5);
        const size = a * b * c;
        question.factKey = "3n-" + a + "-" + b + "-" + c;
        question.contextKey = "plain";
        question.display = inline(br(a) + " " + TIMES + " " + br(b) + " " + TIMES + " " + br(c),
            "negative " + a + " times negative " + b + " times negative " + c);
        question.answerKind = "integer";
        question.answerLabel = "The product";
        question.expected = -size;
        question.answerShown = neg(size);
        question.correctNote = "Correct. Three is an odd count, so the product stays negative.";
        question.misses = [
            { value: size, text: "The first two negatives give a positive, and the third turns it back: three negatives leave the product negative." },
            { value: -(a + b + c), text: "That adds the three numbers. Multiplying gives " + a + " " + TIMES + " " + b + " " + TIMES + " " + c + " = " + size + "." }
        ];
        question.hints = [
            "Work out the size from " + a + " " + TIMES + " " + b + " " + TIMES + " " + c + " first.",
            "Then count the negatives. An odd count leaves the product negative."
        ];
        question.steps = [
            a + " " + TIMES + " " + b + " " + TIMES + " " + c + " = " + size + " gives the size.",
            "There are three negative numbers in the product.",
            countNote(3, false) + " So the product is " + neg(size) + "."
        ];
        question.summaryLine = "Three negatives multiplied";
        question.printLine = "Work out " + br(a) + " " + TIMES + " " + br(b) + " " + TIMES + " " + br(c) + ".";
        return base(question, "Three negatives", "Work out this product.");
    }

    function fillFourNegatives(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 5);
        const b = tools.randomInt(rng, 2, 5);
        const c = tools.randomInt(rng, 2, 4);
        const d = tools.randomInt(rng, 2, 4);
        const size = a * b * c * d;
        question.factKey = "4n-" + a + "-" + b + "-" + c + "-" + d;
        question.contextKey = "plain";
        question.display = inline(br(a) + " " + TIMES + " " + br(b) + " " + TIMES + " " + br(c) + " " + TIMES + " " + br(d),
            "negative " + a + " times negative " + b + " times negative " + c + " times negative " + d);
        question.answerKind = "integer";
        question.answerLabel = "The product";
        question.expected = size;
        question.answerShown = String(size);
        question.correctNote = "Correct. Four is an even count, so the negatives pair off and the product is positive.";
        question.misses = [
            { value: -size, text: "The size is right. Four negatives pair off into two positives, so the product is positive." }
        ];
        question.hints = [
            "The size comes from " + a + " " + TIMES + " " + b + " " + TIMES + " " + c + " " + TIMES + " " + d + ".",
            "Count the negatives rather than working left to right: there are four."
        ];
        question.steps = [
            a + " " + TIMES + " " + b + " " + TIMES + " " + c + " " + TIMES + " " + d + " = " + size + " gives the size.",
            "There are four negative numbers in the product.",
            countNote(4, true) + " So the product is " + size + "."
        ];
        question.summaryLine = "Four negatives multiplied";
        question.printLine = "Work out " + br(a) + " " + TIMES + " " + br(b) + " " + TIMES + " " + br(c) + " " + TIMES + " " + br(d) + ".";
        return base(question, "Four negatives", "Work out this product.");
    }

    function fillSignChoice(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 7);
        const b = tools.randomInt(rng, 2, 7);
        const c = tools.randomInt(rng, 2, 6);
        question.factKey = "sc-" + a + "-" + b + "-" + c;
        question.contextKey = "structure";
        question.mode = "choice";
        question.choiceLegend = "Which of these products is positive?";
        const picked = chooseFour([
            { text: br(a) + " " + TIMES + " " + br(b), note: "Correct. Two negatives pair off, so the product is positive." },
            { text: br(a) + " " + TIMES + " " + b, note: "One negative leaves the product negative." },
            { text: br(a) + " " + TIMES + " " + br(b) + " " + TIMES + " " + br(c), note: "Three negatives is an odd count, so the product is negative." },
            { text: a + " " + TIMES + " " + br(c), note: "One negative leaves the product negative." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = br(a) + " " + TIMES + " " + br(b);
        question.hints = [
            "The sizes do not matter here. Only the number of negative signs does.",
            "Count the negatives in each option. An even count gives a positive product."
        ];
        question.steps = [
            "The sign of a product depends only on how many negative numbers it holds.",
            "An even count makes the product positive, and an odd count makes it negative.",
            "Only " + br(a) + " " + TIMES + " " + br(b) + " holds an even number of negatives, so only that product is positive."
        ];
        question.summaryLine = "Which product is positive";
        question.printLine = "Which of these products is positive?";
        return base(question, "Counting without multiplying", "Choose the product that comes out positive.");
    }

    function fillMixedChain(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 9);
        const b = tools.randomInt(rng, 2, 6);
        const c = tools.randomInt(rng, 2, 6);
        const size = a * b;
        question.factKey = "mc-" + a + "-" + b + "-" + c;
        question.contextKey = "plain";
        question.display = inline(br(a * c) + " " + DIVIDE + " " + br(c) + " " + TIMES + " " + br(b),
            "negative " + (a * c) + " divided by negative " + c + " times negative " + b);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = -size;
        question.answerShown = neg(size);
        question.correctNote = "Correct. Dividing and multiplying count signs the same way, and three negatives leave the answer negative.";
        question.misses = [
            { value: size, text: "There are three negative numbers across the whole line, which is an odd count, so the answer is negative." },
            { value: -(a * b * c), text: "The " + DIVIDE + " " + br(c) + " cancels the " + c + " in " + neg(a * c) + ", leaving " + a + " to multiply by " + b + "." }
        ];
        question.hints = [
            "Multiplying and dividing rank the same, so work from the left.",
            "Every negative number in the line counts, whether it is being multiplied or divided by."
        ];
        question.steps = [
            neg(a * c) + " " + DIVIDE + " " + br(c) + " = " + a + ", because two negatives make a positive.",
            a + " " + TIMES + " " + br(b) + " has one negative left, so it is negative.",
            "The answer is " + neg(size) + "."
        ];
        question.summaryLine = "A chain of dividing and multiplying";
        question.printLine = "Work out " + br(a * c) + " " + DIVIDE + " " + br(c) + " " + TIMES + " " + br(b) + ".";
        return base(question, "Dividing and multiplying together", "Work out this calculation.");
    }

    const FILLERS = {
        "neg-times-pos": fillNegTimesPos, "neg-times-neg": fillNegTimesNeg,
        "decimal-product": fillDecimalProduct, "missing-factor": fillMissingFactor,
        "neg-div-pos": fillNegDivPos, "neg-div-neg": fillNegDivNeg,
        "pos-div-neg": fillPosDivNeg, "decimal-quotient": fillDecimalQuotient,
        "three-negatives": fillThreeNegatives, "four-negatives": fillFourNegatives,
        "sign-choice": fillSignChoice, "mixed-chain": fillMixedChain
    };

    const api = scope.PracticeEngine.create({
        stages: STAGES, lessonUrl: LESSON_URL, families: FAMILIES, fillers: FILLERS,
        notes: {
            integer: "Every answer on this page is a whole number, and it may be negative.",
            fallback: "Not yet. Work out the size from the ordinary table fact, then count the negative numbers to settle the sign."
        }
    });

    scope.MultiplyingDividingNegativesPractice = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
