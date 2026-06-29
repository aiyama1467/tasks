"use client";

import { EnumSelect } from "@/components/ui/enum-select";
import { BACKLOG_STATUS } from "@/lib/constants";

interface BacklogStatusSelectProps {
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

/** バックログのステータス Select。フィルタ時は「未完了/すべて」を先頭に追加する。 */
export function BacklogStatusSelect({ filterMode, ...props }: BacklogStatusSelectProps) {
  const map = filterMode ? { active: "未完了", all: "すべて", ...BACKLOG_STATUS } : BACKLOG_STATUS;
  return <EnumSelect map={map} {...props} />;
}
