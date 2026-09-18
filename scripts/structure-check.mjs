/* Structure that only shows in a browser, asserted from the source instead.

   Every teaching page that loads lesson.css is scanned raw — no DOM parser,
   because jsdom silently repairs a stray </section> and every DOM-based check
   then passes over it. Four things, each learned from a page that shipped
   with the fault:

   - tag balance, so a closer that closes the wrong element is named;
   - heading levels one below their parent, inside <main>;
   - ids unique, and every aria-labelledby / aria-describedby pointing at one;
   - inline text that runs together with styles off — a <b> label butting its
     <span> body ("indexChoosing"), figure cells with no whitespace between
     them. Block boundaries (</p>, </h3>, </div>) break the line whatever the
     styles say, so only inline joins are reported.

   Dead CSS is deliberately not here: page scripts compose class names at run
   time, so a text search cannot tell an unused class from a composed one.

   It prints problems and exits non-zero when there are any. */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const ROOT = dirname(dirname(new URL(import.meta.url).pathname));
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

const pages = [];
const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith(".html")) pages.push(full);
    }
};
walk(join(ROOT, "pages"));

const problems = [];
const report = (page, text) => problems.push(`${relative(ROOT, page)}: ${text}`);
const BLOCK = "p|h[1-6]|li|div|section|article|aside|ol|ul|figure|figcaption|table|tr|td|th|dl|dt|dd|noscript|label";
const stripped = (html) => html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(new RegExp(`</(${BLOCK})>|<(${BLOCK})\\b[^>]*>`, "g"), "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(times|divide|rarr|darr|mdash|ndash|rsaquo|middot|copy|radic|ge|le|minus|plusmn);/g, " ")
    .replace(/&[a-z]+;/g, "");

let checked = 0;

for (const page of pages) {
    const html = readFileSync(page, "utf8");
    if (!html.includes("/css/lesson.css")) continue;
    checked += 1;

    /* Tag balance. */
    const stack = [];
    const lineOf = (index) => html.slice(0, index).split("\n").length;
    for (const m of html.matchAll(/<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?(\/?)>/g)) {
        if (m[0].startsWith("<!--")) continue;
        const [, close, rawTag, self] = m;
        const tag = rawTag.toLowerCase();
        if (VOID.has(tag) || self) continue;
        if (!close) { stack.push({ tag, line: lineOf(m.index) }); continue; }
        const open = stack.pop();
        if (!open) report(page, `line ${lineOf(m.index)}: </${tag}> closes nothing`);
        else if (open.tag !== tag) report(page, `line ${lineOf(m.index)}: </${tag}> closes <${open.tag}> opened at line ${open.line}`);
    }
    for (const open of stack) report(page, `line ${open.line}: <${open.tag}> never closed`);

    /* Heading levels inside <main>. */
    const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
    let previous = 0;
    for (const m of main.matchAll(/<h([1-6])\b/g)) {
        const level = Number(m[1]);
        if (previous && level > previous + 1) report(page, `heading jumps from h${previous} to h${level}`);
        previous = level;
    }

    /* Ids and ARIA references. */
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    const seen = new Set();
    for (const id of ids) {
        if (seen.has(id)) report(page, `duplicate id "${id}"`);
        seen.add(id);
    }
    for (const m of html.matchAll(/aria-(labelledby|describedby)="([^"]+)"/g)) {
        for (const id of m[2].split(/\s+/)) if (!seen.has(id)) report(page, `aria-${m[1]} points at missing id "${id}"`);
    }

    /* Stripped text running together. */
    for (const line of stripped(main).split("\n")) {
        const hit = line.match(/[a-z]{2,}[A-Z][a-z]/);
        if (hit) report(page, `runs together when stripped: "…${line.slice(Math.max(0, hit.index - 24), hit.index + 24).trim()}…"`);
    }

}


console.log(`${checked} teaching pages checked; ${problems.length} problem${problems.length === 1 ? "" : "s"}.`);
problems.forEach((p) => console.log(`  ${p}`));
process.exitCode = problems.length ? 1 : 0;
