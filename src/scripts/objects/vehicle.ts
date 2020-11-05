import { Common, Range, Mapping, SpriteMapping } from './common';
import { isRange, isSprite } from './typeGuardHelper'
import { Map } from './map'

import IMovable from './IMovable';
import ICollidable from './ICollidable';

enum Direction {
    FRONT = 'front', LEFT = 'left', RIGHT = 'right'
}

export enum VehicleType {
    AE_86_TRUENO = 'ae_86_trueno', 
    AE_86_LEVIN = 'ae_86_levin',
    EVO_3 = 'evo_3',
    EVO_4 = 'evo_4',
    _180_SX = '180_sx',
    CIVIC = 'civic',
    R_32 = 'r_32',
    RX_7_FC = 'rx_7_fc',
    RX_7_FD = 'rx_7_fs',
    S_13 = 's_13'
};

class VehicleProperties {
    speed: Range;
    turningStrength: number;

    constructor(speed: Range, turningStrength: number) {
        this.speed = speed;
        this.turningStrength = turningStrength;
    } 
};

export const vehicles: { [id: string]: VehicleProperties } = {
    [VehicleType.AE_86_TRUENO.toString()]: new VehicleProperties({from: 200, to: 300}, 130),
    [VehicleType.AE_86_LEVIN.toString()]: new VehicleProperties({from: 300, to: 350}, 150),
    [VehicleType.EVO_3.toString()]: new VehicleProperties({from: 320, to: 370}, 170),
    [VehicleType.EVO_4.toString()]: new VehicleProperties({from: 250, to: 300},  140),
    [VehicleType._180_SX.toString()]: new VehicleProperties({from: 270, to: 320},  140),
    [VehicleType.CIVIC.toString()]: new VehicleProperties({from: 300, to: 350},  140),
    [VehicleType.R_32.toString()]: new VehicleProperties({from: 280, to: 350},  140),
    [VehicleType.RX_7_FC.toString()]: new VehicleProperties({from: 280, to: 350},  1400),
    [VehicleType.RX_7_FD.toString()]: new VehicleProperties({from: 290, to: 350},  140),
    [VehicleType.S_13.toString()]: new VehicleProperties({from: 250, to: 300},  140)
};

export function getRandomSpeed(vehicle: VehicleProperties): number {
    return Phaser.Math.Between(
        vehicle.speed.from, vehicle.speed.to
    );
}

export class Vehicle implements IMovable, ICollidable {
    private readonly scene: Phaser.Scene;
    private readonly map: Map;

    private readonly id: string;

    private readonly sprite: Phaser.Physics.Arcade.Sprite;

    private readonly gridPos: Phaser.Math.Vector2;

    private type: VehicleType;
    private speed: Range;
    private turningStrength: number;

    private isAlive: boolean = true;
    private isTurning: boolean = false;

    constructor(scene: Phaser.Scene, map: Map, id: string, sprite: Phaser.Physics.Arcade.Sprite, gridPos: Phaser.Math.Vector2, collideWith: Array<Phaser.Physics.Arcade.Sprite> = [], type: VehicleType, speed: Range, turningStrength: number) {
        this.scene = scene;
        this.map = map;

        this.id = id;
        this.sprite = sprite;

        this.gridPos = gridPos;

        this.type = type;
        this.speed = speed;
        this.turningStrength = turningStrength;

        for (const c of collideWith) {
            this.registerCollision(c);
        }

        this.watchStillAlive();
    }

    public registerCollision(collideWith: Phaser.Physics.Arcade.Sprite): void {
        this.scene.physics.add.overlap(this.sprite, collideWith, () => {
            this.scene.events.emit('onVehicleCollided', this.id );
        });
    }

    public destroyVehicle(): void {
        this.sprite.destroy();

        this.isAlive = false;
    }

    public getLane(): number {
        return this.gridPos.y;
    }

    public getSprite(): Phaser.Physics.Arcade.Sprite {
        return this.sprite;
    }

    public getGridPos(): Phaser.Math.Vector2 {
        return this.gridPos;
    }

    public slowDown(speed: number): void {
        this.sprite.setVelocityX(-speed);
    }

    public turnLeft() {
        if(!this.isTurning && this.gridPos.y < this.map.getNumRoadChunkLanes(this.gridPos.x) - 1) {
            this.turn(Direction.LEFT, this.turningStrength);

            this.gridPos.y++;

            this.isTurning = true;
        }
    }

    public turnRight() {
        if(!this.isTurning && this.gridPos.y > 0) {
            this.turn(Direction.RIGHT, this.turningStrength);

            this.gridPos.y--;

            this.isTurning = true;
        }
    }

    private async turn(direction: Direction, velocity: number): Promise<void> {
        this.sprite?.anims.play(`${this.type.toString()}_${direction}`, true);

        if(this.sprite) {
            switch(direction) {
                case Direction.LEFT: {
                    this.sprite?.setVelocityY(-velocity);

                    const position: number = this.map.getLanePosition(this.gridPos.x, this.gridPos.y + 1);
                    const scale: number = this.map.getPerspectiveScale(this.gridPos.x, this.gridPos.y + 1);
                    
                    for(let i = 0; this.sprite.y > position; ++i) {
                        this.sprite.setScale((this.sprite.y / position) * scale);

                        await Common.delay(60, i);
                    }
                    
                    this.sprite.y = position;

                    break;
                }

                case Direction.RIGHT: {
                    this.sprite?.setVelocityY(velocity);

                    const position: number = this.map.getLanePosition(this.gridPos.x, this.gridPos.y - 1);
                    const scale: number = this.map.getPerspectiveScale(this.gridPos.x, this.gridPos.y - 1);

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
            .setDepth(this.map.getNumRoadChunkLanes(this.gridPos.x) - this.gridPos.y)
            .anims.play(`${this.type.toString()}_${Direction.FRONT.toString()}`, true);

        this.isTurning = false;
    }

    private async watchStillAlive(): Promise<void> {
        while (this.isAlive) {
            if (this.sprite.x < -this.sprite.width) {
                this.destroyVehicle();
            }

            await Common.delay(60, 0);
        }

        this.scene.events.emit('onVehicleDestroyed', this.id );
    }
}

export class Traffic {
    private readonly scene: Phaser.Scene;
    private readonly map: Map;

    private readonly explosion: SpriteMapping = {
        key: 'explosion',
        mappingKey: 'sprite_explosion'
    };

    private vehicles: {
        objectMapper: { [ id: string ]: Vehicle }
        spriteMapper: { [ id: string ]: Phaser.Physics.Arcade.Sprite };

        numCreatedVehicles: number;
    } = {
        objectMapper: {},
        spriteMapper: {},

        numCreatedVehicles: 0
    };

    private player?: Vehicle;

    constructor(scene: Phaser.Scene, map: Map) {
        this.scene = scene;
        this.map = map;

        this.explosion.sprite = 
            this.scene.physics.add.sprite(0, 0, this.explosion.mappingKey)
                .setScale(2.5)
                .setDepth(5)
                .setOrigin(0.5, 0.75)
                .setVisible(false);

        this.scene.anims.create({
            key: this.explosion.key,
            frames: this.scene.anims.generateFrameNumbers(this.explosion.mappingKey, { }),
            frameRate: 30,
            repeat: 0,
            hideOnComplete: true
        });

        for (const v of Object.values(VehicleType)) {
            this.initVehicle(v);
        }

        this.scene.events.on('onVehicleCollided', (id: string) => {
            this.handleVehicleCollided(id);
        });
        this.scene.events.on('onVehicleDestroyed', (id: string) => {
            this.handleVehicleDestroyed(id);
        });
    }

    public generateVehicle(vehicleType: VehicleType, gridPosX: Range | number, collideWith: Array<Phaser.Physics.Arcade.Sprite> = []): Vehicle {
        const randomX = isRange(gridPosX) ?
            this.map.getRandomRoadIdx(gridPosX.from, gridPosX.to) :
            this.map.getRandomRoadIdx(gridPosX);
        
        const randomY = this.map.getRandomLaneIdx(randomX);

        this.vehicles.spriteMapper[this.vehicles.numCreatedVehicles.toString()] = this.scene.physics.add.sprite(
            this.map.getChunkCenter(randomX).x, 
            this.map.getLanePosition(randomX, randomY), 
            'atlas_vehicles',
            `${vehicleType.toString()}/${Direction.FRONT.toString()}`
        )
            .setScale(this.map.getPerspectiveScale(randomX, randomY))
            .setOrigin(0.5, 1.0)
            .setDepth(this.map.getNumRoadChunkLanes(randomX) - randomY);
        
        const vehicle = new Vehicle(
            this.scene,
            this.map,
            this.vehicles.numCreatedVehicles.toString(),
            this.vehicles.spriteMapper[this.vehicles.numCreatedVehicles.toString()],
            new Phaser.Math.Vector2(randomX, randomY),
            collideWith,
            vehicleType,
            vehicles[vehicleType].speed,
            vehicles[vehicleType].turningStrength
        );

        this.vehicles.objectMapper[this.vehicles.numCreatedVehicles.toString()] = vehicle;
            
        return vehicle;
    }

    public attachPlayer(player: Vehicle): void {
        this.player = player;
    }

    private initVehicle(vehicleType: VehicleType): void {
        this.initVehicleAnims(vehicleType, Direction.FRONT);
        this.initVehicleAnims(vehicleType, Direction.LEFT);
        this.initVehicleAnims(vehicleType, Direction.RIGHT);
    }

    private initVehicleAnims(vehicleType: VehicleType, direction: Direction) {
        this.scene.anims.create({
            key: `${vehicleType.toString()}_${direction.toString()}`,
            frames: [ { key: 'atlas_vehicles', frame: `${vehicleType.toString()}/${direction}` } ],
            frameRate: 0
        });
    }

    private handleVehicleCollided(id: string): void {
        const vehiclesObject = this.vehicles.objectMapper[id];

        if(vehiclesObject) {
            if (this.player?.getLane() === vehiclesObject.getLane()) {
                if (isSprite(this.explosion.sprite)) {
                    const playerPos = this.player.getSprite();

                    this.explosion.sprite.setPosition(
                        playerPos.x, 
                        playerPos.y
                    );

                    this.explosion.sprite.setVisible(true);
                    this.explosion.sprite.anims.play(this.explosion.key, true);
                }
                
                // this.coins.sound?.play();

                // this.earnedPoints += coinObject.getRewardPoints();
                
                // this.scene.events.emit('onScoreChanged', this.earnedPoints, coinObject.getRewardPoints());

                // this.coins.objectMapper[id].destroyCoin();

                // console.log(`Earned points: ${this.earnedPoints}`);
            }
        }
    }

    private handleVehicleDestroyed(id: string): void {
        console.log(`Vehicle #${id} is history!`);

        delete this.vehicles.objectMapper[id];
        delete this.vehicles.spriteMapper[id];

        if (this.player) {
            const vehicle = this.generateVehicle(
                VehicleType.CIVIC, 
                { 
                    from: this.map.getNumRoadChunks() - 2, 
                    to: this.map.getNumRoadChunks() - 1
                },
                [ this.player.getSprite() ]
            );

            vehicle.slowDown(Phaser.Math.Between(vehicles[VehicleType.CIVIC].speed.from, vehicles[VehicleType.CIVIC].speed.to));
        }
    }
};
