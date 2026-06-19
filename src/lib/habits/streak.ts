import { todayKey } from "./api";

function addDays(dateKey: string, days: number) {
  const d = new Date(`${dateKey}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function calculateStreaks(completedDates: string[]) {
  const dates = new Set(completedDates);

  let current = 0;
  let cursor = dates.has(todayKey()) ? todayKey() : addDays(todayKey(), -1);
  while (dates.has(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  const sorted = [...dates].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const date of sorted) {
    if (prev && addDays(prev, 1) === date) {
      run += 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
    prev = date;
  }

  return { current, best: Math.max(best, current) };
}
