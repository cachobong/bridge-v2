import type { CreateWorkerInput, ListWorkersQuery, UpdateWorkerInput, Worker } from "@bridge/shared";
import { fromDbError } from "../../lib/errors.js";
import { db } from "../../lib/supabase.js";
import type { Tables, TablesInsert } from "../../lib/database.types.js";

type WorkerRow = Tables<"workers">;

function toWorker(r: WorkerRow): Worker {
  return {
    id: r.id,
    workerType: r.worker_type,
    firstName: r.first_name,
    lastName: r.last_name,
    email: r.email,
    jobTitle: r.job_title,
    department: r.department,
    startDate: r.start_date,
    status: r.status,
    monthlySalary: r.monthly_salary,
    companyName: r.company_name,
    hourlyRate: r.hourly_rate,
    contractEndDate: r.contract_end_date,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// Maps camelCase input to snake_case columns. Only keys present in the input are written.
function toRow(input: Partial<CreateWorkerInput> & Pick<CreateWorkerInput, "workerType">): Partial<TablesInsert<"workers">> {
  const row: Partial<TablesInsert<"workers">> = { worker_type: input.workerType };
  if (input.firstName !== undefined) row.first_name = input.firstName;
  if (input.lastName !== undefined) row.last_name = input.lastName;
  if (input.email !== undefined) row.email = input.email.toLowerCase();
  if (input.jobTitle !== undefined) row.job_title = input.jobTitle;
  if (input.department !== undefined) row.department = input.department;
  if (input.startDate !== undefined) row.start_date = input.startDate;
  if (input.status !== undefined) row.status = input.status;
  if (input.workerType === "employee") {
    if (input.monthlySalary !== undefined) row.monthly_salary = input.monthlySalary;
    // A worker that changes to employee loses the contractor fields.
    Object.assign(row, { hourly_rate: null, company_name: null, contract_end_date: null });
  } else {
    if (input.hourlyRate !== undefined) row.hourly_rate = input.hourlyRate;
    if (input.companyName !== undefined) row.company_name = input.companyName;
    if (input.contractEndDate !== undefined) row.contract_end_date = input.contractEndDate;
    row.monthly_salary = null;
  }
  return row;
}

export async function listWorkers(query: ListWorkersQuery): Promise<Worker[]> {
  let q = db.from("workers").select("*").order("last_name").order("first_name");
  if (query.type) q = q.eq("worker_type", query.type);
  if (query.status) q = q.eq("status", query.status);
  if (query.search) {
    // Strip characters that have meaning in PostgREST filter syntax.
    const term = query.search.replace(/[%,()*]/g, " ").trim();
    if (term) q = q.or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%,job_title.ilike.%${term}%`);
  }
  const { data, error } = await q;
  if (error) throw fromDbError(error);
  return data.map(toWorker);
}

export async function getWorker(id: string): Promise<Worker | null> {
  const { data, error } = await db.from("workers").select("*").eq("id", id).maybeSingle();
  if (error) throw fromDbError(error);
  return data ? toWorker(data) : null;
}

export async function createWorker(input: CreateWorkerInput): Promise<Worker> {
  const { data, error } = await db
    .from("workers")
    .insert(toRow(input) as TablesInsert<"workers">)
    .select("*")
    .single();
  if (error) throw fromDbError(error);
  return toWorker(data);
}

export async function updateWorker(id: string, input: UpdateWorkerInput): Promise<Worker | null> {
  const { data, error } = await db.from("workers").update(toRow(input)).eq("id", id).select("*").maybeSingle();
  if (error) throw fromDbError(error);
  return data ? toWorker(data) : null;
}
