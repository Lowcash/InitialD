import '../objects/basicButton'
import BasicButton from '../objects/basicButton';

enum Controls { LEFT_RIGHT = 0, UP_DOWN };

export default class SceneMenu extends Phaser.Scene {
  private startButton: BasicButton;
  private controlsLRButton: BasicButton;
  private controlsUDButton: BasicButton;

  private startButtonScale: number = 1.5;
  private startButtonHoverScale: number = 1.55;

  private selectedControls: Controls = Controls.LEFT_RIGHT;

  constructor() {
    super({ key: 'SceneMenu' })
  }

  private create(): void {
    this.add.image(this.cameras.main.centerX, 100, 'image_logo');

    this.startButton = new BasicButton(
      this, 
      new Phaser.Math.Vector2(
        this.cameras.main.centerX,
        this.cameras.main.height * 0.4
      ),
      'sprite_sheet_start',
      this.startButtonScale,
      undefined,
      'sound_button_pressed'
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
      'sprite_arrows',
      undefined,
      undefined,
      'sound_button_pressed'
    );

    this.controlsUDButton = new BasicButton(
      this,
      new Phaser.Math.Vector2(
        this.cameras.main.width * 0.76,
        this.cameras.main.height * 0.66
      ),
      'sprite_arrows',
      undefined,
      90,
      'sound_button_pressed'
    );
    
    this.switchControls(this.selectedControls);

    this.controlsLRButton.on('pointerover', this.handleHoverLRControlArrows, this);
    this.controlsUDButton.on('pointerover', this.handleHoverUDControlArrows, this);
    this.controlsLRButton.on('pointerout', this.handleEndHoverControlArrows, this);
    this.controlsUDButton.on('pointerout', this.handleEndHoverControlArrows, this);
    this.controlsLRButton.on('pointerdown', this.handlePressedLRControlArrows, this);
    this.controlsUDButton.on('pointerdown', this.handlePressedUDControlArrows, this);
  }

  private switchControls(controls: Controls, withColor: boolean = true, withScale: boolean = true): void {
    if (controls === Controls.LEFT_RIGHT) {
      if (withColor) {
        this.controlsLRButton.setFrame(0);
        this.controlsUDButton.setFrame(1);
      }

      if (withScale) {
        this.controlsLRButton.setScale(1.15);
        this.controlsUDButton.setScale(1.00);
      }
      
    } else {
      if (withColor) {
        this.controlsLRButton.setFrame(1);
        this.controlsUDButton.setFrame(0);
      }
      
      if (withScale) {
        this.controlsLRButton.setScale(1.00);
        this.controlsUDButton.setScale(1.15);
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