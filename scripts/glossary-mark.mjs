/* Mark glossary terms into the pages themselves.

   This is an authoring tool, run once over a page, not something that happens
   in the reader's browser. Marking used to be done at run time, and the language
   fought it the whole way: "mean" is nearly always the ordinary verb, "round" is
   a quiz round on the practice pages and an adverb in "the wrong way round",
   "the difference is in what the columns are for" is not the difference of two
   squares. Every one of those needed a rule, and the rules could only ever
   approximate a judgement.

   So the judgement is made once, written into the markup, and can be corrected
   by hand afterwards — which is the point. What this script produces is a first
   pass for a human to edit, not a verdict.

       node scripts/glossary-mark.mjs              # report what it would mark
       node scripts/glossary-mark.mjs --write      # write the marks in
       node scripts/glossary-mark.mjs --write path/to/page.html

   Existing marks are left exactly as they are, so a hand-corrected page is never
   overwritten and the script can be re-run after new prose is added. */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";


const ROOT = dirname(dirname(new URL(import.meta.url).pathname));
const args = process.argv.slice(2);
const write = args.includes("--write");
const only = args.filter((a) => !a.startsWith("--"));

/* Prose, and only prose. Notation carries its own meaning, a heading is not a
   place for a hover card, a control must stay a control, and a region a page's
   own script rewrites would lose the marking on its next repaint. */
const PROSE = new Set(["p", "li", "dd", "figcaption"]);
/* <b> is never running prose here: it is a slip title, a coach stage label, or
   a term being introduced in bold, which the sentence around it already defines. */
const SKIP_TAGS = new Set(["b", "a", "h1", "h2", "h3", "h4", "h5", "h6", "button", "input", "select",
    "textarea", "label", "code", "kbd", "sup", "sub", "math", "svg", "script", "style", "noscript"]);
const SKIP_CLASS = ["sf", "rad", "caret", "author-note", "breadcrumb", "page-nav", "between",
    "gloss", "skill-strip", "practice-reflection__kicker"];
const SKIP_ATTR = ["data-root-scene", "data-between", "aria-live", "data-no-gloss", "data-step-copy", "data-reading"];

/* The terms are read out of js/glossary.js so there is one list, not two: the
   browser needs the definitions, this needs only the words. */
const terms = [...readFileSync(join(ROOT, "js/glossary.js"), "utf8")
    .matchAll(/^    "([^"]+)": "/gm)].map((m) => m[1]).sort((a, b) => b.length - a.length);
/* A term is matched in the plural too: "integers" and "digits" are how a reader
   usually meets them. */
const shape = (term) => term.endsWith("s") ? term
    : term.endsWith("y") ? term.slice(0, -1) + "(?:y|ies)"
    : term + "(?:e?s)?";

const TAG = /<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;

const markPage = (html, name) => {
    const headings = (html.match(/<h[123][^>]*>[\s\S]*?<\/h[123]>/g) || []).join(" ").toLowerCase()
        + " " + (html.match(/<title>([^<]*)/) || ["", ""])[1].toLowerCase();
    /* A page whose heading names a term is that term's definition. */
    const own = new Set(terms.filter((t) => headings.includes(t)));
    const used = new Set(html.match(/data-term="([^"]+)"/g)?.map((m) => m.slice(11, -1)) || []);

    const out = [];
    const stack = [];
    let at = 0;
    let marked = [];
    let m;
    TAG.lastIndex = 0;
    while ((m = TAG.exec(html))) {
        const text = html.slice(at, m.index);
        at = TAG.lastIndex;
        const inProse = stack.some((e) => PROSE.has(e.tag));
        const blocked = stack.some((e) => SKIP_TAGS.has(e.tag)
            || SKIP_CLASS.some((c) => new RegExp(`class="[^"]*\\b${c}\\b`).test(e.attrs))
            || SKIP_ATTR.some((a) => e.attrs.includes(a)));

        if (text && inProse && !blocked) {
            let rest = text;
            let built = "";
            let guard = 0;
            while (guard++ < 40) {
                let best = null;
                for (const term of terms) {
                    if (used.has(term) || own.has(term)) continue;
                    const found = new RegExp(`\\b${shape(term)}\\b`, "i").exec(rest);
                    if (!found) continue;
                    if (!best || found.index < best.index
                        || (found.index === best.index && found[0].length > best.word.length)) {
                        best = { term, index: found.index, word: found[0] };
                    }
                }
                if (!best) break;
                used.add(best.term);
                marked.push(best.term);
                built += rest.slice(0, best.index)
                    + `<span class="gloss" data-term="${best.term}">${best.word}</span>`;
                rest = rest.slice(best.index + best.word.length);
            }
            out.push(built + rest);
        } else if (text) {
            out.push(text);
        }
        out.push(m[0]);

        const tag = m[2].toLowerCase();
        if (m[1]) { for (let i = stack.length - 1; i >= 0; i -= 1) if (stack[i].tag === tag) { stack.splice(i); break; } }
        else if (!m[3].trimEnd().endsWith("/") && !["meta", "link", "img", "br", "hr", "input", "path", "source", "col"].includes(tag)) {
            stack.push({ tag, attrs: m[3] });
        }
    }
    out.push(html.slice(at));
    return { html: out.join(""), marked };
};

const pages = [];
if (only.length) pages.push(...only.map((p) => join(ROOT, p)));
else {
    const walk = (dir) => { for (const e of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, e.name);
        if (e.isDirectory()) walk(full); else if (e.name.endsWith(".html")) pages.push(full);
    } };
    walk(join(ROOT, "pages/curriculum"));
}

let touched = 0, total = 0;
for (const page of pages) {
    const html = readFileSync(page, "utf8");
    if (!html.includes("<main")) continue;
    const { html: next, marked } = markPage(html, relative(ROOT, page));
    if (!marked.length) continue;
    touched += 1; total += marked.length;
    if (write) writeFileSync(page, next);
    if (only.length || marked.length > 8) {
        console.log(`${relative(ROOT, page)}: ${marked.join(", ")}`);
    }
}
console.log(`\n${total} terms ${write ? "marked into" : "would be marked into"} ${touched} pages.`);
