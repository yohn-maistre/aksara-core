use aksara_core_types::*;
use aksara_kernel::{Error, Kernel};
use axum::{
    body::Bytes,
    extract::{DefaultBodyLimit, Path, Query, State},
    http::{HeaderMap, Method, StatusCode},
    response::{Html, IntoResponse, Response},
    routing::get,
    Json, Router,
};
use clap::{Parser, Subcommand};
use serde_json::{json, Value};
use std::{
    collections::BTreeMap,
    net::SocketAddr,
    path::PathBuf,
    sync::{Arc, Mutex},
};

#[derive(Parser)]
#[command(version, about = "Aksara development authority host")]
struct Cli {
    #[arg(long, default_value = ".aksara/state.sqlite", global = true)]
    db: PathBuf,
    #[command(subcommand)]
    command: Command,
}
#[derive(Subcommand)]
enum Command {
    /// Create three individual dev principals and shared/private lanes. Prints tokens once.
    InitDev,
    Serve {
        #[arg(long, default_value = "127.0.0.1:7341")]
        listen: SocketAddr,
        #[arg(long, default_value = "127.0.0.1:7342")]
        simulator: SocketAddr,
    },
    Doctor,
    RebuildLibrary,
    Backup {
        destination: PathBuf,
    },
}
#[derive(Clone)]
struct App {
    kernel: Arc<Mutex<Kernel>>,
    simulator: SocketAddr,
    sim_token: Option<String>,
    client: reqwest::Client,
}
struct ApiError(Error);
impl From<Error> for ApiError {
    fn from(e: Error) -> Self {
        Self(e)
    }
}
impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, message) = match self.0 {
            Error::Denied => (StatusCode::FORBIDDEN, "access denied".into()),
            Error::NotFound => (StatusCode::NOT_FOUND, "object not found".into()),
            Error::Conflict(s) => (StatusCode::CONFLICT, s),
            Error::Invalid(s) => (StatusCode::BAD_REQUEST, s),
            Error::Limit(s) => (StatusCode::PAYLOAD_TOO_LARGE, s),
            Error::Json(_) => (StatusCode::BAD_REQUEST, "invalid typed request".into()),
            _ => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "internal storage error".into(),
            ),
        };
        (status, Json(json!({"error":message}))).into_response()
    }
}
type ApiResult = Result<Json<Value>, ApiError>;
fn field<'a>(v: &'a Value, key: &str) -> Result<&'a str, Error> {
    v[key]
        .as_str()
        .ok_or_else(|| Error::Invalid(format!("missing string: {key}")))
}
fn number(v: &Value, key: &str) -> Result<i64, Error> {
    v[key]
        .as_i64()
        .ok_or_else(|| Error::Invalid(format!("missing integer: {key}")))
}
fn header<'a>(h: &'a HeaderMap, key: &str) -> Result<&'a str, Error> {
    h.get(key)
        .and_then(|v| v.to_str().ok())
        .ok_or(Error::Denied)
}
fn token(h: &HeaderMap) -> Result<&str, Error> {
    header(h, "authorization")?
        .strip_prefix("Bearer ")
        .ok_or(Error::Denied)
}

#[tokio::main(worker_threads = 2)]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    #[cfg(unix)]
    {
        unsafe {
            set_private_umask();
        }
    }
    let cli = Cli::parse();
    let mut kernel = Kernel::open(&cli.db)?;
    match cli.command {
        Command::InitDev => println!("{}", serde_json::to_string_pretty(&kernel.init_dev()?)?),
        Command::Doctor => println!("{}", serde_json::to_string_pretty(&kernel.integrity()?)?),
        Command::RebuildLibrary => {
            println!("{}", json!({"rebuilt_sources":kernel.rebuild_library()?}))
        }
        Command::Backup { destination } => {
            kernel.backup(&destination)?;
            println!("{}", json!({"backup":destination}));
        }
        Command::Serve { listen, simulator } => {
            if !listen.ip().is_loopback() || !simulator.ip().is_loopback() {
                return Err("development hosts must bind loopback; use an authenticated TLS proxy for remote access".into());
            }
            if !kernel.initialized()? {
                return Err("run init-dev first".into());
            }
            let state = App {
                kernel: Arc::new(Mutex::new(kernel)),
                simulator,
                sim_token: std::env::var("AKSARA_SIM_TOKEN").ok(),
                client: reqwest::Client::builder()
                    .no_proxy()
                    .timeout(std::time::Duration::from_secs(3))
                    .redirect(reqwest::redirect::Policy::none())
                    .build()?,
            };
            let app = Router::new()
                .route(
                    "/",
                    get(|| async { Html(include_str!("../../../apps/web/index.html")) }),
                )
                .route(
                    "/app.js",
                    get(|| async {
                        (
                            [(axum::http::header::CONTENT_TYPE, "text/javascript")],
                            include_str!("../../../apps/web/app.js"),
                        )
                    }),
                )
                .route(
                    "/health",
                    get(|| async {
                        Json(json!({"status":"ready","profile":"development","schema":2}))
                    }),
                )
                .route("/api/{operation}", get(api).post(api))
                .layer(DefaultBodyLimit::max(2 * 1_048_576))
                .with_state(state);
            let listener = tokio::net::TcpListener::bind(listen).await?;
            eprintln!("Aksara dev host: http://{listen}");
            axum::serve(listener, app)
                .with_graceful_shutdown(async {
                    let _ = tokio::signal::ctrl_c().await;
                })
                .await?;
        }
    }
    Ok(())
}
#[cfg(unix)]
unsafe fn set_private_umask() {
    unsafe extern "C" {
        fn umask(mask: u32) -> u32;
    }
    unsafe {
        umask(0o077);
    }
}

async fn api(
    State(app): State<App>,
    Path(operation): Path<String>,
    Query(query): Query<BTreeMap<String, String>>,
    method: Method,
    headers: HeaderMap,
    body: Bytes,
) -> ApiResult {
    let input: Value = if body.is_empty() {
        json!({})
    } else {
        serde_json::from_slice(&body).map_err(Error::from)?
    };
    let bearer = token(&headers)?.to_owned();
    let purpose = headers
        .get("x-aksara-purpose")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("knowledge")
        .to_owned();
    let lane = headers
        .get("x-aksara-lane")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_owned();
    // External invocation is outside the authority lock. Intent was committed first.
    if method == Method::POST
        && matches!(
            operation.as_str(),
            "device-execute" | "device-reconcile" | "simulator-input"
        )
    {
        let sim_token = app
            .sim_token
            .as_ref()
            .ok_or_else(|| Error::Conflict("device simulator is not configured".into()))?;
        let (ctx, command) = {
            let mut k = app
                .kernel
                .lock()
                .map_err(|_| Error::Conflict("kernel unavailable".into()))?;
            let ctx = k.context(&bearer, &lane, &purpose)?;
            let command = if operation == "device-execute" {
                k.begin_device(&ctx, field(&input, "id")?, field(&input, "lease")?)?
            } else if operation == "simulator-input" {
                if ctx.actor.role != "operator" {
                    return Err(Error::Denied.into());
                }
                input.clone()
            } else {
                k.effects_for(&ctx, field(&input, "work_id")?)?;
                json!({})
            };
            (ctx, command)
        };
        let url = if operation == "device-reconcile" {
            format!("http://{}/receipts/{}", app.simulator, field(&input, "id")?)
        } else if operation == "simulator-input" {
            format!("http://{}/input", app.simulator)
        } else {
            format!("http://{}/commands", app.simulator)
        };
        let response = if operation == "device-reconcile" {
            app.client.get(url).bearer_auth(sim_token).send().await
        } else {
            app.client
                .post(url)
                .bearer_auth(sim_token)
                .json(&command)
                .send()
                .await
        };
        let value = match response {
            Ok(r) if r.status().is_success() => r.json::<Value>().await.ok(),
            _ => None,
        };
        let mut k = app
            .kernel
            .lock()
            .map_err(|_| Error::Conflict("kernel unavailable".into()))?;
        if operation == "simulator-input" {
            return value.map(Json).ok_or_else(|| {
                Error::Conflict("simulator unavailable or input rejected".into()).into()
            });
        }
        let id = field(&input, "id")?;
        let Some(value) = value else {
            k.mark_unknown(&ctx, id)?;
            return Err(Error::Conflict(
                "OUTCOME_UNKNOWN; reconcile destination, do not retry".into(),
            )
            .into());
        };
        if std::env::var("AKSARA_FAULT").ok().as_deref() == Some("device_after_destination") {
            std::process::abort();
        }
        return Ok(Json(json!(k.reconcile_device(&ctx, id, &value)?)));
    }
    if method == Method::GET && operation == "simulator-status" {
        {
            let k = app
                .kernel
                .lock()
                .map_err(|_| Error::Conflict("kernel unavailable".into()))?;
            k.context(&bearer, &lane, &purpose)?;
        }
        let t = app
            .sim_token
            .as_ref()
            .ok_or_else(|| Error::Conflict("device simulator is not configured".into()))?;
        let r = app
            .client
            .get(format!("http://{}/state", app.simulator))
            .bearer_auth(t)
            .send()
            .await
            .map_err(|_| Error::Conflict("simulator unavailable".into()))?;
        if !r.status().is_success() {
            return Err(Error::Conflict("simulator unavailable".into()).into());
        }
        return Ok(Json(
            r.json()
                .await
                .map_err(|_| Error::Conflict("invalid simulator state".into()))?,
        ));
    }
    // SQLite and FTS work run on a blocking worker, keeping health and network I/O responsive.
    let value=tokio::task::spawn_blocking(move || -> Result<Value,Error> {
        let mut k=app.kernel.lock().map_err(|_|Error::Conflict("kernel unavailable".into()))?;
        let actor=k.authenticate(&bearer)?;
        if method==Method::GET && operation=="me" {return Ok(json!(actor));}
        if method==Method::GET && operation=="lanes" {return Ok(json!(k.lanes(&actor)?));}
        let ctx=k.context(&bearer,&lane,&purpose)?;
        let get=|key:&str|query.get(key).map(|v|v.as_str()).ok_or_else(||Error::Invalid(format!("missing query parameter: {key}")));
        let count=|key:&str,default:usize|query.get(key).map(|v|v.parse::<usize>().map_err(|_|Error::Invalid("invalid page size".into()))).unwrap_or(Ok(default));
        match (method.as_str(),operation.as_str()) {
            ("GET","search")=>Ok(json!(k.search(&ctx,get("query")?,count("limit",10)?)?)),
            ("GET","threads")=>Ok(json!(k.works(&ctx)?)),
            ("GET","thread")=>Ok(json!(k.work(&ctx,get("id")?)?)),
            ("GET","effects")=>Ok(json!(k.effects_for(&ctx,get("work_id")?)?)),
            ("GET","artifact")=>Ok(json!({"artifact":k.artifact(&ctx,get("id")?)?,"content":String::from_utf8(k.raw_source(&ctx,get("id")?)?).map_err(|_|Error::Invalid("invalid source encoding".into()))?})),
            ("GET","events")=>{let after=query.get("after").map(|v|v.parse::<i64>().map_err(|_|Error::Invalid("invalid event cursor".into()))).unwrap_or(Ok(0))?;Ok(json!(k.events(&ctx,after,count("limit",100)?)?))},
            ("GET","memories")=>Ok(json!(k.memories(&ctx)?)),
            ("GET","memory-candidates")=>Ok(json!(k.memory_candidates(&ctx)?)),
            ("GET","outbox")=>Ok(json!(k.pending_outbox(&ctx,count("limit",100)?)?)),
            ("GET","capabilities")=>Ok(json!([
                {"name":"library.lookup","class":"read","replay_safe":true},
                {"name":"artifact.create","class":"effect","idempotent":true,"approval_required":true,"network_egress":false},
                {"name":"device.indicate","class":"effect","idempotent":true,"approval_required":true,"backend":"simulator","network_egress":false}
            ])),
            ("POST","ingest")=>Ok(json!(k.ingest(&ctx,&serde_json::from_value(input)?)?)),
            ("POST","delegate")=>Ok(json!(k.delegate(&ctx,&serde_json::from_value(input)?)?)),
            ("POST","prepare")=>Ok(json!(k.prepare(&ctx,&serde_json::from_value(input)?)?)),
            ("POST","approve")=>Ok(json!(k.approve(&ctx,field(&input,"id")?,field(&input,"args_hash")?)?)),
            ("POST","execute")=>Ok(json!(k.execute_local(&ctx,field(&input,"id")?,field(&input,"lease")?)?)),
            ("POST","runtime-attach")=>Ok(json!(k.attach_runtime(&ctx,field(&input,"id")?,number(&input,"revision")?,number(&input,"generation")?,field(&input,"runtime_ref")?)?)),
            ("POST","steer")=>Ok(json!(k.steer(&ctx,field(&input,"id")?,number(&input,"revision")?,field(&input,"request")?)?)),
            ("POST","cancel")=>Ok(json!(k.cancel(&ctx,field(&input,"id")?)?)),
            ("POST","withdraw")=>{k.withdraw_artifact(&ctx,field(&input,"id")?)?;Ok(json!({"withdrawn":true}))},
            ("POST","memory-candidate")=>Ok(json!(k.memory_candidate(&ctx,&serde_json::from_value(input)?)?)),
            ("POST","memory-approve")=>Ok(json!(k.approve_memory(&ctx,field(&input,"id")?)?)),
            ("POST","memory-revoke")=>{k.revoke_memory(&ctx,field(&input,"id")?)?;Ok(json!({"revoked":true}))},
            ("POST","audience")=>Ok(json!(k.set_audience(&ctx,serde_json::from_value(input["audience"].clone())?)?)),
            ("POST","principal-revoke")=>{k.revoke_principal(&ctx,field(&input,"id")?)?;Ok(json!({"revoked":true}))},
            ("POST","identity-bind")=>{k.bind_identity(&ctx,field(&input,"provider")?,field(&input,"account")?,field(&input,"subject")?,field(&input,"principal_id")?)?;Ok(json!({"bound":true}))},
            ("POST","outbox-ack")=>{k.ack_outbox(&ctx,number(&input,"seq")?)?;Ok(json!({"acknowledged":true}))},
            ("POST","interact")=>{
                let text=field(&input,"text")?;if text.len()>16_384 {return Err(Error::Limit("interaction too long".into()));}
                let addressed=input["addressed"].as_bool().ok_or_else(||Error::Invalid("addressed boolean required".into()))?;
                if !addressed {return Ok(json!({"decision":"PASS"}));}
                if text.trim().is_empty() {return Ok(json!({"decision":"ASK","text":"What would you like me to do?"}));}
                if let Some(q)=text.strip_prefix("search ") {return Ok(json!({"decision":"ANSWER_INLINE","sources":k.search(&ctx,q,10)?}));}
                let w=k.delegate(&ctx,&DelegateRequest {request:text.into(),idempotency_key:field(&input,"idempotency_key")?.into()})?;Ok(json!({"decision":"DELEGATE","work":w}))
            },
            _=>Err(Error::NotFound),
        }
    }).await.map_err(|_|Error::Conflict("request worker failed".into()))??;
    Ok(Json(value))
}
