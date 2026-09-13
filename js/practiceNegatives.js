/* Practice: adding and subtracting negative numbers.

   The bank of twelve questions; js/practice-engine.js runs the round, marks it
   and drives the page. The generator half runs without a document so it can be
   fuzzed from Node.

   The three stages are the lesson's own three sections, so a reader sent back
   from the reflection lands on the section that was being practised. */
(function (scope) {
    "use strict";

    const LESSON_URL = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/directedNumber/addingSubtractingNegatives.html";
    const MINUS = "−";

    const STAGES = [
        { name: "Moving along the line", lessonAnchor: "moving-along-the-line" },
        { name: "Two signs meeting", lessonAnchor: "two-signs-meeting" },
        { name: "The gap between two numbers", lessonAnchor: "the-gap-between-two-numbers" }
    ];

    const FAMILIES = [
        ["start-negative-add", "cross-zero-subtract", "negative-minus", "decimal-step"],
        ["minus-minus", "plus-minus", "negative-minus-negative", "decimal-double-sign"],
        ["temperature-gap", "balance-after", "gap-choice", "gap-both-negative"]
    ];

    /* Written the way the lesson writes them: a true minus sign, and a
       negative number in brackets when it stands after an operator. */
    function neg(value) { return MINUS + Math.abs(value); }
    function signed(value) { return value < 0 ? neg(value) : String(value); }
    function bracketed(value) { return "(" + neg(value) + ")"; }
    function spoken(value) { return value < 0 ? "negative " + Math.abs(value) : String(value); }
    function tidy(value) { return Math.round(value * 100) / 100; }
    /* A tenth that is really there. Dividing a plain draw by ten lands on a
       whole number whenever the draw is a multiple of ten, and a question
       announcing a decimal then shows none — one in five of them, for the
       quotient. */
    function tenths(rng, tools, lo, hi) {
        const n = tools.randomInt(rng, lo, hi);
        return (n % 10 === 0 ? n + 1 : n) / 10;
    }

    function inline(text, ariaLabel) { return { kind: "inline", text: text, ariaLabel: ariaLabel }; }

    function base(question, title, prompt) {
        question.title = title;
        question.prompt = prompt;
        return question;
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

    /* ------------------------------------------- moving along the line */

    function fillStartNegativeAdd(question, rng, tools) {
        const a = tools.randomInt(rng, 3, 12);
        /* spoken as "b steps", so never one */
        const b = tools.randomInt(rng, 2, 15);
        const answer = b - a;
        question.factKey = "sna-" + a + "-" + b;
        question.contextKey = "plain";
        question.display = inline(neg(a) + " + " + b, spoken(-a) + " plus " + b);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = signed(answer);
        question.correctNote = "Correct. From " + neg(a) + ", " + b + " steps to the right land on " + signed(answer) + ".";
        question.misses = [
            { value: -(a + b), text: "Adding moves to the right, not further left. " + neg(a) + " + " + b + " is " + signed(answer) + ", not " + neg(a + b) + "." },
            { value: a - b, text: "That is the right size with the wrong sign. Starting at " + neg(a) + " and moving right reaches " + signed(answer) + "." }
        ];
        question.hints = [
            "Start at " + neg(a) + " on the line. Adding " + b + " moves " + b + " steps to the right.",
            "From " + neg(a) + ", " + a + " steps reach zero, and " + (b > a ? b - a + " more continue past it." : "the move stops " + (a - b) + " short of it.")
        ];
        question.steps = [
            "Start at " + neg(a) + " on the number line.",
            "Adding " + b + " moves " + b + " steps to the right.",
            neg(a) + " + " + b + " = " + signed(answer) + "."
        ];
        question.summaryLine = neg(a) + " + " + b;
        question.printLine = "Work out " + neg(a) + " + " + b + ".";
        return base(question, "Adding to a negative number", "Work out this calculation.");
    }

    function fillCrossZeroSubtract(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 9);
        const b = a + tools.randomInt(rng, 2, 12);
        const answer = a - b;
        question.factKey = "czs-" + a + "-" + b;
        question.contextKey = "plain";
        question.display = inline(a + " " + MINUS + " " + b, a + " minus " + b);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = signed(answer);
        question.correctNote = "Correct. " + a + " steps reach zero and " + (b - a) + " more carry on past it to " + signed(answer) + ".";
        question.misses = [
            { value: b - a, text: "That takes the smaller number from the larger. " + a + " " + MINUS + " " + b + " starts at " + a + " and moves " + b + " steps left, which passes zero." },
            { value: -(a + b), text: "Only " + b + " is taken away, so the move is " + b + " steps left from " + a + ", landing on " + signed(answer) + "." }
        ];
        question.hints = [
            "Start at " + a + " and move " + b + " steps to the left.",
            a + " of those steps reach zero, and the remaining " + (b - a) + " carry on below it."
        ];
        question.steps = [
            "Start at " + a + " and move " + b + " steps to the left.",
            "The first " + a + " steps reach zero, leaving " + (b - a) + " steps still to take.",
            "Those land on " + signed(answer) + ", so " + a + " " + MINUS + " " + b + " = " + signed(answer) + "."
        ];
        question.summaryLine = a + " " + MINUS + " " + b;
        question.printLine = "Work out " + a + " " + MINUS + " " + b + ".";
        return base(question, "Subtracting past zero", "Work out this calculation.");
    }

    function fillNegativeMinus(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 12);
        const b = tools.randomInt(rng, 2, 12);
        const answer = -a - b;
        question.factKey = "nm-" + a + "-" + b;
        question.contextKey = "plain";
        question.display = inline(neg(a) + " " + MINUS + " " + b, spoken(-a) + " minus " + b);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = signed(answer);
        question.correctNote = "Correct. Both moves go left, so they add up to " + (a + b) + " steps below zero.";
        question.misses = [
            { value: a + b, text: "That is the right size with the wrong sign. Starting at " + neg(a) + " and moving left reaches " + signed(answer) + "." },
            { value: b - a, text: "Subtracting moves left, not right. From " + neg(a) + ", " + b + " steps left reach " + signed(answer) + "." },
            { value: -(Math.abs(a - b)), text: "The two numbers are not being compared here. Both moves go the same way, so they total " + (a + b) + " steps left of zero." }
        ];
        question.hints = [
            "Start at " + neg(a) + ". Subtracting " + b + " moves a further " + b + " steps to the left.",
            "Both moves head away from zero, so the distances add: " + a + " + " + b + " = " + (a + b) + "."
        ];
        question.steps = [
            "Start at " + neg(a) + ", which is " + a + " steps left of zero.",
            "Subtracting " + b + " moves " + b + " further steps left.",
            "That is " + (a + b) + " steps left of zero, so " + neg(a) + " " + MINUS + " " + b + " = " + signed(answer) + "."
        ];
        question.summaryLine = neg(a) + " " + MINUS + " " + b;
        question.printLine = "Work out " + neg(a) + " " + MINUS + " " + b + ".";
        return base(question, "A negative, then a subtraction", "Work out this calculation.");
    }

    function fillDecimalStep(question, rng, tools) {
        const a = tenths(rng, tools, 11, 89);
        const b = tenths(rng, tools, 11, 89);
        const answer = tidy(b - a);
        question.factKey = "ds-" + a + "-" + b;
        question.contextKey = "plain";
        question.display = inline(neg(a) + " + " + b, spoken(-a) + " plus " + b);
        question.answerKind = "decimal";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = signed(answer);
        question.correctNote = "Correct. A decimal moves along the same line as a whole number.";
        question.misses = [
            { value: tidy(-(a + b)), text: "Adding moves to the right. From " + neg(a) + ", " + b + " to the right reaches " + signed(answer) + "." },
            { value: tidy(a - b), text: "That is the right size with the wrong sign: the move starts at " + neg(a) + " and ends at " + signed(answer) + "." }
        ];
        question.hints = [
            "A decimal sits between the whole numbers but moves along the line the same way.",
            "From " + neg(a) + ", moving " + b + " to the right passes zero " + (b > a ? "and carries on." : "only if the move is longer than " + a + ".")
        ];
        question.steps = [
            "Start at " + neg(a) + " on the line.",
            "Adding " + b + " moves " + b + " to the right.",
            neg(a) + " + " + b + " = " + signed(answer) + "."
        ];
        question.summaryLine = neg(a) + " + " + b;
        question.printLine = "Work out " + neg(a) + " + " + b + ".";
        return base(question, "A step in decimals", "Work out this calculation.");
    }

    /* ------------------------------------------------ two signs meeting */

    function fillMinusMinus(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 14);
        const b = tools.randomInt(rng, 2, 9);
        const answer = a + b;
        question.factKey = "mm-" + a + "-" + b;
        question.contextKey = "plain";
        question.display = inline(a + " " + MINUS + " " + bracketed(b), a + " minus negative " + b);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. Taking away a negative moves to the right, so " + a + " " + MINUS + " " + bracketed(b) + " = " + a + " + " + b + ".";
        question.misses = [
            { value: a - b, text: "That subtracts " + b + ". The two signs meet and turn the move round, so " + b + " is added instead." },
            { value: -(a + b), text: "The size is right. The move goes to the right from " + a + ", landing on " + answer + "." },
            { value: b - a, text: "The move starts at " + a + " and goes right, so it ends at " + answer + "." }
        ];
        question.hints = [
            "Two signs meet between the " + a + " and the " + b + ". Read what they do together.",
            "Taking away a debt leaves more, not less: " + a + " " + MINUS + " " + bracketed(b) + " = " + a + " + " + b + "."
        ];
        question.steps = [
            "The minus and the negative sign meet between the two numbers.",
            "Taking away " + neg(b) + " is the same as adding " + b + ".",
            a + " + " + b + " = " + answer + "."
        ];
        question.summaryLine = a + " " + MINUS + " " + bracketed(b);
        question.printLine = "Work out " + a + " " + MINUS + " " + bracketed(b) + ".";
        return base(question, "A minus against a bracket", "Work out this calculation.");
    }

    function fillPlusMinus(question, rng, tools) {
        const a = tools.randomInt(rng, 3, 15);
        const b = tools.randomInt(rng, 2, 12);
        const answer = a - b;
        question.factKey = "pm-" + a + "-" + b;
        question.contextKey = "plain";
        question.display = inline(a + " + " + bracketed(b), a + " plus negative " + b);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = signed(answer);
        question.correctNote = "Correct. Adding a negative moves to the left, so " + a + " + " + bracketed(b) + " = " + a + " " + MINUS + " " + b + ".";
        question.misses = [
            { value: a + b, text: "The number being added is " + neg(b) + ", which moves " + b + " steps to the left." },
            { value: -(a + b), text: "Only " + b + " steps are taken, starting from " + a + ", so the move ends at " + signed(answer) + "." }
        ];
        question.hints = [
            "The number being added is " + neg(b) + ". Which way along the line does that move?",
            "Adding " + neg(b) + " is the same as subtracting " + b + "."
        ];
        question.steps = [
            "The two signs meet between the numbers.",
            "Adding " + neg(b) + " is the same as subtracting " + b + ".",
            a + " " + MINUS + " " + b + " = " + signed(answer) + "."
        ];
        question.summaryLine = a + " + " + bracketed(b);
        question.printLine = "Work out " + a + " + " + bracketed(b) + ".";
        return base(question, "A plus against a bracket", "Work out this calculation.");
    }

    function fillNegativeMinusNegative(question, rng, tools) {
        const a = tools.randomInt(rng, 2, 12);
        const b = tools.randomInt(rng, 2, 14);
        const answer = b - a;
        question.factKey = "nmn-" + a + "-" + b;
        question.contextKey = "plain";
        question.display = inline(neg(a) + " " + MINUS + " " + bracketed(b), spoken(-a) + " minus negative " + b);
        question.answerKind = "integer";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = signed(answer);
        question.correctNote = "Correct. The two signs turn the move round, so " + b + " is added to " + neg(a) + ".";
        question.misses = [
            { value: -(a + b), text: "Taking away a negative moves to the right. From " + neg(a) + ", " + b + " to the right reaches " + signed(answer) + "." },
            { value: -(Math.abs(b - a)), text: "The size is right. Starting at " + neg(a) + " and moving " + b + " right lands on " + signed(answer) + "." }
        ];
        question.hints = [
            "Two signs meet between the numbers. Read them together before moving.",
            "Taking away " + neg(b) + " adds " + b + ", so start at " + neg(a) + " and move " + b + " to the right."
        ];
        question.steps = [
            "The minus and the negative sign meet between the numbers.",
            "Taking away " + neg(b) + " is the same as adding " + b + ".",
            neg(a) + " + " + b + " = " + signed(answer) + "."
        ];
        question.summaryLine = neg(a) + " " + MINUS + " " + bracketed(b);
        question.printLine = "Work out " + neg(a) + " " + MINUS + " " + bracketed(b) + ".";
        return base(question, "A negative taking away a negative", "Work out this calculation.");
    }

    function fillDecimalDoubleSign(question, rng, tools) {
        const a = tenths(rng, tools, 11, 99);
        const b = tenths(rng, tools, 11, 79);
        const answer = tidy(a + b);
        question.factKey = "dds-" + a + "-" + b;
        question.contextKey = "plain";
        question.display = inline(a + " " + MINUS + " " + bracketed(b), a + " minus negative " + b);
        question.answerKind = "decimal";
        question.answerLabel = "The answer";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. The decimal changes nothing about the two signs: " + a + " + " + b + " = " + answer + ".";
        question.misses = [
            { value: tidy(a - b), text: "That subtracts " + b + ". The two signs meet and turn the move round, so " + b + " is added." },
            { value: tidy(-(a + b)), text: "The size is right. The move goes right from " + a + ", landing on " + answer + "." }
        ];
        question.hints = [
            "The decimal makes no difference to what the two signs do.",
            "Taking away " + neg(b) + " is the same as adding " + b + "."
        ];
        question.steps = [
            "The minus and the negative sign meet between the numbers.",
            "Taking away " + neg(b) + " is the same as adding " + b + ".",
            a + " + " + b + " = " + answer + "."
        ];
        question.summaryLine = a + " " + MINUS + " " + bracketed(b);
        question.printLine = "Work out " + a + " " + MINUS + " " + bracketed(b) + ".";
        return base(question, "Two signs, in decimals", "Work out this calculation.");
    }

    /* ------------------------------------- the gap between two numbers */

    function fillTemperatureGap(question, rng, tools) {
        const cold = tools.randomInt(rng, 2, 14);
        /* spoken as "warm degrees" */
        const warm = tools.randomInt(rng, 2, 12);
        const answer = cold + warm;
        question.factKey = "tg-" + cold + "-" + warm;
        question.contextKey = "temperature";
        question.given = neg(cold) + " °C to " + warm + " °C";
        question.givenLabel = "The change";
        question.answerKind = "integer";
        question.answerLabel = "Degrees risen";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. " + cold + " degrees reach zero and " + warm + " more carry on above it.";
        question.misses = [
            { value: Math.abs(warm - cold), text: "That takes one size from the other. The gap runs " + cold + " degrees up to zero and " + warm + " more above it." },
            { value: cold, text: "That is only the part below zero. The rise carries on " + warm + " degrees above it." },
            { value: warm, text: "That is only the part above zero. The rise starts " + cold + " degrees below it." }
        ];
        question.hints = [
            "Count the gap in two pieces: up to zero, then on from zero.",
            "From " + neg(cold) + " °C to 0 °C is " + cold + " degrees, and 0 °C to " + warm + " °C is " + warm + " more."
        ];
        question.steps = [
            "The temperature starts " + cold + " degrees below zero and finishes " + warm + " degrees above it.",
            "From " + neg(cold) + " °C up to 0 °C is " + cold + " degrees.",
            "From 0 °C up to " + warm + " °C is " + warm + " degrees, so the rise is " + cold + " + " + warm + " = " + answer + " degrees."
        ];
        question.summaryLine = "Rise from " + neg(cold) + " °C to " + warm + " °C";
        question.printLine = "The temperature rises from " + neg(cold) + " °C to " + warm + " °C. How many degrees is the rise?";
        return base(question, "A rise through zero", "How many degrees does the temperature rise?");
    }

    function fillBalanceAfter(question, rng, tools) {
        const owed = tools.randomInt(rng, 15, 90);
        /* The hint names the opening balance, so a deposit of exactly twice it
           would put the answer into the hint by coincidence. */
        let paid = tools.randomInt(rng, 10, 140);
        if (paid === owed * 2) paid = paid + 1;
        /* The balance is spoken as "… pounds", so a balance of one is avoided.
           Moving by two has to follow the sign: adding two to a difference of
           minus one lands on plus one, which is the case being avoided. */
        if (Math.abs(paid - owed) === 1) paid = paid + (paid > owed ? 2 : -2);
        const answer = paid - owed;
        question.factKey = "ba-" + owed + "-" + paid;
        question.contextKey = "money";
        question.given = "Balance " + neg(owed) + " pounds, then " + paid + " pounds paid in";
        question.givenLabel = "The account";
        question.answerKind = "integer";
        question.answerLabel = "New balance, in pounds";
        question.expected = answer;
        question.answerShown = signed(answer);
        question.correctNote = "Correct. Paying in moves the balance to the right along the line.";
        question.misses = [
            { value: -(owed + paid), text: "Paying in moves the balance up, not further down. " + neg(owed) + " + " + paid + " = " + signed(answer) + "." },
            { value: owed - paid, text: "That is the right size with the wrong sign. The balance starts at " + neg(owed) + " and rises to " + signed(answer) + "." }
        ];
        question.hints = [
            "A balance of " + neg(owed) + " pounds sits " + owed + " below zero on the line.",
            "Paying in " + paid + " moves " + paid + " to the right from " + neg(owed) + "."
        ];
        question.steps = [
            "The balance starts at " + neg(owed) + " pounds.",
            "Paying in " + paid + " pounds adds " + paid + ", moving right along the line.",
            neg(owed) + " + " + paid + " = " + signed(answer) + ", so the new balance is " + signed(answer) + " pounds."
        ];
        question.summaryLine = "Balance " + neg(owed) + " after " + paid + " paid in";
        question.printLine = "An account has a balance of " + neg(owed) + " pounds. " + paid + " pounds is paid in. What is the new balance?";
        return base(question, "A balance rising", "Work out the new balance.");
    }

    function fillGapChoice(question, rng, tools) {
        const low = tools.randomInt(rng, 3, 12);
        /* The two wrong options are high − low and low − high, so equal values
           would render the same text twice and leave three distinct options. */
        let high = tools.randomInt(rng, 2, 11);
        if (high === low) high = high === 11 ? 10 : high + 1;
        const answer = low + high;
        question.factKey = "gc-" + low + "-" + high;
        question.contextKey = "structure";
        question.mode = "choice";
        question.choiceLegend = "Which calculation gives the gap between " + neg(low) + " and " + high + "?";
        const picked = chooseFour([
            { text: high + " " + MINUS + " " + bracketed(low), note: "Correct. Taking away " + neg(low) + " adds " + low + ", giving " + high + " + " + low + " = " + answer + "." },
            { text: high + " " + MINUS + " " + low, note: "That subtracts " + low + " instead of taking away " + neg(low) + ", and gives " + signed(high - low) + "." },
            { text: low + " " + MINUS + " " + high, note: "That compares the two sizes and gives " + signed(low - high) + ". The gap is counted along the line instead." },
            { text: neg(low) + " " + MINUS + " " + high, note: "That moves further below zero, to " + neg(low + high) + ", rather than measuring across to " + high + "." }
        ], rng, tools);
        question.options = picked.options;
        question.optionNotes = picked.optionNotes;
        question.correctIndex = picked.correctIndex;
        question.answerShown = high + " " + MINUS + " " + bracketed(low);
        question.hints = [
            "A gap is found by taking the lower number from the higher one.",
            "The lower number here is " + neg(low) + ", so it is " + neg(low) + " that gets taken away."
        ];
        question.steps = [
            "A gap is the higher number take the lower one.",
            "The higher number is " + high + " and the lower is " + neg(low) + ".",
            "So the gap is " + high + " " + MINUS + " " + bracketed(low) + ", which is " + high + " + " + low + " = " + answer + "."
        ];
        question.summaryLine = "Which calculation gives the gap from " + neg(low) + " to " + high;
        question.printLine = "Which calculation gives the gap between " + neg(low) + " and " + high + "?";
        return base(question, "Writing the gap down", "Choose the calculation that measures the gap.");
    }

    function fillGapBothNegative(question, rng, tools) {
        const near = tools.randomInt(rng, 2, 9);
        const far = near + tools.randomInt(rng, 2, 10);
        const answer = far - near;
        question.factKey = "gbn-" + near + "-" + far;
        question.contextKey = "plain";
        question.given = neg(far) + " and " + neg(near);
        question.givenLabel = "The two numbers";
        question.answerKind = "integer";
        question.answerLabel = "The gap";
        question.expected = answer;
        question.answerShown = String(answer);
        question.correctNote = "Correct. Both sit below zero, and " + far + " " + MINUS + " " + near + " = " + answer + " counts the line between them.";
        question.misses = [
            { value: far + near, text: "Neither number is above zero, so the gap does not run through zero. It is " + far + " " + MINUS + " " + near + " = " + answer + "." },
            { value: -answer, text: "A gap is a distance, so it has no sign. The two numbers are " + answer + " apart." }
        ];
        question.hints = [
            "Both numbers sit below zero, so the gap does not cross it.",
            neg(far) + " is " + far + " below zero and " + neg(near) + " is " + near + " below, so the gap is the difference between those two distances."
        ];
        question.steps = [
            neg(far) + " is " + far + " steps below zero and " + neg(near) + " is " + near + " steps below zero.",
            "Both lie on the same side, so the gap is the difference between the two distances.",
            far + " " + MINUS + " " + near + " = " + answer + ", so the numbers are " + answer + " apart."
        ];
        question.summaryLine = "Gap between " + neg(far) + " and " + neg(near);
        question.printLine = "How far apart are " + neg(far) + " and " + neg(near) + "?";
        return base(question, "A gap that never reaches zero", "How far apart are these two numbers?");
    }

    const FILLERS = {
        "start-negative-add": fillStartNegativeAdd,
        "cross-zero-subtract": fillCrossZeroSubtract,
        "negative-minus": fillNegativeMinus,
        "decimal-step": fillDecimalStep,
        "minus-minus": fillMinusMinus,
        "plus-minus": fillPlusMinus,
        "negative-minus-negative": fillNegativeMinusNegative,
        "decimal-double-sign": fillDecimalDoubleSign,
        "temperature-gap": fillTemperatureGap,
        "balance-after": fillBalanceAfter,
        "gap-choice": fillGapChoice,
        "gap-both-negative": fillGapBothNegative
    };

    const api = scope.PracticeEngine.create({
        stages: STAGES,
        lessonUrl: LESSON_URL,
        families: FAMILIES,
        fillers: FILLERS,
        notes: {
            integer: "Every answer on this page is a whole number, and it may be negative.",
            fallback: "Not yet. Put the first number on the line, then move the second number of steps in the direction its sign asks for."
        }
    });

    scope.NegativesPractice = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
