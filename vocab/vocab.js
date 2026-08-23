/* Vocab builder — unlisted tool.
 *
 * Five buckets: 0 unstarted, 1/2/3 correct once/twice/thrice, 4 complete.
 * A correct answer moves a word up one bucket; a wrong answer sends it back to
 * unstarted. Bucket 0 is implicit — it is "every word in the list that is not
 * in buckets 1-4" — because the lists run to hundreds of thousands of entries
 * and storing a record for each would blow the localStorage quota for no gain.
 * Only words that have been touched get a stored record.
 */
(() => {
    "use strict";

    // The two BSD dictionary files, verbatim. web2a is the supplementary list of
    // hyphenated terms and phrases; web2 is the main single-word list. They are
    // disjoint, so "both" is a plain concatenation. Progress is stored per list.
    const LISTS = {
        web2: {
            files: ["web2.txt"],
            name: "web2 — the main word list",
            note: "Single words from Webster's Second International. Roughly two thirds have " +
                  "a Wiktionary entry, so most cards come back with a definition. 2.5 MB to " +
                  "download the first time, then browser-cached."
        },
        web2a: {
            files: ["web2a.txt"],
            name: "web2a — hyphenated terms and phrases",
            note: "The supplementary list: 1934 compound phrases. Only about one in six has " +
                  "an entry in any free dictionary API, so most cards fall through to the " +
                  "external-lookup panel."
        },
        both: {
            files: ["web2.txt", "web2a.txt"],
            name: "web2 + web2a combined",
            note: "Everything. 3.5 MB to download the first time."
        }
    };

    const BASE_URL = "/demystifyingmaths/vocab/";
    const DISCARD_URL = BASE_URL + "discarded.txt";
    const DEFS_URL = BASE_URL + "definitions.txt";
    const LIST_PREF_KEY = "dmm.vocab.list";
    // Discards are a judgement about the word, not about one list's progress, so
    // they live outside the per-list state and survive switching lists.
    const DISCARD_KEY = "dmm.vocab.discard";
    // Definitions you write are a judgement about the word, like a discard, so
    // they live outside any one list's progress and survive switching lists.
    const DEFS_KEY = "dmm.vocab.defs";

    // Google will not be framed — google.com answers with x-frame-options:
    // SAMEORIGIN, and so do DuckDuckGo, Bing and Brave, so a plain iframe of a
    // search page renders blank for all of them. The one sanctioned way to put
    // Google results inside a page is a Programmable Search Engine, which is a
    // script you host rather than a frame you point at Google. Put an id here to
    // turn the in-page panel on for every visitor; a visitor can also set their
    // own in Settings. With no id at all, lookups open in a separate window.
    const PSE_CX = "";
    const PSE_KEY = "dmm.vocab.pse";
    const keyFor = (listId) => "dmm.vocab." + listId + ".v1";

    let listId = "web2";
    let KEY = keyFor(listId);
    const DEF_CACHE_MAX = 4000;
    // Bucket 0 holds words that have been attempted but never yet recalled
    // correctly. "Unstarted" is not a bucket at all — it is everything in the
    // list with no record, which is why it stays implicit.
    const BUCKET_NAMES = ["attempted", "correct once", "correct twice", "correct thrice", "complete"];

    // Draw pools in weight order, for fixed-odds mode. Index 0 is the unstarted
    // complement; the rest name a real bucket.
    const POOL_BUCKET = [null, 0, 1, 2, 3];

    const $ = (id) => document.getElementById(id);

    let LIST = [];             // index -> word, already minus every discard
    let SHARED_DISCARDS = new Set();   // from discarded.txt — dropped for everyone
    let MY_DISCARDS = new Set();       // dropped in this browser, pending publication
    let SHARED_DEFS = new Map();       // from definitions.txt — shown to everyone
    let MY_DEFS = new Map();           // written in this browser, pending publication
    let INDEX = null;          // word -> true, built lazily for import validation
    let buckets = [new Set(), new Set(), new Set(), new Set(), new Set()];
    let state = null;
    let current = null;        // { word, bucket }
    let revealed = false;
    let lookupToken = 0;       // guards against a slow lookup landing on a new word

    /* ---------------------------------------------------------------- state */

    const freshState = () => ({
        v: 1,
        list: listId,
        reviews: 0,          // total graded reviews, also the clock for the repeat gap
        w: {},               // word -> [bucket, lastSeenReviewNumber]
        mode: "spaced",
        // Index == bucket. iv[0] is how long a word waits after being got wrong;
        // iv[1..3] are the waits after the 1st, 2nd and 3rd correct recall. They
        // expand, so "complete" means three recalls at growing separations.
        iv: [10, 20, 60, 150],
        cap: 50,             // words allowed in progress (buckets 0-lapsed..3) at once
        weights: [80, 15, 3, 1, 1],
        gap: 20,
        attempts: 0,
        correct: 0
    });

    function load() {
        let raw = null;
        try { raw = localStorage.getItem(KEY); } catch (e) { /* storage disabled */ }
        state = freshState();
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object") Object.assign(state, parsed);
        } catch (e) {
            toast("Saved progress could not be read — starting fresh.");
        }
        if (!state.w || typeof state.w !== "object") state.w = {};
        // Definitions used to live in here, per list. Lift any that a previous
        // version stored into the global store and stop carrying them.
        let migrated = false;
        if (state.defs && typeof state.defs === "object") {
            for (const [word, rec] of Object.entries(state.defs)) {
                const text = rec && typeof rec === "object" ? rec.t : rec;
                if (text && !MY_DEFS.has(word)) MY_DEFS.set(word, String(text));
            }
            if (Object.keys(state.defs).length) saveDefs();
            delete state.defs;
            migrated = true;
        }
        if (!Array.isArray(state.weights) || state.weights.length !== 5) state.weights = [80, 15, 3, 1, 1];
        state.weights = state.weights.map((n) => Math.max(0, Number(n) || 0));
        if (!Array.isArray(state.iv) || state.iv.length !== 4) state.iv = [10, 20, 60, 150];
        state.iv = state.iv.map((n) => Math.max(1, Number(n) || 1));
        state.cap = Math.max(1, Number(state.cap) || 50);
        if (state.mode !== "fixed") state.mode = "spaced";
        state.gap = Math.max(0, Number(state.gap) || 0);
        // Write the upgraded shape back straight away. Left until the next
        // review, the stale nested copy would out-live a definition the user
        // deleted in the meantime and resurrect it on the following load.
        if (migrated) save();
    }

    function save() {
        const write = () => localStorage.setItem(KEY, JSON.stringify(state));
        try {
            write();
        } catch (e) {
            toast("Could not save: browser storage is full or blocked.");
        }
    }

    // buckets[0] is not "unstarted" — that stays implicit. It holds the words that
    // were got wrong and sent back, so the scheduler can queue them to return
    // instead of losing them in a quarter-million-word pool.
    function rebuildBuckets() {
        buckets = [new Set(), new Set(), new Set(), new Set(), new Set()];
        for (const word of Object.keys(state.w)) {
            const b = state.w[word][0];
            if (b >= 0 && b <= 4) buckets[b].add(word);
        }
    }

    const bucketOf = (w) => (state.w[w] ? state.w[w][0] : 0);
    const lastSeen = (w) => (state.w[w] ? state.w[w][1] : null);
    const ageOf = (w) => { const ls = lastSeen(w); return ls === null ? Infinity : state.reviews - ls; };
    // Untouched words only: everything in the list with no progress record.
    const unstartedCount = () => LIST.length - buckets[0].size - buckets[1].size -
        buckets[2].size - buckets[3].size - buckets[4].size;
    const labelFor = (w) => (state.w[w] ? BUCKET_NAMES[bucketOf(w)] : "unstarted");

    /* ------------------------------------------------------------ selection */

    const inFlight = () =>
        buckets[0].size + buckets[1].size + buckets[2].size + buckets[3].size;

    // How many words in progress have waited out their interval and are ready.
    function dueCount() {
        let n = 0;
        for (let b = 0; b <= 3; b++)
            for (const w of buckets[b])
                if (state.reviews - state.w[w][1] >= state.iv[b]) n++;
        return n;
    }

    function pickWord() {
        return state.mode === "spaced" ? pickSpaced() : pickFixed();
    }

    /* -- spaced mode ------------------------------------------------------
     *
     * Fixed odds cannot work: with a 95% share going to unstarted, words enter
     * the buckets ~30x faster than they leave, so nothing ever reaches complete.
     * Here reviews are scheduled instead of rolled for, and new words are only
     * let in when there is room:
     *
     *   1. anything that has waited out its interval is reviewed, most overdue first;
     *   2. otherwise a brand new word, if fewer than `cap` are in progress;
     *   3. otherwise the word closest to due, to keep the backlog moving.
     *
     * That is self-balancing. In-progress work is pinned near `cap`, so words
     * must leave at the rate they arrive — which is what makes "complete" mean
     * something. At the defaults it settles at roughly one new word every four
     * or five draws, the rest reviews.
     */
    function pickSpaced() {
        const now = state.reviews;
        let due = null, dueOver = -Infinity;    // waited long enough
        let near = null, nearOver = -Infinity;  // closest to due, due or not

        for (let b = 0; b <= 3; b++) {
            const iv = state.iv[b];
            for (const w of buckets[b]) {
                const age = now - state.w[w][1];
                if (age < state.gap) continue;  // the repeat gap is a floor in both modes
                // Proportional, not absolute: age/interval puts a word two thirds
                // of the way through a 150-review wait behind one that is fully
                // through a 20-review wait, and spreads any early pulling evenly
                // over the buckets instead of dumping it all on the longest one.
                const over = age / iv;
                if (over > nearOver || (over === nearOver && Math.random() < 0.5)) {
                    nearOver = over; near = w;
                }
                if (over >= 1 && (over > dueOver || (over === dueOver && Math.random() < 0.5))) {
                    dueOver = over; due = w;
                }
            }
        }

        if (due) return due;
        if (inFlight() < state.cap) {
            const fresh = pickFresh();
            if (fresh) return fresh;
        }
        if (near) return near;
        return pickFresh();
    }

    // A word nobody has touched yet. Sampled by rejection, since "unstarted" is
    // the complement of the stored records rather than a materialised list.
    function pickFresh() {
        const n = LIST.length;
        if (!n) return null;
        for (let i = 0; i < 500; i++) {
            const w = LIST[(Math.random() * n) | 0];
            if (!state.w[w]) return w;
        }
        const start = (Math.random() * n) | 0;
        for (let i = 0; i < n; i++) {
            const w = LIST[(start + i) % n];
            if (!state.w[w]) return w;
        }
        return null;
    }

    /* -- fixed-odds mode (the original specification) --------------------- */

    // Pick a bucket by weight, considering only buckets that have something in
    // them, then a word from it that respects the repeat gap.
    function pickFixed() {
        const live = [];
        for (let i = 0; i < 5; i++) {
            const size = i === 0 ? unstartedCount() : buckets[POOL_BUCKET[i]].size;
            if (size > 0) live.push(i);
        }
        if (!live.length) return null;

        const total = live.reduce((s, i) => s + state.weights[i], 0);
        let chosen;
        if (total <= 0) {
            chosen = live[(Math.random() * live.length) | 0];
        } else {
            let r = Math.random() * total;
            chosen = live[live.length - 1];
            for (const i of live) { r -= state.weights[i]; if (r < 0) { chosen = i; break; } }
        }
        return chosen === 0 ? pickFresh() : pickReview(POOL_BUCKET[chosen]);
    }

    // The gap is capped in effect by the bucket's own size: if nothing is old
    // enough, the least-recently-seen word is used. A small bucket therefore
    // still yields a word instead of silently forfeiting its share of the draw.
    function pickReview(b) {
        const arr = [...buckets[b]];
        const eligible = arr.filter((w) => ageOf(w) >= state.gap);
        if (eligible.length) return eligible[(Math.random() * eligible.length) | 0];
        return arr.reduce((a, w) => (lastSeen(w) < lastSeen(a) ? w : a));
    }

    /* --------------------------------------------------------- definitions */

    const textOf = (html) => {
        const t = document.createElement("template");
        t.innerHTML = String(html == null ? "" : html);
        return (t.content.textContent || "").replace(/\s+/g, " ").trim();
    };

    const variantsOf = (word) => {
        const lower = word.toLowerCase();
        const cap = lower.charAt(0).toUpperCase() + lower.slice(1);
        return [...new Set([word, lower, cap])];
    };

    async function fromWiktionary(title) {
        const url = "https://en.wiktionary.org/api/rest_v1/page/definition/" +
            encodeURIComponent(title.replace(/ /g, "_"));
        const res = await fetch(url, { headers: { accept: "application/json" } });
        if (!res.ok) return null;
        const data = await res.json();
        const en = data && data.en;
        if (!Array.isArray(en) || !en.length) return null;
        const groups = en.map((g) => ({
            pos: textOf(g.partOfSpeech),
            defs: (g.definitions || []).map((d) => ({
                text: textOf(d.definition),
                examples: (d.parsedExamples || []).map((e) => textOf(e.example)).filter(Boolean)
            })).filter((d) => d.text)
        })).filter((g) => g.defs.length);
        return groups.length ? { source: "Wiktionary", groups } : null;
    }

    async function fromFreeDictionary(word) {
        const res = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" +
            encodeURIComponent(word));
        if (!res.ok) return null;
        const data = await res.json();
        if (!Array.isArray(data) || !data.length) return null;
        const groups = [];
        for (const entry of data) {
            for (const m of entry.meanings || []) {
                const defs = (m.definitions || []).map((d) => ({
                    text: textOf(d.definition),
                    examples: d.example ? [textOf(d.example)] : []
                })).filter((d) => d.text);
                if (defs.length) groups.push({ pos: textOf(m.partOfSpeech), defs });
            }
        }
        return groups.length ? { source: "Free Dictionary API", groups } : null;
    }

    async function lookup(word) {
        const saved = savedDef(word);
        if (saved) return {
            source: saved.mine ? "saved by you" : "shared",
            groups: [{ pos: "", defs: [{ text: saved.text, examples: [] }] }],
            cached: true
        };

        for (const v of variantsOf(word)) {
            try { const r = await fromWiktionary(v); if (r) return r; } catch (e) { /* offline / blocked */ }
        }
        // The free dictionary API 502s on anything with a space, so only single
        // tokens are worth the round trip.
        if (/^[A-Za-z'-]+$/.test(word)) {
            for (const v of variantsOf(word)) {
                try { const r = await fromFreeDictionary(v); if (r) return r; } catch (e) { /* ignore */ }
            }
        }
        return null;
    }

    function renderDefinition(result) {
        const body = $("def-body");
        body.textContent = "";
        $("def-source").textContent = "(" + result.source + ")";
        for (const g of result.groups) {
            if (g.pos) {
                const p = document.createElement("p");
                p.className = "pos";
                p.textContent = g.pos;
                body.appendChild(p);
            }
            const ol = document.createElement("ol");
            for (const d of g.defs) {
                const li = document.createElement("li");
                li.textContent = d.text;
                for (const ex of d.examples) {
                    const s = document.createElement("span");
                    s.className = "example";
                    s.textContent = "“" + ex + "”";
                    li.appendChild(s);
                }
                ol.appendChild(li);
            }
            body.appendChild(ol);
        }
    }

    // The lookup box is up on every card. A dictionary hit is not the same as a
    // useful answer — half of web2 resolves to "alternative form of …" — so the
    // Google button and the write-your-own box stay available either way, and
    // only the "no entry" line is conditional.
    function renderLookupBox(word, found) {
        $("no-entry-msg").hidden = found;
        $("lookup-hint").textContent = pseId()
            ? "opens here on the page — or press g"
            : "opens in a search window — or press g";
        const saved = savedDef(word);
        $("own-def").value = saved ? saved.text : "";
        $("save-note").textContent = !saved ? ""
            : saved.mine ? "Yours, not yet published — edit and save again to replace it."
            : "From the shared file — saving here overrides it on this machine.";
    }

    /* -------------------------------------------------------- google lookup */

    const googleUrl = (word) =>
        "https://www.google.com/search?q=" + encodeURIComponent('"' + word + '" definition');

    function pseId() {
        try { return (localStorage.getItem(PSE_KEY) || PSE_CX).trim(); }
        catch (e) { return PSE_CX; }
    }

    let psePromise = null;

    // The Programmable Search Engine loads itself into a div we own, so nothing
    // is being framed and SAMEORIGIN never comes into it.
    function loadPse(cx) {
        if (psePromise) return psePromise;
        psePromise = new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error("timed out")), 8000);
            window.__gcse = {
                parsetags: "explicit",
                callback: () => {
                    clearTimeout(timer);
                    try {
                        window.google.search.cse.element.render(
                            { div: "pse-mount", tag: "search", gname: "vocab" });
                        resolve();
                    } catch (err) { reject(err); }
                }
            };
            const el = document.createElement("script");
            el.async = true;
            el.src = "https://cse.google.com/cse.js?cx=" + encodeURIComponent(cx);
            el.onerror = () => { clearTimeout(timer); reject(new Error("could not load")); };
            document.head.appendChild(el);
        });
        return psePromise;
    }

    function openInWindow(word) {
        // A named window, so repeated lookups reuse one rather than piling up.
        const w = window.open(googleUrl(word), "vocab-lookup",
            "popup=yes,width=860,height=900,noopener");
        if (!w) toast("Your browser blocked the search window — allow pop-ups for this page.");
    }

    function lookupOnGoogle() {
        if (!current) return;
        const word = current.word;
        const cx = pseId();
        if (!cx) { openInWindow(word); return; }

        $("modal-word").textContent = word;
        $("lookup-modal").hidden = false;
        loadPse(cx).then(() => {
            const element = window.google.search.cse.element.getElement("vocab");
            element.execute(word + " definition");
        }, (err) => {
            $("lookup-modal").hidden = true;
            psePromise = null;
            toast("Search panel unavailable (" + err.message + ") — opening a window instead.");
            openInWindow(word);
        });
    }

    function closeLookup() { $("lookup-modal").hidden = true; }

    /* ------------------------------------------------------------- rendering */

    function renderCounts(flashBucket) {
        $("count-0").textContent = unstartedCount().toLocaleString();
        $("count-a").textContent = buckets[0].size.toLocaleString();
        for (let b = 1; b <= 4; b++) $("count-" + b).textContent = buckets[b].size.toLocaleString();
        if (flashBucket != null) {
            // Bucket 0 is the Attempted tile; the Unstarted tile is never a destination.
            const el = document.querySelector('.bucket[data-bucket="' +
                (flashBucket === 0 ? "a" : flashBucket) + '"]');
            if (el) { el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 550); }
        }
        if (state.mode === "spaced") {
            $("queue-line").hidden = false;
            $("queue-line").textContent = dueCount() + " due now · " + inFlight() + " of " +
                state.cap + " in progress · " + buckets[0].size + " attempted, awaiting a first correct";
        } else {
            $("queue-line").hidden = true;
        }
        const pct = state.attempts ? Math.round((state.correct / state.attempts) * 100) : 0;
        renderStorageNote();
        $("stats-line").textContent = state.attempts
            ? state.reviews.toLocaleString() + " reviews · " + state.correct.toLocaleString() +
              " correct (" + pct + "%)"
            : "No reviews yet.";
    }

    function showWord(word) {
        current = { word, bucket: bucketOf(word) };
        revealed = false;
        lookupToken++;

        $("idle-state").hidden = true;
        $("done-state").hidden = true;
        $("quiz-state").hidden = false;
        $("ask-stage").hidden = false;
        $("answer-stage").hidden = true;

        $("word").textContent = word;
        $("word-bucket").textContent = labelFor(word);
        const ls = lastSeen(word);
        $("word-seen").textContent = ls === null
            ? "not seen before"
            : "last seen " + (state.reviews - ls) + " reviews ago";

        $("attempt").value = "";
        $("attempt").focus();
    }

    async function reveal() {
        if (!current || revealed) return;
        revealed = true;
        const token = ++lookupToken;
        const word = current.word;

        const attempt = $("attempt").value.trim();
        $("attempt-echo").hidden = !attempt;
        $("attempt-text").textContent = attempt;

        $("ask-stage").hidden = true;
        $("answer-stage").hidden = false;
        $("def-source").textContent = "";
        $("def-body").textContent = "";
        const loading = document.createElement("p");
        loading.className = "loading";
        loading.textContent = "Looking it up…";
        $("def-body").appendChild(loading);

        const result = await lookup(word);
        if (token !== lookupToken) return;   // user moved on
        if (result) {
            renderDefinition(result);
        } else {
            $("def-source").textContent = "";
            $("def-body").textContent = "";
        }
        renderLookupBox(word, !!result);
    }

    function grade(isCorrect) {
        if (!current || !revealed) return;
        const word = current.word;
        const from = bucketOf(word);
        const to = isCorrect ? Math.min(4, from + 1) : 0;

        state.reviews++;
        state.attempts++;
        if (isCorrect) state.correct++;

        if (buckets[from]) buckets[from].delete(word);
        if (buckets[to]) buckets[to].add(word);
        state.w[word] = [to, state.reviews];

        save();
        renderCounts(to);
        next();
    }

    function skip() {
        if (!current) return;
        const word = current.word;
        // A skip is not a grade, but it still counts as "seen" so the repeat gap
        // does not hand the same word straight back.
        state.reviews++;
        state.w[word] = [bucketOf(word), state.reviews];
        save();
        renderCounts();
        next();
    }

    function next() {
        const word = pickWord();
        if (!word) {
            $("quiz-state").hidden = true;
            $("idle-state").hidden = true;
            $("done-state").hidden = false;
            return;
        }
        showWord(word);
    }

    /* ------------------------------------------------------------- settings */

    function renderSettings() {
        $("mode").value = state.mode;
        $("spaced-opts").hidden = state.mode !== "spaced";
        $("fixed-opts").hidden = state.mode !== "fixed";
        $("il").value = state.iv[0];
        $("i1").value = state.iv[1];
        $("i2").value = state.iv[2];
        $("i3").value = state.iv[3];
        $("cap").value = state.cap;
        for (let i = 0; i < 5; i++) $("w" + i).value = state.weights[i];
        $("gap").value = state.gap;
        checkWeights();
        describeSchedule();
    }

    // Little's law on the review pipeline: work in progress is pinned at `cap`
    // and a word sits in it for about the sum of its three intervals, so the
    // completion rate — and therefore the new-word rate it must balance — is
    // cap / (i1 + i2 + i3) per draw. Worth showing, because it is the number
    // that decides whether the thing works at all.
    function describeSchedule() {
        const span = state.iv[1] + state.iv[2] + state.iv[3];
        const rate = Math.min(1, state.cap / span);
        const msg = ["At these settings roughly " + Math.round(rate * 100) +
            "% of draws will be new words and " + Math.round((1 - rate) * 100) +
            "% reviews, completing about " + Math.round(rate * 100) + " words per 100 draws."];
        if (rate > 0.45) {
            msg.push("The intervals are short against the limit, so words will complete " +
                "quickly without much time to forget between recalls — raise the intervals " +
                "or lower the limit for a stiffer test.");
        }
        $("spaced-note").textContent = msg.join(" ");
    }

    // The weights are relative, so they need not sum to 100 — but a sum far from
    // 100 usually means a typo, and a low review share has a consequence that is
    // worth naming out loud rather than discovering after a thousand draws.
    function checkWeights() {
        const sum = state.weights.reduce((a, b) => a + b, 0);
        const msgs = [];
        if (sum === 0) msgs.push("All weights are zero — pools will be drawn from evenly.");
        else if (Math.abs(sum - 100) > 0.001) msgs.push("Weights sum to " + sum + "; they are used as relative shares.");
        // Every word needs four sightings to finish: one to attempt it, three to
        // recall it. So the non-unstarted share has to carry three times the
        // unstarted share, or the buckets fill faster than they drain.
        const newShare = sum ? state.weights[0] / sum : 0;
        if (newShare > 0.25 && unstartedCount() > 1000) {
            const perWord = Math.round(1 / (1 - newShare) * 3);
            msgs.push("Unstarted is taking " + Math.round(newShare * 100) + "% of draws. A word needs " +
                "three correct recalls after its first attempt, so anything above 25% means words " +
                "arrive faster than they can finish: expect the middle buckets to grow without bound. " +
                "Spaced mode does this arithmetic for you.");
        }
        $("weight-warn").hidden = !msgs.length;
        $("weight-warn").textContent = msgs.join(" ");
    }

    function exportProgress() {
        const payload = Object.assign({}, state, {
            discards: [...MY_DISCARDS],
            definitions: Object.fromEntries(MY_DEFS)
        });
        const blob = new Blob([JSON.stringify(payload, null, 1)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "vocab-progress-" + new Date().toISOString().slice(0, 10) + ".json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function importProgress(file) {
        const reader = new FileReader();
        reader.onload = () => {
            let parsed;
            try { parsed = JSON.parse(reader.result); } catch (e) { toast("That file is not valid JSON."); return; }
            if (!parsed || typeof parsed !== "object" || typeof parsed.w !== "object") {
                toast("That does not look like a progress file.");
                return;
            }
            if (!INDEX) INDEX = new Set(LIST);
            let kept = 0, dropped = 0;
            const clean = {};
            for (const [word, rec] of Object.entries(parsed.w)) {
                if (!INDEX.has(word) || !Array.isArray(rec)) { dropped++; continue; }
                clean[word] = [Math.max(0, Math.min(4, rec[0] | 0)), rec[1] === null ? null : rec[1] | 0];
                kept++;
            }
            state = Object.assign(freshState(), parsed, { w: clean });
            state.weights = (Array.isArray(parsed.weights) && parsed.weights.length === 4)
                ? parsed.weights.map((n) => Math.max(0, Number(n) || 0)) : [95, 3, 1, 1];
            state.gap = Math.max(0, Number(parsed.gap) || 0);
            state.iv = (Array.isArray(parsed.iv) && parsed.iv.length === 4)
                ? parsed.iv.map((n) => Math.max(1, Number(n) || 1)) : [10, 20, 60, 150];
            state.cap = Math.max(1, Number(parsed.cap) || 50);
            state.mode = parsed.mode === "fixed" ? "fixed" : "spaced";
            if (Array.isArray(parsed.discards)) {
                for (const w of parsed.discards) MY_DISCARDS.add(w);
                saveDiscards();
            }
            if (parsed.definitions && typeof parsed.definitions === "object") {
                for (const [w, t] of Object.entries(parsed.definitions)) MY_DEFS.set(w, String(t));
                saveDefs();
                renderDefsNote();
            }
            delete state.discards;
            delete state.definitions;
            rebuildBuckets();
            save();
            renderCounts();
            renderSettings();
            $("quiz-state").hidden = true;
            $("done-state").hidden = true;
            $("idle-state").hidden = false;
            current = null;
            toast("Imported " + kept + " words" + (dropped ? ", " + dropped + " not in this list were dropped." : "."));
        };
        reader.readAsText(file);
    }

    function toast(msg) {
        const el = document.createElement("div");
        el.className = "toast";
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4200);
    }

    /* ----------------------------------------------------------------- wire */

    function wire() {
        $("btn-new").addEventListener("click", next);
        $("btn-reveal").addEventListener("click", reveal);
        $("btn-skip").addEventListener("click", skip);
        $("btn-correct").addEventListener("click", () => grade(true));
        $("btn-wrong").addEventListener("click", () => grade(false));
        $("btn-lookup").addEventListener("click", lookupOnGoogle);
        $("btn-close-modal").addEventListener("click", closeLookup);
        $("lookup-modal").addEventListener("click", (e) => {
            if (e.target === $("lookup-modal")) closeLookup();
        });
        $("pse-id").addEventListener("input", (e) => {
            const v = e.target.value.trim();
            try {
                if (v) localStorage.setItem(PSE_KEY, v); else localStorage.removeItem(PSE_KEY);
            } catch (err) { /* storage blocked */ }
            psePromise = null;
            renderPseNote();
            if (current && revealed) $("lookup-hint").textContent = pseId()
                ? "opens here on the page — or press g"
                : "opens in a search window — or press g";
        });

        $("btn-discard").addEventListener("click", discardCurrent);
        $("btn-discard-2").addEventListener("click", discardCurrent);

        $("btn-copy-defs").addEventListener("click", () => {
            const text = [...MY_DEFS].map(([w, t]) => w + "\t" + encodeDef(t)).join("\n");
            const box = $("defs-out");
            box.hidden = false;
            box.value = text;
            box.focus();
            box.select();
            const done = () => toast("Copied. Paste into vocab/definitions.txt, commit and deploy.");
            if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => {
                toast("Select the box below and copy it by hand.");
            });
            else done();
        });

        $("btn-clear-defs").addEventListener("click", () => {
            if (!MY_DEFS.size) return;
            if (!confirm("Throw away the " + MY_DEFS.size + " definitions you have written? " +
                "Anything already in the shared file stays.")) return;
            const n = MY_DEFS.size;
            MY_DEFS = new Map();
            saveDefs();
            $("defs-out").hidden = true;
            renderDefsNote();
            toast("Removed " + n + " of your definitions.");
        });

        $("btn-copy-discards").addEventListener("click", () => {
            const text = [...MY_DISCARDS].join("\n");
            const box = $("discard-out");
            box.hidden = false;
            box.value = text;
            box.focus();
            box.select();
            const done = () => toast("Copied. Paste into vocab/discarded.txt, commit and deploy.");
            if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => {
                toast("Select the box below and copy it by hand.");
            });
            else done();
        });

        $("btn-restore-discards").addEventListener("click", () => {
            if (!MY_DISCARDS.size) return;
            if (!confirm("Put your " + MY_DISCARDS.size + " discarded words back into the " +
                "rotation? Words in the shared file stay discarded.")) return;
            const n = MY_DISCARDS.size;
            MY_DISCARDS = new Set();
            saveDiscards();
            $("discard-out").hidden = true;
            useList(listId, false).then(() => toast("Restored " + n + " words."));
        });

        $("btn-save-def").addEventListener("click", () => {
            if (!current) return;
            const text = $("own-def").value.trim();
            if (!text) {
                // Cleared and saved means "drop mine", falling back to the shared
                // file or the dictionary rather than storing an empty definition.
                if (!MY_DEFS.delete(current.word)) return;
                saveDefs();
                renderDefsNote();
                $("save-note").textContent = SHARED_DEFS.has(current.word)
                    ? "Yours removed — the shared definition applies again."
                    : "Yours removed — the dictionary applies again.";
                return;
            }
            if (MY_DEFS.size >= DEF_CACHE_MAX && !MY_DEFS.has(current.word)) {
                MY_DEFS.delete(MY_DEFS.keys().next().value);
            }
            MY_DEFS.set(current.word, text);
            saveDefs();
            renderDefsNote();
            $("save-note").textContent = "Saved — it will show in place of the dictionary next time.";
        });

        $("mode").addEventListener("change", (e) => {
            state.mode = e.target.value === "fixed" ? "fixed" : "spaced";
            save();
            renderSettings();
            renderCounts();
        });
        const ivFields = { il: 0, i1: 1, i2: 2, i3: 3 };
        for (const [id, idx] of Object.entries(ivFields)) {
            $(id).addEventListener("input", (e) => {
                state.iv[idx] = Math.max(1, Number(e.target.value) || 1);
                save();
                describeSchedule();
            });
        }
        $("cap").addEventListener("input", (e) => {
            state.cap = Math.max(1, Number(e.target.value) || 1);
            save();
            describeSchedule();
            renderCounts();
        });

        for (let i = 0; i < 5; i++) {
            $("w" + i).addEventListener("input", (e) => {
                state.weights[i] = Math.max(0, Number(e.target.value) || 0);
                save();
                checkWeights();
            });
        }
        $("gap").addEventListener("input", (e) => {
            state.gap = Math.max(0, Number(e.target.value) || 0);
            save();
        });
        document.querySelectorAll("[data-preset]").forEach((btn) => {
            btn.addEventListener("click", () => {
                state.weights = btn.dataset.preset.split(",").map(Number);
                save();
                renderSettings();
            });
        });

        $("btn-export").addEventListener("click", exportProgress);
        $("btn-import").addEventListener("click", () => $("import-file").click());
        $("import-file").addEventListener("change", (e) => {
            if (e.target.files[0]) importProgress(e.target.files[0]);
            e.target.value = "";
        });
        $("btn-reset").addEventListener("click", () => {
            if (!confirm("Delete all progress, saved definitions and settings? This cannot be undone.")) return;
            state = freshState();
            rebuildBuckets();
            save();
            renderCounts();
            renderSettings();
            current = null;
            $("quiz-state").hidden = true;
            $("done-state").hidden = true;
            $("idle-state").hidden = false;
        });

        document.addEventListener("keydown", (e) => {
            const typing = /^(INPUT|TEXTAREA)$/.test(e.target.tagName);
            if (e.key === "Escape" && !$("lookup-modal").hidden) { closeLookup(); return; }
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                if (!$("quiz-state").hidden && !revealed) { e.preventDefault(); reveal(); }
                return;
            }
            if (typing) return;
            if (!$("quiz-state").hidden && !revealed && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault(); reveal();
            } else if (revealed && (e.key === "1" || e.key.toLowerCase() === "c")) {
                grade(true);
            } else if (revealed && (e.key === "2" || e.key.toLowerCase() === "x")) {
                grade(false);
            } else if (revealed && e.key.toLowerCase() === "g") {
                lookupOnGoogle();
            } else if (!$("quiz-state").hidden && e.key.toLowerCase() === "d") {
                discardCurrent();
            } else if (!$("idle-state").hidden && e.key.toLowerCase() === "n") {
                next();
            }
        });
    }

    /* ----------------------------------------------------------------- boot */

    async function fetchList(id) {
        const parts = [];
        for (const file of LISTS[id].files) {
            const res = await fetch(BASE_URL + file);
            if (!res.ok) throw new Error(file + ": HTTP " + res.status);
            parts.push(await res.text());
        }
        return parts.join("\n").split("\n").map((s) => s.trim()).filter(Boolean);
    }

    // The shared discard file. A missing or unreachable file is not an error —
    // it just means nothing is dropped globally.
    async function fetchSharedDiscards() {
        try {
            const res = await fetch(DISCARD_URL);
            if (!res.ok) return new Set();
            return new Set((await res.text()).split("\n")
                .map((line) => line.trim())
                .filter((line) => line && line[0] !== "#"));
        } catch (e) {
            return new Set();
        }
    }

    const isDiscarded = (w) => SHARED_DISCARDS.has(w) || MY_DISCARDS.has(w);

    // word<TAB>definition, with \n for a line break and \\ for a backslash.
    const encodeDef = (t) => t.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n");
    const decodeDef = (t) => t.replace(/\\(.)/g, (m, c) => (c === "n" ? "\n" : c));

    function parseDefs(text) {
        const map = new Map();
        for (const line of text.split("\n")) {
            if (!line.trim() || line[0] === "#") continue;
            const tab = line.indexOf("\t");
            if (tab < 1) continue;
            const word = line.slice(0, tab).trim();
            const body = decodeDef(line.slice(tab + 1)).trim();
            if (word && body) map.set(word, body);
        }
        return map;
    }

    async function fetchSharedDefs() {
        try {
            const res = await fetch(DEFS_URL);
            if (!res.ok) return new Map();
            return parseDefs(await res.text());
        } catch (e) {
            return new Map();
        }
    }

    function loadDefs() {
        try {
            const raw = localStorage.getItem(DEFS_KEY);
            const obj = raw ? JSON.parse(raw) : {};
            MY_DEFS = new Map(Object.entries(obj && typeof obj === "object" ? obj : {}));
        } catch (e) {
            MY_DEFS = new Map();
        }
    }

    function saveDefs() {
        try { localStorage.setItem(DEFS_KEY, JSON.stringify(Object.fromEntries(MY_DEFS))); }
        catch (e) { toast("Could not save the definition — browser storage is full or blocked."); }
    }

    // Yours beats the shared file, which beats the dictionary.
    function savedDef(word) {
        if (MY_DEFS.has(word)) return { text: MY_DEFS.get(word), mine: true };
        if (SHARED_DEFS.has(word)) return { text: SHARED_DEFS.get(word), mine: false };
        return null;
    }

    function loadDiscards() {
        try {
            const raw = localStorage.getItem(DISCARD_KEY);
            const arr = raw ? JSON.parse(raw) : [];
            MY_DISCARDS = new Set(Array.isArray(arr) ? arr : []);
        } catch (e) {
            MY_DISCARDS = new Set();
        }
    }

    function saveDiscards() {
        try { localStorage.setItem(DISCARD_KEY, JSON.stringify([...MY_DISCARDS])); }
        catch (e) { toast("Could not save the discard — browser storage is full or blocked."); }
    }

    function applyDiscards() {
        if (SHARED_DISCARDS.size || MY_DISCARDS.size) {
            LIST = LIST.filter((w) => !isDiscarded(w));
        }
        // A word can be discarded after it has been worked on, and can arrive in
        // the shared file after someone else has started it. Either way its
        // progress record has to go, or the bucket counts drift off the list.
        let changed = false;
        for (const w of Object.keys(state.w)) {
            if (!isDiscarded(w)) continue;
            const b = state.w[w][0];
            if (buckets[b]) buckets[b].delete(w);
            delete state.w[w];
            changed = true;
        }
        if (changed) save();
    }

    function discardCurrent() {
        if (!current) return;
        const word = current.word;
        MY_DISCARDS.add(word);
        saveDiscards();
        const b = bucketOf(word);
        if (buckets[b]) buckets[b].delete(word);
        delete state.w[word];
        LIST = LIST.filter((w) => w !== word);
        save();
        renderCounts();
        renderDiscardNote();
        toast("Discarded “" + word + "”. Publish it from Settings to drop it for everyone.");
        next();
    }

    function renderPseNote() {
        const cx = pseId();
        $("pse-note").textContent = cx
            ? "Set — lookups open as a panel on this page."
            : "Not set — lookups open in a separate search window.";
    }

    function renderDefsNote() {
        const mine = MY_DEFS.size;
        $("defs-note").textContent = SHARED_DEFS.size.toLocaleString() +
            " shown to everyone · " + mine.toLocaleString() + " written by you, not yet published.";
        $("btn-copy-defs").disabled = mine === 0;
        $("btn-clear-defs").disabled = mine === 0;
    }

    function renderDiscardNote() {
        const mine = MY_DISCARDS.size;
        $("discard-note").textContent = SHARED_DISCARDS.size.toLocaleString() +
            " discarded for everyone · " + mine.toLocaleString() +
            (mine === 1 ? " discarded by you, not yet published." : " discarded by you, not yet published.");
        $("btn-copy-discards").disabled = mine === 0;
        $("btn-restore-discards").disabled = mine === 0;
    }

    function listLoadFailed(message) {
        $("list-count").textContent = "failed to load";
        // Leave the idle markup intact — switching to a working list must be able
        // to bring the button back.
        $("idle-msg").textContent = "Could not load the word list (" + message +
            "). Check your connection, or pick a different list in Settings.";
        $("btn-new").disabled = true;
        $("idle-state").hidden = false;
        $("quiz-state").hidden = true;
        $("done-state").hidden = true;
    }

    function renderStorageNote() {
        $("storage-note").textContent = "This list: " + Object.keys(state.w).length.toLocaleString() +
            " words touched.";
    }

    // Selecting a different list swaps both the pool and the saved progress —
    // each list keeps its own record, so nothing is lost by switching back.
    async function useList(id, isSwitch) {
        listId = LISTS[id] ? id : "web2";
        KEY = keyFor(listId);
        try { localStorage.setItem(LIST_PREF_KEY, listId); } catch (e) { /* ignore */ }

        $("list-select").value = listId;
        $("list-name").textContent = LISTS[listId].name;
        $("list-note").textContent = LISTS[listId].note;
        $("list-count").textContent = "loading…";

        load();
        rebuildBuckets();
        INDEX = null;
        current = null;
        $("quiz-state").hidden = true;
        $("done-state").hidden = true;
        $("idle-state").hidden = false;
        renderSettings();

        try {
            const [words, shared, sharedDefs] = await Promise.all([
                fetchList(listId),
                SHARED_DISCARDS.size ? Promise.resolve(SHARED_DISCARDS) : fetchSharedDiscards(),
                SHARED_DEFS.size ? Promise.resolve(SHARED_DEFS) : fetchSharedDefs()
            ]);
            LIST = words;
            SHARED_DISCARDS = shared;
            SHARED_DEFS = sharedDefs;
        } catch (e) {
            LIST = [];
            listLoadFailed(e.message);
            return;
        }
        applyDiscards();
        renderDiscardNote();
        renderDefsNote();

        $("list-count").textContent = LIST.length.toLocaleString();
        $("idle-msg").innerHTML = "Press <strong>New word</strong> to begin.";
        $("btn-new").disabled = false;
        renderCounts();
        checkWeights();
        renderStorageNote();
        if (isSwitch) toast("Switched to " + listId + ".");
    }

    async function boot() {
        loadDiscards();
        loadDefs();
        wire();
        try { $("pse-id").value = localStorage.getItem(PSE_KEY) || ""; } catch (e) { /* blocked */ }
        renderPseNote();
        let pref = "web2";
        try { pref = localStorage.getItem(LIST_PREF_KEY) || "web2"; } catch (e) { /* ignore */ }
        $("list-select").addEventListener("change", (e) => useList(e.target.value, true));
        await useList(pref, false);
    }

    boot();
})();
