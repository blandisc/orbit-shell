/** Orbit Shell — console home MVP (mock Steam library OK). */

type ThemeId = "b2" | "a-prime" | "c-nordic";
type InputModality = "keyboard" | "gamepad";
type FocusZone = "carousel" | "dock";

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
  grokUrl: string;
  esdePath: string;
  stremioPath: string;
  sdPath: string;
}

const STORAGE_CONFIG = "orbit-shell-config";
const STORAGE_TUTORIAL = "orbit-shell-tutorial-done";

const TUTORIAL_STEPS = [
  {
    title: "Welcome",
    body: "Orbit Shell is a home screen for Steam + a few shortcuts. It does not install games.",
  },
  {
    title: "Move & open",
    body: "D-pad/stick or arrows move focus. A / Enter opens. B / Esc goes back — or Desktop on home.",
  },
  {
    title: "Steam",
    body: "Dock Steam opens Big Picture. Carousel games launch directly with steam://rungameid.",
  },
  {
    title: "Your stuff",
    body: "Point Emulators (ES-DE), Stremio, Grok, and optional SD/ROMs folder in Settings. Export config anytime.",
  },
];

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

const DEFAULT_CONFIG: OrbitConfig = {
  version: 1,
  theme: "b2",
  showSd: true,
  emptyLibrary: false,
  offline: false,
  grokUrl: "https://grok.com",
  esdePath: "C:\\ES-DE\\ES-DE.exe",
  stremioPath: "stremio://",
  sdPath: "D:\\ROMs",
};

const state = {
  config: loadConfig(),
  carouselIndex: 0,
  focusZone: "carousel" as FocusZone,
  dockIndex: 0,
  modality: "keyboard" as InputModality,
  tutorialStep: 0,
  overlay: null as null | "tutorial" | "settings" | "theme" | "launching",
};

function loadConfig(): OrbitConfig {
  try {
    const raw = localStorage.getItem(STORAGE_CONFIG);
    if (!raw) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(raw) as Partial<OrbitConfig>;
    return { ...DEFAULT_CONFIG, ...parsed, version: 1 };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig(): void {
  localStorage.setItem(STORAGE_CONFIG, JSON.stringify(state.config));
}

function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} missing`);
  return el;
}

function games(): Game[] {
  return state.config.emptyLibrary ? [] : MOCK_GAMES;
}

function dockItems(): HTMLButtonElement[] {
  const all = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".dock-item"),
  );
  return all.filter((b) => !b.classList.contains("hidden"));
}

function applyTheme(theme: ThemeId): void {
  document.documentElement.setAttribute("data-theme", theme);
  state.config.theme = theme;
  document.querySelectorAll<HTMLButtonElement>("[data-theme-pick]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.themePick === theme);
  });
  const sel = document.getElementById("settings-theme") as HTMLSelectElement | null;
  if (sel) sel.value = theme;
}

function setModality(m: InputModality): void {
  state.modality = m;
  document.documentElement.setAttribute("data-input", m);
}

function updateClock(): void {
  const now = new Date();
  const text = now.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  $("clock").textContent = text;
}

function showOverlay(kind: typeof state.overlay): void {
  state.overlay = kind;
  $("tutorial").classList.toggle("hidden", kind !== "tutorial");
  $("settings").classList.toggle("hidden", kind !== "settings");
  $("theme-picker").classList.toggle("hidden", kind !== "theme");
  $("launching").classList.toggle("hidden", kind !== "launching");
}

function closeOverlay(): void {
  if (state.overlay === "launching") return;
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
    btn.style.setProperty("--ry", `${Math.max(-42, Math.min(42, offset * -18))}deg`);
    btn.style.setProperty("--sc", String(offset === 0 ? 1 : Math.max(0.55, 0.85 - abs * 0.12)));
    btn.style.setProperty("--op", String(abs > 3 ? 0 : Math.max(0.25, 1 - abs * 0.22)));
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
      setModality("keyboard");
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
  document.querySelectorAll(".is-focused").forEach((el) => el.classList.remove("is-focused"));
  if (state.overlay) return;

  if (state.focusZone === "carousel" && games().length > 0) {
    const poster = document.querySelector<HTMLElement>(
      `.poster[data-focus="game-${state.carouselIndex}"]`,
    );
    poster?.classList.add("is-focused");
    return;
  }

  const items = dockItems();
  if (state.dockIndex >= items.length) state.dockIndex = Math.max(0, items.length - 1);
  items[state.dockIndex]?.classList.add("is-focused");
}

function applyConfigToUi(): void {
  applyTheme(state.config.theme);
  $("offline-banner").classList.toggle("hidden", !state.config.offline);
  $("dock-sd").classList.toggle("hidden", !state.config.showSd);

  const empty = document.getElementById("settings-empty") as HTMLInputElement;
  const offline = document.getElementById("settings-offline") as HTMLInputElement;
  const sd = document.getElementById("settings-sd") as HTMLInputElement;
  const grok = document.getElementById("settings-grok") as HTMLInputElement;
  const esde = document.getElementById("settings-esde") as HTMLInputElement;
  const stremio = document.getElementById("settings-stremio") as HTMLInputElement;
  const sdPath = document.getElementById("settings-sd-path") as HTMLInputElement;
  empty.checked = state.config.emptyLibrary;
  offline.checked = state.config.offline;
  sd.checked = state.config.showSd;
  grok.value = state.config.grokUrl;
  esde.value = state.config.esdePath;
  stremio.value = state.config.stremioPath;
  sdPath.value = state.config.sdPath;

  renderCarousel();
  syncFocusClass();
}

function readSettingsForm(): void {
  state.config.theme = (document.getElementById("settings-theme") as HTMLSelectElement)
    .value as ThemeId;
  state.config.emptyLibrary = (
    document.getElementById("settings-empty") as HTMLInputElement
  ).checked;
  state.config.offline = (
    document.getElementById("settings-offline") as HTMLInputElement
  ).checked;
  state.config.showSd = (document.getElementById("settings-sd") as HTMLInputElement)
    .checked;
  state.config.grokUrl = (
    document.getElementById("settings-grok") as HTMLInputElement
  ).value.trim() || DEFAULT_CONFIG.grokUrl;
  state.config.esdePath = (
    document.getElementById("settings-esde") as HTMLInputElement
  ).value.trim();
  state.config.stremioPath = (
    document.getElementById("settings-stremio") as HTMLInputElement
  ).value.trim();
  state.config.sdPath = (
    document.getElementById("settings-sd-path") as HTMLInputElement
  ).value.trim();
  saveConfig();
  applyConfigToUi();
}

async function openExternal(target: string, label: string): Promise<void> {
  showOverlay("launching");
  $("launching-title").textContent = `Launching ${label}`;
  $("launching-sub").textContent = target.startsWith("http")
    ? "Opening link…"
    : "Handing off (mock on this box)…";

  try {
    // Prefer Tauri opener when available; fall back to browser open for web/dev.
    const maybeTauri = (
      window as unknown as {
        __TAURI__?: { core?: { invoke?: (cmd: string, args: unknown) => Promise<unknown> } };
      }
    ).__TAURI__;
    if (maybeTauri?.core?.invoke) {
      try {
        await maybeTauri.core.invoke("plugin:opener|open_url", { url: target });
      } catch {
        window.open(target, "_blank", "noopener,noreferrer");
      }
    } else {
      // steam:// and local paths won't work in plain browser — that's OK for MVP mock
      if (target.startsWith("http")) {
        window.open(target, "_blank", "noopener,noreferrer");
      }
    }
  } finally {
    window.setTimeout(() => {
      showOverlay(null);
    }, 900);
  }
}

async function launchGame(game: Game): Promise<void> {
  await openExternal(`steam://rungameid/${game.id}`, game.name);
}

async function activateDock(id: string): Promise<void> {
  switch (id) {
    case "steam":
      await openExternal("steam://open/bigpicture", "Steam Big Picture");
      break;
    case "emulators":
      await openExternal(
        state.config.esdePath.startsWith("http")
          ? state.config.esdePath
          : `file:///${state.config.esdePath.replace(/\\/g, "/")}`,
        "Emulators / ES-DE",
      );
      break;
    case "stremio":
      await openExternal(state.config.stremioPath || "stremio://", "Stremio");
      break;
    case "grok":
      await openExternal(state.config.grokUrl, "Grok");
      break;
    case "desktop":
      await exitToDesktop();
      break;
    case "sd":
      await openExternal(
        state.config.sdPath.startsWith("http")
          ? state.config.sdPath
          : `file:///${state.config.sdPath.replace(/\\/g, "/")}`,
        "SD / ROMs",
      );
      break;
  }
}

async function exitToDesktop(): Promise<void> {
  showOverlay("launching");
  $("launching-title").textContent = "Leaving Orbit";
  $("launching-sub").textContent = "Returning to desktop…";
  try {
    const maybeTauri = (
      window as unknown as {
        __TAURI__?: { core?: { invoke?: (cmd: string, args?: unknown) => Promise<unknown> } };
      }
    ).__TAURI__;
    if (maybeTauri?.core?.invoke) {
      try {
        await maybeTauri.core.invoke("plugin:opener|open_path", {
          path: "shell:AppsFolder",
        });
      } catch {
        // ignore — web preview can't exit the shell
      }
    }
  } finally {
    window.setTimeout(() => showOverlay(null), 700);
  }
}

function activateFocus(): void {
  if (state.overlay === "tutorial") {
    advanceTutorial();
    return;
  }
  if (state.overlay === "settings" || state.overlay === "theme") {
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
  if (state.overlay) return;

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
    state.carouselIndex = (state.carouselIndex + dx + list.length) % list.length;
    renderCarousel();
    syncFocusClass();
    return;
  }

  const items = dockItems();
  if (!items.length) return;
  state.dockIndex = (state.dockIndex + dx + items.length) % items.length;
  syncFocusClass();
}

function renderTutorial(): void {
  const step = TUTORIAL_STEPS[state.tutorialStep];
  if (!step) return;
  $("tutorial-step-n").textContent = String(state.tutorialStep + 1);
  $("tutorial-title").textContent = step.title;
  $("tutorial-body").textContent = step.body;
  const next = $("tutorial-next") as HTMLButtonElement;
  next.textContent = state.tutorialStep >= TUTORIAL_STEPS.length - 1 ? "Done" : "Next";
}

function advanceTutorial(): void {
  if (state.tutorialStep >= TUTORIAL_STEPS.length - 1) {
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
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result)) as Partial<OrbitConfig>;
      state.config = { ...DEFAULT_CONFIG, ...parsed, version: 1 };
      saveConfig();
      applyConfigToUi();
    } catch {
      window.alert("Could not import that JSON. Check the file and try again.");
    }
  };
  reader.readAsText(file);
}

function bindUi(): void {
  $("btn-settings").addEventListener("click", () => {
    setModality("keyboard");
    readSettingsForm();
    showOverlay("settings");
  });
  $("btn-theme").addEventListener("click", () => {
    setModality("keyboard");
    showOverlay("theme");
  });
  $("settings-close").addEventListener("click", () => {
    readSettingsForm();
    closeOverlay();
  });
  $("theme-picker-close").addEventListener("click", () => closeOverlay());

  ["settings-theme", "settings-empty", "settings-offline", "settings-sd"].forEach(
    (id) => {
      $(id).addEventListener("change", () => readSettingsForm());
    },
  );
  ["settings-grok", "settings-esde", "settings-stremio", "settings-sd-path"].forEach(
    (id) => {
      $(id).addEventListener("change", () => readSettingsForm());
    },
  );

  document.querySelectorAll<HTMLButtonElement>("[data-theme-pick]").forEach((btn) => {
    btn.addEventListener("click", () => {
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

  $("tutorial-skip").addEventListener("click", () => finishTutorial());
  $("tutorial-next").addEventListener("click", () => advanceTutorial());

  $("btn-retry-online").addEventListener("click", () => {
    state.config.offline = false;
    saveConfig();
    applyConfigToUi();
  });
  $("btn-use-cache").addEventListener("click", () => {
    state.config.offline = false;
    state.config.emptyLibrary = false;
    saveConfig();
    applyConfigToUi();
  });
  $("btn-open-steam-empty").addEventListener("click", () => {
    void activateDock("steam");
  });

  window.addEventListener("pointerdown", () => setModality("keyboard"));
  window.addEventListener("mousemove", () => setModality("keyboard"), {
    passive: true,
  });
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", () => {
    renderCarousel();
    syncFocusClass();
  });

  window.addEventListener("gamepadconnected", () => setModality("gamepad"));
  window.setInterval(pollGamepad, 100);
}

function onKeyDown(e: KeyboardEvent): void {
  setModality("keyboard");
  const key = e.key;

  if (key === "Escape") {
    e.preventDefault();
    if (state.overlay === "tutorial") {
      finishTutorial();
      return;
    }
    if (state.overlay && state.overlay !== "launching") {
      if (state.overlay === "settings") readSettingsForm();
      closeOverlay();
      return;
    }
    void exitToDesktop();
    return;
  }

  if (state.overlay === "settings" || state.overlay === "theme") {
    if (key === "Enter" && state.overlay === "theme") closeOverlay();
    return;
  }

  if (state.overlay === "tutorial") {
    if (key === "Enter" || key === " ") {
      e.preventDefault();
      advanceTutorial();
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

  // any activity flips modality
  if (
    buttons.some(Boolean) ||
    Math.abs(pad.axes[0] ?? 0) > 0.5 ||
    Math.abs(pad.axes[1] ?? 0) > 0.5
  ) {
    setModality("gamepad");
  }

  if (pressed(0)) activateFocus(); // A
  if (pressed(1)) {
    // B
    if (state.overlay === "tutorial") finishTutorial();
    else if (state.overlay && state.overlay !== "launching") {
      if (state.overlay === "settings") readSettingsForm();
      closeOverlay();
    } else void exitToDesktop();
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
  applyConfigToUi();
  updateClock();
  window.setInterval(updateClock, 15_000);
  bindUi();

  $("dock").addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".dock-item");
    if (!btn || btn.classList.contains("hidden") || !btn.dataset.dock) return;
    const items = dockItems();
    const idx = items.indexOf(btn);
    if (idx >= 0) state.dockIndex = idx;
    state.focusZone = "dock";
    setModality("keyboard");
    syncFocusClass();
    void activateDock(btn.dataset.dock);
  });

  if (!localStorage.getItem(STORAGE_TUTORIAL)) {
    state.tutorialStep = 0;
    renderTutorial();
    showOverlay("tutorial");
  } else {
    showOverlay(null);
  }
}

window.addEventListener("DOMContentLoaded", boot);
