/**
 * @file highlight-text.js
 * @summary Initializes scroll-driven character highlight animations for marked text elements.
 * @description Finds all [data-highlight-text="True"] elements and uses GSAP SplitText with
 * ScrollTrigger to animate individual characters from a faded state to full opacity as the
 * user scrolls. Scroll boundaries, fade opacity, and stagger timing are all configurable
 * via data attributes. Survives resize / re-split by using a from-based tween so the
 * natural resting state of the characters is "visible".
 */

/**
 * Finds all [data-highlight-text="True"] elements within the given scope and attaches
 * a scrubbed SplitText character reveal driven by ScrollTrigger. Each element reads
 * its own scroll start/end, fade, and stagger values from data attributes.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */
export function initHighlightText(scope = document) {
  const elements = scope.querySelectorAll("[data-highlight-text='True']");
  if (!elements.length) return;

  elements.forEach((el) => {
    const scrollStart =
      el.getAttribute("data-highlight-scroll-start") || "top 90%";
    const scrollEnd =
      el.getAttribute("data-highlight-scroll-end") || "center 40%";

    // Use Number.isFinite so an explicit "0" is respected and only NaN falls back.
    const fadeAttr = parseFloat(el.getAttribute("data-highlight-fade"));
    const fadedValue = Number.isFinite(fadeAttr) ? fadeAttr : 0.1;

    const staggerAttr = parseFloat(el.getAttribute("data-highlight-stagger"));
    const staggerValue = Number.isFinite(staggerAttr) ? staggerAttr : 0.1;

    SplitText.create(el, {
      type: "words, chars",
      autoSplit: true,
      onSplit(self) {
        // from() makes the resting state of the chars their natural DOM state
        // (autoAlpha 1 = visible). On resize, autoSplit reverts this timeline
        // before re-splitting, so the chars return to "visible" rather than
        // being stuck at the faded value — which is what made the text vanish.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: scrollStart,
            end: scrollEnd,
            scrub: true,
          },
        });

        tl.from(self.chars, {
          autoAlpha: fadedValue,
          stagger: staggerValue,
          ease: "none",
        });

        // Returning the timeline lets autoSplit revert it (and kill its
        // ScrollTrigger) cleanly before each re-split.
        return tl;
      },
    });
  });
}
