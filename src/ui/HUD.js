export default class HUD {
  constructor(scene) {
    this.scene = scene;

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

    this.labelSkill = scene.add.text(this.barX, this.barY + 78, 'SKILL', {
      fontSize: '11px', fill: '#aaffaa', fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(12);

    this.skillHint = scene.add.text(this.barX + 20 + this.barW + 6, this.barY + 78, '', {
      fontSize: '10px', fill: '#aaffaa'
    }).setScrollFactor(0).setDepth(12);

    // Internal state
    this._hp = 100; this._maxHp = 100;
    this._mp = 80;  this._maxMp = 80;
    this._skill = 0; this._skillMax = 3000;
    this._shadows = 0; this._extractAvailable = false;
  }

  updateHP(current, max) {
    this._hp = current;
    this._maxHp = max;
    this._redraw();
  }

  updateMP(current, max) {
    this._mp = current;
    this._maxMp = max;
    this._redraw();
  }

  updateSkill(cooldown, max) {
    this._skill = cooldown;
    this._skillMax = max;
    this._redraw();
  }

  updateShadows(count, extractAvailable = false) {
    this._shadows = count;
    this._extractAvailable = extractAvailable;
    this._redraw();
  }

  /** @deprecated Use the individual update methods instead */
  update(shadowCount = 0, extractAvailable = false) {
    this._shadows = shadowCount;
    this._extractAvailable = extractAvailable;
    this._redraw();
  }

  _redraw() {
    const hpRatio    = Math.max(0, this._hp  / this._maxHp);
    const mpRatio    = Math.max(0, this._mp  / this._maxMp);
    const skillRatio = Math.max(0, 1 - this._skill / this._skillMax);

    this.bg.clear();
    this.bg.fillStyle(0x000000, 0.55);
    this.bg.fillRoundedRect(this.barX - 2, this.barY - 3, this.barW + 60, 98, 6);

    this.bars.clear();

    this.bars.fillStyle(0x4a0000, 1);
    this.bars.fillRect(this.barX + 20, this.barY, this.barW, this.barH);
    this.bars.fillStyle(0xe53935, 1);
    this.bars.fillRect(this.barX + 20, this.barY, this.barW * hpRatio, this.barH);

    this.bars.fillStyle(0x1a237e, 1);
    this.bars.fillRect(this.barX + 20, this.barY + 22, this.barW, this.barH);
    this.bars.fillStyle(0x1e88e5, 1);
    this.bars.fillRect(this.barX + 20, this.barY + 22, this.barW * mpRatio, this.barH);

    this.bars.fillStyle(0x1a3a1a, 1);
    this.bars.fillRect(this.barX + 20, this.barY + 78, this.barW, this.barH);
    this.bars.fillStyle(0x66bb6a, 1);
    this.bars.fillRect(this.barX + 20, this.barY + 78, this.barW * skillRatio, this.barH);

    this.valueHp.setText(`${Math.ceil(this._hp)}/${this._maxHp}`);
    this.valueMp.setText(`${Math.floor(this._mp)}/${this._maxMp}`);
    this.shadowLabel.setText(`SHADOWS: ${this._shadows} / 2`);
    this.extractHint.setText(this._extractAvailable ? '[E] Extract Shadow' : '');
    this.skillHint.setText(this._skill <= 0 ? '[K] Ready' : `${(this._skill / 1000).toFixed(1)}s`);
  }
}
