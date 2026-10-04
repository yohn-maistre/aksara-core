CREATE TABLE artifact_sources(
  artifact_id TEXT NOT NULL REFERENCES artifacts(id),
  source_id TEXT NOT NULL REFERENCES artifacts(id),
  PRIMARY KEY(artifact_id,source_id),
  CHECK(artifact_id <> source_id)
);
CREATE INDEX artifact_sources_parent ON artifact_sources(source_id);
-- Backfill committed artifacts from the schema-1 effect/receipt records.
INSERT OR IGNORE INTO artifact_sources(artifact_id,source_id)
SELECT json_extract(r.data,'$.artifact_id'), sources.value
FROM receipts r JOIN effects e ON e.id=r.effect_id
JOIN json_each(e.data,'$.request.args.source_ids') sources
WHERE json_extract(e.data,'$.request.capability')='artifact.create';
PRAGMA user_version=2;
