/**
 * -----------------------------------------------------------------
 * config.js
 * Constants, GSAP defaults, CustomEases, MediaQueries
 * -----------------------------------------------------------------
 */

const GSAP_CONFIG = {
  stagger: 0.05,
  duration: {
    regular: 0.6,
    fast: 0.3,
    slow: 1.2,
  },
};

const GSAP_EASE = {
  osmo: "0.625, 0.05, 0, 1",
  spring: "0.37, 0, 0.63, 1",
  overshoot: "0.34, 1.56, 0.64, 1",
  parallax: "0.7, 0.05, 0.13, 1",
};

const MEDIAQUERIES = {
  isMobile: "(max-width: 479px)",
  isMobileLandscape: "(max-width: 767px)",
  isTablet: "(max-width: 991px)",
  isDesktop: "(min-width: 992px)",
  isReducedMotion: "(prefers-reduced-motion: reduce)",
};

/**
 * Reduced motion — reactive, importable anywhere
 */

const _rmMQ = window.matchMedia(MEDIAQUERIES.isReducedMotion);
let reducedMotion = _rmMQ.matches;
const getReducedMotion = () => reducedMotion;

_rmMQ.addEventListener?.("change", (e) => (reducedMotion = e.matches));
_rmMQ.addListener?.((e) => (reducedMotion = e.matches)); // Safari < 14 fallback

/**
 * GSAP setup — call once at startup
 */

function initGSAP() {
  if (typeof CustomEase !== "undefined") {
    CustomEase.create("osmo", GSAP_EASE.osmo);
    CustomEase.create("spring", GSAP_EASE.spring);
    CustomEase.create("overshoot", GSAP_EASE.overshoot);
    CustomEase.create("parallax", GSAP_EASE.parallax);
  }

  gsap.defaults({
    duration: GSAP_CONFIG.duration.regular,
    ease: "osmo",
  });

  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.defaults({ markers: false });
  }
}

/**
 * Export methods
 */

export { GSAP_CONFIG, GSAP_EASE, MEDIAQUERIES, getReducedMotion, initGSAP };
