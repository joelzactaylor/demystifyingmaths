/* Practice: written methods review.
   A mixed round drawing on column addition and subtraction, exchanging across
   zeros, long multiplication and multiplying decimals. Every value is held as a
   whole number of thousandths so no answer is a floating-point approximation.
   The generator half runs without a document so it can be fuzzed from Node. */
(function (scope) {
    "use strict";

    const LESSONS = {
        addition: { label: "Column addition", url: "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/columnAddition.html" },
        subtraction: { label: "Column subtraction", url: "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/columnSubtraction.html" },
        zeros: { label: "Exchanging across zeros", url: "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/exchangingAcrossZeros.html" },
        multiplication: { label: "Long multiplication", url: "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/longMultiplication.html" },
        decimals: { label: "Multiplying decimals", url: "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/multiplyingDecimals.html" }
    };

    const STAGES = [
        { name: "Adding and subtracting in columns", lessons: [LESSONS.addition, LESSONS.subtraction, LESSONS.zeros] },
        { name: "Multiplying decimals", lessons: [LESSONS.multiplication, LESSONS.decimals] },
        { name: "Money and measures", lessons: [LESSONS.addition, LESSONS.subtraction, LESSONS.decimals] }
    ];

    /* The round ends on a subtraction from a whole number, where the columns
       have to be padded before anything can be taken away. */
    const FAMILIES = [
        { names: ["add-decimals", "add-three", "subtract-decimals", "subtract-across-zeros"], fixedLast: false },
        { names: ["multiply-decimals", "multiply-below-one", "place-the-point", "multiply-estimate"], fixedLast: false },
        { names: ["money-total", "measure-difference", "money-repeated", "unpadded-subtraction"], fixedLast: true }
    ];

    const SCALE = 1000;

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

    function groupWhole(text) {
        return String(text).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    /* A value held in thousandths, written back out with no trailing zeros. */
    function fromScaled(scaled) {
        const negative = scaled < 0;
        const size = Math.abs(Math.round(scaled));
        const whole = Math.floor(size / SCALE);
        const fraction = String(size % SCALE).padStart(3, "0").replace(/0+$/, "");
        return (negative ? "−" : "") + groupWhole(whole) + (fraction ? "." + fraction : "");
    }

    function plainScaled(scaled) {
        return fromScaled(scaled).replace(/,/g, "").replace("−", "-");
    }

    function money(scaled) {
        const size = Math.abs(Math.round(scaled));
        return groupWhole(Math.floor(size / SCALE)) + "." + String(Math.round(size % SCALE / 10)).padStart(2, "0");
    }

    function toScaled(text) {
        const pieces = String(text).split(".");
        return Number(pieces[0]) * SCALE + Number((pieces[1] || "").padEnd(3, "0"));
    }

    function decimalPlaces(text) {
        const pieces = String(text).split(".");
        return pieces[1] ? pieces[1].length : 0;
    }

    /* Build a decimal with a chosen number of places and no trailing zero. */
    function randomDecimal(rng, wholeDigits, places) {
        return drawValid(function () {
            let whole = String(randomInt(rng, 1, 9));
            for (let index = 1; index < wholeDigits; index += 1) whole += String(randomInt(rng, 0, 9));
            let fraction = "";
            for (let index = 0; index < places; index += 1) fraction += String(randomInt(rng, 0, 9));
            return places ? whole + "." + fraction : whole;
        }, function (candidate) {
            return !places || candidate.charAt(candidate.length - 1) !== "0";
        }, wholeDigits > 1 ? "12.365" : "4.7");
    }

    /* The classic column error: writing the two numbers flush at their right
       ends instead of lining up the points. */
    function rightAlignedScaled(leftText, rightText, add) {
        /* Returns null when the slip cannot happen, or would give a value that
           makes no sense to offer back as a near miss. */
        const gap = Math.abs(decimalPlaces(leftText) - decimalPlaces(rightText));
        if (!gap) return null;
        const shorter = decimalPlaces(leftText) < decimalPlaces(rightText) ? leftText : rightText;
        const longer = shorter === leftText ? rightText : leftText;
        const shifted = Math.round(toScaled(shorter) / Math.pow(10, gap));
        if (add) return toScaled(longer) + shifted;
        const slipped = toScaled(leftText) === toScaled(longer)
            ? toScaled(longer) - shifted
            : shifted - toScaled(longer);
        return slipped > 0 ? slipped : null;
    }

    /* The other classic: taking the smaller digit from the larger in every
       column, so no exchange is ever paid for. */
    function noExchangeScaled(topText, bottomText) {
        const places = Math.max(decimalPlaces(topText), decimalPlaces(bottomText));
        const width = Math.max(String(Math.floor(Number(topText))).length, String(Math.floor(Number(bottomText))).length) + places;
        const top = String(Math.round(Number(topText) * Math.pow(10, places))).padStart(width, "0");
        const bottom = String(Math.round(Number(bottomText) * Math.pow(10, places))).padStart(width, "0");
        let digits = "";
        for (let index = 0; index < width; index += 1) {
            digits += String(Math.abs(Number(top.charAt(index)) - Number(bottom.charAt(index))));
        }
        return Math.round(Number(digits) * Math.pow(10, 3 - places));
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

    /* The numbers as they were written, split at the point so the display can
       align them the way they have to be aligned on paper. The reader still has
       to decide how to pad them. */
    function columnParts(text) {
        const pieces = String(text).split(".");
        return { whole: pieces[0], fraction: pieces[1] ? "." + pieces[1] : "" };
    }

    function columnDisplay(values, sign, ariaLabel) {
        return {
            kind: "column",
            rows: values.map(function (value, index) {
                return { sign: index === values.length - 1 ? sign : "", parts: columnParts(value) };
            }),
            ariaLabel: ariaLabel
        };
    }

    function setSingle(question, scaled, label) {
        question.mode = "single";
        question.answerKind = "decimal";
        question.answerLabel = label;
        question.expected = scaled / SCALE;
        question.expectedText = plainScaled(scaled);
        question.answerShown = fromScaled(scaled);
    }

    /* Stage 1 -------------------------------------------------------- */

    function additionQuestion(question, rng, terms) {
        const draw = drawValid(function () {
            const values = [];
            for (let index = 0; index < terms; index += 1) {
                values.push(randomDecimal(rng, randomInt(rng, 1, 2), randomInt(rng, 1, 3)));
            }
            return values;
        }, function (candidate) {
            const places = candidate.map(decimalPlaces);
            return new Set(places).size > 1;
        }, terms === 2 ? ["4.7", "12.365"] : ["3.4", "0.85", "12.078"]);

        const total = draw.reduce(function (sum, value) { return sum + toScaled(value); }, 0);
        const places = Math.max.apply(null, draw.map(decimalPlaces));
        question.factKey = draw.join("+");
        question.title = terms === 2 ? "Add two decimals" : "Add three decimals";
        question.prompt = "Add these numbers in columns. Give the exact answer.";
        question.display = columnDisplay(draw, "+", draw.join(" plus ") + ", to be set out in columns");
        setSingle(question, total, "Total");
        question.correctNote = "Correct — the points line up and the columns add to " + fromScaled(total) + ".";
        question.summaryLine = draw.join(" + ");
        question.printLine = draw.join(" + ");
        const slipped = terms === 2 ? rightAlignedScaled(draw[0], draw[1], true) : null;
        question.misses = [];
        if (slipped !== null) {
            question.misses.push({
                value: slipped / SCALE,
                text: "The two numbers have been lined up at their right-hand ends rather than at the decimal points. Pad the shorter one with zeros so that tenths sit under tenths."
            });
        }
        /* A carry that was worked out but never written into the next column
           costs exactly one unit of whichever column it belonged in. */
        [1, 10, 100, 1000].forEach(function (unit) {
            question.misses.push({
                value: (total - unit) / SCALE,
                text: "That is short by exactly one unit of a single column, which is what a carry left unwritten costs. Check each column that reached ten and make sure its ten went into the column on its left."
            });
        });
        if (terms === 2) {
            question.misses.push({
                value: Math.abs(toScaled(draw[0]) - toScaled(draw[1])) / SCALE,
                text: "That is the difference between the two numbers. This question asks for their total."
            });
        }
        if (terms === 3) {
            question.misses.push({
                value: (total - toScaled(draw[2])) / SCALE,
                text: "That is the total of the first two numbers only. All three have to be added, so add the third into the same columns."
            });
            question.misses.push({
                value: (total - toScaled(draw[0])) / SCALE,
                text: "One of the three numbers has been left out. Write all three above the line before adding."
            });
        }
        question.hints = [
            "Write the numbers with the decimal points in a vertical line, padding the shorter ones with zeros so every column is full.",
            "Written with " + places + " decimal place" + (places === 1 ? "" : "s") + " each, they are " + draw.map(function (value) {
                return Number(value).toFixed(places);
            }).join(" + ") + "."
        ];
        question.steps = [
            "Line the decimal points up and pad every number to " + places + " decimal place" + (places === 1 ? "" : "s") + ": "
                + draw.map(function (value) { return Number(value).toFixed(places); }).join(" + ") + ".",
            "Add from the right-hand column, carrying into the next column whenever a column reaches ten.",
            "The point in the answer sits under the points above it.",
            "Total: " + fromScaled(total) + "."
        ];
        return question;
    }

    function fillAddDecimals(question, rng) { return additionQuestion(question, rng, 2); }
    function fillAddThree(question, rng) { return additionQuestion(question, rng, 3); }

    function subtractionQuestion(question, rng, acrossZeros) {
        const draw = drawValid(function () {
            /* Across zeros: the top stops at tenths, so padding it fills the
               hundredths and thousandths with the zeros the exchange must
               travel through. */
            const top = acrossZeros
                ? randomDecimal(rng, randomInt(rng, 1, 2), 1)
                : randomDecimal(rng, randomInt(rng, 1, 2), randomInt(rng, 1, 2));
            const bottom = randomDecimal(rng, 1, acrossZeros ? 3 : randomInt(rng, 1, 3));
            return { top: top, bottom: bottom };
        }, function (candidate) {
            if (toScaled(candidate.top) - toScaled(candidate.bottom) <= 0) return false;
            if (decimalPlaces(candidate.top) >= decimalPlaces(candidate.bottom)) return false;
            if (acrossZeros && (toScaled(candidate.bottom) % 100 === 0)) return false;
            return true;
        }, acrossZeros ? { top: "8.4", bottom: "1.276" } : { top: "12.4", bottom: "3.65" });

        const difference = toScaled(draw.top) - toScaled(draw.bottom);
        const places = Math.max(decimalPlaces(draw.top), decimalPlaces(draw.bottom));
        question.factKey = draw.top + "-" + draw.bottom;
        question.title = "Subtract two decimals";
        question.prompt = "Subtract in columns. Give the exact answer.";
        question.display = columnDisplay([draw.top, draw.bottom], "−",
            draw.top + " minus " + draw.bottom + ", to be set out in columns");
        setSingle(question, difference, "Difference");
        question.correctNote = "Correct — " + fromScaled(difference) + " + " + draw.bottom + " = " + draw.top + ".";
        question.summaryLine = draw.top + " − " + draw.bottom;
        question.printLine = draw.top + " − " + draw.bottom;
        const rightAligned = rightAlignedScaled(draw.top, draw.bottom, false);
        question.misses = [
            { value: noExchangeScaled(draw.top, draw.bottom) / SCALE,
              text: "Each column has been worked out by taking the smaller digit from the larger. When the top digit is too small, exchange from the column to its left instead." }
        ];
        if (rightAligned !== null) {
            question.misses.push({
                value: rightAligned / SCALE,
                text: "The two numbers have been lined up at their right-hand ends. Pad " + draw.top + " to " + Number(draw.top).toFixed(places) + " so that the points line up."
            });
        }
        [1, 10, 100, 1000].forEach(function (unit) {
            question.misses.push({
                value: (difference + unit) / SCALE,
                text: "That is larger by exactly one unit of a single column, which is what an exchange costs when it is taken but never paid for. The column that gave the ten must go down by one."
            });
        });
        question.misses.push({
            value: (toScaled(draw.top) + toScaled(draw.bottom)) / SCALE,
            text: "That is the total of the two numbers. This question asks for the difference, so the bottom line is taken away from the top one."
        });
        question.hints = [
            "Pad the top number with zeros so it has as many decimal places as the bottom one, then work from the right.",
            acrossZeros
                ? "There is a zero in the way: send the exchange further left until a column can give, and write 9 in each column it passes."
                : "Written to " + places + " decimal places this is " + Number(draw.top).toFixed(places) + " − " + Number(draw.bottom).toFixed(places) + "."
        ];
        question.steps = [
            "Pad to " + places + " decimal places so every column is full: " + Number(draw.top).toFixed(places) + " − " + Number(draw.bottom).toFixed(places) + ".",
            acrossZeros
                ? "The column needed for the exchange holds 0, so the request travels further left; each zero it passes becomes 9."
                : "Work from the right-hand column, exchanging from the column to the left whenever the top digit is too small.",
            "The value of the top line is unchanged by an exchange; only how it is written changes.",
            "Check by adding back: " + fromScaled(difference) + " + " + draw.bottom + " = " + draw.top + ".",
            "Difference: " + fromScaled(difference) + "."
        ];
        return question;
    }

    function fillSubtractDecimals(question, rng) { return subtractionQuestion(question, rng, false); }
    function fillSubtractAcrossZeros(question, rng) { return subtractionQuestion(question, rng, true); }

    /* Stage 2 -------------------------------------------------------- */

    function multiplyDraw(rng, settings) {
        return drawValid(function () {
            return {
                left: randomDecimal(rng, settings.leftWhole, settings.leftPlaces),
                right: randomDecimal(rng, settings.rightWhole, settings.rightPlaces)
            };
        }, function (candidate) {
            const places = decimalPlaces(candidate.left) + decimalPlaces(candidate.right);
            if (places < 2 || places > 3) return false;
            return settings.accept ? settings.accept(candidate) : true;
        }, settings.fallback);
    }

    function multiplySolution(left, right) {
        const places = decimalPlaces(left) + decimalPlaces(right);
        const leftInteger = Math.round(Number(left) * Math.pow(10, decimalPlaces(left)));
        const rightInteger = Math.round(Number(right) * Math.pow(10, decimalPlaces(right)));
        const product = leftInteger * rightInteger;
        return {
            places: places,
            leftInteger: leftInteger,
            rightInteger: rightInteger,
            product: product,
            scaled: Math.round(product * Math.pow(10, 3 - places))
        };
    }

    function estimateText(left, right) {
        const roundLeft = Math.round(Number(left));
        const roundRight = Math.round(Number(right)) || 1;
        return groupWhole(roundLeft) + " × " + groupWhole(roundRight) + " = " + groupWhole(roundLeft * roundRight);
    }

    function finishMultiply(question, draw, title, prompt) {
        const work = multiplySolution(draw.left, draw.right);
        question.factKey = draw.left + "×" + draw.right;
        question.title = title;
        question.prompt = prompt;
        question.display = inline(draw.left + " × " + draw.right, draw.left + " multiplied by " + draw.right);
        setSingle(question, work.scaled, "Product");
        question.correctNote = "Correct — " + groupWhole(work.leftInteger) + " × " + groupWhole(work.rightInteger) + " = "
            + groupWhole(work.product) + ", and " + work.places + " decimal places go back in.";
        question.summaryLine = draw.left + " × " + draw.right;
        question.printLine = draw.left + " × " + draw.right;
        question.misses = [
            { value: work.product, text: "That is the product of the two whole numbers. The factors carry " + work.places + " decimal places between them, so the point still has to go back in." },
            { value: Number(plainScaled(work.scaled * 10)), text: "The digits are right but the point is one place out. Count the decimal places in both factors: " + decimalPlaces(draw.left) + " and " + decimalPlaces(draw.right) + ", so the answer has " + work.places + "." },
            { value: Number(plainScaled(work.scaled)) / 10, text: "The digits are right but the point is one place out the other way. The answer has " + work.places + " decimal places, one for each place in the factors." }
        ];
        question.hints = [
            "Multiply as whole numbers first, then count how many decimal places the two factors carry between them.",
            "An estimate keeps the point honest: " + estimateText(draw.left, draw.right) + "."
        ];
        question.steps = [
            "Take the points out and multiply the whole numbers: " + groupWhole(work.leftInteger) + " × " + groupWhole(work.rightInteger) + " = " + groupWhole(work.product) + ".",
            "The factors carry " + decimalPlaces(draw.left) + " and " + decimalPlaces(draw.right) + " decimal places, so the answer carries " + work.places + ".",
            "Putting " + work.places + " decimal places back into " + groupWhole(work.product) + " gives " + fromScaled(work.scaled) + ".",
            "Check against an estimate: " + estimateText(draw.left, draw.right) + ", so an answer near that is right.",
            "Product: " + fromScaled(work.scaled) + "."
        ];
        return question;
    }

    function fillMultiplyDecimals(question, rng) {
        const draw = multiplyDraw(rng, {
            leftWhole: 2, leftPlaces: 1, rightWhole: 1, rightPlaces: 1,
            fallback: { left: "12.4", right: "3.5" }
        });
        return finishMultiply(question, draw, "Multiply two decimals",
            "Work out this product exactly. Multiply as whole numbers first, then place the point.");
    }

    function fillMultiplyBelowOne(question, rng) {
        /* A factor below 1 makes the product smaller than the other factor,
           which is where the point is most often misplaced. */
        const draw = {
            left: "0." + randomInt(rng, 2, 9),
            right: drawValid(function () {
                return "0." + randomInt(rng, 10, 99);
            }, function (candidate) {
                return candidate.charAt(candidate.length - 1) !== "0";
            }, "0.45")
        };
        return finishMultiply(question, draw, "Multiply by a value below 1",
            "Work out this product exactly. Multiply as whole numbers first, then place the point.");
    }

    function fillPlaceThePoint(question, rng) {
        const draw = multiplyDraw(rng, {
            leftWhole: 1, leftPlaces: 1, rightWhole: 2, rightPlaces: 2,
            fallback: { left: "4.7", right: "32.5" }
        });
        const work = multiplySolution(draw.left, draw.right);
        const values = [0, 1, -1, 2].map(function (offset) {
            return Math.round(work.product * Math.pow(10, 3 - work.places + offset));
        });
        const notes = [
            "Correct — the factors carry " + work.places + " decimal places between them, so the answer does too.",
            "That has one decimal place too few, which makes the answer ten times too large. Compare it with the estimate " + estimateText(draw.left, draw.right) + ".",
            "That has one decimal place too many, which makes the answer ten times too small. Compare it with the estimate " + estimateText(draw.left, draw.right) + ".",
            "That has two decimal places too few. Count the places in each factor and add them: " + decimalPlaces(draw.left) + " + " + decimalPlaces(draw.right) + " = " + work.places + "."
        ];
        const order = shuffleIndexes(4, rng);
        question.factKey = draw.left + "×" + draw.right + "/point";
        question.contextKey = "plain";
        question.title = "Placing the point";
        question.prompt = "Use the whole-number product above to choose the value of " + draw.left + " × " + draw.right + ".";
        question.givenLabel = "You are told";
        question.given = groupWhole(work.leftInteger) + " × " + groupWhole(work.rightInteger) + " = " + groupWhole(work.product);
        question.mode = "choice";
        question.compactValues = true;
        question.choiceLegend = "The value of " + draw.left + " × " + draw.right;
        question.options = order.map(function (index) { return fromScaled(values[index]); });
        question.optionNotes = order.map(function (index) { return notes[index]; });
        question.correctIndex = order.indexOf(0);
        question.answerShown = fromScaled(values[0]);
        question.answerLabel = "Your choice";
        question.summaryLine = draw.left + " × " + draw.right + ", from " + groupWhole(work.leftInteger) + " × " + groupWhole(work.rightInteger);
        question.printLine = groupWhole(work.leftInteger) + " × " + groupWhole(work.rightInteger) + " = " + groupWhole(work.product) + ". What is " + draw.left + " × " + draw.right + "?";
        question.hints = [
            "The digits of the product do not change. Only the position of the point does.",
            "Count the decimal places in each factor and add them: " + decimalPlaces(draw.left) + " + " + decimalPlaces(draw.right) + " = " + work.places + "."
        ];
        question.steps = [
            "The digits come straight from " + groupWhole(work.leftInteger) + " × " + groupWhole(work.rightInteger) + " = " + groupWhole(work.product) + ".",
            draw.left + " has " + decimalPlaces(draw.left) + " decimal place" + (decimalPlaces(draw.left) === 1 ? "" : "s") + " and "
                + draw.right + " has " + decimalPlaces(draw.right) + ", so the answer has " + work.places + ".",
            "Check against an estimate: " + estimateText(draw.left, draw.right) + ".",
            "So " + draw.left + " × " + draw.right + " = " + fromScaled(values[0]) + "."
        ];
        return question;
    }

    function fillMultiplyEstimate(question, rng) {
        const draw = multiplyDraw(rng, {
            leftWhole: 2, leftPlaces: 2, rightWhole: 1, rightPlaces: 1,
            fallback: { left: "24.75", right: "6.4" }
        });
        const built = finishMultiply(question, draw, "Multiply two decimals",
            "Work out this product exactly, then check it against an estimate.");
        built.hints[0] = "Round each factor to the nearest whole number first and multiply those, so you know roughly where the answer should sit.";
        return built;
    }

    /* Stage 3 -------------------------------------------------------- */

    function fillMoneyTotal(question, rng) {
        const items = [
            { name: "a notebook", price: randomInt(rng, 145, 895) },
            { name: "a pen", price: randomInt(rng, 85, 445) },
            { name: "a folder", price: randomInt(rng, 205, 1295) }
        ];
        const chosen = [items[0], items[1], items[2]];
        const total = chosen.reduce(function (sum, item) { return sum + item.price * 10; }, 0);
        const listed = chosen.map(function (item) { return item.name + " at £" + money(item.price * 10); });
        question.factKey = "money-total/" + chosen.map(function (item) { return item.price; }).join("+");
        question.contextKey = "money";
        question.title = "A total in pounds";
        question.prompt = "A shopper buys " + listed.slice(0, -1).join(", ") + " and " + listed[listed.length - 1]
            + ". Work out the total, in pounds to two decimal places.";
        setSingle(question, total, "Total in pounds");
        question.unitPrefix = "£";
        question.expectedText = money(total);
        question.answerShown = "£" + money(total);
        question.correctNote = "Correct — the three prices add to £" + money(total) + ".";
        question.summaryLine = chosen.map(function (item) { return "£" + money(item.price * 10); }).join(" + ");
        question.printLine = "Total of " + chosen.map(function (item) { return "£" + money(item.price * 10); }).join(", ") + " in pounds.";
        question.misses = [
            { value: Math.round(total / 10), text: "That is the total in pence. The question asks for pounds, so there are two decimal places." },
            { value: Number(plainScaled(total)) / 100, text: "That answer is a hundred times too small. Money in pounds keeps two decimal places, not four." }
        ];
        question.hints = [
            "Write every price with two decimal places and line the points up before adding.",
            "The three amounts are " + chosen.map(function (item) { return money(item.price * 10); }).join(" + ") + "."
        ];
        question.steps = [
            "Write each price in pounds with two decimal places and line up the points: " + chosen.map(function (item) { return money(item.price * 10); }).join(" + ") + ".",
            "Add from the right, carrying whenever a column reaches ten.",
            "Money in pounds is written with exactly two decimal places.",
            "Total: £" + money(total) + "."
        ];
        return question;
    }

    function fillMeasureDifference(question, rng) {
        const context = pick([
            { key: "plank", unit: "metres", noun: "A plank", verb: "is cut from", start: "a length" },
            { key: "rope", unit: "metres", noun: "A rope", verb: "is cut from", start: "a coil" }
        ], rng);
        const total = randomInt(rng, 4000, 19000);
        const used = randomInt(rng, 1005, total - 500);
        const left = total - used;
        question.factKey = "measure/" + total + "-" + used;
        question.contextKey = "measure";
        question.title = "A difference in metres";
        question.prompt = context.noun + " " + fromScaled(used) + " m long is cut from " + context.start + " measuring "
            + fromScaled(total) + " m. Work out the length left, in metres.";
        setSingle(question, left, "Length left in metres");
        question.unitSuffix = "m";
        question.answerShown = fromScaled(left) + " m";
        question.correctNote = "Correct — " + fromScaled(left) + " + " + fromScaled(used) + " = " + fromScaled(total) + ".";
        question.summaryLine = fromScaled(total) + " m − " + fromScaled(used) + " m";
        question.printLine = fromScaled(total) + " m − " + fromScaled(used) + " m, in metres.";
        question.misses = [
            { value: (total + used) / SCALE, text: "That adds the two lengths. The piece cut off is taken away from the original length." },
            { value: noExchangeScaled(plainScaled(total), plainScaled(used)) / SCALE,
              text: "Each column has been worked out by taking the smaller digit from the larger. Exchange from the column to the left instead." }
        ];
        question.hints = [
            "Pad both lengths to the same number of decimal places, line up the points and subtract.",
            "The calculation is " + fromScaled(total) + " − " + fromScaled(used) + "."
        ];
        question.steps = [
            "The length left is " + fromScaled(total) + " − " + fromScaled(used) + ".",
            "Pad both to three decimal places so every column is full, and line up the points.",
            "Subtract from the right, exchanging from the column to the left where the top digit is too small.",
            "Check by adding back: " + fromScaled(left) + " + " + fromScaled(used) + " = " + fromScaled(total) + ".",
            "Length left: " + fromScaled(left) + " m."
        ];
        return question;
    }

    function fillMoneyRepeated(question, rng) {
        const count = randomInt(rng, 3, 9);
        const price = randomInt(rng, 115, 1885);
        const total = price * 10 * count;
        question.factKey = "repeat/" + count + "×" + price;
        question.contextKey = "money";
        question.title = "A repeated price";
        question.prompt = "A ticket costs £" + money(price * 10) + ". Work out the cost of " + count
            + " tickets, in pounds to two decimal places.";
        setSingle(question, total, "Cost in pounds");
        question.unitPrefix = "£";
        question.expectedText = money(total);
        question.answerShown = "£" + money(total);
        question.correctNote = "Correct — " + count + " × " + money(price * 10) + " = " + money(total) + ".";
        question.summaryLine = count + " × £" + money(price * 10);
        question.printLine = count + " tickets at £" + money(price * 10) + " each, in pounds.";
        question.misses = [
            { value: price * count, text: "That is the cost in pence. The question asks for pounds, so divide by 100 or place the point two from the right." },
            { value: Number(plainScaled(total * 10)), text: "The digits are right but the point is one place out. £" + money(price * 10) + " has two decimal places, so the total does too." },
            { value: Number(plainScaled(price * 10 + count * SCALE)), text: "That adds the number of tickets to the price. " + count + " tickets means " + count + " lots of the price." }
        ];
        question.hints = [
            "Multiply " + price + " by " + count + " as whole numbers of pence first, then put the point back two places from the right.",
            groupWhole(price) + " × " + count + " = " + groupWhole(price * count) + " pence."
        ];
        question.steps = [
            "Work in pence first: " + groupWhole(price) + " × " + count + " = " + groupWhole(price * count) + ".",
            "£" + money(price * 10) + " carries two decimal places, so the answer does too.",
            "Putting the point back two places from the right gives " + money(total) + ".",
            "Check against an estimate: " + count + " × " + Math.round(price / 100) + " = " + count * Math.round(price / 100) + ".",
            "Cost: £" + money(total) + "."
        ];
        return question;
    }

    /* The round ends here: a whole number on top has to be padded before any
       column can be subtracted. */
    function fillUnpaddedSubtraction(question, rng) {
        const whole = randomInt(rng, 6, 40);
        const asMoney = rng() < 0.5;
        /* Money keeps two decimal places exactly; a measure is where the third
           decimal place makes the padding impossible to skip. */
        const bottom = asMoney
            ? randomInt(rng, 101, whole * 100 - 100) * 10
            : drawValid(function () {
                return randomInt(rng, 1005, whole * SCALE - 1000);
            }, function (candidate) {
                return candidate % 10 !== 0;
            }, 3475);
        const difference = whole * SCALE - bottom;
        question.factKey = "unpadded/" + whole + "-" + bottom;
        question.contextKey = asMoney ? "money" : "measure";
        question.title = asMoney ? "A difference in pounds" : "A difference in metres";
        question.prompt = asMoney
            ? "A £" + whole + " voucher is used to pay for an item costing £" + money(bottom)
                + ". Work out the change, in pounds to two decimal places."
            : "A " + whole + " m roll has " + fromScaled(bottom) + " m cut from it. Work out the length left, in metres.";
        setSingle(question, difference, asMoney ? "Change in pounds" : "Length left in metres");
        if (asMoney) {
            question.unitPrefix = "£";
            question.expectedText = money(difference);
            question.answerShown = "£" + money(difference);
        } else {
            question.unitSuffix = "m";
            question.answerShown = fromScaled(difference) + " m";
        }
        question.correctNote = "Correct — " + fromScaled(difference) + " + " + fromScaled(bottom) + " = " + whole + ".";
        question.summaryLine = whole + (asMoney ? "" : " m") + " − " + fromScaled(bottom) + (asMoney ? "" : " m");
        question.printLine = whole + " − " + fromScaled(bottom) + (asMoney ? ", in pounds." : ", in metres.");
        question.misses = [
            { value: noExchangeScaled(String(whole), plainScaled(bottom)) / SCALE,
              text: "The top line has to be padded first: " + whole + " is " + Number(whole).toFixed(3) + ". Then every column has a digit to work with." },
            { value: (whole * SCALE + bottom) / SCALE, text: "That adds the two amounts. The amount used is taken away from the amount available." }
        ];
        const bottomPlaces = decimalPlaces(plainScaled(bottom));
        question.hints = [
            "The top number has no digits after the point yet. Write it with the same number of decimal places as the number below before starting.",
            whole + " padded is " + Number(whole).toFixed(bottomPlaces) + ", and every column after the point holds a zero, so the exchange has to travel left through them."
        ];
        question.steps = [
            "Pad the top line so every column is full: " + whole + " becomes " + Number(whole).toFixed(bottomPlaces) + ".",
            "The right-hand column cannot give, so the request travels left until a column can; every zero it passes becomes 9.",
            "Subtract column by column from the right.",
            "Check by adding back: " + fromScaled(difference) + " + " + fromScaled(bottom) + " = " + whole + ".",
            (asMoney ? "Change: £" + money(difference) : "Length left: " + fromScaled(difference) + " m") + "."
        ];
        return question;
    }

    const FILLERS = {
        "add-decimals": fillAddDecimals,
        "add-three": fillAddThree,
        "subtract-decimals": fillSubtractDecimals,
        "subtract-across-zeros": fillSubtractAcrossZeros,
        "multiply-decimals": fillMultiplyDecimals,
        "multiply-below-one": fillMultiplyBelowOne,
        "place-the-point": fillPlaceThePoint,
        "multiply-estimate": fillMultiplyEstimate,
        "money-total": fillMoneyTotal,
        "measure-difference": fillMeasureDifference,
        "money-repeated": fillMoneyRepeated,
        "unpadded-subtraction": fillUnpaddedSubtraction
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
            order.forEach(function (family) { round.push(generateQuestion(stage, family, rng)); });
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
        return { state: "wrong", text: "Not yet. Set the calculation out in columns with the decimal points in a vertical line, and pad every number to the same number of decimal places." };
    }

    function evaluateChoice(question, raw) {
        const cleaned = normalise(raw);
        if (cleaned === "") return { state: "blank", text: "Select one of the options, then check it." };
        const index = Number(cleaned);
        if (index === question.correctIndex) return { state: "correct", text: question.optionNotes[index] };
        return { state: "wrong", text: question.optionNotes[index] || "That option is not the value of this product." };
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
            if (round[11].family !== "unpadded-subtraction") problems.push("Round " + seed + " does not end on the unpadded subtraction.");
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
        validateQuestion: validateQuestion
    };

    scope.WrittenMethodsReviewPractice = api;
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
                const id = "written-choice-" + current + "-" + index;
                const label = element("label", "practice-choice__option");
                if (currentQuestion.compactValues) label.classList.add("is-value-choice");
                const radio = element("input");
                radio.type = "radio";
                radio.name = "written-choice-" + current;
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
                const id = "written-part-" + current + "-" + index;
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
            if (display.kind === "column") {
                expression.classList.add("practice-column");
                display.rows.forEach(function (row) {
                    const node = element("div", "practice-column__row");
                    node.appendChild(element("span", "", row.sign));
                    node.appendChild(element("strong", "", row.parts.whole));
                    node.appendChild(element("span", "practice-column__fraction", row.parts.fraction));
                    expression.appendChild(node);
                });
                expression.appendChild(element("div", "practice-column__rule"));
                return;
            }
            expression.classList.add("practice-division-line");
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
