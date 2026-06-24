/**
 * @file stack-cases.js
 * @summary Manages the stacking card animation section with a sticky number counter.
 * @description Initializes a scroll-driven animation for a stack of cards:
 * each card updates a sticky number indicator as it enters the viewport,
 * while previous cards scale down progressively. Behavior is responsive —
 * sticky and scale effects are desktop-only; mobile resets all transforms.
 */

import { MEDIAQUERIES } from "../core/config";

/**
 * Initializes the stack cases section with GSAP scroll-driven animations.
 * Targets `[data-stack-cases]` as the root, `[data-stack-cases-item]` as cards,
 * and `[data-stack-cases-number]` as the animated counter element.
 * On desktop: sticks the number, updates it per card, and scrubs a scale-down
 * effect on previous cards. On mobile: resets all positional and transform states.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which the query is scoped.
 */
export function initStackCases(scope = document) {
  const navigation = document.querySelector(".nav-wrapper");
  const elements = scope.querySelectorAll("[data-stack-cases]");
  if (!elements.length) return;

  elements.forEach((element) => {
    const numberEl = element.querySelector("[data-stack-cases-number]");
    const cards = gsap.utils.toArray("[data-stack-cases-item]", element);
    if (!cards.length) return;

    // Animate the number counter to the current card index
    function setNumber(index) {
      if (!numberEl) return;
      const n = String(index + 1).padStart(2, "0");
      if (numberEl.textContent === n) return;
      gsap.to(numberEl, {
        duration: 0.1,
        text: n,
        ease: "none",
      });
    }

    // Match desktop vs. mobile breakpoints
    const mm = gsap.matchMedia();

    mm.add(MEDIAQUERIES, (context) => {
      const { isDesktop } = context.conditions;
      const numberWrapper =
        numberEl?.closest("[data-stack-cases-number]") ?? numberEl;

      const ctx = gsap.context(() => {
        if (isDesktop) {
          const SCALE_DOWN = 0.04;
          const SCALE_OFFSET = 400;
          const STICKY_TOP = navigation.getBoundingClientRect().height + 150;

          gsap.set(cards, { transformOrigin: "top center" });

          // Stick the number counter to the top of the viewport
          if (numberWrapper) {
            gsap.set(numberWrapper, {
              position: "sticky",
              top: STICKY_TOP,
            });
          }

          // Register one ScrollTrigger per card
          cards.forEach((card, i) => {
            // Update the number when the card's top edge crosses the sticky threshold
            ScrollTrigger.create({
              trigger: card,
              start: `top ${STICKY_TOP}px`,
              end: `bottom ${STICKY_TOP}px`,
              onEnter: () => setNumber(i),
              onEnterBack: () => setNumber(i),
            });

            // Scrub a scale-down effect on all cards above the current one

            ScrollTrigger.create({
              trigger: card,
              start: `top ${STICKY_TOP}px`,
              end: `bottom top`,
              scrub: true,
              onUpdate(self) {
                gsap.set(card, {
                  scale: 1 - SCALE_DOWN * self.progress,
                  opacity: 1 - 0.5 * self.progress,
                  transformOrigin: "top center",
                });
              },
            });
          });

          // Initialize counter to the first card on load
          setNumber(0);
        } else {
          // Reset sticky positioning and transforms on mobile
          if (numberWrapper) {
            gsap.set(numberWrapper, {
              position: "relative",
              top: 0,
            });
          }
          gsap.set(cards, { scale: 1, clearProps: "transformOrigin" });
        }
      });

      return () => ctx.revert();
    });
  });
}
