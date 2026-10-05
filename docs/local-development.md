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

## Editing pages

Edit the HTML, CSS and JavaScript source files, then reload the browser. The dev
server serves those files unchanged and disables caching. There is no injected
browser editor or source-writing endpoint. DevTools changes are temporary unless
you explicitly save them to source files using your own development setup.

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
node scripts/panel-check.mjs            # only the shared desktop lesson canvas changes width
node scripts/notation-check.mjs         # roots are drawn, and stripped notation still reads true
node scripts/glossary-check.mjs         # glossary terms, definitions, and the marks in the pages
node scripts/structure-check.mjs        # tags balance, headings step by one, ids and ARIA targets exist, inline text does not run together
node scripts/integrated-lesson-check.mjs <lesson.html> # embedded questions mount, validate and unfold correctly
node scripts/written-methods-check.mjs # fixed teaching/review questions and independently calculated answers
node scripts/written-methods-browser-check.mjs # all 14 lessons: native typing, keyboard choices, reveal, reload and menu progress
node scripts/written-methods-motion-check.mjs # normal scrolling: scene position, stable type and card dimensions
node scripts/written-methods-sandbox-check.mjs # invalid input, focus, recovery and independent boundary arithmetic
node scripts/powers-roots-browser-check.mjs # adjustable diagrams, mathematical states and keyboard endpoints
node scripts/lesson-interaction-check.mjs # both blocks: typing/composition, guided flow, reload, reset, recall and menu progress
node scripts/lesson-resilience-check.mjs # both blocks: unavailable storage, no-JS reading, short rails and menu geometry
node scripts/lesson-session-check.mjs # both blocks: drafts, first-unanswered resume, diagram settings and reset cancellation
node scripts/number-revision-check.mjs # optional revision: 46 independently derived answers, parsing, scheduling and scope links
node scripts/number-revision-browser-check.mjs # both reviews: sessions, problems, drafts, support, reset and storage fallbacks
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
and fails page-specific viewport-width queries. `shared.css` owns the fixed ribbon
and legacy 900px floor; `lesson-sections.css` widens authored lessons and reserves
a left rail for their contents panel. `course-menus.css` gives authored menus a
wider desktop canvas without that rail. Neither introduces phone reflow.
`vocab/index.html` is skipped because it has no `.layout`, not because it is
named.

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
Menus are rebuilt unless their HTML contains `data-authored-menu`. That marker
protects hand-designed menus, including Powers and roots and its parent.
Teaching pages and drills still use the stub check above.

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

## Curriculum progress and menu themes

For the approved optional revision sessions and original exam-style problems
in Written methods and Powers and roots, see `number-revision.md`. Their
records and completion are separate from teaching-page progress.

`js/curriculum-progress.js` adds read-only progress bars to curriculum cards.
`navPanel.js` loads it on lessons and most menus; menus without a contents panel
load it explicitly. Lesson completion means all inline questions answered, not
a visit or “Show whole lesson”. Optional reviews never increase lesson counts.
Completed cards have both a green treatment and a text label.
Reviews can be retained without advertising them on a menu: set
`"showInMenu": false` on the drill in its manifest and `data-menu-unlisted` on
the review's body (so the breadcrumb checker knows it is intentionally unlisted).
The generator and pairing
checker honour that choice; the existing review URL and question bank remain.

Records use per-lesson `dm-curriculum-v1:` localStorage keys. The five Powers
and roots lessons also read their saved accepted answers, so existing progress
is retained. Reset clears only that lesson. Progress belongs to the current
browser and origin; clearing browser data removes it. There is no account sync.

Written methods uses fixed teaching answers under
`dm-written-methods-accepted-v1:<lesson>`, reading stops under
`dm-written-methods-reading-v1:<lesson>`, and optional mixed practice under
`dm-written-methods-recall-v1:<lesson>`. Its completion count is rebuilt from
accepted teaching answers, not inherited from an older random question set.
The browser check uses a separate temporary Chrome profile; it does not change
the reader's saved progress. Pass lesson basenames to check a smaller set, for
example `node scripts/written-methods-browser-check.mjs placeValue columnAddition`.

Written methods now follows Powers and roots: fixed mixed questions sit at each
lesson's end. The three former standalone review pages and their banks remain
as unlisted source material (`showInMenu: false`), not part of the new menu.

Written-method animation cards stay inside their scene throughout scrolling.
Native CSS sticky positioning holds them steady; do not compensate for scrolling
with JavaScript `top` updates, which lag behind fast scrolling. The lesson body
clips horizontal overflow without creating a separate scrolling container.
Moving cards onto `body` loses lesson typography and spacing. Guided reveals
also change previously hidden scene dimensions: the lesson adapter observes
those dimensions and emits `lessonlayoutchange` to remeasure the drawings.
Test ordinary motion as well as reduced motion; static screenshots cannot
detect a zero-height cached measurement or a style change while pinning. The
motion check also measures immediately after scroll jumps, before JavaScript
can correct a misplaced card.

The motion check accepts lesson basenames and `TEST_WIDTH` / `TEST_HEIGHT`
environment variables for short or narrow desktop checks. All browser checks
use temporary profiles, leaving the reader's saved answers untouched.

The 19 authored Written methods and Powers and roots lessons load
`js/lesson-session.js` before their diagram scripts. It saves unfinished teaching
answers and diagram controls under `dm-lesson-session-v1:<pathname>` (including
the site prefix). Restore controls before diagrams initialise; do not replay
input events to restore drafts, as that could grade an unfinished answer.
Mixed-practice records keep `answers` and `accepted` separately for the same
reason. Older validated mixed-practice answers are preserved on migration.

The subtopic menu's returning-learner link adds `?resume=1`: this reveals and
focuses the first unanswered gap with preceding context visible. An explicit
heading hash takes precedence. Reset uses a native confirmation before any
store is cleared; cancelling must preserve answers, drafts and diagram state.
Keep the confirmation listener on window capture, ahead of the existing
document-level reset listeners. Reset is local to the current lesson.

`js/curriculum-progress-catalog.json` lists lesson URLs (including future
lessons) and menus. After adding or publishing lessons, refresh this generated
data—not lesson HTML—with:

```sh
node scripts/curriculum-progress-catalog.mjs > js/curriculum-progress-catalog.json
node scripts/curriculum-progress-check.mjs
```

`css/course-menus.css` supplies the authored-menu layout; `css/blended-course-menus.css`
restores the site's framed gutters, patterned headers and rounded shapes on the
two opted-in menus. The Structure and
calculation cards use original SVG images in `images/curriculum/`; their colours
match the subtopic palette in `js/curriculum-progress.js`. Higher menus keep
their existing design. Bars are statuses, not adjustable sliders, and each has
a descriptive accessible label.
