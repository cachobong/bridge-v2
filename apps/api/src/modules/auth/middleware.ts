import { createMiddleware } from "hono/factory";
import { unauthorized } from "../../lib/errors.js";
import type { AppEnv } from "../../lib/types.js";
import { authenticate } from "./service.js";

// Verifies the Bearer token and sets c.get("user") with roles and permissions.
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) throw unauthorized();
  c.set("user", await authenticate(token));
  await next();
});
