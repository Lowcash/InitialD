import Common, { LayerIDX } from '../_common/common'
import HUD from '../HUD';

export default class RewardHUD extends HUD {
    private readonly scoreLabel: Phaser.GameObjects.BitmapText;

    private readonly fontSize: number;
    private readonly fontPadding: number;
    private readonly zeroPadding: number;

    constructor(scene: Phaser.Scene, color: number = 0x000000, fontSize: number = 38, fontPadding: number = 50, zeroPadding: number = 6) {
        super(scene, new Phaser.Geom.Rectangle(0, 0, scene.game.config.width as number, fontSize + fontPadding), color, 1.0, LayerIDX.GUI);

        this.fontSize = fontSize;
        this.fontPadding = fontPadding;
        this.zeroPadding = zeroPadding;

        this.scoreLabel = this.scene.add.bitmapText(this.fontPadding, this.fontPadding, 'font', 'NO SCORE', this.fontSize);
        this.scoreLabel.setDepth(LayerIDX.GUI + 1);

        this.updateScore(0, this.zeroPadding);

        this.scene.events.on('onScoreChanged', (totalScore: number, changedByValue: number) => {
            this.handleScoreChanged(totalScore);
        });
    }

    private handleScoreChanged(totalScore: number): void {
        this.updateScore(totalScore, this.zeroPadding);
    }

    private updateScore(score: number, zeroPadding: number) {
        this.scoreLabel.text = `SCORE ${Common.fillZeroPadding(score, zeroPadding)}`;
    }
};