/* Scroll-led column addition. The page stays a normal document: each scene
   supplies its own scroll distance, JavaScript pins the card inside it, and the
   scroll position drives the drawing continuously. Nothing is toggled on: the
   digits land, the highlight travels from column to column and the regrouped
   amounts fly to their places in step with the scroll, exactly as far as the
   reader has scrolled. No wheel or touch input is intercepted.

   A scene is one of two kinds. A worked example carries its two numbers in
   data-a and data-b and is read, not altered. A sandbox carries two fields
   instead, capped at five whole-number digits and three decimal places. */
document.addEventListener("DOMContentLoaded", () => {
    const scenes = document.querySelectorAll("[data-addition-scene]");
    if (!scenes.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const ease = (value) => {
        const x = clamp(value);
        return x * x * (3 - 2 * x);
    };
    const lerp = (from, to, amount) => from + (to - from) * amount;

    const placeNames = new Map([
        [5, "hundred-thousands"], [4, "ten-thousands"], [3, "thousands"],
        [2, "hundreds"], [1, "tens"], [0, "ones"], [-1, "tenths"],
        [-2, "hundredths"], [-3, "thousandths"]
    ]);
    const placeLabels = new Map([
        [5, "100,000s"], [4, "10,000s"], [3, "1,000s"], [2, "100s"],
        [1, "10s"], [0, "1s"], [-1, "0.1s"], [-2, "0.01s"], [-3, "0.001s"]
    ]);

    const limit = (raw) => {
        const digits = raw.replace(/[^\d.]/g, "");
        const hasPoint = digits.includes(".");
        const [wholeRaw, ...rest] = digits.split(".");
        return `${wholeRaw.slice(0, 5)}${hasPoint ? `.${rest.join("").slice(0, 3)}` : ""}`;
    };

    const parseNumber = (value) => {
        if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) return null;
        const [wholeRaw, decimal = ""] = value.split(".");
        const whole = (wholeRaw || "0").replace(/^0+(?=\d)/, "");
        return { whole, decimal };
    };

    /* Numbers spoken in the captions are grouped the way the page around them
       writes them, so 6145 is never read back as anything but 6,145. */
    const readable = (whole, decimal) => `${Number(whole).toLocaleString("en-GB")}${decimal ? `.${decimal}` : ""}`;

    const formatDigits = (digits, decimalPlaces) => {
        const raw = digits.join("");
        const split = raw.length - decimalPlaces;
        const whole = raw.slice(0, split).replace(/^0+(?=\d)/, "") || "0";
        const decimal = decimalPlaces ? raw.slice(split).padStart(decimalPlaces, "0") : "";
        return `${Number(whole).toLocaleString("en-GB")}${decimalPlaces ? `.${decimal}` : ""}`;
    };

    const buildCalculation = (a, b) => {
        const decimalPlaces = Math.max(a.decimal.length, b.decimal.length);
        const wholePlaces = Math.max(a.whole.length, b.whole.length);
        const padNumber = (number) => `${number.whole.padStart(wholePlaces, "0")}${number.decimal.padEnd(decimalPlaces, "0")}`.split("").map(Number);
        const aDigits = padNumber(a);
        const bDigits = padNumber(b);
        const operations = [];
        const result = Array(aDigits.length).fill(0);
        let carry = 0;

        for (let index = aDigits.length - 1; index >= 0; index -= 1) {
            const carryIn = carry;
            const total = aDigits[index] + bDigits[index] + carryIn;
            const resultDigit = total % 10;
            carry = Math.floor(total / 10);
            result[index] = resultDigit;
            operations.push({ index, carryIn, total, resultDigit, carryOut: carry });
        }

        if (carry) {
            aDigits.unshift(null);
            bDigits.unshift(null);
            result.unshift(carry);
            operations.forEach((operation) => { operation.index += 1; });
        }

        return { a, b, aDigits, bDigits, result, operations, decimalPlaces, wholePlaces: aDigits.length - decimalPlaces, finalCarry: carry };
    };

    const decimalGrid = (calc) => calc.decimalPlaces
        ? `repeat(${calc.wholePlaces}, var(--addition-cell)) 18px repeat(${calc.decimalPlaces}, var(--addition-cell))`
        : `repeat(${calc.wholePlaces}, var(--addition-cell))`;

    const exponentFor = (calc, digitIndex) => calc.wholePlaces - digitIndex - 1;

    const makeCell = (content, classes = "") => {
        const cell = document.createElement("span");
        cell.className = `addition-board__cell ${classes}`.trim();
        cell.textContent = content ?? "";
        return cell;
    };

    const buildRow = (calc, type, operator = "") => {
        const row = document.createElement("div");
        row.className = `addition-board__row addition-board__row--${type}`;
        const operatorCell = document.createElement("span");
        operatorCell.className = `addition-board__operator${operator ? "" : " addition-board__operator--blank"}`;
        operatorCell.textContent = operator || "·";
        row.append(operatorCell);
        const digits = document.createElement("div");
        digits.className = "addition-board__digits";
        digits.style.setProperty("--addition-columns", decimalGrid(calc));
        row.append(digits);
        return { row, digits };
    };

    const paddedPlaceholder = (calc, number, index, value) => {
        if (value === null) return false;
        const extraWhole = calc.wholePlaces - number.whole.length;
        const decimalIndex = index - calc.wholePlaces;
        return index < extraWhole || (decimalIndex >= number.decimal.length && decimalIndex >= 0);
    };

    /* One scene: its own numbers, its own board, its own scroll distance. */
    const createScene = (scene) => {
        const sticky = scene.querySelector(".addition-scene__sticky");
        const inputs = {
            a: scene.querySelector('[data-addend="a"]'),
            b: scene.querySelector('[data-addend="b"]')
        };
        const fixed = !inputs.a || !inputs.b;
        const paper = scene.querySelector("[data-paper]");
        const stepTitle = scene.querySelector("[data-step-title]");
        const stepCopy = scene.querySelector("[data-step-copy]");
        const progressBar = scene.querySelector("[data-progress]");

        /* A worked example is read once and moved past, so it asks for less of
           the page than a sandbox somebody will scrub back and forth. */
        const paceVh = fixed ? 30 : 42;
        const pacePx = fixed ? 250 : 340;

        let calculation = null;
        let board = null;
        let totalStages = 0;
        let stage = -1;
        let dots = [];

        const limitValue = (input) => {
            const raw = input.value;
            const cleaned = limit(raw);
            if (cleaned !== raw) {
                const caret = input.selectionStart ?? cleaned.length;
                const position = Math.max(0, Math.min(cleaned.length, caret - (raw.length - cleaned.length)));
                input.value = cleaned;
                input.setSelectionRange(position, position);
            }
            return cleaned;
        };

        /* The board is built once per pair of numbers. Every element that the
           scroll animates keeps its node, so a frame only has to set opacity
           and transform. */
        const buildBoard = () => {
            const calc = calculation;
            const count = calc.aDigits.length;
            const points = [];
            paper.replaceChildren();

            const pointCell = (container, character, classes = "") => {
                const cell = makeCell(character, `addition-board__cell--point ${classes}`.trim());
                points.push(cell);
                container.append(cell);
            };

            const labels = buildRow(calc, "labels");
            const labelCells = [];
            for (let index = 0; index < count; index += 1) {
                if (calc.decimalPlaces && index === calc.wholePlaces) pointCell(labels.digits, "", "addition-board__cell--label");
                const cell = makeCell(placeLabels.get(exponentFor(calc, index)) || "", "addition-board__cell--label");
                labelCells.push(cell);
                labels.digits.append(cell);
            }
            paper.append(labels.row);

            const carry = buildRow(calc, "carry");
            const carryCells = [];
            for (let index = 0; index < count; index += 1) {
                if (calc.decimalPlaces && index === calc.wholePlaces) pointCell(carry.digits, "");
                const cell = makeCell("");
                carryCells.push(cell);
                carry.digits.append(cell);
            }
            paper.append(carry.row);

            const addendRow = (digits, number, operator, extra) => {
                const built = buildRow(calc, `addend${extra}`, operator);
                const cells = [];
                digits.forEach((value, index) => {
                    if (calc.decimalPlaces && index === calc.wholePlaces) pointCell(built.digits, ".");
                    const cell = makeCell(value, paddedPlaceholder(calc, number, index, value) ? "addition-board__cell--placeholder" : "");
                    cells.push(cell);
                    built.digits.append(cell);
                });
                paper.append(built.row);
                return cells;
            };

            const firstCells = addendRow(calc.aDigits, calc.a, "", "");
            const secondCells = addendRow(calc.bDigits, calc.b, "+", " addition-board__row--second");

            const result = buildRow(calc, "result");
            const answerCells = [];
            calc.result.forEach((value, index) => {
                if (calc.decimalPlaces && index === calc.wholePlaces) pointCell(result.digits, ".");
                const cell = makeCell(value, "addition-board__answer");
                answerCells.push(cell);
                result.digits.append(cell);
            });
            paper.append(result.row);

            const badges = calc.operations.reduce((collected, operation, order) => {
                if (!operation.carryOut || operation.index < 1) return collected;
                const badge = document.createElement("span");
                badge.className = "addition-board__carry";
                badge.textContent = operation.carryOut;
                carryCells[operation.index - 1].append(badge);
                collected.push({ badge, operation, order });
                return collected;
            }, []);

            const cursor = document.createElement("span");
            cursor.className = "addition-board__cursor";
            paper.append(cursor);

            board = {
                count, points, labelCells, firstCells, secondCells, answerCells, badges, cursor,
                carryRow: carry.row, resultRow: result.row, columns: []
            };
            measureBoard();
        };

        /* Column positions are read from the finished layout rather than
           assumed, so the highlight and the regrouped amounts follow the
           stylesheet. */
        const measureBoard = () => {
            if (!board) return;
            board.columns = board.answerCells.map((cell) => ({ left: cell.offsetLeft, width: cell.offsetWidth }));
            board.carryDrop = board.resultRow.offsetTop - board.carryRow.offsetTop;
            const height = board.resultRow.offsetTop + board.resultRow.offsetHeight - board.carryRow.offsetTop;
            board.cursor.style.top = `${board.carryRow.offsetTop}px`;
            board.cursor.style.height = `${height}px`;
            if (board.columns.length) board.cursor.style.width = `${board.columns[0].width}px`;
        };

        const paint = (position) => {
            const calc = calculation;
            const count = board.count;
            const steps = calc.operations.length;
            const t = clamp(position, 0, totalStages);
            const u = t - 1;

            /* Stage one: the paper settles first, then the two numbers arrive
               column by column. Each column takes half the stage to fade, and
               the last one only finishes as the stage does, so nothing snaps
               into view. */
            const arrival = ease(t / .58);
            paper.style.opacity = lerp(.12, 1, arrival);
            paper.style.transform = `scale(${lerp(.968, 1, arrival)})`;

            for (let index = 0; index < count; index += 1) {
                const delay = (index / count) * .5;
                const local = ease((t - .06 - delay) / .5);
                const lift = (1 - local) * -22;
                [board.firstCells[index], board.secondCells[index]].forEach((cell) => {
                    cell.style.opacity = local;
                    cell.style.transform = `translateY(${lift}px) scale(${lerp(.86, 1, local)})`;
                });
                board.labelCells[index].style.opacity = ease((t - delay) / .68);
            }
            board.points.forEach((cell) => { cell.style.opacity = ease((t - .1) / .7); });

            /* Each column writes its answer digit, then sends its regrouped
               amount up and to the left into the column that will take it. */
            calc.operations.forEach((operation, order) => {
                const reveal = ease((u - order - .3) / .4);
                const cell = board.answerCells[operation.index];
                cell.style.opacity = reveal;
                cell.style.transform = `translateY(${(1 - reveal) * -15}px) scale(${lerp(.74, 1, reveal)})`;
            });

            if (calc.finalCarry) {
                const reveal = ease((u - steps + .4) / .4);
                const cell = board.answerCells[0];
                cell.style.opacity = reveal;
                cell.style.transform = `translateY(${(1 - reveal) * -15}px) scale(${lerp(.74, 1, reveal)})`;
            }

            board.badges.forEach(({ badge, operation, order }) => {
                const reveal = ease((u - order - .46) / .46);
                const from = board.columns[operation.index];
                const to = board.columns[operation.index - 1];
                const travel = 1 - reveal;
                badge.style.opacity = reveal;
                badge.style.transform = `translate(${(from.left - to.left) * travel}px, ${board.carryDrop * travel}px) scale(${lerp(.7, 1, reveal)})`;
            });

            const held = clamp(Math.floor(u), 0, steps - 1);
            const nextColumn = Math.min(steps - 1, held + 1);
            const slide = ease((clamp(u - held, 0, 1) - .58) / .42);
            const centre = (order) => board.columns[calc.operations[order].index].left;
            board.cursor.style.transform = `translateX(${lerp(centre(held), centre(nextColumn), slide)}px)`;
            board.cursor.style.opacity = ease((t - .78) / .32) * (1 - ease((u - steps + .15) / .5));
            paper.classList.toggle("is-complete", u >= steps + .35);

            const next = Math.min(totalStages - 1, Math.floor(t));
            if (next === stage) return;
            stage = next;
            describeStage();
            paintDots();
        };

        const describeStage = () => {
            const calc = calculation;

            if (stage === 0) {
                stepTitle.textContent = "Align equal place values";
                const padded = [];
                if (calc.a.decimal.length < calc.decimalPlaces) padded.push(`${readable(calc.a.whole, calc.a.decimal)} as ${readable(calc.a.whole, calc.a.decimal.padEnd(calc.decimalPlaces, "0"))}`);
                if (calc.b.decimal.length < calc.decimalPlaces) padded.push(`${readable(calc.b.whole, calc.b.decimal)} as ${readable(calc.b.whole, calc.b.decimal.padEnd(calc.decimalPlaces, "0"))}`);
                stepCopy.textContent = padded.length
                    ? `Begin with the decimal points directly beneath one another. Write ${padded.join(" and ")} so every occupied place is visible.`
                    : "Begin with equal place values directly beneath one another. The ones sit under the ones, the tens under the tens, and so on.";
                return;
            }

            if (stage <= calc.operations.length) {
                const operation = calc.operations[stage - 1];
                const exponent = exponentFor(calc, operation.index);
                const name = placeNames.get(exponent) || "next";
                const leftName = placeNames.get(exponent + 1) || "next column";
                const aDigit = calc.aDigits[operation.index] ?? 0;
                const bDigit = calc.bDigits[operation.index] ?? 0;
                const parts = [aDigit, bDigit];
                if (operation.carryIn) parts.unshift(operation.carryIn);
                stepTitle.textContent = `Add the ${name} column`;
                stepCopy.textContent = operation.carryOut
                    ? `${parts.join(" + ")} = ${operation.total}. Write ${operation.resultDigit} in the ${name} column and regroup ${operation.carryOut} into the ${leftName} column.`
                    : `${parts.join(" + ")} = ${operation.total}. Write ${operation.resultDigit} in the ${name} column. There is no need to regroup.`;
                return;
            }

            const answer = formatDigits(calc.result, calc.decimalPlaces);
            stepTitle.textContent = `The sum is ${answer}`;
            stepCopy.textContent = calc.decimalPlaces
                ? "Read the result from left to right. The decimal point has stayed in its own column, directly beneath the decimal points above it."
                : "Read the result from left to right. Every column has been added, including the final regrouped amount.";
        };

        const paintDots = () => {
            dots.forEach((dot, index) => {
                dot.classList.toggle("is-current", index === stage);
                dot.classList.toggle("is-past", index < stage);
            });
        };

        const buildDots = () => {
            dots = Array.from({ length: totalStages }, () => {
                const dot = document.createElement("span");
                dot.className = "addition-scene__dot";
                return dot;
            });
            progressBar.replaceChildren(...dots);
        };

        const render = (progress) => paint(clamp(progress) * totalStages);

        scene.classList.add("is-ready");
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
            sticky.style.removeProperty("left");
            sticky.style.removeProperty("width");
            sticky.style.removeProperty("height");
            sticky.style.removeProperty("transform");
            sticky.style.top = `${offset}px`;
        };

        const pin = (left, top, width, scale) => {
            if (sticky.parentNode !== document.body) moveCard(() => document.body.append(sticky));
            sticky.classList.add("is-pinned");
            sticky.style.left = `${left}px`;
            sticky.style.top = `${top}px`;
            sticky.style.width = `${width}px`;
            sticky.style.height = `${cardHeight}px`;
            sticky.style.transform = `scale(${scale})`;
        };

        const measure = () => {
            dock(0);
            cardHeight = sticky.offsetHeight;
            measureBoard();
        };

        let ticking = false;

        const update = () => {
            ticking = false;
            if (!calculation) return;

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
                dock(travel);
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

        const repaintInPlace = () => {
            if (reduceMotion.matches) {
                render(1);
                return;
            }
            const sceneRect = scene.getBoundingClientRect();
            const visualScale = scene.offsetWidth && sceneRect.width ? sceneRect.width / scene.offsetWidth : 1;
            const pinTop = Math.max(16, (window.innerHeight - cardHeight * visualScale) / 2);
            const travel = Math.max(1, scene.offsetHeight - cardHeight);
            render(clamp((pinTop - sceneRect.top) / (travel * visualScale)));
        };

        const accept = () => {
            const active = !fixed && sticky.contains(document.activeElement)
                ? document.activeElement
                : null;
            const scrollLeft = window.scrollX;
            const scrollTop = window.scrollY;
            const a = parseNumber(fixed ? limit(scene.dataset.a || "") : limitValue(inputs.a));
            const b = parseNumber(fixed ? limit(scene.dataset.b || "") : limitValue(inputs.b));
            const selection = active && typeof active.selectionStart === "number"
                ? [active.selectionStart, active.selectionEnd]
                : null;
            if (!a || !b) return;

            calculation = buildCalculation(a, b);
            const stages = calculation.operations.length + 2;
            if (stages !== totalStages) {
                totalStages = stages;
                buildDots();
                scene.style.setProperty("--scene-height", `${(totalStages + 1) * paceVh}vh`);
                scene.style.setProperty("--scene-min-height", `${(totalStages + 1) * pacePx}px`);
            }

            /* Rebuild the drawing against the new numbers and repaint at the
               scroll position the reader is already at. */
            buildBoard();
            stage = -1;
            if (active) {
                repaintInPlace();
                if (document.activeElement !== active) active.focus({ preventScroll: true });
                if (selection) active.setSelectionRange(selection[0], selection[1]);
            }
            /* A smaller calculation is a shorter scene, which can leave the
               reader below the whole of it. They are put back where they were,
               and no further down than the point at which the card comes to
               rest at the foot of its travel: from there the finished working
               is what is in front of them, not the empty page under it. */
            const restRect = scene.getBoundingClientRect();
            const restScale = scene.offsetWidth && restRect.width ? restRect.width / scene.offsetWidth : 1;
            const restTop = Math.max(16, (window.innerHeight - cardHeight * restScale) / 2);
            const lowest = Math.max(0, window.scrollY + restRect.top - restTop
                + Math.max(1, scene.offsetHeight - cardHeight) * restScale);
            const settled = Math.min(scrollTop, lowest);
            if (window.scrollX !== scrollLeft || window.scrollY !== settled) {
                window.scrollTo({ left: scrollLeft, top: settled, behavior: "auto" });
            }
            /* The rebuild can change the scene's height, so the card is
               positioned again whether or not the reader is still in it. */
            requestUpdate();
        };

        const reset = () => {
            measure();
            stage = -1;
            requestUpdate();
        };

        if (!fixed) Object.values(inputs).forEach((input) => {
            input.addEventListener("input", accept);
            input.addEventListener("blur", () => requestAnimationFrame(() => {
                if (!sticky.contains(document.activeElement)) reset();
            }));
        });

        /* The card is measured only once the board has digits in it: a worked
           example sizes itself to its own calculation, so an empty paper would
           under-measure it and the pinned card would clip its own answer. */
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
});
