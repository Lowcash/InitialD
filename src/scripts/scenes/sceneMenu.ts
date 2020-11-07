import { sourceModel } from '../models/source'
import { Controls, SettingsModel } from '../models/settings'

import BasicButton from '../objects/buttons/basicButton';
import HUD, { HUDFrameSettings } from '../objects/HUD';

import Map from '../objects/map'
import Traffic from '../objects/traffic/traffic'
import Vehicle, { VehicleType, Direction } from '../objects/traffic/vehicle'

enum ControlState { NOT_SELECTED = 2, PENDING = 1, SELECTED = 0 };

export default class SceneMenu extends Phaser.Scene {
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

    chunkScale: number;

    moveSpeed: number;
  } = {
    chunkScale: 5,

    moveSpeed: -2.5
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
    this.prepareTraffic();
    
    this.map.object?.changeSpeed(this.map.moveSpeed)
  }

  public update(): void {
    if(this.city.tileSprite) {
      this.city.tileSprite.tilePositionX += this.city.moveSpeed;
    }
    if(this.hill.tileSprite) {
      this.hill.tileSprite.tilePositionX += this.hill.moveSpeed;
    }

    this.map.object?.move();
  }

  private prepareTraffic(): void {
    if (this.map.object) {
      this.traffic = new Traffic(
        this,
        this.map.object,
        false
      );
  
      this.selectCar(this.vehicles.selectedVehicle, `${this.vehicles.selectedVehicle}/${Direction.RIGHT}`);
    }
  }

  private prepareMap(): void {
    const roadChunkTex = this.textures.get(sourceModel.imageRoadStraight.mappingKey).getSourceImage();

    this.map.object = new Map(
      this,
      0,
      0, 
      this.cameras.main.height * 0.85 - roadChunkTex.height * this.map.chunkScale,
      this.map.chunkScale
    );
  }

  private prepareBackground(): void {
    //this.add.image(this.cameras.main.centerX, 100, sourceModel.imageLogo.mappingKey);

    this.city.tileSprite = 
      this.add.tileSprite(
        this.cameras.main.centerX, 
        this.cameras.main.height * 0.35, 
        0, 
        0, 
        sourceModel.imageCity.mappingKey
      ).setScale(this.city.standartScale);
    
    this.hill.tileSprite = 
      this.add.tileSprite(
        this.cameras.main.centerX, 
        this.cameras.main.height * 0.65, 
        0, 
        0, 
        sourceModel.imageHill.mappingKey
      ).setScale(this.hill.standartScale);
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

    this.scene.start('PreloadLevel', new SettingsModel(this.controls.selectedControls, this.vehicles.selectedVehicle));
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