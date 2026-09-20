document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const svgNS = "http://www.w3.org/2000/svg";
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

    const makeSVG = (name, attributes = {}) => {
        const element = document.createElementNS(svgNS, name);
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
        return element;
    };

    const createInteractiveLine = (svg) => {
        const min = Number(svg.dataset.min);
        const max = Number(svg.dataset.max);
        const step = Number(svg.dataset.step);
        const lineLeft = 100;
        const lineRight = 820;
        const axisY = 224;
        const cardY = 116;
        const cardHalfWidth = 58;
        const labelGap = cardHalfWidth * 2 + 18;
        const minLabelX = 82;
        const maxLabelX = 838;
        const result = svg.querySelector("[data-line-result]");

        const decimals = Math.max(0, (String(step).split(".")[1] || "").length);
        const formatValue = (value) => String(Number(value.toFixed(decimals))).replace("-", "\u2212");
        const toX = (value) => lineLeft + ((value - min) / (max - min)) * (lineRight - lineLeft);

        const items = ["left", "right"].map((side, index) => ({
            side,
            index,
            value: Number(svg.dataset[`${side}Value`]),
            card: svg.querySelector(`[data-line-card="${side}"]`),
            cardValue: svg.querySelector(`[data-line-card-value="${side}"]`),
            handle: svg.querySelector(`[data-line-handle="${side}"]`),
            leader: svg.querySelector(`[data-line-leader="${side}"]`)
        }));

        const render = () => {
            items.forEach((item) => {
                item.targetX = toX(item.value);
                item.labelX = clamp(item.targetX, minLabelX, maxLabelX);
            });

            const ordered = [...items].sort((a, b) => a.targetX - b.targetX || a.index - b.index);
            if (ordered[1].targetX - ordered[0].targetX < labelGap) {
                const centre = (ordered[0].targetX + ordered[1].targetX) / 2;
                const firstX = clamp(centre - labelGap / 2, minLabelX, maxLabelX - labelGap);
                ordered[0].labelX = firstX;
                ordered[1].labelX = firstX + labelGap;
            }

            items.forEach((item) => {
                const shownValue = formatValue(item.value);
                const stemStartY = cardY + 34;
                const stemEndY = axisY - 14;
                const stemMidY = (stemStartY + stemEndY) / 2;
                item.card.setAttribute("transform", `translate(${item.labelX} ${cardY})`);
                item.cardValue.textContent = shownValue;
                item.handle.setAttribute("transform", `translate(${item.targetX} ${axisY})`);
                item.handle.setAttribute("aria-valuenow", item.value);
                item.handle.setAttribute("aria-valuetext", shownValue);
                item.leader.setAttribute(
                    "d",
                    `M ${item.labelX} ${stemStartY} C ${item.labelX} ${stemMidY}, ${item.targetX} ${stemMidY}, ${item.targetX} ${stemEndY}`
                );
            });

            const left = items[0].value;
            const right = items[1].value;
            const relation = left < right ? "<" : left > right ? ">" : "=";
            result.textContent = `${formatValue(left)} ${relation} ${formatValue(right)}`;
        };

        const setValue = (item, value) => {
            const snapped = min + Math.round((value - min) / step) * step;
            item.value = clamp(Number(snapped.toFixed(decimals)), min, max);
            render();
        };

        const bindPointerDrag = (item, target) => {
            let dragging = false;
            let startClientX = 0;
            let startValue = item.value;

            target.addEventListener("pointerdown", (event) => {
                dragging = true;
                startClientX = event.clientX;
                startValue = item.value;
                target.setPointerCapture(event.pointerId);
                event.preventDefault();
            });

            target.addEventListener("pointermove", (event) => {
                if (!dragging) return;
                const rect = svg.getBoundingClientRect();
                const viewDelta = ((event.clientX - startClientX) / rect.width) * 920;
                const valueDelta = (viewDelta / (lineRight - lineLeft)) * (max - min);
                setValue(item, startValue + valueDelta);
            });

            const stopDragging = (event) => {
                if (!dragging) return;
                dragging = false;
                if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
            };
            target.addEventListener("pointerup", stopDragging);
            target.addEventListener("pointercancel", stopDragging);
        };

        items.forEach((item) => {
            bindPointerDrag(item, item.handle);
            bindPointerDrag(item, item.card);
            item.handle.addEventListener("keydown", (event) => {
                let nextValue = item.value;
                if (event.key === "ArrowLeft" || event.key === "ArrowDown") nextValue -= step;
                else if (event.key === "ArrowRight" || event.key === "ArrowUp") nextValue += step;
                else if (event.key === "Home") nextValue = min;
                else if (event.key === "End") nextValue = max;
                else return;
                event.preventDefault();
                setValue(item, nextValue);
            });
        });

        render();
    };

    document.querySelectorAll("[data-inequality-line]").forEach(createInteractiveLine);

    const createBoundaryLine = (svg) => {
        const min = Number(svg.dataset.min);
        const max = Number(svg.dataset.max);
        const step = Number(svg.dataset.step);
        const lineLeft = 58;
        const lineRight = 760;
        const axisY = 136;
        const cardY = 57;
        const cardHalfWidth = 75;
        const labelGap = cardHalfWidth * 2 + 16;
        const minLabelX = 85;
        const maxLabelX = 735;
        const decimals = Math.max(0, (String(step).split(".")[1] || "").length);
        const question = svg.closest(".integer-example").querySelector("[data-boundary-question]");
        const answer = svg.closest(".integer-example").querySelector("[data-boundary-answer]");
        const count = svg.querySelector("[data-boundary-count]");
        const rangeBed = svg.querySelector("[data-boundary-range-bed]");
        const range = svg.querySelector("[data-boundary-range]");
        const integerPoints = svg.querySelector("[data-boundary-integers]");

        const formatValue = (value) => String(Number(value.toFixed(decimals))).replace("-", "\u2212");
        const toX = (value) => lineLeft + ((value - min) / (max - min)) * (lineRight - lineLeft);
        const items = ["left", "right"].map((side, index) => ({
            side,
            index,
            value: Number(svg.dataset[`${side}Value`]),
            card: svg.querySelector(`[data-boundary-card="${side}"]`),
            cardValue: svg.querySelector(`[data-boundary-card-value="${side}"]`),
            handle: svg.querySelector(`[data-boundary-handle="${side}"]`),
            leader: svg.querySelector(`[data-boundary-leader="${side}"]`)
        }));

        const formatList = (values) => {
            const shown = values.map(formatValue);
            if (shown.length === 0) return "";
            if (shown.length === 1) return shown[0];
            return `${shown.slice(0, -1).join(", ")} or ${shown.at(-1)}`;
        };

        const render = () => {
            items.forEach((item) => {
                item.targetX = toX(item.value);
                item.labelX = clamp(item.targetX, minLabelX, maxLabelX);
            });

            const ordered = [...items].sort((a, b) => a.targetX - b.targetX || a.index - b.index);
            if (ordered[1].targetX - ordered[0].targetX < labelGap) {
                const centre = (ordered[0].targetX + ordered[1].targetX) / 2;
                const firstX = clamp(centre - labelGap / 2, minLabelX, maxLabelX - labelGap);
                ordered[0].labelX = firstX;
                ordered[1].labelX = firstX + labelGap;
            }

            items.forEach((item) => {
                const shownValue = formatValue(item.value);
                const stemStartY = cardY + 20;
                const stemEndY = axisY - 20;
                const stemMidY = (stemStartY + stemEndY) / 2;
                item.card.setAttribute("transform", `translate(${item.labelX} ${cardY})`);
                item.cardValue.textContent = `${shownValue} ${item.side === "left" ? "excluded" : "included"}`;
                item.handle.setAttribute("transform", `translate(${item.targetX} ${axisY})`);
                item.handle.setAttribute("aria-valuenow", item.value);
                item.handle.setAttribute("aria-valuetext", `${shownValue}, ${item.side === "left" ? "excluded" : "included"}`);
                item.leader.setAttribute(
                    "d",
                    `M ${item.labelX} ${stemStartY} C ${item.labelX} ${stemMidY}, ${item.targetX} ${stemMidY}, ${item.targetX} ${stemEndY}`
                );
            });

            const left = items[0];
            const right = items[1];
            const included = [];
            const firstInteger = Math.floor(left.value + 1e-9) + 1;
            const lastInteger = Math.floor(right.value + 1e-9);
            for (let value = firstInteger; value <= lastInteger; value += 1) included.push(value);

            rangeBed.setAttribute("x", left.targetX);
            rangeBed.setAttribute("width", right.targetX - left.targetX);
            range.setAttribute("d", `M ${left.targetX} ${axisY} H ${right.targetX}`);
            const interiorIntegers = included.filter((value) => Math.abs(value - right.value) > 1e-9);
            integerPoints.replaceChildren(...interiorIntegers.map((value) => makeSVG("circle", {
                cx: toX(value), cy: axisY, r: 7
            })));

            question.innerHTML = `${formatValue(left.value)} &lt; <i>n</i> &le; ${formatValue(right.value)}`;
            answer.innerHTML = included.length
                ? `<i>n</i> = ${formatList(included)}`
                : `No integer lies between ${formatValue(left.value)} and ${formatValue(right.value)}`;
            count.textContent = `${included.length} integer ${included.length === 1 ? "value" : "values"} in the range`;
            left.handle.setAttribute("aria-valuemax", right.value - step);
            right.handle.setAttribute("aria-valuemin", left.value + step);
        };

        const setValue = (item, value) => {
            const snapped = min + Math.round((value - min) / step) * step;
            const bounded = item.side === "left"
                ? clamp(snapped, min, items[1].value - step)
                : clamp(snapped, items[0].value + step, max);
            item.value = Number(bounded.toFixed(decimals));
            render();
        };

        const bindPointerDrag = (item, target) => {
            let dragging = false;
            let startClientX = 0;
            let startValue = item.value;

            target.addEventListener("pointerdown", (event) => {
                dragging = true;
                startClientX = event.clientX;
                startValue = item.value;
                target.setPointerCapture(event.pointerId);
                event.preventDefault();
            });

            target.addEventListener("pointermove", (event) => {
                if (!dragging) return;
                const rect = svg.getBoundingClientRect();
                const viewDelta = ((event.clientX - startClientX) / rect.width) * 820;
                const valueDelta = (viewDelta / (lineRight - lineLeft)) * (max - min);
                setValue(item, startValue + valueDelta);
            });

            const stopDragging = (event) => {
                if (!dragging) return;
                dragging = false;
                if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
            };
            target.addEventListener("pointerup", stopDragging);
            target.addEventListener("pointercancel", stopDragging);
        };

        items.forEach((item) => {
            bindPointerDrag(item, item.handle);
            bindPointerDrag(item, item.card);
            item.handle.addEventListener("keydown", (event) => {
                let nextValue = item.value;
                if (event.key === "ArrowLeft" || event.key === "ArrowDown") nextValue -= step;
                else if (event.key === "ArrowRight" || event.key === "ArrowUp") nextValue += step;
                else if (event.key === "Home") nextValue = item.side === "left" ? min : items[0].value + step;
                else if (event.key === "End") nextValue = item.side === "left" ? items[1].value - step : max;
                else return;
                event.preventDefault();
                setValue(item, nextValue);
            });
        });

        render();
    };

    document.querySelectorAll("[data-boundary-line]").forEach(createBoundaryLine);

    const comparator = document.querySelector("[data-comparator]");
    if (!comparator) return;

    const leftInput = comparator.querySelector("[data-comparator-left]");
    const rightInput = comparator.querySelector("[data-comparator-right]");
    const sign = comparator.querySelector("[data-comparator-sign]");
    const maximumDigits = 12;

    const parseValue = (input) => {
        const cleaned = input.trim().replaceAll(",", "").replaceAll("−", "-");
        if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(cleaned)) return { error: "Please enter a number in each box." };

        const digits = cleaned.match(/\d/g) || [];
        if (digits.length > maximumDigits) {
            return { error: `Please use no more than ${maximumDigits} digits in each value.` };
        }

        const negative = cleaned.startsWith("-");
        const unsigned = cleaned.replace(/^[+-]/, "");
        const [rawWhole = "0", rawFraction = ""] = unsigned.split(".");
        const whole = (rawWhole || "0").replace(/^0+(?=\d)/, "");
        const fraction = rawFraction.replace(/0+$/, "");
        const isZero = /^0*$/.test(whole) && fraction.length === 0;

        return {
            sign: isZero ? 0 : negative ? -1 : 1,
            whole,
            fraction
        };
    };

    const compareMagnitude = (left, right) => {
        if (left.whole.length !== right.whole.length) return left.whole.length < right.whole.length ? -1 : 1;
        if (left.whole !== right.whole) return left.whole < right.whole ? -1 : 1;

        const fractionLength = Math.max(left.fraction.length, right.fraction.length);
        const leftFraction = left.fraction.padEnd(fractionLength, "0");
        const rightFraction = right.fraction.padEnd(fractionLength, "0");
        if (leftFraction === rightFraction) return 0;
        return leftFraction < rightFraction ? -1 : 1;
    };

    const compareValues = (left, right) => {
        if (left.sign !== right.sign) return left.sign < right.sign ? -1 : 1;
        if (left.sign === 0) return 0;
        const magnitude = compareMagnitude(left, right);
        return left.sign < 0 ? -magnitude : magnitude;
    };

    const compare = () => {
        const left = parseValue(leftInput.value);
        const right = parseValue(rightInput.value);
        if (left.error || right.error) {
            leftInput.toggleAttribute("aria-invalid", Boolean(left.error));
            rightInput.toggleAttribute("aria-invalid", Boolean(right.error));
            sign.textContent = "?";
            return;
        }

        leftInput.removeAttribute("aria-invalid");
        rightInput.removeAttribute("aria-invalid");
        const comparison = compareValues(left, right);
        const nextSign = comparison < 0 ? "<" : comparison > 0 ? ">" : "=";
        sign.textContent = nextSign;

        if (!reduceMotion.matches) {
            sign.classList.add("is-changing");
            requestAnimationFrame(() => sign.classList.remove("is-changing"));
        } else {
            sign.classList.remove("is-changing");
        }
    };

    [leftInput, rightInput].forEach((input) => {
        input.dataset.lastValidValue = input.value;

        input.addEventListener("beforeinput", (event) => {
            if (!event.inputType.startsWith("insert") || event.data === null) return;
            const start = input.selectionStart ?? input.value.length;
            const end = input.selectionEnd ?? start;
            const proposed = input.value.slice(0, start) + event.data + input.value.slice(end);
            const digitCount = (proposed.match(/\d/g) || []).length;
            if (digitCount > maximumDigits) event.preventDefault();
        });

        input.addEventListener("input", () => {
            const digitCount = (input.value.match(/\d/g) || []).length;
            if (digitCount > maximumDigits) {
                input.value = input.dataset.lastValidValue;
            } else {
                input.dataset.lastValidValue = input.value;
            }
            compare();
        });
    });

    compare();
});
