import { useEffect, useRef, useState } from 'react'
import { createLobbyGame } from '../phaser/game.js'

export default function LobbyPage({ socket, username, players, serverError, queued, onPlay, onLeave }) {
  const canvasHostRef = useRef(null)
  const [game, setGame] = useState(null)

  useEffect(() => {
    const g = createLobbyGame(canvasHostRef.current, socket, socket.id)
    setGame(g)
    return () => {
      g.scene.getScene('Lobby')?.dispose?.()
      g.destroy(true)
    }
  }, [socket])

  return (
    <div className="landing">
      <header className="topbar">
        <span className="logo-dot" aria-hidden="true" />
        <span className="logo-text">BRIDGE THE GAP</span>
      </header>

      <main className="lobby">
        <div className="lobby-head">
          <h1 className="lobby-title">LOBBY</h1>
          <p className="lobby-sub">
            Welcome, <span className="lobby-you">{username}</span>. Walk around — WASD / arrows.
          </p>
          {serverError && <p className="form-msg error">{serverError}</p>}
        </div>

        <div className="lobby-layout">
          <div className="plaza" ref={canvasHostRef} />

          <aside className="lobby-panel">
            <h2 className="lobby-count">
              PLAYERS <span className="lobby-badge">{players.length}</span>
            </h2>
            <ul className="lobby-list">
              {players.map((player) => (
                <li key={player.id} className={player.name === username ? 'is-you' : ''}>
                  <span className="lobby-pip" aria-hidden="true" />
                  {player.name}
                  {player.name === username && <span className="you-tag">YOU</span>}
                </li>
              ))}
            </ul>
            <p className="lobby-wait">{queued ? 'Finding an opponent…' : 'Click Play Game to get paired.'}</p>
            <div className="lobby-actions">
              <button className="enter-btn" type="button" onClick={onPlay} disabled={queued}>
                {queued ? 'QUEUED…' : 'PLAY GAME'}
              </button>
              <button className="leave-btn" type="button" onClick={onLeave}>
                LEAVE
              </button>
            </div>
          </aside>
        </div>
        {game === null && <p className="lobby-wait">Loading plaza…</p>}
      </main>

      <footer className="footer">A cozy pixel debate game · hackathon build</footer>
    </div>
  )
}