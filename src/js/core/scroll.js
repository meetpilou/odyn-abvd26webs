/**
 * -----------------------------------------------------------------
 * scroll.js
 * Lenis smooth scroll + ScrollTrigger helpers
 * -----------------------------------------------------------------
 */

let _lenis = null;

const SCROLL_OFFSET = 200;
const hasLenis = typeof window.Lenis !== "undefined";
const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

/**
 * Lenis
 */

/** Returns the current Lenis instance (may be null before initLenis is called). */

const getLenis = () => _lenis;

function initLenis() {
  if (_lenis) return; // already initialised
  if (!hasLenis) return;

  _lenis = new Lenis({
    lerp: 0.165,
    wheelMultiplier: 1.25,
  });

  if (hasScrollTrigger) {
    _lenis.on("scroll", ({ scroll, direction }) => {
      let d = null;
      ScrollTrigger.update();
      updateScrollStart(scroll);

      if (scroll > SCROLL_OFFSET) {
        if (direction === 1) d = "down";
        else if (direction === -1) d = "up";
      }

      if (d) updateScrollDirection(d);
    });
  }

  gsap.ticker.add((time) => {
    _lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

function updateScrollDirection(direction) {
  // Update scroll direction data attribute
  const elements = document.querySelectorAll("[data-scrolling-direction]");
  elements.forEach((el) => {
    el.setAttribute("data-scrolling-direction", direction);
  });
}

/* --- Update Scroll Start Attribute --- */

function updateScrollStart(scroll) {
  // Update scroll start attribute when user scrolls past offset
  const elements = document.querySelectorAll("[data-scrolling-started]");
  elements.forEach((el) => {
    const value = scroll > SCROLL_OFFSET ? "true" : "false";
    el.setAttribute("data-scrolling-started", value);
  });
}

function startLenis() {
  if (_lenis && typeof _lenis.start === "function") {
    _lenis.start();
  }
}

function stopLenis() {
  if (_lenis && typeof _lenis.stop === "function") {
    _lenis.stop();
  }
}

function updateLenis() {
  if (_lenis && typeof _lenis.resize === "function") {
    _lenis.resize();
  }
}

/**
 * ScrollTrigger
 */

function refreshScrollTrigger() {
  if (hasScrollTrigger) {
    ScrollTrigger.refresh();
  }
}

function killAllScrollTriggers() {
  if (hasScrollTrigger) {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
}

/**
 * Scroll Position Helpers
 */

/** Smooth-scroll to a DOM element via Lenis. */

function scrollToElement(el) {
  if (!hasLenis || !_lenis) return;

  _lenis.scrollTo(el, {
    offset: SCROLL_OFFSET,
    duration: 1.1,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
}

/** Instantly reset scroll position to top. */

function scrollToTop() {
  window.scrollTo(0, 0);

  if (!hasLenis || !_lenis) return;

  _lenis.scrollTo(0, {
    immediate: true,
    force: true,
    lock: true,
  });
}

/**
 * Export methods
 */

export {
  hasLenis,
  hasScrollTrigger,
  getLenis,
  initLenis,
  startLenis,
  stopLenis,
  updateLenis,
  refreshScrollTrigger,
  killAllScrollTriggers,
  scrollToElement,
  scrollToTop,
};
