"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tasks } from "@/db/schema";

export async function createTask(data: {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  projectId?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await db.insert(tasks).values({
    userId,
    title: data.title,
    description: data.description || null,
    status: data.status || "todo",
    priority: data.priority || "medium",
    dueDate: data.dueDate || null,
    projectId: data.projectId || null,
  });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function updateTask(
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
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await db
    .update(tasks)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
}

export async function updateTaskStatus(id: string, status: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await db
    .update(tasks)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTask(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}
