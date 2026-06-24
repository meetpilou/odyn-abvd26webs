/**
 * @file navigation-theme.js
 * @summary Switches the navigation theme as themed sections scroll past the nav bar.
 * @description For each [data-wf--sections-wrapper--variants-theme] element, creates a
 * ScrollTrigger that applies the element's theme to the nav on enter and reverts
 * to the previous element's theme on scroll back. Light and medium sections → nav dark.
 * Dark sections → nav light.
 */

/**
 * Finds all [data-wf--sections-wrapper--variants-theme] elements within the given scope
 * and sets up ScrollTriggers to switch the .nav [data-theme-nav] as each element crosses
 * the bottom edge of the navigation bar.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */

export function initNavigationTheme(scope = document) {
  const nav = document.querySelector(".nav");
  if (!nav) return;

  const elements = scope.querySelectorAll(
    "[data-wf--sections-wrapper--variants-theme]"
  );

  if (!elements.length) return;

  // light or medium section → nav needs to be dark to stay visible, and vice versa
  function getNavTheme(sectionTheme) {
    if (sectionTheme !== null) {
      return sectionTheme === "dark" ? "light" : "dark";
    }
    return null;
  }

  function applyTheme(sectionTheme) {
    const navTheme = getNavTheme(sectionTheme)
    if (navTheme !== null && sectionTheme !== null) {
      nav.setAttribute("data-theme-nav", getNavTheme(sectionTheme));  
    }    
  }

  elements.forEach((element) => {
    const theme = element.getAttribute(
      "data-wf--sections-wrapper--variants-theme"
    );

    function getPrevTheme() {
      const sections = Array.from(elements);
      const idx = sections.indexOf(element);
      if (idx <= 0) return null;
      return sections[idx - 1].getAttribute(
        "data-wf--sections-wrapper--variants-theme"
      );
    }

    ScrollTrigger.create({
      trigger: element,
      start: () => `top ${nav.offsetHeight}px`,
      end: () => `bottom ${nav.offsetHeight}px`,
      onEnter: () => {
        
        applyTheme(theme);
      },
      onLeaveBack: () => applyTheme(getPrevTheme()),
    });
  });
}
