/* Practice: order of operations review.

   Thirteen questions, not twelve: the fluency stage runs to five because a
   review has more shapes to visit before the reasoning stages begin. The
   engine takes its stage sizes from the families listed here.

   The round ends on a line where working from the left gives a plausible wrong
   answer, which is the whole reason an agreed order exists. */
(function (scope) {
    "use strict";

    const DIR = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/directedNumber/";
    const LESSONS = {
        order: { label: "Order of operations", url: DIR + "orderOfOperations.html" },
        checking: { label: "Checking an answer with the inverse operation", url: DIR + "checkingWithInverses.html" },
        reordering: { label: "Reordering a calculation", url: DIR + "reorderingACalculation.html" }
    };

    const TIMES = "×";
    const DIVIDE = "÷";
    const MINUS = "−";

    const STAGES = [
        { name: "Working in the agreed order", lessons: [LESSONS.order] },
        { name: "Reordering safely", lessons: [LESSONS.reordering] },
        { name: "Checking the result", lessons: [LESSONS.checking] }
    ];

    const FAMILIES = [
        ["bidmas-index", "bidmas-brackets", "bidmas-bar", "bidmas-root", "bidmas-same-rank"],
        ["valid-regrouping", "evaluate-regrouped", "term-keeps-its-sign", "cancel-before-multiplying"],
        ["which-check", "check-a-product", "check-with-remainder", "left-to-right-trap"]
    ];

    function inline(text, aria) { return { kind: "inline", text: text, ariaLabel: aria }; }
    function expr(parts, aria, flat) { return { kind: "expr", parts: parts, ariaLabel: aria, flat: flat || null }; }
    const txt = function (v) { return { t: "text", v: String(v) }; };
    const pow = function (b, i) { return { t: "power", b: String(b), i: String(i) }; };
    const rt = function (r, grouped) { return { t: "root", r: String(r), grouped: Boolean(grouped) }; };
    /* A computed number interpolated straight into copy brings a plain ASCII
       hyphen with it, and the site writes a minus as U+2212. */
    function signed(v) { return v < 0 ? MINUS + Math.abs(v) : String(v); }
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

    /* -------------------------------------- working in the agreed order */

    function fillBidmasIndex(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 20);
        const b = tools.randomInt(rng, 2, 6);
        const c = tools.randomInt(rng, 2, 6);
        const answer = a + b * c * c;
        question.factKey = "bi-" + a + "-" + b + "-" + c;
        question.contextKey = "plain";
        question.display = expr([txt(a + " + " + b + " " + TIMES + " "), pow(c, 2)],
            a + " plus " + b + " times " + c + " squared", a + " + " + b + " " + TIMES + " " + c + "^2");
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. The power goes first, then the multiplication, then the addition.";
        question.misses = [
            { value: a + Math.pow(b * c, 2), text: "The index sits on the " + c + " alone, so only the " + c + " is squared: " + (c * c) + "." },
            { value: (a + b) * c * c, text: "Adding comes last here. " + b + " " + TIMES + " " + (c * c) + " = " + (b * c * c) + " is settled before the " + a + " joins it." },
            { value: a + b * c * 2, text: "An index of 2 means " + c + " " + TIMES + " " + c + ", not " + c + " " + TIMES + " 2." }
        ];
        question.hints = [
            "Powers rank above multiplying, which ranks above adding.",
            c + " squared is " + (c * c) + ". That is what multiplies the " + b + "."
        ];
        question.steps = [
            "The power is worked first: " + c + " " + TIMES + " " + c + " = " + (c * c) + ".",
            "Then the multiplication: " + b + " " + TIMES + " " + (c * c) + " = " + (b * c * c) + ".",
            "Then the addition: " + a + " + " + (b * c * c) + " = " + answer + "."
        ];
        question.summaryLine = a + " + " + b + " " + TIMES + " " + c + " squared";
        question.printLine = "Work out " + a + " + " + b + " " + TIMES + " " + c + "^2.";
        return base(question, "A power inside a longer line", "Work out this calculation.");
    }

    function fillBidmasBrackets(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 12);
        const b = tools.randomInt(rng, 2, 12);
        const c = tools.randomInt(rng, 2, 8);
        const d = tools.randomInt(rng, 2, 20);
        const answer = (a + b) * c - d;
        question.factKey = "bb-" + a + "-" + b + "-" + c + "-" + d;
        question.contextKey = "plain";
        question.display = inline("(" + a + " + " + b + ") " + TIMES + " " + c + " " + MINUS + " " + d,
            "open bracket " + a + " plus " + b + " close bracket times " + c + " minus " + d);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = signed(answer);
        question.correctNote = "Correct. The bracket first, then the multiplication, then the subtraction.";
        question.misses = [
            { value: (a + b) * (c - d), text: "The " + d + " is outside the bracket, so it is taken away after the multiplication." },
            { value: a + b * c - d, text: "The brackets gather " + a + " + " + b + " = " + (a + b) + " before anything multiplies it." }
        ];
        question.hints = [
            "Brackets rank above everything else in this line.",
            a + " + " + b + " = " + (a + b) + ", and that whole amount is multiplied by " + c + "."
        ];
        question.steps = [
            "The bracket is worked first: " + a + " + " + b + " = " + (a + b) + ".",
            "Then the multiplication: " + (a + b) + " " + TIMES + " " + c + " = " + ((a + b) * c) + ".",
            "Then the subtraction: " + ((a + b) * c) + " " + MINUS + " " + d + " = " + signed(answer) + "."
        ];
        question.summaryLine = "(" + a + " + " + b + ") " + TIMES + " " + c + " " + MINUS + " " + d;
        question.printLine = "Work out (" + a + " + " + b + ") " + TIMES + " " + c + " " + MINUS + " " + d + ".";
        return base(question, "A bracket, a product and a difference", "Work out this calculation.");
    }

    function fillBidmasBar(question, rng, tools) {
        const bottom = tools.randomInt(rng, 2, 9);
        const answer = tools.randomInt(rng, 2, 12);
        const top = bottom * answer;
        const b = tools.randomInt(rng, 1, top - 1);
        const a = top - b;
        const d = tools.randomInt(rng, 1, 9);
        const c = bottom + d;
        question.factKey = "bbar-" + a + "-" + b + "-" + c + "-" + d;
        question.contextKey = "plain";
        question.display = inline("(" + a + " + " + b + ") " + DIVIDE + " (" + c + " " + MINUS + " " + d + ")",
            "open bracket " + a + " plus " + b + " close bracket divided by open bracket " + c + " minus " + d + " close bracket");
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. Each grouping is gathered first, and " + top + " " + DIVIDE + " " + bottom + " = " + answer + ".";
        question.misses = [
            { value: top - bottom, text: "The two gathered amounts are divided, not subtracted: " + top + " " + DIVIDE + " " + bottom + "." },
            { value: top, text: "That is the amount above the bar, before it is divided by " + bottom + "." }
        ];
        question.hints = [
            "A bar written between two amounts groups each of them, exactly as brackets do.",
            a + " + " + b + " = " + top + " and " + c + " " + MINUS + " " + d + " = " + bottom + "."
        ];
        question.steps = [
            "Each grouping is worked first.",
            a + " + " + b + " = " + top + " and " + c + " " + MINUS + " " + d + " = " + bottom + ".",
            top + " " + DIVIDE + " " + bottom + " = " + answer + "."
        ];
        question.summaryLine = "(" + a + " + " + b + ") " + DIVIDE + " (" + c + " " + MINUS + " " + d + ")";
        question.printLine = "Work out (" + a + " + " + b + ") " + DIVIDE + " (" + c + " " + MINUS + " " + d + ").";
        return base(question, "A grouping above and below", "Work out this calculation.");
    }

    function fillBidmasRoot(question, rng, tools) {
        const draw = tools.pick([[9, 16, 5], [36, 64, 10], [25, 144, 13], [81, 144, 15], [16, 9, 5], [64, 36, 10]], rng);
        const a = draw[0];
        const b = draw[1];
        const root = draw[2];
        const c = tools.randomInt(rng, 2, 9);
        const answer = root * c;
        question.factKey = "br-" + a + "-" + b + "-" + c;
        question.contextKey = "plain";
        question.display = expr([rt(a + " + " + b, true), txt(" " + TIMES + " " + c)],
            "the square root of open bracket " + a + " plus " + b + " close bracket, times " + c,
            "√(" + a + " + " + b + ") " + TIMES + " " + c);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. The bar groups the sum, the root is taken, and the multiplication follows.";
        question.misses = [
            { value: (Math.sqrt(a) + Math.sqrt(b)) * c, text: "That roots each number separately. The bar covers the whole sum, so " + a + " + " + b + " = " + (a + b) + " is rooted." },
            { value: root, text: "That is the root on its own, before it is multiplied by " + c + "." },
            { value: a + b * c, text: "The root sign groups " + a + " + " + b + " and is worked before the multiplication." }
        ];
        question.hints = [
            "The bar over the numbers says how far the root reaches.",
            a + " + " + b + " = " + (a + b) + ", and the root of that multiplies the " + c + "."
        ];
        question.steps = [
            "The bar groups the sum, so the addition is worked first: " + a + " + " + b + " = " + (a + b) + ".",
            "The square root of " + (a + b) + " is " + root + ".",
            root + " " + TIMES + " " + c + " = " + answer + "."
        ];
        question.summaryLine = "The root of " + a + " + " + b + ", times " + c;
        question.printLine = "Work out √(" + a + " + " + b + ") " + TIMES + " " + c + ".";
        return base(question, "A root inside a longer line", "Work out this calculation.");
    }

    function fillBidmasSameRank(question, rng, tools) {
        const c = tools.randomInt(rng, 2, 9);
        const q = tools.randomInt(rng, 2, 9);
        const b = c * q;
        /* a is a multiple of c, so subtracting first also lands on a whole
           number and the slip this question is about can actually be typed. */
        const a = c * (q + tools.randomInt(rng, 2, 10));
        const d = tools.randomInt(rng, 2, 15);
        const answer = a - b / c + d;
        question.factKey = "bsr-" + a + "-" + b + "-" + c + "-" + d;
        question.contextKey = "plain";
        question.display = inline(a + " " + MINUS + " " + b + " " + DIVIDE + " " + c + " + " + d,
            a + " minus " + b + " divided by " + c + " plus " + d);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. The division goes first, then the adding and subtracting from the left.";
        question.misses = [
            { value: a - (q + d), text: "Adding and subtracting have the same strength, so the " + a + " " + MINUS + " " + q + " on the left is worked before the " + d + " is added." },
            { value: (a - b) / c + d, text: "Dividing outranks subtracting, so " + b + " " + DIVIDE + " " + c + " = " + q + " is settled first." }
        ];
        question.hints = [
            "One operation here outranks the other two. Which?",
            "After " + b + " " + DIVIDE + " " + c + " = " + q + ", the rest is worked from the left."
        ];
        question.steps = [
            "Dividing outranks adding and subtracting: " + b + " " + DIVIDE + " " + c + " = " + q + ".",
            "The line is now " + a + " " + MINUS + " " + q + " + " + d + ", worked from the left.",
            a + " " + MINUS + " " + q + " = " + (a - q) + ", and " + (a - q) + " + " + d + " = " + answer + "."
        ];
        question.summaryLine = a + " " + MINUS + " " + b + " " + DIVIDE + " " + c + " + " + d;
        question.printLine = "Work out " + a + " " + MINUS + " " + b + " " + DIVIDE + " " + c + " + " + d + ".";
        return base(question, "Three operations in one line", "Work out this calculation.");
    }

    /* --------------------------------------------------- reordering safely */

    function fillValidRegrouping(question, rng, tools) {
        const pair = tools.pick([[4, 25], [2, 50], [5, 20], [8, 125], [4, 250]], rng);
        const a = pair[0];
        const c = pair[1];
        /* Two of the four options are orderings of the same three numbers, so b
           matching c would draw the same line twice. And if b pairs roundly with
           a or with c as well, two orderings are equally easy and the question
           no longer has one answer. */
        let b = tools.randomInt(rng, 11, 39);
        const lonely = function (value) {
            return value !== c && (a * value) % 100 !== 0 && (value * c) % 100 !== 0;
        };
        for (let attempt = 0; attempt < 10 && !lonely(b); attempt += 1) {
            b = tools.randomInt(rng, 11, 39);
        }
        if (!lonely(b)) b = 13;
        const round = a * c;
        question.factKey = "vr-" + a + "-" + b + "-" + c;
        question.contextKey = "structure";
        question.given = a + " " + TIMES + " " + b + " " + TIMES + " " + c;
        question.givenLabel = "The calculation";
        question.mode = "choice";
        question.choiceLegend = "Which reordering makes this easiest to do in the head?";
        const picked = chooseFour([
            { text: a + " " + TIMES + " " + c + " " + TIMES + " " + b, note: "Correct. " + a + " " + TIMES + " " + c + " = " + round + ", which leaves a multiplication by " + round + "." },
            { text: a + " " + TIMES + " " + b + " " + TIMES + " " + c, note: "That is the order as written, which needs " + (a * b) + " " + TIMES + " " + c + " set out." },
            { text: b + " " + TIMES + " " + c + " " + TIMES + " " + a, note: "That is a valid reordering, but " + b + " " + TIMES + " " + c + " is no easier than the line as written." },
            { text: a + " " + TIMES + " " + b + " " + DIVIDE + " " + c, note: "That changes a multiplication into a division, so it is a different calculation." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = a + " " + TIMES + " " + c + " " + TIMES + " " + b;
        question.hints = [
            "All but one of these are the same calculation. Look for the pair that makes a round number.",
            a + " " + TIMES + " " + c + " = " + round + "."
        ];
        question.steps = [
            "Multiplying gives the same product whichever order the numbers are taken in.",
            a + " " + TIMES + " " + c + " = " + round + ", which is a round number.",
            "So writing " + a + " " + TIMES + " " + c + " " + TIMES + " " + b + " leaves only a multiplication by " + round + "."
        ];
        question.summaryLine = "Reordering " + a + " " + TIMES + " " + b + " " + TIMES + " " + c;
        question.printLine = "Which reordering of " + a + " " + TIMES + " " + b + " " + TIMES + " " + c + " is easiest to do in the head?";
        return base(question, "Choosing the easier order", "Choose the reordering that makes it mental.");
    }

    function fillEvaluateRegrouped(question, rng, tools) {
        const pair = tools.pick([[4, 25], [2, 50], [5, 20], [20, 5], [50, 2]], rng);
        const a = pair[0];
        const c = pair[1];
        const b = tools.randomInt(rng, 12, 89);
        const answer = a * b * c;
        question.factKey = "er-" + a + "-" + b + "-" + c;
        question.contextKey = "plain";
        question.display = inline(a + " " + TIMES + " " + b + " " + TIMES + " " + c,
            a + " times " + b + " times " + c);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. Taking " + a + " " + TIMES + " " + c + " = " + (a * c) + " first leaves a multiplication by " + (a * c) + ".";
        question.misses = [
            { value: a * b + c, text: "All three numbers are multiplied together here." },
            { value: a + b + c, text: "The numbers are multiplied, not added." }
        ];
        question.hints = [
            "Two of these three numbers make a round number together.",
            a + " " + TIMES + " " + c + " = " + (a * c) + ", and " + b + " is left to multiply by it."
        ];
        question.steps = [
            "The numbers may be taken in any order, each keeping the sign in front of it.",
            a + " " + TIMES + " " + c + " = " + (a * c) + ".",
            (a * c) + " " + TIMES + " " + b + " = " + answer + "."
        ];
        question.summaryLine = a + " " + TIMES + " " + b + " " + TIMES + " " + c;
        question.printLine = "Work out " + a + " " + TIMES + " " + b + " " + TIMES + " " + c + ".";
        return base(question, "Three numbers multiplied", "Work out this calculation.");
    }

    function fillTermKeepsItsSign(question, rng, tools) {
        const a = tools.randomInt(rng, 21, 79);
        const c = 100 - a;
        /* a + c − b matches a + b − c when b equals c, and matches b − a + c
           when b equals a, either of which gives the question two right
           answers. */
        let b = tools.randomInt(rng, 11, 49);
        for (let attempt = 0; attempt < 8 && (b === c || b === a); attempt += 1) {
            b = tools.randomInt(rng, 11, 49);
        }
        if (b === c || b === a) b = b > 12 ? b - 2 : b + 2;
        const answer = a - b + c;
        question.factKey = "tks-" + a + "-" + b;
        question.contextKey = "structure";
        question.given = a + " " + MINUS + " " + b + " + " + c;
        question.givenLabel = "The calculation";
        question.mode = "choice";
        question.choiceLegend = "Which reordering gives the same answer?";
        const picked = chooseFour([
            { text: a + " + " + c + " " + MINUS + " " + b, note: "Correct. Each number keeps the sign in front of it, so the " + MINUS + " travels with the " + b + "." },
            { text: a + " + " + b + " " + MINUS + " " + c, note: "That swaps which number is taken away, which changes the answer to " + signed(a + b - c) + "." },
            { text: a + " " + MINUS + " (" + b + " + " + c + ")", note: "That adds a bracket that was never there, taking " + (b + c) + " away instead." },
            { text: b + " " + MINUS + " " + a + " + " + c, note: "That takes the " + a + " away instead of starting from it, giving " + signed(b - a + c) + "." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = a + " + " + c + " " + MINUS + " " + b;
        question.hints = [
            "A number moves with the sign written in front of it, and never without it.",
            "The " + a + " and the " + c + " are both being added, so they can meet."
        ];
        question.steps = [
            "The line adds " + a + ", takes " + b + " and adds " + c + ".",
            "Those three instructions may be carried out in any order, each keeping its sign.",
            a + " + " + c + " " + MINUS + " " + b + " is the same calculation, and " + a + " + " + c + " = 100 makes it mental."
        ];
        question.summaryLine = "Reordering " + a + " " + MINUS + " " + b + " + " + c;
        question.printLine = "Which reordering of " + a + " " + MINUS + " " + b + " + " + c + " gives the same answer?";
        return base(question, "Reordering a sum", "Choose the reordering that keeps the answer.");
    }

    function fillCancelBeforeMultiplying(question, rng, tools) {
        const c = tools.randomInt(rng, 3, 9);
        const k = tools.randomInt(rng, 2, 9);
        const a = c * k;
        const b = tools.randomInt(rng, 11, 29);
        const answer = k * b;
        question.factKey = "cbm-" + a + "-" + b + "-" + c;
        question.contextKey = "plain";
        question.display = inline(a + " " + TIMES + " " + b + " " + DIVIDE + " " + c,
            a + " times " + b + " divided by " + c);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. Bringing the " + DIVIDE + " " + c + " forward gives " + a + " " + DIVIDE + " " + c + " = " + k + " and keeps the numbers small.";
        question.misses = [
            { value: a * b, text: "That is the product before the division: " + (a * b) + " " + DIVIDE + " " + c + " = " + answer + "." },
            { value: k, text: "That is " + a + " " + DIVIDE + " " + c + " on its own. The " + b + " still has to multiply it." }
        ];
        question.hints = [
            "Multiplying and dividing rank the same, so a factor may be moved with its own sign.",
            a + " " + DIVIDE + " " + c + " = " + k + ", which is a smaller number to multiply by " + b + "."
        ];
        question.steps = [
            "The " + DIVIDE + " " + c + " may be brought forward to meet the " + a + ".",
            a + " " + DIVIDE + " " + c + " = " + k + ".",
            k + " " + TIMES + " " + b + " = " + answer + "."
        ];
        question.summaryLine = a + " " + TIMES + " " + b + " " + DIVIDE + " " + c;
        question.printLine = "Work out " + a + " " + TIMES + " " + b + " " + DIVIDE + " " + c + ".";
        return base(question, "A product and a division", "Work out this calculation.");
    }

    /* --------------------------------------------------- checking the result */

    function fillWhichCheck(question, rng, tools) {
        const b = tools.randomInt(rng, 13, 39);
        /* Two of the distractors are c ÷ b and b ÷ c, which are one line when
           the two match. */
        let c = tools.randomInt(rng, 12, 48);
        if (c === b) c = c === 48 ? 47 : c + 1;
        const a = b * c;
        question.factKey = "wc-" + a + "-" + b;
        question.contextKey = "structure";
        question.given = a + " " + DIVIDE + " " + b + " = " + c;
        question.givenLabel = "The result to test";
        question.mode = "choice";
        question.choiceLegend = "Which calculation checks it?";
        const picked = chooseFour([
            { text: c + " " + TIMES + " " + b, note: "Correct. Multiplying undoes dividing, and it starts from the answer." },
            { text: c + " " + DIVIDE + " " + b, note: "That divides the answer again, which undoes nothing." },
            { text: a + " " + TIMES + " " + b, note: "That starts from the number the division began with, not from the answer." },
            { text: b + " " + DIVIDE + " " + c, note: "That divides the two numbers the answer came from, which tests nothing about the answer itself." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = c + " " + TIMES + " " + b;
        question.hints = [
            "A check starts from the answer and applies the operation that undoes the original.",
            "Dividing is undone by multiplying."
        ];
        question.steps = [
            "The answer being tested is " + c + ".",
            "Dividing is undone by multiplying, so the check multiplies by the " + b + ".",
            c + " " + TIMES + " " + b + " = " + a + ", which is where the division started."
        ];
        question.summaryLine = "Which check tests " + a + " " + DIVIDE + " " + b + " = " + c;
        question.printLine = "Which calculation checks " + a + " " + DIVIDE + " " + b + " = " + c + "?";
        return base(question, "Picking the check", "Choose the calculation that tests the result.");
    }

    function fillCheckAProduct(question, rng, tools) {
        const b = tools.randomInt(rng, 12, 29);
        const c = tools.randomInt(rng, 13, 39);
        const a = b * c;
        question.factKey = "cap-" + a + "-" + b;
        question.contextKey = "plain";
        question.given = b + " " + TIMES + " " + c + " = " + a;
        question.givenLabel = "The result to test";
        question.display = inline(a + " " + DIVIDE + " " + b, a + " divided by " + b);
        question.answerKind = "integer";
        question.answerLabel = "The check comes to";
        question.expected = c;
        question.answerShown = String(c);
        question.correctNote = "Correct. The other number comes back, so the product holds.";
        question.misses = [
            { value: a - b, text: "Dividing undoes multiplying, so the check is " + a + " " + DIVIDE + " " + b + "." },
            { value: b, text: "The check divides by " + b + ", so what comes back is the other number, " + c + "." }
        ];
        question.hints = [
            "Dividing undoes multiplying, and the check starts from the answer.",
            "Divide " + a + " by " + b + " and see whether " + c + " comes back."
        ];
        question.steps = [
            "Multiplying is undone by dividing.",
            "The check starts from the answer " + a + " and divides by " + b + ".",
            a + " " + DIVIDE + " " + b + " = " + c + ", which is the other number, so the product holds."
        ];
        question.summaryLine = "Checking " + b + " " + TIMES + " " + c + " = " + a;
        question.printLine = "Check " + b + " " + TIMES + " " + c + " = " + a + " by working out " + a + " " + DIVIDE + " " + b + ".";
        return base(question, "A product to test", "Work out the check.");
    }

    function fillCheckWithRemainder(question, rng, tools) {
        const b = tools.randomInt(rng, 4, 9);
        const q = tools.randomInt(rng, 6, 19);
        const r = tools.randomInt(rng, 1, b - 1);
        const a = b * q + r;
        question.factKey = "cwr-" + a + "-" + b;
        question.contextKey = "plain";
        question.given = a + " " + DIVIDE + " " + b + " = " + q + " r " + r;
        question.givenLabel = "The result to test";
        question.display = inline(q + " " + TIMES + " " + b + " + " + r, q + " times " + b + " plus " + r);
        question.answerKind = "integer";
        question.answerLabel = "The check comes to";
        question.expected = a;
        question.answerShown = String(a);
        question.correctNote = "Correct. Both pieces of the answer go back in, and the check lands on " + a + ".";
        question.misses = [
            { value: b * q, text: "That leaves the remainder out. It is part of the answer, so it goes back in too." },
            { value: (q + r) * b, text: "The remainder is added after the multiplication: " + q + " " + TIMES + " " + b + " = " + (b * q) + ", then + " + r + "." }
        ];
        question.hints = [
            "The answer has two pieces, and a complete check uses both.",
            "Multiply the whole groups back, then add the remainder on."
        ];
        question.steps = [
            "The answer is " + q + " whole groups with " + r + " left over.",
            q + " " + TIMES + " " + b + " = " + (b * q) + " puts the groups back.",
            (b * q) + " + " + r + " = " + a + ", which is where the division started."
        ];
        question.summaryLine = "Checking " + a + " " + DIVIDE + " " + b + " = " + q + " r " + r;
        question.printLine = "Check " + a + " " + DIVIDE + " " + b + " = " + q + " r " + r + " by working out " + q + " " + TIMES + " " + b + " + " + r + ".";
        return base(question, "A division with a remainder", "Work out the check.");
    }

    function fillLeftToRightTrap(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 12);
        const b = tools.randomInt(rng, 3, 9);
        const c = tools.randomInt(rng, 2, 9);
        const answer = a + b * c;
        const fromLeft = (a + b) * c;
        question.factKey = "ltr-" + a + "-" + b + "-" + c;
        question.contextKey = "plain";
        question.display = inline(a + " + " + b + " " + TIMES + " " + c, a + " plus " + b + " times " + c);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. Working from the left would give " + fromLeft + ", which is why the order is agreed rather than left to chance.";
        question.misses = [
            { value: fromLeft, text: "That works straight from the left. Multiplying outranks adding, so " + b + " " + TIMES + " " + c + " = " + (b * c) + " is settled first." },
            { value: a + b + c, text: "The " + b + " and the " + c + " are multiplied: " + b + " " + TIMES + " " + c + " = " + (b * c) + "." },
            { value: a * b * c, text: "Only the " + b + " and the " + c + " are multiplied. The " + a + " is added to their product." }
        ];
        question.hints = [
            "Reading left to right is not the same as working left to right.",
            "Multiplying outranks adding, so one part of this line is settled before the other."
        ];
        question.steps = [
            "Multiplying is worked before adding, whatever the order on the page.",
            b + " " + TIMES + " " + c + " = " + (b * c) + ".",
            a + " + " + (b * c) + " = " + answer + ", where working from the left would have given " + fromLeft + "."
        ];
        question.summaryLine = a + " + " + b + " " + TIMES + " " + c;
        question.printLine = "Work out " + a + " + " + b + " " + TIMES + " " + c + ".";
        return base(question, "A sum and a product", "Work out this calculation.");
    }

    const FILLERS = {
        "bidmas-index": fillBidmasIndex, "bidmas-brackets": fillBidmasBrackets,
        "bidmas-bar": fillBidmasBar, "bidmas-root": fillBidmasRoot, "bidmas-same-rank": fillBidmasSameRank,
        "valid-regrouping": fillValidRegrouping, "evaluate-regrouped": fillEvaluateRegrouped,
        "term-keeps-its-sign": fillTermKeepsItsSign, "cancel-before-multiplying": fillCancelBeforeMultiplying,
        "which-check": fillWhichCheck, "check-a-product": fillCheckAProduct,
        "check-with-remainder": fillCheckWithRemainder, "left-to-right-trap": fillLeftToRightTrap
    };

    function renderDisplay(host, display, element) {
        const SVG = "http://www.w3.org/2000/svg";
        display.parts.forEach(function (part) {
            if (part.t === "text") { host.appendChild(document.createTextNode(part.v)); return; }
            if (part.t === "power") {
                const holder = element("span", "practice-power");
                holder.appendChild(document.createTextNode(part.b));
                const caret = element("span", "caret", "^");
                caret.setAttribute("aria-hidden", "true");
                holder.appendChild(caret);
                holder.appendChild(element("sup", "", part.i));
                host.appendChild(holder);
                return;
            }
            const rad = element("span", "rad");
            const caret = element("span", "caret", part.grouped ? "√(" : "√");
            caret.setAttribute("aria-hidden", "true");
            rad.appendChild(caret);
            const svg = document.createElementNS(SVG, "svg");
            svg.setAttribute("class", "rad__sign");
            svg.setAttribute("viewBox", "0 0 24 40");
            svg.setAttribute("aria-hidden", "true");
            svg.setAttribute("focusable", "false");
            const path = document.createElementNS(SVG, "path");
            path.setAttribute("d", "M.5 24H5l5.5 13.5L22 1.5H24");
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", "currentColor");
            path.setAttribute("stroke-width", "3");
            path.setAttribute("stroke-linejoin", "miter");
            path.setAttribute("stroke-linecap", "butt");
            svg.appendChild(path);
            rad.appendChild(svg);
            rad.appendChild(element("span", "rad__over", part.r));
            host.appendChild(rad);
            if (part.grouped) {
                const close = element("span", "caret", ")");
                close.setAttribute("aria-hidden", "true");
                host.appendChild(close);
            }
        });
    }

    const api = scope.PracticeEngine.create({
        stages: STAGES, lessonUrl: LESSONS.order.url, families: FAMILIES, fillers: FILLERS,
        renderDisplay: renderDisplay,
        notes: {
            integer: "Every answer on this page is a whole number.",
            fallback: "Not yet. Settle brackets first, then powers and roots, then multiplying and dividing, then adding and subtracting, working from the left within each rank."
        }
    });

    scope.OrderOfOperationsReviewPractice = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
