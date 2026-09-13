/* Practice: order of operations.

   The bank of twelve questions; js/practice-engine.js runs the round, marks it
   and drives the page. The generator half runs without a document so it can be
   fuzzed from Node.

   An expression here can hold a raised index or a root inside a longer line,
   which the engine's own "power" and "root" displays do not cover — those draw
   one mark on its own. So this bank draws its lines from a list of parts, and
   carries the clipped caret and root sign that keep the flattened text true. */
(function (scope) {
    "use strict";

    const LESSON_URL = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/directedNumber/orderOfOperations.html";
    const TIMES = "×";
    const DIVIDE = "÷";
    const MINUS = "−";

    const STAGES = [
        { name: "Which operation goes first", lessonAnchor: "two-answers" },
        { name: "What brackets move", lessonAnchor: "brackets" },
        { name: "Powers, roots and bars", lessonAnchor: "powers-first" }
    ];

    const FAMILIES = [
        ["times-before-add", "divide-before-subtract", "same-rank-left", "two-products"],
        ["brackets-first", "brackets-round-a-difference", "where-the-brackets-go", "bracket-then-divide"],
        ["power-before-times", "power-of-a-bracket", "root-of-a-sum", "bar-as-bracket"]
    ];

    function inline(text, aria) { return { kind: "inline", text: text, ariaLabel: aria }; }
    /* A line built from parts: plain text, a raised index, or a root. */
    function expr(parts, aria, flat) { return { kind: "expr", parts: parts, ariaLabel: aria, flat: flat }; }
    const txt = function (v) { return { t: "text", v: String(v) }; };
    const pow = function (b, i) { return { t: "power", b: String(b), i: String(i) }; };
    const rt = function (r, grouped) { return { t: "root", r: String(r), grouped: Boolean(grouped) }; };
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

    /* ------------------------------------- which operation goes first */

    function fillTimesBeforeAdd(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 15);
        const b = tools.randomInt(rng, 2, 9);
        const c = tools.randomInt(rng, 2, 9);
        const answer = a + b * c;
        question.factKey = "tba-" + a + "-" + b + "-" + c;
        question.contextKey = "plain";
        question.display = inline(a + " + " + b + " " + TIMES + " " + c, a + " plus " + b + " times " + c);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. " + b + " " + TIMES + " " + c + " = " + (b * c) + " is worked first, then added to " + a + ".";
        question.misses = [
            { value: (a + b) * c, text: "That adds first. Multiplying outranks adding, so " + b + " " + TIMES + " " + c + " = " + (b * c) + " happens before the " + a + " joins it." },
            { value: a + b + c, text: "The " + b + " and the " + c + " are multiplied, not added: " + b + " " + TIMES + " " + c + " = " + (b * c) + "." }
        ];
        question.hints = [
            "Multiplying outranks adding, so one part of this line is settled before the other.",
            b + " " + TIMES + " " + c + " = " + (b * c) + ". That is the amount added to " + a + "."
        ];
        question.steps = [
            "Multiplying is worked before adding.",
            b + " " + TIMES + " " + c + " = " + (b * c) + ".",
            a + " + " + (b * c) + " = " + answer + "."
        ];
        question.summaryLine = a + " + " + b + " " + TIMES + " " + c;
        question.printLine = "Work out " + a + " + " + b + " " + TIMES + " " + c + ".";
        return base(question, "A sum and a product", "Work out this calculation.");
    }

    function fillDivideBeforeSubtract(question, rng, tools) {
        const c = tools.randomInt(rng, 2, 9);
        const q = tools.randomInt(rng, 2, 9);
        const b = c * q;
        /* a is built so that subtracting first — the slip this question is
           about — also gives a whole number. Otherwise that answer can only
           ever be a decimal, and the reader meets the generic note about whole
           numbers instead of the observation that names the mistake. */
        const a = b + c * tools.randomInt(rng, 1, 6);
        const answer = a - q;
        question.factKey = "dbs-" + a + "-" + b + "-" + c;
        question.contextKey = "plain";
        question.display = inline(a + " " + MINUS + " " + b + " " + DIVIDE + " " + c, a + " minus " + b + " divided by " + c);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. " + b + " " + DIVIDE + " " + c + " = " + q + " is worked first, then taken from " + a + ".";
        question.misses = [
            { value: (a - b) / c, text: "That subtracts first. Dividing outranks subtracting, so " + b + " " + DIVIDE + " " + c + " = " + q + " is settled before the subtraction." },
            { value: a - b + c, text: "The " + b + " and the " + c + " are divided, not added and subtracted separately." }
        ];
        question.hints = [
            "Dividing outranks subtracting, so part of this line is settled first.",
            b + " " + DIVIDE + " " + c + " = " + q + ". That is the amount taken from " + a + "."
        ];
        question.steps = [
            "Dividing is worked before subtracting.",
            b + " " + DIVIDE + " " + c + " = " + q + ".",
            a + " " + MINUS + " " + q + " = " + answer + "."
        ];
        question.summaryLine = a + " " + MINUS + " " + b + " " + DIVIDE + " " + c;
        question.printLine = "Work out " + a + " " + MINUS + " " + b + " " + DIVIDE + " " + c + ".";
        return base(question, "A difference and a quotient", "Work out this calculation.");
    }

    function fillSameRankLeft(question, rng, tools) {
        const a = tools.randomInt(rng, 12, 40);
        const b = tools.randomInt(rng, 3, 11);
        const c = tools.randomInt(rng, 2, 9);
        const answer = a - b + c;
        question.factKey = "srl-" + a + "-" + b + "-" + c;
        question.contextKey = "plain";
        question.display = inline(a + " " + MINUS + " " + b + " + " + c, a + " minus " + b + " plus " + c);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. Adding and subtracting have the same strength, so the line is worked from the left.";
        question.misses = [
            { value: a - (b + c), text: "That adds " + b + " and " + c + " first and takes " + (b + c) + " from " + a + ". Neither sign outranks the other, so the " + a + " " + MINUS + " " + b + " on the left is worked first." },
            { value: a + b - c, text: "The " + b + " is being taken away and the " + c + " added, in that order from the left." }
        ];
        question.hints = [
            "Neither + nor " + MINUS + " outranks the other, so nothing here is settled by rank.",
            "Work from the left: " + a + " " + MINUS + " " + b + " = " + (a - b) + " comes first."
        ];
        question.steps = [
            "Adding and subtracting have the same strength, so the line is worked from the left.",
            a + " " + MINUS + " " + b + " = " + (a - b) + ".",
            (a - b) + " + " + c + " = " + answer + "."
        ];
        question.summaryLine = a + " " + MINUS + " " + b + " + " + c;
        question.printLine = "Work out " + a + " " + MINUS + " " + b + " + " + c + ".";
        return base(question, "Two signs of the same rank", "Work out this calculation.");
    }

    function fillTwoProducts(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 9);
        const b = tools.randomInt(rng, 2, 9);
        const c = tools.randomInt(rng, 2, 9);
        const d = tools.randomInt(rng, 2, 9);
        const answer = a * b + c * d;
        question.factKey = "tp-" + a + "-" + b + "-" + c + "-" + d;
        question.contextKey = "plain";
        question.display = inline(a + " " + TIMES + " " + b + " + " + c + " " + TIMES + " " + d,
            a + " times " + b + " plus " + c + " times " + d);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. Both products are settled before the addition joins them.";
        question.misses = [
            { value: a * (b + c) * d, text: "That works straight from the left. Both multiplications outrank the addition, so they are settled first." },
            { value: a * b * c * d, text: "The two products are added, not multiplied: " + (a * b) + " + " + (c * d) + "." }
        ];
        question.hints = [
            "There are two multiplications here, and both outrank the addition.",
            a + " " + TIMES + " " + b + " = " + (a * b) + " and " + c + " " + TIMES + " " + d + " = " + (c * d) + "."
        ];
        question.steps = [
            "Both multiplications are worked before the addition.",
            a + " " + TIMES + " " + b + " = " + (a * b) + " and " + c + " " + TIMES + " " + d + " = " + (c * d) + ".",
            (a * b) + " + " + (c * d) + " = " + answer + "."
        ];
        question.summaryLine = a + " " + TIMES + " " + b + " + " + c + " " + TIMES + " " + d;
        question.printLine = "Work out " + a + " " + TIMES + " " + b + " + " + c + " " + TIMES + " " + d + ".";
        return base(question, "Two products, one sum", "Work out this calculation.");
    }

    /* ---------------------------------------------- what brackets move */

    function fillBracketsFirst(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 12);
        const b = tools.randomInt(rng, 2, 12);
        const c = tools.randomInt(rng, 2, 9);
        const answer = (a + b) * c;
        question.factKey = "bf-" + a + "-" + b + "-" + c;
        question.contextKey = "plain";
        question.display = inline("(" + a + " + " + b + ") " + TIMES + " " + c,
            "open bracket " + a + " plus " + b + " close bracket times " + c);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. The brackets gather " + a + " + " + b + " = " + (a + b) + " before anything multiplies it.";
        question.misses = [
            { value: a + b * c, text: "That is the line without its brackets. The brackets make the addition happen first." },
            { value: a * c + b, text: "The brackets hold both numbers, so the whole of " + a + " + " + b + " is multiplied by " + c + "." }
        ];
        question.hints = [
            "The brackets say which part is gathered into one amount first.",
            a + " + " + b + " = " + (a + b) + ", and that whole amount is multiplied by " + c + "."
        ];
        question.steps = [
            "The brackets are worked first.",
            a + " + " + b + " = " + (a + b) + ".",
            (a + b) + " " + TIMES + " " + c + " = " + answer + "."
        ];
        question.summaryLine = "(" + a + " + " + b + ") " + TIMES + " " + c;
        question.printLine = "Work out (" + a + " + " + b + ") " + TIMES + " " + c + ".";
        return base(question, "A bracket and a product", "Work out this calculation.");
    }

    function fillBracketsRoundADifference(question, rng, tools) {
        const b = tools.randomInt(rng, 3, 12);
        const c = tools.randomInt(rng, 2, 9);
        const a = b + c + tools.randomInt(rng, 2, 20);
        const answer = a - (b + c);
        question.factKey = "brd-" + a + "-" + b + "-" + c;
        question.contextKey = "plain";
        question.display = inline(a + " " + MINUS + " (" + b + " + " + c + ")",
            a + " minus open bracket " + b + " plus " + c + " close bracket");
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. The brackets gather " + (b + c) + " into one amount, and all of it is taken from " + a + ".";
        question.misses = [
            { value: a - b + c, text: "That is the line without its brackets, which would take " + b + " away and then add " + c + ". The brackets take the whole " + (b + c) + " away." },
            { value: a + b + c, text: "The gathered amount is taken from " + a + ", not added to it." }
        ];
        question.hints = [
            "The brackets gather two numbers into one amount before the subtraction reaches them.",
            b + " + " + c + " = " + (b + c) + ", and that whole amount is taken from " + a + "."
        ];
        question.steps = [
            "The brackets are worked first.",
            b + " + " + c + " = " + (b + c) + ".",
            a + " " + MINUS + " " + (b + c) + " = " + answer + "."
        ];
        question.summaryLine = a + " " + MINUS + " (" + b + " + " + c + ")";
        question.printLine = "Work out " + a + " " + MINUS + " (" + b + " + " + c + ").";
        return base(question, "Brackets after a minus", "Work out this calculation.");
    }

    function fillWhereTheBracketsGo(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 9);
        const b = tools.randomInt(rng, 2, 9);
        /* The three distractors can land on the target by accident — a × (b + c)
           equals (a + b) × c whenever a and c match, and (a × b) + c can
           coincide too — which would give the question two right answers. Draw
           until the four lines hold four different values. */
        let c = tools.randomInt(rng, 2, 9);
        const distinct = function (value) {
            const seen = [(a + b) * value, a + b * value, a * (b + value), a * b + value];
            return new Set(seen).size === 4;
        };
        for (let attempt = 0; attempt < 8 && !distinct(c); attempt += 1) {
            c = tools.randomInt(rng, 2, 9);
        }
        if (!distinct(c)) { c = a === 3 ? 7 : 3; }
        const target = (a + b) * c;
        question.factKey = "wbg-" + a + "-" + b + "-" + c;
        question.contextKey = "structure";
        question.mode = "choice";
        question.choiceLegend = "Which line comes to " + target + "?";
        const picked = chooseFour([
            { text: "(" + a + " + " + b + ") " + TIMES + " " + c, note: "Correct. " + a + " + " + b + " = " + (a + b) + ", and " + (a + b) + " " + TIMES + " " + c + " = " + target + "." },
            { text: a + " + " + b + " " + TIMES + " " + c, note: "Without brackets the multiplying happens first, giving " + (a + b * c) + "." },
            { text: a + " " + TIMES + " (" + b + " + " + c + ")", note: "That gathers " + b + " + " + c + " = " + (b + c) + " instead, giving " + (a * (b + c)) + "." },
            { text: "(" + a + " " + TIMES + " " + b + ") + " + c, note: "That gathers the multiplication, which was going to happen first anyway, giving " + (a * b + c) + "." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = "(" + a + " + " + b + ") " + TIMES + " " + c;
        question.hints = [
            "Brackets are only worth writing where they change which operation goes first.",
            "To reach " + target + ", the addition has to be settled before the multiplication."
        ];
        question.steps = [
            "Without brackets, the multiplication would be worked first.",
            "A pair of brackets round " + a + " + " + b + " settles the addition first instead.",
            a + " + " + b + " = " + (a + b) + ", and " + (a + b) + " " + TIMES + " " + c + " = " + target + "."
        ];
        question.summaryLine = "Which line comes to " + target;
        question.printLine = "Which line comes to " + target + "?";
        return base(question, "Where the brackets belong", "Choose the line that reaches the stated answer.");
    }

    function fillBracketThenDivide(question, rng, tools) {
        const c = tools.randomInt(rng, 2, 9);
        /* Both parts of the bracket are multiples of c, so the line read
           without its brackets also lands on a whole number and the slip can
           actually be entered. */
        const n = tools.randomInt(rng, 1, 8);
        const m = tools.randomInt(rng, 1, 8);
        const a = c * n;
        const b = c * m;
        const inside = a + b;
        const answer = n + m;
        question.factKey = "btd-" + a + "-" + b + "-" + c;
        question.contextKey = "plain";
        question.display = inline("(" + a + " + " + b + ") " + DIVIDE + " " + c,
            "open bracket " + a + " plus " + b + " close bracket divided by " + c);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. The bracket gathers " + inside + " first, and " + inside + " " + DIVIDE + " " + c + " = " + answer + ".";
        question.misses = [
            { value: a + b / c, text: "That is the line without its brackets, which would divide only the " + b + "." },
            { value: inside, text: "That is the bracket on its own, before it is divided by " + c + "." }
        ];
        question.hints = [
            "The bracket gathers one amount before the division reaches it.",
            a + " + " + b + " = " + inside + ", and that whole amount is divided by " + c + "."
        ];
        question.steps = [
            "The brackets are worked first.",
            a + " + " + b + " = " + inside + ".",
            inside + " " + DIVIDE + " " + c + " = " + answer + "."
        ];
        question.summaryLine = "(" + a + " + " + b + ") " + DIVIDE + " " + c;
        question.printLine = "Work out (" + a + " + " + b + ") " + DIVIDE + " " + c + ".";
        return base(question, "A bracket, then a division", "Work out this calculation.");
    }

    /* ------------------------------------------- powers, roots and bars */

    function fillPowerBeforeTimes(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 9);
        const b = tools.randomInt(rng, 2, 7);
        const answer = a * b * b;
        question.factKey = "pbt-" + a + "-" + b;
        question.contextKey = "plain";
        question.display = expr([txt(a + " " + TIMES + " "), pow(b, 2)],
            a + " times " + b + " squared", a + " " + TIMES + " " + b + "^2");
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. The index covers only the " + b + ", so " + b + " " + TIMES + " " + b + " = " + (b * b) + " comes first.";
        question.misses = [
            { value: (a * b) * (a * b), text: "That squares the whole of " + a + " " + TIMES + " " + b + ". The index sits on the " + b + " alone, so only the " + b + " is squared." },
            { value: a * b * 2, text: "An index of 2 means " + b + " " + TIMES + " " + b + ", not " + b + " " + TIMES + " 2." }
        ];
        question.hints = [
            "The index sits against one number. Which number does it cover?",
            b + " squared is " + b + " " + TIMES + " " + b + " = " + (b * b) + ", and that is what multiplies " + a + "."
        ];
        question.steps = [
            "A power is worked before the multiplication around it.",
            "The index covers only the " + b + ", so " + b + " " + TIMES + " " + b + " = " + (b * b) + ".",
            a + " " + TIMES + " " + (b * b) + " = " + answer + "."
        ];
        question.summaryLine = a + " " + TIMES + " " + b + " squared";
        question.printLine = "Work out " + a + " " + TIMES + " " + b + "^2.";
        return base(question, "A product with an index", "Work out this calculation.");
    }

    function fillPowerOfABracket(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 9);
        const b = tools.randomInt(rng, 1, 8);
        const inside = a + b;
        const answer = inside * inside;
        question.factKey = "pob-" + a + "-" + b;
        question.contextKey = "plain";
        question.display = expr([pow("(" + a + " + " + b + ")", 2)],
            "open bracket " + a + " plus " + b + " close bracket squared", "(" + a + " + " + b + ")^2");
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. The index sits against the bracket, so the whole of " + inside + " is squared.";
        question.misses = [
            { value: a * a + b * b, text: "That squares each number separately. The index covers the bracket, so " + inside + " is the number being squared." },
            { value: inside, text: "That is the bracket before it is squared: " + inside + " " + TIMES + " " + inside + " = " + answer + "." }
        ];
        question.hints = [
            "The index sits against the bracket, not against either number inside it.",
            a + " + " + b + " = " + inside + ", and it is " + inside + " that gets squared."
        ];
        question.steps = [
            "The bracket is worked first.",
            a + " + " + b + " = " + inside + ".",
            inside + " " + TIMES + " " + inside + " = " + answer + "."
        ];
        question.summaryLine = "(" + a + " + " + b + ") squared";
        question.printLine = "Work out (" + a + " + " + b + ")^2.";
        return base(question, "A bracket with an index", "Work out this calculation.");
    }

    function fillRootOfASum(question, rng, tools) {
        const draw = tools.pick([[9, 16, 5], [16, 9, 5], [36, 64, 10], [64, 36, 10], [25, 144, 13],
            [144, 25, 13], [81, 144, 15], [144, 81, 15], [64, 225, 17]], rng);
        const a = draw[0];
        const b = draw[1];
        const answer = draw[2];
        question.factKey = "ros-" + a + "-" + b;
        question.contextKey = "plain";
        question.display = expr([rt(a + " + " + b, true)],
            "the square root of open bracket " + a + " plus " + b + " close bracket",
            "√(" + a + " + " + b + ")");
        question.answerKind = "integer";
        question.answerLabel = "The root";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. The bar reaches over both numbers, so " + a + " + " + b + " = " + (a + b) + " is rooted.";
        question.misses = [
            { value: Math.sqrt(a) + Math.sqrt(b), text: "That roots each number separately. The bar covers the whole sum, so the addition happens first." },
            { value: a + b, text: "That is the sum before it is rooted: the root of " + (a + b) + " is " + answer + "." }
        ];
        question.hints = [
            "The bar over the numbers says how far the root reaches.",
            "Add first: " + a + " + " + b + " = " + (a + b) + ", and then take the root."
        ];
        question.steps = [
            "The bar covers both numbers, so the addition is worked first.",
            a + " + " + b + " = " + (a + b) + ".",
            "The square root of " + (a + b) + " is " + answer + ", because " + answer + " " + TIMES + " " + answer + " = " + (a + b) + "."
        ];
        question.summaryLine = "The root of " + a + " + " + b;
        question.printLine = "Work out √(" + a + " + " + b + ").";
        return base(question, "A root over a sum", "Work out this square root.");
    }

    function fillBarAsBracket(question, rng, tools) {
        const bottom = tools.randomInt(rng, 2, 9);
        const answer = tools.randomInt(rng, 2, 9);
        const top = bottom * answer;
        const b = tools.randomInt(rng, 1, top - 1);
        const a = top - b;
        const d = tools.randomInt(rng, 1, 8);
        const c = bottom + d;
        question.factKey = "bab-" + a + "-" + b + "-" + c + "-" + d;
        question.contextKey = "plain";
        question.display = inline("(" + a + " + " + b + ") " + DIVIDE + " (" + c + " " + MINUS + " " + d + ")",
            "open bracket " + a + " plus " + b + " close bracket divided by open bracket " + c + " minus " + d + " close bracket");
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. Each bracket is gathered into one amount, and " + top + " " + DIVIDE + " " + bottom + " = " + answer + ".";
        question.misses = [
            { value: top - bottom, text: "That subtracts the two gathered amounts. The line divides one by the other: " + top + " " + DIVIDE + " " + bottom + "." },
            { value: top, text: "That is the amount on the left before it is divided by " + bottom + "." }
        ];
        question.hints = [
            "A written division like this holds one amount above and one below, and each is gathered first.",
            a + " + " + b + " = " + top + " and " + c + " " + MINUS + " " + d + " = " + bottom + "."
        ];
        question.steps = [
            "Each bracket is gathered into one amount before the division.",
            a + " + " + b + " = " + top + " and " + c + " " + MINUS + " " + d + " = " + bottom + ".",
            top + " " + DIVIDE + " " + bottom + " = " + answer + "."
        ];
        question.summaryLine = "(" + a + " + " + b + ") " + DIVIDE + " (" + c + " " + MINUS + " " + d + ")";
        question.printLine = "Work out (" + a + " + " + b + ") " + DIVIDE + " (" + c + " " + MINUS + " " + d + ").";
        return base(question, "A grouping on each side", "Work out this calculation.");
    }

    const FILLERS = {
        "times-before-add": fillTimesBeforeAdd, "divide-before-subtract": fillDivideBeforeSubtract,
        "same-rank-left": fillSameRankLeft, "two-products": fillTwoProducts,
        "brackets-first": fillBracketsFirst, "brackets-round-a-difference": fillBracketsRoundADifference,
        "where-the-brackets-go": fillWhereTheBracketsGo, "bracket-then-divide": fillBracketThenDivide,
        "power-before-times": fillPowerBeforeTimes, "power-of-a-bracket": fillPowerOfABracket,
        "root-of-a-sum": fillRootOfASum, "bar-as-bracket": fillBarAsBracket
    };

    /* A line of mixed notation. The engine draws a lone power or a lone root;
       these lines hold one inside a longer statement, so they are drawn here —
       with the same clipped caret and root sign the rest of the site uses, so
       the flattened text still reads 3 × 4^2 rather than 3 × 42. */
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
        stages: STAGES, lessonUrl: LESSON_URL, families: FAMILIES, fillers: FILLERS,
        renderDisplay: renderDisplay,
        notes: {
            integer: "Every answer on this page is a whole number.",
            fallback: "Not yet. Settle brackets first, then powers and roots, then multiplying and dividing, then adding and subtracting, working from the left within each rank."
        }
    });

    scope.OrderOfOperationsPractice = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
