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
    
    // 셔플 준비
    let shuffledTiles;
    switch (intensity) {
      case 'easy':
        shuffledTiles = this.prepareShuffleEasy(tiles, cols, rows);
        break;
      case 'medium':
        shuffledTiles = this.prepareShuffleMedium(tiles, cols, rows);
        break;
      case 'hard':
        shuffledTiles = this.prepareShuffleHard(tiles);
        break;
    }
    
    // 실제로 순서가 바뀌었는지 확인
    if (!this.hasOrderChanged(tiles, shuffledTiles)) {
      return; // 순서가 바뀌지 않았으면 애니메이션 실행하지 않음
    }
    
    // 애니메이션을 사용하여 뒤섞기
    this.shuffleTilesWithAnimation(tiles, shuffledTiles, cols, rows);
  }

  /**
   * 애니메이션을 사용하여 타일 뒤섞기
   */
  async shuffleTilesWithAnimation(tiles, shuffledTiles, cols, rows) {
    const grid = this.game.dom.grid;
    if (!grid) return;

    // 그리드의 현재 크기를 고정 (애니메이션 중 크기 변경 방지)
    const gridRect = grid.getBoundingClientRect();
    const fixedWidth = gridRect.width;
    const fixedHeight = gridRect.height;
    
    // 그리드 크기 고정
    grid.style.width = `${fixedWidth}px`;
    grid.style.height = `${fixedHeight}px`;
    grid.style.minWidth = `${fixedWidth}px`;
    grid.style.minHeight = `${fixedHeight}px`;

    // 각 타일의 원래 위치 저장
    const originalPositions = tiles.map(tile => {
      const rect = tile.getBoundingClientRect();
      return {
        x: rect.left - gridRect.left,
        y: rect.top - gridRect.top,
        width: rect.width,
        height: rect.height
      };
    });

    // 그리드 중앙 위치 계산
    const centerX = fixedWidth / 2;
    const centerY = fixedHeight / 2;

    // 1단계: 모든 타일을 중앙으로 모으기
    await this.animateTilesToCenter(tiles, centerX, centerY, originalPositions);

    // 2단계: DOM에서 타일 재배치
    this.reorderTilesInDOM(shuffledTiles, grid);

    // 애니메이션 완료 후 transform 제거
    shuffledTiles.forEach(tile => {
      tile.style.transition = '';
      tile.style.transform = '';
      tile.style.zIndex = '';
    });

    // 그리드 크기 고정 해제
    grid.style.width = '';
    grid.style.height = '';
    grid.style.minWidth = '';
    grid.style.minHeight = '';
  }

  /**
   * 타일들을 중앙으로 모으는 애니메이션
   */
  animateTilesToCenter(tiles, centerX, centerY, originalPositions) {
    return new Promise((resolve) => {
      tiles.forEach((tile, index) => {
        const pos = originalPositions[index];
        tile.style.transition = 'transform 0.4s ease-in-out';
        tile.style.transform = `translate(${centerX - pos.x - pos.width / 2}px, ${centerY - pos.y - pos.height / 2}px)`;
        tile.style.zIndex = '1000';
      });

      setTimeout(() => resolve(), 400);
    });
  }

  /**
   * 쉬운 난이도: 가로 한 줄 뒤섞기 준비
   */
  prepareShuffleEasy(tiles, cols, rows) {
    // 색이 다른 타일이 있는 줄 찾기
    const validRows = [];
    for (let r = 0; r < rows; r++) {
      const rowTiles = [];
      for (let i = 0; i < tiles.length; i++) {
        const row = Math.floor(i / cols);
        if (row === r) {
          rowTiles.push(tiles[i]);
        }
      }
      if (this.hasDifferentColors(rowTiles)) {
        validRows.push(r);
      }
    }
    
    // 유효한 줄이 없으면 원본 반환
    if (validRows.length === 0) {
      return [...tiles];
    }
    
    const randomRow = validRows[Math.floor(Math.random() * validRows.length)];
    const rowTiles = [];
    const otherTiles = [];
    
    for (let i = 0; i < tiles.length; i++) {
      const row = Math.floor(i / cols);
      if (row === randomRow) {
        rowTiles.push(tiles[i]);
      } else {
        otherTiles.push(tiles[i]);
      }
    }
    
    // 가로 줄만 뒤섞기
    this.shuffleArray(rowTiles);
    
    // 결과 배열 구성
    const result = [];
    let rowTilesIndex = 0;
    let otherTilesIndex = 0;
    
    for (let i = 0; i < tiles.length; i++) {
      const row = Math.floor(i / cols);
      if (row === randomRow) {
        result.push(rowTiles[rowTilesIndex++]);
      } else {
        result.push(otherTiles[otherTilesIndex++]);
      }
    }
    
    return result;
  }

  /**
   * 중간 난이도: 가로/세로 2줄 뒤섞기 준비
   */
  prepareShuffleMedium(tiles, cols, rows) {
    if (Math.random() < 0.5) {
      // 가로 2줄
      const validRowPairs = [];
      for (let startRow = 0; startRow < rows - 1; startRow++) {
        const rowTiles = [];
        for (let i = 0; i < tiles.length; i++) {
          const row = Math.floor(i / cols);
          if (row >= startRow && row < startRow + 2 && row < rows) {
            rowTiles.push(tiles[i]);
          }
        }
        if (this.hasDifferentColors(rowTiles)) {
          validRowPairs.push(startRow);
        }
      }
      
      if (validRowPairs.length === 0) {
        return [...tiles];
      }
      
      const startRow = validRowPairs[Math.floor(Math.random() * validRowPairs.length)];
      const rowTiles = [];
      const otherTiles = [];
      
      for (let i = 0; i < tiles.length; i++) {
        const row = Math.floor(i / cols);
        if (row >= startRow && row < startRow + 2 && row < rows) {
          rowTiles.push(tiles[i]);
        } else {
          otherTiles.push(tiles[i]);
        }
      }
      
      // 각 줄을 개별적으로 뒤섞기
      const shuffledRows = [];
      for (let r = 0; r < 2 && startRow + r < rows; r++) {
        const rowTilesForThisRow = [];
        for (let c = 0; c < cols; c++) {
          const index = r * cols + c;
          if (index < rowTiles.length) {
            rowTilesForThisRow.push(rowTiles[index]);
          }
        }
        this.shuffleArray(rowTilesForThisRow);
        shuffledRows.push(...rowTilesForThisRow);
      }
      
      // 결과 배열 구성
      const result = [];
      let shuffledIndex = 0;
      let otherIndex = 0;
      
      for (let i = 0; i < tiles.length; i++) {
        const row = Math.floor(i / cols);
        if (row >= startRow && row < startRow + 2 && row < rows) {
          result.push(shuffledRows[shuffledIndex++]);
        } else {
          result.push(otherTiles[otherIndex++]);
        }
      }
      
      return result;
    } else {
      // 세로 2줄
      const validColPairs = [];
      for (let startCol = 0; startCol < cols - 1; startCol++) {
        const colTiles = [];
        for (let i = 0; i < tiles.length; i++) {
          const col = i % cols;
          if (col >= startCol && col < startCol + 2 && col < cols) {
            colTiles.push(tiles[i]);
          }
        }
        if (this.hasDifferentColors(colTiles)) {
          validColPairs.push(startCol);
        }
      }
      
      if (validColPairs.length === 0) {
        return [...tiles];
      }
      
      const startCol = validColPairs[Math.floor(Math.random() * validColPairs.length)];
      const colTiles = [];
      const otherTiles = [];
      
      for (let i = 0; i < tiles.length; i++) {
        const col = i % cols;
        if (col >= startCol && col < startCol + 2 && col < cols) {
          colTiles.push(tiles[i]);
        } else {
          otherTiles.push(tiles[i]);
        }
      }
      
      // 각 열을 개별적으로 뒤섞기
      const shuffledCols = [];
      for (let c = 0; c < 2 && startCol + c < cols; c++) {
        const colTilesForThisCol = [];
        for (let r = 0; r < rows; r++) {
          const index = r * 2 + c;
          if (index < colTiles.length) {
            colTilesForThisCol.push(colTiles[index]);
          }
        }
        this.shuffleArray(colTilesForThisCol);
        shuffledCols.push(...colTilesForThisCol);
      }
      
      // 결과 배열 구성
      const result = [];
      let shuffledIndex = 0;
      let otherIndex = 0;
      
      for (let i = 0; i < tiles.length; i++) {
        const col = i % cols;
        if (col >= startCol && col < startCol + 2 && col < cols) {
          result.push(shuffledCols[shuffledIndex++]);
        } else {
          result.push(otherTiles[otherIndex++]);
        }
      }
      
      return result;
    }
  }

  /**
   * 어려운 난이도: 모든 타일 완전 뒤섞기 준비
   */
  prepareShuffleHard(tiles) {
    const shuffled = [...tiles];
    this.shuffleArray(shuffled);
    return shuffled;
  }

  /**
   * DOM에서 타일들을 재배치
   */
  reorderTilesInDOM(shuffledTiles, grid) {
    shuffledTiles.forEach(tile => {
      if (tile.parentNode) {
        tile.parentNode.removeChild(tile);
      }
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

  /**
   * 타일 배열에 서로 다른 색이 있는지 확인
   */
  hasDifferentColors(tiles) {
    if (tiles.length < 2) return false;
    
    const colors = new Set();
    for (const tile of tiles) {
      const color = tile.style.background || tile.style.backgroundColor;
      colors.add(color);
      if (colors.size >= 2) {
        return true;
      }
    }
    return false;
  }

  /**
   * 셔플 후 실제로 순서가 바뀌었는지 확인
   */
  hasOrderChanged(originalTiles, shuffledTiles) {
    if (originalTiles.length !== shuffledTiles.length) return true;
    
    for (let i = 0; i < originalTiles.length; i++) {
      if (originalTiles[i] !== shuffledTiles[i]) {
        return true;
      }
    }
    return false;
  }

  onDeactivate() {
    this.clearInterval();
  }
}

