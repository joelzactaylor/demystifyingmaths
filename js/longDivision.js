/* Scroll-led long division by two-digit integer divisors. Each calculation is
   recorded before it is drawn so the quotient, products, subtractions and
   brought-down digits always describe the same arithmetic. */
(() => {
    "use strict";
    const scenes = document.querySelectorAll("[data-long-scene]");
    if (!scenes.length) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
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
    const comma = (text) => text.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const format = (value) => {
        const [whole, fraction] = String(value).split(".");
        return fraction === undefined ? comma(whole) : `${comma(whole)}.${fraction}`;
    };
    const tidyDividend = (raw) => {
        const value = String(raw).trim();
        if (!/^\d+(?:\.\d+)?$/.test(value)) return null;
        let [whole, fraction = ""] = value.split(".");
        whole = whole.replace(/^0+(?=\d)/, "");
        if (Number(`${whole}.${fraction}`) <= 0) return null;
        return fraction ? `${whole}.${fraction}` : whole;
    };
    const limitDividend = (raw) => {
        let cleaned = raw.replace(/[^\d.]/g, "");
        const point = cleaned.indexOf(".");
        if (point >= 0) cleaned = `${cleaned.slice(0, point + 1)}${cleaned.slice(point + 1).replace(/\./g, "")}`;
        let [whole, fraction] = cleaned.split(".");
        whole = whole.slice(0, 5).replace(/^0+(?=\d)/, "");
        return fraction === undefined ? whole : `${whole}.${fraction.slice(0, 2)}`;
    };
    const limitDivisor = (raw) => raw.replace(/\D/g, "").slice(0, 2).replace(/^0+(?=\d)/, "");

    const calculate = (dividendText, divisor, resultMode = "decimal") => {
        const dividend = tidyDividend(dividendText);
        if (!dividend || !Number.isInteger(divisor) || divisor < 10 || divisor > 99 || (resultMode === "remainder" && dividend.includes("."))) return null;
        const [whole, fraction = ""] = dividend.split(".");
        const integerPlaces = whole.length;
        const digits = `${whole}${fraction}`.split("").map(Number);
        const originalLength = digits.length;
        const operations = [];
        let remainder = 0;
        const use = (digit, appended) => {
            const amount = remainder * 10 + digit;
            const quotient = Math.floor(amount / divisor);
            const product = quotient * divisor;
            remainder = amount - product;
            operations.push({ index: operations.length, digit, amount, quotient, product, remainder, appended });
        };
        digits.forEach((digit) => use(digit, false));
        while (resultMode === "decimal" && remainder && digits.length - integerPlaces < 4) {
            digits.push(0);
            use(0, true);
        }
        const recurring = resultMode === "decimal" && remainder !== 0;
        const quotientDigits = operations.map((operation) => operation.quotient);
        const firstNonZero = quotientDigits.findIndex((digit) => digit !== 0);
        const quotientStart = firstNonZero === -1
            ? Math.max(0, integerPlaces - 1)
            : Math.min(firstNonZero, integerPlaces - 1);
        const workStart = operations.findIndex((operation) => operation.amount >= divisor);
        const active = workStart < 0 ? [] : operations.slice(workStart);
        const wholeAnswer = quotientDigits.slice(0, integerPlaces).join("").replace(/^0+(?=\d)/, "") || "0";
        const decimalAnswer = quotientDigits.slice(integerPlaces).join("");
        const quotient = decimalAnswer ? `${wholeAnswer}.${decimalAnswer}${recurring ? "…" : ""}` : wholeAnswer;
        const answer = resultMode === "remainder" && remainder ? `${quotient} remainder ${remainder}` : quotient;
        return { dividend, divisor, digits, operations, active, originalLength, integerPlaces, quotientStart, quotient, answer, resultMode, recurring, finalRemainder: remainder };
    };

    const buildRenderer = (calc, host) => {
        host.classList.remove("is-invalid");
        host.replaceChildren();
        const board = make("div", "long-board");
        board.style.setProperty("--cols", calc.digits.length);
        if (calc.active.length > 3) board.classList.add("long-board--dense");
        if (calc.active.length > 6) board.classList.add("long-board--very-dense");
        const quotientRow = make("div", "long-board__quotient");
        const quotientCells = calc.digits.map((_, index) => {
            const cell = make("span", "long-board__cell long-board__cell--answer", calc.operations[index].quotient);
            if (index < calc.quotientStart) cell.textContent = "";
            quotientRow.append(cell);
            return cell;
        });
        const division = make("div", "long-board__division");
        const divisor = make("span", "long-board__divisor", calc.divisor);
        divisor.style.opacity = 0;
        const dividendRow = make("div", "long-board__dividend");
        const dividendCells = calc.digits.map((digit, index) => {
            const classes = `long-board__cell long-board__cell--given${index >= calc.originalLength ? " long-board__appended" : ""}`;
            const cell = make("span", classes, digit);
            dividendRow.append(cell);
            return cell;
        });
        division.append(divisor, dividendRow);
        const work = make("div", "long-board__work");
        const rows = [];
        calc.active.forEach((operation, operationIndex) => {
            const productRow = make("div", "long-board__row long-board__row--product");
            const minus = make("span", "long-board__minus", "−");
            productRow.append(minus);
            const productCells = [];
            const productText = String(operation.product);
            const productStart = operation.index - productText.length + 1;
            for (let column = 0; column < calc.digits.length; column += 1) {
                const offset = column - productStart;
                const cell = make("span", "long-board__cell long-board__cell--product", offset >= 0 && offset < productText.length ? productText[offset] : "");
                productRow.append(cell);
                productCells.push(cell);
            }
            const subtractionLine = make("span", "long-board__subtraction-line");
            subtractionLine.style.left = `calc(${productStart} * var(--cell))`;
            subtractionLine.style.right = `calc(${calc.digits.length - operation.index - 1} * var(--cell))`;
            productRow.append(subtractionLine);
            const remainderRow = make("div", "long-board__row long-board__row--remainder");
            const remainderCells = [];
            const remainderText = String(operation.remainder);
            const remainderStart = operation.index - remainderText.length + 1;
            for (let column = 0; column < calc.digits.length; column += 1) {
                let text = "";
                const offset = column - remainderStart;
                if (offset >= 0 && offset < remainderText.length) text = remainderText[offset];
                if (column === operation.index + 1) text = calc.digits[column];
                const cell = make("span", "long-board__cell long-board__cell--remainder", text);
                remainderRow.append(cell);
                remainderCells.push(cell);
            }
            work.append(productRow, remainderRow);
            rows.push({ operation, operationIndex, productRow, productCells, subtractionLine, remainderRow, remainderCells, minus });
        });
        board.append(quotientRow, division, work);
        const cursor = make("span", "long-board__cursor");
        board.append(cursor);

        let givenPoint = null;
        let answerPoint = null;
        if (calc.integerPlaces < calc.digits.length) {
            givenPoint = make("span", "long-board__point long-board__point--given", ".");
            answerPoint = make("span", "long-board__point long-board__point--answer", ".");
            givenPoint.style.setProperty("--point", calc.integerPlaces);
            answerPoint.style.setProperty("--point", calc.integerPlaces);
            board.append(givenPoint, answerPoint);
        }
        const continuationMark = calc.recurring ? make("span", "long-board__continuation", "…") : null;
        if (continuationMark) {
            continuationMark.setAttribute("aria-hidden", "true");
            board.append(continuationMark);
        }

        const crib = make("div", "multiples-crib");
        crib.style.opacity = 0;
        crib.append(make("p", "multiples-crib__title", `Multiples of ${calc.divisor}`));
        const cribItems = [];
        const cribMultipliers = [];
        const cribProducts = [];
        for (let multiplier = 1; multiplier <= 9; multiplier += 1) {
            const item = make("div", "multiples-crib__item");
            const multiplierText = make("span", "multiples-crib__factor");
            const multiplierDigit = make("b", "", multiplier);
            multiplierText.append(multiplierDigit, " ×");
            const productText = make("strong", "", multiplier * calc.divisor);
            item.append(multiplierText, productText);
            crib.append(item);
            cribItems.push(item);
            cribMultipliers.push(multiplierDigit);
            cribProducts.push(productText);
        }
        host.append(board, crib);
        board.style.opacity = 0;

        const stages = [{ kind: "blank" }, { kind: "setup" }];
        if (rows.length) stages.push({ kind: "start", row: rows[0] });
        rows.forEach((row) => {
            row.chooseStage = stages.length;
            stages.push({ kind: "choose", row });
            row.subtractStage = stages.length;
            stages.push({ kind: "subtract", row });
            if (row.operation.index + 1 < calc.operations.length) {
                row.bringStage = stages.length;
                stages.push({ kind: "bring", row, next: calc.operations[row.operation.index + 1] });
            }
        });
        stages.push({ kind: "answer" });

        const reveal = (element, amount) => {
            element.style.opacity = amount;
            element.style.transform = `translateY(${(1 - amount) * 7}px)`;
        };
        const revealFromAbove = (element, amount) => {
            element.style.opacity = amount;
            element.style.transform = `translateY(${(1 - amount) * -14}px)`;
        };
        const offsetWithin = (node, ancestor) => {
            const nodeBox = node.getBoundingClientRect();
            const ancestorBox = ancestor.getBoundingClientRect();
            const scaleX = ancestor.offsetWidth ? ancestorBox.width / ancestor.offsetWidth : 1;
            const scaleY = ancestor.offsetHeight ? ancestorBox.height / ancestor.offsetHeight : 1;
            return {
                left: (nodeBox.left - ancestorBox.left) / Math.max(scaleX, .001),
                top: (nodeBox.top - ancestorBox.top) / Math.max(scaleY, .001),
                width: nodeBox.width / Math.max(scaleX, .001),
                height: nodeBox.height / Math.max(scaleY, .001)
            };
        };
        const sourceCellsFor = (row) => {
            const length = String(row.operation.amount).length;
            const start = row.operation.index - length + 1;
            return row.operationIndex === 0
                ? dividendCells.slice(start, row.operation.index + 1)
                : rows[row.operationIndex - 1].remainderCells.slice(start, row.operation.index + 1);
        };
        const cursorTarget = (row) => {
            const cells = sourceCellsFor(row);
            const first = cells[0];
            const last = cells[cells.length - 1];
            const firstOffset = offsetWithin(first, board);
            const lastOffset = offsetWithin(last, board);
            const firstCentre = firstOffset.left + firstOffset.width / 2;
            const lastCentre = lastOffset.left + lastOffset.width / 2;
            const fontSize = Number.parseFloat(getComputedStyle(first).fontSize);
            const padding = Number.parseFloat(getComputedStyle(board).getPropertyValue("--cursor-pad")) || 7;
            const size = Math.round(fontSize + padding * 2);
            return {
                left: Math.round(firstCentre - size / 2),
                top: Math.round(firstOffset.top + (firstOffset.height - size) / 2),
                width: Math.round(lastCentre - firstCentre + size),
                height: size
            };
        };
        const cursorTargets = rows.map(cursorTarget);
        const setCursor = (target, opacity = 1) => {
            cursor.style.left = `${target.left}px`;
            cursor.style.top = `${target.top}px`;
            cursor.style.width = `${target.width}px`;
            cursor.style.height = `${target.height}px`;
            cursor.style.opacity = opacity;
        };
        const interpolateTarget = (from, to, amount) => ({
            left: lerp(from.left, to.left, amount),
            top: lerp(from.top, to.top, amount),
            width: lerp(from.width, to.width, amount),
            height: lerp(from.height, to.height, amount)
        });
        const glideCopy = (destination, source, amount) => {
            const destinationBox = destination.getBoundingClientRect();
            const sourceBox = source.getBoundingClientRect();
            const scale = destination.offsetWidth ? destinationBox.width / destination.offsetWidth : 1;
            const fromX = (sourceBox.left + sourceBox.width / 2 - destinationBox.left - destinationBox.width / 2) / Math.max(scale, .001);
            const fromY = (sourceBox.top + sourceBox.height / 2 - destinationBox.top - destinationBox.height / 2) / Math.max(scale, .001);
            destination.style.opacity = amount;
            destination.style.transform = `translate(${fromX * (1 - amount)}px, ${fromY * (1 - amount)}px)`;
        };
        const bringDown = (row, column, amount) => {
            const destination = row.remainderCells[column];
            const source = dividendCells[column];
            const destinationOffset = offsetWithin(destination, board);
            const sourceOffset = offsetWithin(source, board);
            destination.style.opacity = amount;
            destination.style.transform = `translate(${(sourceOffset.left - destinationOffset.left) * (1 - amount)}px, ${(sourceOffset.top - destinationOffset.top) * (1 - amount)}px)`;
        };
        const pointIsOriginal = calc.integerPlaces < calc.originalLength;
        const paint = (stageIndex, local = 1) => {
            const current = stages[stageIndex];
            const amount = ease(local / .58);
            const setupAmount = stageIndex > 1 ? 1 : stageIndex === 1 ? amount : 0;
            reveal(board, setupAmount);
            reveal(crib, setupAmount);
            divisor.style.opacity = setupAmount;
            dividendCells.forEach((cell, index) => {
                cell.style.opacity = index < calc.originalLength ? setupAmount : 0;
                cell.style.transform = "";
            });
            quotientCells.forEach((cell) => { cell.style.opacity = 0; cell.style.transform = ""; });
            rows.forEach((row) => {
                row.minus.style.opacity = 0;
                row.productCells.forEach((cell) => { cell.style.opacity = 0; cell.style.transform = ""; });
                row.remainderCells.forEach((cell) => { cell.style.opacity = 0; cell.style.transform = ""; });
                row.subtractionLine.style.opacity = 0;
                row.subtractionLine.style.transform = "scaleX(0)";
            });
            const cribLevels = cribItems.map(() => 0);
            cursor.style.opacity = 0;
            if (givenPoint) givenPoint.style.opacity = pointIsOriginal ? setupAmount : 0;
            if (answerPoint) answerPoint.style.opacity = pointIsOriginal ? setupAmount : 0;

            rows.forEach((row) => {
                const chooseAmount = stageIndex > row.chooseStage ? 1 : stageIndex === row.chooseStage ? amount : 0;
                const subtractAmount = stageIndex > row.subtractStage ? 1 : stageIndex === row.subtractStage ? amount : 0;
                const quotientAmount = ease(chooseAmount / .55);
                const productAmount = ease((chooseAmount - .18) / .62);
                const lineAmount = ease((chooseAmount - .62) / .38);
                const cribIndex = row.operation.quotient - 1;
                const bringAmount = row.bringStage === undefined
                    ? (current.kind === "answer" && row === rows[rows.length - 1] ? amount : 0)
                    : stageIndex > row.bringStage ? 1 : stageIndex === row.bringStage ? ease((local - .58) / .42) : 0;
                if (cribIndex >= 0) cribLevels[cribIndex] = Math.max(cribLevels[cribIndex], chooseAmount * (1 - bringAmount));
                if (row.operation.index >= calc.quotientStart) {
                    if (cribIndex >= 0) glideCopy(quotientCells[row.operation.index], cribMultipliers[cribIndex], quotientAmount);
                    else reveal(quotientCells[row.operation.index], quotientAmount);
                }
                row.productCells.forEach((cell) => {
                    if (!cell.textContent) return;
                    if (cribIndex >= 0) glideCopy(cell, cribProducts[cribIndex], productAmount);
                    else reveal(cell, productAmount);
                });
                row.minus.style.opacity = productAmount;
                row.subtractionLine.style.opacity = lineAmount;
                row.subtractionLine.style.transform = `scaleX(${lineAmount})`;
                const remainderText = String(row.operation.remainder);
                const remainderStart = row.operation.index - remainderText.length + 1;
                row.remainderCells.forEach((cell, column) => {
                    if (column >= remainderStart && column <= row.operation.index) revealFromAbove(cell, subtractAmount);
                });
                if (row.bringStage !== undefined) {
                    const digitAmount = stageIndex > row.bringStage ? 1 : stageIndex === row.bringStage ? amount : 0;
                    const nextIndex = row.operation.index + 1;
                    bringDown(row, nextIndex, digitAmount);
                    if (nextIndex >= calc.originalLength) reveal(dividendCells[nextIndex], digitAmount);
                    if (nextIndex === calc.integerPlaces && !pointIsOriginal) {
                        givenPoint.style.opacity = digitAmount;
                        answerPoint.style.opacity = digitAmount;
                    }
                }
            });
            cribItems.forEach((item, index) => item.style.setProperty("--lit", cribLevels[index]));

            if (["start", "choose", "subtract", "bring"].includes(current.kind)) {
                const row = current.row;
                const from = cursorTargets[row.operationIndex];
                if (current.kind === "bring" && rows[row.operationIndex + 1]) {
                    const slide = ease((local - .58) / .42);
                    setCursor(interpolateTarget(from, cursorTargets[row.operationIndex + 1], slide));
                } else {
                    setCursor(from, current.kind === "start" ? amount : current.kind === "subtract" ? 1 : 1);
                }
            }
            if (current.kind === "answer") {
                quotientCells.forEach((cell, index) => { if (index >= calc.quotientStart) cell.style.opacity = 1; });
                if (rows.length) setCursor(cursorTargets[cursorTargets.length - 1], 1 - amount);
            }
            if (continuationMark) {
                const lastUnfinishedSubtraction = current.kind === "subtract" && current.row === rows[rows.length - 1];
                const continuationAmount = current.kind === "answer" ? amount : lastUnfinishedSubtraction ? amount : 0;
                continuationMark.style.opacity = continuationAmount;
                continuationMark.style.transform = `translateX(${(1 - continuationAmount) * -6}px)`;
            }
        };
        const describe = (stageIndex) => {
            const stage = stages[stageIndex];
            const shown = format(calc.dividend);
            if (stage.kind === "blank") return { title: `Start with ${shown} ÷ ${calc.divisor}`, copy: "The working area begins empty. Set out the dividend, divisor and multiples before choosing a quotient digit." };
            if (stage.kind === "setup") return { title: "Set out the calculation and multiples", copy: `Write ${calc.divisor} outside the bracket and ${shown} inside. List the first nine multiples of ${calc.divisor}.` };
            if (stage.kind === "start") {
                const { operation } = stage.row;
                if (operation.index >= calc.integerPlaces) {
                    return { title: `${format(calc.dividend)} is smaller than ${calc.divisor}`, copy: `Write 0 before the quotient's decimal point, then continue into the decimal places until the current amount is at least ${calc.divisor}.` };
                }
                const candidates = [];
                for (let end = 0; end <= operation.index; end += 1) candidates.push(Number(calc.digits.slice(0, end + 1).join("")));
                const rejected = candidates.slice(0, -1).map((value) => `${value} < ${calc.divisor}`).join(" and ");
                return { title: `Begin with ${operation.amount}`, copy: `${rejected ? `${rejected}, but ` : ""}${operation.amount} ≥ ${calc.divisor}. It is the shortest leading block large enough to make a whole group.` };
            }
            if (stage.kind === "choose") {
                const { operation } = stage.row;
                if (operation.quotient === 0) return { title: `${operation.amount} is smaller than ${calc.divisor}`, copy: `No positive multiple of ${calc.divisor} can be subtracted, so write 0 in this quotient place and continue.` };
                const next = (operation.quotient + 1) * calc.divisor;
                return { title: `Choose ${operation.quotient} × ${calc.divisor} = ${operation.product}`, copy: `${operation.product} does not exceed ${operation.amount}${operation.quotient < 9 ? `, while the next multiple, ${next}, is too large` : ""}. Write ${operation.quotient} in the quotient.` };
            }
            if (stage.kind === "subtract") {
                const { operation } = stage.row;
                if (calc.resultMode === "remainder" && calc.finalRemainder && stage.row === rows[rows.length - 1]) {
                    return { title: `Subtract: ${operation.amount} − ${operation.product} = ${operation.remainder}`, copy: `Every digit in the dividend has now been used. The remainder ${operation.remainder} is smaller than ${calc.divisor}, so stop and write ${shown} ÷ ${calc.divisor} = ${calc.answer}.` };
                }
                if (calc.recurring && stage.row === rows[rows.length - 1]) {
                    return { title: `Subtract: ${operation.amount} − ${operation.product} = ${operation.remainder}`, copy: `The remainder ${operation.remainder} is valid but still non-zero. The division has not finished: ${shown} ÷ ${calc.divisor} begins ${calc.answer}. Append another zero to find the next decimal digit.` };
                }
                if (operation.remainder === 0 && stage.row === rows[rows.length - 1]) {
                    return { title: `Subtract: ${operation.amount} − ${operation.product} = 0`, copy: "Nothing remains after this subtraction, so the division is complete." };
                }
                return { title: `Subtract: ${operation.amount} − ${operation.product} = ${operation.remainder}`, copy: `The remainder ${operation.remainder} is smaller than ${calc.divisor}, so this quotient digit is correct.` };
            }
            if (stage.kind === "bring") {
                const nextIndex = stage.row.operation.index + 1;
                const appended = nextIndex >= calc.originalLength;
                return { title: appended ? "Append and bring down a zero" : `Bring down the next digit, ${calc.digits[nextIndex]}`, copy: appended ? `A decimal answer is required, so append a zero without changing the dividend's value. The next current amount is ${stage.next.amount}.` : `Place it beside the remainder to make the next current amount, ${stage.next.amount}.` };
            }
            if (calc.resultMode === "remainder" && calc.finalRemainder) {
                return { title: `${shown} ÷ ${calc.divisor} = ${calc.answer}`, copy: `Check: ${calc.quotient} × ${calc.divisor} + ${calc.finalRemainder} = ${shown}.` };
            }
            if (calc.resultMode === "remainder") {
                return { title: `${shown} ÷ ${calc.divisor} = ${calc.answer}`, copy: "Nothing is left over, so no remainder needs to be written. Check the result by multiplying the quotient by the divisor." };
            }
            return calc.recurring
                ? { title: `${shown} ÷ ${calc.divisor} begins ${calc.answer}`, copy: `The remainder ${calc.finalRemainder} is still non-zero, so the decimal continues.` }
                : { title: `${shown} ÷ ${calc.divisor} = ${calc.answer}`, copy: "The division is exact. Check the result by multiplying the quotient by the divisor." };
        };
        return { stages, paint, describe };
    };

    const createScene = (scene) => {
        const sticky = scene.querySelector(".long-scene__sticky");
        const paper = scene.querySelector("[data-paper]");
        const heading = scene.querySelector("[data-expression]");
        const title = scene.querySelector("[data-step-title]");
        const copy = scene.querySelector("[data-step-copy]");
        const progress = scene.querySelector("[data-progress]");
        const dividendInput = scene.querySelector("[data-dividend-input]");
        const divisorInput = scene.querySelector("[data-divisor-input]");
        const resultModeInputs = scene.querySelectorAll("[data-result-mode]");
        const fixed = !dividendInput;
        let calc = null;
        let renderer = null;
        let dots = [];
        let currentStage = -1;
        let cardHeight = sticky.offsetHeight;
        let ticking = false;

        const clean = (input, cleaner) => {
            const before = input.value;
            const position = input.selectionStart ?? before.length;
            const after = cleaner(before);
            if (before !== after) {
                input.value = after;
                const next = Math.max(0, Math.min(after.length, position - (before.length - after.length)));
                input.setSelectionRange(next, next);
            }
            return after;
        };
        const dock = (offset = 0, preserve = false) => {
            if (sticky.parentNode !== scene) scene.insertBefore(sticky, scene.firstChild);
            sticky.classList.remove("is-pinned");
            sticky.style.removeProperty("left");
            sticky.style.removeProperty("transform");
            sticky.style.top = `${offset}px`;
            if (preserve) { sticky.style.width = `${scene.offsetWidth}px`; sticky.style.height = `${cardHeight}px`; }
            else { sticky.style.removeProperty("width"); sticky.style.removeProperty("height"); }
        };
        const pin = (left, top, width, scale) => {
            if (sticky.parentNode !== document.body) document.body.append(sticky);
            sticky.classList.add("is-pinned");
            sticky.style.left = `${left}px`; sticky.style.top = `${top}px`; sticky.style.width = `${width}px`; sticky.style.height = `${cardHeight}px`; sticky.style.transform = `scale(${scale})`;
        };
        const paintAt = (ratio) => {
            if (!renderer) return;
            const position = clamp(ratio) * renderer.stages.length;
            const stageIndex = Math.min(renderer.stages.length - 1, Math.floor(position));
            const local = clamp(position - stageIndex);
            renderer.paint(stageIndex, local);
            if (stageIndex === currentStage) return;
            currentStage = stageIndex;
            const words = renderer.describe(stageIndex);
            title.textContent = words.title; copy.textContent = words.copy;
            paper.setAttribute("aria-label", `${words.title}. ${words.copy}`);
            dots.forEach((dot, index) => { dot.classList.toggle("is-current", index === stageIndex); dot.classList.toggle("is-past", index < stageIndex); });
        };
        const inPlaceProgress = () => {
            const rect = scene.getBoundingClientRect();
            const scale = scene.offsetWidth && rect.width ? rect.width / scene.offsetWidth : 1;
            const pinTop = Math.max(16, (window.innerHeight - cardHeight * scale) / 2);
            return clamp((pinTop - rect.top) / Math.max(1, (scene.offsetHeight - cardHeight) * scale));
        };
        const update = () => {
            ticking = false;
            if (!renderer) return;
            if (!fixed && sticky.contains(document.activeElement)) { paintAt(inPlaceProgress()); return; }
            if (reduceMotion.matches) { dock(0); paintAt(1); return; }
            const rect = scene.getBoundingClientRect();
            const scale = scene.offsetWidth && rect.width ? rect.width / scene.offsetWidth : 1;
            const pinTop = Math.max(16, (window.innerHeight - cardHeight * scale) / 2);
            const travel = Math.max(1, scene.offsetHeight - cardHeight);
            const distance = pinTop - rect.top;
            const visualTravel = travel * scale;
            if (distance <= 0) { dock(0); paintAt(0); }
            else if (distance >= visualTravel) { dock(travel, true); paintAt(1); }
            else { pin(rect.left, pinTop, scene.offsetWidth, scale); paintAt(distance / visualTravel); }
        };
        const requestUpdate = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
        const setSize = () => {
            if (!renderer) return;
            if (reduceMotion.matches) {
                scene.style.setProperty("--scene-height", `${cardHeight}px`);
                scene.style.setProperty("--scene-min-height", `${cardHeight}px`);
            } else {
                scene.style.setProperty("--scene-height", `${(renderer.stages.length + 1) * (fixed ? 38 : 42)}vh`);
                scene.style.setProperty("--scene-min-height", `${(renderer.stages.length + 1) * (fixed ? 250 : 275)}px`);
            }
        };
        const accept = () => {
            const active = !fixed && sticky.contains(document.activeElement) ? document.activeElement : null;
            const scrollX = window.scrollX, scrollY = window.scrollY;
            const selection = active && typeof active.selectionStart === "number" ? [active.selectionStart, active.selectionEnd] : null;
            const dividendText = fixed ? scene.dataset.dividend : clean(dividendInput, limitDividend);
            const divisorText = fixed ? scene.dataset.divisor : clean(divisorInput, limitDivisor);
            const selectedMode = Array.from(resultModeInputs).find((input) => input.checked)?.value;
            const resultMode = fixed ? (scene.dataset.resultMode || "decimal") : (selectedMode || "decimal");
            const next = calculate(dividendText, Number(divisorText), resultMode);
            if (!fixed) {
                const dividendInvalid = !tidyDividend(dividendText) || (resultMode === "remainder" && dividendText.includes("."));
                dividendInput.setAttribute("aria-invalid", String(dividendInvalid));
                divisorInput.setAttribute("aria-invalid", String(Number(divisorText) < 10 || Number(divisorText) > 99));
            }
            if (!next) {
                renderer = null; paper.replaceChildren(); paper.classList.add("is-invalid"); progress.replaceChildren();
                title.textContent = "Enter a valid calculation";
                copy.textContent = resultMode === "remainder" && dividendText.includes(".")
                    ? "Use a whole-number dividend when the answer is written with a remainder."
                    : "Use a positive dividend and a two-digit divisor from 10 to 99.";
                return;
            }
            calc = next; renderer = buildRenderer(calc, paper);
            if (heading) heading.textContent = `${format(calc.dividend)} ÷ ${calc.divisor}`;
            dots = renderer.stages.map(() => make("span", "long-scene__dot"));
            progress.replaceChildren(...dots);
            scene.classList.add("is-ready"); currentStage = -1; cardHeight = sticky.offsetHeight; setSize();
            if (active) {
                paintAt(inPlaceProgress());
                if (document.activeElement !== active) active.focus({ preventScroll: true });
                if (selection) active.setSelectionRange(selection[0], selection[1]);
                if (window.scrollX !== scrollX || window.scrollY !== scrollY) window.scrollTo({ left: scrollX, top: scrollY, behavior: "auto" });
            } else requestUpdate();
        };
        const reset = () => { dock(0); cardHeight = sticky.offsetHeight; setSize(); currentStage = -1; requestUpdate(); };
        if (!fixed) [dividendInput, divisorInput].forEach((input) => {
            input.addEventListener("input", accept);
            input.addEventListener("blur", () => requestAnimationFrame(() => { if (!sticky.contains(document.activeElement)) reset(); }));
        });
        if (!fixed) resultModeInputs.forEach((input) => input.addEventListener("change", accept));
        accept(); update();
        return { requestUpdate, reset };
    };
    const controllers = Array.from(scenes).map(createScene);
    const nudge = () => controllers.forEach((controller) => controller.requestUpdate());
    const reset = () => controllers.forEach((controller) => controller.reset());
    window.addEventListener("scroll", nudge, { passive: true });
    window.addEventListener("resize", reset);
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", reset);
    else reduceMotion.addListener(reset);
})();
