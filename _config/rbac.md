# RBAC (Layer 3 reference)

Users have one or more roles. Roles grant permissions. The API checks permissions, never role names
(exception: a user cannot remove their own `admin` role).

## Permissions
| Key | Grants |
|-----|--------|
| `employees:read` | List and view workers |
| `employees:write` | Create and edit workers |
| `payroll_periods:read` | List payroll periods |
| `payroll_periods:write` | Generate, close and reopen payroll periods |
| `rbac:read` | List users, roles and permissions |
| `rbac:write` | Assign roles to users |
| `self:read` | View the own linked worker record (`/me`) |

## Role matrix
| Permission | admin | hr | payroll | viewer | employee |
|------------|:-----:|:--:|:-------:|:------:|:--------:|
| employees:read | ✓ | ✓ | ✓ | ✓ | |
| employees:write | ✓ | ✓ | | | |
| payroll_periods:read | ✓ | ✓ | ✓ | ✓ | |
| payroll_periods:write | ✓ | | ✓ | | |
| rbac:read | ✓ | | | | |
| rbac:write | ✓ | | | | |
| self:read | ✓ | ✓ | ✓ | ✓ | ✓ |

Create, link or unlink a worker's login needs both `employees:write` and `rbac:write` (only `admin` today).

## Where it lives
- Source of truth: rows in `roles`, `permissions`, `role_permissions` (seeded in the migrations).
- Type-safe keys: `packages/shared/src/rbac.ts` (`PERMISSIONS`, `ROLES`). Keep it in sync with the migration.
- Enforcement: `requirePermission(...)` in `apps/api/src/modules/rbac/middleware.ts`.

## Add a permission or role
1. Add a migration that inserts the row(s) and the `role_permissions` links.
2. Add the key to `packages/shared/src/rbac.ts`.
3. Use `requirePermission("<key>")` on the route, and `hasPermission("<key>")` in the web app.
4. Update the matrix above.
