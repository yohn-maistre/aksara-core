DROP INDEX one_running_model;
CREATE UNIQUE INDEX one_running_model ON model_runs(
 lane_id, coalesce(json_extract(data,'$.kind'),'interactive')
) WHERE json_extract(data,'$.state')='running';
PRAGMA user_version=4;
CREATE TABLE IF NOT EXISTS computer_grants(id TEXT PRIMARY KEY, lane_id TEXT NOT NULL, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS computer_actions(id TEXT PRIMARY KEY, grant_id TEXT NOT NULL REFERENCES computer_grants(id), data TEXT NOT NULL);
