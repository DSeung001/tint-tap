import { TimerManager } from '../managers/TimerManager.js';
import { languageManager } from '../managers/LanguageManager.js';

export class HUDManager {
  constructor(domElements) {
    this.dom = domElements;
    this.updateLabels();
  }

  updateLabels() {
    // HUD 레이블 업데이트
    const levelItem = this.dom.levelDisplay?.parentElement;
    if (levelItem) {
      levelItem.innerHTML = `${languageManager.t('level')}: <span id="level-display">${this.dom.levelDisplay?.textContent || '1'}</span>`;
      this.dom.levelDisplay = document.getElementById('level-display');
    }

    const scoreItem = this.dom.scoreDisplay?.parentElement;
    if (scoreItem) {
      scoreItem.innerHTML = `${languageManager.t('score')}: <span id="score-display">${this.dom.scoreDisplay?.textContent || '0'}</span>`;
      this.dom.scoreDisplay = document.getElementById('score-display');
    }

    const livesItem = this.dom.livesDisplay?.parentElement;
    if (livesItem) {
      livesItem.innerHTML = `${languageManager.t('lives')}: <span id="lives-display">${this.dom.livesDisplay?.textContent || '3'}</span>`;
      this.dom.livesDisplay = document.getElementById('lives-display');
    }

    const timerItem = this.dom.timerDisplay?.parentElement;
    if (timerItem) {
      timerItem.innerHTML = `${languageManager.t('timer')}: <span id="timer-display">${this.dom.timerDisplay?.textContent || '0.0s'}</span>`;
      this.dom.timerDisplay = document.getElementById('timer-display');
    }

    const bestItem = this.dom.bestDisplay?.parentElement;
    if (bestItem) {
      bestItem.innerHTML = `${languageManager.t('best')}: <span id="best-display">${this.dom.bestDisplay?.textContent || '0'}</span>`;
      this.dom.bestDisplay = document.getElementById('best-display');
    }
  }

  update(level, score, lives, bestScore, remainingSeconds) {
    this.dom.levelDisplay.textContent = String(level);
    this.dom.scoreDisplay.textContent = String(score);
    this.dom.livesDisplay.textContent = String(lives);
    this.dom.timerDisplay.textContent = TimerManager.formatSeconds(remainingSeconds);
    this.dom.bestDisplay.textContent = String(bestScore);
  }

  updateGameOver(score, bestScore) {
    this.dom.finalScore.textContent = `${languageManager.t('finalScore')}: ${score}`;
    this.dom.highScore.textContent = `${languageManager.t('highScore')}: ${bestScore}`;
  }
}

