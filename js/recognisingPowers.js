/* Scroll-led recognising powers. The page stays a normal document: each scene
   reserves its own scroll distance and pins its card while the reader passes
   through, so every drawing advances with the scroll rather than on a timer.

   Three pictures, because the page asks three different questions of the same
   idea. A square grows by the next odd number, which is what makes the squares
   a list worth holding. Sixty-four counters are laid out three ways, because
   one number can be a power of more than one base. And a number is tested
   against a base by dividing until it reaches 1 or stops coming out whole. */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const SVG = "http://www.w3.org/2000/svg";

document.addEventListener("DOMContentLoaded", () => {
    const scenes = document.querySelectorAll("[data-powers-scene]");
    if (!scenes.length) return;

    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const ease = (value) => {
        const x = clamp(value);
        return x * x * (3 - 2 * x);
    };
    const lerp = (from, to, amount) => from + (to - from) * amount;
    const readable = (value) => Number(value).toLocaleString("en-GB");

    const spokenIndex = (index) => {
        if (index === 2) return "squared";
        if (index === 3) return "cubed";
        return `to the power of ${index}`;
    };

    /* Powers are written with a real raised digit in captions and headings, so
       a caption reads the way the page around it is written. */
    const supText = (index) => String(index)
        .split("")
        .map((digit) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(digit)] || digit)
        .join("");

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    const svgEl = (tag, attrs) => {
        const node = document.createElementNS(SVG, tag);
        Object.entries(attrs || {}).forEach(([name, value]) => node.setAttribute(name, String(value)));
        return node;
    };

    /* A power built as elements, with the caret that keeps it unambiguous once
       the markup is gone and a name for anything that reads rather than sees
       it. See .caret in the shared teaching stylesheet. */
    const powerNode = (className, base, index) => {
        const holder = el("span", className);
        holder.setAttribute("role", "math");
        holder.setAttribute("aria-label", `${readable(base)} ${spokenIndex(index)}`);
        holder.append(el("b", "", readable(base)));
        const mark = el("span", "caret", "^");
        mark.setAttribute("aria-hidden", "true");
        holder.append(mark, el("sup", "", String(index)));
        return holder;
    };

    /* THE SQUARE THAT GROWS BY AN ODD NUMBER ------------------------------

       Each square is the one before it with an L of new cells laid along two
       of its sides, and that L is always the next odd number. Drawing the Ls
       in their own colours is what turns the list of squares from something to
       memorise into something to see. */

    const GNOMON_INK = ["#09539d", "#116e93", "#b86821", "#4c7a3f", "#7a4b93", "#a3352b", "#0f6b6b"];
    const SIDES = 7;

    const squarePainter = {
        read: () => ({ sides: SIDES }),

        stages: (model) => model.sides - 1,

        heading: (model) => `Squares up to ${model.sides}${supText(2)}`,

        build(board, model) {
            board.replaceChildren();
            const stage = el("div", "powers-board__stage");
            const size = 300;
            const step = size / model.sides;
            const svg = svgEl("svg", { viewBox: `0 0 ${size} ${size}`, class: "gnomon", "aria-hidden": "true" });
            const cells = [];
            for (let row = 0; row < model.sides; row += 1) {
                for (let column = 0; column < model.sides; column += 1) {
                    const ring = Math.max(row, column);
                    const rect = svgEl("rect", {
                        x: column * step + 1.5, y: row * step + 1.5,
                        width: step - 3, height: step - 3, rx: 3,
                        fill: GNOMON_INK[ring % GNOMON_INK.length], opacity: 0
                    });
                    svg.append(rect);
                    cells.push({ rect, ring });
                }
            }
            stage.append(svg);
            const tally = el("p", "powers-board__tally");
            const answer = el("p", "powers-board__answer");
            board.append(stage, tally, answer);
            return { cells, tally, answer, step, size };
        },

        caption(model, index) {
            const side = index + 1;
            if (index === 0) {
                return {
                    title: "One cell",
                    copy: `A square of side 1 holds a single cell, so 1${supText(2)} = 1.`
                };
            }
            const odd = side * side - (side - 1) * (side - 1);
            return {
                title: `Side ${side}`,
                copy: `Laying ${odd} new cells along two sides carries ${(side - 1) * (side - 1)} up to ${side * side}, so ${side}${supText(2)} = ${side * side}.`
            };
        },

        paint(parts, model, index, within, eased) {
            const at = index + eased;
            parts.cells.forEach(({ rect, ring }) => {
                const arrival = ease(clamp(at - ring));
                rect.setAttribute("opacity", String(arrival));
                const grow = lerp(0.45, 1, arrival);
                const centreX = Number(rect.getAttribute("x")) + Number(rect.getAttribute("width")) / 2;
                const centreY = Number(rect.getAttribute("y")) + Number(rect.getAttribute("height")) / 2;
                rect.setAttribute("transform", `translate(${centreX} ${centreY}) scale(${grow}) translate(${-centreX} ${-centreY})`);
            });
            const side = index + 1;
            const odd = side * side - (side - 1) * (side - 1);
            parts.tally.textContent = index === 0 ? "1 cell" : `+ ${odd}`;
            parts.tally.style.opacity = String(ease(clamp((within - 0.1) / 0.4)));
            parts.answer.replaceChildren(powerNode("powers-board__power", side, 2), el("i", "", ` = ${side * side}`));
            parts.answer.style.opacity = String(ease(clamp((within - 0.35) / 0.5)));
        }
    };

    /* SIXTY-FOUR, THREE WAYS ----------------------------------------------

       The same counters moved into a square, into four layers and then cut in
       half six times. Nothing is added or taken away between the stages, which
       is the whole point: one number, three bases. */

    const TOTAL = 64;

    const layouts = (span) => {
        const place = [];
        /* Loose: four rows of sixteen, which is none of the three answers. */
        const loose = [];
        for (let i = 0; i < TOTAL; i += 1) {
            loose.push([(i % 16) * (span / 16) + span / 32, Math.floor(i / 16) * (span / 9) + span / 3]);
        }
        /* Eight rows of eight. */
        const square = [];
        for (let i = 0; i < TOTAL; i += 1) {
            square.push([(i % 8) * (span / 8) + span / 16, Math.floor(i / 8) * (span / 8) + span / 16]);
        }
        /* Four blocks of four by four, set out two by two. */
        const layers = [];
        for (let i = 0; i < TOTAL; i += 1) {
            const block = Math.floor(i / 16);
            const inner = i % 16;
            const bx = (block % 2) * (span / 2) + span / 24;
            const by = Math.floor(block / 2) * (span / 2) + span / 24;
            layers.push([bx + (inner % 4) * (span / 10) + span / 20, by + Math.floor(inner / 4) * (span / 10) + span / 20]);
        }
        place.push(loose, square, layers, square);
        return place;
    };

    const regroupPainter = {
        read: () => ({ total: TOTAL }),

        stages: () => 3,

        heading: () => "64 counters",

        build(board) {
            board.replaceChildren();
            const stage = el("div", "powers-board__stage");
            const span = 300;
            const svg = svgEl("svg", { viewBox: `0 0 ${span} ${span}`, class: "regroup", "aria-hidden": "true" });
            const cuts = [];
            /* Six halvings of the eight by eight block, alternating direction:
               2 halves, 4, 8, 16, 32, then 64 single counters. */
            const order = [
                { vertical: true, at: [4] },
                { vertical: false, at: [4] },
                { vertical: true, at: [2, 6] },
                { vertical: false, at: [2, 6] },
                { vertical: true, at: [1, 3, 5, 7] },
                { vertical: false, at: [1, 3, 5, 7] }
            ];
            order.forEach((cut, depth) => {
                const group = svgEl("g", { opacity: 0 });
                cut.at.forEach((position) => {
                    const where = position * (span / 8);
                    group.append(svgEl("line", {
                        x1: cut.vertical ? where : 0, y1: cut.vertical ? 0 : where,
                        x2: cut.vertical ? where : span, y2: cut.vertical ? span : where,
                        stroke: "#b86821", "stroke-width": depth < 2 ? 3 : depth < 4 ? 2 : 1.4,
                        "stroke-linecap": "round"
                    }));
                });
                svg.append(group);
                cuts.push(group);
            });
            const dots = [];
            for (let i = 0; i < TOTAL; i += 1) {
                const dot = svgEl("circle", { r: 8, cx: 0, cy: 0, fill: "#09539d", opacity: 0 });
                svg.append(dot);
                dots.push(dot);
            }
            stage.append(svg);
            const answer = el("p", "powers-board__answer");
            board.append(stage, answer);
            return { dots, cuts, answer, span, places: layouts(span) };
        },

        caption(model, index) {
            if (index === 0) {
                return { title: "Sixty-four counters", copy: "Set out in no particular arrangement, they are just 64 things." };
            }
            if (index === 1) {
                return {
                    title: `8 rows of 8`,
                    copy: `Eight equal rows of eight make a square, so 64 = 8${supText(2)}.`
                };
            }
            if (index === 2) {
                return {
                    title: "4 layers of 16",
                    copy: `Each layer is 4 by 4, and four of them stack into a cube of side 4, so 64 = 4${supText(3)}.`
                };
            }
            return {
                title: "Halved six times",
                copy: `Cutting the block in half six times leaves single counters, so 64 = 2${supText(6)}.`
            };
        },

        paint(parts, model, index, within, eased) {
            const from = parts.places[Math.max(0, index - 1)];
            const to = parts.places[index];
            const mix = index === 0 ? 1 : eased;
            parts.dots.forEach((dot, i) => {
                dot.setAttribute("cx", String(lerp(from[i][0], to[i][0], mix)));
                dot.setAttribute("cy", String(lerp(from[i][1], to[i][1], mix)));
                const arrival = index === 0 ? ease(clamp((eased - i / TOTAL * 0.5) / 0.5)) : 1;
                dot.setAttribute("opacity", String(arrival));
            });
            parts.cuts.forEach((group, depth) => {
                const shown = index === 3 ? ease(clamp((within - depth * 0.13) / 0.2)) : 0;
                group.setAttribute("opacity", String(shown));
            });
            const written = [[8, 2], [4, 3], [2, 6]][index - 1];
            parts.answer.replaceChildren();
            if (written) {
                parts.answer.append(el("i", "", "64 = "), powerNode("powers-board__power", written[0], written[1]));
            }
            parts.answer.style.opacity = String(index === 0 ? 0 : ease(clamp((within - 0.4) / 0.5)));
        }
    };

    /* DIVIDING UNTIL IT STOPS ----------------------------------------------

       A number is a power of a base exactly when dividing by that base over and
       over reaches 1. The ladder shows both endings: the one that lands on 1,
       and the one that stops on a division that will not come out whole. */

    const NUMBER_MIN = 32;
    const NUMBER_MAX = 625;

    const ladderPainter = {
        read(scene, inputs) {
            const number = Number(inputs ? inputs.number : scene.dataset.number);
            const base = Number(inputs ? inputs.base : scene.dataset.base);
            if (!Number.isInteger(number) || !Number.isInteger(base)) return null;
            if (number < NUMBER_MIN || number > NUMBER_MAX || base < 2 || base > 5) return null;
            const chain = [];
            let running = number;
            while (running > 1 && running % base === 0 && chain.length < 12) {
                chain.push({ from: running, to: running / base, step: chain.length + 1 });
                running /= base;
            }
            return { number, base, chain, stuck: running === 1 ? null : running, index: chain.length };
        },

        stages: (model) => model.chain.length + 1,

        heading: (model) => `Is ${readable(model.number)} a power of ${model.base}?`,

        build(board, model) {
            board.replaceChildren();
            const paper = el("div", "ladder");
            const start = el("p", "ladder__start", readable(model.number));
            paper.append(start);
            const rows = model.chain.map((link) => {
                const row = el("p", "ladder__row");
                /* A space between them, or the row flattens to "÷ 216" the
                   moment the layout is gone. */
                row.append(el("i", "ladder__op", `÷ ${model.base}`), " ", el("b", "", readable(link.to)));
                paper.append(row);
                return row;
            });
            const verdict = el("p", "ladder__verdict");
            paper.append(verdict);
            board.append(paper);
            return { start, rows, verdict };
        },

        caption(model, index) {
            if (index === 0) {
                return {
                    title: `Start from ${readable(model.number)}`,
                    copy: `Divide by ${model.base} again and again. Reaching 1 means ${readable(model.number)} is a power of ${model.base}; stopping short means it is not.`
                };
            }
            if (index <= model.chain.length) {
                const link = model.chain[index - 1];
                return {
                    title: `${readable(link.from)} ÷ ${model.base} = ${readable(link.to)}`,
                    copy: link.to === 1
                        ? `${link.step} division${link.step === 1 ? "" : "s"}, and the ladder has reached 1.`
                        : `${link.step} division${link.step === 1 ? "" : "s"} so far, and ${readable(link.to)} is still above 1.`
                };
            }
            if (model.stuck === null) {
                return {
                    title: `${readable(model.number)} = ${model.base}${supText(model.index)}`,
                    copy: `It took ${model.index} divisions to reach 1, and that count is the index.`
                };
            }
            return {
                title: `${readable(model.number)} is not a power of ${model.base}`,
                copy: `${readable(model.stuck)} does not divide by ${model.base}, so the ladder stops above 1.`
            };
        },

        paint(parts, model, index, within, eased) {
            parts.start.style.opacity = String(index >= 1 ? 1 : eased);
            parts.rows.forEach((row, at) => {
                const shown = index > at + 1 ? 1 : index === at + 1 ? eased : 0;
                row.style.opacity = String(shown);
                row.style.transform = `translateY(${lerp(-8, 0, shown)}px)`;
            });
            const done = index > model.chain.length;
            parts.verdict.replaceChildren();
            if (done) {
                if (model.stuck === null) {
                    parts.verdict.append(el("i", "", `${readable(model.number)} = `),
                        powerNode("powers-board__power", model.base, model.index));
                } else {
                    parts.verdict.textContent = `not a power of ${model.base}`;
                }
            }
            parts.verdict.classList.toggle("is-negative", done && model.stuck !== null);
            parts.verdict.style.opacity = String(done ? ease(clamp((within - 0.25) / 0.5)) : 0);
        }
    };

    const PAINTERS = { square: squarePainter, regroup: regroupPainter, ladder: ladderPainter };

    const createScene = (scene) => {
        const sticky = scene.querySelector(".powers-scene__sticky");
        /* The card is moved into the body while it is pinned, so a second
           initialisation would find the scene empty. Better to do nothing than
           to tear down a card the reader is already looking at. */
        if (!sticky) return null;

        const painter = PAINTERS[scene.dataset.scene || "square"];
        const board = scene.querySelector("[data-board]");
        const stepTitle = scene.querySelector("[data-step-title]");
        const stepCopy = scene.querySelector("[data-step-copy]");
        const progressBar = scene.querySelector("[data-progress]");
        const heading = scene.querySelector("[data-heading]");
        /* The numbers are chosen from what is on offer, so there is nothing to
           sanitise and nothing that can be out of range. */
        const picks = Array.from(scene.querySelectorAll("[data-pick]"));
        const live = picks.length > 0;
        const chosen = (group) => {
            const tile = picks.find((pick) => pick.name === group && pick.checked);
            return tile ? tile.value : "";
        };

        const paceVh = 118;
        const pacePx = 890;

        /* A stage spends the first part of its scroll moving and the rest of it
           holding still. The moving part is as long as the whole stage used to
           be, so nothing runs faster than before; the hold is the buffer that
           lets one step be read before the next starts. It is applied to the
           position every painter works from, so the drawing on paper and the
           figure beside it rest together. */
        const action = 0.6;

        let model = null;
        let parts = null;
        let totalStages = 0;
        let stage = -1;

        /* Every stage takes the same length of scroll unless its painter says
           otherwise. One weight per stage plus the hold at the end; a stage
           weighted 3 is given three stages' worth of scroll and so draws over
           it three times as slowly, rather than three times as far. */
        const weightsNow = () => (painter.beats ? painter.beats(model) : null);
        const spanOf = (list) => (list ? list.reduce((total, one) => total + one, 0) : totalStages + 1);

        const positionAt = (progress) => {
            const list = weightsNow();
            if (!list) return progress * (totalStages + 1);
            let left = progress * spanOf(list);
            for (let at = 0; at < list.length; at += 1) {
                if (left < list[at]) return at + left / list[at];
                left -= list[at];
            }
            return totalStages + 1;
        };

        const paint = (position) => {
            const index = Math.min(totalStages, Math.floor(position));
            /* How far through the stage the reader is, whatever the stage is
               worth, against the moving part of it that most drawing follows. */
            const through = clamp(position - index);
            const within = clamp(through / action);
            const eased = ease(within);

            if (index !== stage) {
                stage = index;
                const caption = painter.caption(model, index, totalStages);
                stepTitle.textContent = caption.title;
                stepCopy.textContent = caption.copy;
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
                dot.className = "powers-scene__dot";
                return dot;
            }));
        };

        /* The scroll distance is shared between every stage and the finished
           answer, so the conclusion is held on screen rather than arriving in
           the last instant of the scene. */
        const render = (progress) => paint(positionAt(clamp(progress)));

        scene.classList.add("is-ready");
        let cardHeight = sticky.offsetHeight;

        /* Pinning takes the card out of the page and puts it on the body, and
           moving a node drops focus and the caret from whatever is inside it.
           Both are put back, so the card can go on being positioned however the
           reader is using it. */
        const moveCard = (move) => {
            const active = sticky.contains(document.activeElement) ? document.activeElement : null;
            const caret = active && typeof active.selectionStart === "number"
                ? [active.selectionStart, active.selectionEnd]
                : null;
            move();
            if (!active || document.activeElement === active) return;
            active.focus({ preventScroll: true });
            if (caret) active.setSelectionRange(caret[0], caret[1]);
        };

        const dock = (offset = 0) => {
            if (sticky.parentNode !== scene) moveCard(() => scene.insertBefore(sticky, scene.firstChild));
            sticky.classList.remove("is-pinned");
            sticky.style.removeProperty("left");
            sticky.style.removeProperty("width");
            sticky.style.removeProperty("height");
            sticky.style.removeProperty("transform");
            sticky.style.top = `${offset}px`;
        };

        const pin = (left, top, width, scale) => {
            if (sticky.parentNode !== document.body) moveCard(() => document.body.append(sticky));
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
            if (!model) return;
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

        const repaintInPlace = () => {
            if (reduceMotion.matches) {
                render(1);
                return;
            }
            const { sceneRect, visualScale, pinTop, travel } = geometry();
            render(clamp((pinTop - sceneRect.top) / (travel * visualScale)));
        };

        const accept = () => {
            const active = live && sticky.contains(document.activeElement) ? document.activeElement : null;
            const scrollLeft = window.scrollX;
            const scrollTop = window.scrollY;
            const selection = active && typeof active.selectionStart === "number"
                ? [active.selectionStart, active.selectionEnd]
                : null;

            const inputs = live ? { number: chosen("powers-number"), base: chosen("powers-base") } : null;
            const next = painter.read(scene, inputs);
            if (!next) return;

            model = next;
            if (heading) heading.textContent = painter.heading(model);

            const stages = painter.stages(model);
            if (stages !== totalStages) {
                totalStages = stages;
                buildDots();
                const stretch = painter.pace ? painter.pace(model) : 1;
                const reach = spanOf(weightsNow()) + 1;
                scene.style.setProperty("--scene-height", `${reach * paceVh * stretch}vh`);
                scene.style.setProperty("--scene-min-height", `${reach * pacePx * stretch}px`);
            }

            /* Rebuild the drawing against the new numbers and repaint at the
               scroll position the reader is already at. */
            if (parts && painter.release) painter.release(parts);
            parts = painter.build(board, model);
            stage = -1;
            if (active) {
                repaintInPlace();
                if (document.activeElement !== active) active.focus({ preventScroll: true });
                if (selection) active.setSelectionRange(selection[0], selection[1]);
            }
            /* A shorter power is a shorter scene, which can leave the reader
               below the whole of it. Whatever the rebuild did to the page, they
               are put back where they were, and no further down the scene than
               the point at which the card comes to rest at the foot of its
               travel: from there the finished power is what is in front of
               them, not the empty page under it. */
            const { sceneRect, visualScale, pinTop, travel } = geometry();
            const lowest = Math.max(0, window.scrollY + sceneRect.top - pinTop + travel * visualScale);
            const settled = Math.min(scrollTop, lowest);
            if (window.scrollX !== scrollLeft || window.scrollY !== settled) {
                window.scrollTo({ left: scrollLeft, top: settled, behavior: "auto" });
            }
            /* The rebuild can change the scene's height, so the card is
               positioned again whether or not the reader is still in it. */
            requestUpdate();
        };

        const reset = () => {
            dock(0);
            cardHeight = sticky.offsetHeight;
            stage = -1;
            requestUpdate();
        };

        if (live) picks.forEach((pick) => {
            pick.addEventListener("change", accept);
        });

        /* The card is measured only once the board has something in it: an
           empty board would under-measure it and the pinned card would clip its
           own conclusion. */
        accept();
        cardHeight = sticky.offsetHeight;
        update();
        return { requestUpdate, reset, rebuild: accept };
    };

    const controllers = Array.from(scenes).map(createScene).filter(Boolean);
    const nudge = () => controllers.forEach((controller) => controller.requestUpdate());
    const resetAll = () => controllers.forEach((controller) => controller.reset());

    window.addEventListener("scroll", nudge, { passive: true });
    window.addEventListener("resize", resetAll);
    reduceMotion.addEventListener("change", resetAll);
    window.addEventListener("load", resetAll);

});
