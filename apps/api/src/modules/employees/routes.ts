import { createWorkerSchema, listWorkersQuerySchema, updateWorkerSchema } from "@bridge/shared";
import { Hono } from "hono";
import { z } from "zod";
import { notFound } from "../../lib/errors.js";
import type { AppEnv } from "../../lib/types.js";
import { validate } from "../../lib/validate.js";
import { requirePermission } from "../rbac/index.js";
import * as repo from "./repository.js";

const idParam = z.object({ id: z.uuid() });

export const employeeRoutes = new Hono<AppEnv>()
  .get("/", requirePermission("employees:read"), validate("query", listWorkersQuerySchema), async (c) =>
    c.json(await repo.listWorkers(c.req.valid("query"))),
  )
  .get("/:id", requirePermission("employees:read"), validate("param", idParam), async (c) => {
    const worker = await repo.getWorker(c.req.valid("param").id);
    if (!worker) throw notFound("Worker not found");
    return c.json(worker);
  })
  .post("/", requirePermission("employees:write"), validate("json", createWorkerSchema), async (c) =>
    c.json(await repo.createWorker(c.req.valid("json")), 201),
  )
  .patch("/:id", requirePermission("employees:write"), validate("param", idParam), validate("json", updateWorkerSchema), async (c) => {
    const worker = await repo.updateWorker(c.req.valid("param").id, c.req.valid("json"));
    if (!worker) throw notFound("Worker not found");
    return c.json(worker);
  });
