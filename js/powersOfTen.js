document.addEventListener("DOMContentLoaded", () => {
    const machine = document.querySelector("[data-power-machine]");
    if (!machine) return;

    const svgNS = "http://www.w3.org/2000/svg";
    const input = machine.querySelector("[data-machine-input]");
    const sourceOutput = machine.querySelector("[data-machine-source]");
    const operationOutput = machine.querySelector("[data-machine-operation-label]");
    const resultOutput = machine.querySelector("[data-machine-result]");
    const description = machine.querySelector("[data-machine-description]");
    const columnsLayer = machine.querySelector("[data-machine-columns]");
    const digitsLayer = machine.querySelector("[data-machine-digits]");
    const placeholdersLayer = machine.querySelector("[data-machine-placeholders]");
    const shiftGroup = machine.querySelector("[data-machine-shift]");
    const arrow = machine.querySelector("[data-machine-arrow]");
    const movement = machine.querySelector("[data-machine-movement]");
    const operationStep = machine.querySelector('[data-machine-step="operation"]');
    const digitsStep = machine.querySelector('[data-machine-step="digits"]');
    const zerosStep = machine.querySelector('[data-machine-step="zeros"]');
    const buttons = [...machine.querySelectorAll("[data-machine-operation]")];

    const placeNames = new Map([
        [5, "100,000s"], [4, "10,000s"], [3, "1,000s"], [2, "100s"],
        [1, "10s"], [0, "1s"], [-1, "0.1s"], [-2, "0.01s"],
        [-3, "0.001s"], [-4, "0.0001s"], [-5, "0.00001s"], [-6, "0.000001s"]
    ]);
    const placeWords = new Map([
        [5, "hundred thousands"], [4, "ten thousands"], [3, "thousands"],
        [2, "hundreds"], [1, "tens"], [0, "ones"], [-1, "tenths"],
        [-2, "hundredths"], [-3, "thousandths"], [-4, "ten-thousandths"],
        [-5, "hundred-thousandths"], [-6, "millionths"]
    ]);
    const exponents = [...placeNames.keys()];
    const startX = 68;
    const cellWidth = 72;
    const cellTop = 72;
    const cellHeight = 128;
    const digitY = 151;
    let shift = 2;
    let current = null;
    let digitNodes = [];
    const placeholderNodes = new Map();

    const makeSVG = (name, attributes = {}) => {
        const element = document.createElementNS(svgNS, name);
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
        return element;
    };

    const xForExponent = (exponent) => startX + exponents.indexOf(exponent) * cellWidth;

    const drawColumns = () => {
        exponents.forEach((exponent, index) => {
            const x = startX + index * cellWidth;
            const rect = makeSVG("rect", {
                x: x - 32,
                y: cellTop,
                width: 64,
                height: cellHeight,
                rx: 8,
                class: `power-machine__column power-machine__column--${exponent >= 0 ? "whole" : "decimal"}${exponent === 0 ? " power-machine__column--ones" : ""}`
            });
            const label = makeSVG("text", { x, y: 51, class: "power-machine__column-label" });
            label.textContent = placeNames.get(exponent);
            columnsLayer.append(rect, label);
        });

        const boundaryX = (xForExponent(0) + xForExponent(-1)) / 2;
        const point = makeSVG("circle", {
            cx: boundaryX,
            cy: digitY + 20,
            r: 5,
            class: "power-machine__decimal-point"
        });
        columnsLayer.append(point);
    };

    /* The field itself is the limit: anything beyond three digits either side of
       the point, and anything that is not a digit, never reaches the value. */
    const limitInput = () => {
        const raw = input.value;
        const negative = /^\s*[-−]/.test(raw);
        const digits = raw.replace(/[^\d.]/g, "");
        const hasPoint = digits.includes(".");
        const [wholeRaw, ...rest] = digits.split(".");
        const cleaned = `${negative ? "-" : ""}${wholeRaw.slice(0, 3)}${hasPoint ? `.${rest.join("").slice(0, 3)}` : ""}`;

        if (cleaned !== raw) {
            const caret = input.selectionStart ?? cleaned.length;
            const position = Math.max(0, Math.min(cleaned.length, caret - (raw.length - cleaned.length)));
            input.value = cleaned;
            input.setSelectionRange(position, position);
        }
        return cleaned;
    };

    const parseNumber = (cleaned) => {
        if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(cleaned)) return null;

        const negative = cleaned.startsWith("-");
        const unsigned = negative ? cleaned.slice(1) : cleaned;
        let [whole, fractional = ""] = unsigned.split(".");
        whole = whole || "0";
        whole = whole.replace(/^0+(?=\d)/, "");
        fractional = fractional.replace(/0+$/, "");
        const isZero = !/[1-9]/.test(whole + fractional);
        const canonical = isZero ? "0" : `${negative ? "−" : ""}${whole}${fractional ? `.${fractional}` : ""}`;
        return { negative, whole, fractional, canonical, isZero };
    };

    const moveDecimal = (number, amount) => {
        if (number.isZero) return "0";
        const digits = `${number.whole}${number.fractional}`;
        const decimalIndex = number.whole.length + amount;
        let whole;
        let fractional;

        if (decimalIndex <= 0) {
            whole = "0";
            fractional = `${"0".repeat(-decimalIndex)}${digits}`;
        } else if (decimalIndex >= digits.length) {
            whole = `${digits}${"0".repeat(decimalIndex - digits.length)}`;
            fractional = "";
        } else {
            whole = digits.slice(0, decimalIndex);
            fractional = digits.slice(decimalIndex);
        }

        whole = whole.replace(/^0+(?=\d)/, "");
        fractional = fractional.replace(/0+$/, "");
        return `${number.negative ? "−" : ""}${whole || "0"}${fractional ? `.${fractional}` : ""}`;
    };

    const groupThousands = (value) => {
        const negative = value.startsWith("−");
        const unsigned = negative ? value.slice(1) : value;
        const [whole, fractional] = unsigned.split(".");
        const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return `${negative ? "−" : ""}${grouped}${fractional === undefined ? "" : `.${fractional}`}`;
    };

    const sourceDigits = (number) => {
        if (number.isZero) return [];
        const digits = [];
        if (number.whole !== "0") {
            [...number.whole].forEach((digit, index) => {
                if (digit !== "0") digits.push({ digit, exponent: number.whole.length - index - 1 });
            });
        }
        [...number.fractional].forEach((digit, index) => {
            if (digit !== "0") digits.push({ digit, exponent: -index - 1 });
        });
        return digits;
    };

    const displayedDigits = (value) => {
        const unsigned = value.replace("−", "");
        const [whole, fractional = ""] = unsigned.split(".");
        return [
            ...[...whole].map((digit, index) => ({ digit, exponent: whole.length - index - 1 })),
            ...[...fractional].map((digit, index) => ({ digit, exponent: -index - 1 }))
        ];
    };

    const makeDigit = (digit, className) => {
        const group = makeSVG("g", { class: className });
        const rect = makeSVG("rect", { x: 0, y: 0, width: 46, height: 54, rx: 12 });
        const text = makeSVG("text", { x: 23, y: 29 });
        text.textContent = digit;
        group.append(rect, text);
        return group;
    };

    const setDigitTransform = (node, exponent) => {
        node.setAttribute("transform", `translate(${xForExponent(exponent) - 23} ${digitY - 27})`);
    };

    const joinPhrases = (phrases, separator = "; ") => {
        if (phrases.length === 1) return phrases[0];
        if (phrases.length === 2) return `${phrases[0]} and ${phrases[1]}`;
        return `${phrases.slice(0, -1).join(separator)}${separator}and ${phrases.at(-1)}`;
    };

    /* New digits are built where the chosen operation leaves them. A changed
       number replaces the digits outright, so it has nothing to slide from:
       only pressing an operation moves digits that are already on screen. */
    const resetDigitNodes = () => {
        digitsLayer.replaceChildren();
        digitNodes = sourceDigits(current).map((item) => {
            const node = makeDigit(item.digit, "power-machine__digit");
            setDigitTransform(node, item.exponent + shift);
            digitsLayer.append(node);
            return { ...item, node };
        });
    };

    const getPlaceholders = (result) => {
        const occupied = new Set(digitNodes.map((item) => current.isZero ? 0 : item.exponent + shift));
        return displayedDigits(result).filter((item) => item.digit === "0" && !occupied.has(item.exponent));
    };

    /* Placeholders are matched to the places they hold rather than rebuilt, so a
       zero that is still needed stays put instead of fading in again. Only a
       place that has just fallen empty gets a new node, and only that node
       animates. */
    const renderPlaceholders = (result) => {
        const placeholders = getPlaceholders(result);
        const wanted = new Set(placeholders.map((item) => item.exponent));

        placeholderNodes.forEach((node, exponent) => {
            if (wanted.has(exponent)) return;
            node.remove();
            placeholderNodes.delete(exponent);
        });

        placeholders.forEach((item) => {
            if (placeholderNodes.has(item.exponent)) return;
            const node = makeSVG("text", {
                x: xForExponent(item.exponent),
                y: digitY + 11,
                class: `power-machine__placeholder power-machine__placeholder--${item.exponent >= 0 ? "whole" : "decimal"}`
            });
            node.textContent = "0";
            placeholdersLayer.append(node);
            placeholderNodes.set(item.exponent, node);
        });

        return placeholders;
    };

    const renderShift = () => {
        const active = buttons.find((button) => Number(button.dataset.shift) === shift);
        const result = moveDecimal(current, shift);
        const direction = shift > 0 ? "left" : shift < 0 ? "right" : "nowhere";
        const places = Math.abs(shift);
        const source = groupThousands(current.canonical);
        const shownResult = groupThousands(result);

        buttons.forEach((button) => button.setAttribute("aria-pressed", String(button === active)));
        sourceOutput.textContent = source;
        operationOutput.textContent = `${active.dataset.symbol} ${active.dataset.factor}`;
        resultOutput.textContent = shownResult;
        movement.textContent = shift === 0 ? "the digits stay in their places" : `${places} ${places === 1 ? "place" : "places"} ${direction}`;
        description.textContent = shift === 0
            ? `${source} is unchanged when multiplied by one.`
            : `Each non-zero digit in ${source} moves ${places} ${places === 1 ? "place" : "places"} ${direction}, producing ${shownResult}.`;

        if (shift === 0) {
            shiftGroup.style.display = "none";
        } else {
            const arrowStart = 500 + (shift > 0 ? 54 : -54);
            const arrowEnd = arrowStart - shift * cellWidth;
            arrow.setAttribute("d", `M ${arrowStart} 246 H ${arrowEnd}`);
            shiftGroup.style.removeProperty("display");
        }

        digitNodes.forEach((item) => setDigitTransform(item.node, item.exponent + shift));
        const placeholders = renderPlaceholders(result);

        if (shift === 0) {
            operationStep.textContent = "Multiplying by 1 leaves every digit in its original place, so the value is unchanged.";
        } else {
            const role = active.dataset.symbol === "×" ? "multiplier" : "divisor";
            operationStep.textContent = `The ${role} ${active.dataset.factor} contains ${places === 1 ? "one factor" : `${places} factors`} of 10, so each non-zero digit must move ${places === 1 ? "one place" : `${places} places`} to the ${direction}.`;
        }

        if (current.isZero) {
            digitsStep.textContent = "There are no non-zero digits to move: zero remains zero under every operation shown here.";
        } else if (shift === 0) {
            digitsStep.textContent = "Each non-zero digit remains in the place it already occupies.";
        } else {
            const movements = digitNodes.map((item, index) => `${index === 0 ? "The" : "the"} ${item.digit} moves from the ${placeWords.get(item.exponent)} place to the ${placeWords.get(item.exponent + shift)} place`);
            digitsStep.textContent = `${joinPhrases(movements)}.`;
        }

        if (current.isZero) {
            zerosStep.textContent = "The result is shown as a single zero in the ones place.";
        } else if (placeholders.length) {
            const names = placeholders.map((item) => placeWords.get(item.exponent));
            zerosStep.textContent = `The ${joinPhrases(names, ", ")} ${names.length === 1 ? "place is" : "places are"} empty, so ${names.length === 1 ? "a zero holds it" : "zeros hold them"}. Reading the completed number gives ${shownResult}.`;
        } else {
            zerosStep.textContent = `Every required place is already occupied, so no placeholder zeros are needed. Reading the digits in their new places gives ${shownResult}.`;
        }
    };

    const acceptInput = () => {
        const parsed = parseNumber(limitInput());
        if (!parsed) return;

        current = parsed;
        resetDigitNodes();
        renderShift();
    };

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            shift = Number(button.dataset.shift);
            renderShift();
        });
    });
    input.addEventListener("input", acceptInput);

    drawColumns();
    acceptInput();
});
