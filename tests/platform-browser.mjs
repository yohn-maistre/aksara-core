import { navigateSurface } from "./surface-navigation.mjs";
/** Real product browser conformance. Synthetic inference uses the actual Mastra
 * adapter over a local OpenAI-compatible fixture; no hosted provider is contacted. */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdtemp, rm, readFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import http from "node:http";
import assert from "node:assert/strict";
const dir = await mkdtemp(path.join(tmpdir(), "aksara-product-browser-"));
const base = "http://127.0.0.1:17841";
const checks = [];
const model = http.createServer(async (req, res) => {
  if (req.url === "/api/tags") {
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({ models: [{ name: "fixture-local", size: 1234 }] }),
    );
    return;
  }
  if (req.url === "/tts") {
    for await (const chunk of req) {
    }
    const b = Buffer.alloc(4844);
    b.write("RIFF");
    b.writeUInt32LE(4800036, 4);
    b.write("WAVEfmt ", 8);
    b.writeUInt32LE(16, 16);
    b.writeUInt16LE(1, 20);
    b.writeUInt16LE(1, 22);
    b.writeUInt32LE(24000, 24);
    b.writeUInt32LE(48000, 28);
    b.writeUInt16LE(2, 32);
    b.writeUInt16LE(16, 34);
    b.write("data", 36);
    b.writeUInt32LE(4800000, 40);
    res.end(b);
    return;
  }
  let data = "";
  for await (const part of req) data += part;
  const body = JSON.parse(data || "{}");
  assert.ok(!body.tools?.length);
  res.setHeader("content-type", "application/json");
  res.end(
    JSON.stringify({
      id: "synthetic",
      object: "chat.completion",
      created: 1,
      model: "fixture-local",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content:
              'A synthetic finding, based on the selected context.\n\n```openui\nroot = EvidenceCard("Fixture finding", "A registered card, with no executable actions.")\n```',
          },
          finish_reason: "stop",
        },
      ],
      usage: { prompt_tokens: 20, completion_tokens: 20, total_tokens: 40 },
    }),
  );
});
await new Promise((r) => model.listen(17860, "127.0.0.1", r));
const host = spawn(
  "python3",
  [
    "scripts/start_platform.py",
    "--state",
    dir,
    "--port",
    "17841",
    "--service-base",
    "17850",
  ],
  {
    env: {
      ...process.env,
      AKSARA_LOCAL_MODEL_PORT: "17860",
      AKSARA_TTS_ENABLED: "1",
      AKSARA_TTS_PORT: "17860",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let logs = "";
host.stdout.on("data", (b) => (logs += b));
host.stderr.on("data", (b) => (logs += b));
let browser;
const mark = (name) => {
  checks.push(name);
  console.log("PASS " + name);
};
try {
  for (let i = 0; i < 150; i++) {
    try {
      if ((await fetch(base + "/api/profiles")).ok) break;
    } catch {}
    if (host.exitCode !== null) throw new Error(logs);
    await new Promise((r) => setTimeout(r, 100));
  }
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base);
  await page
    .getByRole("button", { name: "Operator Community workspace" })
    .click();
  await page.getByRole("heading", { name: "Hello, Operator." }).waitFor();
  const previews = process.env.AKSARA_PREVIEW_DIR || path.join(dir, "previews");
  await mkdir(previews, { recursive: true });
  await page.screenshot({
    animations: "disabled",
    path: path.join(previews, "today-desktop.png"),
    fullPage: true,
  });
  mark("Fluid workspace Today renders with real empty-state data");
  await page.getByRole("button", { name: "Library", exact: true }).click();
  await page
    .getByLabel("Source title", { exact: true })
    .fill("Private original");
  await page
    .getByLabel("Source content", { exact: true })
    .fill("PRIVATE_PRODUCT_SENTINEL water continuity");
  await page.getByRole("button", { name: "Add source", exact: true }).click();
  await page
    .getByRole("button", { name: /Private original Private/ })
    .waitFor();
  mark("Original source enters the governed Library");
  await page.getByRole("button", { name: "New document", exact: true }).click();
  await page
    .getByLabel("Document title", { exact: true })
    .fill("Reviewed page");
  await page
    .getByLabel("Document content", { exact: true })
    .fill("A carefully reviewed synthetic document.");
  await page.getByRole("button", { name: "Prepare for review" }).click();
  await page.getByRole("button", { name: "Approve exact proposal" }).waitFor();
  await page.getByRole("button", { name: "Approve exact proposal" }).click();
  await page.getByRole("button", { name: "Execute approved effect" }).click();
  await page.getByText(/Receipt: VERIFIED/).waitFor();
  await page.getByRole("button", { name: "Close work", exact: true }).click();
  mark("Exact document proposal → explicit approval → execution → receipt");
  await page.getByRole("button", { name: /Private original Private/ }).click();
  await page
    .getByRole("button", { name: "Propose evidence for memory" })
    .click();
  await navigateSurface(page, "Tools");
  await page.getByRole("button", { name: "Approve candidate" }).click();
  await page.getByRole("button", { name: "Revoke", exact: true }).waitFor();
  mark("Evidence memory stays separate until explicit review");
  await page.getByRole("button", { name: "Ask PRIVATE" }).click();
  await page.getByText(/^Model & sources/).click();
  await page.getByLabel("Model", { exact: true }).selectOption("fixture-local");
  await page.getByText("Reference Library sources locally").click();
  await page.getByLabel("Private original", { exact: true }).check();
  await page
    .getByLabel("Message Aksara")
    .fill("Summarize the selected synthetic evidence.");
  await page.getByRole("button", { name: "Send message" }).click();
  await page.getByRole("heading", { name: "Fixture finding" }).waitFor();
  mark(
    "Actual Mastra adapter produces a canonical reply and a registered OpenUI card",
  );
  await page.evaluate(() => {
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      HTMLMediaElement.prototype.play = original;
      return Promise.reject(
        new DOMException("Synthetic autoplay block", "NotAllowedError"),
      );
    };
  });
  await page.getByRole("button", { name: "Read aloud locally" }).click();
  await page
    .getByRole("complementary", { name: "Local read-aloud controls" })
    .waitFor();
  assert.equal(
    await page.getByRole("button", { name: "Play", exact: true }).count(),
    1,
  );
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  assert.equal(
    await page
      .getByRole("complementary", { name: "Local read-aloud controls" })
      .count(),
    0,
  );
  mark(
    "Read-aloud retains explicit Play/Stop controls after mobile autoplay rejection",
  );

  await page.getByRole("button",{name:/Turn into a document/}).click();
  await page.getByRole("button",{name:"Prepare for review",exact:true}).click();
  await page.getByRole("button",{name:"Approve exact proposal",exact:true}).waitFor();
  await page.evaluate(async()=>{
    const session=await (await fetch('/api/session')).json();
    const library=await (await fetch('/api/kernel/library',{headers:{'x-aksara-scope':session.scope}})).json();
    const original=library.find(a=>a.title==='Private original');
    const response=await fetch('/api/kernel/withdraw',{method:'POST',headers:{'content-type':'application/json','x-aksara-scope':session.scope},body:JSON.stringify({id:original.id})});
    if(!response.ok)throw Error('Source withdrawal failed');
  });
  await page.getByRole("button",{name:"Close work",exact:true}).waitFor({state:'hidden'});
  await page.getByRole("heading", { name: "Where shall we begin?" }).waitFor();
  assert.equal(
    await page.getByRole("heading", { name: "Fixture finding" }).count(),
    0,
  );
  mark("Source withdrawal clears dependent model replies and an open derived-effect review");
  await page.getByRole("button", { name: "Today", exact: true }).click();
  await page.getByLabel("Historical date").fill("2001-01-01");
  await page
    .getByRole("heading", { name: "No recorded work for this date" })
    .waitFor();
  mark("Historical view does not fabricate unrecorded activity");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page
    .getByRole("button", { name: "My personal space", exact: true })
    .click();
  await page.getByRole("button", { name: "Library", exact: true }).click();
  await page
    .getByRole("heading", { name: "Make room for what you know." })
    .waitFor();
  assert.ok(
    !(await page.locator("main").innerText()).includes("Reviewed page"),
  );
  mark("Personal mode uses a separate empty database");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page
    .getByRole("button", { name: "Community workspace", exact: true })
    .click();
  await page
    .getByLabel("Current conversation")
    .selectOption({ label: "Common room · 3 members" });
  await page.getByRole("button", { name: "Library", exact: true }).click();
  await page
    .getByRole("heading", { name: "Make room for what you know." })
    .waitFor();
  assert.ok(
    !(await page.locator("main").innerText()).includes("Reviewed page"),
  );
  mark("Shared Channel cannot read private Library artifacts");
  await navigateSurface(page, "Tools");
  await page.getByRole("button", { name: "Prepare a test indication" }).click();
  await page.getByRole("button", { name: "Approve exact proposal" }).click();
  await page.getByRole("button", { name: "Execute approved effect" }).click();
  await page.getByText(/Receipt:/).waitFor();
  await page.getByRole("button", { name: "Close work", exact: true }).click();
  mark(
    "Device effect is reviewed and receipted through the independent simulator",
  );
  await page.getByRole("button", { name: "Ask PRIVATE" }).click();
  await page.getByText(/^Model & sources/).click();
  await page.getByLabel("Model provider").selectOption("opencode-free");
  await page.getByLabel("Message Aksara").fill("Synthetic cloud prompt");
  assert.ok(
    await page.getByRole("button", { name: "Send message" }).isDisabled(),
  );
  let unconsentedCalls=0;
  const watchUnconsented=request=>{if(new URL(request.url()).pathname==="/api/chat")unconsentedCalls++};
  page.on("request",watchUnconsented);
  await page.getByLabel("Message Aksara").press("Enter");
  await page.waitForTimeout(120);
  assert.equal(unconsentedCalls,0);
  assert.equal(await page.getByLabel("Message Aksara").inputValue(),"Synthetic cloud prompt");
  page.off("request",watchUnconsented);
  mark("Hosted model use requires explicit per-turn consent, including keyboard submission");
  await page.setViewportSize({ width: 360, height: 800 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Today", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector(".menu-sheet"));
  await page.screenshot({
    animations: "disabled",
    path: path.join(previews, "today-mobile.png"),
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  mark("360 px mobile view has no horizontal overflow");
  const cached = await page.evaluate(async () => {
    const out = [];
    for (const k of await caches.keys())
      for (const req of await (await caches.open(k)).keys())
        out.push(new URL(req.url).pathname);
    return out;
  });
  assert.ok(!cached.some((p) => p.startsWith("/api/")));
  mark("PWA cache contains no authenticated API data");
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ browser_checks_passed: checks.length, checks }));
} catch (e) {
  console.error(logs.slice(-5000));
  throw e;
} finally {
  await browser?.close();
  host.kill("SIGINT");
  await new Promise((r) => {
    if (host.exitCode !== null) r();
    else host.once("exit", r);
  });
  await new Promise((r) => model.close(r));
  await rm(dir, { recursive: true, force: true });
}
