# Syllabus coverage spec

What each blank page must contain for the curriculum section to be complete and
saleable as a teaching resource. One entry per page in `pages/`.

**Page kinds.** Three, not two. A *menu* page lists what sits beneath it and teaches
nothing (`/pages/curriculum/GCSE/`, the strand menus, the topic menus and the group menus). A
*teaching* page carries one idea and must meet the nine-point bar below. A *practice*
page holds a test and nothing else. Only teaching pages are measured against the bar.

**The subtopic level.** Every GCSE strand is split so that one page teaches one
idea: each strand menu lists topic menus, each topic menu lists group menus
(`/pages/curriculum/GCSE/number/structure/`), each group menu lists its teaching
pages, and drills sit on the group that teaches their method. The KS1–KS3 and
A level sections have not been split yet, so a topic page there is still a
teaching page. Where the two conventions disagree, the GCSE pattern is the
intended one.

**Author notes.** Every generated stub carries a dashed "Author note — to cover"
block: on a teaching page, the owner's brief for what that page must cover —
scope, exclusions, the Foundation/Higher boundary and the DfE reference (held as
the subtopic's `coverNote` in the strand manifest); on a practice stub, the
drill's three graded question sections. The blocks are authoring scaffolding,
deleted along with the stub copy as each page's real content lands.

Scope note: topic breakdowns follow the DfE national curriculum programmes of
study (KS1–KS3), the DfE GCSE mathematics subject content, and the DfE A level
mathematics content. Exam-board spec codes are deliberately **not** quoted here —
map them against the live AQA / Edexcel / OCR specification before publishing any
"covers spec point X" claim.

Tier markers apply to GCSE only: unmarked = both tiers, **(H)** = Higher only.

---

## What "complete" means

A page is done when it has all nine of these. This is the bar that separates a
set of notes from something a school will pay for.

1. **Prerequisites** — one line naming what the reader should already be able to
   do, linked to the pages that teach it.
2. **Motivation** — why this idea exists, and what problem it solves. This is the
   site's whole thesis; a page without it is a textbook.
3. **Derivation from first principles** — the path back to something the reader
   already accepts as true.
4. **One interactive or animated figure** — the site's actual differentiator.
   Static pages will not sell against existing free resources.
5. **Worked examples**, graded from routine to exam-standard.
6. **Named misconceptions**, addressed explicitly rather than avoided.
7. **Practice questions with full solutions**, not just answers.
8. **Summary** — the page's claims in five lines or fewer.
9. **Next step** — a link onward, so the tree is navigable in both directions.

### Practice pages are a different thing

Practice pages (`practice-*.html`, ochre cards, listed beneath the topics on
each menu page) are not shortened teaching pages, and they are not teaching
pages with questions bolted on. **A practice page holds a test and nothing
else.** A lesson drill covers one narrowly stated skill. A mixed review may
combine several skills, but it is linked from a lesson only after every one of
those skills has been taught. Nothing is duplicated between teaching and test
pages. A practice page is done when it has:

1. **A stated skill** — one thing, narrow enough to be drilled, named at the top
   before anything else.
2. **Named learning pages**, linked in the opening paragraph and again at the
   end: exactly one for a lesson drill, or the complete prerequisite set for a
   mixed review. See "Pairing" below. No worked examples on the practice page.
3. **Graded questions** — fluency, then application, then a question that will
   catch someone who has only memorised a procedure. Set out in named sections,
   so a wrong answer localises to a skill.
4. **Generated questions, not a fixed set** — a fresh paper on demand is what
   makes a drill worth returning to, and it is what a school is paying for. Every
   answer must come out exactly; no question should need a calculator unless the
   topic is about using one.
5. **Marks, not ticks** — marked the way an exam marks. Part marks where a method
   is sound but one step slipped, so the score carries information. State the
   mark scheme on the page.
6. **Answers with method**, revealed on marking rather than listed at the bottom,
   and shown against the question they belong to.
7. **A self-check** — a score broken down far enough to say *what* to fix, not
   just how many were wrong. A total alone does not tell a reader where to go.

`/pages/curriculum/GCSE/number/structure/workingInStandardForm/practiceStandardForm.html` is the reference implementation; copy
its structure rather than reinventing one. Its engine (`js/practice-test.js`) is
generic, so a new test needs only its own question bank.

### Pairing

The manifests are the source of truth. A `lesson` drill names exactly one
learning page. A `review` names all of its prerequisite pages and an
`availableAfter` page that comes after them in curriculum order. The generator
uses that mapping to render the cards in both directions and refuses to write
if a review would be exposed too early.

A learning page can still carry more than one drill, but every lesson-facing
drill must be safe at that point in the sequence. What must never happen is an
orphan or a card that sends a reader to material taught later.

One exception is allowed, and only on this test: **a drill whose learning page
would have nothing to teach.** `/pages/curriculum/KS1/practiceSubitising.html` is the only page
that currently qualifies — recognising four dots without counting is a skill
built by repetition, not a method that can be read first, so the drill *is* the
teaching. Do not use this exception for recall drills such as times tables:
those have a method page behind them even though the drill itself is recall.

---

## Key Stage 1

Eight pages. Years 1–2. The aim is number sense before notation.

**`/pages/curriculum/KS1/numberPlaceValue.html` — Number and place value**
- Cover: count to and across 100 forwards and backwards from any number; count in 2s, 5s and 10s; read and write numerals and number words to 100; one more and one less; represent numbers as tens and ones; compare and order using `<`, `>`, `=`.
- Misconception: reading a two-digit number as two separate digits; hearing "twenty-one" and writing 12.
- Interactive: base-ten block tray that re-forms as the numeral is typed.

**`/pages/curriculum/KS1/additionSubtraction.html` — Addition and subtraction**
- Cover: number bonds within 10 and 20; add and subtract within 20, then within 100; the `+`, `−` and `=` symbols; missing-number problems; addition is commutative and subtraction is not; addition and subtraction as inverses; adding three one-digit numbers.
- Misconception: `=` read as "here comes the answer" rather than as balance; assuming subtraction can be reordered.
- Interactive: part–whole model and a balance that tips until both sides match.

**`/pages/curriculum/KS1/multiplicationDivision.html` — Multiplication and division**
- Cover: 2, 5 and 10 multiplication tables; equal groups; arrays; doubling and halving; the `×` and `÷` symbols; repeated addition; multiplication is commutative and division is not.
- Misconception: "multiplying always makes it bigger"; sharing and grouping treated as unrelated.
- Interactive: array builder that shows the same total as rows × columns and columns × rows.

**`/pages/curriculum/KS1/fractions.html` — Fractions**
- Cover: recognise, find and name a half and a quarter of a shape, an object and a quantity; thirds; equivalence of two quarters and one half; the requirement that parts be equal.
- Misconception: any split into two pieces counts as halves.
- Interactive: shape splitter that accepts or rejects a cut depending on whether the parts are equal.

**`/pages/curriculum/KS1/measurement.html` — Measurement**
- Cover: compare and order length, mass, capacity and time; standard units (cm, m, g, kg, ml, l); recognise coins and notes; tell the time to the hour, half past, quarter past and to, and to five minutes; sequence events; days, weeks, months, years.
- Misconception: longer implies heavier; reading the hour hand as if it jumps.
- Interactive: draggable clock hands with the two hands geared correctly to each other.

**`/pages/curriculum/KS1/geometryShapes.html` — Geometry: properties of shapes**
- Cover: name common 2D shapes (circle, triangle, rectangle including square) and 3D shapes (sphere, cuboid including cube, pyramid); describe sides, vertices, edges and faces; lines of symmetry; sort and compare.
- Misconception: a rotated square is a "diamond" and no longer a square; a square is not a rectangle.
- Interactive: rotate a shape and watch its name stay fixed.

**`/pages/curriculum/KS1/geometryPosition.html` — Geometry: position and direction**
- Cover: describe position, direction and movement; whole, half, quarter and three-quarter turns; clockwise and anticlockwise; ordinal position; continue patterns.
- Misconception: confusing turn direction; counting the starting position as one step.
- Interactive: grid turtle driven by turn-and-move instructions.

**`/pages/curriculum/KS1/statistics.html` — Statistics**
- Cover: interpret and construct tally charts, pictograms, block diagrams and simple tables; ask and answer questions about totals, differences and categories.
- Misconception: reading a pictogram symbol as one item when the key says otherwise.
- Interactive: pictogram with an adjustable key, so the same data redraws at different scales.

---

## Key Stage 2

Ten pages. Years 3–6. Formal written methods arrive, and with them the first
real risk of procedure without understanding.

**`/pages/curriculum/KS2/numberPlaceValue.html` — Number and place value**
- Cover: numbers to 10,000,000; the value of each digit; rounding to any power of ten; negative numbers and counting through zero; Roman numerals to 1000; comparing and ordering.
- Misconception: −7 treated as greater than −3; rounding by looking at the wrong digit.
- Interactive: zoomable place-value chart running from millions down to thousandths.

**`/pages/curriculum/KS2/additionSubtraction.html` — Addition and subtraction**
- Cover: columnar addition and subtraction beyond four digits; mental strategies; estimation to check; inverse operations as a check; multi-step word problems; choosing between mental and written methods.
- Misconception: misaligning columns once decimals appear; exchanging across a zero.
- Interactive: column method with each exchange animated rather than asserted.

**`/pages/curriculum/KS2/multiplicationDivision.html` — Multiplication and division**
- Cover: tables to 12 × 12; factors, multiples, primes, squares and cubes; long multiplication up to four digits by two; short and long division; remainders as fractions, decimals or rounded, chosen by context; order of operations; the distributive law.
- Misconception: giving a remainder when the context demands rounding up; dividing by a number below one making the result smaller.
- Interactive: area model that decomposes a long multiplication into partial products.

**`/pages/curriculum/KS2/fractionsDecimalsPercentages.html` — Fractions, decimals and percentages**
- Cover: equivalent fractions and simplification; comparing and ordering; adding and subtracting with different denominators; multiplying pairs of proper fractions; dividing a fraction by a whole number; decimals to three places; conversion between all three forms; percentage of an amount.
- Misconception: adding denominators; assuming a larger denominator means a larger fraction.
- Interactive: fraction wall where equivalent bars align.

**`/pages/curriculum/KS2/ratioProportion.html` — Ratio and proportion**
- Cover: relative sizes; scale factors; similar shapes; unequal sharing; percentages for comparison; scaling recipes.
- Misconception: reasoning additively where the situation is multiplicative ("add 3 to each side" when enlarging).
- Interactive: two rectangles, one scaled additively and one multiplicatively, shown side by side.

**`/pages/curriculum/KS2/algebra.html` — Algebra**
- Cover: simple formulae expressed in words and symbols; linear number sequences; missing-number problems written as equations; enumerating possibilities for two unknowns.
- Misconception: a letter read as a label for an object rather than as a number.
- Interactive: a function machine with a hidden rule to be deduced.

**`/pages/curriculum/KS2/measurement.html` — Measurement**
- Cover: converting metric units; approximate metric–imperial equivalence; perimeter; area of rectangles and compound shapes; area of triangles and parallelograms; volume of cuboids; time conversions; money problems.
- Misconception: perimeter and area conflated; assuming equal perimeter forces equal area.
- Interactive: fixed-perimeter rectangle whose area changes as it is reshaped.

**`/pages/curriculum/KS2/geometryShapes.html` — Geometry: properties of shapes**
- Cover: acute, obtuse and reflex angles; measuring and drawing with a protractor; angles on a straight line, around a point, and vertically opposite; classifying triangles and quadrilaterals; radius, diameter and circumference; nets of 3D solids.
- Misconception: angle size judged by the length of the drawn arms.
- Interactive: protractor overlay that can be dragged onto a drawn angle.

**`/pages/curriculum/KS2/geometryPosition.html` — Geometry: position and direction**
- Cover: coordinates in all four quadrants; translation; reflection; describing movement; plotting and naming shapes from vertices.
- Misconception: reading a coordinate pair in the wrong order.
- Interactive: plane where a plotted point reports its own coordinates as it is dragged.

**`/pages/curriculum/KS2/statistics.html` — Statistics**
- Cover: bar charts, pictograms, tables, time graphs, line graphs and pie charts; the mean as an average; two-way tables; constructing as well as interpreting.
- Misconception: expecting the mean to be one of the values in the data.
- Interactive: dot plot with a balance point that moves as values are added.

---

## Key Stage 3

Six pages. Years 7–9. The six GCSE strands begin here, so each page should
foreshadow its GCSE counterpart and link forward to it.

**`/pages/curriculum/KS3/number.html` — Number**
- Cover: place value and ordering; four operations with integers, decimals and fractions; prime factorisation, HCF and LCM; powers and roots; index laws; standard form; rounding, significant figures and estimation; order of operations.
- Misconception: index laws applied to sums; significant figures counted from the wrong end.
- Interactive: factor tree that any starting number decomposes into.

**`/pages/curriculum/KS3/algebra.html` — Algebra**
- Cover: algebraic notation and convention; simplifying, expanding and factorising; substitution; solving linear equations; rearranging formulae; sequences by term-to-term and position-to-term rules; straight-line graphs and `y = mx + c`; inequalities on a number line.
- Misconception: `3a` read as a two-digit quantity; expanding only the first term of a bracket.
- Interactive: line graph with draggable gradient and intercept, equation updating live.

**`/pages/curriculum/KS3/ratio.html` — Ratio, proportion and rates of change**
- Cover: ratio notation and simplification; dividing a quantity in a ratio; direct and inverse proportion; percentage increase and decrease; multipliers; unit pricing; speed and density; scale drawings.
- Misconception: a 20% rise then a 20% fall returning to the original amount.
- Interactive: multiplier chain showing a sequence of percentage changes compounding.

**`/pages/curriculum/KS3/geometry.html` — Geometry and measures**
- Cover: angle rules including parallel lines and polygons; congruence and similarity; Pythagoras' theorem; area and volume of standard shapes and prisms; circumference and area of circles; translation, rotation, reflection and enlargement; ruler-and-compass constructions; bearings.
- Misconception: using Pythagoras on a non-right-angled triangle; enlargement assumed to preserve area scale.
- Interactive: draggable right triangle with the three squares drawn on its sides.

**`/pages/curriculum/KS3/probability.html` — Probability**
- Cover: the probability scale from 0 to 1; sample space; theoretical versus experimental probability; relative frequency; mutually exclusive events summing to 1; two events shown in tables and tree diagrams.
- Misconception: the gambler's fallacy; assuming all outcomes are equally likely.
- Interactive: repeated trial simulator where relative frequency converges as trials increase.

**`/pages/curriculum/KS3/statistics.html` — Statistics**
- Cover: types of data; collection and sampling; mean, median, mode and range; frequency tables including grouped data; bar charts, pie charts and scatter graphs; correlation; comparing distributions; misleading graphs.
- Misconception: correlation read as causation; the mode confused with the highest frequency value.
- Interactive: bar chart with a truncated axis that can be reset to zero, showing the distortion.

---

## GCSE

Twenty-three topic menus across the six strands, split into 114 group menus
and 593 teaching pages (113 Higher only). The commercial core of the resource —
build these first.
Every page needs both tiers separated visually, and every page needs an
exam-style question set.

### Number

Three topic menus, 22 group menus, and 147 teaching pages. Lesson drills are narrow; mixed reviews appear only after their final prerequisite.

**`/pages/curriculum/GCSE/number/structure/` — Structure and calculation** *(topic menu, 8 groups, 66 teaching pages, 12 Higher only)*

*`/pages/curriculum/GCSE/number/structure/writtenMethods/` — Place value and written methods* (group menu) — What each digit is worth, comparing numbers, and the four written methods. Drills: `/pages/curriculum/GCSE/number/structure/writtenMethods/practicePlaceValue.html`, `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceOrderingNumbers.html`, `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceInequalitySymbols.html`, `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceWrittenMethods.html`, `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceColumnSubtraction.html`, `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceExchangingAcrossZeros.html`, `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceLongMultiplication.html`, `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceDivision.html`, `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceInterpretingRemainders.html`, `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceLongDivision.html`, `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceGivenCalculation.html`, `/pages/curriculum/GCSE/number/structure/writtenMethods/practicePlaceValueReview.html`, `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceWrittenMethodsReview.html`, `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceDivisionReview.html`.

- `/pages/curriculum/GCSE/number/structure/writtenMethods/placeValue.html` — Place value in integers and decimals: What each digit is worth in integers and decimals, and zeros as place-holders. — drilled by `/pages/curriculum/GCSE/number/structure/writtenMethods/practicePlaceValue.html` — **written**
- `/pages/curriculum/GCSE/number/structure/writtenMethods/orderingNumbers.html` — Ordering integers, decimals and negatives: Ordering numbers, including negatives and decimals of different lengths. — drilled by `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceOrderingNumbers.html`
- `/pages/curriculum/GCSE/number/structure/writtenMethods/inequalitySymbols.html` — The inequality symbols: The less-than, greater-than, at-most, at-least and not-equal signs. — drilled by `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceInequalitySymbols.html`
- `/pages/curriculum/GCSE/number/structure/writtenMethods/powersOfTen.html` — Multiplying and dividing by powers of ten: The effect on every digit of multiplying or dividing by 10, 100, 0.1 and 0.01. — drilled by `/pages/curriculum/GCSE/number/structure/writtenMethods/practicePlaceValueReview.html`
- `/pages/curriculum/GCSE/number/structure/writtenMethods/columnAddition.html` — Column addition: Adding integers and decimals in columns, lining up the point and carrying. — drilled by `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceWrittenMethods.html`
- `/pages/curriculum/GCSE/number/structure/writtenMethods/columnSubtraction.html` — Column subtraction: Subtracting in columns with exchange, lining up decimals of different lengths. — drilled by `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceColumnSubtraction.html`
- `/pages/curriculum/GCSE/number/structure/writtenMethods/exchangingAcrossZeros.html` — Exchanging across zeros: Subtracting when a column holds a zero, and where the exchange comes from. — drilled by `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceExchangingAcrossZeros.html`
- `/pages/curriculum/GCSE/number/structure/writtenMethods/longMultiplication.html` — Long multiplication: Multiplying multi-digit integers, and the place-holder zero in the second row. — drilled by `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceLongMultiplication.html`
- `/pages/curriculum/GCSE/number/structure/writtenMethods/multiplyingDecimals.html` — Multiplying decimals: Multiplying as whole numbers, then counting decimal places to fix the point. — drilled by `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceWrittenMethodsReview.html`
- `/pages/curriculum/GCSE/number/structure/writtenMethods/shortDivision.html` — Short division: Dividing by a one-digit number, carrying each remainder into the next digit. — drilled by `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceDivision.html`
- `/pages/curriculum/GCSE/number/structure/writtenMethods/interpretingRemainders.html` — Interpreting a remainder: Whether a worded answer wants a remainder, a decimal, a fraction or rounding. — drilled by `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceInterpretingRemainders.html`
- `/pages/curriculum/GCSE/number/structure/writtenMethods/longDivision.html` — Long division: Dividing by a two-digit number, continuing past the point for an exact answer. — drilled by `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceLongDivision.html`
- `/pages/curriculum/GCSE/number/structure/writtenMethods/dividingByDecimals.html` — Dividing by a decimal: Scaling both numbers by the same power of ten, and why the answer can grow. — drilled by `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceDivisionReview.html`
- `/pages/curriculum/GCSE/number/structure/writtenMethods/usingAGivenCalculation.html` — Using a given calculation: Related products and quotients from a stated result, without recalculating. — drilled by `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceGivenCalculation.html`

*`/pages/curriculum/GCSE/number/structure/powersAndRoots/` — Powers and roots* (group menu) — Index notation, powers worth recalling, and roots as the inverse of a power. Drills: `/pages/curriculum/GCSE/number/structure/powersAndRoots/practicePowersRoots.html`, `/pages/curriculum/GCSE/number/structure/powersAndRoots/practiceRecognisingPowers.html`, `/pages/curriculum/GCSE/number/structure/powersAndRoots/practiceSquareRoots.html`, `/pages/curriculum/GCSE/number/structure/powersAndRoots/practicePositiveAndNegativeRoots.html`, `/pages/curriculum/GCSE/number/structure/powersAndRoots/practiceCubeAndHigherRoots.html`, `/pages/curriculum/GCSE/number/structure/powersAndRoots/practicePowersRootsReview.html`.

- `/pages/curriculum/GCSE/number/structure/powersAndRoots/indexNotation.html` — Index notation and powers: What the base and index mean, and writing repeated multiplication as a power. — drilled by `/pages/curriculum/GCSE/number/structure/powersAndRoots/practicePowersRoots.html`
- `/pages/curriculum/GCSE/number/structure/powersAndRoots/recognisingPowers.html` — Recognising powers of a number: The squares, cubes and powers of 2, 3, 4 and 5 worth recalling. — drilled by `/pages/curriculum/GCSE/number/structure/powersAndRoots/practiceRecognisingPowers.html`
- `/pages/curriculum/GCSE/number/structure/powersAndRoots/squareRoots.html` — Square roots: The square root as the inverse of squaring, found by reversing a known square. — drilled by `/pages/curriculum/GCSE/number/structure/powersAndRoots/practiceSquareRoots.html`
- `/pages/curriculum/GCSE/number/structure/powersAndRoots/positiveAndNegativeRoots.html` — Positive and negative square roots: Why a squared equation has two solutions while the root sign gives one. — drilled by `/pages/curriculum/GCSE/number/structure/powersAndRoots/practicePositiveAndNegativeRoots.html`
- `/pages/curriculum/GCSE/number/structure/powersAndRoots/cubeAndHigherRoots.html` — Cube roots and higher roots: Cube roots and nth roots as the inverse of a power, including negatives. — drilled by `/pages/curriculum/GCSE/number/structure/powersAndRoots/practiceCubeAndHigherRoots.html`

*`/pages/curriculum/GCSE/number/structure/directedNumber/` — Directed number and the order of operations* (group menu) — Arithmetic with negatives, the order of operations, and checking the result. Drills: `/pages/curriculum/GCSE/number/structure/directedNumber/practiceNegatives.html`, `/pages/curriculum/GCSE/number/structure/directedNumber/practiceMultiplyingDividingNegatives.html`, `/pages/curriculum/GCSE/number/structure/directedNumber/practiceOrderOfOperations.html`, `/pages/curriculum/GCSE/number/structure/directedNumber/practiceCheckingWithInverses.html`, `/pages/curriculum/GCSE/number/structure/directedNumber/practiceNegativesReview.html`, `/pages/curriculum/GCSE/number/structure/directedNumber/practiceOrderOfOperationsReview.html`.

- `/pages/curriculum/GCSE/number/structure/directedNumber/addingSubtractingNegatives.html` — Adding and subtracting negative numbers: Number-line reasoning, two signs meeting, and temperature differences. — drilled by `/pages/curriculum/GCSE/number/structure/directedNumber/practiceNegatives.html`
- `/pages/curriculum/GCSE/number/structure/directedNumber/multiplyingDividingNegatives.html` — Multiplying and dividing negative numbers: The sign of a product or quotient, and what several negatives together do. — drilled by `/pages/curriculum/GCSE/number/structure/directedNumber/practiceMultiplyingDividingNegatives.html`
- `/pages/curriculum/GCSE/number/structure/directedNumber/orderOfOperations.html` — Order of operations: Brackets, powers and roots first, with the fraction bar as grouping. — drilled by `/pages/curriculum/GCSE/number/structure/directedNumber/practiceOrderOfOperations.html`
- `/pages/curriculum/GCSE/number/structure/directedNumber/powersOfNegatives.html` — Powers of a negative number: Why −3² and (−3)² differ, and how an odd or even index fixes the sign. — drilled by `/pages/curriculum/GCSE/number/structure/directedNumber/practiceNegativesReview.html`
- `/pages/curriculum/GCSE/number/structure/directedNumber/checkingWithInverses.html` — Checking an answer with the inverse operation: Undoing a calculation with its inverse to test an answer without repeating it. — drilled by `/pages/curriculum/GCSE/number/structure/directedNumber/practiceCheckingWithInverses.html`
- `/pages/curriculum/GCSE/number/structure/directedNumber/reorderingACalculation.html` — Reordering a calculation: Using commutativity and associativity to pair the easiest numbers first. — drilled by `/pages/curriculum/GCSE/number/structure/directedNumber/practiceOrderOfOperationsReview.html`

*`/pages/curriculum/GCSE/number/structure/factorsAndPrimes/` — Factors, multiples, primes and counting* (group menu) — What a prime factorisation tells you, and listing without repeats or gaps. Drills: `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceCounting.html`, `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practicePrimeFactors.html`, `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practicePrimesAndPrimality.html`, `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practicePrimeFactorisation.html`, `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceHCFLCM.html`, `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceLCMFromPrimeFactors.html`, `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceHCFLCMVenn.html`, `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceSquaresCubesFromPrimeFactors.html`, `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceProductRule.html`, `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practicePrimeFactorsReview.html`, `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceHCFLCMReview.html`, `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceCountingReview.html`.

- `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/factorsAndFactorPairs.html` — Factors and factor pairs: Listing every factor of a number in pairs, so none is missed or repeated. — drilled by `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceCounting.html`
- `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/multiplesAndDivisibility.html` — Multiples and divisibility tests: The multiples of a number, and the tests for divisibility by 2, 3, 4, 5 and 9. — drilled by `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practicePrimeFactors.html`
- `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/primesAndPrimality.html` — Primes and testing for primality: What makes a number prime, why 1 is not, and trial division up to the root. — drilled by `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practicePrimesAndPrimality.html`
- `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/primeFactorisation.html` — Prime factorisation: Factor trees and repeated division, index form, and why the primes are unique. — drilled by `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practicePrimeFactorisation.html`
- `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/HCFFromPrimeFactors.html` — Highest common factor: Taking each shared prime to the lower index, and what the HCF means. — drilled by `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceHCFLCM.html`
- `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/LCMFromPrimeFactors.html` — Lowest common multiple: Every prime to the higher index, and why the LCM is not always the product. — drilled by `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceLCMFromPrimeFactors.html`
- `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/HCFLCMVenn.html` — HCF and LCM from a Venn diagram: The Venn method for two or three numbers, and HCF times LCM as the product. — drilled by `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceHCFLCMVenn.html`
- `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/choosingHCFOrLCM.html` — Choosing HCF or LCM in context: Deciding which a worded problem needs: coinciding events or equal shares. — drilled by `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceHCFLCMReview.html`
- `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/squaresCubesFromPrimeFactors.html` — Squares and cubes from prime factors: The smallest multiplier that turns a number into a perfect square or cube. — drilled by `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceSquaresCubesFromPrimeFactors.html`
- `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/countingFactors.html` — Counting a number’s factors: Counting a number’s factors from the indices in its prime factorisation. — drilled by `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practicePrimeFactorsReview.html`
- `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/systematicListing.html` — Systematic listing: Listing every outcome once in a fixed order, and deciding whether order matters. — drilled by `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceCountingReview.html`
- `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/productRuleCounting.html` — The product rule for counting **(H)**: Multiplying the choices at each stage, including arrangements without reuse. — drilled by `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceProductRule.html`

*`/pages/curriculum/GCSE/number/structure/indexLaws/` — The index laws* (group menu) — The index laws, extended to zero, negative and fractional powers. Drills: `/pages/curriculum/GCSE/number/structure/indexLaws/practiceSimplifyingPowers.html`, `/pages/curriculum/GCSE/number/structure/indexLaws/practiceDividingPowers.html`, `/pages/curriculum/GCSE/number/structure/indexLaws/practiceZeroIndex.html`, `/pages/curriculum/GCSE/number/structure/indexLaws/practiceNegativeIndices.html`, `/pages/curriculum/GCSE/number/structure/indexLaws/practicePowerOfAPower.html`, `/pages/curriculum/GCSE/number/structure/indexLaws/practicePowerOfAProduct.html`, `/pages/curriculum/GCSE/number/structure/indexLaws/practiceNegativeIndexOfAFraction.html`, `/pages/curriculum/GCSE/number/structure/indexLaws/practiceUnitFractionalIndices.html`, `/pages/curriculum/GCSE/number/structure/indexLaws/practiceGeneralFractionalIndices.html`, `/pages/curriculum/GCSE/number/structure/indexLaws/practiceIndexLaws.html`, `/pages/curriculum/GCSE/number/structure/indexLaws/practiceSimplifyingPowersReview.html`.

- `/pages/curriculum/GCSE/number/structure/indexLaws/multiplyingPowers.html` — Multiplying powers of the same base: Adding the indices, derived by counting the repeated factors on each side. — drilled by `/pages/curriculum/GCSE/number/structure/indexLaws/practiceSimplifyingPowers.html`
- `/pages/curriculum/GCSE/number/structure/indexLaws/dividingPowers.html` — Dividing powers of the same base: Subtracting the indices, derived by cancelling the common repeated factors. — drilled by `/pages/curriculum/GCSE/number/structure/indexLaws/practiceDividingPowers.html`
- `/pages/curriculum/GCSE/number/structure/indexLaws/zeroIndex.html` — The zero index: Why any non-zero number to the power zero is 1, read off the division law. — drilled by `/pages/curriculum/GCSE/number/structure/indexLaws/practiceZeroIndex.html`
- `/pages/curriculum/GCSE/number/structure/indexLaws/negativeIndices.html` — Negative indices: A negative index as a reciprocal, making a number small rather than negative. — drilled by `/pages/curriculum/GCSE/number/structure/indexLaws/practiceNegativeIndices.html`
- `/pages/curriculum/GCSE/number/structure/indexLaws/powerOfAPower.html` — Raising a power to a power: Multiplying the indices, and telling this apart from multiplying powers. — drilled by `/pages/curriculum/GCSE/number/structure/indexLaws/practicePowerOfAPower.html`
- `/pages/curriculum/GCSE/number/structure/indexLaws/powerOfAProduct.html` — Powers of a product and a quotient: Applying an index to every factor in a bracket and both parts of a fraction. — drilled by `/pages/curriculum/GCSE/number/structure/indexLaws/practicePowerOfAProduct.html`
- `/pages/curriculum/GCSE/number/structure/indexLaws/negativeIndexOfAFraction.html` — A negative index on a fraction: Inverting the fraction first, then applying the positive index. — drilled by `/pages/curriculum/GCSE/number/structure/indexLaws/practiceNegativeIndexOfAFraction.html`
- `/pages/curriculum/GCSE/number/structure/indexLaws/indexEquations.html` — Index equations and changing the base: Writing both sides as powers of one base, then equating the indices. — drilled by `/pages/curriculum/GCSE/number/structure/indexLaws/practiceSimplifyingPowersReview.html`
- `/pages/curriculum/GCSE/number/structure/indexLaws/unitFractionalIndices.html` — Unit fractional indices **(H)**: The index one over n as the nth root, derived from raising a power to a power. — drilled by `/pages/curriculum/GCSE/number/structure/indexLaws/practiceUnitFractionalIndices.html`
- `/pages/curriculum/GCSE/number/structure/indexLaws/generalFractionalIndices.html` — Fractional indices **(H)**: The index m over n as a root and a power, and which one to take first. — drilled by `/pages/curriculum/GCSE/number/structure/indexLaws/practiceGeneralFractionalIndices.html`
- `/pages/curriculum/GCSE/number/structure/indexLaws/negativeFractionalIndices.html` — Negative fractional indices **(H)**: Combining reciprocal, root and power in the order that keeps numbers small. — drilled by `/pages/curriculum/GCSE/number/structure/indexLaws/practiceIndexLaws.html`

*`/pages/curriculum/GCSE/number/structure/workingInStandardForm/` — Working in standard form* (group menu) — A digit string times a power of ten, ordered and calculated with. Both tiers. Drills: `/pages/curriculum/GCSE/number/structure/workingInStandardForm/practiceStandardFormLesson.html`, `/pages/curriculum/GCSE/number/structure/workingInStandardForm/practiceStandardFormOrdering.html`, `/pages/curriculum/GCSE/number/structure/workingInStandardForm/practiceStandardFormMultiplyDivide.html`, `/pages/curriculum/GCSE/number/structure/workingInStandardForm/practiceStandardForm.html`.

- `/pages/curriculum/GCSE/number/structure/workingInStandardForm/standardForm.html` — Standard form: Converting both ways for large and small numbers, and correcting near-misses. — drilled by `/pages/curriculum/GCSE/number/structure/workingInStandardForm/practiceStandardFormLesson.html` — **written**
- `/pages/curriculum/GCSE/number/structure/workingInStandardForm/standardFormOrdering.html` — Ordering numbers in standard form: Comparing by the power of ten first, then by the front number. — drilled by `/pages/curriculum/GCSE/number/structure/workingInStandardForm/practiceStandardFormOrdering.html`
- `/pages/curriculum/GCSE/number/structure/workingInStandardForm/standardFormMultiplyDivide.html` — Multiplying and dividing in standard form: Products, quotients and how-many-times-bigger comparisons. — drilled by `/pages/curriculum/GCSE/number/structure/workingInStandardForm/practiceStandardFormMultiplyDivide.html`
- `/pages/curriculum/GCSE/number/structure/workingInStandardForm/standardFormAddSubtract.html` — Adding and subtracting in standard form: Matching the powers of ten before combining, then renormalising the result. — drilled by `/pages/curriculum/GCSE/number/structure/workingInStandardForm/practiceStandardForm.html`

*`/pages/curriculum/GCSE/number/structure/usingACalculator/` — Calculator methods and exact answers* (group menu) — Entering a calculation correctly, and when a value should stay as a symbol. Drills: `/pages/curriculum/GCSE/number/structure/usingACalculator/practiceCalculator.html`, `/pages/curriculum/GCSE/number/structure/usingACalculator/practiceCalculatorStandardForm.html`, `/pages/curriculum/GCSE/number/structure/usingACalculator/practiceCalculatorExactValues.html`, `/pages/curriculum/GCSE/number/structure/usingACalculator/practiceExactAnswers.html`, `/pages/curriculum/GCSE/number/structure/usingACalculator/practiceCalculatorReview.html`.

- `/pages/curriculum/GCSE/number/structure/usingACalculator/calculatorMethods.html` — Entering a calculation on a calculator: Brackets, fractions, powers, roots and negatives keyed as written. — drilled by `/pages/curriculum/GCSE/number/structure/usingACalculator/practiceCalculator.html`
- `/pages/curriculum/GCSE/number/structure/usingACalculator/calculatorStandardForm.html` — Standard form on a calculator: The times-ten-to-the-power key, and reading answers off the display. — drilled by `/pages/curriculum/GCSE/number/structure/usingACalculator/practiceCalculatorStandardForm.html`
- `/pages/curriculum/GCSE/number/structure/usingACalculator/calculatorExactValues.html` — Exact values, ANS and memory: Toggling between an exact value and its decimal, and reading the full display. — drilled by `/pages/curriculum/GCSE/number/structure/usingACalculator/practiceCalculatorExactValues.html`
- `/pages/curriculum/GCSE/number/structure/usingACalculator/calculatorAnsMemory.html` — The answer and memory keys: Carrying a full unrounded value into the next step, not a retyped rounded one. — drilled by `/pages/curriculum/GCSE/number/structure/usingACalculator/practiceCalculatorReview.html`
- `/pages/curriculum/GCSE/number/structure/usingACalculator/exactAnswers.html` — Exact answers and multiples of π: Holding π, a fraction or a root as a symbol rather than a decimal. — drilled by `/pages/curriculum/GCSE/number/structure/usingACalculator/practiceExactAnswers.html`

*`/pages/curriculum/GCSE/number/structure/surds/` — Rational, irrational and surds* (group menu) — Where a number sits in the number system, and Higher-tier surd arithmetic. Drills: `/pages/curriculum/GCSE/number/structure/surds/practiceSimplifyingSurds.html`, `/pages/curriculum/GCSE/number/structure/surds/practiceAddingSubtractingSurds.html`, `/pages/curriculum/GCSE/number/structure/surds/practiceMultiplyingSurds.html`, `/pages/curriculum/GCSE/number/structure/surds/practiceSquaringASurd.html`, `/pages/curriculum/GCSE/number/structure/surds/practiceDividingSurds.html`, `/pages/curriculum/GCSE/number/structure/surds/practiceExpandingSurds.html`, `/pages/curriculum/GCSE/number/structure/surds/practiceRationalisingDenominators.html`, `/pages/curriculum/GCSE/number/structure/surds/practiceSurds.html`.

- `/pages/curriculum/GCSE/number/structure/surds/rationalAndIrrational.html` — Rational and irrational numbers: Which numbers are one integer over another, and where π and surds sit. — drilled by `/pages/curriculum/GCSE/number/structure/powersAndRoots/practicePowersRootsReview.html`
- `/pages/curriculum/GCSE/number/structure/surds/simplifyingSurds.html` — Simplifying surds **(H)**: Extracting the largest square factor to write a√b, and comparing surds. — drilled by `/pages/curriculum/GCSE/number/structure/surds/practiceSimplifyingSurds.html`
- `/pages/curriculum/GCSE/number/structure/surds/addingSubtractingSurds.html` — Adding and subtracting surds **(H)**: Collecting like surds after simplifying every term. — drilled by `/pages/curriculum/GCSE/number/structure/surds/practiceAddingSubtractingSurds.html`
- `/pages/curriculum/GCSE/number/structure/surds/multiplyingSurds.html` — Multiplying surds **(H)**: Multiplying roots and coefficients separately, then simplifying the result. — drilled by `/pages/curriculum/GCSE/number/structure/surds/practiceMultiplyingSurds.html`
- `/pages/curriculum/GCSE/number/structure/surds/squaringASurd.html` — Squaring a surd **(H)**: Why a root times itself gives the number back, and what a coefficient does. — drilled by `/pages/curriculum/GCSE/number/structure/surds/practiceSquaringASurd.html`
- `/pages/curriculum/GCSE/number/structure/surds/dividingSurds.html` — Dividing surds **(H)**: Dividing under a single root, and simplifying quotients with coefficients. — drilled by `/pages/curriculum/GCSE/number/structure/surds/practiceDividingSurds.html`
- `/pages/curriculum/GCSE/number/structure/surds/expandingSurds.html` — Expanding brackets with surds **(H)**: Single and double brackets, squaring one, and the difference of two squares. — drilled by `/pages/curriculum/GCSE/number/structure/surds/practiceExpandingSurds.html`
- `/pages/curriculum/GCSE/number/structure/surds/rationalisingDenominators.html` — Rationalising a denominator **(H)**: Clearing a single surd from the bottom of a fraction by multiplying by one. — drilled by `/pages/curriculum/GCSE/number/structure/surds/practiceRationalisingDenominators.html`
- `/pages/curriculum/GCSE/number/structure/surds/rationalisingConjugates.html` — Rationalising with a conjugate **(H)**: Clearing a two-term surd denominator by reversing the middle sign and expanding. — drilled by `/pages/curriculum/GCSE/number/structure/surds/practiceSurds.html`


**`/pages/curriculum/GCSE/number/fractions/` — Fractions, decimals and percentages** *(topic menu, 7 groups, 38 teaching pages, 1 Higher only)*

*`/pages/curriculum/GCSE/number/fractions/fractionsAsNumbers/` — Fractions as numbers* (group menu) — What a fraction records, its place on the number line, and how two compare.

- `/pages/curriculum/GCSE/number/fractions/fractionsAsNumbers/fractionAsDivision.html` — A fraction as a division: The fraction bar read as a division, and any integer written as a fraction.
- `/pages/curriculum/GCSE/number/fractions/fractionsAsNumbers/equivalentFractions.html` — Equivalent fractions and simplest form: Scaling numerator and denominator together, and cancelling to simplest form.
- `/pages/curriculum/GCSE/number/fractions/fractionsAsNumbers/mixedNumbers.html` — Improper fractions and mixed numbers: Converting between improper fractions and mixed numbers, and when to use each.
- `/pages/curriculum/GCSE/number/fractions/fractionsAsNumbers/fractionsOnANumberLine.html` — Fractions on a number line: Placing a fraction or mixed number by splitting each unit into equal parts.
- `/pages/curriculum/GCSE/number/fractions/fractionsAsNumbers/comparisonSymbols.html` — Comparison symbols: Stating a comparison with the equality and inequality symbols.
- `/pages/curriculum/GCSE/number/fractions/fractionsAsNumbers/orderingFractions.html` — Comparing and ordering fractions: Ordering fractions by common denominator, common numerator or benchmarking.

*`/pages/curriculum/GCSE/number/fractions/calculatingWithFractions/` — Calculating with fractions* (group menu) — The four operations on fractions and mixed numbers, positive and negative. Drills: `/pages/curriculum/GCSE/number/fractions/calculatingWithFractions/practiceMultiplyingDividingMixedNumbers.html`, `/pages/curriculum/GCSE/number/fractions/calculatingWithFractions/practiceFractionArithmetic.html`.

- `/pages/curriculum/GCSE/number/fractions/calculatingWithFractions/addingFractions.html` — Adding and subtracting fractions: Adding and subtracting fractions with like and unlike denominators.
- `/pages/curriculum/GCSE/number/fractions/calculatingWithFractions/addingMixedNumbers.html` — Adding and subtracting mixed numbers: Adding and subtracting mixed numbers, including exchange from the whole part.
- `/pages/curriculum/GCSE/number/fractions/calculatingWithFractions/multiplyingFractions.html` — Multiplying fractions: Multiplying fractions by fractions or integers, cancelling before multiplying.
- `/pages/curriculum/GCSE/number/fractions/calculatingWithFractions/reciprocals.html` — Reciprocals: The reciprocal of an integer, fraction or mixed number.
- `/pages/curriculum/GCSE/number/fractions/calculatingWithFractions/dividingFractions.html` — Dividing fractions: Dividing by a fraction or an integer by multiplying by the reciprocal.
- `/pages/curriculum/GCSE/number/fractions/calculatingWithFractions/multiplyingDividingMixedNumbers.html` — Multiplying and dividing mixed numbers: Multiplying and dividing mixed numbers by converting to improper fractions. — drilled by `/pages/curriculum/GCSE/number/fractions/calculatingWithFractions/practiceMultiplyingDividingMixedNumbers.html`
- `/pages/curriculum/GCSE/number/fractions/calculatingWithFractions/addingSubtractingNegativeFractions.html` — Adding and subtracting negative fractions: Where the sign sits in a negative mixed number, and subtracting a negative.
- `/pages/curriculum/GCSE/number/fractions/calculatingWithFractions/multiplyingDividingNegativeFractions.html` — Multiplying and dividing negative fractions: The sign rules applied to products and quotients of negative fractions. — drilled by `/pages/curriculum/GCSE/number/fractions/calculatingWithFractions/practiceFractionArithmetic.html`

*`/pages/curriculum/GCSE/number/fractions/powersRootsAndSize/` — Powers, roots and size* (group menu) — Squaring, cubing and rooting fractions and decimals, and numbers below one.

- `/pages/curriculum/GCSE/number/fractions/powersRootsAndSize/powersOfFractions.html` — Powers and roots of fractions: Squaring, cubing and rooting a fraction, numerator and denominator separately.
- `/pages/curriculum/GCSE/number/fractions/powersRootsAndSize/powersOfDecimals.html` — Powers and roots of decimals: Squaring, cubing and rooting decimals, and why 0.3 squared is not 0.9.
- `/pages/curriculum/GCSE/number/fractions/powersRootsAndSize/numbersBelowOne.html` — Multiplying and dividing by numbers below one: How multiplying or dividing by a number below one changes a quantity.

*`/pages/curriculum/GCSE/number/fractions/fractionsOfQuantities/` — Fractions of quantities* (group menu) — A fraction of a quantity, recovering the whole, and quantities as fractions.

- `/pages/curriculum/GCSE/number/fractions/fractionsOfQuantities/fractionOfAmount.html` — Finding a fraction of a quantity: Dividing by the denominator and multiplying by the numerator.
- `/pages/curriculum/GCSE/number/fractions/fractionsOfQuantities/findingTheWhole.html` — Finding the whole from a fraction: Recovering the whole quantity when only a stated fraction of it is known.
- `/pages/curriculum/GCSE/number/fractions/fractionsOfQuantities/quantityAsFraction.html` — Writing one quantity as a fraction of another: Writing one quantity as a fraction of another in the same units.

*`/pages/curriculum/GCSE/number/fractions/fractionsAndDecimals/` — Fractions and decimals* (group menu) — Converting both ways, and why every fraction terminates or recurs.

- `/pages/curriculum/GCSE/number/fractions/fractionsAndDecimals/fractionsToDecimals.html` — Converting a fraction to a decimal: Converting a fraction to a decimal by short division.
- `/pages/curriculum/GCSE/number/fractions/fractionsAndDecimals/recurringDecimalNotation.html` — Recurring decimal notation: Dot notation for the repeating block, and writing it back out in digits.
- `/pages/curriculum/GCSE/number/fractions/fractionsAndDecimals/whichFractionsTerminate.html` — Which fractions terminate: Predicting from the denominator’s prime factors whether a fraction terminates.
- `/pages/curriculum/GCSE/number/fractions/fractionsAndDecimals/whyDecimalsRecur.html` — Why every fraction terminates or recurs: The remainder cycle in long division, and what it says about rational numbers.
- `/pages/curriculum/GCSE/number/fractions/fractionsAndDecimals/decimalsToFractions.html` — Terminating decimals to fractions: Converting a terminating decimal to a fraction by place value.
- `/pages/curriculum/GCSE/number/fractions/fractionsAndDecimals/recurringDecimalsToFractions.html` — Recurring decimals to fractions **(H)**: The algebraic subtraction method, including digits before the recurring block.

*`/pages/curriculum/GCSE/number/fractions/threeFormsTogether/` — The three forms together* (group menu) — Percentage as a third notation, ordering mixed lists, and choosing the form.

- `/pages/curriculum/GCSE/number/fractions/threeFormsTogether/percentagesAndFractions.html` — Percentages and fractions: Per cent as parts per hundred, converting a percentage to a fraction and back.
- `/pages/curriculum/GCSE/number/fractions/threeFormsTogether/percentagesAndDecimals.html` — Percentages and decimals: Converting between a percentage and a decimal by shifting two place columns.
- `/pages/curriculum/GCSE/number/fractions/threeFormsTogether/orderingFDP.html` — Ordering fractions, decimals and percentages: Ordering fractions, decimals and percentages by converting to one form.
- `/pages/curriculum/GCSE/number/fractions/threeFormsTogether/orderingNegatives.html` — Ordering negative values: Ordering negatives, where the larger digit gives the smaller value.
- `/pages/curriculum/GCSE/number/fractions/threeFormsTogether/choosingTheForm.html` — Choosing the form to calculate in: Whether a fraction, decimal or percentage makes a calculation shortest.

*`/pages/curriculum/GCSE/number/fractions/percentagesOfQuantities/` — Percentages of quantities* (group menu) — Percentages of amounts, quantities as percentages, and reverse percentages.

- `/pages/curriculum/GCSE/number/fractions/percentagesOfQuantities/percentageWithoutCalculator.html` — Percentages without a calculator: Building a percentage of an amount from 50%, 25%, 10%, 5% and 1%.
- `/pages/curriculum/GCSE/number/fractions/percentagesOfQuantities/percentageMultiplier.html` — Percentage of an amount by multiplier: A percentage of an amount in one step with a decimal multiplier.
- `/pages/curriculum/GCSE/number/fractions/percentagesOfQuantities/quantityAsPercentage.html` — Writing one quantity as a percentage of another: One quantity as a percentage of another, and comparing different totals.
- `/pages/curriculum/GCSE/number/fractions/percentagesOfQuantities/percentagesOver100.html` — Percentages above 100%: Percentages greater than the whole, and the multipliers above 1 they give.
- `/pages/curriculum/GCSE/number/fractions/percentagesOfQuantities/percentageIncreaseDecrease.html` — Percentage increase and decrease: Increasing or decreasing a quantity by a percentage with one multiplier.
- `/pages/curriculum/GCSE/number/fractions/percentagesOfQuantities/percentageChange.html` — Percentage change from two amounts: Finding the percentage rise or fall from the change over the original.
- `/pages/curriculum/GCSE/number/fractions/percentagesOfQuantities/reversePercentage.html` — Reverse percentages: Recovering the original amount by dividing by the multiplier.


**`/pages/curriculum/GCSE/number/measures/` — Measures and accuracy** *(topic menu, 7 groups, 43 teaching pages, 8 Higher only)*

*`/pages/curriculum/GCSE/number/measures/unitsAndConversion/` — Units and conversion* (group menu) — Converting metric, imperial, squared and cubed units, money and currency.

- `/pages/curriculum/GCSE/number/measures/unitsAndConversion/metricUnits.html` — Metric unit conversion: Converting between mm, cm, m and km, mg, g, kg and tonnes, and ml and litres.
- `/pages/curriculum/GCSE/number/measures/unitsAndConversion/mixedUnits.html` — Comparing quantities in different units: Ordering and adding quantities by converting to a common unit first.
- `/pages/curriculum/GCSE/number/measures/unitsAndConversion/moneyUnits.html` — Money: pounds and pence: Converting pounds to pence, and writing money to exactly two decimal places.
- `/pages/curriculum/GCSE/number/measures/unitsAndConversion/currencyConversion.html` — Currency conversion: Converting between pounds and euros at a given rate, and back again.
- `/pages/curriculum/GCSE/number/measures/unitsAndConversion/areaVolumeUnits.html` — Area and volume unit conversion: Why the linear factor is squared for area and cubed for volume.
- `/pages/curriculum/GCSE/number/measures/unitsAndConversion/volumeCapacity.html` — Volume and capacity: Linking cubic centimetres to millilitres and cubic metres to litres.
- `/pages/curriculum/GCSE/number/measures/unitsAndConversion/imperialUnits.html` — Metric and imperial conversion: Approximate equivalences for miles, pounds, pints and inches.

*`/pages/curriculum/GCSE/number/measures/timeAndTimetables/` — Time and timetables* (group menu) — Units of time, the two clock notations, durations and timetables.

- `/pages/curriculum/GCSE/number/measures/timeAndTimetables/timeUnits.html` — Units of time: Seconds, minutes, hours, days, weeks and years, and month lengths.
- `/pages/curriculum/GCSE/number/measures/timeAndTimetables/clockTimes.html` — The 12-hour and 24-hour clock: Writing the same time in both notations, and where midnight causes trouble.
- `/pages/curriculum/GCSE/number/measures/timeAndTimetables/timeDurations.html` — Finding a duration between two times: Working out the time between two clock times by bridging to the next whole hour.
- `/pages/curriculum/GCSE/number/measures/timeAndTimetables/timetables.html` — Reading timetables: Journey and waiting times from a timetable, and choosing a service.
- `/pages/curriculum/GCSE/number/measures/timeAndTimetables/decimalHours.html` — Decimal hours: Converting between hours and minutes and decimal hours for rate work.

*`/pages/curriculum/GCSE/number/measures/ratesAndReading/` — Rates and reading a measurement* (group menu) — Converting rates, reading scales, and estimating everyday measures.

- `/pages/curriculum/GCSE/number/measures/ratesAndReading/compoundUnits.html` — Converting compound units: Changing m/s into km/h by converting numerator and denominator separately.
- `/pages/curriculum/GCSE/number/measures/ratesAndReading/compoundUnitsPowers.html` — Compound units with a squared or cubed part: Converting grams per cubic centimetre to kilograms per cubic metre.
- `/pages/curriculum/GCSE/number/measures/ratesAndReading/readingScales.html` — Reading scales: What one division is worth on a ruler, jug, dial or weighing scale.
- `/pages/curriculum/GCSE/number/measures/ratesAndReading/sensibleUnits.html` — Choosing a sensible unit: Picking the unit that fits the quantity, so a door is measured in metres.
- `/pages/curriculum/GCSE/number/measures/ratesAndReading/estimatingMeasures.html` — Estimating everyday measurements: Estimating a length, mass or capacity against a quantity you already know.

*`/pages/curriculum/GCSE/number/measures/roundingAndTruncation/` — Rounding and truncation* (group menu) — The ways a number is cut short, and the contexts that override the digits. Drills: `/pages/curriculum/GCSE/number/measures/roundingAndTruncation/practiceBounds.html`.

- `/pages/curriculum/GCSE/number/measures/roundingAndTruncation/roundingPlaceValue.html` — Rounding to the nearest ten, hundred or thousand: Rounding to a stated power of ten, keeping the zeros that hold the place values.
- `/pages/curriculum/GCSE/number/measures/roundingAndTruncation/roundingDecimalPlaces.html` — Rounding to decimal places: Rounding a decimal to a stated number of places from the next digit only.
- `/pages/curriculum/GCSE/number/measures/roundingAndTruncation/roundingNegatives.html` — Rounding negative numbers: Rounding along the number line, so −3.47 rounds to −3.5 and −3.44 to −3.4.
- `/pages/curriculum/GCSE/number/measures/roundingAndTruncation/significantFigures.html` — Rounding to significant figures: Finding the first significant figure and rounding from there.
- `/pages/curriculum/GCSE/number/measures/roundingAndTruncation/significantFigureZeros.html` — Zeros and significant figures: Leading zeros never count, and zeros lost by rounding are written back.
- `/pages/curriculum/GCSE/number/measures/roundingAndTruncation/truncation.html` — Truncation: Cutting a number off at a decimal place or significant figure, not rounding.
- `/pages/curriculum/GCSE/number/measures/roundingAndTruncation/roundingInContext.html` — When the context forces the direction: Rounding up regardless of the digits when the context demands it.

*`/pages/curriculum/GCSE/number/measures/estimationAndChecking/` — Estimation and checking* (group menu) — How much accuracy an answer should carry, and checking it with an estimate.

- `/pages/curriculum/GCSE/number/measures/estimationAndChecking/choosingAccuracy.html` — Choosing the accuracy of a final answer: How many figures an answer should carry, given the accuracy of the inputs.
- `/pages/curriculum/GCSE/number/measures/estimationAndChecking/prematureRounding.html` — Rounding during a calculation: Why intermediate values are kept at full accuracy until the final answer.
- `/pages/curriculum/GCSE/number/measures/estimationAndChecking/estimatingCalculations.html` — Estimating by rounding to one significant figure: Rounding every number to one significant figure, then calculating exactly.
- `/pages/curriculum/GCSE/number/measures/estimationAndChecking/overUnderEstimates.html` — Over-estimates and under-estimates: Judging each rounding by the role its number plays in the calculation.
- `/pages/curriculum/GCSE/number/measures/estimationAndChecking/estimatingRoots.html` — Estimating powers and roots **(H)**: Trapping a number between the nearest squares or cubes to estimate its root.
- `/pages/curriculum/GCSE/number/measures/estimationAndChecking/checkingAnswers.html` — Checking an answer is sensible: Testing a result against an estimate, the context, and the inverse operation.

*`/pages/curriculum/GCSE/number/measures/errorIntervals/` — Error intervals* (group menu) — A rounded, truncated or measured value stands for a range of possible values. Drills: `/pages/curriculum/GCSE/number/measures/errorIntervals/practiceErrorIntervalsRounding.html`, `/pages/curriculum/GCSE/number/measures/roundingAndTruncation/practiceBounds.html`.

- `/pages/curriculum/GCSE/number/measures/errorIntervals/measurementAccuracy.html` — Why a measurement is never exact: Why a reading is only ever accurate to half the smallest division on the scale.
- `/pages/curriculum/GCSE/number/measures/errorIntervals/errorIntervalsRounding.html` — Error intervals from rounding: The interval a rounded value came from, half a unit either side. — drilled by `/pages/curriculum/GCSE/number/measures/errorIntervals/practiceErrorIntervalsRounding.html`
- `/pages/curriculum/GCSE/number/measures/errorIntervals/errorIntervalsSignificantFigures.html` — Error intervals from significant figures: Finding the rounding unit from the last significant figure, then the interval.
- `/pages/curriculum/GCSE/number/measures/errorIntervals/errorIntervalsTruncation.html` — Error intervals from truncation: Why a truncated value is its own lower bound, with an interval one unit wide.
- `/pages/curriculum/GCSE/number/measures/errorIntervals/reverseErrorIntervals.html` — Working back from an interval: Recovering the stated value and its accuracy from an error interval.
- `/pages/curriculum/GCSE/number/measures/errorIntervals/discreteBounds.html` — Bounds of discrete quantities: Greatest and least possible values when a quantity counts whole items.

*`/pages/curriculum/GCSE/number/measures/calculatingWithBounds/` — Calculating with bounds* (group menu) — Higher tier: choosing bounds in a calculation and quoting supported accuracy. Drills: `/pages/curriculum/GCSE/number/measures/roundingAndTruncation/practiceBounds.html`.

- `/pages/curriculum/GCSE/number/measures/calculatingWithBounds/percentageError.html` — Maximum error and percentage error **(H)**: The greatest possible error as a percentage of the measurement.
- `/pages/curriculum/GCSE/number/measures/calculatingWithBounds/boundsAddSubtract.html` — Bounds in addition and subtraction **(H)**: Why the greatest difference pairs an upper bound with a lower bound.
- `/pages/curriculum/GCSE/number/measures/calculatingWithBounds/boundsMultiplyDivide.html` — Bounds in multiplication and division **(H)**: Why the largest quotient divides upper by lower, and the smallest reverses it.
- `/pages/curriculum/GCSE/number/measures/calculatingWithBounds/boundsCompoundMeasures.html` — Bounds in compound measures **(H)**: The bound each quantity takes in a speed, density or pressure calculation.
- `/pages/curriculum/GCSE/number/measures/calculatingWithBounds/boundsGeometry.html` — Bounds in area, volume and Pythagoras **(H)**: Pushing upper and lower bounds through a geometric formula to bound the result.
- `/pages/curriculum/GCSE/number/measures/calculatingWithBounds/boundsDecisionProblems.html` — Deciding from the worst case **(H)**: Whether something definitely fits, tested on the least favourable bounds.
- `/pages/curriculum/GCSE/number/measures/calculatingWithBounds/suitableAccuracyBounds.html` — A suitable degree of accuracy from bounds **(H)**: Quoting an answer only to the accuracy where its bounds still agree. — drilled by `/pages/curriculum/GCSE/number/measures/roundingAndTruncation/practiceBounds.html`

### Algebra

Four topic menus, 28 group menus, and 131 teaching pages. Lesson drills are narrow; mixed reviews appear only after their final prerequisite.

**`/pages/curriculum/GCSE/algebra/notation/` — Notation, vocabulary and manipulation** *(topic menu, 9 groups, 43 teaching pages, 11 Higher only)*

*`/pages/curriculum/GCSE/algebra/notation/notationAndVocabulary/` — Notation and vocabulary* (group menu) — How algebra is written, its vocabulary, and turning words into symbols.

- `/pages/curriculum/GCSE/algebra/notation/notationAndVocabulary/algebraicNotation.html` — Algebraic notation: Writing products and quotients without symbols, so 3 × y is 3y.
- `/pages/curriculum/GCSE/algebra/notation/notationAndVocabulary/powersInAlgebra.html` — Squares and cubes of a letter: What a², a³ and 2a each mean, and why a² and 2a are not the same thing.
- `/pages/curriculum/GCSE/algebra/notation/notationAndVocabulary/termsAndCoefficients.html` — Terms, factors and coefficients: Naming terms, factors and coefficients in an expression.
- `/pages/curriculum/GCSE/algebra/notation/notationAndVocabulary/expressionEquationFormula.html` — Expression, equation or formula: Deciding which a piece of algebra is from its equals sign and its letters.
- `/pages/curriculum/GCSE/algebra/notation/notationAndVocabulary/writingExpressions.html` — Writing an expression from words: Turning descriptions of ages, costs or lengths into expressions.

*`/pages/curriculum/GCSE/algebra/notation/substitution/` — Substitution* (group menu) — Replacing letters with numbers, and the sign and power slips that cost marks. Drills: `/pages/curriculum/GCSE/algebra/notation/substitution/practiceSubstitution.html`, `/pages/curriculum/GCSE/algebra/notation/substitution/practiceSubstitutingNegatives.html`, `/pages/curriculum/GCSE/algebra/notation/substitution/practiceSubstitutingWithPowers.html`, `/pages/curriculum/GCSE/algebra/notation/substitution/practiceSubstitutionReview.html`.

- `/pages/curriculum/GCSE/algebra/notation/substitution/substitutingIntoExpressions.html` — Substituting into an expression: Replacing each letter with a number, then evaluating in the right order. — drilled by `/pages/curriculum/GCSE/algebra/notation/substitution/practiceSubstitution.html`
- `/pages/curriculum/GCSE/algebra/notation/substitution/substitutingNegatives.html` — Substituting negative numbers: Substituting a negative value with brackets, so the sign survives squaring. — drilled by `/pages/curriculum/GCSE/algebra/notation/substitution/practiceSubstitutingNegatives.html`
- `/pages/curriculum/GCSE/algebra/notation/substitution/substitutingWithPowers.html` — Substituting into terms with powers: Why 3x² means square first then multiply by 3, so x = 4 gives 48 not 144. — drilled by `/pages/curriculum/GCSE/algebra/notation/substitution/practiceSubstitutingWithPowers.html`
- `/pages/curriculum/GCSE/algebra/notation/substitution/substitutingIntoFormulae.html` — Substituting into a formula: Using formulae such as v = u + at by substituting every known value. — drilled by `/pages/curriculum/GCSE/algebra/notation/substitution/practiceSubstitutionReview.html`

*`/pages/curriculum/GCSE/algebra/notation/simplifying/` — Simplifying expressions* (group menu) — Collecting, multiplying and dividing terms, with Higher-tier index laws. Drills: `/pages/curriculum/GCSE/algebra/notation/simplifying/practiceSimplifyingTerms.html`, `/pages/curriculum/GCSE/algebra/notation/simplifying/practiceLikeTermsWithPowers.html`, `/pages/curriculum/GCSE/algebra/notation/simplifying/practiceMultiplyingTerms.html`, `/pages/curriculum/GCSE/algebra/notation/simplifying/practiceSimplifyingTermsReview.html`.

- `/pages/curriculum/GCSE/algebra/notation/simplifying/collectingLikeTerms.html` — Collecting like terms: Combining like terms, each term carrying the sign in front of it. — drilled by `/pages/curriculum/GCSE/algebra/notation/simplifying/practiceSimplifyingTerms.html`
- `/pages/curriculum/GCSE/algebra/notation/simplifying/likeTermsWithPowers.html` — Like terms with powers: Why x and x² are unlike terms, and collecting expressions that mix them. — drilled by `/pages/curriculum/GCSE/algebra/notation/simplifying/practiceLikeTermsWithPowers.html`
- `/pages/curriculum/GCSE/algebra/notation/simplifying/multiplyingTerms.html` — Multiplying terms: Multiplying coefficients and letters separately, so 3a × 4b is 12ab. — drilled by `/pages/curriculum/GCSE/algebra/notation/simplifying/practiceMultiplyingTerms.html`
- `/pages/curriculum/GCSE/algebra/notation/simplifying/dividingTerms.html` — Dividing terms: Writing a division as a fraction, then cancelling common factors. — drilled by `/pages/curriculum/GCSE/algebra/notation/simplifying/practiceSimplifyingTermsReview.html`
- `/pages/curriculum/GCSE/algebra/notation/simplifying/multiplyingAlgebraicPowers.html` — Multiplying powers of a letter: Simplifying 4a³ × 3a² by multiplying coefficients and adding indices.
- `/pages/curriculum/GCSE/algebra/notation/simplifying/dividingAlgebraicPowers.html` — Dividing powers of a letter: Simplifying 12a⁵ ÷ 4a² by dividing coefficients and subtracting indices.
- `/pages/curriculum/GCSE/algebra/notation/simplifying/powerOfATerm.html` — Raising a term to a power: Applying the index to every factor, so (2a³)⁴ is 16a¹² not 2a¹².

*`/pages/curriculum/GCSE/algebra/notation/expandingBrackets/` — Expanding brackets* (group menu) — Multiplying over one bracket, then pairs and triples of brackets. Drills: `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/practiceExpandFactorise.html`, `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/practiceDoubleBracketsWithCoefficients.html`, `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/practiceSquaringABracket.html`, `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/practiceExpandFactoriseReview.html`.

- `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/expandingSingleBrackets.html` — Expanding a single bracket: Multiplying the outside term over every term inside, not just the first.
- `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/minusOverABracket.html` — A minus sign in front of a bracket: Expanding with a negative term outside, where the second sign inside flips.
- `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/expandAndCollect.html` — Expanding then collecting like terms: Simplifying 3(x + 2) − 2(x − 5), the minus acting on the whole second bracket.
- `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/expandingDoubleBrackets.html` — Expanding double brackets: Multiplying every term in one bracket by every term in the other. — drilled by `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/practiceExpandFactorise.html`
- `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/doubleBracketsWithCoefficients.html` — Double brackets with coefficients: Expanding (2x + 3)(3x − 1), keeping track of the middle terms. — drilled by `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/practiceDoubleBracketsWithCoefficients.html`
- `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/squaringABracket.html` — Squaring a bracket: Writing (x + 4)² as a full double bracket, never just x² + 16. — drilled by `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/practiceSquaringABracket.html`
- `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/expandingTripleBrackets.html` — Expanding triple brackets **(H)**: Multiplying two brackets first, then the third into the result.

*`/pages/curriculum/GCSE/algebra/notation/factorising/` — Factorising* (group menu) — Writing an expression as a product, from common factors to quadratics. Drills: `/pages/curriculum/GCSE/algebra/notation/factorising/practiceFactorisingQuadratics.html`, `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/practiceExpandFactoriseReview.html`.

- `/pages/curriculum/GCSE/algebra/notation/factorising/takingOutCommonFactors.html` — Taking out a common factor: Factorising into a single bracket by taking out the highest common factor.
- `/pages/curriculum/GCSE/algebra/notation/factorising/factorisingCompletely.html` — Factorising completely: Taking out the whole common factor, numbers and letters together.
- `/pages/curriculum/GCSE/algebra/notation/factorising/factorisingQuadratics.html` — Factorising a quadratic expression: Factorising x² + bx + c from a pair of numbers that add to b and multiply to c. — drilled by `/pages/curriculum/GCSE/algebra/notation/factorising/practiceFactorisingQuadratics.html`
- `/pages/curriculum/GCSE/algebra/notation/factorising/differenceOfTwoSquares.html` — The difference of two squares: Factorising expressions like x² − 49, spotted by the two squares and the minus. — drilled by `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/practiceExpandFactoriseReview.html`
- `/pages/curriculum/GCSE/algebra/notation/factorising/factorisingHarderQuadratics.html` — Factorising when x² has a coefficient **(H)**: Factorising ax² + bx + c by splitting the middle term or testing brackets.

*`/pages/curriculum/GCSE/algebra/notation/formulae/` — Formulae and changing the subject* (group menu) — Building a formula from a description, and changing the subject. Drills: `/pages/curriculum/GCSE/algebra/notation/formulae/practiceRearranging.html`, `/pages/curriculum/GCSE/algebra/notation/formulae/practiceRearrangingPowersAndRoots.html`, `/pages/curriculum/GCSE/algebra/notation/formulae/practiceRearrangingReview.html`.

- `/pages/curriculum/GCSE/algebra/notation/formulae/writingAFormula.html` — Writing a formula from a description: Building a formula from a worded rule, such as a charge with a fixed part.
- `/pages/curriculum/GCSE/algebra/notation/formulae/changingTheSubject.html` — Changing the subject of a formula: Rearranging a formula so a different letter stands alone on one side. — drilled by `/pages/curriculum/GCSE/algebra/notation/formulae/practiceRearranging.html`
- `/pages/curriculum/GCSE/algebra/notation/formulae/rearrangingPowersAndRoots.html` — Rearranging with squares and roots: Changing the subject when it sits inside a square, a root or a fraction. — drilled by `/pages/curriculum/GCSE/algebra/notation/formulae/practiceRearrangingPowersAndRoots.html`
- `/pages/curriculum/GCSE/algebra/notation/formulae/subjectAppearingTwice.html` — The subject appearing twice **(H)**: Gathering both copies of the subject on one side, then factorising it out. — drilled by `/pages/curriculum/GCSE/algebra/notation/formulae/practiceRearrangingReview.html`

*`/pages/curriculum/GCSE/algebra/notation/algebraicFractions/` — Algebraic fractions* (group menu) — Higher tier: simplifying algebraic fractions and the four operations on them. Drills: `/pages/curriculum/GCSE/algebra/notation/algebraicFractions/practiceAlgebraicFractions.html`, `/pages/curriculum/GCSE/algebra/notation/algebraicFractions/practiceMultiplyingDividingAlgebraicFractions.html`, `/pages/curriculum/GCSE/algebra/notation/algebraicFractions/practiceAlgebraicFractionsReview.html`.

- `/pages/curriculum/GCSE/algebra/notation/algebraicFractions/simplifyingAlgebraicFractions.html` — Simplifying an algebraic fraction **(H)**: Factorising before cancelling, since only a factor cancels, never a term. — drilled by `/pages/curriculum/GCSE/algebra/notation/algebraicFractions/practiceAlgebraicFractions.html`
- `/pages/curriculum/GCSE/algebra/notation/algebraicFractions/multiplyingDividingAlgebraicFractions.html` — Multiplying and dividing algebraic fractions **(H)**: Cancelling before multiplying, and dividing as multiplying by the reciprocal. — drilled by `/pages/curriculum/GCSE/algebra/notation/algebraicFractions/practiceMultiplyingDividingAlgebraicFractions.html`
- `/pages/curriculum/GCSE/algebra/notation/algebraicFractions/addingAlgebraicFractions.html` — Adding and subtracting algebraic fractions **(H)**: Writing both fractions over a common denominator before adding or subtracting. — drilled by `/pages/curriculum/GCSE/algebra/notation/algebraicFractions/practiceAlgebraicFractionsReview.html`

*`/pages/curriculum/GCSE/algebra/notation/functions/` — Functions* (group menu) — A function as an input–output rule, inverted and combined at Higher tier. Drills: `/pages/curriculum/GCSE/algebra/notation/functions/practiceFunctions.html`, `/pages/curriculum/GCSE/algebra/notation/functions/practiceInverseFunctions.html`, `/pages/curriculum/GCSE/algebra/notation/functions/practiceFunctionsReview.html`.

- `/pages/curriculum/GCSE/algebra/notation/functions/inputsAndOutputs.html` — Functions as inputs and outputs: An expression as a machine turning inputs into outputs, run both ways.
- `/pages/curriculum/GCSE/algebra/notation/functions/functionNotation.html` — Function notation **(H)**: Reading f(x) as the output at x, and evaluating f(3) and 2f(1). — drilled by `/pages/curriculum/GCSE/algebra/notation/functions/practiceFunctions.html`
- `/pages/curriculum/GCSE/algebra/notation/functions/inverseFunctions.html` — Inverse functions **(H)**: Finding f⁻¹(x) by rearranging y = f(x), and how the inverse undoes it. — drilled by `/pages/curriculum/GCSE/algebra/notation/functions/practiceInverseFunctions.html`
- `/pages/curriculum/GCSE/algebra/notation/functions/compositeFunctions.html` — Composite functions **(H)**: Applying one function to the output of another, and why fg(x) applies g first. — drilled by `/pages/curriculum/GCSE/algebra/notation/functions/practiceFunctionsReview.html`

*`/pages/curriculum/GCSE/algebra/notation/identitiesAndProof/` — Identities and proof* (group menu) — Telling equations from identities, and Higher-tier algebraic proof.

- `/pages/curriculum/GCSE/algebra/notation/identitiesAndProof/equationOrIdentity.html` — Telling an equation from an identity: An equation holds for some values, an identity for all, written with ≡.
- `/pages/curriculum/GCSE/algebra/notation/identitiesAndProof/showingEquivalence.html` — Showing two expressions are equivalent: Expanding and simplifying one side until it matches the other.
- `/pages/curriculum/GCSE/algebra/notation/identitiesAndProof/representingIntegers.html` — Writing even, odd and consecutive integers **(H)**: Even numbers as 2n, odd as 2n + 1, consecutive integers as n and n + 1.
- `/pages/curriculum/GCSE/algebra/notation/identitiesAndProof/algebraicProof.html` — Proving a statement algebraically **(H)**: Proving a claim for every integer at once, since examples never prove.


**`/pages/curriculum/GCSE/algebra/graphs/` — Graphs** *(topic menu, 8 groups, 39 teaching pages, 15 Higher only)*

*`/pages/curriculum/GCSE/algebra/graphs/coordinates/` — Coordinates* (group menu) — Plotting points in all four quadrants, with midpoints and missing corners.

- `/pages/curriculum/GCSE/algebra/graphs/coordinates/fourQuadrants.html` — Coordinates in all four quadrants: Plotting and reading points with negative coordinates, x written before y.
- `/pages/curriculum/GCSE/algebra/graphs/coordinates/midpointOfASegment.html` — The midpoint of a line segment: Finding the point halfway between two points by averaging the coordinates.
- `/pages/curriculum/GCSE/algebra/graphs/coordinates/completingAShape.html` — Completing a shape from its coordinates: Finding the missing vertex of a square, rectangle or parallelogram.

*`/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/` — Straight-line graphs* (group menu) — The line a linear equation draws: gradient, intercept and related lines. Drills: `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceStraightLines.html`, `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceGradientInterceptForm.html`, `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceReadingALineEquation.html`, `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceRearrangingLineEquations.html`, `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceLineThroughAPoint.html`, `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceLineThroughTwoPoints.html`, `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceParallelLines.html`, `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceStraightLinesReview.html`.

- `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/horizontalVerticalLines.html` — Horizontal and vertical lines: Why x = 3 is a vertical line and y = 3 a horizontal one.
- `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/tableOfValues.html` — Plotting a line from a table of values: Filling a table, plotting the points, and using a stray point as a check.
- `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/gradientOfALine.html` — The gradient of a line: Measuring steepness as rise over run, the sign showing climb or fall. — drilled by `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceStraightLines.html`
- `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/gradientInterceptForm.html` — The equation y = mx + c: Reading the gradient and y-intercept straight from the equation. — drilled by `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceGradientInterceptForm.html`
- `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/readingALineEquation.html` — Reading an equation off a graph: Finding the intercept on the y-axis and the gradient from a whole-square triangle. — drilled by `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceReadingALineEquation.html`
- `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/rearrangingLineEquations.html` — Lines not written as y = mx + c: Rearranging equations like 2x + 3y = 6 before reading the gradient off. — drilled by `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceRearrangingLineEquations.html`
- `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/lineThroughAPoint.html` — The line through a point with a given gradient: Substituting the point into y = mx + c to find c, then writing the equation out. — drilled by `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceLineThroughAPoint.html`
- `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/lineThroughTwoPoints.html` — The line through two points: Finding the gradient from the two points, then the intercept from either. — drilled by `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceLineThroughTwoPoints.html`
- `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/parallelLines.html` — Parallel lines: Lines with equal gradients never meet, and writing a parallel line’s equation. — drilled by `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceParallelLines.html`
- `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/perpendicularLines.html` — Perpendicular lines **(H)**: Gradients of perpendicular lines multiply to −1. — drilled by `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceStraightLinesReview.html`

*`/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/` — Quadratic graphs* (group menu) — The parabola a quadratic draws: symmetry, roots, intercept and turning point. Drills: `/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/practiceQuadraticGraphs.html`, `/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/practiceQuadraticTurningPoints.html`, `/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/practiceQuadraticGraphsReview.html`.

- `/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/plottingQuadratics.html` — Plotting a quadratic graph: Building a table of values, then drawing a smooth curve through the points.
- `/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/parabolaSymmetry.html` — The shape and symmetry of a parabola: Why a quadratic graph is a symmetric curve with one turning point.
- `/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/quadraticRootsAndIntercepts.html` — Roots and intercepts on a quadratic graph: Reading roots off the x-axis and the intercept off the y-axis. — drilled by `/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/practiceQuadraticGraphs.html`
- `/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/quadraticTurningPoints.html` — Turning points on a quadratic graph: Reading the minimum or maximum off the graph, halfway between the roots. — drilled by `/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/practiceQuadraticTurningPoints.html`
- `/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/sketchingQuadratics.html` — Sketching a quadratic from factorised form: Marking roots from the brackets and the intercept from the constant. — drilled by `/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/practiceQuadraticGraphsReview.html`
- `/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/turningPointByCompletingSquare.html` — The turning point by completing the square **(H)**: Reading the turning point (−p, q) from (x + p)² + q, signs included.

*`/pages/curriculum/GCSE/algebra/graphs/otherCurves/` — Cubic, reciprocal and other curves* (group menu) — Cubic and reciprocal curves, and exponential and trigonometric ones at Higher.

- `/pages/curriculum/GCSE/algebra/graphs/otherCurves/cubicGraphs.html` — Cubic graphs: The S-shaped curve of x³, and how a negative coefficient flips it.
- `/pages/curriculum/GCSE/algebra/graphs/otherCurves/reciprocalGraphs.html` — Reciprocal graphs: The two branches of y = 1/x, approaching but never touching either axis.
- `/pages/curriculum/GCSE/algebra/graphs/otherCurves/recognisingGraphs.html` — Matching an equation to its graph: Telling linear, quadratic, cubic and reciprocal graphs apart by shape alone.
- `/pages/curriculum/GCSE/algebra/graphs/otherCurves/exponentialGraphs.html` — Exponential graphs **(H)**: The shape of y = kˣ, growing or decaying, always crossing the y-axis at 1.
- `/pages/curriculum/GCSE/algebra/graphs/otherCurves/sineAndCosineGraphs.html` — The sine and cosine graphs **(H)**: The two waves between −1 and 1, repeating every 360°, separated by a shift.
- `/pages/curriculum/GCSE/algebra/graphs/otherCurves/tangentGraph.html` — The tangent graph **(H)**: The repeating branches of y = tan x, with vertical asymptotes every 180°.

*`/pages/curriculum/GCSE/algebra/graphs/realLifeGraphs/` — Real-life graphs* (group menu) — Graphs of journeys, charges and readings, and what gradient and area mean. Drills: `/pages/curriculum/GCSE/algebra/graphs/realLifeGraphs/practiceDistanceTime.html`, `/pages/curriculum/GCSE/algebra/graphs/realLifeGraphs/practiceDistanceTimeReview.html`.

- `/pages/curriculum/GCSE/algebra/graphs/realLifeGraphs/distanceTimeGraphs.html` — Distance–time graphs: Speed as the gradient, rest as a flat section, not a picture of the road. — drilled by `/pages/curriculum/GCSE/algebra/graphs/realLifeGraphs/practiceDistanceTime.html`
- `/pages/curriculum/GCSE/algebra/graphs/realLifeGraphs/velocityTimeGraphs.html` — Velocity–time graphs: Acceleration as the gradient and distance as the area underneath. — drilled by `/pages/curriculum/GCSE/algebra/graphs/realLifeGraphs/practiceDistanceTimeReview.html`
- `/pages/curriculum/GCSE/algebra/graphs/realLifeGraphs/financialGraphs.html` — Reading a financial graph: Fixed charges as the intercept and the rate as the gradient.
- `/pages/curriculum/GCSE/algebra/graphs/realLifeGraphs/estimatingFromAGraph.html` — Estimating values from a real-life graph: Reading between plotted points for an estimate, and how far to trust it.

*`/pages/curriculum/GCSE/algebra/graphs/graphTransformations/` — Transformations of graphs* (group menu) — Higher tier: how adding moves a graph and a minus sign reflects it. Drills: `/pages/curriculum/GCSE/algebra/graphs/graphTransformations/practiceGraphTransformations.html`, `/pages/curriculum/GCSE/algebra/graphs/graphTransformations/practiceHorizontalTranslations.html`, `/pages/curriculum/GCSE/algebra/graphs/graphTransformations/practiceGraphTransformationsReview.html`.

- `/pages/curriculum/GCSE/algebra/graphs/graphTransformations/verticalTranslations.html` — Translating a graph up and down **(H)**: The graph of f(x) + a as the original slid a units vertically. — drilled by `/pages/curriculum/GCSE/algebra/graphs/graphTransformations/practiceGraphTransformations.html`
- `/pages/curriculum/GCSE/algebra/graphs/graphTransformations/horizontalTranslations.html` — Translating a graph left and right **(H)**: The graph of f(x + a) as a slide of a units, opposite to the sign. — drilled by `/pages/curriculum/GCSE/algebra/graphs/graphTransformations/practiceHorizontalTranslations.html`
- `/pages/curriculum/GCSE/algebra/graphs/graphTransformations/reflectingGraphs.html` — Reflecting a graph in the axes **(H)**: Telling −f(x), a reflection in the x-axis, from f(−x) in the y-axis. — drilled by `/pages/curriculum/GCSE/algebra/graphs/graphTransformations/practiceGraphTransformationsReview.html`

*`/pages/curriculum/GCSE/algebra/graphs/gradientsAndAreas/` — Gradients and areas under curves* (group menu) — Higher tier: gradients of curves, rates of change, and areas under graphs.

- `/pages/curriculum/GCSE/algebra/graphs/gradientsAndAreas/gradientOfACurve.html` — The gradient of a curve at a point **(H)**: Drawing a tangent and taking its gradient, since a curve’s gradient varies.
- `/pages/curriculum/GCSE/algebra/graphs/gradientsAndAreas/ratesOfChange.html` — Average and instantaneous rates of change **(H)**: The chord for the average rate, and the tangent for the rate at an instant.
- `/pages/curriculum/GCSE/algebra/graphs/gradientsAndAreas/areaUnderAGraph.html` — Estimating the area under a graph **(H)**: Splitting the region into strips and trapeziums to estimate the area.
- `/pages/curriculum/GCSE/algebra/graphs/gradientsAndAreas/gradientAndAreaInContext.html` — Gradients and areas in context **(H)**: On a velocity–time graph the gradient is acceleration and the area distance.

*`/pages/curriculum/GCSE/algebra/graphs/circle/` — Circles on coordinate axes* (group menu) — Higher tier: the circle x² + y² = r², its tangents, and lines that cross it. Drills: `/pages/curriculum/GCSE/algebra/graphs/circle/practiceCircleEquation.html`, `/pages/curriculum/GCSE/algebra/graphs/circle/practiceTangentToACircle.html`, `/pages/curriculum/GCSE/algebra/graphs/circle/practiceCircleEquationReview.html`.

- `/pages/curriculum/GCSE/algebra/graphs/circle/circleEquation.html` — The equation of a circle **(H)**: Why x² + y² = r² describes a circle centred at the origin. — drilled by `/pages/curriculum/GCSE/algebra/graphs/circle/practiceCircleEquation.html`
- `/pages/curriculum/GCSE/algebra/graphs/circle/tangentToACircle.html` — The tangent to a circle at a point **(H)**: Finding the tangent’s equation from the radius it is perpendicular to. — drilled by `/pages/curriculum/GCSE/algebra/graphs/circle/practiceTangentToACircle.html`
- `/pages/curriculum/GCSE/algebra/graphs/circle/lineMeetsCircle.html` — Where a line crosses a circle **(H)**: Substituting the line into the circle’s equation to count the meeting points. — drilled by `/pages/curriculum/GCSE/algebra/graphs/circle/practiceCircleEquationReview.html`


**`/pages/curriculum/GCSE/algebra/equations/` — Solving equations and inequalities** *(topic menu, 7 groups, 33 teaching pages, 12 Higher only)*

*`/pages/curriculum/GCSE/algebra/equations/linearEquations/` — Linear equations* (group menu) — The balance method through brackets, fractions and unknowns on both sides. Drills: `/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceEquations.html`, `/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceUnknownOnBothSides.html`, `/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceEquationsWithBrackets.html`, `/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceEquationsWithFractions.html`, `/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceEquationsReview.html`.

- `/pages/curriculum/GCSE/algebra/equations/linearEquations/solvingTwoStepEquations.html` — Solving two-step equations: Undoing operations in reverse order, keeping both sides balanced. — drilled by `/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceEquations.html`
- `/pages/curriculum/GCSE/algebra/equations/linearEquations/unknownOnBothSides.html` — Unknowns on both sides: Collecting the unknowns on one side and the numbers on the other. — drilled by `/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceUnknownOnBothSides.html`
- `/pages/curriculum/GCSE/algebra/equations/linearEquations/equationsWithBrackets.html` — Equations with brackets: Expanding the brackets first, or dividing both sides straight away. — drilled by `/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceEquationsWithBrackets.html`
- `/pages/curriculum/GCSE/algebra/equations/linearEquations/equationsWithFractions.html` — Equations with fractions: Clearing fractions by multiplying every term by the common denominator. — drilled by `/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceEquationsWithFractions.html`

*`/pages/curriculum/GCSE/algebra/equations/quadraticEquations/` — Quadratic equations* (group menu) — Factorising at both tiers, completing the square and the formula at Higher. Drills: `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/practiceSolvingByFactorising.html`, `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/practiceQuadraticsMissingConstant.html`, `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/practiceRearrangingBeforeSolving.html`, `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/practiceSolvingByCompletingTheSquare.html`, `/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceEquationsReview.html`.

- `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/solvingByFactorising.html` — Solving a quadratic by factorising: Factorising, then setting each bracket to zero, since a factor must be zero. — drilled by `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/practiceSolvingByFactorising.html`
- `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/quadraticsMissingConstant.html` — Quadratics with no constant term: Solving x² = 5x by factorising, since dividing by x loses the root x = 0. — drilled by `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/practiceQuadraticsMissingConstant.html`
- `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/rearrangingBeforeSolving.html` — Rearranging a quadratic before solving **(H)**: Collecting everything on one side equal to zero before factorising. — drilled by `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/practiceRearrangingBeforeSolving.html`
- `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/completingTheSquare.html` — Completing the square **(H)**: Writing x² + bx + c as a squared bracket plus a correction.
- `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/solvingByCompletingTheSquare.html` — Solving by completing the square **(H)**: Solving from completed square form by rooting both sides, plus and minus. — drilled by `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/practiceSolvingByCompletingTheSquare.html`
- `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/quadraticFormula.html` — The quadratic formula **(H)**: Substituting a, b and c with their signs, and reading exact answers as surds. — drilled by `/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceEquationsReview.html`
- `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/choosingAMethod.html` — Choosing how to solve a quadratic **(H)**: Factorising when the factors are visible, the formula when they are not.

*`/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/` — Simultaneous equations* (group menu) — Two unknowns pinned down by two equations, by elimination or substitution. Drills: `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceSimultaneous.html`, `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceScalingBeforeEliminating.html`, `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceSimultaneousBySubstitution.html`, `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceFormingSimultaneousEquations.html`, `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceLinearQuadraticSimultaneous.html`, `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceSimultaneousReview.html`.

- `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/simultaneousByElimination.html` — Simultaneous equations by elimination: Adding or subtracting equations to remove one unknown, then substituting back. — drilled by `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceSimultaneous.html`
- `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/scalingBeforeEliminating.html` — Scaling before eliminating: Multiplying one or both equations so a pair of coefficients match. — drilled by `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceScalingBeforeEliminating.html`
- `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/simultaneousBySubstitution.html` — Simultaneous equations by substitution: Replacing one unknown with an expression from the other equation. — drilled by `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceSimultaneousBySubstitution.html`
- `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/formingSimultaneousEquations.html` — Forming simultaneous equations from a problem: Turning two facts about two unknowns into a pair of equations to solve. — drilled by `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceFormingSimultaneousEquations.html`
- `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/linearQuadraticSimultaneous.html` — A linear and a quadratic equation together **(H)**: Substituting the linear equation into the quadratic, pairing each x with its y. — drilled by `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceLinearQuadraticSimultaneous.html`

*`/pages/curriculum/GCSE/algebra/equations/graphicalSolutions/` — Solving from a graph* (group menu) — Approximate solutions read off a graph at the crossing points. Drills: `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceSimultaneousReview.html`.

- `/pages/curriculum/GCSE/algebra/equations/graphicalSolutions/readingSolutionsFromAGraph.html` — Reading a solution off a graph: The solutions of f(x) = k, where the graph meets the line at height k.
- `/pages/curriculum/GCSE/algebra/equations/graphicalSolutions/whereTwoLinesCross.html` — Simultaneous equations as crossing lines: The crossing point as the one pair of values satisfying both equations. — drilled by `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceSimultaneousReview.html`
- `/pages/curriculum/GCSE/algebra/equations/graphicalSolutions/approximateQuadraticSolutions.html` — Approximate quadratic solutions from a graph: Reading roots where the parabola crosses the axis, and why they are estimates.

*`/pages/curriculum/GCSE/algebra/equations/inequalities/` — Inequalities* (group menu) — Solving inequalities: number lines at both tiers, set notation at Higher. Drills: `/pages/curriculum/GCSE/algebra/equations/inequalities/practiceInequalities.html`, `/pages/curriculum/GCSE/algebra/equations/inequalities/practiceReversingTheInequality.html`, `/pages/curriculum/GCSE/algebra/equations/inequalities/practiceIntegerSolutions.html`, `/pages/curriculum/GCSE/algebra/equations/inequalities/practiceInequalitiesReview.html`.

- `/pages/curriculum/GCSE/algebra/equations/inequalities/solvingLinearInequalities.html` — Solving a linear inequality: Solving with the balance method while keeping the inequality sign, since the answer is a range, not a value. — drilled by `/pages/curriculum/GCSE/algebra/equations/inequalities/practiceInequalities.html`
- `/pages/curriculum/GCSE/algebra/equations/inequalities/reversingTheInequality.html` — When the inequality sign reverses: Multiplying or dividing by a negative flips the sign, every time and not just sometimes. — drilled by `/pages/curriculum/GCSE/algebra/equations/inequalities/practiceReversingTheInequality.html`
- `/pages/curriculum/GCSE/algebra/equations/inequalities/inequalitiesOnANumberLine.html` — Inequalities on a number line: Drawing the solution with an open circle for a strict inequality and a filled one when equality is allowed.
- `/pages/curriculum/GCSE/algebra/equations/inequalities/integerSolutions.html` — Integer solutions of an inequality: Listing the whole numbers a solution range contains, checking whether each endpoint is in or out. — drilled by `/pages/curriculum/GCSE/algebra/equations/inequalities/practiceIntegerSolutions.html`
- `/pages/curriculum/GCSE/algebra/equations/inequalities/doubleInequalities.html` — Solving a double inequality: Applying every step to all three parts of an inequality like 3 < 2x + 1 ≤ 9. — drilled by `/pages/curriculum/GCSE/algebra/equations/inequalities/practiceInequalitiesReview.html`
- `/pages/curriculum/GCSE/algebra/equations/inequalities/setNotation.html` — Set notation for solution sets **(H)**: Writing a solution as {x : x > 2}, and combining two separate ranges with a union.
- `/pages/curriculum/GCSE/algebra/equations/inequalities/shadingRegions.html` — Regions from inequalities in two variables **(H)**: Shading the region satisfying several inequalities at once, with dashed boundary lines for the strict ones.
- `/pages/curriculum/GCSE/algebra/equations/inequalities/quadraticInequalities.html` — Solving a quadratic inequality **(H)**: Sketching the parabola to choose between the inside and the outside of the roots, rather than solving like an equation.

*`/pages/curriculum/GCSE/algebra/equations/formingEquations/` — Forming and solving equations* (group menu) — Turning a worded or geometric problem into an equation and solving it. Drills: `/pages/curriculum/GCSE/algebra/equations/formingEquations/practiceFormingEquations.html`, `/pages/curriculum/GCSE/algebra/equations/formingEquations/practiceEquationsFromShapes.html`, `/pages/curriculum/GCSE/algebra/equations/formingEquations/practiceFormingEquationsReview.html`.

- `/pages/curriculum/GCSE/algebra/equations/formingEquations/formingAnEquation.html` — Forming an equation from words: Naming the unknown, turning the facts into an equation, and checking the answer back in the story. — drilled by `/pages/curriculum/GCSE/algebra/equations/formingEquations/practiceFormingEquations.html`
- `/pages/curriculum/GCSE/algebra/equations/formingEquations/equationsFromShapes.html` — Equations from angles and perimeters: Using angle sums, perimeters and areas to set up an equation, then answering the geometric question asked. — drilled by `/pages/curriculum/GCSE/algebra/equations/formingEquations/practiceEquationsFromShapes.html`
- `/pages/curriculum/GCSE/algebra/equations/formingEquations/problemsLeadingToQuadratics.html` — Problems that lead to a quadratic: Area and consecutive-number problems that produce a quadratic, where one root usually fails the context. — drilled by `/pages/curriculum/GCSE/algebra/equations/formingEquations/practiceFormingEquationsReview.html`

*`/pages/curriculum/GCSE/algebra/equations/iteration/` — Iteration* (group menu) — Higher tier: trapping a root by a sign change, then closing in by iteration.

- `/pages/curriculum/GCSE/algebra/equations/iteration/signChangeMethod.html` — Showing a root lies in an interval **(H)**: Substituting both ends of the interval and citing the sign change between the two results.
- `/pages/curriculum/GCSE/algebra/equations/iteration/rearrangingIntoIterativeForm.html` — Rearranging into iterative form **(H)**: Showing an equation can be rewritten as x = g(x), the shape an iteration formula needs.
- `/pages/curriculum/GCSE/algebra/equations/iteration/usingAnIterationFormula.html` — Using an iteration formula **(H)**: Feeding each answer back into the formula from a starting value, and knowing when to stop.


**`/pages/curriculum/GCSE/algebra/sequences/` — Sequences** *(topic menu, 4 groups, 16 teaching pages, 3 Higher only)*

*`/pages/curriculum/GCSE/algebra/sequences/generatingSequences/` — Generating sequences* (group menu) — Building sequences from term-to-term, position-to-term or recurrence rules. Drills: `/pages/curriculum/GCSE/algebra/sequences/generatingSequences/practiceGeneratingSequences.html`, `/pages/curriculum/GCSE/algebra/sequences/generatingSequences/practicePositionToTermRules.html`, `/pages/curriculum/GCSE/algebra/sequences/generatingSequences/practiceGeneratingSequencesReview.html`.

- `/pages/curriculum/GCSE/algebra/sequences/generatingSequences/termToTermRules.html` — Term-to-term rules: Continuing a sequence by the rule that moves one term to the next, stated with a starting term. — drilled by `/pages/curriculum/GCSE/algebra/sequences/generatingSequences/practiceGeneratingSequences.html`
- `/pages/curriculum/GCSE/algebra/sequences/generatingSequences/positionToTermRules.html` — Position-to-term rules: Generating any term straight from its position, without stepping through every term before it. — drilled by `/pages/curriculum/GCSE/algebra/sequences/generatingSequences/practicePositionToTermRules.html`
- `/pages/curriculum/GCSE/algebra/sequences/generatingSequences/recurrenceRelations.html` — Recurrence relations: Reading rules written as xₙ₊₁ = 2xₙ + 1, and building terms that may depend on the two before. — drilled by `/pages/curriculum/GCSE/algebra/sequences/generatingSequences/practiceGeneratingSequencesReview.html`
- `/pages/curriculum/GCSE/algebra/sequences/generatingSequences/sequencesFromPatterns.html` — Sequences from growing patterns: Counting matchsticks or tiles in each stage of a pattern, and predicting the next stage from the growth.

*`/pages/curriculum/GCSE/algebra/sequences/specialSequences/` — Special sequences* (group menu) — The named sequences: square, cube, triangular, Fibonacci and geometric.

- `/pages/curriculum/GCSE/algebra/sequences/specialSequences/squareAndCubeSequences.html` — Square and cube number sequences: Recognising 1, 4, 9, 16 and 1, 8, 27, 64, and continuing them from position rather than difference.
- `/pages/curriculum/GCSE/algebra/sequences/specialSequences/triangularNumbers.html` — Triangular numbers: The sequence 1, 3, 6, 10 built by adding one more each time, and the dot triangles behind it.
- `/pages/curriculum/GCSE/algebra/sequences/specialSequences/fibonacciSequences.html` — Fibonacci-type sequences: Each term as the sum of the two before it, continued forwards and worked backwards from later terms.
- `/pages/curriculum/GCSE/algebra/sequences/specialSequences/geometricSequences.html` — Geometric sequences: Sequences that multiply by a fixed ratio each step, such as powers of 2 or of a half.
- `/pages/curriculum/GCSE/algebra/sequences/specialSequences/namingASequence.html` — Naming the type of a sequence: Deciding from a few terms whether a sequence is linear, quadratic, geometric or Fibonacci, by differences and ratios.
- `/pages/curriculum/GCSE/algebra/sequences/specialSequences/surdGeometricSequences.html` — Geometric sequences with a surd ratio **(H)**: Sequences whose ratio is a surd like √2, simplified term by term so the pattern stays visible.

*`/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/` — The nth term of a linear sequence* (group menu) — The nth term of a sequence with a constant difference, found and used. Drills: `/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/practiceNthTerm.html`, `/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/practiceUsingAnNthTerm.html`, `/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/practiceDecreasingSequences.html`, `/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/practiceNthTermReview.html`.

- `/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/findingTheNthTerm.html` — The nth term of a linear sequence: The common difference as the multiplier of n, adjusted by a constant — a formula, not the rule add 4. — drilled by `/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/practiceNthTerm.html`
- `/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/usingAnNthTerm.html` — Using an nth term: Finding a stated term, and testing whether a number belongs by solving for n and demanding a whole number. — drilled by `/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/practiceUsingAnNthTerm.html`
- `/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/decreasingSequences.html` — Decreasing linear sequences: Sequences with a negative common difference, whose nth term starts with a negative multiple of n. — drilled by `/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/practiceDecreasingSequences.html`

*`/pages/curriculum/GCSE/algebra/sequences/quadraticSequences/` — Quadratic sequences* (group menu) — Higher tier: sequences with a constant second difference and their nth term. Drills: `/pages/curriculum/GCSE/algebra/sequences/quadraticSequences/practiceSpottingQuadraticSequences.html`, `/pages/curriculum/GCSE/algebra/sequences/quadraticSequences/practiceQuadraticNthTerm.html`, `/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/practiceNthTermReview.html`.

- `/pages/curriculum/GCSE/algebra/sequences/quadraticSequences/spottingQuadraticSequences.html` — Spotting a quadratic sequence: Taking differences twice, since a constant second difference is the signature of an n² term. — drilled by `/pages/curriculum/GCSE/algebra/sequences/quadraticSequences/practiceSpottingQuadraticSequences.html`
- `/pages/curriculum/GCSE/algebra/sequences/quadraticSequences/quadraticNthTerm.html` — The nth term of a quadratic sequence **(H)**: Halving the second difference for the n² coefficient, then fixing what is left with a linear nth term. — drilled by `/pages/curriculum/GCSE/algebra/sequences/quadraticSequences/practiceQuadraticNthTerm.html`
- `/pages/curriculum/GCSE/algebra/sequences/quadraticSequences/usingAQuadraticNthTerm.html` — Using a quadratic nth term **(H)**: Generating terms from a formula with an n² in it, and checking a claimed term by substitution. — drilled by `/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/practiceNthTermReview.html`

### Ratio, proportion and rates of change

Five topic menus, 18 group menus, and 75 teaching pages. Lesson drills are narrow; mixed reviews appear only after their final prerequisite.

**`/pages/curriculum/GCSE/ratio/ratio/` — Ratio** *(topic menu, 5 groups, 22 teaching pages, 3 Higher only)*

*`/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/` — Ratio notation and simplifying* (group menu) — What a ratio records, simplest form and 1 : n, and the fractions inside it. Drills: `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceRatioNotation.html`, `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceSimplifyingRatios.html`, `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceRatiosWithUnits.html`, `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceOneToNRatios.html`, `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practicePartToPartAndPartToWhole.html`, `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceFractionsOfTheWhole.html`, `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceSimplifyingRatiosReview.html`.

- `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/ratioNotation.html` — Ratio notation: Recording comparisons with the colon, why order matters, and three-part ratios. — drilled by `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceRatioNotation.html`
- `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/simplifyingRatios.html` — Simplifying a ratio: Dividing every part by the same factor, so 12 : 18 becomes 2 : 3. — drilled by `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceSimplifyingRatios.html`
- `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/ratiosWithUnits.html` — Ratios with mixed units: Converting to the same unit before simplifying, and why the ratio is unitless. — drilled by `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceRatiosWithUnits.html`
- `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/oneToNRatios.html` — Writing a ratio in the form 1 : n: Dividing both parts by one of them so scales and mixtures compare directly. — drilled by `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceOneToNRatios.html`
- `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/partToPartAndPartToWhole.html` — Part:part and part:whole ratios: Telling the two kinds of ratio apart, and converting each into the other. — drilled by `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practicePartToPartAndPartToWhole.html`
- `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/fractionsOfTheWhole.html` — From a ratio to fractions of the whole: Reading the fraction of the whole each part represents, and working back. — drilled by `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceFractionsOfTheWhole.html`

*`/pages/curriculum/GCSE/ratio/ratio/sharing/` — Dividing in a ratio* (group menu) — Dividing a quantity into shares, working back from one part, and mixtures. Drills: `/pages/curriculum/GCSE/ratio/ratio/sharing/practiceSharing.html`, `/pages/curriculum/GCSE/ratio/ratio/sharing/practiceWhenOnePartIsKnown.html`, `/pages/curriculum/GCSE/ratio/ratio/sharing/practiceWhenTheDifferenceIsKnown.html`, `/pages/curriculum/GCSE/ratio/ratio/sharing/practiceExpressingADivisionAsARatio.html`, `/pages/curriculum/GCSE/ratio/ratio/sharing/practiceMixingAndConcentrations.html`, `/pages/curriculum/GCSE/ratio/ratio/sharing/practiceSharingReview.html`.

- `/pages/curriculum/GCSE/ratio/ratio/sharing/dividingInARatio.html` — Dividing a quantity in a ratio: Sharing an amount in a given ratio by finding the value of one part first. — drilled by `/pages/curriculum/GCSE/ratio/ratio/sharing/practiceSharing.html`
- `/pages/curriculum/GCSE/ratio/ratio/sharing/whenOnePartIsKnown.html` — Finding the whole from one share: Recovering the total and the other shares when only one part's value is given. — drilled by `/pages/curriculum/GCSE/ratio/ratio/sharing/practiceWhenOnePartIsKnown.html`
- `/pages/curriculum/GCSE/ratio/ratio/sharing/whenTheDifferenceIsKnown.html` — Sharing when the difference is given: Finding one part from the difference between shares, then rebuilding the total. — drilled by `/pages/curriculum/GCSE/ratio/ratio/sharing/practiceWhenTheDifferenceIsKnown.html`
- `/pages/curriculum/GCSE/ratio/ratio/sharing/expressingADivisionAsARatio.html` — Writing a division as a ratio: Turning stated amounts back into a ratio in simplest form, in the order named. — drilled by `/pages/curriculum/GCSE/ratio/ratio/sharing/practiceExpressingADivisionAsARatio.html`
- `/pages/curriculum/GCSE/ratio/ratio/sharing/mixingAndConcentrations.html` — Mixing and concentration problems: Ratios in paint mixes and concentrations, and comparing mixture strengths. — drilled by `/pages/curriculum/GCSE/ratio/ratio/sharing/practiceMixingAndConcentrations.html`
- `/pages/curriculum/GCSE/ratio/ratio/sharing/changingTheRatio.html` — When the ratio changes: Ratio-change problems solved by pinning down the part that stays fixed.

*`/pages/curriculum/GCSE/ratio/ratio/combiningRatios/` — Combining and connecting ratios* (group menu) — Merging two ratios through a shared part, and the multiplier in every ratio. Drills: `/pages/curriculum/GCSE/ratio/ratio/sharing/practiceSharingReview.html`.

- `/pages/curriculum/GCSE/ratio/ratio/combiningRatios/ratioAsAMultiplier.html` — A ratio as a multiplier: The multiplicative link between two quantities as a fraction or multiplier. — drilled by `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceSimplifyingRatiosReview.html`
- `/pages/curriculum/GCSE/ratio/ratio/combiningRatios/combiningTwoRatios.html` — Combining two ratios: Merging a : b and b : c into a three-part ratio by matching the shared part. — drilled by `/pages/curriculum/GCSE/ratio/ratio/sharing/practiceSharingReview.html`
- `/pages/curriculum/GCSE/ratio/ratio/combiningRatios/ratiosAndLinearFunctions.html` — Ratios and linear functions: Why quantities in a fixed ratio obey y = kx, and the ratio in the gradient.

*`/pages/curriculum/GCSE/ratio/ratio/mapsAndScaleDrawings/` — Scale factors, maps and scale drawings* (group menu) — The multiplier linking a drawing or map to the real object, used both ways. Drills: `/pages/curriculum/GCSE/ratio/ratio/mapsAndScaleDrawings/practiceScaleDrawings.html`, `/pages/curriculum/GCSE/ratio/ratio/mapsAndScaleDrawings/practiceScaleDrawingsLesson.html`, `/pages/curriculum/GCSE/ratio/ratio/mapsAndScaleDrawings/practiceScaleDrawingsReview.html`.

- `/pages/curriculum/GCSE/ratio/ratio/mapsAndScaleDrawings/scaleFactors.html` — Scale factors: The multiplier from object lengths to image lengths, and back by dividing. — drilled by `/pages/curriculum/GCSE/ratio/ratio/mapsAndScaleDrawings/practiceScaleDrawings.html`
- `/pages/curriculum/GCSE/ratio/ratio/mapsAndScaleDrawings/scaleDrawings.html` — Scale drawings: Using a stated scale such as 1 cm to 2 m to link drawing and real object. — drilled by `/pages/curriculum/GCSE/ratio/ratio/mapsAndScaleDrawings/practiceScaleDrawingsLesson.html`
- `/pages/curriculum/GCSE/ratio/ratio/mapsAndScaleDrawings/mapScales.html` — Map scales: Ratio scales such as 1 : 25 000, converting between map and ground distance. — drilled by `/pages/curriculum/GCSE/ratio/ratio/mapsAndScaleDrawings/practiceScaleDrawingsReview.html`

*`/pages/curriculum/GCSE/ratio/ratio/similarShapes/` — Similar shapes and scale factors* (group menu) — Length, area and volume factors of similar shapes, and choosing between them. Drills: `/pages/curriculum/GCSE/ratio/ratio/similarShapes/practiceSimilarShapes.html`, `/pages/curriculum/GCSE/ratio/ratio/similarShapes/practiceAreasOfSimilarShapes.html`, `/pages/curriculum/GCSE/ratio/ratio/similarShapes/practiceVolumesOfSimilarShapes.html`, `/pages/curriculum/GCSE/ratio/ratio/similarShapes/practiceSimilarShapesReview.html`.

- `/pages/curriculum/GCSE/ratio/ratio/similarShapes/lengthsInSimilarShapes.html` — Lengths in similar shapes: Finding missing lengths with the length factor from any corresponding pair. — drilled by `/pages/curriculum/GCSE/ratio/ratio/similarShapes/practiceSimilarShapes.html`
- `/pages/curriculum/GCSE/ratio/ratio/similarShapes/areasOfSimilarShapes.html` — Areas of similar shapes **(H)**: Why the area scale factor is the square of the length factor, shown by tiling. — drilled by `/pages/curriculum/GCSE/ratio/ratio/similarShapes/practiceAreasOfSimilarShapes.html`
- `/pages/curriculum/GCSE/ratio/ratio/similarShapes/volumesOfSimilarShapes.html` — Volumes of similar shapes **(H)**: Why the volume scale factor is the cube of the length factor, used both ways. — drilled by `/pages/curriculum/GCSE/ratio/ratio/similarShapes/practiceVolumesOfSimilarShapes.html`
- `/pages/curriculum/GCSE/ratio/ratio/similarShapes/choosingTheScaleFactor.html` — Choosing the right scale factor **(H)**: Moving between length, area and volume factors by roots and powers. — drilled by `/pages/curriculum/GCSE/ratio/ratio/similarShapes/practiceSimilarShapesReview.html`


**`/pages/curriculum/GCSE/ratio/proportion/` — Proportion** *(topic menu, 3 groups, 14 teaching pages, 3 Higher only)*

*`/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/` — Direct proportion* (group menu) — Quantities that scale together, the unitary method, and value for money. Drills: `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceProportionAsEqualRatios.html`, `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceProportion.html`, `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceUnitaryMethod.html`, `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceScalingARecipe.html`, `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceProportionReview.html`, `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceBestBuys.html`.

- `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/proportionAsEqualRatios.html` — Proportion as equality of ratios: Two pairs of quantities are in proportion when their ratios are equal. — drilled by `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceProportionAsEqualRatios.html`
- `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/directProportion.html` — Direct proportion: Direct proportion: multiply one quantity and the other multiplies the same way. — drilled by `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceProportion.html`
- `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/unitaryMethod.html` — The unitary method: Finding the value of one unit first, then scaling up to any number of units. — drilled by `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceUnitaryMethod.html`
- `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/scalingARecipe.html` — Scaling a recipe: Scaling every ingredient by the same factor, and serving-size questions. — drilled by `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceScalingARecipe.html`
- `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/bestBuyComparisons.html` — Best-buy comparisons: Comparing value by the price of one unit or the amount one penny buys. — drilled by `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceBestBuys.html`

*`/pages/curriculum/GCSE/ratio/proportion/usingInverseProportion/` — Inverse proportion* (group menu) — Quantities where one grows as the other shrinks, solved by the fixed product. Drills: `/pages/curriculum/GCSE/ratio/proportion/usingInverseProportion/practiceInverseProportion.html`, `/pages/curriculum/GCSE/ratio/proportion/usingInverseProportion/practiceInverseProportionProblems.html`, `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceProportionReview.html`.

- `/pages/curriculum/GCSE/ratio/proportion/usingInverseProportion/inverseProportion.html` — Inverse proportion: Inverse proportion: multiply one, and the other divides by the same factor. — drilled by `/pages/curriculum/GCSE/ratio/proportion/usingInverseProportion/practiceInverseProportion.html`
- `/pages/curriculum/GCSE/ratio/proportion/usingInverseProportion/inverseProportionProblems.html` — Inverse proportion problems: Workers and time, speed and journey time, solved by finding the fixed product. — drilled by `/pages/curriculum/GCSE/ratio/proportion/usingInverseProportion/practiceInverseProportionProblems.html`
- `/pages/curriculum/GCSE/ratio/proportion/usingInverseProportion/recognisingProportionality.html` — Recognising the type of proportion: Deciding from a table whether a relationship is direct, inverse or neither. — drilled by `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceProportionReview.html`

*`/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/` — Graphs and equations of proportion* (group menu) — Lines through the origin, reciprocal curves, and the Higher-only equations. Drills: `/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/practiceProportionEquations.html`, `/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/practiceInverseProportionEquations.html`, `/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/practiceProportionEquationsReview.html`.

- `/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/directProportionGraphs.html` — The graph of direct proportion: A line through the origin, and why one that misses it is not direct proportion.
- `/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/inverseProportionGraphs.html` — The graph of inverse proportion: The reciprocal curve, approaching each axis without ever reaching it.
- `/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/conversionGraphs.html` — Conversion graphs: Reading a conversion graph in both directions, and extending it with the rate.
- `/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/directProportionEquations.html` — Constructing y = kx **(H)**: Finding k from one pair of values, then using the equation in both directions. — drilled by `/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/practiceProportionEquations.html`
- `/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/inverseProportionEquations.html` — Constructing y = k/x **(H)**: Writing inverse proportion as y = k/x, since it means proportional to 1/x. — drilled by `/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/practiceInverseProportionEquations.html`
- `/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/proportionToPowers.html` — Proportion to squares, cubes and roots **(H)**: Relationships like y = kx² and y = k/x², and finding k when the power is stated. — drilled by `/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/practiceProportionEquationsReview.html`


**`/pages/curriculum/GCSE/ratio/percentage/` — Percentage change** *(topic menu, 4 groups, 14 teaching pages)*

*`/pages/curriculum/GCSE/ratio/percentage/multipliers/` — The multiplier* (group menu) — A percentage change packed into one multiplier, written, applied and read back. Drills: `/pages/curriculum/GCSE/ratio/percentage/multipliers/practicePercentageChange.html`, `/pages/curriculum/GCSE/ratio/percentage/multipliers/practiceMultipliersForDecrease.html`, `/pages/curriculum/GCSE/ratio/percentage/multipliers/practiceReadingAMultiplier.html`, `/pages/curriculum/GCSE/ratio/percentage/multipliers/practicePercentageChangeReview.html`.

- `/pages/curriculum/GCSE/ratio/percentage/multipliers/increaseAndDecreaseByParts.html` — Increase and decrease without a calculator: Building the change from 50%, 10% and 1%, then adding it on or taking it off.
- `/pages/curriculum/GCSE/ratio/percentage/multipliers/multipliersForIncrease.html` — The multiplier for an increase: Adding the percentage to 100% as a decimal, so a 12% rise becomes ×1.12. — drilled by `/pages/curriculum/GCSE/ratio/percentage/multipliers/practicePercentageChange.html`
- `/pages/curriculum/GCSE/ratio/percentage/multipliers/multipliersForDecrease.html` — The multiplier for a decrease: Subtracting the percentage from 100%, so a 15% fall becomes ×0.85, not ×0.15. — drilled by `/pages/curriculum/GCSE/ratio/percentage/multipliers/practiceMultipliersForDecrease.html`
- `/pages/curriculum/GCSE/ratio/percentage/multipliers/readingAMultiplier.html` — Reading a multiplier: Recovering the change a multiplier applies, where ×0.88 hides a 12% fall. — drilled by `/pages/curriculum/GCSE/ratio/percentage/multipliers/practiceReadingAMultiplier.html`

*`/pages/curriculum/GCSE/ratio/percentage/comparingChange/` — Measuring and comparing change* (group menu) — Turning two amounts into a percentage change to compare rises and falls fairly. Drills: `/pages/curriculum/GCSE/ratio/percentage/comparingChange/practiceProfitLoss.html`, `/pages/curriculum/GCSE/ratio/percentage/comparingChange/practiceProfitAndLoss.html`, `/pages/curriculum/GCSE/ratio/percentage/comparingChange/practiceProfitLossReview.html`.

- `/pages/curriculum/GCSE/ratio/percentage/comparingChange/measuringAChange.html` — Measuring a change as a percentage: Dividing the change by the original amount, never the new one, as a percentage. — drilled by `/pages/curriculum/GCSE/ratio/percentage/comparingChange/practiceProfitLoss.html`
- `/pages/curriculum/GCSE/ratio/percentage/comparingChange/profitAndLoss.html` — Percentage profit and loss: Profit or loss as a percentage of the cost price the seller originally paid. — drilled by `/pages/curriculum/GCSE/ratio/percentage/comparingChange/practiceProfitAndLoss.html`
- `/pages/curriculum/GCSE/ratio/percentage/comparingChange/comparingChanges.html` — Comparing changes by percentage: Deciding which rise or fall is proportionally larger, whatever the amounts say. — drilled by `/pages/curriculum/GCSE/ratio/percentage/comparingChange/practiceProfitLossReview.html`

*`/pages/curriculum/GCSE/ratio/percentage/reverseProblems/` — Reverse percentage problems* (group menu) — Recovering the amount a change started from by dividing by the multiplier. Drills: `/pages/curriculum/GCSE/ratio/percentage/reverseProblems/practiceOriginalAfterAnIncrease.html`, `/pages/curriculum/GCSE/ratio/percentage/reverseProblems/practiceOriginalAfterADecrease.html`, `/pages/curriculum/GCSE/ratio/percentage/reverseProblems/practiceSpottingReverseProblems.html`, `/pages/curriculum/GCSE/ratio/percentage/multipliers/practicePercentageChangeReview.html`.

- `/pages/curriculum/GCSE/ratio/percentage/reverseProblems/originalAfterAnIncrease.html` — The original after an increase: Recovering the pre-increase amount by dividing by the multiplier, as with VAT. — drilled by `/pages/curriculum/GCSE/ratio/percentage/reverseProblems/practiceOriginalAfterAnIncrease.html`
- `/pages/curriculum/GCSE/ratio/percentage/reverseProblems/originalAfterADecrease.html` — The original after a decrease: Recovering the full price from a sale price by dividing by the multiplier. — drilled by `/pages/curriculum/GCSE/ratio/percentage/reverseProblems/practiceOriginalAfterADecrease.html`
- `/pages/curriculum/GCSE/ratio/percentage/reverseProblems/spottingReverseProblems.html` — Spotting a reverse problem: Deciding whether a question states the original amount or the changed one. — drilled by `/pages/curriculum/GCSE/ratio/percentage/reverseProblems/practiceSpottingReverseProblems.html`

*`/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/` — Interest and repeated change* (group menu) — Simple interest, repeated change, and why successive changes multiply. Drills: `/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/practiceSimpleInterest.html`, `/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/practiceRepeatedChange.html`, `/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/practiceSimpleVersusCompoundInterest.html`, `/pages/curriculum/GCSE/ratio/percentage/multipliers/practicePercentageChangeReview.html`.

- `/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/simpleInterest.html` — Simple interest: Interest paid on the starting amount only, so the same sum is added every year. — drilled by `/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/practiceSimpleInterest.html`
- `/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/repeatedChange.html` — Repeated percentage change: Applying the same change repeatedly by raising the multiplier to a power. — drilled by `/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/practiceRepeatedChange.html`
- `/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/successiveChanges.html` — Successive different changes: Combining two changes into one multiplier; a 20% rise then 20% fall loses money. — drilled by `/pages/curriculum/GCSE/ratio/percentage/multipliers/practicePercentageChangeReview.html`
- `/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/simpleVersusCompoundInterest.html` — Simple versus compound interest: Why the same rate pays differently under the two schemes, and the widening gap. — drilled by `/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/practiceSimpleVersusCompoundInterest.html`


**`/pages/curriculum/GCSE/ratio/compound/` — Compound measures** *(topic menu, 3 groups, 14 teaching pages, 3 Higher only)*

*`/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/` — Speed, density and pressure* (group menu) — The three compound measures, each a division rearranged to find any quantity. Drills: `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/practiceCompoundMeasures.html`, `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/practiceAverageSpeed.html`, `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/practiceDensityMassVolume.html`, `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/practiceDensityOfAMixture.html`, `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/practiceCompoundMeasuresReview.html`.

- `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/speedDistanceTime.html` — Speed, distance and time: Using speed as distance per unit time to find any quantity from the other two. — drilled by `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/practiceCompoundMeasures.html`
- `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/averageSpeed.html` — Average speed: Total distance divided by total time, not an average of the two speeds. — drilled by `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/practiceAverageSpeed.html`
- `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/densityMassVolume.html` — Density, mass and volume: Using density as mass per unit volume, with the units naming the formula. — drilled by `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/practiceDensityMassVolume.html`
- `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/densityOfAMixture.html` — The density of a mixture: Totalling mass and volume separately, never averaging the two densities. — drilled by `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/practiceDensityOfAMixture.html`
- `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/pressureForceArea.html` — Pressure, force and area: Using pressure as force per unit area, and why a smaller area raises pressure. — drilled by `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/practiceCompoundMeasuresReview.html`

*`/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/` — Rates per unit* (group menu) — Pay, prices and flows as an amount per unit, used both ways and converted. Drills: `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/practiceRatesOfPay.html`, `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/practiceRates.html`, `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/practiceRatesOfFlow.html`, `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/practiceRatesReview.html`.

- `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/ratesOfPay.html` — Rates of pay: Hourly pay as money per unit time, including part hours and overtime rates. — drilled by `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/practiceRatesOfPay.html`
- `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/unitPricing.html` — Unit pricing: The price of one unit as a rate, multiplied or divided to cost any amount. — drilled by `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/practiceRates.html`
- `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/ratesOfFlow.html` — Rates of flow: Filling and emptying at a stated volume per unit time, and how long it takes. — drilled by `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/practiceRatesOfFlow.html`
- `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/convertingRates.html` — Converting a rate between units: Changing a rate such as m/s into km/h, converting top and bottom separately. — drilled by `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/practiceRatesReview.html`
- `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/convertingUnitsWithAlgebra.html` — Unit conversion with algebra **(H)**: Converting a quantity given as a letter, so x m/s becomes 3.6x km/h.

*`/pages/curriculum/GCSE/ratio/compound/ratesOnGraphs/` — Rates of change on graphs* (group menu) — Reading rates as gradients: lines at both tiers, chords and tangents at Higher. Drills: `/pages/curriculum/GCSE/ratio/compound/ratesOnGraphs/practiceSpeedFromADistanceTimeGraph.html`, `/pages/curriculum/GCSE/ratio/compound/ratesOnGraphs/practiceRateOfChange.html`.

- `/pages/curriculum/GCSE/ratio/compound/ratesOnGraphs/speedFromADistanceTimeGraph.html` — Speed from a distance–time graph: Speed as the gradient of each straight section; horizontal means stopped. — drilled by `/pages/curriculum/GCSE/ratio/compound/ratesOnGraphs/practiceSpeedFromADistanceTimeGraph.html`
- `/pages/curriculum/GCSE/ratio/compound/ratesOnGraphs/gradientAsARate.html` — The gradient as a rate of change: Reading a straight-line gradient as a rate: vertical units per horizontal unit. — drilled by `/pages/curriculum/GCSE/ratio/compound/ratesOnGraphs/practiceRateOfChange.html`
- `/pages/curriculum/GCSE/ratio/compound/ratesOnGraphs/averageRateFromAChord.html` — Average rate of change from a chord **(H)**: The gradient of a chord joining two points on a curve as the average rate.
- `/pages/curriculum/GCSE/ratio/compound/ratesOnGraphs/instantaneousRateFromATangent.html` — Instantaneous rate of change from a tangent **(H)**: A tangent's gradient as the rate at that instant, an estimate by eye.


**`/pages/curriculum/GCSE/ratio/growth/` — Growth and decay** *(topic menu, 3 groups, 11 teaching pages, 2 Higher only)*

*`/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/` — Compound interest and depreciation* (group menu) — Money changing by the same percentage each period, and how long that takes. Drills: `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceGrowthDecay.html`, `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceCompoundInterestFormula.html`, `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceDepreciation.html`, `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceFindingHowLong.html`, `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceGrowthDecayReview.html`.

- `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/compoundInterest.html` — Compound interest: Interest paid on the balance, so each year's interest earns interest itself. — drilled by `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceGrowthDecay.html`
- `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/compoundInterestFormula.html` — The compound interest formula: Raising the multiplier to the number of years to reach the balance in one step. — drilled by `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceCompoundInterestFormula.html`
- `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/depreciation.html` — Depreciation: A value falling by a fixed percentage each year, via a multiplier below 1. — drilled by `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceDepreciation.html`
- `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/findingHowLong.html` — Finding how long growth takes: Multiplying period by period until a target is passed, counting whole periods. — drilled by `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceFindingHowLong.html`

*`/pages/curriculum/GCSE/ratio/growth/exponentialChange/` — Exponential growth and decay* (group menu) — Repeated multiplication beyond money: exponential growth and decay. Drills: `/pages/curriculum/GCSE/ratio/growth/exponentialChange/practiceExponentialGrowth.html`, `/pages/curriculum/GCSE/ratio/growth/exponentialChange/practiceExponentialDecay.html`, `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceGrowthDecayReview.html`.

- `/pages/curriculum/GCSE/ratio/growth/exponentialChange/exponentialGrowth.html` — Exponential growth: Quantities multiplied by the same factor each period, slowly then very fast. — drilled by `/pages/curriculum/GCSE/ratio/growth/exponentialChange/practiceExponentialGrowth.html`
- `/pages/curriculum/GCSE/ratio/growth/exponentialChange/exponentialDecay.html` — Exponential decay: Repeated multiplication by a factor below 1, never quite reaching zero. — drilled by `/pages/curriculum/GCSE/ratio/growth/exponentialChange/practiceExponentialDecay.html`
- `/pages/curriculum/GCSE/ratio/growth/exponentialChange/linearVersusExponential.html` — Linear versus exponential growth: Adding the same amount against multiplying by the same factor, and which wins. — drilled by `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceGrowthDecayReview.html`

*`/pages/curriculum/GCSE/ratio/growth/modelsAndIteration/` — Models and iteration* (group menu) — Repeated change as a formula or rule. The iterative pages are Higher only. Drills: `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceGrowthDecayReview.html`.

- `/pages/curriculum/GCSE/ratio/growth/modelsAndIteration/settingUpAModel.html` — Setting up an exponential model: Writing repeated change as a starting value times a multiplier to the power n.
- `/pages/curriculum/GCSE/ratio/growth/modelsAndIteration/interpretingAModel.html` — Interpreting an exponential model: Reading a model's starting value and rate, and where it stops being realistic.
- `/pages/curriculum/GCSE/ratio/growth/modelsAndIteration/iterativeProcesses.html` — General iterative processes **(H)**: Applying a stated rule repeatedly, each term built from the one before.
- `/pages/curriculum/GCSE/ratio/growth/modelsAndIteration/growthWithRegularPayments.html` — Growth with regular payments **(H)**: A fixed amount added each period before interest, so no single formula works.

### Geometry and measures

Three topic menus, 20 group menus, and 127 teaching pages. Lesson drills are narrow; mixed reviews appear only after their final prerequisite.

**`/pages/curriculum/GCSE/geometry/properties/` — Properties and constructions** *(topic menu, 10 groups, 66 teaching pages, 12 Higher only)*

*`/pages/curriculum/GCSE/geometry/properties/angleBasics/` — Lines, angles and labelling* (group menu) — The words, marks and conventions a diagram is written in, and the angle facts that hold at points and on lines. Drills: `/pages/curriculum/GCSE/geometry/properties/angleBasics/practiceAnglesAtAPoint.html`, `/pages/curriculum/GCSE/geometry/properties/angleBasics/practiceAnglesOnAStraightLine.html`, `/pages/curriculum/GCSE/geometry/properties/angleBasics/practiceVerticallyOppositeAngles.html`, `/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceAngleRulesReview.html`.

- `/pages/curriculum/GCSE/geometry/properties/angleBasics/geometricTerms.html` — Points, lines and planes: The vocabulary of geometry: points, line segments, vertices, edges, planes, polygons and what makes a polygon regular.
- `/pages/curriculum/GCSE/geometry/properties/angleBasics/labellingConventions.html` — Labelling and drawing conventions: Naming a side AB and an angle ABC, and the hatch, arrow and right-angle marks a diagram uses.
- `/pages/curriculum/GCSE/geometry/properties/angleBasics/parallelAndPerpendicularLines.html` — Parallel and perpendicular lines: Lines that never meet and lines that cross at 90°, and the marks that claim each on a diagram.
- `/pages/curriculum/GCSE/geometry/properties/angleBasics/typesOfAngle.html` — Naming angles by size: Acute, right, obtuse and reflex angles named by size, and estimating before measuring so gross errors get caught.
- `/pages/curriculum/GCSE/geometry/properties/angleBasics/anglesAtAPoint.html` — Angles at a point: Angles meeting at a point sum to 360°, with reflex angles and several unknowns around one point. — drilled by `/pages/curriculum/GCSE/geometry/properties/angleBasics/practiceAnglesAtAPoint.html`
- `/pages/curriculum/GCSE/geometry/properties/angleBasics/anglesOnAStraightLine.html` — Angles on a straight line: Angles on one side of a straight line sum to 180°, and only when the line really is straight. — drilled by `/pages/curriculum/GCSE/geometry/properties/angleBasics/practiceAnglesOnAStraightLine.html`
- `/pages/curriculum/GCSE/geometry/properties/angleBasics/verticallyOppositeAngles.html` — Vertically opposite angles: Two crossing lines make two pairs of equal angles, and quoting the reason by its proper name. — drilled by `/pages/curriculum/GCSE/geometry/properties/angleBasics/practiceVerticallyOppositeAngles.html`

*`/pages/curriculum/GCSE/geometry/properties/parallelLines/` — Angles on parallel lines* (group menu) — The three angle pairs a transversal makes with parallel lines, and multi-step problems that chain them together with reasons. Drills: `/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceAngleRules.html`, `/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceCorrespondingAngles.html`, `/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceCoInteriorAngles.html`, `/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceMultiStepAngleProblems.html`, `/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceAngleRulesReview.html`.

- `/pages/curriculum/GCSE/geometry/properties/parallelLines/alternateAngles.html` — Alternate angles: Equal angles in a Z shape between parallel lines, spotted from the diagram and quoted by name. — drilled by `/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceAngleRules.html`
- `/pages/curriculum/GCSE/geometry/properties/parallelLines/correspondingAngles.html` — Corresponding angles: Equal angles in an F shape on parallel lines, and telling them apart from alternate pairs. — drilled by `/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceCorrespondingAngles.html`
- `/pages/curriculum/GCSE/geometry/properties/parallelLines/coInteriorAngles.html` — Co-interior angles: Angles in a C shape between parallel lines sum to 180°, and why they are not equal. — drilled by `/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceCoInteriorAngles.html`
- `/pages/curriculum/GCSE/geometry/properties/parallelLines/multiStepAngleProblems.html` — Multi-step angle problems: Chaining several angle facts to reach the angle asked for, stating the reason for every step. — drilled by `/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceMultiStepAngleProblems.html`

*`/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/` — Angles in triangles and polygons* (group menu) — The angle sum a triangle forces on every polygon, and the extra structure isosceles triangles and regular polygons carry. Drills: `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/practiceAngleSumOfATriangle.html`, `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/practiceIsoscelesTriangleAngles.html`, `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/practiceExteriorAngleOfATriangle.html`, `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/practiceInteriorAnglesOfPolygons.html`, `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/practiceExteriorAnglesOfPolygons.html`, `/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceAngleRulesReview.html`.

- `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/typesOfTriangle.html` — Types of triangle: Equilateral, isosceles, scalene and right-angled triangles, and the side and angle marks that identify each.
- `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/angleSumOfATriangle.html` — The angle sum of a triangle: Why the three angles sum to 180°, proved by drawing a parallel line through one vertex. — drilled by `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/practiceAngleSumOfATriangle.html`
- `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/isoscelesTriangleAngles.html` — Base angles of an isosceles triangle: The angles facing the equal sides are equal, and the two different answers when the given angle might be either. — drilled by `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/practiceIsoscelesTriangleAngles.html`
- `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/exteriorAngleOfATriangle.html` — The exterior angle of a triangle: An exterior angle equals the sum of the two interior angles opposite it, in one step instead of two. — drilled by `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/practiceExteriorAngleOfATriangle.html`
- `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/interiorAnglesOfPolygons.html` — Interior angles of a polygon: Splitting an n-sided polygon into n − 2 triangles to find its angle sum, the quadrilateral’s 360° included. — drilled by `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/practiceInteriorAnglesOfPolygons.html`
- `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/exteriorAnglesOfPolygons.html` — Exterior angles of a polygon: Why the exterior angles of any polygon sum to 360°, and finding a number of sides from one of them. — drilled by `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/practiceExteriorAnglesOfPolygons.html`
- `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/anglesInRegularPolygons.html` — Angles in regular polygons: Each interior and exterior angle of a regular polygon, and which of the two to work out first. — drilled by `/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceAngleRulesReview.html`

*`/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/` — Quadrilaterals and symmetry* (group menu) — What defines each special quadrilateral, the diagonal properties that tell them apart, and the two symmetries a flat shape can carry. Drills: `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/practiceQuadrilaterals.html`, `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/practiceQuadrilateralDiagonals.html`, `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/practiceClassifyingQuadrilaterals.html`, `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/practiceLineSymmetry.html`, `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/practiceQuadrilateralsReview.html`.

- `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/quadrilateralDefinitions.html` — The special quadrilaterals: The defining properties of the square, rectangle, parallelogram, rhombus, trapezium and kite, set side by side. — drilled by `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/practiceQuadrilaterals.html`
- `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/quadrilateralDiagonals.html` — Diagonals of the special quadrilaterals: Which quadrilaterals have diagonals that are equal, perpendicular or bisect each other, and naming a shape from its diagonals. — drilled by `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/practiceQuadrilateralDiagonals.html`
- `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/classifyingQuadrilaterals.html` — Classifying quadrilaterals: Why a square is a rectangle but a rectangle need not be a square, and the most specific name the facts force. — drilled by `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/practiceClassifyingQuadrilaterals.html`
- `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/lineSymmetry.html` — Line symmetry: Counting the mirror lines of polygons, and completing a shape so a given line becomes a mirror. — drilled by `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/practiceLineSymmetry.html`
- `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/rotationalSymmetry.html` — Rotational symmetry: The order of rotational symmetry as how many positions a tracing fits, and why order 1 means none. — drilled by `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/practiceQuadrilateralsReview.html`

*`/pages/curriculum/GCSE/geometry/properties/congruence/` — Congruent triangles* (group menu) — The four criteria that force two triangles to be identical, and the proofs congruent triangles unlock. Drills: `/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruentShapes.html`, `/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruenceBySss.html`, `/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruenceBySas.html`, `/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruenceByAsa.html`, `/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruenceByRhs.html`, `/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruence.html`.

- `/pages/curriculum/GCSE/geometry/properties/congruence/congruentShapes.html` — Congruent shapes: Two shapes are congruent when one fits exactly on the other, mirror images allowed, corresponding parts matched up. — drilled by `/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruentShapes.html`
- `/pages/curriculum/GCSE/geometry/properties/congruence/congruenceBySss.html` — Congruence by SSS: Three matched sides fix a triangle completely, so no angle needs checking at all. — drilled by `/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruenceBySss.html`
- `/pages/curriculum/GCSE/geometry/properties/congruence/congruenceBySas.html` — Congruence by SAS: Two sides and the angle between them, and why the angle must be the included one. — drilled by `/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruenceBySas.html`
- `/pages/curriculum/GCSE/geometry/properties/congruence/congruenceByAsa.html` — Congruence by ASA: Two angles and a matched side, and why AAS also works once the third angle is deduced. — drilled by `/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruenceByAsa.html`
- `/pages/curriculum/GCSE/geometry/properties/congruence/congruenceByRhs.html` — Congruence by RHS: A right angle, the hypotenuse and one other side, the one case where a non-included angle is enough. — drilled by `/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruenceByRhs.html`
- `/pages/curriculum/GCSE/geometry/properties/congruence/provingTrianglesCongruent.html` — Proving two triangles congruent: Pairing up the given facts, choosing the criterion they satisfy, and why AAA and ASS prove nothing. — drilled by `/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruence.html`
- `/pages/curriculum/GCSE/geometry/properties/congruence/proofsWithCongruentTriangles.html` — Proofs using congruent triangles: Proving results such as the isosceles base angles by finding a pair of congruent triangles inside the figure.

*`/pages/curriculum/GCSE/geometry/properties/similarity/` — Similar shapes* (group menu) — When two shapes count as similar, the reasoning that proves it, and how one scale factor controls lengths, areas and volumes. Drills: `/pages/curriculum/GCSE/geometry/properties/similarity/practiceSimilarShapes.html`, `/pages/curriculum/GCSE/geometry/properties/similarity/practiceProvingTrianglesSimilar.html`, `/pages/curriculum/GCSE/geometry/properties/similarity/practiceSimilarity.html`.

- `/pages/curriculum/GCSE/geometry/properties/similarity/similarShapes.html` — Similar shapes: Two shapes are similar when angles match and sides share one scale factor, so one enlarges onto the other. — drilled by `/pages/curriculum/GCSE/geometry/properties/similarity/practiceSimilarShapes.html`
- `/pages/curriculum/GCSE/geometry/properties/similarity/provingTrianglesSimilar.html` — Proving two triangles similar: Two matched angles are enough to prove similarity, and why a shared angle alone proves nothing. — drilled by `/pages/curriculum/GCSE/geometry/properties/similarity/practiceProvingTrianglesSimilar.html`
- `/pages/curriculum/GCSE/geometry/properties/similarity/lengthsInSimilarShapes.html` — Missing lengths in similar shapes: Finding the scale factor from one matched pair of sides, then multiplying or dividing, never adding the difference. — drilled by `/pages/curriculum/GCSE/geometry/properties/similarity/practiceSimilarity.html`
- `/pages/curriculum/GCSE/geometry/properties/similarity/provingPythagoras.html` — A proof of Pythagoras’ theorem: Why a² + b² = c², proved with the similar triangles an altitude cuts a right-angled triangle into.
- `/pages/curriculum/GCSE/geometry/properties/similarity/areasOfSimilarShapes.html` — Areas of similar shapes **(H)**: A length scale factor k scales every area by k², so doubling a shape quadruples its area.
- `/pages/curriculum/GCSE/geometry/properties/similarity/volumesOfSimilarSolids.html` — Volumes of similar solids **(H)**: A length scale factor k scales volume by k³, and reading k back from a volume ratio needs a cube root.

*`/pages/curriculum/GCSE/geometry/properties/constructionsAndLoci/` — Constructions and loci* (group menu) — The ruler-and-compass constructions, the loci each one draws, and the regions that satisfy several conditions at once.

- `/pages/curriculum/GCSE/geometry/properties/constructionsAndLoci/constructingTriangles.html` — Constructing triangles: Building a triangle with compasses from three given sides, or with a protractor from given angles, arcs left visible.
- `/pages/curriculum/GCSE/geometry/properties/constructionsAndLoci/perpendicularBisector.html` — The perpendicular bisector: Constructing the perpendicular bisector of a segment with compasses, every point on it equidistant from the two ends.
- `/pages/curriculum/GCSE/geometry/properties/constructionsAndLoci/perpendicularFromAPoint.html` — A perpendicular from a point to a line: Dropping a perpendicular from an external point with compasses, which is the shortest route to the line.
- `/pages/curriculum/GCSE/geometry/properties/constructionsAndLoci/perpendicularAtAPoint.html` — A perpendicular at a point on a line: Erecting a right angle at a marked point on a line, which is also the compass construction of 90°.
- `/pages/curriculum/GCSE/geometry/properties/constructionsAndLoci/angleBisector.html` — The angle bisector: Cutting an angle exactly in half with compasses, every point on the bisector equidistant from the two arms.
- `/pages/curriculum/GCSE/geometry/properties/constructionsAndLoci/lociAtAFixedDistance.html` — Loci at a fixed distance: The circle of points at a fixed distance from a point, and the rounded-ended band around a segment.
- `/pages/curriculum/GCSE/geometry/properties/constructionsAndLoci/lociEquidistantFromTwoPoints.html` — Equidistant from two points: Why the points equidistant from A and B form the perpendicular bisector of AB, constructed rather than guessed.
- `/pages/curriculum/GCSE/geometry/properties/constructionsAndLoci/lociEquidistantFromTwoLines.html` — Equidistant from two lines: Why the points equidistant from two intersecting lines lie on the angle bisector, plus the parallel-lines case.
- `/pages/curriculum/GCSE/geometry/properties/constructionsAndLoci/combiningLoci.html` — Combining loci into regions: Shading the region that satisfies several conditions at once, each boundary constructed and the correct side kept.

*`/pages/curriculum/GCSE/geometry/properties/transformations/` — Transformations* (group menu) — The four transformations on axes, described precisely, extended at Higher tier to fractional and negative enlargement. Drills: `/pages/curriculum/GCSE/geometry/properties/transformations/practiceReflection.html`, `/pages/curriculum/GCSE/geometry/properties/transformations/practiceRotation.html`, `/pages/curriculum/GCSE/geometry/properties/transformations/practiceTranslation.html`, `/pages/curriculum/GCSE/geometry/properties/transformations/practiceEnlargement.html`, `/pages/curriculum/GCSE/geometry/properties/transformations/practiceTransformations.html`.

- `/pages/curriculum/GCSE/geometry/properties/transformations/reflection.html` — Reflection: Reflecting a shape in a mirror line on the grid, the diagonal lines y = x and y = −x included. — drilled by `/pages/curriculum/GCSE/geometry/properties/transformations/practiceReflection.html`
- `/pages/curriculum/GCSE/geometry/properties/transformations/rotation.html` — Rotation: Rotating a shape about a centre with tracing paper, where centre, angle and direction are all required. — drilled by `/pages/curriculum/GCSE/geometry/properties/transformations/practiceRotation.html`
- `/pages/curriculum/GCSE/geometry/properties/transformations/translation.html` — Translation by a column vector: Sliding a shape by a column vector, the top number moving it across and the bottom number up. — drilled by `/pages/curriculum/GCSE/geometry/properties/transformations/practiceTranslation.html`
- `/pages/curriculum/GCSE/geometry/properties/transformations/enlargement.html` — Enlargement from a centre: Enlarging from a centre by a positive scale factor, with rays from the centre fixing where the image lands. — drilled by `/pages/curriculum/GCSE/geometry/properties/transformations/practiceEnlargement.html`
- `/pages/curriculum/GCSE/geometry/properties/transformations/describingATransformation.html` — Describing a transformation: Naming the single transformation mapping object to image, and the details a full description must state. — drilled by `/pages/curriculum/GCSE/geometry/properties/transformations/practiceTransformations.html`
- `/pages/curriculum/GCSE/geometry/properties/transformations/fractionalScaleFactors.html` — Enlargement by a fractional scale factor: A scale factor between 0 and 1 shrinks the shape towards the centre, yet still counts as an enlargement.
- `/pages/curriculum/GCSE/geometry/properties/transformations/negativeScaleFactors.html` — Enlargement by a negative scale factor **(H)**: A negative scale factor sends the image through the centre to the far side, inverted as well as scaled.
- `/pages/curriculum/GCSE/geometry/properties/transformations/combiningTransformations.html` — Combining transformations **(H)**: Finding the single transformation equivalent to two done in turn, and the points a transformation leaves invariant.

*`/pages/curriculum/GCSE/geometry/properties/circleTheorems/` — Circles and their theorems* (group menu) — The names for a circle’s parts, then the Higher-tier theorems that control its angles, applied with reasons and proved. Drills: `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceAngleInASemicircle.html`, `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceCircleTheorems.html`, `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceAnglesInTheSameSegment.html`, `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceCyclicQuadrilaterals.html`, `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceTangentsToACircle.html`, `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceChordsAndTheCentre.html`, `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceCircleTheoremsReview.html`.

- `/pages/curriculum/GCSE/geometry/properties/circleTheorems/partsOfACircle.html` — Parts of a circle: Centre, radius, diameter, chord, circumference, tangent, arc, sector and segment, the vocabulary circle questions are set in.
- `/pages/curriculum/GCSE/geometry/properties/circleTheorems/angleInASemicircle.html` — The angle in a semicircle **(H)**: An angle subtended by a diameter is 90°, and spotting the diameter that triggers the theorem. — drilled by `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceAngleInASemicircle.html`
- `/pages/curriculum/GCSE/geometry/properties/circleTheorems/angleAtTheCentre.html` — The angle at the centre **(H)**: The angle at the centre is double the angle at the circumference on the same arc, however the figure is drawn. — drilled by `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceCircleTheorems.html`
- `/pages/curriculum/GCSE/geometry/properties/circleTheorems/anglesInTheSameSegment.html` — Angles in the same segment **(H)**: Angles at the circumference standing on the same arc are equal, found by chasing the chord they share. — drilled by `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceAnglesInTheSameSegment.html`
- `/pages/curriculum/GCSE/geometry/properties/circleTheorems/cyclicQuadrilaterals.html` — Cyclic quadrilaterals **(H)**: Opposite angles of a cyclic quadrilateral sum to 180°, and why all four vertices must touch the circle. — drilled by `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceCyclicQuadrilaterals.html`
- `/pages/curriculum/GCSE/geometry/properties/circleTheorems/tangentsToACircle.html` — Tangents to a circle **(H)**: A tangent meets its radius at 90°, and the two tangents from an external point are equal. — drilled by `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceTangentsToACircle.html`
- `/pages/curriculum/GCSE/geometry/properties/circleTheorems/chordsAndTheCentre.html` — Chords and the centre **(H)**: The perpendicular from the centre bisects a chord, tying circle problems back to isosceles triangles and Pythagoras. — drilled by `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceChordsAndTheCentre.html`
- `/pages/curriculum/GCSE/geometry/properties/circleTheorems/alternateSegmentTheorem.html` — The alternate segment theorem **(H)**: The angle between a tangent and a chord equals the angle in the alternate segment, the theorem most often misquoted. — drilled by `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceCircleTheoremsReview.html`
- `/pages/curriculum/GCSE/geometry/properties/circleTheorems/provingCircleTheorems.html` — Proving the circle theorems **(H)**: Proving the standard theorems from radii making isosceles triangles, in an order that lets each proof use the last.

*`/pages/curriculum/GCSE/geometry/properties/solidsAndCoordinates/` — Solids, plans and coordinates* (group menu) — Flat representations of solid shapes — counts of faces and edges, nets, plans and elevations — and shape problems pinned to coordinate axes. Drills: `/pages/curriculum/GCSE/geometry/properties/solidsAndCoordinates/practiceSolids.html`, `/pages/curriculum/GCSE/geometry/properties/solidsAndCoordinates/practiceNetsOfSolids.html`, `/pages/curriculum/GCSE/geometry/properties/solidsAndCoordinates/practiceSolidsReview.html`.

- `/pages/curriculum/GCSE/geometry/properties/solidsAndCoordinates/shapesOnCoordinateAxes.html` — Shapes on coordinate axes: Completing a named quadrilateral from given vertices, using its properties to fix the missing coordinates.
- `/pages/curriculum/GCSE/geometry/properties/solidsAndCoordinates/facesEdgesAndVertices.html` — Faces, edges and vertices: Naming the standard solids and counting their faces, edges and vertices, with prisms told apart from pyramids. — drilled by `/pages/curriculum/GCSE/geometry/properties/solidsAndCoordinates/practiceSolids.html`
- `/pages/curriculum/GCSE/geometry/properties/solidsAndCoordinates/netsOfSolids.html` — Nets of solids: Deciding which flat arrangements fold into a given solid, and tracking which edges and corners meet. — drilled by `/pages/curriculum/GCSE/geometry/properties/solidsAndCoordinates/practiceNetsOfSolids.html`
- `/pages/curriculum/GCSE/geometry/properties/solidsAndCoordinates/plansAndElevations.html` — Plans and elevations: Drawing the plan, front and side elevations on squared paper, and rebuilding the solid the three views describe. — drilled by `/pages/curriculum/GCSE/geometry/properties/solidsAndCoordinates/practiceSolidsReview.html`


**`/pages/curriculum/GCSE/geometry/mensuration/` — Mensuration and calculation** *(topic menu, 8 groups, 51 teaching pages, 9 Higher only)*

*`/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/` — Measures, scale drawings and bearings* (group menu) — Reading and making accurate drawings, the units mensuration answers carry, and directions given as three-figure bearings. Drills: `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/practiceScaleDrawings.html`, `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/practiceMapScales.html`, `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/practiceBearings.html`, `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/practiceBearingsReview.html`.

- `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/measuringLinesAndAngles.html` — Measuring lines and angles: Measuring segments to the nearest millimetre and angles with a protractor, using the scale that starts at zero.
- `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/unitsInMensuration.html` — Units in perimeter, area and volume: Why areas carry square units and volumes cubic units, and converting every length to one unit before calculating.
- `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/scaleDrawings.html` — Scale drawings: Reading and making drawings at a stated scale, converting between drawn length and real length in both directions. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/practiceScaleDrawings.html`
- `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/mapScales.html` — Map scales: Ratio scales such as 1:25 000 turned into real distances and back, with the unit change saved for last. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/practiceMapScales.html`
- `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/threeFigureBearings.html` — Three-figure bearings: Directions measured clockwise from north and always written with three figures, so 45° is recorded as 045°. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/practiceBearings.html`
- `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/calculatingWithBearings.html` — Calculating with bearings: The bearing back the other way, and journey diagrams solved with parallel north lines and angle facts. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/practiceBearingsReview.html`

*`/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/` — Perimeter and area* (group menu) — The distance round a shape and the space inside it, from counting squares to the formulas for triangles, parallelograms and trapezia. Drills: `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practicePerimeter.html`, `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceAreaOfARectangle.html`, `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceArea.html`, `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceAreaOfAParallelogram.html`, `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceAreaOfATrapezium.html`, `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceFindingALengthFromAnArea.html`, `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceAreaReview.html`.

- `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/perimeter.html` — Perimeter: The distance round a shape, including deducing the unmarked sides of a rectilinear shape before adding. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practicePerimeter.html`
- `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/areaOfARectangle.html` — Area of a rectangle: Area as the squares a shape covers, counted first and then found faster as length times width. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceAreaOfARectangle.html`
- `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/areaOfATriangle.html` — Area of a triangle: Half of base times height, where the height is perpendicular to the base and never the slant side. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceArea.html`
- `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/areaOfAParallelogram.html` — Area of a parallelogram: Base times perpendicular height, and why using the slant side gives an answer that is always too big. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceAreaOfAParallelogram.html`
- `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/areaOfATrapezium.html` — Area of a trapezium: Half the sum of the parallel sides times the height between them, and identifying which sides are parallel. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceAreaOfATrapezium.html`
- `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/findingALengthFromAnArea.html` — Finding a length from an area: Running an area formula backwards to recover a base, height or parallel side from the stated area. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceFindingALengthFromAnArea.html`
- `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/areaOfCompositeShapes.html` — Perimeter and area of composite shapes: Splitting a compound shape into rectangles and triangles, or subtracting a hole, keeping perimeter and area separate. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceAreaReview.html`

*`/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/` — Circles, arcs and sectors* (group menu) — The two circle formulas and which of them a question is really asking for, then the fractions of a circle an angle cuts. Drills: `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceMensuration.html`, `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceAreaOfACircle.html`, `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceAnswersInTermsOfPi.html`, `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceSemicirclesAndQuarterCircles.html`, `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceArcLength.html`, `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceSectorArea.html`, `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceFindingTheAngleOfASector.html`, `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceMensurationReview.html`.

- `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/circumferenceOfACircle.html` — Circumference of a circle: C = πd or 2πr, and deciding whether the given length is a radius or a diameter first. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceMensuration.html`
- `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/areaOfACircle.html` — Area of a circle: A = πr² with only the radius squared, halving a given diameter before anything is substituted. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceAreaOfACircle.html`
- `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/answersInTermsOfPi.html` — Answers in terms of π: Leaving circle answers as exact multiples of π instead of decimals, and calculating with them unrounded. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceAnswersInTermsOfPi.html`
- `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/semicirclesAndQuarterCircles.html` — Semicircles and quarter circles: Halving or quartering the circle formulas, and adding the straight edges whenever a perimeter is wanted. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceSemicirclesAndQuarterCircles.html`
- `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/arcLength.html` — Arc length: The angle over 360 as the fraction of the circumference an arc takes, plus two radii for a sector’s perimeter. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceArcLength.html`
- `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/sectorArea.html` — Area of a sector: The angle over 360 applied to πr² for the area a sector sweeps, and to nothing else. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceSectorArea.html`
- `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/findingTheAngleOfASector.html` — Finding the angle of a sector: Running the arc and sector formulas backwards to recover the angle or radius from a stated length or area. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceFindingTheAngleOfASector.html`

*`/pages/curriculum/GCSE/geometry/mensuration/prismsAndCylinders/` — Prisms and cylinders* (group menu) — Volume as repeated cross-sections and surface area as an unfolded net, for cuboids, prisms and cylinders. Drills: `/pages/curriculum/GCSE/geometry/mensuration/prismsAndCylinders/practiceVolumeOfAPrism.html`, `/pages/curriculum/GCSE/geometry/mensuration/prismsAndCylinders/practiceVolumeOfACylinder.html`, `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceMensurationReview.html`.

- `/pages/curriculum/GCSE/geometry/mensuration/prismsAndCylinders/volumeOfACuboid.html` — Volume of a cuboid: Length times width times height counted as layers of unit cubes, and a missing edge from a stated volume.
- `/pages/curriculum/GCSE/geometry/mensuration/prismsAndCylinders/volumeOfAPrism.html` — Volume of a prism: Cross-section area times length for any prism, once the face that repeats has been correctly identified. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/prismsAndCylinders/practiceVolumeOfAPrism.html`
- `/pages/curriculum/GCSE/geometry/mensuration/prismsAndCylinders/volumeOfACylinder.html` — Volume of a cylinder: πr²h as a circular prism, left in terms of π unless a decimal is demanded. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/prismsAndCylinders/practiceVolumeOfACylinder.html`
- `/pages/curriculum/GCSE/geometry/mensuration/prismsAndCylinders/surfaceAreaOfACuboid.html` — Surface area of a cuboid: Adding the areas of the three pairs of matching faces, in square units although the shape is solid.
- `/pages/curriculum/GCSE/geometry/mensuration/prismsAndCylinders/surfaceAreaOfAPrism.html` — Surface area of a prism: Adding every face of the net so none is missed, the two matching cross-section faces included.
- `/pages/curriculum/GCSE/geometry/mensuration/prismsAndCylinders/surfaceAreaOfACylinder.html` — Surface area of a cylinder: The curved face unrolled into a rectangle 2πr long, plus two circular ends when the cylinder is closed.

*`/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/` — Pyramids, cones and spheres* (group menu) — The pointed and curved solids: a third for anything pointed, the sphere formulas, and solids assembled from — or cut out of — simpler ones. Drills: `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/practiceVolumeOfAPyramid.html`, `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/practiceVolumeOfACone.html`, `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/practiceVolumeOfASphere.html`, `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceMensurationReview.html`.

- `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/volumeOfAPyramid.html` — Volume of a pyramid: One third of the base area times the perpendicular height, whatever polygon forms the base. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/practiceVolumeOfAPyramid.html`
- `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/volumeOfACone.html` — Volume of a cone: ⅓πr²h with the perpendicular height rather than the slant, and Pythagoras to convert between the two. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/practiceVolumeOfACone.html`
- `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/volumeOfASphere.html` — Volume of a sphere: Four thirds of πr³ with only the radius cubed, and hemispheres taken as exact halves. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/practiceVolumeOfASphere.html`
- `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/surfaceAreaOfAPyramid.html` — Surface area of a pyramid: The base plus the triangular faces, each triangle needing its own slant height rather than the solid’s.
- `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/surfaceAreaOfACone.html` — Surface area of a cone: The curved surface πrl with l the slant height, adding the base circle only when the cone is closed.
- `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/surfaceAreaOfASphere.html` — Surface area of a sphere: 4πr² for the whole sphere, and why a hemisphere’s total is 3πr² once the flat face joins in.
- `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/compositeSolids.html` — Composite solids: Volumes and surface areas of solids built from simpler ones, subtracting the faces hidden where the parts meet.
- `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/volumeOfAFrustum.html` — Volume of a frustum **(H)**: A cone with its top removed, its volume the large cone’s minus the similar small cone’s. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceMensurationReview.html`

*`/pages/curriculum/GCSE/geometry/mensuration/pythagoras/` — Pythagoras’ theorem* (group menu) — The relation between the three sides of a right-angled triangle, run forwards, backwards, across a grid and into three dimensions. Drills: `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/practicePythagoras.html`, `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/practicePythagorasShorterSides.html`, `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/practiceDistanceBetweenTwoPoints.html`, `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/practiceTestingForARightAngle.html`, `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/practicePythagorasReview.html`.

- `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/pythagorasTheorem.html` — Pythagoras’ theorem: The squares on the two shorter sides sum to the square on the hypotenuse, which always faces the right angle. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/practicePythagoras.html`
- `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/pythagorasShorterSides.html` — Finding a shorter side: Subtracting squares instead of adding when the hypotenuse is already known, the swap most wrong answers miss. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/practicePythagorasShorterSides.html`
- `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/distanceBetweenTwoPoints.html` — The distance between two points: The straight-line distance between two coordinates as the hypotenuse of the right-angled triangle the grid supplies. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/practiceDistanceBetweenTwoPoints.html`
- `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/testingForARightAngle.html` — Testing for a right angle: The converse of Pythagoras: checking whether the three sides satisfy a² + b² = c² before claiming the right angle. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/practiceTestingForARightAngle.html`
- `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/pythagorasInThreeDimensions.html` — Pythagoras in three dimensions **(H)**: The diagonal of a cuboid found by two right-angled triangles in turn, one lying flat and one standing. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/practicePythagorasReview.html`

*`/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/` — Right-angled trigonometry* (group menu) — The three ratios that link an angle of a right-angled triangle to its sides, used to find sides, angles and exact values. Drills: `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/practiceTrigonometry.html`, `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/practiceFindingASideWithTrigonometry.html`, `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/practiceFindingAnAngleWithTrigonometry.html`, `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/practiceExactTrigValues.html`, `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/practiceTrigonometryReview.html`.

- `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/trigonometricRatios.html` — The trigonometric ratios: Sine, cosine and tangent as ratios of sides, labelled hypotenuse, opposite and adjacent from the angle in use. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/practiceTrigonometry.html`
- `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/findingASideWithTrigonometry.html` — Finding a side with trigonometry: Choosing the ratio that links the known angle to the wanted side, and when to multiply or divide. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/practiceFindingASideWithTrigonometry.html`
- `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/findingAnAngleWithTrigonometry.html` — Finding an angle with trigonometry: The inverse functions sin⁻¹, cos⁻¹ and tan⁻¹ turning a ratio of two sides back into the angle. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/practiceFindingAnAngleWithTrigonometry.html`
- `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/exactTrigValues.html` — Exact trigonometric values: The exact values of sin and cos at 0°, 30°, 45°, 60° and 90°, and tan up to 60°, read from two special triangles. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/practiceExactTrigValues.html`
- `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/anglesOfElevationAndDepression.html` — Angles of elevation and depression: Looking up and looking down turned into right-angled triangles, the depression angle placed inside by alternate angles. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/practiceTrigonometryReview.html`
- `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/trigonometryInThreeDimensions.html` — Trigonometry in three dimensions **(H)**: The angle between a line and a plane, found by building the right-angled triangle that contains it.

*`/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/` — The sine and cosine rules* (group menu) — Higher tier: the rules that solve any triangle, right angle or not, and the area formula that needs no height. Drills: `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceSineCosineRules.html`, `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceSineRuleAngles.html`, `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceCosineRuleSides.html`, `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceCosineRuleAngles.html`, `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceAreaHalfAbSinC.html`, `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceSineCosineRulesReview.html`.

- `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/sineRuleSides.html` — The sine rule for sides **(H)**: Each side over the sine of its opposite angle is constant, so one matched pair unlocks the rest. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceSineCosineRules.html`
- `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/sineRuleAngles.html` — The sine rule for angles **(H)**: The rule flipped to find an angle, and the second obtuse solution the sine of an angle can hide. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceSineRuleAngles.html`
- `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/cosineRuleSides.html` — The cosine rule for sides **(H)**: c² = a² + b² − 2ab cos C for the side facing a known included angle, with the subtraction done last. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceCosineRuleSides.html`
- `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/cosineRuleAngles.html` — The cosine rule for angles **(H)**: The cosine rule rearranged to find any angle from three sides, a negative cosine signalling an obtuse angle. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceCosineRuleAngles.html`
- `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/areaHalfAbSinC.html` — The area formula ½ab sin C **(H)**: Half the product of two sides and the sine of the included angle, no perpendicular height required. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceAreaHalfAbSinC.html`
- `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/choosingTheRightRule.html` — Choosing between the rules **(H)**: Deciding from the given sides and angles whether right-angled trigonometry, the sine rule or the cosine rule applies. — drilled by `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceSineCosineRulesReview.html`


**`/pages/curriculum/GCSE/geometry/vectors/` — Vectors** *(topic menu, 2 groups, 10 teaching pages, 4 Higher only)*

*`/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/` — Vector notation and arithmetic* (group menu) — What a column vector records, and the arithmetic — adding, subtracting and scaling — that combines displacements into resultants. Drills: `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/practiceVectors.html`, `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/practiceTranslationsAsVectors.html`, `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/practiceAddingAndSubtractingVectors.html`, `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/practiceScalarMultiplesOfAVector.html`, `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/practiceVectorsReview.html`.

- `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/columnVectors.html` — Column vectors: A displacement written as a column vector, identical wherever it starts, unlike the position a coordinate names. — drilled by `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/practiceVectors.html`
- `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/translationsAsVectors.html` — Translations as vectors: Describing a translation with a column vector, the top number across and the bottom number up, signs included. — drilled by `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/practiceTranslationsAsVectors.html`
- `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/addingAndSubtractingVectors.html` — Adding and subtracting vectors: Adding component by component, or chaining arrows nose to tail for the resultant, with subtraction as adding the reverse. — drilled by `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/practiceAddingAndSubtractingVectors.html`
- `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/scalarMultiplesOfAVector.html` — Scalar multiples of a vector: Multiplying a vector by a number scales its length, and a negative scalar reverses its direction too. — drilled by `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/practiceScalarMultiplesOfAVector.html`
- `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/magnitudeOfAVector.html` — The magnitude of a vector: The length of a vector by Pythagoras on its two components, written between modulus bars. — drilled by `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/practiceVectorsReview.html`

*`/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/` — Vector geometry and proof* (group menu) — Vectors doing geometry: routes expressed in a and b, and the Higher-tier arguments that prove lines parallel and points collinear. Drills: `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/practiceVectorProofs.html`, `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/practiceFractionsOfAVector.html`, `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/practiceParallelVectors.html`, `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/practiceCollinearPoints.html`, `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/practiceVectorProofsReview.html`.

- `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/vectorRoutes.html` — Routes around a figure: Writing the path between labelled points in terms of a and b, a vector travelled backwards picking up a minus. — drilled by `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/practiceVectorProofs.html`
- `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/fractionsOfAVector.html` — Fractions of a vector **(H)**: The vector to a midpoint or ratio point on a segment, built as a fraction of the whole vector. — drilled by `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/practiceFractionsOfAVector.html`
- `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/parallelVectors.html` — Parallel vectors **(H)**: Two vectors are parallel exactly when one is a scalar multiple of the other, shown by factorising the expression. — drilled by `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/practiceParallelVectors.html`
- `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/collinearPoints.html` — Collinear points **(H)**: Proving three points lie on one straight line by showing two vectors parallel and sharing a point. — drilled by `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/practiceCollinearPoints.html`
- `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/vectorProofs.html` — Vector proofs **(H)**: Setting out a complete vector argument, from routes in a and b to the parallel or collinear conclusion. — drilled by `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/practiceVectorProofsReview.html`

### Probability

Four topic menus, 13 group menus, and 51 teaching pages. Lesson drills are narrow; mixed reviews appear only after their final prerequisite.

**`/pages/curriculum/GCSE/probability/scale/` — The probability scale** *(topic menu, 3 groups, 13 teaching pages)*

*`/pages/curriculum/GCSE/probability/scale/measuringChance/` — Measuring chance* (group menu) — The words and numbers that record likelihood, all on the 0 to 1 scale. Drills: `/pages/curriculum/GCSE/probability/scale/measuringChance/practiceComparingProbabilities.html`, `/pages/curriculum/GCSE/probability/scale/singleEvents/practiceSingleReview.html`.

- `/pages/curriculum/GCSE/probability/scale/measuringChance/likelihoodLanguage.html` — The language of likelihood: The words from impossible to certain, and ordering events by likelihood.
- `/pages/curriculum/GCSE/probability/scale/measuringChance/zeroToOneScale.html` — The 0 to 1 scale: Probability as a number from 0 for impossible to 1 for certain.
- `/pages/curriculum/GCSE/probability/scale/measuringChance/eventNotation.html` — Events and the notation P(A): Outcomes, events and trials, and writing statements such as P(red) = 0.3.
- `/pages/curriculum/GCSE/probability/scale/measuringChance/probabilityInThreeForms.html` — Probability as a fraction, decimal or percentage: A probability as a fraction, decimal or percentage, and converting between them.
- `/pages/curriculum/GCSE/probability/scale/measuringChance/comparingProbabilities.html` — Comparing probabilities: Deciding which event is more likely by common denominators or decimals. — drilled by `/pages/curriculum/GCSE/probability/scale/measuringChance/practiceComparingProbabilities.html`

*`/pages/curriculum/GCSE/probability/scale/singleEvents/` — Single events* (group menu) — The probability of one event by counting outcomes, and the fairness behind it. Drills: `/pages/curriculum/GCSE/probability/scale/singleEvents/practiceSingle.html`, `/pages/curriculum/GCSE/probability/scale/singleEvents/practiceEventsWithSeveralOutcomes.html`, `/pages/curriculum/GCSE/probability/scale/singleEvents/practiceSingleReview.html`.

- `/pages/curriculum/GCSE/probability/scale/singleEvents/equallyLikelyOutcomes.html` — Probability from equally likely outcomes: Favourable outcomes over total outcomes, and the equally likely condition. — drilled by `/pages/curriculum/GCSE/probability/scale/singleEvents/practiceSingle.html`
- `/pages/curriculum/GCSE/probability/scale/singleEvents/eventsWithSeveralOutcomes.html` — An event made of several outcomes: Counting every outcome an event contains before dividing by the total. — drilled by `/pages/curriculum/GCSE/probability/scale/singleEvents/practiceEventsWithSeveralOutcomes.html`
- `/pages/curriculum/GCSE/probability/scale/singleEvents/fairnessAndRandomSelection.html` — Fairness and selecting at random: What fair, biased and at random mean, and when counting stops being valid.

*`/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/` — Complements and expected frequency* (group menu) — Probabilities totalling one, the not rule, and probability times trials. Drills: `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/practiceProbabilitiesSumToOne.html`, `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/practiceComplementaryEvents.html`, `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/practiceMissingProbabilities.html`, `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/practiceExpectedFrequency.html`, `/pages/curriculum/GCSE/probability/scale/singleEvents/practiceSingleReview.html`.

- `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/probabilitiesSumToOne.html` — Probabilities that sum to one: Why an exhaustive set’s probabilities total one, and checking a stated table. — drilled by `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/practiceProbabilitiesSumToOne.html`
- `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/complementaryEvents.html` — The probability of an event not happening: P(not A) as 1 − P(A), and spotting when the complement is the faster route. — drilled by `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/practiceComplementaryEvents.html`
- `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/missingProbabilities.html` — Finding a missing probability: Using the total of one to find an unknown probability, even an algebraic one. — drilled by `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/practiceMissingProbabilities.html`
- `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/expectedFrequency.html` — Expected frequency: Estimating how many times an event will occur as probability times trials. — drilled by `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/practiceExpectedFrequency.html`
- `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/expectationAsAnEstimate.html` — Expected frequency as an estimate: Why 60 rolls need not give ten sixes, and what the expected count does say. — drilled by `/pages/curriculum/GCSE/probability/scale/singleEvents/practiceSingleReview.html`


**`/pages/curriculum/GCSE/probability/combined/` — Combined events** *(topic menu, 4 groups, 16 teaching pages, 4 Higher only)*

*`/pages/curriculum/GCSE/probability/combined/exclusiveEvents/` — Exclusive events and the OR rule* (group menu) — Events that cannot both happen, the addition rule, and correcting for overlap. Drills: `/pages/curriculum/GCSE/probability/combined/exclusiveEvents/practiceMutuallyExclusiveEvents.html`, `/pages/curriculum/GCSE/probability/combined/exclusiveEvents/practiceOrRule.html`, `/pages/curriculum/GCSE/probability/combined/exclusiveEvents/practiceOverlappingEvents.html`, `/pages/curriculum/GCSE/probability/combined/independence/practiceCombinedReview.html`.

- `/pages/curriculum/GCSE/probability/combined/exclusiveEvents/mutuallyExclusiveEvents.html` — Mutually exclusive events: Events that cannot both happen on one trial, and testing pairs for exclusivity. — drilled by `/pages/curriculum/GCSE/probability/combined/exclusiveEvents/practiceMutuallyExclusiveEvents.html`
- `/pages/curriculum/GCSE/probability/combined/exclusiveEvents/orRule.html` — The OR rule for exclusive events: Adding probabilities for either-or questions, and why exclusivity is required. — drilled by `/pages/curriculum/GCSE/probability/combined/exclusiveEvents/practiceOrRule.html`
- `/pages/curriculum/GCSE/probability/combined/exclusiveEvents/exhaustiveEvents.html` — Exhaustive sets of events: Sets of events covering every outcome, and when their probabilities total one.
- `/pages/curriculum/GCSE/probability/combined/exclusiveEvents/overlappingEvents.html` — Events that overlap: Why adding double-counts the overlap, and subtracting it to correct the total. — drilled by `/pages/curriculum/GCSE/probability/combined/exclusiveEvents/practiceOverlappingEvents.html`

*`/pages/curriculum/GCSE/probability/combined/independence/` — Independence and the AND rule* (group menu) — Independent events, the multiplication rule, and deciding which rule fits. Drills: `/pages/curriculum/GCSE/probability/combined/independence/practiceIndependentEvents.html`, `/pages/curriculum/GCSE/probability/combined/independence/practiceAndRule.html`, `/pages/curriculum/GCSE/probability/combined/independence/practiceIndependenceAssumption.html`, `/pages/curriculum/GCSE/probability/combined/independence/practiceCombined.html`, `/pages/curriculum/GCSE/probability/combined/independence/practiceCombinedReview.html`.

- `/pages/curriculum/GCSE/probability/combined/independence/independentEvents.html` — Independent events: Events where one outcome gives no information about the other. — drilled by `/pages/curriculum/GCSE/probability/combined/independence/practiceIndependentEvents.html`
- `/pages/curriculum/GCSE/probability/combined/independence/andRule.html` — The AND rule for independent events: Multiplying the probabilities of independent events for both-happen questions. — drilled by `/pages/curriculum/GCSE/probability/combined/independence/practiceAndRule.html`
- `/pages/curriculum/GCSE/probability/combined/independence/independenceAssumption.html` — The independence assumption: The unstated assumption behind multiplying, and everyday cases where it fails. — drilled by `/pages/curriculum/GCSE/probability/combined/independence/practiceIndependenceAssumption.html`
- `/pages/curriculum/GCSE/probability/combined/independence/choosingAddOrMultiply.html` — Choosing between adding and multiplying: Deciding whether a worded question wants either event or both events. — drilled by `/pages/curriculum/GCSE/probability/combined/independence/practiceCombined.html`
- `/pages/curriculum/GCSE/probability/combined/independence/atLeastOne.html` — The probability of at least one: One minus the probability of none, and why the complement beats listing cases. — drilled by `/pages/curriculum/GCSE/probability/combined/independence/practiceCombinedReview.html`

*`/pages/curriculum/GCSE/probability/combined/replacement/` — Dependent events and replacement* (group menu) — The second pick when the first is not put back, and the recalculated fractions. Drills: `/pages/curriculum/GCSE/probability/combined/replacement/practiceDependentEvents.html`, `/pages/curriculum/GCSE/probability/combined/replacement/practiceWithReplacement.html`, `/pages/curriculum/GCSE/probability/combined/replacement/practiceReplacement.html`.

- `/pages/curriculum/GCSE/probability/combined/replacement/dependentEvents.html` — Dependent events: Events where the first outcome changes the probabilities for the second. — drilled by `/pages/curriculum/GCSE/probability/combined/replacement/practiceDependentEvents.html`
- `/pages/curriculum/GCSE/probability/combined/replacement/withReplacement.html` — Sampling with replacement: Repeated picks where each object goes back, so every stage stays independent. — drilled by `/pages/curriculum/GCSE/probability/combined/replacement/practiceWithReplacement.html`
- `/pages/curriculum/GCSE/probability/combined/replacement/withoutReplacement.html` — Sampling without replacement: Successive picks where numerator and denominator shrink for the second pick. — drilled by `/pages/curriculum/GCSE/probability/combined/replacement/practiceReplacement.html`

*`/pages/curriculum/GCSE/probability/combined/conditional/` — Conditional probability* (group menu) — Higher only: given-that probability from two-way tables, Venn and tree diagrams. Drills: `/pages/curriculum/GCSE/probability/combined/conditional/practiceConditional.html`, `/pages/curriculum/GCSE/probability/combined/conditional/practiceConditionalFromTwoWayTables.html`, `/pages/curriculum/GCSE/probability/combined/conditional/practiceConditionalFromVennDiagrams.html`, `/pages/curriculum/GCSE/probability/combined/conditional/practiceConditionalReview.html`.

- `/pages/curriculum/GCSE/probability/combined/conditional/conditionalProbability.html` — Conditional probability **(H)**: The probability of an event given that another has happened. — drilled by `/pages/curriculum/GCSE/probability/combined/conditional/practiceConditional.html`
- `/pages/curriculum/GCSE/probability/combined/conditional/conditionalFromTwoWayTables.html` — Conditional probability from a two-way table **(H)**: P(A given B) as a cell over its row or column total, not the grand total. — drilled by `/pages/curriculum/GCSE/probability/combined/conditional/practiceConditionalFromTwoWayTables.html`
- `/pages/curriculum/GCSE/probability/combined/conditional/conditionalFromVennDiagrams.html` — Conditional probability from a Venn diagram **(H)**: Dividing the overlap by the region in the condition, not the whole diagram. — drilled by `/pages/curriculum/GCSE/probability/combined/conditional/practiceConditionalFromVennDiagrams.html`
- `/pages/curriculum/GCSE/probability/combined/conditional/conditionalFromTreeDiagrams.html` — Conditional probability on a tree diagram **(H)**: Why second-stage branches already carry conditional probabilities. — drilled by `/pages/curriculum/GCSE/probability/combined/conditional/practiceConditionalReview.html`


**`/pages/curriculum/GCSE/probability/diagrams/` — Diagrams** *(topic menu, 4 groups, 14 teaching pages)*

*`/pages/curriculum/GCSE/probability/diagrams/sampleSpaces/` — Sample spaces* (group menu) — Two events’ outcomes listed or gridded once, and probabilities from the cells. Drills: `/pages/curriculum/GCSE/probability/diagrams/sampleSpaces/practiceListingCombinedOutcomes.html`, `/pages/curriculum/GCSE/probability/diagrams/sampleSpaces/practiceSampleSpaceDiagrams.html`, `/pages/curriculum/GCSE/probability/diagrams/sampleSpaces/practiceSampleSpaces.html`.

- `/pages/curriculum/GCSE/probability/diagrams/sampleSpaces/listingCombinedOutcomes.html` — Listing the outcomes of two events: Writing every pairing of two events once, in an order showing none is missing. — drilled by `/pages/curriculum/GCSE/probability/diagrams/sampleSpaces/practiceListingCombinedOutcomes.html`
- `/pages/curriculum/GCSE/probability/diagrams/sampleSpaces/sampleSpaceDiagrams.html` — Sample space diagrams: The grid displaying every outcome of two events, one axis per event. — drilled by `/pages/curriculum/GCSE/probability/diagrams/sampleSpaces/practiceSampleSpaceDiagrams.html`
- `/pages/curriculum/GCSE/probability/diagrams/sampleSpaces/probabilitiesFromASampleSpace.html` — Probabilities from a sample space: Counting the cells an event occupies and dividing by the whole grid. — drilled by `/pages/curriculum/GCSE/probability/diagrams/sampleSpaces/practiceSampleSpaces.html`

*`/pages/curriculum/GCSE/probability/diagrams/tablesAndFrequencyTrees/` — Two-way tables and frequency trees* (group menu) — Counts by two categories or successive splits, turned into probabilities. Drills: `/pages/curriculum/GCSE/probability/diagrams/tablesAndFrequencyTrees/practiceTwoWayTables.html`, `/pages/curriculum/GCSE/probability/diagrams/tablesAndFrequencyTrees/practiceProbabilitiesFromTwoWayTables.html`, `/pages/curriculum/GCSE/probability/diagrams/tablesAndFrequencyTrees/practiceTwoWayTablesReview.html`.

- `/pages/curriculum/GCSE/probability/diagrams/tablesAndFrequencyTrees/twoWayTables.html` — Two-way tables: Completing a two-way table from its totals, one forced cell at a time. — drilled by `/pages/curriculum/GCSE/probability/diagrams/tablesAndFrequencyTrees/practiceTwoWayTables.html`
- `/pages/curriculum/GCSE/probability/diagrams/tablesAndFrequencyTrees/probabilitiesFromTwoWayTables.html` — Probabilities from a two-way table: A cell count over the grand total, and reading which total a question wants. — drilled by `/pages/curriculum/GCSE/probability/diagrams/tablesAndFrequencyTrees/practiceProbabilitiesFromTwoWayTables.html`
- `/pages/curriculum/GCSE/probability/diagrams/tablesAndFrequencyTrees/frequencyTrees.html` — Frequency trees: Filling in counts along two successive splits, and reading the finished tree. — drilled by `/pages/curriculum/GCSE/probability/diagrams/tablesAndFrequencyTrees/practiceTwoWayTablesReview.html`

*`/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/` — Tree diagrams* (group menu) — Multiplying along a path, adding across paths, and trees without replacement. Drills: `/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/practiceDrawingTreeDiagrams.html`, `/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/practiceTrees.html`, `/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/practiceAddingAcrossPaths.html`, `/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/practiceTreesReview.html`.

- `/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/drawingTreeDiagrams.html` — Drawing a tree diagram: One fork per stage, a probability on every branch, and each fork totalling one. — drilled by `/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/practiceDrawingTreeDiagrams.html`
- `/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/multiplyingAlongBranches.html` — Multiplying along the branches: The probability of a complete route as the product of its branch probabilities. — drilled by `/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/practiceTrees.html`
- `/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/addingAcrossPaths.html` — Adding across the paths: Finding every path that satisfies the event, then adding their probabilities. — drilled by `/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/practiceAddingAcrossPaths.html`
- `/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/treesWithoutReplacement.html` — Tree diagrams without replacement: Second-stage branches recalculated after the first pick, never simply copied. — drilled by `/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/practiceTreesReview.html`

*`/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/` — Venn diagrams and set notation* (group menu) — Sets drawn as regions, the notation naming each, and probabilities from counts. Drills: `/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/practiceVennDiagramRegions.html`, `/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/practiceVenn.html`, `/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/practiceFillingInAVennDiagram.html`, `/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/practiceVennReview.html`.

- `/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/vennDiagramRegions.html` — The regions of a Venn diagram: What the four regions of a two-set diagram hold, including outside both sets. — drilled by `/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/practiceVennDiagramRegions.html`
- `/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/setNotation.html` — Set notation: Union, intersection, complement and universal set, and the regions they shade. — drilled by `/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/practiceVenn.html`
- `/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/fillingInAVennDiagram.html` — Filling in a Venn diagram: Placing the intersection first and subtracting outwards from worded counts. — drilled by `/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/practiceFillingInAVennDiagram.html`
- `/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/probabilitiesFromAVennDiagram.html` — Probabilities from a Venn diagram: A region’s count over the total across every region, including the outside. — drilled by `/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/practiceVennReview.html`


**`/pages/curriculum/GCSE/probability/experimental/` — Experimental probability** *(topic menu, 2 groups, 8 teaching pages)*

*`/pages/curriculum/GCSE/probability/experimental/estimatingFromExperiments/` — Relative frequency* (group menu) — A probability estimated from repeated trials and used to predict future counts. Drills: `/pages/curriculum/GCSE/probability/experimental/estimatingFromExperiments/practiceRelativeFrequency.html`, `/pages/curriculum/GCSE/probability/experimental/estimatingFromExperiments/practiceEstimatingProbabilityFromData.html`, `/pages/curriculum/GCSE/probability/experimental/estimatingFromExperiments/practiceRelativeFrequencyReview.html`.

- `/pages/curriculum/GCSE/probability/experimental/estimatingFromExperiments/recordingExperimentalResults.html` — Recording the results of an experiment: Tallying the outcomes of repeated trials into a frequency table.
- `/pages/curriculum/GCSE/probability/experimental/estimatingFromExperiments/relativeFrequency.html` — Relative frequency: The fraction of trials on which an event occurred, estimating its probability. — drilled by `/pages/curriculum/GCSE/probability/experimental/estimatingFromExperiments/practiceRelativeFrequency.html`
- `/pages/curriculum/GCSE/probability/experimental/estimatingFromExperiments/estimatingProbabilityFromData.html` — Estimating a probability from data: Relative frequency when outcomes are not equally likely, such as a drawing pin. — drilled by `/pages/curriculum/GCSE/probability/experimental/estimatingFromExperiments/practiceEstimatingProbabilityFromData.html`
- `/pages/curriculum/GCSE/probability/experimental/estimatingFromExperiments/predictingFromRelativeFrequency.html` — Predicting future results from relative frequency: Scaling an estimated probability up to future trials, rounded to a whole count. — drilled by `/pages/curriculum/GCSE/probability/experimental/estimatingFromExperiments/practiceRelativeFrequencyReview.html`

*`/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/` — Bias and sample size* (group menu) — Experiments set against theory, bias verdicts, and what more trials buy. Drills: `/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/practiceComparingWithTheory.html`, `/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/practiceBias.html`, `/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/practiceEffectOfSampleSize.html`, `/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/practiceBiasReview.html`.

- `/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/comparingWithTheory.html` — Comparing experimental and theoretical probability: Setting relative frequency against theory, and describing the gap between them. — drilled by `/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/practiceComparingWithTheory.html`
- `/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/detectingBias.html` — Detecting bias: Judging whether a dice or spinner is fair, and how large a gap is suspicious. — drilled by `/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/practiceBias.html`
- `/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/effectOfSampleSize.html` — The effect of sample size: Why relative frequency settles towards the true probability as trials increase. — drilled by `/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/practiceEffectOfSampleSize.html`
- `/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/bestEstimate.html` — Choosing the best estimate: Trusting the estimate backed by the most trials, and pooling results into one. — drilled by `/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/practiceBiasReview.html`

### Statistics

Four topic menus, 13 group menus, and 62 teaching pages. Lesson drills are narrow; mixed reviews appear only after their final prerequisite.

**`/pages/curriculum/GCSE/statistics/sampling/` — Sampling and data collection** *(topic menu, 2 groups, 12 teaching pages)*

*`/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/` — Populations, samples and bias* (group menu) — Whom to survey, how to pick them fairly, and why a bad sample poisons results. Drills: `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceSampling.html`, `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceCensusOrSample.html`, `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceRandomSampling.html`, `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceNonRandomSampling.html`, `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceSourcesOfBias.html`, `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceSampleSize.html`, `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceSamplingReview.html`.

- `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/populationAndSample.html` — Populations and samples: The population as everyone of interest and the sample as the part surveyed. — drilled by `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceSampling.html`
- `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/censusOrSample.html` — Census or sample: When a census is worth it, and when cost or destructive testing forces a sample. — drilled by `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceCensusOrSample.html`
- `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/randomSampling.html` — Random sampling: Giving every member an equal chance, and why haphazard is not random. — drilled by `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceRandomSampling.html`
- `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/nonRandomSampling.html` — Non-random sampling: Systematic and opportunity sampling, and the groups each one quietly misses. — drilled by `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceNonRandomSampling.html`
- `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/sourcesOfBias.html` — Bias in sampling: How time, place and selection method favour one group, and whom a survey misses. — drilled by `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceSourcesOfBias.html`
- `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/sampleSize.html` — Sample size: Why larger samples give steadier estimates, yet badly chosen ones stay biased. — drilled by `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceSampleSize.html`
- `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/estimatingPopulationFigures.html` — Estimating population figures from a sample: Scaling a sample proportion up to the population, and the assumption behind it. — drilled by `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceSamplingReview.html`

*`/pages/curriculum/GCSE/statistics/sampling/collectingData/` — Kinds of data and collecting it* (group menu) — What data a question produces, where it comes from, and how to record it. Drills: `/pages/curriculum/GCSE/statistics/sampling/collectingData/practiceDataCollection.html`, `/pages/curriculum/GCSE/statistics/sampling/collectingData/practiceDiscreteAndContinuous.html`, `/pages/curriculum/GCSE/statistics/sampling/collectingData/practicePrimaryAndSecondaryData.html`, `/pages/curriculum/GCSE/statistics/sampling/collectingData/practiceCollectionSheets.html`, `/pages/curriculum/GCSE/statistics/sampling/collectingData/practiceDataCollectionReview.html`.

- `/pages/curriculum/GCSE/statistics/sampling/collectingData/typesOfData.html` — Qualitative and quantitative data: Telling qualities from quantities, and how the type fixes charts and averages. — drilled by `/pages/curriculum/GCSE/statistics/sampling/collectingData/practiceDataCollection.html`
- `/pages/curriculum/GCSE/statistics/sampling/collectingData/discreteAndContinuous.html` — Discrete and continuous data: Counts that move in steps against measurements that can take any value. — drilled by `/pages/curriculum/GCSE/statistics/sampling/collectingData/practiceDiscreteAndContinuous.html`
- `/pages/curriculum/GCSE/statistics/sampling/collectingData/primaryAndSecondaryData.html` — Primary and secondary data: Data collected yourself against someone else's records, and what each costs. — drilled by `/pages/curriculum/GCSE/statistics/sampling/collectingData/practicePrimaryAndSecondaryData.html`
- `/pages/curriculum/GCSE/statistics/sampling/collectingData/collectionSheets.html` — Data collection sheets: Designing collection sheets whose classes cover every value without overlapping. — drilled by `/pages/curriculum/GCSE/statistics/sampling/collectingData/practiceCollectionSheets.html`
- `/pages/curriculum/GCSE/statistics/sampling/collectingData/questionnaires.html` — Writing questionnaire questions: Non-overlapping response boxes, and the leading question that skews replies. — drilled by `/pages/curriculum/GCSE/statistics/sampling/collectingData/practiceDataCollectionReview.html`


**`/pages/curriculum/GCSE/statistics/presenting/` — Presenting data** *(topic menu, 5 groups, 25 teaching pages, 8 Higher only)*

*`/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/` — Charts for categorical and discrete data* (group menu) — Frequency tables, then the charts drawn from them: bars, pictograms and pies. Drills: `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceGroupedFrequencyTables.html`, `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceBarCharts.html`, `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceDualAndCompositeBarCharts.html`, `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practicePictograms.html`, `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceVerticalLineCharts.html`, `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceCharts.html`, `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceChartsReview.html`.

- `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/frequencyTables.html` — Frequency tables: Tallying raw data into a frequency table and reading totals back out.
- `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/groupedFrequencyTables.html` — Grouped frequency tables: Sorting continuous data into inequality classes, one class for every value. — drilled by `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceGroupedFrequencyTables.html`
- `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/barCharts.html` — Bar charts: Drawing and reading bar charts: equal-width bars, gaps and a labelled axis. — drilled by `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceBarCharts.html`
- `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/dualAndCompositeBarCharts.html` — Dual and composite bar charts: Two data sets on one chart, side by side or stacked, and reading a component. — drilled by `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceDualAndCompositeBarCharts.html`
- `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/pictograms.html` — Pictograms: Drawing and reading pictograms, where the key fixes what one symbol is worth. — drilled by `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practicePictograms.html`
- `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/verticalLineCharts.html` — Vertical line charts: The chart for ungrouped discrete numerical data, with bars shrunk to lines. — drilled by `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceVerticalLineCharts.html`
- `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/drawingPieCharts.html` — Drawing a pie chart: Turning frequencies into sector angles that total 360°, checked before drawing. — drilled by `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceCharts.html`
- `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/interpretingPieCharts.html` — Interpreting a pie chart: Frequencies and proportions read from sector angles, and the comparison trap. — drilled by `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceChartsReview.html`

*`/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/` — Diagrams for grouped data* (group menu) — Both tiers: stem-and-leaf, frequency polygons and equal-width histograms. Drills: `/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/practiceFrequencyDiagrams.html`, `/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/practiceBackToBackStemAndLeaf.html`, `/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/practiceFrequencyPolygons.html`, `/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/practiceFrequencyDiagramsReview.html`.

- `/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/stemAndLeafDiagrams.html` — Stem-and-leaf diagrams: Splitting each value into stem and leaf under a key, with the leaves ordered. — drilled by `/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/practiceFrequencyDiagrams.html`
- `/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/backToBackStemAndLeaf.html` — Back-to-back stem-and-leaf diagrams: Two data sets sharing one set of stems, with left-hand leaves read outwards. — drilled by `/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/practiceBackToBackStemAndLeaf.html`
- `/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/frequencyPolygons.html` — Frequency polygons: Plotting each class frequency at its midpoint, not at the class boundaries. — drilled by `/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/practiceFrequencyPolygons.html`
- `/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/equalWidthHistograms.html` — Histograms with equal class widths: Frequency diagrams for continuous data, where the bars touch with no gaps. — drilled by `/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/practiceFrequencyDiagramsReview.html`

*`/pages/curriculum/GCSE/statistics/presenting/timeSeriesAndScatter/` — Time series and scatter graphs* (group menu) — Paired values plotted: readings over time, or one measurement against another. Drills: `/pages/curriculum/GCSE/statistics/presenting/timeSeriesAndScatter/practiceTimeSeries.html`, `/pages/curriculum/GCSE/statistics/presenting/timeSeriesAndScatter/practiceTimeSeriesReview.html`.

- `/pages/curriculum/GCSE/statistics/presenting/timeSeriesAndScatter/timeSeriesGraphs.html` — Time series graphs: Readings taken at regular intervals, plotted and read as a line graph. — drilled by `/pages/curriculum/GCSE/statistics/presenting/timeSeriesAndScatter/practiceTimeSeries.html`
- `/pages/curriculum/GCSE/statistics/presenting/timeSeriesAndScatter/trendsAndSeasonality.html` — Trends and seasonal patterns: Describing the long-term trend beneath a repeating seasonal pattern. — drilled by `/pages/curriculum/GCSE/statistics/presenting/timeSeriesAndScatter/practiceTimeSeriesReview.html`
- `/pages/curriculum/GCSE/statistics/presenting/timeSeriesAndScatter/plottingScatterGraphs.html` — Plotting a scatter graph: Plotting bivariate data as one point per pair, and why points are never joined.

*`/pages/curriculum/GCSE/statistics/presenting/usingChartsHonestly/` — Using charts honestly* (group menu) — Matching diagram to data, and the tricks that make an honest data set lie.

- `/pages/curriculum/GCSE/statistics/presenting/usingChartsHonestly/choosingTheRightChart.html` — Choosing the right chart: Matching the diagram to the data, and the charts that never fit.
- `/pages/curriculum/GCSE/statistics/presenting/usingChartsHonestly/misleadingGraphs.html` — Misleading graphs: Truncated axes, uneven scales, and stating precisely why a graph exaggerates.

*`/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/` — Histograms, cumulative frequency and box plots* (group menu) — Higher tier: frequency density, cumulative frequency curves and box plots. Drills: `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceHistograms.html`, `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceDrawingHistograms.html`, `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceInterpretingHistograms.html`, `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceCumulative.html`, `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceReadingCumulativeFrequencyGraphs.html`, `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceDrawingBoxPlots.html`, `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceHistogramsReview.html`, `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceCumulativeReview.html`.

- `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/frequencyDensity.html` — Frequency density **(H)**: Why unequal class widths force frequency onto area via frequency density. — drilled by `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceHistograms.html`
- `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/drawingHistograms.html` — Drawing a histogram **(H)**: Frequency densities for every class, with bar areas carrying the frequencies. — drilled by `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceDrawingHistograms.html`
- `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/interpretingHistograms.html` — Interpreting a histogram **(H)**: Frequencies from bar areas, and why the tallest bar need not hold the most data. — drilled by `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceInterpretingHistograms.html`
- `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/completingAHistogram.html` — Completing a histogram and its table **(H)**: Using one known bar to fix the density scale, then finishing the table and bars. — drilled by `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceHistogramsReview.html`
- `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/cumulativeFrequencyGraphs.html` — Cumulative frequency graphs **(H)**: Running totals plotted at upper class boundaries, joined by an S-shaped curve. — drilled by `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceCumulative.html`
- `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/readingCumulativeFrequencyGraphs.html` — Reading a cumulative frequency graph **(H)**: Estimating the median and quartiles from the curve, and counts above a point. — drilled by `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceReadingCumulativeFrequencyGraphs.html`
- `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/drawingBoxPlots.html` — Drawing a box plot **(H)**: The five values a box plot shows, from a list or a cumulative frequency graph. — drilled by `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceDrawingBoxPlots.html`
- `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/readingBoxPlots.html` — Reading a box plot **(H)**: The median, quartiles and range from a plot whose box holds the middle half. — drilled by `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceCumulativeReview.html`


**`/pages/curriculum/GCSE/statistics/averages/` — Averages and spread** *(topic menu, 4 groups, 15 teaching pages, 2 Higher only)*

*`/pages/curriculum/GCSE/statistics/averages/averagesFromAList/` — Averages and range from a list* (group menu) — The three averages and the range of a raw list, and which one to trust. Drills: `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceTheMode.html`, `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceTheMedian.html`, `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceMeanMedianMode.html`, `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceTheRange.html`, `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceChoosingTheAverage.html`, `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceWorkingBackwardsFromTheMean.html`, `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceMeanMedianModeReview.html`.

- `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/theMode.html` — The mode: The most frequent value in a data set, including sets with two modes or none. — drilled by `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceTheMode.html`
- `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/theMedian.html` — The median: The middle value of ordered data, and the halfway pair when the count is even. — drilled by `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceTheMedian.html`
- `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/theMean.html` — The mean: The total shared equally across the count, and why one extreme drags the mean. — drilled by `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceMeanMedianMode.html`
- `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/theRange.html` — The range: Largest minus smallest as a measure of spread, not an average. — drilled by `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceTheRange.html`
- `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/choosingTheAverage.html` — Choosing which average to use: Mode for categories, median against extremes, mean when every value counts. — drilled by `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceChoosingTheAverage.html`
- `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/workingBackwardsFromTheMean.html` — Working backwards from the mean: Recovering the total from a stated mean to find a missing value. — drilled by `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceWorkingBackwardsFromTheMean.html`
- `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/combinedMeans.html` — The mean of a combined group: Combining two groups through their totals, not by averaging the two means. — drilled by `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceMeanMedianModeReview.html`

*`/pages/curriculum/GCSE/statistics/averages/averagesFromTables/` — Averages from frequency tables* (group menu) — The mean, median, mode and range read or calculated from a frequency table. Drills: `/pages/curriculum/GCSE/statistics/averages/averagesFromTables/practiceAverages.html`, `/pages/curriculum/GCSE/statistics/averages/averagesFromTables/practiceMedianFromAFrequencyTable.html`, `/pages/curriculum/GCSE/statistics/averages/averagesFromTables/practiceModeAndRangeFromATable.html`, `/pages/curriculum/GCSE/statistics/averages/averagesFromTables/practiceAveragesReview.html`.

- `/pages/curriculum/GCSE/statistics/averages/averagesFromTables/meanFromAFrequencyTable.html` — The mean from a frequency table: Multiplying each value by its frequency, then dividing by the total frequency. — drilled by `/pages/curriculum/GCSE/statistics/averages/averagesFromTables/practiceAverages.html`
- `/pages/curriculum/GCSE/statistics/averages/averagesFromTables/medianFromAFrequencyTable.html` — The median from a frequency table: Counting through the frequencies to the middle, without rewriting the list. — drilled by `/pages/curriculum/GCSE/statistics/averages/averagesFromTables/practiceMedianFromAFrequencyTable.html`
- `/pages/curriculum/GCSE/statistics/averages/averagesFromTables/modeAndRangeFromATable.html` — Mode and range from a frequency table: Both read from the value column, not from the largest frequency. — drilled by `/pages/curriculum/GCSE/statistics/averages/averagesFromTables/practiceModeAndRangeFromATable.html`

*`/pages/curriculum/GCSE/statistics/averages/averagesFromGroupedData/` — Averages from grouped data* (group menu) — The modal class, median class and estimated mean once the raw values are gone. Drills: `/pages/curriculum/GCSE/statistics/averages/averagesFromGroupedData/practiceModalClass.html`, `/pages/curriculum/GCSE/statistics/averages/averagesFromGroupedData/practiceMedianClass.html`, `/pages/curriculum/GCSE/statistics/averages/averagesFromTables/practiceAveragesReview.html`.

- `/pages/curriculum/GCSE/statistics/averages/averagesFromGroupedData/modalClass.html` — The modal class: The class with the highest frequency, stated as an interval, not a value. — drilled by `/pages/curriculum/GCSE/statistics/averages/averagesFromGroupedData/practiceModalClass.html`
- `/pages/curriculum/GCSE/statistics/averages/averagesFromGroupedData/medianClass.html` — The class containing the median: Finding the middle position, then counting through the classes to reach it. — drilled by `/pages/curriculum/GCSE/statistics/averages/averagesFromGroupedData/practiceMedianClass.html`
- `/pages/curriculum/GCSE/statistics/averages/averagesFromGroupedData/estimatedMean.html` — Estimating the mean of grouped data: Class midpoints standing in for the values, making the result an estimate. — drilled by `/pages/curriculum/GCSE/statistics/averages/averagesFromTables/practiceAveragesReview.html`

*`/pages/curriculum/GCSE/statistics/averages/quartiles/` — Quartiles and the interquartile range* (group menu) — The Higher-tier measures of spread: quartiles and the range of the middle half. Drills: `/pages/curriculum/GCSE/statistics/averages/quartiles/practiceQuartiles.html`, `/pages/curriculum/GCSE/statistics/averages/quartiles/practiceQuartilesReview.html`.

- `/pages/curriculum/GCSE/statistics/averages/quartiles/quartilesFromAList.html` — Quartiles from a list **(H)**: The lower and upper quartiles of an ordered list, at the quarter positions. — drilled by `/pages/curriculum/GCSE/statistics/averages/quartiles/practiceQuartiles.html`
- `/pages/curriculum/GCSE/statistics/averages/quartiles/interquartileRange.html` — The interquartile range **(H)**: Upper quartile minus lower, measuring a spread outliers cannot inflate. — drilled by `/pages/curriculum/GCSE/statistics/averages/quartiles/practiceQuartilesReview.html`


**`/pages/curriculum/GCSE/statistics/interpretation/` — Interpretation** *(topic menu, 2 groups, 10 teaching pages, 1 Higher only)*

*`/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/` — Correlation and lines of best fit* (group menu) — The relationship read from a scatter graph, and when the line stops helping. Drills: `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/practiceScatter.html`, `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/practiceLinesOfBestFit.html`, `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/practiceInterpolation.html`, `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/practiceExtrapolation.html`, `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/practiceScatterReview.html`.

- `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/describingCorrelation.html` — Describing correlation: Positive, negative or no correlation, strong or weak, read from the points. — drilled by `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/practiceScatter.html`
- `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/linesOfBestFit.html` — The line of best fit: A straight line by eye through the points, never forced through the origin. — drilled by `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/practiceLinesOfBestFit.html`
- `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/interpolation.html` — Estimating with a line of best fit: Reading an estimate off the line inside the data range, and its reliability. — drilled by `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/practiceInterpolation.html`
- `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/extrapolation.html` — The danger of extrapolation: Why extending the line beyond the plotted data gives unsupported estimates. — drilled by `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/practiceExtrapolation.html`
- `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/correlationAndCausation.html` — Correlation is not causation: Why two quantities can rise together without one causing the other. — drilled by `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/practiceScatterReview.html`

*`/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/` — Comparing distributions and drawing conclusions* (group menu) — Setting two data sets side by side, with an average and a measure of spread. Drills: `/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/practiceOutliers.html`, `/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/practiceComparingData.html`, `/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/practiceComparingDataReview.html`.

- `/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/outliers.html` — Outliers: Spotting a value far from the rest, and whether it is an error or genuine. — drilled by `/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/practiceOutliers.html`
- `/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/comparingWithMeanAndRange.html` — Comparing data sets with an average and the range: A fair comparison pairs an average with a measure of spread, both in context. — drilled by `/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/practiceComparingData.html`
- `/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/describingAPopulation.html` — Describing a population with statistics: Using sample statistics to describe the population, and the caveats they carry.
- `/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/limitsOfConclusions.html` — The limits of a conclusion: What a data set cannot show: small samples, bias and overreaching claims. — drilled by `/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/practiceComparingDataReview.html`
- `/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/comparingWithBoxPlots.html` — Comparing distributions with box plots **(H)**: Comparing medians and interquartile ranges read from two box plots, in context.

---

## A level

Nineteen pages. Pure carries the majority of the marks and should be built
before the applied components.

### Pure mathematics

**`/pages/curriculum/ALevel/pure/proof.html` — Proof**
- Cover: proof by deduction, by exhaustion, by counter-example and by contradiction; the irrationality of √2; the infinitude of the primes; the implication and equivalence symbols; how to structure and write an argument.
- Misconception: a worked example offered as a proof; converse assumed from implication.

**`/pages/curriculum/ALevel/pure/algebra.html` — Algebra and functions**
- Cover: index laws; surds and rationalisation; quadratics, the discriminant and completing the square; simultaneous equations; inequalities; polynomials, the factor and remainder theorems; algebraic division; partial fractions; the modulus function; curve sketching and graph transformations; functions, composite and inverse, domain and range.
- Misconception: domain restrictions dropped when forming an inverse.

**`/pages/curriculum/ALevel/pure/coordinate.html` — Coordinate geometry**
- Cover: straight lines; circles, their equation, tangents and chords; parametric equations and conversion to Cartesian form; curve sketching from parametric form.
- Misconception: the circle equation's centre sign read straight from the brackets.

**`/pages/curriculum/ALevel/pure/sequences.html` — Sequences and series**
- Cover: arithmetic and geometric sequences and series; sigma notation; sum to infinity and the condition for convergence; binomial expansion for positive integer index; binomial expansion for rational or negative index with its interval of validity; recurrence relations; increasing, decreasing and periodic sequences.
- Misconception: applying the sum to infinity without checking the common ratio.

**`/pages/curriculum/ALevel/pure/trigonometry.html` — Trigonometry**
- Cover: radians; arc length and sector area; exact values; graphs and their transformations; Pythagorean, addition and double-angle identities; the R-form; reciprocal and inverse trigonometric functions; solving equations over a stated interval; small-angle approximations.
- Misconception: losing solutions by dividing through by a trigonometric term.

**`/pages/curriculum/ALevel/pure/exponentials.html` — Exponentials and logarithms**
- Cover: exponential functions and `e`; the natural logarithm; laws of logarithms; solving exponential equations; growth and decay models; linearising with logarithms and reading a log plot.
- Misconception: `log(a + b)` expanded as a sum of logs.

**`/pages/curriculum/ALevel/pure/differentiation.html` — Differentiation**
- Cover: differentiation from first principles; power, product, quotient and chain rules; derivatives of trigonometric, exponential and logarithmic functions; stationary points and their nature; the second derivative and convexity; connected rates of change; implicit and parametric differentiation; tangents and normals.
- Misconception: a zero second derivative taken as proof of a point of inflection.

**`/pages/curriculum/ALevel/pure/integration.html` — Integration**
- Cover: integration as the reverse of differentiation; definite integrals and area; standard integrals; integration by substitution; by parts; using partial fractions; areas between curves; the trapezium rule; separable differential equations and their use in modelling.
- Misconception: a definite integral read as area when the curve crosses the axis.

**`/pages/curriculum/ALevel/pure/numerical.html` — Numerical methods**
- Cover: locating roots by change of sign; fixed-point iteration with staircase and cobweb diagrams; the Newton–Raphson method and the cases where it fails; the trapezium rule and the direction of its error; the limits of numerical methods.
- Misconception: no sign change taken as proof of no root.

**`/pages/curriculum/ALevel/pure/vectors.html` — Vectors**
- Cover: vectors in two and three dimensions; magnitude and direction; unit vectors; position vectors; vector arithmetic; distance between two points; geometric problems and proofs.
- Misconception: adding vectors component-wise but comparing them by magnitude alone.

### Statistics

**`/pages/curriculum/ALevel/statistics/sampling.html` — Statistical sampling**
- Cover: population, sample and sampling frame; simple random, systematic, stratified, quota and opportunity sampling; the advantages and limitations of each; working with the prescribed large data set.
- Misconception: stratified and quota sampling treated as interchangeable.

**`/pages/curriculum/ALevel/statistics/presentation.html` — Data presentation and interpretation**
- Cover: histograms, box plots and cumulative frequency; measures of location and spread including variance and standard deviation; coding; identifying and handling outliers; bivariate data, correlation, regression lines and the limits of their interpretation.
- Misconception: a regression line used to predict outside the sampled range.

**`/pages/curriculum/ALevel/statistics/probability.html` — Probability**
- Cover: sample space; mutually exclusive and independent events; Venn diagrams and set notation; conditional probability and its formula; tree diagrams.
- Misconception: mutually exclusive events assumed independent.

**`/pages/curriculum/ALevel/statistics/distributions.html` — Statistical distributions**
- Cover: discrete random variables and their distributions; the binomial distribution and the conditions for its use; the normal distribution, standardisation and the inverse normal; normal approximation to the binomial **(where the specification requires it)**; choosing an appropriate model.
- Misconception: applying the binomial where trials are not independent.

**`/pages/curriculum/ALevel/statistics/hypothesis.html` — Hypothesis testing**
- Cover: null and alternative hypotheses; one- and two-tailed tests; critical regions and p-values; significance levels; tests for a binomial proportion, for a normal mean and for a correlation coefficient; interpreting the outcome in context; Type I errors.
- Misconception: "accepting" the null hypothesis; the p-value read as the probability the hypothesis is true.

### Mechanics

**`/pages/curriculum/ALevel/mechanics/quantities.html` — Quantities and units**
- Cover: SI base and derived units; scalars and vectors; standard modelling assumptions — particle, light, inextensible, smooth, rigid; the value of `g` and its effect on accuracy.
- Misconception: modelling assumptions treated as facts about the real situation.

**`/pages/curriculum/ALevel/mechanics/kinematics.html` — Kinematics**
- Cover: displacement, velocity and acceleration; motion graphs, their gradients and areas; the constant-acceleration formulae; vertical motion under gravity; variable acceleration using calculus; vectors in kinematics; projectiles.
- Misconception: applying the constant-acceleration formulae where acceleration varies.

**`/pages/curriculum/ALevel/mechanics/forces.html` — Forces and Newton's laws**
- Cover: force diagrams; Newton's three laws; weight, normal reaction, tension and thrust; friction and the coefficient of friction; connected particles and pulleys; motion on an inclined plane; equilibrium.
- Misconception: normal reaction assumed equal to weight on a slope.

**`/pages/curriculum/ALevel/mechanics/moments.html` — Moments**
- Cover: the moment of a force; the principle of moments; equilibrium of rigid bodies; uniform and non-uniform rods; reaction forces at supports; the point of tilting.
- Misconception: taking moments about a point while omitting a force that acts through it.

---

## Practice pages

One hundred and thirty-eight pages, listed on the deepest menu level — the
group menus for GCSE, the topic menus elsewhere. Each drills one
skill. The aim is that no topic on the site can be read without a matching place
to prove you can actually do it.

The "Taught on" column is the pairing described above: the topic page that holds
the method this page tests. All but one are paired; the exception is
flagged in the table. Nothing in a "Drills" cell should ever be explained
on the practice page itself.

### Key Stage 1 — `/pages/curriculum/KS1/`

| Page | Drills | Taught on |
| --- | --- | --- |
| `/pages/curriculum/KS1/practiceSubitising.html` | Recognising 1–6 without counting; dice, dominoes, ten-frames; grouped patterns up to 10 | — *standalone, see Pairing* |
| `/pages/curriculum/KS1/practiceCountingSteps.html` | Counting on and back in 2s, 5s and 10s from any start | `/pages/curriculum/KS1/numberPlaceValue.html` |
| `/pages/curriculum/KS1/practiceNumberBonds.html` | All pairs to 10 and 20, both directions, timed | `/pages/curriculum/KS1/additionSubtraction.html` |
| `/pages/curriculum/KS1/practiceAddSubtract20.html` | Addition and subtraction within 20, including missing numbers | `/pages/curriculum/KS1/additionSubtraction.html` |
| `/pages/curriculum/KS1/practiceTimesTables.html` | 2, 5 and 10 tables with the matching division facts | `/pages/curriculum/KS1/multiplicationDivision.html` |
| `/pages/curriculum/KS1/practiceDoublingHalving.html` | Doubles and halves to 20, and the link between them | `/pages/curriculum/KS1/multiplicationDivision.html` |
| `/pages/curriculum/KS1/practiceHalvesQuarters.html` | Halves and quarters of shapes and of quantities | `/pages/curriculum/KS1/fractions.html` |
| `/pages/curriculum/KS1/practiceTellingTime.html` | Hour, half past, quarter past and to, and five-minute intervals | `/pages/curriculum/KS1/measurement.html` |
| `/pages/curriculum/KS1/practiceMoney.html` | Coin recognition and making a total more than one way | `/pages/curriculum/KS1/measurement.html` |
| `/pages/curriculum/KS1/practiceNamingShapes.html` | Naming 2D and 3D shapes, including rotated and irregular cases | `/pages/curriculum/KS1/geometryShapes.html` |
| `/pages/curriculum/KS1/practicePositionTurns.html` | Whole, half and quarter turns; clockwise and anticlockwise | `/pages/curriculum/KS1/geometryPosition.html` |
| `/pages/curriculum/KS1/practicePictograms.html` | Reading tally charts and pictograms, one symbol to one and to many | `/pages/curriculum/KS1/statistics.html` |

### Key Stage 2 — `/pages/curriculum/KS2/`

| Page | Drills | Taught on |
| --- | --- | --- |
| `/pages/curriculum/KS2/practiceTimesTables.html` | All tables to 12 × 12, in and out of order, with division facts | `/pages/curriculum/KS2/multiplicationDivision.html` |
| `/pages/curriculum/KS2/practiceColumnMethods.html` | Column addition and subtraction, including exchange across zeros | `/pages/curriculum/KS2/additionSubtraction.html` |
| `/pages/curriculum/KS2/practiceLongMultiplication.html` | Up to four digits by two | `/pages/curriculum/KS2/multiplicationDivision.html` |
| `/pages/curriculum/KS2/practiceDivision.html` | Short and long division, remainders interpreted in context | `/pages/curriculum/KS2/multiplicationDivision.html` |
| `/pages/curriculum/KS2/practiceEquivalentFractions.html` | Simplifying, comparing and ordering | `/pages/curriculum/KS2/fractionsDecimalsPercentages.html` |
| `/pages/curriculum/KS2/practiceFractionArithmetic.html` | Adding, subtracting and multiplying fractions | `/pages/curriculum/KS2/fractionsDecimalsPercentages.html` |
| `/pages/curriculum/KS2/practiceFDPConversion.html` | Converting between all three forms in both directions | `/pages/curriculum/KS2/fractionsDecimalsPercentages.html` |
| `/pages/curriculum/KS2/practicePlaceValueRounding.html` | Large numbers, negatives, rounding to any power of ten | `/pages/curriculum/KS2/numberPlaceValue.html` |
| `/pages/curriculum/KS2/practiceScalingProportion.html` | Scale factors, unit pricing, percentages of an amount | `/pages/curriculum/KS2/ratioProportion.html` |
| `/pages/curriculum/KS2/practiceFormulaeSequences.html` | Missing numbers, simple formulae, continuing a sequence | `/pages/curriculum/KS2/algebra.html` |
| `/pages/curriculum/KS2/practicePerimeterAreaVolume.html` | Rectangles, compound shapes, triangles, cuboids | `/pages/curriculum/KS2/measurement.html` |
| `/pages/curriculum/KS2/practiceMeasuringAngles.html` | Reading and drawing angles, including reflex | `/pages/curriculum/KS2/geometryShapes.html` |
| `/pages/curriculum/KS2/practiceCoordinates.html` | Plotting and reading points in four quadrants | `/pages/curriculum/KS2/geometryPosition.html` |
| `/pages/curriculum/KS2/practiceAverages.html` | Mean from a list, and working backwards from a mean | `/pages/curriculum/KS2/statistics.html` |

### Key Stage 3 — `/pages/curriculum/KS3/`

| Page | Drills | Taught on |
| --- | --- | --- |
| `/pages/curriculum/KS3/practiceNegatives.html` | Four operations with directed numbers | `/pages/curriculum/KS3/number.html` |
| `/pages/curriculum/KS3/practiceFactorsPrimes.html` | Prime factorisation, HCF and LCM | `/pages/curriculum/KS3/number.html` |
| `/pages/curriculum/KS3/practiceIndexLaws.html` | Multiplying, dividing and raising powers | `/pages/curriculum/KS3/number.html` |
| `/pages/curriculum/KS3/practiceExpandFactorise.html` | Single brackets and common factors | `/pages/curriculum/KS3/algebra.html` |
| `/pages/curriculum/KS3/practiceLinearEquations.html` | Solving equations and rearranging formulae | `/pages/curriculum/KS3/algebra.html` |
| `/pages/curriculum/KS3/practiceRatioPercentage.html` | Ratio sharing and percentage multipliers | `/pages/curriculum/KS3/ratio.html` |
| `/pages/curriculum/KS3/practiceAngleRules.html` | Parallel lines, triangles and polygons, with reasons | `/pages/curriculum/KS3/geometry.html` |
| `/pages/curriculum/KS3/practiceProbability.html` | Single events, sample space diagrams, expected frequency | `/pages/curriculum/KS3/probability.html` |
| `/pages/curriculum/KS3/practiceAveragesRange.html` | Averages from lists and from frequency tables | `/pages/curriculum/KS3/statistics.html` |

### GCSE — 396 pages

| Page | Drills | Available after |
| --- | --- | --- |
| `/pages/curriculum/GCSE/number/structure/writtenMethods/practicePlaceValue.html` | What each digit is worth in integers and decimals, and zeros as place-holders | `/pages/curriculum/GCSE/number/structure/writtenMethods/placeValue.html` |
| `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceOrderingNumbers.html` | Ordering numbers, including negatives and decimals of different lengths | `/pages/curriculum/GCSE/number/structure/writtenMethods/orderingNumbers.html` |
| `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceInequalitySymbols.html` | The less-than, greater-than, at-most, at-least and not-equal signs | `/pages/curriculum/GCSE/number/structure/writtenMethods/inequalitySymbols.html` |
| `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceWrittenMethods.html` | Adding integers and decimals in columns, lining up the point and carrying | `/pages/curriculum/GCSE/number/structure/writtenMethods/columnAddition.html` |
| `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceColumnSubtraction.html` | Subtracting in columns with exchange, lining up decimals of different lengths | `/pages/curriculum/GCSE/number/structure/writtenMethods/columnSubtraction.html` |
| `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceExchangingAcrossZeros.html` | Subtracting when a column holds a zero, and where the exchange comes from | `/pages/curriculum/GCSE/number/structure/writtenMethods/exchangingAcrossZeros.html` |
| `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceLongMultiplication.html` | Multiplying multi-digit integers, and the place-holder zero in the second row | `/pages/curriculum/GCSE/number/structure/writtenMethods/longMultiplication.html` |
| `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceDivision.html` | Dividing by a one-digit number, carrying each remainder into the next digit | `/pages/curriculum/GCSE/number/structure/writtenMethods/shortDivision.html` |
| `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceInterpretingRemainders.html` | Whether a worded answer wants a remainder, a decimal, a fraction or rounding | `/pages/curriculum/GCSE/number/structure/writtenMethods/interpretingRemainders.html` |
| `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceLongDivision.html` | Dividing by a two-digit number, continuing past the point for an exact answer | `/pages/curriculum/GCSE/number/structure/writtenMethods/longDivision.html` |
| `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceGivenCalculation.html` | Deducing new decimal products and quotients from one stated calculation, without recalculating | `/pages/curriculum/GCSE/number/structure/writtenMethods/usingAGivenCalculation.html` |
| `/pages/curriculum/GCSE/number/structure/powersAndRoots/practicePowersRoots.html` | What the base and index mean, and writing repeated multiplication as a power | `/pages/curriculum/GCSE/number/structure/powersAndRoots/indexNotation.html` |
| `/pages/curriculum/GCSE/number/structure/powersAndRoots/practiceRecognisingPowers.html` | The squares, cubes and powers of 2, 3, 4 and 5 worth recalling | `/pages/curriculum/GCSE/number/structure/powersAndRoots/recognisingPowers.html` |
| `/pages/curriculum/GCSE/number/structure/powersAndRoots/practiceSquareRoots.html` | The square root as the inverse of squaring, found by reversing a known square | `/pages/curriculum/GCSE/number/structure/powersAndRoots/squareRoots.html` |
| `/pages/curriculum/GCSE/number/structure/powersAndRoots/practicePositiveAndNegativeRoots.html` | Why a squared equation has two solutions while the root sign gives one | `/pages/curriculum/GCSE/number/structure/powersAndRoots/positiveAndNegativeRoots.html` |
| `/pages/curriculum/GCSE/number/structure/powersAndRoots/practiceCubeAndHigherRoots.html` | Cube roots and nth roots as the inverse of a power, including negatives | `/pages/curriculum/GCSE/number/structure/powersAndRoots/cubeAndHigherRoots.html` |
| `/pages/curriculum/GCSE/number/structure/directedNumber/practiceNegatives.html` | Number-line reasoning, two signs meeting, and temperature differences | `/pages/curriculum/GCSE/number/structure/directedNumber/addingSubtractingNegatives.html` |
| `/pages/curriculum/GCSE/number/structure/directedNumber/practiceMultiplyingDividingNegatives.html` | The sign of a product or quotient, and what several negatives together do | `/pages/curriculum/GCSE/number/structure/directedNumber/multiplyingDividingNegatives.html` |
| `/pages/curriculum/GCSE/number/structure/directedNumber/practiceOrderOfOperations.html` | Brackets, powers and roots first, with the fraction bar as grouping | `/pages/curriculum/GCSE/number/structure/directedNumber/orderOfOperations.html` |
| `/pages/curriculum/GCSE/number/structure/directedNumber/practiceCheckingWithInverses.html` | Undoing a calculation with its inverse to test an answer without repeating it | `/pages/curriculum/GCSE/number/structure/directedNumber/checkingWithInverses.html` |
| `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceCounting.html` | Listing every factor of a number in pairs, so none is missed or repeated | `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/factorsAndFactorPairs.html` |
| `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practicePrimeFactors.html` | The multiples of a number, and the tests for divisibility by 2, 3, 4, 5 and 9 | `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/multiplesAndDivisibility.html` |
| `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practicePrimesAndPrimality.html` | What makes a number prime, why 1 is not, and trial division up to the root | `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/primesAndPrimality.html` |
| `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practicePrimeFactorisation.html` | Factor trees and repeated division, index form, and why the primes are unique | `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/primeFactorisation.html` |
| `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceHCFLCM.html` | Taking each shared prime to the lower index, and what the HCF means | `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/HCFFromPrimeFactors.html` |
| `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceLCMFromPrimeFactors.html` | Every prime to the higher index, and why the LCM is not always the product | `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/LCMFromPrimeFactors.html` |
| `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceHCFLCMVenn.html` | The Venn method for two or three numbers, and HCF times LCM as the product | `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/HCFLCMVenn.html` |
| `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceSquaresCubesFromPrimeFactors.html` | The smallest multiplier that turns a number into a perfect square or cube | `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/squaresCubesFromPrimeFactors.html` |
| `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceProductRule.html` | Multiplying numbers of choices for combined selections — the Higher-only product rule **(H)** | `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/productRuleCounting.html` |
| `/pages/curriculum/GCSE/number/structure/indexLaws/practiceSimplifyingPowers.html` | Adding the indices, derived by counting the repeated factors on each side | `/pages/curriculum/GCSE/number/structure/indexLaws/multiplyingPowers.html` |
| `/pages/curriculum/GCSE/number/structure/indexLaws/practiceDividingPowers.html` | Subtracting the indices, derived by cancelling the common repeated factors | `/pages/curriculum/GCSE/number/structure/indexLaws/dividingPowers.html` |
| `/pages/curriculum/GCSE/number/structure/indexLaws/practiceZeroIndex.html` | Why any non-zero number to the power zero is 1, read off the division law | `/pages/curriculum/GCSE/number/structure/indexLaws/zeroIndex.html` |
| `/pages/curriculum/GCSE/number/structure/indexLaws/practiceNegativeIndices.html` | A negative index as a reciprocal, making a number small rather than negative | `/pages/curriculum/GCSE/number/structure/indexLaws/negativeIndices.html` |
| `/pages/curriculum/GCSE/number/structure/indexLaws/practicePowerOfAPower.html` | Multiplying the indices, and telling this apart from multiplying powers | `/pages/curriculum/GCSE/number/structure/indexLaws/powerOfAPower.html` |
| `/pages/curriculum/GCSE/number/structure/indexLaws/practicePowerOfAProduct.html` | Applying an index to every factor in a bracket and both parts of a fraction | `/pages/curriculum/GCSE/number/structure/indexLaws/powerOfAProduct.html` |
| `/pages/curriculum/GCSE/number/structure/indexLaws/practiceNegativeIndexOfAFraction.html` | Inverting the fraction first, then applying the positive index | `/pages/curriculum/GCSE/number/structure/indexLaws/negativeIndexOfAFraction.html` |
| `/pages/curriculum/GCSE/number/structure/indexLaws/practiceUnitFractionalIndices.html` | The index one over n as the nth root, derived from raising a power to a power **(H)** | `/pages/curriculum/GCSE/number/structure/indexLaws/unitFractionalIndices.html` |
| `/pages/curriculum/GCSE/number/structure/indexLaws/practiceGeneralFractionalIndices.html` | The index m over n as a root and a power, and which one to take first **(H)** | `/pages/curriculum/GCSE/number/structure/indexLaws/generalFractionalIndices.html` |
| `/pages/curriculum/GCSE/number/structure/workingInStandardForm/practiceStandardFormLesson.html` | Converting both ways for large and small numbers, and correcting near-misses | `/pages/curriculum/GCSE/number/structure/workingInStandardForm/standardForm.html` |
| `/pages/curriculum/GCSE/number/structure/workingInStandardForm/practiceStandardFormOrdering.html` | Comparing by the power of ten first, then by the front number | `/pages/curriculum/GCSE/number/structure/workingInStandardForm/standardFormOrdering.html` |
| `/pages/curriculum/GCSE/number/structure/workingInStandardForm/practiceStandardFormMultiplyDivide.html` | Products, quotients and how-many-times-bigger comparisons | `/pages/curriculum/GCSE/number/structure/workingInStandardForm/standardFormMultiplyDivide.html` |
| `/pages/curriculum/GCSE/number/structure/usingACalculator/practiceCalculator.html` | Brackets, fractions, powers, roots and negatives keyed as written | `/pages/curriculum/GCSE/number/structure/usingACalculator/calculatorMethods.html` |
| `/pages/curriculum/GCSE/number/structure/usingACalculator/practiceCalculatorStandardForm.html` | The times-ten-to-the-power key, and reading answers off the display | `/pages/curriculum/GCSE/number/structure/usingACalculator/calculatorStandardForm.html` |
| `/pages/curriculum/GCSE/number/structure/usingACalculator/practiceCalculatorExactValues.html` | Toggling between an exact value and its decimal, and reading the full display | `/pages/curriculum/GCSE/number/structure/usingACalculator/calculatorExactValues.html` |
| `/pages/curriculum/GCSE/number/structure/usingACalculator/practiceExactAnswers.html` | Recognising and giving exact answers as fractions or multiples of π | `/pages/curriculum/GCSE/number/structure/usingACalculator/exactAnswers.html` |
| `/pages/curriculum/GCSE/number/structure/surds/practiceSimplifyingSurds.html` | Extracting the largest square factor to write a√b, and comparing surds **(H)** | `/pages/curriculum/GCSE/number/structure/surds/simplifyingSurds.html` |
| `/pages/curriculum/GCSE/number/structure/surds/practiceAddingSubtractingSurds.html` | Collecting like surds after simplifying every term **(H)** | `/pages/curriculum/GCSE/number/structure/surds/addingSubtractingSurds.html` |
| `/pages/curriculum/GCSE/number/structure/surds/practiceMultiplyingSurds.html` | Multiplying roots and coefficients separately, then simplifying the result **(H)** | `/pages/curriculum/GCSE/number/structure/surds/multiplyingSurds.html` |
| `/pages/curriculum/GCSE/number/structure/surds/practiceSquaringASurd.html` | Why a root times itself gives the number back, and what a coefficient does **(H)** | `/pages/curriculum/GCSE/number/structure/surds/squaringASurd.html` |
| `/pages/curriculum/GCSE/number/structure/surds/practiceDividingSurds.html` | Dividing under a single root, and simplifying quotients with coefficients **(H)** | `/pages/curriculum/GCSE/number/structure/surds/dividingSurds.html` |
| `/pages/curriculum/GCSE/number/structure/surds/practiceExpandingSurds.html` | Single and double brackets, squaring one, and the difference of two squares **(H)** | `/pages/curriculum/GCSE/number/structure/surds/expandingSurds.html` |
| `/pages/curriculum/GCSE/number/structure/surds/practiceRationalisingDenominators.html` | Clearing a single surd from the bottom of a fraction by multiplying by one **(H)** | `/pages/curriculum/GCSE/number/structure/surds/rationalisingDenominators.html` |
| `/pages/curriculum/GCSE/number/fractions/calculatingWithFractions/practiceMultiplyingDividingMixedNumbers.html` | Multiplying and dividing mixed numbers by converting to improper fractions | `/pages/curriculum/GCSE/number/fractions/calculatingWithFractions/multiplyingDividingMixedNumbers.html` |
| `/pages/curriculum/GCSE/number/measures/errorIntervals/practiceErrorIntervalsRounding.html` | The interval a rounded value came from, half a unit either side | `/pages/curriculum/GCSE/number/measures/errorIntervals/errorIntervalsRounding.html` |
| `/pages/curriculum/GCSE/number/structure/indexLaws/practiceIndexLaws.html` | Mixed review — Negative and fractional indices | `/pages/curriculum/GCSE/number/structure/indexLaws/negativeFractionalIndices.html` |
| `/pages/curriculum/GCSE/number/structure/workingInStandardForm/practiceStandardForm.html` | Mixed review — Converting and calculating. A marked test, with fresh numbers every attempt | `/pages/curriculum/GCSE/number/structure/workingInStandardForm/standardFormAddSubtract.html` |
| `/pages/curriculum/GCSE/number/structure/surds/practiceSurds.html` | Mixed review — Simplifying and rationalising denominators | `/pages/curriculum/GCSE/number/structure/surds/rationalisingConjugates.html` |
| `/pages/curriculum/GCSE/number/fractions/calculatingWithFractions/practiceFractionArithmetic.html` | Mixed review — The four operations with fractions and mixed numbers | `/pages/curriculum/GCSE/number/fractions/calculatingWithFractions/multiplyingDividingNegativeFractions.html` |
| `/pages/curriculum/GCSE/number/measures/roundingAndTruncation/practiceBounds.html` | Mixed review — Significant figures, error intervals and bounds | `/pages/curriculum/GCSE/number/measures/calculatingWithBounds/suitableAccuracyBounds.html` |
| `/pages/curriculum/GCSE/number/structure/writtenMethods/practicePlaceValueReview.html` | Mixed review — Decimal digit values, ordering with inequality symbols, and scaling by powers of ten | `/pages/curriculum/GCSE/number/structure/writtenMethods/powersOfTen.html` |
| `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceWrittenMethodsReview.html` | Mixed review — Column addition, subtraction and long multiplication with decimals throughout — past the KS2 integer drills | `/pages/curriculum/GCSE/number/structure/writtenMethods/multiplyingDecimals.html` |
| `/pages/curriculum/GCSE/number/structure/writtenMethods/practiceDivisionReview.html` | Mixed review — Short and long division with decimal answers, decimal divisors, and remainders interpreted in context | `/pages/curriculum/GCSE/number/structure/writtenMethods/dividingByDecimals.html` |
| `/pages/curriculum/GCSE/number/structure/powersAndRoots/practicePowersRootsReview.html` | Mixed review — Evaluating powers and roots without a calculator, both square roots, and spotting irrational results | `/pages/curriculum/GCSE/number/structure/surds/rationalAndIrrational.html` |
| `/pages/curriculum/GCSE/number/structure/directedNumber/practiceNegativesReview.html` | Mixed review — Directed-number arithmetic with decimals and powers of negatives — a step up from KS3 | `/pages/curriculum/GCSE/number/structure/directedNumber/powersOfNegatives.html` |
| `/pages/curriculum/GCSE/number/structure/directedNumber/practiceOrderOfOperationsReview.html` | Mixed review — Multi-step BIDMAS with indices, plus choosing valid reorderings and inverse checks | `/pages/curriculum/GCSE/number/structure/directedNumber/reorderingACalculation.html` |
| `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practicePrimeFactorsReview.html` | Mixed review — Divisibility, spotting primes, and reading squares, cubes and factor counts from prime factorisations | `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/countingFactors.html` |
| `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceHCFLCMReview.html` | Mixed review — HCF and LCM from prime factors, including three numbers and worded decisions | `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/choosingHCFOrLCM.html` |
| `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceCountingReview.html` | Mixed review — Counting factor pairs, arrangements and choices exactly by systematic listing | `/pages/curriculum/GCSE/number/structure/factorsAndPrimes/systematicListing.html` |
| `/pages/curriculum/GCSE/number/structure/indexLaws/practiceSimplifyingPowersReview.html` | Mixed review — The multiply, divide and power-of-a-power laws with number bases, plus index equations | `/pages/curriculum/GCSE/number/structure/indexLaws/indexEquations.html` |
| `/pages/curriculum/GCSE/number/structure/usingACalculator/practiceCalculatorReview.html` | Mixed review — Keying complex calculations, calculator standard form, and holding full accuracy to the final answer | `/pages/curriculum/GCSE/number/structure/usingACalculator/calculatorAnsMemory.html` |
| `/pages/curriculum/GCSE/algebra/notation/substitution/practiceSubstitution.html` | Replacing each letter with a number, then evaluating in the right order | `/pages/curriculum/GCSE/algebra/notation/substitution/substitutingIntoExpressions.html` |
| `/pages/curriculum/GCSE/algebra/notation/substitution/practiceSubstitutingNegatives.html` | Substituting a negative value with brackets, so the sign survives squaring | `/pages/curriculum/GCSE/algebra/notation/substitution/substitutingNegatives.html` |
| `/pages/curriculum/GCSE/algebra/notation/substitution/practiceSubstitutingWithPowers.html` | Why 3x² means square first then multiply by 3, so x = 4 gives 48 not 144 | `/pages/curriculum/GCSE/algebra/notation/substitution/substitutingWithPowers.html` |
| `/pages/curriculum/GCSE/algebra/notation/simplifying/practiceSimplifyingTerms.html` | Combining like terms, each term carrying the sign in front of it | `/pages/curriculum/GCSE/algebra/notation/simplifying/collectingLikeTerms.html` |
| `/pages/curriculum/GCSE/algebra/notation/simplifying/practiceLikeTermsWithPowers.html` | Why x and x² are unlike terms, and collecting expressions that mix them | `/pages/curriculum/GCSE/algebra/notation/simplifying/likeTermsWithPowers.html` |
| `/pages/curriculum/GCSE/algebra/notation/simplifying/practiceMultiplyingTerms.html` | Multiplying coefficients and letters separately, so 3a × 4b is 12ab | `/pages/curriculum/GCSE/algebra/notation/simplifying/multiplyingTerms.html` |
| `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/practiceExpandFactorise.html` | Multiplying every term in one bracket by every term in the other | `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/expandingDoubleBrackets.html` |
| `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/practiceDoubleBracketsWithCoefficients.html` | Expanding (2x + 3)(3x − 1), keeping track of the middle terms | `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/doubleBracketsWithCoefficients.html` |
| `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/practiceSquaringABracket.html` | Writing (x + 4)² as a full double bracket, never just x² + 16 | `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/squaringABracket.html` |
| `/pages/curriculum/GCSE/algebra/notation/factorising/practiceFactorisingQuadratics.html` | Factorising x² + bx + c from a pair of numbers that add to b and multiply to c | `/pages/curriculum/GCSE/algebra/notation/factorising/factorisingQuadratics.html` |
| `/pages/curriculum/GCSE/algebra/notation/formulae/practiceRearranging.html` | Rearranging a formula so a different letter stands alone on one side | `/pages/curriculum/GCSE/algebra/notation/formulae/changingTheSubject.html` |
| `/pages/curriculum/GCSE/algebra/notation/formulae/practiceRearrangingPowersAndRoots.html` | Changing the subject when it sits inside a square, a root or a fraction | `/pages/curriculum/GCSE/algebra/notation/formulae/rearrangingPowersAndRoots.html` |
| `/pages/curriculum/GCSE/algebra/notation/algebraicFractions/practiceAlgebraicFractions.html` | Factorising before cancelling, since only a factor cancels, never a term **(H)** | `/pages/curriculum/GCSE/algebra/notation/algebraicFractions/simplifyingAlgebraicFractions.html` |
| `/pages/curriculum/GCSE/algebra/notation/algebraicFractions/practiceMultiplyingDividingAlgebraicFractions.html` | Cancelling before multiplying, and dividing as multiplying by the reciprocal **(H)** | `/pages/curriculum/GCSE/algebra/notation/algebraicFractions/multiplyingDividingAlgebraicFractions.html` |
| `/pages/curriculum/GCSE/algebra/notation/functions/practiceFunctions.html` | Reading f(x) as the output at x, and evaluating f(3) and 2f(1) **(H)** | `/pages/curriculum/GCSE/algebra/notation/functions/functionNotation.html` |
| `/pages/curriculum/GCSE/algebra/notation/functions/practiceInverseFunctions.html` | Finding f⁻¹(x) by rearranging y = f(x), and how the inverse undoes it **(H)** | `/pages/curriculum/GCSE/algebra/notation/functions/inverseFunctions.html` |
| `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceStraightLines.html` | Measuring steepness as rise over run, the sign showing climb or fall | `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/gradientOfALine.html` |
| `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceGradientInterceptForm.html` | Reading the gradient and y-intercept straight from the equation | `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/gradientInterceptForm.html` |
| `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceReadingALineEquation.html` | Finding the intercept on the y-axis and the gradient from a whole-square triangle | `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/readingALineEquation.html` |
| `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceRearrangingLineEquations.html` | Rearranging equations like 2x + 3y = 6 before reading the gradient off | `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/rearrangingLineEquations.html` |
| `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceLineThroughAPoint.html` | Substituting the point into y = mx + c to find c, then writing the equation out | `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/lineThroughAPoint.html` |
| `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceLineThroughTwoPoints.html` | Finding the gradient from the two points, then the intercept from either | `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/lineThroughTwoPoints.html` |
| `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceParallelLines.html` | Lines with equal gradients never meet, and writing a parallel line’s equation | `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/parallelLines.html` |
| `/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/practiceQuadraticGraphs.html` | Reading roots off the x-axis and the intercept off the y-axis | `/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/quadraticRootsAndIntercepts.html` |
| `/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/practiceQuadraticTurningPoints.html` | Reading the minimum or maximum off the graph, halfway between the roots | `/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/quadraticTurningPoints.html` |
| `/pages/curriculum/GCSE/algebra/graphs/realLifeGraphs/practiceDistanceTime.html` | Speed as the gradient, rest as a flat section, not a picture of the road | `/pages/curriculum/GCSE/algebra/graphs/realLifeGraphs/distanceTimeGraphs.html` |
| `/pages/curriculum/GCSE/algebra/graphs/graphTransformations/practiceGraphTransformations.html` | The graph of f(x) + a as the original slid a units vertically **(H)** | `/pages/curriculum/GCSE/algebra/graphs/graphTransformations/verticalTranslations.html` |
| `/pages/curriculum/GCSE/algebra/graphs/graphTransformations/practiceHorizontalTranslations.html` | The graph of f(x + a) as a slide of a units, opposite to the sign **(H)** | `/pages/curriculum/GCSE/algebra/graphs/graphTransformations/horizontalTranslations.html` |
| `/pages/curriculum/GCSE/algebra/graphs/circle/practiceCircleEquation.html` | Why x² + y² = r² describes a circle centred at the origin **(H)** | `/pages/curriculum/GCSE/algebra/graphs/circle/circleEquation.html` |
| `/pages/curriculum/GCSE/algebra/graphs/circle/practiceTangentToACircle.html` | Finding the tangent’s equation from the radius it is perpendicular to **(H)** | `/pages/curriculum/GCSE/algebra/graphs/circle/tangentToACircle.html` |
| `/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceEquations.html` | Undoing operations in reverse order, keeping both sides balanced | `/pages/curriculum/GCSE/algebra/equations/linearEquations/solvingTwoStepEquations.html` |
| `/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceUnknownOnBothSides.html` | Collecting the unknowns on one side and the numbers on the other | `/pages/curriculum/GCSE/algebra/equations/linearEquations/unknownOnBothSides.html` |
| `/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceEquationsWithBrackets.html` | Expanding the brackets first, or dividing both sides straight away | `/pages/curriculum/GCSE/algebra/equations/linearEquations/equationsWithBrackets.html` |
| `/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceEquationsWithFractions.html` | Clearing fractions by multiplying every term by the common denominator | `/pages/curriculum/GCSE/algebra/equations/linearEquations/equationsWithFractions.html` |
| `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/practiceSolvingByFactorising.html` | Factorising, then setting each bracket to zero, since a factor must be zero | `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/solvingByFactorising.html` |
| `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/practiceQuadraticsMissingConstant.html` | Solving x² = 5x by factorising, since dividing by x loses the root x = 0 | `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/quadraticsMissingConstant.html` |
| `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/practiceRearrangingBeforeSolving.html` | Collecting everything on one side equal to zero before factorising **(H)** | `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/rearrangingBeforeSolving.html` |
| `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/practiceSolvingByCompletingTheSquare.html` | Solving from completed square form by rooting both sides, plus and minus **(H)** | `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/solvingByCompletingTheSquare.html` |
| `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceSimultaneous.html` | Adding or subtracting equations to remove one unknown, then substituting back | `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/simultaneousByElimination.html` |
| `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceScalingBeforeEliminating.html` | Multiplying one or both equations so a pair of coefficients match | `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/scalingBeforeEliminating.html` |
| `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceSimultaneousBySubstitution.html` | Replacing one unknown with an expression from the other equation | `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/simultaneousBySubstitution.html` |
| `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceFormingSimultaneousEquations.html` | Turning two facts about two unknowns into a pair of equations to solve | `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/formingSimultaneousEquations.html` |
| `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceLinearQuadraticSimultaneous.html` | Substituting the linear equation into the quadratic, pairing each x with its y **(H)** | `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/linearQuadraticSimultaneous.html` |
| `/pages/curriculum/GCSE/algebra/equations/inequalities/practiceInequalities.html` | Solving with the balance method while keeping the inequality sign, since the answer is a range, not a value | `/pages/curriculum/GCSE/algebra/equations/inequalities/solvingLinearInequalities.html` |
| `/pages/curriculum/GCSE/algebra/equations/inequalities/practiceReversingTheInequality.html` | Multiplying or dividing by a negative flips the sign, every time and not just sometimes | `/pages/curriculum/GCSE/algebra/equations/inequalities/reversingTheInequality.html` |
| `/pages/curriculum/GCSE/algebra/equations/inequalities/practiceIntegerSolutions.html` | Listing the whole numbers a solution range contains, checking whether each endpoint is in or out | `/pages/curriculum/GCSE/algebra/equations/inequalities/integerSolutions.html` |
| `/pages/curriculum/GCSE/algebra/equations/formingEquations/practiceFormingEquations.html` | Naming the unknown, turning the facts into an equation, and checking the answer back in the story | `/pages/curriculum/GCSE/algebra/equations/formingEquations/formingAnEquation.html` |
| `/pages/curriculum/GCSE/algebra/equations/formingEquations/practiceEquationsFromShapes.html` | Using angle sums, perimeters and areas to set up an equation, then answering the geometric question asked | `/pages/curriculum/GCSE/algebra/equations/formingEquations/equationsFromShapes.html` |
| `/pages/curriculum/GCSE/algebra/sequences/generatingSequences/practiceGeneratingSequences.html` | Continuing a sequence by the rule that moves one term to the next, stated with a starting term | `/pages/curriculum/GCSE/algebra/sequences/generatingSequences/termToTermRules.html` |
| `/pages/curriculum/GCSE/algebra/sequences/generatingSequences/practicePositionToTermRules.html` | Generating any term straight from its position, without stepping through every term before it | `/pages/curriculum/GCSE/algebra/sequences/generatingSequences/positionToTermRules.html` |
| `/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/practiceNthTerm.html` | The common difference as the multiplier of n, adjusted by a constant — a formula, not the rule add 4 | `/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/findingTheNthTerm.html` |
| `/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/practiceUsingAnNthTerm.html` | Finding a stated term, and testing whether a number belongs by solving for n and demanding a whole number | `/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/usingAnNthTerm.html` |
| `/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/practiceDecreasingSequences.html` | Sequences with a negative common difference, whose nth term starts with a negative multiple of n | `/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/decreasingSequences.html` |
| `/pages/curriculum/GCSE/algebra/sequences/quadraticSequences/practiceSpottingQuadraticSequences.html` | Taking differences twice, since a constant second difference is the signature of an n² term | `/pages/curriculum/GCSE/algebra/sequences/quadraticSequences/spottingQuadraticSequences.html` |
| `/pages/curriculum/GCSE/algebra/sequences/quadraticSequences/practiceQuadraticNthTerm.html` | Halving the second difference for the n² coefficient, then fixing what is left with a linear nth term **(H)** | `/pages/curriculum/GCSE/algebra/sequences/quadraticSequences/quadraticNthTerm.html` |
| `/pages/curriculum/GCSE/algebra/notation/expandingBrackets/practiceExpandFactoriseReview.html` | Mixed review — Double brackets, quadratics and the difference of two squares, in both directions | `/pages/curriculum/GCSE/algebra/notation/factorising/differenceOfTwoSquares.html` |
| `/pages/curriculum/GCSE/algebra/notation/simplifying/practiceSimplifyingTermsReview.html` | Mixed review — Collecting like terms and multiplying and dividing terms, signs and powers included | `/pages/curriculum/GCSE/algebra/notation/simplifying/dividingTerms.html` |
| `/pages/curriculum/GCSE/algebra/notation/substitution/practiceSubstitutionReview.html` | Mixed review — Evaluating expressions and formulae at given values, negatives and powers included | `/pages/curriculum/GCSE/algebra/notation/substitution/substitutingIntoFormulae.html` |
| `/pages/curriculum/GCSE/algebra/notation/formulae/practiceRearrangingReview.html` | Mixed review — Rearranging formulae, through squares, roots and a subject appearing twice | `/pages/curriculum/GCSE/algebra/notation/formulae/subjectAppearingTwice.html` |
| `/pages/curriculum/GCSE/algebra/notation/algebraicFractions/practiceAlgebraicFractionsReview.html` | Mixed review — Simplifying, multiplying, dividing, adding and subtracting algebraic fractions **(H)** | `/pages/curriculum/GCSE/algebra/notation/algebraicFractions/addingAlgebraicFractions.html` |
| `/pages/curriculum/GCSE/algebra/notation/functions/practiceFunctionsReview.html` | Mixed review — Evaluating functions, inverses and composites from formal notation **(H)** | `/pages/curriculum/GCSE/algebra/notation/functions/compositeFunctions.html` |
| `/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceEquationsReview.html` | Mixed review — Linear equations with brackets, fractions and unknowns on both sides, and quadratics by every method | `/pages/curriculum/GCSE/algebra/equations/quadraticEquations/quadraticFormula.html` |
| `/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceSimultaneousReview.html` | Mixed review — Elimination and substitution, worded pairs, and a linear equation with a quadratic | `/pages/curriculum/GCSE/algebra/equations/graphicalSolutions/whereTwoLinesCross.html` |
| `/pages/curriculum/GCSE/algebra/equations/inequalities/practiceInequalitiesReview.html` | Mixed review — Solving linear and double inequalities, listing integer solutions, and the sign that flips | `/pages/curriculum/GCSE/algebra/equations/inequalities/doubleInequalities.html` |
| `/pages/curriculum/GCSE/algebra/equations/formingEquations/practiceFormingEquationsReview.html` | Mixed review — Equations built from worded, angle and area problems, then solved exactly | `/pages/curriculum/GCSE/algebra/equations/formingEquations/problemsLeadingToQuadratics.html` |
| `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceStraightLinesReview.html` | Mixed review — Gradient, intercept, parallel and perpendicular | `/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/perpendicularLines.html` |
| `/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/practiceQuadraticGraphsReview.html` | Mixed review — Roots, intercepts and turning points read from a quadratic’s equation | `/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/sketchingQuadratics.html` |
| `/pages/curriculum/GCSE/algebra/graphs/realLifeGraphs/practiceDistanceTimeReview.html` | Mixed review — Speeds, rests and average speed from journeys described segment by segment | `/pages/curriculum/GCSE/algebra/graphs/realLifeGraphs/velocityTimeGraphs.html` |
| `/pages/curriculum/GCSE/algebra/graphs/graphTransformations/practiceGraphTransformationsReview.html` | Mixed review — Translations and reflections of a known graph, tracked through equations and points **(H)** | `/pages/curriculum/GCSE/algebra/graphs/graphTransformations/reflectingGraphs.html` |
| `/pages/curriculum/GCSE/algebra/graphs/circle/practiceCircleEquationReview.html` | Mixed review — Radius, points on a circle, and tangents at a given point **(H)** | `/pages/curriculum/GCSE/algebra/graphs/circle/lineMeetsCircle.html` |
| `/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/practiceNthTermReview.html` | Mixed review — Linear nth terms found and used, and quadratic nth terms at Higher | `/pages/curriculum/GCSE/algebra/sequences/quadraticSequences/usingAQuadraticNthTerm.html` |
| `/pages/curriculum/GCSE/algebra/sequences/generatingSequences/practiceGeneratingSequencesReview.html` | Mixed review — Terms produced from term-to-term, position-to-term and recurrence rules | `/pages/curriculum/GCSE/algebra/sequences/generatingSequences/recurrenceRelations.html` |
| `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceRatioNotation.html` | Recording comparisons with the colon, why order matters, and three-part ratios | `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/ratioNotation.html` |
| `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceSimplifyingRatios.html` | Dividing every part by the same factor, so 12 : 18 becomes 2 : 3 | `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/simplifyingRatios.html` |
| `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceRatiosWithUnits.html` | Converting to the same unit before simplifying, and why the ratio is unitless | `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/ratiosWithUnits.html` |
| `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceOneToNRatios.html` | Dividing both parts by one of them so scales and mixtures compare directly | `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/oneToNRatios.html` |
| `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practicePartToPartAndPartToWhole.html` | Telling the two kinds of ratio apart, and converting each into the other | `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/partToPartAndPartToWhole.html` |
| `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceFractionsOfTheWhole.html` | Reading the fraction of the whole each part represents, and working back | `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/fractionsOfTheWhole.html` |
| `/pages/curriculum/GCSE/ratio/ratio/sharing/practiceSharing.html` | Sharing an amount in a given ratio by finding the value of one part first | `/pages/curriculum/GCSE/ratio/ratio/sharing/dividingInARatio.html` |
| `/pages/curriculum/GCSE/ratio/ratio/sharing/practiceWhenOnePartIsKnown.html` | Recovering the total and the other shares when only one part's value is given | `/pages/curriculum/GCSE/ratio/ratio/sharing/whenOnePartIsKnown.html` |
| `/pages/curriculum/GCSE/ratio/ratio/sharing/practiceWhenTheDifferenceIsKnown.html` | Finding one part from the difference between shares, then rebuilding the total | `/pages/curriculum/GCSE/ratio/ratio/sharing/whenTheDifferenceIsKnown.html` |
| `/pages/curriculum/GCSE/ratio/ratio/sharing/practiceExpressingADivisionAsARatio.html` | Turning stated amounts back into a ratio in simplest form, in the order named | `/pages/curriculum/GCSE/ratio/ratio/sharing/expressingADivisionAsARatio.html` |
| `/pages/curriculum/GCSE/ratio/ratio/sharing/practiceMixingAndConcentrations.html` | Ratios in paint mixes and concentrations, and comparing mixture strengths | `/pages/curriculum/GCSE/ratio/ratio/sharing/mixingAndConcentrations.html` |
| `/pages/curriculum/GCSE/ratio/ratio/mapsAndScaleDrawings/practiceScaleDrawings.html` | The multiplier from object lengths to image lengths, and back by dividing | `/pages/curriculum/GCSE/ratio/ratio/mapsAndScaleDrawings/scaleFactors.html` |
| `/pages/curriculum/GCSE/ratio/ratio/mapsAndScaleDrawings/practiceScaleDrawingsLesson.html` | Using a stated scale such as 1 cm to 2 m to link drawing and real object | `/pages/curriculum/GCSE/ratio/ratio/mapsAndScaleDrawings/scaleDrawings.html` |
| `/pages/curriculum/GCSE/ratio/ratio/similarShapes/practiceSimilarShapes.html` | Finding missing lengths with the length factor from any corresponding pair | `/pages/curriculum/GCSE/ratio/ratio/similarShapes/lengthsInSimilarShapes.html` |
| `/pages/curriculum/GCSE/ratio/ratio/similarShapes/practiceAreasOfSimilarShapes.html` | Why the area scale factor is the square of the length factor, shown by tiling **(H)** | `/pages/curriculum/GCSE/ratio/ratio/similarShapes/areasOfSimilarShapes.html` |
| `/pages/curriculum/GCSE/ratio/ratio/similarShapes/practiceVolumesOfSimilarShapes.html` | Why the volume scale factor is the cube of the length factor, used both ways **(H)** | `/pages/curriculum/GCSE/ratio/ratio/similarShapes/volumesOfSimilarShapes.html` |
| `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceProportionAsEqualRatios.html` | Two pairs of quantities are in proportion when their ratios are equal | `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/proportionAsEqualRatios.html` |
| `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceProportion.html` | Direct proportion: multiply one quantity and the other multiplies the same way | `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/directProportion.html` |
| `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceUnitaryMethod.html` | Finding the value of one unit first, then scaling up to any number of units | `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/unitaryMethod.html` |
| `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceScalingARecipe.html` | Scaling every ingredient by the same factor, and serving-size questions | `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/scalingARecipe.html` |
| `/pages/curriculum/GCSE/ratio/proportion/usingInverseProportion/practiceInverseProportion.html` | Inverse proportion: multiply one, and the other divides by the same factor | `/pages/curriculum/GCSE/ratio/proportion/usingInverseProportion/inverseProportion.html` |
| `/pages/curriculum/GCSE/ratio/proportion/usingInverseProportion/practiceInverseProportionProblems.html` | Workers and time, speed and journey time, solved by finding the fixed product | `/pages/curriculum/GCSE/ratio/proportion/usingInverseProportion/inverseProportionProblems.html` |
| `/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/practiceProportionEquations.html` | Finding k from one pair of values, then using the equation in both directions **(H)** | `/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/directProportionEquations.html` |
| `/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/practiceInverseProportionEquations.html` | Writing inverse proportion as y = k/x, since it means proportional to 1/x **(H)** | `/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/inverseProportionEquations.html` |
| `/pages/curriculum/GCSE/ratio/percentage/multipliers/practicePercentageChange.html` | Adding the percentage to 100% as a decimal, so a 12% rise becomes ×1.12 | `/pages/curriculum/GCSE/ratio/percentage/multipliers/multipliersForIncrease.html` |
| `/pages/curriculum/GCSE/ratio/percentage/multipliers/practiceMultipliersForDecrease.html` | Subtracting the percentage from 100%, so a 15% fall becomes ×0.85, not ×0.15 | `/pages/curriculum/GCSE/ratio/percentage/multipliers/multipliersForDecrease.html` |
| `/pages/curriculum/GCSE/ratio/percentage/multipliers/practiceReadingAMultiplier.html` | Recovering the change a multiplier applies, where ×0.88 hides a 12% fall | `/pages/curriculum/GCSE/ratio/percentage/multipliers/readingAMultiplier.html` |
| `/pages/curriculum/GCSE/ratio/percentage/comparingChange/practiceProfitLoss.html` | Dividing the change by the original amount, never the new one, as a percentage | `/pages/curriculum/GCSE/ratio/percentage/comparingChange/measuringAChange.html` |
| `/pages/curriculum/GCSE/ratio/percentage/comparingChange/practiceProfitAndLoss.html` | Profit or loss as a percentage of the cost price the seller originally paid | `/pages/curriculum/GCSE/ratio/percentage/comparingChange/profitAndLoss.html` |
| `/pages/curriculum/GCSE/ratio/percentage/reverseProblems/practiceOriginalAfterAnIncrease.html` | Recovering the pre-increase amount by dividing by the multiplier, as with VAT | `/pages/curriculum/GCSE/ratio/percentage/reverseProblems/originalAfterAnIncrease.html` |
| `/pages/curriculum/GCSE/ratio/percentage/reverseProblems/practiceOriginalAfterADecrease.html` | Recovering the full price from a sale price by dividing by the multiplier | `/pages/curriculum/GCSE/ratio/percentage/reverseProblems/originalAfterADecrease.html` |
| `/pages/curriculum/GCSE/ratio/percentage/reverseProblems/practiceSpottingReverseProblems.html` | Deciding whether a question states the original amount or the changed one | `/pages/curriculum/GCSE/ratio/percentage/reverseProblems/spottingReverseProblems.html` |
| `/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/practiceSimpleInterest.html` | Interest paid on the starting amount only, so the same sum is added every year | `/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/simpleInterest.html` |
| `/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/practiceRepeatedChange.html` | Applying the same change repeatedly by raising the multiplier to a power | `/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/repeatedChange.html` |
| `/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/practiceSimpleVersusCompoundInterest.html` | Why the same rate pays differently under the two schemes, and the widening gap | `/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/simpleVersusCompoundInterest.html` |
| `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/practiceCompoundMeasures.html` | Using speed as distance per unit time to find any quantity from the other two | `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/speedDistanceTime.html` |
| `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/practiceAverageSpeed.html` | Total distance divided by total time, not an average of the two speeds | `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/averageSpeed.html` |
| `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/practiceDensityMassVolume.html` | Using density as mass per unit volume, with the units naming the formula | `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/densityMassVolume.html` |
| `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/practiceDensityOfAMixture.html` | Totalling mass and volume separately, never averaging the two densities | `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/densityOfAMixture.html` |
| `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/practiceRatesOfPay.html` | Hourly pay as money per unit time, including part hours and overtime rates | `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/ratesOfPay.html` |
| `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/practiceRates.html` | The price of one unit as a rate, multiplied or divided to cost any amount | `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/unitPricing.html` |
| `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/practiceRatesOfFlow.html` | Filling and emptying at a stated volume per unit time, and how long it takes | `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/ratesOfFlow.html` |
| `/pages/curriculum/GCSE/ratio/compound/ratesOnGraphs/practiceSpeedFromADistanceTimeGraph.html` | Speed as the gradient of each straight section; horizontal means stopped | `/pages/curriculum/GCSE/ratio/compound/ratesOnGraphs/speedFromADistanceTimeGraph.html` |
| `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceGrowthDecay.html` | Interest paid on the balance, so each year's interest earns interest itself | `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/compoundInterest.html` |
| `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceCompoundInterestFormula.html` | Raising the multiplier to the number of years to reach the balance in one step | `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/compoundInterestFormula.html` |
| `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceDepreciation.html` | A value falling by a fixed percentage each year, via a multiplier below 1 | `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/depreciation.html` |
| `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceFindingHowLong.html` | Multiplying period by period until a target is passed, counting whole periods | `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/findingHowLong.html` |
| `/pages/curriculum/GCSE/ratio/growth/exponentialChange/practiceExponentialGrowth.html` | Quantities multiplied by the same factor each period, slowly then very fast | `/pages/curriculum/GCSE/ratio/growth/exponentialChange/exponentialGrowth.html` |
| `/pages/curriculum/GCSE/ratio/growth/exponentialChange/practiceExponentialDecay.html` | Repeated multiplication by a factor below 1, never quite reaching zero | `/pages/curriculum/GCSE/ratio/growth/exponentialChange/exponentialDecay.html` |
| `/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceSimplifyingRatiosReview.html` | Mixed review — Simplifying ratios with and without units, the form 1 : n, and their fractions | `/pages/curriculum/GCSE/ratio/ratio/combiningRatios/ratioAsAMultiplier.html` |
| `/pages/curriculum/GCSE/ratio/ratio/sharing/practiceSharingReview.html` | Mixed review — Dividing in a ratio, working back from one share, and combining ratios | `/pages/curriculum/GCSE/ratio/ratio/combiningRatios/combiningTwoRatios.html` |
| `/pages/curriculum/GCSE/ratio/ratio/mapsAndScaleDrawings/practiceScaleDrawingsReview.html` | Mixed review — Scale factors, drawing scales and map scales, converted in both directions | `/pages/curriculum/GCSE/ratio/ratio/mapsAndScaleDrawings/mapScales.html` |
| `/pages/curriculum/GCSE/ratio/ratio/similarShapes/practiceSimilarShapesReview.html` | Mixed review — Length, area and volume scale factors, switched with squares, cubes and roots | `/pages/curriculum/GCSE/ratio/ratio/similarShapes/choosingTheScaleFactor.html` |
| `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceProportionReview.html` | Mixed review — Direct and inverse proportion problems, and deciding which relationship holds | `/pages/curriculum/GCSE/ratio/proportion/usingInverseProportion/recognisingProportionality.html` |
| `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceBestBuys.html` | Mixed review — Scaling recipes by awkward factors and comparing pack prices by a common unit | `/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/bestBuyComparisons.html` |
| `/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/practiceProportionEquationsReview.html` | Mixed review — Constructing y = kx, y = k/x and power variants from one pair — Higher only **(H)** | `/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/proportionToPowers.html` |
| `/pages/curriculum/GCSE/ratio/percentage/multipliers/practicePercentageChangeReview.html` | Mixed review — Increase and decrease multipliers, repeated change, and reverse percentages | `/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/successiveChanges.html` |
| `/pages/curriculum/GCSE/ratio/percentage/comparingChange/practiceProfitLossReview.html` | Mixed review — Percentage change from two amounts, profit and loss, and fair comparisons | `/pages/curriculum/GCSE/ratio/percentage/comparingChange/comparingChanges.html` |
| `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/practiceCompoundMeasuresReview.html` | Mixed review — Speed, density and pressure, rearranged and pushed through multi-step problems | `/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/pressureForceArea.html` |
| `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/practiceRatesReview.html` | Mixed review — Pay, prices and flows as rates, used both ways and converted between units | `/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/convertingRates.html` |
| `/pages/curriculum/GCSE/ratio/compound/ratesOnGraphs/practiceRateOfChange.html` | Mixed review — Reading gradients as rates of change from coordinate pairs and journeys | `/pages/curriculum/GCSE/ratio/compound/ratesOnGraphs/gradientAsARate.html` |
| `/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceGrowthDecayReview.html` | Mixed review — Interest, depreciation and exponential change, with linear growth for contrast | `/pages/curriculum/GCSE/ratio/growth/exponentialChange/linearVersusExponential.html` |
| `/pages/curriculum/GCSE/geometry/properties/angleBasics/practiceAnglesAtAPoint.html` | Angles meeting at a point sum to 360°, with reflex angles and several unknowns around one point | `/pages/curriculum/GCSE/geometry/properties/angleBasics/anglesAtAPoint.html` |
| `/pages/curriculum/GCSE/geometry/properties/angleBasics/practiceAnglesOnAStraightLine.html` | Angles on one side of a straight line sum to 180°, and only when the line really is straight | `/pages/curriculum/GCSE/geometry/properties/angleBasics/anglesOnAStraightLine.html` |
| `/pages/curriculum/GCSE/geometry/properties/angleBasics/practiceVerticallyOppositeAngles.html` | Two crossing lines make two pairs of equal angles, and quoting the reason by its proper name | `/pages/curriculum/GCSE/geometry/properties/angleBasics/verticallyOppositeAngles.html` |
| `/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceAngleRules.html` | Equal angles in a Z shape between parallel lines, spotted from the diagram and quoted by name | `/pages/curriculum/GCSE/geometry/properties/parallelLines/alternateAngles.html` |
| `/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceCorrespondingAngles.html` | Equal angles in an F shape on parallel lines, and telling them apart from alternate pairs | `/pages/curriculum/GCSE/geometry/properties/parallelLines/correspondingAngles.html` |
| `/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceCoInteriorAngles.html` | Angles in a C shape between parallel lines sum to 180°, and why they are not equal | `/pages/curriculum/GCSE/geometry/properties/parallelLines/coInteriorAngles.html` |
| `/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceMultiStepAngleProblems.html` | Chaining several angle facts to reach the angle asked for, stating the reason for every step | `/pages/curriculum/GCSE/geometry/properties/parallelLines/multiStepAngleProblems.html` |
| `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/practiceAngleSumOfATriangle.html` | Why the three angles sum to 180°, proved by drawing a parallel line through one vertex | `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/angleSumOfATriangle.html` |
| `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/practiceIsoscelesTriangleAngles.html` | The angles facing the equal sides are equal, and the two different answers when the given angle might be either | `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/isoscelesTriangleAngles.html` |
| `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/practiceExteriorAngleOfATriangle.html` | An exterior angle equals the sum of the two interior angles opposite it, in one step instead of two | `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/exteriorAngleOfATriangle.html` |
| `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/practiceInteriorAnglesOfPolygons.html` | Splitting an n-sided polygon into n − 2 triangles to find its angle sum, the quadrilateral’s 360° included | `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/interiorAnglesOfPolygons.html` |
| `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/practiceExteriorAnglesOfPolygons.html` | Why the exterior angles of any polygon sum to 360°, and finding a number of sides from one of them | `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/exteriorAnglesOfPolygons.html` |
| `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/practiceQuadrilaterals.html` | The defining properties of the square, rectangle, parallelogram, rhombus, trapezium and kite, set side by side | `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/quadrilateralDefinitions.html` |
| `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/practiceQuadrilateralDiagonals.html` | Which quadrilaterals have diagonals that are equal, perpendicular or bisect each other, and naming a shape from its diagonals | `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/quadrilateralDiagonals.html` |
| `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/practiceClassifyingQuadrilaterals.html` | Why a square is a rectangle but a rectangle need not be a square, and the most specific name the facts force | `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/classifyingQuadrilaterals.html` |
| `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/practiceLineSymmetry.html` | Counting the mirror lines of polygons, and completing a shape so a given line becomes a mirror | `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/lineSymmetry.html` |
| `/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruentShapes.html` | Two shapes are congruent when one fits exactly on the other, mirror images allowed, corresponding parts matched up | `/pages/curriculum/GCSE/geometry/properties/congruence/congruentShapes.html` |
| `/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruenceBySss.html` | Three matched sides fix a triangle completely, so no angle needs checking at all | `/pages/curriculum/GCSE/geometry/properties/congruence/congruenceBySss.html` |
| `/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruenceBySas.html` | Two sides and the angle between them, and why the angle must be the included one | `/pages/curriculum/GCSE/geometry/properties/congruence/congruenceBySas.html` |
| `/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruenceByAsa.html` | Two angles and a matched side, and why AAS also works once the third angle is deduced | `/pages/curriculum/GCSE/geometry/properties/congruence/congruenceByAsa.html` |
| `/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruenceByRhs.html` | A right angle, the hypotenuse and one other side, the one case where a non-included angle is enough | `/pages/curriculum/GCSE/geometry/properties/congruence/congruenceByRhs.html` |
| `/pages/curriculum/GCSE/geometry/properties/similarity/practiceSimilarShapes.html` | Two shapes are similar when angles match and sides share one scale factor, so one enlarges onto the other | `/pages/curriculum/GCSE/geometry/properties/similarity/similarShapes.html` |
| `/pages/curriculum/GCSE/geometry/properties/similarity/practiceProvingTrianglesSimilar.html` | Two matched angles are enough to prove similarity, and why a shared angle alone proves nothing | `/pages/curriculum/GCSE/geometry/properties/similarity/provingTrianglesSimilar.html` |
| `/pages/curriculum/GCSE/geometry/properties/transformations/practiceReflection.html` | Reflecting a shape in a mirror line on the grid, the diagonal lines y = x and y = −x included | `/pages/curriculum/GCSE/geometry/properties/transformations/reflection.html` |
| `/pages/curriculum/GCSE/geometry/properties/transformations/practiceRotation.html` | Rotating a shape about a centre with tracing paper, where centre, angle and direction are all required | `/pages/curriculum/GCSE/geometry/properties/transformations/rotation.html` |
| `/pages/curriculum/GCSE/geometry/properties/transformations/practiceTranslation.html` | Sliding a shape by a column vector, the top number moving it across and the bottom number up | `/pages/curriculum/GCSE/geometry/properties/transformations/translation.html` |
| `/pages/curriculum/GCSE/geometry/properties/transformations/practiceEnlargement.html` | Enlarging from a centre by a positive scale factor, with rays from the centre fixing where the image lands | `/pages/curriculum/GCSE/geometry/properties/transformations/enlargement.html` |
| `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceAngleInASemicircle.html` | An angle subtended by a diameter is 90°, and spotting the diameter that triggers the theorem **(H)** | `/pages/curriculum/GCSE/geometry/properties/circleTheorems/angleInASemicircle.html` |
| `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceCircleTheorems.html` | The angle at the centre is double the angle at the circumference on the same arc, however the figure is drawn **(H)** | `/pages/curriculum/GCSE/geometry/properties/circleTheorems/angleAtTheCentre.html` |
| `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceAnglesInTheSameSegment.html` | Angles at the circumference standing on the same arc are equal, found by chasing the chord they share **(H)** | `/pages/curriculum/GCSE/geometry/properties/circleTheorems/anglesInTheSameSegment.html` |
| `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceCyclicQuadrilaterals.html` | Opposite angles of a cyclic quadrilateral sum to 180°, and why all four vertices must touch the circle **(H)** | `/pages/curriculum/GCSE/geometry/properties/circleTheorems/cyclicQuadrilaterals.html` |
| `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceTangentsToACircle.html` | A tangent meets its radius at 90°, and the two tangents from an external point are equal **(H)** | `/pages/curriculum/GCSE/geometry/properties/circleTheorems/tangentsToACircle.html` |
| `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceChordsAndTheCentre.html` | The perpendicular from the centre bisects a chord, tying circle problems back to isosceles triangles and Pythagoras **(H)** | `/pages/curriculum/GCSE/geometry/properties/circleTheorems/chordsAndTheCentre.html` |
| `/pages/curriculum/GCSE/geometry/properties/solidsAndCoordinates/practiceSolids.html` | Naming the standard solids and counting their faces, edges and vertices, with prisms told apart from pyramids | `/pages/curriculum/GCSE/geometry/properties/solidsAndCoordinates/facesEdgesAndVertices.html` |
| `/pages/curriculum/GCSE/geometry/properties/solidsAndCoordinates/practiceNetsOfSolids.html` | Deciding which flat arrangements fold into a given solid, and tracking which edges and corners meet | `/pages/curriculum/GCSE/geometry/properties/solidsAndCoordinates/netsOfSolids.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/practiceScaleDrawings.html` | Reading and making drawings at a stated scale, converting between drawn length and real length in both directions | `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/scaleDrawings.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/practiceMapScales.html` | Ratio scales such as 1:25 000 turned into real distances and back, with the unit change saved for last | `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/mapScales.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/practiceBearings.html` | Directions measured clockwise from north and always written with three figures, so 45° is recorded as 045° | `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/threeFigureBearings.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practicePerimeter.html` | The distance round a shape, including deducing the unmarked sides of a rectilinear shape before adding | `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/perimeter.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceAreaOfARectangle.html` | Area as the squares a shape covers, counted first and then found faster as length times width | `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/areaOfARectangle.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceArea.html` | Half of base times height, where the height is perpendicular to the base and never the slant side | `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/areaOfATriangle.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceAreaOfAParallelogram.html` | Base times perpendicular height, and why using the slant side gives an answer that is always too big | `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/areaOfAParallelogram.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceAreaOfATrapezium.html` | Half the sum of the parallel sides times the height between them, and identifying which sides are parallel | `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/areaOfATrapezium.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceFindingALengthFromAnArea.html` | Running an area formula backwards to recover a base, height or parallel side from the stated area | `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/findingALengthFromAnArea.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceMensuration.html` | C = πd or 2πr, and deciding whether the given length is a radius or a diameter first | `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/circumferenceOfACircle.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceAreaOfACircle.html` | A = πr² with only the radius squared, halving a given diameter before anything is substituted | `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/areaOfACircle.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceAnswersInTermsOfPi.html` | Leaving circle answers as exact multiples of π instead of decimals, and calculating with them unrounded | `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/answersInTermsOfPi.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceSemicirclesAndQuarterCircles.html` | Halving or quartering the circle formulas, and adding the straight edges whenever a perimeter is wanted | `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/semicirclesAndQuarterCircles.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceArcLength.html` | The angle over 360 as the fraction of the circumference an arc takes, plus two radii for a sector’s perimeter | `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/arcLength.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceSectorArea.html` | The angle over 360 applied to πr² for the area a sector sweeps, and to nothing else | `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/sectorArea.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceFindingTheAngleOfASector.html` | Running the arc and sector formulas backwards to recover the angle or radius from a stated length or area | `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/findingTheAngleOfASector.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/prismsAndCylinders/practiceVolumeOfAPrism.html` | Cross-section area times length for any prism, once the face that repeats has been correctly identified | `/pages/curriculum/GCSE/geometry/mensuration/prismsAndCylinders/volumeOfAPrism.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/prismsAndCylinders/practiceVolumeOfACylinder.html` | πr²h as a circular prism, left in terms of π unless a decimal is demanded | `/pages/curriculum/GCSE/geometry/mensuration/prismsAndCylinders/volumeOfACylinder.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/practiceVolumeOfAPyramid.html` | One third of the base area times the perpendicular height, whatever polygon forms the base | `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/volumeOfAPyramid.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/practiceVolumeOfACone.html` | ⅓πr²h with the perpendicular height rather than the slant, and Pythagoras to convert between the two | `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/volumeOfACone.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/practiceVolumeOfASphere.html` | Four thirds of πr³ with only the radius cubed, and hemispheres taken as exact halves | `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/volumeOfASphere.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/practicePythagoras.html` | The squares on the two shorter sides sum to the square on the hypotenuse, which always faces the right angle | `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/pythagorasTheorem.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/practicePythagorasShorterSides.html` | Subtracting squares instead of adding when the hypotenuse is already known, the swap most wrong answers miss | `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/pythagorasShorterSides.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/practiceDistanceBetweenTwoPoints.html` | The straight-line distance between two coordinates as the hypotenuse of the right-angled triangle the grid supplies | `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/distanceBetweenTwoPoints.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/practiceTestingForARightAngle.html` | The converse of Pythagoras: checking whether the three sides satisfy a² + b² = c² before claiming the right angle | `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/testingForARightAngle.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/practiceTrigonometry.html` | Sine, cosine and tangent as ratios of sides, labelled hypotenuse, opposite and adjacent from the angle in use | `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/trigonometricRatios.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/practiceFindingASideWithTrigonometry.html` | Choosing the ratio that links the known angle to the wanted side, and when to multiply or divide | `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/findingASideWithTrigonometry.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/practiceFindingAnAngleWithTrigonometry.html` | The inverse functions sin⁻¹, cos⁻¹ and tan⁻¹ turning a ratio of two sides back into the angle | `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/findingAnAngleWithTrigonometry.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/practiceExactTrigValues.html` | The exact values of sin and cos at 0°, 30°, 45°, 60° and 90°, and tan up to 60°, read from two special triangles | `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/exactTrigValues.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceSineCosineRules.html` | Each side over the sine of its opposite angle is constant, so one matched pair unlocks the rest **(H)** | `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/sineRuleSides.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceSineRuleAngles.html` | The rule flipped to find an angle, and the second obtuse solution the sine of an angle can hide **(H)** | `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/sineRuleAngles.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceCosineRuleSides.html` | c² = a² + b² − 2ab cos C for the side facing a known included angle, with the subtraction done last **(H)** | `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/cosineRuleSides.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceCosineRuleAngles.html` | The cosine rule rearranged to find any angle from three sides, a negative cosine signalling an obtuse angle **(H)** | `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/cosineRuleAngles.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceAreaHalfAbSinC.html` | Half the product of two sides and the sine of the included angle, no perpendicular height required **(H)** | `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/areaHalfAbSinC.html` |
| `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/practiceVectors.html` | A displacement written as a column vector, identical wherever it starts, unlike the position a coordinate names | `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/columnVectors.html` |
| `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/practiceTranslationsAsVectors.html` | Describing a translation with a column vector, the top number across and the bottom number up, signs included | `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/translationsAsVectors.html` |
| `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/practiceAddingAndSubtractingVectors.html` | Adding component by component, or chaining arrows nose to tail for the resultant, with subtraction as adding the reverse | `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/addingAndSubtractingVectors.html` |
| `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/practiceScalarMultiplesOfAVector.html` | Multiplying a vector by a number scales its length, and a negative scalar reverses its direction too | `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/scalarMultiplesOfAVector.html` |
| `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/practiceVectorProofs.html` | Writing the path between labelled points in terms of a and b, a vector travelled backwards picking up a minus | `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/vectorRoutes.html` |
| `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/practiceFractionsOfAVector.html` | The vector to a midpoint or ratio point on a segment, built as a fraction of the whole vector **(H)** | `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/fractionsOfAVector.html` |
| `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/practiceParallelVectors.html` | Two vectors are parallel exactly when one is a scalar multiple of the other, shown by factorising the expression **(H)** | `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/parallelVectors.html` |
| `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/practiceCollinearPoints.html` | Proving three points lie on one straight line by showing two vectors parallel and sharing a point **(H)** | `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/collinearPoints.html` |
| `/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceAngleRulesReview.html` | Mixed review — Parallel lines and polygons, stating the reason each time | `/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/anglesInRegularPolygons.html` |
| `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/practiceQuadrilateralsReview.html` | Mixed review — Naming quadrilaterals from their properties, diagonals and symmetries | `/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/rotationalSymmetry.html` |
| `/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruence.html` | Mixed review — Deciding whether two triangles are congruent and naming the criterion | `/pages/curriculum/GCSE/geometry/properties/congruence/provingTrianglesCongruent.html` |
| `/pages/curriculum/GCSE/geometry/properties/similarity/practiceSimilarity.html` | Mixed review — Scale factors and missing lengths in similar triangles and shapes | `/pages/curriculum/GCSE/geometry/properties/similarity/lengthsInSimilarShapes.html` |
| `/pages/curriculum/GCSE/geometry/properties/transformations/practiceTransformations.html` | Mixed review — Performing and describing reflections, rotations, translations and enlargements on axes | `/pages/curriculum/GCSE/geometry/properties/transformations/describingATransformation.html` |
| `/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceCircleTheoremsReview.html` | Mixed review — Applying each theorem and justifying the reason **(H)** | `/pages/curriculum/GCSE/geometry/properties/circleTheorems/alternateSegmentTheorem.html` |
| `/pages/curriculum/GCSE/geometry/properties/solidsAndCoordinates/practiceSolidsReview.html` | Mixed review — Counting faces, edges and vertices, matching nets, and reading plans and elevations | `/pages/curriculum/GCSE/geometry/properties/solidsAndCoordinates/plansAndElevations.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/practiceBearingsReview.html` | Mixed review — Three-figure bearings, back bearings and scale conversions, all in whole degrees | `/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/calculatingWithBearings.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceAreaReview.html` | Mixed review — Triangles, parallelograms, trapezia and composite shapes, with lengths recovered from areas | `/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/areaOfCompositeShapes.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceMensurationReview.html` | Mixed review — Circles, sectors, prisms, cones, spheres and frustums, exact in terms of π | `/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/volumeOfAFrustum.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/practicePythagorasReview.html` | Mixed review — Hypotenuses, shorter sides and cuboid diagonals, built on Pythagorean triples | `/pages/curriculum/GCSE/geometry/mensuration/pythagoras/pythagorasInThreeDimensions.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/practiceTrigonometryReview.html` | Mixed review — Right-angled triangles and the exact values, no calculator needed | `/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/anglesOfElevationAndDepression.html` |
| `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceSineCosineRulesReview.html` | Mixed review — Sides, angles and areas in non-right-angled triangles, engineered to come out exactly **(H)** | `/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/choosingTheRightRule.html` |
| `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/practiceVectorsReview.html` | Mixed review — Column vector addition, subtraction, scalar multiples and magnitude | `/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/magnitudeOfAVector.html` |
| `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/practiceVectorProofsReview.html` | Mixed review — Routes in a and b, midpoints, parallel vectors and collinearity **(H)** | `/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/vectorProofs.html` |
| `/pages/curriculum/GCSE/probability/scale/measuringChance/practiceComparingProbabilities.html` | Deciding which event is more likely by common denominators or decimals | `/pages/curriculum/GCSE/probability/scale/measuringChance/comparingProbabilities.html` |
| `/pages/curriculum/GCSE/probability/scale/singleEvents/practiceSingle.html` | Favourable outcomes over total outcomes, and the equally likely condition | `/pages/curriculum/GCSE/probability/scale/singleEvents/equallyLikelyOutcomes.html` |
| `/pages/curriculum/GCSE/probability/scale/singleEvents/practiceEventsWithSeveralOutcomes.html` | Counting every outcome an event contains before dividing by the total | `/pages/curriculum/GCSE/probability/scale/singleEvents/eventsWithSeveralOutcomes.html` |
| `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/practiceProbabilitiesSumToOne.html` | Why an exhaustive set’s probabilities total one, and checking a stated table | `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/probabilitiesSumToOne.html` |
| `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/practiceComplementaryEvents.html` | P(not A) as 1 − P(A), and spotting when the complement is the faster route | `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/complementaryEvents.html` |
| `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/practiceMissingProbabilities.html` | Using the total of one to find an unknown probability, even an algebraic one | `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/missingProbabilities.html` |
| `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/practiceExpectedFrequency.html` | Estimating how many times an event will occur as probability times trials | `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/expectedFrequency.html` |
| `/pages/curriculum/GCSE/probability/combined/exclusiveEvents/practiceMutuallyExclusiveEvents.html` | Events that cannot both happen on one trial, and testing pairs for exclusivity | `/pages/curriculum/GCSE/probability/combined/exclusiveEvents/mutuallyExclusiveEvents.html` |
| `/pages/curriculum/GCSE/probability/combined/exclusiveEvents/practiceOrRule.html` | Adding probabilities for either-or questions, and why exclusivity is required | `/pages/curriculum/GCSE/probability/combined/exclusiveEvents/orRule.html` |
| `/pages/curriculum/GCSE/probability/combined/exclusiveEvents/practiceOverlappingEvents.html` | Why adding double-counts the overlap, and subtracting it to correct the total | `/pages/curriculum/GCSE/probability/combined/exclusiveEvents/overlappingEvents.html` |
| `/pages/curriculum/GCSE/probability/combined/independence/practiceIndependentEvents.html` | Events where one outcome gives no information about the other | `/pages/curriculum/GCSE/probability/combined/independence/independentEvents.html` |
| `/pages/curriculum/GCSE/probability/combined/independence/practiceAndRule.html` | Multiplying the probabilities of independent events for both-happen questions | `/pages/curriculum/GCSE/probability/combined/independence/andRule.html` |
| `/pages/curriculum/GCSE/probability/combined/independence/practiceIndependenceAssumption.html` | The unstated assumption behind multiplying, and everyday cases where it fails | `/pages/curriculum/GCSE/probability/combined/independence/independenceAssumption.html` |
| `/pages/curriculum/GCSE/probability/combined/independence/practiceCombined.html` | Deciding whether a worded question wants either event or both events | `/pages/curriculum/GCSE/probability/combined/independence/choosingAddOrMultiply.html` |
| `/pages/curriculum/GCSE/probability/combined/replacement/practiceDependentEvents.html` | Events where the first outcome changes the probabilities for the second | `/pages/curriculum/GCSE/probability/combined/replacement/dependentEvents.html` |
| `/pages/curriculum/GCSE/probability/combined/replacement/practiceWithReplacement.html` | Repeated picks where each object goes back, so every stage stays independent | `/pages/curriculum/GCSE/probability/combined/replacement/withReplacement.html` |
| `/pages/curriculum/GCSE/probability/combined/conditional/practiceConditional.html` | The probability of an event given that another has happened **(H)** | `/pages/curriculum/GCSE/probability/combined/conditional/conditionalProbability.html` |
| `/pages/curriculum/GCSE/probability/combined/conditional/practiceConditionalFromTwoWayTables.html` | P(A given B) as a cell over its row or column total, not the grand total **(H)** | `/pages/curriculum/GCSE/probability/combined/conditional/conditionalFromTwoWayTables.html` |
| `/pages/curriculum/GCSE/probability/combined/conditional/practiceConditionalFromVennDiagrams.html` | Dividing the overlap by the region in the condition, not the whole diagram **(H)** | `/pages/curriculum/GCSE/probability/combined/conditional/conditionalFromVennDiagrams.html` |
| `/pages/curriculum/GCSE/probability/diagrams/sampleSpaces/practiceListingCombinedOutcomes.html` | Writing every pairing of two events once, in an order showing none is missing | `/pages/curriculum/GCSE/probability/diagrams/sampleSpaces/listingCombinedOutcomes.html` |
| `/pages/curriculum/GCSE/probability/diagrams/sampleSpaces/practiceSampleSpaceDiagrams.html` | The grid displaying every outcome of two events, one axis per event | `/pages/curriculum/GCSE/probability/diagrams/sampleSpaces/sampleSpaceDiagrams.html` |
| `/pages/curriculum/GCSE/probability/diagrams/tablesAndFrequencyTrees/practiceTwoWayTables.html` | Completing a two-way table from its totals, one forced cell at a time | `/pages/curriculum/GCSE/probability/diagrams/tablesAndFrequencyTrees/twoWayTables.html` |
| `/pages/curriculum/GCSE/probability/diagrams/tablesAndFrequencyTrees/practiceProbabilitiesFromTwoWayTables.html` | A cell count over the grand total, and reading which total a question wants | `/pages/curriculum/GCSE/probability/diagrams/tablesAndFrequencyTrees/probabilitiesFromTwoWayTables.html` |
| `/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/practiceDrawingTreeDiagrams.html` | One fork per stage, a probability on every branch, and each fork totalling one | `/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/drawingTreeDiagrams.html` |
| `/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/practiceTrees.html` | The probability of a complete route as the product of its branch probabilities | `/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/multiplyingAlongBranches.html` |
| `/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/practiceAddingAcrossPaths.html` | Finding every path that satisfies the event, then adding their probabilities | `/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/addingAcrossPaths.html` |
| `/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/practiceVennDiagramRegions.html` | What the four regions of a two-set diagram hold, including outside both sets | `/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/vennDiagramRegions.html` |
| `/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/practiceVenn.html` | Union, intersection, complement and universal set, and the regions they shade | `/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/setNotation.html` |
| `/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/practiceFillingInAVennDiagram.html` | Placing the intersection first and subtracting outwards from worded counts | `/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/fillingInAVennDiagram.html` |
| `/pages/curriculum/GCSE/probability/experimental/estimatingFromExperiments/practiceRelativeFrequency.html` | The fraction of trials on which an event occurred, estimating its probability | `/pages/curriculum/GCSE/probability/experimental/estimatingFromExperiments/relativeFrequency.html` |
| `/pages/curriculum/GCSE/probability/experimental/estimatingFromExperiments/practiceEstimatingProbabilityFromData.html` | Relative frequency when outcomes are not equally likely, such as a drawing pin | `/pages/curriculum/GCSE/probability/experimental/estimatingFromExperiments/estimatingProbabilityFromData.html` |
| `/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/practiceComparingWithTheory.html` | Setting relative frequency against theory, and describing the gap between them | `/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/comparingWithTheory.html` |
| `/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/practiceBias.html` | Judging whether a dice or spinner is fair, and how large a gap is suspicious | `/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/detectingBias.html` |
| `/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/practiceEffectOfSampleSize.html` | Why relative frequency settles towards the true probability as trials increase | `/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/effectOfSampleSize.html` |
| `/pages/curriculum/GCSE/probability/scale/singleEvents/practiceSingleReview.html` | Mixed review — Probability scale, the not-rule and expected frequency | `/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/expectationAsAnEstimate.html` |
| `/pages/curriculum/GCSE/probability/combined/independence/practiceCombinedReview.html` | Mixed review — Independent and dependent events, and when to multiply or add | `/pages/curriculum/GCSE/probability/combined/independence/atLeastOne.html` |
| `/pages/curriculum/GCSE/probability/combined/replacement/practiceReplacement.html` | Mixed review — Successive picks, with the second fraction recalculated when nothing goes back | `/pages/curriculum/GCSE/probability/combined/replacement/withoutReplacement.html` |
| `/pages/curriculum/GCSE/probability/combined/conditional/practiceConditionalReview.html` | Mixed review — Given-that questions from two-way tables, Venn diagrams and tree diagrams **(H)** | `/pages/curriculum/GCSE/probability/combined/conditional/conditionalFromTreeDiagrams.html` |
| `/pages/curriculum/GCSE/probability/diagrams/sampleSpaces/practiceSampleSpaces.html` | Mixed review — Grids for two events, and probabilities counted from the cells | `/pages/curriculum/GCSE/probability/diagrams/sampleSpaces/probabilitiesFromASampleSpace.html` |
| `/pages/curriculum/GCSE/probability/diagrams/tablesAndFrequencyTrees/practiceTwoWayTablesReview.html` | Mixed review — Completing tables and frequency trees from totals, then reading probabilities | `/pages/curriculum/GCSE/probability/diagrams/tablesAndFrequencyTrees/frequencyTrees.html` |
| `/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/practiceTreesReview.html` | Mixed review — With and without replacement | `/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/treesWithoutReplacement.html` |
| `/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/practiceVennReview.html` | Mixed review — Set notation and conditional probability **(H)** | `/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/probabilitiesFromAVennDiagram.html` |
| `/pages/curriculum/GCSE/probability/experimental/estimatingFromExperiments/practiceRelativeFrequencyReview.html` | Mixed review — Estimating probabilities from results tables and predicting future counts | `/pages/curriculum/GCSE/probability/experimental/estimatingFromExperiments/predictingFromRelativeFrequency.html` |
| `/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/practiceBiasReview.html` | Mixed review — Verdicts on fairness, best estimates, and what more trials change | `/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/bestEstimate.html` |
| `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceSampling.html` | The population as everyone of interest and the sample as the part surveyed | `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/populationAndSample.html` |
| `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceCensusOrSample.html` | When a census is worth it, and when cost or destructive testing forces a sample | `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/censusOrSample.html` |
| `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceRandomSampling.html` | Giving every member an equal chance, and why haphazard is not random | `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/randomSampling.html` |
| `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceNonRandomSampling.html` | Systematic and opportunity sampling, and the groups each one quietly misses | `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/nonRandomSampling.html` |
| `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceSourcesOfBias.html` | How time, place and selection method favour one group, and whom a survey misses | `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/sourcesOfBias.html` |
| `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceSampleSize.html` | Why larger samples give steadier estimates, yet badly chosen ones stay biased | `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/sampleSize.html` |
| `/pages/curriculum/GCSE/statistics/sampling/collectingData/practiceDataCollection.html` | Telling qualities from quantities, and how the type fixes charts and averages | `/pages/curriculum/GCSE/statistics/sampling/collectingData/typesOfData.html` |
| `/pages/curriculum/GCSE/statistics/sampling/collectingData/practiceDiscreteAndContinuous.html` | Counts that move in steps against measurements that can take any value | `/pages/curriculum/GCSE/statistics/sampling/collectingData/discreteAndContinuous.html` |
| `/pages/curriculum/GCSE/statistics/sampling/collectingData/practicePrimaryAndSecondaryData.html` | Data collected yourself against someone else's records, and what each costs | `/pages/curriculum/GCSE/statistics/sampling/collectingData/primaryAndSecondaryData.html` |
| `/pages/curriculum/GCSE/statistics/sampling/collectingData/practiceCollectionSheets.html` | Designing collection sheets whose classes cover every value without overlapping | `/pages/curriculum/GCSE/statistics/sampling/collectingData/collectionSheets.html` |
| `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceGroupedFrequencyTables.html` | Sorting continuous data into inequality classes, one class for every value | `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/groupedFrequencyTables.html` |
| `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceBarCharts.html` | Drawing and reading bar charts: equal-width bars, gaps and a labelled axis | `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/barCharts.html` |
| `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceDualAndCompositeBarCharts.html` | Two data sets on one chart, side by side or stacked, and reading a component | `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/dualAndCompositeBarCharts.html` |
| `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practicePictograms.html` | Drawing and reading pictograms, where the key fixes what one symbol is worth | `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/pictograms.html` |
| `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceVerticalLineCharts.html` | The chart for ungrouped discrete numerical data, with bars shrunk to lines | `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/verticalLineCharts.html` |
| `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceCharts.html` | Turning frequencies into sector angles that total 360°, checked before drawing | `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/drawingPieCharts.html` |
| `/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/practiceFrequencyDiagrams.html` | Splitting each value into stem and leaf under a key, with the leaves ordered | `/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/stemAndLeafDiagrams.html` |
| `/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/practiceBackToBackStemAndLeaf.html` | Two data sets sharing one set of stems, with left-hand leaves read outwards | `/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/backToBackStemAndLeaf.html` |
| `/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/practiceFrequencyPolygons.html` | Plotting each class frequency at its midpoint, not at the class boundaries | `/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/frequencyPolygons.html` |
| `/pages/curriculum/GCSE/statistics/presenting/timeSeriesAndScatter/practiceTimeSeries.html` | Readings taken at regular intervals, plotted and read as a line graph | `/pages/curriculum/GCSE/statistics/presenting/timeSeriesAndScatter/timeSeriesGraphs.html` |
| `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceHistograms.html` | Why unequal class widths force frequency onto area via frequency density **(H)** | `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/frequencyDensity.html` |
| `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceDrawingHistograms.html` | Frequency densities for every class, with bar areas carrying the frequencies **(H)** | `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/drawingHistograms.html` |
| `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceInterpretingHistograms.html` | Frequencies from bar areas, and why the tallest bar need not hold the most data **(H)** | `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/interpretingHistograms.html` |
| `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceCumulative.html` | Running totals plotted at upper class boundaries, joined by an S-shaped curve **(H)** | `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/cumulativeFrequencyGraphs.html` |
| `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceReadingCumulativeFrequencyGraphs.html` | Estimating the median and quartiles from the curve, and counts above a point **(H)** | `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/readingCumulativeFrequencyGraphs.html` |
| `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceDrawingBoxPlots.html` | The five values a box plot shows, from a list or a cumulative frequency graph **(H)** | `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/drawingBoxPlots.html` |
| `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceTheMode.html` | The most frequent value in a data set, including sets with two modes or none | `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/theMode.html` |
| `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceTheMedian.html` | The middle value of ordered data, and the halfway pair when the count is even | `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/theMedian.html` |
| `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceMeanMedianMode.html` | The total shared equally across the count, and why one extreme drags the mean | `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/theMean.html` |
| `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceTheRange.html` | Largest minus smallest as a measure of spread, not an average | `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/theRange.html` |
| `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceChoosingTheAverage.html` | Mode for categories, median against extremes, mean when every value counts | `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/choosingTheAverage.html` |
| `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceWorkingBackwardsFromTheMean.html` | Recovering the total from a stated mean to find a missing value | `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/workingBackwardsFromTheMean.html` |
| `/pages/curriculum/GCSE/statistics/averages/averagesFromTables/practiceAverages.html` | Multiplying each value by its frequency, then dividing by the total frequency | `/pages/curriculum/GCSE/statistics/averages/averagesFromTables/meanFromAFrequencyTable.html` |
| `/pages/curriculum/GCSE/statistics/averages/averagesFromTables/practiceMedianFromAFrequencyTable.html` | Counting through the frequencies to the middle, without rewriting the list | `/pages/curriculum/GCSE/statistics/averages/averagesFromTables/medianFromAFrequencyTable.html` |
| `/pages/curriculum/GCSE/statistics/averages/averagesFromTables/practiceModeAndRangeFromATable.html` | Both read from the value column, not from the largest frequency | `/pages/curriculum/GCSE/statistics/averages/averagesFromTables/modeAndRangeFromATable.html` |
| `/pages/curriculum/GCSE/statistics/averages/averagesFromGroupedData/practiceModalClass.html` | The class with the highest frequency, stated as an interval, not a value | `/pages/curriculum/GCSE/statistics/averages/averagesFromGroupedData/modalClass.html` |
| `/pages/curriculum/GCSE/statistics/averages/averagesFromGroupedData/practiceMedianClass.html` | Finding the middle position, then counting through the classes to reach it | `/pages/curriculum/GCSE/statistics/averages/averagesFromGroupedData/medianClass.html` |
| `/pages/curriculum/GCSE/statistics/averages/quartiles/practiceQuartiles.html` | The lower and upper quartiles of an ordered list, at the quarter positions **(H)** | `/pages/curriculum/GCSE/statistics/averages/quartiles/quartilesFromAList.html` |
| `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/practiceScatter.html` | Positive, negative or no correlation, strong or weak, read from the points | `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/describingCorrelation.html` |
| `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/practiceLinesOfBestFit.html` | A straight line by eye through the points, never forced through the origin | `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/linesOfBestFit.html` |
| `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/practiceInterpolation.html` | Reading an estimate off the line inside the data range, and its reliability | `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/interpolation.html` |
| `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/practiceExtrapolation.html` | Why extending the line beyond the plotted data gives unsupported estimates | `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/extrapolation.html` |
| `/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/practiceOutliers.html` | Spotting a value far from the rest, and whether it is an error or genuine | `/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/outliers.html` |
| `/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/practiceComparingData.html` | A fair comparison pairs an average with a measure of spread, both in context | `/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/comparingWithMeanAndRange.html` |
| `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceSamplingReview.html` | Mixed review — Populations, samples, bias and population estimates | `/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/estimatingPopulationFigures.html` |
| `/pages/curriculum/GCSE/statistics/sampling/collectingData/practiceDataCollectionReview.html` | Mixed review — Data types, collection sheets and questionnaire flaws | `/pages/curriculum/GCSE/statistics/sampling/collectingData/questionnaires.html` |
| `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceChartsReview.html` | Mixed review — Reading charts, pictogram keys and sector angles | `/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/interpretingPieCharts.html` |
| `/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/practiceFrequencyDiagramsReview.html` | Mixed review — Stem-and-leaf, frequency polygons and equal-width histograms | `/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/equalWidthHistograms.html` |
| `/pages/curriculum/GCSE/statistics/presenting/timeSeriesAndScatter/practiceTimeSeriesReview.html` | Mixed review — Reading the graphs and describing the trend | `/pages/curriculum/GCSE/statistics/presenting/timeSeriesAndScatter/trendsAndSeasonality.html` |
| `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceHistogramsReview.html` | Mixed review — Frequency density and unequal class widths **(H)** | `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/completingAHistogram.html` |
| `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceCumulativeReview.html` | Mixed review — Curves, medians, quartiles and box plots **(H)** | `/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/readingBoxPlots.html` |
| `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceMeanMedianModeReview.html` | Mixed review — Averages and range from raw lists, forwards and backwards | `/pages/curriculum/GCSE/statistics/averages/averagesFromAList/combinedMeans.html` |
| `/pages/curriculum/GCSE/statistics/averages/averagesFromTables/practiceAveragesReview.html` | Mixed review — Frequency tables and grouped data | `/pages/curriculum/GCSE/statistics/averages/averagesFromGroupedData/estimatedMean.html` |
| `/pages/curriculum/GCSE/statistics/averages/quartiles/practiceQuartilesReview.html` | Mixed review — Quartiles and the interquartile range from ordered lists **(H)** | `/pages/curriculum/GCSE/statistics/averages/quartiles/interquartileRange.html` |
| `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/practiceScatterReview.html` | Mixed review — Correlation and lines of best fit | `/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/correlationAndCausation.html` |
| `/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/practiceComparingDataReview.html` | Mixed review — Averages, spread and the conclusions they support | `/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/limitsOfConclusions.html` |

### A level — 17 pages

| Page | Drills | Taught on |
| --- | --- | --- |
| `/pages/curriculum/ALevel/pure/practiceAlgebra.html` | Surds, indices, partial fractions, algebraic division | `/pages/curriculum/ALevel/pure/algebra.html` |
| `/pages/curriculum/ALevel/pure/practiceCoordinate.html` | Straight lines, circle equations, tangents, parametric curves | `/pages/curriculum/ALevel/pure/coordinate.html` |
| `/pages/curriculum/ALevel/pure/practiceBinomial.html` | Positive, negative and rational indices, with validity | `/pages/curriculum/ALevel/pure/sequences.html` |
| `/pages/curriculum/ALevel/pure/practiceTrigonometry.html` | Identities, R-form, solving over an interval | `/pages/curriculum/ALevel/pure/trigonometry.html` |
| `/pages/curriculum/ALevel/pure/practiceLogarithms.html` | Log laws, exponential equations, growth models | `/pages/curriculum/ALevel/pure/exponentials.html` |
| `/pages/curriculum/ALevel/pure/practiceDifferentiation.html` | Product, quotient, chain, implicit, parametric | `/pages/curriculum/ALevel/pure/differentiation.html` |
| `/pages/curriculum/ALevel/pure/practiceIntegration.html` | Substitution, by parts, partial fractions, areas | `/pages/curriculum/ALevel/pure/integration.html` |
| `/pages/curriculum/ALevel/pure/practiceNumerical.html` | Change of sign, iteration, Newton–Raphson, the trapezium rule | `/pages/curriculum/ALevel/pure/numerical.html` |
| `/pages/curriculum/ALevel/pure/practiceVectors.html` | Arithmetic, magnitude, geometric proof | `/pages/curriculum/ALevel/pure/vectors.html` |
| `/pages/curriculum/ALevel/statistics/practiceProbability.html` | Conditional probability, Venn and tree diagrams | `/pages/curriculum/ALevel/statistics/probability.html` |
| `/pages/curriculum/ALevel/statistics/practiceBinomial.html` | Individual and cumulative probabilities | `/pages/curriculum/ALevel/statistics/distributions.html` |
| `/pages/curriculum/ALevel/statistics/practiceNormal.html` | Standardising, inverse normal, model selection | `/pages/curriculum/ALevel/statistics/distributions.html` |
| `/pages/curriculum/ALevel/statistics/practiceHypothesis.html` | One- and two-tailed tests, critical regions | `/pages/curriculum/ALevel/statistics/hypothesis.html` |
| `/pages/curriculum/ALevel/mechanics/practiceSUVAT.html` | Constant acceleration, including vertical motion | `/pages/curriculum/ALevel/mechanics/kinematics.html` |
| `/pages/curriculum/ALevel/mechanics/practiceGraphs.html` | Gradients, areas, sketching from a description | `/pages/curriculum/ALevel/mechanics/kinematics.html` |
| `/pages/curriculum/ALevel/mechanics/practiceForces.html` | Diagrams, resolving, friction, connected particles | `/pages/curriculum/ALevel/mechanics/forces.html` |
| `/pages/curriculum/ALevel/mechanics/practiceMoments.html` | Equilibrium, uniform and non-uniform rods | `/pages/curriculum/ALevel/mechanics/moments.html` |


### GCSE Number drill specifications

Lesson-scoped and mixed-review question-bank briefs generated from the strand manifest.

**`/pages/curriculum/GCSE/number/structure/writtenMethods/practicePlaceValue.html`** — What each digit is worth in integers and decimals, and zeros as place-holders.
- Digit values — state the value of a named digit in integers to millions and decimals to thousandths (4 questions).
- Place-holders — identify or complete numbers where zeros hold whole-number or decimal places (4 questions).
- Words and figures — convert between words and figures, including internal zeros and decimal parts (4 questions).

**`/pages/curriculum/GCSE/number/structure/writtenMethods/practiceOrderingNumbers.html`** — Ordering numbers, including negatives and decimals of different lengths.
- Decimal order — choose the smallest or largest from decimals of different lengths (4 questions).
- Negative order — choose correctly ordered lists containing positive and negative integers and decimals (4 questions).
- Number lines and contexts — order values ascending or descending in number-line and temperature contexts (4 questions).

**`/pages/curriculum/GCSE/number/structure/writtenMethods/practiceInequalitySymbols.html`** — The less-than, greater-than, at-most, at-least and not-equal signs.
- Basic comparisons — choose =, < or > between integers, decimals and negative numbers (4 questions).
- Extended symbols — translate at most, at least and not equal into ≤, ≥ and ≠, including which allow equality (4 questions).
- Integer solutions — select the integers satisfying statements such as −2 < n ≤ 3 (4 questions).

**`/pages/curriculum/GCSE/number/structure/writtenMethods/practiceWrittenMethods.html`** — Adding integers and decimals in columns, lining up the point and carrying.
- Fluency — add integers and decimals of different lengths by aligning place values and padding zeros (4 questions).
- Carrying — add values that require carrying through one or more columns (4 questions).
- Application — solve addition-only money and measure problems, with units fixed by the prompt (4 questions).

**`/pages/curriculum/GCSE/number/structure/writtenMethods/practiceColumnSubtraction.html`** — Subtracting in columns with exchange, lining up decimals of different lengths.
- Fluency — subtract integers and decimals of different lengths by aligning place values and padding zeros (4 questions).
- Exchange — subtract with ordinary single-column exchanges, excluding any exchange that must pass through a zero (4 questions).
- Application — solve change and difference problems with non-negative answers and no across-zero exchange (4 questions).

**`/pages/curriculum/GCSE/number/structure/writtenMethods/practiceExchangingAcrossZeros.html`** — Subtracting when a column holds a zero, and where the exchange comes from.
- Integers — subtract values such as 3000 − 847 where an exchange passes through one or more zeros (4 questions).
- Decimals — subtract values such as 4.03 − 1.276 with zero place-holders and chained exchange (4 questions).
- Application — solve subtraction contexts whose written method requires an exchange across zeros (4 questions).

**`/pages/curriculum/GCSE/number/structure/writtenMethods/practiceLongMultiplication.html`** — Multiplying multi-digit integers, and the place-holder zero in the second row.
- Fluency — multiply two- and three-digit integers by two-digit integers using long multiplication (4 questions).
- Structure — complete missing partial products and place-holder zeros in later rows (4 questions).
- Application — solve integer-only cost and area problems by long multiplication (4 questions).

**`/pages/curriculum/GCSE/number/structure/writtenMethods/practiceDivision.html`** — Dividing by a one-digit number, carrying each remainder into the next digit.
- Fluency — divide integer and decimal dividends by one-digit divisors, carrying into the next place (4 questions).
- Exact decimals — continue past the decimal point until a one-digit division terminates exactly (4 questions).
- Structure — complete missing quotient digits or carried remainders in short-division layouts (4 questions).

**`/pages/curriculum/GCSE/number/structure/writtenMethods/practiceInterpretingRemainders.html`** — Whether a worded answer wants a remainder, a decimal, a fraction or rounding.
- Answer forms — express one-digit divisions as a remainder, exact decimal or fraction as requested (4 questions).
- Directed rounding — decide whether a one-digit division context requires rounding up or down (4 questions).
- Mixed contexts — choose the appropriate answer for coaches, boxes, tickets and leftovers; the decision is the catch (4 questions).

**`/pages/curriculum/GCSE/number/structure/writtenMethods/practiceLongDivision.html`** — Dividing by a two-digit number, continuing past the point for an exact answer.
- Integer quotients — divide by two-digit integer divisors using listed multiples and long division (4 questions).
- Exact decimals — divide integer or decimal dividends and continue past the point to an exact answer (4 questions).
- Structure and application — complete missing long-division steps or solve a context with a two-digit divisor (4 questions).

**`/pages/curriculum/GCSE/number/structure/writtenMethods/practiceGivenCalculation.html`** — Deducing new products and quotients from a stated calculation by tracking powers of ten.
- Fluency — scaling a stated integer product by powers of ten, such as 4.3 × 26 from a given 43 × 26 (4 questions).
- Quotients — deducing divisions from the stated fact, in both directions (4 questions).
- Reversed deductions — finding a missing factor or dividend from the stated fact, where blind digit-shifting gives the wrong power of ten (4 questions).

**`/pages/curriculum/GCSE/number/structure/powersAndRoots/practicePowersRoots.html`** — What the base and index mean, and writing repeated multiplication as a power.
- Fluency — direct questions on index notation and powers, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/powersAndRoots/practiceRecognisingPowers.html`** — The squares, cubes and powers of 2, 3, 4 and 5 worth recalling.
- Fluency — direct questions on recognising powers of a number, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/powersAndRoots/practiceSquareRoots.html`** — The square root as the inverse of squaring, found by reversing a known square.
- Fluency — direct questions on square roots, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/powersAndRoots/practicePositiveAndNegativeRoots.html`** — Why a squared equation has two solutions while the root sign gives one.
- Fluency — direct questions on positive and negative square roots, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/powersAndRoots/practiceCubeAndHigherRoots.html`** — Cube roots and nth roots as the inverse of a power, including negatives.
- Fluency — direct questions on cube roots and higher roots, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/directedNumber/practiceNegatives.html`** — Number-line reasoning, two signs meeting, and temperature differences.
- Fluency — direct questions on adding and subtracting negative numbers, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/directedNumber/practiceMultiplyingDividingNegatives.html`** — The sign of a product or quotient, and what several negatives together do.
- Fluency — direct questions on multiplying and dividing negative numbers, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/directedNumber/practiceOrderOfOperations.html`** — Brackets, powers and roots first, with the fraction bar as grouping.
- Fluency — direct questions on order of operations, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/directedNumber/practiceCheckingWithInverses.html`** — Undoing a calculation with its inverse to test an answer without repeating it.
- Fluency — direct questions on checking an answer with the inverse operation, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceCounting.html`** — Listing every factor of a number in pairs, so none is missed or repeated.
- Fluency — direct questions on factors and factor pairs, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practicePrimeFactors.html`** — The multiples of a number, and the tests for divisibility by 2, 3, 4, 5 and 9.
- Fluency — direct questions on multiples and divisibility tests, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practicePrimesAndPrimality.html`** — What makes a number prime, why 1 is not, and trial division up to the root.
- Fluency — direct questions on primes and testing for primality, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practicePrimeFactorisation.html`** — Factor trees and repeated division, index form, and why the primes are unique.
- Fluency — direct questions on prime factorisation, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceHCFLCM.html`** — Taking each shared prime to the lower index, and what the HCF means.
- Fluency — direct questions on highest common factor, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceLCMFromPrimeFactors.html`** — Every prime to the higher index, and why the LCM is not always the product.
- Fluency — direct questions on lowest common multiple, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceHCFLCMVenn.html`** — The Venn method for two or three numbers, and HCF times LCM as the product.
- Fluency — direct questions on hcf and lcm from a venn diagram, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceSquaresCubesFromPrimeFactors.html`** — The smallest multiplier that turns a number into a perfect square or cube.
- Fluency — direct questions on squares and cubes from prime factors, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceProductRule.html`** **(H)** — Counting combined choices with the product rule for counting.
- Fluency — multiplying choices across independent slots: menus, codes and outfits (4 questions).
- Application — arrangements and selections without repetition, the factor shrinking slot by slot (4 questions).
- Catch — repeats-forbidden against repeats-allowed on near-identical prompts, where the memorised formula picks the wrong count (4 questions).

**`/pages/curriculum/GCSE/number/structure/indexLaws/practiceSimplifyingPowers.html`** — Adding the indices, derived by counting the repeated factors on each side.
- Fluency — direct questions on multiplying powers of the same base, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/indexLaws/practiceDividingPowers.html`** — Subtracting the indices, derived by cancelling the common repeated factors.
- Fluency — direct questions on dividing powers of the same base, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/indexLaws/practiceZeroIndex.html`** — Why any non-zero number to the power zero is 1, read off the division law.
- Fluency — direct questions on the zero index, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/indexLaws/practiceNegativeIndices.html`** — A negative index as a reciprocal, making a number small rather than negative.
- Fluency — direct questions on negative indices, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/indexLaws/practicePowerOfAPower.html`** — Multiplying the indices, and telling this apart from multiplying powers.
- Fluency — direct questions on raising a power to a power, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/indexLaws/practicePowerOfAProduct.html`** — Applying an index to every factor in a bracket and both parts of a fraction.
- Fluency — direct questions on powers of a product and a quotient, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/indexLaws/practiceNegativeIndexOfAFraction.html`** — Inverting the fraction first, then applying the positive index.
- Fluency — direct questions on a negative index on a fraction, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/indexLaws/practiceUnitFractionalIndices.html`** **(H)** — The index one over n as the nth root, derived from raising a power to a power.
- Fluency — direct questions on unit fractional indices, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/indexLaws/practiceGeneralFractionalIndices.html`** **(H)** — The index m over n as a root and a power, and which one to take first.
- Fluency — direct questions on fractional indices, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/workingInStandardForm/practiceStandardFormLesson.html`** — Converting both ways for large and small numbers, and correcting near-misses.
- Fluency — direct questions on standard form, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/workingInStandardForm/practiceStandardFormOrdering.html`** — Comparing by the power of ten first, then by the front number.
- Fluency — direct questions on ordering numbers in standard form, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/workingInStandardForm/practiceStandardFormMultiplyDivide.html`** — Products, quotients and how-many-times-bigger comparisons.
- Fluency — direct questions on multiplying and dividing in standard form, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/usingACalculator/practiceCalculator.html`** — Brackets, fractions, powers, roots and negatives keyed as written.
- Fluency — direct questions on entering a calculation on a calculator, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/usingACalculator/practiceCalculatorStandardForm.html`** — The times-ten-to-the-power key, and reading answers off the display.
- Fluency — direct questions on standard form on a calculator, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/usingACalculator/practiceCalculatorExactValues.html`** — Toggling between an exact value and its decimal, and reading the full display.
- Fluency — direct questions on exact values, ans and memory, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/usingACalculator/practiceExactAnswers.html`** — Giving and recognising exact answers, as fractions or in terms of π, rather than rounded decimals.
- Fluency — single-choice questions picking the exact value of a calculation from rounded lookalikes; fraction answers appear only as choices, since the engine cannot parse a typed fraction (4 questions).
- Application — multi-step calculations whose exact answer is a fraction or a multiple of π, with the coefficient of π typed as a bare number and the form chosen (4 questions).
- Catch — recurring decimals like 0.333… offered beside 1/3, where the rounded option is the trap (3 questions).

**`/pages/curriculum/GCSE/number/structure/surds/practiceSimplifyingSurds.html`** **(H)** — Extracting the largest square factor to write a√b, and comparing surds.
- Fluency — direct questions on simplifying surds, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/surds/practiceAddingSubtractingSurds.html`** **(H)** — Collecting like surds after simplifying every term.
- Fluency — direct questions on adding and subtracting surds, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/surds/practiceMultiplyingSurds.html`** **(H)** — Multiplying roots and coefficients separately, then simplifying the result.
- Fluency — direct questions on multiplying surds, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/surds/practiceSquaringASurd.html`** **(H)** — Why a root times itself gives the number back, and what a coefficient does.
- Fluency — direct questions on squaring a surd, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/surds/practiceDividingSurds.html`** **(H)** — Dividing under a single root, and simplifying quotients with coefficients.
- Fluency — direct questions on dividing surds, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/surds/practiceExpandingSurds.html`** **(H)** — Single and double brackets, squaring one, and the difference of two squares.
- Fluency — direct questions on expanding brackets with surds, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/surds/practiceRationalisingDenominators.html`** **(H)** — Clearing a single surd from the bottom of a fraction by multiplying by one.
- Fluency — direct questions on rationalising a denominator, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/fractions/calculatingWithFractions/practiceMultiplyingDividingMixedNumbers.html`** — Multiplying and dividing mixed numbers by converting to improper fractions.
- Fluency — direct questions on multiplying and dividing mixed numbers, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/measures/errorIntervals/practiceErrorIntervalsRounding.html`** — The interval a rounded value came from, half a unit either side.
- Fluency — direct questions on error intervals from rounding, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/number/structure/writtenMethods/practicePlaceValueReview.html`** *(mixed review)* — Reading decimal place value: digit values, ordering with inequality symbols, and scaling by powers of ten.
- Fluency — digit values in decimals, and single-choice questions naming the smallest or largest of a list including negatives (4 questions).
- Ordering — choosing the correct inequality symbol between two values, and single-choice questions picking the correctly ordered list; no ordering is ever typed (4 questions).
- Powers of ten — multiplying and dividing by 10, 100, 1000, 0.1 and 0.01, ending with a division by 0.1 that catches the 'dividing makes smaller' reflex (4 questions).

**`/pages/curriculum/GCSE/number/structure/writtenMethods/practiceWrittenMethodsReview.html`** *(mixed review)* — Adding, subtracting and multiplying decimals by written column methods, exchanging across zeros included.
- Fluency — column addition and subtraction of decimals of different lengths, including exchanging across zeros like 4.03 − 1.276; decimal operands keep every question past the KS2 drill (4 questions).
- Long multiplication — decimal pairs via the integer product, placing the point by counting decimal places and checking against an estimate (4 questions).
- Application — worded money and measure problems with the unit fixed in the prompt and a bare number demanded (money always pounds to two decimal places), ending with a subtraction like 12 − 3.475 that catches unpadded columns (4 questions).

**`/pages/curriculum/GCSE/number/structure/writtenMethods/practiceDivisionReview.html`** *(mixed review)* — Dividing by short and long division into exact decimal answers, turning decimal divisors into integer ones, and interpreting remainders in context.
- Fluency — short and long division continued past the point into exact decimal answers, two-digit divisors included; the decimal continuation keeps it past the KS2 integer-remainder drill (4 questions).
- Decimal divisors — rewriting divisions like 55.2 ÷ 0.46 as integer equivalents before dividing (4 questions).
- Remainders in context — worded problems needing long division by a two-digit divisor first, then the round-up, round-down or state-the-leftover decision; the choice is the catch (4 questions).

**`/pages/curriculum/GCSE/number/structure/powersAndRoots/practicePowersRootsReview.html`** *(mixed review)* — Evaluating powers and roots without a calculator, and deciding whether the result is rational.
- Fluency — index notation, evaluating squares, cubes and small powers, recognising numbers like 64 as powers (4 questions).
- Roots — square, cube and higher roots, cube roots of negatives, and x² = k answered either as a single choice naming all solutions or by typing the negative root; no question ever asks for two typed values (5 questions).
- Rational or irrational — single-choice classification where √(9/16) and √0.25 catch the 'roots are irrational' reflex; fraction-valued answers appear only as choice options (3 questions).

**`/pages/curriculum/GCSE/number/structure/directedNumber/practiceNegativesReview.html`** *(mixed review)* — Adding, subtracting, multiplying and dividing negative numbers, including decimals and powers of negatives.
- Fluency — adding and subtracting with double signs, including decimal values (4 questions).
- Multiplying and dividing — sign chains of three or more factors and decimal quotients (4 questions).
- Powers and context — powers of negatives, where (−2)⁴ against −2⁴ catches the memorised rule, then worded temperature and balance problems (4 questions).

**`/pages/curriculum/GCSE/number/structure/directedNumber/practiceOrderOfOperationsReview.html`** *(mixed review)* — Evaluating multi-step calculations in the right order, and recognising valid reorderings and inverse checks.
- Fluency — multi-step BIDMAS with indices, brackets and fraction bars (5 questions).
- Reordering — single-choice questions picking which regrouping of a calculation is valid and mental, alternated with separate numeric questions evaluating a regrouped calculation; one answer per question (4 questions).
- Checking — choosing the inverse calculation that checks a given result, then a final expression where left-to-right working gives a plausible wrong answer (4 questions).

**`/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practicePrimeFactorsReview.html`** *(mixed review)* — Writing a number as a product of prime factors in index form, and reading its structure from the indices — three-digit numbers and beyond, past the KS3 drill.
- Fluency — divisibility tests and prime-or-not decisions on numbers like 91, 97 and 117 (4 questions).
- Factorising — single-choice questions picking the correct index-form factorisation of a three-digit number from near-miss options, and typed questions stating the index of a named prime in it; the engine cannot read a typed expression (4 questions).
- Structure — smallest multiplier to make a square or cube, and counting factors from the indices; both fail anyone who can only draw the tree (4 questions).

**`/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceHCFLCMReview.html`** *(mixed review)* — Finding the HCF and LCM of two or three numbers from prime factors, and choosing which a problem needs — past the two-number KS3 drill.
- Fluency — HCF and LCM from given index-form factorisations of numbers past 100, with shared and separate prime factors presented as text lists (the structure the Venn diagram shows, without generated graphics); larger numbers than the KS3 drill (4 questions).
- Harder cases — three numbers, and the smallest possible number with both its HCF and LCM with another stated, pinned so the generated answer is unique (4 questions).
- Worded — bus, tile and gear problems where deciding between HCF and LCM is the mark (4 questions).

**`/pages/curriculum/GCSE/number/structure/factorsAndPrimes/practiceCountingReview.html`** *(mixed review)* — Counting possibilities exactly by systematic listing.
- Fluency — listing factor pairs systematically, marked by the number of pairs or the missing partner of a given factor; counting all factors is left to the prime-factorisation drill (4 questions).
- Systematic listing — counting arrangements and choices by ordered listing, small enough to enumerate (4 questions).
- Constraints — listings with a fixed first digit or no repeats allowed, where unsystematic listing double-counts or misses cases (4 questions).

**`/pages/curriculum/GCSE/number/structure/indexLaws/practiceSimplifyingPowersReview.html`** *(mixed review)* — Simplifying powers with the multiply, divide and power-of-a-power laws, and solving equations in the index — combined laws and larger indices, past the KS3 one-law drill; negative and fractional indices stay in the existing Index laws drill.
- Warm-up — one law at a time with indices larger than the KS3 drill uses, plus the zero index (3 questions).
- Combined — several laws in one simplification, powers of products and quotients included, answered as single choices between index-form expressions since the engine cannot read a typed expression (5 questions).
- Index equations — typed numeric answers solving for the index, ending with mixed bases like 2ˣ × 4 = 2⁷ that catch 'just add the indices' (4 questions).

**`/pages/curriculum/GCSE/number/structure/usingACalculator/practiceCalculatorReview.html`** *(mixed review)* — Evaluating multi-step calculations on a calculator at full accuracy, rounding only at the final answer.
- Fluency — keying fraction bars, roots and powers in one go, rounding to 3 significant figures (4 questions).
- Standard form — entering and reading ×10ⁿ values on the calculator display (3 questions).
- Full accuracy — chained calculations using Ans, built so rounding mid-way gives a visibly wrong final answer that the marking rejects (5 questions).

### GCSE Algebra drill specifications

Lesson-scoped and mixed-review question-bank briefs generated from the strand manifest.

**`/pages/curriculum/GCSE/algebra/notation/substitution/practiceSubstitution.html`** — Replacing each letter with a number, then evaluating in the right order.
- Fluency — direct questions on substituting into an expression, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/substitution/practiceSubstitutingNegatives.html`** — Substituting a negative value with brackets, so the sign survives squaring.
- Fluency — direct questions on substituting negative numbers, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/substitution/practiceSubstitutingWithPowers.html`** — Why 3x² means square first then multiply by 3, so x = 4 gives 48 not 144.
- Fluency — direct questions on substituting into terms with powers, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/simplifying/practiceSimplifyingTerms.html`** — Combining like terms, each term carrying the sign in front of it.
- Fluency — direct questions on collecting like terms, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/simplifying/practiceLikeTermsWithPowers.html`** — Why x and x² are unlike terms, and collecting expressions that mix them.
- Fluency — direct questions on like terms with powers, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/simplifying/practiceMultiplyingTerms.html`** — Multiplying coefficients and letters separately, so 3a × 4b is 12ab.
- Fluency — direct questions on multiplying terms, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/expandingBrackets/practiceExpandFactorise.html`** — Multiplying every term in one bracket by every term in the other.
- Fluency — direct questions on expanding double brackets, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/expandingBrackets/practiceDoubleBracketsWithCoefficients.html`** — Expanding (2x + 3)(3x − 1), keeping track of the middle terms.
- Fluency — direct questions on double brackets with coefficients, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/expandingBrackets/practiceSquaringABracket.html`** — Writing (x + 4)² as a full double bracket, never just x² + 16.
- Fluency — direct questions on squaring a bracket, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/factorising/practiceFactorisingQuadratics.html`** — Factorising x² + bx + c from a pair of numbers that add to b and multiply to c.
- Fluency — direct questions on factorising a quadratic expression, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/formulae/practiceRearranging.html`** — Rearranging a formula so a different letter stands alone on one side.
- Fluency — direct questions on changing the subject of a formula, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/formulae/practiceRearrangingPowersAndRoots.html`** — Changing the subject when it sits inside a square, a root or a fraction.
- Fluency — direct questions on rearranging with squares and roots, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/algebraicFractions/practiceAlgebraicFractions.html`** **(H)** — Factorising before cancelling, since only a factor cancels, never a term.
- Fluency — direct questions on simplifying an algebraic fraction, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/algebraicFractions/practiceMultiplyingDividingAlgebraicFractions.html`** **(H)** — Cancelling before multiplying, and dividing as multiplying by the reciprocal.
- Fluency — direct questions on multiplying and dividing algebraic fractions, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/functions/practiceFunctions.html`** **(H)** — Reading f(x) as the output at x, and evaluating f(3) and 2f(1).
- Fluency — direct questions on function notation, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/functions/practiceInverseFunctions.html`** **(H)** — Finding f⁻¹(x) by rearranging y = f(x), and how the inverse undoes it.
- Fluency — direct questions on inverse functions, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceStraightLines.html`** — Measuring steepness as rise over run, the sign showing climb or fall.
- Fluency — direct questions on the gradient of a line, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceGradientInterceptForm.html`** — Reading the gradient and y-intercept straight from the equation.
- Fluency — direct questions on the equation y = mx + c, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceReadingALineEquation.html`** — Finding the intercept on the y-axis and the gradient from a whole-square triangle.
- Fluency — direct questions on reading an equation off a graph, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceRearrangingLineEquations.html`** — Rearranging equations like 2x + 3y = 6 before reading the gradient off.
- Fluency — direct questions on lines not written as y = mx + c, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceLineThroughAPoint.html`** — Substituting the point into y = mx + c to find c, then writing the equation out.
- Fluency — direct questions on the line through a point with a given gradient, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceLineThroughTwoPoints.html`** — Finding the gradient from the two points, then the intercept from either.
- Fluency — direct questions on the line through two points, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceParallelLines.html`** — Lines with equal gradients never meet, and writing a parallel line’s equation.
- Fluency — direct questions on parallel lines, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/practiceQuadraticGraphs.html`** — Reading roots off the x-axis and the intercept off the y-axis.
- Fluency — direct questions on roots and intercepts on a quadratic graph, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/practiceQuadraticTurningPoints.html`** — Reading the minimum or maximum off the graph, halfway between the roots.
- Fluency — direct questions on turning points on a quadratic graph, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/graphs/realLifeGraphs/practiceDistanceTime.html`** — Speed as the gradient, rest as a flat section, not a picture of the road.
- Fluency — direct questions on distance–time graphs, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/graphs/graphTransformations/practiceGraphTransformations.html`** **(H)** — The graph of f(x) + a as the original slid a units vertically.
- Fluency — direct questions on translating a graph up and down, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/graphs/graphTransformations/practiceHorizontalTranslations.html`** **(H)** — The graph of f(x + a) as a slide of a units, opposite to the sign.
- Fluency — direct questions on translating a graph left and right, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/graphs/circle/practiceCircleEquation.html`** **(H)** — Why x² + y² = r² describes a circle centred at the origin.
- Fluency — direct questions on the equation of a circle, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/graphs/circle/practiceTangentToACircle.html`** **(H)** — Finding the tangent’s equation from the radius it is perpendicular to.
- Fluency — direct questions on the tangent to a circle at a point, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceEquations.html`** — Undoing operations in reverse order, keeping both sides balanced.
- Fluency — direct questions on solving two-step equations, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceUnknownOnBothSides.html`** — Collecting the unknowns on one side and the numbers on the other.
- Fluency — direct questions on unknowns on both sides, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceEquationsWithBrackets.html`** — Expanding the brackets first, or dividing both sides straight away.
- Fluency — direct questions on equations with brackets, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceEquationsWithFractions.html`** — Clearing fractions by multiplying every term by the common denominator.
- Fluency — direct questions on equations with fractions, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/quadraticEquations/practiceSolvingByFactorising.html`** — Factorising, then setting each bracket to zero, since a factor must be zero.
- Fluency — direct questions on solving a quadratic by factorising, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/quadraticEquations/practiceQuadraticsMissingConstant.html`** — Solving x² = 5x by factorising, since dividing by x loses the root x = 0.
- Fluency — direct questions on quadratics with no constant term, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/quadraticEquations/practiceRearrangingBeforeSolving.html`** **(H)** — Collecting everything on one side equal to zero before factorising.
- Fluency — direct questions on rearranging a quadratic before solving, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/quadraticEquations/practiceSolvingByCompletingTheSquare.html`** **(H)** — Solving from completed square form by rooting both sides, plus and minus.
- Fluency — direct questions on solving by completing the square, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceSimultaneous.html`** — Adding or subtracting equations to remove one unknown, then substituting back.
- Fluency — direct questions on simultaneous equations by elimination, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceScalingBeforeEliminating.html`** — Multiplying one or both equations so a pair of coefficients match.
- Fluency — direct questions on scaling before eliminating, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceSimultaneousBySubstitution.html`** — Replacing one unknown with an expression from the other equation.
- Fluency — direct questions on simultaneous equations by substitution, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceFormingSimultaneousEquations.html`** — Turning two facts about two unknowns into a pair of equations to solve.
- Fluency — direct questions on forming simultaneous equations from a problem, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceLinearQuadraticSimultaneous.html`** **(H)** — Substituting the linear equation into the quadratic, pairing each x with its y.
- Fluency — direct questions on a linear and a quadratic equation together, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/inequalities/practiceInequalities.html`** — Solving with the balance method while keeping the inequality sign, since the answer is a range, not a value.
- Fluency — direct questions on solving a linear inequality, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/inequalities/practiceReversingTheInequality.html`** — Multiplying or dividing by a negative flips the sign, every time and not just sometimes.
- Fluency — direct questions on when the inequality sign reverses, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/inequalities/practiceIntegerSolutions.html`** — Listing the whole numbers a solution range contains, checking whether each endpoint is in or out.
- Fluency — direct questions on integer solutions of an inequality, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/formingEquations/practiceFormingEquations.html`** — Naming the unknown, turning the facts into an equation, and checking the answer back in the story.
- Fluency — direct questions on forming an equation from words, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/formingEquations/practiceEquationsFromShapes.html`** — Using angle sums, perimeters and areas to set up an equation, then answering the geometric question asked.
- Fluency — direct questions on equations from angles and perimeters, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/sequences/generatingSequences/practiceGeneratingSequences.html`** — Continuing a sequence by the rule that moves one term to the next, stated with a starting term.
- Fluency — direct questions on term-to-term rules, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/sequences/generatingSequences/practicePositionToTermRules.html`** — Generating any term straight from its position, without stepping through every term before it.
- Fluency — direct questions on position-to-term rules, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/practiceNthTerm.html`** — The common difference as the multiplier of n, adjusted by a constant — a formula, not the rule add 4.
- Fluency — direct questions on the nth term of a linear sequence, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/practiceUsingAnNthTerm.html`** — Finding a stated term, and testing whether a number belongs by solving for n and demanding a whole number.
- Fluency — direct questions on using an nth term, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/practiceDecreasingSequences.html`** — Sequences with a negative common difference, whose nth term starts with a negative multiple of n.
- Fluency — direct questions on decreasing linear sequences, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/sequences/quadraticSequences/practiceSpottingQuadraticSequences.html`** — Taking differences twice, since a constant second difference is the signature of an n² term.
- Fluency — direct questions on spotting a quadratic sequence, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/sequences/quadraticSequences/practiceQuadraticNthTerm.html`** **(H)** — Halving the second difference for the n² coefficient, then fixing what is left with a linear nth term.
- Fluency — direct questions on the nth term of a quadratic sequence, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/expandingBrackets/practiceExpandFactoriseReview.html`** *(mixed review)* — Expanding double brackets and factorising quadratics, including the difference of two squares.
- Fluency — expanding double brackets including coefficients and squared brackets like (x + 4)², answered as single choices between expansions since the engine cannot read a typed expression (4 questions).
- Factorising — quadratics x² + bx + c with negative constants included, chosen from near-miss bracket pairs that swap or mis-sign the numbers (4 questions).
- Difference of two squares — factorising x² − 49 and 4x² − 9, with (x − 7)² offered as the trap for anyone squaring instead (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/simplifying/practiceSimplifyingTermsReview.html`** *(mixed review)* — Simplifying expressions by collecting like terms and multiplying and dividing single terms.
- Fluency — collecting like terms in expressions with two letters and both signs, answered as single choices between simplified forms since the engine cannot read a typed expression (4 questions).
- Products and quotients — simplifying terms like 3a × 4b and 12ab ÷ 4a, coefficients and letters handled separately (4 questions).
- Powers — collecting expressions that mix x and x², where combining 3x and 2x² into 5x³ is the offered trap (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/substitution/practiceSubstitutionReview.html`** *(mixed review)* — Substituting positive and negative values into expressions and formulae, powers handled in the right order.
- Fluency — substituting positive integers into two-term expressions, answers typed as numbers (4 questions).
- Formulae — evaluating v = u + at, s = ut + ½at² and similar with every value given and chosen so no calculator is needed (4 questions).
- Negatives and powers — substituting x = −3 into 3x², x² − x and 2 − x, where an unbracketed −3 squared gives the wrong sign (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/formulae/practiceRearrangingReview.html`** *(mixed review)* — Changing the subject of a formula, including subjects inside squares, roots and appearing twice.
- Fluency — two-step rearrangements of formulae like v = u + at for t, answered as single choices between rearrangements since the engine cannot read a typed expression (4 questions).
- Squares and roots — making the letter inside a square, root or fraction the subject, undoing the outermost operation first (4 questions).
- Subject twice — rearrangements needing the subject gathered and factorised out, with the one-copy-moved version among the wrong choices (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/algebraicFractions/practiceAlgebraicFractionsReview.html`** **(H)** *(mixed review)* — Manipulating algebraic fractions by factorising and cancelling common factors, never single terms.
- Fluency — simplifying fractions whose top and bottom factorise, answered as single choices between simplified forms (4 questions).
- Multiplying and dividing — products and quotients that cancel to a simple form after factorising (4 questions).
- Adding and catching — sums and differences over a common denominator, with the term-cancelled fraction offered as the trap (4 questions).

**`/pages/curriculum/GCSE/algebra/notation/functions/practiceFunctionsReview.html`** **(H)** *(mixed review)* — Evaluating functions, inverse functions and composite functions at given values from formal notation.
- Fluency — evaluating f(3), f(−2) and 2f(1) from a given linear or quadratic rule, answers typed as numbers (4 questions).
- Composites — evaluating fg(2) and gf(2) from two given rules, where applying the functions in the wrong order changes the answer (4 questions).
- Inverses — choosing f⁻¹(x) as a single choice, then evaluating it at a value, with 1/f(x) offered as the classic wrong reading (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/linearEquations/practiceEquationsReview.html`** *(mixed review)* — Solving linear and quadratic equations by the balance method, factorising, completing the square and the formula.
- Linear fluency — equations with brackets, fractions and unknowns on both sides, solutions arranged to come out as integers or exact decimals (4 questions).
- Factorising — quadratics solved after any rearrangement, answered as single choices naming both roots, with x² = 5x and its lost root x = 0 among them (4 questions).
- Higher methods — completing the square and the formula on quadratics with surd answers, chosen from exact forms rather than typed (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/simultaneousEquations/practiceSimultaneousReview.html`** *(mixed review)* — Solving simultaneous equations by elimination and substitution, including a linear and a quadratic pair.
- Fluency — elimination with and without scaling first, each unknown asked for as its own typed answer (4 questions).
- Worded and graphical — forming a pair from tickets-and-totals problems, and naming the crossing point that solves a graphed pair, coordinates given in the choices (4 questions).
- Linear and quadratic — Higher pairs solved by substituting the line into the quadratic, answered as single choices pairing each x with its own y (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/inequalities/practiceInequalitiesReview.html`** *(mixed review)* — Solving linear inequalities and recording their solution sets, reversing the sign when dividing by a negative.
- Fluency — two-step inequalities with integer boundaries, answered as single choices between solution ranges (4 questions).
- Integer solutions — listing or counting the integers satisfying an inequality or a double inequality like 3 < 2x + 1 ≤ 9 (4 questions).
- The flip — inequalities that divide by a negative, with the unflipped range always among the wrong choices (4 questions).

**`/pages/curriculum/GCSE/algebra/equations/formingEquations/practiceFormingEquationsReview.html`** *(mixed review)* — Forming an equation from a worded or geometric problem and solving it.
- Fluency — think-of-a-number puzzles, the equation formed and its whole-number solution typed (4 questions).
- Shapes — angle-sum and perimeter problems where the equation comes from a geometric fact, answers exact (4 questions).
- Quadratic contexts — area and consecutive-number problems leading to a factorisable quadratic, where the negative root must be rejected (4 questions).

**`/pages/curriculum/GCSE/algebra/graphs/straightLineGraphs/practiceStraightLinesReview.html`** *(mixed review)* — Finding gradients and intercepts, and writing the equation of a line through given points, parallel or perpendicular to another.
- Fluency — gradients from two points and gradient–intercept reading from equations, including lines like 2x + 3y = 6 that need rearranging first (4 questions).
- Writing equations — the line through a point with a given gradient, and through two points, chosen from candidate equations (4 questions).
- Parallel and perpendicular — matching and writing related lines, where the perpendicular gradient must be the negative reciprocal, not just the negative (4 questions).

**`/pages/curriculum/GCSE/algebra/graphs/quadraticGraphs/practiceQuadraticGraphsReview.html`** *(mixed review)* — Reading roots, intercepts and turning points of a quadratic from its factorised form.
- Fluency — roots and y-intercepts from factorised form, typed as numbers with their signs (4 questions).
- Turning points — the x-coordinate midway between the roots by symmetry, then the y-coordinate by substitution (4 questions).
- Matching — pairing equations with described sketches by roots, intercept and opening direction, where the sign of the x² term is the catch (4 questions).

**`/pages/curriculum/GCSE/algebra/graphs/realLifeGraphs/practiceDistanceTimeReview.html`** *(mixed review)* — Reading speeds, distances and accelerations from distance–time and velocity–time journeys, gradient by gradient.
- Fluency — the speed of a single journey segment from its distance and time, arranged to divide exactly (4 questions).
- Whole journeys — total distance and average speed across a journey with a rest, where averaging the two speeds is the trap (4 questions).
- Velocity–time — acceleration as the gradient and distance as the area under constant and straight-line sections, all values exact (4 questions).

**`/pages/curriculum/GCSE/algebra/graphs/graphTransformations/practiceGraphTransformationsReview.html`** **(H)** *(mixed review)* — Tracking translations and reflections of a graph through its equation and the image of a marked point.
- Fluency — naming the equation after a described translation of y = f(x), chosen from f(x) + a, f(x + a) and their sign variants (4 questions).
- Image points — the new coordinates of a marked point after a stated translation or reflection, typed exactly (4 questions).
- Direction catch — f(x + a) against f(x) + a on near-identical prompts, where the horizontal shift runs against the sign (4 questions).

**`/pages/curriculum/GCSE/algebra/graphs/circle/practiceCircleEquationReview.html`** **(H)** *(mixed review)* — Using x² + y² = r² to find radii, test points and build tangent equations at a point.
- Fluency — the radius from a circle’s equation and the equation from a radius, squares kept exact (4 questions).
- Points — testing whether a point lies on, inside or outside a given circle by substitution (4 questions).
- Tangents — the gradient of the radius to a point, the perpendicular tangent gradient, and the tangent’s equation as a single choice (4 questions).

**`/pages/curriculum/GCSE/algebra/sequences/linearNthTerm/practiceNthTermReview.html`** *(mixed review)* — Finding and using the nth term of linear and quadratic sequences.
- Fluency — nth terms of increasing and decreasing linear sequences, chosen from formulae with the term-to-term rule among the traps (4 questions).
- Using the formula — finding a stated term and testing whether a number belongs to the sequence, answers exact (4 questions).
- Quadratic — Higher questions halving the constant second difference and finishing the formula, with generated terms checked by substitution (4 questions).

**`/pages/curriculum/GCSE/algebra/sequences/generatingSequences/practiceGeneratingSequencesReview.html`** *(mixed review)* — Generating sequence terms from term-to-term rules, position-to-term rules and recurrence relations.
- Fluency — the next two terms from a stated term-to-term rule and starting value, typed as numbers (4 questions).
- Position rules — terms straight from an nth term formula, including the tenth term without listing the nine before it (4 questions).
- Recurrence — terms from rules like xₙ₊₁ = 2xₙ − 3, including Fibonacci-type rules that use the two terms before (4 questions).

### GCSE Ratio drill specifications

Lesson-scoped and mixed-review question-bank briefs generated from the strand manifest.

**`/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceRatioNotation.html`** — Recording comparisons with the colon, why order matters, and three-part ratios.
- Fluency — direct questions on ratio notation, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceSimplifyingRatios.html`** — Dividing every part by the same factor, so 12 : 18 becomes 2 : 3.
- Fluency — direct questions on simplifying a ratio, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceRatiosWithUnits.html`** — Converting to the same unit before simplifying, and why the ratio is unitless.
- Fluency — direct questions on ratios with mixed units, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceOneToNRatios.html`** — Dividing both parts by one of them so scales and mixtures compare directly.
- Fluency — direct questions on writing a ratio in the form 1 : n, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practicePartToPartAndPartToWhole.html`** — Telling the two kinds of ratio apart, and converting each into the other.
- Fluency — direct questions on part:part and part:whole ratios, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceFractionsOfTheWhole.html`** — Reading the fraction of the whole each part represents, and working back.
- Fluency — direct questions on from a ratio to fractions of the whole, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/ratio/sharing/practiceSharing.html`** — Sharing an amount in a given ratio by finding the value of one part first.
- Fluency — direct questions on dividing a quantity in a ratio, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/ratio/sharing/practiceWhenOnePartIsKnown.html`** — Recovering the total and the other shares when only one part's value is given.
- Fluency — direct questions on finding the whole from one share, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/ratio/sharing/practiceWhenTheDifferenceIsKnown.html`** — Finding one part from the difference between shares, then rebuilding the total.
- Fluency — direct questions on sharing when the difference is given, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/ratio/sharing/practiceExpressingADivisionAsARatio.html`** — Turning stated amounts back into a ratio in simplest form, in the order named.
- Fluency — direct questions on writing a division as a ratio, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/ratio/sharing/practiceMixingAndConcentrations.html`** — Ratios in paint mixes and concentrations, and comparing mixture strengths.
- Fluency — direct questions on mixing and concentration problems, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/ratio/mapsAndScaleDrawings/practiceScaleDrawings.html`** — The multiplier from object lengths to image lengths, and back by dividing.
- Fluency — direct questions on scale factors, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/ratio/mapsAndScaleDrawings/practiceScaleDrawingsLesson.html`** — Using a stated scale such as 1 cm to 2 m to link drawing and real object.
- Fluency — direct questions on scale drawings, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/ratio/similarShapes/practiceSimilarShapes.html`** — Finding missing lengths with the length factor from any corresponding pair.
- Fluency — direct questions on lengths in similar shapes, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/ratio/similarShapes/practiceAreasOfSimilarShapes.html`** **(H)** — Why the area scale factor is the square of the length factor, shown by tiling.
- Fluency — direct questions on areas of similar shapes, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/ratio/similarShapes/practiceVolumesOfSimilarShapes.html`** **(H)** — Why the volume scale factor is the cube of the length factor, used both ways.
- Fluency — direct questions on volumes of similar shapes, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceProportionAsEqualRatios.html`** — Two pairs of quantities are in proportion when their ratios are equal.
- Fluency — direct questions on proportion as equality of ratios, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceProportion.html`** — Direct proportion: multiply one quantity and the other multiplies the same way.
- Fluency — direct questions on direct proportion, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceUnitaryMethod.html`** — Finding the value of one unit first, then scaling up to any number of units.
- Fluency — direct questions on the unitary method, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceScalingARecipe.html`** — Scaling every ingredient by the same factor, and serving-size questions.
- Fluency — direct questions on scaling a recipe, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/proportion/usingInverseProportion/practiceInverseProportion.html`** — Inverse proportion: multiply one, and the other divides by the same factor.
- Fluency — direct questions on inverse proportion, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/proportion/usingInverseProportion/practiceInverseProportionProblems.html`** — Workers and time, speed and journey time, solved by finding the fixed product.
- Fluency — direct questions on inverse proportion problems, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/practiceProportionEquations.html`** **(H)** — Finding k from one pair of values, then using the equation in both directions.
- Fluency — direct questions on constructing y = kx, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/practiceInverseProportionEquations.html`** **(H)** — Writing inverse proportion as y = k/x, since it means proportional to 1/x.
- Fluency — direct questions on constructing y = k/x, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/percentage/multipliers/practicePercentageChange.html`** — Adding the percentage to 100% as a decimal, so a 12% rise becomes ×1.12.
- Fluency — direct questions on the multiplier for an increase, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/percentage/multipliers/practiceMultipliersForDecrease.html`** — Subtracting the percentage from 100%, so a 15% fall becomes ×0.85, not ×0.15.
- Fluency — direct questions on the multiplier for a decrease, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/percentage/multipliers/practiceReadingAMultiplier.html`** — Recovering the change a multiplier applies, where ×0.88 hides a 12% fall.
- Fluency — direct questions on reading a multiplier, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/percentage/comparingChange/practiceProfitLoss.html`** — Dividing the change by the original amount, never the new one, as a percentage.
- Fluency — direct questions on measuring a change as a percentage, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/percentage/comparingChange/practiceProfitAndLoss.html`** — Profit or loss as a percentage of the cost price the seller originally paid.
- Fluency — direct questions on percentage profit and loss, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/percentage/reverseProblems/practiceOriginalAfterAnIncrease.html`** — Recovering the pre-increase amount by dividing by the multiplier, as with VAT.
- Fluency — direct questions on the original after an increase, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/percentage/reverseProblems/practiceOriginalAfterADecrease.html`** — Recovering the full price from a sale price by dividing by the multiplier.
- Fluency — direct questions on the original after a decrease, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/percentage/reverseProblems/practiceSpottingReverseProblems.html`** — Deciding whether a question states the original amount or the changed one.
- Fluency — direct questions on spotting a reverse problem, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/practiceSimpleInterest.html`** — Interest paid on the starting amount only, so the same sum is added every year.
- Fluency — direct questions on simple interest, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/practiceRepeatedChange.html`** — Applying the same change repeatedly by raising the multiplier to a power.
- Fluency — direct questions on repeated percentage change, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/percentage/interestAndRepeatedChange/practiceSimpleVersusCompoundInterest.html`** — Why the same rate pays differently under the two schemes, and the widening gap.
- Fluency — direct questions on simple versus compound interest, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/practiceCompoundMeasures.html`** — Using speed as distance per unit time to find any quantity from the other two.
- Fluency — direct questions on speed, distance and time, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/practiceAverageSpeed.html`** — Total distance divided by total time, not an average of the two speeds.
- Fluency — direct questions on average speed, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/practiceDensityMassVolume.html`** — Using density as mass per unit volume, with the units naming the formula.
- Fluency — direct questions on density, mass and volume, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/practiceDensityOfAMixture.html`** — Totalling mass and volume separately, never averaging the two densities.
- Fluency — direct questions on the density of a mixture, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/practiceRatesOfPay.html`** — Hourly pay as money per unit time, including part hours and overtime rates.
- Fluency — direct questions on rates of pay, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/practiceRates.html`** — The price of one unit as a rate, multiplied or divided to cost any amount.
- Fluency — direct questions on unit pricing, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/practiceRatesOfFlow.html`** — Filling and emptying at a stated volume per unit time, and how long it takes.
- Fluency — direct questions on rates of flow, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/compound/ratesOnGraphs/practiceSpeedFromADistanceTimeGraph.html`** — Speed as the gradient of each straight section; horizontal means stopped.
- Fluency — direct questions on speed from a distance–time graph, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceGrowthDecay.html`** — Interest paid on the balance, so each year's interest earns interest itself.
- Fluency — direct questions on compound interest, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceCompoundInterestFormula.html`** — Raising the multiplier to the number of years to reach the balance in one step.
- Fluency — direct questions on the compound interest formula, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceDepreciation.html`** — A value falling by a fixed percentage each year, via a multiplier below 1.
- Fluency — direct questions on depreciation, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceFindingHowLong.html`** — Multiplying period by period until a target is passed, counting whole periods.
- Fluency — direct questions on finding how long growth takes, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/growth/exponentialChange/practiceExponentialGrowth.html`** — Quantities multiplied by the same factor each period, slowly then very fast.
- Fluency — direct questions on exponential growth, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/growth/exponentialChange/practiceExponentialDecay.html`** — Repeated multiplication by a factor below 1, never quite reaching zero.
- Fluency — direct questions on exponential decay, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/ratio/ratio/notationAndSimplifying/practiceSimplifyingRatiosReview.html`** *(mixed review)* — Simplifying a ratio to its simplest form or 1 : n, and moving between a ratio and the fractions of the whole.
- Fluency — simplifying two- and three-part ratios, including pairs with mixed units like 40 cm : 1 m converted before simplifying (4 questions).
- The form 1 : n — dividing through by one part, decimal answers exact by construction, and part:part rewritten as part:whole (4 questions).
- Ratios and fractions — the fraction of the whole one part represents, and one part as a fraction or multiple of another, where 2 : 3 read as 2/3 of the total is the trap (4 questions).

**`/pages/curriculum/GCSE/ratio/ratio/sharing/practiceSharingReview.html`** *(mixed review)* — Dividing a quantity in a given ratio, recovering the whole from partial information, and combining two ratios.
- Fluency — sharing amounts in two- and three-part ratios, every share a whole number of pounds or grams (4 questions).
- Working backwards — finding the whole from one known share or from the difference between two shares, and writing a completed division back as a ratio (4 questions).
- Combining and context — merging a : b with b : c, and mixture problems where treating a part as the whole is the planted error (4 questions).

**`/pages/curriculum/GCSE/ratio/ratio/mapsAndScaleDrawings/practiceScaleDrawingsReview.html`** *(mixed review)* — Converting between drawing, map and real distances with stated scales and scale factors.
- Fluency — real lengths from drawing lengths and back, with scales stated as 1 cm to 2 m and as scale factors (4 questions).
- Map scales — ratio scales like 1 : 25 000 across unit changes, chosen so every distance comes out as an exact number of centimetres or kilometres (4 questions).
- Both directions — finding the scale from a matched pair of lengths, and reversed questions where multiplying instead of dividing gives the planted wrong answer (4 questions).

**`/pages/curriculum/GCSE/ratio/ratio/similarShapes/practiceSimilarShapesReview.html`** *(mixed review)* — Using the length, area and volume scale factors of similar shapes, and converting between them.
- Fluency — missing lengths in similar shapes from a stated pair of corresponding sides, integer factors throughout (4 questions).
- Areas and volumes — squaring and cubing an integer length factor to scale an area or a volume exactly (4 questions).
- Choosing the factor — given an area or volume factor, recovering the length factor by roots of perfect squares and cubes, where applying the length factor unchanged is the trap (4 questions).

**`/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceProportionReview.html`** *(mixed review)* — Solving direct and inverse proportion problems, and recognising which kind of proportion a situation shows.
- Fluency — direct proportion by the unitary method, costs and quantities chosen to divide exactly (4 questions).
- Inverse proportion — workers, taps and journey times solved through the fixed product (4 questions).
- Which proportion — single-choice decisions between direct, inverse and neither from short tables, where both columns increasing is the bait for direct (4 questions).

**`/pages/curriculum/GCSE/ratio/proportion/usingDirectProportion/practiceBestBuys.html`** *(mixed review)* — Scaling a recipe and comparing value for money through unit prices.
- Fluency — scaling recipe ingredients up and down, including factors like 1.5 with every amount exact (4 questions).
- Best buys — price per unit or amount per penny across two pack sizes, numbers built to divide exactly (4 questions).
- Offers — deals like three-for-two against a bigger pack, where the larger pack is not always the better buy (4 questions).

**`/pages/curriculum/GCSE/ratio/proportion/graphsAndEquations/practiceProportionEquationsReview.html`** **(H)** *(mixed review)* — Constructing and using equations of direct and inverse proportion, including squares, cubes and roots.
- Fluency — finding k from a stated pair and evaluating y = kx or y = k/x at a new value, all values integer or exact decimals (4 questions).
- Powers — relationships y = kx², y = kx³ and y = k√x with square and cube numbers throughout, solved in both directions (4 questions).
- Choosing the form — single-choice matching of a description or table to its equation, where y = kx offered for an inverse relationship is the planted error (4 questions).

**`/pages/curriculum/GCSE/ratio/percentage/multipliers/practicePercentageChangeReview.html`** *(mixed review)* — Applying, combining and reversing percentage changes through their multipliers.
- Fluency — writing the multiplier for a stated rise or fall, applying it, and naming the change a given multiplier applies, money exact to the penny (4 questions).
- Repeated and successive — the same change over several periods and two different changes combined, with simple interest for contrast (4 questions).
- Reverse — recovering the original from the changed amount by dividing by the multiplier, where subtracting the same percentage is the planted error (4 questions).

**`/pages/curriculum/GCSE/ratio/percentage/comparingChange/practiceProfitLossReview.html`** *(mixed review)* — Measuring a change as a percentage of the original amount, and comparing changes fairly.
- Fluency — percentage change from original and new amounts, built so the change divides the original exactly (4 questions).
- Profit and loss — percentage profit or loss from cost and selling prices, losses included (4 questions).
- Comparing — deciding which of two changes is proportionally bigger, ending with a case where dividing by the new amount gives the planted wrong percentage (4 questions).

**`/pages/curriculum/GCSE/ratio/compound/speedDensityPressure/practiceCompoundMeasuresReview.html`** *(mixed review)* — Calculating with speed, density and pressure, rearranging each relationship to find any quantity.
- Fluency — one-step speed, density and pressure calculations with the units naming the division (4 questions).
- Rearranged — finding the distance, time, mass, volume, force or area instead, values chosen to divide exactly (4 questions).
- Averages and mixtures — total-over-total problems where averaging the two speeds or densities gives the planted wrong answer (4 questions).

**`/pages/curriculum/GCSE/ratio/compound/ratesPerUnit/practiceRatesReview.html`** *(mixed review)* — Forming a rate per unit, using it in both directions, and converting it between units.
- Fluency — pay from hours and unit prices from pack prices, including part hours as exact fractions of an hour (4 questions).
- Flow — filling and emptying times from a stated rate, litres and minutes chosen to divide exactly (4 questions).
- Converting — rates rewritten in new units, like pence per gram into pounds per kilogram, where scaling only one of the two units is the trap (4 questions).

**`/pages/curriculum/GCSE/ratio/compound/ratesOnGraphs/practiceRateOfChange.html`** *(mixed review)* — Reading the gradient of a straight line as a rate of change with its units.
- Fluency — gradients from two stated points on a line, read as a rate with its units (4 questions).
- Journeys — speeds from distance–time information given as time and distance pairs, including a stationary stretch with gradient zero (4 questions).
- Units and steepness — single-choice questions naming the units of a rate or the faster of two sections, where swapping rise and run gives the planted answer (4 questions).

**`/pages/curriculum/GCSE/ratio/growth/interestAndDepreciation/practiceGrowthDecayReview.html`** *(mixed review)* — Calculating repeated growth and decay with multipliers raised to powers.
- Fluency — compound interest and depreciation over two or three periods, rates like 10% and 20% keeping every balance exact (4 questions).
- Exponential change — doubling populations and halving doses, and counting the periods until a target is passed (4 questions).
- Contrast — simple against compound interest and linear against exponential growth, where adding the same amount each year is the planted model (4 questions).

### GCSE Geometry drill specifications

Lesson-scoped and mixed-review question-bank briefs generated from the strand manifest.

**`/pages/curriculum/GCSE/geometry/properties/angleBasics/practiceAnglesAtAPoint.html`** — Angles meeting at a point sum to 360°, with reflex angles and several unknowns around one point.
- Fluency — direct questions on angles at a point, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/angleBasics/practiceAnglesOnAStraightLine.html`** — Angles on one side of a straight line sum to 180°, and only when the line really is straight.
- Fluency — direct questions on angles on a straight line, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/angleBasics/practiceVerticallyOppositeAngles.html`** — Two crossing lines make two pairs of equal angles, and quoting the reason by its proper name.
- Fluency — direct questions on vertically opposite angles, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceAngleRules.html`** — Equal angles in a Z shape between parallel lines, spotted from the diagram and quoted by name.
- Fluency — direct questions on alternate angles, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceCorrespondingAngles.html`** — Equal angles in an F shape on parallel lines, and telling them apart from alternate pairs.
- Fluency — direct questions on corresponding angles, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceCoInteriorAngles.html`** — Angles in a C shape between parallel lines sum to 180°, and why they are not equal.
- Fluency — direct questions on co-interior angles, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceMultiStepAngleProblems.html`** — Chaining several angle facts to reach the angle asked for, stating the reason for every step.
- Fluency — direct questions on multi-step angle problems, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/practiceAngleSumOfATriangle.html`** — Why the three angles sum to 180°, proved by drawing a parallel line through one vertex.
- Fluency — direct questions on the angle sum of a triangle, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/practiceIsoscelesTriangleAngles.html`** — The angles facing the equal sides are equal, and the two different answers when the given angle might be either.
- Fluency — direct questions on base angles of an isosceles triangle, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/practiceExteriorAngleOfATriangle.html`** — An exterior angle equals the sum of the two interior angles opposite it, in one step instead of two.
- Fluency — direct questions on the exterior angle of a triangle, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/practiceInteriorAnglesOfPolygons.html`** — Splitting an n-sided polygon into n − 2 triangles to find its angle sum, the quadrilateral’s 360° included.
- Fluency — direct questions on interior angles of a polygon, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/trianglesAndPolygons/practiceExteriorAnglesOfPolygons.html`** — Why the exterior angles of any polygon sum to 360°, and finding a number of sides from one of them.
- Fluency — direct questions on exterior angles of a polygon, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/practiceQuadrilaterals.html`** — The defining properties of the square, rectangle, parallelogram, rhombus, trapezium and kite, set side by side.
- Fluency — direct questions on the special quadrilaterals, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/practiceQuadrilateralDiagonals.html`** — Which quadrilaterals have diagonals that are equal, perpendicular or bisect each other, and naming a shape from its diagonals.
- Fluency — direct questions on diagonals of the special quadrilaterals, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/practiceClassifyingQuadrilaterals.html`** — Why a square is a rectangle but a rectangle need not be a square, and the most specific name the facts force.
- Fluency — direct questions on classifying quadrilaterals, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/practiceLineSymmetry.html`** — Counting the mirror lines of polygons, and completing a shape so a given line becomes a mirror.
- Fluency — direct questions on line symmetry, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruentShapes.html`** — Two shapes are congruent when one fits exactly on the other, mirror images allowed, corresponding parts matched up.
- Fluency — direct questions on congruent shapes, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruenceBySss.html`** — Three matched sides fix a triangle completely, so no angle needs checking at all.
- Fluency — direct questions on congruence by sss, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruenceBySas.html`** — Two sides and the angle between them, and why the angle must be the included one.
- Fluency — direct questions on congruence by sas, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruenceByAsa.html`** — Two angles and a matched side, and why AAS also works once the third angle is deduced.
- Fluency — direct questions on congruence by asa, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruenceByRhs.html`** — A right angle, the hypotenuse and one other side, the one case where a non-included angle is enough.
- Fluency — direct questions on congruence by rhs, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/similarity/practiceSimilarShapes.html`** — Two shapes are similar when angles match and sides share one scale factor, so one enlarges onto the other.
- Fluency — direct questions on similar shapes, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/similarity/practiceProvingTrianglesSimilar.html`** — Two matched angles are enough to prove similarity, and why a shared angle alone proves nothing.
- Fluency — direct questions on proving two triangles similar, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/transformations/practiceReflection.html`** — Reflecting a shape in a mirror line on the grid, the diagonal lines y = x and y = −x included.
- Fluency — direct questions on reflection, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/transformations/practiceRotation.html`** — Rotating a shape about a centre with tracing paper, where centre, angle and direction are all required.
- Fluency — direct questions on rotation, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/transformations/practiceTranslation.html`** — Sliding a shape by a column vector, the top number moving it across and the bottom number up.
- Fluency — direct questions on translation by a column vector, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/transformations/practiceEnlargement.html`** — Enlarging from a centre by a positive scale factor, with rays from the centre fixing where the image lands.
- Fluency — direct questions on enlargement from a centre, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceAngleInASemicircle.html`** **(H)** — An angle subtended by a diameter is 90°, and spotting the diameter that triggers the theorem.
- Fluency — direct questions on the angle in a semicircle, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceCircleTheorems.html`** **(H)** — The angle at the centre is double the angle at the circumference on the same arc, however the figure is drawn.
- Fluency — direct questions on the angle at the centre, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceAnglesInTheSameSegment.html`** **(H)** — Angles at the circumference standing on the same arc are equal, found by chasing the chord they share.
- Fluency — direct questions on angles in the same segment, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceCyclicQuadrilaterals.html`** **(H)** — Opposite angles of a cyclic quadrilateral sum to 180°, and why all four vertices must touch the circle.
- Fluency — direct questions on cyclic quadrilaterals, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceTangentsToACircle.html`** **(H)** — A tangent meets its radius at 90°, and the two tangents from an external point are equal.
- Fluency — direct questions on tangents to a circle, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceChordsAndTheCentre.html`** **(H)** — The perpendicular from the centre bisects a chord, tying circle problems back to isosceles triangles and Pythagoras.
- Fluency — direct questions on chords and the centre, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/solidsAndCoordinates/practiceSolids.html`** — Naming the standard solids and counting their faces, edges and vertices, with prisms told apart from pyramids.
- Fluency — direct questions on faces, edges and vertices, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/solidsAndCoordinates/practiceNetsOfSolids.html`** — Deciding which flat arrangements fold into a given solid, and tracking which edges and corners meet.
- Fluency — direct questions on nets of solids, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/practiceScaleDrawings.html`** — Reading and making drawings at a stated scale, converting between drawn length and real length in both directions.
- Fluency — direct questions on scale drawings, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/practiceMapScales.html`** — Ratio scales such as 1:25 000 turned into real distances and back, with the unit change saved for last.
- Fluency — direct questions on map scales, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/practiceBearings.html`** — Directions measured clockwise from north and always written with three figures, so 45° is recorded as 045°.
- Fluency — direct questions on three-figure bearings, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practicePerimeter.html`** — The distance round a shape, including deducing the unmarked sides of a rectilinear shape before adding.
- Fluency — direct questions on perimeter, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceAreaOfARectangle.html`** — Area as the squares a shape covers, counted first and then found faster as length times width.
- Fluency — direct questions on area of a rectangle, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceArea.html`** — Half of base times height, where the height is perpendicular to the base and never the slant side.
- Fluency — direct questions on area of a triangle, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceAreaOfAParallelogram.html`** — Base times perpendicular height, and why using the slant side gives an answer that is always too big.
- Fluency — direct questions on area of a parallelogram, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceAreaOfATrapezium.html`** — Half the sum of the parallel sides times the height between them, and identifying which sides are parallel.
- Fluency — direct questions on area of a trapezium, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceFindingALengthFromAnArea.html`** — Running an area formula backwards to recover a base, height or parallel side from the stated area.
- Fluency — direct questions on finding a length from an area, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceMensuration.html`** — C = πd or 2πr, and deciding whether the given length is a radius or a diameter first.
- Fluency — direct questions on circumference of a circle, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceAreaOfACircle.html`** — A = πr² with only the radius squared, halving a given diameter before anything is substituted.
- Fluency — direct questions on area of a circle, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceAnswersInTermsOfPi.html`** — Leaving circle answers as exact multiples of π instead of decimals, and calculating with them unrounded.
- Fluency — direct questions on answers in terms of π, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceSemicirclesAndQuarterCircles.html`** — Halving or quartering the circle formulas, and adding the straight edges whenever a perimeter is wanted.
- Fluency — direct questions on semicircles and quarter circles, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceArcLength.html`** — The angle over 360 as the fraction of the circumference an arc takes, plus two radii for a sector’s perimeter.
- Fluency — direct questions on arc length, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceSectorArea.html`** — The angle over 360 applied to πr² for the area a sector sweeps, and to nothing else.
- Fluency — direct questions on area of a sector, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceFindingTheAngleOfASector.html`** — Running the arc and sector formulas backwards to recover the angle or radius from a stated length or area.
- Fluency — direct questions on finding the angle of a sector, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/prismsAndCylinders/practiceVolumeOfAPrism.html`** — Cross-section area times length for any prism, once the face that repeats has been correctly identified.
- Fluency — direct questions on volume of a prism, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/prismsAndCylinders/practiceVolumeOfACylinder.html`** — πr²h as a circular prism, left in terms of π unless a decimal is demanded.
- Fluency — direct questions on volume of a cylinder, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/practiceVolumeOfAPyramid.html`** — One third of the base area times the perpendicular height, whatever polygon forms the base.
- Fluency — direct questions on volume of a pyramid, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/practiceVolumeOfACone.html`** — ⅓πr²h with the perpendicular height rather than the slant, and Pythagoras to convert between the two.
- Fluency — direct questions on volume of a cone, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/pyramidsConesAndSpheres/practiceVolumeOfASphere.html`** — Four thirds of πr³ with only the radius cubed, and hemispheres taken as exact halves.
- Fluency — direct questions on volume of a sphere, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/pythagoras/practicePythagoras.html`** — The squares on the two shorter sides sum to the square on the hypotenuse, which always faces the right angle.
- Fluency — direct questions on pythagoras’ theorem, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/pythagoras/practicePythagorasShorterSides.html`** — Subtracting squares instead of adding when the hypotenuse is already known, the swap most wrong answers miss.
- Fluency — direct questions on finding a shorter side, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/pythagoras/practiceDistanceBetweenTwoPoints.html`** — The straight-line distance between two coordinates as the hypotenuse of the right-angled triangle the grid supplies.
- Fluency — direct questions on the distance between two points, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/pythagoras/practiceTestingForARightAngle.html`** — The converse of Pythagoras: checking whether the three sides satisfy a² + b² = c² before claiming the right angle.
- Fluency — direct questions on testing for a right angle, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/practiceTrigonometry.html`** — Sine, cosine and tangent as ratios of sides, labelled hypotenuse, opposite and adjacent from the angle in use.
- Fluency — direct questions on the trigonometric ratios, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/practiceFindingASideWithTrigonometry.html`** — Choosing the ratio that links the known angle to the wanted side, and when to multiply or divide.
- Fluency — direct questions on finding a side with trigonometry, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/practiceFindingAnAngleWithTrigonometry.html`** — The inverse functions sin⁻¹, cos⁻¹ and tan⁻¹ turning a ratio of two sides back into the angle.
- Fluency — direct questions on finding an angle with trigonometry, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/practiceExactTrigValues.html`** — The exact values of sin and cos at 0°, 30°, 45°, 60° and 90°, and tan up to 60°, read from two special triangles.
- Fluency — direct questions on exact trigonometric values, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceSineCosineRules.html`** **(H)** — Each side over the sine of its opposite angle is constant, so one matched pair unlocks the rest.
- Fluency — direct questions on the sine rule for sides, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceSineRuleAngles.html`** **(H)** — The rule flipped to find an angle, and the second obtuse solution the sine of an angle can hide.
- Fluency — direct questions on the sine rule for angles, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceCosineRuleSides.html`** **(H)** — c² = a² + b² − 2ab cos C for the side facing a known included angle, with the subtraction done last.
- Fluency — direct questions on the cosine rule for sides, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceCosineRuleAngles.html`** **(H)** — The cosine rule rearranged to find any angle from three sides, a negative cosine signalling an obtuse angle.
- Fluency — direct questions on the cosine rule for angles, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceAreaHalfAbSinC.html`** **(H)** — Half the product of two sides and the sine of the included angle, no perpendicular height required.
- Fluency — direct questions on the area formula ½ab sin c, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/practiceVectors.html`** — A displacement written as a column vector, identical wherever it starts, unlike the position a coordinate names.
- Fluency — direct questions on column vectors, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/practiceTranslationsAsVectors.html`** — Describing a translation with a column vector, the top number across and the bottom number up, signs included.
- Fluency — direct questions on translations as vectors, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/practiceAddingAndSubtractingVectors.html`** — Adding component by component, or chaining arrows nose to tail for the resultant, with subtraction as adding the reverse.
- Fluency — direct questions on adding and subtracting vectors, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/practiceScalarMultiplesOfAVector.html`** — Multiplying a vector by a number scales its length, and a negative scalar reverses its direction too.
- Fluency — direct questions on scalar multiples of a vector, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/practiceVectorProofs.html`** — Writing the path between labelled points in terms of a and b, a vector travelled backwards picking up a minus.
- Fluency — direct questions on routes around a figure, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/practiceFractionsOfAVector.html`** **(H)** — The vector to a midpoint or ratio point on a segment, built as a fraction of the whole vector.
- Fluency — direct questions on fractions of a vector, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/practiceParallelVectors.html`** **(H)** — Two vectors are parallel exactly when one is a scalar multiple of the other, shown by factorising the expression.
- Fluency — direct questions on parallel vectors, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/practiceCollinearPoints.html`** **(H)** — Proving three points lie on one straight line by showing two vectors parallel and sharing a point.
- Fluency — direct questions on collinear points, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/parallelLines/practiceAngleRulesReview.html`** *(mixed review)* — Finding angles with the point, line, parallel-line and polygon rules, and naming the reason for every step.
- Fluency — angles at a point, on a straight line, vertically opposite and in a triangle, all whole degrees with a typed answer (4 questions).
- Parallel lines and polygons — alternate, corresponding and co-interior angles, then interior and exterior angles of regular polygons, each paired with a single-choice reason (4 questions).
- Catch — co-interior angles offered as equal, an isosceles triangle with two possible base angles, and an exterior angle taken from 180° instead of summing the opposite interiors (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/quadrilateralsAndSymmetry/practiceQuadrilateralsReview.html`** *(mixed review)* — Identifying the special quadrilaterals from side, angle, diagonal and symmetry facts.
- Fluency — single-choice naming of the quadrilateral fixed by stated side and angle facts, all six special quadrilaterals appearing (4 questions).
- Diagonals and symmetry — typed counts of mirror lines and orders of rotational symmetry, and single-choice questions naming the shape from its diagonal properties (4 questions).
- Hierarchy — true-or-false single choices such as whether every square is a rhombus, where the inclusive definitions catch shape-as-picture thinking (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/congruence/practiceCongruence.html`** *(mixed review)* — Deciding congruence from marked facts and naming the criterion that proves it.
- Fluency — single-choice questions naming the criterion, SSS, SAS, ASA or RHS, that the marked facts of a triangle pair satisfy (4 questions).
- Application — congruent-or-not-provable decisions with the facts given in words, including pairs that need the shared side spotted (4 questions).
- Catch — two sides with a non-included angle, and three matched angles, offered beside genuine criteria; both must be rejected (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/similarity/practiceSimilarity.html`** *(mixed review)* — Finding scale factors and missing lengths in similar shapes, corresponding sides paired correctly.
- Fluency — integer and half-integer scale factors from a matched pair of sides, then a missing length by multiplying, every answer exact (4 questions).
- Application — nested and bow-tie triangle configurations where the corresponding sides must be identified before scaling, whole-number answers throughout (4 questions).
- Catch — problems where adding the difference between sides gives a plausible wrong answer, and a shared-angle pair that is not similar at all (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/transformations/practiceTransformations.html`** *(mixed review)* — Applying the four transformations on coordinate axes and describing them fully.
- Fluency — image coordinates of a marked vertex after a stated reflection, rotation about the origin or column-vector translation, typed as integers (4 questions).
- Describing — single-choice complete descriptions of the transformation mapping object to image, distractors omitting the centre, direction or mirror line (4 questions).
- Catch — reflections in y = x set against the axes, rotations with the direction reversed, and an enlargement whose scale factor is read from the wrong side pair (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/circleTheorems/practiceCircleTheoremsReview.html`** **(H)** *(mixed review)* — Finding angles with the circle theorems and naming the theorem that justifies each step.
- Fluency — one theorem per figure: centre and circumference, semicircle, same segment and cyclic quadrilateral, every angle a whole number of degrees (4 questions).
- Application — figures chaining two or three theorems, tangents and the alternate segment included, with the intermediate angle asked first (4 questions).
- Justification — single-choice questions picking the theorem that earns the reason mark, the tempting wrong theorem sharing the same diagram (4 questions).

**`/pages/curriculum/GCSE/geometry/properties/solidsAndCoordinates/practiceSolidsReview.html`** *(mixed review)* — Recognising solids from their counts, nets, plans and elevations.
- Fluency — typed counts of the faces, edges and vertices of named solids, prisms and pyramids on stated bases included (4 questions).
- Nets and views — single-choice matching of a net to its solid and of a plan or elevation to the drawn solid (4 questions).
- Catch — arrangements of six squares that do not fold into a cube, and lookalike elevations taken from the wrong direction (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/measuresAndBearings/practiceBearingsReview.html`** *(mixed review)* — Reading, writing and calculating three-figure bearings, and converting scaled lengths.
- Fluency — writing directions as three-figure bearings with leading zeros required, and reading the bearing of B from A off a marked diagram (4 questions).
- Back bearings and journeys — the return bearing by adding or subtracting 180°, and two-leg journeys using angle facts at the turn, whole degrees throughout (4 questions).
- Scale — converting between map and ground with ratio scales like 1:25 000 and drawing scales like 1 cm to 5 km, the unit change being the catch (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/perimeterAndArea/practiceAreaReview.html`** *(mixed review)* — Finding perimeters and areas of straight-sided shapes, and running the formulas backwards.
- Fluency — areas of rectangles, triangles, parallelograms and trapezia from labelled integer sides and heights (4 questions).
- Composite — L-shapes and joined shapes needing missing sides deduced first, with area and perimeter asked in separate questions (4 questions).
- Catch — figures labelled with both slant and perpendicular heights, and a missing base recovered from a stated area (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/circlesAndSectors/practiceMensurationReview.html`** *(mixed review)* — Calculating circle measures and solid volumes exactly, answers left in terms of π.
- Fluency — circumference and area from an integer radius or diameter, answered as the coefficient of π (4 questions).
- Arcs and sectors — arc lengths and sector areas for angles like 60°, 90° and 120° that leave exact fractions, plus one reversed to find the angle (4 questions).
- Solids — volumes of cylinders, cones, pyramids and spheres with dimensions chosen so the thirds cancel, ending with a frustum by subtracting the missing cone (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/pythagoras/practicePythagorasReview.html`** *(mixed review)* — Applying Pythagoras’ theorem forwards, backwards and in three dimensions, with triple-based exact answers.
- Fluency — hypotenuses and shorter sides from Pythagorean triples like 3-4-5, 5-12-13 and 8-15-17, scaled copies included (4 questions).
- Application — distances between coordinate points and diagonals of rectangles, each engineered to land on a triple (4 questions).
- Catch — a converse decision from three given sides, adding when the hypotenuse is known, and a cuboid diagonal such as 3 by 4 by 12 giving exactly 13 (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/rightAngledTrigonometry/practiceTrigonometryReview.html`** *(mixed review)* — Choosing and using the right trigonometric ratio in right-angled triangles, with exact values throughout.
- Fluency — labelling opposite, adjacent and hypotenuse, then sides found with tan 45° = 1, sin 30° = ½ and cos 60° = ½ (4 questions).
- Exact values — recalling sin, cos and tan at 0°, 30°, 45°, 60° and 90°, and angles recovered from exact ratios like tan θ = √3 (4 questions).
- Catch — a division where multiplication is expected, opposite and adjacent swapped by a rotated triangle, and an elevation angle placed at the wrong vertex (4 questions).

**`/pages/curriculum/GCSE/geometry/mensuration/nonRightAngledTriangles/practiceSineCosineRulesReview.html`** **(H)** *(mixed review)* — Solving non-right-angled triangles with the sine rule, cosine rule and ½ab sin C.
- Fluency — sine rule sides and angles with pairings like 30° opposite 5 and 90° opposite 10, every ratio exact (4 questions).
- Cosine rule — third sides with included angles of 60° or 120°, such as sides 3 and 5 around 120° giving exactly 7, and one angle recovered from three sides (4 questions).
- Areas and choice — ½ab sin C with 30° angles for integer areas, and single-choice decisions naming which rule the given facts allow (4 questions).

**`/pages/curriculum/GCSE/geometry/vectors/vectorArithmetic/practiceVectorsReview.html`** *(mixed review)* — Calculating with column vectors: sums, differences, scalar multiples and magnitudes.
- Fluency — adding and subtracting column vectors and multiplying by scalars, negative components throughout (4 questions).
- Application — the vector translating one given point to another, resultants of two-leg journeys, and a missing component from a stated resultant (4 questions).
- Catch — magnitudes built on 3-4-5 and 5-12-13 components, and a distractor treating a vector as the coordinates of a point (4 questions).

**`/pages/curriculum/GCSE/geometry/vectors/vectorGeometry/practiceVectorProofsReview.html`** **(H)** *(mixed review)* — Building vector expressions around a figure and arguing parallelism and collinearity from them.
- Fluency — single-choice expressions in a and b for marked routes around triangles and parallelograms, reversed vectors negated (4 questions).
- Fractions — vectors to midpoints and to points dividing a segment in a given ratio, chosen from simplified expressions (4 questions).
- Proof steps — single-choice justifications naming why two expressions show vectors parallel or points collinear, where a common factor must be extracted first (4 questions).

### GCSE Probability drill specifications

Lesson-scoped and mixed-review question-bank briefs generated from the strand manifest.

**`/pages/curriculum/GCSE/probability/scale/measuringChance/practiceComparingProbabilities.html`** — Deciding which event is more likely by common denominators or decimals.
- Fluency — direct questions on comparing probabilities, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/scale/singleEvents/practiceSingle.html`** — Favourable outcomes over total outcomes, and the equally likely condition.
- Fluency — direct questions on probability from equally likely outcomes, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/scale/singleEvents/practiceEventsWithSeveralOutcomes.html`** — Counting every outcome an event contains before dividing by the total.
- Fluency — direct questions on an event made of several outcomes, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/practiceProbabilitiesSumToOne.html`** — Why an exhaustive set’s probabilities total one, and checking a stated table.
- Fluency — direct questions on probabilities that sum to one, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/practiceComplementaryEvents.html`** — P(not A) as 1 − P(A), and spotting when the complement is the faster route.
- Fluency — direct questions on the probability of an event not happening, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/practiceMissingProbabilities.html`** — Using the total of one to find an unknown probability, even an algebraic one.
- Fluency — direct questions on finding a missing probability, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/scale/complementsAndExpectation/practiceExpectedFrequency.html`** — Estimating how many times an event will occur as probability times trials.
- Fluency — direct questions on expected frequency, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/combined/exclusiveEvents/practiceMutuallyExclusiveEvents.html`** — Events that cannot both happen on one trial, and testing pairs for exclusivity.
- Fluency — direct questions on mutually exclusive events, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/combined/exclusiveEvents/practiceOrRule.html`** — Adding probabilities for either-or questions, and why exclusivity is required.
- Fluency — direct questions on the or rule for exclusive events, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/combined/exclusiveEvents/practiceOverlappingEvents.html`** — Why adding double-counts the overlap, and subtracting it to correct the total.
- Fluency — direct questions on events that overlap, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/combined/independence/practiceIndependentEvents.html`** — Events where one outcome gives no information about the other.
- Fluency — direct questions on independent events, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/combined/independence/practiceAndRule.html`** — Multiplying the probabilities of independent events for both-happen questions.
- Fluency — direct questions on the and rule for independent events, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/combined/independence/practiceIndependenceAssumption.html`** — The unstated assumption behind multiplying, and everyday cases where it fails.
- Fluency — direct questions on the independence assumption, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/combined/independence/practiceCombined.html`** — Deciding whether a worded question wants either event or both events.
- Fluency — direct questions on choosing between adding and multiplying, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/combined/replacement/practiceDependentEvents.html`** — Events where the first outcome changes the probabilities for the second.
- Fluency — direct questions on dependent events, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/combined/replacement/practiceWithReplacement.html`** — Repeated picks where each object goes back, so every stage stays independent.
- Fluency — direct questions on sampling with replacement, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/combined/conditional/practiceConditional.html`** **(H)** — The probability of an event given that another has happened.
- Fluency — direct questions on conditional probability, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/combined/conditional/practiceConditionalFromTwoWayTables.html`** **(H)** — P(A given B) as a cell over its row or column total, not the grand total.
- Fluency — direct questions on conditional probability from a two-way table, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/combined/conditional/practiceConditionalFromVennDiagrams.html`** **(H)** — Dividing the overlap by the region in the condition, not the whole diagram.
- Fluency — direct questions on conditional probability from a venn diagram, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/diagrams/sampleSpaces/practiceListingCombinedOutcomes.html`** — Writing every pairing of two events once, in an order showing none is missing.
- Fluency — direct questions on listing the outcomes of two events, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/diagrams/sampleSpaces/practiceSampleSpaceDiagrams.html`** — The grid displaying every outcome of two events, one axis per event.
- Fluency — direct questions on sample space diagrams, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/diagrams/tablesAndFrequencyTrees/practiceTwoWayTables.html`** — Completing a two-way table from its totals, one forced cell at a time.
- Fluency — direct questions on two-way tables, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/diagrams/tablesAndFrequencyTrees/practiceProbabilitiesFromTwoWayTables.html`** — A cell count over the grand total, and reading which total a question wants.
- Fluency — direct questions on probabilities from a two-way table, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/practiceDrawingTreeDiagrams.html`** — One fork per stage, a probability on every branch, and each fork totalling one.
- Fluency — direct questions on drawing a tree diagram, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/practiceTrees.html`** — The probability of a complete route as the product of its branch probabilities.
- Fluency — direct questions on multiplying along the branches, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/practiceAddingAcrossPaths.html`** — Finding every path that satisfies the event, then adding their probabilities.
- Fluency — direct questions on adding across the paths, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/practiceVennDiagramRegions.html`** — What the four regions of a two-set diagram hold, including outside both sets.
- Fluency — direct questions on the regions of a venn diagram, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/practiceVenn.html`** — Union, intersection, complement and universal set, and the regions they shade.
- Fluency — direct questions on set notation, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/practiceFillingInAVennDiagram.html`** — Placing the intersection first and subtracting outwards from worded counts.
- Fluency — direct questions on filling in a venn diagram, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/experimental/estimatingFromExperiments/practiceRelativeFrequency.html`** — The fraction of trials on which an event occurred, estimating its probability.
- Fluency — direct questions on relative frequency, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/experimental/estimatingFromExperiments/practiceEstimatingProbabilityFromData.html`** — Relative frequency when outcomes are not equally likely, such as a drawing pin.
- Fluency — direct questions on estimating a probability from data, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/practiceComparingWithTheory.html`** — Setting relative frequency against theory, and describing the gap between them.
- Fluency — direct questions on comparing experimental and theoretical probability, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/practiceBias.html`** — Judging whether a dice or spinner is fair, and how large a gap is suspicious.
- Fluency — direct questions on detecting bias, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/practiceEffectOfSampleSize.html`** — Why relative frequency settles towards the true probability as trials increase.
- Fluency — direct questions on the effect of sample size, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/probability/scale/singleEvents/practiceSingleReview.html`** *(mixed review)* — Calculating single-event probabilities: equally likely outcomes, the not rule and expected frequency.
- Fluency — single-event probabilities from dice, spinners and counters as exact fractions, ending with which of two events is more likely (4 questions).
- The not rule — P(not A) from a stated P(A), and missing probabilities in tables that must total one, including one algebraic entry (4 questions).
- Expected frequency — probability times trials for whole-number answers, ending with a claim that treats the expected count as guaranteed (4 questions).

**`/pages/curriculum/GCSE/probability/combined/independence/practiceCombinedReview.html`** *(mixed review)* — Choosing and applying the addition and multiplication rules for combined events.
- Fluency — the OR rule on exclusive events and the AND rule on independent events, applied one rule at a time with fraction answers (4 questions).
- Choosing the rule — worded questions deciding between adding and multiplying, including an at-least-one found through the complement (4 questions).
- Rule conditions — pairs of events that are not exclusive or not independent, where applying the rule anyway gives a probability that is visibly wrong (4 questions).

**`/pages/curriculum/GCSE/probability/combined/replacement/practiceReplacement.html`** *(mixed review)* — Multiplying probabilities across successive picks, recalculating after non-replacement.
- Fluency — two picks with replacement from a bag of counters, the same fractions multiplied both times (4 questions).
- Without replacement — two picks where the numerator and denominator both shrink for the second fraction (4 questions).
- Matched pairs — the same outcome asked with and without replacement, catching the second fraction left unchanged (4 questions).

**`/pages/curriculum/GCSE/probability/combined/conditional/practiceConditionalReview.html`** **(H)** *(mixed review)* — Finding conditional probabilities by restricting to the cases where the condition holds.
- Fluency — P(B given A) from small two-way tables, dividing a cell by the row or column the condition names (4 questions).
- Diagrams — conditional probabilities read from completed Venn diagrams and tree diagrams, as exact fractions (4 questions).
- Reversed conditions — P(A given B) and P(B given A) from the same data, catching the assumption that they are equal (4 questions).

**`/pages/curriculum/GCSE/probability/diagrams/sampleSpaces/practiceSampleSpaces.html`** *(mixed review)* — Constructing sample space grids and counting probabilities from them.
- Fluency — listing or gridding every outcome of two spinners or two dice, and counting how many there are (4 questions).
- Events from the grid — probabilities of totals, doubles and differences counted as cells over the whole grid (4 questions).
- Unequal totals — comparing events such as a total of 7 against a total of 12, catching the assumption that every total is equally likely (4 questions).

**`/pages/curriculum/GCSE/probability/diagrams/tablesAndFrequencyTrees/practiceTwoWayTablesReview.html`** *(mixed review)* — Completing two-way tables and frequency trees, and turning counts into probabilities.
- Fluency — completing a two-way table from its row and column totals, one forced cell at a time (4 questions).
- Frequency trees — filling the counts along both splits of a frequency tree from worded information (4 questions).
- Probabilities from counts — a named cell over the grand total, catching the answer that divides by a row total instead (4 questions).

**`/pages/curriculum/GCSE/probability/diagrams/treeDiagrams/practiceTreesReview.html`** *(mixed review)* — Building tree diagrams and combining branch probabilities, with and without replacement.
- Fluency — completing branch probabilities so every fork sums to one, with replacement throughout (4 questions).
- Paths — multiplying along branches and adding the paths an event allows, as exact fractions (4 questions).
- Without replacement — second-stage branches that must change after the first pick, catching the copied first-stage fraction (4 questions).

**`/pages/curriculum/GCSE/probability/diagrams/vennDiagrams/practiceVennReview.html`** **(H)** *(mixed review)* — Reading and completing Venn diagrams, with set notation and conditional questions.
- Fluency — matching set notation to regions of a two-set diagram: union, intersection and complement (4 questions).
- Filling and reading — completing a diagram from worded counts, intersection first, then reading probabilities over the full total (4 questions).
- Conditional regions — P(A given B) from the diagram, catching division by the whole total instead of the set in the condition (4 questions).

**`/pages/curriculum/GCSE/probability/experimental/estimatingFromExperiments/practiceRelativeFrequencyReview.html`** *(mixed review)* — Estimating probabilities as relative frequencies and scaling them to future trials.
- Fluency — relative frequency as frequency over trials from a results table, simplified as an exact fraction (4 questions).
- Predictions — scaling an estimated probability to a stated number of future trials for a whole-number count (4 questions).
- Running totals — recomputing relative frequency as further batches of results arrive, catching the answer that uses only the newest batch (4 questions).

**`/pages/curriculum/GCSE/probability/experimental/biasAndSampleSize/practiceBiasReview.html`** *(mixed review)* — Judging fairness and choosing the best estimate from experimental results.
- Fluency — comparing a relative frequency with the theoretical value for a fair device, over a common denominator (4 questions).
- Best estimate — choosing the estimate backed by the most trials, and pooling several result sets into one fraction (4 questions).
- Small samples — verdicts on fairness from very short experiments, catching the reader who calls twenty rolls decisive (4 questions).

### GCSE Statistics drill specifications

Lesson-scoped and mixed-review question-bank briefs generated from the strand manifest.

**`/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceSampling.html`** — The population as everyone of interest and the sample as the part surveyed.
- Fluency — direct questions on populations and samples, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceCensusOrSample.html`** — When a census is worth it, and when cost or destructive testing forces a sample.
- Fluency — direct questions on census or sample, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceRandomSampling.html`** — Giving every member an equal chance, and why haphazard is not random.
- Fluency — direct questions on random sampling, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceNonRandomSampling.html`** — Systematic and opportunity sampling, and the groups each one quietly misses.
- Fluency — direct questions on non-random sampling, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceSourcesOfBias.html`** — How time, place and selection method favour one group, and whom a survey misses.
- Fluency — direct questions on bias in sampling, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceSampleSize.html`** — Why larger samples give steadier estimates, yet badly chosen ones stay biased.
- Fluency — direct questions on sample size, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/sampling/collectingData/practiceDataCollection.html`** — Telling qualities from quantities, and how the type fixes charts and averages.
- Fluency — direct questions on qualitative and quantitative data, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/sampling/collectingData/practiceDiscreteAndContinuous.html`** — Counts that move in steps against measurements that can take any value.
- Fluency — direct questions on discrete and continuous data, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/sampling/collectingData/practicePrimaryAndSecondaryData.html`** — Data collected yourself against someone else's records, and what each costs.
- Fluency — direct questions on primary and secondary data, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/sampling/collectingData/practiceCollectionSheets.html`** — Designing collection sheets whose classes cover every value without overlapping.
- Fluency — direct questions on data collection sheets, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceGroupedFrequencyTables.html`** — Sorting continuous data into inequality classes, one class for every value.
- Fluency — direct questions on grouped frequency tables, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceBarCharts.html`** — Drawing and reading bar charts: equal-width bars, gaps and a labelled axis.
- Fluency — direct questions on bar charts, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceDualAndCompositeBarCharts.html`** — Two data sets on one chart, side by side or stacked, and reading a component.
- Fluency — direct questions on dual and composite bar charts, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practicePictograms.html`** — Drawing and reading pictograms, where the key fixes what one symbol is worth.
- Fluency — direct questions on pictograms, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceVerticalLineCharts.html`** — The chart for ungrouped discrete numerical data, with bars shrunk to lines.
- Fluency — direct questions on vertical line charts, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceCharts.html`** — Turning frequencies into sector angles that total 360°, checked before drawing.
- Fluency — direct questions on drawing a pie chart, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/practiceFrequencyDiagrams.html`** — Splitting each value into stem and leaf under a key, with the leaves ordered.
- Fluency — direct questions on stem-and-leaf diagrams, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/practiceBackToBackStemAndLeaf.html`** — Two data sets sharing one set of stems, with left-hand leaves read outwards.
- Fluency — direct questions on back-to-back stem-and-leaf diagrams, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/practiceFrequencyPolygons.html`** — Plotting each class frequency at its midpoint, not at the class boundaries.
- Fluency — direct questions on frequency polygons, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/timeSeriesAndScatter/practiceTimeSeries.html`** — Readings taken at regular intervals, plotted and read as a line graph.
- Fluency — direct questions on time series graphs, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceHistograms.html`** **(H)** — Why unequal class widths force frequency onto area via frequency density.
- Fluency — direct questions on frequency density, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceDrawingHistograms.html`** **(H)** — Frequency densities for every class, with bar areas carrying the frequencies.
- Fluency — direct questions on drawing a histogram, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceInterpretingHistograms.html`** **(H)** — Frequencies from bar areas, and why the tallest bar need not hold the most data.
- Fluency — direct questions on interpreting a histogram, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceCumulative.html`** **(H)** — Running totals plotted at upper class boundaries, joined by an S-shaped curve.
- Fluency — direct questions on cumulative frequency graphs, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceReadingCumulativeFrequencyGraphs.html`** **(H)** — Estimating the median and quartiles from the curve, and counts above a point.
- Fluency — direct questions on reading a cumulative frequency graph, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceDrawingBoxPlots.html`** **(H)** — The five values a box plot shows, from a list or a cumulative frequency graph.
- Fluency — direct questions on drawing a box plot, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceTheMode.html`** — The most frequent value in a data set, including sets with two modes or none.
- Fluency — direct questions on the mode, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceTheMedian.html`** — The middle value of ordered data, and the halfway pair when the count is even.
- Fluency — direct questions on the median, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceMeanMedianMode.html`** — The total shared equally across the count, and why one extreme drags the mean.
- Fluency — direct questions on the mean, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceTheRange.html`** — Largest minus smallest as a measure of spread, not an average.
- Fluency — direct questions on the range, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceChoosingTheAverage.html`** — Mode for categories, median against extremes, mean when every value counts.
- Fluency — direct questions on choosing which average to use, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceWorkingBackwardsFromTheMean.html`** — Recovering the total from a stated mean to find a missing value.
- Fluency — direct questions on working backwards from the mean, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/averages/averagesFromTables/practiceAverages.html`** — Multiplying each value by its frequency, then dividing by the total frequency.
- Fluency — direct questions on the mean from a frequency table, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/averages/averagesFromTables/practiceMedianFromAFrequencyTable.html`** — Counting through the frequencies to the middle, without rewriting the list.
- Fluency — direct questions on the median from a frequency table, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/averages/averagesFromTables/practiceModeAndRangeFromATable.html`** — Both read from the value column, not from the largest frequency.
- Fluency — direct questions on mode and range from a frequency table, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/averages/averagesFromGroupedData/practiceModalClass.html`** — The class with the highest frequency, stated as an interval, not a value.
- Fluency — direct questions on the modal class, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/averages/averagesFromGroupedData/practiceMedianClass.html`** — Finding the middle position, then counting through the classes to reach it.
- Fluency — direct questions on the class containing the median, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/averages/quartiles/practiceQuartiles.html`** **(H)** — The lower and upper quartiles of an ordered list, at the quarter positions.
- Fluency — direct questions on quartiles from a list, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/practiceScatter.html`** — Positive, negative or no correlation, strong or weak, read from the points.
- Fluency — direct questions on describing correlation, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/practiceLinesOfBestFit.html`** — A straight line by eye through the points, never forced through the origin.
- Fluency — direct questions on the line of best fit, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/practiceInterpolation.html`** — Reading an estimate off the line inside the data range, and its reliability.
- Fluency — direct questions on estimating with a line of best fit, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/practiceExtrapolation.html`** — Why extending the line beyond the plotted data gives unsupported estimates.
- Fluency — direct questions on the danger of extrapolation, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/practiceOutliers.html`** — Spotting a value far from the rest, and whether it is an error or genuine.
- Fluency — direct questions on outliers, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/practiceComparingData.html`** — A fair comparison pairs an average with a measure of spread, both in context.
- Fluency — direct questions on comparing data sets with an average and the range, limited to this lesson's stated scope (4 questions).
- Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).
- Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).

**`/pages/curriculum/GCSE/statistics/sampling/populationsAndSamples/practiceSamplingReview.html`** *(mixed review)* — Identifying populations, samples and bias, and estimating a population figure from a sample.
- Fluency — naming the population and the sample in a described study, and choosing between a census and a sample (4 questions).
- Sampling methods — single-choice questions naming the method used and picking the least biased way to sample a described population (4 questions).
- Estimating and bias — scaling a sample proportion up to a population estimate with counts that divide exactly, ending with a large biased sample that stays biased (4 questions).

**`/pages/curriculum/GCSE/statistics/sampling/collectingData/practiceDataCollectionReview.html`** *(mixed review)* — Classifying data types and criticising collection sheets and questionnaire questions.
- Fluency — single-choice classification of described data as qualitative or quantitative, and as primary or secondary (4 questions).
- Discrete or continuous — single-choice classification of counts and measurements, including values like shoe sizes that look continuous but are not (4 questions).
- Questionnaires — single-choice questions picking the flaw in a survey question, or the response boxes that overlap or leave a gap (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/chartsAndTables/practiceChartsReview.html`** *(mixed review)* — Reading and constructing bar charts, pictograms, vertical line charts and pie charts.
- Fluency — reading frequencies and totals from bar charts, dual bar charts, pictograms with part-symbols and vertical line charts (4 questions).
- Pie chart angles — converting frequencies to sector angles and back, with totals that divide 360 exactly (4 questions).
- Comparisons — single-choice questions on two pie charts with different totals, where the bigger slice does not mean the bigger frequency (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/groupedDataDiagrams/practiceFrequencyDiagramsReview.html`** *(mixed review)* — Reading stem-and-leaf diagrams, frequency polygons and equal-width histograms.
- Fluency — values, counts and the range from a keyed stem-and-leaf diagram, back-to-back included (4 questions).
- Polygons and histograms — the midpoint each frequency is plotted at, frequencies read from equal-width bars, and totals across one diagram (4 questions).
- Class boundaries — single-choice questions placing a value in its class, and spotting the table whose classes gap or overlap (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/timeSeriesAndScatter/practiceTimeSeriesReview.html`** *(mixed review)* — Reading time series and describing their trends.
- Fluency — reading values and exact differences from a table of readings taken at regular intervals (4 questions).
- Trends — single-choice questions naming the long-term trend and the repeating seasonal pattern in a described series (4 questions).
- Between the readings — single-choice questions on what can and cannot be claimed for times between two recorded readings (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceHistogramsReview.html`** **(H)** *(mixed review)* — Calculating frequency density and converting between bar areas and frequencies on a histogram.
- Fluency — frequency density from frequency and class width, with every division exact (4 questions).
- Areas to frequencies — frequencies from stated densities and widths, and completing a table whose products come out whole (4 questions).
- Unequal widths — single-choice questions where the tallest bar does not hold the most data, catching height read as frequency (4 questions).

**`/pages/curriculum/GCSE/statistics/presenting/histogramsAndCumulativeFrequency/practiceCumulativeReview.html`** **(H)** *(mixed review)* — Building cumulative frequency tables, and reading medians, quartiles and box plots from the graphs.
- Fluency — completing running totals for a cumulative frequency table, every total exact, and single-choice questions picking the plotting point at the upper class boundary (4 questions).
- Reading the curve — medians, quartiles and how many values lie above a given point, from stated curve readings at whole-number gridline values (4 questions).
- Box plots — the five values, range and interquartile range from stated box plot values, catching the box width read as the range (4 questions).

**`/pages/curriculum/GCSE/statistics/averages/averagesFromAList/practiceMeanMedianModeReview.html`** *(mixed review)* — Finding the mean, median, mode and range of a list, and reversing a stated mean.
- Fluency — mean, median, mode and range of lists of five to eight small integers, every mean exact (4 questions).
- Working backwards — a missing value from a stated mean, and the mean of two combined groups through their totals (4 questions).
- Order and outliers — single-choice questions catching the median of an unordered list, and naming which average an outlier drags (4 questions).

**`/pages/curriculum/GCSE/statistics/averages/averagesFromTables/practiceAveragesReview.html`** *(mixed review)* — Finding averages from frequency tables and estimating the mean of grouped data.
- Fluency — mean, median and mode from ungrouped frequency tables, with value-times-frequency totals that divide exactly (4 questions).
- Grouped data — the modal class, the class containing the median, and estimated means from midpoints that come out exactly (4 questions).
- The classic traps — single-choice questions catching division by the number of rows, and the largest frequency read as the mode (4 questions).

**`/pages/curriculum/GCSE/statistics/averages/quartiles/practiceQuartilesReview.html`** **(H)** *(mixed review)* — Finding quartiles and the interquartile range of small data sets.
- Fluency — lower and upper quartiles of ordered lists of 7, 11 or 15 small integers (4 questions).
- Interquartile range — the IQR of small integer data sets, including two sets with equal ranges but different IQRs (4 questions).
- Order first — single-choice questions on lists that need ordering before quartering, and telling the interquartile range from the range (4 questions).

**`/pages/curriculum/GCSE/statistics/interpretation/correlationAndBestFit/practiceScatterReview.html`** *(mixed review)* — Describing correlation, estimating with a line of best fit, and knowing when an estimate cannot be trusted.
- Fluency — single-choice questions naming the type and strength of correlation from described point patterns (4 questions).
- Using the line — estimates read from a line of best fit at values inside the data range, all landing on whole numbers (4 questions).
- Overreach — single-choice questions rejecting estimates beyond the data range and causal claims a correlation cannot carry (4 questions).

**`/pages/curriculum/GCSE/statistics/interpretation/comparingDistributions/practiceComparingDataReview.html`** *(mixed review)* — Comparing two data sets with an average and a measure of spread, stated in context.
- Fluency — means, medians and ranges of two small integer data sets, every mean exact (4 questions).
- Valid comparisons — single-choice questions picking the statement that pairs an average with a measure of spread and stays in context (4 questions).
- Outliers and overreach — single-choice questions on the effect of removing an outlier, and on claims the data cannot support (4 questions).

### Groups with no drill

Drills sit on the deepest menu level, so the unit of pairing is now the group.
Of the 114 GCSE group menus, 95 carry at least one drill. The nineteen that do
not fall into two kinds, and none of them is an oversight.

**Awaiting specification** — mechanical content whose question banks have not
been written yet: the six GCSE Number groups under Fractions, decimals and
percentages apart from Calculating with fractions, and the four Measures groups
from Units and conversion to Estimation and checking.

**Undrillable by this engine** — assessed by drawing, recognition or written
justification rather than a typed number or a single choice:
- Geometry: Constructions and loci — compass work cannot be auto-marked.
- Statistics: Using charts honestly — "say why this graph misleads" needs prose.
- Algebra: Notation and vocabulary, Identities and proof, Coordinates, Cubic,
  reciprocal and other curves, Gradients and areas under curves, Iteration, and
  Special sequences — proof, curve recognition and by-eye estimates resist
  exact marking.
- A level (still one page per topic): `/pages/curriculum/ALevel/statistics/sampling.html`,
  `/pages/curriculum/ALevel/statistics/presentation.html`, `/pages/curriculum/ALevel/mechanics/quantities.html`,
  `/pages/curriculum/ALevel/pure/proof.html`.

That second group marks the real limit of the test engine, and it is worth
knowing before promising blanket coverage: it marks numbers and single choices,
and nothing else. Drilling proof and criticism needs a different page type — a
compare-your-answer page that shows a model answer and its mark scheme and asks
the reader to mark themselves against it. Worth building eventually. It is a
separate piece of work from the practice pages listed above, and it should not
be bolted onto the practice-page template.

Where a group carries no drill, its pages simply have no Practice section. Do
not add one saying there is nothing yet.

---

## Cross-cutting requirements

Content coverage alone will not make this saleable. These apply across the
whole curriculum section.

**Exam-board mapping.** Every GCSE and A level page needs a mapping to AQA,
Edexcel and OCR specification references. Verify against the live specification
documents — do not infer codes.

**Tier separation.** GCSE pages must mark Higher-only material visibly and let a
Foundation reader skip it without losing the thread.

**Assessment.** Each page needs a question set with full worked solutions, not
answers alone. A resource without solutions is worth a fraction of one with them.

**Printable output.** Schools print. A print stylesheet that drops the ribbon,
nav panel and interactive figures, and renders questions as a clean worksheet,
is a small job with a large commercial return.

**Image licensing.** The article pages already carry a references block in the
footer. Every image on a sold resource needs a verified licence and attribution.
Audit the existing extracurricular pages before selling anything.

**Accessibility.** The fixed 900px layout scales rather than reflows, which is
a deliberate design decision, but the interactive figures still need keyboard
operation, text alternatives and adequate contrast. Schools are subject to
accessibility regulations and will ask.

**Glossary and search.** At 90-plus pages the site is past the point where
browsing alone is sufficient.

**Prerequisite graph.** The "you should already know" links turn a collection of
pages into a course. This is the cheapest thing on this list and the most
valuable.

---

## Build order

This is a genuine sequence — each step is chosen so the resource is saleable at
the earliest possible point.

1. **GCSE Higher-visible topics where a diagram beats prose** — circle theorems,
   graph transformations, histograms with unequal widths, tree diagrams. These
   are where the site's interactive approach most obviously outperforms a
   textbook, and they demo well.
2. **The rest of GCSE Number and Algebra.** Largest audience, and prerequisite
   for everything else.
3. **Remaining GCSE strands**, completing a sellable GCSE product.
4. **Key Stage 3**, which mostly reuses the GCSE figures at lower difficulty.
5. **A level Pure**, which is the strongest fit for the site's existing
   extracurricular material on complex numbers, Euler's formula and Maclaurin
   series.
6. **A level Statistics and Mechanics.**
7. **Key Stages 1 and 2.** Placed last deliberately: the audience is the teacher
   or parent rather than the pupil, and the interactive style suits older
   readers better.
