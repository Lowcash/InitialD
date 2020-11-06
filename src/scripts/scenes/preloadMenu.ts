import { Mapping } from '../objects/common'

export class PreloadDataModel {
    font: Mapping;
    imageLogo: Mapping;
    imageCity: Mapping;
    imageHill: Mapping;
    spriteArrows: Mapping;
    spriteStart: Mapping;
    soundButton: Mapping;
    imageRoadStraight: Mapping;
    atlasVehicle: Mapping;
}

const dataModel: PreloadDataModel = {
    font: {
        mappingKey: 'font'
    },
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
    },
    imageRoadStraight: {
        mappingKey: 'image_road_straight'
    },
    atlasVehicle: {
        mappingKey: 'atlas_vehicles'
    },

};

export default class PreloadMenu extends Phaser.Scene {
    constructor() {
      super({ key: 'PreloadMenu' })
    }

    private preload(): void {
        this.load.bitmapFont(dataModel.font.mappingKey, 'assets/img/font.png', 'assets/img/font.xml');

        this.load.image(dataModel.imageLogo.mappingKey, 'assets/img/logo.png');
        this.load.image(dataModel.imageCity.mappingKey, 'assets/img/city.jpg');
        this.load.image(dataModel.imageHill.mappingKey, 'assets/img/hills.png');

        this.load.spritesheet(
            dataModel.spriteArrows.mappingKey, 
            'assets/img/buttons/arrows_new.png', 
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

        this.load.image(dataModel.imageRoadStraight.mappingKey, 'assets/img/road_straight_3.png');

        this.load.atlas(
            dataModel.atlasVehicle.mappingKey,
            'assets/img/vehicle_atlas_mapping.png',
            'assets/img/vehicle_atlas_mapping.json'
        );

        this.load.audio('sound_explosion', 'assets/sound/explosion.wav');
    }

    private create(): void {
        this.scene.start('SceneMenu', dataModel);
    }
}