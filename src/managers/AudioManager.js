export class AudioManager {
  constructor(config) {
    this.config = config;
    this.audioConfig = config?.audio || {};
    this.sounds = {};
    this.bgmInstances = {};
    this.enabled = this.audioConfig.enabled !== false;
    
    // 볼륨 설정
    this.sfxVolume = this.audioConfig.volume?.sfx ?? 0.7;
    this.bgmVolume = this.audioConfig.volume?.bgm ?? 0.5;
    
    // 사운드 파일 경로 설정
    this.soundPaths = this.audioConfig.sounds || {};
    
    // 개별 사운드 볼륨 설정 (기본값 1.0 = 100%)
    this.soundVolumes = this.audioConfig.soundVolumes || {};
    
    // BGM 인스턴스 추적
    this.currentBgm = null;
    // 음소거 전 재생 중이었던 BGM 저장
    this.pausedBgm = null;
  }

  /**
   * 사운드 파일을 로드합니다 (파일이 없으면 무시)
   */
  loadSound(name, path) {
    if (!this.enabled || !path) {
      return;
    }

    try {
      const audio = new Audio(path);
      
      // 개별 볼륨 설정 (기본값 1.0)
      const individualVolume = this.soundVolumes[name] ?? 1.0;
      // 전체 SFX 볼륨과 개별 볼륨을 곱하여 최종 볼륨 계산
      audio.volume = this.sfxVolume * Math.max(0, Math.min(1, individualVolume));
      
      audio.preload = 'auto';
      
      // 에러 핸들링
      audio.addEventListener('error', (e) => {
        console.warn(`사운드 파일을 로드할 수 없습니다: ${path}`, e);
        this.sounds[name] = null;
      });
      
      this.sounds[name] = audio;
    } catch (error) {
      console.warn(`사운드 로드 실패: ${name}`, error);
      this.sounds[name] = null;
    }
  }

  /**
   * 모든 사운드를 초기화합니다
   */
  init() {
    if (!this.enabled) {
      return;
    }

    // 효과음 로드
    Object.entries(this.soundPaths).forEach(([name, path]) => {
      if (name !== 'bgmMenu' && name !== 'bgmGame' && path) {
        this.loadSound(name, path);
      }
    });

    // BGM 로드
    if (this.soundPaths.bgmMenu) {
      this.loadBGM('bgmMenu', this.soundPaths.bgmMenu);
    }
    if (this.soundPaths.bgmGame) {
      this.loadBGM('bgmGame', this.soundPaths.bgmGame);
    }
  }

  /**
   * BGM을 로드합니다
   */
  loadBGM(name, path) {
    if (!this.enabled || !path) {
      return;
    }

    try {
      const audio = new Audio(path);
      
      // 개별 볼륨 설정 (기본값 1.0)
      const individualVolume = this.soundVolumes[name] ?? 1.0;
      // 전체 BGM 볼륨과 개별 볼륨을 곱하여 최종 볼륨 계산
      audio.volume = this.bgmVolume * Math.max(0, Math.min(1, individualVolume));
      
      audio.loop = true;
      audio.preload = 'auto';
      
      audio.addEventListener('error', (e) => {
        console.warn(`BGM 파일을 로드할 수 없습니다: ${path}`, e);
        this.bgmInstances[name] = null;
      });
      
      this.bgmInstances[name] = audio;
    } catch (error) {
      console.warn(`BGM 로드 실패: ${name}`, error);
      this.bgmInstances[name] = null;
    }
  }

  /**
   * 효과음을 재생합니다
   */
  play(name) {
    if (!this.enabled) {
      return;
    }

    const sound = this.sounds[name];
    if (!sound) {
      return;
    }

    try {
      // 현재 재생 중이면 처음부터 다시 재생
      sound.currentTime = 0;
      sound.play().catch((error) => {
        // 자동 재생 정책으로 인한 에러는 무시
        if (error.name !== 'NotAllowedError') {
          console.warn(`사운드 재생 실패: ${name}`, error);
        }
      });
    } catch (error) {
      console.warn(`사운드 재생 중 오류: ${name}`, error);
    }
  }

  /**
   * BGM을 재생합니다
   */
  playBGM(name) {
    if (!this.enabled) {
      // 음소거 상태면 일시정지된 BGM으로 저장
      this.pausedBgm = name;
      return;
    }

    // 현재 재생 중인 BGM 정지
    this.stopBGM();
    // 새로운 BGM 재생 시 일시정지된 BGM 초기화
    this.pausedBgm = null;

    const bgm = this.bgmInstances[name];
    if (!bgm) {
      return;
    }

    try {
      bgm.currentTime = 0;
      bgm.play().catch((error) => {
        if (error.name !== 'NotAllowedError') {
          console.warn(`BGM 재생 실패: ${name}`, error);
        }
      });
      this.currentBgm = name;
    } catch (error) {
      console.warn(`BGM 재생 중 오류: ${name}`, error);
    }
  }

  /**
   * 현재 재생 중인 BGM을 정지합니다
   */
  stopBGM() {
    if (this.currentBgm && this.bgmInstances[this.currentBgm]) {
      try {
        this.bgmInstances[this.currentBgm].pause();
        this.bgmInstances[this.currentBgm].currentTime = 0;
      } catch (error) {
        console.warn(`BGM 정지 중 오류: ${this.currentBgm}`, error);
      }
    }
    this.currentBgm = null;
  }
  
  /**
   * 현재 재생 중인 BGM을 일시정지합니다 (음소거용)
   */
  pauseBGM() {
    if (this.currentBgm && this.bgmInstances[this.currentBgm]) {
      try {
        this.bgmInstances[this.currentBgm].pause();
        // 음소거 전 BGM 저장 (재생 위치는 유지)
        this.pausedBgm = this.currentBgm;
      } catch (error) {
        console.warn(`BGM 일시정지 중 오류: ${this.currentBgm}`, error);
      }
    }
  }
  
  /**
   * 일시정지된 BGM을 다시 재생합니다
   */
  resumeBGM() {
    if (this.pausedBgm && this.bgmInstances[this.pausedBgm]) {
      try {
        const bgm = this.bgmInstances[this.pausedBgm];
        bgm.play().catch((error) => {
          if (error.name !== 'NotAllowedError') {
            console.warn(`BGM 재생 실패: ${this.pausedBgm}`, error);
          }
        });
        this.currentBgm = this.pausedBgm;
        this.pausedBgm = null;
      } catch (error) {
        console.warn(`BGM 재개 중 오류: ${this.pausedBgm}`, error);
      }
    }
  }

  /**
   * 볼륨을 설정합니다
   */
  setVolume(type, volume) {
    if (type === 'sfx') {
      this.sfxVolume = Math.max(0, Math.min(1, volume));
      // 각 사운드의 개별 볼륨을 고려하여 업데이트
      Object.entries(this.sounds).forEach(([name, sound]) => {
        if (sound) {
          const individualVolume = this.soundVolumes[name] ?? 1.0;
          sound.volume = this.sfxVolume * Math.max(0, Math.min(1, individualVolume));
        }
      });
    } else if (type === 'bgm') {
      this.bgmVolume = Math.max(0, Math.min(1, volume));
      // 각 BGM의 개별 볼륨을 고려하여 업데이트
      Object.entries(this.bgmInstances).forEach(([name, bgm]) => {
        if (bgm) {
          const individualVolume = this.soundVolumes[name] ?? 1.0;
          bgm.volume = this.bgmVolume * Math.max(0, Math.min(1, individualVolume));
        }
      });
    }
  }

  /**
   * 개별 사운드의 볼륨을 설정합니다
   */
  setSoundVolume(soundName, volume) {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.soundVolumes[soundName] = clampedVolume;
    
    // 해당 사운드가 효과음인 경우
    if (this.sounds[soundName]) {
      this.sounds[soundName].volume = this.sfxVolume * clampedVolume;
    }
    
    // 해당 사운드가 BGM인 경우
    if (this.bgmInstances[soundName]) {
      this.bgmInstances[soundName].volume = this.bgmVolume * clampedVolume;
    }
  }

  /**
   * 오디오를 활성화/비활성화합니다
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopBGM();
    }
  }
  
  /**
   * 음소거 상태를 토글합니다
   */
  toggleMute() {
    const wasMuted = !this.enabled;
    this.enabled = !this.enabled;
    
    if (!this.enabled) {
      // 음소거: 현재 재생 중인 BGM 일시정지
      this.pauseBGM();
    } else {
      // 음소거 해제: 이전에 재생 중이었던 BGM 재개
      this.resumeBGM();
    }
    
    return this.enabled;
  }
  
  /**
   * 음소거 상태를 가져옵니다
   */
  isMuted() {
    return !this.enabled;
  }
}

