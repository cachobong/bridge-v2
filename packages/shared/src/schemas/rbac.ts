import { z } from "zod";
import { ROLES, type Role } from "../rbac.js";

export const setUserRolesSchema = z.object({
  roles: z.array(z.enum(ROLES)),
});
export type SetUserRolesInput = z.infer<typeof setUserRolesSchema>;

export interface UserWithRoles {
  id: string;
  username: string;
  fullName: string;
  roles: Role[];
}

export interface RoleDefinition {
  key: Role;
  name: string;
  permissions: string[];
}
