import { ShuffleGimmick } from './gimmicks/ShuffleGimmick.js';
import { HideGimmick } from './gimmicks/HideGimmick.js';
import { RotationGimmick } from './gimmicks/RotationGimmick.js';
import { MirrorGimmick } from './gimmicks/MirrorGimmick.js';
// 다른 기믹들도 여기에 import

/**
 * 기믹 레지스트리 - 새로운 기믹을 자동으로 등록
 */
class GimmickRegistry {
  constructor() {
    this.gimmickClasses = new Map();
    this.registerDefaultGimmicks();
  }

  /**
   * 기본 기믹 등록
   */
  registerDefaultGimmicks() {
    this.register('shuffle', ShuffleGimmick);
    this.register('hide', HideGimmick);
    this.register('rotation', RotationGimmick);
    this.register('mirror', MirrorGimmick);
    // 새로운 기믹 추가 시 여기에 등록
    // this.register('flow', FlowGimmick);
  }

  /**
   * 기믹 클래스 등록
   */
  register(name, gimmickClass) {
    this.gimmickClasses.set(name, gimmickClass);
  }

  /**
   * 기믹 클래스 가져오기
   */
  get(name) {
    return this.gimmickClasses.get(name);
  }

  /**
   * 등록된 모든 기믹 이름 가져오기
   */
  getAllNames() {
    return Array.from(this.gimmickClasses.keys());
  }
}

// 싱글톤 인스턴스
const gimmickRegistry = new GimmickRegistry();

/**
 * 기믹 시스템 관리자
 */
export class GimmickManager {
  constructor(config, gameInstance) {
    this.config = config.gimmicks || {};
    this.game = gameInstance;
    this.enabled = this.config.enabled !== false;
    this.startLevel = this.config.startLevel || 20;
    this.probability = this.config.probability || 0.3;
    this.singleActive = this.config.singleActive !== false;
    
    this.gimmicks = new Map();
    this.activeGimmick = null;
    this.initialized = false;
    
    this.init();
  }

  /**
   * 초기화
   */
  init() {
    if (!this.enabled || this.initialized) return;
    
    // 기믹 인스턴스 생성
    const gimmickConfigs = this.config.gimmicks || [];
    gimmickConfigs.forEach(gimmickConfig => {
      if (gimmickConfig.enabled !== false) {
        this.createGimmick(gimmickConfig);
      }
    });
    
    this.initialized = true;
  }

  /**
   * 기믹 인스턴스 생성
   */
  createGimmick(config) {
    const GimmickClass = gimmickRegistry.get(config.name);
    
    if (!GimmickClass) {
      console.warn(`Unknown gimmick: ${config.name}. Available: ${gimmickRegistry.getAllNames().join(', ')}`);
      return;
    }
    
    try {
      const gimmick = new GimmickClass(config, this.game);
      this.gimmicks.set(config.name, gimmick);
    } catch (error) {
      console.error(`Failed to create gimmick "${config.name}":`, error);
    }
  }

  /**
   * 레벨 변경 시 호출
   */
  onLevelChange(level) {
    if (!this.enabled || level < this.startLevel) {
      this.deactivateAll();
      // 보스 캐릭터 숨기기
      if (this.game.bossCharacter) {
        this.game.bossCharacter.hide();
      }
      return;
    }

    // 보스 시작 레벨 이후에는 보스 항상 표시
    const bossStartLevel = this.game.config?.boss?.startLevel || 80;
    if (level >= bossStartLevel && this.game.bossCharacter) {
      this.game.bossCharacter.show();
    }

    // 보스 시작 레벨 이후에는 매번 기믹 발생
    if (level >= bossStartLevel) {
      this.triggerRandomGimmick();
    } else {
      // 그 전에는 확률적으로 기믹 발생
      if (Math.random() < this.probability) {
        this.triggerRandomGimmick();
      }
    }
  }

  /**
   * 랜덤 기믹 발생
   */
  triggerRandomGimmick() {
    if (this.singleActive && this.activeGimmick) {
      // 이미 활성화된 기믹이 있으면 새로운 기믹 발생하지 않음
      return;
    }

    const availableGimmicks = Array.from(this.gimmicks.values())
      .filter(g => !g.active && g.enabled);
    
    if (availableGimmicks.length === 0) return;

    // 랜덤으로 기믹 선택 (균등 확률)
    const randomIndex = Math.floor(Math.random() * availableGimmicks.length);
    const randomGimmick = availableGimmicks[randomIndex];

    this.activateGimmick(randomGimmick.name);
  }

  /**
   * 특정 기믹 활성화 (개발자 모드용)
   */
  activateGimmick(gimmickName) {
    if (this.singleActive && this.activeGimmick) {
      this.deactivateGimmick(this.activeGimmick.name);
    }

    const gimmick = this.gimmicks.get(gimmickName);
    if (gimmick && !gimmick.active) {
      gimmick.activate();
      this.activeGimmick = gimmick;
      
      // 기믹 활성화 시 보스 캐릭터 표시
      if (this.game.bossCharacter && this.game.level >= this.startLevel) {
        this.game.bossCharacter.show();
      }
    }
  }

  /**
   * 특정 기믹 비활성화
   */
  deactivateGimmick(gimmickName) {
    const gimmick = this.gimmicks.get(gimmickName);
    if (gimmick && gimmick.active) {
      gimmick.deactivate();
      if (this.activeGimmick === gimmick) {
        this.activeGimmick = null;
      }
    }
  }

  /**
   * 모든 기믹 비활성화
   */
  deactivateAll() {
    this.gimmicks.forEach(gimmick => {
      if (gimmick.active) {
        gimmick.deactivate();
      }
    });
    this.activeGimmick = null;
    
    // 보스 시작 레벨 이전이면 보스 숨기기
    const bossStartLevel = this.game.config?.boss?.startLevel || 80;
    if (this.game.level < bossStartLevel && this.game.bossCharacter) {
      this.game.bossCharacter.hide();
    }
  }

  /**
   * 레벨 클리어 시 호출
   */
  onLevelComplete() {
    // 레벨 클리어 시 기믹 비활성화 (선택사항)
    // this.deactivateAll();
  }

  /**
   * 게임 리셋 시 호출
   */
  reset() {
    this.deactivateAll();
  }

  /**
   * 개발자 모드: 모든 기믹 목록 가져오기
   */
  getAllGimmicks() {
    return Array.from(this.gimmicks.keys());
  }

  /**
   * 개발자 모드: 활성화된 기믹 가져오기
   */
  getActiveGimmick() {
    return this.activeGimmick ? this.activeGimmick.name : null;
  }
}

