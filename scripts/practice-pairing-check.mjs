import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { stripBase } from "./site-base.mjs";

const ROOT = dirname(dirname(new URL(import.meta.url).pathname));
const SCRIPTS = join(ROOT, "scripts");
const manifests = readdirSync(SCRIPTS)
    .filter((file) => /^gcse-.*-manifest\.json$/.test(file))
    .sort()
    .map((file) => join(SCRIPTS, file));
const ACRO = { gcse: "GCSE", ks1: "KS1", ks2: "KS2", ks3: "KS3", alevel: "ALevel", fdp: "FDP", hcf: "HCF", lcm: "LCM", suvat: "SUVAT" };
const camel = (kebab) => kebab.split("-").map((word, index) =>
    ACRO[word] ?? (index === 0 ? word : word[0].toUpperCase() + word.slice(1))).join("");
const urlToPath = (url) => join(ROOT, url.endsWith("/") ? url + "index.html" : url);

const problems = [];
let teachingCount = 0;
let lessonDrillCount = 0;
let reviewCount = 0;

for (const manifestPath of manifests) {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const label = manifestPath.replace(ROOT + "/", "");
    if (manifest.schemaVersion !== 2) {
        problems.push(`${label}: expected schemaVersion 2`);
        continue;
    }

    const strand = manifest.strand;
    const topicUrl = (topic) => `${strand.url}${camel(topic.prefix.replace(new RegExp(`^gcse-${strand.key}-`), ""))}/`;
    const groupUrl = (topic, group) => `${topicUrl(topic)}${camel(group.slug)}/`;
    const teachingUrl = (page) => `${groupUrl(page.topic, page.group)}${camel(page.st.slug)}.html`;
    const drillUrl = (drill) => {
        const topic = manifest.topics.find((candidate) => candidate.key === drill.topic);
        const group = topic?.groups.find((candidate) => candidate.slug === drill.groups?.[0]);
        return topic && group ? `${groupUrl(topic, group)}${drill.file}` : null;
    };

    const pages = new Map();
    const pageSequence = [];
    const order = new Map();
    let index = 0;
    for (const topic of manifest.topics) {
        const bySlug = new Map(topic.subtopics.map((st) => [st.slug, st]));
        const seen = new Set();
        for (const group of topic.groups) for (const slug of group.slugs) {
            const st = bySlug.get(slug);
            const key = `${topic.key}/${slug}`;
            if (!st) problems.push(`${label}: ${group.slug} names unknown page ${key}`);
            if (seen.has(slug)) problems.push(`${label}: ${key} occurs in more than one group`);
            seen.add(slug);
            const page = { key, topic, group, st };
            pages.set(key, page);
            pageSequence.push(page);
            order.set(key, index++);
        }
        for (const st of topic.subtopics) {
            const key = `${topic.key}/${st.slug}`;
            if (!seen.has(st.slug)) problems.push(`${label}: ${key} is not in a group`);
            if (Object.hasOwn(st, "practice")) problems.push(`${label}: ${key} still has a legacy practice field`);
        }
    }

    const expectedByPage = new Map();
    const urls = new Set();
    for (const drill of manifest.drills) {
        const url = drillUrl(drill);
        if (!url) {
            problems.push(`${label}: ${drill.file} has an unknown topic or group`);
            continue;
        }
        if (urls.has(url)) problems.push(`${label}: duplicate drill URL ${url}`);
        urls.add(url);
        if (!Array.isArray(drill.learningPages) || !drill.learningPages.length) {
            problems.push(`${label}: ${drill.file} has no learningPages`);
            continue;
        }
        for (const key of drill.learningPages) if (!pages.has(key)) problems.push(`${label}: ${drill.file} names unknown learning page ${key}`);

        let displayPage;
        if (drill.kind === "lesson") {
            lessonDrillCount++;
            if (drill.learningPages.length !== 1) problems.push(`${label}: ${drill.file} lesson drill has ${drill.learningPages.length} learning pages`);
            displayPage = drill.learningPages[0];
            const owner = pages.get(displayPage);
            if (owner && (drill.topic !== owner.topic.key || drill.groups.length !== 1 || drill.groups[0] !== owner.group.slug))
                problems.push(`${label}: ${drill.file} does not live beside ${displayPage}`);
        } else if (drill.kind === "review") {
            reviewCount++;
            displayPage = drill.availableAfter;
            if (!displayPage || !drill.learningPages.includes(displayPage))
                problems.push(`${label}: ${drill.file} has an invalid availableAfter page`);
            else {
                const unlock = order.get(displayPage);
                const later = drill.learningPages.find((key) => order.get(key) > unlock);
                if (later) problems.push(`${label}: ${drill.file} exposes ${later} before it is taught`);
            }
        } else {
            problems.push(`${label}: ${drill.file} has invalid kind ${drill.kind}`);
        }
        if (displayPage) {
            if (!expectedByPage.has(displayPage)) expectedByPage.set(displayPage, []);
            expectedByPage.get(displayPage).push(url);
        }

        const practicePath = urlToPath(url);
        if (!existsSync(practicePath)) problems.push(`${label}: missing drill page ${url}`);
        else if (drill.generate) {
            const html = stripBase(readFileSync(practicePath, "utf8"));
            for (const key of drill.learningPages) {
                const page = pages.get(key);
                if (page && !html.includes(`href="${teachingUrl(page)}"`))
                    problems.push(`${label}: ${url} does not link back to ${key}`);
            }
        }

        const topic = manifest.topics.find((candidate) => candidate.key === drill.topic);
        for (const groupSlug of drill.groups) {
            const group = topic?.groups.find((candidate) => candidate.slug === groupSlug);
            if (!group) continue;
            const menuPath = urlToPath(groupUrl(topic, group));
            if (!existsSync(menuPath)) problems.push(`${label}: missing group menu ${groupUrl(topic, group)}`);
            else {
                const menu = stripBase(readFileSync(menuPath, "utf8"));
                const occurrences = menu.split(`href="${url}"`).length - 1;
                if (occurrences !== 1) problems.push(`${label}: ${groupUrl(topic, group)} contains ${occurrences} links to ${url}, expected 1`);
            }
        }
    }

    for (const [pageIndex, page] of pageSequence.entries()) {
        teachingCount++;
        const url = teachingUrl(page);
        const path = urlToPath(url);
        if (!existsSync(path)) {
            problems.push(`${label}: missing teaching page ${url}`);
            continue;
        }
        const html = stripBase(readFileSync(path, "utf8"));
        if (!page.st.written && !html.includes("<p>&mdash;coming soon&mdash;</p>"))
            problems.push(`${label}: ${page.key} is generated but no longer has the stub signature`);
        if (html.includes("Drills for this topic")) problems.push(`${label}: ${page.key} still uses the old drill paragraph`);
        const actual = [...html.matchAll(/<a class="topic-card topic-card--practice"[^>]*href="([^"]+)"/g)].map((match) => match[1]).sort();
        const expected = [...(expectedByPage.get(page.key) || [])].sort();
        if (actual.join("\n") !== expected.join("\n"))
            problems.push(`${label}: ${page.key} cards [${actual.join(", ")}] != expected [${expected.join(", ")}]`);
        const nextPage = pageSequence[pageIndex + 1];
        const expectedNext = nextPage ? teachingUrl(nextPage) : "/pages/curriculum/GCSE/";
        const nextLinks = [...html.matchAll(/<a class="topic-card topic-card--next"[^>]*href="([^"]+)"/g)].map((match) => match[1]);
        if (nextLinks.length !== 1 || nextLinks[0] !== expectedNext)
            problems.push(`${label}: ${page.key} next link [${nextLinks.join(", ")}] != expected [${expectedNext}]`);
    }
}

if (problems.length) problems.forEach((problem) => console.log(problem));
console.log(`\n${teachingCount} teaching pages, ${lessonDrillCount} lesson drills, ${reviewCount} reviews; ${problems.length} problems.`);
process.exit(problems.length ? 1 : 0);
