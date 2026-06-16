export type LabelOption = { label: string; color?: string };

/** ラベルと色を1つにまとめた定義。Select 用のラベルマップは `labels()` で導出する。 */
function labels<T extends Record<string, LabelOption>>(options: T): Record<keyof T, string> {
  return Object.fromEntries(
    Object.entries(options).map(([value, { label }]) => [value, label]),
  ) as Record<keyof T, string>;
}

export const TASK_STATUS_OPTIONS = {
  todo: { label: "未着手", color: "bg-gray-100 text-gray-700" },
  in_progress: { label: "進行中", color: "bg-blue-100 text-blue-700" },
  done: { label: "完了", color: "bg-green-100 text-green-700" },
} as const satisfies Record<string, LabelOption>;

export const TASK_PRIORITY_OPTIONS = {
  low: { label: "低", color: "bg-gray-100 text-gray-600" },
  medium: { label: "中", color: "bg-yellow-100 text-yellow-700" },
  high: { label: "高", color: "bg-orange-100 text-orange-700" },
  urgent: { label: "緊急", color: "bg-red-100 text-red-700" },
} as const satisfies Record<string, LabelOption>;

export const PROJECT_STATUS_OPTIONS = {
  active: { label: "進行中", color: "bg-blue-100 text-blue-700" },
  completed: { label: "完了", color: "bg-green-100 text-green-700" },
  archived: { label: "アーカイブ", color: "bg-gray-100 text-gray-600" },
} as const satisfies Record<string, LabelOption>;

export const BACKLOG_STATUS_OPTIONS = {
  not_started: { label: "未着手", color: "bg-gray-100 text-gray-700" },
  in_progress: { label: "進行中", color: "bg-blue-100 text-blue-700" },
  completed: { label: "完了", color: "bg-green-100 text-green-700" },
} as const satisfies Record<string, LabelOption>;

export const BACKLOG_PRIORITY_OPTIONS = {
  low: { label: "低" },
  medium: { label: "中" },
  high: { label: "高" },
} as const satisfies Record<string, LabelOption>;

export const TASK_STATUS = labels(TASK_STATUS_OPTIONS);
export const TASK_PRIORITY = labels(TASK_PRIORITY_OPTIONS);
export const PROJECT_STATUS = labels(PROJECT_STATUS_OPTIONS);
export const BACKLOG_STATUS = labels(BACKLOG_STATUS_OPTIONS);
export const BACKLOG_PRIORITY = labels(BACKLOG_PRIORITY_OPTIONS);
