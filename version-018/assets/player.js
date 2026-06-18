(function () {
    function bootPlayer() {
        var video = document.getElementById('movie-video');
        var overlay = document.querySelector('.play-overlay');
        var button = overlay ? overlay.querySelector('button') : null;
        if (!video) {
            return;
        }
        var src = video.getAttribute('data-play-url');
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached || !src) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = src;
        }

        function play() {
            attach();
            video.controls = true;
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }
        if (overlay) {
            overlay.addEventListener('click', function (event) {
                if (event.target === overlay) {
                    play();
                }
            });
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', bootPlayer);
})();
