export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setSize(26, 36);

    this.hp = 40;
    this.maxHp = 40;
    this.speed = 80;
    this.detectionRange = 220;
    this.contactDamage = 8;
    this.damageCooldown = 0;
    this.patrolDir = 1;
    this.patrolTimer = 0;
    this.patrolInterval = 2200;
    this.isDead = false;
    this.extractable = false;
    this.extracted = false;

    this.hpBar = scene.add.graphics();
    this.drawHpBar();
  }

  update(delta, player) {
    if (this.isDead) return;

    this.damageCooldown = Math.max(0, this.damageCooldown - delta);
    this.patrolTimer += delta;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    if (dist < this.detectionRange) {
      this.chasePlayer(player);
    } else {
      this.patrol();
    }

    if (dist < 30 && this.damageCooldown <= 0) {
      player.takeDamage(this.contactDamage);
      this.damageCooldown = 800;
    }

    this.drawHpBar();
  }

  chasePlayer(player) {
    const dir = player.x < this.x ? -1 : 1;
    this.setVelocityX(this.speed * 1.4 * dir);
    this.setFlipX(dir === -1);
  }

  patrol() {
    if (this.patrolTimer >= this.patrolInterval) {
      this.patrolDir *= -1;
      this.patrolTimer = 0;
    }
    this.setVelocityX(this.speed * this.patrolDir);
    this.setFlipX(this.patrolDir === -1);
  }

  takeDamage(amount) {
    if (this.isDead) return;
    this.hp -= amount;
    this.setTint(0xff4444);
    this.scene.time.delayedCall(100, () => this.clearTint());

    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.isDead = true;
    this.setVelocity(0, 0);
    this.body.enable = false;
    this.setTint(0x333333);
    this.hpBar.destroy();

    if (Math.random() < 0.25) {
      this.extractable = true;
    }
  }

  drawHpBar() {
    if (this.isDead) return;
    this.hpBar.clear();
    const bw = 34;
    const bh = 5;
    const bx = this.x - bw / 2;
    const by = this.y - 28;
    this.hpBar.fillStyle(0x550000, 1);
    this.hpBar.fillRect(bx, by, bw, bh);
    const ratio = Math.max(0, this.hp / this.maxHp);
    this.hpBar.fillStyle(0xff3333, 1);
    this.hpBar.fillRect(bx, by, bw * ratio, bh);
  }

  destroy() {
    if (this.hpBar) this.hpBar.destroy();
    super.destroy();
  }
}
