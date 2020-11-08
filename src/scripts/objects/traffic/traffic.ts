import { Range, Direction } from '../_common/common';
import TypeGuardHelper from '../_common/typeGuardHelper';
import { SpriteMapping } from '../_common/mappingHelper';

import Vehicle, { VehicleType, vehicles } from './vehicle'
import Map  from '../map/map'

export default class Traffic {
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

        if (this.scene.cache.audio.get('sound_explosion')) {
            this.explosion.sound = this.scene.sound.add('sound_explosion', {} );
        }

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
        const _posX = TypeGuardHelper.isRange(posX) ?
            this.map.getRandomRoadIdx(posX.from, posX.to) :
            posX;
        
        const availableLaneIdx = Phaser.Math.Between(0, this.availableLanes.length - 1);
        const _posY = this.availableLanes[availableLaneIdx];

        if (istakeLane) {
            this.availableLanes.splice(availableLaneIdx, 1);
        }
        
        //const randomY = this.map.getRandomLaneIdx(randomX);
        
        this.vehicles.spriteMapper[this.vehicles.numCreatedVehicles.toString()] = this.scene.physics.add.sprite(
            TypeGuardHelper.isRange(posX) ? this.map.getChunkCenter(_posX).x : _posX, 
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
                if (TypeGuardHelper.isSprite(this.explosion.sprite)) {
                    const playerPos = this.player.getSprite();

                    this.explosion.sprite.setPosition(
                        playerPos.x, 
                        playerPos.y
                    );

                    this.explosion.sprite.setVisible(true);
                    this.explosion.sprite.anims.play(this.explosion.key, true);
                    
                    if (!this.explosion.sound?.isPlaying) {
                        this.explosion.sound?.play();
                    }

                    vehiclesObject.stop();

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
                Vehicle.getRandomVehicle().type, 
                { 
                    from: this.map.getNumRoadChunks() - 2, 
                    to: this.map.getNumRoadChunks() - 1
                },
                [ this.player.getSprite() ]
            );
        }
    }
};
