(function () {
  function initMoviePlayer(options) {
    var video = options.video;
    var overlay = options.overlay;
    var source = options.source;
    var hlsInstance = null;
    var started = false;

    function attachSource() {
      if (started || !video || !source) {
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function beginPlay() {
      attachSource();

      if (overlay) {
        overlay.hidden = true;
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', beginPlay);
    }

    if (video) {
      video.addEventListener('play', attachSource);
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
