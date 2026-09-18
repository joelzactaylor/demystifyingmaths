/* Lowest common multiple: a scroll-led scene that grows a ring of 120's prime
   factors until it holds every prime of 252, a comparison of two index-form
   factorisations that takes the higher index of each prime, a third scene that
   gathers both rings into the product and sheds the primes it holds twice, and
   a live finder that aligns two chosen numbers prime by prime. Each scene builds
   its complete mathematics once, then reveals continuous drawing states from
   scroll progress. The rings are drawn the way primeFactorisation.js draws
   them, so a reader meets the same picture. */

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
    /* Eased in at one stage and eased away at the next. */
    const during = (shown, stage) => reveal(shown, stage) * (1 - reveal(shown, stage + 1));
    const superscript = (n) => String(n).split("").map((digit) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(digit)]).join("");
    const format = (n) => n.toLocaleString("en-GB");
    const lerp = (a, b, t) => a + (b - a) * t;

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
        pace: 64,
        captions: [
            ["Write both numbers in index form", "120 = 2³ × 3 × 5 and 252 = 2² × 3² × 7, with equal primes in the same column."],
            ["Give every prime a place in both", "A prime missing from one number has index 0 there: 7⁰ in 120 and 5⁰ in 252. Both numbers now list the same four primes."],
            ["The 2s: 120 has three", "A multiple of 120 contains at least three factors of 2 and a multiple of 252 at least two. A multiple of both contains at least three, so the LCM takes 2³."],
            ["The 3s: 252 has two", "120 contains one factor of 3 and 252 contains two. A multiple of both contains at least two, so the LCM takes 3², again the higher index."],
            ["The 5 and the 7: one number has each", "A multiple of 120 contains a 5 and a multiple of 252 contains a 7. The higher index of each is 1, so both primes are in the LCM."],
            ["Multiply the chosen powers", "LCM = 2³ × 3² × 5 × 7 = 8 × 9 × 35 = 2,520, with 5¹ and 7¹ written as 5 and 7."]
        ],
        build(root) {
            root.replaceChildren();
            const drawing = svg("svg", { viewBox: "0 0 700 356", "aria-hidden": "true", focusable: "false" });
            const columns = { 2: 250, 3: 360, 5: 470, 7: 580 };
            const primes = [2, 3, 5, 7];
            const chosenStage = { 2: 2, 3: 3, 5: 4, 7: 4 };
            const lcmY = 248;
            const rows = [
                { label: "120 =", y: 68, powers: { 2: 3, 3: 1, 5: 1, 7: 0 }, chosen: [2, 5] },
                { label: "252 =", y: 148, powers: { 2: 2, 3: 2, 5: 0, 7: 1 }, chosen: [3, 7] }
            ];
            const marks = [];
            const cell = (x, y, cls, stage) => svg("rect", { class: cls, x: x - 42, y: y - 27, width: 84, height: 54, rx: 12, "data-stage": stage });
            /* Drop lines first, so they pass behind the cells of the row between. */
            rows.forEach((row) => row.chosen.forEach((prime) => {
                const drop = svg("path", { class: "scene-drop", d: `M ${columns[prime]} ${row.y + 28} V ${lcmY - 30}`, "data-stage": chosenStage[prime] });
                drawing.appendChild(drop);
                marks.push(drop);
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
                        const chosen = cell(x, row.y, "scene-cell is-chosen", chosenStage[prime]);
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
            const lcmLabel = svg("text", { class: "scene-label", x: 200, y: lcmY + 8, "text-anchor": "end", "data-stage": 2 });
            lcmLabel.textContent = "LCM =";
            drawing.appendChild(lcmLabel);
            marks.push(lcmLabel);
            const lcmPowers = { 2: 3, 3: 2, 5: 1, 7: 1 };
            primes.forEach((prime, i) => {
                const x = columns[prime];
                const stage = chosenStage[prime];
                const box = cell(x, lcmY, "scene-cell is-chosen", stage);
                const power = powerText("scene-power is-lcm", x, lcmY + 8, prime, lcmPowers[prime], stage);
                drawing.append(box, power);
                marks.push(box, power);
                if (i < primes.length - 1) {
                    const times = svg("text", { class: "scene-times", x: x + 55, y: lcmY + 8, "text-anchor": "middle", "data-stage": chosenStage[primes[i + 1]] });
                    times.textContent = "×";
                    drawing.appendChild(times);
                    marks.push(times);
                }
            });
            const equation = svg("text", { class: "scene-equation", x: 350, y: 342, "text-anchor": "middle", "data-stage": 5 });
            equation.textContent = "LCM = 2³ × 3² × 5 × 7 = 2,520";
            drawing.appendChild(equation);
            marks.push(equation);
            root.appendChild(drawing);
            return { marks };
        },
        paint(parts, shown) {
            parts.marks.forEach((mark) => setOpacity(mark, reveal(shown, Number(mark.dataset.stage))));
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
    /* A ring with room for `factors.length` sectors. Each sector has a gold glow
       drawn over it, kept invisible until a stage lights it. */
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
        const glows = factors.map(() => {
            const shape = svg("path", { class: "factor-ring__glow" });
            shape.style.opacity = 0;
            group.appendChild(shape);
            return shape;
        });
        group.appendChild(svg("circle", { class: "factor-ring__centre", r: inner }));
        const value = drawText(group, "factor-ring__value", 0, Math.max(2.5, radius * .17), "", Math.max(6, radius * .48));
        const next = drawText(group, "factor-ring__value", 0, Math.max(2.5, radius * .17), "", Math.max(6, radius * .48));
        parent.appendChild(group);
        return { group, sectors, glows, inner, radius, value, next, x, y };
    };
    /* Lays a ring's sectors out from weights: a sector of weight 1 takes a full
       share, a sector growing in or shrinking out takes a fraction, and the
       sectors share the ring between them. Given a `total` larger than the
       weights add up to, the ring fills clockwise from the top instead, with the
       rest left white. Returns the centroid of each sector, which for a sector of
       no size yet is the point on the ring where it is about to appear. */
    const layoutRing = (disc, factors, weights, total = weights.reduce((acc, w) => acc + w, 0)) => {
        let angle = -Math.PI / 2;
        return factors.map((factor, i) => {
            const span = total > 0 ? Math.PI * 2 * weights[i] / total : 0;
            const shape = disc.sectors[i];
            shape.setAttribute("fill", primeColour(factor));
            const d = ringWedge(disc.radius, disc.inner, angle, angle + span);
            shape.setAttribute("d", d);
            disc.glows[i].setAttribute("d", d);
            const centroid = polar((disc.radius + disc.inner) / 2, angle + span / 2);
            angle += span;
            return { x: disc.x + centroid.x, y: disc.y + centroid.y };
        });
    };
    /* A value is set as large as the centre disc allows: a five-character
       2,520 takes a smaller face than a three-character 120. */
    const fitValue = (disc, node, value) => {
        node.textContent = value;
        const size = Math.min(disc.radius * .48, disc.inner * 1.6 / (.62 * String(value).length));
        node.style.fontSize = `${size.toFixed(1)}px`;
        node.setAttribute("y", (Math.max(2.5, size * .36)).toFixed(1));
    };
    const crossfade = (disc, from, to, mix) => {
        fitValue(disc, disc.value, from);
        fitValue(disc, disc.next, to);
        /* One value goes before the next arrives, so the two never overprint. */
        disc.value.style.opacity = (1 - ease(mix * 2)).toFixed(3);
        disc.next.style.opacity = ease(mix * 2 - 1).toFixed(3);
    };
    const traveller = (parent, prime) => {
        const disc = drawDisc(parent, 0, 0, 22, [prime]);
        disc.sectors[0].setAttribute("d", fullRing(22, disc.inner));
        fitValue(disc, disc.value, prime);
        disc.group.style.opacity = 0;
        return disc;
    };
    const moveTraveller = (disc, from, to, t, opacity) => {
        const x = lerp(from.x, to.x, t);
        const y = lerp(from.y, to.y, t);
        const scale = lerp(.55, 1, t);
        disc.group.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale.toFixed(3)})`);
        disc.group.style.opacity = clamp(opacity).toFixed(3);
    };

    /* Sub-timings within one stage: a copy travels first, and the sector it
       becomes grows as it lands. */
    const travelOf = (r) => ease(clamp(r / .7));
    const growOf = (r) => ease(clamp((r - .4) / .6));
    const fadeOf = (r) => 1 - ease(clamp((r - .62) / .25));

    const buildModel = {
        pace: 92,
        motion: .68,
        captions: [
            ["Both numbers as rings of prime factors", "120 = 2 × 2 × 2 × 3 × 5 and 252 = 2 × 2 × 3 × 3 × 7, with one sector for each prime factor."],
            ["A multiple of 252 contains two 2s", "120 already contains three factors of 2, so both 2s of 252 are matched inside it and nothing is added."],
            ["A multiple of 252 contains two 3s", "120 contains one factor of 3. One 3 of 252 is matched; the other is missing, so a copy joins the ring: 120 × 3 = 360."],
            ["A multiple of 252 contains a 7", "360 contains no factor of 7, so a copy of the 7 joins the ring: 360 × 7 = 2,520."],
            ["2,520 is the lowest common multiple", "Every sector of 252 is matched in the ring, so 2,520 ÷ 252 = 10. Only the primes 120 lacked were added, so no smaller multiple of 120 holds every prime of 252."]
        ],
        build(root) {
            root.replaceChildren();
            const drawing = svg("svg", { viewBox: "0 0 700 330", "aria-hidden": "true", focusable: "false" });
            /* The left ring has room for the two sectors that arrive. */
            const left = drawDisc(drawing, 190, 118, 64, [2, 2, 2, 3, 3, 5, 7]);
            const right = drawDisc(drawing, 510, 118, 64, [2, 2, 3, 3, 7]);
            const travellers = [traveller(drawing, 3), traveller(drawing, 7)];
            const stepA = drawText(drawing, "scene-step", 350, 234, "120 × 3 = 360");
            const stepB = drawText(drawing, "scene-step", 350, 274, "360 × 7 = 2,520");
            const equation = drawText(drawing, "scene-equation", 350, 318, "2,520 = 2 × 2 × 2 × 3 × 3 × 5 × 7");
            equation.style.fontSize = "24px";
            root.appendChild(drawing);
            return { left, right, travellers, stepA, stepB, equation };
        },
        paint(parts, shown) {
            const { left, right, travellers, stepA, stepB, equation } = parts;
            const r2 = clamp(shown - 1);
            const r3 = clamp(shown - 2);
            const grow3 = growOf(r2);
            const grow7 = growOf(r3);
            /* Sectors 4 (the copied 3) and 6 (the copied 7) grow in at their stage. */
            const leftFactors = [2, 2, 2, 3, 3, 5, 7];
            const leftCentroids = layoutRing(left, leftFactors, [1, 1, 1, 1, grow3, 1, grow7]);
            const rightCentroids = layoutRing(right, [2, 2, 3, 3, 7], [1, 1, 1, 1, 1]);
            /* The right ring's sectors are matched or copied in turn, and each one
               steps back once it has been accounted for. */
            const rightStage = [1, 1, 2, 2, 3];
            right.sectors.forEach((sector, i) => {
                sector.style.fillOpacity = lerp(1, .32, reveal(shown, rightStage[i] + 1)).toFixed(3);
                setOpacity(right.glows[i], during(shown, rightStage[i]));
            });
            /* The left ring lights the sectors that match, and the ones arriving. */
            const leftStage = [1, 1, 0, 2, 2, 0, 3];
            left.sectors.forEach((sector, i) => {
                const stage = leftStage[i];
                let glow = stage ? during(shown, stage) : 0;
                if (i === 4) glow = Math.min(glow, grow3);
                if (i === 6) glow = Math.min(glow, grow7);
                setOpacity(left.glows[i], glow);
            });
            if (r3 > 0) crossfade(left, "360", "2,520", grow7);
            else crossfade(left, "120", "360", grow3);
            crossfade(right, "252", "252", 0);
            /* A copy of the missing 3, then of the 7, travels from the right ring into
               the sector growing for it on the left. */
            const flights = [[r2, rightCentroids[3], leftCentroids[4]], [r3, rightCentroids[4], leftCentroids[6]]];
            flights.forEach(([r, from, to], j) => {
                moveTraveller(travellers[j], from, to, travelOf(r), r > 0 ? fadeOf(r) : 0);
            });
            setOpacity(stepA, reveal(shown, 2));
            setOpacity(stepB, reveal(shown, 3));
            setOpacity(equation, reveal(shown, 4));
        }
    };

    const productModel = {
        pace: 110,
        motion: .7,
        captions: [
            ["Both numbers as rings of prime factors", "120 has five prime factors and 252 has five, with one sector for each: ten sectors in all."],
            ["Multiply the two numbers", "Every prime factor of both numbers goes into 120 × 252 = 30,240, so 120 and 252 both divide it. The lowest common multiple is at most 30,240."],
            ["The shared primes arrive twice", "2, 2 and 3 are in both numbers, so 30,240 holds one copy of each from 120 and another from 252: five 2s where a multiple of both needs three, three 3s where it needs two."],
            ["One copy of each shared prime is surplus", "A 2, another 2 and a 3 leave: 30,240 ÷ 2 ÷ 2 ÷ 3 = 2,520. Both numbers still divide what is left: 2,520 ÷ 120 = 21 and 2,520 ÷ 252 = 10."]
        ],
        build(root) {
            root.replaceChildren();
            const drawing = svg("svg", { viewBox: "0 0 700 330", "aria-hidden": "true", focusable: "false" });
            const left = drawDisc(drawing, 112, 112, 54, [2, 2, 2, 3, 5]);
            const right = drawDisc(drawing, 588, 112, 54, [2, 2, 3, 3, 7]);
            /* The product ring holds a copy of every sector, laid out so each shared
               prime sits beside its twin: which ring each copy came from is recorded. */
            const order = [
                { prime: 2, from: "left", index: 0 }, { prime: 2, from: "right", index: 0 },
                { prime: 2, from: "left", index: 1 }, { prime: 2, from: "right", index: 1 },
                { prime: 2, from: "left", index: 2 },
                { prime: 3, from: "left", index: 3 }, { prime: 3, from: "right", index: 2 },
                { prime: 3, from: "right", index: 3 },
                { prime: 5, from: "left", index: 4 },
                { prime: 7, from: "right", index: 4 }
            ];
            const centre = drawDisc(drawing, 350, 118, 76, order.map((o) => o.prime));
            centre.group.style.opacity = 0;
            const travellers = order.map((o) => traveller(drawing, o.prime));
            /* The surplus copies: one 2, another 2 and a 3, each the right-hand twin. */
            const surplus = [1, 3, 6];
            const slots = surplus.map((_, j) => ({ x: 350 + (j - 1) * 66, y: 268 }));
            const leavers = surplus.map((i) => traveller(drawing, order[i].prime));
            const productLine = drawText(drawing, "scene-step", 350, 222, "120 × 252 = 30,240");
            const equation = drawText(drawing, "scene-equation", 350, 318, "30,240 ÷ 2 ÷ 2 ÷ 3 = 2,520");
            equation.style.fontSize = "24px";
            root.appendChild(drawing);
            return { left, right, centre, order, travellers, surplus, slots, leavers, productLine, equation };
        },
        paint(parts, shown) {
            const { left, right, centre, order, travellers, surplus, slots, leavers, productLine, equation } = parts;
            const leftCentroids = layoutRing(left, [2, 2, 2, 3, 5], [1, 1, 1, 1, 1]);
            const rightCentroids = layoutRing(right, [2, 2, 3, 3, 7], [1, 1, 1, 1, 1]);
            crossfade(left, "120", "120", 0);
            crossfade(right, "252", "252", 0);
            const r1 = clamp(shown);
            const r3 = clamp(shown - 2);
            /* Copies arrive one after another through the first stage: `arrived` runs
               from 0 to 10, and copy i grows in while it passes i. */
            /* `arrived` runs one past the count: copy i sets off as it passes i, lands
               half a step later, and its sector grows in over the step after that. */
            const arrived = r1 * (order.length + 1);
            const leaving = ease(r3);
            const weights = order.map((o, i) => {
                const grown = clamp(arrived - i - 1);
                return surplus.includes(i) ? grown * (1 - leaving) : grown;
            });
            /* The ring fills clockwise as the copies land, each into its own tenth;
               once the surplus leaves, the sectors that remain share the ring. */
            const held = weights.reduce((acc, w) => acc + w, 0);
            const centroids = layoutRing(centre, order.map((o) => o.prime), weights, Math.max(held, order.length * (1 - leaving)));
            /* Each copy is aimed at the place its sector fills, not at the sector's
               moving centre while it grows. */
            const targets = order.map((o, i) => {
                const point = polar((centre.radius + centre.inner) / 2, -Math.PI / 2 + Math.PI * 2 * (i + .5) / order.length);
                return { x: centre.x + point.x, y: centre.y + point.y };
            });
            centre.group.style.opacity = ease(clamp(r1 * 6)).toFixed(3);
            crossfade(centre, "30,240", "2,520", leaving);
            centre.value.style.opacity = (clamp(arrived - order.length) * (1 - leaving)).toFixed(3);
            order.forEach((o, i) => {
                const source = o.from === "left" ? leftCentroids[o.index] : rightCentroids[o.index];
                /* Each flight spans two arrivals, so the copies stream across in
                   overlapping pairs rather than one at a time. */
                const u = clamp((arrived - i) / 2);
                moveTraveller(travellers[i], source, targets[i], ease(clamp(u / .75)), u > 0 ? 1 - ease(clamp((u - .78) / .17)) : 0);
                /* The source sector lights while its copy is on the way. */
                const glowSource = o.from === "left" ? left.glows[o.index] : right.glows[o.index];
                setOpacity(glowSource, u > 0 ? 1 - ease(clamp((u - .35) / .5)) : 0);
            });
            /* The twins light together, then the surplus copy of each leaves. */
            const twins = [0, 1, 2, 3, 5, 6];
            centre.glows.forEach((glow, i) => {
                let value = twins.includes(i) ? during(shown, 2) : 0;
                if (surplus.includes(i)) value *= 1 - leaving;
                setOpacity(glow, value);
            });
            surplus.forEach((i, j) => {
                moveTraveller(leavers[j], centroids[i], slots[j], ease(clamp(r3 / .75)), r3 > 0 ? ease(clamp(r3 / .3)) : 0);
            });
            setOpacity(productLine, reveal(shown, 1));
            setOpacity(equation, reveal(shown, 3));
        }
    };

    const models = { compare: compareModel, build: buildModel, product: productModel };

    const scenes = [];

    const createScene = (scene) => {
        const sticky = scene.querySelector(".lcm-scene__sticky");
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
            dot.className = "lcm-scene__dot";
            return dot;
        }));
        /* Each stage takes `pace` viewport heights of scroll: the ring scenes move
           several marks in one stage, so they take more than the comparison. */
        const pace = model.pace || 52;
        scene.style.setProperty("--scene-height", `${model.captions.length * pace}vh`);
        scene.style.setProperty("--scene-min-height", `${model.captions.length * Math.round(pace * 7.7)}px`);
        scene.classList.add("is-ready");

        const paint = (fraction) => {
            const position = clamp(fraction) * (last + 2) - 1;
            const index = clamp(Math.floor(position + 1), 0, last);
            const within = clamp(position - Math.floor(position));
            /* The first `motion` of each stage moves; the rest holds still to be read. */
            const shown = Math.max(0, Math.floor(position) + ease(clamp(within / (model.motion || .58))));
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

    document.querySelectorAll("[data-lcm-scene]").forEach((scene) => {
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
    const indexForm = (powers) => Array.from(powers, ([p, e]) => e > 1 ? `${format(p)}${superscript(e)}` : format(p)).join(" × ");

    document.querySelectorAll("[data-lcm-finder]").forEach((finder) => {
        const inputs = finder.querySelectorAll("[data-lcm-input]");
        const table = finder.querySelector("[data-lcm-table]");
        const answer = finder.querySelector("[data-lcm-answer]");
        const note = finder.querySelector("[data-lcm-note]");
        if (inputs.length !== 2 || !table || !answer || !note) return;

        const cellFor = (row, base, index, cls) => {
            const span = document.createElement("span");
            if (cls) span.className = cls;
            if (base) {
                span.append(document.createTextNode(format(base)));
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
                empty.className = "lcm-finder__empty";
                empty.textContent = "Enter two whole numbers from 2 to 9,999.";
                table.appendChild(empty);
                answer.textContent = "";
                note.textContent = "";
                return;
            }
            const [a, b] = values;
            const [fa, fb] = [factorise(a), factorise(b)];
            const primes = Array.from(new Set([...fa.keys(), ...fb.keys()])).sort((x, y) => x - y);
            const lcm = new Map();
            primes.forEach((p) => lcm.set(p, Math.max(fa.get(p) || 0, fb.get(p) || 0)));
            const value = Array.from(lcm, ([p, e]) => p ** e).reduce((acc, v) => acc * v, 1);
            const shared = primes.filter((p) => fa.has(p) && fb.has(p));

            table.replaceChildren();
            const rowFor = (label, powers, cls) => {
                const row = document.createElement("div");
                row.className = `lcm-finder__row${cls ? ` ${cls}` : ""}`;
                row.style.setProperty("--columns", primes.length);
                const bold = document.createElement("b");
                bold.textContent = label;
                row.appendChild(bold);
                primes.forEach((p) => {
                    const e = powers.get(p) || 0;
                    /* The higher index of each column is the chosen one, and the LCM row is
                       chosen throughout; an index of 0 is never the higher. */
                    const higher = cls || e === lcm.get(p);
                    let mark = higher ? "is-chosen" : "";
                    if (e === 0) mark += " is-zero";
                    mark = mark.trim();
                    cellFor(row, p, e, mark);
                });
                table.appendChild(row);
            };
            rowFor(`${format(a)} =`, fa);
            rowFor(`${format(b)} =`, fb);
            rowFor("LCM =", lcm, "lcm-finder__row--lcm");

            const single = lcm.size === 1 && Array.from(lcm.values())[0] === 1;
            answer.textContent = single
                ? `LCM of ${format(a)} and ${format(b)} = ${format(value)}`
                : `LCM of ${format(a)} and ${format(b)} = ${indexForm(lcm)} = ${format(value)}`;
            const product = a * b;
            if (a === b) {
                note.textContent = `The two numbers are the same, so the LCM is ${format(a)} itself.`;
            } else if (value === Math.max(a, b)) {
                note.textContent = `${format(Math.min(a, b))} is a factor of ${format(Math.max(a, b))}, so the LCM is the larger number itself.`;
            } else if (shared.length === 0) {
                note.textContent = `${format(a)} × ${format(b)} = ${format(product)}: no prime is shared, so the LCM is the product.`;
            } else {
                note.textContent = `${format(a)} × ${format(b)} = ${format(product)}, which is ${format(product / value)} times the LCM: one copy of each shared prime is surplus.`;
            }
        };

        inputs.forEach((input) => input.addEventListener("input", render));
        render();
    });
});
