(function (scope) {
    "use strict";

    function inline(text, ariaLabel) {
        return { kind: "inline", text: text, ariaLabel: ariaLabel };
    }

    function makeQuestion(question, title, values, unit, note) {
        var total = values.reduce(function (sum, value) { return sum + value; }, 0);
        var mean = total / values.length;
        var list = values.join(", ");
        question.title = title;
        question.prompt = "Calculate the mean of " + list + (unit ? " " + unit : ".");
        question.display = inline(list, list);
        question.answerKind = "decimal";
        question.expected = mean;
        question.answerShown = String(mean);
        question.correctNote = "Correct. The total is " + total + ", and " + total + " divided by " + values.length + " is " + mean + (unit ? " " + unit : ".");
        question.hints = [
            "Add every value, then divide the total by the number of values.",
            "The total is " + total + ". Divide it by " + values.length + "."
        ];
        question.steps = [
            "Add the values: " + values.join(" + ") + " = " + total + ".",
            "There are " + values.length + " values.",
            total + " ÷ " + values.length + " = " + mean + (unit ? " " + unit : ".")
        ];
        question.summaryLine = list;
        question.printLine = "Calculate the mean of " + list + (unit ? " " + unit + "." : ".");
        question.contextKey = note || "plain";
        question.factKey = list + "-" + unit;
        return question;
    }

    function fillPlain(question, rng, tools) {
        var sets = [[6, 8, 10], [4, 7, 9, 12], [5, 11, 8], [3, 6, 10, 13]];
        return makeQuestion(question, "Share the total equally", tools.pick(sets, rng), "", "plain");
    }

    function fillDecimal(question, rng, tools) {
        var sets = [[1.2, 1.5, 1.8, 2.1], [2.4, 2.8, 3.1, 3.7], [0.8, 1.1, 1.4]];
        return makeQuestion(question, "Keep the measurement unit", tools.pick(sets, rng), "hours", "measurement");
    }

    function fillScores(question, rng, tools) {
        var sets = [[62, 68, 74, 80, 86], [14, 17, 19, 22, 23], [7, 9, 12, 14]];
        return makeQuestion(question, "Every value contributes", tools.pick(sets, rng), "points", "scores");
    }

    function fillExtreme(question, rng, tools) {
        var sets = [[6, 8, 30], [12, 13, 14, 50], [120, 125, 130, 135, 900]];
        return makeQuestion(question, "Notice the extreme value", tools.pick(sets, rng), "", "extreme");
    }

    var bank = {
        lessonUrl: "/demystifyingmaths/pages/curriculum/GCSE/statistics/averages/averagesFromAList/theMean.html",
        stages: [
            { name: "Calculate the mean", lessonAnchor: "equal-share" },
            { name: "Keep the units", lessonAnchor: "decimal-mean" },
            { name: "Notice an extreme value", lessonAnchor: "extreme-value" }
        ],
        families: [
            ["plain-one", "plain-two", "plain-three", "plain-four"],
            ["decimal-one", "decimal-two", "decimal-three", "decimal-four"],
            ["extreme-one", "extreme-two", "extreme-three", "extreme-four"]
        ],
        fillers: {
            "plain-one": fillPlain, "plain-two": fillPlain, "plain-three": fillPlain, "plain-four": fillPlain,
            "decimal-one": fillDecimal, "decimal-two": fillDecimal, "decimal-three": fillDecimal, "decimal-four": fillDecimal,
            "extreme-one": fillExtreme, "extreme-two": fillExtreme, "extreme-three": fillExtreme, "extreme-four": fillExtreme
        },
        notes: { fallback: "Check the total and divide by the number of values." }
    };

    var api = scope.PracticeEngine.create(bank);
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);