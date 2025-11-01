import { initNavBar } from "./modules/nav_bar.js";

/**
 * CONSTANTS
 * Define values that don't change e.g. page titles, URLs, etc.
 */
const STORAGE_KEYS = {
    UPVOTES: "explore_upvotes",
    RATINGS: "explore_ratings",
};

const RECOMMEND_TAGS = [
    "design",
    "frontend",
    "cli",
    "productivity",
    "ai",
    "devops",
];

/**
 * VARIABLES
 * Define values that will change e.g. user inputs, counters, etc.
 */
let state = {
    q: "",
    lang: "",
    sort: "recommended",
    minRating: 0,
    selectedTags: new Set(),
};

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

const getStore = (k) => JSON.parse(localStorage.getItem(k) || "{}");
const setStore = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// ---- Mock data ----
const MOCK_REPOS = [
    {
        id: "u123/pixelnomad",
        full_name: "User123/PixelNomad",
        description:
            "A lightweight tool to organize, tag, and preview digital assets for designers on the go.",
        stars: 249,
        language: "TypeScript",
        topics: ["design", "productivity"],
        updated_at: "2025-10-25T10:00:00Z",
        group: "Design Tools",
    },
    {
        id: "devco/cli-lite",
        full_name: "DevCo/cli-lite",
        description:
            "Tiny cross-platform CLI toolkit with batteries-included DX.",
        stars: 181,
        language: "Go",
        topics: ["cli", "devops"],
        updated_at: "2025-10-28T18:10:00Z",
        group: "Developer Tools",
    },
    {
        id: "maria/ui-lab",
        full_name: "Maria/ui-lab",
        description: "Composable UI primitives with accessibility baked-in.",
        stars: 963,
        language: "JavaScript",
        topics: ["frontend", "design"],
        updated_at: "2025-10-30T08:30:00Z",
        group: "Design Systems",
    },
    {
        id: "aiteam/mini-embedder",
        full_name: "AITeam/mini-embedder",
        description: "Small, fast text embedder for semantic search.",
        stars: 742,
        language: "Python",
        topics: ["ai", "nlp"],
        updated_at: "2025-10-30T12:45:00Z",
        group: "AI",
    },
    {
        id: "opsworks/deploy-mesh",
        full_name: "OpsWorks/deploy-mesh",
        description: "Declarative deploys that scale with your microservices.",
        stars: 321,
        language: "Rust",
        topics: ["devops", "platform"],
        updated_at: "2025-10-24T07:12:00Z",
        group: "Platform",
    },
];

// ---- DOM helpers ----
const el = (sel) => document.querySelector(sel);
const make = (tag, cls) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
};

const formatNumber = (n) => Intl.NumberFormat().format(n);

const buildRepoCard = (repo) => {
  const upvotes = getStore(STORAGE_KEYS.UPVOTES);
  const voted = getStore(STORAGE_KEYS.VOTED);

  // initialize values
  const countDelta = upvotes[repo.id] || 0;
  const hasVoted = !!voted[repo.id];
  const baseStars = repo.stars || 0;

  // build badge HTML
  const languageBadge = repo.language
    ? `<span class="badge">${repo.language}</span>`
    : "";
  const topicBadges = (repo.topics || [])
    .slice(0, 4)
    .map((t) => `<span class="badge">${t}</span>`)
    .join("");

  const link = repo.html_url || "#";

  const card = make("article", "repo-card");
  card.setAttribute("tabindex", "0");
  card.dataset.href = link;

  card.innerHTML = `
    <h3 class="repo-title">${repo.full_name}</h3>
    <p class="repo-desc">${repo.description || "No description provided."}</p>

    <div class="repo-meta">
      <button class="upvote ${hasVoted ? "is-active" : ""}" 
              type="button"
              data-id="${repo.id}"
              aria-label="Upvote ${repo.full_name}"
              aria-pressed="${hasVoted ? "true" : "false"}">
        <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
        <span class="upvote-count">${baseStars + countDelta}</span>
      </button>

      <div class="meta-badges">
        ${languageBadge}
        ${topicBadges}
      </div>
    </div>
  `;

  // --- Card click opens repo (placeholder for now) ---
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

  // --- Upvote toggle (add or remove) ---
  const upvoteBtn = card.querySelector(".upvote");
  upvoteBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    const uStore = getStore(STORAGE_KEYS.UPVOTES);
    const vStore = getStore(STORAGE_KEYS.VOTED);

    let delta = uStore[repo.id] || 0;
    const alreadyVoted = !!vStore[repo.id];

    if (alreadyVoted) {
      // remove vote
      delta = Math.max(0, delta - 1);
      delete vStore[repo.id];
      upvoteBtn.classList.remove("is-active");
      upvoteBtn.setAttribute("aria-pressed", "false");
    } else {
      // add vote
      delta = delta + 1;
      vStore[repo.id] = true;
      upvoteBtn.classList.add("is-active");
      upvoteBtn.setAttribute("aria-pressed", "true");
    }

    // save changes
    uStore[repo.id] = delta;
    setStore(STORAGE_KEYS.UPVOTES, uStore);
    setStore(STORAGE_KEYS.VOTED, vStore);

    // update count text
    const countEl = upvoteBtn.querySelector(".upvote-count");
    countEl.textContent = baseStars + delta;
  });

  return card;
};

const renderEmpty = (container, msg) => {
    container.innerHTML = "";
    const box = make("div", "empty");
    box.textContent = msg;
    container.appendChild(box);
};

const renderGrid = (container, items) => {
    container.innerHTML = "";
    if (!items.length)
        return renderEmpty(container, "No repositories match your filters.");
    items.forEach((r) => container.appendChild(buildRepoCard(r)));
};

const renderTrending = (all) => {
    const sorted = [...all]
        .sort((a, b) => (b.stars || 0) - (a.stars || 0))
        .slice(0, 6);
    renderGrid(el("#trendingContainer"), sorted);
};

const renderTopics = (all) => {
    const byTopic = new Map();
    all.forEach((r) =>
        (r.topics || []).forEach((t) => {
            if (!byTopic.has(t)) byTopic.set(t, []);
            byTopic.get(t).push(r);
        })
    );

    const wrap = el("#topicsContainer");
    wrap.innerHTML = "";
    const topEntries = [...byTopic.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 3);
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

const renderChips = () => {
    const box = el("#recommendChips");
    box.innerHTML = "";
    RECOMMEND_TAGS.forEach((tag) => {
        const c = make("button", "chip");
        c.type = "button";
        c.setAttribute("role", "listitem");
        c.textContent = `#${tag}`;
        c.setAttribute(
            "aria-pressed",
            state.selectedTags.has(tag) ? "true" : "false"
        );
        c.addEventListener("click", () => {
            if (state.selectedTags.has(tag)) state.selectedTags.delete(tag);
            else state.selectedTags.add(tag);
            c.setAttribute(
                "aria-pressed",
                state.selectedTags.has(tag) ? "true" : "false"
            );
            applyAndRender();
        });
        box.appendChild(c);
    });
};

// ---- Filter/sort pipeline ----
const getRatingFor = (id) => getStore(STORAGE_KEYS.RATINGS)[id] || 0;

const applyFilters = (data) => {
    return data.filter((r) => {
        // search
        if (state.q) {
            const q = state.q.toLowerCase();
            const text = `${r.full_name} ${r.description || ""}`.toLowerCase();
            if (!text.includes(q)) return false;
        }
        // language
        if (state.lang && r.language !== state.lang) return false;
        // min rating
        if (getRatingFor(r.id) < state.minRating) return false;
        // tags
        if (state.selectedTags.size) {
            const topics = new Set(r.topics || []);
            const hasAny = [...state.selectedTags].some((t) => topics.has(t));
            if (!hasAny) return false;
        }
        return true;
    });
};

const applySort = (data) => {
    const withUser = data.map((r) => ({
        ...r,
        _userStars:
            (r.stars || 0) + (getStore(STORAGE_KEYS.UPVOTES)[r.id] || 0),
        _userRating: getRatingFor(r.id),
    }));

    switch (state.sort) {
        case "stars_desc":
            return withUser.sort((a, b) => b._userStars - a._userStars);
        case "stars_asc":
            return withUser.sort((a, b) => a._userStars - b._userStars);
        case "updated_desc":
            return withUser.sort(
                (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
            );
        case "recommended":
        default:
            // Simple recommendation: weighted by rating, stars, and shared tags
            const tagBoost = (r) => {
                if (!state.selectedTags.size) return 0;
                const topics = new Set(r.topics || []);
                return [...state.selectedTags].reduce(
                    (acc, t) => acc + (topics.has(t) ? 1 : 0),
                    0
                );
            };
            return withUser.sort((a, b) => {
                const A = a._userRating * 3 + a._userStars / 200 + tagBoost(a);
                const B = b._userRating * 3 + b._userStars / 200 + tagBoost(b);
                return B - A;
            });
    }
};

const applyAndRender = () => {
    const filtered = applyFilters(MOCK_REPOS);
    const sorted = applySort(filtered);

    // All results
    el("#resultsCount").textContent = `${sorted.length} result${
        sorted.length !== 1 ? "s" : ""
    }`;
    renderGrid(el("#resultsContainer"), sorted);

    // Groups
    renderTrending(MOCK_REPOS);
    renderTopics(MOCK_REPOS);
};

// ---- Init Explore (page entry) ----
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
    const rating = el("#ratingRange");
    const out = el("#ratingOut");
    const updateOut = () => {
        out.textContent = `${rating.value}★`;
    };
    rating.addEventListener("input", () => {
        state.minRating = Number(rating.value);
        updateOut();
        applyAndRender();
    });
    updateOut();
};

export const initExplore = async () => {
    // Populate dynamic UI
    renderChips();
    renderLanguages(MOCK_REPOS);
    applyAndRender();
};

/**
 * EVENT LISTENERS
 * The code that runs when a user interacts with the page
 */
document.addEventListener("DOMContentLoaded", async () => {
    initNavBar();
    initControls();
    initExplore();
});

