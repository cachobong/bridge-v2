import { generatePeriodsSchema, listPeriodsQuerySchema, updatePeriodSchema } from "@bridge/shared";
import { Hono } from "hono";
import { z } from "zod";
import { notFound } from "../../lib/errors.js";
import type { AppEnv } from "../../lib/types.js";
import { validate } from "../../lib/validate.js";
import { requirePermission } from "../rbac/index.js";
import * as repo from "./repository.js";
import { generatePeriods } from "./service.js";

const idParam = z.object({ id: z.uuid() });

export const payrollRoutes = new Hono<AppEnv>()
  .get("/", requirePermission("payroll_periods:read"), validate("query", listPeriodsQuerySchema), async (c) =>
    c.json(await repo.listPeriods(c.req.valid("query").year)),
  )
  .post("/generate", requirePermission("payroll_periods:write"), validate("json", generatePeriodsSchema), async (c) =>
    c.json(await generatePeriods(c.req.valid("json")), 201),
  )
  .patch("/:id", requirePermission("payroll_periods:write"), validate("param", idParam), validate("json", updatePeriodSchema), async (c) => {
    const period = await repo.updatePeriodStatus(c.req.valid("param").id, c.req.valid("json").status);
    if (!period) throw notFound("Payroll period not found");
    return c.json(period);
  });
