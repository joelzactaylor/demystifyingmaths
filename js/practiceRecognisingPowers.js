/* Practice: recognising powers of a number.
   The bank of twelve questions; js/practice-engine.js runs the round, marks it
   and drives the page. The generator half runs without a document so it can be
   fuzzed from Node. */
(function (scope) {
    "use strict";

    const LESSON_URL = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/powersAndRoots/recognisingPowers.html";

    const STAGES = [
        { name: "Squares and cubes to recall", lessonAnchor: "squares-and-cubes" },
        { name: "Powers of 2, 3, 4 and 5", lessonAnchor: "powers-of-2-3-4-and-5" },
        { name: "Deciding whether a number is a power", lessonAnchor: "several-power-names" }
    ];

    const FAMILIES = [
        ["square-value", "name-the-square", "cube-value", "name-the-cube"],
        ["power-value", "which-power-of", "power-name", "position-in-row"],
        ["between-squares", "between-cubes", "several-names", "swap-base-index"]
    ];

    /* The recall set the lesson names: squares to 15 squared, cubes of 1 to 5
       and 10, and the powers of 2, 3, 4 and 5 it tabulates. */
    const SQUARE_ROOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    const CUBE_ROOTS = [1, 2, 3, 4, 5, 10];
    const ROWS = {
        2: [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
        3: [3, 9, 27, 81, 243],
        4: [4, 16, 64, 256, 1024],
        5: [5, 25, 125, 625, 3125]
    };

    function groupDigits(value) {
        return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function isSquare(value) {
        const root = Math.round(Math.sqrt(value));
        return root * root === value;
    }

    function isCube(value) {
        const root = Math.round(Math.cbrt(value));
        return root * root * root === value;
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

    /* Powers appear in options, hints, worked steps and the reflection, all of
       which are plain text set with textContent. A caret there is read aloud as
       a caret and printed as one, so the index is written with the superscript
       characters instead: 9³ rather than 9^3. The clipped caret belongs only to
       the drawn notation in the question card, where it is invisible and exists
       to keep a stripped page honest. */
    const SUPERSCRIPT = { "0": "\u2070", "1": "\u00B9", "2": "\u00B2", "3": "\u00B3", "4": "\u2074",
        "5": "\u2075", "6": "\u2076", "7": "\u2077", "8": "\u2078", "9": "\u2079" };

    function sup(value) {
        return String(value).split("").map(function (ch) { return SUPERSCRIPT[ch] || ch; }).join("");
    }

    function base(question, title, prompt) {
        question.title = title;
        question.prompt = prompt;
        return question;
    }

    /* ------------------------------------------------- squares and cubes */

    function fillSquareValue(question, rng, tools) {
        const n = tools.randomInt(rng, 6, 15);
        const value = n * n;
        question.factKey = "sq-" + n;
        question.contextKey = "plain";
        question.display = { kind: "power", base: String(n), index: "2", ariaLabel: n + " squared" };
        question.answerKind = "integer";
        question.answerLabel = "The value";
        question.expected = value;
        question.answerShown = groupDigits(value);
        question.correctNote = "Correct. " + n + " × " + n + " = " + value + ".";
        question.misses = [
            { value: n * 2, text: "That doubles " + n + ". Squaring multiplies it by itself: " + n + " × " + n + "." },
            { value: (n - 1) * (n - 1), text: "That is " + (n - 1) + " squared. This one is " + n + " squared." },
            { value: (n + 1) * (n + 1), text: "That is " + (n + 1) + " squared, one row further down the squares." }
        ];
        question.hints = [
            "Squaring means multiplying the number by itself.",
            n + " squared is " + n + " × " + n + "."
        ];
        question.steps = [
            n + " squared means " + n + " × " + n + ".",
            n + " × " + n + " = " + value + ".",
            n + "² = " + value + ", one of the squares to 15 squared."
        ];
        question.summaryLine = "The value of " + n + "²";
        question.printLine = "Work out " + n + "².";
        return base(question, "A square to recall", "Work out this square.");
    }

    function fillNameTheSquare(question, rng, tools) {
        const n = tools.randomInt(rng, 6, 15);
        const value = n * n;
        question.factKey = "sqback-" + n;
        question.contextKey = "plain";
        question.display = { kind: "inline", text: groupDigits(value), ariaLabel: String(value) };
        question.answerKind = "integer";
        question.answerLabel = "The number that was squared";
        question.expected = n;
        question.answerShown = String(n);
        question.correctNote = "Correct. " + n + " × " + n + " = " + value + ".";
        question.misses = [
            { value: value / 2, text: "That halves " + value + ". A square is read back to the number that was multiplied by itself." },
            { value: n - 1, text: (n - 1) + " squared is " + ((n - 1) * (n - 1)) + ", which is not " + value + "." },
            { value: n + 1, text: (n + 1) + " squared is " + ((n + 1) * (n + 1)) + ", which is not " + value + "." }
        ];
        question.hints = [
            "Read the squares backwards: which number multiplied by itself gives " + groupDigits(value) + "?",
            "The squares run 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225."
        ];
        question.steps = [
            groupDigits(value) + " is one of the squares of 1 to 15.",
            "It stands against " + n + ", because " + n + " × " + n + " = " + value + ".",
            "So the number that was squared is " + n + "."
        ];
        question.summaryLine = "Reading " + groupDigits(value) + " back to its square root";
        question.printLine = groupDigits(value) + " is the square of which number?";
        return base(question, "Read a square backwards", "This number is a square. Which number was squared to make it?");
    }

    function fillCubeValue(question, rng, tools) {
        const n = tools.pick(CUBE_ROOTS.slice(1), rng);
        const value = n * n * n;
        question.factKey = "cb-" + n;
        question.contextKey = "plain";
        question.display = { kind: "power", base: String(n), index: "3", ariaLabel: n + " cubed" };
        question.answerKind = "integer";
        question.answerLabel = "The value";
        question.expected = value;
        question.answerShown = groupDigits(value);
        question.correctNote = "Correct. " + n + " × " + n + " × " + n + " = " + value + ".";
        question.misses = [
            { value: n * 3, text: "That multiplies " + n + " by 3. Cubing uses three equal factors of " + n + "." },
            { value: n * n, text: "That is " + n + " squared, two factors. A cube uses three." }
        ];
        question.hints = [
            "Cubing means three equal factors.",
            "Work it in two steps: " + n + " × " + n + " = " + (n * n) + ", then × " + n + " again."
        ];
        question.steps = [
            n + " cubed means " + n + " × " + n + " × " + n + ".",
            n + " × " + n + " = " + (n * n) + ".",
            (n * n) + " × " + n + " = " + value + "."
        ];
        question.summaryLine = "The value of " + n + "³";
        question.printLine = "Work out " + n + "³.";
        return base(question, "A cube to recall", "Work out this cube.");
    }

    function fillNameTheCube(question, rng, tools) {
        const n = tools.pick(CUBE_ROOTS.slice(1), rng);
        const value = n * n * n;
        question.factKey = "cbback-" + n;
        question.contextKey = "plain";
        question.display = { kind: "inline", text: groupDigits(value), ariaLabel: String(value) };
        question.answerKind = "integer";
        question.answerLabel = "The number that was cubed";
        question.expected = n;
        question.answerShown = String(n);
        question.correctNote = "Correct. " + n + " × " + n + " × " + n + " = " + value + ".";
        question.misses = [
            { value: value / 3, text: "That divides by 3. A cube is read back to the number multiplied by itself three times." },
            { value: Math.round(Math.sqrt(value)) || 1, text: "That reads " + groupDigits(value) + " as a square. Here it is a cube, with three equal factors." }
        ];
        question.hints = [
            "The cubes worth recalling are 1, 8, 27, 64, 125 and 1,000.",
            "Which of those is " + groupDigits(value) + ", and what was cubed to make it?"
        ];
        question.steps = [
            groupDigits(value) + " is one of the cubes to recall.",
            "It stands against " + n + ", because " + n + " × " + n + " × " + n + " = " + value + ".",
            "So the number that was cubed is " + n + "."
        ];
        question.summaryLine = "Reading " + groupDigits(value) + " back to its cube root";
        question.printLine = groupDigits(value) + " is the cube of which number?";
        return base(question, "Read a cube backwards", "This number is a cube. Which number was cubed to make it?");
    }

    /* -------------------------------------------- powers of 2, 3, 4 and 5 */

    function fillPowerValue(question, rng, tools) {
        const b = tools.pick([2, 3, 4, 5], rng);
        const row = ROWS[b];
        const at = tools.randomInt(rng, 2, Math.min(row.length, 6)) - 1;
        const index = at + 1;
        const value = row[at];
        question.factKey = "pv-" + b + "-" + index;
        question.contextKey = "plain";
        question.display = { kind: "power", base: String(b), index: String(index), ariaLabel: b + " to the power of " + index };
        question.answerKind = "integer";
        question.answerLabel = "The value";
        question.expected = value;
        question.answerShown = groupDigits(value);
        question.correctNote = "Correct. " + index + " factors of " + b + " come to " + groupDigits(value) + ".";
        question.misses = [
            { value: b * index, text: "That multiplies the base by the index. The index counts factors of " + b + "." },
            { value: row[at - 1] || b, text: "That is " + b + sup(index) + " one step back along the row." }
        ];
        question.hints = [
            "The row of powers of " + b + " starts " + row.slice(0, 4).map(groupDigits).join(", ") + ", each one " + b + " times the last.",
            "Step along the row " + index + " places from the start."
        ];
        question.steps = [
            "The powers of " + b + " run " + row.slice(0, Math.max(4, index)).map(groupDigits).join(", ") + ".",
            "Each one is " + b + " times the one before it.",
            b + sup(index) + " = " + groupDigits(value) + "."
        ];
        question.summaryLine = "The value of " + b + sup(index);
        question.printLine = "Work out " + b + sup(index) + ".";
        return base(question, "A power to recall", "Work out this power.");
    }

    function fillWhichPowerOf(question, rng, tools) {
        const b = tools.pick([2, 3, 4, 5], rng);
        const row = ROWS[b];
        const right = tools.pick(row.slice(1, 5), rng);
        question.factKey = "wp-" + b + "-" + right;
        question.contextKey = "plain";
        question.given = "Powers of " + b;
        question.givenLabel = "Looking for";
        question.mode = "choice";
        question.choiceLegend = "Which of these is a power of " + b + "?";
        const near = [right + 1, right - 1, right + b, Math.round(right * 1.5)]
            .filter(function (v) { return v > 1 && row.indexOf(v) === -1; });
        const picked = chooseFour([
            { text: groupDigits(right), note: "Correct. " + groupDigits(right) + " is on the row of powers of " + b + "." }
        ].concat(near.map(function (v) {
            return { text: groupDigits(v), note: groupDigits(v) + " is not on the row " + row.slice(0, 5).map(groupDigits).join(", ") + "." };
        })), rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = groupDigits(right);
        question.hints = [
            "Write the row out: " + row.slice(0, 5).map(groupDigits).join(", ") + ".",
            "A power of " + b + " is reached by multiplying by " + b + " again and again, so it must appear on that row."
        ];
        question.steps = [
            "The powers of " + b + " are " + row.slice(0, 5).map(groupDigits).join(", ") + ".",
            "Only one of the options appears on that row.",
            groupDigits(right) + " is a power of " + b + "."
        ];
        question.summaryLine = "Spotting a power of " + b;
        question.printLine = "Which of these is a power of " + b + "?";
        return base(question, "Spot the power", "One of these numbers is a power of the base named above.");
    }

    function fillPowerName(question, rng, tools) {
        const b = tools.pick([2, 3, 4, 5], rng);
        const row = ROWS[b];
        const at = tools.randomInt(rng, 2, Math.min(row.length, 6)) - 1;
        const index = at + 1;
        const value = row[at];
        question.factKey = "pn-" + b + "-" + index;
        question.contextKey = "plain";
        question.given = groupDigits(value) + " = " + b + " to the power of ?";
        question.givenLabel = "Complete";
        question.display = { kind: "inline", text: groupDigits(value), ariaLabel: String(value) };
        question.answerKind = "integer";
        question.answerLabel = "The index";
        question.expected = index;
        question.answerShown = String(index);
        question.correctNote = "Correct. " + groupDigits(value) + " = " + b + sup(index) + ".";
        question.misses = [
            { value: value / b, text: "That is the value one step back, not the index." },
            { value: index - 1, text: "One factor short: " + b + sup((index - 1)) + " = " + groupDigits(row[at - 1] || b) + "." },
            { value: index + 1, text: "One factor too many for " + groupDigits(value) + "." }
        ];
        question.hints = [
            "Count how many times " + b + " has been multiplied to reach " + groupDigits(value) + ".",
            "The row runs " + row.slice(0, Math.max(4, index)).map(groupDigits).join(", ") + "; count the places."
        ];
        question.steps = [
            "Start at " + b + " and multiply by " + b + " each time.",
            "The row reaches " + groupDigits(value) + " after " + index + " factors.",
            groupDigits(value) + " = " + b + sup(index) + "."
        ];
        question.summaryLine = "Writing " + groupDigits(value) + " as a power of " + b;
        question.printLine = "Write " + groupDigits(value) + " as a power of " + b + ".";
        return base(question, "Name the index", "This number is a power of the base shown. Give the index.");
    }

    function fillPositionInRow(question, rng, tools) {
        /* All four rows, not just two. Drawing from 2 and 3 alone left the
           values disjoint, so the row could be inferred from the number; with 4
           and 5 in as well, 64 sits in two rows and 16 in two, and the row has
           to be named for the question to have an answer at all. */
        const b = tools.pick([2, 3, 4, 5], rng);
        const row = ROWS[b];
        const at = tools.randomInt(rng, 3, Math.min(row.length, 6)) - 1;
        const value = row[at];
        question.factKey = "pos-" + b + "-" + at;
        question.contextKey = "plain";
        /* The row has to be named. Without it the value alone determines
           nothing: 27 is third in the powers of 3 and first in the powers of
           27, and the reader has no way to know which row is meant. */
        question.given = "Powers of " + b;
        question.givenLabel = "The row";
        question.display = { kind: "inline", text: groupDigits(value), ariaLabel: String(value) };
        question.answerKind = "integer";
        question.answerLabel = "Its position in the row";
        question.expected = at + 1;
        question.answerShown = String(at + 1);
        question.correctNote = "Correct. Counting from " + b + " as the first, " + groupDigits(value) + " is number " + (at + 1) + ".";
        question.misses = [
            { value: at, text: "The row starts at " + b + ", which is the first. Count " + b + " itself as one." },
            { value: value / b, text: "That is the value before it, not its position." }
        ];
        question.hints = [
            "The row of powers of " + b + " starts at " + b + " itself.",
            "Write the row out and count along: " + row.slice(0, at + 1).map(groupDigits).join(", ") + "."
        ];
        question.steps = [
            "The powers of " + b + " run " + row.slice(0, at + 1).map(groupDigits).join(", ") + ".",
            "Counting " + b + " as the first, " + groupDigits(value) + " is the " + (at + 1) + "th.",
            "So it is " + b + sup((at + 1)) + "."
        ];
        question.summaryLine = "Where " + groupDigits(value) + " sits in the powers of " + b;
        question.printLine = "Where does " + groupDigits(value) + " appear in the powers of " + b + "?";
        return base(question, "Position in the row", "Counting the base itself as the first, where does this number appear in the row named above?");
    }

    /* ------------------------------------------------- is it a power? */

    function fillBetweenSquares(question, rng, tools) {
        const n = tools.randomInt(rng, 4, 14);
        const low = n * n;
        const high = (n + 1) * (n + 1);
        const value = tools.drawValid(
            function () { return tools.randomInt(rng, low + 1, high - 1); },
            function (v) { return !isSquare(v); },
            low + 1);
        question.factKey = "bs-" + value;
        question.contextKey = "plain";
        question.display = { kind: "inline", text: String(value), ariaLabel: String(value) };
        question.mode = "choice";
        question.choiceLegend = "Is this number a square?";
        const picked = chooseFour([
            { text: "No, it lies between " + low + " and " + high, note: "Correct. " + n + "² = " + low + " and " + (n + 1) + "² = " + high + ", and consecutive squares leave no square between them." },
            { text: "Yes, it is " + n + " squared", note: n + " squared is " + low + ", not " + value + "." },
            { text: "Yes, it is " + (n + 1) + " squared", note: (n + 1) + " squared is " + high + ", not " + value + "." },
            { text: "Yes, every whole number is a square", note: "Only numbers made by multiplying a whole number by itself are squares." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = "No, it lies between " + low + " and " + high;
        question.hints = [
            "Find the two squares either side of " + value + ".",
            n + "² = " + low + " and " + (n + 1) + "² = " + high + ". Where does " + value + " fall?"
        ];
        question.steps = [
            "The squares either side of " + value + " are " + low + " and " + high + ".",
            low + " < " + value + " < " + high + ".",
            "Consecutive squares leave no square between them, so " + value + " is not a square."
        ];
        question.summaryLine = "Whether " + value + " is a square";
        question.printLine = "Is " + value + " a square number?";
        return base(question, "Between two squares", "Decide whether this number is a square, and say how you know.");
    }

    function fillBetweenCubes(question, rng, tools) {
        const n = tools.randomInt(rng, 2, 4);
        const low = n * n * n;
        const high = (n + 1) * (n + 1) * (n + 1);
        const value = tools.drawValid(
            function () { return tools.randomInt(rng, low + 1, high - 1); },
            function (v) { return !isCube(v); },
            low + 1);
        question.factKey = "bc-" + value;
        question.contextKey = "plain";
        question.display = { kind: "inline", text: groupDigits(value), ariaLabel: String(value) };
        question.mode = "choice";
        question.choiceLegend = "Is this number a cube?";
        const picked = chooseFour([
            { text: "No, it lies between " + low + " and " + groupDigits(high), note: "Correct. " + n + "³ = " + low + " and " + (n + 1) + "³ = " + groupDigits(high) + ", and no cube falls between them." },
            { text: "Yes, it is " + n + " cubed", note: n + " cubed is " + low + ", not " + groupDigits(value) + "." },
            { text: "Yes, it is " + (n + 1) + " cubed", note: (n + 1) + " cubed is " + groupDigits(high) + ", not " + groupDigits(value) + "." },
            { text: "Yes, because it is even", note: "Being even does not make a number a cube: 8 is a cube and 10 is not." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = "No, it lies between " + low + " and " + groupDigits(high);
        question.hints = [
            "The cubes to recall are 1, 8, 27, 64, 125 and 1,000.",
            "Find the two cubes either side of " + groupDigits(value) + "."
        ];
        question.steps = [
            "The cubes either side of " + groupDigits(value) + " are " + low + " and " + groupDigits(high) + ".",
            low + " < " + groupDigits(value) + " < " + groupDigits(high) + ".",
            "No cube falls between two consecutive cubes, so " + groupDigits(value) + " is not a cube."
        ];
        question.summaryLine = "Whether " + groupDigits(value) + " is a cube";
        question.printLine = "Is " + groupDigits(value) + " a cube number?";
        return base(question, "Between two cubes", "Decide whether this number is a cube, and say how you know.");
    }

    function fillSeveralNames(question, rng, tools) {
        const draw = tools.pick([
            { value: 64, base: 4, index: 3, other: "2⁶ and 8²" },
            { value: 64, base: 8, index: 2, other: "2⁶ and 4³" },
            { value: 81, base: 9, index: 2, other: "3⁴" },
            { value: 256, base: 4, index: 4, other: "2⁸ and 16²" },
            { value: 16, base: 4, index: 2, other: "2⁴" },
            { value: 1024, base: 4, index: 5, other: "2¹0" }
        ], rng);
        question.factKey = "sn-" + draw.value + "-" + draw.base;
        question.contextKey = "plain";
        question.given = groupDigits(draw.value) + " = " + draw.base + " to the power of ?";
        question.givenLabel = "Complete";
        question.display = { kind: "inline", text: groupDigits(draw.value), ariaLabel: String(draw.value) };
        question.answerKind = "integer";
        question.answerLabel = "The index";
        question.expected = draw.index;
        question.answerShown = String(draw.index);
        question.correctNote = "Correct. " + groupDigits(draw.value) + " = " + draw.base + sup(draw.index) + ", and also " + draw.other + ".";
        question.misses = [
            { value: draw.index + 1, text: "One factor too many: " + draw.base + sup((draw.index + 1)) + " is larger than " + groupDigits(draw.value) + "." },
            { value: draw.index - 1, text: "One factor short of " + groupDigits(draw.value) + "." }
        ];
        question.hints = [
            "Multiply " + draw.base + " by itself, keeping a running total, until you reach " + groupDigits(draw.value) + ".",
            "One number can carry several power names; here the base has been fixed at " + draw.base + "."
        ];
        question.steps = [
            "Start at " + draw.base + " and multiply by " + draw.base + " each time.",
            groupDigits(draw.value) + " is reached after " + draw.index + " factors.",
            groupDigits(draw.value) + " = " + draw.base + sup(draw.index) + ", and the same number is also " + draw.other + "."
        ];
        question.summaryLine = groupDigits(draw.value) + " as a power of " + draw.base;
        question.printLine = "Write " + groupDigits(draw.value) + " as a power of " + draw.base + ".";
        return base(question, "One number, several names", "This number can be written as a power of more than one base. Give the index for the base shown.");
    }

    function fillSwapBaseIndex(question, rng, tools) {
        const draw = tools.pick([[4, 3], [3, 4], [2, 5], [5, 2], [2, 3], [3, 2]], rng);
        const b = draw[0];
        const i = draw[1];
        const value = Math.pow(b, i);
        const swapped = Math.pow(i, b);
        question.factKey = "swap-" + b + "-" + i;
        question.contextKey = "plain";
        question.display = { kind: "power", base: String(b), index: String(i), ariaLabel: b + " to the power of " + i };
        question.answerKind = "integer";
        question.answerLabel = "The value";
        question.expected = value;
        question.answerShown = groupDigits(value);
        question.correctNote = "Correct. " + i + " factors of " + b + " give " + groupDigits(value) + ", while " + i + sup(b) + " gives " + groupDigits(swapped) + ".";
        question.misses = [
            { value: swapped, text: "That is " + i + sup(b) + ", the base and index swapped. Here " + b + " is the repeated number." },
            { value: b * i, text: "That multiplies the base by the index rather than repeating the base." }
        ];
        question.hints = [
            "The number on the line is the one being repeated.",
            "Swapping the base and the index changes the value: " + b + sup(i) + " and " + i + sup(b) + " are different."
        ];
        question.steps = [
            "The base is " + b + " and the index is " + i + ", so " + i + " factors of " + b + " are multiplied.",
            b + sup(i) + " = " + groupDigits(value) + ".",
            "Swapped, " + i + sup(b) + " would be " + groupDigits(swapped) + ", which is a different number."
        ];
        question.summaryLine = "Keeping the base and index the right way round in " + b + sup(i);
        question.printLine = "Work out " + b + sup(i) + ".";
        return base(question, "Base and index the right way round", "Work out this power.");
    }

    const FILLERS = {
        "square-value": fillSquareValue,
        "name-the-square": fillNameTheSquare,
        "cube-value": fillCubeValue,
        "name-the-cube": fillNameTheCube,
        "power-value": fillPowerValue,
        "which-power-of": fillWhichPowerOf,
        "power-name": fillPowerName,
        "position-in-row": fillPositionInRow,
        "between-squares": fillBetweenSquares,
        "between-cubes": fillBetweenCubes,
        "several-names": fillSeveralNames,
        "swap-base-index": fillSwapBaseIndex
    };

    const api = scope.PracticeEngine.create({
        stages: STAGES,
        lessonUrl: LESSON_URL,
        families: FAMILIES,
        fillers: FILLERS,
        notes: {
            integer: "These powers are whole numbers, so this answer has no decimal part. Multiply one factor at a time.",
            fallback: "Not yet. Write the row of powers out from the base, multiplying by the base each time, and find where this number falls."
        }
    });

    scope.RecognisingPowersPractice = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
