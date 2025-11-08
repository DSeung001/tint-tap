const STORAGE_KEY = 'tint-tap-best-score';
const LANGUAGE_KEY = 'tint-tap-language';

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
  
  static saveLanguage(lang) {
    localStorage.setItem(LANGUAGE_KEY, lang);
  }
  
  static loadLanguage() {
    return localStorage.getItem(LANGUAGE_KEY) || 'ko';
  }
}

