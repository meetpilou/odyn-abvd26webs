/**
 * @file navigation.js
 * @summary Initializes unified navigation behavior for desktop and mobile breakpoints.
 * @description Sets up the mobile burger menu, level-1 dropdown toggles, and nested submenu
 * panels. Desktop dropdowns open on hover/click with a short delay when switching between
 * open dropdowns. Mobile dropdowns toggle on click. Submenu panels (level 2) share click
 * and keyboard event handling across both breakpoints. All desktop handlers are tracked and
 * removed on breakpoint change to avoid listener leaks.
 */

import { MEDIAQUERIES } from "../core/config";
import { pxToRem } from "../core/utils";

/* ------------------------------------------------------------------- */
/* Entry point                                                          */
/* ------------------------------------------------------------------- */

/**
 * Bootstraps all navigation behavior. Initializes submenu dropdowns once, then
 * sets up mobile or desktop dropdown behavior based on the current breakpoint.
 * Listens for breakpoint changes to tear down and rebuild as needed.
 */
export function initNavigation() {
  const mqDesktop = window.matchMedia(MEDIAQUERIES.isDesktop);
  const mqTabletDown = window.matchMedia(MEDIAQUERIES.isTablet);

  initNavigationDropdowns();
  setupMobileMenu();

  if (mqTabletDown.matches) setupMobileDropdowns();
  if (mqDesktop.matches) setupDesktopDropdowns();

  mqTabletDown.addEventListener("change", (e) => {
    if (e.matches) {
      teardownDesktopDropdowns();
      setupMobileDropdowns();
    }
  });

  mqDesktop.addEventListener("change", (e) => {
    if (e.matches) {
      teardownMobileDropdowns();
      setupDesktopDropdowns();
    }
  });
}

/* ------------------------------------------------------------------- */
/* Submenu — Init (once, at load)                                       */
/* ------------------------------------------------------------------- */

// Initialize submenu panels for all .nav-dropdown elements in the given scope
function initNavigationDropdowns(scope = document) {
  const dropdowns = Array.from(scope.querySelectorAll(".nav-dropdown"));
  if (!dropdowns.length) return;

  dropdowns.forEach((dropdown) => initSubmenuDropdowns(dropdown));
}

function initSubmenuDropdowns(scope) {
  const toggles = Array.from(scope.querySelectorAll("[data-submenu-toggle]"));
  if (!toggles.length) return;

  setupSubmenuARIA(toggles);
  setDefaultSubmenu(toggles);
  bindSubmenuEvents(toggles);
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

// Close all submenu panels and reset toggles to their default state
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
/* Submenu — Helpers                                                    */
/* ------------------------------------------------------------------- */

function getSubmenuPanel(toggle) {
  const item = toggle.closest(".nav-menu-item");
  if (!item) return null;
  return item.querySelector(".nav-menu-item_dropdown");
}

// Open the active submenu and close all siblings, then recalculate dropdown height
function openSubmenu(activeToggle, toggles) {
  const dropdown = activeToggle.closest(".nav-dropdown");

  toggles.forEach((toggle) => {
    const panel = getSubmenuPanel(toggle);
    if (!panel) return;

    const isActive = toggle === activeToggle;
    toggle.dataset.submenuToggle = isActive ? "True" : "False";
    toggle.setAttribute("aria-expanded", String(isActive));
    panel.setAttribute("aria-hidden", String(!isActive));
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

function resetAllSubmenus(scope = document) {
  const toggles = Array.from(scope.querySelectorAll("[data-submenu-toggle]"));
  toggles.forEach((toggle) => {
    const panel = getSubmenuPanel(toggle);
    toggle.dataset.submenuToggle = "False";
    toggle.setAttribute("aria-expanded", "false");
    panel?.setAttribute("aria-hidden", "true");
  });
}

// Open the first submenu toggle in the dropdown (used as default state on desktop)
function resetToFirstSubmenu(dropdown) {
  const toggles = Array.from(dropdown.querySelectorAll("[data-submenu-toggle]"));
  if (toggles.length) openSubmenu(toggles[0], toggles);
}

/* ------------------------------------------------------------------- */
/* Submenu — Events                                                     */
/* ------------------------------------------------------------------- */

// Bind click and keyboard events — shared across mobile and desktop breakpoints
function bindSubmenuEvents(toggles) {
  const mqDesktop = window.matchMedia("(min-width: 992px)");

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const isActive = toggle.dataset.submenuToggle === "True";

      // Mobile: toggle open/closed; desktop: always open exclusively
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

// Expand the dropdown row height to fit the tallest submenu panel
function setDropdownHeight(dropdown) {
  const row = dropdown.querySelector(".nav-dropdown_row");
  if (!row) return;

  const hasSubmenu = row.querySelector("[data-nav-menu-item] [data-submenu-panel]");
  if (!hasSubmenu) return;

  resetDropdownHeight(dropdown);

  const items = Array.from(row.querySelectorAll("[data-nav-menu-item]"));
  if (!items.length) return;

  const maxItemHeight = items.reduce((max, item) => Math.max(max, item.scrollHeight), 0);
  if (maxItemHeight <= row.scrollHeight) return;

  row.style.height = `${pxToRem(maxItemHeight)}rem`;
}

function resetDropdownHeight(dropdown) {
  const row = dropdown.querySelector(".nav-dropdown_row");
  if (row) row.style.height = "";
}

function initDropdownHeights() {
  Array.from(document.querySelectorAll(".nav-dropdown")).forEach(setDropdownHeight);
}

function clearDropdownHeights() {
  Array.from(document.querySelectorAll(".nav-dropdown")).forEach(resetDropdownHeight);
}

/* ------------------------------------------------------------------- */
/* Global dropdown state                                                */
/* ------------------------------------------------------------------- */

function setDropdownState(state) {
  document.body.dataset.dropdownState = state;
}

function updateDropdownState() {
  const toggles = gsap.utils.toArray("[data-dropdown-toggle]");
  const hasOpen = toggles.some((t) => t.dataset.dropdownToggle === "True");
  setDropdownState(hasOpen ? "open" : "closed");
}

// Close all level-1 dropdowns, optionally skipping one
function closeAllDropdowns(except = null) {
  const toggles = gsap.utils.toArray("[data-dropdown-toggle]");

  toggles.forEach((toggle) => {
    if (toggle === except) return;

    const dropdown = toggle.nextElementSibling;
    toggle.dataset.dropdownToggle = "False";
    toggle.setAttribute("aria-expanded", "false");
    if (dropdown) dropdown.setAttribute("aria-hidden", "true");
  });

  updateDropdownState();
}

/* ------------------------------------------------------------------- */
/* Mobile menu — Burger                                                 */
/* ------------------------------------------------------------------- */

// Set up the burger button — initialized once and never torn down
function setupMobileMenu() {
  const btn = document.querySelector("[data-menu-button]");
  const nav = document.querySelector("[data-menu-status]");
  if (!btn || !nav) return;

  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-controls", "mobile-navigation");
  nav.setAttribute("id", "mobile-navigation");
  nav.setAttribute("role", "navigation");
  nav.setAttribute("aria-label", "Main navigation");

  btn.addEventListener("click", () => {
    const isOpen = nav.dataset.menuStatus === "open";
    if (isOpen) {
      closeMobileMenu();
      closeAllDropdowns();
    } else {
      nav.dataset.menuStatus = "open";
      btn.setAttribute("aria-expanded", "true");
    }
  });
}

function closeMobileMenu() {
  const nav = document.querySelector("[data-menu-status]");
  const btn = document.querySelector("[data-menu-button]");
  if (nav) nav.dataset.menuStatus = "closed";
  if (btn) btn.setAttribute("aria-expanded", "false");
}

/* ------------------------------------------------------------------- */
/* Mobile dropdowns — Level 1                                          */
/* ------------------------------------------------------------------- */

function setupMobileDropdowns() {
  const toggles = gsap.utils.toArray("[data-dropdown-toggle]");

  toggles.forEach((toggle, i) => {
    const dropdown = toggle.nextElementSibling;
    if (!dropdown?.classList.contains("nav-dropdown")) return;

    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-haspopup", "true");
    toggle.setAttribute("aria-controls", `mobile-dropdown-${i}`);
    dropdown.setAttribute("id", `mobile-dropdown-${i}`);
    dropdown.setAttribute("role", "menu");

    const handler = () => {
      const open = toggle.dataset.dropdownToggle === "True";

      toggles.forEach((other) => {
        if (other !== toggle) {
          other.dataset.dropdownToggle = "False";
          other.setAttribute("aria-expanded", "false");
        }
      });

      toggle.dataset.dropdownToggle = open ? "False" : "True";
      toggle.setAttribute("aria-expanded", String(!open));
      updateDropdownState();
    };

    toggle._mobileHandler = handler;
    toggle.addEventListener("click", handler);
  });

  // Close menu and all dropdowns when a link inside a dropdown is clicked
  const dropdownLinks = gsap.utils.toArray(".nav-dropdown a");
  dropdownLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeAllDropdowns();
      closeMobileMenu();
    });
  });
}

function teardownMobileDropdowns() {
  const toggles = gsap.utils.toArray("[data-dropdown-toggle]");

  toggles.forEach((toggle) => {
    if (!toggle._mobileHandler) return;
    toggle.removeEventListener("click", toggle._mobileHandler);
    delete toggle._mobileHandler;
  });

  closeAllDropdowns();
}

/* ------------------------------------------------------------------- */
/* Desktop dropdowns — Level 1                                         */
/* ------------------------------------------------------------------- */

function setupDesktopDropdowns() {
  const toggles = gsap.utils.toArray("[data-dropdown-toggle]");
  const navlinks = gsap.utils.toArray(".nav-link:not([data-dropdown-toggle])");

  toggles.forEach((toggle, i) => {
    const dropdown = toggle.nextElementSibling;
    if (!dropdown?.classList.contains("nav-dropdown")) return;

    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-haspopup", "true");
    toggle.setAttribute("aria-controls", `desktop-dropdown-${i}`);
    dropdown.setAttribute("id", `desktop-dropdown-${i}`);
    dropdown.setAttribute("role", "menu");
    dropdown.setAttribute("aria-hidden", "true");

    const onMouseEnter = () => openDesktopDropdown(toggle, dropdown, toggles);
    const onMouseLeave = () => closeDesktopDropdown(toggle, dropdown);
    const onClick = (e) => {
      e.preventDefault();
      openDesktopDropdown(toggle, dropdown, toggles);
    };

    const parent = toggle.closest(".nav-center_item");

    toggle.addEventListener("mouseenter", onMouseEnter);
    toggle.addEventListener("click", onClick);
    parent?.addEventListener("mouseleave", onMouseLeave);

    toggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle.click();
      }
      if (e.key === "Escape") {
        closeDesktopDropdown(toggle, dropdown);
        toggle.focus();
      }
    });

    toggle._desktopHandlers = { onMouseEnter, onMouseLeave, onClick, parent };
  });

  // Close all dropdowns when hovering a plain nav link
  navlinks.forEach((link) => {
    const handler = () => closeAllDropdowns();
    link._navlinkHandler = handler;
    link.addEventListener("mouseenter", handler);
  });

  // Close all dropdowns when a link inside a dropdown is clicked
  const dropdownLinks = gsap.utils.toArray(".nav-dropdown a");
  dropdownLinks.forEach((link) => {
    const handler = () => closeAllDropdowns();
    link._dropdownLinkHandler = handler;
    link.addEventListener("click", handler);
  });

  // Close all dropdowns on outside click
  const onOutsideClick = (e) => {
    const inside = toggles.some((toggle) => {
      const dropdown = toggle.nextElementSibling;
      return toggle.contains(e.target) || dropdown?.contains(e.target);
    });
    if (!inside) closeAllDropdowns();
  };

  document._desktopOutsideClick = onOutsideClick;
  document.addEventListener("click", onOutsideClick);

  // Open first submenus and set heights on init
  Array.from(document.querySelectorAll(".nav-dropdown")).forEach((dropdown) => {
    resetToFirstSubmenu(dropdown);
  });
  initDropdownHeights();

  updateDropdownState();
}

function teardownDesktopDropdowns() {
  const toggles = gsap.utils.toArray("[data-dropdown-toggle]");
  const navlinks = gsap.utils.toArray(".nav-link:not([data-dropdown-toggle])");

  toggles.forEach((toggle) => {
    if (!toggle._desktopHandlers) return;

    const { onMouseEnter, onMouseLeave, onClick, parent } = toggle._desktopHandlers;
    toggle.removeEventListener("mouseenter", onMouseEnter);
    toggle.removeEventListener("click", onClick);
    parent?.removeEventListener("mouseleave", onMouseLeave);

    delete toggle._desktopHandlers;
  });

  navlinks.forEach((link) => {
    if (!link._navlinkHandler) return;
    link.removeEventListener("mouseenter", link._navlinkHandler);
    delete link._navlinkHandler;
  });

  // Clean up dropdown link handlers
  const dropdownLinks = gsap.utils.toArray(".nav-dropdown a");
  dropdownLinks.forEach((link) => {
    if (!link._dropdownLinkHandler) return;
    link.removeEventListener("click", link._dropdownLinkHandler);
    delete link._dropdownLinkHandler;
  });

  if (document._desktopOutsideClick) {
    document.removeEventListener("click", document._desktopOutsideClick);
    delete document._desktopOutsideClick;
  }

  resetAllSubmenus();
  clearDropdownHeights();
  closeAllDropdowns();
}

/* ------------------------------------------------------------------- */
/* Desktop dropdown — State                                             */
/* ------------------------------------------------------------------- */

// Delay opening slightly when another dropdown is already open to avoid flicker
function openDesktopDropdown(toggle, dropdown, toggles) {
  if (toggle.dataset.dropdownToggle === "True") return;

  const anyOpen = toggles.some((t) => t.dataset.dropdownToggle === "True");
  closeAllDropdowns(toggle);

  setTimeout(
    () => {
      resetToFirstSubmenu(dropdown);

      toggle.dataset.dropdownToggle = "True";
      toggle.setAttribute("aria-expanded", "true");
      dropdown.setAttribute("aria-hidden", "false");

      updateDropdownState();
    },
    anyOpen ? 20 : 0
  );
}

function closeDesktopDropdown(toggle, dropdown) {
  toggle.dataset.dropdownToggle = "False";
  toggle.setAttribute("aria-expanded", "false");
  dropdown.setAttribute("aria-hidden", "true");

  updateDropdownState();
}