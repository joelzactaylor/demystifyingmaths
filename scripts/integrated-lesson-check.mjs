// Browser-level checks for the short questions embedded in teaching sections.
// Usage: node scripts/integrated-lesson-check.mjs <lesson.html> [more lessons]

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BASE } from "./site-base.mjs";

const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ORIGIN = process.env.SITE_ORIGIN || "http://localhost:8000";
const pages = process.argv.slice(2);

if (!pages.length) {
    console.error("usage: node scripts/integrated-lesson-check.mjs <lesson.html> [more lessons]");
    process.exit(2);
}
if (!existsSync(CHROME)) {
    console.error(`Chrome not found at ${CHROME}; set CHROME to its binary.`);
    process.exit(2);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const profile = mkdtempSync(join(tmpdir(), "integrated-lesson-check-"));
const chrome = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--remote-debugging-port=0",
    `--user-data-dir=${profile}`, "about:blank",
], { stdio: "ignore" });
process.on("exit", () => { try { chrome.kill(); } catch { /* already gone */ } });

const portFile = join(profile, "DevToolsActivePort");
for (let i = 0; i < 100 && !existsSync(portFile); i++) await sleep(100);
if (!existsSync(portFile)) throw new Error("Chrome did not start.");
const [port, browserPath] = readFileSync(portFile, "utf8").trim().split("\n");
const ws = new WebSocket(`ws://127.0.0.1:${port}${browserPath}`);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

let nextId = 1;
const pending = new Map();
const listeners = [];
ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
        const held = pending.get(message.id);
        pending.delete(message.id);
        message.error ? held.reject(new Error(message.error.message)) : held.resolve(message.result);
    } else if (message.method) listeners.forEach((listener) => listener(message));
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

const inspect = String(async function inspect() {
    const problems = [];
    const roots = Array.from(document.querySelectorAll("[data-lesson-check]"));
    if (!roots.length) problems.push("no integrated checks mounted");
    if (document.querySelector(".lesson-check__head, .lesson-check__progress, .lesson-check__title")) {
        problems.push("legacy mini-quiz framing remains");
    }

    const main = document.querySelector("main.lesson-flow");
    if (roots.length > 1) {
        if (!main || !main.querySelector(".lesson-flowbar")) problems.push("guided lesson progress is not mounted");
        else {
            const gateSections = [...new Set(roots.map((root) => root.closest("section")))];
            if (!gateSections.slice(1).some((section) => section.hidden)) problems.push("later ideas are not initially withheld");
        }
    }

    const checkedApis = new Set();
    roots.forEach(function (root, index) {
        const turns = root.querySelectorAll(".lesson-check__turn");
        if (turns.length !== 1) problems.push("check " + (index + 1) + " does not begin with one question");
        const prompt = root.querySelector(".lesson-check__prompt");
        const response = root.querySelector(".lesson-check__response");
        if (!prompt || !response) problems.push("check " + (index + 1) + " lacks its sentence or answer gap");

        const apiName = root.dataset.lessonCheckApi || document.querySelector("[data-lesson-check-api]")?.dataset.lessonCheckApi;
        const api = apiName ? window[apiName] : window.PracticeEngine?.active;
        if (api && api.selfCheck && !checkedApis.has(api)) {
            checkedApis.add(api);
            api.selfCheck(30).forEach(function (problem) { problems.push((apiName || "PracticeEngine") + ": " + problem); });
        }

        const check = root.querySelector(".lesson-check__check");
        if (check) {
            check.click();
            const turn = root.querySelector(".lesson-check__turn");
            if (!turn.classList.contains("is-incomplete")) problems.push("check " + (index + 1) + " marks a blank as attempted");
        }
        const hint = root.querySelector(".lesson-check__help button");
        if (hint) {
            hint.click();
            const support = root.querySelector(".lesson-check__support");
            const method = root.querySelectorAll(".lesson-check__help button")[1];
            if (!support || support.hidden || !method || method.hidden) problems.push("check " + (index + 1) + " does not unfold its help");
        }
    });
    if (roots.length > 1 && main) {
        const first=roots[0], section=first.closest("section");
        const tail=section.querySelector(".roots-reading-step");
        if (tail) {
            // Reading-step lessons reveal a conclusion and Continue before the
            // next idea. A synthetic completion event alone is not an answer.
            const api=window[first.dataset.lessonCheckApi];
            const questions=api?.buildRound().filter(q=>q.stage===Number(first.dataset.lessonCheck)).slice(0,2);
            if (!questions || questions.length!==2) problems.push("first idea's answer bank is unavailable");
            else {
                for (let i=0;i<questions.length;i++) {
                    const input=first.querySelectorAll("input")[i];
                    if (!input) { problems.push("next inline question was not revealed"); break; }
                    input.value=String(questions[i].expected);
                    input.dispatchEvent(new Event("input",{bubbles:true}));
                    await new Promise(resolve=>setTimeout(resolve,350));
                }
                const next=tail.querySelector(".roots-continue");
                if (tail.hidden || !next || next.hidden) problems.push("completed answers do not reveal the reading step and Continue");
                else next.click();
            }
        } else first.dispatchEvent(new CustomEvent("lessoncheckcomplete",{bubbles:true}));
        if (roots[1].closest("section").hidden) problems.push("completing an idea does not reveal the next one");
    }
    return problems;
});

let failures = 0;
for (const page of pages) {
    const loaded = once("Page.loadEventFired", sessionId);
    await send("Page.navigate", { url: `${ORIGIN}${BASE}/${page.replace(/^\/+/, "")}` }, sessionId);
    await loaded;
    await sleep(80);
    const result = await send("Runtime.evaluate", {
        expression: `(${inspect})()`, returnByValue: true, awaitPromise: true,
    }, sessionId);
    const problems = result.exceptionDetails
        ? ["browser check threw: " + (result.exceptionDetails.exception?.description || result.exceptionDetails.text)]
        : Array.isArray(result.result.value) ? result.result.value : ["browser check returned no result"];
    if (problems.length) {
        failures += problems.length;
        console.log(`\n${page}`);
        problems.forEach((problem) => console.log(`  FAIL ${problem}`));
    }
}

chrome.kill();
ws.close();
console.log(`\n${pages.length} integrated lessons checked; ${failures} problems.`);
process.exitCode = failures ? 1 : 0;
