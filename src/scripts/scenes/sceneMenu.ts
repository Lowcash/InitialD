import { sourceModel } from '../models/source'
import { Direction } from '../objects/_common/common'
import { Controls, DeviceType, SettingsModel } from '../models/settings'

import BasicButton from '../objects/buttons/basicButton';
import BackgroundTileSprite, { BackgroundTileSpriteMapping } from '../objects/tilesprite'
import HUD, { HUDFrameSettings } from '../objects/HUD';

import Map from '../objects/map/map'
import Traffic from '../objects/traffic/traffic'
import Vehicle, { VehicleType } from '../objects/traffic/vehicle'

enum ControlState { NOT_SELECTED = 2, PENDING = 1, SELECTED = 0 };

export default class SceneMenu extends Phaser.Scene {
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

  private readonly foregForest: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageForest.mappingKey,
    moveSpeed: 1.0,
    innerScale: 1.3,
    depth: 10,
    origin: new Phaser.Math.Vector2(0.5, 1.0)
  };
  
  private readonly backgForest: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageForest.mappingKey,
    bottomOffsetMult: 0.72,
    moveSpeed: 1.0,
    innerScale: 0.7,
    origin: new Phaser.Math.Vector2(0.5, 1.0),
    depth: 8
  };

  private readonly backBackgForest: BackgroundTileSpriteMapping = {
    mappingKey: sourceModel.imageForest.mappingKey,
    bottomOffsetMult: 0.72,
    moveSpeed: 1.0,
    innerScale: 0.5,
    origin: new Phaser.Math.Vector2(0.5, 1.0),
    depth: 7
  };
  
  private readonly start: {
    button?: BasicButton;

    standartScale: number;
    actionScale: number;
  } = {
    standartScale: 1.5,
    actionScale: 1.55
  };

  private readonly controls: {
    lrButton?: BasicButton;
    udButton?: BasicButton;
    
    standartScale: number;
    actionScale: number;

    selectedControls: Controls

    group?: Phaser.GameObjects.Group;
  } & HUDFrameSettings = {
    standartScale: 1.0,
    actionScale: 1.15,

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

    group?: Phaser.GameObjects.Group;
  } & HUDFrameSettings = {
    mapping: {},

    standartScale: 5.0,
    actionScale: 6.5,

    text: 'Select your preferred vehicle:',
    textPadding: 10,
    fontSize: 48,
    color: 0x333333,
    alpha: 0.65,

    selectedVehicle: VehicleType.AE_86_TRUENO
  };

  private readonly map: {
    object?: Map;

    //chunkScale: number;

    moveSpeed: number;
  } = {
    //chunkScale: 1,

    moveSpeed: -1.0
  };

  private player: Vehicle;
  private traffic: Traffic;

  constructor() {
    super({ key: 'SceneMenu' })
  }

  private create(): void {
    this.prepareBackground();
    this.prepareStart();
    this.prepareControls();
    this.prepareVehicles();
    this.prepareMap();
    //this.prepareTraffic();

    this.map.object?.changeSpeed(this.map.moveSpeed)
  }

  public update(): void {
    if(this.city.tileSprite) {
      this.city.tileSprite.move();
    }
    if(this.hill.tileSprite) {
      this.hill.tileSprite.move();
    }
    if(this.foregForest.tileSprite) {
      this.foregForest.tileSprite.move();
    }
    if(this.backgForest.tileSprite) {
      this.backgForest.tileSprite.move();
    }
    if(this.clouds.tileSprite) {
      this.clouds.tileSprite.move();
    }
    if(this.backBackgForest.tileSprite) {
      this.backBackgForest.tileSprite.move();
    }

    this.map.object?.move();
  }

//#region Prepares

  private prepareTraffic(): void {
    if (this.map.object) {
      this.traffic = new Traffic(
        this,
        this.map.object
      );
  
      this.selectCar(this.vehicles.selectedVehicle, `${this.vehicles.selectedVehicle}/${Direction.RIGHT}`);
    }
  }

  private prepareMap(): void {
    const roadChunkTex = this.textures.get(sourceModel.imageRoadStraight0.mappingKey).getSourceImage();

    this.map.object = new Map(
      this,
      9,
      0, 
      this.cameras.main.height,
      1,
      5
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
        undefined,
        undefined,
        this.city.bottomOffsetMult
      );
    
    this.hill.tileSprite = 
      new BackgroundTileSprite(
        this,
        this.hill.mappingKey,
        this.hill.moveSpeed,
        this.hill.outerScale,
        this.hill.innerScale,
        undefined,
        undefined,
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
        undefined,
        this.clouds.bottomOffsetMult
      );
      
    this.foregForest.tileSprite = 
      new BackgroundTileSprite(
        this,
        this.foregForest.mappingKey,
        this.foregForest.moveSpeed,
        this.foregForest.outerScale,
        this.foregForest.innerScale,
        this.foregForest.depth,
        this.foregForest.origin,
        this.foregForest.bottomOffsetMult
      );

    this.backgForest.tileSprite = 
      new BackgroundTileSprite(
        this,
        this.backgForest.mappingKey,
        this.backgForest.moveSpeed,
        this.backgForest.outerScale,
        this.backgForest.innerScale,
        this.backgForest.depth,
        this.backgForest.origin,
        this.backgForest.bottomOffsetMult
      );

      this.backBackgForest.tileSprite = 
      new BackgroundTileSprite(
        this,
        this.backBackgForest.mappingKey,
        this.backBackgForest.moveSpeed,
        this.backBackgForest.outerScale,
        this.backBackgForest.innerScale,
        this.backBackgForest.depth,
        this.backBackgForest.origin,
        this.backBackgForest.bottomOffsetMult
      );
  }

  private prepareStart(): void {
    this.start.button = new BasicButton(
      this, 
      new Phaser.Math.Vector2(
        this.cameras.main.centerX,
        this.cameras.main.height * 0.13
      ),
      sourceModel.spriteStart.mappingKey,
      999,
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
      this.controls.textPadding, 
      this.controls.textPadding, 
      sourceModel.font.mappingKey, 
      this.controls.text, 
      this.controls.fontSize
    );
    controlsText.setDepth(999);

    const hud = new HUD(
      this, 
      new Phaser.Geom.Rectangle(
        0, 
        0, 
        2.0 * this.controls.textPadding + controlsText.width, 
        1.5 * this.controls.textPadding + controlsText.height
      ),
      this.controls.color, 
      this.controls.alpha
    );

    this.controls.lrButton = new BasicButton(
      this,
      new Phaser.Math.Vector2(
        this.cameras.main.width * 0.1,
        this.cameras.main.height * 0.22
      ),
      sourceModel.spriteArrows.mappingKey,
      999,
      undefined,
      undefined,
      sourceModel.soundButton.mappingKey
    );
    
    this.controls.lrButton.on('pointerover', this.handleHoverLRControlArrows, this);
    this.controls.lrButton.on('pointerout', this.handleEndHoverControlArrows, this);
    this.controls.lrButton.on('pointerdown', this.handlePressedLRControlArrows, this);

    this.controls.udButton = new BasicButton(
      this,
      new Phaser.Math.Vector2(
        this.cameras.main.width * 0.3,
        this.cameras.main.height * 0.22
      ),
      sourceModel.spriteArrows.mappingKey,
      999,
      undefined,
      90,
      sourceModel.soundButton.mappingKey
    );
    
    this.controls.udButton.on('pointerover', this.handleHoverUDControlArrows, this);
    this.controls.udButton.on('pointerout', this.handleEndHoverControlArrows, this);
    this.controls.udButton.on('pointerdown', this.handlePressedUDControlArrows, this);

    this.controls.group = this.add.group();

    this.controls.group?.add(controlsText);
    this.controls.group?.add(hud);
    this.controls.group?.add(this.controls.lrButton);
    this.controls.group?.add(this.controls.udButton);

    this.controls.group?.incXY(
      this.cameras.main.width * 0.01, 
      this.cameras.main.height * 0.25
    );

    if (this.controls.selectedControls === Controls.LEFT_RIGHT) {
      this.switchControls(ControlState.SELECTED, ControlState.NOT_SELECTED);
    } else {
      this.switchControls(ControlState.NOT_SELECTED, ControlState.SELECTED);
    }
  }

  private prepareVehicles(): void {
    const vehiclesText = this.add.bitmapText(
      this.vehicles.textPadding, 
      this.vehicles.textPadding, 
      sourceModel.font.mappingKey, 
      this.vehicles.text, 
      this.vehicles.fontSize
    );
    vehiclesText.setDepth(999);

    const hud =  new HUD(
      this, 
      new Phaser.Geom.Rectangle(
        0, 
        0, 
        2.0 * this.controls.textPadding + vehiclesText.width, 
        1.5 * this.controls.textPadding + vehiclesText.height
      ),
      this.controls.color, 
      this.controls.alpha
    );
    
    this.vehicles.group = this.add.group();
    
    this.vehicles.group?.add(hud);
    this.vehicles.group?.add(vehiclesText);
    
    const offset = new Phaser.Math.Vector2(20, 2.1 * vehiclesText.height);
    
    this.addVehicleToGroupAsGrid(VehicleType.RX_7_FC, Direction.RIGHT, new Phaser.Math.Vector2(0, 1), offset);
    this.addVehicleToGroupAsGrid(VehicleType.RX_7_FD, Direction.RIGHT, new Phaser.Math.Vector2(1, 1), offset);
    this.addVehicleToGroupAsGrid(VehicleType.R_32, Direction.RIGHT, new Phaser.Math.Vector2(2, 1), offset);
    this.addVehicleToGroupAsGrid(VehicleType.AE_86_TRUENO, Direction.RIGHT, new Phaser.Math.Vector2(0, 0), offset);
    this.addVehicleToGroupAsGrid(VehicleType.EVO_3, Direction.RIGHT, new Phaser.Math.Vector2(1, 0), offset);
    this.addVehicleToGroupAsGrid(VehicleType.EVO_4, Direction.RIGHT, new Phaser.Math.Vector2(2, 0), offset);

    this.vehicles.group?.incXY(
      this.cameras.main.width * 0.57, 
      this.cameras.main.height * 0.25
    );
  }

  //#endregion

  private addVehicleToGroupAsGrid(vehicle: VehicleType, direction: Direction, gridPos: Phaser.Math.Vector2, offset: Phaser.Math.Vector2): void {
    const mappingKey = `${vehicle.toString()}/${direction.toString()}`;

    const vehicleTex = this.textures.get(mappingKey).getSourceImage();

    this.vehicles.mapping[mappingKey] = this.add.image(
      offset.x + (vehicleTex.width * gridPos.x) * this.vehicles.standartScale,
      offset.y + (vehicleTex.height * 0.75 * gridPos.y) * this.vehicles.standartScale,
      sourceModel.atlasVehicle.mappingKey,
      mappingKey
    ).setOrigin(0, 0)
     .setScale(this.vehicles.standartScale)
     .setInteractive()
     .setDepth(999)
     .on('pointerdown', () => {this.handleClickVehicle(vehicle, mappingKey)});

     this.vehicles.group?.add(this.vehicles.mapping[mappingKey]);
  }

  private switchControls(lrState: ControlState, udState: ControlState): void {
      this.controls.lrButton?.setFrame(lrState);
      this.controls.udButton?.setFrame(udState);

      this.controls.lrButton?.setScale(
          lrState === ControlState.SELECTED || lrState === ControlState.PENDING ?
            this.controls.actionScale : 
            this.controls.standartScale
      );
      
      this.controls.udButton?.setScale(
        udState === ControlState.SELECTED || udState === ControlState.PENDING ?
          this.controls.actionScale : 
          this.controls.standartScale
      );
  }

  private selectCar(vehicle: VehicleType, mappingKey: string): void {
    for (const v of Object.values(this.vehicles.mapping)) {
      v.setScale(this.vehicles.standartScale);
    }

    this.vehicles.mapping[mappingKey].setScale(this.vehicles.actionScale);

    this.vehicles.selectedVehicle = vehicle;

    this.traffic.clearTraffic();

    this.player = this.traffic.generateVehicle(this.vehicles.selectedVehicle, 0, [], false);
  }

//#region Handlers
  private handleClickVehicle(vehicle: VehicleType, mappingKey: string): void {
    this.selectCar(vehicle, mappingKey);
  }

  private handleHoverStartButton(context: any) {
    this.start.button?.setFrame(ControlState.PENDING);

    this.start.button?.setScale(this.start.actionScale);

    this.start.button?.playSound();
  }

  private handleEndHoverStartButton(context: any) {
    this.start.button?.setFrame(ControlState.NOT_SELECTED);

    this.start.button?.setScale(this.start.standartScale);
  }

  private handlePressedStartButton(context: any) {
    this.start.button?.off('pointerover');
    this.start.button?.off('pointerout');
    this.start.button?.off('pointerdown');

    this.controls.lrButton?.off('pointerover');
    this.controls.lrButton?.off('pointerout');
    this.controls.lrButton?.off('pointerdown');

    this.controls.udButton?.off('pointerover');
    this.controls.udButton?.off('pointerout');
    this.controls.udButton?.off('pointerdown');

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

      this.controls.lrButton?.playSound();
    }
  }

  private handleHoverUDControlArrows(context: any) {
    if (this.controls.selectedControls !== Controls.UP_DOWN) {
      this.switchControls(ControlState.SELECTED, ControlState.PENDING);

      this.controls.udButton?.playSound();
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