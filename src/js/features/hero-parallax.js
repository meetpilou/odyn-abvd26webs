/**
 * @file hero-parallax.js
 * @summary Initializes scroll-driven parallax effects for hero sections on desktop.
 * @description Finds all [data-hero-parallax] elements and attaches a scrubbed GSAP
 * ScrollTrigger timeline to each one. Animates an inner layer upward and fades in
 * an overlay as the hero scrolls out of view. Animations are skipped on non-desktop
 * breakpoints and cleaned up via a GSAP context revert.
 */

import { MEDIAQUERIES } from "../core/config";

/**
 * Finds all [data-hero-parallax] elements within the given scope and sets up
 * scrubbed ScrollTrigger parallax animations for desktop viewports only.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */
export function initHeroParallax(scope = document) {
  const elements = scope.querySelectorAll("[data-hero-parallax]");
  if (!elements.length) return;

  const mm = gsap.matchMedia();
  mm.add(MEDIAQUERIES, (context) => {
    const { isDesktop } = context.conditions;

    const ctx = gsap.context(() => {
      if (!isDesktop) return;

      elements.forEach((el) => {
        const inner = el.querySelector("[data-hero-parallax-inner]");
        const overlay = el.querySelector("[data-hero-parallax-overlay]");

        // Scrubbed timeline active while the hero travels from top to out of view
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "clamp(top top)",
            end: "clamp(bottom top)",
            scrub: true,
          },
        });

        // Slide the inner content upward as the hero scrolls away
        if (inner) {
          tl.to(inner, { yPercent: 15, ease: "none" });
        }

        // Fade in the overlay in sync with the parallax
        if (overlay) {
          tl.to(overlay, { opacity: 0.6, ease: "none" }, "<");
        }
      });
    });

    return () => ctx.revert();
  });
}