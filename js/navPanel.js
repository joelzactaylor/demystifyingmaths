document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("page-nav-container");
    if (!container) return;

    let headings = [...document.querySelectorAll("main h1")];

    // Menu pages carry a single <h1> and group their cards under <h2>s. Without
    // this they would hide the panel on exactly the pages long enough to need it.
    // Pages with two or more <h1> in <main> are untouched, and so are the pages
    // with one <h1> and no <h2>, which still hide the panel as before.
    if (headings.length < 2 && document.querySelector("main")) {
        const groupHeadings = [...document.querySelectorAll("main h2")];
        if (groupHeadings.length >= 2) {
            headings = groupHeadings;
        }
    }

    // The extracurricular pages predate the <main> wrapper and have no element to
    // scope to, so they fall back to every <h1> on the page.
    if (headings.length === 0) {
        headings = [...document.querySelectorAll("h1")];
    }

    if (headings.length < 2) {
        container.style.display = "none";
        return;
    }

    const makeId = (text) =>
        text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");

    headings.forEach((heading, index) => {
        if (!heading.id) {
            let baseId = makeId(heading.textContent || `section-${index + 1}`);
            let uniqueId = baseId;
            let counter = 2;

            while (document.getElementById(uniqueId)) {
                uniqueId = `${baseId}-${counter}`;
                counter++;
            }

            heading.id = uniqueId;
        }
    });

    const nav = document.createElement("nav");
    nav.className = "page-nav";
    nav.setAttribute("aria-label", "Page sections");

    const title = document.createElement("h2");
    title.className = "page-nav-title";
    title.textContent = "On this page";

    const list = document.createElement("ul");
    list.className = "page-nav-list";

    headings.forEach((heading) => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent.trim();
        link.className = "page-nav-link";

        link.addEventListener("click", (event) => {
            event.preventDefault();
            const topOffset = 110; // adjust for ribbon / header height
            const y = heading.getBoundingClientRect().top + window.scrollY - topOffset;

            window.scrollTo({
                top: y,
                behavior: "smooth"
            });
            history.replaceState(null, "", `#${heading.id}`);
        });

        li.appendChild(link);
        list.appendChild(li);
    });

    nav.appendChild(title);
    nav.appendChild(list);
    container.appendChild(nav);

    const links = [...nav.querySelectorAll(".page-nav-link")];

    const setActiveLink = () => {
        let current = headings[0];

        headings.forEach((heading) => {
            const rect = heading.getBoundingClientRect();
            if (rect.top <= 140) {
                current = heading;
            }
        });

        links.forEach((link) => {
            link.classList.toggle(
                "active",
                link.getAttribute("href") === `#${current.id}`
            );
        });
    };

    setActiveLink();
    window.addEventListener("scroll", setActiveLink, { passive: true });
});