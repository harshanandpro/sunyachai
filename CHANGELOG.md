# Changelog

All notable changes to Bridge the Gap. Newest phase at the top.

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