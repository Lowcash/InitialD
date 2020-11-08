import { sourceModel } from '../models/source'
import { Controls, SettingsModel } from '../models/settings'
import TypeGuardHelper from '../objects/_common/typeGuardHelper';

import BackgroundTileSprite, { BackgroundTileSpriteMapping } from '../objects/tilesprites/tilesprite'
import { HUDFrameSettings } from '../objects/HUD';

import Map from '../objects/map/map'
import Vehicle from '../objects/traffic/vehicle'
import Traffic from '../objects/traffic/traffic'
import Reward from '../objects/reward/reward';
import RewardHUD from '../objects/reward/hud';
import { LayerIDX } from '../objects/_common/common';

export default class SceneLevel extends Phaser.Scene {
  private readonly city: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageCity.mappingKey,
    bottomOffsetMult: 0.35,
    moveSpeed: 0.25,
    depth: 0
  };

  private readonly hill: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageHill.mappingKey,
    bottomOffsetMult: 0.65,
    moveSpeed: 0.5,
    depth: 0
  };

  private readonly clouds: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageClouds.mappingKey,
    bottomOffsetMult: 0.12,
    innerScale: 1.25,
    moveSpeed: 0.25,
    depth: 10
  };

  private readonly nearForest: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageForest.mappingKey,
    moveSpeed: 1.0,
    innerScale: 1.3,
    depth: 10,
    origin: new Phaser.Math.Vector2(0.5, 1.0)
  };

  private readonly farForest: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageForest.mappingKey,
    bottomOffsetMult: 0.72,
    moveSpeed: 1.0,
    innerScale: 0.7,
    origin: new Phaser.Math.Vector2(0.5, 1.0),
    depth: 8
  };

  private readonly farthestForest: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageForest.mappingKey,
    bottomOffsetMult: 0.72,
    moveSpeed: 1.0,
    innerScale: 0.5,
    origin: new Phaser.Math.Vector2(0.5, 1.0),
    depth: 7
  };

  private readonly map: {
    object?: Map;

    screenOffsetMult?: Phaser.Math.Vector2;

    startNumChunks: number;

    moveSpeed: number;

    depth: number;
  } = {
      depth: 9,
      screenOffsetMult: new Phaser.Math.Vector2(0, 1),
      startNumChunks: 5,
      moveSpeed: -1.0
    };
  
  private readonly reward: {
    object?: Reward;
    hud?: RewardHUD;

    startNumCoins: number;
    zeroPadding: number;
  } & HUDFrameSettings = {
    fontSize: 38,
    textPadding: 30,

    startNumCoins: 5,
    zeroPadding: 6
  };

  private menuSettings: SettingsModel;

  private player: Vehicle;
  private traffic: Traffic;
  
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'SceneLevel' });
  }

  private init(data: SettingsModel): void {
    this.menuSettings = data;
  }

  private create(): void {
    this.prepareBackground();
    this.prepareMap();
    this.prepareReward();
    this.prepareTraffic();

    this.map.object?.changeSpeed(this.map.moveSpeed)
    
    // for(let i = 0; i < 3; ++i) {
    //   this.traffic.generateVehicle(
    //     Vehicle.getRandomVehicle().type, 
    //     { 
    //       from: 3, 
    //       to: this.map.object.getNumRoadChunks() - 1
    //     }, 
    //     [ this.player.getSprite() ] 
    //   );
    // }

    this.cursors = this.input.keyboard.createCursorKeys();

    // this.map.object.changeSpeed(-1.0);

    // setInterval(() => {
    //   this.map.object?.changeSpeed(this.map.object.getSpeed() - 1);
    // }, 1000);
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

    this.city.tileSprite?.move();
    this.hill.tileSprite?.move();
    this.nearForest.tileSprite?.move();
    this.farForest.tileSprite?.move();
    this.clouds.tileSprite?.move();
    this.farthestForest.tileSprite?.move();
    this.map.object?.move();
    this.reward.object?.move();
    this.traffic?.move();
  }

  private prepareReward(): void {
    if (this.map.object && this.player) {
      this.reward.object = new Reward(
        this, 
        this.map.object, 
        this.player,
        LayerIDX.GUI, 
        10.0, 
        this.reward.startNumCoins
      );
    }
    

    this.reward.hud = new RewardHUD(
      this, 
      0x000000,
      this.reward.fontSize, 
      this.reward.textPadding,
      this.reward.zeroPadding
    );
  }

  private prepareTraffic(): void {
    if (this.map.object) {
      this.traffic = new Traffic(
        this,
        this.map.object
      );

      this.player = this.traffic.generateVehicle(this.menuSettings.vehicle, 0, [], false);

      this.traffic.attachPlayer(this.player);
    }
  }

  private prepareMap(): void {
    this.map.object = new Map(
      this,
      this.map.depth,
      this.cameras.main.width * this.map.screenOffsetMult!.x ?? 1,
      this.cameras.main.height * this.map.screenOffsetMult!.y ?? 1,
      this.map.startNumChunks
    );
  }

  private prepareBackground(): void {
    //this.add.image(this.cameras.main.centerX, 100, sourceModel.imageLogo.mappingKey);

    this.city.tileSprite =
      new BackgroundTileSprite(
        this,
        this.city.mappingKey,
        this.city.moveSpeed,
        this.city.outerScale,
        this.city.innerScale,
        this.city.depth,
        this.city.origin,
        this.city.bottomOffsetMult
      );

    this.hill.tileSprite =
      new BackgroundTileSprite(
        this,
        this.hill.mappingKey,
        this.hill.moveSpeed,
        this.hill.outerScale,
        this.hill.innerScale,
        this.hill.depth,
        this.hill.origin,
        this.hill.bottomOffsetMult
      );

    this.clouds.tileSprite =
      new BackgroundTileSprite(
        this,
        this.clouds.mappingKey,
        this.clouds.moveSpeed,
        this.clouds.outerScale,
        this.clouds.innerScale,
        this.clouds.depth,
        this.clouds.origin,
        this.clouds.bottomOffsetMult
      );

    this.nearForest.tileSprite =
      new BackgroundTileSprite(
        this,
        this.nearForest.mappingKey,
        this.nearForest.moveSpeed,
        this.nearForest.outerScale,
        this.nearForest.innerScale,
        this.nearForest.depth,
        this.nearForest.origin,
        this.nearForest.bottomOffsetMult
      );

    this.farForest.tileSprite =
      new BackgroundTileSprite(
        this,
        this.farForest.mappingKey,
        this.farForest.moveSpeed,
        this.farForest.outerScale,
        this.farForest.innerScale,
        this.farForest.depth,
        this.farForest.origin,
        this.farForest.bottomOffsetMult
      );

    this.farthestForest.tileSprite =
      new BackgroundTileSprite(
        this,
        this.farthestForest.mappingKey,
        this.farthestForest.moveSpeed,
        this.farthestForest.outerScale,
        this.farthestForest.innerScale,
        this.farthestForest.depth,
        this.farthestForest.origin,
        this.farthestForest.bottomOffsetMult
      );
  }
}
