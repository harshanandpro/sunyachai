import Phaser from 'phaser'
import LobbyScene from './scenes/LobbyScene.js'

export function createLobbyGame(parent, socket, myId) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 540,
    pixelArt: true,
    backgroundColor: '#0a0f24',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [LobbyScene],
    callbacks: {
      preBoot: (game) => {
        game.registry.set('socket', socket)
        game.registry.set('myId', myId)
      },
    },
  })
}