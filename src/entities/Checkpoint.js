export default class Checkpoint extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'checkpoint_off');
    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.activated = false;
    this.spawnX = x;
    this.spawnY = y - 50;

    this.beam = scene.add.graphics();
    this.drawBeam();
  }

  activate() {
    if (this.activated) return false;
    this.activated = true;
    this.setTexture('checkpoint_on');
    this.drawBeam();
    return true;
  }

  drawBeam() {
    this.beam.clear();
    if (!this.activated) {
      this.beam.fillStyle(0x555577, 1);
      this.beam.fillRect(this.x - 2, this.y - 60, 4, 56);
    } else {
      this.beam.fillStyle(0x9c88ff, 0.6);
      this.beam.fillRect(this.x - 4, this.y - 80, 8, 76);
      this.beam.fillStyle(0xffffff, 0.9);
      this.beam.fillRect(this.x - 2, this.y - 80, 4, 76);
    }
  }

  destroy() {
    if (this.beam) this.beam.destroy();
    super.destroy();
  }
}
