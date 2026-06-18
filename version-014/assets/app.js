(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuToggle = document.querySelector('[data-menu-toggle]');
        var mobilePanel = document.querySelector('[data-mobile-panel]');

        if (menuToggle && mobilePanel) {
            menuToggle.addEventListener('click', function () {
                mobilePanel.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"], input[type="search"]');
                var keyword = input ? input.value.trim() : '';

                if (!keyword) {
                    event.preventDefault();
                    return;
                }

                event.preventDefault();
                window.location.href = './search.html?q=' + encodeURIComponent(keyword);
            });
        });

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function activateHero(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startHero() {
            if (timer) {
                window.clearInterval(timer);
            }

            if (slides.length > 1) {
                timer = window.setInterval(function () {
                    activateHero(current + 1);
                }, 5200);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                activateHero(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                activateHero(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                activateHero(current + 1);
                startHero();
            });
        }

        startHero();

        document.querySelectorAll('[data-filter-root]').forEach(function (root) {
            var input = root.querySelector('[data-filter-input]');
            var typeSelect = root.querySelector('[data-filter-type]');
            var yearSelect = root.querySelector('[data-filter-year]');
            var status = root.querySelector('[data-filter-status]');
            var container = root.parentElement.querySelector('[data-card-container]') || document;
            var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));
            var params = new URLSearchParams(window.location.search);
            var initialKeyword = params.get('q') || '';

            if (input && initialKeyword) {
                input.value = initialKeyword;
            }

            function matchesYear(cardYear, selectedYear) {
                if (!selectedYear) {
                    return true;
                }

                if (selectedYear === '2019') {
                    var numericYear = parseInt(cardYear, 10);
                    return Number.isFinite(numericYear) && numericYear <= 2019;
                }

                return cardYear === selectedYear;
            }

            function filterCards() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var selectedType = typeSelect ? typeSelect.value : '';
                var selectedYear = yearSelect ? yearSelect.value : '';
                var shown = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-category'),
                        card.getAttribute('data-tags'),
                        card.textContent
                    ].join(' ').toLowerCase();
                    var type = card.getAttribute('data-type') || '';
                    var year = card.getAttribute('data-year') || '';
                    var visible = true;

                    if (keyword && text.indexOf(keyword) === -1) {
                        visible = false;
                    }

                    if (selectedType && type !== selectedType) {
                        visible = false;
                    }

                    if (!matchesYear(year, selectedYear)) {
                        visible = false;
                    }

                    card.classList.toggle('is-hidden', !visible);

                    if (visible) {
                        shown += 1;
                    }
                });

                if (status) {
                    status.textContent = shown > 0 ? '已为你筛选出匹配内容。' : '暂未匹配到影片，请调整关键词。';
                }
            }

            [input, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', filterCards);
                    control.addEventListener('change', filterCards);
                }
            });

            filterCards();
        });
    });
}());
