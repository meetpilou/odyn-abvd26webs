/**
 * @file scroll-reveal.js
 * @summary Initializes scroll-triggered reveal animations for elements with [data-reveal-group] attributes.
 * @description Uses GSAP and ScrollTrigger to animate elements into view as the user scrolls.
 * Supports grouping, staggered timelines, and nested reveal groups with independent stagger/distance
 * settings. Respects the user's reduced motion preference by skipping all animations.
 */

import { getReducedMotion } from "../core/config";

/**
 * Finds all [data-reveal-group] elements within the given scope and sets up GSAP
 * timelines with ScrollTrigger to animate them into view on scroll.
 * Returns a cleanup function that reverts the GSAP context.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 * @returns {Function} A cleanup function to revert the GSAP context.
 */
export function initScrollReveal(scope = document) {
  const elements = scope.querySelectorAll("[data-reveal-group]");
  if (!elements.length) return;

  const ctx = gsap.context(() => {
    Array.from(elements).forEach((groupEl) => {

      /* ---------------------------------- */
      /* Config                             */
      /* ---------------------------------- */

      // Read group-level animation settings from attributes, falling back to defaults
      const stagger = parseFloat(groupEl.getAttribute("data-stagger"));
      const groupStaggerSec = (stagger || 100) / 1000;
      const groupDistance = groupEl.getAttribute("data-distance") || "2em";
      const triggerStart = groupEl.getAttribute("data-start") || "top 85%";
      const rawDelay = groupEl.getAttribute("data-delay");
      const groupDelay = (rawDelay !== null ? parseFloat(rawDelay) : 0) / 1000;

      const animDuration = 0.5;
      const animEase = "power3.inOut";

      gsap.set(groupEl, { autoAlpha: 1 });

      // Reduced motion: reveal immediately without animation
      if (getReducedMotion()) {
        gsap.set(groupEl, { clearProps: "all", y: 0, autoAlpha: 1 });
        return;
      }

      // No children — animate the group element itself as a single unit
      const directChildren = Array.from(groupEl.children).filter((el) => el.nodeType === 1);
      if (!directChildren.length) {
        gsap.set(groupEl, { y: groupDistance, autoAlpha: 0 });
        ScrollTrigger.create({
          trigger: groupEl,
          start: triggerStart,
          once: true,
          onEnter: () =>
            gsap.to(groupEl, {
              y: 0,
              autoAlpha: 1,
              duration: animDuration,
              ease: animEase,
              onComplete: () => gsap.set(groupEl, { clearProps: "all" }),
            }),
        });
        return;
      }

      /* ---------------------------------- */
      /* Build animation slots              */
      /* ---------------------------------- */

      // Classify each direct child as a plain item or a nested reveal group
      const slots = [];
      directChildren.forEach((child) => {
        const nestedGroup = child.matches("[data-reveal-group-nested]")
          ? child
          : child.querySelector(":scope [data-reveal-group-nested]");

        if (nestedGroup) {
          const includeParent =
            child.getAttribute("data-ignore") === "false" ||
            nestedGroup.getAttribute("data-ignore") === "false";

          slots.push({ type: "nested", parentEl: child, nestedEl: nestedGroup, includeParent });
        } else {
          slots.push({ type: "item", el: child });
        }
      });

      /* ---------------------------------- */
      /* Initial hidden state               */
      /* ---------------------------------- */

      slots.forEach((slot) => {
        if (slot.type === "item") {
          // Nested group used as a direct item inherits group distance, not its own
          const isNestedSelf = slot.el.matches("[data-reveal-group-nested]");
          const d = isNestedSelf ? groupDistance : slot.el.getAttribute("data-distance") || groupDistance;
          gsap.set(slot.el, { y: d, autoAlpha: 0 });
        } else {
          // Parent wrapper uses group distance when included in the animation
          if (slot.includeParent) {
            gsap.set(slot.parentEl, { y: groupDistance, autoAlpha: 0 });
          }
          // Nested children use their own group's data-distance, falling back to the parent group
          const nestedD = slot.nestedEl.getAttribute("data-distance") || groupDistance;
          Array.from(slot.nestedEl.children).forEach((target) => {
            gsap.set(target, { y: nestedD, autoAlpha: 0 });
          });
        }
      });

      // Re-assert parent distance after all slots are set, to prevent nested overrides
      slots.forEach((slot) => {
        if (slot.type === "nested" && slot.includeParent) {
          gsap.set(slot.parentEl, { y: groupDistance });
        }
      });

      /* ---------------------------------- */
      /* Reveal sequence                    */
      /* ---------------------------------- */

      ScrollTrigger.create({
        trigger: groupEl,
        start: triggerStart,
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ delay: groupDelay });

          slots.forEach((slot, slotIndex) => {
            const slotTime = slotIndex * groupStaggerSec;

            if (slot.type === "item") {
              tl.to(
                slot.el,
                {
                  y: 0,
                  autoAlpha: 1,
                  duration: animDuration,
                  ease: animEase,
                  onComplete: () => gsap.set(slot.el, { clearProps: "all" }),
                },
                slotTime
              );
            } else {
              // Animate the parent wrapper at the slot's position if included
              if (slot.includeParent) {
                tl.to(
                  slot.parentEl,
                  {
                    y: 0,
                    autoAlpha: 1,
                    duration: animDuration,
                    ease: animEase,
                    onComplete: () => gsap.set(slot.parentEl, { clearProps: "all" }),
                  },
                  slotTime
                );
              }

              // Animate each nested child with its own stagger, falling back to the group stagger
              const nestedMs = parseFloat(slot.nestedEl.getAttribute("data-stagger"));
              const nestedStaggerSec = isNaN(nestedMs) ? groupStaggerSec : nestedMs / 1000;

              Array.from(slot.nestedEl.children).forEach((nestedChild, nestedIndex) => {
                tl.to(
                  nestedChild,
                  {
                    y: 0,
                    autoAlpha: 1,
                    duration: animDuration,
                    ease: animEase,
                    onComplete: () => gsap.set(nestedChild, { clearProps: "all" }),
                  },
                  slotTime + nestedIndex * nestedStaggerSec
                );
              });
            }
          });
        },
      });
    });
  });

  return () => ctx.revert();
}