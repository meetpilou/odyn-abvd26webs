# odyn-abvd26webs

A live mirror of an [Odyn](https://app.odyn.dev) project. Synced one-way from Odyn to GitHub on every successful production deploy, so every version of your code is preserved in your own repository.

**Latest version:** v6
**Deployed:** 2026-06-24T09:08:35.857Z

## Layout

- `src/` — current project source. Mirrors what you write in the Odyn editor.
- `dist/v1/` … `dist/v6/` — built artifacts for each deploy. Versions accumulate; nothing here is ever overwritten.
- `dist/latest/` — built artifacts for v6 (the most recent deploy). Overwritten on every deploy; files no longer produced are removed.
- Each deploy commit is tagged `v{n}`.

## One-way mirror

Odyn is the source of truth. Edits made in this repo will **not** sync back to Odyn — they will be overwritten by the next deploy. Clone the repo any time to inspect the project locally, browse version history, or mirror the artifacts to other hosts.

## Serve from jsDelivr (optional)

If this repo is **public** on GitHub, [jsDelivr](https://www.jsdelivr.com/github) will serve any file under `dist/` over a free global CDN. This is in addition to your Odyn-hosted CDN URLs, not a replacement — the URLs in the Odyn dashboard are faster, with proper cache invalidation.

For jsDelivr embeds in production, **always pin to a version tag**. Tagged URLs are immutable and cached forever; branch-path URLs (`@main/dist/latest/...`) are cached for up to 12 hours, so they lag your deploys.

### Pinned to v6 (recommended for jsDelivr — immutable, cached forever)

- `core/barba.js` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v6/dist/v6/core/barba.js
- `features/example.js` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v6/dist/v6/features/example.js
- `features/navigation-dropdowns.js` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v6/dist/v6/features/navigation-dropdowns.js
- `main.js` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v6/dist/v6/main.js
- `chunk-C3YST2EA.js` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v6/dist/v6/chunk-C3YST2EA.js
- `chunk-UNIPIMXR.js` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v6/dist/v6/chunk-UNIPIMXR.js
- `css/variables.css` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v6/dist/v6/css/variables.css
- `css/mast.css` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v6/dist/v6/css/mast.css
- `css/base.css` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v6/dist/v6/css/base.css
- `css/accordions.css` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v6/dist/v6/css/accordions.css
- `css/buttons.css` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v6/dist/v6/css/buttons.css
- `css/cards.css` → https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v6/dist/v6/css/cards.css

…and 17 more under `dist/v6/`.

`dist/latest/` is best used for direct GitHub raw, GitHub Pages, or local checkout — not for jsDelivr-fronted production traffic.

If this repo is private, jsDelivr cannot reach it — keep using your Odyn-hosted CDN URLs.
