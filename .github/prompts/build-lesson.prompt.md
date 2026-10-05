---
agent: agent
description: Build a Demystifying Maths teaching page from its stub, following the master lesson prompt to completion.
---

Read and execute [docs/master-lesson-page-prompt.md](../../docs/master-lesson-page-prompt.md)
in full, writing prose to [docs/lesson-prose-voice.md](../../docs/lesson-prose-voice.md),
with `<TARGET>` set to `${input:target:pages/curriculum/GCSE/.../page.html — leave blank for the next unwritten lesson}`.

If no target is given, select the next unwritten teaching page after the most
recently completed one: a teaching page in `pages/curriculum/` that still
carries the `&mdash;coming soon&mdash;` stub marker, whose manifest entry in
`scripts/gcse-*-manifest.json` is not `"written": true`.

Treat the prompt as the complete brief. Read the positiveAndNegativeRoots
prototype and its CSS/JS; use written-method references only for relevant
arithmetic diagrams. Continue until every review and
validation gate in the prompt passes and every checker in
[AGENTS.md](../../AGENTS.md) is green. Do not stop at a first draft, and do not
report findings without fixing them.
