import { chromium } from "playwright";
import http from "node:http";
import path from "node:path";
import { readFile, stat, mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
import guard from "../deploy/pages/_worker.js";
const dir = path.resolve("apps/platform/dist-preview");
const checks = [];
const mark = (s) => {
  checks.push(s);
  console.log("PASS " + s);
};
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
};
const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api")) {
      const response = await guard.fetch(
        new Request("http://preview.test" + req.url),
        {
          ASSETS: {
            fetch() {
              throw new Error("API must not fall through");
            },
          },
        },
      );
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(await response.text());
      return;
    }
    const requested = new URL(req.url, "http://preview.test").pathname;
    const file = path.resolve(
      dir,
      requested === "/" ? "index.html" : decodeURIComponent(requested.slice(1)),
    );
    if (!file.startsWith(dir + path.sep) || !(await stat(file)).isFile())
      throw 0;
    res.writeHead(200, {
      "content-type": mime[path.extname(file)] || "application/octet-stream",
    });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base =
  process.env.AKSARA_PREVIEW_URL || `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch(
    process.env.AKSARA_PREVIEW_URL && process.env.HTTPS_PROXY
      ? {
          proxy: {
            server: process.env.HTTPS_PROXY,
            bypass: "127.0.0.1,localhost",
          },
        }
      : {},
  );
  const one = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await one.newPage();
  page.setDefaultTimeout(12000);
  const errors = [],
    requests = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => requests.push(r.url()));
  await page.goto(base);
  await page
    .getByRole("heading", { name: "A little clarity, Operator." })
    .waitFor();
  await page.getByText("Interactive UI preview", { exact: true }).waitFor();
  mark("Preview opens on Today and identifies sample data without a backend");
  await page.getByRole("button", { name: /Review.*welcome note/ }).click();
  await page.getByRole("button", { name: "Try sample approval" }).click();
  await page
    .getByRole("button", { name: "Create sample document", exact: true })
    .click();
  await page.getByText(/Preview result: PREVIEW_ONLY/).waitFor();
  await page.getByRole("button", { name: "Close work", exact: true }).click();
  mark("Sample document flow never claims a verified Rust receipt");
  await page.getByRole("button", { name: "Library", exact: true }).click();
  await page
    .getByLabel("Source title", { exact: true })
    .fill("Tab-only sample note");
  await page
    .getByLabel("Source content", { exact: true })
    .fill("PREVIEW_TAB_ONLY_SENTINEL");
  await page.getByRole("button", { name: "Add source", exact: true }).click();
  await page.getByRole("button", { name: /Tab-only sample note/ }).waitFor();
  const second = await browser.newContext();
  const other = await second.newPage();
  await other.goto(base);
  await other
    .getByRole("heading", { name: "A little clarity, Operator." })
    .waitFor();
  await other.getByRole("button", { name: "Library", exact: true }).click();
  assert.equal(
    await other.getByRole("button", { name: /Tab-only sample note/ }).count(),
    0,
  );
  mark("Separate visitors have independent disposable preview data");
  await second.close();
  await page.getByRole("button", { name: "Ask PRIVATE" }).click();
  await page.getByLabel("Message Aksara").fill("Explore a sample next step");
  await page.getByRole("button", { name: "Send message" }).click();
  await page
    .getByRole("heading", { name: "A place for your next step" })
    .waitFor();
  await page.getByText(/guided UI response, not model inference/).waitFor();
  mark("Guided conversation renders an OpenUI card without a model request");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page
    .getByRole("button", { name: "My personal space", exact: true })
    .click();
  await page.getByRole("button", { name: "Library", exact: true }).click();
  await page
    .getByRole("heading", { name: "Make room for what you know." })
    .waitFor();
  mark("Sample personal mode stays separate from the community sample");
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Prepare a test indication" })
      .count(),
    0,
  );
  mark("Hardware and model downloads are disconnected in the preview");
  await page.getByRole("button", { name: /^Today/ }).click();
  await page.getByLabel("Historical date").fill("2001-01-01");
  await page
    .getByRole("heading", { name: "No recorded work for this date" })
    .waitFor();
  mark("Unrecorded history stays empty");
  await page.reload();
  await page
    .getByRole("heading", { name: "A little clarity, Operator." })
    .waitFor();
  await page.getByRole("button", { name: "Library", exact: true }).click();
  assert.equal(
    await page.getByRole("button", { name: /Tab-only sample note/ }).count(),
    0,
  );
  mark("Reload clears preview changes instead of persisting user content");
  await page.getByRole("button", { name: /^Today/ }).click();
  const shots = process.env.AKSARA_PREVIEW_SCREENSHOTS;
  if (shots) {
    await mkdir(shots, { recursive: true });
    await page.screenshot({
      path: path.join(shots, "cloudflare-desktop.png"),
      fullPage: true,
      animations: "disabled",
    });
  }
  await page.setViewportSize({ width: 360, height: 800 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  if (shots)
    await page.screenshot({
      path: path.join(shots, "cloudflare-mobile.png"),
      fullPage: true,
      animations: "disabled",
    });
  mark("Hosted preview is usable at a 360 px viewport");
  assert.deepEqual(errors, []);
  assert.ok(!requests.some((u) => new URL(u).pathname.startsWith("/api/")));
  assert.ok(requests.every((u) => new URL(u).origin === new URL(base).origin));
  mark(
    "No API, model, third-party or local-host requests leave the preview tab",
  );
  const response = await fetch(base + "/api/session");
  assert.equal(response.status, 501);
  assert.equal((await response.json()).preview, true);
  mark("Cloudflare API guard explicitly rejects live-backend requests");
  console.log(JSON.stringify({ preview_checks_passed: checks.length, checks }));
} finally {
  await browser?.close();
  await new Promise((r) => server.close(r));
}
