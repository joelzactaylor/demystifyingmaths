# Working on Demystifying Maths

Static site, no build step, no `package.json`, no `node_modules`. Every script
in `scripts/` runs on Node's built-ins alone; keep it that way. Deployed to
GitHub Pages under the prefix `/demystifyingmaths/`, which is why every
root-absolute URL in a page carries it.

The detailed briefs live in `docs/`. **Read the one for the task before writing
anything** — the rules there were learned from real faults and a page that
ignores them fails review.

## Which doc for which task

| Task | Read first | Then |
| --- | --- | --- |
| Build a teaching (lesson) page | `docs/master-lesson-page-prompt.md` | `docs/lesson-prose-voice.md`, then the written-methods reference pages |
| Build a practice page | `docs/master-practice-page-prompt.md` | the paired lesson, and its drill entry in the manifest |
| Audit / improve a page that already works | `docs/lesson-page-cycle.md` | `docs/lesson-prose-voice.md` |
| Write or edit prose on any lesson | `docs/lesson-prose-voice.md` | `node scripts/voice-check.mjs <page>` |
| Run the site, run the checks, regenerate stubs | `docs/local-development.md` | — |
| What a given page must cover | `docs/syllabus-coverage.md` — **600 KB; grep for the page path, never read it whole** | the `coverNote` in `scripts/gcse-*-manifest.json` |

Teaching pages are `pages/curriculum/**/<name>.html`; practice pages are the
`practice*.html` files beside them. The reference implementation of the
teaching-page style is `pages/curriculum/GCSE/number/structure/writtenMethods/`
(`columnAddition.html`, `longDivision.html` and their CSS in `css/`, JS in `js/`).
A new page must be indistinguishable from those.

## Hard rules (the ones that break the site)

- **No `<meta name="viewport">` on any page.** The layout is a fixed 900px canvas
  that the browser scales; a viewport tag opts the page out and it renders
  enormous on a phone. No `@media (max-width: …)` reflow rules either.
- **Root-absolute URLs carry the prefix**: `/demystifyingmaths/css/shared.css`,
  never `/css/shared.css`. Inside the manifests and the generator they are
  written *without* it; the prefix is added at the single point a file is
  written (`scripts/site-base.mjs`).
- **The generator can destroy work.** `node scripts/generate-gcse-strand.mjs`
  rebuilds stubs and menus from the manifests. It skips any file without the
  `&mdash;coming soon&mdash;` marker, but set `"written": true` on a finished
  lesson and `"generate": false` on a finished drill in the manifest as well.
  Never run it to "refresh" a page you have been editing.
- **Keep changes to the target page, its own CSS/JS, and its manifest flag.**
  Do not touch neighbouring lessons, the paired practice page, or shared CSS
  unless explicitly asked. Preserve unrelated uncommitted changes in the tree.
- **Teaching pages are blue, practice pages are ochre.** Never import a colour,
  radius or control style from the other kind. The palette is in
  `docs/master-lesson-page-prompt.md` under "Match the written-methods house
  style exactly" — use those values, not near-misses.
- **Never write a false statement because the true one is out of scope.**
  "x² = −9 has no solution" is false; "no number on the number line squares to
  −9" is true. Scope the claim, don't break it.
- **Prose describes mathematics, never the page.** No "drag to rotate", no "the
  slider below", no "this section will show". If an interaction needs a
  sentence of instruction, the interaction is wrong.
- **Roots are drawn with `.rad`, never `<msqrt>` and never a bare `&radic;`
  over a radicand.** Powers use `<sup>` with its clipped marker so that `2^5`
  never flattens to `25` when styles are stripped.
- **Glossary marks are written by hand**, once per page, in running prose only:
  `<span class="gloss" data-term="quotient">quotient</span>`. Every curriculum
  page loads `js/glossary.js`.
- **Only real mistakes go in `.slips`.** Each entry names an error a pupil
  actually makes and the wrong answer it produces. No straw men, no quota.

## Before you say a page is done

Run every one of these and read what they print:

```sh
node --check js/<page>.js
node scripts/linkcheck.mjs
node scripts/breadcrumb-check.mjs
node scripts/practice-pairing-check.mjs
node scripts/panel-check.mjs
node scripts/notation-check.mjs
node scripts/glossary-check.mjs
node scripts/voice-check.mjs pages/curriculum/…/<page>.html   # lines to read, not verdicts
git diff --check
```

Then the review passes in `docs/lesson-page-cycle.md` — teacher, voice,
contrivance, figure, fallback, interaction, repository — fixing each finding
in the pass that finds it. Recompute every number on the page from the claim,
in a script; do not read the page's numbers back and agree with them.

Done means: every check green, every finding fixed, and one full pass that
looked and found nothing.

## Local server

```sh
node scripts/serve.mjs      # http://localhost:8000/demystifyingmaths/pages/home.html
```

Not `python3 -m http.server`, not Live Server on this folder: they serve at `/`
and every prefixed asset 404s. See `docs/local-development.md`.
