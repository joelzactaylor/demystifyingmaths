/* Fixed, cumulative questions: fluency, notation, application and reasoning. */
(() => {
    const pow = (b, n) => `${b}<span class="caret" aria-hidden="true">^</span><sup>${n}</sup>`;
    const root = (n, order = 2) => `<span role="math" aria-label="${order === 2 ? "square" : order === 3 ? "cube" : order + "th"} root of ${n}"><span class="rad${order === 2 ? "" : " rad--order"}"><span class="caret" aria-hidden="true">${order === 2 ? "" : order}√(</span>${order === 2 ? "" : `<span class="rad__index" data-order="${order}" aria-hidden="true"></span>`}<svg class="rad__sign" viewBox="0 0 24 40" aria-hidden="true" focusable="false"><path d="M.5 24H5l5.5 13.5L22 1.5H24" fill="none" stroke="currentColor" stroke-width="3"/></svg><span class="rad__over">${String(n).replace("-", "−")}</span></span><span class="caret" aria-hidden="true">)</span></span>`;
    const numeric = (prompt, expected, check) => ({prompt, expected, check, type: "number", unit: prompt.includes("four sides is") ? "cm" : prompt.includes("square face is") ? "cm²" : ""});
    const reasoning = (prompt, choices, correct, why) => ({prompt, choices, expected: String(correct), why, type: "choice"});
    function build(page) {
        const b = 3, e = 4, side = 9, applicationSide = 12;
        const recall = numeric(`${pow(11, 2)} =`, 121, n => `${n} is not 11 × 11. Multiply the two equal factors.`);
        if (page === "indexNotation") return [
            numeric(`${pow(b, e)} =`, b ** e, n => `${n} is not the product of ${e} factors of ${b}. Multiply one factor at a time.`),
            recall,
            numeric(`A mosaic is a square with ${side} tiles along each edge. The number of tiles is`, side ** 2, n => `${n} tiles would not fill ${side} rows of ${side}. Multiply the number of rows by the number in each row.`),
            reasoning(`${pow(b, e)} =`, [`${b} × ${e}`, Array(e).fill(b).join(" × "), Array(b).fill(e).join(" + ")], 1, `The index counts ${e} equal factors of ${b}; it does not tell us to multiply the base by ${e}.`)
        ];
        if (page === "recognisingPowers") return [
            recall,
            numeric(`When ${b ** e} is written as a power of ${b}, the index is`, e, n => `An index of ${n} would mean ${n} factors of ${b}. Keep multiplying by ${b} until the product is ${b ** e}.`),
            numeric(`A cube is built from 64 unit cubes. The number along each edge is`, 4, n => `${n} along each edge would make ${n ** 3} cubes. There are three equal dimensions.`),
            reasoning(`${side ** 2 + 1} is not a square number because`, ["it is positive", "it lies strictly between neighbouring whole-number squares", "it is larger than 100"], 1, `${side} squared is ${side ** 2}; ${side + 1} squared is ${(side + 1) ** 2}. No whole-number square lies strictly between them.`)
        ];
        const decimal = 0.4;
        const area = Number((decimal * decimal).toFixed(2));
        if (page === "squareRoots") return [
            recall,
            numeric(`${root(side ** 2)} =`, side, n => `${n} × ${n} = ${Number((n * n).toPrecision(10))}. The answer must be non-negative and its square must be ${side ** 2}.`),
            numeric(`<span class="recall-context">A square has area ${applicationSide ** 2} cm².</span>The total length of its four sides is`, applicationSide * 4, n => `${n === applicationSide ? "That is the side length." : "Find the side length first by taking the square root of the area."} Add all four equal sides.`),
            reasoning(`${root(area)} is larger than ${area} because`, ["taking a square root always makes a number larger", `its value is ${decimal}, since ${decimal} × ${decimal} = ${area}`, `its value is ${area / 2}, since ${area} ÷ 2 = ${area / 2}`], 1, `${decimal} × ${decimal} = ${area}, so the root is ${decimal}. Taking a root reverses that multiplication; it does not halve the number.`)
        ];
        if (page === "positiveAndNegativeRoots") return [
            numeric(`${root(side ** 2)} =`, side, n => `${n} must be non-negative and square to ${side ** 2}. The root symbol gives one value.`),
            {prompt: `<span class="recall-context">For ${pow("x", 2)} = ${side ** 2}, both solutions are given by</span>x =`, expected: side, type: "pair", check: () => `Both ${side} and −${side} square to ${side ** 2}. Include both values, separated by a comma, or use ±.`},
            numeric(`<span class="recall-context">A square has area ${applicationSide ** 2} cm².</span>The total length of its four sides is`, applicationSide * 4, n => `${n === applicationSide ? "That is one side, not all four." : "Find the non-negative side length from the area."} Add the four equal lengths.`),
            reasoning(`The equation ${pow("x", 2)} = 0 has only one solution because`, ["zero has no square root", "zero and its negative are the same number", "a squared equation always has only one solution"], 1, "Zero squares to zero, and −0 is the same number as 0. Every non-zero real number has a positive square.")
        ];
        if (page === "cubeAndHigherRoots") {
            const c = 5, order = 5, higher = 3;
            return [
                numeric(`${root(-(c ** 3), 3)} =`, -c, n => `${n} cubed is ${n ** 3}. An odd power keeps the sign; the required cube is ${-(c ** 3)}.`),
                numeric(`${root(higher ** order, order)} =`, higher, n => n === -higher && order % 2 === 0
                    ? `${n} does have the required power, but an even-order root symbol gives the non-negative value.`
                    : `${n} raised to power ${order} gives ${n ** order}. Look for ${order} equal factors of ${higher ** order}.`),
                numeric(`<span class="recall-context">A cube has volume 64 cm³.</span>The area of one square face is`, 16, n => `${n === 4 ? "That is the edge length." : "Find the edge length from the volume first."} A face has two equal dimensions, not three.`),
                reasoning(`The solutions of ${pow("x", 2)} = ${side ** 2} are`, [`${side} only`, `−${side} only`, `${side} and −${side}`], 2, `Multiplying two negative factors gives a positive product, so both signs give a square of ${side ** 2}.`)
            ];
        }
        return [];
    }
    const normalise = value => String(value).trim().replace(/−/g, "-");
    function correct(q, value) {
        const raw = normalise(value);
        if (q.type === "choice") return raw === q.expected;
        if (q.type === "pair") {
            const pm = raw.match(/^(?:±|\+\/-|\+-)\s*(\d+(?:\.\d+)?)$/);
            if (pm) return Number(pm[1]) === q.expected;
            const parts = raw.split(/\s*(?:,|\band\b)\s*/i);
            return parts.length === 2 && parts.every(p => /^[+-]?\d+(?:\.\d+)?$/.test(p)) &&
                parts.map(Number).sort((a,b) => a-b).every((n,i) => n === (i ? q.expected : -q.expected));
        }
        return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw) && Number(raw) === q.expected;
    }
    function help(q, value) {
        if (q.type === "choice") return `“${q.choices[Number(value)]}” does not fit. ${q.why}`;
        if (q.type === "pair") return q.check(value);
        const raw = normalise(value);
        if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw) || !Number.isFinite(Number(raw))) return "Enter one number, without units or a calculation.";
        return q.check(Number(raw));
    }
    window.PowersRootsRecallBank = {build, correct, help};
})();
