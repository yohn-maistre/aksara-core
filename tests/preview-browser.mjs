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
  await one.addInitScript(()=>localStorage.setItem("aksara-theme","dark"));
  const page = await one.newPage();
  page.setDefaultTimeout(12000);
  const errors = [],
    requests = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => requests.push(r.url()));
  await page.goto(base);
  await page
    .getByRole("heading", { name: "Work, taking shape.", exact: true })
    .waitFor();
  assert.equal(
    await page.evaluate(() => localStorage.getItem("aksara-palette")),
    "clay",
  );
  assert.equal(
    await page
      .getByRole("button", { name: "Ask PRIVATE", exact: true })
      .count(),
    0,
  );
  await mkdir(".impeccable/review", { recursive: true });
  const shot = async (name) =>
    page.screenshot({
      path: ".impeccable/review/" + name + ".png",
      animations: "disabled",
      fullPage: true,
    });
  await shot("desktop");
  mark("Visual Home shows accessible saved artifacts and actual work states");
  await page
    .getByRole("button", { name: "Collapse sidebar", exact: true })
    .click();
  await page.waitForTimeout(300);
  const left = await page
    .locator(".reading-nav")
    .evaluate((e) => e.getBoundingClientRect().left);
  await page
    .getByRole("button", { name: "Expand sidebar", exact: true })
    .click();
  await page.waitForTimeout(300);
  assert.equal(
    await page
      .locator(".reading-nav")
      .evaluate((e) => e.getBoundingClientRect().left),
    left,
  );
  mark("Sidebar collapse keeps its left border fixed");
  await page
    .getByRole("button", { name: "Open channel Common room", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Common room", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Workbench", exact: true }).click();
  await page.getByLabel("Document content", { exact: true }).waitFor();
  await page
    .getByLabel("Document title", { exact: true })
    .fill("Shared water plan");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.getByText("Saved", { exact: true }).first().waitFor();
  await shot("workbench");
  await page.getByRole("button", { name: "Room", exact: true }).click();
  await page
    .locator(".conversation-scroll")
    .getByText(/Welcome to a sample shared conversation/)
    .waitFor();
  await shot("room");
  mark("Room and Workbench preserve the channel and saved rich document");
  await page
    .getByRole("button", { name: "Open private Aksara", exact: true })
    .first()
    .click();
  const pane = page.locator("#private-aksara");
  await pane
    .getByLabel("Message Aksara", { exact: true })
    .fill("A private thought");
  await page
    .getByRole("button", { name: "Library", exact: true })
    .first()
    .click();
  assert.equal(
    await pane.getByLabel("Message Aksara", { exact: true }).inputValue(),
    "A private thought",
  );
  await page.getByRole("heading",{name:"Library",exact:true}).waitFor();
  await shot("private");
  await pane
    .getByRole("button", { name: "Expand private thread", exact: true })
    .click();
  assert.equal(await pane.getAttribute("data-full"), "true");
  await pane
    .getByRole("button", {
      name: "Return to compact private pane",
      exact: true,
    })
    .click();
  await pane
    .getByRole("button", { name: "Close private conversation", exact: true })
    .click();
  await page.getByRole("heading", { name: "Library", exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Open private Aksara", exact: true })
    .first()
    .click();
  assert.equal(
    await pane.getByLabel("Message Aksara", { exact: true }).inputValue(),
    "A private thought",
  );
  assert.ok(!(await pane.innerText()).includes("Shared water plan"));
  await pane.getByRole("button", { name: "Send message", exact: true }).click();
  await pane
    .getByText(/guided UI response/)
    .first()
    .waitFor();
  await pane
    .getByRole("button", { name: "Close private conversation", exact: true })
    .click();
  mark(
    "Private pane preserves drafts across screens and excludes shared-thread content",
  );
  await page.getByRole("button", { name: "Knowledge", exact: true }).click();
  await page
    .getByRole("heading", {
      name: "Useful knowledge starts with a source.",
      exact: true,
    })
    .waitFor();
  assert.ok(
    !(await page.locator(".memory-view").innerText()).includes(
      "Aksara brings people, knowledge and work into one living workspace.",
    ),
  );
  await shot("knowledge");
  mark(
    "Knowledge view labels source-backed review status and disconnected preview",
  );
  await page
    .getByRole("button", { name: "Files & documents", exact: true })
    .click();
  await page.getByRole("button", { name: "New drawing", exact: true }).click();
  await page.locator(".excalidraw canvas").first().waitFor();
  await page.getByLabel("Drawing title").fill("Water point diagram");
  const rectangle = page.getByLabel("Rectangle", { exact: true });
  await rectangle.locator("..").click();
  const canvas = await page.locator(".excalidraw canvas").first().boundingBox();
  await page.mouse.move(canvas.x + 120, canvas.y + 160);
  await page.mouse.down();
  await page.mouse.move(canvas.x + 340, canvas.y + 280, { steps: 5 });
  await page.mouse.up();
  await page.getByRole("button", { name: "Save drawing", exact: true }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export SVG", exact: true }).click();
  assert.ok((await download).suggestedFilename().endsWith(".svg"));
  await shot("drawing");
  await page
    .locator(".document-topbar")
    .getByRole("button", { name: "Library", exact: true })
    .click();
  await page.getByRole("button", { name: /Water point diagram/ }).waitFor();
  mark(
    "Vector drawings save to the Library and export SVG without a third-party font request",
  );
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Appearance", exact: true }).click();
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await shot("settings-light");
  await page.getByRole("button",{name:"Library",exact:true}).first().click();
  await page.getByRole("button",{name:/Water point diagram/}).click();
  await page.locator(".excalidraw canvas").first().waitFor();
  await shot("drawing-light");
  const drawingColor=await page.locator(".excalidraw").first().evaluate(el=>({primary:getComputedStyle(el).getPropertyValue("--color-primary"),selection:getComputedStyle(el).getPropertyValue("--color-surface-primary-container"),accent:getComputedStyle(el).getPropertyValue("--green"),soft:getComputedStyle(el).getPropertyValue("--duet-accent-soft")}));
  assert.equal(drawingColor.primary.trim(),drawingColor.accent.trim());assert.equal(drawingColor.selection.trim(),drawingColor.soft.trim());
  await page.getByRole("button",{name:"Settings",exact:true}).click();await page.getByRole("button",{name:"Appearance",exact:true}).click();
  await page.getByRole("button", { name: "Sage", exact: true }).click();
  await page.getByRole("button", { name: "Clay", exact: true }).click();
  assert.equal(
    await page.evaluate(() => localStorage.getItem("aksara-palette")),
    "clay",
  );
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await shot("settings");
  mark("Twenty selection controls, palettes and both themes are usable");
  await page.getByRole("button", { name: /Set up Aksara/ }).click();
  await page.getByRole("dialog").waitFor();
  await shot("setup");
  await page
    .getByRole("button", { name: "Explore first", exact: true })
    .click();
  await page.getByRole("button", { name: "Capabilities", exact: true }).click();
  await shot("capabilities");
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(250);
  await shot("mobile");
  await page
    .getByRole("button", { name: "Open private Aksara", exact: true })
    .click();
  await pane.getByLabel("Message Aksara", { exact: true }).waitFor();
  assert.equal(await page.locator(".mobile-dock").count(), 0);
  await shot("private-mobile");
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await pane
    .getByRole("button", { name: "Close private conversation", exact: true })
    .click();
  await page.getByRole("button", { name: "Spaces", exact: true }).click();
  await page
    .locator(".spaces-menu")
    .getByRole("button", { name: "Channels", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Open channel", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Room", exact: true }).click();
  await shot("room-mobile");
  assert.equal(await page.locator(".mobile-dock").count(), 0);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  mark(
    "Phone conversations have a single compact composer without a competing bottom dock",
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(
    requests.filter(
      (url) =>
        !url.startsWith(base) &&
        !url.startsWith("blob:") &&
        !url.startsWith("data:"),
    ),
    [],
  );
  console.log(JSON.stringify({ preview_checks_passed: checks.length, checks }));
} finally {
  await browser?.close();
  await new Promise((r) => server.close(r));
}
