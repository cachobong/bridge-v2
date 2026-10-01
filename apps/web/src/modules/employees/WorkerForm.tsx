import {
  createWorkerSchema,
  updateWorkerSchema,
  WORKER_TYPES,
  type CreateWorkerInput,
  type UpdateWorkerInput,
  type Worker,
  type WorkerType,
} from "@bridge/shared";
import { useState, type FormEvent, type ReactNode } from "react";
import { btnPrimary, btnSecondary, ErrorBox, inputClass, labelClass } from "../../lib/ui";

interface FormState {
  workerType: WorkerType;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  startDate: string;
  monthlySalary: string;
  hourlyRate: string;
  companyName: string;
  contractEndDate: string;
}

function initialState(worker?: Worker): FormState {
  return {
    workerType: worker?.workerType ?? "employee",
    firstName: worker?.firstName ?? "",
    lastName: worker?.lastName ?? "",
    email: worker?.email ?? "",
    jobTitle: worker?.jobTitle ?? "",
    department: worker?.department ?? "",
    startDate: worker?.startDate ?? "",
    monthlySalary: worker?.monthlySalary?.toString() ?? "",
    hourlyRate: worker?.hourlyRate?.toString() ?? "",
    companyName: worker?.companyName ?? "",
    contractEndDate: worker?.contractEndDate ?? "",
  };
}

const toNumber = (s: string) => (s.trim() === "" ? undefined : Number(s));

// Builds the API payload; only the fields of the selected worker type are sent.
function toPayload(s: FormState) {
  const common = {
    firstName: s.firstName,
    lastName: s.lastName,
    email: s.email,
    jobTitle: s.jobTitle,
    department: s.department.trim() || null,
    startDate: s.startDate,
  };
  return s.workerType === "employee"
    ? { ...common, workerType: s.workerType, monthlySalary: toNumber(s.monthlySalary) }
    : {
        ...common,
        workerType: s.workerType,
        hourlyRate: toNumber(s.hourlyRate),
        companyName: s.companyName.trim() || null,
        contractEndDate: s.contractEndDate || null,
      };
}

type Props =
  | { mode: "create"; onSubmit: (input: CreateWorkerInput) => void; worker?: undefined }
  | { mode: "edit"; worker: Worker; onSubmit: (input: UpdateWorkerInput) => void };

export function WorkerForm(props: Props & { submitting: boolean; error: string | null; onCancel: () => void }) {
  const [state, setState] = useState(() => initialState(props.worker));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof FormState) => (e: { target: { value: string } }) =>
    setState((prev) => ({ ...prev, [key]: e.target.value }));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = toPayload(state);
    // Edit sends the current status explicitly: the shared update schema defaults a missing status to "active".
    const parsed =
      props.mode === "create"
        ? createWorkerSchema.safeParse(payload)
        : updateWorkerSchema.safeParse({ ...payload, status: props.worker.status });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        next[key] ??= issue.code === "invalid_type" ? "Required" : issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    if (props.mode === "create") props.onSubmit(parsed.data as CreateWorkerInput);
    else props.onSubmit(parsed.data as UpdateWorkerInput);
  }

  const field = (key: keyof FormState, label: string, input: ReactNode) => (
    <div className="space-y-1">
      <label htmlFor={key} className={labelClass}>
        {label}
      </label>
      {input}
      {errors[key] && <p className="text-xs text-red-600">{errors[key]}</p>}
    </div>
  );
  const text = (key: keyof FormState, label: string, type = "text") =>
    field(key, label, <input id={key} type={type} step={type === "number" ? "0.01" : undefined} className={inputClass} value={state[key]} onChange={set(key)} />);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {props.error && <ErrorBox>{props.error}</ErrorBox>}
      {props.mode === "create" && (
        <div className="inline-flex rounded-md border border-slate-300 p-0.5">
          {WORKER_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setState((prev) => ({ ...prev, workerType: t }))}
              className={`rounded px-3 py-1.5 text-sm font-medium capitalize ${
                state.workerType === t ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {text("firstName", "First name")}
        {text("lastName", "Last name")}
        {text("email", "Email", "email")}
        {text("jobTitle", "Job title")}
        {text("department", "Department (optional)")}
        {text("startDate", "Start date", "date")}
        {state.workerType === "employee" ? (
          text("monthlySalary", "Monthly salary", "number")
        ) : (
          <>
            {text("hourlyRate", "Hourly rate", "number")}
            {text("companyName", "Company (optional)")}
            {text("contractEndDate", "Contract end date (optional)", "date")}
          </>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className={btnSecondary} onClick={props.onCancel}>
          Cancel
        </button>
        <button type="submit" className={btnPrimary} disabled={props.submitting}>
          {props.submitting ? "Saving…" : props.mode === "create" ? "Add worker" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
