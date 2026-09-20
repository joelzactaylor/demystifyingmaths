// Inline editing of page text from the browser — TEMPORARY, dev server only.
//
// scripts/serve.mjs adds one <script> tag to every teaching page it serves,
// pointing at scripts/inline-edit-client.js. That script puts a pencil beside
// any text under the mouse and a panel for adding and removing blocks; an edit
// made in the page comes back here as a list of exact splices into a source
// file — the page, an embed it fetched, or the script that drew a caption —
// and is written to disk only if the file still holds precisely the text the
// page showed. The pages themselves carry nothing: the tag is injected on the
// way out, so a deployed page never sees any of this.
//
// To remove the feature: delete this file and inline-edit-client.js, and the
// lines in serve.mjs that import and call `inject` and `route`.
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { join, normalize, basename, sep } from "node:path";
import { BASE } from "./site-base.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const CLIENT = new URL("./inline-edit-client.js", import.meta.url).pathname;
const PAGES = join(ROOT, "pages") + sep;
const ROUTE = BASE + "/__edit";
const TAG = `<script src="${ROUTE}.js" defer></script>\n`;

const json = (res, code, body) =>
    res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store" })
        .end(JSON.stringify(body));

// Teaching pages and the extracurricular lessons. Practice pages draw their
// text at run time and menus are rebuilt from the manifests, so a pencil on
// either would offer an edit that cannot land or would not last.
const isLesson = (file) => {
    if (!file.startsWith(PAGES) || !file.endsWith(".html")) return false;
    const name = basename(file);
    if (name === "index.html" || name.startsWith("practice")) return false;
    const rel = file.slice(PAGES.length);
    return rel.startsWith("curriculum" + sep) || rel.startsWith("extracurricular" + sep);
};

// The page as served: its source with the editor's tag before </body>, or
// null when the file is not a lesson and should be streamed untouched.
export const inject = (file) => {
    if (!isLesson(file)) return null;
    const html = readFileSync(file, "utf8");
    const at = html.lastIndexOf("</body>");
    return at < 0 ? html + TAG : html.slice(0, at) + TAG + html.slice(at);
};

// A site path -> the file it names, confined to the places page text lives:
// the pages, the embeds a page fetches, and the scripts that draw captions.
const SOURCES = [[PAGES, ".html"], [join(ROOT, "embed") + sep, ".html"], [join(ROOT, "js") + sep, ".js"]];
const resolveSource = (pathname) => {
    if (typeof pathname !== "string" || !pathname.startsWith(BASE + "/")) return null;
    const rel = normalize(pathname.slice(BASE.length)).replace(/^(\.\.[/\\])+/, "");
    const file = join(ROOT, rel);
    if (!SOURCES.some(([dir, ext]) => file.startsWith(dir) && file.endsWith(ext))) return null;
    try { return statSync(file).isFile() ? file : null; } catch { return null; }
};

const readBody = (req, limit = 4 << 20) => new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
        size += chunk.length;
        if (size > limit) { reject(new Error("request body too large")); req.destroy(); }
        else chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
});

// Apply splices to the source. Each names the exact text it replaces, so an
// edit made against a stale copy of the page — the file changed in an editor
// since the browser loaded it — is refused rather than landing somewhere else.
// Offsets are UTF-16 indices into the file read as a string, which is what the
// browser's copy of the same file also measures in.
export function apply(src, edits) {
    if (!Array.isArray(edits) || !edits.length) throw new Error("no edits");
    const sorted = edits.map((e, i) => ({ ...e, i })).sort((a, b) => b.start - a.start);
    let prev = Infinity;
    let out = src;
    for (const e of sorted) {
        const ok = Number.isInteger(e.start) && Number.isInteger(e.end) &&
            e.start >= 0 && e.start <= e.end && e.end <= src.length &&
            typeof e.expect === "string" && typeof e.text === "string";
        if (!ok) throw new Error(`edit ${e.i}: malformed`);
        if (e.end > prev) throw new Error(`edit ${e.i}: overlaps another`);
        if (src.slice(e.start, e.end) !== e.expect)
            throw new Error("the source has changed since the page was loaded — reload it and edit again");
        out = out.slice(0, e.start) + e.text + out.slice(e.end);
        prev = e.start;
    }
    return out;
}

const brief = (s) => JSON.stringify(s.length > 48 ? s.slice(0, 45) + "…" : s);

// True when the request was for the editor and has been answered.
export async function route(req, res, url) {
    if (url !== ROUTE && url !== ROUTE + ".js") return false;

    if (url === ROUTE + ".js") {
        res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "no-store" });
        res.end(readFileSync(CLIENT));
        return true;
    }

    if (req.method === "GET") {
        // The page's source, raw: the served copy carries the injected tag and
        // the browser's own parse of it, so offsets are taken against this.
        const file = resolveSource(new URL(req.url, "http://localhost").searchParams.get("path"));
        if (!file) { json(res, 404, { ok: false, error: "not a source file" }); return true; }
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
        res.end(readFileSync(file, "utf8"));
        return true;
    }

    if (req.method !== "POST") { json(res, 405, { ok: false, error: "POST an edit" }); return true; }

    let body;
    try { body = JSON.parse(await readBody(req)); }
    catch (err) { json(res, 400, { ok: false, error: `bad request: ${err.message}` }); return true; }

    const file = resolveSource(body.path);
    if (!file) { json(res, 404, { ok: false, error: "not a source file" }); return true; }

    try {
        const src = readFileSync(file, "utf8");
        writeFileSync(file, apply(src, body.edits));
    } catch (err) {
        json(res, 409, { ok: false, error: err.message });
        return true;
    }

    const rel = file.slice(ROOT.length + 1);
    for (const e of body.edits) console.log(`edit ${rel}: ${brief(e.expect)} -> ${brief(e.text)}`);
    json(res, 200, { ok: true, file: rel });
    return true;
}
