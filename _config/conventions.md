# Conventions (Layer 3 reference)

## Tooling
- pnpm workspaces + Turborepo. Node 22+. TypeScript strict (`tsconfig.base.json`).
- Packages: `@bridge/api`, `@bridge/web`, `@bridge/shared`. `@bridge/shared` exports raw TS (no build step).
- The API runs with `tsx` (no compile step in the POC).

## Required checks before you finish
```
pnpm typecheck      # all packages
pnpm test           # vitest (packages/shared)
pnpm build          # web production build
```
After a schema change: `pnpm db:reset` then `pnpm db:types` then `pnpm db:seed`.

## Naming
- Database: `snake_case` tables and columns, plural table names.
- TypeScript and JSON: `camelCase`. Repositories map rows to camelCase types from `@bridge/shared`.
- Permissions: `<resource>:<action>`, for example `employees:write`.
- Migrations: `supabase/migrations/<YYYYMMDDHHMMSS>_<name>.sql`.
- In `CONTEXT.md` files, write every path from the repository root.

## API module files
| File | Job |
|------|-----|
| `CONTEXT.md` | Layer 2 contract (Inputs / Process / Outputs) |
| `index.ts` | Public exports. The only file other modules import. |
| `routes.ts` | Hono router: permission, validation, call repository or service |
| `repository.ts` | Supabase queries and row ↔ type mapping |
| `service.ts` | Business logic, only when a module has some (auth, employees, payroll) |
| `middleware.ts` | Hono middleware the module exports (auth, rbac) |

## Validation and errors
- Validate every body, query and param with a zod schema through `validate()` (`apps/api/src/lib/validate.ts`).
- Request schemas live in `packages/shared/src/schemas/` so the web app uses the same rules.
- Throw `AppError` helpers from `apps/api/src/lib/errors.ts`. Error body: `{ "error": { "code", "message" } }`.
  Status codes: 400 validation/bad_request, 401 unauthorized, 403 forbidden, 404 not_found, 409 conflict.
- Map Supabase errors with `fromDbError()`.

## Web
- One folder per module in `apps/web/src/modules`. Pages read data through the module's `api.ts` (TanStack Query hooks).
- Hide controls the user has no permission for. The API is the real check.
