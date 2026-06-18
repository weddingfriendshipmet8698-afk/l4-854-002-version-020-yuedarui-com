(function () {
  const shell = document.querySelector("[data-player]");

  if (!shell) {
    return;
  }

  const video = shell.querySelector("video");
  const cover = shell.querySelector(".player-cover");
  const sourceElement = document.getElementById("stream-source");
  const sourceUrl = sourceElement ? sourceElement.textContent.trim() : "";
  let attached = false;
  let instance = null;

  function attachWith(constructor) {
    instance = new constructor({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
    });
    instance.loadSource(sourceUrl);
    instance.attachMedia(video);
  }

  async function attach() {
    if (attached || !video || !sourceUrl) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      attachWith(window.Hls);
      return;
    }

    try {
      const vendorUrl = new URL("hls-vendor.js", document.currentScript.src)
        .href;
      const module = await import(vendorUrl);
      const LocalHls = module.H || module.default;
      if (LocalHls && LocalHls.isSupported()) {
        attachWith(LocalHls);
        return;
      }
    } catch (error) {}

    video.src = sourceUrl;
  }

  async function start() {
    await attach();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    video.controls = true;
    const play = video.play();
    if (play && typeof play.catch === "function") {
      play.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  window.addEventListener("pagehide", function () {
    if (instance && typeof instance.destroy === "function") {
      instance.destroy();
    }
  });
})();
