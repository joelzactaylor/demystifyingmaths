(() => {
    "use strict";

    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const ease = (value) => {
        const x = clamp(value);
        return x * x * (3 - 2 * x);
    };
    const lerp = (from, to, amount) => from + (to - from) * amount;
    const make = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const createRelatedFactScene = (scene) => {
        const sticky = scene.querySelector(".related-fact-scene__sticky");
        const paper = scene.querySelector("[data-related-fact-paper]");
        const title = scene.querySelector("[data-related-title]");
        const copy = scene.querySelector("[data-related-copy]");
        const progress = scene.querySelector("[data-related-progress]");
        const board = make("div", "related-board");
        const labels = make("div", "related-board__labels");
        labels.append(
            make("span", "", "factor 1"),
            make("span", "", "factor 2"),
            make("span", "", "product")
        );

        const rowValues = [
            ["43", "×", "26", "=", "1,118"],
            ["4.3", "×", "26", "=", "111.8"],
            ["4.3", "×", "2.6", "=", "11.18"]
        ];
        const rows = rowValues.map((values) => {
            const row = make("div", "related-board__row");
            const tokens = values.map((value, index) => make("span", index % 2 ? "related-board__sign" : "related-board__cell", value));
            row.append(...tokens);
            return { row, tokens };
        });
        const laneValues = [
            ["÷ 10", "unchanged", "÷ 10"],
            ["unchanged", "÷ 10", "÷ 10"]
        ];
        const lanes = laneValues.map((values) => {
            const lane = make("div", "related-board__lane");
            const changes = values.map((value, index) => {
                const change = make("div", "related-board__change");
                change.style.gridColumn = String(index * 2 + 1);
                change.append(make("span", "", value));
                lane.append(change);
                return change;
            });
            return { lane, changes };
        });
        const combined = make("div", "related-board__combined");
        combined.append(
            make("span", "", "Combined change:"),
            make("strong", "", "1/10 × 1/10 = 1/100")
        );
        const cursor = make("span", "related-board__cursor");
        board.append(labels, rows[0].row, lanes[0].lane, rows[1].row, lanes[1].lane, rows[2].row, combined, cursor);
        board.setAttribute("aria-hidden", "true");
        paper.setAttribute("role", "img");
        paper.replaceChildren(board);

        const relativeBox = (node) => {
            const nodeBox = node.getBoundingClientRect();
            const boardBox = board.getBoundingClientRect();
            const scaleX = board.offsetWidth ? boardBox.width / board.offsetWidth : 1;
            const scaleY = board.offsetHeight ? boardBox.height / board.offsetHeight : 1;
            return {
                left: (nodeBox.left - boardBox.left) / Math.max(scaleX, .001),
                top: (nodeBox.top - boardBox.top) / Math.max(scaleY, .001),
                width: nodeBox.width / Math.max(scaleX, .001),
                height: nodeBox.height / Math.max(scaleY, .001)
            };
        };
        const framed = (nodes, paddingX = 11, height = 37) => {
            const boxes = nodes.map(relativeBox);
            const left = Math.min(...boxes.map((box) => box.left));
            const right = Math.max(...boxes.map((box) => box.left + box.width));
            const centre = boxes.reduce((total, box) => total + box.top + box.height / 2, 0) / boxes.length;
            return {
                left: Math.round(left - paddingX),
                top: Math.round(centre - height / 2),
                width: Math.round(right - left + paddingX * 2),
                height
            };
        };
        let cursorTargets = [];
        let tokenOffsets = [];
        const measure = () => {
            cursorTargets = [
                framed(rows[0].tokens),
                framed([rows[0].tokens[0]], 12),
                framed([rows[1].tokens[4]], 12),
                framed([rows[1].tokens[2]], 12),
                framed([rows[2].tokens[4]], 12),
                framed(rows[2].tokens)
            ];
            tokenOffsets = rows.map(({ tokens }, rowIndex) => {
                if (!rowIndex) return tokens.map(() => ({ x: 0, y: 0 }));
                return tokens.map((token, tokenIndex) => {
                    const source = relativeBox(rows[rowIndex - 1].tokens[tokenIndex]);
                    const destination = relativeBox(token);
                    return {
                        x: source.left + source.width / 2 - destination.left - destination.width / 2,
                        y: source.top + source.height / 2 - destination.top - destination.height / 2
                    };
                });
            });
        };

        const stages = [
            { title: "Begin with the stated fact", copy: "43 × 26 = 1,118 is already known. It is the source for every number that follows." },
            { title: "Make the first factor one tenth as large", copy: "43 becomes 4.3, while 26 is unchanged. Copy the structure of the given fact; do not multiply again." },
            { title: "Apply the same change to the product", copy: "One factor was divided by 10, so 1,118 is divided by 10 too. The related product is 111.8." },
            { title: "Now make the second factor one tenth as large", copy: "26 becomes 2.6. The first factor remains 4.3." },
            { title: "Scale the product a second time", copy: "The second division by 10 changes 111.8 to 11.18." },
            { title: "Combine the two changes", copy: "Dividing each factor by 10 divides the product by 100 overall: 4.3 × 2.6 = 11.18." }
        ];
        const dots = stages.map(() => make("span", "related-fact-scene__dot"));
        progress.replaceChildren(...dots);

        const revealToken = (rowIndex, tokenIndex, amount) => {
            const token = rows[rowIndex].tokens[tokenIndex];
            token.style.opacity = amount;
            if (!rowIndex) {
                token.style.transform = `translateY(${(1 - amount) * -10}px)`;
                return;
            }
            const offset = tokenOffsets[rowIndex][tokenIndex];
            token.style.transform = `translate(${offset.x * (1 - amount)}px, ${offset.y * (1 - amount)}px)`;
        };
        const revealChange = (laneIndex, changeIndex, amount) => {
            const change = lanes[laneIndex].changes[changeIndex];
            change.style.opacity = amount;
            change.style.setProperty("--line", amount);
            change.style.transform = `translateY(${(1 - amount) * -6}px)`;
        };
        const interpolate = (from, to, amount) => ({
            left: lerp(from.left, to.left, amount),
            top: lerp(from.top, to.top, amount),
            width: lerp(from.width, to.width, amount),
            height: lerp(from.height, to.height, amount)
        });
        const setCursor = (target, opacity) => {
            cursor.style.left = `${target.left}px`;
            cursor.style.top = `${target.top}px`;
            cursor.style.width = `${target.width}px`;
            cursor.style.height = `${target.height}px`;
            cursor.style.opacity = opacity;
        };
        const paint = (position) => {
            const t = clamp(position, 0, stages.length);
            const opening = ease((t - .08) / .5);
            labels.style.opacity = opening;
            rows[0].tokens.forEach((_, index) => revealToken(0, index, opening));

            const firstFactors = ease((t - 1.16) / .56);
            revealChange(0, 0, ease((t - 1.03) / .38));
            revealChange(0, 1, ease((t - 1.03) / .38));
            [0, 1, 2, 3].forEach((index) => revealToken(1, index, firstFactors));
            revealChange(0, 2, ease((t - 2.02) / .38));
            revealToken(1, 4, ease((t - 2.22) / .52));

            const secondFactors = ease((t - 3.16) / .56);
            revealChange(1, 0, ease((t - 3.03) / .38));
            revealChange(1, 1, ease((t - 3.03) / .38));
            [0, 1, 2, 3].forEach((index) => revealToken(2, index, secondFactors));
            revealChange(1, 2, ease((t - 4.02) / .38));
            revealToken(2, 4, ease((t - 4.22) / .52));

            const combinedAmount = ease((t - 5.12) / .5);
            combined.style.opacity = combinedAmount;
            combined.style.transform = `translateY(${(1 - combinedAmount) * -10}px)`;

            const stageIndex = Math.min(stages.length - 1, Math.floor(t));
            const nextIndex = Math.min(stages.length - 1, stageIndex + 1);
            const movement = ease((t - stageIndex - .62) / .38);
            const target = interpolate(cursorTargets[stageIndex], cursorTargets[nextIndex], movement);
            setCursor(target, opening);
        };

        let currentStage = -1;
        let cardHeight = sticky.offsetHeight;
        let ticking = false;
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

        const dock = (offset = 0, preserve = false) => {
            if (sticky.parentNode !== scene) moveCard(() => scene.insertBefore(sticky, scene.firstChild));
            sticky.classList.remove("is-pinned");
            sticky.style.removeProperty("left");
            sticky.style.removeProperty("transform");
            sticky.style.top = `${offset}px`;
            if (preserve) {
                sticky.style.width = `${scene.offsetWidth}px`;
                sticky.style.height = `${cardHeight}px`;
            } else {
                sticky.style.removeProperty("width");
                sticky.style.removeProperty("height");
            }
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
        const paintAt = (ratio) => {
            const position = clamp(ratio) * stages.length;
            paint(position);
            const stageIndex = Math.min(stages.length - 1, Math.floor(position));
            if (stageIndex === currentStage) return;
            currentStage = stageIndex;
            title.textContent = stages[stageIndex].title;
            copy.textContent = stages[stageIndex].copy;
            paper.setAttribute("aria-label", `${stages[stageIndex].title}. ${stages[stageIndex].copy}`);
            dots.forEach((dot, index) => {
                dot.classList.toggle("is-current", index === stageIndex);
                dot.classList.toggle("is-past", index < stageIndex);
            });
        };
        const setSize = () => {
            if (reduceMotion.matches) {
                scene.style.setProperty("--scene-height", `${cardHeight}px`);
                scene.style.setProperty("--scene-min-height", `${cardHeight}px`);
            } else {
                scene.style.setProperty("--scene-height", `${(stages.length + 1) * 38}vh`);
                scene.style.setProperty("--scene-min-height", `${(stages.length + 1) * 250}px`);
            }
        };
        const update = () => {
            ticking = false;
            if (reduceMotion.matches) {
                dock(0);
                paintAt(1);
                return;
            }
            const rect = scene.getBoundingClientRect();
            const scale = scene.offsetWidth && rect.width ? rect.width / scene.offsetWidth : 1;
            const pinTop = Math.max(16, (window.innerHeight - cardHeight * scale) / 2);
            const travel = Math.max(1, scene.offsetHeight - cardHeight);
            const distance = pinTop - rect.top;
            const visualTravel = travel * scale;
            if (distance <= 0) {
                dock(0);
                paintAt(0);
            } else if (distance >= visualTravel) {
                dock(travel, true);
                paintAt(1);
            } else {
                pin(rect.left, pinTop, scene.offsetWidth, scale);
                paintAt(distance / visualTravel);
            }
        };
        const requestUpdate = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        };
        const reset = () => {
            dock(0);
            cardHeight = sticky.offsetHeight;
            measure();
            setSize();
            currentStage = -1;
            requestUpdate();
        };

        scene.classList.add("is-ready");
        measure();
        setSize();
        update();
        return { requestUpdate, reset };
    };

    const deductionConfigs = {
        factor: {
            rows: [
                { tokens: ["?", "×", "2.6", "=", "111.8"] },
                { tokens: ["?", "=", "111.8", "÷", "2.6"], sources: [0, 3, 4, 1, 2] },
                { tokens: ["?", "=", "(1,118 ÷ 10)", "÷", "(26 ÷ 10)"], sources: [0, 1, 2, 3, 4] },
                { tokens: ["?", "=", "1,118", "÷", "26"], sources: [0, 1, 2, 3, 4] },
                { tokens: ["?", "=", "43"], sources: [0, 1, null] }
            ],
            transitions: ["rearrange with the inverse", "substitute related values", "cancel equal ÷10 changes", "use the given fact"],
            stages: [
                { title: "Identify the missing factor", copy: "The product is 111.8 and the known factor is 2.6." },
                { title: "Rearrange using division", copy: "A missing factor equals the product divided by the known factor: ? = 111.8 ÷ 2.6." },
                { title: "Substitute values from the given fact", copy: "111.8 is 1,118 ÷ 10, while 2.6 is 26 ÷ 10." },
                { title: "Cancel the equal scale changes", copy: "Dividing both the dividend and divisor by 10 leaves the quotient unchanged, so ? = 1,118 ÷ 26." },
                { title: "Read the given fact backwards", copy: "Because 43 × 26 = 1,118, it follows that 1,118 ÷ 26 = 43. The missing factor is 43." }
            ]
        },
        dividend: {
            rows: [
                { tokens: ["?", "÷", "4.3", "=", "260"] },
                { tokens: ["?", "=", "4.3", "×", "260"], sources: [0, 3, 2, 1, 4] },
                { tokens: ["?", "=", "(43 ÷ 10)", "×", "(26 × 10)"], sources: [0, 1, 2, 3, 4] },
                { tokens: ["?", "=", "43", "×", "26"], sources: [0, 1, 2, 3, 4] },
                { tokens: ["?", "=", "1,118"], sources: [0, 1, null] }
            ],
            transitions: ["rearrange with the inverse", "substitute related values", "cancel opposite scale changes", "use the given fact"],
            stages: [
                { title: "Identify the missing dividend", copy: "The divisor is 4.3 and the quotient is 260." },
                { title: "Rearrange using multiplication", copy: "A missing dividend equals the divisor multiplied by the quotient: ? = 4.3 × 260." },
                { title: "Substitute values from the given fact", copy: "4.3 is 43 ÷ 10, while 260 is 26 × 10." },
                { title: "Cancel the opposite scale changes", copy: "One factor is divided by 10 and the other is multiplied by 10, so their product is unchanged: ? = 43 × 26." },
                { title: "Use the stated product", copy: "The given fact says 43 × 26 = 1,118. The missing dividend is 1,118." }
            ]
        },
        "scaled-factor": {
            rows: [
                { tokens: ["?", "×", "2.6", "=", "11.18"] },
                { tokens: ["?", "=", "11.18", "÷", "2.6"], sources: [0, 3, 4, 1, 2] },
                { tokens: ["?", "=", "(1,118 ÷ 100)", "÷", "(26 ÷ 10)"], sources: [0, 1, 2, 3, 4] },
                { tokens: ["?", "=", "(1,118 ÷ 26)", "÷", "10"], sources: [0, 1, 2, 3, 4] },
                { tokens: ["?", "=", "4.3"], sources: [0, 1, null] }
            ],
            transitions: ["rearrange with the inverse", "substitute related values", "combine the scale changes", "use the given fact"],
            stages: [
                { title: "Identify the missing factor", copy: "The product is 11.18 and the known factor is 2.6." },
                { title: "Rearrange using division", copy: "A missing factor equals the product divided by the known factor: ? = 11.18 ÷ 2.6." },
                { title: "Substitute values from the given fact", copy: "11.18 is 1,118 ÷ 100, while 2.6 is 26 ÷ 10." },
                { title: "Combine the scale changes", copy: "Dividing the dividend by 100 and the divisor by 10 divides the quotient by 10: ? = (1,118 ÷ 26) ÷ 10." },
                { title: "Use the given quotient", copy: "Because 1,118 ÷ 26 = 43, the missing factor is 43 ÷ 10 = 4.3." }
            ]
        }
    };

    const createDeductionScene = (scene) => {
        const config = deductionConfigs[scene.dataset.deductionKind];
        if (!config) return null;
        const sticky = scene.querySelector(".deduction-scene__sticky");
        const paper = scene.querySelector("[data-deduction-paper]");
        const title = scene.querySelector("[data-deduction-title]");
        const copy = scene.querySelector("[data-deduction-copy]");
        const progress = scene.querySelector("[data-deduction-progress]");
        const board = make("div", "deduction-board");
        const rows = config.rows.map((rowConfig) => {
            const row = make("div", "deduction-board__row");
            const tokens = rowConfig.tokens.map((value) => {
                const operation = ["×", "÷", "="].includes(value);
                return make("span", `deduction-board__token${operation ? " is-operation" : ""}`, value);
            });
            row.append(...tokens);
            return { row, tokens, sources: rowConfig.sources || [] };
        });
        const transitions = config.transitions.map((label) => {
            const transition = make("div", "deduction-board__transition");
            transition.append(make("b", "", "↓"), make("span", "", label));
            return transition;
        });
        const cursor = make("span", "deduction-board__cursor");
        rows.forEach(({ row }, index) => {
            board.append(row);
            if (transitions[index]) board.append(transitions[index]);
        });
        board.append(cursor);
        board.setAttribute("aria-hidden", "true");
        paper.setAttribute("role", "img");
        paper.replaceChildren(board);

        const relativeBox = (node) => {
            const nodeBox = node.getBoundingClientRect();
            const boardBox = board.getBoundingClientRect();
            const scaleX = board.offsetWidth ? boardBox.width / board.offsetWidth : 1;
            const scaleY = board.offsetHeight ? boardBox.height / board.offsetHeight : 1;
            return {
                left: (nodeBox.left - boardBox.left) / Math.max(scaleX, .001),
                top: (nodeBox.top - boardBox.top) / Math.max(scaleY, .001),
                width: nodeBox.width / Math.max(scaleX, .001),
                height: nodeBox.height / Math.max(scaleY, .001)
            };
        };
        const frame = (tokens) => {
            const boxes = tokens.map(relativeBox);
            const left = Math.min(...boxes.map((box) => box.left));
            const right = Math.max(...boxes.map((box) => box.left + box.width));
            const centre = boxes.reduce((sum, box) => sum + box.top + box.height / 2, 0) / boxes.length;
            return { left: Math.round(left - 13), top: Math.round(centre - 19), width: Math.round(right - left + 26), height: 38 };
        };
        let cursorTargets = [];
        let tokenOffsets = [];
        const measure = () => {
            cursorTargets = rows.map(({ tokens }) => frame(tokens));
            tokenOffsets = rows.map(({ tokens, sources }, rowIndex) => tokens.map((token, tokenIndex) => {
                if (!rowIndex || sources[tokenIndex] === null || sources[tokenIndex] === undefined) return { x: 0, y: -18 };
                const source = relativeBox(rows[rowIndex - 1].tokens[sources[tokenIndex]]);
                const destination = relativeBox(token);
                return {
                    x: source.left + source.width / 2 - destination.left - destination.width / 2,
                    y: source.top + source.height / 2 - destination.top - destination.height / 2
                };
            }));
        };
        const dots = config.stages.map(() => make("span", "deduction-scene__dot"));
        progress.replaceChildren(...dots);
        const interpolate = (from, to, amount) => ({
            left: lerp(from.left, to.left, amount),
            top: lerp(from.top, to.top, amount),
            width: lerp(from.width, to.width, amount),
            height: lerp(from.height, to.height, amount)
        });
        const revealRow = (rowIndex, amount) => {
            rows[rowIndex].tokens.forEach((token, tokenIndex) => {
                const offset = tokenOffsets[rowIndex][tokenIndex];
                token.style.opacity = amount;
                token.style.transform = `translate(${offset.x * (1 - amount)}px, ${offset.y * (1 - amount)}px)`;
            });
        };
        const paint = (position) => {
            const t = clamp(position, 0, config.stages.length);
            revealRow(0, ease((t - .08) / .5));
            for (let index = 1; index < rows.length; index++) {
                const transitionAmount = ease((t - index - .02) / .34);
                transitions[index - 1].style.opacity = transitionAmount;
                transitions[index - 1].style.transform = `translateY(${(1 - transitionAmount) * -6}px)`;
                revealRow(index, ease((t - index - .2) / .5));
            }
            const stageIndex = Math.min(config.stages.length - 1, Math.floor(t));
            const nextIndex = Math.min(config.stages.length - 1, stageIndex + 1);
            const target = interpolate(cursorTargets[stageIndex], cursorTargets[nextIndex], ease((t - stageIndex - .62) / .38));
            cursor.style.left = `${target.left}px`;
            cursor.style.top = `${target.top}px`;
            cursor.style.width = `${target.width}px`;
            cursor.style.height = `${target.height}px`;
            cursor.style.opacity = ease((t - .08) / .5);
        };

        let currentStage = -1;
        let cardHeight = sticky.offsetHeight;
        let ticking = false;
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

        const dock = (offset = 0, preserve = false) => {
            if (sticky.parentNode !== scene) moveCard(() => scene.insertBefore(sticky, scene.firstChild));
            sticky.classList.remove("is-pinned");
            sticky.style.removeProperty("left");
            sticky.style.removeProperty("transform");
            sticky.style.top = `${offset}px`;
            if (preserve) {
                sticky.style.width = `${scene.offsetWidth}px`;
                sticky.style.height = `${cardHeight}px`;
            } else {
                sticky.style.removeProperty("width");
                sticky.style.removeProperty("height");
            }
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
        const paintAt = (ratio) => {
            const position = clamp(ratio) * config.stages.length;
            paint(position);
            const stageIndex = Math.min(config.stages.length - 1, Math.floor(position));
            if (stageIndex === currentStage) return;
            currentStage = stageIndex;
            title.textContent = config.stages[stageIndex].title;
            copy.textContent = config.stages[stageIndex].copy;
            paper.setAttribute("aria-label", `${config.stages[stageIndex].title}. ${config.stages[stageIndex].copy}`);
            dots.forEach((dot, index) => {
                dot.classList.toggle("is-current", index === stageIndex);
                dot.classList.toggle("is-past", index < stageIndex);
            });
        };
        const setSize = () => {
            if (reduceMotion.matches) {
                scene.style.setProperty("--scene-height", `${cardHeight}px`);
                scene.style.setProperty("--scene-min-height", `${cardHeight}px`);
            } else {
                scene.style.setProperty("--scene-height", `${(config.stages.length + 1) * 38}vh`);
                scene.style.setProperty("--scene-min-height", `${(config.stages.length + 1) * 250}px`);
            }
        };
        const update = () => {
            ticking = false;
            if (reduceMotion.matches) {
                dock(0);
                paintAt(1);
                return;
            }
            const rect = scene.getBoundingClientRect();
            const scale = scene.offsetWidth && rect.width ? rect.width / scene.offsetWidth : 1;
            const pinTop = Math.max(16, (window.innerHeight - cardHeight * scale) / 2);
            const travel = Math.max(1, scene.offsetHeight - cardHeight);
            const distance = pinTop - rect.top;
            const visualTravel = travel * scale;
            if (distance <= 0) {
                dock(0);
                paintAt(0);
            } else if (distance >= visualTravel) {
                dock(travel, true);
                paintAt(1);
            } else {
                pin(rect.left, pinTop, scene.offsetWidth, scale);
                paintAt(distance / visualTravel);
            }
        };
        const requestUpdate = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        };
        const reset = () => {
            dock(0);
            cardHeight = sticky.offsetHeight;
            measure();
            setSize();
            currentStage = -1;
            requestUpdate();
        };
        scene.classList.add("is-ready");
        measure();
        setSize();
        update();
        return { requestUpdate, reset };
    };

    const comma = (whole) => whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const scaledInteger = (value, power) => {
        const digits = String(value);
        if (power >= 0) return comma(`${digits}${"0".repeat(power)}`);
        const point = digits.length + power;
        if (point > 0) return `${comma(digits.slice(0, point))}.${digits.slice(point)}`;
        return `0.${"0".repeat(-point)}${digits}`;
    };
    const factorNumber = (power) => 10 ** Math.abs(power);
    const shortChange = (power) => {
        if (!power) return "unchanged";
        return `${power > 0 ? "×" : "÷"} ${comma(String(factorNumber(power)))}`;
    };
    const spokenChange = (subject, power) => {
        if (!power) return `${subject} is unchanged`;
        return `${subject} is ${power > 0 ? "multiplied" : "divided"} by ${comma(String(factorNumber(power)))}`;
    };
    const spokenEquation = (form, first, second, product) => {
        if (form === "divide-first") return `${product} divided by ${first} equals ${second}`;
        if (form === "divide-second") return `${product} divided by ${second} equals ${first}`;
        return `${first} times ${second} equals ${product}`;
    };

    const createFactExplorer = (explorer) => {
        const firstSelect = explorer.querySelector("[data-first-scale]");
        const secondSelect = explorer.querySelector("[data-second-scale]");
        const productSelect = explorer.querySelector("[data-product-scale]");
        const resultChoices = [...explorer.querySelectorAll("[data-result-choice]")];
        const cards = [...explorer.querySelectorAll("[data-value-card]")];
        const scaleLeft = explorer.querySelector("[data-scale-left]");
        const scaleOperation = explorer.querySelector("[data-scale-operation]");
        const scaleMiddle = explorer.querySelector("[data-scale-middle]");
        const scaleResult = explorer.querySelector("[data-scale-result]");
        const equation = explorer.querySelector("[data-related-equation]");
        const status = explorer.querySelector("[data-fact-status]");
        const selects = { first: firstSelect, second: secondSelect, product: productSelect };
        const ensureOption = (select, power) => {
            const value = String(power);
            if (![...select.options].some((option) => option.value === value)) {
                const option = document.createElement("option");
                option.value = value;
                option.textContent = shortChange(power);
                option.dataset.derived = "true";
                select.append(option);
            }
            select.value = value;
        };

        const update = () => {
            const result = resultChoices.find((input) => input.checked)?.value || "product";
            const powers = {
                first: Number(firstSelect.value),
                second: Number(secondSelect.value),
                product: Number(productSelect.value)
            };
            if (result === "product") powers.product = powers.first + powers.second;
            else if (result === "first") powers.first = powers.product - powers.second;
            else powers.second = powers.product - powers.first;
            ensureOption(selects[result], powers[result]);
            Object.entries(selects).forEach(([name, select]) => {
                const isResult = name === result;
                select.disabled = isResult;
                select.closest("label").querySelector(":scope > span").textContent = isResult ? "Calculated scale" : "Scale";
            });
            cards.forEach((card) => card.classList.toggle("is-result", card.dataset.valueCard === result));

            const firstPower = powers.first;
            const secondPower = powers.second;
            const productPower = powers.product;
            const first = scaledInteger(43, firstPower);
            const second = scaledInteger(26, secondPower);
            const product = scaledInteger(1118, productPower);
            let order;
            let form;
            if (result === "first") {
                order = [productPower, "÷", secondPower, firstPower];
                form = "divide-second";
            } else if (result === "second") {
                order = [productPower, "÷", firstPower, secondPower];
                form = "divide-first";
            } else {
                order = [firstPower, "×", secondPower, productPower];
                form = "product";
            }
            scaleLeft.textContent = shortChange(order[0]);
            scaleOperation.textContent = order[1];
            scaleMiddle.textContent = shortChange(order[2]);
            scaleResult.textContent = shortChange(order[3]);
            equation.textContent = form === "product"
                ? `${first} × ${second} = ${product}`
                : form === "divide-first"
                    ? `${product} ÷ ${first} = ${second}`
                    : `${product} ÷ ${second} = ${first}`;
            const resultName = result === "product" ? "product" : result === "first" ? "first factor" : "second factor";
            const inputNames = result === "product" ? ["first factor", "second factor"] : result === "first" ? ["product", "second factor"] : ["product", "first factor"];
            const inputPowers = result === "product" ? [firstPower, secondPower] : result === "first" ? [productPower, secondPower] : [productPower, firstPower];
            status.textContent = `${spokenChange(`The ${inputNames[0]}`, inputPowers[0])} and ${spokenChange(`the ${inputNames[1]}`, inputPowers[1])}. The calculated scale for the ${resultName} is ${shortChange(powers[result])}. The related fact is ${spokenEquation(form, first, second, product)}.`;
        };

        [firstSelect, secondSelect, productSelect, ...resultChoices].forEach((control) => control.addEventListener("change", update));
        update();
    };

    const sceneNode = document.querySelector("[data-related-fact-scene]");
    const controllers = [];
    if (sceneNode) controllers.push(createRelatedFactScene(sceneNode));
    document.querySelectorAll("[data-deduction-scene]").forEach((scene) => {
        const controller = createDeductionScene(scene);
        if (controller) controllers.push(controller);
    });
    const explorer = document.querySelector("[data-fact-explorer]");
    if (explorer) createFactExplorer(explorer);
    if (controllers.length) {
        window.addEventListener("scroll", () => controllers.forEach((controller) => controller.requestUpdate()), { passive: true });
        window.addEventListener("resize", () => controllers.forEach((controller) => controller.reset()));
        const resetAll = () => controllers.forEach((controller) => controller.reset());
        if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", resetAll);
        else reduceMotion.addListener(resetAll);
    }
})();
