import { toKSTDateString } from './date';

export type CalendarCell = {
  date: string; // YYYY-MM-DD
  day: number;
  inMonth: boolean;
};

export type MonthItem = {
  year: number;
  month: number;
  key: string; // YYYY-MM
};

export type YearItem = {
  year: number;
  key: string; // YYYY
};

export function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function getDayOfWeek(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function formatDateString(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function getMonthKey(year: number, month: number): string {
  return `${year}-${pad(month)}`;
}

export function getYearKey(year: number): string {
  return `${year}`;
}

export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const index = year * 12 + (month - 1) + delta;
  const nextYear = Math.floor(index / 12);
  const nextMonth = (index % 12) + 1;
  return { year: nextYear, month: nextMonth };
}

export function getMonthMatrix(year: number, month: number): CalendarCell[][] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getDayOfWeek(year, month, 1);

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonthDays = getDaysInMonth(prevYear, prevMonth);

  const cells: CalendarCell[] = [];

  for (let i = 0; i < firstDayOfWeek; i += 1) {
    const day = prevMonthDays - firstDayOfWeek + 1 + i;
    cells.push({
      date: formatDateString(prevYear, prevMonth, day),
      day,
      inMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      date: formatDateString(year, month, day),
      day,
      inMonth: true,
    });
  }

  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remaining; i += 1) {
    cells.push({
      date: formatDateString(nextYear, nextMonth, i),
      day: i,
      inMonth: false,
    });
  }

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}

export function getTodayKST(): string {
  return toKSTDateString(new Date());
}

export function buildMonthRange(center: MonthItem, before: number, after: number): MonthItem[] {
  const months: MonthItem[] = [];
  for (let i = -before; i <= after; i += 1) {
    const { year, month } = addMonths(center.year, center.month, i);
    months.push({ year, month, key: getMonthKey(year, month) });
  }
  return months;
}

export function buildYearRange(centerYear: number, before: number, after: number): YearItem[] {
  const years: YearItem[] = [];
  for (let i = -before; i <= after; i += 1) {
    const year = centerYear + i;
    years.push({ year, key: getYearKey(year) });
  }
  return years;
}
