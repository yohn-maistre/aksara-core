/** Optional System-One adapter. Input is already eligible under host policy.
 * Scores advise cognition; they cannot authorize disclosure, tools or effects. */
export const DECISION_USES = Object.freeze({
  task_complexity: ["light", "deliberate", "abstain"],
  memory_relevance: ["relevant", "irrelevant", "abstain"],
  notification_value: ["surface", "quiet", "abstain"],
  privacy_review: ["sensitive", "ordinary", "abstain"],
});
export function createDecisionPort(infer) {
  return async ({ use, state, signal }) => {
    if (!Object.hasOwn(DECISION_USES, use))
      throw Error("Unsupported decision purpose");
    const options = DECISION_USES[use];
    if (!infer) return { decision: "abstain", confidence: 0, advisory: true };
    const payload = JSON.stringify(state);
    if (Buffer.byteLength(payload) > 16384)
      throw Error("Decision state exceeds budget");
    try {
      const result = await infer({ use, state, options, signal });
      const probabilities = options.map((id) => result?.probabilities?.[id]);
      if (probabilities.some((p) => !Number.isFinite(p) || p < 0 || p > 1))
        throw Error("Invalid probabilities");
      const total = probabilities.reduce((a, b) => a + b, 0);
      if (Math.abs(total - 1) > 0.01)
        throw Error("Invalid probability distribution");
      const index = probabilities.indexOf(Math.max(...probabilities));
      return {
        decision: options[index],
        confidence: probabilities[index],
        advisory: true,
      };
    } catch {
      return { decision: "abstain", confidence: 0, advisory: true };
    }
  };
}
/** A model can flag a review; it cannot promote a memory to another audience. */
export async function assessMemoryReview(
  decide,
  { visibility, eligibleState, signal },
) {
  const assessment = await decide({
    use: "privacy_review",
    state: eligibleState,
    signal,
  });
  return { visibility, review_required: true, assessment };
}
