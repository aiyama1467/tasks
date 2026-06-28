"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import * as feeds from "@/usecases/feeds";

export async function addFeedSource(data: { name: string; url: string; sourceType?: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await feeds.createFeedSource(userId, data);
  revalidatePath("/feeds");
}

export async function updateFeedSource(
  id: string,
  data: { name?: string; url?: string; sourceType?: string; enabled?: boolean },
) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await feeds.updateFeedSource(userId, id, data);
  revalidatePath("/feeds");
}

export async function deleteFeedSource(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await feeds.deleteFeedSource(userId, id);
  revalidatePath("/feeds");
  revalidatePath("/dashboard");
}

export async function refreshFeeds(sourceId?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  if (sourceId) {
    await feeds.refreshFeedSource(userId, sourceId);
  } else {
    await feeds.refreshAllFeeds(userId);
  }
  revalidatePath("/feeds");
  revalidatePath("/dashboard");
}

export async function markItemRead(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await feeds.markFeedItemRead(userId, id);
  revalidatePath("/feeds");
  revalidatePath("/dashboard");
}

export async function markAllItemsRead(sourceId?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await feeds.markAllRead(userId, sourceId);
  revalidatePath("/feeds");
  revalidatePath("/dashboard");
}

export async function toggleItemSaved(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await feeds.toggleSaved(userId, id);
  revalidatePath("/feeds");
}

export async function convertItemToTask(
  feedItemId: string,
  taskData: {
    title: string;
    description?: string;
    priority?: string;
    projectId?: string;
    dueDate?: string;
  },
) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await feeds.convertToTask(userId, feedItemId, taskData);
  revalidatePath("/feeds");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function convertItemToBacklogItem(
  feedItemId: string,
  backlogData: {
    title: string;
    description?: string;
    categoryId: string;
    priority?: string;
    url?: string;
  },
) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await feeds.convertToBacklogItem(userId, feedItemId, backlogData);
  revalidatePath("/feeds");
  revalidatePath("/backlog");
  revalidatePath("/dashboard");
}

export async function deleteOldItems(olderThanDays: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await feeds.deleteOldFeedItems(userId, olderThanDays);
  revalidatePath("/feeds");
}
