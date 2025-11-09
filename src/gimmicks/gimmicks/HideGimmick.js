import { BaseGimmick } from '../BaseGimmick.js';

/**
 * 타일 숨기기 기믹
 * 일부 타일을 시각적으로 숨기지만 클릭은 가능하게 함
 */
export class HideGimmick extends BaseGimmick {
  constructor(config, gameInstance) {
    super('hide', config, gameInstance);
    this.hiddenTiles = new Set(); // 현재 숨겨진 타일들
  }

  onActivate() {
    const difficulty = this.getDifficultyForLevel(this.game.level);
    const interval = difficulty.interval || 15;
    
    // 기믹 실행 시작
    this.triggerBossAnimation('point');
    this.playSound();
    
    // 즉시 실행
    this.execute();
    
    // 주기적으로 실행
    this.setInterval(() => {
      this.execute();
    }, interval);
  }

  execute() {
    if (!this.game.dom?.grid) return;
    
    const difficulty = this.getDifficultyForLevel(this.game.level);
    const countRange = difficulty.count || [1, 5];
    
    // 보스 애니메이션
    this.triggerBossAnimation('point');
    
    // 사운드 재생
    this.playSound();
    
    // 이전에 숨겨진 타일들 다시 보이게 하기
    this.showAllTiles();
    
    // 새로운 타일들 숨기기
    this.hideTiles(countRange);
  }

  /**
   * 타일 숨기기
   */
  hideTiles(countRange) {
    const grid = this.game.dom.grid;
    const tiles = Array.from(grid.children);
    
    if (tiles.length === 0) return;
    
    // 숨길 타일 개수 결정
    const [minCount, maxCount] = countRange;
    const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
    const hideCount = Math.min(count, tiles.length);
    
    // 랜덤으로 타일 선택 (중복 없이)
    const tilesToHide = [];
    const availableTiles = [...tiles];
    
    for (let i = 0; i < hideCount; i++) {
      if (availableTiles.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * availableTiles.length);
      const selectedTile = availableTiles.splice(randomIndex, 1)[0];
      tilesToHide.push(selectedTile);
    }
    
    // 타일 숨기기
    tilesToHide.forEach(tile => {
      this.hideTile(tile);
      this.hiddenTiles.add(tile);
    });
  }

  /**
   * 개별 타일 숨기기
   */
  hideTile(tile) {
    // opacity를 0으로 설정하되 pointer-events는 유지
    tile.style.opacity = '0';
    tile.style.transition = 'opacity 0.3s ease-in-out';
    tile.classList.add('gimmick-hidden');
  }

  /**
   * 개별 타일 보이기
   */
  showTile(tile) {
    tile.style.opacity = '1';
    tile.classList.remove('gimmick-hidden');
  }

  /**
   * 모든 숨겨진 타일 다시 보이게 하기
   */
  showAllTiles() {
    this.hiddenTiles.forEach(tile => {
      if (tile.parentNode) { // DOM에 여전히 존재하는지 확인
        this.showTile(tile);
      }
    });
    this.hiddenTiles.clear();
  }

  onDeactivate() {
    this.clearInterval();
    // 기믹 비활성화 시 모든 타일 다시 보이게 하기
    this.showAllTiles();
  }
}

