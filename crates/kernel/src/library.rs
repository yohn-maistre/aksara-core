use crate::*;

pub(crate) fn insert_artifact(
    tx: &Transaction,
    ctx: &AccessContext,
    input: &IngestRequest,
) -> Result<Artifact> {
    validate_ingest(ctx, input)?;
    let total: i64 = tx.query_row(
        "SELECT coalesce(sum(length(raw)),0) FROM artifacts",
        [],
        |r| r.get(0),
    )?;
    if total as usize + input.content.len() > MAX_STORE_BYTES {
        return Err(Error::Limit(
            "source store is full (64 MiB development quota)".into(),
        ));
    }
    let artifact = Artifact {
        id: new_id("artifact"),
        title: input.title.clone(),
        sha256: digest(input.content.as_bytes()),
        owner: ctx.actor.id.clone(),
        visibility: input.visibility.clone(),
        purpose: input.purpose.clone(),
        provenance: input.provenance.clone(),
        bytes: input.content.len(),
    };
    tx.execute(
        "INSERT INTO artifacts(id,institution_id,owner,data,raw) VALUES(?1,?2,?3,?4,?5)",
        params![
            artifact.id,
            ctx.institution_id,
            ctx.actor.id,
            json(&artifact)?,
            input.content.as_bytes()
        ],
    )?;
    parse_blocks(tx, &artifact, &input.content)?;
    event(
        tx,
        "library.ingested",
        &artifact.id,
        Some(&ctx.lane.id),
        &ctx.actor.id,
    )?;
    Ok(artifact)
}
pub(crate) fn validate_ingest(ctx: &AccessContext, input: &IngestRequest) -> Result<()> {
    bounded(&input.title, 256)?;
    bounded(&input.content, MAX_SOURCE_BYTES)?;
    bounded(&input.provenance, 1024)?;
    purpose(&input.purpose)?;
    if !visible(ctx, &ctx.actor.id, &input.visibility, &input.purpose) {
        return Err(Error::Denied);
    }
    // Public publication requires a future SharingGrant path; ingest is local custody only.
    if input.visibility == Visibility::Public {
        return Err(Error::Denied);
    }
    Ok(())
}
fn parse_blocks(tx: &Transaction, artifact: &Artifact, text: &str) -> Result<()> {
    // UTF-8 boundaries, original bytes preserved; parser v1 is deterministic text-only.
    for (ordinal, chunk) in text.chars().collect::<Vec<_>>().chunks(2000).enumerate() {
        let text: String = chunk.iter().collect();
        let id = format!(
            "block_{}",
            digest(
                format!(
                    "{}:text-v1:{ordinal}:{}",
                    artifact.id,
                    digest(text.as_bytes())
                )
                .as_bytes()
            )
        );
        tx.execute(
            "INSERT INTO blocks(id,artifact_id,ordinal,text) VALUES(?1,?2,?3,?4)",
            params![id, artifact.id, ordinal as i64, text],
        )?;
    }
    Ok(())
}

impl Kernel {
    pub(crate) fn lineage_visible(&self, ctx: &AccessContext, ids: &[String]) -> Result<bool> {
        let mut statement = self.db.prepare_cached(
            "WITH RECURSIVE dependencies(id) AS (
                SELECT value FROM json_each(?1)
                UNION SELECT s.source_id FROM artifact_sources s JOIN dependencies d ON s.artifact_id=d.id
             ) SELECT a.data,a.institution_id,a.active FROM dependencies d LEFT JOIN artifacts a ON a.id=d.id LIMIT 1001"
        )?;
        let rows = statement.query_map([json(&ids)?], |r| {
            Ok((
                r.get::<_, Option<String>>(0)?,
                r.get::<_, Option<String>>(1)?,
                r.get::<_, Option<i64>>(2)?,
            ))
        })?;
        for (index, row) in rows.enumerate() {
            if index >= 1000 {
                return Ok(false);
            }
            let (data, institution, active) = row?;
            let Some(data) = data else {
                return Ok(false);
            };
            let artifact: Artifact = serde_json::from_str(&data)?;
            if active != Some(1)
                || institution.as_deref() != Some(&ctx.institution_id)
                || !visible(
                    ctx,
                    &artifact.owner,
                    &artifact.visibility,
                    &artifact.purpose,
                )
            {
                return Ok(false);
            }
        }
        Ok(true)
    }
    pub fn ingest(&mut self, ctx: &AccessContext, input: &IngestRequest) -> Result<Artifact> {
        self.check_context(ctx)?;
        let tx = self.db.transaction()?;
        let artifact = insert_artifact(&tx, ctx, input)?;
        tx.commit()?;
        Ok(artifact)
    }
    pub fn artifact(&self, ctx: &AccessContext, id: &str) -> Result<Artifact> {
        self.check_context(ctx)?;
        let row: Option<(String, String, i64)> = self
            .db
            .query_row(
                "SELECT data,institution_id,active FROM artifacts WHERE id=?1",
                [id],
                |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
            )
            .optional()?;
        let (s, institution, active) = row.ok_or(Error::NotFound)?;
        let a: Artifact = serde_json::from_str(&s)?;
        if active != 1
            || institution != ctx.institution_id
            || !visible(ctx, &a.owner, &a.visibility, &a.purpose)
            || !self.lineage_visible(ctx, &[id.to_owned()])?
        {
            return Err(Error::Denied);
        }
        Ok(a)
    }
    pub fn raw_source(&self, ctx: &AccessContext, id: &str) -> Result<Vec<u8>> {
        self.artifact(ctx, id)?;
        Ok(self
            .db
            .query_row("SELECT raw FROM artifacts WHERE id=?1", [id], |r| r.get(0))?)
    }
    pub fn withdraw_artifact(&mut self, ctx: &AccessContext, id: &str) -> Result<()> {
        let artifact = self.artifact(ctx, id)?;
        if artifact.owner != ctx.actor.id {
            return Err(Error::Denied);
        }
        let tx = self.db.transaction()?;
        tx.execute("UPDATE artifacts SET active=0 WHERE id=?1", [id])?;
        event(
            &tx,
            "library.withdrawn",
            id,
            Some(&ctx.lane.id),
            &ctx.actor.id,
        )?;
        tx.commit()?;
        Ok(())
    }
    pub fn search(&self, ctx: &AccessContext, query: &str, limit: usize) -> Result<Vec<SearchHit>> {
        self.check_context(ctx)?;
        bounded(query, 512)?;
        if limit == 0 || limit > MAX_RESULTS {
            return Err(Error::Limit("search limit must be 1..50".into()));
        }
        // Build a bounded audience-authorized FTS corpus *before MATCH*. Hidden rows
        // never affect matching, snippets, ranking or global document statistics.
        self.db.execute_batch("CREATE VIRTUAL TABLE IF NOT EXISTS temp.eligible_search USING fts5(artifact_id UNINDEXED, block_id UNINDEXED, title, text, sha256 UNINDEXED); DELETE FROM temp.eligible_search;")?;
        let result = (|| {
            let mut stmt = self
                .db
                .prepare("SELECT data FROM artifacts WHERE institution_id=?1 AND active=1")?;
            let rows = stmt.query_map([&ctx.institution_id], |r| r.get::<_, String>(0))?;
            let mut count = 0usize;
            for row in rows {
                let a: Artifact = serde_json::from_str(&row?)?;
                if !visible(ctx, &a.owner, &a.visibility, &a.purpose) {
                    continue;
                }
                if !self.lineage_visible(ctx, std::slice::from_ref(&a.id))? {
                    continue;
                }
                let mut blocks = self
                    .db
                    .prepare("SELECT id,text FROM blocks WHERE artifact_id=?1 ORDER BY ordinal")?;
                for row in blocks.query_map([&a.id], |r| {
                    Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?))
                })? {
                    let (id, text) = row?;
                    count += 1;
                    if count > 20_000 {
                        return Err(Error::Limit(
                            "eligible search corpus exceeds 20000 blocks".into(),
                        ));
                    }
                    self.db.execute("INSERT INTO temp.eligible_search(artifact_id,block_id,title,text,sha256) VALUES(?1,?2,?3,?4,?5)",params![a.id,id,a.title,text,a.sha256])?;
                }
            }
            // Treat user text as literal tokens rather than allowing arbitrary FTS syntax.
            let terms: Vec<String> = query
                .split_whitespace()
                .take(32)
                .map(|t| format!("\"{}\"", t.replace('"', "\"\"")))
                .collect();
            let expression = terms.join(" OR ");
            let mut stmt=self.db.prepare("SELECT artifact_id,block_id,title,text,sha256 FROM temp.eligible_search WHERE eligible_search MATCH ?1 ORDER BY rank,block_id LIMIT ?2")?;
            let rows = stmt.query_map(params![expression, limit as i64], |r| {
                Ok(SearchHit {
                    artifact_id: r.get(0)?,
                    block_id: r.get(1)?,
                    title: r.get(2)?,
                    text: r.get(3)?,
                    sha256: r.get(4)?,
                })
            })?;
            Ok(rows.collect::<std::result::Result<Vec<_>, _>>()?)
        })();
        self.db.execute_batch("DELETE FROM temp.eligible_search")?;
        result
    }
    pub fn rebuild_library(&mut self) -> Result<usize> {
        let tx = self.db.transaction()?;
        let sources = {
            let mut s = tx.prepare("SELECT data,raw FROM artifacts")?;
            let rows = s.query_map([], |r| {
                Ok((r.get::<_, String>(0)?, r.get::<_, Vec<u8>>(1)?))
            })?;
            rows.collect::<std::result::Result<Vec<_>, _>>()?
        };
        tx.execute("DELETE FROM blocks", [])?;
        for (data, raw) in &sources {
            let a: Artifact = serde_json::from_str(data)?;
            if digest(raw) != a.sha256 {
                return Err(Error::Conflict("source hash mismatch".into()));
            }
            let text = std::str::from_utf8(raw)
                .map_err(|_| Error::Invalid("source is not UTF-8".into()))?;
            parse_blocks(&tx, &a, text)?;
        }
        tx.commit()?;
        Ok(sources.len())
    }
}
