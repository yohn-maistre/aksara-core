import { createHash } from "node:crypto";
import { create_memory } from "./vendor/longmemory.mjs";

export const MEMORY_ENGINE = Object.freeze({
  id: "longmemory",
  version: "8badf44",
  profile: "embedded-authorized-projection",
  persistence: "canonical-rust-sqlite",
  external_inference: false,
});
const unavailable = () => new Error("Memory unavailable in this context");
const digest = (v) =>
  createHash("sha256").update(JSON.stringify(v)).digest("hex");
const ref = (v) => typeof v === "string" && /^[A-Za-z0-9._:-]{1,100}$/.test(v);

/** The loader is the authority seam, not an agent-provided dataset. Every query
 * takes a fresh authorized projection, indexes only that partition, then checks
 * it again before returning anything. No corpus-wide search followed by redact.
 * Graphs are bounded/disposable; originals and all learning records persist in
 * Rust. There is no second user database, provider key discovery or model call.
 */
export function createMemoryService({ load } = {}) {
  if (typeof load !== "function") throw unavailable();
  const active = new Set();
  let closed = false;
  const normalize = (view) => {
    const s = view?.scope;
    if (
      view?.protocol !== "aksara.memory/1" ||
      !s ||
      ![s.institution_id, s.principal_id, s.lane_id, s.purpose].every(
        (v) => typeof v === "string" && v.length > 0 && v.length <= 256,
      ) ||
      !Number.isInteger(s.policy_epoch) ||
      !Array.isArray(view.reviewed) ||
      !Array.isArray(view.drafts)
    )
      throw unavailable();
    const records = [];
    for (const m of view.reviewed) {
      if (
        !ref(m.id) ||
        !ref(m.source_artifact_id) ||
        m.state !== "APPROVED" ||
        typeof m.text !== "string"
      )
        throw unavailable();
      records.push({
        id: `reviewed:${m.id}`,
        source_id: m.source_artifact_id,
        memory_id: m.id,
        title: "Reviewed knowledge",
        kind: "reviewed",
        review: "reviewed excerpt",
        text: m.text.slice(0, 12_000),
        recorded_at: 0,
      });
    }
    for (const d of view.drafts) {
      const a = d.artifact;
      if (
        !ref(a?.id) ||
        typeof a.title !== "string" ||
        typeof d.excerpt !== "string" ||
        !["wiki", "person", "procedure", "episode"].includes(d.kind)
      )
        throw unavailable();
      records.push({
        id: `draft:${a.id}`,
        source_id: a.id,
        title: a.title,
        kind: d.kind,
        review: "unreviewed working material",
        text: d.excerpt.slice(0, 12_000),
        recorded_at: Number.isFinite(a.created_at) ? a.created_at : 0,
        truncated: !!d.truncated,
      });
    }
    if (
      records.length > 100 ||
      new Set(records.map((r) => r.id)).size !== records.length
    )
      throw unavailable();
    records.sort((a, b) => a.id.localeCompare(b.id));
    return { scope: s, records };
  };
  const snapshot = async () => {
    if (closed) throw unavailable();
    const value = normalize(await load());
    return { ...value, key: digest(value) };
  };
  return {
    async recall({ query = "", mode = "associative", limit = 8 } = {}) {
      if (
        typeof query !== "string" ||
        query.length > 1000 ||
        !["strict", "associative", "historical"].includes(mode) ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 20
      )
        throw unavailable();
      try {
        const before = await snapshot();
        let selected = before.records;
        if (query.trim() && selected.length) {
          if (active.size >= 3) throw unavailable();
          const engine = create_memory({
            store: "memory",
            tenant_id: before.scope.institution_id,
            user_id: before.scope.principal_id,
            default_world: before.key,
            max_context_tokens: 2048,
            embedding_dimension: 128,
            embedding_cache_size: 256,
            enable_translation: false,
            enable_consolidation: false,
            enable_cold_log: false,
          });
          active.add(engine);
          let response;
          try {
            let worldId;
            for (const r of before.records) {
              const ingested = await engine.ingest({
                id: r.id,
                user_id: before.scope.principal_id,
                world: before.key,
                text: r.text,
                source_ref: r.source_id,
                at: r.recorded_at || Date.now(),
                conflict_behavior: "none",
                metadata: {
                  source_id: r.source_id,
                  record_id: r.id,
                  review: r.review,
                  kind: r.kind,
                },
              });
              worldId = ingested.node.world.world_id;
            }
            response = await engine.recall({
              text: query.trim(),
              mode,
              world_id: worldId,
              k: limit,
              token_budget: 2048,
            });
          } finally {
            await engine.close();
            active.delete(engine);
          }
          const ids = (response.context?.items ?? response.items ?? []).map(
            (n) => n.node?.id ?? n.id,
          );
          const byId = new Map(before.records.map((r) => [r.id, r]));
          selected = [...new Set(ids)]
            .map((id) => byId.get(id))
            .filter(Boolean);
        }
        const after = await snapshot();
        if (after.key !== before.key) throw unavailable();
        // Return original authorized text, never silently promote the donor's
        // heuristic claims/emotions/entities into institutional facts.
        let remaining = 12_000;
        const results = [];
        for (const r of selected.slice(0, limit)) {
          if (remaining <= 0) break;
          const text = r.text.slice(0, remaining);
          remaining -= text.length;
          results.push({
            ...r,
            text,
            truncated: !!r.truncated || text.length < r.text.length,
          });
        }
        return {
          protocol: "aksara.memory-view/1",
          engine: MEMORY_ENGINE,
          scope: after.scope,
          query,
          mode,
          results,
          indexed_records: before.records.length,
          bounded_projection: true,
          public_release_enabled: false,
        };
      } catch {
        throw unavailable();
      }
    },
    async close() {
      closed = true;
      await Promise.allSettled([...active].map((g) => g.close()));
      active.clear();
    },
  };
}
