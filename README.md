# odyn-abvd26webs

A live mirror of an [Odyn](https://app.odyn.dev) project. Synced one-way from Odyn to GitHub on every successful production deploy, so every version of your code is preserved in your own repository.

Once the first production deploy lands, this README will list each version's artifacts and ready-to-paste jsDelivr URLs.

## Layout

- `src/` — current project source. Mirrors what you write in the Odyn editor.
- `dist/v{n}/` — built artifacts for each production deploy. Each new deploy adds a new folder; nothing here is ever overwritten.
- `dist/latest/` — built artifacts for the most recent production deploy. Overwritten on every deploy; files no longer produced are removed.
- Each deploy commit is tagged `v{n}`.

## One-way mirror

Odyn is the source of truth. Edits made in this repo will **not** sync back to Odyn — they will be overwritten by the next deploy. Clone the repo any time to inspect the project locally, browse version history, or mirror the artifacts to other hosts.

## Serve from jsDelivr (optional)

If this repo is **public** on GitHub, [jsDelivr](https://www.jsdelivr.com/github) will serve any file under `dist/` over a free global CDN. This is in addition to your Odyn-hosted CDN URLs, not a replacement — the URLs in the Odyn dashboard are faster, with proper cache invalidation.

For jsDelivr embeds in production, **always pin to a version tag**:

```
https://cdn.jsdelivr.net/gh/meetpilou/odyn-abvd26webs@v{n}/dist/v{n}/{filename}
```

Tagged URLs are immutable and cached forever. Branch-path URLs (`@main/dist/latest/...`) are cached by jsDelivr for up to 12 hours, so they will lag your deploys — `dist/latest/` is best used for direct GitHub raw, GitHub Pages, or local checkout, not for jsDelivr-fronted production traffic.

If this repo is private, jsDelivr cannot reach it — keep using your Odyn-hosted CDN URLs.
