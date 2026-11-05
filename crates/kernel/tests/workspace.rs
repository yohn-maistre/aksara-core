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
