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
    this.stunTimer = 0;
    this.extractWindowTimer = 0;
    this.extractLabel = null;
    this._pulseDir = 1;

    this.hpBar = scene.add.graphics();
    this.drawHpBar();
  }

  update(delta, player) {
    if (this.isDead) {
      this._tickExtractWindow(delta);
      return;
    }

    this.damageCooldown = Math.max(0, this.damageCooldown - delta);
    this.patrolTimer += delta;
    this.stunTimer = Math.max(0, this.stunTimer - delta);

    if (this.stunTimer > 0) {
      this.drawHpBar();
      return;
    }

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

  takeDamage(amount, attackerX) {
    if (this.isDead) return;
    this.hp -= amount;
    this.spawnDamageNumber(amount);
    this.applyKnockback(attackerX);
    this.flashHit();

    if (this.hp <= 0) {
      this.die();
    }
  }

  applyKnockback(attackerX) {
    const dir = this.x < attackerX ? -1 : 1;
    this.setVelocityX(280 * dir);
    this.setVelocityY(-160);
    this.stunTimer = 250;
  }

  flashHit() {
    this.setTint(0xffffff);
    this.scene.time.delayedCall(60, () => {
      if (!this.isDead) this.setTint(0xff4444);
    });
    this.scene.time.delayedCall(160, () => {
      if (!this.isDead) this.clearTint();
    });
  }

  spawnDamageNumber(amount) {
    const txt = this.scene.add.text(this.x + Phaser.Math.Between(-10, 10), this.y - 20, `-${amount}`, {
      fontSize: '13px', fill: '#ff6b6b', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(25);
    this.scene.tweens.add({
      targets: txt,
      y: txt.y - 36,
      alpha: 0,
      duration: 900,
      onComplete: () => txt.destroy()
    });
  }

  die() {
    this.isDead = true;
    this.setVelocity(0, 0);
    this.body.enable = false;
    this.hpBar.destroy();

    if (Math.random() < 0.25) {
      this.extractable = true;
      this.extractWindowTimer = 5000;
      this._startExtractPulse();
    }

    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      scaleX: 1.3,
      scaleY: 0.5,
      y: this.y + 10,
      duration: 180,
      ease: 'Power2',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this,
          alpha: 0.25,
          scaleX: 1,
          scaleY: 1,
          duration: 200,
          onComplete: () => this.setTint(0x1a0033)
        });
      }
    });
  }

  _startExtractPulse() {
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.15, to: 0.5 },
      duration: 500,
      yoyo: true,
      repeat: 9,
      onComplete: () => {
        if (!this.extracted) this._disappear();
      }
    });

    this.extractLabel = this.scene.add.text(this.x, this.y - 44, '[E] 5s', {
      fontSize: '10px', fill: '#f1c40f', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(20);
  }

  _tickExtractWindow(delta) {
    if (!this.extractable || this.extracted || this.extractWindowTimer <= 0) return;
    this.extractWindowTimer -= delta;
    if (this.extractLabel && this.extractLabel.active) {
      const secs = Math.ceil(this.extractWindowTimer / 1000);
      this.extractLabel.setText(`[E] ${secs}s`);
    }
    if (this.extractWindowTimer <= 0) {
      this._disappear();
    }
  }

  _disappear() {
    this.extractable = false;
    if (this.extractLabel) { this.extractLabel.destroy(); this.extractLabel = null; }
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 300,
      onComplete: () => { this.extracted = true; }
    });
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
    if (this.extractLabel) this.extractLabel.destroy();
    super.destroy();
  }
}
