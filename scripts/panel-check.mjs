/* Nothing that sits in the fixed panel may reflow on the viewport.

   `.layout` is a hard 900px panel, and shared.css scales it with a transform
   below 900px. A phone with no <meta name="viewport"> falls back to a 980px
   virtual viewport and shrinks the whole page uniformly, which is what makes the
   layout identical everywhere, only smaller.

   Two things break that, and this check catches both:

   - A viewport meta tag opts the page out of the scaling. The 900px layout is
     then laid out inside a 390px viewport and the page renders enormous and
     clipped.
   - A width media query in a stylesheet that panel loads reflows the content
     inside a panel the browser is only making smaller. On a phone it never
     fires at all, because the viewport reports 980px; on a narrowed desktop
     window it produces a layout no phone reader ever sees.

   shared.css is exempt: its width queries govern .top-ribbon, which is
   position:fixed and therefore genuinely lives in the real viewport.

   vocab/index.html is the one page outside all of this — a standalone unlisted
   tool with its own responsive stylesheet, no .layout and a viewport of its own.
   It is skipped by the same test that finds everything else, rather than by
   name: a page without .layout is not in the panel. */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const ROOT = dirname(dirname(new URL(import.meta.url).pathname));
const EXEMPT = new Set(["css/shared.css"]);

const pages = [];
const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith(".html")) pages.push(full);
    }
};
for (const start of ["pages", "vocab", "embed", "extra"]) {
    if (existsSync(join(ROOT, start))) walk(join(ROOT, start));
}
for (const loose of ["index.html", "404.html"]) {
    if (existsSync(join(ROOT, loose))) pages.push(join(ROOT, loose));
}

const problems = [];
const owners = new Map();
let panelPages = 0;

for (const page of pages) {
    const html = readFileSync(page, "utf8");
    const name = relative(ROOT, page);
    const inPanel = /class="layout"/.test(html);
    const hasViewport = /<meta[^>]+name=["']viewport/i.test(html);

    if (inPanel && hasViewport) {
        problems.push(`${name}: sits in the 900px panel and declares a viewport meta tag`);
    }
    if (!inPanel) continue;
    panelPages += 1;

    for (const match of html.matchAll(/(?:href|src)="[^"]*?(css\/[\w.-]+\.css)"/g)) {
        if (EXEMPT.has(match[1])) continue;
        if (!owners.has(match[1])) owners.set(match[1], new Set());
        owners.get(match[1]).add(name);
    }
}

for (const [sheet, users] of [...owners].sort()) {
    const path = join(ROOT, sheet);
    if (!existsSync(path)) continue;
    const css = readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, " ");
    const hits = css.match(/@media[^{]*(?:max|min)-width[^{]*\{/g) || [];
    if (!hits.length) continue;
    const sample = [...users].sort().slice(0, 3).join(", ");
    problems.push(`${sheet}: ${hits.length} width media quer${hits.length === 1 ? "y" : "ies"}`
        + ` in a stylesheet the fixed panel loads (${sample}${users.size > 3 ? ", …" : ""})`);
}

if (problems.length) problems.forEach((problem) => console.log(problem));
console.log(`\n${panelPages} pages in the fixed panel, ${owners.size} stylesheets they load; ${problems.length} problems.`);
process.exit(problems.length ? 1 : 0);
