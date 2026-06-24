/**
 * @file footer-parallax.js
 * @summary Initializes scroll-driven parallax animations for footer sections.
 * @description Finds all [data-footer-parallax] elements and sets up a scrubbed GSAP
 * ScrollTrigger timeline for each one — but only while the footer fits within the viewport
 * height. When the footer is taller than the viewport, the upward parallax shift would push
 * content out of view, so the effect is disabled and the layers reset to their natural state.
 * The condition is re-evaluated on resize. Reduced motion also disables it.
 */

/**
 * Finds all [data-footer-parallax] elements within the given scope and attaches
 * a scrubbed GSAP timeline (inner layer parallax + dark overlay fade) that is
 * only active when the footer is no taller than the viewport.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */

export function initFooterParallax(scope = document) {
  const elements = scope.querySelectorAll("[data-footer-parallax]");
  if (!elements.length) return;

  const reduceMotionMQ = window.matchMedia("(prefers-reduced-motion: reduce)");

  elements.forEach((element) => {
    // Idempotent init: don't attach a second timeline / resize listener on the
    // same element if this module is re-invoked (e.g. framework resize hooks).
    if (element._footerParallaxInit) return;
    element._footerParallaxInit = true;

    const inner = element.querySelector("[data-footer-parallax-inner]");
    const dark = element.querySelector("[data-footer-parallax-dark]");
    const layers = [inner, dark].filter(Boolean);

    let tl = null;

    function enable() {
      if (tl) return;

      // Scrubbed timeline tied to the footer entering the bottom of the viewport
      tl = gsap.timeline({
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
    }

    function disable() {
      if (!tl) return;
      tl.scrollTrigger?.kill();
      tl.kill();
      tl = null;
      // Reset the layers so nothing is left shifted / faded.
      gsap.set(layers, { clearProps: "all" });
    }

    // Enable the parallax only when the footer fits within the viewport height.
    // As soon as the footer is taller than the viewport, the upward shift would
    // hide content, so disable it. Reduced motion disables it too.
    function update() {
      const tooTall = element.offsetHeight > window.innerHeight;
      if (reduceMotionMQ.matches || tooTall) {
        disable();
      } else {
        enable();
      }
    }

    // Debounce resize so we don't create/kill the ScrollTrigger on every frame.
    let resizeId;
    function onResize() {
      clearTimeout(resizeId);
      resizeId = setTimeout(update, 150);
    }

    update();
    window.addEventListener("resize", onResize);
    window.addEventListener("load", update);
    reduceMotionMQ.addEventListener("change", update);
  });
}
