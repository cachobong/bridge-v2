import { linkAccountSchema, type Worker } from "@bridge/shared";
import { useState, type FormEvent } from "react";
import { errorMessage } from "../../lib/api";
import { btnPrimary, btnSecondary, ErrorBox, inputClass, labelClass } from "../../lib/ui";
import { useAuth } from "../auth";
import { useUsers } from "../rbac";
import { useLinkAccount, useUnlinkAccount } from "./api";

type Mode = "new" | "existing";

// Shows the worker's login account. With employees:write + rbac:write it can create, link or unlink one.
export function AccountSection({ worker }: { worker: Worker }) {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("employees:write") && hasPermission("rbac:write");

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-slate-900">Login account</h2>
      {worker.username ? (
        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-700">
            Linked to user <span className="font-medium">{worker.username}</span>.
          </p>
          {canManage && <UnlinkButton workerId={worker.id} />}
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-slate-500">No login. This worker cannot sign in.</p>
          {canManage && <LinkForm workerId={worker.id} />}
        </>
      )}
    </div>
  );
}

function UnlinkButton({ workerId }: { workerId: string }) {
  const unlink = useUnlinkAccount(workerId);
  return (
    <div className="flex flex-col items-end gap-2">
      <button className={btnSecondary} disabled={unlink.isPending} onClick={() => unlink.mutate()}>
        Unlink
      </button>
      {unlink.isError && <ErrorBox>{errorMessage(unlink.error)}</ErrorBox>}
    </div>
  );
}

function LinkForm({ workerId }: { workerId: string }) {
  const link = useLinkAccount(workerId);
  const users = useUsers();
  const [mode, setMode] = useState<Mode>("new");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = linkAccountSchema.safeParse(mode === "new" ? { mode, username, password } : { mode, userId });
    if (!parsed.success) {
      setFormError(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
      return;
    }
    setFormError(null);
    link.mutate(parsed.data);
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="radio" checked={mode === "new"} onChange={() => setMode("new")} /> Create a new login
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" checked={mode === "existing"} onChange={() => setMode("existing")} /> Link an existing user
        </label>
      </div>

      {mode === "new" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Username</label>
            <input className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="off" />
          </div>
          <div>
            <label className={labelClass}>Temporary password</label>
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <p className="text-xs text-slate-500 sm:col-span-2">
            The login uses the worker's email and gets the Employee role.
          </p>
        </div>
      ) : (
        <div>
          <label className={labelClass}>User</label>
          <select className={inputClass} value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="">Select a user…</option>
            {users.data?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username} — {u.fullName}
              </option>
            ))}
          </select>
          {users.isError && <ErrorBox>{errorMessage(users.error)}</ErrorBox>}
        </div>
      )}

      {(formError || link.isError) && <ErrorBox>{formError ?? errorMessage(link.error)}</ErrorBox>}
      <button className={btnPrimary} type="submit" disabled={link.isPending}>
        {mode === "new" ? "Create login" : "Link user"}
      </button>
    </form>
  );
}
