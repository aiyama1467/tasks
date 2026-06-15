"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import * as tasks from "@/usecases/tasks";

export async function createTask(data: {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  projectId?: string;
}) {
  const userId = await requireUserId();

  await tasks.createTask(userId, data);
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
  const userId = await requireUserId();

  await tasks.updateTask(userId, id, data);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
}

export async function updateTaskStatus(id: string, status: string) {
  const userId = await requireUserId();

  await tasks.updateTask(userId, id, { status });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTask(id: string) {
  const userId = await requireUserId();

  await tasks.deleteTask(userId, id);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}
