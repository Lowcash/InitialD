import { Map } from '../objects/map'

export default class MainScene extends Phaser.Scene {
  private map: Map;

  private backgroundCity?: Phaser.GameObjects.TileSprite;

  private player?: Phaser.Physics.Arcade.Sprite;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    this.backgroundCity = this.add.tileSprite(this.cameras.main.width * 0.5, this.cameras.main.height * 0.5, 0, 0, 'image_city');

    this.map = new Map(this, 5);

    this.add.image(this.cameras.main.width * 0.5, 100, 'image_logo');
    
    this.player = 
      this.physics.add.sprite(50, this.cameras.main.height * 0.5, 'atlas_vehicles')
        .setScale(5)
        .setOrigin(0);

    //this.road?.remove(roadStraight);
  }

  update() {
    //this.map.moveMap(-1.5);
  }
}
