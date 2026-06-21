"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ステータスのデフォルトは「未完了」(完了を除く)。パラメータ無しで表現する。
  const currentStatus = searchParams.get("status") ?? "active";
  const currentPriority = searchParams.get("priority") ?? "all";

  const updateFilter = (key: string, value: string | null, defaultValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex gap-3">
      <TaskStatusSelect
        value={currentStatus}
        onValueChange={(v) => updateFilter("status", v, "active")}
        filterMode
        placeholder="ステータス"
        triggerClassName="w-32"
      />

      <Select
        value={currentPriority}
        onValueChange={(v) => updateFilter("priority", v, "all")}
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
