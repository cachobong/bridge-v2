# payroll (api)
Bi-monthly payroll periods: generate, list, close and reopen.

## Inputs
- `_config/domain.md` (payroll period rule)
- `packages/shared/src/payroll/periods.ts` (`periodsForMonth`, `periodsForYear`)
- `packages/shared/src/schemas/payroll.ts`
- `apps/api/src/modules/rbac/index.ts` (`requirePermission`)

## Process
- Never compute period dates here. `service.ts` gets them from `@bridge/shared`.
- Generation upserts with `ignoreDuplicates` on `(year, month, half)`. The response lists only new periods.
- The `payroll_periods_dates` DB check rejects any row that breaks the 1–15 / 16–end rule.
- Owns table `payroll_periods`.

## Outputs
- `GET /api/payroll-periods?year=` → `PayrollPeriod[]` sorted by start date (`payroll_periods:read`)
- `POST /api/payroll-periods/generate` body `{ year, month? }` → `{ created }` 201 (`payroll_periods:write`)
- `PATCH /api/payroll-periods/:id` body `{ status }` → `PayrollPeriod` (`payroll_periods:write`)
- `index.ts`: `payrollRoutes`
