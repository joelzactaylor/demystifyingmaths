/* The prose voice, as far as a script can judge it.

   docs/lesson-prose-voice.md holds twenty-four rules taken from the
   written-methods pages. Most of them need a reader. This checks the shapes
   that do not: the words the voice never uses, a question or exclamation in
   running prose, second person governing a mental verb, a sentence past thirty
   words with no semicolon or colon to split it, and a paragraph that opens on a clause
   too long to be the claim it is meant to be.

   Every hit is a line to read, not a verdict. "Above" is banned as a pointer
   and allowed for a mark's place in a calculation; "may" is a hedge in one
   sentence and a permission in the next; a question that opens a section and
   is answered by it is the site's own practice. So the script prints what it
   found and where, and never fails a build on its own. Pass --strict to make
   any hit an error, for a page that is meant to be clean.

       node scripts/voice-check.mjs                       every teaching page
       node scripts/voice-check.mjs pages/.../lesson.html   one page
       node scripts/voice-check.mjs --strict pages/...      hits are failures

   A practice page is skipped: its voice is a different one. */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const ROOT = dirname(dirname(new URL(import.meta.url).pathname));

/* The list from "Phrases the voice never uses", as patterns. Each is matched
   against a lower-cased paragraph; ^ means it opens the paragraph. */
const BANNED = [
    /\bsimply\b/, /\bjust\b/, /\breally\b/, /\bactually\b/, /\bbasically\b/, /\bessentially\b/,
    /\bobviously\b/, /\bof course\b/, /\bclearly\b/, /\bnaturally\b/, /\bin fact\b/,
    /\bimportant\b/, /\bthe key\b/, /\bworth noting\b/,
    /\bnotice that\b/, /\bnote that\b/, /\bobserve that\b/, /\bas you can see\b/, /\blook at how\b/,
    /\bremember\b/, /\brecall\b/, /\bdon.t forget\b/, /\bkeep in mind\b/, /\bbear in mind\b/,
    /\bthis page\b/, /\bthis lesson\b/, /\bthis section\b/, /\bin what follows\b/, /\bthe rest of this page\b/,
    /\bwe will now\b/, /\bnext we\b/,
    /\bas shown\b/, /\bthe diagram\b/, /\bthe animation\b/, /\bthe board\b/, /\bthe first of these\b/, /\bsee the example\b/,
    /\bbelow\b/, /\babove\b/, /\bwatch\b/, /\bhere\b/,
    /\bclick\b/, /\bdrag\b/, /\btap\b/, /\buse the boxes\b/, /\benter a number\b/, /\ban ellipsis shows\b/,
    /\bstraightforward\b/, /\bsimple\b/, /\beasy\b/, /\btricky\b/, /\bhard to grasp\b/, /\bthe difficult part\b/,
    /\bdon.t worry\b/, /\bit may seem\b/, /\bat first this looks\b/, /\banyone who loses\b/, /\bif you find this\b/,
    /\bstudents often\b/, /\bcommon mistake is\b/, /\bmany people think\b/, /\bpeople get this wrong\b/,
    /\bbe careful\b/, /\btake care\b/, /\bmake sure\b/, /\bit is a good idea\b/, /\btry to remember\b/,
    /\bmight\b/, /\bmay\b/, /\bcould\b/, /\bperhaps\b/, /\bprobably\b/, /\btends to\b/, /\bcan depend on\b/,
    /\bnearly always\b/, /\busually\b/, /\bmost of the time\b/, /\bin most cases\b/,
    /\bhere is the surprise\b/, /\bas we will see\b/, /\byou.ll see\b/, /\byou will\b/,
    /\blet.s\b/, /\blet us\b/, /\bwe\b/, /\bour\b/, /\bus\b/, /\bi\b/,
    /\bthink of it as\b/, /\bimagine\b/, /\bit.s like\b/, /\bpicture a\b/,
    /^however\b/, /^therefore\b/, /^in other words\b/, /^that said\b/, /^moreover\b/, /^furthermore\b/,
    /\blater you\b/, /\bfor now\b/, /\bwe.ll cover\b/, /\bbeyond the scope\b/,
    /\bturns out\b/, /\bmost of what you need\b/, /\bthe whole trick\b/,
    /\bgoes into\b/, /\bleftover\b/, /\bthe top number\b/, /\bthe bottom number\b/, /\btake away\b/,
    /\bpartial product\b/, /\bdistributive law\b/, /\balgorithm\b/, /\bminuend\b/, /\bsubtrahend\b/,
    /\bwell done\b/, /\bnow you know\b/, /\byou should now\b/
];

/* Rule 22: "you" governs an arithmetic verb or nothing. */
const MENTAL = /\byou (see|notice|remember|recall|understand|know|learn|find|need|want|think|realise|realize|feel|expect|forget|might|may|can see|will)\b/;

const LONG_SENTENCE = 30;
/* Rule 15 asks for twelve words or fewer. The six reference pages open seven
   paragraphs in ten at twelve or fewer and one in six past sixteen, so sixteen
   is where a named calculation frame ends and throat-clearing begins. */
const LONG_OPENER = 16;

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
        if (MENTAL.test(low)) flags.push("you + mental verb");
        if (/[?!]/.test(para)) flags.push("? or !");
        const sentences = para.split(/(?<=[.!?])\s+/);
        const opener = words(sentences[0].split(/[.:;]/)[0]);
        if (opener > LONG_OPENER) flags.push(`opener ${opener}w`);
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
