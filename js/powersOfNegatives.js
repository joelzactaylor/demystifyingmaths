/* Powers of a negative number.

   Two figures, and one engine underneath them.

   `covers` answers the page's opening question by writing both readings out.
   Nothing is asserted about −3² and (−3)²: each one is expanded into the
   product it stands for, and the gold frame sits on the part the index is
   written against, so the bracket is visibly the whole of the difference.

   `pairs` is the sign rule made out of the factors themselves. Five copies of
   −2 stand in a row, ties are drawn under them two at a time, and a tied pair
   turns blue because it has become a positive amount. The factor the ties
   cannot reach keeps its ochre, and that one is why the answer is negative.

   Positions are read with offsetLeft/offsetTop rather than getBoundingClientRect
   because the card is scaled by a transform while it is pinned, and offsets are
   measured before that transform is applied. */

document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const ease = (value) => {
        const x = clamp(value);
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    };
    const lerp = (from, to, amount) => from + (to - from) * amount;

    const MINUS = "−";
    const TIMES = "×";

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    /* A raised index loses its meaning when the styling is stripped: "2^5"
       becomes "25". The clipped caret is what keeps the flattened text true. */
    const power = (host, baseText, indexText) => {
        host.append(document.createTextNode(baseText));
        const caret = el("span", "caret", "^");
        caret.setAttribute("aria-hidden", "true");
        host.append(caret, el("sup", "", String(indexText)));
    };

    /* Offsets accumulate up the offsetParent chain, so a part can be measured
       against the figure that holds it however the boxes in between are laid
       out. */
    const offsetWithin = (node, root) => {
        let left = 0;
        let top = 0;
        let walk = node;
        while (walk && walk !== root) {
            left += walk.offsetLeft;
            top += walk.offsetTop;
            walk = walk.offsetParent;
        }
        return { left, top, width: node.offsetWidth, height: node.offsetHeight };
    };

    const writeCaption = (node, text) => {
        if (node && node.textContent !== text) node.textContent = text;
    };

    /* --------------------------------------------------- what the index covers

       Two columns of three lines. A line is written when its stage arrives and
       stays for the rest of the figure, so the two readings finish side by side
       and can be compared without scrolling back. */

    const COLUMNS = [
        {
            label: "no bracket",
            lines: [
                (host) => power(host, MINUS + "3", 2),
                (host) => { host.textContent = `${MINUS}(3 ${TIMES} 3)`; },
                (host) => { host.textContent = `${MINUS}9`; }
            ],
            /* the part the index is written against */
            mark: (host) => {
                host.textContent = "";
                host.append(document.createTextNode(MINUS));
                const inner = el("span", "covers__marked", "3");
                host.append(inner);
                power(host, "", 2);
                return inner;
            }
        },
        {
            label: "bracketed",
            lines: [
                (host) => power(host, `(${MINUS}3)`, 2),
                (host) => { host.textContent = `(${MINUS}3) ${TIMES} (${MINUS}3)`; },
                (host) => { host.textContent = "9"; }
            ],
            mark: (host) => {
                host.textContent = "";
                const inner = el("span", "covers__marked", `(${MINUS}3)`);
                host.append(inner);
                power(host, "", 2);
                return inner;
            }
        }
    ];

    const coversPainter = {
        read: () => ({ columns: COLUMNS }),

        /* 0 both written · 1 frame left · 2 expand left · 3 resolve left
           4 frame right · 5 expand right · 6 resolve right */
        stages: () => 6,

        build(board, model) {
            board.replaceChildren();
            const figure = el("div", "covers");
            const frame = el("div", "covers__frame");
            const columns = model.columns.map((column) => {
                const col = el("div", "covers__col");
                const lines = column.lines.map((write, index) => {
                    const line = el("p", `covers__line${index === 2 ? " covers__line--answer" : ""}`);
                    write(line);
                    col.append(line);
                    return line;
                });
                /* the first line is rewritten once so the framed part is a box
                   the frame can be measured against */
                const marked = column.mark(lines[0]);
                figure.append(col);
                return { col, lines, marked };
            });
            figure.append(frame);
            board.append(figure);
            return { figure, frame, columns };
        },

        caption(model, index) {
            const titles = [
                "Two ways to read three symbols",
                "The index stands against the 3",
                "So the 3 is multiplied by itself",
                "And the minus is still in front",
                "The bracket is what the index meets",
                "So the whole of −3 is multiplied by itself",
                "Two negatives make a positive"
            ];
            const copy = [
                `${MINUS}3² on the left and (${MINUS}3)² on the right, written with the same digits.`,
                "Nothing gathers the minus in with the 3, so the squaring reaches the 3 alone.",
                `3 ${TIMES} 3 is 9, and the minus has taken no part in it.`,
                `${MINUS}3² = ${MINUS}9.`,
                `The bracket makes ${MINUS}3 one amount, and the index applies to all of it.`,
                `Both factors carry the minus, so there are two negatives in the product.`,
                `(${MINUS}3)² = 9, which is where the two readings part.`
            ];
            return { title: titles[index], copy: copy[index] };
        },

        paint(parts, model, index, within) {
            const at = index + within;
            const { figure, frame, columns } = parts;

            columns.forEach((column, col) => {
                /* left column writes at stages 2 and 3, right at 5 and 6 */
                const born = col === 0 ? [0, 2, 3] : [0, 5, 6];
                column.lines.forEach((line, row) => {
                    /* The board opens empty and the two statements are written
                       into it, rather than being there before the reader
                       arrives. */
                    const shown = ease(clamp((at - born[row]) / (row === 0 ? 0.55 : 1)));
                    line.style.opacity = String(shown);
                });
            });

            /* The frame rests on the left column from stage 1 and moves across
               at stage 4. It is hidden before it has anything to sit on. */
            const lit = at >= 0.85;
            frame.style.opacity = lit ? String(ease(clamp((at - 0.85) / 0.5))) : "0";
            if (!lit) return;

            const from = columns[0].marked;
            const cross = clamp((at - 4) / 0.6);
            const a = offsetWithin(from, figure);
            const b = offsetWithin(columns[1].marked, figure);
            const pad = 7;
            const box = at < 4 ? a : {
                left: lerp(a.left, b.left, ease(cross)),
                top: lerp(a.top, b.top, ease(cross)),
                width: lerp(a.width, b.width, ease(cross)),
                height: lerp(a.height, b.height, ease(cross))
            };
            frame.style.left = `${box.left - pad}px`;
            frame.style.top = `${box.top - pad * 0.6}px`;
            frame.style.width = `${box.width + pad * 2}px`;
            frame.style.height = `${box.height + pad * 1.2}px`;
        }
    };

    /* ------------------------------------------------------ pairing the signs

       (−2)⁵ written as its five factors, tied together two at a time. */

    const PAIRS_BASE = 2;
    const PAIRS_INDEX = 5;

    const pairsPainter = {
        read: () => ({ base: PAIRS_BASE, index: PAIRS_INDEX }),

        /* 0 factors · 1 first tie · 2 second tie · 3 the odd one out · 4 value */
        stages: () => 4,

        build(board, model) {
            board.replaceChildren();
            const figure = el("div", "pairs");

            const row = el("div", "pairs__row");
            const factors = Array.from({ length: model.index }, () =>
                el("span", "pairs__factor", `(${MINUS}${model.base})`));
            row.append(...factors);
            const ties = [el("span", "pairs__tie"), el("span", "pairs__tie")];
            row.append(...ties);
            figure.append(row);

            const value = el("p", "pairs__value");
            const note = el("p", "pairs__note");
            figure.append(value, note);
            board.append(figure);
            return { figure, row, factors, ties, value, note };
        },

        caption(model, index) {
            const titles = [
                "Five negative factors",
                "The first two cancel",
                "And the next two",
                "One is left over",
                "The size, and then the sign"
            ];
            const copy = [
                `The index counts how many copies of ${MINUS}2 are multiplied together.`,
                `(${MINUS}2) ${TIMES} (${MINUS}2) is 4, so a tied pair is a positive amount.`,
                "Four of the five are now accounted for, and both pairs are positive.",
                "Nothing remains to pair the fifth with, so its minus survives.",
                `2⁵ = 32, and the unpaired negative makes it ${MINUS}32.`
            ];
            return { title: titles[index], copy: copy[index] };
        },

        paint(parts, model, index, within) {
            const at = index + within;
            const { figure, factors, ties, value, note } = parts;

            factors.forEach((factor, i) => {
                factor.style.opacity = String(ease(clamp((at - i * 0.12) / 0.6)));
                /* a factor turns blue as the tie that reaches it is drawn */
                const paired = (i < 2 && at >= 1.6) || (i >= 2 && i < 4 && at >= 2.6);
                factor.classList.toggle("pairs__factor--paired", paired);
            });

            ties.forEach((tie, i) => {
                const grown = ease(clamp(at - (i + 1)));
                tie.style.opacity = String(grown);
                if (grown <= 0) return;
                const a = offsetWithin(factors[i * 2], parts.row);
                const b = offsetWithin(factors[i * 2 + 1], parts.row);
                const left = a.left;
                const full = b.left + b.width - a.left;
                tie.style.left = `${left + (full * (1 - grown)) / 2}px`;
                tie.style.top = `${a.top + a.height + 6}px`;
                tie.style.width = `${full * grown}px`;
                tie.style.height = "13px";
            });

            /* the odd one out is picked out once the ties have run out */
            const spare = at >= 3;
            factors[4].style.transform = spare ? "translateY(-4px)" : "none";

            const showValue = at >= 4;
            value.style.opacity = String(ease(clamp(at - 4)));
            value.textContent = showValue ? `${MINUS}32` : "";
            value.classList.toggle("pairs__value--negative", showValue);

            note.style.opacity = String(ease(clamp(at - 3)));
            note.textContent = at >= 3
                ? `Two pairs and one negative left over: 2⁵ = 32, so (${MINUS}2)⁵ = ${MINUS}32.`
                : "";
        }
    };

    const PAINTERS = { covers: coversPainter, pairs: pairsPainter };

    /* --------------------------------------------------------------- engine */

    const createScene = (scene) => {
        const sticky = scene.querySelector(".pow-scene__sticky");
        /* The card is moved into the body while it is pinned, so a second
           initialisation would find the scene empty. */
        if (!sticky) return null;

        const painter = PAINTERS[scene.dataset.scene];
        if (!painter) return null;

        const board = scene.querySelector("[data-board]");
        const stepTitle = scene.querySelector("[data-step-title]");
        const stepCopy = scene.querySelector("[data-step-copy]");
        const progressBar = scene.querySelector("[data-progress]");

        const paceVh = 54;
        const pacePx = 420;
        /* A stage spends the first part of its scroll moving and the rest of it
           holding still, so one step can be read before the next starts. */
        const action = 0.6;

        let model = null;
        let parts = null;
        let totalStages = 0;
        let stage = -1;
        let cardHeight = sticky.offsetHeight;

        const paint = (position) => {
            const index = Math.min(totalStages, Math.floor(position));
            const through = clamp(position - index);
            const within = clamp(through / action);

            if (index !== stage) {
                stage = index;
                const caption = painter.caption(model, index, totalStages);
                writeCaption(stepTitle, caption.title);
                writeCaption(stepCopy, caption.copy);
                Array.from(progressBar.children).forEach((dot, dotIndex) => {
                    dot.classList.toggle("is-past", dotIndex < index);
                    dot.classList.toggle("is-current", dotIndex === index);
                });
            }
            painter.paint(parts, model, index, within);
        };

        const buildDots = () => {
            progressBar.replaceChildren(...Array.from({ length: totalStages + 1 }, () => {
                const dot = document.createElement("i");
                dot.className = "pow-scene__dot";
                return dot;
            }));
        };

        const render = (progress) => paint(clamp(progress) * (totalStages + 1));

        scene.classList.add("is-ready");

        const dock = (offset = 0) => {
            if (sticky.parentNode !== scene) scene.insertBefore(sticky, scene.firstChild);
            sticky.classList.remove("is-pinned");
            sticky.style.removeProperty("left");
            sticky.style.removeProperty("width");
            sticky.style.removeProperty("height");
            sticky.style.removeProperty("transform");
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
            if (!model || !parts) return;
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

        const build = () => {
            const next = painter.read(scene);
            if (!next) return;
            model = next;

            totalStages = painter.stages(model);
            buildDots();
            scene.style.setProperty("--scene-height", `${(totalStages + 1) * paceVh}vh`);
            scene.style.setProperty("--scene-min-height", `${(totalStages + 1) * pacePx}px`);

            parts = painter.build(board, model);
            stage = -1;
            requestUpdate();
        };

        const reset = () => {
            dock(0);
            cardHeight = sticky.offsetHeight;
            stage = -1;
            requestUpdate();
        };

        /* The card is measured only once the board has something in it: an empty
           board would under-measure it and the pinned card would clip its own
           conclusion. */
        build();
        cardHeight = sticky.offsetHeight;
        update();
        return { requestUpdate, reset };
    };

    /* ---------------------------------------------------------------- start */

    const scenes = Array.from(document.querySelectorAll("[data-pow-scene]"))
        .map(createScene)
        .filter(Boolean);

    if (scenes.length) {
        const request = () => scenes.forEach((scene) => scene.requestUpdate());
        const reset = () => scenes.forEach((scene) => scene.reset());
        window.addEventListener("scroll", request, { passive: true });
        window.addEventListener("resize", reset);
        if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", reset);
        window.addEventListener("load", reset);
    }
});
