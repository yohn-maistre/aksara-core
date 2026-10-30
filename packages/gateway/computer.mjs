/** Qualification-stage computer backend port. Provision/observe/stop require a
 * host authority callback. No browser/MCP/model receives this object or a shell.
 * Reviewed command dispatch remains disabled until durable Rust intents and
 * uncertain-outcome reconciliation are implemented for this backend. */
import { createHash } from "node:crypto";
import { DockerSandbox } from "@mastra/docker";
import { noopLogger } from "@mastra/core/logger";
import Docker from "dockerode";
import { z } from "zod/v4";
export const ComputerBinding = z
  .object({
    institution_id: z.string().min(1).max(100),
    lane_id: z.string().min(1).max(100),
    audience_digest: z.string().regex(/^[a-f0-9]{64}$/),
    principal_id: z.string().min(1).max(100),
    purpose: z.string().min(1).max(80),
    policy_epoch: z.number().int().positive(),
    controller_generation: z.number().int().positive(),
  })
  .strict();
const fail = () => new Error("Computer binding or isolation is unavailable");
export function computerIdentity(binding) {
  const valid = ComputerBinding.parse(binding);
  return (
    "aksara-" +
    createHash("sha256")
      .update(
        JSON.stringify(
          Object.fromEntries(
            Object.entries(valid).filter(([key]) => key !== "principal_id"),
          ),
        ),
      )
      .digest("hex")
      .slice(0, 32)
  );
}
export const COMPUTER_LIMITS = Object.freeze({
  memory: 128 * 1024 * 1024,
  memorySwap: 128 * 1024 * 1024,
  cpuQuota: 50000,
  cpuPeriod: 100000,
  pidsLimit: 64,
});
export function assertComputerIsolation(info, { id, image, binding }) {
  const labels = info.Config?.Labels || {},
    host = info.HostConfig || {};
  const identity = computerIdentity(binding);
  if (
    labels["dev.aksara.binding"] !== identity ||
    labels["mastra.sandbox.id"] !== id ||
    info.Image !== image ||
    host.NetworkMode !== "none" ||
    host.Privileged ||
    !host.ReadonlyRootfs ||
    !(host.CapDrop || []).includes("ALL") ||
    (host.CapAdd || []).length ||
    !(host.SecurityOpt || []).some(
      (v) => v === "no-new-privileges:true" || v === "no-new-privileges",
    ) ||
    (host.Binds || []).length ||
    (host.Devices || []).length ||
    (host.DeviceRequests || []).length ||
    host.PidMode === "host" ||
    host.IpcMode === "host" ||
    host.UTSMode === "host" ||
    (info.Mounts || []).some((m) => m.Type !== "tmpfs") ||
    !info.Config.User ||
    ["0", "root"].includes(info.Config.User) ||
    Object.entries(COMPUTER_LIMITS).some(
      ([key, value]) =>
        host[
          {
            memory: "Memory",
            memorySwap: "MemorySwap",
            cpuQuota: "CpuQuota",
            cpuPeriod: "CpuPeriod",
            pidsLimit: "PidsLimit",
          }[key]
        ] !== value,
    )
  )
    throw fail();
  return info;
}
export class MastraComputerPort {
  #sandbox;
  #docker;
  #authority;

  constructor({
    binding,
    image,
    authority,
    dockerOptions = {
      socketPath:
        process.platform === "win32"
          ? "//./pipe/docker_engine"
          : "/var/run/docker.sock",
    },
    DockerImpl = Docker,
    SandboxImpl = DockerSandbox,
  }) {
    this.binding = Object.freeze(ComputerBinding.parse(binding));
    if (
      !/^sha256:[a-f0-9]{64}$/.test(image) ||
      typeof authority?.assertCurrent !== "function"
    )
      throw fail();
    if (dockerOptions.host || dockerOptions.port || !dockerOptions.socketPath)
      throw fail();
    this.image = image;
    this.#authority = authority;
    this.id = computerIdentity(this.binding);
    this.#docker = new DockerImpl(dockerOptions);
    this.#sandbox = new SandboxImpl({
      id: this.id,
      name: this.id,
      image,
      workingDirectory: "/workspace",
      command: ["sleep", "infinity"],
      env: {},
      network: "none",
      privileged: false,
      readonlyRootfs: true,
      capDrop: ["ALL"],
      securityOpt: ["no-new-privileges:true"],
      ...COMPUTER_LIMITS,
      tmpfs: {
        "/workspace": "rw,nosuid,nodev,noexec,size=16777216,mode=1777",
        "/tmp": "rw,nosuid,nodev,noexec,size=16777216,mode=1777",
      },
      init: false,
      dockerOptions,
      instructions: "",
      labels: { "dev.aksara.binding": this.id },
    });
    this.#sandbox.__setLogger(noopLogger);
  }
  async check(operation) {
    await this.#authority.assertCurrent({ binding: this.binding, operation });
  }
  async #inspect() {
    const containers = await this.#docker.listContainers({
      all: true,
      filters: { label: [`mastra.sandbox.id=${this.id}`] },
    });
    if (containers.length !== 1) throw fail();
    const info = await this.#docker.getContainer(containers[0].Id).inspect();
    return assertComputerIsolation(info, {
      id: this.id,
      image: this.image,
      binding: this.binding,
    });
  }
  async start() {
    await this.check("computer.provision");
    const image = await this.#docker.getImage(this.image).inspect();
    if (
      Object.keys(image.Config?.Volumes || {}).length ||
      !image.Config?.User ||
      ["0", "root"].includes(image.Config.User)
    )
      throw fail();
    const existing = await this.#docker.listContainers({
      all: true,
      filters: { label: [`mastra.sandbox.id=${this.id}`] },
    });
    if (existing.length) await this.#inspect();
    try {
      await this.#sandbox.start();
      await this.check("computer.provision");
      await this.#inspect();
    } catch (error) {
      if (!existing.length) await this.#sandbox.destroy().catch(() => {});
      throw error;
    }
    return {
      state: "running",
      binding: this.binding,
      network: "disabled",
      storage: "ephemeral",
      commands: "disabled",
    };
  }
  async observe() {
    await this.check("computer.observe");
    const info = await this.#inspect();
    if (!info.State?.Running) throw fail();
    const result = await this.#sandbox.executeCommand(
      "node",
      [
        "-e",
        "const fs=require('node:fs');process.stdout.write(JSON.stringify({entries:fs.readdirSync('/workspace').slice(0,100)}))",
      ],
      { timeout: 5000 },
    );
    await this.check("computer.observe");
    await this.#inspect();
    if (result.exitCode !== 0) throw fail();
    const output = JSON.parse(result.stdout);
    return {
      state: "running",
      binding: this.binding,
      entries: output.entries,
      network: "disabled",
      storage: "ephemeral",
      commands: "disabled",
    };
  }
  async stop() {
    await this.check("computer.stop");
    await this.#inspect();
    await this.#sandbox.destroy();
    return { state: "stopped" };
  }
}
