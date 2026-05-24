document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('angle-svg');
    const dot = document.getElementById('angle-dot');
    const angleRay = document.getElementById('angle-ray');
    const angleArc = document.getElementById('angle-arc');
    const angleLabel = document.getElementById('angle-value');
    const prompt = document.getElementById('angle-prompt');

    const center = { x: 238, y: 340 };
    const radius = 238;
    const arcRadius = 100;
    let angle = Math.PI * 0.25;
    let dragging = false;
    let savedScrollX = 0;
    let savedScrollY = 0;
    let previousBodyStyle = {};
    let previousHtmlStyle = {};
    const readout = document.querySelector('.angle-readout');
    let lastPointer = { x: 0, y: 0, t: 0 };

    const setGlowIntensity = (intensity) => {
        if (!readout) return;
        const clamped = Math.max(0, Math.min(1, intensity));
        readout.style.setProperty('--glow-alpha', `${0.18 + clamped * 0.4}`);
        readout.style.setProperty('--glow-spread', `${6 + clamped * 14}px`);
        readout.style.setProperty('--glow-radius', `${18 + clamped * 20}px`);
    };

    const wakeGlow = () => {
        if (!readout) return;
        readout.classList.remove('glow');
        void readout.offsetWidth;
        readout.classList.add('glow');
    };

    const update = () => {
        const x = center.x + radius * Math.cos(angle);
        const y = center.y - radius * Math.sin(angle);

        dot.setAttribute('cx', x);
        dot.setAttribute('cy', y);
        angleRay.setAttribute('x1', center.x);
        angleRay.setAttribute('y1', center.y);
        angleRay.setAttribute('x2', x);
        angleRay.setAttribute('y2', y);

        let path;
        if (Math.abs(angle - 2 * Math.PI) < 0.001) {
            const midX = center.x + arcRadius;
            const midY = center.y;
            path = `M ${midX} ${midY} A ${arcRadius} ${arcRadius} 0 1 0 ${center.x - arcRadius} ${midY} A ${arcRadius} ${arcRadius} 0 1 0 ${midX} ${midY}`;
        } else {
            const arcX = center.x + arcRadius * Math.cos(angle);
            const arcY = center.y - arcRadius * Math.sin(angle);
            const startX = center.x + arcRadius;
            const startY = center.y;
            const largeArc = angle > Math.PI ? 1 : 0;
            const sweepFlag = 0;
            path = `M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 ${largeArc} ${sweepFlag} ${arcX} ${arcY}`;
        }
        angleArc.setAttribute('d', path);

        let labelAngle = angle / 2;
        let centroidRadius = arcRadius * (Math.sin(angle / 2) / (angle / 2 || 1));
        let labelRadius = centroidRadius + 30;
        if (angle < Math.PI / 4.5) {
            labelRadius = centroidRadius + 30 + (Math.PI / 4.5 - angle) * 35;
            labelAngle = labelAngle - (Math.PI / 4.5 - angle) / 3;
        }
        if (angle === 0) {
            labelRadius = arcRadius + 30 + (Math.PI / 4.5) * 35;
        }

        const labelX = center.x + labelRadius * Math.cos(labelAngle);
        const labelY = center.y - labelRadius * Math.sin(labelAngle);
        document.getElementById('angle-theta').setAttribute('x', labelX);
        document.getElementById('angle-theta').setAttribute('y', labelY);

        const dotX = center.x + radius * Math.cos(angle);
        const dotY = center.y - radius * Math.sin(angle);
        prompt.setAttribute('transform', `translate(${dotX - 85}, ${dotY - 68})`);

        const degrees = (angle * 180 / Math.PI).toFixed(1);
        const radians = angle.toFixed(3);
        const gradians = (angle * 200 / Math.PI).toFixed(1);
        const newLabel = `${degrees}°, ${radians} rad, ${gradians} grad`;

        if (angleLabel.textContent !== newLabel) {
            angleLabel.textContent = newLabel;
            if (readout) {
                wakeGlow();
            }
        }
    };

    const getSvgPoint = (clientX, clientY) => {
        const point = svg.createSVGPoint();
        point.x = clientX;
        point.y = clientY;
        return point.matrixTransform(svg.getScreenCTM().inverse());
    };

    const normalizeAngle = (value) => {
        let normalized = value;
        while (normalized < 0) normalized += 2 * Math.PI;
        while (normalized >= 2 * Math.PI) normalized -= 2 * Math.PI;
        return normalized;
    };

    const updateAngleFromEvent = (event) => {
        const point = getSvgPoint(event.clientX, event.clientY);
        const dx = point.x - center.x;
        const dy = center.y - point.y;
        let newAngle = Math.atan2(dy, dx);
        newAngle = normalizeAngle(newAngle);

        if (angle < Math.PI / 2 && newAngle > Math.PI) {
            newAngle = 0;
        } else if (angle > 3 * Math.PI / 2 && newAngle < Math.PI) {
            newAngle = 2 * Math.PI;
        }

        angle = newAngle;
        update();
    };

    const preventScroll = (event) => {
        if (!dragging) return;
        event.preventDefault();
    };

    const lockScroll = () => {
        savedScrollX = window.pageXOffset;
        savedScrollY = window.pageYOffset;
        previousBodyStyle = {
            position: document.body.style.position,
            top: document.body.style.top,
            left: document.body.style.left,
            width: document.body.style.width,
            overflow: document.body.style.overflow,
            overscrollBehavior: document.body.style.overscrollBehavior,
        };
        previousHtmlStyle = {
            overflow: document.documentElement.style.overflow,
            overscrollBehavior: document.documentElement.style.overscrollBehavior,
        };

        const bodyRect = document.body.getBoundingClientRect();
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${savedScrollY}px`;
        document.body.style.left = `${bodyRect.left}px`;
        document.body.style.width = `${bodyRect.width}px`;
        document.body.style.overscrollBehavior = 'none';
        document.documentElement.style.overscrollBehavior = 'none';

        document.addEventListener('touchmove', preventScroll, { passive: false, capture: true });
        document.addEventListener('wheel', preventScroll, { passive: false, capture: true });
        document.addEventListener('scroll', preventScroll, { passive: false, capture: true });
    };

    const unlockScroll = () => {
        document.removeEventListener('touchmove', preventScroll, true);
        document.removeEventListener('wheel', preventScroll, true);
        document.removeEventListener('scroll', preventScroll, true);

        document.body.style.position = previousBodyStyle.position;
        document.body.style.top = previousBodyStyle.top;
        document.body.style.left = previousBodyStyle.left;
        document.body.style.width = previousBodyStyle.width;
        document.body.style.overflow = previousBodyStyle.overflow;
        document.body.style.overscrollBehavior = previousBodyStyle.overscrollBehavior;
        document.documentElement.style.overflow = previousHtmlStyle.overflow;
        document.documentElement.style.overscrollBehavior = previousHtmlStyle.overscrollBehavior;

        window.scrollTo(savedScrollX, savedScrollY);
    };

    dot.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        dragging = true;
        lastPointer = { x: event.clientX, y: event.clientY, t: event.timeStamp };
        setGlowIntensity(0.4);
        dot.classList.add('dragging');
        prompt.style.opacity = '0';
        lockScroll();
        event.preventDefault();
        dot.setPointerCapture(event.pointerId);
    }, { passive: false });

    document.addEventListener('pointermove', (event) => {
        if (!dragging) return;
        event.preventDefault();
        const dt = event.timeStamp - lastPointer.t;
        if (dt > 0) {
            const dx = event.clientX - lastPointer.x;
            const dy = event.clientY - lastPointer.y;
            const speed = Math.sqrt(dx * dx + dy * dy) / dt;
            const intensity = Math.min(1, speed / 2.5);
            setGlowIntensity(intensity);
        }
        lastPointer = { x: event.clientX, y: event.clientY, t: event.timeStamp };
        updateAngleFromEvent(event);
    }, { passive: false });

    const stopDragging = () => {
        if (!dragging) return;
        dragging = false;
        dot.classList.remove('dragging');
        unlockScroll();
    };

    document.addEventListener('pointerup', stopDragging);
    document.addEventListener('pointercancel', stopDragging);

    if (readout) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    prompt.classList.add('prompt-visible');
                    obs.disconnect();
                }
            });
        }, { threshold: 0.2 });
        observer.observe(readout);
    }

    const angleHighlightTriggers = document.querySelectorAll('.angle-highlight-trigger');
    angleHighlightTriggers.forEach((trigger) => {
        trigger.addEventListener('mouseenter', () => {
            angleArc.classList.add('highlighted');
            document.getElementById('angle-theta').classList.add('highlighted');
        });
        trigger.addEventListener('mouseleave', () => {
            angleArc.classList.remove('highlighted');
            document.getElementById('angle-theta').classList.remove('highlighted');
        });
    });

    const lineHighlightTriggers = document.querySelectorAll('.line-highlight-trigger');
    const referenceLine = document.querySelector('.reference-line');
    lineHighlightTriggers.forEach((trigger) => {
        trigger.addEventListener('mouseenter', () => {
            angleRay.classList.add('highlighted');
            if (referenceLine) {
                referenceLine.classList.add('highlighted');
            }
        });
        trigger.addEventListener('mouseleave', () => {
            angleRay.classList.remove('highlighted');
            if (referenceLine) {
                referenceLine.classList.remove('highlighted');
            }
        });
    });

    const card = document.getElementById('fading-card');
    const cardArrowHint = document.getElementById('scroll-help-arrow');
    const radiansArrowHint = document.getElementById('scroll-help-arrow-below');
    const radiansSection = document.getElementById('radians-section');
    const gradiansSection = document.getElementById('gradians-section');
    const gradiansQuiz = document.querySelector('.gradians-quiz');
    const arcUnitsSection = document.querySelector('.arc-units-flyin');

    let cardAnimationProgress = 0;
    const cardStart = () => window.innerHeight * 0.75;
    const cardEnd = () => window.innerHeight * 0.5;

    const updateCardAppearance = (progress) => {
        if (!card) return;
        cardAnimationProgress = Math.min(1, Math.max(0, progress));
        const translateX = -120 + cardAnimationProgress * 120;
        card.style.transform = `translateX(${translateX}%)`;
        card.style.opacity = `${cardAnimationProgress}`;
        if (cardAnimationProgress === 1) {
            card.classList.add('revealed');
        } else {
            card.classList.remove('revealed');
        }
        if (cardArrowHint) {
            cardArrowHint.style.transform = 'translateX(-50%)';
            cardArrowHint.style.opacity = 1 - cardAnimationProgress;
        }
    };

    const updateRadiansAppearance = (progress, exitProgress = 0) => {
        if (!radiansSection) return;
        const clamped = Math.min(1, Math.max(0, progress));
        const exitClamped = Math.min(1, Math.max(0, exitProgress));
        const baseY = 80 - clamped * 80;
        const exitY = exitClamped * 120;
        radiansSection.style.transform = `translateY(${baseY - exitY}px)`;
        radiansSection.style.opacity = `${Math.max(0, clamped * (1 - exitClamped))}`;
        if (radiansArrowHint) {
            radiansArrowHint.style.transform = `translate(-50%, ${clamped * 64 + exitClamped * 90}px)`;
            radiansArrowHint.style.opacity = `${Math.max(0, 1 - clamped - exitClamped * 0.75)}`;
        }
        if (clamped === 1 && exitClamped === 0) {
            radiansSection.classList.add('revealed');
        } else {
            radiansSection.classList.remove('revealed');
        }
    };

    const animateCardFromScroll = () => {
        if (!card) return;
        const currentCardTop = card.getBoundingClientRect().top;
        const start = cardStart();
        const end = cardEnd();
        let progress = 0;

        if (currentCardTop <= end) {
            progress = 1;
        } else if (currentCardTop >= start) {
            progress = 0;
        } else {
            progress = (start - currentCardTop) / (start - end);
        }

        updateCardAppearance(progress);
    };

    const updateGradiansAppearance = (progress) => {
        if (!gradiansQuiz) return;
        const clamped = Math.min(1, Math.max(0, progress));
        const translateY = 80 - clamped * 80;
        gradiansQuiz.style.transform = `translateY(${translateY}px)`;
        gradiansQuiz.style.opacity = `${clamped}`;

        if (clamped === 1) {
            gradiansQuiz.classList.add('revealed');
        } else {
            gradiansQuiz.classList.remove('revealed');
        }
    };

    const animateRadiansFromScroll = () => {
        if (!radiansSection) return;
        const currentSectionTop = radiansSection.getBoundingClientRect().top;
        const start = cardStart();
        const end = cardEnd();
        let progress = 0;

        if (currentSectionTop <= end) {
            progress = 1;
        } else if (currentSectionTop >= start) {
            progress = 0;
        } else {
            progress = (start - currentSectionTop) / (start - end);
        }

        let exitProgress = 0;
        if (gradiansSection) {
            const gradiansTop = gradiansSection.getBoundingClientRect().top;
            const exitStart = window.innerHeight;
            const exitEnd = 0;
            if (gradiansTop <= exitEnd) {
                exitProgress = 1;
            } else if (gradiansTop >= exitStart) {
                exitProgress = 0;
            } else {
                exitProgress = (exitStart - gradiansTop) / (exitStart - exitEnd);
            }
        }

        updateRadiansAppearance(progress, exitProgress);
    };

    const animateGradiansFromScroll = () => {
        if (!gradiansQuiz) return;
        const currentQuizTop = gradiansQuiz.getBoundingClientRect().top;
        const start = cardStart();
        const end = cardEnd();
        let progress = 0;

        if (currentQuizTop <= end) {
            progress = 1;
        } else if (currentQuizTop >= start) {
            progress = 0;
        } else {
            progress = (start - currentQuizTop) / (start - end);
        }

        updateGradiansAppearance(progress);
    };

    const animateArcUnitsFromScroll = () => {
        if (!arcUnitsSection) return;
        const currentSectionTop = arcUnitsSection.getBoundingClientRect().top;
        const start = cardStart();
        const end = cardEnd();
        let progress = 0;

        if (currentSectionTop <= end) {
            progress = 1;
        } else if (currentSectionTop >= start) {
            progress = 0;
        } else {
            progress = (start - currentSectionTop) / (start - end);
        }

        const clamped = Math.min(1, Math.max(0, progress));
        arcUnitsSection.style.transform = `translateX(${-70 + clamped * 70}px)`;
        arcUnitsSection.style.opacity = `${clamped}`;
        if (clamped === 1) {
            arcUnitsSection.classList.add('revealed');
        } else {
            arcUnitsSection.classList.remove('revealed');
        }
    };

    const handleCardScroll = () => {
        animateCardFromScroll();
        animateRadiansFromScroll();
        animateGradiansFromScroll();
        animateArcUnitsFromScroll();
    };

    window.addEventListener('scroll', handleCardScroll, { passive: true });

    animateCardFromScroll();
    animateRadiansFromScroll();

    const setupQuizAnswerChecking = () => {
        const inputs = document.querySelectorAll('.quiz-answer');
        inputs.forEach((input) => {
            const feedback = input.closest('div').querySelector('.quiz-feedback');
            const correctValue = Number(input.dataset.answer);
            const correctText = input.dataset.correctText || 'Correct!';

            const showFeedback = (message, isCorrect) => {
                if (!feedback) return;
                feedback.textContent = message;
                feedback.style.color = isCorrect ? '#8adc8a' : '#f2c6c2';
            };

            input.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                const value = input.value.trim();
                const numeric = Number(value);
                if (value === '' || Number.isNaN(numeric)) {
                    showFeedback('Type a number and press Enter.', false);
                    return;
                }
                if (Math.abs(numeric - correctValue) < 0.5) {
                    showFeedback(correctText, true);
                } else {
                    showFeedback('Not quite — try again.', false);
                }
            });
        });
    };

    setupQuizAnswerChecking();

    // --- Pinpoint game setup ---
    (function () {
        const board = document.getElementById('pin-board');
        const pin = document.getElementById('pin-handle');
        const targetXSpan = document.getElementById('pin-target-x');
        const targetYSpan = document.getElementById('pin-target-y');
        const currentXSpan = document.getElementById('pin-current-x');
        const currentYSpan = document.getElementById('pin-current-y');
        const errorSpan = document.getElementById('pin-error');
        const newBtn = document.getElementById('pin-new-challenge');
        const revealBtn = document.getElementById('pin-reveal-answer');
        const extraInfo = document.getElementById('pin-extra-info');
        const targetMarker = document.getElementById('pin-target-marker');

        if (!board || !pin) return;

        let draggingPin = false;
        let dragOffset = { x: 0, y: 0 };
        const dragActivationRadius = 42;
        let targetX = 0.73;
        let targetY = 0.41;

        function setDraggingCursor(active) {
            pin.style.cursor = active ? 'grabbing' : 'grab';
        }

        function setTarget() {
            targetX = Math.round((Math.random() * 0.9 + 0.05) * 100) / 100;
            targetY = Math.round((Math.random() * 0.9 + 0.05) * 100) / 100;
            targetXSpan.textContent = targetX.toFixed(3);
            targetYSpan.textContent = targetY.toFixed(3);
            if (targetMarker) {
                targetMarker.style.left = `${targetX * 100}%`;
                targetMarker.style.top = `${(1 - targetY) * 100}%`;
            }
            updateError();
        }

        function setExtraVisibility(visible) {
            if (extraInfo) {
                extraInfo.classList.toggle('hidden', !visible);
            }
            if (targetMarker) {
                targetMarker.classList.toggle('hidden', !visible);
            }
            if (revealBtn) {
                revealBtn.textContent = visible ? 'Hide answer' : 'Reveal answer';
            }
        }

        function clampRange(v) {
            return Math.min(1.1, Math.max(-0.1, v));
        }

        function updatePinFromEvent(e, offsetX = 0, offsetY = 0) {
            const rect = board.getBoundingClientRect(); // element-relative coords [web:22]
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            let x = (clientX - offsetX - rect.left) / rect.width;
            let y = 1 - (clientY - offsetY - rect.top) / rect.height;

            x = clampRange(x);
            y = clampRange(y);

            pin.style.left = (x * 100) + '%';
            pin.style.top = ((1 - y) * 100) + '%';

            currentXSpan.textContent = x.toFixed(3);
            currentYSpan.textContent = y.toFixed(3);

            updateError(x, y);
        }

        function updateError(x, y) {
            if (typeof x !== 'number') {
                const currentX = parseFloat(currentXSpan.textContent) || 0;
                const currentY = parseFloat(currentYSpan.textContent) || 0;
                x = currentX;
                y = currentY;
            }
            const dx = x - targetX;
            const dy = y - targetY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            errorSpan.textContent = dist.toFixed(3);
        }

        // mouse
        pin.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            const pinRect = pin.getBoundingClientRect();
            const tipX = pinRect.left + pinRect.width / 2;
            const tipY = pinRect.top + pinRect.height;
            const dx = e.clientX - tipX;
            const dy = e.clientY - tipY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > dragActivationRadius) return;
            e.preventDefault();
            draggingPin = true;
            dragOffset = { x: e.clientX - tipX, y: e.clientY - tipY };
            setDraggingCursor(true);
        });
        document.addEventListener('mousemove', (e) => {
            if (!draggingPin) return;
            e.preventDefault();
            updatePinFromEvent(e, dragOffset.x, dragOffset.y);
        });
        document.addEventListener('mouseup', () => {
            if (!draggingPin) return;
            draggingPin = false;
            setDraggingCursor(false);
        });

        // touch
        pin.addEventListener('touchstart', (e) => {
            const pinRect = pin.getBoundingClientRect();
            const tipX = pinRect.left + pinRect.width / 2;
            const tipY = pinRect.top + pinRect.height;
            const touch = e.touches[0];
            const dx = touch.clientX - tipX;
            const dy = touch.clientY - tipY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > dragActivationRadius) return;
            e.preventDefault();
            draggingPin = true;
            dragOffset = { x: touch.clientX - tipX, y: touch.clientY - tipY };
            setDraggingCursor(true);
        }, { passive: false });
        document.addEventListener('touchmove', (e) => {
            if (!draggingPin) return;
            e.preventDefault();
            updatePinFromEvent(e, dragOffset.x, dragOffset.y);
        }, { passive: false });
        document.addEventListener('touchend', () => {
            if (!draggingPin) return;
            draggingPin = false;
            setDraggingCursor(false);
        });

        // board taps no longer reposition the pin unless started near the pin handle

        if (newBtn) {
            newBtn.addEventListener('click', () => {
                setTarget();
                setExtraVisibility(false);
            });
        }

        if (revealBtn) {
            revealBtn.addEventListener('click', () => {
                const isVisible = extraInfo && !extraInfo.classList.contains('hidden');
                setExtraVisibility(!isVisible);
            });
        }

        setTarget();
        setExtraVisibility(false);
    })();
    // --- end pinpoint game setup ---

    update();
});
