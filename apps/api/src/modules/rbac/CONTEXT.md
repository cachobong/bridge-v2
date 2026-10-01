# rbac (api)
Roles, permissions, user-role assignment, and the `requirePermission` middleware.

## Inputs
- `_config/rbac.md` (permission list and role matrix)
- `packages/shared/src/rbac.ts`, `packages/shared/src/schemas/rbac.ts`
- `apps/api/src/lib/supabase.ts`, `apps/api/src/lib/errors.ts`

## Process
- Check permissions, not role names. `requirePermission(...keys)` needs **all** listed keys.
- This module must not import other modules (it only reads `c.get("user")`).
- `PUT /users/:id/roles` replaces the full role list. A user cannot remove their own `admin` role.
- Owns tables `roles`, `permissions`, `role_permissions`, `user_roles`.

## Outputs
- `GET /api/rbac/roles` → `RoleDefinition[]` (`rbac:read`)
- `GET /api/rbac/users` → `UserWithRoles[]` (`rbac:read`)
- `PUT /api/rbac/users/:id/roles` body `{ roles }` → `UserWithRoles` (`rbac:write`)
- `index.ts`: `rbacRoutes`, `requirePermission`, `getUserAccess`, `setUserRoles`
