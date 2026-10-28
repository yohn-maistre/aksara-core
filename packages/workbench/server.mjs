import { validatePack } from "@aksara/contracts";
import { finalizePcmWav } from "./audio.mjs";
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  generateReply,
  modelConfig,
  FREE_MODELS,
  localEndpoint,
} from "@aksara/runtime-mastra";

const root = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const uid = () => randomBytes(24).toString("base64url");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
};
const readOps = new Set([
  "me",
  "lane-names",
  "lanes",
  "library",
  "search",
  "threads",
  "thread",
  "effects",
  "artifact",
  "events",
  "memories",
  "memory-candidates",
  "capabilities",
  "today",
  "messages",
  "simulator-status",
]);
const writeOps = new Set([
  "ingest",
  "delegate",
  "prepare",
  "approve",
  "execute",
  "steer",
  "cancel",
  "withdraw",
  "memory-candidate",
  "memory-approve",
  "memory-revoke",
  "channel-create",
  "model-interrupt",
  "device-execute",
  "device-reconcile",
  "simulator-input",
]);
function fail(message, status = 400) {
  return Object.assign(new Error(message), { status });
}
function same(a, b) {
  return (
    typeof a === "string" &&
    typeof b === "string" &&
    a.length === b.length &&
    timingSafeEqual(Buffer.from(a), Buffer.from(b))
  );
}
async function body(req) {
  let size = 0,
    parts = [];
  for await (const p of req) {
    size += p.length;
    if (size > 1100000) throw fail("Request too large", 413);
    parts.push(p);
  }
  try {
    return JSON.parse(Buffer.concat(parts).toString() || "{}");
  } catch {
    throw fail("Invalid JSON");
  }
}
function reply(res, value, status = 200) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(value));
}
export async function createWorkbench({
  profiles,
  port = 7341,
  generate = generateReply,
  webRoot = path.join(root, "apps/platform/dist"),
} = {}) {
  if (!Array.isArray(profiles) || !profiles.length)
    throw new Error("No development profiles configured");
  for (const p of profiles) {
    const u = new URL(p.kernel);
    if (u.hostname !== "127.0.0.1" || u.protocol !== "http:")
      throw new Error("Kernel must be fixed loopback");
  }
  const sessions = new Map();
  const active = new Map();
  const admitted = new Set();
  let voiceBusy = false;
  const origin = `http://127.0.0.1:${port}`;
  async function kernel(session, operation, input, query = "") {
    const response = await fetch(
      `${session.profile.kernel}/api/${operation}${query}`,
      {
        method: input === undefined ? "GET" : "POST",
        redirect: "error",
        signal: AbortSignal.timeout(10000),
        headers: {
          authorization: `Bearer ${session.profile.token}`,
          "x-aksara-lane": session.lane,
          "x-aksara-purpose": "knowledge",
          "content-type": "application/json",
        },
        ...(input === undefined ? {} : { body: JSON.stringify(input) }),
      },
    );
    const data = await response.json();
    if (!response.ok)
      throw fail(
        data.error || "Authority host rejected request",
        response.status,
      );
    return data;
  }
  async function sessionView(s) {
    const lanes = await kernel(s, "lane-names");
    return {
      profile: {
        id: s.profile.id,
        name: s.profile.name,
        mode: s.profile.mode,
        actor: s.profile.actor,
      },
      scope: s.scope,
      lane: s.lane,
      lanes,
      development: true,
    };
  }
  const server = http.createServer(async (req, res) => {
    try {
      // The development origin is intentionally exact; LAN enrollment/TLS is a separate gate.
      if (req.headers.host !== `127.0.0.1:${port}`)
        throw fail("Use the configured loopback origin", 403);
      res.setHeader("x-content-type-options", "nosniff");
      res.setHeader("referrer-policy", "no-referrer");
      res.setHeader(
        "content-security-policy",
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'self'; frame-ancestors 'none'",
      );
      const url = new URL(req.url, origin);
      if (!url.pathname.startsWith("/api/")) {
        if (req.method !== "GET") throw fail("Method not allowed", 405);
        const pathname =
          url.pathname === "/"
            ? "index.html"
            : decodeURIComponent(url.pathname.slice(1));
        const file = path.resolve(webRoot, pathname);
        if (!file.startsWith(webRoot + path.sep)) throw fail("Not found", 404);
        let data;
        try {
          if (!(await stat(file)).isFile()) throw 0;
          data = await readFile(file);
        } catch {
          throw fail("Build the platform first: npm run build", 404);
        }
        res.writeHead(200, {
          "content-type":
            types[path.extname(file)] || "application/octet-stream",
          "cache-control": "no-cache",
        });
        res.end(data);
        return;
      }
      res.setHeader("cache-control", "no-store");
      if (req.method === "POST" && req.headers.origin !== origin)
        throw fail("Origin check failed", 403);
      if (req.method === "GET" && url.pathname === "/api/profiles") {
        reply(
          res,
          profiles.map(({ id, name, mode }) => ({ id, name, mode })),
        );
        return;
      }
      const cookie = req.headers.cookie
        ?.split(";")
        .map((x) => x.trim())
        .find((x) => x.startsWith("aksara_session="))
        ?.slice(15);
      let s = cookie ? sessions.get(cookie) : undefined;
      if (s && s.expires < Date.now()) {
        sessions.delete(cookie);
        s = undefined;
      }
      if (req.method === "POST" && url.pathname === "/api/session") {
        const b = await body(req);
        const profile = profiles.find((p) => p.id === b.profile);
        if (!profile) throw fail("Unknown development identity");
        if (cookie) sessions.delete(cookie);
        const session = {
          profile,
          lane: profile.lane,
          scope: uid(),
          expires: Date.now() + 12 * 3600000,
        };
        const key = uid();
        sessions.set(key, session);
        res.setHeader(
          "set-cookie",
          `aksara_session=${key}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200`,
        );
        reply(res, await sessionView(session));
        return;
      }
      if (!s) throw fail("Choose a local development identity", 401);
      if (req.method === "GET" && url.pathname === "/api/session") {
        reply(res, await sessionView(s));
        return;
      }
      if (!same(req.headers["x-aksara-scope"], s.scope))
        throw fail("Scope changed; refresh this view", 409);
      if (req.method === "POST" && url.pathname === "/api/logout") {
        sessions.delete(cookie);
        res.setHeader(
          "set-cookie",
          "aksara_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
        );
        for (const a of active.values())
          if (a.scope === s.scope) a.abort.abort();
        reply(res, { logged_out: true });
        return;
      }
      if (req.method === "POST" && url.pathname === "/api/scope") {
        const b = await body(req);
        const p = profiles.find(
          (p) => p.id === b.profile && p.actor === s.profile.actor,
        );
        if (!p) throw fail("Unknown context", 403);
        const lanes = await kernel({ ...s, profile: p, lane: p.lane }, "lanes");
        const lane = b.lane || p.lane;
        if (!lanes.some((l) => l.id === lane)) throw fail("Access denied", 403);
        const oldScope = s.scope;
        s.profile = p;
        s.lane = lane;
        s.scope = uid();
        for (const a of active.values())
          if (a.scope === oldScope) a.abort.abort();
        reply(res, await sessionView(s));
        return;
      }
      const snapshot = { ...s };
      const assertScope = () => {
        if (s.scope !== snapshot.scope)
          throw fail("Scope changed; result discarded", 409);
      };
      if (req.method === "GET" && url.pathname === "/api/packs") {
        reply(res, [
          validatePack(
            JSON.parse(
              await readFile(
                path.join(root, "packs/knowledge/pack.json"),
                "utf8",
              ),
            ),
          ),
        ]);
        return;
      }
      if (req.method === "GET" && url.pathname === "/api/providers") {
        let local = [];
        let available = false;
        let canPull = false;
        try {
          const r = await fetch(localEndpoint() + "/api/tags", {
            redirect: "error",
            signal: AbortSignal.timeout(1500),
          });
          if (r.ok) {
            local =
              (await r.json()).models?.map((m) => ({
                id: m.name,
                bytes: m.size,
              })) || [];
            available = true;
            canPull = true;
          }
        } catch {}
        if (!available) {
          try {
            const r = await fetch(localEndpoint() + "/v1/models", {
              redirect: "error",
              signal: AbortSignal.timeout(1500),
            });
            if (r.ok) {
              local =
                (await r.json()).data?.map((m) => ({
                  id: m.id,
                  bytes: null,
                })) || [];
              available = true;
            }
          } catch {}
        }
        reply(res, {
          local: { available, can_pull: canPull, models: local },
          opencode: {
            experimental: true,
            models: FREE_MODELS,
            verified_here: false,
            probe_status: "rate_limited_429",
            notice:
              "Hosted experimental models. Availability and data-use terms can change. No paid fallback.",
          },
          voice: {
            configured: process.env.AKSARA_TTS_ENABLED === "1",
            engine: "Pocket TTS",
            note: "Opt-in local read-aloud; Indonesian is not in the upstream supported-language list.",
          },
        });
        return;
      }
      if (req.method === "POST" && url.pathname === "/api/speech") {
        if (process.env.AKSARA_TTS_ENABLED !== "1")
          throw fail("Local Pocket TTS is not enabled", 409);
        if (voiceBusy) throw fail("The local voice worker is busy", 429);
        voiceBusy = true;
        try {
          const b = await body(req);
          const find = async () => {
            const messages = await kernel(snapshot, "messages");
            return messages.find(
              (m) => m.seq === b.seq && m.role === "assistant",
            );
          };
          const message = await find();
          if (!message) throw fail("Message is no longer eligible", 403);
          const text = message.text.replace(/```[\s\S]*?```/g, "").trim();
          if (!text || Buffer.byteLength(text) > 4000)
            throw fail("Read-aloud supports a short plain-text reply only");
          const ttsPort = Number(process.env.AKSARA_TTS_PORT || 7361);
          if (!Number.isInteger(ttsPort) || ttsPort < 1024 || ttsPort > 65535)
            throw fail("Invalid local voice configuration");
          const form = new FormData();
          form.set("text", text);
          const response = await fetch(`http://127.0.0.1:${ttsPort}/tts`, {
            method: "POST",
            body: form,
            redirect: "error",
            signal: AbortSignal.timeout(90000),
          });
          if (!response.ok) throw fail("Pocket TTS is unavailable", 503);
          const chunks = [];
          let size = 0;
          for await (const chunk of response.body) {
            size += chunk.length;
            if (size > 8 * 1048576)
              throw fail("Audio response exceeded the 8 MiB bound", 413);
            chunks.push(chunk);
          }
          assertScope();
          if (!(await find()))
            throw fail("Message was withdrawn during synthesis", 403);
          let wav;
          try {
            wav = finalizePcmWav(Buffer.concat(chunks));
          } catch {
            throw fail("Voice worker returned invalid PCM WAV", 502);
          }
          res.writeHead(200, {
            "content-type": "audio/wav",
            "cache-control": "no-store",
            "content-length": wav.length,
          });
          res.end(wav);
          return;
        } finally {
          voiceBusy = false;
        }
      }
      if (req.method === "POST" && url.pathname === "/api/models/pull") {
        const b = await body(req);
        if (b.confirm_download !== true)
          throw fail("Confirm the model download");
        modelConfig("local", b.model);
        const r = await fetch(localEndpoint() + "/api/pull", {
          method: "POST",
          redirect: "error",
          signal: AbortSignal.timeout(30 * 60 * 1000),
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: b.model, stream: false }),
        });
        if (!r.ok) throw fail("Local model download failed", 502);
        assertScope();
        reply(res, await r.json());
        return;
      }
      if (req.method === "POST" && url.pathname === "/api/chat") {
        const b = await body(req);
        modelConfig(b.provider, b.model);
        const fingerprint = JSON.stringify([
          snapshot.profile.id,
          snapshot.lane,
          b.idempotency_key,
        ]);
        const begin = () =>
          kernel(snapshot, "model-begin", {
            text: b.text,
            provider: b.provider,
            model: b.model,
            cloud_consent: b.cloud_consent === true,
            idempotency_key: b.idempotency_key,
            source_ids: b.source_ids || [],
          });
        if (admitted.has(fingerprint)) {
          const run = await begin();
          reply(res, { run, duplicate: true });
          return;
        }
        if (admitted.size >= 1)
          throw fail(
            "This host is already running a model turn. Try again after it finishes.",
            429,
          );
        admitted.add(fingerprint);
        try {
          const run = await begin();
          // Duplicate delivery never repeats a potentially billable/in-flight provider call.
          if (active.has(run.id) || run.state !== "running") {
            admitted.delete(fingerprint);
            reply(res, { run, duplicate: true });
            return;
          }
          try {
            await kernel(snapshot, "model-claim", { id: run.id });
          } catch (e) {
            if (e.status === 409) {
              admitted.delete(fingerprint);
              reply(res, { run, duplicate: true });
              return;
            }
            throw e;
          }
          const abort = new AbortController();
          const timeout = setTimeout(() => abort.abort(), 180000);
          active.set(run.id, {
            abort,
            scope: snapshot.scope,
            workId: run.work_id,
          });
          const task = (async () => {
            try {
              const context = await kernel(
                snapshot,
                "model-input",
                undefined,
                `?id=${encodeURIComponent(run.id)}`,
              );
              assertScope();
              const text = await generate({
                provider: run.provider,
                model: run.model,
                messages: context.messages,
                signal: abort.signal,
              });
              assertScope();
              await kernel(snapshot, "model-finish", {
                id: run.id,
                text,
                failed: false,
              });
            } catch {
              // Generic failure detail avoids returning provider echoes of private prompts.
              try {
                await kernel(snapshot, "model-finish", {
                  id: run.id,
                  text: "Provider unavailable or turn interrupted. No action was performed.",
                  failed: true,
                });
              } catch {
                try {
                  await kernel(snapshot, "model-interrupt", {
                    work_id: run.work_id,
                  });
                } catch {}
              }
            } finally {
              clearTimeout(timeout);
              active.delete(run.id);
              admitted.delete(fingerprint);
            }
          })();
          active.get(run.id).task = task;
          assertScope();
          reply(res, { run }, 202);
          return;
        } catch (e) {
          admitted.delete(fingerprint);
          throw e;
        }
      }
      if (url.pathname.startsWith("/api/kernel/")) {
        const op = url.pathname.slice("/api/kernel/".length);
        if (req.method === "GET" && readOps.has(op)) {
          const data = await kernel(snapshot, op, undefined, url.search);
          assertScope();
          reply(res, data);
          return;
        }
        if (req.method === "POST" && writeOps.has(op)) {
          const b = await body(req);
          const data = await kernel(snapshot, op, b);
          if (op === "model-interrupt" || op === "cancel")
            for (const running of active.values())
              if (running.workId === (b.work_id || b.id)) running.abort.abort();
          assertScope();
          reply(res, data);
          return;
        }
      }
      throw fail("Not found", 404);
    } catch (e) {
      if (!res.headersSent)
        reply(
          res,
          { error: e.status ? e.message : "Service unavailable" },
          e.status || 503,
        );
      else res.end();
    }
  });
  return {
    server,
    close: async () => {
      for (const a of active.values()) a.abort.abort();
      await Promise.allSettled([...active.values()].map((a) => a.task));
      await new Promise((resolve) => server.close(resolve));
    },
  };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const config = JSON.parse(
    await readFile(
      process.env.AKSARA_PROFILES ||
        path.join(root, ".aksara/platform-profiles.json"),
      "utf8",
    ),
  );
  const app = await createWorkbench({
    profiles: config,
    port: Number(process.env.AKSARA_PORT || 7341),
  });
  app.server.listen(Number(process.env.AKSARA_PORT || 7341), "127.0.0.1", () =>
    console.log(`Aksara: http://127.0.0.1:${process.env.AKSARA_PORT || 7341}`),
  );
  for (const sig of ["SIGINT", "SIGTERM"])
    process.once(sig, () => {
      app.close().then(() => process.exit(0));
      setTimeout(() => process.exit(1), 5000).unref();
    });
}
