use crate::*;

impl Kernel {
    pub fn delegate(&mut self, ctx: &AccessContext, input: &DelegateRequest) -> Result<WorkObject> {
        self.check_context(ctx)?;
        bounded(&input.request, MAX_TEXT_BYTES)?;
        bounded(&input.idempotency_key, 128)?;
        let hash=digest(json(&serde_json::json!({"request":input.request,"purpose":ctx.purpose,"lane_revision":ctx.lane.revision} ))?.as_bytes());
        let old:Option<(String,String)>=self.db.query_row("SELECT data,request_hash FROM work WHERE owner=?1 AND lane_id=?2 AND idempotency_key=?3",params![ctx.actor.id,ctx.lane.id,input.idempotency_key],|r|Ok((r.get(0)?,r.get(1)?))).optional()?;
        if let Some((s, h)) = old {
            if hash != h {
                return Err(Error::Conflict(
                    "idempotency key reused with different request/context".into(),
                ));
            }
            return Ok(serde_json::from_str(&s)?);
        }
        let count: i64 = self
            .db
            .query_row("SELECT count(*) FROM work", [], |r| r.get(0))?;
        if count >= 5000 {
            return Err(Error::Limit("development ceiling: 5000 WorkObjects".into()));
        }
        let w = WorkObject {
            id: new_id("work"),
            institution_id: ctx.institution_id.clone(),
            lane_id: ctx.lane.id.clone(),
            owner: ctx.actor.id.clone(),
            audience: ctx.lane.audience.clone(),
            purpose: ctx.purpose.clone(),
            request: input.request.clone(),
            revision: 1,
            generation: 1,
            state: WorkState::Heard,
            display_safe_summary: "Request received".into(),
            speech_safe_summary: "Request received".into(),
            runtime_ref: None,
        };
        let tx = self.db.transaction()?;
        tx.execute("INSERT INTO work(id,institution_id,lane_id,owner,data,idempotency_key,request_hash) VALUES(?1,?2,?3,?4,?5,?6,?7)",params![w.id,w.institution_id,w.lane_id,w.owner,json(&w)?,input.idempotency_key,hash])?;
        event(&tx, "work.heard", &w.id, Some(&w.lane_id), &ctx.actor.id)?;
        tx.commit()?;
        Ok(w)
    }
    pub fn work(&self, ctx: &AccessContext, id: &str) -> Result<WorkObject> {
        self.check_context(ctx)?;
        let w: WorkObject = load(&self.db, "work", id)?;
        if w.institution_id != ctx.institution_id
            || w.lane_id != ctx.lane.id
            || w.purpose != ctx.purpose
            || !ctx.lane.audience.iter().all(|p| w.audience.contains(p))
        {
            return Err(Error::Denied);
        }
        Ok(w)
    }
    pub fn works(&self, ctx: &AccessContext) -> Result<Vec<WorkObject>> {
        self.check_context(ctx)?;
        let mut s = self
            .db
            .prepare("SELECT data FROM work WHERE lane_id=?1 ORDER BY rowid DESC LIMIT 100")?;
        let rows = s.query_map([&ctx.lane.id], |r| r.get::<_, String>(0))?;
        let mut out = Vec::new();
        for r in rows {
            let w: WorkObject = serde_json::from_str(&r?)?;
            if w.purpose == ctx.purpose && ctx.lane.audience.iter().all(|p| w.audience.contains(p))
            {
                out.push(w);
            }
        }
        Ok(out)
    }
    pub fn attach_runtime(
        &mut self,
        ctx: &AccessContext,
        id: &str,
        revision: i64,
        generation: i64,
        runtime_ref: &str,
    ) -> Result<WorkObject> {
        bounded(runtime_ref, 256)?;
        let mut w = self.owned_live_work(ctx, id, revision, generation)?;
        if w.runtime_ref.as_deref().is_some_and(|r| r != runtime_ref) {
            return Err(Error::Conflict(
                "work already attached to another run".into(),
            ));
        }
        w.runtime_ref = Some(runtime_ref.into());
        w.state = WorkState::Working;
        w.display_safe_summary = "Working".into();
        w.speech_safe_summary = "Working".into();
        self.save_work(ctx, &w, "work.started")?;
        Ok(w)
    }
    pub fn steer(
        &mut self,
        ctx: &AccessContext,
        id: &str,
        revision: i64,
        request: &str,
    ) -> Result<WorkObject> {
        bounded(request, MAX_TEXT_BYTES)?;
        let mut w = self.work(ctx, id)?;
        if w.owner != ctx.actor.id || w.state.terminal() || revision != w.revision {
            return Err(Error::Conflict(
                "work cannot be steered at this revision".into(),
            ));
        }
        w.request = request.into();
        w.revision += 1;
        w.generation += 1;
        w.runtime_ref = None;
        w.state = WorkState::Heard;
        w.display_safe_summary = "Request revised".into();
        w.speech_safe_summary = "Request revised".into();
        self.save_work(ctx, &w, "work.steered")?;
        Ok(w)
    }
    pub fn cancel(&mut self, ctx: &AccessContext, id: &str) -> Result<WorkObject> {
        let mut w = self.work(ctx, id)?;
        if w.owner != ctx.actor.id {
            return Err(Error::Denied);
        }
        if w.state == WorkState::Cancelled {
            return Ok(w);
        }
        if w.state.terminal() {
            return Err(Error::Conflict("terminal work cannot be cancelled".into()));
        }
        w.generation += 1;
        w.state = WorkState::Cancelled;
        w.display_safe_summary = "Cancelled".into();
        w.speech_safe_summary = "Cancelled".into();
        self.save_work(ctx, &w, "work.cancelled")?;
        Ok(w)
    }
    pub(crate) fn owned_live_work(
        &self,
        ctx: &AccessContext,
        id: &str,
        revision: i64,
        generation: i64,
    ) -> Result<WorkObject> {
        let w = self.work(ctx, id)?;
        if w.owner != ctx.actor.id {
            return Err(Error::Denied);
        }
        if w.state.terminal() || w.revision != revision || w.generation != generation {
            return Err(Error::Conflict("stale or terminal work".into()));
        }
        Ok(w)
    }
    pub(crate) fn save_work(
        &mut self,
        ctx: &AccessContext,
        w: &WorkObject,
        kind: &str,
    ) -> Result<()> {
        let tx = self.db.transaction()?;
        tx.execute(
            "UPDATE work SET data=?1 WHERE id=?2",
            params![json(w)?, w.id],
        )?;
        event(&tx, kind, &w.id, Some(&w.lane_id), &ctx.actor.id)?;
        tx.commit()?;
        Ok(())
    }
    pub fn events(
        &self,
        ctx: &AccessContext,
        after: i64,
        limit: usize,
    ) -> Result<Vec<serde_json::Value>> {
        self.check_context(ctx)?;
        if after < 0 || limit == 0 || limit > 100 {
            return Err(Error::Limit(
                "event page must be 1..100 with nonnegative cursor".into(),
            ));
        }
        let mut s = self.db.prepare(
            "SELECT seq,payload FROM ledger WHERE lane_id=?1 AND seq>?2 ORDER BY seq LIMIT ?3",
        )?;
        let rows = s.query_map(params![ctx.lane.id, after, limit as i64], |r| {
            Ok((r.get::<_, i64>(0)?, r.get::<_, String>(1)?))
        })?;
        let mut out = Vec::new();
        for r in rows {
            let (seq, payload) = r?;
            let event: serde_json::Value = serde_json::from_str(&payload)?;
            if event["lane_revision"].as_i64() == Some(ctx.lane.revision) {
                out.push(serde_json::json!({"seq":seq,"event":event}));
            }
        }
        Ok(out)
    }
    pub fn pending_outbox(
        &self,
        ctx: &AccessContext,
        limit: usize,
    ) -> Result<Vec<serde_json::Value>> {
        self.check_context(ctx)?;
        if ctx.actor.role != "operator" {
            return Err(Error::Denied);
        }
        if limit == 0 || limit > 100 {
            return Err(Error::Limit("outbox page must be 1..100".into()));
        }
        // Operator can inspect metadata but receives no payload content.
        let mut s=self.db.prepare("SELECT ledger_seq,attempts FROM outbox WHERE delivered_at IS NULL ORDER BY ledger_seq LIMIT ?1")?;
        let rows = s.query_map([limit as i64], |r| {
            Ok(serde_json::json!({"seq":r.get::<_,i64>(0)?,"attempts":r.get::<_,i64>(1)?}))
        })?;
        Ok(rows.collect::<std::result::Result<Vec<_>, _>>()?)
    }
    pub fn ack_outbox(&mut self, ctx: &AccessContext, seq: i64) -> Result<()> {
        self.check_context(ctx)?;
        if ctx.actor.role != "operator" {
            return Err(Error::Denied);
        }
        let n=self.db.execute("UPDATE outbox SET attempts=attempts+1,delivered_at=coalesce(delivered_at,?1) WHERE ledger_seq=?2",params![now(),seq])?;
        if n == 0 {
            return Err(Error::NotFound);
        }
        Ok(())
    }
}
