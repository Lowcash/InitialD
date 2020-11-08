import { Range } from '../_common/common';
import TypeGuardHelper from '../_common/typeGuardHelper';
import { SpriteMappingSized } from '../_common/mappingHelper';

import Coin from './coin'
import Map from '../map/map'
import Vehicle from '../traffic/vehicle';

import IMovable from '../interfaces/IMovable';

export default class Reward implements IMovable {
    private readonly scene: Phaser.Scene;
    private readonly map: Map;
    private readonly player: Vehicle;

    private readonly depthLayer: number;
    private readonly scale: number;

    private readonly coin: {
        soundKey: string;
    } & SpriteMappingSized = {
        key: 'coin',
        mappingKey: 'sprite_coin',
        soundKey: 'sound_coin',

        size: 32
    };

    private coins: {
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

    private earnedPoints: number = 0;
    
    speed: number = 0;

    constructor(scene: Phaser.Scene, map: Map, player: Vehicle, depthLayer: number = 0, scale: number = 1, numCoinsToGenerate: number = 0) {
        this.scene = scene;
        this.map = map;
        this.player = player;

        this.depthLayer = depthLayer;
        this.scale = scale;

        this.coins.sound = this.scene.sound.add(this.coin.soundKey, {} );

        this.scene.anims.create({
            key: this.coin.key,
            frames: this.scene.anims.generateFrameNumbers(this.coin.mappingKey, { }),
            frameRate: 20,
            repeat: -1
        });

        this.generateRandomCoins(numCoinsToGenerate, { from: 3, to: this.map.getNumRoadChunks() - 1 }); 

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

    public generateCoin(gridPosX: Range | number): void {
        const randomX = TypeGuardHelper.isRange(gridPosX) ?
            this.map.getRandomRoadIdx(gridPosX.from, gridPosX.to) :
            this.map.getRandomRoadIdx(gridPosX);
        
        const randomY = this.map.getRandomLaneIdx(randomX);

        this.coin.sprite = 
            this.scene.physics.add.sprite(
                this.map.getChunkCenter(randomX).x, 
                this.map.getLanePosition(randomX, randomY),
                this.coin.mappingKey
            ).setOrigin(0.5, 1.0)
             .setScale(this.scale)
             .setDepth(this.depthLayer);
        
        this.coin.sprite?.anims.play(this.coin.key, true);
        
        this.coins.objectMapper[this.coins.numCreatedCoins.toString()] =
            new Coin(
                this.scene, 
                this.coins.numCreatedCoins.toString(), 
                this.coin.sprite,
                new Phaser.Math.Vector2(randomX, randomY),
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
            this.generateCoin({ from: range.from, to: range.to });

            this.coins.numCreatedCoins++;
        }

        this.registerCoins();
    }

    public move(): void {
        this.coins.group?.incX(this.speed);
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

        this.generateRandomCoins(1, { from: 8, to: this.map.getNumRoadChunks() - 1});
    }
};
