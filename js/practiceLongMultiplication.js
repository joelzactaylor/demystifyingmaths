/* Practice: long multiplication.
   Generates the twelve questions of a round, marks them, and drives the page.
   The generator half runs without a document so it can be fuzzed from Node. */
(function (scope) {
    "use strict";

    const STAGES = [
        { name: "Multiplying in rows", lessonAnchor: "the-short-form" },
        { name: "Rows and their zeros", lessonAnchor: "why-a-row-ends-in-zeros" },
        { name: "Multiplying in context", lessonAnchor: "where-it-turns-up" }
    ];

    const LESSON_URL = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/longMultiplication.html";

    const FAMILIES = [
        ["fluency-pair", "fluency-rows", "fluency-long", "fluency-zero-digit"],
        ["missing-second-row", "choose-third-row", "three-rows", "missing-first-row"],
        ["cost-small", "area-centimetres", "cost-large", "area-metres"]
    ];

    const PLACE_NAMES = ["ones", "tens", "hundreds", "thousands"];
    const ORDINALS = ["first", "second", "third", "fourth"];

    function placeName(exponent) {
        return PLACE_NAMES[exponent] || "ones";
    }

    function ordinal(index) {
        return ORDINALS[index] || "next";
    }

    function randomInt(rng, min, max) {
        return min + Math.floor(rng() * (max - min + 1));
    }

    function pick(values, rng) {
        return values[randomInt(rng, 0, values.length - 1)];
    }

    function digitsOf(value) {
        return String(value).split("").map(Number);
    }

    function formatNumber(value) {
        const text = String(Math.abs(Math.round(value)));
        let out = "";
        for (let index = 0; index < text.length; index += 1) {
            if (index > 0 && (text.length - index) % 3 === 0) out += ",";
            out += text[index];
        }
        return (value < 0 ? "−" : "") + out;
    }

    function zeroWord(count) {
        if (count === 0) return "no place-holder zero";
        if (count === 1) return "one place-holder zero";
        return "two place-holder zeros";
    }

    /* One entry per digit of the multiplier, ones digit first. `base` is the
       small product before the place-holder zeros are attached; `value` is the
       row as it is written on the page. */
    function rowsOf(a, b) {
        const lower = digitsOf(b);
        const rows = [];
        for (let index = lower.length - 1; index >= 0; index -= 1) {
            const exponent = lower.length - 1 - index;
            rows.push({
                digit: lower[index],
                exponent: exponent,
                base: a * lower[index],
                value: a * lower[index] * Math.pow(10, exponent)
            });
        }
        return rows;
    }

    /* The slip the lesson names: the carried digit is added to the upper digit
       before the multiplication instead of after it. */
    function earlyCarryValue(a, digit) {
        const upper = digitsOf(a);
        let carry = 0;
        let place = 1;
        let total = 0;
        for (let index = upper.length - 1; index >= 0; index -= 1) {
            const product = (upper[index] + carry) * digit;
            total += (product % 10) * place;
            carry = Math.floor(product / 10);
            place *= 10;
        }
        return total + carry * place;
    }

    function earlyCarryTotal(a, b) {
        return rowsOf(a, b).reduce(function (total, row) {
            return total + earlyCarryValue(a, row.digit) * Math.pow(10, row.exponent);
        }, 0);
    }

    function noHolderTotal(a, b) {
        return rowsOf(a, b).reduce(function (total, row) {
            return total + row.base;
        }, 0);
    }

    /* Only the last row loses a zero: the three-digit multiplier's hundreds row
       written as though its digit were worth ten. */
    function lastRowShortTotal(a, b) {
        const rows = rowsOf(a, b);
        if (rows.length < 3) return 0;
        return rows.reduce(function (total, row, index) {
            if (index !== rows.length - 1) return total + row.value;
            return total + row.base * Math.pow(10, row.exponent - 1);
        }, 0);
    }

    /* Only the second row gains a zero, which is the slip the message names. */
    function extraHolderTotal(a, b) {
        return rowsOf(a, b).reduce(function (total, row, index) {
            if (index !== 1) return total + row.value;
            return total + row.base * 100;
        }, 0);
    }

    function digitSumProduct(a, b) {
        return a * digitsOf(b).reduce(function (total, digit) { return total + digit; }, 0);
    }

    function padDigits(value, width) {
        const digits = digitsOf(value);
        while (digits.length < width) digits.unshift(null);
        return digits;
    }

    /* ---------------------------------------------------------------- values */

    /* Context values keep a non-zero ones digit, so every digit of the
       multiplier makes a row worth writing. Bounded, with a valid fallback. */
    function nonZeroOnes(rng, min, max) {
        for (let attempt = 0; attempt < 12; attempt += 1) {
            const value = randomInt(rng, min, max);
            if (value % 10 !== 0) return value;
        }
        const fallback = randomInt(rng, min, max);
        if (fallback % 10 !== 0) return fallback;
        return fallback === max ? fallback - 1 : fallback + 1;
    }

    function twoDigitFactor(rng, minTens) {
        return randomInt(rng, minTens === undefined ? 2 : minTens, 9) * 10 + randomInt(rng, 2, 9);
    }

    function threeDigitFactor(rng, maxHundreds) {
        return randomInt(rng, 1, maxHundreds === undefined ? 9 : maxHundreds) * 100
            + randomInt(rng, 1, 9) * 10
            + randomInt(rng, 2, 9);
    }

    function zeroTensFactor(rng) {
        return randomInt(rng, 2, 9) * 100 + randomInt(rng, 2, 9);
    }

    /* A three-digit multiplier with three distinct non-zero digits, so every
       row exists and the candidate rows of a choice question stay distinct. */
    function threeDigitMultiplier(rng) {
        let hundreds = randomInt(rng, 1, 3);
        let tens = randomInt(rng, 1, 9);
        let ones = randomInt(rng, 2, 9);
        let guard = 0;
        while ((tens === hundreds || ones === hundreds || ones === tens) && guard < 24) {
            tens = randomInt(rng, 1, 9);
            ones = randomInt(rng, 2, 9);
            guard += 1;
        }
        if (tens === hundreds) tens = tens === 9 ? 8 : tens + 1;
        if (ones === hundreds || ones === tens) {
            const taken = [hundreds, tens];
            for (let candidate = 2; candidate <= 9; candidate += 1) {
                if (taken.indexOf(candidate) === -1) { ones = candidate; break; }
            }
        }
        return hundreds * 100 + tens * 10 + ones;
    }

    function twoDigitMultiplier(rng) {
        const tens = randomInt(rng, 2, 9);
        let ones = randomInt(rng, 2, 9);
        if (ones === tens) ones = ones === 9 ? 8 : ones + 1;
        return tens * 10 + ones;
    }

    /* ---------------------------------------------------------------- display */

    function columnLines(a, b, width, partials, missingIndex) {
        const lines = [
            { type: "digits", sign: "", digits: padDigits(a, width) },
            { type: "digits", sign: "×", digits: padDigits(b, width) },
            { type: "rule" }
        ];
        if (partials) {
            partials.forEach(function (row, index) {
                const sign = index === 0 ? "" : "+";
                if (index === missingIndex) lines.push({ type: "box", sign: sign });
                else lines.push({ type: "digits", sign: sign, digits: padDigits(row.value, width) });
            });
        }
        return lines;
    }

    function factorDisplay(a, b) {
        const width = Math.max(String(a).length, String(b).length);
        return {
            kind: "column",
            width: width,
            lines: columnLines(a, b, width),
            ariaLabel: formatNumber(a) + " multiplied by " + formatNumber(b) + ", set out in columns."
        };
    }

    function inlineDisplay(a, b) {
        return {
            kind: "inline",
            text: formatNumber(a) + " × " + formatNumber(b),
            ariaLabel: formatNumber(a) + " multiplied by " + formatNumber(b) + "."
        };
    }

    function partialDisplay(a, b, missingIndex) {
        const rows = rowsOf(a, b);
        const width = String(a * b).length;
        const spoken = rows.map(function (row, index) {
            return "the " + ordinal(index) + " row " + (index === missingIndex
                ? "is empty"
                : "reads " + formatNumber(row.value));
        });
        return {
            kind: "column",
            width: width,
            lines: columnLines(a, b, width, rows, missingIndex),
            ariaLabel: formatNumber(a) + " multiplied by " + formatNumber(b)
                + ", set out in columns with " + spoken.join(", ") + ". The answer line is not written."
        };
    }

    /* ---------------------------------------------------------------- solutions */

    function productSteps(a, b, opening, closing) {
        const rows = rowsOf(a, b);
        const steps = [];
        if (opening) steps.push(opening);
        steps.push("Set " + formatNumber(a) + " above " + formatNumber(b)
            + " so that equal place values share a column.");
        rows.forEach(function (row, index) {
            steps.push(rowSentence(a, row, index));
        });
        const sum = rows.map(function (row) { return formatNumber(row.value); }).join(" + ");
        steps.push("Add the rows in columns: " + sum + " = " + formatNumber(a * b) + ".");
        steps.push(closing || (formatNumber(a) + " × " + formatNumber(b) + " = " + formatNumber(a * b) + "."));
        return steps;
    }

    function rowSentence(a, row, index) {
        const label = ordinal(index) + " row, from the " + placeName(row.exponent) + " digit";
        if (row.exponent === 0) {
            return "The " + label + ": " + formatNumber(a) + " × " + row.digit
                + " = " + formatNumber(row.base) + ".";
        }
        const zeros = row.exponent === 1 ? "a zero" : "two zeros";
        const columns = row.exponent === 1 ? "the ones column" : "the ones and tens columns";
        return "The " + label + ": write " + zeros + " in " + columns + " first, then "
            + formatNumber(a) + " × " + row.digit + " = " + formatNumber(row.base)
            + ", so the row is " + formatNumber(row.value) + ".";
    }

    function missingRowSteps(a, b, missingIndex) {
        const rows = rowsOf(a, b);
        const row = rows[missingIndex];
        const steps = [
            "The rows are made one digit of " + formatNumber(b) + " at a time, starting with its "
                + placeName(0) + " digit. The empty line is the " + ordinal(missingIndex)
                + " row, so it belongs to the " + placeName(row.exponent) + " digit, " + row.digit + "."
        ];
        if (row.exponent === 0) {
            steps.push("That digit is worth " + row.digit + ", so the row has " + zeroWord(0) + ".");
        } else {
            steps.push("That digit is worth " + formatNumber(row.digit * Math.pow(10, row.exponent))
                + ", so the row ends in " + zeroWord(row.exponent) + ". Write "
                + (row.exponent === 1 ? "it" : "them") + " down before multiplying.");
        }
        steps.push(formatNumber(a) + " × " + row.digit + " = " + formatNumber(row.base) + ".");
        steps.push("The missing row is " + formatNumber(row.value) + ".");
        return steps;
    }

    /* ---------------------------------------------------------------- hints */

    function productHints(a, b) {
        const rows = rowsOf(a, b);
        const last = rows[rows.length - 1];
        return [
            "Set it out with " + formatNumber(a) + " on top. Each digit of " + formatNumber(b)
                + " makes one row of its own, starting with the ones digit.",
            "The " + ordinal(rows.length - 1) + " row comes from a digit worth "
                + formatNumber(last.digit * Math.pow(10, last.exponent)) + ", so put "
                + zeroWord(last.exponent) + " down before multiplying, then add the rows in columns."
        ];
    }

    function missingRowHints(a, b, missingIndex) {
        const row = rowsOf(a, b)[missingIndex];
        return [
            "Every digit of " + formatNumber(b) + " makes one row, in order from its ones digit. "
                + "Which digit has not been used yet?",
            "It is the " + placeName(row.exponent) + " digit, " + row.digit + ". Start the row with "
                + zeroWord(row.exponent) + ", then multiply " + formatNumber(a) + " by " + row.digit + "."
        ];
    }

    /* ---------------------------------------------------------------- guesses */

    function productGuesses(question) {
        const a = question.a;
        const b = question.b;
        const answer = question.answer;
        const rows = rowsOf(a, b);
        const guesses = [];
        const seen = [answer];
        const add = function (value, text) {
            if (!Number.isFinite(value) || value <= 0 || Math.round(value) !== value) return;
            if (seen.indexOf(value) !== -1) return;
            seen.push(value);
            guesses.push({ value: value, text: text });
        };

        add(noHolderTotal(a, b), "Every row after the first has to hold its place. Without those zeros the "
            + ordinal(1) + " row is ten times too small, so the total falls short.");
        if (rows.length > 2) {
            add(lastRowShortTotal(a, b), "The last row needs two zeros, not one. Its digit is worth "
                + formatNumber(rows[2].digit * 100) + ", so the row ends in " + zeroWord(2) + ".");
        }
        add(extraHolderTotal(a, b), "One zero too many. The " + ordinal(1) + " row comes from a digit worth "
            + formatNumber(rows[1].digit * 10) + ", so it ends in " + zeroWord(1) + ".");
        rows.forEach(function (row, index) {
            add(row.value, "That is only the " + ordinal(index) + " row. The other "
                + (rows.length > 2 ? "rows are" : "row is") + " still to be added.");
        });
        add(earlyCarryTotal(a, b), "A carried digit joins after the multiplication, not before it. Multiply the upper digit first, then add what was carried.");
        add(digitSumProduct(a, b), "That multiplies by the digits of " + formatNumber(b)
            + " added together. " + formatNumber(b) + " is " + rows.map(function (row) {
                return formatNumber(row.digit * Math.pow(10, row.exponent));
            }).reverse().join(" + ") + ", and each part needs its own row.");
        add(a + b, "That is the sum of the two numbers. The question asks what they make when multiplied.");
        add(answer * 10, "The digits are right but the answer is ten times too big. Check where each row starts.");
        if (answer % 10 === 0) {
            add(answer / 10, "The digits are right but the answer is ten times too small. Check the zeros that hold each row's place.");
        }
        return guesses;
    }

    /* ---------------------------------------------------------------- contexts */

    const COST_SMALL = [
        {
            id: "seats",
            priceMin: 14, priceMax: 68, countMin: 23, countMax: 72,
            story: function (price, count) {
                return "A coach company charges £" + price + " for each seat, and a school books "
                    + count + " seats.";
            },
            question: "What is the total cost?",
            hint: function (price, count) {
                return "Every one of the " + count + " seats costs the same £" + price
                    + ", so the total is " + count + " lots of £" + price + ".";
            }
        },
        {
            id: "brackets",
            priceMin: 12, priceMax: 45, countMin: 24, countMax: 89,
            story: function (price, count) {
                return "A workshop orders " + count + " identical brackets, and each bracket costs £"
                    + price + ".";
            },
            question: "What do the brackets cost altogether?",
            hint: function (price, count) {
                return "The brackets are all the same price, so the bill is " + count
                    + " lots of £" + price + ".";
            }
        },
        {
            id: "hours",
            priceMin: 16, priceMax: 62, countMin: 23, countMax: 45,
            story: function (price, count) {
                return "A technician is paid £" + price + " an hour and works " + count
                    + " hours in a month.";
            },
            question: "How much is the technician paid for those hours?",
            hint: function (price, count) {
                return "Each of the " + count + " hours is paid at the same £" + price + " rate.";
            }
        }
    ];

    const COST_LARGE = [
        {
            id: "tickets",
            priceMin: 14, priceMax: 78, countMin: 112, countMax: 486,
            story: function (price, count) {
                return "Tickets for a concert cost £" + price + " each, and " + formatNumber(count)
                    + " of them are sold.";
            },
            question: "How much is taken in ticket sales?",
            hint: function (price, count) {
                return "Every one of the " + formatNumber(count) + " tickets brings in the same £"
                    + price + ".";
            }
        },
        {
            id: "slabs",
            priceMin: 12, priceMax: 39, countMin: 115, countMax: 380,
            story: function (price, count) {
                return "A landscaper buys " + formatNumber(count) + " paving slabs at £" + price
                    + " each.";
            },
            question: "What is the total cost of the slabs?",
            hint: function (price, count) {
                return "The slabs are all the same price, so the cost is " + formatNumber(count)
                    + " lots of £" + price + ".";
            }
        },
        {
            id: "meals",
            priceMin: 17, priceMax: 68, countMin: 112, countMax: 420,
            story: function (price, count) {
                return "A caterer charges £" + price + " a head, and " + formatNumber(count)
                    + " guests are expected.";
            },
            question: "What will the catering cost?",
            hint: function (price, count) {
                return "Each of the " + formatNumber(count) + " guests is charged the same £"
                    + price + ".";
            }
        }
    ];

    const AREA_CENTIMETRES = [
        {
            id: "worktop",
            longMin: 124, longMax: 318, shortMin: 45, shortMax: 92,
            story: function (long, short) {
                return "A rectangular worktop measures " + formatNumber(long)
                    + " cm along the front and " + short + " cm from front to back.";
            },
            question: "What is its area?"
        },
        {
            id: "board",
            longMin: 105, longMax: 258, shortMin: 46, shortMax: 95,
            story: function (long, short) {
                return "A notice board is a rectangle " + formatNumber(long) + " cm wide and "
                    + short + " cm tall.";
            },
            question: "What area does it cover?"
        },
        {
            id: "rug",
            longMin: 142, longMax: 285, shortMin: 62, shortMax: 98,
            story: function (long, short) {
                return "A rectangular rug measures " + formatNumber(long) + " cm by " + short + " cm.";
            },
            question: "What is the area of the rug?"
        }
    ];

    const AREA_METRES = [
        {
            id: "pitch",
            longMin: 105, longMax: 178, shortMin: 46, shortMax: 92,
            story: function (long, short) {
                return "A rectangular playing field measures " + formatNumber(long)
                    + " m along one side and " + short + " m along the other.";
            },
            question: "What is the area of the field?"
        },
        {
            id: "carpark",
            longMin: 108, longMax: 236, shortMin: 24, shortMax: 74,
            story: function (long, short) {
                return "A car park is a rectangle " + formatNumber(long) + " m long and " + short
                    + " m deep.";
            },
            question: "What area does the car park cover?"
        },
        {
            id: "warehouse",
            longMin: 112, longMax: 254, shortMin: 34, shortMax: 88,
            story: function (long, short) {
                return "A warehouse floor is a rectangle " + formatNumber(long) + " m long and "
                    + short + " m wide.";
            },
            question: "What is the area of the floor?"
        }
    ];

    function contextGuesses(question, kind) {
        const guesses = productGuesses(question);
        const seen = guesses.map(function (guess) { return guess.value; });
        seen.push(question.answer);
        const add = function (value, text) {
            if (!Number.isFinite(value) || value <= 0 || Math.round(value) !== value) return;
            if (seen.indexOf(value) !== -1) return;
            seen.push(value);
            guesses.push({ value: value, text: text });
        };
        if (kind === "area") {
            add(2 * (question.a + question.b), "That is the distance around the rectangle. An area is the two side lengths multiplied together.");
        } else {
            add(Math.abs(question.a - question.b), "That is the difference between the two numbers. Each item costs the same, so the amounts add up rather than cancel.");
        }
        return guesses;
    }

    /* ---------------------------------------------------------------- questions */

    function makeQuestion(stage, family, rng) {
        const question = { stage: stage, family: family, unitPrefix: "", unitSuffix: "" };

        if (family === "fluency-pair") {
            const b = twoDigitMultiplier(rng);
            let a = twoDigitFactor(rng, 3);
            let guard = 0;
            while (a <= b && guard < 12) { a = twoDigitFactor(rng, 3); guard += 1; }
            if (a <= b) a = b + 11;
            fillProduct(question, a, b);
            question.title = "Multiply the two numbers";
            question.prompt = "Work out the product.";
            question.display = inlineDisplay(a, b);
            question.mode = "single";
            question.answerLabel = "Your answer";
        } else if (family === "fluency-long" || family === "fluency-zero-digit") {
            const a = family === "fluency-zero-digit" ? zeroTensFactor(rng) : threeDigitFactor(rng);
            const b = twoDigitMultiplier(rng);
            fillProduct(question, a, b);
            question.title = "Multiply the two numbers";
            question.prompt = "Work out the product.";
            question.display = inlineDisplay(a, b);
            question.mode = "single";
            question.answerLabel = "Your answer";
        } else if (family === "fluency-rows") {
            const a = threeDigitFactor(rng);
            const b = twoDigitMultiplier(rng);
            fillProduct(question, a, b);
            fillRows(question, a, b);
            question.title = "Write each row, then their total";
            question.prompt = "Each digit of the lower number makes one row. Write those rows and add them.";
            question.display = factorDisplay(a, b);
        } else if (family === "three-rows") {
            const a = threeDigitFactor(rng, 4);
            const b = threeDigitMultiplier(rng);
            fillProduct(question, a, b);
            fillRows(question, a, b);
            question.title = "Write each row, then their total";
            question.prompt = "Each digit of the lower number makes one row. Write those rows and add them.";
            question.display = factorDisplay(a, b);
        } else if (family === "missing-second-row" || family === "missing-first-row") {
            const a = threeDigitFactor(rng);
            const b = twoDigitMultiplier(rng);
            const missingIndex = family === "missing-second-row" ? 1 : 0;
            fillMissingRow(question, a, b, missingIndex);
        } else if (family === "choose-third-row") {
            const a = threeDigitFactor(rng, 4);
            const b = threeDigitMultiplier(rng);
            fillChooseRow(question, a, b, rng);
        } else if (family === "cost-small" || family === "cost-large") {
            fillCost(question, family, rng);
        } else {
            fillArea(question, family, rng);
        }

        question.factKey = family + ":" + question.a + "x" + question.b;
        return question;
    }

    function fillProduct(question, a, b) {
        question.a = a;
        question.b = b;
        question.answer = a * b;
        question.answerShown = formatNumber(a * b);
        question.summaryLine = formatNumber(a) + " × " + formatNumber(b);
        question.printLine = "Calculation: " + question.summaryLine;
        question.hints = productHints(a, b);
        question.steps = productSteps(a, b);
        question.guesses = productGuesses(question);
        question.correctText = "Right: " + question.summaryLine + " = " + question.answerShown + ".";
        question.mode = "single";
        question.showExpression = true;
    }

    function fillRows(question, a, b) {
        const rows = rowsOf(a, b);
        question.mode = "rows";
        question.rowsLegend = "One row for each digit of the lower number, then their total";
        question.cells = rows.map(function (row, index) {
            return {
                label: "Row for the " + placeName(row.exponent) + " digit",
                expected: row.value,
                exponent: row.exponent,
                digit: row.digit,
                index: index
            };
        });
        question.cells.push({ label: "Total", expected: a * b, exponent: null, digit: null, index: rows.length });
        question.answerLabel = "Your rows";
        question.correctText = "Right: every row holds its place, and the total agrees with them. "
            + question.summaryLine + " = " + question.answerShown + ".";
    }

    function fillMissingRow(question, a, b, missingIndex) {
        const rows = rowsOf(a, b);
        const row = rows[missingIndex];
        question.a = a;
        question.b = b;
        question.answer = row.value;
        question.answerShown = formatNumber(row.value);
        question.summaryLine = formatNumber(a) + " × " + formatNumber(b);
        question.printLine = "Calculation: " + question.summaryLine + " — the " + ordinal(missingIndex)
            + " row is missing";
        question.mode = "single";
        question.showExpression = true;
        question.display = partialDisplay(a, b, missingIndex);
        question.title = "Complete the missing row";
        question.prompt = "One row of this calculation has not been written. Work out the line that belongs in the empty row.";
        question.answerLabel = "The missing row";
        question.hints = missingRowHints(a, b, missingIndex);
        question.steps = missingRowSteps(a, b, missingIndex);
        question.correctText = row.exponent === 0
            ? "Right: that row is " + formatNumber(a) + " × " + row.digit
                + ", and the ones digit needs no zero to hold its place."
            : "Right: that row is " + formatNumber(a) + " × " + row.digit + " with "
                + zeroWord(row.exponent) + " holding its place.";
        question.guesses = missingRowGuesses(question, a, b, missingIndex);
    }

    function missingRowGuesses(question, a, b, missingIndex) {
        const rows = rowsOf(a, b);
        const row = rows[missingIndex];
        const guesses = [];
        const seen = [question.answer];
        const add = function (value, text) {
            if (!Number.isFinite(value) || value <= 0 || Math.round(value) !== value) return;
            if (seen.indexOf(value) !== -1) return;
            seen.push(value);
            guesses.push({ value: value, text: text });
        };
        if (row.exponent > 0) {
            add(row.base, "Those are the right digits, but the row is not holding its place. The digit that makes it is worth "
                + formatNumber(row.digit * Math.pow(10, row.exponent)) + ", not " + row.digit + ".");
            add(row.base * Math.pow(10, row.exponent + 1), "One zero too many. That digit stands in the "
                + placeName(row.exponent) + " column.");
        } else {
            add(row.base * 10, "The ones digit of the lower number is worth just " + row.digit
                + ", so its row needs " + zeroWord(0) + ".");
        }
        rows.forEach(function (other, index) {
            if (index === missingIndex) return;
            add(other.value, "That line is already written as the " + ordinal(index)
                + " row. The empty row belongs to a different digit of " + formatNumber(b) + ".");
            add(other.base, "That comes from the " + placeName(other.exponent)
                + " digit, which already has its own row.");
        });
        add(earlyCarryValue(a, row.digit) * Math.pow(10, row.exponent), "A carried digit joins after the multiplication, not before it. Multiply the upper digit first, then add what was carried.");
        add(a * b, "That is the whole product. The empty line holds one row of it, not the finished answer.");
        add(rows.reduce(function (total, other, index) {
            return index === missingIndex ? total : total + other.value;
        }, 0), "That adds the rows already written. The empty line is a row of its own.");
        return guesses;
    }

    function fillChooseRow(question, a, b, rng) {
        const rows = rowsOf(a, b);
        const missingIndex = rows.length - 1;
        const row = rows[missingIndex];
        question.a = a;
        question.b = b;
        question.answer = row.value;
        question.answerShown = formatNumber(row.value);
        question.summaryLine = formatNumber(a) + " × " + formatNumber(b);
        question.printLine = "Calculation: " + question.summaryLine + " — the " + ordinal(missingIndex)
            + " row is missing";
        question.mode = "choice";
        question.showExpression = true;
        question.display = partialDisplay(a, b, missingIndex);
        question.title = "Choose the line that belongs in the empty row";
        question.prompt = "One row of this calculation has not been written. Only one of these lines belongs there.";
        question.choiceLegend = "Which line belongs in the empty row?";
        question.compactValues = true;
        question.answerLabel = "Your choice";

        const candidates = [
            {
                value: row.value,
                correct: true,
                text: "Right: that digit is worth " + formatNumber(row.digit * Math.pow(10, row.exponent))
                    + ", so its row ends in " + zeroWord(row.exponent) + "."
            },
            {
                value: row.base,
                correct: false,
                text: "Those are the right digits, but the row holds no place at all. The digit that makes it is not worth "
                    + row.digit + " on its own."
            },
            {
                value: row.base * 10,
                correct: false,
                text: "One zero short. Look again at which column that digit of " + formatNumber(b) + " stands in."
            },
            {
                value: rows[0].base * Math.pow(10, row.exponent),
                correct: false,
                text: "The zeros are right for this row, but those digits come from the ones digit of "
                    + formatNumber(b) + ", which already has its own row."
            }
        ];

        const order = shuffleIndexes(candidates.length, rng);
        question.options = order.map(function (index) { return formatNumber(candidates[index].value); });
        question.optionFeedback = order.map(function (index) { return candidates[index].text; });
        question.correctIndex = order.findIndex(function (index) { return candidates[index].correct; });
        question.correctText = candidates[0].text;
        question.hints = [
            "Every digit of " + formatNumber(b) + " makes one row, in order from its ones digit. "
                + "Which digit has not been used yet?",
            "It is the " + placeName(row.exponent) + " digit, " + row.digit
                + ". Count the zeros its column needs before comparing the digits."
        ];
        question.steps = missingRowSteps(a, b, missingIndex);
        question.guesses = [];
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

    function fillCost(question, family, rng) {
        const large = family === "cost-large";
        const template = pick(large ? COST_LARGE : COST_SMALL, rng);
        const price = nonZeroOnes(rng, template.priceMin, template.priceMax);
        const count = nonZeroOnes(rng, template.countMin, template.countMax);
        const a = Math.max(price, count);
        const b = Math.min(price, count);
        question.a = a;
        question.b = b;
        question.answer = price * count;
        question.answerShown = "£" + formatNumber(price * count);
        question.summaryLine = formatNumber(a) + " × " + formatNumber(b);
        question.printLine = template.story(price, count) + " " + template.question;
        question.contextId = template.id;
        question.mode = "single";
        question.showExpression = false;
        question.display = null;
        question.title = "Work out the total cost";
        question.prompt = template.story(price, count) + " " + template.question
            + " Give the total in whole pounds.";
        question.answerLabel = "Total cost";
        question.unitPrefix = "£";
        question.hints = [
            template.hint(price, count),
            "Set out " + formatNumber(a) + " × " + formatNumber(b)
                + " in columns: one row for each digit of the lower number, with its place-holder zeros written first."
        ];
        question.steps = productSteps(a, b,
            "Every item costs the same, so the total is " + formatNumber(count) + " lots of £"
                + price + ": " + question.summaryLine + ".",
            "The total cost is " + question.answerShown + ".");
        question.correctText = "Right: " + question.summaryLine + " = " + formatNumber(price * count)
            + ", so the total is " + question.answerShown + ".";
        question.guesses = contextGuesses(question, "cost");
        question.factKey = family + ":" + a + "x" + b;
    }

    function fillArea(question, family, rng) {
        const metres = family === "area-metres";
        const template = pick(metres ? AREA_METRES : AREA_CENTIMETRES, rng);
        const long = randomInt(rng, template.longMin, template.longMax);
        const short = nonZeroOnes(rng, template.shortMin, template.shortMax);
        const unit = metres ? "m" : "cm";
        question.a = long;
        question.b = short;
        question.answer = long * short;
        question.answerShown = formatNumber(long * short) + " " + unit + "²";
        question.summaryLine = formatNumber(long) + " × " + formatNumber(short);
        question.printLine = template.story(long, short) + " " + template.question;
        question.contextId = template.id;
        question.mode = "single";
        question.showExpression = false;
        question.display = null;
        question.title = "Work out the area";
        question.prompt = template.story(long, short) + " " + template.question
            + " Give the area in square " + (metres ? "metres" : "centimetres") + ".";
        question.answerLabel = "Area";
        question.unitSuffix = unit + "²";
        question.hints = [
            "Both measurements are already in " + (metres ? "metres" : "centimetres")
                + ", so the rectangle is " + formatNumber(short) + " rows of " + formatNumber(long)
                + " unit squares.",
            "Set out " + question.summaryLine
                + " in columns: one row for each digit of the lower number, with its place-holder zeros written first."
        ];
        question.steps = productSteps(long, short,
            "The area of a rectangle is its two side lengths multiplied together: " + question.summaryLine + ".",
            "The area is " + question.answerShown + ".");
        question.correctText = "Right: " + question.summaryLine + " = " + formatNumber(long * short)
            + ", and multiplying " + unit + " by " + unit + " gives " + unit + "².";
        question.guesses = contextGuesses(question, "area");
        question.factKey = family + ":" + long + "x" + short;
    }

    /* ---------------------------------------------------------------- rounds */

    function generateQuestion(stage, family, rng, excludedKey) {
        let question = makeQuestion(stage, family, rng);
        let guard = 0;
        while (excludedKey && question.factKey === excludedKey && guard < 16) {
            question = makeQuestion(stage, family, rng);
            guard += 1;
        }
        return question;
    }

    function buildRound(rng) {
        const round = [];
        const used = [];
        FAMILIES.forEach(function (families, stage) {
            families.forEach(function (family) {
                let question = makeQuestion(stage, family, rng);
                let guard = 0;
                while (used.indexOf(question.summaryLine) !== -1 && guard < 16) {
                    question = makeQuestion(stage, family, rng);
                    guard += 1;
                }
                used.push(question.summaryLine);
                round.push(question);
            });
        });
        return round;
    }

    function createSeededRandom(seed) {
        let state = (seed >>> 0) || 1;
        return function () {
            state ^= state << 13; state >>>= 0;
            state ^= state >> 17;
            state ^= state << 5; state >>>= 0;
            return state / 4294967296;
        };
    }

    /* ---------------------------------------------------------------- marking */

    function parseWholeNumber(raw, unitPrefix, unitSuffix) {
        let text = String(raw === undefined || raw === null ? "" : raw).trim();
        if (!text) return { state: "blank" };
        text = text.replace(/[−–—]/g, "-").replace(/\s+/g, "");
        if (unitPrefix) text = text.replace(/^[£$€]/, "");
        if (unitSuffix) text = text.replace(/(?:square|sq\.?)?(?:cm|m|centimetres?|metres?)(?:²|\^2|2)?$/i, "");
        text = text.replace(/\.$/, "");
        if (!text) return { state: "blank" };
        if (/^-/.test(text)) return { state: "unreadable", reason: "negative" };
        if (/^\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(text)) text = text.replace(/,/g, "");
        if (/^\d+\.\d+$/.test(text)) {
            if (/^\d+\.0+$/.test(text)) return { state: "ok", value: Number(text.split(".")[0]) };
            return { state: "unreadable", reason: "decimal" };
        }
        if (!/^\d+$/.test(text)) return { state: "unreadable", reason: "other" };
        return { state: "ok", value: Number(text) };
    }

    function evaluateChoice(question, answer) {
        const raw = String(answer === undefined || answer === null ? "" : answer).trim();
        if (!raw) {
            return { state: "blank", text: "Choose one of the lines, then check it." };
        }
        const index = Number(raw);
        if (!Number.isInteger(index) || index < 0 || index >= question.options.length) {
            return { state: "blank", text: "Choose one of the lines, then check it." };
        }
        if (index === question.correctIndex) {
            return { state: "correct", text: question.optionFeedback[index] };
        }
        return { state: "incorrect", text: question.optionFeedback[index] };
    }

    function evaluateRows(question, answer) {
        const cells = question.cells;
        const values = Array.isArray(answer) ? answer : [];
        const entered = cells.map(function (cell, index) {
            return String(values[index] === undefined ? "" : values[index]).trim();
        });
        const empty = [];
        entered.forEach(function (value, index) {
            if (!value) empty.push(cells[index].label.toLowerCase());
        });
        if (empty.length === cells.length) {
            return { state: "blank", text: "Nothing is filled in yet.", correctPositions: [] };
        }
        const numbers = entered.map(function (value) {
            return /^\d+$/.test(value.replace(/,/g, "")) ? Number(value.replace(/,/g, "")) : NaN;
        });
        const correctPositions = cells.map(function (cell, index) {
            if (!entered[index]) return undefined;
            return numbers[index] === cell.expected;
        });
        if (empty.length) {
            return {
                state: "incomplete",
                text: "Still to fill in: " + joinList(empty) + ".",
                correctPositions: correctPositions
            };
        }
        const unreadable = entered.some(function (value, index) { return Number.isNaN(numbers[index]); });
        if (unreadable) {
            return {
                state: "unreadable",
                text: "Each box takes a whole number written in digits.",
                correctPositions: correctPositions
            };
        }
        if (correctPositions.every(Boolean)) {
            return { state: "correct", text: question.correctText, correctPositions: correctPositions };
        }
        return {
            state: "incorrect",
            text: rowsFeedback(question, numbers, correctPositions),
            correctPositions: correctPositions
        };
    }

    function joinList(items) {
        if (items.length === 1) return items[0];
        return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
    }

    function rowsFeedback(question, numbers, correctPositions) {
        const cells = question.cells;
        const totalIndex = cells.length - 1;
        const rowIssue = correctPositions.findIndex(function (value, index) {
            return index !== totalIndex && value === false;
        });
        if (rowIssue !== -1) {
            const cell = cells[rowIssue];
            const given = numbers[rowIssue];
            const label = cell.label.toLowerCase();
            let note;
            if (given * 10 === cell.expected) {
                note = "The " + label + " is ten times too small: it needs a zero to hold the ones column before its digits are written.";
            } else if (given * 100 === cell.expected) {
                note = "The " + label + " is a hundred times too small: two zeros hold its place before its digits are written.";
            } else if (given === cell.expected * 10) {
                note = "The " + label + " has one zero too many for the column that digit stands in.";
            } else if (given === earlyCarryValue(question.a, cell.digit) * Math.pow(10, cell.exponent)) {
                note = "In the " + label + ", a carried digit was added before the multiplication. Multiply the upper digit first, then add what was carried.";
            } else if (given === question.a * question.b) {
                note = "The " + label + " holds one row, not the finished product.";
            } else {
                note = "Check the " + label + " again: it is " + formatNumber(question.a)
                    + " multiplied by one digit of " + formatNumber(question.b) + ", standing in that digit's column.";
            }
            const sum = numbers.slice(0, totalIndex).reduce(function (total, value) { return total + value; }, 0);
            if (numbers[totalIndex] === sum) {
                return note + " The total matches the rows you wrote, so correcting the row corrects it too.";
            }
            return note;
        }
        const sum = numbers.slice(0, totalIndex).reduce(function (total, value) { return total + value; }, 0);
        if (numbers[totalIndex] === sum) {
            return "Every row is right, and the total matches them. Check the addition once more against "
                + formatNumber(question.a) + " × " + formatNumber(question.b) + ".";
        }
        return "Every row is right. The total does not yet match them: add the rows in columns, one place value at a time.";
    }

    function evaluateResponse(question, raw) {
        if (question.mode === "choice") return evaluateChoice(question, raw);
        if (question.mode === "rows") return evaluateRows(question, raw);
        const parsed = parseWholeNumber(raw, question.unitPrefix, question.unitSuffix);
        if (parsed.state === "blank") {
            return { state: "blank", text: "There is no answer to check yet." };
        }
        if (parsed.state === "unreadable") {
            if (parsed.reason === "decimal") {
                return { state: "unreadable", text: "Both numbers are whole, so this answer is a whole number too." };
            }
            if (parsed.reason === "negative") {
                return { state: "unreadable", text: "Both numbers are positive, so the answer is positive as well." };
            }
            return { state: "unreadable", text: "Write the answer in digits, with no other symbols." };
        }
        if (parsed.value === question.answer) {
            return { state: "correct", text: question.correctText };
        }
        const match = (question.guesses || []).find(function (guess) { return guess.value === parsed.value; });
        if (match) return { state: "incorrect", text: match.text };
        return { state: "incorrect", text: genericMiss(question, parsed.value) };
    }

    function genericMiss(question, value) {
        const answerText = String(question.answer);
        const givenText = String(value);
        if (givenText.length === answerText.length && givenText[0] === answerText[0]) {
            return "The size is right, so one small product or the final column addition has slipped. Check each row against the digit that made it.";
        }
        if (givenText.length < answerText.length) {
            return "That is smaller than the product should be. Check that every digit of "
                + formatNumber(question.b) + " has a row, and that each row holds its place.";
        }
        return "That is larger than the product should be. Check how far left each row starts, and how many zeros hold it there.";
    }

    /* ---------------------------------------------------------------- checks */

    function validateQuestion(question) {
        const problems = [];
        const copy = [question.title, question.prompt, question.answerLabel || ""]
            .concat(question.hints || [])
            .concat(question.steps || [])
            .concat((question.guesses || []).map(function (guess) { return guess.text; }))
            .concat(question.options || [])
            .concat(question.optionFeedback || [])
            .concat([question.correctText, question.summaryLine, question.answerShown]);
        copy.forEach(function (text) {
            const value = String(text);
            if (/undefined|NaN|\[object/.test(value)) problems.push("Bad copy: " + value);
        });
        if (!Number.isInteger(question.answer) || question.answer <= 0) {
            problems.push("Answer is not a positive integer.");
        }
        if (question.mode === "choice") {
            if (question.correctIndex < 0 || question.correctIndex >= question.options.length) {
                problems.push("Choice has no correct option.");
            }
            if (new Set(question.options).size !== question.options.length) {
                problems.push("Duplicate option value.");
            }
            if (question.options[question.correctIndex] !== formatNumber(question.answer)) {
                problems.push("Correct option does not hold the answer.");
            }
        }
        if (question.mode === "rows") {
            const rowTotal = question.cells.slice(0, -1).reduce(function (total, cell) {
                return total + cell.expected;
            }, 0);
            if (rowTotal !== question.answer) problems.push("Rows do not add to the product.");
            if (question.cells[question.cells.length - 1].expected !== question.answer) {
                problems.push("Total cell does not hold the product.");
            }
        }
        (question.guesses || []).forEach(function (guess) {
            if (guess.value === question.answer) problems.push("A misconception value equals the answer.");
        });
        const values = (question.guesses || []).map(function (guess) { return guess.value; });
        if (new Set(values).size !== values.length) problems.push("Duplicate misconception value.");
        return problems;
    }

    function selfCheck(iterations) {
        const rounds = iterations || 200;
        const problems = [];
        for (let seed = 1; seed <= rounds; seed += 1) {
            const rng = createSeededRandom(seed * 2654435761);
            const round = buildRound(rng);
            if (round.length !== 12) problems.push("Round " + seed + " has " + round.length + " questions.");
            round.forEach(function (question, index) {
                const stage = Math.floor(index / 4);
                if (question.stage !== stage) problems.push("Question " + index + " has stage " + question.stage + ".");
                validateQuestion(question).forEach(function (problem) {
                    problems.push("Seed " + seed + " Q" + (index + 1) + " (" + question.family + "): " + problem);
                });
                if (question.mode === "single") {
                    const result = evaluateResponse(question, String(question.answer));
                    if (result.state !== "correct") {
                        problems.push("Seed " + seed + " Q" + (index + 1) + ": exact answer rejected.");
                    }
                }
                if (question.mode === "rows") {
                    const exact = question.cells.map(function (cell) { return String(cell.expected); });
                    if (evaluateResponse(question, exact).state !== "correct") {
                        problems.push("Seed " + seed + " Q" + (index + 1) + ": exact rows rejected.");
                    }
                }
                if (question.mode === "choice") {
                    if (evaluateResponse(question, String(question.correctIndex)).state !== "correct") {
                        problems.push("Seed " + seed + " Q" + (index + 1) + ": correct option rejected.");
                    }
                }
            });
            if (problems.length > 40) break;
        }
        return problems;
    }

    const api = {
        STAGES: STAGES,
        LESSON_URL: LESSON_URL,
        FAMILIES: FAMILIES,
        buildRound: buildRound,
        createSeededRandom: createSeededRandom,
        earlyCarryValue: earlyCarryValue,
        evaluateResponse: evaluateResponse,
        formatNumber: formatNumber,
        generateQuestion: generateQuestion,
        makeQuestion: makeQuestion,
        parseWholeNumber: parseWholeNumber,
        rowsOf: rowsOf,
        selfCheck: selfCheck,
        validateQuestion: validateQuestion
    };

    scope.LongMultiplicationPractice = api;
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
        if (question.mode === "rows") return question.cells.map(function () { return ""; });
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
        if (question.mode === "rows") {
            return "Your answer: " + question.cells.map(function (cell, index) {
                return cell.label + " " + (String(answer[index] || "").trim() || "—");
            }).join("; ");
        }
        return "Your answer: " + question.unitPrefix + String(answer).trim()
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
        const singleWrap = root.querySelector("[data-single-answer]");
        const answerLabel = root.querySelector("[data-answer-label]");
        const input = root.querySelector("[data-answer-input]");
        const answerEntry = root.querySelector("[data-answer-entry]");
        const unitPrefix = root.querySelector("[data-unit-prefix]");
        const unitSuffix = root.querySelector("[data-unit-suffix]");
        const choiceField = root.querySelector("[data-choice-answer]");
        const choiceLegend = root.querySelector("[data-choice-legend]");
        const choiceOptions = root.querySelector("[data-choice-options]");
        const rowsField = root.querySelector("[data-rows-answer]");
        const rowsLegend = root.querySelector("[data-rows-legend]");
        const rowsList = root.querySelector("[data-rows-list]");
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
                const id = "mult-choice-" + current + "-" + index;
                const label = element("label", "practice-choice__option");
                if (currentQuestion.compactValues) label.classList.add("is-value-choice");
                const radio = element("input");
                radio.type = "radio";
                radio.name = "mult-choice-" + current;
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

        function applyRowStates() {
            const currentState = state();
            Array.from(rowsList.querySelectorAll(".practice-rows__cell")).forEach(function (cell, index) {
                const field = cell.querySelector("input");
                const verdict = currentState.correctPositions[index];
                cell.classList.toggle("is-correct", verdict === true);
                cell.classList.toggle("is-wrong", verdict === false);
                if (verdict === false) field.setAttribute("aria-invalid", "true");
                else field.removeAttribute("aria-invalid");
            });
        }

        function renderRows(currentQuestion, currentState) {
            rowsLegend.textContent = currentQuestion.rowsLegend;
            rowsList.replaceChildren();
            currentQuestion.cells.forEach(function (cell, index) {
                const id = "mult-row-" + current + "-" + index;
                const wrap = element("label", "practice-rows__cell");
                if (index === currentQuestion.cells.length - 1) wrap.classList.add("is-total");
                wrap.htmlFor = id;
                wrap.appendChild(element("span", "practice-rows__label", cell.label));
                const field = element("input");
                field.type = "text";
                field.id = id;
                field.inputMode = "numeric";
                field.maxLength = 9;
                field.autocomplete = "off";
                field.spellcheck = false;
                field.value = currentState.answer[index] || "";
                field.setAttribute("aria-describedby", "practice-feedback practice-hint");
                wrap.appendChild(field);
                field.addEventListener("input", function () {
                    const cleaned = field.value.replace(/[^0-9]/g, "").slice(0, 9);
                    if (cleaned !== field.value) field.value = cleaned;
                    currentState.answer[index] = cleaned;
                    currentState.correctPositions[index] = undefined;
                    clearOutcomeForEdit(true);
                    applyRowStates();
                });
                field.addEventListener("keydown", handleEnter);
                rowsList.appendChild(wrap);
            });
            applyRowStates();
        }

        function renderExpression(currentQuestion) {
            const display = currentQuestion.display;
            expression.replaceChildren();
            expression.className = "practice-question__expression";
            expression.style.removeProperty("--mult-cols");
            expression.hidden = !display;
            if (!display) {
                expression.removeAttribute("role");
                expression.removeAttribute("aria-label");
                return;
            }
            expression.setAttribute("role", "img");
            expression.setAttribute("aria-label", display.ariaLabel);
            if (display.kind === "inline") {
                expression.classList.add("practice-mult--inline");
                expression.textContent = display.text;
                return;
            }
            expression.classList.add("practice-mult");
            expression.style.setProperty("--mult-cols", String(display.width));
            display.lines.forEach(function (line) {
                if (line.type === "rule") {
                    expression.appendChild(element("div", "practice-mult__rule"));
                    return;
                }
                const row = element("div", "practice-mult__row");
                row.appendChild(element("span", "practice-mult__op", line.sign));
                if (line.type === "box") {
                    const box = element("span", "practice-mult__box");
                    box.setAttribute("aria-hidden", "true");
                    row.appendChild(box);
                } else {
                    line.digits.forEach(function (digit) {
                        row.appendChild(element("span", "practice-mult__cell", digit === null ? "" : String(digit)));
                    });
                }
                expression.appendChild(row);
            });
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
            prompt.textContent = currentQuestion.prompt;
            renderExpression(currentQuestion);
            answerLabel.textContent = currentQuestion.answerLabel;

            singleWrap.hidden = currentQuestion.mode !== "single";
            choiceField.hidden = currentQuestion.mode !== "choice";
            rowsField.hidden = currentQuestion.mode !== "rows";
            if (currentQuestion.mode === "single") {
                input.value = currentState.answer;
                if (currentQuestion.showExpression) {
                    input.setAttribute("aria-label", currentQuestion.answerLabel + " for " + currentQuestion.summaryLine);
                } else {
                    input.removeAttribute("aria-label");
                }
                unitPrefix.textContent = currentQuestion.unitPrefix;
                unitPrefix.hidden = !currentQuestion.unitPrefix;
                unitSuffix.textContent = currentQuestion.unitSuffix;
                unitSuffix.hidden = !currentQuestion.unitSuffix;
                answerEntry.classList.toggle("has-prefix", Boolean(currentQuestion.unitPrefix));
                answerEntry.classList.toggle("has-suffix", Boolean(currentQuestion.unitSuffix));
            } else if (currentQuestion.mode === "choice") {
                renderChoice(currentQuestion, currentState);
            } else {
                renderRows(currentQuestion, currentState);
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
            return Array.from(rowsList.querySelectorAll("input")).map(function (field) { return field.value; });
        }

        function checkAnswer() {
            const currentState = state();
            currentState.answer = readAnswer();
            const result = evaluateResponse(question(), currentState.answer);
            currentState.replaceConfirm = false;
            currentState.correctPositions = result.correctPositions || [];
            if (question().mode === "rows") applyRowStates();

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
                : "[data-rows-list] input");
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
                    entry.appendChild(element("p", "", item.printLine));
                    entry.appendChild(element("p", "", item.prompt));
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
            reflectionStages.replaceChildren.apply(reflectionStages, STAGES.map(function (stage, stageIndex) {
                const stageStates = states.slice(stageIndex * 4, stageIndex * 4 + 4);
                const revisit = stageStates.filter(function (item) { return !item.outcome; }).length;
                const row = element("li");
                row.appendChild(element("b", "", stage.name));
                const link = element("a", "", revisit
                    ? revisit + " to revisit · open this section of the lesson"
                    : "Open this section of the lesson");
                link.href = LESSON_URL + "#" + stage.lessonAnchor;
                row.appendChild(link);
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
