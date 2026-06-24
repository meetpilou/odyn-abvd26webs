/**
 * @file scroll-reveal-media.js
 * @summary Applies a scroll-driven scale and translate reveal animation to media elements.
 * @description Targets elements marked with [data-reveal-media] and animates them
 * from a slightly scaled-down, offset position to their natural state using a GSAP
 * ScrollTrigger scrub. Respects reduced-motion preferences and only runs on desktop
 * breakpoints. Per-element overrides are supported via data attributes.
 */

import { MEDIAQUERIES } from "../core/config";

/**
 * Initializes scroll-reveal animations on all [data-reveal-media] elements.
 * Skips animation entirely for users with reduced motion or on non-desktop viewports,
 * clearing any residual GSAP props in those cases. Cleans up on breakpoint exit.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */
export function initScrollRevealMedia(scope = document) {
  const elements = scope.querySelectorAll("[data-reveal-media]");
  if (!elements.length) return;

  const defaults = {
    scaleFrom: 0.98,
    distance: "3rem",
    scrub: 1,
    start: "top bottom",
    end: "center center",
  };

  const mm = gsap.matchMedia();

  mm.add(MEDIAQUERIES, (context) => {
    const { isDesktop, isReducedMotion } = context.conditions;

    elements.forEach((el) => {
      // Skip animation on mobile or when reduced motion is preferred
      if (isReducedMotion || !isDesktop) {
        gsap.set(el, { clearProps: "all" });
        return;
      }

      // Read per-element overrides, falling back to defaults
      const distance = el.getAttribute("data-distance") || defaults.distance;
      const scaleFrom =
        parseFloat(el.getAttribute("data-scale-from")) || defaults.scaleFrom;
      const start = el.getAttribute("data-start") || defaults.start;
      const end = el.getAttribute("data-end") || defaults.end;

      // Wrap el in a clip container (overflow: hidden)
      /*
      const wrapper = document.createElement("div");
      wrapper.style.cssText = "overflow:hidden;display:inherit;width:100%;height:100%";
      el.parentNode.insertBefore(wrapper, el);
      wrapper.appendChild(el);
      */

      // Set the initial off-state before the element enters the viewport
      gsap.set(el, {
        scale: scaleFrom,
        y: distance,
      });

      // Drive the reveal animation via ScrollTrigger scrub
      gsap.to(el, {
        scale: 1,
        y: 0,
        autoAlpha: 1,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start,
          end,
          scrub: defaults.scrub,
          onLeave: () => gsap.set(el, { clearProps: "all" }),
        },
      });
    });

    // Reset all elements when the active breakpoint context is torn down
    return () => {
      scope.querySelectorAll("[data-reveal-media]").forEach((el) => {
        gsap.set(el, { clearProps: "all" });
        const parent = el.parentNode;
        if (
          parent &&
          parent !== el.closest("[data-reveal-media]")?.parentNode
        ) {
          parent.parentNode?.insertBefore(el, parent);
          parent.remove();
        }
      });
    };
  });
}
