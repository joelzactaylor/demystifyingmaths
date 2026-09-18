# Copilot instructions for Demystifying Maths

`AGENTS.md` at the repository root is the canonical brief; this file is the same
rules compressed so they reach every request. If they ever disagree, `AGENTS.md`
wins.

## Before writing a page, open and follow the doc for the task

- Teaching (lesson) page → `docs/master-lesson-page-prompt.md`, then `docs/lesson-prose-voice.md`
- Practice page → `docs/master-practice-page-prompt.md`
- Auditing a page that already works → `docs/lesson-page-cycle.md`
- Running the site or the checks → `docs/local-development.md`
- What a page must cover → grep `docs/syllabus-coverage.md` for the page path (it is 600 KB — never read it whole), and the `coverNote` in `scripts/gcse-*-manifest.json`

The reference implementation of the teaching-page style is
`pages/curriculum/GCSE/number/structure/writtenMethods/` (`columnAddition.html`,
`longDivision.html`, their CSS in `css/` and JS in `js/`). A new page must be
indistinguishable from those. Do not invent a layout, palette or interaction
pattern from scratch.

## Hard rules

- Static site, no build, no dependencies. Scripts use Node built-ins only.
- **Never add `<meta name="viewport">`** and never add `@media (max-width: …)`
  reflow rules. The layout is a fixed 900px canvas the browser scales.
- Root-absolute URLs carry the prefix: `/demystifyingmaths/css/shared.css`,
  never `/css/shared.css`.
- Never run `scripts/generate-gcse-strand.mjs` to refresh a page being edited;
  it rebuilds stubs and can overwrite work. Set `"written": true` on a
  finished lesson and `"generate": false` on a finished drill in the manifest.
- Change only the target page, its own CSS and JS, and its manifest flag.
  Leave neighbouring pages, the paired practice page and shared CSS alone.
- Lesson pages are blue (`#09539d`), practice pages are ochre. Use the palette
  table in `docs/master-lesson-page-prompt.md`; never mix the two identities.
- Never write a false statement because the true one is out of scope. Scope
  the claim ("no number on the number line squares to −9"), don't break it.
- Prose describes mathematics, never the page or its controls. No "drag to",
  no "the slider below", no "this section will show".
- Roots are drawn with `.rad`, never `<msqrt>`, never a bare `&radic;` over a
  radicand. Powers use `<sup>` with its clipped marker.
- Glossary marks are hand-written, once per page, in running prose only:
  `<span class="gloss" data-term="quotient">quotient</span>`.
- Only real pupil mistakes go in `.slips`, each with the wrong answer it produces.
- Scroll-led scenes start blank and draw as the reader scrolls; no Next/Play
  buttons. Live examples update in place on every valid input; no Build button.
  Respect `prefers-reduced-motion`.

## Before saying a page is done

```sh
node --check js/<page>.js
node scripts/linkcheck.mjs
node scripts/breadcrumb-check.mjs
node scripts/practice-pairing-check.mjs
node scripts/panel-check.mjs
node scripts/notation-check.mjs
node scripts/glossary-check.mjs
node scripts/structure-check.mjs
node scripts/voice-check.mjs <page>
git diff --check
```

Then the review passes in `docs/lesson-page-cycle.md`, fixing each finding as
it is found. Recompute every number on the page in a script; do not read the
page's numbers back and agree with them. Done means every check green and one
full pass that finds nothing.
