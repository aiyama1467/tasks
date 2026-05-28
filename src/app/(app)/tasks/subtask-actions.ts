"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import * as subtasks from "@/usecases/subtasks";

export type { SubtaskRow } from "@/usecases/subtasks";

export async function getSubtasks(taskId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  return subtasks.getSubtasks(userId, taskId);
}

export async function createSubtask(data: { taskId: string; title: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  const created = await subtasks.createSubtask(userId, data);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return created;
}

export async function toggleSubtask(id: string, completed: boolean): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await subtasks.toggleSubtask(userId, id, completed);
}

export async function deleteSubtask(id: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await subtasks.deleteSubtask(userId, id);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}
