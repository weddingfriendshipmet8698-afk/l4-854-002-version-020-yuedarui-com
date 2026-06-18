(function () {
  function attachSource(video, source) {
    if (!video || !source || video.dataset.ready === '1') {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video.dataset.ready = '1';
      video._hls = hls;
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.dataset.ready = '1';
    }
  }

  function startPlayer(player) {
    var video = player.querySelector('video');
    var source = player.getAttribute('data-stream');

    attachSource(video, source);

    if (video) {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');

    if (button) {
      button.addEventListener('click', function () {
        startPlayer(player);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayer(player);
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          player.classList.remove('is-playing');
        }
      });
    }
  });
})();
