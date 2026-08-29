/* A scroll-led comparison of four interpretations, followed by a live numerical
   comparison. Inputs update text nodes in place, preserving focus and scroll. */
(() => {
    "use strict";
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scene = document.querySelector("[data-remainder-scene]");

    if (scene) {
        const sticky = scene.querySelector(".remainder-scene__sticky");
        const board = scene.querySelector("[data-scenario-board]");
        const cards = Array.from(scene.querySelectorAll("[data-meaning]"));
        const title = scene.querySelector("[data-step-title]");
        const copy = scene.querySelector("[data-step-copy]");
        const progress = scene.querySelector("[data-progress]");
        const stages = [
            ["Start with the division", "29 ÷ 4 gives 7 remainder 1. The context will decide what that result means.", null],
            ["State what is left", "When 29 counters are shared between four pupils, each receives 7 and 1 counter remains.", "left"],
            ["Share the leftover exactly", "When the amount can be split, share the remaining 1 between four groups: 7¼, or 7.25, each.", "exact"],
            ["Count only complete groups", "Four flowers make a complete bouquet. Twenty-nine flowers make 7 complete bouquets, with 1 flower left.", "down"],
            ["Make room for every item", "Seven cars hold only 28 passengers. The remaining passenger makes an eighth car necessary.", "up"]
        ];
        const make = (tag, className, text) => {
            const node = document.createElement(tag);
            node.className = className;
            if (text !== undefined) node.textContent = text;
            return node;
        };
        const dot = () => make("span", "scenario-dot");
        const drawings = new Map();
        const layer = (meaning, className) => {
            const drawing = make("div", "scenario-drawing");
            drawing.dataset.drawing = meaning;
            const composition = make("div", className);
            drawing.append(composition);
            board.append(drawing);
            drawings.set(meaning, drawing);
            return composition;
        };

        const counterDrawing = layer("left", "counter-share");
        for (let recipient = 0; recipient < 4; recipient += 1) {
            const tray = make("div", "counter-share__tray");
            tray.dataset.drawPart = "";
            tray.append(make("b", "", `Pupil ${recipient + 1}`));
            for (let counter = 0; counter < 7; counter += 1) tray.append(dot());
            counterDrawing.append(tray);
        }
        const looseCounter = make("div", "counter-share__loose");
        looseCounter.dataset.drawPart = "";
        looseCounter.append(dot(), make("b", "", "1 left"));
        counterDrawing.append(looseCounter);
        const exactDrawing = layer("exact", "exact-share");
        for (let tank = 1; tank <= 4; tank += 1) {
            const row = make("div", "exact-share__row");
            row.dataset.drawPart = "";
            const gauge = make("div", "exact-share__tank");
            for (let part = 0; part < 8; part += 1) gauge.append(document.createElement("span"));
            row.append(make("span", "", `Tank ${tank}`), gauge, make("span", "exact-share__amount", "7¼ L"));
            exactDrawing.append(row);
        }
        const downDrawing = layer("down", "complete-groups");
        const completeHeading = make("div", "complete-groups__heading", "Only finished bouquets count");
        completeHeading.dataset.drawPart = "";
        downDrawing.append(completeHeading);
        for (let bouquet = 0; bouquet < 7; bouquet += 1) {
            const group = make("div", "complete-groups__bouquet");
            group.dataset.drawPart = "";
            for (let flower = 0; flower < 4; flower += 1) {
                const bloom = dot();
                bloom.classList.add("scenario-flower");
                group.append(bloom);
            }
            downDrawing.append(group);
        }
        const looseFlower = make("div", "complete-groups__loose");
        looseFlower.dataset.drawPart = "";
        const singleFlower = dot();
        singleFlower.classList.add("scenario-flower");
        looseFlower.append(singleFlower, make("b", "", "Not another bouquet"));
        downDrawing.append(looseFlower);
        const upDrawing = layer("up", "groups-needed");
        const neededHeading = make("div", "groups-needed__heading", "Every passenger needs a seat");
        neededHeading.dataset.drawPart = "";
        upDrawing.append(neededHeading);
        for (let car = 0; car < 8; car += 1) {
            const vehicle = make("div", "groups-needed__car");
            vehicle.dataset.drawPart = "";
            for (let seat = 0; seat < 4; seat += 1) {
                const place = make("span", `groups-needed__seat${car < 7 || seat === 0 ? " is-filled" : ""}`);
                vehicle.append(place);
            }
            upDrawing.append(vehicle);
        }
        const dots = stages.map(() => {
            const dot = document.createElement("span");
            dot.className = "remainder-scene__dot";
            progress.append(dot);
            return dot;
        });
        let currentStage = -1;
        let cardHeight = sticky.offsetHeight;
        let ticking = false;
        const setSceneSize = () => {
            if (reduceMotion.matches) {
                scene.style.setProperty("--scene-height", `${cardHeight}px`);
                scene.style.setProperty("--scene-min-height", `${cardHeight}px`);
            } else {
                scene.style.setProperty("--scene-height", `${(stages.length + 1) * 48}vh`);
                scene.style.setProperty("--scene-min-height", `${(stages.length + 1) * 330}px`);
            }
        };

        const paint = (stage, localProgress = 1) => {
            const [heading, sentence, meaning] = stages[stage];
            if (stage !== currentStage) {
                currentStage = stage;
                title.textContent = heading;
                copy.textContent = sentence;
                cards.forEach((card) => card.classList.toggle("is-current", card.dataset.meaning === meaning));
                dots.forEach((stageDot, index) => {
                    stageDot.classList.toggle("is-current", index === stage);
                    stageDot.classList.toggle("is-past", index < stage);
                });
                drawings.forEach((drawing, key) => drawing.classList.toggle("is-active", key === meaning));
            }
            if (!meaning) return;
            const parts = Array.from(drawings.get(meaning).querySelectorAll("[data-draw-part]"));
            const drawingProgress = clamp(localProgress / .58);
            parts.forEach((part, index) => {
                const reveal = clamp(drawingProgress * parts.length - index);
                part.style.opacity = reveal;
                part.style.transform = `translateY(${(1 - reveal) * 10}px) scale(${.96 + reveal * .04})`;
            });
        };

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

        const dock = (offset = 0, preserveSize = false) => {
            if (sticky.parentNode !== scene) moveCard(() => scene.insertBefore(sticky, scene.firstChild));
            sticky.classList.remove("is-pinned");
            sticky.style.removeProperty("left");
            sticky.style.removeProperty("transform");
            sticky.style.top = `${offset}px`;
            if (preserveSize) {
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
        const update = () => {
            ticking = false;
            if (reduceMotion.matches) {
                dock(0);
                drawings.forEach((drawing, key) => drawing.classList.toggle("is-active", key === "left"));
                counterDrawing.querySelectorAll("[data-draw-part]").forEach((part) => {
                    part.style.opacity = 1;
                    part.style.transform = "none";
                });
                cards.forEach((card) => card.classList.remove("is-current"));
                title.textContent = "Four interpretations of the same remainder";
                copy.textContent = "Use the wording and the unit to choose the answer that fits the situation.";
                dots.forEach((stageDot) => {
                    stageDot.classList.remove("is-current");
                    stageDot.classList.add("is-past");
                });
                return;
            }
            const rect = scene.getBoundingClientRect();
            const scale = scene.offsetWidth && rect.width ? rect.width / scene.offsetWidth : 1;
            const pinTop = Math.max(16, (window.innerHeight - cardHeight * scale) / 2);
            const travel = Math.max(1, scene.offsetHeight - cardHeight);
            const distance = pinTop - rect.top;
            const visualTravel = travel * scale;
            const position = clamp(distance / visualTravel) * stages.length;
            const stage = Math.min(stages.length - 1, Math.floor(position));
            const localProgress = clamp(position - stage);
            if (distance <= 0) dock(0);
            else if (distance >= visualTravel) dock(travel, true);
            else pin(rect.left, pinTop, scene.offsetWidth, scale);
            paint(stage, localProgress);
        };
        const requestUpdate = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        };
        const reset = () => {
            dock(0);
            cardHeight = sticky.offsetHeight;
            setSceneSize();
            currentStage = -1;
            requestUpdate();
        };
        scene.classList.add("is-ready");
        cardHeight = sticky.offsetHeight;
        setSceneSize();
        update();
        window.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", reset);
        if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", reset);
        else reduceMotion.addListener(reset);
        if (document.fonts?.ready) document.fonts.ready.then(reset);
    }

    const lab = document.querySelector("[data-remainder-lab]");
    if (!lab) return;
    const totalInput = lab.querySelector("[data-total-input]");
    const divisorInput = lab.querySelector("[data-divisor-input]");
    const fact = lab.querySelector("[data-fact]");
    const remainderAnswer = lab.querySelector("[data-remainder-answer]");
    const exactAnswer = lab.querySelector("[data-exact-answer]");
    const downAnswer = lab.querySelector("[data-down-answer]");
    const upAnswer = lab.querySelector("[data-up-answer]");
    const note = lab.querySelector("[data-lab-note]");
    const gcd = (a, b) => {
        let x = a;
        let y = b;
        while (y) [x, y] = [y, x % y];
        return x;
    };
    const clean = (input, maximum) => {
        const before = input.value;
        const selection = input.selectionStart ?? before.length;
        const after = before.replace(/\D/g, "").slice(0, maximum).replace(/^0+(?=\d)/, "");
        if (before !== after) {
            input.value = after;
            const next = Math.max(0, Math.min(after.length, selection - (before.length - after.length)));
            input.setSelectionRange(next, next);
        }
        return after;
    };
    const decimalText = (total, divisor) => {
        const value = total / divisor;
        const rounded = Number(value.toFixed(6));
        return Number.isInteger(value) ? String(value) : `${rounded}${Math.abs(value - rounded) > 1e-10 ? "…" : ""}`;
    };
    const updateLab = () => {
        const totalText = clean(totalInput, 4);
        const divisorText = clean(divisorInput, 1);
        const total = Number(totalText);
        const divisor = Number(divisorText);
        totalInput.setAttribute("aria-invalid", String(!totalText || total < 1));
        divisorInput.setAttribute("aria-invalid", String(!divisorText || divisor < 2 || divisor > 9));
        if (!totalText || !divisorText || divisor < 2 || divisor > 9 || total < 1) {
            fact.textContent = "Enter a positive amount and a divisor from 2 to 9.";
            remainderAnswer.textContent = "—";
            exactAnswer.textContent = "—";
            downAnswer.textContent = "—";
            upAnswer.textContent = "—";
            note.textContent = "Both entries are needed before the interpretations can be compared.";
            return;
        }
        const quotient = Math.floor(total / divisor);
        const remainder = total % divisor;
        fact.textContent = `${total.toLocaleString("en-GB")} ÷ ${divisor} = ${quotient} remainder ${remainder}`;
        remainderAnswer.textContent = `${quotient} remainder ${remainder}`;
        downAnswer.textContent = String(quotient);
        upAnswer.textContent = String(Math.ceil(total / divisor));
        if (remainder === 0) {
            exactAnswer.textContent = String(quotient);
            note.textContent = "There is no remainder, so every interpretation gives the same whole-number result.";
            return;
        }
        const factor = gcd(remainder, divisor);
        const fraction = `${remainder / factor}/${divisor / factor}`;
        exactAnswer.textContent = `${quotient ? `${quotient} ` : ""}${fraction} = ${decimalText(total, divisor)}`;
        note.textContent = "The remainder is non-zero, so the complete-groups and groups-needed answers differ by one.";
    };
    totalInput.addEventListener("input", updateLab);
    divisorInput.addEventListener("input", updateLab);
    updateLab();
})();
