/* A glossary that comes to the reader.

   A word whose meaning the course teaches is marked where it is used, and its
   definition appears in a small card on hover, on focus, or on a tap. Nothing
   is a link: the card is the whole of it, and the reader stays where they were.

   THE MARKS ARE IN THE MARKUP, NOT FOUND HERE. Each one is a
   `<span class="gloss" data-term="…">` written into the page, and this file
   supplies the definitions and the card. It used to scan the prose at load
   time, which meant every judgement about a word had to be spelled out as a
   rule the code could follow — and English would not hold still for it. "Mean"
   is nearly always the ordinary verb. "Round" is a quiz round on the practice
   pages and an adverb in "the wrong way round". "The difference is in what the
   columns are for" is not the difference of two squares. "The digits keep their
   identity" is not an algebraic identity. Each of those needed its own
   exception, and the exceptions could only ever approximate a reading.

   So the reading is done once, by a person, and written down. The judgement is
   then visible in the page, correctable in the page, and cannot change under a
   sentence that was edited later. `scripts/glossary-mark.mjs` proposes the
   marks for a new page; what it proposes is edited before it is kept.

   A word is marked once per page, so a page carries a handful of these and not
   a rash of them, and a page whose own heading names a term does not mark it:
   that page is the definition. */

const GLOSSARY = {
    /* Number and place value */
    "decimal": "A number written with a point, the digits after it standing for parts smaller than one.",
    "zero": "The number 0. In a written number it also holds a place open so the other digits keep their values.",
    "whole number": "A number with no fractional part: 0, 1, 2, 3 and so on.",
    "tenth": "One of ten equal parts of a whole, written 0.1.",
    "hundredth": "One of a hundred equal parts of a whole, written 0.01.",
    "thousandth": "One of a thousand equal parts of a whole, written 0.001.",
    "quantity": "An amount of something, usually with a unit attached.",
    "approximate": "Close to the true value but not exactly it.",
    "convert": "To rewrite a quantity in a different unit or a different form, without changing what it is worth.",
    "negative": "Less than zero, written with a minus sign in front.",
    "notation": "An agreed way of writing something down, such as index notation for powers.",
    "unit": "The thing a measurement counts — metres, grams, seconds — or a single one of something.",
    "consecutive": "Following one after another with no gap, as 6, 7 and 8 are.",
    "estimate": "A rough answer worked out from rounded numbers, used to check a real one is sensible.",
    "accuracy": "How close a value is to the true one, and how many figures it is stated to.",
    "exact value": "An answer left in a form that loses nothing, such as a fraction or a multiple of π, rather than rounded.",
    "rational": "A number that can be written as one integer over another.",
    "irrational": "A number that cannot be written as one integer over another, such as π or √2.",
    "integer": "A whole number, positive, negative or zero. 7, −3 and 0 are integers; 2.5 is not.",
    "digit": "One of the ten symbols 0 to 9. A digit's value depends on the place it stands in.",
    "place value": "The value a digit takes from its position. The 5 in 500 is worth five hundreds; the 5 in 0.5 is worth five tenths.",
    "decimal point": "The mark separating the whole-number part of a number from the part smaller than one.",
    "decimal place": "A position after the decimal point. 3.14 has two decimal places.",
    "placeholder": "A zero written to hold a place open so the other digits keep their values, as in 4,007.",
    "number line": "A line with numbers marked in order along it, smaller to the left and larger to the right.",
    "magnitude": "How large a number is, ignoring whether it is positive or negative.",
    "significant figure": "A digit that carries information about a number's size, counted from its first non-zero digit.",
    "standard form": "A number written as a value between 1 and 10 multiplied by a power of ten, such as 3.2 × 10⁴.",
    "column": "A vertical line of digits in a written calculation, all standing in the same place value.",
    /* The gerund, not the bare word: "round" is a quiz round on the practice
       pages and an adverb in "the wrong way round", while "rounding" is only
       ever the operation. */
    "rounding": "Replacing a number with a nearby one that is simpler to work with, to a stated accuracy.",
    "truncate": "To cut a number off after a stated place without rounding it up.",
    "upper bound": "The largest value a rounded or measured quantity could have been before rounding.",
    "lower bound": "The smallest value a rounded or measured quantity could have been before rounding.",
    "error interval": "The range of values a rounded or truncated measurement could have come from.",

    /* The four operations */
    "calculation": "A piece of arithmetic set out to be worked through.",
    "evaluate": "To work an expression or a power out to a single number.",
    "order of operations": "The agreed order for working a calculation out: brackets, indices, multiplying and dividing, then adding and subtracting.",
    "commutative": "An operation that gives the same answer whichever way round its two numbers go, as adding does.",
    "sum": "The result of adding. The sum of 3 and 4 is 7.",
    "difference": "The result of subtracting. The difference between 9 and 4 is 5.",
    "product": "The result of multiplying. The product of 3 and 4 is 12.",
    "dividend": "The number being divided. In 96 ÷ 4, the dividend is 96.",
    "divisor": "The number being divided by. In 96 ÷ 4, the divisor is 4.",
    "quotient": "The result of a division. In 96 ÷ 4 = 24, the quotient is 24.",
    "remainder": "What is left over when one number does not divide exactly into another. 29 ÷ 4 leaves a remainder of 1.",
    "partial product": "One of the rows in a long multiplication, before they are added together.",
    "regroup": "To rewrite ten of one place as one of the next place up, or the reverse, without changing the amount.",
    "exchange": "To trade one of a place for ten of the place below it, so a column has enough to subtract from.",
    "inverse": "The operation that undoes another. Division is the inverse of multiplication; a square root is the inverse of squaring.",
    "multiplier": "The number a quantity is multiplied by.",
    "operation": "One of the things that can be done to numbers: adding, subtracting, multiplying, dividing and so on.",

    /* Powers and roots */
    "index": "The small raised number that says how many equal factors a power has. In 2⁵ the index is 5.",
    "indices": "More than one index. The plural of index.",
    "base": "The number being repeated in a power. In 2⁵ the base is 2. Also the side of a shape an area is measured from.",
    "power": "A number written as a base with an index, standing for repeated multiplication. 2⁵ is a power.",
    "square number": "A number made by multiplying a whole number by itself: 1, 4, 9, 16, 25 and so on.",
    "cube number": "A number made by multiplying a whole number by itself twice over: 1, 8, 27, 64 and so on.",
    "square root": "The number that, multiplied by itself, gives the number under the sign. √49 = 7.",
    "cube root": "The number that, multiplied by itself twice over, gives the number under the sign. The cube root of 27 is 3.",
    "unit square": "A square one unit wide and one unit tall, with an area of 1.",
    "surd": "A root that cannot be written exactly as a fraction, such as √2, left in root form rather than rounded.",
    "rationalise": "To clear a root from the bottom of a fraction by multiplying top and bottom by the same thing.",

    /* Factors, multiples and primes */
    "common factor": "A factor shared by two or more numbers.",
    "common multiple": "A multiple shared by two or more numbers.",
    "index form": "A number written as a product of powers, such as 2³ × 3² for 72.",
    "factor": "A whole number that divides exactly into another. The factors of 12 are 1, 2, 3, 4, 6 and 12.",
    "multiple": "The result of multiplying a number by a whole number. 12, 18 and 24 are multiples of 6.",
    "prime": "A whole number above 1 with exactly two factors, itself and 1. 2, 3, 5, 7 and 11 are prime.",
    "prime factor": "A factor of a number that is itself prime.",
    "highest common factor": "The largest number that divides exactly into two or more numbers.",
    "lowest common multiple": "The smallest number that two or more numbers all divide into exactly.",
    "reciprocal": "The number that multiplies with a given number to make 1. The reciprocal of 4 is a quarter.",

    /* Fractions, decimals and percentages */
    "fraction": "A number written as one whole number over another, standing for a division or a part of a whole.",
    "unit fraction": "A fraction with 1 on top, such as a third or a fifth.",
    "percentage change": "How much a quantity has grown or shrunk, as a percentage of what it started at.",
    "simple interest": "Interest worked out on the starting amount each time, never on the interest already earned.",
    "compound interest": "Interest worked out each time on the amount as it now stands, interest included.",
    "depreciation": "A fall in value over time, usually given as a percentage each year.",
    "numerator": "The number above the bar in a fraction, counting how many parts are taken.",
    "denominator": "The number below the bar in a fraction, saying how many equal parts the whole is cut into.",
    "improper fraction": "A fraction whose numerator is at least as large as its denominator, such as seven fifths.",
    "mixed number": "A whole number and a fraction written together, such as one and two fifths.",
    "equivalent": "Equal in value though written differently. Two fifths and four tenths are equivalent.",
    "simplest form": "A fraction written with the smallest whole numbers possible, with no common factor left.",
    "cancel": "To divide the top and bottom of a fraction by a common factor.",
    "recurring": "A decimal whose digits repeat for ever in a pattern, as 0.333 does with its 3.",
    "terminating": "A decimal that stops after a finite number of places, such as 0.375.",
    "percentage": "A number of parts per hundred. 30% means 30 out of every 100.",

    /* Ratio and proportion */
    "unitary": "Finding the value of one part or one unit first, then scaling up to the amount wanted.",
    "direct proportion": "A relationship where doubling one quantity doubles the other.",
    "inverse proportion": "A relationship where doubling one quantity halves the other.",
    "rate": "How much of one quantity there is for each unit of another, such as miles per hour.",
    "compound measure": "A measure built from two others, such as speed from distance and time.",
    "ratio": "A comparison of two or more quantities, written with a colon, such as 3 : 2.",
    "proportion": "The relationship between a part and the whole, or between quantities that change together.",
    "scale factor": "The number every length is multiplied by when a shape is enlarged or reduced.",
    "density": "Mass divided by volume, a measure of how much matter is packed into a space.",

    /* Ordering and comparison */
    "ascending": "Arranged from smallest to largest.",
    "descending": "Arranged from largest to smallest.",
    "inequality": "A statement that two values are not equal, or that one is a boundary for the other, written with <, >, ≤ or ≥.",

    /* Algebra */
    "equation": "A statement that two expressions are equal, usually holding only for particular values.",
    "unknown": "A letter standing for a number that has to be found.",
    "solution": "A value of the unknown that makes an equation true.",
    "linear": "Of degree one: an expression or graph with no squares or higher powers, drawn as a straight line.",
    "subject": "The letter on its own on one side of a formula, which the formula gives the value of.",
    "rearrange": "To rewrite a formula so a different letter is the subject.",
    "function": "A rule turning each input into exactly one output.",
    "y-intercept": "Where a graph crosses the vertical axis.",
    "midpoint": "The point exactly halfway between two others.",
    "turning point": "The point where a curve stops rising and starts falling, or the reverse.",
    "proof": "An argument showing a statement must be true for every case, not just the ones tried.",
    "expression": "A collection of numbers and letters joined by operations, with no equals sign.",
    "term": "One part of an expression, separated from the others by a plus or minus sign.",
    "coefficient": "The number multiplying a letter in an algebraic term. In 5x the coefficient is 5.",
    "variable": "A letter standing for a number that can change.",
    "factorise": "To write an expression as a product of its factors.",
    "expand": "To multiply out a bracket, writing the result as separate terms.",
    "substitute": "To replace a letter with a given number and work the expression out.",
    "simplify": "To write something in its shortest equal form, by collecting or cancelling.",
    "formula": "A rule written with letters, showing how one quantity is worked out from others.",
    "identity": "A statement true for every value of the letters in it, not just for some.",
    "simultaneous": "Two or more equations that must hold at the same time, solved together.",
    "gradient": "How steep a line is: how far it rises for each step across.",
    "intercept": "Where a line crosses an axis.",
    "sequence": "A list of numbers in a set order, each called a term.",
    "nth term": "A rule giving any term of a sequence from its position number.",
    "quadratic": "An expression or equation whose highest power is a square.",

    /* Geometry */
    "length": "How long something is, measured along it.",
    "acute": "An angle smaller than 90 degrees.",
    "obtuse": "An angle between 90 and 180 degrees.",
    "reflex": "An angle between 180 and 360 degrees.",
    "isosceles": "A triangle with two equal sides and two equal angles.",
    "equilateral": "A triangle with all three sides equal and all three angles 60 degrees.",
    "scalene": "A triangle with no two sides equal.",
    "parallelogram": "A quadrilateral with both pairs of opposite sides parallel.",
    "trapezium": "A quadrilateral with exactly one pair of parallel sides.",
    "rhombus": "A parallelogram with all four sides equal.",
    "interior angle": "An angle inside a polygon, between two of its sides.",
    "exterior angle": "The angle between one side of a polygon and the next side extended.",
    "regular": "Having all sides equal and all angles equal.",
    "surface area": "The total area of every face of a solid.",
    "cuboid": "A box-shaped solid with six rectangular faces.",
    "cylinder": "A solid with two circular ends and one curved surface.",
    "cone": "A solid with a circular base narrowing to a point.",
    "sphere": "A solid every point of which is the same distance from its centre.",
    "pyramid": "A solid with a flat base whose other faces meet at a point.",
    "symmetry": "A shape's property of looking the same after a reflection or a turn.",
    "transformation": "A change of a shape's position, size or orientation.",
    "scalar": "A plain number, with size but no direction, that a vector can be multiplied by.",
    "trigonometry": "Working out sides and angles of triangles from the ratios between them.",
    "adjacent": "Next to. In a right-angled triangle, the side beside the angle being used.",
    "sine": "In a right-angled triangle, the opposite side divided by the hypotenuse.",
    "cosine": "In a right-angled triangle, the adjacent side divided by the hypotenuse.",
    "perimeter": "The total distance around the edge of a shape.",
    "area": "The amount of surface a flat shape covers, measured in square units.",
    "volume": "The amount of space a solid fills, measured in cubic units.",
    "vertex": "A corner, where edges of a shape or solid meet.",
    "edge": "A straight side of a shape, or the line where two faces of a solid meet.",
    "face": "One of the flat surfaces of a solid.",
    "polygon": "A flat shape with straight sides.",
    "quadrilateral": "A polygon with four sides.",
    "parallel": "Always the same distance apart, never meeting.",
    "perpendicular": "At right angles. Two perpendicular lines meet at 90 degrees.",
    "congruent": "The same shape and the same size.",
    "similar": "The same shape but not the same size, with every length multiplied by one scale factor.",
    "bisect": "To cut exactly in half.",
    "tangent": "A straight line touching a curve at one point without crossing it.",
    "chord": "A straight line joining two points on a circle.",
    "arc": "Part of the curve of a circle.",
    "sector": "A slice of a circle between two radii and the arc joining them.",
    "segment": "The part of a circle cut off by a chord.",
    "circumference": "The distance all the way round a circle.",
    "radius": "The distance from the centre of a circle to its edge.",
    "diameter": "The distance right across a circle through its centre, twice the radius.",
    "hypotenuse": "The longest side of a right-angled triangle, opposite the right angle.",
    "prism": "A solid with the same cross-section all the way along its length.",
    "cross-section": "The flat shape revealed by cutting straight through a solid.",
    "net": "A flat shape that folds up into a solid.",
    "bearing": "A direction measured clockwise from north, written with three figures.",
    "vector": "A quantity with both a size and a direction.",
    "enlargement": "A change of size by a scale factor, from a centre.",
    "translation": "A slide of a shape, with no turn and no change of size.",
    "rotation": "A turn of a shape about a fixed point.",
    "reflection": "A flip of a shape in a mirror line.",
    "locus": "The set of all points obeying a given rule.",

    /* Statistics and probability */
    "data": "The values collected about something, before anything is worked out from them.",
    "average": "A single value standing for a whole set, such as the median or the mode.",
    "interquartile range": "The spread of the middle half of the data, the upper quartile minus the lower.",
    "histogram": "A chart for grouped data where the area of each bar shows the frequency.",
    "class interval": "One of the groups data is sorted into, such as heights from 150 to 160 cm.",
    "line of best fit": "A straight line drawn through scattered points to show the trend.",
    "sample": "A part of a population, chosen to stand for the whole of it.",
    "probability": "How likely something is, given as a number from 0 for impossible to 1 for certain.",
    "tree diagram": "A branching diagram showing the outcomes of two or more stages and their probabilities.",
    "set": "A collection of things, listed or described, with nothing counted twice.",
    "union": "Everything in either of two sets, or in both.",
    "intersection": "Everything in both of two sets at once.",
    "median": "The middle value once the values are put in order.",
    "mode": "The value that appears most often.",
    "quartile": "A value cutting an ordered set into quarters.",
    "outlier": "A value far away from the rest of the data.",
    "frequency": "How many times a value or group occurs.",
    "cumulative frequency": "A running total of frequencies, up to and including each value.",
    "correlation": "How closely two sets of data rise or fall together.",
    "discrete": "Data that can only take separate values, such as a count.",
    "continuous": "Data that can take any value in a range, such as a length.",
    "population": "Everything or everyone a set of data is meant to describe.",
    "bias": "Anything that makes a sample or a result systematically unrepresentative.",
    "event": "One or more outcomes of an experiment, taken together.",
    "outcome": "One of the things that can happen in an experiment.",
    "mutually exclusive": "Two outcomes that cannot both happen at once.",
    "independent": "Two events where one happening does not change the chance of the other.",
    "sample space": "The set of every outcome an experiment can have.",
    "relative frequency": "How often something happened, as a fraction of the number of trials.",

    /* This site */
    "tier": "One of the two GCSE papers. Foundation covers grades 1 to 5; Higher covers grades 4 to 9."
};

document.addEventListener("DOMContentLoaded", () => {
    const main = document.querySelector("main");
    const layout = document.querySelector(".layout");
    const marks = main ? main.querySelectorAll(".gloss") : [];
    if (!main || !layout || !marks.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* The card is positioned against a layer of its own rather than against
       .layout, which carries no position of its own and only becomes a
       containing block below 900px, where shared.css transforms it. Measuring
       from .layout therefore placed the card correctly on a narrow window and
       wrongly on a wide one. The layer sits inside .layout, so it is scaled by
       the same transform and the card keeps the panel's own coordinates at
       every width. */
    const layer = document.createElement("div");
    layer.className = "gloss-layer";
    const card = document.createElement("div");
    card.className = "gloss-card";
    card.setAttribute("aria-hidden", "true");
    layer.append(card);
    layout.prepend(layer);
    const cardTerm = document.createElement("b");
    const cardBody = document.createElement("p");
    card.append(cardTerm, cardBody);

    /* Each mark names its term; the definition is attached here, once for the
       card and once, unseen, for a screen reader — which gets the definition
       read out with the word rather than having to reach the card at all. A
       mark naming a term that no longer exists loses its underline instead of
       becoming a word that offers a card and then has nothing to show. */
    let count = 0;
    for (const mark of marks) {
        const definition = GLOSSARY[mark.dataset.term];
        if (!definition) { mark.classList.remove("gloss"); continue; }
        count += 1;
        mark.tabIndex = 0;
        const spoken = document.createElement("span");
        spoken.className = "gloss__spoken";
        spoken.id = `gloss-${count}`;
        spoken.textContent = definition;
        mark.setAttribute("aria-describedby", spoken.id);
        mark.after(spoken);
    }
    if (!count) return;

    let open = null;
    let timer = null;

    const hide = () => {
        window.clearTimeout(timer);
        timer = null;
        if (!open) return;
        open.classList.remove("is-open");
        open = null;
        card.classList.remove("is-shown");
    };

    const show = (mark) => {
        window.clearTimeout(timer);
        timer = null;
        if (open === mark) return;
        if (open) open.classList.remove("is-open");
        open = mark;
        mark.classList.add("is-open");
        cardTerm.textContent = mark.dataset.term;
        cardBody.textContent = GLOSSARY[mark.dataset.term];

        /* Above the word, always, unless the window has no room above it —
           a card over the words already read costs less than one over the words
           about to be. Everything is worked in the panel's own coordinates,
           which are 900px wide whatever the window is; only the room-above test
           belongs to the window, so the card's height is scaled back up to what
           the window actually shows before it is compared. */
        const GAP = 10;
        const EDGE = 12;
        card.classList.add("is-shown");

        const frame = layer.getBoundingClientRect();
        const panel = layout.getBoundingClientRect();
        const scale = layout.offsetWidth && panel.width ? panel.width / layout.offsetWidth : 1;
        const box = mark.getBoundingClientRect();
        const width = card.offsetWidth;
        const height = card.offsetHeight;

        const centre = (box.left + box.width / 2 - frame.left) / scale;
        const half = width / 2;
        const span = layout.offsetWidth;
        card.style.left = `${Math.min(Math.max(centre, half + EDGE), span - half - EDGE)}px`;

        const roomAbove = box.top >= height * scale + GAP * scale + EDGE;
        const top = (box.top - frame.top) / scale;
        card.classList.toggle("is-below", !roomAbove);
        card.style.top = roomAbove
            ? `${top - height - GAP}px`
            : `${top + box.height / scale + GAP}px`;
    };

    const linger = (mark) => {
        window.clearTimeout(timer);
        /* Long enough that a cursor crossing a word on its way somewhere else
           never opens anything. */
        timer = window.setTimeout(() => show(mark), 500);
    };

    main.addEventListener("pointerover", (event) => {
        const mark = event.target.closest(".gloss");
        if (mark && event.pointerType !== "touch") linger(mark);
    });
    main.addEventListener("pointerout", (event) => {
        const mark = event.target.closest(".gloss");
        if (mark && !mark.contains(event.relatedTarget)) hide();
    });
    /* A tap has no hover to wait through. */
    main.addEventListener("click", (event) => {
        const mark = event.target.closest(".gloss");
        if (!mark) { hide(); return; }
        if (open === mark) hide(); else show(mark);
    });
    main.addEventListener("focusin", (event) => {
        const mark = event.target.closest(".gloss");
        if (mark) show(mark);
    });
    main.addEventListener("focusout", (event) => {
        if (event.target.closest(".gloss")) hide();
    });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") hide(); });
    window.addEventListener("scroll", hide, { passive: true });
    window.addEventListener("resize", hide);
    if (reduceMotion.matches) card.classList.add("is-still");
});
