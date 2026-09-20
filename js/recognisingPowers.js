/* Recognising powers of a number: a lab that names a typed number as every
   power it is — 729 = 3^6 = 9^3 = 27^2 — and places it between the squares
   and the cubes on either side of it. The equation is built from the same
   clipped-caret markup the page writes by hand, so a stripped copy still
   reads 3^6 rather than 36. */

document.addEventListener("DOMContentLoaded", () => {
    const lab = document.querySelector("[data-power-names]");
    if (!lab) return;
    const input = lab.querySelector("[data-power-input]");
    const equation = lab.querySelector("[data-power-equation]");
    const squareLine = lab.querySelector("[data-power-square]");
    const cubeLine = lab.querySelector("[data-power-cube]");
    const note = lab.querySelector("[data-power-note]");
    const MIN = 2, MAX = 9999;

    const format = (n) => n.toLocaleString("en-GB");

    /* A power written as the page writes one: the base, a clipped caret that
       survives having the markup stripped, and the raised index. */
    const power = (base, index) => {
        const frag = document.createDocumentFragment();
        frag.append(document.createTextNode(format(base)));
        const caret = document.createElement("span");
        caret.className = "caret";
        caret.setAttribute("aria-hidden", "true");
        caret.textContent = "^";
        const sup = document.createElement("sup");
        sup.textContent = String(index);
        frag.append(caret, sup);
        return frag;
    };
    const notation = (parts) => {
        const span = document.createElement("span");
        span.className = "sf";
        parts.forEach((part) => span.append(typeof part === "string" ? document.createTextNode(part) : part));
        return span;
    };

    /* Every way of writing n as base^index with base ≥ 2 and index ≥ 2,
       smallest base first. */
    const names = (n) => {
        const found = [];
        for (let base = 2; base * base <= n; base++) {
            let value = base * base, index = 2;
            while (value < n) { value *= base; index++; }
            if (value === n) found.push([base, index]);
        }
        return found;
    };

    /* The line for squares or cubes: an exact root, or the two consecutive
       powers the number lies between. */
    const placement = (n, index, word) => {
        const root = Math.round(Math.pow(n, 1 / index));
        const exact = [root - 1, root, root + 1].find((r) => r >= 1 && Math.pow(r, index) === n);
        if (exact !== undefined) {
            return [notation([power(exact, index), ` = ${format(n)}`]), `, so ${format(n)} is a ${word}.`];
        }
        let lower = Math.floor(Math.pow(n, 1 / index));
        while (Math.pow(lower + 1, index) <= n) lower++;
        while (Math.pow(lower, index) > n) lower--;
        const upper = lower + 1;
        return [
            notation([power(lower, index), ` = ${format(Math.pow(lower, index))} < ${format(n)} < ${format(Math.pow(upper, index))} = `, power(upper, index)]),
            `, so ${format(n)} is not a ${word}.`
        ];
    };

    const read = () => {
        const digits = input.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 4);
        if (digits !== input.value) {
            const at = input.selectionStart;
            input.value = digits;
            if (document.activeElement === input) input.setSelectionRange(Math.min(at, digits.length), Math.min(at, digits.length));
        }
        const n = Number(digits);
        return digits && n >= MIN && n <= MAX ? n : null;
    };

    const update = () => {
        const n = read();
        lab.classList.toggle("is-empty", n === null);
        if (note) note.hidden = n !== null;
        if (n === null) return;

        const found = names(n);
        equation.replaceChildren();
        equation.classList.toggle("is-none", !found.length);
        if (found.length) {
            equation.append(document.createTextNode(format(n)));
            found.forEach(([base, index]) => equation.append(document.createTextNode(" = "), power(base, index)));
        } else {
            equation.textContent = `${format(n)} is not a power of any whole number with an index of 2 or more.`;
        }
        squareLine.replaceChildren(...placement(n, 2, "square"));
        cubeLine.replaceChildren(...placement(n, 3, "cube"));
    };

    input.addEventListener("input", update);
    update();
});
