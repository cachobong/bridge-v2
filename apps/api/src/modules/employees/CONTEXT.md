# employees (api)
CRUD for workers: normal employees and contractors, in one `workers` table.

## Inputs
- `_config/domain.md` (worker fields and type rules)
- `packages/shared/src/schemas/employees.ts` (`Worker`, `createWorkerSchema`, `updateWorkerSchema`, `listWorkersQuerySchema`)
- `apps/api/src/modules/rbac/index.ts` (`requirePermission`)
- `apps/api/src/lib/database.types.ts` (`workers` row)

## Process
- Input is a discriminated union on `workerType`. PATCH must send `workerType`; only sent keys change.
- Type-specific columns: employee → `monthly_salary`; contractor → `hourly_rate`, `company_name`, `contract_end_date`.
  `toRow()` clears the columns of the other type. The DB check constraint is the final guard.
- Search uses `ilike` on name, email and job title. Strip PostgREST filter characters first.
- No delete: set `status` to `inactive`.
- Owns table `workers`.

## Outputs
- `GET /api/employees?type=&status=&search=` → `Worker[]` (`employees:read`)
- `GET /api/employees/:id` → `Worker` (`employees:read`)
- `POST /api/employees` → `Worker` 201 (`employees:write`)
- `PATCH /api/employees/:id` → `Worker` (`employees:write`)
- `index.ts`: `employeeRoutes`
