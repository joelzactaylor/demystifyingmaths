/* Factors and factor pairs.

   Two figures on a number line, and the engine that drives them.

   A factor pair is two places on the line that multiply to the number, so the
   line is where it is drawn: each pair is an arc joining its two ends, and the
   arcs nest inward as the trials climb. The first figure runs 24 until the
   arcs run out; the second runs 36 until an arc has nowhere left to go and
   closes on a single point, which is the whole of why a square number counts
   an odd number of factors.

   Positions are read from numbers rather than from the document, so nothing
   here measures the page. */

document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
    const ease = (v) => {
        const x = clamp(v);
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    };
    const SVG = "http://www.w3.org/2000/svg";
    const TIMES = "×";

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };
    const svgEl = (tag, className) => {
        const node = document.createElementNS(SVG, tag);
        if (className) node.setAttribute("class", className);
        return node;
    };
    const writeCaption = (node, text) => {
        if (node && node.textContent !== text) node.textContent = text;
    };

    /* The line is drawn in its own units and scaled by the viewBox, so the
       figure does not depend on how wide the card happens to be. */
    const W = 700;
    const H = 152;
    const AXIS = 118;
    const LEFT = 22;
    const RIGHT = W - 22;
    /* Where a number is written under the line it names. */
    const LABEL_Y = AXIS + 25;

    /* THE SHAPE OF AN ARC.

       A pair's arc has to sit strictly inside the arc of every wider pair, or
       the figure says the opposite of what the page does. Two things decide
       whether it does.

       The height falls with the width, but slowly: at ARC_FALL = 0.55 the
       narrowest pair still gets a quarter of the tallest arc's height, where
       falling in proportion would have flattened it onto the line.

       The profile is a half-ellipse rather than a hump. A hump leaves its end
       of the line almost flat, so a wide arc is still low where a narrow one is
       already at its tallest, and the two cross — which is what used to bunch
       the arcs together over the low numbers. An ellipse climbs away from its
       end at once, so a wider pair is clear of a narrower one everywhere. The
       4/3 on the controls is what puts the apex at exactly ARC height; the
       shoulder pulls them in off the ends, so the climb is steep rather than
       vertical. */
    const ARC_MAX = 98;
    const ARC_FALL = 0.55;
    const SHOULDER = 0.06;

    /* The pair that is one place twice has no arc, so its mark on the line is
       drawn larger than the rest. */
    const POINT_R = 7;

    const MODELS = {
        "twenty-four": {
            n: 24,
            pairs: [[1, 24], [2, 12], [3, 8], [4, 6]],
            /* Trials that join nothing, crossed out where they stand. `from`
               is the stage each is written at. */
            crossed: [{ at: 5, from: 5 }],
            stages: [
                { title: "The numbers 1 to 24", copy: "A factor pair is two places on this line whose product is 24." },
                { title: "1 and 24", copy: "1 × 24 = 24, so the widest arc on the line joins the first factor to the last." },
                { title: "2 and 12", copy: "2 × 12 = 24. The next arc sits inside the first, because both ends have moved inward." },
                { title: "3 and 8", copy: "3 × 8 = 24, and the arcs keep nesting as the trials climb." },
                { title: "4 and 6", copy: "4 × 6 = 24 is the narrowest arc there is. The two ends have almost met." },
                { title: "5 has nowhere to go", copy: "24 ÷ 5 leaves 4 over, so 5 joins nothing, and 5 × 5 = 25 is already past 24, so no trial above it can either." }
            ]
        },
        "thirty-six": {
            n: 36,
            pairs: [[1, 36], [2, 18], [3, 12], [4, 9], [6, 6]],
            /* 5 divides nothing here either, and unlike 24 it falls in the
               middle of the run rather than at the end of it, so the line
               has to say so where the reader meets it. */
            crossed: [{ at: 5, from: 4 }],
            stages: [
                { title: "The numbers 1 to 36", copy: "36 is a square number, and that changes how this line ends." },
                { title: "1 and 36", copy: "1 × 36 = 36, the widest arc on the line." },
                { title: "2 and 18", copy: "2 × 18 = 36, nesting inside the first." },
                { title: "3 and 12", copy: "3 × 12 = 36, nesting inside again as both ends move inward." },
                { title: "4 and 9, then nothing at 5", copy: "4 × 9 = 36. But 36 ÷ 5 leaves 1 over, so 5 has no whole number to pair with and no arc to draw." },
                { title: "6 is its own partner", copy: "6 × 6 = 36, so the last arc has nowhere to travel and closes on a single point." }
            ]
        }
    };

    const painter = {
        read: (scene) => MODELS[scene.dataset.number] || null,

        stages: (model) => model.stages.length - 1,

        build(board, model) {
            board.replaceChildren();
            const figure = el("div", "fline");
            const svg = svgEl("svg", "fline__svg");
            svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
            svg.setAttribute("aria-hidden", "true");
            svg.setAttribute("focusable", "false");

            const at = (value) => LEFT + ((value - 1) / (model.n - 1)) * (RIGHT - LEFT);

            const axis = svgEl("line", "fline__axis");
            axis.setAttribute("x1", LEFT); axis.setAttribute("x2", RIGHT);
            axis.setAttribute("y1", AXIS); axis.setAttribute("y2", AXIS);
            svg.appendChild(axis);

            /* A tick for every whole number, so the arcs are plainly joining
               places on the line rather than floating above it. Every tick is
               the same: drawing the factors taller would hand the reader the
               answer before a single trial had been made. */
            for (let v = 1; v <= model.n; v += 1) {
                const tick = svgEl("line", "fline__tick");
                tick.setAttribute("x1", at(v)); tick.setAttribute("x2", at(v));
                tick.setAttribute("y1", AXIS); tick.setAttribute("y2", AXIS + 6);
                svg.appendChild(tick);
            }

            const widest = at(model.pairs[0][1]) - at(model.pairs[0][0]);
            const deepest = Math.max(1, model.pairs.length - 1);
            const arcs = model.pairs.map(([a, b], depth) => {
                const x1 = at(a), x2 = at(b);
                const span = x2 - x1;
                const group = svgEl("g", "fline__pair");
                /* 0 on the widest arc and 1 on the narrowest. The stylesheet
                   darkens the stroke along it, so the nesting is readable in
                   one glance rather than traced arc by arc. */
                group.style.setProperty("--tone", (depth / deepest).toFixed(3));
                if (span < 1) {
                    /* No distance to cross, so there is no arc to draw. The pair
                       is the one place on the line its two ends share, and that
                       place is all that marks it. */
                    group.dataset.kind = "point";
                } else {
                    const lift = ARC_MAX * Math.pow(span / widest, ARC_FALL);
                    const top = AXIS - (4 * lift) / 3;
                    const shoulder = SHOULDER * span;
                    const path = svgEl("path", "fline__arc");
                    path.setAttribute("d",
                        `M ${x1} ${AXIS} C ${x1 + shoulder} ${top} ${x2 - shoulder} ${top} ${x2} ${AXIS}`);
                    path.setAttribute("pathLength", "1");
                    group.appendChild(path);
                    group.dataset.kind = "arc";
                }
                [a, b].forEach((value, i) => {
                    if (i === 1 && span < 1) return;
                    const x = at(value);
                    const mark = svgEl("circle", "fline__dot");
                    mark.setAttribute("cx", x); mark.setAttribute("cy", AXIS);
                    /* The pair with no width carries a larger mark, because the
                       place is the whole of what there is to see. */
                    mark.setAttribute("r", span < 1 ? POINT_R : 5);
                    const label = svgEl("text", "fline__label");
                    label.setAttribute("x", x); label.setAttribute("y", LABEL_Y);
                    label.textContent = String(value);
                    group.appendChild(mark); group.appendChild(label);
                });
                svg.appendChild(group);
                return group;
            });

            const crossed = (model.crossed || []).map((mark) => {
                const group = svgEl("g", "fline__stop");
                const x = at(mark.at);
                [[-6, 6], [6, -6]].forEach(([dx1, dx2]) => {
                    const stroke = svgEl("line", "fline__cross");
                    stroke.setAttribute("x1", x + dx1); stroke.setAttribute("x2", x + dx2);
                    stroke.setAttribute("y1", AXIS - 7); stroke.setAttribute("y2", AXIS + 7);
                    group.appendChild(stroke);
                });
                const label = svgEl("text", "fline__label fline__label--stop");
                label.setAttribute("x", x); label.setAttribute("y", LABEL_Y);
                label.textContent = String(mark.at);
                group.appendChild(label);
                svg.appendChild(group);
                return { group, from: mark.from };
            });

            figure.appendChild(svg);

            /* The trial each arc records. The last is written into the element
               and the rest are drawn by the stylesheet, so a stripped page
               reads one true statement rather than every trial at once. */
            const line = el("p", "fline__trial");
            const faces = model.pairs.map(([a, b], i) => {
                const text = `${a} ${TIMES} ${b} = ${model.n}`;
                if (i === model.pairs.length - 1) return el("span", "fline__face", text);
                const face = el("span", "fline__face fline__face--from");
                face.setAttribute("data-face", text);
                face.setAttribute("aria-hidden", "true");
                return face;
            });
            line.append(...faces);
            figure.appendChild(line);

            board.appendChild(figure);
            return { figure, arcs, crossed, faces, model };
        },

        measure() { /* the figure is drawn in its own units; nothing is read from the page */ },

        caption: (model, index) => model.stages[Math.min(index, model.stages.length - 1)],

        still(parts) { this.place(parts, parts.model.stages.length - 1, 1); },

        place(parts, index, t) {
            const shown = index - 1 + t;
            parts.arcs.forEach((group, i) => {
                const grown = clamp(shown - i);
                group.style.opacity = clamp(grown * 3).toFixed(3);
                /* 1 while this arc is being written and for its own stage
                   after, then off as the next one takes over. The stylesheet
                   weights the stroke by it, so the newest trial is the one the
                   eye lands on and the settled ones stay as context. */
                group.style.setProperty("--fresh", clamp(1 - (shown - (i + 1))).toFixed(3));
                const path = group.querySelector(".fline__arc");
                if (path) path.style.strokeDashoffset = String(1 - grown);
            });
            parts.crossed.forEach(({ group, from }) => {
                group.style.opacity = clamp(shown - (from - 1)).toFixed(3);
            });
            parts.faces.forEach((face, i) => {
                face.style.opacity = clamp(1 - Math.abs(shown - (i + 1)) * 1.5).toFixed(3);
            });
        },

        /* The board rests at the state its caption names, and moves into it out
           of the one before. */
        paint(parts, model, index, within) { this.place(parts, index, ease(clamp(within))); }
    };

    /* --------------------------------------------------------------- engine */

    const createScene = (scene) => {
        const sticky = scene.querySelector(".factor-scene__sticky");
        if (!sticky) return null;
        const model = painter.read(scene);
        if (!model) return null;

        const board = scene.querySelector("[data-board]");
        const stepTitle = scene.querySelector("[data-step-title]");
        const stepCopy = scene.querySelector("[data-step-copy]");
        const progressBar = scene.querySelector("[data-progress]");

        const paceVh = 52;
        const pacePx = 400;
        /* A stage spends the first part of its scroll moving and the rest of it
           holding still, so one step can be read before the next starts. */
        const action = 0.6;

        let parts = null;
        let totalStages = painter.stages(model);
        let stage = -1;
        let cardHeight = sticky.offsetHeight;

        const paint = (position) => {
            const index = Math.min(totalStages, Math.floor(position));
            const within = clamp(clamp(position - index) / action);
            if (index !== stage) {
                stage = index;
                const caption = painter.caption(model, index);
                writeCaption(stepTitle, caption.title);
                writeCaption(stepCopy, caption.copy);
                Array.from(progressBar.children).forEach((dot, i) => {
                    dot.classList.toggle("is-past", i < index);
                    dot.classList.toggle("is-current", i === index);
                });
            }
            painter.paint(parts, model, index, within);
        };

        const render = (progress) => paint(clamp(progress) * (totalStages + 1));

        progressBar.replaceChildren(...Array.from({ length: totalStages + 1 }, () => {
            const dot = document.createElement("i");
            dot.className = "factor-scene__dot";
            return dot;
        }));
        scene.style.setProperty("--scene-height", `${(totalStages + 1) * paceVh}vh`);
        scene.style.setProperty("--scene-min-height", `${(totalStages + 1) * pacePx}px`);
        scene.classList.add("is-ready");
        parts = painter.build(board, model);

        const dock = (offset = 0) => {
            if (sticky.parentNode !== scene) scene.insertBefore(sticky, scene.firstChild);
            sticky.classList.remove("is-pinned");
            ["left", "width", "height", "transform"].forEach((p) => sticky.style.removeProperty(p));
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
            const rect = scene.getBoundingClientRect();
            const visualScale = scene.offsetWidth && rect.width ? rect.width / scene.offsetWidth : 1;
            return {
                rect, visualScale,
                pinTop: Math.max(16, (window.innerHeight - cardHeight * visualScale) / 2),
                travel: Math.max(1, scene.offsetHeight - cardHeight)
            };
        };

        let ticking = false;
        const update = () => {
            ticking = false;
            if (!parts) return;
            if (reduceMotion.matches) { dock(0); render(1); painter.still(parts); return; }
            const { rect, visualScale, pinTop, travel } = geometry();
            const distance = pinTop - rect.top;
            const visualTravel = travel * visualScale;
            if (distance <= 0) { dock(0); render(0); }
            else if (distance >= visualTravel) { dock(travel); render(1); }
            else { pin(rect.left, pinTop, scene.offsetWidth, visualScale); render(distance / visualTravel); }
        };
        const requestUpdate = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        };

        cardHeight = sticky.offsetHeight;
        update();
        return { requestUpdate, reset: () => { dock(0); cardHeight = sticky.offsetHeight; stage = -1; requestUpdate(); } };
    };

    const scenes = Array.from(document.querySelectorAll("[data-factor-scene]"))
        .map(createScene)
        .filter(Boolean);

    if (scenes.length) {
        const request = () => scenes.forEach((s) => s.requestUpdate());
        const reset = () => scenes.forEach((s) => s.reset());
        window.addEventListener("scroll", request, { passive: true });
        window.addEventListener("resize", reset);
        if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", reset);
        window.addEventListener("load", reset);
    }
});
