# payroll (web)
View, generate, close and reopen bi-monthly payroll periods.

## Inputs
- `packages/shared/src/payroll/periods.ts` (`periodsForMonth`, `periodsForYear`, `PeriodHalf`)
- `packages/shared/src/schemas/payroll.ts` (`PayrollPeriod`, `generatePeriodsSchema`)
- `apps/web/src/lib/api.ts`, `apps/web/src/lib/ui.tsx`, `apps/web/src/lib/format.ts`
- `apps/web/src/modules/auth/index.ts` (`useAuth`)
- `_config/conventions.md`, `_config/architecture.md`

## Process
- Rule: half 1 = day 1–15; half 2 = day 16–last day of the month. Never compute dates here;
  use the shared period functions (the generate preview uses them).
- `api.ts` holds the react-query hooks for `/api/payroll-periods` (query keys start with `"payroll-periods"`).
- Generate without a month creates all 24 periods; the API skips existing periods.
- Show Generate and Close/Reopen only with `payroll_periods:write`.
- Labels use `periodLabel()`: "Oct 2026 — 1st half".

## Outputs
- `index.ts`: `PayrollPeriodsPage`
- Route: `/payroll-periods` (guarded by `payroll_periods:read` in `App.tsx`)
