use crate::*;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize)]
struct StoredMemory {
    record: MemoryRecord,
    candidate: MemoryCandidate,
}
impl Kernel {
    pub fn memory_candidate(
        &mut self,
        ctx: &AccessContext,
        c: &MemoryCandidate,
    ) -> Result<MemoryRecord> {
        self.check_context(ctx)?;
        bounded(&c.text, MAX_TEXT_BYTES)?;
        purpose(&c.purpose)?;
        if !matches!(c.kind.as_str(), "semantic" | "procedural" | "episodic")
            || c.evidence_kind != "source_fact"
            || !(1..=31_536_000).contains(&c.retention_seconds)
            || c.visibility == Visibility::Public
            || !visible(ctx, &ctx.actor.id, &c.visibility, &c.purpose)
        {
            return Err(Error::Denied);
        }
        let source = self.artifact(ctx, &c.source_artifact_id)?;
        if source.visibility == Visibility::Private && c.visibility != Visibility::Private {
            return Err(Error::Denied);
        }
        let raw = self.raw_source(ctx, &source.id)?;
        let text = std::str::from_utf8(&raw)
            .map_err(|_| Error::Invalid("invalid source encoding".into()))?;
        if !text.contains(&c.text) {
            return Err(Error::Invalid(
                "baseline memory must be an exact cited source excerpt".into(),
            ));
        }
        let count: i64 = self
            .db
            .query_row("SELECT count(*) FROM memory", [], |r| r.get(0))?;
        if count >= 10_000 {
            return Err(Error::Limit(
                "development ceiling: 10000 memory candidates".into(),
            ));
        }
        let m = MemoryRecord {
            id: new_id("memory"),
            text: c.text.clone(),
            source_artifact_id: c.source_artifact_id.clone(),
            state: "CANDIDATE".into(),
            expires_at: now() + c.retention_seconds,
        };
        let stored = StoredMemory {
            record: m.clone(),
            candidate: c.clone(),
        };
        let tx = self.db.transaction()?;
        tx.execute(
            "INSERT INTO memory(id,institution_id,owner,data) VALUES(?1,?2,?3,?4)",
            params![m.id, ctx.institution_id, ctx.actor.id, json(&stored)?],
        )?;
        event(
            &tx,
            "memory.candidate",
            &m.id,
            Some(&ctx.lane.id),
            &ctx.actor.id,
        )?;
        tx.commit()?;
        Ok(m)
    }
    pub fn approve_memory(&mut self, ctx: &AccessContext, id: &str) -> Result<MemoryRecord> {
        self.check_context(ctx)?;
        if ctx.actor.role != "operator" {
            return Err(Error::Denied);
        }
        let mut stored: StoredMemory = load(&self.db, "memory", id)?;
        let (institution, owner): (String, String) = self.db.query_row(
            "SELECT institution_id,owner FROM memory WHERE id=?1",
            [id],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )?;
        if institution != ctx.institution_id
            || !visible(
                ctx,
                &owner,
                &stored.candidate.visibility,
                &stored.candidate.purpose,
            )
            || stored.record.expires_at <= now()
            || stored.record.state == "REVOKED"
        {
            return Err(Error::Denied);
        }
        self.artifact(ctx, &stored.record.source_artifact_id)?;
        stored.record.state = "APPROVED".into();
        let tx = self.db.transaction()?;
        tx.execute(
            "UPDATE memory SET data=?1 WHERE id=?2",
            params![json(&stored)?, id],
        )?;
        event(
            &tx,
            "memory.approved",
            id,
            Some(&ctx.lane.id),
            &ctx.actor.id,
        )?;
        tx.commit()?;
        Ok(stored.record)
    }
    pub fn memories(&self, ctx: &AccessContext) -> Result<Vec<MemoryRecord>> {
        self.check_context(ctx)?;
        let mut s = self
            .db
            .prepare("SELECT owner,data FROM memory WHERE institution_id=?1")?;
        let rows = s.query_map([&ctx.institution_id], |r| {
            Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?))
        })?;
        let mut out = Vec::new();
        for row in rows {
            let (owner, data) = row?;
            let m: StoredMemory = serde_json::from_str(&data)?;
            if m.record.state == "APPROVED"
                && m.record.expires_at > now()
                && visible(ctx, &owner, &m.candidate.visibility, &m.candidate.purpose)
                && self.artifact(ctx, &m.record.source_artifact_id).is_ok()
            {
                out.push(m.record);
                if out.len() >= 100 {
                    break;
                }
            }
        }
        Ok(out)
    }
    pub fn memory_candidates(&self, ctx: &AccessContext) -> Result<Vec<MemoryRecord>> {
        self.check_context(ctx)?;
        let mut statement = self
            .db
            .prepare("SELECT owner,data FROM memory WHERE institution_id=?1")?;
        let rows = statement.query_map([&ctx.institution_id], |r| {
            Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?))
        })?;
        let mut result = Vec::new();
        for row in rows {
            let (owner, data) = row?;
            let stored: StoredMemory = serde_json::from_str(&data)?;
            if (owner == ctx.actor.id || ctx.actor.role == "operator")
                && stored.record.state == "CANDIDATE"
                && stored.record.expires_at > now()
                && visible(
                    ctx,
                    &owner,
                    &stored.candidate.visibility,
                    &stored.candidate.purpose,
                )
                && self
                    .artifact(ctx, &stored.record.source_artifact_id)
                    .is_ok()
            {
                result.push(stored.record);
                if result.len() >= 100 {
                    break;
                }
            }
        }
        Ok(result)
    }
    pub fn revoke_memory(&mut self, ctx: &AccessContext, id: &str) -> Result<()> {
        self.check_context(ctx)?;
        let mut m: StoredMemory = load(&self.db, "memory", id)?;
        let (institution, owner): (String, String) = self.db.query_row(
            "SELECT institution_id,owner FROM memory WHERE id=?1",
            [id],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )?;
        if institution != ctx.institution_id
            || owner != ctx.actor.id
            || !visible(ctx, &owner, &m.candidate.visibility, &m.candidate.purpose)
        {
            return Err(Error::Denied);
        }
        m.record.state = "REVOKED".into();
        let tx = self.db.transaction()?;
        tx.execute(
            "UPDATE memory SET data=?1 WHERE id=?2",
            params![json(&m)?, id],
        )?;
        event(&tx, "memory.revoked", id, Some(&ctx.lane.id), &ctx.actor.id)?;
        tx.commit()?;
        Ok(())
    }
}
