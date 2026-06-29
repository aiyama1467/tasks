"use client";

import { EnumSelect } from "@/components/ui/enum-select";
import { TASK_PRIORITY } from "@/lib/constants";

interface TaskPrioritySelectProps {
  /** 制御コンポーネントとして使う場合の値 */
  value?: string;
  onValueChange?: (value: string | null) => void;
  /** フォーム送信（非制御）として使う場合 */
  name?: string;
  defaultValue?: string;
  /** フィルタ用途：「すべて」オプションを先頭に追加する */
  filterMode?: boolean;
  placeholder?: string;
  triggerClassName?: string;
}

/** タスク優先度の Select。`TaskStatusSelect` と対になる薄いラッパー。 */
export function TaskPrioritySelect({ filterMode, ...props }: TaskPrioritySelectProps) {
  return <EnumSelect map={TASK_PRIORITY} includeAll={filterMode} {...props} />;
}
