# Orbit Shell — MVP build prompt

Build a lightweight Windows handheld console shell: **Orbit Shell**.

## Product (shareable, not Fernando-only)
- Transparent launcher: reads Steam, launches existing apps. No reinstalling games.
- Easy config + first-run wizard + **export/import one JSON** (shareable).
- Library = **Steam only** (incl. non-Steam shortcuts already in Steam — many users put emulation there via plugins/SRM).
- Dock: Steam | Emulators (ES-DE) | Stremio | Grok (URL) | Desktop (exit) | optional Open SD/ROMs folder.
- Themes (CSS tokens): B2 Green CRT, A-Prime Ultra-minimal, C Nordic. Chrome themed; covers full color.
- Carousel: depth posters from Steam art; collection = All / Favorites / curated set.
- Responsive: Legion Go handheld vs docked/large.
- States: empty, loading, offline, launching.
- Stack: **Tauri 2 + web UI**. Avoid Electron.
- First-timers: wizard detects Steam; optional guided **emulator → Steam** path (Steam ROM Manager style; opt-in; never pirate ROMs).
- README for install/share. Default paths as placeholders, not hardcoded personal paths.
- Reference assets in `/workspace/legion-shell/` (themes, icons, backgrounds, wireframes).

## Done when
- Project scaffolds and documents build commands
- App shell UI with 3 themes + dock + carousel (mock Steam data OK if Steam not present)
- Config JSON export/import
- README with first-timer + optional SRM flow
- Runnable MVP preferred over polish

Copy useful assets from ../legion-shell into this repo's public/assets.


## Product decision (2026-09-07)
- Dock **Steam** shortcut launches **Steam Big Picture** (`steam://open/bigpicture` or equivalent).
- Carousel game launch uses `steam://rungameid/<id>` directly — do not open desktop Steam first.
- Desktop dock button exits Orbit Shell to Windows desktop.


## Navigation (product)
- Home: D-pad/stick moves focus; A opens; B/Esc = Desktop if on home, else close overlay.
- Opening Steam BP / ES-DE / Stremio / a game minimizes Orbit; return to Orbit home when that app exits.
- Max one overlay depth (Settings/themes). Stremio is a first-class dock icon in all themes.
