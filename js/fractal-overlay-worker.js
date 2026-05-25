self.addEventListener('message', async (event) => {
    const data = event.data;
    if (!data || data.type !== 'render') return;

    const width = Math.max(1, Math.round(data.width));
    const height = Math.max(1, Math.round(data.height));
    const viewport = data.viewport;
    const fixed = data.fixed;
    const overlayType = data.overlayType;
    const iterations = 64;

    const maskCanvas = new OffscreenCanvas(width, height);
    const borderCanvas = new OffscreenCanvas(width, height);
    const maskCtx = maskCanvas.getContext('2d');
    const borderCtx = borderCanvas.getContext('2d');
    if (!maskCtx || !borderCtx) return;

    const maskData = maskCtx.createImageData(width, height);
    const borderData = borderCtx.createImageData(width, height);
    const values = new Float32Array(width * height);

    const dx = (viewport.maxX - viewport.minX) / width;
    const dy = (viewport.maxY - viewport.minY) / height;
    const escapeRadius2 = 16.0;

    // ── 1. FILL values[] ─────────────────────────────────────────────────────
    for (let j = 0; j < height; j++) {
        for (let i = 0; i < width; i++) {
            const wx = viewport.minX + (i + 0.5) * dx;
            const wy = viewport.maxY - (j + 0.5) * dy;

            let zx, zy, cx, cy;
            if (overlayType === 'mandelbrot') {
                zx = 0; zy = 0; cx = wx; cy = wy;
            } else if (overlayType === 'julia') {
                zx = wx; zy = wy; cx = fixed.x; cy = fixed.y;
            } else {
                // variant: fixed z0, vary c
                zx = fixed.x; zy = fixed.y; cx = wx; cy = wy;
            }

            let iter = 0;
            let r2 = zx * zx + zy * zy;
            while (iter < iterations && r2 < escapeRadius2) {
                const nx = zx * zx - zy * zy + cx;
                zy = 2 * zx * zy + cy;
                zx = nx;
                r2 = zx * zx + zy * zy;
                iter++;
            }

            if (iter < iterations) {
                // smooth escape value (between 0 and iterations, never reaching it)
                const logZn = 0.5 * Math.log(r2);
                const nu = Math.log(logZn / Math.log(2)) / Math.log(2);
                values[j * width + i] = iter + 1 - nu;
            } else {
                // inside the set — store exactly iterations as sentinel
                values[j * width + i] = iterations;
            }
        }
    }

    // ── 2. DRAW mask + boundary separately ─────────────────────────────────────
    for (let j = 0; j < height; j++) {
        for (let i = 0; i < width; i++) {
            const idx = j * width + i;
            const isInside = values[idx] >= iterations;

            const left = values[j * width + Math.max(0, i - 1)];
            const right = values[j * width + Math.min(width - 1, i + 1)];
            const top = values[Math.max(0, j - 1) * width + i];
            const bottom = values[Math.min(height - 1, j + 1) * width + i];

            const onBoundary =
                (left >= iterations) !== isInside ||
                (right >= iterations) !== isInside ||
                (top >= iterations) !== isInside ||
                (bottom >= iterations) !== isInside;

            const maskOffset = idx * 4;
            if (isInside) {
                maskData.data[maskOffset] = 255;
                maskData.data[maskOffset + 1] = 255;
                maskData.data[maskOffset + 2] = 255;
                maskData.data[maskOffset + 3] = 255;
            } else {
                maskData.data[maskOffset + 3] = 0;
            }

            if (onBoundary) {
                const borderOffset = idx * 4;
                borderData.data[borderOffset] = 107;
                borderData.data[borderOffset + 1] = 114;
                borderData.data[borderOffset + 2] = 128;
                borderData.data[borderOffset + 3] = 115;
            }
        }
    }

    maskCtx.putImageData(maskData, 0, 0);
    borderCtx.putImageData(borderData, 0, 0);
    const maskBitmap = maskCanvas.transferToImageBitmap();
    const boundaryBitmap = borderCanvas.transferToImageBitmap();
    self.postMessage({
        type: 'tile', requestId: data.requestId,
        bucketKey: data.bucketKey, overlayType, generation: data.generation,
        maskBitmap, boundaryBitmap
    }, [maskBitmap, boundaryBitmap]);
});