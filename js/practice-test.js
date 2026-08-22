/* Test engine for the practice pages.

   A page hands over a paper definition — sections of question generators — and
   everything here is generic, so the next practice test only needs its own
   question bank.

   A question generator returns:
     {
       prompt:     HTML for the question,
       answer:     {type: "sf",     a: 4.7, n: 4}
                 | {type: "num",    value: 47000}
                 | {type: "choice", options: [HTML, ...], index: 2},
       answerText: HTML of the correct answer, shown on marking,
       marks:      whole number,
       method:     HTML of the worked method, shown on marking
     }                                                                        */

(function () {
    "use strict";

    var MONO_BLANK = "—";

    function el(tag, cls, html) {
        var node = document.createElement(tag);
        if (cls) node.className = cls;
        if (html !== undefined && html !== null) node.innerHTML = html;
        return node;
    }

    function pad(n) { return n < 10 ? "0" + n : String(n); }

    function clock(ms) {
        var secs = Math.floor(ms / 1000);
        return pad(Math.floor(secs / 60)) + ":" + pad(secs % 60);
    }

    /* Accepts what a student actually types: "47 000", "47,000", "4.7e4",
       "4.7 x 10^4", "4.7 × 10^4", and a unicode minus pasted from the page. */
    function parseNumber(raw) {
        if (typeof raw !== "string") return NaN;

        var s = raw.trim().toLowerCase()
            .replace(/[\s,]/g, "")
            .replace(/[−–—]/g, "-");
        if (!s) return NaN;

        /* A leading "10^" must keep its caret, or "100" would be read as 1e0.
           After a multiplication sign the caret can be dropped, since anyone
           typing "4.7x104" means 4.7 × 10^4. */
        s = s.replace(/^10\^(?=-?\d)/, "1e")
            .replace(/[x×*]10\^?(?=-?\d)/g, "e");

        var v = Number(s);
        return isFinite(v) ? v : NaN;
    }

    function near(x, y) {
        if (!isFinite(x) || !isFinite(y)) return false;
        return Math.abs(x - y) <= Math.max(1e-9, Math.abs(y) * 1e-9);
    }

    /* Rewrite a × 10^n so that 1 <= |a| < 10. */
    function normalise(a, n) {
        if (!isFinite(a) || !isFinite(n) || a === 0) return { a: a, n: n };

        var sign = a < 0 ? -1 : 1;
        var m = Math.abs(a);
        var p = n;
        var guard = 0;

        while (m >= 10 && guard++ < 400) { m /= 10; p += 1; }
        guard = 0;
        while (m < 1 && guard++ < 400) { m *= 10; p -= 1; }

        return { a: sign * m, n: p };
    }

    /* MARKING
       Standard-form answers carry two marks and are marked as an exam would
       mark them: the digits and the power are worth one each, and a value that
       is right but not normalised keeps one of the two. */
    function markSF(q, fields) {
        var rawA = fields.a.value;
        var rawN = fields.n.value;

        if (!rawA.trim() && !rawN.trim()) {
            return { marks: 0, state: "blank", verdict: "Not attempted" };
        }

        var a = parseNumber(rawA);
        var n = parseNumber(rawN);
        var aOk = near(a, q.answer.a);
        var nOk = isFinite(n) && n === Math.round(n) && n === q.answer.n;

        if (aOk && nOk) return { marks: q.marks, state: "right", verdict: "Correct" };

        var partial = Math.max(1, q.marks - 1);
        var norm = normalise(a, n);

        if (isFinite(norm.a) && near(norm.a, q.answer.a) && norm.n === q.answer.n) {
            return {
                marks: partial,
                state: "partial",
                verdict: "Right value, wrong form",
                note: "The number itself is correct, but it is not in standard form: " +
                    "the digits in front must be at least 1 and less than 10."
            };
        }

        if (aOk) {
            return { marks: partial, state: "partial", verdict: "Digits right, power wrong" };
        }
        if (nOk) {
            return { marks: partial, state: "partial", verdict: "Power right, digits wrong" };
        }
        return { marks: 0, state: "wrong", verdict: "Not correct" };
    }

    function markNum(q, fields) {
        var raw = fields.value.value;
        if (!raw.trim()) return { marks: 0, state: "blank", verdict: "Not attempted" };

        if (near(parseNumber(raw), q.answer.value)) {
            return { marks: q.marks, state: "right", verdict: "Correct" };
        }
        return { marks: 0, state: "wrong", verdict: "Not correct" };
    }

    function markChoice(q, fields) {
        var chosen = -1;
        fields.options.forEach(function (input, i) {
            if (input.checked) chosen = i;
        });

        if (chosen === -1) return { marks: 0, state: "blank", verdict: "Not attempted" };
        if (chosen === q.answer.index) return { marks: q.marks, state: "right", verdict: "Correct" };
        return { marks: 0, state: "wrong", verdict: "Not correct" };
    }

    function mark(q, fields) {
        if (q.answer.type === "sf") return markSF(q, fields);
        if (q.answer.type === "num") return markNum(q, fields);
        return markChoice(q, fields);
    }

    /* Four bands. The wording tells the reader what to do next, not just how
       well they did — a bare percentage is not a self-check. */
    function band(pct) {
        if (pct >= 90) {
            return {
                tone: "strong",
                text: "Fluent. You can be trusted with this under exam conditions. " +
                    "Take a fresh paper in a week to check it has stuck."
            };
        }
        if (pct >= 70) {
            return {
                tone: "",
                text: "Secure. Read the method on everything you dropped, then take a " +
                    "new paper straight away and aim to clear it."
            };
        }
        if (pct >= 45) {
            return {
                tone: "",
                text: "Unreliable. You can do the steps but not consistently, which loses " +
                    "marks in an exam. Work through every method below before retrying."
            };
        }
        return {
            tone: "weak",
            text: "Not yet. Go back to the teaching page, then come back and use the " +
                "worked examples at the top of this page alongside a new paper."
        };
    }

    function bestStore(key) {
        var full = "dm-practice-best:" + key;
        return {
            read: function () {
                try {
                    var raw = window.localStorage.getItem(full);
                    return raw ? JSON.parse(raw) : null;
                } catch (e) { return null; }
            },
            write: function (value) {
                try {
                    window.localStorage.setItem(full, JSON.stringify(value));
                } catch (e) { /* private browsing, or storage full */ }
            }
        };
    }

    function mount(config) {
        var root = document.querySelector(config.mount);
        if (!root) return;

        var best = bestStore(config.storageKey || config.mount);
        var questions = [];
        var fieldsFor = [];
        var cards = [];
        var marked = false;
        var startedAt = 0;
        var elapsed = 0;
        var ticker = null;
        var confirming = false;

        /* CHROME */

        var bar = el("dl", "ptest__bar");
        var stats = {};

        [
            ["questions", "Questions"],
            ["marks", "Marks"],
            ["answered", "Answered"],
            ["time", "Time"],
            ["best", "Best"]
        ].forEach(function (pair) {
            var wrap = el("div", "ptest__stat");
            wrap.appendChild(el("dt", null, pair[1]));
            var dd = el("dd", null, MONO_BLANK);
            wrap.appendChild(dd);
            bar.appendChild(wrap);
            stats[pair[0]] = dd;
        });

        var scorePanel = el("div");
        scorePanel.hidden = true;
        scorePanel.setAttribute("aria-live", "polite");

        var paper = el("ol", "ptest__paper");

        var actions = el("div", "ptest__actions");
        var markBtn = el("button", "pbtn pbtn--primary", "Mark my paper");
        var newBtn = el("button", "pbtn", "New paper");
        var methodBtn = el("button", "pbtn pbtn--quiet", "Show every method");
        markBtn.type = newBtn.type = methodBtn.type = "button";
        methodBtn.hidden = true;
        actions.appendChild(markBtn);
        actions.appendChild(newBtn);
        actions.appendChild(methodBtn);

        var warning = el("p", "ptest__warning");
        warning.hidden = true;
        warning.setAttribute("aria-live", "polite");

        root.appendChild(bar);
        root.appendChild(scorePanel);
        root.appendChild(paper);
        root.appendChild(actions);
        root.appendChild(warning);

        /* BUILDING A PAPER */

        function countAnswered() {
            var done = 0;
            fieldsFor.forEach(function (fields, i) {
                var type = questions[i].answer.type;
                if (type === "choice") {
                    if (fields.options.some(function (o) { return o.checked; })) done += 1;
                } else if (type === "num") {
                    if (fields.value.value.trim()) done += 1;
                } else if (fields.a.value.trim() || fields.n.value.trim()) {
                    done += 1;
                }
            });
            return done;
        }

        function refreshAnswered() {
            stats.answered.textContent = countAnswered() + " of " + questions.length;
            if (confirming) {
                confirming = false;
                warning.hidden = true;
                markBtn.textContent = "Mark my paper";
            }
        }

        /* The clock is only started by a real answer, so time spent reading the
           worked examples above does not count against the paper. */
        function onAnswer() {
            startClock();
            refreshAnswered();
        }

        function box(cls, label, wide) {
            var input = el("input", "ansfield__box" + (cls ? " " + cls : ""));
            input.type = "text";
            input.autocomplete = "off";
            input.spellcheck = false;
            input.setAttribute("aria-label", label);
            if (wide) input.setAttribute("inputmode", "decimal");
            input.addEventListener("input", onAnswer);
            return input;
        }

        function buildAnswer(q, number) {
            var wrap;

            if (q.answer.type === "sf") {
                wrap = el("div", "ansfield");
                var a = box("", "Question " + number + ", the number in front", true);
                var n = box("ansfield__box--power", "Question " + number + ", the power of ten", false);
                wrap.appendChild(el("span", "ansfield__label", "Answer"));
                wrap.appendChild(a);
                wrap.appendChild(el("span", "ansfield__times", "&times; 10"));
                wrap.appendChild(n);
                fieldsFor.push({ a: a, n: n });
                return wrap;
            }

            if (q.answer.type === "num") {
                wrap = el("div", "ansfield");
                var v = box("", "Question " + number + ", answer", true);
                v.style.width = "220px";
                wrap.appendChild(el("span", "ansfield__label", "Answer"));
                wrap.appendChild(v);
                fieldsFor.push({ value: v });
                return wrap;
            }

            wrap = el("div", "ansfield ansfield--choice");
            var inputs = [];
            q.answer.options.forEach(function (optionHTML, i) {
                var label = el("label", "ansfield__option");
                var radio = el("input");
                radio.type = "radio";
                radio.name = "q" + number + "-option";
                radio.value = String(i);
                radio.addEventListener("change", onAnswer);
                label.appendChild(radio);
                label.appendChild(el("span", null, optionHTML));
                wrap.appendChild(label);
                inputs.push(radio);
            });
            fieldsFor.push({ options: inputs });
            return wrap;
        }

        function buildPaper() {
            questions = [];
            fieldsFor = [];
            cards = [];
            paper.innerHTML = "";
            scorePanel.hidden = true;
            scorePanel.innerHTML = "";
            warning.hidden = true;
            methodBtn.hidden = true;
            methodBtn.textContent = "Show every method";
            markBtn.disabled = false;
            markBtn.className = "pbtn pbtn--primary";
            markBtn.textContent = "Mark my paper";
            newBtn.className = "pbtn";
            marked = false;
            confirming = false;

            var number = 0;
            var totalMarks = 0;

            config.sections.forEach(function (section, sectionIndex) {
                var block = el("li", "psection");
                var head = el("div", "psection__head");
                head.appendChild(el("span", "psection__letter",
                    "Section " + String.fromCharCode(65 + sectionIndex)));
                head.appendChild(el("h2", "psection__name", section.name));
                block.appendChild(head);
                if (section.note) block.appendChild(el("p", "psection__note", section.note));

                section.questions.forEach(function (generator) {
                    var q = generator();
                    number += 1;
                    totalMarks += q.marks;
                    questions.push(q);

                    var card = el("div", "q");
                    var qHead = el("div", "q__head");
                    qHead.appendChild(el("span", "q__no", String(number)));
                    qHead.appendChild(el("div", "q__prompt", q.prompt));
                    qHead.appendChild(el("span", "q__marks",
                        q.marks + (q.marks === 1 ? " mark" : " marks")));
                    card.appendChild(qHead);

                    var answerWrap = el("div", "q__answer");
                    answerWrap.appendChild(buildAnswer(q, number));
                    card.appendChild(answerWrap);

                    block.appendChild(card);
                    cards.push(card);
                });

                paper.appendChild(block);
            });

            stats.questions.textContent = String(questions.length);
            stats.marks.textContent = String(totalMarks);
            refreshAnswered();
            showBest();
            resetClock();
            return totalMarks;
        }

        /* CLOCK — counts up from the first answer. There is no limit; it is there
           so the reader can see whether they are getting faster, which is the
           thing that changes between knowing a method and being fluent in it. */

        function resetClock() {
            window.clearInterval(ticker);
            startedAt = 0;
            elapsed = 0;
            stats.time.textContent = "00:00";
        }

        function startClock() {
            if (startedAt) return;
            startedAt = Date.now();
            ticker = window.setInterval(function () {
                elapsed = Date.now() - startedAt;
                stats.time.textContent = clock(elapsed);
            }, 500);
        }

        function stopClock() {
            window.clearInterval(ticker);
            elapsed = startedAt ? Date.now() - startedAt : 0;
            stats.time.textContent = clock(elapsed);
        }

        function showBest() {
            var saved = best.read();
            stats.best.textContent = saved
                ? saved.marks + " / " + saved.total
                : MONO_BLANK;
        }

        /* MARKING */

        function markPaper() {
            var scored = 0;
            var total = 0;
            var perSection = config.sections.map(function (s) {
                return { name: s.name, scored: 0, total: 0 };
            });

            var index = 0;
            config.sections.forEach(function (section, sectionIndex) {
                section.questions.forEach(function () {
                    var q = questions[index];
                    var fields = fieldsFor[index];
                    var card = cards[index];
                    var result = mark(q, fields);

                    scored += result.marks;
                    total += q.marks;
                    perSection[sectionIndex].scored += result.marks;
                    perSection[sectionIndex].total += q.marks;

                    card.classList.add("q--" + result.state);
                    card.querySelector(".q__marks").textContent =
                        result.marks + " / " + q.marks;

                    Object.keys(fields).forEach(function (key) {
                        var field = fields[key];
                        if (Array.isArray(field)) {
                            field.forEach(function (f) { f.disabled = true; });
                        } else {
                            field.disabled = true;
                        }
                    });

                    var review = el("div", "q__result");
                    review.appendChild(el("p", "q__verdict", result.verdict));

                    var method = "<b>Answer:</b> " + q.answerText + " &mdash; " + q.method;
                    if (result.note) method = "<b>" + result.note + "</b> " + method;
                    review.appendChild(el("p", "q__method", method));

                    if (result.state === "right") review.hidden = true;
                    card.appendChild(review);

                    index += 1;
                });
            });

            stopClock();
            marked = true;
            markBtn.disabled = true;
            markBtn.className = "pbtn";
            newBtn.className = "pbtn pbtn--primary";
            methodBtn.hidden = false;
            warning.hidden = true;

            var pct = total ? Math.round((scored / total) * 100) : 0;
            var verdict = band(pct);
            var saved = best.read();
            var isBest = !saved || (scored / total) > (saved.marks / saved.total);
            if (isBest) best.write({ marks: scored, total: total });
            showBest();

            scorePanel.className = "pscore" + (verdict.tone ? " pscore--" + verdict.tone : "");
            scorePanel.innerHTML = "";

            var main = el("div", "pscore__main");
            main.appendChild(el("span", "pscore__marks", String(scored)));
            main.appendChild(el("span", "pscore__of", "/ " + total + " marks"));
            main.appendChild(el("span", "pscore__pct", pct + "%"));
            scorePanel.appendChild(main);
            scorePanel.appendChild(el("p", "pscore__band", verdict.text));

            var breakdown = el("ul", "pscore__breakdown");
            perSection.forEach(function (s) {
                var row = el("li", "pscore__row");
                row.appendChild(el("span", "pscore__row-name", s.name));
                row.appendChild(el("span", "pscore__row-marks", s.scored + " / " + s.total));
                var track = el("div", "pscore__bar");
                var fill = el("i");
                fill.style.width = (s.total ? Math.round((s.scored / s.total) * 100) : 0) + "%";
                track.appendChild(fill);
                row.appendChild(track);
                breakdown.appendChild(row);
            });
            scorePanel.appendChild(breakdown);

            scorePanel.appendChild(el("p", "pscore__meta",
                "Time taken " + clock(elapsed) +
                (isBest && saved ? " &middot; a new best" : "") +
                " &middot; every question you dropped has its method below."));

            scorePanel.hidden = false;

            var reduced = window.matchMedia &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            scorePanel.scrollIntoView({
                behavior: reduced ? "auto" : "smooth",
                block: "center"
            });
        }

        /* CONTROLS */

        markBtn.addEventListener("click", function () {
            if (marked) return;

            var missing = questions.length - countAnswered();
            if (missing > 0 && !confirming) {
                confirming = true;
                warning.textContent = missing === 1
                    ? "One question is unanswered. Press again to mark it as it stands."
                    : missing + " questions are unanswered. Press again to mark the paper as it stands.";
                warning.hidden = false;
                markBtn.textContent = "Mark it anyway";
                return;
            }
            markPaper();
        });

        newBtn.addEventListener("click", function () {
            buildPaper();
            root.scrollIntoView({ block: "start" });
        });

        methodBtn.addEventListener("click", function () {
            var hidden = cards.some(function (card) {
                var review = card.querySelector(".q__result");
                return review && review.hidden;
            });
            cards.forEach(function (card) {
                var review = card.querySelector(".q__result");
                if (review) review.hidden = !hidden;
            });
            methodBtn.textContent = hidden ? "Hide the methods you got right" : "Show every method";
        });

        buildPaper();
    }

    window.PracticeTest = {
        mount: function (config) {
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", function () { mount(config); });
            } else {
                mount(config);
            }
        }
    };
})();
