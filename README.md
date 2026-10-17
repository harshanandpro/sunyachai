# Bridge the Gap

Different perspectives. One bridge.

A multiplayer pixel-art social debate game. Players with opposing views discuss
topics and cooperate to build a bridge between two islands.

Built with **React + Vite** (frontend), **Phaser** (2D game world),
**Node.js + Express + Socket.IO** (backend / real-time multiplayer).

## Requirements

- Node.js 20+ (tested on v24)
- npm 11+

## Setup

```bash
npm install
```

## Run

Terminal 1 — backend (http://localhost:3001):

```bash
npm run server
```

Health check: `curl http://localhost:3001/health`

Terminal 2 — frontend (http://localhost:5173):

```bash
npm run dev
```

Open http://localhost:5173, enter a name, and press **ENTER WORLD**.

## Scripts

| Command         | What it does                     |
| --------------- | -------------------------------- |
| `npm run dev`   | Start Vite frontend with HMR     |
| `npm run server`| Start Express + Socket.IO server |
| `npm run build` | Production build into `dist/`    |
| `npm run lint`  | Run oxlint                       |

## Project structure

```
server/            Express + Socket.IO backend (health endpoint, realtime hub)
src/
  pages/           React pages (landing page)
  components/      Reusable React components (pixel-art scene)
  phaser/          Phaser game init + scenes
  net/             Socket.IO client
  App.css, index.css
public/            Static assets
```

## Configuration

The server URL for the Socket.IO client defaults to `http://localhost:3001`
and can be overridden with the `VITE_SERVER_URL` environment variable.
No secrets are committed; put environment files in `.env*` (gitignored).

## Roadmap (not built yet)

Multiplayer lobby, movement, matchmaking, debate mechanics, bridge building,
profiles, database/auth — added incrementally in later steps.