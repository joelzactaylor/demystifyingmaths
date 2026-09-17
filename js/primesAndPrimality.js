/* Primes and testing for primality.

   Four figures, the engine that drives them, and a live tester.

   The first figure is 13 counters trying to form rectangles: rows of 2 and
   rows of 3 each leave one counter over, and 4 × 4 = 16 is past 13, so the
   single row is the only rectangle there is. That is what two factors looks
   like. The second is the sieve: the numbers 1 to 50 with the multiples of 2,
   3, 5 and 7 crossed out in turn, each prime's first cross of its own landing
   on its square. The last two count the primes along a number line towards 97
   and towards 91, so a remainder is a visible gap and an exact division is a
   count that lands.

   Positions are read from numbers rather than from the document, so nothing
   here measures the page. */

document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
    const ease = (v) => {
        const x = clamp(v);
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    };
    const lerp = (a, b, t) => a + (b - a) * t;
    const SVG = "http://www.w3.org/2000/svg";

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };
    const svgEl = (tag, className, attrs) => {
        const node = document.createElementNS(SVG, tag);
        if (className) node.setAttribute("class", className);
        if (attrs) Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
        return node;
    };
    const text = (className, x, y, content, anchor) => {
        const node = svgEl("text", className, { x, y });
        if (anchor) node.setAttribute("text-anchor", anchor);
        node.textContent = content;
        return node;
    };
    /* Marks that sit apart on screen are one run of characters to anything that
       strips the styling, so every pair of text-bearing neighbours is parted
       with a space once the figure is built. */
    const part = (root) => {
        [root, ...root.querySelectorAll("*")].forEach((node) => {
            const kids = Array.from(node.children);
            kids.forEach((kid, i) => {
                if (!i || !kids[i - 1].textContent.trim() || !kid.textContent.trim()) return;
                node.insertBefore(document.createTextNode(" "), kid);
            });
        });
        return root;
    };
    const writeCaption = (node, text) => {
        if (node && node.textContent !== text) node.textContent = text;
    };
    /* 1 while the figure rests at stage k, falling away either side of it. */
    const near = (shown, k) => clamp(1 - Math.abs(shown - k) * 1.6);
    /* Marks written left to right across their own stage, the i-th of `count`
       opening a little after the one before it. */
    const sweep = (shown, stage, count, i) => clamp((shown - (stage - 1)) * count - i * 0.7);

    /* The line each stage has just settled, under the drawing. The last is
       written into the element and the rest drawn by the stylesheet, so a
       stripped page reads one true line rather than every stage at once. */
    const noteLine = (notes) => {
        const line = el("p", "scene-note");
        const faces = notes.map((content, i) => {
            if (i === notes.length - 1) return el("span", "scene-note__face", content);
            const face = el("span", "scene-note__face scene-note__face--from");
            face.setAttribute("data-face", content);
            face.setAttribute("aria-hidden", "true");
            return face;
        });
        line.append(...faces);
        return { line, faces };
    };
    const placeFaces = (faces, shown) => faces.forEach((face, i) => {
        face.style.opacity = near(shown, i).toFixed(3);
    });

    const board = (w, h) => {
        const svg = svgEl("svg", null, { viewBox: `0 0 ${w} ${h}`, "aria-hidden": "true", focusable: "false" });
        return svg;
    };

    /* ------------------------------------------------ 13 counters, in rows */

    const RS = 24;
    const RR = 8.5;
    const RW = 700;
    const RH = 196;

    const rows = {
        n: 13,
        /* Counters per row at each stage. The last stage is the first again,
           because the single row is the only rectangle there is. */
        widths: [13, 2, 3, 4, 13],
        stages: [
            { title: "13 counters in a row", copy: "1 × 13: one row of 13, the widest rectangle there is." },
            { title: "Rows of 2", copy: "13 ÷ 2 = 6 r 1. Six rows of 2 use 12 counters, and the thirteenth has no row to join." },
            { title: "Rows of 3", copy: "13 ÷ 3 = 4 r 1. Four rows of 3 use 12, and again one counter is over." },
            { title: "Rows of 4, and the stop", copy: "4 × 4 = 16 is past 13, so a rectangle 4 or more wide is fewer than 4 tall, and 1, 2 and 3 tall have all been tried." },
            { title: "One rectangle", copy: "1 × 13 is the only rectangle, so 13 has two factors: 1 and 13." }
        ],
        notes: ["1 × 13", "13 ÷ 2 = 6 r 1", "13 ÷ 3 = 4 r 1", "4 × 4 = 16", "1 × 13: the factors are 1 and 13"],

        layout(width) {
            const rowsTall = Math.ceil(this.n / width);
            const x0 = RW / 2 - (width * RS) / 2;
            const y0 = RH / 2 - (rowsTall * RS) / 2;
            const at = (i) => [x0 + (i % width) * RS + RS / 2, y0 + Math.floor(i / width) * RS + RS / 2];
            return { width, rowsTall, x0, y0, at, over: this.n % width ? this.n - 1 : -1 };
        },

        build(paper) {
            paper.replaceChildren();
            const figure = el("div", "rows");
            const svg = board(RW, RH);
            svg.setAttribute("class", "rows__svg");
            const layouts = this.widths.map((w) => this.layout(w));

            /* The 4 × 4 frame the counters fail to fill, with the three cells
               they leave empty, drawn only while the figure rests there. */
            const stop = layouts[3];
            const frame = svgEl("g", "rows__frame");
            frame.appendChild(svgEl("rect", "rows__outline", {
                x: stop.x0 - 5, y: stop.y0 - 5, width: 4 * RS + 10, height: 4 * RS + 10, rx: 9
            }));
            for (let i = this.n; i < 16; i += 1) {
                const [cx, cy] = stop.at(i);
                frame.appendChild(svgEl("circle", "rows__empty", { cx, cy, r: RR }));
            }
            svg.appendChild(frame);

            const counters = Array.from({ length: this.n }, () => {
                const dot = svgEl("circle", "rows__counter", { r: RR });
                svg.appendChild(dot);
                return dot;
            });

            /* The two sides of the one rectangle, named as the two factors. */
            const last = layouts[4];
            const dims = svgEl("g", "rows__dims");
            const top = last.y0 - 12;
            dims.appendChild(svgEl("path", "rows__brace", {
                d: `M ${last.x0} ${top + 5} V ${top} H ${last.x0 + 13 * RS} V ${top + 5}`
            }));
            dims.appendChild(text("rows__dim", RW / 2, top - 7, "13", "middle"));
            const left = last.x0 - 12;
            dims.appendChild(svgEl("path", "rows__brace", {
                d: `M ${left + 5} ${last.y0} H ${left} V ${last.y0 + RS} H ${left + 5}`
            }));
            dims.appendChild(text("rows__dim", left - 8, last.y0 + RS / 2 + 5, "1", "end"));
            svg.appendChild(dims);

            figure.appendChild(svg);
            const { line, faces } = noteLine(this.notes);
            figure.appendChild(line);
            paper.appendChild(part(figure));
            return { layouts, counters, frame, dims, faces };
        },

        place(parts, shown) {
            const s = clamp(shown, -1, 4);
            const k0 = clamp(Math.floor(s), 0, 4);
            const k1 = Math.min(k0 + 1, 4);
            const t = clamp(s - k0);
            const from = parts.layouts[k0];
            const to = parts.layouts[k1];
            const fade = clamp(s + 1);
            parts.counters.forEach((dot, i) => {
                const [x1, y1] = from.at(i);
                const [x2, y2] = to.at(i);
                dot.setAttribute("cx", lerp(x1, x2, t).toFixed(2));
                dot.setAttribute("cy", lerp(y1, y2, t).toFixed(2));
                /* The counter with no row to join is coloured apart, and the
                   colour travels with it between layouts. */
                const over = lerp(from.over === i ? 1 : 0, to.over === i ? 1 : 0, t);
                dot.style.setProperty("--over", over.toFixed(3));
                dot.style.opacity = fade.toFixed(3);
            });
            parts.frame.style.opacity = near(s, 3).toFixed(3);
            parts.dims.style.opacity = clamp((s - 3.4) * 1.7).toFixed(3);
            placeFaces(parts.faces, s);
        }
    };

    /* ------------------------------------------------------------ the sieve */

    const SC = 58;
    const SR = 42;
    const SX = 60;
    const SY = 6;
    const SW = 700;
    const SH = 224;

    const sieve = {
        n: 50,
        primes: [2, 3, 5, 7],
        rest: [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47],
        stages: [
            { title: "The numbers 1 to 50", copy: "1 has one factor, so it is set aside before any crossing starts." },
            { title: "Ring 2, cross its multiples", copy: "2 stays: its factors are 1 and 2. Every second number after it, 4, 6, 8 and on to 50, has 2 as a third factor." },
            { title: "Ring 3, cross its multiples", copy: "6, 12 and every even multiple of 3 went with the 2s. The first number 3 crosses on its own is 3 × 3 = 9, then 15, 21, 27, 33, 39 and 45." },
            { title: "Ring 5", copy: "10, 15 and 20 are crossed already, so 5 starts at 5 × 5 = 25 and adds 35." },
            { title: "Ring 7", copy: "14, 21, 28, 35 and 42 are gone, so 7 crosses only 7 × 7 = 49." },
            { title: "Nothing left to cross", copy: "The next number to cross with is 11, and 11 × 11 = 121 is past 50, so 11 crosses nothing. The 15 numbers never crossed are the primes up to 50." }
        ],
        notes: ["", "4, 6, 8, 10, 12, … 48, 50", "9, 15, 21, 27, 33, 39, 45", "25, 35", "49", "2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47"],

        build(paper) {
            paper.replaceChildren();
            const figure = el("div", "sieve");
            const svg = board(SW, SH);
            svg.setAttribute("class", "sieve__svg");
            const centre = (v) => [SX + ((v - 1) % 10) * SC + SC / 2, SY + Math.floor((v - 1) / 10) * SR + SR / 2];

            const grid = svgEl("g", "sieve__grid");
            const nums = {};
            for (let v = 1; v <= this.n; v += 1) {
                const [cx, cy] = centre(v);
                const label = text(v === 1 ? "sieve__num sieve__num--one" : "sieve__num", cx, cy + 5, String(v), "middle");
                grid.appendChild(label);
                nums[v] = label;
            }
            svg.appendChild(grid);

            /* Each prime's crosses, in the order its count meets them. A number
               already crossed by a smaller prime is not crossed again, which is
               how every prime's first cross of its own lands on its square. */
            const crossed = new Set();
            const crosses = this.primes.map((p, k) => {
                const marks = [];
                for (let m = 2 * p; m <= this.n; m += p) {
                    if (crossed.has(m)) continue;
                    crossed.add(m);
                    const [cx, cy] = centre(m);
                    const g = svgEl("g", "sieve__cross");
                    g.appendChild(svgEl("line", "sieve__stroke", { x1: cx - 9, y1: cy - 9, x2: cx + 9, y2: cy + 9 }));
                    g.appendChild(svgEl("line", "sieve__stroke", { x1: cx + 9, y1: cy - 9, x2: cx - 9, y2: cy + 9 }));
                    svg.appendChild(g);
                    marks.push({ g, num: nums[m] });
                }
                return { stage: k + 1, marks };
            });

            const ring = (v) => {
                const [cx, cy] = centre(v);
                const g = svgEl("g", "sieve__ring");
                g.appendChild(svgEl("circle", "sieve__halo", { cx, cy, r: 15 }));
                svg.appendChild(g);
                return g;
            };
            const rings = this.primes.map((p, k) => ({ stage: k + 1, marks: [ring(p)] }));
            rings.push({ stage: this.primes.length + 1, marks: this.rest.map(ring) });

            figure.appendChild(svg);
            const { line, faces } = noteLine(this.notes);
            figure.appendChild(line);
            paper.appendChild(part(figure));
            return { grid, crosses, rings, faces };
        },

        place(parts, shown) {
            parts.grid.style.opacity = clamp(shown + 1).toFixed(3);
            parts.crosses.forEach(({ stage, marks }) => marks.forEach(({ g, num }, i) => {
                const open = sweep(shown, stage, marks.length, i);
                g.style.opacity = open.toFixed(3);
                /* 1 while these are the crosses being made and for their own
                   stage after, then off as the next prime takes over, so the
                   newest crosses are the ones the eye lands on. */
                g.style.setProperty("--fresh", clamp(1 - (shown - stage)).toFixed(3));
                num.style.opacity = (1 - 0.55 * open).toFixed(3);
            }));
            parts.rings.forEach(({ stage, marks }) => marks.forEach((g, i) => {
                g.style.opacity = (marks.length > 1
                    ? sweep(shown, stage, marks.length, i)
                    : clamp((shown - (stage - 1)) * 3)).toFixed(3);
            }));
            placeFaces(parts.faces, shown);
        }
    };

    /* ----------------------------------------- counting primes along a line */

    const TW = 700;
    const TH = 206;
    const TAXIS = 150;
    const TLEFT = 34;
    const TSCALE = 5.2;
    const TMAX = 125;
    const tx = (v) => TLEFT + v * TSCALE;
    const laneY = (i) => TAXIS - 26 - i * 26;

    /* `lanes` is the primes counted at each stage, and `ending` is what the
       last stage draws: the stop, or the factor pair the count has found. */
    const trial = ({ n, lanes, ending, stages, notes }) => ({
        n, lanes, ending, stages, notes,

        build(paper) {
            paper.replaceChildren();
            const figure = el("div", "tline");
            const svg = board(TW, TH);
            svg.setAttribute("class", "tline__svg");

            const axis = svgEl("g", "tline__axis");
            axis.appendChild(svgEl("line", "tline__rule", { x1: tx(0), y1: TAXIS, x2: tx(TMAX), y2: TAXIS }));
            for (let v = 0; v <= TMAX; v += 10) {
                axis.appendChild(svgEl("line", "tline__tick", { x1: tx(v), y1: TAXIS - 4, x2: tx(v), y2: TAXIS + 4 }));
                axis.appendChild(text("tline__scale", tx(v), TAXIS + 20, String(v), "middle"));
            }
            /* The number under test stands as a post the counts are measured
               against. */
            axis.appendChild(svgEl("line", "tline__post", { x1: tx(n), y1: 22, x2: tx(n), y2: TAXIS }));
            axis.appendChild(text("tline__n", tx(n), 15, String(n), "middle"));
            svg.appendChild(axis);

            let laneIndex = 0;
            const counts = lanes.map((primes, k) => primes.map((p) => {
                const y = laneY(laneIndex);
                laneIndex += 1;
                const g = svgEl("g", "tline__lane");
                const label = text("tline__prime", TLEFT - 12, y + 5, String(p), "end");
                g.appendChild(label);
                /* What the count ends in goes in first, so the gold ring on a
                   count that lands sits behind the dot it lights rather than
                   over it. */
                const last = Math.floor(n / p) * p;
                const end = svgEl("g", "tline__end");
                if (n % p) {
                    /* The count falls short, and the gap is the remainder. */
                    end.appendChild(svgEl("line", "tline__gap", { x1: tx(last), y1: y, x2: tx(n), y2: y }));
                    end.appendChild(text("tline__r", tx(n) + 9, y + 4, `r ${n % p}`, "start"));
                } else {
                    end.appendChild(svgEl("circle", "tline__hit", { cx: tx(n), cy: y, r: 7.5 }));
                }
                g.appendChild(end);
                const dots = [];
                for (let m = p; m <= n; m += p) {
                    const dot = svgEl("circle", "tline__dot", { cx: tx(m), cy: y, r: 3.6 });
                    g.appendChild(dot);
                    dots.push(dot);
                }
                svg.appendChild(g);
                return { stage: k + 1, label, dots, end };
            }));

            const finish = svgEl("g", "tline__finish");
            const finalStage = lanes.length + 1;
            if (ending.kind === "stop") {
                /* The square of the next prime sits past the number, and the
                   smaller end of any pair lies under the bracket. */
                const sq = ending.next * ending.next;
                finish.appendChild(svgEl("rect", "tline__square", { x: tx(sq) - 6, y: TAXIS - 6, width: 12, height: 12 }));
                finish.appendChild(text("tline__label", tx(TMAX), TAXIS + 49, `${ending.next} × ${ending.next} = ${sq}`, "end"));
                const by = TAXIS + 34;
                finish.appendChild(svgEl("path", "tline__brace", {
                    d: `M ${tx(ending.from)} ${by - 5} V ${by} H ${tx(ending.to)} V ${by - 5}`
                }));
                finish.appendChild(text("tline__label", (tx(ending.from) + tx(ending.to)) / 2, by + 15, `${ending.from} to ${ending.to}`, "middle"));
            } else {
                /* The count that landed, bracketed from 0 to the number and
                   named as the pair it has found. */
                const y = laneY(laneIndex - 1) - 11;
                finish.appendChild(svgEl("path", "tline__brace", {
                    d: `M ${tx(0)} ${y + 5} V ${y} H ${tx(n)} V ${y + 5}`
                }));
                finish.appendChild(text("tline__label", tx(n / 2), y - 7, `${ending.count} × ${ending.by} = ${n}`, "middle"));
            }
            svg.appendChild(finish);

            figure.appendChild(svg);
            const { line, faces } = noteLine(notes);
            figure.appendChild(line);
            paper.appendChild(part(figure));
            return { axis, counts, finish, finalStage, faces };
        },

        place(parts, shown) {
            parts.axis.style.opacity = clamp(shown + 1).toFixed(3);
            parts.counts.forEach((lanesAtStage) => lanesAtStage.forEach(({ stage, label, dots, end }, j) => {
                /* Several primes counted in one stage take turns, one after
                   another, rather than all at once. */
                const share = lanesAtStage.length;
                const local = clamp((shown - (stage - 1)) * share - j);
                label.style.opacity = clamp(local * 4).toFixed(3);
                dots.forEach((dot, i) => {
                    dot.style.opacity = clamp(local * dots.length - i * 0.5).toFixed(3);
                });
                end.style.opacity = clamp(local * 3 - 2).toFixed(3);
            }));
            parts.finish.style.opacity = clamp((shown - (parts.finalStage - 1)) * 2).toFixed(3);
            placeFaces(parts.faces, shown);
        }
    });

    const trial97 = trial({
        n: 97,
        lanes: [[2], [3], [5], [7]],
        ending: { kind: "stop", next: 11, from: 2, to: 10 },
        stages: [
            { title: "97 on the line", copy: "The candidate factors 2, 3, 5 and 7 are counted along the line in turn, and each count either lands on 97 or falls short of it." },
            { title: "Counting in 2s", copy: "48 twos reach 96 and the next is 98, so 97 ÷ 2 = 48 r 1." },
            { title: "Counting in 3s", copy: "32 threes reach 96, so 97 ÷ 3 = 32 r 1. The digits agree: 9 + 7 = 16 is not a multiple of 3." },
            { title: "Counting in 5s", copy: "19 fives reach 95, so 97 ÷ 5 = 19 r 2, as a last digit of 7 says." },
            { title: "Counting in 7s", copy: "13 sevens reach 91 and 14 reach 98, so 97 ÷ 7 = 13 r 6." },
            { title: "The stop, and the verdict", copy: "11 × 11 = 121 is past 97, so the smaller factor of any pair for 97 lies from 2 to 10, and each of those has been tried or is a multiple of 2 or 3. 97 is prime." }
        ],
        notes: ["", "97 ÷ 2 = 48 r 1", "97 ÷ 3 = 32 r 1", "97 ÷ 5 = 19 r 2", "97 ÷ 7 = 13 r 6", "97 is prime"]
    });

    const trial91 = trial({
        n: 91,
        lanes: [[2, 3, 5], [7]],
        ending: { kind: "pair", by: 7, count: 13 },
        stages: [
            { title: "91 on the line", copy: "91 is odd, its digits add to 10 and it ends in 1, so the digit tests rule out the candidates 2, 3 and 5 before any count begins." },
            { title: "2, 3 and 5 fall short", copy: "45 twos, 30 threes and 18 fives all reach 90, one short of 91." },
            { title: "Counting in 7s", copy: "13 sevens land on 91 exactly: 91 ÷ 7 = 13, with nothing over." },
            { title: "A factor pair", copy: "7 × 13 = 91, so 7 and 13 are factors of 91 beside 1 and 91. Four factors are two too many, and 91 is not prime." }
        ],
        notes: ["", "45 × 2 = 90,  30 × 3 = 90,  18 × 5 = 90", "91 ÷ 7 = 13", "91 = 7 × 13"]
    });

    const FIGURES = { rows, sieve, "trial-97": trial97, "trial-91": trial91 };

    const painter = {
        read: (scene) => FIGURES[scene.dataset.figure] || null,
        stages: (model) => model.stages.length - 1,
        build: (paper, model) => model.build(paper),
        caption: (model, index) => model.stages[Math.min(index, model.stages.length - 1)],
        still(parts, model) { model.place(parts, model.stages.length - 1); },
        /* The board rests at the state its caption names, and moves into it out
           of the one before. */
        paint(parts, model, index, within) { model.place(parts, index - 1 + ease(clamp(within))); }
    };

    /* --------------------------------------------------------------- engine */

    const createScene = (scene) => {
        const sticky = scene.querySelector(".prime-scene__sticky");
        if (!sticky) return null;
        const model = painter.read(scene);
        if (!model) return null;

        const paper = scene.querySelector("[data-board]");
        const stepTitle = scene.querySelector("[data-step-title]");
        const stepCopy = scene.querySelector("[data-step-copy]");
        const progressBar = scene.querySelector("[data-progress]");

        const paceVh = 52;
        const pacePx = 400;
        /* A stage spends the first part of its scroll moving and the rest of it
           holding still, so one step can be read before the next starts. */
        const action = 0.6;

        let parts = null;
        const totalStages = painter.stages(model);
        let stage = -1;
        const cardHeight = sticky.offsetHeight;

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
            dot.className = "prime-scene__dot";
            return dot;
        }));
        scene.style.setProperty("--scene-height", `${(totalStages + 1) * paceVh}vh`);
        scene.style.setProperty("--scene-min-height", `${(totalStages + 1) * pacePx}px`);
        scene.classList.add("is-ready");
        parts = painter.build(paper, model);

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
            if (reduceMotion.matches) { dock(0); render(1); painter.still(parts, model); return; }
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
            window.requestAnimationFrame(update);
        };
        return { update, requestUpdate };
    };

    /* --------------------------------------------------------------- tester

       Every prime in turn, run on a number of the reader's own. The chips are
       built in the markup with 97 already answered, so a page without scripts
       shows one true state; the script rewrites the text in place and never
       rebuilds the list under the cursor. The short note on a chip is drawn by
       the stylesheet from data-note, and the full statement sits beside it
       out of sight, so a stripped page reads each trial once and reads it
       true. The last chip, 37, only ever stops:
       37 × 37 = 1,369 is past every number the box accepts. */

    const createTester = (root) => {
        const input = root.querySelector("[data-trier-input]");
        const list = root.querySelector("[data-trier-list]");
        const empty = root.querySelector("[data-trier-empty]");
        const summary = root.querySelector("[data-trier-summary]");
        if (!input || !list || !summary) return;
        const chips = Array.from(list.querySelectorAll("[data-prime]"));
        const fmt = (n) => n.toLocaleString("en-GB");
        const join = (xs, word) => xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} ${word} ${xs[xs.length - 1]}`;

        /* The short note is what is seen; the full statement is what is read
           out, so the chip says the same thing either way. */
        const setChip = (chip, state, note, say) => {
            ["is-miss", "is-hit", "is-stop", "is-idle"].forEach((c) => chip.classList.toggle(c, c === state));
            const noteNode = chip.querySelector("[data-note]");
            const sayNode = chip.querySelector("[data-say]");
            if (noteNode.getAttribute("data-note") !== note) noteNode.setAttribute("data-note", note);
            if (sayNode && sayNode.textContent !== say) sayNode.textContent = say;
        };

        const show = (n) => {
            const tried = [];
            let verdict = null;
            chips.forEach((chip) => {
                const p = Number(chip.dataset.prime);
                if (verdict !== null || n === 1) { setChip(chip, "is-idle", "", ""); return; }
                if (p * p > n) {
                    setChip(chip, "is-stop", `${fmt(p * p)} > ${fmt(n)}`, `${p} × ${p} = ${fmt(p * p)} is past ${fmt(n)}`);
                    verdict = { prime: true, stop: p };
                    return;
                }
                const q = Math.floor(n / p);
                const r = n % p;
                if (r) {
                    setChip(chip, "is-miss", `r ${r}`, `${fmt(n)} ÷ ${p} = ${fmt(q)} r ${r}`);
                    tried.push(p);
                } else {
                    setChip(chip, "is-hit", `× ${fmt(q)}`, `${fmt(n)} ÷ ${p} = ${fmt(q)} exactly`);
                    verdict = { prime: false, p, q };
                }
            });

            let sentence;
            if (n === 1) {
                sentence = "1 has one factor, itself, so it is not prime: a prime has exactly two.";
            } else if (verdict.prime) {
                const stop = `${verdict.stop} × ${verdict.stop} = ${fmt(verdict.stop * verdict.stop)} is past ${fmt(n)}`;
                sentence = tried.length
                    ? `${fmt(n)} is prime: the ${tried.length > 1 ? "candidates" : "candidate"} ${join(tried, "and")} ${tried.length > 1 ? "each leave" : "leaves"} a remainder, and ${stop}.`
                    : `${fmt(n)} is prime: ${stop}, so no candidate factor needs trying.`;
            } else {
                const found = `${fmt(n)} = ${verdict.p} × ${fmt(verdict.q)}, so ${fmt(n)} is not prime`;
                sentence = tried.length
                    ? `${found}; the ${tried.length > 1 ? "candidates" : "candidate"} ${join(tried, "and")} ${tried.length > 1 ? "leave remainders" : "leaves a remainder"}.`
                    : `${found}.`;
            }
            if (summary.textContent !== sentence) summary.textContent = sentence;
        };

        const valid = (digits) => digits.length >= 1 && digits.length <= 3;

        const update = () => {
            /* Digits only, no leading zero, and the caret kept where it was
               relative to the digits that survive. */
            const raw = input.value;
            const caret = input.selectionStart;
            const cleaned = raw.replace(/\D/g, "").replace(/^0+/, "");
            if (cleaned !== raw) {
                const before = raw.slice(0, caret).replace(/\D/g, "").replace(/^0+/, "").length;
                input.value = cleaned;
                input.setSelectionRange(before, before);
            }
            const ok = valid(cleaned);
            list.classList.toggle("is-hidden", !ok);
            summary.classList.toggle("is-hidden", !ok);
            if (empty) empty.hidden = ok;
            input.setAttribute("aria-invalid", ok ? "false" : "true");
            if (ok) show(Number(cleaned));
        };

        input.addEventListener("input", update);
        update();
    };

    document.querySelectorAll("[data-trier]").forEach(createTester);

    const scenes = Array.from(document.querySelectorAll("[data-prime-scene]"))
        .map(createScene).filter(Boolean);
    if (!scenes.length) return;

    const refresh = () => scenes.forEach((s) => s.requestUpdate());
    window.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", refresh);
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", refresh);
    refresh();
});
