import http from 'node:http'
import express from 'express'
import { Server } from 'socket.io'

const PORT = Number(process.env.PORT) || 3001

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*' },
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: 'bridge-the-gap', uptime: process.uptime() })
})

io.on('connection', (socket) => {
  console.log(`connected: ${socket.id}`)
  socket.on('disconnect', () => console.log(`disconnected: ${socket.id}`))
})

server.listen(PORT, () => {
  console.log(`Bridge the Gap server listening on http://localhost:${PORT}`)
})