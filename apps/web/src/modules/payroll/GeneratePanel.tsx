import { generatePeriodsSchema, periodsForMonth, periodsForYear } from "@bridge/shared";
import { useState } from "react";
import { errorMessage } from "../../lib/api";
import { formatDate, MONTHS_SHORT } from "../../lib/format";
import { btnPrimary, ErrorBox, inputClass, labelClass } from "../../lib/ui";
import { useGeneratePeriods } from "./api";
import { periodLabel } from "./labels";

export function GeneratePanel({ years, defaultYear }: { years: number[]; defaultYear: number }) {
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState<number | undefined>();
  const generate = useGeneratePeriods();

  const preview = month ? periodsForMonth(year, month) : periodsForYear(year);

  function onGenerate() {
    const input = generatePeriodsSchema.parse(month ? { year, month } : { year });
    generate.mutate(input);
  }

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-900">Generate periods</h2>
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="gen-year" className={labelClass}>
            Year
          </label>
          <select id="gen-year" className={`${inputClass} w-28`} value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="gen-month" className={labelClass}>
            Month
          </label>
          <select
            id="gen-month"
            className={`${inputClass} w-40`}
            value={month ?? ""}
            onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">All months</option>
            {MONTHS_SHORT.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <button className={btnPrimary} onClick={onGenerate} disabled={generate.isPending}>
          {generate.isPending ? "Generating…" : `Generate ${preview.length} periods`}
        </button>
      </div>

      {generate.isError && <ErrorBox>{errorMessage(generate.error)}</ErrorBox>}
      {generate.isSuccess && (
        <p className="text-sm text-slate-600">
          Created {generate.data.created.length} period(s). Existing periods were skipped.
        </p>
      )}

      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Preview</div>
        <ul className="grid max-h-48 grid-cols-1 gap-x-6 gap-y-1 overflow-y-auto text-sm text-slate-700 sm:grid-cols-2">
          {preview.map((p) => (
            <li key={`${p.month}-${p.half}`}>
              <span className="font-medium">{periodLabel(p)}</span>: {formatDate(p.startDate)} – {formatDate(p.endDate)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
