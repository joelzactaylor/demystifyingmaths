document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const svgNS = "http://www.w3.org/2000/svg";
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const ease = (value) => {
        const x = clamp(value);
        return x * x * (3 - 2 * x);
    };

    const makeSVG = (name, attributes = {}) => {
        const element = document.createElementNS(svgNS, name);
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
        return element;
    };

    const createCloud = (scene) => {
        const sticky = scene.querySelector(".inequality-cloud__sticky");
        const captions = [...scene.querySelectorAll(".inequality-cloud__script li")]
            .map((item) => item.textContent.trim());

        scene.style.setProperty("--cloud-scene-height", "285vh");
        scene.style.setProperty("--cloud-scene-min-height", "2250px");
        sticky.innerHTML = `
            <svg class="inequality-cloud__graphic" viewBox="0 0 760 410" role="img"
                aria-labelledby="inequality-cloud-title inequality-cloud-description">
                <title id="inequality-cloud-title">Finding the six GCSE comparison symbols</title>
                <desc id="inequality-cloud-description">A cloud of mathematical relation symbols disperses,
                    leaving equal to, not equal to, less than, greater than, less than or equal to, and greater
                    than or equal to.</desc>
            </svg>
            <p class="inequality-cloud__caption"></p>`;

        const svg = sticky.querySelector("svg");
        const caption = sticky.querySelector(".inequality-cloud__caption");
        const centreX = 380;
        const centreY = 201;

        const rings = [
            makeSVG("ellipse", { cx: centreX, cy: centreY, rx: 126, ry: 78, class: "inequality-cloud__ring" }),
            makeSVG("ellipse", { cx: centreX, cy: centreY, rx: 258, ry: 158, class: "inequality-cloud__ring" })
        ];
        svg.append(...rings);

        const discardCharacters = [
            "≪", "≫", "≮", "≯", "≰", "≱", "≲", "≳", "⋘", "⋙", "⋖", "⋗",
            "≺", "≻", "≼", "≽", "⊂", "⊃", "⊆", "⊇", "⊏", "⊐", "⊑", "⊒",
            "≈", "≉", "≡", "≢", "∼", "≁", "≅", "≇", "∈", "∉", "∝", "∋"
        ];

        const discards = discardCharacters.map((character, index) => {
            const angle = index * 2.399963229728653;
            const proportion = (index + 4) / (discardCharacters.length + 4);
            const radius = 52 + Math.sqrt(proportion) * 268;
            const x = centreX + Math.cos(angle) * radius;
            const y = centreY + Math.sin(angle) * radius * .58;
            const finalDistance = 650 + (index % 5) * 58;
            const dx = Math.cos(angle) * finalDistance;
            const dy = Math.sin(angle) * finalDistance * .78;
            const text = makeSVG("text", {
                x,
                y,
                class: "inequality-cloud__discard",
                "font-size": 22 + (index % 5) * 5
            });
            text.textContent = character;
            svg.append(text);
            return { text, dx, dy, rotation: (index % 2 ? 1 : -1) * (44 + (index % 4) * 21) };
        });

        const keeperData = [
            { symbol: "<", label: "less than", start: [250, 142], end: [132, 125] },
            { symbol: "=", label: "equal to", start: [354, 86], end: [380, 125] },
            { symbol: ">", label: "greater than", start: [515, 161], end: [628, 125] },
            { symbol: "≤", label: "less than or equal to", start: [197, 275], end: [132, 286] },
            { symbol: "≠", label: "not equal to", start: [421, 234], end: [380, 286] },
            { symbol: "≥", label: "greater than or equal to", start: [571, 302], end: [628, 286] }
        ];

        const keepers = keeperData.map((item) => {
            const group = makeSVG("g", { class: "inequality-cloud__keeper" });
            const card = makeSVG("rect", {
                x: -96, y: -52, width: 192, height: 104, rx: 17,
                class: "inequality-cloud__keeper-card"
            });
            const symbol = makeSVG("text", { x: 0, y: -9, class: "inequality-cloud__keeper-symbol" });
            const label = makeSVG("text", { x: 0, y: 34, class: "inequality-cloud__keeper-label" });
            symbol.textContent = item.symbol;
            label.textContent = item.label;
            group.append(card, symbol, label);
            svg.append(group);
            return { ...item, group, card, label };
        });

        let currentCaption = -1;
        const render = (progress) => {
            const safeProgress = clamp(progress);
            const throwProgress = ease((safeProgress - .16) / .56);
            const arrangeProgress = ease((safeProgress - .31) / .53);
            const cardProgress = ease((safeProgress - .63) / .21);

            rings.forEach((ring, index) => {
                ring.style.opacity = String(1 - ease((safeProgress - (.13 + index * .04)) / .32));
                ring.setAttribute("transform", `rotate(${safeProgress * (index ? -18 : 26)} ${centreX} ${centreY})`);
            });

            discards.forEach(({ text, dx, dy, rotation }, index) => {
                const stagger = ease((throwProgress * 1.16) - ((index % 7) * .018));
                text.setAttribute("transform", `translate(${dx * stagger} ${dy * stagger}) rotate(${rotation * stagger})`);
                text.style.opacity = String(1 - ease((stagger - .56) / .4));
            });

            keepers.forEach(({ start, end, group, card, label }, index) => {
                const localArrange = ease((arrangeProgress * 1.08) - (index * .016));
                const x = start[0] + (end[0] - start[0]) * localArrange;
                const y = start[1] + (end[1] - start[1]) * localArrange;
                const scale = .76 + .24 * localArrange;
                group.setAttribute("transform", `translate(${x} ${y}) scale(${scale})`);
                card.style.opacity = String(cardProgress);
                label.style.opacity = String(cardProgress);
            });

            const nextCaption = safeProgress < .64 ? 0 : 1;
            if (nextCaption !== currentCaption) {
                currentCaption = nextCaption;
                caption.textContent = captions[nextCaption];
            }
        };

        scene.classList.add("is-ready");
        let cardWidth = sticky.offsetWidth;
        let cardHeight = sticky.offsetHeight;

        /* Pinning takes the card out of the page and puts it on the body, and
           moving a node drops focus and the caret from whatever is inside it.
           Both are put back, so the card can go on being positioned however the
           reader is using it. */
        const moveCard = (move) => {
            const active = sticky.contains(document.activeElement) ? document.activeElement : null;
            const caret = active && typeof active.selectionStart === "number"
                ? [active.selectionStart, active.selectionEnd]
                : null;
            move();
            if (!active || document.activeElement === active) return;
            active.focus({ preventScroll: true });
            if (caret) active.setSelectionRange(caret[0], caret[1]);
        };

        const dock = (offset = 0) => {
            if (sticky.parentNode !== scene) moveCard(() => scene.insertBefore(sticky, scene.firstChild));
            sticky.classList.remove("is-pinned");
            sticky.style.removeProperty("right");
            sticky.style.removeProperty("left");
            sticky.style.removeProperty("width");
            sticky.style.removeProperty("height");
            sticky.style.removeProperty("transform");
            sticky.style.top = `${offset}px`;
        };

        const pin = (left, top, scale) => {
            if (sticky.parentNode !== document.body) moveCard(() => document.body.append(sticky));
            sticky.classList.add("is-pinned");
            sticky.style.left = `${left}px`;
            sticky.style.top = `${top}px`;
            sticky.style.width = `${cardWidth}px`;
            sticky.style.height = `${cardHeight}px`;
            sticky.style.transform = `scale(${scale})`;
        };

        const measure = () => {
            dock(0);
            cardWidth = sticky.offsetWidth;
            cardHeight = sticky.offsetHeight;
        };

        return {
            scene, render, dock, pin, measure,
            get cardHeight() { return cardHeight; }
        };
    };

    const cloudScene = document.querySelector("[data-inequality-cloud]");
    let cloud = null;
    if (cloudScene) {
        try {
            cloud = createCloud(cloudScene);
        } catch (error) {
            cloudScene.classList.remove("is-ready");
        }
    }
    let cloudTicking = false;

    const updateCloud = () => {
        if (!cloud) return;
        if (reduceMotion.matches) {
            cloud.dock(0);
            cloud.render(1);
            cloudTicking = false;
            return;
        }

        const sceneRect = cloud.scene.getBoundingClientRect();
        const visualScale = cloud.scene.offsetWidth && sceneRect.width
            ? sceneRect.width / cloud.scene.offsetWidth
            : 1;
        const visualCardHeight = cloud.cardHeight * visualScale;
        const pinTop = Math.max(16, (window.innerHeight - visualCardHeight) / 2);
        const travel = Math.max(1, cloud.scene.offsetHeight - cloud.cardHeight);
        const distance = pinTop - sceneRect.top;
        const visualTravel = travel * visualScale;

        if (distance <= 0) {
            cloud.dock(0);
            cloud.render(0);
        } else if (distance >= visualTravel) {
            cloud.dock(travel);
            cloud.render(1);
        } else {
            cloud.pin(sceneRect.left, pinTop, visualScale);
            cloud.render(distance / visualTravel);
        }
        cloudTicking = false;
    };

    const requestCloudUpdate = () => {
        if (cloudTicking) return;
        cloudTicking = true;
        requestAnimationFrame(updateCloud);
    };

    if (cloud) {
        requestCloudUpdate();
        window.addEventListener("scroll", requestCloudUpdate, { passive: true });
        window.addEventListener("resize", () => {
            cloud.measure();
            requestCloudUpdate();
        });
        const motionChanged = () => {
            cloud.measure();
            requestCloudUpdate();
        };
        if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", motionChanged);
        else reduceMotion.addListener(motionChanged);
    }

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
                : "There are no integer solutions";
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
