const initNavBar = () => {
    const navToggle = document.getElementById("navToggle");
    const mobileNav = document.getElementById("mobileNav");

    if (!navToggle || !mobileNav) return;

    function toggleMenu() {
        const isOpen = navToggle.getAttribute("aria-expanded") === "true";
        navToggle.setAttribute("aria-expanded", String(!isOpen));
        navToggle.setAttribute(
            "aria-label",
            isOpen ? "Open menu" : "Close menu"
        );
        mobileNav.hidden = isOpen;
    }

    navToggle.addEventListener("click", toggleMenu);

    navToggle.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleMenu();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (
            e.key === "Escape" &&
            navToggle.getAttribute("aria-expanded") === "true"
        ) {
            toggleMenu();
        }
    });
}

export { initNavBar };
