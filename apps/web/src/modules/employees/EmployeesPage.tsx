import type { WorkerStatus, WorkerType } from "@bridge/shared";
import { useDeferredValue, useState } from "react";
import { useNavigate } from "react-router";
import { errorMessage } from "../../lib/api";
import { formatAmount } from "../../lib/format";
import { btnPrimary, ErrorBox, inputClass } from "../../lib/ui";
import { useAuth } from "../auth";
import { useCreateWorker, useWorkers } from "./api";
import { WorkerForm } from "./WorkerForm";
import { WorkerStatusBadge, WorkerTypeBadge } from "./WorkerTypeBadge";

const TABS: { value: WorkerType | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  { value: "employee", label: "Employees" },
  { value: "contractor", label: "Contractors" },
];

export function EmployeesPage() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState<WorkerType | undefined>();
  const [status, setStatus] = useState<WorkerStatus | "">("");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [adding, setAdding] = useState(false);

  const workers = useWorkers({ type, status: status || undefined, search: deferredSearch || undefined });
  const create = useCreateWorker();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Employees</h1>
        {hasPermission("employees:write") && (
          <button
            className={btnPrimary}
            onClick={() => {
              create.reset();
              setAdding(true);
            }}
          >
            Add worker
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-md border border-slate-300 bg-white p-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setType(tab.value)}
              className={`rounded px-3 py-1.5 text-sm font-medium ${
                type === tab.value ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <select
          aria-label="Status"
          className={`${inputClass} w-40`}
          value={status}
          onChange={(e) => setStatus(e.target.value as WorkerStatus | "")}
        >
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <input
          type="search"
          placeholder="Search name, email, title…"
          className={`${inputClass} w-64`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {workers.isError && <ErrorBox>{errorMessage(workers.error)}</ErrorBox>}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Job title</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Pay</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {workers.isPending && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            )}
            {workers.data?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No workers found.
                </td>
              </tr>
            )}
            {workers.data?.map((w) => (
              <tr key={w.id} onClick={() => navigate(`/employees/${w.id}`)} className="cursor-pointer hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">
                    {w.firstName} {w.lastName}
                  </div>
                  <div className="text-xs text-slate-500">{w.email}</div>
                </td>
                <td className="px-4 py-3">
                  <WorkerTypeBadge type={w.workerType} />
                </td>
                <td className="px-4 py-3">{w.jobTitle}</td>
                <td className="px-4 py-3">{w.department ?? "—"}</td>
                <td className="px-4 py-3">
                  {w.workerType === "employee" ? (
                    <>{formatAmount(w.monthlySalary)} / month</>
                  ) : (
                    <>
                      <div>{formatAmount(w.hourlyRate)} / hour</div>
                      <div className="text-xs text-slate-500">{w.companyName ?? "Independent"}</div>
                    </>
                  )}
                </td>
                <td className="px-4 py-3">
                  <WorkerStatusBadge status={w.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {adding && (
        <div className="fixed inset-0 z-10 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 pt-16">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Add worker</h2>
            <WorkerForm
              mode="create"
              submitting={create.isPending}
              error={create.isError ? errorMessage(create.error) : null}
              onCancel={() => setAdding(false)}
              onSubmit={(input) => create.mutate(input, { onSuccess: () => setAdding(false) })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
