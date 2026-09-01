# Local development

## Start the dev server

```sh
node scripts/serve.mjs          # http://localhost:8000/demystifyingmaths/pages/home.html
node scripts/serve.mjs 8080     # or pick a port
```

Leave it running in its own terminal; stop it with Ctrl-C. It needs no
dependencies — just Node.

Run it from a terminal you own. Started from inside another tool's session it
gets reaped when that session ends, and the site then dies with
`ERR_CONNECTION_REFUSED` — which looks like a broken site rather than a stopped
server.

If the port is taken, the server says so and suggests the next one:

```sh
node scripts/serve.mjs 8001
lsof -nP -iTCP:8000 -sTCP:LISTEN   # what is holding the port
```

## Why not `python3 -m http.server` or Live Server?

The site is deployed to GitHub Pages as a **project site**, so it is served from
a sub-path:

```
https://joelzactaylor.github.io/demystifyingmaths/
```

Every root-absolute URL in the pages therefore carries that prefix
(`/demystifyingmaths/css/shared.css`, not `/css/shared.css`). The prefix is
defined once, in `scripts/site-base.mjs`.

A plain static server pointed at this folder publishes it at `/`, so
`/demystifyingmaths/...` resolves to nothing and every stylesheet, script,
favicon and embed 404s while the HTML itself loads. `scripts/serve.mjs` mounts
the repo at the prefix instead, so local URLs are identical to production ones.

If you prefer the VS Code **Live Server** extension, point it at the *parent*
directory of this repo rather than the repo itself — the folder is already named
`demystifyingmaths`, so the paths then line up.

Netlify serves the same markup: `netlify.toml` rewrites `/demystifyingmaths/*`
back to the repo root.

## Checks

```sh
node scripts/linkcheck.mjs              # every local href/src resolves, and carries the base prefix
node scripts/breadcrumb-check.mjs       # breadcrumb trails are consistent
node scripts/practice-pairing-check.mjs # lessons and drills line up with the manifests
node scripts/panel-check.mjs            # nothing in the fixed 900px panel reflows on the viewport
node scripts/notation-check.mjs         # roots are drawn, and stripped notation still reads true
node scripts/glossary-check.mjs         # glossary terms, definitions, and the marks in the pages
```

`linkcheck.mjs` fails a link that is root-absolute but *missing* the prefix, which
is the regression that breaks the deployed site while looking fine locally.

`panel-check.mjs` fails a page in `.layout` that declares a `<meta name="viewport">`,
and a stylesheet that page loads which carries an `@media (max-width: …)`. Both
break the fixed-canvas layout: the panel is a hard 900px that `shared.css` scales
with a transform, so a phone reporting a 980px viewport never fires a breakpoint,
and a narrowed desktop window reflows content the browser is only shrinking.
`shared.css` is exempt — its width queries govern the `position: fixed` ribbon,
which really does live in the viewport. `vocab/index.html` is skipped because it
has no `.layout`, not because it is named.

`notation-check.mjs` also fails a bare `&radic;` written over a radicand — the
glyph has no bar, so it does not say how far the root reaches — and a dash
standing directly against notation, which reads as a sign: `Wrong idea &mdash;
&radic;49 = &plusmn;7` and `Base &mdash; 2` both put a dash where a minus could
be, so a label introducing mathematics ends in a colon instead. Attribute
values, generated card descriptions and stub author notes are exempt from the
bare-radical rule, because a drawn radical cannot go in any of them.

`notation-check.mjs` fails an `<msqrt>` on a teaching page — a root is drawn with
`.rad`, because `<msqrt>` is laid out from a font's OpenType MATH table and macOS
ships no font that has one — and fails a `<sup>` or a `.rad` missing its clipped
marker, which is what keeps `2^5` from flattening to twenty-five and `√49 = 7`
from flattening to the false `49 = 7`.

`glossary-check.mjs` guards the term list and the marks. A mark is a
`<span class="gloss" data-term="quotient">quotient</span>` written into a page's
prose; `js/glossary.js` supplies the definition and the hover card. The checker
fails a definition that is too short, too long for the card, carries markup or
does not end in a full stop; a mark naming a term with no definition; the same
term marked twice on one page; and a mark that has ended up inside a heading, a
link, a bold label or notation, where a hover card does not belong. It also
fails a curriculum page that does not load `js/glossary.js`, and a generator
that would emit one.

The marks are written by hand, which is the point. They used to be found by a
scanner at load time, and the rules that scanner needed grew with every page:
"mean" is nearly always the ordinary verb, "round" is a quiz round on the
practice pages and an adverb in "the wrong way round", "the difference is in
what the columns are for" is not the difference of two squares, "the digits
keep their identity" is not an algebraic identity, "a sequence of smaller
divisions" is not a sequence. Each needed its own exception, and an exception
list is a worse reader than a reader. Four words are still kept out of the term
list entirely — `mean`, `range`, `carry`, `solve` — because their everyday sense
is the one these pages use everywhere, so no marking of them could be right.

```sh
node scripts/glossary-mark.mjs                    # what it would propose, everywhere
node scripts/glossary-mark.mjs --write <page>     # write those marks into one page
```

`glossary-mark.mjs` is an authoring tool, not a build step: it proposes marks
for a page that has none, leaves existing marks untouched, and what it produces
is meant to be read and edited. It skips headings, links, bold, notation,
controls and any region a page's own script repaints, and it will not mark a
term the page's own heading names — but it cannot tell which sense of a word a
sentence is using, so its output is a draft.

## Generated pages

**The generator never overwrites a page that holds work.** `write()` in
`scripts/generate-gcse-strand.mjs` reads the file it is about to replace and
leaves it alone unless it carries the stub marker `&mdash;coming soon&mdash;`.
Menus are pure derivations of the manifest and are always rebuilt; teaching
pages and drills are not.

That check is against the file, not against the manifest, and the difference
matters. The manifest's `written` and `generate` flags are a record of which
pages hold work, kept by hand, and a page finished without its flag being set is
invisible to them. Running the generator then replaces a finished lesson or
drill with a stub — and if the work was never committed, nothing in git, no
local snapshot and no browser cache will bring it back. Fourteen finished
practice pages were destroyed that way, and every one of them had
`"generate": true` sitting in the manifest exactly as the day they were stubs.

Set `"generate": false` on a drill once it is written, and `"written": true` on
a teaching page, so the generator skips them by intent as well. The file check
is the backstop for the day someone forgets.


`scripts/generate-gcse-strand.mjs` rebuilds the GCSE strand pages from
`scripts/gcse-*-manifest.json`. URLs inside the manifests and the generator are
written **without** the prefix; it is added at the single point where a file is
written (and stripped again when the checkers read pages back). Keep it that way
— it is the reason the prefix lives in exactly one place.
