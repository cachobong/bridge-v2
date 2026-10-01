import type { Permission } from "@bridge/shared";
import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { errorMessage } from "../../lib/api";
import { btnSecondary } from "../../lib/ui";
import { useAuth } from "./AuthProvider";

function FullPage({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-sm text-slate-600">{children}</div>;
}

// Renders child routes only for a signed-in user with a loaded profile.
export function RequireAuth() {
  const { status, error, logout } = useAuth();
  const location = useLocation();

  if (status === "loading") return <FullPage>Loading…</FullPage>;
  if (status === "anonymous") return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (status === "error") {
    return (
      <FullPage>
        <div className="space-y-3 text-center">
          <p>Could not load your account: {errorMessage(error)}</p>
          <button className={btnSecondary} onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </FullPage>
    );
  }
  return <Outlet />;
}

export function NoAccessPage() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-lg font-semibold text-slate-900">No access</h1>
      <p className="mt-2 text-sm text-slate-500">You do not have permission to view this page.</p>
    </div>
  );
}

// Renders child routes only when the user has the permission.
export function RequirePermission({ permission }: { permission: Permission }) {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? <Outlet /> : <NoAccessPage />;
}
