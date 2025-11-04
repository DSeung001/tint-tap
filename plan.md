# Tint Tap Game - AI 코딩 계획서

---

## 1. 개요 (Overview)

### 1.1 프로젝트 소개
- **제목**: Tint Tap
- **장르**: 레트로 컬러 퍼즐 / 아케이드
- **핵심 컨셉**: 신중하게 다른 색을 찾아내는 레트로 감성 컬러 퍼즐 게임
- **대상 플랫폼**: CrazyGames 같은 외국계 게임 공유 플랫폼
- **플레이 스타일**: 느리지만 집중력을 요구하는 아케이드 퍼즐

### 1.2 문서 목적
이 문서는 **AI 코딩 작업을 위한 단계별 구현 계획서**로, 다음을 포함합니다:
- 프로젝트 폴더 구조 및 레이어 정의
- 구현 단계별 작업 순서
- 각 모듈별 파일 명세
- 기능 요구사항 및 구현 가이드

### 1.3 진행 상황 추적
- **진행 상황 파일**: `PROGRESS.md`
- 각 Phase 및 작업 항목의 완료 상태를 체크리스트 형태로 관리
- 구현 중인 작업, 완료된 작업, 블로커 등을 명확히 표시
- AI 작업 시 `PROGRESS.md`를 업데이트하여 현재 상태 추적

---

## 2. 기능 요구사항 (Functional Requirements)

### 2.1 게임 플로우

#### REQ-001: 시작 화면
- **우선순위**: 높음 (★★★)
- **설명**: 게임 시작 전 타이틀 화면 표시
- **세부 요구사항**:
  - 타이틀 로고/텍스트 표시
  - "Start Game" 버튼 제공
  - 버튼 클릭 시 게임 시작

#### REQ-002: 레벨 로딩
- **우선순위**: 높음 (★★★)
- **설명**: 현재 레벨 설정에 따라 그리드 및 색상 생성
- **세부 요구사항**:
  - 레벨 번호에 따른 그리드 크기 자동 계산
  - RGB 차이값(Δ)에 따른 다른 색상 타일 생성
  - 다른 색상 타일 개수 설정에 따라 배치
  - 모든 타일 무작위 위치 배치

#### REQ-003: 타일 선택
- **우선순위**: 높음 (★★★)
- **설명**: 플레이어가 마우스/터치로 타일 선택
- **세부 요구사항**:
  - 복수 타일 선택 가능
  - 선택된 타일 시각적 피드백 제공
  - 선택 취소 가능

#### REQ-004: 답안 제출 및 판정
- **우선순위**: 높음 (★★★)
- **설명**: OK 버튼 클릭 시 선택된 타일 검증
- **세부 요구사항**:
  - OK 버튼 클릭 후 선택 타일 판정
  - 정답 시: 점수 계산 및 다음 레벨로 진행
  - 오답 시: 목숨 1개 차감, 현재 레벨 재시작 또는 게임 종료 처리

#### REQ-005: 점수 시스템
- **우선순위**: 높음 (★★★)
- **설명**: 레벨 클리어 시 점수 계산 및 표시
- **세부 요구사항**:
  - 기본 점수: 레벨별 기본값
  - 다른 색상 타일 보너스: `oddCount * perOddTileBonus`
  - 시간 보너스: 빠를수록 높은 보너스 (최대 cap 제한)
  - 총 점수: `score = base + (oddCount * perOddTileBonus) + timeBonus`
  - 실시간 점수 표시

#### REQ-006: 목숨 시스템
- **우선순위**: 높음 (★★★)
- **설명**: 게임 실패 시 목숨 감소
- **세부 요구사항**:
  - 초기 목숨: 3개
  - 오답 시 목숨 1개 차감
  - 목숨 0개 시 게임 종료
  - 목숨 상태 실시간 표시

#### REQ-007: 게임 종료
- **우선순위**: 중간 (★★☆)
- **설명**: 목숨 소진 시 게임 종료 화면 표시
- **세부 요구사항**:
  - 최종 점수 표시
  - 최고 점수 기록 비교 표시
  - "Restart" 버튼 제공
  - 점수 LocalStorage 저장

---

### 2.2 레벨 시스템

#### REQ-008: 레벨 난이도 설정
- **우선순위**: 높음 (★★★)
- **설명**: 레벨별 난이도 자동 조정
- **세부 요구사항**:

| 구간 | 레벨 범위 | RGB 차이(Δ) | 다른 색 타일 수 | 그리드 크기 |
|------|----------|-------------|----------------|-------------|
| 1 | 1~5 | Δ 100 → 85 | 1 | 3x3 |
| 2 | 6~10 | Δ 85 → 70 | 1 | 3x4 |
| 3 | 11~20 | Δ 70 → 30 (점진 감소) | 1 | 4x4 |
| 4 | 21~30 | Δ 30 → 20 | 2 | 5x5 |
| 5 | 31~40 | Δ 20 → 10 | 4 | 6x5 |

- 모든 수치는 선형 보간(Linear Interpolation) 기반
- 총 레벨 수: 40단계

#### REQ-009: 동적 난이도 계산
- **우선순위**: 중간 (★★☆)
- **설명**: 설정 파일 기반 난이도 계산 함수
- **세부 요구사항**:
  - `deltaFor(level)`: 레벨에 따른 RGB 차이값 반환
  - `oddCountFor(level)`: 레벨에 따른 다른 색상 타일 개수 반환
  - `gridFor(level)`: 레벨에 따른 그리드 크기 반환
  - 설정 파일 변경 시 재빌드 없이 반영

---

### 2.3 색상 시스템

#### REQ-010: 색상 생성 알고리즘
- **우선순위**: 높음 (★★★)
- **설명**: RGB 차이값 기반 다른 색상 생성
- **세부 요구사항**:
  - 기본 색상 랜덤 생성 (밝기 범위: 40~215)
  - 다른 색상은 기본 색상에서 Δ만큼 차이
  - RGB 채널별 자동 또는 수동 조정 가능
  - 색맹 안전 모드 옵션 (향후 확장)

---

### 2.4 사용자 인터페이스

#### REQ-011: 레트로 UI 스타일
- **우선순위**: 중간 (★★☆)
- **설명**: 레트로 감성의 사용자 인터페이스
- **세부 요구사항**:
  - 픽셀 폰트 사용
  - 도트 효과 및 레트로 색감
  - 명확한 OK 버튼 인터랙션
  - 반응형 디자인 (PC/Mobile 지원)

#### REQ-012: 게임 상태 표시
- **우선순위**: 높음 (★★★)
- **설명**: 실시간 게임 정보 표시
- **세부 요구사항**:
  - 현재 레벨 표시
  - 목숨 표시
  - 현재 점수 표시
  - 타이머 표시 (시간 보너스 계산용)

---

### 2.5 오디오 시스템

#### REQ-013: 효과음
- **우선순위**: 낮음 (★☆☆)
- **설명**: 게임 액션에 따른 효과음 재생
- **세부 요구사항**:
  - 타일 클릭 효과음
  - 정답 효과음
  - 오답 효과음
  - 버튼 클릭 효과음

---

## 3. 비기능 요구사항 (Non-Functional Requirements)

### 3.1 성능 요구사항

#### NREQ-001: 렌더링 성능
- **설명**: 60 FPS 유지
- **세부 요구사항**:
  - 렌더링 주기: 60Hz (config.json `tickHz` 설정)
  - 그리드 최대 크기(6x5)에서도 부드러운 렌더링

#### NREQ-002: 반응성
- **설명**: 사용자 입력에 즉각 반응
- **세부 요구사항**:
  - 타일 클릭 지연: < 100ms
  - 화면 전환 애니메이션: 부드러운 전환

---

### 3.2 호환성 요구사항

#### NREQ-003: 브라우저 호환성
- **설명**: 주요 브라우저 지원
- **세부 요구사항**:
  - Chrome, Firefox, Safari, Edge 최신 2개 버전
  - 모바일 브라우저 지원 (iOS Safari, Chrome Mobile)

#### NREQ-004: 디바이스 지원
- **설명**: 다양한 디바이스 지원
- **세부 요구사항**:
  - PC: 데스크톱 해상도 (최소 1280x720)
  - Mobile: 스마트폰 터치 인터페이스 지원

---

### 3.3 사용성 요구사항

#### NREQ-005: 직관적 조작
- **설명**: 누구나 쉽게 이해할 수 있는 UI/UX
- **세부 요구사항**:
  - 명확한 버튼 레이블
  - 시각적 피드백 제공
  - 오류 메시지 명확성

---

### 3.4 유지보수성 요구사항

#### NREQ-006: 설정 기반 동작
- **설명**: 모든 게임 로직은 설정 파일로 제어
- **세부 요구사항**:
  - 난이도 조정 시 코드 수정 불필요
  - 설정 변경 시 즉시 반영 (재빌드 불필요)

#### NREQ-007: 확장 가능성
- **설명**: 향후 기능 추가 용이
- **세부 요구사항**:
  - easing 함수 확장 가능
  - 테마/스킨 시스템 확장 가능
  - 색상 팔레트 확장 가능

---

## 4. 프로젝트 구조 및 레이어 (Project Structure & Layers)

### 4.1 폴더 구조

```
tint-tap/
├── public/                    # 정적 파일
│   ├── index.html
│   └── assets/               # 이미지, 폰트, 오디오
│       ├── fonts/
│       ├── images/
│       └── sounds/
│
├── src/                      # 소스 코드
│   ├── main.js               # 진입점
│   │
│   ├── core/                 # 핵심 게임 로직 레이어
│   │   ├── GameEngine.js     # 게임 엔진 메인 클래스
│   │   ├── GameState.js      # 게임 상태 관리 (START, PLAY, JUDGE, GAME_OVER)
│   │   ├── LevelManager.js   # 레벨 관리 및 난이도 계산
│   │   ├── ScoringSystem.js  # 점수 계산 로직
│   │   └── LifeManager.js    # 목숨 관리
│   │
│   ├── scenes/               # 게임 씬 레이어
│   │   ├── BaseScene.js      # 씬 기본 클래스
│   │   ├── TitleScene.js     # 타이틀 화면 (REQ-001)
│   │   ├── GameScene.js      # 게임 플레이 씬 (REQ-002, REQ-003, REQ-004)
│   │   └── GameOverScene.js  # 게임 종료 화면 (REQ-007)
│   │
│   ├── components/           # UI 컴포넌트 레이어
│   │   ├── Tile.js           # 타일 컴포넌트
│   │   ├── Button.js          # 버튼 컴포넌트
│   │   ├── HUD.js             # 게임 상태 표시 (레벨, 점수, 목숨, 타이머)
│   │   └── Grid.js            # 그리드 컨테이너
│   │
│   ├── managers/             # 관리자 레이어
│   │   ├── ConfigManager.js  # config.json 로드 및 관리
│   │   ├── AudioManager.js   # 오디오 재생 관리 (Howler.js)
│   │   ├── StorageManager.js # LocalStorage 관리
│   │   └── InputManager.js   # 입력 처리 (마우스/터치)
│   │
│   ├── utils/                # 유틸리티 레이어
│   │   ├── color.js          # 색상 생성 및 조작 (REQ-010)
│   │   ├── math.js           # 수학 함수 (보간, easing)
│   │   ├── levelUtils.js     # 레벨 계산 함수 (deltaFor, oddCountFor, gridFor)
│   │   └── scoring.js        # 점수 계산 유틸리티
│   │
│   ├── config/               # 설정 레이어
│   │   └── config.json       # 게임 설정 파일
│   │
│   └── styles/               # 스타일 레이어
│       └── retro.css         # 레트로 스타일 CSS (REQ-011)
│
├── package.json
├── vite.config.js
├── .gitignore
├── README.md
├── plan.md                  # AI 코딩 계획서 (이 문서)
└── PROGRESS.md              # 진행 상황 추적 파일
```

### 4.2 레이어별 책임 (Layer Responsibilities)

#### 4.2.1 Core Layer (핵심 게임 로직)
- **목적**: 게임의 핵심 비즈니스 로직
- **책임**:
  - 게임 상태 전환 관리
  - 레벨 난이도 계산
  - 점수 및 목숨 관리
  - 게임 규칙 적용
- **의존성**: `utils/`, `managers/ConfigManager.js`
- **독립성**: 다른 레이어에 의존하지 않음 (최상위)

#### 4.2.2 Scenes Layer (게임 씬)
- **목적**: 화면별 게임 로직 및 렌더링
- **책임**:
  - 각 화면의 상태 관리
  - PixiJS 컨테이너 관리
  - 씬 전환 처리
- **의존성**: `core/`, `components/`, `managers/`

#### 4.2.3 Components Layer (UI 컴포넌트)
- **목적**: 재사용 가능한 UI 요소
- **책임**:
  - PixiJS 기반 시각적 요소 렌더링
  - 사용자 인터랙션 처리
  - 상태 표시
- **의존성**: `managers/InputManager.js`, `utils/`

#### 4.2.4 Managers Layer (관리자)
- **목적**: 시스템 리소스 및 외부 라이브러리 관리
- **책임**:
  - 설정 파일 로드
  - 오디오 재생
  - 데이터 저장/로드
  - 입력 처리
- **의존성**: 외부 라이브러리 (PixiJS, Howler.js)

#### 4.2.5 Utils Layer (유틸리티)
- **목적**: 순수 함수 및 헬퍼 함수
- **책임**:
  - 색상 계산
  - 수학 연산
  - 레벨 계산
  - 점수 계산
- **의존성**: 없음 (순수 함수)

#### 4.2.6 Config Layer (설정)
- **목적**: 게임 설정 데이터
- **책임**: 설정 값 정의
- **의존성**: 없음

### 4.3 레이어 간 의존성 규칙

```
┌─────────────────────────────────────────┐
│         Config Layer (설정)             │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Utils Layer (순수 함수)          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Managers Layer (리소스 관리)        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Core Layer (게임 핵심 로직)         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│    Components Layer (UI 컴포넌트)        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       Scenes Layer (게임 씬)             │
└─────────────────────────────────────────┘
```

**규칙**:
- 하위 레이어는 상위 레이어에 의존하지 않음
- 같은 레이어 내부는 서로 의존 가능
- 상위 레이어는 하위 레이어만 의존

---

## 5. 구현 단계별 작업 계획 (Implementation Phases)

### 5.0 진행 상황 관리

#### PROGRESS.md 파일 구조
진행 상황 추적을 위해 `PROGRESS.md` 파일을 생성하고 관리합니다.

**파일 구조 예시**:
```markdown
# Tint Tap Game - 진행 상황 (Progress)

## 전체 진행률
- 전체: 0% (0/7 Phase 완료)
- 마지막 업데이트: YYYY-MM-DD HH:MM

## Phase별 진행 상황

### Phase 1: 프로젝트 초기 설정 (Foundation)
- [ ] 프로젝트 초기화
- [ ] 설정 파일 생성
- [ ] 유틸리티 함수 구현
- [ ] 진입점 생성
- **상태**: 대기 중 / 진행 중 / 완료
- **완료일**: YYYY-MM-DD

### Phase 2: 핵심 게임 로직 (Core Logic)
- [ ] 게임 상태 관리
- [ ] 레벨 관리
- [ ] 점수 시스템
- [ ] 목숨 관리
- [ ] 게임 엔진
- **상태**: 대기 중

...

## 현재 작업 중
- Phase: -
- 작업: -
- 블로커: 없음

## 완료된 기능
- (없음)

## 이슈 및 블로커
- (없음)
```

**업데이트 규칙**:
- 각 Phase 시작 시 상태를 "진행 중"으로 변경
- 작업 항목 완료 시 체크박스 `[ ]` → `[x]` 변경
- Phase 완료 시 상태를 "완료"로 변경하고 완료일 기록
- 블로커 발생 시 "이슈 및 블로커" 섹션에 기록
- 작업 전환 시 "현재 작업 중" 섹션 업데이트

**상태 표시**:
- `대기 중`: 아직 시작하지 않음
- `진행 중`: 현재 작업 중
- `완료`: 모든 작업 완료
- `블로커`: 문제 발생으로 진행 불가

### Phase 1: 프로젝트 초기 설정 (Foundation)
**목표**: 개발 환경 구축 및 기본 구조 생성

#### 작업 목록
1. **프로젝트 초기화**
   - `package.json` 생성 (Vite, PixiJS, Howler.js)
   - `vite.config.js` 설정
   - `.gitignore` 설정
   - 기본 폴더 구조 생성

2. **설정 파일 생성**
   - `src/config/config.json` 생성 (7.1 섹션 참조)
   - `ConfigManager.js` 구현 (config.json 로드)

3. **유틸리티 함수 구현**
   - `src/utils/levelUtils.js` - `deltaFor()`, `oddCountFor()`, `gridFor()`
   - `src/utils/math.js` - 선형 보간 함수
   - `src/utils/color.js` - 색상 생성 함수 (기본 구조)

4. **진입점 생성**
   - `public/index.html` 생성
   - `src/main.js` 생성 (PixiJS 앱 초기화)

**완료 기준**: 설정 파일 로드 및 유틸리티 함수 테스트 가능

---

### Phase 2: 핵심 게임 로직 (Core Logic)
**목표**: 게임의 핵심 비즈니스 로직 구현

#### 작업 목록
1. **게임 상태 관리**
   - `src/core/GameState.js` - 상태 머신 구현
   - 상태 전환 로직

2. **레벨 관리**
   - `src/core/LevelManager.js` - 레벨 초기화, 진행 관리
   - 난이도 계산 통합

3. **점수 시스템**
   - `src/core/ScoringSystem.js` - 점수 계산 로직
   - `src/utils/scoring.js` - 점수 계산 유틸리티

4. **목숨 관리**
   - `src/core/LifeManager.js` - 목숨 차감/관리

5. **게임 엔진**
   - `src/core/GameEngine.js` - 전체 게임 흐름 통합

**완료 기준**: 게임 상태 전환 및 점수 계산이 정상 동작

---

### Phase 3: 색상 시스템 (Color System)
**목표**: 색상 생성 알고리즘 완성

#### 작업 목록
1. **색상 생성 로직**
   - `src/utils/color.js` 완성
   - RGB 차이값 기반 색상 생성
   - 밝기 범위 제한 (40~215)

2. **색상 테스트**
   - 다양한 레벨에서 색상 차이 확인

**완료 기준**: 레벨별 올바른 색상 차이가 생성됨

---

### Phase 4: UI 컴포넌트 (UI Components)
**목표**: 게임 UI 요소 구현

#### 작업 목록
1. **기본 컴포넌트**
   - `src/components/Button.js` - 버튼 컴포넌트
   - `src/components/Tile.js` - 타일 컴포넌트 (선택/비선택 상태)

2. **게임 UI**
   - `src/components/HUD.js` - 레벨, 점수, 목숨, 타이머 표시
   - `src/components/Grid.js` - 그리드 컨테이너

3. **입력 처리**
   - `src/managers/InputManager.js` - 마우스/터치 입력 처리

**완료 기준**: 모든 UI 컴포넌트가 렌더링되고 상호작용 가능

---

### Phase 5: 게임 씬 (Game Scenes)
**목표**: 각 게임 화면 구현

#### 작업 목록
1. **기본 씬 클래스**
   - `src/scenes/BaseScene.js` - 씬 기본 클래스

2. **타이틀 씬**
   - `src/scenes/TitleScene.js` - 시작 화면 (REQ-001)

3. **게임 씬**
   - `src/scenes/GameScene.js` - 게임 플레이 화면
     - 그리드 생성 및 타일 배치 (REQ-002)
     - 타일 선택 기능 (REQ-003)
     - OK 버튼 및 판정 (REQ-004)

4. **게임 오버 씬**
   - `src/scenes/GameOverScene.js` - 게임 종료 화면 (REQ-007)

**완료 기준**: 모든 화면이 정상적으로 표시되고 전환됨

---

### Phase 6: 통합 및 연동 (Integration)
**목표**: 모든 시스템 통합

#### 작업 목록
1. **게임 엔진 통합**
   - `GameEngine.js`에 씬 관리 추가
   - 상태 전환 로직 완성

2. **데이터 저장**
   - `src/managers/StorageManager.js` - LocalStorage 관리
   - 최고 점수 저장/로드

3. **오디오 시스템** (선택)
   - `src/managers/AudioManager.js` - Howler.js 통합
   - 효과음 재생 (REQ-013)

**완료 기준**: 게임이 처음부터 끝까지 플레이 가능

---

### Phase 7: 스타일링 및 폴리싱 (Polish)
**목표**: 레트로 스타일 적용 및 최종 다듬기

#### 작업 목록
1. **레트로 스타일**
   - `src/styles/retro.css` - 레트로 스타일 적용 (REQ-011)
   - 픽셀 폰트 적용
   - 색상 팔레트 조정

2. **반응형 디자인**
   - 모바일/데스크톱 대응
   - 터치 인터페이스 최적화

3. **성능 최적화**
   - 렌더링 최적화
   - 60 FPS 유지 확인

4. **버그 수정 및 테스트**
   - 모든 기능 테스트
   - 크로스 브라우저 테스트

**완료 기준**: 완성된 게임, 배포 준비 완료

---

### 5.8 각 파일별 구현 가이드

#### core/GameEngine.js
- **목적**: 게임 전체 흐름 관리
- **주요 메서드**:
  - `init()` - 게임 초기화
  - `start()` - 게임 시작
  - `update()` - 게임 루프 업데이트
  - `changeScene(sceneName)` - 씬 전환
- **의존성**: `GameState`, `LevelManager`, `ScoringSystem`, `LifeManager`, 모든 Scene

#### core/GameState.js
- **목적**: 게임 상태 머신
- **주요 메서드**:
  - `setState(state)` - 상태 변경
  - `getState()` - 현재 상태 반환
  - `isState(state)` - 상태 확인
- **상태**: `START`, `LEVEL_LOAD`, `PLAY`, `JUDGE`, `GAME_OVER`

#### core/LevelManager.js
- **목적**: 레벨 관리
- **주요 메서드**:
  - `loadLevel(level)` - 레벨 로드
  - `nextLevel()` - 다음 레벨로 진행
  - `getCurrentLevel()` - 현재 레벨 반환
- **의존성**: `utils/levelUtils.js`, `ConfigManager`

#### core/ScoringSystem.js
- **목적**: 점수 계산 및 관리
- **주요 메서드**:
  - `calculateScore(level, oddCount, timeElapsed)` - 점수 계산
  - `addScore(score)` - 점수 추가
  - `getScore()` - 현재 점수 반환
- **의존성**: `utils/scoring.js`, `ConfigManager`

#### core/LifeManager.js
- **목적**: 목숨 관리
- **주요 메서드**:
  - `loseLife()` - 목숨 차감
  - `getLives()` - 현재 목숨 반환
  - `reset()` - 목숨 초기화
- **의존성**: `ConfigManager`

#### scenes/BaseScene.js
- **목적**: 씬 기본 클래스
- **주요 메서드**:
  - `init()` - 씬 초기화
  - `show()` - 씬 표시
  - `hide()` - 씬 숨김
  - `destroy()` - 씬 정리
- **의존성**: PixiJS `Container`

#### scenes/TitleScene.js
- **목적**: 타이틀 화면
- **구성 요소**:
  - 타이틀 텍스트
  - "Start Game" 버튼
- **이벤트**: 버튼 클릭 시 게임 시작

#### scenes/GameScene.js
- **목적**: 게임 플레이 화면
- **구성 요소**:
  - `Grid` 컴포넌트 (타일 배치)
  - `HUD` 컴포넌트 (게임 상태 표시)
  - "OK" 버튼
- **주요 메서드**:
  - `generateLevel()` - 레벨 생성
  - `onTileSelect(tile)` - 타일 선택 처리
  - `submitAnswer()` - 답안 제출
  - `judgeAnswer()` - 답안 판정

#### scenes/GameOverScene.js
- **목적**: 게임 종료 화면
- **구성 요소**:
  - 최종 점수 표시
  - 최고 점수 표시
  - "Restart" 버튼
- **의존성**: `StorageManager`

#### components/Tile.js
- **목적**: 개별 타일 컴포넌트
- **속성**:
  - `color` - 타일 색상 (RGB)
  - `isOdd` - 다른 색상 여부
  - `isSelected` - 선택 상태
- **이벤트**: 클릭 시 선택/해제

#### components/Button.js
- **목적**: 재사용 가능한 버튼
- **속성**:
  - `text` - 버튼 텍스트
  - `onClick` - 클릭 핸들러
- **스타일**: 레트로 스타일 적용

#### components/HUD.js
- **목적**: 게임 상태 표시
- **표시 항목**:
  - 현재 레벨
  - 현재 점수
  - 목숨 개수
  - 타이머 (시간 보너스용)

#### components/Grid.js
- **목적**: 타일 그리드 컨테이너
- **주요 메서드**:
  - `createTiles(colors, oddIndices)` - 타일 생성
  - `shuffle()` - 타일 무작위 배치
  - `getSelectedTiles()` - 선택된 타일 반환

#### managers/ConfigManager.js
- **목적**: 설정 파일 관리
- **주요 메서드**:
  - `load()` - config.json 로드
  - `get(path)` - 설정 값 조회
- **싱글톤**: 전역 단일 인스턴스

#### managers/AudioManager.js
- **목적**: 오디오 재생 관리
- **주요 메서드**:
  - `play(soundName)` - 효과음 재생
  - `setVolume(volume)` - 볼륨 설정
- **의존성**: Howler.js

#### managers/StorageManager.js
- **목적**: LocalStorage 관리
- **주요 메서드**:
  - `saveHighScore(score)` - 최고 점수 저장
  - `getHighScore()` - 최고 점수 로드

#### managers/InputManager.js
- **목적**: 입력 처리
- **주요 메서드**:
  - `onClick(callback)` - 클릭 이벤트 등록
  - `onTouch(callback)` - 터치 이벤트 등록
- **기능**: 마우스/터치 통합 처리

#### utils/levelUtils.js
- **목적**: 레벨 계산 함수
- **주요 함수**:
  - `deltaFor(level)` - RGB 차이값 계산
  - `oddCountFor(level)` - 다른 색상 타일 개수 계산
  - `gridFor(level)` - 그리드 크기 계산
- **의존성**: `ConfigManager`, `utils/math.js`

#### utils/color.js
- **목적**: 색상 생성 및 조작
- **주요 함수**:
  - `generateBaseColor()` - 기본 색상 생성
  - `generateOddColor(baseColor, delta)` - 다른 색상 생성
  - `rgbToHex(r, g, b)` - RGB를 Hex로 변환
- **의존성**: `ConfigManager`

#### utils/math.js
- **목적**: 수학 함수
- **주요 함수**:
  - `lerp(start, end, t)` - 선형 보간
  - `clamp(value, min, max)` - 값 제한
  - `random(min, max)` - 랜덤 값 생성

#### utils/scoring.js
- **목적**: 점수 계산 유틸리티
- **주요 함수**:
  - `calculateBaseScore(level)` - 기본 점수 계산
  - `calculateTimeBonus(timeElapsed)` - 시간 보너스 계산
  - `calculateTotalScore(base, oddBonus, timeBonus)` - 총 점수 계산

---

## 6. 시스템 아키텍처 (System Architecture)

### 6.1 기술 스택

#### 기술 구성표

| 항목 | 기술 | 용도 |
|------|------|------|
| 프로그래밍 언어 | JavaScript (ES6+) | 핵심 게임 로직 |
| 렌더링 라이브러리 | PixiJS | Canvas 기반 2D 렌더링 |
| 오디오 라이브러리 | Howler.js | 효과음 재생 |
| 빌드 도구 | Vite | 개발 환경 및 빌드 |
| 배포 | GitHub Pages | 정적 웹 호스팅 |
| 데이터 저장소 | LocalStorage | 점수 기록 저장 |

### 6.2 게임 상태 관리

#### 상태 다이어그램

```
START → LEVEL_LOAD → PLAY → JUDGE → (정답: LEVEL_LOAD / 오답: GAME_OVER)
                                      ↓
                                   GAME_OVER → (Restart: START)
```

#### 상태 상세

1. **START**: 타이틀 화면, Start 버튼 표시
2. **LEVEL_LOAD**: 현재 레벨 설정 로드, 그리드 및 색상 생성
3. **PLAY**: 플레이어 타일 선택 대기
4. **JUDGE**: OK 버튼 클릭 후 답안 검증
   - 정답: 점수 계산 → 다음 레벨 (LEVEL_LOAD)
   - 오답: 목숨 차감 → 목숨 > 0이면 LEVEL_LOAD, 목숨 = 0이면 GAME_OVER
5. **GAME_OVER**: 최종 점수 표시, 재시작 옵션 제공

---

## 7. 데이터 구조 (Data Structures)

### 7.1 설정 파일 구조 (config.json)

```json
{
  "lives": 3,
  "scoring": {
    "basePerLevel": 100,
    "perOddTileBonus": 25,
    "timeBonus": {
      "enabled": true,
      "perSecond": 5,
      "cap": 300
    },
    "wrongPenalty": 0
  },
  "deltaSchedule": [
    { "range": [1, 20], "start": 100, "end": 30, "easing": "linear" },
    { "range": [21, 30], "start": 30, "end": 20, "easing": "linear" },
    { "range": [31, 40], "start": 20, "end": 10, "easing": "linear" }
  ],
  "oddTileSchedule": [
    { "range": [1, 20], "count": 1 },
    { "range": [21, 30], "count": 2 },
    { "range": [31, 40], "count": 4 }
  ],
  "gridSchedule": [
    { "range": [1, 5], "cols": 3, "rows": 3 },
    { "range": [6, 10], "cols": 3, "rows": 4 },
    { "range": [11, 20], "cols": 4, "rows": 4 },
    { "range": [21, 35], "cols": 5, "rows": 5 },
    { "range": [36, 40], "cols": 6, "rows": 5 }
  ],
  "timing": {
    "bonusClockPerLevelSec": 15,
    "tickHz": 60
  },
  "color": {
    "baseLumaClamp": [40, 215],
    "channelsToVary": "auto",
    "colorBlindSafe": false
  },
  "ui": {
    "retro": true,
    "confirmCommit": true
  }
}
```

### 7.2 설정 파일 필드 설명

#### lives
- **타입**: number
- **설명**: 게임 시작 시 목숨 개수

#### scoring
- **basePerLevel**: 레벨별 기본 점수
- **perOddTileBonus**: 다른 색상 타일 개수당 추가 점수
- **timeBonus**: 시간 보너스 설정
  - **enabled**: 시간 보너스 활성화 여부
  - **perSecond**: 초당 보너스 점수
  - **cap**: 최대 보너스 점수 상한
- **wrongPenalty**: 오답 시 감점 (현재 0)

#### deltaSchedule
- **타입**: Array
- **설명**: 레벨 범위별 RGB 차이값 스케줄
- **필드**:
  - **range**: [시작 레벨, 종료 레벨]
  - **start**: 범위 시작 시 RGB 차이값
  - **end**: 범위 종료 시 RGB 차이값
  - **easing**: 보간 방식 (현재 "linear")

#### oddTileSchedule
- **타입**: Array
- **설명**: 레벨 범위별 다른 색상 타일 개수

#### gridSchedule
- **타입**: Array
- **설명**: 레벨 범위별 그리드 크기
- **필드**:
  - **range**: [시작 레벨, 종료 레벨]
  - **cols**: 열 개수
  - **rows**: 행 개수

#### timing
- **bonusClockPerLevelSec**: 레벨당 보너스 계산 기준 시간(초)
- **tickHz**: 렌더링 주기 (Hz)

#### color
- **baseLumaClamp**: 기본 색상 밝기 범위 [최소, 최대]
- **channelsToVary**: RGB 채널 조정 방식 ("auto" 또는 "manual")
- **colorBlindSafe**: 색맹 안전 모드 활성화 여부

#### ui
- **retro**: 레트로 스타일 활성화
- **confirmCommit**: OK 버튼 확인 필요 여부

---

## 8. 기능 우선순위 요약

| 기능 ID | 기능명 | 우선순위 | 상태 |
|---------|--------|----------|------|
| REQ-001 | 시작 화면 | 높음 (★★★) | - |
| REQ-002 | 레벨 로딩 | 높음 (★★★) | - |
| REQ-003 | 타일 선택 | 높음 (★★★) | - |
| REQ-004 | 답안 제출 및 판정 | 높음 (★★★) | - |
| REQ-005 | 점수 시스템 | 높음 (★★★) | - |
| REQ-006 | 목숨 시스템 | 높음 (★★★) | - |
| REQ-007 | 게임 종료 | 중간 (★★☆) | - |
| REQ-008 | 레벨 난이도 설정 | 높음 (★★★) | - |
| REQ-009 | 동적 난이도 계산 | 중간 (★★☆) | - |
| REQ-010 | 색상 생성 알고리즘 | 높음 (★★★) | - |
| REQ-011 | 레트로 UI 스타일 | 중간 (★★☆) | - |
| REQ-012 | 게임 상태 표시 | 높음 (★★★) | - |
| REQ-013 | 효과음 | 낮음 (★☆☆) | - |

---

## 9. 향후 확장 계획 (Future Expansion)

### 9.1 예정 기능

- **REQ-101**: 색맹 친화 모드 (Color-Blind Palette)
- **REQ-102**: 사각형이 아닌 다른 도형 추가
- **REQ-103**: 무한 도전 모드

---

## 10. 개발 참고사항 (Developer Notes)

### 10.1 설계 원칙

1. **설정 기반 동작**: 모든 난이도/색상 차이/그리드 설정은 `config.json` 기반으로 동작해야 함
2. **런타임 반영**: 코어 함수(`deltaFor`, `oddCountFor`, `gridFor`)는 설정 변경 시 재빌드 없이 반영되도록 구현
3. **확장성 고려**: easing 함수, stage theme, palette 등을 향후 확장 가능하도록 모듈화 설계

### 10.2 핵심 함수 명세

#### deltaFor(level: number): number
- **입력**: 레벨 번호
- **출력**: 해당 레벨의 RGB 차이값
- **로직**: `deltaSchedule` 배열을 순회하여 범위에 해당하는 레벨의 선형 보간값 반환

#### oddCountFor(level: number): number
- **입력**: 레벨 번호
- **출력**: 해당 레벨의 다른 색상 타일 개수
- **로직**: `oddTileSchedule` 배열에서 레벨 범위에 해당하는 count 값 반환

#### gridFor(level: number): { cols: number, rows: number }
- **입력**: 레벨 번호
- **출력**: 그리드 크기 객체
- **로직**: `gridSchedule` 배열에서 레벨 범위에 해당하는 cols, rows 반환

### 10.3 작업 진행 방식

1. **진행 상황 추적**: 모든 작업은 `PROGRESS.md`에 기록
2. **Phase별 작업**: 각 Phase를 순차적으로 진행하며 완료 후 다음 Phase로 진행
3. **작업 업데이트**: 작업 시작 시, 완료 시, 블로커 발생 시 `PROGRESS.md` 업데이트 필수
4. **문서 동기화**: `plan.md`의 변경사항이 있으면 `PROGRESS.md`도 함께 업데이트

---

## 11. 용어 정의 (Glossary)

- **RGB Δ (Delta)**: 기본 색상과 다른 색상 간의 RGB 값 차이
- **Odd Tile**: 다른 색상을 가진 타일
- **Linear Interpolation**: 선형 보간, 두 값 사이를 균등하게 나누는 방식
- **Luma**: 색상의 밝기 (Luminance)

---

## 부록 (Appendix)

### A. 참고 자료
- PixiJS 공식 문서: https://pixijs.com/
- Howler.js 공식 문서: https://howlerjs.com/
- Vite 공식 문서: https://vitejs.dev/

---

**문서 종료**