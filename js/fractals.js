document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // BROWNIAN TREE
    // ============================================================

    const btCanvas = document.getElementById("brownian-canvas");
    const btCtx = btCanvas.getContext("2d", { alpha: false });
    const btBtn = document.getElementById("brownian-toggle");
    const btResetBtn = document.getElementById("brownian-reset");
    const btStatus = document.getElementById("brownian-status");

    const BT_W = btCanvas.width, BT_H = btCanvas.height;
    const maxParticles = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 1200 : 1800;
    const stepSize = 1;
    const stickRadius = 2;
    const spawnPad = 18;
    const particlesPerFrame = 6;

    const btOff = document.createElement("canvas");
    btOff.width = BT_W;
    btOff.height = BT_H;
    const btOffCtx = btOff.getContext("2d", { alpha: false });

    const btView = {
        scale: 1, targetScale: 1,
        cx: 0, cy: 0,
        targetCx: 0, targetCy: 0
    };

    let btRunning = false;
    let btPoints = [];
    let btBounds = null;
    let btDirty = true;

    function btReset() {
        btPoints = [{ x: 0, y: 0 }];
        btBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
        btView.cx = btView.cy = btView.targetCx = btView.targetCy = 0;
        btView.scale = btView.targetScale = 1;
        btDirty = true;
        btRunning = false;
        btBtn.textContent = "Start";
    }

    function btUpdateBounds(x, y) {
        if (x < btBounds.minX) btBounds.minX = x;
        if (x > btBounds.maxX) btBounds.maxX = x;
        if (y < btBounds.minY) btBounds.minY = y;
        if (y > btBounds.maxY) btBounds.maxY = y;
    }

    function btRandomOnCircle(r) {
        const a = Math.random() * Math.PI * 2;
        return { x: Math.cos(a) * r, y: Math.sin(a) * r };
    }

    function btCurrentRadius() {
        const rx = Math.max(Math.abs(btBounds.minX), Math.abs(btBounds.maxX));
        const ry = Math.max(Math.abs(btBounds.minY), Math.abs(btBounds.maxY));
        return Math.max(rx, ry);
    }

    function dist2(ax, ay, bx, by) {
        const dx = ax - bx, dy = ay - by;
        return dx * dx + dy * dy;
    }

    function btAdjacent(x, y) {
        const rr = stickRadius * stickRadius;
        for (let i = 0; i < btPoints.length; i++) {
            if (dist2(x, y, btPoints[i].x, btPoints[i].y) <= rr) return true;
        }
        return false;
    }

    function btGrowOne() {
        const r = btCurrentRadius() + spawnPad;
        let p = btRandomOnCircle(r);
        let tries = 0;
        const killR = Math.max(r * 1.5, 40);

        while (tries++ < 20000) {
            const ang = Math.random() * Math.PI * 2;
            p.x += Math.cos(ang) * stepSize;
            p.y += Math.sin(ang) * stepSize;

            if (dist2(p.x, p.y, 0, 0) > killR * killR) {
                p = btRandomOnCircle(r);
                continue;
            }

            if (btAdjacent(p.x, p.y)) {
                btPoints.push({ x: p.x, y: p.y });
                btUpdateBounds(p.x, p.y);
                return true;
            }
        }
        return false;
    }

    function btUpdateViewTarget() {
        const pad = 34;
        const bw = Math.max(1, btBounds.maxX - btBounds.minX);
        const bh = Math.max(1, btBounds.maxY - btBounds.minY);
        const rawScale = Math.min((BT_W - pad * 2) / bw, (BT_H - pad * 2) / bh);
        btView.targetScale = Math.max(0.22, Math.min(4.5, rawScale));
        btView.targetCx = (btBounds.minX + btBounds.maxX) / 2;
        btView.targetCy = (btBounds.minY + btBounds.maxY) / 2;
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function btRender() {
        btView.cx = lerp(btView.cx, btView.targetCx, 0.08);
        btView.cy = lerp(btView.cy, btView.targetCy, 0.08);
        btView.scale = lerp(btView.scale, btView.targetScale, 0.08);

        if (btDirty) {
            btOffCtx.setTransform(1, 0, 0, 1, 0, 0);
            btOffCtx.fillStyle = "#06080c";
            btOffCtx.fillRect(0, 0, BT_W, BT_H);

            btOffCtx.save();
            btOffCtx.translate(BT_W / 2, BT_H / 2);
            btOffCtx.scale(btView.scale, btView.scale);
            btOffCtx.translate(-btView.cx, -btView.cy);

            const s = Math.max(1, Math.round(1.0 / btView.scale));
            for (let i = 0; i < btPoints.length; i++) {
                const t = i / Math.max(1, maxParticles - 1);
                btOffCtx.fillStyle = `hsl(${180 + 120 * t} 90% ${58 - 10 * t}%)`;
                const x = Math.round(btPoints[i].x);
                const y = Math.round(btPoints[i].y);
                btOffCtx.fillRect(x, y, s, s);
            }

            btOffCtx.restore();
            btDirty = false;
        }

        btCtx.drawImage(btOff, 0, 0);
        btStatus.textContent = `${btPoints.length} / ${maxParticles} (max) particles`;
    }

    function btTick() {
        if (btRunning) {
            let grew = false;
            for (let i = 0; i < particlesPerFrame && btPoints.length < maxParticles; i++) {
                grew = btGrowOne() || grew;
            }
            if (grew) {
                btUpdateViewTarget();
                btDirty = true;
            }
            if (btPoints.length >= maxParticles) {
                btRunning = false;
                btBtn.textContent = "Start";
            }
        }

        btRender();
        requestAnimationFrame(btTick);
    }

    btBtn.addEventListener("click", () => {
        if (!btPoints.length) btReset();
        btRunning = !btRunning;
        btBtn.textContent = btRunning ? "Stop" : "Start";
    });

    btResetBtn.addEventListener("click", () => {
        btReset();
        btDirty = true;
    });

    btReset();
    btUpdateViewTarget();
    btTick();


    // ============================================================
    // NUMBER LINE — x(n+1) = x(n)^2
    // ============================================================

    const nlCanvas = document.getElementById('nl-canvas');
    const nlCtx = nlCanvas.getContext('2d');

    const NL_W = nlCanvas.width;
    const NL_H = nlCanvas.height;

    const NL_MIN = -5, NL_MAX = 5;
    const AXIS_Y = NL_H * 0.72;
    const PAD = 60;
    const LINE_W = NL_W - PAD * 2;
    const MAX_ITERS = 12;
    const ESCAPE = 50;

    let nlX0 = -1.01;
    let nlDragging = false;

    function nlToCanvas(x) {
        return PAD + ((x - NL_MIN) / (NL_MAX - NL_MIN)) * LINE_W;
    }

    function nlToWorld(cx) {
        return NL_MIN + ((cx - PAD) / LINE_W) * (NL_MAX - NL_MIN);
    }

    function nlDraw() {
        nlCtx.clearRect(0, 0, NL_W, NL_H);

        nlCtx.fillStyle = '#e1eaf6';
        nlCtx.fillRect(0, 0, NL_W, NL_H);

        // axis line
        nlCtx.strokeStyle = '#4b5563';
        nlCtx.lineWidth = 2;
        nlCtx.beginPath();
        nlCtx.moveTo(PAD, AXIS_Y);
        nlCtx.lineTo(NL_W - PAD, AXIS_Y);
        nlCtx.stroke();

        // ticks and labels
        nlCtx.font = '15px system-ui, sans-serif';
        nlCtx.textAlign = 'center';
        nlCtx.textBaseline = 'top';

        for (let x = NL_MIN; x <= NL_MAX; x++) {
            const cx = nlToCanvas(x);
            nlCtx.strokeStyle = '#4b5563';
            nlCtx.lineWidth = x === 0 ? 2 : 1;
            nlCtx.beginPath();
            nlCtx.moveTo(cx, AXIS_Y - 7);
            nlCtx.lineTo(cx, AXIS_Y + 7);
            nlCtx.stroke();
            nlCtx.fillStyle = x === 0 ? '#e5e7eb' : '#6b7280';
            nlCtx.fillText(x, cx, AXIS_Y + 12);
        }

        // build sequence
        const seq = [nlX0];
        let cur = nlX0;
        for (let i = 0; i < MAX_ITERS; i++) {
            const next = cur * cur;
            seq.push(next);
            if (Math.abs(next) > ESCAPE) break;
            cur = next;
        }

        // draw arcs
        for (let i = 0; i < seq.length - 1; i++) {
            const a = seq[i];
            const b = seq[i + 1];

            const ca = nlToCanvas(a);
            const cb = nlToCanvas(b);

            const mx = (ca + cb) / 2;
            const radius = Math.abs(cb - ca) / 2;
            if (radius < 0.5) continue;

            const t = i / Math.max(1, seq.length - 2);
            const hue = 190 + 100 * t;
            const alpha = 1 - 0.55 * t;

            nlCtx.strokeStyle = `hsla(${hue}, 85%, 62%, ${alpha})`;
            nlCtx.lineWidth = Math.max(1, 2.5 - i * 0.18);
            nlCtx.beginPath();
            nlCtx.arc(mx, AXIS_Y, radius, Math.PI, 0, false);
            nlCtx.stroke();

            const dotX = nlToCanvas(b);
            nlCtx.fillStyle = `hsla(${hue}, 85%, 68%, ${alpha})`;
            nlCtx.beginPath();
            nlCtx.arc(dotX, AXIS_Y, 3.5, 0, Math.PI * 2);
            nlCtx.fill();
        }

        // draggable point
        const px = nlToCanvas(nlX0);
        nlCtx.fillStyle = '#f8fafc';
        nlCtx.beginPath();
        nlCtx.arc(px, AXIS_Y, 8, 0, Math.PI * 2);
        nlCtx.fill();
        nlCtx.strokeStyle = '#60a5fa';
        nlCtx.lineWidth = 2.5;
        nlCtx.stroke();
    }

    function nlGetCanvasX(e) {
        const rect = nlCanvas.getBoundingClientRect();
        const scaleX = NL_W / rect.width;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        return (clientX - rect.left) * scaleX;
    }

    function nlOnDown(e) {
        const cx = nlGetCanvasX(e);
        const px = nlToCanvas(nlX0);
        if (Math.abs(cx - px) < 20) {
            nlDragging = true;
            e.preventDefault();
        }
    }

    function nlOnMove(e) {
        if (!nlDragging) return;
        e.preventDefault();
        const cx = nlGetCanvasX(e);
        nlX0 = Math.max(NL_MIN, Math.min(NL_MAX, nlToWorld(cx)));
        nlDraw();
    }

    function nlOnUp() {
        nlDragging = false;
    }

    nlCanvas.addEventListener('mousedown', nlOnDown);
    nlCanvas.addEventListener('mousemove', nlOnMove);
    nlCanvas.addEventListener('mouseup', nlOnUp);
    nlCanvas.addEventListener('mouseleave', nlOnUp);
    nlCanvas.addEventListener('touchstart', nlOnDown, { passive: false });
    nlCanvas.addEventListener('touchmove', nlOnMove, { passive: false });
    nlCanvas.addEventListener('touchend', nlOnUp);

    nlDraw();

});