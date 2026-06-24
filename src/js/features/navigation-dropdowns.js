/**
 * @file navigation-dropdown.js
 * @summary Initializes submenu dropdowns and dynamic height management for .nav-dropdown elements.
 * @description For each .nav-dropdown, sets up ARIA attributes, default closed states, and
 * click/keyboard interactions for [data-submenu-toggle] elements. On desktop (≥992px), opens
 * the first submenu by default and calculates row height to fit the tallest panel. Heights
 * and submenu states are reset when leaving the desktop breakpoint.
 */

import { pxToRem } from "../core/utils";

/**
 * Finds all .nav-dropdown elements within the given scope, initializes their submenu
 * toggles, and sets up responsive height management via GSAP matchMedia.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */
export function initNavigationDropdowns(scope = document) {
  const dropdowns = Array.from(scope.querySelectorAll(".nav-dropdown"));
  if (!dropdowns.length) return;

  dropdowns.forEach((dropdown) => initSubmenuDropdowns(dropdown));

  initDropdownHeights(dropdowns);
}

/* ------------------------------------------------------------------- */
/* Submenu — Init                                                       */
/* ------------------------------------------------------------------- */

function initSubmenuDropdowns(scope) {
  const toggles = Array.from(scope.querySelectorAll("[data-submenu-toggle]"));
  if (!toggles.length) return;

  setupSubmenuARIA(toggles);
  setDefaultSubmenu(toggles);
  bindSubmenuEvents(toggles);
}

/* ------------------------------------------------------------------- */
/* Submenu — Helpers                                                    */
/* ------------------------------------------------------------------- */

function getSubmenuPanel(toggle) {
  const item = toggle.closest(".nav-menu-item");
  if (!item) return null;
  return item.querySelector(".nav-menu-item_dropdown");
}

/* ------------------------------------------------------------------- */
/* Submenu — ARIA                                                       */
/* ------------------------------------------------------------------- */

function setupSubmenuARIA(toggles) {
  toggles.forEach((toggle, i) => {
    const panel = getSubmenuPanel(toggle);
    if (!panel) return;

    const id = `submenu-panel-${i}`;

    toggle.setAttribute("role", "button");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", id);

    panel.setAttribute("id", id);
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-hidden", "true");
  });
}

/* ------------------------------------------------------------------- */
/* Submenu — Default state                                              */
/* ------------------------------------------------------------------- */

// All panels closed by default — desktop open state is handled by initDropdownHeights
function setDefaultSubmenu(toggles) {
  toggles.forEach((toggle) => {
    const panel = getSubmenuPanel(toggle);
    if (!panel) return;

    toggle.dataset.submenuToggle = "False";
    toggle.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
  });
}

/* ------------------------------------------------------------------- */
/* Submenu — Open / close                                               */
/* ------------------------------------------------------------------- */

// Open a single submenu exclusively and recalculate the dropdown row height
function openSubmenu(activeToggle, toggles) {
  const dropdown = activeToggle.closest(".nav-dropdown");

  toggles.forEach((toggle) => {
    const panel = getSubmenuPanel(toggle);
    if (!panel) return;

    const isActive = toggle === activeToggle;
    toggle.dataset.submenuToggle = isActive ? "True" : "False";
    toggle.setAttribute("aria-expanded", isActive);
    panel.setAttribute("aria-hidden", !isActive);
  });

  if (dropdown) setDropdownHeight(dropdown);
}

function closeSubmenu(toggle) {
  const panel = getSubmenuPanel(toggle);
  if (!panel) return;

  toggle.dataset.submenuToggle = "False";
  toggle.setAttribute("aria-expanded", "false");
  panel.setAttribute("aria-hidden", "true");
}

/* ------------------------------------------------------------------- */
/* Submenu — Events                                                     */
/* ------------------------------------------------------------------- */

// Click and keyboard events are shared across mobile and desktop breakpoints
function bindSubmenuEvents(toggles) {
  const mqDesktop = window.matchMedia("(min-width: 992px)");

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {


      const isActive = toggle.dataset.submenuToggle === "True";
      if (!mqDesktop.matches) {
        isActive ? closeSubmenu(toggle) : openSubmenu(toggle, toggles);
        return;
      }
      openSubmenu(toggle, toggles);
    });

    toggle.addEventListener("keydown", (e) => {
      const index = toggles.indexOf(toggle);

      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          openSubmenu(toggle, toggles);
          break;

        case "ArrowDown":
          e.preventDefault();
          toggles[(index + 1) % toggles.length].focus();
          break;

        case "ArrowUp":
          e.preventDefault();
          toggles[(index - 1 + toggles.length) % toggles.length].focus();
          break;

        case "Escape":
          e.preventDefault();
          toggle.blur();
          break;
      }
    });
  });
}

/* ------------------------------------------------------------------- */
/* Dropdown height — Desktop only                                       */
/* ------------------------------------------------------------------- */

// On desktop: open first submenu and set row heights; revert both on breakpoint exit
function initDropdownHeights(dropdowns) {
  if (!window.gsap) return;

  gsap.matchMedia().add("(min-width: 992px)", () => {
    dropdowns.forEach((dropdown) => {
      const toggles = Array.from(
        dropdown.querySelectorAll("[data-submenu-toggle]")
      );
      if (toggles.length) openSubmenu(toggles[0], toggles);
    });

    dropdowns.forEach(setDropdownHeight);

    return () => {
      // Reset submenu states and row heights on breakpoint exit
      dropdowns.forEach((dropdown) => {
        const toggles = Array.from(
          dropdown.querySelectorAll("[data-submenu-toggle]")
        );
        toggles.forEach((toggle) => {
          const panel = getSubmenuPanel(toggle);
          toggle.dataset.submenuToggle = "False";
          toggle.setAttribute("aria-expanded", "false");
          panel?.setAttribute("aria-hidden", "true");
        });
      });

      dropdowns.forEach(resetDropdownHeight);
    };
  });
}

// Expand the row height to fit the tallest nav menu item
function setDropdownHeight(dropdown) {
  const row = dropdown.querySelector(".nav-dropdown_row");
  if (!row) return;

  const hasSubmenu = row.querySelector(
    "[data-nav-menu-item] [data-submenu-panel]"
  );
  if (!hasSubmenu) return;

  resetDropdownHeight(dropdown);

  const items = Array.from(row.querySelectorAll("[data-nav-menu-item]"));
  if (!items.length) return;

  const maxItemHeight = items.reduce(
    (max, item) => Math.max(max, item.scrollHeight),
    0
  );
  if (maxItemHeight <= row.scrollHeight) return;

  row.style.height = `${pxToRem(maxItemHeight)}rem`;
}

function resetDropdownHeight(dropdown) {
  const row = dropdown.querySelector(".nav-dropdown_row");
  if (row) row.style.height = "";
}

export function resetToFirstSubmenu(dropdown) {
  const toggles = Array.from(
    dropdown.querySelectorAll("[data-submenu-toggle]")
  );
  if (toggles.length) openSubmenu(toggles[0], toggles);
}
