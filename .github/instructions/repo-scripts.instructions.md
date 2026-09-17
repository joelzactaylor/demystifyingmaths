---
applyTo: "scripts/**"
---

# Repository scripts and manifests

Node built-ins only — no `package.json`, no `node_modules`, and keep it so.

- URLs inside the manifests and the generator are written **without** the
  `/demystifyingmaths/` prefix; it is added at the single point a file is
  written, via `scripts/site-base.mjs`. Do not add it anywhere else.
- `generate-gcse-strand.mjs` rebuilds menus and stubs. It refuses to overwrite
  a file that lacks the `&mdash;coming soon&mdash;` marker, but the manifest
  `written` / `generate` flags are the intended record of finished work and
  must be kept accurate.
- Checkers assert against the arithmetic or the raw markup, not against the
  rendered page: a harness that reads the page and agrees with itself finds
  nothing. Use a raw tag scanner for well-formedness, not a DOM parser that
  silently repairs a stray `</section>`.
- When a check fires, prove it can also fail on purpose before trusting it.

Details: `docs/local-development.md`, and "Writing the checks" in
`docs/lesson-page-cycle.md`.
