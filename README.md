# Vibe-Coded TODO App

## Overview

웹 프론트엔드 개발 경험이 거의 없는 상태에서 **AI-assisted Vibe Coding 방식으로 구현한 TODO Web Application**입니다.

React, TypeScript, IndexedDB 등의 기술을 직접 학습한 뒤 전통적인 방식으로 처음부터 구현하는 대신,  
원하는 기능과 UI, 데이터 구조를 문서로 정의하고 AI Coding Agent와 반복적으로 요구사항을 조정하며 애플리케이션을 개발했습니다.

이 프로젝트의 목적은 Web Development 자체의 숙련도를 보여주는 것보다,

> **익숙하지 않은 기술 영역에서도 요구사항을 구조화하고, AI Coding Tool을 활용하여 실제 동작하는 Software를 빠르게 구현할 수 있는지 실험하는 것**

에 있습니다.

따라서 본 Repository의 코드는 대부분 **Vibe Coding / AI-assisted Development**를 통해 생성 및 수정되었으며,  
React / TypeScript / IndexedDB 등의 내부 구현을 모두 직접 작성하거나 깊이 이해한 프로젝트는 아닙니다.

---

## Project Goal

macOS와 iPhone의 Browser에서 사용할 수 있는 개인용 TODO Application을 만드는 것을 목표로 했습니다.

주요 요구사항은 다음과 같습니다.

```text
Monthly Calendar
       │
       ▼
Select Date
       │
       ▼
Daily TODO List
       │
       ├── Add TODO
       ├── Complete TODO
       └── Achievement (%)
       │
       ▼
Daily Achievement
       │
       ▼
GitHub-style Heatmap
```

추후 Android 환경까지 확장할 수 있도록 Web 기반 구조로 설계했습니다.

---

## Vibe Coding Approach

본 프로젝트에서는 일반적인

```text
Technology Study
      ↓
Framework Study
      ↓
Manual Implementation
      ↓
Debugging
```

방식보다는 다음과 같은 **AI-assisted Development Workflow**를 사용했습니다.

```text
Define Requirements
        │
        ▼
Create PRD / Architecture
        │
        ▼
Prompt AI Coding Agent
        │
        ▼
Generate / Modify Code
        │
        ▼
Run Application
        │
        ▼
Check Result
        │
        ▼
Refine Requirements
        │
        └───────────────┐
                        │
                        ▼
                 Repeat Iteration
```

즉, 코드 구현 자체보다 **원하는 기능을 구체적으로 정의하고 AI에게 전달한 뒤, 결과를 확인하고 요구사항을 수정하는 과정**에 초점을 맞췄습니다.

---

## Documentation-Driven Development

AI Coding Agent가 프로젝트의 목적과 구조를 일관되게 이해할 수 있도록 구현 이전에 여러 설계 문서를 작성했습니다.

```text
PRD.md
    │
    ├── Product Requirements
    │
    ▼
ARCHITECTURE.md
    │
    ├── Application Architecture
    │
    ▼
DATA_MODEL.md
    │
    ├── Data Structure
    │
    ▼
UI_SPEC.md
    │
    ├── UI / UX Specification
    │
    ▼
ROADMAP.md
    │
    ├── Development Plan
    │
    ▼
AI Coding Agent
```

이를 통해 단순히

```text
"TODO 앱 만들어줘"
```

와 같이 추상적인 요청을 전달하는 것이 아니라,

```text
어떤 기능이 필요한지
어떤 데이터가 필요한지
어떤 화면 구조를 원하는지
무엇을 구현하지 않을 것인지
```

를 먼저 정의한 뒤 구현을 진행했습니다.

---

## Core Features

### 1. Monthly Calendar

월 단위 Calendar를 통해 날짜를 선택할 수 있습니다.

```text
Previous Month
      ◀
      │
Monthly Calendar
      │
      ▶
   Next Month
```

사용자는 원하는 날짜를 선택한 뒤 해당 날짜의 TODO List를 관리할 수 있습니다.

---

### 2. Daily TODO Management

각 날짜별로 TODO를 생성하고 완료 여부를 관리합니다.

```text
Selected Date
     │
     ▼
Daily TODO
     │
     ├── Create TODO
     │
     ├── Complete TODO
     │
     └── Achievement (%)
```

TODO 완료 시 `0 ~ 100` 범위의 달성도를 기록할 수 있도록 설계했습니다.

---

### 3. Daily Achievement

하루에 여러 TODO가 존재하는 경우 각 TODO에 입력된 achievement percentage의 평균을 이용해 **일일 달성도**를 계산합니다.

```text
TODO #1 : 100%
TODO #2 :  80%
TODO #3 :  60%
          ─────
             │
             ▼
Daily Achievement
```

일일 달성도는 별도의 값으로 저장하지 않고 TODO data를 기반으로 계산합니다.

---

### 4. GitHub-style Heatmap

날짜별 달성도를 직관적으로 확인할 수 있도록 **GitHub Contribution Graph와 유사한 Heatmap UI**를 사용합니다.

```text
Daily Achievement
        │
        ▼
Achievement Level
        │
        ▼
Calendar Heatmap
```

이를 통해 특정 기간 동안 TODO 수행 정도를 한눈에 확인할 수 있도록 구성했습니다.

---

### 5. Local Data Storage

본 프로젝트는 개인용 MVP를 목표로 하므로 별도의 Backend Server나 Login 기능을 사용하지 않습니다.

TODO 데이터는 Browser의 **IndexedDB**에 저장됩니다.

```text
React Application
       │
       ▼
    IndexedDB
       │
       ▼
 Local TODO Data
```

따라서 현재 구조에서는 다음 기능을 의도적으로 제외했습니다.

```text
Authentication
Backend Server
Multi-user Collaboration
Cloud Synchronization
```

---

## Architecture

전체 구조는 다음과 같습니다.

```text
User
 │
 ▼
Browser
 │
 ▼
React + TypeScript
 │
 ├── Calendar UI
 ├── TODO UI
 └── Heatmap UI
 │
 ▼
Application Logic
 │
 ▼
IndexedDB
 │
 ▼
Local Persistence
```

현재 MVP는 **Single Frontend Application**으로 구성되어 있으며, 별도의 Backend 없이 Browser 내부에서 모든 기능을 수행합니다.

---

## Cross-Platform Direction

현재 애플리케이션은 Browser 기반으로 동작하도록 설계했습니다.

```text
Current
   │
   ├── macOS Browser
   └── iPhone Browser

Future
   │
   ├── PWA
   └── Android
```

향후 Service Worker와 Manifest를 추가하여 PWA 형태로 확장하거나, 필요할 경우 business logic을 분리해 React Native / Flutter 기반 Mobile Application으로 확장하는 방향을 고려했습니다.

---

## Repository Structure

```text
-Vibe-Code-TODO_App/
│
├── .github/
│   └── workflows/          # GitHub workflow
│
├── apps/
│   └── web/                # TODO Web Application
│
├── docs/                   # Additional documentation
│
├── AGENTS.md               # AI Coding Agent instructions
├── ARCHITECTURE.md         # Application architecture
├── DATA_MODEL.md           # Data model specification
├── DEPLOYMENT.md           # Deployment guide
├── PRD.md                  # Product requirements
├── ROADMAP.md              # Development roadmap
├── UI_SPEC.md              # UI specification
│
└── README.md
```

---

## What I Focused On

본 프로젝트에서 제가 직접 중점적으로 수행한 부분은 Web Framework 자체의 구현보다 다음과 같습니다.

* 만들고자 하는 Application의 기능 정의
* PRD 작성 및 요구사항 구조화
* UI / Data Model / Architecture 정의
* AI Coding Agent가 이해할 수 있도록 요구사항 전달
* 생성된 Application 실행 및 결과 확인
* 원하는 결과와 다른 부분에 대한 요구사항 수정
* 반복적인 Prompting을 통한 기능 개선

반면 React, TypeScript, IndexedDB 등의 세부 구현은 **AI Coding Agent가 생성한 코드에 크게 의존했습니다.**

따라서 본 프로젝트는 Web Development 숙련도를 증명하기 위한 프로젝트가 아니라,  
**AI Coding Tool을 이용해 익숙하지 않은 Software Domain의 아이디어를 실제 Application으로 구현한 경험**을 기록하기 위한 프로젝트입니다.

---

## What I Learned

Vibe Coding을 통해 단순히 자연어로 코드를 생성하는 것보다 **요구사항을 얼마나 명확하게 정의하는지가 결과물의 품질에 큰 영향을 준다**는 점을 경험했습니다.

특히 다음 요소를 사전에 정의할수록 AI Coding Agent가 일관된 결과를 생성하기 쉬웠습니다.

```text
Goal
 │
 ├── Required Features
 ├── Non-goals
 ├── Data Model
 ├── UI Specification
 └── Architecture
```

또한 AI가 생성한 코드가 동작한다고 해서 해당 기술을 이해하고 있다고 볼 수 없기 때문에,  
**AI를 활용한 구현 능력과 직접적인 Software Engineering 역량은 구분해서 바라봐야 한다는 점**도 확인했습니다.

---

## Limitations

이 프로젝트는 Vibe Coding 학습 및 실험을 목적으로 제작된 MVP입니다.

* React / TypeScript 기반 Web Development에 대한 사전 경험이 거의 없는 상태에서 진행했습니다.
* 코드의 상당 부분은 AI Coding Agent를 통해 생성되었습니다.
* 모든 구현 세부사항을 직접 설계하거나 작성하지 않았습니다.
* 현재는 Local-only Application으로 Backend / Login / Cloud Sync 기능이 없습니다.
* Production-level Web Application을 목표로 한 프로젝트가 아닙니다.

---

## Future Work

```text
Current MVP
    │
    ├── Calendar
    ├── TODO Management
    ├── Achievement
    ├── Heatmap
    └── IndexedDB
    │
    ▼
Future
    │
    ├── PWA Support
    ├── Mobile Installation
    ├── Android Support
    └── Shared Business Logic
```

향후에는 PWA 적용을 통해 Mobile Device에서 App처럼 사용할 수 있도록 확장할 수 있습니다.

---

## Tech Stack

`React` · `TypeScript` · `Vite` · `IndexedDB` · `HTML/CSS` · `AI Coding Agent` · `Vibe Coding`
