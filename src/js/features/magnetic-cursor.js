/**
 * @file magnetic-cursor.js
 * @summary Initializes a custom magnetic cursor that snaps into hover targets on desktop.
 * @description Tracks mouse position with GSAP quickTo for a smooth following cursor.
 * On desktop, uses GSAP Flip to smoothly reparent the cursor background into
 * [data-magnetic-cursor-bg] elements on hover, then back to the cursor on leave.
 * All event listeners are tracked and removed on matchMedia context cleanup.
 */

import { MEDIAQUERIES } from "../core/config";

/**
 * Finds all .cursor elements within the given scope and sets up mouse tracking
 * and magnetic snap behavior for all [data-magnetic-cursor-target] elements.
 * Only active on desktop breakpoints.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */
export function initMagneticCursor(scope = document) {
  const elements = document.querySelectorAll(".cursor");
  if (!elements.length) return;

  const mm = gsap.matchMedia();

  mm.add(MEDIAQUERIES, (context) => {
    const { isDesktop } = context.conditions;

    const listeners = [];

    const ctx = gsap.context(() => {
      if (!isDesktop) return;

      elements.forEach((cursor) => {
        const cursorBg = cursor.querySelector(".cursor__bg");
        if (!cursorBg) return;

        // Center the cursor element on the pointer
        gsap.set(cursor, { xPercent: -50, yPercent: -50 });

        const xTo = gsap.quickTo(cursor, "x", {
          duration: 0.6,
          ease: "power3",
        });
        const yTo = gsap.quickTo(cursor, "y", {
          duration: 0.6,
          ease: "power3",
        });

        const onMouseMove = (e) => {
          xTo(e.clientX);
          yTo(e.clientY);
        };

        window.addEventListener("mousemove", onMouseMove);
        listeners.push({ target: window, type: "mousemove", fn: onMouseMove });

        /* ---------------------------------- */
        /* Magnetic targets                   */
        /* ---------------------------------- */

        const hoverTargets = scope.querySelectorAll(
          "[data-magnetic-cursor-target]"
        );
        if (!hoverTargets.length) return;

        hoverTargets.forEach((target) => {
          const bgHolder = target.querySelector("[data-magnetic-cursor-bg]");
          if (!bgHolder) return;

          // On enter: Flip the cursor background into the target's bg holder
          const onEnter = () => {
            const state = Flip.getState(cursorBg);
            bgHolder.appendChild(cursorBg);
            Flip.from(state, {
              ease: "spring",
              duration: 0.4,
              
              onStart: () => gsap.set(cursorBg, { opacity: 1 }),
            });
          };

          // On leave: Flip the cursor background back into the cursor element

          const onLeave = () => {
            const state = Flip.getState(cursorBg);
            cursor.appendChild(cursorBg);
            Flip.from(state, {
              ease: "power4.out",
              duration: 0.5,
              
              onStart: () => gsap.set(cursorBg, { opacity: 1 }),
            });
          };
          
          target.addEventListener("mouseenter", onEnter);
          target.addEventListener("mouseleave", onLeave);
          listeners.push({ target, type: "mouseenter", fn: onEnter });
          listeners.push({ target, type: "mouseleave", fn: onLeave });
        });
      });
    });

    // Clean up all listeners and revert GSAP context on breakpoint change
    return () => {
      listeners.forEach(({ target, type, fn }) =>
        target.removeEventListener(type, fn)
      );
      listeners.length = 0;
      ctx.revert();
    };
  });
}
