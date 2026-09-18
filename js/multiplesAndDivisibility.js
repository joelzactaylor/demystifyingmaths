/* Multiples and the divisibility tests: the live tester.

   The six syllabus tests run on a number of the reader's own. Every row is
   built in the markup with 4,932 already answered, so a page without scripts
   shows one true state; the script only rewrites the text in place, and never
   rebuilds the list under the cursor. */

document.addEventListener("DOMContentLoaded", () => {
    const createTester = (root) => {
        const input = root.querySelector("[data-tester-input]");
        const list = root.querySelector("[data-tester-list]");
        const empty = root.querySelector("[data-tester-empty]");
        const summary = root.querySelector("[data-tester-summary]");
        if (!input || !list) return;
        const rows = Array.from(list.querySelectorAll("[data-test]"));
        const fmt = (n) => n.toLocaleString("en-GB");
        const digitSum = (digits) => digits.split("").reduce((a, d) => a + Number(d), 0);
        const sumText = (digits) => `${digits.split("").join(" + ")} = ${digitSum(digits)}`;

        /* What each test reads off the digits, in the words the cards use. */
        const evidence = {
            2: (d) => `The last digit is ${d.slice(-1)}.`,
            5: (d) => `The last digit is ${d.slice(-1)}.`,
            10: (d) => `The last digit is ${d.slice(-1)}.`,
            4: (d) => `The last two digits make ${d.slice(-2)}.`,
            3: (d) => `The digits add to ${sumText(d)}.`,
            9: (d) => `The digits add to ${sumText(d)}.`
        };

        const show = (digits) => {
            const n = Number(digits);
            const yes = [], no = [];
            rows.forEach((row) => {
                const by = Number(row.dataset.test);
                const q = Math.floor(n / by), r = n % by;
                row.querySelector("[data-evidence]").textContent = evidence[by](digits);
                const verdict = row.querySelector("[data-verdict]");
                verdict.textContent = r ? `No: ${fmt(n)} ÷ ${by} = ${fmt(q)} r ${r}` : `Yes: ${fmt(n)} ÷ ${by} = ${fmt(q)}`;
                row.classList.toggle("is-yes", !r);
                row.classList.toggle("is-no", !!r);
                (r ? no : yes).push(by);
            });
            const join = (xs, word) => xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} ${word} ${xs[xs.length - 1]}`;
            const asc = (xs) => xs.slice().sort((x, y) => x - y);
            let text = `${fmt(n)} is a multiple of ${join(asc(yes), "and")}`;
            if (!yes.length) text = `${fmt(n)} is a multiple of none of the six`;
            if (no.length && yes.length) text += `, and not of ${join(asc(no), "or")}`;
            if (summary) summary.textContent = `${text}.`;
        };

        const valid = (digits) => digits.length >= 3 && digits.length <= 4;

        const update = () => {
            /* Digits only, no leading zero, and the caret kept where it was
               relative to the digits that survive. */
            const raw = input.value;
            const caret = input.selectionStart;
            let cleaned = raw.replace(/\D/g, "").replace(/^0+/, "");
            if (cleaned !== raw) {
                const before = raw.slice(0, caret).replace(/\D/g, "").replace(/^0+/, "").length;
                input.value = cleaned;
                input.setSelectionRange(before, before);
            }
            const ok = valid(cleaned);
            list.classList.toggle("is-hidden", !ok);
            if (summary) summary.classList.toggle("is-hidden", !ok);
            if (empty) empty.hidden = ok;
            input.setAttribute("aria-invalid", ok ? "false" : "true");
            if (ok) show(cleaned);
        };

        input.addEventListener("input", update);
        update();
    };

    document.querySelectorAll("[data-tester]").forEach(createTester);
});
