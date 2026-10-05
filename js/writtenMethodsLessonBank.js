/* Fixed statement-completion questions, in the order each idea is taught. */
(() => {
    const sets = {
        placeValue: [
            ['The value of the 8 in 48,205 is', 8000, 'The 8 counts thousands, not hundreds. Multiply the digit by the value of its place.'],
            ['The value of the 6 in 2.064 is', 0.06, 'The first place after the point is tenths; the second is hundredths.'],
            ['Seven thousand and eight, written in figures, is', 7008, 'There are no hundreds or tens. Keep both places with zeros.'],
            ['Forty-five hundredths, written as a decimal, is', 0.45, 'Hundredths are two places after the decimal point.'],
            ['Two million, forty thousand and six, written in figures, is', 2040006, 'Write the groups as 2 million, 040 thousand and 006.'],
            ['Three hundred and seven thousandths, written as a decimal, is', 0.307, 'The final digit belongs in the thousandths place, three places after the point.']
        ],
        orderingNumbers: [
            ['The larger of 4.7 and 4.68 is', 4.7, 'Compare 4.70 and 4.68. Their whole-number parts agree, so compare the tenths.'],
            ['Of 0.503, 0.53 and 0.305, the smallest is', 0.305, 'Compare the tenths before the hundredths or thousandths.'],
            ['The warmer temperature, in °C, out of −3 °C and −8 °C is', -3, 'The warmer temperature is further right on the number line.'],
            ['Of −2.4, −2.04 and −2.44, the greatest is', -2.04, 'All three are negative. The greatest is closest to zero.'],
            ['The first number in an ascending list of −0.6, 0.06, −0.06 and 0.6 is', -0.6, 'Ascending starts with the smallest. Compare the two negative numbers first.'],
            ['The second number in a descending list of −1.2, 0.12, 1.2 and −0.12 is', 0.12, 'Descending starts with the greatest. Both positive numbers come before the negatives.']
        ],
        inequalitySymbols: [
            ['Between 0.5 and 0.50, the comparison symbol is', '=', 'The extra zero adds no hundredths: these are two ways to write the same value.'],
            ['Comparing −6 with 6, the symbol between them is', '≠', 'The two values lie on opposite sides of zero. They are not equal.'],
            ['The greatest whole number allowed by n ≤ 12 is', 12, 'The line under the symbol allows equality, so the boundary is included.'],
            ['The smallest integer allowed by n > −4 is', -3, 'The boundary −4 is excluded. Move one whole-number step to its right.'],
            ['The smallest integer satisfying −2 < n ≤ 3 is', -1, 'The left boundary is strict, so −2 itself is not included.'],
            ['The number of integers satisfying −2 < n ≤ 3 is', 5, 'List the integers from −1 up to and including 3, then count them.']
        ],
        powersOfTen: [
            ['6.04 × 100 =', 604, 'Every digit moves two places to the left in the place-value columns.'],
            ['0.037 × 1,000 =', 37, 'Each digit becomes a thousand times its original value.'],
            ['83 ÷ 100 =', 0.83, 'Each digit moves two places to the right in the place-value columns.'],
            ['4.2 ÷ 1,000 =', 0.0042, 'The 4 moves from ones to thousandths. Zeros hold the empty places.'],
            ['7.2 × 0.1 =', 0.72, 'Multiplying by one tenth takes one tenth of the number.'],
            ['0.6 ÷ 0.01 =', 60, 'This counts hundredths in six tenths. There are ten hundredths in each tenth.']
        ],
        columnAddition: [
            ['In 12.4 + 3.75, the hundredths column totals', 5, 'Write 12.4 as 12.40. The hundredths column is 0 + 5.'],
            ['For 6.08 + 2.7, the digit directly below the 8 is', 0, 'Write 2.7 as 2.70, lining up the decimal points.'],
            ['In 58 + 67, the ones total 15. The digit written in the ones column is', 5, 'Fifteen ones are one ten and five ones.'],
            ['In the same addition, the tens column, including the carried ten, totals', 12, 'Add the 5 tens, the 6 tens and the ten from the ones column.'],
            ['A £7.85 book and a £4.90 pen cost, in pounds,', 12.75, 'Align the decimal points. Include the carried ten from each column in the next.'],
            ['The total length of 2.35 m, 0.85 m and 1.6 m, in metres, is', 4.8, 'Write 1.6 as 1.60 and add all three numbers in the same columns.']
        ],
        columnSubtraction: [
            ['For 14.6 − 8.35, the hundredths digit in the top row is', 0, 'Write 14.6 as 14.60 before subtracting.'],
            ['In 23.7 − 6.42, the 4 is subtracted from the digit', 7, 'Line up the decimal points. Both digits are tenths.'],
            ['In 72 − 46, exchanging one ten leaves this many tens in the top row:', 6, 'The 7 tens give one ten to the ones column.'],
            ['The same exchange makes 12 ones. Subtracting the 6 ones leaves', 6, 'Subtract from the exchanged amount: 12 − 6.'],
            ['After 8.35 m is cut from 14.6 m, the length left, in metres, is', 6.25, 'Subtract 8.35 from 14.60, then check by adding 8.35 to your answer.'],
            ['The difference between 2.4 m and 1.75 m, in metres, is', 0.65, 'Use 2.40 − 1.75. Check that your answer plus 1.75 is 2.40.']
        ],
        exchangingAcrossZeros: [
            ['To subtract 7 ones from 3,000, the exchange leaves this many thousands:', 2, 'Only one thousand is exchanged. The other two remain in the thousands column.'],
            ['After that exchange, the number of tens left in the tens column is', 9, 'One hundred becomes ten tens; one of those tens becomes ten ones.'],
            ['5.02 − 1.376 =', 3.644, 'Write 5.020 first. Exchange for the thousandths, then exchange across the zero tenths.'],
            ['13 − 4.675 =', 8.325, 'Write 13.000. Record both sides of each exchange before subtracting.'],
            ['The change from £50 for a £27.68 purchase, in pounds, is', 22.32, 'Subtract 27.68 from 50.00, then check that the change and cost total 50.'],
            ['After 2.675 m is cut from 5 m, the length left, in metres, is', 2.325, 'Use 5.000 − 2.675. Your answer plus 2.675 must return 5.']
        ],
        longMultiplication: [
            ['In 347 × 26, the row for the 2 tens represents 347 multiplied by', 20, 'The 2 is in the tens place, so it represents twenty, not two.'],
            ['The value of that row is', 6940, 'Double 347, then multiply by ten.'],
            ['In the row for 6 × 347, 6 × 7 gives 42. The amount carried into the tens column is', 4, 'Forty-two ones are four tens and two ones.'],
            ['The next column total, including those carried tens, is', 28, 'Calculate 6 × 4 + 4.'],
            ['At £24 each, 36 tickets cost, in pounds,', 864, 'Find the products for 30 tickets and 6 tickets, then add them.'],
            ['A rectangle 32 cm long and 18 cm wide has area, in cm²,', 576, 'Area is length multiplied by width: 32 × 18.']
        ],
        multiplyingDecimals: [
            ['Since 37 × 26 = 962, we have 3.7 × 2.6 =', 9.62, 'Both factors are ten times smaller, so the product is a hundred times smaller.'],
            ['Since 24 × 13 = 312, we have 0.24 × 1.3 =', 0.312, 'The factors have three decimal places in total.'],
            ['0.3 × 0.7 =', 0.21, 'Three tenths of seven tenths is twenty-one hundredths.'],
            ['0.2 × 0.6 =', 0.12, 'The integer product is 12, and the factors have two decimal places in total.'],
            ['0.5 × 0.4 =', 0.2, '5 × 4 is 20. Two decimal places give 0.20, which equals 0.2.'],
            ['0.08 × 0.5 =', 0.04, '8 × 5 is 40. Three decimal places give 0.040, not 0.4.']
        ],
        shortDivision: [
            ['In 984 ÷ 4, dividing the 9 hundreds leaves this many hundreds to exchange:', 1, 'Four groups of two hundreds use eight hundreds.'],
            ['That hundred joins the 8 tens to make this many tens:', 18, 'One hundred becomes ten tens; add the eight tens already there.'],
            ['156 ÷ 3 =', 52, 'Begin with 15 tens because one hundred cannot give each group a whole hundred.'],
            ['852 ÷ 3 =', 284, 'Divide left to right, exchanging each remainder into the next smaller place.'],
            ['17 ÷ 8 =', 2.125, 'Continue with tenths, hundredths and thousandths until the remainder is zero.'],
            ['7 ÷ 4 =', 1.75, 'After one whole group, the remaining three become thirty tenths.']
        ],
        interpretingRemainders: [
            ['29 costumes fill rails holding 4 costumes each. The number of completely full rails is', 7, 'Seven full rails hold 28 costumes. The last costume cannot fill a rail.'],
            ['The number of rails needed to hold all 29 costumes is', 8, 'The remaining costume needs another rail, even though that rail is not full.'],
            ['Sharing 29 metres of ribbon equally between 4 people gives each person, in metres,', 7.25, 'Share the remaining metre into four equal parts as well.'],
            ['Sharing 23 litres equally between 5 containers puts in each container, in litres,', 4.6, 'The three litres left after four litres each become three fifths of a litre each.'],
            ['There are 43 costumes and each rail holds 6. The number left after filling as many rails as possible is', 1, 'Seven rails hold 42 costumes. Subtract that from 43.'],
            ['The number of rails needed for all 43 costumes is', 8, 'Seven full rails leave one costume, so a further rail is needed.']
        ],
        longDivision: [
            ['For 1,794 ÷ 23, the first quotient digit comes from 179 ÷ 23 and is', 7, '23 × 7 = 161 and 23 × 8 = 184. Use the largest multiple no greater than 179.'],
            ['After subtracting 161 and bringing down the 4, the next amount to divide is', 184, '179 − 161 leaves 18. Bringing down the 4 gives 184.'],
            ['75.6 ÷ 24 =', 3.15, 'After the whole-number part, continue into tenths and hundredths. Check by multiplying by 24.'],
            ['54 ÷ 12 =', 4.5, 'Four groups use 48. The remaining six are half of another group of twelve.'],
            ['Packing 1,248 pencils into boxes of 24 gives this many full boxes:', 52, 'Divide 1,248 by 24. Check by multiplying the number of boxes by 24.'],
            ['Cutting 67.2 m into 16 equal pieces gives each piece a length, in metres, of', 4.2, 'Use 67.2 ÷ 16, then multiply your answer by 16 to check.']
        ],
        dividingByDecimals: [
            ['To change 55.2 ÷ 0.46 into a division by 46, multiply both numbers by', 100, 'Move 0.46 two places to make 46. The dividend must change by the same factor.'],
            ['The dividend in that equivalent calculation is', 5520, 'Multiply 55.2 by the same hundred used for the divisor.'],
            ['The smallest power of ten needed to make the divisor in 4.8 ÷ 0.6 an integer is', 10, 'The divisor has one decimal place.'],
            ['3.6 ÷ 0.12 =', 30, 'Scale both numbers by 100, giving 360 ÷ 12.'],
            ['2 ÷ 0.5 =', 4, 'Count halves in two wholes. There are two halves in each whole.'],
            ['The number of 0.25 m pieces in 3 m is', 12, 'There are four quarter-metre pieces in each metre.']
        ],
        usingAGivenCalculation: [
            ['Given 43 × 26 = 1,118, the value of 4.3 × 2.6 is', 11.18, 'Both factors are divided by ten, so the product is divided by a hundred.'],
            ['Using the same fact, 430 × 0.26 =', 111.8, 'One factor is ten times larger, the other a hundred times smaller.'],
            ['Since 43 × 26 = 1,118, the value of 1,118 ÷ 43 is', 26, 'Division reverses the multiplication: product divided by one factor gives the other.'],
            ['Using the same fact, 1,118 ÷ 4.3 =', 260, 'The divisor is ten times smaller than 43, so the quotient is ten times larger.'],
            ['The number that gives 260 when divided by 4.3 is', 1118, 'Reverse the division by multiplying 260 by 4.3.'],
            ['The number that gives 11.18 when multiplied by 2.6 is', 4.3, 'Both original factors, 43 and 26, were divided by ten.']
        ]
    };
    // Additional stops where a distinct idea would otherwise pass without retrieval.
    const extra = {
        placeValue: [['Reading decimals', ['0.307 is this many thousandths:', 307, 'Read all three decimal digits as a count of thousandths.'], ['The decimal for six hundred and five thousandths is', .605, 'Keep a zero in the hundredths place.']]],
        orderingNumbers: [['Comparing whole numbers', ['Of 4,582, 4,528 and 4,805, the greatest is', 4805, 'The thousands agree. Compare the hundreds next.'], ['The first number in descending order from 708, 780 and 807 is', 807, 'Descending begins with the greatest. Compare the hundreds.']]],
        inequalitySymbols: [['Less than and greater than', ['The larger of −5 and −2 is', -2, 'The number further right on the number line is larger.'], ['In the true statement 0.7 > 0.07, the smaller value is', .07, 'Compare seven tenths with seven hundredths.']]],
        columnAddition: [['Adding in columns', ['In 342 + 526, the tens column totals', 6, 'The tens digits are 4 and 2.'], ['342 + 526 =', 868, 'Add the ones, tens and hundreds in their own columns.']], ['Adding decimals', ['18.75 + 6.9 =', 25.65, 'Use 6.90 so each column contains the same place value.'], ['4.86 + 7.58 =', 12.44, 'Include the carried amount in the tenths and then the ones.']]],
        columnSubtraction: [['Whole numbers and decimals', ['6145 − 2978 =', 3167, 'Use the rewritten digits after each exchange.'], ['14.6 − 8.35 =', 6.25, 'Pad 14.6 with a hundredths zero.']]],
        longMultiplication: [['From a grid to columns', ['The 300-by-20 part of 347 × 26 contributes', 6000, 'Multiply the actual place values, not only their leading digits.'], ['The 40-by-6 part contributes', 240, 'Six lots of forty give this partial product.']], ['A three-digit multiplier', ['In 123 × 204, the hundreds row represents 123 multiplied by', 200, 'The 2 in 204 represents two hundreds.'], ['The value of that hundreds row is', 24600, 'Double 123, then multiply by a hundred.']]],
        multiplyingDecimals: [['Setting out the multiplication', ['For 2.4 × 1.35, the integer calculation is 24 multiplied by', 135, 'Ignore the decimal points temporarily; do not pad either factor.'], ['The two original factors have this many decimal places altogether:', 3, 'Count one place in 2.4 and two in 1.35.']], ['Costs and areas', ['At £2.40 per metre, 1.5 m of ribbon costs, in pounds,', 3.6, 'Multiply 2.40 by 1.5.'], ['A 0.8 m by 0.6 m rectangle has area, in square metres,', .48, 'Multiply its two lengths, including both decimal places.']]],
        shortDivision: [['Keeping zeros in the quotient', ['604 ÷ 2 =', 302, 'The tens quotient is zero; it still needs its place.'], ['804 ÷ 4 =', 201, 'After the hundreds, the zero tens give a zero in the quotient.']], ['Dividing a decimal', ['18.9 ÷ 7 =', 2.7, 'Continue from ones into tenths without moving the point.'], ['36.8 ÷ 4 =', 9.2, 'Divide the 36 ones and then the eight tenths.']]],
        longDivision: [['Keeping a zero in the quotient', ['2448 ÷ 24 =', 102, 'After the hundreds, 4 tens are less than 24 tens, so write a zero tens digit.'], ['The value of the tens digit in this quotient is', 0, 'The zero holds the tens place between the hundreds and ones.']]],
        interpretingRemainders: [['One calculation, different answers', ['29 divided by 4 gives 7 with remainder', 1, 'Seven groups of four use 28.'], ['In a division by 4, the greatest possible whole-number remainder is', 3, 'A remainder of four would make another complete group.']]],
        powersOfTen: [], exchangingAcrossZeros: [], dividingByDecimals: [], usingAGivenCalculation: []
    };
    const page = location.pathname.split('/').pop().replace('.html', '');
    const host = document.querySelector('[data-lesson-check-anchors]');
    (extra[page] || []).forEach(([heading, first, second], index) => {
        const h = [...host.querySelectorAll('h1')].find(h => h.textContent.trim() === heading);
        if (!h) throw new Error('Missing teaching stop: ' + heading);
        if (!h.id) h.id = 'written-methods-stop-' + index;
        host.dataset.lessonCheckAnchors += ',' + h.id;
        sets[page].push(first, second);
    });
    // Commas may group thousands, but must not turn a mistyped decimal into
    // a different accepted number (for example 0,06 into 6).
    const normalise = value => {
        const raw = String(value).trim().replace(/−/g, '-').replace(/!=/g, '≠');
        return /^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d*)?$/.test(raw) ? raw.replace(/,/g, '') : raw;
    };
    function evaluateResponse(q, value) {
        const raw = normalise(value);
        if (!raw) return {state: 'blank', text: ''};
        const valid = typeof q.expected === 'number' ? /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw) : true;
        return {state: valid && (typeof q.expected === 'number' ? Number(raw) === q.expected : raw === q.expected) ? 'correct' : valid ? 'wrong' : 'unreadable', text: ''};
    }
    window.WrittenMethodsLessonBank = {
        sets,
        buildRound() {
            return (sets[page] || []).map(([prompt, expected, help], index) => ({
                prompt, expected, help, stage: Math.floor(index / 2), mode: 'number',
                title: prompt, expression: '', factKey: page + ':' + index, hints: [help], steps: []
            }));
        },
        evaluateResponse,
        explainMistake(q, value) {
            if (evaluateResponse(q, value).state === 'unreadable') return 'Write one number in figures, without units or a calculation. ' + q.help;
            const n = Number(normalise(value));
            if (typeof q.expected === 'number' && q.expected !== 0 && Number.isFinite(n)) {
                if (n === -q.expected) return 'Your entry has the right magnitude but the opposite sign. ' + q.help;
                for (const factor of [10, 100, 1000]) {
                    if (Math.abs(n / q.expected - factor) < 1e-9) return 'Your entry is ' + factor + ' times the required value. ' + q.help;
                    if (Math.abs(n / q.expected - 1 / factor) < 1e-9) return 'Your entry is one ' + ({10:'tenth',100:'hundredth',1000:'thousandth'}[factor]) + ' of the required value. ' + q.help;
                }
            }
            return 'Your entry, ' + String(value).trim() + ', does not complete this statement. ' + q.help;
        }
    };
})();
