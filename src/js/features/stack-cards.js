/**
 * @file stack-cards.js
 * @summary Initializes stacked card scroll animations for all matching sections on the page.
 * @description Queries all [data-stack-cards] sections and initializes an independent GSAP
 * ScrollTrigger animation for each. Each section manages its own pinned background, card stack,
 * and sticky/relative layout based on viewport height. Supports multiple instances per page.
 */

import { MEDIAQUERIES } from "../core/config";

/**
 * Initializes the stack cards scroll animation for all [data-stack-cards] sections found in scope.
 * For each section, computes layout constants, sets up a pinned background ScrollTrigger,
 * and drives per-card scale/opacity via a scrubbed ScrollTrigger.
 * Adapts between sticky stacking and flat relative layout based on viewport conditions.
 *
 * @param {Document|HTMLElement} scope - The DOM scope in which elements are queried.
 */
export function initStackCards(scope = document) {
  const elements = scope.querySelectorAll("[data-stack-cards]");
  if (!elements.length) return;

  const navigation = document.querySelector(".nav-wrapper");

  // Layout constants controlling
  // stacking visual behavior
  const VISIBLE_COUNT = 3;
  const SCALE_STEP = 0.05;
  const Y_OFFSET = 24;
  const BOTTOM_MARGIN = 32;
  const TOP_OFFSET = navigation.getBoundingClientRect().height + 150;

  elements.forEach((element) => {
    const bg = element.querySelector("[data-stack-cards-bg]");
    const content = element.querySelector("[data-stack-cards-content]");

    const cards = Array.from(
      element.querySelectorAll("[data-stack-cards-item]")
    );

    if (!cards.length) return;

    // Compute minimum viewport height required to enable sticky stacking
    const tallestCard = Math.max(...cards.map((c) => c.offsetHeight));
    const minHeight = TOP_OFFSET + tallestCard + BOTTOM_MARGIN;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: MEDIAQUERIES.isDesktop,
        isDesktopStack: `
          ${MEDIAQUERIES.isDesktop} and (min-height: ${minHeight}px)
        `,
        isDesktopNotStack: `
          ${MEDIAQUERIES.isDesktop} and (max-height: ${minHeight - 1}px)
        `,
      },
      (context) => {
        const { isDesktopStack } = context.conditions;

        const ctx = gsap.context(() => {
          // Pin the background element for the full scroll duration of the section
          ScrollTrigger.create({
            trigger: element,
            start: "top top",
            endTrigger: cards[cards.length - 1],
            end: "bottom bottom",
            pin: bg,
            pinSpacing: false,
            onRefreshInit: () => gsap.set(bg, { clearProps: "all" }),
          });

          // Drive per-card scale, Y offset, and opacity based on scroll progress
          ScrollTrigger.create({
            trigger: element,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
              const currentStep = self.progress * (cards.length - 1);

              cards.forEach((card, i) => {
                const depth = currentStep - i;

                if (depth < 0) {
                  // Card not yet reached — reset to default state
                  gsap.set(card, { scale: 1, y: 0, opacity: 1 });
                } else if (depth >= VISIBLE_COUNT + 1) {
                  // Card too far back in the stack — hide it
                  gsap.set(card, { opacity: 0 });
                } else {
                  // Card is within the visible stack — apply progressive scale and fade
                  const opacity =
                    depth >= VISIBLE_COUNT - 1
                      ? 1 - (depth - (VISIBLE_COUNT - 1))
                      : 1;

                  gsap.set(card, {
                    scale: 1 - depth * SCALE_STEP,
                    y: -depth * Y_OFFSET,
                    opacity: Math.max(0, opacity),
                  });
                }
              });
            },
          });

          if (isDesktopStack) {
            // Enable sticky stacking layout when viewport height is sufficient
            gsap.set(cards, {
              position: "sticky",
              top: TOP_OFFSET,
              transformOrigin: "top center",
              maxHeight: `calc(100svh - ${TOP_OFFSET}px - 2rem)`,
              overflowY: "auto",
            });

            // Pin the content block above the card stack
            if (content) {
              gsap.set(content, {
                position: "sticky",
                top: TOP_OFFSET - content.offsetHeight - 32,
              });
            }
          } else {
            // Fall back to a flat relative layout on short viewports or mobile
            gsap.set(cards, {
              position: "relative",
              top: 0,
              clearProps: "transformOrigin,maxHeight,overflowY",
            });

            if (content) gsap.set(content, { position: "relative" });
            gsap.set(element, { height: "auto" });
          }
        });

        return () => ctx.revert();
      }
    );
  });

  // Defer ScrollTrigger refresh to ensure layout is fully painted before recalculating

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  });
}
