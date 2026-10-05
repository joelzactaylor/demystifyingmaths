# Written methods and Powers and roots: validation

Scope: all 14 Written methods lessons, all five Powers and roots lessons,
their menus, and the Structure and calculation menu. Checks use isolated
Chrome profiles and do not change the reader's saved progress.

## Repairs from this pass

- Inline answers no longer accept Enter while an input method is composing.
  Starting composition also cancels a pending acceptance timer. This applies
  to both blocks.
- Short division now puts an ellipsis on the quotient itself when its decimal
  continues, matching the caption. Exact results do not get this mark.

## Approved continuity additions

The owner subsequently approved first-unanswered resume, saved unfinished
answers, reset confirmation and consistent diagram persistence across both
blocks. Drafts remain separate from accepted answers and never increase
completion. `lesson-session-check.mjs` covers restoration, a visible resume
target, cancelled/confirmed resets, native diagram controls, custom controls,
menu links past accepted gaps, and unsubmitted mixed-practice drafts.

## Checks

| Area | Coverage |
| --- | --- |
| Repository | Links, breadcrumbs, practice pairing, panel rules, notation, glossary, raw HTML structure, progress catalogue, JavaScript syntax and diff whitespace. |
| Questions | 154 teaching prompts and 76 fixed mixed-practice prompts; answer arithmetic, validation and statement-gap presentation. |
| Lesson flow | All 19 lessons: native answer entry, wrong-answer delay, clearing an error, input composition, partial/completed reloads, Show whole lesson, out-of-order answering, reset, deep links and guided completion. |
| Persistence | Completed menu cards and totals; resume selects the unfinished lesson; resetting one lesson leaves the other block intact. All lessons remain usable with blocked or malformed storage. |
| Fallback | All 19 lessons retain readable explanations without JavaScript. |
| Motion | All 37 Written methods scenes at 1440×1000, 1280×650 and 1000×800; immediate scroll positioning, stable geometry and typography. The expanded check also scrolls backwards. |
| Diagrams | All base/index combinations offered by the powers explorer; sampled power recognition; all 15 square sizes; cube layers and parity; number-line signs and endpoints; keyboard controls and restored diagram state. |
| Sandboxes | Nine Written methods sandboxes reject malformed/empty input without losing focus and recover afterwards. Seven calculation sandboxes also have independently computed arithmetic cases, including boundary values, zeros where allowed, and continuing decimals. |
| Presentation | Voice and rendered text checks for every lesson and both subtopic menus; short-desktop navigation controls; menu image loading, overflow and hover-arrow stability; screenshots inspected for diagrams, large calculations and menus. |

The voice check's square-roots warning is its list of square facts, not an
overlong prose sentence. The 13px labels reported in Written methods are
place-value column headings, permitted by the type rules.

## Repeat

The commands are listed in `local-development.md`. The new durable browser
checks are `lesson-interaction-check.mjs`, `lesson-resilience-check.mjs`,
`powers-roots-browser-check.mjs` and `written-methods-sandbox-check.mjs`.
`written-methods-motion-check.mjs` accepts `TEST_WIDTH` and `TEST_HEIGHT`.

These are Chrome checks, not a claim of exhaustive browser coverage or proof
of learning outcomes. Safari, Firefox, real screen-reader listening and pupil
usability sessions were not tested. Further platform-inspired features require
the owner's confirmation before implementation.
