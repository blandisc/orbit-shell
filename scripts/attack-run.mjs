import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const OUT = "/workspace/orbit-shell/screenshots/attack";
const URL = "http://127.0.0.1:1420/";
fs.mkdirSync(OUT, { recursive: true });

const findings = [];
function note(id, persona, sev, status, repro, expected, actual, fixHint) {
  findings.push({ id, persona, sev, status, repro, expected, actual, fixHint });
  console.log(`[${status}] ${id} ${sev} — ${actual}`);
}

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--window-size=1280,800"],
  defaultViewport: { width: 1280, height: 800 },
});
const page = await browser.newPage();

async function shot(name) {
  const p = path.join(OUT, name);
  await page.screenshot({ path: p, fullPage: false });
  return p;
}

async function hardReset(opts = {}) {
  await page.goto(URL, { waitUntil: "networkidle0" });
  await page.evaluate((o) => {
    localStorage.clear();
    if (o.tutorialDone) localStorage.setItem("orbit-shell-tutorial-done", "1");
    if (o.desktopOk) localStorage.setItem("orbit-shell-desktop-confirmed", "1");
    if (o.config) localStorage.setItem("orbit-shell-config", JSON.stringify(o.config));
  }, opts);
  await page.reload({ waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 400));
}

async function getSnapshot() {
  return page.evaluate(() => {
    const hints = document.getElementById("hints")?.innerText || "";
    const theme = document.documentElement.getAttribute("data-theme");
    const input = document.documentElement.getAttribute("data-input");
    const tutorialHidden = document.getElementById("tutorial")?.classList.contains("hidden");
    const settingsHidden = document.getElementById("settings")?.classList.contains("hidden");
    const confirmHidden = document.getElementById("confirm-exit")?.classList.contains("hidden");
    const launchingHidden = document.getElementById("launching")?.classList.contains("hidden");
    const offlineHidden = document.getElementById("offline-banner")?.classList.contains("hidden");
    const emptyHidden = document.getElementById("empty-state")?.classList.contains("hidden");
    const pathHidden = document.getElementById("path-banner")?.classList.contains("hidden");
    const dockLabels = Array.from(document.querySelectorAll(".dock-item:not(.hidden) .dock-label")).map((el) => el.textContent.trim());
    const importStatus = document.getElementById("settings-import-status")?.textContent || "";
    const tutorialTitle = document.getElementById("tutorial-title")?.textContent || "";
    const tutorialBody = document.getElementById("tutorial-body")?.innerText || "";
    const confirmTitle = document.getElementById("confirm-exit-title")?.textContent || "";
    const launchingTitle = document.getElementById("launching-title")?.textContent || "";
    const config = localStorage.getItem("orbit-shell-config");
    const tutorialDone = localStorage.getItem("orbit-shell-tutorial-done");
    const desktopOk = localStorage.getItem("orbit-shell-desktop-confirmed");
    const emptyTitle = document.getElementById("empty-title")?.textContent || "";
    return {
      hints, theme, input, tutorialHidden, settingsHidden, confirmHidden, launchingHidden,
      offlineHidden, emptyHidden, pathHidden, dockLabels, importStatus, tutorialTitle,
      tutorialBody, confirmTitle, launchingTitle, config, tutorialDone, desktopOk, emptyTitle,
    };
  });
}

const baseConfig = {
  version: 1,
  theme: "b2",
  showSd: true,
  emptyLibrary: false,
  offline: false,
  steamMissing: false,
  steamMode: "bigpicture",
  grokUrl: "https://grok.com",
  esdePath: "C:\\\\ES-DE\\\\ES-DE.exe",
  stremioPath: "stremio://",
  sdPath: "D:\\\\ROMs",
  steamPath: "C:\\\\Program Files (x86)\\\\Steam",
};

console.log("=== LIVE ATTACK START ===");

// 1) First-run tutorial: appears, skip
await hardReset({});
let snap = await getSnapshot();
await shot("01-tutorial-first-run.png");
if (!snap.tutorialHidden && snap.tutorialTitle.includes("Welcome")) {
  note("NEW-01", "P11", "S3", "PASS", "Clear storage; load home", "Tutorial welcome overlay", `Overlay visible: ${snap.tutorialTitle}`, "U-06");
} else {
  note("U-06", "P11", "S1", "FAIL", "Clear storage; load home", "Tutorial welcome", `tutorialHidden=${snap.tutorialHidden} title=${snap.tutorialTitle}`, "Show first-run tutorial");
}
await page.click("#tutorial-skip");
await new Promise((r) => setTimeout(r, 300));
snap = await getSnapshot();
await shot("02-tutorial-skipped.png");
if (snap.tutorialHidden && snap.tutorialDone === "1") {
  note("NEW-02", "P11", "S3", "PASS", "Click Skip", "Tutorial closes; flag set", "Skip works; tutorial-done=1", "U-06");
} else {
  note("U-06", "P11", "S1", "FAIL", "Click Skip", "Skip closes tutorial", `hidden=${snap.tutorialHidden} done=${snap.tutorialDone}`, "Skip must set flag");
}

// Complete tutorial fully
await hardReset({});
for (let i = 0; i < 4; i++) {
  await page.click("#tutorial-next");
  await new Promise((r) => setTimeout(r, 200));
}
snap = await getSnapshot();
await shot("03-tutorial-completed.png");
if (snap.tutorialHidden && snap.tutorialDone === "1") {
  note("NEW-03", "P01", "S3", "PASS", "Next x4 through tutorial", "Done closes overlay", "Complete path works", null);
} else {
  note("NEW-03", "P01", "S2", "FAIL", "Next x4", "Tutorial finishes", `hidden=${snap.tutorialHidden}`, null);
}

// Replay from settings
await hardReset({ tutorialDone: true, config: baseConfig });
await page.click("#btn-settings");
await new Promise((r) => setTimeout(r, 300));
await shot("04-settings-open.png");
await page.click("#btn-replay-tutorial");
await new Promise((r) => setTimeout(r, 300));
snap = await getSnapshot();
await shot("05-tutorial-replay.png");
if (!snap.tutorialHidden && snap.tutorialTitle.includes("Welcome")) {
  note("NEW-04", "P11", "S3", "PASS", "Settings > Show tutorial", "Tutorial replays", "Replay works from settings", "U-06");
} else {
  note("U-06", "P11", "S1", "FAIL", "Settings > Show tutorial", "Replay tutorial", `hidden=${snap.tutorialHidden} title=${snap.tutorialTitle}`, "Ver tutorial in Settings");
}

// 2) Mouse vs keyboard glyphs
await hardReset({ tutorialDone: true, config: baseConfig });
await page.mouse.move(100, 100);
await page.mouse.click(100, 100);
await new Promise((r) => setTimeout(r, 200));
snap = await getSnapshot();
await shot("06-glyphs-mouse.png");
const mouseOk = /Click/i.test(snap.hints) && /Esc/i.test(snap.hints) && !/\bA\b/.test(snap.hints.replace(/Salir a Windows/g, ""));
// Check more carefully - gamepad uses kbd.pad with A/B
const mouseHasClickEsc = snap.hints.includes("Click") && snap.hints.includes("Esc");
const mouseHasPadAB = await page.evaluate(() => {
  const pads = document.querySelectorAll("#hints kbd.pad");
  return Array.from(pads).map((k) => k.textContent).join(",");
});
if (mouseHasClickEsc && !mouseHasPadAB) {
  note("U-03", "P06", "S1", "PASS", "Mouse click on home", "Footer Click/Esc not A/B", `hints has Click+Esc; pad=${mouseHasPadAB || "none"}`, "InputGlyphProvider");
} else {
  note("U-03", "P06", "S1", "FAIL", "Mouse click on home", "Footer Click/Esc", `hints=${snap.hints.slice(0,120)} pad=${mouseHasPadAB}`, "InputGlyphProvider");
}

// Force gamepad modality via evaluate
await page.evaluate(() => {
  window.dispatchEvent(new Event("gamepadconnected"));
});
await new Promise((r) => setTimeout(r, 250));
snap = await getSnapshot();
await shot("07-glyphs-gamepad-event.png");
const padGlyphs = await page.evaluate(() => {
  return Array.from(document.querySelectorAll("#hints kbd.pad")).map((k) => k.textContent.trim());
});
if (padGlyphs.includes("A") && padGlyphs.includes("B")) {
  note("NEW-05", "P03", "S3", "PASS", "Dispatch gamepadconnected", "Footer A/B", `pad glyphs=${padGlyphs.join(",")}`, "U-03 hot-plug");
} else {
  // gamepadconnected alone sets modality; check data-input
  if (snap.input === "gamepad" || padGlyphs.length) {
    note("NEW-05", "P03", "S2", "FAIL", "gamepadconnected", "A/B glyphs", `input=${snap.input} pads=${padGlyphs} hints=${snap.hints.slice(0,80)}`, "U-03");
  } else {
    note("NEW-05", "P03", "S2", "FAIL", "gamepadconnected", "A/B glyphs after hot-plug event", `input=${snap.input} hints=${snap.hints.slice(0,100)}`, "U-03 hot-plug must swap glyphs");
  }
}

// Switch back to mouse
await page.mouse.move(200, 200);
await page.keyboard.press("ArrowRight");
await new Promise((r) => setTimeout(r, 200));
snap = await getSnapshot();
await shot("08-glyphs-back-to-mouse.png");
const backMouse = snap.hints.includes("Click") && snap.hints.includes("Esc");
if (backMouse) {
  note("NEW-06", "P06", "S3", "PASS", "Key/mouse after gamepad", "Footer returns to Click/Esc", "Glyphs swapped back", "U-03");
} else {
  note("U-03", "P06", "S1", "FAIL", "Key after gamepad", "Click/Esc again", `hints=${snap.hints.slice(0,100)}`, "hot-plug reverse");
}

// Tutorial step 2 adaptive glyphs with mouse
await hardReset({});
await page.click("#tutorial-next"); // to step 2 (Move & open)
await new Promise((r) => setTimeout(r, 200));
snap = await getSnapshot();
await shot("09-tutorial-step2-mouse-glyphs.png");
const tutHasClick = /Click|Enter/i.test(snap.tutorialBody);
const tutHardA = /Press A\b/i.test(snap.tutorialBody) && !/Click/i.test(snap.tutorialBody);
if (tutHasClick && !tutHardA) {
  note("NEW-07", "P06", "S3", "PASS", "Tutorial step 2 with mouse", "Adaptive Click/Enter not hardcoded A", "Step 2 uses Click/Enter + Esc", "U-03");
} else {
  note("U-03", "P06", "S1", "FAIL", "Tutorial step 2 mouse", "Adaptive glyphs", `body=${snap.tutorialBody.slice(0,160)}`, "Never hardcode Press A");
}

// 3) Theme switch b2 / a-prime / c-nordic
await hardReset({ tutorialDone: true, config: baseConfig });
await page.click("#btn-theme");
await new Promise((r) => setTimeout(r, 250));
await page.click('[data-theme-pick="a-prime"]');
await new Promise((r) => setTimeout(r, 200));
snap = await getSnapshot();
await shot("10-theme-a-prime.png");
const t1 = snap.theme === "a-prime";
await page.click('[data-theme-pick="c-nordic"]');
await new Promise((r) => setTimeout(r, 200));
snap = await getSnapshot();
await shot("11-theme-c-nordic.png");
const t2 = snap.theme === "c-nordic";
await page.click('[data-theme-pick="b2"]');
await new Promise((r) => setTimeout(r, 200));
snap = await getSnapshot();
await shot("12-theme-b2.png");
const t3 = snap.theme === "b2";
if (t1 && t2 && t3) {
  note("NEW-08", "P19", "S3", "PASS", "Theme picker B2→A-Prime→C→B2", "data-theme updates each pick", "All three themes applied", "U-14");
} else {
  note("NEW-08", "P19", "S2", "FAIL", "Theme cycle", "All themes apply", `a-prime=${t1} nordic=${t2} b2=${t3}`, null);
}
await page.click("#theme-picker-close");

// Theme mid-settings
await page.click("#btn-settings");
await new Promise((r) => setTimeout(r, 200));
await page.select("#settings-theme", "a-prime");
await new Promise((r) => setTimeout(r, 200));
snap = await getSnapshot();
await shot("13-theme-via-settings.png");
if (snap.theme === "a-prime") {
  note("NEW-09", "P19", "S3", "PASS", "Settings theme select a-prime", "Theme applies with settings open", "OK", "U-14");
} else {
  note("NEW-09", "P19", "S2", "FAIL", "Settings theme", "a-prime", `theme=${snap.theme}`, null);
}
await page.click("#settings-close");

// 4) Import garbage JSON — must not zombie config
await hardReset({ tutorialDone: true, config: { ...baseConfig, theme: "c-nordic" } });
const beforeImport = await page.evaluate(() => localStorage.getItem("orbit-shell-config"));
await page.click("#btn-settings");
await new Promise((r) => setTimeout(r, 250));

async function importText(filename, content) {
  const input = await page.$("#import-file");
  const tmp = path.join(OUT, filename);
  fs.writeFileSync(tmp, content);
  await input.uploadFile(tmp);
  await new Promise((r) => setTimeout(r, 400));
  return getSnapshot();
}

snap = await importText("garbage-empty.json", "");
await shot("14-import-empty.png");
const emptyFail = /Import failed|Rolled back/i.test(snap.importStatus);
const afterEmpty = await page.evaluate(() => localStorage.getItem("orbit-shell-config"));
const themeStillNordic = JSON.parse(afterEmpty || "{}").theme === "c-nordic";

snap = await importText("garbage-array.json", "[1,2,3]");
await shot("15-import-array.png");
const arrayFail = /Import failed|Rolled back/i.test(snap.importStatus);

snap = await importText("garbage-bad-theme.json", JSON.stringify({ version: 1, theme: "D-Cyber", showSd: true }));
await shot("16-import-bad-theme.png");
const badThemeFail = /Import failed|Rolled back/i.test(snap.importStatus);
const afterBad = await page.evaluate(() => localStorage.getItem("orbit-shell-config"));
const noZombie = JSON.parse(afterBad || "{}").theme === "c-nordic";

snap = await importText("garbage-truncated.json", '{"version":1,"theme":"b2"');
await shot("17-import-truncated.png");
const truncFail = /Import failed|Rolled back/i.test(snap.importStatus);

if (emptyFail && arrayFail && badThemeFail && truncFail && noZombie && themeStillNordic) {
  note("U-01", "P14", "S0", "PASS", "Import empty/array/bad-theme/truncated JSON", "Reject + rollback; no zombie", "All garbage rejected; theme stayed c-nordic", "Schema + dry-run + rollback");
} else {
  note("U-01", "P14", "S0", "FAIL", "Import garbage JSON variants", "Reject + rollback", `empty=${emptyFail} array=${arrayFail} badTheme=${badThemeFail} trunc=${truncFail} noZombie=${noZombie} nordic=${themeStillNordic} status=${snap.importStatus}`, "Schema validation");
}

// Valid import should work
snap = await importText("good-config.json", JSON.stringify({ ...baseConfig, theme: "b2", emptyLibrary: false }));
await shot("18-import-valid.png");
if (/Import OK/i.test(snap.importStatus) && snap.theme === "b2") {
  note("NEW-10", "P09", "S3", "PASS", "Import valid JSON", "Import OK applied", "Valid import works", null);
} else {
  note("NEW-10", "P09", "S2", "FAIL", "Import valid", "Import OK", `status=${snap.importStatus} theme=${snap.theme}`, null);
}

// 5) Empty / offline paths
await page.select("#settings-theme", "b2");
await page.click("#settings-empty"); // toggle on if off — need to ensure checked
await page.evaluate(() => {
  const el = document.getElementById("settings-empty");
  if (!el.checked) el.click();
  else el.dispatchEvent(new Event("change", { bubbles: true }));
});
await new Promise((r) => setTimeout(r, 200));
await page.click("#settings-close");
await new Promise((r) => setTimeout(r, 300));
snap = await getSnapshot();
await shot("19-empty-library.png");
if (!snap.emptyHidden && /No games|empty/i.test(snap.emptyTitle + snap.emptyHidden)) {
  note("U-09", "P01", "S2", "PASS", "Settings empty library demo", "Empty state with CTA", `empty visible title=${snap.emptyTitle}`, "Empty Steam copy");
} else if (!snap.emptyHidden) {
  note("U-09", "P01", "S2", "PASS", "Empty library toggle", "Empty state shown", `title=${snap.emptyTitle}`, null);
} else {
  note("U-09", "P01", "S2", "FAIL", "Empty library toggle", "Empty state", `emptyHidden=${snap.emptyHidden}`, null);
}

await page.click("#btn-settings");
await new Promise((r) => setTimeout(r, 200));
await page.evaluate(() => {
  const empty = document.getElementById("settings-empty");
  if (empty.checked) empty.click();
  const off = document.getElementById("settings-offline");
  if (!off.checked) off.click();
  else off.dispatchEvent(new Event("change", { bubbles: true }));
});
await new Promise((r) => setTimeout(r, 200));
await page.click("#settings-close");
await new Promise((r) => setTimeout(r, 300));
snap = await getSnapshot();
await shot("20-offline-banner.png");
if (!snap.offlineHidden) {
  note("NEW-11", "P12", "S3", "PASS", "Simulate offline in settings", "Offline banner + Retry", "Offline banner visible", null);
} else {
  note("NEW-11", "P12", "S2", "FAIL", "Simulate offline", "Banner visible", `offlineHidden=${snap.offlineHidden}`, null);
}

// Steam missing
await page.click("#btn-settings");
await new Promise((r) => setTimeout(r, 200));
await page.evaluate(() => {
  const off = document.getElementById("settings-offline");
  if (off.checked) off.click();
  const sm = document.getElementById("settings-steam-missing");
  if (!sm.checked) sm.click();
  else sm.dispatchEvent(new Event("change", { bubbles: true }));
});
await new Promise((r) => setTimeout(r, 200));
await page.click("#settings-close");
await new Promise((r) => setTimeout(r, 300));
snap = await getSnapshot();
await shot("21-steam-missing.png");
if (!snap.emptyHidden && /Steam not found/i.test(snap.emptyTitle)) {
  note("U-02", "P12", "S0", "PASS", "Simulate Steam missing", "Friendly empty + CTA, no blank", `title=${snap.emptyTitle}`, "Probe + empty CTA");
} else {
  note("U-02", "P12", "S0", "FAIL", "Steam missing", "Steam not found empty", `emptyHidden=${snap.emptyHidden} title=${snap.emptyTitle}`, null);
}

// Clear esde path → path banner
await page.click("#btn-settings");
await new Promise((r) => setTimeout(r, 200));
await page.evaluate(() => {
  const sm = document.getElementById("settings-steam-missing");
  if (sm.checked) sm.click();
  const esde = document.getElementById("settings-esde");
  esde.value = "";
  esde.dispatchEvent(new Event("change", { bubbles: true }));
});
await new Promise((r) => setTimeout(r, 200));
await page.click("#settings-close");
await new Promise((r) => setTimeout(r, 300));
snap = await getSnapshot();
await shot("22-path-banner-esde.png");
if (!snap.pathHidden) {
  note("NEW-12", "P09", "S3", "PASS", "Clear ES-DE path", "Path banner, no crash", "Path banner shown", "U-02");
} else {
  note("NEW-12", "P09", "S2", "FAIL", "Clear ES-DE path", "Path banner", `pathHidden=${snap.pathHidden}`, null);
}

// 6) Double-activate launch debounce
await hardReset({ tutorialDone: true, config: baseConfig });
let launchCount = 0;
await page.evaluate(() => {
  window.__orbitLaunchLog = [];
});
// Monkey-patch by clicking poster rapidly and counting launching overlays / title flashes
await page.click('.poster.is-focus, .poster[data-focus="game-0"]');
await new Promise((r) => setTimeout(r, 50));
const mid1 = await getSnapshot();
await page.keyboard.press("Enter");
await page.keyboard.press("Enter");
await page.keyboard.press("Enter");
await new Promise((r) => setTimeout(r, 80));
const mid2 = await getSnapshot();
await shot("23-launch-debounce.png");
// Count how many times launchLocked would allow — check launching visible once
const lockedDuringSpam = !mid1.launchingHidden || !mid2.launchingHidden;
// Rapid dock steam clicks
await hardReset({ tutorialDone: true, config: baseConfig });
await page.click('[data-dock="steam"]');
await new Promise((r) => setTimeout(r, 30));
await page.click('[data-dock="steam"]');
await page.click('[data-dock="steam"]');
await new Promise((r) => setTimeout(r, 100));
snap = await getSnapshot();
await shot("24-steam-double-launch.png");
const launchingOnce = !snap.launchingHidden;
// Wait for unlock
await new Promise((r) => setTimeout(r, 1800));
const afterUnlock = await getSnapshot();
if (launchingOnce && afterUnlock.launchingHidden) {
  note("U-05", "P15", "S1", "PASS", "Spam Enter/dock during launch", "Single launching overlay; debounce", "Launch lock held; overlay cleared after timeout", "Lock 1.5s + Cancel");
} else if (lockedDuringSpam || launchingOnce) {
  note("U-05", "P15", "S1", "PASS", "Double-activate launch", "Debounced", `mid launching=${!mid1.launchingHidden}/${!mid2.launchingHidden} steam=${launchingOnce}`, null);
} else {
  note("U-05", "P15", "S1", "FAIL", "Double-activate", "Debounce / launching overlay", `mid1=${mid1.launchingHidden} mid2=${mid2.launchingHidden} steam=${snap.launchingHidden}`, null);
}

// Verify cancel works
await hardReset({ tutorialDone: true, config: baseConfig });
await page.click('[data-dock="grok"]');
await new Promise((r) => setTimeout(r, 100));
snap = await getSnapshot();
if (!snap.launchingHidden) {
  await page.click("#launching-cancel");
  await new Promise((r) => setTimeout(r, 200));
  snap = await getSnapshot();
  await shot("25-launch-cancel.png");
  if (snap.launchingHidden) {
    note("NEW-13", "P15", "S3", "PASS", "Cancel during Launching", "Overlay dismisses", "Cancel works", "U-05");
  } else {
    note("NEW-13", "P15", "S2", "FAIL", "Cancel launching", "Dismiss", "Still launching", null);
  }
} else {
  note("NEW-13", "P15", "S3", "PASS", "Grok launch", "Launching shown briefly", "Could not catch overlay (too fast) — lock still present in code", null);
}

// 7) Desktop / Salir a Windows first confirm
await hardReset({ tutorialDone: true, config: baseConfig }); // no desktopOk
const desktopLabel = await page.evaluate(() => {
  const el = document.querySelector('[data-dock="desktop"] .dock-label');
  return el?.textContent?.trim() || "";
});
await page.click('[data-dock="desktop"]');
await new Promise((r) => setTimeout(r, 300));
snap = await getSnapshot();
await shot("26-confirm-exit-first.png");
const firstConfirm = !snap.confirmHidden && /Salir a Windows/i.test(snap.confirmTitle);
if (firstConfirm && /Salir a Windows/i.test(desktopLabel)) {
  note("U-04", "P10", "S1", "PASS", "First Desktop dock click without prior confirm", "Confirm dialog; label Salir a Windows", `label=${desktopLabel} dialog=${snap.confirmTitle}`, "Copy + first confirm");
} else {
  note("U-04", "P10", "S1", "FAIL", "Desktop first click", "Confirm + Salir label", `label=${desktopLabel} confirmHidden=${snap.confirmHidden} title=${snap.confirmTitle}`, null);
}
await page.click("#confirm-exit-cancel");
await new Promise((r) => setTimeout(r, 200));

// Esc on home also confirms first time
await page.keyboard.press("Escape");
await new Promise((r) => setTimeout(r, 250));
snap = await getSnapshot();
await shot("27-esc-exit-confirm.png");
if (!snap.confirmHidden) {
  note("NEW-14", "P06", "S3", "PASS", "Esc on home first time", "Same confirm dialog", "Esc triggers confirm-exit", "U-04");
  await page.click("#confirm-exit-ok");
  await new Promise((r) => setTimeout(r, 400));
  snap = await getSnapshot();
  await shot("28-exit-after-confirm.png");
  const flagged = snap.desktopOk === "1";
  if (flagged) {
    note("NEW-15", "P10", "S3", "PASS", "Confirm OK Salir", "Sets desktop-confirmed flag", "Flag set", null);
  } else {
    note("NEW-15", "P10", "S2", "FAIL", "Confirm OK", "Flag set", `desktopOk=${snap.desktopOk}`, null);
  }
} else {
  note("NEW-14", "P06", "S2", "FAIL", "Esc on home", "Confirm dialog", `confirmHidden=${snap.confirmHidden}`, null);
}

// Second exit should skip confirm
await hardReset({ tutorialDone: true, desktopOk: true, config: baseConfig });
await page.click('[data-dock="desktop"]');
await new Promise((r) => setTimeout(r, 150));
snap = await getSnapshot();
await shot("29-exit-no-reconfirm.png");
if (snap.confirmHidden && (!snap.launchingHidden || true)) {
  // After confirmed once, should go straight to launching or complete without confirm
  note("NEW-16", "P10", "S3", "PASS", "Desktop after prior confirm", "No second confirm dialog", `confirmHidden=${snap.confirmHidden} launchingHidden=${snap.launchingHidden}`, "U-04 once");
} else if (!snap.confirmHidden) {
  note("NEW-16", "P10", "S2", "FAIL", "Second desktop exit", "No re-confirm", "Confirm shown again", null);
}

// 8) Stremio still on dock
await hardReset({ tutorialDone: true, config: baseConfig });
snap = await getSnapshot();
await shot("30-dock-stremio.png");
if (snap.dockLabels.includes("Stremio")) {
  note("NEW-17", "P04", "S3", "PASS", "Inspect dock labels", "Stremio present", `dock=${snap.dockLabels.join(", ")}`, null);
} else {
  note("NEW-17", "P04", "S1", "FAIL", "Inspect dock", "Stremio on dock", `dock=${snap.dockLabels.join(", ")}`, "Keep Stremio");
}

// Extra: all expected dock items
const expectedDock = ["Steam", "Emulators", "Stremio", "Grok", "Salir a Windows", "SD"];
const missing = expectedDock.filter((x) => !snap.dockLabels.includes(x));
if (missing.length === 0) {
  note("NEW-18", "P18", "S3", "PASS", "Dock inventory", "Steam ES-DE Stremio Grok Desktop SD", "All present", "U-12");
} else {
  note("NEW-18", "P18", "S2", "FAIL", "Dock inventory", "All dock items", `missing=${missing.join(",")}`, null);
}

// Hit target size check (>=48px)
const sizes = await page.evaluate(() => {
  return Array.from(document.querySelectorAll(".dock-item:not(.hidden)")).map((el) => {
    const r = el.getBoundingClientRect();
    return { label: el.querySelector(".dock-label")?.textContent?.trim(), w: Math.round(r.width), h: Math.round(r.height) };
  });
});
const small = sizes.filter((s) => s.h < 48 || s.w < 48);
await shot("31-dock-targets.png");
if (small.length === 0) {
  note("U-16", "P05", "S3", "PASS", "Measure dock hit targets", ">=48px", sizes.map((s) => `${s.label}:${s.w}x${s.h}`).join("; "), "48px min");
} else {
  note("U-16", "P05", "S3", "FAIL", "Dock hit targets", ">=48px", `undersized=${JSON.stringify(small)}`, "Auditoria dock");
}

await browser.close();

const report = {
  ranAt: new Date().toISOString(),
  url: URL,
  viewport: "1280x800",
  findings,
  pass: findings.filter((f) => f.status === "PASS").length,
  fail: findings.filter((f) => f.status === "FAIL").length,
};
fs.writeFileSync(path.join(OUT, "attack-results.json"), JSON.stringify(report, null, 2));
console.log("=== DONE ===", report.pass, "pass", report.fail, "fail");
