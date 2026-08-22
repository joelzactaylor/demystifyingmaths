document.addEventListener("DOMContentLoaded", () => {
    const scenes = [...document.querySelectorAll(".ordering-scene")];
    if (!scenes.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const svgNS = "http://www.w3.org/2000/svg";
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const ease = (value) => {
        const x = clamp(value);
        return x * x * (3 - 2 * x);
    };

    const makeSVG = (name, attributes = {}) => {
        const element = document.createElementNS(svgNS, name);
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
        return element;
    };

    const formatTick = (value, step) => {
        const decimals = Math.max(0, (String(step).split(".")[1] || "").length);
        const rounded = Number(value.toFixed(decimals));
        return String(rounded).replace("-", "\u2212");
    };

    const createScene = (scene) => {
        const sticky = scene.querySelector(".ordering-scene__sticky");
        const values = scene.dataset.values.split("|").map(Number);
        const labels = scene.dataset.labels.split("|");
        const captions = [...scene.querySelectorAll(".ordering-scene__script li")].map((item) => item.textContent.trim());
        const min = Number(scene.dataset.min);
        const max = Number(scene.dataset.max);
        const tickStep = Number(scene.dataset.step);
        const direction = scene.dataset.direction;
        const answer = scene.dataset.answer;
        const ascending = direction === "ascending";
        const totalSlides = values.length + 1;

        scene.style.setProperty("--scene-height", `${(totalSlides + 1) * 48}vh`);
        scene.style.setProperty("--scene-min-height", `${(totalSlides + 1) * 390}px`);
        sticky.innerHTML = `
            <svg class="ordering-scene__graphic" viewBox="0 0 760 410" role="img"></svg>
            <p class="ordering-scene__caption"></p>
            <div class="ordering-scene__progress" aria-hidden="true"></div>`;

        const svg = sticky.querySelector("svg");
        const caption = sticky.querySelector(".ordering-scene__caption");
        const progressBar = sticky.querySelector(".ordering-scene__progress");
        const title = makeSVG("title");
        const description = makeSVG("desc");
        const titleId = `ordering-scene-title-${createScene.count}`;
        const descriptionId = `ordering-scene-description-${createScene.count}`;
        title.id = titleId;
        description.id = descriptionId;
        title.textContent = `Placing ${labels.join(", ")} on a number line`;
        description.textContent = `An animated number line showing the values before reading them in ${direction} order.`;
        svg.setAttribute("aria-labelledby", `${titleId} ${descriptionId}`);
        svg.append(title, description);
        createScene.count += 1;

        const left = 62;
        const right = 698;
        const axisY = 310;
        const span = max - min;
        const toX = (value) => left + ((value - min) / span) * (right - left);

        const axis = makeSVG("line", { x1: left, y1: axisY, x2: right, y2: axisY, class: "ordering-axis" });
        svg.append(axis);

        const tickCount = Math.round(span / tickStep);
        for (let i = 0; i <= tickCount; i += 1) {
            const value = min + i * tickStep;
            const x = toX(value);
            const isZero = Math.abs(value) < tickStep / 1000;
            svg.append(makeSVG("line", {
                x1: x, y1: axisY - (isZero ? 14 : 10), x2: x, y2: axisY + (isZero ? 14 : 10),
                class: isZero ? "ordering-tick ordering-tick--zero" : "ordering-tick"
            }));
            const tickLabel = makeSVG("text", { x, y: axisY + 36, class: "ordering-tick-label" });
            tickLabel.textContent = formatTick(value, tickStep);
            svg.append(tickLabel);
        }

        const targetXs = values.map(toX);
        targetXs.forEach((x, index) => {
            values[index] = { value: values[index], label: labels[index], targetX: x, labelX: x };
        });

        const tokenWidth = Math.max(68, Math.min(104, 590 / values.length));
        const labelGap = tokenWidth + 12;
        const minLabelX = tokenWidth / 2 + 18;
        const maxLabelX = 760 - minLabelX;
        const orderedLabels = values
            .map((item) => item)
            .sort((a, b) => a.targetX - b.targetX);

        orderedLabels.forEach((item, index) => {
            item.labelX = clamp(item.targetX, minLabelX, maxLabelX);
            if (index > 0) item.labelX = Math.max(item.labelX, orderedLabels[index - 1].labelX + labelGap);
        });

        if (orderedLabels.at(-1).labelX > maxLabelX) {
            orderedLabels.at(-1).labelX = maxLabelX;
            for (let index = orderedLabels.length - 2; index >= 0; index -= 1) {
                orderedLabels[index].labelX = Math.min(
                    orderedLabels[index].labelX,
                    orderedLabels[index + 1].labelX - labelGap
                );
            }
        }

        if (orderedLabels[0].labelX < minLabelX) {
            orderedLabels[0].labelX = minLabelX;
            for (let index = 1; index < orderedLabels.length; index += 1) {
                orderedLabels[index].labelX = Math.max(
                    orderedLabels[index].labelX,
                    orderedLabels[index - 1].labelX + labelGap
                );
            }
        }

        const tokens = values.map((item, index) => {
            const group = makeSVG("g", { class: "ordering-token" });
            const targetY = axisY - 76;
            const stemStartY = targetY + 20;
            const stemMidY = (stemStartY + axisY) / 2;
            const stem = makeSVG("path", {
                d: `M ${item.labelX} ${stemStartY} C ${item.labelX} ${stemMidY}, ${item.targetX} ${stemMidY}, ${item.targetX} ${axisY}`,
                class: "ordering-token__stem"
            });
            const cardGroup = makeSVG("g", { class: "ordering-token__moving-card" });
            const card = makeSVG("rect", { x: -tokenWidth / 2, y: -19, width: tokenWidth, height: 38, rx: 11, class: "ordering-token__card" });
            const text = makeSVG("text", { x: 0, y: 1, class: "ordering-token__text" });
            text.textContent = item.label;
            cardGroup.append(card, text);
            group.append(stem, cardGroup);
            svg.append(group);
            return {
                ...item, cardGroup, stem, targetY,
                sourceX: 90 + index * (580 / Math.max(1, values.length - 1))
            };
        });

        const directionGroup = makeSVG("g", { class: "ordering-direction-group" });
        const arrowY = 382;
        const arrowStart = ascending ? left : right;
        const arrowTip = ascending ? right + 20 : left - 20;
        const arrowEnd = ascending ? arrowTip - 18 : arrowTip + 18;
        const arrowLine = makeSVG("line", {
            x1: arrowStart, y1: arrowY, x2: arrowEnd, y2: arrowY, class: "ordering-direction"
        });
        const headPoints = ascending
            ? `${arrowTip},${arrowY} ${arrowEnd},${arrowY - 10} ${arrowEnd},${arrowY + 10}`
            : `${arrowTip},${arrowY} ${arrowEnd},${arrowY - 10} ${arrowEnd},${arrowY + 10}`;
        const arrowHead = makeSVG("polygon", { points: headPoints, class: "ordering-direction__head" });
        directionGroup.append(arrowLine, arrowHead);
        svg.append(directionGroup);

        const dots = Array.from({ length: totalSlides + 1 }, () => {
            const dot = document.createElement("span");
            dot.className = "ordering-scene__dot";
            progressBar.append(dot);
            return dot;
        });

        let currentSlide = -1;
        const render = (progress) => {
            const safeProgress = clamp(progress);
            const placementSpan = .82;

            tokens.forEach((token, index) => {
                const segmentStart = (index / tokens.length) * placementSpan;
                const segmentLength = placementSpan / tokens.length;
                const local = ease((safeProgress - segmentStart) / (segmentLength * .72));
                const sourceY = 54;
                const x = token.sourceX + (token.labelX - token.sourceX) * local;
                const y = sourceY + (token.targetY - sourceY) * local;
                token.cardGroup.setAttribute("transform", `translate(${x} ${y})`);
                token.stem.style.opacity = String(clamp((local - .62) / .26));
            });

            const directionProgress = ease((safeProgress - .84) / .13);
            arrowLine.setAttribute("x2", arrowStart + (arrowEnd - arrowStart) * directionProgress);
            arrowLine.style.opacity = String(clamp(directionProgress * 5));
            arrowHead.style.opacity = String(clamp((directionProgress - .86) / .14));

            const slide = Math.min(totalSlides, Math.floor(safeProgress * (totalSlides + .999)));
            if (slide !== currentSlide) {
                currentSlide = slide;
                if (slide === 0) {
                    caption.textContent = "Scroll to place the numbers on the line.";
                } else if (slide <= captions.length) {
                    caption.textContent = captions[slide - 1];
                } else {
                    caption.textContent = `${ascending ? "Ascending" : "Descending"} order: ${answer}.`;
                }
                dots.forEach((dot, index) => {
                    dot.classList.toggle("is-current", index === slide);
                    dot.classList.toggle("is-past", index < slide);
                });
            }
        };

        scene.classList.add("is-ready");
        let cardWidth = sticky.offsetWidth;
        let cardHeight = sticky.offsetHeight;

        const dock = (offset = 0) => {
            if (sticky.parentNode !== scene) scene.insertBefore(sticky, scene.firstChild);
            sticky.classList.remove("is-pinned");
            sticky.style.removeProperty("right");
            sticky.style.removeProperty("left");
            sticky.style.removeProperty("width");
            sticky.style.removeProperty("height");
            sticky.style.removeProperty("transform");
            sticky.style.top = `${offset}px`;
        };

        const pin = (left, top, scale) => {
            if (sticky.parentNode !== document.body) document.body.append(sticky);
            sticky.classList.add("is-pinned");
            sticky.style.left = `${left}px`;
            sticky.style.top = `${top}px`;
            sticky.style.width = `${cardWidth}px`;
            sticky.style.height = `${cardHeight}px`;
            sticky.style.transform = `scale(${scale})`;
        };

        const measure = () => {
            dock(0);
            cardWidth = sticky.offsetWidth;
            cardHeight = sticky.offsetHeight;
        };

        return {
            scene, sticky, render, dock, pin, measure,
            get cardHeight() { return cardHeight; }
        };
    };
    createScene.count = 1;

    const controllers = scenes.map(createScene);
    let ticking = false;

    const update = () => {
        const reduced = reduceMotion.matches;
        controllers.forEach((controller) => {
            const { scene, render } = controller;
            if (reduced) {
                controller.dock(0);
                render(1);
                return;
            }
            const sceneRect = scene.getBoundingClientRect();
            const visualScale = scene.offsetWidth && sceneRect.width ? sceneRect.width / scene.offsetWidth : 1;
            const visualCardHeight = controller.cardHeight * visualScale;
            const pinTop = Math.max(16, (window.innerHeight - visualCardHeight) / 2);
            const travel = Math.max(1, scene.offsetHeight - controller.cardHeight);
            const distance = pinTop - sceneRect.top;
            const visualTravel = travel * visualScale;

            if (distance <= 0) {
                controller.dock(0);
                render(0);
            } else if (distance >= visualTravel) {
                controller.dock(travel);
                render(1);
            } else {
                controller.pin(sceneRect.left, pinTop, visualScale);
                render(distance / visualTravel);
            }
        });
        ticking = false;
    };

    const requestUpdate = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", () => {
        controllers.forEach((controller) => controller.measure());
        requestUpdate();
    });
    const motionChanged = () => {
        controllers.forEach((controller) => controller.measure());
        requestUpdate();
    };
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", motionChanged);
    else reduceMotion.addListener(motionChanged);
});
