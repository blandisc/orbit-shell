# PERSONAS_ATTACK_RUNBOOK — Orbit Shell

Companion doc: USABILITY_RESEARCH.md
Log findings to ISSUES-UX.md

## Preflight
1. Install deps and start the local Vite server.
2. Open the Vite URL. Use viewports 1280x800 and 1920x1080.
3. If UI is still the Tauri greet scaffold, mark BLOCKED for missing shell features.
4. Clear localStorage or config between first-run persona passes.
5. No illegal ROMs; no secrets inside sample JSON.

## Protocol per persona (P01-P20)

For each persona in USABILITY_RESEARCH.md:
A. Set input mode (gamepad glyphs vs mouse Click/Esc).
B. Reset first-run flag if the persona is a new user.
C. Execute that persona attack script steps (3-5 actions).
D. Record: pass / fail / blocked + screenshot note + severity U-xx if matches backlog.

## Fast path (always run first, 10 min)

1. First-run overlay appears; Skip works; no trap.
2. Footer glyphs: with mouse show Click/Esc; with gamepad show A/B.
3. Hot-plug: connect/disconnect pad; glyphs swap.
4. Dock: Steam, ES-DE, Stremio, Grok, Desktop all focusable; targets >=48px.
5. Theme cycle B2, A-Prime, C; focus still visible (esp. B2 + CVD).
6. Empty / offline / launching states have exit paths.
7. Import bad JSON: reject with message; config rolls back.
8. B or Esc on home: Desktop exit (or confirm once).
9. Mash Affirmative during Launching: no duplicate launches.
10. Missing Steam path: friendly empty + CTA, no white screen.

## Persona mini-scripts (execute in order)

### Batch A — beginners / skippers
- P01 Sofia: mash A on empty; try Grok as store; B on home thinking Back.
- P04 Leo: mash face buttons; open Stremio+ES-DE fast; import garbage file as JSON; unplug SD.
- P11 Ines: Skip instantly; try to play with no tutorial knowledge; Esc spam overlays.
- P18 Tomas: Skip; tap every dock icon; ignore empty-state text.

### Batch B — input / a11y
- P06 Andres mouse-only: no pad; must exit via Click/Esc; resize tiny window.
- P05 Carmen: large mouse; OS scale 200%; check hit targets and B2 focus.
- P07 Valeria CVD: B2 theme; verify focus not color-only; check offline vs launching.
- P08 Hector one-hand: D-pad+A only; no chord shortcuts required.
- P03 Mariana: hot-plug pad mid-tutorial; accidental B to Desktop.

### Batch C — Steam mental models
- P02 Diego Deck: Skip; dock Steam must open Big Picture; no Quick Access expected.
- P10 Pablo BPM: Desktop label confusion; BPM already open edge case.
- P20 Carlos Desktop Steam: expects Desktop client from dock; document fail if BPM only.
- P09 Lucia SRM: export/import JSON; Unix paths on Windows; no out-of-Steam ROM scan.

### Batch D — chaos / misconfig
- P14 Omar: import truncated JSON, bad theme key, wipe firstRunComplete.
- P15 Nina: Affirmative spam while Launching; theme swap mid-launch; unplug SD.
- P19 Greta: B2 to A-Prime to C in under 10s with Settings open.
- P12 Mateusz: airplane mode; Retry; English copy; stale cache launch.

### Batch E — context / family
- P13 Fernanda ES: look for Spanish strings; Desktop wording confusion.
- P16 Ricardo docked: 1080p/TV; footer not clipped by overscan.
- P17 Aisha+parent: open Settings/Import/Grok/SD folder; note missing kids mode.

## Glyph assertion (hard fail if wrong)

| Last input | Footer Affirmative | Footer Back |
|------------|--------------------|-------------|
| Gamepad    | A                  | B           |
| Mouse/KB   | Click or Enter     | Esc         |

Tutorial step 2 must use the same provider. Hardcoded Press A with mouse = FAIL U-03.

## Mischief sweep
Run all 20 items in USABILITY_RESEARCH.md Mischief QA section. Tick pass/fail.

## Report template (ISSUES-UX.md)

For each fail:
- id: U-xx or NEW-xx
- persona: Pxx
- sev: S0-S3
- repro: steps
- expected vs actual
- fix hint from backlog if any

Stop after Fast path + Batches A-E if timeboxed; Mischief can be a second pass.
