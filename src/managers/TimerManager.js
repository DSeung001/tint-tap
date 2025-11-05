function formatSeconds(value) {
  return `${value.toFixed(1)}s`;
}

export class TimerManager {
  constructor(config, onUpdate) {
    this.config = config;
    this.onUpdate = onUpdate;
    this.levelStartTime = null;
    this.timerId = null;
  }

  start() {
    this.levelStartTime = performance.now();
    const tickInterval = 1000 / this.config.timing.tickHz;
    this.timerId = window.setInterval(() => this.update(), tickInterval);
    this.update();
  }

  update() {
    if (!this.levelStartTime) {
      return;
    }
    const elapsed = (performance.now() - this.levelStartTime) / 1000;
    const remaining = Math.max(0, this.config.timing.bonusClockPerLevelSec - elapsed);
    if (this.onUpdate) {
      this.onUpdate(formatSeconds(remaining), remaining);
    }
  }

  clear() {
    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    this.levelStartTime = null;
  }

  getElapsedSeconds() {
    if (!this.levelStartTime) {
      return 0;
    }
    return (performance.now() - this.levelStartTime) / 1000;
  }

  getRemainingSeconds() {
    if (!this.levelStartTime) {
      return this.config.timing.bonusClockPerLevelSec;
    }
    const elapsed = this.getElapsedSeconds();
    return Math.max(0, this.config.timing.bonusClockPerLevelSec - elapsed);
  }

  static formatSeconds(value) {
    return formatSeconds(value);
  }
}

