import { useState } from "react";
import { errorMessage } from "../../lib/api";
import { formatDate } from "../../lib/format";
import { Badge, btnSecondary, ErrorBox, inputClass } from "../../lib/ui";
import { useAuth } from "../auth";
import { usePeriods, useUpdatePeriod } from "./api";
import { GeneratePanel } from "./GeneratePanel";
import { periodLabel } from "./labels";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 2 + i);

export function PayrollPeriodsPage() {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("payroll_periods:write");
  const [year, setYear] = useState(CURRENT_YEAR);
  const periods = usePeriods(year);
  const update = useUpdatePeriod();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Payroll Periods</h1>
        <select aria-label="Year" className={`${inputClass} w-28`} value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <p className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-600">
        Payroll runs twice a month. The 1st half is the 1st–15th; the 2nd half is the 16th–last day of the month.
      </p>

      {canWrite && <GeneratePanel key={year} years={YEARS} defaultYear={year} />}

      {periods.isError && <ErrorBox>{errorMessage(periods.error)}</ErrorBox>}
      {update.isError && <ErrorBox>{errorMessage(update.error)}</ErrorBox>}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Start</th>
              <th className="px-4 py-3">End</th>
              <th className="px-4 py-3">Status</th>
              {canWrite && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {periods.isPending && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            )}
            {periods.data?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  No periods for {year} yet.
                </td>
              </tr>
            )}
            {periods.data?.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{periodLabel(p)}</td>
                <td className="px-4 py-3">{formatDate(p.startDate)}</td>
                <td className="px-4 py-3">{formatDate(p.endDate)}</td>
                <td className="px-4 py-3">
                  {p.status === "open" ? <Badge tone="green">Open</Badge> : <Badge>Closed</Badge>}
                </td>
                {canWrite && (
                  <td className="px-4 py-3 text-right">
                    <button
                      className={btnSecondary}
                      disabled={update.isPending}
                      onClick={() => update.mutate({ id: p.id, status: p.status === "open" ? "closed" : "open" })}
                    >
                      {p.status === "open" ? "Close" : "Reopen"}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
