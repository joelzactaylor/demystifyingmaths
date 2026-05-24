document.addEventListener('DOMContentLoaded', () => {

    // ─── CONSTANTS ────────────────────────────────────────────────

    const RANGE = 10;
    const POINT_R = 10;
    const PAD = POINT_R + 4;

    // ─── SHARED UTILITIES ─────────────────────────────────────────

    function snap(v) {
        return Math.round(Math.max(-RANGE, Math.min(RANGE, v)) * 10) / 10;
    }

    function fmt(v) {
        return v % 1 === 0 ? String(v) : v.toFixed(1);
    }

    function fmt2sf(v) {
        if (v === 0) return '0';
        const abs = Math.abs(v);
        if (abs < 0.1) return v.toExponential(1).replace('e+', 'e');
        return String(Number(v.toPrecision(2)));
    }

    function complexLabel(vx, vy) {
        const re = fmt(vx);
        const im = Math.abs(vy);
        const imFmt = fmt(im);
        if (vy === 0) return re;
        if (vx === 0) return (vy < 0 ? '−' : '') + (im === 1 ? 'i' : imFmt + 'i');
        return re + (vy < 0 ? ' − ' : ' + ') + (im === 1 ? 'i' : imFmt + 'i');
    }

    function complexLabelSf(vx, vy) {
        const re = fmt2sf(vx);
        const im = Math.abs(vy);
        const imFmt = fmt2sf(im);
        if (vy === 0) return re;
        if (vx === 0) return (vy < 0 ? '−' : '') + (im === 1 ? 'i' : imFmt + 'i');
        return re + (vy < 0 ? ' − ' : ' + ') + (im === 1 ? 'i' : imFmt + 'i');
    }

    function polarLabel(vx, vy) {
        const rFmt = fmt(Math.round(Math.hypot(vx, vy) * 10) / 10);
        const thetaFmt = fmt(Math.round(Math.atan2(vy, vx) * 100) / 100);
        return `${rFmt} cis ${thetaFmt}`;
    }

    function pointLabel(vx, vy, mode = 'cartesian', useSf = false) {
        if (mode === 'polar') return polarLabel(vx, vy);
        return useSf ? complexLabelSf(vx, vy) : complexLabel(vx, vy);
    }

    function imagLabel(value) {
        if (value === 1) return 'i';
        if (value === -1) return '-i';
        return `${value}i`;
    }

    // ─── SHARED DRAWING HELPERS ───────────────────────────────────

    function drawHandle(ctx, px, py, color = '#116e93') {
        ctx.beginPath();
        ctx.arc(px, py, POINT_R + 4, 0, Math.PI * 2);
        ctx.fillStyle = color === '#116e93' ? 'rgba(17,110,147,0.15)' : 'rgba(224,123,57,0.15)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, POINT_R, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, POINT_R - 3, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    }

    function drawPill(ctx, text, x, y, color = '#116e93') {
        ctx.font = 'bold 14px Aleo, serif';
        const pillW = ctx.measureText(text).width + 12;

        ctx.beginPath();
        ctx.roundRect(x - pillW / 2, y - 11, pillW, 22, 6);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.fillText(text, x, y);
    }

    // Draws the small upward arrow above a draggable handle
    function drawHandleArrow(ctx, px, py) {
        ctx.beginPath();
        ctx.moveTo(px, py - POINT_R - 4);
        ctx.lineTo(px, py - POINT_R - 16);
        ctx.strokeStyle = '#116e93';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(px, py - POINT_R - 4);
        ctx.lineTo(px - 4, py - POINT_R - 12);
        ctx.lineTo(px + 4, py - POINT_R - 12);
        ctx.closePath();
        ctx.fillStyle = '#116e93';
        ctx.fill();
    }

    // Arrow from (fromX,fromY) to (toX,toY) with filled arrowhead
    function drawArrow(ctx, fromX, fromY, toX, toY, color) {
        const dx = toX - fromX;
        const dy = toY - fromY;
        const len = Math.hypot(dx, dy);
        if (len < 1) return;
        const ux = dx / len;
        const uy = dy / len;
        const headLen = 10;

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLen * ux + headLen * 0.5 * uy, toY - headLen * uy - headLen * 0.5 * ux);
        ctx.lineTo(toX - headLen * ux - headLen * 0.5 * uy, toY - headLen * uy + headLen * 0.5 * ux);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    // Draws the dotted vertical projection from (px,py) down to y=cy
    function drawProjection(ctx, px, py, cy) {
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(17,110,147,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, cy);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Draws axis ticks + labels for a 1D horizontal axis centred at cy.
    // toPixelFn converts a value to an x pixel.
    function draw1DTicks(ctx, cy, toPixelFn) {
        ctx.font = '13px Aleo, serif';
        ctx.fillStyle = '#12435b';
        for (let i = -RANGE; i <= RANGE; i++) {
            const x = toPixelFn(i);
            const major = i % 5 === 0;
            ctx.beginPath();
            ctx.moveTo(x, cy - (major ? 12 : 6));
            ctx.lineTo(x, cy + (major ? 12 : 6));
            ctx.strokeStyle = major ? '#116e93' : 'rgba(17,110,147,0.35)';
            ctx.lineWidth = major ? 2 : 1;
            ctx.stroke();
            if (major) {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(i, x, cy + 16);
            }
        }
    }

    // Draws X+Y axis ticks + labels for a 2D plane.
    // ox,oy = origin pixel coords; toPixelX/Y convert values to pixels.
    function draw2DTicks(ctx, ox, oy, toPixelX, toPixelY) {
        ctx.font = '13px Aleo, serif';
        ctx.fillStyle = '#12435b';
        for (let i = -RANGE; i <= RANGE; i++) {
            if (i === 0) continue;
            const major = i % 5 === 0;

            const x = toPixelX(i);
            ctx.beginPath();
            ctx.moveTo(x, oy - (major ? 8 : 4));
            ctx.lineTo(x, oy + (major ? 8 : 4));
            ctx.strokeStyle = major ? '#116e93' : 'rgba(17,110,147,0.35)';
            ctx.lineWidth = major ? 2 : 1;
            ctx.stroke();
            if (major) {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(i, x, oy + 10);
            }

            const y = toPixelY(i);
            ctx.beginPath();
            ctx.moveTo(ox - (major ? 8 : 4), y);
            ctx.lineTo(ox + (major ? 8 : 4), y);
            ctx.strokeStyle = major ? '#116e93' : 'rgba(17,110,147,0.35)';
            ctx.lineWidth = major ? 2 : 1;
            ctx.stroke();
            if (major) {
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(imagLabel(i), ox - 12, y);
            }
        }
    }

    // Draws the rounded-rect axis track (horizontal bar at cy, full width)
    function drawAxisTrack1D(ctx, w, cy, pad) {
        ctx.beginPath();
        ctx.roundRect(pad - 4, cy - 4, w - 2 * (pad - 4), 8, 4);
        ctx.fillStyle = 'rgba(17,110,147,0.18)';
        ctx.fill();
    }

    // Draws both axis tracks (X and Y) for a 2D plane
    function drawAxisTracks2D(ctx, w, h, ox, oy, margin) {
        ctx.beginPath();
        ctx.roundRect(margin, oy - 4, w - 2 * margin, 8, 4);
        ctx.fillStyle = 'rgba(17,110,147,0.18)';
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(ox - 4, margin, 8, h - 2 * margin, 4);
        ctx.fillStyle = 'rgba(17,110,147,0.18)';
        ctx.fill();
    }

    // Draws a result dot (green ring) at (prx, pry)
    function drawResultDot(ctx, prx, pry) {
        ctx.beginPath();
        ctx.arc(prx, pry, POINT_R - 2, 0, Math.PI * 2);
        ctx.fillStyle = '#2a9d5c';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(prx, pry, POINT_R - 5, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    }

    // Draws the green result pill label
    function drawResultPill(ctx, label, prx, pry) {
        ctx.font = 'bold 14px Aleo, serif';
        const tw = ctx.measureText(label).width;
        ctx.beginPath();
        ctx.roundRect(prx - (tw + 12) / 2, pry - POINT_R - 25, tw + 12, 22, 6);
        ctx.fillStyle = '#2a9d5c';
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, prx, pry - POINT_R - 14);
    }

    // Draws a cartesian grid (lines only, no axes/ticks)
    function drawCartesianGrid(ctx, toPixelX, toPixelY, w, h, margin) {
        ctx.strokeStyle = 'rgba(17,110,147,0.1)';
        ctx.lineWidth = 1;
        for (let i = -RANGE; i <= RANGE; i++) {
            if (i === 0) continue;
            const x = toPixelX(i);
            ctx.beginPath(); ctx.moveTo(x, margin); ctx.lineTo(x, h - margin); ctx.stroke();
            const y = toPixelY(i);
            ctx.beginPath(); ctx.moveTo(margin, y); ctx.lineTo(w - margin, y); ctx.stroke();
        }
    }

    // Draws concentric circles + radial spokes (polar background)
    function drawPolarGrid(ctx, ox, oy, scaleFn) {
        ctx.strokeStyle = 'rgba(17,110,147,0.12)';
        ctx.lineWidth = 1;
        for (let ri = 2; ri <= RANGE; ri += 2) {
            ctx.beginPath();
            ctx.arc(ox, oy, ri * scaleFn(), 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(17,110,147,0.1)';
        for (let deg = 0; deg < 180; deg += 30) {
            const rad = deg * Math.PI / 180;
            const R = RANGE * scaleFn();
            ctx.beginPath();
            ctx.moveTo(ox - Math.cos(rad) * R, oy + Math.sin(rad) * R);
            ctx.lineTo(ox + Math.cos(rad) * R, oy - Math.sin(rad) * R);
            ctx.stroke();
        }
    }

    // ─── SHARED INTERACTION HELPERS ───────────────────────────────

    // Standard getPos for sims that DON'T need page-scale correction
    function makeGetPos(canvas) {
        return function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            const src = e.touches ? e.touches[0] : e;
            return { x: src.clientX - rect.left, y: src.clientY - rect.top };
        };
    }

    function hitTest(pos, toPixelX, toPixelY, z) {
        const dx = pos.x - toPixelX(z.x);
        const dy = pos.y - toPixelY(z.y);
        return Math.hypot(dx, dy) < POINT_R + 8;
    }

    // Attaches the standard drag listeners for a single-handle sim (1D or 2D).
    // onDown(e)  — called on mousedown/touchstart
    // onMove(e)  — called on mousemove/touchmove (only when dragging)
    // onUp()     — called on mouseup/touchend
    // setDrag()  — returns current drag state (so onMove can gate itself)
    function attachDragListeners(canvas, { onDown, onMove, onUp }) {
        canvas.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);

        canvas.addEventListener('touchstart', e => { e.preventDefault(); onDown(e); }, { passive: false });
        window.addEventListener('touchmove', e => { e.preventDefault(); onMove(e); }, { passive: false });
        window.addEventListener('touchend', onUp);
    }

    // ─── COMPLEX MATH ─────────────────────────────────────────────

    function complexLog(z) {
        const r = Math.hypot(z.x, z.y);
        return { x: Math.log(r === 0 ? 0 : r), y: Math.atan2(z.y, z.x) };
    }

    function complexExp(z) {
        const ex = Math.exp(z.x);
        return { x: ex * Math.cos(z.y), y: ex * Math.sin(z.y) };
    }

    function complexPow(base, exp) {
        if (base.x === 0 && base.y === 0) {
            return (exp.x === 0 && exp.y === 0) ? { x: 1, y: 0 } : { x: 0, y: 0 };
        }
        const logB = complexLog(base);
        const expArg = {
            x: exp.x * logB.x - exp.y * logB.y,
            y: exp.x * logB.y + exp.y * logB.x
        };
        return complexExp(expArg);
    }

    // ─── 1D NUMBER LINE ───────────────────────────────────────────

    function init1D(canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const getX = makeGetPos(canvas);   // we only need x, but makeGetPos is fine

        let value = 0;
        let dragging = false;

        const scale = () => (canvas.width - 2 * (PAD + 20)) / (2 * RANGE);
        const toPixel = v => canvas.width / 2 + v * scale();
        const toValue = px => (px - canvas.width / 2) / scale();

        function draw() {
            const w = canvas.width, h = canvas.height;
            const cy = h / 2 + 20;
            ctx.clearRect(0, 0, w, h);

            drawAxisTrack1D(ctx, w, cy, PAD);

            const px = toPixel(value);

            draw1DTicks(ctx, cy, toPixel);

            // Zero line
            ctx.beginPath();
            ctx.moveTo(toPixel(0), cy - 14);
            ctx.lineTo(toPixel(0), cy + 14);
            ctx.strokeStyle = '#116e93';
            ctx.lineWidth = 2;
            ctx.stroke();

            drawHandle(ctx, px, cy);
            drawHandleArrow(ctx, px, cy);
            drawPill(ctx, fmt(value), px, cy - POINT_R - 28);
        }

        function update(e) {
            if (!dragging) return;
            value = snap(toValue(makeGetPos(canvas)(e).x));
            draw();
        }

        function resize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            draw();
        }

        attachDragListeners(canvas, {
            onDown: e => { dragging = true; update(e); },
            onMove: e => { update(e); },
            onUp: () => { dragging = false; }
        });
        window.addEventListener('resize', resize);
        resize();
    }

    // ─── 2D PLANE ─────────────────────────────────────────────────

    function init2D(canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const getPos = makeGetPos(canvas);

        let vx = 0, vy = 0;
        let dragging = false;

        const scale = () => (canvas.width - 2 * (PAD + 40)) / (2 * RANGE);
        const toPixelX = v => canvas.width / 2 + v * scale();
        const toPixelY = v => canvas.height / 2 - v * scale();
        const toValueX = px => (px - canvas.width / 2) / scale();
        const toValueY = py => -(py - canvas.height / 2) / scale();

        function draw() {
            const w = canvas.width, h = canvas.height;
            const cx = toPixelX(0), cy = toPixelY(0);
            ctx.clearRect(0, 0, w, h);

            drawAxisTrack1D(ctx, w, cy, PAD);
            draw1DTicks(ctx, cy, toPixelX);

            const px = toPixelX(vx), py = toPixelY(vy);

            drawProjection(ctx, px, py, cy);
            drawHandle(ctx, px, py);
            drawHandleArrow(ctx, px, py);
            drawPill(ctx, complexLabel(vx, vy), px, py - POINT_R - 28);

            try {
                canvas.dataset.blueAti = (vx === 0 && vy === 1) ? '1' : '0';
                if (window.checkISquaredReady) window.checkISquaredReady();
            } catch (e) { }
        }

        function update(e) {
            if (!dragging) return;
            const pos = getPos(e);
            vx = snap(toValueX(pos.x));
            vy = snap(toValueY(pos.y));
            draw();
        }

        function resize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            draw();
        }

        attachDragListeners(canvas, {
            onDown: e => { dragging = true; update(e); },
            onMove: e => { update(e); },
            onUp: () => { dragging = false; }
        });
        window.addEventListener('resize', resize);
        resize();
    }

    // ─── POLAR COORDINATES ────────────────────────────────────────

    function initPolar(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let r = 8, theta = Math.PI / 6;
        let dragging = false;

        function currentPageScale() {
            const val = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scale') || '1');
            return isNaN(val) || val <= 0 ? 1 : val;
        }

        const scale = () => (canvas.width - 2 * (PAD + 20)) / (2 * RANGE);
        const toPixelX = v => canvas.width / 2 + v * scale();
        const toPixelY = v => canvas.height / 2 - v * scale();
        const toValueX = px => (px - canvas.width / 2) / scale();
        const toValueY = py => -(py - canvas.height / 2) / scale();

        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            const sf = currentPageScale();
            const src = e.touches ? e.touches[0] : e;
            return { x: (src.clientX - rect.left) / sf, y: (src.clientY - rect.top) / sf };
        }

        function draw() {
            const w = canvas.width, h = canvas.height;
            const cx = toPixelX(0), cy = toPixelY(0);
            ctx.clearRect(0, 0, w, h);

            drawPolarGrid(ctx, cx, cy, scale);
            drawAxisTrack1D(ctx, w, cy, PAD + 20);
            draw1DTicks(ctx, cy, toPixelX);

            const px = toPixelX(r * Math.cos(theta));
            const py = toPixelY(r * Math.sin(theta));

            // Theta arc
            ctx.beginPath();
            ctx.arc(cx, cy, 2 * scale(), 0, -theta, true);
            ctx.strokeStyle = 'rgba(17, 110, 147, 0.61)';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Ray to edge
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(toPixelX(RANGE * Math.cos(theta)), toPixelY(RANGE * Math.sin(theta)));
            ctx.strokeStyle = 'rgba(17, 110, 147, 0.26)';
            ctx.lineWidth = 6;
            ctx.stroke();

            drawProjection(ctx, px, py, cy);
            drawHandle(ctx, px, py);
            drawHandleArrow(ctx, px, py);
            drawPill(ctx,
                fmt(Math.round(r * 10) / 10) + ' cis ' + fmt(Math.round(theta * 100) / 100),
                px, py - POINT_R - 28);
        }

        function update(e) {
            if (!dragging) return;
            const pos = getPos(e);
            const vx = toValueX(pos.x);
            const vy = toValueY(pos.y);
            r = Math.min(RANGE, Math.hypot(vx, vy));
            const raw = Math.atan2(vy, vx);
            theta = raw < 0 ? raw + 2 * Math.PI : raw;
            draw();
        }

        function resize() {
            const rect = canvas.getBoundingClientRect();
            const sf = currentPageScale();
            canvas.width = rect.width / sf;
            canvas.height = rect.height / sf;
            draw();
        }

        // Polar uses its own getPos (page-scale aware), so wire up manually
        canvas.addEventListener('mousedown', e => { dragging = true; update(e); });
        window.addEventListener('mousemove', e => { if (dragging) update(e); });
        window.addEventListener('mouseup', () => { dragging = false; });

        canvas.addEventListener('touchstart', e => { e.preventDefault(); dragging = true; update(e); }, { passive: false });
        window.addEventListener('touchmove', e => { if (dragging) { e.preventDefault(); update(e); } }, { passive: false });
        window.addEventListener('touchend', () => { dragging = false; });

        window.addEventListener('resize', resize);
        resize();
    }

    // ─── ADDITION / SUBTRACTION ───────────────────────────────────

    function initAddition(canvasId, readoutId, toggleBtnId, opLabelId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const readout = document.getElementById(readoutId);
        const toggleBtn = document.getElementById(toggleBtnId);
        const opLabel = document.getElementById(opLabelId);
        const getPos = makeGetPos(canvas);

        let op = 'add';
        let z1 = { x: 3, y: 2 };
        let z2 = { x: -1, y: 4 };
        let dragging = null;

        const MARGIN = PAD + 20;
        const scale = () => (canvas.width - 2 * MARGIN) / (2 * RANGE);
        const toPixelX = v => canvas.width / 2 + v * scale();
        const toPixelY = v => canvas.height / 2 - v * scale();
        const toValueX = px => (px - canvas.width / 2) / scale();
        const toValueY = py => -(py - canvas.height / 2) / scale();

        const result = () => op === 'add'
            ? { x: z1.x + z2.x, y: z1.y + z2.y }
            : { x: z1.x - z2.x, y: z1.y - z2.y };

        function draw() {
            const w = canvas.width, h = canvas.height;
            const ox = toPixelX(0), oy = toPixelY(0);
            ctx.clearRect(0, 0, w, h);

            drawCartesianGrid(ctx, toPixelX, toPixelY, w, h, MARGIN);
            drawAxisTracks2D(ctx, w, h, ox, oy, MARGIN);
            draw2DTicks(ctx, ox, oy, toPixelX, toPixelY);

            const res = result();
            const p1x = toPixelX(z1.x), p1y = toPixelY(z1.y);
            const p2x = toPixelX(z2.x), p2y = toPixelY(z2.y);
            const prx = toPixelX(res.x), pry = toPixelY(res.y);

            // Parallelogram helper lines
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#e07c3990';
            ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(prx, pry); ctx.stroke();
            if (op === 'add') {
                ctx.strokeStyle = '#116e9390';
                ctx.beginPath(); ctx.moveTo(p2x, p2y); ctx.lineTo(prx, pry); ctx.stroke();
            } else {
                ctx.strokeStyle = '#2a9d5c50';
                ctx.beginPath(); ctx.moveTo(p2x, p2y); ctx.lineTo(p1x, p1y); ctx.stroke();
            }

            drawArrow(ctx, ox, oy, p1x, p1y, '#116e93');
            drawArrow(ctx, ox, oy, p2x, p2y, '#e07b39');
            drawArrow(ctx, ox, oy, prx, pry, '#2a9d5c');

            drawHandle(ctx, p1x, p1y);
            drawHandle(ctx, p2x, p2y, '#e07b39');

            drawPill(ctx, complexLabel(z1.x, z1.y), p1x, p1y - POINT_R - 14);
            drawPill(ctx, complexLabel(z2.x, z2.y), p2x, p2y - POINT_R - 14, '#e07b39');

            drawResultPill(ctx, complexLabel(res.x, res.y), prx, pry);
            drawResultDot(ctx, prx, pry);

            if (readout) readout.textContent = complexLabel(res.x, res.y);
            try {
                canvas.dataset.blueAti = (z1.x === 0 && z1.y === 1 && z2.x === 0 && z2.y === 1) ? '1' : '0';
                if (window.checkISquaredReady) window.checkISquaredReady();
            } catch (e) { }
        }

        function update(e) {
            if (!dragging) return;
            const pos = getPos(e);
            const other = dragging === z1 ? z2 : z1;
            let nx = Math.max(-RANGE, Math.min(RANGE, snap(toValueX(pos.x))));
            let ny = Math.max(-RANGE, Math.min(RANGE, snap(toValueY(pos.y))));

            if (op === 'add') {
                nx = Math.max(-RANGE - other.x, Math.min(RANGE - other.x, nx));
                ny = Math.max(-RANGE - other.y, Math.min(RANGE - other.y, ny));
            } else if (dragging === z1) {
                nx = Math.max(-RANGE + other.x, Math.min(RANGE + other.x, nx));
                ny = Math.max(-RANGE + other.y, Math.min(RANGE + other.y, ny));
            } else {
                nx = Math.max(z1.x - RANGE, Math.min(z1.x + RANGE, nx));
                ny = Math.max(z1.y - RANGE, Math.min(z1.y + RANGE, ny));
            }

            dragging.x = Math.max(-RANGE, Math.min(RANGE, snap(nx)));
            dragging.y = Math.max(-RANGE, Math.min(RANGE, snap(ny)));
            draw();
        }

        function tryStartDrag(e) {
            const pos = getPos(e);
            if (hitTest(pos, toPixelX, toPixelY, z1)) dragging = z1;
            else if (hitTest(pos, toPixelX, toPixelY, z2)) dragging = z2;
        }

        function resize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            draw();
        }

        attachDragListeners(canvas, {
            onDown: e => { tryStartDrag(e); },
            onMove: e => { update(e); },
            onUp: () => { dragging = null; }
        });

        function setOpLabel() {
            opLabel.innerHTML = op === 'add'
                ? '<span class="var-z">z</span> = <span class="var-z1">z\u2081</span> + <span class="var-z2">z\u2082</span>'
                : '<span class="var-z">z</span> = <span class="var-z1">z\u2081</span> \u2212 <span class="var-z2">z\u2082</span>';
        }

        toggleBtn.addEventListener('click', () => {
            op = op === 'add' ? 'sub' : 'add';
            setOpLabel();
            toggleBtn.textContent = op === 'add' ? 'Switch to \u2212' : 'Switch to +';
            draw();
        });

        setOpLabel();
        window.addEventListener('resize', resize);
        resize();
    }

    // ─── MULTIPLICATION ───────────────────────────────────────────

    function initMultiplication(canvasId, readoutId, bgToggleId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const readout = document.getElementById(readoutId);
        const bgToggle = document.getElementById(bgToggleId);
        const getPos = makeGetPos(canvas);

        let bgMode = 'grid';
        let z1 = { x: 2, y: 0 };
        let z2 = { x: 5, y: 0 };
        let dragging = null;
        const MARGIN = PAD + 48;

        const scale = () => (canvas.width - 2 * MARGIN) / (2 * RANGE);
        const toPixelX = v => canvas.width / 2 + v * scale();
        const toPixelY = v => canvas.height / 2 - v * scale();
        const toValueX = px => (px - canvas.width / 2) / scale();
        const toValueY = py => -(py - canvas.height / 2) / scale();

        const multiply = (a, b) => ({
            x: a.x * b.x - a.y * b.y,
            y: a.x * b.y + a.y * b.x
        });

        function drawBackground(ox, oy) {
            if (bgMode === 'grid') {
                drawCartesianGrid(ctx, toPixelX, toPixelY, canvas.width, canvas.height, MARGIN);
            } else {
                drawPolarGrid(ctx, ox, oy, scale);
            }
        }

        function draw() {
            const w = canvas.width, h = canvas.height;
            const ox = toPixelX(0), oy = toPixelY(0);
            ctx.clearRect(0, 0, w, h);

            drawBackground(ox, oy);
            drawAxisTracks2D(ctx, w, h, ox, oy, MARGIN);
            draw2DTicks(ctx, ox, oy, toPixelX, toPixelY);

            const res = multiply(z1, z2);
            const p1x = toPixelX(z1.x), p1y = toPixelY(z1.y);
            const p2x = toPixelX(z2.x), p2y = toPixelY(z2.y);
            const prx = toPixelX(res.x), pry = toPixelY(res.y);

            // Angle arcs
            const t1 = Math.atan2(z1.y, z1.x);
            const t2 = Math.atan2(z2.y, z2.x);
            const arcR = 28;
            ctx.lineWidth = 1.5;
            [[t1, arcR, '#116e9370'], [t2, arcR + 8, '#e07b3970'], [t1 + t2, arcR + 16, '#2a9d5c70']]
                .forEach(([angle, r, color]) => {
                    ctx.strokeStyle = color;
                    ctx.beginPath(); ctx.arc(ox, oy, r, 0, -angle, true); ctx.stroke();
                });

            // Construction line
            ctx.strokeStyle = 'rgba(17,110,147,0.25)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(prx, pry); ctx.stroke();

            drawArrow(ctx, ox, oy, p1x, p1y, '#116e93');
            drawArrow(ctx, ox, oy, p2x, p2y, '#e07b39');
            drawArrow(ctx, ox, oy, prx, pry, '#2a9d5c');

            drawHandle(ctx, p1x, p1y);
            drawHandle(ctx, p2x, p2y, '#e07b39');

            drawPill(ctx, pointLabel(z1.x, z1.y, bgMode), p1x, p1y - POINT_R - 14);
            drawPill(ctx, pointLabel(z2.x, z2.y, bgMode), p2x, p2y - POINT_R - 14, '#e07b39');

            const reLabel = pointLabel(res.x, res.y, bgMode, true);
            drawResultPill(ctx, reLabel, prx, pry);
            if (Math.abs(res.x) <= RANGE * 1.5 && Math.abs(res.y) <= RANGE * 1.5) {
                drawResultDot(ctx, prx, pry);
            }

            if (readout) readout.textContent = reLabel;
            try {
                canvas.dataset.blueAti = (z1.x === 0 && z1.y === 1 && z2.x === 0 && z2.y === 1) ? '1' : '0';
                if (window.checkISquaredReady) window.checkISquaredReady();
            } catch (e) { }
        }

        function update(e) {
            if (!dragging) return;
            const pos = getPos(e);
            let vx = Math.max(-RANGE, Math.min(RANGE, snap(toValueX(pos.x))));
            let vy = Math.max(-RANGE, Math.min(RANGE, snap(toValueY(pos.y))));

            const other = dragging === z1 ? z2 : z1;
            if (other.x === 0 && other.y === 0) {
                dragging.x = vx; dragging.y = vy; draw(); return;
            }

            const mag = Math.hypot(other.x, other.y);
            const ux = other.x / mag;
            const uy = other.y / mag;
            const L = RANGE / mag;

            // Rotate candidate into frame of 'other'
            let rx = vx * ux - vy * uy;
            let ry = vx * uy + vy * ux;

            // Clamp to square
            rx = Math.max(-L, Math.min(L, rx));
            ry = Math.max(-L, Math.min(L, ry));

            // Rotate back (conjugate)
            dragging.x = Math.max(-RANGE, Math.min(RANGE, snap(rx * ux + ry * uy)));
            dragging.y = Math.max(-RANGE, Math.min(RANGE, snap(ry * ux - rx * uy)));
            draw();
        }

        function tryStartDrag(e) {
            const pos = getPos(e);
            if (hitTest(pos, toPixelX, toPixelY, z1)) dragging = z1;
            else if (hitTest(pos, toPixelX, toPixelY, z2)) dragging = z2;
        }

        function resize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            draw();
        }

        attachDragListeners(canvas, {
            onDown: e => { tryStartDrag(e); },
            onMove: e => { update(e); },
            onUp: () => { dragging = null; }
        });

        bgToggle.addEventListener('click', () => {
            bgMode = bgMode === 'grid' ? 'polar' : 'grid';
            bgToggle.textContent = bgMode === 'grid' ? 'Switch to polar view' : 'Switch to cartesian view';
            draw();
        });

        window.addEventListener('resize', resize);
        resize();
    }

    // ─── EXPONENTIATION ───────────────────────────────────────────

    function initExponentiation(canvasId, readoutId, toggleBtnId, opLabelId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const readout = document.getElementById(readoutId);
        const toggleBtn = document.getElementById(toggleBtnId);
        const opLabel = document.getElementById(opLabelId);
        const getPos = makeGetPos(canvas);

        let bgMode = 'cartesian';
        let z1 = { x: 1, y: 2 };
        let z2 = { x: 2, y: 0 };
        let dragging = null;

        const scale = () => (canvas.width - 2 * (PAD + 20)) / (2 * RANGE);
        const toPixelX = v => canvas.width / 2 + v * scale();
        const toPixelY = v => canvas.height / 2 - v * scale();
        const toValueX = px => (px - canvas.width / 2) / scale();
        const toValueY = py => -(py - canvas.height / 2) / scale();

        const result = () => complexPow(z1, z2);
        const outputInRange = out => Math.hypot(out.x, out.y) <= RANGE;
        const isSafeCandidate = (c, cur) => cur === z1
            ? outputInRange(complexPow(c, z2))
            : outputInRange(complexPow(z1, c));

        function pointFromPolar(r, theta) {
            return { x: r * Math.cos(theta), y: r * Math.sin(theta) };
        }

        function clampToCircle(c) {
            const r = Math.hypot(c.x, c.y);
            return (r <= RANGE || r === 0) ? c : { x: c.x / r * RANGE, y: c.y / r * RANGE };
        }

        function safeBase(candidate, exponent) {
            if (outputInRange(complexPow(candidate, exponent))) return candidate;

            const angle = Math.atan2(candidate.y, candidate.x);
            const radius = Math.hypot(candidate.x, candidate.y);
            const clampR = r => pointFromPolar(Math.max(0, Math.min(RANGE, r)), angle);
            const clampA = a => pointFromPolar(Math.max(0, Math.min(RANGE, radius)), a);

            if (Math.abs(exponent.x) < 1e-8 && Math.abs(exponent.y) > 1e-8) {
                const threshold = -Math.log(RANGE) / exponent.y;
                if (exponent.y > 0 && threshold >= -Math.PI && angle < threshold) return clampA(threshold);
                if (exponent.y < 0 && threshold <= Math.PI && angle > threshold) return clampA(threshold);
                return clampR(radius);
            }

            if (exponent.x > 0) {
                let low = 0, high = radius, safe = clampR(0);
                for (let i = 0; i < 30; i++) {
                    const mid = (low + high) / 2, test = clampR(mid);
                    if (outputInRange(complexPow(test, exponent))) { safe = test; low = mid; }
                    else { high = mid; }
                }
                return safe;
            }

            let low = radius, high = Math.max(radius, RANGE), safe = clampR(radius);
            for (let i = 0; i < 30; i++) {
                const mid = (low + high) / 2, test = clampR(mid);
                if (outputInRange(complexPow(test, exponent))) { safe = test; high = mid; }
                else { low = mid; }
            }
            return safe;
        }

        function safeExponent(candidate, base) {
            if (outputInRange(complexPow(base, candidate))) return candidate;
            const clampF = t => ({ x: candidate.x * t, y: candidate.y * t });
            let low = 0, high = 1, safe = clampF(0);
            for (let i = 0; i < 30; i++) {
                const mid = (low + high) / 2, test = clampF(mid);
                if (outputInRange(complexPow(base, test))) { safe = test; low = mid; }
                else { high = mid; }
            }
            return safe;
        }

        function findNearestSafePoint(candidate, fixed, dragBase) {
            const isSafe = dragBase === z1
                ? c => outputInRange(complexPow(c, fixed))
                : c => outputInRange(complexPow(fixed, c));

            if (isSafe(candidate)) return candidate;

            const step = 0.1;
            for (let radius = step; radius <= RANGE * 2; radius += step) {
                let best = null;
                const minX = Math.max(-RANGE, candidate.x - radius);
                const maxX = Math.min(RANGE, candidate.x + radius);
                const minY = Math.max(-RANGE, candidate.y - radius);
                const maxY = Math.min(RANGE, candidate.y + radius);
                for (let xi = 0; xi <= Math.round((maxX - minX) / step); xi++) {
                    const x = Math.round((minX + xi * step) * 10) / 10;
                    for (let yi = 0; yi <= Math.round((maxY - minY) / step); yi++) {
                        const y = Math.round((minY + yi * step) * 10) / 10;
                        if (x * x + y * y > RANGE * RANGE + 1e-8) continue;
                        const dx = x - candidate.x, dy = y - candidate.y;
                        const dist2 = dx * dx + dy * dy;
                        if (dist2 > radius * radius + 1e-8) continue;
                        if (best && dist2 >= best.dist2) continue;
                        if (isSafe({ x, y })) best = { x, y, dist2 };
                    }
                }
                if (best) return { x: best.x, y: best.y };
            }
            return candidate;
        }

        function constrainPoint(pos, current, other) {
            const candidate = clampToCircle({
                x: Math.max(-RANGE, Math.min(RANGE, snap(toValueX(pos.x)))),
                y: Math.max(-RANGE, Math.min(RANGE, snap(toValueY(pos.y))))
            });
            return clampToCircle(findNearestSafePoint(candidate, other, current));
        }

        function drawBackground(ox, oy, w, h) {
            if (bgMode === 'cartesian') {
                drawCartesianGrid(ctx, toPixelX, toPixelY, w, h, PAD + 16);
                ctx.strokeStyle = 'rgba(17,110,147,0.2)';
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(ox, oy, RANGE * scale(), 0, Math.PI * 2); ctx.stroke();
            } else {
                drawPolarGrid(ctx, ox, oy, scale);
                ctx.strokeStyle = 'rgba(17,110,147,0.2)';
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(ox, oy, RANGE * scale(), 0, Math.PI * 2); ctx.stroke();
            }
        }

        function drawSafeRegion() {
            if (!dragging) return;
            const step = 0.12;
            const radius = step * scale();
            const offscreen = document.createElement('canvas');
            offscreen.width = canvas.width;
            offscreen.height = canvas.height;
            const offCtx = offscreen.getContext('2d');
            offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
            offCtx.fillStyle = dragging === z1 ? 'rgba(17,110,147,0.14)' : 'rgba(224,123,57,0.14)';

            for (let x = -RANGE; x <= RANGE; x += step) {
                for (let y = -RANGE; y <= RANGE; y += step) {
                    if (Math.hypot(x, y) > RANGE) continue;
                    if (isSafeCandidate({ x, y }, dragging)) {
                        offCtx.beginPath();
                        offCtx.arc(toPixelX(x), toPixelY(y), radius, 0, Math.PI * 2);
                        offCtx.fill();
                    }
                }
            }

            const blurred = document.createElement('canvas');
            blurred.width = offscreen.width; blurred.height = offscreen.height;
            const bCtx = blurred.getContext('2d');
            bCtx.filter = 'blur(10px)';
            bCtx.globalAlpha = 0.45;
            bCtx.drawImage(offscreen, 0, 0);

            ctx.save();
            ctx.globalAlpha = 0.55;
            ctx.drawImage(blurred, 0, 0);
            ctx.restore();
        }

        function draw() {
            const w = canvas.width, h = canvas.height;
            const ox = toPixelX(0), oy = toPixelY(0);
            ctx.clearRect(0, 0, w, h);

            drawBackground(ox, oy, w, h);
            drawSafeRegion();
            drawAxisTracks2D(ctx, w, h, ox, oy, PAD + 16);
            draw2DTicks(ctx, ox, oy, toPixelX, toPixelY);

            const res = result();
            const p1x = toPixelX(z1.x), p1y = toPixelY(z1.y);
            const p2x = toPixelX(z2.x), p2y = toPixelY(z2.y);
            const prx = toPixelX(res.x), pry = toPixelY(res.y);

            drawArrow(ctx, ox, oy, p1x, p1y, '#116e93');
            drawArrow(ctx, ox, oy, p2x, p2y, '#e07b39');
            drawArrow(ctx, ox, oy, prx, pry, '#2a9d5c');

            drawHandle(ctx, p1x, p1y);
            drawHandle(ctx, p2x, p2y, '#e07b39');

            drawPill(ctx, pointLabel(z1.x, z1.y, bgMode), p1x, p1y - POINT_R - 14);
            drawPill(ctx, pointLabel(z2.x, z2.y, bgMode), p2x, p2y - POINT_R - 14, '#e07b39');

            const reLabel = pointLabel(res.x, res.y, bgMode, true);
            drawResultPill(ctx, reLabel, prx, pry);
            if (Math.abs(res.x) <= RANGE * 1.5 && Math.abs(res.y) <= RANGE * 1.5) {
                drawResultDot(ctx, prx, pry);
            }

            if (readout) readout.textContent = `z\u2081^z\u2082 = ${reLabel}`;
        }

        function update(e) {
            if (!dragging) return;
            const constrained = constrainPoint(getPos(e), dragging, dragging === z1 ? z2 : z1);
            dragging.x = constrained.x;
            dragging.y = constrained.y;
            draw();
        }

        function tryStartDrag(e) {
            const pos = getPos(e);
            if (hitTest(pos, toPixelX, toPixelY, z1)) dragging = z1;
            else if (hitTest(pos, toPixelX, toPixelY, z2)) dragging = z2;
        }

        function resize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            draw();
        }

        attachDragListeners(canvas, {
            onDown: e => { tryStartDrag(e); },
            onMove: e => { update(e); },
            onUp: () => { dragging = null; draw(); }
        });

        toggleBtn.addEventListener('click', () => {
            bgMode = bgMode === 'cartesian' ? 'polar' : 'cartesian';
            opLabel.innerHTML = '<span class="var-z">z</span> = <span class="var-z1">z\u2081</span>^<span class="var-z2">z\u2082</span>';
            toggleBtn.textContent = bgMode === 'cartesian' ? 'Switch to polar view' : 'Switch to cartesian view';
            draw();
        });

        window.addEventListener('resize', resize);
        resize();
    }

    // ─── SCROLL-BASED CARD ANIMATIONS ─────────────────────────────

    const cardStart = () => window.innerHeight * 0.75;
    const cardEnd = () => window.innerHeight * 0.5;

    function animateSectionFromScroll(section, arrow) {
        if (!section) return;
        const top = section.getBoundingClientRect().top;
        const start = cardStart(), end = cardEnd();
        const progress = top <= end ? 1 : top >= start ? 0 : (start - top) / (start - end);
        const visible = Math.min(1, Math.max(0, progress)) > 0.5;
        section.classList.toggle('revealed', visible);
        if (arrow) arrow.style.opacity = visible ? 0 : 1;
    }

    const polarSection = document.getElementById('polar-section');
    const polarArrow = document.getElementById('polar-scroll-arrow');
    const multiplicationSection = document.getElementById('multiplication-section');
    const mulArrow = document.getElementById('mul-scroll-arrow');

    function handleCardScroll() {
        animateSectionFromScroll(polarSection, polarArrow);
        animateSectionFromScroll(multiplicationSection, mulArrow);
    }

    window.addEventListener('scroll', handleCardScroll, { passive: true });
    handleCardScroll();

    // ─── REVEAL BUTTON & i*i UI BINDINGS ──────────────────────────


    const btn = document.getElementById('multiplication-continue');
    const details = document.getElementById('multiplication-details');
    if (btn && details) {
        btn.addEventListener('click', function () {
            const collapsed = details.classList.contains('collapsed');
            details.classList.toggle('collapsed', !collapsed);
            details.setAttribute('aria-hidden', String(!collapsed));
            btn.setAttribute('aria-expanded', String(collapsed));
            const span = btn.querySelector('span');
            if (span) span.textContent = collapsed ? 'Hide Solution' : 'Reveal Solution';
        });
    }

    function checkISquaredReady() {
        try {
            const input = document.getElementById('i-squared-answer');
            const submit = document.getElementById('i-squared-submit');
            if (!input || !submit) return;
            input.disabled = false;
            submit.disabled = false;
            input.setAttribute('aria-disabled', 'false');
            input.placeholder = 'Enter the product';
        } catch (e) { }
    }

    function revealAnswerDependentContent() {
        document.querySelector('.foil-block.hidden-by-answer')?.classList.remove('hidden-by-answer');
        document.querySelector('#division-section.hidden-by-answer')?.classList.remove('hidden-by-answer');
    }

    const form = document.getElementById('i-squared-form');
    const input = document.getElementById('i-squared-answer');
    const submit = document.getElementById('i-squared-submit');
    const feedback = document.getElementById('i-squared-feedback');

    if (form && input && submit) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const val = input.value.trim();
            if (val === '-1' || val === '\u22121') {
                if (feedback) { feedback.textContent = 'Correct! i \u00d7 i = \u22121'; feedback.style.color = 'green'; }
                revealAnswerDependentContent();
            } else {
                if (feedback) { feedback.textContent = 'Not quite \u2014 try again.'; feedback.style.color = 'crimson'; }
            }
        });
    }

    window.checkISquaredReady = checkISquaredReady;

    // ─── INITIALISE ───────────────────────────────────────────────

    init1D('numberline-canvas');
    init2D('numberline2-canvas');
    initPolar('polar-canvas');
    initAddition('addition-canvas', 'addition-readout', 'op-toggle', 'op-label');
    initMultiplication('multiplication-canvas', 'multiplication-readout', 'mul-bg-toggle');
    heckISquaredReady();
    initExponentiation('exponentiation-canvas', 'exponentiation-readout', 'exp-toggle', 'exp-op-label');
});

