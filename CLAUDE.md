# Bridge v2 — Layer 0 (workspace identity)

Bridge is a proof of concept for an all-in-one workforce platform (like Rippling).
POC scope: username/password login, RBAC, a worker list (employees and contractors), and bi-monthly payroll periods.

This repository follows the Interpretable Context Methodology (ICM, arXiv:2603.16021):
context lives in plain-text files, layered so that an agent loads only what one task needs.

| Layer | File | Question it answers |
|-------|------|---------------------|
| 0 | `CLAUDE.md` (this file) | Where am I? |
| 1 | `CONTEXT.md` | Where do I go for this task? |
| 2 | `<unit>/CONTEXT.md` | What do I do in this unit? (Inputs / Process / Outputs) |
| 3 | `_config/*.md` | What rules apply? (stable references) |
| 4 | the source files a contract lists | What am I working with? |

## How to work here
1. Read `CONTEXT.md` and pick the unit(s) the task touches.
2. Read only that unit's `CONTEXT.md`, then the files in its **Inputs**.
3. Change only the files in its **Outputs**. If you must change another unit, read its contract first.
4. If you change a rule, a contract, or a module boundary, update the matching `CONTEXT.md` or `_config/` file in the same change.
5. Run the checks in `_config/conventions.md` before you finish.

## Layout
```
apps/api        Hono API (modular monolith)        → apps/api/CONTEXT.md
apps/web        React + Vite SPA                   → apps/web/CONTEXT.md
packages/shared Types, zod schemas, domain rules   → packages/shared/CONTEXT.md
supabase        Migrations and local config        → supabase/CONTEXT.md
_config         Layer 3 references (architecture, conventions, domain, rbac)
```

## Quick start
`pnpm install` · `pnpm db:start` · copy `.env.example` to `.env` (keys from `pnpm exec supabase status`) · `pnpm db:seed` · `pnpm dev`
