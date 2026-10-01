import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./lib/env.js";
import { handleError } from "./lib/errors.js";
import type { AppEnv } from "./lib/types.js";
import { authRoutes, requireAuth } from "./modules/auth/index.js";
import { employeeRoutes } from "./modules/employees/index.js";
import { payrollRoutes } from "./modules/payroll/index.js";
import { rbacRoutes } from "./modules/rbac/index.js";

export function createApp() {
  const app = new Hono<AppEnv>().basePath("/api");

  app.use("*", logger());
  app.use("*", cors({ origin: env.WEB_ORIGIN, allowHeaders: ["Authorization", "Content-Type"] }));

  app.get("/health", (c) => c.json({ ok: true }));
  app.route("/auth", authRoutes);

  // Every module below requires a signed-in user.
  for (const path of ["/rbac", "/employees", "/payroll-periods"]) app.use(`${path}/*`, requireAuth);
  app.route("/rbac", rbacRoutes);
  app.route("/employees", employeeRoutes);
  app.route("/payroll-periods", payrollRoutes);

  app.notFound((c) => c.json({ error: { code: "not_found", message: "Route not found" } }, 404));
  app.onError(handleError);

  return app;
}
