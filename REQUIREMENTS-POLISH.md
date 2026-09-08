# Orbit Shell — polish pass (requirements for Grok Build)

You are building in `/workspace/orbit-shell` (existing Tauri 2 + web UI app, public GitHub blandisc/orbit-shell). Do **not** start from scratch. Improve what exists until it feels finished and actually works.

## Problem (user feedback)
The current app is roughly scaffolded but **raw**:
- Not really connected (Steam / paths / launches feel fake or broken)
- Not pulling **real Steam library art** (covers/posters)
- Dock / UI **icons are too small**
- Overall not easy to use yet for a Legion Go handheld console shell

## Goal
Polish Orbit Shell into a working, shareable Steam-centric launcher that looks intentional and works end-to-end on Windows (Legion Go).

## Must fix / ship
1. **Real Steam library**
   - Detect Steam install on Windows (common paths + Steam libraryfolders.vdf).
   - Read installed games from local Steam metadata (appmanifest / library).
   - Show **real cover/poster art** from Steam CDN (or local Steam grid cache if present). Fallback only when art is missing — never a whole library of placeholders if Steam is present.
   - If Steam is missing: clear empty state + first-run guidance (do not silently fake a big library).

2. **Launches that work**
   - Carousel game → `steam://rungameid/<id>` (or proven Windows equivalent).
   - Dock Steam → big Picture (`steam://open/bigpicture`).
   - Dock ES-DE / Stremio / Desktop / Grok: use configurable paths/URLs from settings JSON; sensible Windows defaults as placeholders (not Fernando-only hardcodes).
   - Opening an external app should feel intentional (minimize/hide shell if already designed that way).

3. **Icons & visual polish**
   - Dock icons and focus targets **large enough for handheld** (Legion Go); readable at arm length.
   - Themes B2 / A-Prime / C remain; chrome themed; posters full-color and large in the carousel (depth OK).
   - Fix anything that still feels like a wireframe/demo (tiny chrome, sparse spacing, unfinished empty/loading/error states).

4. **Config that works**
   - Settings + export/import one JSON still work after changes.
   - First-run tutorial remains skippable and truthful about Steam detection.

5. **Build hygiene**
   - Keep Tauri 2. Ensure `tauri.conf.json` is valid UTF-8 without BOM; NSIS `installMode` valid (`currentUser` if used).
   - App must keep `npm run build` / `tauri build` path healthy on Windows.
   - Update README with how a non-technical user installs/runs.

## Constraints
- Product is shareable, not Fernando-only.
- Steam-only library (Steam may already include emulation via user Steam plugin / non-Steam shortcuts).
- Prefer Tauri; no Electron.
- Spanish UI is fine / preferred for user-facing strings where already Spanish.
- Do not invent unrelated features.

## Done when
- With Steam installed: library lists real games with real art; launching a game and Big Picture works.
- Without Steam: honest empty/first-run, not fake data pretending to be connected.
- Dock icons are comfortably large on a handheld layout.
- `npm run build` succeeds; document any Windows build notes.
- Summarize what changed and how to verify on a Legion Go / Windows machine.

Investigate the repo yourself; fix root causes. Prefer working end-to-end over cosmetic-only tweaks.
