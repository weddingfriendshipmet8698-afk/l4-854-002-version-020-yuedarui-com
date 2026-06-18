(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-off');
    }, { once: true });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    showSlide(0);
    restart();
  }

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage) {
    var input = searchPage.querySelector('[data-search-input]');
    var form = searchPage.querySelector('[data-search-form]');
    var cards = Array.prototype.slice.call(searchPage.querySelectorAll('[data-search-card]'));
    var empty = searchPage.querySelector('[data-search-empty]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function filterCards(value) {
      var term = normalize(value);
      var hasVisible = false;

      cards.forEach(function (card) {
        var text = card.getAttribute('data-search-text') || '';
        var matched = !term || text.indexOf(term) !== -1;
        card.hidden = !matched;

        if (matched) {
          hasVisible = true;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', !hasVisible);
      }
    }

    if (input) {
      input.value = initial;
      input.addEventListener('input', function () {
        filterCards(input.value);
      });
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        filterCards(input ? input.value : '');
      });
    }

    filterCards(initial);
  }
})();
