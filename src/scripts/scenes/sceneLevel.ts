import { Range, SpriteMapping } from '../objects/common'

import { isTileSprite, isSprite } from '../objects/typeGuardHelper'

import { Map } from '../objects/map'
import { Traffic, Vehicle, vehicles, VehicleType } from '../objects/vehicle'
import '../objects/reward'
import { Reward, RewardHUD } from '../objects/reward';

export default class SceneLevel extends Phaser.Scene {
  private readonly objectScale: number = 5;
  
  private readonly playerVehicle = VehicleType.EVO_3;
  private readonly trafficVehicles = [
    VehicleType.AE_86_TRUENO,
    // VehicleType._180_SX,
    // VehicleType.CIVIC,
    // VehicleType.AE_86_LEVIN,
    // VehicleType.RX_7_FC,
    // VehicleType.RX_7_FD,
    // VehicleType.R_32,
    // VehicleType.S_13
  ];

  private readonly city: SpriteMapping = {
    key: 'city',
    mappingKey: 'image_city'
  };

  private readonly hill: SpriteMapping = {
    key: 'hill',
    mappingKey: 'image_hill'
  };

  private map: Map;

  private player: Vehicle;
  private traffic: Traffic;

  private rewardModule?: Reward;
  private rewardHUD?: RewardHUD;

  private trafficV: Array<Vehicle> = [];

  private availableLanes: Array<number> = [];

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'SceneLevel' });
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

    // ----------------------------- Init map ----------------------------- //
    this.map = new Map(
      this, 
      0, 
      this.cameras.main.height - this.textures.get('image_road_straight').getSourceImage().height * this.objectScale,
      this.objectScale
    );

    this.traffic = new Traffic(
      this,
      this.map
    );

    this.player = this.traffic.generateVehicle(this.playerVehicle, { from: 0, to: 0 });
    
    this.traffic.attachPlayer(this.player);

    for (const v of this.trafficVehicles) {
      const tVehicle = this.traffic.generateVehicle(
        v, 
        { 
          from: 3, 
          to: this.map.getNumRoadChunks() - 1
        }, 
        [ this.player.getSprite() ] 
      );

      tVehicle.slowDown(Phaser.Math.Between(vehicles[v].speed.from, vehicles[v].speed.to));
    }

    //this.rewardModule = new Reward(this, this.map, this.player, 5, 1.0, 5);
    this.rewardHUD = new RewardHUD(this, 0x000000, 38, 30);

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (this.cursors?.left?.isDown) {
      this.player.turnLeft();
    } 
    else if (this.cursors?.right?.isDown) {
      this.player.turnRight();
    }
    
    this.map.moveMap(-5.0);

    this.rewardModule?.slowDown(5.0);

    this.updateBackground();
  }

  updateBackground() {
    if(this.city.sprite && isTileSprite(this.city.sprite)) {
      this.city.sprite.tilePositionX += 0.25;
    }
    if(this.hill.sprite && isTileSprite(this.hill.sprite)) {
      this.hill.sprite.tilePositionX += 0.5;
    }
  }
}
