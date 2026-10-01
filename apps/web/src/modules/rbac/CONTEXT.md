# rbac (web)
Assign roles to users and show the read-only role/permission matrix.

## Inputs
- `packages/shared/src/rbac.ts` (`PERMISSIONS`, `ROLES`, `Permission`, `Role`)
- `packages/shared/src/schemas/rbac.ts` (`UserWithRoles`, `RoleDefinition`)
- `apps/web/src/lib/api.ts`, `apps/web/src/lib/ui.tsx`
- `apps/web/src/modules/auth/index.ts` (`useAuth`)
- `_config/conventions.md`, `_config/architecture.md`

## Process
- `api.ts` holds the react-query hooks for `/api/rbac` (query keys start with `"rbac"`).
- A role checkbox change sends the full new role list with `PUT /api/rbac/users/:id/roles`.
- When the user changes their own roles, call `useAuth().refresh()` to reload permissions.
- Checkboxes are editable only with `rbac:write`. The matrix is read-only.
- Matrix rows come from shared `PERMISSIONS`; columns come from `GET /api/rbac/roles`.

## Outputs
- `index.ts`: `RbacPage`, `useUsers` (used by the employees module to link an existing user)
- Route: `/rbac` (guarded by `rbac:read` in `App.tsx`)
