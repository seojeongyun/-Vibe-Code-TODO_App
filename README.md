# Vibe-Coded TODO App

## Overview

웹 개발 경험이 거의 없는 상태에서 **AI-assisted Vibe Coding 방식으로 구현한 TODO Web Application**입니다.

React, TypeScript 등의 기술을 직접 깊게 학습한 뒤 구현하기보다, 원하는 기능과 UI를 정의하고 AI Coding Agent와 반복적으로 요구사항을 조정하며 애플리케이션을 개발했습니다.

따라서 본 프로젝트는 Web Development 역량보다는 **AI Coding Tool을 활용해 익숙하지 않은 기술 영역의 아이디어를 실제 Application으로 구현해본 경험**에 초점을 두고 있습니다.

---

## Features

* 날짜별 TODO 생성 및 관리
* TODO 완료 여부 및 달성도 기록
* 월간 Calendar 기반 날짜 선택
* GitHub-style Heatmap을 통한 일별 달성도 시각화
* IndexedDB를 활용한 Local Data 저장
* 별도의 Backend / Login 없이 동작하는 개인용 TODO App

---

## Development Flow

```text
Define Requirements
        │
        ▼
AI Coding Agent
        │
        ▼
Generate / Modify Code
        │
        ▼
Run & Test
        │
        ▼
Refine Requirements
        │
        └────── Repeat
```

코드의 상당 부분은 AI Coding Agent를 통해 생성했으며, 저는 **기능 정의, 요구사항 수정, 결과 확인 및 반복적인 개선**을 중심으로 프로젝트를 진행했습니다.

---

## Architecture

```text
User
 │
 ▼
React + TypeScript
 │
 ├── Calendar
 ├── TODO List
 └── Heatmap
 │
 ▼
IndexedDB
 │
 ▼
Local Data
```

---

## Repository Structure

```text
-Vibe-Code-TODO_App/
│
├── apps/
│   └── web/                # Web Application
│
├── docs/                   # Documentation
│
├── AGENTS.md               # AI Coding Agent instructions
├── ARCHITECTURE.md         # Architecture
├── DATA_MODEL.md           # Data model
├── DEPLOYMENT.md           # Deployment
├── PRD.md                  # Product requirements
├── ROADMAP.md              # Development roadmap
├── UI_SPEC.md              # UI specification
│
└── README.md
```

---

## Notes

이 프로젝트는 React / TypeScript Web Development를 직접 구현하고 숙련하기 위한 프로젝트가 아니라, **Vibe Coding을 경험하고 AI Coding Agent를 활용해 실제 동작하는 Software를 만들어보기 위한 실험 프로젝트**입니다.

React, TypeScript, IndexedDB 등의 세부 구현은 AI가 생성한 코드에 크게 의존했습니다.

---

## Tech Stack

`React` · `TypeScript` · `Vite` · `IndexedDB` · `AI Coding Agent` · `Vibe Coding`
