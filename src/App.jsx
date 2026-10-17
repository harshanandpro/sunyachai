import { useState } from 'react'
import LandingPage from './pages/LandingPage.jsx'
import LobbyPage from './pages/LobbyPage.jsx'
import GamePage from './pages/GamePage.jsx'
import { connectSocket } from './net/socket.js'
import './App.css'

function App() {
  const [phase, setPhase] = useState('landing')
  const [username, setUsername] = useState('')
  const [players, setPlayers] = useState([])
  const [serverError, setServerError] = useState('')
  const [socket, setSocket] = useState(null)
  const [game, setGame] = useState(null)
  const [queued, setQueued] = useState(false)

  function enterWorld(name) {
    const s = connectSocket()
    s.on('connect', () => setServerError(''))
    s.on('connect_error', () =>
      setServerError('Cannot reach the game server. Is "npm run server" running?'),
    )
    s.on('lobby:players', setPlayers)
    s.on('game:state', (g) => {
      setGame(g)
      setQueued(false)
      setPhase('match')
    })
    s.emit('lobby:join', name)
    setSocket(s)
    setUsername(name)
    setPhase('lobby')
  }

  function leaveLobby() {
    socket?.disconnect()
    setSocket(null)
    setPlayers([])
    setGame(null)
    setQueued(false)
    setPhase('landing')
  }

  function playGame() {
    setQueued(true)
    socket?.emit('game:queue')
  }

  function leaveMatch() {
    socket?.emit('game:leave')
    setGame(null)
    setPhase('lobby')
  }

  if (phase === 'match' && game) {
    return <GamePage socket={socket} game={game} onLeave={leaveMatch} />
  }

  if (phase === 'lobby') {
    return (
      <LobbyPage
        socket={socket}
        username={username}
        players={players}
        serverError={serverError}
        queued={queued}
        onPlay={playGame}
        onLeave={leaveLobby}
      />
    )
  }
  return <LandingPage onEnter={enterWorld} />
}

export default App
