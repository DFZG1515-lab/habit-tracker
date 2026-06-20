import { todayKey } from "./api";

function addDays(dateKey: string, days: number) {
  const d = new Date(`${dateKey}T00:00:00`);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
