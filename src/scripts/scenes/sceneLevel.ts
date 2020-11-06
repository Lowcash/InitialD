import { SpriteMapping } from '../objects/common'

import { isTileSprite } from '../objects/typeGuardHelper'

import { Map } from '../objects/map'
import { Traffic, Vehicle, VehicleType } from '../objects/traffic'
import '../objects/reward'
import { Reward, RewardHUD } from '../objects/reward';

export default class SceneLevel extends Phaser.Scene {
  private readonly objectScale: number = 5;
  
  private readonly playerVehicle = VehicleType.EVO_3;

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
      0,
      this.cameras.main.height - this.textures.get('image_road_straight').getSourceImage().height * this.objectScale,
      this.objectScale,
      10
    );

    this.traffic = new Traffic(
      this,
      this.map
    );

    this.player = this.traffic.generateVehicle(this.playerVehicle, { from: 0, to: 0 }, [], false);
    
    this.traffic.attachPlayer(this.player);

    for(let i = 0; i < 3; ++i) {
      this.traffic.generateVehicle(
        this.traffic.getRandomVehicle().type, 
        { 
          from: 3, 
          to: this.map.getNumRoadChunks() - 1
        }, 
        [ this.player.getSprite() ] 
      );
    }

    this.rewardModule = new Reward(this, this.map, this.player, 5, 1.0, 5);
    this.rewardHUD = new RewardHUD(this, 0x000000, 38, 30);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.map.changeSpeed(-1.0);

    setInterval(() => {
      this.map.changeSpeed(this.map.getSpeed() - 1);
    }, 1000);
  }

  update() {
    if (this.cursors?.left?.isDown) {
      this.player.turnLeft();
    } 
    else if (this.cursors?.right?.isDown) {
      this.player.turnRight();
    }

    this.map?.move();

    this.rewardModule?.move();

    this.traffic?.move();

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
