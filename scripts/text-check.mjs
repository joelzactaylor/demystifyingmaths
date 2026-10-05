// Rendered type check: text too small to read, and text that leaves its box.
//
//   node scripts/text-check.mjs pages/curriculum/.../lesson.html [more pages]
//
// Needs the local server (`node scripts/serve.mjs`) and Google Chrome. The page
// is rendered headless at the 900px canvas under reduced motion, every visible
// text node inside `.layout` is measured as the reader sees it — computed size
// times any CSS transform, or times the SVG viewBox scale for SVG text — and
// its box is compared with the boxes around it.
//
// Fails on:
//   - visible text rendered under 12px, the floor for anything on the page;
//   - text that crosses the edge of a clipping ancestor, a bordered or filled
//     ancestor, an SVG viewport or the rect drawn as its cell — by more than
//     2px, or 4px vertically where nothing clips, because a glyph box
//     overshoots a `line-height: 1` block by a pixel or two without anything
//     being lost. A label set wholly outside its anchor is placement, not spill.
// Lists, without failing, text between 12px and 14px: a place name over a
// column the mathematics has fixed at 60px may be 13px; a caption, a status
// line, a label beside an input or a digit the reader must read may not.
// Read those lines.
//
// Only the docked state is rendered. A scene's earlier stages, a sandbox at
// its widest input and a drawing the page hides until its stage arrives are
// driven by hand — see "Rendering a page without a browser window" in
// docs/local-development.md.
//
// Left alone on purpose: the fixed ribbon and header; visually hidden text;
// the body of a closed <details>; text painted transparent (a drawn decimal
// point keeps its character for assistive technology); and, by decision on
// 19 September 2026, three shared marks that sit at 11–13px on every page —
// the order on a drawn radical (.rad__index), the onward-card kickers and the
// summary counters. Raising them is a change to lesson.css and curriculum.css,
// not to a page.

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BASE } from "./site-base.mjs";

const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ORIGIN = process.env.SITE_ORIGIN || "http://localhost:8000";
const VIEW_WIDTH = Number(process.env.TEXT_CHECK_WIDTH || 1000);
const FLOOR = 12;
const READ_BELOW = 14;
const OVERFLOW = 2;
const OVERFLOW_VERTICAL = 4;

const pages = process.argv.slice(2);
if (!pages.length) {
    console.error("usage: node scripts/text-check.mjs <page.html> [<page.html> ...]");
    process.exit(2);
}
if (!existsSync(CHROME)) {
    console.error(`Chrome not found at ${CHROME}; set CHROME to its binary.`);
    process.exit(2);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const profile = mkdtempSync(join(tmpdir(), "text-check-"));
const chrome = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
    "--force-prefers-reduced-motion", `--window-size=${VIEW_WIDTH},6000`,
    "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank",
], { stdio: "ignore" });
process.on("exit", () => { try { chrome.kill(); } catch { /* already gone */ } });

const portFile = join(profile, "DevToolsActivePort");
for (let i = 0; i < 100 && !existsSync(portFile); i++) await sleep(100);
if (!existsSync(portFile)) {
    console.error("Chrome did not start.");
    process.exit(2);
}
const [port, browserPath] = readFileSync(portFile, "utf8").trim().split("\n");
const ws = new WebSocket(`ws://127.0.0.1:${port}${browserPath}`);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

let nextId = 1;
const pending = new Map();
const listeners = [];
ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
        const { resolve, reject } = pending.get(message.id);
        pending.delete(message.id);
        message.error ? reject(new Error(message.error.message)) : resolve(message.result);
    } else if (message.method) {
        for (const listener of listeners) listener(message);
    }
};
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
});
const once = (method, sessionId) => new Promise((resolve) => {
    const listener = (message) => {
        if (message.method !== method || message.sessionId !== sessionId) return;
        listeners.splice(listeners.indexOf(listener), 1);
        resolve(message.params);
    };
    listeners.push(listener);
});

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);
await send("Emulation.setDeviceMetricsOverride", { width: VIEW_WIDTH, height: 6000, deviceScaleFactor: 1, mobile: false }, sessionId);
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] }, sessionId);

// Runs inside the page. Everything it needs is passed in, because the function
// is serialised and evaluated there.
const measure = String(function measure(FLOOR, READ_BELOW, OVERFLOW, OVERFLOW_VERTICAL) {
    const SVG = "http://www.w3.org/2000/svg";
    const layout = document.querySelector(".layout") || document.body;
    const layoutScale = layout.offsetWidth ? layout.getBoundingClientRect().width / layout.offsetWidth : 1;
    const isSvg = (el) => el.namespaceURI === SVG;
    const SKIP = "[class^=ie-], [class*=' ie-'], #top-ribbon-placeholder, header, .rad__index, .topic-card__kicker, .practice-card__kicker";

    const name = (el) => {
        let s = el.localName;
        if (el.id) s += `#${el.id}`;
        const cls = (typeof el.className === "string" ? el.className : el.getAttribute("class") || "").trim();
        if (cls) s += `.${cls.split(/\s+/).slice(0, 3).join(".")}`;
        return s;
    };
    const pathOf = (el) => {
        const parts = [];
        for (let e = el, n = 0; e && e !== layout && n < 4; e = e.parentElement, n++) parts.unshift(name(e));
        return parts.join(" > ");
    };
    const sectionOf = (el) => {
        const section = el.closest("section, aside, footer, nav");
        const heading = section && section.querySelector("h1, h2, h3");
        return heading ? heading.textContent.replace(/\s+/g, " ").trim().slice(0, 50) : "";
    };
    const cssScale = (el) => {
        let s = 1;
        for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
            if (isSvg(e)) continue;
            const t = getComputedStyle(e).transform;
            if (t && t !== "none") { const m = new DOMMatrix(t); s *= Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)); }
        }
        return s;
    };
    const hidden = (el) => {
        for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
            const c = getComputedStyle(e);
            if (c.display === "none" || c.visibility === "hidden" || parseFloat(c.opacity) === 0) return true;
            if (c.position === "fixed") return true;
            if (isSvg(e) && ["title", "desc", "metadata"].includes(e.localName)) return true;
            if (!isSvg(e) && c.overflow === "hidden" && e.clientWidth <= 1 && e.clientHeight <= 1) return true;
            if (/inset\(50%\)/.test(c.clipPath) || c.clip === "rect(0px, 0px, 0px, 0px)") return true;
        }
        return false;
    };
    const paddingBox = (el) => {
        const r = el.getBoundingClientRect();
        const c = getComputedStyle(el);
        return {
            left: r.left + parseFloat(c.borderLeftWidth), top: r.top + parseFloat(c.borderTopWidth),
            right: r.right - parseFloat(c.borderRightWidth), bottom: r.bottom - parseFloat(c.borderBottomWidth),
        };
    };
    const beyond = (r, box) => Math.max(box.left - r.left, r.right - box.right, box.top - r.top, r.bottom - box.bottom);
    const beyondSides = (r, box) => Math.max(box.left - r.left, r.right - box.right);
    const clips = (c) => ["hidden", "clip", "auto", "scroll"].some((v) => v === c.overflowX || v === c.overflowY);
    // A box is something drawn as one: a fill, a shadow, or borders on two
    // opposite sides. A lone border-bottom is an axis or a rule, not a box.
    const boxed = (c) => {
        const edge = (side) => parseFloat(c[`border${side}Width`]) > 0 && c[`border${side}Style`] !== "none";
        const border = (edge("Left") && edge("Right")) || (edge("Top") && edge("Bottom"));
        const fill = c.backgroundColor !== "rgba(0, 0, 0, 0)" && c.backgroundColor !== "transparent";
        return border || fill || c.backgroundImage !== "none" || c.boxShadow !== "none";
    };

    const small = new Map();
    const overflow = [];
    const noteSize = (el, size, sample, path) => {
        if (size >= READ_BELOW) return;
        const key = `${path}@${size}`;
        const record = small.get(key);
        if (record) record.count++;
        else small.set(key, { size, count: 1, sample, path, section: sectionOf(el) });
    };

    const walker = document.createTreeWalker(layout, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
        const text = node.nodeValue.replace(/\s+/g, " ").trim();
        if (!text) continue;
        const el = node.parentElement;
        if (!el || ["script", "style", "noscript", "template"].includes(el.localName)) continue;
        if (el.closest(SKIP) || hidden(el)) continue;
        const closedDetails = el.closest("details:not([open])");
        if (closedDetails && !el.closest("summary")) continue;

        const range = document.createRange();
        range.selectNodeContents(node);
        const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0 && r.height > 0);
        if (!rects.length) continue;
        const box = range.getBoundingClientRect();
        const style = getComputedStyle(el);
        if (style.color === "rgba(0, 0, 0, 0)" || style.color === "transparent") continue;

        const declared = parseFloat(style.fontSize);
        let size;
        let textEl = el;
        if (isSvg(el)) {
            textEl = el.closest("text") || el;
            const m = textEl.getScreenCTM();
            size = declared * (m ? Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) : 1) / layoutScale;
        } else {
            size = declared * cssScale(el) / layoutScale;
        }
        size = Math.round(size * 10) / 10;
        noteSize(el, size, text.slice(0, 40), pathOf(el));

        if (isSvg(el)) {
            const tb = textEl.getBoundingClientRect();
            const svg = textEl.closest("svg");
            if (svg && getComputedStyle(svg).overflow !== "visible") {
                const amount = beyond(tb, svg.getBoundingClientRect());
                if (amount > OVERFLOW) overflow.push({ text, path: pathOf(textEl), section: sectionOf(textEl), detail: `${amount.toFixed(1)}px outside its svg` });
            }
            const previous = textEl.previousElementSibling;
            const parent = textEl.parentElement;
            const cell = previous && previous.localName === "rect" ? previous
                : parent && parent.localName === "g" && parent.children.length <= 4 && parent.children[0].localName === "rect" ? parent.children[0] : null;
            if (cell) {
                const cb = cell.getBoundingClientRect();
                const overlaps = tb.left < cb.right && tb.right > cb.left && tb.top < cb.bottom && tb.bottom > cb.top;
                if (cb.width > 0 && cb.height >= tb.height * .8 && overlaps) {
                    const amount = beyond(tb, cb);
                    if (amount > 1) overflow.push({ text, path: pathOf(textEl), section: sectionOf(textEl), detail: `${amount.toFixed(1)}px beyond its rect` });
                }
            }
            continue;
        }

        for (let ancestor = el; ancestor && ancestor !== layout.parentElement; ancestor = ancestor.parentElement) {
            const c = getComputedStyle(ancestor);
            const clipping = clips(c);
            const container = clipping || boxed(c) || ancestor === layout || ancestor.localName === "td" || ancestor.localName === "th";
            if (!container) continue;
            const pb = paddingBox(ancestor);
            // A tick or a rule a label hangs off is not a box meant to hold it,
            // and a label set wholly outside a box — above a bracket, under an
            // axis — was put there; spill is text that crosses an edge.
            if (pb.right - pb.left < 8 || pb.bottom - pb.top < 8) continue;
            if (box.right <= pb.left || box.left >= pb.right || box.bottom <= pb.top || box.top >= pb.bottom) continue;
            const amount = beyond(box, pb);
            if (amount <= OVERFLOW) continue;
            if (!clipping && beyondSides(box, pb) <= OVERFLOW && amount <= OVERFLOW_VERTICAL) continue;
            overflow.push({ text: text.slice(0, 50), path: pathOf(el), section: sectionOf(el), detail: `${amount.toFixed(1)}px beyond ${name(ancestor)}${clipping ? " (clipped)" : ""}` });
            break;
        }
    }

    for (const el of layout.querySelectorAll("input, select, textarea")) {
        if (el.closest(SKIP) || hidden(el)) continue;
        const c = getComputedStyle(el);
        noteSize(el, Math.round(parseFloat(c.fontSize) * cssScale(el) / layoutScale * 10) / 10, `<${el.localName} ${el.value || el.placeholder || ""}>`, pathOf(el));
        if (el.value && el.scrollWidth > el.clientWidth + 1) {
            overflow.push({ text: el.value, path: pathOf(el), section: sectionOf(el), detail: `value ${el.scrollWidth - el.clientWidth}px wider than the control` });
        }
    }
    for (const el of layout.querySelectorAll("*")) {
        if (el.closest(SKIP) || el.closest(".recap")) continue;
        for (const pseudo of ["::before", "::after"]) {
            const c = getComputedStyle(el, pseudo);
            if (!/^["']|attr\(|counter/.test(c.content) || c.display === "none" || hidden(el)) continue;
            noteSize(el, Math.round(parseFloat(c.fontSize) * cssScale(el) / layoutScale * 10) / 10, `${pseudo} ${c.content.slice(0, 30)}`, `${pathOf(el)}${pseudo}`);
        }
    }

    return { small: Array.from(small.values()).sort((a, b) => a.size - b.size), overflow, floor: FLOOR };
});

let failures = 0;
for (const page of pages) {
    const url = `${ORIGIN}${BASE}/${page.replace(/^\/+/, "")}`;
    const loaded = once("Page.loadEventFired", sessionId);
    await send("Page.navigate", { url }, sessionId);
    await loaded;
    // Fonts first, then a sweep down the page so anything that waits for the
    // reader to reach it has been reached, then back to the top.
    await send("Runtime.evaluate", {
        expression: `(async () => { await document.fonts.ready; const reveal = document.querySelector(".lesson-flowbar__toggle"); if (reveal && reveal.textContent.includes("Show whole")) reveal.click(); const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 800) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 600)); })()`,
        awaitPromise: true,
    }, sessionId);
    const { result, exceptionDetails } = await send("Runtime.evaluate", {
        expression: `(${measure})(${FLOOR}, ${READ_BELOW}, ${OVERFLOW}, ${OVERFLOW_VERTICAL})`,
        returnByValue: true,
    }, sessionId);
    if (exceptionDetails) {
        console.error(`${page}: ${exceptionDetails.exception?.description || exceptionDetails.text}`);
        failures++;
        continue;
    }
    const { small, overflow } = result.value;
    const under = small.filter((s) => s.size < FLOOR);
    const read = small.filter((s) => s.size >= FLOOR);
    console.log(`\n${page}`);
    for (const s of under) console.log(`  FAIL ${s.size}px ×${s.count}  ${s.path}  "${s.sample}"  [${s.section}]`);
    for (const f of overflow) console.log(`  FAIL ${f.detail}  ${f.path}  "${f.text}"  [${f.section}]`);
    for (const s of read) console.log(`  read ${s.size}px ×${s.count}  ${s.path}  "${s.sample}"  [${s.section}]`);
    if (!under.length && !overflow.length && !read.length) console.log("  nothing under 14px, nothing outside its box");
    failures += under.length + overflow.length;
}

ws.close();
chrome.kill();
console.log(`\n${pages.length} page${pages.length === 1 ? "" : "s"} rendered; ${failures} failure${failures === 1 ? "" : "s"}.`);
process.exit(failures ? 1 : 0);
