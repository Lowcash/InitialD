export default class BasicButton extends Phaser.GameObjects.Sprite {
    private readonly buttonSound?: Phaser.Sound.BaseSound;

    constructor(scene: Phaser.Scene, pos: Phaser.Math.Vector2, mappingKey: string, scale?: number, angleRotation?: number, soundKey?: string ) {
        super(scene, pos.x, pos.y, mappingKey);

        if (scale) {
            this.setScale(scale);
        }
        
        if (angleRotation) {
            this.setOrigin(0.5, 0.5);
            this.setAngle(angleRotation);
        }

        if (soundKey) {
            this.buttonSound = scene.sound.add(soundKey, {} );
        }

        this.setInteractive();

        scene.add.existing(this);
     }

     public playSound(): void {
        this.buttonSound?.play();
     }
  }