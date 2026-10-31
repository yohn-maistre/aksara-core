use aksara_core_types::*;
use aksara_kernel::*;
use serde_json::json;
use tempfile::tempdir;

#[test]
fn native_permit_is_private_finite_and_fenced_by_current_work_and_takeover() {
    let dir = tempdir().unwrap();
    let mut k = Kernel::open(&dir.path().join("db")).unwrap();
    let dev = k.init_dev().unwrap();
    let ctx = |k: &Kernel, l: usize| {
        k.context(
            dev["people"][0]["token"].as_str().unwrap(),
            dev["lanes"][l]["lane"]["id"].as_str().unwrap(),
            "knowledge",
        )
        .unwrap()
    };
    let private = ctx(&k, 1);
    let shared = ctx(&k, 0);
    let window = ComputerWindow {
        app: "fixture".into(),
        window_id: "window-1".into(),
        pid: 123,
        process_instance: "instance-1".into(),
        allow_actions: true,
        allow_headed: false,
    };
    assert!(k.computer_connect(&shared, &window).is_err());
    let grant = k.computer_connect(&private, &window).unwrap();
    let id = grant["id"].as_str().unwrap();
    let req = ModelRequest {
        kind: ModelKind::Background,
        text: "Prepare report".into(),
        provider: "local".into(),
        model: "fixture".into(),
        cloud_consent: false,
        source_consent: false,
        source_ids: vec![],
        idempotency_key: "computer-task".into(),
    };
    let run = k.begin_model(&private, &req).unwrap();
    assert!(k.computer_check(&private, &run.id, id).is_err());
    k.claim_model(&private, &run.id).unwrap();
    let observed = k
        .computer_observed(&private, &run.id, id, "{\"tree\":\"SYNTHETIC_UI\"}")
        .unwrap();
    let source_id = observed["artifact"]["id"].as_str().unwrap();
    assert!(k.artifact(&shared, source_id).is_err());
    let action = json!({"operation":"click","ref":"@snapshot:e1"});
    let intent = k.computer_intent(&private, &run.id, id, &action).unwrap();
    assert!(k.computer_intent(&private, &run.id, id, &action).is_err());
    k.computer_stop(&private, id).unwrap();
    // Delivered work can still be recorded after Stop; no new delivery is admitted.
    let receipt=k.computer_receipt(&private,intent["id"].as_str().unwrap(),&json!({"version":"2.5","ok":true,"data":{"disposition":{"delivery":"delivered_unverified","retry":"unsafe"}}})).unwrap();
    assert_eq!(receipt["state"], "delivered_unverified");
    assert!(k.computer_check(&private, &run.id, id).is_err());
    let next = k.computer_connect(&private, &window).unwrap();
    let next_id = next["id"].as_str().unwrap();
    let unknown = k
        .computer_intent(&private, &run.id, next_id, &action)
        .unwrap();
    k.computer_receipt(&private,unknown["id"].as_str().unwrap(),&json!({"ok":false,"error":{"disposition":{"delivery":"delivery_uncertain","retry":"unsafe"}}})).unwrap();
    assert!(k
        .computer_intent(&private, &run.id, next_id, &action)
        .is_err());
    assert!(k
        .computer_intent(
            &private,
            &run.id,
            next_id,
            &json!({"operation":"shell","ref":"@snapshot:e1"})
        )
        .is_err());
    k.withdraw_artifact(&private, source_id).unwrap();
    assert!(k.computer_check(&private, &run.id, next_id).is_err());
}
