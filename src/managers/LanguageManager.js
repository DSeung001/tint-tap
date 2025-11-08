import { ko } from '../locales/ko.js';
import { en } from '../locales/en.js';
import { StorageManager } from './StorageManager.js';

export class LanguageManager {
  constructor() {
    // 저장된 언어 설정 불러오기
    const savedLang = StorageManager.loadLanguage();
    this.currentLanguage = savedLang;
    this.translations = {
      ko: ko,
      en: en
    };
  }

  // 언어 설정
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLanguage = lang;
      // 언어 설정 저장
      StorageManager.saveLanguage(lang);
      return true;
    }
    return false;
  }
  
  // 언어 토글 (ko <-> en)
  toggleLanguage() {
    const newLang = this.currentLanguage === 'ko' ? 'en' : 'ko';
    this.setLanguage(newLang);
    return newLang;
  }

  // 번역 가져오기
  t(key, params = {}) {
    const translation = this.translations[this.currentLanguage]?.[key];
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    // 파라미터가 있으면 치환
    if (Object.keys(params).length > 0) {
      return this.interpolate(translation, params);
    }

    return translation;
  }

  // 문자열 보간 (예: "점수: ${score}" -> "점수: 100")
  interpolate(template, params) {
    return template.replace(/\${(\w+)}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  // 현재 언어 가져오기
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * 현재 메시지가 특정 키의 번역인지 확인
   */
  isMessageType(text, key) {
    if (!text || !key) return false;
    const currentTranslation = this.t(key);
    const allTranslations = Object.values(this.translations).map(t => t[key]).filter(Boolean);
    return allTranslations.some(translation => text.includes(translation) || translation.includes(text));
  }
  
  /**
   * 메시지에서 점수 정보 추출 및 재포맷팅
   */
  formatCorrectMessage(baseScore, oddBonus, timeBonus) {
    return `${this.t('correctAnswer')} +${baseScore} / +${oddBonus} / +${timeBonus} ${this.t('scoreGained')}`;
  }
  
  /**
   * 메시지에서 목숨 정보 추출 및 재포맷팅
   */
  formatWrongMessage(lives) {
    return `${this.t('wrongAnswer')} ${this.t('remainingLives')} ${lives}${this.t('livesUnit')}. ${this.t('tryAgain')}`;
  }
  
  /**
   * 현재 메시지 타입 판단 및 번역된 메시지 반환
   * @param {string} currentText - 현재 메시지 텍스트
   * @param {object} context - 컨텍스트 정보 (lives, scores 등)
   * @returns {string|null} - 번역된 메시지 또는 null
   */
  translateMessage(currentText, context = {}) {
    if (!currentText) return null;
    
    // 정답 메시지 확인
    if (this.isMessageType(currentText, 'correctAnswer')) {
      const scoreMatch = currentText.match(/(\+?\d+)\s*\/\s*(\+?\d+)\s*\/\s*(\+?\d+)/);
      if (scoreMatch) {
        return this.formatCorrectMessage(scoreMatch[1], scoreMatch[2], scoreMatch[3]);
      }
      return this.t('correctAnswer');
    }
    
    // 오답 메시지 확인
    if (this.isMessageType(currentText, 'wrongAnswer')) {
      if (context.lives !== undefined) {
        return this.formatWrongMessage(context.lives);
      }
      return this.t('wrongAnswer');
    }
    
    // 선택 없음 메시지 확인
    if (this.isMessageType(currentText, 'noSelectionMessage')) {
      return this.t('noSelectionMessage');
    }
    
    // 게임 시작 메시지 확인
    if (this.isMessageType(currentText, 'gameStartMessage')) {
      return this.t('gameStartMessage');
    }
    
    // 환영 메시지 확인
    if (this.isMessageType(currentText, 'welcomeMessage')) {
      return this.t('welcomeMessage');
    }
    
    // 승리 메시지 확인
    if (this.isMessageType(currentText, 'winMessage')) {
      if (context.maxLevel !== undefined) {
        return this.t('winMessage', { maxLevel: context.maxLevel });
      }
      return this.t('winMessage', { maxLevel: 100 }); // 기본값
    }
    
    return null;
  }
}

// 싱글톤 인스턴스
export const languageManager = new LanguageManager();

