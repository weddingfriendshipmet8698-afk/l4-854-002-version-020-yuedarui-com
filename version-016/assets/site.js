(function () {
  const menuButton = document.querySelector(".nav-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-slider]").forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll("[data-go-slide]"));
    const prev = slider.querySelector("[data-prev]");
    const next = slider.querySelector("[data-next]");
    let active = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-go-slide")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    const input = scope.querySelector("[data-filter-input]");
    const chips = Array.from(scope.querySelectorAll("[data-chip]"));
    const cards = Array.from(scope.querySelectorAll("[data-search]"));
    const empty = scope.querySelector(".empty-state");
    const params = new URLSearchParams(window.location.search);
    let chipValue = "";

    if (input && params.get("q")) {
      input.value = params.get("q") || "";
    }

    function normalize(value) {
      return String(value || "")
        .trim()
        .toLowerCase();
    }

    function apply() {
      const query = normalize(input ? input.value : "");
      const chip = normalize(chipValue);
      let visible = 0;

      cards.forEach(function (card) {
        const text = normalize(card.getAttribute("data-search"));
        const matchedQuery = !query || text.indexOf(query) !== -1;
        const matchedChip = !chip || text.indexOf(chip) !== -1;
        const matched = matchedQuery && matchedChip;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        chipValue = chip.getAttribute("data-chip") || "";
        apply();
      });
    });

    apply();
  });
})();
