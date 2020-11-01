import { ChunkMapping, RoadLane } from './map'
import Common from './common';

export class Vehicle {
    private readonly scene: Phaser.Scene;
    private readonly emmitter = new Phaser.Events.EventEmitter();

    private player?: Phaser.Physics.Arcade.Sprite;

    private vehicleName: string;

    private roadLane: RoadLane = RoadLane.Right;
    private isTurning: boolean = false;

    constructor(scene: Phaser.Scene, vehicleScale: number = 5, vehicleName: string = 'vehicle_ae_86_trueno', vehicleStartX: number, vehicleStartY?: number) {
        this.scene = scene;
        this.vehicleName = vehicleName;

        this.player = 
            this.scene.physics.add.sprite(vehicleStartX, vehicleStartY ?? this.scene.cameras.main.centerY, 'atlas_vehicles')
                .setScale(vehicleScale)
                .setOrigin(0);
        
        this.createVehicleAnim('front');
        this.createVehicleAnim('left');
        this.createVehicleAnim('right');

        this.player?.anims.play(`${this.vehicleName}_front`, true);

        this.scene.events.on('abcd', this.handler);
    }

    handler(mmm: number) {
        console.log(mmm);
        debugger;
    }

    private handleOnComplete = (time: number) => {
        console.log('abcd');
    }

    private createVehicleAnim(direction: string) {
        this.scene.anims.create({
            key: `${this.vehicleName}_${direction}`,
            frames: [ { key: 'atlas_vehicles', frame: `${this.vehicleName}/${direction}` } ],
            frameRate: 0
        });
    }

    turnLeft() {
        if(this.roadLane == RoadLane.Right && !this.isTurning) {
            this.turn('left', -0.09);

            this.roadLane = RoadLane.Left;
        }
    }

    turnRight() {
        if(this.roadLane == RoadLane.Left && !this.isTurning) {
            this.turn('right', 0.09);

            this.roadLane = RoadLane.Right;
        }
    }

    async turn(direction: string, strength: number): Promise<void> {
        this.player?.anims.play(`${this.vehicleName}_${direction}`, true);

        for(let i = 0; i < 5; ++i) {
            this.player?.setScale(this.player.scale + strength);
            
            await Common.delay(60, i);
        }

        this.player?.anims.play(`${this.vehicleName}_front`, true);
    }

    gasgasgas() {
        /*this.player?.anims.play(`${this.vehicleName}_front`, true);

        this.player?.setVelocityY(0);*/
    }
    
    adjustVehicleByChunk(chunkType: ChunkMapping) {
        switch(chunkType) {
            case ChunkMapping.RoadDown0: {
                this.player?.setAngle(25);

                break;
            }
            case ChunkMapping.RoadDown1: {
                this.player?.setAngle(22.5);
                this.player

                break;
            }
            case ChunkMapping.RoadStraight: {
                this.player?.setAngle(0);

                break;
            }
            case ChunkMapping.RoadUp0: {
                this.player?.setAngle(-25);

                break;
            }
            case ChunkMapping.RoadUp1: {
                this.player?.setAngle(-45);

                break;
            }
        }

        this.player?.setDepth(1);
    }
};