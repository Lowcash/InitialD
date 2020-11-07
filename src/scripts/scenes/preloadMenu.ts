import { sourceModel } from '../models/source'

export default class PreloadMenu extends Phaser.Scene {
    constructor() {
      super({ key: 'PreloadMenu' })
    }

    private preload(): void {
        this.load.bitmapFont(sourceModel.font.mappingKey, sourceModel.font.sourcePath, sourceModel.font.sourceMapperPath);

        this.load.image(sourceModel.imageLogo.mappingKey, sourceModel.imageLogo.sourcePath);
        this.load.image(sourceModel.imageCity.mappingKey, sourceModel.imageCity.sourcePath);
        this.load.image(sourceModel.imageHill.mappingKey, sourceModel.imageHill.sourcePath);

        this.load.spritesheet(
            sourceModel.spriteArrows.mappingKey, 
            sourceModel.spriteArrows.sourcePath, 
            { 
                frameWidth: 190, 
                frameHeight: 76 
            }
        );

        this.load.spritesheet(
            sourceModel.spriteStart.mappingKey, 
            sourceModel.spriteStart.sourcePath, 
            { 
                frameWidth: 191, 
                frameHeight: 69 
            }
        );

        this.load.audio(sourceModel.soundButton.mappingKey, sourceModel.soundButton.sourcePath);

        this.load.image(sourceModel.imageRoadStraight.mappingKey, sourceModel.imageRoadStraight.sourcePath);

        this.load.atlas(
            sourceModel.atlasVehicle.mappingKey,
            sourceModel.atlasVehicle.sourcePath,
            sourceModel.atlasVehicle.sourceMapperPath
        );
    }

    private create(): void {
        this.scene.start('SceneMenu');
    }
}