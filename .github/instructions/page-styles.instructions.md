---
applyTo: "css/**/*.css"
---

# Page stylesheets

One stylesheet per page, named after the page. Shared rules live in
`css/shared.css` (layout, ribbon) and `css/curriculum.css`; do not add
page-specific rules there.

- Desktop geometry belongs in `lesson-sections.css`; page-specific styles
  must not add viewport-width reflow rules. Phones are not an authoring target.
- No viewport-relative font sizes.
- Follow the current style section of `docs/master-lesson-page-prompt.md` and
  the roots prototype. Do not maintain a second palette here.
- Inline expressions and answer blanks inherit the sentence font and baseline.
  Reserve monospace and tabular numerals for aligned calculations.
- The gold highlight frame is painted *behind* the marks it lights: frame
  `z-index: 0`, marks `position: relative; z-index: 1`. See `longDivision.css`.
- Respect `prefers-reduced-motion` with a complete static state.
