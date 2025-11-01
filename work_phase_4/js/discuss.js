import { initNavBar } from "./modules/nav_bar.js";

const STORAGE_KEYS = {
    POSTS: "discuss_posts",
    UPVOTES: "discuss_upvotes",
    VOTED: "discuss_voted",
    COMMENTS: "discuss_comments",
    COMMENT_UPVOTES: "discuss_comment_upvotes",
    COMMENT_VOTED: "discuss_comment_voted",
};

let state = {
    q: "",
    category: "",
    sort: "recent",
    currentPostId: null,
};

let ALL_POSTS = [];

initNavBar();

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
const getArrayStore = (k) => JSON.parse(localStorage.getItem(k) || "[]");
const setArrayStore = (k, v) => localStorage.setItem(k, JSON.stringify(v));

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
};

const getCategoryClass = (category) => {
    const classes = {
        general: "badge",
        help: "badge",
        showcase: "badge",
        feedback: "badge",
        announcement: "badge",
    };
    return classes[category] || "badge";
};

const generateSamplePosts = () => {
    const samples = [
        {
            id: "post-1",
            title: "Welcome to the Community!",
            content:
                "Hey everyone! We're excited to launch this discussion forum. Feel free to share your projects, ask questions, and connect with fellow developers. Let's build an amazing community together!",
            author: "Team CCI",
            category: "announcement",
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            upvotes: 42,
            commentCount: 15,
        },
        {
            id: "post-2",
            title: "Best practices for accessible web design?",
            content:
                "I'm working on making my website more accessible and would love to hear your recommendations. What are the most important WCAG guidelines to focus on? Any tools or resources you'd recommend?",
            author: "DevUser123",
            category: "help",
            createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            upvotes: 28,
            commentCount: 12,
        },
        {
            id: "post-3",
            title: "Just launched my portfolio site!",
            content:
                "After weeks of work, I finally finished my portfolio website. It features a clean design, smooth animations, and is fully responsive. Would love to get your feedback! Check it out and let me know what you think.",
            author: "CreativeCoder",
            category: "showcase",
            createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
            upvotes: 56,
            commentCount: 23,
        },
        {
            id: "post-4",
            title: "How to optimize React performance?",
            content:
                "My React app is getting slower as it grows. I'm looking for tips on optimization - should I use React.memo, useMemo, or are there other strategies? Any advice would be appreciated!",
            author: "ReactDev",
            category: "help",
            createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
            upvotes: 34,
            commentCount: 18,
        },
        {
            id: "post-5",
            title: "Thoughts on the new CSS features?",
            content:
                "CSS has evolved so much recently with container queries, cascade layers, and new color functions. What features are you most excited about? How are you using them in your projects?",
            author: "CSSEnthusiast",
            category: "general",
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
            upvotes: 21,
            commentCount: 9,
        },
        {
            id: "post-6",
            title: "Feature request: Dark mode toggle",
            content:
                "It would be great to have a dark mode option for the platform. Many users prefer it for late-night coding sessions. Is this something that could be implemented?",
            author: "NightOwl",
            category: "feedback",
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            upvotes: 67,
            commentCount: 31,
        },
    ];

    const stored = getArrayStore(STORAGE_KEYS.POSTS);
    if (stored.length === 0) {
        setArrayStore(STORAGE_KEYS.POSTS, samples);
        return samples;
    }
    return stored;
};

const generateSampleComments = (postId) => {
    const allComments = {
        "post-1": [
            {
                id: "comment-1-1",
                postId: "post-1",
                content:
                    "Great to be here! Looking forward to connecting with everyone.",
                author: "NewUser",
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                upvotes: 5,
            },
            {
                id: "comment-1-2",
                postId: "post-1",
                content: "This platform looks amazing! Kudos to the team.",
                author: "Designer101",
                createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
                upvotes: 8,
            },
        ],
        "post-2": [
            {
                id: "comment-2-1",
                postId: "post-2",
                content:
                    "Start with keyboard navigation and proper ARIA labels. The axe DevTools browser extension is excellent for testing!",
                author: "A11yExpert",
                createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
                upvotes: 12,
            },
            {
                id: "comment-2-2",
                postId: "post-2",
                content:
                    "Don't forget about color contrast! WebAIM has a great contrast checker tool.",
                author: "UXDesigner",
                createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
                upvotes: 7,
            },
        ],
        "post-3": [
            {
                id: "comment-3-1",
                postId: "post-3",
                content:
                    "Looks fantastic! The animations are really smooth. Great work!",
                author: "WebDev99",
                createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
                upvotes: 9,
            },
        ],
    };

    const stored = getStore(STORAGE_KEYS.COMMENTS);
    if (Object.keys(stored).length === 0) {
        setStore(STORAGE_KEYS.COMMENTS, allComments);
        return allComments[postId] || [];
    }
    return stored[postId] || [];
};

const buildPostCard = (post) => {
    const upvotes = getStore(STORAGE_KEYS.UPVOTES);
    const voted = getStore(STORAGE_KEYS.VOTED);

    const localDelta = upvotes[post.id] || 0;
    const hasVoted = !!voted[post.id];
    const totalUpvotes = post.upvotes + localDelta;

    const card = make("article", "repo-card");
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `View discussion: ${post.title}`);
    card.dataset.postId = post.id;

    card.innerHTML = `
        <h3 class="repo-title">${escapeHtml(post.title)}</h3>
        <p class="repo-desc">${escapeHtml(
            post.content.substring(0, 200) +
                (post.content.length > 200 ? "..." : "")
        )}</p>
        <div class="repo-meta">
            <span class="post-author">${escapeHtml(post.author)}</span>
            <span class="post-date">
                <i class="fa-solid fa-clock" aria-hidden="true"></i>
                <time datetime="${post.createdAt}">${formatDate(
        post.createdAt
    )}</time>
            </span>
            <span class="${getCategoryClass(post.category)}">${escapeHtml(
        post.category
    )}</span>
            <div class="post-stats">
                <button class="upvote ${hasVoted ? "is-active" : ""}" 
                        type="button"
                        data-id="${post.id}"
                        aria-label="Upvote ${post.title}"
                        aria-pressed="${hasVoted ? "true" : "false"}">
                    <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
                    <span class="upvote-count">${totalUpvotes}</span>
                </button>
                <span class="post-stat">
                    <i class="fa-solid fa-comment" aria-hidden="true"></i>
                    <span>${post.commentCount || 0}</span>
                </span>
            </div>
        </div>
    `;

    const openPost = () => {
        showPostDetail(post.id);
    };

    card.addEventListener("click", (e) => {
        if (!e.target.closest(".upvote")) {
            openPost();
        }
    });

    card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!e.target.closest(".upvote")) {
                openPost();
            }
        }
    });

    const upvoteBtn = card.querySelector(".upvote");
    upvoteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        handleUpvote(post.id, upvoteBtn, post.upvotes);
    });

    return card;
};

const handleUpvote = (id, btn, baseUpvotes) => {
    const uStore = getStore(STORAGE_KEYS.UPVOTES);
    const vStore = getStore(STORAGE_KEYS.VOTED);

    let delta = uStore[id] || 0;
    const alreadyVoted = !!vStore[id];

    if (alreadyVoted) {
        delta = Math.max(0, delta - 1);
        delete vStore[id];
        btn.classList.remove("is-active");
        btn.setAttribute("aria-pressed", "false");
    } else {
        delta = delta + 1;
        vStore[id] = true;
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
    }

    uStore[id] = delta;
    setStore(STORAGE_KEYS.UPVOTES, uStore);
    setStore(STORAGE_KEYS.VOTED, vStore);

    const countEl = btn.querySelector(".upvote-count");
    if (countEl) {
        countEl.textContent = baseUpvotes + delta;
    }
};

const escapeHtml = (text) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
};

const renderPosts = (posts) => {
    const container = el("#posts-container");
    container.removeAttribute("aria-busy");
    container.innerHTML = "";

    if (!posts.length) {
        const empty = make("p", "empty");
        empty.textContent = "No discussions found. Be the first to start one!";
        container.appendChild(empty);
        return;
    }

    posts.forEach((post) => container.appendChild(buildPostCard(post)));
};

const showPostDetail = (postId) => {
    state.currentPostId = postId;
    const posts = getArrayStore(STORAGE_KEYS.POSTS);
    const post = posts.find((p) => p.id === postId);

    if (!post) return;

    window.history.pushState({ postId }, "", `?post=${postId}`);

    el("#list-view").hidden = true;
    el("#detail-view").hidden = false;
    el("#back-button-container").hidden = false;

    renderPostDetail(post);

    const comments = generateSampleComments(postId);
    renderComments(comments);

    window.scrollTo({ top: 0, behavior: "smooth" });

    document.title = `${post.title} - Discuss`;
};

const renderPostDetail = (post) => {
    const upvotes = getStore(STORAGE_KEYS.UPVOTES);
    const voted = getStore(STORAGE_KEYS.VOTED);

    const localDelta = upvotes[post.id] || 0;
    const hasVoted = !!voted[post.id];
    const totalUpvotes = post.upvotes + localDelta;

    const container = el("#post-detail");
    container.innerHTML = `
        <div class="post-detail-header">
            <div>
                <h1 class="post-detail-title" id="post-detail-title">${escapeHtml(
                    post.title
                )}</h1>
                <div class="post-detail-meta">
                    <span class="post-detail-author">${escapeHtml(
                        post.author
                    )}</span>
                    <span class="post-detail-date">
                        <i class="fa-solid fa-clock" aria-hidden="true"></i>
                        <time datetime="${post.createdAt}">${formatDate(
        post.createdAt
    )}</time>
                    </span>
                    <span class="${getCategoryClass(
                        post.category
                    )}">${escapeHtml(post.category)}</span>
                </div>
            </div>
        </div>
        <div class="post-detail-content">${escapeHtml(post.content)}</div>
        <div class="post-detail-footer">
            <div class="post-detail-actions">
                <button class="upvote ${hasVoted ? "is-active" : ""}" 
                        type="button"
                        data-id="${post.id}"
                        aria-label="Upvote this post"
                        aria-pressed="${hasVoted ? "true" : "false"}">
                    <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
                    <span class="upvote-count">${totalUpvotes}</span>
                </button>
            </div>
            <div class="post-detail-stats">
                <span class="stat-item">
                    <i class="fa-solid fa-comment" aria-hidden="true"></i>
                    <span>${post.commentCount || 0} comments</span>
                </span>
            </div>
        </div>
    `;

    const upvoteBtn = container.querySelector(".upvote");
    upvoteBtn.addEventListener("click", () => {
        handleUpvote(post.id, upvoteBtn, post.upvotes);
    });
};

const renderComments = (comments) => {
    const container = el("#comments-container");
    const countEl = el("#comments-count");

    container.removeAttribute("aria-busy");
    container.innerHTML = "";
    countEl.textContent = `(${comments.length})`;

    if (!comments.length) {
        const empty = make("p", "empty");
        empty.textContent = "No comments yet. Be the first to comment!";
        container.appendChild(empty);
        return;
    }

    comments.forEach((comment) => {
        const upvotes = getStore(STORAGE_KEYS.COMMENT_UPVOTES);
        const voted = getStore(STORAGE_KEYS.COMMENT_VOTED);

        const localDelta = upvotes[comment.id] || 0;
        const hasVoted = !!voted[comment.id];
        const totalUpvotes = comment.upvotes + localDelta;

        const card = make("article", "comment-card");
        card.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${escapeHtml(
                    comment.author
                )}</span>
                <time class="comment-date" datetime="${
                    comment.createdAt
                }">${formatDate(comment.createdAt)}</time>
            </div>
            <p class="comment-content">${escapeHtml(comment.content)}</p>
            <div class="comment-actions">
                <button class="upvote ${hasVoted ? "is-active" : ""}" 
                        type="button"
                        data-id="${comment.id}"
                        aria-label="Upvote comment"
                        aria-pressed="${hasVoted ? "true" : "false"}">
                    <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
                    <span class="upvote-count">${totalUpvotes}</span>
                </button>
            </div>
        `;

        const upvoteBtn = card.querySelector(".upvote");
        upvoteBtn.addEventListener("click", () => {
            handleCommentUpvote(comment.id, upvoteBtn, comment.upvotes);
        });

        container.appendChild(card);
    });
};

const handleCommentUpvote = (id, btn, baseUpvotes) => {
    const uStore = getStore(STORAGE_KEYS.COMMENT_UPVOTES);
    const vStore = getStore(STORAGE_KEYS.COMMENT_VOTED);

    let delta = uStore[id] || 0;
    const alreadyVoted = !!vStore[id];

    if (alreadyVoted) {
        delta = Math.max(0, delta - 1);
        delete vStore[id];
        btn.classList.remove("is-active");
        btn.setAttribute("aria-pressed", "false");
    } else {
        delta = delta + 1;
        vStore[id] = true;
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
    }

    uStore[id] = delta;
    setStore(STORAGE_KEYS.COMMENT_UPVOTES, uStore);
    setStore(STORAGE_KEYS.COMMENT_VOTED, vStore);

    const countEl = btn.querySelector(".upvote-count");
    if (countEl) {
        countEl.textContent = baseUpvotes + delta;
    }
};

const showListView = () => {
    state.currentPostId = null;
    el("#list-view").hidden = false;
    el("#detail-view").hidden = true;
    el("#back-button-container").hidden = true;

    window.history.pushState({}, "", "discuss.html");

    document.title = "Discuss - Community Forum";

    window.scrollTo({ top: 0, behavior: "smooth" });
};

const filterAndSortPosts = () => {
    let filtered = [...ALL_POSTS];

    if (state.q) {
        const query = state.q.toLowerCase();
        filtered = filtered.filter(
            (p) =>
                p.title.toLowerCase().includes(query) ||
                p.content.toLowerCase().includes(query) ||
                p.author.toLowerCase().includes(query)
        );
    }

    if (state.category) {
        filtered = filtered.filter((p) => p.category === state.category);
    }

    const upvotes = getStore(STORAGE_KEYS.UPVOTES);
    switch (state.sort) {
        case "popular":
            filtered.sort(
                (a, b) =>
                    b.upvotes +
                    (upvotes[b.id] || 0) -
                    (a.upvotes + (upvotes[a.id] || 0))
            );
            break;
        case "comments":
            filtered.sort(
                (a, b) => (b.commentCount || 0) - (a.commentCount || 0)
            );
            break;
        case "oldest":
            filtered.sort(
                (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
            break;
        case "recent":
        default:
            filtered.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
    }

    return filtered;
};

const updateResultsCount = (count) => {
    const countEl = el("#results-count");
    if (countEl) {
        countEl.textContent = `(${count})`;
    }
};

const handleFilters = () => {
    const filtered = filterAndSortPosts();
    renderPosts(filtered);
    updateResultsCount(filtered.length);
};

const init = () => {
    ALL_POSTS = generateSamplePosts();

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("post");

    if (postId) {
        showPostDetail(postId);
    } else {
        const filtered = filterAndSortPosts();
        renderPosts(filtered);
        updateResultsCount(filtered.length);
    }

    const searchInput = el("#search-input");
    const categorySelect = el("#category-select");
    const sortSelect = el("#sort-select");

    searchInput?.addEventListener("input", (e) => {
        state.q = e.target.value;
        handleFilters();
    });

    categorySelect?.addEventListener("change", (e) => {
        state.category = e.target.value;
        handleFilters();
    });

    sortSelect?.addEventListener("change", (e) => {
        state.sort = e.target.value;
        handleFilters();
    });

    const backBtn = el("#back-button");
    backBtn?.addEventListener("click", showListView);

    window.addEventListener("popstate", (e) => {
        if (e.state?.postId) {
            showPostDetail(e.state.postId);
        } else {
            showListView();
        }
    });

    const newPostBtn = el("#new-post-button");
    const modal = el("#new-post-modal");
    const cancelBtn = el("#cancel-post-button");
    const form = el("#new-post-form");

    newPostBtn?.addEventListener("click", () => {
        modal.hidden = false;
        modal.querySelector("input")?.focus();
    });

    cancelBtn?.addEventListener("click", () => {
        modal.hidden = true;
        form?.reset();
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.hidden) {
            modal.hidden = true;
            form?.reset();
        }
    });

    modal?.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.hidden = true;
            form?.reset();
        }
    });

    form?.addEventListener("submit", (e) => {
        e.preventDefault();

        const title = el("#post-title").value.trim();
        const content = el("#post-content").value.trim();
        const category = el("#post-category").value;

        if (!title || !content || !category) {
            alert("Please fill in all required fields.");
            return;
        }

        const newPost = {
            id: `post-${Date.now()}`,
            title,
            content,
            category,
            author: "You",
            createdAt: new Date().toISOString(),
            upvotes: 0,
            commentCount: 0,
        };

        ALL_POSTS.unshift(newPost);
        setArrayStore(STORAGE_KEYS.POSTS, ALL_POSTS);

        modal.hidden = true;
        form.reset();

        handleFilters();

        const msg = make("div", "success-message");
        msg.textContent = "Discussion posted successfully!";
        msg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-success);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
        `;
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 3000);
    });

    const commentForm = el("#new-comment-form");
    commentForm?.addEventListener("submit", (e) => {
        e.preventDefault();

        const content = el("#comment-content").value.trim();
        if (!content) {
            alert("Please enter a comment.");
            return;
        }

        const newComment = {
            id: `comment-${Date.now()}`,
            postId: state.currentPostId,
            content,
            author: "You",
            createdAt: new Date().toISOString(),
            upvotes: 0,
        };

        const allComments = getStore(STORAGE_KEYS.COMMENTS);
        if (!allComments[state.currentPostId]) {
            allComments[state.currentPostId] = [];
        }
        allComments[state.currentPostId].unshift(newComment);
        setStore(STORAGE_KEYS.COMMENTS, allComments);

        const posts = getArrayStore(STORAGE_KEYS.POSTS);
        const post = posts.find((p) => p.id === state.currentPostId);
        if (post) {
            post.commentCount = (post.commentCount || 0) + 1;
            setArrayStore(STORAGE_KEYS.POSTS, posts);
            ALL_POSTS = posts;
        }

        commentForm.reset();
        renderComments(allComments[state.currentPostId]);

        const msg = make("div", "success-message");
        msg.textContent = "Comment posted successfully!";
        msg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-success);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
        `;
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 3000);
    });
};

init();
