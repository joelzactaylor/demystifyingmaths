# Optional revision and problems

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
line, a bold question-total line and a fine bottom rule. No card border or fake
scan texture. These are deterministic, double-resolution
PNG facsimiles rendered locally, not scans of published papers. The answer input
overlays the printed answer line using coordinates supplied by the renderer;
check and navigation controls sit outside the paper. An accessible HTML transcript
remains available to assistive technology and becomes visible if rendering fails.
Printed marks are suggested allocations, not awarded marks or an official scheme;
this and the original authorship are stated in the site footer.
Every answer line explicitly asks for figures or a decimal. Place-value wording
also asks for a decimal locally, so “seven hundredths” is not silently treated as
a mathematical error. Non-numerical entries get format guidance, not a wrong
mathematical attempt. The material remains clearly labelled original, not a past paper.

- Open directly onto the first unfinished question: at most six retrieval
  prompts followed by four complete problems. One question is shown at a time,
  with Check answer, Continue and Previous question. There is no start screen
  or secondary problem menu. Continue is available after a correct answer or
  after opening the solution; no learner is trapped behind an unknown answer.
  Closing a solution stays closed after reload without forgetting that it was
  viewed. At the end, unfinished earlier questions are resumed before the
  completion screen can appear, including arrivals through the problems link.
  Completed lessons guide retrieval selection; with no saved completion,
  questions are selected from the whole block.
- Two deliberately authored retrieval prompts per lesson: 38 in total. Later
  visits alternate them. These standalone reviews use complete exam-style
  instructions and a separate labelled answer line, not teaching-page sentence
  gaps. This is an explicit exception for these reviews, not a lesson redesign.
- Four original exam-style problems per block. These combine methods without
  supplying intermediate answer gaps. Each has a full solution. The optional
  scratchpad and separate hint controls are removed; previously saved working
  is preserved and readable inside its solution. Only the final answer is checked automatically: the site does
  not claim to mark written working, award exam marks or use official papers.
- Help matched to identifiable numerical errors, otherwise an honest checking
  step. Each question has a directly available solution containing
  links to relevant lessons and their foundations. These are useful routes
  back, not an automated diagnosis of a pupil's ability.
- Answers and the current question survive reload. Rechecking a finished
  question does not advance its schedule again. Solution is the sole disclosure;
  Reset answers is a quiet control beneath the question with confirmation.

There are no timers, streaks, scores or compulsory sessions. The route returns
to the subtopic menu rather than attaching a practice page to the lesson
sequence. Longer problems are available without claiming prerequisite mastery.
Revision never changes lesson completion.

## Scheduling policy

An independent answer has no incorrect check and no help before acceptance.
On successive independent visits, suggest a return after 1, 3, 7, 14, then
30 days. A hint, incorrect check or solution-before-answer resets the interval
to one day. Merely looking at a method after answering correctly does not
change an independent outcome. Blank and malformed entries are not graded
as mathematical errors.

These are simple, explicit product rules, not optimised learning intervals or
proof of mastery. A due date is a suggestion, never an overdue warning. Due
topics are ordered oldest first; only six are selected at a time. A session
keeps its original questions while unfinished. A completed sheet stays visible
until one of its topics becomes due again. An independent early answer does
not advance the interval or postpone the due date. Scheduling happens once
when an answer is accepted or its solution is opened, not on a Continue click.
An unfinished longer problem prevents the session from rotating on a new day.
When a completed session becomes due, the longer problems start unanswered too;
old accepted answers are not exposed in a fresh session. Editing an accepted
answer updates the visible completion count immediately.

## Source and storage

- `js/number-revision-bank.js`: lesson-section links, retrieval pairs and eight
  original problems, including complete methods and specific near-misses.
- `js/number-revision-core.js`: pure number parsing, validation, scheduling,
  due queues and saved-state validation.
- `js/number-revision-paper.js`: exact text and mathematical notation rendered
  to local PNG paper images; no image-generation service or external assets.
- `js/number-revision.js`: the two pages' shared UI, draft/working persistence,
  per-question checking and support links.
- `css/number-revision.css`: page-scoped ochre practice styling, fixed canvas,
  keyboard focus and print state. It does not style teaching pages.

Only `dm-number-revision-v1:` localStorage keys are written:
`<lesson>` holds the latest scheduled visit; `<group>:session` holds the saved
session; `<group>:position` stores the guided cursor with its session token;
old `<group>:topics` preferences are ignored; `<problem-id>` holds a problem's
draft, working and support use. No lesson-completion keys are changed.

Reset asks for confirmation and clears only this group's revision records,
session and problem attempts.
The other group and all teaching progress are left alone. If storage is
unavailable, the current tab still works in memory and says that it cannot
save across reloads. Without JavaScript, direct lesson links remain available.

## Checks

```sh
node scripts/number-revision-check.mjs
node scripts/number-revision-browser-check.mjs
TEST_WIDTH=1000 TEST_HEIGHT=800 node scripts/number-revision-browser-check.mjs
```

The first check independently derives all 46 answers, checks input grammar,
section links, scheduling, queue order and corrupt saved state. The isolated
Chrome check drives both reviews, all 38 retrieval prompts and eight problems;
it checks immediate access, saved drafts/working, solutions, held Enter, input geometry,
reset cancellation/isolation, blocked storage, corrupt storage and no-JS links.
It saves screenshots for visual inspection. Also run the repository checks
and rendered type check listed in `local-development.md`.

Chrome testing is not a claim of Safari/Firefox compatibility, real
screen-reader testing or measured learning outcomes.
