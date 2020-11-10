import { Range, Direction, LayerIDX } from '../_common/common';
import TypeGuardHelper from '../_common/typeGuardHelper';
import { SpriteMapping } from '../_common/mappingHelper';

import Vehicle, { VehicleType, vehicles } from './vehicle'
import Map from '../map/map'
import { sourceModel } from '../../models/source';

export default class Traffic {
    private readonly scene: Phaser.Scene;
    private readonly map: Map;

    private readonly explosion: {
        sound?: Phaser.Sound.BaseSound;
        soundKey: string;

        scale: number;
    } & SpriteMapping = {
            key: 'explosion',
            mappingKey: sourceModel.spriteExplosion.mappingKey,
            soundKey: sourceModel.soundExplosion.mappingKey,

            scale: 6.5
        };

    private readonly vehicles: {
        objectMapper: { [id: string]: Vehicle }
        spriteMapper: { [id: string]: Phaser.Physics.Arcade.Sprite };

        numCreatedVehicles: number;
    } = {
            objectMapper: {},
            spriteMapper: {},

            numCreatedVehicles: 0
        };

    private readonly depthLayer: number;

    private player?: Vehicle;

    private availableLanes: Array<number> = [];

    constructor(scene: Phaser.Scene, map: Map, depth: number) {
        this.scene = scene;
        this.map = map;

        this.depthLayer = depth;

        // ------------------------------ Init explosion ------------------------------ //
        this.explosion.sprite =
            this.scene.physics.add.sprite(0, 0, this.explosion.mappingKey)
                .setScale(this.explosion.scale)
                .setDepth(LayerIDX.GUI)
                .setOrigin(0.5, 0.75)
                .setVisible(false);

        this.scene.anims.create({
            key: this.explosion.key,
            frames: this.scene.anims.generateFrameNumbers(this.explosion.mappingKey, {}),
            frameRate: 15,
            repeat: 0,
            hideOnComplete: true
        });

        if (this.scene.cache.audio.get(this.explosion.soundKey)) {
            this.explosion.sound = this.scene.sound.add(this.explosion.soundKey, {});
        }

        // -------------------------- Init availiable lanes -------------------------- //
        const numLastChunkLanes = this.map.getNumRoadChunkLanes(
            this.map.getNumRoadChunks() - 1
        );

        for (let i = 0; i < numLastChunkLanes; ++i) {
            this.availableLanes.push(i);
        }

        // ------------------------------ Init vehicles ------------------------------ //
        Object.values(VehicleType).map(v => this.initVehicle(v));

        this.scene.events.on('onVehicleCollided', (id: string) => {
            this.handleVehicleCollided(id);
        });
        this.scene.events.on('onVehicleDestroyed', (id: string) => {
            this.handleVehicleDestroyed(id);
        });
    }

    public generateTraffic(): void {
        this.clearTraffic();

        const numLanes = this.map.getNumRoadChunkLanes(0);

        for (let i = 0; i < numLanes - 1; ++i) {
            this.generateVehicle(
                Vehicle.getRandomVehicle().type,
                {
                    from: 1,
                    to: (this.map.getNumRoadChunks() ?? 2) - 1
                },
                new Phaser.Math.Vector2(),
                []
            );
        }
    }

    public clearTraffic(): void {
        Object.values(this.vehicles.objectMapper).map(o =>
            o.destroyVehicle()
        );
        Object.values(this.vehicles.spriteMapper).map(o =>
            o.destroy()
        );
        
        this.availableLanes = [];
        
        const numLastChunkLanes = this.map.getNumRoadChunkLanes(
            this.map.getNumRoadChunks() - 1
        );
        
        for (let i = 0; i < numLastChunkLanes; ++i) {
            this.availableLanes.push(i);
        }

        this.vehicles.objectMapper = {};
        this.vehicles.spriteMapper = {};
    }

    public generateVehicle(vehicleType: VehicleType, gridPosX: Range | number, coordsOffset: Phaser.Math.Vector2, collideWith: Array<Phaser.Physics.Arcade.Sprite> = [], takeLane: boolean = true): Vehicle {
        const _posX = TypeGuardHelper.isRange(gridPosX) ?
            this.map.getRandomRoadIdx(gridPosX.from, gridPosX.to) :
            gridPosX;

        const availableLaneIdx = Phaser.Math.Between(0, this.availableLanes.length - 1);
        const _posY = this.availableLanes[availableLaneIdx];

        if (takeLane) {
            this.availableLanes.splice(availableLaneIdx, 1);
        }

        //const _posY = this.map.getRandomLaneIdx(_posX);

        this.vehicles.spriteMapper[this.vehicles.numCreatedVehicles.toString()] = this.scene.physics.add.sprite(
            (TypeGuardHelper.isRange(gridPosX) ? this.map.getChunkCenter(_posX).x : _posX) + coordsOffset.x,
            this.map.getLanePosition(_posX, _posY) + coordsOffset.y,
            'atlas_vehicles',
            `${vehicleType.toString()}/${Direction.FRONT.toString()}`
        )
            .setScale(this.map.getPerspectiveScale(_posX, _posY))
            .setOrigin(0.0, 1.0)
            .setDepth(this.depthLayer + this.map.getNumRoadChunkLanes(_posX) - _posY);

        const vehicle = new Vehicle(
            this.scene,
            this.map,
            this.vehicles.numCreatedVehicles.toString(),
            this.vehicles.spriteMapper[this.vehicles.numCreatedVehicles.toString()],
            new Phaser.Math.Vector2(_posX, _posY),
            collideWith,
            this.depthLayer,
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

        const playerSprite = this.player.getSprite();

        Object.values(this.vehicles.objectMapper).map(o =>
            o.registerCollision(playerSprite)
        );
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
            frames: [{ key: 'atlas_vehicles', frame: `${vehicleType.toString()}/${direction}` }],
            frameRate: 0
        });
    }

    private handleVehicleCollided(id: string): void {
        const vehiclesObject = this.vehicles.objectMapper[id];

        if (vehiclesObject) {
            if (this.player?.getLane() === vehiclesObject?.getLane()) {
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

                    delete this.vehicles.objectMapper[id];

                    this.scene.events.emit('onPlayerCollided', id);
                }
            }
        }
    }

    private handleVehicleDestroyed(id: string): void {
        if (this.vehicles.objectMapper[id]) {
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
                    new Phaser.Math.Vector2(),
                    [this.player.getSprite()]
                );
            }
        }
    }
};
