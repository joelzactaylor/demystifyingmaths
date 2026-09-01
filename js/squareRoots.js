/* Scroll-led square roots. The page stays a normal document: each scene supplies
   its own scroll distance, JavaScript pins the card inside it, and the scroll
   position drives the drawing continuously. Nothing is toggled on — the tiles
   are laid, the side is measured, the squares are read backwards and the decimal
   places are halved in step with the scroll, exactly as far as the reader has
   scrolled. No wheel or touch input is intercepted.

   Every root sign is drawn, in the boards as much as in the prose: an SVG arm
   whose end sits at the top of its box beside a radicand carrying the bar as a
   border. A browser lays <msqrt> out from the font's OpenType MATH table, and
   macOS ships no font that has one, so MathML left the bar adrift of the arm on
   the machines this is read on.

   Four scenes share one engine, and each names the picture it wants in
   data-scene. "tiles" lays an area out as a square and measures the side off it.
   "find" reads a number backwards out of the squares of 1 to 15; it is a worked
   example when it carries data-target and a sandbox when it carries a field
   instead, capped at 225 because that is where the squares of 1 to 15 stop.
   "unit" halves a square of side 1 to show a root larger than its number.
   "decimal" halves a count of decimal places. */

document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const ease = (value) => {
        const x = clamp(value);
        return x * x * (3 - 2 * x);
    };
    const lerp = (from, to, amount) => from + (to - from) * amount;

    const TARGET_MIN = 1;
    const TARGET_MAX = 225;
    const ROOT_MAX = 15;

    /* The squares a root is read backwards out of, worked out rather than
       written down, so the list and the arithmetic cannot disagree. */
    const SQUARES = Array.from({ length: ROOT_MAX }, (unused, at) => ({
        root: at + 1,
        value: (at + 1) * (at + 1)
    }));

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    /* The root sign, drawn rather than taken from a font: an SVG arm whose end
       sits at the very top of its own box, beside a radicand whose box carries
       the bar as a border along its top. Both start on the same line and the
       stroke and the border are the same fraction of an em, so the arm meets the
       bar exactly at every size. See .rad in the stylesheet. */
    const SVG_NS = "http://www.w3.org/2000/svg";

    const radicalSign = () => {
        const svg = document.createElementNS(SVG_NS, "svg");
        svg.setAttribute("class", "rad__sign");
        svg.setAttribute("viewBox", "0 0 24 40");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", "M.5 24H5l5.5 13.5L22 1.5H24");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "currentColor");
        path.setAttribute("stroke-width", "3");
        path.setAttribute("stroke-linejoin", "miter");
        path.setAttribute("stroke-linecap", "butt");
        svg.append(path);
        return svg;
    };

    /* The radicand is whatever nodes are handed over, so one component carries a
       plain number and a row of separately measurable characters alike. */
    const drawRoot = (className, ...radicand) => {
        const wrap = el("span", className ? `rad ${className}` : "rad");
        const over = el("span", "rad__over");
        over.append(...radicand);
        wrap.append(hiddenText("√"), radicalSign(), over);
        return { wrap, over };
    };

    /* Strip the page of its styling and <msqrt>49</msqrt> is the two characters
       "49", which turns √49 = 7 into the false statement 49 = 7. A clipped copy
       of the whole statement keeps the flattened text honest; it is never seen
       and never spoken, exactly as .caret is between a base and its index. */
    const hiddenText = (text) => {
        const mark = el("span", "caret", text);
        mark.setAttribute("aria-hidden", "true");
        return mark;
    };

    /* Every root on this page is a real <msqrt>, in the drawings as much as in
       the prose: the bar has to stretch over the radicand, and no arrangement of
       a √ character and a border does that at every size. */
    const rootNodes = (radicand, result) => {
        const { wrap } = drawRoot("", String(radicand));
        const holder = el("span", "root-statement");
        holder.setAttribute("role", "math");
        holder.setAttribute("aria-label", result === undefined
            ? `the square root of ${radicand}`
            : `the square root of ${radicand} equals ${result}`);
        holder.append(wrap);
        if (result !== undefined) holder.append(` = ${result}`);
        return { nodes: [holder], wrap };
    };

    const rootLine = (node, radicand, result) => {
        const built = rootNodes(radicand, result);
        node.replaceChildren(...built.nodes);
        return built;
    };

    /* A caption is written as a list of plain runs and roots, so a radical in a
       caption is the same <msqrt> as a radical anywhere else on the page. */
    const rootPart = (radicand, equals) => ({ radicand, equals });

    const writeCaption = (node, content) => {
        if (typeof content === "string") { node.textContent = content; return; }
        node.replaceChildren();
        content.forEach((part) => {
            if (typeof part === "string") node.append(part);
            else node.append(...rootNodes(part.radicand, part.equals).nodes);
        });
    };

    /* Positions are taken from client rectangles and divided back through the
       card's own scale: shared.css shrinks the whole 900px panel with a
       transform under 900px, and a rectangle read straight off that transform
       would place every frame and every travelling numeral short of where it
       belongs. */
    const scaleOf = (container) => {
        const rect = container.getBoundingClientRect();
        return container.offsetWidth && rect.width ? rect.width / container.offsetWidth : 1;
    };

    /* A gold frame measured from the finished layout, so it can be interpolated
       between real positions rather than guessed. Sized around the marks
       themselves, never around the row or the grid cell holding them. */
    const boxIn = (container, nodes, pad = 6) => {
        const list = nodes.filter(Boolean);
        if (!list.length) return null;
        const base = container.getBoundingClientRect();
        const scale = scaleOf(container) || 1;
        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;
        list.forEach((node) => {
            const rect = node.getBoundingClientRect();
            left = Math.min(left, rect.left);
            top = Math.min(top, rect.top);
            right = Math.max(right, rect.right);
            bottom = Math.max(bottom, rect.bottom);
        });
        return {
            left: (left - base.left) / scale - pad,
            top: (top - base.top) / scale - pad,
            width: (right - left) / scale + pad * 2,
            height: (bottom - top) / scale + pad * 2
        };
    };

    const centreIn = (container, node) => {
        const box = boxIn(container, [node], 0);
        return box ? { x: box.left + box.width / 2, y: box.top + box.height / 2 } : null;
    };

    const applyBox = (node, from, to, mix, opacity) => {
        if (!from || !to) {
            node.style.opacity = "0";
            return;
        }
        node.style.opacity = String(opacity);
        node.style.left = `${lerp(from.left, to.left, mix)}px`;
        node.style.top = `${lerp(from.top, to.top, mix)}px`;
        node.style.width = `${lerp(from.width, to.width, mix)}px`;
        node.style.height = `${lerp(from.height, to.height, mix)}px`;
    };

    const rise = (node, amount, distance = 10) => {
        node.style.opacity = String(amount);
        node.style.transform = `translateY(${lerp(distance, 0, amount)}px)`;
    };

    const fade = (node, amount) => { node.style.opacity = String(amount); };

    /* ------------------------------------------------------------ painters

       Every scene shares the pinning engine below. A painter says how many
       stages its idea takes, what to draw, and what the caption reads at each
       stage. Adding a picture means adding a painter, never another engine. */

    /* AN AREA, AND THE SIDE MEASURED OFF IT ------------------------------ */

    const tilesPainter = {
        read: (scene) => {
            const side = parseInt(scene.dataset.side || "", 10);
            return side >= 2 && side <= 12 ? { side, value: side * side } : null;
        },

        stages: () => 4,

        heading: (model, node) => { node.textContent = `A square of area ${model.value}`; },

        build(board, model) {
            board.replaceChildren();
            const figure = el("div", "root-tiles");
            const frame = el("div", "root-tiles__frame");
            const across = el("span", "root-bracket root-bracket--top", String(model.side));
            const down = el("span", "root-bracket root-bracket--side", String(model.side));
            const square = el("div", "root-tiles__square");
            const share = 100 / model.side;

            /* Drawn as separate tiles rather than one block, because the point
               of the scene is that they can be counted one at a time and that
               the same count runs along both edges. */
            const cells = [];
            for (let row = 0; row < model.side; row += 1) {
                for (let column = 0; column < model.side; column += 1) {
                    const cell = el("i", "root-tiles__cell");
                    cell.style.left = `${column * share}%`;
                    cell.style.top = `${row * share}%`;
                    cell.style.width = `${share}%`;
                    cell.style.height = `${share}%`;
                    square.append(cell);
                    cells.push(cell);
                }
            }

            const mark = el("i", "root-mark");
            const tally = el("p", "root-tiles__tally");
            const product = el("p", "root-line root-line--quiet");
            product.textContent = `${model.side} × ${model.side} = ${model.value}`;
            const root = el("p", "root-line");
            rootLine(root, String(model.value), String(model.side));

            square.append(mark);
            frame.append(across, down, square);
            figure.append(frame, tally, product, root);
            board.append(figure);

            const parts = { frame, square, across, down, cells, mark, tally, product, root, top: null, left: null };
            parts.measure = () => {
                parts.top = boxIn(square, cells.slice(0, model.side), 3);
                parts.left = boxIn(square, cells.filter((cell, at) => at % model.side === 0), 3);
            };
            return parts;
        },

        caption(model, index) {
            const { side, value } = model;
            return [
                {
                    title: `An area of ${value}`,
                    copy: `${value} unit squares fill a square exactly, with none left over and none short.`
                },
                {
                    title: `${side} across`,
                    copy: `${side} unit squares span the top edge.`
                },
                {
                    title: `${side} down as well`,
                    copy: `${side} span the side too, and equal edges are what make the shape a square.`
                },
                {
                    title: `${side} rows of ${side}`,
                    copy: `${side} × ${side} = ${value}, which is the area the tiles cover.`
                },
                {
                    title: "The side is the square root",
                    copy: [rootPart(value, side), `: the side of the square whose area is ${value}.`]
                }
            ][clamp(index, 0, 4)];
        },

        paint(parts, model, index, within, eased) {
            const at = index + within;
            fade(parts.square, ease(clamp(at / 0.4)));

            let counted = 0;
            parts.cells.forEach((cell, position) => {
                const reveal = ease(clamp((at - 0.1 - position * (0.6 / model.value)) / 0.2));
                cell.style.opacity = String(reveal);
                if (reveal > 0.5) counted += 1;
            });

            const shown = at < 0.95 ? counted : model.value;
            const text = `${shown} unit ${shown === 1 ? "square" : "squares"}`;
            if (parts.tally.textContent !== text) parts.tally.textContent = text;
            fade(parts.tally, ease(clamp((at - 0.12) / 0.28)));

            fade(parts.across, ease(clamp((at - 1) / 0.45)));
            fade(parts.down, ease(clamp((at - 2) / 0.45)));

            /* One frame, moved from the row being counted to the column being
               counted, so the two measurements read as the same measurement
               taken twice rather than as two separate marks. */
            if (index === 1) applyBox(parts.mark, parts.top, parts.top, 1, ease(clamp(within / 0.5)));
            else if (index === 2) applyBox(parts.mark, parts.top, parts.left, eased, 1);
            else if (index === 3) applyBox(parts.mark, parts.left, parts.left, 1, 1 - ease(clamp(within / 0.55)));
            else parts.mark.style.opacity = "0";

            rise(parts.product, ease(clamp((at - 3) / 0.45)));
            rise(parts.root, ease(clamp((at - 4) / 0.45)));
        }
    };

    /* READING THE SQUARES BACKWARDS -------------------------------------- */

    const findPainter = {
        read(scene) {
            const raw = scene.dataset.target || "";
            if (!/^\d+$/.test(raw)) return null;
            const target = Number(raw);
            if (target < TARGET_MIN || target > TARGET_MAX) return null;
            const exact = SQUARES.find((one) => one.value === target);
            return exact ? { target, exact } : null;
        },

        stages: () => 4,

        heading: (model, node) => { rootLine(node, String(model.target)); },

        build(board, model) {
            board.replaceChildren();
            const wrap = el("div", "root-find");

            const statement = el("p", "root-find__statement");
            statement.setAttribute("role", "math");
            statement.setAttribute("aria-label",
                `the square root of ${model.target} equals ${model.exact.root}`);
            const radical = drawRoot("root-find__radicand", String(model.target)).wrap;
            const equals = el("span", "root-find__equals", "=");
            const answer = el("span", "root-find__answer", String(model.exact.root));
            statement.append(radical, equals, answer);

            const list = el("div", "root-find__list");
            const rows = SQUARES.map(({ root, value }) => {
                const row = el("span", "root-find__row");
                const base = el("b", "");
                const mark = el("span", "caret", "^");
                mark.setAttribute("aria-hidden", "true");
                base.append(String(root), mark, el("sup", "", "2"));
                row.append(base, el("i", "", "="), el("span", "", String(value)));
                list.append(row);
                return { row, base, root, value };
            });

            const mark = el("i", "root-mark");
            const flier = el("span", "root-find__flier", String(model.exact.root));
            const note = el("p", "root-find__note",
                `${model.exact.root} × ${model.exact.root} = ${model.target}`);

            wrap.append(statement, list, mark, flier, note);
            board.append(wrap);

            const parts = {
                wrap, radical, equals, answer, rows, mark, flier, note,
                matchBox: null, from: null, to: null
            };
            parts.measure = () => {
                const focus = rows[model.exact.root - 1];
                parts.matchBox = boxIn(wrap, [focus.row], 4);
                parts.from = centreIn(wrap, focus.base);
                parts.to = centreIn(wrap, answer);
            };
            return parts;
        },

        caption(model, index) {
            const { target, exact } = model;
            return [
                {
                    title: `${target} under the root sign`,
                    copy: `The question is which number multiplied by itself gives ${target}.`
                },
                {
                    title: "The squares of 1 to 15",
                    copy: "Each row carries a number and the square that number makes."
                },
                {
                    title: `${target} is the square of ${exact.root}`,
                    copy: `${target} appears once among them, and ${exact.root} is the number that made it.`
                },
                {
                    title: `The root is ${exact.root}`,
                    copy: [rootPart(target, exact.root), ", the number that was squared."]
                },
                {
                    title: "The check",
                    copy: `${exact.root} × ${exact.root} = ${target} returns the number under the sign.`
                }
            ][clamp(index, 0, 4)];
        },

        paint(parts, model, index, within, eased) {
            const at = index + within;
            fade(parts.radical, ease(clamp(at / 0.4)));

            fade(parts.equals, ease(clamp((at - 0.3) / 0.4)));

            parts.rows.forEach(({ row }, position) => {
                row.style.opacity = String(ease(clamp((at - 1 - position * 0.026) / 0.38)));
            });

            /* The source stays lit while its value is chosen and copied, and
               eases away only once the answer is standing on its own. */
            if (index < 2) parts.mark.style.opacity = "0";
            else {
                const holding = index === 2
                    ? ease(clamp(within / 0.5))
                    : index < 4 ? 1 : 1 - ease(clamp((within - 0.2) / 0.5));
                applyBox(parts.mark, parts.matchBox, parts.matchBox, 1, holding);
            }

            if (parts.from && parts.to) {
                const travel = index < 3 ? 0 : index > 3 ? 1 : eased;
                const landed = index > 3 ? 1 : index < 3 ? 0 : ease(clamp((within - 0.72) / 0.28));
                const lifted = index === 3 ? ease(clamp(within / 0.14)) : 0;
                const x = lerp(parts.from.x, parts.to.x, travel);
                const y = lerp(parts.from.y, parts.to.y, travel);
                parts.flier.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
                fade(parts.flier, lifted * (1 - landed));
                fade(parts.answer, landed);
            } else {
                parts.flier.style.opacity = "0";
                parts.answer.style.opacity = "0";
            }

            fade(parts.note, index >= 4 ? ease(clamp((within - 0.1) / 0.5)) : 0);
        }
    };

    /* A ROOT LARGER THAN ITS NUMBER -------------------------------------- */

    const unitPainter = {
        read: () => ({ side: "0.5", area: "0.25" }),

        stages: () => 4,

        heading: (model, node) => { node.textContent = "A square of side 1"; },

        build(board, model) {
            board.replaceChildren();
            const figure = el("div", "root-unit");
            const frame = el("div", "root-unit__frame");
            const wholeTop = el("span", "root-bracket root-bracket--top", "1");
            const wholeSide = el("span", "root-bracket root-bracket--side", "1");
            const halfTop = el("span", "root-bracket root-bracket--top-half", model.side);
            const halfSide = el("span", "root-bracket root-bracket--side-half", model.side);
            const square = el("div", "root-unit__square");
            const column = el("i", "root-unit__rule root-unit__rule--column");
            const row = el("i", "root-unit__rule root-unit__rule--row");
            const quarter = el("i", "root-unit__quarter");
            const area = el("span", "root-unit__area", model.area);
            square.append(quarter, column, row, area);
            frame.append(wholeTop, wholeSide, halfTop, halfSide, square);

            const product = el("p", "root-line root-line--quiet",
                `${model.side} × ${model.side} = ${model.area}`);
            const root = el("p", "root-line");
            rootLine(root, model.area, model.side);

            figure.append(frame, product, root);
            board.append(figure);
            return { square, wholeTop, wholeSide, halfTop, halfSide, column, row, quarter, area, product, root };
        },

        caption(model, index) {
            return [
                {
                    title: "A square of side 1",
                    copy: "Every edge is 1, so the area is 1 × 1 = 1."
                },
                {
                    title: "Halfway along each edge",
                    copy: "Half of 1 is 0.5, so each mark stands 0.5 from the corner."
                },
                {
                    title: "A square of side 0.5",
                    copy: "The corner piece has edges of 0.5, half the edge of the square around it."
                },
                {
                    title: "Its area is 0.25",
                    copy: "0.5 × 0.5 = 0.25, and four lots of 0.25 come back to 1."
                },
                {
                    title: "A root larger than its number",
                    copy: [rootPart("0.25", "0.5"), ", and 0.5 is larger than the 0.25 it came from."]
                }
            ][clamp(index, 0, 4)];
        },

        paint(parts, model, index, within) {
            const at = index + within;
            fade(parts.square, ease(clamp(at / 0.4)));
            const whole = ease(clamp((at - 0.25) / 0.4));
            fade(parts.wholeTop, whole);
            fade(parts.wholeSide, whole);

            const halved = ease(clamp((at - 1) / 0.42));
            fade(parts.column, halved);
            fade(parts.row, halved);
            const halfLabel = ease(clamp((at - 1.3) / 0.4));
            fade(parts.halfTop, halfLabel);
            fade(parts.halfSide, halfLabel);

            fade(parts.quarter, ease(clamp((at - 2) / 0.42)));
            fade(parts.area, ease(clamp((at - 3) / 0.4)));
            rise(parts.product, ease(clamp((at - 3) / 0.45)));
            rise(parts.root, ease(clamp((at - 4) / 0.45)));
        }
    };

    /* HALVING A COUNT OF DECIMAL PLACES ---------------------------------- */

    const decimalPainter = {
        read: (scene) => {
            const text = scene.dataset.number || "0.0016";
            if (!/^\d+(\.\d+)?$/.test(text)) return null;
            const places = text.includes(".") ? text.split(".")[1].length : 0;
            const figures = Number(text.replace(".", ""));
            const rootFigures = Math.round(Math.sqrt(figures));
            if (places % 2 !== 0 || rootFigures * rootFigures !== figures) return null;
            const rootPlaces = places / 2;
            const root = (rootFigures / Math.pow(10, rootPlaces)).toFixed(rootPlaces);
            return { text, places, figures, rootFigures, rootPlaces, root };
        },

        stages: () => 4,

        heading: (model, node) => { rootLine(node, model.text); },

        build(board, model) {
            board.replaceChildren();
            const figure = el("div", "root-dec");

            /* One token per character, so a place can be counted under the digit
               it belongs to and the figures can be framed without the point. */
            const line = el("div", "root-dec__line");
            line.setAttribute("role", "math");
            line.setAttribute("aria-label",
                `the square root of ${model.text} equals ${model.root}`);
            const radChars = Array.from(model.text).map((character) =>
                el("span", "root-dec__char", character));
            const equals = el("span", "root-dec__equals", "=");
            const rootChars = Array.from(model.root).map((character) =>
                el("span", "root-dec__char root-dec__answer", character));
            line.append(drawRoot("", ...radChars).wrap, equals, ...rootChars);

            const ticks = el("div", "root-dec__ticks");
            const radTicks = Array.from({ length: model.places }, (unused, at) => {
                const tick = el("i", "root-dec__tick", String(at + 1));
                ticks.append(tick);
                return tick;
            });
            const rootTicks = Array.from({ length: model.rootPlaces }, (unused, at) => {
                const tick = el("i", "root-dec__tick", String(at + 1));
                ticks.append(tick);
                return tick;
            });

            const figures = el("p", "root-dec__figures");
            rootLine(figures, String(model.figures), String(model.rootFigures));
            const check = el("p", "root-dec__check",
                `${model.root} × ${model.root} = ${model.text}`);
            const mark = el("i", "root-mark");

            figure.append(line, ticks, figures, check, mark);
            board.append(figure);

            /* The figures are what is left when the point and the leading zeros
               are set aside, which is the same set of characters the frame goes
               round. */
            const digits = radChars.filter((node) => node.textContent !== ".");
            const significant = digits.slice(-String(model.figures).length);
            const point = model.text.indexOf(".");
            const rootPoint = model.root.indexOf(".");

            const parts = {
                figure, radChars, equals, rootChars, radTicks, rootTicks,
                figures, check, mark, markBox: null
            };
            parts.measure = () => {
                parts.markBox = boxIn(figure, significant, 4);
                radTicks.forEach((tick, at) => {
                    const centre = centreIn(figure, radChars[point + 1 + at]);
                    if (centre) tick.style.left = `${centre.x}px`;
                });
                rootTicks.forEach((tick, at) => {
                    const centre = centreIn(figure, rootChars[rootPoint + 1 + at]);
                    if (centre) tick.style.left = `${centre.x}px`;
                });
            };
            return parts;
        },

        caption(model, index) {
            return [
                {
                    title: `${model.text} under the root sign`,
                    copy: `The question is which number multiplied by itself gives ${model.text}.`
                },
                {
                    title: `${model.places} decimal places`,
                    copy: `${model.text} carries ${model.places} figures after the point, and that count is what a root halves.`
                },
                {
                    title: "The figures alone",
                    copy: [`Setting the point aside leaves ${model.figures}, and `, rootPart(model.figures, model.rootFigures), "."]
                },
                {
                    title: "Half as many places",
                    copy: `Squaring doubles a decimal count, so ${model.rootFigures} is written ${model.rootPlaces} places after the point: ${model.root}.`
                },
                {
                    title: "The check",
                    copy: `${model.root} × ${model.root} = ${model.text} returns the number under the sign.`
                }
            ][clamp(index, 0, 4)];
        },

        paint(parts, model, index, within) {
            const at = index + within;
            parts.radChars.forEach((node, position) => {
                node.style.opacity = String(ease(clamp((at - 0.06 - position * 0.05) / 0.28)));
            });

            parts.radTicks.forEach((tick, position) => {
                tick.style.opacity = String(ease(clamp((at - 1 - position * 0.13) / 0.3)));
            });

            if (index === 2) applyBox(parts.mark, parts.markBox, parts.markBox, 1, ease(clamp(within / 0.45)));
            else if (index === 3) applyBox(parts.mark, parts.markBox, parts.markBox, 1, 1 - ease(clamp(within / 0.55)));
            else parts.mark.style.opacity = "0";

            rise(parts.figures, ease(clamp((at - 2.2) / 0.45)));

            fade(parts.equals, ease(clamp((at - 3) / 0.35)));
            parts.rootChars.forEach((node, position) => {
                node.style.opacity = String(ease(clamp((at - 3.1 - position * 0.07) / 0.3)));
            });
            parts.rootTicks.forEach((tick, position) => {
                tick.style.opacity = String(ease(clamp((at - 3.45 - position * 0.1) / 0.3)));
            });

            rise(parts.check, ease(clamp((at - 4) / 0.45)));
        }
    };

    const PAINTERS = { tiles: tilesPainter, find: findPainter, unit: unitPainter, decimal: decimalPainter };

    /* ------------------------------------------------------------- engine */

    const createScene = (scene) => {
        const sticky = scene.querySelector(".root-scene__sticky");
        /* The card is moved into the body while it is pinned, so a second
           initialisation would find the scene empty. Better to do nothing than
           to tear down a card the reader is already looking at. */
        if (!sticky) return null;

        const painter = PAINTERS[scene.dataset.scene || "tiles"];
        if (!painter) return null;

        const board = scene.querySelector("[data-board]");
        const stepTitle = scene.querySelector("[data-step-title]");
        const stepCopy = scene.querySelector("[data-step-copy]");
        const progressBar = scene.querySelector("[data-progress]");
        const heading = scene.querySelector("[data-heading]");



        /* Every scene here is a worked example, read once and moved past. */
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
            const eased = ease(within);

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
            painter.paint(parts, model, index, within, eased, totalStages, through);
        };

        const buildDots = () => {
            progressBar.replaceChildren(...Array.from({ length: totalStages + 1 }, () => {
                const dot = document.createElement("i");
                dot.className = "root-scene__dot";
                return dot;
            }));
        };

        const render = (progress) => paint(clamp(progress) * (totalStages + 1));

        scene.classList.add("is-ready");

        /* Pinning takes the card out of the page and puts it on the body. */
        const moveCard = (move) => move();

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

        const repaintInPlace = () => {
            if (reduceMotion.matches) {
                render(1);
                return;
            }
            const { sceneRect, visualScale, pinTop, travel } = geometry();
            render(clamp((pinTop - sceneRect.top) / (travel * visualScale)));
        };

        /* Built once: nothing on the page changes the number a scene works. */
        const build = () => {
            const next = painter.read(scene);
            if (!next) return;
            model = next;
            if (heading && painter.heading) painter.heading(model, heading);

            totalStages = painter.stages(model);
            buildDots();
            scene.style.setProperty("--scene-height", `${(totalStages + 1) * paceVh}vh`);
            scene.style.setProperty("--scene-min-height", `${(totalStages + 1) * pacePx}px`);

            parts = painter.build(board, model);
            if (parts.measure) parts.measure();
            stage = -1;
            requestUpdate();
        };

        const reset = () => {
            dock(0);
            cardHeight = sticky.offsetHeight;
            if (parts && parts.measure) parts.measure();
            stage = -1;
            requestUpdate();
        };

        /* The card is measured only once the board has something in it: an
           empty board would under-measure it and the pinned card would clip its
           own conclusion. */
        build();
        cardHeight = sticky.offsetHeight;
        if (parts && parts.measure) parts.measure();
        update();
        return { requestUpdate, reset };
    };

    /* ------------------------------------------------ the squares figure

       Two lines and one number. The upper line is the numbers 1 to 100 with a
       tick at each square; the lower is the roots 1 to 10 with a tick at each
       whole number. Either marker can be moved and the other follows, because
       both are views of the same value: landing on a tick is landing on a
       square, and standing between two ticks is having a root between two whole
       numbers. The two markers do not sit at the same place, and that is the
       point — squaring is not a stretch by a constant.

       Nothing on the page explains it. The marker is the only thing on either
       line that can be taken hold of, and the slider role on each axis is how a
       keyboard and a screen reader reach the same affordance. */

    const buildBetween = () => {
        const axes = Array.from(document.querySelectorAll("[data-axis]"));
        if (!axes.length) return;
        const reading = document.querySelector("[data-reading]");
        const TOP = 10;
        const LOW = 1;
        const HIGH = TOP * TOP;

        /* Where a value stands on each line, and what a grip anywhere along one
           of them comes back to. The number line is linear in the number; the
           root line is linear in the root, which is why the two markers sit at
           different places. */
        const place = {
            number: (n) => (n - 1) / (HIGH - 1) * 100,
            root: (n) => (Math.sqrt(n) - 1) / (TOP - 1) * 100
        };
        const from = {
            number: (t) => 1 + clamp(t) * (HIGH - 1),
            root: (t) => Math.pow(1 + clamp(t) * (TOP - 1), 2)
        };

        const parts = axes.map((axis) => ({
            axis,
            kind: axis.dataset.axis,
            marker: axis.querySelector("[data-marker]"),
            value: axis.querySelector("[data-value]")
        }));

        const sf = (text) => el("span", "sf", text);
        const supSpan = (text) => {
            const holder = el("span", "sf");
            const mark = el("span", "caret", "^");
            mark.setAttribute("aria-hidden", "true");
            holder.append(mark, el("sup", "", text));
            return holder;
        };

        let current = null;

        const show = (n) => {
            const next = clamp(Math.round(n), LOW, HIGH);
            if (next === current) return;
            current = next;
            const root = Math.sqrt(next);
            const exact = Number.isInteger(root);
            const low = Math.floor(root);

            parts.forEach((part) => {
                const x = place[part.kind](next);
                part.marker.style.left = `${x}%`;
                part.value.style.left = `${x}%`;
                if (part.kind === "number") part.value.textContent = String(next);
                else part.value.replaceChildren(drawRoot("", String(next)).wrap);
                part.axis.setAttribute("aria-valuenow", String(next));
                part.axis.setAttribute("aria-valuetext", part.kind === "number"
                    ? (exact
                        ? `${next}, the square of ${root}`
                        : `${next}, between the squares ${low * low} and ${(low + 1) * (low + 1)}`)
                    : (exact
                        ? `the square root of ${next}, which is ${root}`
                        : `the square root of ${next}, between ${low} and ${low + 1}`));
            });

            if (exact) {
                reading.replaceChildren(
                    sf(`${next} = ${root}`), supSpan("2"), sf(", so "),
                    ...rootNodes(next, root).nodes, sf(" exactly.")
                );
            } else {
                reading.replaceChildren(
                    sf(`${low * low} < ${next} < ${(low + 1) * (low + 1)}`), sf(", so "),
                    ...rootNodes(next).nodes, sf(` lies between ${low} and ${low + 1}.`)
                );
            }
        };

        parts.forEach((part) => {
            const { axis, kind } = part;
            const gripAt = (clientX) => {
                const box = axis.getBoundingClientRect();
                if (!box.width) return;
                show(from[kind]((clientX - box.left) / box.width));
            };

            let holding = false;
            axis.addEventListener("pointerdown", (event) => {
                holding = true;
                axis.setPointerCapture(event.pointerId);
                axis.focus({ preventScroll: true });
                gripAt(event.clientX);
                event.preventDefault();
            });
            axis.addEventListener("pointermove", (event) => { if (holding) gripAt(event.clientX); });
            const release = (event) => {
                holding = false;
                if (axis.hasPointerCapture(event.pointerId)) axis.releasePointerCapture(event.pointerId);
            };
            axis.addEventListener("pointerup", release);
            axis.addEventListener("pointercancel", release);

            const STEPS = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -10, PageUp: 10 };
            axis.addEventListener("keydown", (event) => {
                if (event.key === "Home") { show(LOW); event.preventDefault(); return; }
                if (event.key === "End") { show(HIGH); event.preventDefault(); return; }
                const step = STEPS[event.key];
                if (step === undefined) return;
                show(current + step);
                event.preventDefault();
            });
        });

        show(Number(axes[0].getAttribute("aria-valuenow")) || 50);
    };

    buildBetween();

    /* The figure above stands on its own; the scenes are what needs the rest. */
    const scenes = document.querySelectorAll("[data-root-scene]");
    if (!scenes.length) return;

    const controllers = Array.from(scenes).map(createScene).filter(Boolean);
    const nudge = () => controllers.forEach((controller) => controller.requestUpdate());
    const resetAll = () => controllers.forEach((controller) => controller.reset());

    window.addEventListener("scroll", nudge, { passive: true });
    window.addEventListener("resize", resetAll);
    reduceMotion.addEventListener("change", resetAll);
    window.addEventListener("load", resetAll);

    /* Web fonts land after the first measurement, and a root sign that arrives a
       little wider moves every digit the frames and the travelling numeral were
       measured against. */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resetAll);
});
