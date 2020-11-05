import { Mapping } from '../objects/common'

export class PreloadDataModel {
    imageLogo: Mapping;
    imageCity: Mapping;
    imageHill: Mapping;
    spriteArrows: Mapping;
    spriteStart: Mapping;
    soundButton: Mapping;
}

const dataModel: PreloadDataModel = {
    imageLogo: {
        mappingKey: 'image_logo'
    },
    imageCity: {
        mappingKey: 'image_city'
    },
    imageHill: {
        mappingKey: 'image_hill'
    },
    spriteArrows: {
        mappingKey: 'sprite_arrows'
    },
    spriteStart: {
        mappingKey: 'sprite_sheet_start'
    },
    soundButton: {
        mappingKey: 'sound_button'
    }
};

export default class PreloadMenu extends Phaser.Scene {
    constructor() {
      super({ key: 'PreloadMenu' })
    }

    private preload(): void {
        this.load.image(dataModel.imageLogo.mappingKey, 'assets/img/logo.png');
        this.load.image(dataModel.imageCity.mappingKey, 'assets/img/city.jpg');
        this.load.image(dataModel.imageHill.mappingKey, 'assets/img/hills_0.png');

        this.load.spritesheet(
            dataModel.spriteArrows.mappingKey, 
            'assets/img/buttons/arrows.png', 
            { 
                frameWidth: 190, 
                frameHeight: 76 
            }
        );

        this.load.spritesheet(
            dataModel.spriteStart.mappingKey, 
            'assets/img/buttons/sprite_sheet_start.png', 
            { 
                frameWidth: 191, 
                frameHeight: 69 
            }
        );

        this.load.audio(dataModel.soundButton.mappingKey, 'assets/sound/button.wav');
    }

    private create(): void {
        this.scene.start('SceneMenu', dataModel);
    }
}