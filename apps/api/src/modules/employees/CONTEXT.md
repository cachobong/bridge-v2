# employees (api)
CRUD for workers (normal employees and contractors, in one `workers` table), and the link from a worker to a login account.

## Inputs
- `_config/domain.md` (worker fields and type rules)
- `packages/shared/src/schemas/employees.ts` (`Worker`, `createWorkerSchema`, `updateWorkerSchema`, `listWorkersQuerySchema`)
- `apps/api/src/modules/rbac/index.ts` (`requirePermission`, `setUserRoles`)
- `apps/api/src/modules/auth/index.ts` (`createUser`)
- `apps/api/src/lib/database.types.ts` (`workers` row)

## Process
- Input is a discriminated union on `workerType`. PATCH must send `workerType`; only sent keys change.
- Type-specific columns: employee → `monthly_salary`; contractor → `hourly_rate`, `company_name`, `contract_end_date`.
  `toRow()` clears the columns of the other type. The DB check constraint is the final guard.
- Search uses `ilike` on name, email and job title. Strip PostgREST filter characters first.
- No delete: set `status` to `inactive`.
- Account link (`service.ts`): `workers.user_id` → `profiles.id`, unique both ways. `existing` links a user;
  `new` creates a user from the worker's email and name, with role `employee`. Unlink keeps the user.
- Register `/me` before `/:id`. The repository joins `profiles(username)` for `Worker.username`.
- Owns table `workers`.

## Outputs
- `GET /api/employees?type=&status=&search=` → `Worker[]` (`employees:read`)
- `GET /api/employees/:id` → `Worker` (`employees:read`)
- `POST /api/employees` → `Worker` 201 (`employees:write`)
- `PATCH /api/employees/:id` → `Worker` (`employees:write`)
- `GET /api/employees/me` → own linked `Worker`, 404 if none (`self:read`)
- `POST /api/employees/:id/account` body `linkAccountSchema` → `Worker` (`employees:write` + `rbac:write`; 409 on conflicts)
- `DELETE /api/employees/:id/account` → `Worker` (`employees:write` + `rbac:write`)
- `index.ts`: `employeeRoutes`
