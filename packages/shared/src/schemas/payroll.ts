import { z } from "zod";
import type { PeriodHalf } from "../payroll/periods.js";

export const PERIOD_STATUSES = ["open", "closed"] as const;
export type PeriodStatus = (typeof PERIOD_STATUSES)[number];

// Omit `month` to generate all 24 periods of the year.
export const generatePeriodsSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12).optional(),
});
export type GeneratePeriodsInput = z.infer<typeof generatePeriodsSchema>;

export const listPeriodsQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export const updatePeriodSchema = z.object({
  status: z.enum(PERIOD_STATUSES),
});
export type UpdatePeriodInput = z.infer<typeof updatePeriodSchema>;

export interface PayrollPeriod {
  id: string;
  year: number;
  month: number;
  half: PeriodHalf;
  startDate: string;
  endDate: string;
  status: PeriodStatus;
  createdAt: string;
}
