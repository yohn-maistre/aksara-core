import { test } from "node:test";
import assert from "node:assert/strict";
import { NativeDesktopPort } from "./desktop.mjs";
test("desktop port binds process identity and fresh refs; journals before invocation and preserves unverified delivery", async () => {
  const commands = [],
    order = [];
  let instance = "instance-1",
    allowed = true;
  const binding = {
    id: "computer_test",
    app: "Fixture",
    window_id: "w-1",
    pid: 123,
    process_instance: instance,
    allow_headed: false,
  };
  const port = new NativeDesktopPort({
    binary: process.execPath,
    stateRoot: process.cwd(),
    execute: async (_binary, args, opts) => {
      assert.equal(opts.shell, false);
      commands.push(args);
      const data =
        args[0] === "list-windows"
          ? [
              {
                accessible: true,
                visible: true,
                app_name: "Fixture",
                id: "w-1",
                pid: 123,
                process_instance: instance,
              },
            ]
          : args[0] === "snapshot"
            ? {
                complete: true,
                snapshot_id: "s1",
                tree: {
                  role: "window",
                  children: [
                    { role: "button", name: "Save", ref_id: "@s1:e1" },
                    {
                      role: "password",
                      value: "PRIVATE_PASSWORD",
                      ref_id: "@s1:e2",
                    },
                  ],
                },
              }
            : {
                disposition: {
                  delivery: "delivered_unverified",
                  retry: "unsafe",
                },
              };
      if (args[0] === "click") order.push("invoke");
      return { stdout: JSON.stringify({ version: "2.5", ok: true, data }) };
    },
  });
  const assertCurrent = async () => {
    if (!allowed) throw new Error("Revoked");
  };
  const hooks = {
    assertCurrent,
    intent: async () => {
      order.push("intent");
      return { id: "intent-1" };
    },
    receipt: async (_intent, result) => {
      order.push("receipt");
      assert.equal(result.data.disposition.delivery, "delivered_unverified");
    },
  };
  await assert.rejects(
    port.act(binding, { operation: "click", ref: "@s1:e1" }, hooks),
  );
  const observation = await port.observe(binding, assertCurrent);
  assert.ok(!JSON.stringify(observation).includes("PRIVATE_PASSWORD"));
  await assert.rejects(
    port.act(binding, { operation: "click", ref: "@s1:e2" }, hooks),
  );
  await port.act(binding, { operation: "click", ref: "@s1:e1" }, hooks);
  assert.deepEqual(order, ["intent", "invoke", "receipt"]);
  await assert.rejects(
    port.act(binding, { operation: "click", ref: "@s1:e1" }, hooks),
  );
  await port.observe(binding, assertCurrent);
  instance = "reused-pid-new-instance";
  await assert.rejects(
    port.act(binding, { operation: "click", ref: "@s1:e1" }, hooks),
  );
  allowed = false;
  await assert.rejects(port.observe(binding, assertCurrent));
  assert.equal(commands.filter((args) => args[0] === "click").length, 1);
});
