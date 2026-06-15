"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import * as subtasks from "@/usecases/subtasks";

export type { SubtaskRow } from "@/usecases/subtasks";

export async function getSubtasks(taskId: string) {
  const userId = await requireUserId();

  return subtasks.getSubtasks(userId, taskId);
}

export async function createSubtask(data: { taskId: string; title: string }) {
  const userId = await requireUserId();

  const created = await subtasks.createSubtask(userId, data);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return created;
}

export async function toggleSubtask(id: string, completed: boolean): Promise<void> {
  const userId = await requireUserId();

  await subtasks.toggleSubtask(userId, id, completed);
}

export async function updateSubtask(id: string, title: string): Promise<void> {
  const userId = await requireUserId();

  await subtasks.updateSubtask(userId, id, title);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteSubtask(id: string): Promise<void> {
  const userId = await requireUserId();

  await subtasks.deleteSubtask(userId, id);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}
