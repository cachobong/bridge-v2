import type { CreateWorkerInput, UpdateWorkerInput, Worker, WorkerStatus, WorkerType } from "@bridge/shared";
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
