/* Reordering a calculation.

   Two figures, and the engine that drives them.

   Both figures animate the same thing and animate it on different marks: a
   calculation that is already written being rearranged into an easier one. The
   marks that travel are exactly the marks a reader is allowed to move, and the
   gold frame is put round the pair being taken first, so what the frame holds
   at each stop is what the caption is talking about.

   The product figure moves a whole number past another. The signs figure moves
   a number together with the sign in front of it, which is the harder half of
   the idea and needs its own picture rather than the first one's caption
   rewritten.

   Positions are read with offsetLeft/offsetTop rather than
   getBoundingClientRect because the card is scaled by a transform while it is
   pinned, and offsets are measured before that transform is applied. */

document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const ease = (value) => {
        const x = clamp(value);
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    };
    const mix = (from, to, t) => from + (to - from) * t;

    /* How far a mark leans off the line as it passes another. Enough that the
       two are plainly not touching, and no more: measured against the boxes the
       marks sit in, clearing a × outright would need a leap of a whole
       line-height, and a numeral thrown that far out of the line reads as a
       glitch rather than as a number changing places. What has to be clear is
       the ink, which is a good deal smaller than the box around it. */
    const LIFT = 26;

    const MINUS = "−";
    const TIMES = "×";

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
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

    const writeCaption = (node, text) => {
        if (node && node.textContent !== text) node.textContent = text;
    };

    /* ----------------------------------------------- what the two scenes hold

       A scene is its marks, the arrangements they pass through, and what each
       arrangement leaves on the line below.

       `order` is the marks in the order they are read, by their index in the
       markup. `frame` is the run of read-positions the gold frame encloses,
       which is the pair being taken first. `face` is which of the reductions is
       written underneath, or -1 for none. The last face is the one written into
       the element; the rest are drawn by the stylesheet, so the line that
       survives the markup being stripped is the answer rather than every stage
       of the working at once. */

    const SCENES = {
        product: {
            marks: [
                { text: "4" }, { op: TIMES }, { text: "17" }, { op: TIMES }, { text: "25" }
            ],
            faces: [`= 68 ${TIMES} 25`, `= 100 ${TIMES} 17`, "= 1,700"],
            stages: [
                {
                    order: [0, 1, 2, 3, 4], frame: null, face: -1,
                    title: "The calculation as written",
                    copy: `4 ${TIMES} 17 ${TIMES} 25 has two multiplications and no brackets, so it runs from the left.`
                },
                {
                    order: [0, 1, 2, 3, 4], frame: [0, 2], face: 0,
                    title: "From the left, 4 × 17",
                    copy: `4 ${TIMES} 17 = 68, and 68 ${TIMES} 25 is a long multiplication.`
                },
                {
                    order: [0, 1, 4, 3, 2], frame: null, face: -1,
                    title: "17 and 25 change places",
                    copy: "Multiplying gives the same product either way round, so the two may be written in either order."
                },
                {
                    order: [0, 1, 4, 3, 2], frame: [0, 2], face: 1,
                    title: "The pair that makes 100",
                    copy: `4 ${TIMES} 25 = 100, and 17 is left to be multiplied by it.`
                },
                {
                    order: [0, 1, 4, 3, 2], frame: [0, 2], face: 2,
                    title: "100 × 17 = 1,700",
                    copy: "Multiplying by 100 moves each digit of 17 two places, so no written method is needed."
                }
            ]
        },

        signs: {
            marks: [
                { text: "38" }, { sign: MINUS, text: "17" }, { sign: "+", text: "62" }
            ],
            faces: [`= 100 ${MINUS} 17`, "= 83"],
            stages: [
                {
                    order: [0, 1, 2], frame: null, face: -1,
                    title: "The calculation as written",
                    copy: `38 ${MINUS} 17 + 62 adds 38, takes 17 away and adds 62.`
                },
                {
                    order: [0, 1, 2], frame: [1, 1], face: -1,
                    title: "The minus belongs to the 17",
                    copy: `The sign in front of a number says what that number does, so ${MINUS}17 is one mark and not two.`
                },
                {
                    order: [0, 2, 1], frame: [2, 2], face: -1,
                    title: "−17 travels to the end",
                    copy: "It keeps its minus on the way, so 17 is still the number being taken away."
                },
                {
                    order: [0, 2, 1], frame: [0, 1], face: 0,
                    title: "38 + 62 = 100",
                    copy: "The two numbers being added are now side by side, and they reach a round number."
                },
                {
                    order: [0, 2, 1], frame: null, face: 1,
                    title: "100 − 17 = 83",
                    copy: `Taking the 17 at the end gives 83, which is what 38 ${MINUS} 17 + 62 came to in the first place.`
                }
            ]
        }
    };

    /* ------------------------------------------------------------- the board */

    const buildLine = (scene) => {
        const row = el("div", "regroup__row");
        const frame = el("i", "regroup__frame");
        frame.setAttribute("aria-hidden", "true");
        const line = el("div", "regroup__line");

        const marks = scene.marks.map((spec) => {
            if (spec.op !== undefined) return el("span", "regroup__tok regroup__tok--op", spec.op);
            if (spec.sign === undefined) return el("span", "regroup__tok", spec.text);
            /* The sign and its number are one box, because the whole point of
               this figure is that they travel together. */
            const tok = el("span", "regroup__tok regroup__tok--term");
            tok.append(el("span", "regroup__sign", spec.sign), document.createTextNode(spec.text));
            return tok;
        });

        line.append(...marks);
        row.append(frame, line);
        return { row, frame, line, marks };
    };

    const buildResult = (scene) => {
        const result = el("div", "regroup__result");
        const faces = scene.faces.map((text, i) => {
            /* The settled reduction is real text; the ones passed through on
               the way are generated content, so the flattened line reads the
               answer once rather than every stage of the working at once. */
            if (i === scene.faces.length - 1) return el("span", "regroup__face", text);
            const face = el("span", "regroup__face regroup__face--from");
            face.setAttribute("data-face", text);
            face.setAttribute("aria-hidden", "true");
            return face;
        });
        result.append(...faces);
        return { result, faces };
    };

    const painter = {
        read: (scene) => SCENES[scene.dataset.scene] || null,

        stages: (model) => model.stages.length - 1,

        build(board, model) {
            board.replaceChildren();
            const figure = el("div", "regroup");
            const line = buildLine(model);
            const result = buildResult(model);
            figure.append(line.row, result.result);
            board.append(figure);
            return { figure, ...line, ...result, model };
        },

        /* Distances are read once per layout rather than once per frame: they
           cannot change while the page is not being resized, and reading them
           inside paint made every scroll frame a forced reflow.

           Each arrangement is laid out here rather than guessed at. The marks
           are the same set in every arrangement, so the line is the same width
           in all of them and each mark's place can be added up from the widths
           to its left. */
        measure(parts) {
            /* Nothing is displaced while this runs. The transforms from the
               last frame are still on these marks, and a position read through
               one is a measurement of the answer to the question being asked. */
            parts.marks.forEach((node) => { node.style.transform = "none"; });

            const box = parts.marks.map((node) => offsetWithin(node, parts.row));
            const lineLeft = offsetWithin(parts.line, parts.row).left;
            /* Read from the layout rather than repeated from the stylesheet, so
               the two cannot drift apart. */
            const gap = parts.marks.length > 1 ? box[1].left - (box[0].left + box[0].width) : 0;

            parts.places = parts.model.stages.map((stage) => {
                const left = [];
                let x = lineLeft;
                stage.order.forEach((idx) => { left[idx] = x; x += box[idx].width + gap; });
                const dx = box.map((b, idx) => left[idx] - b.left);
                if (!stage.frame) return { dx, frame: null };
                const [a, b] = stage.frame;
                const held = stage.order.slice(a, b + 1);
                const first = held[0];
                const last = held[held.length - 1];
                /* The union of the marks held, not the first one's box: a
                   signed term is a flex box of its own and need not be the same
                   height as a plain numeral standing beside it. */
                const top = Math.min(...held.map((i) => box[i].top));
                const bottom = Math.max(...held.map((i) => box[i].top + box[i].height));
                const pad = 11;
                return {
                    dx,
                    frame: {
                        held,
                        key: held.join(","),
                        left: left[first] - pad,
                        width: (left[last] + box[last].width) - left[first] + pad * 2,
                        top: top - 7,
                        height: (bottom - top) + 14
                    }
                };
            });
        },

        caption: (model, index) => model.stages[Math.min(index, model.stages.length - 1)],

        /* With reduced motion the scene is drawn once and never scrubbed, so it
           is shown at its last stage: the calculation rearranged and the answer
           written under it. That is the frame worth keeping. */
        still(parts) {
            this.place(parts, parts.model.stages.length - 1, 1);
        },

        /* One frame of the figure, from which arrangement it is in and how far
           it has moved towards the next. paint and still both come through
           here, so the still frame cannot drift away from the moving one. */
        place(parts, i0, t) {
            if (!parts.places) return;
            const last = parts.places.length - 1;
            const ia = Math.max(0, Math.min(last, i0));
            const ib = Math.max(0, Math.min(last, i0 + 1));
            const a = parts.places[ia];
            const b = parts.places[ib];
            const stageA = parts.model.stages[ia];
            const stageB = parts.model.stages[ib];

            /* One mark is lifted out of the line and flown over it, and the
               rest close up underneath. Slid along the line instead, it was
               drawn straight through whatever it passed: at the middle of the
               swap, −17 and +62 occupied the same 64 pixels of board with their
               digits crossing, and the gold frame sat round the collision.

               Every mark that moves has to leave the line, not just the one
               being watched. A mark is a whole line-height tall, so two of them
               half that far apart still overlap, and the second traveller —
               left sliding along the line — went straight through the × it
               passed. So both clear it, by more than their own height and in
               opposite directions: the one the caption names goes over the top
               and the other dips under.
 Both ends of the arc are zero, so a settled stage is
               untouched. */
            /* The two marks that change places are picked up together, carried
               past one another, and set down together.

               A plain arc does not work here, and the measurements are what say
               so. A mark leans furthest at the middle of its travel and least at
               the two ends — but the ends are exactly where it is passing the
               sign standing between the slots, so it came back down onto the
               line while it was still crowded against that sign, and 25 × 17
               landed in a heap. Leaning far enough to clear the sign at those
               moments means throwing a numeral most of a line-height off the
               line, which reads as a glitch rather than as a number moving.

               So the lean is held instead of peaked: it eases up over the first
               part of the move, stays up for the whole of the sideways travel,
               and eases down once every mark is over its new slot. Nothing is
               ever set down anywhere except where it belongs, and every mark
               that moves is on the same clock, so what a reader sees is one
               movement rather than several. Which way a mark leans comes from
               which way it is going, so nothing is declared stage by stage. */
            const RISE = 0.2;
            const lean = t < RISE ? ease(t / RISE)
                : t > 1 - RISE ? ease((1 - t) / RISE)
                : 1;
            const across = clamp((t - RISE) / (1 - 2 * RISE));

            const arcs = parts.marks.map((_, idx) => {
                const delta = b.dx[idx] - a.dx[idx];
                if (a === b || Math.abs(delta) < 1) return 0;
                return -Math.sign(delta) * LIFT * lean;
            });

            parts.marks.forEach((node, idx) => {
                const along = mix(a.dx[idx], b.dx[idx], across);
                node.style.transform = `translate(${along.toFixed(2)}px, ${arcs[idx].toFixed(2)}px)`;
            });

            /* A frame that is arriving or leaving is faded in place rather than
               grown from nothing; one that is moving from one pair to another
               travels and keeps its ink. */
            /* The frame is doing one of two different things, and they do not
               look alike. When the run it holds is the same run either side of a
               move, it is holding an object that is travelling, and it goes with
               it. When the run is a different one, nothing is travelling — the
               highlight is simply being moved from one part of the line to
               another — and sliding a gold box across the statement to get there
               reads as a thing crawling over the marks. That one is taken off
               and put back on instead. */
            const frame = parts.frame;
            const carrying = a.frame && b.frame && a.frame.key === b.frame.key;
            let box = null;
            let alpha = 0;

            if (carrying) {
                /* On the marks' clock, not the stage's. Slid on the raw t while
                   the marks travel on `across`, the frame set off while they
                   were still standing still and arrived before they did — a
                   fifth of the way through the move it sat 15px ahead of the
                   mark it held, and two fifths of the way through, 25px behind
                   it. */
                box = {
                    left: mix(a.frame.left, b.frame.left, across),
                    width: mix(a.frame.width, b.frame.width, across),
                    top: mix(a.frame.top, b.frame.top, across),
                    height: mix(a.frame.height, b.frame.height, across),
                    held: a.frame.held
                };
                alpha = 1;
            } else if (a.frame && b.frame) {
                const second = t > 0.5;
                box = second ? b.frame : a.frame;
                alpha = second ? clamp((t - 0.65) / 0.35) : 1 - clamp(t / 0.35);
            } else if (a.frame) {
                /* Off before the marks lift, and on after they land. Fading over
                   a longer window than the lift left the frame still half drawn
                   on the line while the mark it held had already risen out of
                   it. */
                box = a.frame;
                alpha = 1 - clamp(t / RISE);
            } else if (b.frame) {
                box = b.frame;
                alpha = clamp((t - (1 - RISE)) / RISE);
            }

            frame.style.opacity = alpha.toFixed(3);
            if (box) {
                frame.style.left = `${box.left.toFixed(2)}px`;
                frame.style.width = `${box.width.toFixed(2)}px`;
                frame.style.top = `${box.top.toFixed(2)}px`;
                frame.style.height = `${box.height.toFixed(2)}px`;
                /* and it leans with the marks it holds, so a frame round a mark
                   being carried goes up with it rather than staying on the line
                   around the space that mark has left */
                const rise = box.held.length
                    ? box.held.reduce((sum, idx) => sum + arcs[idx], 0) / box.held.length
                    : 0;
                frame.style.transform = `translateY(${rise.toFixed(2)}px)`;
            }

            /* The reductions cross-fade linearly rather than on the scene's own
               easing: an ease-in-out applied to a crossfade spends most of its
               window at one end or the other, so the change happens in a snap
               in the middle of an otherwise smooth movement. */
            parts.faces.forEach((face, idx) => {
                const shown = mix(stageA.face === idx ? 1 : 0, stageB.face === idx ? 1 : 0, t);
                face.style.opacity = shown.toFixed(3);
            });
        },

        /* The board rests at the arrangement its caption names, and moves into
           it out of the one before. Interpolating the other way round — from
           the current arrangement towards the next — left the board settled on
           the next stage's picture for the whole of the stationary interval,
           while the caption underneath still named the one it had left. */
        paint(parts, model, index, within) {
            this.place(parts, index - 1, ease(clamp(within)));
        }
    };

    /* --------------------------------------------------------------- engine */

    const createScene = (scene) => {
        const sticky = scene.querySelector(".reorder-scene__sticky");
        /* The card is moved into the body while it is pinned, so a second
           initialisation would find the scene empty. */
        if (!sticky) return null;

        const board = scene.querySelector("[data-board]");
        const stepTitle = scene.querySelector("[data-step-title]");
        const stepCopy = scene.querySelector("[data-step-copy]");
        const progressBar = scene.querySelector("[data-progress]");

        const paceVh = 52;
        const pacePx = 400;
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
                const caption = painter.caption(model, index);
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
                dot.className = "reorder-scene__dot";
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
                painter.still(parts);
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
            painter.measure(parts);
            stage = -1;
            requestUpdate();
        };

        const reset = () => {
            dock(0);
            if (parts) painter.measure(parts);
            cardHeight = sticky.offsetHeight;
            stage = -1;
            requestUpdate();
        };

        /* The card is measured only once the board has something in it: an
           empty board would under-measure it and the pinned card would clip its
           own conclusion. */
        build();
        if (!model) return null;
        cardHeight = sticky.offsetHeight;
        update();
        return { requestUpdate, reset };
    };

    /* ---------------------------------------------------------------- start */

    const scenes = Array.from(document.querySelectorAll("[data-reorder-scene]"))
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
