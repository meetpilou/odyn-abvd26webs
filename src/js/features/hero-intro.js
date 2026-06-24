/**
 * @file hero-intro.js
 * @summary Initializes entrance animations for .hero sections.
 * @description Finds all .hero elements and sets up a GSAP matchMedia timeline for desktop
 * viewports. Animates a background scale-down, badge fade-in, SplitText character reveal
 * on the highlighted title, a body text fade-up, and a media element fade-up. Reduced motion
 * and non-desktop contexts skip all animations and reset elements to their natural visible state.
 */

import { MEDIAQUERIES } from "../core/config";

/**
 * Finds all .hero elements within the given scope and sets up a responsive GSAP intro
 * animation using matchMedia. Each hero animates its background, badge, title chars,
 * text, and media element in a sequenced timeline.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */
export function initHeroIntro(scope = document) {
  const elements = scope.querySelectorAll(".hero");
  if (!elements.length) return;

  elements.forEach((hero) => {
    const bg = hero.querySelector(".hero__bg");
    const badge = hero.querySelector(".badge");
    const title = hero.querySelector("[data-highlight-text-marker]");
    const text = hero.querySelector(".hero__text");
    const media = hero.querySelector(".hero__media");

    gsap.matchMedia().add(MEDIAQUERIES, (context) => {
      const { isReducedMotion, isDesktop } = context.conditions;

      const allEls = [title, text, bg, media].filter(Boolean);

      // Reduced motion or mobile — skip animation and ensure all elements are visible
      if (isReducedMotion || !isDesktop) {
        gsap.set(allEls, { clearProps: "all", autoAlpha: 1 });
        return;
      }

      // Main timeline — clears all inline props on complete
      const tl = gsap.timeline({
        delay: 0.25,
        defaults: { ease: "expo.out" },
        onComplete: () => gsap.set(allEls, { clearProps: "all" }),
      });

      /* ---------------------------------- */
      /* Background scale-down              */
      /* ---------------------------------- */

      if (bg) {
        gsap.set(bg, { scale: 1.2, autoAlpha: 1 });
        tl.to(bg, { scale: 1, duration: 2.5, ease: "power4.out" }, 0.25);
      }

      /* ---------------------------------- */
      /* Badge fade-up                      */
      /* ---------------------------------- */

      if (badge) {
        gsap.set(badge, { autoAlpha: 0, y: "1em" });
        tl.to(
          badge,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            onComplete: () => gsap.set(badge, { clearProps: "all" }),
          },
          0.3
        );
      }

      /* ---------------------------------- */
      /* Title — SplitText char reveal      */
      /* ---------------------------------- */

      if (title) {
        gsap.set(title, { autoAlpha: 1 });

        SplitText.create(title, {
          type: "lines, words, chars",
          mask: "lines",
          autoSplit: true,
          linesClass: "line",
          wordsClass: "word",
          charsClass: "letter",
          // Animate chars upward from behind the line mask once split is ready
          onSplit(instance) {
            tl.from(
              instance.chars,
              {
                yPercent: 110,
                duration: 0.6,
                stagger: 0.01,
                ease: "expo.out",
                onComplete: () => instance.revert(),
              },
              0.7
            );
          },
        });
      }

      /* ---------------------------------- */
      /* Body text fade-up                  */
      /* ---------------------------------- */

      if (text) {
        gsap.set(text, { autoAlpha: 0, y: "1.5em" });
        tl.to(
          text,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            onComplete: () => gsap.set(text, { clearProps: "all" }),
          },
          "<"
        );
      }

      /* ---------------------------------- */
      /* Media fade-up                      */
      /* ---------------------------------- */

      if (media) {
        gsap.set(media, { autoAlpha: 0, y: "2em" });
        tl.to(
          media,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            onComplete: () => gsap.set(media, { clearProps: "all" }),
          },
          "<"
        );
      }
    });
  });
}
