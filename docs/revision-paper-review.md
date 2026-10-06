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
- On screen, the question remains a distinct white sheet with a subtle square
  edge. The edge and shadow disappear in print rather than becoming part of the
  examination paper.
- The question wording states the required numerical format where ambiguity is
  possible; the blank answer line stays visually empty. Its accessible label
  and question description survive image rendering and image failure.
- Check, Continue, Previous, solution and Reset remain keyboard-accessible.
  Incorrect input cannot advance; solutions must still provide a way forward.
- Continue moves semantic focus to the next heading and gives sighted keyboard
  users a visible outline around the newly active paper. Completion focus is
  visible too.
- Inspect short questions, long problems, roots, powers, currency and units.
  Check answer-line alignment numerically, not just input containment.
- Reload partial and completed sessions; verify saved answers and progression.
- After checking a correct answer without working, add and erase ink: the state
  must move between “working needs review” and “working required” without
  changing marks earned from unchanged typed equations.
- Repeat with an incorrect final answer and unrecognised working. The final
  accuracy mark must remain a red cross, while possible method credit remains
  amber and “not verified”, never a second definite error.
- Test unavailable Canvas and failed images. The HTML question and answer field
  must become readable together, with no invisible absolute-positioned field.
- Print with a solution open and marking visible. Every question should print,
  but solutions, feedback, ticks, controls and answer-state colours must not.
- Print while an empty working field has focus. Its placeholder, editor border
  and controls must disappear, while genuine typed working and ink remain.
- Keep original authorship and the automated-marking boundary clear in the
  footer, without putting administrative prose back above the question. The
  displayed allocations belong to these original questions; never imply that
  they are an official exam-board scheme.

Run the arithmetic, browser, rendered-type and repository checks. Inspect actual
screenshots after the final edit. Do not equate passing scripts with visual
quality or claim real screen-reader testing from DOM checks.
