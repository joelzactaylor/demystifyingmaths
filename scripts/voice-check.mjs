/* Review prompts for the conversational voice in docs/lesson-prose-voice.md.
   Findings require human review; --strict makes findings fail the check. */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const ROOT = dirname(dirname(new URL(import.meta.url).pathname));

/* These are review signals, not a ban on conversational language. */
const BANNED = [
    /\bobviously\b/, /\bof course\b/, /\btrivially\b/,
    /\bdon.t worry\b/, /\banyone can do this\b/,
    /\bmaths superstar\b/, /\bthis is easy\b/,
    /\bas everyone knows\b/
];
const LONG_SENTENCE = 40;

/* A word has a letter or a digit in it; "+", "×" and "=" are not words, so an
   expression counts its numbers and not its operators. */
const words = (s) => s.split(/\s+/).filter((t) => /[a-z0-9]/i.test(t)).length;

/* Furniture every page carries, in the site's own words. */
const FURNITURE = [/^Before this page:/, /^Remember$/, /^Common mistakes$/, /^Why it works$/, /^Tip$/, /^Context$/];

const strict = process.argv.includes("--strict");
const targets = process.argv.slice(2).filter((a) => !a.startsWith("--"));

const pages = [];
const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith(".html") && !/practice|index\.html$/i.test(entry.name)) pages.push(full);
    }
};
if (targets.length) targets.forEach((t) => (statSync(t).isDirectory() ? walk(t) : pages.push(t)));
else walk(join(ROOT, "pages/curriculum"));

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", times: "×",
    divide: "÷", minus: "−", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", mdash: "—", ndash: "–", deg: "°",
    pound: "£", sup2: "²", sup3: "³", frac12: "½", frac14: "¼", radic: "√", middot: "·", copy: "©" };
const unescape = (s) => s.replace(/&(#x?[0-9a-f]+|[a-z0-9]+);/gi, (m, e) => {
    if (e[0] === "#") return String.fromCodePoint(parseInt(e[1] === "x" ? e.slice(2) : e.slice(1), e[1] === "x" ? 16 : 10));
    return e in ENTITIES ? ENTITIES[e] : m;
});

/* The running prose of a page: the main element, less the closing cards, the
   scripts, the no-script fallbacks, and the folds' summaries. Block ends
   become paragraph breaks so a sentence is judged inside its own paragraph. */
const paragraphs = (html) => {
    const start = html.indexOf("<main");
    let main = start < 0 ? html : html.slice(start, html.indexOf("</main>"));
    const cards = main.indexOf("lesson-actions");
    if (cards > 0) main = main.slice(0, cards);
    main = main.replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/g, "");
    main = main.replace(/\s+/g, " ");
    main = main.replace(/<\/(p|li|h[1-6]|dd|dt|figcaption|summary|td|th|div)>/g, "\n");
    /* A slip's or a method step's <b> is its name, not its opening clause. */
    main = main.replace(/(<li>\s*<b>[^<]*<\/b>)/g, "$1\n");
    return unescape(main.replace(/<[^>]+>/g, "")).split("\n").map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
};

let hits = 0;
let checked = 0;
for (const page of pages) {
    const name = relative(ROOT, page);
    const html = readFileSync(page, "utf8");
    const found = [];
    for (const para of paragraphs(html)) {
        if (FURNITURE.some((f) => f.test(para))) continue;
        const low = para.toLowerCase();
        const flags = [];
        for (const pattern of BANNED) {
            const m = low.match(pattern);
            if (m) flags.push(`"${m[0]}"`);
        }
        const sentences = para.split(/(?<=[.!?])\s+/);
        for (const s of sentences) {
            const n = words(s);
            if (n > LONG_SENTENCE && !/[;:]/.test(s)) flags.push(`${n}w, unsplit`);
        }
        if (flags.length) found.push(`  [${flags.join(", ")}] ${para.slice(0, 150)}${para.length > 150 ? "…" : ""}`);
    }
    checked += 1;
    if (found.length) {
        hits += found.length;
        console.log(name);
        found.forEach((f) => console.log(f));
    }
}

console.log(`\n${checked} teaching pages read; ${hits} lines to look at.`);
process.exit(strict && hits ? 1 : 0);
