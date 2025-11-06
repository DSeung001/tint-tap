import { StorageManager } from './managers/StorageManager.js';
import { TimerManager } from './managers/TimerManager.js';
import { ScoringSystem } from './systems/ScoringSystem.js';
import { LevelLoader } from './systems/LevelLoader.js';
import { HUDManager } from './ui/HUDManager.js';
import { languageManager } from './managers/LanguageManager.js';

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
    this.updateStaticTexts();
    this.showStartScreen();
    this.updateHud();
  }

  initializeManagers() {
    this.hudManager = new HUDManager(this.dom);
    // HUDManager 생성 후 DOM 참조 업데이트
    this.dom.levelDisplay = document.getElementById('level-display');
    this.dom.scoreDisplay = document.getElementById('score-display');
    this.dom.livesDisplay = document.getElementById('lives-display');
    this.dom.timerDisplay = document.getElementById('timer-display');
    this.dom.bestDisplay = document.getElementById('best-display');
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

  updateStaticTexts() {
    // HTML의 정적 텍스트들을 언어 파일에서 가져와서 업데이트
    const titleElement = document.querySelector('title');
    if (titleElement) {
      titleElement.textContent = languageManager.t('gameTitle');
    }

    const logoElement = document.querySelector('.logo');
    if (logoElement) {
      logoElement.textContent = languageManager.t('gameTitle');
    }

    const taglineElement = document.querySelector('.tagline');
    if (taglineElement) {
      taglineElement.textContent = languageManager.t('tagline');
    }

    if (this.dom.startButton) {
      this.dom.startButton.textContent = languageManager.t('startButton');
    }

    if (this.dom.restartButton) {
      this.dom.restartButton.textContent = languageManager.t('restartButton');
    }

    if (this.dom.okButton) {
      this.dom.okButton.textContent = languageManager.t('okButton');
    }
  }

  showStartScreen() {
    this.dom.startScreen.classList.remove('hidden');
    this.dom.gameOverScreen.classList.add('hidden');
    this.dom.message.textContent = languageManager.t('welcomeMessage');
  }

  startGame() {
    this.resetState();
    this.dom.startScreen.classList.add('hidden');
    this.dom.gameOverScreen.classList.add('hidden');
    this.dom.message.textContent = languageManager.t('gameStartMessage');
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
      this.dom.message.textContent = languageManager.t('noSelectionMessage');
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
    this.dom.message.textContent = `${languageManager.t('correctAnswer')} +${scoreResult.baseScore} / +${scoreResult.oddBonus} / +${scoreResult.timeBonus} ${languageManager.t('scoreGained')}`;

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

    this.dom.message.textContent = `${languageManager.t('wrongAnswer')} ${languageManager.t('remainingLives')} ${this.lives}${languageManager.t('livesUnit')}. ${languageManager.t('tryAgain')}`;
    this.selectedTiles.clear();
    this.updateHud();
    this.loadLevel();
  }

  winGame() {
    this.dom.message.textContent = languageManager.t('winMessage');
    this.gameOver(true);
  }

  gameOver(isClear = false) {
    this.timerManager.clear();
    this.bestScore = StorageManager.updateBestScore(this.score, this.bestScore);
    this.updateHud();
    
    const title = isClear ? languageManager.t('allClear') : languageManager.t('gameOver');
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
