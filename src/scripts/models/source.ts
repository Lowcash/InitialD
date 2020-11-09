import { Mapping } from '../objects/_common/mappingHelper'

interface SourceMapping extends Mapping {
    sourcePath: string;
    sourceMapperPath?: string;
};

class SourceModel {
    font: SourceMapping;
    imageLogo: SourceMapping;
    imageCity: SourceMapping;
    imageHill: SourceMapping;
    imageClouds: SourceMapping;
    imageForest: SourceMapping;
    spriteArrowsSelect: SourceMapping;
    spriteArrowsPlay: SourceMapping;
    spriteStart: SourceMapping;
    spriteGameOverStart: SourceMapping;
    soundButton: SourceMapping;
    imageRoadStraight0: SourceMapping;
    imageRoadStraight1: SourceMapping;
    atlasVehicle: SourceMapping;
    spriteExplosion: SourceMapping;
    soundExplosion: SourceMapping;
    spriteCoin: SourceMapping;
    soundCoin: SourceMapping;
};

export const sourceModel: SourceModel = {
    font: {
        mappingKey: 'font',
        sourcePath: 'assets/img/font.png',
        sourceMapperPath: 'assets/img/font.xml'
    },
    imageLogo: {
        mappingKey: 'image_logo',
        sourcePath: 'assets/img/logo.png'
    },
    imageCity: {
        mappingKey: 'image_city',
        sourcePath: 'assets/img/background/city.png'
    },
    imageHill: {
        mappingKey: 'image_hill',
        sourcePath: 'assets/img/background/hills.png'
    },
    imageClouds: {
        mappingKey: 'image_clouds',
        sourcePath: 'assets/img/background/clouds.png'
    },
    imageForest: {
        mappingKey: 'image_forest',
        sourcePath: 'assets/img/background/forest.png'
    },
    spriteArrowsSelect: {
        mappingKey: 'sprite_arrows_select',
        sourcePath: 'assets/img/buttons/arrows_select.png'
    },
    spriteArrowsPlay: {
        mappingKey: 'sprite_arrows_play',
        sourcePath: 'assets/img/buttons/arrows_play.png'
    },
    spriteStart: {
        mappingKey: 'sprite_sheet_start',
        sourcePath: 'assets/img/buttons/start.png'
    },
    spriteGameOverStart: {
        mappingKey: 'sprite_game_over_start',
        sourcePath: 'assets/img/buttons/game_over_start.png'
    },
    soundButton: {
        mappingKey: 'sound_button',
        sourcePath: 'assets/sound/button.wav'
    },
    imageRoadStraight0: {
        mappingKey: 'image_road_straight_0',
        sourcePath: 'assets/img/map/road_straight_0.png'
    },
    imageRoadStraight1: {
        mappingKey: 'image_road_straight_1',
        sourcePath: 'assets/img/map/road_straight_1.png'
    },
    atlasVehicle: {
        mappingKey: 'atlas_vehicles',
        sourcePath: 'assets/img/vehicles/atlas_mapping.png',
        sourceMapperPath: 'assets/img/vehicles/atlas_mapping.json'
    },
    spriteExplosion: {
        mappingKey: 'sprite_explosion',
        sourcePath: 'assets/img/vehicles/explosion.png'
    },
    soundExplosion: {
        mappingKey: 'sound_explosion',
        sourcePath: 'assets/sound/explosion.wav'
    },
    spriteCoin: {
        mappingKey: 'sprite_coin',
        sourcePath: 'assets/img/reward/coin.png'
    },
    soundCoin: {
        mappingKey: 'sound_coin',
        sourcePath: 'assets/sound/coin.wav'
    }
};
