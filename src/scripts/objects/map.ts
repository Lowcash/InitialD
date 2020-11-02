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
            new LaneProperties(0, 5, 1.00),
            new LaneProperties(1, 13, 0.93),
            new LaneProperties(2, 21, 0.86),
            new LaneProperties(3, 29, 0.79)
        ], 
        [
            ChunkType.ROAD_STRAIGHT, ChunkType.ROAD_STRAIGHT, ChunkType.ROAD_STRAIGHT
        ]
    )
];

interface Chunks {
    images: Array<Phaser.GameObjects.Image>;
    properties: Array<RoadChunkProperties>;
    group?: Phaser.Physics.Arcade.Group;
};

export class Map {
    private readonly scene: Phaser.Scene;
    private readonly scale: number;
    
    private road: Chunks = {
        images: [],
        properties: []
    };

    private group?: Phaser.Physics.Arcade.Group;

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
    
    public moveMap(speed: number): void {
        this.group?.incX(speed);

        if(this.road.images[0].x <= this.road.images[0].width * this.scale * - 1) {
            this.shiftChunk();

            this.appendChunk(roadChunks[ChunkType.ROAD_STRAIGHT], this.scale, this.mapXOffset, this.mapYOffset);

            this.registerChunks();
        }
    }

    public getRandomRoadIdx(from: number = 0, to?: number): number {
        return Phaser.Math.Between(from, to ?? this.road.images.length - 1);
    }

    public getLanePosition(roadChunkId: number, laneId: number): number {
        return this.road.images[
            roadChunkId].getBottomCenter().y - (this.road.properties[roadChunkId].lanes[laneId].position * this.scale);
    }

    public getPerspectiveScale(roadChunkId: number, laneId: number): number {
        return this.road.properties[roadChunkId].lanes[laneId].perspectiveScale * this.scale;
    }

    public getRoadChunkLanes(roadChunkId: number) {
        return this.road.properties[roadChunkId].lanes.length;
    }

    private shiftChunk(): void {
        this.road.properties.shift();

        const firstRoadChunk = this.road.images.shift() as Phaser.GameObjects.Image;

        this.group?.remove(firstRoadChunk);

        firstRoadChunk.destroy();
    }

    private appendChunk(chunk: RoadChunkProperties, scale: number, positionX: number, positionY: number = 1): void {
        this.road.images.push(
            this.scene.add.image(
                positionX, 
                positionY, 
                chunk.mappingKey)
                    .setScale(scale)
                    .setOrigin(0)
        );
        
        this.road.properties.push(chunk);
    }

    private registerChunks() : void{
        this.group = this.scene.physics.add.group(this.road.images);
    }
};