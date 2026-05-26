"use client";

import { useState } from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TaskForm } from "./task-form";
import { type TaskRow, TaskRowComponent } from "./task-row";

interface TaskTableProps {
  tasks: TaskRow[];
  projects: { id: string; name: string }[];
}

export function TaskTable({ tasks, projects }: TaskTableProps) {
  const [editingTask, setEditingTask] = useState<TaskRow | null>(null);

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
                <TaskRowComponent key={task.id} task={task} onEdit={setEditingTask} />
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
      />
    </>
  );
}
