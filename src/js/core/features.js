import { has } from "./utils";

import { initAccordions } from "../features/accordions";
import { initScrollReveal } from "../features/scroll-reveal";
import { initBackButtons } from "../features/back-buttons";
import { initClientsList } from "../features/clients-list";
import { initCoverIntro } from "../features/cover-intro";
import { initCurrentYear } from "../features/current-year";
import { initFilters } from "../features/filters";
import { initFooterParallax } from "../features/footer-parallax";
import { initFormValidation } from "../features/form-validation";
import { initGlobalParallax } from "../features/global-parallax";
import { initGoogleMaps } from "../features/google-maps";
import { initGsapSliders } from "../features/gsap-sliders";
import { initHeroIntro } from "../features/hero-intro";
import { initHeroParallax } from "../features/hero-parallax";
import { initHighlightText } from "../features/highlight-text";
import { initHoverList } from "../features/hover-list";
import { initHighlightTextMarker } from "../features/highlight-text-marker";
import { initMagneticCursor } from "../features/magnetic-cursor";
import { initImageCycle } from "../features/image-cycle";
import { initMarquees } from "../features/marquees";
import { initNavigation } from "../features/navigation";
import { initNavigationTheme } from "../features/navigation-theme";
import { initPrepareRotatingText } from "../features/rotating-text";
import { initRotatingText } from "../features/rotating-text";
import { initScrollRevealMedia } from "../features/scroll-reveal-media";
import { initSocialShare } from "../features/social-share";
import { initStackCards } from "../features/stack-cards";
import { initStackCases } from "../features/stack-cases";
import { initThemeBend } from "../features/theme-bend";
import { initTestimonials } from "../features/testimonials";
import { initVideoBackground } from "../features/video-background";
import { initBunnyPlayer } from "../features/video-player";

function initFeatures(items, scope) {
  Object.keys(items).forEach((key) => {
    if (has(key, scope)) {
      const fns = Array.isArray(items[key]) ? items[key] : [items[key]];
      fns.forEach((fn) => fn(scope));
    }
  });
}

export function once() {
  initNavigation();
}

export function beforeEnter(scope) {
  initFeatures(
    {
      "[data-image-cycle]": initImageCycle,
      "[data-cover-intro]": initCoverIntro,
      ".hero": initHeroIntro,
      "[data-parallax='trigger']": initGlobalParallax,
      "[data-hero-parallax]": initHeroParallax,
      "[data-footer-parallax]": initFooterParallax,
      "[data-accordions-init]": initAccordions,
      "[data-button-back]": initBackButtons,
      "[data-clients-list-init]": initClientsList,
      "[data-current-year]": initCurrentYear,
      "[data-filter-group]": initFilters,

      "[data-form-validate]": initFormValidation,
      "[data-addresses-init]": initGoogleMaps,
      "[data-gsap-slider-init]": initGsapSliders,
      "[data-highlight-text='True']": initHighlightText,
      "[data-hover-list-wrap]": initHoverList,
      "[data-highlight-text-marker='True']": initHighlightTextMarker,
      "[data-magnetic-cursor-target]": initMagneticCursor,
      "[data-marquee-scroll-direction-target]": initMarquees,
      "[data-wf--sections-wrapper--variants-theme]": initNavigationTheme,
      "[data-rotating-title]": [initPrepareRotatingText, initRotatingText],
      "[data-social-share]": initSocialShare,
      "[data-stack-cards]": initStackCards,
      "[data-stack-cases]": initStackCases,
      "[data-testimonial-wrap]": initTestimonials,
      "[data-theme-bend]": initThemeBend,
      "[data-bunny-player-init]": initBunnyPlayer,
      "[data-video-background]": initVideoBackground,

      "[data-reveal-group]": initScrollReveal,
      "[data-reveal-media]": initScrollRevealMedia,
    },
    scope
  );
}

export function onResize(scope) {
  initFeatures(
    {
      /* ".hero": initHeroIntro,
      "[data-parallax='trigger']": initGlobalParallax,
      "[data-hero-parallax]": initHeroParallax,
      //"[data-footer-parallax]": initFooterParallax,
      "[data-highlight-text='True']": initHighlightText,
      "[data-highlight-text-marker='True']": initHighlightTextMarker,
      "[data-marquee-scroll-direction-target]": initMarquees,
      "[data-wf--sections-wrapper--variants-theme]": initNavigationTheme,
      "[data-stack-cards]": initStackCards,
      "[data-stack-cases]": initStackCases,
      "[data-testimonial-wrap]": initTestimonials,
      "[data-reveal-group]": initScrollReveal,
      "[data-reveal-media]": initScrollRevealMedia,
      */
    },
    scope
  );
}

export function afterEnter(scope) {
  initFeatures({}, scope);
}
