use aksara_core_types::*;
use aksara_kernel::*;
use serde_json::{json, Value};
use tempfile::TempDir;

struct Fixture {
    dir: TempDir,
    k: Kernel,
    dev: Value,
}
impl Fixture {
    fn new() -> Self {
        let dir = TempDir::new().unwrap();
        let mut k = Kernel::open(&dir.path().join("state.sqlite")).unwrap();
        let dev = k.init_dev().unwrap();
        Self { dir, k, dev }
    }
    fn token(&self, n: usize) -> &str {
        self.dev["people"][n]["token"].as_str().unwrap()
    }
    fn lane(&self, n: usize) -> &str {
        self.dev["lanes"][n]["lane"]["id"].as_str().unwrap()
    }
    fn ctx(&self, n: usize, l: usize) -> AccessContext {
        self.k
            .context(self.token(n), self.lane(l), "knowledge")
            .unwrap()
    }
    fn source(&mut self, ctx: &AccessContext, visibility: Visibility, text: &str) -> Artifact {
        self.k
            .ingest(
                ctx,
                &IngestRequest {
                    title: "Evidence".into(),
                    content: text.into(),
                    visibility,
                    purpose: "knowledge".into(),
                    provenance: "fixture".into(),
                },
            )
            .unwrap()
    }
    fn work(&mut self, ctx: &AccessContext) -> WorkObject {
        self.k
            .delegate(
                ctx,
                &DelegateRequest {
                    request: "Find water continuity".into(),
                    idempotency_key: new_id("request"),
                },
            )
            .unwrap()
    }
    fn req(&self, w: &WorkObject) -> CapabilityRequest {
        CapabilityRequest {
            work_id: w.id.clone(),
            revision: w.revision,
            generation: w.generation,
            idempotency_key: "effect-key".into(),
            capability: "artifact.create".into(),
            args: json!({"title":"Result","content":"Reviewed result","visibility":"institution","source_ids":[]}),
        }
    }
}

#[test]
fn private_source_never_enters_shared_search() {
    let mut f = Fixture::new();
    let private = f.ctx(1, 2);
    f.source(&private, Visibility::Private, "SECRETSEED patient Alice");
    assert_eq!(f.k.search(&private, "SECRETSEED", 5).unwrap().len(), 1);
    assert!(f
        .k
        .search(&f.ctx(1, 0), "SECRETSEED", 5)
        .unwrap()
        .is_empty());
    assert!(f
        .k
        .search(&f.ctx(2, 3), "SECRETSEED", 5)
        .unwrap()
        .is_empty());
}
#[test]
fn private_sources_do_not_change_shared_ranking() {
    let mut f = Fixture::new();
    let shared = f.ctx(1, 0);
    f.source(
        &shared,
        Visibility::Institution,
        "water continuity water plan",
    );
    let before = f.k.search(&shared, "water", 5).unwrap();
    let private = f.ctx(1, 2);
    f.source(&private, Visibility::Private, &"water private ".repeat(500));
    let after = f.k.search(&shared, "water", 5).unwrap();
    assert_eq!(json!(before), json!(after));
}
#[test]
fn callers_cannot_forge_a_smaller_audience_in_access_context() {
    let mut f = Fixture::new();
    let private = f.ctx(1, 2);
    f.source(&private, Visibility::Private, "private secret");
    let mut forged = f.ctx(1, 0);
    forged.lane.audience = vec![forged.actor.id.clone()];
    assert!(f.k.search(&forged, "secret", 5).is_err());
}
#[test]
fn purpose_is_enforced_and_institution_is_checked() {
    let mut f = Fixture::new();
    let ctx = f.ctx(1, 0);
    f.source(&ctx, Visibility::Institution, "water plan");
    let mut work = ctx.clone();
    work.purpose = "work".into();
    assert!(f.k.search(&work, "water", 5).unwrap().is_empty());
    let mut forged = ctx;
    forged.institution_id = "other".into();
    assert!(f.k.search(&forged, "water", 5).is_err());
}
#[test]
fn identity_binding_collision_cannot_rebind() {
    let mut f = Fixture::new();
    let operator = f.ctx(0, 0);
    let maria = f.ctx(1, 0).actor.id;
    f.k.bind_identity(&operator, "telegram", "office", "same-subject", &maria)
        .unwrap();
    assert_eq!(
        f.k.resolve_binding("telegram", "office", "same-subject")
            .unwrap()
            .id,
        maria
    );
    assert!(f
        .k
        .bind_identity(
            &operator,
            "telegram",
            "office",
            "same-subject",
            &f.ctx(2, 0).actor.id
        )
        .is_err());
}
#[test]
fn delegation_dedupes_and_conflicting_payload_is_rejected() {
    let mut f = Fixture::new();
    let ctx = f.ctx(1, 0);
    let a = DelegateRequest {
        request: "water".into(),
        idempotency_key: "one".into(),
    };
    let w = f.k.delegate(&ctx, &a).unwrap();
    assert_eq!(w.id, f.k.delegate(&ctx, &a).unwrap().id);
    assert!(f
        .k
        .delegate(
            &ctx,
            &DelegateRequest {
                request: "changed".into(),
                ..a
            }
        )
        .is_err());
}
#[test]
fn exact_approval_and_atomic_local_receipt() {
    let mut f = Fixture::new();
    let ctx = f.ctx(1, 0);
    let op = f.ctx(0, 0);
    let w = f.work(&ctx);
    let request = f.req(&w);
    let p = f.k.prepare(&ctx, &request).unwrap();
    assert!(f.k.execute_local(&ctx, &p.id, "forged").is_err());
    assert!(f.k.approve(&ctx, &p.id, &p.args_hash).is_err());
    assert!(f.k.approve(&op, &p.id, "wrong-hash").is_err());
    let a = f.k.approve(&op, &p.id, &p.args_hash).unwrap();
    let a2 = f.k.approve(&op, &p.id, &p.args_hash).unwrap();
    assert_eq!(a.lease, a2.lease);
    let r =
        f.k.execute_local(&ctx, &p.id, a.lease.as_ref().unwrap())
            .unwrap();
    let r2 =
        f.k.execute_local(&ctx, &p.id, a.lease.as_ref().unwrap())
            .unwrap();
    assert_eq!(r.id, r2.id);
    assert_eq!(f.k.work(&ctx, &w.id).unwrap().state, WorkState::Completed);
    assert_eq!(f.k.search(&ctx, "Reviewed", 5).unwrap().len(), 1);
    f.k.integrity().unwrap();
}
#[test]
fn changed_effect_arguments_conflict() {
    let mut f = Fixture::new();
    let ctx = f.ctx(1, 0);
    let w = f.work(&ctx);
    let mut request = f.req(&w);
    f.k.prepare(&ctx, &request).unwrap();
    request.args["content"] = json!("different");
    assert!(f.k.prepare(&ctx, &request).is_err());
}
#[test]
fn steering_and_cancellation_fence_old_effects() {
    for cancel in [false, true] {
        let mut f = Fixture::new();
        let ctx = f.ctx(1, 0);
        let op = f.ctx(0, 0);
        let w = f.work(&ctx);
        let request = f.req(&w);
        let p = f.k.prepare(&ctx, &request).unwrap();
        let a = f.k.approve(&op, &p.id, &p.args_hash).unwrap();
        if cancel {
            f.k.cancel(&ctx, &w.id).unwrap();
        } else {
            f.k.steer(&ctx, &w.id, w.revision, "new direction").unwrap();
        }
        assert!(f
            .k
            .execute_local(&ctx, &p.id, a.lease.as_ref().unwrap())
            .is_err());
        assert!(f
            .k
            .attach_runtime(&ctx, &w.id, w.revision, w.generation, "late-pi")
            .is_err());
    }
}
#[test]
fn expanding_lane_cannot_disclose_historical_work() {
    let mut f = Fixture::new();
    let original = f.ctx(0, 1);
    let w = f.work(&original);
    let mut audience = original.lane.audience.clone();
    audience.push(f.ctx(1, 0).actor.id);
    f.k.set_audience(&original, audience).unwrap();
    let new_ctx = f.k.context(f.token(1), f.lane(1), "knowledge").unwrap();
    assert!(f.k.work(&new_ctx, &w.id).is_err());
    assert!(f.k.works(&new_ctx).unwrap().is_empty());
    assert!(f
        .k
        .events(&new_ctx, 0, 100)
        .unwrap()
        .iter()
        .all(|e| e["event"]["object_id"] != w.id));
}
#[test]
fn audience_change_invalidates_lease_and_cached_context() {
    let mut f = Fixture::new();
    let ctx = f.ctx(1, 0);
    let op = f.ctx(0, 0);
    let w = f.work(&ctx);
    let p = f.k.prepare(&ctx, &f.req(&w)).unwrap();
    let a = f.k.approve(&op, &p.id, &p.args_hash).unwrap();
    f.k.set_audience(&op, vec![op.actor.id.clone(), ctx.actor.id.clone()])
        .unwrap();
    assert!(f.k.search(&ctx, "water", 5).is_err());
    let fresh = f.ctx(1, 0);
    assert!(f
        .k
        .execute_local(&fresh, &p.id, a.lease.as_ref().unwrap())
        .is_err());
}
#[test]
fn revocation_denies_old_token_and_old_authority() {
    let mut f = Fixture::new();
    let ctx = f.ctx(1, 0);
    let op = f.ctx(0, 0);
    f.k.revoke_principal(&op, &ctx.actor.id).unwrap();
    assert!(f.k.authenticate(f.token(1)).is_err());
    assert!(f.k.search(&ctx, "water", 5).is_err());
}
#[test]
fn restricted_source_cannot_be_widened_by_memory() {
    let mut f = Fixture::new();
    let private = f.ctx(1, 2);
    let a = f.source(&private, Visibility::Private, "private note");
    let c = MemoryCandidate {
        text: "private note".into(),
        source_artifact_id: a.id,
        visibility: Visibility::Institution,
        purpose: "knowledge".into(),
        kind: "semantic".into(),
        evidence_kind: "source_fact".into(),
        retention_seconds: 3600,
    };
    assert!(f.k.memory_candidate(&private, &c).is_err());
}
#[test]
fn memory_requires_evidence_review_and_respects_withdrawal() {
    let mut f = Fixture::new();
    let ctx = f.ctx(1, 0);
    let op = f.ctx(0, 0);
    let a = f.source(
        &ctx,
        Visibility::Institution,
        "Water checklist is reviewed every Monday.",
    );
    let c = MemoryCandidate {
        text: "Water checklist is reviewed every Monday.".into(),
        source_artifact_id: a.id.clone(),
        visibility: Visibility::Institution,
        purpose: "knowledge".into(),
        kind: "procedural".into(),
        evidence_kind: "source_fact".into(),
        retention_seconds: 3600,
    };
    assert!(f
        .k
        .memory_candidate(
            &ctx,
            &MemoryCandidate {
                evidence_kind: "hearsay".into(),
                ..c.clone()
            }
        )
        .is_err());
    assert!(f
        .k
        .memory_candidate(
            &ctx,
            &MemoryCandidate {
                text: "invented fact".into(),
                ..c.clone()
            }
        )
        .is_err());
    let m = f.k.memory_candidate(&ctx, &c).unwrap();
    assert!(f.k.memories(&ctx).unwrap().is_empty());
    assert!(f.k.approve_memory(&ctx, &m.id).is_err());
    f.k.approve_memory(&op, &m.id).unwrap();
    assert_eq!(f.k.memories(&ctx).unwrap().len(), 1);
    f.k.withdraw_artifact(&ctx, &a.id).unwrap();
    assert!(f.k.memories(&ctx).unwrap().is_empty());
    assert!(f.k.search(&ctx, "Water", 5).unwrap().is_empty());
}
#[test]
fn projections_rebuild_with_stable_ids_from_original_bytes() {
    let mut f = Fixture::new();
    let ctx = f.ctx(1, 0);
    let text = "Indonesian—Papuan Malay 🌿 water continuity".repeat(200);
    let a = f.source(&ctx, Visibility::Institution, &text);
    let before = f.k.search(&ctx, "water", 50).unwrap();
    f.k.rebuild_library().unwrap();
    let after = f.k.search(&ctx, "water", 50).unwrap();
    assert_eq!(json!(before), json!(after));
    assert_eq!(f.k.raw_source(&ctx, &a.id).unwrap(), text.as_bytes());
}
#[test]
fn restart_and_snapshot_preserve_receipts_without_reexecution() {
    let mut f = Fixture::new();
    let ctx = f.ctx(1, 0);
    let op = f.ctx(0, 0);
    let w = f.work(&ctx);
    let p = f.k.prepare(&ctx, &f.req(&w)).unwrap();
    let a = f.k.approve(&op, &p.id, &p.args_hash).unwrap();
    let r =
        f.k.execute_local(&ctx, &p.id, a.lease.as_ref().unwrap())
            .unwrap();
    let backup = f.dir.path().join("snapshot.sqlite");
    f.k.backup(&backup).unwrap();
    drop(f.k);
    let mut k = Kernel::open(&backup).unwrap();
    assert_eq!(
        k.execute_local(&ctx, &p.id, a.lease.as_ref().unwrap())
            .unwrap()
            .id,
        r.id
    );
    k.integrity().unwrap();
}
#[test]
fn device_unknown_outcome_reconciles_even_after_cancellation() {
    let mut f = Fixture::new();
    let ctx = f.ctx(1, 0);
    let op = f.ctx(0, 0);
    let w = f.work(&ctx);
    let request = CapabilityRequest {
        capability: "device.indicate".into(),
        args: json!({"device":"presence","state":"working","controller_generation":1}),
        ..f.req(&w)
    };
    let p = f.k.prepare(&ctx, &request).unwrap();
    let a = f.k.approve(&op, &p.id, &p.args_hash).unwrap();
    let command =
        f.k.begin_device(&ctx, &p.id, a.lease.as_ref().unwrap())
            .unwrap();
    f.k.cancel(&ctx, &w.id).unwrap();
    f.k.mark_unknown(&ctx, &p.id).unwrap();
    assert!(f
        .k
        .begin_device(&ctx, &p.id, a.lease.as_ref().unwrap())
        .is_err());
    let destination = json!({"id":p.id,"args":command["args"],"outcome":"VERIFIED"});
    let r = f.k.reconcile_device(&ctx, &p.id, &destination).unwrap();
    assert_eq!(r.effect_id, p.id);
    assert_eq!(f.k.work(&ctx, &w.id).unwrap().state, WorkState::Cancelled);
}
#[test]
fn source_and_payload_ceilings_are_enforced() {
    let mut f = Fixture::new();
    let ctx = f.ctx(1, 0);
    assert!(f.k.search(&ctx, "water", 51).is_err());
    assert!(f.k.search(&ctx, &"x".repeat(513), 1).is_err());
    let huge = IngestRequest {
        title: "large".into(),
        content: "x".repeat(MAX_SOURCE_BYTES + 1),
        visibility: Visibility::Institution,
        purpose: "knowledge".into(),
        provenance: "fixture".into(),
    };
    assert!(f.k.ingest(&ctx, &huge).is_err());
}
#[test]
fn exclusive_host_ownership_and_future_schema_fail_closed() {
    let f = Fixture::new();
    assert!(Kernel::open(&f.dir.path().join("state.sqlite")).is_err());
    let path = f.dir.path().join("future.sqlite");
    let c = rusqlite::Connection::open(&path).unwrap();
    c.execute_batch("PRAGMA user_version=99").unwrap();
    drop(c);
    assert!(Kernel::open(&path).is_err());
}
#[test]
fn ledger_is_content_minimal_and_outbox_commit_is_atomic() {
    let mut f = Fixture::new();
    let ctx = f.ctx(0, 0);
    f.source(&ctx, Visibility::Institution, "PRIVATEPAYLOADNEVERINLEDGER");
    let events = f.k.events(&ctx, 0, 100).unwrap();
    assert!(!json!(events)
        .to_string()
        .contains("PRIVATEPAYLOADNEVERINLEDGER"));
    let pending = f.k.pending_outbox(&ctx, 100).unwrap();
    assert!(!pending.is_empty());
    f.k.ack_outbox(&ctx, pending[0]["seq"].as_i64().unwrap())
        .unwrap();
    assert_eq!(
        f.k.pending_outbox(&ctx, 100).unwrap().len(),
        pending.len() - 1
    );
}

#[test]
fn memory_review_inbox_is_scoped_and_separate_from_retrieval() {
    let mut f = Fixture::new();
    let maria = f.ctx(1, 0);
    let operator = f.ctx(0, 0);
    let source = f.source(&maria, Visibility::Institution, "water plan evidence");
    let memory =
        f.k.memory_candidate(
            &maria,
            &MemoryCandidate {
                text: "water plan evidence".into(),
                source_artifact_id: source.id,
                visibility: Visibility::Institution,
                purpose: "knowledge".into(),
                kind: "semantic".into(),
                evidence_kind: "source_fact".into(),
                retention_seconds: 60,
            },
        )
        .unwrap();
    assert!(f.k.memories(&maria).unwrap().is_empty());
    assert_eq!(f.k.memory_candidates(&maria).unwrap()[0].id, memory.id);
    assert_eq!(f.k.memory_candidates(&operator).unwrap()[0].id, memory.id);
    assert!(f.k.memory_candidates(&f.ctx(2, 0)).unwrap().is_empty());
    f.k.approve_memory(&operator, &memory.id).unwrap();
    assert!(f.k.memory_candidates(&operator).unwrap().is_empty());
    assert_eq!(f.k.memories(&maria).unwrap()[0].id, memory.id);
    let private = f.ctx(1, 2);
    let source = f.source(&private, Visibility::Private, "private source evidence");
    f.k.memory_candidate(
        &private,
        &MemoryCandidate {
            text: "private source evidence".into(),
            source_artifact_id: source.id,
            visibility: Visibility::Private,
            purpose: "knowledge".into(),
            kind: "semantic".into(),
            evidence_kind: "source_fact".into(),
            retention_seconds: 60,
        },
    )
    .unwrap();
    assert_eq!(f.k.memory_candidates(&private).unwrap().len(), 1);
    assert!(f.k.memory_candidates(&operator).unwrap().is_empty());
}

#[test]
fn proposal_ceiling_preserves_idempotent_replay() {
    let mut f = Fixture::new();
    let ctx = f.ctx(1, 0);
    let work = f.work(&ctx);
    let original = f.req(&work);
    let first = f.k.prepare(&ctx, &original).unwrap();
    for n in 1..100 {
        let mut request = original.clone();
        request.idempotency_key = format!("proposal-{n}");
        f.k.prepare(&ctx, &request).unwrap();
    }
    assert_eq!(f.k.prepare(&ctx, &original).unwrap().id, first.id);
    let mut overflow = original;
    overflow.idempotency_key = "overflow".into();
    assert!(matches!(f.k.prepare(&ctx, &overflow), Err(Error::Limit(_))));
    assert_eq!(f.k.effects_for(&ctx, &work.id).unwrap().len(), 100);
}

fn derive(f: &mut Fixture, ctx: &AccessContext, source: &Artifact) -> (WorkObject, Artifact) {
    let work = f.work(ctx);
    let mut request = f.req(&work);
    request.args["content"] = json!("compiled lineage result");
    request.args["source_ids"] = json!([source.id]);
    let proposal = f.k.prepare(ctx, &request).unwrap();
    let operator = f.ctx(0, 0);
    let approved =
        f.k.approve(&operator, &proposal.id, &proposal.args_hash)
            .unwrap();
    let receipt =
        f.k.execute_local(ctx, &proposal.id, approved.lease.as_ref().unwrap())
            .unwrap();
    (work, f.k.artifact(ctx, &receipt.artifact_id).unwrap())
}

#[test]
fn source_withdrawal_fences_transitive_artifacts_memory_and_effect_views() {
    let mut f = Fixture::new();
    let ctx = f.ctx(1, 0);
    let original = f.source(&ctx, Visibility::Institution, "original lineage evidence");
    let (_, first) = derive(&mut f, &ctx, &original);
    let (work, second) = derive(&mut f, &ctx, &first);
    let memory =
        f.k.memory_candidate(
            &ctx,
            &MemoryCandidate {
                text: "compiled lineage result".into(),
                source_artifact_id: second.id.clone(),
                visibility: Visibility::Institution,
                purpose: "knowledge".into(),
                kind: "semantic".into(),
                evidence_kind: "source_fact".into(),
                retention_seconds: 60,
            },
        )
        .unwrap();
    let op = f.ctx(0, 0);
    f.k.approve_memory(&op, &memory.id).unwrap();
    assert_eq!(f.k.search(&ctx, "lineage", 10).unwrap().len(), 3);
    f.k.withdraw_artifact(&ctx, &original.id).unwrap();
    assert!(f.k.search(&ctx, "lineage", 10).unwrap().is_empty());
    assert!(f.k.raw_source(&ctx, &second.id).is_err());
    assert!(f.k.memories(&ctx).unwrap().is_empty());
    let effects = f.k.effects_for(&ctx, &work.id).unwrap();
    assert_eq!(effects[0]["args"]["redacted"], true);
    assert_eq!(effects[0]["receipt"]["outcome"], "VERIFIED");
    let db = rusqlite::Connection::open(f.dir.path().join("state.sqlite")).unwrap();
    assert_eq!(
        db.query_row(
            "SELECT count(*) FROM artifacts WHERE length(raw)>0",
            [],
            |r| r.get::<_, i64>(0)
        )
        .unwrap(),
        3
    );
    f.k.integrity().unwrap();
}

#[test]
fn schema_one_migration_backfills_committed_source_lineage() {
    let mut f = Fixture::new();
    let ctx = f.ctx(1, 0);
    let source = f.source(&ctx, Visibility::Institution, "lineage evidence");
    let (_, derived) = derive(&mut f, &ctx, &source);
    let path = f.dir.path().join("state.sqlite");
    drop(f.k);
    let db = rusqlite::Connection::open(&path).unwrap();
    db.execute_batch("DROP TABLE artifact_sources; PRAGMA user_version=1;")
        .unwrap();
    drop(db);
    f.k = Kernel::open(&path).unwrap();
    assert_eq!(f.k.integrity().unwrap()["schema"], 2);
    assert_eq!(f.k.artifact(&ctx, &derived.id).unwrap().id, derived.id);
    f.k.withdraw_artifact(&ctx, &source.id).unwrap();
    assert!(f.k.artifact(&ctx, &derived.id).is_err());
}

#[cfg(unix)]
#[test]
fn database_aliases_cannot_bypass_host_lock_and_new_database_is_private() {
    use std::os::unix::fs::{symlink, PermissionsExt};
    let f = Fixture::new();
    let path = f.dir.path().join("state.sqlite");
    let alias = f.dir.path().join("alias.sqlite");
    symlink(&path, &alias).unwrap();
    assert!(matches!(Kernel::open(&alias), Err(Error::Conflict(_))));
    assert_eq!(
        std::fs::metadata(path).unwrap().permissions().mode() & 0o077,
        0
    );
    let backup = f.dir.path().join("private-snapshot.sqlite");
    f.k.backup(&backup).unwrap();
    assert_eq!(
        std::fs::metadata(backup).unwrap().permissions().mode() & 0o077,
        0
    );
}
