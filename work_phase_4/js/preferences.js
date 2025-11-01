import { initNavBar } from "./modules/nav_bar.js";
import { getUser } from "./modules/user_info/getUser.js";

const preferencesForm = document.getElementById("preferences-form");
const cancelSubscriptionBtn = document.getElementById("cancel-subscription");
const userFormFeedback = document.getElementById("user-form-feedback");
const newsletterFeedback = document.getElementById("newsletter-form-feedback");
const subscriptionStatus = document.getElementById("subscription-status");
const updateBtn = preferencesForm.querySelector('button[type="submit"]');

let originalData = {};
let userHasChanged = false;

function toggleUpdateButton() {
    updateBtn.disabled = !userHasChanged;
    updateBtn.classList.toggle("is-disabled", !userHasChanged);
}

function setLoadingState(isLoading) {
    if (isLoading) {
        preferencesForm.classList.add("loading");
        preferencesForm.setAttribute("aria-busy", "true");
        Array.from(preferencesForm.elements).forEach(
            (el) => (el.disabled = true)
        );
    } else {
        preferencesForm.classList.remove("loading");
        preferencesForm.removeAttribute("aria-busy");
        Array.from(preferencesForm.elements).forEach((el) => {
            if (el.id === "email") {
                el.disabled = true;
            } else {
                el.disabled = false;
            }
        });
        toggleUpdateButton();
    }
}

function loadUserData(user) {
    if (!user) return;

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const githubInput = document.getElementById("github");
    const bioInput = document.getElementById("bio");

    nameInput.value = user.name || "";
    emailInput.value = user.email || "";
    githubInput.value = user.email || "";
    bioInput.value = user.message || "";

    emailInput.disabled = true;
    emailInput.title = "You cannot edit your email address.";

    originalData = {
        name: nameInput.value,
        email: emailInput.value,
        github: githubInput.value,
        bio: bioInput.value,
    };
}

function detectChanges() {
    const current = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        github: document.getElementById("github").value.trim(),
        bio: document.getElementById("bio").value.trim(),
    };
    userHasChanged = JSON.stringify(current) !== JSON.stringify(originalData);
    toggleUpdateButton();
}

// 🔸 Feedback helper
function showFeedback(container, message, type = "success") {
    container.textContent = message;
    container.className = `form-feedback ${type}`;
    container.setAttribute("role", "status");
    container.setAttribute(
        "aria-live",
        type === "error" ? "assertive" : "polite"
    );

    if (type !== "loading") {
        setTimeout(() => {
            container.textContent = "";
            container.className = "form-feedback";
        }, 5000);
    }
}

const DEFAULT_SUBSCRIBED = true;

function getIsSubscribed() {
    return localStorage.getItem("isSubscribed") === "true";
}

function setIsSubscribed(val) {
    localStorage.setItem("isSubscribed", String(val));
}

function updateSubscriptionUI(isSubscribed) {
    subscriptionStatus.textContent = isSubscribed
        ? "You are subscribed to the newsletter."
        : "You are not subscribed to the newsletter.";
    cancelSubscriptionBtn.textContent = isSubscribed
        ? "Cancel Subscription"
        : "Subscribe";

    cancelSubscriptionBtn.classList.remove("btn-primary", "btn-outline-gray");

    cancelSubscriptionBtn.classList.add(
        isSubscribed ? "btn-outline-gray" : "btn-primary"
    );
}

function initSubscriptionUI() {
    const stored = localStorage.getItem("isSubscribed");
    const isSubscribed =
        stored === null ? DEFAULT_SUBSCRIBED : stored === "true";
    setIsSubscribed(isSubscribed);
    updateSubscriptionUI(isSubscribed);
}

preferencesForm.addEventListener("input", detectChanges);

preferencesForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const bioInput = document.getElementById("bio");
    if (bioInput.value.length > 500) {
        showFeedback(
            userFormFeedback,
            "Bio must be 500 characters or less.",
            "error"
        );
        bioInput.focus();
        return;
    }

    originalData = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        github: document.getElementById("github").value.trim(),
        bio: document.getElementById("bio").value.trim(),
    };

    userHasChanged = false;
    toggleUpdateButton();

    showFeedback(
        userFormFeedback,
        "Personal information updated successfully!",
        "success"
    );
});

cancelSubscriptionBtn.addEventListener("click", () => {
    const newStatus = !getIsSubscribed();
    setIsSubscribed(newStatus);
    updateSubscriptionUI(newStatus);

    showFeedback(
        newsletterFeedback,
        newStatus
            ? "Successfully subscribed to the newsletter."
            : "Successfully unsubscribed from the newsletter.",
        "success"
    );
});

async function initPreferences() {
    initNavBar();
    toggleUpdateButton();
    setLoadingState(true);

    try {
        const user = await getUser();
        if (!user) throw new Error("No user data found");
        loadUserData(user);
    } catch (err) {
        console.error(err);
        showFeedback(
            userFormFeedback,
            "Failed to load personal information.",
            "error"
        );
    } finally {
        setLoadingState(false);
        userFormFeedback.textContent = "";
        userFormFeedback.className = "form-feedback";
    }

    initSubscriptionUI();
}

document.addEventListener("DOMContentLoaded", initPreferences);
