import { Range, isRange, SpriteMappingSized, Common } from './common';
import { Map } from './map'
import { Vehicle } from './vehicle';

import IMovable from './IMovable';
import ICollidable from './ICollidable';

class Coin implements ICollidable {
    private readonly scene: Phaser.Scene;

    private readonly id: string;

    private readonly sprite: Phaser.Physics.Arcade.Sprite;

    private readonly gridPos: Phaser.Math.Vector2;

    private readonly rewardPoints: number;

    private isAlive: boolean = true;

    constructor(scene: Phaser.Scene, id: string, sprite: Phaser.Physics.Arcade.Sprite, gridPos: Phaser.Math.Vector2, collideWith: Array<Phaser.Physics.Arcade.Sprite> = [], rewardPoints: number = 10) {
        this.scene = scene;

        this.id = id;
        this.sprite = sprite;

        this.gridPos = gridPos;

        this.rewardPoints = rewardPoints;

        for (const c of collideWith) {
            this.registerCollision(c);
        }

        this.watchStillAlive();
    }

    public registerCollision(collidingObj: Phaser.Physics.Arcade.Sprite): void {
        this.scene.physics.add.overlap(this.sprite, collidingObj, () => {
            this.scene.events.emit('onCoinCollided', this.id );
        });
    }

    public destroyCoin(): void {
        this.sprite.destroy();

        this.isAlive = false;
    }

    public getLane(): number {
        return this.gridPos.y;
    }

    public getRewardPoints(): number {
        return this.rewardPoints;
    }

    private async watchStillAlive(): Promise<void> {
        while (this.isAlive) {
            if (this.sprite.x < -this.sprite.width) {
                this.destroyCoin();
            }

            await Common.delay(60, 0);
        }

        this.scene.events.emit('onCoinDestroyed', this.id );
    }
};

export default class Reward implements IMovable {
    private readonly texture: HTMLImageElement | HTMLCanvasElement | Phaser.GameObjects.RenderTexture;

    private readonly scene: Phaser.Scene;
    private readonly map: Map;
    private readonly player: Vehicle;

    private readonly depthLayer: number;
    private readonly scale: number;

    private readonly coin: SpriteMappingSized = {
        key: 'coin',
        mappingKey: 'sprite_coin',

        size: 32
    };

    private coins: {
        objectMapper: { [id: string]: Coin };
        spriteMapper: { [id: string]: Phaser.Physics.Arcade.Sprite; };
        
        group?: Phaser.Physics.Arcade.Group;
    } = {
        objectMapper: {},
        spriteMapper: {}
    };

    private generatedCoins: number = 0;

    private earnedPoints: number = 0;

    constructor(scene: Phaser.Scene, map: Map, player: Vehicle, depthLayer: number = 0, scale: number = 1, numCoinsToGenerate: number = 0) {
        this.scene = scene;
        this.map = map;
        this.player = player;

        this.depthLayer = depthLayer;
        this.scale = scale;

        this.texture = this.scene.textures.get(this.coin.mappingKey).getSourceImage();

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
    }

    public generateCoin(gridPosX: Range | number) {
        const randomX = isRange(gridPosX) ?
            this.map.getRandomRoadIdx(gridPosX.from, gridPosX.to) :
            this.map.getRandomRoadIdx(gridPosX);
        
        const randomY = this.map.getRandomLaneIdx(0);

        this.coin.sprite = 
            this.scene.physics.add.sprite(
                this.map.getChunkCenter(randomX).x, 
                this.map.getLanePosition(0, randomY),
                this.coin.mappingKey
            ).setOrigin(0.5, 1.0)
             .setScale(this.scale)
             .setDepth(this.depthLayer);
        
        this.coin.sprite?.anims.play(this.coin.key, true);
        
        this.coins.objectMapper[this.generatedCoins.toString()] =
            new Coin(
                this.scene, 
                this.generatedCoins.toString(), 
                this.coin.sprite,
                new Phaser.Math.Vector2(randomX, randomY),
                [ this.player.getSprite() ] 
                );
        
        this.coins.spriteMapper[this.generatedCoins.toString()] = this.coin.sprite;
    }

    public registerCoins(): void {
        this.coins.group = this.scene.physics.add.group(
            Object.keys(this.coins.spriteMapper).map(c => this.coins.spriteMapper[c])
        );
    }

    public generateRandomCoins(numCoins: number, range: Range): void {
        for (let i = 0; i < numCoins; ++i) {
            this.generateCoin({ from: range.from, to: range.to });

            this.generatedCoins++;
        }

        this.registerCoins();
    }

    public slowDown(speed: number) {
        this.coins.group?.incX(-speed);
    }

    private handleCoinCollided(id: string): void {
        if(this.coins.objectMapper[id]) {
            if (this.player.getLane() === this.coins.objectMapper[id].getLane()) {
                this.earnedPoints += this.coins.objectMapper[id].getRewardPoints();

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