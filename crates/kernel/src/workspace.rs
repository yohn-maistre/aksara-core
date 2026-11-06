//! Versioned working documents/canvases. These are drafts, never source grants
//! or verified agent results. Imported source bytes remain immutable.
use crate::*;
use serde::{Deserialize, Serialize};
use serde_json::{json as value, Value};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct WorkspaceSave {
    pub id: String,
    pub revision: i64,
    pub kind: String,
    pub title: String,
    pub content: String,
    pub body: Value,
    pub source_ids: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceEntry {
    pub id: String,
    pub institution_id: String,
    pub lane: ConversationLane,
    pub purpose: String,
    pub owner: String,
    pub updated_by: String,
    pub updated_at: i64,
    pub revision: i64,
    pub kind: String,
    pub title: String,
    pub content: String,
    pub body: Value,
    pub source_ids: Vec<String>,
}

impl Kernel {
    /// One authority-locked projection across the person's currently eligible
    /// lanes. The client never downloads other people's private work to hide it.
    pub fn home_overview(&self, ctx: &AccessContext) -> Result<Value> {
        self.check_context(ctx)?;
        let labels = self.lane_names(&ctx.actor)?;
        let mut work = Vec::new();
        let mut artifacts = Vec::new();
        for row in labels.as_array().ok_or(Error::Denied)?.iter().take(100) {
            let lane: ConversationLane = serde_json::from_value(row["lane"].clone())?;
            let scoped = AccessContext {
                lane,
                ..ctx.clone()
            };
            self.check_context(&scoped)?;
            for item in self.works(&scoped)?.into_iter().take(30) {
                let recorded: i64 = self.db.query_row(
                    "SELECT coalesce(max(recorded_ms),0) FROM work_history WHERE work_id=?1",
                    [&item.id],
                    |r| r.get(0),
                )?;
                let results = self.work_artifacts(&scoped, &item.id)?;
                work.push(value!({"work":item,"lane":scoped.lane.id,"channel":row["name"],"private":scoped.lane.audience.len()==1,"recorded_ms":recorded,"artifacts":results}));
            }
            for item in self.workspace_entries(&scoped)?.into_iter().take(20) {
                let entry =
                    self.workspace_entry(&scoped, item["id"].as_str().ok_or(Error::Denied)?)?;
                let preview: String = entry.content.chars().take(240).collect();
                artifacts.push(value!({"entry":item,"preview":preview,"lane":scoped.lane.id,"channel":row["name"],"private":scoped.lane.audience.len()==1}));
            }
        }
        work.sort_by_key(|r| std::cmp::Reverse(r["recorded_ms"].as_i64().unwrap_or(0)));
        artifacts
            .sort_by_key(|r| std::cmp::Reverse(r["entry"]["updated_at"].as_i64().unwrap_or(0)));
        let truncated = work.len() > 100 || artifacts.len() > 100;
        work.truncate(100);
        artifacts.truncate(100);
        Ok(
            value!({"protocol":"aksara.home/1","work":work,"artifacts":artifacts,"truncated":truncated,"current_authorization":true}),
        )
    }
    pub fn work_artifacts(&self, ctx: &AccessContext, id: &str) -> Result<Vec<Artifact>> {
        self.work(ctx, id)?;
        let mut ids = Vec::<String>::new();
        for effect in self.effects_for(ctx, id)? {
            if let Some(id) = effect["receipt"]["artifact_id"].as_str() {
                ids.push(id.into());
            }
        }
        let mut statement = self
            .db
            .prepare("SELECT data FROM model_runs WHERE json_extract(data,'$.work_id')=?1")?;
        for row in statement.query_map([id], |r| r.get::<_, String>(0))? {
            let run: ModelRun = serde_json::from_str(&row?)?;
            ids.extend(run.note_ids);
        }
        ids.sort();
        ids.dedup();
        Ok(ids
            .into_iter()
            .filter_map(|id| self.artifact(ctx, &id).ok())
            .collect())
    }
    pub fn snapshot_workspace(
        &mut self,
        ctx: &AccessContext,
        id: &str,
        revision: i64,
    ) -> Result<Artifact> {
        let entry = self.workspace_entry(ctx, id)?;
        if entry.revision != revision {
            return Err(Error::Conflict("draft changed before snapshot".into()));
        }
        bounded(&entry.content, MAX_SOURCE_BYTES)?;
        let existing: Option<String> = self
            .db
            .query_row(
                "SELECT artifact_id FROM workspace_snapshots WHERE entry_id=?1 AND revision=?2",
                params![id, revision],
                |r| r.get(0),
            )
            .optional()?;
        if let Some(id) = existing {
            return self.artifact(ctx, &id);
        }
        let snapshot_content = if entry.kind == "drawing" {
            serde_json::to_string_pretty(&entry.body)?
        } else {
            entry.content.clone()
        };
        let input = IngestRequest {
            title: entry.title.clone(),
            content: snapshot_content,
            visibility: if ctx.lane.audience.len() == 1 {
                Visibility::Private
            } else {
                Visibility::Institution
            },
            purpose: ctx.purpose.clone(),
            provenance: format!(
                "workspace-snapshot:{}:{};unreviewed",
                entry.id, entry.revision
            ),
        };
        let tx = self.db.transaction()?;
        let mut artifact = crate::library::insert_artifact(&tx, ctx, &input)?;
        artifact.lane_binding = Some(ctx.lane.clone());
        tx.execute(
            "UPDATE artifacts SET data=?2 WHERE id=?1",
            params![artifact.id, json(&artifact)?],
        )?;
        for source in &entry.source_ids {
            tx.execute(
                "INSERT INTO artifact_sources(artifact_id,source_id) VALUES(?1,?2)",
                params![artifact.id, source],
            )?;
        }
        tx.execute(
            "INSERT INTO workspace_snapshots(entry_id,revision,artifact_id) VALUES(?1,?2,?3)",
            params![id, revision, artifact.id],
        )?;
        event(
            &tx,
            "workspace.snapshot",
            &artifact.id,
            Some(&ctx.lane.id),
            &ctx.actor.id,
        )?;
        tx.commit()?;
        Ok(artifact)
    }
    fn workspace_eligible(&self, ctx: &AccessContext, entry: &WorkspaceEntry) -> Result<bool> {
        self.check_context(ctx)?;
        Ok(entry.institution_id == ctx.institution_id
            && entry.lane.id == ctx.lane.id
            && entry.purpose == ctx.purpose
            && ctx
                .lane
                .audience
                .iter()
                .all(|id| entry.lane.audience.contains(id))
            && self.lineage_visible(ctx, &entry.source_ids)?)
    }

    pub fn workspace_entry(&self, ctx: &AccessContext, id: &str) -> Result<WorkspaceEntry> {
        self.check_context(ctx)?;
        let entry: WorkspaceEntry = load(&self.db, "workspace_entries", id)?;
        if !self.workspace_eligible(ctx, &entry)? {
            return Err(Error::Denied);
        }
        Ok(entry)
    }

    pub fn workspace_entries(&self, ctx: &AccessContext) -> Result<Vec<Value>> {
        self.check_context(ctx)?;
        let mut statement = self.db.prepare(
            "SELECT data FROM workspace_entries WHERE lane_id=?1 ORDER BY rowid DESC LIMIT 100",
        )?;
        let rows = statement.query_map([&ctx.lane.id], |r| r.get::<_, String>(0))?;
        let mut out = Vec::new();
        for row in rows {
            let entry: WorkspaceEntry = serde_json::from_str(&row?)?;
            if self.workspace_eligible(ctx, &entry)? {
                out.push(value!({"id":entry.id,"kind":entry.kind,"title":entry.title,"revision":entry.revision,"owner":entry.owner,"updated_by":entry.updated_by,"updated_at":entry.updated_at,"source_ids":entry.source_ids}));
            }
        }
        Ok(out)
    }

    pub fn save_workspace(
        &mut self,
        ctx: &AccessContext,
        input: &WorkspaceSave,
    ) -> Result<WorkspaceEntry> {
        self.check_context(ctx)?;
        bounded(&input.id, 100)?;
        if !input
            .id
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b"_-".contains(&b))
        {
            return Err(Error::Invalid("invalid working document id".into()));
        }
        bounded(&input.title, 256)?;
        if !matches!(input.kind.as_str(), "document" | "canvas" | "drawing")
            || input.content.len() > 500_000
            || json(&input.body)?.len() > 500_000
            || input.source_ids.len() > 50
        {
            return Err(Error::Limit("working surface exceeds bounds".into()));
        }
        if input.kind == "document" && !input.body.is_array() {
            return Err(Error::Invalid("document blocks must be an array".into()));
        }
        if input.kind == "drawing" {
            let elements = input
                .body
                .get("elements")
                .and_then(Value::as_array)
                .ok_or_else(|| Error::Invalid("drawing elements must be an array".into()))?;
            if elements.len() > 300
                || input
                    .body
                    .get("files")
                    .is_some_and(|v| v.as_object().is_none_or(|m| !m.is_empty()))
            {
                return Err(Error::Limit(
                    "drawing exceeds the vector-only profile".into(),
                ));
            }
            for element in elements {
                if !matches!(
                    element["type"].as_str(),
                    Some(
                        "rectangle"
                            | "ellipse"
                            | "diamond"
                            | "line"
                            | "arrow"
                            | "text"
                            | "freedraw"
                            | "frame"
                    )
                ) || !element["link"].is_null()
                {
                    return Err(Error::Invalid(
                        "unsupported drawing element or external link".into(),
                    ));
                }
                for axis in ["x", "y", "width", "height"] {
                    if !element[axis]
                        .as_f64()
                        .is_some_and(|v| v.is_finite() && v.abs() <= 100_000.0)
                    {
                        return Err(Error::Invalid("invalid drawing geometry".into()));
                    }
                }
                if element["text"].as_str().is_some_and(|t| t.len() > 12000) {
                    return Err(Error::Limit("drawing text too long".into()));
                }
            }
        }
        if input.kind == "canvas" {
            let nodes = input
                .body
                .get("nodes")
                .and_then(Value::as_array)
                .ok_or_else(|| Error::Invalid("table nodes must be an array".into()))?;
            if nodes.len() > 50 {
                return Err(Error::Limit("maximum 50 table objects".into()));
            }
            for node in nodes {
                let source = node["data"]["artifactId"].as_str().ok_or(Error::Denied)?;
                if !input.source_ids.iter().any(|id| id == source) {
                    return Err(Error::Denied);
                }
                for axis in ["x", "y"] {
                    if !node["position"][axis]
                        .as_f64()
                        .is_some_and(|v| v.is_finite() && v.abs() <= 100_000.0)
                    {
                        return Err(Error::Invalid("invalid table position".into()));
                    }
                }
            }
        }
        if !self.lineage_visible(ctx, &input.source_ids)? {
            return Err(Error::Denied);
        }
        for id in &input.source_ids {
            let source = self.artifact(ctx, id)?;
            if source.visibility == Visibility::Private && ctx.lane.audience.len() != 1 {
                return Err(Error::Denied);
            }
        }
        let old: Option<String> = self
            .db
            .query_row(
                "SELECT data FROM workspace_entries WHERE id=?1",
                [&input.id],
                |r| r.get(0),
            )
            .optional()?;
        let previous: Option<WorkspaceEntry> = old.map(|s| serde_json::from_str(&s)).transpose()?;
        if let Some(entry) = &previous {
            if !self.workspace_eligible(ctx, entry)? {
                return Err(Error::Denied);
            }
            if entry.revision != input.revision || entry.kind != input.kind {
                return Err(Error::Conflict(
                    "a newer draft is saved; reload it before editing".into(),
                ));
            }
            // Edits cannot remove the restrictions of material already used.
            if entry
                .source_ids
                .iter()
                .any(|id| !input.source_ids.contains(id))
            {
                return Err(Error::Denied);
            }
        } else {
            if input.revision != 0 {
                return Err(Error::Conflict("working document does not exist".into()));
            }
            let count: i64 =
                self.db
                    .query_row("SELECT count(*) FROM workspace_entries", [], |r| r.get(0))?;
            if count >= 500 {
                return Err(Error::Limit("working surface quota reached".into()));
            }
        }
        let entry = WorkspaceEntry {
            id: input.id.clone(),
            institution_id: ctx.institution_id.clone(),
            lane: ctx.lane.clone(),
            purpose: ctx.purpose.clone(),
            owner: previous
                .as_ref()
                .map_or_else(|| ctx.actor.id.clone(), |e| e.owner.clone()),
            updated_by: ctx.actor.id.clone(),
            updated_at: now(),
            revision: input.revision + 1,
            kind: input.kind.clone(),
            title: input.title.clone(),
            content: input.content.clone(),
            body: input.body.clone(),
            source_ids: input.source_ids.clone(),
        };
        let data = json(&entry)?;
        let tx = self.db.transaction()?;
        let total: i64 = tx.query_row(
            "SELECT coalesce(sum(length(data)),0) FROM workspace_revisions",
            [],
            |r| r.get(0),
        )?;
        if total + data.len() as i64 > 64 * 1_048_576 {
            return Err(Error::Limit("working revision store is full".into()));
        }
        tx.execute("INSERT INTO workspace_entries(id,lane_id,data) VALUES(?1,?2,?3) ON CONFLICT(id) DO UPDATE SET data=excluded.data", params![entry.id,ctx.lane.id,data])?;
        tx.execute(
            "INSERT INTO workspace_revisions(entry_id,revision,data) VALUES(?1,?2,?3)",
            params![entry.id, entry.revision, data],
        )?;
        // Bounded recovery history. Review effects separately freeze exact bytes.
        tx.execute(
            "DELETE FROM workspace_revisions WHERE entry_id=?1 AND revision < ?2",
            params![entry.id, entry.revision - 49],
        )?;
        event(
            &tx,
            "workspace.saved",
            &entry.id,
            Some(&ctx.lane.id),
            &ctx.actor.id,
        )?;
        tx.commit()?;
        Ok(entry)
    }
}
