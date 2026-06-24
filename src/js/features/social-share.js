/**
 * @file social-share.js
 * @summary Handles social sharing actions triggered by [data-social-share] containers.
 * @description Delegates click events on [data-social-share-type] buttons to open
 * platform-specific share URLs in a new tab, or copy the current page URL to the
 * clipboard. Supports X, LinkedIn, Reddit, Telegram, WhatsApp, Facebook, Pinterest,
 * and email. Guards against double-binding across re-renders.
 */

/**
 * Initializes social share click handlers on all [data-social-share] containers.
 * Uses event delegation so dynamically inserted share buttons are handled automatically.
 * On clipboard copy, briefly sets [data-social-share-success] on the button for CSS feedback.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */
export function initSocialShare(scope = document) {
  const elements = scope.querySelectorAll("[data-social-share]");
  if (!elements.length) return;

  elements.forEach((el) => {
    // Prevent duplicate listeners across multiple init calls
    if (el._socialShareBound) return;
    el._socialShareBound = true;

    // Resolve share metadata from attributes, falling back to current page values
    const link = el.getAttribute("data-social-share-link") || location.href;
    const title = el.getAttribute("data-social-share-title") || document.title;

    el.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-social-share-type]");
      if (!btn) return;
      e.preventDefault();

      const type = btn.getAttribute("data-social-share-type");
      const u = encodeURIComponent(link);
      const t = encodeURIComponent(title);

      // Map each platform identifier to its share URL template
      const map = {
        x: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
        reddit: `https://www.reddit.com/submit?url=${u}&title=${t}`,
        telegram: `https://t.me/share/url?url=${u}&text=${t}`,
        whatsapp: `https://api.whatsapp.com/send?text=${t}%20${u}`,
        mail: `mailto:?subject=${t}&body=${t}%0A%0A${u}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
        pinterest: `https://www.pinterest.com/pin/create/button/?url=${u}&description=${t}`,
      };

      // Clipboard branch: copy link and trigger a transient success state on the button
      if (type === "clipboard") {
        navigator.clipboard.writeText(link).then(() => {
          btn.setAttribute("data-social-share-success", "");
          setTimeout(
            () => btn.removeAttribute("data-social-share-success"),
            2000
          );
        });
        return;
      }

      // Open the resolved share URL in a secure new tab
      const url = map[type];
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    });
  });
}
