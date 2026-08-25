/* Decimal divisors are rewritten by equal powers-of-ten scaling. The scroll
   scene shows each equivalent division; the sandbox uses the same arithmetic
   without rebuilding its controls, so live edits retain focus and position. */
(() => {
    "use strict";

    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const ease = (value) => {
        const x = clamp(value);
        return x * x * (3 - 2 * x);
    };
    const lerp = (from, to, amount) => from + (to - from) * amount;
    const make = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const createScaleScene = (scene) => {
        const sticky = scene.querySelector(".decimal-division-scene__sticky");
        const paper = scene.querySelector("[data-scale-paper]");
        const title = scene.querySelector("[data-scale-title]");
        const copy = scene.querySelector("[data-scale-copy]");
        const progress = scene.querySelector("[data-scale-progress]");
        const board = make("div", "scale-board");
        const values = [
            ["55.2", "0.46"],
            ["552", "4.6"],
            ["5,520", "46"]
        ];
        const rows = values.map(([dividend, divisor]) => {
            const row = make("div", "scale-board__row");
            const left = make("span", "", dividend);
            const sign = make("span", "scale-board__divide", "÷");
            const right = make("span", "", divisor);
            row.append(left, sign, right);
            return { row, tokens: [left, sign, right] };
        });
        const arrows = [0, 1].map(() => {
            const arrow = make("div", "scale-board__arrow");
            arrow.append(make("span", "", "both × 10"));
            return arrow;
        });
        const cursor = make("span", "scale-board__cursor");
        const result = make("div", "scale-board__result");
        result.append(make("span", "", "Now divide:"), make("strong", "", "5,520 ÷ 46 = 120"));
        const check = make("p", "scale-board__check", "Check: 120 × 0.46 = 55.2");
        board.append(rows[0].row, arrows[0], rows[1].row, arrows[1], rows[2].row, result, check, cursor);
        board.setAttribute("aria-hidden", "true");
        paper.setAttribute("role", "img");
        paper.replaceChildren(board);

        const relativeBox = (node) => {
            const nodeBox = node.getBoundingClientRect();
            const boardBox = board.getBoundingClientRect();
            const scaleX = board.offsetWidth ? boardBox.width / board.offsetWidth : 1;
            const scaleY = board.offsetHeight ? boardBox.height / board.offsetHeight : 1;
            return {
                left: (nodeBox.left - boardBox.left) / Math.max(scaleX, .001),
                top: (nodeBox.top - boardBox.top) / Math.max(scaleY, .001),
                width: nodeBox.width / Math.max(scaleX, .001),
                height: nodeBox.height / Math.max(scaleY, .001)
            };
        };
        const cursorTargets = rows.map(({ tokens }) => {
            const first = relativeBox(tokens[0]);
            const last = relativeBox(tokens[2]);
            const paddingX = 13;
            const height = 39;
            return {
                left: Math.round(first.left - paddingX),
                top: Math.round(first.top + (first.height - height) / 2),
                width: Math.round(last.left + last.width - first.left + paddingX * 2),
                height
            };
        });
        const tokenOffsets = rows.map(({ tokens }, rowIndex) => {
            if (!rowIndex) return tokens.map(() => ({ x: 0, y: 0 }));
            return tokens.map((token, tokenIndex) => {
                const source = relativeBox(rows[rowIndex - 1].tokens[tokenIndex]);
                const destination = relativeBox(token);
                return {
                    x: source.left + source.width / 2 - destination.left - destination.width / 2,
                    y: source.top + source.height / 2 - destination.top - destination.height / 2
                };
            });
        });

        const stages = [
            { title: "Identify the decimal divisor", copy: "The divisor 0.46 is decimal, so the calculation is not ready for short or long division." },
            { title: "Multiply both numbers by 10", copy: "55.2 becomes 552 and 0.46 becomes 4.6. The quotient is unchanged, but 4.6 is still decimal." },
            { title: "Multiply both numbers by 10 again", copy: "552 becomes 5,520 and 4.6 becomes 46. The divisor is now an integer." },
            { title: "Stop when the divisor is whole", copy: "Two equal steps of ×10 are equivalent to multiplying both original numbers by 100." },
            { title: "Use long division on 5,520 ÷ 46", copy: "The transformed calculation has an integer divisor, and its quotient is 120." },
            { title: "Check against the original division", copy: "120 × 0.46 = 55.2, confirming that 55.2 ÷ 0.46 = 120." }
        ];
        const dots = stages.map(() => make("span", "decimal-division-scene__dot"));
        progress.replaceChildren(...dots);

        const setCursor = (target, opacity) => {
            cursor.style.left = `${target.left}px`;
            cursor.style.top = `${target.top}px`;
            cursor.style.width = `${target.width}px`;
            cursor.style.height = `${target.height}px`;
            cursor.style.opacity = opacity;
        };
        const interpolate = (from, to, amount) => ({
            left: lerp(from.left, to.left, amount),
            top: lerp(from.top, to.top, amount),
            width: lerp(from.width, to.width, amount),
            height: lerp(from.height, to.height, amount)
        });
        const revealCopiedRow = (rowIndex, amount) => {
            rows[rowIndex].row.style.opacity = amount;
            rows[rowIndex].tokens.forEach((token, tokenIndex) => {
                const offset = tokenOffsets[rowIndex][tokenIndex];
                token.style.transform = `translate(${offset.x * (1 - amount)}px, ${offset.y * (1 - amount)}px)`;
            });
        };
        const paint = (position) => {
            const t = clamp(position, 0, stages.length);
            const opening = ease((t - .08) / .55);
            rows[0].row.style.opacity = opening;
            rows[0].row.style.transform = `translateY(${(1 - opening) * -12}px)`;

            const firstArrow = ease((t - 1.03) / .38);
            arrows[0].style.opacity = firstArrow;
            arrows[0].style.transform = `translateY(${(1 - firstArrow) * -8}px)`;
            arrows[0].style.setProperty("--line", firstArrow);
            revealCopiedRow(1, ease((t - 1.28) / .52));

            const secondArrow = ease((t - 2.03) / .38);
            arrows[1].style.opacity = secondArrow;
            arrows[1].style.transform = `translateY(${(1 - secondArrow) * -8}px)`;
            arrows[1].style.setProperty("--line", secondArrow);
            revealCopiedRow(2, ease((t - 2.28) / .52));

            const overallAmount = ease((t - 3.12) / .45);
            arrows.forEach((arrow) => {
                const badge = arrow.firstElementChild;
                badge.style.backgroundColor = `rgb(${Math.round(lerp(247, 255, overallAmount))}, ${Math.round(lerp(251, 242, overallAmount))}, ${Math.round(lerp(253, 201, overallAmount))})`;
                badge.style.boxShadow = `inset 0 0 0 2px rgba(217, 154, 32, ${overallAmount})`;
            });
            const resultAmount = ease((t - 4.14) / .52);
            result.style.opacity = resultAmount;
            result.style.transform = `translateY(${(1 - resultAmount) * -13}px)`;
            const checkAmount = ease((t - 5.12) / .5);
            check.style.opacity = checkAmount;
            check.style.transform = `translateY(${(1 - checkAmount) * -10}px)`;

            let target = cursorTargets[0];
            if (t >= 1 && t < 2) target = interpolate(cursorTargets[0], cursorTargets[1], ease(((t - 1) - .58) / .42));
            else if (t >= 2 && t < 3) target = interpolate(cursorTargets[1], cursorTargets[2], ease(((t - 2) - .58) / .42));
            else if (t >= 3) target = cursorTargets[2];
            const cursorOpacity = opening * (1 - ease((t - 4.08) / .45));
            setCursor(target, cursorOpacity);
        };

        let currentStage = -1;
        let cardHeight = sticky.offsetHeight;
        let ticking = false;
        const dock = (offset = 0, preserve = false) => {
            if (sticky.parentNode !== scene) scene.insertBefore(sticky, scene.firstChild);
            sticky.classList.remove("is-pinned");
            sticky.style.removeProperty("left");
            sticky.style.removeProperty("transform");
            sticky.style.top = `${offset}px`;
            if (preserve) {
                sticky.style.width = `${scene.offsetWidth}px`;
                sticky.style.height = `${cardHeight}px`;
            } else {
                sticky.style.removeProperty("width");
                sticky.style.removeProperty("height");
            }
        };
        const pin = (left, top, width, scale) => {
            if (sticky.parentNode !== document.body) document.body.append(sticky);
            sticky.classList.add("is-pinned");
            sticky.style.left = `${left}px`;
            sticky.style.top = `${top}px`;
            sticky.style.width = `${width}px`;
            sticky.style.height = `${cardHeight}px`;
            sticky.style.transform = `scale(${scale})`;
        };
        const paintAt = (ratio) => {
            const position = clamp(ratio) * stages.length;
            paint(position);
            const stageIndex = Math.min(stages.length - 1, Math.floor(position));
            if (stageIndex === currentStage) return;
            currentStage = stageIndex;
            title.textContent = stages[stageIndex].title;
            copy.textContent = stages[stageIndex].copy;
            paper.setAttribute("aria-label", `${stages[stageIndex].title}. ${stages[stageIndex].copy}`);
            dots.forEach((dot, index) => {
                dot.classList.toggle("is-current", index === stageIndex);
                dot.classList.toggle("is-past", index < stageIndex);
            });
        };
        const setSize = () => {
            if (reduceMotion.matches) {
                scene.style.setProperty("--scene-height", `${cardHeight}px`);
                scene.style.setProperty("--scene-min-height", `${cardHeight}px`);
            } else {
                scene.style.setProperty("--scene-height", `${(stages.length + 1) * 38}vh`);
                scene.style.setProperty("--scene-min-height", `${(stages.length + 1) * 250}px`);
            }
        };
        const update = () => {
            ticking = false;
            if (reduceMotion.matches) {
                dock(0);
                paintAt(1);
                return;
            }
            const rect = scene.getBoundingClientRect();
            const scale = scene.offsetWidth && rect.width ? rect.width / scene.offsetWidth : 1;
            const pinTop = Math.max(16, (window.innerHeight - cardHeight * scale) / 2);
            const travel = Math.max(1, scene.offsetHeight - cardHeight);
            const distance = pinTop - rect.top;
            const visualTravel = travel * scale;
            if (distance <= 0) {
                dock(0);
                paintAt(0);
            } else if (distance >= visualTravel) {
                dock(travel, true);
                paintAt(1);
            } else {
                pin(rect.left, pinTop, scene.offsetWidth, scale);
                paintAt(distance / visualTravel);
            }
        };
        const requestUpdate = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        };
        const reset = () => {
            dock(0);
            cardHeight = sticky.offsetHeight;
            setSize();
            currentStage = -1;
            requestUpdate();
        };
        scene.classList.add("is-ready");
        setSize();
        update();
        return { requestUpdate, reset };
    };

    const gcd = (a, b) => {
        let x = Math.abs(a);
        let y = Math.abs(b);
        while (y) [x, y] = [y, x % y];
        return x;
    };
    const comma = (whole) => whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const normalise = (raw) => {
        if (!/^\d+(?:\.\d+)?$/.test(raw)) return null;
        let [whole, fraction = ""] = raw.split(".");
        whole = whole.replace(/^0+(?=\d)/, "");
        fraction = fraction.replace(/0+$/, "");
        if (Number(`${whole}.${fraction}`) <= 0) return null;
        return fraction ? `${whole}.${fraction}` : whole;
    };
    const formatDecimal = (value) => {
        const [whole, fraction] = String(value).split(".");
        return fraction === undefined ? comma(whole) : `${comma(whole)}.${fraction}`;
    };
    const shiftDecimal = (value, places) => {
        const [whole, fraction = ""] = value.split(".");
        const digits = `${whole}${fraction}`;
        const point = whole.length + places;
        if (point >= digits.length) return `${digits}${"0".repeat(point - digits.length)}`.replace(/^0+(?=\d)/, "");
        const padded = point <= 0 ? `${"0".repeat(1 - point)}${digits}` : digits;
        const adjustedPoint = Math.max(1, point);
        const shifted = `${padded.slice(0, adjustedPoint)}.${padded.slice(adjustedPoint)}`;
        return shifted.replace(/^0+(?=\d)/, "").replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
    };
    const asFraction = (value) => {
        const [whole, fraction = ""] = value.split(".");
        return { numerator: Number(`${whole}${fraction}`), denominator: 10 ** fraction.length };
    };
    const quotientText = (dividend, divisor) => {
        const a = asFraction(dividend);
        const b = asFraction(divisor);
        let numerator = a.numerator * b.denominator;
        let denominator = a.denominator * b.numerator;
        const common = gcd(numerator, denominator);
        numerator /= common;
        denominator /= common;
        let test = denominator;
        while (test % 2 === 0) test /= 2;
        while (test % 5 === 0) test /= 5;
        const recurring = test !== 1;
        const whole = Math.floor(numerator / denominator);
        let remainder = numerator % denominator;
        let decimals = "";
        const limit = recurring ? 4 : 8;
        while (remainder && decimals.length < limit) {
            remainder *= 10;
            decimals += Math.floor(remainder / denominator);
            remainder %= denominator;
        }
        return `${comma(String(whole))}${decimals ? `.${decimals}` : ""}${remainder ? "…" : ""}`;
    };
    const limitInput = (input, wholeLimit, fractionLimit) => {
        const before = input.value;
        const caret = input.selectionStart ?? before.length;
        const cleaned = before.replace(/[^\d.]/g, "");
        const point = cleaned.indexOf(".");
        const singlePoint = point < 0 ? cleaned : `${cleaned.slice(0, point + 1)}${cleaned.slice(point + 1).replace(/\./g, "")}`;
        let [whole, fraction] = singlePoint.split(".");
        whole = whole.slice(0, wholeLimit);
        const after = fraction === undefined ? whole : `${whole}.${fraction.slice(0, fractionLimit)}`;
        if (after !== before) {
            input.value = after;
            const next = Math.max(0, Math.min(after.length, caret - (before.length - after.length)));
            input.setSelectionRange(next, next);
        }
        return after;
    };

    const createSandbox = (sandbox) => {
        const dividendInput = sandbox.querySelector("[data-dividend-input]");
        const divisorInput = sandbox.querySelector("[data-divisor-input]");
        const working = sandbox.querySelector("[data-sandbox-working]");
        const factorOutput = sandbox.querySelector("[data-sandbox-factor]");
        const originalOutput = sandbox.querySelector("[data-sandbox-original]");
        const equivalentOutput = sandbox.querySelector("[data-sandbox-equivalent]");
        const answerOutput = sandbox.querySelector("[data-sandbox-answer]");
        const status = sandbox.querySelector("[data-sandbox-status]");
        const update = () => {
            const dividendRaw = limitInput(dividendInput, 4, 2);
            const divisorRaw = limitInput(divisorInput, 2, 3);
            const dividend = normalise(dividendRaw);
            const divisor = normalise(divisorRaw);
            const divisorIsDecimal = Boolean(divisor && divisor.includes("."));
            dividendInput.setAttribute("aria-invalid", String(!dividend));
            divisorInput.setAttribute("aria-invalid", String(!divisorIsDecimal));
            if (!dividend || !divisorIsDecimal) {
                sandbox.classList.add("is-invalid");
                working.setAttribute("aria-hidden", "true");
                status.textContent = !dividend
                    ? "Enter a positive dividend."
                    : "Enter a positive, non-integer decimal divisor with up to three decimal places.";
                return;
            }
            sandbox.classList.remove("is-invalid");
            working.removeAttribute("aria-hidden");
            const places = divisor.split(".")[1].length;
            const factor = 10 ** places;
            const scaledDividend = shiftDecimal(dividend, places);
            const scaledDivisor = shiftDecimal(divisor, places);
            const answer = quotientText(dividend, divisor);
            const original = `${formatDecimal(dividend)} ÷ ${formatDecimal(divisor)}`;
            const equivalent = `${formatDecimal(scaledDividend)} ÷ ${formatDecimal(scaledDivisor)}`;
            factorOutput.textContent = comma(String(factor));
            originalOutput.textContent = original;
            equivalentOutput.textContent = equivalent;
            answerOutput.textContent = `${original} = ${answer}`;
            const ending = answer.endsWith("…")
                ? `The quotient begins ${answer}; the decimal continues.`
                : `The quotient is ${answer}.`;
            status.textContent = `Multiplying both numbers by ${comma(String(factor))} gives ${formatDecimal(scaledDividend)} divided by ${formatDecimal(scaledDivisor)}. ${ending}`;
            working.setAttribute("aria-label", status.textContent);
        };
        [dividendInput, divisorInput].forEach((input) => input.addEventListener("input", update));
        update();
    };

    const sceneNode = document.querySelector("[data-decimal-division-scene]");
    const controller = sceneNode ? createScaleScene(sceneNode) : null;
    const sandbox = document.querySelector("[data-decimal-division-sandbox]");
    if (sandbox) createSandbox(sandbox);
    if (controller) {
        window.addEventListener("scroll", controller.requestUpdate, { passive: true });
        window.addEventListener("resize", controller.reset);
        if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", controller.reset);
        else reduceMotion.addListener(controller.reset);
    }
})();
