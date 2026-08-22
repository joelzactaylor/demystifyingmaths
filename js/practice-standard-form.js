/* Question bank for the standard form test.

   Every question is generated, so a new paper is a new set of numbers rather
   than the same twelve questions shuffled. The paper keeps its shape: the same
   twelve skills appear every time, in the same order, graded from conversion to
   reasoning.

   All the arithmetic below is done on decimal strings rather than floats, so
   answers like 3.65 and 6.25 come out exact and never as 3.6500000000000004. */

(function () {
    "use strict";

    /* EXACT DECIMAL ARITHMETIC */

    function decToPair(s) {
        var dot = s.indexOf(".");
        if (dot === -1) return { d: Number(s), p: 0 };
        return { d: Number(s.replace(".", "")), p: s.length - dot - 1 };
    }

    function pairToStr(d, p) {
        var neg = d < 0;
        var s = String(Math.abs(d));
        while (s.length <= p) s = "0" + s;

        var out = p ? s.slice(0, s.length - p) + "." + s.slice(s.length - p) : s;
        if (out.indexOf(".") >= 0) out = out.replace(/0+$/, "").replace(/\.$/, "");
        return (neg ? "-" : "") + out;
    }

    function mulStr(x, y) {
        var a = decToPair(x);
        var b = decToPair(y);
        return pairToStr(a.d * b.d, a.p + b.p);
    }

    function addStr(x, y, sign) {
        var a = decToPair(x);
        var b = decToPair(y);
        var p = Math.max(a.p, b.p);
        return pairToStr(a.d * Math.pow(10, p - a.p) + sign * b.d * Math.pow(10, p - b.p), p);
    }

    function dpOf(s) {
        var dot = s.indexOf(".");
        return dot === -1 ? 0 : s.length - dot - 1;
    }

    /* Move the decimal point n places right (n > 0) or left (n < 0). */
    function shift(s, n) {
        var neg = s.charAt(0) === "-";
        if (neg) s = s.slice(1);

        var parts = s.split(".");
        var ip = parts[0];
        var fp = parts.length > 1 ? parts[1] : "";

        if (n > 0) {
            while (fp.length < n) fp += "0";
            ip += fp.slice(0, n);
            fp = fp.slice(n);
        } else if (n < 0) {
            var k = -n;
            while (ip.length < k + 1) ip = "0" + ip;
            fp = ip.slice(ip.length - k) + fp;
            ip = ip.slice(0, ip.length - k);
        }

        ip = ip.replace(/^0+(?=\d)/, "");
        fp = fp.replace(/0+$/, "");
        return (neg ? "-" : "") + (fp ? ip + "." + fp : ip);
    }

    /* The power of ten that would put this number into standard form. */
    function decExp(s) {
        var t = s.replace("-", "");
        var dot = t.indexOf(".");
        var ip = dot === -1 ? t : t.slice(0, dot);
        var fp = dot === -1 ? "" : t.slice(dot + 1);
        var trimmed = ip.replace(/^0+/, "");

        if (trimmed) return trimmed.length - 1;

        var zeros = 0;
        while (zeros < fp.length && fp.charAt(zeros) === "0") zeros += 1;
        return -(zeros + 1);
    }

    /* s written as a × 10^k with 1 <= a < 10. */
    function normStr(s) {
        var k = decExp(s);
        return { a: shift(s, -k), k: k };
    }

    /* PRESENTATION */

    /* Digits are grouped in threes on both sides of the point, which is how a
       paper sets them out and the only way the zeros stay countable. */
    function group(s) {
        var parts = s.split(".");
        var ip = parts[0];
        var fp = parts.length > 1 ? parts[1] : "";

        if (ip.replace("-", "").length >= 5) ip = ip.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        if (fp.length >= 5) fp = fp.replace(/(\d{3})(?=\d)/g, "$1 ");

        return fp ? ip + "." + fp : ip;
    }

    function sup(n) { return String(n).replace("-", "−"); }

    /* A negative power gets brackets when it appears in a sum, so a method never
       reads "4 + −5". */
    function signed(n) { return n < 0 ? "(" + sup(n) + ")" : String(n); }

    function sfHTML(a, n) {
        return '<span class="sf">' + a + " &times; 10<sup>" + sup(n) + "</sup></span>";
    }

    function ordHTML(s) { return '<span class="sf">' + group(s) + "</span>"; }

    function powHTML(a, n, k) {
        return '<span class="sf">(' + a + " &times; 10<sup>" + sup(n) + "</sup>)<sup>" + k + "</sup></span>";
    }

    function plural(n, word) { return n + " " + word + (Math.abs(n) === 1 ? "" : "s"); }

    /* RANDOMNESS */

    function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
    function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

    function mantissa(maxDp) {
        var s = String(rnd(1, 9));
        var dp = rnd(0, maxDp);

        if (dp > 0) {
            var frac = "";
            for (var i = 0; i < dp; i++) frac += String(rnd(0, 9));
            frac = frac.replace(/0+$/, "");
            if (frac) s += "." + frac;
        }
        return s;
    }

    /* The note that follows any calculation whose answer lands outside 1 to 10.
       This is the step that is skipped most often, so it is always spelled out. */
    function tidyNote(raw, norm, n) {
        if (norm.k === 0) return "";

        return " That is " + ordHTML(raw) + " &times; 10<sup>" + sup(n - norm.k) + "</sup>, " +
            "which is not yet standard form, because " + ordHTML(raw) + " is " +
            (norm.k > 0 ? "10 or more" : "less than 1") + ". Moving the point " +
            plural(Math.abs(norm.k), "place") + " " + (norm.k > 0 ? "left" : "right") +
            " and " + (norm.k > 0 ? "raising" : "lowering") + " the power by " +
            Math.abs(norm.k) + " gives " + sfHTML(norm.a, n) + ".";
    }

    /* SECTION A — CONVERSION */

    function qBigToSF() {
        var a = mantissa(2);
        var n = rnd(3, 8);
        var ordinary = shift(a, n);

        return {
            prompt: "Write " + ordHTML(ordinary) + " in standard form.",
            answer: { type: "sf", a: Number(a), n: n },
            answerText: sfHTML(a, n),
            marks: 2,
            method: "Put the decimal point after the first non-zero digit, giving " +
                ordHTML(a) + ", then count how far it has moved: " + plural(n, "place") +
                " to the left, so the power is " + n + "."
        };
    }

    function qSmallToSF() {
        var a = mantissa(2);
        var n = -rnd(2, 6);
        var ordinary = shift(a, n);

        return {
            prompt: "Write " + ordHTML(ordinary) + " in standard form.",
            answer: { type: "sf", a: Number(a), n: n },
            answerText: sfHTML(a, n),
            marks: 2,
            method: "The point has to move " + plural(-n, "place") + " to the right to give " +
                ordHTML(a) + ", so the power is " + sup(n) + ". A negative power means a " +
                "small number, not a negative one."
        };
    }

    function qSFToBig() {
        var a = mantissa(2);
        var n = rnd(3, 7);
        var ordinary = shift(a, n);

        return {
            prompt: "Write " + sfHTML(a, n) + " as an ordinary number.",
            answer: { type: "num", value: Number(ordinary) },
            answerText: ordHTML(ordinary),
            marks: 1,
            method: "A power of " + n + " moves the decimal point " + plural(n, "place") +
                " to the right. Fill the gaps with zeros."
        };
    }

    function qSFToSmall() {
        var a = mantissa(2);
        var n = -rnd(2, 6);
        var ordinary = shift(a, n);

        return {
            prompt: "Write " + sfHTML(a, n) + " as an ordinary number.",
            answer: { type: "num", value: Number(ordinary) },
            answerText: ordHTML(ordinary),
            marks: 1,
            method: "A power of " + sup(n) + " moves the decimal point " + plural(-n, "place") +
                " to the left, so the " + a.charAt(0) + " ends up in the " + (-n) +
                (-n === 2 ? "nd" : (-n === 3 ? "rd" : "th")) + " decimal place."
        };
    }

    function qTidy() {
        var tooBig = Math.random() < 0.5;
        var m = tooBig
            ? String(rnd(11, 99))
            : ("0." + String(rnd(11, 99))).replace(/0$/, "");
        var start = tooBig ? rnd(2, 7) : rnd(3, 8);

        var norm = normStr(m);
        var n = start + norm.k;

        return {
            prompt: "The number " + sfHTML(m, start) + " is <em>not</em> in standard form. " +
                "Write it in standard form.",
            answer: { type: "sf", a: Number(norm.a), n: n },
            answerText: sfHTML(norm.a, n),
            marks: 2,
            method: "Standard form needs the number in front to be at least 1 and less than 10, " +
                "and " + ordHTML(m) + " is not. Moving the point " +
                plural(Math.abs(norm.k), "place") + " " + (norm.k > 0 ? "left" : "right") +
                " gives " + ordHTML(norm.a) + ", and the power " +
                (norm.k > 0 ? "rises" : "falls") + " by " + Math.abs(norm.k) + " to " +
                sup(n) + " to keep the value the same."
        };
    }

    /* SECTION B — CALCULATION */

    var MUL_LEFT = ["1.2", "1.5", "2", "2.4", "2.5", "3", "3.5", "4", "5", "6", "7", "8"];
    var MUL_RIGHT = ["1.5", "2", "2.5", "3", "4", "5"];

    function pickMul(wantCarry) {
        for (var i = 0; i < 80; i++) {
            var a1 = pick(MUL_LEFT);
            var a2 = pick(MUL_RIGHT);
            var product = mulStr(a1, a2);
            if ((Number(product) >= 10) !== wantCarry) continue;

            var norm = normStr(product);
            if (dpOf(norm.a) > 2) continue;
            return { a1: a1, a2: a2, product: product, norm: norm };
        }

        return wantCarry
            ? { a1: "4", a2: "5", product: "20", norm: { a: "2", k: 1 } }
            : { a1: "2", a2: "3", product: "6", norm: { a: "6", k: 0 } };
    }

    function nonZero(min, max) {
        var v = 0;
        while (v === 0) v = rnd(min, max);
        return v;
    }

    function makeMul(wantCarry) {
        var parts = pickMul(wantCarry);
        var n1 = rnd(2, 8);
        var n2 = nonZero(-5, 6);

        /* An answer of 10^0 is correct standard form but reads as a trick, and
           anyone who writes the value plainly instead would score nothing. */
        if (n1 + n2 + parts.norm.k === 0) n1 += 1;
        var n = n1 + n2 + parts.norm.k;

        return {
            prompt: "Work out (" + sfHTML(parts.a1, n1) + ") &times; (" + sfHTML(parts.a2, n2) +
                "). Give your answer in standard form.",
            answer: { type: "sf", a: Number(parts.norm.a), n: n },
            answerText: sfHTML(parts.norm.a, n),
            marks: 2,
            method: "Multiply the numbers in front and add the powers: " +
                ordHTML(parts.a1) + " &times; " + ordHTML(parts.a2) + " = " + ordHTML(parts.product) +
                ", and " + n1 + " + " + signed(n2) + " = " + sup(n1 + n2) + "." +
                (parts.norm.k === 0
                    ? " That gives " + sfHTML(parts.product, n) + " straight away."
                    : tidyNote(parts.product, parts.norm, n))
        };
    }

    function qMulPlain() { return makeMul(false); }
    function qMulCarry() { return makeMul(true); }

    var QUOT_PLAIN = ["1.2", "1.4", "1.5", "2", "2.5", "3", "4", "4.2"];
    var QUOT_SHIFT = ["0.2", "0.25", "0.4", "0.5", "0.6", "0.75", "0.8"];
    var DIVISORS = ["2", "3", "4", "5", "8"];

    function pickDiv(wantShift) {
        var quotients = wantShift ? QUOT_SHIFT : QUOT_PLAIN;

        for (var i = 0; i < 80; i++) {
            var q = pick(quotients);
            var d = pick(DIVISORS);
            var a1 = mulStr(q, d);
            if (Number(a1) < 1 || Number(a1) >= 10 || dpOf(a1) > 2) continue;
            return { a1: a1, a2: d, quotient: q, norm: normStr(q) };
        }

        return wantShift
            ? { a1: "2", a2: "8", quotient: "0.25", norm: { a: "2.5", k: -1 } }
            : { a1: "8.4", a2: "2", quotient: "4.2", norm: { a: "4.2", k: 0 } };
    }

    function qDiv() {
        var parts = pickDiv(Math.random() < 0.5);
        var n1 = rnd(3, 9);
        var n2 = nonZero(-4, 5);

        if (n1 - n2 + parts.norm.k === 0) n1 += 1;
        var n = n1 - n2 + parts.norm.k;

        return {
            prompt: "Work out (" + sfHTML(parts.a1, n1) + ") &divide; (" + sfHTML(parts.a2, n2) +
                "). Give your answer in standard form.",
            answer: { type: "sf", a: Number(parts.norm.a), n: n },
            answerText: sfHTML(parts.norm.a, n),
            marks: 2,
            method: "Divide the numbers in front and subtract the powers: " +
                ordHTML(parts.a1) + " &divide; " + ordHTML(parts.a2) + " = " +
                ordHTML(parts.quotient) + ", and " + n1 + " &minus; " + signed(n2) + " = " +
                sup(n1 - n2) + "." +
                (parts.norm.k === 0
                    ? " That gives " + sfHTML(parts.quotient, n) + " straight away."
                    : tidyNote(parts.quotient, parts.norm, n))
        };
    }

    function qAddSub() {
        var adding = Math.random() < 0.5;
        var a1 = rnd(1, 8) + "." + rnd(1, 9);
        var a2 = rnd(1, 9) + "." + rnd(1, 9);
        var n = rnd(2, 7);

        var lifted = shift(a1, 1);
        var total = addStr(lifted, a2, adding ? 1 : -1);
        var norm = normStr(total);

        return {
            prompt: "Work out " + sfHTML(a1, n + 1) + (adding ? " + " : " &minus; ") +
                sfHTML(a2, n) + ". Give your answer in standard form.",
            answer: { type: "sf", a: Number(norm.a), n: n + norm.k },
            answerText: sfHTML(norm.a, n + norm.k),
            marks: 2,
            method: "The powers are different, so the numbers in front cannot be " +
                (adding ? "added" : "subtracted") + " as they stand. Rewrite the first with the " +
                "same power: " + sfHTML(a1, n + 1) + " = " + sfHTML(lifted, n) + ". Then " +
                ordHTML(lifted) + (adding ? " + " : " &minus; ") + ordHTML(a2) + " = " +
                ordHTML(total) + "." + tidyNote(total, norm, n + norm.k)
        };
    }

    function qPower() {
        var cube = Math.random() < 0.35;
        var k = cube ? 3 : 2;
        var a = pick(cube ? ["2", "3"] : ["2", "3", "4", "5", "6", "7", "1.5", "2.5"]);
        var n = rnd(2, 6) * (Math.random() < 0.25 ? -1 : 1);

        var value = a;
        for (var i = 1; i < k; i++) value = mulStr(value, a);

        var norm = normStr(value);
        var answerN = n * k + norm.k;

        return {
            prompt: "Work out " + powHTML(a, n, k) + ". Give your answer in standard form.",
            answer: { type: "sf", a: Number(norm.a), n: answerN },
            answerText: sfHTML(norm.a, answerN),
            marks: 2,
            method: (cube ? "Cube" : "Square") + " both parts: " + ordHTML(a) + "<sup>" + k +
                "</sup> = " + ordHTML(value) + ", and the power is multiplied by " + k +
                " to give " + sup(n * k) + "." +
                (norm.k === 0
                    ? " That gives " + sfHTML(value, answerN) + " straight away."
                    : tidyNote(value, norm, answerN))
        };
    }

    /* SECTION C — REASONING */

    function shuffle(list) {
        for (var i = list.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var swap = list[i];
            list[i] = list[j];
            list[j] = swap;
        }
        return list;
    }

    function qCompare() {
        var e = rnd(4, 8);
        var winner = pick(["1.5", "1.8", "2.1", "2.4", "3"]);
        var bigDigits = pick(["8.9", "9.2", "9.6", "9.9"]);
        var loose = String(rnd(41, 89));
        var plain = pick(["6.4", "7.5", "8.2"]);

        /* The three that are not the answer are each designed to look bigger
           than they are: the largest digits, the longest string of digits, and
           an ordinary number with the most zeros. */
        var entries = [
            { html: sfHTML(winner, e + 1), a: winner, n: e + 1, correct: true },
            { html: sfHTML(bigDigits, e), a: bigDigits, n: e },
            { html: sfHTML(loose, e - 1), a: normStr(loose).a, n: e - 1 + normStr(loose).k },
            { html: ordHTML(shift(plain, e - 1)), a: plain, n: e - 1 }
        ];

        var options = shuffle(entries.slice());
        var index = 0;
        options.forEach(function (entry, i) {
            if (entry.correct) index = i;
        });

        var sorted = entries.slice().sort(function (x, y) {
            return y.n - x.n || Number(y.a) - Number(x.a);
        });

        return {
            prompt: "Which of these numbers is the <strong>largest</strong>?",
            answer: {
                type: "choice",
                index: index,
                options: options.map(function (entry) { return entry.html; })
            },
            answerText: sfHTML(winner, e + 1),
            marks: 1,
            method: "Put every number into standard form first, then compare the powers; " +
                "the digits in front only decide it when two powers are equal. In order: " +
                sorted.map(function (entry) { return sfHTML(entry.a, entry.n); }).join(", ") +
                ". " + sfHTML(loose, e - 1) + " has the most digits and " +
                sfHTML(bigDigits, e) + " has the biggest number in front, and neither is the largest."
        };
    }

    var CONTEXTS = [
        {
            op: "mul",
            n1: function () { return -rnd(4, 6); },
            n2: function () { return rnd(6, 9); },
            text: function (a1, n1, a2, n2) {
                return "A single grain of sand has a mass of " + sfHTML(a1, n1) + " kg. " +
                    "A bucket holds " + sfHTML(a2, n2) + " grains. Work out the total mass of " +
                    "sand in the bucket, in kilograms.";
            },
            why: "Every grain has that mass and there are that many of them, so the two are multiplied."
        },
        {
            op: "mul",
            n1: function () { return rnd(3, 5); },
            n2: function () { return rnd(2, 4); },
            text: function (a1, n1, a2, n2) {
                return "A factory makes " + sfHTML(a1, n1) + " components every hour. " +
                    "How many does it make in " + sfHTML(a2, n2) + " hours?";
            },
            why: "A rate multiplied by a time gives a total."
        },
        {
            op: "div",
            n1: function () { return -rnd(2, 3); },
            n2: function () { return -rnd(5, 7); },
            text: function (a1, n1, a2, n2) {
                return "A cell is " + sfHTML(a2, n2) + " m across. How many cells, placed in a " +
                    "line touching each other, would stretch " + sfHTML(a1, n1) + " m?";
            },
            why: "The total length is being split into pieces of one cell each, so it is a division."
        },
        {
            op: "div",
            n1: function () { return rnd(11, 13); },
            n2: function () { return rnd(6, 8); },
            text: function (a1, n1, a2, n2) {
                return "A drive stores " + sfHTML(a1, n1) + " bytes. Each film on it takes " +
                    sfHTML(a2, n2) + " bytes. How many films does the drive hold?";
            },
            why: "The total is being shared into equal pieces, so it is a division, not a multiplication."
        }
    ];

    function qContext() {
        var context = pick(CONTEXTS);
        var n1 = context.n1();
        var n2 = context.n2();

        if (context.op === "mul") {
            var m = pickMul(Math.random() < 0.5);
            if (n1 + n2 + m.norm.k === 0) n2 += 1;
            var mn = n1 + n2 + m.norm.k;

            return {
                prompt: context.text(m.a1, n1, m.a2, n2),
                answer: { type: "sf", a: Number(m.norm.a), n: mn },
                answerText: sfHTML(m.norm.a, mn),
                marks: 2,
                method: context.why + " Multiply the numbers in front and add the powers: " +
                    ordHTML(m.a1) + " &times; " + ordHTML(m.a2) + " = " +
                    ordHTML(m.product) + ", and " + signed(n1) + " + " + signed(n2) + " = " +
                    sup(n1 + n2) + "." + (m.norm.k === 0
                        ? " That gives " + sfHTML(m.product, mn) + "."
                        : tidyNote(m.product, m.norm, mn))
            };
        }

        var d = pickDiv(Math.random() < 0.5);
        if (n1 - n2 + d.norm.k === 0) n1 += 1;
        var dn = n1 - n2 + d.norm.k;

        return {
            prompt: context.text(d.a1, n1, d.a2, n2),
            answer: { type: "sf", a: Number(d.norm.a), n: dn },
            answerText: sfHTML(d.norm.a, dn),
            marks: 2,
            method: context.why + " Divide the numbers in front and subtract the powers: " +
                ordHTML(d.a1) + " &divide; " + ordHTML(d.a2) + " = " +
                ordHTML(d.quotient) + ", and " + signed(n1) + " &minus; " + signed(n2) + " = " +
                sup(n1 - n2) + "." + (d.norm.k === 0
                    ? " That gives " + sfHTML(d.quotient, dn) + "."
                    : tidyNote(d.quotient, d.norm, dn))
        };
    }

    /* THE PAPER */

    window.PracticeTest.mount({
        mount: "#standard-form-test",
        storageKey: "gcse-number-standard-form",
        sections: [
            {
                name: "Conversion",
                note: "Between ordinary numbers and standard form, in both directions.",
                questions: [qBigToSF, qSmallToSF, qSFToBig, qSFToSmall, qTidy]
            },
            {
                name: "Calculation",
                note: "Arithmetic on numbers already written in standard form. " +
                    "Every answer must itself be in standard form.",
                questions: [qMulPlain, qMulCarry, qDiv, qAddSub, qPower]
            },
            {
                name: "Reasoning",
                note: "Two questions that need a decision before any arithmetic starts.",
                questions: [qCompare, qContext]
            }
        ]
    });
})();
