//import '../objects/basicButton'
import BasicButton from '../objects/basicButton';
import { PreloadDataModel } from './preloadMenu'

enum Controls { LEFT_RIGHT = 0, UP_DOWN };

export default class SceneMenu extends Phaser.Scene {
  private inputData: PreloadDataModel;
  
  private city?: Phaser.GameObjects.TileSprite;
  private hill?: Phaser.GameObjects.TileSprite;

  private startButton: BasicButton;
  private controlsLRButton: BasicButton;
  private controlsUDButton: BasicButton;

  private startButtonScale: number = 1.5;
  private startButtonHoverScale: number = 1.55;

  private controlArrowsScale: number = 1.0;
  private controlArrowsHoverScale: number = 1.15;

  private selectedControls: Controls = Controls.LEFT_RIGHT;

  constructor() {
    super({ key: 'SceneMenu' })
  }

  private init(inputData: PreloadDataModel): void {
    this.inputData = inputData;
  }

  private create(): void {
    this.add.image(this.cameras.main.centerX, 100, this.inputData.imageLogo.mappingKey);

    this.city = 
      this.add.tileSprite(
        this.cameras.main.width * 0.5, 
        this.cameras.main.height * 0.35, 
        0, 
        0, 
        this.inputData.imageCity.mappingKey
      ).setScale(1.35);
    
    this.hill = 
      this.add.tileSprite(
        this.cameras.main.width * 0.5, 
        this.cameras.main.height * 0.65, 
        0, 
        0, 
        this.inputData.imageHill.mappingKey
      ).setScale(1.35);

    this.startButton = new BasicButton(
      this, 
      new Phaser.Math.Vector2(
        this.cameras.main.centerX,
        this.cameras.main.height * 0.4
      ),
      this.inputData.spriteStart.mappingKey,
      this.startButtonScale,
      undefined,
      this.inputData.soundButton.mappingKey
    );
    
    this.startButton.on('pointerover', this.handleHoverStartButton, this);
    this.startButton.on('pointerout', this.handleEndHoverStartButton, this);
    this.startButton.on('pointerdown', this.handlePressedStartButton, this);

    this.controlsLRButton = new BasicButton(
      this,
      new Phaser.Math.Vector2(
        this.cameras.main.width * 0.23,
        this.cameras.main.height * 0.66
      ),
      this.inputData.spriteArrows.mappingKey,
      undefined,
      undefined,
      this.inputData.soundButton.mappingKey
    );

    this.controlsUDButton = new BasicButton(
      this,
      new Phaser.Math.Vector2(
        this.cameras.main.width * 0.76,
        this.cameras.main.height * 0.66
      ),
      this.inputData.spriteArrows.mappingKey,
      undefined,
      90,
      this.inputData.soundButton.mappingKey
    );
    
    this.switchControls(this.selectedControls);

    this.controlsLRButton.on('pointerover', this.handleHoverLRControlArrows, this);
    this.controlsUDButton.on('pointerover', this.handleHoverUDControlArrows, this);
    this.controlsLRButton.on('pointerout', this.handleEndHoverControlArrows, this);
    this.controlsUDButton.on('pointerout', this.handleEndHoverControlArrows, this);
    this.controlsLRButton.on('pointerdown', this.handlePressedLRControlArrows, this);
    this.controlsUDButton.on('pointerdown', this.handlePressedUDControlArrows, this);
  }

  public update(): void {
    this.moveBackground();
  }

  private moveBackground(): void {
    if(this.city) {
      this.city.tilePositionX += 0.25;
    }
    if(this.hill) {
      this.hill.tilePositionX += 0.5;
    }
  }

  private switchControls(controls: Controls, withColor: boolean = true, withScale: boolean = true): void {
    if (controls === Controls.LEFT_RIGHT) {
      if (withColor) {
        this.controlsLRButton.setFrame(0);
        this.controlsUDButton.setFrame(1);
      }

      if (withScale) {
        this.controlsLRButton.setScale(this.controlArrowsHoverScale);
        this.controlsUDButton.setScale(this.controlArrowsScale);
      }
      
    } else {
      if (withColor) {
        this.controlsLRButton.setFrame(1);
        this.controlsUDButton.setFrame(0);
      }
      
      if (withScale) {
        this.controlsLRButton.setScale(this.controlArrowsScale);
        this.controlsUDButton.setScale(this.controlArrowsHoverScale);
      }
    }
  }

  private handleHoverStartButton(context: any) {
    this.startButton.setFrame(1);

    this.startButton.setScale(this.startButtonHoverScale);

    this.startButton.playSound();
  }

  private handleEndHoverStartButton(context: any) {
    this.startButton.setFrame(0);

    this.startButton.setScale(this.startButtonScale);
  }

  private handlePressedStartButton(context: any) {
    this.startButton.off('pointerover');
    this.startButton.off('pointerout');
    this.startButton.off('pointerdown');

    this.controlsLRButton.off('pointerover');
    this.controlsLRButton.off('pointerout');
    this.controlsLRButton.off('pointerdown');

    this.controlsUDButton.off('pointerover');
    this.controlsUDButton.off('pointerout');
    this.controlsUDButton.off('pointerdown');

    this.scene.start('PreloadLevel');
  }

  private handleHoverLRControlArrows(context: any) {
    this.switchControls(Controls.LEFT_RIGHT, false);

    this.controlsLRButton.playSound();
  }

  private handleHoverUDControlArrows(context: any) {
    this.switchControls(Controls.UP_DOWN, false);

    this.controlsUDButton.playSound();
  }

  private handleEndHoverControlArrows(context: any) {
    this.switchControls(this.selectedControls);
  }

  private handlePressedLRControlArrows(context: any) {
    this.selectedControls = Controls.LEFT_RIGHT;

    this.switchControls(this.selectedControls);
  }

  private handlePressedUDControlArrows(context: any) {
    this.selectedControls = Controls.UP_DOWN;

    this.switchControls(this.selectedControls);
  }
}