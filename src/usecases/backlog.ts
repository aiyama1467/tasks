import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { backlogItems } from "@/db/schema";

export async function getCategories() {
  return db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.position)],
  });
}

export async function getBacklogItems(userId: string) {
  return db.query.backlogItems.findMany({
    where: eq(backlogItems.userId, userId),
    orderBy: (backlogItems, { desc }) => [desc(backlogItems.createdAt)],
  });
}

export async function getInProgressBacklogItems(userId: string) {
  return db.query.backlogItems.findMany({
    where: and(eq(backlogItems.userId, userId), eq(backlogItems.status, "in_progress")),
    with: { category: true },
    orderBy: (backlogItems, { desc }) => [desc(backlogItems.updatedAt)],
  });
}

export async function createBacklogItem(
  userId: string,
  data: {
    title: string;
    description?: string;
    categoryId: string;
    status?: string;
    priority?: string;
    url?: string;
  },
) {
  const now = new Date().toISOString().split("T")[0];
  const status = data.status || "not_started";

  await db.insert(backlogItems).values({
    userId,
    title: data.title,
    description: data.description || null,
    categoryId: data.categoryId,
    status,
    priority: data.priority || "medium",
    url: data.url || null,
    startedAt: status === "in_progress" ? now : null,
    completedAt: status === "completed" ? now : null,
  });
}

export async function updateBacklogItem(
  userId: string,
  id: string,
  data: {
    title?: string;
    description?: string;
    categoryId?: string;
    status?: string;
    priority?: string;
    rating?: number | null;
    url?: string | null;
  },
) {
  const existing = await db.query.backlogItems.findFirst({
    where: and(eq(backlogItems.id, id), eq(backlogItems.userId, userId)),
  });
  if (!existing) return;

  const now = new Date().toISOString().split("T")[0];
  const updates: Record<string, unknown> = { ...data, updatedAt: new Date() };

  if (data.status && data.status !== existing.status) {
    if (data.status === "in_progress" && !existing.startedAt) {
      updates.startedAt = now;
    }
    if (data.status === "completed") {
      updates.completedAt = now;
      if (!existing.startedAt) updates.startedAt = now;
    }
    if (data.status === "not_started") {
      updates.startedAt = null;
      updates.completedAt = null;
    }
  }

  await db
    .update(backlogItems)
    .set(updates)
    .where(and(eq(backlogItems.id, id), eq(backlogItems.userId, userId)));
}

export async function deleteBacklogItem(userId: string, id: string) {
  await db
    .delete(backlogItems)
    .where(and(eq(backlogItems.id, id), eq(backlogItems.userId, userId)));
}
