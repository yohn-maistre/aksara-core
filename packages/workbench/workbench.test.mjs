import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import net from "node:net";
import http from "node:http";
import { createWorkbench } from "./server.mjs";
const binary = path.resolve("target/debug/aksarad");
async function freePort() {
  const s = net.createServer();
  await new Promise((r) => s.listen(0, "127.0.0.1", r));
  const p = s.address().port;
  await new Promise((r) => s.close(r));
  return p;
}
async function fixture(generate) {
  const dir = await mkdtemp(path.join(tmpdir(), "aksara-platform-test-"));
  const hosts = [];
  const profiles = [];
  for (const [mode, command] of [
    ["community", ["init-dev"]],
    ["personal", ["init-personal", "--name", "Operator"]],
  ]) {
    const db = path.join(dir, mode + ".db");
    const dev = JSON.parse(execFileSync(binary, ["--db", db, ...command]));
    const p = await freePort();
    const kernel = `http://127.0.0.1:${p}`;
    const host = spawn(
      binary,
      ["--db", db, "serve", "--listen", `127.0.0.1:${p}`],
      { stdio: "ignore", env: { ...process.env, AKSARA_FAULT: "" } },
    );
    hosts.push(host);
    for (let i = 0; i < 100; i++) {
      try {
        if ((await fetch(kernel + "/health")).ok) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 30));
    }
    const person = dev.people[0];
    const lane = dev.lanes.find((l) => l.lane.audience.length === 1).lane.id;
    profiles.push({
      id: mode,
      name: "Operator",
      actor: "Operator",
      mode,
      kernel,
      token: person.token,
      lane,
    });
  }
  const port = await freePort();
  const app = await createWorkbench({
    profiles,
    port,
    generate,
    providerStateDir: path.join(dir, "providers"),
  });
  await new Promise((r) => app.server.listen(port, "127.0.0.1", r));
  const base = `http://127.0.0.1:${port}`;
  let cookie = "",
    scope = "";
  async function request(route, input, extra = {}) {
    const r = await fetch(base + "/api/" + route, {
      method: input === undefined ? "GET" : "POST",
      headers: {
        ...(input === undefined
          ? {}
          : { origin: base, "content-type": "application/json" }),
        ...(cookie ? { cookie } : {}),
        ...(scope ? { "x-aksara-scope": scope } : {}),
        ...extra,
      },
      ...(input === undefined ? {} : { body: JSON.stringify(input) }),
    });
    if (r.headers.has("set-cookie"))
      cookie = r.headers.get("set-cookie").split(";")[0];
    const value = await r.json();
    return { status: r.status, value, headers: r.headers };
  }
  const login = await request("session", { profile: "community" });
  scope = login.value.scope;
  return {
    audio: (seq) =>
      fetch(base + "/api/speech", {
        method: "POST",
        headers: {
          origin: base,
          cookie,
          "x-aksara-scope": scope,
          "content-type": "application/json",
        },
        body: JSON.stringify({ seq }),
      }),
    request,
    base,
    profiles,
    get scope() {
      return scope;
    },
    set scope(v) {
      scope = v;
    },
    close: async () => {
      await app.close();
      for (const h of hosts) h.kill("SIGTERM");
      await Promise.all(
        hosts.map((h) => new Promise((r) => h.once("exit", r))),
      );
      await rm(dir, { recursive: true, force: true });
    },
  };
}
test("real hosts: session boundary, CSRF, separate personal custody, and stale-context rejection", async () => {
  const f = await fixture();
  try {
    const s = await f.request("session");
    assert.equal(s.status, 200);
    assert.ok(!JSON.stringify(s.value).includes(f.profiles[0].token));
    assert.equal(
      (
        await f.request(
          "kernel/ingest",
          {
            title: "Secret",
            content: "PRIVATE_SENTINEL",
            visibility: "private",
            purpose: "knowledge",
            provenance: "test",
          },
          { origin: "https://evil.test" },
        )
      ).status,
      403,
    );
    const a = await f.request("kernel/ingest", {
      title: "Secret",
      content: "PRIVATE_SENTINEL",
      visibility: "private",
      purpose: "knowledge",
      provenance: "test",
    });
    assert.equal(a.status, 200);
    const old = f.scope;
    const changed = await f.request("scope", { profile: "personal" });
    assert.equal(changed.status, 200);
    f.scope = changed.value.scope;
    assert.deepEqual((await f.request("kernel/library")).value, []);
    assert.equal(
      (await f.request(`kernel/artifact?id=${a.value.id}`)).status,
      404,
    );
    assert.equal(
      (await f.request("kernel/library", undefined, { "x-aksara-scope": old }))
        .status,
      409,
    );
    assert.equal(
      (await f.request("kernel/principal-revoke", { id: "anything" })).status,
      404,
    );
    const logged = await f.request("logout", {});
    assert.equal(logged.status, 200);
    assert.match(logged.headers.get("set-cookie"), /HttpOnly; SameSite=Strict/);
    assert.equal((await f.request("session")).status, 401);
  } finally {
    await f.close();
  }
});
test("real hosts: saved provider keys never return to the browser and disconnect fences an in-flight reply", async () => {
  let release, started;
  const gate = new Promise((r) => (release = r)),
    entered = new Promise((r) => (started = r));
  const f = await fixture(async (input) => {
    assert.equal(input.apiKey, "SYNTHETIC_PROVIDER_KEY");
    started();
    await gate;
    return "LATE_KEY_REPLY";
  });
  try {
    const save = await f.request("providers/key", {
      provider: "gemini",
      key: "SYNTHETIC_PROVIDER_KEY",
      terms_acknowledged: true,
    });
    assert.equal(save.status, 200);
    const settings = await f.request("providers");
    assert.equal(settings.value.hosted.gemini.connected, true);
    assert.ok(
      !JSON.stringify(settings.value).includes("SYNTHETIC_PROVIDER_KEY"),
    );
    const q = {
      provider: "gemini",
      model: "gemini-2.5-flash",
      text: "Synthetic turn",
      cloud_consent: false,
      source_ids: [],
      idempotency_key: "provider-key",
    };
    assert.equal((await f.request("chat", q)).status, 403);
    q.cloud_consent = true;
    assert.equal((await f.request("chat", q)).status, 202);
    await entered;
    await f.request("providers/key", { provider: "gemini", remove: true });
    release();
    for (let i = 0; i < 100; i++) {
      if (
        (await f.request("kernel/threads")).value.every(
          (w) => w.state !== "WORKING",
        )
      )
        break;
      await new Promise((r) => setTimeout(r, 20));
    }
    assert.ok(
      !JSON.stringify((await f.request("kernel/messages")).value).includes(
        "LATE_KEY_REPLY",
      ),
    );
    const switched = await f.request("scope", { profile: "personal" });
    f.scope = switched.value.scope;
    assert.equal(
      (await f.request("providers")).value.hosted.gemini.connected,
      false,
    );
  } finally {
    release();
    await f.close();
  }
});
test("real hosts: one provider execution, canonical reply, consent checks, and no automatic effects", async () => {
  let calls = 0;
  let resolve;
  const gate = new Promise((r) => (resolve = r));
  const f = await fixture(async () => {
    calls++;
    await gate;
    return "SYNTHETIC_REPLY";
  });
  try {
    const q = {
      text: "synthetic",
      provider: "opencode-free",
      model: "big-pickle",
      cloud_consent: false,
      idempotency_key: "one",
    };
    assert.equal((await f.request("chat", q)).status, 403);
    q.cloud_consent = true;
    const a = await f.request("chat", q);
    assert.equal(a.status, 202);
    const duplicate = await f.request("chat", q);
    assert.equal(duplicate.value.duplicate, true);
    assert.equal(
      (
        await f.request("chat", {
          ...q,
          text: "different turn",
          idempotency_key: "other",
        })
      ).status,
      429,
    );
    resolve();
    for (let i = 0; i < 100; i++) {
      const m = await f.request("kernel/messages");
      if (m.value.length === 2) break;
      await new Promise((r) => setTimeout(r, 20));
    }
    assert.equal(calls, 1);
    assert.equal(
      (await f.request("kernel/messages")).value[1].text,
      "SYNTHETIC_REPLY",
    );
    assert.equal(
      (await f.request("kernel/effects?work_id=" + a.value.run.work_id)).value
        .length,
      0,
    );
    assert.equal((await f.request("chat", q)).value.duplicate, true);
    assert.equal(calls, 1);
  } finally {
    resolve();
    await f.close();
  }
});
test("real hosts: a late provider result cannot enter a switched surface or replay a claimed turn", async () => {
  let resolve;
  const gate = new Promise((r) => (resolve = r));
  const f = await fixture(async () => {
    await gate;
    return "LATE_REPLY";
  });
  try {
    const q = {
      text: "synthetic",
      provider: "local",
      model: "fixture",
      cloud_consent: false,
      idempotency_key: "one",
    };
    const a = await f.request("chat", q);
    assert.equal(a.status, 202);
    // The persisted execution claim rejects another executor even if its in-memory map is lost.
    const p = f.profiles[0];
    const claim = await fetch(p.kernel + "/api/model-claim", {
      method: "POST",
      headers: {
        authorization: `Bearer ${p.token}`,
        "x-aksara-lane": p.lane,
        "content-type": "application/json",
      },
      body: JSON.stringify({ id: a.value.run.id }),
    });
    assert.equal(claim.status, 409);
    const changed = await f.request("scope", { profile: "personal" });
    f.scope = changed.value.scope;
    resolve();
    await new Promise((r) => setTimeout(r, 80));
    assert.deepEqual((await f.request("kernel/messages")).value, []);
    const back = await f.request("scope", { profile: "community" });
    f.scope = back.value.scope;
    const m = await f.request("kernel/messages");
    assert.ok(!JSON.stringify(m.value).includes("LATE_REPLY"));
  } finally {
    resolve();
    await f.close();
  }
});
test("local speech rechecks message eligibility and discards audio after a context change", async () => {
  const oldEnabled = process.env.AKSARA_TTS_ENABLED,
    oldPort = process.env.AKSARA_TTS_PORT;
  let release, arrive;
  let block = false;
  const gate = new Promise((r) => (release = r)),
    arrived = new Promise((r) => (arrive = r));
  const worker = http.createServer(async (req, res) => {
    let content = "";
    for await (const c of req) content += c;
    assert.ok(content.includes("SYNTHETIC_SPEECH"));
    assert.ok(!content.includes("voice_url"));
    if (block) {
      arrive();
      await gate;
    }
    const b = Buffer.alloc(2444);
    b.write("RIFF");
    b.writeUInt32LE(2000000036, 4);
    b.write("WAVEfmt ", 8);
    b.writeUInt32LE(16, 16);
    b.writeUInt16LE(1, 20);
    b.writeUInt16LE(1, 22);
    b.writeUInt32LE(24000, 24);
    b.writeUInt32LE(48000, 28);
    b.writeUInt16LE(2, 32);
    b.writeUInt16LE(16, 34);
    b.write("data", 36);
    b.writeUInt32LE(2000000000, 40);
    res.end(b);
  });
  const port = await freePort();
  await new Promise((r) => worker.listen(port, "127.0.0.1", r));
  process.env.AKSARA_TTS_ENABLED = "1";
  process.env.AKSARA_TTS_PORT = String(port);
  const f = await fixture(async () => "SYNTHETIC_SPEECH");
  try {
    await f.request("chat", {
      text: "synthetic",
      provider: "local",
      model: "fixture",
      cloud_consent: false,
      idempotency_key: "one",
    });
    let m;
    for (let i = 0; i < 100; i++) {
      m = (await f.request("kernel/messages")).value;
      if (m.length === 2) break;
      await new Promise((r) => setTimeout(r, 20));
    }
    assert.equal((await f.audio(m[0].seq)).status, 403);
    const r = await f.audio(m[1].seq);
    assert.equal(r.status, 200);
    assert.equal(r.headers.get("cache-control"), "no-store");
    const wav = Buffer.from(await r.arrayBuffer());
    assert.equal(wav.readUInt32LE(40), 2400);
    block = true;
    const pending = f.audio(m[1].seq);
    await arrived;
    const changed = await f.request("scope", { profile: "personal" });
    f.scope = changed.value.scope;
    release();
    assert.equal((await pending).status, 409);
  } finally {
    release();
    await f.close();
    await new Promise((r) => worker.close(r));
    if (oldEnabled === undefined) delete process.env.AKSARA_TTS_ENABLED;
    else process.env.AKSARA_TTS_ENABLED = oldEnabled;
    if (oldPort === undefined) delete process.env.AKSARA_TTS_PORT;
    else process.env.AKSARA_TTS_PORT = oldPort;
  }
});

test("real hosts: generated surface resource IDs cannot bypass scope, withdrawal or CSRF", async () => {
  const f = await fixture();
  try {
    const source = await f.request("kernel/ingest", {
      title: "Private surface source",
      content: "SURFACE_PRIVATE_SENTINEL",
      visibility: "private",
      purpose: "knowledge",
      provenance: "test",
    });
    const plan = {
      protocol: "aksara.resource-surface/1",
      component: "DocumentPreview",
      title: "Requested source",
      ids: [source.value.id],
    };
    const resolved = await f.request("surfaces/resolve", plan);
    assert.equal(resolved.status, 200);
    assert.equal(
      resolved.value.resources[0].content,
      "SURFACE_PRIVATE_SENTINEL",
    );
    assert.equal(resolved.value.scope_ref, f.scope);
    assert.equal(
      (
        await f.request("surfaces/resolve", plan, {
          origin: "https://evil.test",
        })
      ).status,
      403,
    );
    const scope = f.scope;
    const personal = await f.request("scope", { profile: "personal" });
    f.scope = personal.value.scope;
    assert.equal((await f.request("surfaces/resolve", plan)).status, 404);
    assert.equal(
      (await f.request("surfaces/resolve", plan, { "x-aksara-scope": scope }))
        .status,
      409,
    );
    const community = await f.request("scope", { profile: "community" });
    f.scope = community.value.scope;
    await f.request("kernel/withdraw", { id: source.value.id });
    const withdrawn = await f.request("surfaces/resolve", plan);
    assert.equal(withdrawn.status, 404);
    assert.ok(
      !JSON.stringify(withdrawn.value).includes("SURFACE_PRIVATE_SENTINEL"),
    );
    assert.equal(
      (
        await f.request("surfaces/resolve", {
          ...plan,
          component: "ExecuteTool",
          approve: true,
        })
      ).status,
      400,
    );
  } finally {
    await f.close();
  }
});
