/**
 * @file clients-list.js
 * @summary Generates multiple shuffled marquee rows for client list components.
 * @description Initializes all [data-clients-list-init] elements within the given scope.
 * For each one, clones the first [data-clients-list-row] a configurable number of times,
 * shuffles the client items per row, alternates scroll direction, and randomizes speed.
 * Rows beyond the first are appended dynamically to the component wrapper.
 */

import { shuffleArray } from "../core/utils.js";

/**
 * Finds all [data-clients-list-init] elements within the given scope and builds
 * additional marquee rows by cloning, shuffling, and randomizing the first row.
 * The number of rows is driven by the [data-clients-list-lines] attribute.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */
export function initClientsList(scope = document) {
  const elements = scope.querySelectorAll("[data-clients-list-init]");
  if (!elements.length) return;

  elements.forEach((el) => {
    const component = el.querySelector("[data-clients-list-row]");
    const lines = parseInt(el.getAttribute("data-clients-list-lines"), 10) || 1;
    if (!component || lines <= 1) return;

    const firstCollection = component.querySelector("[data-marquee-collection-target]");
    if (!firstCollection) return;

    // Snapshot original items and read base marquee settings from the first row
    const oItems = firstCollection.querySelectorAll(".client-list__item");
    const oMarquee = component.querySelector("[data-marquee-scroll-direction-target]");

    if (oMarquee) {
      oMarquee.setAttribute("data-marquee-direction", "right");
    }

    const baseSpeed = parseFloat(oMarquee?.getAttribute("data-marquee-speed")) || 15;
    const baseScrollSpeed = parseFloat(oMarquee?.getAttribute("data-marquee-scroll-speed")) || 10;

    // Clone the first row for each additional line
    for (let i = 1; i < lines; i++) {
      const clone = component.cloneNode(true);

      // Set direction, randomized speed, and reset status on the cloned marquee
      const marquee = clone.querySelector("[data-marquee-scroll-direction-target]");
      if (marquee) {
        const direction = i % 2 === 0 ? "right" : "left";
        const randomFactor = 0.7 + Math.random() * 0.6;

        marquee.setAttribute("data-marquee-direction", direction);
        marquee.setAttribute("data-marquee-speed", (baseSpeed * randomFactor).toFixed(2));
        marquee.setAttribute("data-marquee-scroll-speed", (baseScrollSpeed * randomFactor).toFixed(2));
        marquee.removeAttribute("data-marquee-status");
      }

      // Remove duplicate collections injected by the first-row marquee, keep only the first
      const allCollections = clone.querySelectorAll("[data-marquee-collection-target]");
      allCollections.forEach((col, index) => {
        if (index > 0) col.remove();
      });

      // Populate the remaining collection with a shuffled copy of the original items
      const cloneCollection = clone.querySelector("[data-marquee-collection-target]");
      if (cloneCollection) {
        const shuffled = shuffleArray(Array.from(oItems));
        cloneCollection.innerHTML = "";
        shuffled.forEach((item) => {
          cloneCollection.appendChild(item.cloneNode(true));
        });
      }

      // Reset any inline styles left by the marquee initializer on the scroll target
      const marqueeScroll = clone.querySelector("[data-marquee-scroll-target]");
      if (marqueeScroll) {
        marqueeScroll.removeAttribute("style");
      }

      el.appendChild(clone);
    }
  });
}