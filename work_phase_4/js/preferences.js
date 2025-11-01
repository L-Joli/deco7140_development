import { initNavBar } from "./modules/nav_bar.js";

const preferencesForm = document.getElementById("preferences-form");
const cancelSubscriptionBtn = document.getElementById("cancel-subscription");
const formFeedback = document.getElementById("form-feedback");
const subscriptionStatus = document.getElementById("subscription-status");

function loadPreferences() {
    const savedName = localStorage.getItem("userName");
    const savedEmail = localStorage.getItem("userEmail");
    const savedGitHub = localStorage.getItem("userGitHub");
    const savedBio = localStorage.getItem("userBio");
    const isSubscribed = localStorage.getItem("isSubscribed") !== "false";

    if (savedName) document.getElementById("name").value = savedName;
    if (savedEmail) document.getElementById("email").value = savedEmail;
    if (savedGitHub) document.getElementById("github").value = savedGitHub;
    if (savedBio) document.getElementById("bio").value = savedBio;

    updateSubscriptionUI(isSubscribed);
}

function updateSubscriptionUI(isSubscribed) {
    if (isSubscribed) {
        subscriptionStatus.textContent = "You've subscribed";
        cancelSubscriptionBtn.textContent = "Cancel Subscription";
    } else {
        subscriptionStatus.textContent = "You're not subscribed";
        cancelSubscriptionBtn.textContent = "Subscribe";
    }
}

function showFeedback(message, type = "success") {
    formFeedback.textContent = message;
    formFeedback.className = `form-feedback ${type}`;

    formFeedback.setAttribute("role", "status");
    formFeedback.setAttribute(
        "aria-live",
        type === "error" ? "assertive" : "polite"
    );

    if (type === "error") {
        formFeedback.focus();
    }

    setTimeout(() => {
        formFeedback.textContent = "";
        formFeedback.className = "form-feedback";
    }, 5000);
}

function clearError(input) {
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
    const errorMsg = input.parentElement.querySelector(".error-message");
    if (errorMsg) {
        errorMsg.remove();
    }
}

function setError(input, message) {
    input.setAttribute("aria-invalid", "true");

    let errorMsg = input.parentElement.querySelector(".error-message");
    if (!errorMsg) {
        errorMsg = document.createElement("span");
        errorMsg.className = "error-message";
        errorMsg.id = `${input.id}-error`;
        input.parentElement.appendChild(errorMsg);
    }
    errorMsg.textContent = message;
    input.setAttribute("aria-describedby", errorMsg.id);
}

preferencesForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputs = preferencesForm.querySelectorAll("input, textarea");
    inputs.forEach((input) => clearError(input));

    const formData = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        github: document.getElementById("github").value.trim(),
        bio: document.getElementById("bio").value.trim(),
    };

    let hasErrors = false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailInput = document.getElementById("email");

    if (!formData.email) {
        setError(emailInput, "Email is required");
        hasErrors = true;
    } else if (!emailRegex.test(formData.email)) {
        setError(emailInput, "Please enter a valid email address");
        hasErrors = true;
    }

    const bioInput = document.getElementById("bio");
    if (formData.bio.length > 500) {
        setError(bioInput, "Bio must be 500 characters or less");
        hasErrors = true;
    }

    if (hasErrors) {
        showFeedback("Please correct the errors in the form", "error");
        const firstInvalid = preferencesForm.querySelector(
            '[aria-invalid="true"]'
        );
        if (firstInvalid) {
            firstInvalid.focus();
        }
        return;
    }

    try {
        localStorage.setItem("userName", formData.name);
        localStorage.setItem("userEmail", formData.email);
        localStorage.setItem("userGitHub", formData.github);
        localStorage.setItem("userBio", formData.bio);

        showFeedback("Preferences updated successfully!", "success");
    } catch (error) {
        console.error("Error saving preferences:", error);
        showFeedback(
            "Failed to update preferences. Please try again.",
            "error"
        );
    }
});

cancelSubscriptionBtn.addEventListener("click", () => {
    const currentStatus = localStorage.getItem("isSubscribed") !== "false";
    const newStatus = !currentStatus;

    localStorage.setItem("isSubscribed", newStatus);
    updateSubscriptionUI(newStatus);

    if (newStatus) {
        showFeedback("Successfully subscribed to newsletter!", "success");
    } else {
        showFeedback("Successfully unsubscribed from newsletter.", "success");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    initNavBar();
    loadPreferences();
});

window.addEventListener("scroll", () => {
    const profile = document.querySelector(".user-profile");
    if (!profile) return;

    if (window.scrollY > 10) {
        profile.classList.add("scrolled");
    } else {
        profile.classList.remove("scrolled");
    }
});

let saveTimer;
const autoSaveFields = ["name", "email", "github", "bio"];

autoSaveFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    field.addEventListener("input", () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            const key = `user${
                fieldId.charAt(0).toUpperCase() + fieldId.slice(1)
            }`;
            localStorage.setItem(key, field.value);
        }, 1000);
    });
});
