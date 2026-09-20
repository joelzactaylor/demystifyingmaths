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

## 1b. Shape pass — is it built the way a reader learns?

The measure above finds what is missing; this pass finds what is in the wrong
place or said too often. The standard is the one the best-known resources
converge on — Rosenshine's principles (small steps, a worked example before
independent work, checking understanding), the cognitive-load research behind
Mayer's multimedia principles (coherence, signalling, no redundancy between
words and picture), the NCETM/White Rose "small steps" sequencing with one
thing varied at a time, and the exam boards' own command words. A page that
meets it reads, to a parent with no maths, as one idea after another. Judge
each section against these, and fix in place:

- **The rule arrives by the second paragraph of its section.** A section may
  open with the question the rule answers ("Does 3 + 4 × 5 come to 23 or to
  35?") and one paragraph of the disagreement, and then it states the rule.
  Motivation that runs to a fourth paragraph before the rule is a sequencing
  fault: `orderOfOperations` reached "multiplying and dividing are done first"
  in paragraph five, across two sections, and was cut to one.
- **One idea per section, and a section is 60–350 words of prose.** Under 60
  words is a fragment — fold it into its neighbour (`dividingByDecimals` had a
  29-word "confirm the quotient" section and a 62-word sandbox section between
  the size rule and its check). Over 350 is two ideas — split it at the
  heading the prose already implies (`multiplesAndDivisibility` had 2,100
  words under one heading with four `h2`s inside; they became sections).
- **A fact is delivered once in the body and once in the summary.** Every
  further statement of it is cut, wherever it stands — an important box, a
  scene caption, a slip, a paragraph before a figure that the figure's first
  caption repeats. `powersOfTen` stated the digit-movement rule five times;
  `orderingNumbers` said "more digits does not mean larger" four times. Two
  statements with the same content in different words are not variation.
- **A worked example varies one thing from the one before it.** Example 2
  after 6.47 × 100 is 0.39 × 1,000: a different power, a zero to hold. An
  example that varies nothing is a repeat; one that varies everything teaches
  nothing about which change caused which effect.
- **The core path carries no digression.** History, a name's origin, a
  convention's dispute, a fourth dimension: each lives in an "Extra info" box
  or a section after the core, never between a rule and its example. The
  implied-multiplication dispute sat inside the powers section of
  `orderOfOperations`; it is now a section of its own after the bars.
- **Headings state the claim, not the topic.** "The place-value rule" names a
  topic; "Each move changes a digit's value tenfold" is the claim, and a
  reader who reads only the headings gets the page. (Signalling: the heading
  is the reader's map.)
- **The exam's own words appear once, where the form is taught.** "Write 756
  as a product of its prime factors", "find the highest common factor of 360
  and 756", "give your answer in index form": a reader who has met the phrase
  recognises the question. Once, in the sentence that produces the answer or
  in the summary; never as a heading.
- **The figure and the prose divide the work.** Prose states what the figure
  cannot draw — the reason, the rule, the exception; the figure draws what the
  prose cannot say — the movement, the arrangement, the growth. A paragraph
  that describes the figure's first stage is redundancy (Mayer): the caption
  already says it. Never say a thing and then say it again when you show it:
  the paragraph before a scene states the claim, the scene's captions carry the
  numbers and the steps, and neither repeats the other — `HCFFromPrimeFactors`
  narrated "one 2 leaves each ring… 36, the HCF" in a paragraph and then in
  five captions, and the paragraph went. A sandbox, lab or tester starts on a
  number the page has not already worked, or its first state is a repeat of
  the example above it. A figure whose stages only change their text is a
  paragraph in a box: pull the text out and delete the stage.
- **Read it aloud to someone who is not a mathematician.** Every paragraph
  they stop on is a finding. The stops cluster where a sentence carries two
  ideas, where a fact returns, and where the reason for a step is a paragraph
  away from the step.

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

`lesson-prose-voice.md` holds thirty rules — twenty-four on the sentence, taken
from the written-methods pages by reading them, and six on the paragraph and
the page. Judge each sentence and each paragraph against it. The
faults cluster in the introduction, the hinge between sections, and any sentence
beside a widget — so read those hardest, and do not copy an opener from a
reference page without testing it first. `node scripts/voice-check.mjs <page>`
lists the sentences a script can suspect — banned phrases, questions, second
person, length — as lines to read, not verdicts; the pass is reading them.

## 2c. Sense pass — would a teacher say it?

The teacher pass asks whether a sentence is true and the voice pass whether it
is written in the house voice. A sentence can pass both and still be one that
no teacher would say aloud, and a reader who is not a mathematician hears
those at once. Read the page word by word, every sentence in turn, with fresh
eyes — a reviewer who did not write the page, in a fresh context — and ask
of each:

- **Is the reasoning real?** In a sentence with *because*, *so*, *which is
  why*, *that is why*, is the second half a consequence of the first, or the
  first half again? "Commas group whole-number digits in threes, which is why a
  million is written 1,000,000" explains nothing: the "which is why" joins a
  fact to itself.
- **Is it new?** Does it say anything the heading, the previous sentence, the
  rule card or the figure beside it has not already given? A caption that
  inventories its figure — "the places from millions to thousandths, what each
  is worth, and five numbers written into them" — says what the eye already has.
- **Would a teacher say it, in these words, to a 14-year-old?** Flourish
  ("settles it", "hands back", "is what the arithmetic gives"), lists of three
  written for rhythm, a sentence that ends on a moral, a hedge, throat-clearing:
  all of these read as written to impress rather than to teach.
- **Is it the plainest way to say it?** Try to say the sentence more clearly
  in about the same number of words; if that is possible, the sentence fails
  and the plainer version is the fix. "The mirror is the ones place rather than
  the point" is true, unrepeated and unadorned, and still has to be read twice,
  because its subject is a metaphor the reader was never given. "The place
  names mirror about the ones place, not about the point" is the same length
  and read once. The usual causes: an abstraction as the subject where the
  concrete thing could be; the point of the sentence arriving as an aside; a
  passive hiding who does what; a noun ("the placement of") where a verb
  would do.
- **Is every word working?** A word that can go without loss goes.

There is no quota. A page with nothing wrong reports nothing, and a finding
that would not persuade a sceptical reader is noise. Fix what is found in the
page and in the script's captions, then have a second fresh reader make the
same pass and find nothing.

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
- **type below the floor, and a label wider than its cell.** Measure; do not
  squint at a screenshot. `node scripts/text-check.mjs <page>` renders the
  docked page and reports every visible text run under 14px as the reader
  sees it — an SVG label at its viewBox scale, a board at its transform —
  and every run that crosses the edge of the box around it. Under 12px fails;
  12–14px is a list to read (a place name over a column the mathematics has
  fixed at 60px may be 13px; a caption, a unit, a status line or the text
  beside an input may not). Then drive the states the docked render cannot
  show — a sandbox at its widest input, a drawing hidden until its stage
  arrives, a seven-column product — and look at those too. Thirty-one of
  thirty-two lessons carried 8–11px labels, copied board to board from the
  reference page, until the check was written.

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
links, practice pairing, breadcrumbs, panel, notation, glossary, voice, the
rendered type check, and `git diff --check`. Dead CSS is a per-session grep, because page scripts compose
class names at run time and a text search cannot tell an unused class from a
composed one.

## Writing the checks

Every pass above is a script, re-run after every change, because a check that is
not automated is a check that stops happening.

**Where they live.** The repository has no `package.json` and no `node_modules`,
and stays that way: every check runs on Node's built-ins. The ones that read
source live in `scripts/` — `structure-check.mjs` for markup, `notation-check.mjs`
for roots and indices, `voice-check.mjs` for the sentences a script can suspect —
and so does the one that renders, `text-check.mjs`, which drives the same
headless Chrome the render recipe uses and measures type as the reader sees it.
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
The last pass is the read-aloud: a page is finished when a listener with no
maths follows it from the first heading to the summary without stopping.
