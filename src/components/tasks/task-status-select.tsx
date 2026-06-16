"use client";

import { Circle, CircleCheck, CircleDotDashed, type LucideIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** 各ステータスのアイコンと色。見分けやすさのため色＋形の二重で区別する。 */
const STATUS_CONFIG: Record<string, { icon: LucideIcon; className: string }> = {
  todo: { icon: Circle, className: "text-gray-400" },
  in_progress: { icon: CircleDotDashed, className: "text-blue-600" },
  done: { icon: CircleCheck, className: "text-green-600" },
};

function StatusIcon({ status }: { status: string }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  const Icon = config.icon;
  return <Icon className={cn("size-4 shrink-0", config.className)} />;
}

interface TaskStatusSelectProps {
  /** 制御コンポーネントとして使う場合の値 */
  value?: string;
  onValueChange?: (value: string | null) => void;
  /** フォーム送信（非制御）として使う場合 */
  name?: string;
  defaultValue?: string;
  /** フィルタ用途：「未完了」「すべて」オプションを先頭に追加する */
  filterMode?: boolean;
  placeholder?: string;
  triggerClassName?: string;
}

export function TaskStatusSelect({
  value,
  onValueChange,
  name,
  defaultValue,
  filterMode = false,
  placeholder,
  triggerClassName,
}: TaskStatusSelectProps) {
  const items: Record<string, string> = filterMode
    ? { active: "未完了", all: "すべて", ...TASK_STATUS }
    : { ...TASK_STATUS };

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      name={name}
      defaultValue={defaultValue}
      items={items}
    >
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder}>
          {(selected: string) => (
            <span className="flex items-center gap-1.5">
              <StatusIcon status={selected} />
              {items[selected] ?? selected}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(items).map(([itemValue, label]) => (
          <SelectItem key={itemValue} value={itemValue}>
            <StatusIcon status={itemValue} />
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
