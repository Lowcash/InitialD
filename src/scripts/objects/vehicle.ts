import { Common, Range } from './common';
import { isRange } from './typeGuardHelper'
import { Map } from './map'

import IMovable from './IMovable';

enum Direction {
    FRONT = 'front', LEFT = 'left', RIGHT = 'right'
}

export enum VehicleType {
    AE_86_TRUENO = 0, AE_86_LEVIN, EVO_3, EVO_4, _180_SX, CIVIC, R_32, RX_7_FC, RX_7_FD, S_13
};

class VehicleProperties {
    mappingKey: string;
    type: VehicleType;

    width: number;
    height: number;

    speed: Range;
    turningStrength: number;

    constructor(mappingKey: string, type: VehicleType, width: number, height: number, speed: Range, turningStrength: number) {
        this.mappingKey = mappingKey;
        this.type = type;

        this.width = width;
        this.height = height;

        this.speed = speed;
        this.turningStrength = turningStrength;
    } 
};

export const vehicles: Array<VehicleProperties> = [
    new VehicleProperties('ae_86_trueno', VehicleType.AE_86_TRUENO, 36, 16, {from: 200, to: 300}, 130),
    new VehicleProperties('ae_86_levin', VehicleType.AE_86_LEVIN, 36, 16, {from: 200, to: 300}, 130),
    new VehicleProperties('evo_3', VehicleType.EVO_3, 36, 16, {from: 300, to: 350}, 150),
    new VehicleProperties('evo_4', VehicleType.EVO_4, 36, 16, {from: 320, to: 370}, 170),
    new VehicleProperties('180_sx', VehicleType._180_SX, 36, 16, {from: 250, to: 300},  140),
    new VehicleProperties('civic', VehicleType.CIVIC, 36, 16, {from: 270, to: 320},  140),
    new VehicleProperties('r_32', VehicleType.R_32, 36, 16, {from: 300, to: 350},  140),
    new VehicleProperties('rx_7_fc', VehicleType.RX_7_FC, 36, 16, {from: 280, to: 350},  140),
    new VehicleProperties('rx_7_fd', VehicleType.RX_7_FD, 36, 16, {from: 290, to: 350},  140),
    new VehicleProperties('s_13', VehicleType.S_13, 36, 16, {from: 250, to: 300},  140)
];

export function getRandomSpeed(vehicle: VehicleProperties): number {
    return Phaser.Math.Between(
        vehicle.speed.from, vehicle.speed.to
    );
}

export class Vehicle implements IMovable {
    private readonly texture: HTMLImageElement | HTMLCanvasElement | Phaser.GameObjects.RenderTexture;

    private readonly scene: Phaser.Scene;
    private readonly map: Map;

    private sprite: Phaser.Physics.Arcade.Sprite;
    private type: VehicleType;

    private lane: number;

    private isTurning: boolean = false;
    
    constructor(scene: Phaser.Scene, map: Map, startChunk: Range | number, startRoadLane: number = 0, scale: number = 5, type: VehicleType = VehicleType.AE_86_TRUENO) {
        this.scene = scene;
        this.map = map;
        
        this.lane = startRoadLane;
        this.type = type;

        this.texture = this.scene.textures.get(vehicles[type].mappingKey).getSourceImage();

        const randomIdx = isRange(startChunk) ?
            this.map.getRandomRoadIdx(startChunk.from, startChunk.to) :
            this.map.getRandomRoadIdx(startChunk);

        this.sprite = 
            this.scene.physics.add.sprite(
                randomIdx * this.texture.width * scale, 
                this.map.getLanePosition(0, this.lane), 
                'atlas_vehicles',
                `${vehicles[type].mappingKey}/${Direction.FRONT.toString()}`
            ).setScale(this.map.getPerspectiveScale(randomIdx, this.lane))
             .setOrigin(0.5, 1.0)
             .setDepth(this.map.getNumRoadChunkLanes(randomIdx) - this.lane);
        
        this.createVehicleAnim(Direction.FRONT.toString());
        this.createVehicleAnim(Direction.LEFT.toString());
        this.createVehicleAnim(Direction.RIGHT.toString());

        this.sprite?.anims.play(`${vehicles[this.type].mappingKey}_${Direction.FRONT.toString()}`, true);
    }

    public destroy() {
        this.sprite?.destroy();
    }

    public getSprite(): Phaser.Physics.Arcade.Sprite {
        return this.sprite;
    }

    public getPosition(): Phaser.Geom.Point {
        const vehicleCenter = this.sprite?.getCenter();

        return new Phaser.Geom.Point(vehicleCenter?.x, vehicleCenter?.y);
    }

    public getLane(): number {
        return this.lane;
    }

    public getFront(): Phaser.Geom.Point {
        const vehicleFront = this.sprite?.getRightCenter();

        return new Phaser.Geom.Point(vehicleFront?.x, vehicleFront?.y);
    }

    public turnLeft() {
        if(!this.isTurning && this.lane < this.map.getNumRoadChunkLanes(0) - 1) {
            this.turn(Direction.LEFT, vehicles[this.type].turningStrength);

            this.lane++;

            this.isTurning = true;
        }
    }

    public turnRight() {
        if(!this.isTurning && this.lane > 0) {
            this.turn(Direction.RIGHT, vehicles[this.type].turningStrength);

            this.lane--;

            this.isTurning = true;
        }
    }

    public getIsTurning(): boolean {
        return this.isTurning;
    }

    public slowDown(speed: number) {
        this.sprite?.setVelocityX(-192);
    }

    private createVehicleAnim(direction: string) {
        this.scene.anims.create({
            key: `${vehicles[this.type].mappingKey}_${direction}`,
            frames: [ { key: 'atlas_vehicles', frame: `${vehicles[this.type].mappingKey}/${direction}` } ],
            frameRate: 0
        });
    }

    private async turn(direction: Direction, velocity: number): Promise<void> {
        this.sprite?.anims.play(`${vehicles[this.type].mappingKey}_${direction}`, true);

        if(this.sprite) {
            switch(direction) {
                case Direction.LEFT: {
                    this.sprite?.setVelocityY(-velocity);

                    const position: number = this.map.getLanePosition(0, this.lane + 1);
                    const scale: number = this.map.getPerspectiveScale(0, this.lane + 1);
                    
                    for(let i = 0; this.sprite.y > position; ++i) {
                        this.sprite.setScale((this.sprite.y / position) * scale);

                        await Common.delay(60, i);
                    }
                    
                    this.sprite.y = position;

                    break;
                }

                case Direction.RIGHT: {
                    this.sprite?.setVelocityY(velocity);

                    const position: number = this.map.getLanePosition(0, this.lane - 1);
                    const scale: number = this.map.getPerspectiveScale(0, this.lane - 1);

                    for(let i = 0; this.sprite.y < position; ++i) {
                        this.sprite.setScale((this.sprite.y / position) * scale);

                        await Common.delay(60, i);
                    }

                    this.sprite.y = position;

                    break;
                }
            }
        }

        this.sprite
            .setVelocityY(0)
            .setDepth(this.map.getNumRoadChunkLanes(0) - this.lane)
            .anims.play(`${vehicles[this.type].mappingKey}_${Direction.FRONT.toString()}`, true);

        this.isTurning = false;
    }
};