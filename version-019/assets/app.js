(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMobileMenu() {
    const button = document.querySelector(".menu-toggle");
    const panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      const open = panel.classList.toggle("open");
      panel.setAttribute("aria-hidden", open ? "false" : "true");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    restart();
  }

  function setupFilters() {
    const forms = document.querySelectorAll("[data-filter-form]");
    forms.forEach(function (form) {
      const input = form.querySelector("[data-filter-input]");
      const cards = Array.from(document.querySelectorAll(".movie-card"));
      if (!input || cards.length === 0) {
        return;
      }
      form.addEventListener("submit", function (event) {
        event.preventDefault();
      });
      input.addEventListener("input", function () {
        const query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          const text = (card.getAttribute("data-search-text") || "").toLowerCase();
          card.classList.toggle("is-hidden", Boolean(query) && !text.includes(query));
        });
      });
    });
  }

  function createSearchCard(item) {
    const tags = item.tags.slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a href=\"./" + escapeHtml(item.url) + "\" class=\"poster-link\" aria-label=\"观看 " + escapeHtml(item.title) + "\">" +
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-glow\"></span>" +
      "<span class=\"play-pill\">播放</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"movie-meta-row\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.score) + "</span></div>" +
      "<h2><a href=\"./" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h2>" +
      "<p>" + escapeHtml(item.description) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function setupSearchPage() {
    const results = document.getElementById("search-results");
    const input = document.querySelector("[data-search-page-input]");
    const title = document.querySelector("[data-search-title]");
    const note = document.querySelector("[data-search-note]");
    if (!results || !input || !window.SEARCH_DATA) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const query = (params.get("q") || "").trim();
    input.value = query;
    if (!query) {
      return;
    }
    const lower = query.toLowerCase();
    const matched = window.SEARCH_DATA.filter(function (item) {
      return item.searchText.toLowerCase().includes(lower);
    }).slice(0, 80);
    if (title) {
      title.textContent = "搜索结果";
    }
    if (note) {
      note.textContent = query;
    }
    if (matched.length === 0) {
      results.innerHTML = "<div class=\"text-panel\"><h2>未找到相关影片</h2><p>可以尝试输入更短的片名、题材、年份或地区。</p></div>";
      return;
    }
    results.innerHTML = matched.map(createSearchCard).join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();

function initMoviePlayer(sourceUrl) {
  const video = document.getElementById("movie-video");
  const trigger = document.getElementById("play-trigger");
  if (!video || !trigger || !sourceUrl) {
    return;
  }

  let prepared = false;
  let hlsInstance = null;

  function prepare() {
    if (prepared) {
      return;
    }
    prepared = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function start() {
    prepare();
    trigger.classList.add("is-hidden");
    const playTask = video.play();
    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {
        trigger.classList.remove("is-hidden");
      });
    }
  }

  trigger.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener("play", function () {
    trigger.classList.add("is-hidden");
  });
  video.addEventListener("pause", function () {
    if (!video.ended) {
      trigger.classList.remove("is-hidden");
    }
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
