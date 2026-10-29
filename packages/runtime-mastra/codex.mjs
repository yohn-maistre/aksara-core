/** Mastra Code Codex subscription port. Device authorization and provider
 * transport are adapted from Apache-2.0 upstream; no CLI/runtime is launched. */
import {
  mkdir,
  readFile,
  writeFile,
  rename,
  unlink,
  open,
} from "node:fs/promises";
import {
  createHash,
  randomBytes,
  randomUUID,
  createCipheriv,
  createDecipheriv,
} from "node:crypto";
import path from "node:path";
import {
  startCodexDeviceLogin,
  pollCodexDeviceLogin,
  refreshOpenAICodexToken,
} from "./vendor/mastra-codex/auth.mjs";
import { CODEX_MODELS } from "./catalogue.mjs";
export { CODEX_MODELS } from "./catalogue.mjs";
import { openaiCodexProvider } from "./vendor/mastra-codex/provider.mjs";
const unavailable = () =>
  Object.assign(
    new Error(
      "Codex connection unavailable. Reconnect this space in setup, or check your subscription access.",
    ),
    { status: 503 },
  );
async function atomic(file, value) {
  const temporary = file + "." + randomUUID() + ".tmp";
  const handle = await open(temporary, "wx", 0o600);
  try {
    await handle.writeFile(value);
    await handle.sync();
  } finally {
    await handle.close();
  }
  try {
    await rename(temporary, file);
  } finally {
    await unlink(temporary).catch(() => {});
  }
}
export function createCodexBridge({
  root,
  auth = {
    start: startCodexDeviceLogin,
    poll: pollCodexDeviceLogin,
    refresh: refreshOpenAICodexToken,
  },
  provider = openaiCodexProvider,
} = {}) {
  const pending = new Map(),
    epochs = new Map(),
    locks = new Map();
  const epoch = (profile) => epochs.get(profile) || 0;
  const directory = (profile) =>
    path.join(root, createHash("sha256").update(profile).digest("hex"));
  async function serialized(profile, fn) {
    const previous = locks.get(profile) || Promise.resolve();
    const current = previous.catch(() => {}).then(fn);
    locks.set(profile, current);
    try {
      return await current;
    } finally {
      if (locks.get(profile) === current) locks.delete(profile);
    }
  }
  async function key(profile) {
    const dir = directory(profile);
    await mkdir(dir, { recursive: true, mode: 0o700 });
    const file = path.join(dir, "credential-key");
    try {
      await writeFile(file, randomBytes(32), { flag: "wx", mode: 0o600 });
    } catch (e) {
      if (e.code !== "EEXIST") throw e;
    }
    const value = await readFile(file);
    if (value.length !== 32) throw unavailable();
    return value;
  }
  async function load(profile) {
    try {
      const file = JSON.parse(
        await readFile(path.join(directory(profile), "credential.enc"), "utf8"),
      );
      const decipher = createDecipheriv(
        "aes-256-gcm",
        await key(profile),
        Buffer.from(file.iv, "base64"),
      );
      decipher.setAuthTag(Buffer.from(file.tag, "base64"));
      const value = JSON.parse(
        Buffer.concat([
          decipher.update(Buffer.from(file.data, "base64")),
          decipher.final(),
        ]).toString("utf8"),
      );
      if (
        typeof value.access !== "string" ||
        typeof value.refresh !== "string" ||
        typeof value.accountId !== "string" ||
        !Number.isFinite(value.expires)
      )
        throw unavailable();
      return value;
    } catch (e) {
      if (e.code === "ENOENT") return null;
      throw unavailable();
    }
  }
  async function save(profile, credential) {
    if (
      typeof credential.access !== "string" ||
      typeof credential.refresh !== "string" ||
      typeof credential.accountId !== "string" ||
      !Number.isFinite(credential.expires)
    )
      throw unavailable();
    const iv = randomBytes(12),
      cipher = createCipheriv("aes-256-gcm", await key(profile), iv);
    const data = Buffer.concat([
      cipher.update(JSON.stringify(credential)),
      cipher.final(),
    ]);
    await atomic(
      path.join(directory(profile), "credential.enc"),
      JSON.stringify({
        iv: iv.toString("base64"),
        tag: cipher.getAuthTag().toString("base64"),
        data: data.toString("base64"),
      }),
    );
  }
  async function status(profile) {
    try {
      const value = await load(profile);
      return {
        available: true,
        connected: !!value,
        expired: !!value && value.expires <= Date.now(),
        transport: "mastra-codex-oauth",
        models: value ? CODEX_MODELS.map((id) => ({ id, name: id })) : [],
        verified_here: false,
        notice:
          "Candidate model catalog; a test turn checks your current entitlement.",
      };
    } catch {
      return {
        available: true,
        connected: false,
        models: [],
        requires_reconnect: true,
      };
    }
  }
  function cancelPending(profile) {
    const current = pending.get(profile);
    if (current) {
      current.abort.abort();
      pending.delete(profile);
    }
  }
  async function login(profile) {
    cancelPending(profile);
    const abort = new AbortController(),
      id = randomUUID(),
      current = { id, abort, nextPoll: 0, data: null, busy: false };
    pending.set(profile, current);
    try {
      const data = await auth.start({ signal: abort.signal });
      if (pending.get(profile) !== current || abort.signal.aborted)
        throw unavailable();
      if (
        data.url !== "https://auth.openai.com/codex/device" ||
        typeof data.userCode !== "string" ||
        data.userCode.length > 100
      )
        throw unavailable();
      current.data = data;
      current.nextPoll = Date.now() + data.intervalMs;
      return {
        verification_url: data.url,
        user_code: data.userCode,
        login_id: id,
        next_poll_ms: data.intervalMs,
      };
    } catch {
      cancelPending(profile);
      throw unavailable();
    }
  }
  async function poll(profile, id, { assertCurrent = () => {} } = {}) {
    const current = pending.get(profile);
    if (!current || current.id !== id || !current.data) throw unavailable();
    if (current.busy || Date.now() < current.nextPoll)
      return { status: "pending" };
    current.busy = true;
    try {
      const result = await auth.poll(current.data, {
        signal: current.abort.signal,
      });
      assertCurrent();
      if (current.abort.signal.aborted || pending.get(profile) !== current)
        throw unavailable();
      if (result.status === "complete") {
        await serialized(profile, async () => {
          assertCurrent();
          if (pending.get(profile) !== current) throw unavailable();
          await save(profile, result.credentials);
          epochs.set(profile, epoch(profile) + 1);
        });
        cancelPending(profile);
        return { status: "complete" };
      }
      if (result.status === "failed") {
        cancelPending(profile);
        return { status: "failed" };
      }
      current.nextPoll = Date.now() + Math.max(result.nextPollMs || 5000, 1000);
      return { status: "pending" };
    } catch {
      cancelPending(profile);
      throw unavailable();
    } finally {
      current.busy = false;
    }
  }
  async function cancel(profile, id) {
    if (pending.get(profile)?.id === id) cancelPending(profile);
    return { cancelled: true };
  }
  async function logout(profile) {
    cancelPending(profile);
    epochs.set(profile, epoch(profile) + 1);
    await serialized(profile, () =>
      unlink(path.join(directory(profile), "credential.enc")).catch((e) => {
        if (e.code !== "ENOENT") throw e;
      }),
    );
    return { disconnected: true };
  }
  async function model(profile, modelId, { fetchImpl } = {}) {
    if (!CODEX_MODELS.includes(modelId)) throw unavailable();
    const generation = epoch(profile);
    let credential = await load(profile);
    if (!credential) throw unavailable();
    const assertCurrent = () => {
      if (epoch(profile) !== generation) throw unavailable();
    };
    const storage = {
      reload() {},
      get(id) {
        return id === "openai-codex" && credential
          ? { ...credential, type: "oauth" }
          : undefined;
      },
      async getOAuthCredential(id) {
        if (id !== "openai-codex") return undefined;
        return serialized(profile, async () => {
          assertCurrent();
          credential = await load(profile);
          if (!credential) throw unavailable();
          if (credential.expires <= Date.now()) {
            const refreshed = await auth.refresh(
              credential.refresh,
              credential.accountId,
              credential.email,
            );
            assertCurrent();
            await save(profile, refreshed);
            credential = refreshed;
          }
          return { ...credential, type: "oauth" };
        });
      },
    };
    return {
      model: provider(modelId, { authStorage: storage, fetchImpl }),
      assertCurrent,
    };
  }
  return {
    status,
    login,
    poll,
    cancel,
    cancelPending,
    logout,
    model,
    close() {
      for (const profile of pending.keys()) cancelPending(profile);
    },
  };
}
