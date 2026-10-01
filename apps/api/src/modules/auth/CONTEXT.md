# auth (api)
Username/password login through Supabase Auth, and the `requireAuth` middleware.

## Inputs
- `packages/shared/src/schemas/auth.ts` (`loginSchema`, `Session`, `CurrentUser`)
- `apps/api/src/modules/rbac/index.ts` (`getUserAccess`)
- `apps/api/src/lib/supabase.ts`, `apps/api/src/lib/errors.ts`
- `_config/architecture.md` (Authentication section)

## Process
- Login: `profiles.username` (lowercase) → `auth.admin.getUserById` → email → `signInWithPassword` on a new anon client.
- Return the same 401 message for an unknown username and a wrong password.
- `requireAuth` reads `Authorization: Bearer <token>`, calls `auth.getUser(token)`, and sets `c.get("user")`
  (`CurrentUser` with roles and permissions). Other modules depend on this value.
- `createUser()` creates the auth user (email confirmed) and its profile; it deletes the auth user if the
  profile insert fails. 409 for a taken username or email.
- Owns table `profiles`.

## Outputs
- `POST /api/auth/login` → `{ session, user }`
- `GET /api/auth/me` → `CurrentUser`
- `index.ts`: `authRoutes`, `requireAuth`, `createUser`
