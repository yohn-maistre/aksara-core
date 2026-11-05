CREATE TABLE IF NOT EXISTS workspace_entries(id TEXT PRIMARY KEY, lane_id TEXT NOT NULL, data TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS workspace_entries_lane ON workspace_entries(lane_id);
CREATE TABLE IF NOT EXISTS workspace_revisions(entry_id TEXT NOT NULL REFERENCES workspace_entries(id), revision INTEGER NOT NULL, data TEXT NOT NULL, PRIMARY KEY(entry_id, revision));
CREATE TABLE IF NOT EXISTS workspace_snapshots(entry_id TEXT NOT NULL REFERENCES workspace_entries(id), revision INTEGER NOT NULL, artifact_id TEXT NOT NULL REFERENCES artifacts(id), PRIMARY KEY(entry_id, revision));
PRAGMA user_version=5;
