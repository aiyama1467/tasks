"use client";

import { CheckSquare, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteTask, updateTaskStatus } from "@/app/(app)/tasks/actions";
import type { SubtaskRow } from "@/app/(app)/tasks/subtask-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LabelBadge } from "@/components/ui/label-badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { TASK_PRIORITY, TASK_PRIORITY_COLOR } from "@/lib/constants";
import { TaskStatusSelect } from "./task-status-select";

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  projectId: string | null;
  project?: { name: string } | null;
  subtasks?: SubtaskRow[];
  subtaskCount?: { total: number; completed: number };
};

interface TaskRowProps {
  task: TaskRow;
  onEdit: (task: TaskRow) => void;
}

export function TaskRowComponent({ task, onEdit }: TaskRowProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string | null) => {
    if (!newStatus) return;
    startTransition(() => {
      updateTaskStatus(task.id, newStatus);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTask(task.id);
      toast.success("タスクを削除しました");
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Intl.DateTimeFormat("ja-JP", {
      month: "short",
      day: "numeric",
    }).format(new Date(dateStr));
  };

  const isOverdue =
    task.dueDate &&
    task.status !== "done" &&
    new Date(task.dueDate) < new Date(new Date().toDateString());

  return (
    <TableRow className={isPending ? "opacity-50" : ""}>
      <TableCell className="font-medium">
        <div>
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="text-left font-medium hover:underline focus:outline-none"
          >
            {task.title}
          </button>
          {task.project && (
            <span className="ml-2 text-xs text-muted-foreground">{task.project.name}</span>
          )}
          {task.subtaskCount && (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <CheckSquare className="h-3 w-3" />
              {task.subtaskCount.completed}/{task.subtaskCount.total}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <TaskStatusSelect
          value={task.status}
          onValueChange={handleStatusChange}
          triggerClassName="h-8 w-28"
        />
      </TableCell>
      <TableCell>
        <LabelBadge value={task.priority} labelMap={TASK_PRIORITY} colorMap={TASK_PRIORITY_COLOR} />
      </TableCell>
      <TableCell className={isOverdue ? "text-red-600 font-medium" : ""}>
        {formatDate(task.dueDate)}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Pencil className="mr-2 h-4 w-4" />
              編集
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
