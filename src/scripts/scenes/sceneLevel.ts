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
import ScoreHUD, { AppendFrom, ScoreHUDExtended } from '../objects/reward/hud';
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

  private readonly start: BasicButtonMapping = {
    mappingKey: sourceModel.spriteStart.mappingKey,
    screenOffsetMult: new Phaser.Math.Vector2(0.5, 0.65),
    standartScale: 1.0,
    actionScale: 1.05,
    depth: LayerIDX.GUI,
  };

  private readonly gameover: BasicButtonMapping = {
    mappingKey: sourceModel.imageGameOver.mappingKey,
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
      startNumChunks: 8,
      moveSpeed: -1.0
    };

  private readonly reward: {
    object?: Reward;
    scoreHUD?: ScoreHUDExtended;
    highScoreHUD?: ScoreHUD;

    startNumCoins: number;
    zeroPadding: number;

    depth: number;
  } & HUDFrameSettings = {
      fontSize: 38,
      textPadding: 30,
      color: 0x000000,

      startNumCoins: 5,
      zeroPadding: 6,

      depth: this.map.depth
    };

  private readonly traffic: {
    object?: Traffic;

    player?: Vehicle;
    playerStartOffset: Phaser.Math.Vector2;

    depth: number;
  } = {
      playerStartOffset: new Phaser.Math.Vector2(50, 0),

      depth: this.map.depth
    };

  private menuSettings: SettingsModel;

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  private prevHighScore: number = 0;
  private speedUpFunction: any;
  private isGameOver: boolean = false;

  constructor() {
    super({ key: 'SceneLevel' });
  }

  private init(data: SettingsModel): void {
    this.menuSettings = data;
  }

  private create(): void {
    this.prepareObjects();

    this.cursors = this.input.keyboard.createCursorKeys();

    this.events.on('onPlayerCollided', (id: string) => {
      this.handlePlayerCollided(id);
    });
  }

  private prepareObjects(): void {
    this.prepareBackground();
    this.prepareMap();
    this.prepareTraffic();
    this.prepareReward();
    this.prepareGameOverStart();

    if (this.menuSettings.deviceType === DeviceType.MOBILE) {
      this.prepareControls();
    }

    this.map.object?.changeSpeed(this.map.moveSpeed);

    this.speedUpFunction = setInterval(() => {
        this.map.object?.changeSpeed(this.map.object.getSpeed() - 0.1);
    }, 100);

    this.traffic.player?.setEnableTurn(true);

    this.isGameOver = false;
  }

  public update(): void {
    if (this.menuSettings.controls === Controls.LEFT_RIGHT) {
      if (this.cursors?.left?.isDown) {
        this.traffic.player?.turnLeft();
      }
      else if (this.cursors?.right?.isDown) {
        this.traffic.player?.turnRight();
      }
    }
    else if (this.menuSettings.controls === Controls.UP_DOWN) {
      if (this.cursors?.up?.isDown) {
        this.traffic.player?.turnLeft();
      }
      else if (this.cursors?.down?.isDown) {
        this.traffic.player?.turnRight();
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
    this.traffic.object?.move();
  }

  private handlePlayerCollided(id: string): void {
    if (!this.isGameOver) {
      this.isGameOver = true;

      clearInterval(this.speedUpFunction);

      this.start.button?.setVisible(true);
      this.gameover.button?.setVisible(true);

      this.stop(0.1);

      this.traffic.player?.setEnableTurn(false);

      if (this.reward.object) {
        const earnedPoints = this.reward.object.getEarnedPoints();

        if (earnedPoints > this.prevHighScore) {
          localStorage.setItem('HighScore', JSON.stringify(earnedPoints));

          this.reward.highScoreHUD?.updateScore(earnedPoints);
        }
      }
    }
  }

  private async stop(bySpeed: number): Promise<void> {
    this.map.object?.changeSpeed(2);

    if (this.map.object) {
      let mapSpeed = -1;

      for (; (mapSpeed = this.map.object?.getSpeed()) > 0;) {
        this.map.object.changeSpeed(mapSpeed - bySpeed);

        await Common.delay(60);
      }
    }
  }

  //#region Handlers
  private handleHoverStartButton(context: any) {
    this.start.button?.setFrame(ControlState.PENDING);

    this.start.button?.setScale(this.start.actionScale ?? 1);

    this.start.button?.playSound();
  }

  private handleEndHoverStartButton(context: any) {
    this.start.button?.setFrame(ControlState.NOT_SELECTED);

    this.start.button?.setScale(this.start.standartScale ?? 1);
  }

  private handlePressedStartButton(context: any) {
    //this.scene.restart();

    this.prepareObjects();
  }

  private handlePressedLControlButton(context: any): void {
    this.traffic.player?.turnLeft();

    this.controls.lButton.button?.setFrame(ControlState.SELECTED);

    this.controls.lButton.button?.playSound();
  }

  private handlePressedRControlButton(context: any): void {
    this.traffic.player?.turnRight();

    this.controls.rButton.button?.setFrame(ControlState.SELECTED);

    this.controls.rButton.button?.playSound();
  }

  private handleUnPressedLControlButton(context: any): void {
    this.controls.lButton.button?.setFrame(ControlState.PENDING);
  }

  private handleUnPressedRControlButton(context: any): void {
    this.controls.rButton.button?.setFrame(ControlState.PENDING);
  }
  //#endregion
  //#region Prepares
  private prepareGameOverStart(): void {
    if (this.start.button && this.gameover.button) {
      this.start.button.setVisible(false);
      this.gameover.button.setVisible(false);

      return;
    }

    this.start.button = new BasicButton(
      this,
      new Phaser.Math.Vector2(
        this.cameras.main.width * (this.start.screenOffsetMult?.x ?? 1),
        this.cameras.main.height * (this.start.screenOffsetMult?.y ?? 1),
      ),
      sourceModel.spriteStart.mappingKey,
      this.start.depth,
      undefined,
      undefined,
      sourceModel.soundButton.mappingKey
    );

    this.gameover.button = new BasicButton(
      this,
      new Phaser.Math.Vector2(
        this.cameras.main.width * (this.gameover.screenOffsetMult?.x ?? 1),
        this.cameras.main.height * (this.gameover.screenOffsetMult?.y ?? 1),
      ),
      sourceModel.imageGameOver.mappingKey,
      this.gameover.depth,
      undefined,
      undefined,
      undefined
    );

    this.start.button.setVisible(false);
    this.gameover.button.setVisible(false);

    this.start.button?.setFrame(ControlState.SELECTED);

    this.start.button?.on('pointerover', this.handleHoverStartButton, this);
    this.start.button?.on('pointerout', this.handleEndHoverStartButton, this);
    this.start.button?.on('pointerdown', this.handlePressedStartButton, this);
  }

  private prepareControls(): void {
    if (!(this.controls.lButton.button && this.controls.rButton.button)) {
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
  }

  private prepareReward(): void {
    const highScore = localStorage.getItem('HighScore');

    if (this.reward.object) {
      this.reward.object.generateReward(this.reward.startNumCoins);

      if (this.traffic.player) {
        this.reward.object.attachPlayer(this.traffic.player);
      }

      if (highScore) {
        this.reward.highScoreHUD?.updateScore(JSON.parse(highScore) as number);
      }

      return;
    }

    if (this.map.object && this.traffic.player) {
      this.reward.object = new Reward(
        this,
        this.map.object,
        this.traffic.player,
        this.reward.depth,
        this.reward.startNumCoins
      );
    }

    this.reward.scoreHUD = new ScoreHUDExtended(
      this,
      'SCORE',
      AppendFrom.LEFT,
      this.reward.color,
      this.reward.fontSize,
      this.reward.textPadding,
      this.reward.zeroPadding
    );

    this.reward.highScoreHUD = new ScoreHUD(
      this,
      'HIGHEST SCORE',
      AppendFrom.RIGHT,
      this.reward.color,
      this.reward.fontSize,
      this.reward.textPadding,
      this.reward.zeroPadding
    );

    if (highScore) {
      const highScoreParsed = JSON.parse(highScore) as number;

      this.prevHighScore = highScoreParsed;
      this.reward.highScoreHUD.updateScore(highScoreParsed);
    } else {
      localStorage.setItem('HighScore', JSON.stringify(this.prevHighScore))
    }
  }

  private prepareTraffic(): void {
    if (this.traffic.object) {
      this.traffic.object.generateTraffic();
      
      this.traffic.player = this.traffic.object.generateVehicle(
        this.menuSettings.vehicle,
        0,
        this.traffic.playerStartOffset,
        [],
        false
      );

      this.traffic.object.attachPlayer(this.traffic.player);

      return;
    }

    if (this.map.object) {
      this.traffic.object = new Traffic(
        this,
        this.map.object,
        this.traffic.depth
      );
      
      this.traffic.object?.generateTraffic();

      this.traffic.player = this.traffic.object.generateVehicle(
        this.menuSettings.vehicle,
        0,
        this.traffic.playerStartOffset,
        [],
        false
      );

      this.traffic.object.attachPlayer(this.traffic.player);
    }
  }

  private prepareMap(): void {
    if (this.map.object) {
      this.map.object.generateMap(this.map.startNumChunks);

      return;
    }

    this.map.object = new Map(
      this,
      this.map.depth,
      new Phaser.Math.Vector2(
        this.cameras.main.width * (this.map.screenOffsetMult?.x ?? 1),
        this.cameras.main.height * (this.map.screenOffsetMult?.y ?? 1)
      ),
      this.map.startNumChunks
    );
  }

  private prepareBackground(): void {
    //this.add.image(this.cameras.main.centerX, 100, sourceModel.imageLogo.mappingKey);

    if (!this.city.tileSprite) {
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
    }

    if (!this.hill.tileSprite) {
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
    }

    if (!this.clouds.tileSprite) {
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
    }

    if (!this.nearForest.tileSprite) {
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
    }

    if (!this.farForest.tileSprite) {
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
    }

    if (!this.farthestForest.tileSprite) {
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
  //#endregion
}
