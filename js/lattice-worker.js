/* Drawing a lattice of a million points, off the main thread.

   Every point is plotted — there is no sampling and no dropping of the inside
   of the shape — but the result comes back as a picture rather than as a
   million shapes for the page to hold. A pixel keeps the nearest point that
   lands on it, so what is in front covers what is behind without anything
   needing to be sorted.

   The points are never multiplied out one at a time. A lattice is the sum of
   its directions, so the whole of it is built by taking the shape so far and
   laying it down again a step along the next direction: b to the power of d
   points cost one addition each rather than one rotation each. */

/* The page's blues for what is close, its ochres for what lies along a
   direction the reader cannot point at. Written into three variables rather
   than returned in an array: this runs once per pixel of the drawing, and an
   array apiece is millions of them. */
let shadeR = 0;
let shadeG = 0;
let shadeB = 0;
const shade = (near, beyond) => {
    const coolR = 157 + (9 - 157) * near;
    const coolG = 195 + (83 - 195) * near;
    const coolB = 220 + (157 - 220) * near;
    shadeR = coolR + (226 + (184 - 226) * near - coolR) * beyond;
    shadeG = coolG + (180 + (104 - 180) * near - coolG) * beyond;
    shadeB = coolB + (119 + (33 - 119) * near - coolB) * beyond;
};

/* The depth buffer is kept between pictures: it is the same size every time and
   allocating a megabyte a frame is work for nothing. */
let depthBuffer = null;

/* How far across the picture the projection can ever throw a point that lies
   `reach` from the middle — over every rotation there is, not the one being
   drawn.

   Fitting the figure to the orientation in front of you makes it breathe in and
   out as it turns, because a box seen corner-on reaches further than one seen
   face-on. Fitting it to this instead gives one size that holds: the largest at
   which no rotation can ever put a point outside the picture.

   A point leans out along the direction across the picture by cos a, and puts
   what is left of itself into the directions behind it, where each one
   multiplies it by the perspective again. Spreading that remainder evenly over
   j of them turns out to be the worst it can do, and for each j the best angle
   is where the derivative vanishes — a quadratic in sin a. */
const widestReach = (reach, dimensions, depth) => {
    let widest = reach;
    for (let j = 1; j <= dimensions - 2; j += 1) {
        const share = reach / Math.sqrt(j);
        const lean = j === 1
            ? share / depth
            : (depth - Math.sqrt(depth * depth + 4 * j * (j - 1) * share * share)) / (2 * share * (1 - j));
        if (!(lean > 0) || lean >= 1) continue;
        const behind = share * lean;
        if (behind >= depth) continue;
        const thrown = reach * Math.sqrt(1 - lean * lean) * Math.pow(depth / (depth - behind), j);
        if (thrown > widest) widest = thrown;
    }
    return widest;
};

const build = (request) => {
    const { base, dimensions, matrix, extents, width, height, depth, room, dotRadius, fade } = request;
    const cells = width * height;
    /* The page hands its last picture back to be drawn over, so neither side
       allocates a new one every frame. */
    const pixels = request.canvas && request.canvas.length === cells * 4
        ? request.canvas
        : new Uint8ClampedArray(cells * 4);
    pixels.fill(0);
    if (!depthBuffer || depthBuffer.length !== cells) depthBuffer = new Float32Array(cells);
    const nearest = depthBuffer;
    nearest.fill(-Infinity);
    const total = Math.pow(base, dimensions);
    if (!total || fade <= 0.002) return { pixels, drawn: 0, reach: 0 };

    /* The rotated step along each direction, and the corner the walk starts
       from. Everything else is addition. */
    const spread = Math.sqrt(dimensions);
    const step = base > 1 ? 2 / (base - 1) : 0;
    const steps = [];
    const start = new Float64Array(dimensions);
    for (let axis = 0; axis < dimensions; axis += 1) {
        const extent = extents[axis] === undefined ? 1 : extents[axis];
        const along = new Float64Array(dimensions);
        for (let row = 0; row < dimensions; row += 1) along[row] = matrix[row * dimensions + axis] * step * extent / spread;
        steps.push(along);
        for (let row = 0; row < dimensions; row += 1) start[row] -= matrix[row * dimensions + axis] * extent / spread;
    }

    /* How far the furthest point can be, so the picture can be scaled to the
       space it has before a single point is plotted. */
    let reach = 0;
    for (let axis = 0; axis < dimensions; axis += 1) {
        const extent = extents[axis] === undefined ? 1 : extents[axis];
        reach += (extent / spread) * (extent / spread);
    }
    reach = Math.sqrt(reach);

    const centreX = width / 2;
    const centreY = height / 2;
    /* Where the whole shape is small enough to hold, its points are kept so the
       lines along each direction can be drawn between them. Past that the shape
       is a solid cloud and the lines inside it could not be seen anyway. */
    const joining = total <= 50000 && base > 1;
    const xs = joining ? new Float32Array(total) : null;
    const ys = joining ? new Float32Array(total) : null;
    const nears = joining ? new Float32Array(total) : null;
    /* Each point's colour, kept from when its dot was drawn. Every point is an
       end of one stroke per direction, so working the colour out again for
       each of them is the same sum done a dozen times over. */
    const reds = joining ? new Uint8Array(total) : null;
    const greens = joining ? new Uint8Array(total) : null;
    const blues = joining ? new Uint8Array(total) : null;
    const counters = new Int32Array(dimensions);
    const position = new Float64Array(dimensions);
    position.set(start);

    /* One size, worked out before a point is plotted and the same whichever way
       the figure has been turned, so it holds still while it rotates. */
    const widest = Math.max(1e-6, widestReach(reach, dimensions, depth));
    {
        counters.fill(0);
        position.set(start);
        const scale = room / widest;
        for (let n = 0; n < total; n += 1) {
            let factor = 1;
            let beyond = 0;
            for (let axis = dimensions - 1; axis >= 2; axis -= 1) {
                factor *= depth / (depth - position[axis]);
                if (axis >= 3) {
                    const level = (position[axis] / (reach || 1) + 1) / 2;
                    if (level > beyond) beyond = level;
                }
            }
            const across = (position[0] || 0) * factor;
            const down = -(position[1] || 0) * factor;

            {
                const x = centreX + across * scale;
                const y = centreY + down * scale;
                const near = Math.max(0, Math.min(1, ((position[2] || 0) / (reach || 1) * 0.9 + 1) / 2));
                const alpha = (0.5 + near * 0.5) * fade * 255;
                const radius = dotRadius * (0.6 + near * 0.7);
                shade(near, dimensions > 3 ? Math.max(0, Math.min(1, beyond)) : 0);
                if (joining) {
                    xs[n] = x;
                    ys[n] = y;
                    nears[n] = near;
                    reds[n] = shadeR;
                    greens[n] = shadeG;
                    blues[n] = shadeB;
                }
                const left = Math.max(0, Math.round(x - radius));
                const right = Math.min(width - 1, Math.round(x + radius));
                const top = Math.max(0, Math.round(y - radius));
                const bottom = Math.min(height - 1, Math.round(y + radius));
                for (let py = top; py <= bottom; py += 1) {
                    for (let px = left; px <= right; px += 1) {
                        const at = py * width + px;
                        /* The nearest point on a pixel wins it, which is what
                           makes the front of the shape hide the back. */
                        if (near <= nearest[at]) continue;
                        nearest[at] = near;
                        const cell = at * 4;
                        pixels[cell] = shadeR;
                        pixels[cell + 1] = shadeG;
                        pixels[cell + 2] = shadeB;
                        pixels[cell + 3] = alpha;
                    }
                }
            }

            /* Step to the next point of the lattice, carrying along the
               directions the way an odometer carries. */
            for (let axis = 0; axis < dimensions; axis += 1) {
                const along = steps[axis];
                if (counters[axis] + 1 < base) {
                    counters[axis] += 1;
                    for (let row = 0; row < dimensions; row += 1) position[row] += along[row];
                    break;
                }
                counters[axis] = 0;
                for (let row = 0; row < dimensions; row += 1) position[row] -= along[row] * (base - 1);
            }
        }
    }

    if (joining) {
        /* One stroke for every line of points along a direction, drawn under
           the points themselves so the dots stay crisp. */
        const stride = new Int32Array(dimensions);
        let span = 1;
        for (let axis = 0; axis < dimensions; axis += 1) { stride[axis] = span; span *= base; }
        const fadeByte = fade * 255;

        for (let axis = 0; axis < dimensions; axis += 1) {
            const extent = extents[axis] === undefined ? 1 : extents[axis];
            if (extent < 0.02) continue;
            const jump = stride[axis];
            const block = jump * base;
            /* Straight to the head of each line, rather than walking the whole
               lattice asking of every point whether it begins one. */
            for (let head = 0; head < total; head += block) {
                for (let offset = 0; offset < jump; offset += 1) {
                    const line = head + offset;
                    /* Perspective bends a line of points a little off the
                       straight, so it is drawn a step at a time. Where the
                       bend comes to less than half a pixel there is nothing to
                       keep, and the whole line is one stroke instead of five:
                       on a crowded figure that is most of the setting up the
                       drawing was doing. */
                    let whole = base > 2;
                    if (whole) {
                        const last = line + jump * (base - 1);
                        const spanX = xs[last] - xs[line];
                        const spanY = ys[last] - ys[line];
                        const length = Math.sqrt(spanX * spanX + spanY * spanY);
                        const middle = line + jump * (base >> 1);
                        whole = length < 1e-6 || Math.abs(spanX * (ys[line] - ys[middle])
                            - spanY * (xs[line] - xs[middle])) < length * 0.5;
                    }
                    const strokes = whole ? 1 : base - 1;
                    const reach = whole ? jump * (base - 1) : jump;
                    for (let piece = 0; piece < strokes; piece += 1) {
                        const from = line + piece * reach;
                        const to = from + reach;
                        const x0 = xs[from];
                        const y0 = ys[from];
                        const dx = xs[to] - x0;
                        const dy = ys[to] - y0;
                        const across = dx < 0 ? -dx : dx;
                        const down = dy < 0 ? -dy : dy;
                        const run = across > down ? across : down;
                        /* Neighbours that land on the same pixel are joined
                           already: the two dots cover the whole of the line
                           between them, and every pixel of it would lose the
                           depth test to them anyway. Once a shape is dense
                           enough to lag, this is most of the drawing. */
                        if (run < 1) continue;
                        const nearFrom = nears[from] * 0.985;
                        const nearTo = nears[to] * 0.985;

                        const pieces = Math.ceil(run);
                        const t = 1 / pieces;
                        const xStep = dx * t;
                        const yStep = dy * t;

                        /* Where along the stroke it is inside the picture,
                           worked out once so that not one of its pixels has to
                           ask. At this density the test was being made four
                           and a half million times a frame. */
                        let first = 0;
                        let last = pieces;
                        const startX = x0 + 0.5;
                        const startY = y0 + 0.5;
                        if (xStep > 0) {
                            const enter = -startX / xStep;
                            const leave = (width - startX) / xStep;
                            if (enter > first) first = Math.ceil(enter);
                            if (leave < last) last = Math.ceil(leave) - 1;
                        } else if (xStep < 0) {
                            const enter = (width - startX) / xStep;
                            const leave = -startX / xStep;
                            if (enter > first) first = Math.ceil(enter);
                            if (leave < last) last = Math.ceil(leave) - 1;
                        } else if (startX < 0 || startX >= width) {
                            continue;
                        }
                        if (yStep > 0) {
                            const enter = -startY / yStep;
                            const leave = (height - startY) / yStep;
                            if (enter > first) first = Math.ceil(enter);
                            if (leave < last) last = Math.ceil(leave) - 1;
                        } else if (yStep < 0) {
                            const enter = (height - startY) / yStep;
                            const leave = -startY / yStep;
                            if (enter > first) first = Math.ceil(enter);
                            if (leave < last) last = Math.ceil(leave) - 1;
                        } else if (startY < 0 || startY >= height) {
                            continue;
                        }
                        if (first > last) continue;
                        /* The colour is worked out at the two ends and carried
                           between them a step at a time, rather than from
                           scratch at every pixel. */
                        let r = reds[from], g = greens[from], b = blues[from];
                        const rStep = (reds[to] - r) * t;
                        const gStep = (greens[to] - g) * t;
                        const bStep = (blues[to] - b) * t;
                        const nearStep = (nearTo - nearFrom) * t;
                        let x = startX + xStep * first;
                        let y = startY + yStep * first;
                        let near = nearFrom + nearStep * first;
                        r += rStep * first;
                        g += gStep * first;
                        b += bStep * first;
                        for (let along = first; along <= last; along += 1) {
                            const at = (y | 0) * width + (x | 0);
                            if (near > nearest[at]) {
                                nearest[at] = near;
                                const cell = at * 4;
                                pixels[cell] = r;
                                pixels[cell + 1] = g;
                                pixels[cell + 2] = b;
                                pixels[cell + 3] = (0.3 + near * 0.5) * fadeByte;
                            }
                            x += xStep;
                            y += yStep;
                            near += nearStep;
                            r += rStep;
                            g += gStep;
                            b += bStep;
                        }
                    }
                }
            }
        }
    }

    return { pixels, drawn: total, reach };
};

/* The file is loaded twice: as a worker, and as an ordinary script so the page
   can fall back to drawing on its own thread. */
self.latticePicture = build;

self.addEventListener("message", (event) => {
    const request = event.data;
    if (!request || request.type !== "draw") return;
    const { pixels, drawn } = build(request);
    self.postMessage({ type: "drawn", id: request.id, width: request.width, height: request.height, pixels, drawn },
        [pixels.buffer]);
});
