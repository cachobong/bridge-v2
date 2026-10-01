import { ApiError, errorMessage } from "../../lib/api";
import { ErrorBox } from "../../lib/ui";
import { useMyWorker } from "./api";
import { WorkerDetails } from "./WorkerDetails";
import { WorkerStatusBadge, WorkerTypeBadge } from "./WorkerTypeBadge";

// Read-only view of the worker record linked to the signed-in user.
export function MyProfilePage() {
  const me = useMyWorker();

  if (me.isPending) return <div className="text-sm text-slate-500">Loading…</div>;
  if (me.isError) {
    const notLinked = me.error instanceof ApiError && me.error.status === 404;
    return (
      <div className="max-w-3xl space-y-4">
        <h1 className="text-xl font-semibold">My profile</h1>
        {notLinked ? (
          <p className="text-sm text-slate-500">No worker record is linked to your account. Ask HR to link it.</p>
        ) : (
          <ErrorBox>{errorMessage(me.error)}</ErrorBox>
        )}
      </div>
    );
  }

  const w = me.data;
  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">
          {w.firstName} {w.lastName}
        </h1>
        <div className="mt-1 flex items-center gap-2">
          <WorkerTypeBadge type={w.workerType} />
          <WorkerStatusBadge status={w.status} />
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <WorkerDetails worker={w} />
      </div>
    </div>
  );
}
