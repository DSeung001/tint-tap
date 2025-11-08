import { deltaFor, oddCountFor, gridFor } from '../difficulty.js';
import { randomBaseColor, oddColorFrom, toCssColor } from '../color.js';

export class LevelLoader {
  constructor(config) {
    this.config = config;
  }

  pickOddIndices(total, count) {
    const indices = new Set();
    while (indices.size < count) {
      indices.add(Math.floor(Math.random() * total));
    }
    return indices;
  }

  createTileGrid(level, onTileClick, audioManager) {
    const { cols, rows } = gridFor(level, this.config);
    const oddCount = oddCountFor(level, this.config);
    const delta = deltaFor(level, this.config);
    const baseColor = randomBaseColor(this.config.color);
    const oddColor = oddColorFrom(baseColor, delta, this.config.color);

    const totalTiles = cols * rows;
    const oddTileIndices = this.pickOddIndices(totalTiles, oddCount);

    const tiles = [];
    for (let i = 0; i < totalTiles; i += 1) {
      const tile = document.createElement('button');
      tile.className = 'tile';
      tile.setAttribute('role', 'gridcell');
      tile.dataset.index = String(i);
      tile.style.background = oddTileIndices.has(i)
        ? toCssColor(oddColor)
        : toCssColor(baseColor);
      
      // 타일 호버 효과음
      tile.addEventListener('mouseenter', () => {
        audioManager?.play('tileHover');
      });
      
      // 타일 클릭 효과음 및 선택 처리
      tile.addEventListener('click', () => {
        audioManager?.play('tileClick');
        onTileClick(tile);
      });
      
      tiles.push(tile);
    }

    return {
      tiles,
      oddTileIndices,
      cols,
      rows
    };
  }

  loadLevel(level, gridElement, onTileClick, audioManager) {
    gridElement.innerHTML = '';
    
    const { tiles, oddTileIndices, cols, rows } = this.createTileGrid(level, onTileClick, audioManager);
    
    gridElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridElement.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    tiles.forEach(tile => gridElement.appendChild(tile));
    
    return oddTileIndices;
  }

  /**
   * 레벨에 맞는 그리드 정보 가져오기 (기믹 시스템용)
   */
  getGridInfo(level, config) {
    return gridFor(level, config);
  }
}

