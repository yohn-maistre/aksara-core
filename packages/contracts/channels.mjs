import { z } from "zod/v4";
const reference = z.string().min(1).max(256);
/** Transport-authenticated messages still need current Rust identity/lane admission.
 * Provider account/chat/thread IDs are routing coordinates, never principals. */
export const ChannelMessage = z
  .object({
    protocol: z.literal("aksara.channel-message/1"),
    provider: z.enum(["telegram", "discord", "slack"]),
    account: reference,
    channel: reference,
    thread: reference.nullable(),
    sender: reference,
    message_id: reference,
    text: z.string().min(1).max(16000),
  })
  .strict();
export const ChannelBinding = z
  .object({
    institution_id: reference,
    principal_id: reference,
    lane_id: reference,
    purpose: z.string().min(1).max(80),
    policy_epoch: z.number().int().positive(),
    audience_digest: z.string().regex(/^[a-f0-9]{64}$/),
    generation: z.number().int().positive(),
  })
  .strict();
