export default interface ICollidable {
    registerCollision(collidingObj: Phaser.Physics.Arcade.Sprite): void;
};