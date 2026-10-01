-- Bridge v2 initial schema: profiles, RBAC, workers, payroll periods.
-- All tables enable RLS with no policies. Only the API (service role) reads and writes them.

-- ---------------------------------------------------------------------------
-- Profiles: one row per auth user. `username` is the login name.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9._-]{2,32}$'),
  full_name text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RBAC
-- ---------------------------------------------------------------------------
create table public.roles (
  key text primary key,
  name text not null
);

create table public.permissions (
  key text primary key,
  description text not null
);

create table public.role_permissions (
  role_key text not null references public.roles (key) on delete cascade,
  permission_key text not null references public.permissions (key) on delete cascade,
  primary key (role_key, permission_key)
);

create table public.user_roles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  role_key text not null references public.roles (key) on delete cascade,
  primary key (user_id, role_key)
);

insert into public.roles (key, name) values
  ('admin', 'Administrator'),
  ('hr', 'HR Manager'),
  ('payroll', 'Payroll Manager'),
  ('viewer', 'Viewer');

insert into public.permissions (key, description) values
  ('employees:read', 'View employees and contractors'),
  ('employees:write', 'Create and edit employees and contractors'),
  ('payroll_periods:read', 'View payroll periods'),
  ('payroll_periods:write', 'Generate and close payroll periods'),
  ('rbac:read', 'View users and roles'),
  ('rbac:write', 'Assign roles to users');

insert into public.role_permissions (role_key, permission_key)
select 'admin', key from public.permissions;

insert into public.role_permissions (role_key, permission_key) values
  ('hr', 'employees:read'),
  ('hr', 'employees:write'),
  ('hr', 'payroll_periods:read'),
  ('payroll', 'employees:read'),
  ('payroll', 'payroll_periods:read'),
  ('payroll', 'payroll_periods:write'),
  ('viewer', 'employees:read'),
  ('viewer', 'payroll_periods:read');

-- ---------------------------------------------------------------------------
-- Workers: normal employees and contractors in one table.
-- ---------------------------------------------------------------------------
create type public.worker_type as enum ('employee', 'contractor');
create type public.worker_status as enum ('active', 'inactive');

create table public.workers (
  id uuid primary key default gen_random_uuid(),
  worker_type public.worker_type not null,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  job_title text not null,
  department text,
  start_date date not null,
  status public.worker_status not null default 'active',
  -- employee only
  monthly_salary numeric(12, 2) check (monthly_salary >= 0),
  -- contractor only
  company_name text,
  hourly_rate numeric(12, 2) check (hourly_rate >= 0),
  contract_end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workers_type_fields check (
    (worker_type = 'employee' and monthly_salary is not null
      and hourly_rate is null and company_name is null and contract_end_date is null)
    or
    (worker_type = 'contractor' and hourly_rate is not null and monthly_salary is null)
  ),
  constraint workers_contract_dates check (contract_end_date is null or contract_end_date >= start_date)
);

create index workers_type_idx on public.workers (worker_type);

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger workers_set_updated_at before update on public.workers
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Payroll periods: bi-monthly. half 1 = 1st-15th, half 2 = 16th-last day.
-- ---------------------------------------------------------------------------
create type public.payroll_period_status as enum ('open', 'closed');

create table public.payroll_periods (
  id uuid primary key default gen_random_uuid(),
  year int not null check (year between 2000 and 2100),
  month int not null check (month between 1 and 12),
  half smallint not null check (half in (1, 2)),
  start_date date not null,
  end_date date not null,
  status public.payroll_period_status not null default 'open',
  created_at timestamptz not null default now(),
  unique (year, month, half),
  constraint payroll_periods_dates check (
    start_date = make_date(year, month, case when half = 1 then 1 else 16 end)
    and end_date = case
      when half = 1 then make_date(year, month, 15)
      else (date_trunc('month', make_date(year, month, 1)) + interval '1 month - 1 day')::date
    end
  )
);

-- ---------------------------------------------------------------------------
-- Row level security: deny all to anon and authenticated roles.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.workers enable row level security;
alter table public.payroll_periods enable row level security;
