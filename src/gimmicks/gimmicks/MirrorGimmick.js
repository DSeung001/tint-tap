import { BaseGimmick } from '../BaseGimmick.js';

/**
 * 미러/반전 기믹
 * 그리드 전체를 좌우 또는 상하로 반전시킴
 */
export class MirrorGimmick extends BaseGimmick {
  constructor(config, gameInstance) {
    super('mirror', config, gameInstance);
    this.mirrorTimeout = null; // 반전 복원 타이머
    this.isMirrored = false; // 현재 반전 상태
  }

  onActivate() {
    const difficulty = this.getDifficultyForLevel(this.game.level);
    const frequency = difficulty.frequency || 1;
    
    // 기믹 실행 시작
    this.triggerBossAnimation('bounce');
    this.playSound();
    
    // 즉시 실행
    this.execute();
    
    // frequency가 있으면 주기적으로 실행
    if (frequency > 1) {
      const interval = 5; // 기본 간격
      this.setInterval(() => {
        this.execute();
      }, interval);
    }
  }

  execute() {
    if (!this.game.dom?.grid) return;
    
    const difficulty = this.getDifficultyForLevel(this.game.level);
    const directionOptions = Array.isArray(difficulty.direction) 
      ? difficulty.direction 
      : [difficulty.direction || 'horizontal'];
    const duration = difficulty.duration || 2000;
    
    // 보스 애니메이션
    this.triggerBossAnimation('bounce');
    
    // 사운드 재생
    this.playSound();
    
    // 랜덤 방향 선택
    const direction = directionOptions[Math.floor(Math.random() * directionOptions.length)];
    
    // 그리드 반전 적용
    this.mirrorGrid(direction, duration);
  }

  /**
   * 그리드 반전시키기
   */
  mirrorGrid(direction, duration) {
    const grid = this.game.dom.grid;
    if (!grid) return;
    
    // 이전 타이머 취소
    if (this.mirrorTimeout) {
      clearTimeout(this.mirrorTimeout);
    }
    
    // 반전 적용
    const transitionDuration = 0.3; // 반전 애니메이션 시간
    grid.style.transition = `transform ${transitionDuration}s ease-in-out`;
    
    if (direction === 'horizontal') {
      // 좌우 반전
      grid.style.transform = 'scaleX(-1)';
      grid.classList.add('gimmick-mirror-horizontal');
    } else if (direction === 'vertical') {
      // 상하 반전
      grid.style.transform = 'scaleY(-1)';
      grid.classList.add('gimmick-mirror-vertical');
    }
    
    this.isMirrored = true;
    
    // duration 시간 후 원래대로 복원
    this.mirrorTimeout = setTimeout(() => {
      this.resetGrid();
    }, duration);
  }

  /**
   * 그리드 원래대로 복원
   */
  resetGrid() {
    const grid = this.game.dom.grid;
    if (!grid) return;
    
    grid.style.transition = 'transform 0.3s ease-in-out';
    grid.style.transform = '';
    grid.classList.remove('gimmick-mirror-horizontal', 'gimmick-mirror-vertical');
    this.isMirrored = false;
  }

  onDeactivate() {
    this.clearInterval();
    
    // 타이머 취소
    if (this.mirrorTimeout) {
      clearTimeout(this.mirrorTimeout);
      this.mirrorTimeout = null;
    }
    
    // 기믹 비활성화 시 그리드 원래대로 복원
    this.resetGrid();
  }
}

