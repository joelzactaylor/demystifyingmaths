document.addEventListener('DOMContentLoaded', () => {

    const RANGE = 10;
    const POINT_R = 10;
    const PAD = POINT_R + 4;

    function snap(v) {
        return Math.round(Math.max(-RANGE, Math.min(RANGE, v)) * 10) / 10;
    }

    function fmt(v) {
        return v % 1 === 0 ? String(v) : v.toFixed(1);
    }

    function fmt2sf(v) {
        if (v === 0) return '0';
        const abs = Math.abs(v);
        if (abs < 0.1) {
            const s = v.toExponential(1).replace('e+', 'e');
            return s;
        }
        const rounded = Number(v.toPrecision(2));
        return String(rounded);
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
        const r = Math.hypot(vx, vy);
        const theta = Math.atan2(vy, vx);
        const rFmt = fmt(Math.round(r * 10) / 10);
        const thetaFmt = fmt(Math.round(theta * 100) / 100);
        return `${rFmt} cis ${thetaFmt}`;
    }

    function pointLabel(vx, vy, mode = 'cartesian', useSf = false) {
        if (mode === 'polar') {
            return polarLabel(vx, vy);
        }
        return useSf ? complexLabelSf(vx, vy) : complexLabel(vx, vy);
    }

    function imagLabel(value) {
        if (value === 1) return 'i';
        if (value === -1) return '-i';
        return `${value}i`;
    }

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
        const tw = ctx.measureText(text).width;
        const pillW = tw + 12;

        ctx.beginPath();
        ctx.roundRect(x - pillW / 2, y - 11, pillW, 22, 6);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.fillText(text, x, y);
    }

    // ─── 1D NUMBER LINE ───────────────────────────────────────────

    function init1D(canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');

        let value = 0;
        let dragging = false;

        function scale() {
            return (canvas.width - 2 * (PAD + 20)) / (2 * RANGE);
        }

        function toPixel(v) {
            return canvas.width / 2 + v * scale();
        }

        function toValue(px) {
            return (px - canvas.width / 2) / scale();
        }

        function draw() {
            const w = canvas.width, h = canvas.height;
            const cy = h / 2 + 20;
            ctx.clearRect(0, 0, w, h);

            // Track
            ctx.beginPath();
            ctx.roundRect(PAD - 4, cy - 4, w - 2 * (PAD - 4), 8, 4);
            ctx.fillStyle = 'rgba(17,110,147,0.18)';
            ctx.fill();

            const px = toPixel(value);

            // Ticks and labels
            ctx.font = '13px Aleo, serif';
            ctx.fillStyle = '#12435b';
            for (let i = -RANGE; i <= RANGE; i++) {
                const x = toPixel(i);
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

            // Zero line
            ctx.beginPath();
            ctx.moveTo(toPixel(0), cy - 14);
            ctx.lineTo(toPixel(0), cy + 14);
            ctx.strokeStyle = '#116e93';
            ctx.lineWidth = 2;
            ctx.stroke();

            drawHandle(ctx, px, cy);

            // Arrow shaft
            ctx.beginPath();
            ctx.moveTo(px, cy - POINT_R - 4);
            ctx.lineTo(px, cy - POINT_R - 16);
            ctx.strokeStyle = '#116e93';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Arrowhead
            ctx.beginPath();
            ctx.moveTo(px, cy - POINT_R - 4);
            ctx.lineTo(px - 4, cy - POINT_R - 12);
            ctx.lineTo(px + 4, cy - POINT_R - 12);
            ctx.closePath();
            ctx.fillStyle = '#116e93';
            ctx.fill();

            drawPill(ctx, fmt(value), px, cy - POINT_R - 28);
        }

        function getX(e) {
            const rect = canvas.getBoundingClientRect();
            return (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        }

        function update(px) {
            value = snap(toValue(px));
            draw();
        }

        function resize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            draw();
        }

        canvas.addEventListener('mousedown', e => { dragging = true; update(getX(e)); });
        canvas.addEventListener('mousemove', e => { if (dragging) update(getX(e)); });
        window.addEventListener('mouseup', () => dragging = false);
        canvas.addEventListener('touchstart', e => { e.preventDefault(); dragging = true; update(getX(e)); }, { passive: false });
        canvas.addEventListener('touchmove', e => { if (dragging) { e.preventDefault(); update(getX(e)); } }, { passive: false });
        window.addEventListener('touchend', () => dragging = false);
        window.addEventListener('resize', resize);
        resize();
    }

    // ─── 2D PLANE ─────────────────────────────────────────────────

    function init2D(canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');

        let vx = 0, vy = 0;
        let dragging = false;

        function scale() {
            return (canvas.width - 2 * (PAD + 40)) / (2 * RANGE);
        }

        function toPixelX(v) { return canvas.width / 2 + v * scale(); }
        function toPixelY(v) { return canvas.height / 2 - v * scale(); }
        function toValueX(px) { return (px - canvas.width / 2) / scale(); }
        function toValueY(py) { return -(py - canvas.height / 2) / scale(); }

        function draw() {
            const w = canvas.width, h = canvas.height;
            const cx = toPixelX(0), cy = toPixelY(0);
            ctx.clearRect(0, 0, w, h);

            // X axis track
            ctx.beginPath();
            ctx.roundRect(PAD - 4, cy - 4, w - 2 * (PAD - 4), 8, 4);
            ctx.fillStyle = 'rgba(17,110,147,0.18)';
            ctx.fill();

            // Ticks and labels
            ctx.font = '13px Aleo, serif';
            ctx.fillStyle = '#12435b';
            for (let i = -RANGE; i <= RANGE; i++) {
                const major = i % 5 === 0;
                const x = toPixelX(i);
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

            const px = toPixelX(vx), py = toPixelY(vy);

            // Dotted projection line to axis
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = 'rgba(17,110,147,0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px, cy);
            ctx.stroke();
            ctx.setLineDash([]);

            drawHandle(ctx, px, py);

            // Arrow shaft
            ctx.beginPath();
            ctx.moveTo(px, py - POINT_R - 4);
            ctx.lineTo(px, py - POINT_R - 16);
            ctx.strokeStyle = '#116e93';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Arrowhead
            ctx.beginPath();
            ctx.moveTo(px, py - POINT_R - 4);
            ctx.lineTo(px - 4, py - POINT_R - 12);
            ctx.lineTo(px + 4, py - POINT_R - 12);
            ctx.closePath();
            ctx.fillStyle = '#116e93';
            ctx.fill();

            // Pill label to the right
            const label = complexLabel(vx, vy);
            drawPill(ctx, label, px, py - POINT_R - 28)
            // mark whether this canvas's blue handle is at i (0,1)
            try { canvas.dataset.blueAti = (vx === 0 && vy === 1) ? '1' : '0'; if (window.checkISquaredReady) window.checkISquaredReady(); } catch (e) { }
        }

        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: (e.touches ? e.touches[0].clientX : e.clientX) - rect.left,
                y: (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
            };
        }

        function update(pos) {
            vx = snap(toValueX(pos.x));
            vy = snap(toValueY(pos.y));
            draw();
        }

        function resize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            draw();
        }

        canvas.addEventListener('mousedown', e => { dragging = true; update(getPos(e)); });
        window.addEventListener('mousemove', e => { if (dragging) update(getPos(e)); });
        window.addEventListener('mouseup', () => dragging = false);
        canvas.addEventListener('touchstart', e => { e.preventDefault(); dragging = true; update(getPos(e)); }, { passive: false });
        window.addEventListener('touchmove', e => { if (dragging) { e.preventDefault(); update(getPos(e)); } }, { passive: false });
        window.addEventListener('touchend', () => dragging = false);
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
            const root = getComputedStyle(document.documentElement);
            const val = parseFloat(root.getPropertyValue('--scale') || '1');
            return isNaN(val) || val <= 0 ? 1 : val;
        }

        function scale() {
            return (canvas.width - 2 * (PAD + 20)) / (2 * RANGE);
        }

        function toPixelX(v) { return canvas.width / 2 + v * scale(); }
        function toPixelY(v) { return canvas.height / 2 - v * scale(); }
        function toValueX(px) { return (px - canvas.width / 2) / scale(); }
        function toValueY(py) { return -(py - canvas.height / 2) / scale(); }

        function draw() {
            const w = canvas.width, h = canvas.height;
            const cx = toPixelX(0), cy = toPixelY(0);

            ctx.clearRect(0, 0, w, h);

            // Concentric circles
            ctx.strokeStyle = 'rgba(17,110,147,0.12)';
            ctx.lineWidth = 1;
            for (let ri = 2; ri <= RANGE; ri += 2) {
                ctx.beginPath();
                ctx.arc(cx, cy, ri * scale(), 0, Math.PI * 2);
                ctx.stroke();
            }

            // Radial lines
            ctx.strokeStyle = 'rgba(17,110,147,0.1)';
            for (let deg = 0; deg < 180; deg += 30) {
                const rad = deg * Math.PI / 180;
                ctx.beginPath();
                ctx.moveTo(
                    cx - Math.cos(rad) * RANGE * scale(),
                    cy + Math.sin(rad) * RANGE * scale()
                );
                ctx.lineTo(
                    cx + Math.cos(rad) * RANGE * scale(),
                    cy - Math.sin(rad) * RANGE * scale()
                );
                ctx.stroke();
            }

            // X-axis highlight
            ctx.beginPath();
            ctx.roundRect(PAD + 16, cy - 4, w - 2 * (PAD + 16), 8, 4);
            ctx.fillStyle = 'rgba(17,110,147,0.18)';
            ctx.fill();

            // Axis ticks and labels
            ctx.font = '13px Aleo, serif';
            ctx.fillStyle = '#12435b';
            for (let i = -RANGE; i <= RANGE; i++) {
                const major = i % 5 === 0;
                const x = toPixelX(i);
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

            // Handle position from (r, theta)
            const px = toPixelX(r * Math.cos(theta));
            const py = toPixelY(r * Math.sin(theta));

            // Arc showing theta
            ctx.beginPath();
            ctx.arc(cx, cy, 2 * scale(), 0, -theta, true);
            ctx.strokeStyle = 'rgba(17, 110, 147, 0.61)';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Ray line
            const lineAngle = theta;
            const edgeX = toPixelX(RANGE * Math.cos(lineAngle));
            const edgeY = toPixelY(RANGE * Math.sin(lineAngle));
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(edgeX, edgeY);
            ctx.strokeStyle = 'rgba(17, 110, 147, 0.26)';
            ctx.lineWidth = 6;
            ctx.stroke();

            // Dotted projection to x-axis
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = 'rgba(17,110,147,0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px, cy);
            ctx.stroke();
            ctx.setLineDash([]);

            // Handle
            drawHandle(ctx, px, py);

            // Little arrow above handle
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

            // Pill label: r cis θ
            const rFmt = fmt(Math.round(r * 10) / 10);
            const thetaFmt = fmt(Math.round(theta * 100) / 100);
            const polarLabel = rFmt + ' cis ' + thetaFmt;
            drawPill(ctx, polarLabel, px, py - POINT_R - 28);
        }

        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleFactor = currentPageScale();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            return {
                x: (clientX - rect.left) / scaleFactor,
                y: (clientY - rect.top) / scaleFactor
            };
        }

        function update(pos) {
            const vx = toValueX(pos.x);
            const vy = toValueY(pos.y);
            r = Math.min(RANGE, Math.sqrt(vx * vx + vy * vy));
            let raw = Math.atan2(vy, vx);
            theta = raw < 0 ? raw + 2 * Math.PI : raw;
            draw();
        }

        function resize() {
            const rect = canvas.getBoundingClientRect();
            const scaleFactor = currentPageScale();
            // Convert from scaled CSS pixels to logical canvas size
            canvas.width = rect.width / scaleFactor;
            canvas.height = rect.height / scaleFactor;
            draw();
        }

        canvas.addEventListener('mousedown', e => {
            dragging = true;
            update(getPos(e));
        });

        window.addEventListener('mousemove', e => {
            if (dragging) update(getPos(e));
        });

        window.addEventListener('mouseup', () => {
            dragging = false;
        });

        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            dragging = true;
            update(getPos(e));
        }, { passive: false });

        window.addEventListener('touchmove', e => {
            if (dragging) {
                e.preventDefault();
                update(getPos(e));
            }
        }, { passive: false });

        window.addEventListener('touchend', () => {
            dragging = false;
        });

        window.addEventListener('resize', resize);

        resize();
    }

    function initAddition(canvasId, readoutId, toggleBtnId, opLabelId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const readout = document.getElementById(readoutId);
        const toggleBtn = document.getElementById(toggleBtnId);
        const opLabel = document.getElementById(opLabelId);

        let op = 'add';
        let z1 = { x: 3, y: 2 };
        let z2 = { x: -1, y: 4 };
        let dragging = null;

        function scale() { return (canvas.width - 2 * (PAD + 20)) / (2 * RANGE); }
        function toPixelX(v) { return canvas.width / 2 + v * scale(); }
        function toPixelY(v) { return canvas.height / 2 - v * scale(); }
        function toValueX(px) { return (px - canvas.width / 2) / scale(); }
        function toValueY(py) { return -(py - canvas.height / 2) / scale(); }

        function result() {
            return op === 'add'
                ? { x: z1.x + z2.x, y: z1.y + z2.y }
                : { x: z1.x - z2.x, y: z1.y - z2.y };
        }

        function drawArrow(fromX, fromY, toX, toY, color) {
            const dx = toX - fromX;
            const dy = toY - fromY;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len < 1) return;
            const ux = dx / len, uy = dy / len;
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

        function draw() {
            const w = canvas.width, h = canvas.height;
            const ox = toPixelX(0), oy = toPixelY(0);
            ctx.clearRect(0, 0, w, h);

            // Grid lines
            ctx.strokeStyle = 'rgba(17,110,147,0.1)';
            ctx.lineWidth = 1;
            for (let i = -RANGE; i <= RANGE; i++) {
                if (i === 0) continue;
                const x = toPixelX(i);
                ctx.beginPath();
                ctx.moveTo(x, PAD + 16);
                ctx.lineTo(x, h - PAD - 16);
                ctx.stroke();
                const y = toPixelY(i);
                ctx.beginPath();
                ctx.moveTo(PAD + 16, y);
                ctx.lineTo(w - PAD - 16, y);
                ctx.stroke();
            }

            // X axis
            ctx.beginPath();
            ctx.roundRect(PAD + 16, oy - 4, w - 2 * (PAD + 16), 8, 4);
            ctx.fillStyle = 'rgba(17,110,147,0.18)';
            ctx.fill();

            // Y axis
            ctx.beginPath();
            ctx.roundRect(ox - 4, PAD + 16, 8, h - - 2 * (PAD + 16), 4);
            ctx.fillStyle = 'rgba(17,110,147,0.18)';
            ctx.fill();

            // Ticks
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

            const res = result();
            const p1x = toPixelX(z1.x), p1y = toPixelY(z1.y);
            const p2x = toPixelX(z2.x), p2y = toPixelY(z2.y);
            const prx = toPixelX(res.x), pry = toPixelY(res.y);

            // Parallelogram lines
            ctx.setLineDash([]);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#e07c3990'; ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(prx, pry); ctx.stroke();
            if (op === 'add') {
                ctx.strokeStyle = '#116e9390'; ctx.beginPath(); ctx.moveTo(p2x, p2y); ctx.lineTo(prx, pry); ctx.stroke();
            } else {
                ctx.strokeStyle = '#2a9d5c50'; ctx.beginPath(); ctx.moveTo(p2x, p2y); ctx.lineTo(p1x, p1y); ctx.stroke();
            }
            ctx.setLineDash([]);

            // Arrows from origin
            drawArrow(ox, oy, p1x, p1y, '#116e93');
            drawArrow(ox, oy, p2x, p2y, '#e07b39');
            drawArrow(ox, oy, prx, pry, '#2a9d5c');

            // Handles for z1 and z2
            drawHandle(ctx, p1x, p1y);
            drawHandle(ctx, p2x, p2y, '#e07b39');

            // Pills for z1 and z2
            drawPill(ctx, complexLabel(z1.x, z1.y), p1x, p1y - POINT_R - 14);
            drawPill(ctx, complexLabel(z2.x, z2.y), p2x, p2y - POINT_R - 14, '#e07b39');

            // Result pill in green
            ctx.font = 'bold 14px Aleo, serif';
            const rLabel = complexLabel(res.x, res.y);
            const tw = ctx.measureText(rLabel).width;
            ctx.beginPath();
            ctx.roundRect(prx - (tw + 12) / 2, pry - POINT_R - 25, tw + 12, 22, 6);
            ctx.fillStyle = '#2a9d5c';
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(rLabel, prx, pry - POINT_R - 14);

            // Result dot
            ctx.beginPath();
            ctx.arc(prx, pry, POINT_R - 2, 0, Math.PI * 2);
            ctx.fillStyle = '#2a9d5c';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(prx, pry, POINT_R - 5, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();

            if (readout) readout.textContent = complexLabel(res.x, res.y);
            try { canvas.dataset.blueAti = (z1.x === 0 && z1.y === 1 && z2.x === 0 && z2.y === 1) ? '1' : '0'; if (window.checkISquaredReady) window.checkISquaredReady(); } catch (e) { }
        }

        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: (e.touches ? e.touches.clientX : e.clientX) - rect.left,
                y: (e.touches ? e.touches.clientY : e.clientY) - rect.top
            };
        }

        function hitTest(pos, z) {
            const dx = pos.x - toPixelX(z.x);
            const dy = pos.y - toPixelY(z.y);
            return Math.sqrt(dx * dx + dy * dy) < POINT_R + 8;
        }

        function update(pos) {
            if (!dragging) return;
            const vx = snap(toValueX(pos.x));
            const vy = snap(toValueY(pos.y));

            // Temporarily apply the new position
            const other = dragging === z1 ? z2 : z1;
            let nx = Math.max(-RANGE, Math.min(RANGE, vx));
            let ny = Math.max(-RANGE, Math.min(RANGE, vy));

            // Clamp so result stays within RANGE
            if (op === 'add') {
                nx = Math.max(-RANGE - other.x, Math.min(RANGE - other.x, nx));
                ny = Math.max(-RANGE - other.y, Math.min(RANGE - other.y, ny));
            } else if (dragging === z1) {
                // z1 - z2 = result, so z1 = result + z2
                // result must stay in range, so z1 - z2 in [-RANGE, RANGE]
                nx = Math.max(-RANGE + other.x, Math.min(RANGE + other.x, nx));
                ny = Math.max(-RANGE + other.y, Math.min(RANGE + other.y, ny));
            } else {
                // dragging z2, z1 - z2 = result
                // z2 = z1 - result, result in [-RANGE, RANGE]
                nx = Math.max(z1.x - RANGE, Math.min(z1.x + RANGE, nx));
                ny = Math.max(z1.y - RANGE, Math.min(z1.y + RANGE, ny));
            }

            // Also clamp the point itself to the grid
            dragging.x = Math.max(-RANGE, Math.min(RANGE, snap(nx)));
            dragging.y = Math.max(-RANGE, Math.min(RANGE, snap(ny)));
            draw();
        }

        function resize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            draw();
        }

        canvas.addEventListener('mousedown', e => {
            const pos = getPos(e);
            if (hitTest(pos, z1)) dragging = z1;
            else if (hitTest(pos, z2)) dragging = z2;
        });
        window.addEventListener('mousemove', e => { if (dragging) update(getPos(e)); });
        window.addEventListener('mouseup', () => dragging = null);
        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            const pos = getPos(e);
            if (hitTest(pos, z1)) dragging = z1;
            else if (hitTest(pos, z2)) dragging = z2;
        }, { passive: false });
        window.addEventListener('touchmove', e => { if (dragging) { e.preventDefault(); update(getPos(e)); } }, { passive: false });
        window.addEventListener('touchend', () => dragging = null);

        function setOpLabel() {
            opLabel.innerHTML = op === 'add'
                ? '<span class="var-z">z</span> = <span class="var-z1">z₁</span> + <span class="var-z2">z₂</span>'
                : '<span class="var-z">z</span> = <span class="var-z1">z₁</span> − <span class="var-z2">z₂</span>';
        }

        toggleBtn.addEventListener('click', () => {
            op = op === 'add' ? 'sub' : 'add';
            setOpLabel();
            toggleBtn.textContent = op === 'add' ? 'Switch to −' : 'Switch to +';
            draw();
        });

        setOpLabel();
        window.addEventListener('resize', resize);
        resize();
    }

    function initMultiplication(canvasId, readoutId, bgToggleId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const readout = document.getElementById(readoutId);
        const bgToggle = document.getElementById(bgToggleId);

        let bgMode = 'grid';
        let z1 = { x: 2, y: 0 };
        let z2 = { x: 5, y: 0 };
        let dragging = null;
        const MARGIN = PAD + 48;

        function scale() { return (canvas.width - 2 * MARGIN) / (2 * RANGE); }
        function toPixelX(v) { return canvas.width / 2 + v * scale(); }
        function toPixelY(v) { return canvas.height / 2 - v * scale(); }
        function toValueX(px) { return (px - canvas.width / 2) / scale(); }
        function toValueY(py) { return -(py - canvas.height / 2) / scale(); }

        function multiply(a, b) {
            return {
                x: a.x * b.x - a.y * b.y,
                y: a.x * b.y + a.y * b.x
            };
        }

        function drawArrow(fromX, fromY, toX, toY, color) {
            const dx = toX - fromX;
            const dy = toY - fromY;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len < 1) return;
            const ux = dx / len, uy = dy / len;
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

        function drawBackground(ox, oy) {
            if (bgMode === 'grid') {
                ctx.strokeStyle = 'rgba(17,110,147,0.1)';
                ctx.lineWidth = 1;
                for (let i = -RANGE; i <= RANGE; i++) {
                    if (i === 0) continue;
                    const x = toPixelX(i);
                    ctx.beginPath(); ctx.moveTo(x, MARGIN); ctx.lineTo(x, canvas.height - MARGIN); ctx.stroke();
                    const y = toPixelY(i);
                    ctx.beginPath(); ctx.moveTo(MARGIN, y); ctx.lineTo(canvas.width - MARGIN, y); ctx.stroke();
                }
            } else {
                // Polar circles
                ctx.strokeStyle = 'rgba(17,110,147,0.12)';
                ctx.lineWidth = 1;
                for (let ri = 2; ri <= RANGE; ri += 2) {
                    ctx.beginPath();
                    ctx.arc(ox, oy, ri * scale(), 0, Math.PI * 2);
                    ctx.stroke();
                }
                // Radial lines every 30 degrees
                ctx.strokeStyle = 'rgba(17,110,147,0.1)';
                for (let deg = 0; deg < 180; deg += 30) {
                    const rad = deg * Math.PI / 180;
                    ctx.beginPath();
                    ctx.moveTo(ox - Math.cos(rad) * RANGE * scale(), oy + Math.sin(rad) * RANGE * scale());
                    ctx.lineTo(ox + Math.cos(rad) * RANGE * scale(), oy - Math.sin(rad) * RANGE * scale());
                    ctx.stroke();
                }
            }
        }

        function draw() {
            const w = canvas.width, h = canvas.height;
            const ox = toPixelX(0), oy = toPixelY(0);
            ctx.clearRect(0, 0, w, h);

            drawBackground(ox, oy);

            // X axis
            ctx.beginPath();
            ctx.roundRect(MARGIN, oy - 4, w - 2 * MARGIN, 8, 4);
            ctx.fillStyle = 'rgba(17,110,147,0.18)';
            ctx.fill();

            // Y axis
            ctx.beginPath();
            ctx.roundRect(ox - 4, MARGIN, 8, h - 2 * MARGIN, 4);
            ctx.fillStyle = 'rgba(17,110,147,0.18)';
            ctx.fill();

            // Ticks
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

            const res = multiply(z1, z2);
            const p1x = toPixelX(z1.x), p1y = toPixelY(z1.y);
            const p2x = toPixelX(z2.x), p2y = toPixelY(z2.y);
            const prx = toPixelX(res.x), pry = toPixelY(res.y);

            // Angle arcs
            const r1 = Math.sqrt(z1.x * z1.x + z1.y * z1.y);
            const r2 = Math.sqrt(z2.x * z2.x + z2.y * z2.y);
            const t1 = Math.atan2(z1.y, z1.x);
            const t2 = Math.atan2(z2.y, z2.x);
            const tr = t1 + t2;
            const arcR = 28;

            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#116e9370';
            ctx.beginPath(); ctx.arc(ox, oy, arcR, 0, -t1, true); ctx.stroke();
            ctx.strokeStyle = '#e07b3970';
            ctx.beginPath(); ctx.arc(ox, oy, arcR + 8, 0, -t2, true); ctx.stroke();
            ctx.strokeStyle = '#2a9d5c70';
            ctx.beginPath(); ctx.arc(ox, oy, arcR + 16, 0, -tr, true); ctx.stroke();

            // Dotted lines showing r1*r2 construction
            ctx.setLineDash([]);
            ctx.strokeStyle = 'rgba(17,110,147,0.25)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(prx, pry); ctx.stroke();
            ctx.setLineDash([]);

            // Arrows
            drawArrow(ox, oy, p1x, p1y, '#116e93');
            drawArrow(ox, oy, p2x, p2y, '#e07b39');
            drawArrow(ox, oy, prx, pry, '#2a9d5c');

            // Handles
            drawHandle(ctx, p1x, p1y);
            drawHandle(ctx, p2x, p2y, '#e07b39');

            // Pills
            drawPill(ctx, pointLabel(z1.x, z1.y, bgMode), p1x, p1y - POINT_R - 14);
            drawPill(ctx, pointLabel(z2.x, z2.y, bgMode), p2x, p2y - POINT_R - 14, '#e07b39');

            // Result pill
            const reLabel = pointLabel(res.x, res.y, bgMode, true);
            ctx.font = 'bold 14px Aleo, serif';
            const tw = ctx.measureText(reLabel).width;
            ctx.beginPath();
            ctx.roundRect(prx - (tw + 12) / 2, pry - POINT_R - 25, tw + 12, 22, 6);
            ctx.fillStyle = '#2a9d5c';
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(reLabel, prx, pry - POINT_R - 14);

            // Result dot if within range
            if (Math.abs(res.x) <= RANGE * 1.5 && Math.abs(res.y) <= RANGE * 1.5) {
                ctx.beginPath();
                ctx.arc(prx, pry, POINT_R - 2, 0, Math.PI * 2);
                ctx.fillStyle = '#2a9d5c';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(prx, pry, POINT_R - 5, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();
            }

            if (readout) readout.textContent = reLabel;
            try { canvas.dataset.blueAti = (z1.x === 0 && z1.y === 1 && z2.x === 0 && z2.y === 1) ? '1' : '0'; if (window.checkISquaredReady) window.checkISquaredReady(); } catch (e) { }
        }

        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: (e.touches ? e.touches.clientX : e.clientX) - rect.left,
                y: (e.touches ? e.touches.clientY : e.clientY) - rect.top
            };
        }

        function hitTest(pos, z) {
            const dx = pos.x - toPixelX(z.x);
            const dy = pos.y - toPixelY(z.y);
            return Math.sqrt(dx * dx + dy * dy) < POINT_R + 8;
        }

        function update(pos) {
            if (!dragging) return;

            // 1. Mouse → complex coords, snap, clamp to base grid
            let vx = snap(toValueX(pos.x));
            let vy = snap(toValueY(pos.y));
            vx = Math.max(-RANGE, Math.min(RANGE, vx));
            vy = Math.max(-RANGE, Math.min(RANGE, vy));

            // 2. Which factor is fixed?
            const other = (dragging === z1) ? z2 : z1;

            // If other is zero, no constraint
            if (other.x === 0 && other.y === 0) {
                dragging.x = vx;
                dragging.y = vy;
                draw();
                return;
            }

            const mag = Math.hypot(other.x, other.y);
            const ux = other.x / mag; // cos θ
            const uy = other.y / mag; // sin θ

            // NEW choice:
            // Use z_rot = z * u  (rotate by +θ), not conj(u)
            // (x + i y)(ux + i uy) = (x ux - y uy) + i (x uy + y ux)
            function rotateToFrame(px, py) {
                return {
                    x: px * ux - py * uy,
                    y: px * uy + py * ux
                };
            }

            // In that frame, other' = |other| * (cos 2θ + i sin 2θ),
            // but the constraint region we want is defined in terms of
            // result = z * other in the ORIGINAL axes.
            //
            // Geometrically, we still want a square in the z_rot plane
            // with half-side L, we just flip which way that square is
            // oriented relative to the original axes.

            const L = RANGE / mag;

            const candRot = rotateToFrame(vx, vy);
            let rx = candRot.x;
            let ry = candRot.y;

            // Clamp to square in this rotated frame
            if (rx > L) rx = L;
            if (rx < -L) rx = -L;
            if (ry > L) ry = L;
            if (ry < -L) ry = -L;

            // Inverse rotation = multiply by conj(u) this time:
            // (rx + i ry)(ux - i uy) = (rx ux + ry uy) + i (ry ux - rx uy)
            const bx = rx * ux + ry * uy;
            const by = ry * ux - rx * uy;

            const fx = snap(bx);
            const fy = snap(by);

            dragging.x = Math.max(-RANGE, Math.min(RANGE, fx));
            dragging.y = Math.max(-RANGE, Math.min(RANGE, fy));

            draw();
        }


        function resize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            draw();
        }

        canvas.addEventListener('mousedown', e => {
            const pos = getPos(e);
            if (hitTest(pos, z1)) dragging = z1;
            else if (hitTest(pos, z2)) dragging = z2;
        });
        window.addEventListener('mousemove', e => { if (dragging) update(getPos(e)); });
        window.addEventListener('mouseup', () => dragging = null);
        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            const pos = getPos(e);
            if (hitTest(pos, z1)) dragging = z1;
            else if (hitTest(pos, z2)) dragging = z2;
        }, { passive: false });
        window.addEventListener('touchmove', e => { if (dragging) { e.preventDefault(); update(getPos(e)); } }, { passive: false });
        window.addEventListener('touchend', () => dragging = null);

        bgToggle.addEventListener('click', () => {
            bgMode = bgMode === 'grid' ? 'polar' : 'grid';
            bgToggle.textContent = bgMode === 'grid' ? 'Switch to polar view' : 'Switch to cartesian view';
            draw();
        });

        window.addEventListener('resize', resize);
        resize();
    }

    function complexLog(z) {
        const r = Math.hypot(z.x, z.y);
        const theta = Math.atan2(z.y, z.x);
        return { x: Math.log(r === 0 ? 0 : r), y: theta };
    }

    function complexExp(z) {
        const expx = Math.exp(z.x);
        return {
            x: expx * Math.cos(z.y),
            y: expx * Math.sin(z.y)
        };
    }

    function complexPow(base, exponent) {
        if (base.x === 0 && base.y === 0) {
            return exponent.x === 0 && exponent.y === 0 ? { x: 1, y: 0 } : { x: 0, y: 0 };
        }
        const logBase = complexLog(base);
        const expArg = {
            x: exponent.x * logBase.x - exponent.y * logBase.y,
            y: exponent.x * logBase.y + exponent.y * logBase.x
        };
        return complexExp(expArg);
    }

    function initExponentiation(canvasId, readoutId, toggleBtnId, opLabelId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const readout = document.getElementById(readoutId);
        const toggleBtn = document.getElementById(toggleBtnId);
        const opLabel = document.getElementById(opLabelId);

        let bgMode = 'cartesian';
        let z1 = { x: 1, y: 2 };
        let z2 = { x: 2, y: 0 };
        let dragging = null;

        function isSafeCandidate(candidate, current) {
            return current === z1
                ? outputWithinRange(complexPow(candidate, z2))
                : outputWithinRange(complexPow(z1, candidate));
        }

        function scale() { return (canvas.width - 2 * (PAD + 20)) / (2 * RANGE); }
        function toPixelX(v) { return canvas.width / 2 + v * scale(); }
        function toPixelY(v) { return canvas.height / 2 - v * scale(); }
        function toValueX(px) { return (px - canvas.width / 2) / scale(); }
        function toValueY(py) { return -(py - canvas.height / 2) / scale(); }

        function result() {
            return complexPow(z1, z2);
        }

        function outputWithinRange(out) {
            return Math.hypot(out.x, out.y) <= RANGE;
        }

        function pointFromPolar(r, theta) {
            return { x: r * Math.cos(theta), y: r * Math.sin(theta) };
        }

        function safeBase(candidate, exponent) {
            if (outputWithinRange(complexPow(candidate, exponent))) {
                return candidate;
            }

            const angle = Math.atan2(candidate.y, candidate.x);
            const radius = Math.hypot(candidate.x, candidate.y);
            const clampRadius = r => pointFromPolar(Math.max(0, Math.min(RANGE, r)), angle);
            const clampAngle = a => pointFromPolar(Math.max(0, Math.min(RANGE, radius)), a);

            if (Math.abs(exponent.x) < 1e-8 && Math.abs(exponent.y) > 1e-8) {
                const threshold = -Math.log(RANGE) / exponent.y;
                if (exponent.y > 0 && threshold >= -Math.PI && angle < threshold) {
                    return clampAngle(threshold);
                }
                if (exponent.y < 0 && threshold <= Math.PI && angle > threshold) {
                    return clampAngle(threshold);
                }
                return clampRadius(radius);
            }

            if (exponent.x > 0) {
                let low = 0;
                let high = radius;
                let safe = clampRadius(0);
                for (let i = 0; i < 30; i++) {
                    const mid = (low + high) / 2;
                    const test = clampRadius(mid);
                    if (outputWithinRange(complexPow(test, exponent))) {
                        safe = test;
                        low = mid;
                    } else {
                        high = mid;
                    }
                }
                return safe;
            }

            let low = radius;
            let high = Math.max(radius, RANGE);
            let safe = clampRadius(radius);
            for (let i = 0; i < 30; i++) {
                const mid = (low + high) / 2;
                const test = clampRadius(mid);
                if (outputWithinRange(complexPow(test, exponent))) {
                    safe = test;
                    high = mid;
                } else {
                    low = mid;
                }
            }
            return safe;
        }

        function safeExponent(candidate, base) {
            if (outputWithinRange(complexPow(base, candidate))) {
                return candidate;
            }

            const clampFactor = t => ({ x: candidate.x * t, y: candidate.y * t });
            let low = 0;
            let high = 1;
            let safe = clampFactor(0);
            for (let i = 0; i < 30; i++) {
                const mid = (low + high) / 2;
                const test = clampFactor(mid);
                if (outputWithinRange(complexPow(base, test))) {
                    safe = test;
                    low = mid;
                } else {
                    high = mid;
                }
            }
            return safe;
        }

        function clampToCircle(candidate) {
            const r = Math.hypot(candidate.x, candidate.y);
            if (r <= RANGE || r === 0) return candidate;
            return {
                x: candidate.x / r * RANGE,
                y: candidate.y / r * RANGE
            };
        }

        function findNearestSafePoint(candidate, fixed, dragBase) {
            const isSafe = dragBase === z1
                ? c => outputWithinRange(complexPow(c, fixed))
                : c => outputWithinRange(complexPow(fixed, c));

            if (isSafe(candidate)) {
                return candidate;
            }

            const step = 0.1;
            for (let radius = step; radius <= RANGE * 2; radius += step) {
                let best = null;
                const minX = Math.max(-RANGE, candidate.x - radius);
                const maxX = Math.min(RANGE, candidate.x + radius);
                const minY = Math.max(-RANGE, candidate.y - radius);
                const maxY = Math.min(RANGE, candidate.y + radius);
                const xCount = Math.round((maxX - minX) / step);
                const yCount = Math.round((maxY - minY) / step);

                for (let xi = 0; xi <= xCount; xi++) {
                    const x = Math.round((minX + xi * step) * 10) / 10;
                    for (let yi = 0; yi <= yCount; yi++) {
                        const y = Math.round((minY + yi * step) * 10) / 10;
                        if (x * x + y * y > RANGE * RANGE + 1e-8) continue;
                        const dx = x - candidate.x;
                        const dy = y - candidate.y;
                        const dist2 = dx * dx + dy * dy;
                        if (dist2 > radius * radius + 1e-8) continue;
                        if (best && dist2 >= best.dist2) continue;
                        const point = { x, y };
                        if (isSafe(point)) {
                            best = { x, y, dist2 };
                        }
                    }
                }

                if (best) {
                    return { x: best.x, y: best.y };
                }
            }

            return candidate;
        }

        function safeInput(candidate, fixed, dragBase) {
            const safe = findNearestSafePoint(candidate, fixed, dragBase);
            return clampToCircle(safe);
        }

        function constrainPoint(pos, current, other) {
            const vx = snap(toValueX(pos.x));
            const vy = snap(toValueY(pos.y));
            const candidate = clampToCircle({
                x: Math.max(-RANGE, Math.min(RANGE, vx)),
                y: Math.max(-RANGE, Math.min(RANGE, vy))
            });
            if (current === z1) {
                return safeInput(candidate, z2, z1);
            }
            return safeInput(candidate, z1, z2);
        }

        function drawBackground(ox, oy, w, h) {
            if (bgMode === 'cartesian') {
                ctx.strokeStyle = 'rgba(17,110,147,0.1)';
                ctx.lineWidth = 1;
                for (let i = -RANGE; i <= RANGE; i++) {
                    if (i === 0) continue;
                    const x = toPixelX(i);
                    ctx.beginPath();
                    ctx.moveTo(x, PAD + 16);
                    ctx.lineTo(x, h - PAD - 16);
                    ctx.stroke();
                    const y = toPixelY(i);
                    ctx.beginPath();
                    ctx.moveTo(PAD + 16, y);
                    ctx.lineTo(w - PAD - 16, y);
                    ctx.stroke();
                }
                ctx.strokeStyle = 'rgba(17,110,147,0.2)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(ox, oy, RANGE * scale(), 0, Math.PI * 2);
                ctx.stroke();
            } else {
                ctx.strokeStyle = 'rgba(17,110,147,0.12)';
                ctx.lineWidth = 1;
                for (let ri = 2; ri <= RANGE; ri += 2) {
                    ctx.beginPath();
                    ctx.arc(ox, oy, ri * scale(), 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.strokeStyle = 'rgba(17,110,147,0.2)';
                ctx.beginPath();
                ctx.arc(ox, oy, RANGE * scale(), 0, Math.PI * 2);
                ctx.stroke();
                ctx.strokeStyle = 'rgba(17,110,147,0.1)';
                for (let deg = 0; deg < 180; deg += 30) {
                    const rad = deg * Math.PI / 180;
                    ctx.beginPath();
                    ctx.moveTo(ox - Math.cos(rad) * RANGE * scale(), oy + Math.sin(rad) * RANGE * scale());
                    ctx.lineTo(ox + Math.cos(rad) * RANGE * scale(), oy - Math.sin(rad) * RANGE * scale());
                    ctx.stroke();
                }
            }
        }

        function drawSafeRegion() {
            if (!dragging) return;
            const step = 0.12;
            const radius = step * scale() * 1.0;
            const offscreen = document.createElement('canvas');
            offscreen.width = canvas.width;
            offscreen.height = canvas.height;
            const offCtx = offscreen.getContext('2d');
            offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
            offCtx.fillStyle = dragging === z1 ? 'rgba(17,110,147,0.14)' : 'rgba(224,123,57,0.14)';
            offCtx.globalCompositeOperation = 'source-over';
            for (let x = -RANGE; x <= RANGE; x += step) {
                for (let y = -RANGE; y <= RANGE; y += step) {
                    if (Math.hypot(x, y) > RANGE) continue;
                    const candidate = { x, y };
                    if (isSafeCandidate(candidate, dragging)) {
                        const px = toPixelX(x);
                        const py = toPixelY(y);
                        offCtx.beginPath();
                        offCtx.arc(px, py, radius, 0, Math.PI * 2);
                        offCtx.fill();
                    }
                }
            }
            const blurred = document.createElement('canvas');
            blurred.width = offscreen.width;
            blurred.height = offscreen.height;
            const blurredCtx = blurred.getContext('2d');
            blurredCtx.clearRect(0, 0, blurred.width, blurred.height);
            blurredCtx.filter = 'blur(10px)';
            blurredCtx.globalAlpha = 0.45;
            blurredCtx.drawImage(offscreen, 0, 0);
            ctx.save();
            ctx.globalAlpha = 0.55;
            ctx.drawImage(blurred, 0, 0);
            ctx.restore();
        }

        function drawArrow(fromX, fromY, toX, toY, color) {
            const dx = toX - fromX;
            const dy = toY - fromY;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len < 1) return;
            const ux = dx / len, uy = dy / len;
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

        function draw() {
            const w = canvas.width, h = canvas.height;
            const ox = toPixelX(0), oy = toPixelY(0);
            ctx.clearRect(0, 0, w, h);

            drawBackground(ox, oy, w, h);
            drawSafeRegion();

            ctx.beginPath();
            ctx.roundRect(PAD + 16, oy - 4, w - 2 * (PAD + 16), 8, 4);
            ctx.fillStyle = 'rgba(17,110,147,0.18)';
            ctx.fill();

            ctx.beginPath();
            ctx.roundRect(ox - 4, PAD + 16, 8, h - 2 * (PAD + 16), 4, 4);
            ctx.fillStyle = 'rgba(17,110,147,0.18)';
            ctx.fill();

            ctx.font = '13px Aleo, serif';
            ctx.fillStyle = '#12435b';
            for (let i = -RANGE; i <= RANGE; i++) {
                if (i === 0) continue;
                const major = i % 5 === 0;
                const x = toPixelX(i);
                ctx.beginPath(); ctx.moveTo(x, oy - (major ? 8 : 4)); ctx.lineTo(x, oy + (major ? 8 : 4));
                ctx.strokeStyle = major ? '#116e93' : 'rgba(17,110,147,0.35)';
                ctx.lineWidth = major ? 2 : 1;
                ctx.stroke();
                if (major) {
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(i, x, oy + 10);
                }
                const y = toPixelY(i);
                ctx.beginPath(); ctx.moveTo(ox - (major ? 8 : 4), y); ctx.lineTo(ox + (major ? 8 : 4), y);
                ctx.strokeStyle = major ? '#116e93' : 'rgba(17,110,147,0.35)';
                ctx.lineWidth = major ? 2 : 1;
                ctx.stroke();
                if (major) {
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(imagLabel(i), ox - 12, y);
                }
            }

            const p1x = toPixelX(z1.x);
            const p1y = toPixelY(z1.y);
            const p2x = toPixelX(z2.x);
            const p2y = toPixelY(z2.y);
            const res = result();
            const prx = toPixelX(res.x);
            const pry = toPixelY(res.y);

            drawArrow(ox, oy, p1x, p1y, '#116e93');
            drawArrow(ox, oy, p2x, p2y, '#e07b39');
            drawArrow(ox, oy, prx, pry, '#2a9d5c');

            drawHandle(ctx, p1x, p1y);
            drawHandle(ctx, p2x, p2y, '#e07b39');

            drawPill(ctx, pointLabel(z1.x, z1.y, bgMode), p1x, p1y - POINT_R - 14);
            drawPill(ctx, pointLabel(z2.x, z2.y, bgMode), p2x, p2y - POINT_R - 14, '#e07b39');

            ctx.font = 'bold 14px Aleo, serif';
            const reLabel = pointLabel(res.x, res.y, bgMode, true);
            const tw = ctx.measureText(reLabel).width;
            ctx.beginPath();
            ctx.roundRect(prx - (tw + 12) / 2, pry - POINT_R - 25, tw + 12, 22, 6);
            ctx.fillStyle = '#2a9d5c';
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(reLabel, prx, pry - POINT_R - 14);

            if (Math.abs(res.x) <= RANGE * 1.5 && Math.abs(res.y) <= RANGE * 1.5) {
                ctx.beginPath();
                ctx.arc(prx, pry, POINT_R - 2, 0, Math.PI * 2);
                ctx.fillStyle = '#2a9d5c';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(prx, pry, POINT_R - 5, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();
            }

            if (readout) {
                readout.textContent = `z₁^z₂ = ${reLabel}`;
            }
        }

        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: (e.touches ? e.touches.clientX : e.clientX) - rect.left,
                y: (e.touches ? e.touches.clientY : e.clientY) - rect.top
            };
        }

        function hitTest(pos, z) {
            const dx = pos.x - toPixelX(z.x);
            const dy = pos.y - toPixelY(z.y);
            return Math.sqrt(dx * dx + dy * dy) < POINT_R + 8;
        }

        function update(pos) {
            if (!dragging) return;
            const constrained = constrainPoint(pos, dragging, dragging === z1 ? z2 : z1);
            dragging.x = constrained.x;
            dragging.y = constrained.y;
            draw();
        }

        function resize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            draw();
        }

        canvas.addEventListener('mousedown', e => {
            const pos = getPos(e);
            if (hitTest(pos, z1)) dragging = z1;
            else if (hitTest(pos, z2)) dragging = z2;
        });
        window.addEventListener('mousemove', e => { if (dragging) update(getPos(e)); });
        window.addEventListener('mouseup', () => { dragging = null; draw(); });
        canvas.addEventListener('touchstart', e => { e.preventDefault(); const pos = getPos(e); if (hitTest(pos, z1)) dragging = z1; else if (hitTest(pos, z2)) dragging = z2; }, { passive: false });
        window.addEventListener('touchmove', e => { if (dragging) { e.preventDefault(); update(getPos(e)); } }, { passive: false });
        window.addEventListener('touchend', () => { dragging = null; draw(); });

        toggleBtn.addEventListener('click', () => {
            bgMode = bgMode === 'cartesian' ? 'polar' : 'cartesian';
            opLabel.innerHTML = '<span class="var-z">z</span> = <span class="var-z1">z₁</span>^<span class="var-z2">z₂</span>';
            toggleBtn.textContent = bgMode === 'cartesian' ? 'Switch to polar view' : 'Switch to cartesian view';
            draw();
        });

        window.addEventListener('resize', resize);
        resize();
    }

    // ─── SCROLL-BASED CARD ANIMATIONS ───────────────────────────────────────────────

    const polarSection = document.getElementById('polar-section');
    const polarArrow = document.getElementById('polar-scroll-arrow');
    const nextSection = document.getElementById('addition-section');
    const multiplicationSection = document.getElementById('multiplication-section');
    const divisionSection = document.getElementById('division-section');
    const mulArrow = document.getElementById('mul-scroll-arrow');

    const cardStart = () => window.innerHeight * 0.75;
    const cardEnd = () => window.innerHeight * 0.5;

    const animatePolarFromScroll = () => {
        if (!polarSection) return;

        const currentSectionTop = polarSection.getBoundingClientRect().top;
        const start = cardStart();
        const end = cardEnd();

        let progress;

        if (currentSectionTop <= end) {
            progress = 1;
        } else if (currentSectionTop >= start) {
            progress = 0;
        } else {
            progress = (start - currentSectionTop) / (start - end);
        }

        const clamped = Math.min(1, Math.max(0, progress));
        const isVisibleEnough = clamped > 0.5; // adjust threshold as needed

        if (isVisibleEnough) {
            polarSection.classList.add('revealed');
        } else {
            polarSection.classList.remove('revealed');
        }

        if (polarArrow) {
            // optional hint behaviour
            polarArrow.style.opacity = isVisibleEnough ? 0 : 1;
        }
    };

    const animateMultiplicationFromScroll = () => {
        if (!multiplicationSection) return;

        const currentSectionTop = multiplicationSection.getBoundingClientRect().top;
        const start = cardStart();
        const end = cardEnd();

        let progress;

        if (currentSectionTop <= end) {
            progress = 1;
        } else if (currentSectionTop >= start) {
            progress = 0;
        } else {
            progress = (start - currentSectionTop) / (start - end);
        }

        const clamped = Math.min(1, Math.max(0, progress));
        const isVisibleEnough = clamped > 0.5; // adjust threshold as needed

        if (isVisibleEnough) {
            multiplicationSection.classList.add('revealed');
        } else {
            multiplicationSection.classList.remove('revealed');
        }

        if (mulArrow) {
            mulArrow.style.opacity = 1 - clamped;
        }
    };

    const handleCardScroll = () => {
        animatePolarFromScroll();
        animateMultiplicationFromScroll();
    };

    window.addEventListener('scroll', handleCardScroll, { passive: true });
    animatePolarFromScroll();
    animateMultiplicationFromScroll();

    // ─── INITIALISE ───────────────────────────────────────────────

    init1D('numberline-canvas');
    init2D('numberline2-canvas');
    initPolar('polar-canvas');
    initAddition('addition-canvas', 'addition-readout', 'op-toggle', 'op-label');
    initMultiplication('multiplication-canvas', 'multiplication-readout', 'mul-bg-toggle');
    initExponentiation('exponentiation-canvas', 'exponentiation-readout', 'exp-toggle', 'exp-op-label');


});

// --- Moved from pages/complexNumbers.html: Reveal button and i*i UI bindings ---
document.addEventListener('DOMContentLoaded', function () {
    // Reveal toggle for multiplication explanation
    const btn = document.getElementById('multiplication-continue');
    const details = document.getElementById('multiplication-details');
    if (btn && details) {
        btn.addEventListener('click', function () {
            const isCollapsed = details.classList.contains('collapsed');
            if (isCollapsed) {
                details.classList.remove('collapsed');
                details.setAttribute('aria-hidden', 'false');
                btn.setAttribute('aria-expanded', 'true');
                const span = btn.querySelector('span');
                if (span) span.textContent = 'Hide Solution';
            } else {
                details.classList.add('collapsed');
                details.setAttribute('aria-hidden', 'true');
                btn.setAttribute('aria-expanded', 'false');
                const span = btn.querySelector('span');
                if (span) span.textContent = 'Reveal Solution';
            }
        });
    }

    // UI for i * i task — enable only when both handles on the multiplication canvas are at i
    function checkISquaredReady() {
        try {
            const canvas = document.getElementById('multiplication-canvas');
            const input = document.getElementById('i-squared-answer');
            const submit = document.getElementById('i-squared-submit');
            const feedback = document.getElementById('i-squared-feedback');
            if (!canvas || !input || !submit) return;
            const ready = canvas.dataset && canvas.dataset.blueAti === '1';
            if (ready) {
                input.disabled = false;
                input.setAttribute('aria-disabled', 'false');
                input.placeholder = 'Enter the product';
                submit.disabled = false;
                if (feedback) feedback.textContent = '';
            } else {
                input.disabled = true;
                input.setAttribute('aria-disabled', 'true');
                input.placeholder = 'Enter the product (adjust the dots first)';
                submit.disabled = true;
            }
        } catch (e) { /* ignore */ }
    }

    const form = document.getElementById('i-squared-form');
    const input = document.getElementById('i-squared-answer');
    const submit = document.getElementById('i-squared-submit');
    const feedback = document.getElementById('i-squared-feedback');
    function revealAnswerDependentContent() {
        const foil = document.querySelector('.foil-block.hidden-by-answer');
        const division = document.querySelector('#division-section.hidden-by-answer');
        if (foil) foil.classList.remove('hidden-by-answer');
        if (division) division.classList.remove('hidden-by-answer');
    }

    if (form && input && submit) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const val = input.value.trim();
            if (val === '-1' || val === '−1') {
                if (feedback) {
                    feedback.textContent = 'Correct! i × i = −1';
                    feedback.style.color = 'green';
                }
                revealAnswerDependentContent();
            } else {
                if (feedback) {
                    feedback.textContent = 'Not quite — try again.';
                    feedback.style.color = 'crimson';
                }
            }
        });
    }

    // expose check function to canvases
    window.checkISquaredReady = checkISquaredReady;
    // initial check
    checkISquaredReady();
});