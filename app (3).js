/* ==========================================
   DESCOP INTELLIGENCE NETWORK
   HOMEPAGE JAVASCRIPT
   ========================================== */

"use strict";

/* ==========================================
   1. PAGE INITIALIZATION
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    initializeLoader();
    initializeBreakingNews();
    initializeHomepageNews();
    initializeNewsFilters();
    initializeNewsletter();
    initializeScrollToTop();
    initializeDESCOPSavedPage();
});


/* ==========================================
   2. LOADING SCREEN
   ========================================== */

function initializeLoader() {
    const loader = document.getElementById("pageLoader");

    if (!loader) return;

    // Prevent the loading screen from staying forever.
    loader.style.transition = "opacity 0.4s ease";

    requestAnimationFrame(() => {
        loader.style.opacity = "0";
        loader.style.pointerEvents = "none";

        setTimeout(() => {
            loader.remove();
        }, 450);
    });
}


/* ==========================================
   3. BREAKING NEWS TICKER
   ========================================== */

function initializeBreakingNews() {
    const ticker = document.getElementById("breakingNewsTrack");

    if (!ticker) return;

    const headlines = [
        "DESCOP | Global affairs and international developments",
        "AFRICA | Tracking political and economic developments",
        "BUSINESS | Markets, trade and business intelligence",
        "TECHNOLOGY | Following innovation and digital transformation"
    ];

    ticker.replaceChildren();

    [...headlines, ...headlines].forEach((headline) => {
        const item = document.createElement("span");

        item.className = "breaking-news-item";
        item.textContent = headline;

        ticker.appendChild(item);
    });
}


/* ==========================================
   4. HOMEPAGE NEWS
   ========================================== */

// Temporary demonstration content.
// Replace with verified articles or backend data later.

const homepageNews = [
    {
        category: "World",
        title: "Understanding the Latest Developments in Global Affairs",
        summary: "Explore the international events shaping diplomacy and relations between nations.",
        date: "Editorial Preview",
        link: "world.html"
    },
    {
        category: "Africa",
        title: "Africa's Changing Economic and Political Landscape",
        summary: "A closer look at the developments influencing countries and communities across Africa.",
        date: "Editorial Preview",
        link: "africa.html"
    },
    {
        category: "Nigeria",
        title: "Key Developments Shaping Nigeria",
        summary: "Follow important national developments across government, society and the economy.",
        date: "Editorial Preview",
        link: "nigeria.html"
    },
    {
        category: "Business",
        title: "Business Trends and the Global Economy",
        summary: "Explore the forces influencing businesses, trade and economic activity.",
        date: "Editorial Preview",
        link: "business.html"
    },
    {
        category: "Technology",
        title: "Technology and the Future of Digital Innovation",
        summary: "Discover developments in technology, digital services and emerging innovation.",
        date: "Editorial Preview",
        link: "technology.html"
    },
    {
        category: "Crypto",
        title: "Digital Assets and the Cryptocurrency Ecosystem",
        summary: "Explore cryptocurrency developments and the wider digital asset landscape.",
        date: "Editorial Preview",
        link: "crypto.html"
    }
];


/* ==========================================
DESCOP HOMEPAGE — LIVE NEWS LOADER
========================================== */

async function initializeHomepageNews() {
const grid = document.getElementById("latestGrid");

if (!grid) return;
// Detect which page is requesting news.
const pageCategory = (
    grid.dataset.category || "world"
).toLowerCase();

// Use a category-specific search query.
const categoryQueries = {
    world: "world news",
    africa: "Africa news",
    nigeria: "Nigeria news",
    technology: "technology news",
    sports: "sports news",
    business: "business news",
    entertainment: "entertainment news",
    crypto: "cryptocurrency news",
    weather: "weather news",
    health: "health news",
    science: "science news",
    politics: "politics news"
};

const query = categoryQueries[pageCategory] || "world news";

grid.replaceChildren();

const loadingMessage = document.createElement("p");
loadingMessage.className = "news-loading-message";
loadingMessage.textContent = "Loading the latest news...";
grid.appendChild(loadingMessage);

try {
    const response = await fetch(
    "https://descop-intelligence-network.onrender.com/api/news?q=" +
    encodeURIComponent(query)
);
    if (!response.ok) {
        throw new Error("News server returned status " + response.status);
    }

    const data = await response.json();

    if (!data.success || !Array.isArray(data.articles)) {
        throw new Error("The news response was invalid.");
    }

    const articles = data.articles.map(article => ({
        title: article.title || "Untitled news story",
        summary: article.description || "Read the full report for details.",
        link: article.url || "#",
        image: article.image || "",
        date: article.publishedAt
            ? new Date(article.publishedAt).toLocaleDateString()
            : "",
        category: pageCategory.charAt(0).toUpperCase() +
    pageCategory.slice(1),
        source: article.source || "News provider"
    }));

    renderHomepageNews(articles);

} catch (error) {
    console.error("DESCOP homepage news error:", error);
    console.error("Error details:", error.message || error);
    grid.replaceChildren();

    const errorMessage = document.createElement("p");
    errorMessage.className = "news-error-message";
    errorMessage.textContent =
        "News is temporarily unavailable. Please try again shortly.";

    grid.appendChild(errorMessage);
}

}

/* ==========================================
RENDER LIVE NEWS CARDS
========================================== */

function renderHomepageNews(articles) {
const grid = document.getElementById("latestGrid");

if (!grid) return;

grid.replaceChildren();

if (!Array.isArray(articles) || articles.length === 0) {
    const emptyMessage = document.createElement("p");

    emptyMessage.className = "empty-news-message";
    emptyMessage.textContent = "No news articles are available.";

    grid.appendChild(emptyMessage);
    return;
}

articles.forEach(article => {
    const card = document.createElement("article");
    card.className = "news-card";

    if (article.image) {
        const image = document.createElement("img");

        image.className = "news-card-image";
        image.src = article.image;
        image.alt = article.title;
        image.loading = "lazy";

        image.addEventListener("error", () => {
            image.remove();
        });

        card.appendChild(image);
    }

    const category = document.createElement("span");
    category.className = "news-category";
    category.textContent = article.category || "News";

    const heading = document.createElement("h3");
    const titleLink = document.createElement("a");

    titleLink.href = article.link || "#";
    titleLink.textContent = article.title || "Untitled news story";
    titleLink.target = "_blank";
    titleLink.rel = "noopener noreferrer";

    heading.appendChild(titleLink);

    const summary = document.createElement("p");
    summary.className = "news-summary";
    summary.textContent = article.summary || "";

    const source = document.createElement("span");
    source.className = "news-source";
    source.textContent = "Source: " + (article.source || "News provider");

    const date = document.createElement("span");
    date.className = "news-date";
    date.textContent = article.date || "";

    card.append(category, heading, summary, source, date);
    grid.appendChild(card);
});

}
/* ==========================================
   5. NEWS CATEGORY FILTERS
   ========================================== */

/* ==========================================
   5. DESCOP LIVE NEWS CATEGORY FILTERS
========================================== */

function initializeNewsFilters() {
    const filterButtons = document.querySelectorAll(
        "[data-news-filter]"
    );

    if (!filterButtons.length) return;

    filterButtons.forEach(button => {
        button.addEventListener("click", async () => {
            const selectedCategory =
                button.dataset.newsFilter;

            filterButtons.forEach(item => {
                item.classList.remove("active");
                item.setAttribute("aria-pressed", "false");
            });

            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");

            // "All" returns to the homepage's existing news.
            if (
                !selectedCategory ||
                selectedCategory.toLowerCase() === "all"
            ) {
                initializeHomepageNews();
                return;
            }

            const categoryQueries = {
                world: "world news",
                africa: "Africa news",
                nigeria: "Nigeria news",
                technology: "technology news",
                sports: "sports news",
                sport: "sports news",
                business: "business news",
                entertainment: "entertainment news",
                health: "health news",
                science: "science news",
                politics: "politics news"
            };

            const query =
                categoryQueries[selectedCategory.toLowerCase()];

            if (!query) {
                console.warn(
                    "No news query configured for:",
                    selectedCategory
                );
                return;
            }

            const grid = document.getElementById("latestGrid");

            if (!grid) return;

            grid.replaceChildren();

            const loadingMessage = document.createElement("p");
            loadingMessage.textContent =
                "Loading " + selectedCategory + " news...";

            grid.appendChild(loadingMessage);

            try {
                const response = await fetch(
                    "https://descop-intelligence-network.onrender.com/api/news?q=" +
                    encodeURIComponent(query)
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.error || "Unable to load news."
                    );
                }

                const articles = (data.articles || []).map(
                    article => ({
                        title: article.title || "Untitled news story",
                        summary: article.description ||
                            "Read the full report for details.",
                        link: article.url || "#",
                        image: article.image || "",
                        date: article.publishedAt
                            ? new Date(
                                article.publishedAt
                            ).toLocaleDateString()
                            : "",
                        category: selectedCategory,
                        source: article.source || "News provider"
                    })
                );

                renderHomepageNews(articles);

            } catch (error) {
                console.error(
                    "DESCOP category news error:",
                    error
                );

                grid.replaceChildren();

                const errorMessage =
                    document.createElement("p");

                errorMessage.textContent =
                    "Unable to load " + selectedCategory +
                    " news right now. Please try again later.";

                grid.appendChild(errorMessage);
            }
        });
    });
}
/* ==========================================
   6. NEWSLETTER FORM
   ========================================== */

function initializeNewsletter() {
    const form = document.getElementById("newsletterForm");

    if (!form) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const emailInput = form.querySelector(
            'input[type="email"]'
        );

        if (!emailInput || !emailInput.value.trim()) {
            showNotification("Please enter a valid email address.");
            return;
        }

        showNotification(
            "Newsletter registration will be enabled when the backend is connected."
        );
    });
}


/* ==========================================
   7. NOTIFICATION SYSTEM
   ========================================== */

function showNotification(message) {
    const container = document.getElementById("toastContainer");

    if (!container) {
        alert(message);
        return;
    }

    const toast = document.createElement("div");

    toast.className = "toast-message";
    toast.setAttribute("role", "status");
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}


/* ==========================================
   8. SCROLL-TO-TOP BUTTON
   ========================================== */

function initializeScrollToTop() {
    const button = document.getElementById("scrollToTop");

    if (!button) return;

    button.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    function updateButtonVisibility() {
        button.classList.toggle(
            "visible",
            window.scrollY > 350
        );
    }

    window.addEventListener(
        "scroll",
        updateButtonVisibility,
        { passive: true }
    );

    updateButtonVisibility();
}

/* ==========================================
   DESCOP WORLD PAGE JAVASCRIPT
   PART 1 OF 3
   Do not remove existing homepage JavaScript.
========================================== */

(() => {
    "use strict";

    // Run this section only on the World page.
    const worldPage = document.body;

    if (!worldPage || worldPage.dataset.page !== "world") {
        return;
    }

    // Prevent duplicate initialization.
    if (worldPage.dataset.worldJsLoaded === "true") {
        return;
    }

    worldPage.dataset.worldJsLoaded = "true";

    // World page elements.
    const worldGrid = document.getElementById("worldNewsGrid");
    const worldFilters = document.getElementById("worldNewsFilters");
    const loadMoreButton = document.getElementById("loadMoreWorldNews");
    const breakingTrack = document.getElementById("breakingNewsTrack");
    const currentDateElement = document.getElementById("currentDate");

    // Number of news cards shown at a time.
    const STORIES_PER_LOAD = 6;

    let visibleStories = STORIES_PER_LOAD;
    let activeCategory = "all";

    // World news content.
    // These are demonstration stories, not live news reports.
    const worldStories = [

        {
            id: "world-001",
            category: "politics",
            label: "WORLD POLITICS",
            title: "Global Leaders Face New Diplomatic Challenges",
            summary:
                "Governments continue to navigate international disagreements, cooperation, and changing geopolitical priorities.",
            author: "DESCOP Editorial Desk",
            date: "2026-10-24",
            readTime: "5 min read",
            image:
                "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=900&q=80"
        },

        {
            id: "world-002",
            category: "diplomacy",
            label: "DIPLOMACY",
            title: "International Cooperation Remains Central to Global Relations",
            summary:
                "Diplomatic engagement provides a framework for countries to address shared challenges and maintain communication.",
            author: "DESCOP World Desk",
            date: "2026-10-24",
            readTime: "4 min read",
            image:
                "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80"
        },

        {
            id: "world-003",
            category: "economy",
            label: "GLOBAL ECONOMY",
            title: "Economic Policy Decisions Shape International Markets",
            summary:
                "Interest rates, trade policies, and investment decisions influence economic conditions across countries.",
            author: "DESCOP Business Desk",
            date: "2026-10-24",
            readTime: "6 min read",
            image:
                "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80"
        },

        {
            id: "world-004",
            category: "security",
            label: "GLOBAL SECURITY",
            title: "International Security Cooperation Gains Attention",
            summary:
                "Cross-border partnerships play an important role in addressing security risks and regional instability.",
            author: "DESCOP Security Desk",
            date: "2026-10-24",
            readTime: "5 min read",
            image:
                "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80"
        },

        {
            id: "world-005",
            category: "politics",
            label: "WORLD POLITICS",
            title: "Elections and Public Policy Continue to Influence Governance",
            summary:
                "Political decisions and public participation remain important factors in shaping national priorities.",
            author: "DESCOP Political Desk",
            date: "2026-10-24",
            readTime: "4 min read",
            image:
                "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=900&q=80"
        },

        {
            id: "world-006",
            category: "diplomacy",
            label: "DIPLOMACY",
            title: "Regional Partnerships Offer Opportunities for Collaboration",
            summary:
                "Countries use bilateral and multilateral partnerships to pursue shared economic and diplomatic goals.",
            author: "DESCOP World Desk",
            date: "2026-10-24",
            readTime: "5 min read",
            image:
                "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80"
        },

        {
            id: "world-007",
            category: "economy",
            label: "GLOBAL ECONOMY",
            title: "Trade Relationships Remain Important to Economic Growth",
            summary:
                "International trade connects producers, consumers, and businesses across different markets.",
            author: "DESCOP Business Desk",
            date: "2026-10-24",
            readTime: "6 min read",
            image:
                "https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&w=900&q=80"
        },

        {
            id: "world-008",
            category: "security",
            label: "GLOBAL SECURITY",
            title: "Humanitarian Coordination Matters During International Crises",
            summary:
                "Cooperation among relief organizations and governments can help communities affected by emergencies.",
            author: "DESCOP Security Desk",
            date: "2026-10-24",
            readTime: "5 min read",
            image:
                "https://images.unsplash.com/photo-1489493585363-d69421e0edd3?auto=format&fit=crop&w=900&q=80"
        },

        {
            id: "world-009",
            category: "politics",
            label: "WORLD POLITICS",
            title: "Public Institutions Play a Key Role in International Affairs",
            summary:
                "Government institutions help shape policy, international engagement, and public accountability.",
            author: "DESCOP Political Desk",
            date: "2026-10-24",
            readTime: "4 min read",
            image:
                "https://images.unsplash.com/photo-1520869562399-e772f042f422?auto=format&fit=crop&w=900&q=80"
        },

        {
            id: "world-010",
            category: "economy",
            label: "GLOBAL ECONOMY",
            title: "Technology and Innovation Continue to Reshape Business",
            summary:
                "Digital services and new technologies are changing how organizations operate and compete.",
            author: "DESCOP Business Desk",
            date: "2026-10-24",
            readTime: "5 min read",
            image:
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80"
        },

        {
            id: "world-011",
            category: "diplomacy",
            label: "DIPLOMACY",
            title: "Multilateral Institutions Provide Platforms for Dialogue",
            summary:
                "International institutions give member states opportunities to discuss shared priorities and disagreements.",
            author: "DESCOP World Desk",
            date: "2026-10-24",
            readTime: "5 min read",
            image:
                "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=900&q=80"
        },

        {
            id: "world-012",
            category: "security",
            label: "GLOBAL SECURITY",
            title: "Regional Stability Depends on Multiple Factors",
            summary:
                "Economic conditions, governance, diplomacy, and local circumstances can all influence regional stability.",
            author: "DESCOP Security Desk",
            date: "2026-10-24",
            readTime: "6 min read",
            image:
                "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80"
        },

        {
            id: "world-013",
            category: "politics",
            label: "WORLD POLITICS",
            title: "International Policy Debates Highlight Competing Priorities",
            summary:
                "Countries often balance domestic interests with wider international commitments when setting policy.",
            author: "DESCOP Political Desk",
            date: "2026-10-24",
            readTime: "4 min read",
            image:
                "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80"
        },

        {
            id: "world-014",
            category: "economy",
            label: "GLOBAL ECONOMY",
            title: "Infrastructure Investment Can Support Long-Term Development",
            summary:
                "Transport, energy, and digital infrastructure can improve connectivity and economic opportunities.",
            author: "DESCOP Business Desk",
            date: "2026-10-24",
            readTime: "5 min read",
            image:
                "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=900&q=80"
        }

    ];

    // Part 2 will continue here.
        /* ==========================================
       WORLD PAGE JAVASCRIPT
       PART 2 OF 3
    ========================================== */

    // Escape text before inserting it into HTML.
    function escapeWorldText(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[character];
        });
    }

    // Format the publication date.
    function formatWorldDate(dateValue) {
        const date = new Date(dateValue + "T12:00:00");

        if (Number.isNaN(date.getTime())) {
            return "World News";
        }

        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    // Build a news card.
    function createWorldCard(story) {
        const title = escapeWorldText(story.title);
        const summary = escapeWorldText(story.summary);
        const category = escapeWorldText(story.label);
        const author = escapeWorldText(story.author);
        const date = formatWorldDate(story.date);
        const readTime = escapeWorldText(story.readTime);
        const image = escapeWorldText(story.image);
        const storyId = encodeURIComponent(story.id);

        return `
            <article
                class="news-card editorial-card"
                data-world-story="${escapeWorldText(story.id)}"
                data-category="${escapeWorldText(story.category)}"
            >
                <a
                    class="world-card-image-link"
                    href="article.html?id=${storyId}"
                    aria-label="Read ${title}"
                >
                    <img
                        src="${image}"
                        alt="${title}"
                        loading="lazy"
                        onerror="this.style.display='none'"
                    >
                </a>

                <div class="news-card-content editorial-card-content">
                    <span class="category-label">${category}</span>

                    <h3>
                        <a href="article.html?id=${storyId}">
                            ${title}
                        </a>
                    </h3>

                    <p>${summary}</p>

                    <div class="article-meta">
                        <span>${author}</span>
                        <span>${date}</span>
                        <span>${readTime}</span>
                    </div>

                    <a
                        class="world-read-more"
                        href="article.html?id=${storyId}"
                    >
                        Read Full Story →
                    </a>
                </div>
            </article>
        `;
    }

    // Select stories matching the active category.
    function getFilteredWorldStories() {
        if (activeCategory === "all") {
            return worldStories;
        }

        return worldStories.filter(story => {
            return story.category === activeCategory;
        });
    }

    // Render the World news cards.
    function renderWorldStories() {
        if (!worldGrid) {
            return;
        }

        const filteredStories = getFilteredWorldStories();
        const storiesToShow = filteredStories.slice(0, visibleStories);

        if (storiesToShow.length === 0) {
            worldGrid.innerHTML = `
                <div class="world-empty-state">
                    <h3>No stories available</h3>
                    <p>There are currently no stories in this category.</p>
                </div>
            `;
        } else {
            worldGrid.innerHTML = storiesToShow
                .map(createWorldCard)
                .join("");
        }

        // Show the Load More button only when more stories exist.
        if (loadMoreButton) {
            const hasMoreStories =
                visibleStories < filteredStories.length;

            loadMoreButton.hidden = !hasMoreStories;
        }
    }

    // Handle World page category filters.
    if (worldFilters) {
        worldFilters.addEventListener("click", event => {
            const filterButton = event.target.closest(
                "[data-world-filter]"
            );

            if (!filterButton || !worldFilters.contains(filterButton)) {
                return;
            }

            activeCategory =
                filterButton.dataset.worldFilter || "all";

            visibleStories = STORIES_PER_LOAD;

            // Update the selected filter's appearance and accessibility.
            worldFilters
                .querySelectorAll("[data-world-filter]")
                .forEach(button => {
                    const isActive = button === filterButton;

                    button.classList.toggle("active", isActive);
                    button.setAttribute(
                        "aria-pressed",
                        String(isActive)
                    );
                });

            renderWorldStories();
        });
    }

    // Load more stories without refreshing the page.
    if (loadMoreButton) {
        loadMoreButton.addEventListener("click", () => {
            visibleStories += STORIES_PER_LOAD;
            renderWorldStories();
        });
    }

    // Initial rendering.
    renderWorldStories();

    // Update the date if the page includes a current-date element.
    if (currentDateElement) {
        currentDateElement.textContent =
            new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });
    }

    // Prepare breaking-news headlines.
    if (breakingTrack) {
        const headlines = worldStories
            .slice(0, 6)
            .map(story => {
                return `
                    <span class="ticker-item">
                        <span class="ticker-label">WORLD</span>
                        ${escapeWorldText(story.title)}
                    </span>
                `;
            });

        breakingTrack.innerHTML = headlines.join("");
    }

    // Part 3 will complete the World page JavaScript.
        /* ==========================================
       WORLD PAGE JAVASCRIPT
       PART 3 OF 3
    ========================================== */

    // MOBILE NAVIGATION
    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    const mainNavigation =
        document.getElementById("mainNavigation");

    if (mobileMenuButton && mainNavigation) {
        mobileMenuButton.setAttribute("aria-expanded", "false");

        mobileMenuButton.addEventListener("click", () => {
            const isOpen =
                mainNavigation.classList.toggle("active");

            mobileMenuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            mobileMenuButton.setAttribute(
                "aria-label",
                isOpen ? "Close navigation menu" : "Open navigation menu"
            );

            mobileMenuButton.classList.toggle("active", isOpen);
        });

        // Close the menu after selecting a navigation link.
        mainNavigation.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                mainNavigation.classList.remove("active");
                mobileMenuButton.classList.remove("active");

                mobileMenuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

                mobileMenuButton.setAttribute(
                    "aria-label",
                    "Open navigation menu"
                );
            });
        });

        // Close the menu when clicking outside it.
        document.addEventListener("click", event => {
            const clickedInsideNavigation =
                mainNavigation.contains(event.target);

            const clickedMenuButton =
                mobileMenuButton.contains(event.target);

            if (!clickedInsideNavigation && !clickedMenuButton) {
                mainNavigation.classList.remove("active");
                mobileMenuButton.classList.remove("active");

                mobileMenuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        });
    }

    // BACK-TO-TOP BUTTON
    const backToTopButton =
        document.getElementById("backToTop");

    if (backToTopButton) {
        const updateBackToTopButton = () => {
            const shouldShow = window.scrollY > 400;

            backToTopButton.classList.toggle(
                "visible",
                shouldShow
            );

            backToTopButton.classList.toggle(
                "show",
                shouldShow
            );
        };

        window.addEventListener(
            "scroll",
            updateBackToTopButton,
            { passive: true }
        );

        updateBackToTopButton();

        backToTopButton.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    // SEARCH FORM
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("siteSearch");

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", event => {
            event.preventDefault();

            const query = searchInput.value.trim();

            if (!query) {
                searchInput.focus();
                return;
            }

            window.location.href =
                "index.html?search=" + encodeURIComponent(query);
        });
    }

    // NEWSLETTER FORM
    const newsletterForm =
        document.getElementById("newsletterForm");

    if (newsletterForm) {
        newsletterForm.addEventListener("submit", event => {
            event.preventDefault();

            const emailInput =
                newsletterForm.querySelector('input[type="email"]');

            if (!emailInput || !emailInput.value.trim()) {
                return;
            }

            // Frontend demonstration only.
            // A backend is required to save subscriptions.
            showWorldNotification(
                "Newsletter signup is not connected yet. Backend integration is needed."
            );

            newsletterForm.reset();
        });
    }

    // NOTIFICATION MESSAGE
    function showWorldNotification(message) {
        let toastContainer =
            document.getElementById("toastContainer");

        if (!toastContainer) {
            toastContainer = document.createElement("div");
            toastContainer.id = "toastContainer";
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement("div");

        toast.className = "toast notification-toast";
        toast.textContent = message;

        toastContainer.appendChild(toast);

        window.setTimeout(() => {
            toast.remove();
        }, 4000);
    }

    // CLEAN UP INITIAL LOADING SKELETONS IF ANY REMAIN.
    if (worldGrid) {
        worldGrid
            .querySelectorAll(".skeleton, .skeleton-card")
            .forEach(skeleton => skeleton.remove());
    }

    // WORLD PAGE INITIALIZATION COMPLETE.
    console.log("DESCOP World page JavaScript initialized.");

})(); 
/* END OF DESCOP WORLD PAGE JAVASCRIPT */

/* =====================================
   DESCOP AFRICA PAGE — PART 1
   News Data and Setup
===================================== */

(() => {
    "use strict";

    const page = document.body;

    if (!page || page.dataset.page !== "africa") {
        return;
    }

    const africaNews = [
        {
            id: "africa-001",
            title: "African Leaders Face New Regional Development Challenges",
            category: "politics",
            region: "West Africa",
            excerpt: "Regional leaders explore cooperation, economic stability and development priorities.",
            image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=900&q=80",
            date: "October 24, 2026",
            readTime: "5 min read"
        },
        {
            id: "africa-002",
            title: "African Startups Explore New Investment Opportunities",
            category: "business",
            region: "Africa",
            excerpt: "Entrepreneurs are seeking funding and partnerships to expand across African markets.",
            image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
            date: "October 24, 2026",
            readTime: "4 min read"
        },
        {
            id: "africa-003",
            title: "Technology Innovation Continues to Grow Across Africa",
            category: "technology",
            region: "East Africa",
            excerpt: "Digital services and emerging technology are creating new opportunities for businesses.",
            image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
            date: "October 23, 2026",
            readTime: "6 min read"
        },
        {
            id: "africa-004",
            title: "African Creators Bring Local Stories to Global Audiences",
            category: "culture",
            region: "West Africa",
            excerpt: "Film, music, fashion and digital media continue to showcase the continent's creativity.",
            image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
            date: "October 23, 2026",
            readTime: "4 min read"
        },
        {
            id: "africa-005",
            title: "African Sports Talent Draws Growing International Attention",
            category: "sports",
            region: "Africa",
            excerpt: "Athletes and sporting programmes continue to build recognition across competitions.",
            image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80",
            date: "October 22, 2026",
            readTime: "5 min read"
        },
        {
            id: "africa-006",
            title: "Regional Trade Remains Important to African Economies",
            category: "business",
            region: "Southern Africa",
            excerpt: "Businesses are looking for ways to improve trade, transport and cross-border commerce.",
            image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
            date: "October 22, 2026",
            readTime: "5 min read"
        },
        {
            id: "africa-007",
            title: "African Cities Explore Smarter Urban Infrastructure",
            category: "technology",
            region: "North Africa",
            excerpt: "Urban planners are exploring digital infrastructure and more efficient public services.",
            image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=900&q=80",
            date: "October 21, 2026",
            readTime: "6 min read"
        },
        {
            id: "africa-008",
            title: "Cultural Heritage Remains Central to African Identity",
            category: "culture",
            region: "Central Africa",
            excerpt: "Communities continue to preserve languages, traditions, art and historical landmarks.",
            image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=900&q=80",
            date: "October 21, 2026",
            readTime: "4 min read"
        },
        {
            id: "africa-009",
            title: "Youth Entrepreneurship Shapes Africa's Economic Future",
            category: "business",
            region: "West Africa",
            excerpt: "Young founders are building businesses in agriculture, commerce and digital services.",
            image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80",
            date: "October 20, 2026",
            readTime: "5 min read"
        },
        {
            id: "africa-010",
            title: "Conservation Efforts Focus on Africa's Natural Heritage",
            category: "environment",
            region: "East Africa",
            excerpt: "Conservation programmes seek to protect wildlife, ecosystems and local livelihoods.",
            image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=900&q=80",
            date: "October 20, 2026",
            readTime: "5 min read"
        },
                {
            id: "africa-011",
            title: "African Education Initiatives Explore Digital Learning",
            category: "education",
            region: "Africa",
            excerpt: "Digital learning initiatives aim to expand access to educational resources.",
            image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
            date: "October 19, 2026",
            readTime: "4 min read"
        },
        {
            id: "africa-012",
            title: "Agriculture Remains Vital to African Communities",
            category: "business",
            region: "Central Africa",
            excerpt: "Farmers and agricultural businesses are exploring ways to improve production.",
            image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80",
            date: "October 19, 2026",
            readTime: "5 min read"
        }
    ];

    /* NEWS GRID SETUP */

    const newsGrid = document.getElementById("africaNewsGrid");
    const filterButtons = document.querySelectorAll(
        "[data-africa-filter]"
    );
    const loadMoreButton = document.getElementById(
        "loadMoreAfricaNews"
    );

    let activeCategory = "all";
    let visibleNewsCount = 6;
    const newsPerLoad = 3;

    /* SAFE HTML TEXT */

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    /* CREATE NEWS CARDS */

    function createAfricaNewsCard(story) {
        const title = escapeHTML(story.title);
        const category = escapeHTML(story.category);
        const region = escapeHTML(story.region);
        const excerpt = escapeHTML(story.excerpt);
        const date = escapeHTML(story.date);
        const readTime = escapeHTML(story.readTime);
        const image = escapeHTML(story.image);
        const id = encodeURIComponent(story.id);

        return `
            <article class="news-card africa-news-card">
                <a
                    class="news-card-image"
                    href="article.html?id=${id}"
                    aria-label="Read ${title}"
                >
                    <img
                        src="${image}"
                        alt="${title}"
                        loading="lazy"
                    >
                    <span class="news-category">
                        ${category}
                    </span>
                </a>

                <div class="news-card-content">
                    <span class="news-region">
                        ${region}
                    </span>

                    <h3>
                        <a href="article.html?id=${id}">
                            ${title}
                        </a>
                    </h3>

                    <p>${excerpt}</p>

                    <div class="news-card-meta">
                        <span>${date}</span>
                        <span>${readTime}</span>
                    </div>

                    <a
                        class="read-more"
                        href="article.html?id=${id}"
                    >
                        Read story →
                    </a>
                </div>
            </article>
        `;
    }

    /* FILTER NEWS */

    function getFilteredAfricaNews() {
        if (activeCategory === "all") {
            return africaNews;
        }

        return africaNews.filter(story =>
            story.category === activeCategory
        );
    }

    /* UPDATE LOAD MORE BUTTON */

    function updateLoadMoreButton(totalStories) {
        if (!loadMoreButton) return;

        const hasMore = visibleNewsCount < totalStories;

        loadMoreButton.hidden = !hasMore;

        if (hasMore) {
            loadMoreButton.textContent = "Load More Stories";
        }
    }

    /* PART 3 CONTINUES BELOW */
    /* =====================================
   AFRICA JAVASCRIPT — PART 3
   Rendering, Filters and Load More
===================================== */

/* RENDER NEWS */

function renderAfricaNews() {
    if (!newsGrid) return;

    const filteredNews = getFilteredAfricaNews();
    const visibleStories = filteredNews.slice(0, visibleNewsCount);

    if (visibleStories.length === 0) {
        newsGrid.innerHTML = `
            <p class="africa-empty-state">
                No stories available in this category yet.
            </p>
        `;
    } else {
        newsGrid.innerHTML = visibleStories
            .map(createAfricaNewsCard)
            .join("");
    }

    updateLoadMoreButton(filteredNews.length);
}

/* FILTER BUTTON EVENTS */

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        activeCategory =
            button.dataset.africaFilter || "all";

        visibleNewsCount = 6;

        filterButtons.forEach(item => {
            const isActive = item === button;

            item.classList.toggle("active", isActive);
            item.setAttribute(
                "aria-pressed",
                String(isActive)
            );
        });

        renderAfricaNews();
    });
});

/* LOAD MORE STORIES */

if (loadMoreButton) {
    loadMoreButton.addEventListener("click", () => {
        visibleNewsCount += newsPerLoad;
        renderAfricaNews();
    });
}

/* INITIAL NEWS RENDER */

renderAfricaNews();

/* NEWS IMAGE FALLBACK */

if (newsGrid) {
    newsGrid.addEventListener("error", event => {
        if (event.target.tagName === "IMG") {
            event.target.style.display = "none";
        }
    }, true);
}

/* PART 4 CONTINUES BELOW */
/* =====================================
   AFRICA JAVASCRIPT — PART 4
   Date, Navigation and Newsletter
===================================== */

/* CURRENT DATE */

const dateElement = document.getElementById("currentDate");

if (dateElement) {
    dateElement.textContent = new Intl.DateTimeFormat(
        "en-NG",
        {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    ).format(new Date());
}

/* CURRENT YEAR */

const yearElement = document.getElementById("currentYear");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

/* MOBILE NAVIGATION */

const mobileMenuButton = document.querySelector(
    ".mobile-menu-button"
);

const mainNavigation = document.querySelector(
    ".main-navigation"
);

if (mobileMenuButton && mainNavigation) {
    mobileMenuButton.addEventListener("click", () => {
        const isOpen = mainNavigation.classList.toggle("open");

        mobileMenuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });

    mainNavigation.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            mainNavigation.classList.remove("open");

            mobileMenuButton.setAttribute(
                "aria-expanded",
                "false"
            );
        });
    });
}

/* BACK TO TOP */

const backToTopButton = document.getElementById("backToTop");

if (backToTopButton) {
    window.addEventListener("scroll", () => {
        backToTopButton.classList.toggle(
            "visible",
            window.scrollY > 400
        );
    });

    backToTopButton.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

/* NEWSLETTER FEEDBACK */

const newsletterForm = document.getElementById("newsletterForm");
const newsletterEmail = document.getElementById("newsletterEmail");
const newsletterFeedback = document.getElementById(
    "newsletterFeedback"
);

if (newsletterForm) {
    newsletterForm.addEventListener("submit", event => {
        event.preventDefault();

        const email = newsletterEmail
            ? newsletterEmail.value.trim()
            : "";

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            if (newsletterFeedback) {
                newsletterFeedback.textContent =
                    "Please enter a valid email address.";

                newsletterFeedback.setAttribute(
                    "role",
                    "alert"
                );
            }

            return;
        }

        if (newsletterFeedback) {
            newsletterFeedback.textContent =
                "Thanks for subscribing! Newsletter delivery will be available once the service is connected.";

            newsletterFeedback.setAttribute(
                "role",
                "status"
            );
        }

        newsletterForm.reset();
    });
}

/* AFRICA PAGE INITIALIZATION COMPLETE */

console.log("DESCOP Africa page initialized successfully.");

})();

/* =====================================
   DESCOP NIGERIA PAGE
   PART 1 — SETUP & NEWS DATA
===================================== */

(() => {
    const page = document.body;

    if (!page || page.dataset.page !== "nigeria") {
        return;
    }

    const latestGrid = document.getElementById("latestGrid");
    const filters = document.getElementById("newsFilters");
    const loadMoreButton = document.getElementById("loadMoreNews");

    const nigeriaStories = [
        {
            category: "politics",
            title: "Nigeria's Political Landscape: Key Developments",
            summary: "Follow major political decisions, governance updates and national policy discussions.",
            icon: "🏛",
            date: "National Desk"
        },
        {
            category: "business",
            title: "Markets and Businesses Watch Economic Changes",
            summary: "Explore developments affecting businesses, trade and the Nigerian economy.",
            icon: "₦",
            date: "Business Desk"
        },
        {
            category: "security",
            title: "Security Agencies Address National Challenges",
            summary: "Updates on public safety, security operations and community protection.",
            icon: "🛡",
            date: "Security Desk"
        },
        {
            category: "technology",
            title: "Nigeria's Technology Sector Continues to Evolve",
            summary: "Discover developments in digital services, startups and technological innovation.",
            icon: "⌘",
            date: "Technology Desk"
        },
        {
            category: "society",
            title: "Communities Respond to Social Challenges",
            summary: "Stories covering education, healthcare, communities and everyday life.",
            icon: "◎",
            date: "Society Desk"
        },
        {
            category: "politics",
            title: "Policy Discussions Shape National Priorities",
            summary: "A closer look at policy debates and their potential impact on citizens.",
            icon: "⚖",
            date: "Politics Desk"
        },
        {
            category: "business",
            title: "Small Businesses Explore New Opportunities",
            summary: "Nigerian entrepreneurs seek ways to adapt, grow and reach new customers.",
            icon: "↗",
            date: "Business Desk"
        },
        {
            category: "security",
            title: "Communities Prioritise Public Safety",
            summary: "Local initiatives highlight the importance of cooperation and prevention.",
            icon: "◈",
            date: "Security Desk"
        },
        {
            category: "technology",
            title: "Digital Innovation Opens New Possibilities",
            summary: "Emerging digital tools are creating opportunities for Nigerian creators.",
            icon: "⌘",
            date: "Technology Desk"
        }
    ];

    let activeFilter = "all";
    let visibleStories = 6;

    // More Nigeria page code continues in Part 2.
    /* PART 2 — NEWS CARD FUNCTIONS */

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function createNewsCard(story, index) {
        return `
            <article class="news-card">
                <div class="news-card-visual">
                    ${escapeHTML(story.icon)}
                </div>

                <div class="news-card-content">
                    <div class="article-meta">
                        <span class="category-label">
                            ${escapeHTML(story.category)}
                        </span>
                        <span class="meta-separator">•</span>
                        <span>${escapeHTML(story.date)}</span>
                    </div>

                    <h3>
                        <a href="article.html?id=nigeria-${index + 1}">
                            ${escapeHTML(story.title)}
                        </a>
                    </h3>

                    <p>${escapeHTML(story.summary)}</p>

                    <div class="article-footer">
                        <a href="article.html?id=nigeria-${index + 1}">
                            Read Story →
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    function getFilteredStories() {
        if (activeFilter === "all") {
            return nigeriaStories;
        }

        return nigeriaStories.filter(story =>
            story.category === activeFilter
        );
    }

    function updateLoadMoreButton(filteredStories) {
        if (!loadMoreButton) return;

        loadMoreButton.hidden =
            visibleStories >= filteredStories.length;
    }

    // Rendering continues in Part 3.
    /* PART 3 — RENDERING & FILTERS */

    function renderNigeriaNews() {
        if (!latestGrid) return;

        const filteredStories = getFilteredStories();
        const storiesToShow = filteredStories.slice(0, visibleStories);

        latestGrid.innerHTML = storiesToShow.length
            ? storiesToShow.map((story, index) =>
                createNewsCard(story, index)
            ).join("")
            : "<p>No stories found in this category.</p>";

        updateLoadMoreButton(filteredStories);
    }

    if (filters) {
        filters.addEventListener("click", event => {
            const button = event.target.closest("[data-filter]");

            if (!button || !filters.contains(button)) return;

            activeFilter = button.dataset.filter || "all";
            visibleStories = 6;

            filters.querySelectorAll("[data-filter]").forEach(item => {
                item.classList.toggle("active", item === button);
                item.setAttribute(
                    "aria-pressed",
                    item === button ? "true" : "false"
                );
            });

            renderNigeriaNews();
        });
    }

    if (loadMoreButton) {
        loadMoreButton.addEventListener("click", () => {
            visibleStories += 3;
            renderNigeriaNews();
        });
    }

    renderNigeriaNews();

    // Navigation continues in Part 4.
    /* PART 4 — MOBILE MENU & BACK TO TOP */

    const menuButton = document.getElementById("mobileMenuButton");
    const navigation = document.getElementById("mainNavigation");
    const backToTop = document.getElementById("backToTop");

    if (menuButton && navigation) {
        menuButton.addEventListener("click", () => {
            const isOpen = navigation.classList.toggle("open");

            menuButton.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );
        });

        navigation.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navigation.classList.remove("open");
                menuButton.setAttribute("aria-expanded", "false");
            });
        });
    }

    function updateBackToTop() {
        if (!backToTop) return;

        backToTop.classList.toggle(
            "visible",
            window.scrollY > 400
        );
    }

    window.addEventListener("scroll", updateBackToTop, {
        passive: true
    });

    updateBackToTop();

    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    // Newsletter and page setup continue in Part 5.
    /* PART 5 — NEWSLETTER & PAGE SETUP */

    const newsletterForm = document.getElementById("newsletterForm");
    const newsletterMessage = document.getElementById("newsletterMessage");
    const footerYear = document.getElementById("footerYear");
    const currentDate = document.getElementById("currentDate");

    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }

    if (currentDate) {
        currentDate.textContent = new Date().toLocaleDateString(
            "en-NG",
            {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
    }

    if (newsletterForm) {
        newsletterForm.addEventListener("submit", event => {
            event.preventDefault();

            const emailInput = document.getElementById("newsletterEmail");

            if (!emailInput || !emailInput.checkValidity()) {
                if (emailInput) emailInput.reportValidity();
                return;
            }

            if (newsletterMessage) {
                newsletterMessage.textContent =
                    "Thanks for your interest! Newsletter subscriptions will be available when the backend is connected.";
            }

            newsletterForm.reset();
        });
    }

    // Search handling and final setup continue in Part 6.
    /* PART 6 — SEARCH & FINAL SETUP */

    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("siteSearch");

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", event => {
            event.preventDefault();

            const query = searchInput.value.trim();

            if (!query) {
                searchInput.focus();
                return;
            }

            window.location.href =
                "search.html?q=" + encodeURIComponent(query);
        });
    }

    const toastContainer =
        document.getElementById("toastContainer");

    if (toastContainer) {
        toastContainer.setAttribute("aria-live", "polite");
    }

    // Close the Nigeria page script.
})();

/* =================================
   DESCOP BUSINESS PAGE — PART 1
================================= */

(() => {
    const page = document.body;

    if (!page || page.dataset.page !== "business") {
        return;
    }

    // PAGE LOADER
    const loader = document.querySelector(".page-loader");

    function hideLoader() {
        if (loader) {
            loader.classList.add("hidden");
        }
    }

    window.addEventListener("load", hideLoader);
    setTimeout(hideLoader, 2500);

    // CURRENT DATE
    const dateElement = document.getElementById("currentDate");

    if (dateElement) {
        dateElement.textContent =
            new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
    }

    // CURRENT YEAR
    const yearElement = document.getElementById("currentYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // MOBILE NAVIGATION
    const menuButton = document.getElementById("mobileMenuButton");
    const navigation = document.getElementById("mainNavigation");

    if (menuButton && navigation) {
        menuButton.addEventListener("click", () => {
            const isOpen = navigation.classList.toggle("open");

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });

        navigation.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navigation.classList.remove("open");
                menuButton.setAttribute("aria-expanded", "false");
            });
        });
    }

})();
/* =================================
   BUSINESS PAGE — PART 2
   NEWS FILTERS AND CARDS
================================= */

(() => {
    const page = document.body;

    if (!page || page.dataset.page !== "business") return;

    const newsGrid = document.getElementById("latestGrid");
    const filters = document.querySelectorAll(
        "#newsFilters [data-filter]"
    );
    const loadMoreButton = document.getElementById("loadMoreNews");

    if (!newsGrid) return;

    // SAMPLE EDITORIAL TOPICS — NOT LIVE NEWS
    const businessStories = [
        {
            category: "markets",
            label: "MARKETS",
            title: "Understanding Market Movements",
            description: "Explore the factors that influence financial markets.",
            date: "Market Analysis"
        },
        {
            category: "companies",
            label: "COMPANIES",
            title: "How Businesses Build Strong Brands",
            description: "Discover strategies for building customer trust.",
            date: "Business Guide"
        },
        {
            category: "startups",
            label: "STARTUPS",
            title: "Starting a Business on a Budget",
            description: "Practical considerations for new entrepreneurs.",
            date: "Entrepreneurship"
        },
        {
            category: "economy",
            label: "ECONOMY",
            title: "Understanding Inflation",
            description: "Learn how changing prices affect households and businesses.",
            date: "Economic Guide"
        },
        {
            category: "energy",
            label: "ENERGY",
            title: "Energy and Business Growth",
            description: "Explore how energy costs affect business operations.",
            date: "Industry Insight"
        },
        {
            category: "markets",
            label: "FINANCE",
            title: "Managing Financial Risk",
            description: "Key principles for making informed financial decisions.",
            date: "Finance Guide"
        }
    ];

    let activeFilter = "all";
    let visibleCount = 4;

    function renderStories() {
        const filteredStories = activeFilter === "all"
            ? businessStories
            : businessStories.filter(
                story => story.category === activeFilter
            );

        const visibleStories = filteredStories.slice(0, visibleCount);

        newsGrid.innerHTML = visibleStories.map(story => `
            <article class="news-card">
                <div class="news-card-image">
                    <span>${story.label}</span>
                </div>

                <div class="news-card-content">
                    <span class="news-category">
                        ${story.label}
                    </span>

                    <h3>${story.title}</h3>

                    <p>${story.description}</p>

                    <span class="news-date">
                        ${story.date}
                    </span>
                </div>
            </article>
        `).join("");

        if (loadMoreButton) {
            loadMoreButton.hidden =
                visibleCount >= filteredStories.length;
        }
    }

    filters.forEach(button => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.filter;
            visibleCount = 4;

            filters.forEach(item => {
                item.classList.toggle(
                    "active",
                    item === button
                );
            });

            renderStories();
        });
    });

    if (loadMoreButton) {
        loadMoreButton.addEventListener("click", () => {
            visibleCount += 2;
            renderStories();
        });
    }

    renderStories();

})();
/* =================================
   BUSINESS PAGE — PART 3
   SEARCH + NEWSLETTER + SCROLL
================================= */

(() => {
    const page = document.body;

    if (!page || page.dataset.page !== "business") return;

    // SEARCH
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("siteSearch");

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", event => {
            event.preventDefault();

            const query = searchInput.value.trim();

            if (query) {
                window.location.href =
                    "search.html?q=" + encodeURIComponent(query);
            }
        });
    }

    // NEWSLETTER — DEMO ONLY
    const newsletterForm =
        document.getElementById("newsletterForm");

    const newsletterEmail =
        document.getElementById("newsletterEmail");

    const newsletterFeedback =
        document.getElementById("newsletterFeedback");

    if (newsletterForm) {
        newsletterForm.addEventListener("submit", event => {
            event.preventDefault();

            if (!newsletterEmail || !newsletterFeedback) return;

            const email = newsletterEmail.value.trim();

            if (!newsletterEmail.checkValidity()) {
                newsletterFeedback.textContent =
                    "Please enter a valid email address.";
                return;
            }

            newsletterFeedback.textContent =
                "Demo only: newsletter signup is not connected yet.";

            newsletterForm.reset();
        });
    }

    // SCROLL TO TOP
    const topButton = document.getElementById("scrollToTop");

    if (topButton) {
        window.addEventListener("scroll", () => {
            topButton.classList.toggle(
                "visible",
                window.scrollY > 400
            );
        });

        topButton.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

})();
/* =================================
   BUSINESS PAGE — PART 4
   NAVIGATION + SMOOTH SCROLL
================================= */

(() => {
    const page = document.body;

    if (!page || page.dataset.page !== "business") return;

    // SMOOTH SCROLL FOR SECTION LINKS
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", event => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (target) {
                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

                history.replaceState(null, "", targetId);
            }
        });
    });

    // HIGHLIGHT THE CURRENT NAVIGATION LINK
    const sections = document.querySelectorAll(
        "main section[id]"
    );

    const navLinks = document.querySelectorAll(
        "#mainNavigation a[href^='#']"
    );

    if ("IntersectionObserver" in window && sections.length) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                navLinks.forEach(link => {
                    const isActive =
                        link.getAttribute("href") ===
                        "#" + entry.target.id;

                    link.classList.toggle("active", isActive);

                    if (isActive) {
                        link.setAttribute("aria-current", "location");
                    } else {
                        link.removeAttribute("aria-current");
                    }
                });
            });
        }, {
            rootMargin: "-20% 0px -65% 0px"
        });

        sections.forEach(section => observer.observe(section));
    }

})();

/* ==========================================
   DESCOP TECHNOLOGY PAGE
   PART 1: LOADER, DATE, MOBILE MENU & SEARCH
========================================== */

(() => {
    const page = document.body;

    if (!page || page.dataset.page !== "technology") {
        return;
    }

    // PAGE LOADER
    const loader = document.getElementById("pageLoader");

    function hideLoader() {
        if (loader) {
            loader.classList.add("loaded");

            setTimeout(() => {
                loader.style.display = "none";
            }, 500);
        }
    }

    window.addEventListener("load", hideLoader);
    setTimeout(hideLoader, 2500);


    // CURRENT DATE
    const dateElement = document.getElementById("currentDate");

    if (dateElement) {
        dateElement.textContent = new Intl.DateTimeFormat("en-NG", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        }).format(new Date());
    }


    // MOBILE NAVIGATION
    const menuButton = document.getElementById("mobileMenuButton");
    const navigation = document.getElementById("mainNavigation");

    if (menuButton && navigation) {
        menuButton.addEventListener("click", () => {
            const isOpen = navigation.classList.toggle("active");

            menuButton.setAttribute("aria-expanded", String(isOpen));
            menuButton.setAttribute(
                "aria-label",
                isOpen ? "Close navigation menu" : "Open navigation menu"
            );
        });

        navigation.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navigation.classList.remove("active");
                menuButton.setAttribute("aria-expanded", "false");
                menuButton.setAttribute("aria-label", "Open navigation menu");
            });
        });

        document.addEventListener("click", event => {
            if (
                !navigation.contains(event.target) &&
                !menuButton.contains(event.target)
            ) {
                navigation.classList.remove("active");
                menuButton.setAttribute("aria-expanded", "false");
                menuButton.setAttribute("aria-label", "Open navigation menu");
            }
        });
    }


    // HEADER SEARCH
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("siteSearch");

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", event => {
            event.preventDefault();

            const query = searchInput.value.trim();

            if (!query) {
                searchInput.focus();
                return;
            }

            window.location.href =
                "search.html?q=" + encodeURIComponent(query);
        });
    }


    // BACK TO TOP
    const backToTop = document.getElementById("backToTop");

    if (backToTop) {
        window.addEventListener("scroll", () => {
            backToTop.classList.toggle(
                "visible",
                window.scrollY > 400
            );
        }, { passive: true });

        backToTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

})();

/* PART 2 CONTINUES BELOW */
/* ==========================================
   PART 2: NEWS FILTERS, LOAD MORE & NEWSLETTER
========================================== */

(() => {
    const page = document.body;

    if (!page || page.dataset.page !== "technology") {
        return;
    }

    // TECHNOLOGY NEWS FILTERS
    const filterButtons = document.querySelectorAll(
        "#newsFilters button"
    );

    const newsCards = document.querySelectorAll(
        "#latestGrid .news-card"
    );

    const loadMoreButton = document.getElementById("loadMoreNews");

    let activeFilter = "all";
    let visibleCount = 6;

    function updateNews() {
        let matchingCards = [];

        newsCards.forEach(card => {
            const category = (
                card.dataset.category || ""
            ).toLowerCase();

            const matchesFilter =
                activeFilter === "all" ||
                category === activeFilter;

            if (matchesFilter) {
                matchingCards.push(card);
            }

            card.hidden = true;
        });

        matchingCards.forEach((card, index) => {
            card.hidden = index >= visibleCount;
        });

        if (loadMoreButton) {
            loadMoreButton.hidden =
                matchingCards.length <= visibleCount;
        }
    }

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            activeFilter = (
                button.dataset.filter || "all"
            ).toLowerCase();

            visibleCount = 6;

            filterButtons.forEach(item => {
                const isActive = item === button;

                item.classList.toggle("active", isActive);
                item.setAttribute(
                    "aria-pressed",
                    String(isActive)
                );
            });

            updateNews();
        });
    });

    if (loadMoreButton) {
        loadMoreButton.addEventListener("click", () => {
            visibleCount += 6;
            updateNews();
        });
    }

    updateNews();


    // NEWSLETTER FORM
    const newsletterForm = document.getElementById(
        "newsletterForm"
    );

    const newsletterEmail = document.getElementById(
        "newsletterEmail"
    );

    const newsletterMessage = document.getElementById(
        "newsletterMessage"
    );

    if (
        newsletterForm &&
        newsletterEmail &&
        newsletterMessage
    ) {
        newsletterForm.addEventListener("submit", event => {
            event.preventDefault();

            const email = newsletterEmail.value.trim();

            if (!email || !newsletterEmail.checkValidity()) {
                newsletterMessage.textContent =
                    "Please enter a valid email address.";

                newsletterMessage.style.color = "#ff8585";
                newsletterEmail.focus();
                return;
            }

            newsletterMessage.textContent =
                "Thanks for your interest! Newsletter subscriptions are not connected yet.";

            newsletterMessage.style.color = "#d6b56d";

            newsletterForm.reset();
        });
    }


    // TOAST NOTIFICATION HELPER
    const toastContainer = document.getElementById(
        "toastContainer"
    );

    function showTechnologyToast(message) {
        if (!toastContainer) {
            return;
        }

        const toast = document.createElement("div");

        toast.className = "toast";
        toast.textContent = message;
        toast.setAttribute("role", "status");

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3500);
    }

    // Make the helper available to other technology scripts.
    window.showTechnologyToast = showTechnologyToast;

})();

/* PART 3 CONTINUES BELOW */
/* ==========================================
   PART 3: SMOOTH SCROLL & ACTIVE NAVIGATION
========================================== */

(() => {
    const page = document.body;

    if (!page || page.dataset.page !== "technology") {
        return;
    }

    // SMOOTH SCROLL FOR INTERNAL LINKS
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", event => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (target) {
                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

                // Update the URL hash without jumping.
                history.replaceState(null, "", targetId);
            }
        });
    });


    // ACTIVE SECTION NAVIGATION
    const navigationLinks = document.querySelectorAll(
        '#mainNavigation a[href^="#"]'
    );

    const pageSections = document.querySelectorAll(
        "main section[id]"
    );

    if ("IntersectionObserver" in window && pageSections.length) {
        const sectionObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    const sectionId = entry.target.id;

                    navigationLinks.forEach(link => {
                        const isActive =
                            link.getAttribute("href") ===
                            "#" + sectionId;

                        link.classList.toggle("active", isActive);

                        if (isActive) {
                            link.setAttribute("aria-current", "location");
                        } else {
                            link.removeAttribute("aria-current");
                        }
                    });
                });
            },
            {
                rootMargin: "-20% 0px -65% 0px",
                threshold: 0
            }
        );

        pageSections.forEach(section => {
            sectionObserver.observe(section);
        });
    }


    // FOOTER YEAR
    const yearElement = document.getElementById("currentYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }


    // PREVENT EMPTY LINKS FROM JUMPING TO THE TOP
    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
        });
    });

})();

/* ==========================================
   TECHNOLOGY JAVASCRIPT COMPLETE
========================================== */

/* ==========================================
DESCOP ENTERTAINMENT PAGE — JAVASCRIPT
PART 1: CORE FUNCTIONALITY
========================================== */

(() => {
"use strict";

if (document.body.dataset.page !== "entertainment") return;

// Hide page loader
const loader = document.getElementById("pageLoader");

if (loader) {
    window.addEventListener("load", () => {
        loader.classList.add("hidden");
        loader.style.opacity = "0";

        setTimeout(() => {
            loader.style.display = "none";
        }, 500);
    });

    // Fallback in case the load event has already fired
    if (document.readyState === "complete") {
        loader.classList.add("hidden");
        loader.style.opacity = "0";
        setTimeout(() => {
            loader.style.display = "none";
        }, 500);
    }
}

// Display current date
const currentDate = document.getElementById("currentDate");

if (currentDate) {
    currentDate.textContent = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    }).format(new Date());
}

// Update footer year
const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

// Mobile navigation
const menuButton = document.getElementById("mobileMenuButton");
const navigation = document.getElementById("mainNavigation");

if (menuButton && navigation) {
    menuButton.setAttribute("aria-expanded", "false");

    menuButton.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("active");

        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );
    });

    navigation.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navigation.classList.remove("active");
            menuButton.setAttribute("aria-expanded", "false");
            menuButton.setAttribute("aria-label", "Open navigation menu");
        });
    });
}

// Website search
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("siteSearch");

if (searchForm && searchInput && !searchForm.dataset.entertainmentBound) {
    searchForm.dataset.entertainmentBound = "true";

    searchForm.addEventListener("submit", event => {
        event.preventDefault();

        const query = searchInput.value.trim();

        if (!query) {
            searchInput.focus();
            return;
        }

        window.location.href =
            "search.html?q=" + encodeURIComponent(query);
    });
}

// Back-to-top button
const backToTop = document.getElementById("backToTop");

if (backToTop) {
    const updateBackToTop = () => {
        backToTop.classList.toggle("visible", window.scrollY > 350);
    };

    window.addEventListener("scroll", updateBackToTop, {
        passive: true
    });

    updateBackToTop();

    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

})();
/* ==========================================
DESCOP ENTERTAINMENT PAGE — JAVASCRIPT
PART 2: NEWS FILTERS & NEWSLETTER
========================================== */

(() => {
"use strict";

if (document.body.dataset.page !== "entertainment") return;

// NEWS CATEGORY FILTERS
const filterContainer = document.getElementById("newsFilters");
const newsGrid = document.getElementById("latestGrid");

if (filterContainer && newsGrid) {
    const filterButtons =
        filterContainer.querySelectorAll("[data-filter]");

    const newsCards = newsGrid.querySelectorAll(".news-card");

    filterButtons.forEach(button => {
        button.setAttribute("aria-pressed", "false");

        button.addEventListener("click", () => {
            const selectedCategory = button.dataset.filter;

            filterButtons.forEach(filterButton => {
                const isActive = filterButton === button;

                filterButton.classList.toggle("active", isActive);
                filterButton.setAttribute(
                    "aria-pressed",
                    String(isActive)
                );
            });

            newsCards.forEach(card => {
                const cardCategory = card.dataset.category;

                const shouldShow =
                    selectedCategory === "all" ||
                    cardCategory === selectedCategory;

                card.hidden = !shouldShow;
            });
        });
    });

    // Activate the "All" filter by default
    const allButton = filterContainer.querySelector(
        '[data-filter="all"]'
    );

    if (allButton) {
        allButton.classList.add("active");
        allButton.setAttribute("aria-pressed", "true");
    }
}

// TOAST NOTIFICATIONS
const toastContainer = document.getElementById("toastContainer");

function showToast(message) {
    if (!toastContainer) return;

    const toast = document.createElement("div");

    toast.className = "toast-message";
    toast.textContent = message;
    toast.setAttribute("role", "status");

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("visible");
    });

    setTimeout(() => {
        toast.classList.remove("visible");

        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

// NEWSLETTER FORM
const newsletterForm = document.getElementById("newsletterForm");
const newsletterEmail = document.getElementById("newsletterEmail");
const newsletterMessage =
    document.getElementById("newsletterMessage");

if (newsletterForm && newsletterEmail) {
    newsletterForm.addEventListener("submit", event => {
        event.preventDefault();

        const email = newsletterEmail.value.trim();

        if (!email || !newsletterEmail.checkValidity()) {
            newsletterEmail.reportValidity();
            return;
        }

        const message =
            "The newsletter service isn't connected yet. " +
            "Your email hasn't been saved.";

        if (newsletterMessage) {
            newsletterMessage.textContent = message;
            newsletterMessage.setAttribute("role", "status");
        }

        showToast(
            "Newsletter signup isn't available yet. No subscription was saved."
        );
    });
}

})();
/* ==========================================
DESCOP ENTERTAINMENT PAGE — JAVASCRIPT
PART 3: SMOOTH SCROLLING & NAVIGATION
========================================== */

(() => {
"use strict";

if (document.body.dataset.page !== "entertainment") return;

// Smooth scrolling for links to sections on this page
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
        const href = link.getAttribute("href");

        if (!href || href === "#") return;

        const target = document.querySelector(href);

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        // Update the URL hash without jumping
        if (window.location.hash !== href) {
            history.pushState(null, "", href);
        }
    });
});

// Keep section headings visible below a sticky header
document.querySelectorAll(
    "#latest, #music, #afrobeats, #film, #celebrity, #culture, #analysis, #newsletter"
).forEach(section => {
    section.style.scrollMarginTop = "100px";
});

// Make external links safer
document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.setAttribute("rel", "noopener noreferrer");
});

// Prevent empty newsletter submissions from appearing successful
const newsletterForm = document.getElementById("newsletterForm");

if (newsletterForm) {
    newsletterForm.setAttribute("novalidate", "false");
}

console.log("DESCOP Entertainment page initialized successfully.");

})();

/* =========================================
DESCOP SPORTS — JAVASCRIPT PART 1
PAGE SETUP, LOADER, DATE & NAVIGATION
========================================= */

(() => {
"use strict";

if (document.body.dataset.page !== "sports") return;

// PAGE LOADER
const pageLoader = document.getElementById("pageLoader");

function hidePageLoader() {
    if (pageLoader) {
        pageLoader.classList.add("hidden");
        pageLoader.setAttribute("aria-hidden", "true");
    }
}

window.addEventListener("load", hidePageLoader);
setTimeout(hidePageLoader, 2500);

// CURRENT DATE
const currentDate = document.getElementById("currentDate");

if (currentDate) {
    currentDate.textContent = new Intl.DateTimeFormat("en-NG", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(new Date());
}

// CURRENT YEAR
const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

// MOBILE NAVIGATION
const mobileMenuButton = document.getElementById("mobileMenuButton");
const mainNavigation = document.getElementById("mainNavigation");

if (mobileMenuButton && mainNavigation) {
    mobileMenuButton.addEventListener("click", () => {
        const isOpen = mainNavigation.classList.toggle("active");

        mobileMenuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });

    mainNavigation.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            mainNavigation.classList.remove("active");
            mobileMenuButton.setAttribute("aria-expanded", "false");
        });
    });
}

// SEARCH FORM
const searchForm = document.getElementById("searchForm");
const siteSearch = document.getElementById("siteSearch");

if (searchForm && siteSearch) {
    searchForm.addEventListener("submit", event => {
        event.preventDefault();

        const query = siteSearch.value.trim();

        if (!query) {
            siteSearch.focus();
            return;
        }

        window.location.href =
            "search.html?q=" + encodeURIComponent(query);
    });
}

// BACK TO TOP
const backToTop = document.getElementById("backToTop");

if (backToTop) {
    const updateBackToTop = () => {
        backToTop.classList.toggle(
            "visible",
            window.scrollY > 450
        );
    };

    window.addEventListener("scroll", updateBackToTop, {
        passive: true
    });

    updateBackToTop();

    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

})();
/* =========================================
DESCOP SPORTS — JAVASCRIPT PART 2
NEWS FILTERS & NEWSLETTER
========================================= */

(() => {
"use strict";

if (document.body.dataset.page !== "sports") return;

// SPORTS NEWS FILTERS
const newsFilters = document.getElementById("newsFilters");
const latestGrid = document.getElementById("latestGrid");

if (newsFilters && latestGrid) {
    const filterButtons = newsFilters.querySelectorAll("[data-filter]");
    const newsCards = latestGrid.querySelectorAll(".news-card");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const selectedFilter = button.dataset.filter;

            // Update active button
            filterButtons.forEach(item => {
                item.classList.remove("active");
                item.setAttribute("aria-pressed", "false");
            });

            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");

            // Filter news cards
            newsCards.forEach(card => {
                const category = card.dataset.category;

                const shouldShow =
                    selectedFilter === "all" ||
                    category === selectedFilter;

                card.hidden = !shouldShow;
            });
        });
    });
}

// TOAST NOTIFICATIONS
const toastContainer = document.getElementById("toastContainer");

function showSportsToast(message) {
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toast.setAttribute("role", "status");

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// NEWSLETTER FORM
const newsletterForm = document.getElementById("newsletterForm");
const newsletterEmail = document.getElementById("newsletterEmail");
const newsletterMessage = document.getElementById("newsletterMessage");

if (newsletterForm && newsletterEmail && newsletterMessage) {
    newsletterForm.addEventListener("submit", event => {
        event.preventDefault();

        const email = newsletterEmail.value.trim();

        if (!email || !newsletterEmail.checkValidity()) {
            newsletterMessage.textContent =
                "Please enter a valid email address.";
            newsletterEmail.focus();
            return;
        }

        newsletterMessage.textContent =
            "The newsletter form is ready, but email subscriptions are not connected yet.";

        showSportsToast(
            "Newsletter subscriptions are not connected yet."
        );
    });
}

})();
/* =========================================
DESCOP SPORTS — JAVASCRIPT PART 3
SMOOTH SCROLL & SECTION NAVIGATION
========================================= */

(() => {
"use strict";

if (document.body.dataset.page !== "sports") return;

// SECTION SCROLL OFFSETS
const sectionIds = [
    "latest",
    "football",
    "basketball",
    "tennis",
    "athletics",
    "sports-business",
    "analysis",
    "newsletter"
];

sectionIds.forEach(id => {
    const section = document.getElementById(id);

    if (section) {
        section.style.scrollMarginTop = "100px";
    }
});

// SMOOTH INTERNAL NAVIGATION
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
        const href = link.getAttribute("href");

        if (!href || href === "#") return;

        const target = document.querySelector(href);

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        // Update the URL without reloading the page
        if (window.location.hash !== href) {
            history.pushState(null, "", href);
        }
    });
});

// BREAKING NEWS TICKER ACCESSIBILITY
const breakingNewsTrack =
    document.getElementById("breakingNewsTrack");

if (breakingNewsTrack) {
    breakingNewsTrack.setAttribute("aria-live", "off");
    breakingNewsTrack.setAttribute("role", "marquee");
}

// EXTERNAL LINKS SECURITY
document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.setAttribute("rel", "noopener noreferrer");
});

})();

/* ==========================================
DESCOP CRYPTO — JAVASCRIPT PART 1/4
Market data, coin prices and search
Append to the bottom of app.js
========================================== */

(() => {
"use strict";

if (document.body.dataset.page !== "crypto") return;
if (window.DESCOP_CRYPTO_PART1) return;

window.DESCOP_CRYPTO_PART1 = true;

const API = "https://api.coingecko.com/api/v3";

const cryptoState = window.DESCOP_CRYPTO = window.DESCOP_CRYPTO || {
    coins: [],
    global: null,
    currency: "usd",
    loaded: false
};

const $ = (id) => document.getElementById(id);

const formatMoney = (value) => {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
        return "—";
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: Number(value) < 1 ? 6 : 2
    }).format(Number(value));
};

const formatCompactMoney = (value) => {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
        return "—";
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 2
    }).format(Number(value));
};

const formatNumber = (value) => {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
        return "—";
    }

    return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 2
    }).format(Number(value));
};

const formatPercent = (value) => {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
        return "—";
    }

    const number = Number(value);
    return `${number > 0 ? "+" : ""}${number.toFixed(2)}%`;
};

async function fetchCryptoData(endpoint) {
    const response = await fetch(`${API}${endpoint}`, {
        headers: { "Accept": "application/json" }
    });

    if (!response.ok) {
        throw new Error(`Market API returned ${response.status}`);
    }

    return response.json();
}

function setText(id, value) {
    const element = $(id);
    if (element) element.textContent = value;
}

function setStatus(message) {
    setText("cryptoTableStatus", message);
}

function renderGlobalMarket(data) {
    if (!data || !data.data) return;

    const market = data.data;
    cryptoState.global = market;

    const totalCap = market.total_market_cap?.usd;
    const totalVolume = market.total_volume?.usd;
    const btcDominance = market.market_cap_percentage?.btc;
    const capChange = market.market_cap_change_percentage_24h_usd;

    setText("cryptoTotalMarketCap", formatCompactMoney(totalCap));
    setText("cryptoTotalVolume", formatCompactMoney(totalVolume));
    setText(
        "cryptoBtcDominance",
        Number.isFinite(Number(btcDominance))
            ? `${Number(btcDominance).toFixed(2)}%`
            : "—"
    );
    setText("cryptoMarketCapChange", formatPercent(capChange));

    const changeElement = $("cryptoMarketCapChange");

    if (changeElement) {
        changeElement.classList.toggle("is-positive", Number(capChange) > 0);
        changeElement.classList.toggle("is-negative", Number(capChange) < 0);
    }

    setText("cryptoMarketStatus", "Market data updated");
}

function createCell(text, className = "") {
    const cell = document.createElement("td");
    cell.textContent = text;

    if (className) cell.className = className;

    return cell;
}

function renderCoinTable(coins) {
    const tbody = $("cryptoTableBody");
    if (!tbody) return;

    tbody.replaceChildren();

    if (!coins.length) {
        setStatus("No matching cryptocurrencies found.");
        return;
    }

    const fragment = document.createDocumentFragment();

    coins.forEach((coin, index) => {
        const row = document.createElement("tr");
        row.dataset.coinId = coin.id;

        row.appendChild(createCell(String(index + 1)));

        const assetCell = document.createElement("td");
        const asset = document.createElement("div");
        asset.className = "crypto-asset";

        const image = document.createElement("img");
        image.className = "crypto-coin-image";
        image.src = coin.image || "";
        image.alt = "";
        image.loading = "lazy";
        image.width = 30;
        image.height = 30;

        image.addEventListener("error", () => {
            image.style.display = "none";
        }, { once: true });

        const info = document.createElement("div");
        info.className = "crypto-asset-info";

        const name = document.createElement("span");
        name.className = "crypto-coin-name";
        name.textContent = coin.name || "Unknown";

        const symbol = document.createElement("span");
        symbol.className = "crypto-coin-symbol";
        symbol.textContent = (coin.symbol || "").toUpperCase();

        info.append(name, symbol);
        asset.append(image, info);
        assetCell.appendChild(asset);

        const saveButton = document.createElement("button");
        saveButton.type = "button";
        saveButton.className = "crypto-save-button";
        saveButton.dataset.saveCoin = coin.id;
        saveButton.setAttribute("aria-label", `Add ${coin.name} to watchlist`);
        saveButton.textContent = "☆";
        assetCell.appendChild(saveButton);

        row.appendChild(assetCell);
        row.appendChild(createCell(formatMoney(coin.current_price), "coin-price"));
        row.appendChild(createCell(formatCompactMoney(coin.market_cap)));
        row.appendChild(createCell(formatCompactMoney(coin.total_volume)));

        const changeCell = createCell(
            formatPercent(coin.price_change_percentage_24h),
            Number(coin.price_change_percentage_24h) >= 0
                ? "is-positive"
                : "is-negative"
        );

        row.appendChild(changeCell);
        row.appendChild(createCell(
            coin.market_cap_rank ? `#${coin.market_cap_rank}` : "—"
        ));

        fragment.appendChild(row);
    });

    tbody.appendChild(fragment);
    setStatus(`Showing ${coins.length} cryptocurrencies.`);
    document.dispatchEvent(new CustomEvent("descop:crypto-coins-loaded"));
}

function filterCoinTable() {
    const input = $("cryptoSearch");
    if (!input) return;

    const query = input.value.trim().toLowerCase();

    const filtered = cryptoState.coins.filter((coin) => {
        return (
            (coin.name || "").toLowerCase().includes(query) ||
            (coin.symbol || "").toLowerCase().includes(query)
        );
    });

    renderCoinTable(filtered);
}

async function loadGlobalMarket() {
    try {
        const data = await fetchCryptoData("/global");
        renderGlobalMarket(data);
    } catch (error) {
        console.warn("DESCOP: Unable to load global crypto data.", error);
        setText("cryptoMarketStatus", "Market data temporarily unavailable");
    }
}

async function loadCoinMarkets() {
    setStatus("Loading cryptocurrency market data…");

    try {
        const coins = await fetchCryptoData(
            "/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h"
        );

        if (!Array.isArray(coins)) {
            throw new Error("Unexpected market data format");
        }

        cryptoState.coins = coins;
        cryptoState.loaded = true;

        filterCoinTable();
    } catch (error) {
        console.warn("DESCOP: Unable to load coin prices.", error);
        setStatus("Unable to load prices. Please try again later.");
    }
}

const searchInput = $("cryptoSearch");

if (searchInput) {
    searchInput.addEventListener("input", filterCoinTable);
}

window.DESCOP_CRYPTO.helpers = Object.assign(
    window.DESCOP_CRYPTO.helpers || {},
    {
        fetchCryptoData,
        formatMoney,
        formatCompactMoney,
        formatNumber,
        formatPercent,
        setText,
        createCell,
        renderCoinTable
    }
);

loadGlobalMarket();
loadCoinMarkets();

})();
/* ==========================================
DESCOP CRYPTO — JAVASCRIPT PART 2/4
Gainers, losers, trending and watchlist
========================================== */

(() => {
"use strict";

if (document.body.dataset.page !== "crypto") return;
if (window.DESCOP_CRYPTO_PART2) return;

window.DESCOP_CRYPTO_PART2 = true;

const state = window.DESCOP_CRYPTO;
if (!state) return;

const $ = (id) => document.getElementById(id);
const helpers = state.helpers || {};

const formatMoney = helpers.formatMoney || ((value) => `$${value ?? "—"}`);
const formatPercent = helpers.formatPercent || ((value) => `${Number(value).toFixed(2)}%`);

function makeMoverItem(coin) {
    const item = document.createElement("div");
    item.className = "market-mover-item";

    const image = document.createElement("img");
    image.src = coin.image || "";
    image.alt = "";
    image.loading = "lazy";
    image.width = 32;
    image.height = 32;
    image.addEventListener("error", () => {
        image.style.display = "none";
    }, { once: true });

    const info = document.createElement("div");
    info.className = "mover-coin-info";

    const name = document.createElement("span");
    name.className = "mover-coin-name";
    name.textContent = coin.name || "Unknown";

    const symbol = document.createElement("span");
    symbol.className = "mover-coin-symbol";
    symbol.textContent = (coin.symbol || "").toUpperCase();

    info.append(name, symbol);

    const price = document.createElement("span");
    price.className = "mover-coin-price";
    price.textContent = formatMoney(coin.current_price);

    const change = document.createElement("span");
    change.className = "mover-coin-change";
    change.textContent = formatPercent(coin.price_change_percentage_24h);

    const value = Number(coin.price_change_percentage_24h);
    change.classList.add(value >= 0 ? "is-positive" : "is-negative");

    item.append(image, info, price, change);
    return item;
}

function renderMovers() {
    if (!Array.isArray(state.coins) || !state.coins.length) return;

    const ranked = state.coins
        .filter((coin) => Number.isFinite(Number(coin.price_change_percentage_24h)))
        .slice()
        .sort((a, b) =>
            Number(b.price_change_percentage_24h) -
            Number(a.price_change_percentage_24h)
        );

    const gainers = $("cryptoGainers");
    const losers = $("cryptoLosers");

    if (gainers) {
        gainers.replaceChildren();

        ranked.slice(0, 5).forEach((coin) => {
            gainers.appendChild(makeMoverItem(coin));
        });
    }

    if (losers) {
        losers.replaceChildren();

        ranked.slice(-5).reverse().forEach((coin) => {
            losers.appendChild(makeMoverItem(coin));
        });
    }
}

async function loadTrendingCoins() {
    const container = $("cryptoTrending");
    if (!container) return;

    container.textContent = "Loading trending coins…";

    try {
        const data = await helpers.fetchCryptoData("/search/trending");
        const coins = data.coins || [];

        container.replaceChildren();

        if (!coins.length) {
            container.textContent = "Trending data is unavailable.";
            return;
        }

        coins.slice(0, 7).forEach((entry) => {
            const coin = entry.item;
            if (!coin) return;

            const item = document.createElement("div");
            item.className = "market-mover-item";

            const image = document.createElement("img");
            image.src = coin.small || "";
            image.alt = "";
            image.loading = "lazy";
            image.width = 32;
            image.height = 32;
            image.addEventListener("error", () => {
                image.style.display = "none";
            }, { once: true });

            const info = document.createElement("div");
            info.className = "mover-coin-info";

            const name = document.createElement("span");
            name.className = "mover-coin-name";
            name.textContent = coin.name || "Unknown";

            const symbol = document.createElement("span");
            symbol.className = "mover-coin-symbol";
            symbol.textContent = (coin.symbol || "").toUpperCase();

            info.append(name, symbol);
            item.append(image, info);

            container.appendChild(item);
        });
    } catch (error) {
        console.warn("DESCOP: Trending coins unavailable.", error);
        container.textContent = "Trending data is temporarily unavailable.";
    }
}

const STORAGE_KEY = "descop_crypto_watchlist";

function readWatchlist() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function saveWatchlist(list) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return true;
    } catch (error) {
        console.warn("DESCOP: Unable to save watchlist.", error);
        showToast("Watchlist could not be saved on this device.");
        return false;
    }
}

function showToast(message) {
    const toast = $("cryptoToast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("is-visible");

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
        toast.classList.remove("is-visible");
    }, 2600);
}

function renderWatchlist() {
    const container = $("cryptoWatchlist");
    const count = $("cryptoWatchlistCount");

    if (!container) return;

    const ids = readWatchlist();
    const coins = ids
        .map((id) => state.coins.find((coin) => coin.id === id))
        .filter(Boolean);

    if (count) count.textContent = String(ids.length);

    container.replaceChildren();

    if (!ids.length) {
        container.textContent = "Your watchlist is empty. Save a coin from the market table to track it here.";
        updateSaveButtons();
        return;
    }

    if (!coins.length) {
        container.textContent = "Your saved coins will appear here when market data loads.";
        updateSaveButtons();
        return;
    }

    coins.forEach((coin) => {
        const item = document.createElement("div");
        item.className = "watchlist-item";

        const info = document.createElement("div");
        info.className = "watchlist-coin-info";

        const image = document.createElement("img");
        image.src = coin.image || "";
        image.alt = "";
        image.width = 30;
        image.height = 30;
        image.loading = "lazy";
        image.addEventListener("error", () => {
            image.style.display = "none";
        }, { once: true });

        const details = document.createElement("div");

        const name = document.createElement("span");
        name.className = "mover-coin-name";
        name.textContent = coin.name;

        const symbol = document.createElement("span");
        symbol.className = "mover-coin-symbol";
        symbol.textContent = (coin.symbol || "").toUpperCase();

        details.append(name, symbol);
        info.append(image, details);

        const price = document.createElement("span");
        price.textContent = formatMoney(coin.current_price);

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "watchlist-remove";
        remove.textContent = "Remove";
        remove.setAttribute("aria-label", `Remove ${coin.name} from watchlist`);

        remove.addEventListener("click", () => {
            const updated = readWatchlist().filter((id) => id !== coin.id);

            if (saveWatchlist(updated)) {
                renderWatchlist();
                showToast(`${coin.name} removed from watchlist.`);
            }
        });

        item.append(info, price, remove);
        container.appendChild(item);
    });

    updateSaveButtons();
}

function updateSaveButtons() {
    const ids = readWatchlist();

    document.querySelectorAll("[data-save-coin]").forEach((button) => {
        const saved = ids.includes(button.dataset.saveCoin);

        button.textContent = saved ? "★" : "☆";
        button.setAttribute(
            "aria-label",
            saved ? "Remove coin from watchlist" : "Add coin to watchlist"
        );
        button.setAttribute("aria-pressed", String(saved));
        button.classList.toggle("is-saved", saved);
    });
}

document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-save-coin]");
    if (!button) return;

    const id = button.dataset.saveCoin;
    const coin = state.coins.find((item) => item.id === id);

    if (!coin) return;

    const ids = readWatchlist();
    const alreadySaved = ids.includes(id);

    const updated = alreadySaved
        ? ids.filter((savedId) => savedId !== id)
        : [...ids, id];

    if (saveWatchlist(updated)) {
        renderWatchlist();
        showToast(
            alreadySaved
                ? `${coin.name} removed from watchlist.`
                : `${coin.name} added to watchlist.`
        );
    }
});

document.addEventListener("descop:crypto-coins-loaded", () => {
    renderMovers();
    renderWatchlist();
});

// Handle the case where market data loaded before this script.
if (state.loaded) {
    renderMovers();
    renderWatchlist();
}

loadTrendingCoins();
updateSaveButtons();

})();
/* ==========================================
DESCOP CRYPTO — JAVASCRIPT PART 3/4
Bitcoin chart and market heatmap
========================================== */

(() => {
"use strict";

if (document.body.dataset.page !== "crypto") return;
if (window.DESCOP_CRYPTO_PART3) return;

window.DESCOP_CRYPTO_PART3 = true;

const state = window.DESCOP_CRYPTO;
if (!state) return;

const $ = (id) => document.getElementById(id);
const helpers = state.helpers || {};

let chartPrices = [];
let currentPeriod = 1;
let chartRequest = 0;

const formatMoney = helpers.formatMoney || ((value) => `$${Number(value).toFixed(2)}`);

function setChartStatus(message) {
    const status = $("btcChartStatus");
    if (status) status.textContent = message;
}

function drawBitcoinChart(prices) {
    const canvas = $("btcPriceChart");
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    if (!prices || prices.length < 2) {
        setChartStatus("Not enough price data to draw the chart.");
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const width = Math.max(rect.width, 280);
    const height = Math.max(rect.height, 220);
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const values = prices.map((point) => Number(point[1])).filter(Number.isFinite);

    if (values.length < 2) {
        setChartStatus("Price data is unavailable.");
        return;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || Math.abs(max) * 0.01 || 1;

    const padding = {
        top: 22,
        right: 18,
        bottom: 30,
        left: 76
    };

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    if (chartWidth <= 0 || chartHeight <= 0) return;

    const x = (index) =>
        padding.left + (index / (values.length - 1)) * chartWidth;

    const y = (value) =>
        padding.top + ((max - value) / range) * chartHeight;

    context.font = "11px sans-serif";
    context.lineWidth = 1;

    // Horizontal grid and price labels.
    for (let i = 0; i <= 4; i++) {
        const value = max - (range * i / 4);
        const positionY = padding.top + (chartHeight * i / 4);

        context.beginPath();
        context.strokeStyle = "rgba(180, 160, 210, 0.14)";
        context.moveTo(padding.left, positionY);
        context.lineTo(width - padding.right, positionY);
        context.stroke();

        context.fillStyle = "#a9a0b8";
        context.textAlign = "right";
        context.fillText(
            new Intl.NumberFormat("en-US", {
                notation: "compact",
                maximumFractionDigits: 2
            }).format(value),
            padding.left - 9,
            positionY + 4
        );
    }

    // Price line.
    context.beginPath();

    values.forEach((value, index) => {
        if (index === 0) {
            context.moveTo(x(index), y(value));
        } else {
            context.lineTo(x(index), y(value));
        }
    });

    context.strokeStyle = values[values.length - 1] >= values[0]
        ? "#38d996"
        : "#ff647c";

    context.lineWidth = 2.5;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.stroke();

    // Shaded area below the line.
    context.lineTo(x(values.length - 1), height - padding.bottom);
    context.lineTo(x(0), height - padding.bottom);
    context.closePath();

    context.fillStyle = "rgba(151, 92, 230, 0.10)";
    context.fill();

    // First and last price labels.
    context.fillStyle = "#a9a0b8";
    context.textAlign = "left";
    context.fillText("Start", padding.left, height - 9);

    context.textAlign = "right";
    context.fillText("Latest", width - padding.right, height - 9);

    const first = values[0];
    const last = values[values.length - 1];
    const change = first ? ((last - first) / first) * 100 : 0;

    setChartStatus(
        `Latest: ${formatMoney(last)} · Period change: ${change >= 0 ? "+" : ""}${change.toFixed(2)}%`
    );
}

async function loadBitcoinChart(days = currentPeriod) {
    const requestId = ++chartRequest;
    currentPeriod = days;

    const heading = $("btcChartHeading");

    if (heading) {
        heading.textContent = `Bitcoin Price — ${days === 1 ? "24 Hours" : `${days} Days`}`;
    }

    setChartStatus("Loading Bitcoin price history…");

    document.querySelectorAll("[data-chart-period]").forEach((button) => {
        const active = Number(button.dataset.chartPeriod) === days;

        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    });

    try {
        const data = await helpers.fetchCryptoData(
            `/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`
        );

        if (requestId !== chartRequest) return;

        if (!Array.isArray(data.prices) || data.prices.length < 2) {
            throw new Error("Insufficient chart data");
        }

        chartPrices = data.prices;
        drawBitcoinChart(chartPrices);
    } catch (error) {
        if (requestId !== chartRequest) return;

        console.warn("DESCOP: Bitcoin chart unavailable.", error);
        setChartStatus("Bitcoin chart data is temporarily unavailable.");
    }
}

document.querySelectorAll("[data-chart-period]").forEach((button) => {
    button.addEventListener("click", () => {
        const days = Number(button.dataset.chartPeriod);

        if ([1, 7, 30, 90].includes(days)) {
            loadBitcoinChart(days);
        }
    });
});

let resizeTimer;

window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
        if (chartPrices.length > 1) {
            drawBitcoinChart(chartPrices);
        }
    }, 180);
});

function renderHeatmap() {
    const container = $("cryptoHeatmap");
    if (!container || !Array.isArray(state.coins) || !state.coins.length) {
        return;
    }

    container.replaceChildren();

    const coins = state.coins
        .filter((coin) => Number.isFinite(Number(coin.price_change_percentage_24h)))
        .slice(0, 30);

    coins.forEach((coin) => {
        const change = Number(coin.price_change_percentage_24h);
        const tile = document.createElement("button");

        tile.type = "button";
        tile.className = "heatmap-tile";
        tile.classList.add(change >= 0 ? "is-positive" : "is-negative");

        // Use restrained opacity to represent the size of the move.
        const intensity = Math.min(Math.abs(change) / 15, 1);
        tile.style.setProperty("--heat-intensity", intensity.toFixed(2));

        const name = document.createElement("span");
        name.className = "heatmap-coin-name";
        name.textContent = (coin.symbol || "").toUpperCase();

        const price = document.createElement("span");
        price.className = "heatmap-coin-change";
        price.textContent = `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;

        tile.title = `${coin.name}: ${price.textContent}`;
        tile.append(name, price);

        tile.addEventListener("click", () => {
            const search = $("cryptoSearch");

            if (search) {
                search.value = coin.symbol || coin.name;
                search.dispatchEvent(new Event("input", { bubbles: true }));

                const table = $("coins");
                if (table) {
                    table.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            }
        });

        container.appendChild(tile);
    });
}

document.addEventListener("descop:crypto-coins-loaded", renderHeatmap);

if (state.loaded) {
    renderHeatmap();
}

loadBitcoinChart(1);

})();
/* ==========================================
DESCOP CRYPTO — JAVASCRIPT PART 4/4
Page interactions, loader and newsletter
========================================== */

(() => {
"use strict";

if (document.body.dataset.page !== "crypto") return;
if (window.DESCOP_CRYPTO_PART4) return;

window.DESCOP_CRYPTO_PART4 = true;

const $ = (id) => document.getElementById(id);

// Update footer year.
const year = $("currentYear");

if (year) {
    year.textContent = new Date().getFullYear();
}

// Hide the page loader when the page is ready.
function hidePageLoader() {
    const loader = $("pageLoader");
    if (!loader) return;

    loader.classList.add("is-hidden");
    loader.setAttribute("aria-hidden", "true");
}

if (document.readyState === "complete") {
    setTimeout(hidePageLoader, 250);
} else {
    window.addEventListener("load", () => {
        setTimeout(hidePageLoader, 250);
    }, { once: true });
}

// Back-to-top button.
const backToTop = $("backToTop");

if (backToTop) {
    const updateBackToTop = () => {
        backToTop.classList.toggle("is-visible", window.scrollY > 400);
    };

    window.addEventListener("scroll", updateBackToTop, {
        passive: true
    });

    updateBackToTop();

    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

// Newsletter placeholder.
// No email is sent until a real newsletter service is connected.
const newsletterForm = $("newsletterForm");
const newsletterMessage = $("newsletterMessage");

if (newsletterForm) {
    newsletterForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const emailInput = $("newsletterEmail");
        const email = emailInput ? emailInput.value.trim() : "";

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            if (newsletterMessage) {
                newsletterMessage.textContent =
                    "Please enter a valid email address.";
            }

            if (emailInput) emailInput.focus();
            return;
        }

        if (newsletterMessage) {
            newsletterMessage.textContent =
                "Newsletter signup is not connected yet. Your email has not been submitted.";
        }
    });
}

// Mark the page as initialized for debugging.
document.documentElement.classList.add("crypto-page-ready");

})();

/* ==========================================
   DESCOP WEATHER — JAVASCRIPT PART 1/4
   Initialization, API configuration,
   weather codes and helper functions
========================================== */

(() => {
    "use strict";

    if (document.body.dataset.page !== "weather") return;

    const WEATHER_API =
        "https://api.open-meteo.com/v1/forecast";

    const GEOCODING_API =
        "https://geocoding-api.open-meteo.com/v1/search";

    const $ = (id) => document.getElementById(id);

    const elements = {
        searchForm: $("weatherSearchForm"),
        cityInput: $("weatherCitySearch"),
        searchButton: $("weatherSearchButton"),
        status: $("weatherStatus"),

        locationLabel: $("weatherLocationLabel"),
        updatedAt: $("weatherUpdatedAt"),
        currentCity: $("weatherCurrentCity"),
        currentIcon: $("weatherCurrentIcon"),
        currentTemp: $("weatherCurrentTemp"),
        currentCondition: $("weatherCurrentCondition"),
        feelsLike: $("weatherFeelsLike"),
        todayHigh: $("weatherTodayHigh"),
        todayLow: $("weatherTodayLow"),
        dayNight: $("weatherDayNight"),

        humidity: $("weatherHumidity"),
        humidityMeter: $("weatherHumidityMeter"),
        windSpeed: $("weatherWindSpeed"),
        windMeter: $("weatherWindMeter"),
        precipitation: $("weatherPrecipitation"),
        rainMeter: $("weatherRainMeter"),
        apparentTemp: $("weatherApparentTemp"),
        feelsMeter: $("weatherFeelsMeter"),

        timezone: $("weatherTimezone"),
        forecastList: $("weatherForecastList"),

        rainProbability: $("weatherRainProbability"),
        windDirection: $("weatherWindDirection"),
        windDirectionDescription: $("weatherWindDirectionDescription"),
        coordinates: $("weatherCoordinates"),
        localTime: $("weatherLocalTime"),
        localDate: $("weatherLocalDate")
    };

    const weatherCodes = {
        0: {
            label: "Clear sky",
            icon: "☀️"
        },
        1: {
            label: "Mainly clear",
            icon: "🌤️"
        },
        2: {
            label: "Partly cloudy",
            icon: "⛅"
        },
        3: {
            label: "Overcast",
            icon: "☁️"
        },
        45: {
            label: "Fog",
            icon: "🌫️"
        },
        48: {
            label: "Depositing rime fog",
            icon: "🌫️"
        },
        51: {
            label: "Light drizzle",
            icon: "🌦️"
        },
        53: {
            label: "Moderate drizzle",
            icon: "🌦️"
        },
        55: {
            label: "Dense drizzle",
            icon: "🌧️"
        },
        56: {
            label: "Light freezing drizzle",
            icon: "🌧️"
        },
        57: {
            label: "Dense freezing drizzle",
            icon: "🌧️"
        },
        61: {
            label: "Slight rain",
            icon: "🌦️"
        },
        63: {
            label: "Moderate rain",
            icon: "🌧️"
        },
        65: {
            label: "Heavy rain",
            icon: "🌧️"
        },
        66: {
            label: "Light freezing rain",
            icon: "🌧️"
        },
        67: {
            label: "Heavy freezing rain",
            icon: "🌧️"
        },
        71: {
            label: "Slight snowfall",
            icon: "🌨️"
        },
        73: {
            label: "Moderate snowfall",
            icon: "🌨️"
        },
        75: {
            label: "Heavy snowfall",
            icon: "❄️"
        },
        77: {
            label: "Snow grains",
            icon: "❄️"
        },
        80: {
            label: "Slight rain showers",
            icon: "🌦️"
        },
        81: {
            label: "Moderate rain showers",
            icon: "🌧️"
        },
        82: {
            label: "Violent rain showers",
            icon: "⛈️"
        },
        85: {
            label: "Slight snow showers",
            icon: "🌨️"
        },
        86: {
            label: "Heavy snow showers",
            icon: "❄️"
        },
        95: {
            label: "Thunderstorm",
            icon: "⛈️"
        },
        96: {
            label: "Thunderstorm with hail",
            icon: "⛈️"
        },
        99: {
            label: "Severe thunderstorm with hail",
            icon: "⛈️"
        }
    };

    function getWeatherInfo(code) {
        return weatherCodes[code] || {
            label: "Weather conditions unavailable",
            icon: "🌡️"
        };
    }

    function setText(element, value) {
        if (element) {
            element.textContent = value;
        }
    }

    function formatTemperature(value) {
        if (value === null || value === undefined ||
            !Number.isFinite(Number(value))) {
            return "--°";
        }

        return `${Math.round(Number(value))}°C`;
    }

    function formatWind(value) {
        if (value === null || value === undefined ||
            !Number.isFinite(Number(value))) {
            return "-- km/h";
        }

        return `${Math.round(Number(value))} km/h`;
    }

    function formatPercentage(value) {
        if (value === null || value === undefined ||
            !Number.isFinite(Number(value))) {
            return "--%";
        }

        return `${Math.round(Number(value))}%`;
    }

    function formatDate(dateString, options = {}) {
        if (!dateString) return "--";

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return new Intl.DateTimeFormat("en-GB", {
            ...options,
            timeZone: "UTC"
        }).format(date);
    }

    function getWindDirection(degrees) {
        if (degrees === null || degrees === undefined ||
            !Number.isFinite(Number(degrees))) {
            return "Unavailable";
        }

        const directions = [
            "N", "NE", "E", "SE",
            "S", "SW", "W", "NW"
        ];

        const index = Math.round(
            ((Number(degrees) % 360) / 45)
        ) % 8;

        return directions[index];
    }

    function setMeter(element, value, maximum = 100) {
        if (!element) return;

        const number = Number(value);

        if (!Number.isFinite(number)) {
            element.style.width = "0%";
            return;
        }

        const percentage = Math.max(
            0,
            Math.min(100, (number / maximum) * 100)
        );

        element.style.width = `${percentage}%`;
    }

    function setStatus(message, type = "info") {
        if (!elements.status) return;

        elements.status.textContent = message;
        elements.status.dataset.state = type;
        elements.status.hidden = !message;
    }

    function setLoading(isLoading) {
        if (elements.searchButton) {
            elements.searchButton.disabled = isLoading;
            elements.searchButton.setAttribute(
                "aria-busy",
                String(isLoading)
            );

            if (!elements.searchButton.dataset.originalText) {
                elements.searchButton.dataset.originalText =
                    elements.searchButton.textContent.trim();
            }

            elements.searchButton.textContent = isLoading
                ? "Loading..."
                : elements.searchButton.dataset.originalText;
        }

        if (elements.cityInput) {
            elements.cityInput.disabled = isLoading;
        }
    }

    function showError(message) {
        setStatus(message, "error");
    }

    // Further weather functions will be added in Part 2.
})();
/* ==========================================
   DESCOP WEATHER — JAVASCRIPT PART 2/4
   City search, geocoding and live API data
========================================== */

(() => {
    "use strict";

    if (document.body.dataset.page !== "weather") return;

    const API = "https://api.open-meteo.com/v1/forecast";
    const GEO_API = "https://geocoding-api.open-meteo.com/v1/search";

    const $ = (id) => document.getElementById(id);

    const searchForm = $("weatherSearchForm");
    const cityInput = $("weatherCitySearch");
    const searchButton = $("weatherSearchButton");
    const status = $("weatherStatus");

    let activeRequest = 0;

    const weatherCodes = {
        0: ["Clear sky", "☀️"],
        1: ["Mainly clear", "🌤️"],
        2: ["Partly cloudy", "⛅"],
        3: ["Overcast", "☁️"],
        45: ["Fog", "🌫️"],
        48: ["Rime fog", "🌫️"],
        51: ["Light drizzle", "🌦️"],
        53: ["Moderate drizzle", "🌦️"],
        55: ["Dense drizzle", "🌧️"],
        56: ["Freezing drizzle", "🌧️"],
        57: ["Dense freezing drizzle", "🌧️"],
        61: ["Slight rain", "🌦️"],
        63: ["Moderate rain", "🌧️"],
        65: ["Heavy rain", "🌧️"],
        66: ["Freezing rain", "🌧️"],
        67: ["Heavy freezing rain", "🌧️"],
        71: ["Slight snowfall", "🌨️"],
        73: ["Moderate snowfall", "🌨️"],
        75: ["Heavy snowfall", "❄️"],
        77: ["Snow grains", "❄️"],
        80: ["Slight rain showers", "🌦️"],
        81: ["Moderate rain showers", "🌧️"],
        82: ["Heavy rain showers", "⛈️"],
        85: ["Snow showers", "🌨️"],
        86: ["Heavy snow showers", "❄️"],
        95: ["Thunderstorm", "⛈️"],
        96: ["Thunderstorm with hail", "⛈️"],
        99: ["Severe thunderstorm with hail", "⛈️"]
    };

    function setText(id, value) {
        const element = $(id);
        if (element) element.textContent = value;
    }

    function setStatus(message, type = "info") {
        if (!status) return;

        status.textContent = message;
        status.dataset.state = type;
        status.hidden = !message;
    }

    function setMeter(id, value, max = 100) {
        const element = $(id);
        if (!element) return;

        const number = Number(value);

        if (!Number.isFinite(number)) {
            element.style.width = "0%";
            return;
        }

        element.style.width =
            `${Math.max(0, Math.min(100, number / max * 100))}%`;
    }

    function temperature(value) {
        return Number.isFinite(Number(value))
            ? `${Math.round(Number(value))}°C`
            : "--°";
    }

    function weatherInfo(code) {
        return weatherCodes[code] ||
            ["Conditions unavailable", "🌡️"];
    }

    function compassDirection(degrees) {
        if (!Number.isFinite(Number(degrees))) {
            return "Unavailable";
        }

        const points = [
            "N", "NE", "E", "SE",
            "S", "SW", "W", "NW"
        ];

        return points[
            Math.round(Number(degrees) / 45) % 8
        ];
    }

    async function fetchJSON(url) {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Weather service returned error ${response.status}.`
            );
        }

        return response.json();
    }

    async function findCity(city) {
        const url = new URL(GEO_API);

        url.searchParams.set("name", city);
        url.searchParams.set("count", "5");
        url.searchParams.set("language", "en");
        url.searchParams.set("format", "json");

        const data = await fetchJSON(url);

        if (!data.results || data.results.length === 0) {
            throw new Error(
                `We couldn't find "${city}". Check the spelling and try again.`
            );
        }

        // Prefer an exact city-name match when available.
        const match = data.results.find(
            place => place.name.toLowerCase() === city.toLowerCase()
        );

        return match || data.results[0];
    }

    async function fetchWeather(place) {
        const url = new URL(API);

        url.searchParams.set("latitude", place.latitude);
        url.searchParams.set("longitude", place.longitude);

        url.searchParams.set(
            "current",
            [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "is_day",
                "precipitation",
                "weather_code",
                "wind_speed_10m",
                "wind_direction_10m"
            ].join(",")
        );

        url.searchParams.set(
            "daily",
            [
                "weather_code",
                "temperature_2m_max",
                "temperature_2m_min",
                "precipitation_probability_max",
                "sunrise",
                "sunset"
            ].join(",")
        );

        url.searchParams.set("timezone", "auto");
        url.searchParams.set("forecast_days", "5");

        return fetchJSON(url);
    }

    function updateCurrentWeather(place, data) {
        const current = data.current;
        const daily = data.daily;

        const info = weatherInfo(current.weather_code);

        const location = [
            place.name,
            place.admin1,
            place.country
        ].filter(Boolean).filter(
            (item, index, array) => array.indexOf(item) === index
        ).join(", ");

        setText("weatherLocationLabel", location);
        setText("weatherCurrentCity", place.name);
        setText("weatherCurrentIcon", info[1]);
        setText("weatherCurrentTemp", temperature(current.temperature_2m));
        setText("weatherCurrentCondition", info[0]);
        setText("weatherFeelsLike", temperature(current.apparent_temperature));
        setText("weatherTodayHigh", temperature(daily.temperature_2m_max[0]));
        setText("weatherTodayLow", temperature(daily.temperature_2m_min[0]));

        setText(
            "weatherDayNight",
            current.is_day ? "Daytime" : "Nighttime"
        );

        setText(
            "weatherHumidity",
            `${current.relative_humidity_2m}%`
        );

        setMeter(
            "weatherHumidityMeter",
            current.relative_humidity_2m
        );

        setText(
            "weatherWindSpeed",
            `${Math.round(current.wind_speed_10m)} km/h`
        );

        setMeter(
            "weatherWindMeter",
            current.wind_speed_10m,
            100
        );

        setText(
            "weatherPrecipitation",
            `${current.precipitation} mm`
        );

        setMeter(
            "weatherRainMeter",
            daily.precipitation_probability_max[0] ?? 0
        );

        setText(
            "weatherApparentTemp",
            temperature(current.apparent_temperature)
        );

        setMeter(
            "weatherFeelsMeter",
            Math.abs(current.apparent_temperature),
            50
        );

        setText(
            "weatherTimezone",
            data.timezone || "Unavailable"
        );

        setText(
            "weatherRainProbability",
            daily.precipitation_probability_max[0] == null
                ? "Unavailable"
                : `${daily.precipitation_probability_max[0]}%`
        );

        const direction = compassDirection(
            current.wind_direction_10m
        );

        setText("weatherWindDirection", direction);

        setText(
            "weatherWindDirectionDescription",
            `Wind is coming from ${direction}`
        );

        setText(
            "weatherCoordinates",
            `${Number(place.latitude).toFixed(3)}, ${
                Number(place.longitude).toFixed(3)
            }`
        );

        setText(
            "weatherUpdatedAt",
            `Updated ${current.time.replace("T", " ")}`
        );

        // Save data for the forecast renderer in Part 3.
        window.DESCOPWeather = {
            place,
            data,
            weatherCodes,
            loadedAt: Date.now()
        };

        // Format local date and time using the location's timezone.
        try {
            const now = new Date();

            setText(
                "weatherLocalTime",
                new Intl.DateTimeFormat("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: data.timezone
                }).format(now)
            );

            setText(
                "weatherLocalDate",
                new Intl.DateTimeFormat("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: data.timezone
                }).format(now)
            );
        } catch {
            setText("weatherLocalTime", current.time);
            setText("weatherLocalDate", daily.time[0]);
        }
    }

    async function searchWeather(city) {
        const query = city.trim();

        if (!query) {
            setStatus("Enter a city name first.", "error");
            cityInput?.focus();
            return;
        }

        const requestId = ++activeRequest;

        if (searchButton) {
            searchButton.disabled = true;
            searchButton.setAttribute("aria-busy", "true");
        }

        setStatus(`Finding weather for ${query}...`, "loading");

        try {
            const place = await findCity(query);

            if (requestId !== activeRequest) return;

            setStatus(
                `Loading current conditions for ${place.name}...`,
                "loading"
            );

            const data = await fetchWeather(place);

            if (requestId !== activeRequest) return;

            if (!data.current || !data.daily) {
                throw new Error(
                    "The weather service returned incomplete data."
                );
            }

            updateCurrentWeather(place, data);

            setStatus(
                `Live weather loaded for ${place.name}.`,
                "success"
            );
        } catch (error) {
            if (requestId !== activeRequest) return;

            console.error("DESCOP Weather:", error);

            setStatus(
                error.message ||
                "Unable to load weather. Check your internet connection.",
                "error"
            );
        } finally {
            if (requestId === activeRequest) {
                if (searchButton) {
                    searchButton.disabled = false;
                    searchButton.removeAttribute("aria-busy");
                }
            }
        }
    }

    if (searchForm) {
        searchForm.addEventListener("submit", event => {
            event.preventDefault();
            searchWeather(cityInput?.value || "");
        });
    }

    // Load Abuja by default unless the user has entered another city.
    searchWeather(cityInput?.value.trim() || "Abuja");

})();
/* ==========================================
   DESCOP WEATHER — JAVASCRIPT PART 3/4
   Five-day forecast rendering and dates
========================================== */

(() => {
    "use strict";

    if (document.body.dataset.page !== "weather") return;

    const forecastList = document.getElementById("weatherForecastList");

    if (!forecastList) return;

    const weatherCodes = {
        0: ["Clear sky", "☀️"],
        1: ["Mainly clear", "🌤️"],
        2: ["Partly cloudy", "⛅"],
        3: ["Overcast", "☁️"],
        45: ["Fog", "🌫️"],
        48: ["Rime fog", "🌫️"],
        51: ["Light drizzle", "🌦️"],
        53: ["Moderate drizzle", "🌦️"],
        55: ["Dense drizzle", "🌧️"],
        56: ["Freezing drizzle", "🌧️"],
        57: ["Dense freezing drizzle", "🌧️"],
        61: ["Slight rain", "🌦️"],
        63: ["Moderate rain", "🌧️"],
        65: ["Heavy rain", "🌧️"],
        66: ["Freezing rain", "🌧️"],
        67: ["Heavy freezing rain", "🌧️"],
        71: ["Slight snowfall", "🌨️"],
        73: ["Moderate snowfall", "🌨️"],
        75: ["Heavy snowfall", "❄️"],
        77: ["Snow grains", "❄️"],
        80: ["Slight rain showers", "🌦️"],
        81: ["Moderate rain showers", "🌧️"],
        82: ["Heavy rain showers", "⛈️"],
        85: ["Snow showers", "🌨️"],
        86: ["Heavy snow showers", "❄️"],
        95: ["Thunderstorm", "⛈️"],
        96: ["Thunderstorm with hail", "⛈️"],
        99: ["Severe thunderstorm with hail", "⛈️"]
    };

    function weatherInfo(code) {
        return weatherCodes[code] ||
            ["Conditions unavailable", "🌡️"];
    }

    function makeElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }

    function formatForecastDay(dateString, index) {
        if (index === 0) return "Today";
        if (index === 1) return "Tomorrow";

        // Parse the calendar date directly to avoid timezone shifts.
        const parts = dateString.split("-").map(Number);

        const date = new Date(
            Date.UTC(parts[0], parts[1] - 1, parts[2])
        );

        return new Intl.DateTimeFormat("en-GB", {
            weekday: "short",
            timeZone: "UTC"
        }).format(date);
    }

    function renderForecast(weatherState) {
        if (!weatherState?.data?.daily) {
            forecastList.replaceChildren(
                makeElement(
                    "p",
                    "forecast-empty",
                    "Forecast data is not available yet. Search for a city to load the forecast."
                )
            );
            return;
        }

        const daily = weatherState.data.daily;

        const requiredArrays = [
            daily.time,
            daily.weather_code,
            daily.temperature_2m_max,
            daily.temperature_2m_min
        ];

        if (
            requiredArrays.some(
                array => !Array.isArray(array) || array.length === 0
            )
        ) {
            forecastList.replaceChildren(
                makeElement(
                    "p",
                    "forecast-empty",
                    "The forecast service returned incomplete data."
                )
            );
            return;
        }

        const count = Math.min(
            5,
            daily.time.length,
            daily.weather_code.length,
            daily.temperature_2m_max.length,
            daily.temperature_2m_min.length
        );

        const forecastItems = [];

        for (let index = 0; index < count; index++) {
            const date = daily.time[index];
            const high = Number(daily.temperature_2m_max[index]);
            const low = Number(daily.temperature_2m_min[index]);
            const info = weatherInfo(daily.weather_code[index]);

            const rainValue = daily.precipitation_probability_max?.[index];
            const rainText = rainValue == null
                ? "Rain chance unavailable"
                : `${Math.round(rainValue)}% rain chance`;

            const card = makeElement("article", "forecast-day");

            const dayName = makeElement(
                "span",
                "forecast-day-name",
                formatForecastDay(date, index)
            );

            const icon = makeElement(
                "span",
                "forecast-day-icon",
                info[1]
            );

            icon.setAttribute("role", "img");
            icon.setAttribute("aria-label", info[0]);

            const condition = makeElement(
                "div",
                "forecast-day-condition",
                info[0]
            );

            const temperatureRange = makeElement(
                "div",
                "forecast-temperature-range"
            );

            temperatureRange.append(
                makeElement(
                    "span",
                    "",
                    Number.isFinite(high) ? `${Math.round(high)}°` : "--"
                ),
                makeElement(
                    "span",
                    "",
                    Number.isFinite(low) ? `${Math.round(low)}°` : "--"
                )
            );

            const temperatureTrack = makeElement(
                "div",
                "forecast-temperature-track"
            );

            temperatureTrack.setAttribute("aria-hidden", "true");

            const temperatureFill = makeElement("span");

            // Position the daily temperature range relative to the
            // entire five-day range, rather than using fake values.
            const allValues = [];

            for (let i = 0; i < count; i++) {
                const dayHigh = Number(daily.temperature_2m_max[i]);
                const dayLow = Number(daily.temperature_2m_min[i]);

                if (Number.isFinite(dayHigh)) allValues.push(dayHigh);
                if (Number.isFinite(dayLow)) allValues.push(dayLow);
            }

            const minimum = allValues.length
                ? Math.min(...allValues)
                : 0;

            const maximum = allValues.length
                ? Math.max(...allValues)
                : 1;

            const span = Math.max(1, maximum - minimum);

            const left = Number.isFinite(low)
                ? ((low - minimum) / span) * 100
                : 0;

            const width = Number.isFinite(high) && Number.isFinite(low)
                ? Math.max(8, ((high - low) / span) * 100)
                : 50;

            temperatureFill.style.marginLeft =
                `${Math.max(0, Math.min(92, left))}%`;

            temperatureFill.style.width =
                `${Math.max(8, Math.min(100 - left, width))}%`;

            temperatureTrack.append(temperatureFill);

            const rain = makeElement(
                "div",
                "forecast-rain",
                `💧 ${rainText}`
            );

            card.append(
                dayName,
                icon,
                condition,
                temperatureRange,
                temperatureTrack,
                rain
            );

            forecastItems.push(card);
        }

        forecastList.replaceChildren(...forecastItems);
    }

    // The live weather module stores its result on this shared object.
    function checkForWeatherData() {
        if (window.DESCOPWeather) {
            renderForecast(window.DESCOPWeather);
        }
    }

    // Wait for Part 2 to finish loading the initial forecast.
    window.addEventListener(
        "descop:weather-updated",
        checkForWeatherData
    );

    // Also handle the case where weather data arrived before this
    // script initialized.
    checkForWeatherData();

    // Keep this renderer available to the live weather module.
    window.DESCOPRenderForecast = renderForecast;

})();
/* ==========================================
   DESCOP WEATHER — JAVASCRIPT PART 4/4
   Module integration, page interactions,
   newsletter feedback and final polish
========================================== */

(() => {
    "use strict";

    if (document.body.dataset.page !== "weather") return;

    const $ = (id) => document.getElementById(id);

    /* ------------------------------------------
       CONNECT LIVE WEATHER TO FORECAST RENDERER
    ------------------------------------------ */

    let lastWeatherData = null;

    function syncForecast() {
        const weatherData = window.DESCOPWeather;

        if (!weatherData || weatherData === lastWeatherData) {
            return;
        }

        lastWeatherData = weatherData;

        if (typeof window.DESCOPRenderForecast === "function") {
            window.DESCOPRenderForecast(weatherData);
        }

        window.dispatchEvent(
            new CustomEvent("descop:weather-updated", {
                detail: weatherData
            })
        );
    }

    // Part 2 and Part 3 are separate modules. This bridge ensures
    // the forecast refreshes after every successful city search.
    syncForecast();
    window.setInterval(syncForecast, 500);

    /* ------------------------------------------
       CURRENT DATE
    ------------------------------------------ */

    const currentDate = $("currentDate");

    if (currentDate) {
        currentDate.textContent = new Intl.DateTimeFormat("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(new Date());
    }

    /* ------------------------------------------
       TOAST NOTIFICATIONS
    ------------------------------------------ */

    function showToast(message, type = "info") {
        let container = $("toastContainer");

        if (!container) {
            container = document.createElement("div");
            container.id = "toastContainer";
            container.setAttribute("aria-live", "polite");
            container.setAttribute("aria-atomic", "true");

            Object.assign(container.style, {
                position: "fixed",
                right: "20px",
                bottom: "20px",
                zIndex: "9999",
                display: "grid",
                gap: "10px",
                width: "min(360px, calc(100vw - 40px))"
            });

            document.body.appendChild(container);
        }

        const toast = document.createElement("div");

        toast.textContent = message;
        toast.setAttribute("role", "status");

        Object.assign(toast.style, {
            padding: "14px 18px",
            borderRadius: "12px",
            background: type === "error" ? "#652d38" : "#29213a",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            fontSize: "14px",
            lineHeight: "1.6",
            opacity: "0",
            transform: "translateY(8px)",
            transition: "opacity 180ms ease, transform 180ms ease"
        });

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateY(0)";
        });

        window.setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(8px)";

            window.setTimeout(() => toast.remove(), 220);
        }, 3500);
    }

    /* ------------------------------------------
       NEWSLETTER FORM
    ------------------------------------------ */

    const newsletterForm = $("newsletterForm");

    if (newsletterForm) {
        newsletterForm.addEventListener("submit", event => {
            event.preventDefault();

            const emailInput = $("newsletterEmail");

            if (!emailInput) {
                showToast(
                    "Newsletter form is not configured correctly.",
                    "error"
                );
                return;
            }

            const email = emailInput.value.trim();

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                emailInput.focus();

                showToast(
                    "Enter a valid email address.",
                    "error"
                );

                return;
            }

            // No backend is connected yet, so do not pretend
            // the visitor has actually been subscribed.
            showToast(
                "The newsletter service is not connected yet. Your email was not submitted."
            );
        });
    }

    /* ------------------------------------------
       BACK TO TOP
    ------------------------------------------ */

    const backToTop = $("backToTop");

    if (backToTop) {
        backToTop.addEventListener("click", event => {
            event.preventDefault();

            window.scrollTo({
                top: 0,
                behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches ? "auto" : "smooth"
            });
        });

        function updateBackToTop() {
            const visible = window.scrollY > 450;

            backToTop.classList.toggle("visible", visible);
            backToTop.setAttribute(
                "aria-hidden",
                String(!visible)
            );
        }

        window.addEventListener("scroll", updateBackToTop, {
            passive: true
        });

        updateBackToTop();
    }

    /* ------------------------------------------
       PAGE LOADER
    ------------------------------------------ */

    const pageLoader = $("pageLoader");

    if (pageLoader) {
        function hidePageLoader() {
            pageLoader.classList.add("hidden");
            pageLoader.setAttribute("aria-hidden", "true");
        }

        if (document.readyState === "complete") {
            hidePageLoader();
        } else {
            window.addEventListener(
                "load",
                hidePageLoader,
                { once: true }
            );

            // Prevent a broken external resource from leaving
            // the loading overlay on screen indefinitely.
            window.setTimeout(hidePageLoader, 4000);
        }
    }

    /* ------------------------------------------
       FOOTER YEAR, IF THE ELEMENT EXISTS
    ------------------------------------------ */

    const currentYear = $("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

})();

/* =========================================
   DESCOP LOGIN SYSTEM
   Login validation, password visibility,
   and password recovery feedback
========================================= */

(() => {
    "use strict";

    // Run this script only on the login page.
    if (document.body.dataset.page !== "login") return;

    const loginForm = document.getElementById("loginForm");
    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");
    const loginMessage = document.getElementById("loginMessage");
    const loginButton = document.getElementById("loginSubmitButton");

    const forgotPasswordForm =
        document.getElementById("forgotPasswordForm");

    const forgotPasswordEmail =
        document.getElementById("forgotPasswordEmail");

    const forgotPasswordMessage =
        document.getElementById("forgotPasswordMessage");

    /* =========================================
       MESSAGE HELPER
    ========================================= */

    function showMessage(element, message, state = "info") {
        if (!element) return;

        element.textContent = message;
        element.dataset.state = state;
        element.setAttribute("role", state === "error" ? "alert" : "status");
        element.setAttribute("aria-live", "polite");
    }

    function clearMessage(element) {
        if (!element) return;

        element.textContent = "";
        element.removeAttribute("data-state");
    }

    /* =========================================
       PASSWORD VISIBILITY
    ========================================= */

    document
        .querySelectorAll("[data-password-target]")
        .forEach((toggle) => {
            toggle.addEventListener("click", () => {
                const targetId = toggle.dataset.passwordTarget;
                const passwordField = document.getElementById(targetId);

                if (!passwordField) return;

                const showPassword =
                    passwordField.type === "password";

                passwordField.type = showPassword ? "text" : "password";

                toggle.textContent = showPassword ? "Hide" : "Show";
                toggle.setAttribute(
                    "aria-pressed",
                    String(showPassword)
                );

                toggle.setAttribute(
                    "aria-label",
                    showPassword ? "Hide password" : "Show password"
                );
            });
        });

    /* =========================================
       EMAIL VALIDATION
    ========================================= */

    function isValidEmail(value) {
        const email = value.trim();

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /* =========================================
       LOGIN FORM
    ========================================= */

    
        loginForm.addEventListener("submit", async (event) => {
event.preventDefault();

        clearMessage(loginMessage);

        const email = loginEmail?.value.trim() || "";
        const password = loginPassword?.value || "";
        const rememberMe =
            document.getElementById("rememberMe")?.checked || false;

        if (!email || !password) {
            showMessage(
                loginMessage,
                "Enter both your email address and password.",
                "error"
            );
            return;
        }

        if (!isValidEmail(email)) {
            showMessage(
                loginMessage,
                "Enter a valid email address.",
                "error"
            );
            loginEmail?.focus();
            return;
        }

        if (loginButton) {
            loginButton.disabled = true;
            loginButton.textContent = "Signing in...";
        }

        try {
            const response = await fetch(
                "https://descop-intelligence-network.onrender.com/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.error || "Login failed. Please try again."
                );
            }

            if (!result.token) {
                throw new Error(
                    "The server did not return an authentication token."
                );
            }

            // Remove any previous DESCOP session.
            sessionStorage.removeItem("descopToken");
            localStorage.removeItem("descopToken");

            // Respect the Remember me selection.
            const storage = rememberMe
                ? localStorage
                : sessionStorage;

            storage.setItem("descopToken", result.token);

            showMessage(
                loginMessage,
                "Login successful! Welcome back, " +
                    (result.user?.name || "DESCOP user") + ".",
                "success"
            );

        } catch (error) {
            showMessage(
                loginMessage,
                error.message === "Failed to fetch"
                    ? "Unable to reach DESCOP. Check the backend deployment and database configuration."
                    : error.message || "Login failed. Please try again.",
                "error"
            );

        } finally {
            if (loginButton) {
                loginButton.disabled = false;
                loginButton.textContent = "Sign In";
            }
        }
    });

            /*
             * IMPORTANT:
             * No authentication backend is connected yet.
             * Do not save passwords in localStorage or sessionStorage.
             * Connect a secure authentication service before enabling
             * real sign-in.
             */

            
        

        [loginEmail, loginPassword].forEach((field) => {
            field?.addEventListener("input", () => {
                clearMessage(loginMessage);
            });
        });
    

    /* =========================================
       FORGOT PASSWORD FORM
    ========================================= */

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", (event) => {
            event.preventDefault();

            clearMessage(forgotPasswordMessage);

            const email = forgotPasswordEmail?.value.trim() || "";

            if (!email) {
                showMessage(
                    forgotPasswordMessage,
                    "Enter the email address associated with your account.",
                    "error"
                );
                return;
            }

            if (!isValidEmail(email)) {
                showMessage(
                    forgotPasswordMessage,
                    "Enter a valid email address.",
                    "error"
                );

                forgotPasswordEmail?.focus();
                return;
            }

            showMessage(
                forgotPasswordMessage,
                "Your email format is valid, but password reset is not connected yet. A password-reset backend must be configured before reset emails can be sent.",
                "info"
            );
        });

        forgotPasswordEmail?.addEventListener("input", () => {
            clearMessage(forgotPasswordMessage);
        });
    }

    /* =========================================
       CURRENT YEAR
    ========================================= */

    const footerYear = document.getElementById("footerYear");

    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }

    /* =========================================
       CURRENT DATE
    ========================================= */

    const currentDate = document.getElementById("currentDate");

    if (currentDate) {
        currentDate.textContent = new Intl.DateTimeFormat("en-NG", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        }).format(new Date());
    }

})();
/* =========================================
   DESCOP REGISTRATION SYSTEM
   Validation, password matching,
   visibility toggles and form feedback
========================================= */

(() => {
    "use strict";

    // Run only on the registration page.
    if (document.body.dataset.page !== "register") return;

    const registerForm = document.getElementById("registerForm");
    const registerName = document.getElementById("registerName");
    const registerUsername = document.getElementById("registerUsername");
    const registerEmail = document.getElementById("registerEmail");
    const registerPassword = document.getElementById("registerPassword");
    const registerConfirmPassword = document.getElementById(
        "registerConfirmPassword"
    );
    const acceptTerms = document.getElementById("acceptTerms");
    const registerMessage = document.getElementById("registerMessage");
    const registerSubmitButton = document.getElementById(
        "registerSubmitButton"
    );

    /* =========================================
       STATUS MESSAGES
    ========================================= */

    function showMessage(message, state = "info") {
        if (!registerMessage) return;

        registerMessage.textContent = message;
        registerMessage.dataset.state = state;
        registerMessage.hidden = false;
        registerMessage.setAttribute(
            "role",
            state === "error" ? "alert" : "status"
        );
        registerMessage.setAttribute("aria-live", "polite");
    }

    function clearMessage() {
        if (!registerMessage) return;

        registerMessage.textContent = "";
        registerMessage.hidden = true;
        registerMessage.removeAttribute("data-state");
    }

    /* =========================================
       PASSWORD VISIBILITY
    ========================================= */

    document
        .querySelectorAll("[data-password-target]")
        .forEach((toggle) => {
            toggle.addEventListener("click", () => {
                const field = document.getElementById(
                    toggle.dataset.passwordTarget
                );

                if (!field) return;

                const showPassword = field.type === "password";

                field.type = showPassword ? "text" : "password";
                toggle.textContent = showPassword ? "Hide" : "Show";
                toggle.setAttribute(
                    "aria-pressed",
                    String(showPassword)
                );

                const label = field.id === "registerConfirmPassword"
                    ? "confirmation password"
                    : "password";

                toggle.setAttribute(
                    "aria-label",
                    `${showPassword ? "Hide" : "Show"} ${label}`
                );
            });
        });

    /* =========================================
       VALIDATION HELPERS
    ========================================= */

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    }

    function setInvalid(field, invalid) {
        if (!field) return;

        if (invalid) {
            field.setAttribute("aria-invalid", "true");
        } else {
            field.removeAttribute("aria-invalid");
        }
    }

    function validatePasswordMatch() {
        if (!registerPassword || !registerConfirmPassword) {
            return true;
        }

        const confirmationEntered =
            registerConfirmPassword.value.length > 0;

        const passwordsMatch =
            registerPassword.value === registerConfirmPassword.value;

        const invalid = confirmationEntered && !passwordsMatch;

        setInvalid(registerConfirmPassword, invalid);

        return passwordsMatch;
    }

    /* =========================================
       LIVE PASSWORD CONFIRMATION
    ========================================= */

    registerPassword?.addEventListener("input", () => {
        clearMessage();

        if (registerConfirmPassword?.value) {
            validatePasswordMatch();
        }
    });

    registerConfirmPassword?.addEventListener("input", () => {
        clearMessage();
        validatePasswordMatch();
    });

    /* =========================================
       REGISTRATION FORM
    ========================================= */

    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            clearMessage();

            const fullName = registerName?.value.trim() || "";
            const username = registerUsername?.value.trim() || "";
            const email = registerEmail?.value.trim() || "";
            const password = registerPassword?.value || "";
            const confirmPassword =
                registerConfirmPassword?.value || "";

            // Full name
            if (fullName.length < 2 || fullName.length > 100) {
                showMessage(
                    "Enter a full name between 2 and 100 characters.",
                    "error"
                );

                registerName?.focus();
                return;
            }

            // Username
            if (!/^[A-Za-z0-9_]{3,30}$/.test(username)) {
                showMessage(
                    "Your username must contain 3–30 letters, numbers or underscores.",
                    "error"
                );

                registerUsername?.focus();
                return;
            }

            // Email
            if (!isValidEmail(email)) {
                showMessage(
                    "Enter a valid email address.",
                    "error"
                );

                registerEmail?.focus();
                return;
            }

            // Password length
            if (password.length < 8 || password.length > 128) {
                showMessage(
                    "Your password must contain between 8 and 128 characters.",
                    "error"
                );

                registerPassword?.focus();
                return;
            }

            // Confirm password
            if (password !== confirmPassword) {
                setInvalid(registerConfirmPassword, true);

                showMessage(
                    "Your passwords do not match. Please check them and try again.",
                    "error"
                );

                registerConfirmPassword?.focus();
                return;
            }

            setInvalid(registerConfirmPassword, false);

            // Terms acceptance
            if (!acceptTerms?.checked) {
                showMessage(
                    "Please accept the terms and community guidelines before continuing.",
                    "error"
                );

                acceptTerms?.focus();
                return;
            }


            if (registerSubmitButton) {
                registerSubmitButton.disabled = true;
                registerSubmitButton.textContent = "Creating account...";
            }

            try {
                const response = await fetch(
                    "https://descop-intelligence-network.onrender.com/api/auth/register",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            name: fullName,
                            username: username,
                            email: email,
                            password: password
                        })
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.error || "Registration failed. Please try again."
                    );
                }

                registerForm.reset();

                showMessage(
                    "Your account was created successfully! You can now log in.",
                    "success"
                );

            } catch (error) {
                showMessage(
                    error.message === "Failed to fetch"
                        ? "Unable to reach DESCOP. The backend may be starting, or its database may not be configured."
                        : error.message || "Registration failed. Please try again.",
                    "error"
                );

            } finally {
                if (registerSubmitButton) {
                    registerSubmitButton.disabled = false;
                    registerSubmitButton.textContent = "Create Account";
                }
            }
        });

        // Clear stale errors when the user edits their information.
        [
            registerName,
            registerUsername,
            registerEmail,
            registerPassword,
            registerConfirmPassword
        ].forEach((field) => {
            field?.addEventListener("input", () => {
                clearMessage();
                setInvalid(field, false);
            });
        });

        acceptTerms?.addEventListener("change", clearMessage);
    }

    /* =========================================
       FOOTER YEAR
    ========================================= */

    const footerYear = document.getElementById("footerYear");

    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }

    /* =========================================
       CURRENT DATE
    ========================================= */

    const currentDate = document.getElementById("currentDate");

    if (currentDate) {
        currentDate.textContent = new Intl.DateTimeFormat("en-NG", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        }).format(new Date());
    }

})();



/* ==========================================
DESCOP HOMEPAGE — LIVE CRYPTO MARKET DATA
========================================== */

(() => {
"use strict";

// Run this code only on the homepage.
if (document.body.dataset.page !== "home") return;

if (window.DESCOP_HOME_CRYPTO_LOADER) return;
window.DESCOP_HOME_CRYPTO_LOADER = true;

const API = "https://api.coingecko.com/api/v3";

const $ = (selector) => document.querySelector(selector);

const setText = (selector, value) => {
    const element = $(selector);
    if (element) element.textContent = value;
};

const money = (value) => {
    if (value == null || !Number.isFinite(Number(value))) {
        return "Unavailable";
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: Number(value) < 1 ? 6 : 2
    }).format(Number(value));
};

const compactMoney = (value) => {
    if (value == null || !Number.isFinite(Number(value))) {
        return "Unavailable";
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 2
    }).format(Number(value));
};

const percent = (value) => {
    if (value == null || !Number.isFinite(Number(value))) {
        return "Unavailable";
    }

    const number = Number(value);

    return `${number >= 0 ? "+" : ""}${number.toFixed(2)}%`;
};

async function fetchMarketData(endpoint) {
    const response = await fetch(`${API}${endpoint}`);

    if (!response.ok) {
        throw new Error(`Crypto API returned ${response.status}`);
    }

    return response.json();
}

function updateChange(element, value) {
    if (!element) return;

    element.textContent = percent(value);

    element.classList.toggle(
        "is-positive",
        Number(value) >= 0
    );

    element.classList.toggle(
        "is-negative",
        Number(value) < 0
    );
}

async function loadHomepageCoins() {
    try {
        const coins = await fetchMarketData(
            "/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana&price_change_percentage=24h"
        );

        coins.forEach((coin) => {
            const card = document.querySelector(
                `[data-market="${coin.id}"]`
            );

            if (!card) return;

            const price = card.querySelector("[data-price]");
            const change = card.querySelector("[data-change]");

            if (price) {
                price.textContent = money(coin.current_price);
            }

            updateChange(
                change,
                coin.price_change_percentage_24h
            );
        });
    } catch (error) {
        console.error(
            "DESCOP: Homepage coin prices could not load.",
            error
        );

        document.querySelectorAll(".coin-card").forEach((card) => {
            const price = card.querySelector("[data-price]");
            const change = card.querySelector("[data-change]");

            if (price) price.textContent = "Price unavailable";
            if (change) change.textContent = "Market data unavailable";
        });
    }
}

async function loadHomepageGlobalMarket() {
    try {
        const response = await fetchMarketData("/global");
        const data = response.data;

        if (!data) throw new Error("Global market data is missing");

        setText("#marketCapValue", compactMoney(data.total_market_cap?.usd));
        setText("#marketVolumeValue", compactMoney(data.total_volume?.usd));
        setText("#btcDominanceValue", percent(data.market_cap_percentage?.btc));

        setText("#marketStatusValue", "Live");

        const change = data.market_cap_change_percentage_24h;

        setText(
            "#marketCapChange",
            `24h market change: ${percent(change)}`
        );

        const changeElement = $("#marketCapChange");

        if (changeElement) {
            changeElement.classList.toggle("is-positive", Number(change) >= 0);
            changeElement.classList.toggle("is-negative", Number(change) < 0);
        }
    } catch (error) {
        console.error(
            "DESCOP: Global market data could not load.",
            error
        );

        setText("#marketCapValue", "Unavailable");
        setText("#marketVolumeValue", "Unavailable");
        setText("#btcDominanceValue", "Unavailable");
        setText("#marketStatusValue", "Offline");
        setText("#marketCapChange", "Unable to retrieve market data");
    }
}

loadHomepageCoins();
loadHomepageGlobalMarket();

})();
// ==========================================
// DESCOP GLOBAL SEARCH
// ==========================================

(function initDESCOPGlobalSearch() {
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("siteSearch");

    if (!searchForm || !searchInput) {
        return;
    }

    // Prevent duplicate event listeners.
    if (searchForm.dataset.searchInitialized === "true") {
        return;
    }

    searchForm.dataset.searchInitialized = "true";

    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const query = searchInput.value.trim();

        if (!query) {
            searchInput.focus();
            return;
        }

        // Send the search query to the results page.
        window.location.href =
            "search.html?q=" + encodeURIComponent(query);
    });
})();
/* ==========================================
   DESCOP INTELLIGENCE NETWORK
   ARTICLE DATA SYSTEM
========================================== */

const DESCOP_ARTICLES = [
    {
        id: "global-market-outlook",
        category: "Markets",
        title: "Global Markets: Understanding the Latest Market Movements",
        standfirst: "An overview of the factors shaping financial markets and investor sentiment.",
        author: "DESCOP Intelligence Desk",
        authorRole: "News & Analysis",
        publishedDate: "2026-10-24",
        updatedDate: "2026-10-24",
        readingTime: "5 min read",
        image: "",
        imageCaption: "Market developments and financial analysis.",
        tags: ["Markets", "Finance", "Analysis"],
        overview: "Financial markets respond to economic data, investor expectations, monetary policy and geopolitical developments.",
        details: "Market participants monitor price movements, trading activity, economic releases and company announcements to understand changing conditions.",
        implications: "Investors should distinguish verified information from speculation and consider risk before making financial decisions.",
        sources: [],
        authorBio: "The DESCOP Intelligence Desk covers markets, technology and global developments.",
        relatedIds: []
    },
    {
        id: "technology-watch",
        category: "Technology",
        title: "Technology Watch: Developments Shaping the Digital Economy",
        standfirst: "Explore how emerging technologies influence businesses, consumers and digital infrastructure.",
        author: "DESCOP Technology Desk",
        authorRole: "Technology Analysis",
        publishedDate: "2026-10-24",
        updatedDate: "2026-10-24",
        readingTime: "4 min read",
        image: "",
        imageCaption: "Technology and digital innovation.",
        tags: ["Technology", "Innovation", "Digital Economy"],
        overview: "Technology continues to influence communication, financial services, manufacturing and everyday digital experiences.",
        details: "To assess a technology development properly, readers should examine the original announcement, supporting evidence, practical applications and limitations.",
        implications: "Businesses and consumers should evaluate new technologies based on reliability, security, cost and real-world usefulness.",
        sources: [],
        authorBio: "The DESCOP Technology Desk follows digital innovation and its wider impact.",
        relatedIds: []
    }
];

/* Retrieve an article using its URL ID. */
function getDESCOPArticle() {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get("id");

    if (!articleId) {
        return DESCOP_ARTICLES[0];
    }

    return DESCOP_ARTICLES.find(article => article.id === articleId) || null;
}
/* ==========================================
   DESCOP ARTICLE PAGE INITIALIZER
========================================== */

function initializeDESCOPArticlePage() {
    const articlePage = document.querySelector('body[data-page="article"]');

    if (!articlePage) return;

    const article = getDESCOPArticle();

    if (!article) {
        const title = document.getElementById("articleTitle");

        if (title) {
            title.textContent = "Article not found";
        }

        const body = document.getElementById("articleBody");

        if (body) {
            body.textContent =
                "This article could not be found. Please return to the news page and select another story.";
        }

        return;
    }

    const setText = (id, value) => {
        const element = document.getElementById(id);

        if (element && value !== undefined && value !== null) {
            element.textContent = value;
        }
    };

    setText("articleCategory", article.category);
    setText("articleTitle", article.title);
    setText("articleStandfirst", article.standfirst);
    setText("articleAuthor", article.author);
    setText("articleAuthorRole", article.authorRole);
    setText("articlePublishedDate", article.publishedDate);
    setText("articleUpdatedDate", article.updatedDate);
    setText("articleReadingTime", article.readingTime);
    setText("articleImageCaption", article.imageCaption);
    setText("articleFactCategory", article.category);
    setText("articleFactAuthor", article.author);
    setText("articleFactDate", article.publishedDate);
    setText("articleFactReadingTime", article.readingTime);
    setText("articleAuthorCardName", article.author);
    setText("articleAuthorBio", article.authorBio);

    const image = document.getElementById("articleFeatureImage");

    if (image) {
        if (article.image) {
            image.src = article.image;
            image.alt = article.title;
            image.hidden = false;
        } else {
            image.hidden = true;
        }
    }

    const avatar = document.getElementById("articleAuthorAvatar");

    if (avatar) {
        avatar.textContent = article.author
            .split(/\s+/)
            .map(word => word.charAt(0))
            .join("")
            .slice(0, 2)
            .toUpperCase();
    }

    const sections = [
        ["articleSectionOverview", "Overview", article.overview],
        ["articleSectionDetails", "What You Need to Know", article.details],
        ["articleSectionImplications", "Why It Matters", article.implications]
    ];

    sections.forEach(([id, heading, content]) => {
        const section = document.getElementById(id);

        if (!section) return;

        section.replaceChildren();

        const title = document.createElement("h2");
        title.textContent = heading;

        const paragraph = document.createElement("p");
        paragraph.textContent = content;

        section.append(title, paragraph);
    });

    const tags = document.getElementById("articleTags");

    if (tags) {
        tags.replaceChildren();

        article.tags.forEach(tag => {
            const element = document.createElement("span");
            element.className = "article-tag";
            element.textContent = tag;
            tags.appendChild(element);
        });
    }

    const sourcesSection = document.getElementById("articleSourcesSection");

    if (sourcesSection) {
        sourcesSection.hidden = true;
    }

    const contents = document.getElementById("articleContentsList");

    if (contents) {
        contents.replaceChildren();

        sections.forEach(([id, heading]) => {
            const item = document.createElement("li");
            const link = document.createElement("a");

            link.href = "#" + id;
            link.textContent = heading;

            item.appendChild(link);
            contents.appendChild(item);
        });
    }

    document.title = article.title + " | DESCOP Intelligence Network";
}

/* Initialize the article page once the document is ready. */

document.addEventListener("DOMContentLoaded", () => {
    initializeLoader();
    initializeBreakingNews();
    initializeHomepageNews();
    initializeNewsFilters();
    initializeNewsletter();
    initializeScrollToTop();

    initializeDESCOPArticlePage();
    initializeDESCOPHeaderSearch();
    initializeDESCOPSearchPage();
});


/* ==========================================
   DESCOP GLOBAL SEARCH SYSTEM
========================================== */

function initializeDESCOPSearchPage() {
    const page = document.querySelector('body[data-page="search"]');

    if (!page || page.dataset.searchInitialized === "true") {
        return;
    }

    page.dataset.searchInitialized = "true";

    const resultsGrid = document.getElementById("searchResultsGrid");
    const resultsTitle = document.getElementById("searchResultsTitle");
    const resultsSummary = document.getElementById("searchResultsSummary");
    const emptyState = document.getElementById("searchEmptyState");
    const loadingState = document.getElementById("searchLoadingState");
    const sortSelect = document.getElementById("searchSort");
    const categoryFilters = document.getElementById("searchCategoryFilters");
    const loadMoreButton = document.getElementById("searchLoadMore");
    const mainSearchForm = document.getElementById("resultsSearchForm");
    const mainSearchInput = document.getElementById("resultsSearchInput");
    const headerSearchForm = document.getElementById("searchForm");
    const headerSearchInput = document.getElementById("siteSearch");

    const articles = [
    ...(Array.isArray(homepageNews) ? homepageNews : []),
    ...(Array.isArray(DESCOP_ARTICLES) ? DESCOP_ARTICLES : [])
].map(article => ({
    ...article,
    standfirst: article.standfirst || article.summary || "",
    publishedDate: article.publishedDate || article.date || "",
    id: article.id || "",
    link: article.link || ""
}));

    let currentQuery = "";
    let currentCategory = "all";
    let visibleCount = 6;

    const params = new URLSearchParams(window.location.search);

    currentQuery = (params.get("q") || "").trim();

    if (mainSearchInput) {
        mainSearchInput.value = currentQuery;
    }

    if (headerSearchInput) {
        headerSearchInput.value = currentQuery;
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function getSearchableText(article) {
        return normalize([
            article.title,
            article.category,
            article.standfirst,
            article.author,
            article.overview,
            article.details,
            ...(article.tags || [])
        ].join(" "));
    }

    function getFilteredArticles() {
        let filtered = articles.filter(article => {
            const matchesQuery =
                !currentQuery ||
                getSearchableText(article).includes(normalize(currentQuery));

            const matchesCategory =
                currentCategory === "all" ||
                normalize(article.category) === currentCategory;

            return matchesQuery && matchesCategory;
        });

        const sortMode = sortSelect ? sortSelect.value : "relevance";

        if (sortMode === "newest") {
            filtered.sort((a, b) =>
                new Date(b.publishedDate || 0) -
                new Date(a.publishedDate || 0)
            );
        } else if (sortMode === "oldest") {
            filtered.sort((a, b) =>
                new Date(a.publishedDate || 0) -
                new Date(b.publishedDate || 0)
            );
        }

        return filtered;
    }

    function createResultCard(article) {
        const card = document.createElement("article");
        card.className = "search-result-card";

        const link = document.createElement("a");
        link.href = article.link
    ? article.link
    : `article.html?id=${encodeURIComponent(article.id)}`;

        if (article.image) {
            const image = document.createElement("img");
            image.className = "search-result-image";
            image.src = article.image;
            image.alt = article.title || "News image";
            image.loading = "lazy";

            image.addEventListener("error", () => {
                image.remove();
            });

            link.appendChild(image);
        }

        const content = document.createElement("div");
        content.className = "search-result-content";

        const category = document.createElement("span");
        category.className = "search-result-category";
        category.textContent = article.category || "News";

        const title = document.createElement("h3");
        title.className = "search-result-title";
        title.textContent = article.title || "Untitled story";

        const description = document.createElement("p");
        description.className = "search-result-description";
        description.textContent =
            article.standfirst || article.overview || "";

        const meta = document.createElement("div");
        meta.className = "search-result-meta";

        const author = document.createElement("span");
        author.textContent = article.author || "DESCOP";

        const date = document.createElement("span");
        date.textContent = article.publishedDate || "";

        meta.append(author, date);
        content.append(category, title, description, meta);
        link.appendChild(content);
        card.appendChild(link);

        return card;
    }

    function renderResults() {
        if (!resultsGrid) return;

        loadingState?.setAttribute("hidden", "");
        resultsGrid.replaceChildren();

        const filtered = getFilteredArticles();
        const visibleArticles = filtered.slice(0, visibleCount);

        visibleArticles.forEach(article => {
            resultsGrid.appendChild(createResultCard(article));
        });

        if (resultsTitle) {
            resultsTitle.textContent = currentQuery
                ? 'Results for "' + currentQuery + '"'
                : "Explore the latest coverage";
        }

        if (resultsSummary) {
            if (filtered.length === 0) {
                resultsSummary.textContent = currentQuery
                    ? "No matching demonstration articles were found."
                    : "No articles match this category yet.";
            } else {
                resultsSummary.textContent =
                    "Showing " + visibleArticles.length +
                    " of " + filtered.length +
                    " available demonstration articles.";
            }
        }

        if (emptyState) {
            emptyState.hidden = filtered.length !== 0;
        }

        if (loadMoreButton) {
            loadMoreButton.hidden = visibleCount >= filtered.length;
        }
    }

    function submitSearch(input) {
        const query = input ? input.value.trim() : "";

        if (!query) {
            input?.focus();
            return;
        }

        window.location.href =
            "search.html?q=" + encodeURIComponent(query);
    }

    if (mainSearchForm) {
        mainSearchForm.addEventListener("submit", event => {
            event.preventDefault();
            submitSearch(mainSearchInput);
        });
    }

    if (headerSearchForm) {
        headerSearchForm.addEventListener("submit", event => {
            event.preventDefault();
            submitSearch(headerSearchInput);
        });
    }

    if (categoryFilters) {
        categoryFilters.addEventListener("click", event => {
            const button = event.target.closest("[data-search-category]");

            if (!button) return;

            currentCategory = button.dataset.searchCategory;

            categoryFilters.querySelectorAll("[data-search-category]")
                .forEach(filter => {
                    filter.classList.toggle("active", filter === button);
                });

            visibleCount = 6;
            renderResults();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", renderResults);
    }

    if (loadMoreButton) {
        loadMoreButton.addEventListener("click", () => {
            visibleCount += 6;
            renderResults();
        });
    }

    const year = document.getElementById("currentYear");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    renderResults();
}

/* Global header search: send queries to the search page. */

function initializeDESCOPHeaderSearch() {
    const form = document.getElementById("searchForm");
    const input = document.getElementById("siteSearch");

    if (!form || !input || form.dataset.globalSearchInitialized === "true") {
        return;
    }

    form.dataset.globalSearchInitialized = "true";

    form.addEventListener("submit", event => {
        event.preventDefault();

        const query = input.value.trim();

        if (!query) {
            input.focus();
            return;
        }

        window.location.href =
            "search.html?q=" + encodeURIComponent(query);
    });
}


/* ==========================================
   DESCOP SAVED ARTICLES ENGINE
========================================== */

const DESCOP_SAVED_KEY = "descop_saved_articles";

function getSavedArticles() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(DESCOP_SAVED_KEY) || "[]"
        );

        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        console.error("Unable to load saved articles:", error);
        return [];
    }
}

function saveArticlesToStorage(articles) {
    localStorage.setItem(
        DESCOP_SAVED_KEY,
        JSON.stringify(articles)
    );
}

function toggleSavedStory(article) {
    if (!article || !article.title || !article.link) {
        console.error("Cannot save article: title or link is missing.");
        return false;
    }

    const savedArticles = getSavedArticles();

    const existingIndex = savedArticles.findIndex(
        saved => saved.link === article.link
    );

    if (existingIndex !== -1) {
        savedArticles.splice(existingIndex, 1);
        saveArticlesToStorage(savedArticles);
        updateDESCOPSavedCount();

        return false;
    }

    savedArticles.unshift({
        id: article.id || article.link,
        title: article.title,
        category: article.category || "News",
        summary: article.summary || article.standfirst || "",
        date: article.date || article.publishedDate || "",
        link: article.link,
        savedAt: Date.now()
    });

    saveArticlesToStorage(savedArticles);
    updateDESCOPSavedCount();

    return true;
}

function isStorySaved(article) {
    if (!article || !article.link) return false;

    return getSavedArticles().some(
        saved => saved.link === article.link
    );
}

function updateDESCOPSavedCount() {
    const count = getSavedArticles().length;

    document.querySelectorAll("#savedCount, #savedArticleCount").forEach(
        element => {
            element.textContent = count;
        }
    );
}

document.addEventListener("DOMContentLoaded", () => {
    updateDESCOPSavedCount();
});
/* ==========================================
   DESCOP SAVED ARTICLES PAGE
========================================== */

function initializeDESCOPSavedPage() {
    const page = document.querySelector('body[data-page="saved"]');

    if (!page || page.dataset.savedInitialized === "true") return;

    page.dataset.savedInitialized = "true";

    const grid = document.getElementById("savedArticlesGrid");
    const emptyState = document.getElementById("savedEmptyState");
    const filterEmpty = document.getElementById("savedFilterEmpty");
    const libraryFooter = document.getElementById("savedLibraryFooter");
    const sortSelect = document.getElementById("savedSort");
    const clearButton = document.getElementById("clearSavedArticlesButton");
    const showAllButton = document.getElementById("showAllSavedButton");
    const filterButtons = document.querySelectorAll("[data-saved-filter]");

    if (!grid) return;

    let activeFilter = "all";

    function renderSavedArticles() {
        const allSaved = getSavedArticles();

        const sorted = [...allSaved];

        if (sortSelect?.value === "oldest") {
            sorted.sort((a, b) => (a.savedAt || 0) - (b.savedAt || 0));
        } else if (sortSelect?.value === "title") {
            sorted.sort((a, b) => a.title.localeCompare(b.title));
        } else {
            sorted.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
        }

        const filtered = sorted.filter(article =>
            activeFilter === "all" ||
            String(article.category || "").toLowerCase() === activeFilter
        );

        grid.replaceChildren();
        grid.setAttribute("aria-busy", "false");

        allSaved.forEach(article => {
            if (!article.link || !article.title) return;

            // Render only the articles matching the selected filter.
        });

        filtered.forEach(article => {
            const card = document.createElement("article");
            card.className = "news-card saved-article-card";

            const category = document.createElement("span");
            category.className = "news-category";
            category.textContent = article.category || "News";

            const heading = document.createElement("h3");
            const titleLink = document.createElement("a");

            titleLink.href = article.link;
            titleLink.textContent = article.title;

            heading.appendChild(titleLink);

            const summary = document.createElement("p");
            summary.className = "news-summary";
            summary.textContent = article.summary || "";

            const date = document.createElement("span");
            date.className = "news-date";
            date.textContent = article.date || "";

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "secondary-button saved-remove-button";
            removeButton.textContent = "Remove bookmark";

            removeButton.addEventListener("click", () => {
                const remaining = getSavedArticles().filter(
                    saved => saved.link !== article.link
                );

                saveArticlesToStorage(remaining);
                updateDESCOPSavedCount();
                renderSavedArticles();
            });

            card.append(category, heading, summary, date, removeButton);
            grid.appendChild(card);
        });

        const noSavedArticles = allSaved.length === 0;
        const noFilteredArticles = allSaved.length > 0 && filtered.length === 0;

        if (emptyState) emptyState.hidden = !noSavedArticles;
        if (filterEmpty) filterEmpty.hidden = !noFilteredArticles;
        if (libraryFooter) libraryFooter.hidden = noSavedArticles;

        updateDESCOPSavedCount();
    }

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.savedFilter || "all";

            filterButtons.forEach(item => {
                const selected = item === button;
                item.classList.toggle("active", selected);
                item.setAttribute("aria-pressed", String(selected));
            });

            renderSavedArticles();
        });
    });

    sortSelect?.addEventListener("change", renderSavedArticles);

    clearButton?.addEventListener("click", () => {
        const confirmed = window.confirm(
            "Clear all saved articles from this browser?"
        );

        if (!confirmed) return;

        saveArticlesToStorage([]);
        renderSavedArticles();
    });

    showAllButton?.addEventListener("click", () => {
        activeFilter = "all";

        filterButtons.forEach(button => {
            const selected = button.dataset.savedFilter === "all";
            button.classList.toggle("active", selected);
            button.setAttribute("aria-pressed", String(selected));
        });

        renderSavedArticles();
    });

    const currentDate = document.getElementById("currentDate");
    if (currentDate) {
        currentDate.textContent = new Date().toLocaleDateString(
            "en-NG",
            { day: "numeric", month: "long", year: "numeric" }
        );
    }

    const footerYear = document.getElementById("footerYear");
    if (footerYear) footerYear.textContent = new Date().getFullYear();

    renderSavedArticles();
}


/* =========================================
   DESCOP: HOMEPAGE CRYPTO - COINPAPRIKA
   ========================================= */

(() => {
    "use strict";

    if (document.body.dataset.page !== "home") return;
    if (window.DESCOP_PAPRIKA_HOME) return;

    window.DESCOP_PAPRIKA_HOME = true;

    const API = "https://api.coinpaprika.com/v1";

    const $ = selector => document.querySelector(selector);

    function setText(selector, value) {
        const element = $(selector);
        if (element) element.textContent = value;
    }
    function money(value, compact = false) {
        if (value == null || !Number.isFinite(Number(value))) {
            return "Unavailable";
        }

        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            notation: compact ? "compact" : "standard",
            maximumFractionDigits: Number(value) < 1 ? 6 : 2
        }).format(Number(value));
    }

    function percent(value) {
        if (value == null || !Number.isFinite(Number(value))) {
            return "Unavailable";
        }

        const number = Number(value);
        return (number > 0 ? "+" : "") + number.toFixed(2) + "%";
    }

    async function getJSON(url) {
        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) {
            throw new Error("CoinPaprika HTTP " + response.status);
        }

        return response.json();
    }

    async function loadCoins() {
        const coins = [
            { id: "btc-bitcoin", element: "bitcoin" },
            { id: "eth-ethereum", element: "ethereum" },
            { id: "sol-solana", element: "solana" }
        ];

        await Promise.all(coins.map(async coin => {
            try {
                const data = await getJSON(
                    API + "/tickers/" + coin.id
                );

                const card = $(
                    '[data-market="' + coin.element + '"]'
                );

                if (!card) {
                    console.warn(
                        "DESCOP: Missing card for " + coin.element
                    );
                    return;
                }

                const price = card.querySelector("[data-price]");
                const change = card.querySelector("[data-change]");

                if (price) {
                    price.textContent = money(
                        data.quotes.USD.price
                    );
                }

                if (change) {
                    const movement =
                        data.quotes.USD.percent_change_24h;

                    change.textContent = percent(movement);

                    change.classList.toggle(
                        "is-positive",
                        Number(movement) >= 0
                    );

                    change.classList.toggle(
                        "is-negative",
                        Number(movement) < 0
                    );
                }
            } catch (error) {
                console.error(
                    "DESCOP: Failed to load " + coin.element,
                    error
                );
            }
        }));
    }

    async function loadGlobalMarket() {
        try {
            const data = await getJSON(API + "/global");

            setText(
                "#marketCapValue",
                money(data.market_cap_usd, true)
            );

            setText(
                "#marketVolumeValue",
                money(data.volume_24h_usd, true)
            );

            setText(
                "#btcDominanceValue",
                percent(data.bitcoin_dominance_percentage)
            );

            setText("#marketStatusValue", "Live");

        } catch (error) {
            console.error(
                "DESCOP: Global market request failed.",
                error
            );

            setText("#marketStatusValue", "Unavailable");
        }
    }

    async function refresh() {
        await Promise.all([
            loadCoins(),
            loadGlobalMarket()
        ]);
    }

    refresh();
    setInterval(refresh, 60000);

})();


/* =========================================
   DESCOP — MOBILE MENU CONFLICT FIX
   ========================================= */

(() => {
    "use strict";

    const menuButton = document.getElementById("mobileMenuButton");
    const navigation = document.getElementById("mainNavigation");

    if (!menuButton || !navigation) return;

    function closeMenu() {
        navigation.classList.remove("open", "active");
        menuButton.classList.remove("active");

        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation menu");
    }

    function openMenu() {
        navigation.classList.add("open");
        navigation.classList.remove("active");

        menuButton.classList.add("active");
        menuButton.setAttribute("aria-expanded", "true");
        menuButton.setAttribute("aria-label", "Close navigation menu");
    }

    /*
     * Handle the hamburger click before the
     * conflicting existing click handlers.
     */
    document.addEventListener("click", function (event) {
        const clickedMenuButton = event.target.closest(
            "#mobileMenuButton"
        );

        if (clickedMenuButton) {
            event.preventDefault();
            event.stopImmediatePropagation();

            const isOpen =
                navigation.classList.contains("open");

            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }

            return;
        }

        // Close after selecting a navigation link.
        if (
            navigation.contains(event.target) &&
            event.target.closest("a")
        ) {
            closeMenu();
            return;
        }

        // Close when clicking outside the menu.
        if (
            !navigation.contains(event.target) &&
            !menuButton.contains(event.target)
        ) {
            closeMenu();
        }
    }, true);

})();