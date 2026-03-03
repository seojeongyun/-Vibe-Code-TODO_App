# AGENTS.md

## 1. 전역 설치 금지 (절대 준수)

- Codex CLI 외 전역 설치 금지
- `npm install -g` 사용 금지
- Python 전역 pip 설치 금지
- 시스템 경로 수정 금지 (/usr/local, /opt/homebrew 등)

Node 의존성:
- `npm install <pkg>` 로만 설치
- node_modules 내부에만 존재해야 함

Python 사용 시:
- 프로젝트 내부 .venv 필수
- python3 -m venv .venv
- source .venv/bin/activate
- 전역 site-packages 사용 금지

---

## 2. 제품 정의 (변경 금지)

### 날짜 처리
- Asia/Seoul 기준
- 저장 형식: YYYY-MM-DD

### 하루 달성도 계산
- 해당 날짜 TODO들의 완료 퍼센트 평균
- 완료 안 된 TODO는 0%
- TODO가 없으면 달성도는 null

### Heatmap 구간
- 0%
- 1~19%
- 20~39%
- 40~59%
- 60~79%
- 80~100%
총 6단계

---

## 3. UI 구조 고정

첫 화면:
- 상단: 월간 캘린더 + 좌우 월 이동 버튼
- 하단: GitHub 잔디형 heatmap (일 단위)

날짜 클릭:
- 해당 날짜 TODO 화면으로 이동
- y축: 할 일 목록
- x축: 시간 / 완료 여부 / 완료 percentage

---

## 4. 개발 원칙

- 가장 단순한 구조 우선
- 로컬 저장 기반 MVP
- 로그인/클라우드 제외
- Android 확장 고려 구조

---

## 5. 작업 전 원칙

- 새로운 의존성 추가 전 이유 설명
- runtime / devDependency 구분 설명
- 실행 명령 제시

# Global Agent Rules (User)

## 언어
- 모든 설명/요약/진행상황/결과 보고는 **반드시 한국어**로 작성한다.
- 코드, 에러 로그, 파일/명령어 출력은 원문(영어) 그대로 두되, 바로 아래에 한국어로 해설을 붙인다.

## 출력 형식
- 매 응답의 첫 줄에 한 줄 요약(한국어) 후, 필요 시 bullet로 상세를 쓴다.
- 모호하면 추측하지 말고, 필요한 파일/근거를 먼저 확인한 뒤 한국어로 설명한다.

## Backup Restore (2026-02-27 MVP)
- tag: v0.1.0-mvp
- branch: backup/mvp-2026-02-27
- restore branch: git switch backup/mvp-2026-02-27
- restore tag: git switch --detach v0.1.0-mvp
- back to main: git switch main && git pull