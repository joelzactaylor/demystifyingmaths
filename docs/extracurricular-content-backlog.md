# Extracurricular content backlog

Material in this file was removed from a GCSE lesson because it lay outside that
lesson's manifest scope or interrupted the core teaching sequence. It is kept
here so that the mathematical idea, examples and provenance can be developed
later as an extracurricular page rather than lost.

## Written-method extensions kept out of the first explanation

The first place-value lesson now combines named units (300 thousandths and
7 thousandths), without requiring addition of fractions with different
denominators. The formal bridge is worth retaining for a later connection:
3/10 + 0/100 + 7/1000 = 300/1000 + 0/1000 + 7/1000 = 307/1000.

The decimal-division lesson now explains equal scaling with actual groups,
without relying on algebra. Its general identity is
a ÷ b = (a × k) ÷ (b × k), for non-zero b and k. This belongs after the
reader knows what the letters stand for, not before the arithmetic example.

These are curriculum connections rather than new extracurricular topics;
they are recorded here to preserve the removed material for later reuse.

## Decimal-place counts in square roots

**Removed from:** `pages/curriculum/GCSE/number/structure/powersAndRoots/squareRoots.html`

**Why it moved:** checking a proposed decimal root by multiplication is enough
for this lesson. The general test for a terminating root interrupted that method.

**Idea to preserve:** write a terminating decimal without trailing zeroes.
If it has p decimal places, its square has exactly 2p decimal places.
Consequently a decimal with an odd number of places in that form cannot have
a terminating square root. An even count is necessary, not sufficient:
0.03 has two decimal places but its square root does not terminate.
For comparison, 0.04 = 0.2 × 0.2 and 0.0016 = 0.04 × 0.04.
Trailing zeroes must be removed first: 0.040 is the same number as 0.04.

**Possible future treatment:** prove the counting rule by writing the decimal
as an integer divided by a power of ten, then ask what makes its root terminate.

## Squaring changes the spacing on a number line

**Removed from:** the same square-roots lesson's paired draggable number lines.

**Idea to preserve:** equally spaced side lengths 1, 2, 3, … correspond to areas
1, 4, 9, … whose gaps grow. Link a point to its square on a second line to
explore why this is not a constant scale factor. The GCSE page retains the
simple observation that √50 lies between 7 and 8; detailed estimation belongs
to its own curriculum lesson, while this nonlinear-mapping exploration can
be developed separately.

## Powers as dimensions beyond cubes

**Removed from:**
`pages/curriculum/GCSE/number/structure/powersAndRoots/indexNotation.html`

**Why it moved:** the GCSE page needs positive integer indices as repeated
multiplication, including squares and cubes. Four-dimensional geometry is an
interesting consequence of the notation, but it does not help a pupil read,
write or evaluate a power and sat between the core examples and the live power
exploration.

**Idea to preserve:** squares and cubes get their names from two- and
three-dimensional shapes. Continuing the pattern, each higher index can be
associated with one more independent direction. Ordinary space has three
mutually perpendicular directions, but the mathematics of coordinates and
powers continues to any number of dimensions.

**Possible future treatment:** begin with the sequence point, line segment,
square and cube. Construct each new object by copying the previous object and
joining corresponding vertices. The next object is a four-dimensional
hypercube, or tesseract. A drawing of a tesseract on a flat page is a projection,
just as a perspective drawing of a cube is a two-dimensional projection of a
three-dimensional object. Keep this page about structure and projection; do not
suggest that an index literally means a physical dimension in every use.

## Ambiguous implied multiplication

**Removed from:**
`pages/curriculum/GCSE/number/structure/directedNumber/orderOfOperations.html`

**Why it moved:** GCSE order-of-operations questions use unambiguous notation.
The disputed expression below introduces a convention problem after the page
has established a reliable method, and attention shifts from evaluating clear
expressions to debating typography.

**Idea to preserve:** a number next to a bracket denotes multiplication, as in
`8(1 + 3)`. The expression `4 ÷ 8(1 + 3)` occurs in two competing readings:

- treating division and multiplication at the same priority and working left
  to right gives `4 ÷ 8 × 4 = 2`;
- treating the adjacent product `8(1 + 3)` as a grouped denominator gives
  `4 ÷ 32 = 0.125`.

The mathematical lesson is not to declare one internet convention victorious.
Notation should expose the intended grouping. Write
`4 / (8(1 + 3)) = 0.125` for the second reading and
`(4 ÷ 8)(1 + 3) = 2` for the first. A fraction bar or explicit brackets leave
only one structure to read.

**Source retained for later research:** Dave Peterson, “Implied Multiplication
1: Not as Bad as You Think”,
<https://www.themathdoctors.org/implied-multiplication-1-not-as-bad-as-you-think/>
(archive captured at
<https://web.archive.org/web/20260903070341/https://www.themathdoctors.org/implied-multiplication-1-not-as-bad-as-you-think/>).
ISO 80000-2 and mathematical style guides are worth checking again when the
extracurricular page is written.

## Divisibility tests beyond 2, 3, 4, 5, 9 and 10

**Removed from:**
`pages/curriculum/GCSE/number/structure/factorsAndPrimes/multiplesAndDivisibility.html`

**Why it moved:** the lesson's cover note specifies the six tests for 2, 3, 4,
5, 9 and 10. Tests for 6, 7, 8, 11, 12 and 25 more than doubled the page and
placed optional number theory after its summary. The following material can
become a connected extracurricular lesson on why divisibility tests work.

### Tests built from powers of ten

- **25:** the final two digits must be `00`, `25`, `50` or `75`. Since
  `100 = 4 × 25`, every complete hundred is divisible by 25 and only the last
  two digits can affect the remainder. For `4,932`, the ending `32` leaves
  remainder 7, so `4,932 ÷ 25 = 197 r 7`.
- **8:** the number made by the final three digits must be divisible by 8.
  Since `1,000 = 8 × 125`, all earlier thousands contribute no remainder. For
  `4,932`, `932 ÷ 8 = 116 r 4`, so `4,932 ÷ 8 = 616 r 4`. Two digits are not
  sufficient because 100 is not divisible by 8: 132 ends in 32, but
  `132 ÷ 8 = 16 r 4`.

This is a useful general question for the future page: which ending block can
replace the whole number, and what property of `10`, `100` or `1,000` makes
that possible?

### Combining coprime tests

- **6:** pass both the test for 2 and the test for 3. The factors 2 and 3 are
  coprime, so divisibility by both gives divisibility by `2 × 3 = 6`.
  `4,932` is even and its digits sum to 18, hence `4,932 = 6 × 822`.
- **12:** pass both the test for 3 and the test for 4. The factors 3 and 4 are
  coprime, so divisibility by both gives divisibility by `3 × 4 = 12`.
  The digits of `4,932` sum to 18 and its ending 32 is divisible by 4, hence
  `4,932 = 12 × 411`.

The coprime condition matters. Passing tests for 2 and 4 establishes
divisibility by 4, not automatically by 8, because the factor 2 has already
been counted inside 4.

### Alternating digits for 11

Add and subtract digits alternately. A result divisible by 11 means the
original number is divisible by 11. For `4,932`, working from the units gives
`2 − 3 + 9 − 4 = 4`, so the number is not divisible by 11 and
`4,932 ÷ 11 = 448 r 4`.

The reason is that successive place values are alternately 1 below and 1 above
a multiple of 11: `10 = 11 − 1`, `100 = 99 + 1`, and
`1,000 = 1,001 − 1`. Starting from the other end reverses every sign but does
not change whether the result is a multiple of 11.

### Double-and-subtract for 7

Remove the final digit, double it, and subtract that double from the remaining
leading number. Repeat until the result is recognisable. For `4,932`:
`493 − 2 × 2 = 489`, then `48 − 2 × 9 = 30`; 30 is not divisible by 7, so
neither is 4,932 (`4,932 ÷ 7 = 704 r 4`).

For a number `10a + b`, the transformed number is `a − 2b`. Ten times the
transformed number is `10a − 20b`, which differs from `10a + b` by `21b`.
That difference is divisible by 7. Since 10 itself is not divisible by 7,
`10a + b` is divisible by 7 exactly when `a − 2b` is.

**Possible future treatment:** organise the tests by the structure that creates
them, not as a longer list to memorise: endings from divisible powers of ten,
digit sums from powers of ten congruent to 1, alternating sums from powers
congruent to −1, coprime combinations, and transformations that preserve a
remainder class. Let one number, such as 4,932, run through every test so that
only the structural feature varies.

## Powers as dimensions — preserved visualisations

The index-notation refresh replaces its large scrolling animation system with
a direct multiplication explorer. The interesting extension is still worth a
separate treatment: a square is a two-dimensional arrangement, a cube is
three-dimensional, and a higher power can count a higher-dimensional lattice.

The original rotating-lattice, trackball and step-by-step square/cube scenes
are preserved with their CSS and markup in
[`archive/index-notation-visuals/`](archive/index-notation-visuals/README.md).
Use these as source material for an extracurricular investigation of dimension,
not as prerequisite machinery for reading an index. Audit the revived controls
and mathematical captions afresh before publishing.
