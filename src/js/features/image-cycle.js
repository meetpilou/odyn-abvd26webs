/**
 * @file image-cycle.js
 * @summary Cycles through images inside [data-image-cycle] elements at a configurable interval.
 * @description For each [data-image-cycle] element, sets up an interval that steps through
 * .media-image children by updating their [data-image-cycle-item] attribute. Cycling starts
 * when the element enters the viewport and pauses when it leaves. For two-item groups,
 * the previous item stays marked as "previous" permanently to support CSS transitions.
 * Interval duration is read from the attribute value in seconds, defaulting to 2000ms.
 */

/**
 * Finds all [data-image-cycle] elements within the given scope and initializes
 * viewport-aware image cycling with configurable timing.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */
export function initImageCycle(scope = document) {
  const elements = scope.querySelectorAll("[data-image-cycle]");
  if (!elements.length) return;

  elements.forEach((el) => {
    const items = el.querySelectorAll(".media-image");
    if (items.length < 2) return;

    let currentIndex = 0;
    let intervalId;

    // Read optional duration in seconds from the attribute, fallback to 2s
    const attrValue = el.getAttribute("data-image-cycle");
    const duration = attrValue && !isNaN(attrValue) ? parseFloat(attrValue) * 1000 : 2000;
    const isTwoItems = items.length === 2;

    // Set initial active/not-active states
    items.forEach((item, i) => {
      item.setAttribute("data-image-cycle-item", i === 0 ? "active" : "not-active");
    });

    function cycleImages() {
      const prevIndex = currentIndex;
      currentIndex = (currentIndex + 1) % items.length;

      // Mark the outgoing item as previous for CSS transition support
      items[prevIndex].setAttribute("data-image-cycle-item", "previous");

      // For 3+ items, reset the previous item to not-active after the transition completes
      if (!isTwoItems) {
        setTimeout(() => {
          items[prevIndex].setAttribute("data-image-cycle-item", "not-active");
        }, duration);
      }

      items[currentIndex].setAttribute("data-image-cycle-item", "active");
    }

    // Start cycling when visible, pause when out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !intervalId) {
          intervalId = setInterval(cycleImages, duration);
        } else {
          clearInterval(intervalId);
          intervalId = null;
        }
      },
      { threshold: 0 }
    );

    observer.observe(el);
  });
}