/* Directed number, drawn as arrows.

   Every number is an arrow: 6 runs six units right, −4 runs four units left,
   and the first one starts at zero. Adding lays the next arrow tip to tail, so
   the running total moves to its tip. Subtracting lays it tip to tip against
   the total so far, and the answer is where its tail lands — which is why
   subtracting a negative moves right without any rule being announced. The
   arrows are straight and parallel, stacked one row below the next, so a
   calculation reads as a column of moves rather than a tangle of curves.

   The page stays a normal document. A scroll-led card supplies its own scroll
   distance, JavaScript pins it inside that, and the scroll position drives the
   drawing continuously; nothing is toggled on. The sandbox is not scroll-led —
   it is built by pressing, and it writes out whatever it has been given.

   Two scenes share the scroll engine, named in data-scene:

   "chain" lays −4 + 6 − 5 out arrow by arrow.
   "gap"   stands the scale upright and measures the span between two
           temperatures, because a difference is a distance. */

document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const ease = (value) => {
        const x = clamp(value);
        return x * x * (3 - 2 * x);
    };
    const lerp = (from, to, amount) => from + (to - from) * amount;

    const MINUS = "−";
    const COUNT = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
    const Count = (n) => COUNT[n].charAt(0).toUpperCase() + COUNT[n].slice(1);

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

       One geometry, used by the worked scene and by the sandbox, so the two are
       the same drawing with different numbers in it. Every position is a
       percentage of the line's span, so nothing here is measured and nothing
       shifts when a webfont arrives late. */

    const LINE_Y = 28;      /* the rule the numbers stand on */
    const ROW_TOP = 62;     /* the first arrow row, clear of the ticks */
    const ROW_STEP = 30;

    const trackHeight = (rows) => ROW_TOP + Math.max(0, rows - 1) * ROW_STEP + 14;

    /* What each arrow does. Adding puts the tail on the running total and the
       tip on the answer; subtracting puts the tip on the running total and the
       tail on the answer. Either way the arrow grows away from the total it was
       laid against, which is what the drawing animates. */
    const layOut = (terms, fromZero) => {
        let total = 0;
        return terms.map((term, index) => {
            const before = total;
            total = term.op === MINUS ? total - term.value : total + term.value;
            return {
                op: term.op,
                value: term.value,
                anchor: before,
                far: total,
                /* The tip belongs to the arrow, so it follows the value's
                   sign; which end it is laid against follows the operation. */
                tipAtAnchor: term.op === MINUS,
                rightward: term.value > 0,
                /* An arrow is labelled the way its term is written in the line
                   underneath: the sandbox starts from a written zero, so every
                   arrow there carries an operation, while a worked calculation
                   opens on the number itself. */
                label: (!fromZero && index === 0 && term.op === "+")
                    ? signed(term.value)
                    : `${term.op} ${bracketed(term.value)}`
            };
        });
    };

    const totalOf = (terms) => terms.reduce(
        (running, term) => (term.op === MINUS ? running - term.value : running + term.value), 0);

    /* The sandbox writes "0 + 3 − (−2) = 5": the leading zero is where its
       first arrow starts, and the reader may well start by subtracting, so it
       is written rather than assumed. A worked calculation is written the way
       it is written in the prose — "−4 + 6 − 5 = −3" — because there the first
       arrow simply is the starting number. */
    const transcribe = (terms, fromZero) => {
        if (!terms.length) return "0";
        const parts = terms.map((t) => `${t.op} ${bracketed(t.value)}`);
        const head = (fromZero || terms[0].op === MINUS)
            ? "0 " + parts.join(" ")
            : [signed(terms[0].value)].concat(parts.slice(1)).join(" ");
        return `${head} = ${signed(totalOf(terms))}`;
    };

    const buildLine = (track, min, max, labelEvery) => {
        const setup = [];
        const place = (value) => (value - min) / (max - min) * 100;
        const rule = el("i", "chain__rule");
        track.append(rule);
        setup.push(rule);
        for (let value = min; value <= max; value += 1) {
            const tick = el("i", value === 0 ? "chain__tick chain__tick--zero" : "chain__tick");
            tick.style.left = `${place(value)}%`;
            track.append(tick);
            setup.push(tick);
            if ((value - min) % labelEvery) continue;
            const label = el("span",
                value === 0 ? "chain__label chain__label--zero"
                    : value < 0 ? "chain__label chain__label--negative" : "chain__label",
                signed(value));
            label.style.left = `${place(value)}%`;
            track.append(label);
            setup.push(label);
        }
        return { place, setup };
    };

    const buildRow = (track, index) => {
        const top = ROW_TOP + index * ROW_STEP;
        const previousY = index === 0 ? LINE_Y : ROW_TOP + (index - 1) * ROW_STEP;
        const link = el("i", "chain__link");
        link.style.top = `${previousY}px`;
        link.style.height = `${top - previousY}px`;
        const shaft = el("i", "chain__shaft");
        shaft.style.top = `${top}px`;
        const head = el("i", "chain__head");
        head.style.top = `${top - 3}px`;
        const term = el("span", "chain__term");
        term.style.top = `${top - 20}px`;
        track.append(link, shaft, head, term);
        return { link, shaft, head, term, top };
    };

    /* Draw one arrow `amount` of the way out from the total it was laid
       against. The tip rides the growing end when the arrow is being added
       and stays on the anchor when it is being subtracted, because that is
       where its tip actually is. */
    const drawRow = (row, spec, place, amount) => {
        const anchor = place(spec.anchor);
        const reached = lerp(anchor, place(spec.far), amount);
        const left = Math.min(anchor, reached);
        const width = Math.abs(reached - anchor);
        row.shaft.style.left = `${left}%`;
        row.shaft.style.width = `${width}%`;
        row.shaft.classList.toggle("chain__shaft--back", !spec.rightward);

        const tip = spec.tipAtAnchor ? anchor : reached;
        row.head.classList.toggle("chain__head--left", !spec.rightward);
        row.head.classList.toggle("chain__head--right", spec.rightward);
        row.head.style.left = spec.rightward ? `calc(${tip}% - 9px)` : `${tip}%`;

        row.link.style.left = `calc(${anchor}% - 1px)`;
        row.term.textContent = spec.label;
        row.term.style.left = `${left + width / 2}%`;
    };

    /* ---------------------------------------------- a calculation, laid out */

    const CHAIN_TERMS = [{ op: "+", value: -4 }, { op: "+", value: 6 }, { op: MINUS, value: 5 }];

    const chainPainter = {
        read: () => ({ terms: CHAIN_TERMS.slice(), min: -8, max: 8 }),

        stages: (model) => model.terms.length - 1,

        heading: (model, node) => { node.textContent = transcribe(model.terms, false); },

        build(board, model) {
            board.replaceChildren();
            const figure = el("div", "chain");
            const track = el("div", "chain__track");
            track.style.height = `${trackHeight(model.terms.length)}px`;
            const { place, setup } = buildLine(track, model.min, model.max, 2);

            const specs = layOut(model.terms, false);
            const rows = specs.map((unused, index) => buildRow(track, index));
            const marker = el("i", "chain__marker");
            track.append(marker);

            figure.append(track);
            board.append(figure);
            return { track, place, setup, specs, rows, marker };
        },

        caption(model, index) {
            const specs = layOut(model.terms, false);
            return [
                {
                    title: "The first arrow",
                    copy: `${signed(specs[0].value)} is an arrow ${COUNT[Math.abs(specs[0].value)]} units long, drawn from zero and pointing left.`
                },
                {
                    title: "Adding lays it tip to tail",
                    copy: `The ${specs[1].value} starts where the ${signed(specs[0].far)} finished and runs ${COUNT[specs[1].value]} units to the right, so the total moves to ${signed(specs[1].far)}.`
                },
                {
                    title: "Subtracting lays it tip to tip",
                    copy: `The arrow for ${specs[2].value} is laid tip first, its tip on ${signed(specs[1].far)}, so its tail reaches back to ${signed(specs[2].far)}.`
                }
            ][clamp(index, 0, 2)];
        },

        paint(parts, model, index, within) {
            const at = index + within;
            const arriving = ease(clamp(at / 0.4));
            parts.setup.forEach((node) => fade(node, arriving));

            let total = 0;
            parts.specs.forEach((spec, row) => {
                const amount = ease(clamp(at - row));
                drawRow(parts.rows[row], spec, parts.place, amount);
                const shown = arriving * ease(clamp((at - row) / 0.25));
                fade(parts.rows[row].shaft, shown);
                fade(parts.rows[row].head, shown);
                fade(parts.rows[row].link, shown);
                fade(parts.rows[row].term, arriving * ease(clamp((at - row - 0.55) / 0.35)));
                if (amount > 0) total = lerp(spec.anchor, spec.far, amount);
            });

            parts.marker.style.left = `${parts.place(total)}%`;
            fade(parts.marker, arriving);
        }
    };

    /* ------------------------------------------- measuring a difference */

    const gapPainter = {
        read: () => ({ cold: -6, warm: 4, min: -8, max: 6 }),

        stages: () => 4,

        heading: (model, node) => {
            node.textContent = `${signed(model.cold)}°C to ${signed(model.warm)}°C`;
        },

        build(board, model) {
            board.replaceChildren();
            const figure = el("div", "line-gap");
            const column = el("div", "line-column");
            const HEIGHT = 250;
            const y = (value) => (model.max - value) / (model.max - model.min) * HEIGHT;

            const setup = [];
            const rule = el("i", "line-column__rule");
            setup.push(rule);
            column.append(rule);
            for (let value = model.min; value <= model.max; value += 1) {
                const tick = el("i", value === 0 ? "line-column__tick line-column__tick--zero" : "line-column__tick");
                tick.style.top = `${y(value)}px`;
                column.append(tick);
                setup.push(tick);
                if (value % 2 !== 0) continue;
                const label = el("span",
                    value === 0 ? "line-column__label line-column__label--zero"
                        : value < 0 ? "line-column__label line-column__label--negative" : "line-column__label",
                    signed(value));
                label.style.top = `${y(value)}px`;
                column.append(label);
                setup.push(label);
            }

            const coldReading = el("span", "line-column__reading line-column__reading--cold", `${signed(model.cold)}°C`);
            coldReading.style.top = `${y(model.cold)}px`;
            const warmReading = el("span", "line-column__reading", `${signed(model.warm)}°C`);
            warmReading.style.top = `${y(model.warm)}px`;

            const spanLow = el("i", "line-column__span line-column__span--low");
            const spanHigh = el("i", "line-column__span");
            const lowCap = el("i", "line-column__cap");
            lowCap.style.top = `${y(model.cold)}px`;
            const highCap = el("i", "line-column__cap");
            highCap.style.top = `${y(model.warm)}px`;
            const amount = el("span", "line-column__amount", `${model.warm - model.cold}°`);
            amount.style.top = `${(y(model.cold) + y(model.warm)) / 2}px`;

            column.append(spanLow, spanHigh, lowCap, highCap, coldReading, warmReading, amount);

            const working = el("div", "line-gap__working");
            const total = el("p", "line-statement",
                `${signed(model.warm)} ${MINUS} (${signed(model.cold)}) = ${model.warm} + ${Math.abs(model.cold)} = ${model.warm - model.cold}`);
            working.append(total);

            figure.append(column, working);
            board.append(figure);

            return { column, spanLow, spanHigh, lowCap, highCap, coldReading, warmReading,
                amount, total, setup, y, height: HEIGHT };
        },

        caption(model, index) {
            return [
                {
                    title: "The colder reading",
                    copy: `${signed(model.cold)}°C stands ${COUNT[Math.abs(model.cold)]} degrees below zero.`
                },
                {
                    title: "The warmer reading",
                    copy: `${signed(model.warm)}°C stands ${COUNT[model.warm]} degrees above it.`
                },
                {
                    title: "Up to zero",
                    copy: `The first part of the rise reaches zero, ${COUNT[Math.abs(model.cold)]} degrees up.`
                },
                {
                    title: "And beyond it",
                    copy: `The second part carries on above zero, ${COUNT[model.warm]} degrees further.`
                },
                {
                    title: `${Count(model.warm - model.cold)} degrees in all`,
                    copy: "The two parts together measure the whole rise."
                }
            ][clamp(index, 0, 4)];
        },

        paint(parts, model, index, within) {
            const at = index + within;
            const yCold = parts.y(model.cold);
            const yWarm = parts.y(model.warm);
            const yZero = parts.y(0);

            parts.setup.forEach((node) => fade(node, ease(clamp(at / 0.4))));
            fade(parts.coldReading, ease(clamp(at / 0.45)));
            fade(parts.lowCap, ease(clamp((at - 2) / 0.4)));
            fade(parts.warmReading, ease(clamp((at - 1) / 0.45)));
            fade(parts.highCap, ease(clamp((at - 3.6) / 0.4)));

            /* Two segments rather than one bar: the part below zero grows across
               stage 2 and the part above it across stage 3, so the six and the
               four are seen as separate lengths that add. */
            const toZero = ease(clamp(at - 2));
            const beyond = ease(clamp(at - 3));
            const lowReached = lerp(yCold, yZero, toZero);
            parts.spanLow.style.top = `${lowReached}px`;
            parts.spanLow.style.height = `${Math.abs(yCold - lowReached)}px`;
            fade(parts.spanLow, ease(clamp((at - 2) / 0.3)));

            const highReached = lerp(yZero, yWarm, beyond);
            parts.spanHigh.style.top = `${highReached}px`;
            parts.spanHigh.style.height = `${Math.abs(yZero - highReached)}px`;
            fade(parts.spanHigh, ease(clamp((at - 3) / 0.3)));

            fade(parts.amount, ease(clamp((at - 4) / 0.4)));
            rise(parts.total, ease(clamp((at - 4.2) / 0.4)));
        }
    };

    const PAINTERS = { chain: chainPainter, gap: gapPainter };

    /* --------------------------------------------------------------- engine */

    const createScene = (scene) => {
        const sticky = scene.querySelector(".line-scene__sticky");
        /* The card is moved into the body while it is pinned, so a second
           initialisation would find the scene empty. Better to do nothing than
           to tear down a card the reader is already looking at. */
        if (!sticky) return null;

        const painter = PAINTERS[scene.dataset.scene || "chain"];
        if (!painter) return null;

        const board = scene.querySelector("[data-board]");
        const stepTitle = scene.querySelector("[data-step-title]");
        const stepCopy = scene.querySelector("[data-step-copy]");
        const progressBar = scene.querySelector("[data-progress]");
        const heading = scene.querySelector("[data-heading]");

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
            const eased = ease(within);

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
            painter.paint(parts, model, index, within, eased, totalStages, through);
        };

        const buildDots = () => {
            progressBar.replaceChildren(...Array.from({ length: totalStages + 1 }, () => {
                const dot = document.createElement("i");
                dot.className = "line-scene__dot";
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
            if (heading && painter.heading) painter.heading(model, heading);

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

       The same arrows, laid by hand. A number is chosen and then added or
       subtracted, its arrow joins the stack, and the line underneath says what
       the stack now means. A tile whose arrow would run off the end of the line
       is unavailable rather than refused after the fact. */

    const buildArrows = () => {
        const host = document.querySelector("[data-arrows]");
        if (!host) return;
        /* The card carries a worked statement for a reader without
           JavaScript; the sandbox takes its place. */
        host.replaceChildren();

        const MIN = -12;
        const MAX = 12;
        const VALUES = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
        const LIMIT = 6;

        const track = el("div", "chain__track");
        const { place, setup } = buildLine(track, MIN, MAX, 2);
        setup.forEach((node) => fade(node, 1));
        const marker = el("i", "chain__marker");
        marker.style.left = `${place(0)}%`;
        fade(marker, 1);
        track.append(marker);

        const board = el("div", "arrows__board");
        /* The drawing is a visual construction: read straight through, an axis
           is a run of digits. The written line below carries the whole meaning
           and is announced, so the board itself is hidden. */
        board.setAttribute("aria-hidden", "true");
        board.append(track);

        const reading = el("p", "arrows__reading");
        reading.setAttribute("aria-live", "polite");

        const opGroup = el("div", "arrows__ops");
        opGroup.setAttribute("role", "group");
        opGroup.setAttribute("aria-label", "Add or subtract the next arrow");
        const tileGroup = el("div", "arrows__tiles");
        tileGroup.setAttribute("role", "group");
        tileGroup.setAttribute("aria-label", "The number the next arrow stands for");
        const actions = el("div", "arrows__actions");

        let terms = [];
        let armed = "+";
        let rows = [];

        const opButtons = ["+", MINUS].map((op) => {
            const button = el("button", "arrows__op", op);
            button.setAttribute("type", "button");
            button.setAttribute("aria-pressed", "false");
            button.setAttribute("aria-label", op === "+" ? "Add the next arrow" : "Subtract the next arrow");
            button.addEventListener("click", () => { armed = op; render(); });
            opGroup.append(button);
            return { op, button };
        });

        const tiles = VALUES.map((value) => {
            const button = el("button", "arrows__tile", signed(value));
            button.setAttribute("type", "button");
            button.addEventListener("click", () => {
                if (button.disabled) return;
                terms.push({ op: armed, value });
                render();
            });
            tileGroup.append(button);
            return { value, button };
        });

        const undo = el("button", "arrows__action", "Take the last arrow off");
        undo.setAttribute("type", "button");
        undo.addEventListener("click", () => { terms.pop(); render(); });
        const clear = el("button", "arrows__action", "Start again from zero");
        clear.setAttribute("type", "button");
        clear.addEventListener("click", () => { terms = []; render(); });
        actions.append(undo, clear);

        const controls = el("div", "arrows__controls");
        controls.append(opGroup, tileGroup, actions);
        host.append(board, reading, controls);

        function render() {
            rows.forEach((row) => [row.link, row.shaft, row.head, row.term].forEach((n) => n.remove()));
            rows = terms.map((unused, index) => buildRow(track, index));
            layOut(terms, true).forEach((spec, index) => {
                drawRow(rows[index], spec, place, 1);
                [rows[index].link, rows[index].shaft, rows[index].head, rows[index].term]
                    .forEach((n) => fade(n, 1));
            });
            track.style.height = `${trackHeight(Math.max(terms.length, 1))}px`;

            const total = totalOf(terms);
            marker.style.left = `${place(total)}%`;
            reading.textContent = transcribe(terms, true);

            opButtons.forEach(({ op, button }) => {
                button.classList.toggle("is-armed", op === armed);
                button.setAttribute("aria-pressed", String(op === armed));
            });
            tiles.forEach(({ value, button }) => {
                const would = armed === MINUS ? total - value : total + value;
                button.disabled = terms.length >= LIMIT || would < MIN || would > MAX;
            });
            undo.disabled = terms.length === 0;
            clear.disabled = terms.length === 0;
        }

        render();
    };

    const scenes = Array.from(document.querySelectorAll("[data-line-scene]"))
        .map(createScene)
        .filter(Boolean);

    buildArrows();

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
