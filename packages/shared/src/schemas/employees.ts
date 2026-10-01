import { z } from "zod";

export const WORKER_TYPES = ["employee", "contractor"] as const;
export type WorkerType = (typeof WORKER_TYPES)[number];

export const WORKER_STATUSES = ["active", "inactive"] as const;
export type WorkerStatus = (typeof WORKER_STATUSES)[number];

const isoDate = z.iso.date();

const baseFields = {
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.email(),
  jobTitle: z.string().trim().min(1),
  department: z.string().trim().min(1).nullable().optional(),
  startDate: isoDate,
  status: z.enum(WORKER_STATUSES),
};

// Normal employees are paid a monthly salary.
const employeeFields = z.object({
  ...baseFields,
  workerType: z.literal("employee"),
  monthlySalary: z.number().nonnegative(),
});

// Contractors are paid an hourly rate under a contract.
const contractorFields = z.object({
  ...baseFields,
  workerType: z.literal("contractor"),
  companyName: z.string().trim().min(1).nullable().optional(),
  hourlyRate: z.number().nonnegative(),
  contractEndDate: isoDate.nullable().optional(),
});

// `status` defaults to active on create only. A default on the update schema would reactivate workers.
const withDefaultStatus = { status: z.enum(WORKER_STATUSES).default("active") };

export const createWorkerSchema = z.discriminatedUnion("workerType", [
  employeeFields.extend(withDefaultStatus),
  contractorFields.extend(withDefaultStatus),
]);
export type CreateWorkerInput = z.infer<typeof createWorkerSchema>;

export const updateWorkerSchema = z.discriminatedUnion("workerType", [
  employeeFields.partial().required({ workerType: true }),
  contractorFields.partial().required({ workerType: true }),
]);
export type UpdateWorkerInput = z.infer<typeof updateWorkerSchema>;

export const listWorkersQuerySchema = z.object({
  type: z.enum(WORKER_TYPES).optional(),
  status: z.enum(WORKER_STATUSES).optional(),
  search: z.string().trim().optional(),
});
export type ListWorkersQuery = z.infer<typeof listWorkersQuerySchema>;

export interface Worker {
  id: string;
  workerType: WorkerType;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string | null;
  startDate: string;
  status: WorkerStatus;
  monthlySalary: number | null;
  companyName: string | null;
  hourlyRate: number | null;
  contractEndDate: string | null;
  // Linked login account, if any.
  userId: string | null;
  username: string | null;
  createdAt: string;
  updatedAt: string;
}

// Link a worker to a login: an existing user, or a new user made from the worker's email and name.
export const linkAccountSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("existing"), userId: z.uuid() }),
  z.object({
    mode: z.literal("new"),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9._-]{2,32}$/, "2-32 characters: a-z, 0-9, dot, underscore, hyphen"),
    password: z.string().min(8),
  }),
]);
export type LinkAccountInput = z.infer<typeof linkAccountSchema>;
