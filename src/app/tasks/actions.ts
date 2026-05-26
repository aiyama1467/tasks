"use server";

import { eq } from "drizzle-orm";
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
  await db.insert(tasks).values({
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
  await db
    .update(tasks)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id));
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
}

export async function updateTaskStatus(id: string, status: string) {
  await db.update(tasks).set({ status, updatedAt: new Date() }).where(eq(tasks.id, id));
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTask(id: string) {
  await db.delete(tasks).where(eq(tasks.id, id));
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}
