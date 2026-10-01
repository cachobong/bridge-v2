import { type GeneratePeriodsInput, periodsForMonth, periodsForYear } from "@bridge/shared";
import { insertPeriods } from "./repository.js";

// Period dates come from the shared bi-monthly rule. The database check constraint enforces the same rule.
export async function generatePeriods({ year, month }: GeneratePeriodsInput) {
  const ranges = month === undefined ? periodsForYear(year) : periodsForMonth(year, month);
  return { created: await insertPeriods(ranges) };
}
