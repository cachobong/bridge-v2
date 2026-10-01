import { useState } from "react";
import { Link, useParams } from "react-router";
import { errorMessage } from "../../lib/api";
import { btnPrimary, btnSecondary, ErrorBox } from "../../lib/ui";
import { useAuth } from "../auth";
import { AccountSection } from "./AccountSection";
import { useUpdateWorker, useWorker } from "./api";
import { WorkerDetails } from "./WorkerDetails";
import { WorkerForm } from "./WorkerForm";
import { WorkerStatusBadge, WorkerTypeBadge } from "./WorkerTypeBadge";

export function EmployeeDetailPage() {
  const { id = "" } = useParams();
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("employees:write");
  const worker = useWorker(id);
  const update = useUpdateWorker(id);
  const [editing, setEditing] = useState(false);

  const back = (
    <Link to="/employees" className="text-sm text-slate-500 hover:text-slate-900">
      ← Back to employees
    </Link>
  );

  if (worker.isPending) return <div className="text-sm text-slate-500">Loading…</div>;
  if (worker.isError) {
    return (
      <div className="space-y-4">
        {back}
        <ErrorBox>{errorMessage(worker.error)}</ErrorBox>
      </div>
    );
  }

  const w = worker.data;
  const toggleStatus = () => {
    // Deactivation also blocks the linked login (the API bans the user).
    if (w.status === "active" && w.username && !window.confirm(`Deactivate ${w.firstName}? The login "${w.username}" will be blocked.`)) return;
    update.mutate({ workerType: w.workerType, status: w.status === "active" ? "inactive" : "active" });
  };

  return (
    <div className="max-w-3xl space-y-4">
      {back}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">
            {w.firstName} {w.lastName}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <WorkerTypeBadge type={w.workerType} />
            <WorkerStatusBadge status={w.status} />
          </div>
        </div>
        {canWrite && !editing && (
          <div className="flex gap-2">
            <button className={btnSecondary} onClick={toggleStatus} disabled={update.isPending}>
              {w.status === "active" ? "Deactivate" : "Activate"}
            </button>
            <button
              className={btnPrimary}
              onClick={() => {
                update.reset();
                setEditing(true);
              }}
            >
              Edit
            </button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        {editing ? (
          <WorkerForm
            mode="edit"
            worker={w}
            submitting={update.isPending}
            error={update.isError ? errorMessage(update.error) : null}
            onCancel={() => setEditing(false)}
            onSubmit={(input) => update.mutate(input, { onSuccess: () => setEditing(false) })}
          />
        ) : (
          <>
            {update.isError && (
              <div className="mb-4">
                <ErrorBox>{errorMessage(update.error)}</ErrorBox>
              </div>
            )}
            <WorkerDetails worker={w} />
          </>
        )}
      </div>

      <AccountSection worker={w} />
    </div>
  );
}
