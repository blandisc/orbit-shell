/** Orbit Shell — console home with usability backlog U-01…U-08. */

type ThemeId = "b2" | "a-prime" | "c-nordic";
type InputModality = "mouse-keyboard" | "gamepad";
type FocusZone = "carousel" | "dock";
type SteamMode = "bigpicture" | "desktop";
type OverlayKind =
  | null
  | "tutorial"
  | "settings"
  | "theme"
  | "launching"
  | "confirm-exit"
  | "path-cta";

interface Game {
  id: string;
  name: string;
  genre: string;
  poster: string;
  color: string;
}

interface OrbitConfig {
  version: 1;
  theme: ThemeId;
  showSd: boolean;
  emptyLibrary: boolean;
  offline: boolean;
  steamMissing: boolean;
  steamMode: SteamMode;
  grokUrl: string;
  esdePath: string;
  stremioPath: string;
  sdPath: string;
  steamPath: string;
}

const STORAGE_CONFIG = "orbit-shell-config";
const STORAGE_TUTORIAL = "orbit-shell-tutorial-done";
const STORAGE_DESKTOP_OK = "orbit-shell-desktop-confirmed";

const THEMES: ThemeId[] = ["b2", "a-prime", "c-nordic"];
const STEAM_MODES: SteamMode[] = ["bigpicture", "desktop"];

const DEFAULT_CONFIG: OrbitConfig = {
  version: 1,
  theme: "b2",
  showSd: true,
  emptyLibrary: false,
  offline: false,
  steamMissing: false,
  steamMode: "bigpicture",
  grokUrl: "https://grok.com",
  esdePath: "C:\\ES-DE\\ES-DE.exe",
  stremioPath: "stremio://",
  sdPath: "D:\\ROMs",
  steamPath: "C:\\Program Files (x86)\\Steam",
};

const MOCK_GAMES: Game[] = [
  {
    id: "1001",
    name: "Little Haven",
    genre: "Cozy Indie",
    poster: "/assets/posters/little-haven.jpg",
    color: "#3a6b8c",
  },
  {
    id: "1002",
    name: "Northern Run",
    genre: "Racing",
    poster: "/assets/posters/northern-run.jpg",
    color: "#1a3a5c",
  },
  {
    id: "1003",
    name: "Neon District",
    genre: "Action",
    poster: "/assets/posters/neon-district.jpg",
    color: "#5a1a6c",
  },
  {
    id: "1004",
    name: "Highridge",
    genre: "Adventure",
    poster: "/assets/posters/highridge.jpg",
    color: "#4a6a4c",
  },
  {
    id: "1005",
    name: "Kaleido",
    genre: "Puzzle",
    poster: "/assets/posters/kaleido.jpg",
    color: "#8a3a6c",
  },
  {
    id: "1006",
    name: "Orbital Yard",
    genre: "Sci-Fi",
    poster: "/assets/posters/orbital-yard.jpg",
    color: "#2a3a7c",
  },
  {
    id: "1007",
    name: "Starfarer",
    genre: "Exploration",
    poster: "/assets/posters/starfarer.jpg",
    color: "#1a2a4c",
  },
  {
    id: "1008",
    name: "Tidebound",
    genre: "Narrative",
    poster: "/assets/posters/tidebound.jpg",
    color: "#1a5a6c",
  },
  {
    id: "1009",
    name: "Dune Path",
    genre: "RPG",
    poster: "/assets/posters/dune-path.jpg",
    color: "#8a6a2c",
  },
  {
    id: "1010",
    name: "Cliffhaven",
    genre: "Adventure",
    poster: "/assets/posters/cliffhaven.jpg",
    color: "#3a5a3c",
  },
];

/* ——— Config schema (U-01) ——— */

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asString(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

function asBool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

/** Validate + normalize; returns null on fatal schema failure (rollback). */
function parseOrbitConfig(raw: unknown): OrbitConfig | null {
  if (!isPlainObject(raw)) return null;

  const themeRaw = raw.theme;
  if (themeRaw !== undefined && !THEMES.includes(themeRaw as ThemeId)) return null;
  const steamModeRaw = raw.steamMode;
  if (steamModeRaw !== undefined && !STEAM_MODES.includes(steamModeRaw as SteamMode)) {
    return null;
  }

  // Reject arrays / wrong types on known keys
  const stringKeys = [
    "grokUrl",
    "esdePath",
    "stremioPath",
    "sdPath",
    "steamPath",
  ] as const;
  for (const k of stringKeys) {
    if (raw[k] !== undefined && typeof raw[k] !== "string") return null;
  }
  const boolKeys = [
    "showSd",
    "emptyLibrary",
    "offline",
    "steamMissing",
  ] as const;
  for (const k of boolKeys) {
    if (raw[k] !== undefined && typeof raw[k] !== "boolean") return null;
  }
  if (raw.version !== undefined && raw.version !== 1) return null;

  return {
    version: 1,
    theme: (THEMES.includes(themeRaw as ThemeId) ? themeRaw : DEFAULT_CONFIG.theme) as ThemeId,
    showSd: asBool(raw.showSd, DEFAULT_CONFIG.showSd),
    emptyLibrary: asBool(raw.emptyLibrary, DEFAULT_CONFIG.emptyLibrary),
    offline: asBool(raw.offline, DEFAULT_CONFIG.offline),
    steamMissing: asBool(raw.steamMissing, DEFAULT_CONFIG.steamMissing),
    steamMode: (STEAM_MODES.includes(steamModeRaw as SteamMode)
      ? steamModeRaw
      : DEFAULT_CONFIG.steamMode) as SteamMode,
    grokUrl: asString(raw.grokUrl, DEFAULT_CONFIG.grokUrl).trim() || DEFAULT_CONFIG.grokUrl,
    esdePath: asString(raw.esdePath, DEFAULT_CONFIG.esdePath).trim(),
    stremioPath: asString(raw.stremioPath, DEFAULT_CONFIG.stremioPath).trim(),
    sdPath: asString(raw.sdPath, DEFAULT_CONFIG.sdPath).trim(),
    steamPath: asString(raw.steamPath, DEFAULT_CONFIG.steamPath).trim(),
  };
}

function loadConfig(): OrbitConfig {
  try {
    const raw = localStorage.getItem(STORAGE_CONFIG);
    if (!raw) return { ...DEFAULT_CONFIG };
    const parsed = parseOrbitConfig(JSON.parse(raw));
    return parsed ?? { ...DEFAULT_CONFIG };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig(): void {
  localStorage.setItem(STORAGE_CONFIG, JSON.stringify(state.config));
}

/* ——— State ——— */

const state = {
  config: loadConfig(),
  carouselIndex: 0,
  focusZone: "carousel" as FocusZone,
  dockIndex: 0,
  modality: "mouse-keyboard" as InputModality,
  tutorialStep: 0,
  overlay: null as OverlayKind,
  launchLocked: false,
  launchTimer: 0 as number,
  pathCtaTarget: "" as string,
};

function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} missing`);
  return el;
}

function games(): Game[] {
  if (state.config.steamMissing || state.config.emptyLibrary) return [];
  return MOCK_GAMES;
}

function pathLooksMissing(path: string): boolean {
  return !path || !path.trim();
}

function dockItems(): HTMLButtonElement[] {
  const all = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".dock-item"),
  );
  return all.filter((b) => !b.classList.contains("hidden"));
}

/* ——— InputGlyphProvider (U-03) ——— */

const GlyphProvider = {
  modality(): InputModality {
    return state.modality;
  },
  set(m: InputModality): void {
    if (state.modality === m) {
      // still refresh tutorial/hints if needed
      return;
    }
    state.modality = m;
    document.documentElement.setAttribute("data-input", m);
    renderHints();
    if (state.overlay === "tutorial") renderTutorial();
  },
  force(m: InputModality): void {
    state.modality = m;
    document.documentElement.setAttribute("data-input", m);
    renderHints();
    if (state.overlay === "tutorial") renderTutorial();
  },
  glyphHtml(
    kind: "open" | "back",
  ): string {
    if (state.modality === "gamepad") {
      if (kind === "open") {
        return `<kbd class="pad">A</kbd> <span class="hint-label">Open</span>`;
      }
      return `<kbd class="pad">B</kbd> <span class="hint-label">Back / Salir a Windows</span>`;
    }
    if (kind === "open") {
      return (
        `<img class="hint-icon" src="/assets/icons/input/click.png" alt="" />` +
        `<span class="hint-label">Click</span>` +
        `<span class="hint-sep">/</span>` +
        `<img class="hint-icon" src="/assets/icons/input/enter.png" alt="" />` +
        `<span class="hint-label">Enter = Open</span>`
      );
    }
    return (
      `<img class="hint-icon" src="/assets/icons/input/esc.png" alt="" />` +
      `<span class="hint-label">Esc = Back / Salir a Windows</span>`
    );
  },
  openPhrase(): string {
    return state.modality === "gamepad" ? "A" : "Click / Enter";
  },
  backPhrase(): string {
    return state.modality === "gamepad" ? "B" : "Esc";
  },
};

function renderHints(): void {
  const el = $("hints");
  el.innerHTML =
    `<span class="hint">${GlyphProvider.glyphHtml("open")}</span>` +
    `<span class="hint">${GlyphProvider.glyphHtml("back")}</span>`;
}

/* ——— Theme / UI ——— */

function applyTheme(theme: ThemeId): void {
  document.documentElement.setAttribute("data-theme", theme);
  state.config.theme = theme;
  document.querySelectorAll<HTMLButtonElement>("[data-theme-pick]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.themePick === theme);
  });
  const sel = document.getElementById("settings-theme") as HTMLSelectElement | null;
  if (sel) sel.value = theme;
}

function updateClock(): void {
  const now = new Date();
  $("clock").textContent = now.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function showOverlay(kind: OverlayKind): void {
  state.overlay = kind;
  $("tutorial").classList.toggle("hidden", kind !== "tutorial");
  $("settings").classList.toggle("hidden", kind !== "settings");
  $("theme-picker").classList.toggle("hidden", kind !== "theme");
  $("launching").classList.toggle("hidden", kind !== "launching");
  $("confirm-exit").classList.toggle("hidden", kind !== "confirm-exit");
  $("path-cta").classList.toggle("hidden", kind !== "path-cta");
  syncFocusClass();
}

function closeOverlay(): void {
  if (state.overlay === "launching") return;
  showOverlay(null);
}

function cancelLaunch(): void {
  if (!state.launchLocked) return;
  window.clearTimeout(state.launchTimer);
  state.launchLocked = false;
  state.launchTimer = 0;
  showOverlay(null);
}

function renderCarousel(): void {
  const list = games();
  const wrap = $("carousel-wrap");
  const empty = $("empty-state");
  const carousel = $("carousel");
  const dots = $("carousel-dots");
  const title = $("focus-title");

  if (list.length === 0) {
    wrap.classList.add("hidden");
    empty.classList.remove("hidden");
    title.textContent = "";
    state.focusZone = "dock";

    const steamMissing = state.config.steamMissing;
    $("empty-title").textContent = steamMissing
      ? "Steam not found"
      : "No games in collection";
    $("empty-body").textContent = steamMissing
      ? "Orbit could not find Steam. Relocate the install path or open Steam once, then Retry."
      : "Your library is empty. Open Steam to browse or add games (including non-Steam shortcuts).";
    $("btn-relocate-steam").classList.toggle("hidden", !steamMissing);
    return;
  }

  wrap.classList.remove("hidden");
  empty.classList.add("hidden");
  if (state.carouselIndex >= list.length) state.carouselIndex = 0;

  carousel.replaceChildren();
  dots.replaceChildren();

  const spacing = Math.min(160, Math.max(110, window.innerWidth * 0.12));

  list.forEach((game, i) => {
    const offset = i - state.carouselIndex;
    const abs = Math.abs(offset);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "poster" + (offset === 0 ? " is-focus" : "");
    btn.dataset.focus = `game-${i}`;
    btn.setAttribute("aria-label", `${game.name}, ${game.genre}`);
    btn.style.setProperty("--tx", `${offset * spacing}px`);
    btn.style.setProperty(
      "--ry",
      `${Math.max(-42, Math.min(42, offset * -18))}deg`,
    );
    btn.style.setProperty(
      "--sc",
      String(offset === 0 ? 1 : Math.max(0.55, 0.85 - abs * 0.12)),
    );
    btn.style.setProperty(
      "--op",
      String(abs > 3 ? 0 : Math.max(0.25, 1 - abs * 0.22)),
    );
    btn.style.zIndex = String(10 - abs);
    btn.style.backgroundImage = `linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.55)), url("${game.poster}"), linear-gradient(135deg, ${game.color}, #111)`;
    btn.style.backgroundColor = game.color;

    const label = document.createElement("span");
    label.className = "poster-label";
    label.textContent = game.name;
    const open = document.createElement("span");
    open.className = "poster-open";
    open.textContent = "Open";
    btn.append(label, open);

    btn.addEventListener("click", () => {
      GlyphProvider.force("mouse-keyboard");
      if (i !== state.carouselIndex) {
        state.carouselIndex = i;
        state.focusZone = "carousel";
        renderCarousel();
        syncFocusClass();
        return;
      }
      void launchGame(game);
    });

    carousel.append(btn);

    const dot = document.createElement("span");
    if (i === state.carouselIndex) dot.classList.add("active");
    dots.append(dot);
  });

  const focus = list[state.carouselIndex];
  title.textContent = focus ? `${focus.name} · ${focus.genre}` : "";
}

function syncFocusClass(): void {
  document
    .querySelectorAll(".is-focused")
    .forEach((el) => el.classList.remove("is-focused"));
  if (state.overlay) return;

  if (state.focusZone === "carousel" && games().length > 0) {
    const poster = document.querySelector<HTMLElement>(
      `.poster[data-focus="game-${state.carouselIndex}"]`,
    );
    poster?.classList.add("is-focused");
    return;
  }

  const items = dockItems();
  if (state.dockIndex >= items.length) {
    state.dockIndex = Math.max(0, items.length - 1);
  }
  items[state.dockIndex]?.classList.add("is-focused");
}

function updatePathHealth(): void {
  const esdeBad = pathLooksMissing(state.config.esdePath);
  const sdBad = state.config.showSd && pathLooksMissing(state.config.sdPath);
  const steamBad = state.config.steamMissing;

  document
    .querySelectorAll<HTMLElement>("[data-offline-for='emulators']")
    .forEach((el) => el.classList.toggle("hidden", !esdeBad));
  document
    .querySelectorAll<HTMLElement>("[data-offline-for='sd']")
    .forEach((el) => el.classList.toggle("hidden", !sdBad));

  const dockEmu = document.querySelector<HTMLElement>('[data-dock="emulators"]');
  dockEmu?.classList.toggle("is-offline", esdeBad);
  const dockSd = document.querySelector<HTMLElement>('[data-dock="sd"]');
  dockSd?.classList.toggle("is-offline", sdBad);

  const banner = $("path-banner");
  const issues: string[] = [];
  if (steamBad) issues.push("Steam");
  if (esdeBad) issues.push("ES-DE");
  if (sdBad) issues.push("SD/ROMs");
  if (issues.length) {
    banner.classList.remove("hidden");
    $("path-banner-text").textContent =
      `Missing path: ${issues.join(", ")}. Shortcuts stay offline — no crash.`;
  } else {
    banner.classList.add("hidden");
  }
}

function applyConfigToUi(): void {
  applyTheme(state.config.theme);
  $("offline-banner").classList.toggle("hidden", !state.config.offline);
  $("dock-sd").classList.toggle("hidden", !state.config.showSd);

  const empty = document.getElementById("settings-empty") as HTMLInputElement;
  const offline = document.getElementById("settings-offline") as HTMLInputElement;
  const steamMissing = document.getElementById(
    "settings-steam-missing",
  ) as HTMLInputElement;
  const sd = document.getElementById("settings-sd") as HTMLInputElement;
  const grok = document.getElementById("settings-grok") as HTMLInputElement;
  const esde = document.getElementById("settings-esde") as HTMLInputElement;
  const stremio = document.getElementById("settings-stremio") as HTMLInputElement;
  const sdPath = document.getElementById("settings-sd-path") as HTMLInputElement;
  const steamPath = document.getElementById(
    "settings-steam-path",
  ) as HTMLInputElement;
  const steamMode = document.getElementById(
    "settings-steam-mode",
  ) as HTMLSelectElement;

  empty.checked = state.config.emptyLibrary;
  offline.checked = state.config.offline;
  steamMissing.checked = state.config.steamMissing;
  sd.checked = state.config.showSd;
  grok.value = state.config.grokUrl;
  esde.value = state.config.esdePath;
  stremio.value = state.config.stremioPath;
  sdPath.value = state.config.sdPath;
  steamPath.value = state.config.steamPath;
  steamMode.value = state.config.steamMode;

  updatePathHealth();
  renderCarousel();
  syncFocusClass();
}

function readSettingsForm(): void {
  state.config.theme = (
    document.getElementById("settings-theme") as HTMLSelectElement
  ).value as ThemeId;
  state.config.steamMode = (
    document.getElementById("settings-steam-mode") as HTMLSelectElement
  ).value as SteamMode;
  state.config.emptyLibrary = (
    document.getElementById("settings-empty") as HTMLInputElement
  ).checked;
  state.config.offline = (
    document.getElementById("settings-offline") as HTMLInputElement
  ).checked;
  state.config.steamMissing = (
    document.getElementById("settings-steam-missing") as HTMLInputElement
  ).checked;
  state.config.showSd = (
    document.getElementById("settings-sd") as HTMLInputElement
  ).checked;
  state.config.grokUrl =
    (document.getElementById("settings-grok") as HTMLInputElement).value.trim() ||
    DEFAULT_CONFIG.grokUrl;
  state.config.esdePath = (
    document.getElementById("settings-esde") as HTMLInputElement
  ).value.trim();
  state.config.stremioPath = (
    document.getElementById("settings-stremio") as HTMLInputElement
  ).value.trim();
  state.config.sdPath = (
    document.getElementById("settings-sd-path") as HTMLInputElement
  ).value.trim();
  state.config.steamPath = (
    document.getElementById("settings-steam-path") as HTMLInputElement
  ).value.trim();
  saveConfig();
  applyConfigToUi();
}

/* ——— Launch with debounce + Cancel (U-05) ——— */

async function openExternal(target: string, label: string): Promise<void> {
  if (state.launchLocked) return;
  state.launchLocked = true;
  showOverlay("launching");
  $("launching-title").textContent = `Launching ${label}`;
  $("launching-sub").textContent = target.startsWith("http")
    ? "Opening link…"
    : "Handing off (mock on this box)…";

  try {
    const maybeTauri = (
      window as unknown as {
        __TAURI__?: {
          core?: { invoke?: (cmd: string, args: unknown) => Promise<unknown> };
        };
      }
    ).__TAURI__;
    if (maybeTauri?.core?.invoke) {
      try {
        await maybeTauri.core.invoke("plugin:opener|open_url", { url: target });
      } catch {
        if (target.startsWith("http")) {
          window.open(target, "_blank", "noopener,noreferrer");
        }
      }
    } else if (target.startsWith("http")) {
      window.open(target, "_blank", "noopener,noreferrer");
    }
  } finally {
    state.launchTimer = window.setTimeout(() => {
      state.launchLocked = false;
      state.launchTimer = 0;
      if (state.overlay === "launching") showOverlay(null);
    }, 1600);
  }
}

async function launchGame(game: Game): Promise<void> {
  if (state.config.steamMissing) {
    showPathCta(
      "Steam not found",
      "Install Steam or set the Steam path in Settings, then try again.",
    );
    return;
  }
  await openExternal(`steam://rungameid/${game.id}`, game.name);
}

function showPathCta(title: string, body: string): void {
  $("path-cta-title").textContent = title;
  $("path-cta-body").textContent = body;
  showOverlay("path-cta");
}

async function activateDock(id: string): Promise<void> {
  if (state.launchLocked) return;

  switch (id) {
    case "steam": {
      if (state.config.steamMissing) {
        showPathCta(
          "Steam not found",
          "Orbit could not find Steam. Relocate the install path in Settings.",
        );
        return;
      }
      const url =
        state.config.steamMode === "desktop"
          ? "steam://open/main"
          : "steam://open/bigpicture";
      const label =
        state.config.steamMode === "desktop"
          ? "Steam Desktop"
          : "Steam Big Picture";
      await openExternal(url, label);
      break;
    }
    case "emulators": {
      if (pathLooksMissing(state.config.esdePath)) {
        showPathCta(
          "ES-DE path missing",
          "Set the Emulators / ES-DE path in Settings. Orbit will not crash — this shortcut stays offline until fixed.",
        );
        return;
      }
      await openExternal(
        state.config.esdePath.startsWith("http")
          ? state.config.esdePath
          : `file:///${state.config.esdePath.replace(/\\/g, "/")}`,
        "Emulators / ES-DE",
      );
      break;
    }
    case "stremio":
      await openExternal(state.config.stremioPath || "stremio://", "Stremio");
      break;
    case "grok":
      await openExternal(state.config.grokUrl, "Grok");
      break;
    case "desktop":
      await requestExitToDesktop();
      break;
    case "sd": {
      if (pathLooksMissing(state.config.sdPath)) {
        showPathCta(
          "SD / ROMs folder missing",
          "Point to your SD or ROMs folder in Settings, or hide the dock item.",
        );
        return;
      }
      await openExternal(
        state.config.sdPath.startsWith("http")
          ? state.config.sdPath
          : `file:///${state.config.sdPath.replace(/\\/g, "/")}`,
        "SD / ROMs",
      );
      break;
    }
  }
}

/* ——— Desktop label + first-time confirm (U-04) ——— */

async function requestExitToDesktop(): Promise<void> {
  if (!localStorage.getItem(STORAGE_DESKTOP_OK)) {
    showOverlay("confirm-exit");
    return;
  }
  await exitToDesktop();
}

async function exitToDesktop(): Promise<void> {
  localStorage.setItem(STORAGE_DESKTOP_OK, "1");
  if (state.launchLocked) return;
  state.launchLocked = true;
  showOverlay("launching");
  $("launching-title").textContent = "Salir a Windows";
  $("launching-sub").textContent = "Returning to desktop…";
  try {
    const maybeTauri = (
      window as unknown as {
        __TAURI__?: {
          core?: { invoke?: (cmd: string, args?: unknown) => Promise<unknown> };
        };
      }
    ).__TAURI__;
    if (maybeTauri?.core?.invoke) {
      try {
        await maybeTauri.core.invoke("plugin:opener|open_path", {
          path: "shell:AppsFolder",
        });
      } catch {
        // web preview can't exit
      }
    }
  } finally {
    state.launchTimer = window.setTimeout(() => {
      state.launchLocked = false;
      state.launchTimer = 0;
      if (state.overlay === "launching") showOverlay(null);
    }, 900);
  }
}

function activateFocus(): void {
  if (state.launchLocked) return;
  if (state.overlay === "tutorial") {
    advanceTutorial();
    return;
  }
  if (state.overlay === "confirm-exit") {
    void exitToDesktop();
    return;
  }
  if (state.overlay === "path-cta") {
    showOverlay("settings");
    return;
  }
  if (state.overlay === "settings" || state.overlay === "theme") {
    if (state.overlay === "settings") readSettingsForm();
    closeOverlay();
    return;
  }
  if (state.focusZone === "carousel") {
    const g = games()[state.carouselIndex];
    if (g) void launchGame(g);
    return;
  }
  const item = dockItems()[state.dockIndex];
  if (item?.dataset.dock) void activateDock(item.dataset.dock);
}

function moveFocus(dx: number, dy: number): void {
  if (state.overlay || state.launchLocked) return;

  if (dy > 0) {
    state.focusZone = "dock";
    syncFocusClass();
    return;
  }
  if (dy < 0 && games().length > 0) {
    state.focusZone = "carousel";
    syncFocusClass();
    return;
  }

  if (state.focusZone === "carousel") {
    const list = games();
    if (!list.length) return;
    state.carouselIndex =
      (state.carouselIndex + dx + list.length) % list.length;
    renderCarousel();
    syncFocusClass();
    return;
  }

  const items = dockItems();
  if (!items.length) return;
  state.dockIndex = (state.dockIndex + dx + items.length) % items.length;
  syncFocusClass();
}

/* ——— Tutorial with adaptive glyphs ——— */

function tutorialBodyHtml(step: number): string {
  const open = GlyphProvider.openPhrase();
  const back = GlyphProvider.backPhrase();
  const openGlyph = GlyphProvider.glyphHtml("open");
  const backGlyph = GlyphProvider.glyphHtml("back");

  switch (step) {
    case 0:
      return `<p>Orbit Shell is a home screen for Steam + a few shortcuts. It does not install games.</p>`;
    case 1:
      return (
        `<p>D-pad / stick / arrows move focus.</p>` +
        `<p class="tutorial-glyphs">${openGlyph}</p>` +
        `<p class="tutorial-glyphs">${backGlyph}</p>` +
        `<p class="muted-note">On home, ${back} exits to Windows (Salir a Windows).</p>`
      );
    case 2:
      return `<p>Dock <strong>Steam</strong> opens ${
        state.config.steamMode === "desktop" ? "Desktop Steam" : "Big Picture"
      } by default. Carousel games launch directly with <code>steam://rungameid</code>.</p>`;
    case 3:
      return `<p>Point ES-DE, Stremio, Grok, and optional SD/ROMs in Settings. Export config anytime. Press ${open} to finish.</p>`;
    default:
      return "";
  }
}

function renderTutorial(): void {
  const titles = ["Welcome", "Move & open", "Steam", "Your stuff"];
  $("tutorial-step-n").textContent = String(state.tutorialStep + 1);
  $("tutorial-title").textContent = titles[state.tutorialStep] ?? "";
  $("tutorial-body").innerHTML = tutorialBodyHtml(state.tutorialStep);
  const next = $("tutorial-next") as HTMLButtonElement;
  next.textContent =
    state.tutorialStep >= 3 ? "Done" : "Next";
}

function advanceTutorial(): void {
  if (state.tutorialStep >= 3) {
    finishTutorial();
    return;
  }
  state.tutorialStep += 1;
  renderTutorial();
}

function finishTutorial(): void {
  localStorage.setItem(STORAGE_TUTORIAL, "1");
  showOverlay(null);
}

function startTutorial(): void {
  state.tutorialStep = 0;
  renderTutorial();
  showOverlay("tutorial");
}

/* ——— Export / Import with rollback (U-01) ——— */

function exportConfig(): void {
  readSettingsForm();
  const blob = new Blob([JSON.stringify(state.config, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "orbit-shell-config.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importConfig(file: File): void {
  const status = $("settings-import-status");
  const snapshot = JSON.parse(JSON.stringify(state.config)) as OrbitConfig;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = String(reader.result ?? "");
      if (!text.trim()) throw new Error("empty");
      const raw = JSON.parse(text) as unknown;
      const parsed = parseOrbitConfig(raw);
      if (!parsed) throw new Error("schema");
      state.config = parsed;
      saveConfig();
      applyConfigToUi();
      status.textContent = "Import OK — config applied.";
      status.dataset.tone = "ok";
    } catch {
      state.config = snapshot;
      saveConfig();
      applyConfigToUi();
      status.textContent =
        "Import failed — invalid JSON or schema. Rolled back to previous config.";
      status.dataset.tone = "err";
    }
  };
  reader.onerror = () => {
    state.config = snapshot;
    status.textContent = "Import failed — could not read file. Rolled back.";
    status.dataset.tone = "err";
  };
  reader.readAsText(file);
}

/* ——— Input binding ——— */

function bindUi(): void {
  $("btn-settings").addEventListener("click", () => {
    GlyphProvider.force("mouse-keyboard");
    $("settings-import-status").textContent = "";
    applyConfigToUi();
    showOverlay("settings");
  });
  $("btn-theme").addEventListener("click", () => {
    GlyphProvider.force("mouse-keyboard");
    showOverlay("theme");
  });
  $("settings-close").addEventListener("click", () => {
    readSettingsForm();
    closeOverlay();
  });
  $("theme-picker-close").addEventListener("click", () => closeOverlay());

  [
    "settings-theme",
    "settings-steam-mode",
    "settings-empty",
    "settings-offline",
    "settings-steam-missing",
    "settings-sd",
  ].forEach((id) => {
    $(id).addEventListener("change", () => readSettingsForm());
  });
  [
    "settings-grok",
    "settings-esde",
    "settings-stremio",
    "settings-sd-path",
    "settings-steam-path",
  ].forEach((id) => {
    $(id).addEventListener("change", () => readSettingsForm());
  });

  document.querySelectorAll<HTMLButtonElement>("[data-theme-pick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (state.launchLocked) return;
      const t = btn.dataset.themePick as ThemeId;
      applyTheme(t);
      saveConfig();
    });
  });

  $("btn-export").addEventListener("click", () => exportConfig());
  $("btn-import").addEventListener("click", () => $("import-file").click());
  $("import-file").addEventListener("change", (e) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) importConfig(file);
    input.value = "";
  });
  $("btn-replay-tutorial").addEventListener("click", () => {
    closeOverlay();
    startTutorial();
  });

  $("tutorial-skip").addEventListener("click", () => finishTutorial());
  $("tutorial-next").addEventListener("click", () => advanceTutorial());

  $("confirm-exit-cancel").addEventListener("click", () => showOverlay(null));
  $("confirm-exit-ok").addEventListener("click", () => void exitToDesktop());

  $("path-cta-close").addEventListener("click", () => showOverlay(null));
  $("path-cta-settings").addEventListener("click", () => {
    showOverlay("settings");
  });
  $("btn-fix-paths").addEventListener("click", () => showOverlay("settings"));

  $("launching-cancel").addEventListener("click", () => cancelLaunch());

  $("btn-retry-online").addEventListener("click", () => {
    state.config.offline = false;
    saveConfig();
    applyConfigToUi();
  });
  $("btn-use-cache").addEventListener("click", () => {
    state.config.offline = false;
    state.config.emptyLibrary = false;
    state.config.steamMissing = false;
    saveConfig();
    applyConfigToUi();
  });
  $("btn-open-steam-empty").addEventListener("click", () => {
    void activateDock("steam");
  });
  $("btn-relocate-steam").addEventListener("click", () => {
    showOverlay("settings");
  });

  // Hot-swap input modality (U-03)
  window.addEventListener("pointerdown", () => {
    GlyphProvider.set("mouse-keyboard");
  });
  window.addEventListener(
    "mousemove",
    () => {
      GlyphProvider.set("mouse-keyboard");
    },
    { passive: true },
  );
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", () => {
    renderCarousel();
    syncFocusClass();
  });

  window.addEventListener("gamepadconnected", () => {
    GlyphProvider.force("gamepad");
  });
  window.addEventListener("gamepaddisconnected", () => {
    const pads = navigator.getGamepads?.();
    const any = pads && Array.from(pads).some(Boolean);
    if (!any) GlyphProvider.force("mouse-keyboard");
  });
  window.setInterval(pollGamepad, 100);
}

function onKeyDown(e: KeyboardEvent): void {
  GlyphProvider.set("mouse-keyboard");
  const key = e.key;

  if (key === "Escape") {
    e.preventDefault();
    if (state.overlay === "launching") {
      cancelLaunch();
      return;
    }
    if (state.overlay === "tutorial") {
      finishTutorial();
      return;
    }
    if (state.overlay === "confirm-exit" || state.overlay === "path-cta") {
      showOverlay(null);
      return;
    }
    if (state.overlay) {
      if (state.overlay === "settings") readSettingsForm();
      closeOverlay();
      return;
    }
    void requestExitToDesktop();
    return;
  }

  if (state.overlay === "launching") return;

  if (state.overlay === "settings" || state.overlay === "theme") {
    if (key === "Enter" && state.overlay === "theme") closeOverlay();
    return;
  }

  if (
    state.overlay === "tutorial" ||
    state.overlay === "confirm-exit" ||
    state.overlay === "path-cta"
  ) {
    if (key === "Enter" || key === " ") {
      e.preventDefault();
      activateFocus();
    }
    return;
  }

  if (key === "ArrowLeft") {
    e.preventDefault();
    moveFocus(-1, 0);
  } else if (key === "ArrowRight") {
    e.preventDefault();
    moveFocus(1, 0);
  } else if (key === "ArrowDown") {
    e.preventDefault();
    moveFocus(0, 1);
  } else if (key === "ArrowUp") {
    e.preventDefault();
    moveFocus(0, -1);
  } else if (key === "Enter") {
    e.preventDefault();
    activateFocus();
  }
}

let prevButtons: boolean[] = [];
const axisGate = { last: 0, lx: 0, ly: 0 };

function pollGamepad(): void {
  const pads = navigator.getGamepads?.();
  if (!pads) return;
  const pad = Array.from(pads).find(Boolean);
  if (!pad) return;

  const buttons = pad.buttons.map((b) => b.pressed);
  const pressed = (i: number) => buttons[i] && !prevButtons[i];

  if (
    buttons.some(Boolean) ||
    Math.abs(pad.axes[0] ?? 0) > 0.5 ||
    Math.abs(pad.axes[1] ?? 0) > 0.5
  ) {
    GlyphProvider.set("gamepad");
  }

  if (state.launchLocked) {
    if (pressed(1)) cancelLaunch(); // B cancels launching
    prevButtons = buttons;
    return;
  }

  if (pressed(0)) activateFocus(); // A
  if (pressed(1)) {
    // B
    if (state.overlay === "tutorial") finishTutorial();
    else if (state.overlay === "confirm-exit" || state.overlay === "path-cta") {
      showOverlay(null);
    } else if (state.overlay) {
      if (state.overlay === "settings") readSettingsForm();
      closeOverlay();
    } else void requestExitToDesktop();
  }
  if (pressed(14)) moveFocus(-1, 0);
  if (pressed(15)) moveFocus(1, 0);
  if (pressed(12)) moveFocus(0, -1);
  if (pressed(13)) moveFocus(0, 1);

  const ax = pad.axes[0] ?? 0;
  const ay = pad.axes[1] ?? 0;
  const now = performance.now();
  if (now - axisGate.last > 220) {
    if (ax < -0.55 && axisGate.lx >= -0.55) {
      moveFocus(-1, 0);
      axisGate.last = now;
    } else if (ax > 0.55 && axisGate.lx <= 0.55) {
      moveFocus(1, 0);
      axisGate.last = now;
    } else if (ay < -0.55 && axisGate.ly >= -0.55) {
      moveFocus(0, -1);
      axisGate.last = now;
    } else if (ay > 0.55 && axisGate.ly <= 0.55) {
      moveFocus(0, 1);
      axisGate.last = now;
    }
  }
  axisGate.lx = ax;
  axisGate.ly = ay;

  prevButtons = buttons;
}

function boot(): void {
  GlyphProvider.force("mouse-keyboard");
  applyConfigToUi();
  updateClock();
  window.setInterval(updateClock, 15_000);
  bindUi();

  $("dock").addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
      ".dock-item",
    );
    if (!btn || btn.classList.contains("hidden") || !btn.dataset.dock) return;
    const items = dockItems();
    const idx = items.indexOf(btn);
    if (idx >= 0) state.dockIndex = idx;
    state.focusZone = "dock";
    GlyphProvider.force("mouse-keyboard");
    syncFocusClass();
    void activateDock(btn.dataset.dock);
  });

  if (!localStorage.getItem(STORAGE_TUTORIAL)) {
    startTutorial();
  } else {
    showOverlay(null);
  }
}

window.addEventListener("DOMContentLoaded", boot);
