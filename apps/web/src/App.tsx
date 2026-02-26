import { useEffect, useMemo, useRef, useState } from 'react';
import { addTodo, deleteTodo, getTodosByDate, updateTodo } from './data/todoStore';
import { computeDailyAchievement, getHeatLevel } from './data/achievement';
import { exportAllData, importAllData } from './data/backup';
import { isStoragePersisted, requestPersistentStorage } from './data/persist';
import { parseDateString } from './utils/date';
import { formatDateString, getMonthMatrix, getTodayKST } from './utils/calendar';
import type { Todo } from './types';

const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const THEME_KEY = 'heatmapTheme';
const THEMES = [
  { value: 'green', label: 'GitHub Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'purple', label: 'Purple' },
];
const PERCENT_OPTIONS = [0, 25, 50, 75, 100];

type TimeDraft = {
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
};

const EMPTY_DRAFT: TimeDraft = {
  startHour: '',
  startMinute: '',
  endHour: '',
  endMinute: '',
};

function splitTime(time: string | null) {
  if (!time) return { hour: '', minute: '' };
  const [hour, minute] = time.split(':');
  return { hour, minute };
}

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function normalizeTimeParts(hourInput: string, minuteInput: string, maxHour: number) {
  const hasHour = hourInput.trim() !== '';
  const hasMinute = minuteInput.trim() !== '';

  if (!hasHour && !hasMinute) {
    return { time: null, hour: '', minute: '' };
  }

  const hour = hasHour ? clamp(Number(hourInput), 0, maxHour) : 0;
  let minute = hasMinute ? clamp(Number(minuteInput), 0, 59) : 0;

  if (maxHour === 24 && hour === 24) {
    minute = 0;
  }

  const formatted = `${pad2(hour)}:${pad2(minute)}`;
  return { time: formatted, hour: pad2(hour), minute: pad2(minute) };
}

function selectAllOnFocus(event: React.FocusEvent<HTMLInputElement>) {
  const input = event.currentTarget;
  input.select();
  setTimeout(() => {
    input.setSelectionRange(0, input.value.length);
  }, 0);
}

export default function App() {
  const todayLabel = getTodayKST();
  const [view, setView] = useState<'home' | 'daily'>('home');
  const [selectedDate, setSelectedDate] = useState<string>(todayLabel);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [monthState, setMonthState] = useState(() => {
    const { year, month } = parseDateString(todayLabel);
    return { year, month };
  });
  const [todos, setTodos] = useState<Todo[]>([]);
  const [heatmapLevels, setHeatmapLevels] = useState<Record<string, number>>({});
  const [doneDates, setDoneDates] = useState<Set<string>>(new Set());
  const [dataRevision, setDataRevision] = useState(0);
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem(THEME_KEY) ?? 'green';
  });
  const [timeDrafts, setTimeDrafts] = useState<Record<string, TimeDraft>>({});
  const [heatmapYear, setHeatmapYear] = useState<number>(monthState.year);

  const heatmapRef = useRef<HTMLDivElement | null>(null);

  const calendarWeeks = useMemo(
    () => getMonthMatrix(monthState.year, monthState.month),
    [monthState]
  );

  const monthLabel = useMemo(
    () => formatDateString(monthState.year, monthState.month, 1).slice(0, 7),
    [monthState]
  );

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (view !== 'daily') return;
    let active = true;
    getTodosByDate(selectedDate).then((list) => {
      if (!active) return;
      setTodos(list);
      setTimeDrafts((prev) => {
        const next = { ...prev };
        list.forEach((todo) => {
          if (!next[todo.id]) {
            const start = splitTime(todo.startTime);
            const end = splitTime(todo.endTime);
            next[todo.id] = {
              startHour: start.hour,
              startMinute: start.minute,
              endHour: end.hour,
              endMinute: end.minute,
            };
          }
        });
        return next;
      });
    });
    return () => {
      active = false;
    };
  }, [selectedDate, view, dataRevision]);

  useEffect(() => {
    if (view !== 'home') return;
    let active = true;
    const loadHeatmap = async () => {
      const levels: Record<string, number> = {};
      const dates = Array.from({ length: 12 }, (_, idx) => getMonthMatrix(heatmapYear, idx + 1))
        .flat(2)
        .filter((cell) => cell.inMonth)
        .map((cell) => cell.date);
      const uniqueDates = Array.from(new Set(dates));
      await Promise.all(
        uniqueDates.map(async (date) => {
          const list = await getTodosByDate(date);
          const achievement = computeDailyAchievement(list);
          levels[date] = getHeatLevel(achievement);
        })
      );
      const nonZeroSamples = Object.entries(levels)
        .filter(([, level]) => level > 0)
        .slice(0, 3)
        .map(([date, level]) => ({ date, level }));
      console.log('HEATMAP_DEBUG', {
        datesLength: uniqueDates.length,
        levelsKeys: Object.keys(levels).length,
        nonZeroSamples,
      });
      if (active) setHeatmapLevels(levels);
    };
    loadHeatmap();
    return () => {
      active = false;
    };
  }, [heatmapYear, dataRevision, view]);

  useEffect(() => {
    if (view !== 'home') return;
    let active = true;
    const loadDoneDates = async () => {
      const dates = calendarWeeks.flat().map((cell) => cell.date);
      const doneSet = new Set<string>();
      await Promise.all(
        dates.map(async (date) => {
          const list = await getTodosByDate(date);
          if (list.some((todo) => todo.isDone)) {
            doneSet.add(date);
          }
        })
      );
      if (active) setDoneDates(doneSet);
    };
    loadDoneDates();
    return () => {
      active = false;
    };
  }, [calendarWeeks, dataRevision, view]);

  useEffect(() => {
    setHeatmapYear(monthState.year);
  }, [monthState.year]);

  const goToDate = (date: string) => {
    setSelectedDate(date);
    setView('daily');
  };

  const handlePrevMonth = () => {
    setMonthState((prev) => {
      const month = prev.month === 1 ? 12 : prev.month - 1;
      const year = prev.month === 1 ? prev.year - 1 : prev.year;
      return { year, month };
    });
  };

  const handleNextMonth = () => {
    setMonthState((prev) => {
      const month = prev.month === 12 ? 1 : prev.month + 1;
      const year = prev.month === 12 ? prev.year + 1 : prev.year;
      return { year, month };
    });
  };

  const handlePrevYear = () => {
    setHeatmapYear((prev) => prev - 1);
    setMonthState((prev) => ({ ...prev, year: prev.year - 1 }));
    if (heatmapRef.current) {
      heatmapRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const handleNextYear = () => {
    setHeatmapYear((prev) => prev + 1);
    setMonthState((prev) => ({ ...prev, year: prev.year + 1 }));
    if (heatmapRef.current) {
      heatmapRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const handleExport = async () => {
    const data = await exportAllData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todo-backup-${todayLabel}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      const parsed = JSON.parse(text);
      const ok = confirm('기존 데이터를 모두 덮어쓰고 복원할까요?');
      if (!ok) return;
      await importAllData(parsed, 'replace');
      setDataRevision((v) => v + 1);
      alert('Import 완료 (replace)');
    };
    input.click();
  };

  const handleCheckPersist = async () => {
    const persisted = await isStoragePersisted();
    console.log('PERSISTED', persisted);
    alert(`persisted: ${persisted}`);
  };

  const handleRequestPersist = async () => {
    const result = await requestPersistentStorage();
    console.log('PERSIST_REQUEST_RESULT', result);
    alert(`persist requested: ${result}`);
  };

  const handleAddTodo = async () => {
    const created = await addTodo(selectedDate, {
      title: '새 할 일',
      isDone: false,
      percent: 0,
      startTime: null,
      endTime: null,
      details: null,
    });
    setTodos((prev) => [...prev, created]);
    setTimeDrafts((prev) => ({
      ...prev,
      [created.id]: { ...EMPTY_DRAFT },
    }));
    setDataRevision((v) => v + 1);
  };

  const updateLocal = (id: string, patch: Partial<Todo>) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, ...patch } : todo))
    );
  };

  const commitUpdate = async (id: string, patch: Partial<Todo>) => {
    await updateTodo(id, patch);
    setDataRevision((v) => v + 1);
  };

  const handleToggleDone = async (todo: Todo) => {
    const nextIsDone = !todo.isDone;
    const nextPercent = nextIsDone ? todo.percent : 0;
    updateLocal(todo.id, { isDone: nextIsDone, percent: nextPercent });
    await commitUpdate(todo.id, { isDone: nextIsDone, percent: nextPercent });
  };

  const handlePercentSelect = async (todo: Todo, value: number) => {
    updateLocal(todo.id, { percent: value });
    await commitUpdate(todo.id, { percent: value });
  };

  const handleTitleBlur = async (todo: Todo, value: string) => {
    const trimmed = value.trim();
    updateLocal(todo.id, { title: trimmed || todo.title });
    if (trimmed.length > 0) {
      await commitUpdate(todo.id, { title: trimmed });
    }
  };

  const handleDetailsBlur = async (todo: Todo, value: string) => {
    const trimmed = value.trim();
    const details = trimmed.length === 0 ? null : trimmed;
    updateLocal(todo.id, { details });
    await commitUpdate(todo.id, { details });
  };

  const handleStartChange = (todo: Todo, hour: string, minute: string) => {
    setTimeDrafts((prev) => ({
      ...prev,
      [todo.id]: {
        ...(prev[todo.id] ?? EMPTY_DRAFT),
        startHour: hour,
        startMinute: minute,
      },
    }));
  };

  const handleEndChange = (todo: Todo, hour: string, minute: string) => {
    setTimeDrafts((prev) => ({
      ...prev,
      [todo.id]: {
        ...(prev[todo.id] ?? EMPTY_DRAFT),
        endHour: hour,
        endMinute: minute,
      },
    }));
  };

  const handleStartBlur = async (todo: Todo) => {
    const draft = timeDrafts[todo.id] ?? EMPTY_DRAFT;
    const normalized = normalizeTimeParts(draft.startHour, draft.startMinute, 23);
    setTimeDrafts((prev) => ({
      ...prev,
      [todo.id]: {
        ...(prev[todo.id] ?? EMPTY_DRAFT),
        startHour: normalized.hour,
        startMinute: normalized.minute,
      },
    }));
    updateLocal(todo.id, { startTime: normalized.time });
    await commitUpdate(todo.id, { startTime: normalized.time });
  };

  const handleEndBlur = async (todo: Todo) => {
    const draft = timeDrafts[todo.id] ?? EMPTY_DRAFT;
    const normalized = normalizeTimeParts(draft.endHour, draft.endMinute, 24);
    setTimeDrafts((prev) => ({
      ...prev,
      [todo.id]: {
        ...(prev[todo.id] ?? EMPTY_DRAFT),
        endHour: normalized.hour,
        endMinute: normalized.minute,
      },
    }));
    updateLocal(todo.id, { endTime: normalized.time });
    await commitUpdate(todo.id, { endTime: normalized.time });
  };

  const handleDelete = async (todo: Todo) => {
    await deleteTodo(todo.id);
    setTodos((prev) => prev.filter((item) => item.id !== todo.id));
    setDataRevision((v) => v + 1);
  };

  return (
    <div className="app" data-heatmap-theme={theme}>
      <header className="app-header">
        <div>
          <h1>TODO</h1>
        </div>
        <div className="button-row">
          <button
            type="button"
            className="ghost-button"
            onClick={() => setIsSettingsOpen(true)}
          >
            설정
          </button>
        </div>
      </header>

      {view === 'home' && (
        <main className="home">
          <section className="panel calendar-panel">
            <div className="panel-header">
              <button type="button" className="ghost-button" onClick={handlePrevMonth}>
                ◀
              </button>
              <div className="panel-title">{monthLabel}</div>
              <button type="button" className="ghost-button" onClick={handleNextMonth}>
                ▶
              </button>
            </div>
            <div className="calendar-grid">
              {WEEK_LABELS.map((label) => (
                <div key={label} className="calendar-label">
                  {label}
                </div>
              ))}
              {calendarWeeks.flat().map((cell) => (
                <button
                  key={cell.date}
                  type="button"
                  className={`calendar-cell ${cell.inMonth ? 'in-month' : 'out-month'} ${
                    cell.date === todayLabel ? 'today' : ''
                  } ${cell.inMonth && doneDates.has(cell.date) ? 'done-date' : ''}`}
                  onClick={() => goToDate(cell.date)}
                >
                  {cell.day}
                </button>
              ))}
            </div>
          </section>

          <section className="panel heatmap-panel">
            <div className="panel-header">
              <div className="panel-title">{heatmapYear} Heatmap</div>
              <div className="button-row">
                <button type="button" className="ghost-button" onClick={handlePrevYear}>
                  ◀
                </button>
                <button type="button" className="ghost-button" onClick={handleNextYear}>
                  ▶
                </button>
                <select
                  className="theme-select"
                  value={theme}
                  onChange={(event) => setTheme(event.target.value)}
                >
                  {THEMES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="heatmap-scroll" ref={heatmapRef}>
              <div className="heatmap-months">
                {Array.from({ length: 12 }, (_, idx) => idx + 1).map((month) => {
                  const weeks = getMonthMatrix(heatmapYear, month);
                  return (
                    <div key={`${heatmapYear}-${month}`} className="heatmap-month">
                      <div className="heatmap-month-label">{month}월</div>
                      <div className="heatmap-grid">
                        {weeks.map((week, index) => (
                          <div key={`week-${heatmapYear}-${month}-${index}`} className="heatmap-column">
                            {week.map((cell) => (
                              <button
                                key={cell.date}
                                type="button"
                                className={`heatmap-cell ${cell.inMonth ? '' : 'out-month'} ${
                                  cell.inMonth ? `level-${heatmapLevels[cell.date] ?? 0}` : ''
                                }`}
                                onClick={() => (cell.inMonth ? goToDate(cell.date) : undefined)}
                                title={cell.inMonth ? cell.date : ''}
                                disabled={!cell.inMonth}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>
      )}

      {view === 'daily' && (
        <section className="daily panel">
          <div className="panel-header">
            <div className="panel-title">{selectedDate} TODO</div>
            <div className="button-row">
              <button type="button" className="ghost-button" onClick={() => setView('home')}>
                달력으로
              </button>
              <button type="button" className="ghost-button" onClick={handleAddTodo}>
                새 TODO 추가
              </button>
            </div>
          </div>

          <div className="todo-table">
            <div className="todo-row todo-row-header">
              <div>시작시간</div>
              <div>끝시간</div>
              <div>할 일</div>
              <div>완료</div>
              <div>완료 %</div>
              <div></div>
            </div>
            {todos.map((todo) => {
              const draft = timeDrafts[todo.id] ?? EMPTY_DRAFT;
              return (
                <div key={todo.id} className="todo-block">
                  <div className="todo-row">
                    <div className="time-input">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        value={draft.startHour}
                        onFocus={selectAllOnFocus}
                        onChange={(event) =>
                          handleStartChange(todo, event.target.value, draft.startMinute)
                        }
                        onBlur={() => handleStartBlur(todo)}
                        placeholder="HH"
                      />
                      <span>:</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        value={draft.startMinute}
                        onFocus={selectAllOnFocus}
                        onChange={(event) =>
                          handleStartChange(todo, draft.startHour, event.target.value)
                        }
                        onBlur={() => handleStartBlur(todo)}
                        placeholder="MM"
                      />
                    </div>
                    <div className="time-input">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        value={draft.endHour}
                        onFocus={selectAllOnFocus}
                        onChange={(event) =>
                          handleEndChange(todo, event.target.value, draft.endMinute)
                        }
                        onBlur={() => handleEndBlur(todo)}
                        placeholder="HH"
                      />
                      <span>:</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        value={draft.endMinute}
                        onFocus={selectAllOnFocus}
                        onChange={(event) =>
                          handleEndChange(todo, draft.endHour, event.target.value)
                        }
                        onBlur={() => handleEndBlur(todo)}
                        placeholder="MM"
                      />
                    </div>
                    <input
                      type="text"
                      value={todo.title}
                      onChange={(event) => updateLocal(todo.id, { title: event.target.value })}
                      onBlur={(event) => handleTitleBlur(todo, event.target.value)}
                      required
                    />
                    <div className="checkbox-cell">
                      <input
                        type="checkbox"
                        className="todo-checkbox"
                        checked={todo.isDone}
                        onChange={() => handleToggleDone(todo)}
                      />
                    </div>
                    <div className={`percent-group ${todo.isDone ? '' : 'disabled'}`}>
                      {PERCENT_OPTIONS.map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={`percent-button ${todo.percent === value ? 'active' : ''}`}
                          onClick={() => handlePercentSelect(todo, value)}
                          disabled={!todo.isDone}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => handleDelete(todo)}
                    >
                      삭제
                    </button>
                  </div>
                  <div className="todo-details">
                    <textarea
                      placeholder="상세 내용"
                      value={todo.details ?? ''}
                      onChange={(event) => updateLocal(todo.id, { details: event.target.value })}
                      onBlur={(event) => handleDetailsBlur(todo, event.target.value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {isSettingsOpen && (
        <div className="settings-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="settings-panel" onClick={(event) => event.stopPropagation()}>
            <div className="settings-header">
              <div className="panel-title">설정</div>
              <button
                type="button"
                className="ghost-button"
                onClick={() => setIsSettingsOpen(false)}
              >
                닫기
              </button>
            </div>
            <div className="settings-section">
              <h3>데이터 백업/복원</h3>
              <div className="button-row">
                <button type="button" className="ghost-button" onClick={handleExport}>
                  Export (JSON 다운로드)
                </button>
                <button type="button" className="ghost-button" onClick={handleImport}>
                  Import (JSON 업로드)
                </button>
              </div>
            </div>
            <div className="settings-section">
              <h3>About</h3>
              <p>기준 타임존: Asia/Seoul</p>
            </div>
            <div className="settings-section">
              <button
                type="button"
                className="ghost-button"
                onClick={() => setIsAdvancedOpen((prev) => !prev)}
              >
                고급 옵션
              </button>
              {isAdvancedOpen && (
                <div className="advanced-panel">
                  <div className="button-row">
                    <button type="button" className="ghost-button" onClick={handleCheckPersist}>
                      Persisted?
                    </button>
                    <button type="button" className="ghost-button" onClick={handleRequestPersist}>
                      Persist 요청
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
