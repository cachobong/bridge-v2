import type { Permission } from "@bridge/shared";
import { Navigate, NavLink, Outlet } from "react-router";
import { btnSecondary } from "../../lib/ui";
import { NoAccessPage, useAuth } from "../auth";

const NAV_ITEMS: { to: string; label: string; permission: Permission }[] = [
  { to: "/employees", label: "Employees", permission: "employees:read" },
  { to: "/payroll-periods", label: "Payroll Periods", permission: "payroll_periods:read" },
  { to: "/rbac", label: "Users & Roles", permission: "rbac:read" },
  // Last, so `/` picks it only for users with no other page (for example the employee role).
  { to: "/me", label: "My profile", permission: "self:read" },
];

export function AppLayout() {
  const { user, hasPermission, logout } = useAuth();
  const items = NAV_ITEMS.filter((item) => hasPermission(item.permission));

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="w-56 shrink-0 border-r border-slate-200 bg-white">
        <div className="px-5 py-4 text-lg font-semibold tracking-tight">Bridge</div>
        <nav className="space-y-1 px-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-4 border-b border-slate-200 bg-white px-6 py-3">
          <div className="text-right">
            <div className="text-sm font-medium">{user?.fullName}</div>
            <div className="text-xs text-slate-500">{user?.roles.join(", ") || "No roles"}</div>
          </div>
          <button className={btnSecondary} onClick={() => void logout()}>
            Log out
          </button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// `/` goes to the first page the user may see.
export function HomeRedirect() {
  const { hasPermission } = useAuth();
  const first = NAV_ITEMS.find((item) => hasPermission(item.permission));
  return first ? <Navigate to={first.to} replace /> : <NoAccessPage />;
}
