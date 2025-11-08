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

  // 사용 가능한 언어 목록 가져오기
  getAvailableLanguages() {
    return Object.keys(this.translations);
  }

  // 새로운 언어 추가
  addLanguage(langCode, translations) {
    this.translations[langCode] = translations;
  }
}

// 싱글톤 인스턴스
export const languageManager = new LanguageManager();

