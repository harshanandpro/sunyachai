import Phaser from 'phaser'
import BootScene from './scenes/BootScene.js'

export function createBridgeGame(parent) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 540,
    pixelArt: true,
    backgroundColor: '#0a0f24',
    scene: [BootScene],
  })
}