(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.site-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    document.querySelectorAll('img').forEach(function (img) {
      function soften() {
        img.classList.add('is-hidden');
        var wrap = img.closest('.poster-wrap');
        if (wrap) {
          wrap.classList.add('image-soft');
        }
      }
      img.addEventListener('error', soften);
      if (img.complete && img.naturalWidth === 0) {
        soften();
      }
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var index = 0;
      var timer = null;
      function show(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }
      function play() {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          if (timer) {
            window.clearInterval(timer);
          }
          show(i);
          play();
        });
      });
      show(0);
      play();
    }

    document.querySelectorAll('[data-filter-area]').forEach(function (area) {
      var input = area.querySelector('.page-filter');
      var select = area.querySelector('.sort-select');
      var grid = document.querySelector('[data-sort-grid]');
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
      function applyFilter() {
        var q = normalize(input ? input.value : '');
        cards.forEach(function (card) {
          var title = normalize(card.getAttribute('data-title'));
          card.classList.toggle('is-hidden-card', q && title.indexOf(q) === -1);
        });
      }
      function applySort() {
        var value = select ? select.value : 'default';
        var sorted = cards.slice();
        if (value === 'year') {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
          });
        } else if (value === 'views') {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
          });
        } else if (value === 'title') {
          sorted.sort(function (a, b) {
            return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
          });
        }
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }
      if (input) {
        input.addEventListener('input', applyFilter);
      }
      if (select) {
        select.addEventListener('change', function () {
          applySort();
          applyFilter();
        });
      }
    });

    var results = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    var searchInput = document.querySelector('[data-search-input]');
    if (results && window.MOVIE_SEARCH_DATA) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q') || '';
      if (searchInput) {
        searchInput.value = q;
      }
      function render(query) {
        var key = normalize(query);
        if (!key) {
          return;
        }
        var matches = window.MOVIE_SEARCH_DATA.filter(function (item) {
          return normalize(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.year + ' ' + item.genre + ' ' + item.tags + ' ' + item.oneLine).indexOf(key) !== -1;
        }).slice(0, 96);
        if (title) {
          title.textContent = '搜索结果：' + query;
        }
        if (!matches.length) {
          results.innerHTML = '<div class="empty-results">未找到相关内容</div>';
          return;
        }
        results.innerHTML = matches.map(function (item) {
          return '<article class="movie-card">' +
            '<a class="poster-wrap" href="./' + item.url + '">' +
            '<img class="poster-image" src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy" decoding="async">' +
            '<span class="poster-shade"></span><span class="pill top-right">' + escapeHtml(item.type) + '</span><span class="play-badge">播放</span></a>' +
            '<div class="card-body"><div class="meta-line"><span>' + escapeHtml(item.region) + '</span><span>' + item.year + '</span></div>' +
            '<h2><a href="./' + item.url + '">' + escapeHtml(item.title) + '</a></h2>' +
            '<p>' + escapeHtml(item.oneLine) + '</p><div class="tag-row"><span>' + escapeHtml(item.genre.split(/[\/，,、]/)[0] || item.type) + '</span></div></div>' +
            '</article>';
        }).join('');
        results.querySelectorAll('img').forEach(function (img) {
          img.addEventListener('error', function () {
            img.classList.add('is-hidden');
            var wrap = img.closest('.poster-wrap');
            if (wrap) {
              wrap.classList.add('image-soft');
            }
          });
        });
      }
      render(q);
    }
  });

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
