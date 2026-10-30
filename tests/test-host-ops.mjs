/** Real container gate, restart and persistent-volume checks. No cloud account required. */
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
const base = process.env.AKSARA_TEST_ORIGIN || "http://127.0.0.1:18080";
const name = process.env.AKSARA_TEST_CONTAINER || "aksara-ops-test";
const password = (
  await readFile(
    process.env.AKSARA_TEST_PASSWORD_FILE || ".aksara/test-host/password",
    "utf8",
  )
).trim();
const authorization =
  "Basic " + Buffer.from("aksara:" + password).toString("base64");
let cookie = "",
  scope = "";
const checks = [];
const mark = (x) => {
  checks.push(x);
  console.log("PASS " + x);
};
async function ready() {
  for (let i = 0; i < 200; i++) {
    try {
      if ((await fetch(base + "/healthz")).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("Test host did not become ready");
}
async function request(route, body, extra = {}) {
  const response = await fetch(base + "/api/" + route, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      authorization,
      ...(body === undefined
        ? {}
        : { origin: base, "content-type": "application/json" }),
      ...(cookie ? { cookie } : {}),
      ...(scope ? { "x-aksara-scope": scope } : {}),
      ...extra,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (response.headers.has("set-cookie"))
    cookie = response.headers.get("set-cookie").split(";")[0];
  return { status: response.status, value: await response.json() };
}
await ready();
const browser = await chromium.launch();
const page = await browser.newPage({
  httpCredentials: { username: "aksara", password },
});
await page.goto(base);
await page
  .getByRole("button", { name: "Operator Community workspace" })
  .click();
await page.getByRole("heading", { name: /Room for/ }).waitFor();
assert.equal((await fetch(base + "/api/profiles")).status, 401);
mark(
  "Public test gateway requires credentials before revealing personas or API data",
);
const login = await request("session", { profile: "community-0" });
assert.equal(login.status, 200);
assert.equal(login.value.test_host, true);
scope = login.value.scope;
mark("Real Rust-backed session identifies itself as a development test host");
assert.equal(
  (
    await request(
      "kernel/ingest",
      {
        title: "Synthetic",
        content: "blocked",
        visibility: "private",
        purpose: "knowledge",
        provenance: "ops fixture",
      },
      { origin: "https://wrong-origin.invalid" },
    )
  ).status,
  403,
);
mark(
  "Gateway rejects cross-origin writes instead of trusting forwarded headers",
);
const artifact = await request("kernel/ingest", {
  title: "Persistent ops fixture",
  content: "SYNTHETIC_CONTAINER_RESTART_FIXTURE",
  visibility: "private",
  purpose: "knowledge",
  provenance: "disposable container test",
});
assert.equal(artifact.status, 200);
const dockerArgs = ["--host=unix:///var/run/docker.sock"];
execFileSync("docker", [...dockerArgs, "restart", "--time", "10", name], {
  stdio: "ignore",
});
await ready();
await page
  .getByRole("heading", { name: "Welcome to Aksara" })
  .waitFor({ timeout: 15000 });
await page
  .getByRole("button", { name: "Operator Community workspace" })
  .click();
await page.getByRole("heading", { name: /Room for/ }).waitFor();
mark(
  "Open browser recovers from a restarted host without retaining a stale authenticated view",
);
await browser.close();
assert.equal((await request("session")).status, 401);
mark("Restart invalidates in-memory browser sessions");
cookie = "";
scope = "";
const again = await request("session", { profile: "community-0" });
assert.equal(again.status, 200);
scope = again.value.scope;
const source = await request("kernel/artifact?id=" + artifact.value.id);
assert.equal(source.status, 200);
assert.equal(source.value.content, "SYNTHETIC_CONTAINER_RESTART_FIXTURE");
mark(
  "Canonical source bytes survive a real container restart on the mounted volume",
);
const personal = await request("scope", { profile: "personal-0" });
scope = personal.value.scope;
assert.deepEqual((await request("kernel/library")).value, []);
mark("Personal custody remains separate after restart");
console.log(JSON.stringify({ container_checks_passed: checks.length, checks }));
