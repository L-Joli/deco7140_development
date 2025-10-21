import { initNavBar } from "./modules/nav_bar.js";
import { getEvents } from "./modules/event/getEvents.js";
/**
 * CONSTANTS
 * Define values that don't change e.g. page titles, URLs, etc.
 * */

/**
 * VARIABLES
 * Define values that will change e.g. user inputs, counters, etc.
 * */

/**
 * FUNCTIONS
 * Group code into functions to make it reusable
 * */
const initNews = async () => {
    const newsContainer = document.getElementById("news-container");

    try {
        const events = await getEvents();
        console.log(events, "EVENT");

        if (!events || events.length === 0) {
            const message = document.createElement("div");
            message.className = "news-empty";
            message.setAttribute("role", "status");
            message.setAttribute("aria-live", "polite");
            message.innerHTML = `
            <p><strong>No news yet.</strong></p>
            <p>Check back soon for the latest updates.</p>
        `;
            newsContainer.appendChild(message);
            return;
        }

        events.forEach((event) => {
            const card = document.createElement("article");
            card.className = "news-card";
            card.setAttribute("tabindex", "0");

            const imageUrl =
                event.genericevent_photo || "images/placeholder.jpg";

            const date = new Date(event.date_time);
            const formattedDate = date.toLocaleString("en-AU", {
                dateStyle: "medium",
                timeStyle: "short",
            });

            card.innerHTML = `
                <img
                    src="${imageUrl}"
                    alt="${event.event_name || "Event image"}"
                    class="news-image"
                />
                <div class="news-overlay">
                    <span class="news-category">${event.event_type}</span>
                    <h2 class="news-title">${event.event_name}</h2>
                    <span class="news-author">${
                        event.organiser
                    } · ${formattedDate}</span>
                </div>
            `;

            newsContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading events:", error);

        const errorMsg = document.createElement("div");
        errorMsg.className = "news-error";
        errorMsg.setAttribute("role", "alert");
        errorMsg.setAttribute("aria-live", "assertive");
        errorMsg.innerHTML = `
            <p><strong>Sorry!</strong> We couldn’t load the latest news.</p>
            <p>Please try again later or check your connection.</p>
        `;
        newsContainer.appendChild(errorMsg);
    }
};
/**
 * EVENT LISTENERS
 * The code that runs when a user interacts with the page
 * */
// when the page fully loads
document.addEventListener("DOMContentLoaded", async () => {
    initNavBar();
    initNews();
});
