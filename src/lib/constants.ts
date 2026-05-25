export const TASK_STATUS = {
  todo: "未着手",
  in_progress: "進行中",
  done: "完了",
} as const;

export const TASK_PRIORITY = {
  low: "低",
  medium: "中",
  high: "高",
  urgent: "緊急",
} as const;

export const PROJECT_STATUS = {
  active: "進行中",
  completed: "完了",
  archived: "アーカイブ",
} as const;

export const BACKLOG_STATUS = {
  not_started: "未着手",
  in_progress: "進行中",
  completed: "完了",
} as const;

export const BACKLOG_PRIORITY = {
  low: "低",
  medium: "中",
  high: "高",
} as const;

export const TASK_STATUS_COLOR: Record<string, string> = {
  todo: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

export const TASK_PRIORITY_COLOR: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export const PROJECT_STATUS_COLOR: Record<string, string> = {
  active: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-600",
};

export const BACKLOG_STATUS_COLOR: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};
