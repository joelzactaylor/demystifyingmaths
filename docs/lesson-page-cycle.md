# The cycle: auditing a lesson page that already works

`master-lesson-page-prompt.md` says how to build a page from nothing. This says
what to do to a page that already runs, and it is the loop to repeat until a
pass finds nothing.

A first draft is a draft, and so is a second. Each pass below looks for one kind
of fault, in an order chosen so that later passes are not wasted on prose that
is about to be deleted. **Findings are fixed in the pass that finds them**, not
collected into a list and declared as output: an audit that reports without
fixing has done half a job.

## 1. Measure before reading

Count what each section carries — scenes, tables, static answers, words of prose
— and put the counts side by side. Structural faults are invisible while reading
and obvious in a table:

| | scenes | tables | prose |
|---|---|---|---|
| The cube numbers | 0 | 1 | 54w |
| The powers of 2, 3, 4 and 5 | 0 | 1 | 68w |

Two consecutive table-only sections between two with figures is a fault the
prose will never confess to. Look for: a section with no way in, a section
carrying every figure, a run of pure reference, prose totals that swing by 3×.

## 2. Teacher pass — is it true?

- **Recompute every number on the page**, in a script, from the claim rather
  than from the page. Do not read them back and agree with them.
- **Test every sentence that quantifies.** "12 is not a power of any whole
  number" is false — 12 is 12 to the power of 1. Sentences with *every*, *any*,
  *never* and *only* are where the errors are.
- **Find the scope each claim is silently assuming.** The commonest falsehood on
  a teaching page is a sentence that is true of the numbers the course has met
  and false of the ones it has not: "x² = −9 has no solution", "you cannot take
  a larger number from a smaller one", "a square root is smaller than its
  number". Being out of syllabus is never a licence to be wrong. Say what is
  true of the numbers in play — "no number on the number line squares to −9" —
  and link where the rest is answered.
- **Check the scope boundary** against the manifest `coverNote`: nothing a later
  page owns, and nothing the previous page was supposed to have taught.
- **A threshold names what it limits.** "For numbers up to about 100, listing
  every factor finds the HCF" is true and reads as a property of numbers: it is
  the *lists* that get long, and the sentence has to say so. Wherever a number
  bounds a method — up to 100, beyond four digits, two-digit divisors — ask
  what the bound is really a limit on, and write that.
- **Each step arrives with its reason.** Read the scene captions in order and
  ask whether a pupil could have predicted the next one. "Take 3 to its lower
  index" landing straight after the 2s, with no sentence on why a common factor
  can carry no more 3s than either number has, is a step that arrived without
  its reason; split it, or put the reason in the caption before it.
- **A slip is a reminder, not a first appearance.** Every entry in `.slips`
  names a mistake the page has already shown the evidence against. "Taking the
  higher index gives 216, which does not divide 756" belongs in the list only
  because the lower-index section already said why 2² is the most a common
  factor can hold. A slip with no earlier evidence is a paragraph in the wrong
  place: move the evidence up.

## 2b. Voice pass — does every sentence do mathematical work?

`lesson-prose-voice.md` holds twenty-four rules taken from the written-methods
pages by reading them, not by impression. Judge each sentence against it. The
faults cluster in the introduction, the hinge between sections, and any sentence
beside a widget — so read those hardest, and do not copy an opener from a
reference page without testing it first. `node scripts/voice-check.mjs <page>`
lists the sentences a script can suspect — banned phrases, questions, second
person, length — as lines to read, not verdicts; the pass is reading them.

## 3. Contrivance pass — is it honest?

The hardest pass, because everything here was put there on purpose. For each
figure, table and example, ask what decided it:

- Does it stop where the mathematics stops, or where the drawing got awkward?
  A square scene ending at side 7 while the table runs to 15 is a rendering
  decision wearing a mathematical hat.
- Is a parallel between two sections real, or tidy? Cubes growing by shells of
  7, 19, 37 and 61 mirrors the squares growing by odd numbers beautifully, and
  teaches nothing: nobody recalls cubes that way.
- Would a reader with the real problem in front of them be able to use this?
  A sandbox that asks which base to test against is useless to someone holding a
  number and no base.
- Are the offered values chosen so the demonstration works? Seven tiles, five of
  them powers, is a rigged deck.
- Is every named misconception one somebody actually has? Ask who makes it and
  why. A wrong idea nobody would ever write — squaring a number when asked for
  its root — is a straw man, and it makes the real slips beside it look invented.
  So does the same mistake told twice with different numbers, and so does advice
  to check the question dressed up as an error.

## 4. Figure pass — does it move, and does it say something new?

Drive every scene through every stage — in a harness for the arithmetic, and
**rendered** for everything else: headless Chrome under reduced motion gives
every static state in one capture, and a throwaway preview copy that paints a
stage from the query string gives one capture per stage (the recipe is in
`docs/local-development.md`). On the HCF page the rendered pass found more
faults than every script together: a drop line crossing a cell, a sign floating
in an empty column, text coloured before its highlight arrived, an index
wrapping to a second line. Print every caption, and look for:

- **stages that draw nothing the stage before drew** — the reader scrolls and
  only the words change, which is a paragraph pretending to be an animation.
  Pull the text into the body and delete the stage.
- **a whole scene whose every stage is a line of text appearing.** The per-stage
  check will pass — each stage does draw something the last one did not — and
  the scene is still a list in a box. Describe what the drawing *does* between
  two stages without naming any text; if nothing survives that description,
  delete the scene and set the lines out as a worked example.
- **captions repeating a heading or a paragraph** the reader has just passed.
  Seven consecutive words in common is quotation; five is shared vocabulary.
- **captions that do not match the drawing** at that moment.
- **a highlight covering what it highlights.** The gold frame is painted after
  the marks it lights and will sit in front of them unless the stylesheet puts
  it behind. Drive a scene to a stage where the frame is up and check the digits
  underneath are still legible, not a gold rectangle where they used to be.
- **prose that could be shown**: anything with a shape, a growth, a movement or
  a rearrangement.

## 5. Fallback pass — what survives being stripped?

Flatten the page: no stylesheet, no script, no ARIA. Then check

- every power still reads as a power (`2^5`, never `25`), and every root still
  reads as a root (`√49 = 7`, never the false `49 = 7` a stripped radical leaves
  behind) — and reads it *once*, not followed by its own bare digits;
- no two parts run together (`÷ 216`, `Ignoring the remainderA leftover`) — in
  the markup **and in what the figures build at run time**;
- every scene leaves its conclusion behind;
- every heading level is one below its parent.

## 6. Interaction pass — every state, not the happy one

Exact answers, both ends of the range, one past both ends, empty, letters,
mixed, a leading zero. A refused input must hide the working rather than leave
the last good answer standing, and must not rebuild the card under the cursor.

## 7. Repository pass

`node scripts/structure-check.mjs` — a **raw tag scanner, not a DOM parser**
(jsdom silently repairs a stray `</section>` and every DOM-based check then
passes over it), heading levels, duplicate ids, ARIA targets, and inline text
that runs together with styles off. Then the rest of the list in `AGENTS.md`:
links, practice pairing, breadcrumbs, panel, notation, glossary, voice, and
`git diff --check`. Dead CSS is a per-session grep, because page scripts compose
class names at run time and a text search cannot tell an unused class from a
composed one.

## Writing the checks

Every pass above is a script, re-run after every change, because a check that is
not automated is a check that stops happening.

**Where they live.** The repository has no `package.json` and no `node_modules`,
and stays that way: every check runs on Node's built-ins. The ones that read
source live in `scripts/` — `structure-check.mjs` for markup, `notation-check.mjs`
for roots and indices, `voice-check.mjs` for the sentences a script can suspect.
The ones that read *this page's* mathematics are written per page, in the
scratchpad, and thrown away: a teacher script that recomputes every number from
the claim, and a harness that loads the page's own JS under a forty-line DOM
shim (`createElementNS`, `append`, `setAttribute`, `dataset`, `style`, `classList`
and nothing else) and drives each scene and sandbox through every state. The
shim is cheaper to write than a dependency is to carry, and it runs the real
code rather than a copy of it.

Two rules learned the hard way:

- **Assert against the arithmetic, not against the page.** Compute the expected
  answer in the harness and compare. A harness that reads the page and agrees
  with itself finds nothing.
- **Distrust the harness before the page.** A face count that says the cubes are
  painted out of order, when near and far cubes on the viewing diagonal project
  to the same point, is a broken test. So is a still-stage check that fingerprints
  inline `style` and cannot see an SVG animating through presentation attributes.
  When a check fires, prove it can also fail on purpose.

## Done

Every check green, every finding from every pass fixed, and one full pass that
finds nothing. Not "no known problems" — a pass that looked and came back empty.
