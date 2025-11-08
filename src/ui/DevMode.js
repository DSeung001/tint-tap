import { languageManager } from '../managers/LanguageManager.js';

/**
 * 개발자 모드 UI
 * 기믹 테스트 및 디버깅용
 */
export class DevMode {
  constructor(gameInstance) {
    this.game = gameInstance;
    this.visible = false;
    this.panel = null;
    this.init();
  }

  init() {
    // 개발자 모드 토글 키 (Ctrl + D)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        this.toggle();
      }
    });

    this.createPanel();
  }

  createPanel() {
    this.panel = document.createElement('div');
    this.panel.id = 'dev-mode-panel';
    this.panel.className = 'dev-mode-panel hidden';
    this.panel.innerHTML = this.getPanelHTML();
    document.body.appendChild(this.panel);
    
    this.bindEvents();
  }

  getPanelHTML() {
    return `
      <div class="dev-mode-content">
        <div class="dev-mode-header">
          <h3>🔧 Developer Mode</h3>
          <button class="dev-close-btn" id="dev-close-btn">×</button>
        </div>
        
        <div class="dev-mode-section">
          <h4>Gimmicks</h4>
          <div class="dev-gimmick-list" id="dev-gimmick-list">
            <!-- 기믹 목록이 여기에 동적으로 추가됨 -->
          </div>
        </div>
        
        <div class="dev-mode-section">
          <h4>Game State</h4>
          <div class="dev-state-info" id="dev-state-info">
            <!-- 게임 상태 정보 -->
          </div>
        </div>
        
        <div class="dev-mode-section">
          <h4>Quick Actions</h4>
          <div class="dev-actions">
            <button class="dev-btn" id="dev-level-up">Level +1</button>
            <button class="dev-btn" id="dev-level-down">Level -1</button>
            <button class="dev-btn" id="dev-set-level">Set Level</button>
            <input type="number" id="dev-level-input" placeholder="Level" min="1" max="100" style="width: 60px; margin-left: 5px;">
          </div>
        </div>
        
        <div class="dev-mode-section">
          <h4>Boss Test</h4>
          <div class="dev-actions">
            <button class="dev-btn" id="dev-boss-damage">Test Laser Effect</button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 닫기 버튼
    const closeBtn = this.panel.querySelector('#dev-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.toggle());
    }

    // 레벨 조작
    const levelUpBtn = this.panel.querySelector('#dev-level-up');
    const levelDownBtn = this.panel.querySelector('#dev-level-down');
    const setLevelBtn = this.panel.querySelector('#dev-set-level');
    const levelInput = this.panel.querySelector('#dev-level-input');

    if (levelUpBtn) {
      levelUpBtn.addEventListener('click', () => {
        if (this.game.level < this.game.maxLevel) {
          this.game.level += 1;
          this.game.loadLevel();
          this.update();
        }
      });
    }

    if (levelDownBtn) {
      levelDownBtn.addEventListener('click', () => {
        if (this.game.level > 1) {
          this.game.level -= 1;
          this.game.loadLevel();
          this.update();
        }
      });
    }

    if (setLevelBtn && levelInput) {
      setLevelBtn.addEventListener('click', () => {
        const level = parseInt(levelInput.value);
        if (level >= 1 && level <= this.game.maxLevel) {
          this.game.level = level;
          this.game.loadLevel();
          this.update();
        }
      });
    }

    // 보스 레이저 효과 테스트
    const bossDamageBtn = this.panel.querySelector('#dev-boss-damage');

    if (bossDamageBtn) {
      bossDamageBtn.addEventListener('click', () => {
        if (this.game.bossHUD && this.game.dom?.grid) {
          // 레이저 효과 테스트
          this.game.bossHUD.showArrowEffect(this.game.dom.grid);
          // 보스 캐릭터 애니메이션
          if (this.game.bossCharacter) {
            this.game.bossCharacter.show();
            this.game.bossCharacter.playAnimation('bounce');
          }
        }
      });
    }
  }

  toggle() {
    this.visible = !this.visible;
    if (this.visible) {
      this.panel.classList.remove('hidden');
      this.update();
    } else {
      this.panel.classList.add('hidden');
    }
  }

  update() {
    if (!this.visible) return;
    
    this.updateGimmickList();
    this.updateGameState();
  }
  
  /**
   * 게임 상태 변경 시 자동 업데이트 (game.js에서 호출)
   */
  onGameUpdate() {
    if (this.visible) {
      this.update();
    }
  }

  updateGimmickList() {
    const list = this.panel.querySelector('#dev-gimmick-list');
    if (!list || !this.game.gimmickManager) return;

    const allGimmicks = this.game.gimmickManager.getAllGimmicks();
    const activeGimmick = this.game.gimmickManager.getActiveGimmick();

    list.innerHTML = allGimmicks.map(name => {
      const isActive = name === activeGimmick;
      const gimmick = this.game.gimmickManager.gimmicks.get(name);
      return `
        <div class="dev-gimmick-item ${isActive ? 'active' : ''}">
          <span class="dev-gimmick-name">${name}</span>
          <div class="dev-gimmick-buttons">
            <button class="dev-btn-small" data-gimmick="${name}" data-action="toggle">
              ${isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button class="dev-btn-small" data-gimmick="${name}" data-action="execute" ${!gimmick ? 'disabled' : ''}>
              Execute
            </button>
          </div>
        </div>
      `;
    }).join('');

    // 기믹 활성화/비활성화 버튼 이벤트
    list.querySelectorAll('.dev-btn-small[data-action="toggle"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const gimmickName = e.target.dataset.gimmick;
        if (gimmickName) {
          if (this.game.gimmickManager.getActiveGimmick() === gimmickName) {
            this.game.gimmickManager.deactivateGimmick(gimmickName);
          } else {
            this.game.gimmickManager.activateGimmick(gimmickName);
          }
          this.update();
        }
      });
    });

    // 기믹 실행 버튼 이벤트
    list.querySelectorAll('.dev-btn-small[data-action="execute"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const gimmickName = e.target.dataset.gimmick;
        if (gimmickName) {
          const gimmick = this.game.gimmickManager.gimmicks.get(gimmickName);
          if (gimmick && typeof gimmick.execute === 'function') {
            // 기믹이 활성화되어 있지 않으면 먼저 활성화
            if (!gimmick.active) {
              this.game.gimmickManager.activateGimmick(gimmickName);
            }
            // 기믹 실행
            gimmick.execute();
          }
        }
      });
    });
  }

  updateGameState() {
    const info = this.panel.querySelector('#dev-state-info');
    if (!info) return;

    info.innerHTML = `
      <div class="dev-state-row">
        <span>Level:</span>
        <span>${this.game.level}</span>
      </div>
      <div class="dev-state-row">
        <span>Score:</span>
        <span>${this.game.score}</span>
      </div>
      <div class="dev-state-row">
        <span>Lives:</span>
        <span>${this.game.lives}</span>
      </div>
      <div class="dev-state-row">
        <span>Active Gimmick:</span>
        <span>${this.game.gimmickManager?.getActiveGimmick() || 'None'}</span>
      </div>
    `;
  }
}

