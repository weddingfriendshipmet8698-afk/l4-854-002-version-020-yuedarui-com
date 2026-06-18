function initMoviePlayer(source) {
    var video = document.getElementById('movie-player');
    var cover = document.querySelector('[data-player-trigger]');
    var scrollButton = document.querySelector('[data-scroll-player]');
    var hls = null;
    var prepared = false;

    if (!video || !source) {
        return;
    }

    function prepare() {
        if (prepared) {
            return;
        }

        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function play() {
        prepare();

        if (cover) {
            cover.classList.add('is-hidden');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener('play', function () {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    });

    if (scrollButton) {
        scrollButton.addEventListener('click', function () {
            video.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            play();
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
        }
    });
}
