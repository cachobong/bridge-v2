# employees (web)
List, create, view and edit workers (employees and contractors), manage their login accounts, and show "My profile".

## Inputs
- `packages/shared/src/schemas/employees.ts` (`Worker`, `createWorkerSchema`, `updateWorkerSchema`, `linkAccountSchema`)
- `apps/web/src/modules/rbac/index.ts` (`useUsers`, for "Link an existing user")
- `apps/web/src/lib/api.ts`, `apps/web/src/lib/ui.tsx`, `apps/web/src/lib/format.ts`
- `apps/web/src/modules/auth/index.ts` (`useAuth`, `hasPermission`)
- `_config/conventions.md`, `_config/architecture.md`

## Process
- `api.ts` holds the react-query hooks for `/api/employees` (query keys start with `"employees"`).
- `WorkerForm` validates with the shared zod schemas before any request. Fields switch by worker type:
  employee = `monthlySalary`; contractor = `hourlyRate`, `companyName`, `contractEndDate`.
- The worker type is fixed after creation (the edit form does not show the type switch).
- Edit sends the current `status`. (A missing status no longer changes it, but keep sending it.)
- `AccountSection` (detail page): shows the linked username or "No login". Create / link / unlink only with
  `employees:write` and `rbac:write`. The API rejects conflicts (409); show its message.
- `MyProfilePage` (`/me`): read-only own record from `GET /api/employees/me`. A 404 means "not linked", not an error.
- `WorkerDetails` renders the read-only fields for both pages.
- Show write controls (Add, Edit, Activate/Deactivate) only with `employees:write`.
- Do not duplicate shared types or schemas here.

## Outputs
- `index.ts`: `EmployeesPage`, `EmployeeDetailPage`, `MyProfilePage`
- Routes: `/employees`, `/employees/:id` (guarded by `employees:read`), `/me` (guarded by `self:read`) in `App.tsx`
