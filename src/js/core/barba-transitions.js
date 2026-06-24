/**
 * -----------------------------------------------------------------
 * transitions.js
 * GSAP page animation timelines: once, leave, enter
 * -----------------------------------------------------------------
 */

import {
  hasLenis,
  hasScrollTrigger,
  updateLenis,
  startLenis,
} from "./scroll.js";

import { getReducedMotion } from "./config.js";

/**
 * Reset Page
 * Called at the end of every enter / once animation.
 */

function resetPage(container) {
  window.scrollTo(0, 0);

  gsap.set(container, { clearProps: "all" });

  if (hasLenis) {
    updateLenis();
    startLenis();
  }
}

/**
 * Once
 * First Load
 */

function runPageOnceAnimation(next) {
  const pageWrapper = document.querySelector(".page-wrapper");
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionPanel = transitionWrap.querySelector(
    "[data-transition-panel]"
  );
  const transitionPanelTop = transitionWrap.querySelector(
    "[data-transition-panel-top]"
  );
  const transitionPanelBottom = transitionWrap.querySelector(
    "[data-transition-panel-bottom]"
  );
  const transitionLogo = transitionWrap.querySelector("[data-transition-logo]");

  const tl = gsap.timeline();

  if (getReducedMotion()) {
    tl.set(pageWrapper, { autoAlpha: 1 });
    tl.set(transitionPanel, { autoAlpha: 0 });
    tl.set(next, { autoAlpha: 1 });
    tl.call(resetPage, [next]);
    return tl;
  }

  tl.set(pageWrapper, { autoAlpha: 1 });
  tl.set(transitionPanel, { autoAlpha: 1, yPercent: -100 }, 0);
  tl.set(transitionPanelTop, { scaleY: 1, height: "15vw" }, 0);
  tl.set(transitionPanelBottom, { scaleY: 1, height: "20vw" }, 0);
  tl.set(next, { autoAlpha: 0 }, 0);

  tl.fromTo(
    transitionLogo,
    {
      scale: 1.2,
      autoAlpha: 0,
      //yPercent: 100,
    },
    {
      scale: 1,
      autoAlpha: 1,
      // yPercent: -50,
      duration: 2,
      ease: "expo.out",
    },
    0.5
  );

  tl.add("startEnter", 1.35);

  tl.set(next, { autoAlpha: 1 }, "startEnter");

  tl.fromTo(
    transitionPanel,
    {
      yPercent: -100,
    },
    {
      yPercent: -200,
      duration: 1,
      overwrite: "auto",
      immediateRender: false,
    },
    "startEnter"
  );

  tl.fromTo(
    transitionPanelBottom,
    {
      scaleY: 1,
    },
    {
      scaleY: 0,
      duration: 1,
    },
    "<"
  );

  tl.set(transitionPanel, { autoAlpha: 0 }, ">");

  tl.from(
    next,
    {
      y: "25dvh",
      duration: 1,
    },
    "startEnter"
  );

  tl.add("pageReady");
  tl.call(resetPage, [next], "pageReady");

  return tl;
}

/**
 * Leave
 * Current Page Exists
 */

function runPageLeaveAnimation(current, next) {
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionPanel = transitionWrap.querySelector(
    "[data-transition-panel]"
  );
  const transitionPanelTop = transitionWrap.querySelector(
    "[data-transition-panel-top]"
  );
  const transitionPanelBottom = transitionWrap.querySelector(
    "[data-transition-panel-bottom]"
  );
  const transitionLogo = transitionWrap.querySelector("[data-transition-logo]");

  const tl = gsap.timeline({
    onComplete: () => {
      current.remove();
    },
  });

  if (getReducedMotion()) {
    // Immediate swap behavior if user prefers reduced motion
    return tl.set(current, { autoAlpha: 0 });
  }

  tl.set(transitionLogo, {
    autoAlpha: 0,
  });

  tl.set(
    transitionPanel,
    {
      autoAlpha: 1,
    },
    0
  );

  tl.set(
    transitionPanelTop,
    {
      scaleY: 0,
      height: "15vw",
    },
    0
  );

  tl.set(
    transitionPanelBottom,
    {
      scaleY: 1,
      height: "20vw",
    },
    0
  );

  tl.set(
    next,
    {
      autoAlpha: 0,
    },
    0
  );

  tl.fromTo(
    transitionPanel,
    {
      yPercent: 0,
    },
    {
      yPercent: -100,
      duration: 1,
    },
    0
  );

  tl.fromTo(
    transitionPanelTop,
    {
      scaleY: 0,
    },
    {
      scaleY: 1,
      duration: 1,
    },
    "<"
  );
  /*
  tl.from(
    transitionLogo,
    {
      autoAlpha: 0,
      yPercent: 100,
      duration: 0.8,
      ease: "expo.out",
    },
    "<+=0.4"
  );
*/
  tl.fromTo(
    current,
    {
      y: "0vh",
    },
    {
      y: "-15dvh",
      duration: 1,
    },
    0
  );
}

/**
 * Enter
 * New Page Arrives
 */

function runPageEnterAnimation(next) {
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionPanel = transitionWrap.querySelector(
    "[data-transition-panel]"
  );
  const transitionPanelTop = transitionWrap.querySelector(
    "[data-transition-panel-top]"
  );
  const transitionPanelBottom = transitionWrap.querySelector(
    "[data-transition-panel-bottom]"
  );
  const transitionLogo = transitionWrap.querySelector("[data-transition-logo]");

  const tl = gsap.timeline();

  if (getReducedMotion()) {
    // Immediate swap behavior if user prefers reduced motion
    tl.set(next, { autoAlpha: 1 });
    tl.add("pageReady");
    tl.call(resetPage, [next], "pageReady");
    return new Promise((resolve) => tl.call(resolve, null, "pageReady"));
  }

  tl.add("startEnter", 1.35);

  tl.set(
    next,
    {
      autoAlpha: 1,
    },
    "startEnter"
  );

  tl.fromTo(
    transitionPanel,
    {
      yPercent: -100,
    },
    {
      yPercent: -200,
      duration: 1,
      overwrite: "auto",
      immediateRender: false,
    },
    "startEnter"
  );

  tl.fromTo(
    transitionPanelBottom,
    {
      scaleY: 1,
    },
    {
      scaleY: 0,
      duration: 1,
    },
    "<"
  );

  tl.set(
    transitionPanel,
    {
      autoAlpha: 0,
    },
    ">"
  );

  tl.to(
    transitionLogo,
    {
      opacity: 1,
      duration: 1.2,
      ease: "expo.inOut",
    },
    "startEnter-=0.4"
  );

  tl.from(
    next,
    {
      y: "25dvh",
      duration: 1,
    },
    "startEnter"
  );

  tl.add("pageReady");
  tl.call(resetPage, [next], "pageReady");

  return new Promise((resolve) => {
    tl.call(resolve, null, "pageReady");
  });
}

/**
 * Export methods
 */

export {
  resetPage,
  runPageOnceAnimation,
  runPageLeaveAnimation,
  runPageEnterAnimation,
};
