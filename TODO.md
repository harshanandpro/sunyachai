# TODO — Bridge the Gap

Status legend: ✅ done & tested · 🚧 in progress · ⬜ not started

One-liner: A 2-player pixel game where a bridge only gets built when someone
says "fair point."

## Completed
- ✅ Project setup: Vite + React 19 (JS), Express + Socket.IO backend
- ✅ Landing page with pixel-art design and username validation (Phase 1)
- ✅ Backend health endpoint (`GET /health`) — tested, HTTP 200
- ✅ Multiplayer lobby: Socket.IO join/leave with live player list (Phase 2) — tested with two browser clients
- ✅ README, .gitignore, npm scripts (`dev`, `server`, `build`, `lint`)
- ✅ Lobby movement networking (server side): spawn positions, `lobby:move`
  relay with validation/clamping, `lobby:requestPlayers` — scripted tests passed
- ✅ Debate loop: matchmaking, argue/decide turns, agree/disagree plank rules,
  10-plank win, abandon handling (Phase 4) — scripted test ALL PASS + two-tab browser test
- ✅ GameArena (Agent B) integrated as the game screen — verified in browser

## MVP — build today (in order)

### Phase 3: Lobby plaza (🚧 most parts done)
- ✅ Plaza scene renders (floor, fountain, lamps, title) in the browser
- ✅ WASD/arrow movement + throttled position send (client code written)
- ✅ Avatar teardown crash fixed via `dispose()` guard — console clean;
  avatars visually re-verified only briefly (low priority)
- 🚧 Two-tab avatar movement sync — not re-verified end-to-end after fix
- ⬜ 20-player cap enforced server-side (currently no cap)

### Phase 4: Matchmaking
- ✅ Queue pairs two players into a match with random motion + side assignment
  (roles speaker/responder per round) — see Phase 4 changelog

### Phase 5: Phaser game scene
- ✅ Game screen with two islands, water and 10 bridge slots — Agent B's
  GameArena integrated; plank fill at 1/10 verified in browser
- 🚧 Plank-drop animation — not separately verified

### Phase 6: Turn engine (server-authoritative)
- ✅ Turn states: argue → decide (agree/disagree) → roles swap — browser-verified both directions
- ✅ Clients send only intent; rules run on the server (validated at boundary)
- ⬜ 2-minute writing timer and 15-second decision timer, enforced by the server

### Phase 7: Endings and limits
- ✅ Win: 10 planks → `phase: won` broadcast to both — automated test proven
- ✅ Abandoned-end handling (opponent disconnects/forfeits) — browser-verified
- ⬜ Lose: 10 non-agreements in a row, 40 turns used, or 3 timeouts in a row → bridge collapses
- ⬜ End-game summary of the points both sides agreed on

### Phase 8: Demo readiness
- ⬜ Short-timer mode so the collapse ending is demoable in ~40 s
- ⬜ Node built-in test runner coverage for turn engine + limits

### Optional (only if time remains)
- ⬜ Hash-linked chain of plank blocks (tamper-evident record of agreements)

## Future scope — do NOT claim in front of judges
- 🎙 Accessibility bridge: voice input and read-aloud (stretch phase)
- 🌐 Language bridge: write in your own language, read in theirs (AI translation API)
- 📖 "Explain simply" button for plain-language rewrites
- 🤖 AI mediator: on-topic/insult checks, foul-language moderation, neutral summary of remaining disagreement
- 🗳 Player-proposed motions with player-picked sides
- 🚶 Walkable Phaser lobby plaza with avatars
- 🏆 Profiles and "bridges built" leaderboard
- 🏫 Real-world uses: classrooms, workplace conflict training, community dialogues

## Notes
- Current scope: 2-player web debate game, text-only, preset motions,
  nothing saved between sessions. No database/auth in MVP.
- Tech: React + Vite · Phaser 3 · Node + Express + Socket.IO · Node built-in
  test runner. Rules and timers run on the server; clients only send intent.
- The socket lobby works but lives in one global room; matchmaking (Phase 4)
  moves pairs into private rooms.
- Phaser is pinned to 3.90.0 on disk (an earlier install accidentally left
  4.2.1 in node_modules; do not `npm update phaser`).
- Rule: an item moves to "Completed" only after it has actually been tested.
