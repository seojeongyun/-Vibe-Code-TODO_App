export type Todo = {
  id: string;
  date: string; // YYYY-MM-DD (Asia/Seoul)
  startTime: string | null; // HH:MM
  endTime: string | null; // HH:MM
  title: string;
  details: string | null;
  isDone: boolean;
  percent: number; // 0,25,50,75,100
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type TodoCreatePayload = {
  startTime?: string | null;
  endTime?: string | null;
  title: string;
  details?: string | null;
  isDone?: boolean;
  percent?: number;
};

export type TodoUpdatePatch = Partial<
  Pick<Todo, 'startTime' | 'endTime' | 'title' | 'details' | 'isDone' | 'percent'>
> & {
  // 기존 데이터 호환용 (time -> startTime 마이그레이션)
  time?: string | null;
};
