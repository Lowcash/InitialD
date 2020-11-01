export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {
    this.load.image('image_logo', 'assets/img/logo.png');
    this.load.image('image_city', 'assets/img/city.jpg');

    this.load.atlas('atlas_vehicles', 'assets/img/vehicle_atlas_mapping.png', 'assets/img/vehicle_atlas_mapping.json');

    this.load.image('image_road_straight', 'assets/img/road_straight.png');
    this.load.image('image_road_down_0', 'assets/img/road_down_0.png');
    this.load.image('image_road_down_1', 'assets/img/road_down_1.png');
    this.load.image('image_road_down_2', 'assets/img/road_down_2.png');
    this.load.image('image_road_up_0', 'assets/img/road_up_0.png');
    this.load.image('image_road_up_1', 'assets/img/road_up_1.png');
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
