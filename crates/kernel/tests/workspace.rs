use aksara_core_types::*;
use aksara_kernel::*;
use serde_json::{json, Value};
use tempfile::TempDir;
struct Fixture {
    _dir: TempDir,
    k: Kernel,
    dev: Value,
}
impl Fixture {
    fn new() -> Self {
        let dir = TempDir::new().unwrap();
        let mut k = Kernel::open(&dir.path().join("state.db")).unwrap();
        let dev = k.init_dev().unwrap();
        Self { _dir: dir, k, dev }
    }
    fn ctx(&self, person: usize, lane: usize) -> AccessContext {
        self.k
            .context(
                self.dev["people"][person]["token"].as_str().unwrap(),
                self.dev["lanes"][lane]["lane"]["id"].as_str().unwrap(),
                "knowledge",
            )
            .unwrap()
    }
    fn input(&self) -> WorkspaceSave {
        WorkspaceSave {
            id: "page_test".into(),
            revision: 0,
            kind: "document".into(),
            title: "Meeting brief".into(),
            content: "# Brief\n\nA shared question.".into(),
            body: json!([]),
            source_ids: vec![],
        }
    }
}
#[test]
fn shared_edits_are_versioned_and_conflicts_preserve_saved_work() {
    let mut f = Fixture::new();
    let c = f.ctx(0, 0);
    let peer = f.ctx(1, 0);
    let mut input = f.input();
    let first = f.k.save_workspace(&c, &input).unwrap();
    assert_eq!(first.revision, 1);
    assert_eq!(
        f.k.workspace_entry(&peer, &first.id).unwrap().content,
        input.content
    );
    input.revision = 1;
    input.content = "A change by the second member.".into();
    let second = f.k.save_workspace(&peer, &input).unwrap();
    assert_eq!(second.revision, 2);
    assert_eq!(second.updated_by, peer.actor.id);
    input.content = "A stale overwrite.".into();
    assert!(matches!(
        f.k.save_workspace(&c, &input),
        Err(Error::Conflict(_))
    ));
    assert_eq!(
        f.k.workspace_entry(&c, &first.id).unwrap().content,
        "A change by the second member."
    );
    assert!(f.k.workspace_entry(&f.ctx(0, 1), &first.id).is_err());
    assert_eq!(f.k.workspace_entries(&f.ctx(0, 1)).unwrap().len(), 0);
}
#[test]
fn snapshot_is_exact_idempotent_and_retains_withdrawal_dependencies() {
    let mut f = Fixture::new();
    let c = f.ctx(0, 1);
    let source =
        f.k.ingest(
            &c,
            &IngestRequest {
                title: "Evidence".into(),
                content: "Source text.".into(),
                visibility: Visibility::Private,
                purpose: "knowledge".into(),
                provenance: "fixture".into(),
            },
        )
        .unwrap();
    let mut input = f.input();
    input.source_ids = vec![source.id.clone()];
    let first = f.k.save_workspace(&c, &input).unwrap();
    let snapshot = f.k.snapshot_workspace(&c, &first.id, 1).unwrap();
    assert_eq!(
        snapshot.id,
        f.k.snapshot_workspace(&c, &first.id, 1).unwrap().id
    );
    assert_eq!(
        f.k.raw_source(&c, &snapshot.id).unwrap(),
        input.content.as_bytes()
    );
    input.revision = 1;
    input.content = "Changed after review.".into();
    f.k.save_workspace(&c, &input).unwrap();
    assert!(f.k.snapshot_workspace(&c, &first.id, 1).is_err());
    assert_eq!(
        f.k.raw_source(&c, &snapshot.id).unwrap(),
        first.content.as_bytes()
    );
    input.revision = 2;
    input.source_ids.clear();
    assert!(f.k.save_workspace(&c, &input).is_err());
    f.k.withdraw_artifact(&c, &source.id).unwrap();
    assert!(f.k.workspace_entries(&c).unwrap().is_empty());
    assert!(f.k.workspace_entry(&c, &first.id).is_err());
    assert!(f.k.artifact(&c, &snapshot.id).is_err());
}
#[test]
fn private_sources_cannot_be_inserted_in_a_shared_working_document() {
    let mut f = Fixture::new();
    let private = f.ctx(0, 1);
    let shared = f.ctx(0, 0);
    let source =
        f.k.ingest(
            &private,
            &IngestRequest {
                title: "Private".into(),
                content: "Private text.".into(),
                visibility: Visibility::Private,
                purpose: "knowledge".into(),
                provenance: "fixture".into(),
            },
        )
        .unwrap();
    let mut input = f.input();
    input.source_ids.push(source.id);
    assert!(f.k.save_workspace(&shared, &input).is_err());
}

#[test]
fn home_overview_uses_each_current_lane_and_excludes_other_private_drafts() {
    let mut f = Fixture::new();
    let shared = f.ctx(0, 0);
    let personal = f.ctx(0, 1);
    let mut input = f.input();
    input.id = "shared_home_page".into();
    f.k.save_workspace(&shared, &input).unwrap();
    input.id = "personal_home_page".into();
    input.title = "PRIVATE_HOME_SENTINEL".into();
    f.k.save_workspace(&personal, &input).unwrap();
    let owner = f.k.home_overview(&shared).unwrap();
    assert!(owner.to_string().contains("PRIVATE_HOME_SENTINEL"));
    let peer = f.k.home_overview(&f.ctx(1, 0)).unwrap();
    assert!(!peer.to_string().contains("PRIVATE_HOME_SENTINEL"));
    assert!(peer.to_string().contains("shared_home_page"));
}

#[test]
fn drawing_snapshot_preserves_exact_scene_and_rejects_external_elements() {
    let mut f = Fixture::new();
    let ctx = f.ctx(0, 0);
    let mut input = f.input();
    input.kind = "drawing".into();
    input.content = "Readable drawing summary".into();
    input.body = json!({"elements":[{"id":"r1","type":"rectangle","x":10,"y":20,"width":180,"height":60,"link":null}],"files":{}});
    f.k.save_workspace(&ctx, &input).unwrap();
    let snapshot = f.k.snapshot_workspace(&ctx, &input.id, 1).unwrap();
    let exact: Value =
        serde_json::from_slice(&f.k.raw_source(&ctx, &snapshot.id).unwrap()).unwrap();
    assert_eq!(exact, input.body);
    input.revision = 1;
    input.body["elements"][0]["link"] = json!("https://example.com");
    assert!(f.k.save_workspace(&ctx, &input).is_err());
    input.body["elements"][0]["link"] = Value::Null;
    input.body["elements"][0]["type"] = json!("iframe");
    assert!(f.k.save_workspace(&ctx, &input).is_err());
    input.body["elements"][0]["type"] = json!("rectangle");
    input.body["files"] = json!({"image":"untrusted"});
    assert!(f.k.save_workspace(&ctx, &input).is_err());
}
