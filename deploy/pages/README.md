# Cloudflare UI preview

Live URL: https://aksara-core-preview.pages.dev

The preview runs the actual frontend with disposable sample data. It does not connect a Rust backend, model, private files or live messaging account. `/api` requests return an explicit HTTP 501 response. The normal application never silently switches to this sample transport.

This existing Pages project uses **Direct Upload**. A push to GitHub does not update it automatically. Publish the built preview separately, retaining source-commit metadata, the API guard, routing rules and security headers.

```sh
npm ci
npm run build:preview
node tests/preview-browser.mjs
npx wrangler pages deploy apps/platform/dist-preview --project-name aksara-core-preview --branch main
AKSARA_PREVIEW_URL=https://aksara-core-preview.pages.dev node tests/preview-browser.mjs
```

Deployment requires an authorized Cloudflare session. The connected Cloudflare API can issue a short-lived Pages asset-upload credential and create the deployment. Keep credentials out of source, command arguments and output. Upload only compiled public files; no databases, private docs or model credentials belong in the preview.

The browser checks cover Home, Room/Workbench, saved rich documents, private-pane continuity, knowledge scope, drawing/SVG export, both themes, phone navigation and absence of external asset/API requests. Drawing fonts must be configured before editor modules initialize and served at `/excalidraw/fonts/`.

A deployment URL alone does not verify the public alias. Check the deployed commit metadata and run the browser suite against the live URL before reporting it current. Backend testing needs the local or an explicitly authorized hosted installation.
