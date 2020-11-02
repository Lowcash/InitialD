import { Common, Range, isRange } from './common';
import { Map } from './map'

enum Direction {
    FRONT = 'front', LEFT = 'left', RIGHT = 'right'
}

export enum VehicleType {
    AE_86_TRUENO = 0, EVO_3, EVO_4, _180_SX
};

class VehicleProperties {
    mappingKey: string;
    type: VehicleType;

    width: number;
    height: number;

    turningStrength: number;

    constructor(mappingKey: string, type: VehicleType, width: number, height: number, turningStrength: number) {
        this.mappingKey = mappingKey;
        this.type = type;

        this.width = width;
        this.height = height;

        this.turningStrength = turningStrength;
    } 
};

export const vehicles: Array<VehicleProperties> = [
    new VehicleProperties('vehicle_ae_86_trueno', VehicleType.AE_86_TRUENO, 36, 16, 130),
    new VehicleProperties('vehicle_evo_3', VehicleType.EVO_3, 36, 16, 150),
    new VehicleProperties('vehicle_evo_4', VehicleType.EVO_4, 36, 16, 170),
    new VehicleProperties('vehicle_180_sx', VehicleType._180_SX, 36, 16, 140)
];

export class Vehicle {
    private readonly scene: Phaser.Scene;
    private readonly map: Map;
    //private readonly emmitter = new Phaser.Events.EventEmitter();

    private sprite: Phaser.Physics.Arcade.Sprite;
    private type: VehicleType;

    private lane: number;

    private isTurning: boolean = false;
    
    constructor(scene: Phaser.Scene, map: Map, startChunk: Range | number, startRoadLane: number = 0, scale: number = 5, type: VehicleType = VehicleType.AE_86_TRUENO) {
        this.scene = scene;
        this.map = map;
        
        this.lane = startRoadLane;
        this.type = type;

        const cachedImage = this.scene.textures.get(vehicles[type].mappingKey).getSourceImage();

        const randomIdx = isRange(startChunk) ?
            this.map.getRandomRoadIdx(startChunk.from, startChunk.to) :
            this.map.getRandomRoadIdx(startChunk);

        this.sprite = 
            this.scene.physics.add.sprite(
                randomIdx * cachedImage.width * scale, 
                this.map.getLanePosition(0, this.lane), 
                'atlas_vehicles'
            ).setScale(this.map.getPerspectiveScale(randomIdx, this.lane))
             .setOrigin(0.5, 1.0)
             .setDepth(this.map.getRoadChunkLanes(randomIdx) - this.lane);
                
        this.createVehicleAnim(Direction.FRONT.toString());
        this.createVehicleAnim(Direction.LEFT.toString());
        this.createVehicleAnim(Direction.RIGHT.toString());

        this.sprite?.anims.play(`${vehicles[this.type].mappingKey}_${Direction.FRONT.toString()}`, true);
        
        //this.scene.events.on('abcd', this.handler);
    }

    // private handler(mmm: number) {
    //     console.log(mmm);
    //     debugger;
    // }

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
        if(!this.isTurning && this.lane < this.map.getRoadChunkLanes(0) - 1) {
            this.turn(Direction.LEFT, -vehicles[this.type].turningStrength);

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

    public slowDown(speed: number) {
        this.sprite?.setVelocityX(speed);
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

        this.sprite?.setVelocityY(velocity);
        
        if(this.sprite) {
            switch(direction) {
                case Direction.LEFT: {
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

        this.sprite?.setVelocityY(0);

        this.sprite?.anims.play(`${vehicles[this.type].mappingKey}_${Direction.FRONT.toString()}`, true);

        this.sprite?.setDepth(this.map.getRoadChunkLanes(0) - this.lane);

        this.isTurning = false;
    }
};