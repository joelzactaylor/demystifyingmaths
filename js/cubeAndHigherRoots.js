/* The sign of a product, turning over as its count of negative factors rises.

   The page has no scroll-led card. Its subject is notation and a sign rule, and
   the one thing on it that genuinely moves is a mapping the reader can drive:
   take (−3) as a factor n times, and watch the product land negative, positive,
   negative as n goes odd, even, odd. That is why an odd root reaches every
   number and an even root reaches no negative one — the whole of the page's
   last section, shown rather than asserted.

   Every root sign here is drawn, in the figure as much as in the prose: an SVG
   arm whose end sits at the top of its box, beside a radicand carrying the bar
   as a border, with the order set in the crook. A browser lays <msqrt> out from
   the font's OpenType MATH table, and macOS ships no font that has one. */

document.addEventListener("DOMContentLoaded", () => {
    const figure = document.querySelector(".parity");
    const scale = document.querySelector("[data-scale]");
    const factorsLine = document.querySelector("[data-factors]");
    const reading = document.querySelector("[data-reading]");
    if (!figure || !scale || !factorsLine || !reading) return;

    const cells = Array.from(scale.querySelectorAll("[data-cell]"));
    if (!cells.length) return;

    const BASE = -3;
    const MIN = 2;
    const MAX = 6;
    const MINUS = "−";

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const signed = (value) => (value < 0 ? MINUS + Math.abs(value).toLocaleString("en-GB")
        : value.toLocaleString("en-GB"));
    const spoken = (value) => (value < 0 ? `negative ${Math.abs(value)}` : String(value));
    const ORDINAL = { 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", 6: "6th" };

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    /* The clipped copy of a character that positioning would otherwise lose.
       Never seen, never spoken. */
    const hiddenText = (text) => {
        const mark = el("span", "caret", text);
        mark.setAttribute("aria-hidden", "true");
        return mark;
    };

    const SVG_NS = "http://www.w3.org/2000/svg";
    const radicalSign = () => {
        const svg = document.createElementNS(SVG_NS, "svg");
        svg.setAttribute("class", "rad__sign");
        svg.setAttribute("viewBox", "0 0 24 40");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", "M.5 24H5l5.5 13.5L22 1.5H24");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "currentColor");
        path.setAttribute("stroke-width", "3");
        path.setAttribute("stroke-linejoin", "miter");
        path.setAttribute("stroke-linecap", "butt");
        svg.append(path);
        return svg;
    };

    /* Flattened, a radical is worth only its radicand: "−27" alone would turn
       the cube root of −27 into −27. The clipped sign puts the character back,
       and for a root of a higher order it puts the order back with it — a
       superscript digit, which cannot be read as a multiplication the way a
       full-size 3 in front of a radical can. The bracket closes a negative
       radicand so the flattened text cannot be read as a subtraction. */
    const SUPER = { 2: "", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶" };

    const drawRoot = (order, radicand) => {
        const wrap = el("span", order > 2 ? "rad rad--order" : "rad");
        wrap.append(hiddenText(`${SUPER[order]}√(`));
        if (order > 2) {
            /* Drawn by the stylesheet from the attribute, never written as
               text: an index in the DOM flattens into the radicand beside it. */
            const index = el("span", "rad__index");
            index.setAttribute("data-order", String(order));
            index.setAttribute("aria-hidden", "true");
            wrap.append(index);
        }
        wrap.append(radicalSign());
        wrap.append(el("span", "rad__over", radicand));
        const holder = el("span");
        holder.append(wrap, hiddenText(")"));
        return holder;
    };

    const rootStatement = (order, radicand, result, label) => {
        const holder = el("span", "sf");
        holder.setAttribute("role", "math");
        holder.setAttribute("aria-label", label);
        holder.append(drawRoot(order, radicand), ` = ${result}`);
        return holder;
    };

    let count = clamp(parseInt(scale.getAttribute("aria-valuenow") || "3", 10), MIN, MAX);

    const show = (next) => {
        count = clamp(Math.round(next), MIN, MAX);
        const value = BASE ** count;
        const odd = count % 2 === 1;

        /* The product written out, one factor for each of the count. */
        factorsLine.textContent =
            `${Array.from({ length: count }, () => `(${MINUS}3)`).join(" × ")} = ${signed(value)}`;

        cells.forEach((cell) => {
            const at = Number(cell.dataset.cell);
            cell.classList.toggle("is-current", at === count);
            cell.classList.toggle("is-negative", BASE ** at < 0);
        });

        scale.setAttribute("aria-valuenow", String(count));
        scale.setAttribute("aria-valuetext",
            `${count} factors of negative 3, multiplying to ${spoken(value)}`);

        reading.replaceChildren();
        if (odd) {
            reading.append(
                `With an odd number of them the product stays negative, so `,
                rootStatement(count, signed(value), `${MINUS}3`,
                    `the ${ORDINAL[count]} root of ${spoken(value)} equals negative 3`),
                ".");
        } else {
            reading.append(
                `With an even number the product turns positive, so nothing on the line has a `
                + `${ORDINAL[count]} power of ${signed(-value)}.`);
        }
    };

    /* A grip anywhere along the strip takes the cell it lands in. */
    const gripAt = (clientX) => {
        const box = scale.getBoundingClientRect();
        if (!box.width) return;
        const fraction = clamp((clientX - box.left) / box.width, 0, 0.999);
        show(MIN + Math.floor(fraction * (MAX - MIN + 1)));
    };

    let holding = false;
    scale.addEventListener("pointerdown", (event) => {
        holding = true;
        scale.setPointerCapture(event.pointerId);
        gripAt(event.clientX);
        event.preventDefault();
    });
    scale.addEventListener("pointermove", (event) => { if (holding) gripAt(event.clientX); });
    const release = (event) => {
        if (!holding) return;
        holding = false;
        if (scale.hasPointerCapture && scale.hasPointerCapture(event.pointerId)) {
            scale.releasePointerCapture(event.pointerId);
        }
    };
    scale.addEventListener("pointerup", release);
    scale.addEventListener("pointercancel", release);

    const STEPS = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 };
    scale.addEventListener("keydown", (event) => {
        if (event.key === "Home") { show(MIN); event.preventDefault(); return; }
        if (event.key === "End") { show(MAX); event.preventDefault(); return; }
        const step = STEPS[event.key];
        if (step === undefined) return;
        show(count + step);
        event.preventDefault();
    });

    show(count);
});
