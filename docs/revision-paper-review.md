# Paper-question acceptance review

Act as a sceptical student and a print-layout reviewer, not the author defending
the implementation. Compare the rendered question with the Edexcel reference
recorded in revision-question-sources.md. Fix failures before repeating the pass.

- The dotted answer line is the actual editable answer location. No second
  answer box, duplicate currency sign or repeated units elsewhere.
- The renderer supplies the input coordinates. Never guess offsets separately
  in CSS, and never position against the whole question including its controls.
- Blank, focused, wrong, edited, accepted and restored answers occupy the same
  location. Accepted text stays green after blur; no layout jump or added badge.
- A blank field makes the required numerical format clear. Its accessible
  label and question description survive image rendering and image failure.
- Check, Continue, Previous, solution and Reset remain keyboard-accessible.
  Incorrect input cannot advance; solutions must still provide a way forward.
- Inspect short questions, long problems, roots, powers, currency and units.
  Check answer-line alignment numerically, not just input containment.
- Reload partial and completed sessions; verify saved answers and progression.
- Test unavailable Canvas and failed images. The HTML question and answer field
  must become readable together, with no invisible absolute-positioned field.
- Keep original authorship and indicative marks clear in the footer, without
  putting administrative prose back above the question.

Run the arithmetic, browser, rendered-type and repository checks. Inspect actual
screenshots after the final edit. Do not equate passing scripts with visual
quality or claim real screen-reader testing from DOM checks.
