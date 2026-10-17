import { io } from 'socket.io-client'

// Server address can be overridden without code changes.
const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001'

export function connectSocket() {
  return io(SERVER_URL)
}