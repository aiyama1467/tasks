"use client";

import { Badge } from "@/components/ui/badge";
import { TASK_STATUS, TASK_STATUS_COLOR } from "@/lib/constants";

export function TaskStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={TASK_STATUS_COLOR[status]}>
      {TASK_STATUS[status as keyof typeof TASK_STATUS] ?? status}
    </Badge>
  );
}
