/**
 * -----------------------------------------------------------------
 * Barba.js
 * Hooks, init, nav sync, and function registries
 * -----------------------------------------------------------------
 */

import {
  initLenis,
  hasLenis,
  hasScrollTrigger,
  stopLenis,
  startLenis,
  updateLenis,
  refreshScrollTrigger,
  killAllScrollTriggers,
} from "./scroll.js";

import {
  runPageOnceAnimation,
  runPageLeaveAnimation,
  runPageEnterAnimation,
} from "./barba-transitions.js";

import { applyThemeFrom } from "./theme.js";

/** State */

let onceFunctionsInitialized = false;
let _features = {};

/** The container currently being prepared / displayed. */

let nextPage = document;

/**
 * Function reset Webflow ix2
 */

function resetWebflow() {
  // Re-init Webflow forms on the new page
  if (window.Webflow && window.Webflow.require) {
    const ix2 = window.Webflow?.require("ix2");
    if (ix2) {
      ix2.init();
    }
    // Destroy and re-init the forms module
    const forms = window.Webflow?.require("commerce") || null;
    window.Webflow?.destroy();
    window.Webflow?.ready();
    window.Webflow?.require("ix2")?.init();
  }
}

/**
 * Function registries
 * Add your feature initialisers in the matching function below.
 */

function initOnceFunctions() {
  initLenis();
  if (onceFunctionsInitialized) return;
  onceFunctionsInitialized = true;
  // Runs once on first load — add persistent feature inits here.
  _features.once?.(nextPage);
}

function initBeforeEnterFunctions(next) {
  nextPage = next || document;
  // Runs before the enter animation.
  _features.beforeEnter?.(nextPage);
}

function initAfterEnterFunctions(next) {
  nextPage = next || document;
  // Runs after the enter animation completes.
  _features.afterEnter?.(nextPage);
  if (hasLenis) updateLenis();
  if (hasScrollTrigger) refreshScrollTrigger();
}

/**
 * Barba hooks
 */

barba.hooks.beforeEnter((data) => {
  // Pin the incoming container while the leave animation plays.
  gsap.set(data.next.container, {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
  });

  stopLenis();
  initBeforeEnterFunctions(data.next.container);
  applyThemeFrom(data.next.container);
  resetWebflow();
});

barba.hooks.afterLeave((data) => {
  killAllScrollTriggers();
});

barba.hooks.enter((data) => {
  initBarbaNavUpdate(data);
});

barba.hooks.afterEnter((data) => {
  initAfterEnterFunctions(data.next.container);

  if (hasLenis) {
    updateLenis();
    startLenis();
  }

  if (hasScrollTrigger) {
    refreshScrollTrigger();
  }
});

/**
 * Barba init
 */

function initBarba(features = {}) {
  _features = features;

  barba.init({
    debug: true, // set to true during development
    timeout: 7000,
    preventRunning: true,
    transitions: [
      {
        name: "default",
        sync: true,

        async once(data) {
          initOnceFunctions();
          return runPageOnceAnimation(data.next.container);
        },

        async leave(data) {
          return runPageLeaveAnimation(
            data.current.container,
            data.next.container
          );
        },

        async enter(data) {
          return runPageEnterAnimation(data.next.container);
        },
      },
    ],
  });
}

/**
 * Nav sync
 * Keeps [data-barba-update] elements in the persistent nav
 * in sync with the incoming page's nav state (aria-current, classes)
 */

function initBarbaNavUpdate(data) {
  const tpl = document.createElement("template");
  tpl.innerHTML = data.next.html.trim();

  const nextNodes = tpl.content.querySelectorAll("[data-barba-update]");
  const currentNodes = document.querySelectorAll("nav [data-barba-update]");

  currentNodes.forEach((curr, index) => {
    const next = nextNodes[index];
    if (!next) return;

    const newStatus = next.getAttribute("aria-current");
    if (newStatus !== null) {
      curr.setAttribute("aria-current", newStatus);
    } else {
      curr.removeAttribute("aria-current");
    }

    curr.setAttribute("class", next.getAttribute("class") || "");
  });
}

/**
 * Export methods
 */

export { nextPage, initBarba, initBarbaNavUpdate };
