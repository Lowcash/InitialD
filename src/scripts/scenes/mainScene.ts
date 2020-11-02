import { Map } from '../objects/map'
import { Vehicle, vehicles, VehicleType } from '../objects/vehicle'

export default class MainScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  private backgroundCity?: Phaser.GameObjects.TileSprite;

  private playerVehicle: Vehicle;
  private map: Map;
  private trafficVehicle: Vehicle;

  private readonly chunkSize: number = 36;
  private readonly objectScale: number = 5;

  private readonly emmitter = new Phaser.Events.EventEmitter();

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    const playerVehicle = vehicles[VehicleType.EVO_3];
    const trafficVehicle = vehicles[VehicleType.AE_86_TRUENO];

    const mapStartX = 0;
    const mapStartY = this.cameras.main.height - this.chunkSize * this.objectScale;

    this.backgroundCity = 
      this.add.tileSprite(
        this.cameras.main.width * 0.5, 
        this.cameras.main.height * 0.35, 
        0, 
        0, 
        'image_city'
      ).setScale(1.35);

    this.map = new Map(
      this, 
      mapStartX, 
      mapStartY,
      this.objectScale
    );

    this.playerVehicle = new Vehicle(
      this,
      this.map,
      0,
      this.objectScale, 
      playerVehicle.type
    );
    
    this.trafficVehicle = new Vehicle(
      this, 
      this.map,
      1,
      this.objectScale,
      trafficVehicle.type
    );

    //this.add.image(this.cameras.main.width * 0.5, 100, 'image_logo');

    this.cursors = this.input.keyboard.createCursorKeys();

    //this.enemy.slowDown(-50.0);
  }

  update() {
    if (this.cursors?.left?.isDown) {
      this.playerVehicle.turnLeft();
    } 
    else if (this.cursors?.right?.isDown) {
      this.playerVehicle.turnRight();
    }

    this.map.moveMap(-5.0);

    // if(this.backgroundCity) {
    //   this.backgroundCity.tilePositionX += 0.25;
    // }
  }
}
