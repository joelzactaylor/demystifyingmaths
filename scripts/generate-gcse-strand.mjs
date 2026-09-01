import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { withBase } from "./site-base.mjs";

const ROOT = "/Users/joeltaylor/Documents/Code/demystifyingmaths";
// Usage: node scripts/generate-gcse-strand.mjs [manifest ...]
// Regenerates every menu, teaching and practice-stub page of one or more GCSE
// strands from their manifests (scripts/gcse-<strand>-manifest.json), into the
// nested camelCase layout under pages/curriculum/GCSE/<strand>/. With no
// arguments, every gcse-*-manifest.json in scripts/ is processed. Menus are
// index.html files (the strand menu included); teaching pages and drills live
// in their group's folder. All asset and page URLs are root-absolute and are
// written with the site's base prefix (see scripts/site-base.mjs); the URLs
// used inside this script and in the manifests stay base-less.
// Hand-written pages (standard-form, place-value, and the five original
// practice tests) are never touched: teaching pages marked "written" and
// drills without "generate" are skipped. Manifest validation runs before the
// first write so ownership drift cannot silently replace an authored page.
const SCRIPTS = dirname(new URL(import.meta.url).pathname);
const manifestPaths = process.argv.length > 2
    ? process.argv.slice(2)
    : readdirSync(SCRIPTS).filter((f) => /^gcse-.*-manifest\.json$/.test(f)).sort().map((f) => join(SCRIPTS, f));

// Filename convention: camelCase with acronyms uppercase (see docs + memory).
const ACRO = { gcse: "GCSE", ks1: "KS1", ks2: "KS2", ks3: "KS3", alevel: "ALevel", fdp: "FDP", hcf: "HCF", lcm: "LCM", suvat: "SUVAT" };
const camel = (kebab) => kebab.split("-").map((w, i) =>
    ACRO[w] ?? (i === 0 ? w : w[0].toUpperCase() + w.slice(1))).join("");

// site URL -> file path under the repo (menus are folder indexes)
const urlToPath = (u) => join(ROOT, u.endsWith("/") ? u + "index.html" : u);
/* Written work is never overwritten, whatever the manifest says.

   The manifest's "written" and "generate" flags are a person's memory of which
   pages hold real work, and a page finished without its flag being set is
   invisible to them. Running this script then replaces a finished lesson or
   drill with a stub, and nothing in git can help if the work was never
   committed — which is how fourteen finished practice pages were destroyed.

   So the check is made against the file itself rather than against the record
   of it: a page that does not carry the stub marker is holding something, and
   is left alone. Menus are pure derivations of the manifest and are always
   rebuilt. */
const STUB_MARK = "&mdash;coming soon&mdash;";
const preserved = [];

const write = (url, content) => {
    const p = urlToPath(url);
    const isMenu = url.endsWith("/");
    if (!isMenu && existsSync(p) && !readFileSync(p, "utf8").includes(STUB_MARK)) {
        preserved.push(url);
        return;
    }
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, withBase(content));
};

/* Text from the manifest is interpolated into element content and attribute values,
   so it is escaped once here. The named entities match the convention the
   hand-written pages already use. */
const esc = (v) => String(v)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/−/g, "&minus;").replace(/’/g, "&rsquo;")
    .replace(/²/g, "&sup2;").replace(/³/g, "&sup3;")
    .replace(/π/g, "&pi;").replace(/√/g, "&radic;")
    .replace(/×/g, "&times;").replace(/≤/g, "&le;")
    .replace(/≥/g, "&ge;").replace(/≠/g, "&ne;");
const escAttr = (v) => esc(v).replace(/"/g, "&quot;");

/* Every menu card carries an image slot — background-image: none until an image
   is chosen — filled from the optional manifest field `image` (a root-absolute
   URL) on the topic, group, subtopic or drill. Set images in the manifest, never
   in the generated HTML, so they survive regeneration. curriculum.css supplies
   the cover/centre geometry. */
const art = (o) => ` style="background-image: ${o.image ? `url(${escAttr(o.image)})` : "none"}"`;

/* Menu summaries need to be scannable at a glance. Most manifest summaries are
   already deliberately short; for legacy longer descriptions, end at the last
   natural piece of punctuation that fits. The full description still supplies
   the page metadata and authoring context. */
const cardCopy = (text, limit = 80) => {
    if (text.length <= limit) return text;
    const excerpt = text.slice(0, limit);
    const punctuation = Math.max(excerpt.lastIndexOf(","), excerpt.lastIndexOf(";"), excerpt.lastIndexOf(":"), excerpt.lastIndexOf(" — "));
    if (punctuation >= 25) return text.slice(0, punctuation).replace(/[,.]$/, "") + ".";
    const end = text.lastIndexOf(" ", limit - 1);
    return text.slice(0, end > 0 ? end : limit).replace(/[,.]$/, "") + ".";
};

const FOOTER = `        <footer>
            <div class="footer-content">
                <div class="footer-section">
                    <h2>Explore</h2>
                    <ul>
                        <li><a href="/pages/home.html">Home</a></li>
                        <li><a href="/pages/curriculum/">Curriculum</a></li>
                        <li><a href="/pages/extracurricular/">Extracurricular</a></li>
                        <li><a href="/pages/about.html">About</a></li>
                        <li><a href="/pages/contact.html">Contact</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 demystifyingmaths &middot; joelzactaylor</p>
            </div>
        </footer>`;

const HEAD_TAIL = `    <link rel="apple-touch-icon" sizes="180x180" href="/favicon_io/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon_io/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon_io/favicon-16x16.png">
    <link rel="manifest" href="/favicon_io/site.webmanifest">`;
const FONTS = `    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Aleo:wght@400;700&display=swap" rel="stylesheet">`;
const RIBBON = `        <div id="top-ribbon-placeholder"></div>
        <script>fetch("/embed/top-ribbon.html").then(r => r.text()).then(html => document.getElementById("top-ribbon-placeholder").innerHTML = html);</script>`;

function crumbs(items) {
    return items.map((it, i) =>
        i === items.length - 1
            ? `                    <li>\n                        <p>${esc(it.label)}</p>\n                    </li>`
            : `                    <li><a href="${it.href}">${esc(it.label)}</a><span aria-hidden="true">&rsaquo;</span></li>`
    ).join("\n");
}

function shell({ title, description, styles, scripts, headerTitle, breadcrumb, aside, main, deep }) {
    return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>${escAttr(title)}</title>
    <meta name="description" content="${escAttr(description)}">
    <meta property="og:title" content="Demystifying Maths">
    <meta property="og:description" content="${escAttr(description)}">
${styles.map((s) => `    <link rel="stylesheet" href="/css/${s}">`).join("\n")}
${HEAD_TAIL}
${scripts.map((s) => `    <script src="/js/${s}" defer></script>`).join("\n")}
${FONTS}
</head>

<body>
    <div class="layout">
${RIBBON}

        <header>
            <h1>Demystifying - ${esc(headerTitle)}</h1>
            <nav aria-label="Breadcrumb">
                <ol class="breadcrumb${deep ? " breadcrumb--deep" : ""}">
${breadcrumb}
                </ol>
            </nav>
        </header>
${aside ? "\n        <aside id=\"page-nav-container\"></aside>\n" : ""}
${main}

${FOOTER}
    </div>
</body>

</html>`;
}

/* The strand menu keeps the head shape of the original hand-written
   number/index.html: no og: tags, no navPanel script, no aside. It does carry
   the glossary, which every curriculum page loads — scripts/glossary-check.mjs
   fails a page that does not, and a menu written without it silently drops the
   line the last person to touch the page added by hand. */
function strandIndexPage(strand, topicCards) {
    return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>${escAttr(`Demystifying Maths | GCSE ${strand.introHeading}`)}</title>
    <meta name="description" content="${escAttr(strand.metaDescription)}">
    <link rel="stylesheet" href="/css/shared.css">
    <link rel="stylesheet" href="/css/curriculum.css">
${HEAD_TAIL}
    <script src="/js/glossary.js" defer></script>
${FONTS}
</head>

<body>
    <div class="layout">
${RIBBON}

        <header>
            <h1>Demystifying - ${esc(strand.title)}</h1>
            <nav aria-label="Breadcrumb">
                <ol class="breadcrumb">
${crumbs([
        { href: "/pages/home.html", label: "Home" },
        { href: "/pages/curriculum/", label: "Curriculum" },
        { href: "/pages/curriculum/GCSE/", label: "GCSE Maths" },
        { label: strand.title },
    ])}
                </ol>
            </nav>
        </header>

        <main class="curriculum-main">
            <section class="curriculum-intro">
                <h1>${esc(strand.introHeading)}</h1>
            </section>

            <section class="topic-section" aria-labelledby="topic-heading">
                <h2 id="topic-heading">Topics</h2>
                <div class="topic-grid">
${topicCards}
                </div>
            </section>
        </main>

${FOOTER}
    </div>
</body>

</html>`;
}

function generate(manifestPath) {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const strand = manifest.strand;
    const topicUrl = (topic) => `${strand.url}${camel(topic.prefix.replace(new RegExp(`^gcse-${strand.key}-`), ""))}/`;
    const groupUrl = (topic, g) => `${topicUrl(topic)}${camel(g.slug)}/`;
    const teachUrl = (topic, groupOf, st) => `${groupUrl(topic, groupOf.get(st.slug))}${camel(st.slug)}.html`;
    /* A drill's URL is always resolved through its own topic, so a teaching page
       may name a review from another topic of the strand. */
    const drillUrl = (d) => {
        const t = manifest.topics.find((x) => x.key === d.topic);
        return `${groupUrl(t, t.groups.find((x) => x.slug === d.groups[0]))}${d.file}`;
    };

    const BASE_CRUMBS = [
        { href: "/pages/home.html", label: "Home" },
        { href: "/pages/curriculum/", label: "Curriculum" },
        { href: "/pages/curriculum/GCSE/", label: "GCSE Maths" },
        { href: strand.url, label: strand.title },
    ];

    const teachCard = (topic, groupOf, st) => {
        /* No written/coming-soon status on cards: it would have to be removed page by
           page as the content lands. The tier badge is the only card metadata. */
        const metaRow = st.tier === "higher"
            ? `\n                        <span class="topic-card__meta"><span class="topic-card__tier">Higher</span></span>`
            : "";
        return `                    <a class="topic-card" href="${teachUrl(topic, groupOf, st)}"${art(st)}>
                        <h3>${esc(st.title)}</h3>
                        <p>${esc(cardCopy(st.description))}</p>${metaRow}
                    </a>`;
    };

    const practiceCard = (d) => `                    <a class="topic-card topic-card--practice" href="${drillUrl(d)}"${art(d)}>
                        <span class="practice-card__kicker">Practice</span>
                        <h3>${esc(d.title)}</h3>
                        <p>${esc(cardCopy(d.description))}</p>${d.kind === "review" ? `
                        <span class="topic-card__meta"><span class="topic-card__count">Mixed review</span></span>` : ""}
                    </a>`;

    const onwardCard = (next) => `                    <a class="topic-card topic-card--next" href="${next.href}" style="background-image: none">
                        <span class="topic-card__kicker">${next.final ? "Next step" : "Next lesson"}</span>
                        <h3>${esc(next.title)}</h3>
                        <p>${esc(cardCopy(next.description))}</p>
                    </a>`;

    if (manifest.schemaVersion !== 2) throw new Error(`${manifestPath}: expected schemaVersion 2`);

    /* Build and validate the whole teaching-page graph before writing anything.
       A lesson drill has one learning page. A review may cover several, but its
       availableAfter page must come after every prerequisite in curriculum order. */
    const groupOfByTopic = new Map();
    const teachingByKey = new Map();
    const teachingOrder = new Map();
    const teachingSequence = [];
    let order = 0;
    for (const topic of manifest.topics) {
        const bySlug = new Map(topic.subtopics.map((st) => [st.slug, st]));
        const groupOf = new Map();
        for (const g of topic.groups) for (const sl of g.slugs) {
            if (groupOf.has(sl)) throw new Error(`slug ${sl} in two groups (${topic.key})`);
            if (!bySlug.has(sl)) throw new Error(`group names unknown slug ${sl} (${topic.key})`);
            groupOf.set(sl, g);
            const key = `${topic.key}/${sl}`;
            const page = { key, topic, group: g, st: bySlug.get(sl) };
            teachingByKey.set(key, page);
            teachingOrder.set(key, order++);
            teachingSequence.push(page);
        }
        for (const st of topic.subtopics) {
            if (!groupOf.has(st.slug)) throw new Error(`${st.slug} in no group (${topic.key})`);
            if (Object.hasOwn(st, "practice")) throw new Error(`${topic.key}/${st.slug}: legacy practice field is not allowed in schemaVersion 2`);
            if (!st.written) {
                const p = urlToPath(teachUrl(topic, groupOf, st));
                if (existsSync(p) && !readFileSync(p, "utf8").includes("<p>&mdash;coming soon&mdash;</p>"))
                    throw new Error(`${topic.key}/${st.slug}: generated ownership would overwrite an authored lesson; set written:true`);
            }
        }
        groupOfByTopic.set(topic.key, groupOf);
    }

    const lessonDrills = new Map();
    const unlockedReviews = new Map();
    const drillUrls = new Set();
    for (const d of manifest.drills) {
        if (!['lesson', 'review'].includes(d.kind)) throw new Error(`${d.file}: kind must be lesson or review`);
        if (!Array.isArray(d.learningPages) || !d.learningPages.length) throw new Error(`${d.file}: learningPages must not be empty`);
        for (const key of d.learningPages) if (!teachingByKey.has(key)) throw new Error(`${d.file}: unknown learning page ${key}`);
        const url = drillUrl(d);
        if (drillUrls.has(url)) throw new Error(`duplicate drill URL ${url}`);
        drillUrls.add(url);
        if (d.kind === "lesson") {
            if (d.learningPages.length !== 1) throw new Error(`${d.file}: lesson drill must have exactly one learning page`);
            const key = d.learningPages[0];
            const owner = teachingByKey.get(key);
            if (d.topic !== owner.topic.key || d.groups.length !== 1 || d.groups[0] !== owner.group.slug)
                throw new Error(`${d.file}: lesson drill must live with ${key}`);
            if (!lessonDrills.has(key)) lessonDrills.set(key, []);
            lessonDrills.get(key).push(d);
        } else {
            if (!d.availableAfter || !d.learningPages.includes(d.availableAfter))
                throw new Error(`${d.file}: review availableAfter must name one of its learningPages`);
            const unlockOrder = teachingOrder.get(d.availableAfter);
            const later = d.learningPages.find((key) => teachingOrder.get(key) > unlockOrder);
            if (later) throw new Error(`${d.file}: ${later} is taught after availableAfter ${d.availableAfter}`);
            if (!unlockedReviews.has(d.availableAfter)) unlockedReviews.set(d.availableAfter, []);
            unlockedReviews.get(d.availableAfter).push(d);
        }
    }

    let written = [];

    for (const topic of manifest.topics) {
        const bySlug = new Map(topic.subtopics.map((st) => [st.slug, st]));
        const groupOf = groupOfByTopic.get(topic.key);

        // ---------- teaching stub pages (breadcrumb runs through the group) ----------
        for (const st of topic.subtopics) {
            if (st.written) continue; // authored by hand
            const g = groupOf.get(st.slug);
            const sections = [];
            /* The owner's authoring brief — the one sanctioned piece of non-teaching
               copy on a stub. Delete the block as each page's content is written. */
            if (st.coverNote) sections.push(`            <section class="author-note" aria-label="Author note">
                <span class="author-note__label">Author note &mdash; to cover${st.tier === "higher" ? " (Higher)" : ""}</span>
                <p>${esc(st.coverNote)}</p>
            </section>`);
            sections.push(`            <section>
                <h1>Introduction</h1>
                <p>&mdash;coming soon&mdash;</p>
            </section>`);
            const pageKey = `${topic.key}/${st.slug}`;
            const drills = [...(lessonDrills.get(pageKey) || []), ...(unlockedReviews.get(pageKey) || [])];
            const nextPage = teachingSequence[teachingOrder.get(pageKey) + 1];
            const next = nextPage
                ? {
                    href: teachUrl(nextPage.topic, groupOfByTopic.get(nextPage.topic.key), nextPage.st),
                    title: nextPage.st.title,
                    description: nextPage.st.description,
                    final: false,
                }
                : {
                    href: "/pages/curriculum/GCSE/",
                    title: "Choose another GCSE topic",
                    description: "Return to the GCSE Maths menu and choose what to learn next.",
                    final: true,
                };
            sections.push(`            <section class="topic-section lesson-actions" aria-labelledby="practice-heading">
                <h2 id="practice-heading">${drills.length ? "Practice and continue" : "Continue"}</h2>
                <div class="topic-grid">
${[...drills.map((d) => practiceCard(d)), onwardCard(next)].join("\n")}
                </div>
            </section>`);
            write(teachUrl(topic, groupOf, st), shell({
                title: `Demystifying Maths | GCSE ${st.title}`,
                description: st.description,
                styles: ["shared.css", "curriculum.css", "lesson.css"],
                scripts: ["navPanel.js", "glossary.js"],
                headerTitle: st.title,
                breadcrumb: crumbs([...BASE_CRUMBS,
                    { href: topicUrl(topic), label: topic.crumbLabel || topic.title },
                    { href: groupUrl(topic, g), label: g.crumb },
                    { label: st.title }]),
                aside: true, deep: true,
                main: `        <main class="lesson-main">\n${sections.join("\n\n")}\n        </main>`,
            }) + "\n");
            written.push(teachUrl(topic, groupOf, st));
        }

        // ---------- group menu pages (the deepest menu level, so drills live here) ----------
        for (const g of topic.groups) {
            const items = g.slugs.map((sl) => bySlug.get(sl));
            const drills = manifest.drills.filter((d) => d.topic === topic.key && d.groups.includes(g.slug));
            const practiceSection = drills.length ? `

            <section class="topic-section" aria-labelledby="practice-heading">
                <h2 id="practice-heading">Practice</h2>
                <div class="topic-grid">
${drills.map((d) => practiceCard(d)).join("\n")}
                </div>
            </section>` : "";
            write(groupUrl(topic, g), shell({
                title: `Demystifying Maths | GCSE ${g.title}`,
                description: g.lead,
                styles: ["shared.css", "curriculum.css"],
                scripts: ["navPanel.js", "glossary.js"],
                headerTitle: g.title,
                breadcrumb: crumbs([...BASE_CRUMBS,
                    { href: topicUrl(topic), label: topic.crumbLabel || topic.title },
                    { label: g.title }]),
                aside: true, deep: true,
                main: `        <main class="curriculum-main">
            <section class="curriculum-intro">
                <h1>${esc(g.title)}</h1>
            </section>

            <section class="topic-section" aria-labelledby="pages-heading">
                <h2 id="pages-heading">Pages</h2>
                <div class="topic-grid">
${items.map((st) => teachCard(topic, groupOf, st)).join("\n")}
                </div>
            </section>${practiceSection}
        </main>`,
            }) + "\n");
            written.push(`${groupUrl(topic, g)}  (group menu, ${items.length} pages, ${drills.length} drills)`);
        }

        // ---------- topic menu page: a menu of groups, no drills at this level ----------
        const groupCards = topic.groups.map((g) => {
            const items = g.slugs.map((sl) => bySlug.get(sl));
            const nHigher = items.filter((st) => st.tier === "higher").length;
            const counts = `${items.length} pages` + (nHigher ? ` &middot; ${nHigher} Higher` : "");
            return `                    <a class="topic-card" href="${groupUrl(topic, g)}"${art(g)}>
                        <h3>${esc(g.title)}</h3>
                        <p>${esc(cardCopy(g.lead))}</p>
                        <span class="topic-card__meta"><span class="topic-card__count">${counts}</span></span>
                    </a>`;
        }).join("\n");
        write(topicUrl(topic), shell({
            title: `Demystifying Maths | GCSE ${topic.title}`,
            description: topic.metaDescription,
            styles: ["shared.css", "curriculum.css"],
            scripts: ["navPanel.js", "glossary.js"],
            headerTitle: topic.title,
            breadcrumb: crumbs([...BASE_CRUMBS, { label: topic.title }]),
            aside: false,
            main: `        <main class="curriculum-main">
            <section class="curriculum-intro">
                <h1>${esc(topic.title)}</h1>
            </section>

            <section class="topic-section" aria-labelledby="groups-heading">
                <h2 id="groups-heading">Groups</h2>
                <div class="topic-grid">
${groupCards}
                </div>
            </section>
        </main>`,
        }) + "\n");
        written.push(`${topicUrl(topic)}  (topic menu, ${topic.groups.length} group cards)`);
    }

    // ---------- practice stub pages for the new drills ----------
    for (const d of manifest.drills) {
        if (!d.generate) continue; // existing hand-written tests are left alone
        const learning = d.learningPages.map((key) => teachingByKey.get(key));
        const primary = learning[0];
        const topic = manifest.topics.find((t) => t.key === d.topic);
        const g = topic.groups.find((x) => x.slug === d.groups[0]);
        const noteBlock = d.sections ? `

                <div class="author-note">
                    <span class="author-note__label">Author note &mdash; to cover${d.tier === "higher" ? " (Higher)" : ""}</span>
${d.scope ? `                    <p>${esc(d.scope)}</p>\n` : ""}                    <ul>
${d.sections.map((s) => `                        <li>${esc(s)}</li>`).join("\n")}
                    </ul>
                </div>` : "";
        const learningLinks = d.kind === "lesson"
            ? `                <p>The method this drill practises is taught on
                    <a href="${teachUrl(primary.topic, groupOfByTopic.get(primary.topic.key), primary.st)}">${esc(primary.st.title)}</a>.</p>`
            : `                <p>This mixed review uses the methods from these learning pages:</p>
                <ul>
${learning.map((p) => `                    <li><a href="${teachUrl(p.topic, groupOfByTopic.get(p.topic.key), p.st)}">${esc(p.st.title)}</a></li>`).join("\n")}
                </ul>`;
        write(drillUrl(d), shell({
            title: `Demystifying Maths | Practice: ${d.title}`,
            description: d.description,
            styles: ["shared.css", "curriculum.css", "practice.css"],
            scripts: ["navPanel.js", "glossary.js"],
            headerTitle: d.title,
            breadcrumb: crumbs([...BASE_CRUMBS,
                { href: topicUrl(topic), label: topic.crumbLabel || topic.title },
                { href: groupUrl(topic, g), label: g.crumb },
                { label: d.title }]),
            aside: true, deep: true,
            main: `        <main class="practice-main">
            <section>
                <div class="skill-strip">
                    <span class="skill-strip__label">Drills</span>
                    <p>${esc(d.skill)}</p>
                </div>${noteBlock}

                <h1>The test</h1>
                <p>&mdash;coming soon&mdash;</p>
            </section>

            <section>
                <h1>Where to go next</h1>
${learningLinks}
            </section>
        </main>`,
        }) + "\n");
        written.push(drillUrl(d) + "  (practice stub)");
    }

    // ---------- strand menu: a card per topic ----------
    const topicCards = manifest.topics.map((topic) =>
        `                    <a class="topic-card" href="${topicUrl(topic)}"${art(topic)}>
                        <h3>${esc(topic.title)}</h3>
                        <p>${esc(cardCopy(topic.cardDescription))}</p>
                        <span class="topic-card__meta"><span class="topic-card__count">${topic.subtopics.length} pages</span></span>
                    </a>`).join("\n");
    write(strand.url, strandIndexPage(strand, topicCards) + "\n");
    written.push(`${strand.url}  (strand menu, ${manifest.topics.length} topic cards)`);
    if (preserved.length) {
        written.push(`\n${preserved.length} page(s) left alone because they hold work, not a stub:`);
        preserved.forEach((u) => written.push(`  kept  ${u}`));
    }

    console.log(written.join("\n"));
    console.log(`\n${strand.key}: ${written.length} files written`);
    return written.length;
}

let total = 0;
for (const p of manifestPaths) total += generate(p);
console.log(`\n${total} files written from ${manifestPaths.length} manifest(s)`);
