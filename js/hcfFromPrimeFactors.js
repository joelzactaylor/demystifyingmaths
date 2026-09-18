/* Highest common factor: a scroll-led comparison of two index-form
   factorisations, a second scene that peels the shared primes out of two
   factor rings, and a live finder that aligns two chosen numbers prime by
   prime. Each scene builds its complete mathematics once, then reveals
   continuous drawing states from scroll progress. The rings are drawn the
   way primeFactorisation.js draws them, so a reader meets the same picture. */

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
    const reveal = (shown, stage) => ease(clamp(shown - stage + 1));
    const superscript = (n) => String(n).split("").map((digit) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(digit)]).join("");

    /* An index of 1 is not written in index form; the comparison writes it once the
       zero indices arrive, so the tspan carrying it can take a later stage than its base. */
    const powerText = (cls, x, y, base, index, stage, indexStage = stage) => {
        const text = svg("text", { class: cls, x, y, "text-anchor": "middle", "data-stage": stage });
        text.append(document.createTextNode(String(base)));
        const caret = svg("tspan", { class: "caret" });
        caret.textContent = "^";
        const sup = svg("tspan", { class: "index", dy: -11, "data-stage": indexStage });
        sup.textContent = index;
        text.append(caret, sup);
        return text;
    };

    const compareModel = {
        captions: [
            ["Write both numbers in index form", "360 = 2³ × 3² × 5 and 756 = 2² × 3³ × 7, with equal primes in the same column."],
            ["Give every prime a place in both", "3² means two factors of 3, 5¹ means one factor of 5, and 7⁰ means none. Writing 7⁰ in 360 and 5⁰ in 756 gives both numbers the same four primes."],
            ["The 2s: 756 has only two", "A factor of both numbers has to fit inside both: it contains no more factors of 2 than either. 360 has three and 756 has two, so the HCF takes 2²."],
            ["The 3s: 360 has only two", "360 contains two factors of 3 and 756 contains three. A factor of both contains at most two, so the HCF takes 3², again the lower index."],
            ["The 5s and 7s: one number has none", "756 contains no factor of 5 and 360 contains no factor of 7. The lower index of each is 0, so neither prime is in the HCF."],
            ["Multiply the chosen powers", "HCF = 2² × 3² = 4 × 9 = 36, with 5⁰ and 7⁰ contributing no factor."]
        ],
        build(root) {
            root.replaceChildren();
            const drawing = svg("svg", { viewBox: "0 0 700 356", "aria-hidden": "true", focusable: "false" });
            const columns = { 2: 250, 3: 360, 5: 470, 7: 580 };
            const primes = [2, 3, 5, 7];
            const chosenStage = { 2: 2, 3: 3, 5: 4, 7: 4 };
            const hcfY = 248;
            const rows = [
                { label: "360 =", y: 68, powers: { 2: 3, 3: 2, 5: 1, 7: 0 }, chosen: [3, 7] },
                { label: "756 =", y: 148, powers: { 2: 2, 3: 3, 5: 0, 7: 1 }, chosen: [2, 5] }
            ];
            const marks = [];
            const zeros = [];
            const cell = (x, y, cls, stage) => svg("rect", { class: cls, x: x - 42, y: y - 27, width: 84, height: 54, rx: 12, "data-stage": stage });
            /* Drop lines first, so they pass behind the cells of the row between. */
            rows.forEach((row) => row.chosen.forEach((prime) => {
                const drop = svg("path", { class: "scene-drop", d: `M ${columns[prime]} ${row.y + 28} V ${hcfY - 30}`, "data-stage": chosenStage[prime] });
                drawing.appendChild(drop);
                (row.powers[prime] === 0 ? zeros : marks).push(drop);
            }));
            rows.forEach((row) => {
                const label = svg("text", { class: "scene-label", x: 200, y: row.y + 8, "text-anchor": "end", "data-stage": 0 });
                label.textContent = row.label;
                drawing.appendChild(label);
                marks.push(label);
                primes.forEach((prime, i) => {
                    const x = columns[prime];
                    const index = row.powers[prime];
                    const stage = index === 0 ? 1 : 0;
                    const base = cell(x, row.y, index === 0 ? "scene-cell is-zero" : "scene-cell", stage);
                    drawing.appendChild(base);
                    marks.push(base);
                    if (row.chosen.includes(prime)) {
                        const chosen = cell(x, row.y, index === 0 ? "scene-cell is-zero is-chosen" : "scene-cell is-chosen", chosenStage[prime]);
                        drawing.appendChild(chosen);
                        marks.push(chosen);
                    }
                    const power = powerText("scene-power", x, row.y + 8, prime, index, stage, index === 1 ? 1 : stage);
                    drawing.appendChild(power);
                    marks.push(power, power.lastChild);
                    if (i < primes.length - 1) {
                        /* A sign after a zero-index cell arrives with that cell; a sign that would
                           trail the row until one arrives waits for it too. */
                        const laterPresent = primes.slice(i + 1).some((q) => row.powers[q] > 0);
                        const times = svg("text", { class: "scene-times", x: x + 55, y: row.y + 8, "text-anchor": "middle", "data-stage": stage === 1 || !laterPresent ? 1 : 0 });
                        times.textContent = "×";
                        drawing.appendChild(times);
                        marks.push(times);
                    }
                });
            });
            const hcfLabel = svg("text", { class: "scene-label", x: 200, y: hcfY + 8, "text-anchor": "end", "data-stage": 2 });
            hcfLabel.textContent = "HCF =";
            drawing.appendChild(hcfLabel);
            marks.push(hcfLabel);
            const hcfPowers = { 2: 2, 3: 2, 5: 0, 7: 0 };
            primes.forEach((prime, i) => {
                const x = columns[prime];
                const stage = chosenStage[prime];
                const box = cell(x, hcfY, hcfPowers[prime] === 0 ? "scene-cell is-zero is-chosen" : "scene-cell is-chosen", stage);
                const power = powerText("scene-power is-hcf", x, hcfY + 8, prime, hcfPowers[prime], stage);
                drawing.append(box, power);
                if (hcfPowers[prime] === 0) zeros.push(box, power); else marks.push(box, power);
                if (i < primes.length - 1) {
                    const times = svg("text", { class: "scene-times", x: x + 55, y: hcfY + 8, "text-anchor": "middle", "data-stage": chosenStage[primes[i + 1]] });
                    times.textContent = "×";
                    drawing.appendChild(times);
                    if (primes[i + 1] === 5 || primes[i + 1] === 7) zeros.push(times); else marks.push(times);
                }
            });
            const equation = svg("text", { class: "scene-equation", x: 350, y: 342, "text-anchor": "middle", "data-stage": 5 });
            equation.textContent = "HCF = 2² × 3² = 36";
            drawing.appendChild(equation);
            marks.push(equation);
            root.appendChild(drawing);
            return { marks, zeros };
        },
        paint(parts, shown) {
            parts.marks.forEach((mark) => setOpacity(mark, reveal(shown, Number(mark.dataset.stage))));
            /* The zero-index powers in the HCF row arrive at stage 4 and fade at stage 5,
               when the product is written without them. */
            parts.zeros.forEach((mark) => setOpacity(mark, reveal(shown, Number(mark.dataset.stage)) * (1 - 0.7 * reveal(shown, 5))));
        }
    };


    /* Factor rings, as drawn on the prime factorisation page: one sector per
       prime factor, coloured by prime, the number in the centre. */
    const primeColour = (p) => {
        if (p === 2) return "#b86821";
        if (p === 3) return "#116e93";
        if (p === 5) return "#09539d";
        if (p === 7) return "#d99a20";
        return "#52666f";
    };
    const lerp = (a, b, t) => a + (b - a) * t;
    const polar = (radius, angle) => ({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
    const fullRing = (outerRadius, innerRadius) => {
        const outer = `M ${outerRadius} 0 A ${outerRadius} ${outerRadius} 0 1 1 ${-outerRadius} 0 A ${outerRadius} ${outerRadius} 0 1 1 ${outerRadius} 0 Z`;
        const inner = `M ${innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${-innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${innerRadius} 0 Z`;
        return `${outer} ${inner}`;
    };
    const ringWedge = (outerRadius, innerRadius, start, end) => {
        if (end - start >= Math.PI * 2 - .001) return fullRing(outerRadius, innerRadius);
        if (end - start < .0005) return "";
        const safeEnd = Math.min(end, start + Math.PI * 2 - .001);
        const largeArc = safeEnd - start > Math.PI ? 1 : 0;
        const outerStart = polar(outerRadius, start);
        const outerEnd = polar(outerRadius, safeEnd);
        const innerEnd = polar(innerRadius, safeEnd);
        const innerStart = polar(innerRadius, start);
        return `M ${outerStart.x.toFixed(2)} ${outerStart.y.toFixed(2)} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x.toFixed(2)} ${outerEnd.y.toFixed(2)} L ${innerEnd.x.toFixed(2)} ${innerEnd.y.toFixed(2)} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x.toFixed(2)} ${innerStart.y.toFixed(2)} Z`;
    };
    const drawText = (parent, className, x, y, value, size) => {
        const node = svg("text", { class: className, x, y, "text-anchor": "middle" });
        if (size) node.style.fontSize = `${size}px`;
        node.textContent = value;
        parent.appendChild(node);
        return node;
    };
    const drawDisc = (parent, x, y, radius, factors) => {
        const group = svg("g", { class: "factor-ring__disc", transform: `translate(${x} ${y})` });
        group.appendChild(svg("circle", { class: "factor-ring__base", r: radius }));
        const inner = Math.max(5, radius * .58);
        const sectors = factors.map((factor) => {
            const shape = svg("path", { class: "factor-ring__sector", fill: primeColour(factor) });
            group.appendChild(shape);
            return shape;
        });
        group.appendChild(svg("circle", { class: "factor-ring__outline", r: radius }));
        group.appendChild(svg("circle", { class: "factor-ring__centre", r: inner }));
        const value = drawText(group, "factor-ring__value", 0, Math.max(2.5, radius * .17), "", Math.max(6, radius * .48));
        const next = drawText(group, "factor-ring__value", 0, Math.max(2.5, radius * .17), "", Math.max(6, radius * .48));
        parent.appendChild(group);
        return { group, sectors, inner, radius, value, next };
    };

    const ringsModel = {
        captions: [
            ["Both numbers as rings of prime factors", "360 = 2 × 2 × 2 × 3 × 3 × 5 and 756 = 2 × 2 × 3 × 3 × 3 × 7, with one sector for each prime factor."],
            ["Take a 2 out of both", "2 divides both numbers. One 2 leaves each ring, and the two of them become one disc: 360 ÷ 2 = 180 and 756 ÷ 2 = 378."],
            ["Take another 2 out of both", "180 and 378 are both even, so a second 2 leaves each ring: 180 ÷ 2 = 90 and 378 ÷ 2 = 189."],
            ["Take a 3 out of both", "90 and 189 both have a factor of 3, so a 3 leaves each ring: 90 ÷ 3 = 30 and 189 ÷ 3 = 63."],
            ["Take another 3 out of both", "30 and 63 share one more 3: 30 ÷ 3 = 10 and 63 ÷ 3 = 21. The rings 2 × 5 and 3 × 7 have no sector in common."],
            ["Multiply what came out", "The primes taken out of both rings make 2 × 2 × 3 × 3 = 36, the HCF. 10 and 21 share no factor other than 1."]
        ],
        build(root) {
            root.replaceChildren();
            const drawing = svg("svg", { viewBox: "0 0 700 330", "aria-hidden": "true", focusable: "false" });
            const removals = [2, 2, 3, 3];
            const rings = [
                { x: 190, y: 118, factors: [2, 2, 2, 3, 3, 5], value: 360 },
                { x: 510, y: 118, factors: [2, 2, 3, 3, 3, 7], value: 756 }
            ].map((ring) => ({ ...ring, disc: drawDisc(drawing, ring.x, ring.y, 64, ring.factors) }));
            const slots = removals.map((prime, j) => ({ prime, x: 350 + (j - 1.5) * 66, y: 262 }));
            /* Two travelling discs per removal, one from each ring, meeting at the slot. */
            const travellers = slots.map((slot) => rings.map(() => {
                const disc = drawDisc(drawing, slot.x, slot.y, 22, [slot.prime]);
                disc.sectors[0].setAttribute("d", fullRing(22, disc.inner));
                disc.value.textContent = slot.prime;
                disc.group.style.opacity = 0;
                return disc;
            }));
            const times = slots.slice(1).map((slot) => {
                const sign = svg("text", { class: "scene-times", x: slot.x - 33, y: slot.y + 8, "text-anchor": "middle" });
                sign.textContent = "×";
                sign.style.opacity = 0;
                drawing.appendChild(sign);
                return sign;
            });
            const equation = svg("text", { class: "scene-equation", x: 350, y: 318, "text-anchor": "middle", "data-stage": 5 });
            equation.textContent = "HCF = 2 × 2 × 3 × 3 = 36";
            drawing.appendChild(equation);
            root.appendChild(drawing);
            return { rings, removals, slots, travellers, times, equation };
        },
        paint(parts, shown) {
            const { rings, removals, slots, travellers, times, equation } = parts;
            rings.forEach((ring) => {
                let remaining = ring.factors.slice();
                let value = ring.value;
                let leaving = -1;
                let progress = 0;
                let nextValue = value;
                removals.forEach((prime, j) => {
                    const t = reveal(shown, j + 1);
                    if (t <= 0) return;
                    const index = remaining.indexOf(prime);
                    if (t >= 1) { remaining.splice(index, 1); value /= prime; return; }
                    if (leaving < 0) { leaving = index; progress = t; nextValue = value / prime; }
                });
                const n = remaining.length;
                const full = Math.PI * 2 / n;
                const grown = leaving < 0 ? full : Math.PI * 2 / (n - 1);
                let angle = -Math.PI / 2;
                const centroids = [];
                /* Sectors are laid out from the remaining list, so removed ones vanish and the
                   rest share the ring evenly, growing as a leaving sector shrinks. */
                ring.disc.sectors.forEach((shape) => shape.setAttribute("d", ""));
                remaining.forEach((factor, i) => {
                    const span = i === leaving ? full * (1 - progress) : lerp(full, grown, progress);
                    const shape = ring.disc.sectors[i];
                    shape.setAttribute("fill", primeColour(factor));
                    shape.setAttribute("d", ringWedge(ring.disc.radius, ring.disc.inner, angle, angle + span));
                    centroids.push(polar((ring.disc.radius + ring.disc.inner) / 2, angle + span / 2));
                    angle += span;
                });
                ring.disc.value.textContent = value;
                ring.disc.next.textContent = nextValue;
                ring.disc.value.style.opacity = leaving < 0 ? 1 : 1 - progress;
                ring.disc.next.style.opacity = leaving < 0 ? 0 : progress;
                ring.leavingFrom = leaving < 0 ? null : { x: ring.x + centroids[leaving].x, y: ring.y + centroids[leaving].y };
            });
            slots.forEach((slot, j) => {
                const t = reveal(shown, j + 1);
                travellers[j].forEach((disc, r) => {
                    const ring = rings[r];
                    const from = ring.leavingFrom || { x: ring.x, y: ring.y };
                    const x = t >= 1 ? slot.x : lerp(from.x, slot.x, t);
                    const y = t >= 1 ? slot.y : lerp(from.y, slot.y, t);
                    const scale = lerp(.55, 1, t);
                    disc.group.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale.toFixed(3)})`);
                    disc.group.style.opacity = t > 0 ? 1 : 0;
                });
                if (j > 0) setOpacity(times[j - 1], t);
            });
            setOpacity(equation, reveal(shown, 5));
        }
    };

    const models = { compare: compareModel, rings: ringsModel };

    const scenes = [];

    const createScene = (scene) => {
        const sticky = scene.querySelector(".hcf-scene__sticky");
        const board = scene.querySelector("[data-board]");
        const title = scene.querySelector("[data-step-title]");
        const copy = scene.querySelector("[data-step-copy]");
        const progress = scene.querySelector("[data-progress]");
        const model = models[scene.dataset.kind];
        if (!sticky || !board || !model) return null;

        const parts = model.build(board);
        const last = model.captions.length - 1;
        const cardHeight = sticky.offsetHeight;
        let active = -1;
        progress.replaceChildren(...model.captions.map(() => {
            const dot = document.createElement("i");
            dot.className = "hcf-scene__dot";
            return dot;
        }));
        scene.style.setProperty("--scene-height", `${model.captions.length * 52}vh`);
        scene.style.setProperty("--scene-min-height", `${model.captions.length * 400}px`);
        scene.classList.add("is-ready");

        const paint = (fraction) => {
            const position = clamp(fraction) * (last + 2) - 1;
            const index = clamp(Math.floor(position + 1), 0, last);
            const within = clamp(position - Math.floor(position));
            const shown = Math.max(0, Math.floor(position) + ease(clamp(within / .58)));
            model.paint(parts, reduceMotion.matches ? last : shown);
            if (index !== active) {
                active = index;
                title.textContent = model.captions[index][0];
                copy.textContent = model.captions[index][1];
                Array.from(progress.children).forEach((dot, i) => {
                    dot.classList.toggle("is-past", i < index);
                    dot.classList.toggle("is-current", i === index);
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

    document.querySelectorAll("[data-hcf-scene]").forEach((scene) => {
        const controller = createScene(scene);
        if (controller) scenes.push(controller);
    });
    window.addEventListener("scroll", () => scenes.forEach((scene) => scene.requestUpdate()), { passive: true });
    window.addEventListener("resize", () => scenes.forEach((scene) => scene.requestUpdate()));
    reduceMotion.addEventListener("change", () => scenes.forEach((scene) => scene.update()));
    scenes.forEach((scene) => scene.update());

    /* Live finder ------------------------------------------------------ */

    const factorise = (n) => {
        const powers = new Map();
        let remaining = n;
        for (let p = 2; p * p <= remaining; p += p === 2 ? 1 : 2) {
            while (remaining % p === 0) { powers.set(p, (powers.get(p) || 0) + 1); remaining /= p; }
        }
        if (remaining > 1) powers.set(remaining, (powers.get(remaining) || 0) + 1);
        return powers;
    };
    const indexForm = (powers) => Array.from(powers, ([p, e]) => e > 1 ? `${p}${superscript(e)}` : String(p)).join(" × ");
    const format = (n) => n.toLocaleString("en-GB");

    document.querySelectorAll("[data-hcf-finder]").forEach((finder) => {
        const inputs = finder.querySelectorAll("[data-hcf-input]");
        const table = finder.querySelector("[data-hcf-table]");
        const answer = finder.querySelector("[data-hcf-answer]");
        if (inputs.length !== 2 || !table || !answer) return;

        const cellFor = (row, base, index, cls) => {
            const span = document.createElement("span");
            if (cls) span.className = cls;
            if (base) {
                span.append(document.createTextNode(String(base)));
                const caret = document.createElement("span");
                caret.className = "caret";
                caret.setAttribute("aria-hidden", "true");
                caret.textContent = "^";
                const sup = document.createElement("sup");
                sup.textContent = index;
                span.append(caret, sup);
            }
            row.appendChild(span);
        };

        const render = () => {
            const values = Array.from(inputs, (input) => {
                const text = input.value.trim().replace(/,/g, "");
                return /^\d{1,4}$/.test(text) ? Number(text) : NaN;
            });
            if (values.some((v) => !Number.isInteger(v) || v < 2 || v > 9999)) {
                table.replaceChildren();
                const empty = document.createElement("p");
                empty.className = "hcf-finder__empty";
                empty.textContent = "Enter two whole numbers from 2 to 9,999.";
                table.appendChild(empty);
                answer.textContent = "";
                return;
            }
            const [a, b] = values;
            const [fa, fb] = [factorise(a), factorise(b)];
            const primes = Array.from(new Set([...fa.keys(), ...fb.keys()])).sort((x, y) => x - y);
            const hcf = new Map();
            primes.forEach((p) => { if (fa.has(p) && fb.has(p)) hcf.set(p, Math.min(fa.get(p), fb.get(p))); });
            const value = Array.from(hcf, ([p, e]) => p ** e).reduce((acc, v) => acc * v, 1);

            table.replaceChildren();
            const rowFor = (label, powers, cls) => {
                const row = document.createElement("div");
                row.className = `hcf-finder__row${cls ? ` ${cls}` : ""}`;
                row.style.setProperty("--columns", primes.length);
                const b = document.createElement("b");
                b.textContent = label;
                row.appendChild(b);
                primes.forEach((p) => {
                    const e = powers.get(p) || 0;
                    const shared = hcf.has(p);
                    /* The lower index of each column is the chosen one; a missing prime's 0 is
                       always the lower, and the HCF row is chosen throughout. */
                    const lower = cls || e === (hcf.get(p) || 0);
                    let mark = lower ? "is-chosen" : "";
                    if (e === 0) mark += " is-zero";
                    mark = mark.trim();
                    cellFor(row, p, e, mark);
                });
                table.appendChild(row);
            };
            rowFor(`${format(a)} =`, fa);
            rowFor(`${format(b)} =`, fb);
            rowFor("HCF =", hcf, "hcf-finder__row--hcf");

            if (hcf.size === 0) {
                answer.textContent = `HCF of ${format(a)} and ${format(b)} = 1: no prime is shared`;
            } else if (hcf.size === 1 && Array.from(hcf.values())[0] === 1) {
                answer.textContent = `HCF of ${format(a)} and ${format(b)} = ${format(value)}`;
            } else {
                answer.textContent = `HCF of ${format(a)} and ${format(b)} = ${indexForm(hcf)} = ${format(value)}`;
            }
        };

        inputs.forEach((input) => input.addEventListener("input", render));
        render();
    });
});
