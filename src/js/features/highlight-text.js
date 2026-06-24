/**
 * @file highlight-text.js
 * @summary Initializes scroll-driven character highlight animations for marked text elements.
 * @description Finds all [data-highlight-text="True"] elements and uses GSAP SplitText with
 * ScrollTrigger to animate individual characters from a faded state to full opacity as the
 * user scrolls. Scroll boundaries, fade opacity, and stagger timing are all configurable
 * via data attributes.
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
    const fadedValue =
      parseFloat(el.getAttribute("data-highlight-fade")) || 0.1;
    const staggerValue =
      parseFloat(el.getAttribute("data-highlight-stagger")) || 0.1;

    SplitText.create(el, {
      type: "words, chars",
      autoSplit: true,
      onSplit(self) {
        const ctx = gsap.context(() => {
          // Initialise les chars à fadedValue — état de départ garanti
          gsap.set(self.chars, { autoAlpha: fadedValue });

          gsap
            .timeline({
              scrollTrigger: {
                trigger: el,
                start: scrollStart,
                end: scrollEnd,
                scrub: true,
                // Si le scroll est déjà passé au moment de l'init, force l'état final
                onEnterBack: () => {},
                onRefresh: (self) => {
                  if (self.progress === 1) {
                    gsap.set(self.animation.getChildren()[0].targets(), {
                      autoAlpha: 1,
                    });
                  }
                },
              },
            })
            .to(self.chars, {
              autoAlpha: 1,
              stagger: staggerValue,
              ease: "linear",
              onComplete: () => instance.revert(),
            });
        }, el);

        return ctx;
      },
    });
  });
}
