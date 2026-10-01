// Public API of the rbac module. Other modules import only from this file.
export { requirePermission } from "./middleware.js";
export { getUserAccess, setUserRoles } from "./repository.js";
export { rbacRoutes } from "./routes.js";
