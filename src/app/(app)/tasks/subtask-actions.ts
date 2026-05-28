"use server";

import { auth } from "@clerk/nextjs/server";
import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { subtasks } from "@/db/schema";

export type SubtaskRow = {
  id: string;
  title: string;
  completed: boolean;
  position: number;
};

export async function getSubtasks(taskId: string): Promise<SubtaskRow[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  const rows = await db.query.subtasks.findMany({
    where: and(eq(subtasks.taskId, taskId), eq(subtasks.userId, userId)),
    orderBy: [asc(subtasks.position), asc(subtasks.createdAt)],
    columns: { id: true, title: true, completed: true, position: true },
  });

  return rows;
}

export async function createSubtask(data: { taskId: string; title: string }): Promise<SubtaskRow> {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

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

  revalidatePath("/tasks");
  revalidatePath("/dashboard");

  return created;
}

export async function toggleSubtask(id: string, completed: boolean): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await db
    .update(subtasks)
    .set({ completed })
    .where(and(eq(subtasks.id, id), eq(subtasks.userId, userId)));
}

export async function deleteSubtask(id: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await db.delete(subtasks).where(and(eq(subtasks.id, id), eq(subtasks.userId, userId)));

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}
