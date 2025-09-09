// modules/menu.js
export function setupMenu() {
    const toggleBtn = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".menu");

    // Initialize ARIA attributes
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("aria-controls", "menu"); // ID reference for screen readers
    menu.setAttribute("aria-hidden", "true"); // TODO: remove in desktop mode
    menu.id = "menu"; // Make sure menu has an ID

    toggleBtn.addEventListener("click", () => {
        const isOpen = menu.classList.toggle("open");
        toggleBtn.setAttribute("aria-expanded", isOpen);
        menu.setAttribute("aria-hidden", !isOpen);
    });
}
