/* A number and its square, on two lines that move together.

   The page has no scroll-led card. It was written with three, and each one drew
   its idea by revealing a line of text at a time — which is a paragraph in a box
   rather than an animation, and the reader scrolls a long way to be shown
   writing. What this page actually has to show is one thing: two numbers reach
   the same square, and only at 0 do they meet. That is a movement, so it is the
   one thing here the reader moves.

   Everything else on the page is notation and convention, which a diagram
   cannot make truer than a sentence can. */

document.addEventListener("DOMContentLoaded", () => {
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

    /* The figure's lines: numbers from −10 to 10, and their squares from 0 to
       100. Both ends are worked out from the range rather than written down, so
       a tick and the arithmetic behind it cannot disagree. */
    const X_MIN = -10;
    const X_MAX = 10;
    const SQ_MAX = X_MAX * X_MAX;

    const MINUS = "−";
    const signed = (value) => (value < 0 ? MINUS + String(-value) : String(value));
    const spoken = (value) => (value < 0 ? `negative ${-value}` : String(value));

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    /* Strip the page of its styling and a raised index is lost: 7<sup>2</sup>
       becomes the two characters "72" and reads as seventy-two. The clipped
       caret is never seen and never spoken, and it keeps the flattened text
       reading what the page reads. */
    const hiddenText = (text) => {
        const mark = el("span", "caret", text);
        mark.setAttribute("aria-hidden", "true");
        return mark;
    };

    /* A square, written with the index raised and the caret keeping it raised
       once the styling is gone. */
    const squared = (base, label) => {
        const holder = el("span");
        holder.setAttribute("role", "math");
        holder.setAttribute("aria-label", label);
        holder.append(String(base), hiddenText("^"));
        holder.append(el("sup", "", "2"));
        return holder;
    };

    const buildMirror = () => {
        const figure = document.querySelector(".mirror");
        const axes = Array.from(document.querySelectorAll("[data-axis]"));
        if (!figure || !axes.length) return;

        const reading = document.querySelector("[data-reading]");
        const find = (name, kind) => document.querySelector(`[data-${kind}="${name}"]`);
        const marker = (name) => find(name, "marker");
        const value = (name) => find(name, "value");

        const parts = {
            x: { axis: axes.find((a) => a.dataset.axis === "x"), marker: marker("x"), value: value("x") },
            mirror: { marker: marker("mirror"), value: value("mirror") },
            square: { axis: axes.find((a) => a.dataset.axis === "square"), marker: marker("square"), value: value("square") }
        };
        if (!parts.x.axis || !parts.square.axis) return;

        const xPos = (v) => (v - X_MIN) / (X_MAX - X_MIN) * 100;
        const sqPos = (k) => k / SQ_MAX * 100;

        /* The value is held in tenths, as a whole number of them, for two
           reasons. It gives the line two hundred places to stand in rather than
           twenty, so a marker follows a finger instead of hopping between whole
           numbers. And a tenth times a tenth is exactly a hundredth, so every
           square is worked out in integers and 6.4 × 6.4 comes to 40.96 rather
           than to 40.96000000000001. */
        const STEP = 10;
        let tenths = 70;

        const trim = (v) => String(Number(v.toFixed(2)));
        const squareOf = (t) => (t * t) / 100;

        const place = (node, percent) => { if (node) node.style.left = `${percent.toFixed(4)}%`; };

        const show = (next) => {
            tenths = Math.max(X_MIN * STEP, Math.min(X_MAX * STEP, Math.round(next)));
            const current = tenths / STEP;
            const square = squareOf(tenths);
            const size = Math.abs(current);
            const merged = tenths === 0;

            place(parts.x.marker, xPos(current));
            place(parts.x.value, xPos(current));
            if (parts.x.value) parts.x.value.textContent = signed(current);

            place(parts.mirror.marker, xPos(-current));
            place(parts.mirror.value, xPos(-current));
            if (parts.mirror.value) parts.mirror.value.textContent = signed(-current);
            [parts.mirror.marker, parts.mirror.value].forEach((node) => {
                if (node) node.classList.toggle("is-merged", merged);
            });

            place(parts.square.marker, sqPos(square));
            place(parts.square.value, sqPos(square));
            if (parts.square.value) parts.square.value.textContent = trim(square);

            parts.x.axis.setAttribute("aria-valuenow", trim(current));
            parts.x.axis.setAttribute("aria-valuetext", merged
                ? "0, whose square is 0, the only number that squares to 0"
                : `${spoken(current)}, whose square is ${trim(square)}, shared with ${spoken(-current)}`);
            parts.square.axis.setAttribute("aria-valuenow", trim(square));
            parts.square.axis.setAttribute("aria-valuetext", merged
                ? "0, reached from 0 alone"
                : `${trim(square)}, reached from ${trim(size)} and from negative ${trim(size)}`);

            if (!reading) return;
            reading.replaceChildren();
            if (merged) {
                const statement = el("span", "sf");
                statement.setAttribute("role", "math");
                statement.setAttribute("aria-label", "0 squared equals 0");
                statement.append(squared("0", "0 squared"), " = 0");
                reading.append(statement, ", and 0 is the only number that squares to 0.");
            } else {
                const shown = trim(size);
                const answer = trim(square);
                const statement = el("span", "sf");
                statement.setAttribute("role", "math");
                statement.setAttribute("aria-label",
                    `${shown} squared equals ${answer} and negative ${shown} squared equals ${answer}`);
                statement.append(squared(shown, `${shown} squared`), ` = ${answer} and `,
                    squared(`(${MINUS}${shown})`, `negative ${shown} squared`), ` = ${answer}`);
                reading.append(statement, `, so two numbers square to ${answer}.`);
            }
        };

        const sign = () => (tenths < 0 ? -1 : 1);

        /* A square carries no sign, so dragging the lower line has to keep the
           one the upper line already had. Read afresh each frame, it would be
           lost the moment a drag passed through 0, and the number could never be
           brought back to the negative side of the line. */
        let heldSign = sign();

        const gripAt = (axis, clientX) => {
            const rect = axis.getBoundingClientRect();
            const fraction = rect.width ? clamp((clientX - rect.left) / rect.width) : 0;
            if (axis.dataset.axis === "x") show((X_MIN + fraction * (X_MAX - X_MIN)) * STEP);
            else show(heldSign * Math.sqrt(fraction * SQ_MAX) * STEP);
        };

        /* Whole numbers are what the line is read at, so a key steps to the next
           one rather than crawling through the tenths a finger can reach. */
        const wholeStep = (from, direction) => {
            const at = from / STEP;
            return (Number.isInteger(at) ? at + direction
                : (direction > 0 ? Math.ceil(at) : Math.floor(at))) * STEP;
        };

        [parts.x.axis, parts.square.axis].forEach((axis) => {
            axis.addEventListener("pointerdown", (event) => {
                axis.setPointerCapture(event.pointerId);
                axis.dataset.holding = "true";
                /* The markers glide between keyboard steps; while a finger is
                   down they must track it exactly, so the easing comes off. */
                figure.classList.add("is-dragging");
                heldSign = sign();
                gripAt(axis, event.clientX);
                event.preventDefault();
            });
            axis.addEventListener("pointermove", (event) => {
                if (axis.dataset.holding === "true") gripAt(axis, event.clientX);
            });
            const release = (event) => {
                if (axis.dataset.holding !== "true") return;
                axis.dataset.holding = "false";
                figure.classList.remove("is-dragging");
                if (axis.hasPointerCapture && axis.hasPointerCapture(event.pointerId)) {
                    axis.releasePointerCapture(event.pointerId);
                }
            };
            axis.addEventListener("pointerup", release);
            axis.addEventListener("pointercancel", release);

            axis.addEventListener("keydown", (event) => {
                const onSquare = axis.dataset.axis === "square";
                const size = Math.abs(tenths);
                let next = null;
                if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                    next = onSquare ? sign() * Math.min(X_MAX * STEP, wholeStep(size, 1)) : wholeStep(tenths, 1);
                } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                    next = onSquare ? sign() * Math.max(0, wholeStep(size, -1)) : wholeStep(tenths, -1);
                } else if (event.key === "Home") {
                    next = onSquare ? 0 : X_MIN * STEP;
                } else if (event.key === "End") {
                    next = onSquare ? sign() * X_MAX * STEP : X_MAX * STEP;
                }
                if (next === null) return;
                event.preventDefault();
                show(next);
            });
        });

        show(tenths);
    };

    buildMirror();
});
