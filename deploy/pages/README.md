# Cloudflare UI preview

Live URL: https://aksara-core-preview.pages.dev

This is a disposable, browser-only sample workspace using the real frontend. It is **not** a hosted Rust backend. A build-time flag selects the sample transport; it cannot silently replace an unavailable real host. The regular build excludes the preview module.

```sh
npm ci
npm run build:preview
node tests/preview-browser.mjs
npx wrangler pages deploy apps/platform/dist-preview --project-name aksara-core-preview --branch main
```

Use an authorized Cloudflare CLI session. Do not put account tokens in source, shell command text or the browser bundle. The connected Cloudflare plugin was able to create the project and issue a short-lived Pages asset-upload credential. That credential was used without printing or committing it. Only the compiled public assets and explicit headers/routing/guard were uploaded.

Cloudflare's Git installation rejected the Git-integrated project request (`8000011`). The working project uses **Direct Upload**, so pushing to `main` does not automatically update Pages. Future updates can use authorized Wrangler deployment or CI with an appropriately scoped secret. A Direct Upload project cannot be converted into a Git-integrated project; create a separate Git project after repairing the GitHub installation if that integration is desired. No existing Pages projects, custom domains or billing settings were changed.

`_worker.js` is only an API guard. `/api` and `/api/*` return HTTP 501 with an explicit preview response; the browser demo uses no HTTP API at all. `_routes.json` limits Worker invocation to those API routes. `_headers` sets CSP, no-sniff/frame protections and disables microphone/camera/geolocation. There is no database, inference binding, model download, secret or physical device behind this project.

Twenty-one browser checks passed both against a local static build and the public Pages URL, including independent visitor state, context switching, sample document review with `PREVIEW_ONLY` results, OpenUI rendering, reload reset, no external/API requests, the custody switcher, disconnected onboarding choices, 360 px layout, keyboard menu focus, and the composer at 200% text size. The normal frontend also passed its nineteen real-host browser checks after adding this mode.

For a live backend operational test, see `../test-host/README.md`. The current account rejected Containers with “Workers Paid plan required.” Container-local disk is not suitable as canonical persistent SQLite storage. No paid plan was enabled.

The OpenDuet shell update is deployed at the same public URL. Its deployment
metadata records the source revision. All thirteen preview checks passed against
the public alias after deployment. See the
[UI audit and screenshots](../../docs/platform/ui-audit.md) for source reuse,
Taste v2 installation and documented visual exceptions.
