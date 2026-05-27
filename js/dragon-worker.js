self.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || !data.type) return;

    if (data.type === 'init') {
        initWorker(data);
        return;
    }

    if (data.type === 'resize') {
        resizeCanvas(data.width, data.height);
        resetView();
        return;
    }

    if (data.type === 'reset') {
        resetTree();
        resetView();
        return;
    }

    if (data.type === 'zoomAt') {
        zoomAt(data.x, data.y, data.delta);
        return;
    }

    if (data.type === 'pan') {
        panBy(data.dx, data.dy);
        return;
    }
});

const REFINE_PX = 10;
const COARSEN_PX = 5;
const MAX_LEAVES_CHECKED_PER_FRAME = 1000;
const MAX_COARSENS_PER_FRAME = 300;

let canvas = null;
let ctx = null;
let dpr = 1;
let width = 1;
let height = 1;

let viewScale = 1;
let viewAngle = 0;
let viewOffsetX = 0;
let viewOffsetY = 0;

let segments = [];
let leafIndices = [];
let lodIndex = 0;
let loopTimer = null;

function createSegment(start, end, parentIndex) {
    const idx = segments.length;
    segments.push({
        start: { x: start.x, y: start.y },
        end: { x: end.x, y: end.y },
        parentIndex: parentIndex,
        childIndices: null
    });
    return idx;
}

function resetTree() {
    segments = [];
    const rootIndex = createSegment(
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        -1
    );
    leafIndices = [rootIndex];
    lodIndex = 0;
}

function resizeCanvas(w, h) {
    width = Math.max(1, Math.round(w));
    height = Math.max(1, Math.round(h));
    if (canvas) {
        canvas.width = width;
        canvas.height = height;
    }
}

function computeBounds() {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    for (const idx of leafIndices) {
        const seg = segments[idx];
        for (const p of [seg.start, seg.end]) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        }
    }
    if (!isFinite(minX)) {
        minX = -0.5; maxX = 1.5;
        minY = -0.5; maxY = 1.5;
    }
    return { minX, maxX, minY, maxY };
}

function resetView() {
    resetTree();

    const bounds = computeBounds();
    const W = width;
    const H = height;

    const bboxW = bounds.maxX - bounds.minX || 1;
    const bboxH = bounds.maxY - bounds.minY || 1;
    const padding = 0.1;

    const scaleX = (W * (1 - padding)) / bboxW;
    const scaleY = (H * (1 - padding)) / bboxH;

    viewScale = Math.max(1, Math.min(scaleX, scaleY));
    viewAngle = 0;

    const cx = 0.5 * (bounds.minX + bounds.maxX);
    const cy = 0.5 * (bounds.minY + bounds.maxY);
    viewOffsetX = -cx;
    viewOffsetY = -cy;
}

function screenToWorld(sx, sy) {
    const centreX = width * 0.5;
    const centreY = height * 0.5;

    const dx = sx - centreX;
    const dy = sy - centreY;

    const cosA = Math.cos(viewAngle);
    const sinA = Math.cos(viewAngle) ? Math.sin(viewAngle) : 0;

    const wxp = (dx * cosA + dy * sinA) / viewScale;
    const wyp = (-dx * sinA + dy * cosA) / viewScale;

    return {
        x: wxp - viewOffsetX,
        y: wyp - viewOffsetY
    };
}

function worldToScreen(p) {
    const cosA = Math.cos(viewAngle);
    const sinA = Math.cos(viewAngle) ? Math.sin(viewAngle) : 0;
    const wx = p.x + viewOffsetX;
    const wy = p.y + viewOffsetY;
    return {
        x: width * 0.5 + viewScale * (wx * cosA - wy * sinA),
        y: height * 0.5 + viewScale * (wx * sinA + wy * cosA)
    };
}

function segmentScreenLength(seg) {
    const s = worldToScreen(seg.start);
    const e = worldToScreen(seg.end);
    return Math.hypot(e.x - s.x, e.y - s.y);
}

function segmentVisible(seg) {
    const padding = 20;
    const s = worldToScreen(seg.start);
    const e = worldToScreen(seg.end);

    const minX = Math.min(s.x, e.x);
    const maxX = Math.max(s.x, e.x);
    const minY = Math.min(s.y, e.y);
    const maxY = Math.max(s.y, e.y);

    return (
        maxX >= -padding &&
        minX <= width + padding &&
        maxY >= -padding &&
        minY <= height + padding
    );
}

function refineEdge(idx) {
    const seg = segments[idx];
    if (seg.childIndices) return;

    const Ax = seg.start.x;
    const Ay = seg.start.y;
    const Bx = seg.end.x;
    const By = seg.end.y;

    const dx = Bx - Ax;
    const dy = By - Ay;

    const L = Math.hypot(dx, dy);
    if (L === 0) return;

    const ux = dx / L;
    const uy = dy / L;

    const nx = -uy;
    const ny = ux;

    const Mx = (Ax + Bx) * 0.5;
    const My = (Ay + By) * 0.5;

    const Cx = Mx + 0.5 * L * nx;
    const Cy = My + 0.5 * L * ny;

    const child1Index = createSegment(
        { x: Ax, y: Ay },
        { x: Cx, y: Cy },
        idx
    );

    const child2Index = createSegment(
        { x: Bx, y: By },
        { x: Cx, y: Cy },
        idx
    );

    seg.childIndices = [child1Index, child2Index];

    const pos = leafIndices.indexOf(idx);
    if (pos !== -1) {
        leafIndices.splice(pos, 1, child1Index, child2Index);
    } else {
        leafIndices.push(child1Index, child2Index);
    }

    if (leafIndices.length === 0) {
        lodIndex = 0;
    } else {
        lodIndex = Math.min(lodIndex, leafIndices.length - 1);
    }
}

function coarsenEdge(parentIdx) {
    const parent = segments[parentIdx];
    if (!parent.childIndices) return;

    const [c1, c2] = parent.childIndices;
    if (!leafIndices.includes(c1) || !leafIndices.includes(c2)) return;

    leafIndices = leafIndices.filter(idx => idx !== c1 && idx !== c2);
    if (!leafIndices.includes(parentIdx)) {
        leafIndices.push(parentIdx);
    }

    parent.childIndices = null;

    if (leafIndices.length === 0) {
        lodIndex = 0;
    } else {
        lodIndex = Math.min(lodIndex, leafIndices.length - 1);
    }
}

function render() {
    const nLeaves = leafIndices.length;
    const toRefine = new Set();

    if (nLeaves > 0) {
        let processed = 0;
        while (processed < MAX_LEAVES_CHECKED_PER_FRAME && processed < nLeaves) {
            const idxInLeaves = (lodIndex + processed) % nLeaves;
            const segIdx = leafIndices[idxInLeaves];
            const seg = segments[segIdx];

            if (segmentVisible(seg)) {
                const lenPx = segmentScreenLength(seg);
                if (lenPx > REFINE_PX && !seg.childIndices) {
                    toRefine.add(segIdx);
                }
            }

            processed++;
        }
        lodIndex = (lodIndex + processed) % Math.max(leafIndices.length, 1);
        for (const idx of toRefine) {
            refineEdge(idx);
        }
    }

    const parentsToCoarsen = new Set();
    for (const leafIdx of leafIndices) {
        const leafSeg = segments[leafIdx];
        const parentIdx = leafSeg.parentIndex;
        if (parentIdx === -1) continue;

        const parent = segments[parentIdx];
        if (!parent.childIndices) continue;

        const [c1, c2] = parent.childIndices;
        if (toRefine.has(c1) || toRefine.has(c2)) continue;
        if (!leafIndices.includes(c1) || !leafIndices.includes(c2)) continue;

        const child1 = segments[c1];
        const child2 = segments[c2];

        const vis1 = segmentVisible(child1);
        const vis2 = segmentVisible(child2);

        if (!vis1 && !vis2) {
            parentsToCoarsen.add(parentIdx);
        } else if (vis1 && vis2) {
            const len1 = segmentScreenLength(child1);
            const len2 = segmentScreenLength(child2);
            if (len1 < COARSEN_PX && len2 < COARSEN_PX) {
                parentsToCoarsen.add(parentIdx);
            }
        }
    }

    let coarsenCount = 0;
    for (const pIdx of parentsToCoarsen) {
        if (coarsenCount >= MAX_COARSENS_PER_FRAME) break;
        coarsenEdge(pIdx);
        coarsenCount++;
    }

    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#050816';
    ctx.fillRect(0, 0, width, height);

    const cosA = Math.cos(viewAngle);
    const sinA = Math.cos(viewAngle) ? Math.sin(viewAngle) : 0;

    ctx.setTransform(
        viewScale * cosA,
        viewScale * sinA,
        -viewScale * sinA,
        viewScale * cosA,
        width * 0.5 + viewScale * (viewOffsetX * cosA - viewOffsetY * sinA),
        height * 0.5 + viewScale * (viewOffsetX * sinA + viewOffsetY * cosA)
    );

    const desiredPx = 1.0;
    const worldLineWidth = desiredPx / viewScale;
    ctx.lineWidth = worldLineWidth;
    ctx.strokeStyle = '#62d6ff';

    ctx.beginPath();
    for (const idx of leafIndices) {
        const seg = segments[idx];
        if (!segmentVisible(seg)) continue;
        ctx.moveTo(seg.start.x, seg.start.y);
        ctx.lineTo(seg.end.x, seg.end.y);
    }
    ctx.stroke();
}

function scheduleLoop() {
    if (loopTimer !== null) return;
    loopTimer = self.setTimeout(() => {
        loopTimer = null;
        loop();
    }, 16);
}

function loop() {
    render();
    scheduleLoop();
}

function initWorker(data) {
    if (!data || !data.canvas) return;
    canvas = data.canvas;
    ctx = canvas.getContext('2d');
    dpr = data.dpr || 1;
    resizeCanvas(data.width || 1, data.height || 1);
    resetTree();
    resetView();
    if (loopTimer === null) {
        scheduleLoop();
    }
}

function zoomAt(cssX, cssY, delta) {
    const sx = cssX * dpr;
    const sy = cssY * dpr;
    const worldBefore = screenToWorld(sx, sy);

    const factor = delta < 0 ? 1.15 : 1 / 1.15;
    viewScale *= factor;
    viewScale = Math.max(1, Math.min(viewScale, 1e6));

    const centreX = width * 0.5;
    const centreY = height * 0.5;
    const cosA = Math.cos(viewAngle);
    const sinA = Math.cos(viewAngle) ? Math.sin(viewAngle) : 0;

    const dxScreen = sx - centreX;
    const dyScreen = sy - centreY;

    const vx = (dxScreen * cosA + dyScreen * sinA) / viewScale;
    const vy = (-dxScreen * sinA + dyScreen * cosA) / viewScale;

    viewOffsetX = vx - worldBefore.x;
    viewOffsetY = vy - worldBefore.y;
}

function panBy(dxCss, dyCss) {
    const dxScreen = dxCss * dpr;
    const dyScreen = dyCss * dpr;

    const cosA = Math.cos(viewAngle);
    const sinA = Math.cos(viewAngle) ? Math.sin(viewAngle) : 0;

    const wx = (dxScreen * cosA + dyScreen * sinA) / viewScale;
    const wy = (-dxScreen * sinA + dyScreen * cosA) / viewScale;

    viewOffsetX += wx;
    viewOffsetY += wy;
}
