import { deltaFor, oddCountFor, gridFor } from './difficulty.js';
import { randomBaseColor, oddColorFrom, toCssColor } from './color.js';

const STORAGE_KEY = 'tint-tap-best-score';

function formatSeconds(value) {
  return `${value.toFixed(1)}s`;
}

export class TintTapGame {
  constructor(config) {
    this.config = config;
    this.maxLevel = config.levels.maxLevel;
    this.baseLives = config.levels.lives;
    this.resetState();
  }

  resetState() {
    this.level = 1;
    this.score = 0;
    this.lives = this.baseLives;
    this.bestScore = this.loadBestScore();
    this.levelStartTime = null;
    this.levelTimerId = null;
    this.activeOddTiles = new Set();
    this.selectedTiles = new Set();
  }

  init() {
    this.cacheDom();
    this.bindUi();
    this.showStartScreen();
    this.updateHud();
  }

  cacheDom() {
    this.dom = {
      startScreen: document.getElementById('start-screen'),
      gameOverScreen: document.getElementById('gameover-screen'),
      startButton: document.getElementById('start-button'),
      restartButton: document.getElementById('restart-button'),
      okButton: document.getElementById('ok-button'),
      grid: document.getElementById('grid'),
      message: document.getElementById('message'),
      levelDisplay: document.getElementById('level-display'),
      scoreDisplay: document.getElementById('score-display'),
      livesDisplay: document.getElementById('lives-display'),
      timerDisplay: document.getElementById('timer-display'),
      bestDisplay: document.getElementById('best-display'),
      finalScore: document.getElementById('final-score'),
      highScore: document.getElementById('high-score')
    };
  }

  bindUi() {
    this.dom.startButton.addEventListener('click', () => this.startGame());
    this.dom.restartButton.addEventListener('click', () => this.startGame());
    this.dom.okButton.addEventListener('click', () => this.commitSelection());
  }

  showStartScreen() {
    this.dom.startScreen.classList.remove('hidden');
    this.dom.gameOverScreen.classList.add('hidden');
    this.dom.message.textContent = '레트로 감성 컬러 퍼즐, Tint Tap에 오신 것을 환영합니다!';
  }

  startGame() {
    this.resetState();
    this.dom.startScreen.classList.add('hidden');
    this.dom.gameOverScreen.classList.add('hidden');
    this.dom.message.textContent = '다른 색을 가진 타일을 모두 선택하세요!';
    this.updateHud();
    this.loadLevel();
  }

  loadLevel() {
    this.clearTimer();
    this.selectedTiles.clear();
    this.activeOddTiles.clear();

    const { cols, rows } = gridFor(this.level, this.config);
    const oddCount = oddCountFor(this.level, this.config);
    const delta = deltaFor(this.level, this.config);
    const baseColor = randomBaseColor(this.config.color);
    const oddColor = oddColorFrom(baseColor, delta, this.config.color);

    this.dom.grid.innerHTML = '';
    this.dom.grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    this.dom.grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    const totalTiles = cols * rows;
    const oddTileIndices = this.pickOddIndices(totalTiles, oddCount);
    this.activeOddTiles = oddTileIndices;

    for (let i = 0; i < totalTiles; i += 1) {
      const tile = document.createElement('button');
      tile.className = 'tile';
      tile.setAttribute('role', 'gridcell');
      tile.dataset.index = String(i);
      tile.style.background = oddTileIndices.has(i)
        ? toCssColor(oddColor)
        : toCssColor(baseColor);
      tile.addEventListener('click', () => this.toggleTile(tile));
      this.dom.grid.appendChild(tile);
    }

    this.levelStartTime = performance.now();
    this.levelTimerId = window.setInterval(() => this.updateTimer(), 1000 / this.config.timing.tickHz);
    this.updateTimer();
  }

  pickOddIndices(total, count) {
    const indices = new Set();
    while (indices.size < count) {
      indices.add(Math.floor(Math.random() * total));
    }
    return indices;
  }

  toggleTile(tile) {
    const index = Number(tile.dataset.index);
    if (this.selectedTiles.has(index)) {
      this.selectedTiles.delete(index);
      tile.classList.remove('selected');
    } else {
      this.selectedTiles.add(index);
      tile.classList.add('selected');
    }
  }

  commitSelection() {
    if (this.selectedTiles.size === 0) {
      this.dom.message.textContent = '선택된 타일이 없습니다. 다른 색을 찾아보세요!';
      return;
    }

    const isCorrect = this.isSelectionCorrect();
    if (isCorrect) {
      this.handleCorrectAnswer();
    } else {
      this.handleWrongAnswer();
    }
  }

  isSelectionCorrect() {
    if (this.selectedTiles.size !== this.activeOddTiles.size) {
      return false;
    }
    for (const index of this.selectedTiles) {
      if (!this.activeOddTiles.has(index)) {
        return false;
      }
    }
    return true;
  }

  handleCorrectAnswer() {
    const elapsedSec = (performance.now() - this.levelStartTime) / 1000;
    const baseScore = this.config.scoring.basePerLevel + this.config.scoring.levelIncrement * (this.level - 1);
    const oddBonus = this.activeOddTiles.size * this.config.scoring.perOddTileBonus;
    let timeBonus = 0;
    if (this.config.scoring.timeBonus.enabled) {
      const remain = Math.max(0, this.config.timing.bonusClockPerLevelSec - elapsedSec);
      timeBonus = Math.min(
        this.config.scoring.timeBonus.cap,
        Math.round(remain * this.config.scoring.timeBonus.perSecond)
      );
    }
    this.score += baseScore + oddBonus + timeBonus;
    this.dom.message.textContent = `정답! +${baseScore} / +${oddBonus} / +${timeBonus} 점수를 획득했습니다.`;

    this.level += 1;
    if (this.level > this.maxLevel) {
      this.winGame();
      return;
    }

    this.updateHud();
    this.loadLevel();
  }

  handleWrongAnswer() {
    this.lives -= 1;
    if (this.config.scoring.wrongPenalty) {
      this.score = Math.max(0, this.score - this.config.scoring.wrongPenalty);
    }
    if (this.lives <= 0) {
      this.gameOver();
      return;
    }
    this.dom.message.textContent = `오답! 남은 목숨 ${this.lives}개. 다시 시도하세요.`;
    this.selectedTiles.clear();
    this.updateHud();
    this.loadLevel();
  }

  winGame() {
    this.dom.message.textContent = '40단계 모두 클리어! 축하합니다!';
    this.gameOver(true);
  }

  gameOver(isClear = false) {
    this.clearTimer();
    this.updateBestScore();
    this.updateHud();
    const title = isClear ? 'All Clear!' : 'Game Over';
    this.dom.gameOverScreen.querySelector('h2').textContent = title;
    this.dom.finalScore.textContent = `최종 점수: ${this.score}`;
    this.dom.highScore.textContent = `최고 점수: ${this.bestScore}`;
    this.dom.gameOverScreen.classList.remove('hidden');
  }

  updateHud() {
    this.dom.levelDisplay.textContent = String(this.level);
    this.dom.scoreDisplay.textContent = String(this.score);
    this.dom.livesDisplay.textContent = String(this.lives);
    const remaining = this.levelStartTime
      ? Math.max(0, this.config.timing.bonusClockPerLevelSec - (performance.now() - this.levelStartTime) / 1000)
      : this.config.timing.bonusClockPerLevelSec;
    this.dom.timerDisplay.textContent = formatSeconds(remaining);
    this.dom.bestDisplay.textContent = String(this.bestScore);
  }

  updateTimer() {
    if (!this.levelStartTime) {
      return;
    }
    const elapsed = (performance.now() - this.levelStartTime) / 1000;
    const remaining = Math.max(0, this.config.timing.bonusClockPerLevelSec - elapsed);
    this.dom.timerDisplay.textContent = formatSeconds(remaining);
  }

  clearTimer() {
    if (this.levelTimerId) {
      window.clearInterval(this.levelTimerId);
      this.levelTimerId = null;
    }
  }

  loadBestScore() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) : 0;
  }

  updateBestScore() {
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem(STORAGE_KEY, String(this.bestScore));
    }
  }
}
