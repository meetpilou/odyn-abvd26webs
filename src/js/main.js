/**
 * -----------------------------------------------------------------
 * main.js
 * Entry point — orchestration only, no logic.
 * -----------------------------------------------------------------
 */

import { initGSAP } from "./core/config.js";
import { initBrand } from "./core/brand.js";
import {
  initLenis,
  getLenis,
  scrollToTop,
  refreshScrollTrigger,
} from "./core/scroll.js";
import { debounceOnWidthChange } from "./core/utils";
import { initGsapSliders } from "./features/gsap-sliders";
import {
  isFirstLoad,
  runPageOnceAnimation,
  initLeaveTransition,
  initPrefetch,
} from "./core/transitions.js";
import * as features from "./core/features.js";

// ---------------------------------------------------------------------------

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

gsap.registerPlugin(
  Flip,
  ScrollTrigger,
  SplitText,
  Draggable,
  CustomEase,
  InertiaPlugin,
  TextPlugin
);

// ---------------------------------------------------------------------------

document.fonts.ready.then(() => {
  initBrand();
  initGSAP();
  initLenis();
  scrollToTop();

  requestAnimationFrame(() => {
    const container =
      document.querySelector("[data-barba='container']") || document.body;

    features.once();
    features.beforeEnter(container);

    runPageOnceAnimation(container).then(() => {
      features.afterEnter(container);
      refreshScrollTrigger();
    });

    initPrefetch();
    initLeaveTransition();
    initWindowEvents();
  });
});

// ---------------------------------------------------------------------------

/**
 * initWindowEvents
 */

function initWindowEvents() {
  window.addEventListener(
    "resize",
    debounceOnWidthChange(() => {
      getLenis()?.resize();
      ScrollTrigger.refresh();
      initGsapSliders();
    }, 200)
  );
}
