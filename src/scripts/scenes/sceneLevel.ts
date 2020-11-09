import fs from 'fs'

import { sourceModel } from '../models/source'
import Common from '../objects/_common/common'
import { Controls, ControlState, DeviceType, SettingsModel } from '../models/settings'
import TypeGuardHelper from '../objects/_common/typeGuardHelper';

import BasicButton, { BasicButtonMapping } from '../objects/buttons/basicButton';
import BackgroundTileSprite, { BackgroundTileSpriteMapping } from '../objects/tilesprites/backgroundTileSprite'
import { HUDFrameSettings } from '../objects/HUD';

import Map from '../objects/map/map'
import Vehicle from '../objects/traffic/vehicle'
import Traffic from '../objects/traffic/traffic'
import Reward from '../objects/reward/reward';
import RewardHUD from '../objects/reward/hud';
import { LayerIDX } from '../objects/_common/common';
import BackgroundTileSpriteExtended from '../objects/tilesprites/backgroundTileSpriteExtended';

export default class SceneLevel extends Phaser.Scene {
  private readonly city: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageCity.mappingKey,
    screenOffsetMult: new Phaser.Math.Vector2(0.5, 0.35),
    moveSpeed: -0.25,
    depth: 0
  };

  private readonly hill: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageHill.mappingKey,
    screenOffsetMult: new Phaser.Math.Vector2(0.5, 0.65),
    moveSpeed: -0.5,
    depth: 0
  };

  private readonly clouds: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageClouds.mappingKey,
    screenOffsetMult: new Phaser.Math.Vector2(0.5, 0.12),
    moveSpeed: -0.25,
    innerScale: 1.25,
    depth: 10
  };

  private readonly nearForest: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageForest.mappingKey,
    moveSpeed: -1.0,
    innerScale: 1.3,
    depth: 50,
    origin: new Phaser.Math.Vector2(0.5, 1.0)
  };

  private readonly farForest: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageForest.mappingKey,
    screenOffsetMult: new Phaser.Math.Vector2(0.5, 0.72),
    moveSpeed: -1.0,
    innerScale: 0.7,
    origin: new Phaser.Math.Vector2(0.5, 1.0),
    depth: 8
  };

  private readonly farthestForest: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageForest.mappingKey,
    screenOffsetMult: new Phaser.Math.Vector2(0.5, 0.72),
    moveSpeed: -1.0,
    innerScale: 0.5,
    origin: new Phaser.Math.Vector2(0.5, 1.0),
    depth: 7
  };

  private readonly controls: {
    lButton: BasicButtonMapping;
    rButton: BasicButtonMapping;

    screenOffsetMult?: Phaser.Math.Vector2;

    group?: Phaser.GameObjects.Group;
  } = {
      lButton: {
        mappingKey: sourceModel.spriteArrowsPlay.mappingKey,
        standartScale: 1.0,
        actionScale: 1.15,
        depth: LayerIDX.GUI
      },
      rButton: {
        mappingKey: sourceModel.spriteArrowsPlay.mappingKey,
        standartScale: 1.0,
        actionScale: 1.15,
        depth: LayerIDX.GUI
      },

      screenOffsetMult: new Phaser.Math.Vector2(0.8, 0.8)
    };
  
  private readonly gameover: BasicButtonMapping = {
    mappingKey: sourceModel.spriteGameOverStart.mappingKey,
    depth: LayerIDX.GUI,
    
    screenOffsetMult: new Phaser.Math.Vector2(0.5, 0.5)
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
      startNumChunks: 6,
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
      color: 0x000000,

      startNumCoins: 5,
      zeroPadding: 6
    };

  private menuSettings: SettingsModel;

  private player: Vehicle;
  private traffic: Traffic;

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  
  private speedUpFunction: any;
  private isGameOver: boolean = false;

  constructor() {
    super({ key: 'SceneLevel' });
  }

  private init(data: SettingsModel): void {
    this.menuSettings = data;
  }

  private create(): void {
    this.prepareBackground();
    this.prepareMap();
    this.prepareTraffic();
    this.prepareReward();
    this.prepareGameOver();

    if (this.menuSettings.deviceType === DeviceType.MOBILE) {
      this.prepareControls();
    }

    this.map.object?.changeSpeed(this.map.moveSpeed);

    for (let i = 0; i < 3; ++i) {
      this.traffic.generateVehicle(
        Vehicle.getRandomVehicle().type,
        {
          from: 1,
          to: (this.map.object?.getNumRoadChunks() ?? 2) - 1
        },
        [this.player.getSprite()],
        9
      );
    }

    this.cursors = this.input.keyboard.createCursorKeys();

    // this.map.object.changeSpeed(-1.0);

    this.speedUpFunction = setInterval(() => {
      this.map.object?.changeSpeed(this.map.object.getSpeed() - 1);
    }, 1000);

    this.events.on('onPlayerCollided', (id: string) => {
      this.handlePlayerCollided(id);
    });
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
    else if (this.menuSettings.controls === Controls.UP_DOWN) {
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

  private prepareGameOver(): void {
    this.gameover.button = new BasicButton(
      this,
      new Phaser.Math.Vector2(
        this.cameras.main.width * (this.gameover.screenOffsetMult?.x ?? 1),
        this.cameras.main.height * (this.gameover.screenOffsetMult?.y ?? 1),
      ),
      sourceModel.spriteGameOverStart.mappingKey,
      this.gameover.depth,
      undefined,
      undefined,
      sourceModel.soundButton.mappingKey
    );

    this.gameover.button.setVisible(false);
  }

  private prepareControls(): void {
    const arrowTex = this.textures.get(sourceModel.spriteArrowsPlay.mappingKey);

    const arrowWidth = arrowTex.getSourceImage().width / arrowTex.frameTotal;

    this.controls.lButton.button = new BasicButton(
      this,
      new Phaser.Math.Vector2(
        this.menuSettings.controls === Controls.LEFT_RIGHT ? -arrowWidth : 0,
        this.menuSettings.controls === Controls.UP_DOWN ? -arrowWidth : 0,
      ),
      sourceModel.spriteArrowsPlay.mappingKey,
      this.controls.lButton.depth,
      undefined,
      this.menuSettings.controls === Controls.UP_DOWN ? 90 : undefined,
      sourceModel.soundButton.mappingKey
    );

    this.controls.rButton.button = new BasicButton(
      this,
      new Phaser.Math.Vector2(
        this.menuSettings.controls === Controls.LEFT_RIGHT ? arrowWidth : 0,
        this.menuSettings.controls === Controls.UP_DOWN ? arrowWidth : 0,
      ),
      sourceModel.spriteArrowsPlay.mappingKey,
      this.controls.rButton.depth,
      undefined,
      this.menuSettings.controls === Controls.UP_DOWN ? -90 : 180,
      sourceModel.soundButton.mappingKey
    );
    
    this.controls.group = this.add.group();

    this.controls.group?.add(this.controls.lButton.button);
    this.controls.group?.add(this.controls.rButton.button);

    this.controls.group?.incXY(
      this.cameras.main.width * this.controls.screenOffsetMult!.x ?? 1,
      this.cameras.main.height * this.controls.screenOffsetMult!.y ?? 1
    );

    this.controls.lButton.button?.setFrame(ControlState.PENDING);
    this.controls.rButton.button?.setFrame(ControlState.PENDING);

    this.controls.lButton.button?.on('pointerdown', this.handlePressedLControlButton, this);
    this.controls.rButton.button?.on('pointerdown', this.handlePressedRControlButton, this);

    this.controls.lButton.button?.on('pointerup', this.handleUnPressedLControlButton, this);
    this.controls.rButton.button?.on('pointerup', this.handleUnPressedRControlButton, this);
  }

  private handlePlayerCollided(id: string): void {
    if (!this.isGameOver) {
      this.isGameOver = true;

      clearInterval(this.speedUpFunction);

      this.gameover.button?.setVisible(true);

      this.stop(0.1);

      console.log("GameOver");

      const score = {
        scr: 5
      };

      // fs.writeFile("record.json", 'score', () => {
      //     // if (err) {
      //     //     console.log(err);
      //     // }
      // });
    }
  }

  private async stop(bySpeed: number): Promise<void> {
    this.map.object?.changeSpeed(2);

    if (this.map.object) {
      let mapSpeed = this.map.object.getSpeed();

      for (; (mapSpeed = this.map.object?.getSpeed()) > 0; ) {
        this.map.object.changeSpeed(mapSpeed - bySpeed);

        await Common.delay(60);
      }
    }
  }

  private handlePressedLControlButton(context: any): void {
    this.player.turnLeft();

    this.controls.lButton.button?.setFrame(ControlState.SELECTED);

    this.controls.lButton.button?.playSound();
  }

  private handlePressedRControlButton(context: any): void {
    this.player.turnRight();

    this.controls.rButton.button?.setFrame(ControlState.SELECTED);

    this.controls.rButton.button?.playSound();
  }

  private handleUnPressedLControlButton(context: any): void {
    this.controls.lButton.button?.setFrame(ControlState.PENDING);
  }

  private handleUnPressedRControlButton(context: any): void {
    this.controls.rButton.button?.setFrame(ControlState.PENDING);
  }

  private prepareReward(): void {
    if (this.map.object && this.player) {
      this.reward.object = new Reward(
        this,
        this.map.object,
        this.player,
        LayerIDX.GUI,
        this.reward.startNumCoins
      );
    }

    this.reward.hud = new RewardHUD(
      this,
      this.reward.color,
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

      this.player = this.traffic.generateVehicle(this.menuSettings.vehicle, 0, [], this.map.depth);

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
      new BackgroundTileSpriteExtended(
        this,
        this.city.mappingKey,
        this.city.moveSpeed,
        this.city.outerScale,
        this.city.innerScale,
        this.city.depth,
        this.city.origin,
        this.city.screenOffsetMult
      );

    this.hill.tileSprite =
      new BackgroundTileSpriteExtended(
        this,
        this.hill.mappingKey,
        this.hill.moveSpeed,
        this.hill.outerScale,
        this.hill.innerScale,
        this.hill.depth,
        this.hill.origin,
        this.hill.screenOffsetMult
      );

    this.clouds.tileSprite =
      new BackgroundTileSpriteExtended(
        this,
        this.clouds.mappingKey,
        this.clouds.moveSpeed,
        this.clouds.outerScale,
        this.clouds.innerScale,
        this.clouds.depth,
        this.clouds.origin,
        this.clouds.screenOffsetMult
      );

    this.nearForest.tileSprite =
      new BackgroundTileSpriteExtended(
        this,
        this.nearForest.mappingKey,
        this.nearForest.moveSpeed,
        this.nearForest.outerScale,
        this.nearForest.innerScale,
        this.nearForest.depth,
        this.nearForest.origin,
        this.nearForest.screenOffsetMult
      );

    this.farForest.tileSprite =
      new BackgroundTileSpriteExtended(
        this,
        this.farForest.mappingKey,
        this.farForest.moveSpeed,
        this.farForest.outerScale,
        this.farForest.innerScale,
        this.farForest.depth,
        this.farForest.origin,
        this.farForest.screenOffsetMult
      );

    this.farthestForest.tileSprite =
      new BackgroundTileSpriteExtended(
        this,
        this.farthestForest.mappingKey,
        this.farthestForest.moveSpeed,
        this.farthestForest.outerScale,
        this.farthestForest.innerScale,
        this.farthestForest.depth,
        this.farthestForest.origin,
        this.farthestForest.screenOffsetMult
      );
  }
}
