use aksara_core_types::*;
use aksara_kernel::*;
use serde_json::Value;
use tempfile::TempDir;
struct F {
    _dir: TempDir,
    k: Kernel,
    dev: Value,
}
impl F {
    fn new() -> Self {
        let d = TempDir::new().unwrap();
        let mut k = Kernel::open(&d.path().join("state.db")).unwrap();
        let dev = k.init_dev().unwrap();
        Self { _dir: d, k, dev }
    }
    fn ctx(&self, p: usize, l: usize) -> AccessContext {
        self.k
            .context(
                self.dev["people"][p]["token"].as_str().unwrap(),
                self.dev["lanes"][l]["lane"]["id"].as_str().unwrap(),
                "knowledge",
            )
            .unwrap()
    }
    fn req(&self, provider: &str, key: &str) -> ModelRequest {
        ModelRequest {
            source_ids: vec![],
            text: format!("synthetic {key}"),
            provider: provider.into(),
            model: "fixture".into(),
            cloud_consent: provider != "local",
            idempotency_key: key.into(),
        }
    }
}
#[test]
fn conversation_is_canonical_idempotent_and_scoped() {
    let mut f = F::new();
    let c = f.ctx(0, 1);
    let q = f.req("local", "one");
    let r = f.k.begin_model(&c, &q).unwrap();
    assert_eq!(r.id, f.k.begin_model(&c, &q).unwrap().id);
    assert!(f.k.begin_model(&c, &f.req("local", "two")).is_err());
    assert!(f.k.messages(&f.ctx(1, 2), 0).unwrap().is_empty());
    assert!(f.k.model_input(&f.ctx(1, 0), &r.id).is_err());
    f.k.finish_model(&c, &r.id, "Synthetic reply", false)
        .unwrap();
    assert_eq!(f.k.messages(&c, 0).unwrap().len(), 2);
    assert!(f.k.finish_model(&c, &r.id, "duplicate", false).is_err());
    assert_eq!(f.k.works(&c).unwrap()[0].state, WorkState::Completed);
}
#[test]
fn cloud_context_excludes_local_only_turns_and_library() {
    let mut f = F::new();
    let c = f.ctx(0, 1);
    let r =
        f.k.begin_model(&c, &f.req("local", "LOCAL_SECRET"))
            .unwrap();
    f.k.finish_model(&c, &r.id, "LOCAL_REPLY_SECRET", false)
        .unwrap();
    let mut q = f.req("opencode-free", "public");
    q.cloud_consent = false;
    assert!(f.k.begin_model(&c, &q).is_err());
    q.cloud_consent = true;
    let r = f.k.begin_model(&c, &q).unwrap();
    let input = f.k.model_input(&c, &r.id).unwrap();
    assert!(!input.to_string().contains("LOCAL_SECRET"));
    assert!(!input.to_string().contains("LOCAL_REPLY_SECRET"));
    assert_eq!(input["library_injected"], false);
}
#[test]
fn policy_changes_and_cancellation_fence_provider_output() {
    let mut f = F::new();
    let c = f.ctx(0, 0);
    let r = f.k.begin_model(&c, &f.req("local", "one")).unwrap();
    f.k.set_audience(&c, vec![c.actor.id.clone()]).unwrap();
    assert!(f.k.finish_model(&c, &r.id, "STALE", false).is_err());
    let fresh = f.ctx(0, 0);
    assert!(f.k.finish_model(&fresh, &r.id, "STALE", false).is_err());
    f.k.interrupt_model(&fresh, &r.work_id).unwrap();
    assert!(f.k.model_input(&fresh, &r.id).is_err());
    let r2 = f.k.begin_model(&fresh, &f.req("local", "two")).unwrap();
    f.k.cancel(&fresh, &r2.work_id).unwrap();
    assert!(f.k.finish_model(&fresh, &r2.id, "LATE", false).is_err());
}
#[test]
fn history_uses_recorded_state_and_current_permissions() {
    let mut f = F::new();
    let c = f.ctx(0, 1);
    assert!(f.k.today(&c, Some(0)).unwrap()["work"]
        .as_array()
        .unwrap()
        .is_empty());
    let r = f.k.begin_model(&c, &f.req("local", "one")).unwrap();
    let before = f.k.today(&c, None).unwrap();
    let at = before["at"].as_i64().unwrap();
    assert_eq!(before["work"][0]["work"]["state"], "HEARD");
    std::thread::sleep(std::time::Duration::from_millis(3));
    f.k.finish_model(&c, &r.id, "reply", false).unwrap();
    assert_eq!(
        f.k.today(&c, Some(at)).unwrap()["work"][0]["work"]["state"],
        "HEARD"
    );
    assert_eq!(
        f.k.today(&c, None).unwrap()["work"][0]["work"]["state"],
        "COMPLETED"
    );
    assert!(f.k.today(&f.ctx(1, 0), Some(at)).unwrap()["work"]
        .as_array()
        .unwrap()
        .is_empty());
}
#[test]
fn personal_domain_has_one_identity_and_channel_preserves_audience() {
    let d = TempDir::new().unwrap();
    let mut k = Kernel::open(&d.path().join("personal.db")).unwrap();
    let dev = k.init_personal("Yohan").unwrap();
    assert_eq!(dev["people"].as_array().unwrap().len(), 1);
    assert!(k.init_personal("Other").is_err());
    let c = k
        .context(
            dev["people"][0]["token"].as_str().unwrap(),
            dev["lanes"][0]["lane"]["id"].as_str().unwrap(),
            "knowledge",
        )
        .unwrap();
    let ch = k.create_channel(&c, "Notes").unwrap();
    assert_eq!(ch["lane"]["audience"], serde_json::json!(c.lane.audience));
}

#[test]
fn source_readsets_fence_output_history_and_future_context_after_withdrawal() {
    let mut f = F::new();
    let c = f.ctx(0, 1);
    let a =
        f.k.ingest(
            &c,
            &IngestRequest {
                title: "Evidence".into(),
                content: "SOURCE_SECRET_SYNTHETIC".into(),
                visibility: Visibility::Private,
                purpose: "knowledge".into(),
                provenance: "fixture".into(),
            },
        )
        .unwrap();
    let mut q = f.req("local", "read");
    q.source_ids = vec![a.id.clone()];
    let r = f.k.begin_model(&c, &q).unwrap();
    assert!(f
        .k
        .model_input(&c, &r.id)
        .unwrap()
        .to_string()
        .contains("SOURCE_SECRET_SYNTHETIC"));
    f.k.finish_model(&c, &r.id, "DERIVED_SECRET_SYNTHETIC", false)
        .unwrap();
    // A follow-up inherits dependencies from the actual frozen conversational input.
    let follow = f.k.begin_model(&c, &f.req("local", "follow")).unwrap();
    assert_eq!(follow.source_ids, vec![a.id.clone()]);
    f.k.withdraw_artifact(&c, &a.id).unwrap();
    assert!(f.k.model_input(&c, &follow.id).is_err());
    assert!(f
        .k
        .finish_model(&c, &follow.id, "LATE_DERIVED_SECRET", false)
        .is_err());
    assert!(f.k.messages(&c, 0).unwrap().is_empty());
    f.k.interrupt_model(&c, &follow.work_id).unwrap();
    let fresh = f.k.begin_model(&c, &f.req("local", "fresh")).unwrap();
    let input = f.k.model_input(&c, &fresh.id).unwrap().to_string();
    assert!(!input.contains("DERIVED_SECRET_SYNTHETIC"));
    assert!(!input.contains("SOURCE_SECRET_SYNTHETIC"));
}
#[test]
fn hosted_models_cannot_materialize_library_sources_even_with_prompt_consent() {
    let mut f = F::new();
    let c = f.ctx(0, 1);
    let mut q = f.req("opencode-free", "cloud");
    q.source_ids = vec!["arbitrary".into()];
    assert!(f.k.begin_model(&c, &q).is_err());
}

#[test]
fn steering_fences_old_provider_output_and_claim_sets_canonical_working_state() {
    let mut f = F::new();
    let c = f.ctx(0, 1);
    let r = f.k.begin_model(&c, &f.req("local", "one")).unwrap();
    f.k.claim_model(&c, &r.id).unwrap();
    assert_eq!(f.k.work(&c, &r.work_id).unwrap().state, WorkState::Working);
    let revised =
        f.k.steer(&c, &r.work_id, r.work_revision, "New user direction")
            .unwrap();
    assert!(f.k.model_input(&c, &r.id).is_err());
    assert!(f.k.finish_model(&c, &r.id, "STALE_ANSWER", false).is_err());
    let current = f.k.work(&c, &r.work_id).unwrap();
    assert_eq!(current.request, revised.request);
    assert_eq!(current.state, WorkState::Heard);
}

#[test]
fn schema_two_upgrade_preserves_sources_work_credentials_and_starts_history_now() {
    let dir = TempDir::new().unwrap();
    let path = dir.path().join("upgrade.db");
    let mut k = Kernel::open(&path).unwrap();
    let dev = k.init_dev().unwrap();
    let token = dev["people"][0]["token"].as_str().unwrap();
    let lane = dev["lanes"][1]["lane"]["id"].as_str().unwrap();
    let c = k.context(token, lane, "knowledge").unwrap();
    let a = k
        .ingest(
            &c,
            &IngestRequest {
                title: "Original".into(),
                content: "Original UTF8 bytes\r\n".into(),
                visibility: Visibility::Private,
                purpose: "knowledge".into(),
                provenance: "fixture".into(),
            },
        )
        .unwrap();
    let w = k
        .delegate(
            &c,
            &DelegateRequest {
                request: "Old work".into(),
                idempotency_key: "old".into(),
            },
        )
        .unwrap();
    drop(k);
    let db = rusqlite::Connection::open(&path).unwrap();
    db.execute_batch("DROP TRIGGER work_history_insert; DROP TRIGGER work_history_update; DROP TABLE work_history; DROP TABLE messages; DROP TABLE model_inputs; DROP TABLE model_runs; DROP TABLE lane_labels; PRAGMA user_version=2;").unwrap();
    drop(db);
    let k = Kernel::open(&path).unwrap();
    let c = k.context(token, lane, "knowledge").unwrap();
    assert_eq!(k.raw_source(&c, &a.id).unwrap(), b"Original UTF8 bytes\r\n");
    assert_eq!(k.work(&c, &w.id).unwrap().request, "Old work");
    assert!(k.today(&c, Some(0)).unwrap()["work"]
        .as_array()
        .unwrap()
        .is_empty());
    assert_eq!(
        k.today(&c, None).unwrap()["work"].as_array().unwrap().len(),
        1
    );
    assert_eq!(k.integrity().unwrap()["schema"], 3);
}
