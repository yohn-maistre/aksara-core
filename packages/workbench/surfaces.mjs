import { ResourceSurfacePlan } from "../contracts/surfaces.mjs";
const unavailable = () =>
  Object.assign(new Error("Resource unavailable in this context"), {
    status: 404,
  });
/** Read-only host port. kernel must enforce current principal/lane/purpose and
 * transitive source eligibility; a plan is never a grant or an execution path. */
export async function resolveResourceSurface(
  input,
  { read, assertCurrent, scope, now = Date.now },
) {
  const parsed = ResourceSurfacePlan.safeParse(input);
  if (!parsed.success)
    throw Object.assign(new Error("Invalid resource surface"), { status: 400 });
  const plan = parsed.data;
  const eligibleRead = async (...args) => {
    try {
      return await read(...args);
    } catch (error) {
      if (error.status === 403 || error.status === 404) throw unavailable();
      throw error;
    }
  };
  let resources;
  if (plan.component === "DocumentPreview") {
    const a = await eligibleRead(
      "artifact",
      `?id=${encodeURIComponent(plan.ids[0])}`,
    );
    assertCurrent();
    if (!a?.artifact || a.artifact.id !== plan.ids[0]) throw unavailable();
    const content = String(a.content ?? "");
    resources = [
      {
        id: a.artifact.id,
        title: a.artifact.title,
        content: content.slice(0, 50000),
        truncated: content.length > 50000,
      },
    ];
  } else {
    const works = plan.component !== "SourceList";
    const eligible = await eligibleRead(works ? "threads" : "library");
    assertCurrent();
    resources = plan.ids.map((id) => {
      const resource = eligible.find((r) => r.id === id);
      if (!resource) throw unavailable();
      return works
        ? {
            id: resource.id,
            title: resource.request,
            state: resource.state,
            revision: resource.revision,
            generation: resource.generation,
          }
        : {
            id: resource.id,
            title: resource.title,
            visibility: resource.visibility,
            bytes: resource.bytes,
          };
    });
  }
  assertCurrent();
  return {
    protocol: "aksara.resolved-surface/1",
    component: plan.component,
    title: plan.title,
    scope_ref: scope,
    expires_at: now() + 10000,
    resources,
  };
}
