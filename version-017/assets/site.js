import { H as Hls } from "./hls-vendor-dru42stk.js";

function setupMobileMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-mobile-menu]");

    if (!toggle || !menu) {
        return;
    }

    toggle.addEventListener("click", () => {
        menu.classList.toggle("is-open");
        toggle.textContent = menu.classList.contains("is-open") ? "×" : "☰";
    });
}

function setupHeroCarousel() {
    const hero = document.querySelector("[data-hero]");

    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));

    if (slides.length <= 1) {
        return;
    }

    let current = 0;
    let timer = null;

    const activate = (nextIndex) => {
        current = (nextIndex + slides.length) % slides.length;

        slides.forEach((slide, index) => {
            slide.classList.toggle("active", index === current);
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === current);
        });
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => activate(current + 1), 5200);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            activate(Number(dot.dataset.heroDot || 0));
            start();
        });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
}

function setupCardFilters() {
    const toolbars = document.querySelectorAll("[data-filter-toolbar]");

    toolbars.forEach((toolbar) => {
        const container = toolbar.closest("section") || document;
        const searchInput = toolbar.querySelector("[data-card-search]");
        const buttons = Array.from(toolbar.querySelectorAll("[data-filter-type]"));
        const cards = Array.from(container.querySelectorAll("[data-card]"));
        const count = container.querySelector("[data-result-count]");
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q") || "";
        let activeType = "all";

        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        const update = () => {
            const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
            let visible = 0;

            cards.forEach((card) => {
                const haystack = [
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.region,
                    card.dataset.year
                ].join(" ").toLowerCase();
                const typeMatches = activeType === "all" || card.dataset.type === activeType;
                const keywordMatches = !keyword || haystack.includes(keyword);
                const show = typeMatches && keywordMatches;

                card.classList.toggle("is-hidden", !show);
                if (show) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = `当前显示 ${visible} 部影片`;
            }
        };

        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                activeType = button.dataset.filterType || "all";
                buttons.forEach((item) => item.classList.toggle("active", item === button));
                update();
            });
        });

        if (searchInput) {
            searchInput.addEventListener("input", update);
        }

        update();
    });
}

function setupHlsPlayers() {
    const players = document.querySelectorAll("[data-hls-player]");

    players.forEach((box) => {
        const video = box.querySelector("video");
        const button = box.querySelector("[data-play-button]");
        const status = box.querySelector("[data-player-status]");

        if (!video || !button) {
            return;
        }

        const source = video.dataset.src;
        let hls = null;

        const setStatus = (message) => {
            if (status) {
                status.textContent = message;
            }
        };

        const attachSource = () => {
            if (!source || video.dataset.loaded === "true") {
                return;
            }

            if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    maxBufferLength: 30
                });

                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setStatus("播放源已加载，可以开始播放。");
                });
                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data && data.fatal) {
                        setStatus("播放源加载遇到问题，请稍后重试。");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                setStatus("已使用浏览器原生 HLS 播放能力加载片源。");
            } else {
                setStatus("当前浏览器不支持 HLS 播放，请更换支持的浏览器。");
            }

            video.dataset.loaded = "true";
        };

        button.addEventListener("click", async () => {
            attachSource();
            box.classList.add("is-playing");

            try {
                await video.play();
                setStatus("正在播放。");
            } catch (error) {
                setStatus("已加载播放源，请再次点击播放器开始播放。");
            }
        });

        video.addEventListener("play", () => {
            box.classList.add("is-playing");
            setStatus("正在播放。");
        });

        video.addEventListener("pause", () => {
            setStatus("播放已暂停。");
        });

        window.addEventListener("beforeunload", () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupMobileMenu();
    setupHeroCarousel();
    setupCardFilters();
    setupHlsPlayers();
});
