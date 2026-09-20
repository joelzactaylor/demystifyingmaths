// The start button scrolls the two route links into the middle of the window
// rather than leaving the page. Without JS the href still jumps to them.
document.addEventListener("DOMContentLoaded", () => {
    const button = document.querySelector(".home-start");
    const target = document.getElementById("home-links");
    if (!button || !target) return;

    button.addEventListener("click", (event) => {
        event.preventDefault();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({
            behavior: reduce ? "auto" : "smooth",
            block: "center"
        });
    });
});
