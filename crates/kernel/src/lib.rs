//! Single-node, development authority kernel. No model, shell or network authority.
mod effects;
mod library;
mod memory;
mod work;

use aksara_core_types::*;
use rand::RngCore;
use rusqlite::{params, Connection, OptionalExtension, Transaction};
use sha2::{Digest, Sha256};
use std::{
    fs::{File, OpenOptions},
    path::Path,
    time::{SystemTime, UNIX_EPOCH},
};

pub const MAX_SOURCE_BYTES: usize = 1_048_576;
pub const MAX_STORE_BYTES: usize = 64 * 1_048_576;
pub const MAX_TEXT_BYTES: usize = 16_384;
pub const MAX_RESULTS: usize = 50;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("access denied")]
    Denied,
    #[error("object not found")]
    NotFound,
    #[error("conflict: {0}")]
    Conflict(String),
    #[error("invalid input: {0}")]
    Invalid(String),
    #[error("resource limit: {0}")]
    Limit(String),
    #[error("storage: {0}")]
    Storage(#[from] rusqlite::Error),
    #[error("serialization: {0}")]
    Json(#[from] serde_json::Error),
    #[error("filesystem: {0}")]
    Io(#[from] std::io::Error),
}
pub type Result<T> = std::result::Result<T, Error>;
pub fn now() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}
pub fn digest(bytes: &[u8]) -> String {
    hex::encode(Sha256::digest(bytes))
}
pub(crate) fn json<T: serde::Serialize>(value: &T) -> Result<String> {
    Ok(serde_json::to_string(value)?)
}
pub(crate) fn bounded(text: &str, max: usize) -> Result<()> {
    if text.trim().is_empty() {
        return Err(Error::Invalid("empty text".into()));
    }
    if text.len() > max {
        return Err(Error::Limit(format!("maximum {max} bytes")));
    }
    Ok(())
}
pub(crate) fn purpose(value: &str) -> Result<()> {
    if !matches!(value, "knowledge" | "work") {
        return Err(Error::Invalid("purpose must be knowledge or work".into()));
    }
    Ok(())
}

pub struct Kernel {
    pub(crate) db: Connection,
    _lock: File,
}

impl Kernel {
    pub fn open(path: &Path) -> Result<Self> {
        if let Some(parent) = path.parent().filter(|p| !p.as_os_str().is_empty()) {
            std::fs::create_dir_all(parent)?;
        }
        let mut lock_options = OpenOptions::new();
        lock_options
            .read(true)
            .write(true)
            .create(true)
            .truncate(false);
        #[cfg(unix)]
        {
            use std::os::unix::fs::OpenOptionsExt;
            lock_options.mode(0o600);
        }
        // Lock the database inode, so aliases/hard links cannot start a second host.
        let lock = lock_options.open(path)?;
        fs2::FileExt::try_lock_exclusive(&lock)
            .map_err(|_| Error::Conflict("another kernel owns this database".into()))?;
        let mut db = Connection::open(path)?;
        db.busy_timeout(std::time::Duration::from_secs(5))?;
        db.execute_batch("PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA cache_size=-8192; PRAGMA temp_store=MEMORY;")?;
        let page_size: i64 = db.query_row("PRAGMA page_size", [], |r| r.get(0))?;
        db.pragma_update(None, "max_page_count", (256 * 1_048_576_i64) / page_size)?;
        let version: i64 = db.query_row("PRAGMA user_version", [], |r| r.get(0))?;
        if version > 2 {
            return Err(Error::Conflict(
                "database schema is newer than this binary".into(),
            ));
        }
        if version == 0 {
            let tx = db.transaction()?;
            tx.execute_batch(include_str!("schema.sql"))?;
            let mut key = [0u8; 32];
            rand::thread_rng().fill_bytes(&mut key);
            tx.execute(
                "INSERT INTO meta(key,value) VALUES('lease_key',?1),('policy_epoch','1')",
                [hex::encode(key)],
            )?;
            tx.execute_batch("PRAGMA user_version=1")?;
            tx.commit()?;
        }
        if version <= 1 {
            let tx = db.transaction()?;
            tx.execute_batch(include_str!("migrations/002_lineage.sql"))?;
            tx.commit()?;
        }
        Ok(Self { db, _lock: lock })
    }

    pub fn initialized(&self) -> Result<bool> {
        Ok(self
            .db
            .query_row("SELECT count(*) FROM principals", [], |r| {
                r.get::<_, i64>(0)
            })?
            > 0)
    }

    pub fn init_dev(&mut self) -> Result<serde_json::Value> {
        if self.initialized()? {
            return Err(Error::Conflict(
                "already initialized; credentials are not reissued".into(),
            ));
        }
        let institution = new_id("inst");
        let tx = self.db.transaction()?;
        let mut people = Vec::new();
        for (name, role) in [
            ("Operator", "operator"),
            ("Maria", "member"),
            ("Yohan", "member"),
        ] {
            let id = new_id("person");
            let token = format!("{}{}", new_id("dev"), new_id("secret"));
            let principal = Principal {
                id: id.clone(),
                institution_id: institution.clone(),
                name: name.into(),
                role: role.into(),
                active: true,
            };
            tx.execute("INSERT INTO principals(id,institution_id,data,token_hash,active) VALUES(?1,?2,?3,?4,1)", params![id,institution,json(&principal)?,digest(token.as_bytes())])?;
            // Provider account + subject is unique; display name is never a binding key.
            tx.execute("INSERT INTO bindings(provider,account,subject,principal_id) VALUES('dev','local',?1,?2)", params![name,id])?;
            people.push(serde_json::json!({"principal":principal,"token":token}));
        }
        let ids: Vec<String> = people
            .iter()
            .map(|v| v["principal"]["id"].as_str().unwrap().into())
            .collect();
        let mut lanes = Vec::new();
        for (name, audience) in [
            ("shared", ids.clone()),
            ("operator", vec![ids[0].clone()]),
            ("maria", vec![ids[1].clone()]),
            ("yohan", vec![ids[2].clone()]),
        ] {
            let lane = ConversationLane {
                id: new_id("lane"),
                institution_id: institution.clone(),
                channel: "web".into(),
                audience,
                revision: 1,
            };
            tx.execute(
                "INSERT INTO lanes(id,institution_id,data) VALUES(?1,?2,?3)",
                params![lane.id, institution, json(&lane)?],
            )?;
            lanes.push(serde_json::json!({"name":name,"lane":lane}));
        }
        event(&tx, "institution.initialized", &institution, None, &ids[0])?;
        tx.commit()?;
        Ok(
            serde_json::json!({"profile":"development","institution_id":institution,"people":people,"lanes":lanes}),
        )
    }

    pub fn authenticate(&self, token: &str) -> Result<Principal> {
        if token.len() > 256 {
            return Err(Error::Denied);
        }
        let data: Option<String> = self
            .db
            .query_row(
                "SELECT data FROM principals WHERE token_hash=?1 AND active=1",
                [digest(token.as_bytes())],
                |r| r.get(0),
            )
            .optional()?;
        data.map(|s| serde_json::from_str(&s).map_err(Error::from))
            .unwrap_or(Err(Error::Denied))
    }

    pub fn context(
        &self,
        token: &str,
        lane_id: &str,
        request_purpose: &str,
    ) -> Result<AccessContext> {
        purpose(request_purpose)?;
        let actor = self.authenticate(token)?;
        let lane: ConversationLane = load(&self.db, "lanes", lane_id)?;
        if actor.institution_id != lane.institution_id || !lane.audience.contains(&actor.id) {
            return Err(Error::Denied);
        }
        let epoch = self
            .db
            .query_row("SELECT value FROM meta WHERE key='policy_epoch'", [], |r| {
                r.get::<_, String>(0)
            })?
            .parse()
            .map_err(|_| Error::Invalid("invalid policy epoch".into()))?;
        Ok(AccessContext {
            institution_id: actor.institution_id.clone(),
            initiator: actor.id.clone(),
            actor,
            lane,
            purpose: request_purpose.into(),
            policy_epoch: epoch,
        })
    }

    pub fn lanes(&self, actor: &Principal) -> Result<Vec<ConversationLane>> {
        let mut stmt = self
            .db
            .prepare("SELECT data FROM lanes WHERE institution_id=?1 LIMIT 1000")?;
        let lanes = stmt
            .query_map([&actor.institution_id], |r| r.get::<_, String>(0))?
            .collect::<std::result::Result<Vec<_>, _>>()?;
        let mut out = Vec::new();
        for s in lanes {
            let l: ConversationLane = serde_json::from_str(&s)?;
            if l.audience.contains(&actor.id) {
                out.push(l);
            }
        }
        Ok(out)
    }

    pub fn set_audience(
        &mut self,
        ctx: &AccessContext,
        audience: Vec<String>,
    ) -> Result<ConversationLane> {
        self.check_context(ctx)?;
        if ctx.actor.role != "operator"
            || audience.is_empty()
            || audience.len() > 100
            || !audience.contains(&ctx.actor.id)
        {
            return Err(Error::Denied);
        }
        for id in &audience {
            let p: Principal = load(&self.db, "principals", id)?;
            if p.institution_id != ctx.institution_id || !p.active {
                return Err(Error::Denied);
            }
        }
        let mut lane = ctx.lane.clone();
        lane.audience = audience;
        lane.audience.sort();
        lane.audience.dedup();
        lane.revision += 1;
        let tx = self.db.transaction()?;
        tx.execute(
            "UPDATE lanes SET data=?1 WHERE id=?2",
            params![json(&lane)?, lane.id],
        )?;
        event(
            &tx,
            "lane.audience_changed",
            &lane.id,
            Some(&lane.id),
            &ctx.actor.id,
        )?;
        tx.commit()?;
        Ok(lane)
    }

    pub fn revoke_principal(&mut self, ctx: &AccessContext, id: &str) -> Result<()> {
        self.check_context(ctx)?;
        let mut p: Principal = load(&self.db, "principals", id)?;
        if ctx.actor.role != "operator"
            || p.institution_id != ctx.institution_id
            || id == ctx.actor.id
        {
            return Err(Error::Denied);
        }
        p.active = false;
        let tx = self.db.transaction()?;
        tx.execute(
            "UPDATE principals SET active=0,data=?1 WHERE id=?2",
            params![json(&p)?, id],
        )?;
        tx.execute(
            "UPDATE meta SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT) WHERE key='policy_epoch'",
            [],
        )?;
        event(
            &tx,
            "principal.revoked",
            id,
            Some(&ctx.lane.id),
            &ctx.actor.id,
        )?;
        tx.commit()?;
        Ok(())
    }

    /// All entry points reject cached authority after membership, policy or audience change.
    pub(crate) fn check_context(&self, ctx: &AccessContext) -> Result<()> {
        purpose(&ctx.purpose)?;
        let p: Principal = load(&self.db, "principals", &ctx.actor.id)?;
        let l: ConversationLane = load(&self.db, "lanes", &ctx.lane.id)?;
        let epoch: String =
            self.db
                .query_row("SELECT value FROM meta WHERE key='policy_epoch'", [], |r| {
                    r.get(0)
                })?;
        if !p.active
            || p.institution_id != ctx.institution_id
            || p.role != ctx.actor.role
            || ctx.initiator != p.id
            || l.institution_id != ctx.institution_id
            || !l.audience.contains(&p.id)
            || l.audience != ctx.lane.audience
            || l.revision != ctx.lane.revision
            || epoch != ctx.policy_epoch.to_string()
        {
            return Err(Error::Denied);
        }
        Ok(())
    }

    pub fn resolve_binding(
        &self,
        provider: &str,
        account: &str,
        subject: &str,
    ) -> Result<Principal> {
        let id: String = self
            .db
            .query_row(
                "SELECT principal_id FROM bindings WHERE provider=?1 AND account=?2 AND subject=?3",
                params![provider, account, subject],
                |r| r.get(0),
            )
            .optional()?
            .ok_or(Error::NotFound)?;
        let p: Principal = load(&self.db, "principals", &id)?;
        if !p.active {
            return Err(Error::Denied);
        }
        Ok(p)
    }

    pub fn bind_identity(
        &mut self,
        ctx: &AccessContext,
        provider: &str,
        account: &str,
        subject: &str,
        principal_id: &str,
    ) -> Result<()> {
        self.check_context(ctx)?;
        if ctx.actor.role != "operator" {
            return Err(Error::Denied);
        }
        for s in [provider, account, subject] {
            bounded(s, 256)?;
        }
        let p: Principal = load(&self.db, "principals", principal_id)?;
        if !p.active || p.institution_id != ctx.institution_id {
            return Err(Error::Denied);
        }
        let existing: Option<String> = self
            .db
            .query_row(
                "SELECT principal_id FROM bindings WHERE provider=?1 AND account=?2 AND subject=?3",
                params![provider, account, subject],
                |r| r.get(0),
            )
            .optional()?;
        if let Some(id) = existing {
            return if id == principal_id {
                Ok(())
            } else {
                Err(Error::Conflict("identity subject already bound".into()))
            };
        }
        let tx = self.db.transaction()?;
        tx.execute(
            "INSERT INTO bindings(provider,account,subject,principal_id) VALUES(?1,?2,?3,?4)",
            params![provider, account, subject, principal_id],
        )?;
        event(
            &tx,
            "identity.bound",
            principal_id,
            Some(&ctx.lane.id),
            &ctx.actor.id,
        )?;
        tx.commit()?;
        Ok(())
    }

    pub fn backup(&self, path: &Path) -> Result<()> {
        if path.exists() {
            return Err(Error::Conflict("backup destination exists".into()));
        }
        let mut options = OpenOptions::new();
        options.write(true).create_new(true);
        #[cfg(unix)]
        {
            use std::os::unix::fs::OpenOptionsExt;
            options.mode(0o600);
        }
        let _destination = options.open(path)?;
        self.db.backup(rusqlite::MAIN_DB, path, None)?;
        Ok(())
    }

    pub fn integrity(&self) -> Result<serde_json::Value> {
        let sqlite: String = self
            .db
            .query_row("PRAGMA integrity_check", [], |r| r.get(0))?;
        let mut prev = String::new();
        let mut count = 0;
        let mut stmt = self
            .db
            .prepare("SELECT payload,previous_hash,hash FROM ledger ORDER BY seq")?;
        let rows = stmt.query_map([], |r| {
            Ok((
                r.get::<_, String>(0)?,
                r.get::<_, String>(1)?,
                r.get::<_, String>(2)?,
            ))
        })?;
        for row in rows {
            let (payload, previous, hash) = row?;
            if previous != prev || digest(format!("{previous}{payload}").as_bytes()) != hash {
                return Err(Error::Conflict("ledger integrity failure".into()));
            }
            prev = hash;
            count += 1;
        }
        Ok(serde_json::json!({"sqlite":sqlite,"ledger_events":count,"ledger_head":prev,"schema":2}))
    }
}

pub(crate) fn load<T: serde::de::DeserializeOwned>(
    db: &Connection,
    table: &str,
    id: &str,
) -> Result<T> {
    // Table names are internal constants, never client input.
    let s: Option<String> = db
        .query_row(
            &format!("SELECT data FROM {table} WHERE id=?1"),
            [id],
            |r| r.get(0),
        )
        .optional()?;
    Ok(serde_json::from_str(&s.ok_or(Error::NotFound)?)?)
}
pub(crate) fn event(
    tx: &Transaction,
    kind: &str,
    object: &str,
    lane: Option<&str>,
    actor: &str,
) -> Result<()> {
    let lane_revision = if let Some(id) = lane {
        Some(load::<ConversationLane>(tx, "lanes", id)?.revision)
    } else {
        None
    };
    let payload = json(
        &serde_json::json!({"kind":kind,"object_id":object,"lane_id":lane,"lane_revision":lane_revision,"actor":actor,"time":now()}),
    )?;
    let previous: String = tx
        .query_row(
            "SELECT hash FROM ledger ORDER BY seq DESC LIMIT 1",
            [],
            |r| r.get(0),
        )
        .optional()?
        .unwrap_or_default();
    let hash = digest(format!("{previous}{payload}").as_bytes());
    tx.execute(
        "INSERT INTO ledger(payload,previous_hash,hash,lane_id) VALUES(?1,?2,?3,?4)",
        params![payload, previous, hash, lane],
    )?;
    tx.execute(
        "INSERT INTO outbox(ledger_seq) VALUES(?1)",
        [tx.last_insert_rowid()],
    )?;
    Ok(())
}

pub(crate) fn visible(
    ctx: &AccessContext,
    owner: &str,
    visibility: &Visibility,
    record_purpose: &str,
) -> bool {
    if ctx.purpose != record_purpose {
        return false;
    }
    match visibility {
        Visibility::Private => {
            ctx.actor.id == owner && ctx.lane.audience.iter().all(|p| p == owner)
        }
        Visibility::Institution => !ctx.lane.audience.iter().any(|p| p == "public"),
        Visibility::Public => true,
    }
}
