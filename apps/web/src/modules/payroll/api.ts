import type { GeneratePeriodsInput, PayrollPeriod, PeriodStatus } from "@bridge/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

export function usePeriods(year: number) {
  return useQuery({
    queryKey: ["payroll-periods", year],
    queryFn: () => api<PayrollPeriod[]>(`/payroll-periods?year=${year}`),
  });
}

export function useGeneratePeriods() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GeneratePeriodsInput) =>
      api<{ created: PayrollPeriod[] }>("/payroll-periods/generate", { method: "POST", body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payroll-periods"] }),
  });
}

export function useUpdatePeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PeriodStatus }) =>
      api<PayrollPeriod>(`/payroll-periods/${encodeURIComponent(id)}`, { method: "PATCH", body: { status } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payroll-periods"] }),
  });
}
