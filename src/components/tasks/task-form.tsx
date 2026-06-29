"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { createTask, updateTask } from "@/app/(app)/tasks/actions";
import type { SubtaskRow } from "@/app/(app)/tasks/subtask-actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EnumSelect } from "@/components/ui/enum-select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { SubtaskPanel } from "./subtask-panel";
import { TaskPrioritySelect } from "./task-priority-select";
import type { TaskRow } from "./task-row";
import { TaskStatusSelect } from "./task-status-select";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskRow | null;
  projects: { id: string; name: string }[];
  initialSubtasks?: SubtaskRow[];
  onSubtasksChange?: (taskId: string, updated: SubtaskRow[]) => void;
}

export function TaskForm({
  open,
  onOpenChange,
  task,
  projects,
  initialSubtasks,
  onSubtasksChange,
}: TaskFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!task?.id;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const rawProjectId = formData.get("projectId") as string;
    const data = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      status: formData.get("status") as string,
      priority: formData.get("priority") as string,
      dueDate: (formData.get("dueDate") as string) || undefined,
      projectId: rawProjectId && rawProjectId !== "none" ? rawProjectId : undefined,
    };

    startTransition(async () => {
      if (isEditing) {
        await updateTask(task.id, {
          ...data,
          dueDate: data.dueDate || null,
          projectId: data.projectId || null,
        });
      } else {
        await createTask(data);
      }
      toast.success(isEditing ? "タスクを更新しました" : "タスクを作成しました");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "タスクを編集" : "新規タスク"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              タスク名 <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={task?.title ?? ""}
              placeholder="タスク名を入力"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              詳細
            </label>
            <Textarea
              id="description"
              name="description"
              defaultValue={task?.description ?? ""}
              placeholder="詳細を入力（任意）"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                ステータス
              </label>
              <TaskStatusSelect name="status" defaultValue={task?.status ?? "todo"} />
            </div>

            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                優先度
              </label>
              <TaskPrioritySelect name="priority" defaultValue={task?.priority ?? "medium"} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="dueDate" className="text-sm font-medium">
                期限
              </label>
              <Input id="dueDate" name="dueDate" type="date" defaultValue={task?.dueDate ?? ""} />
            </div>

            <div className="space-y-2">
              <label htmlFor="projectId" className="text-sm font-medium">
                プロジェクト
              </label>
              <EnumSelect
                name="projectId"
                defaultValue={task?.projectId ?? "none"}
                map={{ none: "なし", ...Object.fromEntries(projects.map((p) => [p.id, p.name])) }}
              />
            </div>
          </div>

          {isEditing && task?.id && (
            <>
              <Separator />
              <SubtaskPanel
                taskId={task.id}
                initialSubtasks={initialSubtasks}
                onSubtasksChange={(updated) => onSubtasksChange?.(task.id, updated)}
              />
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "保存中..." : isEditing ? "更新" : "作成"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
