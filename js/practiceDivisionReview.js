/* Practice: division review.
   A mixed round drawing on short division, long division, dividing by a
   decimal and interpreting a remainder. Values are held as whole numbers and
   scaled by powers of ten, so no answer is a floating-point approximation.
   The generator half runs without a document so it can be fuzzed from Node. */
(function (scope) {
    "use strict";

    const LESSONS = {
        shortDivision: { label: "Short division", url: "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/shortDivision.html" },
        longDivision: { label: "Long division", url: "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/longDivision.html" },
        decimals: { label: "Dividing by a decimal", url: "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/dividingByDecimals.html" },
        remainders: { label: "Interpreting a remainder", url: "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/interpretingRemainders.html" }
    };

    const STAGES = [
        { name: "Dividing to an exact decimal", lessons: [LESSONS.shortDivision, LESSONS.longDivision] },
        { name: "Making the divisor a whole number", lessons: [LESSONS.decimals] },
        { name: "Reading the answer in context", lessons: [LESSONS.remainders, LESSONS.longDivision] }
    ];

    /* The round ends on the question where four answers all come from one
       division and only the wording separates them. */
    const FAMILIES = [
        { names: ["short-exact", "short-decimal-dividend", "long-exact", "long-decimal"], fixedLast: false },
        { names: ["rewrite-choice", "divisor-tenths", "divisor-hundredths", "divisor-decimal-dividend"], fixedLast: false },
        { names: ["context-complete-groups", "context-fit-everything", "context-leftover", "context-choice"], fixedLast: true }
    ];

    function randomInt(rng, min, max) {
        return min + Math.floor(rng() * (max - min + 1));
    }

    function pick(values, rng) {
        return values[randomInt(rng, 0, values.length - 1)];
    }

    function shuffleIndexes(count, rng) {
        const order = [];
        for (let index = 0; index < count; index += 1) order.push(index);
        for (let index = count - 1; index > 0; index -= 1) {
            const swap = randomInt(rng, 0, index);
            const held = order[index];
            order[index] = order[swap];
            order[swap] = held;
        }
        return order;
    }

    function drawValid(make, ok, fallback) {
        for (let attempt = 0; attempt < 40; attempt += 1) {
            const candidate = make();
            if (candidate && ok(candidate)) return candidate;
        }
        return fallback;
    }

    function groupDigits(text) {
        const parts = String(text).split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    /* Move the point through a numeric string rather than multiplying, so no
       value is ever a floating-point approximation. */
    function shiftDecimal(text, places) {
        const raw = String(text);
        const pieces = raw.split(".");
        let digits = pieces[0] + (pieces[1] || "");
        let point = pieces[0].length + places;
        while (point <= 0) { digits = "0" + digits; point += 1; }
        while (point > digits.length) { digits += "0"; }
        let whole = digits.slice(0, point).replace(/^0+(?=\d)/, "");
        const fraction = digits.slice(point).replace(/0+$/, "");
        if (!whole) whole = "0";
        return whole + (fraction ? "." + fraction : "");
    }

    function decimalPlaces(text) {
        const pieces = String(text).split(".");
        return pieces[1] ? pieces[1].replace(/0+$/, "").length : 0;
    }

    function multiplesText(divisor) {
        const list = [];
        for (let index = 1; index <= 9; index += 1) list.push(groupDigits(index * divisor));
        return "Multiples of " + divisor + ": " + list.join(", ") + ".";
    }

    /* ---------------------------------------------------------- questions */

    function makeQuestion(stage, family) {
        return {
            stage: stage, family: family, factKey: "", contextKey: "plain",
            title: "", prompt: "", given: "", givenLabel: "", mode: "single", answerKind: "decimal",
            unitPrefix: "", unitSuffix: "",
            answerLabel: "Your answer", display: null,
            expected: 0, expectedText: "", answerShown: "", correctNote: "",
            summaryLine: "", printLine: "", misses: [],
            options: [], optionNotes: [], correctIndex: 0, choiceLegend: "", compactValues: false,
            hints: [], steps: []
        };
    }

    function inline(text, ariaLabel) {
        return { kind: "inline", text: text, ariaLabel: ariaLabel };
    }

    function setSingle(question, answerText, label) {
        question.mode = "single";
        question.answerKind = "decimal";
        question.answerLabel = label;
        question.expected = Number(answerText);
        question.expectedText = answerText;
        question.answerShown = groupDigits(answerText);
    }

    /* Stage 1: build the quotient first, so the division is always exact. */

    function highestCommonFactor(a, b) {
        let left = Math.abs(a);
        let right = Math.abs(b);
        while (right) { const held = right; right = left % right; left = held; }
        return left;
    }

    /* Build the quotient first and multiply up, so the division is always
       exact and both numbers carry exactly the decimal places asked for. */
    function exactDivision(rng, settings) {
        const gap = Math.pow(10, settings.quotientPlaces - settings.dividendPlaces);
        return drawValid(function () {
            const divisor = randomInt(rng, settings.divisorLow, settings.divisorHigh);
            const step = gap / highestCommonFactor(divisor, gap);
            const low = Math.ceil(settings.quotientLow / step);
            const high = Math.floor(settings.quotientHigh / step);
            if (high < low) return null;
            const scaledQuotient = randomInt(rng, low, high) * step;
            const scaledDividend = scaledQuotient * divisor;
            if (scaledDividend % gap !== 0) return null;
            return {
                divisor: divisor,
                quotientText: shiftDecimal(String(scaledQuotient), -settings.quotientPlaces),
                dividendText: shiftDecimal(String(scaledDividend / gap), -settings.dividendPlaces)
            };
        }, function (candidate) {
            if (decimalPlaces(candidate.quotientText) !== settings.quotientPlaces) return false;
            if (decimalPlaces(candidate.dividendText) !== settings.dividendPlaces) return false;
            return Number(candidate.dividendText) > 0;
        }, settings.fallback);
    }

    function finishExact(question, draw, title, prompt, lessonHint) {
        question.factKey = draw.dividendText + "/" + draw.divisor;
        question.title = title;
        question.prompt = prompt;
        question.display = inline(groupDigits(draw.dividendText) + " ÷ " + draw.divisor,
            groupDigits(draw.dividendText) + " divided by " + draw.divisor);
        setSingle(question, draw.quotientText, "Exact answer");
        question.correctNote = "Correct — " + groupDigits(draw.quotientText) + " × " + draw.divisor + " = " + groupDigits(draw.dividendText) + ".";
        question.summaryLine = groupDigits(draw.dividendText) + " ÷ " + draw.divisor + ", exactly";
        question.printLine = groupDigits(draw.dividendText) + " ÷ " + draw.divisor + " (exact answer)";
        question.misses = [
            { value: Number(shiftDecimal(draw.quotientText, 1)), text: "The digits are right but the answer is ten times too large. The quotient's decimal point sits directly above the point in the number being divided." },
            { value: Number(shiftDecimal(draw.quotientText, -1)), text: "The digits are right but the answer is ten times too small. The quotient's decimal point sits directly above the point in the number being divided." },
            { value: Math.floor(Number(draw.quotientText)), text: "That is only the whole-number part. Carry the remainder past the decimal point and keep dividing until nothing is left." }
        ];
        question.hints = [
            lessonHint,
            multiplesText(draw.divisor)
        ];
        question.steps = [
            "Set the division out with " + draw.divisor + " outside and " + groupDigits(draw.dividendText) + " inside.",
            multiplesText(draw.divisor),
            "Work from the greatest place, carrying each remainder into the next digit, and keep the quotient's point above the dividend's point.",
            decimalPlaces(draw.quotientText) > decimalPlaces(draw.dividendText)
                ? "The written digits run out with something still left, so append zeros after the point and bring them down until nothing remains."
                : "Every digit is used and nothing is left over.",
            "Check by multiplying back: " + groupDigits(draw.quotientText) + " × " + draw.divisor + " = " + groupDigits(draw.dividendText) + ".",
            "Answer: " + groupDigits(draw.quotientText) + "."
        ];
        return question;
    }

    function fillShortExact(question, rng) {
        const draw = exactDivision(rng, {
            divisorLow: 3, divisorHigh: 9, quotientLow: 1205, quotientHigh: 8995,
            quotientPlaces: 2, dividendPlaces: 0,
            fallback: { divisor: 8, quotientText: "21.75", dividendText: "174" }
        });
        return finishExact(question, draw, "Divide to an exact decimal",
            "Work out this division exactly. Append zeros after the point and keep going until nothing is left.",
            "Divide place by place, carrying each remainder into the next digit, then carry on past the point.");
    }

    function fillShortDecimalDividend(question, rng) {
        const draw = exactDivision(rng, {
            divisorLow: 3, divisorHigh: 9, quotientLow: 1205, quotientHigh: 8995,
            quotientPlaces: 2, dividendPlaces: 1,
            fallback: { divisor: 4, quotientText: "30.55", dividendText: "122.2" }
        });
        return finishExact(question, draw, "Divide a decimal amount",
            "Work out this division exactly. Keep the quotient's decimal point above the point in the number being divided.",
            "The point in the answer sits directly above the point in the number being divided, so place it before you start dividing.");
    }

    function fillLongExact(question, rng) {
        const draw = exactDivision(rng, {
            divisorLow: 12, divisorHigh: 48, quotientLow: 125, quotientHigh: 899,
            quotientPlaces: 1, dividendPlaces: 0,
            fallback: { divisor: 32, quotientText: "45.5", dividendText: "1456" }
        });
        return finishExact(question, draw, "Divide by a two-digit number",
            "Work out this division exactly. Append zeros after the point and keep going until nothing is left.",
            "List the first nine multiples of the divisor, then take the greatest one that fits at each stage.");
    }

    function fillLongDecimal(question, rng) {
        const draw = exactDivision(rng, {
            divisorLow: 12, divisorHigh: 48, quotientLow: 125, quotientHigh: 899,
            quotientPlaces: 2, dividendPlaces: 1,
            fallback: { divisor: 24, quotientText: "2.85", dividendText: "68.4" }
        });
        return finishExact(question, draw, "Divide by a two-digit number",
            "Work out this division exactly, keeping the quotient's point above the point in the number being divided.",
            "List the first nine multiples of the divisor, then take the greatest one that fits at each stage.");
    }

    /* Stage 2: decimal divisors. */

    function decimalDivisorDraw(rng, divisorPlaces, dividendPlaces) {
        return drawValid(function () {
            const divisorDigits = divisorPlaces === 1 ? randomInt(rng, 2, 9) : randomInt(rng, 12, 96);
            const quotient = randomInt(rng, 12, 480);
            const divisorText = shiftDecimal(String(divisorDigits), -divisorPlaces);
            const dividendText = shiftDecimal(String(divisorDigits * quotient), -divisorPlaces);
            return {
                divisorDigits: divisorDigits, divisorText: divisorText,
                dividendText: dividendText, quotient: quotient, places: divisorPlaces
            };
        }, function (candidate) {
            if (decimalPlaces(candidate.divisorText) !== divisorPlaces) return false;
            if (dividendPlaces !== undefined && decimalPlaces(candidate.dividendText) !== dividendPlaces) return false;
            if (dividendPlaces === undefined && decimalPlaces(candidate.dividendText) === 0) return false;
            return true;
        }, divisorPlaces === 1
            ? { divisorDigits: 3, divisorText: "0.3", dividendText: "7.2", quotient: 24, places: 1 }
            : { divisorDigits: 46, divisorText: "0.46", dividendText: "55.2", quotient: 120, places: 2 });
    }

    function scaledPair(draw) {
        return {
            dividend: shiftDecimal(draw.dividendText, draw.places),
            divisor: shiftDecimal(draw.divisorText, draw.places),
            factor: draw.places === 1 ? "10" : "100"
        };
    }

    function finishDecimalDivisor(question, draw, title) {
        const scaled = scaledPair(draw);
        const answerText = String(draw.quotient);
        question.factKey = draw.dividendText + "/" + draw.divisorText;
        question.title = title;
        question.prompt = "Make the divisor a whole number first, then divide. Give the exact answer.";
        question.display = inline(groupDigits(draw.dividendText) + " ÷ " + draw.divisorText,
            groupDigits(draw.dividendText) + " divided by " + draw.divisorText);
        setSingle(question, answerText, "Exact answer");
        question.correctNote = "Correct — " + groupDigits(scaled.dividend) + " ÷ " + groupDigits(scaled.divisor)
            + " gives the same quotient, and " + groupDigits(answerText) + " × " + draw.divisorText + " = " + groupDigits(draw.dividendText) + ".";
        question.summaryLine = groupDigits(draw.dividendText) + " ÷ " + draw.divisorText;
        question.printLine = groupDigits(draw.dividendText) + " ÷ " + draw.divisorText;
        question.misses = [
            { value: Number(shiftDecimal(answerText, -draw.places)), text: "Only the divisor has been scaled. Both numbers must be multiplied by " + scaled.factor + ", or the quotient changes." },
            { value: Number(shiftDecimal(answerText, -1)), text: "The digits are right but the answer is ten times too small. Scale both numbers by the same power of ten and divide again." },
            { value: Number(shiftDecimal(answerText, 1)), text: "The digits are right but the answer is ten times too large. Use the smallest power of ten that makes the divisor whole — here that is " + scaled.factor + " — and apply it to both numbers." }
        ];
        question.hints = [
            "The divisor has " + draw.places + " decimal place" + (draw.places === 1 ? "" : "s") + ". Multiply it by the smallest power of ten that makes it whole, and multiply the number being divided by exactly the same amount.",
            groupDigits(draw.dividendText) + " ÷ " + draw.divisorText + " = " + groupDigits(scaled.dividend) + " ÷ " + groupDigits(scaled.divisor) + ". " + multiplesText(Number(scaled.divisor))
        ];
        question.steps = [
            "Written division needs a whole-number divisor, and " + draw.divisorText + " has " + draw.places + " decimal place" + (draw.places === 1 ? "" : "s") + ".",
            "Multiply both numbers by " + scaled.factor + ": " + groupDigits(draw.dividendText) + " ÷ " + draw.divisorText + " = " + groupDigits(scaled.dividend) + " ÷ " + groupDigits(scaled.divisor) + ".",
            "Scaling both numbers equally changes their sizes but not their ratio, so the quotient is unchanged.",
            "Divide: " + groupDigits(scaled.dividend) + " ÷ " + groupDigits(scaled.divisor) + " = " + groupDigits(answerText) + ".",
            "Check by multiplying back: " + groupDigits(answerText) + " × " + draw.divisorText + " = " + groupDigits(draw.dividendText) + ".",
            "Answer: " + groupDigits(answerText) + "."
        ];
        return question;
    }

    function fillDivisorTenths(question, rng) {
        return finishDecimalDivisor(question, decimalDivisorDraw(rng, 1, 1), "Divide by a decimal");
    }

    function fillDivisorHundredths(question, rng) {
        return finishDecimalDivisor(question, decimalDivisorDraw(rng, 2, 1), "Divide by a decimal");
    }

    function fillDivisorDecimalDividend(question, rng) {
        return finishDecimalDivisor(question, decimalDivisorDraw(rng, 2, 2), "Divide by a decimal");
    }

    function fillRewriteChoice(question, rng) {
        const draw = decimalDivisorDraw(rng, rng() < 0.5 ? 1 : 2, undefined);
        const scaled = scaledPair(draw);
        const values = [
            groupDigits(scaled.dividend) + " ÷ " + groupDigits(scaled.divisor),
            groupDigits(draw.dividendText) + " ÷ " + groupDigits(scaled.divisor),
            groupDigits(shiftDecimal(draw.dividendText, draw.places + 1)) + " ÷ " + groupDigits(scaled.divisor),
            groupDigits(shiftDecimal(draw.dividendText, draw.places)) + " ÷ " + groupDigits(shiftDecimal(draw.divisorText, draw.places + 1))
        ];
        const notes = [
            "Correct — both numbers are multiplied by " + scaled.factor + ", so the quotient is unchanged.",
            "Only the divisor has been scaled. Multiplying one number and not the other changes the quotient.",
            "The two numbers have been multiplied by different powers of ten, so this is a different calculation.",
            "The divisor has been scaled one place too far while the dividend has not, so the two no longer match."
        ];
        const order = shuffleIndexes(4, rng);
        question.factKey = draw.dividendText + "/" + draw.divisorText + "/rewrite";
        question.contextKey = "plain";
        question.title = "Rewriting with a whole-number divisor";
        question.prompt = "Choose the calculation that has the same answer as this one.";
        question.givenLabel = "The calculation";
        question.given = groupDigits(draw.dividendText) + " ÷ " + draw.divisorText;
        question.mode = "choice";
        question.compactValues = true;
        question.choiceLegend = "The equivalent calculation";
        question.options = order.map(function (index) { return values[index]; });
        question.optionNotes = order.map(function (index) { return notes[index]; });
        question.correctIndex = order.indexOf(0);
        question.answerShown = values[0];
        question.answerLabel = "Your choice";
        question.summaryLine = groupDigits(draw.dividendText) + " ÷ " + draw.divisorText + ", rewritten";
        question.printLine = "Which calculation has the same answer as " + groupDigits(draw.dividendText) + " ÷ " + draw.divisorText + "?";
        question.hints = [
            "Whatever the divisor is multiplied by, the number being divided must be multiplied by exactly the same amount.",
            draw.divisorText + " has " + draw.places + " decimal place" + (draw.places === 1 ? "" : "s") + ", so the smallest sufficient factor is " + scaled.factor + "."
        ];
        question.steps = [
            "Written division needs a whole-number divisor, so scale " + draw.divisorText + " up to " + groupDigits(scaled.divisor) + " by multiplying by " + scaled.factor + ".",
            "The same factor has to be applied to " + groupDigits(draw.dividendText) + ", giving " + groupDigits(scaled.dividend) + ".",
            "Scaling both numbers equally changes their sizes but not their ratio, so the quotient is unchanged.",
            "The equivalent calculation is " + values[0] + "."
        ];
        return question;
    }

    /* Stage 3: a two-digit divisor first, then the decision. */

    const CONTEXTS = [
        {
            key: "coach", item: "supporters", itemOne: "supporter", container: "coaches", containerOne: "coach",
            setting: function (total, group) {
                return groupDigits(total) + " supporters are travelling to a match. Each coach seats " + group + " supporters.";
            },
            down: "How many coaches can be filled completely?",
            up: "How many coaches are needed so that every supporter travels?",
            left: "After the full coaches have left, how many supporters are still waiting?",
            upReason: "every supporter needs a seat",
            downReason: "a coach with empty seats is not full"
        },
        {
            key: "carton", item: "bottles", itemOne: "bottle", container: "cartons", containerOne: "carton",
            setting: function (total, group) {
                return "A depot has " + groupDigits(total) + " bottles to pack. Each carton holds " + group + " bottles.";
            },
            down: "How many cartons can be filled completely?",
            up: "How many cartons are needed to pack every bottle?",
            left: "After the full cartons are packed, how many bottles are left?",
            upReason: "no bottle can be left unpacked",
            downReason: "a part-filled carton is not a full one"
        },
        {
            key: "pallet", item: "tiles", itemOne: "tile", container: "pallets", containerOne: "pallet",
            setting: function (total, group) {
                return groupDigits(total) + " tiles are to be stacked on pallets. Each pallet takes " + group + " tiles.";
            },
            down: "How many pallets can be filled completely?",
            up: "How many pallets are needed to hold every tile?",
            left: "After the full pallets are stacked, how many tiles remain?",
            upReason: "every tile has to be stacked somewhere",
            downReason: "a pallet is only full when every space is used"
        },
        {
            key: "tour", item: "visitors", itemOne: "visitor", container: "tours", containerOne: "tour",
            setting: function (total, group) {
                return groupDigits(total) + " visitors are booked into guided tours. Each tour takes " + group + " visitors.";
            },
            down: "How many tours can be filled completely?",
            up: "How many tours are needed so that every visitor is taken round?",
            left: "After the full tours have gone, how many visitors are still waiting?",
            upReason: "every visitor has booked a place",
            downReason: "a tour with spare places is not full"
        }
    ];

    function count(value, singular, plural) {
        return groupDigits(value) + " " + (Math.abs(value) === 1 ? singular : plural);
    }

    function agree(value, singularForm, pluralForm) {
        return Math.abs(value) === 1 ? singularForm : pluralForm;
    }

    function contextDraw(rng) {
        const context = pick(CONTEXTS, rng);
        const group = randomInt(rng, 12, 48);
        const whole = randomInt(rng, 12, 90);
        const remainder = randomInt(rng, 1, group - 1);
        return { context: context, group: group, whole: whole, remainder: remainder, total: whole * group + remainder };
    }

    function divisionLine(draw) {
        return groupDigits(draw.total) + " ÷ " + draw.group + " = " + groupDigits(draw.whole) + " remainder " + draw.remainder;
    }

    function contextSteps(draw, ask) {
        const c = draw.context;
        const steps = [
            "Divide by long division: " + divisionLine(draw) + ".",
            multiplesText(draw.group),
            "Check the remainder: " + draw.remainder + " is smaller than " + draw.group + ", so no further whole group can be made."
        ];
        if (ask === "down") {
            steps.push("Only complete " + c.container + " are counted, and because " + c.downReason + ", the leftover "
                + count(draw.remainder, c.itemOne, c.item) + agree(draw.remainder, " adds", " add") + " nothing.");
            steps.push("Answer: " + count(draw.whole, c.containerOne, c.container) + ".");
        } else if (ask === "up") {
            steps.push("Because " + c.upReason + ", the leftover " + count(draw.remainder, c.itemOne, c.item)
                + agree(draw.remainder, " needs", " need") + " one more " + c.containerOne + ".");
            steps.push(groupDigits(draw.whole) + " + 1 = " + groupDigits(draw.whole + 1) + ".");
            steps.push("Answer: " + count(draw.whole + 1, c.containerOne, c.container) + ".");
        } else {
            steps.push("The remainder answers this question directly.");
            steps.push("Answer: " + count(draw.remainder, c.itemOne, c.item) + ".");
        }
        return steps;
    }

    function contextQuestion(question, rng, ask) {
        const draw = contextDraw(rng);
        const c = draw.context;
        const wording = ask === "down" ? c.down : ask === "up" ? c.up : c.left;
        const expected = ask === "down" ? draw.whole : ask === "up" ? draw.whole + 1 : draw.remainder;
        question.factKey = c.key + "/" + draw.total + "/" + draw.group + "/" + ask;
        question.contextKey = c.key;
        question.title = "Divide, then read the question";
        question.prompt = c.setting(draw.total, draw.group) + " " + wording;
        question.mode = "single";
        question.answerKind = "integer";
        question.answerLabel = ask === "left" ? "Number of " + c.item : "Number of " + c.container;
        question.expected = expected;
        question.expectedText = String(expected);
        question.answerShown = count(expected, ask === "left" ? c.itemOne : c.containerOne, ask === "left" ? c.item : c.container);
        question.correctNote = ask === "down"
            ? "Correct — the part-filled " + c.containerOne + " is not counted here."
            : ask === "up"
                ? "Correct — the leftover " + c.item + " have been given a place of their own."
                : "Correct — the remainder itself answers this question.";
        question.summaryLine = groupDigits(draw.total) + " " + c.item + ", " + draw.group + " per " + c.containerOne;
        question.printLine = c.setting(draw.total, draw.group) + " " + wording;
        question.misses = [
            { value: draw.whole, text: ask === "up"
                ? "That leaves " + count(draw.remainder, c.itemOne, c.item) + " with nowhere to go. Because " + c.upReason + ", one more " + c.containerOne + " is needed."
                : "That is the number of complete " + c.container + ", not what this question asks for." },
            { value: draw.whole + 1, text: ask === "down"
                ? "The last " + c.containerOne + " holds only " + count(draw.remainder, c.itemOne, c.item) + ", so it is not complete."
                : "That counts " + c.container + " including the part-filled one, which is not what this question asks for." },
            { value: draw.remainder, text: "That is the leftover " + c.item + ", not a number of " + c.container + "." },
            { value: Math.round(draw.total / draw.group), text: "That is the division rounded in the ordinary way. The wording decides the direction here, whatever the decimal part would suggest." }
        ];
        question.hints = [
            "Divide by " + draw.group + " first using long division, then decide what the wording asks you to do with the remainder.",
            divisionLine(draw) + "."
        ];
        question.steps = contextSteps(draw, ask);
        return question;
    }

    function fillContextCompleteGroups(question, rng) { return contextQuestion(question, rng, "down"); }
    function fillContextFitEverything(question, rng) { return contextQuestion(question, rng, "up"); }
    function fillContextLeftover(question, rng) { return contextQuestion(question, rng, "left"); }

    /* Four answers, one division: only the wording separates them. */
    function fillContextChoice(question, rng) {
        const draw = contextDraw(rng);
        const c = draw.context;
        const ask = pick(["down", "up", "left"], rng);
        const wording = ask === "down" ? c.down : ask === "up" ? c.up : c.left;
        const decimal = String(Math.round(draw.total / draw.group * 100) / 100);
        const values = [
            count(draw.whole, c.containerOne, c.container),
            count(draw.whole + 1, c.containerOne, c.container),
            count(draw.remainder, c.itemOne, c.item),
            groupDigits(decimal) + " " + c.container
        ];
        const notes = [
            "This counts the " + c.container + " that are completely filled.",
            "This counts every " + c.containerOne + " used, including the part-filled one.",
            "This is the leftover, counted in " + c.item + ".",
            "A " + c.containerOne + " cannot be split, so a decimal number of them does not answer the question."
        ];
        const correct = ask === "down" ? 0 : ask === "up" ? 1 : 2;
        const order = shuffleIndexes(4, rng);
        question.factKey = c.key + "/" + draw.total + "/" + draw.group + "/choice-" + ask;
        question.contextKey = c.key;
        question.title = "Choosing the answer that fits";
        question.prompt = c.setting(draw.total, draw.group) + " " + wording;
        question.givenLabel = "Already worked out";
        question.given = divisionLine(draw);
        question.mode = "choice";
        question.compactValues = true;
        question.choiceLegend = "The answer that fits the question";
        question.options = order.map(function (index) { return values[index]; });
        question.optionNotes = order.map(function (index) { return notes[index]; });
        question.correctIndex = order.indexOf(correct);
        question.answerShown = values[correct];
        question.answerLabel = "Your choice";
        question.summaryLine = groupDigits(draw.total) + " " + c.item + ", " + draw.group + " per " + c.containerOne;
        question.printLine = c.setting(draw.total, draw.group) + " " + wording;
        question.hints = [
            "All four options come from the same division. Match the unit and the wording rather than the arithmetic.",
            ask === "left"
                ? "The question asks about " + c.item + ", so the answer is counted in " + c.item + "."
                : ask === "up"
                    ? "Every one of the " + groupDigits(draw.total) + " " + c.item + " must be accounted for."
                    : "Only " + c.container + " that are completely filled are being counted."
        ];
        question.steps = contextSteps(draw, ask);
        return question;
    }

    const FILLERS = {
        "short-exact": fillShortExact,
        "short-decimal-dividend": fillShortDecimalDividend,
        "long-exact": fillLongExact,
        "long-decimal": fillLongDecimal,
        "rewrite-choice": fillRewriteChoice,
        "divisor-tenths": fillDivisorTenths,
        "divisor-hundredths": fillDivisorHundredths,
        "divisor-decimal-dividend": fillDivisorDecimalDividend,
        "context-complete-groups": fillContextCompleteGroups,
        "context-fit-everything": fillContextFitEverything,
        "context-leftover": fillContextLeftover,
        "context-choice": fillContextChoice
    };

    function nearlyEqual(a, b) {
        if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
        return Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
    }

    function tidyMisses(question) {
        const seen = [];
        question.misses = question.misses.filter(function (miss) {
            if (!miss.text || !Number.isFinite(miss.value)) return false;
            if (nearlyEqual(miss.value, question.expected)) return false;
            if (seen.some(function (value) { return nearlyEqual(value, miss.value); })) return false;
            seen.push(miss.value);
            return true;
        });
        return question;
    }

    function generateQuestion(stage, family, rng, excludedKey) {
        let built = FILLERS[family](makeQuestion(stage, family), rng);
        for (let attempt = 0; attempt < 8 && excludedKey && built.factKey === excludedKey; attempt += 1) {
            built = FILLERS[family](makeQuestion(stage, family), rng);
        }
        return tidyMisses(built);
    }

    function buildRound(rng) {
        const round = [];
        FAMILIES.forEach(function (group, stage) {
            const names = group.names;
            const movable = group.fixedLast ? names.slice(0, names.length - 1) : names;
            const order = shuffleIndexes(movable.length, rng).map(function (index) { return movable[index]; });
            if (group.fixedLast) order.push(names[names.length - 1]);
            const used = [];
            order.forEach(function (family) {
                let built = generateQuestion(stage, family, rng);
                for (let attempt = 0; attempt < 8 && built.contextKey !== "plain" && used.indexOf(built.contextKey) !== -1; attempt += 1) {
                    built = generateQuestion(stage, family, rng);
                }
                used.push(built.contextKey);
                round.push(built);
            });
        });
        return round;
    }

    function createSeededRandom(seed) {
        let state = seed >>> 0 || 1;
        return function () {
            state ^= state << 13; state >>>= 0;
            state ^= state >> 17;
            state ^= state << 5; state >>>= 0;
            return state / 4294967296;
        };
    }

    /* ------------------------------------------------------------ marking */

    /* A reader who writes the unit as well as the number has still answered the
       question, so the unit is removed before the value is read. */
    function normalise(raw) {
        return String(raw === undefined || raw === null ? "" : raw)
            .replace(/[−‒–—]/g, "-")
            .replace(/[\s,£$]/g, "")
            .replace(/(\d)[a-z]+$/i, "$1")
            .trim();
    }

    function parseAmount(raw) {
        const cleaned = normalise(raw);
        if (!cleaned) return { blank: true };
        if (!/^-?\d*(\.\d+)?$/.test(cleaned) || cleaned === "-" || cleaned === ".") return { invalid: true };
        return { value: Number(cleaned), text: cleaned };
    }

    /* The same digits in the same order with the point somewhere else is a
       distinct, common slip, and worth saying so rather than falling through to
       general advice. */
    function sameDigits(left, right) {
        const strip = function (value) {
            return String(value).replace(/[^0-9]/g, "").replace(/^0+/, "").replace(/0+$/, "");
        };
        const a = strip(left);
        return Boolean(a) && a === strip(right);
    }

    function evaluateSingle(question, raw) {
        const parsed = parseAmount(raw);
        if (parsed.blank) return { state: "blank", text: "Enter an answer, then check it." };
        if (parsed.invalid) return { state: "unreadable", text: "That entry cannot be read as a number. Use digits, and a decimal point if one is needed." };
        if (nearlyEqual(parsed.value, question.expected)) return { state: "correct", text: question.correctNote || "Correct." };
        if (question.answerKind === "integer" && !Number.isInteger(parsed.value)) {
            return { state: "wrong", text: "This answer counts whole things, so it cannot have a decimal part. Decide what happens to the leftover instead of splitting it." };
        }
        for (let index = 0; index < question.misses.length; index += 1) {
            if (nearlyEqual(parsed.value, question.misses[index].value)) {
                return { state: "wrong", text: question.misses[index].text };
            }
        }
        if (sameDigits(parsed.value, question.expected)) {
            return {
                state: "wrong",
                text: "Every digit is right and in the right order, so only the decimal point is out of place. Compare your answer with a rough estimate of the calculation to see where it belongs."
            };
        }
        return { state: "wrong", text: "Not yet. Set the division out with a whole-number divisor, list its multiples, and check each stage before deciding what the answer should look like." };
    }

    function evaluateChoice(question, raw) {
        const cleaned = normalise(raw);
        if (cleaned === "") return { state: "blank", text: "Select one of the options, then check it." };
        const index = Number(cleaned);
        if (index === question.correctIndex) return { state: "correct", text: question.optionNotes[index] };
        return { state: "wrong", text: question.optionNotes[index] || "That option does not answer this question." };
    }

    function evaluateResponse(question, raw) {
        if (question.mode === "choice") return evaluateChoice(question, raw);
        return evaluateSingle(question, raw);
    }

    /* --------------------------------------------------------- validation */

    function validateQuestion(question) {
        const problems = [];
        ["title", "prompt", "summaryLine", "printLine", "answerShown"].forEach(function (field) {
            if (!question[field]) problems.push("no " + field);
            if (/undefined|NaN/.test(String(question[field]))) problems.push(field + " has a broken value");
        });
        if (question.hints.length !== 2) problems.push("expected two hints");
        question.hints.concat(question.steps).forEach(function (text, index) {
            if (!text) problems.push("empty hint or step " + index);
            if (/undefined|NaN/.test(text)) problems.push("hint or step " + index + " has a broken value");
        });
        if (question.steps.length < 3) problems.push("fewer than three solution steps");
        if (question.mode === "single") {
            if (!Number.isFinite(question.expected)) problems.push("expected value is not finite");
            if (question.expected <= 0) problems.push("answer is not positive");
            if (question.answerKind === "integer" && !Number.isInteger(question.expected)) problems.push("integer answer is not whole");
            question.misses.forEach(function (miss, index) {
                if (nearlyEqual(miss.value, question.expected)) problems.push("miss " + index + " equals the answer");
            });
        }
        if (question.mode === "choice") {
            if (question.options.length !== 4) problems.push("expected four options");
            if (new Set(question.options).size !== question.options.length) problems.push("duplicate options");
            if (question.optionNotes.length !== question.options.length) problems.push("option notes do not match options");
            question.optionNotes.forEach(function (note, index) {
                if (!note) problems.push("option note " + index + " is empty");
                if (/undefined|NaN/.test(note)) problems.push("option note " + index + " has a broken value");
            });
        }
        return problems;
    }

    function selfCheck(iterations) {
        const rounds = iterations || 200;
        const problems = [];
        for (let seed = 1; seed <= rounds; seed += 1) {
            const rng = createSeededRandom(seed * 2654435761);
            const round = buildRound(rng);
            if (round.length !== 12) problems.push("Round " + seed + " has " + round.length + " questions.");
            if (round[11].family !== "context-choice") problems.push("Round " + seed + " does not end on the choice in context.");
            round.forEach(function (question, index) {
                const stage = Math.floor(index / 4);
                if (question.stage !== stage) problems.push("Question " + index + " has stage " + question.stage + ".");
                validateQuestion(question).forEach(function (problem) {
                    problems.push("Seed " + seed + " Q" + (index + 1) + " (" + question.family + "): " + problem);
                });
                if (question.mode === "single" && evaluateResponse(question, question.expectedText).state !== "correct") {
                    problems.push("Seed " + seed + " Q" + (index + 1) + " (" + question.family + "): exact answer rejected.");
                }
                if (question.mode === "choice" && evaluateResponse(question, String(question.correctIndex)).state !== "correct") {
                    problems.push("Seed " + seed + " Q" + (index + 1) + " (" + question.family + "): correct option rejected.");
                }
            });
            if (problems.length > 40) break;
        }
        return problems;
    }

    const api = {
        STAGES: STAGES,
        FAMILIES: FAMILIES,
        buildRound: buildRound,
        createSeededRandom: createSeededRandom,
        evaluateResponse: evaluateResponse,
        generateQuestion: generateQuestion,
        parseAmount: parseAmount,
        selfCheck: selfCheck,
        shiftDecimal: shiftDecimal,
        validateQuestion: validateQuestion
    };

    scope.DivisionReviewPractice = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
    if (typeof document === "undefined") return;
    /* ---------------------------------------------------------------- page */

    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function blankAnswer(question) {
        if (question.mode === "parts") return question.cells.map(function () { return ""; });
        return "";
    }

    function makeState(question) {
        return {
            answer: blankAnswer(question),
            attempts: 0,
            hintLevel: 0,
            solutionShown: false,
            solutionUsed: false,
            outcome: null,
            feedback: "",
            tone: "",
            replaceConfirm: false,
            correctPositions: []
        };
    }

    function hasAnswer(answer) {
        return Array.isArray(answer) ? answer.some(Boolean) : Boolean(String(answer).trim());
    }

    function answerSummary(question, answer) {
        if (!hasAnswer(answer)) return "No answer entered.";
        if (question.mode === "choice") {
            const option = question.options[Number(answer)];
            return option ? "Your choice: " + option : "No answer entered.";
        }
        if (question.mode === "parts") {
            return "Your answer: " + question.cells.map(function (cell, index) {
                return cell.label + " " + (String(answer[index] || "").trim() || "—");
            }).join("; ");
        }
        return "Your answer: " + (question.unitPrefix || "") + String(answer).trim()
            + (question.unitSuffix ? " " + question.unitSuffix : "");
    }

    function mount(root) {
        let round = buildRound(Math.random);
        let states = round.map(makeState);
        let current = 0;

        const questionView = root.querySelector("[data-question-view]");
        const reflection = root.querySelector("[data-reflection]");
        const card = root.querySelector("[data-question-card]");
        const title = root.querySelector("[data-question-title]");
        const prompt = root.querySelector("[data-question-prompt]");
        const expression = root.querySelector("[data-question-expression]");
        const givenWrap = root.querySelector("[data-question-given-wrap]");
        const givenLabel = root.querySelector("[data-question-given-label]");
        const given = root.querySelector("[data-question-given]");
        const singleWrap = root.querySelector("[data-single-answer]");
        const answerLabel = root.querySelector("[data-answer-label]");
        const answerEntry = root.querySelector("[data-answer-entry]");
        const unitPrefix = root.querySelector("[data-unit-prefix]");
        const unitSuffix = root.querySelector("[data-unit-suffix]");
        const input = root.querySelector("[data-answer-input]");
        const choiceField = root.querySelector("[data-choice-answer]");
        const choiceLegend = root.querySelector("[data-choice-legend]");
        const choiceOptions = root.querySelector("[data-choice-options]");
        const partsField = root.querySelector("[data-parts-answer]");
        const partsLegend = root.querySelector("[data-parts-legend]");
        const partsList = root.querySelector("[data-parts-list]");
        const feedback = root.querySelector("[data-feedback]");
        const verdictOverlay = root.querySelector("[data-verdict-overlay]");
        const verdictWord = root.querySelector("[data-verdict-word]");
        const hintButton = root.querySelector("[data-hint-button]");
        const hintPanel = root.querySelector("[data-hint-panel]");
        const hintText = root.querySelector("[data-hint-text]");
        const checkButton = root.querySelector("[data-check-answer]");
        const newQuestionButton = root.querySelector("[data-new-question]");
        const solutionButton = root.querySelector("[data-solution-button]");
        const solutionPanel = root.querySelector("[data-solution-panel]");
        const solutionSteps = root.querySelector("[data-solution-steps]");
        const previousButton = root.querySelector("[data-previous]");
        const nextButton = root.querySelector("[data-next]");
        const progressStage = root.querySelector("[data-progress-stage]");
        const progressCount = root.querySelector("[data-progress-count]");
        const progressBar = root.querySelector("[data-progress-bar]");
        const stageIndicators = Array.from(root.querySelectorAll("[data-stage-indicator]"));
        const independentCount = root.querySelector("[data-independent-count]");
        const supportedCount = root.querySelector("[data-supported-count]");
        const revisitCount = root.querySelector("[data-revisit-count]");
        const reflectionIntro = root.querySelector("[data-reflection-intro]");
        const reflectionFilters = Array.from(root.querySelectorAll("[data-reflection-filter]"));
        const reflectionSummaryIntro = root.querySelector("[data-reflection-summary-intro]");
        const reflectionQuestions = root.querySelector("[data-reflection-questions]");
        const showAllQuestionsButton = root.querySelector("[data-show-all-questions]");
        const reflectionStages = root.querySelector("[data-reflection-stages]");
        const freshRoundButton = root.querySelector("[data-fresh-round]");
        const reviewLastButton = root.querySelector("[data-review-last]");
        const printSheet = root.querySelector("[data-print-sheet]");
        const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
        let verdictTimer = 0;

        function state() { return states[current]; }
        function question() { return round[current]; }

        function setFeedback(text, tone) {
            const currentState = state();
            currentState.feedback = text;
            currentState.tone = tone || "";
            feedback.textContent = text;
            if (tone) feedback.dataset.tone = tone;
            else delete feedback.dataset.tone;
        }

        function clearVerdict() {
            window.clearTimeout(verdictTimer);
            verdictOverlay.classList.remove("is-showing", "is-right", "is-wrong");
            card.classList.remove("is-celebrating", "is-nudged");
        }

        function showVerdict(kind) {
            clearVerdict();
            verdictWord.textContent = kind === "right" ? "YES" : "TRY AGAIN";
            void verdictOverlay.offsetWidth;
            verdictOverlay.classList.add("is-showing", "is-" + kind);
            card.classList.add(kind === "right" ? "is-celebrating" : "is-nudged");
            const reduce = Boolean(reducedMotion && reducedMotion.matches);
            const duration = reduce ? 840 : kind === "right" ? 2175 : 1350;
            verdictTimer = window.setTimeout(clearVerdict, duration);
        }

        function clearOutcomeForEdit(preservePositions) {
            const currentState = state();
            currentState.replaceConfirm = false;
            if (currentState.outcome) {
                currentState.outcome = null;
                card.classList.remove("is-correct");
                card.classList.add("is-review");
            }
            if (!preservePositions) currentState.correctPositions = [];
            if (currentState.attempts || currentState.feedback) setFeedback("Answer changed.", "");
            updateActionState();
        }

        function renderChoice(currentQuestion, currentState) {
            choiceLegend.textContent = currentQuestion.choiceLegend;
            choiceOptions.classList.toggle("is-value-grid", Boolean(currentQuestion.compactValues));
            choiceOptions.replaceChildren();
            currentQuestion.options.forEach(function (option, index) {
                const id = "division-choice-" + current + "-" + index;
                const label = element("label", "practice-choice__option");
                if (currentQuestion.compactValues) label.classList.add("is-value-choice");
                const radio = element("input");
                radio.type = "radio";
                radio.name = "division-choice-" + current;
                radio.id = id;
                radio.value = String(index);
                radio.checked = currentState.answer === String(index);
                radio.setAttribute("aria-describedby", "practice-feedback practice-hint");
                label.classList.toggle("is-selected", radio.checked);
                label.appendChild(radio);
                if (!currentQuestion.compactValues) label.appendChild(element("span", "", String.fromCharCode(65 + index)));
                label.appendChild(element("span", "", option));
                radio.addEventListener("keydown", handleEnter);
                radio.addEventListener("change", function () {
                    currentState.answer = radio.value;
                    Array.from(choiceOptions.children).forEach(function (node) { node.classList.remove("is-selected"); });
                    label.classList.add("is-selected");
                    clearOutcomeForEdit();
                });
                choiceOptions.appendChild(label);
            });
        }

        function applyPartStates() {
            const currentState = state();
            Array.from(partsList.querySelectorAll(".practice-parts__cell")).forEach(function (cell, index) {
                const field = cell.querySelector("input");
                const verdict = currentState.correctPositions[index];
                cell.classList.toggle("is-correct", verdict === true);
                cell.classList.toggle("is-wrong", verdict === false);
                if (verdict === false) field.setAttribute("aria-invalid", "true");
                else field.removeAttribute("aria-invalid");
            });
        }

        function renderParts(currentQuestion, currentState) {
            partsLegend.textContent = currentQuestion.partsLegend;
            partsList.replaceChildren();
            currentQuestion.cells.forEach(function (cell, index) {
                const id = "division-part-" + current + "-" + index;
                const wrap = element("label", "practice-parts__cell");
                wrap.htmlFor = id;
                wrap.appendChild(element("span", "practice-parts__label", cell.label));
                const field = element("input");
                field.type = "text";
                field.id = id;
                field.inputMode = "numeric";
                field.maxLength = 6;
                field.autocomplete = "off";
                field.spellcheck = false;
                field.value = currentState.answer[index] || "";
                field.setAttribute("aria-describedby", "practice-feedback practice-hint");
                wrap.appendChild(field);
                field.addEventListener("input", function () {
                    const cleaned = field.value.replace(/[^0-9]/g, "").slice(0, 6);
                    if (cleaned !== field.value) field.value = cleaned;
                    currentState.answer[index] = cleaned;
                    currentState.correctPositions[index] = undefined;
                    clearOutcomeForEdit(true);
                    applyPartStates();
                });
                field.addEventListener("keydown", handleEnter);
                partsList.appendChild(wrap);
            });
            applyPartStates();
        }

        function renderExpression(currentQuestion) {
            const display = currentQuestion.display;
            expression.replaceChildren();
            expression.className = "practice-question__expression";
            expression.hidden = !display;
            if (!display) {
                expression.removeAttribute("role");
                expression.removeAttribute("aria-label");
                return;
            }
            expression.classList.add("practice-division-line");
            expression.setAttribute("role", "img");
            expression.setAttribute("aria-label", display.ariaLabel);
            expression.textContent = display.text;
        }

        function populateSolution(currentQuestion) {
            solutionSteps.replaceChildren.apply(solutionSteps, currentQuestion.steps.map(function (step) {
                return element("li", "", step);
            }));
        }

        function updateActionState() {
            const currentState = state();
            hintButton.disabled = Boolean(currentState.outcome) || currentState.hintLevel >= 2;
            if (currentState.outcome) {
                checkButton.textContent = current === round.length - 1 ? "Finish this round" : "Continue";
                hintButton.textContent = "Question complete";
            } else {
                checkButton.textContent = currentState.attempts > 0 ? "Check again" : "Check my answer";
                hintButton.textContent = currentState.hintLevel === 0
                    ? (currentState.attempts > 0 ? "Help me fix it" : "Give me a hint")
                    : (currentState.hintLevel === 1 ? "One more hint" : "Both hints shown");
            }
            newQuestionButton.textContent = currentState.replaceConfirm ? "Replace this question" : "Try different numbers";
            previousButton.disabled = current === 0;
            if (current === round.length - 1) nextButton.textContent = currentState.outcome ? "Finish this round" : "Finish for now";
            else nextButton.textContent = currentState.outcome ? "Continue" : "Move on for now";
        }

        function render(focusHeading) {
            clearVerdict();
            const currentQuestion = question();
            const currentState = state();
            const stage = currentQuestion.stage;

            questionView.hidden = false;
            reflection.hidden = true;
            progressStage.textContent = STAGES[stage].name;
            progressCount.textContent = "Question " + (current + 1) + " of " + round.length;
            progressBar.style.width = ((current + 1) / round.length * 100) + "%";
            stageIndicators.forEach(function (indicator, index) {
                indicator.classList.toggle("is-current", index === stage);
                indicator.classList.toggle("is-complete", index < stage);
                if (index === stage) indicator.setAttribute("aria-current", "step");
                else indicator.removeAttribute("aria-current");
            });

            title.textContent = currentQuestion.title;
            /* A value the question hands the reader sits in its own labelled
               panel rather than inside the sentence. */
            givenWrap.hidden = !currentQuestion.given;
            givenLabel.textContent = currentQuestion.givenLabel || "Given";
            given.textContent = currentQuestion.given || "";
            prompt.textContent = currentQuestion.prompt;
            renderExpression(currentQuestion);
            answerLabel.textContent = currentQuestion.answerLabel;

            singleWrap.hidden = currentQuestion.mode !== "single";
            choiceField.hidden = currentQuestion.mode !== "choice";
            partsField.hidden = currentQuestion.mode !== "parts";
            unitPrefix.textContent = currentQuestion.unitPrefix || "";
            unitPrefix.hidden = !currentQuestion.unitPrefix;
            unitSuffix.textContent = currentQuestion.unitSuffix || "";
            unitSuffix.hidden = !currentQuestion.unitSuffix;
            answerEntry.classList.toggle("has-prefix", Boolean(currentQuestion.unitPrefix));
            answerEntry.classList.toggle("has-suffix", Boolean(currentQuestion.unitSuffix));
            if (currentQuestion.mode === "single") {
                input.value = currentState.answer;
                input.inputMode = currentQuestion.answerKind === "integer" ? "numeric" : "decimal";
                input.setAttribute("aria-label", currentQuestion.answerLabel + " for " + currentQuestion.summaryLine);
            } else if (currentQuestion.mode === "choice") {
                renderChoice(currentQuestion, currentState);
            } else {
                renderParts(currentQuestion, currentState);
            }

            card.classList.toggle("is-correct", Boolean(currentState.outcome));
            card.classList.toggle("is-review", !currentState.outcome && currentState.attempts > 0);
            setFeedback(currentState.feedback || "", currentState.tone || "");
            hintPanel.hidden = currentState.hintLevel === 0;
            if (currentState.hintLevel > 0) hintText.textContent = currentQuestion.hints[currentState.hintLevel - 1];
            solutionPanel.hidden = !currentState.solutionShown;
            solutionButton.setAttribute("aria-expanded", String(currentState.solutionShown));
            solutionButton.textContent = currentState.solutionShown ? "Hide the worked solution" : "Show a worked solution";
            populateSolution(currentQuestion);
            updateActionState();
            buildPrintSheet();
            if (focusHeading) title.focus({ preventScroll: true });
        }

        function readAnswer() {
            const currentQuestion = question();
            if (currentQuestion.mode === "single") return input.value;
            if (currentQuestion.mode === "choice") {
                const selected = choiceOptions.querySelector("input:checked");
                return selected ? selected.value : "";
            }
            return Array.from(partsList.querySelectorAll("input")).map(function (field) { return field.value; });
        }

        function checkAnswer() {
            const currentState = state();
            currentState.answer = readAnswer();
            const result = evaluateResponse(question(), currentState.answer);
            currentState.replaceConfirm = false;
            currentState.correctPositions = result.correctPositions || [];
            if (question().mode === "parts") applyPartStates();

            if (result.state === "blank" || result.state === "unreadable" || result.state === "incomplete") {
                setFeedback(result.text, "consider");
                updateActionState();
                return;
            }

            currentState.attempts += 1;
            if (result.state === "correct") {
                currentState.outcome = currentState.attempts === 1 && currentState.hintLevel === 0 && !currentState.solutionUsed
                    ? "independent"
                    : "supported";
                setFeedback(result.text, "positive");
                card.classList.add("is-correct");
                card.classList.remove("is-review");
                showVerdict("right");
            } else {
                currentState.outcome = null;
                setFeedback(result.text, "consider");
                card.classList.remove("is-correct");
                card.classList.add("is-review");
                showVerdict("wrong");
            }
            updateActionState();
            buildPrintSheet();
        }

        function handleEnter(event) {
            if (event.key !== "Enter") return;
            event.preventDefault();
            if (event.repeat) return;
            if (state().outcome) nextButton.click();
            else checkAnswer();
        }

        function showHint() {
            const currentState = state();
            if (currentState.hintLevel >= 2) return;
            currentState.hintLevel += 1;
            currentState.replaceConfirm = false;
            hintPanel.hidden = false;
            hintText.textContent = question().hints[currentState.hintLevel - 1];
            updateActionState();
        }

        function toggleSolution() {
            const currentState = state();
            currentState.solutionShown = !currentState.solutionShown;
            if (currentState.solutionShown) currentState.solutionUsed = true;
            solutionPanel.hidden = !currentState.solutionShown;
            solutionButton.setAttribute("aria-expanded", String(currentState.solutionShown));
            solutionButton.textContent = currentState.solutionShown ? "Hide the worked solution" : "Show a worked solution";
            if (currentState.solutionShown) populateSolution(question());
            buildPrintSheet();
        }

        function focusAnswer() {
            const currentQuestion = question();
            if (currentQuestion.mode === "single") {
                input.focus({ preventScroll: true });
                return;
            }
            const control = root.querySelector(currentQuestion.mode === "choice"
                ? "[data-choice-options] input"
                : "[data-parts-list] input");
            if (control) control.focus({ preventScroll: true });
        }

        function replaceQuestion() {
            const currentState = state();
            const hasWork = hasAnswer(currentState.answer) || currentState.attempts
                || currentState.hintLevel || currentState.solutionShown;
            if (hasWork && !currentState.replaceConfirm) {
                currentState.replaceConfirm = true;
                setFeedback("Different numbers will replace the work in this question only. Press “Replace this question” to continue.", "consider");
                updateActionState();
                return;
            }
            const oldQuestion = question();
            round[current] = generateQuestion(oldQuestion.stage, oldQuestion.family, Math.random, oldQuestion.factKey);
            states[current] = makeState(round[current]);
            render(false);
            focusAnswer();
        }

        function buildPrintSheet() {
            printSheet.replaceChildren();
            STAGES.forEach(function (stage, stageIndex) {
                printSheet.appendChild(element("h3", "", stage.name));
                const list = element("ol");
                round.forEach(function (item, index) {
                    if (item.stage !== stageIndex) return;
                    const entry = element("li", "practice-print-question");
                    if (item.given) entry.appendChild(element("p", "", (item.givenLabel || "Given") + ": " + item.given));
                    entry.appendChild(element("p", "", item.printLine));
                    if (item.mode === "choice") {
                        const options = element("ul");
                        item.options.forEach(function (option) { options.appendChild(element("li", "", option)); });
                        entry.appendChild(options);
                    }
                    entry.appendChild(element("span", "practice-print-working", ""));
                    if (states[index].solutionShown) {
                        const solution = element("div", "practice-print-solution");
                        solution.appendChild(element("b", "", "Worked solution: " + item.answerShown));
                        const steps = element("ol");
                        item.steps.forEach(function (step) { steps.appendChild(element("li", "", step)); });
                        solution.appendChild(steps);
                        entry.appendChild(solution);
                    }
                    list.appendChild(entry);
                });
                printSheet.appendChild(list);
            });
        }

        function renderReflectionQuestions(filter) {
            const labels = {
                independent: "Completed independently",
                supported: "Completed with support",
                revisit: "Worth revisiting"
            };
            const filtered = round.map(function (item, index) {
                return { item: item, index: index, state: states[index] };
            }).filter(function (entry) {
                if (filter === "independent") return entry.state.outcome === "independent";
                if (filter === "supported") return entry.state.outcome === "supported";
                if (filter === "revisit") return !entry.state.outcome;
                return true;
            });
            reflectionFilters.forEach(function (button) {
                button.setAttribute("aria-pressed", String(button.dataset.reflectionFilter === filter));
            });
            showAllQuestionsButton.hidden = filter === "all";
            reflectionSummaryIntro.textContent = filter === "all"
                ? "All " + round.length + " questions are listed below."
                : filtered.length + " " + (filtered.length === 1 ? "question is" : "questions are")
                    + " " + labels[filter].toLowerCase() + ".";

            reflectionQuestions.replaceChildren.apply(reflectionQuestions, filtered.map(function (entry) {
                const row = element("li", "practice-reflection-question");
                const heading = element("div", "practice-reflection-question__heading");
                const outcome = entry.state.outcome || "revisit";
                heading.appendChild(element("strong", "", "Question " + (entry.index + 1)));
                heading.appendChild(element("span", "is-" + outcome, labels[outcome]));
                row.appendChild(heading);
                row.appendChild(element("p", "practice-reflection-question__stage", STAGES[entry.item.stage].name));
                row.appendChild(element("p", "practice-reflection-question__expression", entry.item.summaryLine));
                if (entry.item.given) {
                    row.appendChild(element("p", "practice-reflection-question__given",
                        (entry.item.givenLabel || "Given") + ": " + entry.item.given));
                }
                row.appendChild(element("p", "practice-reflection-question__given", entry.item.prompt));
                row.appendChild(element("p", "practice-reflection-question__answer", answerSummary(entry.item, entry.state.answer)));
                const link = element("a", "", "Return to question " + (entry.index + 1));
                link.href = "#practice-question-title";
                link.dataset.reviewQuestion = String(entry.index);
                row.appendChild(link);
                return row;
            }));
        }

        function showReflection() {
            questionView.hidden = true;
            reflection.hidden = false;
            progressBar.style.width = "100%";
            stageIndicators.forEach(function (indicator) {
                indicator.classList.remove("is-current");
                indicator.classList.add("is-complete");
                indicator.removeAttribute("aria-current");
            });
            const counts = states.reduce(function (totals, item) {
                if (item.outcome === "independent") totals.independent += 1;
                else if (item.outcome === "supported") totals.supported += 1;
                else totals.revisit += 1;
                return totals;
            }, { independent: 0, supported: 0, revisit: 0 });
            independentCount.textContent = String(counts.independent);
            supportedCount.textContent = String(counts.supported);
            revisitCount.textContent = String(counts.revisit);
            reflectionIntro.textContent = counts.revisit === 0
                ? "All " + round.length + " questions have a checked answer."
                : (round.length - counts.revisit) + " checked; " + counts.revisit + " "
                    + (counts.revisit === 1 ? "is" : "are") + " worth revisiting.";
            renderReflectionQuestions("all");
            /* A review draws on several lessons, so each stage offers a link to
               every lesson it covers rather than one section of one page. */
            reflectionStages.replaceChildren.apply(reflectionStages, STAGES.map(function (stage, stageIndex) {
                const stageStates = states.slice(stageIndex * 4, stageIndex * 4 + 4);
                const revisit = stageStates.filter(function (item) { return !item.outcome; }).length;
                const row = element("li");
                const heading = element("div", "practice-reflection__stage-name");
                heading.appendChild(element("b", "", stage.name));
                if (revisit) heading.appendChild(element("span", "", revisit + " to revisit"));
                row.appendChild(heading);
                const links = element("div", "practice-reflection__stage-links");
                stage.lessons.forEach(function (lesson) {
                    const link = element("a", "", "Open the lesson on " + lesson.label.toLowerCase());
                    link.href = lesson.url;
                    links.appendChild(link);
                });
                row.appendChild(links);
                return row;
            }));
            buildPrintSheet();
            root.querySelector("#reflection-title").focus({ preventScroll: true });
        }

        input.addEventListener("input", function () {
            state().answer = input.value;
            clearOutcomeForEdit();
        });
        input.addEventListener("keydown", handleEnter);
        checkButton.addEventListener("click", function () {
            if (state().outcome) nextButton.click();
            else checkAnswer();
        });
        hintButton.addEventListener("click", showHint);
        solutionButton.addEventListener("click", toggleSolution);
        newQuestionButton.addEventListener("click", replaceQuestion);
        previousButton.addEventListener("click", function () {
            if (current === 0) return;
            current -= 1;
            render(true);
        });
        nextButton.addEventListener("click", function () {
            if (current === round.length - 1) {
                showReflection();
                return;
            }
            current += 1;
            render(true);
        });
        freshRoundButton.addEventListener("click", function () {
            round = buildRound(Math.random);
            states = round.map(makeState);
            current = 0;
            render(true);
        });
        reviewLastButton.addEventListener("click", function () {
            current = round.length - 1;
            render(true);
        });
        reflectionFilters.forEach(function (button) {
            button.addEventListener("click", function () { renderReflectionQuestions(button.dataset.reflectionFilter); });
        });
        showAllQuestionsButton.addEventListener("click", function () { renderReflectionQuestions("all"); });
        reflectionQuestions.addEventListener("click", function (event) {
            const link = event.target.closest("[data-review-question]");
            if (!link) return;
            event.preventDefault();
            current = Number(link.dataset.reviewQuestion);
            render(true);
        });
        window.addEventListener("beforeprint", buildPrintSheet);
        render(false);
    }

    const root = document.querySelector("[data-practice-root]");
    if (root) mount(root);
})(typeof window !== "undefined" ? window : globalThis);
