(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;
  var slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  function startSlider() {
    if (slides.length < 2) {
      return;
    }

    slideTimer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      if (slideTimer) {
        window.clearInterval(slideTimer);
      }
      showSlide(index);
      startSlider();
    });
  });

  startSlider();

  var params = new URLSearchParams(window.location.search);
  var queryValue = params.get('q') || '';
  var queryInputs = Array.prototype.slice.call(document.querySelectorAll('.search-query-input'));

  queryInputs.forEach(function (input) {
    input.value = queryValue;
  });

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('.filter-input'));

  function filterCards(value) {
    var term = String(value || '').trim().toLowerCase();
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var matched = !term || haystack.indexOf(term) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visibleCount += 1;
      }
    });

    Array.prototype.slice.call(document.querySelectorAll('.empty-result')).forEach(function (empty) {
      empty.style.display = visibleCount ? 'none' : 'block';
    });
  }

  if (queryValue) {
    filterCards(queryValue);
  }

  filterInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      filterCards(input.value);
    });
  });
})();
