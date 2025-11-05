const STORAGE_KEY = 'tint-tap-best-score';

export class StorageManager {
  static loadBestScore() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) : 0;
  }

  static updateBestScore(currentScore, bestScore) {
    if (currentScore > bestScore) {
      const newBestScore = currentScore;
      localStorage.setItem(STORAGE_KEY, String(newBestScore));
      return newBestScore;
    }
    return bestScore;
  }
}

