/** Native Vercel agent-desktop 1.0.2 / JSON contract 2.5 adapter.
 * The driver is not a sandbox. Only a host-selected window and current refs are
 * admitted. No shell, clipboard, raw coordinates, launch, headed fallback or retry. */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
const exec = promisify(execFile);
const unavailable = () =>
  new Error("The selected computer window is unavailable");
export class NativeDesktopPort {
  #binary;
  #state;
  #execute;
  #refs = new Map();
  #busy = false;
  constructor({ binary, stateRoot, execute = exec }) {
    if (!path.isAbsolute(binary || "") || !path.isAbsolute(stateRoot || ""))
      throw unavailable();
    this.#binary = binary;
    this.#state = stateRoot;
    this.#execute = execute;
  }
  async #command(args) {
    let stdout;
    const env = { ...process.env, AGENT_DESKTOP_HOME: this.#state };
    delete env.AGENT_DESKTOP_SESSION;
    delete env.AGENT_DESKTOP_AGENT_ID;
    try {
      ({ stdout } = await this.#execute(this.#binary, args, {
        shell: false,
        windowsHide: true,
        timeout: 15000,
        maxBuffer: 1024 * 1024,
        env,
      }));
    } catch (e) {
      stdout = e.stdout;
    }
    try {
      const result = JSON.parse(stdout);
      if (result.version !== "2.5" || typeof result.ok !== "boolean")
        throw unavailable();
      return result;
    } catch {
      throw unavailable();
    }
  }
  async status() {
    return this.#command(["status"]);
  }
  async windows() {
    const result = await this.#command(["list-windows"]);
    if (!result.ok || !Array.isArray(result.data)) throw unavailable();
    return result.data.filter(
      (w) =>
        w.accessible &&
        w.visible &&
        w.process_instance &&
        Number.isInteger(w.pid),
    );
  }
  async #current(binding, assertCurrent) {
    await assertCurrent();
    const windows = await this.windows();
    if (
      !windows.some(
        (w) =>
          w.id === binding.window_id &&
          w.app_name === binding.app &&
          w.pid === binding.pid &&
          w.process_instance === binding.process_instance,
      )
    )
      throw unavailable();
    await assertCurrent();
  }
  async observe(binding, assertCurrent) {
    await this.#current(binding, assertCurrent);
    const result = await this.#command([
      "snapshot",
      "--app",
      binding.app,
      "--window-id",
      binding.window_id,
      "--max-depth",
      "20",
      "--session",
      binding.id,
    ]);
    if (!result.ok || !result.data?.tree) throw unavailable();
    let count = 0,
      bytes = 0,
      truncated = false;
    const refs = new Set();
    const clean = (node) => {
      if (node.states?.includes("hidden")) return null;
      if (++count > 150 || bytes > 12000) {
        truncated = true;
        return null;
      }
      const protectedValue =
        /password/i.test(node.role || "") || node.states?.includes("protected");
      const value = {
        role: node.role,
        name: String(node.name || "").slice(0, 180),
        ...(node.ref_id ? { ref: node.ref_id } : {}),
        ...(node.value && !protectedValue
          ? { value: String(node.value).slice(0, 500) }
          : {}),
        ...(protectedValue ? { protected: true } : {}),
      };
      bytes += JSON.stringify(value).length;
      if (node.ref_id && !protectedValue) refs.add(node.ref_id);
      const children = (node.children || []).map(clean).filter(Boolean);
      return { ...value, ...(children.length ? { children } : {}) };
    };
    const tree = clean(result.data.tree);
    await this.#current(binding, assertCurrent);
    this.#refs.set(binding.id, { refs, observed: Date.now() });
    return {
      app: binding.app,
      window_id: binding.window_id,
      snapshot_id: result.data.snapshot_id,
      complete: result.data.complete === true && !truncated,
      tree,
    };
  }
  async act(binding, input, { assertCurrent, intent, receipt }) {
    if (this.#busy)
      throw new Error("Computer interaction is already in progress");
    if (
      !["click", "set-value", "type"].includes(input.operation) ||
      !/^@[a-zA-Z0-9_-]+:e\d+$/.test(input.ref || "") ||
      (input.operation !== "click" &&
        (typeof input.value !== "string" || input.value.length > 4000))
    )
      throw unavailable();
    const observation = this.#refs.get(binding.id);
    if (
      !observation?.refs.has(input.ref) ||
      Date.now() - observation.observed > 30000
    )
      throw new Error("Take a fresh computer observation first");
    this.#busy = true;
    try {
      await this.#current(binding, assertCurrent);
      const pending = await intent(input); // Durable admission precedes native invocation.
      this.#refs.delete(binding.id); // Never reuse a ref after an attempted action.
      let result;
      try {
        await this.#current(binding, assertCurrent);
        result = await this.#command([
          input.operation,
          "--session",
          binding.id,
          ...(input.operation === "type" && binding.allow_headed
            ? ["--headed"]
            : []),
          "--",
          input.ref,
          ...(input.operation !== "click" ? [input.value] : []),
        ]);
      } catch {
        result = {
          version: "2.5",
          ok: false,
          error: {
            code: "OUTCOME_UNKNOWN",
            disposition: { delivery: "unknown", retry: "unsafe" },
          },
        };
      }
      await receipt(pending, result);
      await assertCurrent();
      return result; // ok:true can still mean delivered_unverified; preserve it.
    } finally {
      this.#busy = false;
    }
  }
}
