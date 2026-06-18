(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.player-overlay');
      var source = shell.getAttribute('data-src');
      var loaded = false;
      var hls = null;

      function loadAndPlay() {
        if (!video || !source) {
          return;
        }
        if (!loaded) {
          loaded = true;
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
          } else {
            video.src = source;
          }
        }
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', loadAndPlay);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!loaded) {
            loadAndPlay();
          }
        });
        video.addEventListener('play', function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
        });
        video.addEventListener('pause', function () {
          if (video.currentTime === 0 && overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
        window.addEventListener('pagehide', function () {
          if (hls) {
            hls.destroy();
          }
        });
      }
    });
  });
})();
