# web (web)
React SPA for Bridge (HR/payroll POC): login, employees, payroll periods, users & roles.

## Inputs
- `_config/architecture.md`, `_config/conventions.md`
- `packages/shared/src/index.ts` (all types, zod schemas, permissions, period rules)
- `apps/web/src/App.tsx` (routes and permission guards), `apps/web/src/lib/api.ts` (API client)
- The CONTEXT.md of the module you change (`apps/web/src/modules/*/CONTEXT.md`)

## Process
- Stack: React 19, Vite, react-router (declarative `<Routes>`), TanStack Query, supabase-js, Tailwind v4.
- All data goes through `/api` (Vite proxies it to `http://localhost:8787`). The browser never queries
  Supabase tables; supabase-js is used only to hold and refresh the auth session.
- `lib/api.ts` adds the Bearer token, throws `ApiError {status, code, message}`, and signs out on 401.
- Env: the root `.env` (`envDir: '../..'`); only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are used.
- Modules import each other only through `index.ts`. Shared helpers live in `src/lib`.
- Import types and schemas from `@bridge/shared`; never redefine them.
- Hide controls the user has no permission for; the API is the real enforcement.
- Use Tailwind utility classes and a neutral slate palette; no component library.
- Before you finish: `pnpm --filter @bridge/web typecheck` and `pnpm --filter @bridge/web build`.

## Outputs
- `src/modules/auth` (`/login`, guards), `src/modules/layout` (shell, `/` redirect),
  `src/modules/employees` (`/employees`, `/employees/:id`), `src/modules/payroll` (`/payroll-periods`),
  `src/modules/rbac` (`/rbac`)
- `dist/` from `pnpm build`
