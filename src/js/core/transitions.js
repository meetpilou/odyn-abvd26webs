/**
 * -----------------------------------------------------------------
 * transitions.js
 * Page animation timelines + native navigation handling.
 * - runPageOnceAnimation  : intro on every page load
 * - runPageLeaveAnimation : outro before navigating away
 * - initLeaveTransition   : click interceptor
 * - initPrefetch          : hover prefetch
 * No Barba dependency — works with native browser navigation.
 * -----------------------------------------------------------------
 */

import { getReducedMotion } from "./config.js";
import { hasLenis, updateLenis, startLenis, stopLenis, scrollToTop, refreshScrollTrigger } from "./scroll.js";

/**
 * Duration constants
 */

export const ONCE_DURATION = 2.35;
export const LEAVE_DURATION = 1;

/**
 * isFirstLoad
 * True only on the very first page load of a session.
 * Exported so other modules can branch on first-load behaviour.
 */

export const isFirstLoad = !sessionStorage.getItem("visited");
if (isFirstLoad) sessionStorage.setItem("visited", "1");

// ---------------------------------------------------------------------------

/**
 * resetPage
 * Called at the end of every intro animation.
 * Clears inline GSAP props and restarts Lenis.
 */

function resetPage(container) {
  gsap.set(container, { clearProps: "all" });

  if (hasLenis) {
    updateLenis();
    startLenis();
    refreshScrollTrigger();
  }
}

// ---------------------------------------------------------------------------

/**
 * runPageOnceAnimation
 * Plays on every fresh page load.
 *
 * @param {Element} container  — the page container element
 * @returns {Promise}
 */

export function runPageOnceAnimation(container) {
  const pageWrapper = document.querySelector(".page-wrapper");
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const panel = transitionWrap.querySelector("[data-transition-panel]");
  const panelTop = transitionWrap.querySelector("[data-transition-panel-top]");
  const panelBottom = transitionWrap.querySelector("[data-transition-panel-bottom]");
  const logo = transitionWrap.querySelector("[data-transition-logo]");

  const tl = gsap.timeline();
  
  if (getReducedMotion()) {
    tl.set(pageWrapper, { autoAlpha: 1 });
    tl.set(panel, { autoAlpha: 0 });
    tl.set(container, { autoAlpha: 1 });
    tl.call(resetPage, [container]);
    return new Promise((resolve) => tl.call(resolve));
  }
  
  stopLenis();

  // Initial states
  tl.set(pageWrapper, { autoAlpha: 1 });
  tl.set(panel, { autoAlpha: 1, yPercent: -100 }, 0);
  tl.set(panelTop, { scaleY: 1, height: "15vw" }, 0);
  tl.set(panelBottom, { scaleY: 1, height: "20vw" }, 0);
  tl.set(container, { autoAlpha: 0 }, 0);

  // Panel slide out + page reveal
  // Delay only on first load of the session (logo display time),
  // instant on subsequent page navigations.
  tl.add("startEnter", isFirstLoad ? 0.5 : 0.5);

  tl.set(container, { autoAlpha: 1 }, "startEnter");

  tl.fromTo(
    panel,
    { yPercent: -100 },
    { yPercent: -200, duration: 1, overwrite: "auto", immediateRender: false },
    "startEnter"
  );

  tl.fromTo(panelBottom, { scaleY: 1 }, { scaleY: 0, duration: 1 }, "<");

  tl.set(panel, { autoAlpha: 0 }, ">");

  tl.from(container, { y: "25dvh", duration: 1 }, "startEnter");

  tl.add("pageReady");
  tl.call(resetPage, [container], "pageReady");

  return new Promise((resolve) => tl.call(resolve, null, "pageReady"));


}

// ---------------------------------------------------------------------------

/**
 * runPageLeaveAnimation
 * Plays when the user clicks an internal link, before the browser navigates.
 *
 * @param {Element} container  — the current page container
 * @returns {GSAPTimeline}
 */

export function runPageLeaveAnimation(container) {
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const panel = transitionWrap.querySelector("[data-transition-panel]");
  const panelTop = transitionWrap.querySelector("[data-transition-panel-top]");
  const panelBottom = transitionWrap.querySelector("[data-transition-panel-bottom]");

  const tl = gsap.timeline();

  if (getReducedMotion()) {
    return tl.set(container, { autoAlpha: 0 });
  }

  // Initial states
  tl.set(panel, { autoAlpha: 1 }, 0);
  tl.set(panelTop, { scaleY: 0, height: "15vw" }, 0);
  tl.set(panelBottom, { scaleY: 1, height: "20vw" }, 0);

  // Panel slide in
  tl.fromTo(panel, { yPercent: 0 }, { yPercent: -100, duration: 1 }, 0);
  tl.fromTo(panelTop, { scaleY: 0 }, { scaleY: 1, duration: 1 }, "<");

  // Page slides up and out
  tl.fromTo(container, { y: "0vh" }, { y: "-15dvh", duration: 1 }, 0);

  return tl;
}

// ---------------------------------------------------------------------------

/**
 * initLeaveTransition
 * Intercepts internal link clicks, plays the leave animation,
 * then lets the browser navigate natively.
 */

export function initLeaveTransition() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");

    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      link.hostname !== location.hostname ||
      link.target === "_blank" ||
      e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
    ) return;

    e.preventDefault();

    const container =
      document.querySelector("[data-barba='container']") || document.body;
    runPageLeaveAnimation(container);

    gsap.delayedCall(LEAVE_DURATION, () => {
      window.location.href = href;
    });
  });
}

// ---------------------------------------------------------------------------

/**
 * initPrefetch
 * Prefetches internal pages on link hover to speed up navigation.
 */

export function initPrefetch() {
  const seen = new Set();

  document.addEventListener("mouseover", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    const href = link.href;
    if (!href || seen.has(href)) return;
    if (link.hostname !== location.hostname) return;
    if (href.startsWith("mailto:") || href.startsWith("tel:")) return;

    seen.add(href);

    const prefetchLink = document.createElement("link");
    prefetchLink.rel = "prefetch";
    prefetchLink.href = href;
    document.head.appendChild(prefetchLink);
  });
}