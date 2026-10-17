import GameArena from '../components/GameArena.jsx'

// Thin wrapper: Agent B's visual arena, wired to the same socket/game contract.
export default function GamePage({ socket, game, onLeave }) {
  return <GameArena game={game} socket={socket} onLeave={onLeave} />
}