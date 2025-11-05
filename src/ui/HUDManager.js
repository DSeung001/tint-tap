import { TimerManager } from '../managers/TimerManager.js';

export class HUDManager {
  constructor(domElements) {
    this.dom = domElements;
  }

  update(level, score, lives, bestScore, remainingSeconds) {
    this.dom.levelDisplay.textContent = String(level);
    this.dom.scoreDisplay.textContent = String(score);
    this.dom.livesDisplay.textContent = String(lives);
    this.dom.timerDisplay.textContent = TimerManager.formatSeconds(remainingSeconds);
    this.dom.bestDisplay.textContent = String(bestScore);
  }

  updateGameOver(score, bestScore) {
    this.dom.finalScore.textContent = `최종 점수: ${score}`;
    this.dom.highScore.textContent = `최고 점수: ${bestScore}`;
  }
}

