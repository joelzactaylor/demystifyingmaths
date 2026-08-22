import { readFileSync } from "node:fs";

// Usage: node scripts/render-coverage-section.mjs <manifest> [--table|--drills]
// Renders a strand manifest as the body of its docs/syllabus-coverage.md
// section (topic blocks), with --table as its rows for the GCSE practice
// table, or with --drills as its question-bank briefs (drills that carry
// "sections"). The output matches the hand-written GCSE Number blocks'
// format exactly, so the doc can be kept in lock-step with the manifests.

const ACRO = { gcse: "GCSE", ks1: "KS1", ks2: "KS2", ks3: "KS3", alevel: "ALevel", fdp: "FDP", hcf: "HCF", lcm: "LCM", suvat: "SUVAT" };
const camel = (kebab) => kebab.split("-").map((w, i) =>
    ACRO[w] ?? (i === 0 ? w : w[0].toUpperCase() + w.slice(1))).join("");

const manifest = JSON.parse(readFileSync(process.argv[2], "utf8"));
const strand = manifest.strand;
const topicUrl = (topic) => `${strand.url}${camel(topic.prefix.replace(new RegExp(`^gcse-${strand.key}-`), ""))}/`;
const groupUrl = (topic, g) => `${topicUrl(topic)}${camel(g.slug)}/`;
// Resolved through the drill's own topic, so cross-topic review links render correctly.
const drillUrl = (d) => {
    const t = manifest.topics.find((x) => x.key === d.topic);
    return `${groupUrl(t, t.groups.find((x) => x.slug === d.groups[0]))}${d.file}`;
};

if (manifest.schemaVersion !== 2) throw new Error("expected schemaVersion 2 manifest");

const pages = new Map();
for (const topic of manifest.topics) {
    const bySlug = new Map(topic.subtopics.map((st) => [st.slug, st]));
    for (const group of topic.groups) for (const slug of group.slugs) {
        const st = bySlug.get(slug);
        pages.set(`${topic.key}/${slug}`, { topic, group, st });
    }
}
const teachUrl = (key) => {
    const page = pages.get(key);
    return `${groupUrl(page.topic, page.group)}${camel(page.st.slug)}.html`;
};
const cardsFor = (key) => manifest.drills.filter((d) =>
    (d.kind === "lesson" && d.learningPages[0] === key)
    || (d.kind === "review" && d.availableAfter === key));

if (process.argv.includes("--table")) {
    for (const d of manifest.drills) {
        const pageKey = d.kind === "lesson" ? d.learningPages[0] : d.availableAfter;
        const prefix = d.kind === "review" ? "Mixed review — " : "";
        const desc = prefix + d.description.replace(/\.$/, "") + (d.tier === "higher" ? " **(H)**" : "");
        console.log(`| \`${drillUrl(d)}\` | ${desc} | \`${teachUrl(pageKey)}\` |`);
    }
    process.exit(0);
}

if (process.argv.includes("--drills")) {
    const blocks = [];
    for (const d of manifest.drills.filter((d) => d.sections)) {
        const h = d.tier === "higher" ? " **(H)**" : "";
        const review = d.kind === "review" ? " *(mixed review)*" : "";
        blocks.push([`**\`${drillUrl(d)}\`**${h}${review} — ${d.skill}`, ...d.sections.map((s) => `- ${s}`)].join("\n"));
    }
    console.log(blocks.join("\n\n"));
    process.exit(0);
}

const blocks = [];
for (const t of manifest.topics) {
    const groupOf = new Map();
    for (const g of t.groups) for (const sl of g.slugs) groupOf.set(sl, g);
    const nHigher = t.subtopics.filter((s) => s.tier === "higher").length;
    const higherNote = nHigher ? `, ${nHigher} Higher only` : "";
    const lines = [`**\`${topicUrl(t)}\` — ${t.title}** *(topic menu, ${t.groups.length} groups, ${t.subtopics.length} teaching pages${higherNote})*`];
    for (const g of t.groups) {
        const drills = manifest.drills.filter((d) => d.topic === t.key && d.groups.includes(g.slug));
        const drillNote = drills.length ? ` Drills: ${drills.map((d) => `\`${drillUrl(d)}\``).join(", ")}.` : "";
        lines.push("", `*\`${groupUrl(t, g)}\` — ${g.title}* (group menu) — ${g.lead}${drillNote}`, "");
        for (const sl of g.slugs) {
            const st = t.subtopics.find((s) => s.slug === sl);
            const key = `${t.key}/${sl}`;
            const h = st.tier === "higher" ? " **(H)**" : "";
            const assigned = cardsFor(key);
            const drilled = assigned.length ? ` — drilled by ${assigned.map((d) => `\`${drillUrl(d)}\``).join(", ")}` : "";
            const written = st.written ? " — **written**" : "";
            lines.push(`- \`${groupUrl(t, g)}${camel(st.slug)}.html\` — ${st.title}${h}: ${st.description}${drilled}${written}`);
        }
    }
    blocks.push(lines.join("\n"));
}
console.log(blocks.join("\n\n\n"));
