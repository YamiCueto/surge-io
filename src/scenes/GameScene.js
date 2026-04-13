import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Shadow from '../entities/Shadow.js';
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
    this.hud = new HUD(this, this.player);
    this.shadows = [];
    this.maxShadows = 2;
    this.shadowManaCost = 30;
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
    this.player.update(delta);
    this.manaSystem.update(delta);

    this.shadows = this.shadows.filter(s => !s.isDead);
    this.shadows.forEach(s => {
      s.update(delta, this.enemies);
    });

    let extractAvailable = false;
    let extractTarget = null;

    this.enemies.forEach(enemy => {
      enemy.update(delta, this.player);

      if (!enemy.isDead && this.player.attackBoxActive) {
        const ab = this.player.attackBox;
        const bounds = new Phaser.Geom.Rectangle(ab.x - 20, ab.y - 15, 40, 30);
        if (Phaser.Geom.Rectangle.Overlaps(bounds, enemy.getBounds())) {
          enemy.takeDamage(15);
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

    this.hud.update(this.shadows.length, extractAvailable);
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

    const shadow = new Shadow(this, enemy.x, enemy.y);
    this.physics.add.collider(shadow, this.platforms);
    this.shadows.push(shadow);

    this.showFloatingText(enemy.x, enemy.y - 30, 'Shadow Extracted!', '#9c88ff');
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
