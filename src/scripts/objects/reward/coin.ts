import Common from '../_common/common';

import ICollidable from '../interfaces/ICollidable';

export default class Coin implements ICollidable {
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