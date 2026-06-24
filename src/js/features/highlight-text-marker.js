/**
 * @file highlight-text-marker.js
 * @summary Initializes animated highlight bar reveals for elements marked with [data-highlight-text-marker="True"].
 * @description Uses GSAP SplitText to split marked elements into lines, then injects a bar element
 * per line that wipes away to reveal the text. Characters animate in simultaneously with a slight
 * offset. Scroll entry is handled by ScrollTrigger. Supports configurable direction, stagger,
 * delay, and scroll start via data attributes. Reduced motion is detected inside a matchMedia
 * callback and skips all animations. Previous instances are fully cleaned up on re-run.
 */

/**
 * Initializes highlight text marker animations within the given scope.
 * Reads motion preference via GSAP matchMedia and either skips (reduced motion)
 * or builds per-element SplitText bar reveal timelines driven by ScrollTrigger.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */
export function initHighlightTextMarker(scope = document) {
  const defaults = {
    direction: "right",
    scrollStart: "top 90%",
    staggerStart: "start",
    stagger: 100,
    barDuration: 0.8,
    barEase: "power2.inOut",
    delay: 300,
  };

  const directionMap = {
    right: { prop: "scaleX", origin: "right center" },
    left: { prop: "scaleX", origin: "left center" },
    up: { prop: "scaleY", origin: "center top" },
    down: { prop: "scaleY", origin: "center bottom" },
  };

  // Reusable bar template — cloned per line to avoid repeated style computation
  const barTemplate = document.createElement("div");
  barTemplate.className = "highlight-marker-bar";

  function createBar(origin) {
    const bar = barTemplate.cloneNode(false);
    bar.style.cssText = `transform-origin:${origin}`;
    return bar;
  }

  // Full teardown of a previously initialized element
  function cleanupElement(el) {
    if (!el._highlightMarkerReveal) return;

    el._highlightMarkerReveal.timeline?.kill();
    el._highlightMarkerReveal.scrollTrigger?.kill();
    el._highlightMarkerReveal.split?.revert();

    // Use cached bar refs when available, fall back to DOM query
    const bars =
      el._highlightMarkerReveal.bars ||
      Array.from(el.querySelectorAll(".highlight-marker-bar"));
    bars.forEach((bar) => bar.remove());

    delete el._highlightMarkerReveal;
  }

  // Reduced-motion check must live inside the matchMedia callback —
  // the add() callback is async, so reading the flag outside would always be a no-op
  gsap.matchMedia().add(
    {
      reduce: "(prefers-reduced-motion: reduce)",
      full: "(prefers-reduced-motion: no-preference)",
    },
    (context) => {
      if (context.conditions.reduce) {
        // Reduced motion — reveal all marked elements immediately
        scope.querySelectorAll("[data-highlight-text-marker]").forEach((el) => {
          gsap.set(el, { autoAlpha: 1 });
        });
        return;
      }

      // Clean up any previous instances before re-initializing
      scope
        .querySelectorAll("[data-highlight-text-marker]")
        .forEach(cleanupElement);

      const elements = scope.querySelectorAll(
        "[data-highlight-text-marker='True']"
      );
      if (!elements.length) return;

      elements.forEach((el) => {
        // Read per-element config from data attributes with defaults
        const direction =
          el.getAttribute("data-marker-direction") || defaults.direction;
        const scrollStart =
          el.getAttribute("data-marker-scroll-start") || defaults.scrollStart;
        const staggerStart =
          el.getAttribute("data-marker-stagger-start") || defaults.staggerStart;
        const staggerOffset =
          (parseFloat(el.getAttribute("data-marker-stagger")) ||
            defaults.stagger) / 1000;
        const rawDelay = el.getAttribute("data-marker-delay");
        const delay =
          (rawDelay !== null ? parseFloat(rawDelay) : defaults.delay) / 1000;
        const dirConfig = directionMap[direction] || directionMap.right;

        el._highlightMarkerReveal = {};

        const split = SplitText.create(el, {
          type: "lines, chars",
          linesClass: "highlight-marker-line",
          charsClass: "highlight-marker-char",
          autoSplit: true,
          onSplit(self) {
            const instance = el._highlightMarkerReveal;

            // Teardown previous build before rebuilding (e.g. on autoSplit re-run)
            instance.timeline?.kill();
            instance.scrollTrigger?.kill();
            instance.bars?.forEach((bar) => bar.remove());

            const lines = self.lines;
            const createdBars = [];
            const tl = gsap.timeline({
              paused: true,
              delay,
              // Revert the SplitText once, after the whole reveal is done —
              // restores the original text (selection, a11y) and removes wrappers.
              onComplete: () => {
                instance.split?.revert();
              },
            });

            // Set all lines to relative + overflow hidden in one batch call
            gsap.set(lines, { position: "relative", overflow: "hidden" });

            lines.forEach((line, i) => {
              // Insert a bar into each line to cover and then wipe away the text
              const bar = createBar(dirConfig.origin);
              line.appendChild(bar);
              createdBars.push(bar);

              const staggerIndex =
                staggerStart === "end" ? lines.length - 1 - i : i;
              const t = staggerIndex * staggerOffset;

              // Wipe the bar away in the configured direction
              tl.to(
                bar,
                {
                  [dirConfig.prop]: 0,
                  duration: defaults.barDuration,
                  ease: defaults.barEase,
                },
                t
              );

              // Animate chars in from behind the bar simultaneously
              const chars = line.querySelectorAll(".highlight-marker-char");
              tl.from(
                chars,
                {
                  x: "-1em",
                  opacity: 0,
                  rotate: -10,
                  duration: defaults.barDuration - 0.1,
                  stagger: 0.01,
                  ease: "power2.out",
                },
                t
              );
            });

            // Cache bar refs directly to avoid future DOM queries on cleanup
            instance.bars = createdBars;

            // Make the element visible — bars are covering the text until the timeline plays
            gsap.set(el, { autoAlpha: 1 });

            // Trigger timeline playback on scroll entry
            const st = ScrollTrigger.create({
              trigger: el,
              start: scrollStart,
              once: true,
              onEnter: () => tl.play(),
            });

            instance.timeline = tl;
            instance.scrollTrigger = st;
          },
        });

        el._highlightMarkerReveal.split = split;
      });
    }
  );
}
