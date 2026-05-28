"use client";

import { useState } from "react";
import type { SubtaskRow } from "@/app/(app)/tasks/subtask-actions";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TaskForm } from "./task-form";
import { type TaskRow, TaskRowComponent } from "./task-row";

interface TaskTableProps {
  tasks: TaskRow[];
  projects: { id: string; name: string }[];
}

export function TaskTable({ tasks, projects }: TaskTableProps) {
  const [editingTask, setEditingTask] = useState<TaskRow | null>(null);
  const [subtasksMap, setSubtasksMap] = useState<Record<string, SubtaskRow[]>>(() =>
    Object.fromEntries(tasks.map((t) => [t.id, t.subtasks ?? []])),
  );

  const handleSubtasksChange = (taskId: string, updated: SubtaskRow[]) => {
    setSubtasksMap((prev) => ({ ...prev, [taskId]: updated }));
  };

  const getSubtaskCount = (taskId: string) => {
    const list = subtasksMap[taskId];
    if (!list || list.length === 0) return undefined;
    return { total: list.length, completed: list.filter((s) => s.completed).length };
  };

  return (
    <>
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">タスクがありません</p>
          <p className="mt-1 text-sm text-muted-foreground">
            「新規タスク」ボタンからタスクを追加しましょう
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">タスク名</TableHead>
                <TableHead className="w-[15%]">ステータス</TableHead>
                <TableHead className="w-[15%]">優先度</TableHead>
                <TableHead className="w-[15%]">期限</TableHead>
                <TableHead className="w-[15%]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TaskRowComponent
                  key={task.id}
                  task={{ ...task, subtaskCount: getSubtaskCount(task.id) }}
                  onEdit={setEditingTask}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TaskForm
        open={editingTask !== null}
        onOpenChange={(open) => {
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
        projects={projects}
        initialSubtasks={editingTask ? (subtasksMap[editingTask.id] ?? []) : undefined}
        onSubtasksChange={handleSubtasksChange}
      />
    </>
  );
}
