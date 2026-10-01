# Task routing — Layer 1

Find the task type, then load the listed contracts (Layer 2). Load nothing else until a contract asks for it.

| Task | Load |
|------|------|
| Change the database schema | `supabase/CONTEXT.md`, then the API module that owns the table |
| Add or change an API endpoint | `apps/api/CONTEXT.md`, `apps/api/src/modules/<module>/CONTEXT.md` |
| Change a request/response shape | `packages/shared/CONTEXT.md`, then the API module and the web module that use it |
| Change payroll period rules | `packages/shared/CONTEXT.md`, `supabase/CONTEXT.md` (the DB check mirrors the rule), `_config/domain.md` |
| Add a role or permission | `_config/rbac.md`, `supabase/CONTEXT.md`, `packages/shared/CONTEXT.md` |
| Change a page or UI flow | `apps/web/CONTEXT.md`, `apps/web/src/modules/<module>/CONTEXT.md` |
| Login / session problems | `apps/api/src/modules/auth/CONTEXT.md`, `apps/web/src/modules/auth/CONTEXT.md` |
| Add a new module | `_config/architecture.md`, `_config/conventions.md`, then copy the closest module |

## Modules
| Module | API | Web | Owns tables |
|--------|-----|-----|-------------|
| auth | `apps/api/src/modules/auth` | `apps/web/src/modules/auth` | `profiles` |
| rbac | `apps/api/src/modules/rbac` | `apps/web/src/modules/rbac` | `roles`, `permissions`, `role_permissions`, `user_roles` |
| employees | `apps/api/src/modules/employees` | `apps/web/src/modules/employees` | `workers` |
| payroll | `apps/api/src/modules/payroll` | `apps/web/src/modules/payroll` | `payroll_periods` |

## References (Layer 3)
- `_config/architecture.md` — modular monolith rules, request flow, module dependencies
- `_config/conventions.md` — code style, naming, error format, required checks
- `_config/domain.md` — glossary, worker types, payroll period rule
- `_config/rbac.md` — roles, permissions, and the role/permission matrix
