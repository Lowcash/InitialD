import Common from './common';
import { Map } from './map'

enum Direction {
    FRONT = 'front', LEFT = 'left', RIGHT = 'right'
}

export enum VehicleType {
    AE_86_TRUENO = 0, EVO_3, EVO_4
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
    new VehicleProperties('vehicle_evo_4', VehicleType.EVO_4, 36, 16, 170)
];

export class Vehicle {
    private readonly scene: Phaser.Scene;
    private readonly map: Map;
    //private readonly emmitter = new Phaser.Events.EventEmitter();

    private sprite?: Phaser.Physics.Arcade.Sprite;
    private type: VehicleType;

    private lane: number;

    private isTurning: boolean = false;

    constructor(scene: Phaser.Scene, map: Map, lane: number = 0, scale: number = 5, type: VehicleType = VehicleType.AE_86_TRUENO) {
        this.scene = scene;
        this.map = map;

        this.lane = lane;
        this.type = type;

        const cachedImage = this.scene.textures.get(vehicles[type].mappingKey).getSourceImage();

        this.sprite = 
            this.scene.physics.add.sprite(
                (cachedImage.width / 2) * scale, 
                this.map.getLanePosition(0, this.lane), 
                'atlas_vehicles'
            ).setScale(scale)
             .setOrigin(0.5, 1.0)
             .setDepth(4 - this.lane);
                
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

    private createVehicleAnim(direction: string) {
        this.scene.anims.create({
            key: `${vehicles[this.type].mappingKey}_${direction}`,
            frames: [ { key: 'atlas_vehicles', frame: `${vehicles[this.type].mappingKey}/${direction}` } ],
            frameRate: 0
        });
    }

    turnLeft() {
        if(!this.isTurning && this.lane < 3) {
            this.turn(Direction.LEFT, -vehicles[this.type].turningStrength);

            this.isTurning = true;
        }
    }

    turnRight() {
        if(!this.isTurning && this.lane > 0) {
            this.turn(Direction.RIGHT, vehicles[this.type].turningStrength);

            this.isTurning = true;
        }
    }

    slowDown(speed: number) {
        this.sprite?.setVelocityX(speed);
    }

    async turn(direction: Direction, velocity: number): Promise<void> {
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

                    this.lane++;

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

                    this.lane--;

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