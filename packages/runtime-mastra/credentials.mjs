/** Host-side API keys, scoped to current Rust institution + principal.
 * AES-GCM protects stored records; the adjacent key still requires OS owner ACLs.
 * This is not protection from a compromised host or a Windows credential vault. */
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
import { HOSTED_PROVIDERS } from "./hosted.mjs";
export function createProviderCredentials(root) {
  const locks = new Map(),
    epochs = new Map();
  const id = (custody, provider) => {
    if (
      typeof custody !== "string" ||
      !custody ||
      !Object.hasOwn(HOSTED_PROVIDERS, provider)
    )
      throw new Error("Invalid provider custody");
    return createHash("sha256")
      .update(JSON.stringify([custody, provider]))
      .digest("hex");
  };
  const serial = async (key, fn) => {
    const previous = locks.get(key) || Promise.resolve();
    const current = previous.catch(() => {}).then(fn);
    locks.set(key, current);
    try {
      return await current;
    } finally {
      if (locks.get(key) === current) locks.delete(key);
    }
  };
  async function secret(dir) {
    await mkdir(dir, { recursive: true, mode: 0o700 });
    const file = path.join(dir, "key");
    try {
      await writeFile(file, randomBytes(32), { flag: "wx", mode: 0o600 });
    } catch (e) {
      if (e.code !== "EEXIST") throw e;
    }
    const b = await readFile(file);
    if (b.length !== 32)
      throw new Error("Provider credential storage unavailable");
    return b;
  }
  async function read(key) {
    try {
      const dir = path.join(root, key),
        v = JSON.parse(
          await readFile(path.join(dir, "credential.enc"), "utf8"),
        );
      const decipher = createDecipheriv(
        "aes-256-gcm",
        await secret(dir),
        Buffer.from(v.iv, "base64"),
      );
      decipher.setAuthTag(Buffer.from(v.tag, "base64"));
      return Buffer.concat([
        decipher.update(Buffer.from(v.data, "base64")),
        decipher.final(),
      ]).toString("utf8");
    } catch (e) {
      if (e.code === "ENOENT") return null;
      throw new Error("Provider credential storage unavailable");
    }
  }
  async function write(key, value) {
    const dir = path.join(root, key),
      iv = randomBytes(12),
      cipher = createCipheriv("aes-256-gcm", await secret(dir), iv);
    const data = Buffer.concat([cipher.update(value), cipher.final()]);
    const file = path.join(dir, "credential.enc"),
      temporary = file + "." + randomUUID();
    const handle = await open(temporary, "wx", 0o600);
    try {
      await handle.writeFile(
        JSON.stringify({
          iv: iv.toString("base64"),
          tag: cipher.getAuthTag().toString("base64"),
          data: data.toString("base64"),
        }),
      );
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
  async function update(custody, provider, value, assertCurrent) {
    const key = id(custody, provider);
    return serial(key, async () => {
      await assertCurrent();
      const old = await read(key);
      const remove = () =>
        unlink(path.join(root, key, "credential.enc")).catch((e) => {
          if (e.code !== "ENOENT") throw e;
        });
      try {
        if (value === null) await remove();
        else await write(key, value);
        await assertCurrent();
      } catch (e) {
        if (old !== null) await write(key, old);
        else await remove();
        throw e;
      }
      epochs.set(key, (epochs.get(key) || 0) + 1);
      return { connected: value !== null };
    });
  }
  return {
    async status(custody, provider) {
      const key = id(custody, provider);
      return serial(key, async () => ({
        connected: !!(await read(key)),
        verified_here: false,
      }));
    },
    async set(custody, provider, value, assertCurrent) {
      if (typeof value !== "string" || !/^[\x21-\x7e]{8,4096}$/.test(value))
        throw new Error("Enter a valid API key");
      return update(custody, provider, value, assertCurrent);
    },
    delete: (custody, provider, assertCurrent) =>
      update(custody, provider, null, assertCurrent),
    async lease(custody, provider) {
      const key = id(custody, provider);
      return serial(key, async () => {
        const apiKey = await read(key),
          generation = epochs.get(key) || 0;
        if (!apiKey) throw new Error("Connect this provider in setup first");
        return {
          apiKey,
          assertCurrent() {
            if ((epochs.get(key) || 0) !== generation)
              throw new Error("Provider connection changed");
          },
        };
      });
    },
  };
}
