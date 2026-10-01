import type { Role, RoleDefinition, UserWithRoles } from "@bridge/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

export function useRoles() {
  return useQuery({ queryKey: ["rbac", "roles"], queryFn: () => api<RoleDefinition[]>("/rbac/roles") });
}

export function useUsers() {
  return useQuery({ queryKey: ["rbac", "users"], queryFn: () => api<UserWithRoles[]>("/rbac/users") });
}

export function useSetUserRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roles }: { userId: string; roles: Role[] }) =>
      api<UserWithRoles>(`/rbac/users/${encodeURIComponent(userId)}/roles`, { method: "PUT", body: { roles } }),
    onSuccess: (updated) =>
      queryClient.setQueryData<UserWithRoles[]>(["rbac", "users"], (users) =>
        users?.map((u) => (u.id === updated.id ? updated : u)),
      ),
  });
}
