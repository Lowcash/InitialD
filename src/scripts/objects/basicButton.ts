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

        // //check if config contains a scene
        // if (!config.scene) {
        //     console.log('missing scene');
        //     return;
        // }
        // //check if config contains a key
        // if (!config.key) {
        //     console.log("missing key!");
        //     return;
        // }
        // //if there is no up property assume 0
        // if (!config.up) {
        //     config.up = 0;
        // }
        // //if there is no down in config use up
        // if (!config.down) {
        //     config.down = config.up;
        // }
        // //if there is no over in config use up
        // if (!config.over) {
        //     config.over = config.up;
        // }
     }

     public playSound(): void {
        this.buttonSound?.play();
     }
  }