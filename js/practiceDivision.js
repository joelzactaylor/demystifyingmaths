/* Practice: short division.
   Generates the twelve questions of a round, marks them, and drives the page.
   The generator half runs without a document so it can be fuzzed from Node. */
(function (scope) {
    "use strict";

    const STAGES = [
        { name: "Dividing place by place", lessonAnchor: "the-short-division-routine" },
        { name: "Continuing past the point", lessonAnchor: "following-the-decimal-route" },
        { name: "Missing digits and carries", lessonAnchor: "why-the-remainder-moves" }
    ];

    const LESSON_URL = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/shortDivision.html";

    const FAMILIES = [
        ["fluency-carry", "fluency-zero", "fluency-remainder", "fluency-decimal"],
        ["decimal-one-place", "decimal-extend", "decimal-eighths", "decimal-below-one"],
        ["missing-quotient-digit", "missing-carry", "carry-row", "choose-quotient"]
    ];

    const PLACE_NAMES = {
        "4": "ten thousands",
        "3": "thousands",
        "2": "hundreds",
        "1": "tens",
        "0": "ones",
        "-1": "tenths",
        "-2": "hundredths",
        "-3": "thousandths",
        "-4": "ten thousandths"
    };

    function placeLabel(exponent) {
        return PLACE_NAMES[String(exponent)] || "next";
    }

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

    /* Bounded draw with a mathematically valid fallback, so no generator can
       spin. `make` returns a candidate; `ok` decides whether it is usable. */
    function drawValid(make, ok, fallback) {
        for (let attempt = 0; attempt < 24; attempt += 1) {
            const candidate = make();
            if (ok(candidate)) return candidate;
        }
        return fallback;
    }

    function groupDigits(text) {
        if (text.length < 4) return text;
        let out = "";
        for (let index = 0; index < text.length; index += 1) {
            if (index > 0 && (text.length - index) % 3 === 0) out += ",";
            out += text[index];
        }
        return out;
    }

    /* Numbers are held as strings so no decimal is ever rebuilt from a float. */
    function formatNumberText(text) {
        const parts = String(text).split(".");
        return groupDigits(parts[0]) + (parts.length > 1 ? "." + parts[1] : "");
    }

    function scaledToText(scaled, places) {
        if (!places) return String(scaled);
        let digits = String(scaled);
        while (digits.length <= places) digits = "0" + digits;
        let text = digits.slice(0, digits.length - places) + "." + digits.slice(digits.length - places);
        text = text.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
        return text;
    }

    function sameNumber(left, right) {
        return Math.round(left * 1e6) === Math.round(right * 1e6);
    }

    function joinList(items) {
        if (items.length === 1) return items[0];
        return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
    }

    /* ---------------------------------------------------------------- division */

    /* Runs short division exactly as the lesson writes it: one column per digit,
       the remainder of each column carried into the next. With `extend` the
       dividend is given zeros after the point until the remainder reaches zero. */
    function buildDivision(dividendText, divisor, extend) {
        const text = String(dividendText);
        const dot = text.indexOf(".");
        const intText = dot === -1 ? text : text.slice(0, dot);
        const fracText = dot === -1 ? "" : text.slice(dot + 1);

        let extra = 0;
        if (extend) {
            let running = 0;
            (intText + fracText).split("").forEach(function (character) {
                running = (running * 10 + Number(character)) % divisor;
            });
            while (running !== 0 && extra < 8) {
                running = (running * 10) % divisor;
                extra += 1;
            }
        }

        const tokens = [];
        intText.split("").forEach(function (character) {
            tokens.push({ type: "digit", digit: Number(character), appended: false });
        });
        if (fracText || extra) tokens.push({ type: "point" });
        fracText.split("").forEach(function (character) {
            tokens.push({ type: "digit", digit: Number(character), appended: false });
        });
        for (let index = 0; index < extra; index += 1) {
            tokens.push({ type: "digit", digit: 0, appended: true });
        }

        const columns = [];
        let remainder = 0;
        let seen = 0;
        tokens.forEach(function (token) {
            if (token.type === "point") {
                columns.push({ type: "point" });
                return;
            }
            const current = remainder * 10 + token.digit;
            const carryIn = remainder;
            const quotient = Math.floor(current / divisor);
            remainder = current % divisor;
            columns.push({
                type: "digit",
                digit: token.digit,
                appended: token.appended,
                carryIn: carryIn,
                current: current,
                quotient: quotient,
                remainder: remainder,
                exponent: intText.length - 1 - seen,
                shown: true
            });
            seen += 1;
        });

        let firstShown = -1;
        let lastInteger = 0;
        columns.forEach(function (column, index) {
            if (column.type !== "digit") return;
            if (firstShown === -1 && column.quotient !== 0) firstShown = index;
            if (column.exponent >= 0) lastInteger = index;
        });
        if (firstShown === -1 || firstShown > lastInteger) firstShown = lastInteger;
        columns.forEach(function (column, index) {
            if (column.type === "digit") column.shown = index >= firstShown;
            else column.shown = index > firstShown;
        });

        let quotientText = "";
        columns.forEach(function (column) {
            if (!column.shown) return;
            quotientText += column.type === "point" ? "." : String(column.quotient);
        });

        let fullText = intText;
        if (fracText || extra) fullText += "." + fracText;
        for (let index = 0; index < extra; index += 1) fullText += "0";

        return {
            divisor: divisor,
            originalText: text,
            fullText: fullText,
            columns: columns,
            firstShown: firstShown,
            quotientText: quotientText,
            quotientValue: Number(quotientText),
            dividendValue: Number(text),
            remainder: remainder,
            exact: remainder === 0,
            appended: extra
        };
    }

    function digitColumns(layout) {
        return layout.columns.filter(function (column) { return column.type === "digit"; });
    }

    /* The lesson's first named slip: each digit divided on its own, with the
       carried remainder left out. */
    function ignoreCarryQuotient(layout) {
        let text = "";
        digitColumns(layout).forEach(function (column) {
            if (column.appended) return;
            text += String(Math.floor(column.digit / layout.divisor));
        });
        text = text.replace(/^0+(?=\d)/, "");
        return Number(text);
    }

    function dropInternalZeros(quotientText) {
        if (quotientText.indexOf(".") !== -1) return NaN;
        const stripped = quotientText.replace(/0/g, "");
        if (!stripped || stripped === quotientText) return NaN;
        return Number(stripped);
    }

    function firstCarry(layout) {
        const used = [];
        layout.columns.forEach(function (column, index) {
            if (column.type === "digit" && index >= layout.firstShown) used.push(column);
        });
        let fallback = null;
        for (let index = 0; index < used.length - 1; index += 1) {
            if (used[index].remainder === 0) continue;
            const pair = { from: used[index], into: used[index + 1] };
            if (!pair.into.appended) return pair;
            if (!fallback) fallback = pair;
        }
        return fallback;
    }

    function decimalPlaces(text) {
        const dot = String(text).indexOf(".");
        return dot === -1 ? 0 : String(text).length - dot - 1;
    }

    /* ---------------------------------------------------------------- display */

    function inlineDisplay(layout) {
        return {
            kind: "inline",
            text: formatNumberText(layout.originalText) + " ÷ " + layout.divisor,
            ariaLabel: formatNumberText(layout.originalText) + " divided by " + layout.divisor + "."
        };
    }

    /* The short-division set-out: divisor outside the bracket, dividend inside,
       carried remainders above the digits they join, quotient above the line. */
    function bracketDisplay(layout, options) {
        const settings = options || {};
        const cells = [];
        const spokenCarries = [];
        let hiddenQuotientPlace = "";
        let hiddenCarryPlace = "";

        layout.columns.forEach(function (column, index) {
            if (column.type === "point") {
                cells.push({ type: "point", quotient: column.shown ? "." : "", carry: null });
                return;
            }
            const cell = { type: "digit", digit: String(column.digit), quotient: "", carry: null };
            if (settings.emptyQuotient) {
                cell.quotient = "";
            } else if (column.shown) {
                if (index === settings.hideQuotientAt) {
                    cell.quotient = "box";
                    hiddenQuotientPlace = placeLabel(column.exponent);
                } else {
                    cell.quotient = String(column.quotient);
                }
            }
            if (settings.showCarries !== false && column.carryIn > 0) {
                if (index === settings.hideCarryAt) {
                    cell.carry = "box";
                    hiddenCarryPlace = placeLabel(column.exponent);
                } else {
                    cell.carry = String(column.carryIn);
                    spokenCarries.push(column.carryIn + " carried into the " + placeLabel(column.exponent) + " digit");
                }
            }
            cells.push(cell);
        });

        let label = "Short division: " + layout.divisor + " outside the bracket and "
            + formatNumberText(layout.fullText) + " inside";
        if (spokenCarries.length) label += ", with " + joinList(spokenCarries);
        label += ".";
        if (settings.emptyQuotient) {
            label += " The quotient line above the bracket is empty.";
        } else if (hiddenQuotientPlace) {
            const spoken = [];
            layout.columns.forEach(function (column, index) {
                if (!column.shown) return;
                if (column.type === "point") { spoken.push("a decimal point"); return; }
                spoken.push(index === settings.hideQuotientAt ? "an empty box" : String(column.quotient));
            });
            label += " The quotient above the line reads " + spoken.join(", then ")
                + ", and the empty box stands above the " + hiddenQuotientPlace + " digit.";
        } else {
            label += " The quotient above the line reads " + formatNumberText(layout.quotientText) + ".";
        }
        if (hiddenCarryPlace) {
            label += " The remainder carried into the " + hiddenCarryPlace + " digit is not written.";
        }
        if (settings.showCarries === false) label += " No remainders have been carried in yet.";

        return {
            kind: "bracket",
            divisor: String(layout.divisor),
            cells: cells,
            wideBox: Boolean(settings.emptyQuotient),
            ariaLabel: label
        };
    }

    /* ---------------------------------------------------------------- solutions */

    function columnSentence(layout, column, isLast, appendedIndex) {
        const place = placeLabel(column.exponent);
        let opening = "";
        if (column.appended) {
            opening = appendedIndex === 0
                ? "The digits of the dividend run out with " + column.carryIn
                    + " left over, so write a zero in the " + place + " place. "
                : "Write another zero in the " + place + " place. ";
        }
        const sum = formatNumberText(String(column.current)) + " " + place + " ÷ " + layout.divisor
            + " = " + column.quotient;
        if (column.remainder === 0) {
            return opening + sum + ". Write " + column.quotient + " above the " + place + " digit.";
        }
        if (isLast) {
            return opening + sum + " remainder " + column.remainder + ". Write " + column.quotient
                + " above the " + place + " digit; the " + column.remainder + " is what is left over.";
        }
        return opening + sum + " remainder " + column.remainder + ". Write " + column.quotient
            + " above the " + place + " digit and carry the " + column.remainder + " into the next place.";
    }

    function divisionSteps(layout, opening, closing) {
        const steps = [];
        if (opening) steps.push(opening);
        steps.push("Write " + layout.divisor + " outside the bracket and "
            + formatNumberText(layout.originalText)
            + " inside. Every quotient digit sits above the digit that made it.");
        if (layout.firstShown === 1) {
            const lead = layout.columns[0];
            const block = String(lead.digit) + String(layout.columns[1].digit);
            steps.push("The leading " + lead.digit + " is smaller than " + layout.divisor
                + ", so begin with the first two digits, " + block + ", rather than writing a leading zero.");
        }
        let appendedIndex = 0;
        const lastIndex = layout.columns.length - 1;
        layout.columns.forEach(function (column, index) {
            if (column.type === "point") {
                steps.push("The decimal point is not divided. Write it in the quotient directly above the point in the dividend.");
                return;
            }
            if (index < layout.firstShown) return;
            steps.push(columnSentence(layout, column, index === lastIndex, appendedIndex));
            if (column.appended) appendedIndex += 1;
        });
        steps.push(closing);
        return steps;
    }

    function inverseCheckStep(layout) {
        if (layout.exact) {
            return "Check by reversing it: " + formatNumberText(layout.quotientText) + " × " + layout.divisor
                + " = " + formatNumberText(layout.originalText) + ".";
        }
        return "Check by reversing it: " + formatNumberText(layout.quotientText) + " × " + layout.divisor
            + " + " + layout.remainder + " = " + formatNumberText(layout.originalText) + ".";
    }

    /* ---------------------------------------------------------------- hints */

    function quotientHints(layout) {
        const digits = digitColumns(layout);
        const start = layout.columns[layout.firstShown];
        const carry = firstCarry(layout);
        const opening = layout.firstShown === 1
            ? "The leading " + digits[0].digit + " is smaller than " + layout.divisor
                + ", so the first amount to divide is " + start.current + "."
            : "Start at the greatest place: how many whole " + layout.divisor + "s are in "
                + start.current + "?";
        const follow = carry
            ? "Dividing the " + placeLabel(carry.from.exponent) + " leaves " + carry.from.remainder
                + " over. That remainder joins the next digit, so the next amount to divide is "
                + carry.into.current + (carry.into.appended ? "." : ", not " + carry.into.digit + ".")
            : "Every place divides exactly here, so no remainder is carried. Keep one quotient digit above each digit of the dividend.";
        return [opening, follow];
    }

    function decimalHints(layout) {
        const digits = digitColumns(layout);
        let stopIndex = digits.length - 1;
        for (let index = 0; index < digits.length; index += 1) {
            if (digits[index].appended) { stopIndex = index - 1; break; }
        }
        const stop = digits[stopIndex < 0 ? 0 : stopIndex];
        const first = quotientHints(layout)[0];
        const follow = layout.appended
            ? "The written digits run out with " + stop.remainder
                + " left over. Adding a zero after the point does not change the dividend, and it turns that "
                + stop.remainder + " into " + stop.remainder * 10 + " in the next place."
            : "The point is not divided or carried: write it in the quotient directly above the point in the dividend, then carry on through the decimal places.";
        return [first, follow];
    }

    /* ---------------------------------------------------------------- guesses */

    function guessCollector(answer) {
        const guesses = [];
        const seen = [answer];
        return {
            list: guesses,
            add: function (raw, text) {
                if (!Number.isFinite(raw) || raw <= 0) return;
                const value = Math.round(raw * 1e6) / 1e6;
                if (seen.some(function (held) { return sameNumber(held, value); })) return;
                seen.push(value);
                guesses.push({ value: value, text: text });
            }
        };
    }

    function quotientGuesses(layout, answer) {
        const collector = guessCollector(answer);
        const carry = firstCarry(layout);
        const dividendShown = formatNumberText(layout.originalText);

        if (carry) {
            collector.add(ignoreCarryQuotient(layout), "Each place is divided together with the remainder carried into it. Dividing the "
                + placeLabel(carry.from.exponent) + " leaves " + carry.from.remainder + " over, so the next amount to divide is "
                + carry.into.current + (carry.into.appended
                    ? " " + placeLabel(carry.into.exponent) + "."
                    : ", not " + carry.into.digit + "."));
        }
        const dropped = dropInternalZeros(layout.quotientText);
        if (Number.isFinite(dropped)) {
            collector.add(dropped, "Once the quotient has begun, every place needs a digit, including zero. Reversing it exposes the gap: "
                + formatNumberText(String(dropped)) + " × " + layout.divisor + " = "
                + formatNumberText(String(dropped * layout.divisor)) + ", not " + dividendShown + ".");
        }
        collector.add(answer * 10, "The digits are right but the answer is ten times too big. Each quotient digit belongs directly above the digit that made it.");
        collector.add(answer / 10, "The digits are right but the answer is ten times too small. Each quotient digit belongs directly above the digit that made it.");
        collector.add(layout.dividendValue * layout.divisor, "That multiplies the two numbers. The bracket asks how many "
            + layout.divisor + "s are in " + dividendShown + ".");
        collector.add(layout.dividendValue - layout.divisor, "That subtracts the two numbers. The bracket asks how many "
            + layout.divisor + "s are in " + dividendShown + ".");
        return collector.list;
    }

    function decimalGuesses(layout, answer) {
        const guesses = quotientGuesses(layout, answer);
        const seen = guesses.map(function (guess) { return guess.value; }).concat([answer]);
        const add = function (raw, text) {
            if (!Number.isFinite(raw) || raw <= 0) return;
            const value = Math.round(raw * 1e6) / 1e6;
            if (seen.some(function (held) { return sameNumber(held, value); })) return;
            seen.push(value);
            guesses.push({ value: value, text: text });
        };
        const digits = digitColumns(layout);
        let stop = digits[digits.length - 1];
        for (let index = 0; index < digits.length; index += 1) {
            if (digits[index].appended) { stop = digits[index - 1]; break; }
        }
        const truncated = Math.floor(answer);
        add(truncated, layout.appended
            ? "That stops where the written digits run out. This answer is asked for exactly, so carry the "
                + stop.remainder + " left over into the next decimal place."
            : "That leaves out the decimal places. The digits after the point are divided in the same way, with the quotient's point directly above the dividend's.");
        const places = decimalPlaces(layout.quotientText);
        if (places > 1) {
            add(Math.round(answer * 10) / 10, "That is rounded to one decimal place. Keep dividing until the remainder reaches zero, and give every place of the exact answer.");
            add(Math.floor(answer * 10) / 10, "That stops one place early. The division is not finished until the remainder reaches zero.");
        }
        add(answer * 100, "The digits are right but the point has moved two places. It stays directly above the point in the dividend.");
        return guesses;
    }

    /* ---------------------------------------------------------------- questions */

    function makeQuestion(stage, family, rng) {
        const question = { stage: stage, family: family, answerKind: "number", mode: "single" };
        if (family === "fluency-carry") fillFluencyCarry(question, rng);
        else if (family === "fluency-zero") fillFluencyZero(question, rng);
        else if (family === "fluency-remainder") fillFluencyRemainder(question, rng);
        else if (family === "fluency-decimal") fillFluencyDecimal(question, rng);
        else if (family === "decimal-one-place") fillDecimalOnePlace(question, rng);
        else if (family === "decimal-extend") fillDecimalExtend(question, rng);
        else if (family === "decimal-eighths") fillDecimalEighths(question, rng);
        else if (family === "decimal-below-one") fillDecimalBelowOne(question, rng);
        else if (family === "missing-quotient-digit") fillMissingQuotientDigit(question, rng);
        else if (family === "missing-carry") fillMissingCarry(question, rng);
        else if (family === "carry-row") fillCarryRow(question, rng);
        else fillChooseQuotient(question, rng);
        return question;
    }

    function applyLayout(question, layout) {
        question.layout = layout;
        question.summaryLine = formatNumberText(layout.originalText) + " ÷ " + layout.divisor;
        question.factKey = question.family + ":" + layout.originalText + "/" + layout.divisor;
    }

    /* ------------------------------------------------- stage 1: place by place */

    function threeDigitQuotient(rng) {
        return randomInt(rng, 1, 9) * 100 + randomInt(rng, 1, 9) * 10 + randomInt(rng, 1, 9);
    }

    function fillFluencyCarry(question, rng) {
        const drawn = drawValid(function () {
            const divisor = randomInt(rng, 2, 9);
            const quotient = threeDigitQuotient(rng);
            return { divisor: divisor, dividend: quotient * divisor };
        }, function (candidate) {
            const layout = buildDivision(String(candidate.dividend), candidate.divisor, false);
            return digitColumns(layout).some(function (column) { return column.carryIn > 0; });
        }, { divisor: 6, dividend: 738 });

        const layout = buildDivision(String(drawn.dividend), drawn.divisor, false);
        applyLayout(question, layout);
        question.title = "Divide the two numbers";
        question.prompt = "Work out the quotient.";
        question.display = inlineDisplay(layout);
        question.answerLabel = "Your answer";
        question.answer = layout.quotientValue;
        question.answerShown = formatNumberText(layout.quotientText);
        question.printLine = "Calculation: " + question.summaryLine;
        question.hints = quotientHints(layout);
        question.steps = divisionSteps(layout, "",
            question.summaryLine + " = " + question.answerShown + ".").concat([inverseCheckStep(layout)]);
        question.guesses = quotientGuesses(layout, question.answer);
        question.correctText = "Right: " + question.summaryLine + " = " + question.answerShown
            + ", and every remainder was carried into the next place.";
    }

    function fillFluencyZero(question, rng) {
        const drawn = drawValid(function () {
            if (rng() < 0.4) {
                const lead = randomInt(rng, 1, 2);
                const ones = randomInt(rng, 1, 9);
                const quotient = lead * 1000 + ones;
                const divisor = randomInt(rng, 2, Math.floor(9999 / quotient));
                return { divisor: divisor, dividend: quotient * divisor, quotient: quotient };
            }
            const quotient = randomInt(rng, 1, 9) * 100 + randomInt(rng, 1, 9);
            const divisor = randomInt(rng, 2, 9);
            return { divisor: divisor, dividend: quotient * divisor, quotient: quotient };
        }, function (candidate) {
            return candidate.divisor >= 2 && candidate.dividend >= 100 && candidate.dividend <= 9999;
        }, { divisor: 4, dividend: 820, quotient: 205 });

        const layout = buildDivision(String(drawn.dividend), drawn.divisor, false);
        applyLayout(question, layout);
        question.title = "Divide the two numbers";
        question.prompt = "Work out the quotient.";
        question.display = inlineDisplay(layout);
        question.answerLabel = "Your answer";
        question.answer = layout.quotientValue;
        question.answerShown = formatNumberText(layout.quotientText);
        question.printLine = "Calculation: " + question.summaryLine;
        question.hints = quotientHints(layout);
        question.steps = divisionSteps(layout, "",
            question.summaryLine + " = " + question.answerShown + ".").concat([inverseCheckStep(layout)]);
        question.guesses = quotientGuesses(layout, question.answer);
        question.correctText = "Right: " + question.summaryLine + " = " + question.answerShown
            + ", with a zero holding every place that made no whole groups.";
    }

    function fillFluencyRemainder(question, rng) {
        const drawn = drawValid(function () {
            const divisor = randomInt(rng, 3, 9);
            const quotient = randomInt(rng, 21, 199);
            const remainder = randomInt(rng, 1, divisor - 1);
            return { divisor: divisor, dividend: quotient * divisor + remainder };
        }, function (candidate) {
            return candidate.dividend >= 100 && candidate.dividend <= 1799;
        }, { divisor: 6, dividend: 473 });

        const layout = buildDivision(String(drawn.dividend), drawn.divisor, false);
        applyLayout(question, layout);
        question.title = "Divide, and say what is left";
        question.prompt = "Work out the answer as a whole number with its remainder.";
        question.display = inlineDisplay(layout);
        question.mode = "parts";
        question.partsLegend = "The whole-number answer, and the amount left over";
        question.cells = [
            { label: "Whole-number answer", expected: layout.quotientValue, kind: "quotient" },
            { label: "Remainder", expected: layout.remainder, kind: "remainder" }
        ];
        question.answerLabel = "Your answer";
        question.answer = layout.quotientValue;
        question.answerShown = formatNumberText(layout.quotientText) + " remainder " + layout.remainder;
        question.printLine = "Calculation: " + question.summaryLine + " — answer with a remainder";
        question.hints = [
            quotientHints(layout)[0],
            "Work through every written digit first. Whatever is still standing at the ones once "
                + layout.divisor + " will not go into it again is the remainder, and it is always smaller than "
                + layout.divisor + "."
        ];
        question.steps = divisionSteps(layout, "",
            question.summaryLine + " = " + question.answerShown + ".").concat([inverseCheckStep(layout)]);
        question.guesses = quotientGuesses(layout, question.answer);
        question.correctText = "Right: " + question.summaryLine + " = " + question.answerShown
            + ", and " + inverseCheckStep(layout).replace("Check by reversing it: ", "");
    }

    function fillFluencyDecimal(question, rng) {
        const drawn = drawValid(function () {
            const divisor = randomInt(rng, 2, 9);
            const scaled = randomInt(rng, 21, 989);
            return { divisor: divisor, scaled: scaled, product: scaled * divisor };
        }, function (candidate) {
            if (candidate.scaled % 10 === 0) return false;
            if (candidate.product % 10 === 0) return false;
            const text = scaledToText(candidate.product, 1);
            return Number(text[0]) < candidate.divisor && candidate.product >= 100;
        }, { divisor: 9, scaled: 26, product: 234 });

        const layout = buildDivision(scaledToText(drawn.product, 1), drawn.divisor, false);
        applyLayout(question, layout);
        question.title = "Divide the two numbers";
        question.prompt = "Work out the quotient.";
        question.display = inlineDisplay(layout);
        question.answerLabel = "Your answer";
        question.answer = layout.quotientValue;
        question.answerShown = formatNumberText(layout.quotientText);
        question.printLine = "Calculation: " + question.summaryLine;
        question.hints = decimalHints(layout);
        question.steps = divisionSteps(layout, "",
            question.summaryLine + " = " + question.answerShown + ".").concat([inverseCheckStep(layout)]);
        question.guesses = decimalGuesses(layout, question.answer);
        question.correctText = "Right: " + question.summaryLine + " = " + question.answerShown
            + ", with the point kept on the same place-value boundary.";
    }

    /* ------------------------------------------------- stage 2: exact decimals */

    const TENTHS_TABLE = [
        { divisor: 2, fractions: [5] },
        { divisor: 4, fractions: [5] },
        { divisor: 5, fractions: [2, 4, 6, 8] },
        { divisor: 6, fractions: [5] },
        { divisor: 8, fractions: [5] }
    ];

    function finishDecimal(question, layout, title) {
        applyLayout(question, layout);
        question.title = title;
        question.prompt = "Work out the exact decimal answer.";
        question.display = inlineDisplay(layout);
        question.answerLabel = "Your answer";
        question.answer = layout.quotientValue;
        question.answerShown = formatNumberText(layout.quotientText);
        question.printLine = "Calculation: " + question.summaryLine + " — exact decimal answer";
        question.hints = decimalHints(layout);
        question.steps = divisionSteps(layout, "",
            question.summaryLine + " = " + question.answerShown + " exactly.").concat([inverseCheckStep(layout)]);
        question.guesses = decimalGuesses(layout, question.answer);
    }

    function fillDecimalOnePlace(question, rng) {
        const drawn = drawValid(function () {
            const entry = pick(TENTHS_TABLE, rng);
            const fraction = pick(entry.fractions, rng);
            const whole = randomInt(rng, 11, 99);
            const scaled = whole * 10 + fraction;
            return { divisor: entry.divisor, scaled: scaled, dividend: scaled * entry.divisor / 10 };
        }, function (candidate) {
            return Number.isInteger(candidate.dividend) && candidate.dividend >= 20;
        }, { divisor: 2, scaled: 435, dividend: 87 });

        const layout = buildDivision(String(drawn.dividend), drawn.divisor, true);
        finishDecimal(question, layout, "Divide exactly");
        question.correctText = "Right: " + question.summaryLine + " = " + question.answerShown
            + ", found by carrying the last remainder into the tenths.";
    }

    function fillDecimalExtend(question, rng) {
        const drawn = drawValid(function () {
            const entry = pick(TENTHS_TABLE, rng);
            const hundredth = pick(entry.fractions, rng);
            const whole = randomInt(rng, 1, 29);
            const tenth = randomInt(rng, 0, 9);
            const scaled = whole * 100 + tenth * 10 + hundredth;
            return { divisor: entry.divisor, scaled: scaled, product: scaled * entry.divisor };
        }, function (candidate) {
            return candidate.product % 10 === 0 && candidate.product % 100 !== 0 && candidate.product >= 1000;
        }, { divisor: 4, scaled: 215, product: 860 });

        const layout = buildDivision(scaledToText(drawn.product / 10, 1), drawn.divisor, true);
        finishDecimal(question, layout, "Divide exactly");
        question.correctText = "Right: " + question.summaryLine + " = " + question.answerShown
            + ". The written digits ran out first, so the dividend was extended with a zero.";
    }

    function fillDecimalEighths(question, rng) {
        const drawn = drawValid(function () {
            const whole = randomInt(rng, 2, 99);
            const remainder = pick([1, 3, 5, 7], rng);
            return { divisor: 8, dividend: whole * 8 + remainder };
        }, function (candidate) {
            return candidate.dividend >= 17 && candidate.dividend <= 799;
        }, { divisor: 8, dividend: 173 });

        const layout = buildDivision(String(drawn.dividend), drawn.divisor, true);
        finishDecimal(question, layout, "Divide exactly");
        question.correctText = "Right: " + question.summaryLine + " = " + question.answerShown
            + ". Eighths need three decimal places before the remainder reaches zero.";
    }

    function fillDecimalBelowOne(question, rng) {
        /* A dividend of at least 1 but smaller than the divisor, so the quotient
           is below 1 and needs the zero written before its point. */
        const layout = drawValid(function () {
            const divisor = pick([2, 4, 5, 6, 8], rng);
            const places = randomInt(rng, 1, 2);
            const unit = Math.pow(10, places);
            const scaled = randomInt(rng, unit, divisor * unit - 1);
            return buildDivision(scaledToText(scaled, places), divisor, true);
        }, function (candidate) {
            return candidate.exact && candidate.quotientValue < 1
                && Number(candidate.originalText) >= 1
                && decimalPlaces(candidate.quotientText) <= 3;
        }, buildDivision("3.6", 8, true));
        finishDecimal(question, layout, "Divide exactly");
        question.correctText = "Right: " + question.summaryLine + " = " + question.answerShown
            + ". The dividend is smaller than " + layout.divisor
            + ", so the quotient is below 1 and needs the zero before its point.";
    }

    /* ------------------------------------------------- stage 3: reading the layout */

    function structureLayout(rng) {
        return drawValid(function () {
            const divisor = randomInt(rng, 2, 9);
            const quotient = threeDigitQuotient(rng);
            return buildDivision(String(quotient * divisor), divisor, false);
        }, function (layout) {
            if (digitColumns(layout).length > 4) return false;
            return layout.columns.some(function (column, index) {
                return column.type === "digit" && column.carryIn > 0 && index > layout.firstShown;
            });
        }, buildDivision("738", 6, false));
    }

    function fillMissingQuotientDigit(question, rng) {
        const layout = structureLayout(rng);
        const shown = [];
        const carried = [];
        layout.columns.forEach(function (column, index) {
            if (column.type !== "digit" || !column.shown) return;
            shown.push(index);
            if (column.carryIn > 0) carried.push(index);
        });
        const choices = carried.length ? carried : (shown.length > 1 ? shown.slice(1) : shown);
        const hidden = choices[randomInt(rng, 0, choices.length - 1)];
        const column = layout.columns[hidden];
        const place = placeLabel(column.exponent);

        applyLayout(question, layout);
        question.factKey = question.family + ":" + layout.originalText + "/" + layout.divisor + "@" + hidden;
        question.title = "Complete the quotient";
        question.prompt = "One digit of the answer has not been written. Work out the digit that belongs in the empty box.";
        question.display = bracketDisplay(layout, { hideQuotientAt: hidden });
        question.answerKind = "digit";
        question.answerLabel = "The missing digit";
        question.answer = column.quotient;
        question.answerShown = String(column.quotient);
        question.printLine = "Calculation: " + question.summaryLine + " — one quotient digit is missing";
        question.hints = [
            "The empty box sits above the " + place + " digit, so it records how many whole "
                + layout.divisor + "s are in the amount standing at that place.",
            column.carryIn > 0
                ? "The " + column.carryIn + " carried in joins that digit, so the amount standing there is "
                    + column.current + ". Divide that by " + layout.divisor + "."
                : "Nothing was carried into that place, so the amount standing there is " + column.current
                    + ". Divide that by " + layout.divisor + "."
        ];
        question.steps = [
            "The empty box is above the " + place + " digit of the dividend.",
            column.carryIn > 0
                ? "The " + column.carryIn + " carried in joins that digit, so the amount to divide is "
                    + column.current + " " + place + "."
                : "Nothing was carried into that place, so the amount to divide is " + column.current + " " + place + ".",
            column.current + " ÷ " + layout.divisor + " = " + column.quotient
                + (column.remainder ? " remainder " + column.remainder : "") + ".",
            "The missing digit is " + column.quotient + ", which completes the quotient "
                + formatNumberText(layout.quotientText) + "."
        ];
        question.correctText = "Right: " + column.current + " " + place + " ÷ " + layout.divisor
            + " gives " + column.quotient + (column.quotient === 1 ? " whole group" : " whole groups")
            + (column.remainder ? " with " + column.remainder + " carried on" : " exactly") + ".";
        question.guesses = missingDigitGuesses(question, layout, column, "quotient");
    }

    function fillMissingCarry(question, rng) {
        const layout = structureLayout(rng);
        const candidates = [];
        layout.columns.forEach(function (column, index) {
            if (column.type === "digit" && column.carryIn > 0 && index > layout.firstShown) {
                candidates.push(index);
            }
        });
        const hidden = candidates[randomInt(rng, 0, candidates.length - 1)];
        const column = layout.columns[hidden];
        const source = layout.columns[hidden - 1];
        const place = placeLabel(column.exponent);
        const sourcePlace = placeLabel(source.exponent);

        applyLayout(question, layout);
        question.factKey = question.family + ":" + layout.originalText + "/" + layout.divisor + "@" + hidden;
        question.title = "Complete the carried remainder";
        question.prompt = "One carried remainder has not been written. Work out the digit that belongs in the empty box.";
        question.display = bracketDisplay(layout, { hideCarryAt: hidden });
        question.answerKind = "digit";
        question.answerLabel = "The carried digit";
        question.answer = column.carryIn;
        question.answerShown = String(column.carryIn);
        question.printLine = "Calculation: " + question.summaryLine + " — one carried remainder is missing";
        question.hints = [
            "A carried numeral records what was left after the place before it. Look at the "
                + sourcePlace + ", where " + source.current + " was divided by " + layout.divisor + ".",
            "The quotient digit above the " + sourcePlace + " is " + source.quotient + ", so "
                + layout.divisor + " × " + source.quotient + " = "
                + layout.divisor * source.quotient + " of those " + source.current
                + " have been used. A remainder is always smaller than " + layout.divisor + "."
        ];
        question.steps = [
            "A carried numeral is the remainder from the place to its left, renamed in the smaller place.",
            "At the " + sourcePlace + ", " + source.current + " ÷ " + layout.divisor + " = "
                + source.quotient + " remainder " + source.remainder + ".",
            "That " + source.remainder + " is carried into the " + place + " digit, making "
                + column.current + " " + place + " to divide.",
            "The missing carried digit is " + column.carryIn + "."
        ];
        question.correctText = "Right: " + source.current + " ÷ " + layout.divisor + " = "
            + source.quotient + " remainder " + source.remainder + ", and that " + source.remainder
            + " is what joins the " + place + " digit.";
        question.guesses = missingDigitGuesses(question, layout, column, "carry", source);
    }

    function missingDigitGuesses(question, layout, column, kind, source) {
        const collector = guessCollector(question.answer);
        const place = placeLabel(column.exponent);
        if (kind === "quotient") {
            collector.add(column.carryIn, "That is the remainder carried into this place, not the number of whole "
                + layout.divisor + "s in " + column.current + ".");
            collector.add(column.remainder, "That is what is left over at this place, not the number of whole "
                + layout.divisor + "s in " + column.current + ".");
            collector.add(Math.floor(column.digit / layout.divisor), "That divides the "
                + place + " digit on its own. The " + column.carryIn
                + " carried in joins it first, making " + column.current + ".");
            collector.add(column.current, "That is the amount standing at the " + place
                + " place. The box holds how many whole " + layout.divisor + "s fit inside it.");
            collector.add(layout.quotientValue, "That is the whole quotient. The box holds one digit of it.");
        } else {
            collector.add(column.quotient, "That is the answer digit written above this place, not the amount carried into it.");
            collector.add(source.quotient, "That is the answer digit for the place before, not what was left after it.");
            collector.add(source.digit, "That is the digit already written in the dividend. The carried numeral is what the division before it left over.");
            collector.add(column.current, "That is the amount to divide once the carry has joined, not the carried numeral itself.");
            collector.add(layout.divisor, "A remainder is always smaller than the divisor: if it were "
                + layout.divisor + ", another whole group could still be made.");
        }
        return collector.list;
    }

    function fillCarryRow(question, rng) {
        const exact = rng() < 0.5;
        /* Three places, each writing a quotient digit, so the three boxes line up
           with the three digits of the answer. */
        const layout = drawValid(function () {
            const divisor = randomInt(rng, 2, 9);
            const lead = randomInt(rng, divisor, 9);
            let dividend = lead * 100 + randomInt(rng, 0, 9) * 10 + randomInt(rng, 0, 9);
            if (exact) dividend -= dividend % divisor;
            return buildDivision(String(dividend), divisor, false);
        }, function (candidate) {
            const digits = digitColumns(candidate);
            return digits.length === 3 && digits[0].quotient > 0 && candidate.exact === exact
                && digits.some(function (column) { return column.remainder > 0; });
        }, buildDivision("984", 4, false));

        const digits = digitColumns(layout);
        applyLayout(question, layout);
        question.title = "Record what each place carries";
        question.prompt = "Divide place by place, and record only what is left over at each step.";
        question.display = bracketDisplay(layout, { showCarries: false, emptyQuotient: true });
        question.mode = "parts";
        question.partsLegend = "The remainder left at each place. Write 0 when a place divides exactly.";
        question.cells = digits.map(function (column, index) {
            return {
                label: index === digits.length - 1
                    ? "Left after the " + placeLabel(column.exponent)
                    : "Carried out of the " + placeLabel(column.exponent),
                expected: column.remainder,
                kind: "carry",
                column: column
            };
        });
        question.answerLabel = "Your remainders";
        question.answer = layout.quotientValue;
        question.answerShown = "remainders " + joinList(digits.map(function (column) {
            return String(column.remainder);
        }));
        question.printLine = "Calculation: " + question.summaryLine + " — record the remainder at each place";
        question.hints = [
            "Work left to right. At each place, divide the amount standing there by " + layout.divisor
                + " and write down only what will not fit into a whole group.",
            "A remainder is always smaller than " + layout.divisor
                + ", and a place that divides exactly leaves 0."
        ];
        question.steps = digits.map(function (column, index) {
            const last = index === digits.length - 1;
            let ending;
            if (column.remainder === 0) ending = last ? "nothing is left over" : "nothing is carried on";
            else if (last) ending = column.remainder + " is what is left over";
            else ending = column.remainder + " is carried into the next place";
            return column.current + " " + placeLabel(column.exponent) + " ÷ " + layout.divisor + " = "
                + column.quotient + " remainder " + column.remainder + ", so " + ending + ".";
        }).concat([
            layout.exact
                ? "The last remainder is 0, so " + question.summaryLine + " = "
                    + formatNumberText(layout.quotientText) + " exactly."
                : "The last remainder is " + layout.remainder + ", so " + question.summaryLine + " = "
                    + formatNumberText(layout.quotientText) + " remainder " + layout.remainder + "."
        ]);
        question.correctText = layout.exact
            ? "Right, and the last remainder is 0, so " + question.summaryLine + " = "
                + formatNumberText(layout.quotientText) + " exactly."
            : "Right, and the last remainder is " + layout.remainder + ", so " + question.summaryLine
                + " = " + formatNumberText(layout.quotientText) + " remainder " + layout.remainder + ".";
        question.guesses = [];
    }

    function fillChooseQuotient(question, rng) {
        const drawn = drawValid(function () {
            const quotient = randomInt(rng, 1, 9) * 100 + randomInt(rng, 1, 9);
            const divisor = randomInt(rng, 2, 9);
            return { divisor: divisor, dividend: quotient * divisor, quotient: quotient };
        }, function (candidate) {
            if (candidate.dividend < 100 || candidate.dividend > 9999) return false;
            const layout = buildDivision(String(candidate.dividend), candidate.divisor, false);
            return layout.quotientText.indexOf("0") > 0;
        }, { divisor: 4, dividend: 820, quotient: 205 });

        const layout = buildDivision(String(drawn.dividend), drawn.divisor, false);
        applyLayout(question, layout);
        const answer = layout.quotientValue;
        const dividendShown = formatNumberText(layout.originalText);

        const pool = [
            {
                value: dropInternalZeros(layout.quotientText),
                text: "Once the quotient has begun, every place needs a digit. Without the zero the other digits move into the wrong columns."
            },
            {
                value: ignoreCarryQuotient(layout),
                text: "Each place is divided together with the remainder carried into it, not on its own."
            },
            {
                value: answer * 10,
                text: "That has one digit too many. Each quotient digit belongs directly above the digit that made it."
            },
            {
                value: Number(layout.quotientText.replace(/0/g, "") + "0"),
                text: "The zero belongs at the place that made no whole groups, not at the end."
            }
        ];
        const distractors = [];
        pool.forEach(function (entry) {
            if (distractors.length >= 3) return;
            if (!Number.isFinite(entry.value) || entry.value <= 0) return;
            if (entry.value === answer) return;
            if (distractors.some(function (held) { return held.value === entry.value; })) return;
            distractors.push(entry);
        });
        let filler = answer + 1;
        while (distractors.length < 3) {
            const value = filler;
            filler += 1;
            if (value === answer || distractors.some(function (held) { return held.value === value; })) continue;
            distractors.push({
                value: value,
                text: "Check it by reversing the division: " + formatNumberText(String(value)) + " × "
                    + layout.divisor + " = " + formatNumberText(String(value * layout.divisor))
                    + ", not " + dividendShown + "."
            });
        }

        const correctText = "Right: every place has a digit, and reversing it agrees — "
            + formatNumberText(layout.quotientText) + " × " + layout.divisor + " = " + dividendShown + ".";
        const candidates = [{ value: answer, text: correctText, correct: true }].concat(
            distractors.map(function (entry) {
                return {
                    value: entry.value,
                    correct: false,
                    text: entry.text + " Reversing it shows the gap: " + formatNumberText(String(entry.value))
                        + " × " + layout.divisor + " = " + formatNumberText(String(entry.value * layout.divisor))
                        + ", not " + dividendShown + "."
                };
            })
        );

        const order = shuffleIndexes(candidates.length, rng);
        question.title = "Choose the quotient";
        question.prompt = "The answer line above the bracket is empty. Only one of these quotients belongs there.";
        question.display = bracketDisplay(layout, { emptyQuotient: true });
        question.mode = "choice";
        question.choiceLegend = "Which quotient belongs above the line?";
        question.compactValues = true;
        question.answerLabel = "Your choice";
        question.answer = answer;
        question.answerShown = formatNumberText(layout.quotientText);
        question.printLine = "Calculation: " + question.summaryLine + " — choose the quotient";
        question.options = order.map(function (index) { return formatNumberText(String(candidates[index].value)); });
        question.optionFeedback = order.map(function (index) { return candidates[index].text; });
        question.correctIndex = order.findIndex(function (index) { return candidates[index].correct; });
        question.correctText = correctText;
        question.hints = [
            "Read the carried numerals. They show that each place was divided together with what came into it from the left.",
            "Once the quotient has begun, every dividend digit produces one quotient digit, including a zero where a place makes no whole groups."
        ];
        question.steps = divisionSteps(layout, "",
            question.summaryLine + " = " + question.answerShown + ".").concat([inverseCheckStep(layout)]);
        question.guesses = [];
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

    function parseAmount(raw) {
        let text = String(raw === undefined || raw === null ? "" : raw).trim();
        if (!text) return { state: "blank" };
        text = text.replace(/[−–—]/g, "-").replace(/\s+/g, "");
        text = text.replace(/\.$/, "");
        if (!text) return { state: "blank" };
        if (/^-/.test(text)) return { state: "unreadable", reason: "negative" };
        if (/^\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(text)) text = text.replace(/,/g, "");
        if (/^\.\d+$/.test(text)) text = "0" + text;
        if (/^\d+(?:\.\d+)?$/.test(text)) {
            if (text.replace(".", "").length > 12) return { state: "unreadable", reason: "other" };
            return { state: "ok", value: Number(text), text: text };
        }
        if (/remainder|\br\b/i.test(text)) return { state: "unreadable", reason: "remainder" };
        return { state: "unreadable", reason: "other" };
    }

    function evaluateChoice(question, answer) {
        const raw = String(answer === undefined || answer === null ? "" : answer).trim();
        if (!raw) return { state: "blank", text: "Choose one of the quotients, then check it." };
        const index = Number(raw);
        if (!Number.isInteger(index) || index < 0 || index >= question.options.length) {
            return { state: "blank", text: "Choose one of the quotients, then check it." };
        }
        return {
            state: index === question.correctIndex ? "correct" : "incorrect",
            text: question.optionFeedback[index]
        };
    }

    function evaluateParts(question, answer) {
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
            const cleaned = value.replace(/,/g, "");
            return /^\d+$/.test(cleaned) ? Number(cleaned) : NaN;
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
        if (entered.some(function (value, index) { return Number.isNaN(numbers[index]); })) {
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
            text: partsFeedback(question, numbers, correctPositions),
            correctPositions: correctPositions
        };
    }

    function partsFeedback(question, numbers, correctPositions) {
        const layout = question.layout;
        const wrong = correctPositions.findIndex(function (value) { return value === false; });
        const cell = question.cells[wrong];
        const given = numbers[wrong];

        if (cell.kind === "remainder") {
            if (given >= layout.divisor) {
                return "A remainder is always smaller than the divisor. With " + given + " left, another whole "
                    + layout.divisor + " can still be taken out.";
            }
            if (correctPositions[0] === false) {
                return "Both parts need another look. Divide place by place first, then the amount still standing after the ones is the remainder.";
            }
            return "The whole-number answer is right. What is left after " + layout.divisor + " × "
                + formatNumberText(layout.quotientText) + " = "
                + formatNumberText(String(layout.divisor * layout.quotientValue)) + " has been taken from "
                + formatNumberText(layout.originalText) + "?";
        }

        if (cell.kind === "quotient") {
            const guess = (question.guesses || []).find(function (entry) { return sameNumber(entry.value, given); });
            if (guess) return guess.text;
            return "Check the whole-number answer again: divide from the greatest place, carrying each remainder into the next digit.";
        }

        const column = cell.column;
        const place = placeLabel(column.exponent);
        if (given >= layout.divisor) {
            return "The remainder at the " + place + " is not smaller than " + layout.divisor
                + ", so another whole group can still be made from " + column.current + ".";
        }
        if (given === column.quotient) {
            return "That is the answer digit for the " + place + ", not what is left over. "
                + column.current + " ÷ " + layout.divisor + " = " + column.quotient
                + " remainder " + column.remainder + ".";
        }
        if (given === column.digit) {
            return "That is the digit already written in the dividend. The box records what is left after "
                + column.current + " is divided by " + layout.divisor + ".";
        }
        if (given === column.carryIn) {
            return "That is what came into the " + place + " from the place before it. The box records what this place leaves behind.";
        }
        return "Look again at the " + place + ": " + column.current + " stands there once the carry has joined, and "
            + layout.divisor + " goes into it a whole number of times with something left.";
    }

    function evaluateResponse(question, raw) {
        if (question.mode === "choice") return evaluateChoice(question, raw);
        if (question.mode === "parts") return evaluateParts(question, raw);
        const parsed = parseAmount(raw);
        if (parsed.state === "blank") {
            return { state: "blank", text: "There is no answer to check yet." };
        }
        if (parsed.state === "unreadable") {
            if (parsed.reason === "negative") {
                return { state: "unreadable", text: "Both numbers are positive, so the answer is positive as well." };
            }
            if (parsed.reason === "remainder") {
                return { state: "unreadable", text: "This answer is asked for as a number on its own. Write the digits, with a decimal point if it needs one." };
            }
            return { state: "unreadable", text: "Write the answer in digits, with no other symbols." };
        }
        if (question.answerKind === "digit") {
            if (parsed.value === question.answer) return { state: "correct", text: question.correctText };
            /* A remainder that is not smaller than the divisor is the same slip
               whichever number happens to sit there, so it is answered first. */
            if (question.family === "missing-carry" && Number.isInteger(parsed.value)
                && parsed.value >= question.layout.divisor && parsed.value <= 9) {
                return {
                    state: "incorrect",
                    text: "A remainder is always smaller than the divisor. If " + parsed.value
                        + " were left, another whole " + question.layout.divisor + " could still be taken out."
                };
            }
            const match = (question.guesses || []).find(function (guess) { return sameNumber(guess.value, parsed.value); });
            if (match) return { state: "incorrect", text: match.text };
            if (!Number.isInteger(parsed.value) || parsed.value > 9) {
                return { state: "unreadable", text: "Each box in the layout holds one digit from 0 to 9." };
            }
            return { state: "incorrect", text: digitMiss(question, parsed.value) };
        }
        if (sameNumber(parsed.value, question.answer)) {
            return { state: "correct", text: question.correctText };
        }
        const match = (question.guesses || []).find(function (guess) { return sameNumber(guess.value, parsed.value); });
        if (match) return { state: "incorrect", text: match.text };
        return { state: "incorrect", text: genericMiss(question, parsed) };
    }

    function digitMiss(question, value) {
        const layout = question.layout;
        if (value >= layout.divisor && question.family === "missing-carry") {
            return "A remainder is always smaller than " + layout.divisor
                + ". If it were " + value + ", another whole group could still be made.";
        }
        return "Not that digit. Work out the amount standing at that place once the carry has joined it, then divide it by "
            + layout.divisor + ".";
    }

    function genericMiss(question, parsed) {
        const layout = question.layout;
        const answerPlaces = decimalPlaces(layout.quotientText);
        const givenPlaces = decimalPlaces(parsed.text);
        if (answerPlaces > 0 && givenPlaces === 0) {
            return "This answer needs decimal places. Keep dividing past the point until the remainder reaches zero.";
        }
        if (parsed.value > question.answer * 9) {
            return "That is far larger than the quotient can be: dividing by " + layout.divisor
                + " makes " + formatNumberText(layout.originalText) + " smaller, not bigger.";
        }
        if (parsed.value < question.answer / 9) {
            return "That is far smaller than the quotient should be. Check that every digit after the first has produced a digit in the answer.";
        }
        if (parsed.value > question.answer) {
            return "That is a little too large. Check each place in turn: the amount divided there is the digit plus whatever was carried into it.";
        }
        return "That is a little too small. Check each place in turn: the amount divided there is the digit plus whatever was carried into it.";
    }

    /* ---------------------------------------------------------------- checks */

    function validateQuestion(question) {
        const problems = [];
        const copy = [question.title, question.prompt, question.answerLabel || "", question.partsLegend || "",
            question.choiceLegend || ""]
            .concat(question.hints || [])
            .concat(question.steps || [])
            .concat((question.guesses || []).map(function (guess) { return guess.text; }))
            .concat(question.options || [])
            .concat(question.optionFeedback || [])
            .concat((question.cells || []).map(function (cell) { return cell.label; }))
            .concat([question.correctText, question.summaryLine, question.answerShown,
                question.display ? question.display.ariaLabel : ""]);
        copy.forEach(function (text) {
            const value = String(text);
            if (/undefined|NaN|\[object|Infinity/.test(value)) problems.push("Bad copy: " + value);
            if (/\s\s/.test(value)) problems.push("Double space: " + value);
            if (/\b(fail|failed|weak|wrong again|careless|silly)\b/i.test(value)) {
                problems.push("Judgemental copy: " + value);
            }
        });
        const lowest = question.answerKind === "digit" ? 0 : Number.MIN_VALUE;
        if (!Number.isFinite(question.answer) || question.answer < lowest) {
            problems.push("Answer is not a positive number.");
        }
        const layout = question.layout;
        if (layout) {
            const rebuilt = digitColumns(layout).reduce(function (running, column) {
                return running * 10 + column.digit;
            }, 0);
            const expected = Number(layout.fullText.replace(".", ""));
            if (rebuilt !== expected) problems.push("Columns do not rebuild the dividend.");
            const check = layout.quotientValue * layout.divisor + layout.remainder;
            if (!sameNumber(check, Number(layout.fullText))) problems.push("Quotient does not reverse to the dividend.");
        }
        if (question.mode === "choice") {
            if (question.correctIndex < 0 || question.correctIndex >= question.options.length) {
                problems.push("Choice has no correct option.");
            }
            if (new Set(question.options).size !== question.options.length) {
                problems.push("Duplicate option value.");
            }
            if (question.options[question.correctIndex] !== formatNumberText(String(question.answer))) {
                problems.push("Correct option does not hold the answer.");
            }
        }
        if (question.mode === "parts") {
            question.cells.forEach(function (cell) {
                if (!Number.isInteger(cell.expected) || cell.expected < 0) {
                    problems.push("Part expects a value that is not a whole number.");
                }
            });
        }
        if (question.answerKind === "digit" && (question.answer < 0 || question.answer > 9)) {
            problems.push("Digit answer is outside 0 to 9.");
        }
        (question.guesses || []).forEach(function (guess) {
            if (sameNumber(guess.value, question.answer)) problems.push("A misconception value equals the answer.");
        });
        const values = (question.guesses || []).map(function (guess) { return guess.value; });
        if (new Set(values).size !== values.length) problems.push("Duplicate misconception value.");
        (question.hints || []).forEach(function (hint) {
            if (question.mode === "single" && question.answerKind === "number"
                && String(hint).indexOf(formatNumberText(question.layout.quotientText)) !== -1) {
                problems.push("A hint gives the answer away.");
            }
        });
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
                    if (evaluateResponse(question, question.answerShown.replace(/,/g, "")).state !== "correct") {
                        problems.push("Seed " + seed + " Q" + (index + 1) + ": exact answer rejected.");
                    }
                }
                if (question.mode === "parts") {
                    const exact = question.cells.map(function (cell) { return String(cell.expected); });
                    if (evaluateResponse(question, exact).state !== "correct") {
                        problems.push("Seed " + seed + " Q" + (index + 1) + ": exact parts rejected.");
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
        buildDivision: buildDivision,
        buildRound: buildRound,
        createSeededRandom: createSeededRandom,
        evaluateResponse: evaluateResponse,
        formatNumberText: formatNumberText,
        generateQuestion: generateQuestion,
        makeQuestion: makeQuestion,
        parseAmount: parseAmount,
        scaledToText: scaledToText,
        selfCheck: selfCheck,
        validateQuestion: validateQuestion
    };

    scope.ShortDivisionPractice = api;
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
        return "Your answer: " + String(answer).trim();
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
            expression.style.removeProperty("--div-cols");
            expression.hidden = !display;
            if (!display) {
                expression.removeAttribute("role");
                expression.removeAttribute("aria-label");
                return;
            }
            expression.setAttribute("role", "img");
            expression.setAttribute("aria-label", display.ariaLabel);
            if (display.kind === "inline") {
                expression.classList.add("practice-divide--inline");
                expression.textContent = display.text;
                return;
            }
            expression.classList.add("practice-divide");
            expression.style.setProperty("--div-cols", String(display.cells.length));
            expression.appendChild(element("span", "practice-divide__slot"));
            if (display.wideBox) {
                const box = element("span", "practice-divide__wide-box");
                box.setAttribute("aria-hidden", "true");
                expression.appendChild(box);
            } else {
                display.cells.forEach(function (cell) {
                    const node = element("span", "practice-divide__q");
                    if (cell.type === "point") node.classList.add("is-point");
                    if (cell.quotient === "box") {
                        const box = element("i", "practice-divide__box");
                        box.setAttribute("aria-hidden", "true");
                        node.appendChild(box);
                    } else {
                        node.textContent = cell.quotient;
                    }
                    expression.appendChild(node);
                });
            }
            expression.appendChild(element("span", "practice-divide__divisor", display.divisor));
            display.cells.forEach(function (cell, index) {
                const node = element("span", "practice-divide__cell");
                if (index === 0) node.classList.add("is-first");
                if (cell.type === "point") {
                    node.classList.add("is-point");
                    node.textContent = ".";
                    expression.appendChild(node);
                    return;
                }
                if (cell.carry === "box") {
                    /* The box sits in the carried numeral's own slot, so it lands
                       exactly where the missing numeral would have been written. */
                    const slot = element("i", "practice-divide__carry");
                    slot.setAttribute("aria-hidden", "true");
                    slot.appendChild(element("span", "practice-divide__carry-box"));
                    node.appendChild(slot);
                } else if (cell.carry !== null) {
                    node.appendChild(element("i", "practice-divide__carry", cell.carry));
                }
                node.appendChild(element("b", "practice-divide__digit", cell.digit));
                expression.appendChild(node);
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
            partsField.hidden = currentQuestion.mode !== "parts";
            if (currentQuestion.mode === "single") {
                input.value = currentState.answer;
                input.inputMode = currentQuestion.answerKind === "digit" ? "numeric" : "decimal";
                singleWrap.classList.toggle("is-digit", currentQuestion.answerKind === "digit");
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
