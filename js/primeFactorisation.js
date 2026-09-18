/* Prime factorisation: two scroll-led constructions and a live factoriser.
   Both scenes build their complete mathematics once, then reveal continuous
   drawing states from scroll progress. */

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

    const treeModel = {
        captions: [
            ["Start with 84", "84 is composite, so it has a factor pair other than 1 and 84."],
            ["Split 84", "12 × 7 = 84. The 7 is prime and its branch is finished; 12 is composite."],
            ["Split 12", "3 × 4 = 12. The 3 is prime, while 4 still has factors other than 1 and itself."],
            ["Split 4", "2 × 2 = 4. Every branch now ends at a prime."],
            ["Read the branch ends", "The leaves give 84 = 2 × 2 × 3 × 7 = 2² × 3 × 7."]
        ],
        build(root) {
            root.replaceChildren();
            const drawing = svg("svg", { viewBox: "0 0 700 350", "aria-hidden": "true", focusable: "false" });
            const points = {
                n84: [350, 38, "84", false, 0], n12: [260, 112, "12", false, 1], n7: [440, 112, "7", true, 1],
                n3: [190, 190, "3", true, 2], n4: [330, 190, "4", false, 2],
                n2a: [285, 265, "2", true, 3], n2b: [375, 265, "2", true, 3]
            };
            const links = [
                ["n84", "n12", 1], ["n84", "n7", 1], ["n12", "n3", 2], ["n12", "n4", 2],
                ["n4", "n2a", 3], ["n4", "n2b", 3]
            ].map(([a, b, stage]) => {
                const line = svg("path", { class: "tree-line", d: `M ${points[a][0]} ${points[a][1] + 23} L ${points[b][0]} ${points[b][1] - 23}`, "data-stage": stage });
                drawing.appendChild(line);
                return line;
            });
            const nodes = Object.values(points).map(([x, y, label, prime, stage]) => {
                const group = svg("g", { class: `tree-node${prime ? " is-prime" : ""}`, "data-stage": stage, transform: `translate(${x} ${y})` });
                group.append(svg("circle", { r: 25 }), svg("text", { x: 0, y: 8, "text-anchor": "middle" }));
                group.lastChild.textContent = label;
                drawing.appendChild(group);
                return group;
            });
            const equation = svg("text", { class: "scene-equation", x: 350, y: 338, "text-anchor": "middle", "data-stage": 4 });
            equation.textContent = "84 = 2² × 3 × 7";
            drawing.appendChild(equation);
            root.appendChild(drawing);
            return { marks: [...links, ...nodes, equation] };
        },
        paint(parts, shown) {
            parts.marks.forEach((mark) => setOpacity(mark, reveal(shown, Number(mark.dataset.stage))));
        }
    };

    const ladderModel = {
        captions: [
            ["Begin with the smallest prime factor", "756 is even, so 2 is the first prime factor."],
            ["Test 2 again", "756 ÷ 2 = 378 and 378 ÷ 2 = 189, so the factor 2 occurs twice."],
            ["Move to 3", "189 is not even, but its digits total 18, so 189 ÷ 3 = 63."],
            ["Keep dividing by 3", "63 ÷ 3 = 21 and 21 ÷ 3 = 7, so the factor 3 occurs three times."],
            ["Finish with 7", "7 ÷ 7 = 1. Reaching 1 shows that every prime factor has been collected."],
            ["Collect equal factors", "756 = 2 × 2 × 3 × 3 × 3 × 7 = 2² × 3³ × 7."]
        ],
        build(root) {
            root.replaceChildren();
            const drawing = svg("svg", { viewBox: "0 0 700 330", "aria-hidden": "true", focusable: "false" });
            const values = [756, 378, 189, 63, 21, 7, 1];
            const primes = [2, 2, 3, 3, 3, 7];
            const stages = [1, 1, 2, 3, 3, 4];
            const quotientStages = [0, 1, 1, 2, 3, 3, 4];
            const marks = [];
            values.forEach((value, i) => {
                const y = 34 + i * 40;
                const number = svg("text", { class: "ladder-num", x: 380, y: y + 8, "text-anchor": "middle", "data-stage": quotientStages[i] });
                number.textContent = value;
                drawing.appendChild(number);
                marks.push(number);
                if (i < primes.length) {
                    const line = svg("path", { class: "ladder-line", d: `M 333 ${y + 17} H 420`, "data-stage": stages[i] });
                    const divisor = svg("text", { class: "ladder-prime", x: 305, y: y + 32, "text-anchor": "middle", "data-stage": stages[i] });
                    divisor.textContent = primes[i];
                    drawing.append(line, divisor);
                    marks.push(line, divisor);
                }
            });
            const equation = svg("text", { class: "scene-equation", x: 350, y: 324, "text-anchor": "middle", "data-stage": 5 });
            equation.textContent = "756 = 2² × 3³ × 7";
            drawing.appendChild(equation);
            marks.push(equation);
            root.appendChild(drawing);
            return { marks };
        },
        paint(parts, shown) {
            parts.marks.forEach((mark) => setOpacity(mark, reveal(shown, Number(mark.dataset.stage))));
        }
    };

    const models = { tree: treeModel, ladder: ladderModel };
    const scenes = [];

    const createScene = (scene) => {
        const sticky = scene.querySelector(".factor-scene__sticky");
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
            dot.className = "factor-scene__dot";
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

    document.querySelectorAll("[data-factor-scene]").forEach((scene) => {
        const controller = createScene(scene);
        if (controller) scenes.push(controller);
    });
    window.addEventListener("scroll", () => scenes.forEach((scene) => scene.requestUpdate()), { passive: true });
    window.addEventListener("resize", () => scenes.forEach((scene) => scene.requestUpdate()));
    reduceMotion.addEventListener("change", () => scenes.forEach((scene) => scene.update()));
    scenes.forEach((scene) => scene.update());

    const superscript = (n) => String(n).split("").map((digit) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(digit)]).join("");
    const factorise = (n) => {
        const factors = [];
        let remaining = n;
        for (let p = 2; p * p <= remaining; p += p === 2 ? 1 : 2) {
            while (remaining % p === 0) { factors.push(p); remaining /= p; }
        }
        if (remaining > 1) factors.push(remaining);
        return factors;
    };
    const indexText = (factors) => {
        const counts = new Map();
        factors.forEach((factor) => counts.set(factor, (counts.get(factor) || 0) + 1));
        return Array.from(counts, ([base, count]) => `${base}${count > 1 ? superscript(count) : ""}`).join(" × ");
    };

    const factoriser = document.querySelector("[data-factoriser]");
    if (factoriser) {
        const input = factoriser.querySelector("[data-factor-input]");
        const tree = factoriser.querySelector("[data-factor-tree]");
        const empty = factoriser.querySelector("[data-factor-empty]");
        const answer = factoriser.querySelector("[data-factor-answer]");
        const tidyButton = factoriser.querySelector("[data-factor-tidy]");
        const status = factoriser.querySelector("[data-factor-status]");
        const announce = (text) => { if (status) status.textContent = text; };
        let original = 360;
        let rootNode = null;
        let activeNode = null;
        let nextNodeId = 0;
        let drag = null;
        let activeDrawing = null;
        let zoomFrame = 0;
        let cameraView = { x: 0, y: -140, width: 700, height: 520 };
        let cameraTarget = { ...cameraView };
        const nodeRadius = 25;
        const separationRadius = 50;

        const isPrime = (n) => factorise(n).length === 1;
        const makeNode = (value, x = 350, y = 120) => ({ id: ++nextNodeId, value, x, y, children: null });
        const unfinishedLeaf = (node) => {
            if (!node.children) return isPrime(node.value) ? null : node;
            return unfinishedLeaf(node.children[0]) || unfinishedLeaf(node.children[1]);
        };
        const leavesOf = (node) => node.children ? node.children.flatMap(leavesOf) : [node.value];
        const leafNodesOf = (node) => node.children ? node.children.flatMap(leafNodesOf) : [node];
        const recalculate = (node) => {
            if (node.children) node.value = node.children.reduce((product, child) => product * recalculate(child), 1);
            return node.value;
        };
        const landingLeaf = (node) => leafNodesOf(node).reduce((best, leaf) => leaf.x < best.x ? leaf : best);
        const pathTo = (node, id, path = []) => {
            const next = [...path, node];
            if (node.id === id) return next;
            if (!node.children) return null;
            return pathTo(node.children[0], id, next) || pathTo(node.children[1], id, next);
        };
        const primeColour = (p) => {
            if (p === 2) return "#b86821";
            if (p === 3) return "#116e93";
            if (p === 5) return "#09539d";
            if (p === 7) return "#d99a20";
            return "#52666f";
        };
        const drawText = (parent, className, x, y, value, size) => {
            const node = svg("text", { class: className, x, y, "text-anchor": "middle" });
            if (size) node.style.fontSize = `${size}px`;
            node.textContent = value;
            parent.appendChild(node);
            return node;
        };
        const polar = (radius, angle) => ({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
        const fullRing = (outerRadius, innerRadius) => {
            const outer = `M ${outerRadius} 0 A ${outerRadius} ${outerRadius} 0 1 1 ${-outerRadius} 0 A ${outerRadius} ${outerRadius} 0 1 1 ${outerRadius} 0 Z`;
            const inner = `M ${innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${-innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${innerRadius} 0 Z`;
            return `${outer} ${inner}`;
        };
        const ringWedge = (outerRadius, innerRadius, start, end) => {
            if (end - start >= Math.PI * 2 - .001) return fullRing(outerRadius, innerRadius);
            const safeEnd = Math.min(end, start + Math.PI * 2 - .001);
            const largeArc = safeEnd - start > Math.PI ? 1 : 0;
            const outerStart = polar(outerRadius, start);
            const outerEnd = polar(outerRadius, safeEnd);
            const innerEnd = polar(innerRadius, safeEnd);
            const innerStart = polar(innerRadius, start);
            return `M ${outerStart.x.toFixed(2)} ${outerStart.y.toFixed(2)} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x.toFixed(2)} ${outerEnd.y.toFixed(2)} L ${innerEnd.x.toFixed(2)} ${innerEnd.y.toFixed(2)} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x.toFixed(2)} ${innerStart.y.toFixed(2)} Z`;
        };
        const ringStart = (count) => count === 2 ? 0 : count === 3 ? -Math.PI / 6 : 0;
        const cutTie = (tie, progress) => {
            const gap = ease(progress);
            const end = (1 - gap) / 2;
            tie.setAttribute("pathLength", "1");
            tie.style.strokeDasharray = `${end} ${gap} ${end} 0`;
        };
        const requestTieCut = (action, wanted) => {
            action.tieCutWanted = wanted;
            if (action.tieCutFrame) return;
            const target = wanted ? 1 : 0;
            const from = action.tieCutProgress;
            if (Math.abs(target - from) < .001) return;
            const started = performance.now();
            const duration = reduceMotion.matches ? 0 : 190 * Math.abs(target - from);
            const animate = (now) => {
                const progress = duration ? clamp((now - started) / duration) : 1;
                action.tieCutProgress = from + (target - from) * progress;
                cutTie(action.liveTie, action.tieCutProgress);
                if (progress < 1) {
                    action.tieCutFrame = requestAnimationFrame(animate);
                    return;
                }
                action.tieCutFrame = 0;
                requestTieCut(action, action.tieCutWanted);
            };
            action.tieCutFrame = requestAnimationFrame(animate);
        };
        const setActiveSites = (drawing, groups) => {
            drawing.querySelectorAll(".factor-ring__halo.is-active").forEach((halo) => halo.classList.remove("is-active"));
            groups.forEach((group) => group.querySelector(".factor-ring__halo")?.classList.add("is-active"));
        };
        const drawFactorCircle = (drawing, x, y, value, radius, className = "") => {
            const group = svg("g", { class: `factor-ring__disc ${className}`.trim(), transform: `translate(${x} ${y})` });
            group.appendChild(svg("circle", { class: "factor-ring__halo", r: radius + 5 }));
            group.appendChild(svg("circle", { class: "factor-ring__base", r: radius }));
            const factors = factorise(value);
            const sectors = [];
            const turn = Math.PI * 2 / factors.length;
            const start = ringStart(factors.length);
            const innerRadius = Math.max(5, radius * .58);
            factors.forEach((factor, i) => {
                const shape = svg("path", {
                    class: "factor-ring__sector",
                    d: ringWedge(radius, innerRadius, start + i * turn, start + (i + 1) * turn),
                    fill: primeColour(factor)
                });
                group.appendChild(shape);
                sectors.push({ node: shape, factor });
            });
            group.appendChild(svg("circle", { class: "factor-ring__outline", r: radius }));
            const centre = svg("circle", { class: "factor-ring__centre", r: Math.max(5, radius * .58) });
            group.appendChild(centre);
            drawText(group, "factor-ring__value", 0, Math.max(2.5, radius * .17), value, Math.max(6, radius * .48));
            drawing.appendChild(group);
            return { group, sectors, centre, halo: group.querySelector(".factor-ring__halo") };
        };
        const drawMorphCircle = (drawing, x, y, fromValue, toValue, radius) => {
            const from = factorise(fromValue);
            const to = factorise(toValue);
            const group = svg("g", { class: "factor-ring__disc factor-ring__morph-ring", transform: `translate(${x} ${y})` });
            group.appendChild(svg("circle", { class: "factor-ring__halo", r: radius + 5 }));
            const usedTo = new Set();
            const mapping = from.map((factor, oldIndex) => {
                const newIndex = to.findIndex((candidate, i) => candidate === factor && !usedTo.has(i));
                if (newIndex >= 0) usedTo.add(newIndex);
                return { factor, oldIndex, newIndex: newIndex >= 0 ? newIndex : null };
            });
            to.forEach((factor, newIndex) => {
                if (!usedTo.has(newIndex)) mapping.push({ factor, oldIndex: null, newIndex });
            });
            const paths = mapping.map(({ factor, oldIndex }) => {
                const added = oldIndex === null;
                const path = svg("path", {
                    class: `factor-ring__sector${added ? " factor-ring__sector--empty" : ""}`,
                    fill: added ? "#c9d9e2" : primeColour(factor)
                });
                group.appendChild(path);
                return path;
            });
            group.appendChild(svg("circle", { class: "factor-ring__outline", r: radius }));
            group.appendChild(svg("circle", { class: "factor-ring__centre", r: Math.max(5, radius * .58) }));
            const oldValue = drawText(group, "factor-ring__value", 0, Math.max(2.5, radius * .17), fromValue, Math.max(6, radius * .48));
            const newValue = drawText(group, "factor-ring__value", 0, Math.max(2.5, radius * .17), toValue, Math.max(6, radius * .48));
            newValue.setAttribute("transform", "scale(0)");
            group.style.visibility = "hidden";
            drawing.appendChild(group);
            const boundary = (count, i, end) => {
                if (!count) return 0;
                const turn = Math.PI * 2 / count;
                const index = Math.min(i, count);
                return ringStart(count) + (index + (end && i < count ? 1 : 0)) * turn;
            };
            const arcAt = (map, progress) => {
                const newAnchor = map.newIndex ?? Math.min(map.oldIndex, to.length);
                const newStart = boundary(to.length, newAnchor, false);
                const newEnd = map.newIndex === null ? newStart : boundary(to.length, newAnchor, true);
                if (map.oldIndex === null) {
                    const collapsed = boundary(from.length, Math.min(map.newIndex, from.length), false);
                    const start = collapsed + (newStart - collapsed) * progress;
                    const end = collapsed + (newEnd - collapsed) * progress;
                    return { start, end, centre: (start + end) / 2 };
                }
                const oldAnchor = map.oldIndex;
                const oldStart = boundary(from.length, oldAnchor, false);
                const oldEnd = boundary(from.length, oldAnchor, true);
                const start = oldStart + (newStart - oldStart) * progress;
                const end = oldEnd + (newEnd - oldEnd) * progress;
                return { start, end, centre: (start + end) / 2 };
            };
            const addition = mapping.find((map) => map.oldIndex === null);
            return {
                group,
                additionArc(progress) {
                    return addition ? arcAt(addition, progress) : { start: 0, end: 0, centre: 0 };
                },
                update(progress) {
                    group.style.visibility = progress > 0 ? "visible" : "hidden";
                    oldValue.setAttribute("transform", `scale(${1 - progress})`);
                    newValue.setAttribute("transform", `scale(${progress})`);
                    oldValue.style.visibility = progress < .5 ? "visible" : "hidden";
                    newValue.style.visibility = progress >= .5 ? "visible" : "hidden";
                    paths.forEach((path, i) => {
                        const { start, end } = arcAt(mapping[i], progress);
                        path.setAttribute("d", ringWedge(radius, Math.max(5, radius * .58), start, Math.max(start + .001, end)));
                    });
                }
            };
        };
        const treePoint = (event) => {
            const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(activeDrawing.getScreenCTM().inverse());
            return { x: point.x, y: point.y };
        };
        const cameraBounds = (extra = []) => {
            const points = extra.map((point) => ({ x: point.x, y: point.y }));
            const collect = (node) => {
                points.push({ x: node.x, y: node.y });
                node.children?.forEach(collect);
            };
            collect(rootNode);
            const minX = Math.min(...points.map((point) => point.x)) - 70;
            const maxX = Math.max(...points.map((point) => point.x)) + 70;
            const minY = Math.min(...points.map((point) => point.y)) - 70;
            const maxY = Math.max(...points.map((point) => point.y)) + 70;
            let width = Math.max(700, maxX - minX, (maxY - minY) * 700 / 520);
            let height = width * 520 / 700;
            if (height < maxY - minY) { height = maxY - minY; width = height * 700 / 520; }
            return { x: (minX + maxX - width) / 2, y: (minY + maxY - height) / 2, width, height };
        };
        const frameTree = (extra = []) => {
            cameraTarget = cameraBounds(extra);
            if (zoomFrame || !activeDrawing) return;
            const zoom = () => {
                const amount = reduceMotion.matches ? 1 : .2;
                ["x", "y", "width", "height"].forEach((key) => {
                    cameraView[key] += (cameraTarget[key] - cameraView[key]) * amount;
                });
                activeDrawing.setAttribute("viewBox", `${cameraView.x} ${cameraView.y} ${cameraView.width} ${cameraView.height}`);
                if (drag) {
                    placeDraggedFactor(false);
                    const extraPoints = [drag.fittedPoint, drag.quotientPoint].filter(Boolean);
                    cameraTarget = cameraBounds(extraPoints);
                }
                const settled = ["x", "y", "width", "height"].every((key) => Math.abs(cameraTarget[key] - cameraView[key]) < .05);
                if (settled) {
                    cameraView = { ...cameraTarget };
                    activeDrawing.setAttribute("viewBox", `${cameraView.x} ${cameraView.y} ${cameraView.width} ${cameraView.height}`);
                    zoomFrame = 0;
                } else {
                    zoomFrame = requestAnimationFrame(zoom);
                }
            };
            zoomFrame = requestAnimationFrame(zoom);
        };
        const placeDraggedFactor = (reframe = true) => {
            if (!drag || !activeDrawing) return;
            const pointer = new DOMPoint(drag.clientX, drag.clientY).matrixTransform(activeDrawing.getScreenCTM().inverse());
            let fitted;
            if (drag.mode === "node") {
                drag.returning = Boolean(drag.parentPosition && Math.hypot(pointer.x - drag.parentPosition.x, pointer.y - drag.parentPosition.y) <= Math.max(34, nodeRadius * 1.55));
                drag.returnTarget?.classList.toggle("is-drop-target", drag.returning);
                fitted = { x: pointer.x, y: pointer.y };
            } else {
                const nearest = drag.transferTargets.reduce((best, target) => {
                    const distance = Math.hypot(pointer.x - target.x, pointer.y - target.y);
                    return distance < best.distance ? { target, distance } : best;
                }, { target: null, distance: Infinity });
                const approach = nearest.target ? clamp(1 - nearest.distance / 115) : 0;
                drag.currentTransfer = approach > 0 ? nearest : null;
                drag.transferProgress = approach;
                requestTieCut(drag, approach > 0);
                drag.transferTargets.forEach((target) => {
                    target.settled.style.visibility = "visible";
                    target.settled.classList.remove("is-drop-target");
                    target.morph.group.classList.remove("is-drop-target");
                    target.morph.update(0);
                });
                if (nearest.target && approach > 0) {
                    fitted = { x: pointer.x, y: pointer.y };
                    drag.quotientPoint = null;
                    nearest.target.settled.style.visibility = "hidden";
                    nearest.target.morph.group.classList.add("is-drop-target");
                    nearest.target.morph.update(approach);
                } else {
                    fitted = { x: pointer.x, y: pointer.y };
                    const horizontalTravel = pointer.x - drag.start.x;
                    if (drag.branchSide === null && Math.abs(horizontalTravel) > 12) drag.branchSide = Math.sign(horizontalTravel);
                    const side = drag.branchSide ?? drag.defaultSide;
                    const reach = Math.max(70, Math.abs(fitted.x - drag.parentX));
                    drag.pendingQuotient = freePoint({ x: drag.parentX - side * reach, y: fitted.y }, [], [fitted]);
                    drag.quotientPoint = null;
                }
                const separation = Math.hypot(fitted.x - drag.parentX, fitted.y - drag.parentY);
                drag.cleared = separation >= separationRadius;
                drag.parentDisc?.classList.toggle("is-drop-target", !drag.cleared && !(nearest.target && approach > 0));
                const targetCount = nearest.target ? factorise(nearest.target.node.value * drag.factor).length : 1;
                const sweep = Math.PI * 2 - (Math.PI * 2 - Math.PI * 2 / targetCount) * approach;
                const segmentCentre = nearest.target ? nearest.target.morph.additionArc(approach).centre : 0;
                drag.segmentShape.setAttribute("d", ringWedge(nodeRadius, Math.max(5, nodeRadius * .58), segmentCentre - sweep / 2, segmentCentre + sweep / 2));
                drag.segment.setAttribute("transform", `translate(${fitted.x} ${fitted.y})`);
                const innerRadius = Math.max(5, nodeRadius * .58) * (1 - approach);
                drag.ghostCentre.setAttribute("r", innerRadius);
                drag.ghostValue.style.fontSize = `${Math.max(0, nodeRadius * .48 * (1 - approach))}px`;
            }
            drag.fittedPoint = fitted;
            const x = fitted.x;
            const y = fitted.y;
            drag.group.setAttribute("transform", `translate(${x} ${y})`);
            if (drag.liveTie) drag.liveTie.setAttribute("d", `M ${drag.parentX} ${drag.parentY} L ${x} ${y}`);
            drag.liveTies?.forEach(({ line, fixed }) => line.setAttribute("d", `M ${fixed.x} ${fixed.y} L ${x} ${y}`));
            if (reframe) frameTree([drag.fittedPoint, drag.quotientPoint].filter(Boolean));
        };
        const completeTransfer = (action, target) => {
            if (reduceMotion.matches) { action.transfer(target.node); return; }
            requestTieCut(action, true);
            const from = action.fittedPoint;
            const startedAt = action.transferProgress || 0;
            const targetCount = factorise(target.node.value * action.factor).length;
            const started = performance.now();
            const animate = (now) => {
                const travel = ease((now - started) / 230);
                const progress = startedAt + (1 - startedAt) * travel;
                const x = from.x + (target.x - from.x) * travel;
                const y = from.y + (target.y - from.y) * travel;
                const sweep = Math.PI * 2 - (Math.PI * 2 - Math.PI * 2 / targetCount) * progress;
                const segmentCentre = target.morph.additionArc(progress).centre;
                action.segment.setAttribute("transform", `translate(${x} ${y})`);
                action.segmentShape.setAttribute("d", ringWedge(nodeRadius, Math.max(5, nodeRadius * .58), segmentCentre - sweep / 2, segmentCentre + sweep / 2));
                action.group.setAttribute("transform", `translate(${x} ${y})`);
                action.ghostCentre.setAttribute("r", Math.max(5, nodeRadius * .58) * (1 - progress));
                action.ghostValue.style.fontSize = `${nodeRadius * .48 * (1 - progress)}px`;
                target.morph.update(progress);
                action.liveTie.setAttribute("d", `M ${action.parentX} ${action.parentY} L ${x} ${y}`);
                if (travel < 1) requestAnimationFrame(animate);
                else action.transfer(target.node);
            };
            requestAnimationFrame(animate);
        };
        const completeSplit = (action) => {
            const factorPoint = action.fittedPoint;
            const quotientPoint = action.pendingQuotient;
            if (!quotientPoint || reduceMotion.matches) {
                action.split(false, factorPoint, quotientPoint);
                return;
            }
            action.companion.style.visibility = "visible";
            action.companionTie.style.visibility = "visible";
            const started = performance.now();
            const animate = (now) => {
                const progress = ease((now - started) / 250);
                const x = action.parentX + (quotientPoint.x - action.parentX) * progress;
                const y = action.parentY + (quotientPoint.y - action.parentY) * progress;
                action.companion.setAttribute("transform", `translate(${x} ${y}) scale(${progress})`);
                action.companionTie.setAttribute("d", `M ${action.parentX} ${action.parentY} L ${x} ${y}`);
                frameTree([factorPoint, { x, y }]);
                if (progress < 1) requestAnimationFrame(animate);
                else action.split(false, factorPoint, quotientPoint);
            };
            requestAnimationFrame(animate);
        };

        const equation = () => {
            const leaves = leavesOf(rootNode);
            if (leaves.length === 1 && !isPrime(rootNode.value)) return `${original.toLocaleString("en-GB")} has prime factors still to collect.`;
            if (!activeNode) return `${original.toLocaleString("en-GB")} = ${indexText(leaves.sort((a, b) => a - b))}`;
            return `${original.toLocaleString("en-GB")} = ${leaves.join(" × ")}. ${activeNode.value.toLocaleString("en-GB")} still splits.`;
        };

        const freePoint = (point, ignored = [], extra = []) => {
            const nodes = extra.map(({ x, y }) => ({ x, y }));
            const collect = (node) => {
                if (!ignored.includes(node)) nodes.push(node);
                node.children?.forEach(collect);
            };
            collect(rootNode);
            const result = { x: point.x, y: point.y };
            for (let pass = 0; pass < 12; pass++) {
                let adjusted = false;
                nodes.forEach((node) => {
                    let dx = result.x - node.x;
                    let dy = result.y - node.y;
                    let distance = Math.hypot(dx, dy);
                    const clearance = 62;
                    if (distance >= clearance) return;
                    if (distance < .01) { dx = 1; dy = 0; distance = 1; }
                    result.x = node.x + dx / distance * clearance;
                    result.y = node.y + dy / distance * clearance;
                    adjusted = true;
                });
                if (!adjusted) break;
            }
            return result;
        };

        const tidyLayout = () => {
            const leafGap = 72;
            const rowGap = 80;
            const targets = new Map();
            let column = 0;
            const place = (node, depth) => {
                let x;
                if (node.children) {
                    const [left, right] = node.children.map((child) => place(child, depth + 1));
                    x = (left + right) / 2;
                } else {
                    x = column++ * leafGap;
                }
                targets.set(node.id, { x, y: rootNode.y + depth * rowGap });
                return x;
            };
            place(rootNode, 0);
            const shift = rootNode.x - targets.get(rootNode.id).x;
            targets.forEach((target) => { target.x += shift; });
            return targets;
        };
        const tidyTree = () => {
            if (!rootNode || drag) return;
            const targets = tidyLayout();
            const starts = new Map();
            const collect = (node) => {
                starts.set(node.id, { x: node.x, y: node.y });
                node.children?.forEach(collect);
            };
            collect(rootNode);
            const settle = (progress) => {
                const walk = (node) => {
                    const from = starts.get(node.id);
                    const to = targets.get(node.id);
                    node.x = from.x + (to.x - from.x) * progress;
                    node.y = from.y + (to.y - from.y) * progress;
                    node.children?.forEach(walk);
                };
                walk(rootNode);
                renderTree(false);
            };
            if (reduceMotion.matches) { settle(1); return; }
            const started = performance.now();
            const animate = (now) => {
                const progress = ease((now - started) / 320);
                settle(progress);
                if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        };
        tidyButton?.addEventListener("click", tidyTree);

        const renderTree = (focusNext = false) => {
            const drawing = svg("svg", { viewBox: `${cameraView.x} ${cameraView.y} ${cameraView.width} ${cameraView.height}`, focusable: "false" });
            const raw = [];
            const collect = (node, depth = 0) => {
                raw.push({ node, x: node.x, y: node.y, depth });
                node.children?.forEach((child) => collect(child, depth + 1));
            };
            collect(rootNode);
            const radius = nodeRadius;
            const positions = new Map(raw.map((item) => [item.node.id, item]));
            const renderedNodes = new Map();
            const drawPlaced = (item, className) => {
                return drawFactorCircle(drawing, item.x, item.y, item.node.value, radius, className);
            };
            const finishChange = (focus = false) => {
                activeNode = unfinishedLeaf(rootNode);
                answer.textContent = equation();
                renderTree(focus);
            };
            const collapseIntoParent = (node, focus = false) => {
                const path = pathTo(rootNode, node.id);
                const parent = path?.at(-2);
                if (!parent) return;
                parent.children = null;
                announce(`${parent.value} is one number again.`);
                finishChange(focus);
            };
            const transferFactor = (source, target, factor, focus = false) => {
                const landing = landingLeaf(target);
                source.value /= factor;
                landing.value *= factor;
                recalculate(rootNode);
                announce(`${factor} moved onto ${landing.value / factor}, making ${landing.value}.`);
                finishChange(focus);
            };
            const attachMove = (item, rendered) => {
                const path = pathTo(rootNode, item.node.id);
                const parent = path?.at(-2);
                const parentPosition = parent && positions.get(parent.id);
                rendered.centre.classList.add("factor-ring__centre--returnable");
                if (parent) rendered.centre.classList.add("is-active");
                rendered.centre.setAttribute("tabindex", "0");
                rendered.centre.setAttribute("role", "button");
                rendered.centre.setAttribute("aria-label", parent ? `Move ${item.node.value}, or return it to its parent ${parent.value}.` : `Move ${item.node.value}.`);
                rendered.centre.addEventListener("keydown", (event) => {
                    if (!parent) return;
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    collapseIntoParent(item.node, true);
                });
                rendered.centre.addEventListener("pointerdown", (event) => {
                    event.preventDefault();
                    const point = treePoint(event);
                    const liveTies = [];
                    if (parentPosition) {
                        liveTies.push({ line: svg("path", { class: "factor-ring__tie", d: `M ${parentPosition.x} ${parentPosition.y} L ${point.x} ${point.y}` }), fixed: parentPosition });
                    }
                    item.node.children?.forEach((child) => {
                        const childPosition = positions.get(child.id);
                        liveTies.push({ line: svg("path", { class: "factor-ring__tie", d: `M ${childPosition.x} ${childPosition.y} L ${point.x} ${point.y}` }), fixed: childPosition });
                    });
                    liveTies.forEach(({ line }) => drawing.insertBefore(line, drawing.firstChild));
                    drawing.querySelectorAll(`[data-node-a="${item.node.id}"], [data-node-b="${item.node.id}"]`).forEach((line) => { line.style.visibility = "hidden"; });
                    const ghost = rendered.group.cloneNode(true);
                    ghost.classList.add("factor-ring__moving");
                    ghost.classList.remove("is-drop-target");
                    ghost.querySelector(".factor-ring__halo")?.classList.remove("is-active");
                    setActiveSites(drawing, parent ? [renderedNodes.get(parent.id).group] : []);
                    ghost.querySelectorAll("[tabindex], [role], [aria-label]").forEach((node) => {
                        node.removeAttribute("tabindex");
                        node.removeAttribute("role");
                        node.removeAttribute("aria-label");
                        node.classList.remove("factor-ring__sector--candidate");
                    });
                    ghost.setAttribute("transform", `translate(${point.x} ${point.y})`);
                    drawing.appendChild(ghost);
                    rendered.group.style.visibility = "hidden";
                    tree.classList.add("is-dragging");
                    drawing.setPointerCapture(event.pointerId);
                    drag = {
                        mode: "node", pointerId: event.pointerId, group: ghost, liveTie: null, liveTies, start: point,
                        node: item.node, parent, parentPosition,
                        returnTarget: parent ? renderedNodes.get(parent.id)?.group : null,
                        returnNode: () => collapseIntoParent(item.node),
                        moveNode: (destination) => {
                            item.node.x = destination.x;
                            item.node.y = destination.y;
                            finishChange(false);
                        },
                        parentX: parentPosition?.x || item.x, parentY: parentPosition?.y || item.y,
                        clientX: event.clientX, clientY: event.clientY,
                        allowClick: false
                    };
                });
            };

            raw.forEach((item) => {
                if (!item.node.children) return;
                item.node.children.forEach((child) => {
                    const end = positions.get(child.id);
                    const line = svg("path", {
                        class: "factor-ring__tie", d: `M ${item.x} ${item.y} L ${end.x} ${end.y}`,
                        "data-node-a": item.node.id, "data-node-b": child.id
                    });
                    drawing.appendChild(line);
                });
            });
            raw.filter((item) => item.node.children).forEach((item) => {
                const rendered = drawPlaced(item, "is-parent");
                renderedNodes.set(item.node.id, rendered);
                attachMove(item, rendered);
            });

            raw.filter((item) => !item.node.children).forEach((leaf) => {
                const leafX = leaf.x;
                const leafY = leaf.y;
                const current = leaf.node.value;
                const leafDisc = drawPlaced(leaf, "is-leaf");
                renderedNodes.set(leaf.node.id, leafDisc);
                attachMove(leaf, leafDisc);
                if (isPrime(current)) return;
                leafDisc.halo.classList.add("is-active");
                leafDisc.sectors.forEach(({ node: sector, factor }) => {
                    sector.classList.add("factor-ring__sector--candidate");
                    sector.setAttribute("tabindex", "0");
                    sector.setAttribute("role", "button");
                    sector.setAttribute("aria-label", `Factor ${factor}. Enter splits it from ${current}; the arrow keys choose another disc to move it onto.`);
                    const split = (focus = false, factorPoint = null, quotientPoint = null) => {
                        if (!factorPoint) {
                            const dx = leaf.depth % 2 ? 70 : -70;
                            factorPoint = freePoint({ x: leafX + dx, y: leafY + 60 });
                            quotientPoint = freePoint({ x: leafX - dx, y: leafY + 60 }, [], [factorPoint]);
                        }
                        const dx = factorPoint.x - leafX;
                        if (!quotientPoint) quotientPoint = { x: leafX - dx, y: factorPoint.y };
                        leaf.node.children = [
                            makeNode(factor, factorPoint.x, factorPoint.y),
                            makeNode(current / factor, quotientPoint.x, quotientPoint.y)
                        ];
                        finishChange(focus);
                    };
                    const ancestors = pathTo(rootNode, leaf.node.id).slice(0, -1);
                    const targetItems = raw.filter((item) => item.node !== leaf.node && !ancestors.includes(item.node));
                    const describeTarget = (item) => {
                        const landing = landingLeaf(item.node);
                        const parent = pathTo(rootNode, item.node.id).at(-2);
                        const name = `the ${item.node.value} under ${parent.value}`;
                        return landing === item.node
                            ? `${name}, making ${item.node.value * factor}`
                            : `${name}, landing on the ${landing.value} beneath it`;
                    };
                    let chosen = -1;
                    const highlight = (index, quiet = false) => {
                        if (chosen >= 0) renderedNodes.get(targetItems[chosen].node.id).group.classList.remove("is-drop-target");
                        chosen = index;
                        if (quiet) return;
                        if (chosen < 0) { announce(`${factor} stays with ${current}.`); return; }
                        renderedNodes.get(targetItems[chosen].node.id).group.classList.add("is-drop-target");
                        announce(`Enter moves ${factor} onto ${describeTarget(targetItems[chosen])}.`);
                    };
                    sector.addEventListener("blur", () => { if (chosen >= 0) highlight(-1, true); });
                    sector.addEventListener("keydown", (event) => {
                        const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
                        const backward = event.key === "ArrowLeft" || event.key === "ArrowUp";
                        if ((forward || backward) && targetItems.length) {
                            event.preventDefault();
                            const count = targetItems.length;
                            highlight(forward ? (chosen + 1) % count : (chosen - 1 + count) % count);
                            return;
                        }
                        if (event.key === "Escape") {
                            if (chosen < 0) return;
                            event.preventDefault();
                            highlight(-1);
                            return;
                        }
                        if (event.key !== "Enter" && event.key !== " ") return;
                        event.preventDefault();
                        if (chosen >= 0) transferFactor(leaf.node, targetItems[chosen].node, factor, true);
                        else split(true);
                    });
                    sector.addEventListener("pointerdown", (event) => {
                        event.preventDefault();
                        const point = treePoint(event);
                        const liveTie = svg("path", { class: "factor-ring__tie", d: `M ${leafX} ${leafY} L ${point.x} ${point.y}` });
                        const companionTie = svg("path", { class: "factor-ring__tie factor-ring__tie--companion", d: `M ${leafX} ${leafY} L ${leafX} ${leafY}` });
                        drawing.insertBefore(companionTie, drawing.firstChild);
                        drawing.insertBefore(liveTie, drawing.firstChild);
                        const ghost = drawFactorCircle(drawing, point.x, point.y, factor, radius, "is-leaf factor-ring__moving").group;
                        const companion = drawFactorCircle(drawing, leafX, leafY, current / factor, radius, "is-leaf factor-ring__moving factor-ring__companion").group;
                        companion.style.visibility = "hidden";
                        companionTie.style.visibility = "hidden";
                        if (chosen >= 0) highlight(-1, true);
                        const transferTargets = targetItems.map((item) => {
                            const morph = drawMorphCircle(drawing, item.x, item.y, item.node.value, item.node.value * factor, radius);
                            return { ...item, morph, settled: renderedNodes.get(item.node.id).group };
                        });
                        const segment = svg("g", { class: "factor-ring__transfer-segment", transform: `translate(${point.x} ${point.y})` });
                        const segmentShape = svg("path", { class: "factor-ring__sector", fill: primeColour(factor) });
                        segment.appendChild(segmentShape);
                        drawing.appendChild(segment);
                        setActiveSites(drawing, [leafDisc.group, ...transferTargets.flatMap((target) => [target.settled, target.morph.group])]);
                        const ghostSector = ghost.querySelector(".factor-ring__sector");
                        ghostSector.style.visibility = "hidden";
                        ghost.querySelector(".factor-ring__base").style.visibility = "hidden";
                        ghost.querySelector(".factor-ring__outline").style.visibility = "hidden";
                        tree.classList.add("is-dragging");
                        drawing.setPointerCapture(event.pointerId);
                        drag = {
                            mode: "factor", pointerId: event.pointerId, group: ghost, liveTie, companion, companionTie, start: point,
                            segment, segmentShape,
                            ghostCentre: ghost.querySelector(".factor-ring__centre"), ghostValue: ghost.querySelector(".factor-ring__value"),
                            factor, split,
                            parentDisc: leafDisc.group, cleared: false,
                            transfer: (target) => transferFactor(leaf.node, target, factor),
                            transferTargets,
                            parentX: leafX, parentY: leafY,
                            branchSide: null, defaultSide: leaf.depth % 2 ? 1 : -1,
                            tieCutProgress: 0, tieCutWanted: false, tieCutFrame: 0,
                            clientX: event.clientX, clientY: event.clientY,
                            allowClick: true
                        };
                    });
                });
            });

            drawing.querySelectorAll("text").forEach((node) => node.setAttribute("aria-hidden", "true"));
            tree.replaceChildren(drawing);
            activeDrawing = drawing;
            frameTree();
            tree.setAttribute("aria-label", `Interactive factor tree for ${original}. ${equation()}`);
            requestAnimationFrame(() => {
                if (focusNext) tree.querySelector(".factor-ring__sector--candidate")?.focus({ preventScroll: true });
            });
        };

        tree.addEventListener("pointermove", (event) => {
            if (!drag || event.pointerId !== drag.pointerId) return;
            drag.clientX = event.clientX;
            drag.clientY = event.clientY;
            placeDraggedFactor();
        });
        const endDrag = (event, cancelled) => {
            if (!drag || event.pointerId !== drag.pointerId) return;
            drag.clientX = event.clientX;
            drag.clientY = event.clientY;
            placeDraggedFactor();
            const point = treePoint(event);
            const moved = Math.hypot(point.x - drag.start.x, point.y - drag.start.y);
            const action = drag;
            drag = null;
            tree.classList.remove("is-dragging");
            if (cancelled || (!action.allowClick && moved < 6)) {
                renderTree(false);
                return;
            }
            if (action.mode === "node") {
                if (action.returning) action.returnNode();
                else action.moveNode(action.fittedPoint);
                return;
            }
            if (moved < 6) {
                action.split(true);
                return;
            }
            if (action.currentTransfer?.target) {
                completeTransfer(action, action.currentTransfer.target);
            } else if (action.cleared) {
                completeSplit(action);
            } else {
                renderTree(false);
            }
        };
        tree.addEventListener("pointerup", (event) => endDrag(event, false));
        tree.addEventListener("pointercancel", (event) => endDrag(event, true));

        const show = () => {
            const n = Number(input.value);
            const valid = /^\d{1,4}$/.test(input.value) && n >= 2 && n <= 9999;
            input.setAttribute("aria-invalid", String(!valid));
            empty.hidden = valid;
            tree.classList.toggle("is-hidden", !valid);
            if (tidyButton) tidyButton.hidden = !valid;
            answer.classList.toggle("is-invalid", !valid);
            if (!valid) { answer.textContent = "A whole number from 2 to 9,999 is needed."; return; }
            original = n;
            if (zoomFrame) cancelAnimationFrame(zoomFrame);
            zoomFrame = 0;
            cameraView = { x: 0, y: -140, width: 700, height: 520 };
            cameraTarget = { ...cameraView };
            nextNodeId = 0;
            rootNode = makeNode(n);
            activeNode = unfinishedLeaf(rootNode);
            answer.textContent = equation();
            renderTree(false);
        };
        input.addEventListener("input", () => {
            const start = input.selectionStart ?? input.value.length;
            const before = input.value.slice(0, start);
            const clean = input.value.replace(/\D/g, "");
            const cleanBefore = before.replace(/\D/g, "").length;
            if (clean !== input.value) {
                const scrollY = window.scrollY;
                input.value = clean;
                input.setSelectionRange(cleanBefore, cleanBefore);
                window.scrollTo(window.scrollX, scrollY);
            }
            show();
        });
        show();
    }
});
