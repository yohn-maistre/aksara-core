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
            source_consent: false,
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

#[test]
fn codex_subscription_is_hosted_and_excludes_other_provider_context() {
    let mut f = F::new();
    let c = f.ctx(0, 1);
    for (provider, secret) in [
        ("local", "LOCAL_SECRET"),
        ("opencode-free", "OTHER_HOSTED_SECRET"),
    ] {
        let r = f.k.begin_model(&c, &f.req(provider, secret)).unwrap();
        f.k.finish_model(&c, &r.id, secret, false).unwrap();
    }
    let mut req = f.req("codex-chatgpt", "subscription turn");
    req.cloud_consent = false;
    assert!(f.k.begin_model(&c, &req).is_err());
    req.cloud_consent = true;
    let run = f.k.begin_model(&c, &req).unwrap();
    let input = f.k.model_input(&c, &run.id).unwrap();
    assert!(!input.to_string().contains("LOCAL_SECRET"));
    assert!(!input.to_string().contains("OTHER_HOSTED_SECRET"));
    assert_eq!(input["library_injected"], false);
}

#[test]
fn additional_hosted_providers_require_consent_and_never_mix_custody() {
    for provider in ["gemini", "groq", "openrouter-free"] {
        let mut f = F::new();
        let c = f.ctx(0, 1);
        let local = f.k.begin_model(&c, &f.req("local", "LOCAL_ONLY")).unwrap();
        f.k.finish_model(&c, &local.id, "PRIVATE_REPLY", false)
            .unwrap();
        let other =
            f.k.begin_model(&c, &f.req("opencode-free", "OTHER_PROVIDER"))
                .unwrap();
        f.k.finish_model(&c, &other.id, "OTHER_REPLY", false)
            .unwrap();
        let mut q = f.req(provider, "current");
        q.cloud_consent = false;
        assert!(f.k.begin_model(&c, &q).is_err());
        q.cloud_consent = true;
        q.source_ids = vec!["unselected-source".into()];
        assert!(f.k.begin_model(&c, &q).is_err());
        q.source_ids.clear();
        let run = f.k.begin_model(&c, &q).unwrap();
        let input = f.k.model_input(&c, &run.id).unwrap().to_string();
        for secret in [
            "LOCAL_ONLY",
            "PRIVATE_REPLY",
            "OTHER_PROVIDER",
            "OTHER_REPLY",
        ] {
            assert!(!input.contains(secret));
        }
    }
}

#[test]
fn agent_tool_reads_bind_actual_sources_and_withdrawal_fences_reply() {
    let mut f = F::new();
    let c = f.ctx(0, 1);
    let source =
        f.k.ingest(
            &c,
            &IngestRequest {
                title: "Water report".into(),
                content: "TOOL_SOURCE water 17 25".into(),
                visibility: Visibility::Private,
                purpose: "knowledge".into(),
                provenance: "fixture".into(),
            },
        )
        .unwrap();
    let other = f.ctx(1, 2);
    let hidden =
        f.k.ingest(
            &other,
            &IngestRequest {
                title: "Hidden".into(),
                content: "OTHER_PERSON_SECRET".into(),
                visibility: Visibility::Private,
                purpose: "knowledge".into(),
                provenance: "fixture".into(),
            },
        )
        .unwrap();
    let run = f.k.begin_model(&c, &f.req("local", "tools")).unwrap();
    assert!(f
        .k
        .model_retrieve(&c, &run.id, Some("water"), None)
        .is_err());
    f.k.claim_model(&c, &run.id).unwrap();
    assert!(f
        .k
        .model_retrieve(&c, &run.id, None, Some(&hidden.id))
        .is_err());
    let result =
        f.k.model_retrieve(&c, &run.id, Some("water"), None)
            .unwrap();
    assert!(result.to_string().contains("TOOL_SOURCE"));
    assert!(!result.to_string().contains("OTHER_PERSON_SECRET"));
    let checked = f.k.model_input(&c, &run.id).unwrap();
    assert!(checked["run"]["source_ids"]
        .as_array()
        .unwrap()
        .contains(&Value::String(source.id.clone())));
    assert_eq!(
        checked["run"]["tool_reads"][0]["operation"],
        "library_search"
    );
    f.k.withdraw_artifact(&c, &source.id).unwrap();
    assert!(f.k.model_input(&c, &run.id).is_err());
    assert!(f
        .k
        .finish_model(&c, &run.id, "STALE_TOOL_REPLY", false)
        .is_err());
}

#[test]
fn hosted_source_egress_is_explicit_per_turn_and_does_not_grant_search() {
    let mut f = F::new();
    let c = f.ctx(0, 1);
    let source =
        f.k.ingest(
            &c,
            &IngestRequest {
                title: "Selected".into(),
                content: "HOSTED_SELECTED_ONLY".into(),
                visibility: Visibility::Private,
                purpose: "knowledge".into(),
                provenance: "fixture".into(),
            },
        )
        .unwrap();
    let mut req = f.req("opencode-free", "consented-source");
    req.source_ids = vec![source.id.clone()];
    assert!(f.k.begin_model(&c, &req).is_err());
    req.source_consent = true;
    let run = f.k.begin_model(&c, &req).unwrap();
    f.k.claim_model(&c, &run.id).unwrap();
    assert!(f
        .k
        .model_retrieve(&c, &run.id, Some("anything"), None)
        .is_err());
    assert!(f
        .k
        .model_retrieve(&c, &run.id, None, Some("unselected"))
        .is_err());
    assert!(f
        .k
        .model_retrieve(&c, &run.id, None, Some(&source.id))
        .unwrap()
        .to_string()
        .contains("HOSTED_SELECTED_ONLY"));
    f.k.finish_model(&c, &run.id, "HOSTED_DERIVED_REPLY", false)
        .unwrap();
    let next =
        f.k.begin_model(&c, &f.req("opencode-free", "no-source-consent"))
            .unwrap();
    let input = f.k.model_input(&c, &next.id).unwrap()["messages"].to_string();
    assert!(!input.contains("HOSTED_SELECTED_ONLY"));
    assert!(!input.contains("HOSTED_DERIVED_REPLY"));
}

#[test]
fn private_procedure_drafts_preserve_lineage_without_becoming_approved_memory() {
    let mut f = F::new();
    let c = f.ctx(0, 1);
    let source =
        f.k.ingest(
            &c,
            &IngestRequest {
                title: "Correction".into(),
                content: "Use litres and include the date.".into(),
                visibility: Visibility::Private,
                purpose: "knowledge".into(),
                provenance: "fixture".into(),
            },
        )
        .unwrap();
    let run = f.k.begin_model(&c, &f.req("local", "learn")).unwrap();
    f.k.claim_model(&c, &run.id).unwrap();
    f.k.model_retrieve(&c, &run.id, None, Some(&source.id))
        .unwrap();
    let note =
        f.k.model_procedure(
            &c,
            &run.id,
            "Field briefing",
            "Report litres, then date. This is provisional.",
        )
        .unwrap();
    assert!(note.provenance.starts_with("agent-procedure:"));
    assert_eq!(note.visibility, Visibility::Private);
    assert_eq!(
        f.k.raw_source(&c, &note.id).unwrap(),
        b"Report litres, then date. This is provisional."
    );
    assert!(f.k.memories(&c).unwrap().is_empty());
    assert!(f
        .k
        .library_items(&f.ctx(0, 0))
        .unwrap()
        .iter()
        .all(|a| a.id != note.id));
    f.k.model_procedure(&c, &run.id, "Second", "Second draft")
        .unwrap();
    assert!(f
        .k
        .model_procedure(&c, &run.id, "Third", "Over budget")
        .is_err());
    f.k.withdraw_artifact(&c, &source.id).unwrap();
    assert!(f.k.artifact(&c, &note.id).is_err());
    assert!(f
        .k
        .model_procedure(&c, &run.id, "Late", "Denied after withdrawal")
        .is_err());
}
