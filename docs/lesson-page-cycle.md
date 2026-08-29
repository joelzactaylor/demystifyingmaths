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
- **Check the scope boundary** against the manifest `coverNote`: nothing a later
  page owns, and nothing the previous page was supposed to have taught.

## 2b. Voice pass — does every sentence do mathematical work?

`lesson-prose-voice.md` holds twenty-four rules taken from the written-methods
pages by reading them, not by impression. Judge each sentence against it. The
faults cluster in the introduction, the hinge between sections, and any sentence
beside a widget — so read those hardest, and do not copy an opener from a
reference page without testing it first.

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

## 4. Figure pass — does it move, and does it say something new?

Drive every scene through every stage and print every caption. Look for:

- **stages that draw nothing the stage before drew** — the reader scrolls and
  only the words change, which is a paragraph pretending to be an animation.
  Pull the text into the body and delete the stage.
- **captions repeating a heading or a paragraph** the reader has just passed.
  Seven consecutive words in common is quotation; five is shared vocabulary.
- **captions that do not match the drawing** at that moment.
- **prose that could be shown**: anything with a shape, a growth, a movement or
  a rearrangement.

## 5. Fallback pass — what survives being stripped?

Flatten the page: no stylesheet, no script, no ARIA. Then check

- every power still reads as a power (`2^5`, never `25`);
- no two parts run together (`÷ 216`, `Ignoring the remainderA leftover`) — in
  the markup **and in what the figures build at run time**;
- every scene leaves its conclusion behind;
- every heading level is one below its parent.

## 6. Interaction pass — every state, not the happy one

Exact answers, both ends of the range, one past both ends, empty, letters,
mixed, a leading zero. A refused input must hide the working rather than leave
the last good answer standing, and must not rebuild the card under the cursor.

## 7. Repository pass

Markup well-formedness with a **raw tag scanner, not a DOM parser** — jsdom
silently repairs a stray `</section>` and every DOM-based check will pass over
it. Then links, practice pairing, breadcrumbs, dead CSS, `git diff --check`.

## Writing the checks

Every pass above is a script, re-run after every change, because a check that is
not automated is a check that stops happening.

**Where they live is unresolved.** This repository has no `package.json` and no
`node_modules`: every script in `scripts/` runs on Node's built-ins alone, and
that looks deliberate for a static site with no build step. Most of these checks
parse the rendered DOM and need jsdom, so making them permanent means taking on
a dependency the repository has so far done without. Until that is decided they
are written per session and thrown away, which is why the same faults have to be
found twice. The dependency-free ones — the raw markup scanner, the dead-CSS
scan, the viewport check — could move into `scripts/` today.

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
