import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveResourceSurface } from "./surfaces.mjs";
const plan = {
  protocol: "aksara.resource-surface/1",
  component: "WorkList",
  title: "Current work",
  ids: ["work-1"],
};
test("resource surfaces only resolve eligible host data and never manufacture progress", async () => {
  const result = await resolveResourceSurface(
    { ...plan, component: "ProgressStatus" },
    {
      scope: "current",
      now: () => 100,
      assertCurrent() {},
      read: async (op) => {
        assert.equal(op, "threads");
        return [
          {
            id: "work-1",
            request: "Actual request",
            state: "WORKING",
            revision: 3,
            generation: 2,
          },
        ];
      },
    },
  );
  assert.equal(result.resources[0].title, "Actual request");
  assert.equal(result.expires_at, 10100);
  assert.equal(result.scope_ref, "current");
  assert.equal(result.resources[0].percent, undefined);
  await assert.rejects(
    resolveResourceSurface(plan, { read: async () => [], assertCurrent() {} }),
    { status: 404 },
  );
});
test("scope changes during reads discard resource results", async () => {
  let changed = false;
  await assert.rejects(
    resolveResourceSurface(plan, {
      scope: "old",
      read: async () => {
        changed = true;
        return [{ id: "work-1" }];
      },
      assertCurrent() {
        if (changed)
          throw Object.assign(new Error("Scope changed"), { status: 409 });
      },
    }),
    { status: 409 },
  );
});
test("document previews re-read authority, preserve truncation truth, and reject executable plans", async () => {
  let allowed = true,
    calls = 0;
  const read = async (op, query) => {
    calls++;
    assert.equal(op, "artifact");
    assert.equal(query, "?id=source-1");
    if (!allowed)
      throw Object.assign(new Error("Unavailable"), { status: 404 });
    return {
      artifact: { id: "source-1", title: "Original" },
      content: "x".repeat(50001),
    };
  };
  const input = { ...plan, component: "DocumentPreview", ids: ["source-1"] };
  const result = await resolveResourceSurface(input, {
    read,
    assertCurrent() {},
  });
  assert.equal(result.resources[0].truncated, true);
  assert.equal(result.resources[0].content.length, 50000);
  allowed = false;
  await assert.rejects(
    resolveResourceSurface(input, { read, assertCurrent() {} }),
    { status: 404 },
  );
  assert.equal(calls, 2);
  for (const invalid of [
    { ...input, url: "https://evil.test" },
    { ...input, ids: ["https://evil.test"] },
    { ...input, component: "ExecuteTool" },
    { ...input, ids: ["source-1", "source-2"] },
  ])
    await assert.rejects(resolveResourceSurface(invalid, {}), { status: 400 });
});
