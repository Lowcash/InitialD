export enum ChunkType {
    ROAD_STRAIGHT = 0
};

class LaneProperties {
    id: number;

    position: number;
    perspectiveScale: number; 

    constructor(id: number, position: number, perspectiveScale: number) {
        this.id = id;

        this.position = position;
        this.perspectiveScale = perspectiveScale;
    }
};

class RoadChunkProperties {
    mappingKey: string;
    type: ChunkType;

    width: number;
    height: number;

    lanes: LaneProperties[];

    possibleNextType: ChunkType[];

    constructor(mappingKey: string, type: ChunkType, width: number, height: number, lanes: LaneProperties[], possibleNextType: ChunkType[]) {
        this.mappingKey = mappingKey;
        this.type = type;

        this.width = width;
        this.height = height;

        this.lanes = lanes;

        this.possibleNextType = possibleNextType;
    } 
};

const roadChunks: Array<RoadChunkProperties> = [
    new RoadChunkProperties(
        'image_road_straight', 
        ChunkType.ROAD_STRAIGHT, 
        36, 
        12, 
        [
            new LaneProperties(0, 0, 1.00),
            new LaneProperties(1, 10, 0.93),
            new LaneProperties(2, 19, 0.86),
            new LaneProperties(3, 28, 0.79)
        ], 
        [
            ChunkType.ROAD_STRAIGHT, ChunkType.ROAD_STRAIGHT, ChunkType.ROAD_STRAIGHT
        ]
    )
];

export class Map {
    private readonly scene: Phaser.Scene;
    private readonly scale: number;

    chunks: Array<Phaser.GameObjects.Image> = [];
    chunksProperties: Array<RoadChunkProperties> = [];

    group?: Phaser.Physics.Arcade.Group;

    private mapXOffset: number;
    private mapYOffset: number;

    constructor(scene: Phaser.Scene, mapStartX: number, mapStartY, chunkScale: number = 5, numChunkToGenerate: number = 10) {
        this.scene = scene;
        this.scale = chunkScale;

        this.mapXOffset = mapStartX;
        this.mapYOffset = mapStartY;
        
        for (let i = 0; i < numChunkToGenerate; ++i) {
            this.mapXOffset = i * roadChunks[ChunkType.ROAD_STRAIGHT].width * this.scale;

            this.appendChunk(roadChunks[ChunkType.ROAD_STRAIGHT], this.scale, this.mapXOffset, this.mapYOffset);
        }

        this.registerChunks();

        //this.scene.events.emit('abcd', 55);
    }
    
    moveMap(speed: number) {
        this.group?.incX(speed);

        if(this.chunks[0].x <= this.chunks[0].width * this.scale * - 1) {
            this.shiftChunk();

            this.appendChunk(roadChunks[ChunkType.ROAD_STRAIGHT], this.scale, this.mapXOffset, this.mapYOffset);

            this.registerChunks();
        }
    }

    private shiftChunk() {
        this.chunksProperties.shift();

        const firstRoadChunk = this.chunks.shift() as Phaser.GameObjects.Image;

        this.group?.remove(firstRoadChunk);

        firstRoadChunk.destroy();
    }

    private appendChunk(chunk: RoadChunkProperties, scale: number, positionX: number, positionY: number = 1) {
        this.chunks.push(
            this.scene.add.image(
                positionX, 
                positionY, 
                chunk.mappingKey)
                    .setScale(scale)
                    .setOrigin(0)
        );
        
        this.chunksProperties.push(chunk);
    }

    private registerChunks() {
        this.group = this.scene.physics.add.group(this.chunks);
    }

    getLanePosition(roadChunkId: number, laneId: number): number {
        return this.chunks[
            roadChunkId].getBottomCenter().y - (this.chunksProperties[roadChunkId].lanes[laneId].position * this.scale);
    }

    getPerspectiveScale(roadChunkId: number, laneId: number): number {
        return this.chunksProperties[roadChunkId].lanes[laneId].perspectiveScale * this.scale;
    }

    getRoadChunkLanes(roadChunkId: number) {
        return this.chunksProperties[roadChunkId].lanes.length;
    }

    // private getRandomChunk(): RoadChunkProperties {
    //     const lastChunkType: ChunkType = this.roadChunksType[this.roadChunksType.length - 1];
        
    //     const possibleChunkTypes: ChunkType[] = 
    //         chunks[lastChunkType].possibleNextType;
        
    //     return chunks[
    //         possibleChunkTypes[
    //             Phaser.Math.Between(0, possibleChunkTypes.length - 1)
    //         ]
    //     ];
    // }
};