# auth (web)
Sign-in, session state, current user and permission guards for the web app.

## Inputs
- `packages/shared/src/schemas/auth.ts` (`loginSchema`, `Session`, `CurrentUser`)
- `packages/shared/src/rbac.ts` (`Permission`, `Role`)
- `apps/web/src/lib/supabase.ts`, `apps/web/src/lib/api.ts`
- `_config/conventions.md`, `_config/architecture.md`

## Process
- Login posts `{username, password}` to `POST /api/auth/login` (no token), then calls
  `supabase.auth.setSession()`. supabase-js persists and refreshes the session.
- `AuthProvider` tracks the session with `onAuthStateChange` and loads `GET /api/auth/me`
  (query key `["auth","me"]`) for roles and permissions.
- A 401 from any API call signs out locally (`lib/api.ts`); `RequireAuth` then redirects to `/login`.
- Logout = `supabase.auth.signOut()`; the SIGNED_OUT event clears the query cache.
- Permission checks use `hasPermission(p)` only. The API enforces permissions; the UI only hides controls.
- Other modules use this module only through `index.ts`.

## Outputs
- `index.ts`: `AuthProvider`, `useAuth`, `LoginPage`, `RequireAuth`, `RequirePermission`, `NoAccessPage`
- Route: `/login`
