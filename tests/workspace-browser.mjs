/** Two real browser sessions, real Rust authority, no external model/provider. */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
const root = await mkdtemp(path.join(tmpdir(), "aksara-working-pages-"));
const base = "http://127.0.0.1:17941";
const host = spawn(
  "python3",
  [
    "scripts/start_platform.py",
    "--state",
    root,
    "--port",
    "17941",
    "--service-base",
    "17950",
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);
let logs = "";
host.stdout.on("data", (b) => (logs += b));
host.stderr.on("data", (b) => (logs += b));
let browser;
const nav = (p, name) =>
  p.locator(".reading-nav").getByRole("button", { name, exact: true }).click();
async function call(p, op, body) {
  return p.evaluate(
    async ({ op, body }) => {
      const s = await (await fetch("/api/session")).json();
      const r = await fetch("/api/kernel/" + op, {
        method: body ? "POST" : "GET",
        headers: {
          "content-type": "application/json",
          "x-aksara-scope": s.scope,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const v = await r.json();
      if (!r.ok) throw Error(v.error);
      return v;
    },
    { op, body },
  );
}
async function enter(person) {
  const c = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const p = await c.newPage();
  p.setDefaultTimeout(15000);
  await p.goto(base);
  await p
    .getByRole("button", { name: `${person} Community workspace` })
    .click();
  await p.getByRole("button", { name: "Explore first", exact: true }).click();
  await p
    .getByRole("button", { name: "Open channel Common room", exact: true })
    .click();
  await nav(p, "Library");
  return p;
}
try {
  for (let i = 0; i < 150; i++) {
    try {
      if ((await fetch(base + "/api/profiles")).ok) break;
    } catch {}
    if (host.exitCode !== null) throw Error(logs);
    await new Promise((r) => setTimeout(r, 100));
  }
  browser = await chromium.launch();
  const op = await enter("Operator");
  const errors = [];
  op.on("pageerror", (e) => errors.push(e.message));
  await op.getByRole("button", { name: "New document", exact: true }).click();
  await op
    .getByLabel("Document title", { exact: true })
    .fill("Shared working brief");
  await op
    .getByLabel("Document content", { exact: true })
    .fill("A question for the whole room.");
  await op.getByRole("button", { name: "Save draft", exact: true }).click();
  await op.getByText("Saved", { exact: true }).waitFor();
  await op.reload();
  await nav(op, "Library");
  await op
    .locator(".working-page-row")
    .filter({ hasText: "Shared working brief" })
    .click();
  await op
    .getByLabel("Document content", { exact: true })
    .getByText("A question for the whole room.", { exact: true })
    .waitFor();
  console.log(
    "PASS rich document autosaves, survives reload and reopens from the room Library",
  );
  const maria = await enter("Maria");
  maria.on("pageerror", (e) => errors.push(e.message));
  await maria
    .locator(".working-page-row")
    .filter({ hasText: "Shared working brief" })
    .click();
  await maria
    .getByLabel("Document content", { exact: true })
    .getByText("A question for the whole room.", { exact: true })
    .waitFor();
  let release, entered;
  const gate = new Promise((r) => (release = r)),
    started = new Promise((r) => (entered = r));
  await maria.route("**/api/kernel/workspace-save", async (route) => {
    entered();
    await gate;
    await route.continue();
  });
  await maria
    .getByLabel("Document content", { exact: true })
    .fill("Maria’s unsaved alternative.");
  await started;
  await op
    .getByLabel("Document content", { exact: true })
    .fill("The updated shared question.");
  await op.getByRole("button", { name: "Save draft", exact: true }).click();
  release();
  await maria
    .getByRole("alert")
    .getByText(/newer draft/)
    .waitFor();
  assert.match(
    await maria.getByLabel("Document content", { exact: true }).innerText(),
    /Maria/,
  );
  const entries = await call(op, "workspace-entries");
  const doc = entries.find((e) => e.title === "Shared working brief");
  assert.match(
    (await call(op, "workspace-entry?id=" + doc.id)).content,
    /updated shared question/,
  );
  console.log(
    "PASS another member reads the shared page; concurrent stale save preserves both local text and the authoritative newer revision",
  );
  const source = await call(op, "ingest", {
    title: "Table evidence",
    content: "A source for the shared meeting.",
    visibility: "institution",
    purpose: "knowledge",
    provenance: "synthetic browser fixture",
  });
  await nav(op, "Library");
  await op.getByRole("button",{name:"New shared table",exact:true}).click();
  await op.getByLabel("Table title").fill("Meeting sources");
  await op.getByLabel("Source to add to table").selectOption(source.id);
  await op.getByRole("button", { name: "Add to table", exact: true }).click();
  await op.getByRole("button", { name: "Save table", exact: true }).click();
  await nav(op, "Library");
  await op
    .locator(".working-page-row")
    .filter({ hasText: "Meeting sources" })
    .click();
  await op
    .locator(".react-flow__node")
    .getByText("Table evidence", { exact: true })
    .waitFor();
  assert.equal(await op.locator(".react-flow__node").count(), 1);
  await op
    .getByRole("button", { name: "Aksara, work with these", exact: true })
    .click();
  await op.getByLabel("Message Aksara", { exact: true }).waitFor();
  assert.match(
    await op.getByLabel("Message Aksara", { exact: true }).inputValue(),
    /Meeting sources/,
  );
  console.log(
    "PASS spatial table persists real source references and hands an explicit source-bound request to the same room conversation",
  );
  assert.deepEqual(errors, []);
} catch (e) {
  console.error(logs.slice(-2500));
  throw e;
} finally {
  await browser?.close();
  host.kill("SIGINT");
  await new Promise((r) =>
    host.exitCode !== null ? r() : host.once("exit", r),
  );
  await rm(root, { recursive: true, force: true });
}
