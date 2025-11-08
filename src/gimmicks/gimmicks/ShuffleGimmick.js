import { BaseGimmick } from '../BaseGimmick.js';

/**
 * 타일 순서 뒤섞기 기믹
 */
export class ShuffleGimmick extends BaseGimmick {
  constructor(config, gameInstance) {
    super('shuffle', config, gameInstance);
  }

  onActivate() {
    const difficulty = this.getDifficultyForLevel(this.game.level);
    const interval = difficulty.interval || 10;
    
    // 기믹 실행 시작
    this.triggerBossAnimation('wave');
    this.playSound();
    
    // 주기적으로 실행
    this.setInterval(() => {
      this.execute();
    }, interval);
  }

  execute() {
    if (!this.game.dom?.grid) return;
    
    const difficulty = this.getDifficultyForLevel(this.game.level);
    const intensity = difficulty.intensity || 'medium';
    
    // 보스 애니메이션
    this.triggerBossAnimation('wave');
    
    // 사운드 재생 (공통 기믹 사운드)
    this.playSound();
    
    // 타일 뒤섞기
    this.shuffleTiles(intensity);
  }

  /**
   * 타일 뒤섞기
   */
  shuffleTiles(intensity) {
    const grid = this.game.dom.grid;
    const tiles = Array.from(grid.children);
    
    if (tiles.length === 0) return;
    
    // 그리드 크기 계산
    const cols = parseInt(grid.dataset.cols) || 3;
    const rows = parseInt(grid.dataset.rows) || 3;
    
    switch (intensity) {
      case 'easy':
        this.shuffleEasy(tiles, cols, rows);
        break;
      case 'medium':
        this.shuffleMedium(tiles, cols, rows);
        break;
      case 'hard':
        this.shuffleHard(tiles);
        break;
    }
  }

  /**
   * 쉬운 난이도: 가로 한 줄, 세로 한 줄씩 뒤섞기
   */
  shuffleEasy(tiles, cols, rows) {
    const grid = this.game.dom.grid;
    if (!grid) return;
    
    // 가로 한 줄 선택
    const randomRow = Math.floor(Math.random() * rows);
    const rowTiles = [];
    for (let i = 0; i < cols; i++) {
      const index = randomRow * cols + i;
      if (tiles[index]) {
        rowTiles.push(tiles[index]);
      }
    }
    
    // 가로 줄 뒤섞기
    this.shuffleArray(rowTiles);
    
    // DOM에서 제거 후 다시 추가
    rowTiles.forEach(tile => {
      if (tile.parentNode) {
        tile.parentNode.removeChild(tile);
      }
    });
    
    // 뒤섞인 순서로 다시 추가
    const startIndex = randomRow * cols;
    rowTiles.forEach((tile, i) => {
      const insertBefore = tiles[startIndex + i + 1] || null;
      if (insertBefore && insertBefore.parentNode) {
        insertBefore.parentNode.insertBefore(tile, insertBefore);
      } else if (grid) {
        grid.appendChild(tile);
      }
    });
  }

  /**
   * 중간 난이도: 가로 2줄, 세로 2줄 또는 가로와 세로를 섞어서 뒤섞기
   */
  shuffleMedium(tiles, cols, rows) {
    const grid = this.game.dom.grid;
    if (!grid) return;
    
    if (Math.random() < 0.5) {
      // 가로 2줄
      const startRow = Math.floor(Math.random() * Math.max(1, rows - 1));
      for (let r = 0; r < 2 && startRow + r < rows; r++) {
        const rowTiles = [];
        for (let i = 0; i < cols; i++) {
          const index = (startRow + r) * cols + i;
          if (tiles[index]) {
            rowTiles.push(tiles[index]);
          }
        }
        this.shuffleArray(rowTiles);
        
        // DOM에서 제거 후 다시 추가
        rowTiles.forEach(tile => {
          if (tile.parentNode) {
            tile.parentNode.removeChild(tile);
          }
        });
        
        // 뒤섞인 순서로 다시 추가
        const startIndex = (startRow + r) * cols;
        rowTiles.forEach((tile, i) => {
          const insertBefore = tiles[startIndex + i + 1] || null;
          if (insertBefore && insertBefore.parentNode) {
            insertBefore.parentNode.insertBefore(tile, insertBefore);
          } else if (grid) {
            grid.appendChild(tile);
          }
        });
      }
    } else {
      // 세로 2줄
      const startCol = Math.floor(Math.random() * Math.max(1, cols - 1));
      for (let c = 0; c < 2 && startCol + c < cols; c++) {
        const colTiles = [];
        for (let i = 0; i < rows; i++) {
          const index = i * cols + (startCol + c);
          if (tiles[index]) {
            colTiles.push(tiles[index]);
          }
        }
        this.shuffleArray(colTiles);
        
        // DOM에서 제거 후 다시 추가
        colTiles.forEach(tile => {
          if (tile.parentNode) {
            tile.parentNode.removeChild(tile);
          }
        });
        
        // 뒤섞인 순서로 다시 추가
        colTiles.forEach((tile, i) => {
          const insertBefore = tiles[(i + 1) * cols + (startCol + c)] || null;
          if (insertBefore && insertBefore.parentNode) {
            insertBefore.parentNode.insertBefore(tile, insertBefore);
          } else if (grid) {
            grid.appendChild(tile);
          }
        });
      }
    }
  }

  /**
   * 어려운 난이도: 모든 타일을 완전히 무작위로 뒤섞기
   */
  shuffleHard(tiles) {
    const grid = this.game.dom.grid;
    if (!grid) return;
    
    // 모든 타일을 DOM에서 제거
    tiles.forEach(tile => {
      if (tile.parentNode) {
        tile.parentNode.removeChild(tile);
      }
    });
    
    // 무작위로 뒤섞기
    this.shuffleArray(tiles);
    
    // 뒤섞인 순서로 다시 추가
    tiles.forEach(tile => {
      grid.appendChild(tile);
    });
  }

  /**
   * 배열 뒤섞기 (Fisher-Yates)
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  onDeactivate() {
    this.clearInterval();
  }
}

