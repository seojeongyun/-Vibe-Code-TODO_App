import { createStore, del, get, set } from 'idb-keyval';
import type { Todo, TodoCreatePayload, TodoUpdatePatch } from '../types';
import { nowIsoString } from '../utils/date';

export const todoStore = createStore('todo-db', 'todo-store');
const TODO_DATES_KEY = 'todoDates';
const PERCENT_STEPS = [0, 25, 50, 75, 100];

function todosKey(date: string) {
  return `todos:${date}`;
}

function isValidDateString(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [y, m, d] = date.split('-').map(Number);
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const utc = new Date(Date.UTC(y, m - 1, d));
  return (
    utc.getUTCFullYear() === y &&
    utc.getUTCMonth() === m - 1 &&
    utc.getUTCDate() === d
  );
}

function nearestPercentStep(value: number) {
  let closest = PERCENT_STEPS[0];
  let minDiff = Math.abs(value - closest);
  for (const step of PERCENT_STEPS) {
    const diff = Math.abs(value - step);
    if (diff < minDiff) {
      minDiff = diff;
      closest = step;
    }
  }
  return closest;
}

function normalizePercent(isDone: boolean, percent: number | undefined) {
  if (!isDone) return 0;
  const safe = Number.isFinite(percent) ? Number(percent) : 0;
  const clamped = Math.min(100, Math.max(0, safe));
  return nearestPercentStep(clamped);
}

function normalizeTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed;
}

function normalizeDetails(value: string | null | undefined): string | null {
  if (value === undefined) return null;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function migrateTodo(todo: Todo & { time?: string | null }): { todo: Todo; changed: boolean } {
  const startTime = todo.startTime ?? todo.time ?? null;
  const nextStart = normalizeTime(startTime);
  const nextEnd = normalizeTime(todo.endTime);
  const nextPercent = normalizePercent(todo.isDone, todo.percent);
  const nextDetails = normalizeDetails(todo.details);

  const changed =
    nextStart !== todo.startTime ||
    nextEnd !== todo.endTime ||
    nextPercent !== todo.percent ||
    nextDetails !== todo.details ||
    (todo as Todo & { time?: string | null }).time !== undefined;

  return {
    todo: {
      ...todo,
      startTime: nextStart,
      endTime: nextEnd,
      details: nextDetails,
      percent: nextPercent,
    },
    changed,
  };
}

async function getTodoDates(): Promise<string[]> {
  const dates = await get<string[]>(TODO_DATES_KEY, todoStore);
  return Array.isArray(dates) ? dates : [];
}

async function setTodoDates(dates: string[]) {
  const unique = Array.from(new Set(dates)).sort();
  await set(TODO_DATES_KEY, unique, todoStore);
  return unique;
}

export async function addTodo(date: string, payload: TodoCreatePayload): Promise<Todo> {
  if (!isValidDateString(date)) {
    throw new Error(`Invalid date: ${date}`);
  }
  if (!payload.title || payload.title.trim().length === 0) {
    throw new Error('Title is required');
  }

  const now = nowIsoString();
  const isDone = Boolean(payload.isDone);
  const todo: Todo = {
    id: crypto.randomUUID(),
    date,
    startTime: normalizeTime(payload.startTime),
    endTime: normalizeTime(payload.endTime),
    title: payload.title.trim(),
    details: normalizeDetails(payload.details),
    isDone,
    percent: normalizePercent(isDone, payload.percent),
    createdAt: now,
    updatedAt: now,
  };

  const key = todosKey(date);
  const todos = (await get<Todo[]>(key, todoStore)) ?? [];
  todos.push(todo);
  await set(key, todos, todoStore);

  const dates = await getTodoDates();
  if (!dates.includes(date)) {
    await setTodoDates([...dates, date]);
  }

  return todo;
}

export async function getTodosByDate(date: string): Promise<Todo[]> {
  if (!isValidDateString(date)) {
    throw new Error(`Invalid date: ${date}`);
  }
  const todos = (await get<Todo[]>(todosKey(date), todoStore)) ?? [];
  let changed = false;
  const migrated = todos.map((todo) => {
    const result = migrateTodo(todo as Todo & { time?: string | null });
    if (result.changed) changed = true;
    return result.todo;
  });
  if (changed) {
    await set(todosKey(date), migrated, todoStore);
  }
  return migrated;
}

async function findTodoById(id: string): Promise<
  | { date: string; todos: Todo[]; index: number }
  | { date: null; todos: null; index: -1 }
> {
  const dates = await getTodoDates();
  for (const date of dates) {
    const todos = (await get<Todo[]>(todosKey(date), todoStore)) ?? [];
    const index = todos.findIndex((todo) => todo.id === id);
    if (index !== -1) {
      return { date, todos, index };
    }
  }
  return { date: null, todos: null, index: -1 };
}

export async function updateTodo(
  id: string,
  patch: TodoUpdatePatch
): Promise<Todo> {
  const found = await findTodoById(id);
  if (!found.todos || !found.date) {
    throw new Error(`Todo not found: ${id}`);
  }

  const current = migrateTodo(found.todos[found.index] as Todo & { time?: string | null }).todo;
  const nextIsDone = patch.isDone ?? current.isDone;
  const nextPercent =
    patch.percent !== undefined
      ? normalizePercent(nextIsDone, patch.percent)
      : nextIsDone
        ? normalizePercent(nextIsDone, current.percent)
        : 0;

  const updated: Todo = {
    ...current,
    updatedAt: nowIsoString(),
  };

  if ('startTime' in patch || 'time' in patch) {
    updated.startTime = normalizeTime(patch.startTime ?? patch.time);
  }
  if ('endTime' in patch) {
    updated.endTime = normalizeTime(patch.endTime);
  }
  if ('details' in patch) {
    updated.details = normalizeDetails(patch.details);
  }
  if ('title' in patch) {
    updated.title = patch.title?.trim() ?? '';
  }

  updated.isDone = nextIsDone;
  updated.percent = nextPercent;

  found.todos[found.index] = updated;
  await set(todosKey(found.date), found.todos, todoStore);

  return updated;
}

export async function deleteTodo(id: string): Promise<void> {
  const found = await findTodoById(id);
  if (!found.todos || !found.date) return;

  found.todos.splice(found.index, 1);

  if (found.todos.length === 0) {
    await del(todosKey(found.date), todoStore);
    const dates = await getTodoDates();
    await setTodoDates(dates.filter((d) => d !== found.date));
    return;
  }

  await set(todosKey(found.date), found.todos, todoStore);
}

export async function clearAllTodos(): Promise<void> {
  const dates = await getTodoDates();
  for (const date of dates) {
    await del(todosKey(date), todoStore);
  }
  await del(TODO_DATES_KEY, todoStore);
}

export async function getAllTodoDates(): Promise<string[]> {
  return getTodoDates();
}

export { isValidDateString, normalizePercent };
