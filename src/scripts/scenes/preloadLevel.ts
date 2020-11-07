import { sourceModel } from '../models/source'
import { SettingsModel } from '../models/settings'

export default class PreloadLevel extends Phaser.Scene {
  private menuSettings: SettingsModel;

  constructor() {
    super({ key: 'PreloadLevel' })
  }

  private init(data: SettingsModel): void {
    this.menuSettings = data;
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

    this.load.spritesheet(
      sourceModel.spriteExplosion.mappingKey,
      sourceModel.spriteExplosion.sourcePath,
      {
        frameWidth: 17,
        frameHeight: 17
      }
    );
    
   this.load.audio(sourceModel.soundExplosion.mappingKey, sourceModel.soundExplosion.sourcePath);

    this.load.spritesheet(
      sourceModel.spriteCoin.mappingKey,
      sourceModel.spriteCoin.sourcePath,
      {
        frameWidth: 32,
        frameHeight: 32
      }
    );

    this.load.audio(sourceModel.soundCoin.mappingKey, sourceModel.soundCoin.sourcePath);
  }

  private create(): void {
    this.scene.start('SceneLevel', this.menuSettings);
  }
}
