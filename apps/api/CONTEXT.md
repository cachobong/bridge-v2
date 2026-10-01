# api
Hono API for Bridge. One process, one module per business capability (modular monolith).

## Inputs
- `_config/architecture.md`, `_config/conventions.md`
- `apps/api/src/app.ts` (module mounting and the auth guard)
- `apps/api/src/lib/` (`env.ts`, `supabase.ts`, `errors.ts`, `validate.ts`, `types.ts`, generated `database.types.ts`)
- The CONTEXT.md of the module you change (`apps/api/src/modules/*/CONTEXT.md`)

## Process
- Base path `/api`. `requireAuth` guards every module except `POST /api/auth/login` and `GET /api/health`.
- Each route: `requirePermission(...)` → `validate(target, schema)` → repository/service → `c.json(...)`.
- Throw `AppError` helpers; never return error JSON by hand (except in `validate`).
- Do not edit `src/lib/database.types.ts` by hand. Run `pnpm db:types`.
- Env comes from the root `.env` (`--env-file-if-exists=../../.env`). `env.ts` exits on invalid env.
- Before you finish: `pnpm --filter @bridge/api typecheck`.

## Outputs
- `apps/api/src/modules/{auth,rbac,employees,payroll}` → `/api/auth`, `/api/rbac`, `/api/employees`, `/api/payroll-periods`
- `apps/api/scripts/seed.ts` (`pnpm db:seed`): demo users `admin`, `hr`, `payroll`, `viewer`, `maria` (password `Password123!`), 5 workers; `maria` is linked to the worker Maria Lopez
- `apps/api/scripts/seed-admin.ts` (`pnpm db:seed:admin`): one admin from `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_EMAIL`. The only seed for a hosted project
