use aksara_core_types::*;
use aksara_kernel::*;
use base64::Engine;
use tempfile::TempDir;

#[test]
fn binary_originals_survive_rebuild_and_respect_custody_withdrawal_and_parser_boundaries() {
    let dir = TempDir::new().unwrap();
    let mut kernel = Kernel::open(&dir.path().join("files.sqlite")).unwrap();
    let dev = kernel.init_dev().unwrap();
    let context = |kernel: &Kernel, person: usize, lane: usize| {
        kernel
            .context(
                dev["people"][person]["token"].as_str().unwrap(),
                dev["lanes"][lane]["lane"]["id"].as_str().unwrap(),
                "knowledge",
            )
            .unwrap()
    };
    let ctx = context(&kernel, 0, 1);
    let raw = b"%PDF-1.7\nBINARY_ONLY_SENTINEL\xff";
    let request = FileIngestRequest {
        title: "synthetic.pdf".into(),
        content_base64: base64::engine::general_purpose::STANDARD.encode(raw),
        media_type: "application/pdf".into(),
        visibility: Visibility::Private,
        purpose: "knowledge".into(),
        provenance: "test-upload".into(),
    };
    let artifact = kernel.ingest_file(&ctx, &request).unwrap();
    assert_eq!(kernel.raw_source(&ctx, &artifact.id).unwrap(), raw);
    assert_eq!(artifact.bytes, raw.len());
    assert!(kernel
        .file_content(&context(&kernel, 1, 0), &artifact.id)
        .is_err());
    kernel.rebuild_library().unwrap();
    assert!(kernel
        .search(&ctx, "BINARY_ONLY_SENTINEL", 10)
        .unwrap()
        .is_empty());
    let run = ModelRequest {
        kind: ModelKind::Interactive,
        text: "test".into(),
        provider: "local".into(),
        model: "fixture".into(),
        cloud_consent: false,
        source_consent: false,
        source_ids: vec![artifact.id.clone()],
        idempotency_key: "binary-prompt".into(),
    };
    assert!(kernel.begin_model(&ctx, &run).is_err());
    let mut wrong_type = request.clone();
    wrong_type.media_type = "image/png".into();
    assert!(kernel.ingest_file(&ctx, &wrong_type).is_err());
    wrong_type.media_type = "text/plain".into();
    assert!(kernel.ingest_file(&ctx, &wrong_type).is_err());
    kernel.withdraw_artifact(&ctx, &artifact.id).unwrap();
    assert!(kernel.file_content(&ctx, &artifact.id).is_err());
}

#[test]
fn csv_bytes_are_exact_and_searchable_without_becoming_executable_content() {
    let dir = TempDir::new().unwrap();
    let mut kernel = Kernel::open(&dir.path().join("files.sqlite")).unwrap();
    let dev = kernel.init_dev().unwrap();
    let ctx = kernel
        .context(
            dev["people"][0]["token"].as_str().unwrap(),
            dev["lanes"][1]["lane"]["id"].as_str().unwrap(),
            "knowledge",
        )
        .unwrap();
    let raw = "Item,Amount\r\n\"Office, supplies\",42\r\n=1+1,2\r\n";
    let request = FileIngestRequest {
        title: "budget.csv".into(),
        content_base64: base64::engine::general_purpose::STANDARD.encode(raw),
        media_type: "text/csv".into(),
        visibility: Visibility::Private,
        purpose: "knowledge".into(),
        provenance: "test-upload".into(),
    };
    let artifact = kernel.ingest_file(&ctx, &request).unwrap();
    assert_eq!(
        kernel.raw_source(&ctx, &artifact.id).unwrap(),
        raw.as_bytes()
    );
    assert!(!kernel.search(&ctx, "supplies", 10).unwrap().is_empty());
    kernel.rebuild_library().unwrap();
    assert_eq!(
        kernel.raw_source(&ctx, &artifact.id).unwrap(),
        raw.as_bytes()
    );
}
