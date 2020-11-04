export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
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
    this.load.image('image_road_down_0', 'assets/img/road_down_0.png');

    this.load.bitmapFont('font', 'assets/img/font.png', 'assets/img/font.xml');

    this.load.audio('sound_coin_earned', 'assets/img/sfx_coin_double1.wav');
  }

  create() {
    this.scene.start('MainScene');

    /**
     * This is how you would dynamically import the mainScene class (with code splitting),
     * add the mainScene to the Scene Manager
     * and start the scene.
     * The name of the chunk would be 'mainScene.chunk.js
     * Find more about code splitting here: https://webpack.js.org/guides/code-splitting/
     */
    // let someCondition = true
    // if (someCondition)
    //   import(/* webpackChunkName: "mainScene" */ './mainScene').then(mainScene => {
    //     this.scene.add('MainSgimcene', mainScene.default, true)
    //   })
    // else console.log('The mainScene class will not even be loaded by the browser')
  }
}
