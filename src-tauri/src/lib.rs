mod launch;
mod steam;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn scan_steam_library(preferred_path: Option<String>) -> steam::SteamScan {
    steam::scan_steam_library(preferred_path)
}

#[tauri::command]
fn probe_path(path: String) -> bool {
    steam::probe_path(path)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            scan_steam_library,
            probe_path,
            launch::launch_target,
            launch::hide_or_minimize,
            launch::exit_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
