//! Native host controller. No frontend IPC, OS-shell tool or new authority.
use serde::Deserialize;
use std::{
    fs,
    io::{Read, Write},
    net::{Ipv4Addr, SocketAddr, TcpStream},
    path::{Path, PathBuf},
    process::{Command, Stdio},
    thread,
    time::{Duration, Instant},
};
type Result<T> = std::result::Result<T, Box<dyn std::error::Error + Send + Sync>>;
#[derive(Deserialize)]
struct Record {
    token: String,
    control: u16,
    port: u16,
}
#[derive(Deserialize)]
struct Status {
    running: bool,
    origin: String,
}
fn bounded_file(path: &Path) -> Result<Vec<u8>> {
    let mut bytes = Vec::new();
    fs::File::open(path)?.take(16385).read_to_end(&mut bytes)?;
    if bytes.len() > 16384 {
        return Err("Local control record exceeds its limit".into());
    }
    Ok(bytes)
}
fn record(state: &Path) -> Result<Record> {
    let r: Record = serde_json::from_slice(&bounded_file(&state.join("runtime.json"))?)?;
    if r.control < 1024
        || r.port < 1024
        || r.token.len() != 64
        || !r.token.bytes().all(|b| b.is_ascii_hexdigit())
    {
        return Err("Invalid local control record".into());
    }
    Ok(r)
}
fn request(r: &Record, action: &str) -> Result<serde_json::Value> {
    let address = SocketAddr::from((Ipv4Addr::LOCALHOST, r.control));
    let mut socket = TcpStream::connect_timeout(&address, Duration::from_millis(500))?;
    socket.set_read_timeout(Some(Duration::from_secs(2)))?;
    socket.set_write_timeout(Some(Duration::from_secs(2)))?;
    let method = if action == "stop" { "POST" } else { "GET" };
    write!(socket,"{method} /{action} HTTP/1.1\r\nHost: 127.0.0.1:{}\r\nAuthorization: Bearer {}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n",r.control,r.token)?;
    let mut bytes = Vec::new();
    socket.take(16385).read_to_end(&mut bytes)?;
    if bytes.len() > 16384 {
        return Err("Local response exceeds its limit".into());
    }
    let response = std::str::from_utf8(&bytes)?;
    let (headers, body) = response
        .split_once("\r\n\r\n")
        .ok_or("Invalid local response")?;
    if !headers.starts_with("HTTP/1.1 200 ") {
        return Err("Local control rejected the request".into());
    }
    Ok(serde_json::from_str(body)?)
}
pub fn status(state: &Path) -> Result<String> {
    let r = record(state)?;
    let status: Status = serde_json::from_value(request(&r, "status")?)?;
    let expected = format!("http://127.0.0.1:{}", r.port);
    if !status.running || status.origin != expected {
        return Err("Local origin does not match its authenticated control record".into());
    }
    Ok(expected)
}
pub fn state_directory() -> Result<PathBuf> {
    if let Some(path) = std::env::var_os("AKSARA_DESKTOP_STATE") {
        return Ok(PathBuf::from(path));
    }
    Ok(PathBuf::from(
        std::env::var_os("LOCALAPPDATA")
            .ok_or("Windows local application directory unavailable")?,
    )
    .join("Aksara"))
}
fn command(program: &Path) -> Command {
    let c = Command::new(program);
    #[cfg(windows)]
    let c = {
        let mut c = c;
        use std::os::windows::process::CommandExt;
        c.creation_flags(0x08000000); // CREATE_NO_WINDOW, no shell interpreter.
        c
    };
    c
}
pub fn ensure(runtime: &Path, state: &Path) -> Result<String> {
    if let Ok(origin) = status(state) {
        return Ok(origin);
    }
    let node = runtime.join(if cfg!(windows) {
        "bin/node.exe"
    } else {
        "bin/node"
    });
    let script = runtime.join("scripts/aksara.mjs");
    if !node.is_file() || !script.is_file() {
        return Err("Installed Aksara runtime is incomplete".into());
    }
    // Installation does not grant computer access. The existing launcher owns
    // state ACLs, locks, credentials, authority children and authenticated stop.
    let mut child = command(&node)
        .arg("--use-env-proxy")
        .arg(script)
        .arg("start")
        .arg("--state")
        .arg(state)
        .current_dir(runtime)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()?;
    let deadline = Instant::now() + Duration::from_secs(120);
    while Instant::now() < deadline {
        if let Ok(origin) = status(state) {
            return Ok(origin);
        }
        if child.try_wait()?.is_some() {
            return Err(
                "Local host did not start; check installed files, ports and state ownership".into(),
            );
        }
        thread::sleep(Duration::from_millis(200));
    }
    // Never kill unrelated PIDs or erase a lock because startup was slow.
    Err("The local host is still starting or unavailable; try Open Aksara again".into())
}
pub fn stop(state: &Path) -> Result<()> {
    if !state.join("runtime.json").exists() {
        return Ok(());
    }
    let r = record(state)?;
    if request(&r, "stop")?["stopping"] != true {
        return Err("Host did not accept stop".into());
    }
    let deadline = Instant::now() + Duration::from_secs(30);
    while Instant::now() < deadline {
        if !state.join("runtime.json").exists() {
            return Ok(());
        }
        thread::sleep(Duration::from_millis(100));
    }
    Err("Host is still stopping; finish stopping it before updating".into())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::TcpListener;
    #[test]
    fn authenticated_control_cannot_redirect_the_webview_to_another_origin() {
        let listener = TcpListener::bind((Ipv4Addr::LOCALHOST, 0)).unwrap();
        let port = listener.local_addr().unwrap().port();
        let state =
            std::env::temp_dir().join(format!("aksara-native-control-{}", std::process::id()));
        fs::create_dir_all(&state).unwrap();
        fs::write(
            state.join("runtime.json"),
            serde_json::json!({"token":"a".repeat(64),"control":port,"port":7341}).to_string(),
        )
        .unwrap();
        let server = thread::spawn(move || {
            let (mut socket, _) = listener.accept().unwrap();
            let mut headers = Vec::new();
            loop {
                let mut buf = [0; 1024];
                let n = socket.read(&mut buf).unwrap();
                if n == 0 {
                    break;
                }
                headers.extend_from_slice(&buf[..n]);
                if headers.windows(4).any(|w| w == b"\r\n\r\n") {
                    break;
                }
            }
            assert!(std::str::from_utf8(&headers)
                .unwrap()
                .contains(&format!("Authorization: Bearer {}", "a".repeat(64))));
            let data = r#"{"running":true,"origin":"https://untrusted.invalid"}"#;
            write!(
                socket,
                "HTTP/1.1 200 OK\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{data}",
                data.len()
            )
            .unwrap();
        });
        assert!(status(&state).is_err());
        server.join().unwrap();
        fs::write(
            state.join("runtime.json"),
            r#"{"token":"bad\r\nInjected: value","control":9,"port":7341}"#,
        )
        .unwrap();
        assert!(record(&state).is_err());
        fs::remove_dir_all(state).unwrap();
    }
}
