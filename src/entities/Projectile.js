export default class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, dirX) {
    super(scene, x, y, 'projectile');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.allowGravity = false;
    this.setSize(12, 8);
    this.damage = 25;
    this.speed = 500;
    this.lifetime = 1200;
    this.elapsed = 0;
    this.hit = false;

    this.setVelocityX(this.speed * dirX);
    this.setFlipX(dirX === -1);
  }

  update(delta) {
    if (this.hit) return;
    this.elapsed += delta;
    if (this.elapsed >= this.lifetime) {
      this.expire();
    }
  }

  onHitEnemy(enemy) {
    if (this.hit) return;
    this.hit = true;
    enemy.takeDamage(this.damage);
    this.expire();
  }

  expire() {
    this.hit = true;
    this.setVisible(false);
    this.body.enable = false;
    this.scene.time.delayedCall(50, () => this.destroy());
  }
}
