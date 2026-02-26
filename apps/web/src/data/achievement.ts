import type { Todo } from '../types';

export function computeDailyAchievement(todos: Todo[]): number | null {
  if (todos.length === 0) return null;
  const sum = todos.reduce((acc, todo) => {
    const percent = todo.isDone ? todo.percent : 0;
    return acc + percent;
  }, 0);
  return sum / todos.length;
}

export function getHeatLevel(achievement: number | null): number {
  if (achievement === null || achievement <= 0) return 0;
  if (achievement <= 19) return 1;
  if (achievement <= 39) return 2;
  if (achievement <= 59) return 3;
  if (achievement <= 79) return 4;
  return 5;
}
