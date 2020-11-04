export class Common {
    static delay(milliseconds: number, count: number): Promise<number> {
        return new Promise<number>(resolve => {
            setTimeout(() => {
                resolve(count);
            }, milliseconds);
        });
    }
}

export type Range = {
    from: number;
    to: number;
};

export interface KeyMapping {
    key: string;

    mappingKey: string;
}

export interface SpriteMapping extends KeyMapping {
    sprite?: Phaser.Physics.Arcade.Sprite | Phaser.GameObjects.TileSprite;
};

export interface SpriteMappingSized extends SpriteMapping {
    size: number;
}