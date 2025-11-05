import { StorageManager } from './managers/StorageManager.js';
import { TimerManager } from './managers/TimerManager.js';
import { ScoringSystem } from './systems/ScoringSystem.js';
import { LevelLoader } from './systems/LevelLoader.js';
import { HUDManager } from './ui/HUDManager.js';

export class TintTapGame {
  constructor(config) {
    this.config = config;
    this.maxLevel = config.levels.maxLevel;
    this.baseLives = config.levels.lives;
    this.levelLoader = new LevelLoader(config);
    this.resetState();
  }

  resetState() {
    this.level = 1;
    this.score = 0;
    this.lives = this.baseLives;
    this.bestScore = StorageManager.loadBestScore();
    this.activeOddTiles = new Set();
    this.selectedTiles = new Set();
  }

  init() {
    this.cacheDom();
    this.bindUi();
    this.initializeManagers();
    this.showStartScreen();
    this.updateHud();
  }

  initializeManagers() {
    this.hudManager = new HUDManager(this.dom);
    this.timerManager = new TimerManager(this.config, (formattedTime, remainingSeconds) => {
      this.dom.timerDisplay.textContent = formattedTime;
    });
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
    this.timerManager.clear();
    this.selectedTiles.clear();
    this.activeOddTiles.clear();

    this.activeOddTiles = this.levelLoader.loadLevel(
      this.level,
      this.dom.grid,
      (tile) => this.toggleTile(tile)
    );

    this.timerManager.start();
    this.updateHud();
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
    const elapsedSec = this.timerManager.getElapsedSeconds();
    const scoreResult = ScoringSystem.calculateLevelScore(
      this.level,
      this.activeOddTiles.size,
      elapsedSec,
      this.config
    );

    this.score += scoreResult.totalScore;
    this.dom.message.textContent = `정답! +${scoreResult.baseScore} / +${scoreResult.oddBonus} / +${scoreResult.timeBonus} 점수를 획득했습니다.`;

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
    this.score = ScoringSystem.calculateWrongPenalty(this.score, this.config);

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
    this.timerManager.clear();
    this.bestScore = StorageManager.updateBestScore(this.score, this.bestScore);
    this.updateHud();
    
    const title = isClear ? 'All Clear!' : 'Game Over';
    this.dom.gameOverScreen.querySelector('h2').textContent = title;
    this.hudManager.updateGameOver(this.score, this.bestScore);
    this.dom.gameOverScreen.classList.remove('hidden');
  }

  updateHud() {
    const remainingSeconds = this.timerManager.getRemainingSeconds();
    this.hudManager.update(
      this.level,
      this.score,
      this.lives,
      this.bestScore,
      remainingSeconds
    );
  }
}
