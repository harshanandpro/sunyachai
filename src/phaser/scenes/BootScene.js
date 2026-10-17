import Phaser from 'phaser'

// Placeholder until gameplay lands in a later step.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot')
  }

  create() {
    this.add
      .text(480, 270, 'Bridge the Gap\ngame world coming soon', {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#7fe7ff',
        align: 'center',
      })
      .setOrigin(0.5)
  }
}