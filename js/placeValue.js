/* Interactive place-value tray. A number typed into the field is split into its
   places: each digit is shown in the column it occupies, read back as a count of
   that place, and the parts are assembled into words. The field caps itself at
   seven whole-number digits and three decimal places; anything beyond that, and
   anything that is not a digit, never reaches the value. */
document.addEventListener("DOMContentLoaded", () => {
    const lab = document.querySelector("[data-place-lab]");
    if (!lab) return;

    const input = lab.querySelector("[data-place-input]");
    const strip = lab.querySelector("[data-place-strip]");
    const parts = lab.querySelector("[data-place-parts]");
    const words = lab.querySelector("[data-place-words]");

    const WHOLE_LIMIT = 7;
    const DECIMAL_LIMIT = 3;

    const SMALL = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
        "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

    const placeNames = new Map([
        [6, "millions"], [5, "hundred thousands"], [4, "ten thousands"], [3, "thousands"],
        [2, "hundreds"], [1, "tens"], [0, "ones"], [-1, "tenths"], [-2, "hundredths"], [-3, "thousandths"]
    ]);
    const singularNames = new Map([
        [6, "million"], [5, "hundred thousand"], [4, "ten thousand"], [3, "thousand"],
        [2, "hundred"], [1, "ten"], [0, "one"], [-1, "tenth"], [-2, "hundredth"], [-3, "thousandth"]
    ]);
    const unitLabels = new Map([
        [6, "1,000,000"], [5, "100,000"], [4, "10,000"], [3, "1,000"],
        [2, "100"], [1, "10"], [0, "1"], [-1, "0.1"], [-2, "0.01"], [-3, "0.001"]
    ]);

    const underHundred = (value) => value < 20
        ? SMALL[value]
        : `${TENS[Math.floor(value / 10)]}${value % 10 ? `-${SMALL[value % 10]}` : ""}`;

    const underThousand = (value) => {
        const hundreds = Math.floor(value / 100);
        const rest = value % 100;
        if (!hundreds) return underHundred(rest);
        return `${SMALL[hundreds]} hundred${rest ? ` and ${underHundred(rest)}` : ""}`;
    };

    /* Groups of three, named from the largest downwards. A final group below one
       hundred takes "and" before it, as it is said aloud. */
    const wholeWords = (digits) => {
        const value = digits.replace(/^0+(?=\d)/, "");
        if (value === "0") return "zero";
        const padded = value.padStart(Math.ceil(value.length / 3) * 3, "0");
        const groups = padded.match(/\d{3}/g).map(Number);
        const scales = ["", " thousand", " million", " billion"];
        const named = groups
            .map((group, index) => ({ group, scale: scales[groups.length - 1 - index] }))
            .filter((item) => item.group)
            .map((item) => `${underThousand(item.group)}${item.scale}`);
        if (named.length === 1) return named[0];
        const last = groups.at(-1);
        const join = last && last < 100 ? " and " : (named.length > 2 ? ", " : " ");
        return `${named.slice(0, -1).join(", ")}${join}${named.at(-1)}`;
    };

    /* The decimal part is read as one number of its smallest non-zero place:
       0.307 is three hundred and seven thousandths, while 0.30 is three tenths.
       A trailing zero can record precision, but it does not change the value. */
    const decimalWords = (digits) => {
        const significantDigits = digits.replace(/0+$/, "");
        const value = Number(significantDigits);
        if (!significantDigits.length || !value) return "";
        const place = -significantDigits.length;
        const name = value === 1 ? singularNames.get(place) : placeNames.get(place);
        return `${wholeWords(String(value))} ${name}`;
    };

    const digitWorth = (digit, exponent) => {
        if (exponent >= 0) return wholeWords(String(digit * 10 ** exponent));
        return `${SMALL[digit]} ${digit === 1 ? singularNames.get(exponent) : placeNames.get(exponent)}`;
    };

    const valueLabel = (digit, exponent) => exponent >= 0
        ? (digit * 10 ** exponent).toLocaleString("en-GB")
        : `0.${"0".repeat(-exponent - 1)}${digit}`;

    const limitValue = () => {
        const raw = input.value;
        const kept = raw.replace(/[^\d.]/g, "");
        const hasPoint = kept.includes(".");
        const [wholeRaw, ...rest] = kept.split(".");
        const cleaned = `${wholeRaw.slice(0, WHOLE_LIMIT)}${hasPoint ? `.${rest.join("").slice(0, DECIMAL_LIMIT)}` : ""}`;

        if (cleaned !== raw) {
            const caret = input.selectionStart ?? cleaned.length;
            const position = Math.max(0, Math.min(cleaned.length, caret - (raw.length - cleaned.length)));
            input.value = cleaned;
            input.setSelectionRange(position, position);
        }
        return cleaned;
    };

    const makeCell = (className, text) => {
        const cell = document.createElement("span");
        cell.className = className;
        cell.textContent = text;
        return cell;
    };

    const setActive = (exponent) => {
        [...strip.children, ...parts.children].forEach((node) => {
            node.classList.toggle("is-active", exponent !== null && node.dataset.exponent === String(exponent));
        });
    };

    const link = (node, exponent) => {
        node.dataset.exponent = exponent;
        node.addEventListener("mouseenter", () => setActive(exponent));
        node.addEventListener("mouseleave", () => setActive(null));
    };

    const render = (value) => {
        const [wholeRaw, decimal = ""] = value.split(".");
        const whole = (wholeRaw || "0").replace(/^0+(?=\d)/, "") || "0";
        const digits = [
            ...whole.split("").map((digit, index) => ({ digit: Number(digit), exponent: whole.length - index - 1 })),
            ...decimal.split("").map((digit, index) => ({ digit: Number(digit), exponent: -(index + 1) }))
        ];

        strip.replaceChildren();
        parts.replaceChildren();

        digits.forEach((item, index) => {
            if (decimal && index === whole.length) {
                const point = document.createElement("div");
                point.className = "place-lab__cell place-lab__cell--point";
                point.append(makeCell("place-lab__place", ""), makeCell("place-lab__digit", "."), makeCell("place-lab__unit", ""));
                strip.append(point);
            }

            const cell = document.createElement("div");
            cell.className = `place-lab__cell place-lab__cell--${item.exponent < 0 ? "decimal" : "whole"}`;
            cell.append(
                makeCell("place-lab__place", placeNames.get(item.exponent) || ""),
                makeCell("place-lab__digit", item.digit),
                makeCell("place-lab__unit", unitLabels.get(item.exponent) || "")
            );
            if (!item.digit) cell.classList.add("is-empty");
            link(cell, item.exponent);
            strip.append(cell);

            const entry = document.createElement("li");
            if (item.digit) {
                entry.innerHTML = `The <b>${item.digit}</b> in the ${placeNames.get(item.exponent)} place is
                    ${item.digit} lot${item.digit === 1 ? "" : "s"} of ${unitLabels.get(item.exponent)},
                    which is <strong>${valueLabel(item.digit, item.exponent)}</strong> &mdash; ${digitWorth(item.digit, item.exponent)}.`;
            } else if (item.exponent < 0 && !decimal.slice(-item.exponent).replace(/0/g, "")) {
                entry.className = "place-lab__holder";
                entry.innerHTML = `The <b>0</b> in the ${placeNames.get(item.exponent)} place adds no value. As a
                    trailing decimal zero it can record precision, but removing it would not change the number.`;
            } else {
                entry.className = "place-lab__holder";
                entry.innerHTML = `The <b>0</b> in the ${placeNames.get(item.exponent)} place counts nothing. It holds
                    the place so that every other digit keeps its own.`;
            }
            link(entry, item.exponent);
            parts.append(entry);
        });

        /* The comma before "and" keeps the decimal part separate: without it,
           "one hundred and one tenth" reads as a hundred and one. */
        const spoken = decimalWords(decimal);
        words.textContent = spoken && whole === "0"
            ? spoken
            : [wholeWords(whole), spoken].filter(Boolean).join(", and ");
    };

    const accept = () => {
        const cleaned = limitValue();
        if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(cleaned)) return;
        render(cleaned);
    };

    input.addEventListener("input", accept);
    accept();
});
