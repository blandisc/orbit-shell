# Orbit Shell — Pack de investigacion de usabilidad aplicada
**Producto:** Orbit Shell (Tauri 2 + web UI). Fecha: 2026-09-07. Idioma: espanol.

---

## Resumen ejecutivo

Orbit Shell es un home screen transparente sobre Steam (Big Picture en el dock; steam://rungameid desde el carrusel), con atajos a ES-DE, Stremio, Grok y Desktop, tres temas (B2 Green CRT, A-Prime Ultra-minimal, C Nordic), tutorial de primer arranque (max 4 pasos, saltable) y config exportable/importable en un JSON.

Riesgos graves: modelos mentales incompatibles (Desktop Steam vs Big Picture), glifos footer que no adaptan A/B vs Click/Esc, biblioteca Steam-only, rutas rotas / SD desconectada, import JSON basura.

---

## 20 personas distintas

Cada persona: nombre, banda de edad, contexto de dispositivo, habilidad Steam, metas, discapacidades/restricciones relevantes.

### P01 — Sofía “primera vez”
- **Edad:** 28–34 · **Dispositivo:** Legion Go prestado, dock HDMI TV
- **Steam:** completa principiante (cuenta creada hoy)
- **Metas:** que se vea como una Switch y abra juegos
- **Restricciones:** ansiedad ante menús técnicos; lee poco inglés
- **Cita:** “¿Dónde está el botón de jugar?”

### P02 — Diego Deck refugee
- **Edad:** 30–38 · **Dispositivo:** Legion Go; viene de Steam Deck / Big Picture Mode
- **Steam:** avanzado; conoce steam:// y non-Steam shortcuts
- **Metas:** replicar flujo Deck sin aprender otra UI
- **Restricciones:** impaciente con tutoriales; odia wizard speak
- **Cita:** “Si no es Big Picture en un toque, me voy.”

### P03 — Mariana mamá multitarea
- **Edad:** 35–44 · **Dispositivo:** laptop Windows + mando Bluetooth ocasional
- **Steam:** básica (compra sales, no configura)
- **Metas:** lanzar un juego familiar en 30 segundos mientras cocina
- **Restricciones:** una mano ocupada; no quiere tocar rutas de archivos
- **Cita:** “Solo dime A para abrir.”

### P04 — Leo (hijo, 11)
- **Edad:** 10–12 · **Dispositivo:** Legion Go de papá, handheld
- **Steam:** media (juega con amigos; poco Steam nativo)
- **Metas:** mash botones hasta que algo pase; saltar tutorial
- **Restricciones:** lectura corta; no entiende export config
- **Cita:** “¿Puedo poner TikTok aquí?”

### P05 — Carmen (abuela supervisada)
- **Edad:** 62–70 · **Dispositivo:** TV + Legion Go dockeado, mouse inalámbrico grande
- **Steam:** nula
- **Metas:** ver Stremio / un juego de puzzle
- **Restricciones:** baja visión; necesita targets >=48px; tipografía grande
- **Cita:** “¿Cuál es el verde que abre?”

### P06 — Andrés solo-mouse laptop
- **Edad:** 22–28 · **Dispositivo:** Ultrabook sin touch, trackpad; sin mando
- **Steam:** media
- **Metas:** usar Orbit como launcher de escritorio, no “consola”
- **Restricciones:** mouse-only; si el footer dice A/B está perdido
- **Cita:** “¿Dónde hago clic para salir?”

### P07 — Valeria daltonismo
- **Edad:** 25–32 · **Dispositivo:** Legion Go + tema B2 Green CRT
- **Steam:** media-alta
- **Metas:** distinguir focus, estados launching/offline, favoritos
- **Restricciones:** deuteranopia; rojo/verde confusos; depende de forma/ícono, no color
- **Cita:** “El CRT verde bonito… pero ¿cuál está seleccionado?”

### P08 — Héctor one-handed
- **Edad:** 40–48 · **Dispositivo:** Legion Go, agarre con mano dominante
- **Steam:** media
- **Metas:** navegar carrusel y dock sin combos de dos manos
- **Restricciones:** uso una mano; D-pad + A factibles; L+R simultáneos no
- **Cita:** “No me pidas hold Select + Start.”

### P09 — Lucía power user SRM
- **Edad:** 27–35 · **Dispositivo:** Legion Go + SD 1TB; ES-DE + Steam ROM Manager
- **Steam:** expert (non-Steam, collections, launch options)
- **Metas:** biblioteca Steam-only con emulación vía shortcuts; export JSON para clonar setup
- **Restricciones:** odia que Orbit descubra ROMs fuera de Steam
- **Cita:** “Si tocas mis rutas de SRM, te borro.”

### P10 — Pablo Big Picture forever
- **Edad:** 33–40 · **Dispositivo:** PC salón + mando; casi nunca Desktop Steam
- **Steam:** alta en BPM
- **Metas:** dock Steam = BPM siempre; nunca ver chrome de escritorio
- **Restricciones:** modelo mental 100% BPM; confunde Desktop dock con Steam Desktop
- **Cita:** “Desktop no es Windows, ¿verdad?”

### P11 — Inés odia tutoriales
- **Edad:** 29–36 · **Dispositivo:** Ally / Legion Go
- **Steam:** alta
- **Metas:** Skip y jugar YA
- **Restricciones:** salta tutorial siempre; no lee tooltips
- **Cita:** “Skip. Skip. Skip.”

### P12 — Mateusz English-only traveler
- **Edad:** 24–30 · **Dispositivo:** Legion Go en viaje; Wi-Fi hotel flaky
- **Steam:** media
- **Metas:** offline cache / retry; UI en inglés
- **Restricciones:** offline frecuente; no habla español
- **Cita:** “Offline again. Where’s Retry?”

### P13 — Fernanda ES-first
- **Edad:** 19–24 · **Dispositivo:** laptop + mando 8BitDo
- **Steam:** baja-media
- **Metas:** UI/tutorial en español; Stremio para series
- **Restricciones:** inglés técnico la frena; confunde Desktop con escritorio Steam
- **Cita:** “¿Exportar config es lo mismo que guardar partida?”

### P14 — Omar misconfigurer serial
- **Edad:** 31–39 · **Dispositivo:** Legion Go; toca todo
- **Steam:** media (pero confiado en exceso)
- **Metas:** “optimizar” rutas, temas, JSON a mano
- **Restricciones:** rompe configs; importa JSON de Discord/foros
- **Cita:** “Copié el JSON de un random. Ahora no abre nada.”

### P15 — Nina impatient tapper
- **Edad:** 21–26 · **Dispositivo:** handheld; touch + botones
- **Steam:** media
- **Metas:** spam A durante launching; doble-tap posters
- **Restricciones:** cero tolerancia a latencia; asume freeze = crash
- **Cita:** “¿Por qué no pasa nada?” (mash mash)

### P16 — Ricardo Legion Go docked 1080p
- **Edad:** 34–42 · **Dispositivo:** Go dockeado a monitor 1080p / TV 4K
- **Steam:** alta
- **Metas:** layout docked vs handheld correcto; hit targets legibles desde el sofá
- **Restricciones:** distancia de sofá; UI densa ilegible
- **Cita:** “En la TV se ve como un teléfono.”

### P17 — Aisha kid + parent shared account
- **Edad:** 8–9 (usa) / papá configura
- **Dispositivo:** Go familiar
- **Steam:** family view / shared library
- **Metas:** no ver Grok / no exportar; solo juegos seguros
- **Restricciones:** parental; no debe llegar a settings peligrosos
- **Cita (papá):** “Que no pueda importar JSON ni abrir carpetas.”

### P18 — Tomás hate-reading / video-first
- **Edad:** 26–33 · **Dispositivo:** Deck refugee en Go
- **Steam:** media
- **Metas:** aprender por gesto, no por texto
- **Restricciones:** no lee párrafos; solo iconografía y feedback inmediato
- **Cita:** “Si hay más de dos líneas, skip.”

### P19 — Greta color-theme maximalist
- **Edad:** 23–29 · **Dispositivo:** Go; cambia tema mid-session
- **Steam:** media
- **Metas:** probar B2 → A-Prime → C mientras lanza un juego
- **Restricciones:** cambia tema en launching; busca contraste extremo
- **Cita:** “Nordic se ve cool… ¿y ahora el focus?”

### P20 — Carlos “esperaba Desktop Steam”
- **Edad:** 38–46 · **Dispositivo:** mini-PC salón + Orbit como menú bonito
- **Steam:** alta en cliente Desktop (amigos, overlays; BPM rara vez)
- **Metas:** abrir Steam Desktop desde el dock, gestionar workshop, chat
- **Restricciones:** modelo mental Desktop-first; BPM le parece modo consola
- **Cita:** “¿Por qué me abrió Big Picture? Quiero mis amigos y el overlay.”

---

## Attack script por persona (primera sesión)

Acciones concretas, feas y realistas. 3–5 por persona.

### P01 Sofía
1. Ignora el texto de Welcome; pulsa A en el fondo vacío.
2. Busca “Instalar juegos” — no existe; intenta el dock Grok como tienda.
3. Selecciona un poster mock y espera instalación (no launch).
4. Pulsa B en home pensando que es “atrás de Steam”, no Desktop/exit.
5. Desconecta el HDMI mid-tutorial (ventana reflow).

### P02 Diego Deck refugee
1. Skip tutorial al instante.
2. Abre dock Steam; si no es BPM en <2s, spam A otra vez (doble BPM).
3. Lanza juego desde carrusel y vuelve con Alt+Tab esperando Orbit encima de Steam.
4. Busca Quick Access / radial como en Deck — no existe; declara UI incompleta.
5. Cambia a tema A-Prime y critica falta de “game mode” OS.

### P03 Mariana
1. Conecta mando a mitad de tutorial; focus keyboard queda huérfano.
2. Intenta abrir juego con Enter (laptop) mientras footer dice A.
3. Sale a Desktop accidentalmente con B; no sabe relanzar Orbit.
4. Cierra la tapa del laptop (sleep) durante “launching…”.

### P04 Leo
1. Mash A/B/X/Y durante splash y tutorial.
2. Doble-abre Stremio + ES-DE antes de que minimice Orbit.
3. Arrastra posters con el stick como si fueran tiles táctiles.
4. Importa un .json renombrado de un .txt de tarea escolar (basura).
5. Quita el SD card porque “aquí van los juegos”.

### P05 Carmen
1. Usa solo mouse; intenta clic en glifos decorativos del CRT.
2. No distingue focus en B2; hace clic en poster adyacente.
3. Abre Stremio y no encuentra “atrás” a Orbit (app externa).
4. Pide letra más grande; escala OS al 200% y rompe layout.

### P06 Andrés mouse-only
1. Busca botón “Salir” con cursor; B/Esc no descubierto.
2. Hover-scroll del carrusel sin focus ring visible.
3. Clic derecho espera menú contextual Steam — no hay.
4. Redimensiona ventana a 800x500; dock se solapa con posters.
5. Espera atajos Ctrl+W / Alt+F4 mapeados en footer.

### P07 Valeria
1. Activa B2 Green; no ve focus vs idle.
2. Confunde estado Offline (rojo/ámbar) con Launching.
3. Marca favoritos si el indicador es solo color, no forma.
4. Cambia a C Nordic buscando más contraste; pierde landmarks.

### P08 Héctor
1. Navega solo con stick derecho (si no mapeado, dead end).
2. Intenta chord Select+X para screenshot (hábito consola).
3. No puede alcanzar Settings si requiere trigger + face button.
4. Suelta el mando; Orbit no pausa input ghost del stick drift.

### P09 Lucía
1. Apunta rutas ES-DE / ROMs a carpetas reales; espera scan fuera de Steam.
2. Exporta JSON, lo edita, reimporta con paths Unix en Windows.
3. Lanza non-Steam shortcut mal formado; observa error críptico.
4. Verifica que Orbit no ofrezca piratería de ROMs (opt-in SRM only).
5. Clona config a otra máquina sin Steam en la misma ruta → empty state.

### P10 Pablo
1. Dock Steam → exige BPM; si abre Desktop Steam, rage-quit.
2. Confunde botón Desktop (salir a Windows) con “Steam Desktop Mode”.
3. Desde BPM usa Guide para “volver a Orbit” — no vuelve.
4. Tiene BPM ya abierto; Orbit lanza segunda instancia / focus raro.

### P11 Inés
1. Skip en paso 1; no sabe que A abre y B es back/Desktop.
2. En empty library asume bug; reinstala Orbit.
3. Desactiva tutorial forever vía config; no hay “show tips again” descubrible.
4. Spam Esc en overlays; espera stack pop profundo (max 1 overlay).

### P12 Mateusz
1. Modo avión; carga; Offline sin Retry evidente en inglés.
2. Retry spam genera cola de fetches.
3. Cache stale: lanza gameid viejo → Steam error.
4. Cambia Wi-Fi mid-launch; UI queda en Launching infinito.

### P13 Fernanda
1. Busca idioma ES; si UI solo EN, abandona tutorial.
2. Interpreta “Desktop” como escritorio de Steam.
3. Abre Grok pensando que es soporte en español.
4. Exporta config creyendo que es backup de saves.

### P14 Omar
1. Importa JSON truncado / trailing comma / encoding UTF-16.
2. Pega paths de otro usuario (C:\Users\Other\...).
3. Cambia theme key a valor inventado "D-Cyber".
4. Borra firstRunComplete a mano para loop de tutorial.
5. Duplica claves dock; reordena iconos fuera de schema.

### P15 Nina
1. A-A-A en poster durante Launching → múltiples steam://rungameid.
2. Cambia tema mid-launch.
3. Unplug SD mientras lee posters desde SD.
4. Force-close Orbit; relanza; espera resume del juego (no).

### P16 Ricardo
1. Dock 1080p: posters enormes, dock tiny o viceversa.
2. Overscan TV corta footer con glifos A/B.
3. Cambia 60↔120 Hz; anima jank en carrusel.
4. Usa mando + mouse a la vez (focus fight).

### P17 Aisha + parent
1. Niño abre Settings / Import; rompe paths.
2. Abre Grok (URL) sin supervisión.
3. Open SD/ROMs folder → File Explorer con todo el disco.
4. Papá busca kiosk / kids mode — no existe.

### P18 Tomás
1. Skip tutorial; prueba todos los iconos del dock en orden.
2. No lee empty state; reinicia PC.
3. Espera onboarding visual (flechas animadas); no las hay → perdido.
4. Abre ES-DE sin saber qué es; pánico.

### P19 Greta
1. Theme swap B2→A-Prime→C en <10s.
2. Theme swap mientras overlay Settings abierto.
3. Theme swap con Launching spinner — tokens a medias.
4. Exporta config con theme C; importa en otra build sin token C.

### P20 Carlos
1. Dock Steam; furioso al ver BPM.
2. Busca “Open Desktop Steam” en Settings — no hay.
3. Lanza juego desde Orbit; usa Shift+Tab overlay; al salir no vuelve a Orbit.
4. Quiere chat/amigos en chrome Desktop; declara producto wrong audience.
5. Minimiza Orbit manualmente y usa Steam Desktop; Orbit queda zombie al volver.

---

## Evaluación heurística (Nielsen) vs producto diseñado

Referencias de diseño: temas B2 / A-Prime / C, library Steam-only, dock Steam=BPM, ES-DE / Stremio / Grok / Desktop, tutorial first-run, input adaptativo A/B vs Click/Esc.

| ID | Heurística | Hallazgo predicho | Sev. |
|----|------------|-------------------|------|
| H1 | Visibilidad del estado | Launching sin timeout ni cancel; doble-A cola launches | Alta |
| H2 | Match mundo real | Desktop = salir a Windows, pero usuarios Steam leen Steam Desktop | Alta |
| H2 | Match mundo real | Library Steam-only vs expectativa multi-store / carpetas ROM | Alta |
| H3 | Control y libertad | Skip tutorial sin tips later; B en home = Desktop (destructivo vs atrás) | Alta |
| H3 | Control y libertad | Max 1 overlay: Esc spam no explica por qué no hay atrás de atrás | Media |
| H4 | Consistencia y estándares | Footer fijo A/B en mouse-only viola estándar desktop | Crítica |
| H4 | Consistencia | Dock Steam→BPM pero carrusel→juego directo: dos modelos abrir Steam | Media |
| H5 | Prevención de errores | Import JSON sin schema validate / dry-run | Crítica |
| H5 | Prevención | Unplug SD / path missing sin degradación graceful | Alta |
| H6 | Reconocer vs recordar | Tras skip tutorial, cero affordances persistentes de A/B/Click | Alta |
| H7 | Flexibilidad | Power users (SRM) OK; kids/parents sin restricciones | Media |
| H8 | Diseño estético/mínimo | A-Prime puede esconder focus; B2 CRT puede esconder contraste (CVD) | Alta |
| H9 | Recuperar errores | Empty/Offline OK en spec; falta copy Steam no instalado / BPM ya abierto | Alta |
| H10 | Ayuda | Tutorial ≤4 pasos bien; no help center; Grok como ayuda es ambiguo | Media |

### Temas (B2 / A-Prime / C)
- **B2 Green CRT:** riesgo CVD + scanlines que reducen contraste de focus ring.
- **A-Prime:** ultra-minimal → landmarks débiles; usuarios skip-tutorial se pierden.
- **C Nordic:** mejor chance de contraste; asegurar que tokens de error/offline no dependan solo de rojo.

### Steam-only + BPM
- Comunicar en empty state y paso 3 del tutorial: la biblioteca es Steam (incl. non-Steam shortcuts).
- Dock Steam siempre BPM; ofrecer en Settings “También abrir Steam Desktop” para P20.

### Dock ES-DE / Stremio / Grok / Desktop
- Labels + primer uso: qué hace cada uno (sobre todo Grok URL y Desktop=exit).
- Confirmación suave la primera vez que B/Desktop sale a Windows.

### Tutorial
- Skippable OK; guardar tutorialSkipped y mostrar cheat sheet de 1 línea en footer las primeras N sesiones.
- Paso 2 debe mutar glifos según input detectado (mando vs mouse).

---

## Input modality — glifos del footer (crítico)

**Regla de producto:** el footer debe intercambiar:

| Modalidad | Affirmative | Back / dismiss |
|-----------|-------------|----------------|
| Mando / handheld | **A** | **B** |
| Mouse / teclado | **Click** (o Enter) | **Esc** |

### Failure modes si NO adaptan
1. Mouse-only ve A/B → no descubre Click/Esc; abandono o Alt+F4 (P06, P05).
2. Mando ve Click/Esc → busca mouse en handheld; mash aleatorio (P04, P01).
3. Hot-plug: conecta mando a mitad de sesión y glifos no cambian → desinformación activa.
4. Footer overscan / tema oculta glifos → misma clase de fallo que no adaptan.
5. B en home = Desktop sin copy adaptado (Esc: salir a Windows) → salidas accidentales (P03, P10).
6. Prompts del tutorial hardcodeados a A/B aunque el detector ya cambió a mouse.

**Fix recomendado:** un solo InputGlyphProvider (gamepad connected / last-input-device) + suscripción; tutorial, footer, dialogs y empty states consumen el mismo provider. Nunca strings hardcodeados Press A.

## Mischief QA checklist (20 casos)

Usar en build runnable (Vite dev o Tauri). Marcar pass/fail.

1. [ ] Skip tutorial en 1s; launch juego mock sin leer.
2. [ ] Pulsar A muchas veces en poster durante Launching.
3. [ ] Pulsar B/Esc repetido en home.
4. [ ] Importar JSON invalido (vacio, array, string, UTF-16).
5. [ ] Importar JSON con paths inexistentes y theme inventado.
6. [ ] Desconectar SD o borrar carpeta ROMs mid-session.
7. [ ] Steam no instalado: empty + CTA, no crash.
8. [ ] Big Picture ya abierto: dock no duplica ventanas.
9. [ ] Abrir ES-DE, Stremio y Grok en rapida sucesion.
10. [ ] Cambiar tema B2/A-Prime/C durante Launching y Settings.
11. [ ] Redimensionar a 640x480 y a 3840x2160.
12. [ ] Escala OS 150% y 200%.
13. [ ] Solo mouse: footer muestra Click/Esc; salir sin mando.
14. [ ] Hot-plug gamepad: glifos cambian en menos de 1s.
15. [ ] Simular daltonismo: focus visible en B2.
16. [ ] Offline/airplane: Retry + cache; no spinner eterno.
17. [ ] Abrir dos instancias de Orbit.
18. [ ] Open SD/ROMs con path roto o permiso denegado.
19. [ ] Teclado: Tab focus; Enter affirmative; Esc back.
20. [ ] Tras Desktop exit, relanzar: first-run no reaparece; config intacta.

---

## Severidad + backlog priorizado

Escala: S0 bloqueante / datos rotos; S1 alto abandono; S2 friccion seria; S3 polish.

| ID | Sev | Issue | Fix |
|----|-----|-------|-----|
| U-01 | S0 | Import JSON sin validacion deja config zombie | Schema + dry-run + rollback |
| U-02 | S0 | Paths Steam/ES-DE/SD missing crash o blank | Probe al boot; empty CTA Reubicar |
| U-03 | S1 | Footer/tutorial no adaptan A/B vs Click/Esc | InputGlyphProvider + hot-plug |
| U-04 | S1 | Label Desktop ambiguo | Copy Salir a Windows; confirm 1a vez |
| U-05 | S1 | Launching sin debounce/cancel | Lock input 1.5s + Cancel + timeout |
| U-06 | S1 | Skip tutorial sin red de seguridad | Footer cheat-sheet; Ver tutorial en Settings |
| U-07 | S1 | BPM vs Desktop Steam | Setting Steam dock BPM o Desktop |
| U-08 | S1 | Contraste focus B2 / CVD | Focus ring forma+grosor |
| U-09 | S2 | Empty Steam copy debil | Ilustracion + Abrir Steam + help |
| U-10 | S2 | BPM already open | Focus existing; toast |
| U-11 | S2 | TV overscan come footer | Safe margins; UI scale |
| U-12 | S2 | Dock icons sin first-use explain | One-shot coach marks |
| U-13 | S2 | Kids / shared device | Pin Settings; hide Import/Grok |
| U-14 | S3 | Theme swap mid-launch | Disable swap while launching |
| U-15 | S3 | i18n ES/EN incompleto | Strings criticos ES/EN dia 1 |
| U-16 | S3 | Hit targets under 48px handheld | Auditoria dock 48px min |

### Orden de implementacion sugerido
1. U-01, U-02 (integridad)
2. U-03, U-05, U-04 (input + no traps)
3. U-06, U-07, U-08 (primera sesion + inclusion)
4. U-09 a U-13 (edge cases)
5. U-14 a U-16 (polish)

---

## Notas para agentes de prueba
- Validar contra BUILD_PROMPT, FIRST_RUN_TUTORIAL y UI en dev server.
- Ejecutar el runbook de personas de forma mecanica.
- SRM path es opt-in; solo atajos Steam; sin ROMs ilegales.
- Reportar hallazgos en ISSUES-UX.md con ID U-xx, sev, repro, fix.

*Documento de investigacion aplicada — Orbit Shell — 2026-09-07*
