# 게임 기믹 및 보스 시스템 설계 문서

## 1. 개요 (Overview)

### 1.1 컨셉
특정 라운드 이후부터 확률적으로 발생하는 게임 기믹들입니다. 게임이 너무 루즈해지는 것을 방지하고 긴장감을 유지하기 위한 메커니즘입니다.

**핵심 컨셉**: 기믹이 발생할 때마다 **도트로 된 캐릭터(보스)**가 나타나서 플레이어를 방해하는 장난을 칩니다. 플레이어는 레벨을 클리어하면서 이 보스에게 데미지를 주고, 결국 보스를 무찌르는 것이 최종 목표입니다.

### 1.2 설정 파일 참조
모든 기믹 및 보스 시스템 설정은 `config.json` 파일에서 관리됩니다. 이 문서의 모든 설정값은 `config.json`의 값을 참고하여 구현됩니다.

**주요 설정 경로:**
- 기믹 설정: `config.gimmicks.*`
- 보스 설정: `config.boss.*`
- 레벨 설정: `config.levels.*`

---

## 2. 기믹 시스템 (Gimmick System)

### 2.1 기믹 발생 메커니즘

#### 기믹 발생 조건
- **시작 레벨**: `config.gimmicks.startLevel` (기본값: 20)
- **발생 확률**: `config.gimmicks.probability` (기본값: 0.3)
- **동시 발생 제한**: `config.gimmicks.singleActive` (기본값: true) - 한번에 하나의 기믹만 활성화

---

### 2.2 기믹 1: 타일 순서 뒤섞기 (Shuffle)

#### 설명
`config.gimmicks.gimmicks[].interval` (기본값: 10초)마다 타일의 순서를 뒤섞습니다.

#### 난이도별 구현
- **초반**: 가로 한 줄, 세로 한 줄씩 뒤섞기
- **중반**: 가로 2줄, 세로 2줄 또는 가로와 세로를 섞어서 뒤섞기
- **후반**: 모든 타일을 완전히 무작위로 뒤섞기

#### 난이도 구간 설정
- `config.gimmicks.gimmicks[].difficultyRanges` 배열로 레벨 구간별 난이도 설정
- 각 구간은 `range` (레벨 범위)와 `intensity` (난이도 값)를 가짐

#### 설정 (config.json)
```json
{
  "name": "shuffle",
  "enabled": true,
  "difficultyRanges": [
    { "range": [20, 40], "intensity": "easy", "interval": 12 },
    { "range": [41, 70], "intensity": "medium", "interval": 10 },
    { "range": [71, 100], "intensity": "hard", "interval": 7 }
  ]
}
```

---

### 2.3 기믹 2: 타일 숨기기 (Hide)

#### 설명
`config.gimmicks.gimmicks[].interval` (기본값: 15초)마다 일부 타일을 숨깁니다. 숨겨진 타일도 클릭은 가능하지만 시각적으로 보이지 않습니다.

#### 동작 방식
- `config.gimmicks.gimmicks[].count` 범위 내에서 무작위로 타일 숨김
- 설정된 interval이 지나면 숨겨진 타일이 다시 나타남
- 동시에 다른 타일들이 숨겨짐 (새로운 패턴)

#### 난이도 구간 설정
- 레벨에 따라 숨기는 타일 수와 빈도가 달라짐

#### 설정 (config.json)
```json
{
  "name": "hide",
  "enabled": true,
  "difficultyRanges": [
        { "range": [20, 40], "count": [1, 2], "interval": 6 },
        { "range": [41, 70], "count": [1, 3], "interval": 4 },
        { "range": [71, 100], "count": [2, 5], "interval": 3 }
  ]
}
```

---

### 2.4 기믹 3: 타일 흐름 애니메이션 (Flow)

#### 설명
타일이 화면을 흐르는 애니메이션 효과입니다.

#### 종류

##### 3-1: 수직 흐름 (Vertical Flow)
- 타일이 위에서 천천히 내려옴
- 화면을 넘어가면 다시 위에서 시작
- 연속적인 흐름 효과

##### 3-2: 수평 흐름 (Horizontal Flow)
- 타일이 왼쪽에서 오른쪽으로 흐름
- 화면을 넘어가면 다시 왼쪽에서 시작
- 연속적인 흐름 효과

#### 난이도 구간 설정
- 레벨에 따라 흐름 속도와 방향이 달라질 수 있음

#### 설정 (config.json)
```json
{
  "name": "flow",
  "enabled": true,
  "difficultyRanges": [
    { "range": [20, 50], "direction": "vertical", "speed": 1.0 },
    { "range": [51, 80], "direction": ["vertical", "horizontal"], "speed": 1.8 },
    { "range": [81, 100], "direction": ["vertical", "horizontal"], "speed": 2.5 }
  ]
}
```

---

### 2.5 기믹 4: 색상 페이드/깜빡임 (Fade/Blink)

#### 설명
일부 타일이 페이드 인/아웃되거나 깜빡이는 효과입니다.

#### 동작 방식
- 타일이 서서히 페이드 인/아웃
- 짧은 깜빡임으로 주의를 분산시킴
- 레벨이 올라갈수록 빈도와 속도가 증가

#### 난이도 구간 설정
- 레벨에 따라 페이드 속도와 빈도가 달라짐

#### 설정 (config.json)
```json
{
  "name": "fade",
  "enabled": true,
  "difficultyRanges": [
    { "range": [20, 50], "speed": 0.5, "frequency": 2.0, "affectedTiles": 2 },
    { "range": [51, 80], "speed": 1.2, "frequency": 3.5, "affectedTiles": 4 },
    { "range": [81, 100], "speed": 2.0, "frequency": 5.0, "affectedTiles": 6 }
  ]
}
```

---

### 2.6 기믹 5: 타일 회전 (Rotation)

#### 설명
타일이 회전하는 효과입니다.

#### 동작 방식
- 타일이 90도 또는 180도 회전
- 회전 중에도 클릭 가능
- 회전 속도는 레벨에 따라 조절

#### 난이도 구간 설정
- 레벨에 따라 회전 각도와 속도가 달라짐

#### 설정 (config.json)
```json
{
  "name": "rotation",
  "enabled": true,
  "difficultyRanges": [
    { "range": [20, 50], "angle": [90], "speed": 1.0, "affectedTiles": 2 },
    { "range": [51, 80], "angle": [90, 180], "speed": 1.8, "affectedTiles": 4 },
    { "range": [81, 100], "angle": [180, 270], "speed": 2.5, "affectedTiles": 6 }
  ]
}
```

---

### 2.7 기믹 6: 미러/반전 효과 (Mirror/Flip)

#### 설명
그리드 전체가 좌우 또는 상하로 반전되는 효과입니다.

#### 동작 방식
- 그리드 전체가 짧은 시간 동안 반전됨
- 반전 전후의 색상 위치를 기억해야 함
- 반전 시간은 레벨에 따라 짧아짐

#### 난이도 구간 설정
- 레벨에 따라 반전 지속 시간과 방향이 달라짐

#### 설정 (config.json)
```json
{
  "name": "mirror",
  "enabled": true,
  "difficultyRanges": [
    { "range": [20, 50], "direction": ["horizontal"], "duration": 2500 },
    { "range": [51, 80], "direction": ["horizontal", "vertical"], "duration": 1500 },
    { "range": [81, 100], "direction": ["horizontal", "vertical"], "duration": 800, "frequency": 2 }
  ]
}
```

---

### 2.8 기믹 7: 타일 크기 변화 (Size Change)

#### 설명
일부 타일이 주기적으로 크기가 변하는 효과입니다.

#### 동작 방식
- 타일이 0.8배에서 1.2배 사이로 크기 변화
- 작은 타일은 클릭하기 어려워짐
- 큰 타일은 눈에 띄지만 다른 타일을 가릴 수 있음

#### 난이도 구간 설정
- 레벨에 따라 크기 변화 범위와 속도가 달라짐

#### 설정 (config.json)
```json
{
  "name": "size",
  "enabled": true,
  "difficultyRanges": [
    { "range": [20, 50], "sizeRange": [0.9, 1.1], "speed": 1.0, "affectedTiles": 2 },
    { "range": [51, 80], "sizeRange": [0.8, 1.2], "speed": 1.8, "affectedTiles": 4 },
    { "range": [81, 100], "sizeRange": [0.6, 1.4], "speed": 2.5, "affectedTiles": 6 }
  ]
}
```

---

### 2.9 기믹 8: 그림자/블러 효과 (Shadow/Blur)

#### 설명
타일 주변에 그림자나 블러 효과를 추가하는 기믹입니다.

#### 동작 방식
- 타일 주변에 그림자 추가로 깊이감 연출
- 일부 타일에 블러 효과 적용 (난이도 상승)
- 선택된 타일만 선명하게 표시

#### 난이도 구간 설정
- 레벨에 따라 블러 강도와 영향받는 타일 수가 달라짐

#### 설정 (config.json)
```json
{
  "name": "shadow",
  "enabled": true,
  "difficultyRanges": [
    { "range": [20, 50], "blurIntensity": 2, "affectedTiles": 2 },
    { "range": [51, 80], "blurIntensity": 5, "affectedTiles": 5 },
    { "range": [81, 100], "blurIntensity": 8, "affectedTiles": 8 }
  ]
}
```

---

## 3. 보스 시스템 (Boss System)

### 3.1 보스전 시작

#### 시작 조건
- **보스전 시작 레벨**: `config.boss.startLevel` (기본값: 80)
- 80레벨부터 보스전이 시작됩니다
- 보스의 HP 바가 화면에 표시됩니다

#### HP 시스템
- **보스 최대 HP**: `config.boss.maxHP` (기본값: 20)
- **레벨당 데미지**: `config.boss.damagePerLevel` (기본값: 1)
- 80레벨부터 100레벨까지 = 20레벨 = 20 데미지

### 3.2 레벨 클리어 시 데미지

#### 데미지 처리
- 레벨을 클리어할 때마다 보스에게 데미지를 줍니다
- 데미지 애니메이션 및 효과음 재생
- 보스의 HP가 감소하는 시각적 피드백
- HP 바가 업데이트됩니다

#### 시각적 표현
- **도트 캐릭터**: 레트로 픽셀 아트 스타일의 작은 캐릭터
- **HP 바**: 보스의 체력을 표시하는 바 (`config.boss.showHPBar`)
- **데미지 효과**: 레벨 클리어 시 보스가 데미지를 받는 애니메이션
- **보스 스프라이트**: `config.boss.showBossSprite`로 표시 여부 제어

### 3.3 보스 처치

#### 최종 레벨 클리어
- **보스 처치 레벨**: `config.boss.defeatLevel` (기본값: 100)
- 100레벨 클리어 시 보스를 무찌르는 특별한 애니메이션
- 보스 처치 효과 및 승리 메시지
- 특별한 엔딩 화면 표시

#### 애니메이션
- 보스가 무너지는 애니메이션
- 승리 효과음 및 시각적 효과
- 최종 점수 및 통계 표시

---

## 4. 설정 구조 (config.json)

### 4.1 기믹 설정
```json
"gimmicks": {
  "enabled": true,
  "startLevel": 20,
  "probability": 0.3,
  "singleActive": true,
  "gimmicks": [
    {
      "name": "shuffle",
      "enabled": true,
      "difficultyRanges": [
        { "range": [20, 40], "intensity": "easy", "interval": 12 },
        { "range": [41, 70], "intensity": "medium", "interval": 10 },
        { "range": [71, 100], "intensity": "hard", "interval": 7 }
      ]
    },
    {
      "name": "hide",
      "enabled": true,
      "difficultyRanges": [
        { "range": [20, 40], "count": [1, 2], "interval": 10 },
        { "range": [41, 70], "count": [1, 3], "interval": 8 },
        { "range": [71, 100], "count": [2, 5], "interval": 6 }
      ]
    },
    {
      "name": "flow",
      "enabled": true,
      "difficultyRanges": [
        { "range": [20, 50], "direction": "vertical", "speed": 1.0 },
        { "range": [51, 80], "direction": ["vertical", "horizontal"], "speed": 1.8 },
        { "range": [81, 100], "direction": ["vertical", "horizontal"], "speed": 2.5 }
      ]
    },
    {
      "name": "fade",
      "enabled": true,
      "difficultyRanges": [
        { "range": [20, 50], "speed": 0.5, "frequency": 2.0, "affectedTiles": 2 },
        { "range": [51, 80], "speed": 1.2, "frequency": 3.5, "affectedTiles": 4 },
        { "range": [81, 100], "speed": 2.0, "frequency": 5.0, "affectedTiles": 6 }
      ]
    },
    {
      "name": "rotation",
      "enabled": true,
      "difficultyRanges": [
        { "range": [20, 50], "angle": [90], "speed": 1.0, "affectedTiles": 2 },
        { "range": [51, 80], "angle": [90, 180], "speed": 1.8, "affectedTiles": 4 },
        { "range": [81, 100], "angle": [180, 270], "speed": 2.5, "affectedTiles": 6 }
      ]
    },
    {
      "name": "mirror",
      "enabled": true,
      "difficultyRanges": [
        { "range": [20, 50], "direction": ["horizontal"], "duration": 2500 },
        { "range": [51, 80], "direction": ["horizontal", "vertical"], "duration": 1500 },
        { "range": [81, 100], "direction": ["horizontal", "vertical"], "duration": 800, "frequency": 2 }
      ]
    },
    {
      "name": "size",
      "enabled": true,
      "difficultyRanges": [
        { "range": [20, 50], "sizeRange": [0.9, 1.1], "speed": 1.0, "affectedTiles": 2 },
        { "range": [51, 80], "sizeRange": [0.8, 1.2], "speed": 1.8, "affectedTiles": 4 },
        { "range": [81, 100], "sizeRange": [0.6, 1.4], "speed": 2.5, "affectedTiles": 6 }
      ]
    },
    {
      "name": "shadow",
      "enabled": true,
      "difficultyRanges": [
        { "range": [20, 50], "blurIntensity": 2, "affectedTiles": 2 },
        { "range": [51, 80], "blurIntensity": 5, "affectedTiles": 5 },
        { "range": [81, 100], "blurIntensity": 8, "affectedTiles": 8 }
      ]
    }
  ]
}
```

### 4.2 보스 설정
```json
"boss": {
  "enabled": true,
  "startLevel": 80,
  "defeatLevel": 100,
  "maxHP": 20,
  "damagePerLevel": 1,
  "showHPBar": true,
  "showBossSprite": true,
  "animationDuration": 1000
}
```

### 4.3 설정 값 설명

#### 기믹 설정
- **enabled**: 기믹 시스템 활성화 여부
- **startLevel**: 기믹이 시작되는 레벨 (기본값: 20)
- **probability**: 기믹 발생 확률 (0.0 ~ 1.0, 기본값: 0.3)
- **singleActive**: 한번에 하나의 기믹만 활성화 여부 (기본값: true)
- **gimmicks[].enabled**: 개별 기믹 활성화 여부
- **gimmicks[].interval**: 기믹 발생 주기 (초 단위)
- **gimmicks[].difficultyRanges**: 레벨 구간별 난이도 설정 배열
  - **range**: 레벨 범위 [시작, 끝]
  - 각 기믹별로 고유한 난이도 파라미터 설정 가능 (intensity, count, speed, angle, duration 등)

#### 보스 설정
- **enabled**: 보스 시스템 활성화 여부
- **startLevel**: 보스전이 시작되는 레벨 (기본값: 80)
- **defeatLevel**: 보스를 처치하는 레벨 (기본값: 100)
- **maxHP**: 보스의 최대 체력 (기본값: 20)
- **damagePerLevel**: 레벨 클리어당 데미지 (기본값: 1)
- **showHPBar**: HP 바 표시 여부
- **showBossSprite**: 보스 스프라이트 표시 여부
- **animationDuration**: 데미지 애니메이션 지속 시간 (ms)

---

## 5. 구현 계획

### 5.1 구현 우선순위

#### Phase 1: 기본 기믹 시스템
1. **기믹 1 (Shuffle)** - 가장 기본적이고 구현이 상대적으로 쉬움
2. **기믹 2 (Hide)** - 게임플레이에 큰 영향을 주는 기믹
3. **기믹 3 (Flow)** - 시각적 효과가 큰 기믹

#### Phase 2: 추가 기믹
4. **기믹 4~8** - 추가 효과 기믹들

#### Phase 3: 보스 시스템
5. **도트 캐릭터 애니메이션** - 기믹 발생 시 캐릭터 표시
6. **보스 HP 시스템** - 80레벨부터 HP 바 및 데미지 처리
7. **보스 처치 애니메이션** - 100레벨 클리어 시 특별 애니메이션

### 5.2 기술적 고려사항

#### 기믹 시스템
- 기믹은 레벨에 따라 확률적으로 발생 (`config.gimmicks.probability`)
- `config.gimmicks.singleActive`가 true일 경우 한번에 하나의 기믹만 활성화
- 각 기믹은 `difficultyRanges` 배열을 통해 레벨 구간별 난이도 설정 가능
- 기믹 발생 시 시각적/청각적 피드백 제공
- 기믹이 게임의 핵심 메커니즘(색상 구분)을 방해하지 않도록 주의

#### 보스 시스템
- 도트 캐릭터는 레트로 픽셀 아트 스타일로 구현
- HP 바는 80레벨부터 표시 (`config.boss.startLevel`)
- 레벨 클리어 시 데미지 처리 및 애니메이션
- 100레벨 클리어 시 보스 처치 애니메이션 (`config.boss.defeatLevel`)

#### 설정 파일 관리
- 모든 설정값은 `config.json`에서 관리
- 설정 변경 시 재빌드 없이 반영 가능
- 각 설정값의 기본값 및 범위 명확히 정의

