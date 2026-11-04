#![cfg_attr(all(windows, not(debug_assertions)), windows_subsystem = "windows")]
mod host;
#[cfg(windows)]
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc, Mutex,
};
#[cfg(windows)]
#[derive(Default)]
struct Workspace {
    origin: Mutex<Option<String>>,
    starting: AtomicBool,
}
#[cfg(windows)]
fn bootstrap(url: &tauri::Url) -> bool {
    ((url.scheme() == "tauri" && url.host_str() == Some("localhost"))
        || url.origin().ascii_serialization() == "http://tauri.localhost")
        && url.port().is_none()
        && url.username().is_empty()
        && url.password().is_none()
        && url.query().is_none()
        && matches!(url.path(), "" | "/" | "/index.html")
}
#[cfg(windows)]
fn open_browser(url: &tauri::Url) {
    if url.scheme() == "https" && url.username().is_empty() && url.password().is_none() {
        use std::os::windows::process::CommandExt;
        let _ = std::process::Command::new("rundll32.exe")
            .args(["url.dll,FileProtocolHandler", url.as_str()])
            .creation_flags(0x08000000)
            .spawn();
    }
}
#[cfg(windows)]
fn startup_view(window: &tauri::WebviewWindow, failed: bool, detail: &str) {
    // Native-authored bounded diagnostic data goes to textContent, never HTML.
    // Do not inject bootstrap status into a running workspace or another origin.
    if window.url().ok().is_some_and(|url| bootstrap(&url)) {
        let state = if failed { "failed" } else { "loading" };
        let detail = serde_json::to_string(detail)
            .unwrap_or_else(|_| "\"Startup details unavailable\"".into());
        let _ = window.eval(format!("document.body.dataset.state='{state}';document.getElementById('startup-detail').textContent={detail};document.getElementById('startup-progress').textContent={detail}"));
    }
}
#[cfg(windows)]
fn desktop(test: Option<bool>) {
    use tauri::{
        menu::{Menu, MenuItem},
        tray::TrayIconBuilder,
        Manager, WebviewUrl, WebviewWindowBuilder,
    };
    let workspace = Arc::new(Workspace::default());
    tauri::Builder::default()
        .setup(move |app| {
            let nav = workspace.clone();
            let nav_app = app.handle().clone();
            let window =
                WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
                    .title("Aksara")
                    .center()
                    .inner_size(1200.0, 820.0)
                    .min_inner_size(360.0, 520.0)
                    .on_navigation(move |url| {
                        // A single bootstrap-only retry link, without native IPC or an
                        // external navigation. It cannot be called from the workbench.
                        let mut retry_url = url.clone();
                        retry_url.set_path("/");
                        if url.path() == "/retry" && bootstrap(&retry_url) {
                            if nav_app
                                .get_webview_window("main")
                                .and_then(|w| w.url().ok())
                                .is_some_and(|u| bootstrap(&u))
                            {
                                start_workspace(nav_app.clone(), nav.clone());
                            }
                            return false;
                        }
                        bootstrap(url)
                            || nav
                                .origin
                                .lock()
                                .ok()
                                .and_then(|v| v.clone())
                                .is_some_and(|origin| url.origin().ascii_serialization() == origin)
                    })
                    .on_new_window(|url, _| {
                        open_browser(&url);
                        tauri::webview::NewWindowResponse::Deny
                    })
                    .build()?;
            let open = MenuItem::with_id(app, "open", "Open Aksara", true, None::<&str>)?;
            let stop = MenuItem::with_id(app, "stop", "Stop Aksara and quit", true, None::<&str>)?;
            let quit = MenuItem::with_id(
                app,
                "quit",
                "Quit desktop (keep host running)",
                true,
                None::<&str>,
            )?;
            let menu = Menu::with_items(app, &[&open, &stop, &quit])?;
            let app_handle = app.handle().clone();
            let menu_workspace = workspace.clone();
            TrayIconBuilder::new()
                .icon(
                    app.default_window_icon()
                        .ok_or("App icon unavailable")?
                        .clone(),
                )
                .tooltip("Aksara · local workspace")
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(move |app, event| match event.id.as_ref() {
                    "open" => {
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.unminimize();
                            let _ = w.set_focus();
                        }
                        start_workspace(app.clone(), menu_workspace.clone());
                    }
                    "stop" => {
                        let app = app.clone();
                        std::thread::spawn(move || {
                            match host::state_directory().and_then(|s| host::stop(&s)) {
                                Ok(()) => app.exit(0),
                                Err(_) => {
                                    if let Some(w) = app.get_webview_window("main") {
                                        let _ = w.show();
                                        let _ = w.set_title(
                                            "Aksara · host could not stop; use the installed CLI",
                                        );
                                    }
                                }
                            }
                        });
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(app)?;
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    if let Some(w) = app_handle.get_webview_window("main") {
                        let _ = w.hide();
                    }
                }
            });
            start_workspace(app.handle().clone(), workspace.clone());
            if let Some(expect_failure) = test {
                qualify_webview(app.handle().clone(), workspace.clone(), expect_failure);
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Aksara desktop could not start");
}
#[cfg(windows)]
fn start_workspace(app: tauri::AppHandle, workspace: Arc<Workspace>) {
    use tauri::Manager;
    if workspace
        .starting
        .compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire)
        .is_err()
    {
        return;
    }
    if let Some(w) = app.get_webview_window("main") {
        startup_view(&w, false, "Starting your local workspace…");
    }
    std::thread::spawn(move || {
        let progress_app = app.clone();
        let result: Result<String, Box<dyn std::error::Error + Send + Sync>> = (|| {
            host::ensure_with_progress(
                &host::installed_runtime()?,
                &host::state_directory()?,
                move |report| {
                    if let Some(w) = progress_app.get_webview_window("main") {
                        startup_view(&w, false, &format!("Starting: {}…", report.stage));
                    }
                },
            )
        })();
        workspace.starting.store(false, Ordering::Release);
        if let Some(window) = app.get_webview_window("main") {
            match result {
                Ok(origin) => {
                    if let Ok(mut target) = workspace.origin.lock() {
                        *target = Some(origin.clone());
                    }
                    if window
                        .url()
                        .ok()
                        .is_some_and(|url| url.origin().ascii_serialization() == origin)
                    {
                        return;
                    }
                    if let Ok(url) = origin.parse() {
                        if window.navigate(url).is_err() {
                            startup_view(&window, true, "The host is ready, but this window could not open it. Try again or use http://127.0.0.1:7341 in your browser.");
                        }
                    }
                }
                Err(error) => startup_view(&window, true, &error.to_string()),
            }
        }
    });
}
#[cfg(windows)]
fn qualify_webview(app: tauri::AppHandle, workspace: Arc<Workspace>, expect_failure: bool) {
    use tauri::Manager;
    // Test-only native DOM evaluation: no JS-to-native command or account/model
    // action. Verify the actual installed WebView, React and profiles API.
    std::thread::spawn(move || {
        let deadline = std::time::Instant::now() + std::time::Duration::from_secs(180);
        let mut passed = false;
        while std::time::Instant::now() < deadline {
            if let Some(w) = app.get_webview_window("main") {
                let current = w.url().ok();
                let correct_origin = if expect_failure {
                    current.as_ref().is_some_and(bootstrap)
                } else {
                    let expected = workspace.origin.lock().ok().and_then(|v| v.clone());
                    current
                        .as_ref()
                        .zip(expected)
                        .is_some_and(|(url, origin)| url.origin().ascii_serialization() == origin)
                };
                if correct_origin {
                    let js = if expect_failure {
                        "document.body.dataset.state==='failed' && document.getElementById('startup-detail')?.textContent.includes('INSTANCE_OWNED')"
                    } else {
                        "!!document.querySelector('#root .welcome .profile-list button')"
                    };
                    let (tx, rx) = std::sync::mpsc::channel();
                    if w.eval_with_callback(js, move |value| {
                        let _ = tx.send(value);
                    })
                    .is_ok()
                        && rx
                            .recv_timeout(std::time::Duration::from_secs(2))
                            .is_ok_and(|v| v == "true")
                    {
                        passed = true;
                        break;
                    }
                }
            }
            std::thread::sleep(std::time::Duration::from_millis(250));
        }
        let stopped = host::state_directory().and_then(|s| host::stop(&s)).is_ok();
        app.exit(if passed && stopped { 0 } else { 1 });
    });
}
fn main() {
    let mode = std::env::args().nth(1);
    if mode.as_deref() == Some("--stop-host") {
        std::process::exit(
            if host::state_directory().and_then(|s| host::stop(&s)).is_ok() {
                0
            } else {
                1
            },
        );
    }
    if mode.as_deref() == Some("--smoke-test") {
        let result = (|| {
            let state = host::state_directory()?;
            host::ensure(&host::installed_runtime()?, &state)?;
            host::stop(&state)
        })();
        if let Err(error) = &result {
            eprintln!("{error}");
        }
        std::process::exit(if result.is_ok() { 0 } else { 1 });
    }
    #[cfg(windows)]
    desktop(match mode.as_deref() {
        Some("--ui-smoke-test") => Some(false),
        Some("--ui-failure-test") => Some(true),
        _ => None,
    });
    #[cfg(not(windows))]
    eprintln!("The native desktop distribution currently targets Windows. Use the local PWA on this platform.");
}
