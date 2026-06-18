(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call(
      (scope || document).querySelectorAll(selector),
    );
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", slider);
    var dots = selectAll("[data-hero-dot]", slider);
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.dataset.heroDot || 0));
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    show(0);
    play();
  }

  function initFilters() {
    selectAll("[data-filter-panel]").forEach(function (panel) {
      var section = panel.closest("section") || document;
      var cards = selectAll("[data-search]", section);
      var input = panel.querySelector("[data-search-input]");
      var typeFilter = panel.querySelector("[data-type-filter]");
      var regionFilter = panel.querySelector("[data-region-filter]");
      var clear = panel.querySelector("[data-clear-filter]");
      var count = panel.querySelector("[data-filter-count]");
      var empty = section.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");

      if (initialQuery && input) {
        input.value = initialQuery;
      }

      function normalize(value) {
        return String(value || "")
          .trim()
          .toLowerCase();
      }

      function apply() {
        var query = normalize(input && input.value);
        var type = typeFilter ? typeFilter.value : "";
        var region = regionFilter ? regionFilter.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var matchesQuery =
            !query || normalize(card.dataset.search).indexOf(query) !== -1;
          var matchesType = !type || card.dataset.type === type;
          var matchesRegion = !region || card.dataset.region === region;
          var show = matchesQuery && matchesType && matchesRegion;
          card.classList.toggle("is-hidden", !show);
          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible ? "找到 " + visible + " 部" : "暂无结果";
        }
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, typeFilter, regionFilter].forEach(function (field) {
        if (field) {
          field.addEventListener("input", apply);
          field.addEventListener("change", apply);
        }
      });

      if (clear) {
        clear.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (typeFilter) {
            typeFilter.value = "";
          }
          if (regionFilter) {
            regionFilter.value = "";
          }
          apply();
        });
      }

      apply();
    });
  }

  function attachStream(video, source) {
    if (!video || !source) {
      return;
    }
    if (video.dataset.streamReady === source) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (video._hlsPlayer) {
        video._hlsPlayer.destroy();
      }
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsPlayer = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.load();
    } else {
      video.src = source;
      video.load();
    }
    video.dataset.streamReady = source;
  }

  function initPlayers() {
    selectAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video[data-src]");
      var button = player.querySelector("[data-play-button]");
      if (!video) {
        return;
      }
      var source = video.dataset.src;

      function start() {
        attachStream(video, source);
        player.classList.add("is-playing");
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            video.controls = true;
          });
        }
      }

      if (button) {
        button.addEventListener("click", start);
      }
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("click", function () {
        attachStream(video, source);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
