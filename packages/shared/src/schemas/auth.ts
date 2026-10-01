import { z } from "zod";
import type { Permission, Role } from "../rbac.js";

export const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number | null;
}

export interface CurrentUser {
  id: string;
  username: string;
  fullName: string;
  roles: Role[];
  permissions: Permission[];
}
