/* Order of operations, drawn as extent.

   Which part of a calculation is worked first is a convention — an agreement
   about how everybody reads the notation — and every figure here is about the
   extent that agreement fixes: how far a term runs, how far a bracket gathers,
   how far a root's bar or a fraction's bar covers.

   The page works nothing out by hand. One reducer finds the part that binds
   most tightly — the innermost bracket, then a power, then the leftmost × or ÷,
   then the leftmost + or − — and returns it with its value. The worked scene
   and the sandbox both run that reducer, so the lines they write are produced
   by the rule the page teaches rather than typed out beside it.

   The written figure is set on a character grid. Everything in it is monospace,
   so one character is exactly 1ch wide whatever font the machine has, and the
   gold frame and the value travelling into the next line are placed from
   character counts. Nothing measures anything, so nothing shifts when a webfont
   arrives late.

   Two scenes share the scroll engine, named in data-scene:

   "terms"  counts 3 + 4 × 5 and (3 + 4) × 5 out as areas of unit squares.
   "reduce" writes 2 + 3 × 4² ÷ 8 out again and again, one part at a time. */

document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const ease = (value) => {
        const x = clamp(value);
        return x * x * (3 - 2 * x);
    };
    const lerp = (from, to, amount) => from + (to - from) * amount;

    const MINUS = "−";
    const TIMES = "×";
    const OVER = "÷";

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    const fade = (node, amount) => { node.style.opacity = String(clamp(amount)); };
    const rise = (node, amount) => {
        const shown = clamp(amount);
        node.style.opacity = String(shown);
        node.style.transform = `translateY(${lerp(9, 0, shown)}px)`;
    };
    const writeCaption = (node, content) => { if (node) node.textContent = content; };

    /* ------------------------------------------------- a calculation's parts

       Atoms: a number, which may carry an index; an operator; a bracket. */

    const num = (value, index) => (index === undefined ? { kind: "num", value } : { kind: "num", value, index });
    const sign = (mark) => ({ kind: "op", sign: mark });
    const OPEN = { kind: "open" };
    const SHUT = { kind: "shut" };

    const atomText = (atom) => {
        if (atom.kind === "op") return atom.sign;
        if (atom.kind === "open") return "(";
        if (atom.kind === "shut") return ")";
        return String(atom.value);
    };
    /* How many characters of the grid an atom takes. An index keeps a column of
       its own so the grid survives a power. */
    const atomWidth = (atom) => atomText(atom).length + (atom.index === undefined ? 0 : 1);

    /* The part of a bracket-free run that binds most tightly, with its value.
       Powers first, then the leftmost × or ÷, then the leftmost + or −. */
    const plainStep = (run) => {
        const power = run.findIndex((a) => a.kind === "num" && a.index !== undefined);
        if (power >= 0) return { from: power, to: power, value: Math.pow(run[power].value, run[power].index) };
        for (const level of [[TIMES, OVER], ["+", MINUS]]) {
            const at = run.findIndex((a) => a.kind === "op" && level.includes(a.sign));
            if (at < 0) continue;
            const left = run[at - 1].value;
            const right = run[at + 1].value;
            const mark = run[at].sign;
            const value = mark === TIMES ? left * right
                : mark === OVER ? left / right
                    : mark === "+" ? left + right : left - right;
            return { from: at - 1, to: at + 1, value };
        }
        return null;
    };

    /* The same, allowing brackets: the innermost pair is worked first, and when
       nothing is left inside it the brackets come off with the part they held. */
    const nextStep = (atoms) => {
        const shutAt = atoms.findIndex((a) => a.kind === "shut");
        if (shutAt < 0) return plainStep(atoms);
        let openAt = -1;
        for (let i = shutAt; i >= 0; i -= 1) if (atoms[i].kind === "open") { openAt = i; break; }
        const inside = atoms.slice(openAt + 1, shutAt);
        const step = plainStep(inside);
        if (!step) return null;
        /* A step that uses the whole of a bracket leaves one number where the
           brackets were, so it takes them with it. */
        if (step.from === 0 && step.to === inside.length - 1)
            return { from: openAt, to: shutAt, value: step.value };
        return { from: openAt + 1 + step.from, to: openAt + 1 + step.to, value: step.value };
    };

    /* Every line of the working, and for each one the part that produces the
       next. The last line is a single number and has no step. */
    const workThrough = (atoms) => {
        const lines = [];
        let run = atoms.slice();
        for (let guard = 0; guard < 12; guard += 1) {
            const step = nextStep(run);
            lines.push({ atoms: run, step });
            if (!step) break;
            run = run.slice(0, step.from).concat([num(step.value)], run.slice(step.to + 1));
        }
        return lines;
    };

    /* ------------------------------------------------- writing a line out

       Character positions, not measurements. A gap goes before every atom
       except the first, the one after an opening bracket, and a closing one. */

    /* The pitch leaves room under each line for the brace that gathers part of
       it and the stem down to the number that part makes. */
    const ROW_H = 60;
    const LINE_H = 25;

    const layOutLine = (atoms) => {
        const spans = [];
        let at = 0;
        atoms.forEach((atom, index) => {
            const gap = index === 0 || atoms[index - 1].kind === "open" || atom.kind === "shut" ? 0 : 1;
            at += gap;
            spans.push({ atom, start: at, width: atomWidth(atom), gap });
            at += atomWidth(atom);
        });
        return { spans, width: at };
    };

    const writeLine = (atoms, top, valueAt) => {
        const laid = layOutLine(atoms);
        const line = el("div", "calc__line");
        line.style.top = `${top}px`;
        let value = null;
        laid.spans.forEach((span, index) => {
            if (span.gap) line.append(" ");
            const node = el("span", index === valueAt ? "calc__atom calc__atom--value" : "calc__atom",
                atomText(span.atom));
            if (span.atom.index !== undefined) {
                /* The caret is what stops 4² flattening to forty-two. */
                const caret = el("span", "caret", "^");
                caret.setAttribute("aria-hidden", "true");
                const raised = el("span", "calc__pow");
                raised.append(el("sup", "", String(span.atom.index)));
                node.append(caret, raised);
            }
            line.append(node);
            if (index === valueAt) value = node;
        });
        return { node: line, laid, value };
    };

    /* Where a run of characters sits, as an offset from the centre of a line
       that is itself centred: a line of width W puts character c at c − W/2. */
    const fromCentre = (laid, from, to) => {
        const start = laid.spans[from].start;
        const end = laid.spans[to].start + laid.spans[to].width;
        return { left: start - laid.width / 2, width: end - start };
    };

    /* One column of working: its lines, a brace under each part being gathered
       with a stem down to the number that part makes, and how far that number
       has to fall to reach its place. Every simplification on the page is drawn
       this way, whether it is scrolled through or standing still. */
    const buildWorking = (host, lines) => {
        const calc = el("div", "calc");
        const written = lines.map((line, k) => {
            /* The value a step produced is the atom that travels down into the
               new line, so the line knows which atom that is. */
            const valueAt = k === 0 ? -1 : lines[k - 1].step.from;
            const drawn = writeLine(line.atoms, k * ROW_H, valueAt);
            calc.append(drawn.node);
            return { ...drawn, step: line.step };
        });
        written.forEach((line, k) => {
            if (!line.step) return;
            line.box = fromCentre(line.laid, line.step.from, line.step.to);
            const target = fromCentre(written[k + 1].laid, line.step.from, line.step.from);
            line.travel = {
                x: (line.box.left + line.box.width / 2) - (target.left + target.width / 2),
                y: -ROW_H
            };
        });

        /* The brace spans the characters being gathered; the stem drops from it
           to the character the number they make will occupy. */
        written.forEach((line, k) => {
            if (!line.step) return;
            const made = fromCentre(written[k + 1].laid, line.step.from, line.step.from);
            line.brace = el("i", "calc__brace");
            line.brace.style.left = `calc(50% + ${line.box.left}ch)`;
            line.brace.style.width = `${line.box.width}ch`;
            line.brace.style.top = `${k * ROW_H + LINE_H + 4}px`;
            line.stem = el("i", "calc__stem");
            line.stem.style.left = `calc(50% + ${made.left + made.width / 2}ch - 1px)`;
            line.stem.style.top = `${k * ROW_H + LINE_H + 11}px`;
            line.stem.style.height = `${ROW_H - LINE_H - 13}px`;
            calc.append(line.brace, line.stem);
        });

        calc.style.height = `${(lines.length - 1) * ROW_H + LINE_H + 10}px`;
        host.append(calc);
        return { calc, written, count: lines.length };
    };

    /* Paint one column at `at`: each line arriving, the brace under the part it
       gathers arriving with it, and the number that part makes falling down the
       stem into the line below. */
    const paintWorking = (column, at) => {
        column.written.forEach((line, k) => {
            fade(line.node, ease(clamp((at - k) / 0.35)));
            if (line.brace) {
                fade(line.brace, ease(clamp((at - k) / 0.35)));
                fade(line.stem, ease(clamp((at - k - 0.45) / 0.35)));
            }
            if (!k || !line.value) return;
            const arriving = ease(clamp((at - k) / 0.45));
            line.value.style.transform =
                `translate(${lerp(column.written[k - 1].travel.x, 0, arriving)}ch, `
                + `${lerp(column.written[k - 1].travel.y, 0, arriving)}px)`;
        });
    };

    /* ------------------------------------ two readings of the same symbols

       A product is a rectangle, and every side is drawn as a line in the colour
       of the number it measures: the 3 purple, the 4 teal, the 5 ochre. Both
       readings stand seven high and five wide along the bottom, so the sides are
       identical and the only difference is how far the 3 reaches across. Added
       on its own it reaches one column; gathered by the brackets it is part of
       the side the 5 multiplies, and reaches all five.

       Nothing inside the drawing is numbered — the colours carry it, and the
       calculation written underneath wears the same three. No rectangle is
       drawn as two blocks stacked, and none fills upwards: either would be the
       distributive property, which this page has not taught. */

    /* The two lengths that become one side, and the colour they become. Halfway
       between the teal 4 and the purple 3, so the side of seven is plainly made
       of them and is plainly neither. The stylesheet holds the same three
       values for the squares. */
    const TEAL = [17, 110, 147];
    const PURPLE = [107, 78, 155];
    const JOINED = [62, 94, 151];
    const blend = (bar, from, amount) => {
        bar.style.background = `rgb(${from.map((channel, i) =>
            Math.round(lerp(channel, JOINED[i], amount))).join(", ")})`;
    };

    const termsPainter = {
        read: () => ({ across: 5, down: 4, other: 3, cell: 18, pitch: 20,
            rule: 7, gap: 15, foot: 14, apart: 13 }),

        stages: () => 3,

        build(board, model) {
            board.replaceChildren();
            const figure = el("div", "area");
            const tall = model.down + model.other;
            const inset = model.rule + model.gap;
            const span = model.across * model.pitch - (model.pitch - model.cell);
            const width = inset + span;
            const height = model.foot + tall * model.pitch - (model.pitch - model.cell);

            /* The calculation is written a piece at a time, each piece arriving
               as the part of the drawing it names does. The pieces that have not
               arrived still hold their place, so nothing shifts. */
            const writeLabel = (parts, answer, when) => {
                const label = el("p", "area__label");
                const pieces = parts.map(([text, tint, at]) => {
                    const piece = el("span", tint || "", text);
                    label.append(piece);
                    return { node: piece, at };
                });
                const total = el("span", "area__total", ` = ${answer}`);
                label.append(total);
                pieces.push({ node: total, at: when });
                return { label, pieces };
            };

            const column = (parts, answer, when, side) => {
                const box = el("div", "area__col");
                box.style.width = `${width}px`;
                box.style.height = `${height}px`;
                box.style.left = side < 0 ? `calc(50% - ${width + 20}px)` : `calc(50% + 20px)`;
                /* A square wears the colour of the length to its left, so the
                   side it belongs to can be read off it. */
                const cellAt = (row, col, tint) => {
                    const cell = el("i", `area__cell ${tint}`);
                    cell.style.width = `${model.cell}px`;
                    cell.style.height = `${model.cell}px`;
                    cell.style.left = `${inset + col * model.pitch}px`;
                    cell.style.bottom = `${model.foot + row * model.pitch}px`;
                    box.append(cell);
                    return cell;
                };
                /* A side, drawn as a line in the colour of the number it
                   measures. The sides are lengths; the squares are the area. */
                const upright = (from, rows, tint, carries) => {
                    const bar = el("i", `area__rule ${tint}`);
                    bar.style.width = `${model.rule}px`;
                    bar.style.left = "0";
                    bar.home = model.foot + from * model.pitch;
                    bar.style.bottom = `${bar.home}px`;
                    bar.style.height = `${rows * model.pitch
                        - (carries ? 0 : model.pitch - model.cell)}px`;
                    box.append(bar);
                    return bar;
                };
                const along = (tint) => {
                    const bar = el("i", `area__rule ${tint}`);
                    bar.style.height = `${model.rule}px`;
                    bar.style.left = `${inset}px`;
                    bar.style.bottom = "0";
                    bar.style.width = `${span}px`;
                    box.append(bar);
                    return bar;
                };
                const written = writeLabel(parts, answer, when);
                written.label.style.width = `${width}px`;
                written.label.style.left = box.style.left;
                figure.append(box, written.label);
                return { box, cellAt, upright, along, ...written };
            };

            /* Built row by row, handed back column by column: filling upwards
               would sweep four rows and then three, which is the rectangle
               coming apart into two. */
            const rectangle = (column, rows, cols, tint) => {
                const cells = [];
                for (let r = 0; r < rows; r += 1)
                    for (let c = 0; c < cols; c += 1) cells.push({ r, c, cell: column.cellAt(r, c, tint) });
                return cells.sort((a, b) => (a.c - b.c) || (a.r - b.r)).map((each) => each.cell);
            };

            const THREE = "area__three";
            const FOUR = "area__four";
            const FIVE = "area__five";

            const plain = column([
                ["3", THREE, 1.05], [" + ", null, 1.05], ["4", FOUR, 0.15],
                [" × ", null, 0.3], ["5", FIVE, 0.3]
            ], model.other + model.down * model.across, 1.4, -1);
            plain.rect = rectangle(plain, model.down, model.across, "area__cell--four");
            plain.four = plain.upright(0, model.down, "area__rule--four");
            plain.five = plain.along("area__rule--five");
            /* Added on its own, the 3 reaches one column and no further. */
            plain.strip = [];
            for (let r = model.down; r < tall; r += 1)
                plain.strip.push(plain.cellAt(r, 0, "area__cell--three"));
            plain.three = plain.upright(model.down, model.other, "area__rule--three");

            /* The brackets close round the 3 + 4 only when the 5 arrives: with
               nothing outside them to hold off, a pair of brackets says
               nothing. Until then the side is written 3 + 4. */
            const gathered = column([
                ["(", null, 3.15], ["3", THREE, 2.2], [" + ", null, 2.1], ["4", FOUR, 2],
                [")", null, 3.15], [" × ", null, 3.05], ["5", FIVE, 3.05]
            ], (model.other + model.down) * model.across, 3.5, 1);
            /* The two lengths arrive apart and are brought together at the end
               of the step: what the brackets do is make one side of them, and
               the join is worth watching happen. */
            /* The lower length is squared at its top and the upper at its
               bottom: those are the ends that meet. The outer ends stay round. */
            gathered.four = gathered.upright(0, model.down,
                "area__rule--four area__rule--square-top", true);
            gathered.three = gathered.upright(model.down, model.other,
                "area__rule--three area__rule--square-bottom");
            gathered.five = gathered.along("area__rule--five");
            /* One side of seven, so one colour throughout: a rectangle in two
               colours would be one rectangle read as two. */
            gathered.rect = rectangle(gathered, tall, model.across, "area__cell--joined");

            figure.style.height = `${height + 40}px`;
            board.append(figure);
            return { figure, plain, gathered };
        },

        caption(model, index) {
            const block = model.down * model.across;
            const tall = model.down + model.other;
            return [
                {
                    title: `A rectangle ${model.down} by ${model.across}`,
                    copy: `4 × 5 is a rectangle: four squares up the side, five along the bottom, ${block} in all.`
                },
                {
                    title: "The 3 is three squares",
                    copy: `Added on its own, the 3 adds three squares and nothing more, so the count is ${block + model.other}.`
                },
                {
                    title: "The brackets make one side",
                    copy: `The 3 and the 4 close up into a single side, ${tall} squares long.`
                },
                {
                    title: `${tall} by ${model.across}`,
                    copy: `Every one of those ${tall} rows runs the full five, and the rectangle holds ${tall * model.across}.`
                }
            ][clamp(index, 0, 3)];
        },

        paint(parts, model, index, within) {
            const at = index + within;
            const lay = (cells, from, span) => cells.forEach((cell, k) =>
                fade(cell, ease(clamp((at - from - (k / cells.length) * span) / 0.4))));
            const show = (node, from) => fade(node, ease(clamp((at - from) / 0.4)));

            lay(parts.plain.rect, 0, 0.5);
            show(parts.plain.four, 0.15);
            show(parts.plain.five, 0.3);
            lay(parts.plain.strip, 1, 0.25);
            show(parts.plain.three, 1.05);

            /* The side is drawn before the rectangle that follows from it, and
               the 5 along the bottom waits for the rectangle it measures. */
            show(parts.gathered.four, 2);
            show(parts.gathered.three, 2.2);
            /* The two lengths close up into one side at the end of the step,
               and both settle to the colour between them: what they make is one
               side of seven, neither a 4 nor a 3. */
            const joined = ease(clamp((at - 2.55) / 0.35));
            parts.gathered.three.style.bottom =
                `${lerp(parts.gathered.three.home + model.apart, parts.gathered.three.home, joined)}px`;
            blend(parts.gathered.four, TEAL, joined);
            blend(parts.gathered.three, PURPLE, joined);
            lay(parts.gathered.rect, 3, 0.6);
            show(parts.gathered.five, 3.05);

            /* Each piece of the written calculation arrives with the part of the
               drawing it names. */
            [parts.plain, parts.gathered].forEach((column) =>
                column.pieces.forEach((piece) => show(piece.node, piece.at)));
        }
    };

    /* ------------------------------- a calculation written out, part by part */

    const reducePainter = {
        read: () => ({
            atoms: [num(2), sign("+"), num(3), sign(TIMES), num(4, 2), sign(OVER), num(8)]
        }),

        stages: (model) => workThrough(model.atoms).length - 1,

        build(board, model) {
            board.replaceChildren();
            return buildWorking(board, workThrough(model.atoms));
        },

        caption(model, index) {
            const lines = workThrough(model.atoms);
            const reasons = [
                "4 × 4 = 16, and by convention nothing else can be worked until it is.",
                "Multiplying and dividing are the same strength, so the leftmost of them goes first.",
                "48 shared between 8 is 6.",
                "One term is added to the other, and the calculation is finished."
            ];
            const titles = ["The power first", "Then the leftmost product", "Then the division",
                "And the two terms added"];
            if (index >= lines.length - 1) {
                /* A caption is plain text, so it says what the working did
                   rather than trying to write a power out in it. */
                return { title: `The whole line is ${lines[lines.length - 1].atoms[0].value}`,
                    copy: `Every part has been worked in turn, and ${lines.length - 1} operations have come down to one number.` };
            }
            return { title: titles[index], copy: reasons[index] };
        },

        paint(parts, model, index, within) { paintWorking(parts, index + within); }
    };

    const PAINTERS = { terms: termsPainter, reduce: reducePainter };

    /* --------------------------------------------------------------- engine */

    const createScene = (scene) => {
        const sticky = scene.querySelector(".calc-scene__sticky");
        /* The card is moved into the body while it is pinned, so a second
           initialisation would find the scene empty. Better to do nothing than
           to tear down a card the reader is already looking at. */
        if (!sticky) return null;

        const painter = PAINTERS[scene.dataset.scene || "reduce"];
        if (!painter) return null;

        const board = scene.querySelector("[data-board]");
        const stepTitle = scene.querySelector("[data-step-title]");
        const stepCopy = scene.querySelector("[data-step-copy]");
        const progressBar = scene.querySelector("[data-progress]");

        /* Every scene here is a worked example, read once and moved past. */
        const paceVh = 54;
        const pacePx = 420;

        /* A stage spends the first part of its scroll moving and the rest of it
           holding still, so one step can be read before the next starts. */
        const action = 0.6;

        let model = null;
        let parts = null;
        let totalStages = 0;
        let stage = -1;
        let cardHeight = sticky.offsetHeight;

        const paint = (position) => {
            const index = Math.min(totalStages, Math.floor(position));
            const through = clamp(position - index);
            const within = clamp(through / action);

            if (index !== stage) {
                stage = index;
                const caption = painter.caption(model, index, totalStages);
                writeCaption(stepTitle, caption.title);
                writeCaption(stepCopy, caption.copy);
                Array.from(progressBar.children).forEach((dot, dotIndex) => {
                    dot.classList.toggle("is-past", dotIndex < index);
                    dot.classList.toggle("is-current", dotIndex === index);
                });
            }
            painter.paint(parts, model, index, within);
        };

        const buildDots = () => {
            progressBar.replaceChildren(...Array.from({ length: totalStages + 1 }, () => {
                const dot = document.createElement("i");
                dot.className = "calc-scene__dot";
                return dot;
            }));
        };

        const render = (progress) => paint(clamp(progress) * (totalStages + 1));

        scene.classList.add("is-ready");

        /* Pinning takes the card out of the page and puts it on the body. */
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

        const geometry = () => {
            const sceneRect = scene.getBoundingClientRect();
            const visualScale = scene.offsetWidth && sceneRect.width ? sceneRect.width / scene.offsetWidth : 1;
            return {
                sceneRect,
                visualScale,
                pinTop: Math.max(16, (window.innerHeight - cardHeight * visualScale) / 2),
                travel: Math.max(1, scene.offsetHeight - cardHeight)
            };
        };

        let ticking = false;

        const update = () => {
            ticking = false;
            if (!model || !parts) return;
            if (reduceMotion.matches) {
                dock(0);
                render(1);
                return;
            }
            const { sceneRect, visualScale, pinTop, travel } = geometry();
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

        /* Built once: nothing on the page changes the numbers a scene works. */
        const build = () => {
            const next = painter.read(scene);
            if (!next) return;
            model = next;

            totalStages = painter.stages(model);
            buildDots();
            scene.style.setProperty("--scene-height", `${(totalStages + 1) * paceVh}vh`);
            scene.style.setProperty("--scene-min-height", `${(totalStages + 1) * pacePx}px`);

            parts = painter.build(board, model);
            stage = -1;
            requestUpdate();
        };

        const reset = () => {
            dock(0);
            cardHeight = sticky.offsetHeight;
            stage = -1;
            requestUpdate();
        };

        /* The card is measured only once the board has something in it: an
           empty board would under-measure it and the pinned card would clip its
           own conclusion. */
        build();
        cardHeight = sticky.offsetHeight;
        update();
        return { requestUpdate, reset };
    };

    /* -------------------------------------------------------------- sandbox

       One calculation with a pair of brackets moved about it. Pressing a
       placing writes the calculation out with the brackets in and works it
       through, so what the brackets did is the difference between two pieces of
       writing rather than a claim about them. */

    const buildBrackets = () => {
        const host = document.querySelector("[data-brackets]");
        if (!host) return;
        /* The card carries a worked statement for a reader without JavaScript;
           the sandbox takes its place. */
        host.replaceChildren();

        const BASE = [num(2), sign(TIMES), num(3), sign("+"), num(4), sign(TIMES), num(5)];
        /* Each placing names the atoms it gathers, so the brackets are inserted
           rather than the whole line being retyped. */
        /* The placings run left to right by where the bracket opens, and the
           one that opens none comes last: it is the widest label, and leading
           with it pushes it onto a row of its own. */
        const PLACINGS = [
            { label: `(2 ${TIMES} 3)`, spoken: "brackets round 2 times 3", from: 0, to: 2 },
            { label: `(2 ${TIMES} 3 + 4)`, spoken: "brackets round 2 times 3 plus 4", from: 0, to: 4 },
            { label: `(3 + 4)`, spoken: "brackets round 3 plus 4", from: 2, to: 4 },
            { label: `(3 + 4 ${TIMES} 5)`, spoken: "brackets round 3 plus 4 times 5", from: 2, to: 6 },
            { label: `(4 ${TIMES} 5)`, spoken: "brackets round 4 times 5", from: 4, to: 6 },
            { label: "no brackets", spoken: "no brackets", from: -1, to: -1 }
        ];
        const LINES = 4;

        const bracketed = (placing) => {
            if (placing.from < 0) return BASE.slice();
            return BASE.slice(0, placing.from)
                .concat([OPEN], BASE.slice(placing.from, placing.to + 1), [SHUT],
                    BASE.slice(placing.to + 1));
        };

        const board = el("div", "brackets__board");
        /* The working is a visual construction: the line underneath carries the
           whole statement and is announced, so the board itself is hidden. */
        board.setAttribute("aria-hidden", "true");

        const reading = el("p", "brackets__reading");
        reading.setAttribute("aria-live", "polite");

        const tileGroup = el("div", "brackets__tiles");
        tileGroup.setAttribute("role", "group");
        tileGroup.setAttribute("aria-label", "Where the brackets go");

        /* The calculation as it is written is where the reader starts. */
        let armed = PLACINGS.findIndex((placing) => placing.from < 0);

        const tiles = PLACINGS.map((placing, index) => {
            const button = el("button", "brackets__tile", placing.label);
            button.setAttribute("type", "button");
            button.setAttribute("aria-label", placing.spoken);
            button.setAttribute("aria-pressed", "false");
            button.addEventListener("click", () => { armed = index; render(); });
            tileGroup.append(button);
            return button;
        });

        const controls = el("div", "brackets__controls");
        controls.append(tileGroup);
        host.append(board, reading, controls);

        function render() {
            const atoms = bracketed(PLACINGS[armed]);
            const lines = workThrough(atoms);
            board.replaceChildren();
            const built = buildWorking(board, lines);
            /* Fixed at its tallest, so a shorter working never moves the page. */
            built.calc.style.height = `${(LINES - 1) * ROW_H + LINE_H + 10}px`;
            /* Standing still, every line and every brace is already there. */
            paintWorking(built, lines.length + 1);

            const statement = layOutLine(atoms).spans
                .map((span) => (span.gap ? " " : "") + atomText(span.atom)).join("");
            reading.textContent = `${statement} = ${lines[lines.length - 1].atoms[0].value}`;

            tiles.forEach((tile, index) => {
                tile.classList.toggle("is-armed", index === armed);
                tile.setAttribute("aria-pressed", String(index === armed));
            });
        }

        render();
    };

    const scenes = Array.from(document.querySelectorAll("[data-calc-scene]"))
        .map(createScene)
        .filter(Boolean);

    buildBrackets();

    if (!scenes.length) return;

    const requestAll = () => scenes.forEach((scene) => scene.requestUpdate());
    const resetAll = () => scenes.forEach((scene) => scene.reset());
    window.addEventListener("scroll", requestAll, { passive: true });
    window.addEventListener("resize", resetAll);
    /* Aleo arrives after the first paint and changes every measurement it
       touches, so the card is measured again once the fonts are in. */
    window.addEventListener("load", resetAll);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resetAll);
    requestAll();
});
