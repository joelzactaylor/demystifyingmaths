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

        window.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('mouseleave', onUp);
        window.addEventListener('touchstart', onDown, { passive: false });
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

});