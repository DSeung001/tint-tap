export class ScoringSystem {
  static calculateBaseScore(level, config) {
    return config.scoring.basePerLevel + config.scoring.levelIncrement * (level - 1);
  }

  static calculateOddBonus(oddTileCount, config) {
    return oddTileCount * config.scoring.perOddTileBonus;
  }

  static calculateTimeBonus(elapsedSeconds, config) {
    if (!config.scoring.timeBonus.enabled) {
      return 0;
    }
    const remain = Math.max(0, config.timing.bonusClockPerLevelSec - elapsedSeconds);
    return Math.min(
      config.scoring.timeBonus.cap,
      Math.round(remain * config.scoring.timeBonus.perSecond)
    );
  }

  static calculateTotalScore(baseScore, oddBonus, timeBonus) {
    return baseScore + oddBonus + timeBonus;
  }

  static calculateWrongPenalty(currentScore, config) {
    if (!config.scoring.wrongPenalty) {
      return currentScore;
    }
    return Math.max(0, currentScore - config.scoring.wrongPenalty);
  }

  static calculateLevelScore(level, oddTileCount, elapsedSeconds, config) {
    const baseScore = this.calculateBaseScore(level, config);
    const oddBonus = this.calculateOddBonus(oddTileCount, config);
    const timeBonus = this.calculateTimeBonus(elapsedSeconds, config);
    const totalScore = this.calculateTotalScore(baseScore, oddBonus, timeBonus);
    
    return {
      baseScore,
      oddBonus,
      timeBonus,
      totalScore
    };
  }
}

