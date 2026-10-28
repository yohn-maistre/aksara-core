import { z } from "zod/v4";
const identifier = z.string().regex(/^[a-z][a-z0-9._-]{1,79}$/);
// Manifests describe a request surface. They are never grants or executable plugin code.
export const PackManifest = z
  .object({
    protocol: z.literal("aksara.pack/1"),
    id: identifier,
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    title: z.string().min(1).max(100),
    license: z.string().min(1).max(80),
    trust: z.literal("bundled-first-party"),
    screens: z
      .array(
        z
          .object({
            id: identifier,
            slot: z.enum(["today", "conversation", "library"]),
            components: z
              .array(z.enum(["EvidenceCard", "MetricCard"]))
              .min(1)
              .max(8),
          })
          .strict(),
      )
      .max(12),
    capabilities: z
      .array(z.enum(["library.lookup", "artifact.create", "device.indicate"]))
      .max(12),
  })
  .strict();
export function validatePack(input) {
  return PackManifest.parse(input);
}
export const SurfaceEnvelope = z
  .object({
    protocol: z.literal("aksara.surface/1"),
    id: identifier,
    pack_id: identifier,
    scope_ref: z.string().min(1).max(256),
    source_ids: z.array(z.string().max(100)).max(50),
    revision: z.number().int().positive(),
    expires_at: z.number().int().positive(),
    language: z.literal("openui-text-cards/1"),
    program: z.string().max(7000),
  })
  .strict();
// These are proposal envelopes for adapter authors, not claims that execution exists.
export const ComputerIntent = z
  .object({
    protocol: z.literal("aksara.computer-intent/1"),
    work_id: identifier,
    lane_id: identifier,
    session_id: identifier,
    controller_generation: z.number().int().positive(),
    work_revision: z.number().int().positive(),
    work_generation: z.number().int().positive(),
    capability: z.enum(["computer.observe", "computer.propose"]),
    idempotency_key: z.string().min(1).max(128),
    args_digest: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
export const PublicationDraft = z
  .object({
    protocol: z.literal("aksara.publication-draft/1"),
    artifact_id: identifier,
    destination: z.literal("ruara"),
    format: z.literal("public-text"),
    sharing_grant_id: identifier,
    source_projection_digest: z.string().regex(/^[a-f0-9]{64}$/),
    correction_of: identifier.optional(),
  })
  .strict();
