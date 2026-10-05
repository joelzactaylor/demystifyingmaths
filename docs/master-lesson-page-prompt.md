# Master prompt: build the next Demystifying Maths lesson

Use this prompt from the repository root. Replace `<TARGET>` only when a specific page is required; otherwise select the next unwritten teaching page after the most recently completed page.

Quick invocation, in any agent (Claude Code, Codex, Copilot agent mode, Cursor — `AGENTS.md` at the repository root points here; in VS Code Copilot chat, `/build-lesson` does the same):

> "Read and execute `docs/master-lesson-page-prompt.md` for the next unwritten teaching page. Treat the prompt as the complete brief and continue until every review and validation gate passes."

To name the page explicitly:

> Read and execute `docs/master-lesson-page-prompt.md` with `<TARGET>` set to `pages/path/to/page.html`.

---

Create `<TARGET>` from the ground up as a finished Demystifying Maths teaching page. Work autonomously, but keep all implementation changes limited to the target HTML page, its dedicated CSS and JavaScript assets, and the target page's `written` status in the relevant manifest. Preserve every unrelated local change in the dirty worktree. Do not edit the practice page or neighbouring lessons unless I explicitly approve a separate consistency fix.

## Establish the brief before writing

### Keep the work small and concrete

Use the working roots lesson as evidence, not as an excuse to invent a framework.
Build one complete teaching sequence, render it, type real answers into it, then
extend it. Reuse existing components; extract new shared machinery only when a
second real use needs it. Prefer removing an unnecessary control or paragraph to
adding another state or rule. The final answers should reveal the takeaway and
next-lesson link together, without an extra completion gate.

Keep each rule in one home: this brief owns lesson construction, the voice guide
owns prose, and the audit cycle owns verification. IDE instructions should link
to these rather than maintain competing palettes and workflows. Record a real
regression with a reproducible test, not another blanket prohibition. Native
typing, blur and focus matter: assigning input values in a script is not enough.

This is our application of DHH's emphasis on
[reasoning from working code](https://signalvnoise.com/svn3/on-writing-software-well/)
and [explicit scope trade-offs](https://signalvnoise.com/svn3/everything-is-possible-but-nothing-is-free/),
not a claim that he prescribed this site's teaching design.

1. Read the target stub, its manifest `coverNote`, its linked practice specification and its position in the curriculum sequence.
2. Read the positiveAndNegativeRoots prototype and its CSS/JS in powersAndRoots for current presentation and inline interactions. Read preceding lessons for prerequisites, not as automatic visual templates. Written-method pages remain references for arithmetic diagrams only.
3. Identify exactly what the preceding pages have already taught, what this page must teach, and what later pages own. Do not introduce a later technique merely because it is related.
4. Write down an internal scope boundary and test every proposed section against it. If the specification says one-digit or two-digit operands, integer divisors, a particular tier, or a particular answer form, enforce that in examples and interactive inputs.
5. Check every calculation independently before using it.

## Build a coherent teaching narrative

**Voice standard:** follow `lesson-prose-voice.md`, with Mathigon's Circles
introduction as the reference for conversational teaching. Its guidance takes
precedence over older restrictions below: “we”, “you”, purposeful questions,
short transitions and visible instructions are welcome. Teach before testing.
Evaluate the explanation and interaction together, not by counting forbidden
words or adding navigation furniture.

- Start with a specific, meaningful heading—not “Introduction”—and a concise prerequisite strip linking to the actual prerequisite lessons.
- Teach in dependency order. A sentence must not rely on an idea, notation, appended digit, conversion, exception or choice that is only explained later on the page.
- Introduce the underlying mathematical meaning before compressing it into a routine.
- Use natural mathematical language. Never write nonsense such as “four fits into nine hundreds”; name the actual quantity and operation.
- Make the nouns and units do real teaching work in contextual examples. Do not use fractional people, cars, boxes or other indivisible objects.
- Include only examples that earn their place: reveal a structural issue, misconception, zero, decimal boundary, contextual decision or check.
- **Mark the glossary terms by hand, as part of writing the page.** `js/glossary.js` carries the terms the course teaches and the card that shows them; the marks themselves are `<span class="gloss" data-term="quotient">quotient</span>` written into the prose. Marking used to be done by a scanner at load time, and it could not be taught the difference between "the difference of two squares" and "the difference is in what the columns are for", or between an algebraic identity and "the digits keep their identity". Read the page and decide. `node scripts/glossary-mark.mjs --write <page>` will propose a first set of marks; treat what it proposes as a draft to edit, not an answer. Mark a term **once per page**, at the first place a reader who did not know it would be stopped by it — in running prose only, never in a heading, a link, a bold label, a control, or notation, and never on the page whose own heading names that term, because that page is the definition. Be generous: a reader who has forgotten what a divisor is has forgotten it on every page, not only the one that teaches it. To add a term, add it to `js/glossary.js`; a word whose everyday sense is the one these pages use — mean, range, carry, solve — is refused by `scripts/glossary-check.mjs` on purpose.
- **Never write a false statement because the true one is out of scope.** A page may leave a topic out; it may not say something that is wrong. "x² = −9 has no solution" is false — −9 has two square roots — and a reader who meets them later has been taught something they must unlearn, which is worse than never having been told. Scope the claim instead of breaking it: "no number on the number line squares to −9" is true, needs no vocabulary the page has not got, and stays true for the rest of the reader's life. The same move fixes "you cannot subtract a larger number from a smaller one", "a fraction cannot have a denominator of zero because it would be very large", and every other convenience that a later page has to undo. Where the honest version leaves a question open, name where it is answered and link it — `pages/extracurricular/` exists for exactly this, and a one-clause pointer costs nothing.
- Address genuine mistakes where they arise. Do not add a common-mistakes panel or dropdown by default; finish with a short, visible Key points summary. Optional help must use the learner's actual answer and supply a useful next step without assuming their reasoning.
- Teach one manageable idea at a time. Word counts and heading formulas are not quotas. Keep examples continuous; explicitly reintroduce an older example rather than referring to its numbers after the questions have moved on.
- Use natural headings, sufficient worked explanation and a short visible Key points ending. Avoid repeated rule cards, compulsory misconception lists and learning-objectives furniture.
- End with the next teaching lesson. Lesson-specific retrieval belongs inline; separate mixed reviews are governed by the mixed-review brief.
- Remove the author note, stub text, TODOs, “coming soon”, AI-facing commentary and unnecessary descriptions of page functionality.
- Give only the simplest interaction instruction when needed, tied to a mathematical purpose. No keyboard instruction lists or narration of obvious page mechanics in teaching prose; retain keyboard support.

## Make animations teach rather than decorate

- Choose interaction to suit the mathematics. Direct manipulation is often preferable to a pinned scroll card. Use Continue for a natural reading pause, not every paragraph. Retain written-method scroll scenes only where movement teaches a real operation.
- The drawing area begins with the setup only — the numbers as given, nothing worked — and each mathematical step is drawn as the reader scrolls. (The reference pages do not begin blank: `primeFactorisation` opens on the 84, `longDivision` on the set-out calculation.)
- Give every step a generous stationary reading interval. Movement happens between stops; a highlight must not glide continuously through the entire calculation.
- Ease scroll-driven opacity, position, line and highlight changes. Avoid abrupt class swaps that make writing or emphasis snap between frames; preserve a stationary interval after each eased reveal.
- **The gold frame is drawn behind the marks it lights, and the stylesheet has to say so.** This is the trap: an absolutely positioned element painted after its siblings sits in front of them by default, so a frame appended last covers the very digits it was meant to pick out — and it looks deliberate enough that it survives a read-through. Give the frame `z-index: 0` and every mark it can reach `position: relative; z-index: 1`, which is what `longDivision`, `longMultiplication` and `indexNotation` already do. Two consequences follow. A frame that is a sibling of an opaque panel cannot just be lowered beneath it — it would go behind that panel's own background and vanish — so it moves *inside* the panel, above the background and below the contents; drop the panel's `overflow: hidden` if the frame's padding needs to sit proud of the edge, and measure the frame against the panel it now lives in. And anything that has to cross the frame — a travelling numeral, a subtraction rule, a brought-down digit — needs a layer above both. Fills are chosen to read through: a tinted mark over gold shows the gold, a solid one hides it.
- Drive linked reference highlights from continuous scroll progress rather than abrupt stage-only class toggles. Keep the selected source highlighted while its value is chosen and copied, ease it away afterward, and aggregate repeated matches so an inactive step cannot overwrite the current highlight.
- The caption, highlighted region and newly drawn marks must describe exactly the same step.
- Avoid duplicate narration across the animation heading, active caption, static answer and no-JavaScript fallback. Seed dynamic captions without repeating their JavaScript stage text, and ensure only one fallback result is visible when JavaScript is unavailable.
- Build different visuals for genuinely different scenarios. Do not reuse one generic picture while merely changing the caption.
- Centre every diagram using a full-size outer layer whose sole job is centring a naturally sized inner composition. Do not combine fixed widths with an absolutely positioned full-size layer.
- Keep the animation card's dimensions stable from its first frame to its last. Do not add completion ticks.
- Size gold highlights around all relevant marks, including carried or exchanged numerals, with balanced visual margins.
- Align digits and decimal points on a shared grid. Place carried figures close enough to show their destination but never overlapping the main digits.
- Size the column to its label, never the label to the column. Nothing visible is set under 12px, and a label the reader must read — a place name, a unit, a caption, a status line, the text beside an input — is 14px; a column header whose width the mathematics fixes may drop to 13px, in regular weight where bold will not fit. When the names still will not fit one row — twelve place names over one machine — set them on two alternating rows. Rotate labels only as the fallback a dense board drops to when the digits themselves have set the column width; it is the last resort, not the first. Thirty-one lessons carried 8–11px labels, copied board to board from one reference page, before `scripts/text-check.mjs` measured them.
- Respect `prefers-reduced-motion`: show a complete, understandable static state and remove surplus scroll distance.

## Make live examples robust

- Live-update on every valid input; never require a build button.
- Update existing nodes in place. Do not reparent or rebuild a focused input's containing card.
- Preserve focus, caret and scroll position while sanitising input.
- Reserve stable space for answers, messages and diagrams so edits do not make the page jump.
- Constrain inputs to the exact syllabus scope and present a clear invalid state without leaving stale answers visible.
- Test exact results, remainders, zeroes, a leading value smaller than the divisor, minimum and maximum inputs, empty input and invalid characters.

## When the page is a written method

Everything in this section is about column and long-form arithmetic — dividends, quotients, subtraction rules, the gold frame that walks a calculation. A page on factors, indices, ratio or probability can skip it; the earlier sections are the whole brief for those.

- Explain quotient placement through place value, not position alone. State why a quotient digit is written above a particular dividend digit and what value it represents in the completed quotient.
- Separate genuinely different routes before combining them. For example, stopping with a remainder and continuing into decimals are distinct choices; explain the decision before demonstrating either route.
- When both remainder and decimal forms are in scope, show a complete example of each—ideally using the same division so the different stopping decisions are unmistakable. Any division sandbox must offer an explicit remainder/decimal switch that changes the calculation's stopping rule and explanation, not merely its label.
- Make every sandbox caption agree with the selected result form. A completed decimal route should say that the division is exact, not announce a “final remainder”; an exact remainder-mode result should say that nothing is left to write. Audit shared captions for other route-specific contradictions.
- Whenever a rule explicitly mentions ignoring, retaining or removing trailing zeroes, include one short numerical example that makes that decision concrete instead of leaving it as prose.
- When a written method can produce an internal zero in the answer, visibly model one deliberate example. Align the zero in its correct column and explain that it holds the place when the current amount is smaller than the divisor; a warning in “common mistakes” is not enough.
- In written algorithms, use one continuous gold frame around the complete current amount, not separate boxes around its digits. Interpolate that frame's position and size between real step boundaries.
- Give written calculations generous, even vertical rhythm. Every adjacent numeral row—including the dividend and first product—must have the same centre-to-centre spacing whether or not a subtraction rule lies between them. If the dividend row must remain taller to clear its bracket and highlight, offset the working stack by half the row-height difference rather than leaving an oversized first gap. Overlay subtraction rules within the shared gaps instead of letting them alter the spacing. Keep numerals clearly separated from division brackets, fraction bars and subtraction rules; centre the gold frame around the numerals themselves instead of sizing it from the full row, so it never touches or crosses a neighbouring rule.
- Reuse the established measured-cursor model from the neighbouring written-method pages: measure digit centres from the completed layout, cache the targets, use the same rounded gold treatment, hold the frame at each step, then ease its movement late in the transition. Do not derive its shape from entire grid-row rectangles.
- Make copied mathematics visibly come from its source: a brought-down digit travels from the dividend into the next working row; in long division, the chosen multiplier glides from the selected multiples-list row into the quotient and its product glides into the subtraction row. Keep the originals visible so the movement reads as copying.
- Draw the subtraction rule smoothly after the product arrives, then reveal the remainder. Do not make a completed subtraction block appear at once.
- Reveal a written subtraction result from above: its digits descend out of the operands and through the subtraction rule into the answer row. Never make them rise into place from below.
- If a calculation is deliberately truncated while a remainder is still non-zero, make that unfinished status explicit at the final arithmetic step as well as in the conclusion. Draw an ellipsis in the answer and say that the displayed digits are only the beginning; do not hide the explanation in one additional scroll stage.
- Treat any display limit as an interface choice, not a mathematical milestone. Explain continuation through the non-zero remainder and ellipsis without suggesting that the chosen number of displayed decimal places is special.
- On division pages, make the starting-position decision prominent: compare successive leading blocks and begin with the shortest one at least as large as the divisor. Do not leave this as a passing sentence or let the animation silently skip to the chosen block.
- For division sandboxes, include a known non-terminating test such as `1456 ÷ 76`. Verify that the last subtraction, drawn quotient and final caption all say or show that the decimal continues.

## Use the desktop lesson canvas

Lessons are designed for laptop and desktop screens. Keep the site's existing omission of `<meta name="viewport">`; mobile reflow is not an authoring target. `lesson-sections.css` owns the desktop geometry: it preserves a 900px floor for existing diagrams, widens the lesson canvas when space permits, and moves it right on a full desktop so the fixed contents panel occupies a separate left rail. Do not reproduce or override that geometry in a page-specific stylesheet.

The prose measure stays narrower than the canvas. Figures, worked examples and interactions may use the available width; direct section prose is capped by `lesson-sections.css` so widening the lesson does not produce difficult lines of text.

## Match the current lesson prototype

The current design reference is
`pages/curriculum/GCSE/number/structure/powersAndRoots/positiveAndNegativeRoots.html`
with its dedicated CSS/JS. This is a prototype, not proof that every other page
has migrated. Its page-specific integration supplements `lesson-checks.js`;
copying only the shared files will not reproduce accepted-answer, help or
restoration behaviour.

Keep the existing font. Use a continuous white reading surface, a comfortable
roughly 760px reading measure at full desktop width, and restrained pale figure
surfaces. Match questions to surrounding prose in size, baseline and spacing.
Use smaller gaps within a thought and larger breaks between ideas; the prototype
uses about 18px between paragraphs and 32px section padding. These are reference
values, not a demand to stretch every figure. Keep the outer gutters small and
reserve a separate contents rail. No gradients, decorative progress counters,
ticks, oversized answer boxes or blanket card borders.

Colour belongs to mathematical meaning: the prototype uses teal `#009b8c`,
violet `#7048c8`, blue `#2678c8`, ink `#243445`, and dark accepted-answer
green `#0f6d40`. Preserve contrast and redundant labels/shapes. Existing gold
written-method highlights may remain where they explain the calculation.
Inline maths and blanks inherit the sentence font; reserve monospace for
aligned calculations that benefit from it. Do not let punctuation resemble a
decimal point or run distinct expressions together.

**Type has a floor.** Use the established readable prose size (roughly 17–18px). Nothing visible is under 12px, and anything the reader must read is 14px — or 13px for a column header whose width the mathematics fixes. The sizes the reference boards settled on, and reuse: a column label over a board `700 .82rem/1.1 Aleo` in `#52666f`; the label beside a sandbox input `.88rem` 700 in `#41535c`; the number in a step disc `.88rem` in a 28px circle; a caption, note or status line `.9rem` or more; an axis mark on a number line `.88rem`. A figure's text is measured as rendered — an SVG label is its `font-size` times the viewBox scale, and a 10-unit label in a 920-unit drawing shown at 800px is 8.7px — so check with `node scripts/text-check.mjs <page>`, not by reading the stylesheet.

**Notation HTML cannot draw — never shy away from `<math>`, except for the radical.** Where the mathematics needs a shape no HTML element makes — a fraction bar, a raised index, a stacked coefficient — write MathML and let the browser render it:

```html
<math><mfrac><mn>3</mn><mn>10</mn></mfrac><mo>=</mo><mn>0.3</mn></math>
```

Getting the mathematics to render correctly outranks keeping the markup uniform, and a fraction or a superscript is laid out from ordinary box metrics, so it renders properly everywhere.

Two things the browser does to a bare `<math>` have to be undone. An `<mfrac>` inside an inline `<math>` is set in *compact* style, and its numerator and denominator drop to script size — about 70% of the line, so a fraction that stands as a line of working shrinks to 13px while the operators beside it stay at 19px. Give that `<math>` `display="block"`, and `math-style: normal` in the stylesheet, so its figures keep the line's size. And `shared.css` sizes a bare `math` for the extracurricular pages — `font-size: clamp(24px, 4cqw, 50px); margin: 30px` — so a lesson stylesheet sets `font-size: inherit` and `margin: 0` on the `math` it draws, or the card around it is mostly margin.

**A square root is the exception. Always draw it — never write `<msqrt>`, and never assemble a `&radic;` character and a border by hand.** A browser lays `<msqrt>` out from the OpenType MATH table of whatever font the expression is set in: the rule thickness, the gap above the radicand, and the point where the bar meets the arm all come from that table, and the sign itself has to be a *stretchy* glyph. **macOS ships no font with a MATH table**, so the browser stretches a plain U+221A and guesses the rest — the bar floats away from the arm and the radicand sits loose beneath it. Naming math fonts in the stack does not fix it; it only moves the guess to whichever machine lacks them. A `&radic;` character with a `border-top` beside it fails the same way, because the glyph's arm ends somewhere different in every font and at every size.

Use `.rad` from `lesson.css`, exactly as written, everywhere a root appears — in prose, in headings, in worked answers, in slips, and in whatever the page's JavaScript draws on its boards. It is one pattern with no variants:

```html
<span class="rad"><span class="caret" aria-hidden="true">&radic;</span><svg class="rad__sign" viewBox="0 0 24 40" aria-hidden="true" focusable="false"><path d="M.5 24H5l5.5 13.5L22 1.5H24" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="miter" stroke-linecap="butt"/></svg><span class="rad__over">49</span></span>
```

Three things make it work, and all three have to stay:

- **The sign is out of the flow and the radicand is in it.** Both boxes start at the same `y`, so the arm meets the bar exactly; and the whole radical takes its baseline from the radicand, so it sits on the line of the sentence around it instead of riding above it. An `inline-flex` radical takes its baseline from the SVG instead and floats a quarter of an em high.
- **The stroke and the border are the same fraction of an em.** 3 units of a 40-unit viewBox drawn 1.32em tall is .099em, which is the `.1em` border. Change one and you change the other.
- **The radicand keeps the surrounding font.** A root reads as part of its sentence rather than switching typeface mid-expression, which is what setting the whole expression in a math font does.

Where a root sits in a flex row beside other marks — a statement being built a step at a time — give the row `align-items: baseline` so the radicand's baseline is what the row aligns on.

**A bar over an expression carries grouping, and the clipped sign has to carry it too.** `.rad` over a single number needs only the clipped `&radic;`, because the flattened text reads `&radic;49`. Over a sum it does not: the bar is what says the root covers the whole of `9 + 16`, and stripped of styling that becomes `&radic;9 + 16`, which is a different and false statement. Open a bracket in the clipped sign and close it after the radical, so the flattened text reads `&radic;(9 + 16)`:

```html
<span class="rad"><span class="caret" aria-hidden="true">&radic;(</span>…<span class="rad__over">9 + 16</span></span><span class="caret" aria-hidden="true">)</span>
```

`scripts/notation-check.mjs` enforces both halves: a radicand holding an operator must open the bracket, and an opened bracket must be closed.

Build MathML in JavaScript with `document.createElementNS("http://www.w3.org/1998/Math/MathML", tag)`. MathML elements are not HTML elements — `className` is not writable and neither are `offsetLeft` and friends — so set classes with `setAttribute("class", ...)` and measure positions from `getBoundingClientRect()`, dividing by the card's own scale.

Stripped of its styling, positional notation loses the very thing that gives it meaning: `<msqrt><mn>49</mn></msqrt>` and `.rad` both flatten to "49", turning &radic;49 = 7 into the false 49 = 7. Put a clipped `<span class="caret" aria-hidden="true">&radic;</span>` inside the radical — the same span that stops `2<sup>5</sup>` flattening to twenty-five — so the flattened text reads once and reads true. Repair only the character that was lost: a clipped copy of the whole statement makes the stripped page read it twice.

**Optional legacy written-method scroll card.** Use only for a calculation that benefits from this mechanism: a `.<topic>-scene` wrapper (`position: relative; overflow-anchor: none;`) that takes `height: var(--scene-height); min-height: var(--scene-min-height)` once `is-ready`, holding a `.<topic>-scene__sticky` card that is `position: absolute` until JavaScript pins it. The card is `1px solid #dce4e9`, `border-radius: 14px`, a solid white or `#f7fbfd` surface, `box-shadow: 0 5px 16px rgba(24, 44, 56, .09)`, `contain: layout paint`, `overflow: hidden`, and a `grid-template-rows` with exactly one `minmax(0, 1fr)` row for the drawing. Give every scene kind the same number of grid children in both its worked and sandbox forms — wrap sandbox controls in one header block rather than adding a row.

**Legacy scroll-card implementation details (not inline question styling).**

- Caption: `display: grid; align-content: center; height: 6.6em; padding: 14px 28px 6px; text-align: center;` with `h3` at `#09539d`/`1.1rem` and `p` at `#243a45`/`.97rem`/`line-height: 1.5`. Fixing the height is what stops the card resizing between steps.
- Progress: `display: flex; gap: 8px; padding: 0 22px 18px; justify-content: center;` with 9px round dots at `#c6d4dc`; the current dot becomes `width: 28px; border-radius: 999px; background: #116e93`, and past dots `#6c9bb0`. Use the class names `is-current` and `is-past`.
- Highlight frame: `2px solid #d99a20`, `border-radius: 13px`, `background: #fff2c9`, positioned absolutely and interpolated between measured targets.
- Inputs: `width` to suit, `padding: 10px 14px`, `2px solid #b8cbd7`, `border-radius: 12px`, `outline: none`, `background: #fff`, `color: #173849`, `font: 700 1.18rem/1.2` in the monospace stack, `tabular-nums`, `text-align: center`, and `transition: border-color .18s ease, box-shadow .18s ease`. Focus is `border-color: #116e93; box-shadow: 0 0 0 4px rgba(17, 110, 147, .12)` — never a practice-page outline ring. The label above it is `<label><span>Number to divide</span><input …></label>` with the `span` at `.88rem` 700 `#41535c`.
- Invalid sandbox entry (distinct from a wrong answer to an inline question): the treatment is quiet. Grey the affected text to `#687b84` and either hide the stale working with `visibility: hidden` so the card keeps its size, or show a `2px dashed #b8cbd7` panel on `rgba(255, 255, 255, .86)` saying what is needed. Inline answer cues instead follow the retrieval rules below.
- Reduced motion: end the stylesheet with a `@media (prefers-reduced-motion: reduce)` block that returns `.<topic>-scene.is-ready` to `height: auto; min-height: 0`, makes the card `position: relative; height: auto; transform: none !important`, and removes every transition.

**Structural styles come from `lesson.css`; chapter rhythm and final visual treatment come from `lesson-sections.css`.** Every teaching page loads both, in that order. The latter lets a section use the broad lesson canvas while keeping direct prose at a readable measure, and gives each new idea a visible beginning and end. Do not reproduce those surfaces in page-specific CSS. Use `.prereq`, `.rule-card`, `.important-box`, `.wex`, `.worked`, `.slips` and `.recap` for the prerequisite strip, definitions, noticed facts, worked examples, animated examples, misconceptions and the summary. Only build a bespoke component when none of those can carry the idea. Default to a `1px` neutral border, `10px`–`14px` radius and no shadow; elevation is reserved for a sticky or genuinely overlapping object.

**Those components lay themselves out with flex and grid, so each assumes a particular set of element children.** Give them exactly the children they expect, or the layout algorithm will treat every stray inline element as a column of its own:

- `.prereq` is a flex row of exactly two items: `<p class="prereq"><b>Before this page:</b> <span>…</span></p>`. The whole sentence, including its links, goes inside the single `<span>`. Text or a link left loose beside the `<b>` becomes a separate flex item and the sentence breaks into columns.
- `.slips > li` needs a direct `<b>` for the name of the slip and a direct `<span>` for the correction; the CSS targets them with child combinators so notation inside stays inline.
- `.wex__steps > li` needs a `.wex__do` and a `.wex__why` — the grid has a column for each.
- `.important-box` carries an `.important-box__title` with an `id`, and the box is `aria-labelledby` that same `id`.
- Anything you build yourself follows the same discipline: if a container is flex or grid, wrap its prose so that the container has children, not loose runs of text.

None of this is visible without a browser, so assert it — a small structural check over the finished page costs less than a rendering pass you cannot run.

**Write the stylesheet the way the others are written.** One file per page at `css/<pageName>.css`, opening with a comment that says what the page needs beyond the shared styles and why. Page-specific CSS carries no viewport-width query: desktop lesson geometry belongs in `lesson-sections.css`, and motion preferences remain the only per-page media query.

## Audit, reorder and animate before you call it finished

A first draft is a draft. After the page runs, read it once more as a whole and rebuild it around what actually explains the idea best:

- Put capability before vocabulary. A reader should be able to *do* the thing before being taught the names for its special cases, unless a name is needed to read the next sentence.
- Address misconceptions where the evidence settles them, or in answer-specific optional help. Do not add an end-of-page mistakes list by default.
- Cut any section that does not change what the reader can do. If two sections teach the same decision, merge them.
- Then ask what is still being asserted in prose that could be shown. Use a diagram or interaction when it makes the idea clearer; do not require a scroll-led scene for every idea. Build a separate scene for each genuinely different picture rather than restyling one scene's caption; a page with one movement has one scene, and a scene whose stages only change their words is a paragraph in a box (`lesson-page-cycle.md`, figure pass).
- Animate the reverse direction as well as the forward one wherever a topic is read both ways.
- Re-run every check after reordering: heading order, deep-link IDs, practice pairing and the scene harnesses all depend on the structure you have just changed.

## Accessibility and presentation

- Include page-specific title, description and Open Graph metadata. No viewport meta tag: see "Use the desktop lesson canvas" above.
- Maintain a valid heading hierarchy with no skipped levels.
- Give every major teaching section a stable, descriptive heading ID. Put the ID on the heading itself so integrated questions can be anchored immediately after the idea they retrieve and deep links land at the top of the section rather than inside a sticky or scroll-animated scene.
- Use real labels for every input, unique IDs, valid ARIA references and concise live regions.
- Hide purely visual constructions from assistive technology, but provide the complete mathematical meaning in nearby text, captions or an image label.
- Never rely on colour alone. Use position, borders, text and shape as well.
- Keep diagrams balanced from the 900px lesson floor through the wider desktop canvas. Do not stretch labels or prose to fill space merely because it is available.

## Integrated retrieval and onward navigation

- Teach before assessing. Place about two short questions where the idea is used,
  within the explanation rather than in a separate exercise card. The first may
  scaffold; the next should leave the intended decision to the learner.
- A diagram should help the learner reach a conclusion before questions assess it.
  Avoid irrelevant precision and unnecessary controls.
- Accept correct entries automatically. Replace the blank with plain green text,
  retaining a natural baseline and operator spacing. No visible “Correct”, tick,
  congratulation, success explanation or Check button.
- After a pause on a non-empty wrong entry, give a temporary, non-colour-only cue.
  The prototype waits 1.2 seconds, clears after 1.8 seconds or immediately on edit,
  and suppresses shaking under reduced motion. Do not penalise partial typing.
- Optional help appears after an incorrect attempt and uses that actual answer.
  Diagnose recognised mistakes; otherwise offer a relevant checking step without
  claiming to know the learner's reasoning. Clear stale help when the input changes.
- Reveal small teaching steps. Use Continue where an explanation needs a reading
  pause; do not automatically scroll on answer acceptance. Keep “Show whole lesson”
  and “Reset lesson” together directly beneath contents links, without a menu scroll.
- “Show whole lesson” reveals all questions as well as explanations, without marking
  anything correct. Returning to guided view restores sequential visibility. Test
  answering revealed questions out of order; all answers are required for completion.
- Persist accepted answers and reading progress. Restore silently without replaying
  animations. Reset only this lesson's state. Test fresh, partial and completed reloads.
- When replacing a focused input, preserve a logical keyboard position. Provide
  concise assistive announcements without adding visible success copy or stealing
  focus when the learner has moved elsewhere.
- Keep the full authored lesson readable without JavaScript. Deep links reveal the
  relevant section. Respect reduced motion and test actual focus/keyboard behaviour.
- End with a brief visible Key points summary, not a common-mistakes dropdown.
  A final comparison may test the central distinction without introducing new content.
- Keep lesson-drill manifest entries as coverage briefs, not new destinations.
  Separate mixed reviews remain appropriate for interleaved recall.
- The final Continue card links to the next teaching page in curriculum order,
  or the GCSE menu when the sequence ends.

## Adversarial review before stopping

Complete at least two review passes after the first implementation:

1. **Teacher pass:** challenge every phrase, calculation, unit, prerequisite and narrative transition. Look specifically for mixed routes, premature concepts and technically correct but unnatural explanations.
2. **Pupil and visual pass:** imagine the drawing at every scroll stop and every input state. Look for static opening frames, off-centre compositions, overlapping labels, labels wider than their cells, type below the floor, ambiguous pictures, layout jumps, focus loss, clipped marks and changing card dimensions.
3. **Accessibility pass:** verify headings, labels, keyboard behaviour, live updates, reduced motion, non-colour cues and no-JavaScript fallbacks.
4. **Repository pass:** run JavaScript syntax checks, `git diff --check`, the local link checker, practice-pairing checker, `scripts/panel-check.mjs`, `scripts/notation-check.mjs`, `scripts/glossary-check.mjs`, `scripts/structure-check.mjs` (tag balance, heading levels, ids, ARIA targets, inline text that runs together), `scripts/voice-check.mjs` (read every line it prints), `scripts/text-check.mjs` (rendered type sizes and text that crosses a box edge — needs the server and Chrome), and per-page arithmetic assertions written in a script from the claims, never from the page. Render the page: headless Chrome from the command line is the standard surface (`docs/local-development.md`, "Rendering a page without a browser window") — a full-page capture under reduced motion for every static state, and one capture per scene stage. On the HCF page that pass found four faults no script had: a drop line through a cell, a sign floating in an empty column, a highlight colouring text before it arrived, an index wrapping to a second line. Say so if no browser can be run, but do not skip the pass because the in-app browser is unavailable.

If a flaw is found, fix it and repeat the relevant checks. Finish only when the page is mathematically precise, narratively ordered, visually centred, mechanically stable, accessible and indistinguishable in quality from the strongest completed pages.

In the handoff, lead with the completed outcome, name the files changed, summarise the teaching and interaction decisions, list validation performed and disclose any visual test that could not be run.
