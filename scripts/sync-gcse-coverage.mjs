import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = dirname(dirname(new URL(import.meta.url).pathname));
const DOC = join(ROOT, "docs/syllabus-coverage.md");
const RENDERER = join(ROOT, "scripts/render-coverage-section.mjs");
const WRITE = process.argv.includes("--write");
const strands = [
    ["Number", "Number", "gcse-number-manifest.json"],
    ["Algebra", "Algebra", "gcse-algebra-manifest.json"],
    ["Ratio, proportion and rates of change", "Ratio", "gcse-ratio-manifest.json"],
    ["Geometry and measures", "Geometry", "gcse-geometry-manifest.json"],
    ["Probability", "Probability", "gcse-probability-manifest.json"],
    ["Statistics", "Statistics", "gcse-statistics-manifest.json"],
].map(([heading, specName, file]) => {
    const path = join(ROOT, "scripts", file);
    return { heading, specName, path, manifest: JSON.parse(readFileSync(path, "utf8")) };
});

const render = (path, flag) => execFileSync(process.execPath, [RENDERER, path, ...(flag ? [flag] : [])], { encoding: "utf8" }).trim();
const counts = (manifest) => ({
    topics: manifest.topics.length,
    groups: manifest.topics.reduce((sum, topic) => sum + topic.groups.length, 0),
    lessons: manifest.topics.reduce((sum, topic) => sum + topic.subtopics.length, 0),
});
const words = (number) => ({ 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six" })[number] || String(number);

let doc = readFileSync(DOC, "utf8");

for (let index = 0; index < strands.length; index++) {
    const strand = strands[index];
    const startMarker = `### ${strand.heading}\n`;
    const endMarker = index < strands.length - 1 ? `### ${strands[index + 1].heading}\n` : "---\n\n## A level";
    const start = doc.indexOf(startMarker);
    const end = doc.indexOf(endMarker, start + startMarker.length);
    if (start < 0 || end < 0) throw new Error(`cannot find main coverage block for ${strand.heading}`);
    const count = counts(strand.manifest);
    const intro = `${words(count.topics)} topic menus, ${count.groups} group menus, and ${count.lessons} teaching pages. Lesson drills are narrow; mixed reviews appear only after their final prerequisite.`;
    const replacement = `${startMarker}\n${intro}\n\n${render(strand.path)}\n\n`;
    doc = doc.slice(0, start) + replacement + doc.slice(end);
}

const tableStartMatch = /^### GCSE — .*$/m.exec(doc);
const tableEnd = doc.indexOf("### A level —", tableStartMatch?.index ?? 0);
if (!tableStartMatch || tableEnd < 0) throw new Error("cannot find GCSE practice table");
const tableRows = strands.map((strand) => render(strand.path, "--table")).join("\n");
const drillCount = strands.reduce((sum, strand) => sum + strand.manifest.drills.length, 0);
const table = `### GCSE — ${drillCount} pages\n\n| Page | Drills | Available after |\n| --- | --- | --- |\n${tableRows}\n\n`;
doc = doc.slice(0, tableStartMatch.index) + table + doc.slice(tableEnd);

for (let index = 0; index < strands.length; index++) {
    const strand = strands[index];
    const shortName = strand.specName;
    const startMarker = `### GCSE ${shortName} drill specifications\n`;
    const endMarker = index < strands.length - 1
        ? `### GCSE ${strands[index + 1].specName} drill specifications\n`
        : "### Groups with no drill\n";
    const start = doc.indexOf(startMarker);
    const end = doc.indexOf(endMarker, start + startMarker.length);
    if (start < 0 || end < 0) throw new Error(`cannot find drill specification block for ${shortName}`);
    const body = render(strand.path, "--drills");
    const replacement = `${startMarker}\nLesson-scoped and mixed-review question-bank briefs generated from the strand manifest.\n\n${body}\n\n`;
    doc = doc.slice(0, start) + replacement + doc.slice(end);
}

if (WRITE) writeFileSync(DOC, doc);
console.log(`${WRITE ? "Updated" : "Would update"} ${DOC} for ${drillCount} GCSE practice pages.`);
