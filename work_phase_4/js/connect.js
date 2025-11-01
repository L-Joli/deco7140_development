import { initNavBar } from "./modules/nav_bar.js";

const STORAGE_KEYS = {
    CONNECTIONS: "connect_connections",
};

let ALL_CHAT_POSTS = [];
let ALL_PEOPLE = [];

const CURRENT_USER = "You"; // Replace with actual logged-in user name

// Dummy user data matching API structure
const DUMMY_USERS = [
    {
        id: 1,
        user_name: "MountainGoat42",
        email: "alex.nguyen@example.com",
        experience_level: "Advanced",
        custom_field_1: "Lead Climbing",
        custom_field_2: "Bouldering",
        custom_field_longtext_1: "Senior UX Designer with a passion for accessible design and outdoor climbing.",
        custom_field_longtext_2: "Favourite crag: Grampians",
        profile_photo: "assets/user_default_icon.png",
        website_code: "abc123",
        date_created: "2025-04-01 10:00"
    },
    {
        id: 2,
        user_name: "CliffHanger99",
        email: "sara.patel@example.com",
        experience_level: "Intermediate",
        custom_field_1: "Sport Climbing",
        custom_field_2: "Route Setting",
        custom_field_longtext_1: "Product Manager who loves planning routes and solving complex problems.",
        custom_field_longtext_2: "Favourite crag: Arapiles",
        profile_photo: "assets/user_default_icon.png",
        website_code: "abc123",
        date_created: "2025-04-02 14:30"
    },
    {
        id: 3,
        user_name: "RockSolid88",
        email: "marcus.chen@example.com",
        experience_level: "Expert",
        custom_field_1: "Trad Climbing",
        custom_field_2: "Multi-pitch",
        custom_field_longtext_1: "Full Stack Developer with strong foundation in both climbing and coding.",
        custom_field_longtext_2: "Favourite crag: Blue Mountains",
        profile_photo: "assets/user_default_icon.png",
        website_code: "abc123",
        date_created: "2025-04-03 09:15"
    },
    {
        id: 4,
        user_name: "BoulderBelle",
        email: "emily.rodriguez@example.com",
        experience_level: "Intermediate",
        custom_field_1: "Bouldering",
        custom_field_2: "Indoor Climbing",
        custom_field_longtext_1: "Data Scientist who enjoys analyzing climb data and setting personal records.",
        custom_field_longtext_2: "Favourite crag: Frog Buttress",
        profile_photo: "assets/user_default_icon.png",
        website_code: "abc123",
        date_created: "2025-04-04 11:20"
    },
    {
        id: 5,
        user_name: "SummitSeeker",
        email: "kenji.tanaka@example.com",
        experience_level: "Advanced",
        custom_field_1: "Alpine Climbing",
        custom_field_2: "Ice Climbing",
        custom_field_longtext_1: "Frontend Engineer exploring new heights in both tech and mountains.",
        custom_field_longtext_2: "Favourite crag: Kosciuszko",
        profile_photo: "assets/user_default_icon.png",
        website_code: "abc123",
        date_created: "2025-04-05 08:45"
    },
    {
        id: 6,
        user_name: "CragCrusher",
        email: "olivia.martinez@example.com",
        experience_level: "Intermediate",
        custom_field_1: "Sport Climbing",
        custom_field_2: "Lead Climbing",
        custom_field_longtext_1: "Mobile Developer building apps for the climbing community.",
        custom_field_longtext_2: "Favourite crag: Nowra",
        profile_photo: "assets/user_default_icon.png",
        website_code: "abc123",
        date_created: "2025-04-06 13:10"
    }
];

// Dummy chat post data matching API structure
const DUMMY_CHAT_POSTS = [
    {
        id: 1,
        person_name: "MountainGoat42",
        chat_post_title: "Senior UX Designer",
        chat_post_content: "Welcome to the space! Let us know your interests.",
        chat_date_time: "2025-04-10 10:05",
        website_code: "abc123"
    },
    {
        id: 2,
        person_name: "CliffHanger99",
        chat_post_title: "Product Manager",
        chat_post_content: "Check out the WCAG quick reference guide for help!",
        chat_date_time: "2025-04-11 14:47",
        website_code: "abc123"
    },
    {
        id: 3,
        person_name: "MountainGoat42",
        chat_post_title: "Senior UX Designer",
        chat_post_content: "I've been working on some exciting projects lately. How about you?",
        chat_date_time: "2025-04-12 09:30",
        website_code: "abc123"
    },
    {
        id: 4,
        person_name: "RockSolid88",
        chat_post_title: "Full Stack Developer",
        chat_post_content: "Anyone interested in discussing React best practices?",
        chat_date_time: "2025-04-12 11:20",
        website_code: "abc123"
    },
    {
        id: 5,
        person_name: "CliffHanger99",
        chat_post_title: "Product Manager",
        chat_post_content: "Just shipped a new feature! Excited to hear feedback.",
        chat_date_time: "2025-04-13 15:10",
        website_code: "abc123"
    },
    {
        id: 6,
        person_name: "BoulderBelle",
        chat_post_title: "Data Scientist",
        chat_post_content: "Looking for collaborators on a machine learning project.",
        chat_date_time: "2025-04-14 08:45",
        website_code: "abc123"
    },
    {
        id: 7,
        person_name: "RockSolid88",
        chat_post_title: "Full Stack Developer",
        chat_post_content: "Happy to share some resources on TypeScript!",
        chat_date_time: "2025-04-14 16:30",
        website_code: "abc123"
    },
    {
        id: 8,
        person_name: "SummitSeeker",
        chat_post_title: "Frontend Engineer",
        chat_post_content: "Does anyone have experience with Next.js 14?",
        chat_date_time: "2025-04-15 10:00",
        website_code: "abc123"
    },
    {
        id: 9,
        person_name: "BoulderBelle",
        chat_post_title: "Data Scientist",
        chat_post_content: "Thanks everyone for the great insights on data visualization!",
        chat_date_time: "2025-04-15 13:25",
        website_code: "abc123"
    },
    {
        id: 10,
        person_name: "CragCrusher",
        chat_post_title: "Mobile Developer",
        chat_post_content: "Just released an app update with some cool new features!",
        chat_date_time: "2025-04-16 11:15",
        website_code: "abc123"
    },
    {
        id: 11,
        person_name: "SummitSeeker",
        chat_post_title: "Frontend Engineer",
        chat_post_content: "I love this community! Everyone is so helpful.",
        chat_date_time: "2025-04-16 14:50",
        website_code: "abc123"
    }
];

const normalizeUser = (user) => {
    return {
        id: `person-${user.id}`,
        user_id: user.id,
        name: user.user_name,
        title: user.custom_field_longtext_1 || "Climbing Enthusiast",
        location: user.custom_field_longtext_2 || "",
        mutualConnections: `${user.experience_level} • ${user.custom_field_1 || "Climber"}`,
        avatar: user.profile_photo || "assets/user_default_icon.png",
        email: user.email,
    };
};

const getChatHistoryForPerson = (userName) => {
    return ALL_CHAT_POSTS
        .filter(post => post.person_name === userName || post.person_name === CURRENT_USER)
        .sort((a, b) => new Date(a.chat_date_time) - new Date(b.chat_date_time));
};

const fetchUsers = async () => {
    try {
        // const data = await fetchData("user");
        // if (!data) {
        //     throw new Error("No data returned from server.");
        // }
        // return data;
        
        // Return dummy data for now
        return DUMMY_USERS;
    } catch (error) {
        console.error("Error fetching users:", error);
        return null;
    }
};

const fetchChatPosts = async () => {
    try {
        // const data = await fetchData("chatpost");
        // if (!data) {
        //     throw new Error("No data returned from server.");
        // }
        // return data;
        
        // Return dummy data for now
        return DUMMY_CHAT_POSTS;
    } catch (error) {
        console.error("Error fetching chat posts:", error);
        return null;
    }
};

const postChatMessage = async (personName, title, content) => {
    try {
        // const formData = new FormData();
        // formData.append("person_name", CURRENT_USER);
        // formData.append("chat_post_title", title);
        // formData.append("chat_post_content", content);
        // formData.append("chat_date_time", new Date().toISOString().slice(0, 16).replace('T', ' '));
        // formData.append("website_code", "abc123");
        // 
        // const result = await postFormData("chatpost", formData);
        // return result;
        
        // Append to dummy data for now
        const newPost = {
            id: DUMMY_CHAT_POSTS.length + 1,
            person_name: CURRENT_USER,
            chat_post_title: title,
            chat_post_content: content,
            chat_date_time: new Date().toISOString().slice(0, 16).replace('T', ' '),
            website_code: "abc123"
        };
        
        DUMMY_CHAT_POSTS.push(newPost);
        console.log("Posted message:", newPost);
        return newPost;
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

// Build person card
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
        <img src="${person.avatar}" alt="${person.name}'s avatar" class="person-avatar" />
        <div class="person-info">
            <h3 class="person-name">
                ${person.name}
            </h3>
            <p class="person-title">${person.title}</p>
            ${person.location ? `<p class="person-location">${person.location}</p>` : ""}
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
    el("#connect-note").placeholder = `Hi ${person.name}, I'd like to connect with you...`;
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
        history.forEach(post => {
            const isSent = post.person_name === CURRENT_USER;
            const timeStr = formatChatTime(post.chat_date_time);
            addMessage(
                post.chat_post_content,
                isSent,
                false,
                timeStr,
                isSent ? null : person.avatar,
                person.avatar
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

    const now = time || new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });

    const avatarImg = !isSent && avatar
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
        // Optionally refresh chat history
        // const updatedPosts = await fetchChatPosts();
        // if (updatedPosts) ALL_CHAT_POSTS = updatedPosts;
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


