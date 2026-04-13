export default class ManaSystem {
  constructor(player) {
    this.player = player;
    this.regenRate = 4;
  }

  update(delta) {
    this.player.mp = Math.min(
      this.player.maxMp,
      this.player.mp + this.regenRate * (delta / 1000)
    );
  }

  consume(amount) {
    if (this.player.mp < amount) return false;
    this.player.mp -= amount;
    return true;
  }

  restore(amount) {
    this.player.mp = Math.min(this.player.maxMp, this.player.mp + amount);
  }
}
