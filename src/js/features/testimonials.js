/**
 * @file testimonials.js
 * @summary Initializes animated testimonial sliders with autoplay, keyboard navigation, and SplitText transitions.
 * @description For each [data-testimonial-wrap] element, sets up slide state management, GSAP SplitText
 * line animations, image clip-path reveals, prev/next controls, and arrow key support.
 * Autoplay pauses when the component leaves the viewport via ScrollTrigger.
 * All animations respect the user's reduced-motion preference.
 */

/**
 * Initializes testimonial sliders on all [data-testimonial-wrap] elements within the given scope.
 * Manages slide transitions with staggered line animations and circular image reveals,
 * wires prev/next buttons and keyboard arrows, and handles autoplay with visibility-aware pausing.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search for [data-testimonial-wrap] elements.
 */
export function initTestimonials(scope = document) {
  const elements = scope.querySelectorAll("[data-testimonial-wrap]");
  if (!elements.length) return;

  elements.forEach((element) => {
    const list = element.querySelector("[data-testimonial-list]");
    if (!list) return;

    const items = Array.from(list.querySelectorAll("[data-testimonial-item]"));
    if (!items.length) return;

    // Query UI controls and counter elements
    const btnPrev = element.querySelector("[data-prev]");
    const btnNext = element.querySelector("[data-next]");
    const elCurrent = element.querySelector("[data-current]");
    const elTotal = element.querySelector("[data-total]");

    if (elTotal) elTotal.textContent = String(items.length);

    // Default to first slide if none is marked active
    let activeIndex = items.findIndex((item) =>
      item.classList.contains("is--active")
    );
    if (activeIndex < 0) activeIndex = 0;

    let isAnimating = false;
    let reduceMotion = false;

    // Read autoplay configuration from data attributes
    const autoplayEnabled = element.getAttribute("data-autoplay") === "true";
    const autoplayDuration =
      parseInt(element.getAttribute("data-autoplay-duration"), 10) || 4000;

    let autoplayCall = null;
    let isInView = true;

    // Build slide descriptors with SplitText targets
    const slides = items.map((item) => ({
      item,
      image: item.querySelector("[data-testimonial-img]"),
      splitTargets: [
        item.querySelector("[data-testimonial-text]"),
        ...item.querySelectorAll("[data-testimonial-split]"),
      ].filter(Boolean),
      splitInstances: [],
      getLines() {
        return this.splitInstances.flatMap((instance) => instance.lines);
      },
    }));

    function setSlideState(slideIndex, isActive) {
      const { item } = slides[slideIndex];
      item.classList.toggle("is--active", isActive);
      item.setAttribute("aria-hidden", String(!isActive));
      gsap.set(item, {
        autoAlpha: isActive ? 1 : 0,
        pointerEvents: isActive ? "auto" : "none",
      });
    }

    function updateCounter() {
      if (elCurrent) elCurrent.textContent = String(activeIndex + 1);
    }

    // Autoplay — restarts the delayed call on each cycle
    function startAutoplay() {
      if (!autoplayEnabled) return;
      if (autoplayCall) autoplayCall.kill();
      autoplayCall = gsap.delayedCall(autoplayDuration / 1000, () => {
        if (!isInView || isAnimating) {
          startAutoplay();
          return;
        }
        goTo((activeIndex + 1) % slides.length);
        startAutoplay();
      });
    }

    function pauseAutoplay() {
      if (autoplayCall) autoplayCall.pause();
    }

    function resumeAutoplay() {
      if (!autoplayEnabled) return;
      if (!autoplayCall) startAutoplay();
      else autoplayCall.resume();
    }

    function resetAutoplay() {
      if (!autoplayEnabled) return;
      startAutoplay();
    }

    // Set initial visibility and counter
    slides.forEach((_, i) => setSlideState(i, i === activeIndex));
    updateCounter();

    // Track reduced-motion preference reactively
    gsap
      .matchMedia()
      .add({ reduce: "(prefers-reduced-motion: reduce)" }, (context) => {
        reduceMotion = context.conditions.reduce;
      });

    // Initialize SplitText on all slides, set initial line positions
    slides.forEach((slide, slideIndex) => {
      slide.splitInstances = slide.splitTargets.map((target) =>
        SplitText.create(target, {
          type: "lines",
          mask: "lines",
          linesClass: "text-line",
          autoSplit: true,
          onSplit(self) {
            if (reduceMotion) return;
            const isActive = slideIndex === activeIndex;
            gsap.set(self.lines, { yPercent: isActive ? 0 : 110 });
            if (slide.image) {
              gsap.set(slide.image, {
                clipPath: isActive
                  ? "circle(50% at 50% 50%)"
                  : "circle(0% at 50% 50%)",
              });
            }
          },
        })
      );
    });

    function goTo(nextIndex) {
      if (isAnimating || nextIndex === activeIndex) return;
      isAnimating = true;

      const outgoing = slides[activeIndex];
      const incoming = slides[nextIndex];

      const tl = gsap.timeline({
        onComplete: () => {
          setSlideState(activeIndex, false);
          setSlideState(nextIndex, true);
          activeIndex = nextIndex;
          updateCounter();
          isAnimating = false;
        },
      });

      // Reduced-motion fallback — simple crossfade
      if (reduceMotion) {
        tl.to(
          outgoing.item,
          { autoAlpha: 0, duration: 0.4, ease: "power2" },
          0
        ).fromTo(
          incoming.item,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.4, ease: "power2" },
          0
        );
        return;
      }

      // Prepare incoming slide before animating
      gsap.set(incoming.item, { autoAlpha: 1, pointerEvents: "auto" });
      gsap.set(incoming.getLines(), { yPercent: 110 });
      if (incoming.image)
        gsap.set(incoming.image, { clipPath: "circle(0% at 50% 50%)" });
      if (outgoing.image)
        gsap.set(outgoing.image, { clipPath: "circle(50% at 50% 50%)" });

      // Animate outgoing lines upward
      tl.to(
        outgoing.getLines(),
        {
          yPercent: -110,
          duration: 0.6,
          ease: "power4.inOut",
          stagger: { amount: 0.25 },
        },
        0
      );

      // Collapse outgoing image simultaneously
      if (outgoing.image) {
        tl.to(
          outgoing.image,
          {
            clipPath: "circle(0% at 50% 50%)",
            duration: 0.6,
            ease: "power4.inOut",
          },
          0
        );
      }

      // Animate incoming lines downward into view
      tl.to(
        incoming.getLines(),
        {
          yPercent: 0,
          duration: 0.7,
          ease: "power4.inOut",
          stagger: { amount: 0.4 },
        },
        ">-=0.3"
      );

      // Expand incoming image in sync with lines
      if (incoming.image) {
        tl.to(
          incoming.image,
          {
            clipPath: "circle(50% at 50% 50%)",
            duration: 0.75,
            ease: "power4.inOut",
          },
          "<"
        );
      }

      tl.set(outgoing.item, { autoAlpha: 0 }, ">");
    }

    startAutoplay();

    if (btnNext) {
      btnNext.addEventListener("click", () => {
        resetAutoplay();
        goTo((activeIndex + 1) % slides.length);
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener("click", () => {
        resetAutoplay();
        goTo((activeIndex - 1 + slides.length) % slides.length);
      });
    }

    // Arrow key navigation — skip if user is typing in an input
    function onKeyDown(e) {
      if (!isInView) return;
      const t = e.target;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      )
        return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        resetAutoplay();
        goTo((activeIndex + 1) % slides.length);
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        resetAutoplay();
        goTo((activeIndex - 1 + slides.length) % slides.length);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    // Pause autoplay and keyboard nav when the component is out of view
    ScrollTrigger.create({
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => {
        isInView = true;
        resumeAutoplay();
      },
      onEnterBack: () => {
        isInView = true;
        resumeAutoplay();
      },
      onLeave: () => {
        isInView = false;
        pauseAutoplay();
      },
      onLeaveBack: () => {
        isInView = false;
        pauseAutoplay();
      },
    });
  });
}
