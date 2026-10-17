import Phaser from 'phaser'

const BOUNDS = { left: 60, right: 900, top: 80, bottom: 470 }
const SPEED = 180

const AVATAR_COLORS = [0x4fe0ff, 0xffb35c, 0x3fae6a, 0xff7b9c, 0xc084fc, 0xffe066]

// Lobby plaza: you move your avatar with WASD/arrows; everyone else
// follows positions relayed by the server.
export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super('Lobby')
    this.avatars = new Map() // socket.id -> { container, label, x, y, color }
    this.myId = null
    this.socket = null
    this.cursors = null
    this.wasd = null
    this.sendAcc = 0
    this.lastSent = { x: 0, y: 0 }
  }

  create() {
    // socket + identity are handed over from App via the game registry
    this.socket = this.registry.get('socket')
    this.myId = this.registry.get('myId')
    this.drawPlaza()

    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = this.input.keyboard.addKeys('W,A,S,D')

    // full player roster (arrives before/after scene mounts; App fetches it async)
    const onRoster = (list) => {
      if (this._disposed) return
      this.syncRoster(list)
    }
    const onMove = ({ id, x, y }) => {
      if (this._disposed) return
      this.moveAvatar(id, x, y)
    }
    this._handlers = [
      ['lobby:players', onRoster],
      ['lobby:move', onMove],
    ]
    this._disposed = false
    for (const [ev, fn] of this._handlers) this.socket.on(ev, fn)
    // dispose() removes handlers with a plain flag — a torn-down Phaser scene
    // must never run code in the socket packet path or it eats later events
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.dispose())
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.dispose())
    this.socket.emit('lobby:requestPlayers')
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.dispose())
  }

  dispose() {
    if (this._disposed) return
    this._disposed = true
    for (const [ev, fn] of this._handlers ?? []) this.socket.off(ev, fn)
  }

  drawPlaza() {
    const { left, right, top, bottom } = BOUNDS
    const w = right - left
    const h = bottom - top

    // plaza ground: checkered "floor" tiles
    const tile = 40
    for (let x = left; x < right; x += tile) {
      for (let y = top; y < bottom; y += tile) {
        const even = ((x - left) / tile + (y - top) / tile) % 2 === 0
        this.add.rectangle(x + tile / 2, y + tile / 2, tile, tile, even ? 0x14224a : 0x111c3e)
      }
    }
    // plaza border
    const border = this.add.graphics()
    border.lineStyle(4, 0x38b6ff, 1)
    border.strokeRect(left, top, w, h)

    // fountain in the middle (decorative pixel pond)
    this.add.rectangle(480, 275, 96, 64, 0x113a6b).setDepth(0)
    this.add.rectangle(480, 275, 80, 48, 0x2a97e0).setDepth(0)
    this.add.rectangle(480, 275, 16, 16, 0x7fe7ff).setDepth(1)

    // lamps in the corners
    for (const [lx, ly] of [
      [left + 24, top + 24],
      [right - 24, top + 24],
      [left + 24, bottom - 24],
      [right - 24, bottom - 24],
    ]) {
      this.add.rectangle(lx, ly, 8, 16, 0x5a3b24)
      this.add.rectangle(lx, ly - 12, 12, 12, 0xffe066)
    }

    this.add
      .text(480, 40, 'LOBBY PLAZA — WASD / ARROWS TO WALK', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#8b9cc9',
      })
      .setOrigin(0.5)
  }

  avatarColor(id) {
    let hash = 0
    for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
    return AVATAR_COLORS[hash % AVATAR_COLORS.length]
  }

  makeAvatar(id, name, x, y) {
    const color = this.avatarColor(id)
    const container = this.add.container(x, y)
    // body (2 stacked pixel blocks) + head
    container.add(this.add.rectangle(0, 6, 14, 14, color).setStrokeStyle(2, 0x060a19))
    container.add(this.add.rectangle(0, -8, 12, 12, color).setStrokeStyle(2, 0x060a19))
    const label = this.add
      .text(0, -26, name, { fontFamily: 'monospace', fontSize: '12px', color: '#c9d9ff' })
      .setOrigin(0.5)
    container.add(label)
    container.setDepth(y)
    return { container, label, x, y, color }
  }

  syncRoster(list) {
    const seen = new Set()
    for (const p of list) {
      seen.add(p.id)
      let a = this.avatars.get(p.id)
      if (!a) {
        a = this.makeAvatar(p.id, p.name, p.x, p.y)
        this.avatars.set(p.id, a)
      }
      a.container.setPosition(p.x, p.y)
      a.x = p.x
      a.y = p.y
      a.container.setDepth(p.y)
    }
    for (const [id, a] of this.avatars) {
      if (!seen.has(id)) {
        a.container.destroy()
        this.avatars.delete(id)
      }
    }
  }

  moveAvatar(id, x, y) {
    const a = this.avatars.get(id)
    if (!a) return
    a.x = x
    a.y = y
    a.container.setDepth(y)
    this.tweens.add({ targets: a.container, x, y, duration: 90, ease: 'Linear' })
  }

  update(_, delta) {
    // socket.id is undefined at preBoot (connect is async) — resolve lazily
    if (!this.myId && this.socket?.id) this.myId = this.socket.id
    const me = this.myId ? this.avatars.get(this.myId) : null
    if (!me) return

    let dx = 0
    let dy = 0
    if (this.cursors.left.isDown || this.wasd.A.isDown) dx -= 1
    if (this.cursors.right.isDown || this.wasd.D.isDown) dx += 1
    if (this.cursors.up.isDown || this.wasd.W.isDown) dy -= 1
    if (this.cursors.down.isDown || this.wasd.S.isDown) dy += 1

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy)
      const { left, right, top, bottom } = BOUNDS
      me.x = Phaser.Math.Clamp(me.x + (dx / len) * (SPEED * delta) / 1000, left, right)
      me.y = Phaser.Math.Clamp(me.y + (dy / len) * (SPEED * delta) / 1000, top, bottom)
      me.container.setPosition(me.x, me.y)
      me.container.setDepth(me.y)
    }

    // throttle position sends to ~15/s and only when it actually changed
    this.sendAcc += delta
    const moved =
      Math.abs(me.x - this.lastSent.x) > 0.5 || Math.abs(me.y - this.lastSent.y) > 0.5
    if (this.sendAcc >= 66 && moved) {
      this.sendAcc = 0
      this.lastSent = { x: Math.round(me.x), y: Math.round(me.y) }
      this.socket.emit('lobby:move', this.lastSent)
    }
  }
}