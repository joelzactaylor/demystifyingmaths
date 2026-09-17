---
applyTo: "pages/curriculum/**/*.html"
---

# Curriculum pages

This file is a teaching page unless its name starts with `practice`, in which
case it is a practice page. Menus are `index.html` and are generated from the
manifests — do not hand-edit a menu; edit `scripts/gcse-*-manifest.json`.

- **Teaching page:** follow `docs/master-lesson-page-prompt.md` in full and
  write prose to `docs/lesson-prose-voice.md`. Match the written-methods
  reference pages in `pages/curriculum/GCSE/number/structure/writtenMethods/`.
- **Practice page:** follow `docs/master-practice-page-prompt.md` in full. Its
  drill entry in the manifest (`kind`, `learningPages`, `availableAfter`,
  `skill`, `scope`, `tier`, `sections`) is the source of truth for what it asks.
- **Already-working page being improved:** run the passes in
  `docs/lesson-page-cycle.md` in order, fixing each finding as it is found.

Never add `<meta name="viewport">`. Root-absolute URLs carry `/demystifyingmaths/`.
Roots use `.rad`, never `<msqrt>`. Every page loads `js/glossary.js`, and
glossary marks are hand-written once per page in running prose. Heading levels
never skip. Stub scaffolding (author note, "coming soon", TODOs) is removed once
the page holds content. Set `"written": true` (lesson) or `"generate": false`
(drill) in the manifest when the page is finished.
