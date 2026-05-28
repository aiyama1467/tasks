import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { subtasks } from "@/db/schema";

export type SubtaskRow = {
  id: string;
  title: string;
  completed: boolean;
  position: number;
};

export async function getSubtasks(userId: string, taskId: string): Promise<SubtaskRow[]> {
  return db.query.subtasks.findMany({
    where: and(eq(subtasks.taskId, taskId), eq(subtasks.userId, userId)),
    orderBy: [asc(subtasks.position), asc(subtasks.createdAt)],
    columns: { id: true, title: true, completed: true, position: true },
  });
}

export async function createSubtask(
  userId: string,
  data: { taskId: string; title: string },
): Promise<SubtaskRow> {
  const existing = await db.query.subtasks.findMany({
    where: and(eq(subtasks.taskId, data.taskId), eq(subtasks.userId, userId)),
    columns: { position: true },
  });
  const nextPosition = existing.length > 0 ? Math.max(...existing.map((s) => s.position)) + 1 : 0;

  const [created] = await db
    .insert(subtasks)
    .values({ taskId: data.taskId, userId, title: data.title, position: nextPosition })
    .returning({
      id: subtasks.id,
      title: subtasks.title,
      completed: subtasks.completed,
      position: subtasks.position,
    });

  return created;
}

export async function toggleSubtask(userId: string, id: string, completed: boolean): Promise<void> {
  await db
    .update(subtasks)
    .set({ completed })
    .where(and(eq(subtasks.id, id), eq(subtasks.userId, userId)));
}

export async function deleteSubtask(userId: string, id: string): Promise<void> {
  await db.delete(subtasks).where(and(eq(subtasks.id, id), eq(subtasks.userId, userId)));
}
