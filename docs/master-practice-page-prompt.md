# Master prompt: build the next Demystifying Maths practice page

Use this prompt from the repository root. Replace `<TARGET>` only when a specific page is required; otherwise select the unwritten practice page paired with the most recently completed teaching page.

Quick invocation for a new Codex turn:

> Read and execute `docs/master-practice-page-prompt.md` for the next unwritten practice page. Treat the prompt as the complete brief and continue until every review and validation gate passes.

To name the page explicitly:

> Read and execute `docs/master-practice-page-prompt.md` with `<TARGET>` set to `pages/path/to/practicePage.html`.

---

Create `<TARGET>` from the ground up as a finished Demystifying Maths practice page. It must feel like a patient place to try mathematics, not an exam, test paper or quiz. Work autonomously, but keep implementation changes limited to the target HTML page, its dedicated question-bank JavaScript, and the smallest compatible practice styles or shared practice mechanics needed for the page. Preserve every unrelated local change in the dirty worktree. Do not alter the paired lesson, neighbouring pages, manifest curriculum mapping or existing practice pages unless I explicitly approve a separate consistency fix. The sole automatic exception is adding a missing stable `id` to an existing lesson heading when the practice reflection must deep-link to that exact section; do not change the lesson's wording, order or mechanics as part of that exception. If a shared change could affect an existing page, prove that it remains compatible or keep the new behaviour page-specific.

## Establish the brief before writing

1. Read the target stub and locate its drill entry in the relevant manifest. Treat `kind`, `learningPages`, `availableAfter`, `skill`, `scope`, `tier` and `sections` as the source of truth.
2. Read every linked learning page and its dedicated assets. Identify what has actually been taught, the language and representations it uses, its named misconceptions, and what later lessons own.
3. Read `docs/syllabus-coverage.md`, especially “Practice pages are a different thing” and “Pairing”. Read the strongest completed lesson pages nearby to match the site's visual language. Inspect the existing standard-form practice engine only for reusable low-level ideas; its paper, timer, marks, score bands and one-shot marking are explicitly not the model.
4. Decide whether the target is narrow lesson practice or a mixed review. A lesson practice page may depend on exactly one learning page. A review must include every manifest prerequisite and must not expose a skill before `availableAfter`.
5. Turn each manifest section into a precise internal question specification: allowed values, representations, answer forms, calculator policy, difficulty boundary, exclusions, misconceptions and the method a complete solution must show.
6. Check every generator and every worked route independently. If wording, context, units or answer forms can vary, define and validate every branch rather than checking one example.

## Build a welcoming practice journey

- Give the page a specific, encouraging heading such as “Practise scaling a known calculation”, not “The test”, “Question paper” or a generic “Practice”.
- Open with a compact goal strip in the practice-page ochre style. Say what the reader will get comfortable with, link to the exact learning page or pages, and make returning for a reminder feel normal.
- Keep orientation brief and useful. Do not repeat reassurance already conveyed by the heading, goal, lesson link or visible controls. In particular, avoid announcing that hints, retries and worked solutions are available when those controls are already self-explanatory. Friendly means calm, direct and non-judgemental—not chatty, overly accommodating or padded with encouragement.
- Begin with a straightforward, recognisable prompt so the first interaction builds momentum. Increase variation and reasoning in dependency order: direct fluency, changed representation or application, then a question that reveals understanding without trying to trick or catch the reader.
- Use descriptive stage names that say what is being practised. Avoid “Section A”, “easy/hard”, Foundation-style labels on both-tier work, or headings that judge the learner.
- Present one manageable question as the visual focus. Show quiet progress through the planned practice without laying out a long paper above the fold.
- Progress must state the learner's position in the complete round (for example, “Question 5 of 12”). If stages also have local counts, label both scopes explicitly; never show “of 4” when more than four questions exist in the round.
- Keep the reader in control. They may request a hint, check when ready, revise an answer, view a complete method, try another equivalent prompt or continue. Do not use a timer, countdown, mark total, percentage, best score, streak pressure, lives, rank or forced pace.
- Do not duplicate the lesson as static exposition. A hint can recall one relevant decision; feedback can diagnose the submitted response; a solution can model the full method. Each appears at the moment it is useful and remains attached to its question.
- End with a calm reflection and onward choices. Distinguish work completed independently, completed after a hint or retry, and still worth revisiting. Make those outcome totals operable filters, not inert statistics. Include a concise summary of every question with its outcome, the learner's entered answer and an in-page link that returns directly to that question. Any link back to teaching material must say explicitly that it opens or returns to the lesson; never hide that destination behind vague copy such as “Review the idea”. When separate practice stages map to separate parts of one lesson, give those lesson sections stable IDs and deep-link each review action to its matching `#fragment` rather than the top of the page. Put each ID on the existing section heading so the link lands at the section's beginning; never attach it to an example or paragraph partway through the section. Offer another similar question or fresh round without implying failure.
- At the bottom of a practice page, resolve the immediate next teaching page and immediate next practice page independently from their respective orders in the subgroup index, then check whether they form a genuine lesson–practice pair. Show the blue “Next lesson” card when the next practice page is dedicated to that lesson. If the next practice is an unpaired mixed review, leave the lesson slot empty and show only the review's practice card. Show the ochre “Next practice” card when the next teaching page has that dedicated practice. If the next lesson has no practice page, leave the practice slot empty and show only the lesson card; never skip it to advertise a later practice. At the end of either sequence, omit the corresponding card. Do not use either slot for a generic return to the current lesson, because exact lesson-review links already belong in the reflection.
- Build those onward links with the site's shared `topic-section`, `topic-grid` and `topic-card` pattern. When both cards are present, put the blue `topic-card--next` card with a “Next lesson” kicker first, followed by the ochre `topic-card--practice` card with a “Next practice” kicker. When only one valid destination exists, show that card alone; do not invent a companion destination or leave an empty visual placeholder. Do not substitute the older `nextlinks` design or page-specific card styling.
- Use restrained warmth. Be human without sounding eager to reassure at every turn. Avoid praise spam, repeated offers of help, excessive friendliness, childish celebration, confetti, mascots, competitive language or claims about ability.
- Audit every visible sentence and dynamic message. Keep it only if it states the task, supplies mathematical feedback, explains an invalid entry, identifies a meaningful state change, or prevents accidental loss of work. Remove filler and obvious interface narration such as “Take your time”, “Here is a starting point”, “Your answer remains yours to work out”, “New numbers are ready” or reminders that a visible hint or solution has just appeared.
- Remove the author note, stub copy, TODOs, “coming soon”, AI-facing commentary and unnecessary explanations of page functionality.

## Design questions that teach through practice

- Generate fresh questions within the exact manifest scope. New values should test the same mathematical decision, not drift into a new skill or become harder by accident.
- Make question families meaningfully varied: change values, representation, direction, missing part and context where appropriate. Do not create twelve surface variants of one template.
- Use contexts only when their nouns and units affect the mathematics. Keep quantities plausible and never produce fractional indivisible objects.
- Ensure every generated answer is exact unless approximation is explicitly in scope. State required rounding, units and answer form in the prompt whenever they matter.
- Prefer values that expose the intended structure cleanly. Include deliberate misconception cases only after an ordinary case has established the task, and phrase them as opportunities to notice something—not traps.
- Do not place a badge, kicker, heading or aside beside a question that names the required scale change, operation, misconception or solution route before the learner responds. Orientation may name the broad stage; the prompt itself must leave its intended mathematical decision for the learner to make.
- Accept mathematically equivalent input formats where the syllabus permits them. Normalise harmless spaces, commas, Unicode minus signs and common multiplication symbols without silently accepting a different mathematical answer.
- If an answer has several parts, validate each part separately and preserve correct parts on retry. Never reduce useful mathematical information to one binary right/wrong check.
- Random generation must be bounded and terminating. Avoid unbounded retry loops; supply a mathematically valid fallback for constrained generators.
- Keep a deterministic way to test generators, such as exposing pure helpers or accepting a seeded random source in development. Fuzz every question family across many generated cases.
- Do not make a learner regenerate an entire round to get one more question of the same kind. “Try another like this” changes only the relevant prompt after warning if it would discard unfinished work.

## Make feedback helpful, specific and revisable

- Use “Check my answer” or a similarly neutral action. Checking is local to the current question; do not hold all feedback until a final submission.
- Change the controls when a check changes the question state. After a correct response, turn the primary check action into “Continue” or the truthful finishing action and make unavailable help visibly say that the question is complete. After an incorrect response, use the compact retry label “Check again”; do not leave the original labels in place or introduce stilted wording such as “Check revised answer”.
- In a single-answer field, Enter checks the current response. Once that response is correct, the next distinct Enter press activates Continue or Finish. Ignore key-repeat so holding Enter cannot check and immediately skip a question.
- A correct response gets a concise confirmation that names the successful mathematical decision when useful. Do not merely flash a tick or rely on green.
- An incomplete response says what is missing without treating it as wrong.
- An incorrect response keeps the learner's input editable and gives one actionable observation based on what they entered. Prefer “The product is right; now track the two scale changes” to “Incorrect”.
- Detect important near-misses and misconceptions explicitly: sign errors, place-value shifts, reversed operations, omitted zeroes, wrong units, premature rounding, equivalent but non-required form, or one correct component with one slipped component.
- Provide a layered hint before or after checking. The first hint should point to the next decision or representation, not reveal the result. A stronger follow-up may set up the next line when that genuinely helps.
- Keep “Show a worked solution” enabled from the moment the question appears. It is an explicit route for a learner who is stuck or wants to study the method before attempting an answer; do not require a wrong answer or revealed hint first. Record solution use only for the learner's private reflection, never as a penalty.
- A worked solution must use the method and vocabulary from the linked lesson, show the important intermediate steps, and end with the answer in the requested form and units. It must be generated from the current values, not a generic paragraph with numbers substituted awkwardly.
- After feedback, keep focus in a sensible place, preserve the typed response and avoid scrolling the page unexpectedly. Announce concise state changes through a polite live region without reading the entire solution automatically.
- Never use shame, threats or fixed ability labels. Avoid “weak”, “unreliable”, “failed”, “you dropped marks” and “not good enough”. Use factual language: what is correct, what to inspect, and what can be tried next.
- A verdict overlay may make checking feel consequential, but it must remain brief, decorative and secondary to immediate accessible feedback. Use concise verdict text only—such as “YES” and “TRY AGAIN”—with no custom praise, consolation or explanatory subtitle. Keep reusable verdict graphics topic-neutral rather than embedding powers of ten or another lesson-specific symbol. As the current interaction benchmark, aim for roughly 2.2 seconds for a correct verdict and 1.35 seconds for a retry verdict; scale every nested motion and timeout consistently, and shorten the reduced-motion fallback further.

## Build stable, familiar interactions

- Match the site's established 900px fixed-canvas layout, Aleo typography, rounded cards, quiet shadows and ochre practice identity. The page must still feel part of the same site as the blue teaching pages.
- Keep the current question card's dimensions as stable as practical. Reserve space for hints, feedback and methods so checking does not cause violent layout jumps.
- Update existing nodes in place. Do not rebuild a focused input's containing card on every keystroke, and preserve focus, caret and scroll position when sanitising or validating.
- Use native controls wherever possible: labelled inputs, radio groups, checkboxes and real buttons. Give every field a unique ID and a visible label that describes the requested mathematical part.
- Make answering efficient and satisfying, never tedious. Match the control to the mathematical response rather than defaulting to a text field: use a radio or pressable value tile when the answer must be one of a short visible set, and use an accessible tap-to-build control with removable tiles, undo and clear actions for an ordered list instead of repetitive dropdowns or transcription. Give controls clear pressed, placed, returned and focus states so the interaction feels responsive. Remove clerical effort, not mathematical thinking: the values, misconceptions, representations and difficulty must remain within the full lesson scope.
- If different question families use different answer controls, render exactly one answer mechanism at a time. Ensure `[hidden]` overrides any base `display` rule, read the answer from the currently visible control when checking, and test every transition between text, radio, checkbox and select modes. Apply the same authoritative hidden-state rule to hints, feedback details, worked solutions, reflections and every other conditional panel; a newly generated or newly visited question must not inherit visible help from the previous one. Never show a stray text field beside a radio or select task.
- Match visual affordance to semantics. An action implemented as a button—including hint, retry and worked-solution toggles—must visibly look pressable through its border, shape, padding and interaction states; do not style it as an ordinary underlined text link.
- Disable only actions that are genuinely unavailable. Never disable a learner's answer because it has been checked; revision is part of practice.
- If progress persists locally, store only what helps the learner resume. The page must work fully when storage is blocked, and a reset must name exactly what it will clear before doing so.
- If JavaScript is unavailable, show an honest, useful fallback: the practice needs interactivity, with direct links back to the paired learning pages. Do not leave an empty decorative shell.
- Provide a useful print state. Hide navigation and controls, lay out the current generated questions cleanly, leave working space, and include worked solutions only when the reader has chosen to reveal or print them.
- Respect `prefers-reduced-motion`. Motion may clarify a state change, but never delay feedback, move focus or become the only cue.
- Do not add decorative animation to imitate a teaching-page scroll scene. The interaction itself is the practice page's differentiator.

## Accessibility and mathematical presentation

- Include the viewport meta tag and page-specific title, description and Open Graph metadata. Describe the page as supported practice, never as a scored test.
- Maintain one page-level `h1`, a valid heading hierarchy and landmarks that make the goal, current practice and onward links easy to find.
- Put visible labels on every input. Use `fieldset` and `legend` for related choices, unique IDs, valid ARIA references and short `aria-live="polite"` messages.
- Do not rely on placeholder text, colour, ticks or crosses to convey correctness. Pair colour with precise text and a border, icon shape or other structural cue.
- Keep mathematical expressions legible and semantically available to assistive technology. Hide purely duplicated visual notation, not the only accessible version of a question.
- Make tap targets generous and keyboard order logical. Focus styles must be obvious against white and ochre surfaces.
- Keep diagrams and answer constructions within the site's scaled narrow view. Labels, exponents, fraction bars, units and decimal points must never collide or clip.
- Keep language concise, concrete and age-appropriate. Read every generated prompt aloud mentally; reject grammar that only works for one random branch.

## Adversarial review before stopping

Complete at least two review passes after the first implementation:

1. **Teacher pass:** challenge the scope, progression, answer form, wording, units, every generated method and every feedback branch. Confirm that hints help without answering and that misconception cases are mathematically purposeful rather than sneaky.
2. **Learner pass:** try the first question blank, correct, partly correct and wrong. Request hints in different orders, open the worked solution before attempting, revise after feedback, generate another question and complete a round. Verify that Enter checks, a second distinct Enter continues, checked controls change labels, and held Enter cannot skip. On the finish screen, use every outcome filter and every return-to-question link. Check that lesson review links land at the top of the matching section and that the blue next-lesson card precedes the ochre next-practice card. Look for judgemental copy, filler, dead ends, unwanted resets, focus loss, scroll jumps and a first screen that resembles an exam paper.
3. **Generator pass:** run deterministic arithmetic assertions and a large sample from every question family. Check constraints, exactness, equivalence parsing, negative and zero cases, minimum and maximum values, contexts, units, fallbacks and that no later skill leaks in.
4. **Accessibility pass:** verify headings, labels, fieldsets, IDs, ARIA references, keyboard behaviour, live-region brevity, non-colour states, focus management, reduced motion and the no-JavaScript fallback.
5. **Repository pass:** run JavaScript syntax checks, `git diff --check`, the local link checker, the practice-pairing checker, DOM/ID/ARIA checks and CSS structural checks. Use the in-app browser for rendered testing when available; if it is unavailable, say so rather than silently substituting another browser surface.

After those passes, compare the result against `docs/syllabus-coverage.md` line by line. If a flaw is found, fix it and repeat the relevant checks. Finish only when the practice is mathematically exact, narratively progressive, visually calm, mechanically stable, accessible, genuinely useful after a mistake and inviting enough to return to.

In the handoff, lead with the completed outcome, name the files changed, summarise the practice and feedback decisions, list validation performed and disclose any rendered test that could not be run.
