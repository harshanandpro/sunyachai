import { useState, useEffect, useRef } from 'react'
import './GameArena.css'

/**
 * GameArena Component
 *
 * Standalone & Socket-ready visual arena for "Bridge the Gap".
 * Compatible with Agent A's server/game state contract or standalone demo mode.
 *
 * Direct Integration with Agent A's GamePage:
 * ```jsx
 * import GameArena from '../components/GameArena.jsx'
 *
 * export default function GamePage({ socket, game, onLeave }) {
 *   return <GameArena game={game} socket={socket} onLeave={onLeave} />
 * }
 * ```
 *
 * Granular Props API (all optional, falls back to standalone demo mode):
 * @param {object} [game] - Server match state: { motion, planks, phase, argument, speakerId, responderId, you, partner, disagreement }
 *                          disagreement = { byId, byName, text } | null  (the last rejected point + the reason given)
 * @param {object} [socket] - Socket.IO client (auto-wires game:argument, game:decision, game:leave)
 * @param {string} [topic] - Debate motion/topic (fallback if game.motion is omitted)
 * @param {number} [plankCount] - Controlled number of built planks (0-10)
 * @param {'argue' | 'decide' | 'won' | 'abandoned'} [phase] - Controlled debate phase
 * @param {string} [currentArgument] - Active argument text on the table
 * @param {boolean} [isSpeaker] - Whether local client is the current speaker
 * @param {boolean} [isResponder] - Whether local client is the current responder
 * @param {object} [player1] - { id, name, role } (Left island / Cyan)
 * @param {object} [player2] - { id, name, role } (Right island / Amber)
 * @param {function} [onSubmitArgument] - Callback (text: string) => void
 * @param {function} [onAgree] - Callback () => void
 * @param {function} [onDisagree] - Callback (reason: string) => void   (a reason is now required)
 * @param {function} [onDecision] - Callback (agree: boolean, reason?: string) => void
 * @param {function} [onLeave] - Callback () => void (forfeit or return to lobby)
 * @param {function} [onReset] - Callback () => void (reset demo state)
 */

const TOTAL_PLANKS = 10
const MIN_REASON = 5 // keep in sync with the server
const DEFAULT_TOPIC = 'Can AI and humans collaborate as genuine creative peers?'
const DEFAULT_P1 = { id: 'p1', name: 'Atlas', role: 'Speaker' }
const DEFAULT_P2 = { id: 'p2', name: 'Nova', role: 'Responder' }

const MOCK_INITIAL_TRANSCRIPT = [
  {
    id: 1,
    authorName: 'Atlas',
    author: 'p1',
    text: 'AI removes repetitive friction, letting humans focus entirely on higher-order vision and meaning.',
    status: 'agreed',
    timestamp: 'Round 1',
  },
  {
    id: 2,
    authorName: 'Nova',
    author: 'p2',
    text: 'Friction is where originality is born. Without struggle, ideas risk becoming generic pastiche.',
    status: 'agreed',
    timestamp: 'Round 2',
  },
  {
    id: 3,
    authorName: 'Atlas',
    author: 'p1',
    text: 'What if we treat AI not as a shortcut, but as a dynamic sparring partner that questions our biases?',
    status: 'pending',
    timestamp: 'Active Point',
  },
]

export default function GameArena({
  game,
  socket,
  topic: propTopic,
  plankCount: propPlankCount,
  phase: propPhase,
  currentArgument: propArgument,
  isSpeaker: propIsSpeaker,
  isResponder: propIsResponder,
  player1: propPlayer1,
  player2: propPlayer2,
  onSubmitArgument,
  onAgree,
  onDisagree,
  onDecision,
  onLeave,
  onReset,
}) {
  // Determine if component is running controlled by props / server
  const isControlled = game !== undefined || propPlankCount !== undefined || propPhase !== undefined

  // shortcut: local mock state used when running standalone without server props
  const [localPlanks, setLocalPlanks] = useState(3)
  const [localTurn, setLocalTurn] = useState('p2') // 'p1' speaker, 'p2' responder
  const [localPhase, setLocalPhase] = useState('decide') // 'argue' | 'decide' | 'won'
  const [localCurrentArg, setLocalCurrentArg] = useState(
    'What if we treat AI not as a shortcut, but as a dynamic sparring partner that questions our biases?'
  )
  const [localDisagreement, setLocalDisagreement] = useState(null)
  const [inputText, setInputText] = useState('')
  const [feedback, setFeedback] = useState('')
  // Disagree flow: clicking DISAGREE opens a reason form; nothing is sent until a reason is given
  const [disagreeing, setDisagreeing] = useState(false)
  const [reasonText, setReasonText] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [transcript, setTranscript] = useState(() => (isControlled ? [] : MOCK_INITIAL_TRANSCRIPT))
  // Per-player tallies (controlled mode): the server swaps roles after every
  // decision, so the speaker in the state AFTER a decision is the player who
  // just decided — planks only rise when that decision was an agree.
  const [myAgrees, setMyAgrees] = useState(0)
  const [theirAgrees, setTheirAgrees] = useState(0)

  // Derive resolved state from props or fallback to local mock state
  const topic = game?.motion ?? propTopic ?? DEFAULT_TOPIC
  const planks = game?.planks ?? propPlankCount ?? localPlanks
  const phase = game?.phase ?? propPhase ?? localPhase
  const isWon = phase === 'won' || planks >= TOTAL_PLANKS
  const isAbandoned = phase === 'abandoned'

  // Derive players & roles
  const p1 = game?.you
    ? { id: game.you.id, name: game.you.name, role: 'You' }
    : propPlayer1 ?? DEFAULT_P1

  const p2 = game?.partner
    ? { id: game.partner.id, name: game.partner.name, role: 'Partner' }
    : propPlayer2 ?? DEFAULT_P2

  // Derive role flags
  const isSpeaker = isControlled
    ? (game ? game.speakerId === game.you?.id : (propIsSpeaker ?? false))
    : localTurn === 'p1'

  const isResponder = isControlled
    ? (game ? game.responderId === game.you?.id : (propIsResponder ?? false))
    : localTurn === 'p2'

  // Derive active argument text
  const currentArgText = isControlled
    ? (game ? game.argument : propArgument)
    : localCurrentArg

  // Last rejected point + the reason the disagreeing player gave
  const lastDisagreement = isControlled ? (game?.disagreement ?? null) : localDisagreement

  // Automatic transcript capture for live server matches
  const prevArgRef = useRef(null)
  const prevPlanksRef = useRef(planks)
  const prevPhaseRef = useRef(phase)

  useEffect(() => {
    if (!isControlled) return

    // When an argument arrives during decide phase
    if (currentArgText && currentArgText !== prevArgRef.current) {
      prevArgRef.current = currentArgText
      const speakerName = game
        ? (game.speakerId === game.you?.id ? game.you.name : game.partner.name)
        : (isSpeaker ? p1.name : p2.name)
      const newEntry = {
        id: Date.now(),
        authorName: speakerName,
        author: isSpeaker ? 'p1' : 'p2',
        text: currentArgText,
        status: 'pending',
        timestamp: `Point #${transcript.length + 1}`,
      }
      setTranscript((prev) => [...prev, newEntry])
    }

    if (!currentArgText) {
      prevArgRef.current = null
    }

    // When leaving 'decide' phase, update the pending round to agreed or disagreed
    // (a disagreement also records the reason the responder gave)
    if (prevPhaseRef.current === 'decide' && phase !== 'decide') {
      const agreed = planks > prevPlanksRef.current
      const reason = agreed ? undefined : game?.disagreement?.text
      setTranscript((prev) =>
        prev.map((entry, idx) =>
          idx === prev.length - 1 && entry.status === 'pending'
            ? { ...entry, status: agreed ? 'agreed' : 'disagreed', reason }
            : entry
        )
      )
    }

    if (isControlled && game && planks > prevPlanksRef.current) {
      if (game.speakerId === game.you?.id) setMyAgrees((c) => c + 1)
      else setTheirAgrees((c) => c + 1)
    }

    prevPlanksRef.current = planks
    prevPhaseRef.current = phase
  }, [isControlled, currentArgText, planks, phase, game, isSpeaker, p1.name, p2.name, transcript.length])

  // Handlers
  function handleAgree() {
    if (isWon) return

    if (onAgree) {
      onAgree()
    } else if (onDecision) {
      onDecision(true)
    } else if (socket) {
      socket.emit('game:decision', { agree: true })
    }

    if (!isControlled) {
      const nextPlanks = Math.min(TOTAL_PLANKS, localPlanks + 1)
      setLocalPlanks(nextPlanks)
      setTranscript((prev) =>
        prev.map((item, idx) => (idx === prev.length - 1 ? { ...item, status: 'agreed' } : item))
      )
      setLocalPhase(nextPlanks >= TOTAL_PLANKS ? 'won' : 'argue')
      setLocalTurn((prev) => (prev === 'p1' ? 'p2' : 'p1'))
      setLocalCurrentArg(null)
      setLocalDisagreement(null)
      setFeedback('🤝 Common ground agreed! +1 plank added to the bridge.')
    }
  }

  // Step 1: DISAGREE only opens the reason form — nothing is sent yet.
  function handleDisagree() {
    setReasonError('')
    setDisagreeing(true)
  }

  function handleCancelReason() {
    setDisagreeing(false)
    setReasonText('')
    setReasonError('')
  }

  // Step 2: the disagreement is sent together with the required reason.
  function handleSubmitReason(e) {
    e.preventDefault()
    const reason = reasonText.trim()
    if (reason.length < MIN_REASON) {
      setReasonError(`Explain why you disagree (at least ${MIN_REASON} characters).`)
      return
    }

    if (onDisagree) {
      onDisagree(reason)
    } else if (onDecision) {
      onDecision(false, reason)
    } else if (socket) {
      socket.emit('game:decision', { agree: false, reason })
    }

    if (!isControlled) {
      setTranscript((prev) =>
        prev.map((item, idx) => (idx === prev.length - 1 ? { ...item, status: 'disagreed', reason } : item))
      )
      setLocalDisagreement({ byName: p2.name, text: reason })
      setLocalPhase('argue')
      setLocalTurn((prev) => (prev === 'p1' ? 'p2' : 'p1'))
      setLocalCurrentArg(null)
      setFeedback('⚡ Point challenged! Turn passed to argue the counter-perspective.')
    }

    handleCancelReason()
  }

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = inputText.trim()
    if (trimmed.length < 2) {
      setFeedback('Please write at least 2 characters.')
      return
    }

    if (onSubmitArgument) {
      onSubmitArgument(trimmed)
    } else if (socket) {
      socket.emit('game:argument', trimmed)
    }

    if (!isControlled) {
      const speakerName = localTurn === 'p1' ? p1.name : p2.name
      const newEntry = {
        id: Date.now(),
        authorName: speakerName,
        author: localTurn,
        text: trimmed,
        status: 'pending',
        timestamp: `Round ${transcript.length + 1}`,
      }
      setTranscript((prev) => [...prev, newEntry])
      setLocalCurrentArg(trimmed)
      setLocalPhase('decide')
      setLocalTurn((prev) => (prev === 'p1' ? 'p2' : 'p1'))
      setFeedback(`Argument submitted by ${speakerName}! Waiting for partner to decide.`)
    }

    setInputText('')
  }

  function handleLeave() {
    if (onLeave) {
      onLeave()
    } else if (socket) {
      socket.emit('game:leave')
    }
  }

  function handleReset() {
    if (onReset) onReset()
    if (!isControlled) {
      setLocalPlanks(3)
      setLocalTurn('p2')
      setLocalPhase('decide')
      setLocalCurrentArg(
        'What if we treat AI not as a shortcut, but as a dynamic sparring partner that questions our biases?'
      )
      setLocalDisagreement(null)
      setTranscript(MOCK_INITIAL_TRANSCRIPT)
      setInputText('')
      handleCancelReason()
      setFeedback('Arena reset to default mock state.')
    }
  }

  // Calculate player avatar X position along the bridge progression (0 to 10)
  // Only advances over planks THIS player personally agreed to; disagreeing
  // player stays grounded on their own island.
  const p1Steps = isControlled ? myAgrees : planks
  const p2Steps = isControlled ? theirAgrees : planks
  const p1X = isWon ? 292 : Math.round(100 + p1Steps * 19.2)
  const p2X = isWon ? 328 : Math.round(520 - p2Steps * 19.2)

  // Active status for HUD cards (speaker during argue, responder during decide)
  const p1IsActive = phase === 'argue' ? isSpeaker : phase === 'decide' ? isResponder : false
  const p2IsActive = phase === 'argue' ? !isSpeaker : phase === 'decide' ? !isResponder : false

  return (
    <div className="game-arena" role="region" aria-label="Game Arena">
      {/* Arena Header */}
      <header className="arena-header">
        <div className="arena-header-left">
          <span className="arena-logo-dot" aria-hidden="true" />
          <h2 className="arena-title">BRIDGE THE GAP · ARENA</h2>
        </div>
        <div className="arena-topic-badge" title={topic}>
          <span className="topic-tag">TOPIC:</span>
          <span className="topic-text">{topic}</span>
        </div>
        <div className="arena-header-actions">
          {!isControlled && (
            <button
              type="button"
              className="arena-reset-btn"
              onClick={handleReset}
              title="Reset mock demo"
            >
              ↻ Reset Demo
            </button>
          )}
          {(onLeave || socket) && (
            <button
              type="button"
              className="arena-leave-btn"
              onClick={handleLeave}
              title="Leave / Forfeit match"
            >
              ✕ Exit
            </button>
          )}
        </div>
      </header>

      {/* Turn & Plank Progress HUD */}
      <section className="arena-hud">
        {/* Player 1 Card (Left Island / Cyan) */}
        <div className={`player-hud-card p1-card ${p1IsActive ? 'active-turn' : ''}`}>
          <div className="player-indicator p1-indicator" aria-hidden="true" />
          <div className="player-meta">
            <span className="player-hud-name">{p1.name}</span>
            <span className="player-hud-role">
              {isControlled ? (game?.you?.name === p1.name ? 'YOU (Cyan)' : p1.role) : 'Player 1 (Cyan)'}
            </span>
          </div>
          {phase === 'argue' && isSpeaker && <span className="turn-pill p1-pill">SPEAKING</span>}
          {phase === 'decide' && isResponder && <span className="turn-pill p1-pill">DECIDING</span>}
          {phase === 'decide' && !isResponder && <span className="turn-pill p1-pill">ARGUED</span>}
        </div>

        {/* 10-Plank Segmented Tracker */}
        <div className="hud-bridge-tracker" aria-label={`Bridge progress: ${planks} of 10 planks`}>
          <div className="tracker-header">
            <span className="tracker-label">BRIDGE COMPLETION</span>
            <span className="tracker-count">
              {planks} / {TOTAL_PLANKS} PLANKS ({Math.round((planks / TOTAL_PLANKS) * 100)}%)
            </span>
          </div>
          <div
            className="tracker-slots"
            role="progressbar"
            aria-valuenow={planks}
            aria-valuemin={0}
            aria-valuemax={10}
          >
            {Array.from({ length: TOTAL_PLANKS }).map((_, idx) => (
              <div
                key={idx}
                className={`tracker-slot ${idx < planks ? 'filled' : 'empty'}`}
                title={`Plank slot ${idx + 1}: ${idx < planks ? 'Built' : 'Open'}`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Player 2 Card (Right Island / Amber) */}
        <div className={`player-hud-card p2-card ${p2IsActive ? 'active-turn' : ''}`}>
          <div className="player-meta text-right">
            <span className="player-hud-name">{p2.name}</span>
            <span className="player-hud-role">
              {isControlled ? (game?.partner?.name === p2.name ? 'PARTNER (Amber)' : p2.role) : 'Player 2 (Amber)'}
            </span>
          </div>
          <div className="player-indicator p2-indicator" aria-hidden="true" />
          {phase === 'argue' && !isSpeaker && <span className="turn-pill p2-pill">SPEAKING</span>}
          {phase === 'decide' && !isResponder && <span className="turn-pill p2-pill">DECIDING</span>}
          {phase === 'decide' && isResponder && <span className="turn-pill p2-pill">ARGUED</span>}
        </div>
      </section>

      {/* SVG Arena Scene: 2 Islands + Water + 10 Plank Bridge */}
      <div className="arena-canvas-wrap">
        <svg
          className="arena-svg"
          viewBox="0 0 640 240"
          role="img"
          aria-label="Two islands joined across water by a 10-slot wooden bridge"
          shapeRendering="crispEdges"
        >
          {/* Sky background */}
          <rect x="0" y="0" width="640" height="150" fill="#0a122c" />
          {/* Stars */}
          <rect x="40" y="20" width="2" height="2" fill="#8fb7ff" />
          <rect x="110" y="35" width="3" height="3" fill="#c9d9ff" />
          <rect x="220" y="15" width="2" height="2" fill="#7fe7ff" />
          <rect x="310" y="28" width="3" height="3" fill="#8fb7ff" />
          <rect x="430" y="18" width="2" height="2" fill="#c9d9ff" />
          <rect x="540" y="32" width="3" height="3" fill="#ffc285" />
          <rect x="600" y="12" width="2" height="2" fill="#8fb7ff" />

          {/* Water background */}
          <rect x="0" y="150" width="640" height="90" fill="#0d284a" />
          <rect x="0" y="150" width="640" height="4" fill="#184e85" />
          {/* Water waves */}
          <rect x="170" y="165" width="30" height="2" fill="#2a97e0" />
          <rect x="230" y="185" width="40" height="2" fill="#1d6fa5" />
          <rect x="310" y="170" width="36" height="2" fill="#38b6ff" />
          <rect x="380" y="195" width="45" height="2" fill="#2a97e0" />
          <rect x="440" y="172" width="28" height="2" fill="#1d6fa5" />
          <rect x="260" y="210" width="50" height="2" fill="#185280" />
          <rect x="350" y="220" width="35" height="2" fill="#185280" />

          {/* Left Island (x: 0..160) */}
          <rect x="0" y="120" width="160" height="12" fill="#3fae6a" />
          <rect x="0" y="132" width="160" height="4" fill="#2d7c4b" />
          <rect x="0" y="136" width="160" height="42" fill="#6b4a2f" />
          <rect x="0" y="178" width="160" height="34" fill="#4d3521" />
          {/* Left cliff texture */}
          <rect x="148" y="136" width="12" height="60" fill="#3e2a1b" />
          {/* Left Island Tree */}
          <rect x="26" y="80" width="6" height="40" fill="#5a3b24" />
          <rect x="14" y="62" width="30" height="18" fill="#3fae6a" />
          <rect x="18" y="52" width="22" height="10" fill="#54c983" />
          {/* Left Island P1 Flag (Cyan) */}
          <rect x="62" y="68" width="3" height="52" fill="#8fb7ff" />
          <polygon points="65,70 90,78 65,86" fill="#2a97e0" />

          {/* Right Island (x: 480..640) */}
          <rect x="480" y="120" width="160" height="12" fill="#3fae6a" />
          <rect x="480" y="132" width="160" height="4" fill="#2d7c4b" />
          <rect x="480" y="136" width="160" height="42" fill="#6b4a2f" />
          <rect x="480" y="178" width="160" height="34" fill="#4d3521" />
          {/* Right cliff texture */}
          <rect x="480" y="136" width="12" height="60" fill="#3e2a1b" />
          {/* Right Island Tree */}
          <rect x="604" y="80" width="6" height="40" fill="#5a3b24" />
          <rect x="592" y="62" width="30" height="18" fill="#3fae6a" />
          <rect x="596" y="52" width="22" height="10" fill="#54c983" />
          {/* Right Island P2 Flag (Amber) */}
          <rect x="575" y="68" width="3" height="52" fill="#ffc285" />
          <polygon points="575,70 550,78 575,86" fill="#e07b3c" />

          {/* Bridge Anchor Posts */}
          <rect x="156" y="106" width="6" height="28" fill="#8a5a28" />
          <rect x="156" y="106" width="6" height="4" fill="#543615" />
          <rect x="478" y="106" width="6" height="28" fill="#8a5a28" />
          <rect x="478" y="106" width="6" height="4" fill="#543615" />

          {/* Bridge Support Ropes */}
          <line x1="158" y1="110" x2="482" y2="110" stroke="#b87c3c" strokeWidth="2" />
          <line x1="158" y1="126" x2="482" y2="126" stroke="#8a5a28" strokeWidth="2" />

          {/* 10 Visible Bridge Plank Slots across the gap (x: 162..478) */}
          {Array.from({ length: TOTAL_PLANKS }).map((_, i) => {
            const slotX = 162 + i * 32
            // your planks build from the left island, partner's from the right
            const isBuilt = isControlled
              ? i < myAgrees || i >= TOTAL_PLANKS - theirAgrees
              : i < planks

            return (
              <g key={i}>
                {/* Vertical rope connector */}
                <line x1={slotX + 14} y1="110" x2={slotX + 14} y2="122" stroke="#9e6932" strokeWidth="1" />

                {isBuilt ? (
                  /* Solid Built Wooden Plank */
                  <g className="plank-group-built">
                    <rect x={slotX} y="122" width="28" height="10" fill="#c48946" stroke="#7a4e24" strokeWidth="1" />
                    <rect x={slotX + 1} y="123" width="26" height="2" fill="#f2b978" />
                    <rect x={slotX + 2} y="127" width="24" height="1" fill="#9e6932" />
                    <circle cx={slotX + 4} cy="125" r="1" fill="#40230b" />
                    <circle cx={slotX + 24} cy="125" r="1" fill="#40230b" />
                  </g>
                ) : (
                  /* Visible Empty Plank Slot */
                  <g className="plank-group-empty">
                    <rect
                      x={slotX}
                      y="122"
                      width="28"
                      height="10"
                      fill="rgba(14, 23, 51, 0.75)"
                      stroke="#2b3e6e"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                    />
                    <text
                      x={slotX + 14}
                      y="130"
                      textAnchor="middle"
                      fill="#5672ab"
                      fontSize="8"
                      fontFamily="var(--pixel)"
                    >
                      {i + 1}
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {/* Player 1 Character (Cyan) */}
          <g transform={`translate(${p1X}, 96)`} className="player-sprite p1-sprite">
            {/* P1 Nameplate */}
            <rect x="-8" y="-14" width="30" height="10" fill="#060a19" stroke="#2a97e0" strokeWidth="1" />
            <text x="7" y="-7" textAnchor="middle" fill="#7fe7ff" fontSize="6" fontFamily="var(--pixel)">
              {(p1.name || 'P1').slice(0, 5).toUpperCase()}
            </text>
            {/* P1 Body */}
            <rect x="0" y="0" width="14" height="10" fill="#ffdbac" />
            <rect x="0" y="-3" width="14" height="5" fill="#1b284f" />
            <rect x="0" y="0" width="14" height="3" fill="#7fe7ff" />
            <rect x="10" y="4" width="2" height="2" fill="#000" />
            <rect x="0" y="10" width="14" height="12" fill="#2a97e0" />
            <rect x="0" y="15" width="14" height="2" fill="#7fe7ff" />
            <rect x="1" y="22" width="5" height="4" fill="#0e1733" />
            <rect x="8" y="22" width="5" height="4" fill="#0e1733" />
          </g>

          {/* Player 2 Character (Amber) */}
          <g transform={`translate(${p2X}, 96)`} className="player-sprite p2-sprite">
            {/* P2 Nameplate */}
            <rect x="-8" y="-14" width="30" height="10" fill="#060a19" stroke="#e0a35c" strokeWidth="1" />
            <text x="7" y="-7" textAnchor="middle" fill="#ffb35c" fontSize="6" fontFamily="var(--pixel)">
              {(p2.name || 'P2').slice(0, 5).toUpperCase()}
            </text>
            {/* P2 Body */}
            <rect x="0" y="0" width="14" height="10" fill="#ffdbac" />
            <rect x="0" y="-3" width="14" height="5" fill="#4a2c11" />
            <rect x="0" y="0" width="14" height="3" fill="#ffb35c" />
            <rect x="2" y="4" width="2" height="2" fill="#000" />
            <rect x="0" y="10" width="14" height="12" fill="#e07b3c" />
            <rect x="0" y="15" width="14" height="2" fill="#ffb35c" />
            <rect x="1" y="22" width="5" height="4" fill="#2c170b" />
            <rect x="8" y="22" width="5" height="4" fill="#2c170b" />
          </g>

          {/* Bridge Completed Celebration Banner in SVG */}
          {isWon && (
            <g className="victory-banner">
              <rect x="180" y="38" width="280" height="36" fill="#060a19" stroke="#e0a35c" strokeWidth="2" />
              <text x="320" y="61" textAnchor="middle" fill="#7fe7ff" fontSize="12" fontFamily="var(--pixel)">
                ★ GAP BRIDGED! 10/10 ★
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Match Win Screen */}
      {isWon && (
        <section className="arena-end-card victory-card" aria-label="Victory Announcement">
          <h3 className="end-title">🎉 BRIDGE COMPLETE</h3>
          <p className="end-subtitle">
            {p1.name} and {p2.name} found 10 points of common ground and crossed the gap together!
          </p>
          {(onLeave || socket) && (
            <button type="button" className="arena-btn btn-submit" onClick={handleLeave}>
              RETURN TO LOBBY
            </button>
          )}
        </section>
      )}

      {/* Match Abandoned Screen */}
      {isAbandoned && (
        <section className="arena-end-card abandoned-card" aria-label="Match Abandoned">
          <h3 className="end-title">⚡ MATCH ENDED</h3>
          <p className="end-subtitle">Opponent left the match.</p>
          {(onLeave || socket) && (
            <button type="button" className="arena-btn btn-disagree" onClick={handleLeave}>
              RETURN TO LOBBY
            </button>
          )}
        </section>
      )}

      {/* Active Debate Controls (Only displayed when game is active) */}
      {!isWon && !isAbandoned && (
        <>
          {/* Phase: DECIDE */}
          {phase === 'decide' && (
            <section className="current-argument-card" aria-label="Current Argument">
              <div className="card-topline">
                <div className="author-pill-wrap">
                  <span className={`author-pill ${isSpeaker ? 'author-p1' : 'author-p2'}`}>
                    ● {isSpeaker ? `${p1.name} (Argued)` : `${p2.name} (Argued)`}
                  </span>
                  <span className="round-tag">Awaiting Consensus</span>
                </div>
              </div>

              <blockquote className="argument-body">
                {currentArgText ?? 'Argument submitted...'}
              </blockquote>

              {/* Responder Controls (Agree / Disagree available ONLY to the responder) */}
              {isResponder ? (
                disagreeing ? (
                  /* Disagreeing requires a reason */
                  <form className="reason-form" onSubmit={handleSubmitReason}>
                    <label htmlFor="arena-reason-input" className="responder-prompt">
                      WHY DO YOU DISAGREE? A REASON IS REQUIRED.
                    </label>
                    <input
                      id="arena-reason-input"
                      type="text"
                      className="arena-input"
                      value={reasonText}
                      onChange={(e) => {
                        setReasonText(e.target.value)
                        if (reasonError) setReasonError('')
                      }}
                      placeholder="Explain what you see differently..."
                      maxLength={600}
                      autoComplete="off"
                      autoFocus
                      aria-invalid={reasonError ? 'true' : undefined}
                      aria-describedby={reasonError ? 'arena-reason-error' : undefined}
                    />
                    {reasonError && (
                      <p id="arena-reason-error" className="reason-error" role="alert">
                        {reasonError}
                      </p>
                    )}
                    <div className="action-button-row">
                      <button type="submit" className="arena-btn btn-disagree">
                        ⚡ SEND REASON &amp; REBUT
                      </button>
                      <button type="button" className="arena-btn btn-cancel" onClick={handleCancelReason}>
                        BACK
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="responder-actions-wrap">
                    <p className="responder-prompt">
                      Do you agree this represents valid common ground?
                    </p>
                    <div className="action-button-row">
                      <button
                        type="button"
                        className="arena-btn btn-agree"
                        onClick={handleAgree}
                        title="Agree with this point to place a plank"
                      >
                        🤝 AGREE (+1 PLANK)
                      </button>
                      <button
                        type="button"
                        className="arena-btn btn-disagree"
                        onClick={handleDisagree}
                        title="Disagree — you'll be asked to give a reason"
                      >
                        ⚡ DISAGREE (REBUT)
                      </button>
                    </div>
                  </div>
                )
              ) : (
                /* Speaker Waiting Notice (Agree/Disagree hidden from speaker) */
                <div className="arena-waiting-box">
                  <span className="waiting-spinner" aria-hidden="true">⏳</span>
                  <p className="waiting-text">
                    You argued: &ldquo;{currentArgText}&rdquo; — waiting for {p2.name} to decide...
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Phase: ARGUE */}
          {phase === 'argue' && (
            <section className="debate-input-section">
              {/* Why the last point was rejected — visible to both players */}
              {lastDisagreement && (
                <div className="disagreement-note" role="note">
                  <span className="disagreement-tag">⚡ {lastDisagreement.byName} DISAGREED BECAUSE</span>
                  <p className="disagreement-text">&ldquo;{lastDisagreement.text}&rdquo;</p>
                </div>
              )}

              {isSpeaker ? (
                /* Speaker Input Form */
                <form className="argument-form" onSubmit={handleSubmit}>
                  <label htmlFor="arena-arg-input" className="input-header-label">
                    YOUR TURN TO SPEAK ({p1.name.toUpperCase()}):
                  </label>
                  <div className="input-row">
                    <input
                      id="arena-arg-input"
                      type="text"
                      className="arena-input"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="State a premise, counterpoint, or common ground..."
                      maxLength={600}
                      autoComplete="off"
                    />
                    <button type="submit" className="arena-btn btn-submit">
                      SEND POINT
                    </button>
                  </div>
                </form>
              ) : (
                /* Responder Waiting Notice */
                <div className="arena-waiting-box">
                  <span className="waiting-spinner" aria-hidden="true">💬</span>
                  <p className="waiting-text">
                    Waiting for {p2.name} to argue their perspective...
                  </p>
                </div>
              )}
            </section>
          )}

          {feedback && (
            <p className="arena-feedback-msg" role="status">
              {feedback}
            </p>
          )}
        </>
      )}

      {/* Collapsible Debate Log / Transcript */}
      <details className="arena-transcript-details" open={transcript.length > 0}>
        <summary className="transcript-summary">
          <span>📜 Debate Transcript ({transcript.length} points recorded)</span>
        </summary>
        <div className="transcript-list">
          {transcript.length === 0 ? (
            <p className="transcript-empty">No debate points logged yet.</p>
          ) : (
            transcript.map((item) => (
              <div
                key={item.id}
                className={`transcript-item ${item.author === 'p1' ? 'transcript-p1' : 'transcript-p2'}`}
              >
                <div className="transcript-meta">
                  <strong>{item.authorName}</strong> · <span>{item.timestamp}</span> ·{' '}
                  <span className={`status-badge status-${item.status}`}>
                    {item.status === 'agreed' ? '🤝 AGREED (+1 PLANK)' : item.status === 'disagreed' ? '⚡ DISAGREED' : '⏳ ACTIVE'}
                  </span>
                </div>
                <p className="transcript-text">{item.text}</p>
                {item.reason && (
                  <p className="transcript-reason">
                    <strong>Reason given:</strong> {item.reason}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </details>
    </div>
  )
}