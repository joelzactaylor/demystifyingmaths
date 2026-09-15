/* Multiples and the divisibility tests.

   Two figures on one engine.

   The first counts in 4s and in 6s along a single number line. Marking one
   count above the line and the other below it is what makes a common multiple
   visible as a place both counts reach, rather than a number that turns up in
   two written lists.

   The third takes 4,932 apart by place and splits each place into the part of
   it that is already a whole number of 9s and the single digit that is left.
   Gathering those leftovers is the digit sum, and seeing them gathered is the
   reason the test works.

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
            { title: "The numbers 1 to 36", copy: "Two counts run along this line: one in 4s, one in 6s." },
            { title: "Counting in 4s", copy: "4, 8, 12, 16, 20, 24, 28, 32, 36: every place a count in 4s reaches." },
            { title: "Counting in 6s", copy: "6, 12, 18, 24, 30, 36: the same line counted in 6s instead." },
            { title: "Where both counts land", copy: "Three places are reached by both: 12, 24 and 36 are the common multiples of 4 and 6." },
            { title: "The first meeting", copy: "12 is the lowest common multiple, and 24 and 36 are its multiples in turn." }
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


    /* ------------------------------------------------- where to cut a number

       One idea, tried three times. Every number splits into a part that is
       certainly a whole number of what is being tested for, and a small part
       left over; only the leftover can decide. The middle stage is the one
       that teaches: the cut that worked for 2, 5 and 10 is tried for 4 and
       fails, which is why that test needs a second digit. A rule that is only
       asserted is a rule the reader has to take on trust. */

    const cut = {
        digits: ["4", "9", "3", "2"],
        /* `at` is how many digits are left of the cut. */
        panels: [
            { at: 3, top: "4,930", bottom: "2", sureAt: 2,
              doubt: "not a whole number of 4s", doubtAt: 3 },
            { at: 2, top: "4,900", bottom: "32", sureAt: 4,
              settle: "a multiple of 4 too", settleAt: 5 }
        ],
        stages: [
            { title: "4,932", copy: "Every test splits the number in two, and asks whether the big part can look after itself.", panel: -1, verdict: -1 },
            { title: "Cut after the tens", copy: "4,932 is 4,930 and 2. Whatever the rest of the number is, it ends in a 0.", panel: 0, verdict: 0 },
            { title: "The big part is safe for 2, 5 and 10", copy: "10 is two 5s and five 2s, so 4,930 is a whole number of each. Only the 2 is left to decide, and 2 is even.", panel: 0, verdict: 1 },
            { title: "The same cut fails for 4", copy: "4,930 ÷ 4 = 1,232 with 2 over, so the big part is not a whole number of 4s and this cut settles nothing.", panel: 0, verdict: 2 },
            { title: "Cut one place further left", copy: "4,932 is 4,900 and 32. 4,900 is 49 hundreds, and 100 = 4 × 25.", panel: 1, verdict: 3 },
            { title: "So 32 decides", copy: "4,900 is a whole number of 4s, which leaves 32, and 32 = 4 × 8. So 4,932 is a multiple of 4.", panel: 1, verdict: 4 }
        ],
        verdicts: [
            "4,930 = 493 × 10",
            "10 = 2 × 5,  so 4,930 is 2,465 twos and 986 fives",
            "4,930 ÷ 4 = 1,232 r 2",
            "4,900 = 49 × 100  and  100 = 4 × 25",
            "32 = 4 × 8,  so 4,932 = 4 × 1,233"
        ],

        build(board) {
            board.replaceChildren();
            const figure = el("div", "cut");

            const row = el("div", "cut__row");
            const rule = el("span", "cut__rule");
            row.appendChild(rule);
            this.digits.forEach((d) => row.appendChild(el("span", "cut__digit", d)));
            figure.appendChild(row);

            /* Both splits are built and cross-faded, so the board never reflows
               as the cut moves. */
            const parts = el("div", "cut__parts");
            const panels = this.panels.map((p) => {
                const panel = el("div", "cut__panel");
                const top = el("div", "cut__box cut__box--top");
                const topValue = el("span", "cut__value", p.top);
                /* The big part is only safe for some divisors, so its label is
                   a pair of faces rather than a standing claim: at the stage
                   where the cut fails, the box has to say so. */
                const role = el("span", "cut__role");
                const kept = el("span", "cut__face", "looks after itself");
                const doubted = el("span", "cut__face cut__face--from");
                doubted.setAttribute("data-face", p.doubt || "");
                doubted.setAttribute("aria-hidden", "true");
                role.append(kept, doubted);
                stack(top, topValue, role);
                const bottom = el("div", "cut__box cut__box--bottom");
                const bottomValue = el("span", "cut__value", p.bottom);
                /* and the leftover stops being an open question once it has
                   been tested, which is the last thing this figure does */
                const open = el("span", "cut__face", "left to decide");
                const closed = el("span", "cut__face cut__face--from");
                closed.setAttribute("data-face", p.settle || "");
                closed.setAttribute("aria-hidden", "true");
                const bottomRole = el("span", "cut__role");
                bottomRole.append(open, closed);
                stack(bottom, bottomValue, bottomRole);
                panel.append(top, el("span", "cut__plus", "+"), bottom);
                parts.appendChild(panel);
                return panel;
            });
            figure.appendChild(parts);

            const line = el("p", "cut__verdict");
            const faces = this.verdicts.map((text, i) => {
                if (i === this.verdicts.length - 1) return el("span", "cut__face", text);
                const face = el("span", "cut__face cut__face--from");
                face.setAttribute("data-face", text);
                face.setAttribute("aria-hidden", "true");
                return face;
            });
            line.append(...faces);
            figure.appendChild(line);

            board.appendChild(part(figure));
            return { rule, panels, faces };
        },

        place(parts, shown) {
            const stage = Math.max(0, Math.min(this.stages.length - 1, Math.round(shown)));
            /* The cut travels between the places it rests at, rather than
               jumping from one digit boundary to the next. */
            const cutAt = (i) => {
                const p = this.stages[Math.max(0, Math.min(this.stages.length - 1, i))].panel;
                return p < 0 ? this.digits.length : this.panels[p].at;
            };
            const lo = Math.floor(shown), t = clamp(shown - lo);
            const at = cutAt(lo) + (cutAt(lo + 1) - cutAt(lo)) * ease(t);
            parts.rule.style.setProperty("--at", at.toFixed(3));
            parts.rule.style.opacity = clamp(shown * 1.6).toFixed(3);

            parts.panels.forEach((panel, i) => {
                const wanted = this.stages[stage].panel === i ? 1 : 0;
                panel.style.opacity = wanted ? clamp((shown - 0.35) * 2).toFixed(3) : "0";
                const p = this.panels[i];
                /* The big part makes no claim until the stage that shows it is
                   safe, and stops making it at the stage that shows it is not. */
                const sure = p.sureAt === undefined ? 1 : clamp(shown - (p.sureAt - 1));
                const doubt = p.doubtAt === undefined ? 0 : clamp(1 - Math.abs(shown - p.doubtAt) * 1.6);
                const settled = p.settleAt === undefined ? 0 : clamp(shown - (p.settleAt - 1));
                panel.style.setProperty("--sure", (sure * (1 - doubt)).toFixed(3));
                panel.style.setProperty("--doubt", doubt.toFixed(3));
                panel.style.setProperty("--settled", settled.toFixed(3));
                const [kept, doubted] = panel.querySelectorAll(".cut__box--top .cut__face");
                kept.style.opacity = (sure * (1 - doubt)).toFixed(3);
                doubted.style.opacity = doubt.toFixed(3);
                const [open, closed] = panel.querySelectorAll(".cut__box--bottom .cut__face");
                open.style.opacity = (1 - settled).toFixed(3);
                closed.style.opacity = settled.toFixed(3);
            });
            parts.faces.forEach((face, i) => {
                face.style.opacity = clamp(1 - Math.abs(shown - (i + 1)) * 1.6).toFixed(3);
            });
        }
    };

    /* ------------------------------------------ 4,932, taken apart by place */

    const nines = {
        /* value: what the place is worth; made: the part of it that is already
           a whole number of 9s; left: the digit that survives. */
        places: [
            { value: "4,000", made: "4 × 999", left: "+ 4" },
            { value: "900", made: "9 × 99", left: "+ 9" },
            { value: "30", made: "3 × 9", left: "+ 3" },
            { value: "2", made: "—", left: "+ 2" }
        ],
        stages: [
            { title: "4,932", copy: "No cut anywhere in this number leaves a big part that is a whole number of 9s." },
            { title: "Place by place", copy: "4,932 is 4 thousands, 9 hundreds, 3 tens and 2 ones." },
            { title: "Every place is 9s and one more", copy: "1,000 is 999 + 1, 100 is 99 + 1, and 10 is 9 + 1, so each place splits in two." },
            { title: "The part made of 9s", copy: "4 × 999 + 9 × 99 + 3 × 9 = 4,914, which is 9 × 546 and needs no testing." },
            { title: "What each place leaves", copy: "Each place leaves its own digit behind: 4 + 9 + 3 + 2 = 18." },
            { title: "18 decides it", copy: "4,914 is a multiple of 9 whatever happens, so 4,932 is one exactly when 18 is." }
        ],

        build(board) {
            board.replaceChildren();
            const figure = el("div", "nines");
            const whole = el("div", "nines__whole", "4,932");
            figure.appendChild(whole);

            const row = el("div", "nines__places");
            const cols = this.places.map((p) => {
                const col = stack(el("div", "nines__col"),
                    el("span", "nines__value", p.value),
                    el("span", "nines__made", p.made),
                    el("span", "nines__left", p.left));
                row.appendChild(col);
                return col;
            });
            figure.appendChild(row);

            const totals = el("div", "nines__totals");
            const total = (kind, sum, caption) => {
                const box = stack(el("div", `nines__total nines__total--${kind}`),
                    el("span", "nines__sum", sum),
                    el("span", "nines__caption", caption));
                totals.appendChild(box);
                return box;
            };
            const made = total("made", "4,914 = 9 × 546", "already 9s");
            const left = total("left", "4 + 9 + 3 + 2 = 18", "left over");
            figure.appendChild(totals);
            board.appendChild(part(figure));
            return { whole, cols, made, left };
        },

        place(parts, shown) {
            parts.whole.style.opacity = from(shown, 0).toFixed(3);
            /* The columns open left to right, and all four are open by the end
               of the stage whose caption names all four. */
            parts.cols.forEach((col, i) => {
                col.style.opacity = clamp(shown * 2.2 - i * 0.3).toFixed(3);
                col.querySelector(".nines__made").style.opacity = from(shown, 2).toFixed(3);
                col.querySelector(".nines__left").style.opacity = from(shown, 4).toFixed(3);
            });
            /* The part made of 9s settles back once it has been counted: it
               needs no testing, and the last stage is about what is left. */
            parts.made.style.opacity = (from(shown, 3) * (1 - 0.6 * clamp(shown - 4))).toFixed(3);
            parts.left.style.opacity = from(shown, 4).toFixed(3);
        }
    };

    const FIGURES = { common, cut, nines };

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

    const scenes = Array.from(document.querySelectorAll("[data-mult-scene]"))
        .map(createScene).filter(Boolean);
    if (!scenes.length) return;

    const refresh = () => scenes.forEach((s) => s.requestUpdate());
    window.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", refresh);
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", refresh);
    refresh();
});
