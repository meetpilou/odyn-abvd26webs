/**
 * -----------------------------------------------------------------
 * theme.js
 * Page-level theme switching (nav, transition overlay)
 * -----------------------------------------------------------------
 */

const THEME_CONFIG = {
  light: {
    nav: "dark",
    transition: "light",
  },
  dark: {
    nav: "light",
    transition: "dark",
  },
};

/**
 * Reads `data-page-theme` from `container` and applies the matching
 * theme attributes to <body>, [data-theme-transition], and [data-theme-nav].
 *
 * @param {HTMLElement} container - the incoming Barba page container
 */
function applyThemeFrom(container) {
  const pageTheme = container?.dataset?.pageTheme || "light";
  const config = THEME_CONFIG[pageTheme] || THEME_CONFIG.light;

  document.body.dataset.pageTheme = pageTheme;

  const transitionEl = document.querySelector("[data-theme-transition]");
  if (transitionEl) {
    transitionEl.dataset.themeTransition = config.transition;
  }

  const nav = document.querySelector("[data-theme-nav]");
  if (nav) {
    nav.dataset.themeNav = config.nav;
  }
}

/**
 * Export methods
 */

export { applyThemeFrom };
