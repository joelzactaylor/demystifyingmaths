---
agent: agent
description: Build a Demystifying Maths mixed-review page, following the master practice prompt to completion.
---

Read and execute [docs/master-practice-page-prompt.md](../../docs/master-practice-page-prompt.md)
in full, with `<TARGET>` set to `${input:target:pages/curriculum/GCSE/.../practicePage.html — leave blank for the next unwritten mixed review}`.

If no target is given, select an unwritten manifest entry with `kind: review`
whose prerequisite lessons are complete. Do not create a paired lesson drill:
lesson-specific questions belong inside the teaching page.

Its drill entry in `scripts/gcse-*-manifest.json` is the source of truth for
`kind`, `learningPages`, `availableAfter`, `skill`, `scope`, `tier` and
`sections`. Read every linked learning page before writing a question. Continue
until every review and validation gate passes and every checker in
[AGENTS.md](../../AGENTS.md) is green.
