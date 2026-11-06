import { z } from "zod/v4";
export const MemoryRecallQuery = z
  .object({
    query: z.string().max(1000).default(""),
    mode: z
      .enum(["strict", "associative", "historical"])
      .default("associative"),
    limit: z.number().int().min(1).max(20).default(8),
  })
  .strict();
