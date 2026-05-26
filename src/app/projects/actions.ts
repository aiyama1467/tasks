"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { projects } from "@/db/schema";

export async function createProject(data: {
  name: string;
  description?: string;
  status?: string;
  color?: string;
}) {
  await db.insert(projects).values({
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
  await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, id));
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteProject(id: string) {
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}
