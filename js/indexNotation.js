/* Scroll-led index notation. The page stays a normal document: each scene
   supplies its own scroll distance, JavaScript pins the card inside it, and the
   scroll position drives the drawing continuously. Nothing is toggled on — the
   power is written, its factors are unpacked one at a time, and the running
   product absorbs them in step with the scroll, exactly as far as the reader
   has scrolled. No wheel or touch input is intercepted.

   Four scenes share one engine, and each names the picture it wants in
   data-scene. "power" unpacks a power into its factors and multiplies them out;
   it is a worked example when it carries data-base and data-index, and a
   sandbox when it carries two fields instead, capped at a base of 12 and an
   index of 6 so that every step stays a multiplication a reader could do on
   paper. "square" fills a square of tiles row by row. "gather" reads the
   notation backwards, collecting equal factors into powers. */
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

/* THE LATTICE

   Every point of b to the power of d, drawn as a picture rather than as a
   million shapes for the page to hold. The work goes to a worker where one can
   be made, so a shape of three million points can be turned without the page
   itself ever pausing; the same routine runs here when it cannot. */

let latticeWorker;
const latticeWork = new Map();
let latticeJob = 0;

const workerFor = () => {
    if (latticeWorker !== undefined) return latticeWorker;
    try {
        latticeWorker = new Worker("/demystifyingmaths/js/lattice-worker.js");
        latticeWorker.addEventListener("message", (event) => {
            const answer = event.data;
            if (!answer || answer.type !== "drawn") return;
            const waiting = latticeWork.get(answer.id);
            latticeWork.delete(answer.id);
            if (waiting) waiting(answer);
        });
    } catch (unavailable) {
        latticeWorker = null;
    }
    return latticeWorker;
};

const createLattice = (canvas, base, dimensions) => {
    const context = canvas.getContext("2d");
    let inFlight = false;
    let queued = null;
    let stopped = false;
    let awaiting = 0;
    /* The picture just shown is handed back to be drawn over. */
    let spare = null;

    const show = (answer) => {
        if (stopped || !context || !answer.pixels || !answer.pixels.length) return;
        if (canvas.width === answer.width && canvas.height === answer.height) {
            context.putImageData(new ImageData(answer.pixels, answer.width, answer.height), 0, 0);
        }
        spare = answer.pixels;
    };

    const send = (request) => {
        const worker = workerFor();
        if (!worker) {
            /* No worker to be had, so the picture is made here instead. */
            const maker = self.latticePicture;
            if (!maker || !context) return;
            show(Object.assign({ width: request.width, height: request.height }, maker(request)));
            return;
        }
        inFlight = true;
        awaiting = request.id;
        if (spare && spare.length === request.width * request.height * 4) {
            request.canvas = spare;
            spare = null;
        }
        latticeWork.set(request.id, (answer) => {
            inFlight = false;
            show(answer);
            if (queued) { const next = queued; queued = null; send(next); }
        });
        worker.postMessage(request, request.canvas ? [request.canvas.buffer] : []);
    };

    const draw = (matrix, extents, fade) => {
        if (stopped || !context) return;
        const width = canvas.width;
        const height = canvas.height;
        if (!width || !height) return;
        /* The canvas is never cleared ahead of a picture. Writing the new pixels
           replaces the old ones outright, and clearing first would leave the
           figure blank for as long as the drawing took — which on the largest
           shapes is most of the time, and reads as a flash. */
        const flat = new Float64Array(dimensions * dimensions);
        for (let row = 0; row < dimensions; row += 1) {
            for (let column = 0; column < dimensions; column += 1) {
                flat[row * dimensions + column] = matrix[row] ? matrix[row][column] || 0 : 0;
            }
        }
        latticeJob += 1;
        const request = {
            type: "draw",
            id: latticeJob,
            base,
            dimensions,
            matrix: flat,
            extents: Array.from({ length: dimensions }, (value, axis) =>
                (extents && extents[axis] !== undefined ? extents[axis] : 1)),
            width,
            height,
            depth: 4,
            /* Drawn as large as the picture will hold it. */
            /* The figure holds one size however it is turned, so the picture
               needs no room set aside for it swelling. */
            room: Math.min(width, height) * 0.475,
            dotRadius: draw.weight > 20000 ? 0.9 : draw.weight > 4000 ? 1.2 : draw.weight > 1200 ? 1.6 : 2.6,
            fade: fade === undefined ? 1 : Math.min(1, Math.max(0, fade))
        };
        /* One picture at a time: a request made while another is being drawn
           replaces whatever was waiting, so the newest is never behind. */
        if (inFlight) queued = request;
        else send(request);
    };

    /* Asking for a picture while one is being made only piles up work, so the
       turn is left to ask again on the next frame. */
    draw.busy = () => inFlight;
    draw.weight = Math.pow(base, dimensions);
    draw.stop = () => {
        stopped = true;
        queued = null;
        /* A drawing that has been replaced leaves nothing waiting behind it. */
        latticeWork.delete(awaiting);
    };
    return draw;
};

document.addEventListener("DOMContentLoaded", () => {
    const scenes = document.querySelectorAll("[data-power-scene]");
    if (!scenes.length) return;

    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const ease = (value) => {
        const x = clamp(value);
        return x * x * (3 - 2 * x);
    };
    const lerp = (from, to, amount) => from + (to - from) * amount;

    const BASE_MIN = 2;
    const BASE_MAX = 6;
    const INDEX_MIN = 1;
    const INDEX_MAX = 6;

    const readable = (value) => Number(value).toLocaleString("en-GB");

    const ordinals = ["", "first", "second", "third", "fourth", "fifth", "sixth"];

    const spokenIndex = (index) => {
        if (index === 2) return "squared";
        if (index === 3) return "cubed";
        return `to the power of ${index}`;
    };

    const spokenPower = (base, index) => `${base} ${spokenIndex(index)}`;

    /* Powers are written with a real raised digit in captions and headings, so
       a caption reads the way the page around it is written. */
    const supText = (index) => String(index)
        .replace(/1/g, "¹").replace(/2/g, "²").replace(/3/g, "³")
        .replace(/4/g, "⁴").replace(/5/g, "⁵").replace(/6/g, "⁶");

    const parseInRange = (value, min, max) => {
        if (!/^\d+$/.test(value)) return null;
        const number = Number(value);
        return number >= min && number <= max ? number : null;
    };

    /* ------------------------------------------------------------ painters

       Every scene shares the pinning engine below. A painter says how many
       stages its idea takes, what to draw, and what the caption reads at each
       stage. Adding a picture means adding a painter, never another engine. */

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    /* A superscript, with the caret that keeps it unambiguous once the markup
       is gone. Never seen, never spoken: see .caret in the stylesheet. */
    const supWith = (text) => {
        const mark = el("span", "caret", "^");
        mark.setAttribute("aria-hidden", "true");
        return [mark, el("sup", "", text)];
    };

    /* A gold frame measured from the finished layout, so it can be interpolated
       between real positions rather than guessed. */
    const boxAround = (container, first, last, pad = 8) => {
        if (!first || !last) return null;
        const box = container.getBoundingClientRect();
        const a = first.getBoundingClientRect();
        const b = last.getBoundingClientRect();
        return {
            left: a.left - box.left - pad,
            top: a.top - box.top - pad,
            width: b.right - a.left + pad * 2,
            height: a.height + pad * 2
        };
    };

    const applyBox = (node, from, to, mix, opacity) => {
        if (!from || !to) return;
        node.style.opacity = String(opacity);
        node.style.left = `${lerp(from.left, to.left, mix)}px`;
        node.style.top = `${lerp(from.top, to.top, mix)}px`;
        node.style.width = `${lerp(from.width, to.width, mix)}px`;
        node.style.height = `${lerp(from.height, to.height, mix)}px`;
    };

    /* UNPACKING A POWER ------------------------------------------------- */

    const powerPainter = {
        read(scene, inputs) {
            const base = inputs
                ? parseInRange(inputs.base, BASE_MIN, BASE_MAX)
                : parseInRange(scene.dataset.base || "", BASE_MIN, BASE_MAX);
            const index = inputs
                ? parseInRange(inputs.index, INDEX_MIN, INDEX_MAX)
                : parseInRange(scene.dataset.index || "", INDEX_MIN, INDEX_MAX);
            if (base === null || index === null) return null;
            const products = [];
            let running = base;
            for (let step = 1; step < index; step += 1) {
                const before = running;
                running *= base;
                products.push({ before, after: running, absorbed: step + 1 });
            }
            return { base, index, products, value: running };
        },

        stages: (model) => model.products.length + 2,

        /* The drawing beside the calculation turns under its own steam, so a
           board that is being replaced has to take its loop with it. */
        release: (parts) => { if (parts.solid) parts.solid.stop(); },

        heading: (model) => `${model.base}${supText(model.index)}, read as ${spokenPower(model.base, model.index)}`,

        build(board, model) {
            board.replaceChildren();
            /* The base and the index each sit in their own stack with the word
               that names it, so a label cannot drift from what it labels. */
            const power = el("div", "power-board__power");
            const baseStack = el("span", "power-board__stack power-board__stack--base");
            baseStack.append(el("b", "", String(model.base)), el("i", "", "base"));
            const indexStack = el("span", "power-board__stack power-board__stack--index");
            indexStack.append(el("i", "", "index"), ...supWith(String(model.index)));
            power.append(baseStack, indexStack);

            const expansion = el("div", "power-board__expansion");
            /* Six factors have to fit the same half of the card as two, so the
               chips are sized to the number of them. Without this the gold frame
               that gathers them runs up against the edge of the card. */
            const roomy = model.index <= 4;
            expansion.style.setProperty("--factor-size", roomy ? "40px" : model.index === 5 ? "34px" : "28px");
            expansion.style.setProperty("--factor-gap", roomy ? "9px" : model.index === 5 ? "7px" : "5px");
            expansion.style.setProperty("--factor-type", roomy ? "1.5rem" : model.index === 5 ? "1.3rem" : "1.12rem");
            const chips = [];
            const signs = [];
            for (let position = 0; position < model.index; position += 1) {
                if (position) {
                    const sign = el("i", "power-board__times", "×");
                    expansion.append(sign);
                    signs.push(sign);
                }
                const chip = el("span", "power-board__factor", String(model.base));
                expansion.append(chip);
                chips.push(chip);
            }
            const frame = el("i", "power-board__frame");
            frame.setAttribute("aria-hidden", "true");
            expansion.append(frame);

            const ladder = el("div", "power-board__ladder");
            const rows = model.products.map((product) => {
                const row = el("div", "power-board__row");
                row.append(
                    el("span", "", readable(product.before)), el("i", "", "×"),
                    el("span", "", readable(model.base)), el("i", "", "="),
                    el("b", "", readable(product.after))
                );
                ladder.append(row);
                return row;
            });

            const answer = el("p", "power-board__answer", `${model.base}${supText(model.index)} = ${readable(model.value)}`);
            board.append(power, expansion, ladder, answer);

            /* The polytope beside the calculation gains a direction as each
               factor is taken in, so the shape and the running product are the
               same count arrived at two ways. */
            /* Not built at all where the reader has asked to keep to the
               curriculum: hiding it would leave a worker drawing pictures
               nobody can see, and a loop turning them. */
            const beyondThree = !document.documentElement.classList.contains("is-curriculum-only");
            const pane = beyondThree && board.parentElement
                ? board.parentElement.querySelector("[data-lattice]")
                : null;
            let solid = null;
            if (pane) {
                const canvas = pane.querySelector("canvas");
                const surface = pane.querySelector("[data-turn]");
                /* The picture is made at the screen's own resolution, capped so
                   a shape is never asked for more pixels than it can fill in a
                   frame. A crowded figure is a solid mass of overlapping lines
                   many times over: made at fewer pixels and scaled back up it
                   looks the same, and it arrives in time to be turned. */
                const points = Math.pow(model.base, model.index);
                const most = points > 20000 ? 480 : 560;
                const fit = () => {
                    const box = surface.getBoundingClientRect();
                    const density = Math.min(2, window.devicePixelRatio || 1);
                    const side = Math.min(most, Math.round(Math.min(box.width, box.height) * density)) || 320;
                    if (canvas.width !== side || canvas.height !== side) {
                        canvas.width = side;
                        canvas.height = side;
                        return true;
                    }
                    return false;
                };
                fit();
                const draw = createLattice(canvas, model.base, model.index);
                const turning = attachTrackball(surface, {
                    dimensions: Math.max(3, model.index),
                    drift: true,
                    rest: 0,
                    onTurn: () => paint()
                });
                let extents = [];
                let fade = 0;
                const paint = (force) => {
                    if (!draw) return;
                    if (!force && draw.busy()) return;
                    fit();
                    draw(turning.matrix, extents, fade);
                };

                /* Only the directions the figure has been drawn out into are
                   turned, so a shape standing at three directions is turned as
                   an ordinary solid. */
                const liveCount = () => {
                    let count = 0;
                    for (let axis = 0; axis < model.index; axis += 1) {
                        if ((extents[axis] === undefined ? 1 : extents[axis]) > 0.02) count = axis + 1;
                    }
                    return count;
                };

                solid = {
                    show(next, opacity) {
                        extents = next;
                        fade = opacity;
                        turning.setLive(liveCount());
                        /* The scroll is the reader's own hand, so its frames are
                           never the ones dropped. */
                        paint(true);
                    },
                    stop() { turning.stop(); draw.stop(); }
                };
            }
            return { power, expansion, chips, signs, frame, rows, answer, solid };
        },

        caption(model, index, total) {
            const written = `${model.base}${supText(model.index)}`;
            if (index === 0) {
                return {
                    title: "The power to work out",
                    copy: `Base ${model.base}, index ${model.index}.`
                };
            }
            if (index === 1) {
                return {
                    title: "Written out in full",
                    copy: model.index === 1
                        ? `A single factor, so ${written} = ${model.base}.`
                        : `${model.index} equal factors of ${model.base}.`
                };
            }
            if (index < total) {
                const product = model.products[index - 2];
                return {
                    title: `Multiply by ${model.base}`,
                    copy: `${readable(product.before)} × ${model.base} = ${readable(product.after)}, using ${product.absorbed} of the ${model.index} factors.`
                };
            }
            return {
                title: "The value",
                copy: `Nothing is left to multiply: ${readable(model.value)}.`
            };
        },

        paint(parts, model, index, within, eased, total) {
            const powerIn = index >= 1 ? 1 : eased;
            parts.power.style.opacity = String(powerIn);
            parts.power.style.transform = `translateY(${lerp(14, 0, powerIn)}px)`;

            const expansionProgress = index < 1 ? 0 : index > 1 ? 1 : eased;
            parts.chips.forEach((chip, chipIndex) => {
                const share = model.index > 1 ? chipIndex / model.index : 0;
                const local = ease(clamp((expansionProgress - share * 0.55) / 0.45));
                chip.style.opacity = String(local);
                chip.style.transform = `translateY(${lerp(-12, 0, local)}px) scale(${lerp(0.85, 1, local)})`;
                if (chipIndex) parts.signs[chipIndex - 1].style.opacity = String(local);
            });

            /* One continuous frame gathers the factors the running product has
               absorbed, easing outwards late in each transition. */
            const covered = (at) => Math.min(model.index, Math.max(2, at));
            if (index >= 2 && parts.rows.length) {
                const from = boxAround(parts.expansion, parts.chips[0], parts.chips[covered(index - 1) - 1]);
                const to = boxAround(parts.expansion, parts.chips[0], parts.chips[covered(index) - 1]);
                const mix = index === 2 ? 1 : ease(clamp((within - 0.45) / 0.55));
                applyBox(parts.frame, from, to, mix, index === 2 ? ease(clamp(within / 0.6)) : 1);
            } else {
                parts.frame.style.opacity = "0";
            }

            parts.rows.forEach((row, rowIndex) => {
                const appears = rowIndex + 2;
                const local = index > appears ? 1 : index < appears ? 0 : ease(clamp((within - 0.3) / 0.7));
                row.style.opacity = String(local);
                /* Each product descends out of the factors above it. */
                row.style.transform = `translateY(${lerp(-16, 0, local)}px)`;
            });

            const answerIn = index >= total ? ease(clamp(within / 0.45)) : 0;
            parts.answer.style.opacity = String(answerIn);
            parts.answer.style.transform = `translateY(${lerp(10, 0, answerIn)}px)`;

            /* Blank until the factors are written, then drawn out along one
               more direction for each factor the running product takes in: the
               copies pull apart rather than the figure being rebuilt. */
            if (parts.solid) {
                const at = index + within;
                const extents = [];
                for (let axis = 0; axis < model.index; axis += 1) {
                    extents.push(ease(clamp(at - (axis + 1), 0, 1)));
                }
                parts.solid.show(extents, ease(clamp(at - 0.6, 0, 1)));
            }
        }
    };

    /* THE SQUARE AS AN AREA ----------------------------------------------- */

    /* The counterpart of the area figure on the multiplying-decimals page. A
       square of side n is ruled into unit squares and they are counted, so the
       value of n² is arrived at rather than accepted. */
    const squarePainter = {
        read: (scene) => {
            const side = parseInt(scene.dataset.side || "", 10);
            return side >= 2 && side <= 8 ? { side, value: side * side } : null;
        },

        stages: () => 4,

        heading: (model) => `A ${model.side} by ${model.side} square`,

        build(board, model) {
            board.replaceChildren();
            const figure = el("div", "area-figure");
            const frame = el("div", "area-frame");
            const across = el("span", "area-bracket area-bracket--top", String(model.side));
            const down = el("span", "area-bracket area-bracket--side", String(model.side));
            const square = el("div", "area-square");
            const share = 100 / model.side;
            const columnRules = [];
            const rowRules = [];
            for (let index = 1; index < model.side; index += 1) {
                const column = el("i", "area-rule area-rule--column");
                column.style.left = `${index * share}%`;
                const row = el("i", "area-rule area-rule--row");
                row.style.top = `${index * share}%`;
                square.append(column, row);
                columnRules.push(column);
                rowRules.push(row);
            }

            const unit = el("span", "area-unit", "1");
            unit.style.width = `${share}%`;
            unit.style.height = `${share}%`;
            square.append(unit);

            /* Drawn as separate squares rather than one block, because the
               point of the scene is that they can be counted one at a time. */
            const cells = [];
            for (let row = 0; row < model.side; row += 1) {
                for (let column = 0; column < model.side; column += 1) {
                    const cell = el("i", "area-cell");
                    cell.style.left = `${column * share}%`;
                    cell.style.top = `${row * share}%`;
                    cell.style.width = `${share}%`;
                    cell.style.height = `${share}%`;
                    square.append(cell);
                    cells.push(cell);
                }
            }

            const tally = el("p", "area-tally");
            frame.append(across, down, square);
            figure.append(frame, tally);
            board.append(figure);
            return { square, across, down, columnRules, rowRules, unit, cells, tally };
        },

        caption(model, index) {
            const { side, value } = model;
            return [
                {
                    title: "The square",
                    copy: "Every edge is the same length, which is what makes it a square rather than any other rectangle."
                },
                {
                    title: `${side} across`,
                    copy: `The width is ruled into ${side} equal parts, each of them 1 wide.`
                },
                {
                    title: `${side} down as well`,
                    copy: "Ruling the height the same way leaves a grid of unit squares, each 1 by 1."
                },
                {
                    title: "Count them",
                    copy: `Counting every unit square in the grid gives ${readable(value)}.`
                },
                {
                    title: "The area",
                    copy: `Multiplying the two sides gives the same ${readable(value)} in one step.`
                }
            ][clamp(index, 0, 4)];
        },

        paint(parts, model, index, within) {
            const at = index + within;
            const arrival = ease(clamp(at / 0.6, 0, 1));
            parts.square.style.opacity = String(arrival);
            parts.across.style.opacity = String(ease(clamp((at - 0.9) / 0.5, 0, 1)));
            parts.down.style.opacity = String(ease(clamp((at - 1.9) / 0.5, 0, 1)));

            parts.columnRules.forEach((rule, position) => {
                rule.style.opacity = String(ease(clamp((at - 1 - position * 0.06) / 0.4, 0, 1)));
            });
            parts.rowRules.forEach((rule, position) => {
                rule.style.opacity = String(ease(clamp((at - 2 - position * 0.06) / 0.4, 0, 1)));
            });
            /* One unit square is named while the grid is being ruled, then
               steps aside once the counting starts. */
            parts.unit.style.opacity = String(
                ease(clamp((at - 2.4) / 0.4, 0, 1)) * (1 - ease(clamp((at - 3) / 0.4, 0, 1))));

            let counted = 0;
            parts.cells.forEach((cell, position) => {
                const reveal = ease(clamp((at - 3 - position * (0.85 / model.value)) / 0.25, 0, 1));
                cell.style.opacity = String(reveal);
                if (reveal > 0.5) counted += 1;
            });

            const text = at < 3
                ? ""
                : at < 4
                    ? `${readable(counted)} ${counted === 1 ? "square" : "squares"}`
                    : `${model.side} × ${model.side} = ${readable(model.value)}`;
            if (parts.tally.textContent !== text) parts.tally.textContent = text;
            parts.tally.style.opacity = String(ease(clamp((at - 3) / 0.3, 0, 1)));
        }
    };

    /* STACKING A CUBE ---------------------------------------------------- */

    /* The solid is filled one small cube at a time as the reader scrolls, and
       turned by hand at any point in the filling. Every small cube keeps its own
       three visible faces, so the divisions read in all three directions. */
    const cubePainter = {
        read: (scene) => {
            const side = parseInt(scene.dataset.side || "", 10);
            return side >= 2 && side <= 5 ? { side, layer: side * side, value: side * side * side } : null;
        },

        /* The square's beats, one direction on: the shape, ruled across, ruled
           down, ruled through as well, counted, the product, and where the word
           comes from. */
        stages: () => 5,
        /* No stretch: a beat here runs exactly as long as a beat on the square
           card, so the two feel the same and this one is simply longer. */
        pace: () => 1,
        /* Except for the counting, which is one step and holds the reader for
           three: there is a cube's worth of small cubes to go in rather than a
           square's, and they are worth watching. */
        beats: () => [1, 1, 1, 1, 4, 1],

        heading: (model) => `A ${model.side} by ${model.side} by ${model.side} cube`,

        /* A rebuilt board takes its old drawing's animation with it. */
        release: (parts) => parts.turning.stop(),

        build(board, model) {
            board.replaceChildren();
            const stage = document.createElement("div");
            stage.className = "solid__stage cube-stage";
            stage.dataset.turn = "";
            stage.tabIndex = 0;
            stage.setAttribute("role", "img");
            stage.setAttribute("aria-label",
                `A cube ruled into ${model.side} by ${model.side} by ${model.side} unit cubes and filled with them`);
            const svg = document.createElementNS(SVG, "svg");
            svg.setAttribute("viewBox", "0 0 260 260");
            svg.setAttribute("aria-hidden", "true");
            stage.append(svg);
            /* The same running tally the square keeps under its grid. */
            const tally = el("p", "area-tally");
            const figure = el("div", "cube-figure");
            figure.append(stage, tally);
            board.append(figure);

            /* Ordered bottom layer first, so the solid stacks upwards. */
            const order = [];
            for (let y = 0; y < model.side; y += 1) {
                for (let z = 0; z < model.side; z += 1) {
                    for (let x = 0; x < model.side; x += 1) order.push([x, y, z]);
                }
            }
            const step = 2 / model.side;
            const at = new Map(order.map((cell, index) => [cell.join(","), index]));
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
                        /* The cell this face backs onto. Once that one is in
                           place the face is inside the solid and is not drawn,
                           so what is on screen is the surface of what has been
                           built rather than every cube's own six sides. */
                        const beside = [x, y, z];
                        beside[axis] += normal[axis];
                        const neighbour = beside[axis] < 0 || beside[axis] >= model.side
                            ? -1
                            : at.get(beside.join(","));
                        faces.push({
                            cube,
                            neighbour: neighbour === undefined ? -1 : neighbour,
                            corners: side ? corners : corners.slice().reverse(),
                            normal
                        });
                    }
                }
            });

            /* The solid is ruled before it is filled, the way the square is:
               the box first, then the divisions in one direction, then the
               next, then the last, at which point the unit cubes are marked out
               and can be counted. A division perpendicular to a direction meets
               the surface of the box as a ring right round it, so that is what
               is drawn — one ring for each cut, rather than a thicket of edges
               nobody could read. */
            const wires = [];
            const corner = (a, b, c) => [-1 + a * 2, -1 + b * 2, -1 + c * 2];
            for (let axis = 0; axis < 3; axis += 1) {
                const u = (axis + 1) % 3;
                const v = (axis + 2) % 3;
                /* The box's own edges run along each direction, four of them. */
                for (const du of [0, 1]) {
                    for (const dv of [0, 1]) {
                        const from = [0, 0, 0];
                        const to = [0, 0, 0];
                        from[axis] = -1;
                        to[axis] = 1;
                        from[u] = to[u] = corner(du, 0, 0)[0];
                        from[v] = to[v] = corner(dv, 0, 0)[0];
                        wires.push({ group: 0, from, to });
                    }
                }
                /* And a ring at each cut across it. */
                for (let cut = 1; cut < model.side; cut += 1) {
                    const along = -1 + cut * step;
                    const ring = [[0, 0], [1, 0], [1, 1], [0, 1]];
                    for (let n = 0; n < 4; n += 1) {
                        const [au, av] = ring[n];
                        const [bu, bv] = ring[(n + 1) % 4];
                        const from = [0, 0, 0];
                        const to = [0, 0, 0];
                        from[axis] = to[axis] = along;
                        from[u] = -1 + au * 2;
                        from[v] = -1 + av * 2;
                        to[u] = -1 + bu * 2;
                        to[v] = -1 + bv * 2;
                        wires.push({ group: axis + 1, from, to });
                    }
                }
            }
            /* The box itself in the page's ink, and then a colour of its own for
               each direction's cuts. Three sets of parallel rings crossing one
               another are hard to tell apart in one colour, and telling them
               apart is the whole of what this figure has to show. */
            const WIRE_INK = ["#173849", "#09539d", "#b86821", "#116e93"];
            const wireNodes = wires.map((wire) => {
                const line = document.createElementNS(SVG, "line");
                line.setAttribute("stroke", WIRE_INK[wire.group]);
                line.setAttribute("stroke-width", wire.group ? "1.1" : "1.6");
                line.setAttribute("stroke-linecap", "round");
                svg.append(line);
                return line;
            });

            const nodes = faces.map(() => {
                const polygon = document.createElementNS(SVG, "polygon");
                polygon.setAttribute("stroke", "#5d91b0");
                polygon.setAttribute("stroke-width", "1.2");
                polygon.setAttribute("stroke-linejoin", "round");
                svg.append(polygon);
                return polygon;
            });

            const light = [-0.35, 0.62, 0.7];
            const centre = 130;
            const radius = 58;
            const depth = 5.2;
            let shown = 0;
            /* How far each family of rules has been drawn: the box, then the
               cuts in each of the three directions. */
            let ruled = [0, 0, 0, 0];

            const render = () => {
                const matrix = turning.matrix;
                const flat = (point) => {
                    const [x, y, z] = applyRotation(matrix, point);
                    const scale = depth / (depth - z);
                    return [centre + x * radius * scale, centre - y * radius * scale, z];
                };
                wires.forEach((wire, index) => {
                    const line = wireNodes[index];
                    const shows = ruled[wire.group];
                    if (shows <= 0.01) { line.style.display = "none"; return; }
                    line.style.display = "";
                    const [x1, y1, z1] = flat(wire.from);
                    const [x2, y2, z2] = flat(wire.to);
                    line.setAttribute("x1", x1.toFixed(2));
                    line.setAttribute("y1", y1.toFixed(2));
                    line.setAttribute("x2", x2.toFixed(2));
                    line.setAttribute("y2", y2.toFixed(2));
                    /* What is further away is drawn fainter, so the ruling
                       reads as a solid rather than as a flat pattern. */
                    const near = clamp(((z1 + z2) / 2 + 1.8) / 3.6);
                    line.setAttribute("opacity", (shows * (0.34 + near * 0.56)).toFixed(2));
                });

                const drawn = [];
                faces.forEach((face, index) => {
                    const reveal = clamp(shown - face.cube, 0, 1);
                    if (reveal <= 0.01) return;
                    if (face.neighbour >= 0 && shown - face.neighbour >= 1) return;
                    const normal = applyRotation(matrix, face.normal);
                    if (normal[2] <= 0.02) return;
                    const points = face.corners.map((corner) => applyRotation(matrix, corner));
                    drawn.push({
                        index,
                        points,
                        reveal,
                        meanZ: (points[0][2] + points[1][2] + points[2][2] + points[3][2]) / 4,
                        shade: clamp(normal[0] * light[0] + normal[1] * light[1] + normal[2] * light[2], 0, 1)
                    });
                });
                drawn.sort((a, b) => a.meanZ - b.meanZ);
                nodes.forEach((node) => { node.style.display = "none"; });
                drawn.forEach(({ index, points, shade, reveal }) => {
                    const node = nodes[index];
                    node.style.display = "";
                    node.setAttribute("opacity", reveal.toFixed(2));
                    node.setAttribute("points", points.map(([x, y, z]) => {
                        const scale = depth / (depth - z);
                        const grow = 0.72 + reveal * 0.28;
                        return `${(centre + x * radius * scale * grow).toFixed(2)},${(centre - y * radius * scale * grow).toFixed(2)}`;
                    }).join(" "));
                    node.setAttribute("fill", mixHex("#7fadc9", "#eaf3f8", 0.25 + shade * 0.75));
                    svg.append(node);
                });
            };

            /* The same settings the lattice beside it is turned with, so the
               two solids answer the hand identically in the three directions
               they share. Without the drift this loop only ran while the reader
               was holding the cube, so it started from a cold clock on every
               grab and the smoothing had nothing to smooth. */
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
                set(count, rules) { shown = count; ruled = rules; render(); }
            };
        },

        caption(model, index, total) {
            const { side, layer, value } = model;
            return [
                {
                    title: "The cube",
                    copy: "Every edge is the same length, which is what makes it a cube rather than any other box."
                },
                {
                    title: `${side} across`,
                    copy: `The width is ruled into ${side} equal parts, exactly as the square's was.`
                },
                {
                    title: `${side} down as well`,
                    copy: `Ruling the height the same way marks each face into a ${side} by ${side} grid.`
                },
                {
                    title: `${side} through as well`,
                    copy: "The third direction is ruled like the other two, leaving unit cubes of 1 by 1 by 1."
                },
                {
                    title: "Count them",
                    copy: `Each layer is ${side} × ${side} = ${layer} unit cubes, and counting every one of them gives ${readable(value)}.`
                },
                {
                    title: "The volume",
                    copy: `Multiplying the three edges gives the same ${readable(value)} in one step.`
                }
            ][clamp(index, 0, 5)];
        },

        paint(parts, model, index, within, eased, total, through) {
            const at = index + within;
            /* The box, then a direction's worth of cuts at each of the next
               three stages, exactly as the square's rules come in. */
            const rules = [
                ease(clamp(at / 0.6, 0, 1)),
                ease(clamp((at - 1) / 0.5, 0, 1)),
                ease(clamp((at - 2) / 0.5, 0, 1)),
                ease(clamp((at - 3) / 0.5, 0, 1))
            ];
            /* Then the unit cubes are filled in, one at a time, the way the
               square's cells are counted. It is one step weighted to take four
               beats, and they are spread evenly across all four rather than
               across the moving part alone — so they follow the reader's scroll
               the whole way down the step, with a short settle at the end on
               the finished cube. */
            const filled = index < 4 ? 0 : index > 4 ? 1 : clamp(through / 0.9);
            const shown = model.value * filled;
            parts.set(shown, rules);

            /* Switched on the stage rather than on the position, so the running
               count is not replaced by the product during the counting stage's
               own hold, where the position has already reached the next whole
               number. */
            const counted = Math.min(model.value, Math.round(shown));
            const text = index < 4
                ? ""
                : index < 5
                    ? `${readable(counted)} ${counted === 1 ? "cube" : "cubes"}`
                    : `${model.side} × ${model.side} × ${model.side} = ${readable(model.value)}`;
            if (parts.tally.textContent !== text) parts.tally.textContent = text;
            parts.tally.style.opacity = String(ease(clamp((at - 4) / 0.3, 0, 1)));
        }
    };

    /* GATHERING FACTORS INTO POWERS -------------------------------------- */

    const gatherPainter = {
        read(scene) {
            const factors = (scene.dataset.factors || "").split(",").map(Number);
            if (factors.length < 2 || factors.some((value) => !Number.isInteger(value) || value < 2)) return null;
            const groups = [];
            factors.forEach((factor) => {
                const last = groups[groups.length - 1];
                if (last && last.base === factor) last.count += 1;
                else groups.push({ base: factor, count: 1 });
            });
            if (groups.length !== 2) return null;
            return { factors, groups };
        },

        stages: () => 3,

        heading: (model) => model.factors.join(" × "),

        build(board, model) {
            board.replaceChildren();
            const wrap = el("div", "gather-board");
            const row = el("div", "gather-board__row");
            const chips = [];
            const signs = [];
            let seen = 0;
            model.groups.forEach((group, groupIndex) => {
                for (let position = 0; position < group.count; position += 1) {
                    if (seen) {
                        const sign = el("i", "gather-board__sign", "×");
                        row.append(sign);
                        signs.push(sign);
                    }
                    const chip = el("span", `gather-board__chip${groupIndex ? " is-second" : ""}`, String(group.base));
                    row.append(chip);
                    chips.push({ node: chip, group: groupIndex });
                    seen += 1;
                }
            });
            const frame = el("i", "power-board__frame");
            frame.setAttribute("aria-hidden", "true");
            row.append(frame);

            /* Each power is kept on its own, because each of them arrives with
               the group of factors it was counted from rather than the pair of
               them turning up together at the end. */
            const powers = el("div", "gather-board__powers");
            const written = [];
            const joins = [];
            model.groups.forEach((group, groupIndex) => {
                if (groupIndex) {
                    const join = el("i", "", "×");
                    powers.append(join);
                    joins.push(join);
                }
                const power = el("span", groupIndex ? "is-second" : "is-first");
                power.append(el("b", "", String(group.base)), ...supWith(String(group.count)));
                powers.append(power);
                written.push(power);
            });

            /* The conclusion is the product written in index form, not the
               number it comes to: the question was what this product is made
               of, and multiplying it back out would answer a different one. */
            const value = el("p", "gather-board__value");
            value.append(`${model.factors.join(" × ")} = `);
            model.groups.forEach((group, groupIndex) => {
                if (groupIndex) value.append(" × ");
                value.append(el("b", "", String(group.base)), ...supWith(String(group.count)));
            });

            wrap.append(row, powers, value);
            board.append(wrap);
            return { row, chips, signs, frame, written, joins, value };
        },

        caption(model, index) {
            const [first, second] = model.groups;
            if (index === 0) {
                return {
                    title: "Start from the product",
                    copy: `This product uses two different numbers: ${first.base} and ${second.base}. Sorting the equal factors into groups is the first move.`
                };
            }
            if (index === 1) {
                return {
                    title: `The ${first.base}s`,
                    copy: `There ${first.count === 1 ? "is" : "are"} ${first.count} factor${first.count === 1 ? "" : "s"} of ${first.base}, so that group becomes ${first.base} to the power of ${first.count}.`
                };
            }
            if (index === 2) {
                return {
                    title: `The ${second.base}s`,
                    copy: `There ${second.count === 1 ? "is" : "are"} ${second.count} factor${second.count === 1 ? "" : "s"} of ${second.base}, so that group becomes ${second.base} to the power of ${second.count}.`
                };
            }
            return {
                title: "The product in index form",
                copy: `${first.count} factor${first.count === 1 ? "" : "s"} of ${first.base} and ${second.count} of ${second.base}, written as ${first.base}${supText(first.count)} × ${second.base}${supText(second.count)}. The same five numbers are still being multiplied; only the way of writing them has changed.`
            };
        },

        paint(parts, model, index, within, eased) {
            const rowIn = index >= 1 ? 1 : eased;
            parts.chips.forEach(({ node }, position) => {
                const local = index >= 1 ? 1 : ease(clamp((rowIn - position / parts.chips.length * 0.5) / 0.5));
                node.style.opacity = String(local);
                node.style.transform = `translateY(${lerp(-10, 0, local)}px)`;
                if (position) parts.signs[position - 1].style.opacity = String(local);
            });

            /* The frame settles over one group of equal factors at a time. */
            const first = parts.chips.filter((chip) => chip.group === 0).map((chip) => chip.node);
            const second = parts.chips.filter((chip) => chip.group === 1).map((chip) => chip.node);
            const boxes = [
                boxAround(parts.row, first[0], first[first.length - 1]),
                boxAround(parts.row, second[0], second[second.length - 1])
            ];
            if (index === 1) applyBox(parts.frame, boxes[0], boxes[0], 1, ease(clamp(within / 0.5)));
            else if (index === 2) applyBox(parts.frame, boxes[0], boxes[1], eased, 1);
            else if (index === 3) applyBox(parts.frame, boxes[1], boxes[1], 1, 1 - eased);
            else parts.frame.style.opacity = index > 3 ? "0" : "0";

            /* A power appears as its own factors are gathered: the 2s are
               framed and 2² is written, then the 5s are framed and 5³ joins it.
               Waiting until both are counted and then writing the pair at once
               loses the very thing the frame is showing. */
            const at = index + within;
            parts.written.forEach((power, groupIndex) => {
                const local = ease(clamp((at - (groupIndex + 1) - 0.45) / 0.5));
                power.style.opacity = String(local);
                power.style.transform = `translateY(${lerp(-14, 0, local)}px)`;
                if (groupIndex) {
                    const join = parts.joins[groupIndex - 1];
                    join.style.opacity = String(local);
                }
            });

            const valueIn = index >= 3 ? ease(clamp((within - 0.35) / 0.65)) : 0;
            parts.value.style.opacity = String(valueIn);
            parts.value.style.transform = `translateY(${lerp(10, 0, valueIn)}px)`;
        }
    };

    const PAINTERS = { power: powerPainter, square: squarePainter, gather: gatherPainter, cube: cubePainter };

    const createScene = (scene) => {
        const sticky = scene.querySelector(".power-scene__sticky");
        /* The card is moved into the body while it is pinned, so a second
           initialisation would find the scene empty. Better to do nothing than
           to tear down a card the reader is already looking at. */
        if (!sticky) return null;

        const painter = PAINTERS[scene.dataset.scene || "power"];
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
                dot.className = "power-scene__dot";
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

            const inputs = live ? { base: chosen("power-base"), index: chosen("power-index") } : null;
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

    /* Reading the page without anything past three directions. The stylesheet
       takes the writing about them off the page; what is left to do here is the
       figure beside the calculation, which is not a piece of prose but a loop
       and a worker, and has to be told to stop rather than merely hidden. Then
       the cards are measured again, because losing the figure changes how tall
       they stand and where they come to rest. */
    const choice = document.querySelector("[data-curriculum-only]");
    if (choice) {
        const box = choice.closest(".beyond");
        const instead = Array.from(document.querySelectorAll("[data-curriculum]"));

        const settle = (anchored) => {
            /* Where the box sits on screen before any of this. Writing goes off
               the page, a figure is torn down, scenes are measured again and
               cards are pinned and released — between them they move the page
               under whoever just used the switch. The one thing that has to
               stay put is the box they used it in. */
            const held = anchored ? box.getBoundingClientRect().top : 0;
            const only = choice.checked;
            document.documentElement.classList.toggle("is-curriculum-only", only);
            instead.forEach((node) => { node.hidden = !only; });
            controllers.forEach((controller) => {
                controller.rebuild();
                controller.reset();
            });
            if (!anchored) return;
            const keepStill = () => {
                const moved = box.getBoundingClientRect().top - held;
                if (Math.abs(moved) > 0.5) window.scrollBy(0, moved);
            };
            /* Once against the page as it now stands, and once more after the
               cards have had their frame to settle into it. */
            keepStill();
            requestAnimationFrame(keepStill);
        };

        choice.addEventListener("change", () => settle(true));
        settle(false);
    }
});

/* Two figures the reader turns by hand.

   Both share one trackball. The pointer is mapped onto a sphere sitting over
   the drawing, and the rotation carried from where the drag began to where it
   is now is applied as a quaternion, so the figure follows the finger exactly,
   composes over repeated drags and never gimbal-locks.

   The cube is drawn as its own small cubes rather than as a wireframe, so the
   depth divisions are visible on every face that is turned towards the reader.
   The tesseract is there for the optional section: a fourth direction at right
   angles to the other three is perfectly well defined, and the one thing that
   cannot be done with it is stand among them and look. What is drawn is a
   shadow of it, the same way a drawing of a cube is a shadow of the cube. */
