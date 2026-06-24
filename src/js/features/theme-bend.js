/**
 * @file theme-bend.js
 * @summary Animated SVG curve that bends in response to scroll velocity.
 * @description Initializes a scroll-driven SVG path deformation effect on all
 * [data-theme-bend] elements. The curve bends proportionally to scroll speed,
 * then eases back to its resting position. Skips elements already initialized
 * and respects the user's reduced-motion preference.
 */

/**
 * Initializes the theme bend effect on all matching elements in the given scope.
 * Queries for [data-theme-bend] components, guards against double-initialization,
 * and skips the animation entirely if the user prefers reduced motion.
 * On each component, listens to scroll events and drives a quadratic bezier
 * SVG path deformation via requestAnimationFrame.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search for [data-theme-bend] components.
 */

import { getReducedMotion } from "../core/config";

export function initThemeBend(scope = document) {
  const elements = scope.querySelectorAll("[data-theme-bend]");
  if (!elements.length) return;

  elements.forEach((element) => {
    // Skip if already initialized
    if (element.hasAttribute("data-theme-bend-progress")) return;
    element.setAttribute("data-theme-bend-progress", "");

    // Respect the user's reduced-motion preference
    if (getReducedMotion()) return;

    // SVG layout constants
    const path = element.querySelector("path");
    const SVG_W = 1200;
    const SVG_H = 400;
    const BASE_Y = 200;
    const SENSITIVITY = 3;
    const DAMPING = 0.05;
    const MAX_BEND = 2000;

    // Animation state
    let currentBend = 0;
    let lastScrollY = window.scrollY;
    let smoothVelocity = 0;
    let animating = false;

    function updateCurve() {
      // Compute scroll velocity and smooth it with a lerp
      const scrollY = window.scrollY;
      const velocity = scrollY - lastScrollY;
      lastScrollY = scrollY;
      smoothVelocity += (velocity - smoothVelocity) * 0.6;

      // Clamp the bend target and ease toward it
      const target = Math.max(
        -MAX_BEND,
        Math.min(MAX_BEND, smoothVelocity * SENSITIVITY)
      );
      currentBend += (target - currentBend) * DAMPING;
      if (Math.abs(currentBend) < 0.1) currentBend = 0;

      // Rebuild the SVG path with the updated control point
      const controlY = BASE_Y + currentBend;
      const R = 12;
      path.setAttribute(
        "d",
        `M 0,${SVG_H} L 0,${BASE_Y + R} Q 0,${BASE_Y} ${R},${BASE_Y} Q ${SVG_W / 2},${controlY} ${SVG_W - R},${BASE_Y} Q ${SVG_W},${BASE_Y} ${SVG_W},${BASE_Y + R} L ${SVG_W},${SVG_H} Z`
      );

      // Keep animating while there is visible motion, then come to rest
      if (Math.abs(currentBend) > 0.1 || Math.abs(smoothVelocity) > 0.5) {
        requestAnimationFrame(updateCurve);
      } else {
        smoothVelocity = 0;
        animating = false;
      }
    }

    // Kick off the animation loop on scroll (passive for performance)
    window.addEventListener(
      "scroll",
      () => {
        if (!animating) {
          animating = true;
          requestAnimationFrame(updateCurve);
        }
      },
      { passive: true }
    );
  });
}
