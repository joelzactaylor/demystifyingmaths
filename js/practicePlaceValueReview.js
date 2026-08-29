/* Practice: place value review.
   A mixed round drawing on place value, ordering, the inequality symbols and
   scaling by powers of ten. The generator half runs without a document so it
   can be fuzzed from Node. */
(function (scope) {
    "use strict";

    const LESSONS = {
        place: { label: "Place value in integers and decimals", url: "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/placeValue.html" },
        ordering: { label: "Ordering integers, decimals and negatives", url: "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/orderingNumbers.html" },
        symbols: { label: "The inequality symbols", url: "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/inequalitySymbols.html" },
        powers: { label: "Multiplying and dividing by powers of ten", url: "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/powersOfTen.html" }
    };

    const STAGES = [
        { name: "What each digit is worth", lessons: [LESSONS.place, LESSONS.ordering] },
        { name: "Comparing and ordering", lessons: [LESSONS.symbols, LESSONS.ordering] },
        { name: "Scaling by powers of ten", lessons: [LESSONS.powers] }
    ];

    /* The last question of the powers stage is fixed, so the round always ends
       on the division that scales a number up rather than down. */
    const FAMILIES = [
        { names: ["digit-value", "named-column", "smallest-of-list", "largest-of-list"], fixedLast: false },
        { names: ["symbol-between", "symbol-negatives", "ordered-ascending", "ordered-descending"], fixedLast: false },
        { names: ["times-power", "divide-power", "times-tenth", "divide-by-tenth"], fixedLast: true }
    ];

    const COLUMN_NAMES = {
        "3": "thousands", "2": "hundreds", "1": "tens", "0": "ones",
        "-1": "tenths", "-2": "hundredths", "-3": "thousandths"
    };

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
        const negative = String(text).charAt(0) === "-";
        const body = negative ? String(text).slice(1) : String(text);
        const parts = body.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return (negative ? "−" : "") + parts.join(".");
    }

    /* Move the point through a numeric string rather than multiplying, so no
       answer is ever a floating-point approximation. */
    function shiftDecimal(text, places) {
        const raw = String(text);
        const negative = raw.charAt(0) === "-";
        const body = negative ? raw.slice(1) : raw;
        const pieces = body.split(".");
        let digits = pieces[0] + (pieces[1] || "");
        let point = pieces[0].length + places;
        while (point <= 0) { digits = "0" + digits; point += 1; }
        while (point > digits.length) { digits += "0"; }
        let whole = digits.slice(0, point).replace(/^0+(?=\d)/, "");
        let fraction = digits.slice(point).replace(/0+$/, "");
        if (!whole) whole = "0";
        const value = whole + (fraction ? "." + fraction : "");
        return (negative && Number(value) !== 0 ? "-" : "") + value;
    }

    function decimalText(digits, wholeLength) {
        return digits.slice(0, wholeLength) + "." + digits.slice(wholeLength);
    }

    function randomDigits(rng, count, firstNonZero) {
        let text = "";
        for (let index = 0; index < count; index += 1) {
            text += String(index === 0 && firstNonZero ? randomInt(rng, 1, 9) : randomInt(rng, 0, 9));
        }
        return text;
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

    /* The number with one digit marked. Naming a digit in the sentence and then
       leaving the reader to find it is clerical work, not mathematics; the
       column it stands in — which is the actual question — is not shown. */
    function markedNumber(text, position, ariaLabel) {
        return {
            kind: "marked",
            characters: String(text).split("").map(function (character, index) {
                return { character: character, marked: index === position };
            }),
            ariaLabel: ariaLabel
        };
    }

    /* Stage 1 -------------------------------------------------------- */

    function fillDigitValue(question, rng) {
        const draw = drawValid(function () {
            const wholeLength = randomInt(rng, 1, 3);
            const fractionLength = randomInt(rng, 2, 3);
            const digits = randomDigits(rng, wholeLength + fractionLength, true);
            const position = randomInt(rng, wholeLength, wholeLength + fractionLength - 1);
            return { digits: digits, wholeLength: wholeLength, fractionLength: fractionLength, position: position };
        }, function (candidate) {
            const digit = candidate.digits.charAt(candidate.position);
            if (digit === "0") return false;
            if (candidate.digits.charAt(candidate.digits.length - 1) === "0") return false;
            return candidate.digits.split(digit).length === 2;
        }, { digits: "47638", wholeLength: 2, fractionLength: 3, position: 3 });

        const text = decimalText(draw.digits, draw.wholeLength);
        const digit = draw.digits.charAt(draw.position);
        const exponent = draw.wholeLength - draw.position - 1;
        const valueText = shiftDecimal(digit, exponent);
        question.factKey = text + "/" + draw.position;
        question.title = "What one digit is worth";
        question.prompt = "In this number, write the value of the digit " + digit + ".";
        /* The point takes a place of its own once the digits are written out. */
        question.display = markedNumber(text, draw.position + (draw.position >= draw.wholeLength ? 1 : 0),
            "The number " + groupDigits(text)
            + ", with the digit " + digit + " marked");
        question.mode = "single";
        question.answerKind = "decimal";
        question.answerLabel = "Value of the digit " + digit;
        question.expected = Number(valueText);
        question.expectedText = valueText;
        question.answerShown = valueText;
        question.correctNote = "Correct — the " + digit + " sits in the " + COLUMN_NAMES[String(exponent)] + " column, so it is worth " + valueText + ".";
        question.summaryLine = "The value of the " + digit + " in " + groupDigits(text);
        question.printLine = "In " + groupDigits(text) + ", what is the value of the digit " + digit + "?";
        question.misses = [
            { value: Number(digit), text: "That is the digit itself. Its value depends on the column it stands in, which here is the " + COLUMN_NAMES[String(exponent)] + " column." },
            { value: Number(shiftDecimal(digit, exponent - 1)), text: "That is one column too far to the right. Count the places after the point: the " + digit + " is the " + (draw.position - draw.wholeLength + 1) + (draw.position - draw.wholeLength === 0 ? "st" : draw.position - draw.wholeLength === 1 ? "nd" : draw.position - draw.wholeLength === 2 ? "rd" : "th") + " digit after it." },
            { value: Number(shiftDecimal(digit, exponent + 1)), text: "That is one column too far to the left. Count the places after the point again." }
        ];
        question.hints = [
            "Name the column the digit stands in, then write what one of that column is worth.",
            "Counting after the point: tenths, hundredths, thousandths. The " + digit + " is in the " + COLUMN_NAMES[String(exponent)] + " column."
        ];
        question.steps = [
            "Read the columns of " + groupDigits(text) + " from the point outwards.",
            "The digit " + digit + " stands in the " + COLUMN_NAMES[String(exponent)] + " column.",
            "One " + COLUMN_NAMES[String(exponent)].replace(/s$/, "") + " is " + shiftDecimal("1", exponent) + ", so " + digit + " of them is " + valueText + ".",
            "Value: " + valueText + "."
        ];
        return question;
    }

    function fillNamedColumn(question, rng) {
        const draw = drawValid(function () {
            const wholeLength = randomInt(rng, 1, 3);
            const fractionLength = randomInt(rng, 2, 3);
            return {
                wholeLength: wholeLength,
                fractionLength: fractionLength,
                digits: randomDigits(rng, wholeLength + fractionLength, true),
                position: randomInt(rng, wholeLength, wholeLength + fractionLength - 1)
            };
        }, function (candidate) {
            return candidate.digits.charAt(candidate.digits.length - 1) !== "0";
        }, { wholeLength: 2, fractionLength: 3, digits: "47638", position: 3 });
        const wholeLength = draw.wholeLength;
        const digits = draw.digits;
        const position = draw.position;
        const text = decimalText(digits, wholeLength);
        const digit = digits.charAt(position);
        const exponent = wholeLength - position - 1;
        const column = COLUMN_NAMES[String(exponent)];
        question.factKey = text + "/col" + position;
        question.title = "Reading a named column";
        question.prompt = "Write the digit that stands in the " + column + " column of this number.";
        question.display = inline(groupDigits(text), "The number " + groupDigits(text));
        question.mode = "single";
        question.answerKind = "integer";
        question.answerLabel = "Digit in the " + column + " column";
        question.expected = Number(digit);
        question.expectedText = digit;
        question.answerShown = digit;
        question.correctNote = "Correct — " + digit + " stands in the " + column + " column, so it is worth " + shiftDecimal(digit, exponent) + ".";
        question.summaryLine = "The " + column + " digit of " + groupDigits(text);
        question.printLine = "In " + groupDigits(text) + ", which digit is in the " + column + " column?";
        question.misses = [
            { value: Number(digits.charAt(position - 1)), text: "That digit is one column to the left. The " + column + " column is one place further from the point." },
            { value: Number(digits.charAt(position + 1) || "0"), text: "That digit is one column to the right. Count the places after the point: tenths, hundredths, thousandths." }
        ];
        question.hints = [
            "Count the columns after the decimal point in order: tenths, hundredths, thousandths.",
            "The " + column + " column is " + (-exponent) + " place" + (exponent === -1 ? "" : "s") + " after the point."
        ];
        question.steps = [
            "After the point the columns run tenths, hundredths, thousandths.",
            "The " + column + " column is " + (-exponent) + " place" + (exponent === -1 ? "" : "s") + " after the point in " + groupDigits(text) + ".",
            "The digit standing there is " + digit + ", worth " + shiftDecimal(digit, exponent) + "."
        ];
        return question;
    }

    /* A list where length and sign both mislead, so it has to be read by place
       value rather than by eye. */
    function mixedList(rng, size) {
        const values = [];
        for (let index = 0; index < size; index += 1) {
            const negative = rng() < 0.4;
            const body = drawValid(function () {
                const wholeLength = randomInt(rng, 1, 2);
                const fractionLength = randomInt(rng, 1, 3);
                return decimalText(randomDigits(rng, wholeLength + fractionLength, true), wholeLength);
            }, function (candidate) {
                return candidate.charAt(candidate.length - 1) !== "0";
            }, "4.75");
            values.push((negative ? "-" : "") + body);
        }
        return values;
    }

    function extremeQuestion(question, rng, wantSmallest) {
        const values = drawValid(function () {
            return mixedList(rng, 4);
        }, function (candidate) {
            const numbers = candidate.map(Number);
            if (new Set(numbers).size !== 4) return false;
            const sorted = numbers.slice().sort(function (a, b) { return a - b; });
            const target = wantSmallest ? sorted[0] : sorted[3];
            const runnerUp = wantSmallest ? sorted[1] : sorted[2];
            return Math.abs(target - runnerUp) > 1e-9 && candidate.some(function (value) { return value.charAt(0) === "-"; });
        }, wantSmallest ? ["-2.5", "-7.25", "0.8", "0.75"] : ["9.09", "9.9", "-9.99", "0.999"]);

        const numbers = values.map(Number);
        const target = wantSmallest ? Math.min.apply(null, numbers) : Math.max.apply(null, numbers);
        const correct = numbers.indexOf(target);
        const notes = values.map(function (value, index) {
            if (index === correct) {
                return "Correct — " + groupDigits(value) + " is the " + (wantSmallest ? "smallest" : "largest")
                    + ", the value furthest to the " + (wantSmallest ? "left" : "right") + " on a number line.";
            }
            const other = Number(value);
            const comparison = wantSmallest
                ? groupDigits(value) + " is to the right of " + groupDigits(values[correct]) + " on a number line, so it is larger."
                : groupDigits(value) + " is to the left of " + groupDigits(values[correct]) + " on a number line, so it is smaller.";
            const extra = value.charAt(0) === "-" && !wantSmallest
                ? " A negative value is always smaller than a positive one, however many digits it has."
                : (!wantSmallest && Number(values[correct]) > 0 && other > 0 && String(value).replace(/[-.]/g, "").length > String(values[correct]).replace(/[-.]/g, "").length
                    ? " Extra digits after the point do not make a number larger."
                    : "");
            return comparison + extra;
        });
        question.factKey = values.join("|") + (wantSmallest ? "/min" : "/max");
        question.title = wantSmallest ? "Finding the smallest" : "Finding the largest";
        question.prompt = "Choose the " + (wantSmallest ? "smallest" : "largest") + " of these four values.";
        question.mode = "choice";
        question.compactValues = true;
        question.choiceLegend = "The " + (wantSmallest ? "smallest" : "largest") + " value";
        question.options = values.map(groupDigits);
        question.optionNotes = notes;
        question.correctIndex = correct;
        question.answerShown = groupDigits(values[correct]);
        question.answerLabel = "Your choice";
        question.summaryLine = values.map(groupDigits).join(", ");
        question.printLine = "Which is the " + (wantSmallest ? "smallest" : "largest") + " of " + values.map(groupDigits).join(", ") + "?";
        question.hints = [
            "Place each value on a number line rather than judging by how long it looks. Further left is smaller.",
            "Deal with the negatives first: every negative value is below every positive one."
        ];
        question.steps = [
            "Separate the negatives from the positives: every negative value is smaller than every positive one.",
            "Within each group, compare one place value at a time, starting from the largest place.",
            "In ascending order these are " + numbers.slice().sort(function (a, b) { return a - b; })
                .map(function (value) { return groupDigits(values[numbers.indexOf(value)]); }).join(", ") + ".",
            "So the " + (wantSmallest ? "smallest" : "largest") + " is " + groupDigits(values[correct]) + "."
        ];
        return question;
    }

    function fillSmallestOfList(question, rng) { return extremeQuestion(question, rng, true); }
    function fillLargestOfList(question, rng) { return extremeQuestion(question, rng, false); }

    /* Stage 2 -------------------------------------------------------- */

    function symbolQuestion(question, rng, useNegatives) {
        const draw = drawValid(function () {
            if (useNegatives) {
                const left = -Number(decimalText(randomDigits(rng, 3, true), 1));
                const right = rng() < 0.5 ? -Number(decimalText(randomDigits(rng, 3, true), 1)) : Number(decimalText(randomDigits(rng, 3, true), 1));
                return { left: String(left), right: String(right) };
            }
            if (rng() < 0.25) {
                const shared = decimalText(randomDigits(rng, 2, true), 1);
                return { left: shared, right: shared + "0" };
            }
            return {
                left: decimalText(randomDigits(rng, randomInt(rng, 2, 4), true), 1),
                right: decimalText(randomDigits(rng, randomInt(rng, 2, 4), true), 1)
            };
        }, function (candidate) {
            if (candidate.left === candidate.right) return false;
            if (Number(candidate.left) === Number(candidate.right)) return true;
            return candidate.left.charAt(candidate.left.length - 1) !== "0"
                && candidate.right.charAt(candidate.right.length - 1) !== "0";
        }, useNegatives ? { left: "-7.2", right: "-2.9" } : { left: "0.75", right: "0.8" });

        const left = Number(draw.left);
        const right = Number(draw.right);
        const symbols = ["<", ">", "="];
        const correct = left < right ? 0 : left > right ? 1 : 2;
        const notes = [
            left < right
                ? "Correct — the point of the symbol faces " + groupDigits(draw.left) + ", the smaller value."
                : "That reads “" + groupDigits(draw.left) + " is less than " + groupDigits(draw.right) + "”, which is not true here.",
            left > right
                ? "Correct — the wide opening faces " + groupDigits(draw.left) + ", the larger value."
                : "That reads “" + groupDigits(draw.left) + " is greater than " + groupDigits(draw.right) + "”, which is not true here.",
            left === right
                ? "Correct — the two are written differently but have the same value."
                : "The two values are not the same, so the equals sign cannot be used."
        ];
        question.factKey = draw.left + "|" + draw.right;
        question.title = useNegatives ? "Comparing with negatives" : "Choosing the symbol";
        question.prompt = "Choose the symbol that makes this statement true.";
        question.display = inline(groupDigits(draw.left) + "  □  " + groupDigits(draw.right),
            groupDigits(draw.left) + ", a box for the symbol, then " + groupDigits(draw.right));
        question.mode = "choice";
        question.compactValues = true;
        question.choiceLegend = "The symbol that belongs in the box";
        question.options = symbols;
        question.optionNotes = notes;
        question.correctIndex = correct;
        question.answerShown = groupDigits(draw.left) + " " + symbols[correct] + " " + groupDigits(draw.right);
        question.answerLabel = "Your choice";
        question.summaryLine = groupDigits(draw.left) + " □ " + groupDigits(draw.right);
        question.printLine = groupDigits(draw.left) + " □ " + groupDigits(draw.right) + " — which symbol?";
        question.hints = [
            "The point of the symbol faces the smaller value and the wide opening faces the larger one.",
            useNegatives
                ? "On a number line, the further left a value is, the smaller it is — so " + groupDigits(String(Math.min(left, right))) + " is the smaller of these two."
                : "Compare one place value at a time from the largest place, and pad the shorter decimal with zeros if that helps."
        ];
        question.steps = [
            useNegatives
                ? "Place both values on a number line: " + groupDigits(String(Math.min(left, right))) + " lies to the left of " + groupDigits(String(Math.max(left, right))) + "."
                : "Compare one place value at a time, starting from the largest place.",
            left === right
                ? groupDigits(draw.left) + " and " + groupDigits(draw.right) + " have the same value, so the equals sign is the one that fits."
                : groupDigits(String(Math.min(left, right))) + " is the smaller value, and the point of the symbol faces it.",
            "The true statement is " + groupDigits(draw.left) + " " + symbols[correct] + " " + groupDigits(draw.right) + "."
        ];
        return question;
    }

    function fillSymbolBetween(question, rng) { return symbolQuestion(question, rng, false); }
    function fillSymbolNegatives(question, rng) { return symbolQuestion(question, rng, true); }

    function orderedQuestion(question, rng, ascending) {
        const values = drawValid(function () {
            return mixedList(rng, 4);
        }, function (candidate) {
            return new Set(candidate.map(Number)).size === 4
                && candidate.some(function (value) { return value.charAt(0) === "-"; });
        }, ["-2.5", "0.75", "-0.9", "1.08"]);

        const sorted = values.slice().sort(function (a, b) {
            return ascending ? Number(a) - Number(b) : Number(b) - Number(a);
        });
        /* Distractors: sorted while ignoring the sign, sorted by how long each
           value looks, and the correct order reversed. */
        const byMagnitude = values.slice().sort(function (a, b) {
            return ascending ? Math.abs(Number(a)) - Math.abs(Number(b)) : Math.abs(Number(b)) - Math.abs(Number(a));
        });
        const byLength = values.slice().sort(function (a, b) {
            const left = a.replace(/[-.]/g, "").length;
            const right = b.replace(/[-.]/g, "").length;
            return ascending ? left - right : right - left;
        });
        const reversed = sorted.slice().reverse();

        const candidates = [sorted, byMagnitude, byLength, reversed];
        const texts = [];
        const notes = [
            "Correct — this reads from " + (ascending ? "smallest to largest" : "largest to smallest") + ".",
            "This ignores the signs and orders by size alone. A negative value is smaller than a positive one however large its digits are.",
            "This orders by how many digits each value has. Length does not decide size: 0.75 has more digits than 0.8 and is smaller.",
            "This is the correct order reversed: it reads from " + (ascending ? "largest to smallest" : "smallest to largest") + "."
        ];
        const options = [];
        const optionNotes = [];
        candidates.forEach(function (candidate, index) {
            const text = candidate.map(groupDigits).join(", ");
            if (texts.indexOf(text) !== -1) return;
            texts.push(text);
            options.push(text);
            optionNotes.push(notes[index]);
        });
        while (options.length < 4) {
            const rotated = sorted.slice(1).concat(sorted.slice(0, 1));
            const text = rotated.map(groupDigits).join(", ");
            if (texts.indexOf(text) !== -1) break;
            texts.push(text);
            options.push(text);
            optionNotes.push("This list is not in order: check it one value at a time against a number line.");
        }
        const order = shuffleIndexes(options.length, rng);
        question.factKey = values.join("|") + (ascending ? "/asc" : "/desc");
        question.title = ascending ? "Reading a list in ascending order" : "Reading a list in descending order";
        question.prompt = "Choose the list that puts these four values in " + (ascending ? "ascending" : "descending")
            + " order, " + (ascending ? "smallest first" : "largest first") + ".";
        question.givenLabel = "The values";
        question.given = values.map(groupDigits).join(", ");
        question.mode = "choice";
        question.choiceLegend = "The correctly ordered list";
        question.options = order.map(function (index) { return options[index]; });
        question.optionNotes = order.map(function (index) { return optionNotes[index]; });
        question.correctIndex = order.indexOf(0);
        question.answerShown = options[0];
        question.answerLabel = "Your choice";
        question.summaryLine = values.map(groupDigits).join(", ") + ", in " + (ascending ? "ascending" : "descending") + " order";
        question.printLine = "Put " + values.map(groupDigits).join(", ") + " in " + (ascending ? "ascending" : "descending") + " order.";
        question.hints = [
            "Sort the negatives and the positives into two groups first, then order inside each group one place value at a time.",
            "On a number line the order runs left to right from smallest to largest, so " + (ascending ? "start" : "end") + " at the far left."
        ];
        question.steps = [
            "Every negative value is smaller than every positive one, so separate them first.",
            "Inside each group compare one place value at a time from the largest place, padding shorter decimals with zeros.",
            "In ascending order: " + values.slice().sort(function (a, b) { return Number(a) - Number(b); }).map(groupDigits).join(", ") + ".",
            (ascending ? "Ascending" : "Descending") + " order: " + options[0] + "."
        ];
        return question;
    }

    function fillOrderedAscending(question, rng) { return orderedQuestion(question, rng, true); }
    function fillOrderedDescending(question, rng) { return orderedQuestion(question, rng, false); }

    /* Stage 3 -------------------------------------------------------- */

    function scalingQuestion(question, rng, options) {
        const startText = drawValid(function () {
            const wholeLength = randomInt(rng, 1, 2);
            const fractionLength = randomInt(rng, 1, 3);
            return decimalText(randomDigits(rng, wholeLength + fractionLength, true), wholeLength);
        }, function (candidate) {
            return candidate.charAt(candidate.length - 1) !== "0";
        }, "52.8");
        const shift = options.shift;
        const answerText = shiftDecimal(startText, shift);
        const larger = shift > 0;
        question.factKey = startText + "/" + options.label;
        question.title = "Scaling by a power of ten";
        question.prompt = "Work out this calculation.";
        question.display = inline(groupDigits(startText) + " " + options.label,
            groupDigits(startText) + " " + options.ariaLabel);
        question.mode = "single";
        question.answerKind = "decimal";
        question.answerLabel = "Answer";
        question.expected = Number(answerText);
        question.expectedText = answerText;
        question.answerShown = groupDigits(answerText);
        question.correctNote = "Correct — every digit moves " + Math.abs(shift) + " place"
            + (Math.abs(shift) === 1 ? "" : "s") + " to the " + (larger ? "left" : "right") + ", so the value becomes "
            + (larger ? "larger" : "smaller") + ": " + groupDigits(answerText) + ".";
        question.summaryLine = groupDigits(startText) + " " + options.label;
        question.printLine = groupDigits(startText) + " " + options.label;
        question.misses = [
            { value: Number(shiftDecimal(startText, -shift)), text: "The digits have moved the right number of places but in the wrong direction. " + options.direction },
            { value: Number(shiftDecimal(startText, shift > 0 ? shift + 1 : shift - 1)), text: "That is one place too far. " + options.label + " moves every digit " + Math.abs(shift) + " place" + (Math.abs(shift) === 1 ? "" : "s") + " to the " + (larger ? "left" : "right") + "." },
            { value: Number(startText), text: "That is the number unchanged. Every digit has to move " + Math.abs(shift) + " place" + (Math.abs(shift) === 1 ? "" : "s") + " to the " + (larger ? "left" : "right") + "." }
        ];
        question.hints = [
            "The digits move; the decimal point stays where it is. Decide which way they move and how far.",
            options.hint
        ];
        question.steps = [
            options.label + " moves every digit " + Math.abs(shift) + " place" + (Math.abs(shift) === 1 ? "" : "s") + " to the " + (larger ? "left" : "right") + ".",
            options.reason,
            "Each digit of " + groupDigits(startText) + " keeps its order and takes its new column, giving " + groupDigits(answerText) + ".",
            "Answer: " + groupDigits(answerText) + "."
        ];
        return question;
    }

    function fillTimesPower(question, rng) {
        const choice = pick([
            { label: "× 10", ariaLabel: "multiplied by 10", shift: 1 },
            { label: "× 100", ariaLabel: "multiplied by 100", shift: 2 },
            { label: "× 1,000", ariaLabel: "multiplied by 1,000", shift: 3 }
        ], rng);
        return scalingQuestion(question, rng, {
            label: choice.label, ariaLabel: choice.ariaLabel, shift: choice.shift,
            direction: "Multiplying makes a positive value larger, so the digits move left.",
            hint: "Multiplying by " + (choice.shift === 1 ? "10" : choice.shift === 2 ? "100" : "1,000") + " moves every digit " + choice.shift + " place" + (choice.shift === 1 ? "" : "s") + " to the left.",
            reason: "Each digit becomes worth ten times as much for every place it moves left."
        });
    }

    function fillDividePower(question, rng) {
        const choice = pick([
            { label: "÷ 10", ariaLabel: "divided by 10", shift: -1 },
            { label: "÷ 100", ariaLabel: "divided by 100", shift: -2 },
            { label: "÷ 1,000", ariaLabel: "divided by 1,000", shift: -3 }
        ], rng);
        return scalingQuestion(question, rng, {
            label: choice.label, ariaLabel: choice.ariaLabel, shift: choice.shift,
            direction: "Dividing by a number greater than 1 makes a positive value smaller, so the digits move right.",
            hint: "Dividing by " + (choice.shift === -1 ? "10" : choice.shift === -2 ? "100" : "1,000") + " moves every digit " + Math.abs(choice.shift) + " place" + (choice.shift === -1 ? "" : "s") + " to the right.",
            reason: "Each digit becomes worth one tenth as much for every place it moves right."
        });
    }

    function fillTimesTenth(question, rng) {
        const choice = pick([
            { label: "× 0.1", ariaLabel: "multiplied by 0.1", shift: -1, name: "0.1" },
            { label: "× 0.01", ariaLabel: "multiplied by 0.01", shift: -2, name: "0.01" }
        ], rng);
        return scalingQuestion(question, rng, {
            label: choice.label, ariaLabel: choice.ariaLabel, shift: choice.shift,
            direction: "Multiplying by a value below 1 makes a positive value smaller, so the digits move right.",
            hint: "Multiplying by " + choice.name + " is the same as dividing by " + (choice.shift === -1 ? "10" : "100") + ".",
            reason: "Taking " + choice.name + " of a number is the same as dividing it by " + (choice.shift === -1 ? "10" : "100") + ", so multiplying can make a value smaller."
        });
    }

    /* The reflex says dividing makes a number smaller. Dividing by a tenth is
       where that reflex fails, so the round finishes here. */
    function fillDivideByTenth(question, rng) {
        const choice = pick([
            { label: "÷ 0.1", ariaLabel: "divided by 0.1", shift: 1, name: "0.1", factor: "10" },
            { label: "÷ 0.01", ariaLabel: "divided by 0.01", shift: 2, name: "0.01", factor: "100" }
        ], rng);
        const built = scalingQuestion(question, rng, {
            label: choice.label, ariaLabel: choice.ariaLabel, shift: choice.shift,
            direction: "Ask how many " + choice.name + "s fit inside the number: there are " + choice.factor + " in every 1, so the answer is larger than the number you started with.",
            hint: "How many lots of " + choice.name + " fit into 1? Dividing by " + choice.name + " is the same as multiplying by " + choice.factor + ".",
            reason: "There are " + choice.factor + " lots of " + choice.name + " in every 1, so dividing by " + choice.name + " is the same as multiplying by " + choice.factor + "."
        });
        built.title = "Scaling by a power of ten";
        return built;
    }

    const FILLERS = {
        "digit-value": fillDigitValue,
        "named-column": fillNamedColumn,
        "smallest-of-list": fillSmallestOfList,
        "largest-of-list": fillLargestOfList,
        "symbol-between": fillSymbolBetween,
        "symbol-negatives": fillSymbolNegatives,
        "ordered-ascending": fillOrderedAscending,
        "ordered-descending": fillOrderedDescending,
        "times-power": fillTimesPower,
        "divide-power": fillDividePower,
        "times-tenth": fillTimesTenth,
        "divide-by-tenth": fillDivideByTenth
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
            order.forEach(function (family) {
                round.push(generateQuestion(stage, family, rng));
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
        return { state: "wrong", text: "Not yet. Work through it one place-value column at a time rather than by the look of the number." };
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
            question.misses.forEach(function (miss, index) {
                if (nearlyEqual(miss.value, question.expected)) problems.push("miss " + index + " equals the answer");
            });
        }
        if (question.mode === "choice") {
            if (question.options.length < 3 || question.options.length > 4) problems.push("unexpected option count");
            if (new Set(question.options).size !== question.options.length) problems.push("duplicate options");
            if (question.optionNotes.length !== question.options.length) problems.push("option notes do not match options");
            if (question.correctIndex < 0) problems.push("no correct option");
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
            if (round[11].family !== "divide-by-tenth") problems.push("Round " + seed + " does not end on the division by a tenth.");
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

    scope.PlaceValueReviewPractice = api;
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
                const id = "place-choice-" + current + "-" + index;
                const label = element("label", "practice-choice__option");
                if (currentQuestion.compactValues) label.classList.add("is-value-choice");
                const radio = element("input");
                radio.type = "radio";
                radio.name = "place-choice-" + current;
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
                const id = "place-part-" + current + "-" + index;
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
            expression.setAttribute("role", "img");
            expression.setAttribute("aria-label", display.ariaLabel);
            expression.classList.add("practice-division-line");
            if (display.kind === "marked") {
                expression.classList.add("practice-number");
                display.characters.forEach(function (cell) {
                    const node = element("span", cell.marked ? "is-marked" : "", cell.character);
                    expression.appendChild(node);
                });
                return;
            }
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
