/* HCF and LCM from a Venn diagram: a scroll-led two-circle scene for 84 and
   90, and a scroll-led three-circle scene for 24, 60 and 90. Each number's
   prime factors are listed on a scrap of paper beside the circles. One factor
   at a time, a pen stroke crosses it off and the numeral lifts off the paper
   into the region it belongs in — a prime on more than one list is crossed
   off every list it is on and its copies converge into a single chip in the
   overlap, so "counted once, belongs to both" is drawn rather than said.
   Shared primes are placed first, then what is left. Every overlap region —
   the two-circle lens and the three-circle centre — is a real SVG path built
   from the circles' own intersection points.

   Timing: a scene has more steps than captions. `captionOf[step]` maps each
   timed step to the caption it belongs to, so a caption can span several
   crossings, each with its own stationary interval. */

document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const SVG = "http://www.w3.org/2000/svg";
    const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
    const ease = (v) => {
        const x = clamp(v);
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    };
    const svg = (tag, attrs = {}) => {
        const node = document.createElementNS(SVG, tag);
        Object.entries(attrs).forEach(([name, value]) => node.setAttribute(name, String(value)));
        return node;
    };
    const setOpacity = (node, value) => { node.style.opacity = clamp(value).toFixed(3); };
    const phase = (shown, step) => clamp(shown - step + 1);
    const span = (t, a, b) => ease(clamp((t - a) / (b - a)));
    const lerp = (a, b, t) => a + (b - a) * t;
    const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const mixColour = (a, b, t) => {
        const [r1, g1, b1] = channels(a), [r2, g2, b2] = channels(b);
        return `rgb(${Math.round(lerp(r1, r2, t))}, ${Math.round(lerp(g1, g2, t))}, ${Math.round(lerp(b1, b2, t))})`;
    };
    const rotate = (p, c, deg) => {
        const a = (deg * Math.PI) / 180, dx = p.x - c.x, dy = p.y - c.y;
        return { x: c.x + dx * Math.cos(a) - dy * Math.sin(a), y: c.y + dx * Math.sin(a) + dy * Math.cos(a) };
    };
    const lcg = (seed) => {
        let s = seed >>> 0 || 1;
        return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
    };
    const INK = "#173849";
    const INK_DONE = "#8a99a1";

    /* Circle geometry: intersection points and the arc between two points of
       a circle on the side nearer a chosen reference point, used to build the
       exact lens (two circles) and centre (three circles) regions. */
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const circleIntersections = (c1, c2) => {
        const dx = c2.x - c1.x, dy = c2.y - c1.y;
        const d = Math.hypot(dx, dy);
        if (d === 0 || d > c1.r + c2.r || d < Math.abs(c1.r - c2.r)) return null;
        const a = (c1.r ** 2 - c2.r ** 2 + d * d) / (2 * d);
        const h = Math.sqrt(Math.max(0, c1.r ** 2 - a * a));
        const mx = c1.x + (a * dx) / d, my = c1.y + (a * dy) / d;
        const ox = (-dy / d) * h, oy = (dx / d) * h;
        return [{ x: mx + ox, y: my + oy }, { x: mx - ox, y: my - oy }];
    };
    const norm2pi = (a) => { const t = a % (Math.PI * 2); return t < 0 ? t + Math.PI * 2 : t; };
    const angleOf = (c, p) => Math.atan2(p.y - c.y, p.x - c.x);
    const minorArcMidpoint = (centre, r, p1, p2) => {
        const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
        const dx = mx - centre.x, dy = my - centre.y;
        const len = Math.hypot(dx, dy) || 1;
        return { x: centre.x + (dx / len) * r, y: centre.y + (dy / len) * r };
    };
    const arcTo = (centre, r, p1, p2) => {
        const mid = minorArcMidpoint(centre, r, p1, p2);
        const a1 = norm2pi(angleOf(centre, p1)), a2 = norm2pi(angleOf(centre, p2)), am = norm2pi(angleOf(centre, mid));
        const sweep = norm2pi(am - a1) <= norm2pi(a2 - a1) ? 1 : 0;
        return `A ${r} ${r} 0 0 ${sweep} ${p2.x} ${p2.y}`;
    };
    const lensPath = (c1, c2) => {
        const pts = circleIntersections(c1, c2);
        if (!pts) return "";
        const [p1, p2] = pts;
        return `M ${p1.x} ${p1.y} ${arcTo(c1, c1.r, p1, p2)} ${arcTo(c2, c2.r, p2, p1)} Z`;
    };
    const tripleIntersectionPath = (A, B, C) => {
        const pick = (c1, c2, other) => {
            const pts = circleIntersections(c1, c2);
            return pts && (pts.find((p) => dist(p, other) <= other.r) || null);
        };
        const pAB = pick(A, B, C), pBC = pick(B, C, A), pCA = pick(C, A, B);
        if (!pAB || !pBC || !pCA) return "";
        return `M ${pCA.x} ${pCA.y} ${arcTo(C, C.r, pCA, pBC)} ${arcTo(B, B.r, pBC, pAB)} ${arcTo(A, A.r, pAB, pCA)} Z`;
    };

    /* Static marks ------------------------------------------------------- */
    const regionHighlight = (drawing, pathData) => {
        const path = svg("path", { class: "scene-ring is-hcf", d: pathData });
        drawing.appendChild(path);
        return path;
    };
    const outline = (drawing, c) => {
        const node = svg("circle", { class: "scene-ring", cx: c.x, cy: c.y, r: c.r });
        drawing.appendChild(node);
        return node;
    };
    const label = (drawing, x, y, text, size) => {
        const t = svg("text", { class: "scene-label", x, y, "text-anchor": "middle" });
        t.style.fontSize = `${size}px`;
        t.textContent = text;
        drawing.appendChild(t);
        return t;
    };
    const equation = (drawing, x, y, text) => {
        const t = svg("text", { class: "scene-equation", x, y, "text-anchor": "middle" });
        t.textContent = text;
        drawing.appendChild(t);
        return t;
    };
    const fadeMark = (node, step) => ({ paint(shown) { setOpacity(node, ease(phase(shown, step))); } });
    const shadowFilter = (drawing, id) => {
        const defs = svg("defs");
        const filter = svg("filter", { id, x: "-20%", y: "-20%", width: "140%", height: "150%" });
        filter.appendChild(svg("feDropShadow", { dx: 0, dy: 4, stdDeviation: 4, "flood-color": "#17384f", "flood-opacity": .2 }));
        defs.appendChild(filter);
        drawing.appendChild(defs);
    };

    /* A scrap of paper: torn top and bottom edges from a seeded sequence so
       no two scraps tear alike and none changes between loads; ruled lines;
       the number as a heading; its prime factors as a list, one per line. */
    const tornPath = (x, y, w, h, seed) => {
        const rnd = lcg(seed);
        const jag = () => (rnd() - .5) * (5 + rnd() * 9);
        const n = 11;
        const edge = (yBase, reverse) => {
            const pts = [];
            for (let i = 0; i <= n; i += 1) {
                const inner = i > 0 && i < n;
                pts.push([x + (w * i) / n + (inner ? (rnd() - .5) * 6 : 0), yBase + (inner ? jag() : 0)]);
            }
            return reverse ? pts.reverse() : pts;
        };
        const pts = [...edge(y, false), ...edge(y + h, true)];
        return `M ${pts.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join(" L ")} Z`;
    };
    const quadLength = (p0, p1, p2) => {
        let length = 0, prev = p0;
        for (let i = 1; i <= 16; i += 1) {
            const t = i / 16, u = 1 - t;
            const p = { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y };
            length += dist(prev, p);
            prev = p;
        }
        return length;
    };
    const scrap = (drawing, shadowId, spec) => {
        const { x, y, w, h, angle, seed, heading, entries, headingSize, entrySize, pitch } = spec;
        const centre = { x: x + w / 2, y: y + h / 2 };
        const g = svg("g", { class: "scene-paper", transform: `rotate(${angle} ${centre.x} ${centre.y})` });
        g.appendChild(svg("path", { class: "scene-paper__sheet", d: tornPath(x, y, w, h, seed), filter: `url(#${shadowId})` }));
        const rules = [];
        for (let k = 0; k <= entries.length; k += 1) {
            const ry = y + 52 + pitch * k;
            rules.push(ry);
            g.appendChild(svg("line", { class: `scene-paper__rule${k === 0 ? " is-heading" : ""}`, x1: x + 9, y1: ry, x2: x + w - 9, y2: ry }));
        }
        const head = svg("text", { class: "scene-paper__heading", x: centre.x, y: rules[0] - 7, "text-anchor": "middle" });
        head.style.fontSize = `${headingSize}px`;
        head.textContent = heading;
        g.appendChild(head);
        const items = entries.map((value, i) => {
            const base = rules[i + 1] - 7;
            const text = svg("text", { class: "scene-paper__entry", x: centre.x, y: base, "text-anchor": "middle" });
            text.style.fontSize = `${entrySize}px`;
            text.textContent = String(value);
            const mid = base - entrySize * .36;
            const half = entrySize * .7;
            const p0 = { x: centre.x - half, y: mid + 2.5 }, p1 = { x: centre.x, y: mid + 3 }, p2 = { x: centre.x + half, y: mid - 2.5 };
            const strike = svg("path", { class: "scene-paper__strike", d: `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}` });
            /* The dash is offset past the path's start by more than the stroke
               width, so the round cap of an undrawn stroke cannot peep out. */
            const length = quadLength(p0, p1, p2);
            const hidden = length + 6;
            strike.style.strokeDasharray = `${length.toFixed(1)} ${(length + 40).toFixed(1)}`;
            strike.style.strokeDashoffset = `${hidden.toFixed(1)}`;
            g.append(text, strike);
            return {
                value,
                size: entrySize,
                centre: rotate({ x: centre.x, y: mid }, centre, angle),
                setProgress(t) {
                    strike.style.strokeDashoffset = `${(hidden * (1 - t)).toFixed(1)}`;
                    text.style.fill = mixColour(INK, INK_DONE, t);
                }
            };
        });
        drawing.appendChild(g);
        return items;
    };

    /* One placement: at its step, the pen crosses the value off every list it
       is on, each copy of the numeral lifts off its scrap and travels along a
       shallow arc to the region, the copies converge, and the chip settles in
       beneath them. Before the step the numerals sit unseen on their lists;
       after it the chip is complete. */
    const placement = (drawing, { sources, to, value, shared, step, w = 48, h = 34, size = 20, under = false }) => {
        const bg = svg("rect", { class: `scene-chip-bg${shared ? " is-shared" : ""}`, rx: 11 });
        const movers = sources.map(() => {
            const t = svg("text", { class: `scene-chip${shared ? " is-shared" : ""}`, "text-anchor": "middle" });
            t.textContent = String(value);
            return t;
        });
        drawing.append(bg, ...movers);
        const arrivedColour = shared ? "#80540f" : INK;
        return {
            paint(shown) {
                const t = phase(shown, step);
                const stroke = span(t, 0, .3);
                const settle = span(t, .7, 1);
                sources.forEach((src, i) => {
                    src.setProgress(stroke);
                    /* Copies from different lists fly on arcs of different
                       heights, so three 2s read as a fan converging on one
                       chip rather than as a row or a jumble; a longer flight
                       arcs higher, clearing chips already placed nearer. */
                    const travel = span(t, .15, .8);
                    const from = src.centre;
                    const lift = 30 + 38 * i + Math.abs(to.x - from.x) * .16;
                    const ctrl = { x: (from.x + to.x) / 2, y: under ? Math.max(from.y, to.y) + lift : Math.min(from.y, to.y) - lift };
                    const u = 1 - travel;
                    const x = u * u * from.x + 2 * u * travel * ctrl.x + travel * travel * to.x;
                    const y = u * u * from.y + 2 * u * travel * ctrl.y + travel * travel * to.y;
                    const fontSize = lerp(src.size, size, travel);
                    movers[i].style.fontSize = `${fontSize.toFixed(1)}px`;
                    movers[i].style.fill = mixColour(INK, arrivedColour, travel);
                    movers[i].setAttribute("x", x.toFixed(1));
                    movers[i].setAttribute("y", (y + fontSize * .35).toFixed(1));
                    setOpacity(movers[i], span(t, .15, .25));
                });
                const scale = .9 + .1 * settle;
                bg.setAttribute("x", (to.x - (w * scale) / 2).toFixed(1));
                bg.setAttribute("y", (to.y - (h * scale) / 2).toFixed(1));
                bg.setAttribute("width", (w * scale).toFixed(1));
                bg.setAttribute("height", (h * scale).toFixed(1));
                setOpacity(bg, settle);
            }
        };
    };

    /* Two numbers: 84 and 90. Every chip and label position was checked by a
       throwaway script for at least 8px of clearance from every circle
       boundary it must stay clear of. */
    const twoModel = {
        captions: [
            ["84 and 90 as circles", "84 = 2 × 2 × 3 × 7 and 90 = 2 × 3 × 3 × 5, each listed beside a circle of its own."],
            ["A prime on both lists goes in the overlap", "A 2 is on both lists: crossed off both, it is written once, in the overlap. The 3 follows the same way."],
            ["A prime on one list goes in that number's own region", "84's second 2 and its 7 are on 84's list only, so they go in 84's own region; 90's second 3 and its 5 go in 90's."],
            ["The overlap multiplies to the HCF", "2 × 3 = 6 divides both 84 and 90, and no larger number does: HCF = 6."],
            ["Every region multiplies to the LCM", "2 × 3 × 2 × 7 × 3 × 5 = 1,260 holds every prime factor of 84 and of 90, with each shared prime written once, so it is the smallest multiple of both: LCM = 1,260."]
        ],
        captionOf: [0, 1, 1, 2, 2, 2, 2, 3, 4],
        build(root) {
            root.replaceChildren();
            const drawing = svg("svg", { viewBox: "0 0 780 450", "aria-hidden": "true", focusable: "false" });
            shadowFilter(drawing, "venn-paper-shadow-two");
            const A = { x: 436, y: 215, r: 136 }, B = { x: 606, y: 215, r: 136 };
            const marks = [];
            marks.push(fadeMark(outline(drawing, A), 0), fadeMark(outline(drawing, B), 0));
            marks.push(fadeMark(label(drawing, 372, 300, "84", 26), 0), fadeMark(label(drawing, 670, 300, "90", 26), 0));
            marks.push(fadeMark(regionHighlight(drawing, lensPath(A, B)), 7));
            const paper = { y: 81, w: 104, h: 268, headingSize: 24, entrySize: 34, pitch: 46 };
            const list84 = scrap(drawing, "venn-paper-shadow-two", { ...paper, x: 26, angle: -1.5, seed: 7, heading: "84", entries: [2, 2, 3, 7] });
            const list90 = scrap(drawing, "venn-paper-shadow-two", { ...paper, x: 150, angle: 1.2, seed: 23, heading: "90", entries: [2, 3, 3, 5] });
            marks.push(placement(drawing, { sources: [list84[0], list90[0]], to: { x: 521, y: 190 }, value: 2, shared: true, step: 1, w: 44, h: 32 }));
            marks.push(placement(drawing, { sources: [list84[2], list90[1]], to: { x: 521, y: 240 }, value: 3, shared: true, step: 2, w: 44, h: 32 }));
            marks.push(placement(drawing, { sources: [list84[1]], to: { x: 384, y: 190 }, value: 2, shared: false, step: 3 }));
            marks.push(placement(drawing, { sources: [list84[3]], to: { x: 384, y: 240 }, value: 7, shared: false, step: 4 }));
            marks.push(placement(drawing, { sources: [list90[2]], to: { x: 658, y: 190 }, value: 3, shared: false, step: 5 }));
            marks.push(placement(drawing, { sources: [list90[3]], to: { x: 658, y: 240 }, value: 5, shared: false, step: 6, under: true }));
            marks.push(fadeMark(equation(drawing, 521, 400, "HCF = 2 × 3 = 6"), 7));
            marks.push(fadeMark(equation(drawing, 521, 432, "LCM = 2 × 3 × 2 × 7 × 3 × 5 = 1,260"), 8));
            root.appendChild(drawing);
            return { marks };
        },
        paint(parts, shown) { parts.marks.forEach((mark) => mark.paint(shown)); }
    };

    /* Three numbers: 24, 60 and 90. Regions: centre (all three) 2, 3; 24&60
       only 2; 60&90 only 5; 24 only 2; 90 only 3; 24&90 only and 60 only are
       both empty. */
    const threeModel = {
        captions: [
            ["24, 60 and 90 as circles", "24 = 2 × 2 × 2 × 3, 60 = 2 × 2 × 3 × 5 and 90 = 2 × 3 × 3 × 5, each listed beside a circle of its own."],
            ["A prime on all three lists goes to the centre", "A 2 is on all three lists: crossed off all three, it is written once, where all three circles overlap. The 3 follows the same way."],
            ["24 and 60 share a further 2", "A second 2 is on 24's list and on 60's, and no 2 is left on 90's: it goes where only those two circles overlap."],
            ["60 and 90 share a further 5", "The 5 is on 60's list and on 90's: it goes where only those two circles overlap."],
            ["What is left is on one list only", "24's third 2 goes in 24's own region and 90's second 3 in 90's. 60's list is empty, so 60's own region is empty."],
            ["The centre multiplies to the HCF", "2 × 3 = 6 divides 24, 60 and 90, and no larger number does: HCF = 6."],
            ["Every region multiplies to the LCM", "2 × 2 × 2 × 3 × 3 × 5 = 360 holds every prime factor of 24, 60 and 90, with each shared prime written once, so it is the smallest multiple of all three: LCM = 360."]
        ],
        captionOf: [0, 1, 1, 2, 3, 4, 4, 5, 6],
        build(root) {
            root.replaceChildren();
            const drawing = svg("svg", { viewBox: "0 0 780 520", "aria-hidden": "true", focusable: "false" });
            shadowFilter(drawing, "venn-paper-shadow-three");
            const A = { x: 470, y: 190, r: 118 }, B = { x: 610, y: 190, r: 118 }, C = { x: 540, y: 310, r: 118 };
            const marks = [];
            marks.push(fadeMark(outline(drawing, A), 0), fadeMark(outline(drawing, B), 0), fadeMark(outline(drawing, C), 0));
            marks.push(fadeMark(label(drawing, 392, 238, "24", 24), 0), fadeMark(label(drawing, 688, 238, "60", 24), 0), fadeMark(label(drawing, 540, 408, "90", 24), 0));
            marks.push(fadeMark(regionHighlight(drawing, tripleIntersectionPath(A, B, C)), 7));
            const paper = { y: 120, w: 84, h: 260, headingSize: 22, entrySize: 30, pitch: 44 };
            const list24 = scrap(drawing, "venn-paper-shadow-three", { ...paper, x: 24, angle: -1.6, seed: 5, heading: "24", entries: [2, 2, 2, 3] });
            const list60 = scrap(drawing, "venn-paper-shadow-three", { ...paper, x: 122, angle: .9, seed: 17, heading: "60", entries: [2, 2, 3, 5] });
            const list90 = scrap(drawing, "venn-paper-shadow-three", { ...paper, x: 220, angle: -.7, seed: 41, heading: "90", entries: [2, 3, 3, 5] });
            const small = { w: 34, h: 24, size: 17 };
            marks.push(placement(drawing, { sources: [list24[0], list60[0], list90[0]], to: { x: 540, y: 214 }, value: 2, shared: true, step: 1, ...small }));
            marks.push(placement(drawing, { sources: [list24[3], list60[2], list90[1]], to: { x: 540, y: 243 }, value: 3, shared: true, step: 2, ...small }));
            marks.push(placement(drawing, { sources: [list24[1], list60[1]], to: { x: 540, y: 150 }, value: 2, shared: false, step: 3, w: 40, h: 30 }));
            marks.push(placement(drawing, { sources: [list60[3], list90[3]], to: { x: 612, y: 268 }, value: 5, shared: false, step: 4, w: 40, h: 30, under: true }));
            marks.push(placement(drawing, { sources: [list24[2]], to: { x: 420, y: 190 }, value: 2, shared: false, step: 5, w: 40, h: 30 }));
            marks.push(placement(drawing, { sources: [list90[2]], to: { x: 540, y: 362 }, value: 3, shared: false, step: 6, w: 40, h: 30 }));
            marks.push(fadeMark(equation(drawing, 540, 470, "HCF = 2 × 3 = 6"), 7));
            marks.push(fadeMark(equation(drawing, 540, 502, "LCM = 2 × 2 × 2 × 3 × 3 × 5 = 360"), 8));
            root.appendChild(drawing);
            return { marks };
        },
        paint(parts, shown) { parts.marks.forEach((mark) => mark.paint(shown)); }
    };

    const models = { two: twoModel, three: threeModel };
    const scenes = [];

    const createScene = (scene) => {
        const sticky = scene.querySelector(".venn-scene__sticky");
        const board = scene.querySelector("[data-board]");
        const title = scene.querySelector("[data-step-title]");
        const copy = scene.querySelector("[data-step-copy]");
        const progress = scene.querySelector("[data-progress]");
        const model = models[scene.dataset.kind];
        if (!sticky || !board || !model) return null;

        const parts = model.build(board);
        const last = model.captionOf.length - 1;
        const cardHeight = sticky.offsetHeight;
        let active = -1;
        progress.replaceChildren(...model.captions.map(() => {
            const dot = document.createElement("i");
            dot.className = "venn-scene__dot";
            return dot;
        }));
        scene.style.setProperty("--scene-height", `${model.captionOf.length * 50}vh`);
        scene.style.setProperty("--scene-min-height", `${model.captionOf.length * 380}px`);
        scene.classList.add("is-ready");

        const paint = (fraction) => {
            const position = clamp(fraction) * (last + 2) - 1;
            const index = clamp(Math.floor(position + 1), 0, last);
            const within = clamp(position - Math.floor(position));
            const shown = Math.max(0, Math.floor(position) + clamp(within / .58));
            model.paint(parts, reduceMotion.matches ? last : shown);
            const caption = model.captionOf[index];
            if (caption !== active) {
                active = caption;
                title.textContent = model.captions[caption][0];
                copy.textContent = model.captions[caption][1];
                Array.from(progress.children).forEach((dot, i) => {
                    dot.classList.toggle("is-past", i < caption);
                    dot.classList.toggle("is-current", i === caption);
                });
            }
        };
        const dock = (offset = 0) => {
            if (sticky.parentNode !== scene) scene.insertBefore(sticky, scene.firstChild);
            sticky.classList.remove("is-pinned");
            ["left", "width", "height", "transform"].forEach((name) => sticky.style.removeProperty(name));
            sticky.style.top = `${offset}px`;
        };
        const pin = (left, top, width, scale) => {
            if (sticky.parentNode !== document.body) document.body.appendChild(sticky);
            sticky.classList.add("is-pinned");
            sticky.style.left = `${left}px`;
            sticky.style.top = `${top}px`;
            sticky.style.width = `${width}px`;
            sticky.style.height = `${cardHeight}px`;
            sticky.style.transform = `scale(${scale})`;
        };
        const update = () => {
            if (reduceMotion.matches) { dock(); paint(1); return; }
            const rect = scene.getBoundingClientRect();
            const scale = rect.width / scene.offsetWidth;
            const top = Math.max(16, (window.innerHeight - cardHeight * scale) / 2);
            const travel = Math.max(1, scene.offsetHeight - cardHeight);
            const distance = top - rect.top;
            if (distance <= 0) { dock(); paint(0); }
            else if (distance >= travel * scale) { dock(travel); paint(1); }
            else { pin(rect.left, top, scene.offsetWidth, scale); paint(distance / (travel * scale)); }
        };
        let ticking = false;
        const requestUpdate = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => { ticking = false; update(); });
        };
        paint(0);
        return { update, requestUpdate };
    };

    document.querySelectorAll("[data-venn-scene]").forEach((scene) => {
        const controller = createScene(scene);
        if (controller) scenes.push(controller);
    });
    window.addEventListener("scroll", () => scenes.forEach((scene) => scene.requestUpdate()), { passive: true });
    window.addEventListener("resize", () => scenes.forEach((scene) => scene.requestUpdate()));
    reduceMotion.addEventListener("change", () => scenes.forEach((scene) => scene.update()));
    scenes.forEach((scene) => scene.update());
});
