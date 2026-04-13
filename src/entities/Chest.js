export default class Chest extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'chest_closed');
    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.opened = false;
    this.loot = Math.random() < 0.5 ? 'hp' : 'mp';

    this.hint = scene.add.text(x, y - 28, '[F] Open', {
      fontSize: '10px', fill: '#f1c40f', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(15).setVisible(false);
  }

  update(player) {
    if (this.opened) {
      this.hint.setVisible(false);
      return;
    }
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    this.hint.setVisible(dist < 80);
    this.hint.setPosition(this.x, this.y - 28);
  }

  open(player) {
    if (this.opened) return;
    this.opened = true;
    this.hint.setVisible(false);
    this.setTexture('chest_open');

    if (this.loot === 'hp') {
      player.restoreHp(30);
      this.showLootText('+30 HP', '#e74c3c');
    } else {
      player.restoreMp(25);
      this.showLootText('+25 MP', '#3498db');
    }
  }

  showLootText(msg, color) {
    const txt = this.scene.add.text(this.x, this.y - 40, msg, {
      fontSize: '14px', fill: color, fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(20);
    this.scene.tweens.add({
      targets: txt,
      y: this.y - 80,
      alpha: 0,
      duration: 1400,
      onComplete: () => txt.destroy()
    });
  }

  destroy() {
    if (this.hint) this.hint.destroy();
    super.destroy();
  }
}
