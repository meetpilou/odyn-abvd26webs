/**
 * -----------------------------------------------------------------
 * Feature example
 * Template for a new feature module.
 * -----------------------------------------------------------------
 */

/**
 * initExample
 *
 * @param {Document|HTMLElement} scope - the current page container
 */
export function initExample(scope = document) {
  const elements = scope.querySelectorAll("[data-example]");
  if (!elements.length) return;

  elements.forEach((el) => {
    // your logic here
  });
}
