import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MastraComputerPort,
  ComputerBinding,
  computerIdentity,
  assertComputerIsolation,
  COMPUTER_LIMITS,
} from "./computer.mjs";
const binding = {
    institution_id: "institution-1",
    lane_id: "private-1",
    audience_digest: "a".repeat(64),
    principal_id: "subject-1",
    purpose: "knowledge",
    policy_epoch: 1,
    controller_generation: 1,
  },
  image = "sha256:" + "b".repeat(64);
function info() {
  return {
    Image: image,
    Config: {
      User: "node",
      Labels: {
        "dev.aksara.binding": computerIdentity(binding),
        "mastra.sandbox.id": computerIdentity(binding),
      },
    },
    HostConfig: {
      NetworkMode: "none",
      Privileged: false,
      ReadonlyRootfs: true,
      CapDrop: ["ALL"],
      CapAdd: [],
      SecurityOpt: ["no-new-privileges:true"],
      Memory: COMPUTER_LIMITS.memory,
      MemorySwap: COMPUTER_LIMITS.memorySwap,
      CpuQuota: COMPUTER_LIMITS.cpuQuota,
      CpuPeriod: COMPUTER_LIMITS.cpuPeriod,
      PidsLimit: COMPUTER_LIMITS.pidsLimit,
    },
    Mounts: [],
  };
}
test("computer identities separate private/shared custody, audience epochs and takeover generations", () => {
  assert.equal(
    ComputerBinding.safeParse({ ...binding, ownerFallback: true }).success,
    false,
  );
  const base = computerIdentity(binding);
  for (const changed of [
    { lane_id: "shared-1" },
    { institution_id: "personal-1" },
    { audience_digest: "c".repeat(64) },
    { policy_epoch: 2 },
    { controller_generation: 2 },
    { purpose: "operations" },
  ])
    assert.notEqual(computerIdentity({ ...binding, ...changed }), base);
  assert.throws(() => new MastraComputerPort({ binding, image }));
  assert.throws(
    () =>
      new MastraComputerPort({
        binding,
        image: "node:latest",
        authority: { assertCurrent() {} },
      }),
  );
});
test("existing containers must match isolation; labels alone never prove a safe computer", () => {
  const expected = { id: computerIdentity(binding), binding, image };
  assertComputerIsolation(info(), expected);
  for (const mutate of [
    (i) => (i.Image = "foreign"),
    (i) => (i.Config.User = "root"),
    (i) => (i.HostConfig.Privileged = true),
    (i) => (i.HostConfig.ReadonlyRootfs = false),
    (i) => (i.HostConfig.NetworkMode = "host"),
    (i) => (i.HostConfig.CapDrop = []),
    (i) => (i.HostConfig.CapAdd = ["SYS_ADMIN"]),
    (i) => (i.HostConfig.SecurityOpt = []),
    (i) => (i.HostConfig.Memory = 0),
    (i) => (i.Mounts = [{ Type: "bind", Source: "/host" }]),
  ]) {
    const unsafe = info();
    mutate(unsafe);
    assert.throws(() => assertComputerIsolation(unsafe, expected));
  }
});
test("stale authority is denied before a computer provider is touched", async () => {
  let touched = false;
  class FakeDocker {
    listContainers() {
      touched = true;
      throw Error("must not reach provider");
    }
  }
  class FakeSandbox {
    __setLogger() {}
    start() {
      touched = true;
    }
  }
  const port = new MastraComputerPort({
    binding,
    image,
    authority: {
      assertCurrent() {
        throw Error("Stale work generation");
      },
    },
    DockerImpl: FakeDocker,
    SandboxImpl: FakeSandbox,
  });
  await assert.rejects(port.start(), /Stale work generation/);
  await assert.rejects(port.observe(), /Stale work generation/);
  assert.equal(touched, false);
});
test(
  "real Mastra Docker provider starts an isolated non-root observation computer",
  { skip: !process.env.AKSARA_DOCKER_TEST_IMAGE, timeout: 30000 },
  async () => {
    const binding = {
      institution_id: "qualification-" + crypto.randomUUID(),
      lane_id: "synthetic-only",
      audience_digest: "d".repeat(64),
      principal_id: "subject-1",
      purpose: "knowledge",
      policy_epoch: 1,
      controller_generation: 1,
    };
    const port = new MastraComputerPort({
      binding,
      image: process.env.AKSARA_DOCKER_TEST_IMAGE,
      authority: {
        assertCurrent({ binding: current }) {
          assert.deepEqual(current, binding);
        },
      },
    });
    let started = false;
    try {
      await port.start();
      started = true;
      const snapshot = await port.observe();
      assert.equal(snapshot.state, "running");
      assert.equal(snapshot.network, "disabled");
      assert.equal(snapshot.commands, "disabled");
      assert.deepEqual(snapshot.entries, []);
    } finally {
      if (started) await port.stop();
    }
  },
);
