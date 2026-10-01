import type { Permission, Role, RoleDefinition, UserWithRoles } from "@bridge/shared";
import { fromDbError } from "../../lib/errors.js";
import { db } from "../../lib/supabase.js";

export async function getUserAccess(userId: string): Promise<{ roles: Role[]; permissions: Permission[] }> {
  const { data, error } = await db
    .from("user_roles")
    .select("role_key, roles(role_permissions(permission_key))")
    .eq("user_id", userId);
  if (error) throw fromDbError(error);

  const roles = data.map((r) => r.role_key as Role);
  const permissions = new Set<Permission>();
  for (const row of data) {
    for (const rp of row.roles?.role_permissions ?? []) permissions.add(rp.permission_key as Permission);
  }
  return { roles, permissions: [...permissions].sort() };
}

export async function listRoles(): Promise<RoleDefinition[]> {
  const { data, error } = await db.from("roles").select("key, name, role_permissions(permission_key)").order("key");
  if (error) throw fromDbError(error);
  return data.map((r) => ({
    key: r.key as Role,
    name: r.name,
    permissions: r.role_permissions.map((rp) => rp.permission_key).sort(),
  }));
}

export async function listUsers(): Promise<UserWithRoles[]> {
  const { data, error } = await db.from("profiles").select("id, username, full_name, user_roles(role_key)").order("username");
  if (error) throw fromDbError(error);
  return data.map((p) => ({
    id: p.id,
    username: p.username,
    fullName: p.full_name,
    roles: p.user_roles.map((ur) => ur.role_key as Role),
  }));
}

export async function getUser(userId: string): Promise<UserWithRoles | null> {
  const users = await listUsers();
  return users.find((u) => u.id === userId) ?? null;
}

export async function setUserRoles(userId: string, roles: Role[]): Promise<void> {
  const del = await db.from("user_roles").delete().eq("user_id", userId);
  if (del.error) throw fromDbError(del.error);
  if (roles.length === 0) return;
  const ins = await db.from("user_roles").insert(roles.map((role_key) => ({ user_id: userId, role_key })));
  if (ins.error) throw fromDbError(ins.error);
}
