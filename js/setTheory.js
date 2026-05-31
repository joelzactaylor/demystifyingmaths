document.addEventListener('DOMContentLoaded', function () {

    // ================================================================================================
    // SORTING STRAIGHT LETTERS ACTIVITY
    // ================================================================================================

    const names = [
        'HELEN',
        'MATT',
        'IVAN',
        'WALT',
        'FELIX',
        'BEN',
        'CARL',
        'DAVE',
        'SOPHIE',
        'JULIA',
        'TOM',
        'LISA',
        'MAX',
        'ZOE'
    ];

    const straightLetters = new Set([
        'A', 'E', 'F', 'H', 'I', 'K', 'L', 'M', 'N', 'T', 'V', 'W', 'X', 'Y', 'Z'
    ]);

    function hasOnlyStraightLetters(name) {
        return name
            .toUpperCase()
            .split('')
            .every(
                ch =>
                    straightLetters.has(ch) ||
                    !/[A-Z]/i.test(ch)
            );
    }

    function createStickFigure(name) {
        const container = document.createElement('div');
        container.className = 'stick-figure';
        container.dataset.name = name;
        container.dataset.correct = hasOnlyStraightLetters(name);
        container.dataset.activity = 'straight-letters';

        const wrapper = document.createElement('div');
        wrapper.className = 'figure-wrapper';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.className = 'figure-svg';
        svg.setAttribute('viewBox', '0 0 50 70');

        const head = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        head.setAttribute('cx', '25');
        head.setAttribute('cy', '15');
        head.setAttribute('r', '8');
        head.setAttribute('fill', 'none');
        head.setAttribute('stroke', '#2c3e50');
        head.setAttribute('stroke-width', '2');

        const body = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        body.setAttribute('x1', '25');
        body.setAttribute('y1', '23');
        body.setAttribute('x2', '25');
        body.setAttribute('y2', '45');
        body.setAttribute('stroke', '#2c3e50');
        body.setAttribute('stroke-width', '2');

        const leftArm = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        leftArm.setAttribute('x1', '25');
        leftArm.setAttribute('y1', '30');
        leftArm.setAttribute('x2', '10');
        leftArm.setAttribute('y2', '38');
        leftArm.setAttribute('stroke', '#2c3e50');
        leftArm.setAttribute('stroke-width', '2');

        const rightArm = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        rightArm.setAttribute('x1', '25');
        rightArm.setAttribute('y1', '30');
        rightArm.setAttribute('x2', '40');
        rightArm.setAttribute('y2', '38');
        rightArm.setAttribute('stroke', '#2c3e50');
        rightArm.setAttribute('stroke-width', '2');

        const leftLeg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        leftLeg.setAttribute('x1', '25');
        leftLeg.setAttribute('y1', '45');
        leftLeg.setAttribute('x2', '15');
        leftLeg.setAttribute('y2', '65');
        leftLeg.setAttribute('stroke', '#2c3e50');
        leftLeg.setAttribute('stroke-width', '2');

        const rightLeg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        rightLeg.setAttribute('x1', '25');
        rightLeg.setAttribute('y1', '45');
        rightLeg.setAttribute('x2', '35');
        rightLeg.setAttribute('y2', '65');
        rightLeg.setAttribute('stroke', '#2c3e50');
        rightLeg.setAttribute('stroke-width', '2');

        svg.appendChild(head);
        svg.appendChild(body);
        svg.appendChild(leftArm);
        svg.appendChild(rightArm);
        svg.appendChild(leftLeg);
        svg.appendChild(rightLeg);

        const nameLabel = document.createElement('div');
        nameLabel.className = 'figure-name';
        nameLabel.textContent = name;

        wrapper.appendChild(svg);
        wrapper.appendChild(nameLabel);
        container.appendChild(wrapper);

        return container;
    }

    const figuresContainer = document.getElementById('figures-container');
    if (figuresContainer) {
        const shuffledNames = [...names].sort(() => Math.random() - 0.5);
        shuffledNames.forEach(name => {
            figuresContainer.appendChild(createStickFigure(name));
        });
    }

    // ================================================================================================
    // PRIME SORTING ACTIVITY
    // ================================================================================================

    const numbers = [
        2, 3, 4, 5, 7, 8, 9, 11, 13, 15,
        17, 19, 20, 23, 24, 29, 30, 31, 37, 41,
        43, 44, 47, 49, 50, 53, 57, 59, 61, 67
    ];

    function isPrime(num) {
        if (num <= 1) return false;
        if (num <= 3) return true;
        if (num % 2 === 0 || num % 3 === 0) return false;
        for (let i = 5; i * i <= num; i += 6) {
            if (num % i === 0 || num % (i + 2) === 0) return false;
        }
        return true;
    }

    function createNumberItem(number) {
        const container = document.createElement('div');
        container.className = 'number-item';
        container.dataset.number = number;
        container.dataset.isPrime = isPrime(number);
        container.dataset.activity = 'prime';

        const circle = document.createElement('div');
        circle.className = 'number-circle';
        circle.textContent = number;

        container.appendChild(circle);
        return container;
    }

    const numbersContainer = document.getElementById('numbers-container');
    if (numbersContainer) {
        const shuffledNumbers = [...numbers].sort(() => Math.random() - 0.5);
        shuffledNumbers.forEach(number => {
            numbersContainer.appendChild(createNumberItem(number));
        });
    }

    // ================================================================================================
    // SHARED DRAG AND DROP FOR THESE TWO ACTIVITIES
    // ================================================================================================

    let draggedElement = null;
    let originalParent = null;
    let offset = { x: 0, y: 0 };

    function handleMouseDown(e) {
        const figure = e.target.closest('.stick-figure');
        const numberItem = e.target.closest('.number-item');
        const element = figure || numberItem;
        if (!element) return;

        e.preventDefault();
        startDrag(element, e.pageX, e.pageY);
    }

    function handleTouchStart(e) {
        const figure = e.target.closest('.stick-figure');
        const numberItem = e.target.closest('.number-item');
        const element = figure || numberItem;
        if (!element) return;

        e.preventDefault();
        const t = e.touches[0];
        startDrag(element, t.pageX, t.pageY);
    }

    function startDrag(element, startPageX, startPageY) {
        draggedElement = element;
        originalParent = element.parentElement;

        const rect = element.getBoundingClientRect();
        const docLeft = rect.left + window.scrollX;
        const docTop = rect.top + window.scrollY;

        offset.x = startPageX - docLeft;
        offset.y = startPageY - docTop;

        element.classList.add('dragging');
        element.classList.remove('correct', 'incorrect');

        // Drag relative to the whole document
        document.body.appendChild(element);
        element.style.position = 'absolute';

        moveDrag(startPageX, startPageY);

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
    }

    function handleMouseMove(e) {
        if (!draggedElement) return;
        e.preventDefault();
        moveDrag(e.pageX, e.pageY);
    }

    function handleTouchMove(e) {
        if (!draggedElement) return;
        e.preventDefault();
        const t = e.touches[0];
        moveDrag(t.pageX, t.pageY);
    }

    function moveDrag(pageX, pageY) {
        const x = pageX - offset.x;
        const y = pageY - offset.y;
        draggedElement.style.left = x + 'px';
        draggedElement.style.top = y + 'px';
    }

    function handleMouseUp(e) {
        if (!draggedElement) return;
        endDrag();
        e.preventDefault();
    }

    function handleTouchEnd(e) {
        if (!draggedElement) return;
        endDrag();
        e.preventDefault();
    }

    function endDrag() {
        if (!draggedElement) return;

        draggedElement.classList.remove('dragging');

        const activity = draggedElement.dataset.activity;
        const figuresContainer = document.getElementById('figures-container');
        const numbersContainer = document.getElementById('numbers-container');
        const poolContainer = activity === 'prime' ? numbersContainer : figuresContainer;

        const boxes = document.querySelectorAll('.sort-box');
        let droppedContainer = null;
        let targetZone = null;

        const poolRect = poolContainer.getBoundingClientRect();
        const elementRect = draggedElement.getBoundingClientRect();
        const centroidX = elementRect.left + elementRect.width / 2;
        const centroidY = elementRect.top + elementRect.height / 2;

        if (
            centroidX >= poolRect.left &&
            centroidX <= poolRect.right &&
            centroidY >= poolRect.top &&
            centroidY <= poolRect.bottom
        ) {
            droppedContainer = poolContainer;
            targetZone = 'pool';
        }

        if (!droppedContainer) {
            boxes.forEach(box => {
                const rect = box.getBoundingClientRect();
                if (
                    centroidX >= rect.left &&
                    centroidX <= rect.right &&
                    centroidY >= rect.top &&
                    centroidY <= rect.bottom
                ) {
                    droppedContainer = box;
                    targetZone = 'box';
                }
            });
        }

        if (droppedContainer) {
            if (targetZone === 'pool') {
                poolContainer.appendChild(draggedElement);
                draggedElement.style.position = 'relative';
                draggedElement.style.left = 'auto';
                draggedElement.style.top = 'auto';
                draggedElement.classList.remove('correct', 'incorrect');
            } else {
                const dropZone = droppedContainer.querySelector('.drop-zone');
                dropZone.appendChild(draggedElement);
                draggedElement.style.position = 'relative';
                draggedElement.style.left = 'auto';
                draggedElement.style.top = 'auto';

                if (activity === 'straight-letters') {
                    const isCorrect = draggedElement.dataset.correct === 'true';
                    const shouldBeStraight = droppedContainer.id === 'straight-box';
                    if (isCorrect === shouldBeStraight) {
                        draggedElement.classList.add('correct');
                        draggedElement.classList.remove('incorrect');
                    } else {
                        draggedElement.classList.add('incorrect');
                        draggedElement.classList.remove('correct');
                    }
                } else if (activity === 'prime') {
                    const isPrimeNumber = draggedElement.dataset.isPrime === 'true';
                    const shouldBePrime = droppedContainer.id === 'prime-box';
                    if (isPrimeNumber === shouldBePrime) {
                        draggedElement.classList.add('correct');
                        draggedElement.classList.remove('incorrect');
                    } else {
                        draggedElement.classList.add('incorrect');
                        draggedElement.classList.remove('correct');
                    }
                }
            }
        } else {
            // Return to original container
            if (originalParent) {
                originalParent.appendChild(draggedElement);
            } else {
                poolContainer.appendChild(draggedElement);
            }
            draggedElement.style.position = 'relative';
            draggedElement.style.left = 'auto';
            draggedElement.style.top = 'auto';
            draggedElement.classList.remove('correct', 'incorrect');
        }

        draggedElement = null;
        originalParent = null;

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
    }

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('touchstart', handleTouchStart, { passive: false });


    // ===============================================================================================
    // REVEAL CONTENT DIV
    // ===============================================================================================

    const revealButton = document.getElementById('reveal-button');
    const revealedContent = document.getElementById('revealed-content');

    revealButton.addEventListener('click', () => {
        // Hide the button
        revealButton.style.display = 'none';

        // Show the content
        revealedContent.style.display = 'block';

        // Optional: remove the listener so it truly can't be toggled
        revealButton.removeEventListener('click', () => { });
    });

    // ===============================================================================================
    // TOGGLE VENN ELEMENT
    // ===============================================================================================

    const trainer = document.querySelector('.venn-trainer');
    const regions = Array.from(document.querySelectorAll('.venn-region'));
    const expressionEl = document.getElementById('venn-expression');
    const feedbackEl = document.getElementById('venn-feedback');
    const checkBtn = document.getElementById('venn-check');

    if (!trainer || !regions.length || !expressionEl || !checkBtn) return;

    // Flashcard deck: each card defines which regions must be "on"
    const vennCards = [
        // 1. Single set: A
        {
            expression: 'A',
            regions: ['Aonly', 'AB', 'AC', 'ABC']
        },
        // 2. Single set: B
        {
            expression: 'B',
            regions: ['Bonly', 'AB', 'BC', 'ABC']
        },
        // 3. Single set: C
        {
            expression: 'C',
            regions: ['Conly', 'AC', 'BC', 'ABC']
        },

        // 4. Intersection of two sets (includes triple intersection)
        {
            expression: 'A ∩ B',
            regions: ['AB', 'ABC']
        },
        {
            expression: 'A ∩ C',
            regions: ['AC', 'ABC']
        },
        {
            expression: 'B ∩ C',
            regions: ['BC', 'ABC']
        },

        // 7. Triple intersection only
        {
            expression: 'A ∩ B ∩ C',
            regions: ['ABC']
        },

        // 8. Union of two sets
        {
            expression: 'A ∪ B',
            regions: ['Aonly', 'Bonly', 'AB', 'AC', 'BC', 'ABC']
        },
        {
            expression: 'A ∪ C',
            regions: ['Aonly', 'Conly', 'AB', 'AC', 'BC', 'ABC']
        },

        // 10. Outside all three sets (complement of A ∪ B ∪ C)
        {
            expression: '(A ∪ B ∪ C)\'',
            regions: ['U']
        },

        // 11. In A but not in B (includes AC but excludes AB, ABC)
        {
            expression: 'A \\ B',
            regions: ['Aonly', 'AC']
        },

        // 12. In (A ∪ C) but not B
        {
            expression: '(A ∪ C) \\ B',
            regions: ['Aonly', 'Conly', 'AC']
        },

        // 13. In B only (no A, no C)
        {
            expression: 'B ∩ A\' ∩ C\'',
            regions: ['Bonly']
        },

        // 14. In C only (no A, no B)
        {
            expression: 'C ∩ A\' ∩ B\'',
            regions: ['Conly']
        },

        // 15. Complement of B (everything not in B)
        {
            expression: 'B\'',
            regions: ['Aonly', 'Conly', 'AC', 'U']
        }
    ];

    let currentIndex = 0;
    let currentRegionsOn = new Set();

    // ---- Region toggling ----

    regions.forEach(region => {
        region.addEventListener('click', () => {
            const id = region.dataset.region;
            if (!id) return;

            if (currentRegionsOn.has(id)) {
                currentRegionsOn.delete(id);
                region.classList.remove('venn-region--on');
            } else {
                currentRegionsOn.add(id);
                region.classList.add('venn-region--on');
            }
        });
    });

    // ---- Check button ----

    checkBtn.addEventListener('click', () => {
        const card = vennCards[currentIndex];
        if (!card) return;

        const expected = new Set(card.regions);
        const actual = currentRegionsOn;

        const isEqual =
            expected.size === actual.size &&
            [...expected].every(r => actual.has(r));

        trainer.classList.remove('venn-trainer--correct', 'venn-trainer--incorrect');

        if (isEqual) {
            trainer.classList.add('venn-trainer--correct');
            feedbackEl.textContent = '✔';

            // Advance after a short delay
            setTimeout(() => {
                nextCard();
            }, 600);
        } else {
            trainer.classList.add('venn-trainer--incorrect');
            feedbackEl.textContent = '✖';

            // Advance after a short delay
            setTimeout(() => {
                trainer.classList.remove('venn-trainer--correct', 'venn-trainer--incorrect');
                feedbackEl.textContent = '';
            }, 600);
        }
    });

    // ---- Card management ----

    function nextCard() {
        // clear selections
        currentRegionsOn.clear();
        regions.forEach(r => r.classList.remove('venn-region--on'));
        trainer.classList.remove('venn-trainer--correct', 'venn-trainer--incorrect');
        feedbackEl.textContent = '';

        currentIndex += 1;

        // If we've run out of cards, show final message
        if (currentIndex >= vennCards.length) {
            expressionEl.textContent = 'Nice! You got it.';
            checkBtn.disabled = true;
            checkBtn.classList.add('venn-check--disabled');
            return;
        }

        const card = vennCards[currentIndex];
        expressionEl.textContent = card.expression;
    }

    // Initialize first card
    if (vennCards.length) {
        expressionEl.textContent = vennCards[0].expression;
    }

    // ===============================================================================================
    // NUMBER SORTING (VENN BINS) - SCOPED TO AVOID CONFLICTS
    // ==============================================================================================

    (function () {
        const svg = document.querySelector('.number-sets-venn');
        const canvas = svg ? svg.closest('.canvas') : null;
        const cards = Array.from(document.querySelectorAll('.number-card'));
        const bins = svg ? Array.from(svg.querySelectorAll('.bin')) : [];

        // If any required element is missing, skip this activity entirely
        if (!svg || !canvas || cards.length === 0 || bins.length === 0) {
            return;
        }

        const correctBinForValue = {
            '2': 'N',
            '-3': 'Z',
            '-1/2': 'Q',
            'π': 'R',
            '√2': 'R',
            '3 + 4i': 'C',
            '3√5': 'R',
            'i': 'C',
            '0': 'Z',
            '7.65': 'Q',
            '83': 'N'
        };

        const binEllipses = bins.map(bin => ({
            bin,
            ellipse: bin.querySelector('ellipse')
        }));

        let numberDragState = null;

        // Ensure cards are absolutely positioned within canvas,
        // but do not reposition them if they already have CSS positioning.
        cards.forEach(card => {
            if (getComputedStyle(card).position !== 'absolute') {
                card.style.position = 'absolute';
            }
            // Use namespaced handler names to avoid conflicting with other activities
            card.addEventListener('mousedown', onNumberMouseDown);
            card.addEventListener('touchstart', onNumberTouchStart, { passive: false });
        });

        function onNumberMouseDown(ev) {
            if (ev.button !== 0) return;
            startNumberDrag(ev.currentTarget, ev.pageX, ev.pageY);
            ev.preventDefault();
        }

        function onNumberTouchStart(ev) {
            if (ev.touches.length !== 1) return;
            const t = ev.touches[0];
            startNumberDrag(ev.currentTarget, t.pageX, t.pageY);
            ev.preventDefault();
        }

        function startNumberDrag(card, startPageX, startPageY) {
            const canvasRect = canvas.getBoundingClientRect();

            const left = parseFloat(card.style.left || 0);
            const top = parseFloat(card.style.top || 0);

            numberDragState = {
                card,
                startPageX,
                startPageY,
                startLeft: left,
                startTop: top,
                canvasLeft: canvasRect.left + window.scrollX,
                canvasTop: canvasRect.top + window.scrollY
            };

            card.classList.add('number-card--dragging');

            window.addEventListener('mousemove', onNumberMouseMove);
            window.addEventListener('mouseup', onNumberMouseUp);
            window.addEventListener('touchmove', onNumberTouchMove, { passive: false });
            window.addEventListener('touchend', onNumberTouchEnd);
            window.addEventListener('touchcancel', onNumberTouchEnd);
        }

        function onNumberMouseMove(ev) {
            if (!numberDragState) return;
            moveNumberCard(ev.pageX, ev.pageY);
            ev.preventDefault();
        }

        function onNumberTouchMove(ev) {
            if (!numberDragState || ev.touches.length !== 1) return;
            const t = ev.touches[0];
            moveNumberCard(t.pageX, t.pageY);
            ev.preventDefault();
        }

        function moveNumberCard(pageX, pageY) {
            const { card, startPageX, startPageY, startLeft, startTop } = numberDragState;

            const dx = pageX - startPageX;
            const dy = pageY - startPageY;

            let newLeft = startLeft + dx;
            let newTop = startTop + dy;

            // Clamp to keep inside canvas
            const maxX = canvas.clientWidth - card.offsetWidth;
            const maxY = canvas.clientHeight - card.offsetHeight;

            newLeft = Math.max(0, Math.min(maxX, newLeft));
            newTop = Math.max(0, Math.min(maxY, newTop));

            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`;
        }

        function endNumberDrag() {
            if (!numberDragState) return;
            const { card } = numberDragState;

            card.classList.remove('number-card--dragging');
            evaluateNumberCardPosition(card);

            numberDragState = null;

            window.removeEventListener('mousemove', onNumberMouseMove);
            window.removeEventListener('mouseup', onNumberMouseUp);
            window.removeEventListener('touchmove', onNumberTouchMove);
            window.removeEventListener('touchend', onNumberTouchEnd);
            window.removeEventListener('touchcancel', onNumberTouchEnd);
        }

        function onNumberMouseUp(ev) {
            if (!numberDragState) return;
            endNumberDrag();
            ev.preventDefault();
        }

        function onNumberTouchEnd(ev) {
            if (!numberDragState) return;
            endNumberDrag();
            ev.preventDefault();
        }

        // ----- correctness evaluation (same logic as before) -----

        function evaluateNumberCardPosition(card) {
            const value = card.dataset.value || card.textContent.trim();
            const expectedSet = correctBinForValue[value];
            if (!expectedSet) {
                setNumberCardState(card, 'none');
                return;
            }

            const cardRect = card.getBoundingClientRect();
            const cxClient = cardRect.left + cardRect.width / 2;
            const cyClient = cardRect.top + cardRect.height / 2;

            const svgPoint = clientPointToSvg(svg, cxClient, cyClient);

            let containingSet = null;
            for (const { bin, ellipse } of binEllipses) {
                if (!ellipse) continue;
                if (pointInEllipse(svgPoint, ellipse)) {
                    containingSet = bin.dataset.set;
                }
            }

            if (!containingSet) {
                setNumberCardState(card, 'none');
            } else if (containingSet === expectedSet) {
                setNumberCardState(card, 'correct');
            } else {
                setNumberCardState(card, 'incorrect');
            }
        }

        function positionCardsInitialNumber(cards, canvas) {
            const canvasRect = canvas.getBoundingClientRect();

            const padding = 20;
            let x = padding;
            const y = padding;

            cards.forEach(card => {
                const width = card.offsetWidth || 40; // fallback width

                card.style.position = 'absolute';
                card.style.left = `${x}px`;
                card.style.top = `${y}px`;

                x += width + 10; // horizontal gap between cards

                // Wrap to second row if out of width
                if (x + width + padding > canvasRect.width) {
                    x = padding;
                    card.style.top = `${parseFloat(card.style.top) + 40}px`;
                }
            });
        }

        function clientPointToSvg(svgElement, clientX, clientY) {
            const pt = svgElement.createSVGPoint();
            pt.x = clientX;
            pt.y = clientY;
            const svgPt = pt.matrixTransform(svgElement.getScreenCTM().inverse());
            return { x: svgPt.x, y: svgPt.y };
        }

        function pointInEllipse(point, ellipse) {
            const cx = parseFloat(ellipse.getAttribute('cx'));
            const cy = parseFloat(ellipse.getAttribute('cy'));
            const rx = parseFloat(ellipse.getAttribute('rx'));
            const ry = parseFloat(ellipse.getAttribute('ry'));
            if (!rx || !ry) return false;

            const dx = point.x - cx;
            const dy = point.y - cy;
            const value = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
            return value <= 1;
        }

        function setNumberCardState(card, state) {
            card.classList.remove(
                'number-card--correct',
                'number-card--incorrect',
                'number-card--none'
            );

            if (state === 'correct') {
                card.classList.add('number-card--correct');
            } else if (state === 'incorrect') {
                card.classList.add('number-card--incorrect');
            } else if (state === 'none') {
                card.classList.add('number-card--none');
            }
        }

        // Initial positioning (same behavior as your original positionCardsInitial)
        positionCardsInitialNumber(cards, canvas);
    })();

    // ==============================================================================================
    // SET LAW CHECKER
    // ==============================================================================================

    const checkerSections = document.querySelectorAll(".set-laws-checker");
    if (!checkerSections.length) return;

    checkerSections.forEach((section) => {
        if (section.dataset.jsInitialized === "true") return;
        section.dataset.jsInitialized = "true";

        const progressEl = section.querySelector(".set-law-progress");
        const expressionEl = section.querySelector(".set-law-quiz-expression");
        const optionsEl = section.querySelector(".set-law-quiz-options");
        const feedbackEl = section.querySelector(".set-law-quiz-feedback");
        const cardEl = section.querySelector(".set-law-quiz-card");

        const questions = [
            {
                expression: `A <span class="set-symbol set-symbol-union">∪</span> (A <span class="set-symbol set-symbol-intersection">∩</span> B)`,
                options: [
                    `A`,
                    `B`,
                    `A <span class="set-symbol set-symbol-intersection">∩</span> B`
                ],
                answer: 0
            },
            {
                expression: `(A <span class="set-symbol set-symbol-union">∪</span> B)′`,
                options: [
                    `A′ <span class="set-symbol set-symbol-intersection">∩</span> B′`,
                    `A′ <span class="set-symbol set-symbol-union">∪</span> B′`,
                    `A <span class="set-symbol set-symbol-intersection">∩</span> B`
                ],
                answer: 0
            },
            {
                expression: `A <span class="set-symbol set-symbol-union">∪</span> A`,
                options: [
                    `A`,
                    `∅`,
                    `U`
                ],
                answer: 0
            },
            {
                expression: `A <span class="set-symbol set-symbol-intersection">∩</span> A′`,
                options: [
                    `A`,
                    `∅`,
                    `U`
                ],
                answer: 1
            },
            {
                expression: `A <span class="set-symbol set-symbol-union">∪</span> ∅`,
                options: [
                    `∅`,
                    `A`,
                    `U`
                ],
                answer: 1
            },
            {
                expression: `A <span class="set-symbol set-symbol-intersection">∩</span> U`,
                options: [
                    `A`,
                    `∅`,
                    `A′`
                ],
                answer: 0
            },
            {
                expression: `A <span class="set-symbol set-symbol-union">∪</span> U`,
                options: [
                    `A`,
                    `U`,
                    `A′`
                ],
                answer: 1
            },
            {
                expression: `A <span class="set-symbol set-symbol-intersection">∩</span> ∅`,
                options: [
                    `A`,
                    `∅`,
                    `U`
                ],
                answer: 1
            },
            {
                expression: `(A′)′`,
                options: [
                    `A′`,
                    `A`,
                    `U`
                ],
                answer: 1
            },
            {
                expression: `A <span class="set-symbol set-symbol-intersection">∩</span> (A <span class="set-symbol set-symbol-union">∪</span> B)`,
                options: [
                    `B`,
                    `A`,
                    `A <span class="set-symbol set-symbol-union">∪</span> B`
                ],
                answer: 1
            },
            {
                expression: `(A <span class="set-symbol set-symbol-intersection">∩</span> B)′`,
                options: [
                    `A′ <span class="set-symbol set-symbol-intersection">∩</span> B′`,
                    `A′ <span class="set-symbol set-symbol-union">∪</span> B′`,
                    `A <span class="set-symbol set-symbol-union">∪</span> B`
                ],
                answer: 1
            },
            {
                expression: `A <span class="set-symbol set-symbol-union">∪</span> A′`,
                options: [
                    `∅`,
                    `A`,
                    `U`
                ],
                answer: 2
            }
        ];

        let currentIndex = 0;
        let locked = false;
        let advanceTimer = null;
        let resetTimer = null;

        function clearTimers() {
            if (advanceTimer) {
                window.clearTimeout(advanceTimer);
                advanceTimer = null;
            }

            if (resetTimer) {
                window.clearTimeout(resetTimer);
                resetTimer = null;
            }
        }

        function hideFeedback() {
            feedbackEl.textContent = "";
            feedbackEl.className = "set-law-quiz-feedback";
        }

        function renderQuestion() {
            clearTimers();
            locked = false;

            const question = questions[currentIndex];

            progressEl.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
            expressionEl.innerHTML = `Simplify: ${question.expression}`;
            optionsEl.innerHTML = "";
            hideFeedback();
            cardEl.classList.remove("is-complete");

            question.options.forEach((optionHtml, optionIndex) => {
                const button = document.createElement("button");
                button.type = "button";
                button.innerHTML = optionHtml;

                button.addEventListener("click", () => {
                    if (locked) return;

                    const isCorrect = optionIndex === question.answer;

                    if (isCorrect) {
                        locked = true;

                        const allButtons = optionsEl.querySelectorAll("button");
                        allButtons.forEach((btn) => {
                            btn.disabled = true;
                        });

                        button.classList.add("correct");
                        feedbackEl.className = "set-law-quiz-feedback correct visible";

                        advanceTimer = window.setTimeout(() => {
                            hideFeedback();

                            if (currentIndex < questions.length - 1) {
                                currentIndex += 1;
                                renderQuestion();
                            } else {
                                progressEl.textContent = `Nice! That's all questions here.`;
                                optionsEl.innerHTML = "";
                                hideFeedback();
                                cardEl.classList.add("is-complete");
                            }
                        }, 1000);
                    } else {
                        button.disabled = true;
                        button.classList.remove("fade-reset");
                        button.classList.add("incorrect");

                        window.setTimeout(() => {
                            button.classList.add("fade-reset");
                            button.classList.remove("incorrect");
                            button.disabled = false;
                        }, 1000);
                    }
                });

                optionsEl.appendChild(button);
            });
        }

        renderQuestion();
    });
});