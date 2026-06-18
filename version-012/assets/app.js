(function() {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function() {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var carousel = qs('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var prev = qs('[data-hero-prev]', carousel);
    var next = qs('[data-hero-next]', carousel);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function(value) {
      if (!value) {
        return;
      }
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var list = qs('[data-filter-list]');
    if (!list) {
      return;
    }
    var cards = qsa('[data-title]', list);
    var input = qs('[data-filter-input]');
    var regionSelect = qs('[data-filter-region]');
    var yearSelect = qs('[data-filter-year]');
    var typeSelect = qs('[data-filter-type]');
    var count = qs('[data-visible-count]');
    var regions = Array.from(new Set(cards.map(function(card) { return card.getAttribute('data-region'); }).filter(Boolean))).sort();
    var years = Array.from(new Set(cards.map(function(card) { return card.getAttribute('data-year'); }).filter(Boolean))).sort().reverse();
    var types = Array.from(new Set(cards.map(function(card) { return card.getAttribute('data-type'); }).filter(Boolean))).sort();
    fillSelect(regionSelect, regions);
    fillSelect(yearSelect, years);
    fillSelect(typeSelect, types);

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;
      cards.forEach(function(card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' ').toLowerCase();
        var ok = true;
        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          ok = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          ok = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          ok = false;
        }
        card.setAttribute('data-filter-hidden', ok ? 'false' : 'true');
        if (ok) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = String(visible);
      }
    }

    [input, regionSelect, yearSelect, typeSelect].forEach(function(control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function(char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function movieTemplate(movie) {
    return [
      '<article class="movie-card">',
      '<a class="movie-link" href="' + escapeHtml(movie.href) + '" title="' + escapeHtml(movie.title) + '">',
      '<div class="poster-frame">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '封面" loading="lazy">',
      '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '<span class="play-mark">▶</span>',
      '</div>',
      '<div class="movie-card-body">',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="movie-meta-row"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.category) + '</span></div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function initSearchPage() {
    var box = qs('#search-results');
    if (!box || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get('q') || '').trim();
    var input = qs('#search-input');
    var title = qs('[data-search-title]');
    if (input) {
      input.value = keyword;
    }
    var list = window.SEARCH_MOVIES;
    if (keyword) {
      var lower = keyword.toLowerCase();
      list = list.filter(function(movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine, movie.category]
          .join(' ')
          .toLowerCase()
          .indexOf(lower) !== -1;
      });
      if (title) {
        title.textContent = '搜索结果：' + keyword;
      }
    } else {
      list = list.slice(0, 60);
    }
    box.innerHTML = list.map(movieTemplate).join('') || '<p class="empty-text">没有找到匹配内容。</p>';
  }

  document.addEventListener('DOMContentLoaded', function() {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
  });
}());
