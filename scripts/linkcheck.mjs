import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { BASE } from "./site-base.mjs";

const ROOT = "/Users/joeltaylor/Documents/Code/demystifyingmaths";
let broken = 0, checked = 0;

function walk(dir) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
        if (e.name.startsWith(".") || e.name === "node_modules" || e.name === "extra") continue;
        const p = join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name.endsWith(".html") && e.name !== "404.html") check(p);
    }
}

function check(file) {
    const html = readFileSync(file, "utf8");
    for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
        const raw = m[1];
        if (/^(https?:|mailto:|tel:|data:|#|\/\/)/.test(raw)) continue;
        const target = decodeURIComponent(raw.split("#")[0].split("?")[0]);
        if (!target) continue;
        checked++;
        // The site is served from BASE, so a root-absolute URL must carry that
        // prefix; without it the asset 404s on GitHub Pages.
        if (target.startsWith("/") && !target.startsWith(BASE + "/")) {
            broken++;
            console.log(`NO-BASE ${file.replace(ROOT + "/", "")}  ->  ${raw}`);
            continue;
        }
        const abs = target.startsWith(BASE + "/")
            ? resolve(ROOT, "." + target.slice(BASE.length))
            : resolve(dirname(file), target);
        if (!existsSync(abs)) {
            broken++;
            console.log(`BROKEN  ${file.replace(ROOT + "/", "")}  ->  ${raw}`);
        }
    }
}

// URLs created by browser JavaScript resolve against the document URL, not the
// JavaScript file. A path such as "../images/..." in js/fractals.js therefore
// points inside pages/images when used by pages/extracurricular/fractals.html.
// Keep runtime asset URLs base-absolute, like the URLs in the HTML.
function checkRuntimeUrls(dir) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
        if (e.name.startsWith(".")) continue;
        const p = join(dir, e.name);
        if (e.isDirectory()) {
            checkRuntimeUrls(p);
            continue;
        }
        if (!e.name.endsWith(".js")) continue;

        const source = readFileSync(p, "utf8");
        const relativeLocalUrl = /(["'`])((?:\.\.\/)+(?:pages|css|js|images|favicon_io|embed)\/.*?)\1/g;
        for (const m of source.matchAll(relativeLocalUrl)) {
            checked++;
            broken++;
            console.log(`RUNTIME-RELATIVE ${p.replace(ROOT + "/", "")}  ->  ${m[2]}`);
        }
    }
}

walk(ROOT);
checkRuntimeUrls(join(ROOT, "js"));
console.log(`\n${checked} local references checked, ${broken} broken.`);
process.exit(broken ? 1 : 0);
