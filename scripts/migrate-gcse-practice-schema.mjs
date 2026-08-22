import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";

/* One-time, idempotent migration from the legacy subtopic.practice mapping to
   schemaVersion 2. Run without --write for a dry run. The migration keeps a
   broad drill as a review unlocked by its final prerequisite and creates
   lesson-scoped drills for the earlier links. */

const SCRIPTS = dirname(new URL(import.meta.url).pathname);
const MANIFESTS = readdirSync(SCRIPTS)
    .filter((file) => /^gcse-.*-manifest\.json$/.test(file))
    .sort()
    .map((file) => join(SCRIPTS, file));
const WRITE = process.argv.includes("--write");

const ACRO = { gcse: "GCSE", ks1: "KS1", ks2: "KS2", ks3: "KS3", alevel: "ALevel", fdp: "FDP", hcf: "HCF", lcm: "LCM", suvat: "SUVAT" };
const camel = (kebab) => kebab.split("-").map((word, index) =>
    ACRO[word] ?? (index === 0 ? word : word[0].toUpperCase() + word.slice(1))).join("");
const upperFirst = (value) => value[0].toUpperCase() + value.slice(1);
const reviewFile = (file) => file.replace(/\.html$/, "Review.html");

/* The first written-method splits were audited question by question. Other
   generated stubs receive bounded scaffolding plus the lesson's detailed scope
   note; their actual banks are still marked coming soon. */
const SECTION_OVERRIDES = {
    "structure/place-value": [
        "Digit values — state the value of a named digit in integers to millions and decimals to thousandths (4 questions).",
        "Place-holders — identify or complete numbers where zeros hold whole-number or decimal places (4 questions).",
        "Words and figures — convert between words and figures, including internal zeros and decimal parts (4 questions).",
    ],
    "structure/ordering-numbers": [
        "Decimal order — choose the smallest or largest from decimals of different lengths (4 questions).",
        "Negative order — choose correctly ordered lists containing positive and negative integers and decimals (4 questions).",
        "Number lines and contexts — order values ascending or descending in number-line and temperature contexts (4 questions).",
    ],
    "structure/inequality-symbols": [
        "Basic comparisons — choose =, < or > between integers, decimals and negative numbers (4 questions).",
        "Extended symbols — translate at most, at least and not equal into ≤, ≥ and ≠, including which allow equality (4 questions).",
        "Integer solutions — select the integers satisfying statements such as −2 < n ≤ 3 (4 questions).",
    ],
    "structure/column-addition": [
        "Fluency — add integers and decimals of different lengths by aligning place values and padding zeros (4 questions).",
        "Carrying — add values that require carrying through one or more columns (4 questions).",
        "Application — solve addition-only money and measure problems, with units fixed by the prompt (4 questions).",
    ],
    "structure/column-subtraction": [
        "Fluency — subtract integers and decimals of different lengths by aligning place values and padding zeros (4 questions).",
        "Exchange — subtract with ordinary single-column exchanges, excluding any exchange that must pass through a zero (4 questions).",
        "Application — solve change and difference problems with non-negative answers and no across-zero exchange (4 questions).",
    ],
    "structure/exchanging-across-zeros": [
        "Integers — subtract values such as 3000 − 847 where an exchange passes through one or more zeros (4 questions).",
        "Decimals — subtract values such as 4.03 − 1.276 with zero place-holders and chained exchange (4 questions).",
        "Application — solve subtraction contexts whose written method requires an exchange across zeros (4 questions).",
    ],
    "structure/long-multiplication": [
        "Fluency — multiply two- and three-digit integers by two-digit integers using long multiplication (4 questions).",
        "Structure — complete missing partial products and place-holder zeros in later rows (4 questions).",
        "Application — solve integer-only cost and area problems by long multiplication (4 questions).",
    ],
    "structure/short-division": [
        "Fluency — divide integer and decimal dividends by one-digit divisors, carrying into the next place (4 questions).",
        "Exact decimals — continue past the decimal point until a one-digit division terminates exactly (4 questions).",
        "Structure — complete missing quotient digits or carried remainders in short-division layouts (4 questions).",
    ],
    "structure/interpreting-remainders": [
        "Answer forms — express one-digit divisions as a remainder, exact decimal or fraction as requested (4 questions).",
        "Directed rounding — decide whether a one-digit division context requires rounding up or down (4 questions).",
        "Mixed contexts — choose the appropriate answer for coaches, boxes, tickets and leftovers; the decision is the catch (4 questions).",
    ],
    "structure/long-division": [
        "Integer quotients — divide by two-digit integer divisors using listed multiples and long division (4 questions).",
        "Exact decimals — divide integer or decimal dividends and continue past the point to an exact answer (4 questions).",
        "Structure and application — complete missing long-division steps or solve a context with a two-digit divisor (4 questions).",
    ],
};

const hiddenBroadReviews = new Set(["practiceFractionArithmetic.html", "practiceBounds.html"]);

function genericSections(st) {
    return [
        `Fluency — direct questions on ${st.title.toLowerCase()}, limited to this lesson's stated scope (4 questions).`,
        "Application — use the same skill in unfamiliar or contextual questions without introducing a later method (4 questions).",
        "Check — questions built around the exclusions and likely misconceptions named in the lesson brief (4 questions).",
    ];
}

function migrate(path) {
    const source = JSON.parse(readFileSync(path, "utf8"));
    if (source.schemaVersion === 2) {
        console.log(`${path}: already schemaVersion 2`);
        return { lessons: source.drills.filter((d) => d.kind === "lesson").length, reviews: source.drills.filter((d) => d.kind === "review").length };
    }

    const pageByKey = new Map();
    const groupByKey = new Map();
    const orderedKeys = [];
    const refsByFile = new Map();
    for (const topic of source.topics) {
        const bySlug = new Map(topic.subtopics.map((st) => [st.slug, st]));
        for (const group of topic.groups) for (const slug of group.slugs) {
            const st = bySlug.get(slug);
            const key = `${topic.key}/${slug}`;
            pageByKey.set(key, { key, topic, group, st });
            groupByKey.set(key, group);
            orderedKeys.push(key);
            if (st.practice) {
                if (!refsByFile.has(st.practice)) refsByFile.set(st.practice, []);
                refsByFile.get(st.practice).push(key);
            }
        }
    }
    const orderOf = new Map(orderedKeys.map((key, index) => [key, index]));
    const oldByFile = new Map(source.drills.map((d) => [d.file, d]));
    for (const file of refsByFile.keys()) if (!oldByFile.has(file)) throw new Error(`${path}: unknown legacy drill ${file}`);

    const reserved = new Set();
    const urlKey = (topic, group, file) => `${topic}/${group}/${file}`;
    for (const d of source.drills) for (const group of d.groups) reserved.add(urlKey(d.topic, group, d.file));

    const lessonByPage = new Map();
    const reviews = [];

    function uniqueLessonFile(page, preferred) {
        let file = preferred;
        let attempt = 1;
        while (reserved.has(urlKey(page.topic.key, page.group.slug, file))) {
            const suffix = attempt === 1 ? "Lesson" : `Lesson${attempt}`;
            file = preferred.replace(/\.html$/, `${suffix}.html`);
            attempt++;
        }
        reserved.add(urlKey(page.topic.key, page.group.slug, file));
        return file;
    }

    function makeLesson(pageKey, file, image) {
        const page = pageByKey.get(pageKey);
        const drill = {
            file,
            title: page.st.title,
            description: page.st.description,
            skill: page.st.description,
            topic: page.topic.key,
            groups: [page.group.slug],
            kind: "lesson",
            learningPages: [pageKey],
            tier: page.st.tier,
            scope: page.st.coverNote,
            sections: SECTION_OVERRIDES[pageKey] || genericSections(page.st),
            generate: true,
        };
        if (image) drill.image = image;
        lessonByPage.set(pageKey, drill);
    }

    for (const d of source.drills) {
        const refs = refsByFile.get(d.file) || [];
        if (!refs.length) throw new Error(`${path}: drill ${d.file} has no legacy lesson mapping`);
        const broad = refs.length > 1 || hiddenBroadReviews.has(d.file);
        if (!broad) {
            const pageKey = refs[0];
            const lesson = { ...d, kind: "lesson", learningPages: [pageKey] };
            delete lesson.entryPage;
            lesson.scope ||= pageByKey.get(pageKey).st.coverNote;
            lessonByPage.set(pageKey, lesson);
            continue;
        }

        let requirements = [...refs];
        if (hiddenBroadReviews.has(d.file)) {
            requirements = [];
            const reviewTopic = source.topics.find((topic) => topic.key === d.topic);
            for (const groupSlug of d.groups) {
                const group = reviewTopic.groups.find((candidate) => candidate.slug === groupSlug);
                for (const slug of group.slugs) requirements.push(`${reviewTopic.key}/${slug}`);
            }
        }
        requirements = [...new Set(requirements)].sort((a, b) => orderOf.get(a) - orderOf.get(b));
        const availableAfter = requirements.at(-1);
        const earlyRefs = refs.filter((key) => key !== availableAfter);
        const entryKey = refs.find((key) => pageByKey.get(key).st.slug === d.entryPage);
        const reuseOldForLesson = Boolean(d.generate && entryKey && earlyRefs.includes(entryKey));

        const review = {
            ...d,
            file: reuseOldForLesson ? reviewFile(d.file) : d.file,
            title: /review/i.test(d.title) ? d.title : `${d.title} review`,
            kind: "review",
            learningPages: requirements,
            availableAfter,
        };
        delete review.entryPage;
        if (reuseOldForLesson) {
            const reviewUrl = urlKey(review.topic, review.groups[0], review.file);
            if (reserved.has(reviewUrl)) throw new Error(`${path}: review filename collision ${review.file}`);
            reserved.add(reviewUrl);
            makeLesson(entryKey, d.file, d.image);
        }
        reviews.push(review);

        for (const pageKey of earlyRefs) {
            if (pageKey === entryKey && reuseOldForLesson) continue;
            const page = pageByKey.get(pageKey);
            const preferred = `practice${upperFirst(camel(page.st.slug))}.html`;
            makeLesson(pageKey, uniqueLessonFile(page, preferred));
        }
    }

    for (const topic of source.topics) for (const st of topic.subtopics) {
        delete st.practice;
        if (topic.key === "structure" && st.slug === "place-value") st.written = true;
    }

    const lessonDrills = orderedKeys.flatMap((key) => lessonByPage.has(key) ? [lessonByPage.get(key)] : []);
    const migrated = { schemaVersion: 2, ...source, drills: [...lessonDrills, ...reviews] };
    if (WRITE) writeFileSync(path, JSON.stringify(migrated, null, 4) + "\n");
    console.log(`${path}: ${lessonDrills.length} lesson drills, ${reviews.length} reviews${WRITE ? " written" : " (dry run)"}`);
    return { lessons: lessonDrills.length, reviews: reviews.length };
}

let lessonTotal = 0;
let reviewTotal = 0;
for (const path of MANIFESTS) {
    const result = migrate(path);
    lessonTotal += result.lessons;
    reviewTotal += result.reviews;
}
console.log(`Total: ${lessonTotal} lesson drills, ${reviewTotal} reviews, ${lessonTotal + reviewTotal} practice pages.`);
