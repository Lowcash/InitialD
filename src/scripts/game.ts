import 'phaser'
import PreloadMenu from './scenes/preloadMenu'
import SceneMenu from './scenes/sceneMenu'
import PreloadLevel from './scenes/preloadLevel'
import SceneLevel from './scenes/sceneLevel'

const DEFAULT_WIDTH = 1280
const DEFAULT_HEIGHT = 800

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#ffffff',
  scale: {
    parent: 'initial-d-game',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT
  },
  scene: [PreloadMenu, SceneMenu, PreloadLevel, SceneLevel],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { }
    }
  }
}

export default new Phaser.Game(config)
