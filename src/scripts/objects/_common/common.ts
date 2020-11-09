export default class Common {
    static delay(milliseconds: number, count?: number): Promise<number> {
        return new Promise<number>(resolve => {
            setTimeout(() => {
                resolve(count);
            }, milliseconds);
        });
    }

    static fillZeroPadding(number: number, size: number): string {
        let stringNumber = number.toString();

        while (stringNumber.length < (size || 2)) {
            stringNumber = "0" + stringNumber;
        }

        return stringNumber;
    }

    static isImgOutOfScreen(img: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite, screen: Phaser.Cameras.Scene2D.Camera): boolean {
        return (
            img.x + (img.width * img.scaleX) < 0 ||
            img.x > screen.width ||
            img.y + (img.height * img.scaleY) < 0 ||
            img.y > screen.height
        );
    };
    
    static getRandomEnumKey(objEnum: Object): any {
        return Object.keys(objEnum)[
            Phaser.Math.Between(0, Object.keys(objEnum).length - 1)
        ];
    }

    static getRandomEnumValue(objEnum: Object): any {
        return Object.values(objEnum)[
            Phaser.Math.Between(0, Object.keys(objEnum).length - 1)
        ];
    }

    // static getOriginMappingCoords(origin: Origin): Phaser.Math.Vector2 {
    //     return
    // }
}

export type Range = {
    from: number;
    to: number;
};

export enum Direction { 
    LEFT = 'left', 
    RIGHT = 'right', 
    UP = 'up', 
    DOWN = 'down', 
    FRONT = 'front', 
    BACK = 'back' 
};

export enum Origin {
    UP_LEFT_CORNER = 0x000011,
    UP_RIGHT_CORNER = 0x000010,
    DOWN_LEFT_CORNR = 0x000001,
    DOWN_RIGHT_CORNER = 0x000000,
    CENTER = 0x000100
};

export enum LayerIDX {
    GUI = 999
};