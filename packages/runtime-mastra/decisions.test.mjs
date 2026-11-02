import { test } from "node:test";
import assert from "node:assert/strict";
import { createDecisionPort, assessMemoryReview } from "./decisions.mjs";
test("decision model scores cannot make private memory public, and malformed outputs abstain", async () => {
  const ordinary = createDecisionPort(async () => ({
    probabilities: { sensitive: 0, ordinary: 1, abstain: 0 },
    visibility: "public",
    tool: "publish",
  }));
  const result = await assessMemoryReview(ordinary, {
    visibility: "private",
    eligibleState: { text: "synthetic" },
  });
  assert.equal(result.visibility, "private");
  assert.equal(result.review_required, true);
  assert.equal(result.assessment.decision, "ordinary");
  const invalid = createDecisionPort(async () => ({
    probabilities: { sensitive: NaN, ordinary: 1, abstain: 0 },
  }));
  assert.equal(
    (await invalid({ use: "privacy_review", state: {} })).decision,
    "abstain",
  );
  assert.equal(
    (await createDecisionPort()({ use: "task_complexity", state: {} }))
      .decision,
    "abstain",
  );
});
