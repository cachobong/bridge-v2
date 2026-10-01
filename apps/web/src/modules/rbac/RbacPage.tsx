import { PERMISSIONS, ROLES, type Role, type UserWithRoles } from "@bridge/shared";
import { errorMessage } from "../../lib/api";
import { ErrorBox } from "../../lib/ui";
import { useAuth } from "../auth";
import { useRoles, useSetUserRoles, useUsers } from "./api";

const th = "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500";

export function RbacPage() {
  const { user: me, hasPermission, refresh } = useAuth();
  const canWrite = hasPermission("rbac:write");
  const users = useUsers();
  const roles = useRoles();
  const setRoles = useSetUserRoles();

  function toggle(user: UserWithRoles, role: Role) {
    const next = user.roles.includes(role) ? user.roles.filter((r) => r !== role) : [...user.roles, role];
    setRoles.mutate(
      { userId: user.id, roles: next },
      // Changing your own roles changes your permissions.
      { onSuccess: () => (user.id === me?.id ? refresh() : undefined) },
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-xl font-semibold">Users & Roles</h1>
        {users.isError && <ErrorBox>{errorMessage(users.error)}</ErrorBox>}
        {setRoles.isError && <ErrorBox>{errorMessage(setRoles.error)}</ErrorBox>}
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>User</th>
                {ROLES.map((r) => (
                  <th key={r} className={`${th} text-center capitalize`}>
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.isPending && (
                <tr>
                  <td colSpan={ROLES.length + 1} className="px-4 py-6 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              )}
              {users.data?.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{u.fullName}</div>
                    <div className="text-xs text-slate-500">{u.username}</div>
                  </td>
                  {ROLES.map((r) => (
                    <td key={r} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        aria-label={`${u.username} ${r}`}
                        className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                        checked={u.roles.includes(r)}
                        disabled={!canWrite || setRoles.isPending}
                        onChange={() => toggle(u, r)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Role permissions</h2>
        {roles.isError && <ErrorBox>{errorMessage(roles.error)}</ErrorBox>}
        {roles.data && (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className={th}>Permission</th>
                  {roles.data.map((role) => (
                    <th key={role.key} className={`${th} text-center`}>
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PERMISSIONS.map((p) => (
                  <tr key={p}>
                    <td className="px-4 py-2 font-mono text-xs text-slate-700">{p}</td>
                    {roles.data.map((role) => (
                      <td key={role.key} className="px-4 py-2 text-center text-slate-900">
                        {role.permissions.includes(p) ? "✓" : <span className="text-slate-300">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
