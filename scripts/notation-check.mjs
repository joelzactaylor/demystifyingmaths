/* Notation that loses its meaning when the markup is stripped, and notation
   that depends on a font the reader may not have.

   Two rules, both learned the hard way:

   - A square root is drawn, never left to <msqrt>. A browser lays that element
     out from the OpenType MATH table of the font the expression is set in, and
     macOS ships no font that has one, so the bar floats away from the arm. The
     site draws its own with .rad (see lesson.css). Fractions and indices are
     laid out from ordinary box metrics and are fine as MathML.

   - Raising and enclosing are positional: <sup>5</sup> flattens to "5", turning
     2^5 into twenty-five, and a drawn radical flattens to its radicand, turning
     √49 = 7 into the false 49 = 7. Each carries a clipped marker — the caret or
     the root sign — that restores exactly the character the flattening drops,
     and no more, so the stripped text reads once and reads true.

   Scoped to the pages that load lesson.css, which is where .rad lives. */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const ROOT = dirname(dirname(new URL(import.meta.url).pathname));

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
let checked = 0;
let radicals = 0;
let raised = 0;

for (const page of pages) {
    const html = readFileSync(page, "utf8");
    if (!/css\/lesson\.css/.test(html)) continue;
    const name = relative(ROOT, page);
    checked += 1;

    const msqrt = (html.match(/<msqrt\b/g) || []).length;
    if (msqrt) problems.push(`${name}: ${msqrt} <msqrt> — draw the root with .rad instead`);

    /* The capture keeps the radicand's own closing tag: without it the body
       ends mid-element and the radicand reads as empty. */
    for (const m of html.matchAll(/<span\s+class="rad(?:\s+[^"]*)?">([\s\S]*?<\/span>)\s*<\/span>/g)) {
        radicals += 1;
        const body = m[1];
        if (!/class="rad__sign"/.test(body)) problems.push(`${name}: a .rad with no drawn sign`);
        if (!/class="rad__over"/.test(body)) problems.push(`${name}: a .rad with no barred radicand`);
        /* The clipped sign restores the character the flattening drops. A bar
           over a sum also carries grouping, which one character cannot restore,
           so those open a bracket and close it after the radical: √(9 + 16). */
        /* A root of a higher order carries its index in the clipped sign as well
           as in the crook: flattened, "27" alone would turn the cube root of 27
           into 27, and a bare "&radic;27" would turn it into the square root,
           which is a different and false number. The order goes in front as a
           superscript character, which cannot be read as a multiplication the
           way a full-size "3" before a radical can. */
        const opener = body.match(/^<span\s+class="caret"\s+aria-hidden="true">(&sup3;|&#830[89];|&#8319;)?&radic;(\(?)<\/span>/);
        if (!opener) {
            problems.push(`${name}: a .rad whose clipped root sign is missing or not first`);
        } else if (opener[2] === "(") {
            const after = html.slice(m.index + m[0].length, m.index + m[0].length + 90);
            if (!/^\s*<span class="caret" aria-hidden="true">\)<\/span>/.test(after)) {
                problems.push(`${name}: a grouped .rad opens a clipped bracket and never closes it`);
            }
        }
        /* The index the reader sees and the order the flattened text carries are
           two statements of the same thing, and nothing else keeps them in step. */
        const ORDERS = { "&sup3;": "3", "&#8308;": "4", "&#8309;": "5", "&#8319;": "n" };
        const shown = (body.match(/class="rad__index"[^>]*\sdata-order="([^"]*)"/) || [])[1];
        const marked = opener && opener[1] ? ORDERS[opener[1]] : null;
        if (shown !== undefined && marked === null) {
            problems.push(`${name}: a .rad shows the index ${shown} but flattens as a square root`);
        } else if (marked !== null && shown === undefined) {
            problems.push(`${name}: a .rad flattens as an order-${marked} root but shows no index`);
        } else if (marked !== null && shown !== marked) {
            problems.push(`${name}: a .rad shows the index ${shown} and flattens as order ${marked}`);
        }
        if (marked !== null && !/class="rad[^"]*\brad--order\b/.test(m[0])) {
            problems.push(`${name}: an order-${marked} root is not marked .rad--order, so its index has no room`);
        }

        const radicand = (body.match(/class="rad__over">([\s\S]*?)<\/span>/) || [])[1] || "";
        const grouped = /[+\-×÷]/.test(radicand.replace(/<[^>]*>/g, ""));
        if (grouped && !(opener && opener[2] === "(")) {
            problems.push(`${name}: a .rad over an expression with no clipped brackets — ${radicand.slice(0, 30)}`);
        }
    }

    /* A root sign written as a bare character has no bar, so it does not say
       how far the root reaches: "√49" is the glyph beside a number rather than
       a radical over one, and it is the fault .rad exists to prevent. It turns
       up where a radical is least expected to need care — a scene heading, a
       card title — and looks close enough to survive a read-through.

       Three places are exempt, because a drawn radical cannot go in any of
       them: an attribute value, which holds no markup at all; the one-line card
       descriptions the generator writes out of the manifests; and a stub's
       author note, which is deleted when the page is written. Naming the
       character itself is exempt too — "the sign for a square root is √" has
       nothing under it — so the fault is a bare radical with a radicand after
       it. The clipped copies inside .rad are what the radical is made of. */
    const OUTSIDE = ["topic-card", "author-note", "skill-strip", "breadcrumb", "page-nav"];
    const TAGS = /<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
    const VOIDS = new Set(["meta", "link", "img", "br", "hr", "input", "path", "source", "col"]);
    const stack = [];
    let cursor = 0;
    let tag;
    TAGS.lastIndex = 0;
    while ((tag = TAGS.exec(html))) {
        const text = html.slice(cursor, tag.index);
        cursor = TAGS.lastIndex;
        const sheltered = stack.some((entry) => OUTSIDE.some((cls) =>
            new RegExp(`class="[^"]*\\b${cls}\\b`).test(entry)));
        /* A clipped sign is the radical's own machinery, and is what puts the
           character back when the styling is gone. */
        const clipped = stack.some((entry) => /class="caret"/.test(entry));
        if (!sheltered && !clipped) {
            for (const hit of text.matchAll(/(&radic;|\u221A)\s*(?=[0-9A-Za-z(])/g)) {
                const where = (text.slice(Math.max(0, hit.index - 40), hit.index + 24)).replace(/\s+/g, " ");
                problems.push(`${name}: a bare root sign over a radicand — draw it with .rad — …${where}`);
            }
        }
        const which = tag[2].toLowerCase();
        if (tag[1]) {
            for (let i = stack.length - 1; i >= 0; i -= 1) {
                if (stack[i].startsWith(`<${which}`) || stack[i] === which) { stack.splice(i); break; }
            }
        } else if (!tag[3].trimEnd().endsWith("/") && !VOIDS.has(which)) {
            stack.push(`<${which} ${tag[3]}`);
        }
    }

    /* A dash standing directly against notation is read as part of it. "Wrong
       idea &mdash; &radic;49 = &plusmn;7" puts an em dash immediately before a
       radical, on a line that also carries a real minus sign, and the label
       separator becomes a sign the reader has to rule out. "Base &mdash; 2"
       reads as base minus two. A colon cannot be mistaken for an operator, so
       a label ends in one.

       Only a dash against the start of notation counts. A dash between clauses
       is ordinary punctuation and the pages use it that way throughout. */
    for (const hit of html.matchAll(/&mdash;\s*(?:<span class="(?:sf|rad)\b|<span class="caret"|&radic;|&minus;|[0-9(\u221A])/g)) {
        const where = html.slice(Math.max(0, hit.index - 42), hit.index + 34).replace(/\s+/g, " ");
        problems.push(`${name}: a dash reads as a sign against the notation after it — use a colon — …${where}`);
    }

    /* A raised index needs the clipped caret in front of it, or the flattened
       text reads 2^5 as twenty-five. */
    for (const m of html.matchAll(/<sup\b[^>]*>/g)) {
        raised += 1;
        const before = html.slice(Math.max(0, m.index - 90), m.index);
        if (!/<span\s+class="caret"\s+aria-hidden="true">\^<\/span>\s*$/.test(before)) {
            const where = html.slice(Math.max(0, m.index - 60), m.index + 30).replace(/\s+/g, " ");
            problems.push(`${name}: <sup> with no clipped caret — …${where.slice(-70)}`);
        }
    }
}

if (problems.length) problems.forEach((p) => console.log(p));
console.log(`\n${checked} teaching pages checked, ${radicals} drawn radicals, ${raised} raised indices; ${problems.length} problems.`);
process.exit(problems.length ? 1 : 0);
