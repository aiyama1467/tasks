"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteTask, updateTaskStatus } from "@/app/(app)/tasks/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { TASK_STATUS } from "@/lib/constants";
import { TaskPriorityBadge } from "./task-priority-badge";

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  projectId: string | null;
  project?: { name: string } | null;
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
          <span>{task.title}</span>
          {task.project && (
            <span className="ml-2 text-xs text-muted-foreground">{task.project.name}</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Select value={task.status} onValueChange={handleStatusChange} items={TASK_STATUS}>
          <SelectTrigger className="h-8 w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TASK_STATUS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <TaskPriorityBadge priority={task.priority} />
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
