"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TaskPrioritySelect } from "./task-priority-select";
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

      <TaskPrioritySelect
        filterMode
        value={currentPriority}
        onValueChange={(v) => updateFilter("priority", v, "all")}
        placeholder="優先度"
        triggerClassName="w-32"
      />
    </div>
  );
}
