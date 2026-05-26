"use client";

import { AlertTriangle, CheckSquare, Square } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { updateTaskStatus } from "@/app/tasks/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TASK_PRIORITY, TASK_PRIORITY_COLOR } from "@/lib/constants";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  projectName: string | null;
}

interface TodayTasksProps {
  todayTasks: Task[];
  overdueTasks: Task[];
}

function TaskItem({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition();
  const isDone = task.status === "done";

  const toggleDone = () => {
    startTransition(() => {
      updateTaskStatus(task.id, isDone ? "todo" : "done");
    });
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/50 ${isPending ? "opacity-50" : ""}`}
    >
      <button type="button" onClick={toggleDone} className="shrink-0">
        {isDone ? (
          <CheckSquare className="h-4 w-4 text-green-600" />
        ) : (
          <Square className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      <span className={`flex-1 text-sm ${isDone ? "text-muted-foreground line-through" : ""}`}>
        {task.title}
      </span>
      {task.projectName && (
        <span className="text-xs text-muted-foreground">{task.projectName}</span>
      )}
      <Badge variant="outline" className={`text-xs ${TASK_PRIORITY_COLOR[task.priority]}`}>
        {TASK_PRIORITY[task.priority as keyof typeof TASK_PRIORITY]}
      </Badge>
    </div>
  );
}

export function TodayTasks({ todayTasks, overdueTasks }: TodayTasksProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">今日のタスク</CardTitle>
        <Link href="/tasks" className="text-sm text-muted-foreground hover:text-foreground">
          すべて表示
        </Link>
      </CardHeader>
      <CardContent className="space-y-1">
        {overdueTasks.length > 0 && (
          <div className="mb-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-red-600">
              <AlertTriangle className="h-3 w-3" />
              期限切れ
            </div>
            {overdueTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
        {todayTasks.length > 0 ? (
          todayTasks.map((task) => <TaskItem key={task.id} task={task} />)
        ) : overdueTasks.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">今日のタスクはありません</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
