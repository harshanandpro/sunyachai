import { useState } from 'react'
import PixelIslands from '../components/PixelIslands.jsx'

const HOW_IT_WORKS = [
  { icon: '🗨', title: 'Meet', text: 'Get paired with a player who sees things differently.' },
  { icon: '⚖', title: 'Debate', text: 'Talk through a topic by making real points, not noise.' },
  { icon: '🌉', title: 'Build', text: 'Common ground becomes planks — plank by plank, you cross together.' },
]

export default function LandingPage() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [readyPlayer, setReadyPlayer] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const name = username.trim()
    if (name.length < 2) {
      setError('Name needs at least 2 characters.')
      setReadyPlayer('')
      return
    }
    if (name.length > 16) {
      setError('Keep it under 16 characters.')
      setReadyPlayer('')
      return
    }
    setError('')
    // Lobby comes in the next step; for now just prepare the player.
    setReadyPlayer(name)
  }

  return (
    <div className="landing">
      <header className="topbar">
        <span className="logo-dot" aria-hidden="true" />
        <span className="logo-text">BRIDGE THE GAP</span>
      </header>

      <main className="hero">
        <h1 className="title">
          Bridge<span className="title-accent"> the </span>Gap
        </h1>
        <p className="tagline">Different perspectives. One bridge.</p>

        <PixelIslands />

        <form className="enter-form" onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="username">
            YOUR NAME
          </label>
          <div className="field-row">
            <input
              id="username"
              className="name-input"
              type="text"
              placeholder="e.g. PixelPundit"
              value={username}
              maxLength={16}
              autoComplete="off"
              onChange={(e) => setUsername(e.target.value)}
            />
            <button className="enter-btn" type="submit">
              ENTER WORLD
            </button>
          </div>
          {error && <p className="form-msg error">{error}</p>}
          {readyPlayer && (
            <p className="form-msg ready">✔ {readyPlayer} is ready — the lobby opens next.</p>
          )}
        </form>

        <section className="how">
          <h2 className="how-title">HOW IT PLAYS</h2>
          <div className="how-grid">
            {HOW_IT_WORKS.map((item) => (
              <article className="how-card" key={item.title}>
                <span className="how-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">A cozy pixel debate game · hackathon build</footer>
    </div>
  )
}