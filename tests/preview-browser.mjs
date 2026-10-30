import { navigateSurface } from "./surface-navigation.mjs";
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
  await page.getByRole("heading", { name: /Room for/ }).waitFor();
  await page.getByText("Interactive UI preview", { exact: true }).waitFor();
  mark("Preview opens on Today and identifies sample data without a backend");
  assert.ok(
    (await page.locator("#workspace-content").boundingBox()).width > 1000,
  );
  await page.getByRole("button", { name: "Add panel", exact: true }).click();
  await page
    .getByRole("menuitemcheckbox", { name: "Library glance", exact: true })
    .click();
  await page.keyboard.press("Escape");
  assert.equal(await page.locator(".home-library-panel").count(), 0);
  await navigateSurface(page, "Library");
  assert.equal(
    await page.locator(".home-surface").getAttribute("data-compact"),
    "true",
  );
  assert.equal(
    await page.getByLabel("Message Aksara", { exact: true }).count(),
    1,
  );
  await navigateSurface(page, "Home");
  assert.equal(await page.locator(".home-library-panel").count(), 0);
  await page.getByRole("button", { name: "Add panel", exact: true }).click();
  await page
    .getByRole("menuitemcheckbox", { name: "Library glance", exact: true })
    .click();
  await page.keyboard.press("Escape");
  mark(
    "Home contracts without resetting panel choices and keeps exactly one composer",
  );
  await page
    .getByRole("button", { name: "Context: Operator", exact: true })
    .click();
  await page
    .getByRole("menuitem", { name: "Pause background motion", exact: true })
    .click();
  assert.equal(
    await page
      .locator(".ambient-field .smoke-layer-one")
      .evaluate((el) => getComputedStyle(el).animationPlayState),
    "paused",
  );
  mark("Atmosphere can be paused without affecting the workspace");

  await page.getByLabel("Message Aksara").fill("A thought started on Today");
  await page
    .getByRole("button", { name: "Continue our conversation", exact: true })
    .click();
  assert.equal(
    await page.getByLabel("Message Aksara").inputValue(),
    "A thought started on Today",
  );
  await navigateSurface(page, "Home");
  assert.equal(
    await page.getByLabel("Message Aksara").inputValue(),
    "A thought started on Today",
  );
  await page.getByLabel("Message Aksara").fill("");
  mark(
    "Wide Today embeds the composer and keeps its draft when opening the thread",
  );
  await page
    .getByRole("button", { name: "Model & sources", exact: true })
    .click();
  await page.getByText(/^Reference Library sources locally/).click();
  await page.locator(".source-picker input[type=checkbox]").first().check();
  await page
    .getByLabel("Message Aksara")
    .fill("Show my selected sample source");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page
    .getByRole("region", { name: "Latest Home reply" })
    .getByRole("button", { name: "Open conversation", exact: true })
    .click();
  const resource = page.locator(".resource-surface");
  await resource
    .getByRole("heading", { name: "Selected sample sources" })
    .waitFor();
  await resource.getByRole("button").first().click();
  await page.getByRole("dialog").waitFor();
  await page
    .getByRole("button", { name: "Close document", exact: true })
    .click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  mark(
    "A literal OpenUI resource card resolves current data and opens the trusted document view",
  );

  const menu = page.getByRole("button", {
    name: "Open navigation",
    exact: true,
  });
  await page.setViewportSize({ width: 360, height: 800 });
  await menu.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("dialog").waitFor();
  for (let i = 0; i < 18; i++) {
    await page.keyboard.press("Tab");
    await page.waitForFunction(
      () => !!document.activeElement.closest('[role="dialog"]'),
    );
  }
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.ok(await menu.evaluate((el) => el === document.activeElement));
  mark("Menu traps keyboard focus and Escape returns to its opener");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await navigateSurface(page, "Home");
  await page.getByRole("button", { name: /Review.*welcome note/ }).click();
  await page.getByRole("button", { name: "Try sample approval" }).click();
  await page
    .getByRole("button", { name: "Create sample document", exact: true })
    .click();
  await page.getByText(/Preview result: PREVIEW_ONLY/).waitFor();
  await page.getByRole("button", { name: "Close work", exact: true }).click();
  mark("Sample document flow never claims a verified Rust receipt");
  await page.getByRole("button", { name: "Library", exact: true }).click();
  await page.getByRole("button", { name: "Documents", exact: true }).click();
  await page
    .locator(".file-explorer")
    .getByRole("button", { name: /Our first welcome note/ })
    .waitFor();
  assert.equal(
    await page
      .locator(".file-explorer")
      .getByRole("button", { name: /A place for our first steps/ })
      .count(),
    0,
  );
  await page.getByRole("button", { name: "All files", exact: true }).click();
  mark("File explorer separates created documents from original sources");
  await page
    .getByRole("button", { name: "Import source", exact: true })
    .click();
  await page
    .getByLabel("Source title", { exact: true })
    .fill("Tab-only sample note");
  await page
    .getByLabel("Source content", { exact: true })
    .fill("PREVIEW_TAB_ONLY_SENTINEL");
  await page.getByRole("button", { name: "Add source", exact: true }).click();
  await page
    .locator(".file-explorer")
    .getByRole("button", { name: /Tab-only sample note/ })
    .waitFor();
  const second = await browser.newContext();
  const other = await second.newPage();
  await other.goto(base);
  await other.getByRole("heading", { name: /Room for/ }).waitFor();
  await other.getByRole("button", { name: "Library", exact: true }).click();
  assert.equal(
    await other
      .locator(".file-explorer")
      .getByRole("button", { name: /Tab-only sample note/ })
      .count(),
    0,
  );
  mark("Separate visitors have independent disposable preview data");
  await second.close();
  await page.getByRole("button", { name: "Ask PRIVATE" }).click();
  await page.getByLabel("Message Aksara").fill("Explore a sample next step");
  await page.getByRole("button", { name: "Send message" }).click();
  await page
    .getByRole("heading", { name: "A place for your next step" })
    .last()
    .waitFor();
  await page
    .getByText(/guided UI response, not model inference/)
    .last()
    .waitFor();
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
  await navigateSurface(page, "Tools");
  assert.equal(
    await page
      .getByRole("button", { name: "Prepare a test indication" })
      .count(),
    0,
  );
  mark("Hardware and model downloads are disconnected in the preview");
  await page.getByRole("button", { name: /^Home/ }).click();
  await page.getByLabel("Historical date").fill("2001-01-01");
  await page
    .getByRole("heading", { name: "No recorded work for this date" })
    .waitFor();
  mark("Unrecorded history stays empty");
  await page.reload();
  await page.getByRole("heading", { name: /Room for/ }).waitFor();
  await page.getByRole("button", { name: "Library", exact: true }).click();
  assert.equal(
    await page
      .locator(".file-explorer")
      .getByRole("button", { name: /Tab-only sample note/ })
      .count(),
    0,
  );
  mark("Reload clears preview changes instead of persisting user content");
  await page
    .getByRole("button", { name: "Context: Operator", exact: true })
    .click();
  await page
    .getByRole("menuitem", { name: "Personal space", exact: true })
    .click();
  await page
    .locator(".location-name")
    .filter({ hasText: "Personal space" })
    .waitFor();
  await page
    .getByRole("button", { name: "Context: Operator", exact: true })
    .click();
  await page
    .getByRole("menuitem", { name: "Community workspace", exact: true })
    .click();
  await page
    .locator(".location-name")
    .filter({ hasText: "Aksara Commons" })
    .waitFor();
  mark(
    "The workspace switcher changes custody through the same fenced host action",
  );
  await navigateSurface(page, "Settings");
  await page.getByRole("button", { name: /Set up Aksara/ }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page
    .getByRole("group", { name: "Model connection" })
    .getByRole("button", { name: /ChatGPT subscription/ })
    .click();
  assert.ok(
    await page
      .getByRole("button", { name: "Sign in with ChatGPT", exact: true })
      .isDisabled(),
  );
  await page.getByRole("button", { name: "Set up later", exact: true }).click();
  await page
    .getByLabel("Message Aksara")
    .fill("The setup preview kept the guided transport");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page
    .getByRole("region", { name: "Latest Home reply" })
    .getByRole("button", { name: "Open conversation", exact: true })
    .click();
  await page
    .locator(".conversation-scroll")
    .getByText(/guided UI response/)
    .last()
    .waitFor();
  mark(
    "Onboarding can preview provider choices while account and model calls stay disconnected",
  );
  await page.reload();
  await page.getByRole("heading", { name: /Room for/ }).waitFor();
  await page.getByRole("button", { name: /^Home/ }).click();
  await navigateSurface(page, "Home");
  await page
    .getByRole("button", { name: "Expand sidebar", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Open channel Field notes", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Field notes", exact: true })
    .waitFor();
  assert.ok(
    await page
      .getByRole("button", { name: "Collapse sidebar", exact: true })
      .isVisible(),
  );
  assert.ok(
    !(await page.locator(".home-surface").innerText()).includes(
      "A place for our first steps",
    ),
  );
  assert.equal(
    await page.getByLabel("Message Aksara", { exact: true }).count(),
    1,
  );
  await page.getByRole("button", { name: "Ask PRIVATE", exact: true }).click();
  await page
    .getByRole("heading", { name: "Private thread", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Collapse sidebar", exact: true })
    .click();
  await navigateSurface(page, "Home");
  mark(
    "Channel branches retain navigation preference while clearing private Home content",
  );
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
  assert.ok(
    await page
      .getByRole("navigation", { name: "Main navigation", exact: true })
      .isVisible(),
  );
  assert.equal(
    await page
      .getByRole("navigation", { name: "Main navigation", exact: true })
      .getByRole("button", { name: "Ask PRIVATE", exact: true })
      .count(),
    1,
  );
  await navigateSurface(page, "Library");
  await page.getByRole("heading", { name: "Library", exact: true }).waitFor();
  assert.equal(await page.getByRole("dialog").count(), 0);
  mark(
    "Phone dock navigates directly and retains the persistent assistant entry",
  );
  await navigateSurface(page, "Home");
  await page.getByRole("button", { name: "Ask PRIVATE", exact: true }).click();
  await page
    .getByRole("heading", { name: "Private thread", exact: true })
    .waitFor();
  const area = page.getByLabel("Message Aksara", { exact: true });
  await area.fill("A line");
  const short = (await area.boundingBox()).height;
  await area.fill("A line\nAnother line\nA third line");
  assert.ok((await area.boundingBox()).height > short);
  const sendBounds = await page
    .getByRole("button", { name: "Send message", exact: true })
    .boundingBox();
  assert.ok(sendBounds.x >= 0 && sendBounds.x + sendBounds.width <= 360);
  await page.keyboard.press("Escape");
  await page.getByRole("heading", { name: /Room for/ }).waitFor();
  assert.equal(
    await page.getByLabel("Message Aksara").inputValue(),
    "A line\nAnother line\nA third line",
  );
  mark(
    "Blob conversation expands, its multiline composer stays in view, and Escape preserves the draft",
  );
  const slow = await one.newCDPSession(page);
  await slow.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  for (let i = 0; i < 3; i++) {
    await navigateSurface(page, "Home");
    await page
      .getByRole("button", { name: "Ask PRIVATE", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Private thread", exact: true })
      .waitFor();
    await page.keyboard.press("Escape");
    await page.getByRole("heading", { name: /Room for/ }).waitFor();
    await navigateSurface(page, "Settings");
    await page
      .getByRole("heading", { name: "Appearance", exact: true })
      .waitFor();
  }
  await slow.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await slow.detach();
  mark(
    "Interrupted blob/Home animations cannot hide a newer destination under CPU throttling",
  );
  await navigateSurface(page, "Settings");
  const oldAccent = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--green"),
  );
  await page.getByRole("button", { name: "Clay", exact: true }).click();
  await page.waitForFunction(
    (old) =>
      getComputedStyle(document.documentElement).getPropertyValue("--green") !==
      old,
    oldAccent,
  );
  await page.getByText("Simulate time of day", { exact: true }).click();
  await page
    .getByRole("button", { name: "Auto · local time", exact: true })
    .click();
  const hour = page.getByLabel("Atmosphere preview hour");
  await hour.focus();
  await hour.press("Home");
  assert.equal(
    await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    ),
    true,
  );
  const darkPhase = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--atmo-light"),
  );
  for (let i = 0; i < 12; i++) await hour.press("ArrowRight");
  assert.equal(
    await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    ),
    false,
  );
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  assert.equal(
    await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    ),
    true,
  );
  await page
    .getByRole("button", { name: "Auto · local time", exact: true })
    .click();
  assert.equal(
    await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    ),
    false,
  );
  mark(
    "Clock simulation changes Auto day/night appearance while explicit overrides remain effective",
  );
  await hour.press("End");
  await hour.press("ArrowLeft");
  assert.notEqual(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue(
        "--atmo-light",
      ),
    ),
    darkPhase,
  );
  await page
    .getByLabel("Reduce glass & shader effects", { exact: true })
    .check();
  assert.equal(
    await page
      .locator(".work-surface")
      .evaluate((el) => getComputedStyle(el).backdropFilter),
    "none",
  );
  await page.reload();
  await page.getByRole("heading", { name: /Room for/ }).waitFor();
  assert.equal(
    await page.evaluate(() => localStorage.getItem("aksara-palette")),
    "clay",
  );
  assert.equal(await page.locator(".aksara-launcher canvas").count(), 0);
  mark(
    "Palette and reduced effects persist while clock simulation and private drafts remain disposable",
  );

  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  await navigateSurface(page, "Ask PRIVATE");
  await page.getByLabel("Message Aksara").scrollIntoViewIfNeeded();
  const messageBox = await page.getByLabel("Message Aksara").boundingBox();
  assert.ok(messageBox.width > 100);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.evaluate(() => (document.documentElement.style.fontSize = ""));
  mark(
    "At 200% text size the phone composer remains usable without sideways overflow",
  );
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
