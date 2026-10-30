import { createHash } from "node:crypto";
import { ChannelMessage, ChannelBinding } from "@aksara/contracts";
const denied = () => new Error("Channel admission unavailable");
/** Hermes-inspired separation of transport coordinates, sender, thread and
 * delivery identity. No donor session DB, owner fallback, auto-send or auth pool.
 * The injected admit operation MUST atomically deduplicate and revalidate in
 * Rust; this port is not connected to a live messaging service yet. */
export function createChannelIngress({
  verifyTransport,
  resolveBinding,
  assertCurrent,
  admit,
} = {}) {
  if (
    [verifyTransport, resolveBinding, assertCurrent, admit].some(
      (fn) => typeof fn !== "function",
    )
  )
    throw denied();
  return {
    async receive(input) {
      const message = ChannelMessage.parse(input);
      if ((await verifyTransport(message)) !== true) throw denied();
      const coordinates = {
        provider: message.provider,
        account: message.account,
        channel: message.channel,
        thread: message.thread,
        sender: message.sender,
      };
      const binding = ChannelBinding.parse(await resolveBinding(coordinates));
      const digest = (value) =>
        createHash("sha256").update(JSON.stringify(value)).digest("hex");
      // Transport identity is stable across redelivery; changed content is an
      // idempotency conflict for canonical admission, not a second user message.
      const idempotency_key = digest([coordinates, message.message_id]);
      const content_digest = digest(message);
      await assertCurrent(binding, coordinates);
      return admit({ message, binding, idempotency_key, content_digest });
    },
  };
}
