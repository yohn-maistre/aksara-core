export type ResourceComponent =
  | "WorkList"
  | "SourceList"
  | "DocumentPreview"
  | "ProgressStatus";
export type ResourcePlan = {
  protocol: "aksara.resource-surface/1";
  component: ResourceComponent;
  title: string;
  ids: string[];
};
export function parseSurfaceProgram(
  raw: string,
): { component: string; args: unknown[]; program: string } | null;
export const ResourceSurfacePlan: import("zod/v4").ZodType<ResourcePlan>;
