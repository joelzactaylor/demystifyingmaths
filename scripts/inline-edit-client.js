/* Inline editing of page text — TEMPORARY. Served by scripts/serve.mjs, which
   adds this script to every teaching page; a deployed page never carries it.

   A small panel sits at the right of the window with a switch; while the
   editor is on, hovering any text puts a pencil at the right edge of its
   block. Click the pencil, or Alt+click the text itself, and the block becomes
   editable where it stands. Enter, or a click elsewhere on the page, saves;
   Escape cancels. An SVG or MathML label opens a small box over itself
   instead. Selecting a block also fills the panel, which walks up to the
   block's ancestors, deletes the selected element, and inserts a new one
   before, after or inside it. The last save can be undone from the notice it
   leaves.

   Where an edit goes. Text is looked for in three places, in order: the page's
   own HTML, the embeds the page fetched (the ribbon), and the scripts the page
   loads — a caption a scene draws is a string literal in js/<page>.js, and a
   template literal with ${…} in it is a pattern whose fixed parts can be
   edited and whose computed parts cannot. A save is the smallest splice that
   produces the new text, through whatever the text is written behind: an
   entity in HTML, an escape in a JS string, both when a literal holds markup.
   When a caption is drawn over a static placeholder that says the same thing,
   the placeholder is updated with it.

   How a block finds its place in the HTML. The source is tokenised into
   elements and text runs, and the DOM is read the same way — a text node is a
   run. A block is located by the tag and exact runs of the nearest ancestor
   whose (tag, runs) pair occurs once in the source, and by its offset within
   it: a "3" in a grid of digits is found by the grid, not by counting 3s. The
   glossary's spoken definitions, which a script adds inside prose, are skipped
   when runs are read. The server writes nothing unless the file still holds
   exactly the text the page showed, so a file edited elsewhere since the page
   loaded refuses politely rather than landing the change somewhere else. */
(() => {
    "use strict";

    const BASE = document.currentScript
        ? new URL(document.currentScript.src).pathname.replace(/\/__edit\.js$/, "")
        : "/demystifyingmaths";
    const ROUTE = BASE + "/__edit";
    const XHTML = "http://www.w3.org/1999/xhtml";
    const PAGE = location.pathname;

    /* Elements scripts insert inside the source's own prose. Anything else a
       script adds is a whole block of its own and is found in the script. */
    const INJECTED = ".gloss__spoken";
    const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
    const RAW = new Set(["script", "style"]);
    const RCDATA = new Set(["textarea", "title"]);

    /* Characters the pages write as named entities; typed text is written the
       same way so an edit reads like the prose around it. */
    const HOUSE = {
        "—": "&mdash;", "–": "&ndash;", "×": "&times;", "÷": "&divide;",
        "−": "&minus;", "…": "&hellip;", "→": "&rarr;", "←": "&larr;",
        "≠": "&ne;", "≤": "&le;", "≥": "&ge;", "±": "&plusmn;",
        "°": "&deg;", "π": "&pi;", "²": "&sup2;", "³": "&sup3;",
        "·": "&middot;", "’": "&rsquo;", "‘": "&lsquo;", "“": "&ldquo;",
        "”": "&rdquo;", "£": "&pound;", "√": "&radic;", "\u00a0": "&nbsp;",
        "©": "&copy;", "›": "&rsaquo;",
    };
    const HOUSE_RE = new RegExp(`[${Object.keys(HOUSE).join("")}]`, "g");
    const houseEncode = (s) => s.replace(HOUSE_RE, (c) => HOUSE[c]);
    const encode = (s) => houseEncode(s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]));

    /* ================================================================
       Layers: each turns a stretch of source into the text the reader
       sees, and keeps for every character the offset it came from.
       ================================================================ */

    /* HTML entities, decoded by the browser itself so a run in the source is
       exactly the text of the DOM's node. */
    const ENTITY = /&(?:#[xX][0-9a-fA-F]+|#\d+|[A-Za-z][A-Za-z0-9]*);/g;
    const decoder = document.createElement("textarea");
    const decoded = new Map();
    const entity = (ref) => {
        let d = decoded.get(ref);
        if (d === undefined) { decoder.innerHTML = ref; d = decoder.value; decoded.set(ref, d); }
        return d;
    };
    /* raw -> { text, map }, map[j] the raw offset where character j starts and
       map[text.length] the raw length. */
    const decodeMap = (raw) => {
        let text = "", last = 0;
        const map = [];
        for (const m of raw.matchAll(ENTITY)) {
            for (let k = last; k < m.index; k++) map.push(k);
            text += raw.slice(last, m.index);
            const d = entity(m[0]);
            if (d === m[0]) { for (let k = 0; k < d.length; k++) map.push(m.index + k); }
            else { for (let k = 0; k < d.length; k++) map.push(m.index); }
            text += d;
            last = m.index + m[0].length;
        }
        for (let k = last; k < raw.length; k++) map.push(k);
        text += raw.slice(last);
        map.push(raw.length);
        return { text, map };
    };
    const decode = (raw) => raw.includes("&") ? decodeMap(raw).text : raw;

    /* The source wraps its lines: a newline with the indentation around it is
       one space to the reader, and the ends of a run are nothing. */
    const collapseMap = (text) => {
        const lead = text.match(/^[ \t\n]*/)[0].length;
        const trail = text.match(/[ \t\n]*$/)[0].length;
        const end = Math.max(lead, text.length - trail);
        let out = "";
        const map = [];
        for (let i = lead; i < end;) {
            const m = /^[ \t]*\n[ \t\n]*/.exec(text.slice(i, i + 200));
            if (m) { out += " "; map.push(i); i += m[0].length; continue; }
            out += text[i]; map.push(i); i++;
        }
        map.push(end);
        return { text: out, map };
    };
    const collapse = (s) => collapseMap(s).text;

    /* A JS string literal's body -> its value; template literals normalise
       line endings as well. */
    const cookJs = (raw, template) => {
        let value = "";
        const map = [];
        for (let i = 0; i < raw.length;) {
            const c = raw[i];
            if (c === "\\") {
                const d = raw[i + 1];
                let out = d ?? "", len = 2;
                switch (d) {
                    case "n": out = "\n"; break;
                    case "t": out = "\t"; break;
                    case "r": out = "\r"; break;
                    case "b": out = "\b"; break;
                    case "f": out = "\f"; break;
                    case "v": out = "\v"; break;
                    case "0": out = "\0"; break;
                    case "x": out = String.fromCharCode(parseInt(raw.substr(i + 2, 2), 16)); len = 4; break;
                    case "u":
                        if (raw[i + 2] === "{") { const e = raw.indexOf("}", i); out = String.fromCodePoint(parseInt(raw.slice(i + 3, e), 16)); len = e - i + 1; }
                        else { out = String.fromCharCode(parseInt(raw.substr(i + 2, 4), 16)); len = 6; }
                        break;
                    case "\r": out = ""; len = raw[i + 2] === "\n" ? 3 : 2; break;
                    case "\n": out = ""; break;
                }
                for (let k = 0; k < out.length; k++) map.push(i);
                value += out;
                i += len;
                continue;
            }
            if (template && c === "\r") { map.push(i); value += "\n"; i += raw[i + 1] === "\n" ? 2 : 1; continue; }
            map.push(i);
            value += c;
            i++;
        }
        map.push(raw.length);
        return { value, map };
    };
    const jsEscape = (s, quote) => {
        const out = s.replace(/[\\\r\n]/g, (c) => ({ "\\": "\\\\", "\r": "\\r", "\n": "\\n" })[c]);
        return quote === "`" ? out.replace(/`|\$\{/g, (m) => "\\" + m) : out.replaceAll(quote, "\\" + quote);
    };

    /* ================================================================
       The HTML source, tokenised the way the parser reads it.
       ================================================================ */
    const OPEN = /<(\/?)([A-Za-z][^\s/>]*)/y;

    const tokenize = (src) => {
        const texts = [];      /* { start, end, text } — one per text node */
        const elements = [];   /* { tag, openStart, openEnd, closeStart, closeEnd, depth, tokFrom, tokTo } */
        const stack = [];
        const n = src.length;
        let i = 0, textStart = 0, foreign = 0;

        const flush = (end) => {
            if (end > textStart) texts.push({ start: textStart, end, text: decode(src.slice(textStart, end)) });
        };
        const close = (el, closeStart, closeEnd) => {
            el.closeStart = closeStart; el.closeEnd = closeEnd; el.tokTo = texts.length;
            if (el.tag === "svg" || el.tag === "math") foreign--;
        };

        while (i < n) {
            const lt = src.indexOf("<", i);
            if (lt < 0) break;
            const c = src[lt + 1];
            if (c === "!" || c === "?") {   /* comment, doctype, or bogus */
                let end;
                if (src.startsWith("<!--", lt)) { const e = src.indexOf("-->", lt + 4); end = e < 0 ? n : e + 3; }
                else { const e = src.indexOf(">", lt); end = e < 0 ? n : e + 1; }
                flush(lt);
                i = textStart = end;
                continue;
            }
            OPEN.lastIndex = lt;
            const m = OPEN.exec(src);
            if (!m) { i = lt + 1; continue; }   /* a bare "<" in text */

            let j = lt + m[0].length, selfClosing = false;
            while (j < n) {
                const ch = src[j];
                if (ch === '"' || ch === "'") { const e = src.indexOf(ch, j + 1); j = e < 0 ? n : e + 1; continue; }
                if (ch === ">") break;
                if (ch === "/" && src[j + 1] === ">") { selfClosing = true; j++; break; }
                j++;
            }
            let tagEnd = Math.min(j + 1, n);
            const tag = m[2].toLowerCase();
            flush(lt);

            if (m[1] === "/") {
                let k = stack.length - 1;
                while (k >= 0 && stack[k].tag !== tag) k--;
                if (k >= 0) {
                    while (stack.length > k + 1) close(stack.pop(), lt, lt);
                    close(stack.pop(), lt, tagEnd);
                }
                i = textStart = tagEnd;
                continue;
            }

            const el = { tag, openStart: lt, openEnd: tagEnd, closeStart: -1, closeEnd: -1, depth: stack.length, tokFrom: texts.length, tokTo: -1 };
            elements.push(el);
            if (VOID.has(tag) || (selfClosing && foreign > 0)) {
                el.closeStart = el.closeEnd = tagEnd; el.tokTo = texts.length;
                i = textStart = tagEnd;
                continue;
            }
            stack.push(el);
            if (tag === "svg" || tag === "math") foreign++;
            if (RAW.has(tag) || RCDATA.has(tag)) {
                const re = new RegExp(`</${tag}(?=[\\s/>])`, "ig");
                re.lastIndex = tagEnd;
                const mm = re.exec(src);
                const end = mm ? mm.index : n;
                let s = tagEnd;
                if (tag === "textarea" && src[s] === "\n") s++;
                if (end > s) texts.push({ start: s, end, text: RAW.has(tag) ? src.slice(s, end) : decode(src.slice(s, end)) });
                i = textStart = end;
                continue;
            }
            /* The parser drops a newline that directly follows these. */
            if ((tag === "pre" || tag === "listing") && src[tagEnd] === "\n") tagEnd++;
            i = textStart = tagEnd;
        }
        flush(n);
        while (stack.length) close(stack.pop(), n, n);
        return { texts, elements };
    };

    const keyOf = (tag, runs) => tag + "\0" + JSON.stringify(runs);
    const ckeyOf = (tag, runs) => tag + "\u0001" + JSON.stringify(runs.map(collapse));

    const htmlIndex = (src, path) => {
        const { texts, elements } = tokenize(src);
        const byKey = new Map(), byCKey = new Map();
        const add = (map, key, el) => { if (!map.has(key)) map.set(key, []); map.get(key).push(el); };
        for (const el of elements) {
            if (el.tokTo <= el.tokFrom) continue;
            const runs = texts.slice(el.tokFrom, el.tokTo).map((t) => t.text);
            add(byKey, keyOf(el.tag, runs), el);
            add(byCKey, ckeyOf(el.tag, runs), el);
        }
        return { kind: "html", path, src, texts, elements, byKey, byCKey };
    };

    /* ================================================================
       A script's string literals, as the text they produce.
       ================================================================ */

    /* Every string literal's body, skipping comments and regex literals.
       A misjudged "/" is harmless: a literal is only ever used when its
       value is exactly the text the page shows. */
    const jsLiterals = (src) => {
        const out = [];
        const n = src.length;
        let i = 0, last = "";
        const REGEX_AFTER = new Set(["", "(", ",", "=", ":", "[", "!", "&", "|", "?", "{", "}", ";", "+", "-", "*", "%", "<", ">", "~", "^"]);
        const skipQuoted = (q, from) => {   /* from: index after the opening quote; returns the closing quote's index */
            let j = from;
            while (j < n && src[j] !== q) {
                if (src[j] === "\\") j++;
                else if (src[j] === "\n" && q !== "`") break;
                else if (q === "`" && src[j] === "$" && src[j + 1] === "{") { j = skipInterpolation(j + 2); continue; }
                j++;
            }
            return j;
        };
        const skipInterpolation = (from) => {   /* from: index after "${"; returns the index after the closing "}" */
            let depth = 1, j = from;
            while (j < n && depth) {
                const c = src[j];
                if (c === '"' || c === "'" || c === "`") { j = skipQuoted(c, j + 1) + 1; continue; }
                if (c === "{") depth++;
                else if (c === "}") depth--;
                j++;
            }
            return j;
        };
        while (i < n) {
            const c = src[i];
            if (c === "/" && src[i + 1] === "/") { const e = src.indexOf("\n", i); i = e < 0 ? n : e; continue; }
            if (c === "/" && src[i + 1] === "*") { const e = src.indexOf("*/", i + 2); i = e < 0 ? n : e + 2; continue; }
            if (c === '"' || c === "'" || c === "`") {
                const end = skipQuoted(c, i + 1);
                out.push({ quote: c, start: i + 1, end });
                i = end + 1;
                last = c;
                continue;
            }
            if (c === "/" && REGEX_AFTER.has(last)) {
                let j = i + 1, cls = false;
                while (j < n) {
                    const ch = src[j];
                    if (ch === "\\") { j += 2; continue; }
                    if (ch === "[") cls = true;
                    else if (ch === "]") cls = false;
                    else if (ch === "/" && !cls) break;
                    else if (ch === "\n") break;
                    j++;
                }
                i = j + 1;
                last = "/";
                continue;
            }
            if (!/\s/.test(c)) last = c;
            i++;
        }
        return out;
    };

    /* A template's fixed parts: the raw body split at each ${…}. */
    const templateSegments = (raw) => {
        const segs = [];
        let from = 0, i = 0;
        while (i < raw.length) {
            if (raw[i] === "\\") { i += 2; continue; }
            if (raw[i] === "$" && raw[i + 1] === "{") {
                segs.push({ rawFrom: from, rawTo: i });
                let depth = 1, j = i + 2;
                while (j < raw.length && depth) {
                    const c = raw[j];
                    if (c === '"' || c === "'" || c === "`") { j++; while (j < raw.length && raw[j] !== c) { if (raw[j] === "\\") j++; j++; } j++; continue; }
                    if (c === "{") depth++;
                    else if (c === "}") depth--;
                    j++;
                }
                from = i = j;
                continue;
            }
            i++;
        }
        segs.push({ rawFrom: from, rawTo: raw.length });
        return segs;
    };

    const jsIndex = (src, path) => {
        const exact = new Map();     /* JSON(runs) -> entries whose value reads as those runs */
        const patterns = [];         /* templates with ${…} */
        const add = (key, e) => { if (!exact.has(key)) exact.set(key, []); exact.get(key).push(e); };
        for (const lit of jsLiterals(src)) {
            const raw = src.slice(lit.start, lit.end);
            const base = { quote: lit.quote, bodyStart: lit.start, raw };
            if (lit.quote === "`" && /(^|[^\\])\$\{/.test(raw)) {
                const segs = templateSegments(raw).map((s) => ({ ...s, ...cookJs(raw.slice(s.rawFrom, s.rawTo), true) }));
                if (segs.reduce((n, s) => n + s.value.length, 0) >= 3) patterns.push({ ...base, type: "pattern", segs });
                continue;
            }
            const cooked = cookJs(raw, lit.quote === "`");
            if (!cooked.value) continue;
            add(JSON.stringify([cooked.value]), { ...base, type: "plain", ...cooked });
            if (/<[a-zA-Z]|&[#\w]+;/.test(cooked.value)) {
                const { texts } = tokenize(cooked.value);
                if (texts.length) add(JSON.stringify(texts.map((t) => t.text)), { ...base, type: "html", ...cooked, texts });
            }
        }
        return { kind: "js", path, src, exact, patterns };
    };

    /* ================================================================
       Runs and groups: a stretch of text with the file offset of each
       of its characters, and how new text must be written there.
       ================================================================ */
    const run = (index, text, map, encodeAs) => ({ path: index.path, src: index.src, text, map, encode: encodeAs });
    const htmlRun = (index, tok) => {
        const d = decodeMap(index.src.slice(tok.start, tok.end));
        return run(index, d.text, d.map.map((o) => tok.start + o), encode);
    };
    const htmlCollapsedRun = (index, tok) => {
        const d = decodeMap(index.src.slice(tok.start, tok.end));
        const c = collapseMap(d.text);
        return run(index, c.text, c.map.map((i) => tok.start + d.map[i]), encode);
    };
    const jsPlainRun = (index, e) => run(index, e.value, e.map.map((o) => e.bodyStart + o), (s) => jsEscape(s, e.quote));
    const jsHtmlRun = (index, e, tok) => {
        const d = decodeMap(e.value.slice(tok.start, tok.end));
        return run(index, d.text, d.map.map((o) => e.bodyStart + e.map[tok.start + o]), (s) => jsEscape(encode(s), e.quote));
    };
    const jsSegRun = (index, e, seg) => run(index, seg.value, seg.map.map((o) => e.bodyStart + seg.rawFrom + o), (s) => jsEscape(s, "`"));

    /* A group is the pieces of one DOM run that live in the file, by their
       spans in the run's text; a plain run is one piece covering it all. */
    const whole = (r) => ({ pieces: [{ from: 0, to: r.text.length, run: r }] });

    const diff = (o, w) => {
        let a = 0, b = 0;
        while (a < o.length && a < w.length && o[a] === w[a]) a++;
        while (b < o.length - a && b < w.length - a && o[o.length - 1 - b] === w[w.length - 1 - b]) b++;
        /* never split a surrogate pair */
        if (a > 0 && o.charCodeAt(a - 1) >= 0xd800 && o.charCodeAt(a - 1) < 0xdc00) a--;
        if (b > 0 && o.charCodeAt(o.length - b) >= 0xdc00 && o.charCodeAt(o.length - b) < 0xe000) b--;
        return [a, b];
    };

    /* The smallest splice that turns the run's text into newText. */
    const spliceRun = (r, oldText, newText) => {
        if (r.text !== oldText) throw new Error("the page and its source disagree here");
        /* The source wraps its lines; a newline and the indentation after it
           is one space to the browser, and typing beside it makes the browser
           drop it. It is formatting, not text, so the run keeps the folds it
           began and ended with. */
        let w = newText;
        const tail = oldText.match(/([ \t]*\n)+[ \t]*$/);
        if (tail && !/\n[ \t]*$/.test(w)) w = w.replace(/[ \t\u00a0]*$/, "") + tail[0];
        const head = oldText.match(/^[ \t]*(\n[ \t]*)+/);
        if (head && !/^[ \t]*\n/.test(w)) w = head[0] + w.replace(/^[ \t\u00a0]*/, "");
        let [a, b] = diff(oldText, w);
        /* A space contenteditable turned into U+00A0 to keep it visible goes
           back to a space; a space left before a line break is dropped, so the
           file never gains trailing whitespace. Both touch typed text only. */
        const mid = w.slice(a, w.length - b).replace(/\u00a0/g, " ");
        const result = (oldText.slice(0, a) + mid + oldText.slice(oldText.length - b)).replace(/[ \t]+\n/g, "\n");
        if (result === oldText) return null;
        [a, b] = diff(oldText, result);
        const s = r.map[a], e = r.map[oldText.length - b];
        return { path: r.path, start: s, end: e, expect: r.src.slice(s, e), text: r.encode(result.slice(a, result.length - b)) };
    };

    const spliceGroup = (g, oldText, newText) => {
        if (oldText === newText) return null;
        const [a, b] = diff(oldText, newText);
        const end = oldText.length - b;
        const p = g.pieces.find((x) => x.from <= a && end <= x.to);
        if (!p) throw new Error("that part of the caption is computed by the page's script");
        return spliceRun(p.run, oldText.slice(p.from, p.to), newText.slice(p.from, newText.length - (oldText.length - p.to)));
    };

    /* ================================================================
       The DOM, read as runs.
       ================================================================ */
    const isInjected = (el) => el.matches(INJECTED) || el.classList.contains("ie-ui");
    const walker = (root) => document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => node.nodeType === 1 && isInjected(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });
    const textNodes = (root) => {
        const out = [];
        const w = walker(root);
        for (let node = w.nextNode(); node; node = w.nextNode()) if (node.nodeType === 3) out.push(node);
        return out;
    };
    const runsOf = (root) => textNodes(root).map((t) => t.data);
    /* Element tags and text positions in tree order: unchanged between the
       start and end of an edit means every run still has its counterpart. */
    const shapeOf = (root) => {
        const parts = [];
        const w = walker(root);
        for (let node = w.nextNode(); node; node = w.nextNode()) parts.push(node.nodeType === 1 ? node.localName : "#");
        return parts.join(" ");
    };
    const tagOf = (el) => el.localName;

    /* ================================================================
       Locating: where a DOM element is, in terms that survive the
       source changing elsewhere.
       ================================================================ */

    /* In HTML: the key of the nearest ancestor unique in the source, and the
       block's place within it. `collapsed` matches through line wrapping,
       which finds the static placeholder a script has drawn over. */
    const locateHtml = (index, unit, collapsed = false) => {
        const runs = runsOf(unit);
        if (!runs.length) return null;
        const map = collapsed ? index.byCKey : index.byKey;
        const key = collapsed ? ckeyOf : keyOf;
        let anchor = unit, depth = 0;
        for (;;) {
            const anchorKey = key(tagOf(anchor), anchor === unit ? runs : runsOf(anchor));
            const matches = map.get(anchorKey);
            if (!matches) return null;
            if (matches.length === 1) {
                const k = anchor === unit ? 0 : textNodes(anchor).indexOf(textNodes(unit)[0]);
                return { kind: "html", path: index.path, anchorKey, k, n: runs.length, tag: tagOf(unit), depth, runs, collapsed };
            }
            const parent = anchor.parentElement;
            if (!parent || parent === document.body || parent === document.documentElement) return null;
            anchor = parent;
            depth++;
        }
    };

    const resolveHtml = (index, loc) => {
        const anchors = (loc.collapsed ? index.byCKey : index.byKey).get(loc.anchorKey);
        if (!anchors || anchors.length !== 1) return null;
        const a = anchors[0];
        const from = a.tokFrom + loc.k, to = from + loc.n;
        if (loc.k < 0 || to > a.tokTo) return null;
        const found = index.elements.filter((e) =>
            e.tag === loc.tag && e.tokFrom === from && e.tokTo === to &&
            e.openStart >= a.openStart && e.closeEnd <= a.closeEnd && e.depth - a.depth === loc.depth);
        if (found.length !== 1) return null;
        for (let i = 0; i < loc.n; i++) {
            const t = index.texts[from + i].text;
            if (loc.collapsed ? collapse(t) !== collapse(loc.runs[i]) : t !== loc.runs[i]) return null;
        }
        return found[0];
    };

    /* In a script: one group per DOM run, or null for a run the script
       computes. Null altogether when nothing in the block is in the file. */
    const matchPattern = (index, text) => {
        let best = null, bestLen = -1, tie = false;
        for (const e of index.patterns) {
            const segs = e.segs;
            if (!text.startsWith(segs[0].value)) continue;
            const pieces = [{ from: 0, to: segs[0].value.length, seg: segs[0] }];
            let pos = segs[0].value.length, ok = true;
            for (let i = 1; i < segs.length - 1; i++) {
                const at = text.indexOf(segs[i].value, pos);
                if (at < 0) { ok = false; break; }
                pieces.push({ from: at, to: at + segs[i].value.length, seg: segs[i] });
                pos = at + segs[i].value.length;
            }
            const lastSeg = segs[segs.length - 1];
            if (!ok || !text.endsWith(lastSeg.value) || text.length - lastSeg.value.length < pos) continue;
            pieces.push({ from: text.length - lastSeg.value.length, to: text.length, seg: lastSeg });
            const len = segs.reduce((n, s) => n + s.value.length, 0);
            if (len > bestLen) { best = { e, pieces }; bestLen = len; tie = false; }
            else if (len === bestLen) tie = true;
        }
        if (!best || tie) return null;
        return { pieces: best.pieces.map((p) => ({ from: p.from, to: p.to, run: jsSegRun(index, best.e, p.seg) })) };
    };
    const matchJs = (index, runs) => {
        const wholeMatch = (index.exact.get(JSON.stringify(runs)) ?? []).filter((e) => e.type === "html" || runs.length === 1);
        if (wholeMatch.length === 1) {
            const e = wholeMatch[0];
            return e.type === "html" ? e.texts.map((tok) => whole(jsHtmlRun(index, e, tok))) : [whole(jsPlainRun(index, e))];
        }
        if (wholeMatch.length > 1) return null;
        let any = false;
        const groups = runs.map((r) => {
            if (!r.trim()) return null;
            const plain = (index.exact.get(JSON.stringify([r])) ?? []).filter((e) => e.type === "plain");
            const g = plain.length === 1 ? whole(jsPlainRun(index, plain[0])) : plain.length ? null : matchPattern(index, r);
            if (g) any = true;
            return g;
        });
        return any ? groups : null;
    };

    /* ---- Sources: the page, its embeds, its scripts ---- */
    const sources = new Map();   /* path -> index */
    let order = [];              /* paths, in the order text is looked for */

    const fetchSource = async (path) => {
        const r = await fetch(`${ROUTE}?path=${encodeURIComponent(path)}`, { cache: "no-store" });
        if (!r.ok) throw new Error(`could not read ${path} (${r.status})`);
        return r.text();
    };
    const loadSource = async (path) => {
        const src = await fetchSource(path);
        sources.set(path, path.endsWith(".js") ? jsIndex(src, path) : htmlIndex(src, path));
    };
    const refresh = async (paths = order) => { await Promise.all(paths.map(loadSource)); };
    const load = async () => {
        await loadSource(PAGE);
        const embeds = [...new Set(sources.get(PAGE).src.match(new RegExp(`${BASE}/embed/[\\w-]+\\.html`, "g")) ?? [])];
        const shared = new Set(["navPanel.js", "glossary.js"]);
        const scripts = [...document.scripts].map((s) => s.src && new URL(s.src).pathname)
            .filter((p) => p && p.startsWith(`${BASE}/js/`));
        scripts.sort((a, b) => shared.has(a.split("/").pop()) - shared.has(b.split("/").pop()));
        order = [PAGE, ...embeds, ...scripts];
        await refresh(order.slice(1));
    };

    const pageIndex = () => sources.get(PAGE);
    const short = (path) => path.replace(`${BASE}/`, "");

    /* Where a DOM element's text lives, or null. */
    const locate = (unit) => {
        for (const path of order) {
            const index = sources.get(path);
            if (!index) continue;
            if (index.kind === "html") {
                const loc = locateHtml(index, unit);
                if (loc && resolveHtml(index, loc)) return loc;
            } else {
                const runs = runsOf(unit);
                if (runs.length && matchJs(index, runs))
                    return { kind: "js", path, runs, companion: locateHtml(pageIndex(), unit, true) };
            }
        }
        return null;
    };
    const eligible = (unit) => Boolean(unit && order.length && locate(unit));

    /* ================================================================
       Which element under the mouse is the thing to edit.
       ================================================================ */
    const isInline = (el) => {
        const d = getComputedStyle(el).display;
        return d.startsWith("inline") || d === "contents" || d.startsWith("ruby");
    };
    /* Text of its own, not counting text that belongs to a block inside it. */
    const hasOwnText = (el) => {
        const w = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => node.nodeType === 1
                ? (isInjected(node) || !isInline(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP)
                : NodeFilter.FILTER_ACCEPT,
        });
        for (let node = w.nextNode(); node; node = w.nextNode()) if (node.data.trim()) return true;
        return false;
    };
    /* undefined: over the editor's own furniture; null: nothing to edit. */
    const unitFor = (node) => {
        let el = node.nodeType === 1 ? node : node.parentElement;
        if (!el || el.closest(".ie-ui")) return undefined;
        if (el.namespaceURI !== XHTML) {
            /* SVG and MathML: the element around one run — a label, a digit. */
            const runs = runsOf(el);
            return runs.length === 1 && runs[0].trim() ? el : null;
        }
        for (; el && el !== document.body; el = el.parentElement) {
            const d = getComputedStyle(el).display;
            if (d === "none") return null;
            if (isInline(el) || isInjected(el)) continue;
            if (hasOwnText(el)) return el;
        }
        return null;
    };
    const isUnit = (el) => el.namespaceURI !== XHTML ? runsOf(el).length === 1 : (!isInline(el) && hasOwnText(el));

    /* ================================================================
       The furniture: a pencil, a hint, a notice, a box for SVG text,
       and the panel with its switch.
       ================================================================ */
    const style = document.createElement("style");
    style.className = "ie-ui";
    style.textContent = `
        .ie-hover { outline: 1px dashed rgba(30, 40, 50, .35) !important; outline-offset: 2px; }
        .ie-selected { outline: 1px solid rgba(30, 40, 50, .3) !important; outline-offset: 2px; }
        .ie-editing { outline: 2px solid rgba(30, 40, 50, .5) !important; outline-offset: 2px; caret-color: #111; }
        .ie-pencil, .ie-hint, .ie-box { position: absolute; z-index: 2147483000; font: 12px/18px system-ui, sans-serif; }
        .ie-pencil { width: 20px; height: 20px; padding: 0; border: 0; border-radius: 3px; cursor: pointer;
            background: rgba(255, 255, 255, .92); color: #333; opacity: .65; box-shadow: 0 0 0 1px rgba(0, 0, 0, .18); }
        .ie-pencil:hover { opacity: 1; }
        .ie-hint { padding: 0 6px; border-radius: 3px; white-space: nowrap; pointer-events: none;
            background: rgba(255, 255, 255, .92); color: #555; box-shadow: 0 0 0 1px rgba(0, 0, 0, .12); }
        .ie-box { font-size: 13px; line-height: 1.3; padding: 2px 4px; border: 1px solid #777; border-radius: 3px;
            background: #fff; color: #111; resize: none; min-width: 120px; overflow: hidden; }
        .ie-toast { position: fixed; left: 12px; bottom: 12px; z-index: 2147483001; padding: 5px 10px; border-radius: 4px;
            font: 12px/18px system-ui, sans-serif; background: #222; color: #eee; opacity: .94; max-width: 60vw; }
        .ie-toast.is-error { background: #7a1d1d; }
        .ie-toast a { color: #9cf; cursor: pointer; margin-left: 10px; text-decoration: underline; }
        .ie-panel { position: fixed; right: 12px; top: 140px; width: clamp(176px, calc((100vw - 900px) / 2 - 20px), 300px);
            max-height: calc(100vh - 160px); overflow: auto; z-index: 2147483000; padding: 8px 12px;
            font: 12px/1.45 system-ui, sans-serif; color: #223; background: #fff; border: 1px solid #ccd; border-radius: 10px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, .12); box-sizing: border-box; }
        .ie-panel__head { display: flex; justify-content: space-between; align-items: center; }
        .ie-panel__body { margin-top: 8px; }
        .ie-switch { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; color: #556; user-select: none; }
        .ie-switch input { position: absolute; opacity: 0; width: 0; height: 0; }
        .ie-switch i { width: 28px; height: 16px; border-radius: 8px; background: #bbc; position: relative; transition: background .15s; }
        .ie-switch i::after { content: ""; position: absolute; top: 2px; left: 2px; width: 12px; height: 12px; border-radius: 6px; background: #fff; transition: left .15s; }
        .ie-switch input:checked + i { background: #2a7; }
        .ie-switch input:checked + i::after { left: 14px; }
        .ie-switch input:focus-visible + i { outline: 2px solid #59f; outline-offset: 1px; }
        .ie-panel button { font: inherit; padding: 3px 8px; border: 1px solid #99a; border-radius: 5px; background: #f6f7f9; color: #223; cursor: pointer; }
        .ie-panel button:disabled { opacity: .45; cursor: default; }
        .ie-panel button.is-danger { border-color: #b66; color: #922; }
        .ie-panel__tree { max-height: 42vh; overflow: auto; margin: 0 0 8px; padding: 2px 0; border: 1px solid #e3e5ea; border-radius: 6px;
            font: 11px/1.5 ui-monospace, Menlo, monospace; white-space: nowrap; }
        .ie-tree__row { display: flex; align-items: baseline; gap: 3px; cursor: pointer; padding-right: 6px; }
        .ie-tree__row:hover { background: #f1f4f8; }
        .ie-tree__row.is-current { background: #dce8f5; }
        .ie-tree__row.is-dim .ie-tree__name { color: #99a; }
        .ie-tree__tog { width: 10px; flex: none; color: #889; text-align: center; }
        .ie-tree__name { color: #236; flex: none; }
        .ie-tree__text { color: #778; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
        .ie-peek { outline: 1px dashed rgba(30, 40, 50, .35) !important; outline-offset: 2px; }
        .ie-panel__what { color: #445; margin-bottom: 8px; overflow-wrap: anywhere; }
        .ie-panel__row { display: flex; gap: 6px; align-items: center; margin-bottom: 10px; }
        .ie-panel__insert { border-top: 1px solid #e3e5ea; padding-top: 8px; display: grid; gap: 6px; }
        .ie-panel__insert b { font-weight: 600; }
        .ie-panel select, .ie-panel textarea { font: inherit; width: 100%; box-sizing: border-box; border: 1px solid #bbc;
            border-radius: 5px; padding: 3px 4px; background: #fff; color: #223; }
        .ie-panel textarea { font-family: ui-monospace, monospace; font-size: 11px; resize: vertical; }
        .ie-panel__note { color: #778; }`;
    document.head.append(style);

    const make = (tag, cls, text) => {
        const el = document.createElement(tag);
        el.className = `ie-ui ${cls}`;
        if (text) el.textContent = text;
        el.hidden = true;
        document.body.append(el);
        return el;
    };
    const pencil = make("button", "ie-pencil", "✎");
    pencil.type = "button";
    pencil.title = "Edit this text (or Alt+click it)";
    const hint = make("span", "ie-hint", "⏎ save · esc cancel");
    const box = make("textarea", "ie-box");
    box.rows = 1;
    box.spellcheck = false;
    const toast = make("div", "ie-toast");

    const place = (el, left, top) => {
        el.hidden = false;
        el.style.left = `${Math.max(0, left) + scrollX}px`;
        el.style.top = `${Math.max(0, top) + scrollY}px`;
    };
    /* A class the page never wrote must leave no empty class="" behind: a
       whole-block rewrite would carry it into the source. */
    const unclass = (el, cls) => {
        el.classList.remove(cls);
        if (!el.classList.length) el.removeAttribute("class");
    };

    let toastTimer = null;
    const notify = (text, { error = false, actions = [] } = {}) => {
        clearTimeout(toastTimer);
        toast.textContent = text;
        toast.classList.toggle("is-error", error);
        for (const action of actions) {
            const a = document.createElement("a");
            a.textContent = action.label;
            a.addEventListener("mousedown", (e) => e.preventDefault());
            a.addEventListener("click", (e) => { e.preventDefault(); toast.hidden = true; action.run(); });
            toast.append(a);
        }
        toast.hidden = false;
        toastTimer = setTimeout(() => { toast.hidden = true; }, error ? 12000 : 8000);
    };

    /* ---- State ---- */
    const STORE = "ie-editor";
    let enabled = true;
    try { enabled = localStorage.getItem(STORE) !== "off"; } catch { /* storage blocked: on for this page */ }
    let hovered = null;
    let hideTimer = null;
    let current = null;        /* the selected element, shown in the panel */
    let editing = null;        /* { el, html, runs, shape, locator, locked } or { el, foreign, node, locator } */
    let undo = null;           /* { ops: [{ path, edits }], restore } for the last save */

    const ready = load().then(() => renderPanel()).catch((err) => notify(`Inline edit: ${err.message}`, { error: true }));

    const setHover = (unit) => {
        clearTimeout(hideTimer);
        if (unit === hovered) return;
        if (hovered) unclass(hovered, "ie-hover");
        hovered = unit;
        if (!unit) { pencil.hidden = true; return; }
        unit.classList.add("ie-hover");
        const rect = unit.getBoundingClientRect();
        place(pencil, Math.min(rect.right + 3, document.documentElement.clientWidth - 26), rect.top - 1);
    };

    document.addEventListener("mouseover", (e) => {
        if (!enabled || editing) return;
        const unit = unitFor(e.target);
        if (unit === undefined || unit === hovered) { clearTimeout(hideTimer); return; }
        if (unit && eligible(unit)) setHover(unit);
        else { clearTimeout(hideTimer); hideTimer = setTimeout(() => setHover(null), 120); }
    });

    /* ---- Posting, and undoing ---- */
    const post = async (path, edits) => {
        const r = await fetch(ROUTE, { method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path, edits }) });
        const j = await r.json().catch(() => ({ ok: false, error: `server said ${r.status}` }));
        if (!j.ok) throw new Error(j.error || "save failed");
        return j;
    };
    /* Group edits by file and post each file once. */
    const postAll = async (edits) => {
        const ops = [];
        for (const path of new Set(edits.map((e) => e.path))) ops.push({ path, edits: edits.filter((e) => e.path === path) });
        for (const op of ops) await post(op.path, op.edits);
        return ops;
    };
    /* The edits that put a file back after `edits` were applied to it. */
    const reverseOf = (edits) => {
        let delta = 0;
        return [...edits].sort((x, y) => x.start - y.start).map((e) => {
            const start = e.start + delta;
            delta += e.text.length - (e.end - e.start);
            return { start, end: start + e.text.length, expect: e.text, text: e.expect };
        });
    };
    const doUndo = async () => {
        if (!undo) return;
        const u = undo;
        undo = null;
        try {
            for (const op of [...u.ops].reverse()) await post(op.path, reverseOf(op.edits));
            await refresh();
            u.restore();
            notify("Undone");
        } catch (err) {
            notify(`Could not undo: ${err.message}`, { error: true });
        }
    };
    const saved = (what, ops, restore) => {
        undo = { ops, restore };
        const files = ops.map((op) => short(op.path));
        const js = files.some((f) => f.endsWith(".js"));
        const actions = [{ label: "undo", run: doUndo }];
        if (js) actions.push({ label: "reload", run: () => location.reload() });
        notify(`${what} to ${files.join(" and ")}${js ? " (the script keeps its old text until the page reloads)" : ""}`, { actions });
    };

    /* ================================================================
       Editing an HTML block in place
       ================================================================ */
    /* Blocks inside the block are text of their own, each with its own pencil;
       they stay put while their parent is edited. */
    const lockNested = (el) => {
        const locked = [];
        const visit = (parent) => {
            for (const child of parent.children) {
                if (isInjected(child)) continue;
                if (isInline(child)) { visit(child); continue; }
                child.setAttribute("contenteditable", "false");
                locked.push(child);
            }
        };
        visit(el);
        return locked;
    };

    const start = (unit, { caretFromClick = false, selectAll = false } = {}) => {
        if (!enabled || !order.length) return;
        if (editing) finish();
        const locator = locate(unit);
        if (!locator) { notify("This text is not in the page's source or its scripts.", { error: true }); return; }
        setHover(null);
        select(unit);
        if (unit.namespaceURI !== XHTML) { startForeign(unit, locator); return; }

        const el = unit;
        /* Not plaintext-only: Chrome forces white-space: pre-wrap on those,
           which shows the source's wrapped lines and indentation as breaks.
           Rich editing is kept plain by the beforeinput filter below. */
        editing = { el, html: el.innerHTML, runs: runsOf(el), shape: shapeOf(el), locator, locked: lockNested(el) };
        el.contentEditable = "true";
        el.classList.add("ie-editing");
        const rect = el.getBoundingClientRect();
        hint.hidden = false;
        place(hint, rect.right - hint.offsetWidth, rect.top - 22);
        el.addEventListener("focusout", onBlur);
        renderPanel();
        if (caretFromClick) return;
        el.focus();
        const range = document.createRange();
        const nodes = textNodes(el).filter((t) => t.data.trim());
        if (selectAll && nodes.length) {
            /* the placeholder, ready to be typed over */
            const first = nodes[0], last = nodes[nodes.length - 1];
            range.setStart(first, first.data.search(/\S/));
            range.setEnd(last, last.data.search(/[ \t\n]*$/));
        } else if (nodes.length) {
            /* after the last visible character, not after the newline and
               indentation the source ends the block with */
            const last = nodes[nodes.length - 1];
            range.setStart(last, last.data.search(/[ \t\n]*$/));
            range.collapse(true);
        } else {
            range.selectNodeContents(el);
            range.collapse(false);
        }
        const sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    };

    /* A click elsewhere saves. The window losing focus blurs the block too,
       but that is not a click elsewhere: the edit waits for the window. */
    const onBlur = () => {
        const s = editing;
        if (!s) return;
        setTimeout(() => { if (editing === s && document.hasFocus()) finish(); }, 0);
    };

    const teardown = () => {
        const s = editing;
        editing = null;
        hint.hidden = true;
        box.hidden = true;
        if (!s.foreign) {
            s.el.removeEventListener("focusout", onBlur);
            s.el.removeAttribute("contenteditable");
            unclass(s.el, "ie-editing");
            for (const n of s.locked) n.removeAttribute("contenteditable");
        }
        renderPanel();
    };

    const cancel = () => {
        if (!editing) return;
        const s = editing;
        teardown();
        if (!s.foreign && s.el.innerHTML !== s.html) s.el.innerHTML = s.html;
    };

    /* The edits that write the block's changed runs to wherever they live. */
    const editsFor = (s, runs) => {
        const loc = s.locator;
        if (loc.kind === "html") {
            const index = sources.get(loc.path);
            const target = resolveHtml(index, loc);
            if (!target) throw new Error("the source has changed under this block — reload the page");
            const edits = [];
            for (let i = 0; i < runs.length; i++) {
                if (runs[i] === s.runs[i]) continue;
                const e = spliceRun(htmlRun(index, index.texts[target.tokFrom + i]), s.runs[i], runs[i]);
                if (e) edits.push(e);
            }
            return edits;
        }
        const index = sources.get(loc.path);
        const groups = matchJs(index, s.runs);
        if (!groups) throw new Error(`${short(loc.path)} has changed under this caption — reload the page`);
        const edits = [];
        const twin = loc.companion && resolveHtml(pageIndex(), loc.companion);
        for (let i = 0; i < runs.length; i++) {
            if (runs[i] === s.runs[i]) continue;
            if (!groups[i]) throw new Error("that caption is computed by the page's script");
            const e = spliceGroup(groups[i], s.runs[i], runs[i]);
            if (!e) continue;
            edits.push(e);
            /* the static placeholder the script drew over says the same
               thing: it changes with the caption */
            if (twin) {
                const r = htmlCollapsedRun(pageIndex(), pageIndex().texts[twin.tokFrom + i]);
                if (r.text === s.runs[i]) { const t = spliceRun(r, s.runs[i], runs[i]); if (t) edits.push(t); }
            }
        }
        return edits;
    };

    /* Save. Resolves once the file is written, so a test can await it. */
    const finish = () => {
        if (!editing) return Promise.resolve();
        const s = editing;
        if (s.foreign) return finishForeign(s);
        teardown();
        s.el.normalize();
        const runs = runsOf(s.el);
        const sameShape = shapeOf(s.el) === s.shape;
        if (sameShape && runs.every((r, i) => r === s.runs[i])) return Promise.resolve();

        return (async () => {
            try {
                await refresh();
                let edits;
                if (sameShape) {
                    edits = editsFor(s, runs);
                    if (!edits.length) { s.el.innerHTML = s.html; return; }
                } else {
                    if (s.locator.kind !== "html") throw new Error("the caption's markup changed — that edit belongs in the script");
                    const index = sources.get(s.locator.path);
                    const target = resolveHtml(index, s.locator);
                    if (!target) throw new Error("the source has changed under this block — reload the page");
                    edits = [{ path: s.locator.path, start: target.openEnd, end: target.closeStart,
                        expect: index.src.slice(target.openEnd, target.closeStart), text: serialize(s.el) }];
                }
                const ops = await postAll(edits);
                await refresh();
                saved(sameShape ? "Saved" : "Saved (block rewritten)", ops, () => { s.el.innerHTML = s.html; });
            } catch (err) {
                s.el.innerHTML = s.html;
                notify(`Not saved: ${err.message}`, { error: true });
                throw err;
            }
        })();
    };

    /* The block rewritten whole — only when its elements changed under the
       edit, so no run-by-run change describes it. Script-added attributes and
       elements come off first. */
    const serialize = (el) => {
        const copy = el.cloneNode(true);
        copy.querySelectorAll(INJECTED).forEach((n) => n.remove());
        copy.querySelectorAll("[contenteditable]").forEach((n) => n.removeAttribute("contenteditable"));
        copy.querySelectorAll(".gloss").forEach((n) => { n.removeAttribute("tabindex"); n.removeAttribute("aria-describedby"); });
        copy.querySelectorAll(".ie-hover, .ie-selected, .ie-peek").forEach((n) => { for (const c of ["ie-hover", "ie-selected", "ie-peek"]) unclass(n, c); });
        return houseEncode(copy.innerHTML);
    };

    /* ---- SVG and MathML labels: a box over the element ---- */
    const startForeign = (unit, locator) => {
        const node = textNodes(unit)[0];
        editing = { el: unit, foreign: true, node, runs: [node.data], locator };
        const rect = unit.getBoundingClientRect();
        box.value = collapse(node.data);
        box.style.width = `${Math.max(rect.width + 24, 120)}px`;
        place(box, rect.left - 4, rect.top - 3);
        box.focus();
        box.setSelectionRange(box.value.length, box.value.length);
        renderPanel();
    };

    const finishForeign = (s) => {
        const value = box.value.trim();
        teardown();
        const old = s.node.data;
        if (!value || value === collapse(old)) return Promise.resolve();
        return (async () => {
            try {
                await refresh();
                const lead = old.match(/^[ \t\n]*/)[0], trail = old.match(/[ \t\n]*$/)[0];
                const edits = editsFor(s, [lead + value + trail]);
                if (!edits.length) return;
                const ops = await postAll(edits);
                await refresh();
                s.node.data = lead + value + trail;
                saved("Saved", ops, () => { s.node.data = old; });
            } catch (err) {
                notify(`Not saved: ${err.message}`, { error: true });
                throw err;
            }
        })();
    };
    box.addEventListener("focusout", onBlur);

    /* ================================================================
       The panel: the switch, the selected element, its ancestors,
       delete, insert.
       ================================================================ */
    const KINDS = {
        p: { label: "Paragraph", tag: "p", html: "<p>New paragraph.</p>" },
        h1: { label: "Section heading (h1)", tag: "h1", html: "<h1>New heading</h1>" },
        h2: { label: "Subheading (h2)", tag: "h2", html: "<h2>New subheading</h2>" },
        li: { label: "List item", tag: "li", html: "<li>New item</li>" },
        ul: { label: "Bullet list", tag: "ul", html: "<ul>\n    <li>New item</li>\n</ul>" },
        ol: { label: "Numbered list", tag: "ol", html: "<ol>\n    <li>New item</li>\n</ol>" },
        section: { label: "Section", tag: "section", html: "<section>\n    <h1>New section</h1>\n    <p>New paragraph.</p>\n</section>" },
        aside: { label: "Important box", tag: "aside",
            html: '<aside class="important-box" aria-labelledby="ID">\n    <h2 class="important-box__title" id="ID">New box</h2>\n    <p>New paragraph.</p>\n</aside>' },
        custom: { label: "Custom HTML…", tag: null, html: "" },
    };
    /* Blocks that stand apart from each other with a blank line between. */
    const BLOCKY = new Set(["p", "section", "aside", "figure", "div", "ul", "ol", "table", "blockquote", "article", "nav", "header", "footer", "details"]);
    const HEADING = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);
    const gap = (above, below) => BLOCKY.has(above) && (BLOCKY.has(below) || HEADING.has(below)) ? "\n\n" : "\n";

    const panel = make("div", "ie-panel");
    panel.hidden = false;
    panel.innerHTML = `
        <div class="ie-panel__head"><b>Page editor</b>
            <label class="ie-switch" title="Turn the editor on or off"><input type="checkbox" data-switch><i></i><span data-state></span></label></div>
        <div class="ie-panel__body">
            <div class="ie-panel__note" data-idle>Hover text and click ✎, Alt+click it, or pick it below.</div>
            <div class="ie-panel__tree"></div>
            <div data-selection>
                <div class="ie-panel__what"></div>
                <div class="ie-panel__row"><button type="button" data-act="edit">Edit text</button><button type="button" data-act="delete" class="is-danger">Delete</button></div>
                <div class="ie-panel__insert">
                    <b>Insert</b>
                    <select data-kind>${Object.entries(KINDS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join("")}</select>
                    <select data-where><option value="after">after this</option><option value="before">before this</option><option value="inside">inside, at the end</option></select>
                    <textarea data-html rows="4" placeholder="&lt;p&gt;…&lt;/p&gt;" hidden></textarea>
                    <div class="ie-panel__row"><button type="button" data-act="insert">Add</button><span class="ie-panel__note" data-note></span></div>
                </div>
            </div>
        </div>`;
    const $ = (sel) => panel.querySelector(sel);
    const kindSel = $("[data-kind]"), whereSel = $("[data-where]"), htmlBox = $("[data-html]"), toggle = $("[data-switch]");
    const label = (el) => {
        const cls = [...el.classList].find((c) => !c.startsWith("ie-"));
        return tagOf(el) + (el.id ? `#${el.id}` : cls ? `.${cls}` : "");
    };

    const select = (el) => {
        if (current && current !== el) unclass(current, "ie-selected");
        current = el;
        if (el) { el.classList.add("ie-selected"); for (let a = el.parentElement; a; a = a.parentElement) expanded.add(a); }
        renderPanel();
    };

    /* ---- The tree: the page's elements, opened on demand ---- */
    const tree = $(".ie-panel__tree");
    const expanded = new WeakSet();
    const treeRoot = () => document.querySelector(".layout") || document.body;
    expanded.add(treeRoot());
    if (document.querySelector("main")) expanded.add(document.querySelector("main"));
    const kidsOf = (el) => [...el.children].filter((c) => !isInjected(c) && !/^(script|style|template)$/.test(c.localName));
    /* The text that is the element's own, for a glance at what a row is. */
    const ownText = (el) => {
        let out = "";
        const w = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => node.nodeType === 1
                ? (isInjected(node) || (node.namespaceURI === XHTML && !isInline(node)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP)
                : NodeFilter.FILTER_ACCEPT,
        });
        for (let node = w.nextNode(); node && out.length < 60; node = w.nextNode()) out += node.data;
        return collapse(out);
    };
    let peeked = null;
    const peek = (el) => {
        if (peeked) unclass(peeked, "ie-peek");
        peeked = el;
        if (el) el.classList.add("ie-peek");
    };
    const renderTree = () => {
        tree.textContent = "";
        const frag = document.createDocumentFragment();
        const row = (el, depth) => {
            const line = document.createElement("div");
            line.className = "ie-tree__row";
            line.style.paddingLeft = `${depth * 10 + 4}px`;
            const children = kidsOf(el);
            const tog = document.createElement("span");
            tog.className = "ie-tree__tog";
            tog.textContent = children.length ? (expanded.has(el) ? "▾" : "▸") : "";
            if (children.length) tog.addEventListener("click", (e) => {
                e.stopPropagation();
                if (expanded.has(el)) expanded.delete(el); else expanded.add(el);
                renderTree();
            });
            const name = document.createElement("span");
            name.className = "ie-tree__name";
            name.textContent = label(el);
            line.append(tog, name);
            const text = ownText(el);
            if (text) {
                const t = document.createElement("span");
                t.className = "ie-tree__text";
                t.textContent = `“${text.slice(0, 40)}${text.length > 40 ? "…" : ""}”`;
                line.append(t);
            }
            if (el === current) line.classList.add("is-current");
            if (!locate(el)) line.classList.add("is-dim");
            line.addEventListener("click", () => {
                select(el);
                const r = el.getBoundingClientRect();
                if (r.bottom < 0 || r.top > innerHeight) el.scrollIntoView({ block: "center" });
            });
            line.addEventListener("dblclick", () => { if (isUnit(el) && locate(el)) start(el); });
            line.addEventListener("mouseenter", () => peek(el));
            line.addEventListener("mouseleave", () => peek(null));
            frag.append(line);
            if (expanded.has(el)) for (const c of children) row(c, depth + 1);
        };
        row(treeRoot(), 0);
        tree.append(frag);
        const cur = tree.querySelector(".is-current");
        if (cur) cur.scrollIntoView({ block: "nearest" });
    };

    const setEnabled = (on) => {
        enabled = on;
        try { localStorage.setItem(STORE, on ? "on" : "off"); } catch { /* fine */ }
        if (!on) { cancel(); setHover(null); select(null); }
        renderPanel();
    };

    let confirmDelete = false;
    const renderPanel = () => {
        confirmDelete = false;
        toggle.checked = enabled;
        $("[data-state]").textContent = enabled ? "on" : "off";
        $(".ie-panel__body").hidden = !enabled;
        if (!enabled) return;
        if (current && !current.isConnected) { unclass(current, "ie-selected"); current = null; }
        $("[data-idle]").hidden = Boolean(current);
        $("[data-selection]").hidden = !current;
        renderTree();
        if (!current) return;
        const loc = locate(current);
        const text = collapse(current.textContent).slice(0, 80);
        $(".ie-panel__what").textContent = editing && editing.el === current ? "Editing — ⏎ saves, esc cancels"
            : loc ? `${loc.kind === "js" ? `Drawn by ${short(loc.path)}` : loc.path === PAGE ? "In the page" : `In ${short(loc.path)}`}${text ? `: “${text}${collapse(current.textContent).length > 80 ? "…" : ""}”` : ""}`
            : "Not in the page's source or scripts";
        $("[data-act=edit]").disabled = !loc || !isUnit(current) || Boolean(editing && editing.el === current);
        const structural = Boolean(loc) && loc.kind === "html" && current.namespaceURI === XHTML;
        $("[data-act=delete]").disabled = !structural;
        $("[data-act=delete]").textContent = "Delete";
        $("[data-act=insert]").disabled = !structural;
        $("[data-note]").textContent = structural ? "" : loc && loc.kind === "js" ? "a script draws this" : "";
        if (KINDS[tagOf(current)] && !kindSel.dataset.touched) kindSel.value = tagOf(current);
    };

    /* Delete the selected element from the file and the page: the element
       and the whitespace that set it apart from the one before. */
    const remove = async (el) => {
        if (editing && (editing.el === el || el.contains(editing.el))) cancel();
        const loc = locate(el);
        if (!loc || loc.kind !== "html") { notify("Only elements in the page's HTML can be deleted here.", { error: true }); return; }
        try {
            await refresh();
            const index = sources.get(loc.path);
            const t = resolveHtml(index, loc);
            if (!t) throw new Error("the source has changed under this element — reload the page");
            let start = t.openStart, ws = null;
            const before = index.texts.find((x) => x.end === t.openStart);
            const prev = el.previousSibling;
            if (before && !before.text.trim() && prev && prev.nodeType === 3 && prev.data === before.text) { start = before.start; ws = prev; }
            const edit = { path: loc.path, start, end: t.closeEnd, expect: index.src.slice(start, t.closeEnd), text: "" };
            const parent = el.parentNode, next = el.nextSibling;
            const nextUp = [el.nextElementSibling, el.previousElementSibling, parent].find((n) => n && n !== document.body && n !== el);
            const ops = await postAll([edit]);
            el.remove();
            if (ws) ws.remove();
            await refresh();
            unclass(el, "ie-selected");
            current = null;
            saved(`Deleted <${tagOf(el)}>`, ops, () => { parent.insertBefore(el, next); if (ws) parent.insertBefore(ws, el); select(el); });
            select(nextUp && locate(nextUp) ? nextUp : null);
        } catch (err) {
            notify(`Not deleted: ${err.message}`, { error: true });
            throw err;
        }
    };

    /* Insert new markup before, after or inside the selected element, in the
       file and in the page, indented like its neighbours. */
    const dedent = (s) => {
        const lines = s.replace(/\r\n?/g, "\n").replace(/^\n+|\s+$/g, "").split("\n");
        const common = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^[ \t]*/)[0].length));
        return lines.map((l) => l.slice(common)).join("\n");
    };
    const insert = async (el, kind, where, customHtml = "") => {
        if (editing) await finish().catch(() => {});
        const loc = locate(el);
        if (!loc || loc.kind !== "html") { notify("Only elements in the page's HTML can have others put beside them.", { error: true }); return; }
        const snippet = kind === "custom" ? dedent(customHtml) : KINDS[kind].html.replaceAll("ID", `box-${Date.now().toString(36)}`);
        if (!snippet.trim()) { notify("Nothing to insert.", { error: true }); return; }
        const tag = kind === "custom" ? (snippet.match(/^<([a-zA-Z][a-zA-Z0-9]*)/) || [, "div"])[1].toLowerCase() : KINDS[kind].tag;
        try {
            await refresh();
            const index = sources.get(loc.path);
            const t = resolveHtml(index, loc);
            if (!t) throw new Error("the source has changed under this element — reload the page");
            const indentAt = (pos) => {
                const ls = index.src.lastIndexOf("\n", pos - 1) + 1;
                const ws = index.src.slice(ls, pos);
                return /^[ \t]*$/.test(ws) ? ws : index.src.slice(ls).match(/^[ \t]*/)[0];
            };
            const block = (indent) => snippet.split("\n").join("\n" + indent);
            let at, text, put;
            if (where === "after") {
                const indent = indentAt(t.openStart);
                at = t.closeEnd; text = gap(t.tag, tag) + indent + block(indent); put = (nodes) => el.after(...nodes);
            } else if (where === "before") {
                const indent = indentAt(t.openStart);
                at = t.openStart; text = block(indent) + gap(tag, t.tag) + indent; put = (nodes) => el.before(...nodes);
            } else {
                const kids = index.elements.filter((e) => e.depth === t.depth + 1 && e.openStart >= t.openEnd && e.closeEnd <= t.closeStart);
                const lastDom = [...el.children].filter((c) => !isInjected(c)).pop();
                if (kids.length && lastDom) {
                    const last = kids[kids.length - 1];
                    const indent = indentAt(last.openStart);
                    at = last.closeEnd; text = gap(last.tag, tag) + indent + block(indent); put = (nodes) => lastDom.after(...nodes);
                } else {
                    const indent = indentAt(t.openStart) + "    ";
                    at = t.openEnd; text = "\n" + indent + block(indent); put = (nodes) => el.prepend(...nodes);
                }
            }
            const edit = { path: loc.path, start: at, end: at, expect: "", text };
            const ops = await postAll([edit]);
            const tpl = document.createElement("template");
            tpl.innerHTML = text;
            const nodes = [...tpl.content.childNodes];
            put(nodes);
            await refresh();
            const first = nodes.find((n) => n.nodeType === 1);
            saved(`Inserted <${tag}>`, ops, () => {
                if (editing && nodes.some((n) => n.contains(editing.el))) cancel();
                nodes.forEach((n) => n.remove());
                select(el.isConnected ? el : null);
            });
            select(first || el);
            if (first && kind !== "custom") {
                const firstText = textNodes(first).find((n) => n.data.trim());
                const unit = firstText && unitFor(firstText);
                if (unit && eligible(unit)) start(unit, { selectAll: true });
            }
        } catch (err) {
            notify(`Not inserted: ${err.message}`, { error: true });
            throw err;
        }
    };

    /* Clicking the panel must not blur an edit in progress — except into its
       own fields, which need the focus. */
    panel.addEventListener("mousedown", (e) => { if (!/^(SELECT|TEXTAREA|OPTION|INPUT)$/.test(e.target.tagName)) e.preventDefault(); });
    toggle.addEventListener("change", () => setEnabled(toggle.checked));
    $("[data-act=edit]").addEventListener("click", () => { if (current) start(current); });
    $("[data-act=delete]").addEventListener("click", (e) => {
        if (!current) return;
        if (!confirmDelete) { confirmDelete = true; e.target.textContent = `Delete <${tagOf(current)}>?`; return; }
        remove(current);
    });
    $("[data-act=insert]").addEventListener("click", () => { if (current) insert(current, kindSel.value, whereSel.value, htmlBox.value); });
    kindSel.addEventListener("change", () => { kindSel.dataset.touched = "1"; htmlBox.hidden = kindSel.value !== "custom"; });
    renderPanel();

    /* ================================================================
       Events
       ================================================================ */
    pencil.addEventListener("mousedown", (e) => e.preventDefault());
    pencil.addEventListener("click", () => { if (hovered) start(hovered); });

    document.addEventListener("mousedown", (e) => {
        if (!enabled || !e.altKey || e.button !== 0 || !order.length) return;
        if (editing && (editing.foreign ? e.target === box : editing.el.contains(e.target))) return;
        const unit = unitFor(e.target);
        if (!unit || !eligible(unit)) return;
        if (unit.namespaceURI !== XHTML) { e.preventDefault(); start(unit); return; }
        start(unit, { caretFromClick: true });
    });

    /* While a block is being edited, keys and clicks inside it are its own:
       the page's shortcuts, links and glossary cards stay out of it. */
    const inEdit = (e) => editing && (editing.foreign ? e.target === box : editing.el.contains(e.target));
    window.addEventListener("keydown", (e) => {
        if (!inEdit(e)) return;
        e.stopPropagation();
        if (e.key === "Escape") { e.preventDefault(); cancel(); }
        else if (e.key === "Enter") { e.preventDefault(); finish(); }
        else if (e.key === "s" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); finish(); }
        else if ((e.metaKey || e.ctrlKey) && /^[biu]$/i.test(e.key)) e.preventDefault();   /* text, not markup */
    }, true);
    for (const type of ["keyup", "keypress"])
        window.addEventListener(type, (e) => { if (inEdit(e)) e.stopPropagation(); }, true);
    window.addEventListener("click", (e) => {
        if (!editing || editing.foreign || !editing.el.contains(e.target)) return;
        e.preventDefault();
        e.stopPropagation();
    }, true);
    /* Only text goes in: no bold from a shortcut, no markup from a paste or a
       drop, no paragraph from a key the keydown filter did not see. */
    const PLAIN = /^(insert(Text|CompositionText|ReplacementText)|delete|history)/;
    document.addEventListener("beforeinput", (e) => {
        if (!editing || editing.foreign || !editing.el.contains(e.target)) return;
        if (!PLAIN.test(e.inputType)) e.preventDefault();
    });
    document.addEventListener("paste", (e) => {
        if (!editing || editing.foreign || !editing.el.contains(e.target)) return;
        e.preventDefault();
        document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
    });

    /* For tests, and for anyone who wants to script an edit. */
    window.__inlineEdit = { ready, unitFor, eligible, locate, start, finish, cancel, select, remove, insert, setEnabled, undo: doUndo,
        get sources() { return sources; }, get current() { return current; }, get enabled() { return enabled; } };
})();
