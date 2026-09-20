# Local development

## Start the dev server

```sh
node scripts/serve.mjs          # http://localhost:8000/demystifyingmaths/pages/home.html
node scripts/serve.mjs 8080     # or pick a port
```

Leave it running in its own terminal; stop it with Ctrl-C. It needs no
dependencies — just Node. An agent that starts it for a check leaves it up
afterwards: the person reviewing the page in a browser is looking at the same
server, and killing it after a screenshot takes their page down.

Run it from a terminal you own. Started from inside another tool's session it
gets reaped when that session ends, and the site then dies with
`ERR_CONNECTION_REFUSED` — which looks like a broken site rather than a stopped
server.

If the port is taken, the server says so and suggests the next one:

```sh
node scripts/serve.mjs 8001
lsof -nP -iTCP:8000 -sTCP:LISTEN   # what is holding the port
```

## Editing the page in the page (temporary)

While it is served by `scripts/serve.mjs`, every teaching page — the lessons
under `pages/curriculum/` that are not `practice*.html` or a menu, and the
extracurricular pages — carries an editor. A small panel at the right of the
window holds its switch (remembered across pages). While it is on, hover any
text and a pencil appears at the right edge of its block; click it, or
Alt+click the text, and the block is editable where it stands. Enter or a
click elsewhere saves, Escape cancels, and the notice a save leaves offers an
undo. An SVG or MathML label opens a small box over itself instead.

The panel shows the page's elements as a tree, opened on demand like the
Elements panel in devtools: a row names the element and shows a glance of its
own text, greyed when a script drew it; clicking a row selects the element on
the page, double-clicking edits it, hovering outlines it. Selecting a block on
the page opens the tree to it. Below the tree are **Delete** for the selected
element and **Insert** of a paragraph, heading, list item, list, section,
important box or any markup you type, before or after the selected element or
inside it at the end. A new block is written with the indentation
and blank lines its neighbours use, and opens for editing with its placeholder
text selected.

A save writes the source file as the smallest change that gives the new text —
a changed word is a changed word in the file, with the entities, tags and line
breaks around it left as they were — so the edit shows up in `git diff` like
one made in an editor. Typed `—`, `×`, `÷`, `−` and the like are written as
the named entities the pages use. Text is looked for in the page's HTML, then
in the embeds it fetched (the ribbon), then in the scripts it loads: a caption
a scene draws is a string literal in `js/<page>.js`, and is written there, as
is the static placeholder in the page when it says the same thing. In a
template literal the fixed parts can be edited and the `${…}` parts cannot.
After an edit to a script the page's running copy still holds the old text
until it reloads; the notice says so and offers the reload.

A pencil appears only on text a file actually holds. Text a script computes —
a digit in a scene, a total — gets none. The server refuses a save if the file
has changed since the page was loaded, so reload after editing a file in VS
Code.

Nothing is in the pages: the tag is injected by the server as a page goes out,
so a deployed page never sees it. It lives in `scripts/inline-edit.mjs` (the
route and the injection) and `scripts/inline-edit-client.js` (the page side).
To remove it, delete those two files and the lines in `serve.mjs` that import
and call `inject` and `route`, then delete this section. The server must be
restarted to pick the editor up.

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
node scripts/structure-check.mjs        # tags balance, headings step by one, ids and ARIA targets exist, inline text does not run together
node scripts/voice-check.mjs <page>     # the sentences a script can suspect — lines to read, not verdicts
node scripts/text-check.mjs <page>      # rendered type sizes and text that crosses a box edge — needs the server and Chrome
```

`structure-check.mjs` reads the source raw rather than through a DOM parser,
because a parser repairs a stray `</section>` before any check can see it. It
fails a closer that closes the wrong element, a heading level that skips one, a
duplicate `id`, an `aria-labelledby` or `aria-describedby` pointing nowhere, and
inline text that runs together once styles are gone — a slip's `<b>` label
butting its `<span>` body reads "indexChoosing" to a screen reader. Block
boundaries are not joins: `</h3><p>` breaks the line whatever the styles say.

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

`text-check.mjs` is the one check that renders: it launches Chrome headless,
loads the served page at the 900px canvas under reduced motion, and measures
every visible text run inside `.layout` as the reader sees it — computed size
times any CSS transform, or times the viewBox scale for SVG text — so a
10-unit label in a 920-unit drawing shown at 800px reports as 8.7px, which is
what it is. It fails text under 12px and text that crosses the edge of a
clipping, bordered or filled ancestor, an SVG viewport or the rect drawn as
its cell; it lists 12–14px text to be read against the floor in
`master-lesson-page-prompt.md` ("Type has a floor"). It sees only the docked
state: drive a sandbox to its widest input or a drawing to a hidden stage by
hand (below) and look. It leaves alone, on purpose, the fixed ribbon, visually
hidden text, the body of a closed `<details>`, text painted transparent, and
three shared marks whose size is a decision recorded in the script's header.
Set `CHROME` if Chrome is not at its usual path and `SITE_ORIGIN` if the
server is not on port 8000.

## Rendering a page without a browser window

Nothing visual is asserted by the scripts, and the rendered pass is the one
that finds the figure faults — a line through a cell, a sign floating in an
empty column, an index wrapped to a second line. Headless Chrome renders the
served page from the command line, with the server running:

```sh
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
URL="http://localhost:8000/demystifyingmaths/pages/curriculum/…/page.html"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --force-prefers-reduced-motion --window-size=1000,6000 \
  --virtual-time-budget=3000 --screenshot=page.png "$URL"
```

`--force-prefers-reduced-motion` matters: it docks every scroll-led scene at
its final stage, so one tall capture shows every static state. Without it a
scene's travel is measured in viewport heights, and a 6000px window turns each
one into a blank stretch of page. Crop the capture with `sips -c <h> <w>
--cropOffset <y> <x>` and look at the crops one by one.

To see a scene at a given stage, make a throwaway copy of the page's script
whose reduced-motion branch paints a fraction from the query string instead of
`1` — `paint(Number(new URLSearchParams(location.search).get("f") || 1))` and
`model.paint(parts, shown)` in place of the `reduceMotion.matches ? last :
shown` choice — point a throwaway copy of the page at it, and capture
`?f=0.13`, `?f=0.27`, … one per stage. Delete both copies before the
repository pass; `git status` should not know they existed.

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
