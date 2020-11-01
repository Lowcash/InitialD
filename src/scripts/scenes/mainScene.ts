import { Map } from '../objects/map'
import { Vehicle } from '../objects/vehicle'

export default class MainScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  private backgroundCity?: Phaser.GameObjects.TileSprite;

  private player: Vehicle;
  private map: Map;
  private enemy: Vehicle;

  private readonly chunkSize: number = 36;
  private readonly roadHeight: number = 18;
  private readonly objectScale: number = 5;

  private readonly emmitter = new Phaser.Events.EventEmitter();

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    this.backgroundCity = 
      this.add.tileSprite(this.cameras.main.width * 0.5, this.cameras.main.height * 0.5, 0, 0, 'image_city')
        .setScale(1.35);

    const sceneStartHeight: number = this.cameras.main.height / 4;;

    this.map = new Map(this, this.objectScale, 0, sceneStartHeight);
    this.enemy = new Vehicle(this, this.objectScale, 'vehicle_civic', 2.5 * this.chunkSize * this.objectScale, sceneStartHeight + 2.49 * this.roadHeight * this.objectScale);
    this.player = new Vehicle(this, this.objectScale, 'vehicle_evo_3', 0.5 * this.chunkSize * this.objectScale, sceneStartHeight + 0.49 * this.roadHeight * this.objectScale);

    this.add.image(this.cameras.main.width * 0.5, 100, 'image_logo');

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (this.cursors?.left?.isDown) {
      this.player.turnLeft();
    } 
    else if (this.cursors?.right?.isDown) {
      this.player.turnRight();
    } 
    else {
      this.player.gasgasgas();
    }

    this.map.moveMap(-5.0);

    if(this.backgroundCity) {
      this.backgroundCity.tilePositionX += 0.25;
    }
    
    this.player.adjustVehicleByChunk(this.map.getActualChunk());
    this.enemy.adjustVehicleByChunk(this.map.getActualChunk());
  }
}
