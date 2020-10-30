enum Direction {
    None = -1, Up = 0, Down, Left, Right
};

class ChunkProperties {
    key: string;

    width: number;
    height: number;

    level: number;
    direction: Direction;

    constructor(key: string, width: number, height: number, direction: Direction, level: number) {
        this.key = key;

        this.width = width;
        this.height = height;

        this.direction = direction;
        this.level = level;
    } 
};

enum ChunkMapping {
    RoadStraight = 0, RoadDown0, RoadDown1, RoadUp0, RoadUp1 
};

const chunks: Array<ChunkProperties> = [
    new ChunkProperties('image_road_straight', 35, 12, Direction.None, 0),
    new ChunkProperties('image_road_down_0', 35, 12, Direction.Down, 1),
    new ChunkProperties('image_road_down_1', 35, 12, Direction.Down, 2),
    new ChunkProperties('image_road_up_0', 35, 12, Direction.Up, 1),
    new ChunkProperties('image_road_up_1', 35, 12, Direction.Up, 2)
];

export class Map {
    private roadChunks: Array<Phaser.GameObjects.Image> = [];

    private roadGroup?: Phaser.Physics.Arcade.Group;

    private heightLevel: number = 0;

    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, chunkScale: number = 5) {
        this.scene = scene;

        for (let i = 0; i < 5; ++i) {
            this.addChunk(chunks[Phaser.Math.Between(0, chunks.length - 1)], chunkScale);
        }

        for (let i = 0; i < 5; ++i) {
            this.addChunk(chunks[ChunkMapping.RoadDown1], chunkScale);
        }

        this.roadGroup = scene.physics.add.group(this.roadChunks);
        
        //this.roadGroup.remove(this.roadChunks[4]);
    }

    moveMap(speed: number) {
        this.roadGroup?.incX(speed);
    }

    private addChunk(chunk: ChunkProperties, scale: number) {
        const sceneCenterY: number = this.scene.cameras.main.centerY;

        if(chunk.direction === Direction.Up) {
            this.heightLevel -= chunk.level;
        }

        this.roadChunks.push(
            this.scene.add.image(
                this.roadChunks.length * chunk.width * scale, 
                sceneCenterY + chunk.height * scale * this.heightLevel, chunk.key)
                    .setScale(scale)
                    .setOrigin(0)
        );

        if(chunk.direction === Direction.Down) {
            this.heightLevel += chunk.level;
        }
    }
};