/**
 * @file accordions.js
 * @summary Initializes interactive accordion components.
 * @description Handles expand/collapse behavior for all [data-accordions-init] elements.
 * Supports single-open or multiple-open modes, manages aria-expanded and aria-hidden
 * attributes for accessibility, and optionally synchronizes state with visual elements.
 */

/**
 * Finds all [data-accordions-init] elements within the given scope and sets up
 * their toggle behavior. Each accordion group can optionally close siblings on open
 * and sync an external visual element to the active item index.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */
export function initAccordions(scope = document) {
  const elements = scope.querySelectorAll("[data-accordions-init]");
  if (!elements.length) return;

  elements.forEach((element, index) => {
    const closeSiblings =
      element.getAttribute("data-accordions-close-siblings") === "true";

    const items = Array.from(
      element.querySelectorAll("[data-accordion-status]")
    );
    const visuals = Array.from(
      element.querySelectorAll("[data-accordion-visual]")
    );

    if (!items.length) return;

    const itemsCount = items.length;
    const visualsCount = visuals.length;

    const hasVisuals = visualsCount > 0;
    const hasSingleVisual = visualsCount === 1;
    const hasMatchingVisuals = visualsCount === itemsCount;

    // Warn if visual count is ambiguous — sync will be disabled
    if (hasVisuals && !hasSingleVisual && !hasMatchingVisuals) {
      console.warn(
        `[FeatureAccordion] items (${itemsCount}) and visuals (${visualsCount}) mismatch in module #${index}. Visual sync disabled.`
      );
    }

    /* ---------------------------------- */
    /* Setup                              */
    /* ---------------------------------- */

    // Assign indexes and initial aria states to each item
    items.forEach((item, i) => {
      item.setAttribute("data-accordion-index", i);

      const toggle = item.querySelector("[data-accordion-toggle]");
      const content = item.querySelector("[data-accordion-content]");
      if (!toggle || !content) return;

      const isActive = item.getAttribute("data-accordion-status") === "active";

      toggle.setAttribute("aria-expanded", isActive ? "true" : "false");
      content.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    // Assign indexes and initial aria states to each visual
    visuals.forEach((visual, i) => {
      const isActive = visual.getAttribute("data-active") === "true";
      visual.setAttribute("data-accordion-index", i);
      visual.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    /* ---------------------------------- */
    /* Helpers                            */
    /* ---------------------------------- */

    // Sync the visual element(s) to the currently active item index
    function syncVisual(activeIndex) {
      if (!hasVisuals) return;

      if (hasSingleVisual) {
        visuals[0].setAttribute("data-active", "true");
        visuals[0].setAttribute("aria-hidden", "false");
        return;
      }

      if (!hasMatchingVisuals) return;

      visuals.forEach((visual, i) => {
        const isActive = i === activeIndex;
        visual.setAttribute("data-active", isActive ? "true" : "false");
        visual.setAttribute("aria-hidden", isActive ? "false" : "true");
      });
    }

    function openItem(item) {
      const toggle = item.querySelector("[data-accordion-toggle]");
      const content = item.querySelector("[data-accordion-content]");
      const activeIndex = Number(item.getAttribute("data-accordion-index"));

      item.setAttribute("data-accordion-status", "active");

      if (toggle) toggle.setAttribute("aria-expanded", "true");
      if (content) content.setAttribute("aria-hidden", "false");

      syncVisual(activeIndex);
    }

    function closeItem(item) {
      const toggle = item.querySelector("[data-accordion-toggle]");
      const content = item.querySelector("[data-accordion-content]");

      item.setAttribute("data-accordion-status", "not-active");

      if (toggle) toggle.setAttribute("aria-expanded", "false");
      if (content) content.setAttribute("aria-hidden", "true");
    }

    /* ---------------------------------- */
    /* Init state                         */
    /* ---------------------------------- */

    // Close all items, then open the first one by default
    items.forEach((item) => {
      item.setAttribute("data-accordion-status", "not-active");
    });

    openItem(items[0]);

    /* ---------------------------------- */
    /* Events                             */
    /* ---------------------------------- */

    element.addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-accordion-toggle]");
      if (!toggle) return;

      const item = toggle.closest("[data-accordion-status]");
      if (!item) return;

      const isActive = item.getAttribute("data-accordion-status") === "active";

      // Toggle off if already open
      if (isActive) {
        closeItem(item);
        return;
      }

      // Close all siblings before opening if closeSiblings is enabled
      if (closeSiblings) {
        items.forEach((sibling) => {
          if (sibling !== item) closeItem(sibling);
        });
      }

      openItem(item);
    });
  });
}
