/* Scroll-led recognising powers. The page stays a normal document: each scene
   reserves its own scroll distance and pins its card while the reader passes
   through, so every drawing advances with the scroll rather than on a timer.

   Three pictures, because the page asks three different questions of the same
   idea. A square grows by the next odd number, which is what makes the squares
   a list worth holding. Sixty-four counters are laid out three ways, because
   one number can be a power of more than one base. And a number is tested
   against a base by dividing until it reaches 1 or stops coming out whole. */

/* Geometry and colour shared by the scroll-led scenes and the figures the
   reader turns by hand. */
const SVG = "http://www.w3.org/2000/svg";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const readable = (value) => Number(value).toLocaleString("en-GB");

/* ------------------------------------------------------- quaternions */

const qMultiply = (a, b) => [
    a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
    a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
    a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
    a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0]
];

const qNormalise = (q) => {
    const length = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
    return [q[0] / length, q[1] / length, q[2] / length, q[3] / length];
};

const qFromAxisAngle = (axis, angle) => {
    const half = angle / 2;
    const sin = Math.sin(half);
    const length = Math.hypot(axis[0], axis[1], axis[2]) || 1;
    return [Math.cos(half), axis[0] / length * sin, axis[1] / length * sin, axis[2] / length * sin];
};

/* The point of the sphere the pointer is over, or the nearest point on its
   silhouette once the pointer has left it. */
const onSphere = (x, y) => {
    const square = x * x + y * y;
    if (square <= 1) return [x, y, Math.sqrt(1 - square)];
    const length = Math.sqrt(square);
    return [x / length, y / length, 0];
};

/* A rotation split into the part that turns the figure towards the reader
   and the part that spins it about the line of sight. The second is the one
   degree of freedom a drag has spare once the figure is facing where it was
   pointed, and it is what the fourth direction is given. */
const swingAndTwist = (q) => {
    const length = Math.hypot(q[0], q[3]);
    if (length < 1e-6) return { swing: q, twist: [1, 0, 0, 0] };
    const twist = [q[0] / length, 0, 0, q[3] / length];
    const inverse = [twist[0], -twist[1], -twist[2], -twist[3]];
    return { swing: qNormalise(qMultiply(q, inverse)), twist };
};

/* The shortest rotation carrying one sphere point to another. */
const arcBetween = (from, to) => qNormalise([
    1 + from[0] * to[0] + from[1] * to[1] + from[2] * to[2],
    from[1] * to[2] - from[2] * to[1],
    from[2] * to[0] - from[0] * to[2],
    from[0] * to[1] - from[1] * to[0]
]);

/* ------------------------------------------------------------ colour */

/* Blending happens on triples and only becomes a string at the end, so a
   blend can be blended again without being parsed back out of text. */
const hexToRgb = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
const mix = (from, to, amount) => {
    const t = clamp(amount, 0, 1);
    return [0, 1, 2].map((channel) => from[channel] + (to[channel] - from[channel]) * t);
};
const rgb = ([r, g, b]) => `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
const mixHex = (from, to, amount) => rgb(mix(hexToRgb(from), hexToRgb(to), amount));

/* -------------------------------------------------------------- cube */

/* Every small cube face of an n by n by n solid, as a quad of corners and
   an outward normal. Only the outer faces are built: the ones inside the
   solid can never be seen. */
/* ROTATION IN ANY NUMBER OF DIMENSIONS

   A shape of d directions is turned by an orthonormal d by d matrix, so nothing
   is folded down to three or four dimensions before it is turned: a six
   dimensional lattice is rotated in six dimensional space and only then cast
   down onto the page.

   A rotation of d-space has d(d−1)/2 planes and a pointer supplies two numbers,
   so one gesture cannot reach every orientation at once. The drag is split the
   way a hand turns an object: the part that carries the shape towards where it
   was pointed rotates the two planes that contain the line of sight, and the
   spin about that line — the one thing a drag can ask for that a solid has no
   use for — is spent on the planes that leave the page, at rates that share no
   common measure so that repeated drags reach everywhere. */

const identityMatrix = (size) => Array.from({ length: size }, (row, i) =>
    Array.from({ length: size }, (column, j) => (i === j ? 1 : 0)));

/* One Givens rotation, applied on the left so the turn is read in the camera's
   frame rather than the shape's. */
const rotatePlane = (matrix, i, j, angle) => {
    if (!angle || i >= matrix.length || j >= matrix.length) return matrix;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rowI = matrix[i];
    const rowJ = matrix[j];
    for (let column = 0; column < matrix.length; column += 1) {
        const a = rowI[column];
        const b = rowJ[column];
        rowI[column] = cos * a - sin * b;
        rowJ[column] = sin * a + cos * b;
    }
    return matrix;
};

const applyRotation = (matrix, point) => matrix.map((row) => {
    let total = 0;
    for (let column = 0; column < row.length; column += 1) total += row[column] * (point[column] || 0);
    return total;
});

/* Rounding drifts a matrix off the orthonormal after enough turns, which would
   slowly shear the shape, so the rows are straightened after every gesture. */
const straighten = (matrix) => {
    for (let i = 0; i < matrix.length; i += 1) {
        for (let j = 0; j < i; j += 1) {
            let dot = 0;
            for (let c = 0; c < matrix.length; c += 1) dot += matrix[i][c] * matrix[j][c];
            for (let c = 0; c < matrix.length; c += 1) matrix[i][c] -= dot * matrix[j][c];
        }
        let length = 0;
        for (let c = 0; c < matrix.length; c += 1) length += matrix[i][c] * matrix[i][c];
        length = Math.sqrt(length) || 1;
        for (let c = 0; c < matrix.length; c += 1) matrix[i][c] /= length;
    }
    return matrix;
};

/* The rates the hidden planes turn at, relative to the spin the drag asked for.
   Deliberately not simple fractions of each other, so composing drags is not
   confined to some smaller set of orientations. */
const HIDDEN_RATES = [1, 0.618, 0.382];

/* How fast a figure turns when it is left to itself. The two planes inside the
   three directions a reader can point at turn slowly, at the pace of a tumble
   anyone can follow. Every plane that reaches out of them turns faster, and
   every one of them turns: that motion is the only sight anyone gets of a
   direction that cannot be pointed at, and a plane left still is a direction
   the figure never shows. No rate is a simple multiple of another, so the whole
   never settles back into a pose it has already held. */
const VISIBLE_RATES = [0.052, 0.037];
const OUTWARD_RATES = [0.301, 0.233, 0.187, 0.271, 0.163, 0.211, 0.139, 0.247, 0.179, 0.121, 0.197, 0.151];

/* Every plane the figure has, paired with the rate it turns at: the two inside
   the visible three, then each plane that reaches into a direction beyond
   them. Worked out once for each width of figure rather than every frame. */
const driftPlanes = (live) => {
    const planes = [];
    for (let axis = 0; axis + 1 < live && axis < 2; axis += 1) {
        planes.push([axis, axis + 1, VISIBLE_RATES[axis]]);
    }
    let n = 0;
    for (let far = 3; far < live; far += 1) {
        for (let near = 0; near < far; near += 1) {
            planes.push([near, far, OUTWARD_RATES[n % OUTWARD_RATES.length]]);
            n += 1;
        }
    }
    return planes;
};

/* Draw a figure's turn out of the directions it no longer has. Taking them
   away in one frame leaves the directions that remain holding a pose the reader
   never saw them move into, which is the snap you get on the way from a
   tesseract back to a cube. Easing the matrix towards the one it would have
   been given instead lets it settle the way everything else on the page does.
   Returns how far there is still to go, so the settling can stop when it is
   done. */
const confine = (matrix, live, amount) => {
    const size = matrix.length;
    let adrift = 0;
    for (let row = 0; row < size; row += 1) {
        for (let column = 0; column < size; column += 1) {
            if (row < live && column < live) continue;
            const gap = (row === column ? 1 : 0) - matrix[row][column];
            const off = gap < 0 ? -gap : gap;
            if (off > adrift) adrift = off;
            matrix[row][column] += gap * amount;
        }
    }
    return adrift;
};

/* How quickly it settles, as a proportion of what is left each second. */
const SETTLE_RATE = 7;

/* Scale a rotation down without changing its axis, so a turn can be handed on
   to the next frame a little smaller than it was. */
const easeRotation = (q, amount) => {
    const axis = Math.hypot(q[1], q[2], q[3]);
    if (axis < 1e-9) return [1, 0, 0, 0];
    const angle = 2 * Math.atan2(axis, q[0]) * amount;
    const half = Math.sin(angle / 2);
    return qNormalise([Math.cos(angle / 2), q[1] / axis * half, q[2] / axis * half, q[3] / axis * half]);
};

const rotationAngle = (q) => 2 * Math.atan2(Math.hypot(q[1], q[2], q[3]), Math.abs(q[0]));

const attachTrackball = (surface, options) => {
    const size = Math.max(3, options.dimensions || 3);
    /* `live` is how many directions are actually drawn at the moment. Turning
       in a plane that reaches past them would give a point a coordinate along a
       direction the figure has not been drawn out into, and the casts down to
       the page would then bend it out of shape — a cube would stop looking like
       a cube. */
    const state = { matrix: identityMatrix(size), dimensions: size, live: size };
    /* A quarter turn each way, so a solid never opens as a flat square. */
    rotatePlane(state.matrix, 1, 2, 0.62);
    rotatePlane(state.matrix, 0, 2, -0.42);

    const still = reduceMotion.matches;
    /* Every listener is hung on one signal, so a board that is replaced takes
       its trackball with it. A stale one left listening would wake on the next
       pointer event and paint its own dead drawing over the live one. */
    const listening = new AbortController();
    const on = (type, handler) => surface.addEventListener(type, handler, { signal: listening.signal });
    let held = state.matrix.map((row) => row.slice());
    let anchor = null;
    let wanted = null;
    let eased = null;
    let previous = null;
    let carried = null;
    /* The planes the drift turns, rebuilt only when the figure gains or loses
       a direction. */
    let drifting = [];
    let driftedAt = -1;
    let running = false;
    let last = 0;
    const pointers = new Map();

    /* One turn of the figure: the part that carries it towards where it was
       pointed goes to the planes holding the line of sight, and the spin about
       that line is spent on the planes that leave the page. */
    const applyTurn = (matrix, rotation) => {
        const { swing, twist } = swingAndTwist(rotation);
        const axis = Math.hypot(swing[1], swing[2]);
        if (axis > 1e-6) {
            const along = Math.atan2(swing[1], -swing[2]);
            const angle = 2 * Math.atan2(axis, Math.abs(swing[0])) * Math.sign(swing[0] || 1);
            rotatePlane(matrix, 0, 1, -along);
            rotatePlane(matrix, 0, 2, angle);
            rotatePlane(matrix, 0, 1, along);
        }
        const spin = 2 * Math.atan2(twist[3], twist[0]);
        if (state.live <= 3) {
            rotatePlane(matrix, 0, 1, spin);
        } else {
            for (let hidden = 3; hidden < state.live; hidden += 1) {
                rotatePlane(matrix, hidden - 1, hidden, spin * HIDDEN_RATES[hidden - 3]);
            }
        }
        return matrix;
    };

    const pointAt = (point) => {
        const box = surface.getBoundingClientRect();
        if (!box.width || !box.height) return [0, 0, 1];
        return onSphere(
            ((point.x - box.left) / box.width) * 2 - 1,
            1 - ((point.y - box.top) / box.height) * 2
        );
    };

    const grip = () => {
        const active = [...pointers.values()];
        const sum = active.reduce((total, point) => ({ x: total.x + point.x, y: total.y + point.y }), { x: 0, y: 0 });
        return { x: sum.x / active.length, y: sum.y / active.length };
    };

    /* Re-anchored whenever the gesture changes shape, so a second finger
       landing or leaving never makes the figure jump. */
    const reanchor = () => {
        held = state.matrix.map((row) => row.slice());
        anchor = pointAt(grip());
        wanted = anchor;
        eased = anchor;
        previous = anchor;
        carried = null;
    };

    const onScreen = () => {
        const box = surface.getBoundingClientRect();
        return box.bottom > 0 && box.top < window.innerHeight && box.width > 0;
    };

    const rest = options.rest || 0;
    const frame = (now) => {
        if (!running) return;
        if (last && now - last < rest) { window.requestAnimationFrame(frame); return; }
        const seconds = last ? Math.min(0.05, (now - last) / 1000) : 0;
        last = now;
        let moved = false;
        const turning = pointers.size > 0 && Boolean(wanted);
        /* Under the hand it is the orientation the drag is measured from that
           turns, so the hand and everything else compose instead of one
           waiting on the other. */
        const turn = turning ? held : state.matrix;

        /* A figure that has lost a direction eases out of the turn it held in
           it rather than being cut back to three all at once. */
        if (seconds && state.live < state.dimensions) {
            if (confine(turn, state.live, 1 - Math.exp(-seconds * SETTLE_RATE)) > 2e-4) moved = true;
        }

        /* The drift never stops. */
        if (options.drift && seconds && onScreen()) {
            if (driftedAt !== state.live) {
                drifting = driftPlanes(state.live);
                driftedAt = state.live;
            }
            for (let n = 0; n < drifting.length; n += 1) {
                const plane = drifting[n];
                rotatePlane(turn, plane[0], plane[1], seconds * plane[2]);
            }
            moved = true;
        }
        if (moved) straighten(turn);

        if (turning) {
            /* The drawn orientation chases the pointer rather than snapping to
               it, which is what takes the judder out of a drag. */
            const catchUp = 1 - Math.exp(-seconds * 22);
            const chased = eased.map((value, axis) => value + (wanted[axis] - value) * catchUp);
            const length = Math.hypot(chased[0], chased[1], chased[2]) || 1;
            eased = [chased[0] / length, chased[1] / length, chased[2] / length];
            state.matrix = applyTurn(held.map((row) => row.slice()), arcBetween(anchor, eased));
            carried = arcBetween(previous, eased);
            previous = eased;
            moved = true;
        } else if (carried && rotationAngle(carried) > 2e-4) {
            /* Let go and the figure carries on, slowing as it goes. */
            applyTurn(state.matrix, carried);
            carried = easeRotation(carried, Math.pow(0.06, seconds));
            moved = true;
        } else {
            carried = null;
        }

        if (moved) {
            straighten(state.matrix);
            if (onScreen()) options.onTurn();
        }
        window.requestAnimationFrame(frame);
    };

    const start = () => {
        if (running || still) return;
        running = true;
        last = 0;
        window.requestAnimationFrame(frame);
    };

    /* Fewer directions on show means the turning has to be confined to them,
       and any turn already carried into the others has to go: otherwise the
       figure keeps the deformation it picked up while they were still there. */
    state.setLive = (count) => {
        const wanted = Math.max(3, Math.min(state.dimensions, count));
        if (wanted === state.live) return;
        state.live = wanted;
        /* Where motion is unwelcome there is nothing to settle into: the turn
           in the directions that have gone is taken away at once. */
        if (still) {
            confine(state.matrix, wanted, 1);
            straighten(state.matrix);
            if (pointers.size) reanchor();
            return;
        }
        start();
    };

    state.stop = () => { running = false; listening.abort(); };
    state.resize = (dimensions) => {
        const size = Math.max(3, dimensions);
        if (size === state.dimensions) return;
        const grown = identityMatrix(size);
        const keep = Math.min(size, state.matrix.length);
        for (let i = 0; i < keep; i += 1) {
            for (let j = 0; j < keep; j += 1) grown[i][j] = state.matrix[i][j];
        }
        state.matrix = straighten(grown);
        state.dimensions = size;
        if (pointers.size) reanchor();
    };

    on("pointerdown", (event) => {
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        surface.setPointerCapture(event.pointerId);
        surface.classList.add("is-turning");
        reanchor();
        start();
        event.preventDefault();
    });

    on("pointermove", (event) => {
        if (!pointers.has(event.pointerId) || !anchor) return;
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        wanted = pointAt(grip());
        /* Where motion is unwelcome the drag is answered at once instead. */
        if (still) {
            state.matrix = applyTurn(held.map((row) => row.slice()), arcBetween(anchor, wanted));
            straighten(state.matrix);
            options.onTurn();
        }
    });

    const release = (event) => {
        if (!pointers.has(event.pointerId)) return;
        pointers.delete(event.pointerId);
        if (surface.hasPointerCapture(event.pointerId)) surface.releasePointerCapture(event.pointerId);
        if (pointers.size) { reanchor(); return; }
        surface.classList.remove("is-turning");
    };
    on("pointerup", release);
    on("pointercancel", release);

    on("keydown", (event) => {
        const step = {
            ArrowLeft: [0, 2, -0.19], ArrowRight: [0, 2, 0.19],
            ArrowUp: [1, 2, -0.19], ArrowDown: [1, 2, 0.19],
            PageUp: [2, 3, -0.19], PageDown: [2, 3, 0.19]
        }[event.key];
        if (!step) return;
        rotatePlane(state.matrix, step[0], step[1], step[2]);
        straighten(state.matrix);
        options.onTurn();
        event.preventDefault();
    });

    if (options.drift && !still) start();
    return state;
};

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

    /* THE CUBE, TURNED BY HAND -------------------------------------------

       A solid the reader can pick up. It grows from side 1 to side 5 with the
       scroll, and at any point it can be turned to see that it really is n by n
       by n — the count is not asserted, it is countable along three edges.

       Only the outer faces of what has been built are drawn: a face that backs
       onto a cube already in place can never be seen, so the figure shows the
       surface of the solid rather than every small cube's own six sides. */

    const CUBE_SIDES = 5;

    const cubePainter = {
        read: () => ({ sides: CUBE_SIDES }),

        stages: (model) => model.sides - 1,

        heading: (model) => `Cubes up to ${model.sides}${supText(3)}`,

        /* A rebuilt board takes its old drawing's animation with it. */
        release: (parts) => parts.turning.stop(),

        build(board, model) {
            board.replaceChildren();
            const n = model.sides;
            const stage = el("div", "solid__stage cube-stage");
            stage.dataset.turn = "";
            stage.tabIndex = 0;
            stage.setAttribute("role", "img");
            stage.setAttribute("aria-label",
                `A cube built from unit cubes, growing from a single one to ${n} by ${n} by ${n}`);
            stage.setAttribute("aria-describedby", "cube-hint");
            const svg = svgEl("svg", { viewBox: "0 0 260 260", "aria-hidden": "true" });
            stage.append(svg);
            const tally = el("p", "powers-board__tally");
            const answer = el("p", "powers-board__answer");
            const figure = el("div", "cube-figure");
            figure.append(stage, tally, answer);
            board.append(figure);

            /* Bottom layer first, so the solid stacks upwards as it grows. */
            const order = [];
            for (let y = 0; y < n; y += 1) {
                for (let z = 0; z < n; z += 1) {
                    for (let x = 0; x < n; x += 1) order.push([x, y, z]);
                }
            }
            const step = 2 / n;
            const at = new Map(order.map((cell, index) => [cell.join(","), index]));
            /* The side at which each small cube first belongs to the solid. */
            const ringOf = order.map(([x, y, z]) => Math.max(x, y, z));
            const faces = [];
            order.forEach(([x, y, z], cube) => {
                const low = [-1 + x * step, -1 + y * step, -1 + z * step];
                for (let axis = 0; axis < 3; axis += 1) {
                    const u = (axis + 1) % 3;
                    const v = (axis + 2) % 3;
                    for (const side of [0, 1]) {
                        const corners = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([du, dv]) => {
                            const point = [0, 0, 0];
                            point[axis] = low[axis] + side * step;
                            point[u] = low[u] + du * step;
                            point[v] = low[v] + dv * step;
                            return point;
                        });
                        const normal = [0, 0, 0];
                        normal[axis] = side ? 1 : -1;
                        const beside = [x, y, z];
                        beside[axis] += normal[axis];
                        const outside = beside[axis] < 0 || beside[axis] >= n;
                        const neighbour = outside ? -1 : at.get(beside.join(","));
                        faces.push({
                            cube,
                            ring: ringOf[cube],
                            neighbour: neighbour === undefined ? -1 : neighbour,
                            neighbourRing: neighbour === undefined || neighbour < 0 ? Infinity : ringOf[neighbour],
                            corners: side ? corners : corners.slice().reverse(),
                            normal
                        });
                    }
                }
            });

            const nodes = faces.map(() => {
                const polygon = svgEl("polygon", {
                    stroke: "#5d91b0", "stroke-width": 1.2, "stroke-linejoin": "round"
                });
                svg.append(polygon);
                return polygon;
            });

            const light = [-0.35, 0.62, 0.7];
            const centre = 130;
            const radius = 58;
            const depth = 5.2;
            let built = 0;

            const render = () => {
                const matrix = turning.matrix;
                const drawn = [];
                faces.forEach((face, index) => {
                    const reveal = clamp(built - face.ring, 0, 1);
                    if (reveal <= 0.01) return;
                    /* Once the cube on the other side is there too, this face is
                       inside the solid and cannot be seen. */
                    if (built - face.neighbourRing >= 1) return;
                    const normal = applyRotation(matrix, face.normal);
                    if (normal[2] <= 0.02) return;
                    const points = face.corners.map((corner) => applyRotation(matrix, corner));
                    drawn.push({
                        index,
                        points,
                        reveal,
                        meanZ: (points[0][2] + points[1][2] + points[2][2] + points[3][2]) / 4,
                        shade: clamp(normal[0] * light[0] + normal[1] * light[1] + normal[2] * light[2], 0, 1),
                        ring: face.ring
                    });
                });
                drawn.sort((a, b) => a.meanZ - b.meanZ);
                nodes.forEach((node) => { node.style.display = "none"; });
                drawn.forEach(({ index, points, shade, reveal, ring }) => {
                    const node = nodes[index];
                    node.style.display = "";
                    node.setAttribute("opacity", reveal.toFixed(2));
                    node.setAttribute("points", points.map(([x, y, z]) => {
                        const scale = depth / (depth - z);
                        const grow = 0.72 + reveal * 0.28;
                        return `${(centre + x * radius * scale * grow).toFixed(2)},${(centre - y * radius * scale * grow).toFixed(2)}`;
                    }).join(" "));
                    /* Each side of the solid keeps the colour it arrived in, so
                       a reader can see how much of the cube each step added. */
                    const ink = GNOMON_INK[ring % GNOMON_INK.length];
                    node.setAttribute("fill", mixHex(shade < 0.5 ? "#173849" : ink, "#f2f8fc", 0.22 + shade * 0.72));
                });
            };

            const turning = attachTrackball(stage, {
                dimensions: 3,
                drift: true,
                rest: 0,
                onTurn: render
            });

            return {
                render,
                turning,
                tally,
                answer,
                set(count) { built = count; render(); }
            };
        },

        caption(model, index) {
            const side = index + 1;
            if (index === 0) {
                return {
                    title: "One cube",
                    copy: `A cube of side 1 is a single unit cube, so 1${supText(3)} = 1.`
                };
            }
            return {
                title: `Side ${side}`,
                copy: `${side} layers of ${side} × ${side} = ${side * side}, so ${side}${supText(3)} = ${side ** 3}.`
            };
        },

        paint(parts, model, index, within, eased) {
            parts.set(index + eased);
            const side = index + 1;
            parts.tally.textContent = `${side} × ${side} × ${side}`;
            parts.tally.style.opacity = String(ease(clamp((within - 0.1) / 0.4)));
            parts.answer.replaceChildren(powerNode("powers-board__power", side, 3), el("i", "", ` = ${side ** 3}`));
            parts.answer.style.opacity = String(ease(clamp((within - 0.35) / 0.5)));
        }
    };

    /* WHERE THE POWERS FALL ------------------------------------------------

       Every number to 256, with the powers of each base marked in turn. Two
       things come out of it that prose can only assert: how few numbers are
       powers at all, and that the powers of 4 are already powers of 2. */

    const MARK_INK = { 2: "#09539d", 3: "#b86821", 4: "#116e93", 5: "#4c7a3f" };
    const MARK_BASES = [2, 3, 4, 5];
    const GRID_TO = 256;

    const claimsUpTo = (limit) => {
        const claims = new Map();
        for (const base of MARK_BASES) {
            for (let value = base; value <= limit; value *= base) {
                claims.set(value, [...(claims.get(value) || []), base]);
            }
        }
        return claims;
    };

    const fieldPainter = {
        read: () => ({ limit: GRID_TO, claims: claimsUpTo(GRID_TO) }),

        stages: () => MARK_BASES.length + 1,

        heading: () => `The numbers to ${GRID_TO}`,

        build(board, model) {
            board.replaceChildren();
            const stage = el("div", "powers-board__stage powers-board__stage--wide");
            const across = 16;
            const cell = 30;
            const span = across * cell;
            const svg = svgEl("svg", { viewBox: `0 0 ${span} ${span}`, class: "field", "aria-hidden": "true" });
            const cells = [];
            for (let value = 1; value <= model.limit; value += 1) {
                const at = value - 1;
                const x = (at % across) * cell;
                const y = Math.floor(at / across) * cell;
                const box = svgEl("rect", {
                    x: x + 1.5, y: y + 1.5, width: cell - 3, height: cell - 3, rx: 6,
                    fill: "#eef3f7", stroke: "none"
                });
                const ring = svgEl("rect", {
                    x: x + 4, y: y + 4, width: cell - 8, height: cell - 8, rx: 4,
                    fill: "none", stroke: "#fff", "stroke-width": 1.6, opacity: 0
                });
                const label = svgEl("text", {
                    x: x + cell / 2, y: y + cell / 2 + 3.6, "text-anchor": "middle",
                    "font-size": 10.5, "font-family": "ui-monospace, Menlo, Consolas, monospace",
                    fill: "#8ba0ad"
                });
                label.textContent = String(value);
                svg.append(box, ring, label);
                cells.push({ value, box, ring, label, claims: model.claims.get(value) || [] });
            }
            stage.append(svg);
            const tally = el("p", "powers-board__tally");
            board.append(stage, tally);
            return { cells, tally };
        },

        caption(model, index) {
            if (index === 0) {
                return {
                    title: `The numbers to ${GRID_TO}`,
                    copy: "Every whole number from 1 to 256, before any of them is marked."
                };
            }
            if (index <= MARK_BASES.length) {
                const base = MARK_BASES[index - 1];
                const marked = [...model.claims].filter(([, bases]) => bases.includes(base)).map(([value]) => value);
                const fresh = [...model.claims].filter(([, bases]) => bases[0] === base).length;
                if (base === 4) {
                    return {
                        title: "Powers of 4",
                        copy: `${marked.join(", ")} — every one already marked, because multiplying by 4 is multiplying by 2 twice.`
                    };
                }
                return {
                    title: `Powers of ${base}`,
                    copy: index === 1
                        ? `${marked.join(", ")} — eight of them, and already most of what there is to find.`
                        : `${marked.join(", ")} — ${fresh} more that no earlier base had claimed.`
                };
            }
            return {
                title: `${model.claims.size} numbers in ${GRID_TO}`,
                copy: "Almost every number is a power of none of them, which is exactly why the ones that are can be learned."
            };
        },

        paint(parts, model, index, within, eased) {
            parts.cells.forEach(({ box, ring, label, claims }) => {
                /* The bases marked so far, in the order they were marked. */
                const shown = claims.filter((base) => MARK_BASES.indexOf(base) < index);
                const arriving = claims.includes(MARK_BASES[index - 1]);
                const strength = shown.length && arriving ? eased : shown.length ? 1 : 0;
                box.setAttribute("fill", shown.length
                    ? MARK_INK[shown[0]]
                    : "#eef3f7");
                box.setAttribute("opacity", String(shown.length ? lerp(0.25, 1, strength) : 1));
                label.setAttribute("fill", shown.length ? "#fff" : "#8ba0ad");
                label.setAttribute("font-weight", shown.length ? "700" : "400");
                /* A second claim rings the cell in the later base's colour. */
                const second = shown[1];
                ring.setAttribute("stroke", second ? MARK_INK[second] : "#fff");
                ring.setAttribute("opacity", String(second ? 1 : 0));
                /* At the end the unmarked numbers step back so the marks read
                   as the small set they are. */
                const dim = index > MARK_BASES.length ? ease(clamp((within - 0.2) / 0.5)) : 0;
                if (!shown.length) box.setAttribute("opacity", String(lerp(1, 0.35, dim)));
                label.setAttribute("opacity", String(shown.length ? 1 : lerp(1, 0.3, dim)));
            });
            const total = model.claims.size;
            parts.tally.textContent = index > MARK_BASES.length ? `${total} of ${GRID_TO}` : "";
            parts.tally.style.opacity = String(index > MARK_BASES.length ? ease(clamp((within - 0.3) / 0.4)) : 0);
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

    /* READING A NUMBER BACKWARDS ------------------------------------------

       Type a number and the page asks it the three questions a reader actually
       asks: is it one of the squares, is it one of the cubes, and does halving
       take it to 1. Then it says every way the number is a power, which is more
       than the three checks between them can find — 729 is 3 to the sixth, and
       no list of squares to 225 was ever going to say so.

       The strips show the neighbourhood rather than the whole list, because
       what settles the question is which two known values the number falls
       between. */

    const NUMBER_MIN = 2;
    const NUMBER_MAX = 10000;

    const SQUARES = Array.from({ length: 15 }, (unused, at) => ({ root: at + 1, value: (at + 1) ** 2 }));
    const CUBES = [1, 2, 3, 4, 5, 10].map((root) => ({ root, value: root ** 3 }));

    /* Every way the number is a whole power of a whole base, smallest base
       first, which is the same as longest index first. */
    const everyPower = (value) => {
        const found = [];
        for (let base = 2; base * base <= value; base += 1) {
            let running = base;
            let index = 1;
            while (running < value) { running *= base; index += 1; }
            if (running === value) found.push({ base, index });
        }
        return found;
    };

    const nearest = (list, value) => {
        const under = [...list].reverse().find((entry) => entry.value <= value) || null;
        const over = list.find((entry) => entry.value >= value) || null;
        return { under, over, exact: list.find((entry) => entry.value === value) || null };
    };

    const readPainter = {
        read(scene, inputs) {
            const raw = inputs ? String(inputs.number).trim() : String(scene.dataset.number || "");
            if (!/^\d{1,5}$/.test(raw)) return null;
            const value = Number(raw);
            if (value < NUMBER_MIN || value > NUMBER_MAX) return null;
            const halving = [];
            let running = value;
            while (running > 1 && running % 2 === 0) {
                halving.push({ from: running, to: running / 2 });
                running /= 2;
            }
            return {
                value,
                powers: everyPower(value),
                squares: nearest(SQUARES, value),
                cubes: nearest(CUBES, value),
                halving,
                halved: running === 1
            };
        },

        stages: () => 4,

        heading: (model) => readable(model.value),

        build(board, model) {
            board.replaceChildren();
            const paper = el("div", "reading");
            const strip = (name) => {
                const holder = el("div", `reading__strip reading__strip--${name}`);
                holder.append(el("p", "reading__label"), el("div", "reading__marks"));
                return holder;
            };
            const squares = strip("squares");
            const cubes = strip("cubes");
            const halving = el("div", "reading__halving");
            const verdict = el("p", "reading__verdict");
            paper.append(squares, cubes, halving, verdict);
            board.append(paper);
            return { paper, squares, cubes, halving, verdict, model };
        },

        caption(model, index) {
            const { value } = model;
            if (index === 0) {
                return {
                    title: readable(value),
                    copy: "Three questions settle it: is it a square, is it a cube, and does halving take it to 1?"
                };
            }
            if (index === 1) {
                const { exact, under, over } = model.squares;
                if (exact) return { title: "It is a square", copy: `${readable(value)} is ${exact.root}${supText(2)}.` };
                if (under && over) {
                    return {
                        title: "Not a square on the list",
                        copy: `${readable(value)} falls between ${under.root}${supText(2)} = ${readable(under.value)} and ${over.root}${supText(2)} = ${readable(over.value)}.`
                    };
                }
                return {
                    title: "Past the squares worth knowing",
                    copy: `The list stops at 15${supText(2)} = 225, and ${readable(value)} is beyond it.`
                };
            }
            if (index === 2) {
                const { exact, under, over } = model.cubes;
                if (exact) return { title: "It is a cube", copy: `${readable(value)} is ${exact.root}${supText(3)}.` };
                if (under && over) {
                    return {
                        title: "Not a cube on the list",
                        copy: `${readable(value)} falls between ${under.root}${supText(3)} = ${readable(under.value)} and ${over.root}${supText(3)} = ${readable(over.value)}.`
                    };
                }
                return {
                    title: "Past the cubes worth knowing",
                    copy: `The list stops at 10${supText(3)} = 1,000, and ${readable(value)} is beyond it.`
                };
            }
            if (index === 3) {
                if (model.halved) {
                    return {
                        title: `Halving reaches 1`,
                        copy: `${model.halving.length} halvings take ${readable(value)} to 1, so it is 2${supText(model.halving.length)}.`
                    };
                }
                const stuck = model.halving.length ? model.halving[model.halving.length - 1].to : value;
                return {
                    title: "Halving stops short",
                    copy: model.halving.length
                        ? `Halving reaches ${readable(stuck)}, which is odd, so ${readable(value)} is not a power of 2.`
                        : `${readable(value)} is odd, so it is not a power of 2 at all.`
                };
            }
            if (!model.powers.length) {
                return {
                    title: `${readable(model.value)} is not a power`,
                    copy: "No whole number multiplied by itself any number of times reaches it."
                };
            }
            const written = model.powers.map((one) => `${one.base}${supText(one.index)}`).join(" = ");
            return {
                title: `${readable(model.value)} = ${written}`,
                copy: model.powers.length === 1
                    ? "One base reaches it, and one index."
                    : `${model.powers.length} bases reach it, because a power of a power is a power of the original base.`
            };
        },

        paint(parts, model, index, within, eased) {
            const drawStrip = (holder, list, near, root, shown) => {
                const label = holder.querySelector(".reading__label");
                const marks = holder.querySelector(".reading__marks");
                holder.style.opacity = String(shown);
                label.textContent = root === 2 ? "The squares" : "The cubes";
                /* Only the neighbourhood: the two entries the number sits
                   between, and the one it lands on. */
                const around = list.filter((entry) => {
                    if (near.exact) return Math.abs(entry.root - near.exact.root) <= 2;
                    const low = near.under ? near.under.root : list[0].root;
                    const high = near.over ? near.over.root : list[list.length - 1].root;
                    return entry.root >= low - 1 && entry.root <= high + 1;
                });
                if (marks.childElementCount !== around.length) {
                    marks.replaceChildren(...around.map(() => {
                        const cell = el("span", "reading__mark");
                        cell.append(el("b", ""), el("i", ""));
                        return cell;
                    }));
                }
                Array.from(marks.children).forEach((cell, at) => {
                    const entry = around[at];
                    cell.querySelector("b").replaceChildren(powerNode("reading__power", entry.root, root));
                    cell.querySelector("i").textContent = readable(entry.value);
                    cell.classList.toggle("is-hit", Boolean(near.exact) && entry.root === near.exact.root);
                    cell.classList.toggle("is-under", !near.exact && Boolean(near.under) && entry.root === near.under.root);
                    cell.classList.toggle("is-over", !near.exact && Boolean(near.over) && entry.root === near.over.root);
                });
            };

            drawStrip(parts.squares, SQUARES, model.squares, 2, index >= 1 ? (index === 1 ? eased : 1) : 0);
            drawStrip(parts.cubes, CUBES, model.cubes, 3, index >= 2 ? (index === 2 ? eased : 1) : 0);

            /* The halving, as far as it goes. */
            const rows = Math.min(model.halving.length, 8);
            if (parts.halving.childElementCount !== rows + (model.halving.length ? 0 : 1)) {
                parts.halving.replaceChildren();
                if (!model.halving.length) parts.halving.append(el("p", "reading__odd", "odd"));
                else model.halving.slice(0, rows).forEach((link) => {
                    const row = el("p", "reading__halve");
                    row.append(el("i", "", "÷ 2"), " ", el("b", "", readable(link.to)));
                    parts.halving.append(row);
                });
            }
            parts.halving.style.opacity = String(index >= 3 ? (index === 3 ? eased : 1) : 0);
            Array.from(parts.halving.children).forEach((row, at) => {
                row.style.opacity = String(index > 3 ? 1 : ease(clamp((eased - at / Math.max(1, rows) * 0.7) / 0.3)));
            });

            const done = index >= 4;
            parts.verdict.replaceChildren();
            if (done) {
                if (!model.powers.length) parts.verdict.textContent = `${readable(model.value)} is not a power`;
                else {
                    parts.verdict.append(el("i", "", `${readable(model.value)} = `));
                    model.powers.forEach((one, at) => {
                        if (at) parts.verdict.append(el("i", "", " = "));
                        parts.verdict.append(powerNode("reading__power", one.base, one.index));
                    });
                }
            }
            parts.verdict.classList.toggle("is-negative", done && !model.powers.length);
            parts.verdict.style.opacity = String(done ? ease(clamp((within - 0.2) / 0.5)) : 0);
        }
    };

    const PAINTERS = { square: squarePainter, cube: cubePainter, field: fieldPainter, regroup: regroupPainter, read: readPainter };

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
        const field = scene.querySelector("[data-number-input]");
        const notice = scene.querySelector("[data-invalid]");
        const live = picks.length > 0 || Boolean(field);
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

            const inputs = live ? { number: field ? field.value : chosen("powers-number") } : null;
            /* A number outside what the page can answer for leaves the card
               standing at its own size with a quiet note in it, rather than
               keeping the working from the last number that did fit. */
            if (live && notice) {
                const ok = Boolean(painter.read(scene, inputs));
                sticky.classList.toggle("is-invalid", !ok);
                if (field) field.setAttribute("aria-invalid", ok ? "false" : "true");
                if (!ok) return;
            }
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
        /* Live on every keystroke that leaves a number the page can answer for;
           nothing to press, and the caret is never moved. */
        if (field) field.addEventListener("input", accept);

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
