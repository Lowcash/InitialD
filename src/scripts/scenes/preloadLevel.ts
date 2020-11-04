export default class PreloadLevel extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadLevel' })
  }

  preload() {
    this.load.image('image_logo', 'assets/img/logo.png');
    this.load.image('image_city', 'assets/img/city.jpg');
    this.load.image('image_hill', 'assets/img/hills_0.png');

    this.load.atlas(
      'atlas_vehicles',
      'assets/img/vehicle_atlas_mapping.png',
      'assets/img/vehicle_atlas_mapping.json'
    );

    this.load.spritesheet(
      'sprite_explosion',
      'assets/img/explosion.png',
      {
        frameWidth: 64,
        frameHeight: 64
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

    this.load.audio('sound_coin_earned', 'assets/img/sfx_coin_double1.wav');
  }

  create() {
    this.scene.start('SceneLevel');
  }
}
