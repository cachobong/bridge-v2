import { loginSchema } from "@bridge/shared";
import { Hono } from "hono";
import type { AppEnv } from "../../lib/types.js";
import { validate } from "../../lib/validate.js";
import { requireAuth } from "./middleware.js";
import { login } from "./service.js";

export const authRoutes = new Hono<AppEnv>()
  .post("/login", validate("json", loginSchema), async (c) => c.json(await login(c.req.valid("json"))))
  .get("/me", requireAuth, (c) => c.json(c.get("user")));
