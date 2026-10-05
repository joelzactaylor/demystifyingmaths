(function (scope) {
    "use strict";

    var host = document.querySelector("[data-integrated-bank]");
    if (!host) return;

    function pick(values, rng) { return values[Math.floor(rng() * values.length)]; }
    function near(a, b) { return Math.abs(a - b) < 1e-9; }
    function tidy(value) { return Number.isInteger(value) ? String(value) : String(Math.round(value * 1000) / 1000); }
    function normalise(value) {
        return String(value == null ? "" : value).trim().toLowerCase()
            .replace(/[−‒–—]/g, "-").replace(/\s+/g, " ").replace(/[.,]$/g, "");
    }

    function number(stage, title, prompt, expression, expected, correct, hints, steps, misses, unit) {
        return {
            stage: stage, mode: "single", answerKind: Number.isInteger(expected) ? "integer" : "decimal",
            title: title, prompt: prompt, display: { text: expression }, expected: expected,
            answerShown: tidy(expected), correctNote: correct, hints: hints, steps: steps,
            misses: misses || [], unitSuffix: unit || "", factKey: expression
        };
    }

    function choice(stage, title, prompt, expression, options, correctIndex, notes, hints, steps) {
        return {
            stage: stage, mode: "choice", title: title, prompt: prompt,
            display: expression ? { text: expression } : null, options: options,
            correctIndex: correctIndex, optionNotes: notes, choiceLegend: "Choose one answer",
            hints: hints, steps: steps, answerShown: options[correctIndex], factKey: expression + options.join("|")
        };
    }

    function textQuestion(stage, title, prompt, expression, answers, correct, hints, steps) {
        return {
            stage: stage, mode: "text", title: title, prompt: prompt,
            display: expression ? { text: expression } : null, answers: answers.map(normalise),
            correctNote: correct, hints: hints, steps: steps, answerShown: answers[0], factKey: expression + answers[0]
        };
    }

    function modeOf(values) {
        var counts = new Map();
        values.forEach(function (value) { counts.set(value, (counts.get(value) || 0) + 1); });
        var greatest = Math.max.apply(null, Array.from(counts.values()));
        return Array.from(counts).filter(function (entry) { return entry[1] === greatest; }).map(function (entry) { return entry[0]; });
    }
    function median(values) {
        var ordered = values.slice().sort(function (a, b) { return a - b; });
        var middle = Math.floor(ordered.length / 2);
        return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
    }
    function gcd(a, b) { return b ? gcd(b, a % b) : Math.abs(a); }
    function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }
    function isPrime(value) {
        if (value < 2) return false;
        for (var divisor = 2; divisor * divisor <= value; divisor += 1) if (value % divisor === 0) return false;
        return true;
    }
    function factors(value) {
        var found = [];
        for (var divisor = 1; divisor <= value; divisor += 1) if (value % divisor === 0) found.push(divisor);
        return found;
    }
    function primeFactors(value) {
        var found = [], divisor = 2, left = value;
        while (left > 1) {
            while (left % divisor === 0) { found.push(divisor); left /= divisor; }
            divisor += 1;
        }
        return found;
    }
    function factorText(value) {
        var counts = new Map();
        primeFactors(value).forEach(function (prime) { counts.set(prime, (counts.get(prime) || 0) + 1); });
        var superscript = { "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶" };
        return Array.from(counts).map(function (entry) { return entry[1] === 1 ? String(entry[0]) : entry[0] + (superscript[entry[1]] || (" to the power " + entry[1])); }).join(" × ");
    }

    var banks = {
        mode: [
            function (stage, rng) {
                var values = pick([[2, 4, 4, 5, 7], [8, 3, 8, 6, 8, 2], [12, 15, 12, 9, 10]], rng);
                var answer = modeOf(values)[0];
                return number(stage, "Find the most frequent value", "What is the mode?", values.join(", "), answer,
                    "Correct. " + answer + " occurs more often than any other value.",
                    ["Count how often each value occurs.", "Look for the value with the greatest frequency."],
                    ["Count each repeated value.", answer + " has the greatest frequency.", "The mode is " + answer + "."]);
            },
            function (stage, rng) {
                var values = pick([[2, 2, 5, 5, 7], [3, 6, 3, 8, 6], [10, 12, 14, 10, 14]], rng);
                var answer = modeOf(values).sort(function (a, b) { return a - b; });
                return textQuestion(stage, "Find both modes", "Give both modes, separated by a comma.", values.join(", "),
                    [answer.join(", "), answer.join(","), answer.join(" and "), answer.slice().reverse().join(", "), answer.slice().reverse().join(","), answer.slice().reverse().join(" and ")], "Correct. The two values share the greatest frequency.",
                    ["Two values may tie for the greatest frequency.", "Count each occurrence; keep every value with the greatest count."],
                    ["Count the occurrences of each value.", answer[0] + " and " + answer[1] + " tie for the greatest frequency.", "The modes are " + answer.join(" and ") + "."]);
            },
            function (stage, rng) {
                var values = pick([[1, 3, 5, 7], [4, 8, 9, 12, 15], [2, 6, 10, 14]], rng);
                return choice(stage, "Decide whether a mode exists", "Does this list have a mode?", values.join(", "),
                    ["Yes", "No"], 1,
                    ["A mode needs a value to occur more often than the others.", "Correct. Every value occurs once, so there is no mode."],
                    ["Compare the frequencies, not the sizes of the values.", "Every value occurs once."],
                    ["Count each value.", "All the frequencies are equal to 1.", "There is no mode."]);
            },
            function (stage, rng) {
                var values = pick([["bus", "walk", "bus", "cycle", "bus"], ["red", "blue", "green", "blue"], ["small", "medium", "medium", "large"]], rng);
                var answer = modeOf(values)[0];
                return textQuestion(stage, "Find the most common category", "What is the mode?", values.join(", "), [answer],
                    "Correct. “" + answer + "” is the category occurring most often.",
                    ["Categories cannot be added or put into a numerical middle, but they can be counted.", "Choose the category with the greatest frequency."],
                    ["Tally each category.", "“" + answer + "” occurs most often.", "The mode is “" + answer + "”."]);
            }
        ],
        median: [
            function (stage, rng) {
                var values = pick([[9, 2, 7, 4, 5], [12, 3, 8, 10, 6], [21, 15, 19, 17, 13]], rng);
                var answer = median(values), ordered = values.slice().sort(function (a, b) { return a - b; });
                return number(stage, "Find the middle value", "What is the median?", values.join(", "), answer,
                    "Correct. In order, " + answer + " is the middle value.",
                    ["Put every value in ascending order first.", "Cross off one value from each end until one remains."],
                    ["Order the list: " + ordered.join(", ") + ".", "The middle value is " + answer + ".", "The median is " + answer + "."]);
            },
            function (stage, rng) {
                var values = pick([[2, 4, 8, 10], [5, 9, 12, 16, 18, 22], [3, 7, 11, 15]], rng);
                var answer = median(values), ordered = values.slice().sort(function (a, b) { return a - b; });
                var m = ordered.length / 2, pair = [ordered[m - 1], ordered[m]];
                return number(stage, "Use the middle pair", "What is the median?", values.join(", "), answer,
                    "Correct. The midpoint of " + pair[0] + " and " + pair[1] + " is " + answer + ".",
                    ["Order the list and locate the two middle values.", "Add the middle pair and divide by 2."],
                    ["Order the list: " + ordered.join(", ") + ".", "The middle pair is " + pair.join(" and ") + ".", "(" + pair.join(" + ") + ") ÷ 2 = " + answer + "."]);
            },
            function (stage, rng) {
                var values = pick([[14, 3, 9, 6, 11], [20, 5, 17, 8, 12], [4, 18, 7, 10, 13]], rng);
                var answer = median(values), ordered = values.slice().sort(function (a, b) { return a - b; });
                return number(stage, "Order before choosing the middle", "Find the median of the unordered list.", values.join(", "), answer,
                    "Correct. Ordering changes the positions, not the values; the middle is " + answer + ".",
                    ["The middle entry as written is not necessarily the median.", "Rewrite the values from smallest to largest."],
                    ["Ascending order is " + ordered.join(", ") + ".", "The middle position contains " + answer + ".", "The median is " + answer + "."]);
            }
        ],
        range: [
            function (stage, rng) {
                var values = pick([[4, 9, 7, 12, 6], [18, 13, 21, 15], [2.5, 3.1, 2.8, 4.2]], rng);
                var low = Math.min.apply(null, values), high = Math.max.apply(null, values), answer = high - low;
                return number(stage, "Measure the full spread", "What is the range?", values.join(", "), answer,
                    "Correct. " + high + " − " + low + " = " + tidy(answer) + ".",
                    ["Find the largest and smallest values.", "Subtract smallest from largest."],
                    ["The largest value is " + high + ".", "The smallest value is " + low + ".", high + " − " + low + " = " + tidy(answer) + "."]);
            },
            function (stage, rng) {
                var pair = pick([
                    { a: [49, 50, 50, 51], b: [45, 49, 52, 54], answer: 0 },
                    { a: [18, 21, 24, 27], b: [20, 21, 22, 23], answer: 1 }
                ], rng);
                var labels = ["Set A", "Set B"];
                return choice(stage, "Compare consistency", "Which set is more consistent?", "A: " + pair.a.join(", ") + "    B: " + pair.b.join(", "),
                    labels, pair.answer,
                    labels.map(function (label, index) { return index === pair.answer ? "Correct. " + label + " has the smaller range." : "That set has the larger range, so its values are more spread out."; }),
                    ["Calculate largest minus smallest for each set.", "The smaller range indicates greater consistency in the same context."],
                    ["Find both ranges.", "Compare the two spreads.", labels[pair.answer] + " has the smaller range, so it is more consistent."]);
            },
            function (stage, rng) {
                var set = pick([[6, 7, 8, 9, 30], [11, 12, 13, 14, 50], [20, 21, 22, 23, 80]], rng);
                var ordinary = set.slice(0, -1), before = Math.max.apply(null, ordinary) - Math.min.apply(null, ordinary);
                var after = Math.max.apply(null, set) - Math.min.apply(null, set);
                return number(stage, "Notice an extreme value", "How much larger is the range after the final value is included?", set.join(", "), after - before,
                    "Correct. The extreme value increases the range by " + (after - before) + ".",
                    ["Find the range before and after the final value is included.", "Subtract the old range from the new range."],
                    ["The original range is " + before + ".", "With the extreme value, the range is " + after + ".", after + " − " + before + " = " + (after - before) + "."]);
            }
        ],
        choosingAverage: [
            function (stage) {
                return choice(stage, "Choose an average for categories", "A shop wants the most popular T-shirt colour. Which average is useful?", "red, blue, blue, green, blue",
                    ["Mode", "Median", "Mean"], 0,
                    ["Correct. The mode identifies the most frequent category.", "Colours have no numerical middle.", "Colours cannot be added and divided."],
                    ["Ask what can be calculated from categories.", "Their frequencies can be counted."],
                    ["Count how often each colour occurs.", "Blue occurs most often.", "The mode answers the question."]);
            },
            function (stage) {
                return choice(stage, "Protect the centre from an extreme", "Which average best represents these house prices?", "£180,000, £190,000, £195,000, £205,000, £2,400,000",
                    ["Mode", "Median", "Mean"], 1,
                    ["There is no repeated price, so the mode gives no useful centre.", "Correct. The median resists the single extreme price.", "The extreme price pulls the mean far above most homes."],
                    ["Look for a value far from the rest.", "Choose the average that depends on position rather than the total."],
                    ["£2,400k is an extreme value.", "It strongly affects the total and therefore the mean.", "The median is the more representative centre."]);
            },
            function (stage) {
                return choice(stage, "Use every value", "A team wants its average points per match, using every point scored. Which average fits?", "12, 16, 18, 19, 20",
                    ["Mode", "Median", "Mean"], 2,
                    ["The mode would ignore most scores.", "The median uses the middle position rather than the total.", "Correct. The mean uses the total points and every match."],
                    ["The wording says every value should contribute.", "Choose the average formed from the total."],
                    ["Add all the points.", "Share the total across the five matches.", "That calculation is the mean."]);
            },
            function (stage) {
                return choice(stage, "Criticise a choice", "Someone says the mean is always the best average. What is the strongest criticism?", "",
                    ["The mean is never an average.", "An extreme value can distort the mean.", "The mean always equals the median."], 1,
                    ["The mean is one of the standard averages.", "Correct. Because it uses the total, one extreme can move it sharply.", "The mean and median can differ."],
                    ["Think about what changes when one value is unusually large.", "The mean depends on every value through the total."],
                    ["An extreme value changes the total substantially.", "That change moves the mean.", "So the mean can be unrepresentative when extremes are present."]);
            }
        ],
        reverseMean: [
            function (stage, rng) {
                var count = pick([4, 5, 6, 8], rng), mean = pick([7, 9, 12, 15], rng), total = count * mean;
                return number(stage, "Recover the total", "A set of " + count + " values has mean " + mean + ". What is their total?", mean + " × " + count, total,
                    "Correct. Mean × count recovers the total: " + mean + " × " + count + " = " + total + ".",
                    ["Reverse division with multiplication.", "Multiply the mean by the number of values."],
                    ["Mean = total ÷ count.", "So total = mean × count.", mean + " × " + count + " = " + total + "."]);
            },
            function (stage, rng) {
                var item = pick([{ mean: 10, values: [7, 9, 11], count: 4 }, { mean: 12, values: [8, 10, 13, 14], count: 5 }, { mean: 9, values: [5, 8, 10, 11], count: 5 }], rng);
                var total = item.mean * item.count, known = item.values.reduce(function (a, b) { return a + b; }, 0), answer = total - known;
                return number(stage, "Find the missing value", "The mean is " + item.mean + ". What value is missing?", item.values.join(" + ") + " + ?",
                    answer, "Correct. The required total is " + total + ", leaving " + answer + " for the missing value.",
                    ["Recover the total before subtracting the known values.", "Total = " + item.mean + " × " + item.count + "."],
                    [item.mean + " × " + item.count + " = " + total + ".", "The known values total " + known + ".", total + " − " + known + " = " + answer + "."]);
            },
            function (stage, rng) {
                var item = pick([{ values: [6, 8, 10], added: 16 }, { values: [10, 12, 14, 16], added: 18 }, { values: [5, 7, 9], added: 11 }], rng);
                var total = item.values.reduce(function (a, b) { return a + b; }, 0) + item.added;
                var answer = total / (item.values.length + 1);
                return number(stage, "Update the mean", "A value of " + item.added + " is added. What is the new mean?", item.values.join(", ") + ", " + item.added,
                    answer, "Correct. The new total is " + total + " across " + (item.values.length + 1) + " values.",
                    ["Update both the total and the count.", "Add the new value, then divide by the new number of values."],
                    ["The new total is " + total + ".", "There are now " + (item.values.length + 1) + " values.", total + " ÷ " + (item.values.length + 1) + " = " + tidy(answer) + "."]);
            }
        ],
        powersOfTen: [
            function (stage, rng) {
                var item = pick([{ value: 4.72, scale: 10 }, { value: 0.63, scale: 100 }, { value: 52.8, scale: 1000 }], rng);
                var answer = item.value * item.scale;
                return number(stage, "Move every digit left", "Work out the product.", item.value + " × " + item.scale, answer,
                    "Correct. Every digit moves " + (String(item.scale).length - 1) + " place" + (item.scale === 10 ? "" : "s") + " left.",
                    ["Count the zeros in the power of ten.", "Move every digit left by that many places; zeros only fill empty places."],
                    ["" + item.scale + " is a power of ten.", "Move every digit left by " + (String(item.scale).length - 1) + " places.", item.value + " × " + item.scale + " = " + answer + "."]);
            },
            function (stage, rng) {
                var item = pick([{ value: 638, scale: 10 }, { value: 47.2, scale: 100 }, { value: 9050, scale: 1000 }], rng);
                var answer = item.value / item.scale;
                return number(stage, "Move every digit right", "Work out the quotient.", item.value + " ÷ " + item.scale, answer,
                    "Correct. Dividing by " + item.scale + " moves every digit right.",
                    ["Count the zeros in the divisor.", "Move every digit right by that many places."],
                    ["Dividing makes each digit worth less.", "Move the digits right by " + (String(item.scale).length - 1) + " places.", item.value + " ÷ " + item.scale + " = " + answer + "."]);
            },
            function (stage, rng) {
                var item = pick([{ expression: "7.4 ÷ 0.1", answer: 74 }, { expression: "36 × 0.1", answer: 3.6 }, { expression: "8.2 ÷ 0.01", answer: 820 }], rng);
                return number(stage, "Use a decimal power of ten", "Work out the calculation.", item.expression, item.answer,
                    "Correct. A decimal factor reverses the familiar ×10 or ÷10 movement.",
                    ["0.1 is one tenth and 0.01 is one hundredth.", "Dividing by one tenth asks how many tenths fit, so it makes the number larger."],
                    ["Rewrite 0.1 as one tenth, or 0.01 as one hundredth.", "Apply the inverse power-of-ten movement.", item.expression + " = " + item.answer + "."]);
            }
        ],
        multiplyingDecimals: [
            function (stage, rng) {
                var item = pick([{ a: 2.4, b: 1.3 }, { a: 0.7, b: 0.6 }, { a: 3.25, b: 0.4 }], rng);
                var answer = Math.round(item.a * item.b * 10000) / 10000;
                return number(stage, "Restore the decimal places", "Work out the product.", item.a + " × " + item.b, answer,
                    "Correct. The integer product has been scaled back by the combined decimal places.",
                    ["Multiply the digits as whole numbers first.", "Count the decimal places across both factors, then restore that many in the product."],
                    ["Ignore the points temporarily and multiply the digits.", "Count the decimal places in both factors together.", item.a + " × " + item.b + " = " + answer + "."]);
            },
            function (stage, rng) {
                var item = pick([{ a: 0.3, b: 0.8 }, { a: 4, b: 0.25 }, { a: 0.6, b: 0.5 }], rng), answer = item.a * item.b;
                return number(stage, "Judge the size of the product", "Work out the product.", item.a + " × " + item.b, answer,
                    "Correct. Multiplying by a value below 1 takes that fraction of the other factor.",
                    ["Estimate whether the answer should grow or shrink.", "A factor below 1 takes part of the other number, not several copies."],
                    ["Interpret the decimal factor as a fraction of one.", "Use the integer product and restore the scale.", item.a + " × " + item.b + " = " + answer + "."]);
            },
            function (stage, rng) {
                var item = pick([{ expression: "1.20 × 0.5", answer: 0.6 }, { expression: "2.5 × 0.40", answer: 1 }, { expression: "0.30 × 0.20", answer: 0.06 }], rng);
                return number(stage, "Remove only a trailing zero", "Give the product in its simplest decimal form.", item.expression, item.answer,
                    "Correct. The decimal places were counted before the trailing zero was removed.",
                    ["Keep every zero until the place-value count is complete.", "Only a zero at the far right of a decimal may be removed without changing its value."],
                    ["Multiply as integers.", "Restore all decimal places from the question.", "Remove a final trailing zero: the answer is " + item.answer + "."]);
            }
        ],
        dividingDecimals: [
            function (stage, rng) {
                var item = pick([{ a: 5.52, b: 0.46, scale: 100 }, { a: 7.2, b: 0.6, scale: 10 }, { a: 0.84, b: 0.07, scale: 100 }], rng);
                var answer = item.a / item.b;
                return number(stage, "Scale both numbers together", "Work out the quotient.", item.a + " ÷ " + item.b, answer,
                    "Correct. Multiplying both numbers by " + item.scale + " leaves the quotient unchanged.",
                    ["Make the divisor a whole number.", "Multiply the dividend and divisor by the same power of ten."],
                    [item.a + " ÷ " + item.b + " = " + (item.a * item.scale) + " ÷ " + (item.b * item.scale) + ".", "The scaled divisor is an integer.", "The quotient is " + answer + "."]);
            },
            function (stage, rng) {
                var item = pick([{ divisor: 0.4, scale: 10 }, { divisor: 0.035, scale: 1000 }, { divisor: 1.25, scale: 100 }], rng);
                return number(stage, "Choose the smallest sufficient scale", "What is the smallest power of ten that makes the divisor an integer?", String(item.divisor), item.scale,
                    "Correct. Multiplying by " + item.scale + " moves every decimal digit into a whole-number place.",
                    ["Count the decimal places in the divisor.", "Use 10 for one place, 100 for two places and 1,000 for three."],
                    ["The divisor has " + String(item.divisor).split(".")[1].length + " decimal places.", "Move the point that many places.", "The smallest scale is " + item.scale + "."]);
            },
            function (stage, rng) {
                var item = pick([{ expression: "6 ÷ 0.5", answer: 12 }, { expression: "4.2 ÷ 0.1", answer: 42 }, { expression: "3 ÷ 0.25", answer: 12 }], rng);
                return number(stage, "Count fractional groups", "Work out the quotient.", item.expression, item.answer,
                    "Correct. More than one fractional group fits inside each whole, so the quotient is larger.",
                    ["Ask how many groups of the divisor fit into the dividend.", "A group smaller than 1 can fit more than once into each whole."],
                    ["Scale both numbers until the divisor is an integer.", "Carry out the equivalent whole-number division.", item.expression + " = " + item.answer + "."]);
            }
        ],
        powersOfNegatives: [
            function (stage, rng) {
                var item = pick([{ expression: "−3²", answer: -9 }, { expression: "(−4)²", answer: 16 }, { expression: "−2³", answer: -8 }], rng);
                return number(stage, "Read what the index covers", "Work out the value.", item.expression, item.answer,
                    "Correct. Brackets decide whether the negative sign is part of the repeated factor.",
                    ["Look immediately to the left of the index.", "Without brackets, the index applies to the number before the negative sign is applied."],
                    ["Identify the base covered by the index.", "Evaluate the power.", "Apply any negative sign outside the power: the answer is " + item.answer + "."]);
            },
            function (stage, rng) {
                var item = pick([{ base: -2, index: 4, answer: 16 }, { base: -3, index: 3, answer: -27 }, { base: -5, index: 2, answer: 25 }], rng);
                return number(stage, "Use odd and even indices", "Work out the value.", "(" + item.base + ")" + (item.index === 2 ? "²" : "³"), item.answer,
                    "Correct. An " + (item.index % 2 ? "odd" : "even") + " number of negative factors gives a " + (item.answer < 0 ? "negative" : "positive") + " product.",
                    ["Write the negative factor the number of times shown by the index.", "Pair the negative signs; each pair makes a positive."],
                    ["Expand the power into repeated factors.", "Count the negative signs.", "The value is " + item.answer + "."]);
            }
        ],
        reordering: [
            function (stage, rng) {
                var item = pick([{ expression: "18 + 37 + 2", answer: 57 }, { expression: "25 × 4 × 7", answer: 700 }, { expression: "48 + 16 + 52", answer: 116 }], rng);
                return number(stage, "Make a helpful pair", "Reorder mentally and work out the value.", item.expression, item.answer,
                    "Correct. Addition and multiplication allow the terms or factors to be regrouped.",
                    ["Look for a pair that makes a multiple of 10 or 100.", "Only reorder additions with additions or factors with factors."],
                    ["Choose the easiest pair first.", "Keep every term or factor.", item.expression + " = " + item.answer + "."]);
            },
            function (stage, rng) {
                var item = pick([{ expression: "20 - 7 - 3", answer: 10 }, { expression: "72 ÷ 8 ÷ 3", answer: 3 }, { expression: "15 - 9 + 4", answer: 10 }], rng);
                return number(stage, "Keep non-commutative operations in order", "Work out the calculation.", item.expression, item.answer,
                    "Correct. Subtraction and division were kept in their written left-to-right order.",
                    ["Subtraction and division cannot be swapped freely.", "For tied operations, work from left to right unless you first rewrite signed terms or factors."],
                    ["Take the first operation from the left.", "Continue with the remaining operation.", item.expression + " = " + item.answer + "."]);
            },
            function (stage, rng) {
                var item = pick([{ expression: "23 - 8 + 7 - 2", answer: 20 }, { expression: "6 × 25 ÷ 3", answer: 50 }, { expression: "14 - 9 + 6", answer: 11 }], rng);
                return number(stage, "Move a term with its sign", "Work out the calculation efficiently.", item.expression, item.answer,
                    "Correct. Each number kept the sign or operation that belongs to it.",
                    ["Treat subtraction as adding a negative when moving terms.", "A number never moves alone; its sign travels with it."],
                    ["Identify each signed term or complete factor.", "Regroup only in a way that preserves those signs.", "The value is " + item.answer + "."]);
            }
        ],
        factorPairs: [
            function (stage, rng) {
                var value = pick([24, 30, 36, 42], rng), pair = pick(factors(value).filter(function (x) { return x <= Math.sqrt(value); }), rng);
                return number(stage, "Complete a factor pair", "What number completes the pair?", pair + " × ? = " + value, value / pair,
                    "Correct. Both numbers divide " + value + " exactly.",
                    ["Use the inverse operation.", "Divide " + value + " by " + pair + "."],
                    [value + " ÷ " + pair + " = " + (value / pair) + ".", "So " + pair + " × " + (value / pair) + " = " + value + "."]);
            },
            function (stage, rng) {
                var value = pick([40, 48, 54, 60], rng), root = Math.floor(Math.sqrt(value));
                return number(stage, "Know where the pairs meet", "What is the largest possible smaller member of a new factor pair worth testing?", String(value), root,
                    "Correct. Once the smaller factor passes " + root + ", every remaining pair has already appeared in reverse.",
                    ["Compare with the square root.", "Factor pairs meet near the square root of " + value + "."],
                    ["Find the greatest whole number not above the square root of " + value + ".", "That number is " + root + ".", "No new smaller factor begins after it."]);
            },
            function (stage, rng) {
                var value = pick([16, 25, 36, 49, 64], rng), root = Math.sqrt(value);
                return number(stage, "Find the factor that pairs with itself", "Which factor appears only once in the middle of the list?", String(value), root,
                    "Correct. " + root + " × " + root + " = " + value + ".",
                    ["The special middle factor occurs for a square number.", "Take the positive square root."],
                    ["Find the square root of " + value + ".", "The square root is " + root + ".", root + " is its own partner."]);
            }
        ],
        divisibility: [
            function (stage, rng) {
                var item = pick([{ step: 6, position: 7 }, { step: 8, position: 6 }, { step: 12, position: 5 }], rng), answer = item.step * item.position;
                return number(stage, "Continue in equal steps", "What is the " + item.position + "th positive multiple of " + item.step + "?", item.step + " × " + item.position, answer,
                    "Correct. A multiple of " + item.step + " is " + item.step + " times a whole number.",
                    ["Positive multiples are the times-table sequence.", "Multiply the step size by the position."],
                    [item.step + " × " + item.position + " = " + answer + ".", "So " + answer + " is that multiple."]);
            },
            function (stage, rng) {
                var item = pick([{ value: 438, divisor: 2 }, { value: 437, divisor: 2 }, { value: 1265, divisor: 5 }, { value: 1264, divisor: 5 }, { value: 4310, divisor: 10 }, { value: 4315, divisor: 10 }], rng);
                var correctIndex = item.value % item.divisor === 0 ? 0 : 1;
                return choice(stage, "Use the last digit", "Is the number divisible by " + item.divisor + "?", String(item.value), ["Yes", "No"], correctIndex,
                    correctIndex === 0 ? ["Correct. The final digit satisfies the test.", "The final digit satisfies the test, so the number is divisible."] : ["The final digit does not satisfy the test.", "Correct. The final digit rules out divisibility."],
                    ["Only the last digit is needed here.", "Compare it with the rule for " + item.divisor + "."],
                    ["Read the final digit.", "Apply the rule for " + item.divisor + ".", "The answer follows without carrying out the full division."]);
            },
            function (stage, rng) {
                var value = pick([7316, 7318, 5428, 5426, 9132, 9134, 6744, 6746], rng), last = value % 100;
                var correctIndex = last % 4 === 0 ? 0 : 1;
                return choice(stage, "Use the final two digits", "Is the number divisible by 4?", String(value), ["Yes", "No"], correctIndex,
                    correctIndex === 0 ? ["Correct. The final two digits form a multiple of 4.", last + " is a multiple of 4, so the whole number is divisible."] : [last + " is not a multiple of 4.", "Correct. The final two digits rule out divisibility by 4."],
                    ["A multiple of 100 is already divisible by 4.", "Only the final two digits remain to test."],
                    ["The final two digits are " + last + ".", "Test whether " + last + " is divisible by 4.", "That decides the whole number."]);
            },
            function (stage, rng) {
                var item = pick([{ value: 729, divisor: 9 }, { value: 438, divisor: 3 }, { value: 1247, divisor: 9 }], rng);
                var sum = String(item.value).split("").reduce(function (a, d) { return a + Number(d); }, 0);
                var correctIndex = sum % item.divisor === 0 ? 0 : 1;
                return choice(stage, "Use the digit sum", "Is the number divisible by " + item.divisor + "?", String(item.value), ["Yes", "No"], correctIndex,
                    correctIndex === 0 ? ["Correct. The digit sum is divisible, so the number is too.", "The digit sum is divisible, so the answer is yes."] : ["The digit sum is not divisible by " + item.divisor + ".", "Correct. The digit sum rules out divisibility by " + item.divisor + "."],
                    ["Add every digit once.", "Test the digit sum for divisibility by " + item.divisor + "."],
                    ["The digit sum is " + sum + ".", "Test " + sum + " ÷ " + item.divisor + ".", "That decides the original number."]);
            }
        ],
        primes: [
            function (stage, rng) {
                var value = pick([1, 2, 17, 21, 29, 35], rng), answer = isPrime(value) ? 0 : 1;
                return choice(stage, "Distinguish prime from composite", "Is this number prime?", String(value), ["Prime", "Not prime"], answer,
                    answer === 0 ? ["Correct. It has exactly the factors 1 and itself.", "No factor other than 1 and itself divides it."] : ["A factor other than 1 and itself divides it, or the number is 1.", "Correct. It does not have exactly two positive factors."],
                    ["A prime has exactly two positive factors.", "Remember that 1 has only one positive factor."],
                    ["Test small possible factors.", isPrime(value) ? "No smaller factor divides exactly." : "A factor other than 1 and itself exists, or the number is 1.", answer === 0 ? "It is prime." : "It is not prime."]);
            },
            function (stage, rng) {
                var value = pick([47, 53, 71, 91], rng), limit = Math.floor(Math.sqrt(value));
                return number(stage, "Know when a prime test can stop", "What is the largest whole number worth testing as a possible smaller factor?", String(value), limit,
                    "Correct. A composite factor pair would have a smaller member no greater than the square root of " + value + ".",
                    ["Use the square-root stopping point.", "Take the whole-number part of the square root of " + value + "."],
                    ["The square root of " + value + " lies between " + limit + " and " + (limit + 1) + ".", "Test primes only up to " + limit + "."]);
            },
            function (stage, rng) {
                var item = pick([{ value: 91, factor: 7 }, { value: 143, factor: 11 }, { value: 187, factor: 11 }], rng);
                return number(stage, "Find the factor that ends the test", "Give a prime factor that proves the number is composite.", String(item.value), item.factor,
                    "Correct. " + item.value + " ÷ " + item.factor + " is exact.",
                    ["Try prime divisors in order.", "An exact division is enough to prove the number composite."],
                    [item.value + " ÷ " + item.factor + " = " + (item.value / item.factor) + ".", "So " + item.factor + " is a factor.", "The number is composite."]);
            }
        ],
        primeFactorisation: [
            function (stage, rng) {
                var value = pick([36, 60, 84, 90], rng), correct = factorText(value);
                var options = [correct, value + " × 1", primeFactors(value).slice(0, -1).join(" × ")];
                return choice(stage, "Finish with primes only", "Which is the complete prime factorisation?", String(value), options, 0,
                    ["Correct. Every factor is prime and the product is " + value + ".", "A factorisation using " + value + " itself has not broken the composite number down.", "At least one prime factor is missing."],
                    ["Keep splitting every composite factor.", "Check that the final primes multiply back to the original number."],
                    ["Break " + value + " into factors.", "Continue until every end is prime.", "Collect repeated primes: " + correct + "."]);
            },
            function (stage, rng) {
                var value = pick([72, 108, 120, 180], rng), count = primeFactors(value).length;
                return number(stage, "Count every prime factor", "How many prime factors are there, counting repeats?", factorText(value), count,
                    "Correct. The indices count " + count + " prime factors altogether.",
                    ["Expand each index into repeated factors.", "Add the indices."],
                    ["Write each power as repeated multiplication.", "Count all the prime factors.", "There are " + count + "."]);
            },
            function (stage, rng) {
                var value = pick([48, 75, 98, 200], rng), correct = factorText(value);
                return choice(stage, "Write the result in index form", "Which index form is correct?", String(value), [correct, primeFactors(value).join(" + "), value + "¹"], 0,
                    ["Correct. Equal prime factors are collected with indices.", "Prime factors are multiplied, not added.", "That has not expressed the number as a product of primes."],
                    ["Find the prime factors first.", "Collect equal primes into a power."],
                    ["Repeatedly divide by the smallest possible prime.", "Group equal primes.", "The index form is " + correct + "."]);
            }
        ],
        hcf: [
            function (stage, rng) {
                var item = pick([[24, 36], [42, 70], [54, 72]], rng), answer = gcd(item[0], item[1]);
                return number(stage, "Find everything shared", "Find the HCF.", item.join(" and "), answer,
                    "Correct. " + answer + " is the greatest factor dividing both numbers.",
                    ["Compare the prime factors shared by both numbers.", "Use each shared prime only as many times as both numbers contain it."],
                    [factorText(item[0]) + " and " + factorText(item[1]) + ".", "Take the shared primes.", "Their product is " + answer + "."]);
            },
            function (stage, rng) {
                var item = pick([[72, 108], [48, 80], [90, 150]], rng), answer = gcd(item[0], item[1]);
                return number(stage, "Take the lower index", "Find the HCF from the prime factorisations.", factorText(item[0]) + " and " + factorText(item[1]), answer,
                    "Correct. The lower index of each shared prime gives " + answer + ".",
                    ["A common factor cannot contain more copies of a prime than either number.", "Choose the lower exponent for each shared prime."],
                    ["Align equal prime bases.", "Take the lower index in each column.", "Multiply to get " + answer + "."]);
            },
            function (stage, rng) {
                var item = pick([[18, 30], [24, 40], [35, 49]], rng), answer = gcd(item[0], item[1]);
                return choice(stage, "Interpret the HCF", "Which statement must be true?", "HCF(" + item.join(", ") + ") = " + answer,
                    ["Every common factor divides " + answer, "Every common factor is larger than " + answer, "The two numbers multiply to " + answer], 0,
                    ["Correct. Every common factor is a factor of the HCF.", "The HCF is the greatest common factor.", "The HCF is not generally the product of the two numbers."],
                    ["Use the meaning of greatest common factor.", "All smaller common factors fit inside it."],
                    [answer + " divides both original numbers.", "Any common factor divides " + answer + "."]);
            }
        ],
        lcm: [
            function (stage, rng) {
                var item = pick([[6, 8], [9, 12], [10, 15]], rng), answer = lcm(item[0], item[1]);
                return number(stage, "Find the first shared multiple", "Find the LCM.", item.join(" and "), answer,
                    "Correct. " + answer + " is the first positive multiple reached by both counts.",
                    ["List multiples until the lists first meet.", "Or combine enough prime factors to contain both numbers."],
                    ["List multiples of each number.", "Find the first value in both lists.", "The LCM is " + answer + "."]);
            },
            function (stage, rng) {
                var item = pick([[24, 36], [40, 60], [45, 75]], rng), answer = lcm(item[0], item[1]);
                return number(stage, "Take the higher index", "Find the LCM from the prime factorisations.", factorText(item[0]) + " and " + factorText(item[1]), answer,
                    "Correct. The higher index of every prime builds a multiple of both numbers.",
                    ["The LCM must contain enough copies of every prime for each number to divide it.", "Choose the higher exponent for every prime present."],
                    ["Align equal prime bases.", "Take the higher index in each column.", "Multiply to get " + answer + "."]);
            },
            function (stage, rng) {
                var item = pick([[8, 12], [9, 15], [14, 21]], rng), answer = lcm(item[0], item[1]);
                return choice(stage, "Interpret the LCM", "Which statement must be true?", "LCM(" + item.join(", ") + ") = " + answer,
                    ["Every common multiple is a multiple of " + answer, "Every common multiple is smaller than " + answer, "The HCF also equals " + answer], 0,
                    ["Correct. All common multiples occur at multiples of the LCM.", "The LCM is the lowest positive common multiple.", "HCF and LCM need not be equal."],
                    ["Think of the shared multiples as repeated steps of the first meeting value.", "The first meeting value divides every later meeting value."],
                    [answer + " is the first common multiple.", "Later common multiples are 2 × " + answer + ", 3 × " + answer + " and so on."]);
            }
        ],
        hcfLcmVenn: [
            function (stage, rng) {
                var item = pick([[12, 18], [20, 30], [24, 36]], rng), h = gcd(item[0], item[1]), l = lcm(item[0], item[1]);
                return number(stage, "Read the overlap", "The overlap contains the shared prime factors. What is their product?", factorText(h), h,
                    "Correct. The overlap multiplies to the HCF, " + h + ".",
                    ["Multiply only the factors in both circles.", "The overlap is the prime factorisation of the HCF."],
                    ["Read the shared prime factors.", "Multiply them together.", "The overlap gives " + h + "."]);
            },
            function (stage, rng) {
                var item = pick([[12, 18], [20, 30], [24, 36]], rng), h = gcd(item[0], item[1]), l = lcm(item[0], item[1]);
                return number(stage, "Use the product identity", "Find the LCM.", item[0] + " × " + item[1] + " = HCF × LCM, and HCF = " + h, l,
                    "Correct. (" + item[0] + " × " + item[1] + ") ÷ " + h + " = " + l + ".",
                    ["Rearrange the identity to make LCM the subject.", "Divide the product of the two numbers by the HCF."],
                    [item[0] + " × " + item[1] + " = " + (item[0] * item[1]) + ".", (item[0] * item[1]) + " ÷ " + h + " = " + l + "."]);
            },
            function (stage, rng) {
                var item = pick([[12, 18, 30], [8, 12, 20], [6, 15, 21]], rng), answer = gcd(gcd(item[0], item[1]), item[2]);
                return number(stage, "Use the centre of three circles", "Find the HCF of all three numbers.", item.join(", "), answer,
                    "Correct. Only factors shared by all three belong in the centre.",
                    ["A factor must divide every one of the three numbers.", "Find the common part shared by all three prime factorisations."],
                    ["Factorise each number.", "Keep only primes present in all three.", "Their product is " + answer + "."]);
            }
        ],
        choosingHcfLcm: [
            function (stage, rng) {
                var item = pick([{ text: "Two buses leave every 12 and 18 minutes. When do they next leave together?", answer: 1 }, { text: "Cut 60 cm by 36 cm card into the largest equal squares.", answer: 0 }], rng);
                return choice(stage, "Choose the structure", item.text, "", ["HCF", "LCM"], item.answer,
                    item.answer === 0 ? ["Correct. Equal largest pieces require the HCF.", "Repeating events would require the LCM."] : ["Equal pieces would require the HCF.", "Correct. Repeating events meet at the LCM."],
                    ["Ask whether amounts are being split or cycles are meeting.", "Largest equal pieces suggest HCF; first shared time suggests LCM."],
                    ["Identify the structure in the wording.", item.answer === 0 ? "The quantities are split into equal pieces." : "The events repeat until they meet.", "Use the " + (item.answer === 0 ? "HCF" : "LCM") + "."]);
            },
            function (stage, rng) {
                var item = pick([{ a: 8, b: 12, kind: "LCM" }, { a: 36, b: 60, kind: "HCF" }, { a: 15, b: 20, kind: "LCM" }], rng);
                var answer = item.kind === "HCF" ? gcd(item.a, item.b) : lcm(item.a, item.b);
                return number(stage, "Carry out the chosen calculation", "Find the " + item.kind + ".", item.a + " and " + item.b, answer,
                    "Correct. The " + item.kind + " is " + answer + ".",
                    [item.kind === "HCF" ? "Keep the shared prime factors." : "Keep enough prime factors to contain both numbers.", "Check the result against the meaning of " + item.kind + "."],
                    ["Prime-factorise both numbers.", item.kind === "HCF" ? "Take the lower shared indices." : "Take the higher indices.", "The result is " + answer + "."]);
            },
            function (stage, rng) {
                var item = pick([{ packs: 6, a: 4, b: 6 }, { packs: 8, a: 6, b: 9 }], rng), common = lcm(item.a, item.b), answer = common / item.a;
                return number(stage, "Answer the question beyond the LCM", "Items come in packs of " + item.a + " and " + item.b + ". At the first matching total, how many packs of " + item.a + " are needed?", item.a + " and " + item.b, answer,
                    "Correct. The matching total is " + common + ", which is " + answer + " packs of " + item.a + ".",
                    ["Find the LCM first, then reread what the question asks for.", "Divide the matching total by the pack size named in the question."],
                    ["LCM(" + item.a + ", " + item.b + ") = " + common + ".", common + " ÷ " + item.a + " = " + answer + "."]);
            }
        ]
    };

    var stages = banks[host.dataset.integratedBank];
    if (!stages) return;
    function seeded(seed) {
        var value = seed >>> 0;
        return function () {
            value = (value * 1664525 + 1013904223) >>> 0;
            return value / 4294967296;
        };
    }
    var api = {
        buildRound: function (rng) {
            var round = [];
            stages.forEach(function (make, stage) {
                for (var i = 0; i < 4; i += 1) {
                    var question = make(stage, rng);
                    if (question.mode === "choice") {
                        var order = question.options.map(function (_, index) { return index; });
                        for (var at = order.length - 1; at > 0; at -= 1) {
                            var swap = Math.floor(rng() * (at + 1));
                            var held = order[at]; order[at] = order[swap]; order[swap] = held;
                        }
                        question.options = order.map(function (index) { return question.options[index]; });
                        question.optionNotes = order.map(function (index) { return question.optionNotes[index]; });
                        question.correctIndex = order.indexOf(question.correctIndex);
                    }
                    round.push(question);
                }
            });
            return round;
        },
        evaluateResponse: function (question, raw) {
            if (question.mode === "choice") {
                if (raw === "") return { state: "blank", text: "Choose an answer, then check it." };
                var index = Number(raw);
                return index === question.correctIndex
                    ? { state: "correct", text: question.optionNotes[index] }
                    : { state: "wrong", text: question.optionNotes[index] };
            }
            if (question.mode === "text") {
                var written = normalise(raw);
                if (!written) return { state: "blank", text: "Enter an answer, then check it." };
                return question.answers.indexOf(written) !== -1
                    ? { state: "correct", text: question.correctNote }
                    : { state: "wrong", text: "Count or order the values again, then revise the answer." };
            }
            var cleaned = normalise(raw).replace(/,/g, "").replace(/[a-z£]/g, "").trim();
            if (!cleaned) return { state: "blank", text: "Enter an answer, then check it." };
            var value = Number(cleaned);
            if (!Number.isFinite(value)) return { state: "unreadable", text: "Use digits and a decimal point if one is needed." };
            if (near(value, question.expected)) return { state: "correct", text: question.correctNote };
            for (var i = 0; i < question.misses.length; i += 1) if (near(value, question.misses[i].value)) return { state: "wrong", text: question.misses[i].text };
            return { state: "wrong", text: question.hints[0] };
        },
        selfCheck: function (iterations) {
            var problems = [];
            for (var seed = 1; seed <= (iterations || 100); seed += 1) {
                var round = api.buildRound(seeded(seed));
                round.forEach(function (question, index) {
                    var exact = question.mode === "choice"
                        ? String(question.correctIndex)
                        : question.mode === "text" ? question.answers[0] : String(question.expected);
                    if (api.evaluateResponse(question, exact).state !== "correct") {
                        problems.push("Seed " + seed + ", question " + (index + 1) + " rejects its answer.");
                    }
                    if (api.evaluateResponse(question, "").state !== "blank") {
                        problems.push("Seed " + seed + ", question " + (index + 1) + " treats blank as an attempt.");
                    }
                    if (question.mode === "choice") {
                        if (new Set(question.options).size !== question.options.length) {
                            problems.push("Seed " + seed + ", question " + (index + 1) + " repeats an option.");
                        }
                        if (!question.options[question.correctIndex]) {
                            problems.push("Seed " + seed + ", question " + (index + 1) + " has no correct option.");
                        }
                    }
                });
                if (problems.length > 40) break;
            }
            return problems;
        }
    };
    scope.IntegratedLessonBank = api;
})(window);
