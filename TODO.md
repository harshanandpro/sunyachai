# TODO — Bridge the Gap

Status legend: ✅ done & tested · 🚧 in progress · ⬜ not started

## Completed
- ✅ Project setup: Vite + React 19 (JS), Express + Socket.IO backend scaffold
- ✅ Landing page with pixel-art design and username validation (Phase 1)
- ✅ Backend health endpoint (`GET /health`) — tested, HTTP 200
- ✅ Pixel-art island/bridge SVG scene — tested in browser
- ✅ README, .gitignore, npm scripts (`dev`, `server`, `build`, `lint`)

## Pending (planned phases, in order)
- ⬜ Multiplayer lobby: connect via Socket.IO, see players join/leave
- ⬜ Mount Phaser game canvas into the React app
- ⬜ Player movement synced over Socket.IO
- ⬜ Matchmaking / pairing opposing players
- ⬜ Debate mechanics (topics, chat/turns)
- ⬜ Bridge-building gameplay driven by common ground
- ⬜ User profiles / saved opinions
- ⬜ Database + authentication

## Notes
- Socket client factory (`src/net/socket.js`) and Phaser scaffold
  (`src/phaser/`) exist but are unused until their phases land.
- Rule: a feature moves to "Completed" only after it has actually been tested.