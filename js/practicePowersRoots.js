/* Practice: index notation and powers.
   The bank of twelve questions; js/practice-engine.js runs the round, marks it
   and drives the page. The generator half runs without a document so it can be
   fuzzed from Node. */
(function (scope) {
    "use strict";

    const LESSON_URL = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/powersAndRoots/indexNotation.html";

    const STAGES = [
        { name: "Reading a power", lessonAnchor: "what-index-notation-means" },
        { name: "Working a power out", lessonAnchor: "working-out-a-power" },
        { name: "Writing a product as a power", lessonAnchor: "writing-a-product-as-a-power" }
    ];

    const FAMILIES = [
        ["name-base", "name-index", "expand-power", "read-words"],
        ["evaluate-square", "evaluate-cube", "evaluate-small", "evaluate-index-one"],
        ["product-to-power", "count-factors", "two-bases", "not-base-times-index"]
    ];

    /* Powers this page may ask for, kept inside the lesson's scope: positive
       whole bases and indices, and values a reader can reach by multiplying one
       factor at a time. */
    const WORDS = ["", "", "squared", "cubed", "to the power of four", "to the power of five",
        "to the power of six"];

    function say(base, index) {
        if (index === 1) return base + " to the power of one";
        if (index === 2) return base + " squared";
        if (index === 3) return base + " cubed";
        return base + " to the power of " + ["", "one", "two", "three", "four", "five", "six"][index];
    }

    function spokenPower(base, index) {
        return base + " to the power of " + index;
    }

    function expansion(base, index) {
        const parts = [];
        for (let at = 0; at < index; at += 1) parts.push(String(base));
        return parts.join(" × ");
    }

    function powerDisplay(base, index) {
        return { kind: "power", base: String(base), index: String(index), ariaLabel: spokenPower(base, index) };
    }

    /* A running product, one factor at a time, which is the method the lesson
       uses and so the method a worked solution has to show. */
    function runningProduct(base, index) {
        const steps = [];
        let value = base;
        for (let at = 2; at <= index; at += 1) {
            const next = value * base;
            steps.push(value + " × " + base + " = " + next);
            value = next;
        }
        return { steps: steps, value: value };
    }

    function pow(base, index) {
        return Math.pow(base, index);
    }

    /* Four distinct options, the correct one first in the list handed in.
       Random values collide — with a base and index both 3, "base times index"
       and "one factor short" are both 9 — so a candidate repeating one already
       taken is dropped and the next spare is used instead. */
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

    /* ------------------------------------------------------------- fillers */

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

    function fillNameBase(question, rng, tools) {
        const b = tools.randomInt(rng, 2, 9);
        const i = tools.randomInt(rng, 2, 6);
        question.factKey = "base-" + b + "-" + i;
        question.contextKey = "plain";
        question.display = powerDisplay(b, i);
        question.answerKind = "integer";
        question.answerLabel = "The base";
        question.expected = b;
        question.answerShown = String(b);
        question.correctNote = "Correct. The base is the number being repeated.";
        question.misses = [{ value: i, text: "That is the index, the small raised number. The base is the full-size number on the line." },
            { value: pow(b, i), text: "That is the value of the power. The base is the number that is repeated, before any multiplying." }];
        question.hints = [
            "One number is written full size on the line, and one is small and raised. The base is the one on the line.",
            "The power is " + expansion(b, i) + ", and every factor in it is the base."
        ];
        question.steps = [
            "The base is written full size, on the line.",
            "Expanded, the power is " + expansion(b, i) + ".",
            "Every one of those equal factors is " + b + ", so the base is " + b + "."
        ];
        question.summaryLine = "The base of " + b + sup(i);
        question.printLine = "Name the base of " + b + sup(i) + ".";
        return base(question, "Name the base", "Write down the base of this power.");
    }

    function fillNameIndex(question, rng, tools) {
        const b = tools.randomInt(rng, 2, 9);
        const i = tools.randomInt(rng, 2, 6);
        question.factKey = "index-" + b + "-" + i;
        question.contextKey = "plain";
        question.display = powerDisplay(b, i);
        question.answerKind = "integer";
        question.answerLabel = "The index";
        question.expected = i;
        question.answerShown = String(i);
        question.correctNote = "Correct. The index counts the equal factors.";
        question.misses = [{ value: b, text: "That is the base, the number on the line. The index is the small raised number." },
            { value: i - 1, text: "The index counts the factors, not the multiplication signs. " + expansion(b, i) + " has " + i + " factors and " + (i - 1) + " signs." }];
        question.hints = [
            "The index is the small raised number, and it says how many equal factors the power stands for.",
            "Count the factors in " + expansion(b, i) + ", not the multiplication signs between them."
        ];
        question.steps = [
            "The index is the small raised number.",
            "It counts the equal factors: " + expansion(b, i) + ".",
            "There are " + i + " factors, so the index is " + i + "."
        ];
        question.summaryLine = "The index of " + b + sup(i);
        question.printLine = "Name the index of " + b + sup(i) + ".";
        return base(question, "Name the index", "Write down the index of this power.");
    }

    function fillExpandPower(question, rng, tools) {
        const b = tools.randomInt(rng, 2, 7);
        const i = tools.randomInt(rng, 3, 5);
        question.factKey = "expand-" + b + "-" + i;
        question.contextKey = "plain";
        question.display = powerDisplay(b, i);
        question.mode = "choice";
        question.choiceLegend = "Which repeated multiplication is this power?";
        const picked = chooseFour([
            { text: expansion(b, i), note: "Correct. The index says how many equal factors to write." },
            { text: expansion(b, i - 1), note: "That is one factor short. The index is " + i + ", so there are " + i + " factors." },
            { text: b + " × " + i, note: "That multiplies the base by the index. The index counts factors instead." },
            { text: expansion(i, b), note: "That swaps the base and the index. The repeated number is " + b + "." },
            { text: expansion(b, i + 1), note: "That is one factor too many for an index of " + i + "." },
            { text: expansion(b + 1, i), note: "The repeated number is " + b + ", not " + (b + 1) + "." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        const right = expansion(b, i);
        question.answerShown = right;
        question.summaryLine = "Expanding " + b + sup(i);
        question.printLine = "Write " + b + sup(i) + " as a repeated multiplication.";
        question.hints = [
            "The small raised number says how many equal factors the power stands for.",
            "Write the base " + b + " down " + i + " times, with a multiplication sign between each pair."
        ];
        question.steps = [
            "The base is " + b + " and the index is " + i + ".",
            "The index counts the equal factors, so " + b + " is written " + i + " times.",
            b + sup(i) + " = " + right + "."
        ];
        return base(question, "Expand the power", "Choose the repeated multiplication this power stands for.");
    }

    function fillReadWords(question, rng, tools) {
        const b = tools.randomInt(rng, 2, 9);
        const i = tools.randomInt(rng, 2, 5);
        question.factKey = "words-" + b + "-" + i;
        question.contextKey = "plain";
        question.given = say(b, i);
        question.givenLabel = "Read aloud";
        question.mode = "choice";
        question.choiceLegend = "Which power is written here?";
        const picked = chooseFour([
            { text: b + sup(i), note: "Correct. The number said first is the base, and the words after it give the index." },
            { text: i + sup(b), note: "That swaps the base and the index. " + b + " is the number being repeated." },
            { text: String(b * i), note: "That multiplies the base by the index. A power repeats the base instead." },
            { text: b + sup((i + 1)), note: "That index is one too many. " + say(b, i) + " has an index of " + i + "." },
            { text: b + sup((i - 1)), note: "That index is one too few for " + say(b, i) + "." },
            { text: (b + 1) + sup(i), note: "The number said first is " + b + ", so that is the base." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = b + sup(i);
        question.summaryLine = "Writing “" + say(b, i) + "” as a power";
        question.printLine = "Write “" + say(b, i) + "” in index notation.";
        question.hints = [
            "The number said first is the one being repeated, so it is the base.",
            "“" + WORDS[i] + "” names the index, which is " + i + "."
        ];
        question.steps = [
            "The number said first, " + b + ", is the base.",
            "“" + WORDS[i] + "” gives the index " + i + ".",
            "So the power is " + b + sup(i) + "."
        ];
        return base(question, "From words to notation", "This power has been read aloud. Choose how it is written.");
    }

    /* --------------------------------------------------- working one out */

    function finishEvaluate(question, b, i, title, prompt) {
        const run = runningProduct(b, i);
        question.display = powerDisplay(b, i);
        question.answerKind = "integer";
        question.answerLabel = "The value";
        question.expected = run.value;
        question.answerShown = String(run.value);
        question.correctNote = "Correct. " + expansion(b, i) + " = " + run.value + ".";
        question.misses = [
            { value: b * i, text: "That multiplies the base by the index. A power multiplies " + i + " copies of " + b + " together instead." },
            { value: pow(b, i - 1), text: "That is " + b + sup((i - 1)) + ", one factor short. The index " + i + " asks for " + i + " factors." },
            { value: b + i, text: "That adds the base and the index. The index counts factors to multiply." }
        ];
        question.hints = [
            "Expand the power first: " + expansion(b, i) + ".",
            "Multiply one factor at a time, keeping the running total: " + (run.steps[0] || (b + " on its own")) + "."
        ];
        question.steps = [expansion(b, i) + " is what the power stands for."]
            .concat(run.steps)
            .concat([b + sup(i) + " = " + run.value + "."]);
        question.summaryLine = "Working out " + b + sup(i);
        question.printLine = "Work out " + b + sup(i) + ".";
        question.factKey = "value-" + b + "-" + i;
        question.contextKey = "plain";
        return base(question, title, prompt);
    }

    function fillEvaluateSquare(question, rng, tools) {
        const b = tools.randomInt(rng, 4, 15);
        return finishEvaluate(question, b, 2, "Work out a square", "Work out the value of this power.");
    }

    function fillEvaluateCube(question, rng, tools) {
        const b = tools.randomInt(rng, 2, 6);
        return finishEvaluate(question, b, 3, "Work out a cube", "Work out the value of this power.");
    }

    function fillEvaluateSmall(question, rng, tools) {
        const draw = tools.pick([[2, 4], [2, 5], [2, 6], [3, 4], [4, 4], [5, 4], [3, 5]], rng);
        return finishEvaluate(question, draw[0], draw[1], "Work out a power", "Work out the value of this power.");
    }

    function fillEvaluateIndexOne(question, rng, tools) {
        const b = tools.randomInt(rng, 3, 19);
        question.factKey = "one-" + b;
        question.contextKey = "plain";
        question.display = powerDisplay(b, 1);
        question.answerKind = "integer";
        question.answerLabel = "The value";
        question.expected = b;
        question.answerShown = String(b);
        question.correctNote = "Correct. An index of 1 means one factor, so the value is the base itself.";
        question.misses = [
            { value: 1, text: "The index is 1, not the value. One factor of " + b + " is " + b + "." },
            { value: b * b, text: "That is " + b + " squared. An index of 1 asks for a single factor." }
        ];
        question.hints = [
            "The index counts the equal factors. Here it is 1.",
            "One factor of " + b + ", with nothing to multiply it by, is " + b + " itself."
        ];
        question.steps = [
            "The index is 1, so the power stands for one factor.",
            "That single factor is " + b + ".",
            b + "¹ = " + b + "."
        ];
        question.summaryLine = "Working out " + b + "¹";
        question.printLine = "Work out " + b + "¹.";
        return base(question, "An index of one", "Work out the value of this power.");
    }

    /* ------------------------------------------- writing a product back */

    function fillProductToPower(question, rng, tools) {
        const b = tools.randomInt(rng, 2, 9);
        const i = tools.randomInt(rng, 3, 6);
        question.factKey = "back-" + b + "-" + i;
        question.contextKey = "plain";
        question.display = { kind: "inline", text: expansion(b, i), ariaLabel: expansion(b, i) };
        question.mode = "parts";
        question.partsLegend = "The power this product folds into";
        question.cells = [
            { label: "Base", expected: String(b) },
            { label: "Index", expected: String(i) }
        ];
        question.partsNote = "The repeated number is the base, and the count of factors is the index.";
        question.correctNote = "Correct. " + i + " factors of " + b + " fold into " + b + sup(i) + ".";
        question.answerShown = b + sup(i);
        question.summaryLine = "Folding " + expansion(b, i) + " into a power";
        question.printLine = "Write " + expansion(b, i) + " as a power.";
        question.hints = [
            "The number that repeats is the base.",
            "Count the factors, not the multiplication signs: there are " + i + " of them."
        ];
        question.steps = [
            "The repeated factor is " + b + ", so the base is " + b + ".",
            "There are " + i + " factors, so the index is " + i + ".",
            expansion(b, i) + " = " + b + sup(i) + "."
        ];
        return base(question, "Write the product as a power", "This product repeats one number. Give the base and the index of the power it folds into.");
    }

    function fillCountFactors(question, rng, tools) {
        const b = tools.randomInt(rng, 2, 7);
        const i = tools.randomInt(rng, 3, 5);
        question.factKey = "count-" + b + "-" + i;
        question.contextKey = "plain";
        question.display = { kind: "inline", text: expansion(b, i), ariaLabel: expansion(b, i) };
        question.mode = "choice";
        question.choiceLegend = "Which power is this product?";
        const picked = chooseFour([
            { text: b + sup(i), note: "Correct. There are " + i + " factors, so the index is " + i + "." },
            { text: b + sup((i - 1)), note: "That counts the multiplication signs. There are " + (i - 1) + " signs but " + i + " factors." },
            { text: (b * i) + sup(i), note: "The base stays " + b + ". Only the count of factors becomes the index." },
            { text: i + sup(b), note: "That swaps the base and the index. The repeated number is " + b + "." },
            { text: b + sup((i + 1)), note: "That is one factor too many for this product." },
            { text: (b + 1) + sup(i), note: "The repeated number here is " + b + "." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = b + sup(i);
        question.summaryLine = "Counting the factors in " + expansion(b, i);
        question.printLine = "Write " + expansion(b, i) + " as a power.";
        question.hints = [
            "The index counts the equal factors themselves.",
            "There are " + (i - 1) + " multiplication signs here, and " + i + " factors."
        ];
        question.steps = [
            "The repeated factor is " + b + ".",
            "Counting the factors gives " + i + ", though there are only " + (i - 1) + " signs.",
            expansion(b, i) + " = " + b + sup(i) + "."
        ];
        return base(question, "Count the factors", "Choose the power this product folds into.");
    }

    function fillTwoBases(question, rng, tools) {
        const first = tools.pick([2, 3, 5], rng);
        const second = tools.drawValid(
            function () { return tools.pick([2, 3, 5, 7], rng); },
            function (value) { return value !== first; },
            first === 2 ? 3 : 2);
        const firstCount = tools.randomInt(rng, 2, 3);
        const secondCount = tools.randomInt(rng, 2, 3);
        const product = expansion(first, firstCount) + " × " + expansion(second, secondCount);
        question.factKey = "two-" + first + firstCount + "-" + second + secondCount;
        question.contextKey = "plain";
        question.display = { kind: "inline", text: product, ariaLabel: product };
        question.mode = "parts";
        question.partsLegend = "The index on each base";
        question.cells = [
            { label: "Index on " + first, expected: String(firstCount) },
            { label: "Index on " + second, expected: String(secondCount) }
        ];
        question.partsNote = "Each base keeps its own count of factors.";
        question.correctNote = "Correct. Two different bases need two powers: " + first + sup(firstCount) + " × " + second + sup(secondCount) + ".";
        question.answerShown = first + sup(firstCount) + " × " + second + sup(secondCount);
        question.summaryLine = "Two bases in " + product;
        question.printLine = "Write " + product + " using powers.";
        question.hints = [
            "Sort the equal factors into groups, one group for each different number.",
            "Count each group on its own: the " + first + "s and the " + second + "s do not combine."
        ];
        question.steps = [
            "The factors are of two different numbers, so they make two powers.",
            "There are " + firstCount + " factors of " + first + " and " + secondCount + " of " + second + ".",
            product + " = " + first + sup(firstCount) + " × " + second + sup(secondCount) + "."
        ];
        return base(question, "Two different bases", "This product repeats two different numbers. Give the index on each base.");
    }

    function fillNotBaseTimesIndex(question, rng, tools) {
        const draw = tools.pick([[3, 4], [2, 5], [5, 3], [4, 3], [2, 6], [3, 3]], rng);
        const b = draw[0];
        const i = draw[1];
        const value = pow(b, i);
        question.factKey = "trap-" + b + "-" + i;
        question.contextKey = "plain";
        question.display = powerDisplay(b, i);
        question.mode = "choice";
        question.choiceLegend = "Which value is this power?";
        const picked = chooseFour([
            { text: String(value), note: "Correct. " + expansion(b, i) + " = " + value + "." },
            { text: String(b * i), note: "That multiplies the base by the index. The index counts factors of " + b + " instead." },
            { text: String(b + i), note: "That adds the base and the index." },
            { text: String(pow(b, i - 1)), note: "That is " + b + sup((i - 1)) + ", one factor short." },
            { text: String(pow(b, i + 1)), note: "That is " + b + sup((i + 1)) + ", one factor too many." },
            { text: String(value + b), note: "That adds one more " + b + " rather than multiplying by it." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = String(value);
        question.summaryLine = "The value of " + b + sup(i);
        question.printLine = "Work out " + b + sup(i) + ".";
        question.hints = [
            "Expand the power before choosing: " + expansion(b, i) + ".",
            "Multiply one factor at a time rather than combining the base and the index."
        ];
        question.steps = [
            b + sup(i) + " stands for " + expansion(b, i) + "."
        ].concat(runningProduct(b, i).steps).concat([b + sup(i) + " = " + value + "."]);
        return base(question, "The value of a power", "Choose the value of this power.");
    }

    const FILLERS = {
        "name-base": fillNameBase,
        "name-index": fillNameIndex,
        "expand-power": fillExpandPower,
        "read-words": fillReadWords,
        "evaluate-square": fillEvaluateSquare,
        "evaluate-cube": fillEvaluateCube,
        "evaluate-small": fillEvaluateSmall,
        "evaluate-index-one": fillEvaluateIndexOne,
        "product-to-power": fillProductToPower,
        "count-factors": fillCountFactors,
        "two-bases": fillTwoBases,
        "not-base-times-index": fillNotBaseTimesIndex
    };

    const api = scope.PracticeEngine.create({
        stages: STAGES,
        lessonUrl: LESSON_URL,
        families: FAMILIES,
        fillers: FILLERS,
        notes: {
            integer: "A power of whole numbers is a whole number, so this answer has no decimal part. Expand the power and multiply one factor at a time.",
            fallback: "Not yet. Expand the power into its equal factors, then multiply them one at a time."
        }
    });

    scope.PowersRootsPractice = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
