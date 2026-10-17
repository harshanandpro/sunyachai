# Changelog

All notable changes to Bridge the Gap. Newest phase at the top.

## Phase 4 — Debate loop + Arena integration (2026-10-17, demo day)

### Implemented & tested
- Matchmaking: `game:queue` pairs two waiting players into a match with a
  random preset motion; roles assigned (speaker/responder).
- Turn loop (server-authoritative): `game:argument` (string, 2–600 chars,
  speaker-only) → `game:decision {agree}` (responder-only); agree → +1 plank,
  disagree → unchanged; roles swap either way; 10 planks → `phase: won`.
- `game:leave` + disconnect → `phase: abandoned` for the opponent.
- Game screen with argue/decide UI, planks 0/10, win and abandoned screens.
- PLAY GAME button in lobby with queued state.
- **Bug fixed (root cause):** leaked Phaser scene socket handlers threw inside
  socket.io's packet loop and ate batched `game:state` packets (frozen UI).
  Fix: explicit `dispose()` flag, called from LobbyPage cleanup +
  SHUTDOWN/DESTROY; handlers never call Phaser APIs. Console clean.
- **Agent B arena integrated:** `GameArena.jsx` + `.GameArena.css` copied from
  `/home/harsh/Websites/bridge-arena-ui` (commits 325c9e5, 40d7a98);
  `GamePage.jsx` is a thin wrapper. Socket contract verified against server:
  `game:argument` string, `game:decision {agree}`, `game:leave`.

### Files
- Created: `src/pages/GamePage.jsx`, `server/match.test.mjs`,
  `src/components/GameArena.jsx` + `.css` (copied from Agent B)
- Modified: `server/index.js`, `src/App.jsx`, `src/App.css`,
  `src/pages/LobbyPage.jsx`, `src/phaser/scenes/LobbyScene.js`

### Tests run
- `node server/match.test.mjs` → ALL PASS (12 assertions: pairing, argument,
  decide, disagree-keeps-0, role swap, 10-plank win on both clients)
- Two-tab browser test (Alice/Bob): lobby → queue → match with same motion →
  argument both directions → AGREE syncs 1/10 on both tabs + transcript →
  role swap; DISAGREE keeps 0; abandon screen on disconnect — all passed
- `npm run lint` 0 errors, `npm run build` ✓ (after final integration)

### Known limitations
- No reconnect/rejoin: server restart mid-match breaks active matches
  (in-memory, socket-id identity). Don't restart the server during a demo.
- Win screen not re-verified in a real browser after arena integration
  (server-side win proven by automated test; arena reads the same contract).
- No debate timers yet; lobby 20-player cap not enforced; avatar plaza
  movement not re-verified visually after the dispose fix.

## Phase 3 — Lobby plaza with movement (IN PROGRESS — 2026-10-17)

Status: server side done and tested; client side renders the plaza but has a
KNOWN BUG (avatars do not appear — see below). Not a finished feature.

### Implemented (verified vs not)
- Server: spawn positions assigned on join (random within plaza bounds) —
  scripted test passed (spawn within bounds).
- Server: `lobby:move` relay — validated (numbers only, non-finite rejected),
  clamped to plaza bounds, broadcast to others, no self-echo — all four
  scripted assertions passed.
- Server: `lobby:requestPlayers` — scene can ask for the roster on mount to
  avoid the join-broadcast race.
- Client: `LobbyScene` (Phaser 3) — checkered plaza floor, fountain, corner
  lamps, WASD/arrow movement at 180 px/s, client-side clamping, ~15 Hz
  throttled position sends, depth-sorted avatars with name labels.
- Client: Phaser canvas mounted in the lobby page next to the player list
  (responsive 16:9, FIT scale).
- Removed `src/phaser/scenes/BootScene.js` placeholder.

### Known bugs (unfixed)
- Avatars do not render in the plaza. `makeAvatar` crashes with
  `TypeError: Cannot read properties of null (reading 'add')` inside
  Phaser's container factory when a `lobby:players`/`lobby:requestPlayers`
  response arrives for a scene that was already torn down (React StrictMode
  double-mounts the mount effect in dev, and lobby leave/rejoin destroys the
  game while socket listeners can still fire). Fix direction: guard scene
  handlers with a teardown flag + listen to the scene DESTROY event, not only
  SHUTDOWN.
- Consequence: client movement and avatar sync are NOT verified end-to-end.

### Dependency note (correction to Phase 1)
- Phase 1 recorded `phaser@3.90.0` as installed, but node_modules actually
  contained Phaser 4.2.1 (stale from the very first install; `npm ls` had
  been satisfied against the lockfile). Reinstalled and verified on disk:
  `phaser/package.json` = 3.90.0, Vite dep cache cleared, browser console
  confirms "Phaser v3.90.0". The earlier BootScene placeholder had never
  executed, so nothing was verified against Phaser 4 before this.

### Files created/modified
- Created: `src/phaser/scenes/LobbyScene.js`
- Modified: `server/index.js`, `src/pages/LobbyPage.jsx`, `src/App.jsx`,
  `src/App.css`, `src/phaser/game.js`
- Deleted: `src/phaser/scenes/BootScene.js`

### Tests run
- Scripted socket test (spawn bounds, relay, clamping, invalid rejection,
  no self-echo) — all passed against the running server
- `npm run lint` — passed (0 warnings after switching socket ref → state)
- `npm run build` — passed
- Browser: plaza renders in two tabs, player list live-updates — passed;
  avatar rendering — FAILED (see known bugs)

### Remaining tasks
- Fix avatar teardown crash, then verify two-tab movement sync end-to-end.

## Phase 2 — Multiplayer lobby (2026-10-17)

### Implemented
- Socket.IO lobby: "ENTER WORLD" now connects to the server, sends
  `lobby:join` with the validated name, and switches to the lobby page.
- Server tracks players (socket.id → username, input validated server-side,
  2–16 chars) and broadcasts the full player list on every join/disconnect.
- Lobby page: live player count, player list with "YOU" badge, LEAVE button
  that disconnects and returns to the landing page.
- Connection-failure message if the backend is unreachable.

### Files created
- `src/pages/LobbyPage.jsx` — lobby UI

### Files modified
- `server/index.js` — lobby join/disconnect handlers + player list broadcast
- `src/App.jsx` — phase state (landing ↔ lobby), socket lifecycle
- `src/pages/LandingPage.jsx` — hands valid username to App via `onEnter`
- `src/App.css` — lobby styles

### Dependencies
- None added or removed.

### Tests run
- Scripted 2-client socket test (Alice/Bob): joins broadcast to both,
  short-name join rejected, disconnect updates remaining client — passed
- Browser test with two tabs: both join and see each other live; LEAVE from
  one tab removes them from the other tab's list; rejoin works — passed
- `npm run lint` — passed; `npm run build` — passed
- Console clean in both tabs

### Bugs found & fixed during testing
- `App.jsx` initially never emitted `lobby:join` (empty player list) — added emit.
- Phase-2 rewrite of `App.jsx` dropped the `import './App.css'` line, leaving
  the whole UI unstyled — restored import, verified styled in browser.

### Remaining tasks
- See `TODO.md`.

## Phase 1 — Project foundation + landing page (2026-10-17)

### Implemented
- Reused existing Vite + React 19 (JS) project; renamed package to `bridge-the-gap`.
- Project structure: backend server, React pages/components, Phaser game folder,
  Socket.IO client folder.
- Express + Socket.IO backend with `GET /health` endpoint (port 3001).
- Landing page: title, tagline, username input with validation (2–16 chars),
  "ENTER WORLD" button (validates + sets ready state only), game explanation,
  responsive pixel-art design (dark navy, cyan/warm accents, Press Start 2P).
- Pixel-art SVG scene: two islands, water, bridge, two players meeting mid-bridge.
- Phaser bootstrap + placeholder "Boot" scene (not mounted in UI yet).

### Files created
- `server/index.js` — Express + Socket.IO server, health endpoint
- `src/pages/LandingPage.jsx` — landing page
- `src/components/PixelIslands.jsx` — pixel-art SVG scene
- `src/phaser/game.js`, `src/phaser/scenes/BootScene.js` — game scaffold
- `src/net/socket.js` — Socket.IO client factory (unused until next phase)

### Files modified
- `src/App.jsx`, `src/App.css`, `src/index.css`, `index.html`,
  `package.json`, `package-lock.json`, `README.md`, `.gitignore`
- Deleted unreferenced template assets: `src/assets/*`, `public/icons.svg`

### Dependencies added
- `phaser@3.90.0` (pinned to 3.x; npm default resolved to 4.x)
- `express@5.3.0`, `socket.io@4.8.4`, `socket.io-client@4.8.4`

### Tests run
- `npm run lint` — passed (0 warnings, 0 errors)
- `npm run build` — passed
- `curl http://localhost:3001/health` — HTTP 200, `{"status":"ok",...}`
- Browser-tested landing page: renders on desktop + narrow viewport, console
  clean; username validation verified (short name → error, valid name → ready)

### Known bugs / notes
- Pixel font loads from Google Fonts; offline it falls back to monospace.
- Phaser scene and socket client are scaffolded but not wired into the UI yet
  (intentional — lobby is the next phase). The BootScene has not been executed
  in a browser, only authored.

### Remaining tasks
- See `TODO.md`.