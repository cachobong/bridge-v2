# employees (web)
List, create, view and edit workers (employees and contractors).

## Inputs
- `packages/shared/src/schemas/employees.ts` (`Worker`, `createWorkerSchema`, `updateWorkerSchema`)
- `apps/web/src/lib/api.ts`, `apps/web/src/lib/ui.tsx`, `apps/web/src/lib/format.ts`
- `apps/web/src/modules/auth/index.ts` (`useAuth`, `hasPermission`)
- `_config/conventions.md`, `_config/architecture.md`

## Process
- `api.ts` holds the react-query hooks for `/api/employees` (query keys start with `"employees"`).
- `WorkerForm` validates with the shared zod schemas before any request. Fields switch by worker type:
  employee = `monthlySalary`; contractor = `hourlyRate`, `companyName`, `contractEndDate`.
- The worker type is fixed after creation (the edit form does not show the type switch).
- Edit always sends the current `status`: `updateWorkerSchema` defaults a missing status to `"active"`.
- Show write controls (Add, Edit, Activate/Deactivate) only with `employees:write`.
- Do not duplicate shared types or schemas here.

## Outputs
- `index.ts`: `EmployeesPage`, `EmployeeDetailPage`
- Routes: `/employees`, `/employees/:id` (guarded by `employees:read` in `App.tsx`)
