import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, tasks } from "@/db/schema";

export async function getProjects(userId: string) {
  return db.query.projects.findMany({
    where: eq(projects.userId, userId),
    orderBy: (projects, { desc }) => [desc(projects.createdAt)],
  });
}

export async function getActiveProjects(userId: string) {
  return db.query.projects.findMany({
    where: and(eq(projects.userId, userId), eq(projects.status, "active")),
    columns: { id: true, name: true },
  });
}

export async function getProjectById(userId: string, id: string) {
  return db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.userId, userId)),
  });
}

export async function getProjectTaskStats(userId: string, projectId: string) {
  const [taskCountResult] = await db
    .select({ value: count() })
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.projectId, projectId)));

  const [doneCountResult] = await db
    .select({ value: count() })
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.projectId, projectId), eq(tasks.status, "done")));

  return { taskCount: taskCountResult.value, doneCount: doneCountResult.value };
}

export async function createProject(
  userId: string,
  data: { name: string; description?: string; status?: string; color?: string },
) {
  const [created] = await db
    .insert(projects)
    .values({
      userId,
      name: data.name,
      description: data.description || null,
      status: data.status || "active",
      color: data.color || null,
    })
    .returning({ id: projects.id });
  return created;
}

export async function updateProject(
  userId: string,
  id: string,
  data: { name?: string; description?: string; status?: string; color?: string },
) {
  await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.userId, userId)));
}

export async function deleteProject(userId: string, id: string) {
  await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)));
}
