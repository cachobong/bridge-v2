import type { PeriodRange } from "@bridge/shared";
import { MONTHS_SHORT } from "../../lib/format";

// "Oct 2026 — 1st half"
export function periodLabel(p: Pick<PeriodRange, "year" | "month" | "half">): string {
  return `${MONTHS_SHORT[p.month - 1]} ${p.year} — ${p.half === 1 ? "1st" : "2nd"} half`;
}
