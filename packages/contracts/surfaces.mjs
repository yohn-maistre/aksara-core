import { z } from "zod/v4";
const resourceId = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[A-Za-z0-9._:-]+$/);
export const ResourceSurfacePlan = z
  .object({
    protocol: z.literal("aksara.resource-surface/1"),
    component: z.enum([
      "WorkList",
      "SourceList",
      "DocumentPreview",
      "ProgressStatus",
    ]),
    title: z.string().min(1).max(160),
    ids: z
      .array(resourceId)
      .min(1)
      .max(12)
      .refine((ids) => new Set(ids).size === ids.length, "Duplicate resources"),
  })
  .strict()
  .refine(
    (p) => p.component !== "DocumentPreview" || p.ids.length === 1,
    "Document previews need one resource",
  );
// JSON literal arguments only: no variable lookup, nesting, expressions, URLs,
// Query/Mutation, executable HTML, or action identifiers supplied by a model.
export function parseSurfaceProgram(raw) {
  if (typeof raw !== "string" || raw.length > 7000) return null;
  const match = raw
    .trim()
    .match(
      /^root\s*=\s*(EvidenceCard|MetricCard|WorkList|SourceList|DocumentPreview|ProgressStatus)\(([\s\S]*)\)\s*;?$/,
    );
  if (!match) return null;
  try {
    const args = JSON.parse(`[${match[2]}]`),
      component = match[1];
    if (component === "EvidenceCard" || component === "MetricCard") {
      const limits =
        component === "EvidenceCard" ? [160, 4000] : [160, 80, 1000];
      if (
        args.length !== limits.length ||
        args.some((v, i) => typeof v !== "string" || v.length > limits[i])
      )
        return null;
    } else {
      if (args.length !== 2) return null;
      if (
        !ResourceSurfacePlan.safeParse({
          protocol: "aksara.resource-surface/1",
          component,
          title: args[0],
          ids: args[1],
        }).success
      )
        return null;
    }
    return {
      component,
      args,
      program: `root = ${component}(${args.map((v) => JSON.stringify(v)).join(", ")})`,
    };
  } catch {
    return null;
  }
}
