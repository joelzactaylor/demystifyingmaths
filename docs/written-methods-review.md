# Written methods: review of the revised block

## Standard and scope

Reviewed the 14 teaching pages and their menu against the five Powers and
roots lessons. The interaction reference remains
[Mathigon’s Circles introduction](https://mathigon.org/course/circles/introduction):
short explanations, a learner contribution inside the narrative, then a useful
continuation. This is a design comparison, not evidence of learning outcomes.

Written calculations need more working than a roots definition. Keep that
working, but do not make a learner read a whole chapter before contributing.
Nine existing pairs of answer gaps now sit before follow-on explanation rather
than automatically at the end of their section. Accepted answers remain plain
green text. There are 112 teaching gaps and 56 fixed mixed-practice prompts.

## Teaching review

| Lesson | Main point checked or corrected |
| --- | --- |
| Place value | Named units explain thousandths without requiring fraction addition; words-to-figures explanation split into whole and decimal parts. |
| Ordering | Comparison uses words before the next lesson introduces inequality notation. |
| Inequality symbols | Equality, strict comparisons and included boundaries remain distinct; symbol choice uses an actual comparison. |
| Powers of ten | Explain each digit’s value, not a rule about moving the decimal point. |
| Column addition | Remove the subtraction check from both prose and generated captions: subtraction comes next. |
| Column subtraction | Explain both sides of an exchange; addition is now an available checking method. |
| Exchanging across zeros | Retain whole-number and decimal examples; use different calculations for retrieval. |
| Long multiplication | Keep the grid-to-columns connection and the reason for zero placeholders; simplify expanded-product prose. |
| Multiplying decimals | Retain the area model and trailing-zero distinction; remove the premature rounding-based estimate. |
| Short division | Keep quotient place value and exchanged remainders explicit; independent decimal retrieval uses fresh numbers. |
| Interpreting remainders | Mixed practice distinguishes complete groups, enough groups and an exact share. |
| Long division | Retain a zero quotient digit, decimal continuation and remainder routes; mixed practice revisits the earlier enough-groups decision with a two-digit divisor. |
| Dividing by decimals | Explain equal scaling with actual groups, without introducing an algebraic identity first. |
| Using a given calculation | Explain the inverse operation directly rather than assuming algebraic rearrangement terminology. |

Removed mathematical connections are preserved in
`extracurricular-content-backlog.md` for later reuse. The former standalone
review pages and banks remain intact but unlisted. Mixed practice belongs at
each lesson’s end, as in Powers and roots.

## Interaction faults corrected

- Thousands separators are validated, not blindly deleted. `6,000` is valid;
  `0,06` cannot become an accepted answer of `6`.
- The number gaps explicitly request figures. Unreadable-answer guidance also
  names the required form.
- Sandboxes preserve invalid entries rather than silently deleting letters,
  extra decimal points or signs and solving a different calculation.
- Animation cards remain inside their scene while scrolling. They no longer
  move to `body` and lose the lesson’s inherited typography and spacing.
  Native sticky positioning prevents the frame-late movement of JavaScript
  scroll compensation; the regression test measures before the next frame.
- Newly revealed scenes are remeasured. A hidden section must not leave a
  cached zero-height card or zero-sized highlight measurements.

## Repeatable verification

- `written-methods-check.mjs`: independently calculated answers and answer-format contracts.
- `written-methods-browser-check.mjs`: native answer entry, symbol/radio keyboard controls, guided completion, reveal-all, silent restoration and menu progress across all 14 lessons.
- `written-methods-motion-check.mjs`: all 37 animated scenes, sampled before, during and at the end of normal scrolling; stable parent, type, dimensions and horizontal position.
- Repository link, breadcrumb, pairing, panel, notation, glossary, structure and progress checks.
- Voice and rendered text checks for every lesson; rendered text check for the menu.

Also checked invalid/empty input and recovery in the nine editable number
sandboxes, and inspected rendered animation cards. These checks do not replace
a session with real pupils or a screen-reader listening test; neither was
performed in this review. Completion records indicate completed lesson prompts,
not certified mastery.
