/**
 * @file footer-parallax.js
 * @summary Initializes scroll-driven parallax animations for footer sections.
 * @description Finds all [data-footer-parallax] elements and sets up a scrubbed GSAP
 * ScrollTrigger timeline for each one, but only on desktop (via gsap.matchMedia). On mobile
 * the parallax shift would push the footer past the viewport, so it is disabled and the
 * elements are left in their natural, fully visible state. Reduced motion also skips it.
 */

import { MEDIAQUERIES } from "../core/config.js";

/**
 * Finds all [data-footer-parallax] elements within the given scope and attaches
 * a scrubbed GSAP timeline that drives a vertical parallax on the inner layer
 * and a simultaneous fade on the dark overlay — desktop only.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */

export function initFooterParallax(scope = document) {
  const elements = scope.querySelectorAll("[data-footer-parallax]");
  if (!elements.length) return;

  elements.forEach((element) => {
    // Idempotent init: don't stack a second matchMedia / ScrollTrigger on the
    // same element if this module is re-invoked (e.g. framework resize hooks).
    if (element._footerParallaxInit) return;
    element._footerParallaxInit = true;

    const inner = element.querySelector("[data-footer-parallax-inner]");
    const dark = element.querySelector("[data-footer-parallax-dark]");

    const mm = gsap.matchMedia();

    mm.add(MEDIAQUERIES, (context) => {
      const { isReducedMotion, isDesktop } = context.conditions;

      // Mobile / reduced motion: no parallax. Clear any inline state left by a
      // previous desktop run so the inner layer isn't shifted and the full
      // footer stays visible. matchMedia also auto-reverts the timeline and kills
      // its ScrollTrigger when leaving the desktop condition.
      if (isReducedMotion || !isDesktop) {
        gsap.set([inner, dark].filter(Boolean), { clearProps: "all" });
        return;
      }

      // Scrubbed timeline tied to the footer entering the bottom of the viewport
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: "clamp(top bottom)",
          end: "clamp(bottom bottom)",
          scrub: true,
        },
      });

      // Slide the inner content up as the footer scrolls into view
      if (inner) {
        tl.from(inner, { yPercent: -45, ease: "linear" });
      }

      // Fade out the dark overlay in sync with the parallax
      if (dark) {
        tl.from(dark, { opacity: 1, ease: "linear" }, "<");
      }
    });
  });
}
