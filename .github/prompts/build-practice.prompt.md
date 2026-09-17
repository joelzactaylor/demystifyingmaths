---
mode: agent
description: Build a Demystifying Maths practice page from its stub, following the master practice prompt to completion.
---

Read and execute [docs/master-practice-page-prompt.md](../../docs/master-practice-page-prompt.md)
in full, with `<TARGET>` set to `${input:target:pages/curriculum/GCSE/.../practicePage.html — leave blank for the next unwritten drill}`.

If no target is given, select the unwritten practice page paired with the most
recently completed teaching page: a `practice*.html` in `pages/curriculum/` that
still carries the `&mdash;coming soon&mdash;` stub marker.

Its drill entry in `scripts/gcse-*-manifest.json` is the source of truth for
`kind`, `learningPages`, `availableAfter`, `skill`, `scope`, `tier` and
`sections`. Read every linked learning page before writing a question. Continue
until every review and validation gate passes and every checker in
[AGENTS.md](../../AGENTS.md) is green.
