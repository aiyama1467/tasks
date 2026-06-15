"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import * as projects from "@/usecases/projects";

export async function createProject(data: {
  name: string;
  description?: string;
  status?: string;
  color?: string;
}) {
  const userId = await requireUserId();

  await projects.createProject(userId, data);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function updateProject(
  id: string,
  data: { name?: string; description?: string; status?: string; color?: string },
) {
  const userId = await requireUserId();

  await projects.updateProject(userId, id, data);
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteProject(id: string) {
  const userId = await requireUserId();

  await projects.deleteProject(userId, id);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}
