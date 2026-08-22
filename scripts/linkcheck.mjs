import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

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
        const abs = target.startsWith("/")
            ? resolve(ROOT, "." + target)
            : resolve(dirname(file), target);
        if (!existsSync(abs)) {
            broken++;
            console.log(`BROKEN  ${file.replace(ROOT + "/", "")}  ->  ${raw}`);
        }
    }
}

walk(ROOT);
console.log(`\n${checked} local references checked, ${broken} broken.`);
process.exit(broken ? 1 : 0);
