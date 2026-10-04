//! Institutional types. Runtime IDs are references, never canonical object IDs.
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub fn new_id(prefix: &str) -> String {
    format!("{prefix}_{}", Uuid::new_v4())
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum Visibility {
    Private,
    Institution,
    Public,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Principal {
    pub id: String,
    pub institution_id: String,
    pub name: String,
    pub role: String,
    pub active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationLane {
    pub id: String,
    pub institution_id: String,
    pub channel: String,
    pub audience: Vec<String>,
    pub revision: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessContext {
    pub institution_id: String,
    pub actor: Principal,
    pub initiator: String,
    pub lane: ConversationLane,
    pub purpose: String,
    pub policy_epoch: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct IngestRequest {
    pub title: String,
    pub content: String,
    pub visibility: Visibility,
    pub purpose: String,
    pub provenance: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Artifact {
    pub id: String,
    pub title: String,
    pub sha256: String,
    pub owner: String,
    pub visibility: Visibility,
    pub purpose: String,
    pub provenance: String,
    pub bytes: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchHit {
    pub artifact_id: String,
    pub block_id: String,
    pub title: String,
    pub text: String,
    pub sha256: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum WorkState {
    Heard,
    Working,
    NeedsInput,
    AwaitingApproval,
    Completed,
    Failed,
    Cancelled,
}

impl WorkState {
    pub fn terminal(&self) -> bool {
        matches!(self, Self::Completed | Self::Failed | Self::Cancelled)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkObject {
    pub id: String,
    pub institution_id: String,
    pub lane_id: String,
    pub owner: String,
    pub audience: Vec<String>,
    pub purpose: String,
    pub request: String,
    pub revision: i64,
    pub generation: i64,
    pub state: WorkState,
    pub display_safe_summary: String,
    pub speech_safe_summary: String,
    pub runtime_ref: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct DelegateRequest {
    pub request: String,
    pub idempotency_key: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CapabilityRequest {
    pub work_id: String,
    pub revision: i64,
    pub generation: i64,
    pub idempotency_key: String,
    pub capability: String,
    pub args: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PreparedEffect {
    pub id: String,
    pub work_id: String,
    pub args_hash: String,
    pub capability: String,
    pub status: String,
    pub lease: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Receipt {
    pub id: String,
    pub effect_id: String,
    pub outcome: String,
    pub artifact_id: String,
    pub verified_sha256: String,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MemoryCandidate {
    pub text: String,
    pub source_artifact_id: String,
    pub visibility: Visibility,
    pub purpose: String,
    pub kind: String,
    pub evidence_kind: String,
    pub retention_seconds: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryRecord {
    pub id: String,
    pub text: String,
    pub source_artifact_id: String,
    pub state: String,
    pub expires_at: i64,
}
