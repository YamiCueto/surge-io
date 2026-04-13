export default class HUD {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    this.barX = 16;
    this.barY = 16;
    this.barW = 160;
    this.barH = 14;

    this.bg = scene.add.graphics().setScrollFactor(0).setDepth(10);
    this.bars = scene.add.graphics().setScrollFactor(0).setDepth(11);

    this.labelHp = scene.add.text(this.barX, this.barY - 1, 'HP', {
      fontSize: '11px', fill: '#ffffff', fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(12);

    this.labelMp = scene.add.text(this.barX, this.barY + 22, 'MP', {
      fontSize: '11px', fill: '#ffffff', fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(12);

    this.valueHp = scene.add.text(this.barX + this.barW + 6, this.barY - 1, '', {
      fontSize: '11px', fill: '#dddddd'
    }).setScrollFactor(0).setDepth(12);

    this.valueMp = scene.add.text(this.barX + this.barW + 6, this.barY + 22, '', {
      fontSize: '11px', fill: '#dddddd'
    }).setScrollFactor(0).setDepth(12);

    this.shadowLabel = scene.add.text(this.barX, this.barY + 46, 'SHADOWS: 0 / 2', {
      fontSize: '11px', fill: '#9c88ff', fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(12);

    this.extractHint = scene.add.text(this.barX, this.barY + 62, '', {
      fontSize: '10px', fill: '#f1c40f'
    }).setScrollFactor(0).setDepth(12);
  }

  update(shadowCount = 0, extractAvailable = false) {
    const p = this.player;
    const hpRatio = Math.max(0, p.hp / p.maxHp);
    const mpRatio = Math.max(0, p.mp / p.maxMp);

    this.bg.clear();
    this.bg.fillStyle(0x000000, 0.55);
    this.bg.fillRoundedRect(this.barX - 2, this.barY - 3, this.barW + 60, 80, 6);

    this.bars.clear();

    this.bars.fillStyle(0x4a0000, 1);
    this.bars.fillRect(this.barX + 20, this.barY, this.barW, this.barH);
    this.bars.fillStyle(0xe53935, 1);
    this.bars.fillRect(this.barX + 20, this.barY, this.barW * hpRatio, this.barH);

    this.bars.fillStyle(0x1a237e, 1);
    this.bars.fillRect(this.barX + 20, this.barY + 22, this.barW, this.barH);
    this.bars.fillStyle(0x1e88e5, 1);
    this.bars.fillRect(this.barX + 20, this.barY + 22, this.barW * mpRatio, this.barH);

    this.valueHp.setText(`${Math.ceil(p.hp)}/${p.maxHp}`);
    this.valueMp.setText(`${Math.floor(p.mp)}/${p.maxMp}`);
    this.shadowLabel.setText(`SHADOWS: ${shadowCount} / 2`);
    this.extractHint.setText(extractAvailable ? '[E] Extract Shadow' : '');
  }
}
