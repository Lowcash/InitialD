export default class PreloadMenu extends Phaser.Scene {
    constructor() {
      super({ key: 'PreloadMenu' })
    }

    private preload(): void {
        this.load.image('image_logo', 'assets/img/logo.png');

        this.load.spritesheet(
            'sprite_arrows', 
            'assets/img/buttons/arrows.png', 
            { 
                frameWidth: 190, 
                frameHeight: 76 
            }
        );

        this.load.spritesheet(
            'sprite_sheet_start', 
            'assets/img/buttons/sprite_sheet_start.png', 
            { 
                frameWidth: 191, 
                frameHeight: 69 
            }
        );

        this.load.audio('sound_button_pressed', 'assets/img/sfx_sounds_button6.wav');
    }

    private create(): void {
        this.scene.start('SceneMenu');
    }
}