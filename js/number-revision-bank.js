/* Deliberately chosen retrieval pairs, not random variations of lesson gaps.
   Shared by two fixed practice papers; nothing here changes teaching completion. */
(() => {
    'use strict';
    const base = '/demystifyingmaths/pages/curriculum/GCSE/number/structure/';
    const symbol = value => /^[a-z]$/i.test(String(value)) ? `<var>${value}</var>` : value;
    const power = (b, n) => `${symbol(b)}<span class="caret" aria-hidden="true">^</span><sup>${symbol(n)}</sup>`;
    const root = n => `<span role="math" aria-label="square root of ${n}"><span class="rad"><span class="caret" aria-hidden="true">√(</span><svg class="rad__sign" viewBox="0 0 24 40" aria-hidden="true"><path d="M.5 24H5l5.5 13.5L22 1.5H24" fill="none" stroke="currentColor" stroke-width="3"/></svg><span class="rad__over">${n}</span></span><span class="caret" aria-hidden="true">)</span></span>`;
    const groups = {
        writtenMethods: [
            ['placeValue', 'Place value', 'digit-values'],
            ['orderingNumbers', 'Ordering numbers', 'ordering-decimal-numbers'],
            ['inequalitySymbols', 'Inequality symbols', 'values-between-two-boundaries'],
            ['powersOfTen', 'Powers of ten', 'decimal-powers'],
            ['columnAddition', 'Column addition', 'column-addition-idea-5'],
            ['columnSubtraction', 'Column subtraction', 'column-subtraction-idea-4'],
            ['exchangingAcrossZeros', 'Exchanging across zeros', 'zeros-in-a-decimal'],
            ['longMultiplication', 'Long multiplication', 'why-a-row-ends-in-zeros'],
            ['multiplyingDecimals', 'Multiplying decimals', 'count-decimal-places'],
            ['shortDivision', 'Short division', 'short-division-idea-4'],
            ['interpretingRemainders', 'Interpreting a remainder', 'interpreting-remainders-idea-2'],
            ['longDivision', 'Long division', 'long-division-idea-2'],
            ['dividingByDecimals', 'Dividing by a decimal', 'scale-both'],
            ['usingAGivenCalculation', 'Using a given calculation', 'related-products']
        ],
        powersAndRoots: [
            ['indexNotation', 'Index notation', 'what-index-notation-means'],
            ['recognisingPowers', 'Recognising powers', 'powers-of-2-3-4-and-5'],
            ['squareRoots', 'Square roots', 'roots-of-decimals'],
            ['positiveAndNegativeRoots', 'Positive and negative roots', 'solving-x-squared-equals-49'],
            ['cubeAndHigherRoots', 'Cube and higher roots', 'the-cube-root-of-a-negative']
        ]
    };
    const lessons = Object.fromEntries(Object.entries(groups).flatMap(([group, rows]) => rows.map(([id, title, anchor]) =>
        [id, {id, title, group, url: base + group + '/' + id + '.html', anchor}])));
    // A link names the actual explanation, not a diagnosis of the learner.
    const prerequisites = {
        placeValue: 'placeValue', orderingNumbers: 'placeValue', inequalitySymbols: 'orderingNumbers',
        powersOfTen: 'placeValue', columnAddition: 'placeValue', columnSubtraction: 'columnAddition',
        exchangingAcrossZeros: 'columnSubtraction', longMultiplication: 'columnAddition',
        multiplyingDecimals: 'longMultiplication', shortDivision: 'placeValue',
        interpretingRemainders: 'shortDivision', longDivision: 'shortDivision',
        dividingByDecimals: 'powersOfTen', usingAGivenCalculation: 'powersOfTen',
        indexNotation: 'indexNotation', recognisingPowers: 'indexNotation', squareRoots: 'recognisingPowers',
        positiveAndNegativeRoots: 'squareRoots', cubeAndHigherRoots: 'indexNotation'
    };
    // prompt, exact answer, a checking step, a complete route, optional unit
    const pairs = {
        placeValue: [
            ['The value of the 7 in 5.072 is', .07, 'Count places from the decimal point.', 'The 7 is in the hundredths place, so its value is 7 hundredths: 0.07.'],
            ['Four million, three thousand and twenty, written in figures, is', 4003020, 'Keep three places for each group after the millions.', 'Write 4 million, 003 thousand and 020: 4,003,020.']
        ],
        orderingNumbers: [
            ['The greatest of −0.8, −0.08 and −0.18 is', -.08, 'For negative numbers, the one closest to zero is greatest.', 'Write −0.80, −0.08 and −0.18. Of these, −0.08 is closest to zero.'],
            ['Of 6.205, 6.25 and 6.025, the smallest is', 6.025, 'Compare tenths before hundredths.', 'The whole-number parts agree. Only 6.025 has zero tenths; the others have two tenths.']
        ],
        inequalitySymbols: [
            ['The number of integers satisfying −3 < n ≤ 2 is', 5, 'Decide whether each boundary is included, then list the integers.', 'The integers are −2, −1, 0, 1 and 2. There are 5.'],
            ['The smallest integer satisfying −5 ≤ n < −1 is', -5, 'The line under an inequality sign allows equality.', 'The left boundary allows −5 itself. The integers are −5, −4, −3 and −2.']
        ],
        powersOfTen: [
            ['0.072 × 1,000 =', 72, 'Every digit becomes a thousand times its previous value.', 'Multiplying by 10 three times gives 0.72, then 7.2, then 72.'],
            ['4.8 ÷ 0.01 =', 480, 'Count hundredths in the number.', 'Each whole has 100 hundredths. There are 480 hundredths in 4.8.']
        ],
        columnAddition: [
            ['16.85 + 7.6 =', 24.45, 'Line up the decimal points and include every carried amount.', ['Write 7.6 as 7.60 and line up the decimal points.', 'Hundredths: 5 + 0 = 5. Tenths: 8 + 6 = 14, so write 4 tenths and carry 1 to the ones.', 'Ones: 6 + 7 + 1 = 14, so write 4 ones and carry 1 to the tens.', 'Tens: 1 + 1 = 2. The total is 24.45.']],
            ['Lengths of 2.75 m, 0.86 m and 1.4 m total', 5.01, 'Write the three amounts with equal decimal places.', '2.75 + 0.86 = 3.61, then 3.61 + 1.40 = 5.01.', 'm']
        ],
        columnSubtraction: [
            ['21.7 − 8.46 =', 13.24, 'Write a zero hundredths digit before exchanging.', 'Use 21.70 − 8.46. Exchange a tenth for 10 hundredths, then a ten for 10 ones. The result is 13.24.'],
            ['A 9.25 m cable is cut to 3.8 m. The length removed is', 5.45, 'The removed length is the difference between the two lengths.', '9.25 − 3.80 = 5.45. Adding 3.80 returns 9.25.', 'm']
        ],
        exchangingAcrossZeros: [
            ['7.01 − 2.468 =', 4.542, 'Write 7.010 and record what each column gives and receives.', 'For the thousandths, exchange the hundredth. Then exchange a one through the empty tenths into hundredths. The top digits become 6 ones, 9 tenths, 10 hundredths and 10 thousandths. Subtracting gives 4.542.'],
            ['Change from £30 for a £17.85 purchase is £', 12.15, 'Write the starting amount as 30.00.', 'Exchange one ten through the ones and tenths. The top row becomes 2 tens, 9 ones, 9 tenths and 10 hundredths. Subtract 17.85 to get 12.15.']
        ],
        longMultiplication: [
            ['208 × 34 =', 7072, 'The 3 in 34 represents thirty.', '208 × 4 = 832 and 208 × 30 = 6,240. Adding the partial products gives 7,072.'],
            ['There are 24 trays with 36 plants in each. The total number of plants is', 864, 'Find the contribution from 20 trays and from 4 trays.', '36 × 20 = 720 and 36 × 4 = 144. The total is 864.']
        ],
        multiplyingDecimals: [
            ['0.14 × 0.6 =', .084, 'Count the decimal places across both factors.', '14 × 6 = 84. There are three decimal places in total, so the product is 0.084.'],
            ['At £3.20 per metre, 1.5 m of fabric costs £', 4.8, 'Multiply the length by the price per metre.', '32 × 15 = 480. Two decimal places give 4.80 pounds.']
        ],
        shortDivision: [
            ['924 ÷ 3 =', 308, 'A column smaller than the divisor still needs a quotient digit.', '9 hundreds give 3 hundreds. The 2 tens give 0 tens, with 2 tens remaining. Those join 4 ones to make 24 ones, giving 8 ones. The quotient is 308.'],
            ['19 ÷ 8 =', 2.375, 'Continue through the decimal places until the remainder is zero.', ['19 ÷ 8 = 2 remainder 3.', 'Exchange the 3 ones for 30 tenths. Dividing by 8 gives 3 tenths, with 6 tenths left.', 'Exchange those 6 tenths for 60 hundredths. Dividing by 8 gives 7 hundredths, with 4 hundredths left.', 'Exchange those 4 hundredths for 40 thousandths. Dividing by 8 gives 5 thousandths with no remainder. The answer is 2.375.']]
        ],
        interpretingRemainders: [
            ['All 53 jars fit into boxes holding 8 jars each. The smallest number of boxes needed is', 7, 'Every jar needs a place, including any left after filling boxes.', '53 ÷ 8 = 6 remainder 5. Six full boxes leave 5 jars, which need a seventh box.'],
            ['From 53 jars, the number of completely full boxes of 8 is', 6, 'Only boxes containing eight jars count as full.', 'Six boxes use 48 jars. The 5 remaining jars do not fill another box.']
        ],
        longDivision: [
            ['2,448 ÷ 16 =', 153, 'List useful multiples of 16.', '24 − 16 = 8; bring down 4 to make 84. Five sixteens use 80; bring down 8 to make 48. Three sixteens use 48. The quotient is 153.'],
            ['61.2 ÷ 24 =', 2.55, 'Continue into tenths and hundredths.', ['24 fits into 61 twice: 2 × 24 = 48, leaving 13 ones.', 'Exchange the 13 ones for 130 tenths and include the original 2 tenths. This gives 132 tenths.', '132 ÷ 24 = 5 remainder 12. Write 5 tenths and exchange the remaining 12 tenths for 120 hundredths.', '120 ÷ 24 = 5, so write 5 hundredths. The answer is 2.55.']]
        ],
        dividingByDecimals: [
            ['6.3 ÷ 0.15 =', 42, 'Make the divisor whole by scaling both numbers equally.', 'Multiply both by 100: 630 ÷ 15. Since 15 × 40 = 600 and 15 × 2 = 30, the answer is 42.'],
            ['The number of 0.35 m pieces in 4.2 m is', 12, 'The number of pieces is total length divided by length per piece.', '4.2 ÷ 0.35 = 420 ÷ 35 = 12.']
        ],
        usingAGivenCalculation: [
            ['Given 28 × 35 = 980, the value of 2.8 × 0.35 is', .98, 'Track the change in each factor separately.', '28 is divided by 10 and 35 by 100. Divide 980 by 1,000 to get 0.98.'],
            ['Given 28 × 35 = 980, the value of 98 ÷ 3.5 is', 28, 'Reverse the multiplication, then compare the dividend and divisor.', '980 ÷ 35 = 28. Dividing both 980 and 35 by 10 leaves the quotient unchanged, so 98 ÷ 3.5 = 28.']
        ],
        indexNotation: [
            [`${power(3, 4)} =`, 81, 'The index counts equal factors, not a multiplier.', '3 × 3 × 3 × 3 = 9 × 9 = 81.'],
            [`In ${power(2, 'n')} = 32, the value of n is`, 5, 'Count how many factors of 2 give 32.', '2 × 2 × 2 × 2 × 2 = 32, so n = 5.']
        ],
        recognisingPowers: [
            [`In ${power(4, 'n')} = 64, the value of n is`, 3, 'Follow the powers of 4 until you reach 64.', '4 × 4 = 16, then 16 × 4 = 64. There are three factors of 4.'],
            [`In ${power(5, 'n')} = 625, the value of n is`, 4, 'Each next power multiplies the previous value by 5.', 'The powers are 5, 25, 125 and 625, so the index is 4.']
        ],
        squareRoots: [
            [`${root('0.81')} =`, .9, 'Find the non-negative number whose square is 0.81.', '0.9 × 0.9 = 0.81, so the square root is 0.9.'],
            ['A square has area 196 cm². Its side length is', 14, 'The side multiplied by itself gives the area.', '14 × 14 = 196, so each side is 14 cm.', 'cm']
        ],
        positiveAndNegativeRoots: [
            [`For ${power('x', 2)} = 121, the negative solution is`, -11, 'A negative number multiplied by itself gives a positive result.', '(−11) × (−11) = 121, so the negative solution is −11. The other solution is 11.'],
            [`The number of distinct solutions on the number line to ${power('x', 2)} = 0 is`, 1, 'Zero and its negative are the same number.', 'Only 0 squares to 0. Writing −0 does not give a different number, so there is one solution.']
        ],
        cubeAndHigherRoots: [
            ['The cube root of −125 is', -5, 'Three equal negative factors have a negative product.', '(−5) × (−5) × (−5) = 25 × (−5) = −125.'],
            ['The fifth root of 243 is', 3, 'Find five equal factors with product 243.', '3 × 3 × 3 × 3 × 3 = 243, so the fifth root is 3.']
        ]
    };
    const questions = Object.entries(pairs).flatMap(([lesson, rows]) => rows.map(([prompt, expected, hint, solution, unit = ''], variant) =>
        ({id: lesson + ':' + variant, lesson, variant, prompt, expected, hint, solution: Array.isArray(solution) ? solution : [solution], unit, prerequisites: [lesson]})));
    // Diagnose only unmistakable, common routes. Every other wrong value gets
    // the authored checking step rather than a fabricated explanation.
    const retrievalMistakes = {
        'orderingNumbers:0': {
            '-0.8': '−0.8 is furthest below zero. Of the three numbers, −0.08 is closest to zero.',
            '-0.18': '−0.18 is closer to zero than −0.8, but −0.08 is closer still.'
        },
        'orderingNumbers:1': {
            '6.205': '6.205 has 2 tenths. The smallest number has 0 tenths.',
            '6.25': '6.25 has 2 tenths. The smallest number has 0 tenths.'
        },
        'inequalitySymbols:0': {
            4: 'One allowed integer is missing. −3 is excluded, 2 is included, and 0 belongs in the list.',
            6: 'One extra integer has been included. −3 is excluded and 2 is included.'
        },
        'inequalitySymbols:1': {
            '-4': '−4 satisfies the inequality, but −5 is also allowed because the left inequality includes equality.',
            '-2': '−2 is the greatest allowed integer, not the smallest.'
        },
        'columnAddition:1': {
            '3.61': '3.61 m is the total of the first two lengths. The remaining 1.40 m still has to be added.'
        },
        'longMultiplication:0': {
            832: '832 is the partial product 208 × 4. The contribution from 30 is still needed.',
            6240: '6,240 is the partial product 208 × 30. The contribution from 4 is still needed.'
        },
        'longMultiplication:1': {
            720: '720 plants account for 20 trays. The other 4 trays still have to be included.',
            144: '144 plants account for 4 trays. The other 20 trays still have to be included.'
        },
        'shortDivision:0': {
            38: 'The tens column gives 0 tens. That zero must remain between the 3 hundreds and 8 ones.'
        },
        'indexNotation:0': {
            12: '12 is 3 × 4. The index means four equal factors: 3 × 3 × 3 × 3.'
        },
        'recognisingPowers:0': {
            16: '16 is 4 squared. One more factor of 4 gives 64.'
        },
        'recognisingPowers:1': {
            125: '125 is 5 cubed. One more factor of 5 gives 625.'
        },
        'positiveAndNegativeRoots:1': {
            2: 'The two written forms 0 and −0 name the same number, so they do not give two distinct solutions.'
        },
        'cubeAndHigherRoots:1': {
            5: 'Five is the index of the root. The required answer is the repeated factor whose fifth power is 243.'
        }
    };
    for (const q of questions) q.mistakes = retrievalMistakes[q.id] || {};
    const problem = (id, group, title, context, prompt, expected, unit, prerequisites, hint, solution, mistakes = {}) =>
        ({id, group, title, context, prompt, expected, unit, prerequisites, lesson: prerequisites.at(-1), hint, solution, mistakes});
    const problems = [
        problem('wm-tickets', 'writtenMethods', 'Tickets for a trip', 'A group buys 18 adult tickets at £12.50 each and 24 child tickets at £7.75 each. They have £450.', 'After buying all the tickets, the money left is £', 39, '', ['columnAddition','columnSubtraction','multiplyingDecimals'], 'Find the cost of each type of ticket before finding the amount left.', ['Adults: 18 × £12.50 = £225.', 'Children: 24 × £7.75 = £186.', 'Total cost: £225 + £186 = £411. Money left: £450 − £411 = £39.'], {411: '£411 is the total cost. The statement asks for the money left from £450.'}),
        problem('wm-bottles', 'writtenMethods', 'Bottles and crates', 'A producer fills 0.75-litre bottles from 18 litres of juice, with none left over. Each crate holds 5 bottles.', 'The smallest number of crates needed for all the bottles is', 5, '', ['interpretingRemainders','dividingByDecimals'], 'First find how many bottles are filled. Then decide what to do with a partly filled crate.', ['18 ÷ 0.75 = 1,800 ÷ 75 = 24 bottles.', '24 ÷ 5 = 4 remainder 4. Four full crates hold 20 bottles.', 'The other 4 bottles need one more crate, so 5 crates are needed.'], {4: 'Four crates hold only 20 bottles. The remaining bottles need a crate too.',24: '24 is the number of bottles. Each crate holds five of them.',4.8: 'Crates must be counted as whole objects; every bottle needs a place.'}),
        problem('wm-rope', 'writtenMethods', 'Cutting a rope', 'Eight pieces, each 1.35 m long, are cut from a 15 m rope. No length is lost in cutting.', 'The length of rope left is', 4.2, 'm', ['columnSubtraction','multiplyingDecimals'], 'Find the total length of all eight pieces.', ['Eight pieces use 8 × 1.35 = 10.8 m.', '15.0 − 10.8 = 4.2 m remains.'], {10.8: '10.8 m is the length used, not the length left.'}),
        problem('wm-packs', 'writtenMethods', 'Two packs of pencils', 'One pack contains 24 pencils and costs £3.60. Another contains 30 pencils and costs £4.20.', 'The saving per pencil when buying the cheaper pack is', 1, 'p', ['columnSubtraction','longDivision'], 'Compare both costs per pencil in the same unit.', ['The first pack costs 360 ÷ 24 = 15 p per pencil.', 'The second pack costs 420 ÷ 30 = 14 p per pencil.', 'The difference is 15 − 14 = 1 p per pencil.'], {.01: '£0.01 is the saving in pounds. This gap asks for pence.',60: '60 p is the difference between pack prices, but the packs contain different numbers of pencils.'}),
        problem('pr-square', 'powersAndRoots', 'An edge around a square', 'A square display has area 144 cm². A strip runs around all four edges, without overlaps or gaps.', 'The total length of strip is', 48, 'cm', ['squareRoots'], 'Find the length of one edge before counting all four.', ['12 × 12 = 144, so each side is 12 cm.', 'Four equal sides need 4 × 12 = 48 cm of strip.'], {12: '12 cm is one edge. The strip covers all four.',576: '144 cm² measures area, not an edge length. Find an edge length first.'}),
        problem('pr-cube', 'powersAndRoots', 'Making a square from cubes', 'A large cube is made from 64 unit cubes. All the unit cubes are rearranged into a square, one cube deep, with no gaps.', 'The number of unit cubes along each side of the new square is', 8, '', ['squareRoots','cubeAndHigherRoots'], 'The new arrangement is one cube deep. Its number of cubes is the side length squared.', ['The original cube has 4 × 4 × 4 = 64 unit cubes.', 'The flat square still contains 64 cubes. Since 8 × 8 = 64, it has 8 cubes along each side.'], {4: 'Four cubes fit along the original cube. The new arrangement is a flat square containing all 64 cubes.'}),
        problem('pr-solutions', 'powersAndRoots', 'Two possible values', `Two different numbers both have square 81.`, 'The distance between them on the number line is', 18, '', ['positiveAndNegativeRoots'], 'Place both solutions on the number line, on opposite sides of zero.', ['The two numbers are −9 and 9, since both square to 81.', 'From −9 to 0 is 9 units and from 0 to 9 is another 9. The total distance is 18.'], {0: 'The two numbers have the same square, but they are different numbers.',9: 'Nine is the distance from either solution to zero, not the distance between the solutions.'}),
        problem('pr-powers', 'powersAndRoots', 'The same number in two forms', `The number 64 can be written as ${power(2, 'a')} and as ${power(4, 'b')}.`, 'The value of a + b is', 9, '', ['indexNotation','recognisingPowers'], 'Find each index by repeated multiplication; no index law is needed.', ['2 × 2 × 2 × 2 × 2 × 2 = 64, so a = 6.', '4 × 4 × 4 = 64, so b = 3.', 'a + b = 6 + 3 = 9.'], {6: 'Six is the index for base 2. Include the index for base 4 as well.'})
    ];
    // Standalone exam wording. Lesson gaps retain their original wording elsewhere.
    const examPrompts = {
        placeValue: ['Write the value of the digit 7 in 5.072 as a decimal.', 'Write four million, three thousand and twenty in figures.'],
        orderingNumbers: ['Write down the greatest of these numbers.<br><span class="exam-values">−0.8 &nbsp; −0.08 &nbsp; −0.18</span>', 'Write down the smallest of these numbers.<br><span class="exam-values">6.205 &nbsp; 6.25 &nbsp; 6.025</span>'],
        inequalitySymbols: ['Find the number of integers that satisfy −3 &lt; <var>n</var> ≤ 2.', 'Write down the smallest integer that satisfies −5 ≤ <var>n</var> &lt; −1.'],
        powersOfTen: ['Work out 0.072 × 1,000', 'Work out 4.8 ÷ 0.01'],
        columnAddition: ['Work out 16.85 + 7.6', 'Three lengths are 2.75 m, 0.86 m and 1.4 m.<br>Work out their total length.'],
        columnSubtraction: ['Work out 21.7 − 8.46', 'A 9.25 m cable is cut to a length of 3.8 m.<br>Work out the length removed.'],
        exchangingAcrossZeros: ['Work out 7.01 − 2.468', 'Work out the change from £30 when buying an item costing £17.85.'],
        longMultiplication: ['Work out 208 × 34', 'There are 24 trays with 36 plants in each tray.<br>Work out the total number of plants.'],
        multiplyingDecimals: ['Work out 0.14 × 0.6', 'Fabric costs £3.20 per metre.<br>Work out the cost of 1.5 m of fabric.'],
        shortDivision: ['Work out 924 ÷ 3', 'Work out 19 ÷ 8<br>Give your answer as a decimal.'],
        interpretingRemainders: ['53 jars are packed in boxes. Each box holds 8 jars.<br>Work out the smallest number of boxes needed to hold all the jars.', '53 jars are packed in boxes. Each box holds 8 jars.<br>Work out the number of completely full boxes.'],
        longDivision: ['Work out 2,448 ÷ 16', 'Work out 61.2 ÷ 24'],
        dividingByDecimals: ['Work out 6.3 ÷ 0.15', 'A length of 4.2 m is cut into pieces of 0.35 m.<br>Work out the number of pieces.'],
        usingAGivenCalculation: ['Given that 28 × 35 = 980, work out 2.8 × 0.35', 'Given that 28 × 35 = 980, work out 98 ÷ 3.5'],
        indexNotation: [`Work out ${power(3, 4)}`, `${power(2, 'n')} = 32<br>Find the value of n.`],
        recognisingPowers: [`${power(4, 'n')} = 64<br>Find the value of n.`, `${power(5, 'n')} = 625<br>Find the value of n.`],
        squareRoots: [`Work out ${root('0.81')}`, 'A square has an area of 196 cm².<br>Work out the length of one side.'],
        positiveAndNegativeRoots: [`${power('x', 2)} = 121<br>Write down the negative solution.`, `Write down the number of distinct solutions on the number line to ${power('x', 2)} = 0.<br>Give your answer as a figure.`],
        cubeAndHigherRoots: ['Work out the cube root of −125', 'Work out the fifth root of 243']
    };
    for (const q of questions) q.examPrompt = examPrompts[q.lesson][q.variant];
    const problemPrompts = {
        'wm-tickets': 'Work out how much money is left after buying the tickets.',
        'wm-bottles': 'Work out the smallest number of crates needed for all the bottles.',
        'wm-rope': 'Work out the length of rope left.',
        'wm-packs': 'Work out the difference between the two costs per pencil. Give your answer in pence.',
        'pr-square': 'Work out the total length of strip needed.',
        'pr-cube': 'Work out the number of unit cubes along each side of the new square.',
        'pr-solutions': 'Work out the distance between the two numbers on the number line.',
        'pr-powers': 'Work out the value of <var>a</var> + <var>b</var>.'
    };
    for (const q of problems) q.examPrompt = problemPrompts[q.id];
    for (const q of [...questions, ...problems]) {
        q.answerPrefix = q.prompt.endsWith('£') ? '£' : '';
        q.answerForm = Number.isInteger(q.expected) ? 'figures' : 'decimal';
        q.calculator = false;
        // Authored allocations for these original questions, guarded by the
        // restricted mark schemes rather than inferred from the final answer.
        q.marks = q.context ? Math.min(3, q.solution.length) :
            ['columnAddition', 'columnSubtraction', 'exchangingAcrossZeros', 'longMultiplication',
                'multiplyingDecimals', 'shortDivision', 'longDivision', 'dividingByDecimals',
                'interpretingRemainders'].includes(q.lesson) ? 2 : 1;
        q.showWorking = q.marks > 1;
    }
    window.NumberRevisionBank = {base, groups, lessons, prerequisites, questions, problems};
})();
