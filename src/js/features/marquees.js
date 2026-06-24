/**
 * @file marquees.js
 * @summary Initializes auto-scrolling marquee animations with scroll-driven direction and speed effects.
 * @description For each [data-marquee-scroll-direction-target] element, duplicates the marquee
 * content, sets up a looping GSAP animation, and inverts direction based on scroll direction
 * via ScrollTrigger. A secondary scrubbed timeline adds a parallax-style horizontal drift
 * to the scroll container. Speed is scaled by viewport width breakpoint.
 */

/**
 * Finds all [data-marquee-scroll-direction-target] elements within the given scope
 * and initializes looping marquee animations with scroll-driven direction inversion
 * and a scrubbed horizontal drift effect.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */
export function initMarquees(scope = document) {
  const elements = scope.querySelectorAll("[data-marquee-scroll-direction-target]");
  if (!elements.length) return;

  elements.forEach((el) => {
    const marqueeContent = el.querySelector("[data-marquee-collection-target]");
    const marqueeScroll = el.querySelector("[data-marquee-scroll-target]");
    if (!marqueeContent || !marqueeScroll) return;

    // Read animation config from data attributes
    const marqueeSpeedAttr = parseFloat(el.dataset.marqueeSpeed);
    const marqueeDirectionAttr = el.dataset.marqueeDirection === "right" ? 1 : -1;
    const duplicateAmount = parseInt(el.dataset.marqueeDuplicate || 0);
    const scrollSpeedAttr = parseFloat(el.dataset.marqueeScrollSpeed);

    // Scale speed down on smaller viewports
    const speedMultiplier = window.innerWidth < 479 ? 0.25 : window.innerWidth < 991 ? 0.5 : 1;
    const marqueeSpeed = marqueeSpeedAttr * (marqueeContent.offsetWidth / window.innerWidth) * speedMultiplier;

    /* ---------------------------------- */
    /* Scroll container sizing            */
    /* ---------------------------------- */

    // Expand the scroll container to accommodate the horizontal drift range
    marqueeScroll.style.marginLeft = `${scrollSpeedAttr * -1}%`;
    marqueeScroll.style.width = `${scrollSpeedAttr * 2 + 100}%`;

    /* ---------------------------------- */
    /* Duplicate content                  */
    /* ---------------------------------- */

    if (duplicateAmount > 0) {
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < duplicateAmount; i++) {
        fragment.appendChild(marqueeContent.cloneNode(true));
      }
      marqueeScroll.appendChild(fragment);
    }

    /* ---------------------------------- */
    /* Looping animation                  */
    /* ---------------------------------- */

    const marqueeItems = el.querySelectorAll("[data-marquee-collection-target]");

    // Start at mid-progress so the loop feels seamless from the first frame
    const animation = gsap
      .to(marqueeItems, {
        xPercent: -100,
        repeat: -1,
        duration: marqueeSpeed,
        ease: "linear",
      })
      .totalProgress(0.5);

    gsap.set(marqueeItems, { xPercent: marqueeDirectionAttr === 1 ? 100 : -100 });
    animation.timeScale(marqueeDirectionAttr);
    animation.play();

    el.setAttribute("data-marquee-status", "normal");

    /* ---------------------------------- */
    /* Scroll direction inversion         */
    /* ---------------------------------- */

    // Invert the marquee direction when scrolling down vs up
    ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const currentDirection = self.direction === 1 ? -marqueeDirectionAttr : marqueeDirectionAttr;
        animation.timeScale(currentDirection);
        el.setAttribute("data-marquee-status", self.direction === 1 ? "normal" : "inverted");
      },
    });

    /* ---------------------------------- */
    /* Scrubbed horizontal drift          */
    /* ---------------------------------- */

    // Drift the scroll container horizontally as the element moves through the viewport
    const scrollStart = marqueeDirectionAttr === -1 ? scrollSpeedAttr : -scrollSpeedAttr;
    const scrollEnd = -scrollStart;

    gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "0% 100%",
        end: "100% 0%",
        scrub: 0,
      },
    }).fromTo(
      marqueeScroll,
      { x: `${scrollStart}vw` },
      { x: `${scrollEnd}vw`, ease: "none" }
    );
  });
}