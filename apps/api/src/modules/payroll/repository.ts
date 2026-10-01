import type { PayrollPeriod, PeriodHalf, PeriodRange, PeriodStatus } from "@bridge/shared";
import { fromDbError } from "../../lib/errors.js";
import { db } from "../../lib/supabase.js";
import type { Tables } from "../../lib/database.types.js";

function toPeriod(r: Tables<"payroll_periods">): PayrollPeriod {
  return {
    id: r.id,
    year: r.year,
    month: r.month,
    half: r.half as PeriodHalf,
    startDate: r.start_date,
    endDate: r.end_date,
    status: r.status,
    createdAt: r.created_at,
  };
}

export async function listPeriods(year?: number): Promise<PayrollPeriod[]> {
  let q = db.from("payroll_periods").select("*").order("start_date");
  if (year !== undefined) q = q.eq("year", year);
  const { data, error } = await q;
  if (error) throw fromDbError(error);
  return data.map(toPeriod);
}

// Inserts the ranges. Ranges that already exist (same year, month, half) are skipped.
export async function insertPeriods(ranges: PeriodRange[]): Promise<PayrollPeriod[]> {
  const rows = ranges.map((r) => ({ year: r.year, month: r.month, half: r.half, start_date: r.startDate, end_date: r.endDate }));
  const { data, error } = await db
    .from("payroll_periods")
    .upsert(rows, { onConflict: "year,month,half", ignoreDuplicates: true })
    .select("*");
  if (error) throw fromDbError(error);
  return data.map(toPeriod).sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export async function updatePeriodStatus(id: string, status: PeriodStatus): Promise<PayrollPeriod | null> {
  const { data, error } = await db.from("payroll_periods").update({ status }).eq("id", id).select("*").maybeSingle();
  if (error) throw fromDbError(error);
  return data ? toPeriod(data) : null;
}
