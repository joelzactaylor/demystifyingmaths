---
applyTo: "js/**/*.js"
---

# Page scripts

One script per page, named after the page, plain browser JavaScript with no
bundler and no imports from outside the repo.

- Scroll-led scenes: the drawing begins blank and each mathematical step is
  drawn as the reader scrolls, with a stationary reading interval at every
  stop. No Next/Back/Play controls. Ease changes; do not snap classes.
- Live examples update on every valid input with no Build button. Update
  existing nodes in place — never rebuild or reparent the card holding a
  focused input. Preserve focus, caret and scroll position. Reserve stable
  space so the page does not jump.
- A refused input hides the working; it does not leave the last good answer
  standing. Test exact answers, both ends of the range, one past each end,
  empty, letters, mixed, a leading zero.
- Every number the script draws must be computed from the mathematics, not
  copied from the page. Notation the script builds at run time must still read
  correctly with styles stripped (`2^5` not `25`, `√49 = 7` not `49 = 7`).
- `node --check js/<page>.js` before finishing. Full brief in
  `docs/master-lesson-page-prompt.md` ("Make animations teach rather than
  decorate", "Make live examples robust").
