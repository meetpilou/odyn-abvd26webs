/**
 * @file global-parallax.js
 * @summary Initializes scroll-driven parallax effects for elements marked with [data-parallax="trigger"].
 * @description Sets up a GSAP matchMedia context to apply scrubbed ScrollTrigger animations
 * on matching elements. Supports vertical and horizontal directions, configurable start/end
 * offsets, scrub values, and per-breakpoint disable flags. All values are read from
 * data attributes with sensible defaults.
 */

import { MEDIAQUERIES } from '../core/config';

/**
 * Finds all [data-parallax="trigger"] elements and attaches a scrubbed GSAP ScrollTrigger
 * parallax animation to each one. Respects per-element breakpoint disable flags and reads
 * direction, scrub, offset, and scroll boundary values from data attributes.
 */
export function initGlobalParallax(scope = document) {
  const mm = gsap.matchMedia();

  mm.add(MEDIAQUERIES, (context) => {
    const { isMobile, isMobileLandscape, isTablet } = context.conditions;

    const ctx = gsap.context(() => {
      const elements = scope.querySelectorAll('[data-parallax="trigger"]');
      if (!elements.length) return;

      elements.forEach((el) => {
        // Skip if parallax is disabled for the current breakpoint
        const disable = el.getAttribute("data-parallax-disable");
        if (
          (disable === "mobile" && isMobile) ||
          (disable === "mobileLandscape" && isMobileLandscape) ||
          (disable === "tablet" && isTablet)
        ) return;

        // Animate an inner target if present, otherwise animate the trigger itself
        const target = el.querySelector('[data-parallax="target"]') || el;

        // Read animation config from attributes with defaults
        const direction = el.getAttribute("data-parallax-direction") || "vertical";
        const prop = direction === "horizontal" ? "xPercent" : "yPercent";

        const scrubAttr = el.getAttribute("data-parallax-scrub");
        const scrub = scrubAttr ? parseFloat(scrubAttr) : true;

        const startVal = el.getAttribute("data-parallax-start") !== null
          ? parseFloat(el.getAttribute("data-parallax-start"))
          : 20;

        const endVal = el.getAttribute("data-parallax-end") !== null
          ? parseFloat(el.getAttribute("data-parallax-end"))
          : -20;

        const scrollStart = `clamp(${el.getAttribute("data-parallax-scroll-start") || "top bottom"})`;
        const scrollEnd = `clamp(${el.getAttribute("data-parallax-scroll-end") || "bottom top"})`;

        gsap.fromTo(
          target,
          { [prop]: startVal },
          {
            [prop]: endVal,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: scrollStart,
              end: scrollEnd,
              scrub,
            },
          }
        );
      });
    });

    return () => ctx.revert();
  });
}