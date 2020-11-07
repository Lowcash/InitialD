import IMovable from "./interfaces/IMovable";

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

export default class Map implements IMovable {
    private readonly scene: Phaser.Scene;
    private readonly scale: number;
    
    private readonly depthLayer: number;

    private road: Chunks = {
        images: [],
        properties: []
    };

    private group?: Phaser.Physics.Arcade.Group;

    private mapXOffset: number;
    private mapYOffset: number;

    speed: number = 0;

    constructor(scene: Phaser.Scene, depthLayer: number, mapStartX: number, mapStartY, chunkScale: number = 5, numChunkToGenerate: number = 10) {
        this.scene = scene;
        this.scale = chunkScale;

        this.mapXOffset = mapStartX;
        this.mapYOffset = mapStartY;

        this.depthLayer = depthLayer;

        for (let i = 0; i < numChunkToGenerate; ++i) {
            this.appendChunk(roadChunks[ChunkType.ROAD_STRAIGHT]);
        }

        this.registerChunks();
    }
    
    public move(): void {
        this.group?.incX(this.speed);

        if(this.road.images[0].x <= this.road.images[0].width * this.scale * - 1) {
            this.shiftChunk();

            this.appendChunk(roadChunks[ChunkType.ROAD_STRAIGHT]);

            this.registerChunks();
        }
    }

    public changeSpeed(speed: number): void {
        this.speed = speed;

        this.scene.events.emit('onMapSpeedChanged', this.speed);
    }

    public getSpeed(): number {
        return this.speed;
    }

    public getRandomLaneIdx(roadIdx: number): number {
        return Phaser.Math.Between(0, this.getNumRoadChunkLanes(roadIdx) - 1);
    }

    public getRandomRoadIdx(from: number = 0, to?: number): number {
        return Phaser.Math.Between(from, to ?? this.road.images.length - 1);
    }

    public getChunkCenter(chunkIdx): Phaser.Math.Vector2 {
        return this.road.images[chunkIdx].getCenter();
    }

    public getLanePosition(roadChunkId: number, laneId: number): number {
        return this.road.images[
            roadChunkId].getBottomCenter().y - (this.road.properties[roadChunkId].lanes[laneId].position * this.scale);
    }

    public getPerspectiveScale(roadChunkId: number, laneId: number): number {
        return this.road.properties[roadChunkId].lanes[laneId].perspectiveScale * this.scale;
    }

    public getNumRoadChunks(): number {
        return this.road.images.length;
    }

    public getNumRoadChunkLanes(roadChunkId: number): number {
        return this.road.properties[roadChunkId].lanes.length;
    }

    private shiftChunk(): void {
        this.road.properties.shift();

        const firstRoadChunk = this.road.images.shift() as Phaser.GameObjects.Image;

        this.group?.remove(firstRoadChunk);
        
        firstRoadChunk.destroy();
    }

    private appendChunk(chunk: RoadChunkProperties): void {
        let x = this.mapXOffset;

        if (this.road.images.length > 0) {
            x = (this.road.images[this.road.images.length - 1].x + this.road.images[this.road.images.length - 1].width * this.scale);
        }

        this.road.images.push(
            this.scene.add.image(
                x, 
                this.mapYOffset, 
                chunk.mappingKey)
                    .setScale(this.scale)
                    .setOrigin(0)
                    .setDepth(this.depthLayer)
        );
        
        this.road.properties.push(chunk);
    }

    private registerChunks(): void{
        this.group = this.scene.physics.add.group(this.road.images);
    }
};