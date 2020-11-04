import { Range, SpriteMapping, isSprite, isTileSprite } from '../objects/common'

import { Map } from '../objects/map'
import { Vehicle, vehicles, VehicleType, getRandomSpeed } from '../objects/vehicle'
import '../objects/reward'
import { Reward, RewardHUD } from '../objects/reward';

export default class MainScene extends Phaser.Scene {
  private readonly objectScale: number = 5;
  
  //private readonly emmitter = new Phaser.Events.EventEmitter();

  private readonly playerVehicle = vehicles[VehicleType.EVO_3];
  private readonly trafficVehicles = [
    vehicles[VehicleType.AE_86_TRUENO],
    vehicles[VehicleType._180_SX],
    vehicles[VehicleType.CIVIC],
    vehicles[VehicleType.AE_86_LEVIN],
    vehicles[VehicleType.RX_7_FC],
    vehicles[VehicleType.RX_7_FD],
    vehicles[VehicleType.R_32],
    vehicles[VehicleType.S_13]
  ];

  private readonly city: SpriteMapping = {
    key: 'city',
    mappingKey: 'image_city'
  };

  private readonly hill: SpriteMapping = {
    key: 'hill',
    mappingKey: 'image_hill'
  };

  private readonly explosion: SpriteMapping = {
    key: 'explosion',
    mappingKey: 'sprite_explosion'
  };

  private map: Map;
  private rewardModule: Reward;
  private rewardHUD: RewardHUD;

  private player: Vehicle;
  private traffic: Array<Vehicle> = [];

  private availableLanes: Array<number> = [];

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    // -------------------------- Init background -------------------------- //
    this.city.sprite = 
      this.add.tileSprite(
        this.cameras.main.width * 0.5, 
        this.cameras.main.height * 0.35, 
        0, 
        0, 
        this.city.mappingKey
      ).setScale(1.35);
    
    this.hill.sprite = 
      this.add.tileSprite(
        this.cameras.main.width * 0.5, 
        this.cameras.main.height * 0.65, 
        0, 
        0, 
        this.hill.mappingKey
      ).setScale(1.35);
    
    this.add.image(this.cameras.main.width * 0.5, 100, 'image_logo');
    
    // ------------------------ Init sprites/anims ------------------------ //
    this.explosion.sprite = 
      this.physics.add.sprite(0, 0, this.explosion.mappingKey)
        .setScale(2.5)
        .setDepth(5)
        .setVisible(false);

    this.anims.create({
        key: this.explosion.key,
        frames: this.anims.generateFrameNumbers(this.explosion.mappingKey, { }),
        frameRate: 30,
        repeat: 0,
        hideOnComplete: true
    });

    // ----------------------------- Init map ----------------------------- //
    this.map = new Map(
      this, 
      0, 
      this.cameras.main.height - this.textures.get('image_road_straight').getSourceImage().height * this.objectScale,
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
    
    this.rewardModule = new Reward(this, this.map, this.player, 5, 1.0, 5);
    this.rewardHUD = new RewardHUD(this, 0x000000, 38, 30);

    const generatedRoadChunks = this.map.getNumRoadChunks();

    const numAvailableLanes = 
      this.map.getNumRoadChunkLanes(
      generatedRoadChunks - 1
      );

    for (let i = 0; i < numAvailableLanes; ++i) {
      this.availableLanes.push(i);

      this.generateTrafficVehicle({from: 5, to: generatedRoadChunks - 1});
    }

    for (const t of this.traffic) {
      this.physics.add.overlap(this.player.getSprite(), t.getSprite(), () => {this.handleVehicleCollision(this.player, t)
      });
    }

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  handleVehicleCollision(player: Vehicle, traffic: Vehicle) {
    if(!player.getIsTurning() && player.getLane() === traffic.getLane()) {
      if (this.explosion?.sprite && isSprite(this.explosion.sprite)) {
        const playerPosition = this.player.getPosition();

        this.explosion.sprite
          .setPosition(playerPosition.x, playerPosition.y)
          .setVisible(true)
          .anims.play(this.explosion.key, true);
      }
    }
  }

  update() {
    if (this.cursors?.left?.isDown) {
      this.player.turnLeft();
    } 
    else if (this.cursors?.right?.isDown) {
      this.player.turnRight();
    }

    this.traffic.forEach(t => t.slowDown(5));

    this.map.moveMap(-5.0);
    this.rewardModule.slowDown(5.0);

    this.updateBackground();

    this.traffic.forEach((t, idx, obj) => {
      if(t.getPosition().x < -(t.getSprite().width * t.getSprite().scale)) {
        this.availableLanes.push(t.getLane());

        t.destroy();
        
        obj.splice(idx, 1);

        this.generateTrafficVehicle({from: 9, to: this.map.getNumRoadChunks() - 1});
      }
    });
  }

  updateBackground() {
    if(this.city && isTileSprite(this.city)) {
      this.city.tilePositionX += 0.25;
    }
    if(this.hill && isTileSprite(this.hill)) {
      this.hill.tilePositionX += 0.5;
    }
  }

  generateTrafficVehicle(range: Range) {
    const vehicleType = this.trafficVehicles[Phaser.Math.Between(0, this.trafficVehicles.length - 1)];

    const availiableLaneIdx = Phaser.Math.Between(0, this.availableLanes.length - 1);
    const vehicleLane = this.availableLanes[availiableLaneIdx];

    this.availableLanes.splice(availiableLaneIdx, 1);

    const trafficVehicle = new Vehicle(
      this, 
      this.map,
      range,
      vehicleLane,
      this.objectScale,
      vehicleType.type
    );

    trafficVehicle.slowDown((500 - getRandomSpeed(vehicles[vehicleType.type])));
    
    this.physics.add.overlap(this.player.getSprite(), trafficVehicle.getSprite(), () => {
      this.handleVehicleCollision(this.player, trafficVehicle)
    });

    this.traffic.push(trafficVehicle);
  }
}
