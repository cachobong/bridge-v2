import type { CreateWorkerInput, LinkAccountInput, UpdateWorkerInput, Worker, WorkerStatus, WorkerType } from "@bridge/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

export interface WorkerFilters {
  type?: WorkerType;
  status?: WorkerStatus;
  search?: string;
}

export function useWorkers(filters: WorkerFilters) {
  return useQuery({
    queryKey: ["employees", "list", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.type) params.set("type", filters.type);
      if (filters.status) params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);
      const qs = params.toString();
      return api<Worker[]>(`/employees${qs ? `?${qs}` : ""}`);
    },
  });
}

export function useWorker(id: string) {
  return useQuery({
    queryKey: ["employees", "detail", id],
    queryFn: () => api<Worker>(`/employees/${encodeURIComponent(id)}`),
  });
}

export function useCreateWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWorkerInput) => api<Worker>("/employees", { method: "POST", body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useUpdateWorker(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateWorkerInput) =>
      api<Worker>(`/employees/${encodeURIComponent(id)}`, { method: "PATCH", body: input }),
    onSuccess: (worker) => {
      queryClient.setQueryData(["employees", "detail", id], worker);
      return queryClient.invalidateQueries({ queryKey: ["employees", "list"] });
    },
  });
}

// The worker linked to the signed-in user. 404 when no worker is linked.
export function useMyWorker() {
  return useQuery({ queryKey: ["employees", "me"], queryFn: () => api<Worker>("/employees/me"), retry: false });
}

function useAccountMutation<TInput>(id: string, request: (input: TInput) => Promise<Worker>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSuccess: (worker) => {
      queryClient.setQueryData(["employees", "detail", id], worker);
      // A new login also changes the users list.
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["employees", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["rbac", "users"] }),
      ]);
    },
  });
}

export function useLinkAccount(id: string) {
  return useAccountMutation(id, (input: LinkAccountInput) =>
    api<Worker>(`/employees/${encodeURIComponent(id)}/account`, { method: "POST", body: input }),
  );
}

export function useUnlinkAccount(id: string) {
  return useAccountMutation(id, () => api<Worker>(`/employees/${encodeURIComponent(id)}/account`, { method: "DELETE" }));
}
