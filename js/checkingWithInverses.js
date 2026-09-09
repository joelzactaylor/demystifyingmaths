/* Checking an answer with the inverse operation.

   One figure, and the engine that drives it.

   The figure animates the only thing on the page that is genuinely a movement:
   where a check comes from. A finished calculation stays where it is, and a
   copy of it peels away downwards and rearranges into the statement that tests
   it — the two end numbers crossing as they fall, the operation between them
   turning into its inverse. The original is still standing above the check, so
   the reader can see what moved rather than being told. The remainder picture
   is static, because a rectangle and five spare squares do not move.

   Positions are read with offsetLeft/offsetTop rather than getBoundingClientRect
   because the card is scaled by a transform while it is pinned, and offsets are
   measured before that transform is applied. */

document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const ease = (value) => {
        const x = clamp(value);
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    };

    const MINUS = "−";
    const TIMES = "×";
    /* The questioning equals: the calculation is not asserted, it is asked. */
    const ASKS = "≟";

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    /* A raised index loses its meaning when the styling is stripped: "4^3"
       becomes "43". The clipped caret is what keeps the flattened text true. */
    const power = (host, baseText, indexText) => {
        if (baseText) host.append(document.createTextNode(baseText));
        const caret = el("span", "caret", "^");
        caret.setAttribute("aria-hidden", "true");
        host.append(caret, el("sup", "", String(indexText)));
    };

    const offsetWithin = (node, root) => {
        let left = 0;
        let top = 0;
        let walk = node;
        while (walk && walk !== root) {
            left += walk.offsetLeft;
            top += walk.offsetTop;
            walk = walk.offsetParent;
        }
        return { left, top, width: node.offsetWidth, height: node.offsetHeight };
    };

    /* Where a line's baseline sits inside its own box. A zero-sized inline-block
       comes to rest with its bottom edge on the baseline, which is the only way
       to ask this of a browser. It is read off a client rect and not offsetTop,
       because offsetTop is rounded to whole pixels and the fraction is the whole
       point of the measurement. */
    const baselineWithin = (line) => {
        const probe = el("span");
        probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
        line.append(probe);
        const offset = probe.getBoundingClientRect().bottom - line.getBoundingClientRect().top;
        probe.remove();
        return offset;
    };

    const writeCaption = (node, text) => {
        if (node && node.textContent !== text) node.textContent = text;
    };

    /* ------------------------------------------- the ends swap, the sign turns

       Where a check comes from, three times over. The move is the same in all
       three: the two end numbers change places and the operation between them
       inverts. The rearrangement lands directly on the check, because that is
       the thing the reader has to be able to write.

       Each example is drawn twice over. The calculation under test stays on an
       upper line, written with the questioning equals it is still waiting on,
       and a copy of it peels away downwards and rearranges as it falls, so the
       check ends up standing under the calculation it tests with both of them
       readable at once. Nothing is ever cleared: the three pairs accumulate down
       the board, dimming as the next one starts, and the last frame is the same
       move made in three different shapes.

       The two travelling ends arc in opposite directions, one over and one
       under, so they pass each other rather than sliding through the middle of
       the statement. */

    const SVG = "http://www.w3.org/2000/svg";

    /* How far below its calculation a check lands. Less than the space between
       one pair and the next, or the board reads as six loose lines instead of
       three questions with three answers. */
    const ROW = 48;

    const EXAMPLES = [
        {
            kind: "binary", a: "802", op: MINUS, inv: "+", b: "47", c: "755",
            settled: {
                title: "A finished subtraction",
                copy: "47 has been taken from 802, and 755 is the answer to test."
            },
            moved: {
                title: "The ends change places",
                copy: "802 and 755 change places, and the minus between them turns into a plus."
            }
        },
        {
            kind: "binary", a: "391", op: "÷", inv: TIMES, b: "23", c: "17",
            settled: {
                title: "A finished division",
                copy: "17 is the answer to test, and 391 and 23 are the numbers that made it."
            },
            moved: {
                title: "The same move, a division",
                copy: "391 and 17 change places, and the division between them turns into a multiplication."
            }
        },
        {
            kind: "power", a: "4", index: "3", c: "64",
            settled: {
                title: "A power, with no sign between the ends",
                copy: "Nothing stands between 4 and 64 to turn. The index 3 is the operation."
            },
            moved: {
                title: "The index becomes a root",
                copy: "4 and 64 change places, and the 3 slides off the base to become the order of the root."
            }
        }
    ];

    /* A root is always drawn, never assembled from a character and a border.
       On the moving copy the drawn order is left out: the order that arrives is
       the one that slid off the base, not a second one faded in over it. */
    const radical = (order, over, ownOrder) => {
        const rad = el("span", "rad rad--order");
        const caret = el("span", "caret", "³√");
        caret.setAttribute("aria-hidden", "true");
        const index = el("span", `rad__index${ownOrder ? "" : " rad__index--slot"}`);
        index.setAttribute("data-order", order);
        index.setAttribute("aria-hidden", "true");
        const svg = document.createElementNS(SVG, "svg");
        svg.setAttribute("class", "rad__sign");
        svg.setAttribute("viewBox", "0 0 24 40");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");
        const path = document.createElementNS(SVG, "path");
        path.setAttribute("d", "M.5 24H5l5.5 13.5L22 1.5H24");
        /* One unit long whatever its real length, so the stylesheet can uncover
           it by a fraction and the sign draws itself from its own left tick. */
        path.setAttribute("pathLength", "1");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "currentColor");
        path.setAttribute("stroke-width", "3");
        path.setAttribute("stroke-linejoin", "miter");
        path.setAttribute("stroke-linecap", "butt");
        svg.append(path);
        const line = el("span", "rad__over", over);
        /* The bar is drawn as its own mark rather than left as the border of
           .rad__over, so it can be faded up with the sign without taking the
           radicand under it along too. */
        const bar = el("i", "cross__bar");
        bar.setAttribute("aria-hidden", "true");
        line.append(bar);
        rad.append(caret, index, svg, line);
        return rad;
    };

    /* An operation slot with the mark it rests on and, on the moving copy, the
       mark it turns from. The second mark is drawn by the stylesheet rather than
       written into the element: two characters in one slot are two characters in
       the text, and the line flattened to "802 − + 47 = 755". */
    /* The questioning equals, drawn rather than typed. The character exists, but
       the fallback face that supplies it at this size sets the question mark
       small and a long way above the bar, so it reads as two marks that have
       come apart rather than as one sign. The true character is kept, clipped,
       so a stripped page still says the line is asking. */
    const asking = (live) => {
        const slot = el("span", "cross__slot cross__eq");
        if (live) {
            slot.append(el("span", "cross__face", "="));
            const ask = el("span", "cross__face cross__face--from cross__ask");
            ask.setAttribute("aria-hidden", "true");
            slot.append(ask);
            return slot;
        }
        const ask = el("span", "cross__face cross__ask");
        const caret = el("span", "caret", ASKS);
        caret.setAttribute("aria-hidden", "true");
        ask.append(caret);
        slot.append(ask);
        return slot;
    };

    const turning = (rest, from, live) => {
        const slot = el("span", "cross__slot");
        slot.append(el("span", "cross__face", live ? rest : from));
        if (!live) return slot;
        const before = el("span", "cross__face cross__face--from");
        before.setAttribute("data-face", from);
        before.setAttribute("aria-hidden", "true");
        slot.append(before);
        return slot;
    };

    /* The two lines of a pair are built by the same function.

       The moving copy is built as the check — the statement the reader is meant
       to end up with — and the crossing runs backwards out of it: at the start
       of the move every one of its marks is held over the mark it corresponds to
       in the calculation above. Building it the other way round and letting it
       become the check left it holding a half-finished statement in the markup,
       and with the stylesheet stripped the power row read "4^3 = ³√64", which is
       false. What the two lines flatten to now is a question and its answer. */
    const statement = (ex, live) => {
        const line = el("div", `cross__line cross__line--${live ? "live" : "ghost"}`);
        const parts = { line };
        const eq = asking(live);

        if (ex.kind === "binary") {
            parts.left = el("span", "cross__end", live ? ex.c : ex.a);
            parts.op = turning(ex.inv, ex.op, live);
            parts.op.classList.add("cross__op");
            parts.right = el("span", "cross__end", live ? ex.a : ex.c);
            parts.tokens = [parts.left, parts.op, el("span", "cross__mid", ex.b), eq, parts.right];
            /* which mark on the calculation each mark on the check comes from */
            parts.from = [4, 1, 2, 3, 0];
        } else {
            parts.left = el("span", "cross__end");
            parts.right = el("span", "cross__end");
            if (live) {
                parts.left.classList.add("cross__end--rooted");
                parts.rad = radical(ex.index, ex.c, false);
                parts.left.append(parts.rad);
                parts.right.append(document.createTextNode(ex.a));
                /* The order that slides from the base to the root is generated by
                   the stylesheet for the same reason the drawn order is: it is
                   one mark passing between two places, not a digit of its own,
                   and as text it flattened into the number it was sitting on. */
                parts.index = el("span", "cross__index cross__index--flying");
                parts.index.setAttribute("data-order", ex.index);
                parts.index.setAttribute("aria-hidden", "true");
                parts.right.append(parts.index);
            } else {
                parts.left.append(document.createTextNode(ex.a));
                parts.index = el("span", "cross__index");
                power(parts.index, "", ex.index);
                parts.left.append(parts.index);
                parts.right.append(document.createTextNode(ex.c));
            }
            parts.tokens = [parts.left, eq, parts.right];
            parts.from = [2, 1, 0];
        }

        line.append(...parts.tokens);
        return parts;
    };

    const rearrangePainter = {
        read: () => ({ examples: EXAMPLES }),

        /* two stages per example: the statement, then the rearrangement */
        stages: () => EXAMPLES.length * 2 - 1,

        build(board, model) {
            board.replaceChildren();
            const figure = el("div", "cross");

            const rows = model.examples.map((ex) => {
                const row = el("div", "cross__row");
                const ghost = statement(ex, false);
                const live = statement(ex, true);
                row.append(ghost.line, live.line);
                figure.append(row);
                return { row, ghost, live, ex, span: null };
            });

            board.append(figure);
            return { figure, rows };
        },

        /* Distances are read once per layout rather than once per frame: they
           cannot change while the page is not being resized, and reading them
           inside paint made every scroll frame a forced reflow.

           Every mark on the check is measured against the mark it comes from,
           not just the two that change places. Holding only the ends to account
           meant the equals sign and the number between could only stay put if
           every slot in both lines was padded to the width of the widest thing
           any of them held, and 4 then sat alone in the middle of a box wide
           enough for a cube root. */
        measure(parts) {
            /* Nothing is displaced while this runs. The transforms from the last
               frame are still on these elements, and a rect read through one is
               a measurement of the answer to the question being asked. */
            parts.figure.style.transform = "none";
            parts.rows.forEach((entry) => {
                [entry.ghost, entry.live].forEach((copy) => {
                    copy.line.style.transform = "none";
                    copy.tokens.forEach((node) => { node.style.transform = "none"; });
                    if (copy.index) copy.index.style.transform = "none";
                });
            });

            parts.rows.forEach((entry) => {
                /* The root's slot keeps the width the root will need, so the
                   line does not reflow as the sign is drawn into it. */
                if (entry.live.rad) {
                    entry.live.left.style.width = "";
                    entry.live.left.style.setProperty("--room", "1");
                    entry.live.left.style.width = `${entry.live.left.offsetWidth}px`;
                }

                /* Only sideways. The two lines are already placed so that their
                   baselines meet when the copy is sitting on the calculation, so
                   a mark has nothing to make up vertically — and centre to centre
                   is not that measurement: a slot holding a raised index, or a
                   root, is taller than the one it is copied from, so its centre
                   is somewhere else and the mark was being lifted off the line by
                   half the difference. That is what stood the 4 of 4³ half a
                   pixel above the 64 beside it, for the whole of the stage where
                   the reader is looking at the calculation. */
                const middleOf = (node) => {
                    const box = offsetWithin(node, entry.row);
                    return box.left + box.width / 2;
                };
                const ghosts = entry.ghost.tokens.map(middleOf);
                const span = {
                    marks: entry.live.tokens.map((node, i) => ({
                        node, dx: ghosts[entry.live.from[i]] - middleOf(node)
                    }))
                };
                /* The crossing, for the arc: how far the two ends travel. */
                span.gap = Math.abs(span.marks[0].dx);
                /* The arc is a fraction of the crossing rather than a fixed
                   height, so a short swap does not loop absurdly far over
                   itself — and it is held between a floor and a ceiling, because
                   an arc taller than the line pulls the ends off it and one
                   shorter than the marks leaves them passing through each
                   other. */
                span.lift = Math.max(16, Math.min(24, span.gap * 0.1));
                span.last = span.marks.length - 1;

                if (entry.ex.kind === "power" && entry.live.index && entry.live.rad) {
                    /* The order slides straight from the base it is an index of
                       to the root's own order slot. Both are carried by ends
                       that finish at rest, so the travel between them is the
                       whole of it. */
                    const start = offsetWithin(entry.live.index, entry.row);
                    const target = offsetWithin(entry.live.rad.querySelector(".rad__index"), entry.row);
                    span.indexDx = target.left - start.left;
                    span.indexDy = target.top - start.top;
                }
                /* A line is placed by its baseline, not by the top of its box.
                   A raised index and a root sign both add ascent, so the box
                   grows and the writing inside it sits lower — and the power
                   pair's two lines came out three pixels further apart than the
                   other two pairs', for no reason a reader could see.

                   Where the grid happens to put the box is measured rather than
                   assumed to be the middle of the row: taking it as half the
                   box's height left each row's baselines on a different fraction
                   of a pixel, and on a display at one device pixel per CSS pixel
                   those fractions round to different rows of pixels. */
                const rowBox = entry.row.getBoundingClientRect();
                const middle = rowBox.top + rowBox.height / 2;
                const pinFor = (line) =>
                    middle - line.getBoundingClientRect().top - baselineWithin(line);
                span.pin = { ghost: pinFor(entry.ghost.line), live: pinFor(entry.live.line) };

                entry.span = span;
            });

            /* How far apart the pairs sit, so the figure can be held centred on
               the ones that have arrived rather than on the space reserved for
               the ones that have not. */
            parts.pitch = parts.rows.length > 1
                ? parts.rows[1].row.offsetTop - parts.rows[0].row.offsetTop
                : 0;
        },

        caption(model, index) {
            const ex = model.examples[Math.floor(index / 2)];
            return index % 2 === 0 ? ex.settled : ex.moved;
        },

        /* With reduced motion the scene is drawn once and never scrubbed, so
           every pair is shown finished: three calculations, each with the check
           that tests it standing underneath. That is the last frame of the
           animation, which is the frame worth keeping. */
        still(parts) {
            parts.figure.style.transform = "none";
            parts.rows.forEach((entry) => this.place(entry, 1, 1));
        },

        /* One row's whole appearance, from how far in it is and how far through
           its rearrangement. paint and still both go through here, so the still
           frame cannot drift away from the moving one. */
        place(entry, shown, move) {
            const { row, ghost, live, span } = entry;
            row.style.opacity = String(shown);

            /* Two beats, overlapping: the copy drops clear of the calculation
               first, and rearranges once it is clear. Run together, the crossing
               happened while the two lines were still on top of each other and
               six numbers were sliding through one another in the same band of
               the card. */
            /* Sub-ranges of the eased move, taken flat. Easing them a second
               time compounds with it and the drop then happens in a tenth of the
               scroll the stage gives it, which is a jump rather than a fall. */
            const drop = clamp(move / 0.45);
            const swap = clamp((move - 0.35) / 0.65);

            const pin = span ? span.pin : { ghost: 0, live: 0 };
            ghost.line.style.transform = `translateY(${(-ROW / 2 + pin.ghost).toFixed(2)}px)`;
            live.line.style.transform = `translateY(${((drop - 0.5) * ROW + pin.live).toFixed(2)}px)`;
            /* The copy starts exactly on the original and hides it; the original
               is only worth seeing once the copy has left. */
            ghost.line.style.opacity = String(clamp(drop * 6));

            if (!span) return;
            /* Every mark is let go from the place it is copied from. The two
               ends arc as well, one over and one under, so they pass each other
               rather than sliding through the middle of the line. */
            const back = 1 - swap;
            const arc = -span.lift * Math.sin(Math.PI * swap);
            span.marks.forEach((mark, i) => {
                const lift = i === 0 ? arc : i === span.last ? -arc : 0;
                mark.node.style.transform =
                    `translate(${(mark.dx * back).toFixed(2)}px, ${lift.toFixed(2)}px)`;
            });

            /* The sign turns over the middle of the crossing, and the questioning
               equals settles into a plain one as the check is written. Fading
               linearly rather than on the scene's own easing: an ease-in-out
               applied to a crossfade spends most of its window at one end or the
               other, so the turn happens in a snap in the middle of an otherwise
               smooth movement. */
            const turn = clamp((swap - 0.3) / 0.4);
            live.tokens.forEach((node) => {
                const from = node.querySelector(".cross__face--from");
                if (!from) return;
                node.firstChild.style.opacity = String(turn);
                from.style.opacity = String(1 - turn);
            });

            if (entry.ex.kind !== "power") return;

            /* The root is grown after the crossing rather than during it. Drawn
               while the two ends were still in the air it arrived over the middle
               of the line, where the base it replaces is still standing.

               It is written in the order a pen writes it, and in three beats
               rather than one: the radicand slides right to open the space, the
               sign is then uncovered from its own left tick up to the top, and
               the bar runs out from there across the number. Fading the whole
               radical up at once made it a mark that appeared rather than one
               that was written, and drawing the sign while the radicand was
               still moving put the two on top of each other.

               The three beats run from the moment the ends have passed each
               other to the moment they land, so the root is being written over
               exactly the stretch where the numerals are settling. */
            const rooted = clamp((swap - 0.45) / 0.55);
            live.left.style.setProperty("--room", clamp(rooted / 0.45).toFixed(3));
            live.left.style.setProperty("--sign", clamp((rooted - 0.35) / 0.35).toFixed(3));
            live.left.style.setProperty("--bar", clamp((rooted - 0.6) / 0.4).toFixed(3));
            /* One mark, moving. The order is not faded out on the base and faded
               back in on the root: it is the same mark in both places, and it
               slides between them. */
            live.index.style.transform =
                `translate(${(span.indexDx * swap).toFixed(2)}px, ${(span.indexDy * swap).toFixed(2)}px)`;
        },

        paint(parts, model, index, within) {
            const at = index + within;

            /* The rows hold their space from the first frame so the board never
               reflows, and the figure rides up over that reserved space as the
               pairs arrive: what has been drawn stays centred in the card
               instead of sitting above an empty half of it. */
            const arrived = parts.rows.reduce(
                (n, _, i) => n + (i ? ease(clamp((at - i * 2) / 0.35)) : 1), 0);
            const slack = (parts.rows.length - arrived) * (parts.pitch || 0) / 2;
            parts.figure.style.transform = `translateY(${slack.toFixed(2)}px)`;

            parts.rows.forEach((entry, i) => {
                const born = i * 2;
                /* Nothing is ever cleared. A pair arrives, is worked, and then
                   steps back to leave the next one the nearer of the two — far
                   enough to say which is being worked, not so far that a finished
                   check stops being readable. */
                /* The first pair is there as soon as the card is, the way the
                   card's own first frame has to be a drawing: fading it in from
                   nothing left the scene opening on an empty board under a
                   caption describing a statement that was not on it. */
                const arriving = i === 0 ? 1 : ease(clamp((at - born) / 0.35));
                const passed = i === parts.rows.length - 1 ? 0 : ease(clamp((at - born - 2) / 0.5));
                this.place(entry, arriving * (1 - 0.32 * passed), ease(clamp(at - (born + 1))));
            });
        }
    };

    const PAINTERS = { rearrange: rearrangePainter };

    /* --------------------------------------------------------------- engine */

    const createScene = (scene) => {
        const sticky = scene.querySelector(".inv-scene__sticky");
        /* The card is moved into the body while it is pinned, so a second
           initialisation would find the scene empty. */
        if (!sticky) return null;

        const painter = PAINTERS[scene.dataset.scene];
        if (!painter) return null;

        const board = scene.querySelector("[data-board]");
        const stepTitle = scene.querySelector("[data-step-title]");
        const stepCopy = scene.querySelector("[data-step-copy]");
        const progressBar = scene.querySelector("[data-progress]");

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
                dot.className = "inv-scene__dot";
                return dot;
            }));
        };

        const render = (progress) => paint(clamp(progress) * (totalStages + 1));

        scene.classList.add("is-ready");

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
                if (painter.still) painter.still(parts);
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

        const build = () => {
            const next = painter.read(scene);
            if (!next) return;
            model = next;

            totalStages = painter.stages(model);
            buildDots();
            scene.style.setProperty("--scene-height", `${(totalStages + 1) * paceVh}vh`);
            scene.style.setProperty("--scene-min-height", `${(totalStages + 1) * pacePx}px`);

            parts = painter.build(board, model);
            /* Distances inside the figure are read once the figure is in the
               document and has been laid out, and again whenever the layout can
               have changed. Reading them per frame forced a reflow on every
               scroll event. */
            if (painter.measure) painter.measure(parts);
            stage = -1;
            requestUpdate();
        };

        const reset = () => {
            dock(0);
            if (parts && painter.measure) painter.measure(parts);
            cardHeight = sticky.offsetHeight;
            stage = -1;
            requestUpdate();
        };

        /* The card is measured only once the board has something in it: an empty
           board would under-measure it and the pinned card would clip its own
           conclusion. */
        build();
        cardHeight = sticky.offsetHeight;
        update();
        return { requestUpdate, reset };
    };

    /* ---------------------------------------------------------------- start */

    const scenes = Array.from(document.querySelectorAll("[data-inv-scene]"))
        .map(createScene)
        .filter(Boolean);

    if (scenes.length) {
        const request = () => scenes.forEach((scene) => scene.requestUpdate());
        const reset = () => scenes.forEach((scene) => scene.reset());
        window.addEventListener("scroll", request, { passive: true });
        window.addEventListener("resize", reset);
        if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", reset);
        window.addEventListener("load", reset);
    }
});
