/* Practice: long division by a two-digit divisor.
   Builds the twelve questions of a round, marks them and drives the page.
   The generator half runs without a document so it can be fuzzed from Node. */
(function (scope) {
    "use strict";

    const STAGES = [
        { name: "Dividing by a two-digit number", lessonAnchor: "the-long-division-cycle" },
        { name: "Continuing to an exact decimal", lessonAnchor: "through-the-decimal-point" },
        { name: "Inside the layout, and in context", lessonAnchor: "long-division-in-context" }
    ];

    const LESSON_URL = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/longDivision.html";

    const FAMILIES = [
        ["whole-two-digit", "whole-three-digit", "whole-quotient-zero", "whole-remainder"],
        ["decimal-append", "decimal-dividend", "decimal-two-places", "decimal-below-one"],
        ["missing-quotient-digit", "missing-product", "choose-multiple", "context-long"]
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

    /* Bounded draw with a valid fallback, so no generator can spin. */
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

    /* ------------------------------------------------------------- layout */

    /* Lay out a long division exactly as it is written by hand. `cells` are the
       dividend positions left to right, one per digit plus a cell for the
       decimal point, so every later row keeps its column. Each step records the
       column its quotient digit belongs above. */
    function buildLongDivision(dividendText, divisor, maxAppended) {
        const limit = maxAppended === undefined ? 6 : maxAppended;
        const raw = String(dividendText);
        if (!/^\d+(\.\d+)?$/.test(raw) || !Number.isInteger(divisor) || divisor < 2) return null;

        const digits = [];
        let pointIndex = -1;
        raw.split("").forEach(function (character) {
            if (character === ".") {
                pointIndex = digits.length;
                digits.push({ type: "point", digit: ".", appended: false });
                return;
            }
            digits.push({ type: "digit", digit: character, appended: false });
        });

        const steps = [];
        const quotient = digits.map(function (cell) {
            return { type: cell.type, digit: "", appended: false };
        });
        let current = 0;
        let started = false;
        let index = 0;
        let appended = 0;

        while (index < digits.length) {
            const cell = digits[index];
            if (cell.type === "point") { index += 1; continue; }
            current = current * 10 + Number(cell.digit);
            const factor = Math.floor(current / divisor);
            if (factor > 0) started = true;
            if (started) {
                const product = factor * divisor;
                quotient[index].digit = String(factor);
                steps.push({
                    column: index,
                    current: current,
                    factor: factor,
                    product: product,
                    remainder: current - product,
                    appended: cell.appended
                });
                current -= product;
            }
            index += 1;

            /* Every written digit has been used. If something is still left and
               an exact answer is wanted, append a zero and carry on. */
            if (index === digits.length && current !== 0 && appended < limit) {
                if (pointIndex === -1) {
                    pointIndex = digits.length;
                    digits.push({ type: "point", digit: ".", appended: false });
                    quotient.push({ type: "point", digit: ".", appended: false });
                }
                digits.push({ type: "digit", digit: "0", appended: true });
                quotient.push({ type: "digit", digit: "", appended: true });
                appended += 1;
            }
        }

        if (current !== 0 || !steps.length) return null;

        /* A quotient below 1 still needs its leading zero, written in the
           column immediately to the left of the point. */
        if (pointIndex > 0 && !quotient.slice(0, pointIndex).some(function (cell) { return cell.digit; })) {
            quotient[pointIndex - 1].digit = "0";
        }
        let answerText = quotient.map(function (cell) {
            return cell.digit || (cell.type === "point" ? "." : "");
        }).join("").replace(/^0+(?=\d)/, "");
        if (answerText.charAt(0) === ".") answerText = "0" + answerText;

        return {
            dividendText: raw, divisor: divisor, columns: digits.length,
            cells: digits, quotient: quotient, steps: steps, pointIndex: pointIndex,
            appended: appended, remainder: 0,
            answerText: answerText, answerValue: Number(answerText)
        };
    }

    /* A whole-number quotient that stops at a remainder: nothing is appended. */
    function buildRemainderDivision(dividend, divisor) {
        const digits = String(dividend).split("").map(function (digit) {
            return { type: "digit", digit: digit, appended: false };
        });
        const quotient = digits.map(function () { return { type: "digit", digit: "", appended: false }; });
        const steps = [];
        let current = 0;
        let started = false;
        digits.forEach(function (cell, index) {
            current = current * 10 + Number(cell.digit);
            const factor = Math.floor(current / divisor);
            if (factor > 0) started = true;
            if (!started) return;
            const product = factor * divisor;
            quotient[index].digit = String(factor);
            steps.push({ column: index, current: current, factor: factor, product: product, remainder: current - product, appended: false });
            current -= product;
        });
        const answerText = quotient.map(function (cell) { return cell.digit; }).join("").replace(/^0+(?=\d)/, "");
        return {
            dividendText: String(dividend), divisor: divisor, columns: digits.length,
            cells: digits, quotient: quotient, steps: steps, pointIndex: -1,
            appended: 0, remainder: current,
            answerText: answerText, answerValue: Number(answerText)
        };
    }

    /* Rows of written working, in the order they go on the paper. A quotient
       zero writes nothing under the line, so those steps contribute no row. */
    function workingRows(layout) {
        const written = layout.steps.filter(function (step) { return step.factor > 0; });
        const last = layout.steps[layout.steps.length - 1];
        const rows = [];
        written.forEach(function (step, position) {
            rows.push({ kind: "product", step: step, column: step.column, value: step.product, minus: true, rule: true });
            const next = written[position + 1];
            if (next) rows.push({ kind: "current", step: next, column: next.column, value: next.current, minus: false, rule: false });
            else rows.push({ kind: "remainder", step: last, column: last.column, value: layout.remainder, minus: false, rule: false });
        });
        return rows;
    }

    /* Place a number's digits into the digit columns that end at `column`,
       stepping over the decimal point so digits stay under digits. */
    function placeValue(layout, column, text) {
        const chars = new Array(layout.columns).fill("");
        const digits = String(text).split("");
        let cursor = column;
        for (let index = digits.length - 1; index >= 0; index -= 1) {
            while (cursor >= 0 && layout.cells[cursor].type === "point") cursor -= 1;
            if (cursor < 0) break;
            chars[cursor] = digits[index];
            cursor -= 1;
        }
        let first = 0;
        while (first < chars.length && chars[first] === "") first += 1;
        return { chars: chars, from: first, to: column };
    }

    /* The board is one image to assistive technology, so its label has to carry
       everything the sighted reader can see — including which entry is blank —
       or the question cannot be answered from the label alone. */
    function boardLabel(display, layout) {
        const quotient = display.quotient.map(function (cell) {
            if (cell.box) return "a blank";
            if (cell.type === "point") return "point";
            return cell.digit;
        }).filter(Boolean).join(", ");
        const written = workingRows(layout);
        const rows = display.rows.map(function (row, index) {
            const source = written[index];
            const value = row.box ? "a blank" : groupDigits(source.value);
            if (source.kind === "product") return "subtract " + value;
            if (source.kind === "current") return "bringing down makes " + value;
            return "leaving " + value;
        }).join("; ");
        return "Long division: " + layout.divisor + " into " + groupDigits(display.cells.map(function (cell) {
            return cell.digit;
        }).join("")) + ". Quotient reads " + quotient + ". Working: " + rows + ".";
    }

    function boardDisplay(layout, options) {
        const settings = options || {};
        const rows = workingRows(layout).map(function (row) {
            const isBoxed = settings.boxRow !== undefined && settings.boxRow === row.column && settings.boxKind === row.kind;
            /* The blank stands in the columns the value would occupy, so the
               layout reads as a part-written page rather than a gap. */
            const placed = placeValue(layout, row.column, String(row.value));
            return {
                chars: isBoxed ? placed.chars.map(function () { return ""; }) : placed.chars,
                from: placed.from,
                to: row.column,
                minus: row.minus,
                rule: row.rule,
                box: isBoxed
            };
        });
        const display = {
            kind: "board",
            divisor: String(layout.divisor),
            columns: layout.columns,
            cells: layout.cells.map(function (cell) {
                return { type: cell.type, digit: cell.digit, appended: cell.appended };
            }),
            quotient: layout.quotient.map(function (cell, index) {
                const boxed = settings.boxQuotient !== undefined && settings.boxQuotient === index;
                return { type: cell.type, digit: boxed ? "" : cell.digit, appended: cell.appended, box: boxed };
            }),
            rows: rows,
            remainderLabel: layout.remainder ? "remainder " + layout.remainder : ""
        };
        display.ariaLabel = boardLabel(display, layout);
        return display;
    }

    function inlineDivision(dividendText, divisor) {
        return {
            kind: "inline",
            text: groupDigits(dividendText) + " ÷ " + divisor,
            ariaLabel: groupDigits(dividendText) + " divided by " + divisor
        };
    }

    function multiplesText(divisor) {
        const list = [];
        for (let index = 1; index <= 9; index += 1) list.push(groupDigits(index * divisor));
        return "Multiples of " + divisor + ": " + list.join(", ") + ".";
    }

    /* Narrate the cycle for the worked solution, in the lesson's order. */
    function cycleSteps(layout, closing) {
        const steps = [];
        const leading = layout.steps[0];
        steps.push("List the multiples first. " + multiplesText(layout.divisor));
        if (layout.pointIndex >= 0 && leading.column > layout.pointIndex) {
            steps.push("The whole-number part of " + groupDigits(layout.dividendText) + " is smaller than "
                + layout.divisor + ", so the quotient starts with 0 before the point.");
        }
        steps.push("Begin with the shortest leading block that is at least " + layout.divisor
            + ": that is " + groupDigits(leading.current) + ", using the digits up to that column.");
        layout.steps.forEach(function (step) {
            if (step.factor === 0) {
                steps.push(groupDigits(step.current) + " is smaller than " + layout.divisor
                    + ", so write 0 in the quotient and bring down the next digit.");
                return;
            }
            steps.push("Choose " + step.factor + " × " + layout.divisor + " = " + groupDigits(step.product)
                + ", the greatest multiple not above " + groupDigits(step.current)
                + ". Subtract: " + groupDigits(step.current) + " − " + groupDigits(step.product) + " = " + groupDigits(step.remainder) + ".");
        });
        if (closing) steps.push(closing);
        steps.push("Check by multiplying back: " + layout.answerText + " × " + layout.divisor
            + (layout.remainder ? " + " + layout.remainder : "") + " = " + groupDigits(layout.dividendText) + ".");
        return steps;
    }

    /* ---------------------------------------------------------- questions */

    function makeQuestion(stage, family) {
        return {
            stage: stage,
            family: family,
            factKey: "",
            contextKey: "",
            title: "",
            prompt: "",
            given: "",
            givenLabel: "",
            unitPrefix: "",
            unitSuffix: "",
            mode: "single",
            answerKind: "decimal",
            answerLabel: "Your answer",
            display: null,
            expected: 0,
            answerShown: "",
            correctNote: "",
            partsNote: "",
            summaryLine: "",
            printLine: "",
            misses: [],
            options: [],
            optionNotes: [],
            correctIndex: 0,
            choiceLegend: "",
            compactValues: false,
            cells: [],
            partsLegend: "",
            hints: [],
            steps: []
        };
    }

    const DIVISORS = [12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32, 33, 34, 35, 36, 37, 38, 39, 41, 42, 43, 44, 45, 46, 47, 48];

    function exactMisses(layout) {
        const answer = layout.answerValue;
        return [
            { value: answer * 10, text: "Every digit is right, but the answer is ten times too large. The quotient's decimal point sits directly above the point in the number being divided." },
            { value: answer / 10, text: "Every digit is right, but the answer is ten times too small. The quotient's decimal point sits directly above the point in the number being divided." }
        ];
    }

    function fillWholeQuotient(question, rng, low, high, divisorMax) {
        const divisor = pick(DIVISORS.filter(function (value) { return value <= divisorMax; }), rng);
        const quotient = randomInt(rng, low, high);
        const dividend = divisor * quotient;
        const layout = buildLongDivision(String(dividend), divisor, 0);
        return { divisor: divisor, quotient: quotient, dividend: dividend, layout: layout };
    }

    function finishWhole(question, draw, title) {
        const layout = draw.layout;
        const last = layout.steps[layout.steps.length - 1];
        question.factKey = draw.dividend + "/" + draw.divisor;
        question.contextKey = "plain";
        question.title = title;
        question.prompt = "Work out this division by long division. The answer is a whole number.";
        question.display = inlineDivision(String(draw.dividend), draw.divisor);
        question.mode = "single";
        question.answerKind = "integer";
        question.answerLabel = "Quotient";
        question.expected = draw.quotient;
        question.answerShown = groupDigits(draw.quotient);
        question.correctNote = "Correct — " + groupDigits(draw.quotient) + " × " + draw.divisor + " = " + groupDigits(draw.dividend) + ".";
        question.summaryLine = groupDigits(draw.dividend) + " ÷ " + draw.divisor;
        question.printLine = groupDigits(draw.dividend) + " ÷ " + draw.divisor;
        question.misses = [
            { value: draw.quotient + 1, text: "One quotient digit is one too high. Check each chosen multiple against the amount above it: the multiple must not exceed it." },
            { value: draw.quotient - 1, text: "One quotient digit is one too low. Check the next multiple up as well: if it still fits, it is the one to use." },
            { value: draw.divisor, text: "That is the divisor. The quotient is the number of " + draw.divisor + "s inside " + groupDigits(draw.dividend) + "." }
        ];
        question.hints = [
            "Write the first nine multiples of " + draw.divisor + " before you start, then take the greatest one that fits at each stage.",
            multiplesText(draw.divisor) + " The first leading block is " + groupDigits(layout.steps[0].current) + "."
        ];
        question.steps = cycleSteps(layout, "Every digit has been used and nothing is left, so the answer is " + groupDigits(draw.quotient) + ".");
        return question;
    }

    function fillWholeTwoDigit(question, rng) {
        const draw = drawValid(function () {
            return fillWholeQuotient(question, rng, 14, 89, 48);
        }, function (candidate) {
            return candidate.layout && candidate.layout.steps.length >= 2
                && candidate.layout.steps.every(function (step) { return step.factor > 0; });
        }, (function () {
            return { divisor: 23, quotient: 78, dividend: 1794, layout: buildLongDivision("1794", 23, 0) };
        })());
        return finishWhole(question, draw, "Divide by a two-digit number");
    }

    function fillWholeThreeDigit(question, rng) {
        const draw = drawValid(function () {
            return fillWholeQuotient(question, rng, 112, 489, 39);
        }, function (candidate) {
            return candidate.layout && String(candidate.quotient).indexOf("0") === -1
                && candidate.layout.steps.every(function (step) { return step.factor > 0; });
        }, (function () {
            return { divisor: 24, quotient: 137, dividend: 3288, layout: buildLongDivision("3288", 24, 0) };
        })());
        return finishWhole(question, draw, "Divide by a two-digit number");
    }

    function fillWholeQuotientZero(question, rng) {
        const draw = drawValid(function () {
            const divisor = pick(DIVISORS.filter(function (value) { return value <= 35; }), rng);
            const quotient = randomInt(rng, 1, 9) * 100 + randomInt(rng, 1, 9);
            return { divisor: divisor, quotient: quotient, dividend: divisor * quotient, layout: buildLongDivision(String(divisor * quotient), divisor, 0) };
        }, function (candidate) {
            return candidate.layout && candidate.layout.steps.some(function (step) { return step.factor === 0; });
        }, (function () {
            return { divisor: 15, quotient: 203, dividend: 3045, layout: buildLongDivision("3045", 15, 0) };
        })());
        const question2 = finishWhole(question, draw, "Divide by a two-digit number");
        question2.misses.push({
            value: Number(String(draw.quotient).replace("0", "")),
            text: "The digits are right but one place is missing. When the amount is smaller than " + draw.divisor + ", write 0 in the quotient to hold that place before bringing the next digit down."
        });
        question2.hints[1] = multiplesText(draw.divisor)
            + " Watch for a stage where the amount is smaller than " + draw.divisor + ".";
        return question2;
    }

    function fillWholeRemainder(question, rng) {
        const draw = drawValid(function () {
            const divisor = pick(DIVISORS, rng);
            const quotient = randomInt(rng, 14, 89);
            const remainder = randomInt(rng, 1, divisor - 1);
            const dividend = divisor * quotient + remainder;
            return { divisor: divisor, quotient: quotient, remainder: remainder, dividend: dividend, layout: buildRemainderDivision(dividend, divisor) };
        }, function (candidate) {
            return candidate.layout.steps.length >= 2;
        }, (function () {
            return { divisor: 32, quotient: 45, remainder: 16, dividend: 1456, layout: buildRemainderDivision(1456, 32) };
        })());
        const layout = draw.layout;
        question.factKey = draw.dividend + "/" + draw.divisor;
        question.contextKey = "plain";
        question.title = "Stop at the remainder";
        question.prompt = "Divide, stopping once every written digit has been used. Give the whole-number quotient and the remainder separately.";
        question.display = inlineDivision(String(draw.dividend), draw.divisor);
        question.mode = "parts";
        question.partsLegend = "The two parts of the answer";
        question.cells = [
            { label: "Quotient", expected: String(draw.quotient) },
            { label: "Remainder", expected: String(draw.remainder) }
        ];
        question.answerShown = groupDigits(draw.quotient) + " remainder " + draw.remainder;
        question.correctNote = "Correct — " + groupDigits(draw.quotient) + " × " + draw.divisor + " + " + draw.remainder + " = " + groupDigits(draw.dividend) + ".";
        question.partsNote = "The remainder is what is left after the last subtraction, and it must be smaller than " + draw.divisor + ".";
        question.summaryLine = groupDigits(draw.dividend) + " ÷ " + draw.divisor + ", stopping at the remainder";
        question.printLine = groupDigits(draw.dividend) + " ÷ " + draw.divisor + " (quotient and remainder)";
        question.hints = [
            "Run the cycle until the last written digit has been used, then stop. Whatever is left below the final subtraction is the remainder.",
            multiplesText(draw.divisor) + " The last subtraction leaves " + draw.remainder + "."
        ];
        question.steps = cycleSteps(layout, "The last written digit has been used and " + draw.remainder
            + " is left, which is smaller than " + draw.divisor + ", so the answer is "
            + groupDigits(draw.quotient) + " remainder " + draw.remainder + ".");
        return question;
    }

    /* Stage 2 -------------------------------------------------------- */

    function decimalDraw(rng, options) {
        const settings = options;
        return drawValid(function () {
            const divisor = pick(DIVISORS.filter(function (value) { return value <= settings.divisorMax; }), rng);
            const scaled = randomInt(rng, settings.low, settings.high);
            const answer = scaled / Math.pow(10, settings.places);
            const dividendValue = answer * divisor;
            const dividendText = settings.dividendPlaces
                ? (Math.round(dividendValue * Math.pow(10, settings.dividendPlaces)) / Math.pow(10, settings.dividendPlaces)).toFixed(settings.dividendPlaces)
                : String(Math.round(dividendValue));
            const layout = buildLongDivision(dividendText, divisor, 6);
            return { divisor: divisor, answer: answer, dividendText: dividendText, layout: layout };
        }, function (candidate) {
            if (!candidate.layout) return false;
            if (Math.abs(candidate.layout.answerValue - candidate.answer) > 1e-9) return false;
            if (Math.abs(Number(candidate.dividendText) - candidate.answer * candidate.divisor) > 1e-9) return false;
            return settings.accept(candidate);
        }, settings.fallback());
    }

    function finishDecimal(question, draw, title, prompt) {
        const layout = draw.layout;
        question.factKey = draw.dividendText + "/" + draw.divisor;
        question.contextKey = "plain";
        question.title = title;
        question.prompt = prompt;
        question.display = inlineDivision(draw.dividendText, draw.divisor);
        question.mode = "single";
        question.answerKind = "decimal";
        question.answerLabel = "Exact answer";
        question.expected = layout.answerValue;
        question.answerShown = layout.answerText;
        question.correctNote = "Correct — " + layout.answerText + " × " + draw.divisor + " = " + groupDigits(draw.dividendText) + ".";
        question.summaryLine = groupDigits(draw.dividendText) + " ÷ " + draw.divisor + ", exactly";
        question.printLine = groupDigits(draw.dividendText) + " ÷ " + draw.divisor + " (exact decimal)";
        question.misses = exactMisses(layout).concat([
            { value: Math.floor(layout.answerValue), text: "That is only the whole-number part. Carry on past the decimal point until nothing is left." },
            { value: Math.round(layout.answerValue), text: "That is the answer rounded. This question asks for the exact value, so keep dividing until the remainder is zero." }
        ]);
        question.hints = [
            "Keep the quotient's decimal point directly above the point in the number being divided, then carry on until nothing is left over.",
            multiplesText(draw.divisor) + (layout.appended
                ? " Write " + groupDigits(draw.dividendText) + " with " + (layout.appended === 1 ? "a zero" : layout.appended + " zeros") + " after the point and bring "
                    + (layout.appended === 1 ? "it" : "them") + " down."
                : " Every digit needed is already written.")
        ];
        question.steps = cycleSteps(layout, layout.appended
            ? "The written digits ran out with something still left, so " + (layout.appended === 1 ? "a zero was" : layout.appended + " zeros were")
                + " appended after the point and brought down. Nothing is left now, so the exact answer is " + layout.answerText + "."
            : "Nothing is left, so the exact answer is " + layout.answerText + ".");
        return question;
    }

    function fillDecimalAppend(question, rng) {
        const draw = decimalDraw(rng, {
            divisorMax: 48, low: 105, high: 895, places: 1, dividendPlaces: 0,
            accept: function (candidate) {
                return candidate.layout.appended >= 1 && candidate.answer >= 10 && candidate.answer % 1 !== 0;
            },
            fallback: function () {
                return { divisor: 32, answer: 45.5, dividendText: "1456", layout: buildLongDivision("1456", 32, 6) };
            }
        });
        return finishDecimal(question, draw, "Continue past the point",
            "Work out this division exactly. The number being divided is a whole number, so append zeros after the point and keep going.");
    }

    function fillDecimalDividend(question, rng) {
        const draw = decimalDraw(rng, {
            divisorMax: 48, low: 105, high: 985, places: 2, dividendPlaces: 1,
            accept: function (candidate) {
                return /\.[1-9]$/.test(candidate.dividendText) && candidate.answer >= 1 && candidate.answer % 1 !== 0;
            },
            fallback: function () {
                return { divisor: 24, answer: 2.85, dividendText: "68.4", layout: buildLongDivision("68.4", 24, 6) };
            }
        });
        return finishDecimal(question, draw, "Divide a decimal amount",
            "Work out this division exactly. Keep the quotient's decimal point above the point in the number being divided.");
    }

    function fillDecimalTwoPlaces(question, rng) {
        const draw = decimalDraw(rng, {
            divisorMax: 45, low: 1205, high: 4895, places: 2, dividendPlaces: 0,
            accept: function (candidate) {
                return candidate.layout.appended === 2 && candidate.answer % 1 !== 0
                    && Math.abs(candidate.answer * 100 % 10) > 1e-9;
            },
            fallback: function () {
                return { divisor: 16, answer: 24.75, dividendText: "396", layout: buildLongDivision("396", 16, 6) };
            }
        });
        return finishDecimal(question, draw, "Continue past the point",
            "Work out this division exactly. Append zeros after the point and keep going until nothing is left.");
    }

    function fillDecimalBelowOne(question, rng) {
        const draw = decimalDraw(rng, {
            divisorMax: 48, low: 15, high: 96, places: 2, dividendPlaces: 1,
            accept: function (candidate) {
                return candidate.answer < 1 && /\.[1-9]$/.test(candidate.dividendText)
                    && Number(candidate.dividendText) > candidate.divisor / 100;
            },
            fallback: function () {
                return { divisor: 24, answer: 0.65, dividendText: "15.6", layout: buildLongDivision("15.6", 24, 6) };
            }
        });
        const built = finishDecimal(question, draw, "Divide a decimal amount",
            "Work out this division exactly. The answer is smaller than 1, so start the quotient with a zero before the point.");
        built.misses.push({
            value: draw.layout.answerValue * 100,
            text: "The digits are right, but the answer must be smaller than 1: " + groupDigits(draw.dividendText)
                + " is smaller than " + draw.divisor + ", so no whole group fits before the point."
        });
        return built;
    }

    /* Stage 3 -------------------------------------------------------- */

    function structureDraw(rng) {
        return drawValid(function () {
            const divisor = pick(DIVISORS.filter(function (value) { return value <= 42; }), rng);
            const quotient = randomInt(rng, 112, 489);
            return { divisor: divisor, quotient: quotient, dividend: divisor * quotient, layout: buildLongDivision(String(divisor * quotient), divisor, 0) };
        }, function (candidate) {
            return candidate.layout && candidate.layout.steps.length >= 3
                && candidate.layout.steps.every(function (step) { return step.factor > 0; });
        }, (function () {
            return { divisor: 23, quotient: 178, dividend: 4094, layout: buildLongDivision("4094", 23, 0) };
        })());
    }

    function fillMissingQuotientDigit(question, rng) {
        const draw = structureDraw(rng);
        const layout = draw.layout;
        const step = pick(layout.steps, rng);
        question.factKey = draw.dividend + "/" + draw.divisor + "/q" + step.column;
        question.contextKey = "structure";
        question.title = "Complete the layout";
        question.prompt = "This long division is part-written. Work out the digit that belongs in the empty box in the quotient.";
        question.display = boardDisplay(layout, { boxQuotient: step.column });
        question.mode = "single";
        question.answerKind = "integer";
        question.answerLabel = "Missing quotient digit";
        question.expected = step.factor;
        question.answerShown = String(step.factor);
        question.correctNote = "Correct — " + step.factor + " × " + draw.divisor + " = " + groupDigits(step.product) + ", which is the value subtracted at that stage.";
        question.summaryLine = groupDigits(draw.dividend) + " ÷ " + draw.divisor + ", one quotient digit missing";
        question.printLine = "In " + groupDigits(draw.dividend) + " ÷ " + draw.divisor + ", the quotient digit above the stage that subtracts " + groupDigits(step.product);
        question.misses = [
            { value: step.factor + 1, text: "That multiple is too large: " + (step.factor + 1) + " × " + draw.divisor + " = " + groupDigits((step.factor + 1) * draw.divisor) + ", which is more than " + groupDigits(step.current) + "." },
            { value: step.factor - 1, text: "That multiple fits, but it is not the greatest one that does: " + step.factor + " × " + draw.divisor + " = " + groupDigits(step.product) + " still fits inside " + groupDigits(step.current) + "." },
            { value: step.product, text: "That is the value written under the line. The box holds the multiplier that produced it." }
        ];
        question.hints = [
            "The number written under the line at that stage is the divisor multiplied by the missing digit.",
            multiplesText(draw.divisor) + " Which multiplier gives " + groupDigits(step.product) + "?"
        ];
        question.steps = [
            "At that stage the amount being divided is " + groupDigits(step.current) + ".",
            multiplesText(draw.divisor),
            "The greatest multiple not above " + groupDigits(step.current) + " is " + groupDigits(step.product) + " = " + step.factor + " × " + draw.divisor + ".",
            "So the missing quotient digit is " + step.factor + ", and " + groupDigits(step.current) + " − " + groupDigits(step.product) + " = " + groupDigits(step.remainder) + ".",
            "Completing the layout gives " + groupDigits(draw.dividend) + " ÷ " + draw.divisor + " = " + groupDigits(draw.quotient) + "."
        ];
        return question;
    }

    function fillMissingProduct(question, rng) {
        const draw = structureDraw(rng);
        const layout = draw.layout;
        const step = pick(layout.steps, rng);
        question.factKey = draw.dividend + "/" + draw.divisor + "/p" + step.column;
        question.contextKey = "structure";
        question.title = "Complete the layout";
        question.prompt = "This long division is part-written. Work out the number that belongs in the empty box under the line.";
        question.display = boardDisplay(layout, { boxRow: step.column, boxKind: "product" });
        question.mode = "single";
        question.answerKind = "integer";
        question.answerLabel = "Missing value";
        question.expected = step.product;
        question.answerShown = groupDigits(step.product);
        question.correctNote = "Correct — the quotient digit " + step.factor + " means " + step.factor + " × " + draw.divisor + " = " + groupDigits(step.product) + " is taken away at that stage.";
        question.summaryLine = groupDigits(draw.dividend) + " ÷ " + draw.divisor + ", one subtracted value missing";
        question.printLine = "In " + groupDigits(draw.dividend) + " ÷ " + draw.divisor + ", the value subtracted below the quotient digit " + step.factor;
        question.misses = [
            { value: step.factor, text: "That is the quotient digit already written above the line. The box holds the value it produces when multiplied by " + draw.divisor + "." },
            { value: step.current, text: "That is the amount being divided at that stage, which sits above the line, not the multiple subtracted from it." },
            { value: step.remainder, text: "That is what is left after the subtraction. The box holds the value that was taken away." },
            { value: step.product + draw.divisor, text: "That is the next multiple up, " + (step.factor + 1) + " × " + draw.divisor + ". It is larger than " + groupDigits(step.current) + ", so it cannot be subtracted here." },
            { value: step.product - draw.divisor, text: "That is the multiple below, " + (step.factor - 1) + " × " + draw.divisor + ". It fits, but " + groupDigits(step.product) + " fits as well and is larger, so it is the one to use." }
        ];
        question.hints = [
            "Each row under the line is the divisor multiplied by the quotient digit directly above that stage.",
            "The quotient digit at that stage is " + step.factor + ", and " + multiplesText(draw.divisor).toLowerCase()
        ];
        question.steps = [
            "The quotient digit above that stage is " + step.factor + ".",
            "Every row under the line is that digit multiplied by the divisor: " + step.factor + " × " + draw.divisor + " = " + groupDigits(step.product) + ".",
            "Subtracting gives " + groupDigits(step.current) + " − " + groupDigits(step.product) + " = " + groupDigits(step.remainder) + ", which is smaller than " + draw.divisor + ".",
            "Completing the layout gives " + groupDigits(draw.dividend) + " ÷ " + draw.divisor + " = " + groupDigits(draw.quotient) + "."
        ];
        return question;
    }

    function fillChooseMultiple(question, rng) {
        const divisor = pick(DIVISORS, rng);
        const factor = randomInt(rng, 3, 8);
        const amount = factor * divisor + randomInt(rng, 1, divisor - 1);
        const values = [factor * divisor, (factor + 1) * divisor, (factor - 1) * divisor, (factor - 2) * divisor];
        const notes = [
            "That is the greatest multiple of " + divisor + " that does not pass " + groupDigits(amount) + ", so the quotient digit is " + factor + ".",
            groupDigits((factor + 1) * divisor) + " is larger than " + groupDigits(amount) + ", so it cannot be subtracted at this stage.",
            groupDigits((factor - 1) * divisor) + " fits, but " + groupDigits(factor * divisor) + " also fits and is larger, so this multiple is one too low.",
            groupDigits((factor - 2) * divisor) + " fits, but two larger multiples of " + divisor + " also fit, so this leaves too much behind."
        ];
        const order = shuffleIndexes(4, rng);
        question.factKey = divisor + "/" + amount;
        question.contextKey = "structure";
        question.title = "Choosing the multiple";
        question.prompt = "A stage of a long division by " + divisor + " has reached " + groupDigits(amount)
            + ". Choose the value that should be written under the line and subtracted.";
        question.mode = "choice";
        question.compactValues = true;
        question.choiceLegend = "The value to subtract at this stage";
        question.options = order.map(function (index) { return groupDigits(values[index]); });
        question.optionNotes = order.map(function (index) { return notes[index]; });
        question.correctIndex = order.indexOf(0);
        question.answerShown = groupDigits(values[0]);
        question.answerLabel = "Your choice";
        question.summaryLine = "A stage of a division by " + divisor + " reaching " + groupDigits(amount);
        question.printLine = "A long division by " + divisor + " has reached " + groupDigits(amount) + ". Which multiple is subtracted?";
        question.hints = [
            "The value subtracted must fit inside the current amount, and no larger multiple of the divisor may also fit.",
            multiplesText(divisor)
        ];
        question.steps = [
            multiplesText(divisor),
            "The current amount is " + groupDigits(amount) + ".",
            groupDigits(factor * divisor) + " = " + factor + " × " + divisor + " is not above it, and the next multiple, "
                + groupDigits((factor + 1) * divisor) + ", is.",
            "So " + groupDigits(factor * divisor) + " is written under the line, the quotient digit is " + factor
                + ", and the subtraction leaves " + groupDigits(amount - factor * divisor) + "."
        ];
        return question;
    }

    const LONG_CONTEXTS = [
        {
            key: "bolts", kind: "integer", unit: "bolts",
            setting: function (total, groups) {
                return "A supplier places " + groupDigits(total) + " bolts equally into " + groups + " crates.";
            },
            question: "How many bolts are in each crate?", label: "Bolts in each crate"
        },
        {
            key: "cable", kind: "decimal", unit: "metres",
            setting: function (total, groups) {
                return "A cable " + groupDigits(total) + " m long is cut into " + groups + " equal lengths.";
            },
            question: "How long is each length, in metres?", label: "Length in metres"
        },
        {
            key: "seeds", kind: "integer", unit: "seeds",
            setting: function (total, groups) {
                return "A grower divides " + groupDigits(total) + " seeds equally between " + groups + " trays.";
            },
            question: "How many seeds are in each tray?", label: "Seeds in each tray"
        },
        {
            key: "fuel", kind: "decimal", unit: "litres",
            setting: function (total, groups) {
                return groupDigits(total) + " litres of fuel are shared equally between " + groups + " tanks.";
            },
            question: "How many litres go into each tank?", label: "Litres in each tank"
        }
    ];

    function fillContextLong(question, rng) {
        const context = pick(LONG_CONTEXTS, rng);
        const draw = context.kind === "integer"
            ? drawValid(function () {
                const divisor = pick(DIVISORS, rng);
                const quotient = randomInt(rng, 24, 289);
                return { divisor: divisor, dividendText: String(divisor * quotient), layout: buildLongDivision(String(divisor * quotient), divisor, 0) };
            }, function (candidate) {
                return candidate.layout && candidate.layout.steps.length >= 2;
            }, { divisor: 23, dividendText: "1794", layout: buildLongDivision("1794", 23, 0) })
            : decimalDraw(rng, {
                divisorMax: 48, low: 125, high: 985, places: 2, dividendPlaces: 1,
                accept: function (candidate) {
                    return /\.[1-9]$/.test(candidate.dividendText) && candidate.answer >= 1 && candidate.answer % 1 !== 0;
                },
                fallback: function () {
                    return { divisor: 24, answer: 2.85, dividendText: "68.4", layout: buildLongDivision("68.4", 24, 6) };
                }
            });
        const layout = draw.layout;
        question.factKey = context.key + "/" + draw.dividendText + "/" + draw.divisor;
        question.contextKey = context.key;
        question.title = "Long division in context";
        question.prompt = context.setting(draw.dividendText, draw.divisor) + " " + context.question
            + (context.kind === "decimal" ? " Give the exact answer." : "");
        question.display = inlineDivision(draw.dividendText, draw.divisor);
        question.mode = "single";
        question.answerKind = context.kind === "integer" ? "integer" : "decimal";
        question.answerLabel = context.label;
        question.expected = layout.answerValue;
        question.answerShown = layout.answerText + " " + context.unit;
        question.correctNote = "Correct — " + layout.answerText + " × " + draw.divisor + " = " + groupDigits(draw.dividendText) + ", so the shares are equal.";
        question.summaryLine = groupDigits(draw.dividendText) + " " + context.unit + " shared between " + draw.divisor;
        question.printLine = context.setting(draw.dividendText, draw.divisor) + " " + context.question;
        question.misses = exactMisses(layout).concat([
            { value: Number(draw.dividendText) - draw.divisor, text: "Sharing equally is a division, not a subtraction. Divide " + groupDigits(draw.dividendText) + " by " + draw.divisor + "." },
            { value: Math.floor(layout.answerValue), text: "That is only the whole-number part. Continue past the point until nothing is left." }
        ]);
        question.hints = [
            "Sharing equally between " + draw.divisor + " is a division by " + draw.divisor + ". Set it out as a long division.",
            multiplesText(draw.divisor)
        ];
        question.steps = cycleSteps(layout, "Nothing is left, so each share is " + layout.answerText + " " + context.unit + ".");
        return question;
    }

    const FILLERS = {
        "whole-two-digit": fillWholeTwoDigit,
        "whole-three-digit": fillWholeThreeDigit,
        "whole-quotient-zero": fillWholeQuotientZero,
        "whole-remainder": fillWholeRemainder,
        "decimal-append": fillDecimalAppend,
        "decimal-dividend": fillDecimalDividend,
        "decimal-two-places": fillDecimalTwoPlaces,
        "decimal-below-one": fillDecimalBelowOne,
        "missing-quotient-digit": fillMissingQuotientDigit,
        "missing-product": fillMissingProduct,
        "choose-multiple": fillChooseMultiple,
        "context-long": fillContextLong
    };

    function nearlyEqual(a, b) {
        return Math.abs(a - b) < 1e-9;
    }

    /* Random values can collide, so a near-miss note that happens to land on
       the correct answer is dropped rather than shown. */
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
        FAMILIES.forEach(function (families, stage) {
            const order = shuffleIndexes(families.length, rng);
            const used = [];
            order.forEach(function (index) {
                let built = generateQuestion(stage, families[index], rng);
                for (let attempt = 0; attempt < 8 && used.indexOf(built.contextKey) !== -1 && built.contextKey !== "plain" && built.contextKey !== "structure"; attempt += 1) {
                    built = generateQuestion(stage, families[index], rng);
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
        if (nearlyEqual(parsed.value, question.expected)) {
            return { state: "correct", text: question.correctNote || "Correct." };
        }
        if (question.answerKind === "integer" && !Number.isInteger(parsed.value)) {
            return { state: "wrong", text: "This answer is a whole number, so it has no decimal part. Check the subtraction at each stage." };
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
        return { state: "wrong", text: "Not yet. List the multiples of the divisor, then check each stage: the multiple chosen must be the greatest one that does not pass the amount above it." };
    }

    function evaluateChoice(question, raw) {
        const cleaned = normalise(raw);
        if (cleaned === "") return { state: "blank", text: "Select one of the options, then check it." };
        const index = Number(cleaned);
        if (index === question.correctIndex) return { state: "correct", text: question.optionNotes[index] };
        return { state: "wrong", text: question.optionNotes[index] || "That option does not fit this stage." };
    }

    function evaluateParts(question, raw) {
        const values = Array.isArray(raw) ? raw : [];
        const entered = question.cells.map(function (cell, index) { return normalise(values[index]); });
        if (entered.every(function (text) { return text === ""; })) {
            return { state: "blank", text: "Fill in both parts, then check them.", correctPositions: [] };
        }
        if (entered.some(function (text) { return text === ""; })) {
            return {
                state: "incomplete",
                text: "One part is still empty. Complete every box before checking.",
                correctPositions: question.cells.map(function (cell, index) {
                    return entered[index] === "" ? undefined : entered[index] === cell.expected;
                })
            };
        }
        if (entered.some(function (text) { return !/^\d+$/.test(text); })) {
            return { state: "unreadable", text: "Each box takes a whole number written in digits.", correctPositions: [] };
        }
        const positions = question.cells.map(function (cell, index) { return entered[index] === cell.expected; });
        const wrong = positions.filter(function (ok) { return !ok; }).length;
        if (!wrong) return { state: "correct", text: question.correctNote || "Correct.", correctPositions: positions };
        const rightLabels = question.cells.filter(function (cell, index) { return positions[index]; })
            .map(function (cell) { return cell.label.toLowerCase(); });
        const wrongLabels = question.cells.filter(function (cell, index) { return !positions[index]; })
            .map(function (cell) { return cell.label.toLowerCase(); });
        const lead = rightLabels.length ? "The " + rightLabels.join(" and ") + " is right. " : "";
        return {
            state: "wrong",
            text: lead + "Look again at the " + wrongLabels.join(" and ") + ". " + (question.partsNote || ""),
            correctPositions: positions
        };
    }

    function evaluateResponse(question, raw) {
        if (question.mode === "choice") return evaluateChoice(question, raw);
        if (question.mode === "parts") return evaluateParts(question, raw);
        return evaluateSingle(question, raw);
    }

    /* --------------------------------------------------------- validation */

    function validateQuestion(question) {
        const problems = [];
        if (!question.title) problems.push("no title");
        if (!question.prompt) problems.push("no prompt");
        if (!question.summaryLine) problems.push("no summary line");
        if (!question.printLine) problems.push("no print line");
        if (!question.answerShown) problems.push("no answer shown");
        if (question.hints.length !== 2) problems.push("expected two hints");
        question.hints.forEach(function (hint, index) {
            if (!hint) problems.push("hint " + (index + 1) + " is empty");
            if (/undefined|NaN/.test(hint)) problems.push("hint " + (index + 1) + " has a broken value");
        });
        if (question.steps.length < 3) problems.push("fewer than three solution steps");
        question.steps.forEach(function (step, index) {
            if (!step) problems.push("step " + (index + 1) + " is empty");
            if (/undefined|NaN/.test(step)) problems.push("step " + (index + 1) + " has a broken value");
        });
        if (/undefined|NaN/.test(question.prompt)) problems.push("prompt has a broken value");
        if (question.mode === "single") {
            if (!Number.isFinite(question.expected)) problems.push("expected value is not finite");
            if (question.answerKind === "integer" && !Number.isInteger(question.expected)) problems.push("integer answer is not whole");
            question.misses.forEach(function (miss, index) {
                if (nearlyEqual(miss.value, question.expected)) problems.push("miss " + index + " equals the answer");
            });
        }
        if (question.mode === "choice") {
            if (question.options.length !== 4) problems.push("expected four options");
            if (new Set(question.options).size !== question.options.length) problems.push("duplicate options");
            if (question.correctIndex < 0) problems.push("no correct option");
        }
        if (question.mode === "parts") {
            question.cells.forEach(function (cell, index) {
                if (!cell.label) problems.push("cell " + index + " has no label");
                if (!/^\d+$/.test(cell.expected)) problems.push("cell " + index + " expects a non-digit value");
            });
        }
        if (question.display && question.display.kind === "board") {
            const board = question.display;
            if (board.quotient.length !== board.columns) problems.push("quotient row does not match the columns");
            if (board.cells.length !== board.columns) problems.push("dividend row does not match the columns");
            board.rows.forEach(function (row, index) {
                if (row.chars.length !== board.columns) problems.push("working row " + index + " does not match the columns");
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
            round.forEach(function (question, index) {
                const stage = Math.floor(index / 4);
                if (question.stage !== stage) problems.push("Question " + index + " has stage " + question.stage + ".");
                validateQuestion(question).forEach(function (problem) {
                    problems.push("Seed " + seed + " Q" + (index + 1) + " (" + question.family + "): " + problem);
                });
                if (question.mode === "single") {
                    if (evaluateResponse(question, String(question.expected)).state !== "correct") {
                        problems.push("Seed " + seed + " Q" + (index + 1) + " (" + question.family + "): exact answer rejected.");
                    }
                }
                if (question.mode === "parts") {
                    const exact = question.cells.map(function (cell) { return cell.expected; });
                    if (evaluateResponse(question, exact).state !== "correct") {
                        problems.push("Seed " + seed + " Q" + (index + 1) + " (" + question.family + "): exact parts rejected.");
                    }
                }
                if (question.mode === "choice") {
                    if (evaluateResponse(question, String(question.correctIndex)).state !== "correct") {
                        problems.push("Seed " + seed + " Q" + (index + 1) + " (" + question.family + "): correct option rejected.");
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
        buildLongDivision: buildLongDivision,
        buildRemainderDivision: buildRemainderDivision,
        buildRound: buildRound,
        createSeededRandom: createSeededRandom,
        evaluateResponse: evaluateResponse,
        generateQuestion: generateQuestion,
        parseAmount: parseAmount,
        selfCheck: selfCheck,
        validateQuestion: validateQuestion,
        workingRows: workingRows
    };

    scope.LongDivisionPractice = api;
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
                const id = "long-choice-" + current + "-" + index;
                const label = element("label", "practice-choice__option");
                if (currentQuestion.compactValues) label.classList.add("is-value-choice");
                const radio = element("input");
                radio.type = "radio";
                radio.name = "long-choice-" + current;
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
                const id = "long-part-" + current + "-" + index;
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
            expression.style.removeProperty("--long-cols");
            expression.hidden = !display;
            if (!display) {
                expression.removeAttribute("role");
                expression.removeAttribute("aria-label");
                return;
            }
            expression.setAttribute("role", "img");
            expression.setAttribute("aria-label", display.ariaLabel);
            if (display.kind === "inline") {
                expression.classList.add("practice-division-line");
                expression.textContent = display.text;
                return;
            }
            expression.classList.add("practice-long");
            expression.style.setProperty("--long-cols", String(display.columns));

            const quotient = element("div", "practice-long__quotient");
            display.quotient.forEach(function (cell, index) {
                const node = element("span", "practice-long__cell");
                node.style.gridColumn = String(index + 1);
                if (cell.type === "point") node.classList.add("is-point");
                if (cell.appended) node.classList.add("is-appended");
                if (cell.box) {
                    node.classList.add("is-box");
                    node.appendChild(element("i", "practice-long__box"));
                } else {
                    node.textContent = cell.digit;
                }
                quotient.appendChild(node);
            });
            expression.appendChild(quotient);

            const division = element("div", "practice-long__division");
            division.appendChild(element("span", "practice-long__divisor", display.divisor));
            const dividend = element("div", "practice-long__dividend");
            display.cells.forEach(function (cell, index) {
                const node = element("span", "practice-long__cell");
                node.style.gridColumn = String(index + 1);
                if (cell.type === "point") node.classList.add("is-point");
                if (cell.appended) node.classList.add("is-appended");
                node.textContent = cell.digit;
                dividend.appendChild(node);
            });
            division.appendChild(dividend);
            expression.appendChild(division);

            const work = element("div", "practice-long__work");
            display.rows.forEach(function (row) {
                const line = element("div", "practice-long__row");
                if (row.minus) {
                    const minus = element("i", "practice-long__minus", "−");
                    minus.setAttribute("aria-hidden", "true");
                    line.appendChild(minus);
                }
                if (row.box) {
                    const box = element("span", "practice-long__cell is-box");
                    box.style.gridColumn = (row.from + 1) + " / " + (row.to + 2);
                    box.appendChild(element("i", "practice-long__box"));
                    line.appendChild(box);
                } else {
                    row.chars.forEach(function (character, index) {
                        if (!character) return;
                        const node = element("span", "practice-long__cell", character);
                        node.style.gridColumn = String(index + 1);
                        line.appendChild(node);
                    });
                }
                if (row.rule) {
                    const rule = element("i", "practice-long__rule");
                    rule.setAttribute("aria-hidden", "true");
                    rule.style.gridColumn = (row.from + 1) + " / " + (row.to + 2);
                    line.appendChild(rule);
                }
                work.appendChild(line);
            });
            expression.appendChild(work);

            if (display.remainderLabel) {
                expression.appendChild(element("p", "practice-long__remainder", display.remainderLabel));
            }
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
