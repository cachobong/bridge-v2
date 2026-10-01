import { setUserRolesSchema } from "@bridge/shared";
import { Hono } from "hono";
import { badRequest, notFound } from "../../lib/errors.js";
import type { AppEnv } from "../../lib/types.js";
import { validate } from "../../lib/validate.js";
import { requirePermission } from "./middleware.js";
import * as repo from "./repository.js";

export const rbacRoutes = new Hono<AppEnv>()
  .get("/roles", requirePermission("rbac:read"), async (c) => c.json(await repo.listRoles()))
  .get("/users", requirePermission("rbac:read"), async (c) => c.json(await repo.listUsers()))
  .put("/users/:id/roles", requirePermission("rbac:write"), validate("json", setUserRolesSchema), async (c) => {
    const id = c.req.param("id");
    const { roles } = c.req.valid("json");
    if (id === c.get("user").id && !roles.includes("admin") && c.get("user").roles.includes("admin")) {
      throw badRequest("You cannot remove your own admin role");
    }
    if (!(await repo.getUser(id))) throw notFound("User not found");
    await repo.setUserRoles(id, [...new Set(roles)]);
    return c.json(await repo.getUser(id));
  });
