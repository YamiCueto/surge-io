export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setGravityY(0);
    this.setSize(28, 44);

    this.hp = 100;
    this.maxHp = 100;
    this.mp = 80;
    this.maxMp = 80;
    this.speed = 200;
    this.jumpForce = 480;
    this.attackCooldown = 0;
    this.isAttacking = false;
    this.skillCooldown = 0;
    this.skillCooldownMax = 3000;
    this.skillManaCost = 20;

    this.keys = scene.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      attack: Phaser.Input.Keyboard.KeyCodes.J,
      skill: Phaser.Input.Keyboard.KeyCodes.K,
      extract: Phaser.Input.Keyboard.KeyCodes.E,
      interact: Phaser.Input.Keyboard.KeyCodes.F,
    });

    this.attackBox = scene.add.rectangle(0, 0, 40, 30, 0xffff00, 0);
    scene.physics.add.existing(this.attackBox, false);
    this.attackBox.body.allowGravity = false;
    this.attackBox.body.enable = false;
    this.attackBoxActive = false;
  }

  update(delta) {
    const { left, right, jump, attack } = this.keys;
    const onGround = this.body.blocked.down;

    if (left.isDown) {
      this.setVelocityX(-this.speed);
      this.setFlipX(true);
    } else if (right.isDown) {
      this.setVelocityX(this.speed);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    if (Phaser.Input.Keyboard.JustDown(jump) && onGround) {
      this.setVelocityY(-this.jumpForce);
    }

    if (this.attackCooldown > 0) this.attackCooldown -= delta;
    if (this.skillCooldown > 0) this.skillCooldown -= delta;

    if (Phaser.Input.Keyboard.JustDown(attack) && this.attackCooldown <= 0) {
      this.triggerAttack();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.skill) && this.skillCooldown <= 0) {
      this.emit('skill', this.flipX ? -1 : 1);
    }

    this.updateAttackBox();
  }

  triggerAttack() {
    this.isAttacking = true;
    this.attackCooldown = 400;
    this.attackBox.body.enable = true;
    this.attackBoxActive = true;

    this.scene.time.delayedCall(150, () => {
      this.isAttacking = false;
      this.attackBox.body.enable = false;
      this.attackBoxActive = false;
    });
  }

  updateAttackBox() {
    const offsetX = this.flipX ? -36 : 36;
    this.attackBox.x = this.x + offsetX;
    this.attackBox.y = this.y;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    this.spawnDamageNumber(amount);
    this.screenFlash();
  }

  screenFlash() {
    const flash = this.scene.add.rectangle(0, 0, 960, 540, 0xff0000, 0.25)
      .setScrollFactor(0).setDepth(50).setOrigin(0, 0);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 220,
      onComplete: () => flash.destroy()
    });
  }

  spawnDamageNumber(amount) {
    const txt = this.scene.add.text(this.x + Phaser.Math.Between(-8, 8), this.y - 24, `-${amount}`, {
      fontSize: '14px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(25);
    this.scene.tweens.add({
      targets: txt,
      y: txt.y - 40,
      alpha: 0,
      duration: 800,
      onComplete: () => txt.destroy()
    });
  }

  restoreHp(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  restoreMp(amount) {
    this.mp = Math.min(this.maxMp, this.mp + amount);
  }

  consumeMp(amount) {
    if (this.mp < amount) return false;
    this.mp -= amount;
    return true;
  }

  regenMp(delta) {
    const regenRate = 4;
    this.mp = Math.min(this.maxMp, this.mp + regenRate * (delta / 1000));
  }
}
