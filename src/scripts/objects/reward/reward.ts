import { Range } from '../_common/common';
import TypeGuardHelper from '../_common/typeGuardHelper';
import { SpriteMappingSized } from '../_common/mappingHelper';

import Coin from './coin'
import Map from '../map/map'
import Vehicle from '../traffic/vehicle';

import IMovable from '../interfaces/IMovable';
import { sourceModel } from '../../models/source';

export default class Reward implements IMovable {
    private readonly scene: Phaser.Scene;
    private readonly map: Map;

    private readonly depthLayer: number;

    private readonly coin: {
        soundKey: string;
    } & SpriteMappingSized = {
        key: 'coin',
        mappingKey: sourceModel.spriteCoin.mappingKey,
        soundKey: sourceModel.soundCoin.mappingKey,

        size: 32
    };

    private readonly coins: {
        objectMapper: { [id: string]: Coin };
        spriteMapper: { [id: string]: Phaser.Physics.Arcade.Sprite; };
        
        group?: Phaser.Physics.Arcade.Group;
        sound?: Phaser.Sound.BaseSound;

        numCreatedCoins: number;
    } = {
        objectMapper: {},
        spriteMapper: {},

        numCreatedCoins: 0
    };

    private player: Vehicle;

    private earnedPoints: number = 0;
    
    speed: number = 0;

    constructor(scene: Phaser.Scene, map: Map, player: Vehicle, depthLayer: number = 0, numCoinsToGenerate: number) {
        this.scene = scene;
        this.map = map;
        this.player = player;

        this.depthLayer = depthLayer;

        this.coins.sound = this.scene.sound.add(this.coin.soundKey, {} );

        this.scene.anims.create({
            key: this.coin.key,
            frames: this.scene.anims.generateFrameNumbers(this.coin.mappingKey, { }),
            frameRate: 20,
            repeat: -1
        });

       this.generateReward(numCoinsToGenerate);

        this.scene.events.on('onCoinCollided', (id: string) => {
            this.handleCoinCollided(id);
        });
        this.scene.events.on('onCoinDestroyed', (id: string) => {
            this.handleCoinDestroyed(id);
        });
        this.scene.events.on('onMapSpeedChanged', (speed: number) => {
            this.handleMapSpeedChanged(speed);
        });
    }

    public generateReward(numCoinsToGenerate: number = 0): void {
        this.clearReward();

        this.generateRandomCoins(
            numCoinsToGenerate, 
            { 
                from: this.map.getNumRoadChunks() - 2,
                to: this.map.getNumRoadChunks() - 1 
            }
        ); 
    }

    public attachPlayer(player: Vehicle): void {
        this.player = player;

        const playerSprite = this.player.getSprite();

        for (const o of Object.values(this.coins.objectMapper)) {
            o.registerCollision(playerSprite);
        }
    }

    public generateCoin(gridPosX: Range | number): void {
        const _posX = TypeGuardHelper.isRange(gridPosX) ?
            this.map.getRandomRoadIdx(gridPosX.from, gridPosX.to) :
            this.map.getRandomRoadIdx(gridPosX);
        
        const _posY = this.map.getRandomLaneIdx(_posX);

        this.coin.sprite = 
            this.scene.physics.add.sprite(
                this.map.getChunkCenter(_posX).x, 
                this.map.getLanePosition(_posX, _posY),
                this.coin.mappingKey
            )
             .setOrigin(0.5, 1.0)
             .setDepth(this.depthLayer + this.map.getNumRoadChunkLanes(_posX) - _posY);
        
        this.coin.sprite?.anims.play(this.coin.key, true);
        
        this.coins.objectMapper[this.coins.numCreatedCoins.toString()] =
            new Coin(
                this.scene, 
                this.coins.numCreatedCoins.toString(), 
                this.coin.sprite,
                new Phaser.Math.Vector2(_posX, _posY),
                [ this.player.getSprite() ] 
            );
        
        this.coins.spriteMapper[this.coins.numCreatedCoins.toString()] = this.coin.sprite;
    }

    public registerCoins(): void {
        this.coins.group = this.scene.physics.add.group(
            Object.keys(this.coins.spriteMapper).map(c => this.coins.spriteMapper[c])
        );
    }

    public generateRandomCoins(numCoins: number, range: Range): void {
        for (let i = 0; i < numCoins; ++i) {
            this.generateCoin(
                { 
                    from: range.from, 
                    to: range.to 
                }
            );

            this.coins.numCreatedCoins++;
        }

        this.registerCoins();
    }

    public move(): void {
        this.coins.group?.incX(this.speed);
    }

    private clearReward(): void {
        this.coins.numCreatedCoins = 0;

        this.earnedPoints = 0;

        this.scene.events.emit('onScoreChanged', this.earnedPoints);

        this.coins.group?.clear(true, true);

        this.coins.objectMapper = {};
        this.coins.spriteMapper = {};
    }

    private handleMapSpeedChanged(speed: number) {
        this.speed = speed;
    }

    private handleCoinCollided(id: string): void {
        const coinObject = this.coins.objectMapper[id];

        if(coinObject) {
            if (this.player.getLane() === coinObject.getLane()) {
                this.coins.sound?.play();

                this.earnedPoints += coinObject.getRewardPoints();
                
                this.scene.events.emit('onScoreChanged', this.earnedPoints, coinObject.getRewardPoints());

                this.coins.objectMapper[id].destroyCoin();

                console.log(`Earned points: ${this.earnedPoints}`);
            }
        }
    }

    private handleCoinDestroyed(id: string): void {
        console.log(`Coin #${id} is history!`);

        delete this.coins.objectMapper[id];
        delete this.coins.spriteMapper[id];

        this.generateRandomCoins(
            1, 
            { 
                from: this.map.getNumRoadChunks() - 2,
                to: this.map.getNumRoadChunks() - 1 
            }
        ); 
    }
};
