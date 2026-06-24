/**
 * @file back-buttons.js
 * @summary Enhances back buttons to navigate browser history or fall back to a default href.
 * @description Initializes all [data-button-back] elements within the given scope. For each one,
 * intercepts clicks on the inner anchor: if browser history exists, navigates back programmatically;
 * otherwise falls back to the href defined in the markup.
 */

/**
 * Finds all [data-button-back] elements within the given scope and upgrades their
 * inner anchor to use browser history when available, falling back to the link's
 * original href if no history entries exist.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */
export function initBackButtons(scope = document) {
  const elements = scope.querySelectorAll("[data-button-back]");
  if (!elements.length) return;

  elements.forEach((el) => {
    const link = el.querySelector("a");
    if (!link) return;

    // Store the fallback href before any interaction
    const fallbackHref = link.getAttribute("href") || "/";

    link.addEventListener("click", (e) => {
      if (window.history.length > 1) {
        // Navigate back if browser history is available
        e.preventDefault();
        window.history.back();
      } else {
        // No history — restore the original href and let the browser navigate
        link.setAttribute("href", fallbackHref);
      }
    });
  });
}