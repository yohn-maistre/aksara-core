import { z } from "zod/v4";
const key = z.string().regex(/^[a-zA-Z0-9_-]{1,40}$/);
const label = z.string().min(1).max(120);
export const VisualSpec = z.discriminatedUnion("kind", [
  z
    .object({
      protocol: z.literal("aksara.visual/1"),
      kind: z.literal("diagram"),
      nodes: z
        .array(
          z
            .object({
              id: key,
              label,
              x: z.number().finite().min(0).max(1600),
              y: z.number().finite().min(0).max(1600),
              shape: z
                .enum(["rectangle", "ellipse", "diamond"])
                .default("rectangle"),
            })
            .strict(),
        )
        .min(1)
        .max(30),
      edges: z
        .array(
          z.object({ from: key, to: key, label: label.optional() }).strict(),
        )
        .max(60),
    })
    .strict()
    .superRefine((v, c) => {
      const ids = new Set(v.nodes.map((n) => n.id));
      if (
        ids.size !== v.nodes.length ||
        v.edges.some((e) => !ids.has(e.from) || !ids.has(e.to))
      )
        c.addIssue({
          code: "custom",
          message: "Diagram references must identify unique existing nodes",
        });
    }),
  z
    .object({
      protocol: z.literal("aksara.visual/1"),
      kind: z.literal("bar-chart"),
      unit: z.string().max(40).default(""),
      data: z
        .array(
          z
            .object({ label, value: z.number().finite().min(0).max(1e12) })
            .strict(),
        )
        .min(1)
        .max(30),
    })
    .strict(),
]);
export function parseVisual(text) {
  try {
    return VisualSpec.parse(JSON.parse(text));
  } catch {
    return null;
  }
}
