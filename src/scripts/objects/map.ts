enum Direction {
    None = -1, Up = 0, Down, Left, Right
};

export enum RoadLane { 
    Left = 0, Right 
};

export enum ChunkMapping {
    RoadStraight = 0, RoadDown0, RoadDown1, RoadUp0, RoadUp1 
};

class ChunkProperties {
    key: string;
    mappingKey: ChunkMapping;

    width: number;
    height: number;

    level: number;
    direction: Direction;
    possibleNext: ChunkMapping[];

    constructor(key: string, mappingKey: ChunkMapping, width: number, height: number, direction: Direction, level: number, possibleNext: ChunkMapping[]) {
        this.key = key;
        this.mappingKey = mappingKey;

        this.width = width;
        this.height = height;

        this.direction = direction;
        this.level = level;
        this.possibleNext = possibleNext;
    } 
};

const chunks: Array<ChunkProperties> = [
    new ChunkProperties('image_road_straight', ChunkMapping.RoadStraight, 35, 12, Direction.None, 0, [
        ChunkMapping.RoadStraight, ChunkMapping.RoadStraight, ChunkMapping.RoadStraight,
        ChunkMapping.RoadUp0, ChunkMapping.RoadDown0
    ] 
     ),
    new ChunkProperties('image_road_down_2', ChunkMapping.RoadDown0, 36, 12, Direction.Down, 1.5, [
        ChunkMapping.RoadDown0, ChunkMapping.RoadDown0, ChunkMapping.RoadDown0,
        ChunkMapping.RoadStraight, ChunkMapping.RoadDown1
    ]),
    new ChunkProperties('image_road_down_1', ChunkMapping.RoadDown1, 35, 12, Direction.Down, 2, [
        ChunkMapping.RoadDown1, ChunkMapping.RoadDown1, ChunkMapping.RoadDown1,
        ChunkMapping.RoadDown0
    ]),
    new ChunkProperties('image_road_up_0', ChunkMapping.RoadUp0, 35, 12, Direction.Up, 1, [
        ChunkMapping.RoadUp0, ChunkMapping.RoadUp0, ChunkMapping.RoadUp0,
        ChunkMapping.RoadUp1, ChunkMapping.RoadStraight
    ]),
    new ChunkProperties('image_road_up_1', ChunkMapping.RoadUp1, 35, 12, Direction.Up, 2, [
        ChunkMapping.RoadUp1, ChunkMapping.RoadUp1, ChunkMapping.RoadUp1, 
        ChunkMapping.RoadUp0
    ])
];

export class Map {
    private readonly scene: Phaser.Scene;
    private readonly scale: number;

    private roadChunks: Array<Phaser.GameObjects.Image> = [];
    private roadChunksType: Array<ChunkMapping> = [];

    private roadGroup?: Phaser.Physics.Arcade.Group;

    private mapStartY: number = 0;
    private readonly heightLevel: number = 0

    constructor(scene: Phaser.Scene, chunkScale: number = 5, mapStartX: number, mapStartY) {
        this.scene = scene;
        this.scale = chunkScale;
        this.mapStartY = mapStartY;

        for (let i = 0; i < 10; ++i) {
            this.heightLevel = i + i * 0.5;

            this.addChunk(chunks[ChunkMapping.RoadDown0], this.scale, this.heightLevel);
        }

        this.registerChunks();

        //this.scene.events.emit('abcd', 55);
    }
    
    moveMap(speed: number) {
        this.roadGroup?.incXY(speed, speed * 0.5);

        if(this.roadChunks[0].x < 0) {
            this.removeChunk();

            this.addChunk(chunks[ChunkMapping.RoadDown0], this.scale, this.heightLevel);

            this.registerChunks();
        }
    }

    private removeChunk() {
        this.roadChunksType.shift();

        const firstRoadChunk = this.roadChunks.shift() as Phaser.GameObjects.Image;

        this.roadGroup?.remove(firstRoadChunk);

        firstRoadChunk.destroy();
    }

    private addChunk(chunk: ChunkProperties, scale: number, heightLevel: number = 1) {
        this.roadChunks.push(
            this.scene.add.image(
                this.roadChunks.length * chunk.width * scale, 
                this.mapStartY + chunk.height * scale * heightLevel, 
                chunk.key)
                    .setScale(scale)
                    .setOrigin(0)
        );
        
        this.roadChunksType.push(chunk.mappingKey);
    }

    private registerChunks() {
        this.roadGroup = this.scene.physics.add.group(this.roadChunks);
    }

    private getRandomChunk(): ChunkProperties {
        const lastChunkType: ChunkMapping = this.roadChunksType[this.roadChunksType.length - 1];
        
        const possibleChunkTypes: ChunkMapping[] = 
            chunks[lastChunkType].possibleNext;
        
        return chunks[
            possibleChunkTypes[
                Phaser.Math.Between(0, possibleChunkTypes.length - 1)
            ]
        ];
    }

    getActualChunk(): ChunkMapping {
        return this.roadChunksType[0];
    }
};