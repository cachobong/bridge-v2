# shared
Types, zod schemas and pure domain rules that the API and the web app both use.

## Inputs
- `_config/domain.md`, `_config/rbac.md`, `_config/conventions.md`

## Process
- No I/O, no framework imports. Only `zod` and plain TypeScript.
- Request schemas are the API validation rules. Change them here, then fix the API and web callers.
- Do not put a `.default()` on an update schema field (a missing field would overwrite stored data).
- `rbac.ts` must match the rows in the init migration.
- Before you finish: `pnpm --filter @bridge/shared test` and `pnpm --filter @bridge/shared typecheck`.

## Outputs
- `src/payroll/periods.ts` (+ `periods.test.ts`): `periodFor`, `periodsForMonth`, `periodsForYear`, `periodContaining`, `lastDayOfMonth`
- `src/rbac.ts`: `PERMISSIONS`, `ROLES`
- `src/schemas/{auth,employees,payroll,rbac}.ts` (`employees.ts` also has `linkAccountSchema`)
- `src/index.ts`: re-exports everything
