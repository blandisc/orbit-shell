//! Launch Steam URLs, local apps, folders, and hide the shell while another app is in front.

use std::path::{Path, PathBuf};
use std::process::Command;
use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn launch_target(
    app: AppHandle,
    target: String,
    hide_shell: Option<bool>,
    steam_path: Option<String>,
) -> Result<(), String> {
    let target = target.trim();
    if target.is_empty() {
        return Err("Ruta o URL vacía".into());
    }

    spawn_target(target, steam_path.as_deref())?;

    if hide_shell.unwrap_or(true) {
        let _ = hide_or_minimize(app);
    }
    Ok(())
}

#[tauri::command]
pub fn hide_or_minimize(app: AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("main") {
        win.minimize().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn exit_app(app: AppHandle) {
    app.exit(0);
}

fn spawn_target(target: &str, steam_path: Option<&str>) -> Result<(), String> {
    let is_protocol = looks_like_protocol(target);
    let path = Path::new(target);

    if !is_protocol && path.is_dir() {
        return open_folder(path);
    }

    if !is_protocol && path.is_file() {
        return open_file(path);
    }

    if target.starts_with("steam://") {
        if let Some(root) = steam_path.map(PathBuf::from) {
            if let Err(e) = launch_via_steam_exe(&root, target) {
                // Fall through to protocol handler if steam.exe spawn failed.
                let _ = e;
            } else {
                return Ok(());
            }
        }
    }

    open_protocol(target)
}

fn looks_like_protocol(target: &str) -> bool {
    let lower = target.to_ascii_lowercase();
    lower.starts_with("steam://")
        || lower.starts_with("stremio://")
        || lower.starts_with("http://")
        || lower.starts_with("https://")
        || lower.starts_with("file://")
        || (lower.contains("://") && !Path::new(target).exists())
}

fn launch_via_steam_exe(root: &Path, uri: &str) -> Result<(), String> {
    let exe = {
        let a = root.join("steam.exe");
        let b = root.join("Steam.exe");
        if a.is_file() {
            a
        } else if b.is_file() {
            b
        } else {
            return Err("steam.exe no encontrado".into());
        }
    };
    spawn_detached(Command::new(exe).arg(uri))
}

fn open_file(path: &Path) -> Result<(), String> {
    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_ascii_lowercase();
    if ext == "exe" || ext == "bat" || ext == "cmd" || ext == "com" {
        let mut cmd = Command::new(path);
        if let Some(dir) = path.parent() {
            cmd.current_dir(dir);
        }
        return spawn_detached(&mut cmd);
    }
    open_protocol(&path.display().to_string())
}

fn open_folder(path: &Path) -> Result<(), String> {
    #[cfg(windows)]
    {
        return spawn_detached(Command::new("explorer").arg(path));
    }
    #[cfg(not(windows))]
    {
        open_protocol(&path.display().to_string())
    }
}

fn open_protocol(target: &str) -> Result<(), String> {
    #[cfg(windows)]
    {
        return windows_start(target);
    }
    #[cfg(target_os = "macos")]
    {
        return spawn_detached(Command::new("open").arg(target));
    }
    #[cfg(all(unix, not(target_os = "macos")))]
    {
        spawn_detached(Command::new("xdg-open").arg(target))
    }
}

#[cfg(windows)]
fn windows_start(target: &str) -> Result<(), String> {
    // `start` treats the first quoted arg as a window title.
    spawn_detached(Command::new("cmd").args(["/C", "start", "", target]))
}

fn spawn_detached(cmd: &mut Command) -> Result<(), String> {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        const DETACHED_PROCESS: u32 = 0x0000_0008;
        cmd.creation_flags(CREATE_NO_WINDOW | DETACHED_PROCESS);
    }
    cmd.spawn()
        .map(|_| ())
        .map_err(|e| format!("No se pudo abrir: {e}"))
}
