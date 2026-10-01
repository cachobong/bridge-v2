import type { Worker } from "@bridge/shared";
import { Badge } from "../../lib/ui";

export function WorkerTypeBadge({ type }: { type: Worker["workerType"] }) {
  return type === "employee" ? <Badge tone="blue">Employee</Badge> : <Badge tone="amber">Contractor</Badge>;
}

export function WorkerStatusBadge({ status }: { status: Worker["status"] }) {
  return status === "active" ? <Badge tone="green">Active</Badge> : <Badge>Inactive</Badge>;
}
