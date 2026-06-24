/**
 * @file hover-list.js
 * @summary Initializes a custom cursor follower with visual transitions for hover list components.
 * @description For each [data-hover-list-wrap] element, sets up a GSAP-powered cursor follower
 * that tracks mouse position with inertia and applies velocity-based rotation. On item hover,
 * clones the item's visual into the follower with a crossfade transition. On collection leave,
 * all clones are faded out and state is reset. First-entry hovers skip the fade-in animation
 * for an instant initial appearance.
 */

/**
 * Finds all [data-hover-list-wrap] elements within the given scope and initializes
 * cursor following, velocity rotation, and per-item visual crossfade behavior.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */
export function initHoverList(scope = document) {
  const elements = scope.querySelectorAll("[data-hover-list-wrap]");
  if (!elements.length) return;

  elements.forEach((wrap) => {
    const collection = wrap.querySelector("[data-hover-list-collection]");
    const items = wrap.querySelectorAll("[data-hover-list-item]");
    const follower = wrap.querySelector("[data-hover-list-cursor]");
    const followerInner = wrap.querySelector("[data-hover-list-cursor-inner]");

    let prevIndex = null;
    let firstEntry = true;

    const duration = 0.5;
    const ease = "power2.inOut";

    /* ---------------------------------- */
    /* Cursor follow                      */
    /* ---------------------------------- */

    // Center the follower on the cursor and animate it with quickTo for smooth lag
    gsap.set(follower, { xPercent: -50, yPercent: -50 });

    const xTo = gsap.quickTo(follower, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(follower, "y", { duration: 0.6, ease: "power3" });

    window.addEventListener("mousemove", (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    });

    /* ---------------------------------- */
    /* Velocity rotation                  */
    /* ---------------------------------- */

    const pos = { x: 0, y: 0 };
    const prevPos = { x: 0, y: 0 };
    const velocity = { x: 0, y: 0 };

    let rotation = 0;
    let targetRotation = 0;
    let lastTime = 0;
    let isHovering = false;

    const maxRotation = 20;
    const velocityMult = 0.4;
    const rotationDecay = 0.92;

    // rAF loop — tilts the follower based on horizontal cursor velocity
    const track = (timestamp) => {
      const deltaTime = timestamp - (lastTime || timestamp);
      lastTime = timestamp;

      if (deltaTime > 0) {
        velocity.x = velocity.x * 0.7 + (pos.x - prevPos.x) * 0.3;
      }

      prevPos.x = pos.x;

      targetRotation = Math.max(-maxRotation, Math.min(maxRotation, velocity.x * velocityMult));

      // Lerp toward target while hovering, decay toward zero when not
      rotation = isHovering
        ? rotation + (targetRotation - rotation) * 0.2
        : rotation * rotationDecay;

      gsap.set(follower, { rotation });

      requestAnimationFrame(track);
    };

    requestAnimationFrame(track);

    // Separate mousemove listener to track raw position for velocity calculation
    window.addEventListener("mousemove", (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
    });

    /* ---------------------------------- */
    /* Item events                        */
    /* ---------------------------------- */

    items.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        isHovering = true;

        const visual = item.querySelector("[data-hover-list-visual]");
        if (!visual) return;

        // Snapshot outgoing clones before inserting the new one
        const outgoing = Array.from(follower.querySelectorAll("[data-hover-list-visual]"));

        // Clone the item visual and layer it on top inside the follower
        const clone = visual.cloneNode(true);
        gsap.set(clone, { opacity: 0, scale: 1.05, position: "absolute", inset: 0, zIndex: 2 });
        followerInner.appendChild(clone);

        // Push existing clones behind the new one
        outgoing.forEach((el) => gsap.set(el, { zIndex: 1 }));

        // Skip fade-in on first hover — show immediately
        if (!firstEntry) {
          gsap.to(clone, { opacity: 1, scale: 1, duration, ease, overwrite: "auto" });
        } else {
          gsap.set(clone, { opacity: 1, scale: 1 });
          firstEntry = false;
        }

        // Fade out and remove outgoing clones after the new one is visible
        outgoing.forEach((el) => {
          gsap.killTweensOf(el);
          gsap.to(el, {
            opacity: 0,
            scale: 0.95,
            delay: duration * 0.5,
            duration: duration * 0.4,
            ease,
            overwrite: "auto",
            onComplete: () => el.remove(),
          });
        });
      });

      // Item mouseleave is intentionally a no-op — exit is handled at collection level
      item.addEventListener("mouseleave", () => { });
    });

    /* ---------------------------------- */
    /* Collection events                  */
    /* ---------------------------------- */

    collection.addEventListener("mouseenter", () => {
      isHovering = true;
    });

    // On collection leave, fade out all clones and reset state for the next entry
    collection.addEventListener("mouseleave", () => {
      isHovering = false;

      follower.querySelectorAll("[data-hover-list-visual]").forEach((el) => {
        gsap.killTweensOf(el);
        gsap.to(el, {
          opacity: 0,
          duration: duration * 0.6,
          ease,
          overwrite: "auto",
          onComplete: () => el.remove(),
        });
      });

      firstEntry = true;
      prevIndex = null;
    });
  });
}