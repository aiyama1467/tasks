"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_PRIORITY } from "@/lib/constants";
import { TaskStatusSelect } from "./task-status-select";

export function TaskFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? "all";
  const currentPriority = searchParams.get("priority") ?? "all";

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/tasks?${params.toString()}`);
  };

  return (
    <div className="flex gap-3">
      <TaskStatusSelect
        value={currentStatus}
        onValueChange={(v) => updateFilter("status", v)}
        includeAll
        placeholder="ステータス"
        triggerClassName="w-32"
      />

      <Select
        value={currentPriority}
        onValueChange={(v) => updateFilter("priority", v)}
        items={{ all: "すべて", ...TASK_PRIORITY }}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="優先度" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべて</SelectItem>
          {Object.entries(TASK_PRIORITY).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
