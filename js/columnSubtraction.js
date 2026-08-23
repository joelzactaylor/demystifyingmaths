/* Scroll-led column subtraction. The page stays a normal document: each scene
   supplies its own scroll distance, JavaScript pins the card inside it, and the
   scroll position drives the drawing continuously. Nothing is toggled on: the
   digits land, the highlight travels from column to column and each exchange
   crosses out the column it came from and carries a ten to the column that
   needed it, in step with the scroll. No wheel or touch input is intercepted.

   A scene is one of two kinds. A worked example carries its two numbers in
   data-a and data-b and is read, not altered. A sandbox carries two fields
   instead, capped at five whole-number digits and three decimal places, with a
   second number larger than the first left undrawn, because a difference below
   zero is a matter for the directed-number pages rather than for this method. */
document.addEventListener("DOMContentLoaded", () => {
    const scenes = document.querySelectorAll("[data-subtraction-scene]");
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
    const singularNames = new Map([
        [5, "hundred thousand"], [4, "ten thousand"], [3, "thousand"],
        [2, "hundred"], [1, "ten"], [0, "unit"], [-1, "tenth"],
        [-2, "hundredth"], [-3, "thousandth"]
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

    /* The subtrahend is compared against the minuend digit by digit, once both
       have been padded to the same shape, so 12 and 3.475 are compared as
       12.000 and 03.475 rather than as strings of different lengths. */
    const padPair = (a, b) => {
        const decimalPlaces = Math.max(a.decimal.length, b.decimal.length);
        const wholePlaces = Math.max(a.whole.length, b.whole.length);
        const pad = (number) => `${number.whole.padStart(wholePlaces, "0")}${number.decimal.padEnd(decimalPlaces, "0")}`.split("").map(Number);
        return { decimalPlaces, wholePlaces, aDigits: pad(a), bDigits: pad(b) };
    };

    const isSmaller = (aDigits, bDigits) => {
        for (let index = 0; index < aDigits.length; index += 1) {
            if (aDigits[index] !== bDigits[index]) return aDigits[index] < bDigits[index];
        }
        return false;
    };

    /* Each column is taken from the right. Where the digit standing there is too
       small, the nearest column to the left with something to give is reduced by
       one, every zero passed on the way becomes nine, and ten arrives in the
       column that needed it. The digits are renamed; the number is unchanged.
       What the column holds when its turn comes is recorded separately from the
       digit originally written there, because a column that has already given
       something away is no longer worth what the page says. */
    const buildCalculation = (a, b, shape) => {
        const { decimalPlaces, aDigits, bDigits } = shape;
        const working = aDigits.slice();
        const operations = [];
        const result = Array(aDigits.length).fill(0);

        for (let index = aDigits.length - 1; index >= 0; index -= 1) {
            const passed = [];
            const standing = working[index];
            const alreadyReduced = standing !== aDigits[index];
            let donor = null;

            if (standing < bDigits[index]) {
                let source = index - 1;
                while (source >= 0 && working[source] === 0) {
                    passed.unshift(source);
                    source -= 1;
                }
                donor = source;
                working[source] -= 1;
                passed.forEach((column) => { working[column] = 9; });
                working[index] += 10;
            }

            result[index] = working[index] - bDigits[index];
            operations.push({
                index, donor, passed, standing, alreadyReduced,
                top: working[index],
                bottom: bDigits[index],
                donorValue: donor === null ? null : working[donor],
                resultDigit: result[index]
            });
        }

        return { a, b, aDigits, bDigits, working, result, operations, decimalPlaces, wholePlaces: aDigits.length - decimalPlaces };
    };

    const decimalGrid = (calc) => calc.decimalPlaces
        ? `repeat(${calc.wholePlaces}, var(--subtraction-cell)) 18px repeat(${calc.decimalPlaces}, var(--subtraction-cell))`
        : `repeat(${calc.wholePlaces}, var(--subtraction-cell))`;

    const exponentFor = (calc, digitIndex) => calc.wholePlaces - digitIndex - 1;

    const makeCell = (content, classes = "") => {
        const cell = document.createElement("span");
        cell.className = `subtraction-board__cell ${classes}`.trim();
        cell.textContent = content ?? "";
        return cell;
    };

    const buildRow = (calc, type, operator = "") => {
        const row = document.createElement("div");
        row.className = `subtraction-board__row subtraction-board__row--${type}`;
        const operatorCell = document.createElement("span");
        operatorCell.className = `subtraction-board__operator${operator ? "" : " subtraction-board__operator--blank"}`;
        operatorCell.textContent = operator || "·";
        row.append(operatorCell);
        const digits = document.createElement("div");
        digits.className = "subtraction-board__digits";
        digits.style.setProperty("--subtraction-columns", decimalGrid(calc));
        row.append(digits);
        return { row, digits };
    };

    const paddedPlaceholder = (calc, number, index) => {
        const extraWhole = calc.wholePlaces - number.whole.length;
        const decimalIndex = index - calc.wholePlaces;
        return index < extraWhole || (decimalIndex >= 0 && decimalIndex >= number.decimal.length);
    };

    /* One scene: its own numbers, its own board, its own scroll distance. */
    const createScene = (scene) => {
        const sticky = scene.querySelector(".subtraction-scene__sticky");
        const inputs = {
            a: scene.querySelector('[data-term="a"]'),
            b: scene.querySelector('[data-term="b"]')
        };
        const fixed = !inputs.a || !inputs.b;
        const paper = scene.querySelector("[data-paper]");
        const notice = scene.querySelector("[data-notice]");
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
                const cell = makeCell(character, `subtraction-board__cell--point ${classes}`.trim());
                points.push(cell);
                container.append(cell);
            };

            const labels = buildRow(calc, "labels");
            const labelCells = [];
            for (let index = 0; index < count; index += 1) {
                if (calc.decimalPlaces && index === calc.wholePlaces) pointCell(labels.digits, "", "subtraction-board__cell--label");
                const cell = makeCell(placeLabels.get(exponentFor(calc, index)) || "", "subtraction-board__cell--label");
                labelCells.push(cell);
                labels.digits.append(cell);
            }
            paper.append(labels.row);

            const exchange = buildRow(calc, "exchange");
            const exchangeCells = [];
            for (let index = 0; index < count; index += 1) {
                if (calc.decimalPlaces && index === calc.wholePlaces) pointCell(exchange.digits, "");
                const cell = makeCell("");
                exchangeCells.push(cell);
                exchange.digits.append(cell);
            }
            paper.append(exchange.row);

            const termRow = (digits, number, operator, extra) => {
                const built = buildRow(calc, `term${extra}`, operator);
                const cells = [];
                digits.forEach((value, index) => {
                    if (calc.decimalPlaces && index === calc.wholePlaces) pointCell(built.digits, ".");
                    const cell = makeCell(value, paddedPlaceholder(calc, number, index) ? "subtraction-board__cell--placeholder" : "");
                    cells.push(cell);
                    built.digits.append(cell);
                });
                paper.append(built.row);
                return cells;
            };

            const firstCells = termRow(calc.aDigits, calc.a, "", "");
            const secondCells = termRow(calc.bDigits, calc.b, "−", " subtraction-board__row--second");

            /* Leading zeros in the answer are written but greyed: the columns
               were worked, and the number does not start there. */
            let leading = 0;
            while (leading < calc.wholePlaces - 1 && calc.result[leading] === 0) leading += 1;

            const result = buildRow(calc, "result");
            const answerCells = [];
            calc.result.forEach((value, index) => {
                if (calc.decimalPlaces && index === calc.wholePlaces) pointCell(result.digits, ".");
                const cell = makeCell(value, `subtraction-board__answer${index < leading ? " subtraction-board__cell--placeholder" : ""}`);
                answerCells.push(cell);
                result.digits.append(cell);
            });
            paper.append(result.row);

            /* A column that has given part of its value away shows its new digit
               above the crossed-out one. The ten an exchange brings in is
               written in front of the digit it joins, never above it: in front
               of the reduced digit where the column has one, and against the
               digit in the number itself where it has not, so the column reads
               as the two-digit number it now holds. Both marks are recorded
               against the step that made them, so a frame can decide how much
               of each has happened. */
            const reducedColumns = new Set();
            calc.operations.forEach((operation) => {
                if (operation.donor === null) return;
                reducedColumns.add(operation.donor);
                operation.passed.forEach((column) => reducedColumns.add(column));
            });

            const reductions = [];
            const badges = [];

            calc.operations.forEach((operation, order) => {
                if (operation.donor === null) return;

                const badge = document.createElement("span");
                badge.className = "subtraction-board__ten";
                badge.textContent = "1";
                const host = reducedColumns.has(operation.index) ? exchangeCells : firstCells;
                host[operation.index].prepend(badge);
                badges.push({ badge, operation, order });

                const written = (column, value) => {
                    const mark = document.createElement("span");
                    mark.className = "subtraction-board__reduced";
                    mark.textContent = value;
                    exchangeCells[column].append(mark);
                    reductions.push({ mark, column, order });
                };

                written(operation.donor, operation.donorValue);
                operation.passed.forEach((column) => written(column, 9));
            });

            const cursor = document.createElement("span");
            cursor.className = "subtraction-board__cursor";
            paper.append(cursor);

            board = {
                count, points, labelCells, firstCells, secondCells, answerCells,
                exchangeCells, reductions, badges, cursor,
                exchangeRow: exchange.row, resultRow: result.row, columns: []
            };
            measureBoard();
        };

        /* Column positions are read from the finished layout rather than
           assumed, so the highlight and the travelling ten follow the
           stylesheet. */
        const measureBoard = () => {
            if (!board) return;
            board.columns = board.answerCells.map((cell) => ({ left: cell.offsetLeft, width: cell.offsetWidth }));
            const height = board.resultRow.offsetTop + board.resultRow.offsetHeight - board.exchangeRow.offsetTop;
            board.cursor.style.top = `${board.exchangeRow.offsetTop}px`;
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

            /* The exchange happens first in a column's step, and the answer
               digit is written once it has arrived. */
            board.badges.forEach(({ badge, operation, order }) => {
                const reveal = ease((u - order - .04) / .42);
                const from = board.columns[operation.donor];
                const to = board.columns[operation.index];
                const travel = 1 - reveal;
                badge.style.opacity = reveal;
                badge.style.transform = `translateX(${(from.left - to.left) * travel}px) scale(${lerp(.7, 1, reveal)})`;
            });

            board.reductions.forEach(({ mark, column, order }) => {
                const reveal = ease((u - order - .18) / .38);
                mark.style.opacity = reveal;
                mark.style.transform = `translateY(${(1 - reveal) * 12}px)`;
                board.firstCells[column].classList.toggle("is-spent", reveal > .5);
            });

            calc.operations.forEach((operation, order) => {
                const reveal = ease((u - order - .52) / .4);
                const cell = board.answerCells[operation.index];
                cell.style.opacity = reveal;
                cell.style.transform = `translateY(${(1 - reveal) * -15}px) scale(${lerp(.74, 1, reveal)})`;
            });

            const held = clamp(Math.floor(u), 0, steps - 1);
            const nextColumn = Math.min(steps - 1, held + 1);
            const slide = ease((clamp(u - held, 0, 1) - .62) / .38);
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
                    ? `Begin with the decimal points directly beneath one another. Write ${padded.join(" and ")} so every occupied place has a digit to work with.`
                    : "Begin with equal place values directly beneath one another. The ones sit under the ones, the tens under the tens, and so on.";
                return;
            }

            if (stage <= calc.operations.length) {
                const operation = calc.operations[stage - 1];
                const name = placeNames.get(exponentFor(calc, operation.index)) || "next";
                stepTitle.textContent = `Subtract the ${name} column`;

                /* A column that has already paid for an earlier exchange no
                   longer holds the digit written on the page, so the sentence
                   says what is actually there. */
                const holding = operation.alreadyReduced
                    ? `The ${name} were lowered to ${operation.standing}, which cannot pay ${operation.bottom}`
                    : `${operation.standing} is smaller than ${operation.bottom}`;

                if (operation.donor === null) {
                    stepCopy.textContent = operation.alreadyReduced
                        ? `The ${name} were lowered to ${operation.standing}, and ${operation.standing} − ${operation.bottom} = ${operation.resultDigit}. Nothing needs to be exchanged.`
                        : `${operation.top} − ${operation.bottom} = ${operation.resultDigit}. Write ${operation.resultDigit} in the ${name} column. Nothing needs to be exchanged.`;
                    return;
                }

                const donorName = placeNames.get(exponentFor(calc, operation.donor)) || "column to the left";
                const donorUnit = singularNames.get(exponentFor(calc, operation.donor)) || "unit";
                const passed = operation.passed.length
                    ? " The columns in between hold nothing to give, so each becomes 9 as the exchange passes through."
                    : "";
                stepCopy.textContent = `${holding}, so one ${donorUnit} is exchanged from the ${donorName} column.${passed} The ${name} become ${operation.top}, and ${operation.top} − ${operation.bottom} = ${operation.resultDigit}.`;
                return;
            }

            const answer = formatDigits(calc.result, calc.decimalPlaces);
            stepTitle.textContent = `The difference is ${answer}`;
            stepCopy.textContent = calc.decimalPlaces
                ? "Read the result from left to right. The decimal point has stayed in its own column, directly beneath the decimal points above it."
                : `Read the result from left to right. Adding ${answer} to ${readable(calc.b.whole, calc.b.decimal)} returns ${readable(calc.a.whole, calc.a.decimal)}, which is the check worth making.`;
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
                dot.className = "subtraction-scene__dot";
                return dot;
            });
            progressBar.replaceChildren(...dots);
        };

        const render = (progress) => paint(clamp(progress) * totalStages);

        scene.classList.add("is-ready");
        let cardHeight = sticky.offsetHeight;

        const dock = (offset = 0) => {
            if (sticky.parentNode !== scene) scene.insertBefore(sticky, scene.firstChild);
            sticky.classList.remove("is-pinned");
            sticky.style.removeProperty("left");
            sticky.style.removeProperty("width");
            sticky.style.removeProperty("height");
            sticky.style.removeProperty("transform");
            sticky.style.top = `${offset}px`;
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

        const accept = () => {
            const a = parseNumber(fixed ? limit(scene.dataset.a || "") : limitValue(inputs.a));
            const b = parseNumber(fixed ? limit(scene.dataset.b || "") : limitValue(inputs.b));
            if (!a || !b) return;

            const shape = padPair(a, b);
            if (isSmaller(shape.aDigits, shape.bDigits)) {
                if (notice) notice.hidden = false;
                return;
            }
            if (notice) notice.hidden = true;

            calculation = buildCalculation(a, b, shape);
            const stages = calculation.operations.length + 2;
            if (stages !== totalStages) {
                totalStages = stages;
                buildDots();
                scene.style.setProperty("--scene-height", `${(totalStages + 1) * paceVh}vh`);
                scene.style.setProperty("--scene-min-height", `${(totalStages + 1) * pacePx}px`);
            }

            /* Rebuild the drawing against the new numbers and repaint at the
               scroll position the reader is already at. The card is never
               re-measured here: moving it while a field has focus would lose
               the caret. */
            buildBoard();
            stage = -1;
            requestUpdate();
        };

        if (!fixed) Object.values(inputs).forEach((input) => input.addEventListener("input", accept));

        const reset = () => {
            measure();
            stage = -1;
            requestUpdate();
        };

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
