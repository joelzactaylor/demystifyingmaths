(function (scope) {
    "use strict";

    const STAGES = [
        { name: "Running through the zeros", lessonAnchor: "in-the-columns" },
        { name: "Zeros made by padding", lessonAnchor: "zeros-in-a-decimal" },
        { name: "Zeros in context", lessonAnchor: "exchanging-across-zeroes-in-context" }
    ];
    const LESSON_URL = "/demystifyingmaths/pages/curriculum/GCSE/number/structure/writtenMethods/exchangingAcrossZeros.html";
    const PLACE_WORDS = ["ones", "tens", "hundreds", "thousands", "ten-thousands"];
    const DECIMAL_WORDS = ["tenths", "hundredths", "thousandths"];
    const PLACE_SINGULAR = ["unit", "ten", "hundred", "thousand", "ten-thousand"];
    const DECIMAL_SINGULAR = ["tenth", "hundredth", "thousandth"];
    const PLACE_SHORT = ["1s", "10s", "100s", "1000s", "10000s"];
    const DECIMAL_SHORT = ["0.1s", "0.01s", "0.001s"];

    function placeWord(exponent) {
        return exponent >= 0 ? PLACE_WORDS[exponent] : DECIMAL_WORDS[-exponent - 1];
    }

    function placeSingular(exponent) {
        return exponent >= 0 ? PLACE_SINGULAR[exponent] : DECIMAL_SINGULAR[-exponent - 1];
    }

    function placeShort(exponent) {
        return exponent >= 0 ? PLACE_SHORT[exponent] : DECIMAL_SHORT[-exponent - 1];
    }

    function joinWords(words) {
        if (words.length <= 1) return words.join("");
        return words.slice(0, -1).join(", ") + " and " + words[words.length - 1];
    }

    function randomInt(rng, min, max) {
        return min + Math.min(max - min, Math.floor(Math.max(0, rng()) * (max - min + 1)));
    }

    function pick(values, rng) {
        return values[randomInt(rng, 0, values.length - 1)];
    }

    function formatMinor(minor, places, fixed) {
        const scale = Math.pow(10, places);
        const whole = Math.floor(minor / scale);
        if (!places) return whole.toLocaleString("en-GB");
        let decimal = String(minor % scale).padStart(places, "0");
        if (!fixed) decimal = decimal.replace(/0+$/, "");
        return whole.toLocaleString("en-GB") + (decimal ? "." + decimal : "");
    }

    function splitNumber(text) {
        const point = text.indexOf(".");
        if (point < 0) return { whole: text, fraction: "" };
        return { whole: text.slice(0, point), fraction: text.slice(point) };
    }

    function spokenNumber(text) {
        return text.replace(/,/g, "").replace(".", " point ");
    }

    /* The written method itself: every column, its exchange and the row of
       digits standing above the top line once the run is complete. */
    function subtractionData(aMinor, bMinor, places) {
        const width = Math.max(String(aMinor).length, String(bMinor).length);
        const aDigits = String(aMinor).padStart(width, "0").split("").map(Number);
        const bDigits = String(bMinor).padStart(width, "0").split("").map(Number);
        const working = aDigits.slice();
        const operations = [];
        const gave = new Set();
        const stepped = new Set();
        let exchangeCount = 0;
        let runCount = 0;

        for (let index = width - 1; index >= 0; index -= 1) {
            const standing = working[index];
            let donor = null;
            const passed = [];

            if (standing < bDigits[index]) {
                donor = index - 1;
                while (donor >= 0 && working[donor] === 0) {
                    passed.unshift(donor);
                    donor -= 1;
                }
                if (donor < 0) return { valid: false };
                working[donor] -= 1;
                passed.forEach(function (column) {
                    working[column] = 9;
                    stepped.add(column);
                });
                working[index] += 10;
                exchangeCount += 1;
                gave.add(donor);
                if (passed.length) runCount += 1;
            }

            operations.push({
                index: index,
                exponent: width - index - 1 - places,
                standing: standing,
                bottom: bDigits[index],
                top: working[index],
                donor: donor,
                donorBefore: donor === null ? null : working[donor] + 1,
                donorAfter: donor === null ? null : working[donor],
                passed: passed.slice(),
                resultDigit: working[index] - bDigits[index]
            });
        }

        operations.forEach(function (operation) {
            operation.gaveAway = gave.has(operation.index);
            operation.steppedThrough = stepped.has(operation.index);
        });

        return {
            valid: true,
            width: width,
            places: places,
            aDigits: aDigits,
            bDigits: bDigits,
            working: working,
            operations: operations,
            exchangeCount: exchangeCount,
            runCount: runCount,
            acrossZero: runCount > 0
        };
    }

    function runDetail(calculation) {
        const operation = calculation.operations.find(function (item) {
            return item.donor !== null && item.passed.length > 0;
        });
        if (!operation) return null;
        const width = calculation.width;
        const places = calculation.places;
        const exponentOf = function (index) { return width - index - 1 - places; };
        return {
            askingIndex: operation.index,
            askingExponent: operation.exponent,
            donorIndex: operation.donor,
            donorExponent: exponentOf(operation.donor),
            donorBefore: operation.donorBefore,
            donorAfter: operation.donorAfter,
            passedIndexes: operation.passed.slice(),
            passedExponents: operation.passed.map(exponentOf),
            bottom: operation.bottom,
            top: operation.top
        };
    }

    /* Builds a subtraction whose only exchange is one run travelling from the
       final column, through the empty columns, to `donorIndex`. */
    function buildSingleRun(rng, aDigits, donorIndex) {
        const width = aDigits.length;
        const bDigits = new Array(width).fill(0);
        const ceiling = function (index) {
            if (index === width - 1) return 9;
            if (index > donorIndex) return 9;
            if (index === donorIndex) return aDigits[donorIndex] - 1;
            return aDigits[index];
        };

        bDigits[width - 1] = randomInt(rng, aDigits[width - 1] + 1, 9);
        for (let index = donorIndex + 1; index < width - 1; index += 1) bDigits[index] = randomInt(rng, 0, 9);
        if (donorIndex < width - 1) bDigits[donorIndex] = randomInt(rng, 0, aDigits[donorIndex] - 1);
        for (let index = 0; index < donorIndex; index += 1) bDigits[index] = randomInt(rng, 0, aDigits[index]);

        // Keep the lower number within one column of the upper number's width.
        if (width > 2 && bDigits[0] === 0 && bDigits[1] === 0) {
            if (ceiling(1) >= 1) bDigits[1] = randomInt(rng, 1, ceiling(1));
            else if (ceiling(0) >= 1) bDigits[0] = randomInt(rng, 1, ceiling(0));
        }

        return [Number(aDigits.join("")), Number(bDigits.join(""))];
    }

    function integerShape(rng, key) {
        if (key === "d00") return { digits: [randomInt(rng, 2, 8), 0, 0], donor: 0 };
        if (key === "d000") return { digits: [randomInt(rng, 2, 8), 0, 0, 0], donor: 0 };
        if (key === "de00") return { digits: [randomInt(rng, 1, 9), randomInt(rng, 2, 8), 0, 0], donor: 1 };
        if (key === "de000") return { digits: [randomInt(rng, 1, 9), randomInt(rng, 2, 8), 0, 0, 0], donor: 1 };
        if (key === "def00") return { digits: [randomInt(rng, 1, 9), randomInt(rng, 0, 9), randomInt(rng, 2, 8), 0, 0], donor: 2 };
        if (key === "d00u") return { digits: [randomInt(rng, 2, 8), 0, 0, randomInt(rng, 1, 7)], donor: 0 };
        return { digits: [randomInt(rng, 2, 8), 0, 0, 0, randomInt(rng, 1, 7)], donor: 0 };
    }

    function decimalShape(rng, key) {
        if (key === "whole1") return { digits: [randomInt(rng, 2, 8), 0, 0, 0], donor: 0 };
        if (key === "whole2") return { digits: [randomInt(rng, 1, 4), randomInt(rng, 2, 8), 0, 0, 0], donor: 1 };
        if (key === "wholeTens") return { digits: [randomInt(rng, 2, 8), 0, 0, 0, 0], donor: 0 };
        if (key === "tenths1") return { digits: [randomInt(rng, 1, 9), randomInt(rng, 2, 8), 0, 0], donor: 1 };
        return { digits: [randomInt(rng, 1, 4), randomInt(rng, 1, 9), randomInt(rng, 2, 8), 0, 0], donor: 2 };
    }

    function moneyShape(rng) {
        // Cash is handed over in notes, so the amount paid is a multiple of five pounds.
        const pounds = randomInt(rng, 2, 9);
        if (randomInt(rng, 0, 1)) return { digits: [pounds, 0, 0, 0], donor: 0 };
        return { digits: [pounds, 5, 0, 0], donor: 1 };
    }

    /* 4.03 - 1.276: an ordinary exchange first, then a run through the tenths. */
    function buildPaddedPair(rng, withTens) {
        const tens = withTens ? randomInt(rng, 1, 4) : 0;
        const ones = randomInt(rng, 2, 9);
        const hundredths = randomInt(rng, 1, 9);
        const aDigits = (withTens ? [tens] : []).concat([ones, 0, hundredths, 0]);
        const bDigits = (withTens ? [randomInt(rng, 0, tens)] : []).concat([
            randomInt(rng, 1, ones - 1),
            randomInt(rng, 0, 9),
            randomInt(rng, hundredths, 9),
            randomInt(rng, 1, 9)
        ]);
        return [Number(aDigits.join("")), Number(bDigits.join(""))];
    }

    function rowValue(topRow, bDigits) {
        let total = 0;
        for (let index = 0; index < topRow.length; index += 1) {
            const digit = topRow[index] - bDigits[index];
            if (digit < 0) return null;
            total += digit * Math.pow(10, topRow.length - index - 1);
        }
        return total;
    }

    function resultValue(digits) {
        return digits.reduce(function (total, digit, index) {
            return total + digit * Math.pow(10, digits.length - index - 1);
        }, 0);
    }

    function misreadPaddingMinor(aMinor, places, shownPlaces) {
        // 4.03 padded on the wrong side becomes 4.003 rather than 4.030.
        if (shownPlaces >= places) return null;
        const scale = Math.pow(10, places);
        const whole = Math.floor(aMinor / scale);
        const shown = String(Math.floor((aMinor % scale) / Math.pow(10, places - shownPlaces))).padStart(shownPlaces, "0");
        return whole * scale + Number(shown);
    }

    function buildSteps(question) {
        const steps = [];
        const calculation = question.calculation;

        if (question.padded) {
            steps.push("Give both numbers the same number of decimal places: " + question.aText + " becomes " +
                question.alignedA + ", written under " + question.alignedB + " with the decimal points in line.");
        } else {
            steps.push("Set the subtraction out with equal place values in line: " + question.alignedA + " − " + question.alignedB + ".");
        }

        calculation.operations.forEach(function (operation) {
            const name = placeWord(operation.exponent);
            if (operation.donor !== null && operation.passed.length) {
                const passedNames = operation.passed.map(function (index) {
                    return placeWord(calculation.width - index - 1 - calculation.places);
                }).reverse();
                const donorName = placeWord(calculation.width - operation.donor - 1 - calculation.places);
                steps.push("The " + name + " column holds " + operation.standing + " and cannot pay " + operation.bottom +
                    ". The " + joinWords(passedNames) + " " + (passedNames.length === 1 ? "column is" : "columns are") +
                    " empty, so the request travels on to the " + donorName + " column. That " + operation.donorBefore +
                    " becomes " + operation.donorAfter + ", each column on the way becomes 9, and the " + name +
                    " column becomes " + operation.top + ". Then " + operation.top + " − " + operation.bottom +
                    " = " + operation.resultDigit + ".");
            } else if (operation.donor !== null) {
                const donorName = placeWord(calculation.width - operation.donor - 1 - calculation.places);
                steps.push("The " + name + " column holds " + operation.standing + " and cannot pay " + operation.bottom +
                    ". Exchange one " + placeSingular(calculation.width - operation.donor - 1 - calculation.places) +
                    " from the " + donorName + " column: that " + operation.donorBefore + " becomes " + operation.donorAfter +
                    " and this column becomes " + operation.top + ". Then " + operation.top + " − " + operation.bottom +
                    " = " + operation.resultDigit + ".");
            } else if (operation.gaveAway) {
                steps.push("The " + name + " column gave one " + placeSingular(operation.exponent) + " to the run, so it now holds " +
                    operation.standing + ". " + operation.standing + " − " + operation.bottom + " = " + operation.resultDigit + ".");
            } else if (operation.steppedThrough) {
                steps.push("The " + name + " column was rewritten as 9 when the exchange passed through it. 9 − " +
                    operation.bottom + " = " + operation.resultDigit + ".");
            } else {
                steps.push("In the " + name + " column, " + operation.top + " − " + operation.bottom + " = " + operation.resultDigit + ".");
            }
        });

        steps.push(question.closingStep);
        steps.push("Check by adding: " + question.checkDifference + " + " + question.checkSubtrahend + " = " + question.checkMinuend + ".");
        return steps;
    }

    function gridCells(calculation) {
        return calculation.aDigits.map(function (digit, index) {
            return {
                exponent: calculation.width - index - 1 - calculation.places,
                was: String(digit),
                expected: String(calculation.working[index]),
                donor: false,
                stepped: false,
                asking: index === calculation.width - 1
            };
        });
    }

    function decorateCells(cells, detail, calculation) {
        cells[detail.donorIndex].donor = true;
        detail.passedIndexes.forEach(function (index) { cells[index].stepped = true; });
        cells[calculation.width - 1].asking = true;
        return cells;
    }

    function makeQuestion(stage, family, rng) {
        const question = {
            stage: stage,
            family: family,
            mode: "single",
            unitPrefix: "",
            unitSuffix: "",
            unitLabel: "",
            answerLabel: "Your answer",
            answerNoun: "difference",
            padded: false,
            showExpression: true
        };
        let aMinor = 0;
        let bMinor = 0;
        let places = 0;

        if (stage === 0 && family === 0) {
            const shape = integerShape(rng, pick(["d00", "d000", "de00"], rng));
            const pair = buildSingleRun(rng, shape.digits, shape.donor);
            aMinor = pair[0];
            bMinor = pair[1];
            question.title = "Subtract the two numbers";
            question.prompt = "Work out the difference.";
        } else if (stage === 0 && family === 1) {
            const shape = integerShape(rng, pick(["d000", "de00", "d00u", "de000"], rng));
            const pair = buildSingleRun(rng, shape.digits, shape.donor);
            aMinor = pair[0];
            bMinor = pair[1];
            question.mode = "grid";
            question.title = "Rewrite the top line";
            question.answerNoun = "rewritten top line";
        } else if (stage === 0 && family === 2) {
            const shape = integerShape(rng, pick(["d000", "de00", "de000", "d00u"], rng));
            const pair = buildSingleRun(rng, shape.digits, shape.donor);
            aMinor = pair[0];
            bMinor = pair[0] - pair[1];
            question.missingPart = pair[1];
            question.title = "Find the number that was taken away";
            question.answerNoun = "missing number";
            question.answerLabel = "The number taken away";
        } else if (stage === 0 && family === 3) {
            const shape = integerShape(rng, pick(["d000", "de00", "d00u", "de000"], rng));
            const pair = buildSingleRun(rng, shape.digits, shape.donor);
            aMinor = pair[0];
            bMinor = pair[1];
            question.mode = "choice";
            question.choiceKind = "line";
            question.title = "Choose the rewritten top line";
            question.answerNoun = "rewritten top line";
        } else if (stage === 1 && family === 0) {
            const pair = buildPaddedPair(rng, randomInt(rng, 0, 1) === 1);
            aMinor = pair[0];
            bMinor = pair[1];
            places = 3;
            question.title = "Subtract the two numbers";
            question.prompt = "Work out the difference.";
        } else if (stage === 1 && family === 1) {
            const shape = decimalShape(rng, pick(["whole1", "whole2", "wholeTens"], rng));
            const pair = buildSingleRun(rng, shape.digits, shape.donor);
            aMinor = pair[0];
            bMinor = pair[1];
            places = 3;
            question.mode = "grid";
            question.title = "Rewrite the top line";
            question.answerNoun = "rewritten top line";
        } else if (stage === 1 && family === 2) {
            const shape = decimalShape(rng, pick(["tenths1", "tenths2", "whole2", "wholeTens"], rng));
            const pair = buildSingleRun(rng, shape.digits, shape.donor);
            aMinor = pair[0];
            bMinor = pair[1];
            places = 3;
            question.title = "Subtract the two numbers";
            question.prompt = "Work out the difference.";
        } else if (stage === 1 && family === 3) {
            const shape = decimalShape(rng, pick(["whole2", "wholeTens", "tenths2"], rng));
            const pair = buildSingleRun(rng, shape.digits, shape.donor);
            aMinor = pair[0];
            bMinor = pair[1];
            places = 3;
            question.mode = "choice";
            question.choiceKind = "donor";
            question.title = "Find where the exchange comes from";
            question.answerNoun = "giving column";
        } else if (stage === 2 && family === 0) {
            // Cash for a bill: keep the change to something a till would hand back.
            let pair = null;
            for (let attempt = 0; attempt < 12; attempt += 1) {
                const shape = moneyShape(rng);
                pair = buildSingleRun(rng, shape.digits, shape.donor);
                if (pair[0] - pair[1] <= 3000) break;
            }
            aMinor = pair[0];
            bMinor = pair[1];
            places = 2;
            question.showExpression = false;
            question.unitPrefix = "£";
            question.unitLabel = "pounds";
            question.title = "Work out the change";
            question.answerNoun = "change";
            question.answerLabel = "Change given";
        } else if (stage === 2 && family === 1) {
            const pair = buildPaddedPair(rng, false);
            aMinor = pair[0];
            bMinor = pair[1];
            places = 3;
            question.showExpression = false;
            question.unitSuffix = "m";
            question.unitLabel = "metres";
            question.title = "Work out the length left";
            question.answerNoun = "length remaining";
            question.answerLabel = "Length remaining";
        } else if (stage === 2 && family === 2) {
            const shape = integerShape(rng, pick(["d000", "de00", "de000"], rng));
            const pair = buildSingleRun(rng, shape.digits, shape.donor);
            aMinor = pair[0];
            bMinor = pair[1];
            question.showExpression = false;
            question.title = "Work out how many are left";
            question.answerNoun = "number of leaflets left";
            question.answerLabel = "Leaflets left";
        } else {
            const shape = decimalShape(rng, "whole1");
            const pair = buildSingleRun(rng, shape.digits, shape.donor);
            aMinor = pair[0];
            bMinor = pair[1];
            places = 3;
            question.showExpression = false;
            question.unitSuffix = "kg";
            question.unitLabel = "kilograms";
            question.title = "Work out the mass left";
            question.answerNoun = "mass remaining";
            question.answerLabel = "Mass remaining";
        }

        const calculation = subtractionData(aMinor, bMinor, places);
        const detail = runDetail(calculation);
        const differenceMinor = aMinor - bMinor;
        const aText = formatMinor(aMinor, places, false);
        const bText = formatMinor(bMinor, places, places > 0);
        const alignedA = formatMinor(aMinor, places, true);
        const alignedB = formatMinor(bMinor, places, true);
        const differenceText = formatMinor(differenceMinor, places, false);
        const fixedDifference = formatMinor(differenceMinor, places, places > 0);

        const shownPlaces = (aText.split(".")[1] || "").length;
        question.places = places;
        question.shownPlaces = shownPlaces;
        question.padded = places > shownPlaces;
        question.aMinor = aMinor;
        question.bMinor = bMinor;
        question.differenceMinor = differenceMinor;
        question.calculation = calculation;
        question.detail = detail;
        question.aText = aText;
        question.bText = bText;
        question.alignedA = alignedA;
        question.alignedB = alignedB;
        question.checkDifference = fixedDifference;
        question.checkSubtrahend = formatMinor(bMinor, places, places > 0);
        question.checkMinuend = formatMinor(aMinor, places, places > 0);
        question.factKey = stage + ":" + family + ":" + aMinor + ":" + bMinor + ":" + places;
        question.summaryLine = aText + " − " + bText;
        question.answerShown = question.unitPrefix +
            (question.unitPrefix ? formatMinor(differenceMinor, places, true) : differenceText) +
            (question.unitSuffix ? " " + question.unitSuffix : "");

        const donorWord = detail ? placeWord(detail.donorExponent) : "";
        const askingWord = detail ? placeWord(detail.askingExponent) : "";
        const passedWords = detail ? detail.passedExponents.map(placeWord).reverse() : [];
        const runNote = "Follow the whole run: the " + donorWord + " column drops by one, every empty column on the way is rewritten as 9, and the " +
            askingWord + " column gains ten.";

        question.display = null;
        if (question.showExpression) {
            question.display = {
                top: splitNumber(aText),
                bottom: splitNumber(bText),
                missing: false,
                result: null,
                ariaLabel: spokenNumber(aText) + " minus " + spokenNumber(bText) + ", to be set out in columns"
            };
        }

        if (stage === 0 && family === 2) {
            question.answerMinor = question.missingPart;
            question.answerText = formatMinor(question.missingPart, 0, false);
            question.prompt = "A number was taken away from " + aText + " and " + bText + " was left. Which number was taken away?";
            question.display = {
                top: splitNumber(aText),
                bottom: { whole: "", fraction: "" },
                missing: true,
                result: splitNumber(bText),
                ariaLabel: spokenNumber(aText) + " minus a missing number leaves " + spokenNumber(bText)
            };
            question.answerShown = question.answerText;
            question.summaryLine = aText + " − ? = " + bText;
            question.closingStep = "The number taken away is " + question.answerText + ".";
        } else if (question.mode === "single") {
            question.answerMinor = differenceMinor;
            question.answerText = differenceText;
            question.closingStep = "Read the completed difference as " + question.answerShown + ".";
        }

        if (stage === 2) {
            if (family === 0) {
                question.prompt = "A bill of £" + formatMinor(bMinor, places, true) + " is paid with £" +
                    formatMinor(aMinor, places, false) + ". How much change is given?";
                question.successVerb = "is the change.";
            } else if (family === 1) {
                question.prompt = "A length of pipe measures " + aText + " m. A piece " + bText +
                    " m long is cut from it. What length is left?";
                question.successVerb = "is left.";
            } else if (family === 2) {
                question.prompt = "A print run of " + aText + " leaflets is delivered and " + bText +
                    " of them are handed out. How many leaflets are left?";
                question.successVerb = differenceMinor === 1 ? "leaflet is left." : "leaflets are left.";
            } else {
                question.prompt = "A sack holds " + aText + " kg of flour. " + bText +
                    " kg is used. What mass of flour is left?";
                question.successVerb = "is left.";
            }
            question.success = question.answerShown + " " + question.successVerb;
        } else if (question.mode === "single") {
            question.success = stage === 0 && family === 2
                ? question.answerText + " was taken away."
                : question.answerShown + " is the difference.";
        }

        if (question.mode === "grid") {
            question.cells = decorateCells(gridCells(calculation), detail, calculation);
            question.gridLegend = "The value now standing above each column of " + alignedA;
            question.prompt = question.padded
                ? "Write " + aText + " with " + places + " decimal places, then make the exchange the " + askingWord +
                  " column needs. Write the value that now stands above each column."
                : "Make the exchange the " + askingWord + " column needs, then write the value that now stands above each column of " + aText + ".";
            question.answerText = question.cells.map(function (cell) { return cell.expected; }).join(" · ");
            question.answerShown = question.answerText;
            question.success = "That is the top line rewritten: the " + donorWord + " column dropped by one and every column the exchange passed keeps 9.";
            question.closingStep = "The top line now reads " + question.answerText + ", so the difference is " + fixedDifference + ".";
        }

        if (question.mode === "choice" && question.choiceKind === "line") {
            const working = calculation.working;
            const asLine = function (row) { return row.join(" · "); };
            const correct = working.slice();
            const donorNine = working.slice();
            donorNine[detail.donorIndex] = 9;
            const donorKept = working.slice();
            donorKept[detail.donorIndex] = calculation.aDigits[detail.donorIndex];
            const runStopped = working.slice();
            detail.passedIndexes.forEach(function (index, position) {
                if (position < detail.passedIndexes.length - 1) runStopped[index] = 0;
            });
            runStopped[detail.donorIndex] = calculation.aDigits[detail.donorIndex];
            if (detail.passedIndexes.length === 1) runStopped[detail.passedIndexes[0]] = 0;
            const rows = [
                { row: correct, kind: "correct" },
                { row: donorNine, kind: "donorNine" },
                { row: donorKept, kind: "donorKept" },
                { row: runStopped, kind: "runStopped" }
            ];
            const order = [0, 1, 2, 3];
            for (let index = order.length - 1; index > 0; index -= 1) {
                const swap = randomInt(rng, 0, index);
                const held = order[index];
                order[index] = order[swap];
                order[swap] = held;
            }
            const arranged = order.map(function (index) { return rows[index]; });
            const spoken = function (row) {
                return row.map(function (value, index) {
                    return value + " above the " + placeWord(calculation.width - index - 1 - calculation.places);
                }).join(", ");
            };
            question.options = arranged.map(function (entry) { return asLine(entry.row); });
            question.optionSpoken = arranged.map(function (entry) { return spoken(entry.row); });
            question.optionKinds = arranged.map(function (entry) { return entry.kind; });
            question.correctIndex = question.optionKinds.indexOf("correct");
            question.compactValues = true;
            question.choiceLegend = "Each line shows what stands above the " +
                joinWords(calculation.aDigits.map(function (digit, index) {
                    return placeShort(calculation.width - index - 1 - calculation.places);
                })) + " columns";
            question.prompt = "The " + askingWord + " column of " + aText + " cannot pay " + detail.bottom +
                ". Which line shows the top number rewritten correctly for " + aText + " − " + bText + "?";
            question.answerText = asLine(correct);
            question.answerShown = question.answerText;
            question.success = "That is the run written correctly: " + runNote;
            question.closingStep = "The top line reads " + asLine(correct) + ", so the difference is " + fixedDifference + ".";
        }

        if (question.mode === "choice" && question.choiceKind === "donor") {
            const ladder = [-2, -1, 0, 1];
            question.options = ladder.map(function (exponent) { return placeWord(exponent) + " column"; });
            question.optionExponents = ladder;
            question.correctIndex = ladder.indexOf(detail.donorExponent);
            question.compactValues = false;
            question.choiceLegend = "Choose one column";
            question.prompt = "Written with " + places + " decimal places, " + aText + " becomes " + alignedA +
                ". The " + askingWord + " column cannot pay " + detail.bottom + " in " + aText + " − " + bText +
                ". Which column does the exchange finally come from?";
            question.answerText = placeWord(detail.donorExponent) + " column";
            question.answerShown = question.answerText;
            question.success = "The " + donorWord + " column is the first one to the left with something to give.";
            question.closingStep = "The exchange comes from the " + donorWord + " column, and the completed subtraction gives " +
                fixedDifference + ".";
        }

        question.hints = buildHints(question, detail, donorWord, askingWord, passedWords);
        question.nudge = runNote;
        question.steps = buildSteps(question);
        question.guesses = buildGuesses(question);
        return question;
    }

    function buildHints(question, detail, donorWord, askingWord, passedWords) {
        const padHint = "Give both numbers the same number of decimal places first, so " + question.aText +
            " is written as " + question.alignedA + ".";
        if (question.mode === "grid") {
            return [
                question.padded ? padHint : "Start where the subtraction starts: the " + askingWord +
                    " column needs " + detail.bottom + " and holds " + question.calculation.aDigits[question.calculation.width - 1] + ".",
                "Look left for the first column with something to give. Every empty column between it and the " +
                    askingWord + " column keeps 9 and sends the rest on."
            ];
        }
        if (question.mode === "choice" && question.choiceKind === "line") {
            return [
                "Only one unit is spent altogether, so exactly one column drops by one.",
                "900 + 90 + 10 = 1000, which is why the columns the exchange passes hold 9 and the column it reaches drops by one."
            ];
        }
        if (question.mode === "choice" && question.choiceKind === "donor") {
            return [
                "Read leftwards from the " + askingWord + " column until you meet a column that is not empty.",
                "A column holding 0 has nothing to give, so the request passes straight through it and carries on."
            ];
        }
        if (question.stage === 0 && question.family === 2) {
            return [
                "Subtracting the part that is left from the starting number gives the part that was taken away: " +
                    question.aText + " − " + question.bText + ".",
                "The " + askingWord + " column of " + question.aText + " cannot pay, so the exchange travels left to the " +
                    donorWord + " column and every column on the way becomes 9."
            ];
        }
        return [
            question.padded ? padHint : "Begin in the " + askingWord + " column, which needs " + detail.bottom +
                " and holds " + question.calculation.aDigits[question.calculation.width - 1] + ".",
            "The " + (passedWords.length ? joinWords(passedWords) + " " + (passedWords.length === 1 ? "column is" : "columns are") + " empty" : "next column is empty") +
                ", so the exchange carries on to the " + donorWord + " column: that digit drops by one and each column on the way becomes 9."
        ];
    }

    function buildGuesses(question) {
        if (question.mode !== "single") return [];
        const calculation = question.calculation;
        const detail = question.detail;
        const places = question.places;
        const guesses = [];
        const add = function (value, text) {
            if (value === null || value === undefined) return;
            if (!Number.isFinite(value) || value < 0 || value === question.answerMinor) return;
            if (guesses.some(function (guess) { return guess.value === value; })) return;
            guesses.push({ value: value, text: text });
        };

        if (question.stage === 0 && question.family === 2) {
            add(question.aMinor + question.bMinor, "That is " + question.aText + " added to " + question.bText +
                ". The part taken away is what is left over when " + question.bText + " is removed from " + question.aText + ".");
        }

        add(rowValue(calculation.aDigits.map(function (digit, index) {
            return Math.max(digit, calculation.bDigits[index]);
        }), calculation.bDigits.map(function (digit, index) {
            return Math.min(digit, calculation.aDigits[index]);
        })), "Some columns have been taken the other way round, subtracting the smaller digit from the larger one. A column that cannot pay is the signal to exchange, not to swap the digits.");

        if (detail) {
            const donorExponent = detail.donorExponent;
            add(question.answerMinor + Math.pow(10, donorExponent + places),
                "The run of 9s is there, but the column that gave has not dropped by one.");
            if (detail.donorAfter !== 9) {
                add(question.answerMinor + (9 - detail.donorAfter) * Math.pow(10, donorExponent + places),
                    "The giving column has been written as 9 as well. Only the columns the exchange passes through become 9; the column it reaches drops by one.");
            }
            const misread = calculation.working.map(function (top, index) { return top - calculation.bDigits[index]; });
            detail.passedIndexes.forEach(function (index) { misread[index] = calculation.bDigits[index]; });
            add(resultValue(misread),
                "The columns the exchange passed through are still being read as 0. Once a column has been rewritten, use the new digit: 9 − 4, not 0 − 4.");
        }

        if (question.padded) {
            const misreadTop = misreadPaddingMinor(question.aMinor, places, question.shownPlaces);
            if (misreadTop !== null && misreadTop > question.bMinor) {
                add(misreadTop - question.bMinor, "The short decimal has been padded on the wrong side. " + question.aText +
                    " is worth " + question.alignedA + ", so the zeros go on the end.");
            }
        }

        if (places) {
            add(question.answerMinor * 10, "The digits are right but the answer sits one place too high. Keep the decimal point in the column it was aligned in.");
            if (question.answerMinor % 10 === 0) {
                add(question.answerMinor / 10, "The digits are right but the answer sits one place too low. Keep the decimal point in the column it was aligned in.");
            }
        }
        return guesses;
    }

    function generateQuestion(stage, family, rng, excludedKey) {
        const random = rng || Math.random;
        let question = null;
        for (let attempt = 0; attempt < 8; attempt += 1) {
            question = makeQuestion(stage, family, random);
            if (question.factKey !== excludedKey) return question;
        }
        return question;
    }

    function buildRound(rng) {
        const random = rng || Math.random;
        const questions = [];
        let previousKey = "";
        for (let stage = 0; stage < 3; stage += 1) {
            for (let family = 0; family < 4; family += 1) {
                const question = generateQuestion(stage, family, random, previousKey);
                questions.push(question);
                previousKey = question.factKey;
            }
        }
        return questions;
    }

    function createSeededRandom(seed) {
        let state = seed >>> 0;
        return function () {
            state = (1664525 * state + 1013904223) >>> 0;
            return state / 4294967296;
        };
    }

    function parseToMinor(raw, places, unitPrefix, unitSuffix) {
        if (typeof raw !== "string") return null;
        let cleaned = raw.trim().replace(/\s+/g, "");
        if (unitPrefix && cleaned.startsWith(unitPrefix)) cleaned = cleaned.slice(unitPrefix.length);
        if (unitSuffix && cleaned.toLowerCase().endsWith(unitSuffix.toLowerCase())) cleaned = cleaned.slice(0, -unitSuffix.length);
        if (cleaned.indexOf(",") >= 0) {
            // Commas are only grouping marks, and only where a grouping mark belongs.
            if (!/^\d{1,3}(?:,\d{3})+(?:\.\d*)?$/.test(cleaned)) return null;
            cleaned = cleaned.replace(/,/g, "");
        }
        if (!/^\d*(?:\.\d*)?$/.test(cleaned) || !/\d/.test(cleaned)) return null;
        const parts = cleaned.split(".");
        let fraction = parts[1] || "";
        if (fraction.length > places) {
            if (!/^0*$/.test(fraction.slice(places))) return null;
            fraction = fraction.slice(0, places);
        }
        return Number(parts[0]) * Math.pow(10, places) + Number(fraction.padEnd(places, "0"));
    }

    function evaluateGrid(question, answer) {
        const cells = question.cells;
        const values = Array.isArray(answer) ? answer : [];
        const entered = cells.map(function (cell, index) { return String(values[index] === undefined ? "" : values[index]).trim(); });
        const filled = entered.filter(Boolean).length;
        if (!filled) return { state: "blank", text: "Write the value that now stands above each column." };
        if (entered.some(function (value) { return value && !/^\d{1,2}$/.test(value); })) {
            return { state: "unreadable", text: "Each column takes a whole number written in digits." };
        }
        if (filled < cells.length) {
            const missing = cells.length - filled;
            return { state: "incomplete", text: missing + (missing === 1 ? " column is" : " columns are") + " still empty." };
        }
        const correctPositions = cells.map(function (cell, index) { return Number(entered[index]) === Number(cell.expected); });
        if (correctPositions.every(Boolean)) return { state: "correct", text: question.success, correctPositions: correctPositions };

        const detail = question.detail;
        const donorEntered = Number(entered[detail.donorIndex]);
        const donorWord = placeWord(detail.donorExponent);
        const askingWord = placeWord(detail.askingExponent);
        const rightCount = correctPositions.filter(Boolean).length;
        const kept = rightCount ? rightCount + (rightCount === 1 ? " column is" : " columns are") + " right. " : "";
        let text;

        if (donorEntered === 9 && Number(question.cells[detail.donorIndex].expected) !== 9) {
            text = "The " + donorWord + " column has been written as 9 as well. Only the columns the exchange passes through become 9; the column it reaches drops by one.";
        } else if (donorEntered === Number(question.cells[detail.donorIndex].was)) {
            text = "The " + donorWord + " column has not paid for the exchange yet, so it still holds " + donorEntered + ".";
        } else if (detail.passedIndexes.some(function (index) { return Number(entered[index]) === 0; })) {
            text = "A column the exchange passed through is still 0. Each one keeps 9 and sends the rest on.";
        } else if (Number(entered[cells.length - 1]) === Number(cells[cells.length - 1].was) + 1) {
            text = "The " + askingWord + " column gains ten, not one.";
        } else {
            const firstWrong = correctPositions.indexOf(false);
            text = kept + "Look again at the " + placeShort(cells[firstWrong].exponent) + " column.";
        }
        return { state: "try-again", text: text, correctPositions: correctPositions };
    }

    function evaluateChoice(question, answer) {
        if (answer === "" || answer === null || answer === undefined) {
            return { state: "blank", text: "Choose one option before checking." };
        }
        const index = Number(answer);
        if (!Number.isInteger(index) || index < 0 || index >= question.options.length) {
            return { state: "blank", text: "Choose one option before checking." };
        }
        if (index === question.correctIndex) return { state: "correct", text: question.success };

        const detail = question.detail;
        if (question.choiceKind === "line") {
            const kind = question.optionKinds[index];
            if (kind === "donorNine") {
                return { state: "try-again", text: "That line makes the giving column a 9 too. It gives one unit away, so it drops by one." };
            }
            if (kind === "donorKept") {
                return { state: "try-again", text: "That line writes the 9s but leaves the giving column untouched. The unit those 9s are made from has to come from somewhere." };
            }
            return { state: "try-again", text: "That line stops the run early and leaves an empty column as 0. Every column between the two ends of the run becomes 9." };
        }
        const chosen = question.optionExponents[index];
        const chosenWord = placeWord(chosen);
        if (chosen < detail.donorExponent) {
            return { state: "try-again", text: "The " + chosenWord + " column holds 0 as well, so it has nothing to give. The request passes through it." };
        }
        return { state: "try-again", text: "The " + chosenWord + " column does hold something, but the exchange stops at the first column to the left that can give." };
    }

    function evaluateResponse(question, raw) {
        if (question.mode === "grid") return evaluateGrid(question, raw);
        if (question.mode === "choice") return evaluateChoice(question, raw);
        if (typeof raw !== "string" || !raw.trim()) {
            return { state: "blank", text: "Enter the " + question.answerNoun + " before checking." };
        }
        const minor = parseToMinor(raw, question.places, question.unitPrefix, question.unitSuffix);
        if (minor === null) {
            return {
                state: "unreadable",
                text: question.places
                    ? "Enter the " + question.answerNoun + " using digits and a decimal point."
                    : "Enter the " + question.answerNoun + " using digits."
            };
        }
        if (minor === question.answerMinor) return { state: "correct", text: question.success };
        if (question.places && raw.indexOf(",") >= 0 &&
            parseToMinor(raw.replace(",", "."), question.places, question.unitPrefix, question.unitSuffix) === question.answerMinor) {
            return { state: "try-again", text: "Those are the right digits. A comma groups thousands here, so write the decimal point as a full stop." };
        }
        const match = question.guesses.find(function (guess) { return guess.value === minor; });
        if (match) return { state: "try-again", text: match.text };
        return { state: "try-again", text: question.nudge };
    }

    function validateQuestion(question) {
        if (!question || !question.factKey || question.hints.length !== 2 || question.steps.length < 4) return false;
        if (!question.calculation.valid || !question.calculation.acrossZero || !question.detail) return false;
        if (question.aMinor <= question.bMinor) return false;
        if (evaluateResponse(question, question.mode === "grid"
            ? question.cells.map(function (cell) { return cell.expected; })
            : (question.mode === "choice" ? String(question.correctIndex) : question.answerText)).state !== "correct") return false;
        if (question.mode === "single") {
            const parsed = parseToMinor(question.answerText, question.places, question.unitPrefix, question.unitSuffix);
            if (parsed !== question.answerMinor) return false;
            if (question.guesses.some(function (guess) { return guess.value === question.answerMinor; })) return false;
        }
        return true;
    }

    function selfCheck(iterations) {
        const rng = createSeededRandom(20260826);
        const count = Math.max(1, iterations || 400);
        const seen = { grid: 0, choice: 0, single: 0 };
        for (let roundIndex = 0; roundIndex < count; roundIndex += 1) {
            const round = buildRound(rng);
            if (round.length !== 12) throw new Error("A round must contain 12 questions.");
            round.forEach(function (question, index) {
                const where = "round " + (roundIndex + 1) + ", question " + (index + 1);
                if (question.stage !== Math.floor(index / 4) || question.family !== index % 4) throw new Error("Wrong slot at " + where);
                if (!validateQuestion(question)) throw new Error("Invalid question at " + where);
                seen[question.mode] += 1;
                const calculation = question.calculation;
                if (!calculation.acrossZero) throw new Error("No zero crossed at " + where);
                if (calculation.aDigits.length !== calculation.working.length) throw new Error("Top line mismatch at " + where);
                if (question.aMinor - question.bMinor !== question.differenceMinor) throw new Error("Difference mismatch at " + where);
                if (question.mode === "grid" || question.choiceKind === "donor") {
                    if (calculation.exchangeCount !== 1) throw new Error("Expected one clean run at " + where);
                }
                if (question.mode === "grid") {
                    const rebuilt = calculation.working.reduce(function (total, digit, position) {
                        return total + digit * Math.pow(10, calculation.width - position - 1);
                    }, 0);
                    const bTotal = calculation.bDigits.reduce(function (total, digit, position) {
                        return total + digit * Math.pow(10, calculation.width - position - 1);
                    }, 0);
                    if (rebuilt - bTotal !== question.differenceMinor) throw new Error("Rewritten line is not worth the top number at " + where);
                    if (rebuilt !== question.aMinor + 0) {
                        // The rewritten line must still be worth the original number.
                        throw new Error("Rewritten line changed the value at " + where);
                    }
                }
                if (question.mode === "choice") {
                    if (new Set(question.options).size !== question.options.length) throw new Error("Repeated option at " + where);
                    if (question.correctIndex < 0) throw new Error("No correct option at " + where);
                    question.options.forEach(function (option, position) {
                        const verdict = evaluateResponse(question, String(position));
                        if ((position === question.correctIndex) !== (verdict.state === "correct")) throw new Error("Option verdict wrong at " + where);
                        if (!verdict.text) throw new Error("Empty option feedback at " + where);
                    });
                }
                if (question.stage === 2 && question.family !== 2 && !question.unitLabel) throw new Error("Context question lost its unit at " + where);
                if (question.stage === 0 && question.places !== 0) throw new Error("Integer stage produced a decimal at " + where);
                if (question.stage === 1 && question.places !== 3) throw new Error("Decimal stage lost its places at " + where);
                if (question.steps.some(function (step) { return !step || /undefined|NaN/.test(step); })) throw new Error("Broken solution step at " + where);
                if (question.hints.some(function (hint) { return !hint || /undefined|NaN/.test(hint); })) throw new Error("Broken hint at " + where);
                if (/undefined|NaN/.test(question.prompt + question.success + question.nudge)) throw new Error("Broken copy at " + where);
                if (question.mode === "single") {
                    const values = new Set(question.guesses.map(function (guess) { return guess.value; }));
                    if (values.size !== question.guesses.length) throw new Error("Duplicate misconception value at " + where);
                }
            });
        }
        return { rounds: count, questions: count * 12, modes: seen };
    }

    const api = {
        STAGES: STAGES,
        buildRound: buildRound,
        buildSingleRun: buildSingleRun,
        createSeededRandom: createSeededRandom,
        evaluateResponse: evaluateResponse,
        formatMinor: formatMinor,
        generateQuestion: generateQuestion,
        parseToMinor: parseToMinor,
        selfCheck: selfCheck,
        subtractionData: subtractionData,
        validateQuestion: validateQuestion
    };

    scope.ExchangingAcrossZerosPractice = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
    if (typeof document === "undefined") return;

    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function blankAnswer(question) {
        if (question.mode === "grid") return question.cells.map(function () { return ""; });
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
        if (question.mode === "grid") {
            return "Your answer: " + answer.map(function (value) { return String(value).trim() || "—"; }).join(" · ");
        }
        return "Your answer: " + question.unitPrefix + String(answer).trim() + (question.unitSuffix ? " " + question.unitSuffix : "");
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
        const gridField = root.querySelector("[data-grid-answer]");
        const gridLegend = root.querySelector("[data-grid-legend]");
        const gridColumns = root.querySelector("[data-grid-columns]");
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
                const id = "zeros-choice-" + current + "-" + index;
                const label = element("label", "practice-choice__option");
                if (currentQuestion.compactValues) label.classList.add("is-value-choice");
                const radio = element("input");
                radio.type = "radio";
                radio.name = "zeros-choice-" + current;
                radio.id = id;
                radio.value = String(index);
                radio.checked = currentState.answer === String(index);
                radio.setAttribute("aria-describedby", "practice-feedback practice-hint");
                label.classList.toggle("is-selected", radio.checked);
                label.appendChild(radio);
                if (!currentQuestion.compactValues) label.appendChild(element("span", "", String.fromCharCode(65 + index)));
                const copy = element("span", "", option);
                if (currentQuestion.optionSpoken) {
                    copy.setAttribute("aria-hidden", "true");
                    label.appendChild(element("span", "practice-grid__spoken", currentQuestion.optionSpoken[index]));
                }
                label.appendChild(copy);
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

        function applyGridStates() {
            const currentState = state();
            Array.from(gridColumns.querySelectorAll(".practice-grid__cell")).forEach(function (cell, index) {
                const field = cell.querySelector("input");
                const verdict = currentState.correctPositions[index];
                cell.classList.toggle("is-correct", verdict === true);
                cell.classList.toggle("is-wrong", verdict === false);
                if (verdict === false) field.setAttribute("aria-invalid", "true");
                else field.removeAttribute("aria-invalid");
            });
        }

        function renderGrid(currentQuestion, currentState) {
            gridLegend.textContent = currentQuestion.gridLegend;
            gridColumns.replaceChildren();
            currentQuestion.cells.forEach(function (cell, index) {
                const id = "zeros-grid-" + current + "-" + index;
                const label = element("label", "practice-grid__cell");
                if (cell.exponent === -1) label.classList.add("is-decimal-start");
                label.htmlFor = id;
                const place = element("span", "practice-grid__place", placeShort(cell.exponent));
                place.setAttribute("aria-hidden", "true");
                label.appendChild(place);
                label.appendChild(element("span", "practice-grid__spoken", placeWord(cell.exponent) + " column, "));
                const field = element("input");
                field.type = "text";
                field.id = id;
                field.inputMode = "numeric";
                field.maxLength = 2;
                field.autocomplete = "off";
                field.spellcheck = false;
                field.value = currentState.answer[index] || "";
                field.setAttribute("aria-describedby", "practice-feedback practice-hint");
                label.appendChild(field);
                const was = element("span", "practice-grid__was");
                was.appendChild(element("span", "practice-grid__spoken", "written above "));
                const wasDigit = element("b", "", cell.was);
                was.appendChild(wasDigit);
                label.appendChild(was);
                field.addEventListener("input", function () {
                    const cleaned = field.value.replace(/[^0-9]/g, "").slice(0, 2);
                    if (cleaned !== field.value) field.value = cleaned;
                    currentState.answer[index] = cleaned;
                    currentState.correctPositions[index] = undefined;
                    clearOutcomeForEdit(true);
                    applyGridStates();
                });
                field.addEventListener("keydown", handleEnter);
                gridColumns.appendChild(label);
            });
            applyGridStates();
        }

        function renderExpression(currentQuestion) {
            const display = currentQuestion.display;
            expression.replaceChildren();
            expression.hidden = !display;
            if (!display) return;
            const row = function (sign, parts, missing) {
                const node = element("div", "practice-column__row");
                node.appendChild(element("span", "", sign));
                if (missing) {
                    const box = element("span", "practice-column__box");
                    box.setAttribute("aria-hidden", "true");
                    node.appendChild(box);
                    node.appendChild(element("span", "", ""));
                } else {
                    node.appendChild(element("strong", "", parts.whole));
                    node.appendChild(element("span", "practice-column__fraction", parts.fraction));
                }
                return node;
            };
            expression.appendChild(row("", display.top, false));
            expression.appendChild(row("−", display.bottom, display.missing));
            expression.appendChild(element("div", "practice-column__rule"));
            if (display.result) expression.appendChild(row("", display.result, false));
            expression.setAttribute("aria-label", display.ariaLabel);
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
            gridField.hidden = currentQuestion.mode !== "grid";
            if (currentQuestion.mode === "single") {
                input.value = currentState.answer;
                if (currentQuestion.showExpression) input.setAttribute("aria-label", currentQuestion.answerLabel + " for " + currentQuestion.summaryLine);
                else input.removeAttribute("aria-label");
                unitPrefix.textContent = currentQuestion.unitPrefix;
                unitPrefix.hidden = !currentQuestion.unitPrefix;
                unitSuffix.textContent = currentQuestion.unitSuffix;
                unitSuffix.hidden = !currentQuestion.unitSuffix;
                answerEntry.classList.toggle("has-prefix", Boolean(currentQuestion.unitPrefix));
                answerEntry.classList.toggle("has-suffix", Boolean(currentQuestion.unitSuffix));
            } else if (currentQuestion.mode === "choice") {
                renderChoice(currentQuestion, currentState);
            } else {
                renderGrid(currentQuestion, currentState);
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
            return Array.from(gridColumns.querySelectorAll("input")).map(function (field) { return field.value; });
        }

        function checkAnswer() {
            const currentState = state();
            currentState.answer = readAnswer();
            const result = evaluateResponse(question(), currentState.answer);
            currentState.replaceConfirm = false;
            currentState.correctPositions = result.correctPositions || [];
            if (question().mode === "grid") applyGridStates();

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
                : "[data-grid-columns] input");
            if (control) control.focus({ preventScroll: true });
        }

        function replaceQuestion() {
            const currentState = state();
            const hasWork = hasAnswer(currentState.answer) || currentState.attempts || currentState.hintLevel || currentState.solutionShown;
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
                    entry.appendChild(element("p", "", "Subtraction: " + item.summaryLine));
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
                : filtered.length + " " + (filtered.length === 1 ? "question is" : "questions are") + " " + labels[filter].toLowerCase() + ".";

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
                : (round.length - counts.revisit) + " checked; " + counts.revisit + " " + (counts.revisit === 1 ? "is" : "are") + " worth revisiting.";
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
