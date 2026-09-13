/* Practice: negatives review.

   A mixed round across the three negative-number lessons. Its stages name
   several lessons rather than sections of one, so the reflection offers a link
   per lesson instead of a deep link into a single page.

   The round ends on the pair the lesson warns about: (−2)⁴ against −2⁴, where
   a remembered rule about even indices gives the wrong sign for one of them. */
(function (scope) {
    "use strict";

    const DIR = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/directedNumber/";
    const LESSONS = {
        adding: { label: "Adding and subtracting negative numbers", url: DIR + "addingSubtractingNegatives.html" },
        multiplying: { label: "Multiplying and dividing negative numbers", url: DIR + "multiplyingDividingNegatives.html" },
        powers: { label: "Powers of a negative number", url: DIR + "powersOfNegatives.html" }
    };

    const MINUS = "−";
    const TIMES = "×";
    const DIVIDE = "÷";

    const STAGES = [
        { name: "Adding and subtracting", lessons: [LESSONS.adding] },
        { name: "Multiplying and dividing", lessons: [LESSONS.multiplying] },
        { name: "Powers, and in context", lessons: [LESSONS.powers, LESSONS.adding] }
    ];

    const FAMILIES = [
        ["double-sign", "decimal-double-sign", "gap-across-zero", "three-term-chain"],
        ["sign-chain", "quotient-of-negatives", "mixed-times-divide", "which-is-positive"],
        ["bracketed-power", "bare-power", "power-pair-choice", "temperature-drop"]
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
    function expr(parts, aria) { return { kind: "expr", parts: parts, ariaLabel: aria, flat: null }; }
    const txt = function (v) { return { t: "text", v: String(v) }; };
    const pow = function (b, i) { return { t: "power", b: String(b), i: String(i) }; };
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

    /* ------------------------------------------ adding and subtracting */

    function fillDoubleSign(question, rng, tools) {
        const a = tools.randomInt(rng, 3, 14);
        const b = tools.randomInt(rng, 2, 11);
        const answer = -a + b;
        question.factKey = "dsg-" + a + "-" + b;
        question.contextKey = "plain";
        question.display = inline(neg(a) + " " + MINUS + " " + br(b), "negative " + a + " minus negative " + b);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = b - a;
        question.answerShown = signed(b - a);
        question.correctNote = "Correct. Taking away a negative moves to the right, so " + b + " is added to " + neg(a) + ".";
        question.misses = [
            { value: -(a + b), text: "Two signs meet here and turn the move round: taking away " + neg(b) + " adds " + b + "." },
            { value: a - b, text: "The size is right. The move starts at " + neg(a) + ", so it ends at " + signed(b - a) + "." }
        ];
        question.hints = [
            "Read the two signs between the numbers together before moving.",
            "Taking away " + neg(b) + " is the same as adding " + b + "."
        ];
        question.steps = [
            "The minus and the negative sign meet between the numbers.",
            "Taking away " + neg(b) + " is the same as adding " + b + ".",
            neg(a) + " + " + b + " = " + signed(b - a) + "."
        ];
        question.summaryLine = neg(a) + " " + MINUS + " " + br(b);
        question.printLine = "Work out " + neg(a) + " " + MINUS + " " + br(b) + ".";
        return base(question, "Two signs meeting", "Work out this calculation.");
    }

    function fillDecimalDoubleSign(question, rng, tools) {
        const a = tenths(rng, tools, 15, 89);
        const b = tenths(rng, tools, 12, 69);
        const answer = tidy(a + b);
        question.factKey = "dds-" + a + "-" + b;
        question.contextKey = "plain";
        question.display = inline(a + " " + MINUS + " " + br(b), a + " minus negative " + b);
        question.answerKind = "decimal";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. The decimal changes nothing about the two signs.";
        question.misses = [
            { value: tidy(a - b), text: "That subtracts " + b + ". The two signs meet and turn the move round, so " + b + " is added." }
        ];
        question.hints = [
            "The decimal makes no difference to what the two signs do together.",
            "Taking away " + neg(b) + " is the same as adding " + b + "."
        ];
        question.steps = [
            "The two signs meet between the numbers.",
            "Taking away " + neg(b) + " is the same as adding " + b + ".",
            a + " + " + b + " = " + answer + "."
        ];
        question.summaryLine = a + " " + MINUS + " " + br(b);
        question.printLine = "Work out " + a + " " + MINUS + " " + br(b) + ".";
        return base(question, "Two signs, in decimals", "Work out this calculation.");
    }

    function fillGapAcrossZero(question, rng, tools) {
        const low = tools.randomInt(rng, 3, 15);
        const high = tools.randomInt(rng, 2, 14);
        const answer = low + high;
        question.factKey = "gaz-" + low + "-" + high;
        question.contextKey = "plain";
        question.given = neg(low) + " and " + high;
        question.givenLabel = "The two numbers";
        question.answerKind = "integer";
        question.answerLabel = "The gap";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. " + low + " up to zero and " + high + " on from it makes " + answer + ".";
        question.misses = [
            { value: Math.abs(high - low), text: "That takes one size from the other. The gap runs " + low + " up to zero and " + high + " more above it." },
            { value: -answer, text: "A gap is a distance, so it has no sign. The two numbers are " + answer + " apart." }
        ];
        question.hints = [
            "Count the gap in two pieces: up to zero, then on from zero.",
            neg(low) + " is " + low + " below zero, and " + high + " is " + high + " above it."
        ];
        question.steps = [
            neg(low) + " sits " + low + " below zero.",
            high + " sits " + high + " above zero.",
            low + " + " + high + " = " + answer + ", so the numbers are " + answer + " apart."
        ];
        question.summaryLine = "Gap between " + neg(low) + " and " + high;
        question.printLine = "How far apart are " + neg(low) + " and " + high + "?";
        return base(question, "A gap through zero", "How far apart are these two numbers?");
    }

    function fillThreeTermChain(question, rng, tools) {
        const a = tools.randomInt(rng, 4, 18);
        const b = tools.randomInt(rng, 2, 12);
        const c = tools.randomInt(rng, 2, 12);
        const answer = a - b - c;
        question.factKey = "ttc-" + a + "-" + b + "-" + c;
        question.contextKey = "plain";
        question.display = inline(a + " " + MINUS + " " + b + " " + MINUS + " " + c,
            a + " minus " + b + " minus " + c);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = signed(answer);
        question.correctNote = "Correct. Both moves go left, and the line is worked from the left.";
        question.misses = [
            { value: a - b + c, text: "Both numbers are being taken away, so both moves go in the same direction." },
            { value: a + b + c, text: "Both signs are minus signs, so the moves go left from " + a + "." }
        ];
        question.hints = [
            "Subtracting twice moves left twice from the starting number.",
            a + " " + MINUS + " " + b + " = " + signed(a - b) + " comes first, then " + c + " more is taken."
        ];
        question.steps = [
            "Adding and subtracting have the same strength, so work from the left.",
            a + " " + MINUS + " " + b + " = " + signed(a - b) + ".",
            signed(a - b) + " " + MINUS + " " + c + " = " + signed(answer) + "."
        ];
        question.summaryLine = a + " " + MINUS + " " + b + " " + MINUS + " " + c;
        question.printLine = "Work out " + a + " " + MINUS + " " + b + " " + MINUS + " " + c + ".";
        return base(question, "Two subtractions in a line", "Work out this calculation.");
    }

    /* ----------------------------------------- multiplying and dividing */

    function fillSignChain(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 6);
        const b = tools.randomInt(rng, 2, 6);
        const c = tools.randomInt(rng, 2, 5);
        const size = a * b * c;
        question.factKey = "sch-" + a + "-" + b + "-" + c;
        question.contextKey = "plain";
        question.display = inline(br(a) + " " + TIMES + " " + b + " " + TIMES + " " + br(c),
            "negative " + a + " times " + b + " times negative " + c);
        question.answerKind = "integer";
        question.answerLabel = "The product";
        question.expected = size;
        question.answerShown = String(size);
        question.correctNote = "Correct. Two negatives in the chain pair off, so the product is positive.";
        question.misses = [
            { value: -size, text: "There are two negative numbers here, and an even count makes the product positive." }
        ];
        question.hints = [
            "The size comes from " + a + " " + TIMES + " " + b + " " + TIMES + " " + c + ".",
            "Count the negative numbers in the chain before deciding the sign."
        ];
        question.steps = [
            a + " " + TIMES + " " + b + " " + TIMES + " " + c + " = " + size + " gives the size.",
            "Two of the three numbers are negative.",
            "An even count of negatives makes the product positive, so the answer is " + size + "."
        ];
        question.summaryLine = "A chain with two negatives";
        question.printLine = "Work out " + br(a) + " " + TIMES + " " + b + " " + TIMES + " " + br(c) + ".";
        return base(question, "A chain of three", "Work out this product.");
    }

    function fillQuotientOfNegatives(question, rng, tools) {
        const b = tools.randomInt(rng, 2, 8);
        const answer = tenths(rng, tools, 12, 59);
        const top = tidy(b * answer);
        question.factKey = "qon-" + top + "-" + b;
        question.contextKey = "plain";
        question.display = inline(neg(top) + " " + DIVIDE + " " + b, "negative " + top + " divided by " + b);
        question.answerKind = "decimal";
        question.answerLabel = "The quotient";
        question.expected = -answer;
        question.answerShown = neg(answer);
        question.correctNote = "Correct. One negative number makes the quotient negative.";
        question.misses = [
            { value: answer, text: "The size is right. One of the two numbers is negative, so the quotient is negative." }
        ];
        question.hints = [
            "Divide the sizes first: " + top + " " + DIVIDE + " " + b + ".",
            "Then count the negatives. There is one."
        ];
        question.steps = [
            top + " " + DIVIDE + " " + b + " = " + answer + " gives the size.",
            "One of the two numbers is negative.",
            "One negative makes the quotient negative, so it is " + neg(answer) + "."
        ];
        question.summaryLine = neg(top) + " " + DIVIDE + " " + b;
        question.printLine = "Work out " + neg(top) + " " + DIVIDE + " " + b + ".";
        return base(question, "A quotient in decimals", "Work out this quotient.");
    }

    function fillMixedTimesDivide(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 9);
        const c = tools.randomInt(rng, 2, 6);
        const b = tools.randomInt(rng, 2, 8);
        question.factKey = "mtd-" + a + "-" + b + "-" + c;
        question.contextKey = "plain";
        question.display = inline(br(a * c) + " " + DIVIDE + " " + c + " " + TIMES + " " + br(b),
            "negative " + (a * c) + " divided by " + c + " times negative " + b);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = a * b;
        question.answerShown = String(a * b);
        question.correctNote = "Correct. Two negatives across the line pair off, so the answer is positive.";
        question.misses = [
            { value: -(a * b), text: "There are two negative numbers in the line, and an even count makes the answer positive." }
        ];
        question.hints = [
            "Multiplying and dividing have the same strength, so work from the left.",
            "Every negative in the line counts, whether it is multiplied or divided by."
        ];
        question.steps = [
            neg(a * c) + " " + DIVIDE + " " + c + " = " + neg(a) + ".",
            neg(a) + " " + TIMES + " " + br(b) + " has two negatives, so it is positive.",
            "The answer is " + (a * b) + "."
        ];
        question.summaryLine = "Dividing then multiplying";
        question.printLine = "Work out " + br(a * c) + " " + DIVIDE + " " + c + " " + TIMES + " " + br(b) + ".";
        return base(question, "Dividing and multiplying together", "Work out this calculation.");
    }

    function fillWhichIsPositive(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 7);
        const b = tools.randomInt(rng, 2, 7);
        const c = tools.randomInt(rng, 2, 6);
        question.factKey = "wip-" + a + "-" + b + "-" + c;
        question.contextKey = "structure";
        question.mode = "choice";
        question.choiceLegend = "Which of these comes out positive?";
        const picked = chooseFour([
            { text: br(a) + " " + DIVIDE + " " + br(b), note: "Correct. Two negatives pair off, so the quotient is positive." },
            { text: br(a) + " " + TIMES + " " + br(b) + " " + TIMES + " " + br(c), note: "Three negatives is an odd count, so the product is negative." },
            { text: neg(a) + " " + MINUS + " " + b, note: "Both moves go left from " + neg(a) + ", so the answer is below zero." },
            { text: a + " " + TIMES + " " + br(c), note: "One negative leaves the product negative." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = br(a) + " " + DIVIDE + " " + br(b);
        question.hints = [
            "Two of these are about counting negatives, and one is about moving along the line.",
            "For a product or a quotient, an even count of negatives gives a positive answer."
        ];
        question.steps = [
            "Adding and subtracting move along the line; multiplying and dividing count negatives.",
            br(a) + " " + DIVIDE + " " + br(b) + " holds two negatives, which is an even count.",
            "So that one, and only that one, comes out positive."
        ];
        question.summaryLine = "Which comes out positive";
        question.printLine = "Which of these comes out positive?";
        return base(question, "Sorting the four", "Choose the one that comes out positive.");
    }

    /* ------------------------------------------- powers, and in context */

    function fillBracketedPower(question, rng, tools) {
        const n = tools.randomInt(rng, 2, 6);
        const index = tools.pick([2, 4], rng);
        const value = Math.pow(n, index);
        question.factKey = "bp-" + n + "-" + index;
        question.contextKey = "plain";
        question.display = expr([pow("(" + neg(n) + ")", index)],
            "open bracket negative " + n + " close bracket to the power " + index);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = value;
        question.answerShown = String(value);
        question.correctNote = "Correct. The bracket puts the sign inside the power, and " + index + " negatives pair off.";
        question.misses = [
            { value: -value, text: "The bracket means " + index + " negatives are multiplied, and an even count makes the answer positive." },
            { value: n * index, text: "An index of " + index + " means " + n + " multiplied by itself " + index + " times, not " + n + " " + TIMES + " " + index + "." }
        ];
        question.hints = [
            "The bracket says what the index covers.",
            "The whole of " + neg(n) + " is multiplied by itself " + index + " times, so count " + index + " negatives."
        ];
        question.steps = [
            "The bracket puts the negative sign inside the power.",
            neg(n) + " is multiplied by itself " + index + " times, so there are " + index + " negatives.",
            "An even count gives a positive answer, and the size is " + value + "."
        ];
        question.summaryLine = "(" + neg(n) + ")^" + index;
        question.printLine = "Work out (" + neg(n) + ")^" + index + ".";
        return base(question, "A bracketed power", "Work out this power.");
    }

    function fillBarePower(question, rng, tools) {
        const n = tools.randomInt(rng, 2, 6);
        const index = tools.pick([2, 4], rng);
        const value = Math.pow(n, index);
        question.factKey = "up-" + n + "-" + index;
        question.contextKey = "plain";
        question.display = expr([txt(MINUS), pow(n, index)],
            "minus " + n + " to the power " + index);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = -value;
        question.answerShown = neg(value);
        question.correctNote = "Correct. With no bracket the index covers only the " + n + ", and the minus is applied afterwards.";
        question.misses = [
            { value: value, text: "There is no bracket here, so the index covers only the " + n + ". The minus stays outside and is applied to " + value + "." },
            { value: -(n * index), text: "An index of " + index + " means " + n + " multiplied by itself " + index + " times, not " + n + " " + TIMES + " " + index + "." }
        ];
        question.hints = [
            "Look at what the index is written against. Is the minus sign inside it?",
            "Without a bracket, the power is worked first and the minus applied to the result."
        ];
        question.steps = [
            "There is no bracket, so the index covers only the " + n + ".",
            n + " to the power " + index + " is " + value + ".",
            "The minus is applied to that, giving " + neg(value) + "."
        ];
        question.summaryLine = MINUS + n + "^" + index;
        question.printLine = "Work out " + MINUS + n + "^" + index + ".";
        return base(question, "A power with a minus in front", "Work out this power.");
    }

    function fillPowerPairChoice(question, rng, tools) {
        const n = tools.randomInt(rng, 2, 5);
        const index = tools.pick([2, 4], rng);
        const value = Math.pow(n, index);
        question.factKey = "ppc-" + n + "-" + index;
        question.contextKey = "structure";
        question.mode = "choice";
        question.choiceLegend = "Which statement is true?";
        const picked = chooseFour([
            { text: "(" + neg(n) + ")^" + index + " = " + value + " and " + MINUS + n + "^" + index + " = " + neg(value),
              note: "Correct. The bracket decides whether the sign is inside the power or applied after it." },
            { text: "Both come to " + value, note: "Only the bracketed one does. Without a bracket the index covers the " + n + " alone." },
            { text: "Both come to " + neg(value), note: "Only the bare one does. The bracket puts the sign inside the power, where an even index cancels it." },
            { text: "(" + neg(n) + ")^" + index + " = " + neg(value) + " and " + MINUS + n + "^" + index + " = " + value,
              note: "That is the right pair of values with the two statements swapped." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = "(" + neg(n) + ")^" + index + " = " + value + " and " + MINUS + n + "^" + index + " = " + neg(value);
        question.hints = [
            "The two differ only by a bracket, and the bracket is what decides the sign.",
            "Ask what the index is written against in each one."
        ];
        question.steps = [
            "In (" + neg(n) + ")^" + index + " the bracket puts the sign inside, so " + index + " negatives are multiplied and pair off.",
            "In " + MINUS + n + "^" + index + " the index covers only the " + n + ", and the minus is applied afterwards.",
            "So the first is " + value + " and the second is " + neg(value) + "."
        ];
        question.summaryLine = "(" + neg(n) + ")^" + index + " against " + MINUS + n + "^" + index;
        question.printLine = "Which is true of (" + neg(n) + ")^" + index + " and " + MINUS + n + "^" + index + "?";
        return base(question, "Two powers that differ by a bracket", "Choose the true statement.");
    }

    function fillTemperatureDrop(question, rng, tools) {
        /* spoken as "the first start degrees", so never one */
        const start = tools.randomInt(rng, 2, 12);
        const drop = start + tools.randomInt(rng, 2, 14);
        const answer = start - drop;
        question.factKey = "td-" + start + "-" + drop;
        question.contextKey = "temperature";
        question.given = start + " °C, falling " + drop + " degrees";
        question.givenLabel = "The change";
        question.answerKind = "integer";
        question.answerLabel = "New temperature, in °C";
        question.expected = answer;
        question.answerShown = signed(answer);
        question.correctNote = "Correct. The fall passes zero and carries on " + Math.abs(answer) + " degrees below it.";
        question.misses = [
            { value: drop - start, text: "That takes the smaller from the larger. The temperature starts at " + start + " and falls " + drop + ", which passes zero." },
            { value: start + drop, text: "The temperature is falling, so the move goes down the scale from " + start + "." }
        ];
        question.hints = [
            "Start at " + start + " °C and move " + drop + " degrees down.",
            "The first " + start + " degrees reach zero, and " + (drop - start) + " more carry on below it."
        ];
        question.steps = [
            "The temperature starts at " + start + " °C and falls " + drop + " degrees.",
            "The first " + start + " degrees reach 0 °C.",
            "The remaining " + (drop - start) + " degrees carry on below zero, so the new temperature is " + signed(answer) + " °C."
        ];
        question.summaryLine = start + " °C falling " + drop + " degrees";
        question.printLine = "The temperature is " + start + " °C and falls " + drop + " degrees. What is the new temperature?";
        return base(question, "A fall past zero", "Work out the new temperature.");
    }

    const FILLERS = {
        "double-sign": fillDoubleSign, "decimal-double-sign": fillDecimalDoubleSign,
        "gap-across-zero": fillGapAcrossZero, "three-term-chain": fillThreeTermChain,
        "sign-chain": fillSignChain, "quotient-of-negatives": fillQuotientOfNegatives,
        "mixed-times-divide": fillMixedTimesDivide, "which-is-positive": fillWhichIsPositive,
        "bracketed-power": fillBracketedPower, "bare-power": fillBarePower,
        "power-pair-choice": fillPowerPairChoice, "temperature-drop": fillTemperatureDrop
    };

    function renderDisplay(host, display, element) {
        display.parts.forEach(function (part) {
            if (part.t === "text") { host.appendChild(document.createTextNode(part.v)); return; }
            const holder = element("span", "practice-power");
            holder.appendChild(document.createTextNode(part.b));
            const caret = element("span", "caret", "^");
            caret.setAttribute("aria-hidden", "true");
            holder.appendChild(caret);
            holder.appendChild(element("sup", "", part.i));
            host.appendChild(holder);
        });
    }

    const api = scope.PracticeEngine.create({
        stages: STAGES, lessonUrl: LESSONS.adding.url, families: FAMILIES, fillers: FILLERS,
        renderDisplay: renderDisplay,
        notes: {
            integer: "Every answer on this page is a whole number, and it may be negative.",
            fallback: "Not yet. Adding and subtracting move along the line; multiplying, dividing and powers are settled by counting the negatives."
        }
    });

    scope.NegativesReviewPractice = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
