---
applyTo: "css/**/*.css"
---

# Page stylesheets

One stylesheet per page, named after the page. Shared rules live in
`css/shared.css` (layout, ribbon) and `css/curriculum.css`; do not add
page-specific rules there.

- **No `@media (max-width: …)` reflow rules** outside `shared.css`. The
  `.layout` panel is a hard 900px that `shared.css` scales with a transform;
  width breakpoints never fire on a phone and reflow a narrowed desktop window
  the browser is only shrinking. `scripts/panel-check.mjs` fails them.
- No viewport-relative font sizes.
- Teaching pages use the blue palette, practice pages the ochre one. The exact
  values are the table under "Match the written-methods house style exactly"
  in `docs/master-lesson-page-prompt.md`. Use those; do not invent near-misses.
- Numerals, set-outs and inputs: `ui-monospace, "SFMono-Regular", Menlo,
  Consolas, monospace` with `font-variant-numeric: tabular-nums`.
- The gold highlight frame is painted *behind* the marks it lights: frame
  `z-index: 0`, marks `position: relative; z-index: 1`. See `longDivision.css`.
- Respect `prefers-reduced-motion` with a complete static state.
