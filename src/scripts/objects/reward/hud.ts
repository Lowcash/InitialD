import Common, { LayerIDX } from '../_common/common'
import HUD from '../HUD';
import BackgroundTileSprite from '../tilesprites/backgroundTileSprite';
import { LEFT } from 'phaser';

export enum AppendFrom { LEFT, RIGHT };

export default class ScoreHUD extends HUD {
    private readonly scoreLabel: Phaser.GameObjects.BitmapText;

    private readonly fontSize: number;
    private readonly fontPadding: number;

    protected readonly zeroPadding: number;

    private readonly baseText: string;

    constructor(scene: Phaser.Scene, baseText: string = 'SCORE', appendFrom: AppendFrom = LEFT, color: number = 0x000000, fontSize: number = 38, fontPadding: number = 50, zeroPadding: number = 6) {
        super(scene, new Phaser.Geom.Rectangle(0, 0, scene.game.config.width as number, fontSize + fontPadding), color, 1.0, LayerIDX.GUI);

        this.fontSize = fontSize;
        this.fontPadding = fontPadding;
        this.zeroPadding = zeroPadding;

        this.baseText = baseText;

        this.scoreLabel = this.scene.add.bitmapText(
            this.fontPadding, 
            this.fontPadding, 
            'font', 
            `NO ${this.baseText}`, 
            this.fontSize
        );

        this.scoreLabel.setDepth(LayerIDX.GUI + 1);

        this.updateScore(0, this.zeroPadding);
        
        if (appendFrom === AppendFrom.RIGHT) {
            this.scoreLabel.setX((scene.game.config.width as number) - (this.scoreLabel.width + this.fontPadding));
        }
    }

    public updateScore(score: number, zeroPadding?: number) {
        this.scoreLabel.text = `${this.baseText} ${Common.fillZeroPadding(score, zeroPadding ?? this.zeroPadding)}`;
    }
};

/**
 * ScoreHUD extended by change score handling
 */
export class ScoreHUDExtended extends ScoreHUD {
    constructor(scene: Phaser.Scene, baseText: string = 'SCORE', appendFrom: AppendFrom = LEFT, color: number = 0x000000, fontSize: number = 38, fontPadding: number = 50, zeroPadding: number = 6) {
        super(scene, baseText, appendFrom, color, fontSize, fontPadding, zeroPadding);

        this.scene.events.on('onScoreChanged', (totalScore: number, changedByValue: number) => {
            this.handleScoreChanged(totalScore);
        });
    }

    private handleScoreChanged(totalScore: number): void {
        this.updateScore(totalScore, this.zeroPadding);
    }
};