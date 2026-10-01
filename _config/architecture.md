# Architecture (Layer 3 reference)

## Shape: modular monolith
One deployable API (`apps/api`) and one SPA (`apps/web`). Each business capability is a **module**
with the same name in both apps: `auth`, `rbac`, `employees`, `payroll`.

Module rules:
- A module owns its tables (see the table in `CONTEXT.md`). Only that module's `repository.ts` queries them.
- A module exposes its public API in `index.ts`. Other modules import **only** from `../<module>/index.js`.
- Allowed dependencies (no cycles):
  - `auth` → `rbac` (reads roles and permissions for the signed-in user)
  - `employees` → `rbac` (`requirePermission`, `setUserRoles`)
  - `employees` → `auth` (`createUser`, to make a login for a worker)
  - `payroll` → `rbac` (`requirePermission`)
  - `rbac` → nothing (it reads `c.get("user")`, which `auth` sets)
- Code shared by API and web (types, zod schemas, pure domain rules) lives in `packages/shared`.
- A module can later become a separate service: its boundary is already its `index.ts` and its tables.

## Request flow (API)
```
browser ──/api/*──▶ Vite proxy (dev) ──▶ Hono app (apps/api/src/app.ts)
  logger → cors → requireAuth (all modules except /auth/login)
  → module router → requirePermission(...) → validate(zod) → repository → Supabase (service role)
  errors → handleError → { error: { code, message } }
```

## Data access and security
- The API uses the Supabase **service-role** client (`apps/api/src/lib/supabase.ts`). It bypasses RLS.
- Every table has RLS enabled with **no policies**, so the anon and authenticated roles cannot read
  or write tables directly. The API is the only path to data, and it enforces RBAC.
- The browser uses supabase-js only to store and refresh the auth session.

## Authentication
- Supabase Auth signs in with email + password. Users log in with a **username**.
- `POST /api/auth/login` resolves `profiles.username` → auth user email → `signInWithPassword`, and returns the session.
- The web app calls `supabase.auth.setSession(...)`; supabase-js refreshes the token.
- Each API request sends `Authorization: Bearer <access_token>`. `requireAuth` verifies it with
  `auth.getUser(token)` and loads roles and permissions.
- Public sign-up is off (`supabase/config.toml`). Users are created by the seed script or an admin.
