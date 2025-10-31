import { initNavBar } from "./modules/nav_bar.js";
import { getEvents } from "./modules/event/getEvents.js";

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

window.addEventListener("scroll", () => {
    const profile = document.querySelector(".user-profile");
    if (!profile) return;

    if (window.scrollY > 10) {
        profile.classList.add("scrolled");
    } else {
        profile.classList.remove("scrolled");
    }
});

const formatDate = (iso) =>
    new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });

const makeMessage = (cls, title, body, ariaRole, live) => {
    const box = document.createElement("div");
    box.className = cls;
    box.setAttribute("role", ariaRole);
    box.setAttribute("aria-live", live);
    box.innerHTML = `<p><strong>${title}</strong></p><p>${body}</p>`;
    return box;
};

const makeCard = (item) => {
    const card = document.createElement("article");
    card.className = "news-card";
    card.setAttribute("tabindex", "0");

    const imageUrl = item.genericevent_photo || "images/placeholder.jpg";
    const formattedDate = item.date_time ? formatDate(item.date_time) : "";

    card.innerHTML = `
    <img src="${imageUrl}" alt="${
        item.event_name || "Event image"
    }" class="news-image" />
    <div class="news-overlay">
      <span class="news-category">${item.event_type || "Update"}</span>
      <h2 class="news-title">${item.event_name || "Untitled"}</h2>
      <span class="news-author">${
          item.organiser || "—"
      } · ${formattedDate}</span>
    </div>
  `;
    return card;
};

const renderList = (items, container, emptyTitle, emptyBody) => {
    if (!container) return;
    container.innerHTML = ""; // Clear existing content

    if (!items || items.length === 0) {
        container.appendChild(
            makeMessage("news-empty", emptyTitle, emptyBody, "status", "polite")
        );
        return;
    }

    items.forEach((it) => container.appendChild(makeCard(it)));
};

const buildSkeletonCard = () => {
    const card = document.createElement("article");
    card.className = "news-card skeleton-card";
    card.setAttribute("aria-hidden", "true");
    card.innerHTML = `
    <div class="skeleton-img"></div>
    <div class="news-overlay">
      <span class="skeleton-badge"></span>
      <div class="skeleton-line w-80"></div>
      <div class="skeleton-line w-60"></div>
      <div class="skeleton-line w-40"></div>
    </div>
  `;
    return card;
};

const startLoading = (container, count = 4) => {
    if (!container) return;
    container.setAttribute("aria-busy", "true"); // a11y: mark region busy
    container.setAttribute("aria-live", "polite");
    container.innerHTML = "";
    for (let i = 0; i < count; i++) container.appendChild(buildSkeletonCard());
};

const stopLoading = (container) => {
    if (!container) return;
    container.removeAttribute("aria-busy");
    // renderList() will clear content on success; in error paths, clear skeletons explicitly
    container.querySelectorAll(".skeleton-card").forEach((el) => el.remove());
};

export const initNews = async () => {
    const newsContainer = document.getElementById("news-container");
    startLoading(newsContainer, 4);

    try {
        const data = await getEvents();
        const news = data
            .filter((e) => e.event_type === "News")
            .sort((a, b) => new Date(b.date_time) - new Date(a.date_time));

        stopLoading(newsContainer);
        renderList(
            news,
            newsContainer,
            "No news yet.",
            "Check back soon for the latest updates."
        );
    } catch (err) {
        console.error("News load error:", err);
        stopLoading(newsContainer);
        newsContainer?.appendChild(
            makeMessage(
                "news-error",
                "Sorry! We couldn’t load the latest news.",
                "Please try again later or check your connection.",
                "alert",
                "assertive"
            )
        );
    }
};

export const initEvents = async () => {
    const eventsContainer = document.getElementById("events-container");
    startLoading(eventsContainer, 4);

    try {
        const data = await getEvents();
        const events = data
            .filter((e) => e.event_type === "Event")
            .sort((a, b) => new Date(b.date_time) - new Date(a.date_time));

        stopLoading(eventsContainer);
        renderList(
            events,
            eventsContainer,
            "No upcoming events.",
            "Check back soon to see what’s next."
        );
    } catch (err) {
        console.error("Events load error:", err);
        stopLoading(eventsContainer);
        eventsContainer?.appendChild(
            makeMessage(
                "news-error",
                "Sorry! We couldn’t load the upcoming events.",
                "Please try again later or check your connection.",
                "alert",
                "assertive"
            )
        );
    }
};

/**
 * EVENT LISTENERS
 * The code that runs when a user interacts with the page
 */
document.addEventListener("DOMContentLoaded", async () => {
    initNavBar();
    initNews();
    initEvents();
});
