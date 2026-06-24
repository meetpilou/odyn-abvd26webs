/**
 * @file footer-parallax.js
 * @summary Initializes scroll-driven parallax animations for footer sections.
 * @description Finds all [data-footer-parallax] elements and sets up a scrubbed GSAP
 * ScrollTrigger timeline for each one. Animates an inner content layer upward and
 * optionally fades out a dark overlay as the footer scrolls into view.
 */

/**
 * Finds all [data-footer-parallax] elements within the given scope and attaches
 * a scrubbed GSAP timeline that drives a vertical parallax on the inner layer
 * and a simultaneous fade on the dark overlay.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */

export function initFooterParallax(scope = document) {
  const elements = scope.querySelectorAll("[data-footer-parallax]");
  if (!elements.length) return;

  elements.forEach((element) => {
    const inner = element.querySelector("[data-footer-parallax-inner]");
    const dark = element.querySelector("[data-footer-parallax-dark]");

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
}