(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var opened = panel.hasAttribute('hidden');
            if (opened) {
                panel.removeAttribute('hidden');
                button.setAttribute('aria-expanded', 'true');
                button.textContent = '×';
            } else {
                panel.setAttribute('hidden', '');
                button.setAttribute('aria-expanded', 'false');
                button.textContent = '☰';
            }
        });
    }

    function initSearchForms() {
        selectAll('.search-go').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    return;
                }
                input.value = input.value.trim();
            });
        });
    }

    function initHero() {
        var hero = document.querySelector('.hero');
        if (!hero) {
            return;
        }
        var slides = selectAll('.hero-slide', hero);
        var dots = selectAll('.hero-dots button', hero);
        var current = 0;
        if (!slides.length) {
            return;
        }
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });
        show(0);
        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function initFilters() {
        var filterArea = document.querySelector('[data-filter-area]');
        if (!filterArea) {
            return;
        }
        var input = filterArea.querySelector('.filter-input');
        var yearSelect = filterArea.querySelector('.filter-year');
        var typeSelect = filterArea.querySelector('.filter-type');
        var cards = selectAll('.searchable-card', filterArea);
        var empty = filterArea.querySelector('.empty-state');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (input && query) {
            input.value = query;
        }
        function apply() {
            var keyword = normalize(input ? input.value : '');
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var cardYear = card.getAttribute('data-year') || '';
                var cardType = card.getAttribute('data-type') || '';
                var matched = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }
                if (type && cardType.indexOf(type) === -1) {
                    matched = false;
                }
                card.classList.toggle('hidden-card', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }
        [input, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initSearchForms();
        initHero();
        initFilters();
    });
})();
