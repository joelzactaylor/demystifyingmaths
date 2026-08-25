/* Scroll-led short division. Each scene supplies the scroll distance while its
   inner card stays in view. Quotient digits are written, remainders move into
   the next column, and appended decimal zeroes appear continuously with the
   reader's scroll position. */

(() => {
    "use strict";

    const scenes = document.querySelectorAll("[data-division-scene]");
    if (!scenes.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const ease = (value) => {
        const x = clamp(value);
        return x * x * (3 - 2 * x);
    };

    /* Each stage holds over its column for most of the scroll distance, then
       moves during the final part. This matches the rhythm of the other
       written-method animations: read, write, carry, then travel. */
    const steppedCursor = (t, steps) => {
        const u = t - 1;
        const held = clamp(Math.floor(u), 0, steps - 1);
        const next = Math.min(steps - 1, held + 1);
        const slide = ease((clamp(u - held, 0, 1) - .62) / .38);
        return held + (next - held) * slide;
    };

    const placeNames = new Map([
        [5, "hundred thousands"], [4, "ten thousands"], [3, "thousands"],
        [2, "hundreds"], [1, "tens"], [0, "ones"], [-1, "tenths"],
        [-2, "hundredths"], [-3, "thousandths"], [-4, "ten-thousandths"],
        [-5, "hundred-thousandths"], [-6, "millionths"], [-7, "ten-millionths"],
        [-8, "hundred-millionths"], [-9, "billionths"]
    ]);

    const make = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    const comma = (whole) => whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    const tidyInput = (text) => {
        const value = String(text).trim();
        if (!/^\d+(?:\.\d+)?$/.test(value)) return null;
        let [whole, fraction = ""] = value.split(".");
        whole = whole.replace(/^0+(?=\d)/, "");
        return fraction ? `${whole}.${fraction}` : whole;
    };

    const formatNumber = (value) => {
        const [whole, fraction] = String(value).split(".");
        return fraction === undefined ? comma(whole) : `${comma(whole)}.${fraction}`;
    };

    const limitDividend = (raw) => {
        let cleaned = raw.replace(/[^\d.]/g, "");
        const point = cleaned.indexOf(".");
        if (point >= 0) cleaned = `${cleaned.slice(0, point + 1)}${cleaned.slice(point + 1).replace(/\./g, "")}`;
        let [whole, fraction] = cleaned.split(".");
        whole = whole.slice(0, 5);
        if (whole.length > 1) whole = whole.replace(/^0+(?=\d)/, "");
        return fraction === undefined ? whole : `${whole}.${fraction.slice(0, 3)}`;
    };

    const limitDivisor = (raw) => raw.replace(/[^2-9]/g, "").slice(0, 1);

    const buildCalculation = (dividendText, divisor) => {
        const dividend = tidyInput(dividendText);
        if (!dividend || !Number.isInteger(divisor) || divisor < 2 || divisor > 9) return null;

        const [whole, fraction = ""] = dividend.split(".");
        const originalDigits = `${whole}${fraction}`.split("").map(Number);
        const integerPlaces = whole.length;
        const digits = [...originalDigits];
        const operations = [];
        let remainder = 0;

        const useDigit = (digit, appended) => {
            const before = remainder;
            const amount = before * 10 + digit;
            const quotient = Math.floor(amount / divisor);
            remainder = amount % divisor;
            operations.push({ digit, before, amount, quotient, remainder, appended });
        };

        originalDigits.forEach((digit) => useDigit(digit, false));

        let appended = 0;
        while (remainder !== 0 && appended < 6) {
            digits.push(0);
            useDigit(0, true);
            appended += 1;
        }

        const recurring = remainder !== 0;
        const quotientDigits = operations.map((operation) => operation.quotient);
        const integerQuotient = quotientDigits.slice(0, integerPlaces).join("").replace(/^0+(?=\d)/, "") || "0";
        const fractionQuotient = quotientDigits.slice(integerPlaces).join("");
        const quotient = fractionQuotient
            ? `${integerQuotient}.${fractionQuotient}${recurring ? "…" : ""}`
            : integerQuotient;

        const beforePoint = quotientDigits.slice(0, integerPlaces);
        const nonZero = beforePoint.findIndex((digit) => digit !== 0);
        const firstWritten = nonZero === -1 ? integerPlaces - 1 : nonZero;

        return {
            dividend, divisor, digits, operations, quotient, quotientDigits,
            integerPlaces, originalLength: originalDigits.length, firstWritten,
            appended, recurring, finalRemainder: remainder
        };
    };

    const placeFor = (calculation, index) => calculation.integerPlaces - index - 1;
    const placeLabel = (calculation, index) => placeNames.get(placeFor(calculation, index));

    const describe = (calculation, stage) => {
        const shownDividend = formatNumber(calculation.dividend);
        if (stage === 0) {
            return {
                title: `Set out ${shownDividend} ÷ ${calculation.divisor}`,
                copy: calculation.dividend.includes(".")
                    ? "Write the divisor outside and the dividend inside. Put the decimal point in the answer directly above the one in the dividend."
                    : "Write the divisor outside and the dividend inside. The answer will be written above the line."
            };
        }

        if (stage > calculation.operations.length) {
            return calculation.recurring
                ? {
                    title: `${shownDividend} ÷ ${calculation.divisor} begins ${calculation.quotient}`,
                    copy: "The remainder has not reached zero, so the decimal continues. Recurring decimals are covered on their own page."
                }
                : {
                    title: `${shownDividend} ÷ ${calculation.divisor} = ${calculation.quotient}`,
                    copy: "The remainder is zero, so the division is exact."
                };
        }

        const index = stage - 1;
        const operation = calculation.operations[index];
        const leadingBlank = index < calculation.firstWritten && index < calculation.integerPlaces - 1;
        const nextDigit = calculation.digits[index + 1];
        const hasNext = index + 1 < calculation.operations.length;

        if (leadingBlank) {
            const nextAmount = operation.remainder * 10 + nextDigit;
            return operation.digit === 0
                ? {
                    title: "Move to the next digit",
                    copy: `There is no answer digit to write here. Read the next digit as well and continue with ${nextAmount} ÷ ${calculation.divisor}.`
                }
                : {
                    title: `${operation.digit} is smaller than ${calculation.divisor}`,
                    copy: `Do not write a leading zero. Read the first two digits together and continue with ${nextAmount} ÷ ${calculation.divisor}.`
                };
        }

        const remainderText = operation.remainder ? ` remainder ${operation.remainder}` : "";
        const title = operation.appended
            ? `Add a zero: ${operation.amount} ÷ ${calculation.divisor} = ${operation.quotient}${remainderText}`
            : `${operation.amount} ÷ ${calculation.divisor} = ${operation.quotient}${remainderText}`;

        const beginsWithTwoDigits = index === calculation.firstWritten && calculation.firstWritten > 0;
        const opening = operation.appended
            ? `Adding a zero after the decimal point does not change ${shownDividend}. `
            : beginsWithTwoDigits
                ? `The first two digits form ${operation.amount}. `
            : operation.before
                ? `The carried ${operation.before} and the next digit ${operation.digit} form ${operation.amount}. `
                : "";
        const written = `Write ${operation.quotient} above the ${operation.digit}.`;

        if (operation.remainder && hasNext) {
            return {
                title,
                copy: `${opening}${written} Carry the remainder ${operation.remainder} in front of the next digit ${nextDigit}, making ${operation.remainder * 10 + nextDigit}.`
            };
        }

        return {
            title,
            copy: `${opening}${written} ${operation.remainder ? "The decimal continues." : "There is nothing to carry."}`
        };
    };

    const createRenderer = (calculation, paper, showPointGuide) => {
        const cell = calculation.digits.length > 10 ? 42
            : calculation.digits.length > 8 ? 48
                : calculation.digits.length > 6 ? 56 : 66;
        const board = make("div", "division-board");
        board.setAttribute("aria-hidden", "true");
        board.style.setProperty("--digits", calculation.digits.length);
        board.style.setProperty("--cell", `${cell}px`);
        board.style.setProperty("--carry-offset", `${cell / 2 - 33}px`);
        board.style.setProperty("--cursor-left", `${86 + cell / 2 - 37}px`);
        board.style.setProperty("--cursor-width", `${cell / 2 + 33}px`);
        board.style.gridTemplateColumns = `70px repeat(${calculation.digits.length}, ${cell}px) 44px`;

        const places = make("div", "division-board__places");
        const quotientRow = make("div", "division-board__quotient");
        const dividendRow = make("div", "division-board__dividend");
        const placeCells = [];
        const quotientCells = [];
        const dividendCells = [];

        calculation.digits.forEach((digit, index) => {
            const place = make("span", "division-board__place", placeLabel(calculation, index));
            place.style.gridColumn = String(index + 2);
            placeCells.push(place);
            places.append(place);

            const quotient = make("span", "division-board__cell division-board__cell--quotient");
            quotient.style.gridColumn = String(index + 2);
            const leadingBlank = index < calculation.firstWritten && index < calculation.integerPlaces - 1;
            if (!leadingBlank) quotient.textContent = String(calculation.quotientDigits[index]);
            quotientCells.push(quotient);
            quotientRow.append(quotient);

            const given = make("span", "division-board__cell division-board__cell--dividend", String(digit));
            given.style.gridColumn = String(index + 2);
            if (index >= calculation.originalLength) given.classList.add("division-board__cell--appended");
            dividendCells.push(given);
            dividendRow.append(given);
        });

        const divisor = make("span", "division-board__divisor", String(calculation.divisor));
        const bracket = make("span", "division-board__bracket");
        bracket.style.gridColumn = `2 / ${calculation.digits.length + 2}`;
        const equation = make("p", "division-board__equation");
        equation.style.gridColumn = `2 / ${calculation.digits.length + 2}`;
        const cursor = make("span", "division-board__cursor");

        board.append(places, quotientRow, divisor, bracket, dividendRow);

        let points = null;
        if (calculation.dividend.includes(".") || calculation.appended) {
            board.style.setProperty("--point", calculation.integerPlaces);
            const answerPoint = make("span", "division-board__point division-board__point--answer", ".");
            const givenPoint = make("span", "division-board__point division-board__point--given", ".");
            const guide = showPointGuide ? make("span", "division-board__point-guide") : null;
            points = { answerPoint, givenPoint, guide, appended: !calculation.dividend.includes(".") };
            board.append(answerPoint, givenPoint);
            if (guide) board.append(guide);
        }

        const carries = [];
        calculation.operations.forEach((operation, index) => {
            if (!operation.remainder || index + 1 >= calculation.digits.length) return;
            if (index < calculation.firstWritten && index < calculation.integerPlaces - 1) return;
            const carry = make("span", "division-board__carry", String(operation.remainder));
            carry.style.setProperty("--target", index + 1);
            carries.push({ carry, index });
            board.append(carry);
        });

        board.append(cursor, equation);
        paper.replaceChildren(board);
        const orientPlaces = () => {
            if (board.classList.contains("division-board--vertical-places")) return false;
            if (!placeCells.some((place) => place.scrollWidth > place.clientWidth + 1)) return false;
            board.classList.add("division-board--vertical-places");
            return true;
        };
        orientPlaces();

        const paint = (t) => {
            quotientCells.forEach((cell, index) => {
                const reveal = ease((t - index - 1.12) / .48);
                cell.style.opacity = reveal;
                cell.style.transform = `translateY(${(1 - reveal) * 15}px)`;
            });

            dividendCells.forEach((cell, index) => {
                if (index < calculation.originalLength) return;
                const reveal = ease((t - index - .82) / .5);
                cell.style.opacity = reveal;
                cell.style.transform = `translateX(${(1 - reveal) * -14}px)`;
            });

            carries.forEach(({ carry, index }) => {
                const reveal = ease((t - index - 1.3) / .52);
                carry.style.opacity = reveal;
                carry.style.transform = `translate(${(1 - reveal) * -34}px, ${(1 - reveal) * -24}px)`;
            });

            if (points) {
                const reveal = points.appended
                    ? ease((t - calculation.originalLength - .72) / .5)
                    : 1;
                points.answerPoint.style.opacity = reveal;
                points.givenPoint.style.opacity = reveal;
                if (points.guide) points.guide.style.opacity = reveal * .8;
            }

            const current = steppedCursor(t, calculation.operations.length);
            const openingSpan = calculation.firstWritten > 0
                ? 1 - clamp(current / calculation.firstWritten)
                : 0;
            const cursorReveal = ease((t - .28) / .55)
                * (1 - ease((t - calculation.operations.length - .55) / .45));
            cursor.style.opacity = cursorReveal;
            cursor.style.width = `${cell / 2 + 33 + openingSpan * cell}px`;
            cursor.style.transform = `translateX(${current * cell}px)`;
        };

        return { stages: calculation.operations.length + 2, paint, equation, orientPlaces };
    };

    const createScene = (scene) => {
        const sticky = scene.querySelector(".division-scene__sticky");
        const paper = scene.querySelector("[data-paper]");
        const heading = scene.querySelector("[data-expression]");
        const stepTitle = scene.querySelector("[data-step-title]");
        const stepCopy = scene.querySelector("[data-step-copy]");
        const progressBar = scene.querySelector("[data-progress]");
        const dividendInput = scene.querySelector("[data-dividend-input]");
        const divisorInput = scene.querySelector("[data-divisor-input]");
        const fixed = !dividendInput || !divisorInput;

        let calculation = null;
        let renderer = null;
        let totalStages = 0;
        let stage = -1;
        let dots = [];

        const cleanInput = (input, clean) => {
            const raw = input.value;
            const value = clean(raw);
            if (value !== raw) {
                const caret = input.selectionStart ?? value.length;
                input.value = value;
                const position = Math.max(0, Math.min(value.length, caret - (raw.length - value.length)));
                input.setSelectionRange(position, position);
            }
            return value;
        };

        const paintDots = () => {
            dots.forEach((dot, index) => {
                dot.classList.toggle("is-current", index === stage);
                dot.classList.toggle("is-past", index < stage);
            });
        };

        const describeStage = () => {
            const details = describe(calculation, stage);
            stepTitle.textContent = details.title;
            stepCopy.textContent = details.copy;
            if (stage > 0 && stage <= calculation.operations.length) {
                const operation = calculation.operations[stage - 1];
                renderer.equation.textContent = `${operation.amount} ÷ ${calculation.divisor} = ${operation.quotient}${operation.remainder ? ` r ${operation.remainder}` : ""}`;
            } else {
                renderer.equation.textContent = "";
            }
            paper.setAttribute("aria-label", `${details.title}. ${details.copy}`);
        };

        const render = (progress) => {
            const t = clamp(progress) * totalStages;
            renderer.paint(t);
            const nextStage = Math.min(totalStages - 1, Math.floor(t));
            if (nextStage === stage) return;
            stage = nextStage;
            describeStage();
            paintDots();
        };

        const dock = (offset = 0, preserveSize = false) => {
            if (sticky.parentNode !== scene) scene.insertBefore(sticky, scene.firstChild);
            sticky.classList.remove("is-pinned");
            sticky.style.removeProperty("left");
            if (preserveSize) {
                sticky.style.width = `${scene.offsetWidth}px`;
                sticky.style.height = `${cardHeight}px`;
            } else {
                sticky.style.removeProperty("width");
                sticky.style.removeProperty("height");
            }
            sticky.style.removeProperty("transform");
            sticky.style.top = `${offset}px`;
        };

        let cardHeight = sticky.offsetHeight;

        const pin = (left, top, width, scale) => {
            if (sticky.parentNode !== document.body) document.body.append(sticky);
            sticky.classList.add("is-pinned");
            sticky.style.left = `${left}px`;
            sticky.style.top = `${top}px`;
            sticky.style.width = `${width}px`;
            sticky.style.height = `${cardHeight}px`;
            sticky.style.transform = `scale(${scale})`;
        };

        const remeasureCard = () => {
            const pinned = sticky.classList.contains("is-pinned");
            if (pinned) sticky.style.height = "auto";
            cardHeight = sticky.offsetHeight;
            if (pinned) sticky.style.height = `${cardHeight}px`;
        };

        let ticking = false;

        const update = () => {
            ticking = false;
            if (!calculation) return;

            if (!fixed && sticky.contains(document.activeElement)) {
                repaintInPlace();
                return;
            }

            if (reduceMotion.matches) {
                dock(0);
                render(1);
                return;
            }

            const sceneRect = scene.getBoundingClientRect();
            const visualScale = scene.offsetWidth && sceneRect.width ? sceneRect.width / scene.offsetWidth : 1;
            const pinTop = Math.max(16, (window.innerHeight - cardHeight * visualScale) / 2);
            const travel = Math.max(1, scene.offsetHeight - cardHeight);
            const distance = pinTop - sceneRect.top;
            const visualTravel = travel * visualScale;

            if (distance <= 0) {
                dock(0);
                render(0);
            } else if (distance >= visualTravel) {
                dock(travel, true);
                render(1);
            } else {
                pin(sceneRect.left, pinTop, scene.offsetWidth, visualScale);
                render(distance / visualTravel);
            }
        };

        const requestUpdate = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        };

        /* Repaint without docking or pinning. Reparenting a sticky card while
           one of its fields is active makes browsers blur the field and can
           trigger scroll-to-focus. Input updates use this path; the normal
           scroll listener resumes pinning as soon as the reader scrolls. */
        const repaintInPlace = () => {
            if (reduceMotion.matches) {
                render(1);
                return;
            }
            const sceneRect = scene.getBoundingClientRect();
            const visualScale = scene.offsetWidth && sceneRect.width ? sceneRect.width / scene.offsetWidth : 1;
            const pinTop = Math.max(16, (window.innerHeight - cardHeight * visualScale) / 2);
            const travel = Math.max(1, scene.offsetHeight - cardHeight);
            const visualTravel = travel * visualScale;
            render(clamp((pinTop - sceneRect.top) / visualTravel));
        };

        const accept = () => {
            const active = !fixed && sticky.contains(document.activeElement)
                ? document.activeElement
                : null;
            const scrollLeft = window.scrollX;
            const scrollTop = window.scrollY;
            const dividend = fixed ? scene.dataset.dividend : cleanInput(dividendInput, limitDividend);
            const divisorText = fixed ? scene.dataset.divisor : cleanInput(divisorInput, limitDivisor);
            const selection = active && typeof active.selectionStart === "number"
                ? [active.selectionStart, active.selectionEnd]
                : null;
            const nextCalculation = buildCalculation(dividend, Number(divisorText));
            if (!nextCalculation) return;

            calculation = nextCalculation;
            renderer = createRenderer(calculation, paper, scene.hasAttribute("data-point-guide"));
            const acceptedRenderer = renderer;
            if (heading) heading.textContent = `${formatNumber(calculation.dividend)} ÷ ${calculation.divisor}`;

            totalStages = renderer.stages;
            dots = Array.from({ length: totalStages }, () => make("span", "division-scene__dot"));
            progressBar.replaceChildren(...dots);
            scene.style.setProperty("--scene-height", `${(totalStages + 1) * (fixed ? 42 : 48)}vh`);
            scene.style.setProperty("--scene-min-height", `${(totalStages + 1) * (fixed ? 285 : 315)}px`);
            scene.classList.add("is-ready");

            remeasureCard();
            stage = -1;
            if (active) {
                repaintInPlace();
                if (document.activeElement !== active) active.focus({ preventScroll: true });
                if (selection) active.setSelectionRange(selection[0], selection[1]);
                if (window.scrollX !== scrollLeft || window.scrollY !== scrollTop) {
                    window.scrollTo({ left: scrollLeft, top: scrollTop, behavior: "auto" });
                }
            } else {
                requestUpdate();
            }

            if (document.fonts?.ready) document.fonts.ready.then(() => {
                if (renderer !== acceptedRenderer || !acceptedRenderer.orientPlaces()) return;
                remeasureCard();
                stage = -1;
                if (!fixed && sticky.contains(document.activeElement)) repaintInPlace();
                else requestUpdate();
            });
        };

        const reset = () => {
            if (!fixed && sticky.contains(document.activeElement)) {
                remeasureCard();
                stage = -1;
                repaintInPlace();
                return;
            }
            dock(0);
            cardHeight = sticky.offsetHeight;
            stage = -1;
            requestUpdate();
        };

        if (!fixed) {
            [dividendInput, divisorInput].forEach((input) => {
                input.addEventListener("input", accept);
                input.addEventListener("blur", () => requestAnimationFrame(() => {
                    if (!sticky.contains(document.activeElement)) reset();
                }));
            });
        }

        accept();
        cardHeight = sticky.offsetHeight;
        update();
        return { requestUpdate, reset };
    };

    const controllers = Array.from(scenes).map(createScene);
    const nudge = () => controllers.forEach((controller) => controller.requestUpdate());
    const resetAll = () => controllers.forEach((controller) => controller.reset());

    window.addEventListener("scroll", nudge, { passive: true });
    window.addEventListener("resize", resetAll);
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", resetAll);
    else reduceMotion.addListener(resetAll);
})();
