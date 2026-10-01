// Mirrors the rows seeded in supabase/migrations. Keep both in sync.
export const PERMISSIONS = [
  "employees:read",
  "employees:write",
  "payroll_periods:read",
  "payroll_periods:write",
  "rbac:read",
  "rbac:write",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLES = ["admin", "hr", "payroll", "viewer"] as const;

export type Role = (typeof ROLES)[number];
