document.addEventListener("DOMContentLoaded", () => {
    const lab = document.querySelector("[data-addition-lab]");
    if (!lab) return;

    const inputs = {
        a: lab.querySelector('[data-addend="a"]'),
        b: lab.querySelector('[data-addend="b"]')
    };
    const paper = lab.querySelector("[data-paper]");
    const progress = lab.querySelector("[data-progress]");
    const stepTitle = lab.querySelector("[data-step-title]");
    const stepCopy = lab.querySelector("[data-step-copy]");
    const previousButton = lab.querySelector("[data-previous]");
    const nextButton = lab.querySelector("[data-next]");
    const status = lab.querySelector("[data-status]");

    const placeNames = new Map([
        [5, "hundred-thousands"], [4, "ten-thousands"], [3, "thousands"],
        [2, "hundreds"], [1, "tens"], [0, "ones"], [-1, "tenths"],
        [-2, "hundredths"], [-3, "thousandths"]
    ]);
    const placeLabels = new Map([
        [5, "100,000s"], [4, "10,000s"], [3, "1,000s"], [2, "100s"],
        [1, "10s"], [0, "1s"], [-1, "0.1s"], [-2, "0.01s"], [-3, "0.001s"]
    ]);

    let calculation = null;
    let stage = 0;

    const parseInput = (raw) => {
        const value = raw.trim().replaceAll(",", "");
        if (!/^(?:\d{1,5}(?:\.\d{0,3})?|\.\d{1,3})$/.test(value) || value.endsWith(".")) {
            return { error: "Enter a positive number with no more than five whole-number digits and three decimal places." };
        }
        const [wholeRaw, decimal = ""] = value.split(".");
        const whole = (wholeRaw || "0").replace(/^0+(?=\d)/, "");
        return { whole, decimal, typed: `${whole}${decimal ? `.${decimal}` : ""}` };
    };

    const formatDigits = (digits, decimalPlaces) => {
        const raw = digits.join("");
        const split = raw.length - decimalPlaces;
        const whole = raw.slice(0, split).replace(/^0+(?=\d)/, "") || "0";
        const decimal = decimalPlaces ? raw.slice(split).padStart(decimalPlaces, "0") : "";
        return `${Number(whole).toLocaleString("en-GB")}${decimalPlaces ? `.${decimal}` : ""}`;
    };

    const buildCalculation = (a, b) => {
        const decimalPlaces = Math.max(a.decimal.length, b.decimal.length);
        const wholePlaces = Math.max(a.whole.length, b.whole.length);
        const padNumber = (number) => `${number.whole.padStart(wholePlaces, "0")}${number.decimal.padEnd(decimalPlaces, "0")}`.split("").map(Number);
        const aDigits = padNumber(a);
        const bDigits = padNumber(b);
        const operations = [];
        const result = Array(aDigits.length).fill(0);
        const carries = Array(aDigits.length).fill(0);
        let carry = 0;

        for (let index = aDigits.length - 1; index >= 0; index -= 1) {
            const carryIn = carry;
            const total = aDigits[index] + bDigits[index] + carryIn;
            const resultDigit = total % 10;
            carry = Math.floor(total / 10);
            result[index] = resultDigit;
            if (carry && index > 0) carries[index - 1] = carry;
            operations.push({ index, carryIn, total, resultDigit, carryOut: carry });
        }

        if (carry) {
            aDigits.unshift(null);
            bDigits.unshift(null);
            result.unshift(carry);
            carries.unshift(carry);
            operations.forEach((operation) => { operation.index += 1; });
        }

        return { a, b, aDigits, bDigits, result, carries, operations, decimalPlaces, wholePlaces: aDigits.length - decimalPlaces, finalCarry: carry };
    };

    const decimalGrid = (calc) => calc.decimalPlaces
        ? `${`repeat(${calc.wholePlaces}, 58px)`} 18px ${`repeat(${calc.decimalPlaces}, 58px)`}`
        : `repeat(${calc.wholePlaces}, 58px)`;

    const exponentFor = (calc, digitIndex) => calc.wholePlaces - digitIndex - 1;

    const makeCell = (content, classes = "") => {
        const cell = document.createElement("span");
        cell.className = `addition-board__cell ${classes}`.trim();
        cell.textContent = content ?? "";
        return cell;
    };

    const buildRow = (calc, type, operator = "") => {
        const row = document.createElement("div");
        row.className = `addition-board__row addition-board__row--${type}`;
        const operatorCell = document.createElement("span");
        operatorCell.className = `addition-board__operator${operator ? "" : " addition-board__operator--blank"}`;
        operatorCell.textContent = operator || "·";
        row.append(operatorCell);
        const digits = document.createElement("div");
        digits.className = "addition-board__digits";
        digits.style.setProperty("--addition-columns", decimalGrid(calc));
        row.append(digits);
        return { row, digits };
    };

    const appendDigitCells = (container, calc, values, options = {}) => {
        values.forEach((value, index) => {
            if (calc.decimalPlaces && index === calc.wholePlaces) {
                container.append(makeCell(".", "addition-board__cell--point"));
            }
            const classes = [];
            if (options.placeholder?.(index, value)) classes.push("addition-board__cell--placeholder");
            if (options.activeIndex === index) classes.push("addition-board__cell--active");
            const cell = makeCell(value, classes.join(" "));
            cell.dataset.column = index;
            container.append(cell);
        });
    };

    const paddedPlaceholder = (calc, number, index, value) => {
        if (value === null) return false;
        const extraWhole = calc.wholePlaces - number.whole.length;
        const decimalIndex = index - calc.wholePlaces;
        return index < extraWhole || (decimalIndex >= number.decimal.length && decimalIndex >= 0);
    };

    const renderBoard = () => {
        const calc = calculation;
        const completed = Math.min(stage, calc.operations.length);
        const activeOperation = stage > 0 && stage <= calc.operations.length ? calc.operations[stage - 1] : null;
        paper.replaceChildren();

        const labels = buildRow(calc, "labels");
        Array.from({ length: calc.aDigits.length }, (_, index) => {
            if (calc.decimalPlaces && index === calc.wholePlaces) labels.digits.append(makeCell("", "addition-board__cell--point addition-board__cell--label"));
            labels.digits.append(makeCell(placeLabels.get(exponentFor(calc, index)) || "", "addition-board__cell--label"));
        });
        paper.append(labels.row);

        const carryRow = buildRow(calc, "carry");
        calc.carries.forEach((carry, index) => {
            if (calc.decimalPlaces && index === calc.wholePlaces) carryRow.digits.append(makeCell("", "addition-board__cell--point"));
            const sourceOperationIndex = calc.operations.findIndex((operation) => operation.index - 1 === index && operation.carryOut);
            const visible = sourceOperationIndex >= 0 && completed > sourceOperationIndex;
            const cell = makeCell("");
            if (visible) {
                const badge = document.createElement("span");
                badge.className = "addition-board__carry";
                badge.textContent = carry;
                cell.append(badge);
            }
            carryRow.digits.append(cell);
        });
        paper.append(carryRow.row);

        const first = buildRow(calc, "addend");
        appendDigitCells(first.digits, calc, calc.aDigits, {
            activeIndex: activeOperation?.index,
            placeholder: (index, value) => paddedPlaceholder(calc, calc.a, index, value)
        });
        paper.append(first.row);

        const second = buildRow(calc, "addend addition-board__row--second", "+");
        appendDigitCells(second.digits, calc, calc.bDigits, {
            activeIndex: activeOperation?.index,
            placeholder: (index, value) => paddedPlaceholder(calc, calc.b, index, value)
        });
        paper.append(second.row);

        const resultRow = buildRow(calc, "result");
        calc.result.forEach((value, index) => {
            if (calc.decimalPlaces && index === calc.wholePlaces) resultRow.digits.append(makeCell(".", "addition-board__cell--point"));
            const operationIndex = calc.operations.findIndex((operation) => operation.index === index);
            const isLeadingCarry = calc.finalCarry && index === 0;
            const visible = isLeadingCarry ? completed === calc.operations.length : operationIndex >= 0 && completed > operationIndex;
            const classes = [visible ? "addition-board__answer" : ""];
            if (activeOperation?.index === index) classes.push("addition-board__cell--active");
            resultRow.digits.append(makeCell(visible ? value : "", classes.join(" ")));
        });
        paper.append(resultRow.row);
    };

    const describeStage = () => {
        const calc = calculation;
        const totalStages = calc.operations.length + 2;
        previousButton.disabled = stage === 0;
        nextButton.disabled = stage === totalStages - 1;

        if (stage === 0) {
            progress.textContent = "Alignment";
            stepTitle.textContent = "Align equal place values";
            const padded = [];
            if (calc.a.decimal.length < calc.decimalPlaces) padded.push(`${calc.a.typed} as ${calc.a.whole}.${calc.a.decimal.padEnd(calc.decimalPlaces, "0")}`);
            if (calc.b.decimal.length < calc.decimalPlaces) padded.push(`${calc.b.typed} as ${calc.b.whole}.${calc.b.decimal.padEnd(calc.decimalPlaces, "0")}`);
            stepCopy.textContent = padded.length
                ? `Begin with the decimal points directly beneath one another. Write ${padded.join(" and ")} so every occupied place is visible.`
                : "Begin with equal place values directly beneath one another. The decimal points, when present, must form one vertical line.";
            nextButton.innerHTML = 'Next column <span aria-hidden="true">&rarr;</span>';
            return;
        }

        if (stage <= calc.operations.length) {
            const operation = calc.operations[stage - 1];
            const exponent = exponentFor(calc, operation.index);
            const name = placeNames.get(exponent) || "next";
            const leftName = placeNames.get(exponent + 1) || "next column";
            const aDigit = calc.aDigits[operation.index] ?? 0;
            const bDigit = calc.bDigits[operation.index] ?? 0;
            const parts = [aDigit, bDigit];
            if (operation.carryIn) parts.unshift(operation.carryIn);
            progress.textContent = `${stage} of ${calc.operations.length} columns`;
            stepTitle.textContent = `Add the ${name} column`;
            if (operation.carryOut) {
                stepCopy.textContent = `${parts.join(" + ")} = ${operation.total}. Write ${operation.resultDigit} in the ${name} column and regroup ${operation.carryOut} into the ${leftName} column.`;
            } else {
                stepCopy.textContent = `${parts.join(" + ")} = ${operation.total}. Write ${operation.resultDigit} in the ${name} column. There is no need to regroup.`;
            }
            nextButton.innerHTML = stage === calc.operations.length
                ? 'Read the answer <span aria-hidden="true">&rarr;</span>'
                : 'Next column <span aria-hidden="true">&rarr;</span>';
            return;
        }

        const answer = formatDigits(calc.result, calc.decimalPlaces);
        progress.textContent = "Complete";
        stepTitle.textContent = `The sum is ${answer}`;
        stepCopy.textContent = `Read the result from left to right, keeping the decimal point in its fixed place. A quick estimate should now be used to check that ${answer} is a sensible size.`;
    };

    const render = () => {
        renderBoard();
        describeStage();
    };

    const acceptInputs = () => {
        const a = parseInput(inputs.a.value);
        const b = parseInput(inputs.b.value);
        inputs.a.toggleAttribute("aria-invalid", Boolean(a.error));
        inputs.b.toggleAttribute("aria-invalid", Boolean(b.error));
        if (a.error || b.error) {
            status.textContent = a.error || b.error;
            return;
        }
        status.textContent = "";
        calculation = buildCalculation(a, b);
        stage = 0;
        render();
    };

    previousButton.addEventListener("click", () => {
        if (!calculation || stage === 0) return;
        stage -= 1;
        render();
    });

    nextButton.addEventListener("click", () => {
        if (!calculation || stage >= calculation.operations.length + 1) return;
        stage += 1;
        render();
    });

    Object.values(inputs).forEach((input) => input.addEventListener("input", acceptInputs));
    lab.addEventListener("keydown", (event) => {
        if (event.target.matches("input")) return;
        if (event.key === "ArrowRight" && !nextButton.disabled) nextButton.click();
        if (event.key === "ArrowLeft" && !previousButton.disabled) previousButton.click();
    });

    acceptInputs();
});
