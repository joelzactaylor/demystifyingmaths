/* Choosing HCF or LCM in context: two scroll-led scenes and a live pair lab.

   The bus scene draws two rows of departures on one timeline — a bus every 12
   minutes and a bus every 18 — one departure at a time, so the first minute
   both rows share, 36, is seen to be the first number in both counts. The card
   scene tries square tiles on a 60 by 36 rectangle: a side that divides one
   length and not the other leaves a hatched strip of card over, and 12 is the
   side that leaves none. The lab takes two numbers and draws both answers:
   their steps meeting on a line at the LCM, and their lengths cut into pieces
   of the HCF.

   Timing follows the neighbouring Venn page: a scene has more steps than
   captions, and `captionOf[step]` maps each timed step to the caption it
   belongs to, so one caption can span several drawn marks, each with its own
   stationary interval. */

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
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const lcm = (a, b) => (a * b) / gcd(a, b);
    const clock = (minutes) => {
        const h = 9 + Math.floor(minutes / 60), m = minutes % 60;
        return `${h}:${String(m).padStart(2, "0")}`;
    };

    /* A mark fades in at its step; a windowed mark fades in at `on` and out
       again at `off`, for the tile grids that give way to the next try. */
    const fadeMark = (node, step) => ({ paint(shown) { setOpacity(node, ease(phase(shown, step))); } });
    const windowMark = (node, on, off) => ({
        paint(shown) { setOpacity(node, ease(phase(shown, on)) * (1 - ease(phase(shown, off)))); }
    });
    const text = (drawing, cls, x, y, content, attrs = {}) => {
        const node = svg("text", { class: cls, x, y, ...attrs });
        node.textContent = content;
        drawing.appendChild(node);
        return node;
    };

    /* Buses: a bus every 12 minutes and a bus every 18, from 9:00 to 10:12. */
    const busModel = {
        captions: [
            ["Both buses leave at 9:00", "One bus leaves every 12 minutes and the other every 18: each row of the timetable is a count in one step."],
            ["The first bus leaves at the multiples of 12", "12, 24, 36, 48, 60 and 72 minutes past nine: 9:12, 9:24, 9:36, 9:48, 10:00 and 10:12."],
            ["The second bus leaves at the multiples of 18", "18, 36, 54 and 72 minutes past nine: 9:18, 9:36, 9:54 and 10:12."],
            ["36 is the first number in both counts", "LCM(12, 18) = 36, so the buses next leave together at 9:36 — after 3 departures of the first bus and 2 of the second."],
            ["Every later shared departure is a multiple of 36", "72 = 2 × 36 is the next, at 10:12, and 108 = 3 × 36 the one after, at 10:48: the two timetables agree every 36 minutes."]
        ],
        captionOf: [0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 4],
        build(root) {
            root.replaceChildren();
            const drawing = svg("svg", { viewBox: "0 0 780 350", "aria-hidden": "true", focusable: "false" });
            const X0 = 96, PER_MINUTE = 640 / 72;
            const x = (minute) => X0 + minute * PER_MINUTE;
            const LANE_A = 104, LANE_B = 176, AXIS = 242;
            const marks = [];

            // the timetable's axis, ticked every 6 minutes and named every 12
            marks.push(fadeMark(drawing.appendChild(svg("path", { class: "scene-axis", d: `M${x(0)} ${AXIS}H${x(72)}` })), 0));
            for (let minute = 0; minute <= 72; minute += 6) {
                const major = minute % 12 === 0;
                marks.push(fadeMark(drawing.appendChild(svg("path", { class: `scene-tick${major ? " is-major" : ""}`, d: `M${x(minute)} ${AXIS - (major ? 9 : 5)}V${AXIS + (major ? 9 : 5)}` })), 0));
                if (major) marks.push(fadeMark(text(drawing, "scene-time", x(minute), AXIS + 34, clock(minute)), 0));
            }
            // one dashed lane per bus, named by its step
            [[LANE_A, "every 12 minutes", ""], [LANE_B, "every 18 minutes", " is-b"]].forEach(([y, name, cls]) => {
                marks.push(fadeMark(drawing.appendChild(svg("path", { class: "scene-lane", d: `M${x(0)} ${y}H${x(72)}` })), 0));
                marks.push(fadeMark(text(drawing, `scene-lane-label${cls}`, x(0), y - 24, name), 0));
            });
            // the gold frames come before the stops, so the stops paint over them
            const frame = (minute, step) => {
                const node = svg("rect", { class: "scene-frame", x: x(minute) - 22, y: LANE_A - 22, width: 44, height: LANE_B - LANE_A + 44, rx: 14 });
                drawing.appendChild(node);
                marks.push(fadeMark(node, step));
            };
            frame(36, 11);
            frame(72, 12);
            const stop = (minute, y, cls, step) => {
                const node = svg("circle", { class: `scene-stop${cls}`, cx: x(minute), cy: y, r: 9 });
                drawing.appendChild(node);
                marks.push(fadeMark(node, step));
            };
            stop(0, LANE_A, "", 0);
            stop(0, LANE_B, " is-b", 0);
            [12, 24, 36, 48, 60, 72].forEach((minute, i) => stop(minute, LANE_A, "", 1 + i));
            [18, 36, 54, 72].forEach((minute, i) => stop(minute, LANE_B, " is-b", 7 + i));
            // the shared times named in gold above the frames
            marks.push(fadeMark(text(drawing, "scene-time is-shared", x(36), LANE_A - 34, "9:36"), 11));
            marks.push(fadeMark(text(drawing, "scene-time is-shared", x(72), LANE_A - 34, "10:12"), 12));
            marks.push(fadeMark(text(drawing, "scene-equation", 390, 338, "LCM(12, 18) = 36 → 9:36"), 11));
            root.appendChild(drawing);
            return { marks };
        },
        paint(parts, shown) { parts.marks.forEach((mark) => mark.paint(shown)); }
    };

    /* Card: a 60 cm by 36 cm rectangle cut into squares of one size. */
    const cardModel = {
        captions: [
            ["A 60 cm by 36 cm card", "60 cm across and 36 cm down, to be cut into squares of one size with nothing left over."],
            ["9 cm squares leave a strip", "36 ÷ 9 = 4 rows fit, but 60 ÷ 9 = 6 r 6: six squares fit across and a 6 cm strip is left over. 9 divides 36 and not 60."],
            ["20 cm squares leave a strip too", "60 ÷ 20 = 3 squares fit across, but 36 ÷ 20 = 1 r 16: one row fits and a 16 cm strip is left over. 20 divides 60 and not 36."],
            ["12 cm squares fit exactly, and no larger square does", "60 ÷ 12 = 5 across and 36 ÷ 12 = 3 down, nothing over: 5 × 3 = 15 squares. 15, 20 and 30 divide 60 only and 18 divides 36 only, so HCF(60, 36) = 12."]
        ],
        captionOf: [0, 1, 1, 2, 2, 3, 3],
        build(root) {
            root.replaceChildren();
            const drawing = svg("svg", { viewBox: "0 0 780 400", "aria-hidden": "true", focusable: "false" });
            const defs = svg("defs");
            const hatch = svg("pattern", { id: "choice-offcut-hatch", width: 10, height: 10, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" });
            hatch.appendChild(svg("rect", { width: 10, height: 10, fill: "#fff5f4" }));
            hatch.appendChild(svg("path", { d: "M0 0V10", stroke: "#e0a8a1", "stroke-width": 3 }));
            defs.appendChild(hatch);
            drawing.appendChild(defs);

            const UNIT = 7; // drawing units per centimetre
            const W = 60 * UNIT, H = 36 * UNIT;
            const X0 = 180, Y0 = 58;
            const marks = [];

            marks.push(fadeMark(drawing.appendChild(svg("rect", { class: "scene-card", x: X0, y: Y0, width: W, height: H, rx: 4 })), 0));
            // dimensions: 60 cm across the top, 36 cm down the left
            marks.push(fadeMark(drawing.appendChild(svg("path", { class: "scene-dim-line", d: `M${X0} ${Y0 - 26}V${Y0 - 14}M${X0} ${Y0 - 20}H${X0 + W}M${X0 + W} ${Y0 - 26}V${Y0 - 14}` })), 0));
            marks.push(fadeMark(text(drawing, "scene-dim", X0 + W / 2, Y0 - 28, "60 cm"), 0));
            marks.push(fadeMark(drawing.appendChild(svg("path", { class: "scene-dim-line", d: `M${X0 - 26} ${Y0}H${X0 - 14}M${X0 - 20} ${Y0}V${Y0 + H}M${X0 - 26} ${Y0 + H}H${X0 - 14}` })), 0));
            marks.push(fadeMark(text(drawing, "scene-dim scene-dim--end", X0 - 32, Y0 + H / 2 + 6, "36 cm"), 0));

            // one try: every whole square that fits, and the strip left over
            const attempt = (side, on, off, fit) => {
                const group = svg("g");
                const across = Math.floor(60 / side), down = Math.floor(36 / side);
                for (let row = 0; row < down; row++) {
                    for (let col = 0; col < across; col++) {
                        group.appendChild(svg("rect", { class: `scene-square${fit ? " is-fit" : ""}`, x: X0 + col * side * UNIT, y: Y0 + row * side * UNIT, width: side * UNIT, height: side * UNIT }));
                    }
                }
                group.appendChild(text(drawing, `scene-try${fit ? " is-fit" : ""}`, X0 + W + 78, Y0 + 20, `${side} cm`));
                group.appendChild(text(drawing, `scene-try${fit ? " is-fit" : ""}`, X0 + W + 78, Y0 + 46, `squares`));
                drawing.appendChild(group);
                group.querySelectorAll("*").forEach((node) => { node.style.opacity = 1; });
                marks.push(off === null ? fadeMark(group, on) : windowMark(group, on, off));
                return { across, down };
            };
            const offcut = (rect, label, on, off) => {
                const group = svg("g");
                group.appendChild(svg("rect", { class: "scene-offcut", ...rect }));
                group.appendChild(text(drawing, "scene-offcut-label", label.x, label.y, label.text));
                drawing.appendChild(group);
                group.querySelectorAll("*").forEach((node) => { node.style.opacity = 1; });
                marks.push(windowMark(group, on, off));
            };

            attempt(9, 1, 3, false);
            // 60 ÷ 9 = 6 r 6: six squares of 9 fill 54 cm and a 6 cm strip is left along the right
            offcut({ x: X0 + 54 * UNIT, y: Y0, width: 6 * UNIT, height: H }, { x: X0 + 57 * UNIT, y: Y0 + H + 24, text: "6 cm left over" }, 2, 3);
            attempt(20, 3, 5, false);
            // 36 ÷ 20 = 1 r 16: one row of 20 fills 20 cm and a 16 cm strip is left along the bottom
            offcut({ x: X0, y: Y0 + 20 * UNIT, width: W, height: 16 * UNIT }, { x: X0 + W / 2, y: Y0 + H + 24, text: "16 cm left over" }, 4, 5);
            attempt(12, 5, null, true);
            marks.push(fadeMark(text(drawing, "scene-equation is-hcf", 390, 386, "HCF(60, 36) = 12 → 12 cm squares, 5 × 3 = 15"), 6));
            root.appendChild(drawing);
            return { marks };
        },
        paint(parts, shown) { parts.marks.forEach((mark) => mark.paint(shown)); }
    };

    const models = { buses: busModel, card: cardModel };
    const scenes = [];

    const createScene = (scene) => {
        const sticky = scene.querySelector(".choice-scene__sticky");
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
            dot.className = "choice-scene__dot";
            return dot;
        }));
        scene.style.setProperty("--scene-height", `${model.captionOf.length * 46}vh`);
        scene.style.setProperty("--scene-min-height", `${model.captionOf.length * 340}px`);
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

    document.querySelectorAll("[data-choice-scene]").forEach((scene) => {
        const controller = createScene(scene);
        if (controller) scenes.push(controller);
    });
    window.addEventListener("scroll", () => scenes.forEach((scene) => scene.requestUpdate()), { passive: true });
    window.addEventListener("resize", () => scenes.forEach((scene) => scene.requestUpdate()));
    reduceMotion.addEventListener("change", () => scenes.forEach((scene) => scene.update()));
    scenes.forEach((scene) => scene.update());

    /* The pair lab ------------------------------------------------------ */
    const lab = document.querySelector("[data-pair-lab]");
    if (!lab) return;
    const inputA = lab.querySelector("[data-pair-a]");
    const inputB = lab.querySelector("[data-pair-b]");
    const lineHost = lab.querySelector("[data-pair-line]");
    const barsHost = lab.querySelector("[data-pair-bars]");
    const lcmLine = lab.querySelector("[data-pair-lcm]");
    const hcfLine = lab.querySelector("[data-pair-hcf]");
    const status = lab.querySelector("[data-pair-status]");
    const headings = lab.querySelectorAll(".pair-lab__panel h2");
    const MIN = 2, MAX = 40;

    // the two drawings are built once and redrawn in place
    const line = svg("svg", { viewBox: "0 0 700 96", "aria-hidden": "true", focusable: "false" });
    const bars = svg("svg", { viewBox: "0 0 700 100", "aria-hidden": "true", focusable: "false" });
    lineHost.replaceChildren(line);
    barsHost.replaceChildren(bars);

    const drawLine = (a, b, l) => {
        line.replaceChildren();
        const X0 = 34, SPAN = 642, AXIS = 52;
        const x = (n) => X0 + (n / l) * SPAN;
        line.appendChild(svg("path", { class: "lab-axis", d: `M${X0} ${AXIS}H${X0 + SPAN}` }));
        for (let n = a; n <= l; n += a) {
            line.appendChild(svg("path", { class: "lab-step", d: `M${x(n)} ${AXIS}V38` }));
            line.appendChild(svg("circle", { class: "lab-dot", cx: x(n), cy: 36, r: 4.5 }));
        }
        for (let n = b; n <= l; n += b) {
            line.appendChild(svg("path", { class: "lab-step is-b", d: `M${x(n)} ${AXIS}V66` }));
            line.appendChild(svg("circle", { class: "lab-dot is-b", cx: x(n), cy: 68, r: 4.5 }));
        }
        line.appendChild(svg("circle", { class: "lab-meet", cx: x(l), cy: AXIS, r: 9 }));
        text(line, "lab-text lab-text--start", X0 - 10, AXIS + 6, "0");
        if (a !== l) text(line, "lab-text is-a", x(a), 22, String(a));
        if (b !== l) text(line, "lab-text is-b", x(b), 92, String(b));
        text(line, "lab-text is-meet", x(l), 22, l.toLocaleString("en-GB"));
    };
    const drawBars = (a, b, g) => {
        bars.replaceChildren();
        const X0 = 16, unit = 560 / Math.max(a, b);
        [[a, 12, ""], [b, 58, " is-b"]].forEach(([n, y, cls]) => {
            bars.appendChild(svg("rect", { class: `lab-bar${cls}`, x: X0, y, width: n * unit, height: 30, rx: 6 }));
            for (let cut = g; cut < n; cut += g) {
                bars.appendChild(svg("path", { class: "lab-cut", d: `M${X0 + cut * unit} ${y}V${y + 30}` }));
            }
            text(bars, "lab-bar-label", X0 + n * unit + 12, y + 20, `${n} = ${n / g} × ${g}`);
        });
    };

    const read = (input) => {
        const digits = input.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 2);
        if (digits !== input.value) {
            const at = input.selectionStart;
            input.value = digits;
            if (document.activeElement === input) input.setSelectionRange(Math.min(at, digits.length), Math.min(at, digits.length));
        }
        const n = Number(digits);
        return digits && n >= MIN && n <= MAX ? n : null;
    };
    const update = () => {
        const a = read(inputA), b = read(inputB);
        if (a === null || b === null) {
            lab.classList.add("is-invalid");
            status.textContent = `Two whole numbers from ${MIN} to ${MAX} are needed.`;
            return;
        }
        lab.classList.remove("is-invalid");
        status.textContent = "";
        const g = gcd(a, b), l = lcm(a, b);
        headings[0].textContent = `Steps of ${a} and steps of ${b}`;
        headings[1].textContent = `${a} and ${b} split into equal pieces`;
        drawLine(a, b, l);
        drawBars(a, b, g);
        const lText = l.toLocaleString("en-GB");
        lcmLine.textContent = `Steps of ${a} and steps of ${b} first agree at ${lText}: LCM(${a}, ${b}) = ${lText}.`;
        hcfLine.textContent = `The longest equal piece is ${g}: HCF(${a}, ${b}) = ${g}, giving ${a / g} + ${b / g} = ${a / g + b / g} pieces.`;
    };
    inputA.addEventListener("input", update);
    inputB.addEventListener("input", update);
    update();
});
