# Tint Tap

신중하게 다른 색을 찾아내는 레트로 감성 컬러 퍼즐 프로젝트입니다. `plan.md`에 정의된 단계별 계획을 따라 구현을 진행하며, 각 Phase별 진행 상황은 `PROGRESS.md`에서 확인할 수 있습니다.

## Phase 0 준비 현황

- 계획서 검토 및 핵심 요구사항 파악 완료
- 프로젝트 기본 구조(index.html, src/, config.json) 구성
- 실행 및 개발 가이드 문서화 (본 문서)

이제 Phase 1(코어 게임 플레이) 작업을 순차적으로 진행할 준비가 되어 있습니다.

## 실행 방법

정적 파일 형태로 제공되므로 간단한 HTTP 서버를 통해 실행할 수 있습니다.

```bash
python -m http.server 8000
```

서버 실행 후 브라우저에서 `http://localhost:8000`으로 접속하면 현재까지 구현된 Tint Tap 빌드를 확인할 수 있습니다.

## 참고 문서

- [plan.md](plan.md): 전체 구현 계획과 요구사항 목록
- [PROGRESS.md](PROGRESS.md): Phase별 진행 현황 및 체크리스트
