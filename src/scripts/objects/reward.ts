import { Range, isRange, SpriteMappingSized, Common } from './common';
import { Map } from './map'

import IMovable from './IMovable';

class Coin {
    private readonly context: Object;
    private readonly scene: Phaser.Scene;

    private readonly id: string;

    private readonly sprite: Phaser.Physics.Arcade.Sprite;

    private isAlive: boolean = true;

    constructor(context: Object, scene: Phaser.Scene, id: string, sprite: Phaser.Physics.Arcade.Sprite) {
        this.context = context;
        this.scene = scene;

        this.id = id;
        this.sprite = sprite;

        this.watchStillAlive();
    }

    private async watchStillAlive(): Promise<void> {
        while (this.isAlive) {
            if (this.sprite.x < -this.sprite.width) {
                this.sprite.destroy();
                
                this.isAlive = false;

                this.scene.events.emit('onCoinDestroyed', this.context, this.id );
            }

            await Common.delay(60, 0);
        }
    }
};

export default class Reward implements IMovable {
    private readonly texture: HTMLImageElement | HTMLCanvasElement | Phaser.GameObjects.RenderTexture;

    private readonly scene: Phaser.Scene;
    private readonly map: Map;

    private readonly depthLayer: number;
    private readonly scale: number;

    private readonly coin: SpriteMappingSized = {
        key: 'coin',
        mappingKey: 'sprite_coin',

        size: 32
    };

    private coins: {
        objects: Array<Coin>;
        mapper: { [id: string]: Phaser.Physics.Arcade.Sprite; };
        
        group?: Phaser.Physics.Arcade.Group;
    } = {
        objects: [],
        mapper: {}
    };

    private generatedCoins: number = 0;

    private earnedPoints: number = 0;

    constructor(scene: Phaser.Scene, map: Map, depthLayer: number = 0, scale: number = 1, numCoinsToGenerate: number = 0) {
        this.scene = scene;
        this.map = map;

        this.depthLayer = depthLayer;
        this.scale = scale;

        this.texture = this.scene.textures.get(this.coin.mappingKey).getSourceImage();

        this.scene.anims.create({
            key: this.coin.key,
            frames: this.scene.anims.generateFrameNumbers(this.coin.mappingKey, { }),
            frameRate: 20,
            repeat: -1
        });

        this.generateRandomCoins(numCoinsToGenerate); 

        this.scene.events.on('onCoinDestroyed', this.handleCoinDestroyed);
    }

    public generateCoin(gridPosX: Range | number) {
        const randomIdx = isRange(gridPosX) ?
            this.map.getRandomRoadIdx(gridPosX.from, gridPosX.to) :
            this.map.getRandomRoadIdx(gridPosX);
        
        this.coin.sprite = 
            this.scene.physics.add.sprite(
                this.map.getChunkCenter(randomIdx).x, 
                this.map.getLanePosition(0, this.map.getRandomLaneIdx(0)),
                this.coin.mappingKey
            ).setOrigin(0.5, 1.0)
             .setScale(this.scale)
             .setDepth(this.depthLayer);
        
        this.coin.sprite?.anims.play(this.coin.key, true);

        this.coins.objects.push(
            new Coin(this, this.scene, Object.keys(this.coins.mapper).length.toString(), 
            this.coin.sprite)
        );
        
        this.coins.mapper[this.generatedCoins.toString()] = this.coin.sprite;
    }

    public registerCoins(): void {
        this.coins.group = this.scene.physics.add.group(
            Object.keys(this.coins.mapper).map(c => this.coins.mapper[c])
        );
    }

    public generateRandomCoins(numCoins: number): void {
        for (let i = 0; i < numCoins; ++i) {
            this.generateCoin({ from: 1, to: this.map.getNumRoadChunks() - 1 });

            this.generatedCoins++;
        }

        this.registerCoins();
    }

    public slowDown(speed: number) {
        this.coins.group?.incX(-speed);
    }

    private handleCoinDestroyed(reward: Reward, id: string) {
        console.log(`Coin ${id.toString()} is history!`);

        reward.generateRandomCoins(1); 
    }
};