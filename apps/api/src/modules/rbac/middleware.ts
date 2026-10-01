import type { Permission } from "@bridge/shared";
import { createMiddleware } from "hono/factory";
import { forbidden } from "../../lib/errors.js";
import type { AppEnv } from "../../lib/types.js";

// Use after requireAuth. Rejects the request unless the user has every listed permission.
export const requirePermission = (...required: Permission[]) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const granted = c.get("user").permissions;
    const missing = required.filter((p) => !granted.includes(p));
    if (missing.length > 0) throw forbidden(`Missing permission: ${missing.join(", ")}`);
    await next();
  });
