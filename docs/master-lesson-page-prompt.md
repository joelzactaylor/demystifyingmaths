# Master prompt: build the next Demystifying Maths lesson

Use this prompt from the repository root. Replace `<TARGET>` only when a specific page is required; otherwise select the next unwritten teaching page after the most recently completed page.

Quick invocation for a new Codex turn:

> Read and execute `docs/master-lesson-page-prompt.md` for the next unwritten teaching page. Treat the prompt as the complete brief and continue until every review and validation gate passes.

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
- When a written method can produce an internal zero in the answer, visibly model one deliberate example. Align the zero in its correct column and explain that it holds the place when the current amount is smaller than the divisor; a warning in “common mistakes” is not enough.
- Use descriptive section headings, worked examples, an inverse check, common mistakes and a five-point summary when those elements suit the topic.
- End with the established practice and next-lesson cards, with exact links and titles from the curriculum sequence.
- Remove the author note, stub text, TODOs, “coming soon”, AI-facing commentary and unnecessary descriptions of page functionality.

## Make animations teach rather than decorate

- Use the site's scroll-led, pinned-card pattern. Do not add Next, Back, Build or Play controls.
- The drawing area must begin blank. Draw the setup and each mathematical step as the reader scrolls.
- Give every step a generous stationary reading interval. Movement happens between stops; a highlight must not glide continuously through the entire calculation.
- Ease scroll-driven opacity, position, line and highlight changes. Avoid abrupt class swaps that make writing or emphasis snap between frames; preserve a stationary interval after each eased reveal.
- In written algorithms, use one continuous gold frame around the complete current amount, not separate boxes around its digits. Interpolate that frame's position and size between real step boundaries.
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

## Accessibility and presentation

- Include the viewport meta tag and page-specific title, description and Open Graph metadata.
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
4. **Repository pass:** run JavaScript syntax checks, `git diff --check`, the local link checker, practice-pairing checker, DOM/ID/ARIA checks, arithmetic assertions and CSS structural checks. Use the in-app browser for rendered testing when available; if it is unavailable, say so rather than silently substituting another browser surface.

If a flaw is found, fix it and repeat the relevant checks. Finish only when the page is mathematically precise, narratively ordered, visually centred, mechanically stable, accessible and indistinguishable in quality from the strongest completed pages.

In the handoff, lead with the completed outcome, name the files changed, summarise the teaching and interaction decisions, list validation performed and disclose any visual test that could not be run.
