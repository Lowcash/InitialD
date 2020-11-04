import '../objects/basicButton'
import BasicButton from '../objects/basicButton';

export default class SceneMenu extends Phaser.Scene {
  private startButton: BasicButton;

  private startButtonScale: number = 1.5;
  private startButtonHoverScale: number = 1.55;

    constructor() {
      super({ key: 'SceneMenu' })
    }

    private create(): void {
      this.add.image(this.cameras.main.centerX, 100, 'image_logo');

      this.startButton = new BasicButton(
        this, 
        new Phaser.Math.Vector2(
          this.cameras.main.centerX,
          this.cameras.main.centerY
        ),
        'sprite_sheet_start',
        this.startButtonScale,
        'sound_button_pressed'
      );
      
      this.startButton.setInteractive();

      this.startButton.on('pointerover', this.handleHoverStartButton, this);
      this.startButton.on('pointerout', this.handleEndHoverStartButton, this);
      this.startButton.on('pointerdown', this.handlePressedStartButton, this);
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

      this.scene.start('PreloadLevel');
    }
}