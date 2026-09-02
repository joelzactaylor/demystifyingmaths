/* Multiplying and dividing directed numbers, drawn as arrows.

   The page before this one drew every number as an arrow: length for size,
   direction for sign, tail on zero. Multiplying stretches that arrow, and
   multiplying by a negative number stretches it and turns it round, so its tip
   travels through zero and comes out on the other side. Nothing here announces
   a rule about two minuses; the arrow is watched while it turns.

   Every row is one arrow with its tail on the anchor and its tip on the number
   the row stands for, and a row is drawn by moving its tip from where the row
   above left off to where this row ends. That single movement is the stretch,
   the shrink and the turn, depending on which two numbers it runs between.

   The page stays a normal document. A scroll-led card supplies its own scroll
   distance, JavaScript pins it inside that, and the scroll position drives the
   drawing continuously; nothing is toggled on. The sandbox is not scroll-led —
   it is built by pressing, and it writes out whatever it has been given.

   Three scenes share the scroll engine, named in data-scene:

   "repeat" lays three arrows of −4 tip to tail and then covers them with one
            arrow three times as long.
   "ladder" steps the second number down from 3 to −2, one row at a time, and
            the tip walks steadily right until it crosses zero.
   "share"  cuts the arrow for −12 into three equal parts, then fills the same
            span with arrows of −3 and counts them. */

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
    const COUNT = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
        "ten", "eleven", "twelve"];
    const Cap = (word) => word.charAt(0).toUpperCase() + word.slice(1);

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

    /* A signed number as it is written: the minus is the character, not a
       hyphen, so the flattened text reads as arithmetic. */
    const signed = (value) => (value < 0 ? MINUS + Math.abs(value) : String(value));
    /* The same number where it stands beside an operator and needs its bracket. */
    const bracketed = (value) => (value < 0 ? `(${MINUS}${Math.abs(value)})` : String(value));

    const writeCaption = (node, content) => { if (node) node.textContent = content; };

    /* ---------------------------------------------------- the arrow picture

       One geometry, used by all three scenes and by the sandbox, so they are
       the same drawing with different numbers in it. Every position along the
       line is a percentage of its span, so nothing here is measured and nothing
       shifts when a webfont arrives late. */

    const LINE_Y = 28;      /* the rule the numbers stand on */
    const ROW_TOP = 62;     /* the first arrow row, clear of the ticks */
    const ROW_STEP = 30;
    const LABEL_LIFT = 20;  /* how far a written label rides above its row */

    const rowTop = (index) => ROW_TOP + index * ROW_STEP;
    const trackHeight = (rows) => ROW_TOP + Math.max(0, rows - 1) * ROW_STEP + 14;

    const buildLine = (track, min, max, labelEvery, tickEvery = 1) => {
        const setup = [];
        const place = (value) => (value - min) / (max - min) * 100;
        const rule = el("i", "scale__rule");
        track.append(rule);
        setup.push(rule);
        for (let value = min; value <= max; value += tickEvery) {
            const tick = el("i", value === 0 ? "scale__tick scale__tick--zero" : "scale__tick");
            tick.style.left = `${place(value)}%`;
            track.append(tick);
            setup.push(tick);
            if ((value - min) % labelEvery) continue;
            const label = el("span",
                value === 0 ? "scale__label scale__label--zero"
                    : value < 0 ? "scale__label scale__label--negative" : "scale__label",
                signed(value));
            label.style.left = `${place(value)}%`;
            track.append(label);
            setup.push(label);
        }
        return { place, setup };
    };

    /* A row is an arrow and the marks that belong to it. `from` is the height
       its drop line starts at, which is the line itself for a first row and the
       row above for every other. */
    const buildRow = (track, top, from) => {
        const riser = el("i", "scale__riser");
        riser.style.top = `${from}px`;
        riser.style.height = `${top - from}px`;
        const shaft = el("i", "scale__shaft");
        shaft.style.top = `${top}px`;
        const head = el("i", "scale__head");
        head.style.top = `${top - 3}px`;
        const term = el("span", "scale__term");
        term.style.top = `${top - LABEL_LIFT}px`;
        track.append(riser, shaft, head, term);
        return { riser, shaft, head, term, top };
    };

    /* Draw one arrow with its tail on the anchor and its tip `amount` of the way
       from where it started to where it ends. Returns the length drawn, as a
       percentage of the line, so a caller can hide a tip that has nothing left
       to sit on. */
    const drawRow = (row, spec, place, amount) => {
        const anchorX = place(spec.anchor);
        const tipValue = lerp(spec.start, spec.far, amount);
        const tipX = place(tipValue);
        const left = Math.min(anchorX, tipX);
        const width = Math.abs(tipX - anchorX);
        row.shaft.style.left = `${left}%`;
        row.shaft.style.width = `${width}%`;

        /* Which way the arrow points is read off the tip's own position, so a
           tip travelling through the anchor turns the arrow round as it goes. */
        const rightward = tipValue === spec.anchor ? spec.far >= spec.anchor : tipValue > spec.anchor;
        row.shaft.classList.toggle("scale__shaft--back", !rightward);
        row.head.classList.toggle("scale__head--left", !rightward);
        row.head.classList.toggle("scale__head--right", rightward);
        row.head.style.left = rightward ? `calc(${tipX}% - 9px)` : `${tipX}%`;

        if (spec.riser === null) {
            row.riser.style.width = "0";
        } else {
            row.riser.style.left = `calc(${place(spec.riser)}% - 1px)`;
        }

        if (spec.label) {
            row.term.textContent = spec.label;
            /* A row made of several copies is labelled across the whole of it,
               not across the first copy. */
            row.term.style.left = spec.labelAt === undefined
                ? `${left + width / 2}%`
                : `${place(spec.labelAt)}%`;
        }
        return width;
    };

    /* Show a row at `shown`, with its tip hidden while the arrow is too short to
       carry one. */
    const showRow = (row, shown, width, labelShown, riserShown) => {
        fade(row.shaft, shown);
        fade(row.head, shown * clamp(width / 1.2));
        fade(row.riser, riserShown === undefined ? shown : riserShown);
        /* A row with nothing written on it keeps its empty label out of the
           way rather than holding an invisible box over the drawing. */
        fade(row.term, row.term.textContent
            ? (labelShown === undefined ? shown : labelShown) : 0);
    };

    /* A written line, and where it is answered rather than replaced, the answer
       as a second part of the same line. The tail holds its space from the
       first frame, so the question never moves and never fades to gain it. */
    const statementLine = (working, text, tail) => {
        const node = el("p", "prod-statement", text);
        if (tail !== undefined) {
            node.textContent = "";
            node.append(el("span", "", text));
            node.answer = el("span", "prod-statement__answer", tail);
            node.append(node.answer);
        }
        working.append(node);
        return node;
    };

    /* Every scene is a number line with rows of arrows under it and room for a
       written conclusion below that. */
    const buildFigure = (board, model, rows, labelEvery, tickEvery) => {
        board.replaceChildren();
        const figure = el("div", "scale");
        const track = el("div", "scale__track");
        track.style.height = `${trackHeight(rows)}px`;
        const { place, setup } = buildLine(track, model.min, model.max, labelEvery, tickEvery);
        const marker = el("i", "scale__marker");
        track.append(marker);
        const working = el("div", "scale__working");
        figure.append(track, working);
        board.append(figure);
        return { track, working, place, setup, marker };
    };

    /* ------------------------------------ a number laid down again and again */

    const repeatPainter = {
        read: () => ({ value: -4, times: 3, min: -16, max: 4 }),

        stages: (model) => model.times,

        build(board, model) {
            const parts = buildFigure(board, model, model.times + 1, 4);
            const specs = [];
            for (let k = 0; k < model.times; k += 1) {
                specs.push({
                    anchor: model.value * k,
                    start: model.value * k,
                    far: model.value * (k + 1),
                    riser: model.value * k,
                    label: signed(model.value)
                });
            }
            const total = model.value * model.times;
            specs.push({ anchor: 0, start: 0, far: total, riser: total, label: signed(total) });

            parts.specs = specs;
            parts.rows = specs.map((unused, index) => buildRow(parts.track, rowTop(index),
                index === 0 ? LINE_Y : rowTop(index - 1)));
            parts.total = statementLine(parts.working,
                `${bracketed(model.value)} ${TIMES} ${model.times} = ${signed(total)}`);
            return parts;
        },

        caption(model, index) {
            const total = model.value * model.times;
            return [
                {
                    title: `One arrow of ${signed(model.value)}`,
                    copy: `${signed(model.value)} runs ${COUNT[Math.abs(model.value)]} units to the left of zero.`
                },
                {
                    title: "A second, laid tip to tail",
                    copy: `The second ${signed(model.value)} starts where the first finished and reaches ${signed(model.value * 2)}.`
                },
                {
                    title: `A third reaches ${signed(total)}`,
                    copy: `Three arrows of ${signed(model.value)} laid tip to tail finish ${COUNT[Math.abs(total)]} units to the left.`
                },
                {
                    title: "One arrow three times as long",
                    copy: `A single arrow from zero reaches ${signed(total)}, the same place the three of them did.`
                }
            ][clamp(index, 0, model.times)];
        },

        paint(parts, model, index, within) {
            const at = index + within;
            const arriving = ease(clamp(at / 0.4));
            parts.setup.forEach((node) => fade(node, arriving));

            let reached = 0;
            parts.specs.forEach((spec, row) => {
                const amount = ease(clamp(at - row));
                const width = drawRow(parts.rows[row], spec, parts.place, amount);
                const shown = arriving * ease(clamp((at - row) / 0.25));
                /* The last row is drawn from zero to where the three of them
                   finished, so its drop line waits until the tip is there to
                   meet. */
                const riserShown = row < model.times ? shown : shown * ease(clamp((at - row - 0.7) / 0.3));
                showRow(parts.rows[row], shown, width,
                    arriving * ease(clamp((at - row - 0.5) / 0.35)), riserShown);
                /* The last row restates the whole reach rather than extending
                   it, so the running mark ignores it. */
                if (amount > 0 && row < model.times) reached = lerp(spec.anchor, spec.far, amount);
            });

            parts.marker.style.left = `${parts.place(reached)}%`;
            fade(parts.marker, arriving);
            rise(parts.total, ease(clamp((at - model.times - 0.15) / 0.4)));
        }
    };

    /* ------------------------------- the second number stepping past zero */

    const ladderPainter = {
        read: () => ({ value: -3, from: 3, to: -2, min: -10, max: 8 }),

        stages: (model) => model.from - model.to,

        build(board, model) {
            const count = model.from - model.to + 1;
            const parts = buildFigure(board, model, count, 2);
            const specs = [];
            for (let k = 0; k < count; k += 1) {
                const multiplier = model.from - k;
                const product = model.value * multiplier;
                const before = k === 0 ? 0 : model.value * (multiplier + 1);
                specs.push({
                    anchor: 0,
                    start: before,
                    far: product,
                    riser: before,
                    label: `${bracketed(model.value)} ${TIMES} ${bracketed(multiplier)} = ${signed(product)}`
                });
            }
            parts.specs = specs;
            parts.rows = specs.map((unused, index) => buildRow(parts.track, rowTop(index),
                index === 0 ? LINE_Y : rowTop(index - 1)));
            return parts;
        },

        caption(model, index) {
            const step = Math.abs(model.value);
            return [
                {
                    title: `Three lots of ${signed(model.value)}`,
                    copy: `The arrow reaches ${signed(model.value * 3)}, ${COUNT[Math.abs(model.value * 3)]} units to the left of zero.`
                },
                {
                    title: `One ${signed(model.value)} fewer`,
                    copy: `Taking one of them away leaves ${signed(model.value * 2)}, ${COUNT[step]} units nearer zero.`
                },
                {
                    title: "And one fewer again",
                    copy: `A single ${signed(model.value)} is left, so the arrow is ${COUNT[step]} units long.`
                },
                {
                    title: "Nothing left of it",
                    copy: "The tip has stepped back to zero, and the arrow has no length at all."
                },
                {
                    title: "Past zero",
                    copy: `The tip steps ${COUNT[step]} further right and comes out at ${step}, pointing the other way.`
                },
                {
                    title: "Twice as long again",
                    copy: `Another ${COUNT[step]} to the right doubles it, and the arrow reaches ${step * 2}.`
                }
            ][clamp(index, 0, model.from - model.to)];
        },

        paint(parts, model, index, within) {
            const at = index + within;
            const arriving = ease(clamp(at / 0.4));
            parts.setup.forEach((node) => fade(node, arriving));

            let reached = 0;
            parts.specs.forEach((spec, row) => {
                const amount = ease(clamp(at - row));
                const width = drawRow(parts.rows[row], spec, parts.place, amount);
                const shown = arriving * ease(clamp((at - row) / 0.25));
                showRow(parts.rows[row], shown, width, arriving * ease(clamp((at - row - 0.5) / 0.35)));
                if (at >= row) reached = lerp(spec.start, spec.far, amount);
            });

            parts.marker.style.left = `${parts.place(reached)}%`;
            fade(parts.marker, arriving);
        }
    };

    /* -------------------------------------- cutting an arrow, and filling it */

    /* Two divisions of the same twelve units, one at a time. The whole amount
       stays on the top row throughout, because both divisions act on it; the
       three parts of −4 have the row below, and they clear before the four
       arrows of −3 are laid on the row below that. The written line under the
       drawing changes with them, so what is on the board and what is written
       always belong to the same question, and each answer row is tagged with the
       division it answers.

       A reader who has asked for reduced motion is shown one frame and no
       scrolling, so that frame holds both divisions at once — clearing the
       first would leave them a page that never shows it. */
    const sharePainter = {
        read: () => ({ total: -12, by: 3, unit: -3, min: -14, max: 2 }),

        stages: () => 4,

        build(board, model) {
            const each = model.total / model.by;
            const fills = model.total / model.unit;
            const parts = buildFigure(board, model, 3, 2);

            const laid = (row, count, size, labelled) => {
                const built = [];
                for (let k = 0; k < count; k += 1) {
                    built.push({
                        row: buildRow(parts.track, rowTop(row), rowTop(row - 1)),
                        spec: {
                            anchor: size * k,
                            start: size * k,
                            far: size * (k + 1),
                            riser: k === 0 ? 0 : null,
                            label: labelled ? signed(size) : null
                        }
                    });
                }
                return built;
            };

            parts.whole = buildRow(parts.track, rowTop(0), LINE_Y);
            parts.wholeSpec = { anchor: 0, start: 0, far: model.total, riser: 0, label: null };
            parts.shares = laid(1, model.by, each, true);
            parts.fills = laid(2, fills, model.unit, false);

            /* Where the whole arrow comes apart. */
            parts.cuts = [];
            for (let k = 1; k < model.by; k += 1) {
                const cut = el("i", "scale__cut");
                cut.style.left = `${parts.place(each * k)}%`;
                cut.style.top = `${rowTop(0) - 6}px`;
                parts.track.append(cut);
                parts.cuts.push(cut);
            }

            /* Counting off the arrows that fill the same span. */
            parts.counts = [];
            for (let k = 0; k < fills; k += 1) {
                const badge = el("span", "scale__count", String(k + 1));
                badge.style.left = `${parts.place(model.unit * k + model.unit / 2)}%`;
                badge.style.top = `${rowTop(2) - LABEL_LIFT - 2}px`;
                parts.track.append(badge);
                parts.counts.push(badge);
            }

            /* Each answer row says which division it answers. */
            parts.asides = [`${OVER} ${model.by}`, `${OVER} ${bracketed(model.unit)}`]
                .map((label, k) => {
                    const tag = el("span", "scale__aside", label);
                    tag.style.top = `${rowTop(k + 1) - 7}px`;
                    parts.track.append(tag);
                    return tag;
                });

            /* Two lines through one slot: the first division answered, then the
               second asked and answered in place. */
            parts.lines = [
                statementLine(parts.working,
                    `${signed(model.total)} ${OVER} ${model.by} = ${signed(each)}`),
                statementLine(parts.working,
                    `${signed(model.total)} ${OVER} ${bracketed(model.unit)}`, ` = ${fills}`)
            ];
            return parts;
        },

        caption(model, index) {
            const each = model.total / model.by;
            const fills = model.total / model.unit;
            return [
                {
                    title: `${Cap(COUNT[Math.abs(model.total)])} units to the left`,
                    copy: `${signed(model.total)} is one arrow running from zero to ${COUNT[Math.abs(model.total)]} below it.`
                },
                {
                    title: "Two cuts, three equal parts",
                    copy: `The cuts fall at ${signed(each)} and ${signed(each * 2)}, splitting the arrow into ${COUNT[model.by]} of the same length.`
                },
                {
                    title: `Each part is ${signed(each)}`,
                    copy: `The cut arrow comes apart into ${COUNT[model.by]} separate arrows, and each of them runs ${COUNT[Math.abs(each)]} units to the left.`
                },
                {
                    title: `The same amount, divided by ${signed(model.unit)}`,
                    copy: `The parts of ${signed(each)} give way to arrows of ${signed(model.unit)}, laid tip to tail along the same ${COUNT[Math.abs(model.total)]} units.`
                },
                {
                    title: `${Cap(COUNT[fills])} of them fit`,
                    copy: `Asking how many arrows of ${signed(model.unit)} reach ${signed(model.total)} is asking for a count, so the answer is ${fills}.`
                }
            ][clamp(index, 0, 4)];
        },

        paint(parts, model, index, within) {
            const at = index + within;
            const still = reduceMotion.matches;
            const arriving = ease(clamp(at / 0.4));
            parts.setup.forEach((node) => fade(node, arriving));

            const grown = ease(clamp(at));
            const wholeWidth = drawRow(parts.whole, parts.wholeSpec, parts.place, grown);
            showRow(parts.whole, arriving * ease(clamp(at / 0.25)), wholeWidth);

            parts.marker.style.left = `${parts.place(lerp(0, model.total, grown))}%`;
            fade(parts.marker, arriving);

            /* The first division holds its row until the fourth stage and then
               clears, so a scrolling reader never has two divisions on the board
               at once. The one frame a reduced-motion reader gets keeps both. */
            const clearing = still ? 0 : ease(clamp((at - 3) / 0.3));
            parts.cuts.forEach((cut, k) =>
                fade(cut, ease(clamp((at - 1 - k * 0.18) / 0.4)) * (1 - clearing)));

            const lay = (built, from, span, holding) => built.forEach(({ row, spec }, k) => {
                const amount = ease(clamp(((at - from) / span) * built.length - k));
                showRow(row, amount * holding, drawRow(row, spec, parts.place, amount));
            });
            lay(parts.shares, 2, 1, 1 - clearing);
            lay(parts.fills, 3.3, 0.7, 1);

            fade(parts.asides[0], ease(clamp((at - 2.1) / 0.4)) * (1 - clearing));
            fade(parts.asides[1], ease(clamp((at - 3.35) / 0.3)));

            parts.counts.forEach((badge, k) => fade(badge, ease(clamp((at - 4 - k * 0.12) / 0.4))));

            /* Scrolling, one written line at a time in one slot, each gone
               before the next arrives; standing still, the two answers stacked
               and the question on its own dropped. */
            parts.working.classList.toggle("scale__working--single", !still);
            if (still) {
                fade(parts.lines[0], 1);
                fade(parts.lines[1], 1);
                fade(parts.lines[1].answer, 1);
                return;
            }
            fade(parts.lines[0], ease(clamp((at - 2.4) / 0.4)) * (1 - ease(clamp((at - 3) / 0.25))));
            fade(parts.lines[1], ease(clamp((at - 3.3) / 0.3)));
            fade(parts.lines[1].answer, ease(clamp((at - 4.25) / 0.35)));
        }
    };

    const PAINTERS = { repeat: repeatPainter, ladder: ladderPainter, share: sharePainter };

    /* --------------------------------------------------------------- engine */

    const createScene = (scene) => {
        const sticky = scene.querySelector(".prod-scene__sticky");
        /* The card is moved into the body while it is pinned, so a second
           initialisation would find the scene empty. Better to do nothing than
           to tear down a card the reader is already looking at. */
        if (!sticky) return null;

        const painter = PAINTERS[scene.dataset.scene || "repeat"];
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
                dot.className = "prod-scene__dot";
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

       The same arrows, multiplied by hand. Multiplying by 3 lays three copies
       of the arrow above, tip to tail; multiplying by −3 lays three copies of it
       turned round. So every row is the row above it repeated, and the running
       answer is where the last copy finishes. A number whose arrow would run off
       the end of the line is unavailable rather than refused after the fact. */

    const buildFactors = () => {
        const host = document.querySelector("[data-factors]");
        if (!host) return;
        /* The card carries a worked product for a reader without JavaScript;
           the sandbox takes its place. */
        host.replaceChildren();

        const MIN = -24;
        const MAX = 24;
        const VALUES = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
        const LIMIT = 4;

        const track = el("div", "scale__track");
        /* Fixed at its tallest, so a row arriving never moves the page. */
        track.style.height = `${trackHeight(LIMIT)}px`;
        const { place, setup } = buildLine(track, MIN, MAX, 8, 2);
        setup.forEach((node) => fade(node, 1));
        const marker = el("i", "scale__marker");
        marker.style.left = `${place(0)}%`;
        fade(marker, 1);
        track.append(marker);

        const board = el("div", "factors__board");
        /* The drawing is a visual construction: read straight through, an axis
           is a run of digits. The written line below carries the whole meaning
           and is announced, so the board itself is hidden. */
        board.setAttribute("aria-hidden", "true");
        board.append(track);

        const reading = el("p", "factors__reading");
        reading.setAttribute("aria-live", "polite");

        const tileGroup = el("div", "factors__tiles");
        tileGroup.setAttribute("role", "group");
        tileGroup.setAttribute("aria-label", "The numbers to multiply by");
        const actions = el("div", "factors__actions");

        let terms = [];
        let rows = [];

        const running = (upTo) => terms.slice(0, upTo).reduce((product, value) => product * value, 1);

        const tiles = VALUES.map((value) => {
            const button = el("button", "factors__tile", signed(value));
            button.setAttribute("type", "button");
            button.setAttribute("aria-label", value < 0 ? `negative ${Math.abs(value)}` : String(value));
            button.addEventListener("click", () => {
                if (button.disabled) return;
                terms.push(value);
                render();
            });
            tileGroup.append(button);
            return { value, button };
        });

        const undo = el("button", "factors__action", "Take the last number off");
        undo.setAttribute("type", "button");
        undo.addEventListener("click", () => { terms.pop(); render(); });
        const clear = el("button", "factors__action", "Start again");
        clear.setAttribute("type", "button");
        clear.addEventListener("click", () => { terms = []; render(); });
        actions.append(undo, clear);

        const controls = el("div", "factors__controls");
        controls.append(tileGroup, actions);
        host.append(board, reading, controls);

        function render() {
            rows.forEach((row) => [row.riser, row.shaft, row.head, row.term].forEach((n) => n.remove()));
            rows = [];

            terms.forEach((value, index) => {
                const before = index === 0 ? 0 : running(index);
                const after = running(index + 1);
                /* The first number is one arrow from zero; every number after it
                   repeats the arrow above, once for each unit of its size, and
                   turns those copies round if it is negative. */
                const copies = index === 0 ? 1 : Math.abs(value);
                const each = after / copies;
                const top = rowTop(index);
                const from = index === 0 ? LINE_Y : rowTop(index - 1);
                for (let copy = 0; copy < copies; copy += 1) {
                    const row = buildRow(track, top, from);
                    rows.push(row);
                    const width = drawRow(row, {
                        anchor: each * copy,
                        start: each * copy,
                        far: each * (copy + 1),
                        /* One drop line for the row, standing where the arrow
                           being copied reached. */
                        riser: copy === 0 ? before : null,
                        label: copy === 0
                            ? (index === 0 ? signed(value) : `${TIMES} ${bracketed(value)}`)
                            : null,
                        labelAt: after / 2
                    }, place, 1);
                    showRow(row, 1, width);
                }
            });

            const product = terms.length ? running(terms.length) : 0;
            marker.style.left = `${place(product)}%`;
            reading.textContent = terms.length < 2
                ? (terms.length ? signed(terms[0]) : "")
                : `${bracketed(terms[0])} ${terms.slice(1).map((v) => `${TIMES} ${bracketed(v)}`).join(" ")} = ${signed(product)}`;

            tiles.forEach(({ value, button }) => {
                const would = (terms.length ? product : 1) * value;
                button.disabled = terms.length >= LIMIT || would < MIN || would > MAX;
            });
            undo.disabled = terms.length === 0;
            clear.disabled = terms.length === 0;
        }

        render();
    };

    const scenes = Array.from(document.querySelectorAll("[data-prod-scene]"))
        .map(createScene)
        .filter(Boolean);

    buildFactors();

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
