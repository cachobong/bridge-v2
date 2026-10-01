import type { LinkAccountInput, Worker } from "@bridge/shared";
import { conflict, notFound } from "../../lib/errors.js";
import { createUser } from "../auth/index.js";
import { setUserRoles } from "../rbac/index.js";
import * as repo from "./repository.js";

async function requireWorker(id: string): Promise<Worker> {
  const worker = await repo.getWorker(id);
  if (!worker) throw notFound("Worker not found");
  return worker;
}

// Links a worker to an existing user, or creates a new user (role `employee`) from the worker's email and name.
export async function linkAccount(workerId: string, input: LinkAccountInput): Promise<Worker> {
  const worker = await requireWorker(workerId);
  if (worker.userId) throw conflict("This worker already has a login account");

  if (input.mode === "existing") {
    const linked = await repo.getWorkerByUserId(input.userId);
    if (linked) throw conflict("This user is already linked to another worker");
    return repo.setWorkerUser(workerId, input.userId);
  }

  const userId = await createUser({
    username: input.username,
    fullName: `${worker.firstName} ${worker.lastName}`,
    email: worker.email,
    password: input.password,
  });
  await setUserRoles(userId, ["employee"]);
  return repo.setWorkerUser(workerId, userId);
}

// Removes the link only. The user account stays.
export async function unlinkAccount(workerId: string): Promise<Worker> {
  await requireWorker(workerId);
  return repo.setWorkerUser(workerId, null);
}
