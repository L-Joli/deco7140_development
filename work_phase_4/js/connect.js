import { initNavBar } from "./modules/nav_bar.js";
import { getUsers } from "./modules/connect/getUsers.js";
import { getChatMessages } from "./modules/connect/getChatMessages.js";
import { postChatMessage as postChatMessageAPI } from "./modules/connect/postChatMessages.js";
import { getUser } from "./modules/user_info/getUser.js";

const STORAGE_KEYS = {
    CONNECTIONS: "connect_connections",
};

let ALL_CHAT_POSTS = [];
let ALL_PEOPLE = [];

let CURRENT_USER = "";

const normalizeUser = (user) => {
    return {
        id: `person-${user.id}`,
        user_id: user.id,
        name: user.user_name,
        title: user.custom_field_longtext_1 || "Climbing Enthusiast",
        location: user.custom_field_longtext_2 || "",
        mutualConnections: `${user.experience_level} • ${
            user.custom_field_1 || "Climber"
        }`,
        avatar: user.profile_photo || "assets/user_default_icon.png",
        email: user.email,
    };
};

const getChatHistoryForPerson = (userName) => {
    return ALL_CHAT_POSTS.filter((post) => {
        if (post.person_name === userName) return true;
        if (
            post.person_name === CURRENT_USER &&
            post.chat_post_title &&
            post.chat_post_title.includes(userName)
        )
            return true;
        return false;
    }).sort((a, b) => new Date(a.chat_date_time) - new Date(b.chat_date_time));
};

const fetchUsers = async () => {
    try {
        const data = await getUsers();

        if (!data) {
            throw new Error("No data returned from server.");
        }

        return data;
    } catch (error) {
        console.error("Error fetching users:", error);
        return null;
    }
};

const fetchChatPosts = async () => {
    try {
        const data = await getChatMessages();

        if (!data) {
            throw new Error("No data returned from server.");
        }

        return data;
    } catch (error) {
        console.error("Error fetching chat posts:", error);
        return null;
    }
};

const postChatMessage = async (personName, title, content) => {
    try {
        const tempForm = document.createElement("form");

        const personNameInput = document.createElement("input");
        personNameInput.type = "hidden";
        personNameInput.name = "person-name";
        personNameInput.value = CURRENT_USER;
        tempForm.appendChild(personNameInput);

        const titleInput = document.createElement("input");
        titleInput.type = "hidden";
        titleInput.name = "chat-post-title";
        titleInput.value = title;
        tempForm.appendChild(titleInput);

        const contentInput = document.createElement("input");
        contentInput.type = "hidden";
        contentInput.name = "chat-post-content";
        contentInput.value = content;
        tempForm.appendChild(contentInput);

        const dateTimeInput = document.createElement("input");
        dateTimeInput.type = "hidden";
        dateTimeInput.name = "chat-date-time";
        dateTimeInput.value = new Date()
            .toISOString()
            .slice(0, 16)
            .replace("T", " ");
        tempForm.appendChild(dateTimeInput);

        const websiteCodeInput = document.createElement("input");
        websiteCodeInput.type = "hidden";
        websiteCodeInput.name = "website-code";
        websiteCodeInput.value = "abc123";
        tempForm.appendChild(websiteCodeInput);

        const result = await postChatMessageAPI(tempForm);

        if (result) {
            console.log("Posted message:", result);
            return result;
        }

        return null;
    } catch (error) {
        console.error("Error posting chat message:", error);
        return null;
    }
};

let state = {
    q: "",
};

let currentChatPerson = null;

const el = (sel) => document.querySelector(sel);
const make = (tag, cls) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
};
const getStore = (k) => JSON.parse(localStorage.getItem(k) || "{}");
const setStore = (k, v) => localStorage.setItem(k, JSON.stringify(v));

window.addEventListener("scroll", () => {
    const profile = document.querySelector(".user-profile");
    if (!profile) return;
    profile.classList.toggle("scrolled", window.scrollY > 10);
});

const renderLoading = (container, text = "Loading…") => {
    if (!container) return;
    container.setAttribute("aria-busy", "true");
    container.innerHTML = "";
    const box = make("div", "empty");
    box.textContent = text;
    container.appendChild(box);
};

const renderEmpty = (container, msg) => {
    if (!container) return;
    container.removeAttribute("aria-busy");
    container.innerHTML = "";
    const box = make("div", "empty");
    box.textContent = msg;
    container.appendChild(box);
};

const buildPersonCard = (person) => {
    const connections = getStore(STORAGE_KEYS.CONNECTIONS);
    const isConnected = !!connections[person.id];

    const card = make("article", "info-card person-card");

    const mutualInfo = person.mutualConnections
        ? `<p class="person-mutual">
            <i class="fa-solid fa-user-group"></i>
            <span>${person.mutualConnections}</span>
        </p>`
        : "";

    card.innerHTML = `
        <img src="${person.avatar}" alt="${
        person.name
    }'s avatar" class="person-avatar" />
        <div class="person-info">
            <h3 class="person-name">
                ${person.name}
            </h3>
            <p class="person-title">${person.title}</p>
            ${
                person.location
                    ? `<p class="person-location">${person.location}</p>`
                    : ""
            }
            ${mutualInfo}
        </div>
        <div class="person-actions">
            ${
                isConnected
                    ? `<button class="btn btn-primary message-btn" data-id="${person.id}" aria-label="Message ${person.name}">
                        Message
                    </button>`
                    : `<button class="btn btn-secondary connect-btn" data-id="${person.id}" aria-label="Connect with ${person.name}">
                        Connect
                    </button>`
            }
        </div>
    `;

    const connectBtn = card.querySelector(".connect-btn");
    const messageBtn = card.querySelector(".message-btn");

    if (connectBtn) {
        connectBtn.addEventListener("click", () => {
            openConnectModal(person);
        });
    }

    if (messageBtn) {
        messageBtn.addEventListener("click", () => {
            openChatModal(person);
        });
    }

    return card;
};

const renderGrid = (container, items) => {
    container.removeAttribute("aria-busy");
    container.innerHTML = "";
    if (!items.length) {
        return renderEmpty(container, "No people found matching your search.");
    }
    items.forEach((p) => container.appendChild(buildPersonCard(p)));
};

const applyFilters = (data) => {
    return data.filter((p) => {
        if (state.q) {
            const query = state.q.toLowerCase();
            return (
                p.name.toLowerCase().includes(query) ||
                p.title.toLowerCase().includes(query) ||
                (p.location && p.location.toLowerCase().includes(query))
            );
        }
        return true;
    });
};

const applyAndRender = () => {
    const filtered = applyFilters(ALL_PEOPLE);
    renderGrid(el("#people-container"), filtered);
};

const initControls = () => {
    el("#search-input").addEventListener("input", (e) => {
        state.q = e.target.value.trim();
        applyAndRender();
    });
};

const connectModal = el("#connect-modal");
const connectForm = el("#connect-form");
const closeConnectModal = el("#close-connect-modal");
let currentConnectPerson = null;

const openConnectModal = (person) => {
    currentConnectPerson = person;
    el("#connect-person-name").textContent = `Connect with ${person.name}`;
    el(
        "#connect-note"
    ).placeholder = `Hi ${person.name}, I'd like to connect with you...`;
    connectModal.hidden = false;
    document.body.style.overflow = "hidden";
    el("#connect-note").focus();
};

const closeConnect = () => {
    connectModal.hidden = true;
    document.body.style.overflow = "";
    connectForm.reset();
    currentConnectPerson = null;
};

closeConnectModal.addEventListener("click", closeConnect);

connectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentConnectPerson) return;

    const data = Object.fromEntries(new FormData(connectForm));
    console.log("Connection request:", data);

    const connections = getStore(STORAGE_KEYS.CONNECTIONS);
    connections[currentConnectPerson.id] = {
        connectedAt: new Date().toISOString(),
        note: data.connectNote,
    };
    setStore(STORAGE_KEYS.CONNECTIONS, connections);

    alert(`Connection request sent to ${currentConnectPerson.name}!`);
    closeConnect();
    applyAndRender();
});

const chatModal = el("#chat-modal");
const chatForm = el("#chat-form");
const chatInput = el("#chat-input");
const chatMessages = el("#chat-messages");
const closeChatModal = el("#close-chat-modal");

const openChatModal = (person) => {
    currentChatPerson = person;
    el("#chat-title").textContent = person.name;
    el("#chat-person-avatar").src = person.avatar;
    el("#chat-person-avatar").alt = `${person.name}'s avatar`;

    const dateDiv = chatMessages.querySelector(".chat-date-divider");
    chatMessages.innerHTML = "";
    chatMessages.appendChild(dateDiv);

    const history = getChatHistoryForPerson(person.name);

    if (history && history.length > 0) {
        history.forEach((post) => {
            const isSent = post.person_name === CURRENT_USER;
            const timeStr = formatChatTime(post.chat_date_time);
            addMessage(
                post.chat_post_content,
                isSent,
                timeStr,
                isSent ? null : person.avatar
            );
        });
    } else {
        addMessage(
            `Hi! Thanks for connecting with me.`,
            false,
            null,
            person.avatar
        );
    }

    chatModal.hidden = false;
    document.body.style.overflow = "hidden";
    chatInput.focus();
};

const closeChat = () => {
    chatModal.hidden = true;
    document.body.style.overflow = "";
    chatForm.reset();
    currentChatPerson = null;
};

closeChatModal.addEventListener("click", closeChat);

const formatChatTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });
};

const addMessage = (text, isSent = false, time = null, avatar = null) => {
    const msg = make("div", `chat-message ${isSent ? "sent" : ""}`);

    const now =
        time ||
        new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });

    const avatarImg =
        !isSent && avatar
            ? `<img src="${avatar}" alt="Avatar" class="chat-message-avatar" />`
            : "";

    msg.innerHTML = `
        ${avatarImg}
        <div class="chat-message-content">
            <div class="chat-message-bubble">${text}</div>
            <div class="chat-message-time">${now}</div>
        </div>
    `;

    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text || !currentChatPerson) return;

    addMessage(text, true);
    chatInput.value = "";
    chatInput.focus();

    const result = await postChatMessage(
        currentChatPerson.name,
        `Chat with ${currentChatPerson.name}`,
        text
    );

    if (result) {
        console.log("Message posted successfully:", result);
        const updatedPosts = await fetchChatPosts();
        if (updatedPosts && updatedPosts.length > 0) {
            ALL_CHAT_POSTS = updatedPosts;
        }
    } else {
        console.error("Failed to post message");
    }

    // Simulate response after a delay
    setTimeout(() => {
        const responses = [
            "That sounds great!",
            "I'd be happy to help.",
            "Let's catch up a bit later on!",
            "Thank you!",
        ];
        const randomResponse =
            responses[Math.floor(Math.random() * responses.length)];
        addMessage(
            randomResponse,
            false,
            null,
            currentChatPerson?.avatar || "assets/user_default_icon.png"
        );
    }, 1500);
});

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (!connectModal.hidden) closeConnect();
        if (!chatModal.hidden) closeChat();
    }
});

export const initConnect = async () => {
    renderLoading(el("#people-container"), "Loading people…");

    const user = await getUser();

    if (user && user.name) {
        CURRENT_USER = user.name;
        localStorage.setItem("current_user_name", user.name);
    }

    const users = await fetchUsers();

    if (users && users.length > 0) {
        ALL_PEOPLE = users.map(normalizeUser);
    } else {
        console.error("Failed to load users");
        renderEmpty(
            el("#people-container"),
            "Failed to load people. Please try again later."
        );
        return;
    }

    const chatPosts = await fetchChatPosts();

    if (chatPosts && chatPosts.length > 0) {
        ALL_CHAT_POSTS = chatPosts;
    } else {
        console.warn("No chat history available");
        ALL_CHAT_POSTS = [];
    }

    applyAndRender();
};

document.addEventListener("DOMContentLoaded", async () => {
    initNavBar();
    initControls();
    initConnect();
});
