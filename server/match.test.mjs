// Scripted end-to-end test of the debate loop. Run: node server/match.test.mjs
import { io } from 'socket.io-client'

const URL = 'http://localhost:3001'
const A = io(URL)
const B = io(URL)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let failures = 0
function check(label, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}`)
  if (!cond) failures++
}

const stateA = []
const stateB = []
A.on('game:state', (s) => stateA.push(s))
B.on('game:state', (s) => stateB.push(s))

await sleep(200)
A.emit('lobby:join', 'Alice')
B.emit('lobby:join', 'Bob')
await sleep(200)

A.emit('game:queue')
B.emit('game:queue')
await sleep(300)

check('both got a match state', stateA.length >= 1 && stateB.length >= 1)
const first = stateA.at(-1)
check('same matchId', first?.matchId === stateB.at(-1)?.matchId)
check('motion assigned', typeof first?.motion === 'string' && first.motion.length > 0)
check('starts at 0 planks', first?.planks === 0)
check('phase argue', first?.phase === 'argue')

// speaker is whoever the server picked; find who
const speakerIsA = first.speakerId === first.you.id
const speakerSock = speakerIsA ? A : B
const responderSock = speakerIsA ? B : A

// play 10 agree rounds; on round 2 use a disagree first to prove planks don't grow
speakerSock.emit('game:argument', 'I argue that this motion is great.')
await sleep(200)
let s = speakerIsA ? stateA.at(-1) : stateB.at(-1)
check('decide phase after argument', s?.phase === 'decide')
check('argument stored', s?.argument?.includes('this motion is great'))

// responder disagrees -> plank unchanged, roles swap
responderSock.emit('game:decision', { agree: false })
await sleep(200)
s = speakerIsA ? stateA.at(-1) : stateB.at(-1)
check('disagree keeps planks at 0', s?.planks === 0)
check('roles swapped after disagree', s?.phase === 'argue' && s.speakerId !== first.speakerId)

// now agree 10 times to reach the win
for (let i = 1; i <= 10; i++) {
  const cur = stateA.at(-1)
  const curSpeaker = cur.speakerId === cur.you.id ? A : B
  curSpeaker.emit('game:argument', `Argument number ${i}.`)
  await sleep(120)
  const decider = cur.speakerId === cur.you.id ? B : A
  decider.emit('game:decision', { agree: true })
  await sleep(120)
}

const endA = stateA.at(-1)
const endB = stateB.at(-1)
check('planks reached 10', endA?.planks === 10)
check('phase won', endA?.phase === 'won')
check('both clients see the win', endB?.phase === 'won' && endB?.planks === 10)

A.disconnect()
B.disconnect()
await sleep(100)
console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`)
process.exit(failures === 0 ? 0 : 1)