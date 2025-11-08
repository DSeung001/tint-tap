/**
 * 기본 기믹 클래스
 * 모든 기믹은 이 클래스를 상속받아 구현
 */
export class BaseGimmick {
  constructor(name, config, gameInstance) {
    this.name = name;
    this.config = config;
    this.game = gameInstance;
    this.enabled = config.enabled !== false;
    this.active = false;
    this.intervalId = null;
    this.difficultyRanges = config.difficultyRanges || [];
  }

  /**
   * 현재 레벨에 맞는 난이도 설정 가져오기
   */
  getDifficultyForLevel(level) {
    for (const range of this.difficultyRanges) {
      const [start, end] = range.range;
      if (level >= start && level <= end) {
        return range;
      }
    }
    // 기본값 반환
    return this.difficultyRanges[this.difficultyRanges.length - 1] || {};
  }

  /**
   * 기믹 활성화
   */
  activate() {
    if (!this.enabled || this.active) return;
    this.active = true;
    this.onActivate();
  }

  /**
   * 기믹 비활성화
   */
  deactivate() {
    if (!this.active) return;
    this.active = false;
    this.onDeactivate();
    this.clearInterval();
  }

  /**
   * 기믹 시작 (서브클래스에서 구현)
   */
  onActivate() {
    // 서브클래스에서 구현
  }

  /**
   * 기믹 종료 (서브클래스에서 구현)
   */
  onDeactivate() {
    // 서브클래스에서 구현
  }

  /**
   * 인터벌 설정
   */
  setInterval(callback, delay) {
    this.clearInterval();
    this.intervalId = setInterval(callback, delay * 1000);
  }

  /**
   * 인터벌 클리어
   */
  clearInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * 보스 캐릭터에게 애니메이션 재생 요청
   */
  triggerBossAnimation(animationType) {
    if (this.game.bossCharacter) {
      this.game.bossCharacter.playAnimation(animationType);
      this.game.bossCharacter.showImpact();
    }
  }

  /**
   * 사운드 재생
   * @param {string} soundName - 사운드 이름 (기본값: 'gimmick', config.json의 audio.sfx에 정의된 이름)
   */
  playSound(soundName = 'gimmick') {
    if (this.game.audioManager && soundName) {
      this.game.audioManager.play(soundName);
    }
  }

  /**
   * 기믹 실행 (서브클래스에서 구현)
   */
  execute() {
    // 서브클래스에서 구현
  }
}

