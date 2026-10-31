//! Bounded native personal-computer permits. A window grant is not an OS sandbox.
use crate::*;
use serde::{Deserialize, Serialize};
use serde_json::{json as value, Value};
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ComputerWindow {
    pub app: String,
    pub window_id: String,
    pub pid: i64,
    pub process_instance: String,
    pub allow_actions: bool,
    #[serde(default)]
    pub allow_headed: bool,
}
#[derive(Clone, Serialize, Deserialize)]
struct ComputerGrant {
    id: String,
    owner: String,
    lane_id: String,
    lane_revision: i64,
    policy_epoch: i64,
    purpose: String,
    expires_at: i64,
    active: bool,
    actions: i64,
    window: ComputerWindow,
}
impl Kernel {
    pub fn computer_connect(
        &mut self,
        ctx: &AccessContext,
        window: &ComputerWindow,
    ) -> Result<Value> {
        self.check_context(ctx)?;
        if ctx.lane.audience.len() != 1 || window.pid < 1 {
            return Err(Error::Denied);
        }
        bounded(&window.app, 128)?;
        bounded(&window.window_id, 256)?;
        bounded(&window.process_instance, 128)?;
        let count: i64 = self
            .db
            .query_row("SELECT count(*) FROM computer_grants", [], |r| r.get(0))?;
        if count >= 1000 {
            return Err(Error::Limit("computer permit quota reached".into()));
        }
        let grant = ComputerGrant {
            id: new_id("computer"),
            owner: ctx.actor.id.clone(),
            lane_id: ctx.lane.id.clone(),
            lane_revision: ctx.lane.revision,
            policy_epoch: ctx.policy_epoch,
            purpose: ctx.purpose.clone(),
            expires_at: now() + 600,
            active: true,
            actions: 0,
            window: window.clone(),
        };
        let tx = self.db.transaction()?;
        // Reconnection is explicit takeover: old permits cannot start another action.
        tx.execute("UPDATE computer_grants SET data=json_set(data,'$.active',json('false')) WHERE lane_id=?1",[&ctx.lane.id])?;
        tx.execute(
            "INSERT INTO computer_grants VALUES(?1,?2,?3)",
            params![grant.id, grant.lane_id, json(&grant)?],
        )?;
        event(
            &tx,
            "computer.connected",
            &grant.id,
            Some(&ctx.lane.id),
            &ctx.actor.id,
        )?;
        tx.commit()?;
        Ok(serde_json::to_value(grant)?)
    }
    fn checked_computer(&self, ctx: &AccessContext, id: &str) -> Result<ComputerGrant> {
        self.check_context(ctx)?;
        let grant: ComputerGrant = load(&self.db, "computer_grants", id)?;
        if !grant.active
            || grant.expires_at < now()
            || grant.owner != ctx.actor.id
            || grant.lane_id != ctx.lane.id
            || ctx.lane.audience.len() != 1
            || grant.lane_revision != ctx.lane.revision
            || grant.policy_epoch != ctx.policy_epoch
            || grant.purpose != ctx.purpose
        {
            return Err(Error::Denied);
        }
        Ok(grant)
    }
    pub fn computer_current(&self, ctx: &AccessContext) -> Result<Value> {
        self.check_context(ctx)?;
        let id:Option<String>=self.db.query_row("SELECT id FROM computer_grants WHERE lane_id=?1 AND json_extract(data,'$.active')=1 ORDER BY rowid DESC LIMIT 1",[&ctx.lane.id],|r|r.get(0)).optional()?;
        match id {
            Some(id) => Ok(self
                .checked_computer(ctx, &id)
                .ok()
                .map(serde_json::to_value)
                .transpose()?
                .unwrap_or(Value::Null)),
            None => Ok(Value::Null),
        }
    }
    pub fn computer_stop(&mut self, ctx: &AccessContext, id: &str) -> Result<()> {
        self.check_context(ctx)?;
        let mut grant: ComputerGrant = load(&self.db, "computer_grants", id)?;
        if grant.owner != ctx.actor.id || grant.lane_id != ctx.lane.id {
            return Err(Error::Denied);
        }
        grant.active = false;
        let tx = self.db.transaction()?;
        tx.execute(
            "UPDATE computer_grants SET data=?2 WHERE id=?1",
            params![id, json(&grant)?],
        )?;
        event(
            &tx,
            "computer.stopped",
            id,
            Some(&ctx.lane.id),
            &ctx.actor.id,
        )?;
        tx.commit()?;
        Ok(())
    }
    pub fn computer_check(
        &self,
        ctx: &AccessContext,
        run_id: &str,
        grant_id: &str,
    ) -> Result<Value> {
        let input = self.model_input(ctx, run_id)?;
        let run: ModelRun = serde_json::from_value(input["run"].clone())?;
        if !run.execution_claimed || run.provider != "local" {
            return Err(Error::Denied);
        }
        Ok(serde_json::to_value(self.checked_computer(ctx, grant_id)?)?)
    }
    pub fn computer_observed(
        &mut self,
        ctx: &AccessContext,
        run_id: &str,
        grant_id: &str,
        content: &str,
    ) -> Result<Value> {
        self.computer_check(ctx, run_id, grant_id)?;
        bounded(content, 24000)?;
        // Persist the exact bounded observation as a private source. Withdrawal
        // then fences its dependent answer, artifacts and subsequent model steps.
        let artifact = self.model_document(ctx, run_id, "Computer observation", content)?;
        let checked = self.model_input(ctx, run_id)?;
        let run: ModelRun = serde_json::from_value(checked["run"].clone())?;
        let observation: Value = serde_json::from_str(content)?;
        self.record_model_read(
            ctx,
            run,
            "computer_observe",
            value!({"grant_id":grant_id}),
            vec![artifact.id.clone()],
            value!({"artifact":artifact,"observation":observation}),
        )
    }
    pub fn computer_intent(
        &mut self,
        ctx: &AccessContext,
        run_id: &str,
        grant_id: &str,
        action: &Value,
    ) -> Result<Value> {
        self.computer_check(ctx, run_id, grant_id)?;
        let mut grant = self.checked_computer(ctx, grant_id)?;
        if !grant.window.allow_actions || grant.actions >= 20 {
            return Err(Error::Denied);
        }
        let obj = action.as_object().ok_or(Error::Denied)?;
        if obj
            .keys()
            .any(|k| !["operation", "ref", "value"].contains(&k.as_str()))
            || !matches!(
                action["operation"].as_str(),
                Some("click" | "set-value" | "type")
            )
            || !action["ref"]
                .as_str()
                .is_some_and(|r| r.starts_with('@') && r.len() < 100)
            || (matches!(action["operation"].as_str(), Some("set-value" | "type"))
                && !action["value"].as_str().is_some_and(|s| s.len() <= 4000))
        {
            return Err(Error::Denied);
        }
        let pending:i64=self.db.query_row("SELECT count(*) FROM computer_actions WHERE grant_id=?1 AND json_extract(data,'$.state') IN ('intent_committed','outcome_unknown')",[grant_id],|r|r.get(0))?;
        if pending > 0 {
            return Err(Error::Conflict(
                "computer outcome requires inspection and explicit reconnection".into(),
            ));
        }
        let id = new_id("computer_action");
        grant.actions += 1;
        let record = value!({"id":id,"grant_id":grant_id,"run_id":run_id,"action":action,"state":"intent_committed","created_at":now()});
        let tx = self.db.transaction()?;
        tx.execute(
            "INSERT INTO computer_actions VALUES(?1,?2,?3)",
            params![id, grant_id, json(&record)?],
        )?;
        tx.execute(
            "UPDATE computer_grants SET data=?2 WHERE id=?1",
            params![grant_id, json(&grant)?],
        )?;
        event(
            &tx,
            "computer.intent",
            &id,
            Some(&ctx.lane.id),
            &ctx.actor.id,
        )?;
        tx.commit()?;
        Ok(record)
    }
    pub fn computer_receipt(
        &mut self,
        ctx: &AccessContext,
        id: &str,
        result: &Value,
    ) -> Result<Value> {
        self.check_context(ctx)?;
        let mut action: Value = load(&self.db, "computer_actions", id)?;
        let grant: ComputerGrant = load(
            &self.db,
            "computer_grants",
            action["grant_id"].as_str().ok_or(Error::Denied)?,
        )?;
        // A stop fences new effects; it must not erase an effect already delivered.
        if grant.owner != ctx.actor.id
            || grant.lane_id != ctx.lane.id
            || json(result)?.len() > 32768
        {
            return Err(Error::Denied);
        }
        if action["state"] != "intent_committed" {
            return Err(Error::Conflict("computer receipt already recorded".into()));
        }
        let disposition = if result["ok"] == true {
            &result["data"]["disposition"]
        } else {
            &result["error"]["disposition"]
        };
        let delivery = disposition["delivery"].as_str().unwrap_or("unknown");
        action["state"] = Value::String(
            if matches!(
                delivery,
                "not_delivered" | "delivered_verified" | "delivered_unverified"
            ) {
                delivery
            } else {
                "outcome_unknown"
            }
            .into(),
        );
        action["result"] = result.clone();
        let tx = self.db.transaction()?;
        tx.execute(
            "UPDATE computer_actions SET data=?2 WHERE id=?1",
            params![id, json(&action)?],
        )?;
        event(
            &tx,
            "computer.receipt",
            id,
            Some(&ctx.lane.id),
            &ctx.actor.id,
        )?;
        tx.commit()?;
        Ok(action)
    }
}
