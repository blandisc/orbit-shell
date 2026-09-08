# Orbit Shell

Pantalla de inicio ligera para **Steam** en Windows (pensada para Legion Go y otros handhelds). No instala juegos: lee la biblioteca que ya tienes y lanza Steam, Big Picture, ES-DE, Stremio y Grok.

A lightweight Steam-centric console shell. Tauri 2 + web UI. Three themes (B2 Green CRT, A-Prime, C Nordic).

---

## Instalar (Windows / Legion Go) — sin programar

1. **Instala Steam** y, si quieres, inicia sesión y descarga al menos un juego.
2. Descarga el instalador de Orbit Shell (`Orbit Shell_0.1.0_x64-setup.exe`) desde [Releases](https://github.com/blandisc/orbit-shell/releases) o, si compilas tú, desde `src-tauri/target/release/bundle/nsis/`.
3. Ejecuta el instalador. Es **por usuario** (`currentUser`): no hace falta ser administrador.
4. Abre **Orbit Shell**. Verás un tutorial de 4 pasos (se puede saltar con Skip / B / Esc).
5. Si Steam está instalado, el carrusel muestra **tus juegos reales** con portadas de Steam. Si no, verás una pantalla vacía con ayuda — nunca una biblioteca inventada.

### Cómo se usa

| Control | Acción |
| --- | --- |
| D-pad / stick / flechas | Mover el foco (carrusel o dock) |
| **A** / clic / Enter | Abrir |
| **B** / Esc | Atrás. En el inicio: **Salir a Windows** (pide confirmación la primera vez) |

- **Carrusel** → lanza el juego con `steam://rungameid/<id>`.
- **Dock Steam** → Steam Big Picture (`steam://open/bigpicture`). En Ajustes puedes cambiarlo a Steam de escritorio.
- **Emuladores** → ES-DE (ruta en Ajustes).
- **Stremio** → protocolo `stremio://` o un `.exe`.
- **Grok** → URL (por defecto `https://grok.com`).
- **Salir a Windows** → cierra Orbit y vuelve al escritorio.
- **SD** → abre la carpeta de ROMs (opcional).

Al abrir un juego o una app, Orbit **se minimiza**. Vuelve a Orbit desde la barra de tareas o el atajo que uses.

Ajustes → **Export JSON / Import JSON** para copiar la config a otro PC. Un JSON inválido se rechaza y se restaura el anterior.

---

## Install (English)

1. Install Steam (and optionally a game).
2. Run the NSIS setup (`currentUser`, no admin required).
3. Open Orbit Shell. Skip the 4-step tutorial if you want.
4. With Steam installed: real games + real cover art. Without Steam: empty state and guidance, not fake titles.

---

## Compilar en Windows (para desarrolladores)

Necesitas:

- [Node.js 20+](https://nodejs.org/)
- [Rust](https://rustup.rs/) **1.88+** (stable actual; `rustup update`)
- [WebView2](https://developer.microsoft.com/microsoft-edge/webview2/) (ya viene en Windows 10/11 recientes)
- Visual Studio Build Tools (C++ workload) o MSVC

```bat
git clone https://github.com/blandisc/orbit-shell.git
cd orbit-shell
npm install
npm run build
npm run tauri:build
```

El instalador queda en:

`src-tauri\target\release\bundle\nsis\`

Durante el desarrollo:

```bat
npm run tauri:dev
```

Solo la UI en el navegador (sin leer Steam):

```bat
npm run dev
```

Abre http://localhost:1420 — verás el estado vacío honesto. La biblioteca real solo aparece en la app Tauri de Windows.

`tauri.conf.json` es UTF-8 sin BOM. NSIS usa `"installMode": "currentUser"`.

---

## Cómo detecta Steam

En Windows, Orbit busca en este orden:

1. Ruta que pongas en Ajustes
2. Registro (`HKCU\Software\Valve\Steam\SteamPath`, `HKLM\SOFTWARE\WOW6432Node\Valve\Steam`)
3. Carpetas habituales (`C:\Program Files (x86)\Steam`, `C:\Program Files\Steam`, `D:\Steam`, …)

Luego lee `steamapps/libraryfolders.vdf` y cada `appmanifest_*.acf` (juegos instalados). Los atajos no-Steam de `userdata/*/config/shortcuts.vdf` también entran.

Portadas, en este orden:

1. Arte local (Steam grid + `appcache/librarycache`)
2. CDN de Steam (`library_600x900.jpg`, luego hero/header)
3. Inicial del título, solo si no hay arte

Nunca rellena el carrusel con juegos de mentira.

---

## Config JSON (v1)

Campos: `theme`, `steamMode` (`bigpicture` | `desktop`), `steamPath`, `esdePath`, `stremioPath`, `grokUrl`, `sdPath`, `showSd`. Los checks de depuración (`emptyLibrary`, `offline`, `steamMissing`) son opcionales y viven en Ajustes → Avanzado.

Rutas por defecto (placeholders genéricos, no de una sola persona):

- Steam: `C:\Program Files (x86)\Steam`
- ES-DE: `C:\Program Files\ES-DE\ES-DE.exe`
- Stremio: `stremio://`
- Grok: `https://grok.com`
- SD/ROMs: `D:\ROMs`

---

## Legion Go — cómo comprobar

1. Instala Orbit en el Legion Go (Windows).
2. Con Steam instalado y al menos un juego: el carrusel muestra ese juego con su portada a color. A / Enter lo lanza. El dock Steam abre Big Picture.
3. Sin Steam (o con la ruta mal): pantalla **Steam not found**, botones Open Steam / Relocate / Retry. Cero juegos inventados.
4. El dock debe leerse a distancia de brazo (iconos ~88 px).
5. Temas B2 / A-Prime / C Nordic desde Tema. Chrome temático; portadas a color.
6. Exporta el JSON, cópialo a otro usuario, Impórtalo.
