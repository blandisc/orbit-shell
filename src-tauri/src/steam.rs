//! Local Steam install detection, libraryfolders.vdf + appmanifest parsing,
//! optional non-Steam shortcuts, and local grid / library-cache art.

use serde::Serialize;
use std::collections::{BTreeMap, HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};

const FULLY_INSTALLED: u32 = 4;

const SKIP_APPIDS: &[u32] = &[
    228980,  // Steamworks Common Redistributables
    250820,  // SteamVR
    1391110, // Steam Linux Runtime 2.0
    1628350, // Steam Linux Runtime 3.0
    1070560, // Steam Linux Runtime - Soldier
    1493710, // Proton Experimental (also matched by name)
    858280, 961940, 1113280, 1245040, 1420170, 1580130, 1887720, 2180100, 2348590, 2805730,
];

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SteamGameDto {
    pub id: String,
    pub name: String,
    pub installed: bool,
    pub is_shortcut: bool,
    pub last_played: u64,
    pub local_posters: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SteamScan {
    pub found: bool,
    pub steam_path: Option<String>,
    pub games: Vec<SteamGameDto>,
    pub message: Option<String>,
}

pub fn scan_steam_library(preferred_path: Option<String>) -> SteamScan {
    let preferred = preferred_path
        .as_deref()
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .map(PathBuf::from);

    match detect_steam_root(preferred.as_deref()) {
        Some(root) => {
            let mut games = collect_installed_games(&root);
            let shortcuts = collect_shortcuts(&root);
            games.extend(shortcuts);
            games.sort_by(|a, b| {
                b.last_played
                    .cmp(&a.last_played)
                    .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
            });
            // De-dupe by id, keep first (higher last_played after sort).
            let mut seen = HashSet::new();
            games.retain(|g| seen.insert(g.id.clone()));

            let n = games.len();
            SteamScan {
                found: true,
                steam_path: Some(root.display().to_string()),
                games,
                message: Some(format!("Steam encontrado · {n} juegos")),
            }
        }
        None => SteamScan {
            found: false,
            steam_path: preferred.map(|p| p.display().to_string()),
            games: Vec::new(),
            message: Some(
                "No se encontró Steam. Instálalo o indica la ruta en Ajustes.".to_string(),
            ),
        },
    }
}

pub fn probe_path(path: String) -> bool {
    let p = path.trim();
    if p.is_empty() {
        return false;
    }
    if p.contains("://") {
        return true;
    }
    Path::new(p).exists()
}

pub fn detect_steam_root(preferred: Option<&Path>) -> Option<PathBuf> {
    let mut candidates: Vec<PathBuf> = Vec::new();
    if let Some(p) = preferred {
        candidates.push(p.to_path_buf());
    }
    candidates.extend(default_steam_candidates());

    for raw in candidates {
        if let Some(root) = normalize_steam_root(&raw) {
            return Some(root);
        }
    }
    None
}

fn default_steam_candidates() -> Vec<PathBuf> {
    let mut out = Vec::new();

    #[cfg(windows)]
    {
        if let Some(p) = registry_steam_path() {
            out.push(p);
        }
        if let Ok(pf86) = std::env::var("PROGRAMFILES(X86)") {
            out.push(PathBuf::from(pf86).join("Steam"));
        }
        if let Ok(pf) = std::env::var("PROGRAMFILES") {
            out.push(PathBuf::from(pf).join("Steam"));
        }
        out.push(PathBuf::from(r"C:\Program Files (x86)\Steam"));
        out.push(PathBuf::from(r"C:\Program Files\Steam"));
        out.push(PathBuf::from(r"D:\Steam"));
        out.push(PathBuf::from(r"D:\SteamLibrary"));
        out.push(PathBuf::from(r"E:\Steam"));
        if let Ok(local) = std::env::var("LOCALAPPDATA") {
            out.push(PathBuf::from(local).join("Steam"));
        }
        if let Ok(home) = std::env::var("USERPROFILE") {
            out.push(PathBuf::from(&home).join("Steam"));
            out.push(PathBuf::from(home).join("Games").join("Steam"));
        }
    }

    #[cfg(not(windows))]
    {
        if let Ok(home) = std::env::var("HOME") {
            let home = PathBuf::from(home);
            out.push(home.join(".local/share/Steam"));
            out.push(home.join(".steam/steam"));
            out.push(home.join(".steam/root"));
            out.push(home.join(".var/app/com.valvesoftware.Steam/data/Steam"));
            out.push(home.join("snap/steam/common/.local/share/Steam"));
        }
        out.push(PathBuf::from("/usr/share/steam"));
    }

    out
}

#[cfg(windows)]
fn registry_steam_path() -> Option<PathBuf> {
    use winreg::enums::*;
    use winreg::RegKey;

    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    if let Ok(key) = hkcu.open_subkey(r"Software\Valve\Steam") {
        if let Ok(path) = key.get_value::<String, _>("SteamPath") {
            let p = PathBuf::from(path.replace('/', "\\"));
            if looks_like_steam_root(&p) {
                return Some(p);
            }
        }
    }
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    for sub in [r"SOFTWARE\WOW6432Node\Valve\Steam", r"SOFTWARE\Valve\Steam"] {
        if let Ok(key) = hklm.open_subkey(sub) {
            if let Ok(path) = key.get_value::<String, _>("InstallPath") {
                let p = PathBuf::from(path);
                if looks_like_steam_root(&p) {
                    return Some(p);
                }
            }
        }
    }
    None
}

fn looks_like_steam_root(path: &Path) -> bool {
    if !path.exists() {
        return false;
    }
    path.join("steam.exe").is_file()
        || path.join("Steam.exe").is_file()
        || path.join("steam.sh").is_file()
        || path.join("steamapps").is_dir()
        || path.join("steamapps").join("libraryfolders.vdf").is_file()
        || path.join("libraryfolders.vdf").is_file()
}

fn normalize_steam_root(path: &Path) -> Option<PathBuf> {
    if looks_like_steam_root(path) {
        // If the user pointed at steamapps, climb one level.
        if path
            .file_name()
            .and_then(|n| n.to_str())
            .is_some_and(|n| n.eq_ignore_ascii_case("steamapps"))
        {
            return path.parent().map(|p| p.to_path_buf());
        }
        return Some(path.to_path_buf());
    }
    None
}

fn collect_installed_games(steam_root: &Path) -> Vec<SteamGameDto> {
    let libraries = steam_library_dirs(steam_root);
    let mut last_played = collect_last_played(steam_root);
    let mut games = Vec::new();

    for lib in libraries {
        let steamapps = if lib.join("steamapps").is_dir() {
            lib.join("steamapps")
        } else {
            lib.clone()
        };
        let Ok(entries) = fs::read_dir(&steamapps) else {
            continue;
        };
        for entry in entries.flatten() {
            let name = entry.file_name();
            let name = name.to_string_lossy();
            if !name.starts_with("appmanifest_") || !name.ends_with(".acf") {
                continue;
            }
            let path = entry.path();
            let Some(text) = read_text(&path) else {
                continue;
            };
            let Ok(vdf) = parse_vdf(&text) else {
                continue;
            };
            let app = vdf.get("AppState").cloned().unwrap_or(vdf);
            let appid = app
                .get("appid")
                .and_then(Vdf::as_str)
                .and_then(|s| s.parse::<u32>().ok())
                .unwrap_or(0);
            let game_name = app
                .get("name")
                .and_then(Vdf::as_str)
                .unwrap_or("")
                .trim()
                .to_string();
            let flags = app
                .get("StateFlags")
                .and_then(Vdf::as_str)
                .and_then(|s| s.parse::<u32>().ok())
                .unwrap_or(0);
            if appid == 0 || game_name.is_empty() {
                continue;
            }
            if flags & FULLY_INSTALLED == 0 {
                continue;
            }
            if is_noise(appid, &game_name) {
                continue;
            }
            let acf_played = app
                .get("LastPlayed")
                .and_then(Vdf::as_str)
                .and_then(|s| s.parse::<u64>().ok())
                .unwrap_or(0);
            let acf_updated = app
                .get("LastUpdated")
                .and_then(Vdf::as_str)
                .and_then(|s| s.parse::<u64>().ok())
                .unwrap_or(0);
            let played = last_played.remove(&appid).unwrap_or(0).max(acf_played).max(acf_updated);

            let local_posters = find_local_art(steam_root, appid);
            games.push(SteamGameDto {
                id: appid.to_string(),
                name: game_name,
                installed: true,
                is_shortcut: false,
                last_played: played,
                local_posters,
            });
        }
    }
    games
}

fn steam_library_dirs(steam_root: &Path) -> Vec<PathBuf> {
    let mut dirs = vec![steam_root.to_path_buf()];
    let vdf_path = steam_root.join("steamapps").join("libraryfolders.vdf");
    if let Some(text) = read_text(&vdf_path) {
        if let Ok(vdf) = parse_vdf(&text) {
            let table = vdf
                .get("libraryfolders")
                .or_else(|| vdf.get("LibraryFolders"))
                .cloned()
                .unwrap_or(vdf);
            if let Some(map) = table.as_table() {
                for (key, value) in map {
                    if key.eq_ignore_ascii_case("TimeNextStatsReport")
                        || key.eq_ignore_ascii_case("ContentStatsID")
                    {
                        continue;
                    }
                    let path = match value {
                        Vdf::String(s) => Some(s.as_str()),
                        Vdf::Table(_) => value.get("path").and_then(Vdf::as_str),
                    };
                    if let Some(p) = path {
                        let cleaned = p.replace("\\\\", "\\");
                        let pb = PathBuf::from(cleaned);
                        if pb.exists() {
                            dirs.push(pb);
                        }
                    }
                }
            }
        }
    }
    dirs.sort();
    dirs.dedup();
    dirs
}

fn collect_last_played(steam_root: &Path) -> HashMap<u32, u64> {
    let mut out = HashMap::new();
    let userdata = steam_root.join("userdata");
    let Ok(users) = fs::read_dir(&userdata) else {
        return out;
    };
    for user in users.flatten() {
        let local = user.path().join("config").join("localconfig.vdf");
        let Ok(meta) = fs::metadata(&local) else {
            continue;
        };
        // localconfig.vdf can be tens of MB; skip huge files so first paint stays snappy.
        if meta.len() > 2_000_000 {
            continue;
        }
        let Some(text) = read_text(&local) else {
            continue;
        };
        if let Ok(vdf) = parse_vdf(&text) {
            harvest_last_played(&vdf, &mut out);
        }
    }
    out
}

fn harvest_last_played(vdf: &Vdf, out: &mut HashMap<u32, u64>) {
    if let Some(table) = vdf.as_table() {
        for (k, v) in table {
            if let Some(child) = v.as_table() {
                if let Ok(appid) = k.parse::<u32>() {
                    let lp = child
                        .iter()
                        .find(|(ck, _)| ck.eq_ignore_ascii_case("LastPlayed"))
                        .map(|(_, val)| val)
                        .and_then(Vdf::as_str)
                        .and_then(|s| s.parse::<u64>().ok())
                        .unwrap_or(0);
                    if lp > 0 {
                        let e = out.entry(appid).or_insert(0);
                        if lp > *e {
                            *e = lp;
                        }
                    }
                }
                harvest_last_played(v, out);
            }
        }
    }
}

fn collect_shortcuts(steam_root: &Path) -> Vec<SteamGameDto> {
    let mut games = Vec::new();
    let userdata = steam_root.join("userdata");
    let Ok(users) = fs::read_dir(&userdata) else {
        return games;
    };
    for user in users.flatten() {
        let config_dir = user.path().join("config");
        let shortcuts = config_dir.join("shortcuts.vdf");
        let Ok(bytes) = fs::read(&shortcuts) else {
            continue;
        };
        for sc in parse_shortcuts_vdf(&bytes) {
            if sc.hidden || sc.name.trim().is_empty() {
                continue;
            }
            let mut posters = find_grid_art(&config_dir.join("grid"), sc.appid);
            if let Some(icon) = sc.icon {
                if Path::new(&icon).is_file() {
                    posters.push(icon);
                }
            }
            games.push(SteamGameDto {
                id: sc.appid.to_string(),
                name: sc.name,
                installed: true,
                is_shortcut: true,
                last_played: sc.last_play_time,
                local_posters: posters,
            });
        }
    }
    games
}

fn find_local_art(steam_root: &Path, appid: u32) -> Vec<String> {
    let mut out = Vec::new();
    let id = appid.to_string();

    // Per-user grid (custom SteamGridDB / client art).
    if let Ok(users) = fs::read_dir(steam_root.join("userdata")) {
        for user in users.flatten() {
            out.extend(find_grid_art(&user.path().join("config").join("grid"), appid));
        }
    }

    // Official library cache — old flat layout and hashed subfolders.
    let cache = steam_root.join("appcache").join("librarycache");
    let flat_patterns = [
        format!("{id}_library_600x900.jpg"),
        format!("{id}_library_600x900.png"),
        format!("{id}_library_600x900_2x.jpg"),
        format!("{id}_library_hero.jpg"),
        format!("{id}_header.jpg"),
    ];
    for name in flat_patterns {
        let p = cache.join(&name);
        if p.is_file() {
            out.push(p.display().to_string());
        }
    }
    let nested = cache.join(&id);
    if nested.is_dir() {
        if let Ok(entries) = fs::read_dir(&nested) {
            let mut nested_hits: Vec<PathBuf> = Vec::new();
            for entry in entries.flatten() {
                let n = entry.file_name().to_string_lossy().to_lowercase();
                if n.contains("library_600x900")
                    || n.contains("library_hero")
                    || n == "header.jpg"
                    || n == "header.png"
                {
                    nested_hits.push(entry.path());
                }
            }
            nested_hits.sort_by_key(|p| {
                let n = p.file_name().and_then(|s| s.to_str()).unwrap_or("");
                if n.contains("library_600x900") {
                    0
                } else if n.contains("library_hero") {
                    1
                } else {
                    2
                }
            });
            for p in nested_hits {
                out.push(p.display().to_string());
            }
        }
    }

    out.sort();
    out.dedup();
    out
}

fn find_grid_art(grid: &Path, appid: u32) -> Vec<String> {
    if !grid.is_dir() {
        return Vec::new();
    }
    let id = appid.to_string();
    let names = [
        format!("{id}p.png"),
        format!("{id}p.jpg"),
        format!("{id}p.webp"),
        format!("{id}.png"),
        format!("{id}.jpg"),
        format!("{id}.webp"),
        format!("{id}_hero.png"),
        format!("{id}_hero.jpg"),
        format!("{id}_logo.png"),
    ];
    let mut out = Vec::new();
    for name in names {
        let p = grid.join(name);
        if p.is_file() {
            out.push(p.display().to_string());
        }
    }
    out
}

fn is_noise(appid: u32, name: &str) -> bool {
    if SKIP_APPIDS.contains(&appid) {
        return true;
    }
    let n = name.to_ascii_lowercase();
    n.contains("steamworks common redistributable")
        || n.starts_with("proton ")
        || n.contains("proton experimental")
        || n.contains("proton hotfix")
        || n.contains("steam linux runtime")
        || n.contains("steam runtime")
        || n.contains("steamvr")
        || n.ends_with("dedicated server")
        || n.contains("server dedicated")
}

fn read_text(path: &Path) -> Option<String> {
    let bytes = fs::read(path).ok()?;
    if bytes.len() >= 2 && bytes[0] == 0xFF && bytes[1] == 0xFE {
        let u16s: Vec<u16> = bytes[2..]
            .chunks_exact(2)
            .map(|c| u16::from_le_bytes([c[0], c[1]]))
            .collect();
        return Some(String::from_utf16_lossy(&u16s));
    }
    if bytes.len() >= 3 && bytes[0] == 0xEF && bytes[1] == 0xBB && bytes[2] == 0xBF {
        return String::from_utf8(bytes[3..].to_vec())
            .ok()
            .or_else(|| Some(bytes[3..].iter().map(|&b| b as char).collect()));
    }
    String::from_utf8(bytes.clone())
        .ok()
        .or_else(|| Some(bytes.iter().map(|&b| b as char).collect()))
}

/* ——— Text VDF ——— */

#[derive(Debug, Clone, PartialEq)]
enum Vdf {
    String(String),
    Table(BTreeMap<String, Vdf>),
}

impl Vdf {
    fn as_str(&self) -> Option<&str> {
        match self {
            Vdf::String(s) => Some(s),
            Vdf::Table(_) => None,
        }
    }
    fn as_table(&self) -> Option<&BTreeMap<String, Vdf>> {
        match self {
            Vdf::Table(t) => Some(t),
            Vdf::String(_) => None,
        }
    }
    fn get(&self, key: &str) -> Option<&Vdf> {
        let table = self.as_table()?;
        table.get(key).or_else(|| {
            table
                .iter()
                .find(|(k, _)| k.eq_ignore_ascii_case(key))
                .map(|(_, v)| v)
        })
    }
}

struct Parser<'a> {
    s: &'a [u8],
    i: usize,
}

impl<'a> Parser<'a> {
    fn eof(&self) -> bool {
        self.i >= self.s.len()
    }
    fn peek(&self) -> Option<u8> {
        self.s.get(self.i).copied()
    }
    fn skip(&mut self) {
        while !self.eof() {
            match self.peek() {
                Some(b' ') | Some(b'\t') | Some(b'\n') | Some(b'\r') => self.i += 1,
                Some(b'/') if self.s.get(self.i + 1) == Some(&b'/') => {
                    while !self.eof() && self.peek() != Some(b'\n') {
                        self.i += 1;
                    }
                }
                _ => break,
            }
        }
    }
    fn parse_quoted(&mut self) -> Result<String, String> {
        if self.peek() != Some(b'"') {
            return Err("expected quoted string".into());
        }
        self.i += 1;
        let mut out = String::new();
        while !self.eof() {
            let c = self.s[self.i];
            self.i += 1;
            match c {
                b'"' => return Ok(out),
                b'\\' => {
                    if let Some(n) = self.peek() {
                        self.i += 1;
                        match n {
                            b'n' => out.push('\n'),
                            b't' => out.push('\t'),
                            b'"' => out.push('"'),
                            b'\\' => out.push('\\'),
                            other => out.push(other as char),
                        }
                    }
                }
                _ => out.push(c as char),
            }
        }
        Err("unterminated string".into())
    }
    fn parse_ident(&mut self) -> String {
        let start = self.i;
        while let Some(c) = self.peek() {
            if c.is_ascii_whitespace() || c == b'{' || c == b'}' || c == b'"' {
                break;
            }
            self.i += 1;
        }
        String::from_utf8_lossy(&self.s[start..self.i]).into_owned()
    }
    fn parse_key(&mut self) -> Result<String, String> {
        self.skip();
        if self.peek() == Some(b'"') {
            self.parse_quoted()
        } else if self.eof() || self.peek() == Some(b'}') {
            Err("no key".into())
        } else {
            Ok(self.parse_ident())
        }
    }
    fn parse_value(&mut self) -> Result<Vdf, String> {
        self.skip();
        match self.peek() {
            Some(b'{') => {
                self.i += 1;
                let mut map = BTreeMap::new();
                loop {
                    self.skip();
                    if self.peek() == Some(b'}') {
                        self.i += 1;
                        break;
                    }
                    if self.eof() {
                        return Err("unterminated table".into());
                    }
                    let key = self.parse_key()?;
                    let val = self.parse_value()?;
                    map.insert(key, val);
                }
                Ok(Vdf::Table(map))
            }
            Some(b'"') => Ok(Vdf::String(self.parse_quoted()?)),
            Some(_) => Ok(Vdf::String(self.parse_ident())),
            None => Err("unexpected eof".into()),
        }
    }
}

fn parse_vdf(input: &str) -> Result<Vdf, String> {
    let mut p = Parser {
        s: input.as_bytes(),
        i: 0,
    };
    let mut root = BTreeMap::new();
    p.skip();
    while !p.eof() {
        if p.peek() == Some(b'}') {
            break;
        }
        let key = p.parse_key()?;
        let val = p.parse_value()?;
        root.insert(key, val);
        p.skip();
    }
    Ok(Vdf::Table(root))
}

/* ——— Binary shortcuts.vdf ——— */

struct Shortcut {
    appid: u32,
    name: String,
    icon: Option<String>,
    hidden: bool,
    last_play_time: u64,
}

fn parse_shortcuts_vdf(bytes: &[u8]) -> Vec<Shortcut> {
    let mut cur = BinCursor { data: bytes, pos: 0 };
    let mut out = Vec::new();
    // Root is typically a nested object keyed "shortcuts".
    let root = match read_bin_object_auto(&mut cur) {
        Some(m) => m,
        None => return out,
    };
    let shortcuts = root
        .get("shortcuts")
        .cloned()
        .or_else(|| root.values().next().cloned())
        .unwrap_or_else(|| BinVal::Obj(root));
    if let BinVal::Obj(map) = shortcuts {
        for (_idx, val) in map {
            if let BinVal::Obj(fields) = val {
                let name = string_field(&fields, &["AppName", "appname"]);
                if name.is_empty() {
                    continue;
                }
                let appid = int_field(&fields, &["appid", "AppID", "appId"]).unwrap_or(0);
                let icon = string_field(&fields, &["icon", "Icon"]);
                let hidden = int_field(&fields, &["IsHidden", "hidden"]).unwrap_or(0) != 0;
                let last = int_field(&fields, &["LastPlayTime", "lastplaytime"]).unwrap_or(0) as u64;
                let exe = string_field(&fields, &["Exe", "exe"]);
                let computed = if appid == 0 {
                    steam_shortcut_appid(&exe, &name)
                } else {
                    appid
                };
                out.push(Shortcut {
                    appid: computed,
                    name,
                    icon: if icon.is_empty() { None } else { Some(icon) },
                    hidden,
                    last_play_time: last,
                });
            }
        }
    }
    out
}

fn string_field(fields: &BTreeMap<String, BinVal>, keys: &[&str]) -> String {
    for k in keys {
        if let Some(BinVal::Str(s)) = get_ci(fields, k) {
            return s.trim_matches('"').trim().to_string();
        }
    }
    String::new()
}

fn int_field(fields: &BTreeMap<String, BinVal>, keys: &[&str]) -> Option<u32> {
    for k in keys {
        match get_ci(fields, k) {
            Some(BinVal::Int(v)) => return Some(*v as u32),
            Some(BinVal::Str(s)) => {
                if let Ok(v) = s.parse::<u32>() {
                    return Some(v);
                }
            }
            _ => {}
        }
    }
    None
}

fn get_ci<'a>(fields: &'a BTreeMap<String, BinVal>, key: &str) -> Option<&'a BinVal> {
    fields.get(key).or_else(|| {
        fields
            .iter()
            .find(|(k, _)| k.eq_ignore_ascii_case(key))
            .map(|(_, v)| v)
    })
}

/// Steam non-Steam shortcut appid: crc32(exe + name) | 0x80000000
fn steam_shortcut_appid(exe: &str, name: &str) -> u32 {
    let mut s = exe.to_string();
    s.push_str(name);
    crc32_ieee(s.as_bytes()) | 0x8000_0000
}

fn crc32_ieee(data: &[u8]) -> u32 {
    let mut crc = 0xFFFF_FFFFu32;
    for &b in data {
        crc ^= b as u32;
        for _ in 0..8 {
            let mask = if crc & 1 != 0 { 0xFFFF_FFFF } else { 0 };
            crc = (crc >> 1) ^ (0xEDB8_8320 & mask);
        }
    }
    !crc
}

#[derive(Clone)]
enum BinVal {
    Str(String),
    Int(i32),
    Obj(BTreeMap<String, BinVal>),
}

struct BinCursor<'a> {
    data: &'a [u8],
    pos: usize,
}

impl<'a> BinCursor<'a> {
    fn rest(&self) -> &[u8] {
        self.data.get(self.pos..).unwrap_or(&[])
    }
    fn u8(&mut self) -> Option<u8> {
        let b = *self.data.get(self.pos)?;
        self.pos += 1;
        Some(b)
    }
    fn cstr(&mut self) -> Option<String> {
        let rest = self.rest();
        let n = rest.iter().position(|&b| b == 0)?;
        let s = String::from_utf8_lossy(&rest[..n]).into_owned();
        self.pos += n + 1;
        Some(s)
    }
    fn i32(&mut self) -> Option<i32> {
        let rest = self.rest();
        if rest.len() < 4 {
            return None;
        }
        let v = i32::from_le_bytes([rest[0], rest[1], rest[2], rest[3]]);
        self.pos += 4;
        Some(v)
    }
    fn skip(&mut self, n: usize) {
        self.pos = (self.pos + n).min(self.data.len());
    }
}

fn read_bin_object_auto(cur: &mut BinCursor) -> Option<BTreeMap<String, BinVal>> {
    // File may start with 0x00 "shortcuts" 0x00 … or a raw object.
    if cur.rest().first() == Some(&0x00) {
        cur.u8()?;
        let key = cur.cstr()?;
        let obj = read_bin_object(cur)?;
        let mut root = BTreeMap::new();
        root.insert(key, BinVal::Obj(obj));
        return Some(root);
    }
    read_bin_object(cur)
}

fn read_bin_object(cur: &mut BinCursor) -> Option<BTreeMap<String, BinVal>> {
    let mut map = BTreeMap::new();
    loop {
        let typ = match cur.u8() {
            Some(t) => t,
            None => break,
        };
        if typ == 0x08 || typ == 0x0B {
            break;
        }
        let key = cur.cstr()?;
        let val = match typ {
            0x00 => BinVal::Obj(read_bin_object(cur)?),
            0x01 => BinVal::Str(cur.cstr()?),
            0x02 => BinVal::Int(cur.i32()?),
            0x03 | 0x04 | 0x06 => {
                cur.skip(4);
                continue;
            }
            0x05 => {
                let _ = cur.cstr();
                continue;
            }
            0x07 | 0x0A => {
                cur.skip(8);
                continue;
            }
            _ => break,
        };
        map.insert(key, val);
    }
    Some(map)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_libraryfolders_modern() {
        let src = r#"
"libraryfolders"
{
	"0"
	{
		"path"		"C:\\Program Files (x86)\\Steam"
		"apps"
		{
			"570"		"1"
		}
	}
	"1"
	{
		"path"		"D:\\SteamLibrary"
	}
}
"#;
        let v = parse_vdf(src).unwrap();
        let libs = v.get("libraryfolders").unwrap();
        assert_eq!(
            libs.get("0").unwrap().get("path").unwrap().as_str().unwrap(),
            r"C:\Program Files (x86)\Steam"
        );
        assert_eq!(
            libs.get("1").unwrap().get("path").unwrap().as_str().unwrap(),
            r"D:\SteamLibrary"
        );
    }

    #[test]
    fn parse_appmanifest() {
        let src = r#"
"AppState"
{
	"appid"		"570"
	"name"		"Dota 2"
	"StateFlags"		"4"
	"LastUpdated"		"1700000000"
}
"#;
        let v = parse_vdf(src).unwrap();
        let app = v.get("AppState").unwrap();
        assert_eq!(app.get("name").unwrap().as_str().unwrap(), "Dota 2");
        assert_eq!(app.get("StateFlags").unwrap().as_str().unwrap(), "4");
    }

    #[test]
    fn noise_filters_redistributables() {
        assert!(is_noise(228980, "Steamworks Common Redistributables"));
        assert!(is_noise(1, "Proton 9.0"));
        assert!(!is_noise(570, "Dota 2"));
        assert!(!is_noise(1245620, "ELDEN RING"));
    }

    #[test]
    fn scan_temp_steam_library() {
        let root = std::env::temp_dir().join(format!("orbit-steam-test-{}", std::process::id()));
        let steamapps = root.join("steamapps");
        fs::create_dir_all(&steamapps).unwrap();
        fs::write(
            steamapps.join("libraryfolders.vdf"),
            r#"
"libraryfolders"
{
	"0"
	{
		"path"		"__ROOT__"
	}
}
"#
            .replace("__ROOT__", &root.display().to_string().replace('\\', "\\\\")),
        )
        .unwrap();
        fs::write(
            steamapps.join("appmanifest_570.acf"),
            r#"
"AppState"
{
	"appid"		"570"
	"name"		"Dota 2"
	"StateFlags"		"4"
}
"#,
        )
        .unwrap();
        fs::write(
            steamapps.join("appmanifest_228980.acf"),
            r#"
"AppState"
{
	"appid"		"228980"
	"name"		"Steamworks Common Redistributables"
	"StateFlags"		"4"
}
"#,
        )
        .unwrap();
        fs::write(
            steamapps.join("appmanifest_1.acf"),
            r#"
"AppState"
{
	"appid"		"1"
	"name"		"Not Installed"
	"StateFlags"		"1"
}
"#,
        )
        .unwrap();
        let games = collect_installed_games(&root);
        let _ = fs::remove_dir_all(&root);
        assert_eq!(games.len(), 1);
        assert_eq!(games[0].id, "570");
        assert_eq!(games[0].name, "Dota 2");
    }
}
