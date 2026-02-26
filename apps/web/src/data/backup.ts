import type { Todo } from '../types';
import { clearAllTodos, getAllTodoDates, getTodosByDate, isValidDateString, normalizePercent, todoStore } from './todoStore';
import { nowIsoString } from '../utils/date';
import { set } from 'idb-keyval';

const EXPORT_VERSION = 3;
const TODO_DATES_KEY = 'todoDates';

export type ExportData = {
  version: number;
  exportedAt: string;
  todoDates: string[];
  todosByDate: Record<string, Todo[]>;
};

function isIsoString(value: string) {
  return !Number.isNaN(Date.parse(value));
}

function isTodo(value: unknown): value is Todo {
  if (!value || typeof value !== 'object') return false;
  const todo = value as Partial<Todo> & { time?: string | null };
  if (typeof todo.id !== 'string') return false;
  if (typeof todo.date !== 'string' || !isValidDateString(todo.date)) return false;
  if (todo.title !== undefined && typeof todo.title !== 'string') return false;
  if (todo.details !== undefined && todo.details !== null && typeof todo.details !== 'string') return false;
  if (typeof todo.isDone !== 'boolean') return false;
  if (typeof todo.percent !== 'number') return false;
  if (todo.percent < 0 || todo.percent > 100) return false;
  if (typeof todo.createdAt !== 'string' || !isIsoString(todo.createdAt)) return false;
  if (typeof todo.updatedAt !== 'string' || !isIsoString(todo.updatedAt)) return false;
  if (todo.startTime !== undefined && todo.startTime !== null && typeof todo.startTime !== 'string') return false;
  if (todo.endTime !== undefined && todo.endTime !== null && typeof todo.endTime !== 'string') return false;
  if (todo.time !== undefined && todo.time !== null && typeof todo.time !== 'string') return false;
  return true;
}

export async function exportAllData(): Promise<ExportData> {
  const todoDates = await getAllTodoDates();
  const todosByDate: Record<string, Todo[]> = {};

  for (const date of todoDates) {
    todosByDate[date] = await getTodosByDate(date);
  }

  return {
    version: EXPORT_VERSION,
    exportedAt: nowIsoString(),
    todoDates,
    todosByDate,
  };
}

function normalizeTodos(date: string, list: Todo[]) {
  return list.map((todo) => {
    const isDone = Boolean(todo.isDone);
    const title = todo.title?.trim() || '(미입력)';
    const details = todo.details ?? null;
    return {
      ...todo,
      date,
      startTime: todo.startTime ?? (todo as Todo & { time?: string | null }).time ?? null,
      endTime: todo.endTime ?? null,
      title,
      details,
      percent: normalizePercent(isDone, todo.percent),
      isDone,
    };
  });
}

export async function importAllData(
  data: unknown,
  mode: 'replace' | 'merge' = 'replace'
): Promise<void> {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid export data');
  }

  const raw = data as Partial<ExportData> & { todosByDate?: unknown };
  if (typeof raw.version === 'number' && raw.version > EXPORT_VERSION) {
    throw new Error(`Unsupported version: ${raw.version}`);
  }

  const todoDates = Array.isArray(raw.todoDates)
    ? raw.todoDates.filter((d) => typeof d === 'string' && isValidDateString(d))
    : [];

  if (!raw.todosByDate || typeof raw.todosByDate !== 'object') {
    throw new Error('todosByDate is required');
  }

  const todosByDate = raw.todosByDate as Record<string, unknown>;
  const datesFromMap = Object.keys(todosByDate).filter(isValidDateString);
  const finalDates = Array.from(new Set([...todoDates, ...datesFromMap])).sort();

  if (mode === 'replace') {
    await clearAllTodos();
  }

  for (const date of finalDates) {
    const list = todosByDate[date];
    if (!Array.isArray(list)) {
      continue;
    }
    const validTodos = list.filter(isTodo) as Todo[];
    const normalized = normalizeTodos(date, validTodos);
    await set(`todos:${date}`, normalized, todoStore);
  }

  await set(TODO_DATES_KEY, finalDates, todoStore);
}
