/* Local drafts and diagram settings, separate from accepted answers.
   Loaded before the page's diagrams so restored controls initialise normally. */
(() => {
    "use strict";
    const main = document.querySelector("main.lesson-main");
    if (!main) return;
    const storageKey = "dm-lesson-session-v1:" + location.pathname;
    const object = value => value && typeof value === "object" && !Array.isArray(value);
    let state = {drafts: {}, diagrams: {}, controls: {}, started: false};
    try {
        const saved = JSON.parse(localStorage.getItem(storageKey));
        if (object(saved)) {
            for (const field of ["drafts", "diagrams", "controls"]) if (object(saved[field])) state[field] = saved[field];
            state.started = saved.started === true;
        }
    } catch (_) { /* Storage is optional. */ }
    let resetting = false;
    const save = () => {
        if (resetting) return;
        try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (_) {}
    };
    window.LessonSession = {
        bindDraft(input, key) {
            if (typeof state.drafts[key] === "string") input.value = state.drafts[key];
            const remember = () => {
                if (input.readOnly) return;
                if (input.value) state.drafts[key] = input.value;
                else delete state.drafts[key];
                state.started = true;
                save();
            };
            input.addEventListener("input", remember);
            input.addEventListener("compositionend", remember);
        },
        forgetDraft(key) { delete state.drafts[key]; state.started = true; save(); },
        diagram(key) { return state.diagrams[key]; },
        hasControl(control) { return Object.hasOwn(state.controls, control.id); },
        saveDiagram(key, value) { state.diagrams[key] = value; state.started = true; save(); }
    };

    // These are the authored diagram controls, before question inputs mount.
    // Restore the whole group before any calculation runs (important for radios
    // and explorers with one calculated, disabled select).
    const controls = [...main.querySelectorAll("input, select")].filter(x =>
        !x.closest("[data-lesson-check], .powers-recall"));
    controls.forEach((control, i) => {
        const key = control.id || "control-" + i;
        const value = state.controls[key];
        if (control.type === "radio" || control.type === "checkbox") {
            if (typeof value === "boolean") control.checked = value;
        } else if (typeof value === "string") {
            if (control.tagName !== "SELECT" || [...control.options].some(x => x.value === value)) control.value = value;
        }
    });
    const rememberControls = event => {
        if (!controls.includes(event.target)) return;
        controls.forEach((control, i) => {
            state.controls[control.id || "control-" + i] =
                control.type === "radio" || control.type === "checkbox" ? control.checked : control.value;
        });
        state.started = true;
        save();
    };
    document.addEventListener("input", rememberControls);
    document.addEventListener("change", rememberControls);
    const rememberExploration = event => {
        if (event.target.closest?.(".cube-toggle, .mirror__action, .mirror__axis")) {
            state.started = true;
            save();
        }
    };
    document.addEventListener("click", rememberExploration);
    document.addEventListener("keydown", rememberExploration);
    document.addEventListener("pointerup", rememberExploration);

    // Intercept before document-level progress/recall reset listeners. Cancel
    // must leave every store intact, not merely prevent the eventual reload.
    window.addEventListener("click", event => {
        if (!event.target.closest?.(".roots-reset")) return;
        if (!window.confirm("Reset this lesson? This clears its answers and diagram settings. Other lessons will stay unchanged.")) {
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
        }
        resetting = true;
        try { localStorage.removeItem(storageKey); } catch (_) {}
    }, true);

    window.addEventListener("load", () => {
        if (new URLSearchParams(location.search).get("resume") !== "1" || location.hash) return;
        requestAnimationFrame(() => {
            const turn = main.querySelector(".lesson-check__turn:not(.is-correct)") ||
                [...main.querySelectorAll(".recall-question")].find(x => !x.querySelector(".roots-accepted-answer"));
            if (!turn) return;
            const section = turn.closest("section");
            const heading = section?.querySelector("h1[id], h2[id]");
            if (heading) {
                history.replaceState(null, "", location.pathname + location.search + "#" + heading.id);
                window.dispatchEvent(new HashChangeEvent("hashchange"));
            }
            requestAnimationFrame(() => {
                const field = turn.querySelector('input:not([hidden]), button[data-symbol]:not([hidden])');
                field?.focus({preventScroll: true});
                const gapTop = scrollY + turn.getBoundingClientRect().top;
                const sectionTop = section ? scrollY + section.getBoundingClientRect().top - 100 : 0;
                window.scrollTo({top: Math.max(0, sectionTop, gapTop - innerHeight * .55), behavior: "instant"});
            });
        });
    }, {once: true});
})();
