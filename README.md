# Bridge v2

Proof of concept for an all-in-one workforce platform (HR, IT, payroll, finance), in the style of Rippling.

**POC features:** username/password login (Supabase Auth) · RBAC · worker list (employees and contractors) · bi-monthly payroll periods.

**Stack:** Turborepo + pnpm · React 19 + Vite + TypeScript (`apps/web`) · Hono + TypeScript (`apps/api`) · Supabase Postgres + Auth (`supabase`) · shared zod schemas (`packages/shared`).

**Structure:** a modular monolith, documented with the [Interpretable Context Methodology](https://arxiv.org/abs/2603.16021). Start with [`CLAUDE.md`](CLAUDE.md) and [`CONTEXT.md`](CONTEXT.md).

## Run locally
Requires Node 22+, pnpm 10, and Docker.

```sh
pnpm install
pnpm db:start                 # local Supabase in Docker; applies migrations
cp .env.example .env          # fill the keys from: pnpm exec supabase status
pnpm db:seed                  # demo users and workers
pnpm dev                      # API on :8787, web on :5173
```

Demo users (password `Password123!`): `admin`, `hr`, `payroll`, `viewer`, and `maria` (role `employee`, linked to the worker Maria Lopez; sees only "My profile"). See [`_config/rbac.md`](_config/rbac.md) for what each role can do.

## Scripts
| Script | Does |
|--------|------|
| `pnpm dev` | Run API and web in watch mode |
| `pnpm typecheck` / `pnpm test` / `pnpm build` | Checks (run all three before you push) |
| `pnpm db:reset` | Recreate the local database from migrations |
| `pnpm db:types` | Regenerate `apps/api/src/lib/database.types.ts` |
| `pnpm db:seed` | Create demo data (safe to run more than once) |
