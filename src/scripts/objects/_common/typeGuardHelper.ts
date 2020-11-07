import { Range } from './common'

export default class TypeGuardHelper {
    static isString(obj: string | any): obj is string {
        return (obj as string) !== undefined;
    }
    
    static isRange(obj: Range | any): obj is Range {
        return (obj as Range).from !== undefined && (obj as Range).to !== undefined;
    }
    
    static isSprite(obj: Phaser.Physics.Arcade.Sprite | any): obj is Phaser.Physics.Arcade.Sprite {
        return (obj as Phaser.Physics.Arcade.Sprite) !== undefined;
    }
    
    static isTileSprite(obj: Phaser.GameObjects.TileSprite | any): obj is Phaser.GameObjects.TileSprite {
        return (obj as Phaser.GameObjects.TileSprite) !== undefined;
    }
}