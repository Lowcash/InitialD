import { Range } from './common' 

export function isString(obj: string | any): obj is string {
    return (obj as string) !== undefined;
}

export function isRange(obj: Range | any): obj is Range {
    return (obj as Range).from !== undefined && (obj as Range).to !== undefined;
}

export function isSprite(obj: Phaser.Physics.Arcade.Sprite | any): obj is Phaser.Physics.Arcade.Sprite {
    return (obj as Phaser.Physics.Arcade.Sprite) !== undefined;
}

export function isTileSprite(obj: Phaser.GameObjects.TileSprite | any): obj is Phaser.GameObjects.TileSprite {
    return (obj as Phaser.GameObjects.TileSprite) !== undefined;
}