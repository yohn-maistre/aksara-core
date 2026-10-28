CREATE TABLE IF NOT EXISTS lane_labels(lane_id TEXT PRIMARY KEY REFERENCES lanes(id), name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS work_history(
 seq INTEGER PRIMARY KEY AUTOINCREMENT, work_id TEXT NOT NULL REFERENCES work(id),
 recorded_ms INTEGER NOT NULL, data TEXT NOT NULL
);
-- A migration checkpoint is evidence of state now, never invented past history.
INSERT INTO work_history(work_id,recorded_ms,data)
 SELECT id,CAST(unixepoch('subsec')*1000 AS INTEGER),data FROM work
 WHERE NOT EXISTS(SELECT 1 FROM work_history h WHERE h.work_id=work.id);
CREATE INDEX IF NOT EXISTS work_history_time ON work_history(recorded_ms,work_id);
CREATE TRIGGER IF NOT EXISTS work_history_insert AFTER INSERT ON work BEGIN
 INSERT INTO work_history(work_id,recorded_ms,data) VALUES(NEW.id,CAST(unixepoch('subsec')*1000 AS INTEGER),NEW.data);
END;
CREATE TRIGGER IF NOT EXISTS work_history_update AFTER UPDATE OF data ON work BEGIN
 INSERT INTO work_history(work_id,recorded_ms,data) VALUES(NEW.id,CAST(unixepoch('subsec')*1000 AS INTEGER),NEW.data);
END;
CREATE TABLE IF NOT EXISTS model_runs(
 id TEXT PRIMARY KEY, lane_id TEXT NOT NULL REFERENCES lanes(id), owner TEXT NOT NULL REFERENCES principals(id),
 request_key TEXT NOT NULL, request_hash TEXT NOT NULL, data TEXT NOT NULL,
 UNIQUE(lane_id,owner,request_key)
);
CREATE UNIQUE INDEX IF NOT EXISTS one_running_model ON model_runs(lane_id) WHERE json_extract(data,'$.state')='running';
CREATE TABLE IF NOT EXISTS messages(
 seq INTEGER PRIMARY KEY AUTOINCREMENT, lane_id TEXT NOT NULL REFERENCES lanes(id),
 run_id TEXT NOT NULL REFERENCES model_runs(id), data TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS one_message_per_role ON messages(run_id,json_extract(data,'$.role'));
CREATE TABLE IF NOT EXISTS model_inputs(run_id TEXT PRIMARY KEY REFERENCES model_runs(id), data TEXT NOT NULL);
PRAGMA user_version=3;
