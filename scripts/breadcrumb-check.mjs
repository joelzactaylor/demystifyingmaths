import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";

const ROOT = "/Users/joeltaylor/Documents/Code/demystifyingmaths";
const PAGES = join(ROOT, "pages");
const problems = [];
const pages = new Map(); // repo-relative path -> { trail, leaf, deep, count, headerTitle, html, url }

const decode = (s) => s
    .replace(/&rsaquo;/g, "›").replace(/&amp;/g, "&")
    .replace(/&ndash;/g, "–").replace(/&mdash;/g, "—")
    .replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').trim();

// site URL ("/pages/x/" or "/pages/x.html") -> repo-relative file path
const urlToFile = (u) => u.endsWith("/") ? u.slice(1) + "index.html" : u.slice(1);
// repo-relative file path -> canonical site URL
const fileToUrl = (p) => p.endsWith("/index.html") ? "/" + p.slice(0, -"index.html".length) : "/" + p;

function walk(dir) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name.endsWith(".html")) load(p);
    }
}

function load(abs) {
    const rel = relative(ROOT, abs);
    let html = readFileSync(abs, "utf8");
    // inline runtime-fetched embeds so reverse-link checks see their links
    for (const m of html.matchAll(/fetch\("(\/embed\/[^"]+)"\)/g))
        html += readFileSync(join(ROOT, m[1]), "utf8");
    const ols = [...html.matchAll(/<ol class="(breadcrumb[^"]*)">([\s\S]*?)<\/ol>/g)];
    if (rel === "pages/home.html") {
        if (ols.length) problems.push(`${rel}: home page unexpectedly has a breadcrumb`);
        pages.set(rel, { trail: [], leaf: null, html, url: fileToUrl(rel) });
        return;
    }
    if (ols.length !== 1) {
        problems.push(`${rel}: expected 1 breadcrumb <ol>, found ${ols.length}`);
        return;
    }
    const [, cls, body] = ols[0];
    const lis = [...body.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => m[1]);
    const trail = [];
    let leaf = null;
    lis.forEach((li, i) => {
        const link = li.match(/<a href="([^"]+)">([\s\S]*?)<\/a>/);
        const plain = li.match(/<p>([\s\S]*?)<\/p>/);
        if (i < lis.length - 1) {
            if (!link) problems.push(`${rel}: crumb ${i + 1} is not a link`);
            else {
                if (!link[1].startsWith("/pages/")) problems.push(`${rel}: crumb href "${link[1]}" is not an absolute /pages/ URL`);
                trail.push({ href: link[1], label: decode(link[2]) });
                if (!/aria-hidden="true"/.test(li)) problems.push(`${rel}: crumb ${i + 1} missing separator`);
            }
        } else {
            if (link) problems.push(`${rel}: final crumb is a link (${link[1]}) — should be plain <p>`);
            else if (!plain) problems.push(`${rel}: final crumb has no <p> label`);
            else leaf = decode(plain[1]);
        }
    });
    const headerTitle = html.match(/<header>[\s\S]*?<h1>([\s\S]*?)<\/h1>/)?.[1];
    pages.set(rel, { trail, leaf, deep: cls.includes("breadcrumb--deep"), count: lis.length, headerTitle, html, url: fileToUrl(rel) });
}

walk(PAGES);

const labelsByTarget = new Map();
for (const [rel, p] of pages) {
    if (rel === "pages/home.html") continue;

    // 1. first crumb is Home
    if (!p.trail.length || p.trail[0].href !== "/pages/home.html")
        problems.push(`${rel}: trail does not start at /pages/home.html`);
    if (p.trail.length && p.trail[0].label !== "Home")
        problems.push(`${rel}: first crumb labelled "${p.trail[0].label}", expected "Home"`);

    // 2. links resolve, no self-links, collect labels
    for (const { href, label } of p.trail) {
        const target = urlToFile(href);
        if (target === rel) problems.push(`${rel}: breadcrumb links to itself`);
        if (!existsSync(join(ROOT, target))) problems.push(`${rel}: breadcrumb link ${href} -> missing file ${target}`);
        else {
            if (!labelsByTarget.has(href)) labelsByTarget.set(href, new Map());
            const m = labelsByTarget.get(href);
            m.set(label, (m.get(label) || []).concat(rel));
        }
    }

    // 3. filesystem position matches breadcrumb: page must live in its parent menu's folder
    const parent = p.trail[p.trail.length - 1];
    if (parent) {
        const parentFile = urlToFile(parent.href);
        const expectedDir = parentFile === "pages/home.html" ? "pages" : dirname(parentFile);
        const actualDir = rel.endsWith("/index.html") ? dirname(dirname(rel)) : dirname(rel);
        if (actualDir !== expectedDir)
            problems.push(`${rel}: lives in ${actualDir}/ but breadcrumb parent ${parent.href} implies ${expectedDir}/`);
    }

    // 4. trail(child) === trail(parent) + [parent]
    if (parent && parent.href !== "/pages/home.html") {
        const pp = pages.get(urlToFile(parent.href));
        if (pp) {
            const childAnc = p.trail.slice(0, -1).map((c) => c.href).join(" > ");
            const parAnc = pp.trail.map((c) => c.href).join(" > ");
            if (childAnc !== parAnc)
                problems.push(`${rel}: ancestor chain [${childAnc}] does not match parent ${parent.href}'s trail [${parAnc}]`);
        }
    }

    // 5. parent actually links to this page somewhere
    if (parent) {
        const pp = pages.get(urlToFile(parent.href));
        if (pp && !pp.html.includes(`"${p.url}"`))
            problems.push(`${rel}: parent ${parent.href} contains no link to ${p.url}`);
    }

    // 6. deep-class convention (6+ items => --deep)
    if (p.count >= 6 && !p.deep) problems.push(`${rel}: ${p.count} crumbs but missing breadcrumb--deep`);
    if (p.count <= 5 && p.deep) problems.push(`${rel}: only ${p.count} crumbs but has breadcrumb--deep`);

    // 7. leaf label vs header title ("Demystifying - X")
    const ht = p.headerTitle && decode(p.headerTitle).replace(/^Demystifying( Maths)?\s*[-–—|]\s*/, "");
    if (p.leaf && ht && p.leaf !== ht)
        problems.push(`${rel}: final crumb "${p.leaf}" != header title "${ht}"`);
}

for (const [target, labels] of labelsByTarget) {
    if (labels.size > 1) {
        const detail = [...labels].map(([l, fs]) => `"${l}" (${fs.length}x e.g. ${fs[0]})`).join(", ");
        problems.push(`label mismatch for ${target}: ${detail}`);
    }
}

if (problems.length) problems.forEach((p) => console.log(p));
console.log(`\n${pages.size} pages checked, ${problems.length} problems.`);
process.exit(problems.length ? 1 : 0);
