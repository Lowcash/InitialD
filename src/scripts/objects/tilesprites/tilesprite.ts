import IMovable from '../interfaces/IMovable'
import { Mapping } from '../_common/mappingHelper';

export interface BackgroundTileSpriteMapping extends Mapping {
    tileSprite?: BackgroundTileSprite;

    bottomOffsetMult?: number;
    
    origin?: Phaser.Math.Vector2;
    outerScale?: number;
    innerScale?: number;

    moveSpeed: number;

    depth?: number;
};

export default class BackgroundTileSprite extends Phaser.GameObjects.TileSprite implements IMovable {
    public speed: number;

    constructor(scene: Phaser.Scene, mappingKey: string, speed: number, outerScale?: number, innerScale?: number, depth?: number, origin?: Phaser.Math.Vector2, bottomOffsetMult: number = 1.0) {
        super(
            scene, 
            scene.cameras.main.centerX, 
            scene.cameras.main.height * bottomOffsetMult,
            0,
            0,
            mappingKey
        );

        this.speed = speed;
        
        if (origin) {
            this.setOrigin(origin.x, origin.y);
        }

        if (outerScale) {
            this.setScale(outerScale);
        }

        if (innerScale) {
            this.setTileScale(innerScale);
        }

        if (depth) {
            this.setDepth(depth);
        }

        scene.add.existing(this);
     }

     public setSpeed(speed: number): void {
         this.speed = speed;
     }

     public move(): void {
         this.tilePositionX += this.speed;
     }
  }