/**
 * 보스 레이저 효과 관리
 */
export class BossHUD {
  constructor(container, gameInstance = null) {
    this.container = container;
    this.game = gameInstance;
  }

  /**
   * 레이저 효과 (타일판에서 보스 캐릭터로)
   */
  showArrowEffect(sourceElement) {
    if (!sourceElement) return;
    
    // 보스 데미지 사운드 재생
    if (this.game && this.game.audioManager) {
      this.game.audioManager.play('bossDamage');
    }
    
    // DOM 업데이트가 완료될 때까지 대기 (기믹이 타일을 수정하는 동안 방지)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.createLaser(sourceElement);
      });
    });
  }

  /**
   * 실제 레이저 생성 로직
   */
  createLaser(sourceElement) {
    if (!sourceElement) return;
    
    // 타일 그리드의 실제 타일 영역 중앙 계산
    const gridRect = sourceElement.getBoundingClientRect();
    
    // 타일판이 유효한지 확인 (크기가 0이면 안됨)
    if (gridRect.width === 0 || gridRect.height === 0) {
      console.warn('Invalid grid rect:', gridRect);
      return;
    }
    
    // 타일들의 실제 위치 계산
    const tiles = Array.from(sourceElement.children);
    if (tiles.length === 0) {
      console.warn('No tiles found in grid');
      return;
    }
    
    // 모든 타일의 중심점을 계산하여 실제 타일 영역의 중앙 찾기
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    tiles.forEach(tile => {
      const tileRect = tile.getBoundingClientRect();
      const tileCenterX = tileRect.left + tileRect.width / 2;
      const tileCenterY = tileRect.top + tileRect.height / 2;
      
      minX = Math.min(minX, tileCenterX);
      minY = Math.min(minY, tileCenterY);
      maxX = Math.max(maxX, tileCenterX);
      maxY = Math.max(maxY, tileCenterY);
    });
    
    // 타일 영역의 중앙 계산
    const startX = (minX + maxX) / 2;
    const startY = (minY + maxY) / 2;
    
    // 보스 캐릭터 위치 계산 (항상 화면 중앙 상단)
    const endX = window.innerWidth / 2; // left: 50%
    const endY = 60 + 32; // top: 60px + height/2 (64px/2 = 32px)
    
    // 거리와 각도 계산
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // 레이저 빔 생성
    // 레이저를 컨테이너로 감싸서 회전과 애니메이션 분리
    const laserContainer = document.createElement('div');
    laserContainer.className = 'laser-container';
    laserContainer.style.cssText = `
      position: fixed;
      left: ${startX}px;
      top: ${startY}px;
      width: 0px;
      height: 8px;
      transform-origin: 0 50%;
      transform: rotate(${angle}deg);
      pointer-events: none;
      z-index: 2000;
    `;
    
    const laser = document.createElement('div');
    laser.className = 'damage-laser';
    laser.style.cssText = `
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, 
        rgba(255, 111, 97, 1) 0%,
        rgba(255, 111, 97, 0.9) 30%,
        rgba(255, 111, 97, 0.8) 50%,
        rgba(255, 111, 97, 0.6) 70%,
        rgba(255, 111, 97, 0) 100%
      );
      box-shadow: 
        0 0 20px rgba(255, 111, 97, 1),
        0 0 40px rgba(255, 111, 97, 0.8),
        0 0 60px rgba(255, 111, 97, 0.6),
        inset 0 0 20px rgba(255, 255, 255, 0.5);
    `;
    
    laserContainer.appendChild(laser);
    document.body.appendChild(laserContainer);
    
    // 애니메이션으로 레이저 길이를 늘리기
    requestAnimationFrame(() => {
      laserContainer.style.transition = 'width 0.3s ease-out';
      laserContainer.style.width = `${distance}px`;
    });
    
    // 레이저 임팩트 효과 (보스 캐릭터에 도달했을 때) - 레이저 애니메이션 완료 후
    setTimeout(() => {
      const impact = document.createElement('div');
      impact.className = 'laser-impact';
      impact.style.cssText = `
        position: fixed;
        left: ${endX}px;
        top: ${endY}px;
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: radial-gradient(circle, 
          rgba(255, 111, 97, 1) 0%,
          rgba(255, 111, 97, 0.8) 30%,
          rgba(255, 111, 97, 0.4) 60%,
          rgba(255, 111, 97, 0) 100%
        );
        box-shadow: 
          0 0 40px rgba(255, 111, 97, 1),
          0 0 80px rgba(255, 111, 97, 0.8),
          0 0 120px rgba(255, 111, 97, 0.6);
        pointer-events: none;
        z-index: 2001;
        transform: translate(-50%, -50%);
        animation: impactExplode 0.5s ease-out;
      `;
      
      document.body.appendChild(impact);
      
      setTimeout(() => {
        if (impact.parentNode) {
          impact.parentNode.removeChild(impact);
        }
      }, 500);
    }, 300); // 레이저가 보스에 도달하는 시간 (0.3초)
    
    // 레이저 제거 (레이저가 보스에 도달한 후 약간 더 표시)
    setTimeout(() => {
      if (laserContainer.parentNode) {
        laserContainer.parentNode.removeChild(laserContainer);
      }
    }, 600); // 레이저 애니메이션 완료 후 제거
  }

  /**
   * 보스 HUD 표시 (사용 안 함, 레이저 효과만 사용)
   */
  show() {
    // HP 바는 사용하지 않음
  }

  /**
   * 보스 HUD 숨기기 (사용 안 함, 레이저 효과만 사용)
   */
  hide() {
    // HP 바는 사용하지 않음
  }
}

