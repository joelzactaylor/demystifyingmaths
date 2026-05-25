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

    // Generic sequence generator: returns array of iterates starting from `initial`
    function generateSequence(initial, iterateFn, escapeFn, maxIters) {
        const seq = [initial];
        let cur = initial;
        for (let i = 0; i < maxIters; i++) {
            const next = iterateFn(cur);
            seq.push(next);
            if (escapeFn && escapeFn(next)) break;
            cur = next;
        }
        return seq;
    }

    // Generic draggable helper: getWorldFromEvent returns a world-space value (number or object)
    // getWorldFromEvent will be called as getWorldFromEvent(event, dragging)
    function makeDraggable(canvas, getWorldFromEvent, onUpdate) {
        let dragging = false;

        function onDown(e) {
            const pos = getWorldFromEvent(e, false);
            if (pos === null) return;
            dragging = true;
            e.preventDefault();
        }

        function onMove(e) {
            if (!dragging) return;
            e.preventDefault();
            const pos = getWorldFromEvent(e, true);
            if (pos === null) return;
            onUpdate(pos);
        }

        function onUp() {
            dragging = false;
        }

        canvas.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('mouseleave', onUp);
        // Bind touchstart to the canvas only so we don't intercept touches
        // intended for page scrolling elsewhere on mobile.
        canvas.addEventListener('touchstart', onDown, { passive: false });
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onUp);

        return { destroy: () => { /* noop for now */ } };
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
    const MAX_ITERS = 64;
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
            nlCtx.fillStyle = '#6b7280';
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

    // Reuse draggable helper for numberline: interpret pointer events into a world X coordinate
    makeDraggable(nlCanvas, (e, dragging) => {
        const rect = nlCanvas.getBoundingClientRect();
        const scaleX = NL_W / rect.width;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let cx = (clientX - rect.left) * scaleX;
        // clamp to canvas drawable area (respect PAD)
        cx = Math.max(PAD, Math.min(NL_W - PAD, cx));
        const px = nlToCanvas(nlX0);
        if (dragging) {
            return Math.max(NL_MIN, Math.min(NL_MAX, nlToWorld(cx)));
        }
        if (Math.abs(cx - px) < 20 || e.type === 'touchstart') {
            return Math.max(NL_MIN, Math.min(NL_MAX, nlToWorld(cx)));
        }
        return null;
    }, (val) => {
        nlX0 = val;
        nlDraw();
    });

    function createCustomDropdown(select) {
        const wrapper = select.closest('.sequence-quiz__item');
        if (!wrapper) return;

        let dropdown = null;

        const closeDropdown = () => {
            if (!dropdown) return;
            dropdown.remove();
            dropdown = null;
            document.removeEventListener('mousedown', onOutsidePointerDown);
            document.removeEventListener('keydown', onDropdownKeyDown);
        };

        const openDropdown = () => {
            if (dropdown) return;
            dropdown = document.createElement('div');
            dropdown.className = 'custom-dropdown-list';

            const rect = select.getBoundingClientRect();
            dropdown.style.left = `${rect.left}px`;
            dropdown.style.top = `${rect.bottom + 8}px`;
            dropdown.style.width = `${rect.width}px`;

            select.querySelectorAll('option').forEach((option) => {
                if (!option.value) {
                    return;
                }

                const optionNode = document.createElement('div');
                optionNode.className = 'custom-dropdown-option';
                optionNode.textContent = option.textContent;
                optionNode.dataset.value = option.value;
                optionNode.setAttribute('role', 'option');

                if (select.value === option.value) {
                    optionNode.setAttribute('aria-selected', 'true');
                }

                optionNode.addEventListener('click', () => {
                    if (select.value !== option.value) {
                        select.value = option.value;
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    closeDropdown();
                });

                dropdown.appendChild(optionNode);
            });

            document.body.appendChild(dropdown);
            document.addEventListener('mousedown', onOutsidePointerDown);
            document.addEventListener('keydown', onDropdownKeyDown);
        };

        const onOutsidePointerDown = (event) => {
            if (dropdown && dropdown.contains(event.target)) {
                return;
            }
            if (!wrapper.contains(event.target)) {
                closeDropdown();
            }
        };

        const onDropdownKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeDropdown();
                select.focus();
            }
        };

        select.addEventListener('mousedown', (event) => {
            event.preventDefault();
            openDropdown();
        });

        select.addEventListener('touchstart', (event) => {
            event.preventDefault();
            openDropdown();
        }, { passive: false });

        select.addEventListener('keydown', (event) => {
            if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
                event.preventDefault();
                openDropdown();
            }
        });
    }

    function setupSequenceQuiz() {
        const answerMap = {
            'quiz-1': 'diverges',
            'quiz-2': 'converges',
            'quiz-3': 'diverges',
            'quiz-4': 'converges',
            'quiz-5': 'diverges'
        };
        const choices = ['', 'converges', 'diverges'];

        Object.keys(answerMap).forEach((id) => {
            const select = document.getElementById(id);
            if (!select) return;
            select.innerHTML = choices.map(value => {
                const label = value || '';
                return `<option value="${value}">${label}</option>`;
            }).join('');

            select.addEventListener('change', () => {
                const item = select.closest('.sequence-quiz__item');
                if (!item) return;
                item.classList.remove('correct', 'incorrect');
                if (!select.value) return;
                item.classList.add(select.value === answerMap[id] ? 'correct' : 'incorrect');
            });

            createCustomDropdown(select);
        });
    }

    setupSequenceQuiz();

    nlDraw();

    // ============================================================
    // COMPLEX PLANE — z(n+1) = z(n)^2
    // ============================================================

    const cpCanvas = document.getElementById('cp-canvas');
    if (cpCanvas) {
        const cpCtx = cpCanvas.getContext('2d');
        const CP_W = cpCanvas.width;
        const CP_H = cpCanvas.height;
        const CP_MIN = -2.0, CP_MAX = 2.0;
        const CP_PAD = 60;
        const CP_WW = CP_W - CP_PAD * 2;
        const CP_HH = CP_H - CP_PAD * 2;

        let cpZ0 = { x: -1.01, y: 0.3 };

        function cpToCanvas(pt) {
            const cx = CP_PAD + ((pt.x - CP_MIN) / (CP_MAX - CP_MIN)) * CP_WW;
            const cy = CP_PAD + ((CP_MAX - pt.y) / (CP_MAX - CP_MIN)) * CP_HH;
            return { x: cx, y: cy };
        }

        function canvasToCp(clientX, clientY) {
            const rect = cpCanvas.getBoundingClientRect();
            const scaleX = CP_W / rect.width;
            const scaleY = CP_H / rect.height;
            const cx = (clientX - rect.left) * scaleX;
            const cy = (clientY - rect.top) * scaleY;
            const x = CP_MIN + ((cx - CP_PAD) / CP_WW) * (CP_MAX - CP_MIN);
            const y = CP_MAX - ((cy - CP_PAD) / CP_HH) * (CP_MAX - CP_MIN);
            return { x, y };
        }

        function cpIterate(z) {
            return { x: z.x * z.x - z.y * z.y, y: 2 * z.x * z.y };
        }

        function cpEscape(z) {
            return (z.x * z.x + z.y * z.y) > (ESCAPE * ESCAPE);
        }

        function cpDraw() {
            cpCtx.clearRect(0, 0, CP_W, CP_H);

            // draw unit circle and highlight region (inside/outside) with 10% peach
            const origin = cpToCanvas({ x: 0, y: 0 });
            const unitPt = cpToCanvas({ x: 1, y: 0 });
            const unitRadius = Math.abs(unitPt.x - origin.x);
            const inside = (cpZ0.x * cpZ0.x + cpZ0.y * cpZ0.y) <= 1;
            const peach = 'rgba(255,203,164,0.10)';
            if (inside) {
                cpCtx.beginPath();
                cpCtx.arc(origin.x, origin.y, unitRadius, 0, Math.PI * 2);
                cpCtx.fillStyle = peach;
                cpCtx.fill();
            } else {
                // Fill the canvas but punch out the unit circle using even-odd winding where supported.
                cpCtx.beginPath();
                cpCtx.rect(0, 0, CP_W, CP_H);
                cpCtx.arc(origin.x, origin.y, unitRadius, 0, Math.PI * 2);
                cpCtx.closePath();
                cpCtx.fillStyle = peach;
                try {
                    cpCtx.fill('evenodd');
                } catch (err) {
                    // Fallback for browsers that don't support the fill winding argument
                    cpCtx.save();
                    cpCtx.fillStyle = peach;
                    cpCtx.fillRect(0, 0, CP_W, CP_H);
                    cpCtx.globalCompositeOperation = 'destination-out';
                    cpCtx.beginPath();
                    cpCtx.arc(origin.x, origin.y, unitRadius, 0, Math.PI * 2);
                    cpCtx.fill();
                    cpCtx.restore();
                }
            }

            // faint unit circle outline
            cpCtx.beginPath();
            cpCtx.arc(origin.x, origin.y, unitRadius, 0, Math.PI * 2);
            cpCtx.strokeStyle = 'rgba(107,114,128,0.45)';
            cpCtx.lineWidth = 1.2;
            cpCtx.stroke();

            // axes
            cpCtx.strokeStyle = '#6b7280';
            cpCtx.lineWidth = 1;
            cpCtx.beginPath();
            cpCtx.moveTo(CP_PAD, origin.y);
            cpCtx.lineTo(CP_W - CP_PAD, origin.y);
            cpCtx.moveTo(origin.x, CP_PAD);
            cpCtx.lineTo(origin.x, CP_H - CP_PAD);
            cpCtx.stroke();

            // ticks
            cpCtx.font = '13px system-ui, sans-serif';
            cpCtx.textAlign = 'center';
            cpCtx.textBaseline = 'top';
            for (let v = Math.ceil(CP_MIN); v <= Math.floor(CP_MAX); v++) {
                const px = cpToCanvas({ x: v, y: 0 }).x;
                const py = cpToCanvas({ x: 0, y: v }).y;
                cpCtx.fillStyle = '#6b7280';
                cpCtx.fillText(v, px, origin.y + 6);
                cpCtx.fillText(v + 'i', origin.x + 6, py - 6);
            }

            // build sequence (reuse generator)
            const seq = generateSequence(cpZ0, cpIterate, cpEscape, MAX_ITERS);

            // draw connecting lines and dots
            for (let i = 0; i < seq.length - 1; i++) {
                const a = seq[i];
                const b = seq[i + 1];
                const ca = cpToCanvas(a);
                const cb = cpToCanvas(b);

                const t = i / Math.max(1, seq.length - 2);
                const hue = 200 + 80 * t;
                const alpha = 1 - 0.6 * t;

                // line
                cpCtx.strokeStyle = `hsla(${hue}, 85%, 50%, ${alpha})`;
                cpCtx.lineWidth = Math.max(1, 3 - i * 0.25);
                cpCtx.beginPath();
                cpCtx.moveTo(ca.x, ca.y);
                cpCtx.lineTo(cb.x, cb.y);
                cpCtx.stroke();

                // dot at b
                cpCtx.fillStyle = `hsla(${hue}, 85%, 62%, ${alpha})`;
                cpCtx.beginPath();
                const r = Math.max(2.6, 6 - i * 0.5);
                cpCtx.arc(cb.x, cb.y, r, 0, Math.PI * 2);
                cpCtx.fill();
            }

            // draggable initial point
            const p0 = cpToCanvas(cpZ0);
            cpCtx.fillStyle = '#ffffff';
            cpCtx.beginPath();
            cpCtx.arc(p0.x, p0.y, 8, 0, Math.PI * 2);
            cpCtx.fill();
            cpCtx.strokeStyle = '#60a5fa';
            cpCtx.lineWidth = 2.5;
            cpCtx.stroke();
        }

        // draggable support for complex plane: start only when near initial point
        makeDraggable(cpCanvas, (e, dragging) => {
            const rect = cpCanvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            // clamp client coordinates to the canvas drawable area (respect CP_PAD)
            const scaleX = CP_W / rect.width;
            const scaleY = CP_H / rect.height;
            let cx = (clientX - rect.left) * scaleX;
            let cy = (clientY - rect.top) * scaleY;
            cx = Math.max(CP_PAD, Math.min(CP_W - CP_PAD, cx));
            cy = Math.max(CP_PAD, Math.min(CP_H - CP_PAD, cy));
            // convert clamped canvas coords (cx,cy) to world complex coords
            const wx = CP_MIN + ((cx - CP_PAD) / CP_WW) * (CP_MAX - CP_MIN);
            const wy = CP_MAX - ((cy - CP_PAD) / CP_HH) * (CP_MAX - CP_MIN);
            const world = { x: wx, y: wy };
            const p = cpToCanvas(cpZ0);
            const dx = cx - p.x, dy = cy - p.y;
            if (dragging) {
                return world;
            }
            if (Math.sqrt(dx * dx + dy * dy) < 18 || e.type === 'touchstart') {
                return world;
            }
            return null;
        }, (val) => {
            cpZ0 = val;
            cpDraw();
        });

        cpDraw();
    }

    // ============================================================
    // COMPLEX PLANE 2 — z(n+1) = z(n)^2 + c
    // ============================================================

    const cp2Canvas = document.getElementById('cp-canvas2');
    if (cp2Canvas) {
        const cp2Ctx = cp2Canvas.getContext('2d');
        const CP2_W = cp2Canvas.width;
        const CP2_H = cp2Canvas.height;
        const CP2_MIN = -2.0, CP2_MAX = 2.0;
        const CP2_PAD = 60;
        const CP2_WW = CP2_W - CP2_PAD * 2;
        const CP2_HH = CP2_H - CP2_PAD * 2;

        let cp2C = { x: 0, y: 0 };
        let cp2Z0 = { x: 0.15, y: 0.95 };
        let cp2Dragging = null;

        function cp2ToCanvas(pt) {
            return {
                x: CP2_PAD + ((pt.x - CP2_MIN) / (CP2_MAX - CP2_MIN)) * CP2_WW,
                y: CP2_PAD + ((CP2_MAX - pt.y) / (CP2_MAX - CP2_MIN)) * CP2_HH
            };
        }

        function cp2CanvasToWorld(cx, cy) {
            return {
                x: CP2_MIN + ((cx - CP2_PAD) / CP2_WW) * (CP2_MAX - CP2_MIN),
                y: CP2_MAX - ((cy - CP2_PAD) / CP2_HH) * (CP2_MAX - CP2_MIN)
            };
        }

        function cp2GetCanvasXY(e) {
            const rect = cp2Canvas.getBoundingClientRect();
            const scaleX = CP2_W / rect.width;
            const scaleY = CP2_H / rect.height;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        }

        function cp2ClampCanvas(cx, cy) {
            return {
                x: Math.max(CP2_PAD, Math.min(CP2_W - CP2_PAD, cx)),
                y: Math.max(CP2_PAD, Math.min(CP2_H - CP2_PAD, cy))
            };
        }

        function cp2Iterate(z) {
            return {
                x: z.x * z.x - z.y * z.y + cp2C.x,
                y: 2 * z.x * z.y + cp2C.y
            };
        }

        function cp2Escape(z) {
            return (z.x * z.x + z.y * z.y) > (ESCAPE * ESCAPE);
        }

        function cp2DotDist(canvasPt, worldPt) {
            const p = cp2ToCanvas(worldPt);
            const dx = canvasPt.x - p.x;
            const dy = canvasPt.y - p.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        function cp2DrawDot(pt, strokeColor, label, options = {}) {
            const p = cp2ToCanvas(pt);
            const radius = options.fixed ? 6 : 8;
            cp2Ctx.fillStyle = options.fixed ? '#f8fafc' : '#ffffff';
            cp2Ctx.beginPath();
            cp2Ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            cp2Ctx.fill();
            cp2Ctx.strokeStyle = options.fixed ? 'rgba(148,161,178,0.95)' : strokeColor;
            cp2Ctx.lineWidth = options.fixed ? 1.8 : 2.5;
            cp2Ctx.stroke();

            if (label) {
                cp2Ctx.fillStyle = strokeColor;
                cp2Ctx.font = 'bold 13px system-ui, sans-serif';
                cp2Ctx.textAlign = 'center';
                cp2Ctx.textBaseline = 'top';
                cp2Ctx.fillText(label, p.x, p.y + 11);
            }
        }

        function cp2Draw() {
            cp2Ctx.clearRect(0, 0, CP2_W, CP2_H);

            const origin = cp2ToCanvas({ x: 0, y: 0 });
            const unitPt = cp2ToCanvas({ x: 1, y: 0 });
            const unitRadius = Math.abs(unitPt.x - origin.x);
            const peach = 'rgba(255,203,164,0.10)';
            const shouldDrawUnitCircle = !activeOverlay;

            if (shouldDrawUnitCircle) {
                const inside = (cp2Z0.x * cp2Z0.x + cp2Z0.y * cp2Z0.y) <= 1;
                if (inside) {
                    cp2Ctx.beginPath();
                    cp2Ctx.arc(origin.x, origin.y, unitRadius, 0, Math.PI * 2);
                    cp2Ctx.fillStyle = peach;
                    cp2Ctx.fill();
                } else {
                    cp2Ctx.beginPath();
                    cp2Ctx.rect(0, 0, CP2_W, CP2_H);
                    cp2Ctx.arc(origin.x, origin.y, unitRadius, 0, Math.PI * 2);
                    cp2Ctx.closePath();
                    cp2Ctx.fillStyle = peach;
                    try {
                        cp2Ctx.fill('evenodd');
                    } catch (_) {
                        cp2Ctx.save();
                        cp2Ctx.fillStyle = peach;
                        cp2Ctx.fillRect(0, 0, CP2_W, CP2_H);
                        cp2Ctx.globalCompositeOperation = 'destination-out';
                        cp2Ctx.beginPath();
                        cp2Ctx.arc(origin.x, origin.y, unitRadius, 0, Math.PI * 2);
                        cp2Ctx.fill();
                        cp2Ctx.restore();
                    }
                }

                cp2Ctx.beginPath();
                cp2Ctx.arc(origin.x, origin.y, unitRadius, 0, Math.PI * 2);
                cp2Ctx.strokeStyle = 'rgba(107,114,128,0.45)';
                cp2Ctx.lineWidth = 1.2;
                cp2Ctx.stroke();
            }

            cp2Ctx.strokeStyle = '#6b7280';
            cp2Ctx.lineWidth = 1;
            cp2Ctx.beginPath();
            cp2Ctx.moveTo(CP2_PAD, origin.y);
            cp2Ctx.lineTo(CP2_W - CP2_PAD, origin.y);
            cp2Ctx.moveTo(origin.x, CP2_PAD);
            cp2Ctx.lineTo(origin.x, CP2_H - CP2_PAD);
            cp2Ctx.stroke();

            cp2Ctx.font = '13px system-ui, sans-serif';
            cp2Ctx.textAlign = 'center';
            cp2Ctx.textBaseline = 'top';
            for (let v = Math.ceil(CP2_MIN); v <= Math.floor(CP2_MAX); v++) {
                const px = cp2ToCanvas({ x: v, y: 0 }).x;
                const py = cp2ToCanvas({ x: 0, y: v }).y;
                cp2Ctx.fillStyle = '#6b7280';
                cp2Ctx.fillText(v, px, origin.y + 6);
                cp2Ctx.fillText(v + 'i', origin.x + 6, py - 6);
            }

            const seq = generateSequence(cp2Z0, cp2Iterate, cp2Escape, MAX_ITERS);

            for (let i = 0; i < seq.length - 1; i++) {
                const ca = cp2ToCanvas(seq[i]);
                const cb = cp2ToCanvas(seq[i + 1]);
                const t = i / Math.max(1, seq.length - 2);
                const hue = 200 + 80 * t;
                const alpha = 1 - 0.6 * t;

                cp2Ctx.strokeStyle = `hsla(${hue}, 85%, 50%, ${alpha})`;
                cp2Ctx.lineWidth = Math.max(1, 3 - i * 0.25);
                cp2Ctx.beginPath();
                cp2Ctx.moveTo(ca.x, ca.y);
                cp2Ctx.lineTo(cb.x, cb.y);
                cp2Ctx.stroke();

                cp2Ctx.fillStyle = `hsla(${hue}, 85%, 62%, ${alpha})`;
                cp2Ctx.beginPath();
                cp2Ctx.arc(cb.x, cb.y, Math.max(2.6, 6 - i * 0.5), 0, Math.PI * 2);
                cp2Ctx.fill();
            }

            const isMandZ0Locked = activeOverlay === 'mandelbrot';
            cp2DrawDot(cp2Z0, '#60a5fa', isMandZ0Locked ? '' : 'z₀', { fixed: isMandZ0Locked });
            cp2DrawDot(cp2C, '#fb923c', 'c', { fixed: false });
        }

        function cp2OnDown(e) {
            const raw = cp2GetCanvasXY(e);
            const dZ0 = cp2DotDist(raw, cp2Z0);
            const dC = cp2DotDist(raw, cp2C);
            const HIT = 20;
            if (activeOverlay === 'mandelbrot') {
                if (dC < HIT) {
                    cp2Dragging = 'c';
                    e.preventDefault();
                }
                return;
            }
            if (dZ0 < HIT || dC < HIT) {
                cp2Dragging = dZ0 <= dC ? 'z0' : 'c';
                e.preventDefault();
            }
        }

        function cp2OnMove(e) {
            if (!cp2Dragging) return;
            e.preventDefault();
            const raw = cp2GetCanvasXY(e);
            const clamped = cp2ClampCanvas(raw.x, raw.y);
            const world = cp2CanvasToWorld(clamped.x, clamped.y);
            if (cp2Dragging === 'z0') {
                cp2Z0 = world;
            } else {
                cp2C = world;
            }
            cp2Draw();
            requestOverlayUpdateIfActive();
        }

        function cp2OnUp() {
            cp2Dragging = null;
        }

        cp2Canvas.addEventListener('mousedown', cp2OnDown);
        cp2Canvas.addEventListener('mousemove', cp2OnMove);
        cp2Canvas.addEventListener('mouseup', cp2OnUp);
        cp2Canvas.addEventListener('mouseleave', cp2OnUp);
        cp2Canvas.addEventListener('touchstart', cp2OnDown, { passive: false });
        cp2Canvas.addEventListener('touchmove', cp2OnMove, { passive: false });
        cp2Canvas.addEventListener('touchend', cp2OnUp);

        const overlayButtons = {
            mandelbrot: document.getElementById('mandelbrot-overlay-button'),
            julia: document.getElementById('julia-overlay-button'),
            variant: document.getElementById('mandelbrot-variant-overlay-button')
        };

        const overlayCache = new Map();
        const overlayRequests = new Map();
        let overlayWorker = null;
        let activeOverlay = null;
        let activeBucket = null;
        const dpr = Math.max(1, window.devicePixelRatio || 1);

        const overlayCanvases = {
            mandelbrot: createFractalOverlayCanvas('mandelbrot'),
            julia: createFractalOverlayCanvas('julia'),
            variant: createFractalOverlayCanvas('variant')
        };

        function createFractalOverlayCanvas(name) {
            const canvas = document.createElement('canvas');
            canvas.className = 'fractal-overlay-canvas hidden';
            canvas.dataset.overlay = name;
            resizeOverlayCanvas(canvas);
            cp2Canvas.parentElement.appendChild(canvas);
            return canvas;
        }

        function resizeOverlayCanvas(canvas) {
            canvas.width = cp2Canvas.width;
            canvas.height = cp2Canvas.height;
            canvas.style.width = cp2Canvas.offsetWidth + 'px';
            canvas.style.height = cp2Canvas.offsetHeight + 'px';
            canvas.style.top = cp2Canvas.offsetTop + 'px';   // accounts for container padding
            canvas.style.left = cp2Canvas.offsetLeft + 'px';
        }

        function computeOverlayBucket(overlayType, fixedPoint) {
            const quantize = (value, step) => Math.round(value / step) * step;
            const viewKey = [quantize(CP2_MIN, 0.04), quantize(CP2_MAX, 0.04),
            quantize(CP2_MIN, 0.04), quantize(CP2_MAX, 0.04)].join(',');
            const fixedStep = overlayType === 'mandelbrot' ? 1 : 0.02;
            const fixedKey = [quantize(fixedPoint.x, fixedStep).toFixed(3),
            quantize(fixedPoint.y, fixedStep).toFixed(3)].join(',');
            return `${overlayType}|view=${viewKey}|fixed=${fixedKey}`;
        }

        function getOverlayFixedPoint(overlayType) {
            if (overlayType === 'julia') return cp2C;
            if (overlayType === 'variant') return cp2Z0;
            return cp2C;
        }

        function getOverlayRelevantPoint(overlayType) {
            if (overlayType === 'mandelbrot') return cp2C;
            if (overlayType === 'julia') return cp2Z0;
            return cp2C;
        }

        function cp2TestPointInside(overlayType, point, iterations, fixedOverride) {
            const escapeRadius2 = 16;
            const fc = fixedOverride || {};
            let zx, zy, cx, cy;
            if (overlayType === 'mandelbrot') {
                zx = 0; zy = 0; cx = point.x; cy = point.y;
            } else if (overlayType === 'julia') {
                zx = point.x; zy = point.y;
                cx = fc.x ?? cp2C.x; cy = fc.y ?? cp2C.y;
            } else {
                cx = point.x; cy = point.y;
                zx = fc.x ?? cp2Z0.x; zy = fc.y ?? cp2Z0.y;
            }
            let r2 = zx * zx + zy * zy;
            let iter = 0;
            while (iter < iterations && r2 < escapeRadius2) {
                const nx = zx * zx - zy * zy + cx;
                zy = 2 * zx * zy + cy;
                zx = nx;
                r2 = zx * zx + zy * zy;
                iter++;
            }
            return iter >= iterations;
        }

        function ensureOverlayWorker() {
            if (overlayWorker) return;
            overlayWorker = new Worker('../js/fractal-overlay-worker.js', { type: 'module' });
            overlayWorker.addEventListener('message', (event) => {
                const data = event.data;
                if (data?.type !== 'tile') return;
                if (data.generation !== overlayGeneration) {
                    overlayRequests.delete(data.bucketKey);
                    return;  // stale — discard
                }

                overlayCache.set(data.bucketKey, {
                    maskBitmap: data.maskBitmap,
                    boundaryBitmap: data.boundaryBitmap,
                    overlayType: data.overlayType
                });
                overlayRequests.delete(data.bucketKey);
                if (data.bucketKey === activeBucket) {
                    const relevantPoint = getOverlayRelevantPoint(data.overlayType);
                    const insidePoint = cp2TestPointInside(data.overlayType, relevantPoint, 64);
                    drawOverlayBitmap(data.maskBitmap, data.boundaryBitmap, insidePoint, data.overlayType);
                }
            });
        }

        let overlayGeneration = 0;

        function queueOverlayRender(overlayType, fixedPoint, bucketKey) {
            if (overlayRequests.has(bucketKey)) return;
            overlayRequests.set(bucketKey, { overlayType });
            ensureOverlayWorker();

            const renderW = Math.round(cp2Canvas.width);
            const renderH = Math.round(cp2Canvas.height);
            const pixelPad = CP2_PAD;
            const pixelWW = renderW - pixelPad * 2;
            const pixelHH = renderH - pixelPad * 2;
            const range = CP2_MAX - CP2_MIN;

            const extMinX = CP2_MIN - (pixelPad / pixelWW) * range;
            const extMaxX = CP2_MAX + (pixelPad / pixelWW) * range;
            const extMinY = CP2_MIN - (pixelPad / pixelHH) * range;
            const extMaxY = CP2_MAX + (pixelPad / pixelHH) * range;

            const generation = ++overlayGeneration;
            overlayWorker.postMessage({
                type: 'render',
                requestId: bucketKey,
                bucketKey,
                overlayType,
                width: renderW,
                height: renderH,
                viewport: { minX: extMinX, maxX: extMaxX, minY: extMinY, maxY: extMaxY },
                fixed: fixedPoint,
                generation,
                iterations: 64
            });
        }

        function maybeDrawCached(bucketKey, overlayType, insidePoint) {
            const cacheEntry = overlayCache.get(bucketKey);
            if (cacheEntry && overlayType === cacheEntry.overlayType) {
                drawOverlayBitmap(cacheEntry.maskBitmap, cacheEntry.boundaryBitmap, insidePoint, overlayType);
                return true;
            }
            return false;
        }

        function drawOverlayBitmap(maskBitmap, boundaryBitmap, insidePoint, overlayType) {
            const canvas = overlayCanvases[overlayType];
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            ctx.fillStyle = 'rgba(255,203,164,0.10)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (insidePoint) {
                ctx.globalCompositeOperation = 'destination-in';
                ctx.drawImage(maskBitmap, 0, 0);
            } else {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.drawImage(maskBitmap, 0, 0);
            }
            ctx.restore();

            ctx.globalAlpha = 1;
            ctx.drawImage(boundaryBitmap, 0, 0);
        }

        let overlayRafPending = false;
        function requestOverlayUpdateIfActive() {
            if (overlayRafPending) return;
            overlayRafPending = true;
            requestAnimationFrame(() => {
                overlayRafPending = false;
                _doOverlayUpdate();
            });
        }
        function _doOverlayUpdate() {
            if (!activeOverlay) return;
            const fixedPoint = getOverlayFixedPoint(activeOverlay);

            const quantize = (value, step) => Math.round(value / step) * step;
            const fixedStep = activeOverlay === 'mandelbrot' ? 1 : 0.02;
            const quantizedFixed = {
                x: quantize(fixedPoint.x, fixedStep),
                y: quantize(fixedPoint.y, fixedStep)
            };

            const relevantPoint = getOverlayRelevantPoint(activeOverlay);
            const insidePoint = cp2TestPointInside(activeOverlay, relevantPoint, 64, quantizedFixed);
            const bucketKey = computeOverlayBucket(activeOverlay, fixedPoint);
            const cached = overlayCache.get(bucketKey);

            activeBucket = bucketKey;
            if (cached) {
                drawOverlayBitmap(cached.maskBitmap, cached.boundaryBitmap, insidePoint, activeOverlay);
                return;
            }

            queueOverlayRender(activeOverlay, fixedPoint, bucketKey);
        }

        function setOverlayPreset(overlayType) {
            if (overlayType === 'mandelbrot') {
                cp2Z0 = { x: 0, y: 0 };
                cp2C = { x: -0.7, y: 0 };
            } else if (overlayType === 'julia') {
                cp2Z0 = { x: 0, y: 0 };
                cp2C = { x: -0.4, y: 0.5 };
            } else {
                cp2Z0 = { x: 0.5, y: 0.5 };
                cp2C = { x: 0, y: 0 };
            }
            cp2Draw();
        }

        function hideOverlay() {
            activeOverlay = null;
            Object.values(overlayCanvases).forEach(canvas => canvas.classList.add('hidden'));
            cp2Draw();
        }

        function showOverlay(overlayType) {
            if (activeOverlay === overlayType) {
                hideOverlay();
                return;
            }
            activeOverlay = overlayType;
            setOverlayPreset(overlayType);
            Object.entries(overlayCanvases).forEach(([key, canvas]) => {
                canvas.classList.toggle('hidden', key !== overlayType);
                if (key === overlayType) {
                    resizeOverlayCanvas(canvas);
                }
            });
            requestOverlayUpdateIfActive();
        }

        function easeInOutQuad(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }

        function scrollElementToCenter(element, duration = 1000) {
            if (!element) return;
            const rect = element.getBoundingClientRect();
            const startY = window.pageYOffset;
            const targetY = Math.min(
                Math.max(0, startY + rect.top + rect.height / 2 - window.innerHeight / 2),
                document.documentElement.scrollHeight - window.innerHeight
            );
            const distance = targetY - startY;
            if (Math.abs(distance) < 1 || duration <= 0) {
                window.scrollTo(0, targetY);
                return;
            }

            let startTime = null;
            function step(timestamp) {
                if (startTime === null) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easeInOutQuad(progress);
                window.scrollTo(0, startY + distance * eased);
                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            }
            requestAnimationFrame(step);
        }

        function scrollCp2CanvasIntoView() {
            scrollElementToCenter(cp2Canvas, 1000);
        }

        overlayButtons.mandelbrot?.addEventListener('click', () => {
            showOverlay('mandelbrot');
            scrollCp2CanvasIntoView();
        });
        overlayButtons.julia?.addEventListener('click', () => {
            showOverlay('julia');
            scrollCp2CanvasIntoView();
        });
        overlayButtons.variant?.addEventListener('click', () => {
            showOverlay('variant');
            scrollCp2CanvasIntoView();
        });
        window.addEventListener('resize', () => {
            Object.values(overlayCanvases).forEach(resizeOverlayCanvas);
            requestOverlayUpdateIfActive();
        });

        function cp2RefreshOverlay() {
            if (!activeOverlay) return;
            requestOverlayUpdateIfActive();
        }

        cp2Draw();
    }

});