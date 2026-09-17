---
mode: agent
description: Run the full audit cycle on a lesson page that already works, fixing every finding in the pass that finds it.
---

Run the cycle in [docs/lesson-page-cycle.md](../../docs/lesson-page-cycle.md)
on `${input:target:pages/curriculum/GCSE/.../page.html}`, judging prose against
[docs/lesson-prose-voice.md](../../docs/lesson-prose-voice.md).

Take the passes in order — measure, teacher, voice, contrivance, figure,
fallback, interaction, repository — and **fix each finding in the pass that
finds it**; an audit that reports without fixing has done half a job.
Recompute every number on the page in a script from the claim, not from the
page. Run `node scripts/voice-check.mjs <page>` and read every line it prints.

Finish with every checker in [AGENTS.md](../../AGENTS.md) green and one full
pass that looked and found nothing.
