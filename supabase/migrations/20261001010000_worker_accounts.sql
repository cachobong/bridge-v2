-- Link workers to user accounts. A worker has at most one login; a user is linked to at most one worker.
alter table public.workers
  add column user_id uuid unique references public.profiles (id) on delete set null;

insert into public.permissions (key, description) values
  ('self:read', 'View own worker record');

insert into public.roles (key, name) values
  ('employee', 'Employee');

insert into public.role_permissions (role_key, permission_key) values
  ('employee', 'self:read'),
  ('admin', 'self:read'),
  ('hr', 'self:read'),
  ('payroll', 'self:read'),
  ('viewer', 'self:read');
