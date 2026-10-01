import type { LinkAccountInput, UpdateWorkerInput, Worker } from "@bridge/shared";
import { badRequest, conflict, notFound } from "../../lib/errors.js";
import { createUser, setLoginBlocked } from "../auth/index.js";
import { setUserRoles } from "../rbac/index.js";
import * as repo from "./repository.js";

async function requireWorker(id: string): Promise<Worker> {
  const worker = await repo.getWorker(id);
  if (!worker) throw notFound("Worker not found");
  return worker;
}

// An inactive worker cannot log in. Changing the status blocks or unblocks the linked user.
export async function updateWorker(id: string, input: UpdateWorkerInput, actorId: string): Promise<Worker> {
  const before = await requireWorker(id);
  if (input.status === "inactive" && before.userId === actorId) {
    throw badRequest("You cannot deactivate your own worker record");
  }
  const worker = await repo.updateWorker(id, input);
  if (!worker) throw notFound("Worker not found");
  if (worker.userId && worker.status !== before.status) {
    await setLoginBlocked(worker.userId, worker.status === "inactive");
  }
  return worker;
}

// Links a worker to an existing user, or creates a new user (role `employee`) from the worker's email and name.
export async function linkAccount(workerId: string, input: LinkAccountInput): Promise<Worker> {
  const worker = await requireWorker(workerId);
  if (worker.userId) throw conflict("This worker already has a login account");

  if (input.mode === "existing") {
    const linked = await repo.getWorkerByUserId(input.userId);
    if (linked) throw conflict("This user is already linked to another worker");
    if (worker.status === "inactive") await setLoginBlocked(input.userId, true);
    return repo.setWorkerUser(workerId, input.userId);
  }

  const userId = await createUser({
    username: input.username,
    fullName: `${worker.firstName} ${worker.lastName}`,
    email: worker.email,
    password: input.password,
  });
  await setUserRoles(userId, ["employee"]);
  if (worker.status === "inactive") await setLoginBlocked(userId, true);
  return repo.setWorkerUser(workerId, userId);
}

// Removes the link only. The user account stays, and an inactive worker's block is removed.
export async function unlinkAccount(workerId: string): Promise<Worker> {
  const worker = await requireWorker(workerId);
  if (worker.userId && worker.status === "inactive") await setLoginBlocked(worker.userId, false);
  return repo.setWorkerUser(workerId, null);
}
