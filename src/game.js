import { StorageManager } from './managers/StorageManager.js';
import { TimerManager } from './managers/TimerManager.js';
import { AudioManager } from './managers/AudioManager.js';
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
    this.updateLanguageButton();
    this.updateMuteButton();
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
    this.audioManager = new AudioManager(this.config);
    this.audioManager.init();
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
      highScore: document.getElementById('high-score'),
      languageToggle: document.getElementById('language-toggle'),
      muteToggle: document.getElementById('mute-toggle')
    };
  }

  bindUi() {
    // 시작 버튼 이벤트
    this.dom.startButton.addEventListener('mouseenter', () => {
      this.audioManager?.play('buttonHover');
    });
    this.dom.startButton.addEventListener('click', () => {
      this.audioManager?.play('buttonClick');
      this.startGame();
    });

    // 재시작 버튼 이벤트
    this.dom.restartButton.addEventListener('mouseenter', () => {
      this.audioManager?.play('buttonHover');
    });
    this.dom.restartButton.addEventListener('click', () => {
      this.audioManager?.play('buttonClick');
      this.startGame();
    });

    // OK 버튼 이벤트
    this.dom.okButton.addEventListener('mouseenter', () => {
      this.audioManager?.play('buttonHover');
    });
    this.dom.okButton.addEventListener('click', () => {
      this.audioManager?.play('buttonClick');
      this.commitSelection();
    });

    // 언어 토글 버튼 이벤트
    if (this.dom.languageToggle) {
      this.updateLanguageButton();
      this.dom.languageToggle.addEventListener('click', () => {
        this.audioManager?.play('buttonClick');
        const newLang = languageManager.toggleLanguage();
        this.updateLanguageButton();
        this.updateAllTexts();
      });
    }

    // 음소거 토글 버튼 이벤트
    if (this.dom.muteToggle) {
      this.updateMuteButton();
      this.dom.muteToggle.addEventListener('click', () => {
        const isEnabled = this.audioManager?.toggleMute();
        this.updateMuteButton();
        // 음소거 상태 변경 시에도 효과음 재생하지 않음
      });
    }
  }
  
  updateLanguageButton() {
    if (this.dom.languageToggle) {
      const currentLang = languageManager.getCurrentLanguage();
      this.dom.languageToggle.textContent = currentLang === 'ko' ? 'KOR' : 'ENG';
    }
  }
  
  updateMuteButton() {
    if (this.dom.muteToggle) {
      const isMuted = this.audioManager?.isMuted();
      this.dom.muteToggle.textContent = isMuted ? '🔇' : '🔊';
      if (isMuted) {
        this.dom.muteToggle.classList.add('muted');
      } else {
        this.dom.muteToggle.classList.remove('muted');
      }
    }
  }
  
  updateAllTexts() {
    // 모든 텍스트를 현재 언어로 업데이트
    this.updateStaticTexts();
    
    // 게임 오버 화면 업데이트
    if (this.dom.gameOverScreen && !this.dom.gameOverScreen.classList.contains('hidden')) {
      const title = this.dom.gameOverScreen.querySelector('h2');
      if (title) {
        const isClear = languageManager.isMessageType(title.textContent, 'allClear');
        title.textContent = isClear ? languageManager.t('allClear') : languageManager.t('gameOver');
      }
      this.hudManager.updateGameOver(this.score, this.bestScore);
    }
    
    // 메시지 업데이트
    if (this.dom.startScreen && !this.dom.startScreen.classList.contains('hidden')) {
      this.dom.message.textContent = languageManager.t('welcomeMessage');
    } else if (this.dom.message && !this.dom.gameOverScreen?.classList.contains('hidden') === false) {
      // LanguageManager를 통해 메시지 번역
      const translatedMessage = languageManager.translateMessage(
        this.dom.message.textContent,
        { lives: this.lives }
      );
      if (translatedMessage) {
        this.dom.message.textContent = translatedMessage;
      }
    }
    
    // HUD 레이블 업데이트 - HUDManager의 메서드 사용
    if (this.hudManager) {
      this.hudManager.updateLabels();
      // DOM 참조 업데이트
      this.dom.levelDisplay = document.getElementById('level-display');
      this.dom.scoreDisplay = document.getElementById('score-display');
      this.dom.livesDisplay = document.getElementById('lives-display');
      this.dom.timerDisplay = document.getElementById('timer-display');
      this.dom.bestDisplay = document.getElementById('best-display');
    }
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
    // 메뉴 BGM 재생
    this.audioManager?.playBGM('bgmMenu');
  }

  startGame() {
    this.resetState();
    this.dom.startScreen.classList.add('hidden');
    this.dom.gameOverScreen.classList.add('hidden');
    this.dom.message.textContent = languageManager.t('gameStartMessage');
    // 게임 BGM으로 전환
    this.audioManager?.playBGM('bgmGame');
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
      (tile) => this.toggleTile(tile),
      this.audioManager
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
    // 정답 효과음 재생
    this.audioManager?.play('correct');
    
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
    // 오답 효과음 재생
    this.audioManager?.play('wrong');
    
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
    
    // 게임 오버 시 메뉴 BGM으로 전환
    this.audioManager?.playBGM('bgmMenu');
    
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
