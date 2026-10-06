# Fixed exam-style practice papers

Approved scope: the 14 Written methods lessons and five Powers and roots
lessons. Each subtopic menu links to its own `practiceRevisit.html`. These are
new cumulative reviews, not a return to separate practice after every lesson.
The fixed mixed questions at the ends of the teaching pages are unchanged.
The older unlisted reviews remain untouched.

## What the learner gets

A compact paper heading identifies the topic and non-calculator format, with
the first question immediately below. There is no separate cover screen,
Start button, introductory paragraph or source copy above the questions.
Questions use cropped-paper proportions based on the May 2023 Edexcel 1F paper:
Times serif text, a narrow numbered gutter, blank working space, a dotted answer
line, a bold question-total line and a fine bottom rule. On screen, a subtle
square paper edge separates the question from the surrounding controls; it is
not a rounded web card or fake scan texture. These are deterministic, double-resolution
PNG facsimiles rendered locally, not scans of published papers. The answer input
overlays the printed answer line using coordinates supplied by the renderer;
check and navigation controls sit outside the paper. An accessible HTML transcript
remains available to assistive technology and becomes visible if rendering fails.
Its question number, wording and total-mark sentence match the visible paper;
it does not substitute different qualification such as “suggested marks”.
The semantic and fallback order matches the paper too: prompt, working, answer,
then total. The answer explicitly references that total through its description.
The HTML fallback retains the same working tools and marking, with working
placed before the answer line; Canvas failure must not reduce it to answer-only
checking. Short and show-working questions retain their distinct authored
working-space heights in the raster view, HTML fallback and print, so a failed
image does not make the page jump to a different question shape.
When Canvas text measurement is unavailable too, an invisible DOM ruler keeps
method ticks beside their equations rather than at the textarea boundary.
Print mode expands every guided question into one consistent A4 HTML paper,
keeps working space and entered work, and removes navigation, toolbars, raster
layers and screen-only progress. Feedback, solutions, automated ticks and
coloured answer states are screen-only too, so an opened solution cannot leak
into the paper. Every answer uses the same dotted line whether or not its raster
question has been rendered on screen. It never prints just the currently
visible question.
Printed marks are original practice allocations, not an official scheme.
The checker awards verified marks for the final answer and explicitly supported
typed equations. Handwriting and unrecognised methods are left for review, not
declared incorrect. The footer states this boundary.
Question wording states figures or a decimal where the answer form could be
ambiguous. The same wording remains as the answer field's accessible name but
is not repeated visually beside the exam-paper line. Place-value wording asks
for a decimal locally, so “seven hundredths” is not silently treated as a
mathematical error. Non-numerical entries get format guidance, not a wrong
mathematical attempt. Proper comma or space grouping is accepted in a final
large-number answer; malformed grouping is not joined into another number.
The material remains clearly labelled original, not a past paper.

- Open directly onto the first unfinished question: all 28 Written methods
  prompts or all 10 Powers and roots prompts, followed by four complete problems.
  These fixed papers contain 32 and 14 questions respectively. One question is shown at a time,
  with Check answer, Continue and Previous question. There is no start screen
  or secondary problem menu. Continue is available after a correct answer or
  after opening the solution; no learner is trapped behind an unknown answer.
  Closing a solution stays closed after reload without forgetting that it was
  viewed. At the end, unfinished earlier questions are resumed before the
  completion screen can appear, including arrivals through the problems link.
  Menu boxes correspond one-to-one with the paper, in the same order.
  The thin bar beside the question counter shows position in that paper, so it
  never conflicts with “Question n of total” after a direct jump. Completion
  and verified marks remain in the saved menu boxes rather than overloading it.
  A fresh `#problems` link opens the first longer problem; reload and history
  navigation retain the saved question instead of applying that jump again.
  Their fixed totals are 57 and 19 marks; automated checks guard both the
  question counts and mark totals so menu boxes cannot drift from the papers.
- Two deliberately authored retrieval prompts per lesson: 38 in total. Later
  visits retain them in the same order. These standalone reviews use complete exam-style
  instructions and a separate labelled answer line, not teaching-page sentence
  gaps. This is an explicit exception for these reviews, not a lesson redesign.
- Four original exam-style problems per block, without supplied intermediate
  answer gaps. Every question has local pen, text, eraser and undo tools in its
  working area. Text boxes can be moved with a pointer or their Move button's
  arrow keys. Working persists with the answer. The calculator appears only
  for `calculator: true`; all current questions explicitly disallow it.
  The toolbar contains only its controls; the handwriting-recognition boundary
  is explained after marking and in the footer rather than repeated above every
  blank working area.
  Switching back to Text focuses the existing working; it does not create an
  overlapping box. Clicking empty working space in Text mode places another box.
  A typed field remains inside the authored working space: short questions keep
  it at the top, while show-working questions allow useful vertical movement.
  A text box shows its boundary, Move and Delete controls while hovered or
  focused. They recede after editing so checked work reads like writing on the
  paper rather than a permanent editor widget.
  Within a working box, keyboard order reaches the calculation field before
  its secondary Move and Delete controls; CSS retains the visual control strip.
- All 26 multi-mark questions say “You must show your working” and have authored
  typed-equation criteria. Ticks appear next to recognised lines and the final
  answer; a numeric verified-mark summary accompanies them. Recognition is
  bounded structural expression matching, not general algebra assessment or handwriting
  recognition. Alternate methods can be valid without being recognised.
  Correct final answers do not automatically earn the working marks.
  The compulsory wording is deliberate: ordinary “Work out” questions normally
  imply full marks from a correct answer alone, while this instruction makes the
  method evidence part of the response.
  Text is the default tool. Method criteria accept reversed equalities, labelled
  chains, reordered sums/products and squared/cubed products. Method marks
  survive arithmetic slips; an unrelated expression with the same value earns
  nothing. These original show-working allocations use M1 criteria and a final
  A1 dependent on all required method criteria; single-mark answers use B1.
  This is a restricted authored scheme, not a claim of general examiner-level
  marking or follow-through support. Each mark point says whether it is
  awarded, not awarded, or not verified; a wrong answer is never described as
  an unverified “correct final answer”. Amber feedback says “Working needs review”
  when working exists but is unrecognised, “Working required” when none was
  supplied, “Final answer needed” for checked working with a blank answer, or
  “Not full marks” for an incorrect final answer. Within a red incorrect-answer
  panel, method work awaiting human review remains amber rather than acquiring
  the final answer's definite red cross. Green is reserved for full credit.
  Keyboard checks focus unresolved feedback rather than jumping straight to
  Continue.
  Combined expressions can earn their constituent method marks: the checker
  inspects parsed operations, not text fragments or equal numerical values.
  Multiple marks earned on the same working line are drawn side by side.
  Supported working can earn method marks before the final answer is filled
  in. This does not mark the answer correct or complete the question. The
  checker accepts both `sqrt(144)` and `√144` notation in typed working.
  Operand comparison preserves decimal digits exactly, rather than rounding
  through JavaScript numbers. Authored operations are compiled once; each
  learner line is parsed once per assessment and matched against those criteria.
  Every multi-mark question has a plain-language criterion naming the method,
  rather than exposing an isolated equation as its explanation. Long-division
  evidence includes the quotient-digit multiplication as well as subtraction
  of the corresponding multiple.
  Integer division working accepts `remainder`, `rem` and `r` notation by
  translating the stated quotient and remainder into the corresponding
  multiplication-and-addition evidence; it does not guess from the final value.
  Pound-only calculations accept the currency prefixes used in their solutions.
  Currency prefixes are not indiscriminately removed from mixed pound/pence
  questions, where that would change the meaning of a value.
  Authored length and area schemes accept their displayed metre or centimetre
  units, and the pack-comparison scheme accepts pence notation; unrelated units
  are not stripped merely to make an expression match.
  Properly grouped thousands separators are accepted in typed working;
  malformed comma groups are not silently joined into a different number.
- Editing assessable typed working clears stale ticks and saved marks. Adding,
  erasing or undoing unrecognised ink preserves any marks already verified
  from unchanged typed equations. After a checked correct answer, adding ink
  changes “working required” to “working needs review”, while erasing the last
  stroke changes it back; neither state pretends the ink was recognised.
  Reloading unchecked typed edits never marks
  them silently; restored checks do not replay animation. Supported-method
  checks are tested independently in `number-revision-marking-check.mjs`.
  Tick positions use the rendered equation width and line height, including
  text-field scrolling. Returning to a hidden question or resizing redraws
  marks without changing scores or replaying their animation.
  Moving a text box does not invalidate its mathematics or require another
  check. Undo distinguishes layout changes from edits to the working; only
  changed mathematical evidence clears the current marking.
  Editing marked working also clears its finished state until rechecked.
  Continue and the completion count reflect that change, including after reload;
  the existing solution-viewed route remains available so nobody is trapped.
  Saved-state cleaning enforces the same revision rule, so an older or damaged
  record cannot claim completion while containing newer unchecked working.
- The two menu practice cards show one segmented box per bank question. Filled
  segments are marks verified on its last check, separate from lesson progress.
  Missing segments can be absent or unassessed working, not necessarily a wrong
  answer. “Working needs review” is stored whenever working exists but cannot be
  recognised, independently of whether the final answer is right. An incorrect
  final answer remains a definite lost accuracy mark; its method is not also
  declared wrong merely because handwriting recognition is unavailable. Absent
  required working beside a correct answer is stored separately.
  Tooltips identify each question and make clear that scores are from the last
  check. Blocked, malformed or structurally impossible saved progress is
  labelled as unavailable, never as zero attempts.
  The paper and menu use the same saved-mark validator, including the rules
  that review and missing-working states cannot coexist, and missing-working
  requires a correct final answer. They therefore cannot disagree about a
  damaged record, and the completion screen does not silently turn unreadable
  marks into a lower verified total. A subsequent valid edit or check rewrites the store without
  impossible records, so corruption does not leave the menu permanently stuck.
  Valid records are rewritten in a canonical form rather than carrying unknown
  fields from damaged or obsolete data forward.
  The progress row has a concise accessible summary of attempted questions,
  verified marks, work needing review and work not supplied. It does not expose
  all 32 tooltip descriptions as one unwieldy screen-reader label.
  The completion screen reports verified marks across the fixed paper and the
  number of questions with unrecognised or missing working, alongside the
  storage message. Its heading says “Paper finished”, not “Practice complete”, so
  reaching the end never implies mastery or hides unresolved partial marking.
  The visible position and its accessible value say “End of paper” for the
  same reason.
  The verified total, outstanding review and storage state are separate lines;
  the storage claim is written only after the final position save succeeds.
- Help matched to identifiable numerical errors, otherwise an honest checking
  step. Each question has a directly available solution containing
  links to relevant lessons and their foundations. These are useful routes
  back, not an automated diagnosis of a pupil's ability.
  Retrieval feedback distinguishes high-confidence routes such as a lone
  partial product, an omitted zero quotient digit, a misread inequality
  boundary or treating an index as a multiplier. It never invents a cause for
  an arbitrary wrong value.
  A wrong final answer is visually distinct from a correct answer whose method
  remains unrecognised: red is reserved for the former, amber for review, and
  green for fully verified credit. A focused wrong answer uses one red outline,
  not a neutral focus box stacked over a second error line.
- Answers and the current question survive reload. Checking or rechecking does
  not write the obsolete per-lesson scheduling records. Solution is the sole disclosure;
  Reset answers is a quiet control beneath the question with confirmation.

There are no timers, streaks, grades, pass/fail verdicts or compulsory
sessions. Verified marks are shown because the page is deliberately presented
as an exam-style paper, but they do not estimate ability or alter lesson
progress. The route returns to the subtopic menu rather than attaching a
practice page to the lesson sequence. Longer problems are available without
claiming prerequisite mastery. Revision never changes lesson completion.

## Fixed-paper policy

No date, score or previous result selects or rotates these questions. The whole
fixed paper and its answers remain available until an explicit reset. Older
short sessions expand without losing saved answers or working, while obsolete
per-lesson scheduling records are ignored and never rewritten. Reset still
removes those old records as migration housekeeping. Editing an accepted
answer updates the completion count.

## Source and storage

- `js/number-revision-bank.js`: lesson-section links, retrieval pairs and eight
  original problems, including complete methods and specific near-misses.
- `js/number-revision-core.js`: pure number parsing, feedback and saved-state
  validation.
- `js/number-revision-paper.js`: exact text and mathematical notation rendered
  to one local PNG paper image at a time; hidden questions retain only their
  layout data. No image-generation service or external assets are used.
- `js/number-revision-working.js`: local vector ink, movable typed working,
  erasing, undo and the permission-gated basic calculator.
- `js/number-revision-marking.js`: authored equation evidence and a restricted
  arithmetic calculator parser; never executes learner code.
- `js/number-revision-menu.js` and `css/number-revision-menu.css`: last-check boxes.
- `js/number-revision.js`: the two pages' shared UI, draft/working persistence,
  per-question checking and support links.
- `css/number-revision.css`: page-scoped ochre practice styling, fixed canvas,
  keyboard focus and print state. It does not style teaching pages.

Only `dm-number-revision-v1:` localStorage keys are written:
`<group>:session` holds the saved session; `<group>:position` stores the guided cursor with its session token;
`<group>:marks` holds each question's latest verified marks;
old `<group>:topics` preferences are ignored; `<problem-id>` holds a problem's
draft and working. Old `<lesson>` scheduling keys are ignored and are removed
by reset. No lesson-completion keys are changed.

Reset asks for confirmation and clears only this group's revision records,
session and problem attempts.
The other group and all teaching progress are left alone. If storage is
unavailable, the current tab still works in memory and says that it cannot
save across reloads. Unreadable saved JSON, or a store which cannot be read
even if it can still be written, is reported separately for the whole visit
rather than silently appearing to be a new attempt. Duplicate identifiers in damaged saved
working are discarded so ticks cannot attach to the wrong calculation. Without
JavaScript, direct lesson links remain available.
Saved ink is capped at 4,000 sampled points per question, with at most 1,000 in
one stroke. This leaves ample handwritten working while limiting the risk that
a heavily annotated paper exhausts the origin's local-storage quota; erasing
strokes releases their point budget.
A temporary storage failure is not treated as permanent: failed writes remain
in a small in-tab queue and are replayed before the warning clears after a
later successful write. This preserves work made during the interruption
instead of merely restoring the appearance of working storage.

## Checks

```sh
node scripts/number-revision-check.mjs
node scripts/number-revision-marking-check.mjs
node scripts/number-revision-working-check.mjs
node scripts/number-revision-browser-check.mjs
TEST_WIDTH=1000 TEST_HEIGHT=800 node scripts/number-revision-browser-check.mjs
```

The first check independently derives all 46 answers, checks input grammar,
section links and corrupt saved state. The isolated
Chrome check drives both reviews, all 38 retrieval prompts and eight problems;
it checks immediate access, saved drafts/working, solutions, held Enter, input geometry,
reset cancellation/isolation, blocked storage, corrupt storage and no-JS links.
It saves screenshots for visual inspection. Also run the repository checks
and rendered type check listed in `local-development.md`.

Chrome testing is not a claim of Safari/Firefox compatibility, real
screen-reader testing or measured learning outcomes.

The working-tools check covers erasing along complete stroke segments, not
just recorded pointer samples. Browser checks also cover erasing midway along
a fast stroke, undo restoration and empty gestures leaving history unchanged.

## Recognition boundary

No handwriting leaves the device. No recognition model or remote service is
connected. [MyScript's integration documentation](https://developer.myscript.com/docs/interactive-ink/3.0/web/iinkts/get-started/)
requires service credentials; integrating it needs a deployment, privacy and
cost decision. Do not expose private keys in this static site, claim ink is
recognised, or award marks by guessing what a stroke means.
