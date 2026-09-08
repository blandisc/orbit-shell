# ISSUES-UX.md — Orbit Shell live attack

**Run:** 2026-09-07 ~20:55–21:00 America/Mexico_City (UTC-6)  
**Target:** http://127.0.0.1:1420 (Vite live UI)  
**Method:** Puppeteer attack scripts `scripts/attack-run.mjs` + `scripts/attack-run-part2.mjs`  
**Viewport:** 1280×800  
**Evidence:** `/workspace/orbit-shell/screenshots/attack/` (01–31 + garbage JSON fixtures)  
**Protocol:** PERSONAS_ATTACK_RUNBOOK.md Fast path + requested mischief checklist

---

## TLDR

Critical backlog items **U-01…U-05** (and related empty/offline/Steam-missing paths) **held up** in this live run.  
**Nothing S0/S1 broke.** Residuals are polish / i18n / post-skip help (S3).

---

## Summary scorecard (this live run)

| Area | Result | Notes |
|------|--------|-------|
| First-run tutorial skip / complete / Settings replay | **PASS** | Screens 01–05 |
| Footer glyphs mouse Click/Esc vs gamepad A/B | **PASS** | Screens 06–09; hot-plug event swaps |
| Themes b2 / a-prime / c-nordic | **PASS** | Screens 10–13 |
| Import garbage JSON (no zombie config) | **PASS** | Screens 14–18; rollback message |
| Empty / offline / Steam-missing / path banner | **PASS** | Screens 19–22 |
| Double-activate launch debounce + Cancel | **PASS** | Screens 23–25 |
| Desktop / Salir a Windows first confirm | **PASS** | Screens 26–29 |
| Stremio on dock | **PASS** | Screen 30; dock = Steam, Emulators, Stremio, Grok, Salir a Windows, SD |
| Dock hit targets ≥48px | **PASS** | Screen 31; heights ~210px |

---

## Findings from THIS live run

### FAIL (still open)

#### U-06-residual — S3 — Post-skip safety net incomplete
- **persona:** P11 Inés / P18 Tomás  
- **status:** FAIL (partial — Settings replay works)  
- **sev:** S3  
- **repro:**
  1. Clear `localStorage`, load home → tutorial appears.
  2. Click **Skip**.
  3. Inspect footer / home chrome for any “tips” / cheat-sheet beyond normal glyphs.
- **expected:** After skip, a short persistent affordance for first N sessions (runbook U-06) *or* equally discoverable help beyond Settings.
- **actual:** Skip sets `orbit-shell-tutorial-done=1`. Footer only shows Click/Esc (or A/B). **Settings → Show tutorial** works (PASS for replay). No extra post-skip cheat-sheet line.
- **fix hint:** Keep Settings replay; optionally add one-line footer tip for first N sessions after skip.
- **screens:** `02-tutorial-skipped.png`, Settings replay `05-tutorial-replay.png`

#### NEW-19 — S3 — Mixed ES/EN on exit confirm
- **persona:** P13 Fernanda  
- **status:** FAIL (polish / i18n)  
- **sev:** S3 (maps to backlog **U-15**)  
- **repro:** First-time click **Salir a Windows** (or Esc on home with no prior confirm).  
- **expected:** Consistent language in dialog (all ES or all EN).  
- **actual:** Title **“Salir a Windows?”** (ES) + body in English (“This leaves Orbit Shell…”). Dock label also mixes “Salir a Windows” + sub “Desktop”.  
- **fix hint:** String table ES/EN for confirm + dock copy.  
- **screens:** `26-confirm-exit-first.png`

#### NEW-20 — S3 — Footer glyphs stay “home semantics” under Settings
- **persona:** P06 Andrés  
- **status:** FAIL (polish)  
- **sev:** S3  
- **repro:** Open Settings with mouse; read footer.  
- **expected:** Overlay-aware hints (e.g. Esc = Close settings), not “Esc = Salir a Windows”.  
- **actual:** Home footer remains visible under Settings (`Click/Enter = Open`, `Esc = Back / Salir a Windows`), which is misleading while a modal is open (Esc correctly closes Settings in code, but copy lies).  
- **fix hint:** `renderHints()` should branch on `state.overlay`.  
- **screens:** `04-settings-open.png`, `14-import-empty.png`

### PASS — already fixed / solid in this build

#### U-01 — S0 — Import JSON validation + rollback — **PASS**
- **persona:** P14 Omar / P04 Leo  
- **repro:** Settings → Import empty file, `[1,2,3]`, `{theme:"D-Cyber"}`, truncated JSON while theme was `c-nordic`.  
- **actual:** Status “Import failed — invalid JSON or schema. Rolled back…”. Theme stayed `c-nordic`. Valid import → “Import OK”.  
- **screens:** `14`–`18`

#### U-02 — S0 — Missing Steam / empty paths — **PASS**
- **persona:** P12 Mateusz  
- **repro:** Settings → Simulate Steam missing; clear ES-DE path.  
- **actual:** “Steam not found” empty + Relocate CTA; path banner for ES-DE; no blank/crash.  
- **screens:** `21-steam-missing.png`, `22-path-banner-esde.png`

#### U-03 — S1 — Adaptive footer / tutorial glyphs — **PASS**
- **persona:** P06 Andrés / P03 Mariana  
- **repro:** Mouse → Click/Esc; dispatch `gamepadconnected` → A/B; key/mouse → Click/Esc again; tutorial step 2 with mouse uses Click/Enter + Esc (not hardcoded Press A).  
- **screens:** `06`–`09`

#### U-04 — S1 — Desktop label + first confirm — **PASS**
- **persona:** P10 Pablo  
- **repro:** Dock label “Salir a Windows”; first activation → confirm; Cancel; Esc → same confirm; OK sets `orbit-shell-desktop-confirmed`; later exit skips confirm.  
- **screens:** `26`–`29`

#### U-05 — S1 — Launch debounce + Cancel — **PASS**
- **persona:** P15 Nina  
- **repro:** Spam Enter / multi-click Steam during Launching; Cancel dismisses overlay.  
- **screens:** `23`–`25`  
- **note:** Part1 hung when Grok `window.open(https://grok.com)` blocked headless Chrome — product lock still correct; part2 retested Cancel via Steam mock.

#### U-09 — S2 — Empty library copy — **PASS**
- Empty state + “Open Steam” CTA visible (`19-empty-library.png`). Offline banner + Retry (`20-offline-banner.png`).

#### NEW-08 / themes — **PASS**
- Theme picker + Settings select cycle b2 ↔ a-prime ↔ c-nordic (`10`–`13`).

#### NEW-17 — Stremio on dock — **PASS**
- Dock order: Steam, Emulators, **Stremio**, Grok, Salir a Windows, SD (`30-dock-stremio.png`).

#### U-16 — Hit targets — **PASS**
- Dock items ~72–115×210 (≥48px) (`31-dock-targets.png`).

#### Tutorial replay (U-06 core path) — **PASS**
- Settings → Show tutorial restores Welcome overlay (`05-tutorial-replay.png`).

---

## Mischief checklist (live ticks)

1. [x] Skip tutorial in 1s  
2. [x] Mash Affirmative during Launching (debounce)  
3. [x] Esc/B-equivalent on home → confirm first time  
4. [x] Import invalid JSON (empty / array / bad theme / truncated)  
5. [x] Import bad theme key  
6. [ ] SD unplug mid-session — **N/A** in web mock (path-empty covered)  
7. [x] Steam missing empty + CTA  
8. [ ] BPM already open — **N/A** (no real Steam)  
9. [ ] Rapid ES-DE/Stremio/Grok — partial (Grok http blocked runner; Steam debounce OK)  
10. [x] Theme swap B2/A-Prime/C (+ with Settings open)  
11. [ ] 640×480 / 4K resize — not in this pass  
12. [ ] OS scale 150/200% — not in this pass  
13. [x] Mouse-only Click/Esc  
14. [x] Hot-plug gamepad event → A/B &lt;1s  
15. [ ] CVD simulation — not instrumented  
16. [x] Offline Simulate + Retry affordance  
17. [ ] Two Orbit instances — not run  
18. [x] Broken path → banner / path-cta (ES-DE empty)  
19. [x] Keyboard arrows / Enter / Esc exercised  
20. [x] After Desktop confirm flag, first-run does not reappear; config intact

---

## Severity rollup (open after this run)

| Sev | Open IDs | Count |
|-----|----------|-------|
| S0 | — | 0 |
| S1 | — | 0 |
| S2 | — | 0 |
| S3 | U-06-residual, NEW-19 (U-15), NEW-20 | 3 |

Backlog U-01…U-05, U-09, U-16: **verified fixed live**.

---

## Agent notes
- Runner: Chrome headless + puppeteer-core; `window.open` stubbed in part2 to avoid navigation hang on Grok.  
- Do not treat prior ISSUES as truth — this file is from **this** live pass only.  
- Screenshots under `screenshots/attack/` are the source of truth for Fernando’s review.
