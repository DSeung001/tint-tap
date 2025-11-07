import { TimerManager } from '../managers/TimerManager.js';
import { languageManager } from '../managers/LanguageManager.js';

export class HUDManager {
  constructor(domElements) {
    this.dom = domElements;
    this.updateLabels();
  }

  updateLabels() {
    // HUD 레이블 업데이트 (아이콘 클래스 유지)
    const levelItem = this.dom.levelDisplay?.parentElement;
    if (levelItem) {
      const iconClass = levelItem.classList.contains('icon-level') ? 'icon-level' : '';
      levelItem.innerHTML = `<span class="hud-label">${languageManager.t('level')}</span><span class="hud-separator">|</span><span id="level-display" class="hud-value">${this.dom.levelDisplay?.textContent || '1'}</span>`;
      if (iconClass) levelItem.classList.add(iconClass);
      this.dom.levelDisplay = document.getElementById('level-display');
    }

    const scoreItem = this.dom.scoreDisplay?.parentElement;
    if (scoreItem) {
      const iconClass = scoreItem.classList.contains('icon-score') ? 'icon-score' : '';
      scoreItem.innerHTML = `<span class="hud-label">${languageManager.t('score')}</span><span class="hud-separator">|</span><span id="score-display" class="hud-value">${this.dom.scoreDisplay?.textContent || '0'}</span>`;
      if (iconClass) scoreItem.classList.add(iconClass);
      this.dom.scoreDisplay = document.getElementById('score-display');
    }

    const livesItem = this.dom.livesDisplay?.parentElement;
    if (livesItem) {
      const iconClass = livesItem.classList.contains('icon-lives') ? 'icon-lives' : '';
      livesItem.innerHTML = `<span class="hud-label">${languageManager.t('lives')}</span><span class="hud-separator">|</span><span id="lives-display" class="hud-value">${this.dom.livesDisplay?.textContent || '3'}</span>`;
      if (iconClass) livesItem.classList.add(iconClass);
      this.dom.livesDisplay = document.getElementById('lives-display');
    }

    const timerItem = this.dom.timerDisplay?.parentElement;
    if (timerItem) {
      const iconClass = timerItem.classList.contains('icon-timer') ? 'icon-timer' : '';
      timerItem.innerHTML = `<span class="hud-label">${languageManager.t('timer')}</span><span class="hud-separator">|</span><span id="timer-display" class="hud-value">${this.dom.timerDisplay?.textContent || '0.0s'}</span>`;
      if (iconClass) timerItem.classList.add(iconClass);
      this.dom.timerDisplay = document.getElementById('timer-display');
    }

    const bestItem = this.dom.bestDisplay?.parentElement;
    if (bestItem) {
      const iconClass = bestItem.classList.contains('icon-best') ? 'icon-best' : '';
      bestItem.innerHTML = `<span class="hud-label">${languageManager.t('best')}</span><span class="hud-separator">|</span><span id="best-display" class="hud-value">${this.dom.bestDisplay?.textContent || '0'}</span>`;
      if (iconClass) bestItem.classList.add(iconClass);
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

