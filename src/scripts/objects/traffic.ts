import { Common, Range, Mapping, SpriteMapping } from './common';
import { isRange, isSprite } from './typeGuardHelper'
import { Map } from './map'

import IMovable from './IMovable';
import ICollidable from './ICollidable';

export enum Direction {
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
    RX_7_FD = 'rx_7_fd',
    S_13 = 's_13'
};

class VehicleProperties {
    type: VehicleType;

    speed: Range;
    turningStrength: number;

    constructor(type: VehicleType, speed: Range, turningStrength: number) {
        this.type = type;

        this.speed = speed;
        this.turningStrength = turningStrength;
    } 
};

export const vehicles: { [id: string]: VehicleProperties } = {
    [VehicleType.AE_86_TRUENO.toString()]: new VehicleProperties(VehicleType.AE_86_TRUENO, {from: 1, to: 3}, 130),
    [VehicleType.AE_86_LEVIN.toString()]: new VehicleProperties(VehicleType.AE_86_LEVIN, {from: 1, to: 3}, 150),
    [VehicleType.EVO_3.toString()]: new VehicleProperties(VehicleType.EVO_3, {from: 1, to: 4}, 170),
    [VehicleType.EVO_4.toString()]: new VehicleProperties(VehicleType.EVO_4, {from: 1, to: 3},  140),
    [VehicleType._180_SX.toString()]: new VehicleProperties(VehicleType._180_SX, {from: 1, to: 3},  140),
    [VehicleType.CIVIC.toString()]: new VehicleProperties(VehicleType.CIVIC, {from: 1, to: 3},  140),
    [VehicleType.R_32.toString()]: new VehicleProperties(VehicleType.R_32, {from: 1, to: 4}, 140),
    [VehicleType.RX_7_FC.toString()]: new VehicleProperties(VehicleType.RX_7_FC, {from: 1, to: 4},  140),
    [VehicleType.RX_7_FD.toString()]: new VehicleProperties(VehicleType.RX_7_FD, {from: 1, to: 4},  140),
    [VehicleType.S_13.toString()]: new VehicleProperties(VehicleType.S_13, {from: 1, to: 3},  140)
};

export class Vehicle implements ICollidable, IMovable {
    private readonly scene: Phaser.Scene;
    private readonly map: Map;

    private readonly id: string;

    private readonly sprite: Phaser.Physics.Arcade.Sprite;

    private readonly gridPos: Phaser.Math.Vector2;

    private mapSpeed: number;

    private type: VehicleType;
    private turningStrength: number;
    
    private isAlive: boolean = true;
    private isTurning: boolean = false;
    
    speed: number;

    constructor(scene: Phaser.Scene, map: Map, id: string, sprite: Phaser.Physics.Arcade.Sprite, gridPos: Phaser.Math.Vector2, collideWith: Array<Phaser.Physics.Arcade.Sprite> = [], type: VehicleType, speed: number, mapSpeed: number, turningStrength: number) {
        this.scene = scene;
        this.map = map;

        this.id = id;
        this.sprite = sprite;

        this.gridPos = gridPos;

        this.type = type;
        this.speed = speed;
        this.turningStrength = turningStrength;

        this.mapSpeed = mapSpeed;

        for (const c of collideWith) {
            this.registerCollision(c);
        }

        this.watchStillAlive();

        this.scene.events.on('onMapSpeedChanged', (speed: number) => {
            this.handleMapSpeedChanged(speed);
        });
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

    public move(): void {
        this.sprite.setPosition(this.sprite.x + this.mapSpeed + this.speed, this.sprite.y);
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

    private handleMapSpeedChanged(mapSpeed: number) {
        this.mapSpeed = mapSpeed;
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

    private readonly explosion: {
        sound?: Phaser.Sound.BaseSound;
    } & SpriteMapping = {
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

    private availableLanes: Array<number> = [];

    constructor(scene: Phaser.Scene, map: Map) {
        this.scene = scene;
        this.map = map;

        this.explosion.sprite = 
            this.scene.physics.add.sprite(0, 0, this.explosion.mappingKey)
                .setScale(6.5)
                .setDepth(5)
                .setOrigin(0.5, 0.75)
                .setVisible(false);

        this.scene.anims.create({
            key: this.explosion.key,
            frames: this.scene.anims.generateFrameNumbers(this.explosion.mappingKey, { }),
            frameRate: 15,
            repeat: 0,
            hideOnComplete: true
        });

        this.explosion.sound = this.scene.sound.add('sound_explosion', {} );

        const numLastChunkLanes = this.map.getNumRoadChunkLanes(this.map.getNumRoadChunks() - 1);
        for (let i = 0; i < numLastChunkLanes; ++i) {
            this.availableLanes.push(i);
        }

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

    public clearTraffic(): void {
        for (const o of Object.values(this.vehicles.objectMapper)) {
            o.destroyVehicle();
        }
    }

    public generateVehicle(vehicleType: VehicleType, posX: Range | number, collideWith: Array<Phaser.Physics.Arcade.Sprite> = [], istakeLane: boolean = true): Vehicle {
        const _posX = isRange(posX) ?
            this.map.getRandomRoadIdx(posX.from, posX.to) :
            posX;
        
        const availableLaneIdx = Phaser.Math.Between(0, this.availableLanes.length - 1);
        const _posY = this.availableLanes[availableLaneIdx];

        if (istakeLane) {
            this.availableLanes.splice(availableLaneIdx, 1);
        }
        
        //const randomY = this.map.getRandomLaneIdx(randomX);
        
        this.vehicles.spriteMapper[this.vehicles.numCreatedVehicles.toString()] = this.scene.physics.add.sprite(
            isRange(posX) ? this.map.getChunkCenter(_posX).x : _posX, 
            this.map.getLanePosition(_posX, _posY), 
            'atlas_vehicles',
            `${vehicleType.toString()}/${Direction.FRONT.toString()}`
        )
            .setScale(this.map.getPerspectiveScale(_posX, _posY))
            .setOrigin(0.5, 1.0)
            .setDepth(this.map.getNumRoadChunkLanes(_posX) - _posY);
        
        const vehicle = new Vehicle(
            this.scene,
            this.map,
            this.vehicles.numCreatedVehicles.toString(),
            this.vehicles.spriteMapper[this.vehicles.numCreatedVehicles.toString()],
            new Phaser.Math.Vector2(_posX, _posY),
            collideWith,
            vehicleType,
            Phaser.Math.FloatBetween(vehicles[vehicleType].speed.from, vehicles[vehicleType].speed.to),
            this.map.getSpeed(),
            vehicles[vehicleType].turningStrength
        );

        this.vehicles.objectMapper[this.vehicles.numCreatedVehicles.toString()] = vehicle;
        
        this.vehicles.numCreatedVehicles++;

        return vehicle;
    }

    public attachPlayer(player: Vehicle): void {
        this.player = player;
    }

    public move(): void {
        for (const v of Object.keys(this.vehicles.objectMapper).map(c => this.vehicles.objectMapper[c])) {
            if (v.getSprite().body !== this.player?.getSprite().body) {
                v.move();
            } 
        }
    }

    public getRandomVehicle():  VehicleProperties {
        return vehicles[
            Object.values(VehicleType)[
                Phaser.Math.Between(0, Object.keys(VehicleType).length - 1)
            ]
        ]
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

                    this.explosion.sound?.play();

                    this.map.changeSpeed(1);
                }

                console.log('GameOver');
            }
        }
    }

    private handleVehicleDestroyed(id: string): void {
        console.log(`Vehicle #${id} is history!`);

        this.availableLanes.push(this.vehicles.objectMapper[id].getLane());

        delete this.vehicles.objectMapper[id];
        delete this.vehicles.spriteMapper[id];
        
        if (this.player) {
            this.generateVehicle(
                this.getRandomVehicle().type, 
                { 
                    from: this.map.getNumRoadChunks() - 2, 
                    to: this.map.getNumRoadChunks() - 1
                },
                [ this.player.getSprite() ]
            );
        }
    }
};
