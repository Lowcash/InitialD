export default class PreloadLevel extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadLevel' })
  }

  preload() {
    this.load.atlas(
      'atlas_vehicles',
      'assets/img/vehicle_atlas_mapping.png',
      'assets/img/vehicle_atlas_mapping.json'
    );

    this.load.spritesheet(
      'sprite_explosion',
      'assets/img/explosion.png',
      {
        frameWidth: 17,
        frameHeight: 17
      }
    );
    
    this.load.spritesheet(
      'sprite_coin',
      'assets/img/coin.png',
      {
        frameWidth: 32,
        frameHeight: 32
      }
    );

    this.load.image('image_road_straight', 'assets/img/road_straight_1.png');

    this.load.bitmapFont('font', 'assets/img/font.png', 'assets/img/font.xml');

    this.load.audio('sound_coin_earned', 'assets/sound/coin.wav');
    this.load.audio('sound_explosion', 'assets/sound/explosion.wav');
  }

  create() {
    this.scene.start('SceneLevel',);
  }
}
