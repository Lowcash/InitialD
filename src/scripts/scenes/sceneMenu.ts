import { sourceModel } from '../models/source'
import { Direction, LayerIDX } from '../objects/_common/common'
import { Controls, ControlState, DeviceType, SettingsModel } from '../models/settings'

import BasicButton, { BasicButtonMapping } from '../objects/buttons/basicButton';
import BackgroundTileSprite, { BackgroundTileSpriteMapping } from '../objects/tilesprites/backgroundTileSprite'
import HUD, { HUDFrameSettings } from '../objects/HUD';

import Map from '../objects/map/map'
import Traffic from '../objects/traffic/traffic'
import { VehicleType } from '../objects/traffic/vehicle'
import BackgroundTileSpriteExtended from '../objects/tilesprites/backgroundTileSpriteExtended';

export default class SceneMenu extends Phaser.Scene {
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

  private readonly start: BasicButtonMapping = {
    mappingKey: sourceModel.spriteStart.mappingKey,
    screenOffsetMult: new Phaser.Math.Vector2(0.5, 0.13),
    standartScale: 1.5,
    actionScale: 1.55,
    depth: LayerIDX.GUI,
  };

  private readonly controls: {
    lrButton: BasicButtonMapping;
    udButton: BasicButtonMapping;

    selectedControls: Controls

    screenOffsetMult?: Phaser.Math.Vector2;

    group?: Phaser.GameObjects.Group;
  } & HUDFrameSettings = {
      lrButton: {
        mappingKey: sourceModel.spriteArrowsSelect.mappingKey,
        standartScale: 1.0,
        actionScale: 1.15,
        depth: LayerIDX.GUI,
        screenOffsetMult: new Phaser.Math.Vector2(0.1, 0.22)
      },
      udButton: {
        mappingKey: sourceModel.spriteArrowsSelect.mappingKey,
        standartScale: 1.0,
        actionScale: 1.15,
        depth: LayerIDX.GUI,
        screenOffsetMult: new Phaser.Math.Vector2(0.3, 0.22)
      },

      screenOffsetMult: new Phaser.Math.Vector2(0.01, 0.25),

      text: 'Select your preferred controls:',
      textPadding: 10,
      fontSize: 48,
      color: 0x333333,
      alpha: 0.65,

      selectedControls: Controls.LEFT_RIGHT
    };

  private readonly vehicles: {
    mapping: { [id: string]: Phaser.GameObjects.Image; };

    standartScale: number;
    actionScale: number;

    selectedVehicle: VehicleType;

    screenOffsetMult?: Phaser.Math.Vector2;

    depth?: number;

    group?: Phaser.GameObjects.Group;
  } & HUDFrameSettings = {
      mapping: {},

      standartScale: 1.0,
      actionScale: 1.25,

      screenOffsetMult: new Phaser.Math.Vector2(0.57, 0.25),

      text: 'Select your preferred vehicle:',
      textPadding: 10,
      fontSize: 48,
      color: 0x333333,
      alpha: 0.65,

      depth: LayerIDX.GUI,

      selectedVehicle: VehicleType.AE_86_TRUENO
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

  private traffic: Traffic;

  constructor() {
    super({ key: 'SceneMenu' })
  }

  private create(): void {
    this.prepareMap();
    this.prepareBackground();
    this.prepareStart();
    this.prepareControls();
    this.prepareVehicles();
    this.prepareTraffic();

    this.map.object?.changeSpeed(this.map.moveSpeed);
  }

  public update(): void {
    this.city.tileSprite?.move();
    this.hill.tileSprite?.move();
    this.clouds.tileSprite?.move();
    this.nearForest.tileSprite?.move();
    this.farForest.tileSprite?.move();
    this.farthestForest.tileSprite?.move();
    
    this.map.object?.move();
  }

  //#region Prepares
  private prepareTraffic(): void {
    if (this.map.object) {
      this.traffic = new Traffic(
        this,
        this.map.object
      );

      this.selectVehicle(this.vehicles.selectedVehicle, `${this.vehicles.selectedVehicle}/${Direction.RIGHT}`);
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

    if (this.map.object) {
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

  private prepareStart(): void {
    this.start.button = new BasicButton(
      this,
      new Phaser.Math.Vector2(
        this.cameras.main.width * this.start.screenOffsetMult!.x ?? 1,
        this.cameras.main.height * this.start.screenOffsetMult!.y ?? 1
      ),
      sourceModel.spriteStart.mappingKey,
      this.start.depth,
      this.start.standartScale,
      undefined,
      sourceModel.soundButton.mappingKey
    );

    this.start.button?.on('pointerover', this.handleHoverStartButton, this);
    this.start.button?.on('pointerout', this.handleEndHoverStartButton, this);
    this.start.button?.on('pointerdown', this.handlePressedStartButton, this);
  }

  private prepareControls(): void {
    const controlsText = this.add.bitmapText(
      this.controls.textPadding ?? 1.0,
      this.controls.textPadding ?? 1.0,
      sourceModel.font.mappingKey,
      this.controls.text,
      this.controls.fontSize
    );
    controlsText.setDepth(LayerIDX.GUI);

    const hud = new HUD(
      this,
      new Phaser.Geom.Rectangle(
        0,
        0,
        2.0 * (this.controls.textPadding ?? 1.0) + controlsText.width,
        1.5 * (this.controls.textPadding ?? 1.0) + controlsText.height
      ),
      this.controls.color,
      this.controls.alpha
    );

    this.controls.lrButton.button = new BasicButton(
      this,
      new Phaser.Math.Vector2(
        this.cameras.main.width * this.controls.lrButton.screenOffsetMult!.x ?? 1,
        this.cameras.main.height * this.controls.lrButton.screenOffsetMult!.y ?? 1
      ),
      sourceModel.spriteArrowsSelect.mappingKey,
      this.controls.lrButton.depth,
      undefined,
      undefined,
      sourceModel.soundButton.mappingKey
    );

    this.controls.lrButton.button?.on('pointerover', this.handleHoverLRControlArrows, this);
    this.controls.lrButton.button?.on('pointerout', this.handleEndHoverControlArrows, this);
    this.controls.lrButton.button?.on('pointerdown', this.handlePressedLRControlArrows, this);

    this.controls.udButton.button = new BasicButton(
      this,
      new Phaser.Math.Vector2(
        this.cameras.main.width * this.controls.udButton.screenOffsetMult!.x ?? 1,
        this.cameras.main.height * this.controls.udButton.screenOffsetMult!.y ?? 1
      ),
      sourceModel.spriteArrowsSelect.mappingKey,
      this.controls.udButton.depth,
      undefined,
      90,
      sourceModel.soundButton.mappingKey
    );

    this.controls.udButton.button?.on('pointerover', this.handleHoverUDControlArrows, this);
    this.controls.udButton.button?.on('pointerout', this.handleEndHoverControlArrows, this);
    this.controls.udButton.button?.on('pointerdown', this.handlePressedUDControlArrows, this);

    this.controls.group = this.add.group();

    this.controls.group?.add(controlsText);
    this.controls.group?.add(hud);
    this.controls.group?.add(this.controls.lrButton.button);
    this.controls.group?.add(this.controls.udButton.button);

    this.controls.group?.incXY(
      this.cameras.main.width * this.controls.screenOffsetMult!.x ?? 1,
      this.cameras.main.height * this.controls.screenOffsetMult!.y ?? 1
    );

    if (this.controls.selectedControls === Controls.LEFT_RIGHT) {
      this.switchControls(ControlState.SELECTED, ControlState.NOT_SELECTED);
    } else {
      this.switchControls(ControlState.NOT_SELECTED, ControlState.SELECTED);
    }
  }

  private prepareVehicles(): void {
    const vehiclesText = this.add.bitmapText(
      this.vehicles.textPadding ?? 1.0,
      this.vehicles.textPadding ?? 1.0,
      sourceModel.font.mappingKey,
      this.vehicles.text,
      this.vehicles.fontSize
    );
    vehiclesText.setDepth(999);

    const hud = new HUD(
      this,
      new Phaser.Geom.Rectangle(
        0,
        0,
        2.0 * (this.controls.textPadding ?? 1.0) + vehiclesText.width,
        1.5 * (this.controls.textPadding ?? 1.0) + vehiclesText.height
      ),
      this.controls.color,
      this.controls.alpha
    );

    this.vehicles.group = this.add.group();

    this.vehicles.group?.add(hud);
    this.vehicles.group?.add(vehiclesText);

    const offset = new Phaser.Math.Vector2(this.vehicles.textPadding, 3.0 * vehiclesText.height);

    this.addVehicleToGroupAsGrid(VehicleType.RX_7_FC, Direction.RIGHT, new Phaser.Math.Vector2(0, 1), offset);
    this.addVehicleToGroupAsGrid(VehicleType.RX_7_FD, Direction.RIGHT, new Phaser.Math.Vector2(1, 1), offset);
    this.addVehicleToGroupAsGrid(VehicleType.EVO_3, Direction.RIGHT, new Phaser.Math.Vector2(2, 1), offset);
    this.addVehicleToGroupAsGrid(VehicleType.AE_86_LEVIN, Direction.RIGHT, new Phaser.Math.Vector2(3, 1), offset);
    this.addVehicleToGroupAsGrid(VehicleType.AE_86_TRUENO, Direction.RIGHT, new Phaser.Math.Vector2(0, 0), offset);
    this.addVehicleToGroupAsGrid(VehicleType.S_13, Direction.RIGHT, new Phaser.Math.Vector2(1, 0), offset);
    this.addVehicleToGroupAsGrid(VehicleType._180_SX, Direction.RIGHT, new Phaser.Math.Vector2(2, 0), offset);
    this.addVehicleToGroupAsGrid(VehicleType.EVO_4, Direction.RIGHT, new Phaser.Math.Vector2(3, 0), offset);

    this.vehicles.group?.incXY(
      this.cameras.main.width * this.vehicles.screenOffsetMult!.x ?? 1,
      this.cameras.main.height * this.vehicles.screenOffsetMult!.y ?? 1
    );
  }
  //#endregion

  private addVehicleToGroupAsGrid(vehicle: VehicleType, direction: Direction, gridPos: Phaser.Math.Vector2, offset: Phaser.Math.Vector2): void {
    const mappingKey = `${vehicle.toString()}/${direction.toString()}`;
    
    const vehicleTex = this.textures.get('atlas_vehicles').get(mappingKey);

    this.vehicles.mapping[mappingKey] = this.add.image(
      offset.x + (124 * gridPos.x) * this.vehicles.standartScale,
      offset.y + (vehicleTex.height * gridPos.y) * this.vehicles.standartScale,
      sourceModel.atlasVehicle.mappingKey,
      mappingKey
    )
      .setOrigin(0, 0)
      .setScale(this.vehicles.standartScale)
      .setInteractive()
      .setDepth(this.vehicles.depth ?? 0)
      .on('pointerdown', () => { this.handleClickVehicle(vehicle, mappingKey) });

    this.vehicles.group?.add(this.vehicles.mapping[mappingKey]);
  }

  private switchControls(lrState: ControlState, udState: ControlState): void {
    this.controls.lrButton.button?.setFrame(lrState);
    this.controls.udButton.button?.setFrame(udState);

    this.controls.lrButton.button?.setScale(
      lrState === ControlState.SELECTED || lrState === ControlState.PENDING ?
        this.controls.lrButton.actionScale ?? 1 :
        this.controls.lrButton.standartScale ?? 1
    );

    this.controls.udButton.button?.setScale(
      udState === ControlState.SELECTED || udState === ControlState.PENDING ?
        this.controls.udButton.actionScale ?? 1 :
        this.controls.udButton.standartScale ?? 1
    );
  }

  private selectVehicle(vehicle: VehicleType, mappingKey: string): void {
    this.rescaleVehicleSelection(vehicle, mappingKey);

    this.sound.play(sourceModel.soundButton.mappingKey);

    this.vehicles.selectedVehicle = vehicle;

    this.traffic.clearTraffic();

    this.traffic.generateVehicle(this.vehicles.selectedVehicle, 0, [], this.map.depth, false);
  }

  private rescaleVehicleSelection(vehicle: VehicleType, mappingKey: string) {
    for (const v of Object.values(this.vehicles.mapping)) {
      v.setScale(this.vehicles.standartScale);
      v.setDepth(this.vehicles.depth ?? 1);
    }

    this.vehicles.mapping[mappingKey].setScale(this.vehicles.actionScale);
    this.vehicles.mapping[mappingKey].setDepth((this.vehicles.depth ?? 1) + 1);
  }

  //#region Handlers
  private handleClickVehicle(vehicle: VehicleType, mappingKey: string): void {
    this.selectVehicle(vehicle, mappingKey);
  }

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
    this.start.button?.off('pointerover');
    this.start.button?.off('pointerout');
    this.start.button?.off('pointerdown');

    this.controls.lrButton.button?.off('pointerover');
    this.controls.lrButton.button?.off('pointerout');
    this.controls.lrButton.button?.off('pointerdown');

    this.controls.udButton.button?.off('pointerover');
    this.controls.udButton.button?.off('pointerout');
    this.controls.udButton.button?.off('pointerdown');

    this.scene.start('PreloadLevel', new SettingsModel(
      this.sys.game.device.os.desktop ? DeviceType.DESKTOP : DeviceType.MOBILE,
      this.controls.selectedControls,
      this.vehicles.selectedVehicle
    )
    );
  }

  private handleHoverLRControlArrows(context: any) {
    if (this.controls.selectedControls !== Controls.LEFT_RIGHT) {
      this.switchControls(ControlState.PENDING, ControlState.SELECTED);

      this.controls.lrButton.button?.playSound();
    }
  }

  private handleHoverUDControlArrows(context: any) {
    if (this.controls.selectedControls !== Controls.UP_DOWN) {
      this.switchControls(ControlState.SELECTED, ControlState.PENDING);

      this.controls.udButton.button?.playSound();
    }
  }

  private handleEndHoverControlArrows(context: any) {
    if (this.controls.selectedControls === Controls.LEFT_RIGHT) {
      this.switchControls(ControlState.SELECTED, ControlState.NOT_SELECTED);
    } else {
      this.switchControls(ControlState.NOT_SELECTED, ControlState.SELECTED);
    }
  }

  private handlePressedLRControlArrows(context: any) {
    this.controls.selectedControls = Controls.LEFT_RIGHT;

    this.switchControls(ControlState.SELECTED, ControlState.NOT_SELECTED);
  }

  private handlePressedUDControlArrows(context: any) {
    this.controls.selectedControls = Controls.UP_DOWN;

    this.switchControls(ControlState.NOT_SELECTED, ControlState.SELECTED);
  }
}
//#endregion