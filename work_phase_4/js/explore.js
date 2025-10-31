import { initNavBar } from "./modules/nav_bar.js";

/**
 * CONSTANTS
 * Define values that don't change e.g. page titles, URLs, etc.
 */

/**
 * VARIABLES
 * Define values that will change e.g. user inputs, counters, etc.
 */

/**
 * FUNCTIONS
 * Group code into functions to make it reusable
 */

// Header profile shrink on scroll
window.addEventListener("scroll", () => {
    const profile = document.querySelector(".user-profile");
    if (!profile) return;

    if (window.scrollY > 10) {
        profile.classList.add("scrolled");
    } else {
        profile.classList.remove("scrolled");
    }
});

/**
 * EVENT LISTENERS
 * The code that runs when a user interacts with the page
 */

// When the page fully loads
document.addEventListener("DOMContentLoaded", async () => {
    initNavBar();
});
