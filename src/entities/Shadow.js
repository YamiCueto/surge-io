export default class Shadow extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'shadow');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setSize(26, 36);
    this.setAlpha(0.75);

    this.speed = 160;
    this.attackDamage = 10;
    this.attackCooldown = 0;
    this.attackRange = 40;
    this.lifetime = 12000;
    this.elapsed = 0;
    this.isDead = false;
    this.target = null;
  }

  update(delta, enemies) {
    if (this.isDead) return;

    this.elapsed += delta;
    this.attackCooldown = Math.max(0, this.attackCooldown - delta);

    const remaining = this.lifetime - this.elapsed;
    this.setAlpha(remaining < 2000 ? 0.3 + 0.45 * (remaining / 2000) : 0.75);

    if (this.elapsed >= this.lifetime) {
      this.expire();
      return;
    }

    this.target = this.findTarget(enemies);

    if (this.target) {
      this.chaseAndAttack(delta);
    } else {
      this.setVelocityX(0);
    }
  }

  findTarget(enemies) {
    let closest = null;
    let minDist = 400;
    enemies.forEach(e => {
      if (e.isDead) return;
      const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
      if (d < minDist) {
        minDist = d;
        closest = e;
      }
    });
    return closest;
  }

  chaseAndAttack() {
    const t = this.target;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, t.x, t.y);

    if (dist > this.attackRange) {
      const dir = t.x < this.x ? -1 : 1;
      this.setVelocityX(this.speed * dir);
      this.setFlipX(dir === -1);
    } else {
      this.setVelocityX(0);
      if (this.attackCooldown <= 0) {
        t.takeDamage(this.attackDamage);
        this.attackCooldown = 600;
      }
    }
  }

  expire() {
    this.isDead = true;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 400,
      onComplete: () => this.destroy()
    });
  }
}
