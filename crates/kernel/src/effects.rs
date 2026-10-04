use crate::*;
use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize)]
struct Effect {
    id: String,
    request: CapabilityRequest,
    actor: String,
    lane_id: String,
    lane_revision: i64,
    policy_epoch: i64,
    purpose: String,
    args_hash: String,
    status: String,
    approved_by: Option<String>,
    expires_at: i64,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct ArtifactArgs {
    title: String,
    content: String,
    visibility: Visibility,
    source_ids: Vec<String>,
}

impl Effect {
    fn view(&self, lease: Option<String>) -> PreparedEffect {
        PreparedEffect {
            id: self.id.clone(),
            work_id: self.request.work_id.clone(),
            args_hash: self.args_hash.clone(),
            capability: self.request.capability.clone(),
            status: self.status.clone(),
            lease,
        }
    }
}

impl Kernel {
    fn effect(&self, id: &str) -> Result<Effect> {
        load(&self.db, "effects", id)
    }
    fn validate_effect(
        &self,
        ctx: &AccessContext,
        e: &Effect,
        allow_terminal: bool,
    ) -> Result<WorkObject> {
        self.check_context(ctx)?;
        if e.actor != ctx.actor.id
            || e.lane_id != ctx.lane.id
            || e.lane_revision != ctx.lane.revision
            || e.policy_epoch != ctx.policy_epoch
            || e.purpose != ctx.purpose
        {
            return Err(Error::Denied);
        }
        let w = self.work(ctx, &e.request.work_id)?;
        if (!allow_terminal && w.state.terminal())
            || w.state == WorkState::Cancelled
            || w.revision != e.request.revision
            || w.generation != e.request.generation
        {
            return Err(Error::Conflict(
                "effect is fenced by work revision/generation".into(),
            ));
        }
        self.validate_args(ctx, &e.request)?;
        Ok(w)
    }
    fn validate_args(&self, ctx: &AccessContext, r: &CapabilityRequest) -> Result<()> {
        if json(&r.args)?.len() > MAX_SOURCE_BYTES {
            return Err(Error::Limit("effect arguments exceed 1 MiB".into()));
        }
        match r.capability.as_str() {
            "artifact.create" => {
                let a: ArtifactArgs = serde_json::from_value(r.args.clone())?;
                crate::library::validate_ingest(
                    ctx,
                    &IngestRequest {
                        title: a.title,
                        content: a.content,
                        visibility: a.visibility.clone(),
                        purpose: ctx.purpose.clone(),
                        provenance: "governed artifact".into(),
                    },
                )?;
                if a.source_ids.len() > 50 {
                    return Err(Error::Limit("maximum 50 source references".into()));
                }
                if !self.lineage_visible(ctx, &a.source_ids)? {
                    return Err(Error::Denied);
                }
                let ancestors: i64 = self.db.query_row(
                    "WITH RECURSIVE dependencies(id) AS (SELECT value FROM json_each(?1) UNION SELECT s.source_id FROM artifact_sources s JOIN dependencies d ON s.artifact_id=d.id) SELECT count(*) FROM (SELECT id FROM dependencies LIMIT 1000)",
                    [json(&a.source_ids)?], |row| row.get(0)
                )?;
                if ancestors >= 1000 {
                    return Err(Error::Limit(
                        "derived artifact may have at most 999 source ancestors".into(),
                    ));
                }
                for id in &a.source_ids {
                    let source = self.artifact(ctx, id)?;
                    if source.visibility == Visibility::Private
                        && a.visibility != Visibility::Private
                    {
                        return Err(Error::Denied);
                    }
                }
            }
            "device.indicate" => {
                let obj = r
                    .args
                    .as_object()
                    .ok_or_else(|| Error::Invalid("device args must be object".into()))?;
                if obj.len() != 3
                    || !matches!(
                        obj.get("device").and_then(|v| v.as_str()),
                        Some("presence" | "information" | "card")
                    )
                    || !matches!(
                        obj.get("state").and_then(|v| v.as_str()),
                        Some("idle" | "working" | "approval" | "success" | "offline")
                    )
                    || !obj
                        .get("controller_generation")
                        .and_then(|v| v.as_i64())
                        .is_some_and(|g| g >= 1)
                {
                    return Err(Error::Invalid("device.indicate requires a simulator profile, generic state and observed controller generation".into()));
                }
            }
            _ => return Err(Error::Denied),
        }
        Ok(())
    }
    pub fn prepare(
        &mut self,
        ctx: &AccessContext,
        r: &CapabilityRequest,
    ) -> Result<PreparedEffect> {
        self.check_context(ctx)?;
        bounded(&r.idempotency_key, 128)?;
        let hash = digest(json(r)?.as_bytes());
        let old: Option<(String, String)> = self
            .db
            .query_row(
                "SELECT data,request_hash FROM effects WHERE work_id=?1 AND idempotency_key=?2",
                params![r.work_id, r.idempotency_key],
                |r| Ok((r.get(0)?, r.get(1)?)),
            )
            .optional()?;
        if let Some((s, h)) = old {
            let e: Effect = serde_json::from_str(&s)?;
            self.validate_effect(ctx, &e, true)?;
            if h != hash {
                return Err(Error::Conflict(
                    "idempotency key reused with different effect".into(),
                ));
            }
            let lease = if e.status == "AUTHORIZED"
                || e.status == "VERIFIED"
                || e.status == "OUTCOME_UNKNOWN"
                || e.status == "INTENT_COMMITTED"
            {
                Some(self.sign(&e)?)
            } else {
                None
            };
            return Ok(e.view(lease));
        }
        let mut w = self.owned_live_work(ctx, &r.work_id, r.revision, r.generation)?;
        self.validate_args(ctx, r)?;
        let count: i64 = self.db.query_row(
            "SELECT count(*) FROM effects WHERE work_id=?1",
            [&r.work_id],
            |row| row.get(0),
        )?;
        if count >= 100 {
            return Err(Error::Limit("maximum 100 proposals per WorkObject".into()));
        }
        let e = Effect {
            id: new_id("effect"),
            request: r.clone(),
            actor: ctx.actor.id.clone(),
            lane_id: ctx.lane.id.clone(),
            lane_revision: ctx.lane.revision,
            policy_epoch: ctx.policy_epoch,
            purpose: ctx.purpose.clone(),
            args_hash: digest(json(&r.args)?.as_bytes()),
            status: "PREPARED".into(),
            approved_by: None,
            expires_at: 0,
        };
        w.state = WorkState::AwaitingApproval;
        w.display_safe_summary = "Approval required".into();
        w.speech_safe_summary = "Approval required".into();
        let tx = self.db.transaction()?;
        tx.execute("INSERT INTO effects(id,work_id,idempotency_key,request_hash,data) VALUES(?1,?2,?3,?4,?5)",params![e.id,r.work_id,r.idempotency_key,hash,json(&e)?])?;
        tx.execute(
            "UPDATE work SET data=?1 WHERE id=?2",
            params![json(&w)?, w.id],
        )?;
        event(
            &tx,
            "effect.prepared",
            &e.id,
            Some(&ctx.lane.id),
            &ctx.actor.id,
        )?;
        tx.commit()?;
        Ok(e.view(None))
    }
    pub fn approve(
        &mut self,
        ctx: &AccessContext,
        id: &str,
        expected_hash: &str,
    ) -> Result<PreparedEffect> {
        self.check_context(ctx)?;
        if ctx.actor.role != "operator" {
            return Err(Error::Denied);
        }
        let mut e = self.effect(id)?;
        let w = self.work(ctx, &e.request.work_id)?;
        if w.state.terminal()
            || w.revision != e.request.revision
            || w.generation != e.request.generation
            || ctx.lane.revision != e.lane_revision
            || ctx.policy_epoch != e.policy_epoch
            || expected_hash != e.args_hash
            || e.purpose != ctx.purpose
        {
            return Err(Error::Conflict(
                "approval no longer matches prepared effect".into(),
            ));
        }
        let actor: Principal = load(&self.db, "principals", &e.actor)?;
        if !actor.active || !ctx.lane.audience.contains(&actor.id) {
            return Err(Error::Denied);
        }
        let actor_ctx = AccessContext {
            actor,
            initiator: e.actor.clone(),
            ..ctx.clone()
        };
        self.validate_args(&actor_ctx, &e.request)?;
        if e.status == "PREPARED" {
            e.status = "AUTHORIZED".into();
            e.approved_by = Some(ctx.actor.id.clone());
            e.expires_at = now() + 300;
            let tx = self.db.transaction()?;
            tx.execute(
                "UPDATE effects SET data=?1 WHERE id=?2",
                params![json(&e)?, id],
            )?;
            event(
                &tx,
                "effect.authorized",
                id,
                Some(&ctx.lane.id),
                &ctx.actor.id,
            )?;
            tx.commit()?;
        } else if e.status != "AUTHORIZED" {
            return Err(Error::Conflict(
                "effect is already claimed or terminal".into(),
            ));
        }
        Ok(e.view(Some(self.sign(&e)?)))
    }
    fn lease_payload(e: &Effect) -> Result<String> {
        json(
            &serde_json::json!({"id":e.id,"hash":e.args_hash,"actor":e.actor,"lane":e.lane_id,"lane_revision":e.lane_revision,"work_revision":e.request.revision,"generation":e.request.generation,"policy":e.policy_epoch,"purpose":e.purpose,"expires":e.expires_at}),
        )
    }
    fn sign(&self, e: &Effect) -> Result<String> {
        let key: String =
            self.db
                .query_row("SELECT value FROM meta WHERE key='lease_key'", [], |r| {
                    r.get(0)
                })?;
        let mut mac = Hmac::<Sha256>::new_from_slice(key.as_bytes()).map_err(|_| Error::Denied)?;
        mac.update(Self::lease_payload(e)?.as_bytes());
        Ok(hex::encode(mac.finalize().into_bytes()))
    }
    fn verify_lease(&self, e: &Effect, lease: &str) -> Result<()> {
        if e.approved_by.is_none() || e.expires_at <= now() {
            return Err(Error::Denied);
        }
        let key: String =
            self.db
                .query_row("SELECT value FROM meta WHERE key='lease_key'", [], |r| {
                    r.get(0)
                })?;
        let mut mac = Hmac::<Sha256>::new_from_slice(key.as_bytes()).map_err(|_| Error::Denied)?;
        mac.update(Self::lease_payload(e)?.as_bytes());
        let bytes = hex::decode(lease).map_err(|_| Error::Denied)?;
        mac.verify_slice(&bytes).map_err(|_| Error::Denied)
    }
    pub fn execute_local(&mut self, ctx: &AccessContext, id: &str, lease: &str) -> Result<Receipt> {
        let mut e = self.effect(id)?;
        let mut w = self.validate_effect(ctx, &e, true)?;
        self.verify_lease(&e, lease)?;
        if let Some(r) = self.receipt_for(ctx, id)? {
            return Ok(r);
        }
        if e.status != "AUTHORIZED"
            || w.state.terminal()
            || e.request.capability != "artifact.create"
        {
            return Err(Error::Conflict("effect cannot execute locally".into()));
        }
        let args: ArtifactArgs = serde_json::from_value(e.request.args.clone())?;
        let input = IngestRequest {
            title: args.title,
            content: args.content,
            visibility: args.visibility,
            purpose: ctx.purpose.clone(),
            provenance: format!("effect:{id}"),
        };
        // This local effect, its unique claim, verification and receipt share one
        // SQLite transaction. External destinations never inherit this guarantee.
        let tx = self.db.transaction()?;
        let artifact = crate::library::insert_artifact(&tx, ctx, &input)?;
        for source_id in &args.source_ids {
            tx.execute(
                "INSERT OR IGNORE INTO artifact_sources(artifact_id,source_id) VALUES(?1,?2)",
                params![artifact.id, source_id],
            )?;
        }
        let receipt = Receipt {
            id: new_id("receipt"),
            effect_id: id.into(),
            outcome: "VERIFIED".into(),
            artifact_id: artifact.id,
            verified_sha256: artifact.sha256,
            created_at: now(),
        };
        tx.execute(
            "INSERT INTO receipts(id,effect_id,data) VALUES(?1,?2,?3)",
            params![receipt.id, id, json(&receipt)?],
        )?;
        e.status = "VERIFIED".into();
        tx.execute(
            "UPDATE effects SET data=?1 WHERE id=?2",
            params![json(&e)?, id],
        )?;
        w.state = WorkState::Completed;
        w.display_safe_summary = "Completed with verified receipt".into();
        w.speech_safe_summary = "Completed".into();
        tx.execute(
            "UPDATE work SET data=?1 WHERE id=?2",
            params![json(&w)?, w.id],
        )?;
        event(
            &tx,
            "effect.verified",
            id,
            Some(&ctx.lane.id),
            &ctx.actor.id,
        )?;
        fault("local_before_commit");
        tx.commit()?;
        fault("local_after_commit");
        Ok(receipt)
    }
    /// Commit intent before leaving the database. Pending external intent requires
    /// reconciliation on restart; this function never hands it out for blind replay.
    pub fn begin_device(
        &mut self,
        ctx: &AccessContext,
        id: &str,
        lease: &str,
    ) -> Result<serde_json::Value> {
        let mut e = self.effect(id)?;
        let w = self.validate_effect(ctx, &e, false)?;
        self.verify_lease(&e, lease)?;
        if e.request.capability != "device.indicate"
            || e.status != "AUTHORIZED"
            || w.state.terminal()
        {
            return Err(Error::Conflict(
                "reconcile pending device intent instead of retrying".into(),
            ));
        }
        e.status = "INTENT_COMMITTED".into();
        let tx = self.db.transaction()?;
        tx.execute(
            "UPDATE effects SET data=?1 WHERE id=?2",
            params![json(&e)?, id],
        )?;
        event(
            &tx,
            "effect.intent_committed",
            id,
            Some(&ctx.lane.id),
            &ctx.actor.id,
        )?;
        tx.commit()?;
        fault("device_after_intent");
        Ok(
            serde_json::json!({"id":id,"args":e.request.args,"expires_at":e.expires_at,"generation":e.request.generation}),
        )
    }
    pub fn mark_unknown(&mut self, ctx: &AccessContext, id: &str) -> Result<()> {
        let mut e = self.effect(id)?;
        self.check_context(ctx)?;
        self.work(ctx, &e.request.work_id)?;
        if e.actor != ctx.actor.id {
            return Err(Error::Denied);
        }
        if e.status == "INTENT_COMMITTED" {
            e.status = "OUTCOME_UNKNOWN".into();
            let tx = self.db.transaction()?;
            tx.execute(
                "UPDATE effects SET data=?1 WHERE id=?2",
                params![json(&e)?, id],
            )?;
            event(
                &tx,
                "effect.outcome_unknown",
                id,
                Some(&ctx.lane.id),
                &ctx.actor.id,
            )?;
            tx.commit()?;
        }
        Ok(())
    }
    pub fn reconcile_device(
        &mut self,
        ctx: &AccessContext,
        id: &str,
        destination: &serde_json::Value,
    ) -> Result<Receipt> {
        let mut e = self.effect(id)?;
        self.check_context(ctx)?;
        let mut w = self.work(ctx, &e.request.work_id)?;
        if e.actor != ctx.actor.id {
            return Err(Error::Denied);
        }
        if let Some(r) = self.receipt_for(ctx, id)? {
            return Ok(r);
        }
        if e.request.capability != "device.indicate"
            || !matches!(e.status.as_str(), "INTENT_COMMITTED" | "OUTCOME_UNKNOWN")
            || destination["id"] != id
            || destination["args"] != e.request.args
            || destination["outcome"] != "VERIFIED"
        {
            return Err(Error::Conflict(
                "destination receipt does not verify intended device effect".into(),
            ));
        }
        let receipt = Receipt {
            id: new_id("receipt"),
            effect_id: id.into(),
            outcome: "VERIFIED".into(),
            artifact_id: format!("simulator:{id}"),
            verified_sha256: digest(json(destination)?.as_bytes()),
            created_at: now(),
        };
        e.status = "VERIFIED".into();
        if !w.state.terminal()
            && w.revision == e.request.revision
            && w.generation == e.request.generation
        {
            w.state = WorkState::Completed;
            w.display_safe_summary = "Device state verified".into();
            w.speech_safe_summary = "Completed".into();
        }
        let tx = self.db.transaction()?;
        tx.execute(
            "INSERT INTO receipts(id,effect_id,data) VALUES(?1,?2,?3)",
            params![receipt.id, id, json(&receipt)?],
        )?;
        tx.execute(
            "UPDATE effects SET data=?1 WHERE id=?2",
            params![json(&e)?, id],
        )?;
        tx.execute(
            "UPDATE work SET data=?1 WHERE id=?2",
            params![json(&w)?, w.id],
        )?;
        event(
            &tx,
            "effect.verified",
            id,
            Some(&ctx.lane.id),
            &ctx.actor.id,
        )?;
        tx.commit()?;
        Ok(receipt)
    }
    pub fn receipt_for(&self, ctx: &AccessContext, id: &str) -> Result<Option<Receipt>> {
        let e = self.effect(id)?;
        self.work(ctx, &e.request.work_id)?;
        let s: Option<String> = self
            .db
            .query_row("SELECT data FROM receipts WHERE effect_id=?1", [id], |r| {
                r.get(0)
            })
            .optional()?;
        s.map(|v| serde_json::from_str(&v).map_err(Error::from))
            .transpose()
    }
    pub fn effects_for(
        &self,
        ctx: &AccessContext,
        work_id: &str,
    ) -> Result<Vec<serde_json::Value>> {
        self.work(ctx, work_id)?;
        let mut s = self
            .db
            .prepare("SELECT data FROM effects WHERE work_id=?1 ORDER BY rowid LIMIT 100")?;
        let rows = s.query_map([work_id], |r| r.get::<_, String>(0))?;
        let mut out = Vec::new();
        for row in rows {
            let e: Effect = serde_json::from_str(&row?)?;
            let args = if e.request.capability == "artifact.create"
                && self.validate_args(ctx, &e.request).is_err()
            {
                serde_json::json!({"redacted":true,"reason":"source evidence is no longer eligible"})
            } else {
                e.request.args.clone()
            };
            out.push(serde_json::json!({"prepared":e.view(None),"args":args,"idempotency_key":e.request.idempotency_key,"expires_at":e.expires_at,"receipt":self.receipt_for(ctx,&e.id)?}));
        }
        Ok(out)
    }
}
fn fault(name: &str) {
    // Opt-in development fault injection. No HTTP endpoint can enable it.
    if std::env::var("AKSARA_FAULT").ok().as_deref() == Some(name) {
        std::process::abort();
    }
}
