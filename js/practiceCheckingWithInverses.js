/* Practice: checking an answer with the inverse operation.

   The bank of twelve questions; js/practice-engine.js runs the round, marks it
   and drives the page. The generator half runs without a document so it can be
   fuzzed from Node.

   A root of an order above two is drawn here rather than left to the engine,
   for the reason the whole site draws them: a browser lays <msqrt> out from a
   font's OpenType MATH table and macOS ships no font that has one. */
(function (scope) {
    "use strict";

    const LESSON_URL = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/directedNumber/checkingWithInverses.html";
    const TIMES = "×";
    const DIVIDE = "÷";
    const MINUS = "−";
    const ASKS = "≟";

    const STAGES = [
        { name: "Choosing the inverse", lessonAnchor: "which-statement" },
        { name: "When one statement is not enough", lessonAnchor: "one-statement-not-enough" },
        { name: "What a root check leaves", lessonAnchor: "what-a-root-leaves" }
    ];

    const FAMILIES = [
        ["undo-a-subtraction", "undo-a-division", "which-statement-checks", "size-of-the-slip"],
        ["remainder-back-together", "remainder-missing-part", "complete-check-choice", "remainder-in-context"],
        ["root-checks-a-power", "cube-root-of-a-negative", "what-the-root-leaves", "index-settles-the-sign"]
    ];

    function inline(text, aria) { return { kind: "inline", text: text, ariaLabel: aria }; }
    function expr(parts, aria, flat) { return { kind: "expr", parts: parts, ariaLabel: aria, flat: flat || null }; }
    const txt = function (v) { return { t: "text", v: String(v) }; };
    const pow = function (b, i) { return { t: "power", b: String(b), i: String(i) }; };
    const rt = function (r, order) { return { t: "root", r: String(r), order: order ? String(order) : "" }; };
    function neg(v) { return MINUS + Math.abs(v); }
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

    /* ------------------------------------------- choosing the inverse */

    function fillUndoASubtraction(question, rng, tools) {
        const b = tools.randomInt(rng, 17, 89);
        const c = tools.randomInt(rng, 120, 740);
        const a = b + c;
        question.factKey = "uas-" + a + "-" + b;
        question.contextKey = "plain";
        question.given = a + " " + MINUS + " " + b + " = " + c;
        question.givenLabel = "The calculation to test";
        question.display = inline(c + " + " + b, c + " plus " + b);
        question.answerKind = "integer";
        question.answerLabel = "The check comes to";
        question.expected = a;
        question.answerShown = String(a);
        question.correctNote = "Correct. The check lands back on " + a + ", so the subtraction holds.";
        question.misses = [
            { value: c - b, text: "The check starts from the answer and adds back what was taken, so it is " + c + " + " + b + "." },
            { value: a - b, text: "That runs the original calculation again. The check adds " + b + " back to " + c + " instead." }
        ];
        question.hints = [
            "Adding undoes subtracting, so the check starts from the answer.",
            "Add the " + b + " back to " + c + " and see whether " + a + " comes back."
        ];
        question.steps = [
            "Subtracting is undone by adding.",
            "The check starts from the answer, " + c + ", and adds back the " + b + " that was taken.",
            c + " + " + b + " = " + a + ", which is where the subtraction started, so it holds."
        ];
        question.summaryLine = "Checking " + a + " " + MINUS + " " + b + " = " + c;
        question.printLine = "Check " + a + " " + MINUS + " " + b + " = " + c + " by working out " + c + " + " + b + ".";
        return base(question, "A subtraction to test", "Work out the check.");
    }

    function fillUndoADivision(question, rng, tools) {
        const b = tools.randomInt(rng, 12, 39);
        const c = tools.randomInt(rng, 12, 49);
        const a = b * c;
        question.factKey = "uad-" + a + "-" + b;
        question.contextKey = "plain";
        question.given = a + " " + DIVIDE + " " + b + " = " + c;
        question.givenLabel = "The calculation to test";
        question.display = inline(c + " " + TIMES + " " + b, c + " times " + b);
        question.answerKind = "integer";
        question.answerLabel = "The check comes to";
        question.expected = a;
        question.answerShown = String(a);
        question.correctNote = "Correct. The check lands back on " + a + ", so the division holds.";
        question.misses = [
            { value: c + b, text: "Multiplying undoes dividing, so the check is " + c + " " + TIMES + " " + b + "." },
            { value: a - b, text: "That subtracts instead of multiplying. Dividing is undone by multiplying, so the check is " + c + " " + TIMES + " " + b + "." }
        ];
        question.hints = [
            "Multiplying undoes dividing, so the check starts from the answer.",
            "Multiply " + c + " by " + b + " and see whether " + a + " comes back."
        ];
        question.steps = [
            "Dividing is undone by multiplying.",
            "The check starts from the answer, " + c + ", and multiplies by the " + b + " that was divided by.",
            c + " " + TIMES + " " + b + " = " + a + ", which is where the division started, so it holds."
        ];
        question.summaryLine = "Checking " + a + " " + DIVIDE + " " + b + " = " + c;
        question.printLine = "Check " + a + " " + DIVIDE + " " + b + " = " + c + " by working out " + c + " " + TIMES + " " + b + ".";
        return base(question, "A division to test", "Work out the check.");
    }

    function fillWhichStatementChecks(question, rng, tools) {
        const b = tools.randomInt(rng, 18, 59);
        /* Two of the distractors are b − c and c − b, which are one line when
           the two match. */
        let c = tools.randomInt(rng, 21, 68);
        if (c === b) c = c === 68 ? 67 : c + 1;
        const a = b + c;
        question.factKey = "wsc-" + a + "-" + b;
        question.contextKey = "structure";
        question.given = a + " " + MINUS + " " + b + " = " + c;
        question.givenLabel = "The calculation to test";
        question.mode = "choice";
        question.choiceLegend = "Which statement checks it?";
        const picked = chooseFour([
            { text: c + " + " + b + " = " + a, note: "Correct. It starts from the answer and adds back what was taken." },
            { text: b + " " + MINUS + " " + c + " = " + signed(b - c), note: "That rearranges the three numbers into a calculation the original never made, so its result says nothing about the answer." },
            { text: c + " " + MINUS + " " + b + " = " + signed(c - b), note: "That takes the " + b + " away again. A check puts back what the subtraction removed, so it adds." },
            { text: a + " + " + b + " = " + (a + b), note: "That adds to the number the subtraction started from, rather than starting from the answer." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = c + " + " + b + " = " + a;
        question.hints = [
            "A check starts from the answer, not from the numbers that made it.",
            "Adding undoes subtracting, so the check adds " + b + " back to " + c + "."
        ];
        question.steps = [
            "A check starts from the answer, which is " + c + ".",
            "Subtracting is undone by adding, so the " + b + " goes back on.",
            c + " + " + b + " = " + a + ", which is where the subtraction started."
        ];
        question.summaryLine = "Which statement checks " + a + " " + MINUS + " " + b + " = " + c;
        question.printLine = "Which statement checks " + a + " " + MINUS + " " + b + " = " + c + "?";
        return base(question, "Picking the check", "Choose the statement that tests the answer.");
    }

    function fillSizeOfTheSlip(question, rng, tools) {
        const b = tools.randomInt(rng, 16, 79);
        const right = tools.randomInt(rng, 130, 690);
        const a = right + b;
        const gap = tools.pick([10, 20, 30, 90, 100, 200], rng);
        const wrong = right + gap;
        question.factKey = "sots-" + a + "-" + b + "-" + gap;
        question.contextKey = "plain";
        question.given = a + " " + MINUS + " " + b + " " + ASKS + " " + wrong;
        question.givenLabel = "The answer being tested";
        question.display = inline(wrong + " + " + b, wrong + " plus " + b);
        question.answerKind = "integer";
        question.answerLabel = "The check comes to";
        question.expected = wrong + b;
        question.answerShown = String(wrong + b);
        question.correctNote = "Correct. The check gives " + (wrong + b) + " instead of " + a + ", and the gap of " + gap + " is the size of the slip.";
        question.misses = [
            { value: a, text: "The check works on the answer being tested, which is " + wrong + ", not on the correct answer." },
            { value: wrong - b, text: "The check adds the " + b + " back, because adding is what undoes subtracting." }
        ];
        question.hints = [
            "Run the check on the answer as it stands, whether or not it is right.",
            "Add " + b + " back to " + wrong + ", then compare what comes out with " + a + "."
        ];
        question.steps = [
            "The check starts from the answer being tested, " + wrong + ".",
            wrong + " + " + b + " = " + (wrong + b) + ".",
            "The subtraction started at " + a + ", so the check is out by " + gap + " and the answer is wrong."
        ];
        question.summaryLine = "Testing " + a + " " + MINUS + " " + b + " " + ASKS + " " + wrong;
        question.printLine = "Check whether " + a + " " + MINUS + " " + b + " = " + wrong + " by working out " + wrong + " + " + b + ".";
        return base(question, "A check that disagrees", "Work out the check.");
    }

    /* ------------------------------- when one statement is not enough */

    function fillRemainderBackTogether(question, rng, tools) {
        const b = tools.randomInt(rng, 3, 9);
        const q = tools.randomInt(rng, 4, 19);
        const r = tools.randomInt(rng, 1, b - 1);
        const a = b * q + r;
        question.factKey = "rbt-" + a + "-" + b;
        question.contextKey = "plain";
        question.given = a + " " + DIVIDE + " " + b + " = " + q + " r " + r;
        question.givenLabel = "The calculation to test";
        question.display = inline(q + " " + TIMES + " " + b + " + " + r, q + " times " + b + " plus " + r);
        question.answerKind = "integer";
        question.answerLabel = "The check comes to";
        question.expected = a;
        question.answerShown = String(a);
        question.correctNote = "Correct. The whole groups multiply back and the remainder goes on afterwards, landing on " + a + ".";
        question.misses = [
            { value: b * q, text: "That multiplies the whole groups back and stops. The remainder is part of the answer, so it has to go back in too." },
            { value: (q + r) * b, text: "The remainder is added after the multiplication, not before it: " + q + " " + TIMES + " " + b + " = " + (b * q) + ", then + " + r + "." }
        ];
        question.hints = [
            "The answer has two pieces, and both have to go back in.",
            "Multiply the whole groups back first, then add the remainder on."
        ];
        question.steps = [
            "The answer has two pieces: " + q + " whole groups and a remainder of " + r + ".",
            q + " " + TIMES + " " + b + " = " + (b * q) + " puts the whole groups back.",
            (b * q) + " + " + r + " = " + a + ", which is where the division started."
        ];
        question.summaryLine = "Checking " + a + " " + DIVIDE + " " + b + " = " + q + " r " + r;
        question.printLine = "Check " + a + " " + DIVIDE + " " + b + " = " + q + " r " + r + " by working out " + q + " " + TIMES + " " + b + " + " + r + ".";
        return base(question, "A division with a remainder", "Work out the check.");
    }

    function fillRemainderMissingPart(question, rng, tools) {
        const b = tools.randomInt(rng, 4, 9);
        const q = tools.randomInt(rng, 5, 18);
        const r = tools.randomInt(rng, 1, b - 1);
        const a = b * q + r;
        question.factKey = "rmp-" + a + "-" + b;
        question.contextKey = "structure";
        question.given = a + " " + DIVIDE + " " + b + " = " + q + " r ?";
        question.givenLabel = "The calculation";
        question.answerKind = "integer";
        question.answerLabel = "The remainder";
        question.expected = r;
        question.answerShown = String(r);
        question.correctNote = "Correct. " + q + " " + TIMES + " " + b + " = " + (b * q) + ", and " + a + " " + MINUS + " " + (b * q) + " = " + r + " is left over.";
        question.misses = [
            { value: b * q, text: "That is what the whole groups come to. The remainder is what is left of " + a + " after those are taken out." },
            { value: b, text: "A remainder is always smaller than the number being divided by, so it cannot be " + b + " itself." }
        ];
        question.hints = [
            "Put the whole groups back first, and see how much of " + a + " they account for.",
            q + " " + TIMES + " " + b + " = " + (b * q) + ". The rest of " + a + " is the remainder."
        ];
        question.steps = [
            "The check multiplies the whole groups back: " + q + " " + TIMES + " " + b + " = " + (b * q) + ".",
            "The division started at " + a + ", so the remainder makes up the difference.",
            a + " " + MINUS + " " + (b * q) + " = " + r + "."
        ];
        question.summaryLine = "The remainder in " + a + " " + DIVIDE + " " + b;
        question.printLine = "What is the remainder in " + a + " " + DIVIDE + " " + b + " = " + q + " r ?";
        return base(question, "Finding the piece left over", "Work out the remainder.");
    }

    function fillCompleteCheckChoice(question, rng, tools) {
        const b = tools.randomInt(rng, 4, 9);
        const q = tools.randomInt(rng, 5, 15);
        const r = tools.randomInt(rng, 1, b - 1);
        const a = b * q + r;
        question.factKey = "ccc-" + a + "-" + b;
        question.contextKey = "structure";
        question.given = a + " " + DIVIDE + " " + b + " = " + q + " r " + r;
        question.givenLabel = "The calculation to test";
        question.mode = "choice";
        question.choiceLegend = "Which check tests the whole answer?";
        const picked = chooseFour([
            { text: q + " " + TIMES + " " + b + " + " + r + " = " + a, note: "Correct. Both pieces of the answer go back in, and the check lands on " + a + "." },
            { text: q + " " + TIMES + " " + b + " = " + (b * q), note: "That leaves the remainder out, so it lands on " + (b * q) + " rather than " + a + "." },
            { text: q + " " + TIMES + " " + b + " " + MINUS + " " + r + " = " + (b * q - r), note: "The remainder was left over, so it is added back, not taken away." },
            /* An exact distractor: rounding a ÷ q to two places and writing it
               with an equals sign states something false, and this page is not
               the place for a statement that does not hold. Folding the
               remainder into the quotient before multiplying is a real slip and
               lands on a whole number. */
            { text: "(" + q + " + " + r + ") " + TIMES + " " + b + " = " + ((q + r) * b), note: "That folds the remainder into the count of whole groups before multiplying, which multiplies it by " + b + " as well." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = q + " " + TIMES + " " + b + " + " + r + " = " + a;
        question.hints = [
            "The answer has two pieces, so a complete check has to use both.",
            "Look for the option that lands back on " + a + "."
        ];
        question.steps = [
            "The answer is " + q + " whole groups with " + r + " left over.",
            "A complete check multiplies the groups back and adds the remainder on.",
            q + " " + TIMES + " " + b + " + " + r + " = " + a + ", which is where the division started."
        ];
        question.summaryLine = "Which check tests " + q + " r " + r + " in full";
        question.printLine = "Which check tests the whole of " + a + " " + DIVIDE + " " + b + " = " + q + " r " + r + "?";
        return base(question, "Four checks to choose from", "Choose the complete check.");
    }

    function fillRemainderInContext(question, rng, tools) {
        const perBox = tools.randomInt(rng, 4, 9);
        const boxes = tools.randomInt(rng, 6, 19);
        /* spoken as "spare items", so never one */
        const spare = tools.randomInt(rng, 2, perBox - 1);
        const total = perBox * boxes + spare;
        question.factKey = "ric-" + total + "-" + perBox;
        question.contextKey = "packing";
        question.given = boxes + " full boxes of " + perBox + ", and " + spare + " left over";
        question.givenLabel = "The packing";
        question.answerKind = "integer";
        question.answerLabel = "Items altogether";
        question.expected = total;
        question.answerShown = String(total);
        question.correctNote = "Correct. The full boxes multiply back and the loose items go on afterwards.";
        question.misses = [
            { value: perBox * boxes, text: "That counts the full boxes only. The " + spare + " left over are part of the total too." },
            { value: boxes + spare, text: "Each box holds " + perBox + " items, so the boxes account for " + boxes + " " + TIMES + " " + perBox + " = " + (perBox * boxes) + "." }
        ];
        question.hints = [
            "The packing has two pieces: the full boxes and the items that did not fill one.",
            boxes + " " + TIMES + " " + perBox + " = " + (perBox * boxes) + " items are in boxes."
        ];
        question.steps = [
            boxes + " boxes of " + perBox + " hold " + boxes + " " + TIMES + " " + perBox + " = " + (perBox * boxes) + " items.",
            spare + " items were left loose.",
            (perBox * boxes) + " + " + spare + " = " + total + " items altogether."
        ];
        question.summaryLine = boxes + " boxes of " + perBox + " with " + spare + " over";
        question.printLine = boxes + " boxes each hold " + perBox + " items, and " + spare + " items are left over. How many items are there altogether?";
        return base(question, "Boxes and leftovers", "Work out how many there are altogether.");
    }

    /* ----------------------------------------- what a root check leaves */

    function fillRootChecksAPower(question, rng, tools) {
        const n = tools.randomInt(rng, 2, 6);
        const cube = n * n * n;
        question.factKey = "rcp-" + n;
        question.contextKey = "plain";
        question.given = n + "^3 = " + cube;
        question.givenLabel = "The calculation to test";
        question.display = expr([rt(cube, 3)], "the cube root of " + cube, null);
        question.answerKind = "integer";
        question.answerLabel = "The root";
        question.expected = n;
        question.answerShown = String(n);
        question.correctNote = "Correct. The cube root undoes the cube and hands back " + n + ".";
        question.misses = [
            { value: n * n, text: "That is " + n + " squared. The root asks for the number itself, not its square." },
            { value: n * 3, text: "An index of 3 means " + n + " multiplied by itself three times, not " + n + " " + TIMES + " 3." }
        ];
        /* Only offered when it is a whole number; otherwise it can never be
           entered, and the reader meets the note about whole numbers instead of
           the observation that names the mistake. */
        if (cube % 3 === 0) {
            question.misses.push({ value: cube / 3, text: "A cube root is not a division by 3. It asks which number multiplied by itself three times gives " + cube + "." });
        }
        question.hints = [
            "A root undoes a power of the same order.",
            "Which number, multiplied by itself three times, gives " + cube + "?"
        ];
        question.steps = [
            "A cube is undone by a cube root.",
            n + " " + TIMES + " " + n + " " + TIMES + " " + n + " = " + cube + ".",
            "So the cube root of " + cube + " is " + n + ", and the power holds."
        ];
        question.summaryLine = "The cube root of " + cube;
        question.printLine = "Work out the cube root of " + cube + ".";
        return base(question, "A cube to test", "Work out this root.");
    }

    function fillCubeRootOfANegative(question, rng, tools) {
        const n = tools.randomInt(rng, 2, 6);
        const cube = n * n * n;
        question.factKey = "crn-" + n;
        question.contextKey = "plain";
        question.given = "(" + neg(n) + ")^3 = " + neg(cube);
        question.givenLabel = "The calculation to test";
        question.display = expr([rt(neg(cube), 3)], "the cube root of negative " + cube, null);
        question.answerKind = "integer";
        question.answerLabel = "The root";
        question.expected = -n;
        question.answerShown = neg(n);
        question.correctNote = "Correct. A cube root keeps the sign of the number under it, so no second step is needed.";
        question.misses = [
            { value: n, text: "Three negatives multiplied stay negative, so the number that cubes to " + neg(cube) + " is itself negative." },
            { value: -(n * n), text: "That is the square with a sign. The root asks for the number that was cubed, which is " + neg(n) + "." }
        ];
        question.hints = [
            "An odd index keeps the sign of the number it was applied to.",
            "Which number, multiplied by itself three times, gives " + neg(cube) + "?"
        ];
        question.steps = [
            "Three negatives multiplied together stay negative.",
            neg(n) + " " + TIMES + " " + neg(n) + " " + TIMES + " " + neg(n) + " = " + neg(cube) + ".",
            "So the cube root of " + neg(cube) + " is " + neg(n) + ", sign and all."
        ];
        question.summaryLine = "The cube root of " + neg(cube);
        question.printLine = "Work out the cube root of " + neg(cube) + ".";
        return base(question, "A cube root of a negative", "Work out this root.");
    }

    function fillWhatTheRootLeaves(question, rng, tools) {
        const n = tools.randomInt(rng, 3, 12);
        const square = n * n;
        question.factKey = "wrl-" + n;
        question.contextKey = "structure";
        question.given = "(" + neg(n) + ")^2 = " + square;
        question.givenLabel = "The calculation to test";
        question.mode = "choice";
        question.choiceLegend = "The square root of " + square + " is " + n + ". What does that settle?";
        const picked = chooseFour([
            { text: "The size is right, and the sign is settled by the index", note: "Correct. The root hands back " + n + ", and an even index makes the answer positive whichever sign went in." },
            { text: "The calculation is wrong, because " + n + " is not " + neg(n), note: "The root sign only ever hands back one of the two numbers of that size. It disagreeing with " + neg(n) + " is not a disagreement about the answer." },
            { text: "Nothing at all, because the root gives a positive number", note: "It settles the size. What it leaves open is the sign, and the even index settles that separately." },
            { text: "Both the size and the sign of the number that was squared", note: "The root gives one number of that size. It cannot say which of " + n + " and " + neg(n) + " was squared." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = "The size is right, and the sign is settled by the index";
        question.hints = [
            "Two numbers square to " + square + ", and the root sign names only one of them.",
            "What the root cannot settle, the index can: an even index makes the answer positive either way."
        ];
        question.steps = [
            "Both " + n + " and " + neg(n) + " square to " + square + ".",
            "The root sign hands back " + n + ", so it settles the size and not the sign.",
            "The index 2 is even, so the answer is positive whichever sign went in, and " + square + " is right."
        ];
        question.summaryLine = "What a root check settles for (" + neg(n) + ")^2";
        question.printLine = "The square root of " + square + " is " + n + ". What does that settle about (" + neg(n) + ")^2 = " + square + "?";
        return base(question, "What the check leaves open", "Choose what the root check settles.");
    }

    function fillIndexSettlesTheSign(question, rng, tools) {
        const n = tools.randomInt(rng, 2, 5);
        const index = tools.pick([3, 5], rng);
        const value = Math.pow(n, index);
        question.factKey = "iss-" + n + "-" + index;
        question.contextKey = "plain";
        question.given = "An index of " + index;
        question.givenLabel = "The power";
        question.display = expr([pow("(" + neg(n) + ")", index)],
            "open bracket negative " + n + " close bracket to the power " + index,
            null);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = -value;
        question.answerShown = neg(value);
        question.correctNote = "Correct. " + index + " is odd, so the negatives do not pair off and the answer stays negative.";
        question.misses = [
            { value: value, text: "The size is right. An index of " + index + " multiplies " + index + " negatives together, and an odd count leaves the answer negative." },
            { value: -(n * index), text: "An index of " + index + " means " + n + " multiplied by itself " + index + " times, not " + n + " " + TIMES + " " + index + "." }
        ];
        question.hints = [
            "The index says how many negatives are multiplied together.",
            "An odd count of negatives leaves the answer below zero."
        ];
        question.steps = [
            "The bracket puts the sign inside the power, so " + index + " negatives are multiplied.",
            "The size is " + n + " multiplied by itself " + index + " times, which is " + value + ".",
            index + " is odd, so the answer is " + neg(value) + "."
        ];
        question.summaryLine = "(" + neg(n) + ")^" + index;
        question.printLine = "Work out (" + neg(n) + ")^" + index + ".";
        return base(question, "An odd index and a negative base", "Work out this power.");
    }

    const FILLERS = {
        "undo-a-subtraction": fillUndoASubtraction, "undo-a-division": fillUndoADivision,
        "which-statement-checks": fillWhichStatementChecks, "size-of-the-slip": fillSizeOfTheSlip,
        "remainder-back-together": fillRemainderBackTogether, "remainder-missing-part": fillRemainderMissingPart,
        "complete-check-choice": fillCompleteCheckChoice, "remainder-in-context": fillRemainderInContext,
        "root-checks-a-power": fillRootChecksAPower, "cube-root-of-a-negative": fillCubeRootOfANegative,
        "what-the-root-leaves": fillWhatTheRootLeaves, "index-settles-the-sign": fillIndexSettlesTheSign
    };

    /* A root of an order above two, and a power inside a longer line: neither is
       something the engine's own displays draw. The clipped caret and root sign
       keep the flattened text true. */
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
            const rad = element("span", part.order ? "rad rad--order" : "rad");
            const caret = element("span", "caret", (part.order === "3" ? "³√" : "√"));
            caret.setAttribute("aria-hidden", "true");
            rad.appendChild(caret);
            if (part.order) {
                const mark = element("span", "rad__index");
                mark.setAttribute("data-order", part.order);
                mark.setAttribute("aria-hidden", "true");
                rad.appendChild(mark);
            }
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
        });
    }

    const api = scope.PracticeEngine.create({
        stages: STAGES, lessonUrl: LESSON_URL, families: FAMILIES, fillers: FILLERS,
        renderDisplay: renderDisplay,
        notes: {
            integer: "Every answer on this page is a whole number, and it may be negative.",
            fallback: "Not yet. A check starts from the answer and applies the operation that undoes the original one."
        }
    });

    scope.CheckingWithInversesPractice = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
