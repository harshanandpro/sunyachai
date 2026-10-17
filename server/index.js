import http from 'node:http'
import express from 'express'
import { Server } from 'socket.io'

const PORT = Number(process.env.PORT) || 3001

// plaza bounds (must match the Phaser scene)
const BOUNDS = { left: 60, right: 900, top: 80, bottom: 470 }

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*' },
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: 'bridge-the-gap', uptime: process.uptime() })
})

// socket.id -> { name, x, y }
const players = new Map()

function spawnPoint() {
  return {
    x: BOUNDS.left + Math.floor(Math.random() * (BOUNDS.right - BOUNDS.left)),
    y: BOUNDS.top + Math.floor(Math.random() * (BOUNDS.bottom - BOUNDS.top)),
  }
}

function broadcastPlayers() {
  io.emit(
    'lobby:players',
    [...players].map(([id, p]) => ({ id, name: p.name, x: p.x, y: p.y })),
  )
}

// ---- debate matches ----
const MOTIONS = [
  'Cities should ban private cars from downtown',
  'Schools should start at 9 am',
  'Social media does more harm than good',
  'Remote work is better than office work',
  'Tipping should be abolished',
  'Homework should be abolished for primary school',
  'Space exploration funding should increase',
  'Fast fashion should be banned',
  'Voting should be compulsory',
  'Pineapple belongs on pizza',
]

let nextMatchId = 1
const matches = new Map() // id -> match
const queue = [] // socket ids waiting for a pair

function nameOf(id) {
  return players.get(id)?.name ?? '????'
}

function matchOf(id) {
  for (const m of matches.values()) {
    if ((m.a === id || m.b === id) && (m.phase === 'argue' || m.phase === 'decide')) return m
  }
  return null
}

function broadcastState(m) {
  for (const id of [m.a, m.b]) {
    const sock = io.sockets.sockets.get(id)
    if (!sock) continue
    const partnerId = id === m.a ? m.b : m.a
    sock.emit('game:state', {
      matchId: m.id,
      motion: m.motion,
      planks: m.planks,
      phase: m.phase, // argue | decide | won | abandoned
      argument: m.argument,
      speakerId: m.speaker,
      responderId: m.responder,
      you: { id, name: nameOf(id) },
      partner: { id: partnerId, name: nameOf(partnerId) },
    })
  }
}

io.on('connection', (socket) => {
  console.log(`connected: ${socket.id}`)

  socket.on('lobby:join', (name) => {
    // validate client input at the boundary
    const clean = typeof name === 'string' ? name.trim().slice(0, 16) : ''
    if (clean.length < 2) return
    players.set(socket.id, { name: clean, ...spawnPoint() })
    console.log(`${clean} joined (${players.size} in lobby)`)
    broadcastPlayers()
  })

  // scene may mount after the broadcast that included this player
  socket.on('lobby:requestPlayers', () => {
    socket.emit(
      'lobby:players',
      [...players].map(([id, p]) => ({ id, name: p.name, x: p.x, y: p.y })),
    )
  })

  socket.on('lobby:move', (pos) => {
    const p = players.get(socket.id)
    if (!p || typeof pos !== 'object' || pos === null) return
    const x = Number(pos.x)
    const y = Number(pos.y)
    if (!Number.isFinite(x) || !Number.isFinite(y)) return
    p.x = Math.round(Math.min(BOUNDS.right, Math.max(BOUNDS.left, x)))
    p.y = Math.round(Math.min(BOUNDS.bottom, Math.max(BOUNDS.top, y)))
    socket.broadcast.emit('lobby:move', { id: socket.id, x: p.x, y: p.y })
  })

  socket.on('game:queue', () => {
    if (!players.has(socket.id) || matchOf(socket.id)) return
    if (queue.includes(socket.id)) return
    queue.push(socket.id)
    if (queue.length >= 2) {
      const a = queue.shift()
      const b = queue.shift()
      const m = {
        id: nextMatchId++,
        a,
        b,
        motion: MOTIONS[Math.floor(Math.random() * MOTIONS.length)],
        planks: 0,
        phase: 'argue',
        argument: null,
        speaker: a,
        responder: b,
      }
      matches.set(m.id, m)
      console.log(`match ${m.id}: ${nameOf(a)} vs ${nameOf(b)}`)
      broadcastState(m)
    }
  })

  socket.on('game:argument', (payload) => {
    const m = matchOf(socket.id)
    if (!m || m.phase !== 'argue' || m.speaker !== socket.id) return
    const clean = typeof payload === 'string' ? payload.trim().slice(0, 600) : ''
    if (clean.length < 2) return
    m.argument = clean
    m.phase = 'decide'
    broadcastState(m)
  })

  socket.on('game:decision', (payload) => {
    const m = matchOf(socket.id)
    if (!m || m.phase !== 'decide' || m.responder !== socket.id) return
    if (payload?.agree === true) m.planks += 1
    // roles swap either way: the responder now argues (counter on disagree)
    const prev = m.speaker
    m.speaker = m.responder
    m.responder = prev
    m.argument = null
    m.phase = m.planks >= 10 ? 'won' : 'argue'
    broadcastState(m)
  })

  socket.on('game:leave', () => {
    const m = matchOf(socket.id)
    if (m) {
      m.phase = 'abandoned'
      broadcastState(m)
    }
  })

  socket.on('disconnect', () => {
    const qi = queue.indexOf(socket.id)
    if (qi >= 0) queue.splice(qi, 1)
    const active = matchOf(socket.id)
    if (active) {
      active.phase = 'abandoned'
      broadcastState(active)
    }
    players.delete(socket.id)
    console.log(`disconnected: ${socket.id} (${players.size} in lobby)`)
    broadcastPlayers()
  })
})

server.listen(PORT, () => {
  console.log(`Bridge the Gap server listening on http://localhost:${PORT}`)
})