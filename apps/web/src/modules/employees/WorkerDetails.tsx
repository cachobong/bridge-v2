import type { Worker } from "@bridge/shared";
import type { ReactNode } from "react";
import { formatAmount, formatDate } from "../../lib/format";

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{children}</dd>
    </div>
  );
}

// Read-only fields of a worker. Used by the detail page and "My profile".
export function WorkerDetails({ worker: w }: { worker: Worker }) {
  return (
    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <Item label="Email">{w.email}</Item>
      <Item label="Job title">{w.jobTitle}</Item>
      <Item label="Department">{w.department ?? "—"}</Item>
      <Item label="Start date">{formatDate(w.startDate)}</Item>
      {w.workerType === "employee" ? (
        <Item label="Monthly salary">{formatAmount(w.monthlySalary)}</Item>
      ) : (
        <>
          <Item label="Hourly rate">{formatAmount(w.hourlyRate)}</Item>
          <Item label="Company">{w.companyName ?? "—"}</Item>
          <Item label="Contract end date">{formatDate(w.contractEndDate)}</Item>
        </>
      )}
    </dl>
  );
}
