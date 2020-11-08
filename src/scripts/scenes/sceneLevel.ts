import { sourceModel } from '../models/source'
import { Controls, SettingsModel } from '../models/settings'
import TypeGuardHelper from '../objects/_common/typeGuardHelper';

import Map from '../objects/map/map'
import Vehicle from '../objects/traffic/vehicle'
import Traffic from '../objects/traffic/traffic'
import Reward from '../objects/reward/reward';
import RewardHUD from '../objects/reward/hud';

export default class SceneLevel extends Phaser.Scene {
  private readonly city: {
    tileSprite?: Phaser.GameObjects.TileSprite;

    standartScale: number;
    moveSpeed: number;
  } = {
    standartScale: 1.35,
    moveSpeed: 0.25
  };

  private readonly hill: {
    tileSprite?: Phaser.GameObjects.TileSprite;

    standartScale: number;
    moveSpeed: number;
  } = {
    standartScale: 1.35,
    moveSpeed: 0.5
  };

  private readonly map: {
    object?: Map;

    chunkScale: number;

    moveSpeed: number;
  } = {
    chunkScale: 5,

    moveSpeed: -2.5
  };

  private menuSettings: SettingsModel;

  private player: Vehicle;
  private traffic: Traffic;

  private rewardModule?: Reward;
  private rewardHUD?: RewardHUD;

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'SceneLevel' });
  }

  private init(data: SettingsModel): void {
    this.menuSettings = data;
  }

  private create(): void {
    // -------------------------- Init background -------------------------- //
    //this.add.image(this.cameras.main.width * 0.5, 100, 'image_logo');

    this.city.tileSprite = 
      this.add.tileSprite(
        this.cameras.main.width * 0.5, 
        this.cameras.main.height * 0.35, 
        0, 
        0, 
        sourceModel.imageCity.mappingKey
      ).setScale(this.city.standartScale);
    
    this.hill.tileSprite = 
      this.add.tileSprite(
        this.cameras.main.width * 0.5, 
        this.cameras.main.height * 0.65, 
        0, 
        0, 
        sourceModel.imageHill.mappingKey
      ).setScale(this.hill.standartScale);
    
    // ----------------------------- Init map ----------------------------- //
    const roadChunkTex = this.textures.get(sourceModel.imageRoadStraight0.mappingKey).getSourceImage();

    this.map.object = new Map(
      this,
      0,
      0, 
      this.cameras.main.height * 0.85 - roadChunkTex.height * this.map.chunkScale,
      this.map.chunkScale
    );

    this.traffic = new Traffic(
      this,
      this.map.object
    );

    this.player = this.traffic.generateVehicle(this.menuSettings.vehicle, { from: 0, to: 0 }, [], false);
    
    this.traffic.attachPlayer(this.player);

    for(let i = 0; i < 3; ++i) {
      this.traffic.generateVehicle(
        Vehicle.getRandomVehicle().type, 
        { 
          from: 3, 
          to: this.map.object.getNumRoadChunks() - 1
        }, 
        [ this.player.getSprite() ] 
      );
    }

    this.rewardModule = new Reward(this, this.map.object, this.player, 5, 1.0, 5);
    this.rewardHUD = new RewardHUD(this, 0x000000, 38, 30);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.map.object.changeSpeed(-1.0);

    setInterval(() => {
      this.map.object?.changeSpeed(this.map.object.getSpeed() - 1);
    }, 1000);
  }

  public update(): void {
    if (this.menuSettings.controls === Controls.LEFT_RIGHT) {
      if (this.cursors?.left?.isDown) {
        this.player.turnLeft();
      } 
      else if (this.cursors?.right?.isDown) {
        this.player.turnRight();
      }
    } 
    else if(this.menuSettings.controls === Controls.UP_DOWN) {
      if (this.cursors?.up?.isDown) {
        this.player.turnLeft();
      } 
      else if (this.cursors?.down?.isDown) {
        this.player.turnRight();
      }
    }

    this.map.object?.move();

    this.rewardModule?.move();

    this.traffic?.move();

    if(this.city.tileSprite && TypeGuardHelper.isTileSprite(this.city.tileSprite)) {
      this.city.tileSprite.tilePositionX += 0.25;
    }
    if(this.hill.tileSprite && TypeGuardHelper.isTileSprite(this.hill.tileSprite)) {
      this.hill.tileSprite.tilePositionX += 0.5;
    }
  }
}
