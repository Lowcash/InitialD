import Common from '../_common/common'

import IMovable from '../interfaces/IMovable'

import { ChunkType, RoadChunkProperties, roadChunks } from './chunk'

export default class Map implements IMovable {
    private readonly scene: Phaser.Scene;
    
    private readonly depthLayer: number;

    private readonly road: {
        images: Array<Phaser.GameObjects.Image>;
        properties: Array<RoadChunkProperties>;

        group?: Phaser.Physics.Arcade.Group;
    } = {
        images: [],
        properties: []
    };

    private readonly defaultMapOffset: Phaser.Math.Vector2;
    private mapOffset: Phaser.Math.Vector2;

    speed: number = 0;

    constructor(scene: Phaser.Scene, depthLayer: number, mapStartPos: Phaser.Math.Vector2, numChunkToGenerate: number) {
        this.scene = scene;

        this.depthLayer = depthLayer;

        this.defaultMapOffset = new Phaser.Math.Vector2(mapStartPos);
        this.mapOffset = mapStartPos;

        this.generateMap(numChunkToGenerate);
    }

    public generateMap(numChunkToGenerate: number = 10): void {
        this.clearMap();

        for (let i = 0; i < numChunkToGenerate; ++i) {
            this.appendChunk(Map.getRandomRoadChunk());
        }

        this.registerChunks();
    }

    public move(): void {
        this.road.group?.incX(this.speed);

        if (Common.isImgOutOfScreen(this.road.images[1], this.scene.cameras.main)) {
            this.shiftChunk();

            this.appendChunk(Map.getRandomRoadChunk());

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
            roadChunkId].getBottomCenter().y - (this.road.properties[roadChunkId].lanes[laneId].position);
    }

    public getPerspectiveScale(roadChunkId: number, laneId: number): number {
        return this.road.properties[roadChunkId].lanes[laneId].perspectiveScale;
    }

    public getNumRoadChunks(): number {
        return this.road.images.length;
    }

    public getNumRoadChunkLanes(roadChunkId: number): number {
        return this.road.properties[roadChunkId].lanes.length;
    }

    public static getRandomRoadChunk(): RoadChunkProperties {
        return roadChunks[Common.getRandomEnumValue(ChunkType)];
    }

    private clearMap(): void {
        this.mapOffset.x = this.defaultMapOffset.x;
        this.mapOffset.y = this.defaultMapOffset.y;

        this.road.group?.clear(true, true);

        this.road.properties = [];
        this.road.images = [];
    }

    private shiftChunk(): void {
        const firstRoadChunk = this.road.images.shift() as Phaser.GameObjects.Image;

        // this.road.group?.remove(firstRoadChunk);
        
        firstRoadChunk.destroy();

        this.road.properties.shift();
    }

    private appendChunk(chunk: RoadChunkProperties): void {
        const lastChunk: Phaser.GameObjects.Image = this.road.images[this.road.images.length - 1];

        if (lastChunk) {
            this.mapOffset.x = lastChunk.x + lastChunk.width;
            this.mapOffset.y = lastChunk.y;
        }

        this.road.images.push(
            this.scene.add.image(
                this.mapOffset.x, 
                this.mapOffset.y, 
                chunk.type)
                    .setOrigin(0.0, 1.0)
                    .setDepth(this.depthLayer)
        );
        
        this.road.properties.push(chunk);
    }

    private registerChunks(): void{
        this.road.group = this.scene.physics.add.group(this.road.images);
    }
};