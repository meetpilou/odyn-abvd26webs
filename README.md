# odyn-abvd26webs

A live mirror of an [Odyn](https://app.odyn.dev) project. Synced one-way from Odyn to GitHub on every successful production deploy, so every version of your code is preserved in your own repository.

**Latest version:** v5
**Deployed:** 2026-06-24T09:02:37.175Z

## Layout

- `src/` — current project source. Mirrors what you write in the Odyn editor.
- `dist/v1/` … `dist/v5/` — built artifacts for each deploy. Versions accumulate; nothing here is ever overwritten.
- `dist/latest/` — built artifacts for v5 (the most recent deploy). Overwritten on every deploy; files no longer produced are removed.
- Each deploy commit is tagged `v{n}`.

## One-way mirror

Odyn is the source of truth. Edits made in this repo will **not** sync back to Odyn — they will be overwritten by the next deploy. Clone the repo any time to inspect the project locally, browse version history, or mirror the artifacts to other hosts.

## Serve from jsDelivr (optional)

If this repo is **public** on GitHub, [jsDelivr](https://www.jsdelivr.com/github) will serve any file under `dist/` over a free global CDN. This is in addition to your Odyn-hosted CDN URLs, not a replacement — the URLs in the Odyn dashboard are faster, with proper cache invalidation.

For jsDelivr embeds in production, **always pin to a version tag**. Tagged URLs are immutable and cached forever; branch-path URLs (`@main/dist/latest/...`) are cached for up to 12 hours, so they lag your deploys.

### Pinned to v5 (recommended for jsDelivr — immutable, cached forever)

- `core/barba.js` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v5/dist/v5/core/barba.js
- `features/example.js` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v5/dist/v5/features/example.js
- `features/navigation-dropdowns.js` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v5/dist/v5/features/navigation-dropdowns.js
- `main.js` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v5/dist/v5/main.js
- `chunk-C3YST2EA.js` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v5/dist/v5/chunk-C3YST2EA.js
- `chunk-UNIPIMXR.js` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v5/dist/v5/chunk-UNIPIMXR.js
- `css/variables.css` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v5/dist/v5/css/variables.css
- `css/mast.css` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v5/dist/v5/css/mast.css
- `css/base.css` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v5/dist/v5/css/base.css
- `css/accordions.css` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v5/dist/v5/css/accordions.css
- `css/buttons.css` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v5/dist/v5/css/buttons.css
- `css/cards.css` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v5/dist/v5/css/cards.css

…and 17 more under `dist/v5/`.

`dist/latest/` is best used for direct GitHub raw, GitHub Pages, or local checkout — not for jsDelivr-fronted production traffic.

If this repo is private, jsDelivr cannot reach it — keep using your Odyn-hosted CDN URLs.
