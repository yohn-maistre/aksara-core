#![cfg_attr(all(windows, not(debug_assertions)), windows_subsystem = "windows")]
mod host;
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
fn desktop() {
    use std::sync::{Arc, Mutex};
    use tauri::{
        menu::{Menu, MenuItem},
        tray::TrayIconBuilder,
        Manager, WebviewUrl, WebviewWindowBuilder,
    };
    let allowed: Arc<Mutex<Option<String>>> = Arc::new(Mutex::new(None));
    tauri::Builder::default()
        .setup(move |app| {
            let nav = allowed.clone();
            let window =
                WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
                    .title("Aksara")
                    .inner_size(1200.0, 820.0)
                    .min_inner_size(360.0, 520.0)
                    .on_navigation(move |url| {
                        if matches!(url.scheme(), "tauri" | "asset")
                            || (url.host_str() == Some("tauri.localhost")
                                && url.path() == "/index.html")
                        {
                            return true;
                        }
                        nav.lock()
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
            let menu_allowed = allowed.clone();
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
                            let _ = w.set_focus();
                        }
                        start_workspace(app.clone(), menu_allowed.clone());
                    }
                    "stop" => {
                        let app = app.clone();
                        std::thread::spawn(move || {
                            if host::state_directory().and_then(|s| host::stop(&s)).is_ok() {
                                app.exit(0);
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
            start_workspace(app.handle().clone(), allowed.clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Aksara desktop could not start");
}
#[cfg(windows)]
fn start_workspace(
    app: tauri::AppHandle,
    allowed: std::sync::Arc<std::sync::Mutex<Option<String>>>,
) {
    use tauri::Manager;
    std::thread::spawn(move || {
        let result: Result<String, Box<dyn std::error::Error + Send + Sync>> = (|| {
            let runtime = app.path().resource_dir()?.join("runtime");
            host::ensure(&runtime, &host::state_directory()?)
        })();
        if let Some(window) = app.get_webview_window("main") {
            match result {
                Ok(origin) => {
                    if let Ok(mut target) = allowed.lock() {
                        *target = Some(origin.clone());
                    }
                    if let Ok(url) = origin.parse() {
                        let _ = window.navigate(url);
                    }
                }
                Err(_) => {
                    let _ = window.eval("document.body.dataset.state='failed'");
                }
            }
        }
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
            let runtime = std::env::current_exe()?
                .parent()
                .ok_or("Missing installation directory")?
                .join("runtime");
            let state = host::state_directory()?;
            let origin = host::ensure(&runtime, &state)?;
            if !origin.starts_with("http://127.0.0.1:") {
                return Err("Invalid local origin".into());
            }
            host::stop(&state)
        })();
        std::process::exit(if result.is_ok() { 0 } else { 1 });
    }
    #[cfg(windows)]
    desktop();
    #[cfg(not(windows))]
    eprintln!("The native desktop distribution currently targets Windows. Use the local PWA on this platform.");
}
