# Local test runbook

Start `python3 scripts/dev.py` after `cargo build --locked --workspace`. The launcher initializes only a fresh database and saves individual credentials privately. To reset the lab, stop both processes and move `.aksara` to a backup directory before starting a fresh one. `init-dev` refuses to overwrite an institution.

## A complete governed task

Use Maria in the shared lane to preserve an institution source containing `water continuity`. Delegate `water continuity`, prepare the cited artifact, switch to Operator in the shared lane and approve the exact proposal, then switch back to Maria and execute it. Threads shows the verified receipt only after the source artifact and receipt have committed.

The UI shows only work visible in the selected lane. A private source may be preserved and searched in its owner's private lane; it will not appear in a shared lane. Operator has no universal private-data bypass. Memory shows eligible pending candidates separately from reviewed memory; Operator can review institution-visible candidates there.

## API and Pi worker

Each API call carries an individual bearer token and lane ID. These examples choose Maria's shared lane without printing tokens:

```sh
export AKSARA_TOKEN="$(python3 -c 'import json; print(json.load(open(".aksara/dev-identities.json"))["people"][1]["token"])')"
export AKSARA_LANE="$(python3 -c 'import json; print(json.load(open(".aksara/dev-identities.json"))["lanes"][0]["lane"]["id"])')"
curl -sS http://127.0.0.1:7341/api/delegate \
  -H "Authorization: Bearer $AKSARA_TOKEN" \
  -H "X-Aksara-Lane: $AKSARA_LANE" -H 'Content-Type: application/json' \
  -d '{"request":"water continuity","idempotency_key":"runbook-water-1"}'
npm run worker -- work_ID_RETURNED_ABOVE
```

Pi's terminal task result means its proposal phase finished; institutional work remains `AWAITING_APPROVAL`. Approve and execute through Threads. The effect's original idempotency key is exposed in the authorized effect view, so proposals created by Pi can be executed in the same UI.

`GET /api/thread?id=...`, `/effects?work_id=...`, `/search?query=...`, `/artifact?id=...`, `/events?after=0&limit=100`, `/memories`, `/outbox` and `/capabilities` provide inspectable views. `POST /api/steer` accepts `{id,revision,request}`; cancel accepts `{id}`. Mutation models for ingestion/delegation/proposals/memory reject unknown fields. This HTTP/JSON API is a development surface, not the planned ConnectRPC/AG-UI contract.

For memory, `POST /api/memory-candidate` accepts `{text,source_artifact_id,visibility,purpose,kind,evidence_kind,retention_seconds}`. `text` must be an exact source excerpt, `purpose` is `knowledge` or `work`, `kind` is semantic/procedural/episodic, and this baseline accepts only declared `source_fact`. Operator reviews via `/memory-approve` with `{id}` in an eligible lane. `/withdraw` with `{id}` withdraws the owner's source from retrieval and makes transitive derived artifacts and dependent memory ineligible. Original bytes remain for provenance.

Runtime storage is per WorkObject by default and permanently bound to actor/institution/lane/purpose. An `AKSARA_RUNTIME_DB` override must preserve that scope. Steering increments work revision/generation before spawning the next task; cancellation persists the kernel fence before requesting a Pi abort. Changing audience/policy/revocation invalidates cached authority.

## Devices and ambiguous delivery

Devices includes Controller, Presence, Information and Card profiles. Only generic states can be sent to the three surface endpoints. Simulated physical inputs require Operator; the real physical controls would be independent of host authorization. A prepared device proposal binds the observed controller generation. A stop increments it; release does not reinstate old proposals.

If the host dies after the destination commits a command, the effect remains `INTENT_COMMITTED` or `OUTCOME_UNKNOWN`. Use **Reconcile device receipt**, which reads the persisted destination receipt. It never reissues the command. If the destination has no receipt, the outcome stays unresolved; there is no synthetic success or automatic retry button. SDK capture/frame/OTA/queue fixtures are exercised by Python conformance tests, not exposed as general HTTP capabilities.

## Recovery and snapshots

Stop the launcher first, then:

```sh
target/debug/aksarad --db .aksara/state.sqlite doctor
target/debug/aksarad --db .aksara/state.sqlite backup .aksara/snapshot.sqlite
target/debug/aksarad --db .aksara/state.sqlite rebuild-library
```

A packaged build uses `bin/aksarad`. The doctor validates SQLite and the content-minimal hash chain. It does not establish tamper resistance or verify every raw source; a rebuild verifies each preserved source's SHA-256 and reconstructs text blocks.

A source rebuild preserves canonical bytes and deterministic block IDs. For a snapshot restore, stop all processes, choose a new state directory, copy the snapshot to its `state.sqlite`, and retain its matching individual credentials. Do not combine a kernel snapshot with a stale device receipt store without reconciliation. Outbox ack is a local administrative primitive; there is no remote sync transport yet.

Fault injection is opt-in through process environment (`AKSARA_FAULT`, `AKSARA_PI_FAULT`) and cannot be activated by HTTP. The normal launcher removes those variables. The stress harness disables core dumps and removes its synthetic credentials on success. Failed runs retain private temporary logs for diagnosis.
