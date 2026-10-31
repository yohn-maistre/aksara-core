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
#[serde(deny_unknown_fields)]
pub struct FileIngestRequest {
    pub title: String,
    pub content_base64: String,
    pub media_type: String,
    pub visibility: Visibility,
    pub purpose: String,
    pub provenance: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Artifact {
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub memory_ids: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub lane_binding: Option<ConversationLane>,
    pub id: String,
    pub title: String,
    pub sha256: String,
    pub owner: String,
    pub visibility: Visibility,
    pub purpose: String,
    pub provenance: String,
    pub bytes: usize,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub media_type: Option<String>,
}
impl Artifact {
    pub fn is_text(&self) -> bool {
        self.media_type.as_deref().is_none_or(|kind| {
            matches!(
                kind,
                "text/plain" | "text/markdown" | "text/csv" | "application/json"
            )
        })
    }
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

/// Hosted access to selected sources needs separate explicit per-turn consent.
/// Model configuration alone grants no broader Library or tool authority.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ModelRequest {
    #[serde(default)]
    pub kind: ModelKind,
    #[serde(default)]
    pub source_ids: Vec<String>,
    pub text: String,
    pub provider: String,
    pub model: String,
    pub cloud_consent: bool,
    #[serde(default)]
    pub source_consent: bool,
    pub idempotency_key: String,
}
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ModelKind {
    #[default]
    Interactive,
    Background,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ModelRun {
    #[serde(default)]
    pub memory_ids: Vec<String>,
    #[serde(default)]
    pub kind: ModelKind,
    #[serde(default)]
    pub parent_run_id: Option<String>,
    #[serde(default)]
    pub authorized_source_ids: Vec<String>,
    #[serde(default)]
    pub tool_reads: Vec<serde_json::Value>,
    #[serde(default)]
    pub note_ids: Vec<String>,
    pub source_ids: Vec<String>,
    pub input_sha256: String,
    pub id: String,
    pub work_id: String,
    pub work_revision: i64,
    pub work_generation: i64,
    pub owner: String,
    pub lane_id: String,
    pub audience: Vec<String>,
    pub lane_revision: i64,
    pub policy_epoch: i64,
    pub purpose: String,
    pub provider: String,
    pub model: String,
    pub cloud_consent: bool,
    pub execution_claimed: bool,
    pub state: String,
    pub created_ms: i64,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ConversationMessage {
    pub seq: i64,
    pub role: String,
    pub text: String,
    pub run: ModelRun,
}
