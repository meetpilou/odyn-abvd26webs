/**
 * -----------------------------------------------------------------
 * utils.js
 * Pure helper functions — no DOM or GSAP dependencies
 * -----------------------------------------------------------------
 */

/**
 * Debounce: delays execution until after `delay` ms of inactivity.
 * @param {function} fn - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {function} The debounced function.
 */

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Debounce that only fires when the viewport *width* has actually changed.
 * Useful for resize handlers that should ignore mobile scroll-bar toggling.
 * @param {function} fn - The function to debounce.
 * @param {number} ms - The delay in milliseconds.
 * @returns {function} The debounced function.
 */

function debounceOnWidthChange(fn, ms) {
  let lastWidth = window.innerWidth;
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        fn.apply(this, args);
      }
    }, ms);
  };
}

/**
 * Promise-based delay.
 * @param {number} ms - milliseconds to wait (default 2000)
 * @returns {Promise<void>} A promise that resolves after the specified delay.
 */

function delay(ms = 2000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Shorthand: returns true if `selector` exists in `scope` (default: document).
 * @param {string} selector - The CSS selector to check for.
 * @param {Element} scope - The DOM element to search within (defaults to document).
 * @returns {boolean} True if the selector exists, false otherwise.
 */

function has(selector, scope = document) {
  return !!scope.querySelector(selector);
}

/**
 * Shuffle array
 * @param {Array<any>} array - The array to shuffle.
 * @returns {Array<any>} A new shuffled array.
 */

function shuffleArray(array) {
  const arr = array.slice(); // clone
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Transform string to kebab case
 * @param {string} str - The input string.
 * @returns {string} The kebab-cased string.
 */


function toKebabCase(str) {
  return str
    .normalize("NFD") // split accents
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/([a-z])([A-Z])/g, "$1-$2") // camelCase → camel-Case
    .replace(/[_\s]+/g, "-") // spaces & underscores → -
    .replace(/[^a-zA-Z0-9-]/g, "") // remove special chars
    .replace(/--+/g, "-") // collapse multiple -
    .toLowerCase()
    .trim();
}

/**
 * Converts a pixel value to a rem value based on the root font size.
 * @param {number} px - The pixel value to convert.
 * @returns {number} The equivalent rem value.
 */
function pxToRem(px) {
  const fs = getComputedStyle(document.documentElement).fontSize;
  return px / parseFloat(fs);
}

/**
 * Shorthand for document.querySelector.
 * @param {string} selector - The CSS selector to query.
 * @param {Element} [context=document] - The context element to query within.
 * @returns {Element | null} The first element matching the selector, or null if not found.
 */
function query(selector, context = document) {
  return context.querySelector(selector);
}

/**
 * Shorthand for document.querySelectorAll, returning an array.
 * @param {string} selector - The CSS selector to query.
 * @param {Element} [context=document] - The context element to query within.
 * @returns {Array<Element>} An array of elements matching the selector.
 */
function queryAll(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

/**
 * Gets the value of a specified attribute from an element.
 * @param {string} selector - The name of the attribute to get.
 * @param {Element} context - The element from which to get the attribute.
 * @returns {string | null} The attribute value, or null if the attribute is not set.
 */
function getAttr(selector, context) {
  return context.getAttribute(selector);
}

/**
 * Sets the value of a specified attribute on an element.
 * @param {string} selector - The name of the attribute to set.
 * @param {string} value - The value to set the attribute to.
 * @param {Element} context - The element on which to set the attribute.
 */
function setAttr(selector, value, context) {
  return context.setAttribute(selector, value);
}

/**
 * Updates the transform-origin CSS property of an element based on scroll position.
 * This function requires GSAP to be available globally.
 * @param {Element} element - The DOM element to update.
 */
function updateTransformOrigin(element) {
  if (!element) return;

  const { height } = element.getBoundingClientRect();
  const vh = window.innerHeight;
  const sy = window.scrollY;
  const min = (vh / height) * 50;
  const max = 100 - min;
  const originY = min + (sy / (height - vh)) * (max - min);
  const clamped = Math.min(Math.max(originY, 0), 100);

  gsap.set(element, { transformOrigin: `50% ${clamped}%` });
}

/**
 * Export methods
 */

export { debounce, debounceOnWidthChange, delay, has, shuffleArray, toKebabCase, pxToRem, query, queryAll, getAttr, setAttr, updateTransformOrigin };
