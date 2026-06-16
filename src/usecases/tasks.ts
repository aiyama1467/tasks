import { and, asc, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";

export async function getTasks(userId: string, filters?: { status?: string; priority?: string }) {
  const conditions = [eq(tasks.userId, userId)];
  // status 未指定/"active" は完了を除いた未完了タスクを表示する。"all" は全件。
  if (!filters?.status || filters.status === "active") {
    conditions.push(ne(tasks.status, "done"));
  } else if (filters.status !== "all") {
    conditions.push(eq(tasks.status, filters.status));
  }
  if (filters?.priority && filters.priority !== "all") {
    conditions.push(eq(tasks.priority, filters.priority));
  }

  return db.query.tasks.findMany({
    where: and(...conditions),
    with: {
      project: { columns: { name: true } },
      subtasks: { columns: { id: true, title: true, completed: true, position: true } },
    },
    orderBy: [asc(tasks.status), desc(tasks.createdAt)],
  });
}

export async function getTasksByProject(userId: string, projectId: string) {
  return db.query.tasks.findMany({
    where: and(eq(tasks.userId, userId), eq(tasks.projectId, projectId)),
    with: {
      project: { columns: { name: true } },
      subtasks: { columns: { id: true, title: true, completed: true, position: true } },
    },
    orderBy: (tasks, { asc, desc }) => [asc(tasks.status), desc(tasks.createdAt)],
  });
}

type TaskRow = Awaited<ReturnType<typeof getTasks>>[number];

export function mapTaskRow(t: TaskRow) {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    projectId: t.projectId,
    project: t.project ? { name: t.project.name } : null,
    subtasks: t.subtasks.toSorted((a, b) => a.position - b.position),
    subtaskCount:
      t.subtasks.length > 0
        ? {
            total: t.subtasks.length,
            completed: t.subtasks.filter((s) => s.completed).length,
          }
        : undefined,
  };
}

export async function createTask(
  userId: string,
  data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    projectId?: string;
  },
) {
  await db.insert(tasks).values({
    userId,
    title: data.title,
    description: data.description || null,
    status: data.status || "todo",
    priority: data.priority || "medium",
    dueDate: data.dueDate || null,
    projectId: data.projectId || null,
  });
}

export async function updateTask(
  userId: string,
  id: string,
  data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string | null;
    projectId?: string | null;
  },
) {
  await db
    .update(tasks)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
}

export async function deleteTask(userId: string, id: string) {
  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
}
