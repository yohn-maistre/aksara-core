import { test } from "node:test";
import assert from "node:assert/strict";
import { createChannelIngress } from "./channels.mjs";
test("external channel coordinates never supply authority; every redelivery rebinds and revalidates", async () => {
  const event = {
    protocol: "aksara.channel-message/1",
    provider: "telegram",
    account: "bot-a",
    channel: "chat-a",
    thread: "topic-a",
    sender: "sender-a",
    message_id: "42",
    text: "Synthetic request",
  };
  const binding = {
    institution_id: "institution",
    principal_id: "principal",
    lane_id: "lane",
    purpose: "knowledge",
    policy_epoch: 1,
    audience_digest: "a".repeat(64),
    generation: 1,
  };
  let live = true,
    verified = true,
    lookups = 0,
    admissions = 0;
  const seen = new Map();
  const port = createChannelIngress({
    verifyTransport: async () => verified,
    resolveBinding: async (coordinates) => {
      lookups++;
      assert.equal(coordinates.sender, "sender-a");
      return binding;
    },
    assertCurrent: async () => {
      if (!live) throw new Error("revoked");
    },
    admit: async (input) => {
      const old = seen.get(input.idempotency_key);
      if (old && old !== input.content_digest)
        throw new Error("idempotency conflict");
      if (!old) {
        admissions++;
        seen.set(input.idempotency_key, input.content_digest);
      }
      return { duplicate: !!old };
    },
  });
  assert.equal((await port.receive(event)).duplicate, false);
  assert.equal((await port.receive(event)).duplicate, true);
  assert.equal(lookups, 2);
  assert.equal(admissions, 1);
  await assert.rejects(port.receive({ ...event, principal_id: "operator" }));
  await assert.rejects(port.receive({ ...event, text: "Changed replay" }));
  live = false;
  await assert.rejects(port.receive(event));
  live = true;
  verified = false;
  await assert.rejects(port.receive(event));
  assert.throws(() => createChannelIngress({}));
});
