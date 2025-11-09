import { BaseGimmick } from '../BaseGimmick.js';

/**
 * 타일 배치 회전 기믹
 * 그리드 전체를 회전시켜 타일 배치가 회전한 것처럼 보이게 함
 */
export class RotationGimmick extends BaseGimmick {
  constructor(config, gameInstance) {
    super('rotation', config, gameInstance);
    this.currentAngle = 0; // 현재 회전 각도
    this.rotationTimeout = null; // 회전 복원 타이머
  }

  onActivate() {
    const difficulty = this.getDifficultyForLevel(this.game.level);
    const speed = difficulty.speed || 1.0;
    
    // 기믹 실행 시작
    this.triggerBossAnimation('rotate');
    this.playSound();
    
    // 즉시 실행
    this.execute();
    
    // 주기적으로 실행 (speed에 따라 간격 조절)
    const interval = Math.max(2, 10 / speed); // speed가 높을수록 더 자주 실행
    this.setInterval(() => {
      this.execute();
    }, interval);
  }

  execute() {
    if (!this.game.dom?.grid) return;
    
    const difficulty = this.getDifficultyForLevel(this.game.level);
    const angleOptions = difficulty.angle || [90];
    const speed = difficulty.speed || 1.0;
    
    // 보스 애니메이션
    this.triggerBossAnimation('rotate');
    
    // 사운드 재생
    this.playSound();
    
    // 랜덤 각도 선택
    const angle = angleOptions[Math.floor(Math.random() * angleOptions.length)];
    
    // 그리드 회전 적용
    this.rotateGrid(angle, speed);
  }

  /**
   * 그리드 전체 회전시키기
   */
  rotateGrid(angle, speed) {
    const grid = this.game.dom.grid;
    if (!grid) return;
    
    // 이전 타이머 취소
    if (this.rotationTimeout) {
      clearTimeout(this.rotationTimeout);
    }
    
    // 현재 각도에 새로운 각도 추가
    this.currentAngle = (this.currentAngle + angle) % 360;
    
    // 회전 애니메이션 속도 (더 천천히 보이도록)
    const duration = Math.max(1.0, 2.5 / speed);
    
    // 그리드에 회전 적용
    grid.style.transition = `transform ${duration}s ease-in-out`;
    grid.style.transform = `rotate(${this.currentAngle}deg)`;
    grid.style.transformOrigin = 'center center';
    grid.classList.add('gimmick-rotated');
    
    // 일정 시간 후 원래대로 복원 (선택사항)
    // 주석 처리: 계속 회전 상태 유지
    // this.rotationTimeout = setTimeout(() => {
    //   this.resetGrid();
    // }, duration * 1000 + 2000);
  }

  /**
   * 그리드 원래대로 복원
   */
  resetGrid() {
    const grid = this.game.dom.grid;
    if (!grid) return;
    
    grid.style.transition = 'transform 0.5s ease-in-out';
    grid.style.transform = 'rotate(0deg)';
    grid.classList.remove('gimmick-rotated');
    this.currentAngle = 0;
  }

  onDeactivate() {
    this.clearInterval();
    
    // 타이머 취소
    if (this.rotationTimeout) {
      clearTimeout(this.rotationTimeout);
      this.rotationTimeout = null;
    }
    
    // 기믹 비활성화 시 그리드 원래대로 복원
    this.resetGrid();
  }
}

