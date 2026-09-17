/* Multiples and the divisibility tests.

   One figure, the engine that drives it, and a live tester.

   The figure counts in 4s and in 6s along a single number line, one count
   marked above it and one below. Keeping them on opposite sides is what makes
   a common multiple visible as a place both counts reach, rather than a number
   that turns up in two written lists.

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
    /* Marks that sit apart on screen are one run of characters to anything that
       strips the styling: "4,930" above "looks after itself" comes out as
       "4,930looks after itself", and two cross-faded panels weld into each
       other. Walking the finished figure once and parting every pair of
       text-bearing neighbours costs nothing on screen and keeps the flattened
       page readable. */
    const stack = (parent, ...kids) => {
        kids.forEach((kid) => parent.appendChild(kid));
        return parent;
    };
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
    /* A mark is opened over its own stage and stays open afterwards. */
    const from = (shown, stage) => clamp((shown - (stage - 1)) * 1.6);

    /* ------------------------------------------------- two counts, one line */

    const CW = 700;
    const CH = 176;
    const CAXIS = 96;
    const CLEFT = 26;
    const CRIGHT = CW - 26;

    const common = {
        n: 36,
        fours: [4, 8, 12, 16, 20, 24, 28, 32, 36],
        sixes: [6, 12, 18, 24, 30, 36],
        meets: [12, 24, 36],
        stages: [
            { title: "The numbers 1 to 36", copy: "Rolls are counted in 4s above the line and sausages in 6s below it." },
            { title: "Packs of 4 rolls", copy: "4, 8, 12, 16, 20, 24, 28, 32, 36: every number of rolls that whole packs can make." },
            { title: "Packs of 6 sausages", copy: "6, 12, 18, 24, 30, 36: every number of sausages that whole packs can make." },
            { title: "Where both counts land", copy: "12, 24 and 36 are reached by both, so those are the orders with no roll and no sausage spare: the common multiples of 4 and 6." },
            { title: "The first meeting", copy: "12 is the smallest such order, the lowest common multiple, and 24 and 36 are that order doubled and trebled." }
        ],
        notes: ["", "4, 8, 12, 16, 20, 24, 28, 32, 36", "6, 12, 18, 24, 30, 36", "12, 24, 36", "12 × 1,  12 × 2,  12 × 3"],

        build(board) {
            board.replaceChildren();
            const figure = el("div", "cline");
            const svg = svgEl("svg", "cline__svg");
            svg.setAttribute("viewBox", `0 0 ${CW} ${CH}`);
            svg.setAttribute("aria-hidden", "true");
            svg.setAttribute("focusable", "false");
            const at = (v) => CLEFT + ((v - 1) / (this.n - 1)) * (CRIGHT - CLEFT);

            const axis = svgEl("line", "cline__axis");
            axis.setAttribute("x1", CLEFT); axis.setAttribute("x2", CRIGHT);
            axis.setAttribute("y1", CAXIS); axis.setAttribute("y2", CAXIS);
            svg.appendChild(axis);

            for (let v = 1; v <= this.n; v += 1) {
                const tick = svgEl("line", "cline__tick");
                tick.setAttribute("x1", at(v)); tick.setAttribute("x2", at(v));
                tick.setAttribute("y1", CAXIS - 5); tick.setAttribute("y2", CAXIS + 5);
                svg.appendChild(tick);
            }

            /* One count above the line and one below, so neither owns it. */
            const mark = (value, up, kind) => {
                const g = svgEl("g", "cline__step");
                const x = at(value);
                const y = CAXIS + (up ? -34 : 34);
                const stem = svgEl("line", `cline__stem cline__stem--${kind}`);
                stem.setAttribute("x1", x); stem.setAttribute("x2", x);
                stem.setAttribute("y1", CAXIS); stem.setAttribute("y2", y + (up ? 8 : -8));
                g.appendChild(stem);
                if (up) {
                    const dot = svgEl("circle", `cline__four`);
                    dot.setAttribute("cx", x); dot.setAttribute("cy", y); dot.setAttribute("r", 7);
                    g.appendChild(dot);
                } else {
                    const box = svgEl("rect", `cline__six`);
                    box.setAttribute("x", x - 6.5); box.setAttribute("y", y - 6.5);
                    box.setAttribute("width", 13); box.setAttribute("height", 13);
                    box.setAttribute("rx", 2.5);
                    g.appendChild(box);
                }
                const label = svgEl("text", `cline__label cline__label--${kind}`);
                label.setAttribute("x", x); label.setAttribute("y", y + (up ? -14 : 22));
                label.textContent = String(value);
                g.appendChild(label);
                svg.appendChild(g);
                return g;
            };

            const fours = this.fours.map((v) => mark(v, true, "four"));
            const sixes = this.sixes.map((v) => mark(v, false, "six"));

            const meets = this.meets.map((v) => {
                const g = svgEl("g", "cline__meet");
                const ring = svgEl("circle", "cline__ring");
                ring.setAttribute("cx", at(v)); ring.setAttribute("cy", CAXIS); ring.setAttribute("r", 11);
                g.appendChild(ring);
                svg.appendChild(g);
                return g;
            });

            figure.appendChild(svg);

            /* The list each stage has just drawn. The last is written into the
               element and the rest drawn by the stylesheet, so a stripped page
               reads one true line rather than every stage at once. */
            const line = el("p", "cline__note");
            const faces = this.notes.map((text, i) => {
                if (i === this.notes.length - 1) return el("span", "cline__face", text);
                const face = el("span", "cline__face cline__face--from");
                face.setAttribute("data-face", text);
                face.setAttribute("aria-hidden", "true");
                return face;
            });
            line.append(...faces);
            figure.appendChild(line);
            board.appendChild(part(figure));
            return { fours, sixes, meets, faces };
        },

        place(parts, shown) {
            /* Each count is written left to right across its own stage. */
            const run = (marks, stage) => marks.forEach((g, i) => {
                const spread = clamp((shown - (stage - 1)) * marks.length - i * 0.7);
                g.style.opacity = clamp(spread).toFixed(3);
            });
            run(parts.fours, 1);
            run(parts.sixes, 2);
            parts.meets.forEach((g, i) => {
                g.style.opacity = clamp((shown - 2) * 3 - i * 0.55).toFixed(3);
                /* The last stage is about the first meeting alone, so 12 is
                   drawn heavier and the two later rings step back. */
                const first = clamp(shown - 3);
                g.style.setProperty("--first", (i === 0 ? first : -first).toFixed(3));
            });
            parts.faces.forEach((face, i) => {
                face.style.opacity = clamp(1 - Math.abs(shown - i) * 1.5).toFixed(3);
            });
        }
    };



    const FIGURES = { common };

    const painter = {
        read: (scene) => FIGURES[scene.dataset.figure] || null,
        stages: (model) => model.stages.length - 1,
        build: (board, model) => model.build(board),
        caption: (model, index) => model.stages[Math.min(index, model.stages.length - 1)],
        still(parts, model) { model.place(parts, model.stages.length - 1); },
        /* The board rests at the state its caption names, and moves into it out
           of the one before. */
        paint(parts, model, index, within) { model.place(parts, index - 1 + ease(clamp(within))); }
    };

    /* --------------------------------------------------------------- engine */

    const createScene = (scene) => {
        const sticky = scene.querySelector(".mult-scene__sticky");
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
            dot.className = "mult-scene__dot";
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

       The six syllabus tests run on a number of the reader's own. Every row is
       built in the markup with 4,932 already answered, so a page without
       scripts shows one true state; the script only rewrites the text in
       place, and never rebuilds the list under the cursor. */

    const createTester = (root) => {
        const input = root.querySelector("[data-tester-input]");
        const list = root.querySelector("[data-tester-list]");
        const empty = root.querySelector("[data-tester-empty]");
        const summary = root.querySelector("[data-tester-summary]");
        if (!input || !list) return;
        const rows = Array.from(list.querySelectorAll("[data-test]"));
        const fmt = (n) => n.toLocaleString("en-GB");
        const digitSum = (digits) => digits.split("").reduce((a, d) => a + Number(d), 0);
        const sumText = (digits) => `${digits.split("").join(" + ")} = ${digitSum(digits)}`;

        /* What each test reads off the digits, in the words the cards use. */
        const evidence = {
            2: (d) => `The last digit is ${d.slice(-1)}.`,
            5: (d) => `The last digit is ${d.slice(-1)}.`,
            10: (d) => `The last digit is ${d.slice(-1)}.`,
            4: (d) => `The last two digits make ${d.slice(-2)}.`,
            3: (d) => `The digits add to ${sumText(d)}.`,
            9: (d) => `The digits add to ${sumText(d)}.`
        };

        const show = (digits) => {
            const n = Number(digits);
            const yes = [], no = [];
            rows.forEach((row) => {
                const by = Number(row.dataset.test);
                const q = Math.floor(n / by), r = n % by;
                row.querySelector("[data-evidence]").textContent = evidence[by](digits);
                const verdict = row.querySelector("[data-verdict]");
                verdict.textContent = r ? `No: ${fmt(n)} ÷ ${by} = ${fmt(q)} r ${r}` : `Yes: ${fmt(n)} ÷ ${by} = ${fmt(q)}`;
                row.classList.toggle("is-yes", !r);
                row.classList.toggle("is-no", !!r);
                (r ? no : yes).push(by);
            });
            const join = (xs, word) => xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} ${word} ${xs[xs.length - 1]}`;
            const asc = (xs) => xs.slice().sort((x, y) => x - y);
            let text = `${fmt(n)} is a multiple of ${join(asc(yes), "and")}`;
            if (!yes.length) text = `${fmt(n)} is a multiple of none of the six`;
            if (no.length && yes.length) text += `, and not of ${join(asc(no), "or")}`;
            if (summary) summary.textContent = `${text}.`;
        };

        const valid = (digits) => digits.length >= 3 && digits.length <= 4;

        const update = () => {
            /* Digits only, no leading zero, and the caret kept where it was
               relative to the digits that survive. */
            const raw = input.value;
            const caret = input.selectionStart;
            let cleaned = raw.replace(/\D/g, "").replace(/^0+/, "");
            if (cleaned !== raw) {
                const before = raw.slice(0, caret).replace(/\D/g, "").replace(/^0+/, "").length;
                input.value = cleaned;
                input.setSelectionRange(before, before);
            }
            const ok = valid(cleaned);
            list.classList.toggle("is-hidden", !ok);
            if (summary) summary.classList.toggle("is-hidden", !ok);
            if (empty) empty.hidden = ok;
            input.setAttribute("aria-invalid", ok ? "false" : "true");
            if (ok) show(cleaned);
        };

        input.addEventListener("input", update);
        update();
    };

    document.querySelectorAll("[data-tester]").forEach(createTester);

    const scenes = Array.from(document.querySelectorAll("[data-mult-scene]"))
        .map(createScene).filter(Boolean);
    if (!scenes.length) return;

    const refresh = () => scenes.forEach((s) => s.requestUpdate());
    window.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", refresh);
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", refresh);
    refresh();
});
