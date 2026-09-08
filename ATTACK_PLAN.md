# Post-MVP multi-agent attack plan (Grok Build)

Run in parallel after MVP is runnable:

1. **UX agent** — first-run tutorial, focus order, B/Esc exits, empty/offline/launching, no dead ends.
2. **UI agent** — 3 themes consistency, icons/hit targets ≥48px handheld, depth posters, dock Stremio present.
3. **Code agent** — Tauri security, config schema, Steam URL launches, no secrets, portable layout.
4. **Performance agent** — cold start, carousel scroll, asset weight, no main-thread jank.
5. **QA / weird client agent** — Steam missing, broken paths, SD unplugged, Big Picture already open, double-A spam, theme mid-launch, import bad JSON, tiny window, docked 1080p vs handheld.

Each agent: file findings as ISSUES-*.md with severity + concrete fix. Then one merge pass.
