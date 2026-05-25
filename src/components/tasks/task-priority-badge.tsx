"use client";

import { Badge } from "@/components/ui/badge";
import { TASK_PRIORITY, TASK_PRIORITY_COLOR } from "@/lib/constants";

export function TaskPriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge variant="outline" className={TASK_PRIORITY_COLOR[priority]}>
      {TASK_PRIORITY[priority as keyof typeof TASK_PRIORITY] ?? priority}
    </Badge>
  );
}
