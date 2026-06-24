/**
 * @file current-year.js
 * @summary Automatically injects the current year into designated DOM elements.
 * @description Queries all elements with the [data-current-year] attribute and sets
 * their text content to the current calendar year. Useful for copyright notices
 * or any dynamic year display. Exits early if no matching elements are found.
 */

/**
 * Finds all elements marked with [data-current-year] within the given scope
 * and updates their text content with the current year.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */
export function initCurrentYear(scope = document) {
  const elements = scope.querySelectorAll("[data-current-year]");
  if (!elements.length) return;

  // Retrieve the current calendar year once for all elements
  const currentYear = new Date().getFullYear();

  elements.forEach((el) => {
    // Inject the current year as text content
    el.textContent = currentYear;
  });
}