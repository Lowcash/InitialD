import { Range, SpriteMappingSized, Common } from './common';
import { isRange } from './typeGuardHelper'
import { Map } from './map'
import { Vehicle } from './traffic';

import IMovable from './IMovable';
import ICollidable from './ICollidable';
import HUD from './HUD';

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

    public registerCollision(collideWith: Phaser.Physics.Arcade.Sprite): void {
        this.scene.physics.add.overlap(this.sprite, collideWith, () => {
            this.destroyCoin();

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

export class Reward implements IMovable {
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
        soundKey: 'sound_coin_earned',

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
        const randomX = isRange(gridPosX) ?
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

export class RewardHUD extends HUD {
    private readonly scoreLabel: Phaser.GameObjects.BitmapText;

    private readonly fontSize: number;
    private readonly fontPadding: number;
    private readonly zeroPadding: number;

    constructor(scene: Phaser.Scene, color: number = 0x000000, fontSize: number = 38, fontPadding: number = 50, zeroPadding: number = 6) {
        super(scene, new Phaser.Geom.Rectangle(0, 0, scene.game.config.width as number, fontSize + fontPadding), color);

        this.fontSize = fontSize;
        this.fontPadding = fontPadding;
        this.zeroPadding = zeroPadding;

        this.scoreLabel = this.scene.add.bitmapText(this.fontPadding, this.fontPadding, 'font', 'NO SCORE', this.fontSize);

        this.updateScore(0, this.zeroPadding);

        this.scene.events.on('onScoreChanged', (totalScore: number, changedByValue: number) => {
            this.handleScoreChanged(totalScore);
        });
    }

    private fillZeroPadding(number: number, size: number): string {
        let stringNumber = number.toString();

        while (stringNumber.length < (size || 2)) {
            stringNumber = "0" + stringNumber;
        }

        return stringNumber;
    }

    private handleScoreChanged(totalScore: number): void {
        this.updateScore(totalScore, this.zeroPadding);
    }

    private updateScore(score: number, zeroPadding: number) {
        this.scoreLabel.text = `SCORE ${this.fillZeroPadding(score, zeroPadding)}`;
    }
};