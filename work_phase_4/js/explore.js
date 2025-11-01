import { initNavBar } from "./modules/nav_bar.js";
import { getRepos } from "./modules/repo/getRepos.js";
import { postRepo } from "./modules/repo/postRepo.js";

const STORAGE_KEYS = {
    UPVOTES: "explore_upvotes",
    VOTED: "explore_voted",
};

const RECOMMEND_TAGS = [
    "design",
    "frontend",
    "cli",
    "productivity",
    "ai",
    "devops",
];

let state = {
    q: "",
    lang: "",
    sort: "recommended",
    selectedTags: new Set(),
};

let ALL_REPOS = [];

window.addEventListener("scroll", () => {
    const profile = document.querySelector(".user-profile");
    if (!profile) return;
    profile.classList.toggle("scrolled", window.scrollY > 10);
});

const el = (sel) => document.querySelector(sel);
const make = (tag, cls) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
};
const getStore = (k) => JSON.parse(localStorage.getItem(k) || "{}");
const setStore = (k, v) => localStorage.setItem(k, JSON.stringify(v));

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

const normalizeApiRepo = (p, idx) => {
    const isNumeric = !isNaN(Number(p.product_info3));
    return {
        id: `${p.product_owner || "unknown"}/${
            p.product_name || "untitled"
        }#${idx}`,
        full_name: p.product_name || "Untitled",
        description: p.product_description || "",
        language: p.product_info1 || "",
        topics: [p.product_info2, !isNumeric ? p.product_info3 : null].filter(
            Boolean
        ),
        upvotes: isNumeric ? Number(p.product_info3) : 0,
        website_code: p.website_code || "",
        html_url: "https://github.com/",
    };
};

const buildRepoCard = (repo) => {
    const upvotes = getStore(STORAGE_KEYS.UPVOTES);
    const voted = getStore(STORAGE_KEYS.VOTED);

    const localDelta = upvotes[repo.id] || 0;
    const hasVoted = !!voted[repo.id];
    const totalUpvotes = repo.upvotes + localDelta;

    const languageBadge = repo.language
        ? `<span class="badge">${repo.language}</span>`
        : "";
    const topicBadges = (repo.topics || [])
        .slice(0, 4)
        .map((t) => `<span class="badge">${t}</span>`)
        .join("");

    const card = make("a", "info-card");
    card.href = repo.html_url || "#";
    card.target = "_blank";
    card.rel = "noopener";

    card.innerHTML = `
        <h3 class="repo-title">${repo.full_name}</h3>
        <p class="repo-desc">${
            repo.description || "No description provided."
        }</p>
        <div class="repo-meta">
            <button class="upvote ${hasVoted ? "is-active" : ""}" 
                    type="button"
                    data-id="${repo.id}"
                    aria-pressed="${hasVoted ? "true" : "false"}">
                <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
                <span class="upvote-count">${totalUpvotes}</span>
            </button>
            <div class="meta-badges">
                ${languageBadge}
                ${topicBadges}
            </div>
        </div>
    `;

    const openCard = () => {
        if (card.dataset.href && card.dataset.href !== "#") {
            window.open(card.dataset.href, "_blank", "noopener");
        }
    };
    card.addEventListener("click", openCard);
    card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openCard();
        }
    });

    const upvoteBtn = card.querySelector(".upvote");
    const countEl = upvoteBtn.querySelector(".upvote-count");

    const setUpvoteAriaLabel = (count, isPressed) => {
        const verb = isPressed ? "Remove upvote from" : "Upvote";
        upvoteBtn.setAttribute(
            "aria-label",
            `${count} upvotes — ${verb} ${repo.full_name}`
        );
    };
    setUpvoteAriaLabel(totalUpvotes, hasVoted);

    upvoteBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        const uStore = getStore(STORAGE_KEYS.UPVOTES);
        const vStore = getStore(STORAGE_KEYS.VOTED);

        let delta = uStore[repo.id] || 0;
        const alreadyVoted = !!vStore[repo.id];

        if (alreadyVoted) {
            delta = Math.max(0, delta - 1);
            delete vStore[repo.id];
            upvoteBtn.classList.remove("is-active");
            upvoteBtn.setAttribute("aria-pressed", "false");
        } else {
            delta = delta + 1;
            vStore[repo.id] = true;
            upvoteBtn.classList.add("is-active");
            upvoteBtn.setAttribute("aria-pressed", "true");
        }

        uStore[repo.id] = delta;
        setStore(STORAGE_KEYS.UPVOTES, uStore);
        setStore(STORAGE_KEYS.VOTED, vStore);

        const newCount = repo.upvotes + delta;
        countEl.textContent = newCount;

        // Keep accessible name in sync and starting with the visible number
        setUpvoteAriaLabel(newCount, !alreadyVoted);
    });

    return card;
};

const renderGrid = (container, items) => {
    container.removeAttribute("aria-busy");
    container.innerHTML = "";
    if (!items.length)
        return renderEmpty(container, "No repositories match your filters.");
    items.forEach((r) => container.appendChild(buildRepoCard(r)));
};

const renderTrending = (all) => {
    const c = el("#trendingContainer");
    const up = getStore(STORAGE_KEYS.UPVOTES);
    const sorted = [...all]
        .map((r) => ({ ...r, _up: r.upvotes + (up[r.id] || 0) }))
        .sort((a, b) => b._up - a._up)
        .slice(0, 6);
    renderGrid(c, sorted);
};

const renderTopics = (all) => {
    const wrap = el("#topicsContainer");
    wrap.removeAttribute("aria-busy");
    wrap.innerHTML = "";

    const byTopic = new Map();
    all.forEach((r) =>
        (r.topics || []).forEach((t) => {
            if (!byTopic.has(t)) byTopic.set(t, []);
            byTopic.get(t).push(r);
        })
    );

    const topEntries = [...byTopic.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 3);

    if (!topEntries.length) {
        return renderEmpty(wrap, "No topics to display.");
    }

    topEntries.forEach(([topic, repos]) => {
        const group = make("div", "topic-group");
        const h = make("h3");
        h.textContent = `#${topic}`;
        const grid = make("div", "repo-grid");
        repos.slice(0, 4).forEach((r) => grid.appendChild(buildRepoCard(r)));
        group.appendChild(h);
        group.appendChild(grid);
        wrap.appendChild(group);
    });
};

const renderLanguages = (all) => {
    const sel = el("#languageSelect");
    sel.innerHTML = '<option value="">All languages</option>';
    const langs = [
        ...new Set(all.map((r) => r.language).filter(Boolean)),
    ].sort();
    langs.forEach((l) => {
        const opt = make("option");
        opt.value = l;
        opt.textContent = l;
        sel.appendChild(opt);
    });
};

const applyFilters = (data) => {
    return data.filter((r) => {
        if (state.q) {
            const q = state.q.toLowerCase();
            const text = `${r.full_name} ${r.description || ""}`.toLowerCase();
            if (!text.includes(q)) return false;
        }
        if (state.lang && r.language !== state.lang) return false;
        if (state.selectedTags.size) {
            const topics = new Set(r.topics || []);
            const hasAny = [...state.selectedTags].some((t) => topics.has(t));
            if (!hasAny) return false;
        }
        return true;
    });
};

const applySort = (data) => {
    const up = getStore(STORAGE_KEYS.UPVOTES);
    const withUp = data.map((r, i) => ({
        ...r,
        _up: r.upvotes + (up[r.id] || 0),
        _idx: i,
    }));

    switch (state.sort) {
        case "stars_desc":
            return withUp.sort((a, b) => b._up - a._up);
        case "stars_asc":
            return withUp.sort((a, b) => a._up - b._up);
        case "updated_desc":
            return withUp.sort((a, b) => b._idx - a._idx);
        default:
            return withUp.sort((a, b) => b._up - a._up);
    }
};

const applyAndRender = () => {
    const filtered = applyFilters(ALL_REPOS);
    const sorted = applySort(filtered);
    el("#resultsCount").textContent = `${sorted.length} result${
        sorted.length !== 1 ? "s" : ""
    }`;
    renderGrid(el("#resultsContainer"), sorted);
    renderTrending(ALL_REPOS);
    renderTopics(ALL_REPOS);
};

const initControls = () => {
    el("#searchInput").addEventListener("input", (e) => {
        state.q = e.target.value.trim();
        applyAndRender();
    });
    el("#languageSelect").addEventListener("change", (e) => {
        state.lang = e.target.value;
        applyAndRender();
    });
    el("#sortSelect").addEventListener("change", (e) => {
        state.sort = e.target.value;
        applyAndRender();
    });
};

export const initExplore = async () => {
    renderLoading(el("#trendingContainer"), "Loading trending repositories…");
    renderLoading(el("#topicsContainer"), "Loading repositories by topic…");
    renderLoading(el("#resultsContainer"), "Loading repositories…");

    const data = await getRepos();
    if (!data) {
        renderEmpty(el("#trendingContainer"), "Failed to load trending.");
        renderEmpty(el("#topicsContainer"), "Failed to load topics.");
        return renderEmpty(
            el("#resultsContainer"),
            "Failed to load repositories."
        );
    }

    ALL_REPOS = data.map(normalizeApiRepo);

    renderLanguages(ALL_REPOS);
    applyAndRender();
};

document.addEventListener("DOMContentLoaded", async () => {
    initNavBar();
    initControls();
    initExplore();
});

// Modal behavior
const shareButton = document.getElementById("shareButton");
const shareModal = document.getElementById("shareModal");
const closeModal = document.getElementById("closeModal");
const shareForm = document.getElementById("shareForm");

shareButton.addEventListener("click", () => {
    shareModal.hidden = false;
    document.body.style.overflow = "hidden";
});

closeModal.addEventListener("click", () => {
    shareModal.hidden = true;
    document.body.style.overflow = "";
});

// Close modal on Escape
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !shareModal.hidden) {
        shareModal.hidden = true;
        document.body.style.overflow = "";
    }
});

shareForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = shareForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
        const result = await postRepo(shareForm);

        if (result) {
            console.log("Repository shared successfully:", result);

            const repoName = shareForm.querySelector(
                '[name="product-name"]'
            ).value;
            alert(
                `Thanks for sharing "${repoName}"! Your repository has been added.`
            );

            shareModal.hidden = true;
            document.body.style.overflow = "";
            shareForm.reset();

            await initExplore();
        } else {
            throw new Error("Failed to submit repository");
        }
    } catch (error) {
        console.error("Error sharing repository:", error);
        alert(
            "Sorry, there was an error sharing your repository. Please try again."
        );
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});
