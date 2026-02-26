# Data Model

## Todo
- id: string
- date: string (YYYY-MM-DD, Asia/Seoul 기준)
- startTime: string | null     # "HH:MM" (없으면 null)
- endTime: string | null       # "HH:MM" (없으면 null)
- title: string                # 할 일(활동 내용), 필수
- details: string | null       # 상세 메모(없으면 null)
- isDone: boolean
- percent: number              # 0,25,50,75,100 중 하나 (isDone=false이면 0)
- createdAt: string            # ISO string
- updatedAt: string            # ISO string

### 호환/보정 규칙 (기존 데이터 대응)
- 기존 데이터에 time만 존재하면:
  - startTime = time
  - endTime = null
  - time 필드는 저장 시 더 이상 사용하지 않음(마이그레이션 후 제거)
- 기존 percent가 0/25/50/75/100 중 하나가 아니면, 가장 가까운 값으로 보정
- 기존 details가 없으면 null로 보정

## DailyAchievement (계산값, 저장하지 않아도 됨)
- date: string (YYYY-MM-DD)
- achievement: number | null   # 해당 날짜 todos의 percent 평균, todos가 0개면 null