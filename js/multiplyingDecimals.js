/* Scroll-led multiplying decimals, taught as one calculation made whole and
   then put back.

   Two views share the page. A unit square cut into hundredths shows why
   0.3 × 0.4 is 0.12 and not 1.2: a tenth of a tenth is a hundredth, and there
   is no way to read the picture that gives any other answer. The column view
   then does what is actually written down. Every digit moves left until both
   numbers are whole, the two whole numbers are multiplied as on the long
   multiplication page, and the digits of the answer move back by as many
   places as were borrowed. The point never moves; the digits move past it,
   which is the rule the powers of ten page sets up and this page spends. */

document.addEventListener("DOMContentLoaded", () => {
    const scenes = document.querySelectorAll("[data-decimal-scene]");
    if (!scenes.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const ease = (value) => {
        const x = clamp(value);
        return x * x * (3 - 2 * x);
    };

    const placeNames = new Map([
        [6, "millions"], [5, "hundred thousands"], [4, "ten thousands"], [3, "thousands"],
        [2, "hundreds"], [1, "tens"], [0, "ones"], [-1, "tenths"], [-2, "hundredths"],
        [-3, "thousandths"], [-4, "ten-thousandths"]
    ]);
    const unitLabels = new Map([
        [6, "1,000,000"], [5, "100,000"], [4, "10,000"], [3, "1,000"], [2, "100"], [1, "10"],
        [0, "1"], [-1, "0.1"], [-2, "0.01"], [-3, "0.001"], [-4, "0.0001"]
    ]);
    const scaleWords = new Map([[1, "ten"], [2, "a hundred"], [3, "a thousand"], [4, "ten thousand"]]);

    const counts = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
        "ten", "eleven", "twelve"];
    const spell = (value) => counts[value] || String(value);
    const capital = (text) => text.charAt(0).toUpperCase() + text.slice(1);
    const plural = (value, word) => `${spell(value)} ${word}${value === 1 ? "" : "s"}`;
    const readable = (value) => Number(value).toLocaleString("en-GB");

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    /* A number is held as the digits somebody would write and the number of
       places they sit to the right of the point. Nothing is ever recovered
       from a floating-point value, so 0.1 + 0.2 can never turn up in a
       caption looking like 0.30000000000000004. */
    const display = (digits, places) => {
        const padded = digits.padStart(places + 1, "0");
        const whole = readable(Number(padded.slice(0, padded.length - places)));
        return places ? `${whole}.${padded.slice(-places)}` : whole;
    };

    const readNumber = (text) => {
        const clean = String(text).trim();
        if (!/^\d*(\.\d*)?$/.test(clean)) return null;
        const [whole, fraction = ""] = clean.split(".");
        const raw = `${whole}${fraction}`;
        if (!raw.length) return null;
        const digits = raw.replace(/^0+(?=\d)/, "");
        const places = fraction.length;
        return {
            digits, places, integer: Number(digits), display: display(digits, places),
            small: digits.length <= places
        };
    };

    /* One pass of the method, worked out before anything is drawn: the whole
       numbers underneath, the product they make, how far the answer has to
       travel back, and which columns the board therefore has to own. */
    const buildCalculation = (a, b) => {
        const integer = a.integer * b.integer;
        const answerDigits = String(integer);
        const zero = integer === 0;
        const places = zero ? 0 : a.places + b.places;

        /* A zero on the end of a decimal holds no place, so the answer is
           tidied afterwards. The count stops before the last digit: 1.00 is
           tidied to 1, never to nothing. */
        let trailing = 0;
        while (trailing < places && trailing < answerDigits.length - 1
            && answerDigits[answerDigits.length - 1 - trailing] === "0") trailing += 1;

        const stages = [{ kind: "setup" }];
        if (a.places) stages.push({ kind: "scaleA" });
        if (b.places) stages.push({ kind: "scaleB" });
        if (places) stages.push({ kind: "tally" });
        stages.push({ kind: "product" });

        /* Each ÷10 gives a place back to the row that borrowed it, so the
           first number is restored and then the second. A row and the answer
           move together, which keeps the board readable as a true statement
           at every point on the way down: 37 × 26 = 962, then 3.7 × 26 = 96.2,
           then 3.7 × 2.6 = 9.62. */
        let aBack = 0;
        let bBack = 0;
        while (aBack < a.places) {
            aBack += 1;
            stages.push({ kind: "divide", term: "a", aBack, bBack, step: aBack + bBack });
        }
        while (bBack < b.places) {
            bBack += 1;
            stages.push({ kind: "divide", term: "b", aBack, bBack, step: aBack + bBack });
        }

        stages.push({ kind: "answer" });
        if (trailing) stages.push({ kind: "tidy" });

        const maxExp = Math.max(a.digits.length - 1, b.digits.length - 1, answerDigits.length - 1);
        const minExp = Math.min(-a.places, -b.places, -places);

        return {
            a, b, zero, places, trailing, stages, answerDigits, maxExp, minExp,
            product: display(answerDigits, places),
            tidied: display(answerDigits.slice(0, answerDigits.length - trailing), places - trailing)
        };
    };

    /* THE COLUMNS — a fixed set of place-value columns with the point drawn
       between the ones and the tenths as the boundary it is. Digits are placed
       by the column they are worth, so making a number whole is one movement
       of every digit and nothing else. */
    const scaleRenderer = (calc, paper) => {
        const list = calc.stages;
        const stages = list.length;
        const indexOf = (kind) => list.findIndex((entry) => entry.kind === kind);
        const at = {
            scaleA: indexOf("scaleA"), scaleB: indexOf("scaleB"), tally: indexOf("tally"),
            product: indexOf("product"), answer: indexOf("answer"), tidy: indexOf("tidy")
        };
        const divides = list.reduce((all, entry, index) => {
            if (entry.kind === "divide") all.push(index);
            return all;
        }, []);
        const givesBack = (term) => list.reduce((all, entry, index) => {
            if (entry.kind === "divide" && entry.term === term) all.push(index);
            return all;
        }, []);
        const backA = givesBack("a");
        const backB = givesBack("b");

        const columns = calc.maxExp - calc.minExp + 1;
        const cell = columns > 8 ? 40 : 52;
        const gutter = 14;
        const padLeft = 36;

        /* The gutter belongs to every column right of the point, so a digit
           crossing it travels one column plus one gutter and the movement
           stays continuous while it is halfway across. */
        const xAt = (exponent) => padLeft + (calc.maxExp - exponent) * cell + gutter * clamp(-exponent, 0, 1);
        const width = xAt(calc.minExp) + cell;
        const pointX = padLeft + (calc.maxExp + 1) * cell + gutter / 2;

        let parts = null;

        const buildRow = (className, operator = "") => {
            const row = el("div", `dec-row ${className}`);
            row.style.width = `${width + 128}px`;
            for (let exponent = calc.maxExp; exponent >= calc.minExp; exponent -= 1) {
                const slot = el("div", `dec-row__slot${exponent < 0 ? " dec-row__slot--decimal" : ""}`);
                slot.style.left = `${xAt(exponent)}px`;
                slot.style.width = `${cell}px`;
                row.append(slot);
            }
            const op = el("span", "dec-row__op", operator);
            op.style.width = `${padLeft}px`;
            row.append(op);
            const note = el("span", "dec-row__note");
            note.style.left = `${width + 10}px`;
            row.append(note);
            return { row, note };
        };

        /* One number on the board: its digits, the zeros that hold empty places
           in front of them, and the point it is written with. */
        const buildTrack = (digits, className, operator, holders) => {
            const { row, note } = buildRow(className, operator);
            const cells = digits.split("").map((digit) => {
                const span = el("span", "dec-row__digit", digit);
                span.style.width = `${cell}px`;
                row.append(span);
                return span;
            });
            const zeros = Array.from({ length: Math.max(0, holders) }, (unused, index) => {
                const span = el("span", "dec-row__digit dec-row__digit--holder", "0");
                span.style.width = `${cell}px`;
                span.style.left = `${xAt(-index)}px`;
                row.append(span);
                return span;
            });
            const point = el("span", "dec-row__point", ".");
            point.style.left = `${pointX}px`;
            row.append(point);
            return { row, note, cells, zeros, point, digits };
        };

        /* Where every digit stands when the last one is worth 10^exponent.
           `tail` is how much of the right-hand end has been rubbed out. */
        const place = (track, exponent, alpha, tail = 0) => {
            const length = track.digits.length;
            track.cells.forEach((span, index) => {
                span.style.left = `${xAt(exponent + (length - 1 - index))}px`;
                span.style.opacity = alpha * clamp(1 - (tail - (length - 1 - index)));
            });
            const first = exponent + length - 1;
            track.zeros.forEach((span, index) => {
                span.style.opacity = alpha * clamp(-first - index);
            });
            track.point.style.opacity = alpha * clamp(-(exponent + tail));
        };

        const setText = (node, text) => {
            if (node.textContent !== text) node.textContent = text;
        };

        const build = () => {
            paper.replaceChildren();
            const board = el("div", "dec-board");
            board.style.width = `${width + 128}px`;
            board.style.setProperty("--dec-width", `${width}px`);

            const heads = buildRow("dec-row--head");
            for (let exponent = calc.maxExp; exponent >= calc.minExp; exponent -= 1) {
                const label = el("span", "dec-row__label", unitLabels.get(exponent) || "");
                label.style.left = `${xAt(exponent)}px`;
                label.style.width = `${cell}px`;
                heads.row.append(label);
            }
            board.append(heads.row);

            const trackA = buildTrack(calc.a.digits, "dec-row--term", "",
                calc.a.places - calc.a.digits.length + 1);
            const trackB = buildTrack(calc.b.digits, "dec-row--term dec-row--ruled", "×",
                calc.b.places - calc.b.digits.length + 1);
            const trackP = buildTrack(calc.answerDigits, "dec-row--answer", "",
                calc.places - calc.answerDigits.length + 1);
            board.append(trackA.row, trackB.row, trackP.row);

            if (calc.minExp < 0) {
                const line = el("div", "dec-board__pointline");
                line.style.left = `${pointX}px`;
                board.append(line);
            }

            paper.append(board);

            let balance = null;
            if (calc.places) {
                balance = el("div", "dec-balance");
                const up = el("span", "dec-balance__chip dec-balance__chip--up");
                up.append(el("b", "", `× ${readable(10 ** calc.places)}`),
                    el("i", "", "to make both whole"));
                const down = el("span", "dec-balance__chip dec-balance__chip--down");
                down.append(el("b", "", `÷ ${readable(10 ** calc.places)}`),
                    el("i", "", "to put the answer back"));
                balance.append(up, down);
                paper.append(balance);
                parts = { trackA, trackB, trackP, up, down };
                return;
            }
            parts = { trackA, trackB, trackP, up: null, down: null };
        };

        const measure = () => {};

        const paint = (t) => {
            const { trackA, trackB, trackP, up, down } = parts;
            const arrival = ease(t / .5);

            const walk = (indices) => indices.reduce((total, index) => total + ease((t - index - .2) / .55), 0);
            const liftA = calc.a.places ? ease((t - at.scaleA - .2) / .55) : 0;
            const liftB = calc.b.places ? ease((t - at.scaleB - .2) / .55) : 0;
            const returnedA = walk(backA);
            const returnedB = walk(backB);
            place(trackA, -calc.a.places * (1 - liftA) - returnedA, arrival);
            place(trackB, -calc.b.places * (1 - liftB) - returnedB, arrival);

            /* A row is only marked as scaled while it actually is scaled, so
               the note fades out again as the row comes back down. */
            setText(trackA.note, calc.a.places ? `× ${readable(10 ** calc.a.places)}` : "");
            setText(trackB.note, calc.b.places ? `× ${readable(10 ** calc.b.places)}` : "");
            trackA.note.style.opacity = calc.a.places ? clamp(liftA - returnedA / calc.a.places) : 0;
            trackB.note.style.opacity = calc.b.places ? clamp(liftB - returnedB / calc.b.places) : 0;

            const shown = ease((t - at.product - .15) / .45);
            const dropped = returnedA + returnedB;
            const tail = calc.trailing ? calc.trailing * ease((t - at.tidy - .2) / .5) : 0;
            place(trackP, -dropped, shown, tail);

            const given = Math.round(dropped);
            setText(trackP.note, given
                ? `÷ ${readable(10 ** given)}`
                : `${readable(calc.a.integer)} × ${readable(calc.b.integer)}`);
            trackP.note.classList.toggle("dec-row__note--divide", given > 0);
            trackP.note.style.opacity = shown;

            if (up) {
                up.style.opacity = ease((t - at.tally - .2) / .5);
                down.style.opacity = ease((t - divides[0] - .2) / .5);
            }
        };

        const describe = (stage) => {
            const entry = list[Math.max(0, Math.min(stages - 1, stage))];
            const a = calc.a;
            const b = calc.b;

            /* The opening caption says what is actually in front of the reader,
               because the three things a pair of numbers can be — both whole,
               one whole, both below 1 — each need a different first sentence. */
            if (entry.kind === "setup") {
                const title = `${a.display} × ${b.display}`;
                const pair = `${readable(a.integer)} and ${readable(b.integer)}`;
                if (!a.places && !b.places) {
                    return {
                        title,
                        copy: `Both numbers are whole already, so there is nothing to move and nothing to count.
                            This is an ordinary multiplication.`.replace(/\s+/g, " ")
                    };
                }
                if (!a.places || !b.places) {
                    const whole = a.places ? b : a;
                    const other = a.places ? a : b;
                    return {
                        title,
                        copy: `${whole.display} is whole already, so only ${other.display} has to be moved.
                            Underneath, the multiplication is the ordinary one: ${pair}.`.replace(/\s+/g, " ")
                    };
                }
                if (a.small && b.small) {
                    return {
                        title,
                        copy: `Both numbers are below 1, so the answer will come out smaller than either of them.
                            The digits are an ordinary multiplication all the same: ${pair}. Only their places are
                            in the way.`.replace(/\s+/g, " ")
                    };
                }
                return {
                    title,
                    copy: `Neither number is whole, and the columns are set out for whole numbers. The digits,
                        though, are the digits of an ordinary multiplication: ${pair}. Only their places are in
                        the way.`.replace(/\s+/g, " ")
                };
            }

            if (entry.kind === "scaleA" || entry.kind === "scaleB") {
                const term = entry.kind === "scaleA" ? a : b;
                const factor = 10 ** term.places;
                return {
                    title: `${term.display} × ${readable(factor)} = ${readable(term.integer)}`,
                    copy: `Multiplying by ${readable(factor)} moves every digit
                        ${term.places === 1 ? "one place" : `${spell(term.places)} places`} to the left. The digits
                        keep their order, and the point has not gone anywhere: it is the digits that move past
                        it.`.replace(/\s+/g, " ")
                };
            }

            if (entry.kind === "tally") {
                const both = a.places && b.places;
                return {
                    title: `The calculation is now ${scaleWords.get(calc.places)} times too big`,
                    copy: both
                        ? `One number went up by ${readable(10 ** a.places)} and the other by
                           ${readable(10 ** b.places)}, so whatever they multiply to will be
                           ${readable(10 ** calc.places)} times too big. That is fine as long as you remember it,
                           because it comes off again at the end.`.replace(/\s+/g, " ")
                        : `Only one number had to move, so the product will come out
                           ${readable(10 ** calc.places)} times too big. That is the whole of what is owed, and it
                           is paid back at the end.`.replace(/\s+/g, " ")
                };
            }

            if (entry.kind === "product") {
                if (calc.zero) {
                    return {
                        title: `${readable(a.integer)} × ${readable(b.integer)} = 0`,
                        copy: "One of the numbers is zero, so the product is zero. There are no digits to move back."
                    };
                }
                return {
                    title: `${readable(a.integer)} × ${readable(b.integer)} = ${readable(calc.answerDigits)}`,
                    copy: `Two whole numbers, multiplied in columns like any others. Every digit of the answer is
                        now known; what is left is deciding what each one is worth.`.replace(/\s+/g, " ")
                };
            }

            if (entry.kind === "divide") {
                const before = display(calc.answerDigits, entry.step - 1);
                const after = display(calc.answerDigits, entry.step);
                const term = entry.term === "a" ? a : b;
                const rowNow = display(term.digits, entry.term === "a" ? entry.aBack : entry.bBack);
                const aNow = display(a.digits, entry.aBack);
                const bNow = display(b.digits, entry.bBack);
                return {
                    title: `${before} ÷ 10 = ${after}`,
                    copy: `The ${entry.term === "a" ? "first" : "second"} row takes a place back and reads
                        ${rowNow}, ten times smaller than it was, so the answer comes down by ten as well. What the
                        board says is still true: ${aNow} × ${bNow} = ${after}.`.replace(/\s+/g, " ")
                };
            }

            if (entry.kind === "answer") {
                if (calc.zero) {
                    return {
                        title: `${a.display} × ${b.display} = 0`,
                        copy: "Zero lots of anything is nothing, whatever the other number looks like."
                    };
                }
                return {
                    title: `${a.display} × ${b.display} = ${calc.product}`,
                    copy: `${a.display} has ${plural(a.places, "decimal place")} and ${b.display} has
                        ${spell(b.places)}, so ${plural(calc.places, "place")} came off at the start and
                        ${calc.places === 1 ? "one has gone" : `${spell(calc.places)} have gone`} back on at the
                        end.`.replace(/\s+/g, " ")
                };
            }

            return {
                title: `${calc.product} is ${calc.tidied}`,
                copy: `A zero on the end of a decimal is holding nothing in place, because there is nothing past
                    it. It was needed while you counted the places; now it can go.`.replace(/\s+/g, " ")
            };
        };

        return { stages, build, measure, paint, describe };
    };

    /* THE SQUARE — the same calculation as an area. The whole square is 1, so
       every small square in it is worth 0.01, and the answer can be counted
       rather than believed. Written for tenths against tenths, which is what
       the scene that uses it holds. */
    const areaRenderer = (calc, paper) => {
        const across = calc.a.integer;
        const down = calc.b.integer;
        const squares = across * down;
        const stages = 8;
        let parts = null;

        const build = () => {
            paper.replaceChildren();
            const figure = el("div", "area-figure");
            const frame = el("div", "area-frame");

            const topWhole = el("span", "area-bracket area-bracket--top", "1");
            const topPart = el("span", "area-bracket area-bracket--top area-bracket--part", calc.a.display);
            topPart.style.width = `${across * 10}%`;
            const sideWhole = el("span", "area-bracket area-bracket--side", "1");
            const sidePart = el("span", "area-bracket area-bracket--side area-bracket--part", calc.b.display);
            sidePart.style.height = `${down * 10}%`;

            const square = el("div", "area-square");
            const columnRules = [];
            const rowRules = [];
            for (let index = 1; index < 10; index += 1) {
                const column = el("i", "area-rule area-rule--column");
                column.style.left = `${index * 10}%`;
                const row = el("i", "area-rule area-rule--row");
                row.style.top = `${index * 10}%`;
                square.append(column, row);
                columnRules.push(column);
                rowRules.push(row);
            }

            const unit = el("span", "area-unit", "0.01");
            square.append(unit);

            const bandAcross = el("div", "area-band area-band--across");
            bandAcross.style.width = `${across * 10}%`;
            const bandDown = el("div", "area-band area-band--down");
            bandDown.style.height = `${down * 10}%`;
            square.append(bandAcross, bandDown);

            /* The overlap is drawn as separate squares rather than one
               rectangle, because the point of the stage is that they can be
               counted one at a time. */
            const cells = [];
            for (let row = 0; row < down; row += 1) {
                for (let column = 0; column < across; column += 1) {
                    const cellNode = el("div", "area-cell");
                    cellNode.style.left = `${column * 10}%`;
                    cellNode.style.top = `${row * 10}%`;
                    square.append(cellNode);
                    cells.push(cellNode);
                }
            }

            frame.append(topWhole, topPart, sideWhole, sidePart, square);
            const tally = el("p", "area-tally");
            figure.append(frame, tally);
            paper.append(figure);
            parts = { square, columnRules, rowRules, unit, bandAcross, bandDown, cells, tally, topWhole, topPart, sideWhole, sidePart };
        };

        const measure = () => {};

        const paint = (t) => {
            const p = parts;
            const arrival = ease(t / .5);
            p.square.style.opacity = arrival;

            p.columnRules.forEach((rule, index) => { rule.style.opacity = ease((t - 1 - index * .05) / .4); });
            p.rowRules.forEach((rule, index) => { rule.style.opacity = ease((t - 2 - index * .05) / .4); });
            p.unit.style.opacity = ease((t - 3 - .15) / .4) * (1 - ease((t - 4) / .4));
            p.bandAcross.style.opacity = ease((t - 4 - .15) / .5);
            p.bandDown.style.opacity = ease((t - 5 - .15) / .5);

            const wholeGone = 1 - ease((t - 4) / .4);
            p.topWhole.style.opacity = arrival * wholeGone;
            p.sideWhole.style.opacity = arrival * (1 - ease((t - 5) / .4));
            p.topPart.style.opacity = ease((t - 4 - .1) / .4);
            p.sidePart.style.opacity = ease((t - 5 - .1) / .4);

            let counted = 0;
            p.cells.forEach((cellNode, index) => {
                const reveal = ease((t - 6 - index * (.6 / squares)) / .3);
                cellNode.style.opacity = reveal;
                if (reveal > .5) counted += 1;
            });

            const tallyText = t < 6
                ? ""
                : (t < 7
                    ? `${counted} ${counted === 1 ? "square" : "squares"}`
                    : `${squares} × 0.01 = ${calc.product}`);
            if (p.tally.textContent !== tallyText) p.tally.textContent = tallyText;
            p.tally.style.opacity = ease((t - 6) / .3);
        };

        const describe = (stage) => {
            const copy = [
                {
                    title: "One whole square",
                    copy: `The square is 1 along the top and 1 down the side, so its area is 1 × 1 = 1. Everything
                        that follows is a part of it.`
                },
                {
                    title: "Ten strips across",
                    copy: `Cut the width into ten equal strips and each strip is 0.1 wide. Ten of them are the
                        whole width back again.`
                },
                {
                    title: "A hundred small squares",
                    copy: `Cutting the height into ten as well leaves a hundred equal squares, and they fill the
                        whole square between them.`
                },
                {
                    title: "Each small square is 0.01",
                    copy: `A hundred of them make 1, so each one is worth 0.01. A tenth of a tenth is a
                        hundredth.`
                },
                {
                    title: `${calc.a.display} across`,
                    copy: `${capital(spell(across))} strips out of the ten make ${calc.a.display} of the width.
                        The other ${spell(10 - across)} are no longer wanted.`
                },
                {
                    title: `${calc.b.display} down`,
                    copy: `${capital(spell(down))} rows out of the ten make ${calc.b.display} of the height. The
                        rectangle where the two bands cross is ${calc.a.display} by ${calc.b.display}, which is the
                        multiplication that was asked for.`
                },
                {
                    title: "Count where they cross",
                    copy: `${capital(plural(across, "column"))} and ${plural(down, "row")} meet in
                        ${across} × ${down} = ${squares} small squares. That small product is the only
                        multiplication anywhere in the picture.`
                },
                {
                    title: `${capital(plural(squares, "hundredth"))} is ${calc.product}`,
                    copy: `${capital(spell(squares))} squares at 0.01 each come to ${calc.product}. Not
                        ${display(calc.answerDigits, 1)} — you can count how many there are, and you can see how
                        little each one is.`
                }
            ][Math.max(0, Math.min(stages - 1, stage))];

            return {
                title: copy.title,
                copy: copy.copy.replace(/\s+/g, " ")
            };
        };

        return { stages, build, measure, paint, describe };
    };

    const renderers = { area: areaRenderer, scale: scaleRenderer };

    /* A worked example is read once and moved past, so it asks for less of the
       page than a sandbox somebody will scrub back and forth. */
    const paces = {
        area: { vh: 25, px: 205 },
        scale: { vh: 26, px: 215 },
        sandbox: { vh: 30, px: 250 }
    };

    const limit = (raw) => {
        let cleaned = raw.replace(/[^\d.]/g, "");
        const dot = cleaned.indexOf(".");
        if (dot >= 0) cleaned = `${cleaned.slice(0, dot + 1)}${cleaned.slice(dot + 1).replace(/\./g, "")}`;
        const [whole, fraction] = cleaned.split(".");
        let head = whole.slice(0, 3);
        if (head.length > 1) head = head.replace(/^0+(?=\d)/, "");
        return fraction === undefined ? head : `${head}.${fraction.slice(0, 2)}`;
    };

    /* One scene: its own numbers, its own view, its own scroll distance. */
    const createScene = (scene) => {
        const sticky = scene.querySelector(".dec-scene__sticky");
        const inputs = {
            a: scene.querySelector('[data-term="a"]'),
            b: scene.querySelector('[data-term="b"]')
        };
        const fixed = !inputs.a || !inputs.b;
        const mode = renderers[scene.dataset.mode] ? scene.dataset.mode : "scale";
        const paper = scene.querySelector("[data-paper]");
        const heading = scene.querySelector("[data-heading]");
        const stepTitle = scene.querySelector("[data-step-title]");
        const stepCopy = scene.querySelector("[data-step-copy]");
        const progressBar = scene.querySelector("[data-progress]");
        const pace = paces[fixed ? mode : "sandbox"];

        let calculation = null;
        let renderer = null;
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
            dots = Array.from({ length: totalStages }, () => el("span", "dec-scene__dot"));
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

        /* The card changes height when the board gains a column, so its height
           is read again whenever the board is rebuilt. The height is the only
           thing touched: the card is not moved, so a caret in one of the fields
           stays where the reader left it. */
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
            const a = readNumber(fixed ? scene.dataset.a || "" : limitValue(inputs.a));
            const b = readNumber(fixed ? scene.dataset.b || "" : limitValue(inputs.b));
            const selection = active && typeof active.selectionStart === "number"
                ? [active.selectionStart, active.selectionEnd]
                : null;
            if (!a || !b) return;

            calculation = buildCalculation(a, b);
            renderer = renderers[mode](calculation, paper);
            if (heading) heading.textContent = `${a.display} × ${b.display}`;
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
                if (window.scrollX !== scrollLeft || window.scrollY !== scrollTop) {
                    window.scrollTo({ left: scrollLeft, top: scrollTop, behavior: "auto" });
                }
            } else {
                requestUpdate();
            }
        };

        const reset = () => {
            if (!fixed && sticky.contains(document.activeElement)) {
                remeasureCard();
                stage = -1;
                repaintInPlace();
                return;
            }
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
           example sizes itself to its own calculation, so an empty board would
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
