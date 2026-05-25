"use server";

import { db } from "@/db";
import { backlogItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createBacklogItem(data: {
  title: string;
  description?: string;
  categoryId: string;
  status?: string;
  priority?: string;
  url?: string;
}) {
  const now = new Date().toISOString().split("T")[0];
  const status = data.status || "not_started";

  await db.insert(backlogItems).values({
    title: data.title,
    description: data.description || null,
    categoryId: data.categoryId,
    status,
    priority: data.priority || "medium",
    url: data.url || null,
    startedAt: status === "in_progress" ? now : null,
    completedAt: status === "completed" ? now : null,
  });
  revalidatePath("/backlog");
  revalidatePath("/dashboard");
}

export async function updateBacklogItem(
  id: string,
  data: {
    title?: string;
    description?: string;
    categoryId?: string;
    status?: string;
    priority?: string;
    rating?: number | null;
    url?: string | null;
  }
) {
  const existing = await db.query.backlogItems.findFirst({
    where: eq(backlogItems.id, id),
  });
  if (!existing) return;

  const now = new Date().toISOString().split("T")[0];
  const updates: Record<string, unknown> = {
    ...data,
    updatedAt: new Date(),
  };

  if (data.status && data.status !== existing.status) {
    if (data.status === "in_progress" && !existing.startedAt) {
      updates.startedAt = now;
    }
    if (data.status === "completed") {
      updates.completedAt = now;
      if (!existing.startedAt) {
        updates.startedAt = now;
      }
    }
    if (data.status === "not_started") {
      updates.startedAt = null;
      updates.completedAt = null;
    }
  }

  await db.update(backlogItems).set(updates).where(eq(backlogItems.id, id));
  revalidatePath("/backlog");
  revalidatePath("/dashboard");
}

export async function updateBacklogItemStatus(id: string, status: string) {
  await updateBacklogItem(id, { status });
}

export async function deleteBacklogItem(id: string) {
  await db.delete(backlogItems).where(eq(backlogItems.id, id));
  revalidatePath("/backlog");
  revalidatePath("/dashboard");
}
