/* Practice: cube roots and higher roots.
   The bank of twelve questions; js/practice-engine.js runs the round, marks it
   and drives the page. The generator half runs without a document so it can be
   fuzzed from Node. */
(function (scope) {
    "use strict";

    const LESSON_URL = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/powersAndRoots/cubeAndHigherRoots.html";

    const STAGES = [
        { name: "Cube roots", lessonAnchor: "the-cube-root" },
        { name: "Cube roots of negatives", lessonAnchor: "the-cube-root-of-a-negative" },
        { name: "Higher roots and the order", lessonAnchor: "odd-and-even-roots" }
    ];

    const FAMILIES = [
        ["cube-root-value", "cube-then-root", "edge-of-cube", "root-then-cube"],
        ["negative-cube-root", "cube-a-negative", "no-plus-minus", "sign-of-the-root"],
        ["higher-root", "name-the-order", "even-root-of-negative", "which-orders-reach"]
    ];

    const MINUS = "−";
    /* The cubes the lesson names as worth recalling. */
    const CUBE_ROOTS = [2, 3, 4, 5, 10];
    /* Higher roots kept to values a reader can reach by multiplying up. */
    const HIGHER = [
        { order: 4, root: 2, value: 16 },
        { order: 4, root: 3, value: 81 },
        { order: 5, root: 2, value: 32 },
        { order: 5, root: 3, value: 243 },
        { order: 6, root: 2, value: 64 }
    ];

    function groupDigits(value) {
        return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function signed(value) {
        return value < 0 ? MINUS + groupDigits(Math.abs(value)) : groupDigits(value);
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

    const ORDINAL = { 3: "cube", 4: "fourth", 5: "fifth", 6: "sixth" };

    function rootDisplay(order, radicand, negative) {
        const spoken = (order === 3 ? "the cube root of " : "the " + ORDINAL[order] + " root of ")
            + (negative ? "negative " + String(radicand).replace(MINUS, "") : radicand);
        return { kind: "root", order: String(order), radicand: String(radicand), grouped: Boolean(negative), ariaLabel: spoken };
    }

    function expansion(n, times) {
        const parts = [];
        for (let at = 0; at < times; at += 1) parts.push(n < 0 ? "(" + MINUS + Math.abs(n) + ")" : String(n));
        return parts.join(" × ");
    }

    /* ---------------------------------------------------------- cube roots */

    function fillCubeRootValue(question, rng, tools) {
        const n = tools.pick(CUBE_ROOTS, rng);
        const value = n * n * n;
        question.factKey = "crv-" + n;
        question.contextKey = "plain";
        question.display = rootDisplay(3, groupDigits(value));
        question.answerKind = "integer";
        question.answerLabel = "The root";
        question.expected = n;
        question.answerShown = String(n);
        question.correctNote = "Correct. " + expansion(n, 3) + " = " + groupDigits(value) + ".";
        question.misses = [
            { value: value / 3, text: "That divides by 3, and dividing is not rooting. A cube root asks for three equal factors." },
            { value: n * n, text: "That is " + n + " squared. The order 3 asks for three equal factors, not two." },
            { value: value, text: "That is the number under the sign. The root is the number that was cubed." }
        ];
        question.hints = [
            "A cube root asks which number, used as three equal factors, gives the number under the sign.",
            "The cubes worth recalling are 8, 27, 64, 125 and 1,000."
        ];
        question.steps = [
            groupDigits(value) + " stands under the sign, with an order of 3.",
            "The cubes give " + expansion(n, 3) + " = " + groupDigits(value) + ".",
            "So the cube root of " + groupDigits(value) + " is " + n + ", and cubing " + n + " checks it."
        ];
        question.summaryLine = "The cube root of " + groupDigits(value);
        question.printLine = "Work out the cube root of " + groupDigits(value) + ".";
        return base(question, "A cube root", "Work out this root.");
    }

    function fillCubeThenRoot(question, rng, tools) {
        const n = tools.pick(CUBE_ROOTS, rng);
        const value = n * n * n;
        question.factKey = "ctr-" + n;
        question.contextKey = "plain";
        question.given = expansion(n, 3) + " = " + groupDigits(value);
        question.givenLabel = "Given";
        question.display = rootDisplay(3, groupDigits(value));
        question.answerKind = "integer";
        question.answerLabel = "The root";
        question.expected = n;
        question.answerShown = String(n);
        question.correctNote = "Correct. Rooting undoes the cubing in the line above.";
        question.misses = [
            { value: value, text: "That is the number under the sign. The root is the number that was cubed to make it." },
            { value: n * n, text: "That is " + n + " squared, two factors rather than three." }
        ];
        question.hints = [
            "The line above has already done the cubing.",
            "A cube root reverses it, so the answer is the number that was used three times."
        ];
        question.steps = [
            "The given fact is " + expansion(n, 3) + " = " + groupDigits(value) + ".",
            "A cube root is the inverse of cubing.",
            "So the cube root of " + groupDigits(value) + " is " + n + "."
        ];
        question.summaryLine = "Using " + expansion(n, 3) + " to find a cube root";
        question.printLine = "Given " + expansion(n, 3) + " = " + groupDigits(value) + ", work out the cube root of " + groupDigits(value) + ".";
        return base(question, "Undo the cubing", "Use the fact above to work out this root.");
    }

    function fillEdgeOfCube(question, rng, tools) {
        const n = tools.pick([2, 3, 4, 5], rng);
        const volume = n * n * n;
        question.factKey = "edge-" + n;
        question.contextKey = "cube";
        question.given = "Volume " + volume + " cm³";
        question.givenLabel = "A cube";
        question.unitSuffix = "cm";
        question.answerKind = "integer";
        question.answerLabel = "The edge length";
        question.expected = n;
        question.answerShown = n + " cm";
        question.correctNote = "Correct. A cube of edge " + n + " cm has a volume of " + volume + " cm³.";
        question.misses = [
            { value: volume / 3, text: "That divides the volume by 3. The edge is the number used as three equal factors." },
            { value: n * n, text: "That is the area of one face, not the edge." }
        ];
        question.hints = [
            "A cube's volume is its edge multiplied by itself three times.",
            "So the edge is the cube root of " + volume + "."
        ];
        question.steps = [
            "A cube has volume = edge × edge × edge.",
            "The edge is therefore the cube root of " + volume + ".",
            expansion(n, 3) + " = " + volume + ", so the edge is " + n + " cm."
        ];
        question.summaryLine = "The edge of a cube of volume " + volume + " cm³";
        question.printLine = "A cube has volume " + volume + " cm³. How long is each edge?";
        return base(question, "The edge of a cube", "A cube has the volume shown. Work out the length of one edge.");
    }

    function fillRootThenCube(question, rng, tools) {
        const n = tools.pick(CUBE_ROOTS, rng);
        const value = n * n * n;
        question.factKey = "rtc-" + n;
        question.contextKey = "plain";
        question.given = "The cube root of a number is " + n;
        question.givenLabel = "Given";
        question.answerKind = "integer";
        question.answerLabel = "The number under the sign";
        question.expected = value;
        question.answerShown = groupDigits(value);
        question.correctNote = "Correct. Cubing the root returns the number under the sign.";
        question.misses = [
            { value: n * 3, text: "That multiplies " + n + " by 3. Cubing uses three equal factors of " + n + "." },
            { value: n * n, text: "That is " + n + " squared, two factors rather than three." }
        ];
        question.hints = [
            "Cubing is what undoes a cube root.",
            "Work it in two steps: " + n + " × " + n + " = " + (n * n) + ", then × " + n + "."
        ];
        question.steps = [
            "The cube root is " + n + ".",
            "Cubing the root returns the number that stood under the sign.",
            expansion(n, 3) + " = " + groupDigits(value) + "."
        ];
        question.summaryLine = "Cubing a root of " + n + " back to " + groupDigits(value);
        question.printLine = "The cube root of a number is " + n + ". What is the number?";
        return base(question, "Work back to the number", "This is the value of a cube root. Work out the number that was under the sign.");
    }

    /* ------------------------------------------ cube roots of negatives */

    function fillNegativeCubeRoot(question, rng, tools) {
        const n = tools.pick(CUBE_ROOTS, rng);
        const value = n * n * n;
        question.factKey = "ncr-" + n;
        question.contextKey = "plain";
        question.display = rootDisplay(3, MINUS + groupDigits(value), true);
        question.answerKind = "integer";
        question.answerLabel = "The root";
        question.expected = -n;
        question.answerShown = MINUS + n;
        question.correctNote = "Correct. " + expansion(-n, 3) + " = " + MINUS + groupDigits(value) + ".";
        question.misses = [
            { value: n, text: expansion(n, 3) + " = " + groupDigits(value) + ", which is positive. The root of a negative is negative when the order is odd." },
            { value: -value, text: "That is the number under the sign. The root is the number used as three equal factors." },
            { value: -(value / 3), text: "That divides by 3, and dividing is not rooting." }
        ];
        question.hints = [
            "Three equal factors are needed, and their product has to come out negative.",
            "An odd count of negative factors leaves the product negative."
        ];
        question.steps = [
            MINUS + groupDigits(value) + " stands under the sign, with an order of 3.",
            "Three negative factors multiply to a negative: " + expansion(-n, 3) + " = " + MINUS + groupDigits(value) + ".",
            "So the cube root of " + MINUS + groupDigits(value) + " is " + MINUS + n + "."
        ];
        question.summaryLine = "The cube root of " + MINUS + groupDigits(value);
        question.printLine = "Work out the cube root of " + MINUS + groupDigits(value) + ".";
        return base(question, "A cube root of a negative", "Work out this root.");
    }

    function fillCubeANegative(question, rng, tools) {
        const n = tools.pick([2, 3, 4, 5], rng);
        const value = n * n * n;
        question.factKey = "can-" + n;
        question.contextKey = "plain";
        question.display = { kind: "power", base: "(" + MINUS + n + ")", index: "3",
            ariaLabel: "negative " + n + " cubed" };
        question.answerKind = "integer";
        question.answerLabel = "The value";
        question.expected = -value;
        question.answerShown = MINUS + value;
        question.correctNote = "Correct. Three negative factors leave the product negative.";
        question.misses = [
            { value: value, text: "The first two negative factors give a positive, and the third turns it negative again." },
            { value: -n * 3, text: "That multiplies " + MINUS + n + " by 3. Cubing uses three equal factors." }
        ];
        question.hints = [
            "The brackets hold the minus inside the cubing, so all three factors are negative.",
            "Two negatives give a positive; the third makes it negative again."
        ];
        question.steps = [
            "(" + MINUS + n + ")³ means " + expansion(-n, 3) + ".",
            "The first two factors give " + (n * n) + ", and the third turns it negative.",
            "So (" + MINUS + n + ")³ = " + MINUS + value + "."
        ];
        question.summaryLine = "Cubing " + MINUS + n;
        question.printLine = "Work out (" + MINUS + n + ")³.";
        return base(question, "Cubing a negative", "Work out the value of this cube.");
    }

    function fillNoPlusMinus(question, rng, tools) {
        const n = tools.pick(CUBE_ROOTS, rng);
        const value = n * n * n;
        question.factKey = "npm-" + n;
        question.contextKey = "plain";
        question.display = rootDisplay(3, MINUS + groupDigits(value), true);
        question.mode = "choice";
        question.choiceLegend = "What is this root?";
        const picked = chooseFour([
            { text: MINUS + n, note: "Correct. One number on the line cubes to " + MINUS + groupDigits(value) + ", so there is nothing for ± to separate." },
            { text: "±" + n, note: "± separates two values, and " + expansion(n, 3) + " = " + groupDigits(value) + ", which is positive. Only " + MINUS + n + " cubes to " + MINUS + groupDigits(value) + "." },
            { text: String(n), note: expansion(n, 3) + " = " + groupDigits(value) + ", which is positive, not " + MINUS + groupDigits(value) + "." },
            { text: "No value on the line", note: "An odd order reaches every number on the line, so this root does have a value." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = MINUS + n;
        question.hints = [
            "Ask how many numbers on the line cube to " + MINUS + groupDigits(value) + ".",
            "An odd order reaches each number once, so there is no second value to record."
        ];
        question.steps = [
            "An odd order reaches every number on the line, and reaches each one once.",
            expansion(-n, 3) + " = " + MINUS + groupDigits(value) + ", and no other number does.",
            "So the root is " + MINUS + n + ", with nothing for ± to separate."
        ];
        question.summaryLine = "Why a cube root takes no ±";
        question.printLine = "Work out the cube root of " + MINUS + groupDigits(value) + ".";
        return base(question, "One root, not two", "Choose the value of this root.");
    }

    function fillSignOfTheRoot(question, rng, tools) {
        const draw = tools.pick(HIGHER.concat([{ order: 3, root: 3, value: 27 }, { order: 3, root: 4, value: 64 }]), rng);
        const negative = draw.order % 2 === 1;
        const under = negative ? MINUS + groupDigits(draw.value) : groupDigits(draw.value);
        question.factKey = "sotr-" + draw.order + "-" + draw.root + "-" + (negative ? "n" : "p");
        question.contextKey = "plain";
        question.display = rootDisplay(draw.order, under, negative);
        question.mode = "choice";
        question.choiceLegend = "What sign does this root carry?";
        const picked = chooseFour([
            { text: negative ? "Negative" : "Positive",
              note: negative
                ? "Correct. The order " + draw.order + " is odd, so an odd count of negative factors reaches a negative number."
                : "Correct. The number under the sign is positive, and the sign names the non-negative root." },
            { text: negative ? "Positive" : "Negative",
              note: negative
                ? "An odd order reaches a negative number, and it does so with a negative root."
                : "The sign names the non-negative root of a positive number." },
            { text: "Either, so it needs ±",
              note: draw.order % 2 === 1
                ? "An odd order reaches each number once, so there is no second value."
                : "The sign names one value, the non-negative one, even when two numbers reach it." },
            { text: "It has no value on the line",
              note: "This root does have a value on the line." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = negative ? "Negative" : "Positive";
        question.hints = [
            "Look at the order in the crook, and at the sign of the number under the sign.",
            "An odd order reaches every number on the line; an even order reaches none that is negative."
        ];
        question.steps = [
            "The order is " + draw.order + " and the number under the sign is " + under + ".",
            negative
                ? "An odd count of negative factors leaves a negative product, so the root is negative."
                : "The number under the sign is positive, and the sign names the non-negative root.",
            "So the root is " + (negative ? "negative" : "positive") + "."
        ];
        question.summaryLine = "The sign of a root of order " + draw.order;
        question.printLine = "What sign does the " + (draw.order === 3 ? "cube" : ORDINAL[draw.order]) + " root of " + under + " carry?";
        return base(question, "The sign of the root", "Decide what sign this root carries.");
    }

    /* -------------------------------------------- higher roots and order */

    function fillHigherRoot(question, rng, tools) {
        const draw = tools.pick(HIGHER, rng);
        question.factKey = "hr-" + draw.order + "-" + draw.root;
        question.contextKey = "plain";
        question.display = rootDisplay(draw.order, groupDigits(draw.value));
        question.answerKind = "integer";
        question.answerLabel = "The root";
        question.expected = draw.root;
        question.answerShown = String(draw.root);
        question.correctNote = "Correct. " + expansion(draw.root, draw.order) + " = " + groupDigits(draw.value) + ".";
        question.misses = [
            { value: draw.value / draw.order, text: "That divides by the order, and dividing is not rooting." },
            { value: draw.root + 1, text: expansion(draw.root + 1, draw.order).split(" × ")[0] + " used " + draw.order + " times gives a much larger number than " + groupDigits(draw.value) + "." },
            { value: draw.order, text: "That is the order in the crook, not the value of the root." }
        ];
        question.hints = [
            "The order in the crook says how many equal factors the root is looking for.",
            "Try small numbers, multiplying one factor at a time until you reach " + groupDigits(draw.value) + "."
        ];
        question.steps = [
            "The order is " + draw.order + ", so the root is the number that " + draw.order + " equal factors multiply to make.",
            expansion(draw.root, draw.order) + " = " + groupDigits(draw.value) + ".",
            "So the root is " + draw.root + "."
        ];
        question.summaryLine = "The " + ORDINAL[draw.order] + " root of " + groupDigits(draw.value);
        question.printLine = "Work out the " + ORDINAL[draw.order] + " root of " + groupDigits(draw.value) + ".";
        return base(question, "A higher root", "Work out this root.");
    }

    function fillNameTheOrder(question, rng, tools) {
        const draw = tools.pick(HIGHER, rng);
        question.factKey = "nto-" + draw.order + "-" + draw.root;
        question.contextKey = "plain";
        question.given = expansion(draw.root, draw.order) + " = " + groupDigits(draw.value);
        question.givenLabel = "Given";
        question.answerKind = "integer";
        question.answerLabel = "The order of the root";
        question.expected = draw.order;
        question.answerShown = String(draw.order);
        question.correctNote = "Correct. " + draw.order + " equal factors means an order of " + draw.order + ".";
        question.misses = [
            { value: draw.order - 1, text: "That counts the multiplication signs. There are " + (draw.order - 1) + " signs but " + draw.order + " factors." },
            { value: draw.root, text: "That is the repeated number, which is the value of the root, not its order." }
        ];
        question.hints = [
            "The order counts the equal factors.",
            "Count the factors themselves, not the multiplication signs between them."
        ];
        question.steps = [
            "The product repeats " + draw.root + ".",
            "There are " + draw.order + " factors, and " + (draw.order - 1) + " signs.",
            "So " + groupDigits(draw.value) + " needs a root of order " + draw.order + " to return " + draw.root + "."
        ];
        question.summaryLine = "The order that takes " + groupDigits(draw.value) + " back to " + draw.root;
        question.printLine = "What order of root takes " + groupDigits(draw.value) + " back to " + draw.root + "?";
        return base(question, "Name the order", "This product folds into a power. What order of root takes it back to the repeated number?");
    }

    function fillEvenRootOfNegative(question, rng, tools) {
        const draw = tools.pick(HIGHER.filter(function (h) { return h.order % 2 === 0; }), rng);
        const under = MINUS + groupDigits(draw.value);
        question.factKey = "ern-" + draw.order + "-" + draw.root;
        question.contextKey = "plain";
        question.display = rootDisplay(draw.order, under, true);
        question.mode = "choice";
        question.choiceLegend = "What is this root?";
        const picked = chooseFour([
            { text: "No value on the number line", note: "Correct. The order " + draw.order + " is even, and an even count of negative factors leaves a positive product." },
            { text: MINUS + draw.root, note: expansion(-draw.root, draw.order) + " comes to " + groupDigits(draw.value) + ", which is positive." },
            { text: "±" + draw.root, note: "Squaring or raising either value to an even power gives a positive number, not " + under + "." },
            { text: String(draw.root), note: expansion(draw.root, draw.order) + " = " + groupDigits(draw.value) + ", which is positive, not " + under + "." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = "No value on the number line";
        question.hints = [
            "The order in the crook is " + draw.order + ". Is it odd or even?",
            "An even count of negative factors leaves a positive product."
        ];
        question.steps = [
            "The order is " + draw.order + ", which is even.",
            "An even count of negative factors leaves a positive product, and an even count of positive ones does too.",
            "So no number on the line has a " + draw.order + "th power of " + under + "."
        ];
        question.summaryLine = "An even root of " + under;
        question.printLine = "Work out the " + ORDINAL[draw.order] + " root of " + under + ".";
        return base(question, "An even root of a negative", "Choose the value of this root.");
    }

    function fillWhichOrdersReach(question, rng, tools) {
        const k = tools.pick([8, 27, 32, 64, 243], rng);
        question.factKey = "wor-" + k;
        question.contextKey = "plain";
        question.given = MINUS + k;
        question.givenLabel = "The number";
        question.mode = "choice";
        question.choiceLegend = "Which orders of root reach this number?";
        const picked = chooseFour([
            { text: "Odd orders only", note: "Correct. An odd count of negative factors leaves a negative product; an even count leaves a positive one." },
            { text: "Even orders only", note: "An even count of negative factors gives a positive product, so an even order reaches no negative number." },
            { text: "Every order", note: "An even order reaches no negative number on the line." },
            { text: "No order at all", note: "An odd order does reach " + MINUS + k + ": its root is negative." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = "Odd orders only";
        question.hints = [
            "A root of order n asks for n equal factors.",
            "Count how the sign of a product turns over as the count of negative factors rises."
        ];
        question.steps = [
            MINUS + k + " is negative, so its factors must include an odd count of negatives.",
            "An odd order gives an odd count of equal negative factors, leaving a negative product.",
            "An even order leaves a positive product, so only odd orders reach " + MINUS + k + "."
        ];
        question.summaryLine = "Which orders reach " + MINUS + k;
        question.printLine = "Which orders of root reach " + MINUS + k + "?";
        return base(question, "Odd and even orders", "Choose which orders of root reach this number on the number line.");
    }

    const FILLERS = {
        "cube-root-value": fillCubeRootValue,
        "cube-then-root": fillCubeThenRoot,
        "edge-of-cube": fillEdgeOfCube,
        "root-then-cube": fillRootThenCube,
        "negative-cube-root": fillNegativeCubeRoot,
        "cube-a-negative": fillCubeANegative,
        "no-plus-minus": fillNoPlusMinus,
        "sign-of-the-root": fillSignOfTheRoot,
        "higher-root": fillHigherRoot,
        "name-the-order": fillNameTheOrder,
        "even-root-of-negative": fillEvenRootOfNegative,
        "which-orders-reach": fillWhichOrdersReach
    };

    const api = scope.PracticeEngine.create({
        stages: STAGES,
        lessonUrl: LESSON_URL,
        families: FAMILIES,
        fillers: FILLERS,
        notes: {
            integer: "These roots are whole numbers, so this answer has no decimal part. Multiply one factor at a time to check it.",
            fallback: "Not yet. The order in the crook says how many equal factors the root is looking for, so check your answer by raising it to that power."
        }
    });

    scope.CubeAndHigherRootsPractice = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
