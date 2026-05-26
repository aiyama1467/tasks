"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { projects } from "@/db/schema";

export async function createProject(data: {
  name: string;
  description?: string;
  status?: string;
  color?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await db.insert(projects).values({
    userId,
    name: data.name,
    description: data.description || null,
    status: data.status || "active",
    color: data.color || null,
  });
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function updateProject(
  id: string,
  data: {
    name?: string;
    description?: string;
    status?: string;
    color?: string;
  },
) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.userId, userId)));
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteProject(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)));
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}
