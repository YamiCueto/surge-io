import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Shadow from '../entities/Shadow.js';
import Chest from '../entities/Chest.js';
import Checkpoint from '../entities/Checkpoint.js';
import Projectile from '../entities/Projectile.js';
import ManaSystem from '../systems/ManaSystem.js';
import HUD from '../ui/HUD.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.createTextures();
  }

  create() {
    this.worldWidth = 3200;
    this.worldHeight = 540;

    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    this.buildWorld();

    this.player = new Player(this, 100, 440);

    this.enemies = [
      new Enemy(this, 400, 440),
      new Enemy(this, 850, 440),
      new Enemy(this, 1300, 440),
      new Enemy(this, 1700, 440),
      new Enemy(this, 2200, 440),
    ];

    this.physics.add.collider(this.player, this.platforms);
    this.enemies.forEach(e => this.physics.add.collider(e, this.platforms));

    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.manaSystem = new ManaSystem(this.player);
    this.hud = new HUD(this);
    this.shadows = [];
    this.maxShadows = 2;
    this.shadowManaCost = 30;

    this.chests = [
      new Chest(this, 250, 492),
      new Chest(this, 700, 492),
      new Chest(this, 1100, 492),
      new Chest(this, 1600, 492),
      new Chest(this, 2400, 492),
    ];
    this.chests.forEach(c => this.physics.add.collider(c, this.platforms));

    this.checkpoints = [
      new Checkpoint(this, 600, 500),
      new Checkpoint(this, 1400, 500),
      new Checkpoint(this, 2200, 500),
    ];
    this.checkpoints.forEach(cp => this.physics.add.collider(cp, this.platforms));

    this.lastCheckpoint = { x: 100, y: 440 };
    this.isDead = false;

    this.projectiles = [];

    this.player.on('skill', (dirX) => {
      const canFire = this.manaSystem.consume(this.player.skillManaCost);
      if (!canFire) {
        this.showFloatingText(this.player.x, this.player.y - 30, 'Not enough MP!', '#3498db');
        return;
      }
      this.player.skillCooldown = this.player.skillCooldownMax;
      const proj = new Projectile(this, this.player.x + (dirX * 20), this.player.y, dirX);
      this.physics.add.collider(proj, this.platforms, () => proj.expire());
      this.projectiles.push(proj);
    });
  }

  createTextures() {
    const playerGfx = this.make.graphics({ x: 0, y: 0, add: false });
    playerGfx.fillStyle(0x4fc3f7, 1);
    playerGfx.fillRect(0, 0, 28, 44);
    playerGfx.fillStyle(0x81d4fa, 1);
    playerGfx.fillRect(6, 4, 16, 16);
    playerGfx.generateTexture('player', 28, 44);
    playerGfx.destroy();

    const enemyGfx = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGfx.fillStyle(0xef5350, 1);
    enemyGfx.fillRect(0, 0, 26, 36);
    enemyGfx.fillStyle(0xff8a80, 1);
    enemyGfx.fillRect(5, 4, 16, 14);
    enemyGfx.generateTexture('enemy', 26, 36);
    enemyGfx.destroy();

    const shadowGfx = this.make.graphics({ x: 0, y: 0, add: false });
    shadowGfx.fillStyle(0x9c88ff, 1);
    shadowGfx.fillRect(0, 0, 26, 36);
    shadowGfx.fillStyle(0xd7ceff, 1);
    shadowGfx.fillRect(5, 4, 16, 14);
    shadowGfx.generateTexture('shadow', 26, 36);
    shadowGfx.destroy();

    const chestClosed = this.make.graphics({ x: 0, y: 0, add: false });
    chestClosed.fillStyle(0x8B6914, 1);
    chestClosed.fillRect(0, 6, 32, 22);
    chestClosed.fillStyle(0xD4A017, 1);
    chestClosed.fillRect(0, 0, 32, 10);
    chestClosed.fillStyle(0xF5C518, 1);
    chestClosed.fillRect(12, 10, 8, 8);
    chestClosed.generateTexture('chest_closed', 32, 28);
    chestClosed.destroy();

    const chestOpen = this.make.graphics({ x: 0, y: 0, add: false });
    chestOpen.fillStyle(0x8B6914, 1);
    chestOpen.fillRect(0, 10, 32, 18);
    chestOpen.fillStyle(0xD4A017, 1);
    chestOpen.fillRect(0, 0, 32, 10);
    chestOpen.fillStyle(0x3a3a3a, 1);
    chestOpen.fillRect(2, 10, 28, 16);
    chestOpen.generateTexture('chest_open', 32, 28);
    chestOpen.destroy();

    const cpOff = this.make.graphics({ x: 0, y: 0, add: false });
    cpOff.fillStyle(0x555577, 1);
    cpOff.fillRect(6, 0, 8, 20);
    cpOff.fillRect(0, 14, 20, 6);
    cpOff.generateTexture('checkpoint_off', 20, 20);
    cpOff.destroy();

    const cpOn = this.make.graphics({ x: 0, y: 0, add: false });
    cpOn.fillStyle(0x9c88ff, 1);
    cpOn.fillRect(6, 0, 8, 20);
    cpOn.fillStyle(0xd7ceff, 1);
    cpOn.fillRect(0, 14, 20, 6);
    cpOn.generateTexture('checkpoint_on', 20, 20);
    cpOn.destroy();

    const projGfx = this.make.graphics({ x: 0, y: 0, add: false });
    projGfx.fillStyle(0xaaffaa, 1);
    projGfx.fillRect(0, 2, 12, 4);
    projGfx.fillStyle(0xffffff, 1);
    projGfx.fillRect(8, 3, 4, 2);
    projGfx.generateTexture('projectile', 12, 8);
    projGfx.destroy();
  }

  buildWorld() {
    const ground = this.add.graphics();
    ground.fillStyle(0x4a4a6a, 1);
    ground.fillRect(0, 500, this.worldWidth, 40);

    this.platforms = this.physics.add.staticGroup();

    const groundBody = this.platforms.create(this.worldWidth / 2, 520, null);
    groundBody.setVisible(false);
    groundBody.setSize(this.worldWidth, 40);
    groundBody.refreshBody();

    const platformData = [
      { x: 300, y: 420, w: 150 },
      { x: 600, y: 360, w: 120 },
      { x: 900, y: 300, w: 180 },
      { x: 1200, y: 380, w: 150 },
      { x: 1500, y: 320, w: 160 },
      { x: 1800, y: 400, w: 140 },
      { x: 2100, y: 340, w: 200 },
      { x: 2500, y: 300, w: 160 },
      { x: 2900, y: 360, w: 180 },
    ];

    const gfx = this.add.graphics();
    gfx.fillStyle(0x6a6a9a, 1);

    platformData.forEach(p => {
      gfx.fillRect(p.x - p.w / 2, p.y - 10, p.w, 20);
      const plat = this.platforms.create(p.x, p.y, null);
      plat.setVisible(false);
      plat.setSize(p.w, 20);
      plat.refreshBody();
    });
  }

  update(time, delta) {
    if (this.isDead) return;

    if (this.player.hp <= 0) {
      this.triggerDeath();
      return;
    }

    this.player.update(delta);
    this.manaSystem.update(delta);

    this.checkpoints.forEach(cp => {
      if (cp.activated) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, cp.x, cp.y);
      if (dist < 50) {
        const activated = cp.activate();
        if (activated) {
          this.lastCheckpoint = { x: cp.spawnX, y: cp.spawnY };
          this.showFloatingText(cp.x, cp.y - 90, 'Checkpoint!', '#9c88ff');
        }
      }
    });

    this.shadows = this.shadows.filter(s => !s.isDead);
    this.shadows.forEach(s => s.update(delta, this.enemies));

    this.projectiles = this.projectiles.filter(p => !p.hit && p.active);
    this.projectiles.forEach(proj => {
      proj.update(delta);
      this.enemies.forEach(enemy => {
        if (!enemy.isDead && !proj.hit) {
          if (Phaser.Geom.Rectangle.Overlaps(proj.getBounds(), enemy.getBounds())) {
            proj.onHitEnemy(enemy);
          }
        }
      });
    });

    let extractAvailable = false;
    let extractTarget = null;

    this.enemies.forEach(enemy => {
      enemy.update(delta, this.player);

      if (!enemy.isDead && this.player.attackBoxActive) {
        const ab = this.player.attackBox;
        const bounds = new Phaser.Geom.Rectangle(ab.x - 20, ab.y - 15, 40, 30);
        if (Phaser.Geom.Rectangle.Overlaps(bounds, enemy.getBounds())) {
          enemy.takeDamage(15, this.player.x);
          this.hitlag(60);
        }
      }

      if (enemy.isDead && enemy.extractable && !enemy.extracted) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
        if (dist < 100) {
          extractAvailable = true;
          extractTarget = enemy;
        }
      }
    });

    if (extractAvailable && extractTarget && Phaser.Input.Keyboard.JustDown(this.player.keys.extract)) {
      this.tryExtract(extractTarget);
    }

    this.chests.forEach(chest => {
      chest.update(this.player);
      if (!chest.opened && Phaser.Input.Keyboard.JustDown(this.player.keys.interact)) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, chest.x, chest.y);
        if (dist < 80) chest.open(this.player);
      }
    });

    const p = this.player;
    this.hud.updateHP(p.hp, p.maxHp);
    this.hud.updateMP(p.mp, p.maxMp);
    this.hud.updateSkill(p.skillCooldown, p.skillCooldownMax);
    this.hud.updateShadows(this.shadows.length, extractAvailable);
  }

  hitlag(duration) {
    this.physics.world.pause();
    this.time.delayedCall(duration, () => this.physics.world.resume());
  }

  triggerDeath() {
    this.isDead = true;
    this.player.setVelocity(0, 0);
    this.player.setTint(0xff0000);

    const overlay = this.add.rectangle(480, 270, 960, 540, 0x000000, 0)
      .setScrollFactor(0).setDepth(30);
    const txt = this.add.text(480, 240, 'DEFEATED', {
      fontSize: '40px', fill: '#e74c3c', fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(31);
    const sub = this.add.text(480, 295, 'Respawning at last checkpoint...', {
      fontSize: '16px', fill: '#aaaaaa'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(31);

    this.tweens.add({ targets: overlay, alpha: 0.7, duration: 600 });

    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: [overlay, txt, sub],
        alpha: 0,
        duration: 500,
        onComplete: () => {
          overlay.destroy(); txt.destroy(); sub.destroy();
          this.respawn();
        }
      });
    });
  }

  respawn() {
    this.player.setPosition(this.lastCheckpoint.x, this.lastCheckpoint.y);
    this.player.setVelocity(0, 0);
    this.player.clearTint();
    this.player.hp = Math.floor(this.player.maxHp * 0.4);
    this.player.mp = Math.floor(this.player.maxMp * 0.5);
    this.isDead = false;
  }

  tryExtract(enemy) {
    if (this.shadows.length >= this.maxShadows) {
      this.showFloatingText(enemy.x, enemy.y - 30, 'MAX SHADOWS!', '#f39c12');
      return;
    }
    const success = this.manaSystem.consume(this.shadowManaCost);
    if (!success) {
      this.showFloatingText(enemy.x, enemy.y - 30, 'NOT ENOUGH MP!', '#e74c3c');
      return;
    }
    enemy.extracted = true;
    enemy.extractable = false;
    enemy.setVisible(false);

    this.spawnExtractionParticles(enemy.x, enemy.y);

    const shadow = new Shadow(this, enemy.x, enemy.y);
    shadow.setScale(0.1);
    shadow.setAlpha(0);
    this.physics.add.collider(shadow, this.platforms);
    this.shadows.push(shadow);

    this.tweens.add({
      targets: shadow,
      scaleX: 1, scaleY: 1,
      alpha: 0.75,
      duration: 400,
      ease: 'Back.Out'
    });

    this.showFloatingText(enemy.x, enemy.y - 30, 'Shadow Extracted!', '#9c88ff');
  }

  spawnExtractionParticles(x, y) {
    for (let i = 0; i < 12; i++) {
      const px = this.add.rectangle(x, y, 4, 4, 0x9c88ff).setDepth(20);
      const angle = (i / 12) * Math.PI * 2;
      const dist = Phaser.Math.Between(30, 70);
      this.tweens.add({
        targets: px,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scaleX: 0, scaleY: 0,
        duration: Phaser.Math.Between(400, 700),
        onComplete: () => px.destroy()
      });
    }
  }

  showFloatingText(x, y, msg, color) {
    const txt = this.add.text(x, y, msg, { fontSize: '13px', fill: color, fontStyle: 'bold' }).setDepth(20);
    this.tweens.add({
      targets: txt,
      y: y - 40,
      alpha: 0,
      duration: 1200,
      onComplete: () => txt.destroy()
    });
  }
}
