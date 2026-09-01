/* The glossary: its terms, its definitions, and the marks in the pages.

   The marks are written into the markup by hand, so this cannot judge whether a
   word was worth marking — only a reader can. What it can do is catch the
   things a hand keeps getting wrong: a mark naming a term that no longer
   exists, the same term marked twice on one page, and a mark that has ended up
   somewhere a hover card does not belong — a heading, a link, a bold label, or
   inside notation. */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const ROOT = dirname(dirname(new URL(import.meta.url).pathname));
const source = readFileSync(join(ROOT, "js/glossary.js"), "utf8");

/* Words kept out of the term list, because their everyday sense is the one
   these pages nearly always use and a definition of the other would be a
   distraction wherever it appeared: "mean" is the ordinary verb 19 times over
   ("what the base and index mean"), "range" is "a range of possible values",
   "carry" is "how many figures an answer should carry", and "solve" is "does
   not solve a transport problem". They are barred from the list rather than
   from the pages, since a term nobody can define usefully is not a term. */
const AMBIGUOUS = ["mean", "range", "carry", "solve"];

const problems = [];
const say = (ok, message) => { if (!ok) problems.push(message); };

const entries = [...source.matchAll(/^    "([^"]+)": "((?:[^"\\]|\\.)*)",?$/gm)].map((m) => [m[1], m[2]]);
say(entries.length > 20, `only ${entries.length} terms parsed from js/glossary.js`);

const seen = new Set();
for (const [term, definition] of entries) {
    if (seen.has(term)) say(false, `"${term}" is defined twice`);
    seen.add(term);
    say(term === term.toLowerCase(), `"${term}" is not lower case`);
    say(!/<\/?[a-z][\w-]*[\s/>]/i.test(definition), `"${term}" has markup in its definition`);
    say(definition.length > 20, `"${term}" has a definition too short to help`);
    say(definition.length < 190, `"${term}" has a definition too long for a card (${definition.length})`);
    say(/[.!?]$/.test(definition), `"${term}" has a definition that does not end in a full stop`);
    say(!AMBIGUOUS.includes(term), `"${term}" has an everyday sense these pages use, so it cannot be a term`);
    say(!/^\s|\s$/.test(term), `"${term}" has stray whitespace`);
}

/* Every curriculum page loads it, and the generator keeps that true for pages
   that do not exist yet. */
const pages = [];
const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith(".html")) pages.push(full);
    }
};
walk(join(ROOT, "pages/curriculum"));
const missing = pages.filter((p) => !readFileSync(p, "utf8").includes("js/glossary.js"));
say(missing.length === 0, `${missing.length} curriculum pages do not load the glossary`
    + (missing.length ? `, e.g. ${relative(ROOT, missing[0])}` : ""));

/* The marks themselves. A mark belongs in running prose: not in a heading, a
   link, a bold label or a piece of notation, all of which either say the word
   already or must stay exactly as they are set. */
const VOID = new Set(["meta", "link", "img", "br", "hr", "input", "path", "source", "col",
    "use", "circle", "rect", "line", "polygon", "polyline", "stop"]);
const BAD_TAG = new Set(["b", "a", "h1", "h2", "h3", "h4", "h5", "h6", "sup", "sub", "svg",
    "code", "kbd", "button", "label"]);
const BAD_CLASS = ["sf", "caret", "rad", "gloss"];
const TAG = /<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;

let marks = 0;
let markedPages = 0;
for (const page of pages) {
    const html = readFileSync(page, "utf8");
    if (!html.includes('class="gloss"')) continue;
    markedPages += 1;
    const name = relative(ROOT, page);
    const here = new Set();
    const stack = [];
    let m;
    TAG.lastIndex = 0;
    while ((m = TAG.exec(html))) {
        const tag = m[2].toLowerCase();
        if (m[1]) {
            for (let i = stack.length - 1; i >= 0; i -= 1) if (stack[i].tag === tag) { stack.splice(i); break; }
            continue;
        }
        if (m[3].includes('class="gloss"')) {
            marks += 1;
            const term = (m[3].match(/data-term="([^"]+)"/) || [])[1];
            say(term !== undefined, `${name}: a mark carries no data-term`);
            say(seen.has(term), `${name}: marks "${term}", which has no definition`);
            say(!here.has(term), `${name}: marks "${term}" more than once`);
            here.add(term);
            const host = stack.find((e) => BAD_TAG.has(e.tag)
                || BAD_CLASS.some((c) => new RegExp(`class="[^"]*\\b${c}\\b`).test(e.attrs)));
            say(!host, `${name}: marks "${term}" inside <${host ? host.tag : ""}>, where a card does not belong`);
            /* A scene is repainted by the page's own script, which would wipe the
               mark out on its next frame. The two also share the data-term
               attribute — the scenes use it for their own "a" and "b" — so a mark
               left inside one could be picked up as a scene part. */
            const scene = stack.find((e) => /data-[\w-]*scene|data-step-|aria-live/.test(e.attrs));
            say(!scene, `${name}: marks "${term}" inside a region the page repaints`);
            const inner = html.slice(m.index + m[0].length, html.indexOf("</span>", m.index));
            say(!inner.includes("<"), `${name}: the mark on "${term}" has markup inside it`);
            say(inner.trim().length > 0, `${name}: the mark on "${term}" wraps nothing`);
        }
        if (!m[3].trimEnd().endsWith("/") && !VOID.has(tag)) stack.push({ tag, attrs: m[3] });
    }
}

const generator = join(ROOT, "scripts/generate-gcse-strand.mjs");
if (existsSync(generator)) {
    const text = readFileSync(generator, "utf8");
    const kinds = (text.match(/scripts: \[[^\]]*\]/g) || []);
    const without = kinds.filter((k) => !k.includes("glossary.js"));
    say(without.length === 0, `the generator would emit ${without.length} page kinds without the glossary`);
}

/* The styles the marks and the card need live in the stylesheet every
   curriculum page already loads. */
const css = readFileSync(join(ROOT, "css/curriculum.css"), "utf8");
for (const rule of [".gloss", ".gloss__spoken", ".gloss-card"]) {
    say(new RegExp(`\\${rule}\\b[^{]*\\{`).test(css), `${rule} has no styles in css/curriculum.css`);
}

if (problems.length) problems.forEach((p) => console.log(p));
console.log(`\n${entries.length} glossary terms; ${marks} marks in ${markedPages} of ${pages.length} curriculum pages;`
    + ` ${problems.length} problems.`);
process.exit(problems.length ? 1 : 0);
