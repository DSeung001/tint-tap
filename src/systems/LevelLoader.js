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

  createTileGrid(level, onTileClick) {
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
      tile.addEventListener('click', () => onTileClick(tile));
      tiles.push(tile);
    }

    return {
      tiles,
      oddTileIndices,
      cols,
      rows
    };
  }

  loadLevel(level, gridElement, onTileClick) {
    gridElement.innerHTML = '';
    
    const { tiles, oddTileIndices, cols, rows } = this.createTileGrid(level, onTileClick);
    
    gridElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridElement.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    tiles.forEach(tile => gridElement.appendChild(tile));
    
    return oddTileIndices;
  }
}

