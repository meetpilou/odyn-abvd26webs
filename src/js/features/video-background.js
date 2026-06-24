/**
 * @file video-background.js
 * @summary Initializes HLS-compatible background video players for [data-video-background] elements.
 * @description For each element, attaches an HLS or native video source, manages autoplay via
 * IntersectionObserver, handles play/pause/mute controls, and keeps [data-player-status] and
 * [data-player-activated] attributes in sync throughout the video lifecycle.
 * Supports lazy loading, Safari native HLS, and hls.js for other browsers.
 */

/**
 * Initializes background video players on all [data-video-background] elements within the given scope.
 * Detects HLS support per browser, wires control buttons, manages autoplay visibility,
 * and exposes status attributes for CSS-driven UI states.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search for [data-video-background] elements.
 */
export function initVideoBackground(scope = document) {
  const elements = scope.querySelectorAll("[data-video-background]");
  if (!elements.length) return;

  elements.forEach((element) => {
    const src = element.getAttribute("data-player-src");
    if (!src) return;

    const video = element.querySelector("video");
    if (!video) return;

    // Reset any previously attached source
    try {
      video.pause();
    } catch (_) {}
    try {
      video.removeAttribute("src");
      video.load();
    } catch (_) {}

    // Helpers to update status and activated attributes
    function setStatus(s) {
      if (element.getAttribute("data-player-status") !== s) {
        element.setAttribute("data-player-status", s);
      }
    }

    function setActivated(v) {
      element.setAttribute("data-player-activated", v ? "True" : "False");
    }
    if (!element.hasAttribute("data-player-activated")) setActivated(false);

    // Read configuration from data attributes
    const lazyMode = element.getAttribute("data-player-lazy");
    const isLazyTrue = lazyMode === "True";
    const autoplay = element.getAttribute("data-player-autoplay") === "True";
    const initialMuted = element.getAttribute("data-player-muted") === "True";

    let pendingPlay = false;

    // Configure mute and loop based on autoplay mode
    if (autoplay) {
      video.muted = true;
      video.loop = true;
    } else {
      video.muted = initialMuted;
    }

    // Force inline playback attributes for mobile compatibility
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.playsInline = true;
    if (typeof video.disableRemotePlayback !== "undefined")
      video.disableRemotePlayback = true;
    if (autoplay) video.autoplay = false;

    // Detect HLS support — prefer native Safari over hls.js
    const isSafariNative = !!video.canPlayType("application/vnd.apple.mpegurl");
    const canUseHlsJs = !!(window.Hls && Hls.isSupported()) && !isSafariNative;

    let isAttached = false;
    let userInteracted = false;
    let lastPauseBy = "";

    function attachMediaOnce() {
      if (isAttached) return;
      isAttached = true;

      // Destroy any existing hls.js instance before re-attaching
      if (element._hls) {
        try {
          element._hls.destroy();
        } catch (_) {}
        element._hls = null;
      }

      if (isSafariNative) {
        video.preload = isLazyTrue ? "none" : "auto";
        video.src = src;
        video.addEventListener(
          "loadedmetadata",
          () => readyIfIdle(element, pendingPlay),
          { once: true }
        );
      } else if (canUseHlsJs) {
        // Attach hls.js with a conservative buffer to limit memory usage
        const hls = new Hls({ maxBufferLength: 10 });
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(src));
        hls.on(Hls.Events.MANIFEST_PARSED, () =>
          readyIfIdle(element, pendingPlay)
        );
        element._hls = hls;
      } else {
        video.src = src;
      }
    }

    // Attach immediately unless lazy loading is enabled
    if (isLazyTrue) {
      video.preload = "none";
    } else {
      attachMediaOnce();
    }

    function togglePlay() {
      userInteracted = true;
      if (video.paused || video.ended) {
        if (isLazyTrue && !isAttached) attachMediaOnce();
        pendingPlay = true;
        lastPauseBy = "";
        setStatus("loading");
        safePlay(video);
      } else {
        lastPauseBy = "manual";
        video.pause();
      }
    }

    function toggleMute() {
      video.muted = !video.muted;
      element.setAttribute("data-player-muted", video.muted ? "True" : "False");
    }

    // Delegate control button clicks to play/pause/mute handlers
    element.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-player-control]");
      if (!btn || !element.contains(btn)) return;
      const type = btn.getAttribute("data-player-control");
      if (type === "play" || type === "pause" || type === "playpause")
        togglePlay();
      else if (type === "mute") toggleMute();
    });

    // Sync status attribute with native video events
    video.addEventListener("play", () => {
      setActivated(true);
      setStatus("playing");
    });
    video.addEventListener("playing", () => {
      pendingPlay = false;
      setStatus("playing");
    });
    video.addEventListener("pause", () => {
      pendingPlay = false;
      setStatus("paused");
    });
    video.addEventListener("waiting", () => setStatus("loading"));
    video.addEventListener("canplay", () => readyIfIdle(element, pendingPlay));
    video.addEventListener("ended", () => {
      pendingPlay = false;
      setStatus("paused");
      setActivated(false);
    });

    // Auto-pause when scrolled out of view, auto-resume when back in view
    if (autoplay) {
      if (element._io) {
        try {
          element._io.disconnect();
        } catch (_) {}
      }

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const inView = entry.isIntersecting && entry.intersectionRatio > 0;
            if (inView) {
              if (isLazyTrue && !isAttached) attachMediaOnce();
              if (
                lastPauseBy === "io" ||
                (video.paused && lastPauseBy !== "manual")
              ) {
                setStatus("loading");
                if (video.paused) togglePlay();
                lastPauseBy = "";
              }
            } else {
              if (!video.paused && !video.ended) {
                lastPauseBy = "io";
                video.pause();
              }
            }
          });
        },
        { threshold: 0.1 }
      );

      io.observe(element);
      element._io = io;
    }
  });

  // Mark element as ready only if it has never been activated and is still idle
  function readyIfIdle(element, pendingPlay) {
    if (
      !pendingPlay &&
      element.getAttribute("data-player-activated") !== "True" &&
      element.getAttribute("data-player-status") === "idle"
    ) {
      element.setAttribute("data-player-status", "ready");
    }
  }

  // Suppress unhandled promise rejections from video.play()
  function safePlay(video) {
    const p = video.play();
    if (p && typeof p.then === "function") p.catch(() => {});
  }
}
