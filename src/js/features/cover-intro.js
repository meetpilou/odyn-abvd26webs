/**
 * @file cover-intro.js
 * @summary Initializes entrance animations for cover intro sections.
 * @description Finds all [data-cover-intro] elements and sets up a GSAP matchMedia timeline
 * for desktop viewports. Animates a background scale-down, a SplitText character reveal on
 * the heading, and a staggered fade-in for number items. All reveals are from-based, so the
 * natural resting state of every element is "visible" — this means any matchMedia revert or
 * clearProps lands on the visible state instead of freezing elements at a hidden start state.
 * Initialization is idempotent per element, and the intro plays once per element regardless of
 * resizes or breakpoint changes.
 */

import { MEDIAQUERIES } from "../core/config.js";

/**
 * Finds all [data-cover-intro] elements within the given scope and sets up
 * a responsive GSAP intro animation using matchMedia. Animations include a
 * background scale, a SplitText character entrance, and staggered number reveals.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */

export function initCoverIntro(scope = document) {
  const elements = scope.querySelectorAll("[data-cover-intro]");
  if (!elements.length) return;

  elements.forEach((el) => {
    // Idempotent init: if this module gets re-invoked (framework resize / re-init
    // hooks), don't stack another matchMedia + SplitText + timeline on the same
    // element. The flag lives ON THE ELEMENT so it survives re-invocations — a
    // function-scoped flag would reset to false on every call and let the intro
    // re-run and re-hide the background / numbers.
    if (el._coverIntroInit) return;
    el._coverIntroInit = true;

    const mm = gsap.matchMedia();

    const bg = el.querySelector(".cover__bg");
    const title = el.querySelector(".heading__text");
    const numbers = el.querySelectorAll(".number-item");

    const allEls = [title, bg, ...numbers].filter(Boolean);

    // Tracks whether the one-shot intro has already played, across matchMedia
    // re-runs (it lives outside mm.add). Prevents the intro replaying on a
    // breakpoint change.
    let introPlayed = false;

    mm.add(MEDIAQUERIES, (context) => {
      const { isReducedMotion, isDesktop } = context.conditions;

      // Force the final visible state when the intro already played, or under
      // reduced motion / non-desktop. clearProps strips any inline state left by
      // a from() tween's immediateRender so nothing stays hidden.
      if (introPlayed || isReducedMotion || !isDesktop) {
        const letters = title ? title.querySelectorAll(".letter") : [];
        gsap.set([...allEls, ...letters], { clearProps: "all", autoAlpha: 1 });
        return;
      }

      introPlayed = true;

      // from-based reveals: the resting state is the natural/visible state, so a
      // matchMedia revert restores "visible" rather than the hidden start state.
      const tl = gsap.timeline({
        delay: 0.25,
        defaults: { ease: "expo.out" },
        onComplete: () => gsap.set(allEls, { clearProps: "all" }),
      });

      /* ---------------------------------- */
      /* Background scale-down              */
      /* ---------------------------------- */

      if (bg) {
        gsap.set(bg, { autoAlpha: 1 });
        tl.from(bg, { scale: 1.2, duration: 2.5, ease: "power4.out" }, 0.25);
      }

      /* ---------------------------------- */
      /* Title — SplitText char reveal      */
      /* ---------------------------------- */

      // The char reveal is folded into the one-shot timeline only on the first
      // split. autoSplit re-fires onSplit on every resize / font-swap; re-adding
      // a from(yPercent:110) to the finished timeline would render the new chars
      // hidden below the mask and never animate them back. On later splits we
      // just leave the chars in their visible position.
      let titleAnimated = false;

      if (title) {
        gsap.set(title, { autoAlpha: 1 });

        SplitText.create(title, {
          type: "lines, words, chars",
          mask: "lines",
          autoSplit: true,
          linesClass: "line",
          wordsClass: "word",
          charsClass: "letter",
          onSplit(instance) {
            if (titleAnimated) {
              gsap.set(instance.chars, { yPercent: 0 });
              return;
            }
            titleAnimated = true;

            // Returning the tween lets autoSplit revert it cleanly before any
            // subsequent re-split.
            return tl.from(
              instance.chars,
              {
                yPercent: 110,
                duration: 0.6,
                stagger: 0.01,
                ease: "expo.out",
              },
              0.7
            );
          },
        });
      }

      /* ---------------------------------- */
      /* Numbers — staggered fade-in        */
      /* ---------------------------------- */

      if (numbers.length) {
        tl.from(
          numbers,
          {
            autoAlpha: 0,
            y: "1.5em",
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
          },
          "-=1.25"
        );
      }
    });
  });
}
