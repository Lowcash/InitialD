import { Range } from '../objects/common'
import { Map } from '../objects/map'
import { Vehicle, vehicles, VehicleType } from '../objects/vehicle'

export default class MainScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  private backgroundCity?: Phaser.GameObjects.TileSprite;
  private explosion: Phaser.Physics.Arcade.Sprite;

  private player: Vehicle;
  private map: Map;
  private traffic: Array<Vehicle> = [];

  private readonly chunkSize: number = 36;
  private readonly objectScale: number = 5;

  private readonly emmitter = new Phaser.Events.EventEmitter();

  private readonly playerVehicle = vehicles[VehicleType.EVO_3];
  private readonly trafficVehicles = [
    vehicles[VehicleType.AE_86_TRUENO],
    vehicles[VehicleType._180_SX]
  ];

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
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

    this.player = new Vehicle(
      this,
      this.map,
      {
        from: 1,
        to: 1
      },
      1,
      this.objectScale, 
      this.playerVehicle.type
    );
    
    this.traffic.push(
      new Vehicle(
        this, 
        this.map,
        6,
        Phaser.Math.Between(0, this.map.getRoadChunkLanes(0) - 1),
        this.objectScale,
        this.trafficVehicles[0].type
      ), 
      new Vehicle(
        this, 
        this.map,
        6,
        Phaser.Math.Between(0, this.map.getRoadChunkLanes(0) - 1),
        this.objectScale,
        this.trafficVehicles[1].type
      )
    );
    
    const position = this.player.getPosition();

    this.explosion = 
      this.physics.add.sprite(position.x, position.y, 'sprite_explosion')
        .setScale(2.5)
        .setDepth(5)
        .setVisible(false);

    this.anims.create({
        key: 'explosion',
        frames: this.anims.generateFrameNumbers('sprite_explosion', { }),
        frameRate: 30,
        repeat: 1,
        hideOnComplete: true
    });

    //this.add.image(this.cameras.main.width * 0.5, 100, 'image_logo');

    this.cursors = this.input.keyboard.createCursorKeys();

    this.traffic.forEach(v => {
      v.slowDown(-350.0);
    });

    this.traffic.forEach(v => {
        this.physics.add.overlap(this.player.getSprite(), v.getSprite(), () => {
          if(this.player.getLane() == v.getLane()) {
            const playerPosition = this.player.getPosition();

            this.explosion
            .setPosition(playerPosition.x, playerPosition.y)
            .setVisible(true);

            this.explosion.anims.play('explosion', true);
          }
        });
    });
  }

  update() {
    if (this.cursors?.left?.isDown) {
      this.player.turnLeft();
    } 
    else if (this.cursors?.right?.isDown) {
      this.player.turnRight();
    }

    this.map.moveMap(-10.0);

    if(this.backgroundCity) {
      this.backgroundCity.tilePositionX += 0.25;
    }

    this.traffic.forEach((v, idx, obj) => {
      if(v.getPosition().x < 0) {
        v.destroy();

        obj.splice(idx, 1);

        const newRndVehicle = new Vehicle(
          this, 
          this.map,
          9,
          Phaser.Math.Between(0, this.map.getRoadChunkLanes(0) - 1),
          this.objectScale,
          Phaser.Math.Between(0, this.trafficVehicles.length - 1)
        );
          
        newRndVehicle.slowDown(-350);
        
        this.physics.add.overlap(this.player.getSprite(), newRndVehicle.getSprite(), () => {
          if(this.player.getLane() == newRndVehicle.getLane()) {
            const playerPosition = this.player.getPosition();

            this.explosion
            .setPosition(playerPosition.x, playerPosition.y)
            .setVisible(true);
            
            this.explosion.anims.play('explosion', true);
          }
        });

        this.traffic.push(newRndVehicle);
      }
    });
  }
}
