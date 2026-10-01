// Bi-monthly payroll periods:
//   half 1 = day 1 to day 15
//   half 2 = day 16 to the last day of the month
export type PeriodHalf = 1 | 2;

export interface PeriodRange {
  year: number;
  month: number; // 1-12
  half: PeriodHalf;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export function lastDayOfMonth(year: number, month: number): number {
  // Day 0 of the next month is the last day of this month.
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function isoDate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function periodFor(year: number, month: number, half: PeriodHalf): PeriodRange {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError(`Invalid month: ${month}`);
  }
  const startDay = half === 1 ? 1 : 16;
  const endDay = half === 1 ? 15 : lastDayOfMonth(year, month);
  return {
    year,
    month,
    half,
    startDate: isoDate(year, month, startDay),
    endDate: isoDate(year, month, endDay),
  };
}

export function periodsForMonth(year: number, month: number): PeriodRange[] {
  return [periodFor(year, month, 1), periodFor(year, month, 2)];
}

export function periodsForYear(year: number): PeriodRange[] {
  return Array.from({ length: 12 }, (_, i) => periodsForMonth(year, i + 1)).flat();
}

// Returns the period that contains the given YYYY-MM-DD date.
export function periodContaining(date: string): PeriodRange {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  return periodFor(y, m, d <= 15 ? 1 : 2);
}
