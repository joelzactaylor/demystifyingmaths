/* Scroll-led long multiplication, taught as one calculation seen four ways.

   The same six products carry the whole page. A grid gives each of them a box,
   an expanded column layout gives each of them a line with the product that
   made it written alongside, those lines are gathered into one row for each
   digit of the multiplier, and only then is the short form worth having. Each
   view is a scene: the scene supplies its own scroll distance, JavaScript pins
   the card inside it, and the scroll position drives the drawing continuously.
   No wheel or touch input is intercepted.

   A scene names its view in data-mode and its numbers in data-a and data-b. A
   scene with two fields instead of data-a is a sandbox, always in the short
   form, capped at four digits above and three below. */
document.addEventListener("DOMContentLoaded", () => {
    const scenes = document.querySelectorAll("[data-multiplication-scene]");
    if (!scenes.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const ease = (value) => {
        const x = clamp(value);
        return x * x * (3 - 2 * x);
    };
    const lerp = (from, to, amount) => from + (to - from) * amount;

    const placeNames = new Map([
        [6, "millions"], [5, "hundred-thousands"], [4, "ten-thousands"],
        [3, "thousands"], [2, "hundreds"], [1, "tens"], [0, "ones"]
    ]);
    const placeLabels = new Map([
        [6, "1,000,000s"], [5, "100,000s"], [4, "10,000s"], [3, "1,000s"],
        [2, "100s"], [1, "10s"], [0, "1s"]
    ]);

    /* Numbers spoken in the captions are grouped the way the page around them
       writes them, so 6145 is never read back as anything but 6,145. */
    const readable = (value) => Number(value).toLocaleString("en-GB");
    const fromDigits = (digits) => Number(digits.join("") || "0");
    const listNames = (names) => (names.length > 1
        ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
        : names[0]);
    const counts = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
    const spell = (value) => counts[value] || String(value);
    const capital = (text) => text.charAt(0).toUpperCase() + text.slice(1);
    const plural = (value, word) => `${spell(value)} ${word}${value === 1 ? "" : "s"}`;

    const limit = (raw, places) => raw.replace(/\D/g, "").slice(0, places).replace(/^0+(?=\d)/, "");
    const parseNumber = (value) => (/^\d+$/.test(value) ? value : null);

    /* One pass of the method, recorded before anything is drawn. Every view
       reads from this: the parts each number splits into, the product of every
       pair of parts, the row each digit of the multiplier produces, and the
       single step each digit of the short form is worth. */
    const buildCalculation = (a, b) => {
        const aDigits = a.split("").map(Number);
        const bDigits = b.split("").map(Number);
        const rows = [];
        const steps = [];
        const drafts = [];

        for (let order = 0; order < bDigits.length; order += 1) {
            const multiplier = bDigits[bDigits.length - 1 - order];
            const written = [];
            const rowSteps = [];
            let carry = 0;

            for (let place = 0; place < aDigits.length; place += 1) {
                const digit = aDigits[aDigits.length - 1 - place];
                const product = digit * multiplier;
                const total = product + carry;
                written.unshift(total % 10);
                rowSteps.push({
                    kind: "digit", row: order, place, digit, multiplier, product,
                    carryIn: carry, total, writes: total % 10,
                    carryOut: Math.floor(total / 10),
                    last: place === aDigits.length - 1
                });
                carry = Math.floor(total / 10);
            }
            if (carry) written.unshift(carry);
            drafts.push({ order, multiplier, rowSteps, digits: written.concat(Array(order).fill(0)) });
        }

        /* The board is only as wide as the working actually needs. Four digits
           multiplied by three do not always reach seven columns, and a column
           that stays empty from beginning to end teaches nothing. */
        const product = Number(a) * Number(b);
        const width = Math.max(
            aDigits.length, bDigits.length, String(product).length,
            ...drafts.map((draft) => draft.digits.length)
        );

        drafts.forEach(({ order, multiplier, rowSteps, digits }) => {
            rows.push({ order, multiplier, digits, start: width - digits.length });

            /* The zeros come first: the row cannot start until the columns it
               is shifted past have been held. */
            if (order) steps.push({ kind: "zeros", row: order, multiplier });
            if (multiplier === 0) steps.push({ kind: "empty", row: order, multiplier });
            else steps.push(...rowSteps);
        });

        const answer = Array(width).fill(0);
        const answerCarries = Array(width).fill(0);
        let overflow = 0;

        for (let column = width - 1; column >= 0; column -= 1) {
            let sum = overflow;
            rows.forEach((row) => {
                const index = column - row.start;
                if (index >= 0 && index < row.digits.length) sum += row.digits[index];
            });
            answer[column] = sum % 10;
            overflow = Math.floor(sum / 10);
            answerCarries[column] = overflow;
        }

        const sumRow = rows.length > 1;
        if (sumRow) steps.push({ kind: "add" });

        const significant = answer.findIndex((digit) => digit !== 0);
        const answerStart = sumRow
            ? (significant === -1 ? width - 1 : significant)
            : rows[0].start;

        /* The parts, largest first, which is the order they are written in. */
        const partsOf = (digits) => digits.map((digit, index) => {
            const exponent = digits.length - 1 - index;
            return { digit, exponent, value: digit * (10 ** exponent) };
        });
        const aParts = partsOf(aDigits);
        const bParts = partsOf(bDigits);

        /* Every pair of parts, in the order the expanded layout writes them:
           the multiplier's ones first, and within that the smallest part of the
           number above first, so the lines grow towards the left. */
        const lines = [];
        for (let g = bParts.length - 1; g >= 0; g -= 1) {
            for (let i = aParts.length - 1; i >= 0; i -= 1) {
                const bPart = bParts[g];
                const aPart = aParts[i];
                const value = bPart.value * aPart.value;
                const text = String(value);
                lines.push({
                    group: bParts.length - 1 - g,
                    gridRow: g, gridColumn: i,
                    bPart, aPart, value,
                    digits: text.split("").map(Number),
                    start: width - text.length
                });
            }
        }

        return {
            a, b, aDigits, bDigits, width, aParts, bParts, lines,
            rows, steps, answer, answerCarries, answerStart, sumRow, product
        };
    };

    /* ---------------------------------------------------------------- parts */

    const makeCell = (content, classes = "") => {
        const cell = document.createElement("span");
        cell.className = `multiplication-board__cell ${classes}`.trim();
        cell.textContent = content === null || content === undefined ? "" : content;
        return cell;
    };

    const buildRow = (width, type, operator = "", note = false) => {
        const row = document.createElement("div");
        row.className = `multiplication-board__row multiplication-board__row--${type}`;
        const operatorCell = document.createElement("span");
        operatorCell.className = `multiplication-board__operator${operator ? "" : " multiplication-board__operator--blank"}`;
        operatorCell.textContent = operator || "·";
        row.append(operatorCell);
        const digits = document.createElement("div");
        digits.className = "multiplication-board__digits";
        digits.style.setProperty("--multiplication-columns", `repeat(${width}, var(--multiplication-cell))`);
        row.append(digits);
        let noteCell = null;
        if (note) {
            noteCell = document.createElement("span");
            noteCell.className = "multiplication-board__note";
            row.append(noteCell);
        }
        return { row, digits, note: noteCell };
    };

    const fillRow = (built, width, filler, classes = "") => {
        const cells = [];
        for (let index = 0; index < width; index += 1) {
            const cell = makeCell(filler(index), classes);
            cells.push(cell);
            built.digits.append(cell);
        }
        return cells;
    };

    const termFiller = (digits, width) => (index) => {
        const position = index - (width - digits.length);
        return position >= 0 ? digits[position] : null;
    };

    const spanFiller = (digits, start) => (index) => {
        const position = index - start;
        return position >= 0 && position < digits.length ? digits[position] : null;
    };

    /* The rectangle, with a box for every pair of parts. Built once and then
       either revealed box by box or lit box by box, depending on the view. */
    const buildGridTable = (calc, totals = true) => {
        const table = document.createElement("div");
        table.className = `grid-table${totals ? " grid-table--totals" : ""}`;
        table.style.setProperty("--grid-columns", `repeat(${calc.aParts.length}, var(--grid-cell))`);

        const add = (text, classes) => {
            const cell = document.createElement("span");
            cell.className = classes;
            cell.textContent = text;
            table.append(cell);
            return cell;
        };

        const corner = add("×", "grid-table__cell grid-table__corner");
        const columnHeads = calc.aParts.map((part) => add(readable(part.value), "grid-table__cell grid-table__head"));
        if (totals) add("Row total", "grid-table__cell grid-table__head grid-table__head--total");

        const cells = [];
        const rowHeads = [];
        const rowTotals = [];
        calc.bParts.forEach((part, row) => {
            rowHeads.push(add(readable(part.value), "grid-table__cell grid-table__head grid-table__head--side"));
            cells.push(calc.aParts.map((other) => add(readable(part.value * other.value), "grid-table__cell grid-table__box")));
            if (totals) rowTotals.push(add(readable(fromDigits(calc.rows[calc.bParts.length - 1 - row].digits)), "grid-table__cell grid-table__total"));
        });

        let grandTotal = null;
        if (totals) {
            for (let index = 0; index <= calc.aParts.length; index += 1) add("", "grid-table__cell grid-table__blank");
            grandTotal = add(readable(calc.product), "grid-table__cell grid-table__grand");
        }

        return { table, corner, columnHeads, rowHeads, cells, rowTotals, grandTotal };
    };

    const splitLine = (value, parts) => {
        const line = document.createElement("p");
        line.className = "grid-figure__split";
        const lead = document.createElement("span");
        lead.textContent = `${readable(value)} =`;
        line.append(lead);
        const pieces = parts.map((part, index) => {
            if (index) {
                const plus = document.createElement("i");
                plus.textContent = "+";
                line.append(plus);
            }
            const piece = document.createElement("b");
            piece.textContent = readable(part.value);
            line.append(piece);
            return piece;
        });
        return { line, pieces };
    };

    /* --------------------------------------------------------- the grid view */

    const gridRenderer = (calc, paper) => {
        const stages = calc.lines.length + 4;
        let parts = null;

        const build = () => {
            paper.replaceChildren();
            paper.className = "multiplication-board__paper multiplication-board__paper--plain";

            const figure = document.createElement("div");
            figure.className = "grid-figure";
            const splits = document.createElement("div");
            splits.className = "grid-figure__splits";
            const first = splitLine(Number(calc.a), calc.aParts);
            const second = splitLine(Number(calc.b), calc.bParts);
            splits.append(first.line, second.line);
            figure.append(splits);

            const grid = buildGridTable(calc);
            figure.append(grid.table);
            paper.append(figure);
            parts = { first, second, grid };
        };

        const measure = () => {};

        const paint = (t) => {
            const { first, second, grid } = parts;
            const show = (element, amount, lift = 12) => {
                element.style.opacity = amount;
                element.style.transform = `translateY(${(1 - amount) * lift}px)`;
            };

            first.line.style.opacity = ease(t / .4);
            first.pieces.forEach((piece, index) => show(piece, ease((t - .12 - index * .12) / .4)));
            second.line.style.opacity = ease((t - 1) / .4);
            second.pieces.forEach((piece, index) => show(piece, ease((t - 1.12 - index * .12) / .4)));

            grid.corner.style.opacity = ease((t - 1.1) / .5);
            grid.columnHeads.forEach((head, index) => show(head, ease((t - .3 - index * .12) / .45)));
            grid.rowHeads.forEach((head, index) => show(head, ease((t - 1.3 - index * .12) / .45)));

            calc.lines.forEach((line, index) => {
                const cell = grid.cells[line.gridRow][line.gridColumn];
                const reveal = ease((t - (2 + index) - .3) / .4);
                cell.style.opacity = reveal;
                cell.style.transform = `scale(${lerp(.72, 1, reveal)})`;
            });

            grid.rowTotals.forEach((total, index) => show(total, ease((t - (2 + calc.lines.length) - .15 - index * .25) / .4)));
            show(grid.grandTotal, ease((t - (3 + calc.lines.length) - .15) / .4));
            paper.classList.toggle("is-complete", t >= stages - .4);
        };

        const describe = (stage) => {
            if (stage === 0) {
                return {
                    title: `Split ${readable(calc.a)} into its parts`,
                    copy: `${readable(calc.a)} is ${calc.aParts.map((part) => readable(part.value)).join(" + ")}. Each digit is written as the amount it stands for, so nothing about the number has changed.`
                };
            }
            if (stage === 1) {
                return {
                    title: `Split ${readable(calc.b)} the same way`,
                    copy: `${readable(calc.b)} is ${calc.bParts.map((part) => readable(part.value)).join(" + ")}, so the side splits the way the top did, and the rectangle fills with ${readable(calc.lines.length)} boxes.`
                };
            }
            const index = stage - 2;
            if (index < calc.lines.length) {
                const line = calc.lines[index];
                const zeros = line.bPart.exponent + line.aPart.exponent;
                const small = line.bPart.digit * line.aPart.digit;
                return {
                    title: `${readable(line.bPart.value)} × ${readable(line.aPart.value)}`,
                    copy: zeros
                        ? `${line.bPart.digit} × ${line.aPart.digit} = ${small}, and ${plural(zeros, "zero")} ${zeros === 1 ? "follows" : "follow"} it, so ${readable(line.bPart.value)} × ${readable(line.aPart.value)} = ${readable(line.value)}.`
                        : `${line.bPart.digit} × ${line.aPart.digit} = ${readable(line.value)}, which is a fact from the tables.`
                };
            }
            if (index === calc.lines.length) {
                const sums = calc.bParts.map((part, row) => {
                    const total = fromDigits(calc.rows[calc.bParts.length - 1 - row].digits);
                    return `${calc.aParts.map((other) => readable(part.value * other.value)).join(" + ")} = ${readable(total)}`;
                });
                return { title: "Total each row", copy: `${sums.join(", and ")}.` };
            }
            return {
                title: `${readable(calc.a)} × ${readable(calc.b)} = ${readable(calc.product)}`,
                copy: `${calc.rows.map((row) => readable(fromDigits(row.digits))).reverse().join(" + ")} = ${readable(calc.product)}. Every part of one number has met every part of the other exactly once.`
            };
        };

        return { stages, build, measure, paint, describe };
    };

    /* ------------------------------------ the expanded view, beside the grid */

    const buildExpandedBoard = (calc, host, options = {}) => {
        const width = calc.width;
        const board = document.createElement("div");
        board.className = "expanded-board";
        host.append(board);

        const first = buildRow(width, "term", "", true);
        const multiplicandCells = fillRow(first, width, termFiller(calc.aDigits, width));
        board.append(first.row);

        const second = buildRow(width, "term multiplication-board__row--ruled", "×", true);
        const multiplierCells = fillRow(second, width, termFiller(calc.bDigits, width));
        board.append(second.row);

        const lineRows = calc.lines.map((line) => {
            const built = buildRow(width, `line multiplication-board__row--group${line.group % 2}`, "", true);
            const cells = fillRow(built, width, spanFiller(line.digits, line.start), "multiplication-board__cell--written");
            built.note.textContent = `(${readable(line.bPart.value)} × ${readable(line.aPart.value)})`;
            board.append(built.row);
            return { line, cells, note: built.note, element: built.row };
        });

        return { board, width, multiplicandCells, multiplierCells, lineRows };
    };

    const pairRenderer = (calc, paper) => {
        const stages = calc.lines.length + 2;
        let parts = null;

        const build = () => {
            paper.replaceChildren();
            paper.className = "multiplication-board__paper multiplication-board__paper--pair";

            const figure = document.createElement("div");
            figure.className = "pair-figure";
            const left = document.createElement("div");
            left.className = "pair-figure__grid";
            const grid = buildGridTable(calc, false);
            left.append(grid.table);
            const right = document.createElement("div");
            right.className = "pair-figure__columns";
            figure.append(left, right);
            paper.append(figure);

            const expanded = buildExpandedBoard(calc, right);
            const lastLine = expanded.lineRows[expanded.lineRows.length - 1];
            lastLine.element.classList.add("multiplication-board__row--ruled");
            lastLine.element.querySelector(".multiplication-board__operator").textContent = "+";
            lastLine.element.querySelector(".multiplication-board__operator").classList.remove("multiplication-board__operator--blank");

            const answer = buildRow(calc.width, "answer", "", true);
            const answerCells = fillRow(answer, calc.width, (index) => (index >= calc.answerStart ? calc.answer[index] : null), "multiplication-board__cell--written");
            expanded.board.append(answer.row);

            parts = { grid, expanded, answerCells };
        };

        const measure = () => {};

        const paint = (t) => {
            const { grid, expanded, answerCells } = parts;
            const arrival = ease(t / .6);
            grid.table.style.opacity = lerp(.15, 1, arrival);
            expanded.board.style.opacity = lerp(.15, 1, arrival);

            expanded.lineRows.forEach(({ cells, note }, index) => {
                const reveal = ease((t - (1 + index) - .06) / .34);
                cells.forEach((cell) => {
                    if (!cell.textContent) return;
                    cell.style.opacity = reveal;
                    cell.style.transform = `translateY(${(1 - reveal) * -12}px)`;
                });
                note.style.opacity = ease((t - (1 + index) - .22) / .34);
            });

            answerCells.forEach((cell, index) => {
                if (!cell.textContent) return;
                const reveal = ease((t - stages + 1 - .05 - (calc.width - 1 - index) * .08) / .35);
                cell.style.opacity = reveal;
                cell.style.transform = `translateY(${(1 - reveal) * -12}px)`;
            });
            paper.classList.toggle("is-complete", t >= stages - .4);
        };

        const describe = (stage) => {
            const index = stage - 1;
            parts.grid.cells.forEach((row) => row.forEach((cell) => cell.classList.remove("is-lit")));
            parts.expanded.lineRows.forEach(({ element }) => element.classList.remove("is-lit"));

            if (stage === 0) {
                return {
                    title: "The same products, written downwards",
                    copy: `The boxes hold ${plural(calc.lines.length, "product")}. Written in columns instead, each one becomes a line of its own, placed so that its digits sit under the places they are worth.`
                };
            }
            if (index < calc.lines.length) {
                const line = calc.lines[index];
                parts.grid.cells[line.gridRow][line.gridColumn].classList.add("is-lit");
                parts.expanded.lineRows[index].element.classList.add("is-lit");
                const reach = placeNames.get(calc.width - 1 - line.start);
                const zeros = line.aPart.exponent + line.bPart.exponent;
                const small = line.bPart.digit * line.aPart.digit;
                return {
                    title: `${readable(line.bPart.value)} × ${readable(line.aPart.value)} = ${readable(line.value)}`,
                    copy: zeros
                        ? `The lit box and the lit line are the same product. ${line.bPart.digit} × ${line.aPart.digit} = ${small}, and the ${zeros === 1 ? "zero" : plural(zeros, "zero")} in ${readable(line.bPart.value)} × ${readable(line.aPart.value)} ${zeros === 1 ? "lifts" : "lift"} it as far as the ${reach}.`
                        : `The lit box and the lit line are the same product. ${line.bPart.digit} × ${line.aPart.digit} = ${small}, which reaches only as far as the ${reach}.`
                };
            }
            return {
                title: `${capital(plural(calc.lines.length, "line"))}, added: ${readable(calc.product)}`,
                copy: `Nothing here is different from the grid. The boxes have simply been placed where their place value puts them, which turns the last step into one ordinary column addition.`
            };
        };

        return { stages, build, measure, paint, describe };
    };

    /* --------------------------------------------- gathering the lines up */

    const gatherRenderer = (calc, paper) => {
        const stages = calc.rows.length + 2;
        let parts = null;

        const build = () => {
            paper.replaceChildren();
            paper.className = "multiplication-board__paper";

            const expanded = buildExpandedBoard(calc, paper);
            const groups = calc.rows.map((row, index) => {
                const members = expanded.lineRows.filter(({ line }) => line.group === index);
                members[members.length - 1].element.classList.add("multiplication-board__row--ruled");
                const built = buildRow(calc.width, "gathered", index ? "+" : "", true);
                const cells = fillRow(built, calc.width, spanFiller(row.digits, row.start), "multiplication-board__cell--written");
                built.note.textContent = `= ${readable(calc.a)} × ${readable(calc.bParts[calc.bParts.length - 1 - index].value)}`;
                members[members.length - 1].element.after(built.row);
                return { row, members, cells, note: built.note, element: built.row };
            });

            const last = groups[groups.length - 1];
            last.element.classList.add("multiplication-board__row--ruled");

            const answer = buildRow(calc.width, "answer", "", true);
            const answerCells = fillRow(answer, calc.width, (index) => (index >= calc.answerStart ? calc.answer[index] : null), "multiplication-board__cell--written");
            expanded.board.append(answer.row);

            parts = { expanded, groups, answerCells };
        };

        const measure = () => {};

        const paint = (t) => {
            const { expanded, groups, answerCells } = parts;
            const arrival = ease(t / .5);
            expanded.board.style.opacity = lerp(.15, 1, arrival);

            expanded.lineRows.forEach(({ cells, note }) => {
                cells.forEach((cell) => { if (cell.textContent) cell.style.opacity = arrival; });
                note.style.opacity = arrival;
            });

            groups.forEach(({ cells, note }, index) => {
                const reveal = ease((t - (1 + index) - .3) / .45);
                cells.forEach((cell) => {
                    if (!cell.textContent) return;
                    cell.style.opacity = reveal;
                    cell.style.transform = `translateY(${(1 - reveal) * -14}px) scale(${lerp(.8, 1, reveal)})`;
                });
                note.style.opacity = ease((t - (1 + index) - .55) / .45);
            });

            answerCells.forEach((cell, index) => {
                if (!cell.textContent) return;
                const reveal = ease((t - (1 + groups.length) - .2 - (calc.width - 1 - index) * .1) / .4);
                cell.style.opacity = reveal;
                cell.style.transform = `translateY(${(1 - reveal) * -14}px)`;
            });
            paper.classList.toggle("is-complete", t >= stages - .4);
        };

        const describe = (stage) => {
            const { expanded, groups } = parts;
            expanded.lineRows.forEach(({ element }) => element.classList.remove("is-lit"));
            groups.forEach(({ element }) => element.classList.remove("is-lit"));

            if (stage === 0) {
                return {
                    title: `${capital(plural(calc.lines.length, "line"))}, ${spell(calc.aParts.length)} of them for each digit`,
                    copy: `Each digit of ${readable(calc.b)} produced ${plural(calc.aParts.length, "line")}. The lines belonging to one digit can be added on their own before anything else happens.`
                };
            }
            const index = stage - 1;
            if (index < groups.length) {
                const group = groups[index];
                group.members.forEach(({ element }) => element.classList.add("is-lit"));
                group.element.classList.add("is-lit");
                const part = calc.bParts[calc.bParts.length - 1 - index];
                return {
                    title: `The lines from the ${readable(part.value)}`,
                    copy: `${group.members.map(({ line }) => readable(line.value)).join(" + ")} = ${readable(fromDigits(group.row.digits))}, which is ${readable(calc.a)} × ${readable(part.value)}. ${capital(plural(group.members.length, "line"))} have become one.`
                };
            }
            groups.forEach(({ element }) => element.classList.add("is-lit"));
            return {
                title: `${capital(plural(groups.length, "row"))}, added`,
                copy: `${calc.rows.map((row) => readable(fromDigits(row.digits))).join(" + ")} = ${readable(calc.product)}. The ${plural(calc.lines.length, "line")} and the ${plural(groups.length, "row")} give the same answer, because they hold the same products.`
            };
        };

        return { stages, build, measure, paint, describe };
    };

    /* ------------------------------------------------------ the short form */

    const compactRenderer = (calc, paper) => {
        const stages = calc.steps.length + (calc.sumRow ? 1 : 2);
        let board = null;

        const build = () => {
            const width = calc.width;
            const reveals = [];
            paper.replaceChildren();
            paper.className = "multiplication-board__paper";

            const labels = buildRow(width, "labels");
            const labelCells = fillRow(labels, width, (index) => placeLabels.get(width - 1 - index) || "", "multiplication-board__cell--label");
            paper.append(labels.row);

            const carry = buildRow(width, "carry");
            const carryCells = fillRow(carry, width, () => "");
            paper.append(carry.row);

            const first = buildRow(width, "term");
            const multiplicandCells = fillRow(first, width, termFiller(calc.aDigits, width));
            paper.append(first.row);

            const second = buildRow(width, "term multiplication-board__row--ruled", "×");
            const multiplierCells = fillRow(second, width, termFiller(calc.bDigits, width));
            paper.append(second.row);

            const partials = calc.rows.map((row, order) => {
                const ruled = calc.sumRow && order === calc.rows.length - 1 ? " multiplication-board__row--ruled" : "";
                const built = buildRow(width, `partial${ruled}`, order ? "+" : "");
                const cells = fillRow(built, width, spanFiller(row.digits, row.start));
                cells.forEach((cell, index) => {
                    if (index >= row.start) cell.classList.add("multiplication-board__cell--written");
                });
                for (let zero = 0; zero < row.order; zero += 1) {
                    cells[width - 1 - zero].classList.add("multiplication-board__cell--holder");
                }
                paper.append(built.row);
                return { row, cells, element: built.row };
            });

            let sumCarryCells = [];
            let answerCells = [];
            let sumCarryRow = null;
            let answerRow = null;

            if (calc.sumRow) {
                const sumCarry = buildRow(width, "sumcarry");
                sumCarryCells = fillRow(sumCarry, width, () => "");
                sumCarryRow = sumCarry.row;
                paper.append(sumCarry.row);

                const result = buildRow(width, "answer");
                answerCells = fillRow(result, width, (index) => (index >= calc.answerStart ? calc.answer[index] : null), "multiplication-board__cell--written");
                answerRow = result.row;
                paper.append(result.row);
            }

            /* Every cell that the scroll brings in, gathered into one list with
               the step it belongs to, so a frame is a single pass. */
            const lastStepOfRow = new Map();
            calc.steps.forEach((step, order) => {
                if (step.row !== undefined) lastStepOfRow.set(step.row, order);
            });

            const badges = [];
            calc.steps.forEach((step, order) => {
                if (step.kind === "digit") {
                    const column = width - 1 - step.row - step.place;
                    reveals.push({ cell: partials[step.row].cells[column], at: order, offset: .3 });
                    if (step.last && step.carryOut) {
                        reveals.push({ cell: partials[step.row].cells[column - 1], at: order, offset: .55 });
                    }
                    if (step.carryOut && !step.last) {
                        const badge = document.createElement("span");
                        badge.className = "multiplication-board__carry";
                        badge.textContent = step.carryOut;
                        carryCells[width - 2 - step.place].append(badge);
                        badges.push({
                            badge, at: order, row: step.row,
                            from: width - 1 - step.place, to: width - 2 - step.place,
                            clearAt: lastStepOfRow.get(step.row)
                        });
                    }
                    return;
                }
                if (step.kind === "zeros") {
                    for (let zero = 0; zero < step.row; zero += 1) {
                        reveals.push({ cell: partials[step.row].cells[width - 1 - zero], at: order, offset: .25 + zero * .14 });
                    }
                    return;
                }
                if (step.kind === "empty") {
                    const row = partials[step.row];
                    for (let index = width - 1 - step.row; index >= row.row.start; index -= 1) {
                        reveals.push({ cell: row.cells[index], at: order, offset: .25 + (width - 1 - step.row - index) * .1 });
                    }
                    return;
                }
                for (let index = width - 1; index >= calc.answerStart; index -= 1) {
                    reveals.push({ cell: answerCells[index], at: order, offset: .15 + (width - 1 - index) * .13 });
                }
            });

            const sumBadges = [];
            if (calc.sumRow) {
                const addStep = calc.steps.length - 1;
                calc.answerCarries.forEach((value, column) => {
                    if (!value || column === 0) return;
                    const badge = document.createElement("span");
                    badge.className = "multiplication-board__carry multiplication-board__carry--sum";
                    badge.textContent = value;
                    sumCarryCells[column - 1].append(badge);
                    sumBadges.push({ badge, at: addStep, from: column, to: column - 1, offset: .2 + (width - 1 - column) * .13 });
                });
            }

            const cursor = document.createElement("span");
            cursor.className = "multiplication-board__cursor";
            paper.append(cursor);

            board = {
                width, labelCells, carryCells, multiplicandCells, multiplierCells,
                partials, answerCells, sumCarryRow, answerRow, carryRow: carry.row,
                reveals, badges, sumBadges, cursor, columns: []
            };
        };

        /* Column positions are read from the finished layout rather than
           assumed, so the highlight and the carried digits follow the
           stylesheet. */
        const measure = () => {
            if (!board) return;
            board.columns = board.multiplicandCells.map((cell) => ({ left: cell.offsetLeft, width: cell.offsetWidth }));
            board.carryTop = board.carryRow.offsetTop;
            board.partials.forEach((partial) => {
                partial.top = partial.element.offsetTop;
                partial.bottom = partial.element.offsetTop + partial.element.offsetHeight;
            });
            board.badges.forEach((entry) => { entry.drop = board.partials[entry.row].top - board.carryTop; });
            if (calc.sumRow) {
                board.sumDrop = board.answerRow.offsetTop - board.sumCarryRow.offsetTop;
            }
            if (board.columns.length) board.cursor.style.width = `${board.columns[0].width}px`;
        };

        /* Where the highlight belongs while a given step is the one being read.
           Steps that are not a single multiplication switch it off rather than
           parking it somewhere arbitrary. */
        const cursorFor = (order) => {
            const step = calc.steps[order];
            if (!step || step.kind !== "digit") return { left: 0, top: board.carryTop, height: 0, on: 0 };
            const column = board.columns[board.width - 1 - step.place];
            return {
                left: column.left,
                top: board.carryTop,
                height: board.partials[step.row].bottom - board.carryTop,
                on: 1
            };
        };

        const paint = (position) => {
            const width = board.width;
            const steps = calc.steps.length;
            const t = clamp(position, 0, stages);
            const u = t - 1;

            /* Stage one: the paper settles first, then the two numbers arrive
               column by column. Each column takes half the stage to fade, and
               the last one only finishes as the stage does, so nothing snaps
               into view. */
            const arrival = ease(t / .58);
            paper.style.opacity = lerp(.12, 1, arrival);
            paper.style.transform = `scale(${lerp(.968, 1, arrival)})`;

            for (let index = 0; index < width; index += 1) {
                const delay = (index / width) * .5;
                const local = ease((t - .06 - delay) / .5);
                const lift = (1 - local) * -22;
                [board.multiplicandCells[index], board.multiplierCells[index]].forEach((cell) => {
                    cell.style.opacity = local;
                    cell.style.transform = `translateY(${lift}px) scale(${lerp(.86, 1, local)})`;
                });
                board.labelCells[index].style.opacity = ease((t - delay) / .68);
            }

            board.reveals.forEach(({ cell, at, offset }) => {
                const reveal = ease((u - at - offset) / .4);
                cell.style.opacity = reveal;
                cell.style.transform = `translateY(${(1 - reveal) * -15}px) scale(${lerp(.74, 1, reveal)})`;
            });

            /* A carried digit rises out of the column that made it and moves one
               place left, then clears when its row is finished with — which is
               what crossing it out on paper is for. */
            board.badges.forEach(({ badge, at, clearAt, from, to, drop }) => {
                const reveal = ease((u - at - .46) / .4);
                const spent = clearAt === undefined || clearAt >= steps - 1 ? 0 : ease((u - clearAt - 1.05) / .5);
                const travel = 1 - reveal;
                badge.style.opacity = reveal * (1 - spent);
                badge.style.transform = `translate(${(board.columns[from].left - board.columns[to].left) * travel}px, ${drop * travel}px) scale(${lerp(.7, 1, reveal)})`;
            });

            board.sumBadges.forEach(({ badge, at, from, to, offset }) => {
                const reveal = ease((u - at - offset) / .35);
                const travel = 1 - reveal;
                badge.style.opacity = reveal;
                badge.style.transform = `translate(${(board.columns[from].left - board.columns[to].left) * travel}px, ${board.sumDrop * travel}px) scale(${lerp(.7, 1, reveal)})`;
            });

            const held = clamp(Math.floor(u), 0, steps - 1);
            const slide = ease((clamp(u - held, 0, 1) - .58) / .42);
            const from = cursorFor(held);
            const to = cursorFor(Math.min(steps - 1, held + 1));
            board.cursor.style.transform = `translate(${lerp(from.left, to.left, slide)}px, ${lerp(from.top, to.top, slide)}px)`;
            board.cursor.style.height = `${lerp(from.height, to.height, slide)}px`;
            board.cursor.style.opacity = ease((t - .78) / .32) * lerp(from.on, to.on, slide) * (1 - ease((u - steps + .15) / .5));
            paper.classList.toggle("is-complete", u >= steps + .35);
        };

        const describe = (stage) => {
            const width = calc.width;
            const active = calc.steps[stage - 1];

            board.multiplierCells.forEach((cell, index) => {
                cell.classList.toggle("is-active", Boolean(active) && active.row !== undefined && index === width - 1 - active.row);
            });

            if (stage === 0) {
                return {
                    title: "Set the two numbers out",
                    copy: `Equal place values go in the same column, as in any written method. Every digit of ${readable(calc.a)} will be multiplied by every digit of ${readable(calc.b)}, one digit of ${readable(calc.b)} at a time, starting with its ones.`
                };
            }

            if (active && active.kind === "zeros") {
                const scale = 10 ** active.row;
                const held = [];
                for (let exponent = 0; exponent < active.row; exponent += 1) held.push(placeNames.get(exponent));
                const single = active.row === 1;
                const zeros = single ? "a zero" : `${spell(active.row)} zeros`;
                const places = single ? "one place" : `${spell(active.row)} places`;
                return {
                    title: `Hold the ${listNames(held)} with ${single ? "a zero" : "zeros"}`,
                    copy: active.multiplier
                        ? `The ${active.multiplier} in ${readable(calc.b)} is not ${active.multiplier} but ${readable(active.multiplier * scale)}, so this row is ${readable(calc.a)} multiplied by ${active.multiplier} and then by ${readable(scale)}. Multiplying by ${readable(scale)} moves every digit ${places} left, and ${zeros} ${single ? "fills" : "fill"} the ${listNames(held)} it leaves behind.`
                        : `This row still belongs ${places} further left than the last, so ${zeros} ${single ? "fills" : "fill"} the ${listNames(held)} before anything else is written.`
                };
            }

            if (active && active.kind === "empty") {
                return {
                    title: "Multiplying by nothing",
                    copy: `Every digit of ${readable(calc.a)} multiplied by 0 is 0, so this row is nothing but zeros. It is still written, because the row below it starts one place further left than this one.`
                };
            }

            if (active && active.kind === "digit") {
                const column = placeNames.get(active.row + active.place);
                const source = placeNames.get(active.place);
                const running = active.carryIn
                    ? `${active.multiplier} × ${active.digit} = ${active.product}, and the carried ${active.carryIn} makes ${active.total}`
                    : `${active.multiplier} × ${active.digit} = ${active.product}`;
                const title = `Multiply the ${source} by ${active.multiplier}`;
                if (active.last && active.carryOut) {
                    return { title, copy: `${running}. There is nothing further to the left to multiply, so the whole of ${active.total} is written down.` };
                }
                if (active.carryOut) {
                    return { title, copy: `${running}. Only the ${active.writes} fits in the ${column} column, so ${active.carryOut} is carried to the column on its left and added there.` };
                }
                return { title, copy: `${running}. Write ${active.writes} in the ${column} column. There is nothing to carry.` };
            }

            if (active && active.kind === "add") {
                return {
                    title: "Add the rows together",
                    copy: `${calc.rows.map((row) => readable(fromDigits(row.digits))).join(" + ")} = ${readable(calc.product)}. The rows are added one column at a time, exactly as any other column addition.`
                };
            }

            return {
                title: `${readable(calc.a)} × ${readable(calc.b)} = ${readable(calc.product)}`,
                copy: `A single-digit multiplier needs one row, so that row is already the answer.`
            };
        };

        return { stages, build, measure, paint, describe };
    };

    const renderers = { grid: gridRenderer, pair: pairRenderer, gather: gatherRenderer, compact: compactRenderer };

    /* A worked example is read once and moved past, so it asks for less of the
       page than a sandbox somebody will scrub back and forth. The views that
       come earlier carry less arithmetic per stage, so they move faster. */
    const paces = {
        grid: { vh: 24, px: 200 },
        pair: { vh: 24, px: 200 },
        gather: { vh: 26, px: 215 },
        compact: { vh: 26, px: 215 },
        sandbox: { vh: 30, px: 250 }
    };

    /* One scene: its own numbers, its own view, its own scroll distance. */
    const createScene = (scene) => {
        const sticky = scene.querySelector(".multiplication-scene__sticky");
        const inputs = {
            a: scene.querySelector('[data-term="a"]'),
            b: scene.querySelector('[data-term="b"]')
        };
        const fixed = !inputs.a || !inputs.b;
        const mode = renderers[scene.dataset.mode] ? scene.dataset.mode : "compact";
        const paper = scene.querySelector("[data-paper]");
        const stepTitle = scene.querySelector("[data-step-title]");
        const stepCopy = scene.querySelector("[data-step-copy]");
        const progressBar = scene.querySelector("[data-progress]");
        const pace = paces[fixed ? mode : "sandbox"];

        let calculation = null;
        let renderer = null;
        let totalStages = 0;
        let stage = -1;
        let dots = [];

        const limitValue = (input, places) => {
            const raw = input.value;
            const cleaned = limit(raw, places);
            if (cleaned !== raw) {
                const caret = input.selectionStart ?? cleaned.length;
                const position = Math.max(0, Math.min(cleaned.length, caret - (raw.length - cleaned.length)));
                input.value = cleaned;
                input.setSelectionRange(position, position);
            }
            return cleaned;
        };

        const describeStage = () => {
            const text = renderer.describe(stage);
            stepTitle.textContent = text.title;
            stepCopy.textContent = text.copy;
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
                dot.className = "multiplication-scene__dot";
                return dot;
            });
            progressBar.replaceChildren(...dots);
        };

        const render = (progress) => {
            const t = clamp(progress) * totalStages;
            renderer.paint(t);
            const next = Math.min(totalStages - 1, Math.floor(t));
            if (next === stage) return;
            stage = next;
            describeStage();
            paintDots();
        };

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

        /* The card grows a row when a third digit is typed into the multiplier,
           so its height is read again whenever the board is rebuilt. The height
           is the only thing touched: the card is not moved, so a caret in one of
           the fields stays where the reader left it. */
        const remeasureCard = () => {
            const pinned = sticky.classList.contains("is-pinned");
            if (pinned) sticky.style.height = "auto";
            cardHeight = sticky.offsetHeight;
            if (pinned) sticky.style.height = `${cardHeight}px`;
        };

        const measure = () => {
            dock(0);
            cardHeight = sticky.offsetHeight;
            renderer.measure();
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
            const a = parseNumber(fixed ? limit(scene.dataset.a || "", 4) : limitValue(inputs.a, 4));
            const b = parseNumber(fixed ? limit(scene.dataset.b || "", 3) : limitValue(inputs.b, 3));
            const selection = active && typeof active.selectionStart === "number"
                ? [active.selectionStart, active.selectionEnd]
                : null;
            if (!a || !b) return;

            calculation = buildCalculation(a, b);
            renderer = renderers[mode](calculation, paper);
            if (renderer.stages !== totalStages) {
                totalStages = renderer.stages;
                buildDots();
                scene.style.setProperty("--scene-height", `${(totalStages + 1) * pace.vh}vh`);
                scene.style.setProperty("--scene-min-height", `${(totalStages + 1) * pace.px}px`);
            }

            renderer.build();
            renderer.measure();
            remeasureCard();
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
