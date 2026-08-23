// Local dev server that mirrors how the site is served in production.
//
// The published pages use root-absolute URLs carrying the site's base prefix
// (see scripts/site-base.mjs), because GitHub Pages serves this repo from
// https://joelzactaylor.github.io/demystifyingmaths/. Serving the repo folder
// itself at http://localhost:8000/ would therefore 404 every asset. This server
// mounts the repo at BASE so local URLs match the deployed ones exactly.
//
//   node scripts/serve.mjs [port]      ->  http://localhost:8000/demystifyingmaths/
import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { join, normalize, extname } from "node:path";
import { BASE } from "./site-base.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const PORT = Number(process.argv[2]) || 8000;

const TYPES = {
    ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json", ".webmanifest": "application/manifest+json",
    ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp",
    ".ico": "image/x-icon", ".heic": "image/heic", ".woff2": "font/woff2",
};

const send = (res, code, body, type = "text/html; charset=utf-8") =>
    res.writeHead(code, { "Content-Type": type }).end(body);

const server = createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, "http://localhost").pathname);

    // Match production: the bare root redirects into the prefixed site.
    if (url === "/" || !url.startsWith(BASE + "/") && url !== BASE)
        return res.writeHead(302, { Location: BASE + "/pages/home.html" }).end();

    // Confine resolution to the repo, then apply directory-index semantics.
    const rel = normalize(url.slice(BASE.length)).replace(/^(\.\.[/\\])+/, "");
    let file = join(ROOT, rel);
    try {
        if (statSync(file).isDirectory()) file = join(file, "index.html");
    } catch {
        return send(res, 404, `404: ${url} not found`);
    }

    try {
        statSync(file);
    } catch {
        return send(res, 404, `404: ${url} not found`);
    }

    res.writeHead(200, { "Content-Type": TYPES[extname(file).toLowerCase()] ?? "application/octet-stream" });
    createReadStream(file).pipe(res);
});

server.on("error", (err) => {
    if (err.code !== "EADDRINUSE") throw err;
    // Usually a server left running in another terminal — say so, rather than
    // dying in a stack trace that looks like the site is broken.
    console.error(
        `Port ${PORT} is already in use.\n` +
        `  If that is this server, the site is already at http://localhost:${PORT}${BASE}/pages/home.html\n` +
        `  To use a different port:   node scripts/serve.mjs ${PORT + 1}\n` +
        `  To find what holds it:     lsof -nP -iTCP:${PORT} -sTCP:LISTEN`);
    process.exit(1);
});

server.listen(PORT, () => {
    console.log(`Serving ${ROOT}\n  at http://localhost:${PORT}${BASE}/pages/home.html`);
});
