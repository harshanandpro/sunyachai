import { memo, useEffect, useRef } from 'react'
import { createLobbyGame } from '../phaser/game.js'
import './LobbyPage.css'

// Memoised so toggling "queued" (or any parent re-render with the same
// players) doesn't rebuild the whole list.
const PlayerList = memo(function PlayerList({ players, username }) {
  return (
    <ul className="lobby-list" aria-label="Players in the lobby">
      {players.map((player) => {
        const isYou = player.name === username
        return (
          <li key={player.id} className={isYou ? 'is-you' : undefined}>
            <span className="lobby-pip" aria-hidden="true" />
            {player.name}
            {isYou && <span className="you-tag">YOU</span>}
          </li>
        )
      })}
    </ul>
  )
})

export default function LobbyPage({ socket, username, players, serverError, queued, onPlay, onLeave }) {
  const canvasHostRef = useRef(null)

  useEffect(() => {
    const host = canvasHostRef.current
    if (!host) return undefined
    const g = createLobbyGame(host, socket, socket.id)
    return () => {
      g.scene.getScene('Lobby')?.dispose?.()
      g.destroy(true)
    }
  }, [socket])

  return (
    <div className="landing lobby-page">
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
          {serverError && (
            <p className="form-msg error" role="alert">
              {serverError}
            </p>
          )}
        </div>

        <div className="lobby-layout">
          {/* Empty until Phaser mounts its canvas; CSS shows "Loading plaza…" via :empty */}
          <div className="plaza" ref={canvasHostRef} />

          <aside className="lobby-panel">
            <h2 className="lobby-count">
              PLAYERS <span className="lobby-badge">{players.length}</span>
            </h2>
            <PlayerList players={players} username={username} />
            <p className={queued ? 'lobby-wait is-queued' : 'lobby-wait'} role="status" aria-live="polite">
              {queued ? 'Finding an opponent…' : 'Click Play Game to get paired.'}
            </p>
            <div className="lobby-actions">
              <button className="enter-btn" type="button" onClick={onPlay} disabled={queued} aria-busy={queued}>
                {queued ? 'QUEUED…' : 'PLAY GAME'}
              </button>
              <button className="leave-btn" type="button" onClick={onLeave}>
                LEAVE
              </button>
            </div>
          </aside>
        </div>
      </main>

      <footer className="footer">A cozy pixel debate game · hackathon build</footer>
    </div>
  )
}