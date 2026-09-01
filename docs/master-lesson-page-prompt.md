# Master prompt: build the next Demystifying Maths lesson

Use this prompt from the repository root. Replace `<TARGET>` only when a specific page is required; otherwise select the next unwritten teaching page after the most recently completed page.

Quick invocation for a new Codex turn:

> "Read and execute `docs/master-lesson-page-prompt.md` for the next unwritten teaching page. Treat the prompt as the complete brief and continue until every review and validation gate passes."

To name the page explicitly:

> Read and execute `docs/master-lesson-page-prompt.md` with `<TARGET>` set to `pages/path/to/page.html`.

---

Create `<TARGET>` from the ground up as a finished Demystifying Maths teaching page. Work autonomously, but keep all implementation changes limited to the target HTML page, its dedicated CSS and JavaScript assets, and the target page's `written` status in the relevant manifest. Preserve every unrelated local change in the dirty worktree. Do not edit the practice page or neighbouring lessons unless I explicitly approve a separate consistency fix.

## Establish the brief before writing

1. Read the target stub, its manifest `coverNote`, its linked practice specification and its position in the curriculum sequence.
2. Read the immediately preceding completed lessons and their dedicated assets to learn the site's current visual and interaction language. Treat those pages as patterns, not text to copy.
3. Identify exactly what the preceding pages have already taught, what this page must teach, and what later pages own. Do not introduce a later technique merely because it is related.
4. Write down an internal scope boundary and test every proposed section against it. If the specification says one-digit or two-digit operands, integer divisors, a particular tier, or a particular answer form, enforce that in examples and interactive inputs.
5. Check every calculation independently before using it.

## Build a coherent teaching narrative

- Start with a specific, meaningful heading—not “Introduction”—and a concise prerequisite strip linking to the actual prerequisite lessons.
- Teach in dependency order. A sentence must not rely on an idea, notation, appended digit, conversion, exception or choice that is only explained later on the page.
- Introduce the underlying mathematical meaning before compressing it into a routine.
- Use natural mathematical language. Never write nonsense such as “four fits into nine hundreds”; name the actual quantity and operation.
- Explain quotient placement through place value, not position alone. State why a quotient digit is written above a particular dividend digit and what value it represents in the completed quotient.
- Separate genuinely different routes before combining them. For example, stopping with a remainder and continuing into decimals are distinct choices; explain the decision before demonstrating either route.
- When both remainder and decimal forms are in scope, show a complete example of each—ideally using the same division so the different stopping decisions are unmistakable. Any division sandbox must offer an explicit remainder/decimal switch that changes the calculation's stopping rule and explanation, not merely its label.
- Make every sandbox caption agree with the selected result form. A completed decimal route should say that the division is exact, not announce a “final remainder”; an exact remainder-mode result should say that nothing is left to write. Audit shared captions for other route-specific contradictions.
- Make the nouns and units do real teaching work in contextual examples. Do not use fractional people, cars, boxes or other indivisible objects.
- Include only examples that earn their place: reveal a structural issue, misconception, zero, decimal boundary, contextual decision or check.
- Whenever a rule explicitly mentions ignoring, retaining or removing trailing zeroes, include one short numerical example that makes that decision concrete instead of leaving it as prose.
- **Mark the glossary terms by hand, as part of writing the page.** `js/glossary.js` carries the terms the course teaches and the card that shows them; the marks themselves are `<span class="gloss" data-term="quotient">quotient</span>` written into the prose. Marking used to be done by a scanner at load time, and it could not be taught the difference between "the difference of two squares" and "the difference is in what the columns are for", or between an algebraic identity and "the digits keep their identity". Read the page and decide. `node scripts/glossary-mark.mjs --write <page>` will propose a first set of marks; treat what it proposes as a draft to edit, not an answer. Mark a term **once per page**, at the first place a reader who did not know it would be stopped by it — in running prose only, never in a heading, a link, a bold label, a control, or notation, and never on the page whose own heading names that term, because that page is the definition. Be generous: a reader who has forgotten what a divisor is has forgotten it on every page, not only the one that teaches it. To add a term, add it to `js/glossary.js`; a word whose everyday sense is the one these pages use — mean, range, carry, solve — is refused by `scripts/glossary-check.mjs` on purpose.
- **Never write a false statement because the true one is out of scope.** A page may leave a topic out; it may not say something that is wrong. "x² = −9 has no solution" is false — −9 has two square roots — and a reader who meets them later has been taught something they must unlearn, which is worse than never having been told. Scope the claim instead of breaking it: "no number on the number line squares to −9" is true, needs no vocabulary the page has not got, and stays true for the rest of the reader's life. The same move fixes "you cannot subtract a larger number from a smaller one", "a fraction cannot have a denominator of zero because it would be very large", and every other convenience that a later page has to undo. Where the honest version leaves a question open, name where it is answered and link it — `pages/extracurricular/` exists for exactly this, and a one-clause pointer costs nothing.
- **Only real mistakes belong in `.slips`.** Every entry names an error a pupil actually makes — a rule misapplied, two procedures confused, a pattern over-generalised, a place-holder dropped — and states the specific wrong answer it produces. Test each one by asking who makes it and why. If the answer is "nobody would ever write that", it is a straw man: it teaches nothing, it pads the list, and it makes the real entries beside it look invented too. `&radic;36 = 1,296` fails the test, because no reader asked for a square root multiplies 36 by itself. A fact the page has already taught is not a mistake, and neither is advice to take care or to check the question: "Ignoring the requested direction — check whether the question asks for ascending or descending" names no wrong answer, where "Writing 5, 2, 0, &minus;1, &minus;6 answers the descending question instead" does. Do not tell the same mistake twice with different numbers. There is no quota: list the mistakes the page's material actually produces and stop. Two real slips beat four with two invented, and a straw man does more damage than an empty slot, because it tells the reader you think they might believe it.
- When a written method can produce an internal zero in the answer, visibly model one deliberate example. Align the zero in its correct column and explain that it holds the place when the current amount is smaller than the divisor; a warning in “common mistakes” is not enough.
- Use descriptive section headings, worked examples, an inverse check, common mistakes and a five-point summary when those elements suit the topic.
- End with the established practice and next-lesson cards, with exact links and titles from the curriculum sequence.
- Remove the author note, stub text, TODOs, “coming soon”, AI-facing commentary and unnecessary descriptions of page functionality.
- Never write copy that explains the page's own controls, and never narrate how a figure was drawn. State the mathematics a figure shows and stop; sentences like “there is nowhere left to put it, so it has to be drawn as a grid inside a grid” describe a rendering decision, not the subject, and no reader wants them. No “drag to rotate, hold shift for…”, no key lists, no notes about what a slider does. If an interaction needs a sentence of instruction, the interaction is wrong: derive the extra freedom from the gesture already in use, or drop the feature. A hint that assistive technology genuinely needs goes in a visually hidden span, never on the page. Mathematical prose about what a figure *shows* is a different thing and still belongs there. No “drag to rotate, hold shift for…”, no key lists, no notes about what a slider does. If an interaction needs a sentence of instruction, the interaction is wrong: derive the extra freedom from the gesture already in use, or drop the feature. A hint that assistive technology genuinely needs goes in a visually hidden span, never on the page. Mathematical prose about what a figure *shows* is a different thing and still belongs there.

## Make animations teach rather than decorate

- Use the site's scroll-led, pinned-card pattern. Do not add Next, Back, Build or Play controls.
- The drawing area must begin blank. Draw the setup and each mathematical step as the reader scrolls.
- Give every step a generous stationary reading interval. Movement happens between stops; a highlight must not glide continuously through the entire calculation.
- Ease scroll-driven opacity, position, line and highlight changes. Avoid abrupt class swaps that make writing or emphasis snap between frames; preserve a stationary interval after each eased reveal.
- In written algorithms, use one continuous gold frame around the complete current amount, not separate boxes around its digits. Interpolate that frame's position and size between real step boundaries.
- **The gold frame is drawn behind the marks it lights, and the stylesheet has to say so.** This is the trap: an absolutely positioned element painted after its siblings sits in front of them by default, so a frame appended last covers the very digits it was meant to pick out — and it looks deliberate enough that it survives a read-through. Give the frame `z-index: 0` and every mark it can reach `position: relative; z-index: 1`, which is what `longDivision`, `longMultiplication` and `indexNotation` already do. Two consequences follow. A frame that is a sibling of an opaque panel cannot just be lowered beneath it — it would go behind that panel's own background and vanish — so it moves *inside* the panel, above the background and below the contents; drop the panel's `overflow: hidden` if the frame's padding needs to sit proud of the edge, and measure the frame against the panel it now lives in. And anything that has to cross the frame — a travelling numeral, a subtraction rule, a brought-down digit — needs a layer above both. Fills are chosen to read through: a tinted mark over gold shows the gold, a solid one hides it.
- Give written calculations generous, even vertical rhythm. Every adjacent numeral row—including the dividend and first product—must have the same centre-to-centre spacing whether or not a subtraction rule lies between them. If the dividend row must remain taller to clear its bracket and highlight, offset the working stack by half the row-height difference rather than leaving an oversized first gap. Overlay subtraction rules within the shared gaps instead of letting them alter the spacing. Keep numerals clearly separated from division brackets, fraction bars and subtraction rules; centre the gold frame around the numerals themselves instead of sizing it from the full row, so it never touches or crosses a neighbouring rule.
- Reuse the established measured-cursor model from the neighbouring written-method pages: measure digit centres from the completed layout, cache the targets, use the same rounded gold treatment, hold the frame at each step, then ease its movement late in the transition. Do not derive its shape from entire grid-row rectangles.
- Drive linked reference highlights from continuous scroll progress rather than abrupt stage-only class toggles. Keep the selected source highlighted while its value is chosen and copied, ease it away afterward, and aggregate repeated matches so an inactive step cannot overwrite the current highlight.
- Make copied mathematics visibly come from its source: a brought-down digit travels from the dividend into the next working row; in long division, the chosen multiplier glides from the selected multiples-list row into the quotient and its product glides into the subtraction row. Keep the originals visible so the movement reads as copying.
- Draw the subtraction rule smoothly after the product arrives, then reveal the remainder. Do not make a completed subtraction block appear at once.
- Reveal a written subtraction result from above: its digits descend out of the operands and through the subtraction rule into the answer row. Never make them rise into place from below.
- The caption, highlighted region and newly drawn marks must describe exactly the same step.
- Avoid duplicate narration across the animation heading, active caption, static answer and no-JavaScript fallback. Seed dynamic captions without repeating their JavaScript stage text, and ensure only one fallback result is visible when JavaScript is unavailable.
- Build different visuals for genuinely different scenarios. Do not reuse one generic picture while merely changing the caption.
- Centre every diagram using a full-size outer layer whose sole job is centring a naturally sized inner composition. Do not combine fixed widths with an absolutely positioned full-size layer.
- Keep the animation card's dimensions stable from its first frame to its last. Do not add completion ticks.
- Size gold highlights around all relevant marks, including carried or exchanged numerals, with balanced visual margins.
- Align digits and decimal points on a shared grid. Place carried figures close enough to show their destination but never overlapping the main digits.
- When labels would collide, switch them to a vertical treatment rather than allowing overlap.
- Respect `prefers-reduced-motion`: show a complete, understandable static state and remove surplus scroll distance.
- If a calculation is deliberately truncated while a remainder is still non-zero, make that unfinished status explicit at the final arithmetic step as well as in the conclusion. Draw an ellipsis in the answer and say that the displayed digits are only the beginning; do not hide the explanation in one additional scroll stage.
- Treat any display limit as an interface choice, not a mathematical milestone. Explain continuation through the non-zero remainder and ellipsis without suggesting that the chosen number of displayed decimal places is special.

## Make live examples robust

- Live-update on every valid input; never require a build button.
- Update existing nodes in place. Do not reparent or rebuild a focused input's containing card.
- Preserve focus, caret and scroll position while sanitising input.
- Reserve stable space for answers, messages and diagrams so edits do not make the page jump.
- Constrain inputs to the exact syllabus scope and present a clear invalid state without leaving stale answers visible.
- Test exact results, remainders, zeroes, a leading value smaller than the divisor, minimum and maximum inputs, empty input and invalid characters.
- On division pages, make the starting-position decision prominent: compare successive leading blocks and begin with the shortest one at least as large as the divisor. Do not leave this as a passing sentence or let the animation silently skip to the chosen block.
- For division sandboxes, include a known non-terminating test such as `1456 ÷ 76`. Verify that the last subtraction, drawn quotient and final caption all say or show that the decimal continues.

## Never declare a viewport

The site has **no `<meta name="viewport">` on any page**, and a new page must not add one. This is what gives every page its fixed-aspect layout: `.layout` in `css/shared.css` is a hard 900px, and a phone with no viewport declaration falls back to a 980px virtual viewport and scales the whole page down uniformly to fit the screen. The layout is therefore identical everywhere, only smaller.

Adding `width=device-width` opts the page out of that scaling. The 900px layout is then laid out inside a 390px viewport, the text renders at full size against a screen less than half as wide, and the page appears enormous and clipped. The only exception on the site is `vocab/index.html`, a standalone unlisted tool with its own responsive stylesheet.

The same reasoning rules out anything else that would break the uniform scale: no viewport-relative font sizes that would compound with the browser's own scaling, and no `@media (max-width: …)` rule intended to reflow the page for phones. Phone breakpoints below `900px` never fire on a phone, because the viewport is reported as 980px wide. Write one layout at 900px and let the browser shrink it.

## Match the written-methods house style exactly

The written-methods lessons (`pages/curriculum/GCSE/number/structure/writtenMethods/`) and their dedicated stylesheets are the reference implementation of the teaching-page style. A new lesson must be indistinguishable from them. Read at least `columnAddition.html`, `longDivision.html` and their CSS before writing a line, and reuse the values below rather than inventing near-misses. Never import a colour, radius or control style from a practice page: the ochre practice identity and the blue teaching identity are deliberately different, and mixing them is the most visible way a new page looks wrong.

**The palette.** Use these and no other near-equivalents:

| Role | Value |
| --- | --- |
| Lesson blue — section headings, emphasis, quotient and answer figures | `#09539d` |
| Dark ink — numerals, set-out digits, figure text | `#173849` |
| Body copy inside cards | `#41535c`; caption body `#243a45` |
| Small labels, kickers, uppercase captions | `#52666f` |
| Teal — numbered markers, the current progress dot, input focus | `#116e93` |
| Ochre emphasis — operators, signs, the second colour in a figure | `#b86821` |
| Deep ochre text | `#9b5f12`, `#80540f`, `#7a540a` |
| Gold — highlight frame border, important-box border, carry badges | `#d99a20` |
| Gold fills — highlight frame `#fff2c9`; important box and badges `#fff8df` |
| Raised card border | `#c9dce8`; flat panel border `#d9e4eb` or `#d9e2ec` |
| Pale blue fills | `#eef5fb`, `#eaf3f8`, `#f1f7fb` |
| Mid blues for strokes and rules | `#5d91b0`, `#6c9bb0`, `#526b76` |
| Control borders and inactive dots | `#b8cbd7`, `#c6d4dc` |
| Scene card gradient | `linear-gradient(180deg, #fbfdff 0%, #f2f8fc 100%)` |
| Warning red — only in `.slips` and only as a border | `#a3352b` |

**Type.** Every numeral, set-out, expression and input uses `ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace` with `font-variant-numeric: tabular-nums`. Prose stays in the inherited Aleo. Notation inside a sentence goes in `<span class="sf">`, which already styles `sup` for powers.

**Notation HTML cannot draw — never shy away from `<math>`, except for the radical.** Where the mathematics needs a shape no HTML element makes — a fraction bar, a raised index, a stacked coefficient — write MathML and let the browser render it:

```html
<math><mfrac><mn>3</mn><mn>10</mn></mfrac><mo>=</mo><mn>0.3</mn></math>
```

Getting the mathematics to render correctly outranks keeping the markup uniform, and a fraction or a superscript is laid out from ordinary box metrics, so it renders properly everywhere.

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

**The scroll-led card.** Copy the structure, not an approximation of it: a `.<topic>-scene` wrapper (`position: relative; overflow-anchor: none;`) that takes `height: var(--scene-height); min-height: var(--scene-min-height)` once `is-ready`, holding a `.<topic>-scene__sticky` card that is `position: absolute` until JavaScript pins it. The card is `2px solid #c9dce8`, `border-radius: 22px`, the gradient above, `box-shadow: 0 12px 30px rgba(20, 57, 78, .14)`, `contain: layout paint`, `overflow: hidden`, and a `grid-template-rows` with exactly one `minmax(0, 1fr)` row for the drawing. Give every scene kind the same number of grid children in both its worked and sandbox forms — wrap sandbox controls in one header block rather than adding a row.

**Card furniture.** Reuse these verbatim, changing only the block name:

- Caption: `display: grid; align-content: center; height: 6.6em; padding: 14px 28px 6px; text-align: center;` with `h3` at `#09539d`/`1.1rem` and `p` at `#243a45`/`.97rem`/`line-height: 1.5`. Fixing the height is what stops the card resizing between steps.
- Progress: `display: flex; gap: 8px; padding: 0 22px 18px; justify-content: center;` with 9px round dots at `#c6d4dc`; the current dot becomes `width: 28px; border-radius: 999px; background: #116e93`, and past dots `#6c9bb0`. Use the class names `is-current` and `is-past`.
- Highlight frame: `2px solid #d99a20`, `border-radius: 13px`, `background: #fff2c9`, positioned absolutely and interpolated between measured targets.
- Inputs: `width` to suit, `padding: 10px 14px`, `2px solid #b8cbd7`, `border-radius: 12px`, `outline: none`, `background: #fff`, `color: #173849`, `font: 700 1.18rem/1.2` in the monospace stack, `tabular-nums`, `text-align: center`, and `transition: border-color .18s ease, box-shadow .18s ease`. Focus is `border-color: #116e93; box-shadow: 0 0 0 4px rgba(17, 110, 147, .12)` — never a practice-page outline ring.
- Invalid entry: the house treatment is quiet, not alarming. Grey the affected text to `#687b84` and either hide the stale working with `visibility: hidden` so the card keeps its size, or show a `2px dashed #b8cbd7` panel on `rgba(255, 255, 255, .86)` saying what is needed. Never use a red practice-page warning.
- Reduced motion: end the stylesheet with a `@media (prefers-reduced-motion: reduce)` block that returns `.<topic>-scene.is-ready` to `height: auto; min-height: 0`, makes the card `position: relative; height: auto; transform: none !important`, and removes every transition.

**Structural styles come from `lesson.css`.** Use `.prereq`, `.rule-card`, `.important-box`, `.wex`, `.worked`, `.slips` and `.recap` for the prerequisite strip, definitions, noticed facts, worked examples, animated examples, misconceptions and the summary. Only build a bespoke component when none of those can carry the idea, and when you do, give it the palette, the `14px`–`18px` radii and the `0 8px 22px rgba(23, 56, 73, .11)` shadow the neighbouring pages use.

**Those components lay themselves out with flex and grid, so each assumes a particular set of element children.** Give them exactly the children they expect, or the layout algorithm will treat every stray inline element as a column of its own:

- `.prereq` is a flex row of exactly two items: `<p class="prereq"><b>Before this page:</b> <span>…</span></p>`. The whole sentence, including its links, goes inside the single `<span>`. Text or a link left loose beside the `<b>` becomes a separate flex item and the sentence breaks into columns.
- `.slips > li` needs a direct `<b>` for the name of the slip and a direct `<span>` for the correction; the CSS targets them with child combinators so notation inside stays inline.
- `.wex__steps > li` needs a `.wex__do` and a `.wex__why` — the grid has a column for each.
- `.important-box` carries an `.important-box__title` with an `id`, and the box is `aria-labelledby` that same `id`.
- Anything you build yourself follows the same discipline: if a container is flex or grid, wrap its prose so that the container has children, not loose runs of text.

None of this is visible without a browser, so assert it — a small structural check over the finished page costs less than a rendering pass you cannot run.

**Write the stylesheet the way the others are written.** One file per page at `css/<pageName>.css`, opening with a comment that says what the page needs beyond the shared styles and why, and carrying no viewport media queries except the reduced-motion block — `.layout` is a fixed 900px panel that `shared.css` scales with a transform below 900px, so nothing in a page stylesheet may reflow.

## Audit, reorder and animate before you call it finished

A first draft is a draft. After the page runs, read it once more as a whole and rebuild it around what actually explains the idea best:

- Put capability before vocabulary. A reader should be able to *do* the thing before being taught the names for its special cases, unless a name is needed to read the next sentence.
- Move every misconception to the point where the reader has just seen the evidence that settles it, not to a list at the end. The end-of-page `.slips` list is a reminder of misconceptions already met, not their first appearance.
- Cut any section that does not change what the reader can do. If two sections teach the same decision, merge them.
- Then ask what is still being asserted in prose that could be shown. Every idea on the page that has a shape, a growth, a movement or a rearrangement deserves its own scroll-led scene, and a page with one animation is usually a page that stopped too early. Build a separate scene for each genuinely different picture rather than restyling one scene's caption.
- Animate the reverse direction as well as the forward one wherever a topic is read both ways.
- Re-run every check after reordering: heading order, deep-link IDs, practice pairing and the scene harnesses all depend on the structure you have just changed.

## Accessibility and presentation

- Include page-specific title, description and Open Graph metadata. No viewport meta tag: see "Never declare a viewport" above.
- Maintain a valid heading hierarchy with no skipped levels.
- Give every major teaching section a stable, descriptive heading ID when a paired practice page may deep-link to it. Put the ID on the heading itself so the site's heading scroll margin lands the reader at the top of the section rather than inside a sticky or scroll-animated scene.
- Use real labels for every input, unique IDs, valid ARIA references and concise live regions.
- Hide purely visual constructions from assistive technology, but provide the complete mathematical meaning in nearby text, captions or an image label.
- Never rely on colour alone. Use position, borders, text and shape as well.
- Keep all diagrams within the 900px design canvas and visually balanced at the site's scaled narrow view.

## Practice and onward navigation

- Resolve the lesson's closing cards from the subgroup index, not from a vaguely related topic. Link to the current lesson's practice page only when that practice is dedicated to this exact lesson. If the lesson has no dedicated practice page, leave the practice slot empty; never substitute a mixed review or skip to a later drill.
- Link the next-lesson card only to the teaching page immediately after the current lesson in the subgroup's teaching-page order. If there is no next teaching page, leave that slot empty.
- Build valid cards with the shared `topic-section`, `topic-grid` and `topic-card` pattern. When both destinations exist, retain the established lesson-page order: the ochre `topic-card--practice` card first, then the blue `topic-card--next` card. When only one exists, show it alone without an empty visual placeholder.
- Match the section heading to the available actions: “Practice and continue” for both cards, “Practice” for a practice card alone, and “Continue” for a next-lesson card alone.
- Match the established blue teaching-page system, ochre emphasis, typography, card radius, shadows and spacing. Improve weak details without making this page feel like a different site.

## Adversarial review before stopping

Complete at least two review passes after the first implementation:

1. **Teacher pass:** challenge every phrase, calculation, unit, prerequisite and narrative transition. Look specifically for mixed routes, premature concepts and technically correct but unnatural explanations.
2. **Pupil and visual pass:** imagine the drawing at every scroll stop and every input state. Look for static opening frames, off-centre compositions, overlapping labels, ambiguous pictures, layout jumps, focus loss, clipped marks and changing card dimensions.
3. **Accessibility pass:** verify headings, labels, keyboard behaviour, live updates, reduced motion, non-colour cues and no-JavaScript fallbacks.
4. **Repository pass:** run JavaScript syntax checks, `git diff --check`, the local link checker, practice-pairing checker, `scripts/panel-check.mjs`, `scripts/notation-check.mjs`, `scripts/glossary-check.mjs`, DOM/ID/ARIA checks, arithmetic assertions and CSS structural checks. Use the in-app browser for rendered testing when available; if it is unavailable, say so rather than silently substituting another browser surface.

If a flaw is found, fix it and repeat the relevant checks. Finish only when the page is mathematically precise, narratively ordered, visually centred, mechanically stable, accessible and indistinguishable in quality from the strongest completed pages.

In the handoff, lead with the completed outcome, name the files changed, summarise the teaching and interaction decisions, list validation performed and disclose any visual test that could not be run.
